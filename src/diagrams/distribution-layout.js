/**
 * Calibrated IA plot geometry shared by desktop/mobile preview and SVG/PNG.
 * A custom discrete axis uses REAL numerical spacing, never evenly-spaced
 * categories; Poisson shows a finite plotted range but calculates full tails.
 */
import {analyzeDistribution} from "./distribution-core.js";
export const DISTRIBUTION_SIZES=Object.freeze({
 compact:Object.freeze({width:640,height:370}),
 standard:Object.freeze({width:860,height:420}),
 wide:Object.freeze({width:1080,height:440})
});
export const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const finite=v=>Number.isFinite(v)?v:0;
const continuous=kind=>kind==="normal"||kind==="uniform";
const countModel=kind=>kind==="binomial"||kind==="poisson";
export function formatPlotNumber(value,step=1){
 if(!Number.isFinite(value))return "";
 if(Math.abs(value)<Math.max(1e-14,Math.abs(step)*1e-8))return "0";
 const digits=clamp(Math.ceil(-Math.log10(Math.max(1e-14,Math.abs(step))))+1,0,12);
 const result=Number(value.toFixed(digits));
 return Number.isFinite(result)?String(result):value.toPrecision(8);
}
export function nicePlotStep(target){
 if(!Number.isFinite(target)||target<=0)return 1;
 const scale=10**Math.floor(Math.log10(target)),fraction=target/scale;
 return ([1,2,2.5,5,10].find(v=>v>=fraction-1e-12)||10)*scale;
}
function yScale(peak){
 const step=nicePlotStep(Math.max(peak,1e-18)/4.2);
 const count=Math.max(4,Math.ceil(peak*1.12/step-1e-10));
 return {step,max:step*count,count};
}
function titleLines(title,width){
 const maxChars=width<=640?46:width<=860?64:84;
 const words=String(title||"").trim().split(/\s+/).filter(Boolean),lines=[];
 let current="";
 for(const word of words){
  if(word.length>maxChars){
   if(current){lines.push(current);current="";}
   let left=word;
   while(left.length>maxChars){lines.push(left.slice(0,maxChars));left=left.slice(maxChars);}
   current=left;
  }else if(!current)current=word;
  else if((current+" "+word).length<=maxChars)current+=" "+word;
  else{lines.push(current);current=word;}
 }
 if(current)lines.push(current);
 return lines.length?lines:["Probability distribution"];
}
const closest=(values,target)=>values.reduce((a,b)=>Math.abs(b-target)<Math.abs(a-target)?b:a,values[0]);
export function distributionLayout(raw){
 const q=raw&&"draft"in raw&&"ready"in raw?raw:analyzeDistribution(raw),d=q.draft;
 const {width,height}=DISTRIBUTION_SIZES[d.size]||DISTRIBUTION_SIZES.standard;
 const lines=titleLines(d.title,width),titleEnd=28+(lines.length-1)*21;
 const statementY=d.showProbability&&q.statement?titleEnd+25:null;
 const top=Math.min(height-155,(statementY??titleEnd)+38);
 const left=79,right=width-28,bottom=height-(d.showParameters?92:75);
 const plot={left,right,top,bottom,width:right-left,height:bottom-top};
 const valid=q.ready&&plot.height>25;
 const points=q.points||[];
 const peak=valid?(d.kind==="normal"?1/(q.sigma*Math.sqrt(2*Math.PI)):
  d.kind==="uniform"?1/(q.uniformB-q.uniformA):
  Math.max(0,...points.map(v=>v.probability))):1;
 const y=yScale(Math.max(peak,1e-18));
 let extent=4,domainMin=0,domainMax=1,discreteStep=1;
 if(d.kind==="normal"&&valid){
  for(const bound of [q.lower,q.upper])if(bound!==null)
   extent=Math.max(extent,Math.min(6.25,Math.abs((bound-q.mu)/q.sigma)+.4));
  domainMin=q.mu-extent*q.sigma;domainMax=q.mu+extent*q.sigma;
 }else if(d.kind==="uniform"&&valid){
  const span=q.uniformB-q.uniformA;
  domainMin=q.uniformA-.10*span;domainMax=q.uniformB+.10*span;
 }else if(countModel(d.kind)&&valid){
  discreteStep=d.kind==="binomial"?q.n:q.plotMax;
  domainMin=-.5;domainMax=discreteStep+.5;
 }else if(d.kind==="custom"&&valid){
  const lo=points[0].x,hi=points.at(-1).x,span=hi-lo;
  const padding=span*.08;
  domainMin=lo-padding;domainMax=hi+padding;
 }
 const domainWidth=domainMax-domainMin;
 const x=value=>left+(value-domainMin)/domainWidth*plot.width;
 const valueFromX=pixelX=>{
  const rawValue=domainMin+clamp((pixelX-left)/plot.width,0,1)*domainWidth;
  if(countModel(d.kind))return Math.round(clamp(rawValue,0,discreteStep));
  if(d.kind==="custom")return points.length?closest(points.map(p=>p.x),rawValue):0;
  return rawValue;
 };
 const yPixel=value=>bottom-clamp(value/y.max,0,1)*plot.height;
 const density=value=>d.kind==="normal"?
  Math.exp(-.5*((value-q.mu)/q.sigma)**2)/(q.sigma*Math.sqrt(2*Math.PI)):
  d.kind==="uniform"&&value>=q.uniformA&&value<=q.uniformB?1/(q.uniformB-q.uniformA):0;
 const yTicks=Array.from({length:y.count+1},(_,i)=>i*y.step),xTicks=[];
 if(valid&&d.kind==="normal"){
  const candidates=[-3,-2,-1,0,1,2,3].map(z=>q.mu+z*q.sigma);
  const labelWidth=Math.max(...candidates.map(v=>formatPlotNumber(v,q.sigma).length*7.6));
  const stride=plot.width/6<labelWidth+13?2:1;
  for(let z=-3;z<=3;z++)if(z%stride===0)
   xTicks.push({value:q.mu+z*q.sigma,label:formatPlotNumber(q.mu+z*q.sigma,q.sigma)});
 }else if(valid&&d.kind==="uniform"){
  const span=q.uniformB-q.uniformA;
  for(let i=0;i<=4;i++)xTicks.push({
   value:q.uniformA+span*i/4,label:formatPlotNumber(q.uniformA+span*i/4,span/4)
  });
 }else if(valid&&countModel(d.kind)){
  const maxLabels=Math.max(5,Math.floor(plot.width/45));
  const target=Math.max(1,discreteStep/maxLabels);
  const stride=Math.max(1,Math.ceil(nicePlotStep(target)));
  for(let k=0;k<=discreteStep;k+=stride)xTicks.push({value:k,label:String(k)});
  if(xTicks.at(-1)?.value!==discreteStep){
   if(xTicks.length>1&&discreteStep-xTicks.at(-1).value<stride*.52)xTicks.pop();
   xTicks.push({value:discreteStep,label:String(discreteStep)});
  }
 }else if(valid&&d.kind==="custom"){
  const sorted=points.map(p=>p.x);
  const format=v=>formatPlotNumber(v,Math.abs(domainWidth)/10000);
  let previous=-Infinity;
  for(let i=0;i<sorted.length;i++){
   const value=sorted[i],position=x(value);
   if(i===0||i===sorted.length-1||position>=previous+57&&x(sorted.at(-1))-position>57){
    xTicks.push({value,label:format(value)});
    previous=position;
   }
  }
  // If two distinct outcomes would round to the same label, retain precision.
  const duplicates=new Set();
  for(const tick of xTicks){
   if(duplicates.has(tick.label))tick.label=Number(tick.value.toPrecision(13)).toString();
   duplicates.add(tick.label);
  }
 }
 return {q,d,width,height,titleLines:lines,titleEnd,statementY,plot,valid,peak,
  yMax:y.max,yTicks,xTicks,extent,domainMin,domainMax,x,yPixel,density,valueFromX,
  discreteStep,continuous:continuous(d.kind)};
}
const stepFor=q=>q.draft.kind==="normal"?Math.max(q.sigma/100,1e-12):
 q.draft.kind==="uniform"?Math.max((q.uniformB-q.uniformA)/100,1e-12):1;
