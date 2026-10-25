/**
 * A shared-axis, non-exported comparison. The axes are identical for both
 * models; this avoids misleading visual changes from independent auto-scales.
 * The ordinary IA SVG/PNG export continues to use distribution-render.js.
 */
import {distributionLayout,formatPlotNumber,clamp} from "./distribution-layout.js";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const num=n=>Number(n).toFixed(2);
const txt=(s,x,y,size=12,anchor="middle",extra="")=>
 '<text x="'+num(x)+'" y="'+num(y)+'" text-anchor="'+anchor+
 '" font-family="Arial,Helvetica,sans-serif" font-size="'+size+'" fill="#304b58"'+extra+'>'+esc(s)+'</text>';
const line=(x1,y1,x2,y2,stroke,width=1,extra="")=>
 '<line x1="'+num(x1)+'" y1="'+num(y1)+'" x2="'+num(x2)+'" y2="'+num(y2)+
 '" stroke="'+stroke+'" stroke-width="'+width+'"'+extra+'/>';
const continuous=k=>k==="normal"||k==="uniform";
const eventChosen=(q,x)=>{
 const {mode}=q.draft,a=q.lower,b=q.upper;
 return mode==="exact"?x===a:mode==="left"?x<=a:mode==="right"?x>=a:
  mode==="between"?x>=a&&x<=b:mode==="outside"?x<=a||x>=b:false;
};
function selectedAreas(q,lo,hi){
 const {mode}=q.draft;
 if(mode==="none"||q.lower===null)return [];
 const a=q.lower,b=q.upper;
 const areas=mode==="left"?[[lo,a]]:mode==="right"?[[a,hi]]:
  mode==="between"?[[a,b]]:mode==="outside"?[[lo,a],[b,hi]]:[];
 return areas.map(([s,e])=>[clamp(s,lo,hi),clamp(e,lo,hi)]).filter(([s,e])=>e>s);
}
const density=(q,t)=>q.draft.kind==="normal"?
 Math.exp(-.5*((t-q.mu)/q.sigma)**2)/(q.sigma*Math.sqrt(2*Math.PI)):
 t>=q.uniformA&&t<=q.uniformB?1/(q.uniformB-q.uniformA):0;
