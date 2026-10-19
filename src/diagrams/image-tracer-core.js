/**
 * Image and coordinate tracer: safe local image records, coordinate geometry,
 * printable SVGs and student-authored mathematical quality checks.
 * All coordinates are derived from explicit student calibration, not guessed.
 */
import {escapeGraph} from "./graph-core.js";
export const MAX_TRACE_POINTS=180,MAX_TRACE_FIGURES=6,MAX_IMAGE_CHARS=245000;
const str=(x,n=150)=>typeof x==="string"?x.slice(0,n):"";
const finite=x=>typeof x==="number"&&Number.isFinite(x);
const point=p=>p&&typeof p==="object"&&finite(p.x)&&finite(p.y)&&p.x>=0&&p.y>=0&&p.x<=10000&&p.y<=10000?{x:p.x,y:p.y}:null;
const source=s=>typeof s==="string"&&s.length<=MAX_IMAGE_CHARS&&/^data:image\/(?:jpeg|png|webp);base64,[a-z0-9+/=\s]+$/i.test(s)?s:"";
export const newImageTraceDraft=()=>({
 imageSrc:"",width:0,height:0,imageName:"",
 title:"",sourceKind:"unsure",sourceCredit:"",
 xLabel:"x",yLabel:"y",unit:"",knownLength:"",origin:null,direction:null,refA:null,refB:null,
 points:[],mode:"origin",view:"photo",imageOpacity:0.72,showGrid:true,showLine:true,closeShape:false,showLabels:true,
 precision:"unsure",perspective:"unsure",limitations:"",caption:""
});
export const newImageTracer=()=>({open:false,draft:newImageTraceDraft(),figures:[],activeId:""});
export function normalizeTraceDraft(raw){
 const d=newImageTraceDraft(),r=raw&&typeof raw==="object"&&!Array.isArray(raw)?raw:{};
 for(const key of ["imageName","title","sourceKind","sourceCredit","xLabel","yLabel","unit","knownLength","mode","view","precision","perspective","limitations","caption"])
  d[key]=str(r[key],["sourceCredit","limitations","caption"].includes(key)?500:160)||d[key];
 d.imageSrc=source(r.imageSrc);
 d.width=d.imageSrc&&Number.isInteger(r.width)&&r.width>=32&&r.width<=10000?r.width:0;
 d.height=d.imageSrc&&Number.isInteger(r.height)&&r.height>=32&&r.height<=10000?r.height:0;
 if(!d.width||!d.height)d.imageSrc="";
 for(const key of ["origin","direction","refA","refB"]){
  const p=point(r[key]);d[key]=p&&p.x<=d.width&&p.y<=d.height?p:null;
 }
 d.points=(Array.isArray(r.points)?r.points:[]).slice(0,MAX_TRACE_POINTS).map(point).filter(p=>p&&p.x<=d.width&&p.y<=d.height);
 for(const key of ["showGrid","showLine","closeShape","showLabels"])if(typeof r[key]==="boolean")d[key]=r[key];
 if(finite(r.imageOpacity))d.imageOpacity=Math.max(.1,Math.min(1,r.imageOpacity));
 if(!["origin","direction","refA","refB","trace"].includes(d.mode))d.mode="origin";
 if(!["photo","math"].includes(d.view))d.view="photo";
 if(!["primary","secondary","unsure"].includes(d.sourceKind))d.sourceKind="unsure";
 if(!["unsure","front-on","oblique"].includes(d.perspective))d.perspective="unsure";
 if(!["unsure","0","1","2","3","4"].includes(d.precision))d.precision="unsure";
 return d;
}
export function normalizeImageTracer(raw){
 const obj=raw&&typeof raw==="object"&&!Array.isArray(raw)?raw:{};
 const figures=(Array.isArray(obj.figures)?obj.figures:[]).slice(-MAX_TRACE_FIGURES).map(r=>({
  id:str(r?.id,65),entryId:str(r?.entryId,100),savedAt:str(r?.savedAt,40),draft:normalizeTraceDraft(r?.draft)
 })).filter(r=>/^trace-[a-z0-9-]+$/i.test(r.id)&&!!r.draft.imageSrc);
 return {open:obj.open===true,draft:normalizeTraceDraft(obj.draft),figures,
  activeId:figures.some(f=>f.id===obj.activeId)?obj.activeId:""};
}
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function traceCalibration(d){
 if(!d.imageSrc||!d.width)return null;
 if(!d.origin||!d.direction||!d.refA||!d.refB)return null;
 const aligned=dist(d.origin,d.direction),pixelLength=dist(d.refA,d.refB);
 const known=Number(d.knownLength);
 if(aligned<10||pixelLength<5||!Number.isFinite(known)||known<=0)return null;
 const ux=(d.direction.x-d.origin.x)/aligned,uy=(d.direction.y-d.origin.y)/aligned;
 return {origin:d.origin,unitX:{x:ux,y:uy},unitY:{x:uy,y:-ux},
   unitsPerPixel:known/pixelLength,pixelsPerUnit:pixelLength/known,referencePixels:pixelLength,knownLength:known};
}
export function photoToCoordinates(d,at){
 const c=traceCalibration(d);
 if(!c||!point(at))return null;
 const dx=at.x-c.origin.x,dy=at.y-c.origin.y;
 return {x:(dx*c.unitX.x+dy*c.unitX.y)*c.unitsPerPixel,
  y:(dx*c.unitY.x+dy*c.unitY.y)*c.unitsPerPixel};
}
export function coordinatesToPhoto(d,xy){
 const c=traceCalibration(d);
 if(!c||!xy||!finite(xy.x)||!finite(xy.y))return null;
 return {x:c.origin.x+(xy.x*c.unitX.x+xy.y*c.unitY.x)*c.pixelsPerUnit,
  y:c.origin.y+(xy.x*c.unitX.y+xy.y*c.unitY.y)*c.pixelsPerUnit};
}
export const traceCoordinates=d=>d.points.map((p,i)=>({index:i+1,pixel:p,coordinate:photoToCoordinates(d,p)}));
export function tracedMeasurements(d){
 const c=traceCalibration(d),coords=traceCoordinates(d).map(x=>x.coordinate).filter(Boolean);
 if(!c||coords.length<2)return null;
 let perimeter=0;
 for(let i=1;i<coords.length;i++)perimeter+=dist(coords[i],coords[i-1]);
 let area=null;
 if(d.closeShape&&coords.length>2){
  perimeter+=dist(coords[0],coords.at(-1));
  let twice=0;
  for(let i=0;i<coords.length;i++){
   const a=coords[i],b=coords[(i+1)%coords.length];
   twice+=a.x*b.y-b.x*a.y;
  }
  area=Math.abs(twice)/2;
 }
 return {perimeter,area,segments:coords.length-1};
}
export function changeTraceMode(d,mode){
 if(!["origin","direction","refA","refB","trace"].includes(mode))return false;
 d.mode=mode;return true;
}
export function addPhotoPoint(d,at){
 const p=point(at);
 if(!p||p.x>d.width||p.y>d.height||!d.imageSrc)return{ok:false,error:"Choose a point inside the image."};
 if(d.mode==="trace"){
  if(d.points.length>=MAX_TRACE_POINTS)return{ok:false,error:"This tracing has reached the 180-point limit."};
  d.points.push(p);return{ok:true,count:d.points.length};
 }
 d[d.mode]=p;
 if(d.mode==="origin")d.mode="direction";
 else if(d.mode==="direction")d.mode="refA";
 else if(d.mode==="refA")d.mode="refB";
 else if(d.mode==="refB")d.mode="trace";
 return{ok:true,mode:d.mode};
}
export function undoTrace(d){
 if(d.points.length){d.points.pop();return true;}
 const order=["refB","refA","direction","origin"];
 const key=order.find(k=>d[k]);
 if(!key)return false;
 d[key]=null;d.mode=key;return true;
}
export function removeTracePoint(d,index){
 if(!Number.isInteger(index)||index<0||index>=d.points.length)return false;
 d.points.splice(index,1);return true;
}
export function imageTraceChecks(raw){
 const d=normalizeTraceDraft(raw),problems=[],warnings=[];
 const fail=(code,message)=>problems.push({code,message});
 const warn=(code,message)=>warnings.push({code,message});
 if(!d.imageSrc)fail("image","Upload a JPG, PNG or WebP photograph before tracing.");
 if(!d.title.trim())fail("title","Give the figure a descriptive title.");
 if(!d.xLabel.trim()||!d.yLabel.trim())fail("axis-names","Label both coordinate axes.");
 if(!d.unit.trim())fail("units","Enter the real-world unit or clearly defined model unit.");
 if(d.sourceKind==="unsure")fail("source-type","Identify whether this is your own image or an external source.");
 if(d.sourceKind==="secondary"&&!d.sourceCredit.trim())fail("source-credit","Credit the original image and any required permission.");
 if(d.perspective==="unsure")fail("perspective","Check whether the photographed surface is sufficiently front-on for a scale measurement.");
 if(d.precision==="unsure")fail("precision","Choose the number of decimal places to show in the extracted coordinates.");
 if(!d.origin)fail("origin","Mark the mathematical origin O on the image.");
 if(!d.direction)fail("direction","Tap a second point that defines the positive x-axis.");
 if(!d.refA||!d.refB)fail("reference","Mark both ends of a known reference distance.");
 const n=Number(d.knownLength);
 if(!d.knownLength.trim()||!Number.isFinite(n)||n<=0)fail("length","Enter a positive, known distance between reference A and B.");
 const c=traceCalibration(d);
 if(d.imageSrc&&d.origin&&d.direction&&dist(d.origin,d.direction)<10)fail("direction-short","Make the positive x-axis direction longer than 10 pixels.");
 if(d.imageSrc&&d.refA&&d.refB&&dist(d.refA,d.refB)<5)fail("reference-short","The reference points must be visibly distinct.");
 if(!c&&d.origin&&d.direction&&d.refA&&d.refB&&n>0)fail("calibration","Check the origin, axis direction, reference points and distance.");
 if(c&&c.referencePixels<35)warn("small-calibration","A short image reference is vulnerable to marking errors; use a longer known measurement if possible.");
 if(d.perspective==="oblique")warn("perspective-distortion","An oblique view can distort distances and angles. A single scale cannot correct perspective; report this as a limitation or use a front-on photograph.");
 if(d.points.length<2)fail("points","Mark at least two genuine points belonging to the shape or trajectory.");
 if(d.points.length>35&&d.showLabels)warn("labels","Many point labels can become unreadable; hide point labels if the figure is crowded.");
 if(d.closeShape&&d.points.length<3)fail("polygon","A closed shape needs at least three points.");
 if(d.closeShape&&d.points.length>=3)warn("polygon","Shoelace area assumes the selected points form a meaningful, non-self-intersecting boundary in the image plane.");
 if(c&&d.precision!=="unsure"){
  const decimals=Number(d.precision),rounding=10**(-decimals);
  if(rounding<c.unitsPerPixel*.15)warn("precision-overstated","The selected precision is much finer than one pixel of this image. This may imply unjustified accuracy.");
 }
 return {ready:problems.length===0,problems,warnings,calibration:c,draft:d};
}
const esc=escapeGraph;
const nfmt=(n,k=2)=>Number(n.toFixed(k)).toString();
const neatStep=span=>{
 if(!Number.isFinite(span)||span<=0)return 1;
 const b=10**Math.floor(Math.log10(span/6)),f=span/6/b;
 return b*(f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10);
};
function calLines(d){
 const c=traceCalibration(d);
 if(!c||!d.showGrid)return"";
 const corners=[[0,0],[d.width,0],[0,d.height],[d.width,d.height]].map(([x,y])=>photoToCoordinates(d,{x,y}));
 const minX=Math.min(...corners.map(p=>p.x)),maxX=Math.max(...corners.map(p=>p.x));
 const minY=Math.min(...corners.map(p=>p.y)),maxY=Math.max(...corners.map(p=>p.y));
 const sx=neatStep(maxX-minX),sy=neatStep(maxY-minY),step=Math.max(sx,sy);
 let html="";const span=d.width+d.height,stroke=Math.max(1,d.width/900);
 for(const axis of ["x","y"]){
  const min=axis==="x"?minX:minY,max=axis==="x"?maxX:maxY;
  const start=Math.ceil(min/step)*step;
  for(let i=0;i<30;i++){
   const v=start+i*step;if(v>max+step/10000)break;
   const aa=coordinatesToPhoto(d,axis==="x"?{x:v,y:-span*c.unitsPerPixel}:{x:-span*c.unitsPerPixel,y:v});
   const bb=coordinatesToPhoto(d,axis==="x"?{x:v,y:span*c.unitsPerPixel}:{x:span*c.unitsPerPixel,y:v});
   if(aa&&bb)html+='<line x1="'+nfmt(aa.x)+'" y1="'+nfmt(aa.y)+'" x2="'+nfmt(bb.x)+'" y2="'+nfmt(bb.y)+'" stroke="#c7dde2" stroke-width="'+stroke+'" opacity=".75"/>';
  }
 }
 return html;
}
const marker=(p,label,color,size)=>p?'<g><circle cx="'+nfmt(p.x)+'" cy="'+nfmt(p.y)+'" r="'+size+'" fill="'+color+'" stroke="#fff" stroke-width="'+Math.max(1,size/3)+'"/>'+
 '<text x="'+nfmt(p.x+size+3)+'" y="'+nfmt(p.y-size-3)+'" font-size="'+Math.max(12,size*2.2)+'" font-family="Arial,sans-serif" font-weight="700" fill="'+color+'" stroke="#fff" stroke-width="3" paint-order="stroke">'+esc(label)+'</text></g>':"";
