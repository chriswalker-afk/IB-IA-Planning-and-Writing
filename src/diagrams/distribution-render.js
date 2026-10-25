/**
 * Document-ready probability figure. Preview-only drag handles never enter
 * saved SVG, PNG, the first-figure gallery or report exports.
 */
import {distributionLayout,formatPlotNumber,clamp} from "./distribution-layout.js";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const coord=x=>Number(x).toFixed(2);
const text=(s,x,y,size=14,anchor="middle",weight=400,extra="")=>
 '<text x="'+coord(x)+'" y="'+coord(y)+'" text-anchor="'+anchor+
 '" font-family="Arial,Helvetica,sans-serif" font-size="'+size+
 '" font-weight="'+weight+'" fill="#233846"'+extra+'>'+esc(s)+'</text>';
const line=(x1,y1,x2,y2,stroke,width=1,extra="")=>
 '<line x1="'+coord(x1)+'" y1="'+coord(y1)+'" x2="'+coord(x2)+'" y2="'+coord(y2)+
 '" stroke="'+stroke+'" stroke-width="'+width+'"'+extra+'/>';
const selected=(q,k)=>q.draft.mode==="exact"?k===q.lower:
 q.draft.mode==="left"?k<=q.lower:q.draft.mode==="right"?k>=q.lower:
 q.draft.mode==="between"?k>=q.lower&&k<=q.upper:
 q.draft.mode==="outside"?k<=q.lower||k>=q.upper:false;
