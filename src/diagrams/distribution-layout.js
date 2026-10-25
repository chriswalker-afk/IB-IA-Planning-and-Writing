/**
 * Shared plot geometry for IA exports and interactive previews.
 * SVG viewBox coordinates are the source of truth for hit testing and ticks.
 */
import {analyzeDistribution} from "./distribution-core.js";
export const DISTRIBUTION_SIZES=Object.freeze({
 compact:Object.freeze({width:640,height:370}),
 standard:Object.freeze({width:860,height:420}),
 wide:Object.freeze({width:1080,height:440})
});
export const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const finite=x=>Number.isFinite(x)?x:0;
export function formatPlotNumber(value,step=1){
 if(!Number.isFinite(value))return "";
 if(Math.abs(value)<Math.max(1e-14,Math.abs(step)*1e-8))return "0";
 const digits=clamp(Math.ceil(-Math.log10(Math.max(1e-14,Math.abs(step))))+1,0,12);
 const output=Number(value.toFixed(digits));
 return Number.isFinite(output)?String(output):value.toPrecision(8);
}
export function nicePlotStep(target){
 if(!Number.isFinite(target)||target<=0)return 1;
 const scale=10**Math.floor(Math.log10(target)),fraction=target/scale;
 const factor=[1,2,2.5,5,10].find(x=>x>=fraction-1e-12)||10;
 return factor*scale;
}
function yScale(peak){
 const step=nicePlotStep(peak/4.2);
 const count=Math.max(4,Math.ceil(peak*1.12/step-1e-10));
 return {step,max:step*count,count};
}
function titleLines(title,width){
 // Titles are student authored; never silently clip or ellipsise an IA figure.
 const maxChars=width<=640?46:width<=860?64:84;
 const words=String(title||"").trim().split(/\s+/).filter(Boolean),lines=[];
 let current="";
 for(const word of words){
  if(word.length>maxChars){
   if(current){lines.push(current);current="";}
   let remaining=word;
   while(remaining.length>maxChars){lines.push(remaining.slice(0,maxChars));remaining=remaining.slice(maxChars);}
   current=remaining;
  }else if(!current)current=word;
  else if((current+" "+word).length<=maxChars)current+=" "+word;
  else{lines.push(current);current=word;}
 }
 if(current)lines.push(current);
 return lines.length?lines:["Probability distribution"];
}
export function distributionLayout(raw){
 const q=raw&&"draft"in raw&&"ready"in raw?raw:analyzeDistribution(raw);
 const d=q.draft,{width,height}=DISTRIBUTION_SIZES[d.size]||DISTRIBUTION_SIZES.standard;
 const lines=titleLines(d.title,width);
 const titleEnd=28+(lines.length-1)*21;
 const statementY=d.showProbability&&q.statement?titleEnd+25:null;
 const top=Math.min(height-155,(statementY??titleEnd)+38);
 const left=79,right=width-28,bottom=height-(d.showParameters?92:75);
 const plot={left,right,top,bottom,width:right-left,height:bottom-top};
 const valid=q.ready&&plot.height>25;
 const peak=valid?(d.kind==="normal"?1/(q.sigma*Math.sqrt(2*Math.PI)):Math.max(...q.masses)):1;
 const y=yScale(Math.max(peak,1e-18));
 let extent=4;
 if(d.kind==="normal"&&valid){
  for(const bound of [q.lower,q.upper])if(bound!==null)extent=Math.max(extent,Math.min(6.25,Math.abs((bound-q.mu)/q.sigma)+.4));
 }
 const normalX=value=>left+(((value-q.mu)/q.sigma/extent+1)/2)*plot.width;
 const discreteX=k=>left+(k+.5)/(q.n+1)*plot.width;
 const px=d.kind==="normal"?normalX:discreteX;
 const valueFromX=x=>{
  const fraction=clamp((x-left)/plot.width,0,1);
  return d.kind==="normal"?q.mu+q.sigma*(fraction*2-1)*extent:
   Math.round(clamp(fraction*(q.n+1)-.5,0,q.n));
 };
 const yPixel=value=>bottom-clamp(value/y.max,0,1)*plot.height;
 const density=value=>Math.exp(-.5*((value-q.mu)/q.sigma)**2)/(q.sigma*Math.sqrt(2*Math.PI));
 const yTicks=Array.from({length:y.count+1},(_,i)=>i*y.step);
 const xTicks=[];
 if(valid&&d.kind==="normal"){
  const candidate=[-3,-2,-1,0,1,2,3].map(z=>q.mu+z*q.sigma);
  const labelWidth=Math.max(...candidate.map(v=>formatPlotNumber(v,q.sigma).length*7.6));
  const stride=plot.width/6<labelWidth+13?2:1;
  for(let z=-3;z<=3;z++)if(z%stride===0)xTicks.push({value:q.mu+z*q.sigma,label:formatPlotNumber(q.mu+z*q.sigma,q.sigma)});
 }else if(valid){
  const maxLabels=Math.max(5,Math.floor(plot.width/45));
  const target=Math.max(1,q.n/maxLabels);
  const stride=Math.max(1,Math.ceil(nicePlotStep(target)));
  for(let k=0;k<=q.n;k+=stride)xTicks.push({value:k,label:String(k)});
  if(xTicks[xTicks.length-1]?.value!==q.n){
   if(xTicks.length>1&&q.n-xTicks[xTicks.length-1].value<stride*.52)xTicks.pop();
   xTicks.push({value:q.n,label:String(q.n)});
  }
 }
 return {q,d,width,height,titleLines:lines,titleEnd,statementY,plot,valid,peak,yMax:y.max,yTicks,
  xTicks,extent,x:valid?px:()=>left,yPixel,density,valueFromX};
}
export function distributionBoundaryForPixel(raw,role,pixelX){
 const layout=distributionLayout(raw),q=layout.q,d=q.draft;
 if(!layout.valid||d.mode==="none"||!["lower","upper"].includes(role))return null;
 if(role==="upper"&&!["between","outside"].includes(d.mode))return null;
 let value=layout.valueFromX(pixelX);
 if(d.kind==="normal"){
  // Keep dragged values stable and readable without losing unit-scale precision.
  const step=Math.max(q.sigma/100,1e-12);
  value=Number(value.toFixed(clamp(Math.ceil(-Math.log10(step)),0,12)));
 }
 if(role==="lower"&&q.upper!==null)value=Math.min(value,d.mode==="outside"?
  d.kind==="binomial"?q.upper-1:q.upper-Math.max(q.sigma/100,1e-12):q.upper);
 if(role==="upper"&&q.lower!==null)value=Math.max(value,d.mode==="outside"?
  d.kind==="binomial"?q.lower+1:q.lower+Math.max(q.sigma/100,1e-12):q.lower);
 if(d.kind==="binomial")value=clamp(Math.round(value),0,q.n);
 return Number.isFinite(value)?value:null;
}
export function distributionBoundaryNudge(raw,role,direction){
 const q=analyzeDistribution(raw),d=q.draft;
 if(!q.ready||![-1,1].includes(direction))return null;
 const current=role==="upper"?q.upper:q.lower;
 if(current===null)return null;
 const step=d.kind==="binomial"?1:Math.max(q.sigma/100,1e-12);
 return distributionBoundaryForPixel(d,role,distributionLayout(q).x(current+step*direction));
}