function densityPath(q,X,Y,lo,hi){
 if(q.draft.kind==="uniform"){
  const {uniformA:a,uniformB:b}=q,peak=1/(b-a);
  return 'M'+num(X(lo))+' '+num(Y(0))+' L'+num(X(a))+' '+num(Y(0))+
   ' L'+num(X(a))+' '+num(Y(peak))+' L'+num(X(b))+' '+num(Y(peak))+
   ' L'+num(X(b))+' '+num(Y(0))+' L'+num(X(hi))+' '+num(Y(0));
 }
 return Array.from({length:420},(_,i)=>{
  const v=lo+(hi-lo)*i/419;
  return (i?"L":"M")+num(X(v))+' '+num(Y(density(q,v)));
 }).join(" ");
}
export function renderDistributionWhatIfSvg(comparison){
 if(!comparison?.ready)return "";
 const a=comparison.original,b=comparison.alternative;
 const l0=distributionLayout(a),l1=distributionLayout(b);
 const W=960,H=354,left=80,right=932,top=73,bottom=281;
 const min=Math.min(l0.domainMin,l1.domainMin),max=Math.max(l0.domainMax,l1.domainMax);
 const span=max-min;
 if(!Number.isFinite(span)||span<=0)return "";
 const yMax=Math.max(l0.peak,l1.peak,1e-18)*1.22;
 const X=x=>left+(x-min)/span*(right-left);
 const Y=y=>bottom-Math.max(0,Math.min(1,y/yMax))*(bottom-top);
 const variable=a.draft.symbol;
 const svg=['<svg xmlns="http://www.w3.org/2000/svg" data-distribution-whatif-chart="true" role="img"'+
  ' aria-label="Shared-axis comparison of original and alternative '+esc(a.draft.kind)+
  ' distributions" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'">'+
  '<title>Original and alternative model comparison</title>'+
  '<desc>The grey original and blue alternative use exactly the same horizontal and vertical axes.'+
  (comparison.originalProbability!==null?' The selected event boundaries stay fixed.':'')+'</desc>'+
  '<rect width="'+W+'" height="'+H+'" fill="#fff"/>'+
  txt("Original model",left+48,29,13,"start")+
  line(left+16,25,left+43,25,"#63798a",3,' stroke-dasharray="7 4"')+
  txt("Alternative model",left+265,29,13,"start")+
  line(left+229,25,left+256,25,"#1681a3",3)];
 // A faint vertical event band represents the SAME fixed event, not the
 // probability size. For discrete models the chosen bars receive stronger ink.
 if(continuous(a.draft.kind)&&comparison.originalProbability!==null)
  for(const [lo,hi] of selectedAreas(a,min,max))
   svg.push('<rect x="'+num(X(lo))+'" y="'+num(top)+'" width="'+num(X(hi)-X(lo))+
    '" height="'+num(bottom-top)+'" fill="#e9f3ee" opacity=".8"/>');
 for(let i=0;i<=4;i++){
  const y=yMax*i/4,py=Y(y);
  svg.push(line(left,py,right,py,"#e3eaf0",.9),
   txt(formatPlotNumber(y,yMax/4),left-11,py+4,12,"end"));
 }
 svg.push(line(left,top,left,bottom,"#657d8c",1.25),line(left,bottom,right,bottom,"#657d8c",1.25));
 let ticks=[];
 if(a.draft.kind==="custom"){
  const all=[...new Set([...a.points,...b.points].map(p=>p.x))].sort((x,y)=>x-y);
  let last=-1000;
  for(let i=0;i<all.length;i++){
   const px=X(all[i]);
   if(i===0||i===all.length-1||px-last>=85){ticks.push(all[i]);last=px;}
  }
 }else if(continuous(a.draft.kind)){
  ticks=Array.from({length:7},(_,i)=>min+span*i/6);
 }else{
  const high=Math.max(a.draft.kind==="binomial"?a.n:a.plotMax,b.draft.kind==="binomial"?b.n:b.plotMax);
  const step=Math.max(1,Math.ceil(high/8));
  for(let x=0;x<=high;x+=step)ticks.push(x);
  if(ticks.at(-1)!==high)ticks.push(high);
 }
 for(const t of ticks){
  const px=X(t);
  svg.push(line(px,bottom,px,bottom+5,"#738c99"),
   txt(formatPlotNumber(t,span/10000),px,bottom+23,12));
 }
 if(continuous(a.draft.kind)){
  svg.push('<path d="'+densityPath(a,X,Y,min,max)+
   '" fill="none" stroke="#63798a" stroke-width="3" stroke-dasharray="9 5" stroke-linejoin="round"/>');
  svg.push('<path d="'+densityPath(b,X,Y,min,max)+
   '" fill="none" stroke="#1681a3" stroke-width="3" stroke-linejoin="round"/>');
 }else{
  const union=[...new Set([...a.points,...b.points].map(p=>p.x))].sort((x,y)=>x-y);
  const near=union.length>1?Math.min(...union.slice(1).map((x,i)=>X(x)-X(union[i]))):50;
  const bw=Math.max(1,Math.min(12,near*.36));
  const colour=["#63798a","#1681a3"];
  [a,b].forEach((q,i)=>{
   for(const point of q.points){
    const x=X(point.x)+(i===0?-bw:0),py=Y(point.probability);
    svg.push('<rect data-whatif-bar="'+(i===0?"original":"alternative")+
     '" x="'+num(x)+'" y="'+num(py)+'" width="'+num(bw)+'" height="'+num(Math.max(.1,bottom-py))+
     '" fill="'+colour[i]+'" opacity="'+(comparison.originalProbability===null||eventChosen(q,point.x)?"0.85":"0.32")+'"/>');
   }
  });
 }
 if(comparison.originalProbability!==null){
  const marks=[a.lower,...(["between","outside"].includes(a.draft.mode)?[a.upper]:[])]
   .filter(x=>Number.isFinite(x));
  for(const v of marks)if(v>=min&&v<=max)
   svg.push(line(X(v),top,X(v),bottom,"#356d57",1.2,' stroke-dasharray="4 4"'));
 }
 svg.push(txt(continuous(a.draft.kind)?"Probability density":"P("+variable+" = k)",left,top-12,12,"start"),
  txt(variable+(a.draft.unit.trim()?" ("+a.draft.unit.trim()+")":""),W/2,H-17,14));
 return svg.join("")+"</svg>";
}