export function renderTraceOverlaySvg(raw,{interactive=false,showPhoto=true}={}){
 const d=normalizeTraceDraft(raw),w=d.width||960,h=d.height||600,sz=Math.max(5,Math.min(w,h)/80);
 const c=traceCalibration(d),draw=[];
 const src=d.imageSrc;
 draw.push('<svg xmlns="http://www.w3.org/2000/svg" class="image-trace-svg" data-trace-canvas="'+(interactive?"true":"false")+'" role="img" aria-label="'+esc(d.title||"Photo coordinate tracing")+'" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="xMidYMid meet">');
 draw.push('<rect width="'+w+'" height="'+h+'" fill="#fff"/>');
 if(showPhoto&&src)draw.push('<image href="'+src+'" x="0" y="0" width="'+w+'" height="'+h+'" opacity="'+d.imageOpacity+'" preserveAspectRatio="none"/>');
 draw.push('<g clip-path="url(#trace-clip-'+(interactive?"editor":"export") +')">'+calLines(d)+'</g>');
 draw.push('<defs><clipPath id="trace-clip-'+(interactive?"editor":"export")+'"><rect width="'+w+'" height="'+h+'"/></clipPath></defs>');
 if(c){
  const axisLength=Math.max(w,h)*1.15;
  for(const [vec,title,col] of [[c.unitX,d.xLabel+" ("+d.unit+")","#14675e"],[c.unitY,d.yLabel+" ("+d.unit+")","#2762aa"]]){
   const end={x:c.origin.x+vec.x*axisLength,y:c.origin.y+vec.y*axisLength};
   draw.push('<line x1="'+nfmt(c.origin.x)+'" y1="'+nfmt(c.origin.y)+'" x2="'+nfmt(end.x)+'" y2="'+nfmt(end.y)+'" stroke="'+col+'" stroke-width="'+(sz/3)+'" stroke-dasharray="'+(sz*2)+' '+sz+'" clip-path="url(#trace-clip-'+(interactive?"editor":"export")+')"/>');
   const endpoint={x:c.origin.x+vec.x*Math.min(Math.max(w,h)*.24,130),y:c.origin.y+vec.y*Math.min(Math.max(w,h)*.24,130)};
   draw.push('<text x="'+nfmt(Math.max(5,Math.min(w-100,endpoint.x)))+'" y="'+nfmt(Math.max(18,Math.min(h-5,endpoint.y)))+'" font-size="'+(sz*2.1)+'" fill="'+col+'" stroke="#fff" stroke-width="3" paint-order="stroke" font-family="Arial,sans-serif" font-weight="700">'+esc(title)+'</text>');
  }
 }
 if(d.refA&&d.refB)draw.push('<line x1="'+nfmt(d.refA.x)+'" y1="'+nfmt(d.refA.y)+'" x2="'+nfmt(d.refB.x)+'" y2="'+nfmt(d.refB.y)+'" stroke="#e49a24" stroke-width="'+(sz/1.6)+'" stroke-dasharray="'+sz+' '+sz+'"/>');
 const chain=d.points.map(p=>nfmt(p.x)+","+nfmt(p.y)).join(" ");
 if(d.showLine&&d.points.length>=2)draw.push('<'+(d.closeShape&&d.points.length>=3?"polygon":"polyline")+' points="'+chain+'" fill="'+(d.closeShape&&d.points.length>=3?"#1e80801c":"none")+'" stroke="#c44084" stroke-width="'+Math.max(2,sz*.58)+'" stroke-linecap="round" stroke-linejoin="round"/>');
 draw.push(marker(d.origin,"O","#167f74",sz));
 if(d.direction)draw.push(marker(d.direction,"+x","#167f74",sz*.67));
 if(d.refA)draw.push(marker(d.refA,"A","#c78a20",sz*.73));
 if(d.refB)draw.push(marker(d.refB,"B","#c78a20",sz*.73));
 d.points.forEach((p,i)=>draw.push(marker(p,d.showLabels?"P"+(i+1):"","#c44084",sz*.72)));
 if(interactive)draw.push('<rect data-trace-tap x="0" y="0" width="'+w+'" height="'+h+'" fill="transparent" style="cursor:crosshair;pointer-events:all"/>');
 draw.push('</svg>');return draw.join("");
}
export function renderCleanTraceSvg(raw){
 const d=normalizeTraceDraft(raw),c=traceCalibration(d),data=traceCoordinates(d).filter(r=>r.coordinate);
 const W=960,H=640,plot={x:118,y:100,width:755,height:410};
 let bounds=[-5,5,-5,5];
 if(data.length){
  let xs=data.map(x=>x.coordinate.x).concat([0]),ys=data.map(x=>x.coordinate.y).concat([0]);
  const xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys);
  const span=Math.max(xmax-xmin,ymax-ymin,1e-6);
  const centerX=(xmin+xmax)/2,centerY=(ymin+ymax)/2;
  // Equal physical scale in both directions preserves angles and distances.
  const rangeY=Math.max((ymax-ymin)*1.3,span*1.35,1),rangeX=rangeY*plot.width/plot.height;
  bounds=[centerX-rangeX/2,centerX+rangeX/2,centerY-rangeY/2,centerY+rangeY/2];
 }
 const X=n=>plot.x+(n-bounds[0])/(bounds[1]-bounds[0])*plot.width;
 const Y=n=>plot.y+plot.height-(n-bounds[2])/(bounds[3]-bounds[2])*plot.height;
 let out='<svg xmlns="http://www.w3.org/2000/svg" class="image-trace-svg" role="img" aria-label="'+esc(d.title||"Coordinate plot")+'" viewBox="0 0 '+W+' '+H+'"><rect width="'+W+'" height="'+H+'" fill="#fff"/>';
 out+='<text x="'+W/2+'" y="43" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="21" fill="#264951">'+esc((d.title||"Coordinates from a photograph").slice(0,95))+'</text>';
 out+='<rect x="'+plot.x+'" y="'+plot.y+'" width="'+plot.width+'" height="'+plot.height+'" fill="#fcfdfd" stroke="#aebec6"/>';
 const t=neatStep(bounds[1]-bounds[0]);
 for(const axis of ["x","y"]){
  const low=axis==="x"?bounds[0]:bounds[2],high=axis==="x"?bounds[1]:bounds[3];
  const step=axis==="x"?t:neatStep(bounds[3]-bounds[2]);
  for(let i=0;i<25;i++){
   const value=Math.ceil(low/step)*step+i*step;
   if(value>high)break;
   const loc=axis==="x"?X(value):Y(value);
   if(d.showGrid)out+=axis==="x"?
    '<line x1="'+loc+'" y1="'+plot.y+'" x2="'+loc+'" y2="'+(plot.y+plot.height)+'" stroke="#dfebee"/>':
    '<line x1="'+plot.x+'" y1="'+loc+'" x2="'+(plot.x+plot.width)+'" y2="'+loc+'" stroke="#dfebee"/>';
   const lab=esc(nfmt(value,Math.max(0,Math.min(5,Math.ceil(-Math.log10(step))+1))));
   out+=axis==="x"?
    '<text x="'+loc+'" y="'+(plot.y+plot.height+24)+'" font-family="Arial,sans-serif" font-size="13" text-anchor="middle" fill="#405960">'+lab+'</text>':
    '<text x="'+(plot.x-12)+'" y="'+(loc+5)+'" font-family="Arial,sans-serif" font-size="13" text-anchor="end" fill="#405960">'+lab+'</text>';
  }
 }
 out+='<defs><clipPath id="clean-trace-clip"><rect x="'+plot.x+'" y="'+plot.y+'" width="'+plot.width+'" height="'+plot.height+'"/></clipPath></defs><g clip-path="url(#clean-trace-clip)">';
 const chain=data.map(r=>nfmt(X(r.coordinate.x))+","+nfmt(Y(r.coordinate.y))).join(" ");
 if(d.showLine&&data.length>=2)out+='<'+(d.closeShape&&data.length>=3?"polygon":"polyline")+' points="'+chain+'" fill="'+(d.closeShape&&data.length>=3?"#188a7f17":"none")+'" stroke="#b93f7a" stroke-width="2.9" stroke-linejoin="round"/>';
 for(let i=0;i<data.length;i++){
  const p=data[i].coordinate;
  out+='<circle cx="'+X(p.x)+'" cy="'+Y(p.y)+'" r="4.7" stroke="#fff" stroke-width="1" fill="#c44084"/>';
  if(d.showLabels)out+='<text x="'+(X(p.x)+8)+'" y="'+(Y(p.y)-8)+'" font-family="Arial,sans-serif" font-size="13" fill="#8d315f">'+esc("P"+(i+1))+'</text>';
 }
 out+='</g>';
 const unit=d.unit?(" ("+d.unit+")"):"";
 out+='<text x="'+(plot.x+plot.width/2)+'" y="575" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="17" fill="#264951">'+esc((d.xLabel||"x")+unit)+'</text>';
 out+='<text x="36" y="'+(plot.y+plot.height/2)+'" transform="rotate(-90 36 '+(plot.y+plot.height/2)+')" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="17" fill="#264951">'+esc((d.yLabel||"y")+unit)+'</text>';
 out+='<text x="'+W/2+'" y="617" font-size="12" font-family="Arial,sans-serif" fill="#566d72" text-anchor="middle">Coordinates obtained by marking points on an image; calibration and perspective determine accuracy.</text></svg>';
 return out;
}
export function renderPrintableTraceSvg(d,mode=d.view){
 if(mode==="math")return renderCleanTraceSvg(d);
 const w=960,h=700,top=82,area={x:70,y:top,width:820,height:510};
 const width=d.width||960,height=d.height||600;
 const scale=Math.min(area.width/width,area.height/height),tw=width*scale,th=height*scale,
  px=area.x+(area.width-tw)/2,py=area.y+(area.height-th)/2;
 const inner=renderTraceOverlaySvg(d,{interactive:false});
 // Reuse the generated vector drawing, and keep its embedded image self-contained.
 const start=inner.indexOf(">")+1,end=inner.lastIndexOf("</svg>");
 const body=inner.slice(start,end);
 return '<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'">'+
  '<rect width="'+w+'" height="'+h+'" fill="#fff"/>'+
  '<text x="'+w/2+'" y="40" font-size="21" font-weight="700" text-anchor="middle" font-family="Arial,sans-serif" fill="#23444b">'+esc((d.title||"Image coordinate tracing").slice(0,100))+'</text>'+
  '<svg x="'+px+'" y="'+py+'" width="'+tw+'" height="'+th+'" viewBox="0 0 '+width+' '+height+'">'+body+'</svg>'+
  '<text x="'+w/2+'" y="633" text-anchor="middle" font-size="13" font-family="Arial,sans-serif" fill="#345962">'+
    esc((d.xLabel||"x")+" and "+(d.yLabel||"y")+(d.unit?" measured in "+d.unit:"")+
     (d.knownLength?" · reference length "+d.knownLength+" "+d.unit:""))+'</text>'+
  '<text x="'+w/2+'" y="660" text-anchor="middle" font-size="11" font-family="Arial,sans-serif" fill="#647b7d">'+esc(d.sourceKind==="secondary"?(d.sourceCredit||"Source not supplied"):"Image: student's own photograph")+'</text>'+
  '</svg>';
}
export const traceSignature=d=>JSON.stringify([d.imageSrc,d.width,d.height,d.origin,d.direction,d.refA,d.refB,d.knownLength,d.unit,d.points,d.closeShape,d.precision]);
export function saveTraceFigure(studio,entryId=""){
 const outcome=imageTraceChecks(studio.draft);
 if(!outcome.ready)return{ok:false,error:"Resolve the required image calibration and figure checks before saving.",checks:outcome};
 const id=studio.activeId||"trace-"+Date.now().toString(36)+"-"+Math.floor(Math.random()*9999).toString(36);
 const past=studio.figures.find(x=>x.id===id);
 const record={id,entryId:entryId||past?.entryId||"",savedAt:new Date().toISOString(),draft:normalizeTraceDraft(studio.draft)};
 const index=studio.figures.findIndex(x=>x.id===id);
 if(index<0&&studio.figures.length>=MAX_TRACE_FIGURES)
  return {ok:false,error:"This project has six saved image tracings. Edit an existing tracing or export a project backup before starting another; nothing has been overwritten."};
 if(index>=0)studio.figures[index]=record;
 else studio.figures.push(record);
 studio.activeId=id;
 return {ok:true,record};
}