function boundValue(layout,role,value){
 const q=layout.q,d=q.draft,opposite=role==="lower"?q.upper:q.lower;
 if(countModel(d.kind))value=clamp(Math.round(value),0,layout.discreteStep);
 if(d.kind==="custom"){
  const values=q.points.map(p=>p.x);
  if(!values.length)return null;
  const eligible=values.filter(v=>opposite===null||
   (role==="lower"?d.mode==="outside"?v<opposite:v<=opposite:
    d.mode==="outside"?v>opposite:v>=opposite));
  if(!eligible.length)return null;
  return closest(eligible,value);
 }
 if(opposite!==null){
  const step=countModel(d.kind)?1:Math.max(stepFor(q),1e-12);
  if(role==="lower")value=Math.min(value,opposite-(d.mode==="outside"?step:0));
  else value=Math.max(value,opposite+(d.mode==="outside"?step:0));
 }
 return Number.isFinite(value)?value:null;
}
export function distributionBoundaryForPixel(raw,role,pixelX){
 const layout=distributionLayout(raw),q=layout.q,d=q.draft;
 if(!layout.valid||d.mode==="none"||!["lower","upper"].includes(role))return null;
 if(role==="upper"&&!["between","outside"].includes(d.mode))return null;
 let value=layout.valueFromX(pixelX);
 if(continuous(d.kind)){
  const step=stepFor(q);
  value=Number(value.toFixed(clamp(Math.ceil(-Math.log10(step)),0,12)));
 }
 return boundValue(layout,role,value);
}
export function distributionBoundaryNudge(raw,role,direction){
 const layout=distributionLayout(raw),q=layout.q,d=q.draft;
 if(!layout.valid||!Number.isInteger(direction)||Math.abs(direction)>10||direction===0)return null;
 if(role!=="lower"&&role!=="upper"||role==="upper"&&!["between","outside"].includes(d.mode))return null;
 const current=role==="upper"?q.upper:q.lower;
 if(current===null)return null;
 if(d.kind==="custom"){
  const values=q.points.map(p=>p.x),next=direction>0?
   values.filter(v=>v>current).slice(0,direction).at(-1):
   values.filter(v=>v<current).slice(direction)[0];
  return boundValue(layout,role,next??current);
 }
 const step=countModel(d.kind)?1:stepFor(q);
 const next=countModel(d.kind)?current+direction:Number((current+step*direction).toPrecision(13));
 return boundValue(layout,role,next);
}