const curvePath=(layout,lo,hi,steps)=>{
 const {x,yPixel,density}=layout;
 return Array.from({length:steps+1},(_,i)=>{
  const v=lo+(hi-lo)*i/steps;
  return (i?"L":"M")+coord(x(v))+" "+coord(yPixel(density(v)));
 }).join(" ");
};
function shadeNormal(layout,a,b){
 if(!(b>a))return "";
 const {plot,x,yPixel,density}=layout;
 const steps=Math.max(2,Math.ceil(480*(b-a)/(2*layout.extent*layout.q.sigma)));
 const fill=layout.d.printStyle==="mono"?"url(#distribution-hatch)":"#add8e8";
 return '<path data-distribution-shading="normal" d="M'+coord(x(a))+" "+coord(plot.bottom)+
  " "+curvePath(layout,a,b,steps).replace(/^M/,"L")+" L"+coord(x(b))+" "+coord(plot.bottom)+
  ' Z" fill="'+fill+'" fill-opacity="'+(layout.d.printStyle==="mono"?"1":".76")+'"/>';
}
function shadeIntervals(layout){
 const {q,d,extent}=layout;
 if(d.mode==="none"||q.lower===null)return "";
 const a=q.mu-extent*q.sigma,b=q.mu+extent*q.sigma,lo=q.lower,hi=q.upper;
 const intervals=d.mode==="left"?[[a,Math.min(b,lo)]]:
  d.mode==="right"?[[Math.max(a,lo),b]]:
  d.mode==="between"?[[Math.max(a,lo),Math.min(b,hi)]]:
  [[a,Math.min(b,lo)],[Math.max(a,hi),b]];
 return intervals.map(([start,end])=>shadeNormal(layout,clamp(start,a,b),clamp(end,a,b))).join("");
}
const tickGroup=layout=>{
 const {q,d,plot,yTicks,xTicks,yPixel,x}=layout;
 let svg="";
 for(const value of yTicks){
  const y=yPixel(value);
  svg+=line(plot.left,y,plot.right,y,"#e3e9ec",.85);
  svg+=line(plot.left-5,y,plot.left,y,"#738a95",1);
  svg+=text(formatPlotNumber(value,layout.yTicks[1]||1),plot.left-10,y+4,12,"end");
 }
 for(const tick of xTicks){
  const xpos=x(tick.value);
  svg+=line(xpos,plot.bottom,xpos,plot.bottom+6,"#738a95",1);
  svg+=text(tick.label,xpos,plot.bottom+24,13);
 }
 return svg;
};
function boundaryMarks(layout,interactive){
 const {q,d,plot,x,yPixel,density}=layout;
 if(d.mode==="none"||q.lower===null)return "";
 const entries=[["lower",q.lower]];
 if(["between","outside"].includes(d.mode)&&q.upper!==null)entries.push(["upper",q.upper]);
 let svg="";
 entries.forEach(([role,v],index)=>{
  const xx=x(v);
  if(xx<plot.left-1||xx>plot.right+1)return;
  const pointY=d.kind==="normal"?yPixel(density(v)):
    yPixel(q.masses[clamp(v,0,q.n)]||0);
  const labelY=plot.top+16+((index===1&&Math.abs(x(entries[0][1])-xx)<75)?17:0);
  // The thin analytical marker is part of the print figure.
  svg+=line(xx,pointY,xx,plot.bottom,d.printStyle==="mono"?"#344c5c":"#267b99",1.45,
   ' stroke-dasharray="5 4" data-distribution-boundary="'+role+'"');
  if(d.kind==="normal"){
   svg+=text(formatPlotNumber(v,q.sigma/100),xx,labelY,13,"middle",600,
     ' stroke="white" stroke-width="4" stroke-linejoin="round" paint-order="stroke"');
  }
  if(interactive){
   const aria=role==="lower"?"Lower":"Upper",min=d.kind==="normal"?q.mu-layout.extent*q.sigma:0,
    max=d.kind==="normal"?q.mu+layout.extent*q.sigma:q.n;
   svg+='<g class="distribution-drag-handle" data-distribution-handle="'+role+
    '" role="slider" tabindex="0" focusable="true" aria-label="'+aria+
    ' probability boundary for '+esc(d.symbol)+'" aria-orientation="horizontal" aria-valuenow="'+
    esc(String(v))+'" aria-valuemin="'+esc(String(min))+'" aria-valuemax="'+esc(String(max))+
    '" aria-valuetext="'+esc(String(v))+'">'+
    line(xx,plot.top,xx,plot.bottom,"transparent",27,' pointer-events="stroke"')+
    '<circle cx="'+coord(xx)+'" cy="'+coord(d.kind==="normal"?pointY:plot.top+19)+
    '" r="7" fill="#ffffff" stroke="#246a86" stroke-width="2.4" pointer-events="all"/>'+
    '</g>';
  }
 });
 return svg;
}
export function renderDistributionSvg(raw,{interactive=false}={}){
 const a=distributionLayout(raw),{q,d,plot,width:W,height:H,titleLines,titleEnd,statementY}=a;
 const colour=d.printStyle==="mono"?"#364a57":"#256f8d",base="#cad5dc";
 const aria=d.title||"Probability distribution";
 let svg=['<svg xmlns="http://www.w3.org/2000/svg" data-distribution-svg="true"'+
  (interactive?' data-distribution-interactive="true"':"")+' role="'+(interactive?"group":"img")+'" aria-label="'+esc(aria)+
  '" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+" "+H+
  '"><title>'+esc(aria)+'</title>'+
  (q.statement?'<desc>'+esc(q.statement)+'</desc>':"")+
  '<rect width="'+W+'" height="'+H+'" fill="#fff"/>'+
  '<defs><pattern id="distribution-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'+
  '<rect width="8" height="8" fill="#e2e8eb"/><line x1="0" y1="0" x2="0" y2="8" stroke="#74838c" stroke-width="2"/></pattern></defs>'];
 titleLines.forEach((s,i)=>svg.push(text(s,W/2,28+21*i,19,"middle",600)));
 if(!q.ready){
  svg.push(text("Enter a figure title and valid parameters to preview the model.",W/2,H/2,14));
  return svg.join("")+"</svg>";
 }
 if(statementY!==null)svg.push(text(q.statement,W/2,statementY,14,"middle",500));
 const {left,right,top,bottom}=plot;
 svg.push(tickGroup(a));
 svg.push(line(left,top,left,bottom,"#566d7a",1.35));
 svg.push(line(left,bottom,right,bottom,"#566d7a",1.35));
 svg.push(text(d.kind==="normal"?"Probability density":"P("+d.symbol+" = k)",left,top-10,13,"start",500));
 if(d.kind==="normal"){
  const start=q.mu-a.extent*q.sigma,end=q.mu+a.extent*q.sigma;
  svg.push(shadeIntervals(a));
  svg.push('<path data-distribution-curve="normal" d="'+curvePath(a,start,end,560)+
   '" fill="none" stroke="'+colour+'" stroke-width="2.65" stroke-linejoin="round"/>');
  if(d.showMean)svg.push(line(a.x(q.mu),top,a.x(q.mu),bottom,"#8b9aa1",1.2,' stroke-dasharray="3 5"'));
 }else{
  const step=plot.width/(q.n+1),barW=Math.min(33,Math.max(1.2,step*.76));
  for(let k=0;k<=q.n;k++){
   const x=a.x(k)-barW/2,y=a.yPixel(q.masses[k]),height=bottom-y;
   const chosen=selected(q,k);
   svg.push('<rect data-distribution-bar="'+k+'"'+(chosen?' data-distribution-selected="true"':'')+
    ' x="'+coord(x)+'" y="'+coord(y)+'" width="'+coord(barW)+'" height="'+coord(Math.max(.01,height))+
    '" fill="'+(chosen?d.printStyle==="mono"?"#344c5b":"#489fbd":base)+
    '" stroke="'+(chosen?"#2b627d":"#90a3ae")+'" stroke-width=".75"/>');
  }
 }
 svg.push(boundaryMarks(a,interactive));
 svg.push(text(d.symbol+(d.unit.trim()?" ("+d.unit.trim()+")":""),W/2,H-23,15,"middle",500));
 if(d.showParameters){
  const params=d.kind==="normal"?"μ = "+formatPlotNumber(q.mu,q.sigma)+"; σ = "+formatPlotNumber(q.sigma,q.sigma/10):
   "n = "+q.n+"; p = "+formatPlotNumber(q.p,.001);
  svg.push(text(params,W/2,bottom+48,13));
 }
 return svg.join("")+"</svg>";
}
