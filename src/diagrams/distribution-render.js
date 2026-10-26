/**
 * IA-ready figure. The export is the same calibrated SVG as the preview,
 * minus slider handles and editor-only guidance.
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
const shadeFill=layout=>layout.d.printStyle==="mono"?"url(#distribution-hatch)":"#add8e8";
const shadeOpacity=layout=>layout.d.printStyle==="mono"?"1":".76";
function shadeNormal(layout,a,b){
 if(!(b>a))return "";
 const {plot,x}=layout;
 const steps=Math.max(2,Math.ceil(480*(b-a)/(2*layout.extent*layout.q.sigma)));
 return '<path data-distribution-shading="normal" d="M'+coord(x(a))+" "+coord(plot.bottom)+
  " "+curvePath(layout,a,b,steps).replace(/^M/,"L")+" L"+coord(x(b))+" "+coord(plot.bottom)+
  ' Z" fill="'+shadeFill(layout)+'" fill-opacity="'+shadeOpacity(layout)+'"/>';
}
function selectedIntervals(layout){
 const {q,d}=layout;
 if(d.mode==="none"||q.lower===null)return [];
 const min=d.kind==="normal"?layout.domainMin:q.uniformA;
 const max=d.kind==="normal"?layout.domainMax:q.uniformB;
 const lo=q.lower,hi=q.upper;
 return (d.mode==="left"?[[min,Math.min(max,lo)]]:
  d.mode==="right"?[[Math.max(min,lo),max]]:
  d.mode==="between"?[[Math.max(min,lo),Math.min(max,hi)]]:
  [[min,Math.min(max,lo)],[Math.max(min,hi),max]])
  .map(([a,b])=>[clamp(a,min,max),clamp(b,min,max)]).filter(([a,b])=>b>a);
}
function shading(layout){
 const {d,q,x,plot,yPixel}=layout;
 if(!layout.continuous)return "";
 return selectedIntervals(layout).map(([a,b])=>{
  if(d.kind==="normal")return shadeNormal(layout,a,b);
  const y=yPixel(1/(q.uniformB-q.uniformA));
  return '<path data-distribution-shading="uniform" d="M'+coord(x(a))+" "+coord(plot.bottom)+
   " L"+coord(x(a))+" "+coord(y)+" L"+coord(x(b))+" "+coord(y)+
   " L"+coord(x(b))+" "+coord(plot.bottom)+' Z" fill="'+shadeFill(layout)+
   '" fill-opacity="'+shadeOpacity(layout)+'"/>';
 }).join("");
}
function ticks(layout){
 const {plot,yTicks,xTicks,yPixel,x}=layout;
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
}
function boundaryMarks(layout,interactive){
 const {q,d,plot,x,yPixel,density}=layout;
 if(d.mode==="none"||q.lower===null)return "";
 const entries=[["lower",q.lower]];
 if(["between","outside"].includes(d.mode)&&q.upper!==null)entries.push(["upper",q.upper]);
 let svg="";
 entries.forEach(([role,v],index)=>{
  const xx=x(v);
  if(xx<plot.left-1||xx>plot.right+1)return;
  const mass=q.points?.find(p=>p.x===v)?.probability||0;
  const pointY=layout.continuous?yPixel(density(v)):mass?yPixel(mass):plot.top+8;
  const labelY=plot.top+16+((index===1&&Math.abs(x(entries[0][1])-xx)<75)?17:0);
  svg+=line(xx,pointY,xx,plot.bottom,d.printStyle==="mono"?"#344c5c":"#267b99",1.45,
   ' stroke-dasharray="5 4" data-distribution-boundary="'+role+'"');
  if(layout.continuous)
   svg+=text(formatPlotNumber(v,d.kind==="normal"?q.sigma/100:(q.uniformB-q.uniformA)/100),xx,labelY,13,"middle",600,
    ' stroke="white" stroke-width="4" stroke-linejoin="round" paint-order="stroke"');
  if(interactive){
   const aria=role==="lower"?"Lower":"Upper",
    min=layout.continuous?layout.domainMin:d.kind==="custom"?q.points[0].x:0,
    max=layout.continuous?layout.domainMax:d.kind==="custom"?q.points.at(-1).x:layout.discreteStep;
   svg+='<g class="distribution-drag-handle" data-distribution-handle="'+role+
    '" role="slider" tabindex="0" focusable="true" aria-label="'+aria+
    ' probability boundary for '+esc(d.symbol)+'" aria-orientation="horizontal" aria-valuenow="'+
    esc(String(v))+'" aria-valuemin="'+esc(String(min))+'" aria-valuemax="'+esc(String(max))+
    '" aria-valuetext="'+esc(String(v))+'">'+
    line(xx,plot.top,xx,plot.bottom,"transparent",44,' pointer-events="stroke"')+
    '<circle cx="'+coord(xx)+'" cy="'+coord(layout.continuous?pointY:plot.top+19)+
    '" r="7" fill="#ffffff" stroke="#246a86" stroke-width="2.4" pointer-events="all"/>'+
    '</g>';
  }
 });
 return svg;
}
function renderBars(layout,colour){
 const {q,d,plot,x,yPixel}=layout,points=q.points||[];
 const spacings=points.slice(1).map((p,i)=>Math.abs(x(p.x)-x(points[i].x)));
 const gap=spacings.length?Math.min(...spacings):plot.width;
 const barWidth=Math.min(33,Math.max(1.2,gap*.76));
 const mono=d.printStyle==="mono",base=mono?"#eef1f3":"#cad5dc";
 const selectedColour=mono?"url(#distribution-hatch)":"#489fbd";
 return points.map((p,i)=>{
  const xx=x(p.x)-barWidth/2,y=yPixel(p.probability),height=plot.bottom-y;
  const chosen=selected(q,p.x);
  // The outcome is a true numeric value; data-distribution-bar provides a
  // stable, escaped identifier while x-position comes from the numeric axis.
  return '<rect data-distribution-bar="'+esc(String(p.x))+'"'+
   (chosen?' data-distribution-selected="true"':'')+
   ' x="'+coord(xx)+'" y="'+coord(y)+'" width="'+coord(barWidth)+
   '" height="'+coord(Math.max(.01,height))+'" fill="'+(chosen?selectedColour:base)+
   '" stroke="'+(chosen?(mono?"#293f4c":"#2b627d"):"#90a3ae")+
   '" stroke-width="'+(chosen&&mono?"1.6":".75")+'"/>';
 }).join("");
}
const parameters=q=>{
 const d=q.draft;
 switch(d.kind){
  case "normal":return "μ = "+formatPlotNumber(q.mu,q.sigma)+"; σ = "+formatPlotNumber(q.sigma,q.sigma/10);
  case "binomial":return "n = "+q.n+"; p = "+formatPlotNumber(q.p,.001);
  case "poisson":return "λ = "+formatPlotNumber(q.lambda,.001);
  case "uniform":return "a = "+formatPlotNumber(q.uniformA,(q.uniformB-q.uniformA)/10)+
   "; b = "+formatPlotNumber(q.uniformB,(q.uniformB-q.uniformA)/10);
  case "custom":return q.points.length+" outcomes · total probability = "+Number(q.total.toPrecision(10));
  default:return "";
 }
};
export function renderDistributionSvg(raw,{interactive=false}={}){
 const layout=distributionLayout(raw),{q,d,plot,width:W,height:H,titleLines,statementY}=layout;
 const colour=d.printStyle==="mono"?"#364a57":"#256f8d";
 const aria=d.title||"Probability distribution";
 const svg=['<svg xmlns="http://www.w3.org/2000/svg" data-distribution-svg="true"'+
  (interactive?' data-distribution-interactive="true"':"")+' role="'+(interactive?"group":"img")+
  '" aria-label="'+esc(aria)+'" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+" "+H+
  '"><title>'+esc(aria)+'</title>'+
  '<desc>'+esc((q.ready?
   (d.kind==="normal"?"Normal density":d.kind==="uniform"?"Continuous uniform density":
    d.kind==="binomial"?"Binomial discrete probability":
    d.kind==="poisson"?"Poisson discrete probability":"Custom discrete probability")+
    " of "+d.symbol+(d.unit.trim()?" in "+d.unit.trim():"")+". ":"")+
   (q.statement||"No probability event selected.")+
   (d.printStyle==="mono"?" Selected probabilities use a hatch pattern for monochrome clarity.":""))+'</desc>'+
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
 svg.push(ticks(layout),line(left,top,left,bottom,"#566d7a",1.35),
  line(left,bottom,right,bottom,"#566d7a",1.35));
 svg.push(text(layout.continuous?"Probability density":"P("+d.symbol+" = k)",left,top-10,13,"start",500));
 if(layout.continuous){
  svg.push(shading(layout));
  if(d.kind==="normal"){
   svg.push('<path data-distribution-curve="normal" d="'+curvePath(layout,layout.domainMin,layout.domainMax,560)+
    '" fill="none" stroke="'+colour+'" stroke-width="2.65" stroke-linejoin="round"/>');
  }else{
   const a=x=>(coord(layout.x(x))),y=coord(layout.yPixel(1/(q.uniformB-q.uniformA)));
   const path="M"+a(layout.domainMin)+" "+coord(bottom)+" L"+a(q.uniformA)+" "+coord(bottom)+
    " L"+a(q.uniformA)+" "+y+" L"+a(q.uniformB)+" "+y+
    " L"+a(q.uniformB)+" "+coord(bottom)+" L"+a(layout.domainMax)+" "+coord(bottom);
   svg.push('<path data-distribution-curve="uniform" d="'+path+'" fill="none" stroke="'+colour+
    '" stroke-width="2.65" stroke-linejoin="round"/>');
  }
  if(d.showMean)svg.push(line(layout.x(q.mean),top,layout.x(q.mean),bottom,"#8b9aa1",1.2,' stroke-dasharray="3 5"'));
 }else svg.push(renderBars(layout,colour));
 svg.push(boundaryMarks(layout,interactive));
 svg.push(text(d.symbol+(d.unit.trim()?" ("+d.unit.trim()+")":""),W/2,H-23,15,"middle",500));
 if(d.showParameters)svg.push(text(parameters(q),W/2,bottom+48,13));
 return svg.join("")+"</svg>";
}
