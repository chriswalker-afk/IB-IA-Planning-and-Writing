/**
 * Advanced geometry: exact orthogonal partitions, explicitly requested
 * construction snaps, one-at-a-time sensitivity and calibrated tracer import.
 * Does not infer a proof, a physical measurement uncertainty or a curve fit.
 */
import {geometryAnalysis,newGeometryDraft,normalizeGeometryDraft,MAX_GEOMETRY_VERTICES} from "./geometry-core.js";
import {imageTraceChecks,traceCalibration,traceCoordinates} from "./image-tracer-core.js";

const finite=v=>typeof v==="number"&&Number.isFinite(v)&&Math.abs(v)<=1e5;
const near=(a,b,eps=1e-8)=>Math.abs(a-b)<=eps*Math.max(1,Math.abs(a),Math.abs(b));
export function orthogonalDecomposition(raw){
 const d=normalizeGeometryDraft(raw),p=d.vertices;
 if(p.length<4||p.some(v=>!finite(v.x)||!finite(v.y)))
  return {ok:false,reason:"Enter at least four valid vertices for a rectangular decomposition.",rectangles:[]};
 const xs=[...new Set(p.map(v=>v.x))].sort((a,b)=>a-b);
 for(let i=0;i<p.length;i++){
  const a=p[i],b=p[(i+1)%p.length];
  if(!near(a.x,b.x)&&!near(a.y,b.y))
   return {ok:false,reason:"A rectangular decomposition needs horizontal and vertical sides.",rectangles:[]};
 }
 const rectangles=[];
 for(let i=0;i<xs.length-1;i++){
  const [left,right]=[xs[i],xs[i+1]];
  if(right-left<1e-9)continue;
  const middle=(left+right)/2,crossings=[];
  for(let j=0;j<p.length;j++){
   const a=p[j],b=p[(j+1)%p.length];
   if(near(a.y,b.y)&&middle>Math.min(a.x,b.x)+1e-9&&middle<Math.max(a.x,b.x)-1e-9)
    crossings.push(a.y);
  }
  crossings.sort((a,b)=>a-b);
  if(crossings.length%2!==0)
   return {ok:false,reason:"The boundary does not form valid rectangular strips.",rectangles:[]};
  for(let j=0;j<crossings.length;j+=2){
   const [bottom,top]=[crossings[j],crossings[j+1]];
   if(top-bottom>1e-9)rectangles.push({x0:left,x1:right,y0:bottom,y1:top,
    width:right-left,height:top-bottom,area:(right-left)*(top-bottom)});
  }
 }
 const polygonArea=Math.abs(p.reduce((a,v,i)=>{
  const next=p[(i+1)%p.length];return a+v.x*next.y-next.x*v.y;
 },0)/2),combined=rectangles.reduce((sum,r)=>sum+r.area,0);
 if(!rectangles.length||!near(polygonArea,combined,1e-7))
  return {ok:false,reason:"The rectangular strips do not match this polygon's area. Check for a crossing or hole.",rectangles:[]};
 return {ok:true,rectangles,area:combined};
}
export function geometrySensitivity(raw){
 const d=normalizeGeometryDraft(raw);
 if(d.mode!=="coordinate")return{ok:false,reason:"Sensitivity needs coordinate-based geometry."};
 const delta=Number(d.sensitivityStep);
 if(!d.sensitivityStep.trim()||!Number.isFinite(delta)||delta<=0)
  return{ok:false,reason:"Enter a positive perturbation in coordinate units."};
 const original={...d,showSensitivity:false},base=geometryAnalysis(original);
 if(!base.ready)return {ok:false,reason:base.issues[0]};
 const baseArea=Math.abs(base.area),basePerimeter=base.lengths.reduce((sum,n)=>sum+n,0);
 let maxArea=0,maxPerimeter=0,samples=0,skipped=0;
 for(let i=0;i<d.vertices.length;i++){
  for(const axis of ["x","y"])for(const sign of [-1,1]){
   const shifted={...original,vertices:original.vertices.map(v=>({...v}))};
   shifted.vertices[i][axis]+=sign*delta;
   // Sensitivity is a local mathematical thought experiment, not a
   // construction constraint test or a simultaneous uncertainty bound.
   for(const v of shifted.vertices){v.edgeConstraint="free";v.rightAngle=false;}
   const a=geometryAnalysis(shifted);
   if(!a.ready){skipped++;continue;}
   samples++;
   maxArea=Math.max(maxArea,Math.abs(Math.abs(a.area)-baseArea));
   maxPerimeter=Math.max(maxPerimeter,Math.abs(a.lengths.reduce((sum,n)=>sum+n,0)-basePerimeter));
  }
 }
 if(!samples)return{ok:false,reason:"No nearby valid polygons were found for the selected perturbation."};
 return{ok:true,delta,area:baseArea,perimeter:basePerimeter,
  maxAreaChange:maxArea,maxPerimeterChange:maxPerimeter,samples,skipped,
  explanation:"Single coordinate varied by ±"+delta+" at a time; "+samples+" valid nearby constructions compared. "+
   "This is not a worst-case bound, a probability interval, or measured instrument uncertainty."};
}
export function snapGeometryEdge(studio,index){
 const d=studio?.draft,p=d?.vertices?.[index],q=d?.vertices?.[(index+1)%d.vertices.length];
 if(!p||!q||!["horizontal","vertical"].includes(p.edgeConstraint))
  return{ok:false,error:"Choose horizontal or vertical for this side first."};
 if(q.locked)return{ok:false,error:"Unlock the next point before aligning this side."};
 if(!finite(p.x)||!finite(p.y)||!finite(q.x)||!finite(q.y))
  return{ok:false,error:"Enter valid coordinates first."};
 if(p.edgeConstraint==="horizontal")q.y=p.y;
 else q.x=p.x;
 d.edited=true;return{ok:true};
}
export function snapGeometryRightAngle(studio,index){
 const d=studio?.draft,p=d?.vertices?.[index];
 if(!p||!p.rightAngle)return{ok:false,error:"Choose a right-angle check at this vertex first."};
 const n=d.vertices.length,a=d.vertices[(index+n-1)%n],q=d.vertices[(index+1)%n];
 if(q.locked)return{ok:false,error:"Unlock the next point before constructing this right angle."};
 if([p,a,q].some(v=>!finite(v.x)||!finite(v.y)))
  return{ok:false,error:"Enter valid coordinates first."};
 const dx=a.x-p.x,dy=a.y-p.y,bx=q.x-p.x,by=q.y-p.y;
 const before=Math.hypot(dx,dy),length=Math.hypot(bx,by);
 if(before<1e-8||length<1e-8)return{ok:false,error:"Both adjacent sides must have a non-zero length."};
 const ux=-dy/before,uy=dx/before;
 const direction=ux*bx+uy*by>=0?1:-1;
 q.x=Number((p.x+direction*ux*length).toFixed(8));
 q.y=Number((p.y+direction*uy*length).toFixed(8));
 d.edited=true;return{ok:true};
}
export function moveGeometryVertex(studio,index,x,y){
 const p=studio?.draft?.vertices?.[index];
 if(!p||p.locked||!finite(x)||!finite(y))return false;
 p.x=x;p.y=y;studio.draft.edited=true;return true;
}
/** One-way snapshot import. No raster image is copied into geometry project data. */
export function geometryFromTrace(source,{traceFigureId=""}={}){
 const checks=imageTraceChecks(source),d=checks.draft;
 if(!checks.ready)return{ok:false,error:"Complete and validate the Image Tracer calibration, source and point checks first."};
 if(d.perspective!=="front-on")return{ok:false,error:"Use a front-on image. An oblique photograph cannot be corrected by one scale reference."};
 if(!d.closeShape||d.points.length<3||d.points.length>MAX_GEOMETRY_VERTICES)
  return{ok:false,error:"Mark a closed, ordered outline with 3–8 points in Image Tracer first."};
 const c=traceCalibration(d),list=traceCoordinates(d);
 if(!c||list.some(v=>!v.coordinate))return{ok:false,error:"The traced coordinates cannot be calculated from this calibration."};
 const shape=newGeometryDraft("polygon");
 shape.title=(d.title||"Traced outline")+" — geometric model";
 shape.mode="coordinate";shape.unit=d.unit;shape.sourceKind=d.sourceKind;
 shape.sourceCredit=d.sourceCredit;shape.note=[
  "Coordinates transferred from a student-calibrated, front-on image; check perspective and scale.",
  d.limitations
 ].filter(Boolean).join(" ");
 shape.vertices=list.map((v,i)=>({
  id:"v-"+i,label:String.fromCharCode(65+i),x:v.coordinate.x,y:v.coordinate.y,
  edgeLabel:"",angleLabel:"",edgeConstraint:"free",rightAngle:false,locked:false
 }));
 shape.provenance={kind:"image-tracer",traceFigureId,traceTitle:d.title,imageName:d.imageName,
  sourceKind:d.sourceKind,sourceCredit:d.sourceCredit,perspective:d.perspective,
  displayPrecision:d.precision,knownLength:d.knownLength,
  referencePixels:c.referencePixels,unitsPerPixel:c.unitsPerPixel,
  limitations:d.limitations,pixelPoints:d.points.map(p=>({x:p.x,y:p.y}))};
 shape.edited=true;
 const ready=geometryAnalysis(shape);
 if(!ready.ready)return{ok:false,error:"The traced polygon needs checking: "+ready.issues[0]};
 return{ok:true,draft:shape,points:shape.vertices.length,source:traceFigureId||"working tracer draft"};
}
