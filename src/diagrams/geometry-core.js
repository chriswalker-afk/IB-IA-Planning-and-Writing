import {normalizeAuxPoints,normalizeGeometryGuides,geometryAnnotationIssues} from "./geometry-annotations.js";
/**
 * Geometry & Measurement Studio. Diagrams are student-authored constructions:
 * schematic vertices never imply accurate scale, distance or angle. Derived
 * quantities are available only when Cartesian coordinates are declared.
 */
export const MAX_GEOMETRY_VERTICES=8,MAX_GEOMETRY_FIGURES=8;
const object=x=>x&&typeof x==="object"&&!Array.isArray(x);
const text=(s,n=220)=>typeof s==="string"?s.slice(0,n):"";
const valid=n=>typeof n==="number"&&Number.isFinite(n)&&Math.abs(n)<=1e5;
const shift=n=>typeof n==="number"&&Number.isFinite(n)&&Math.abs(n)<=90?n:0;
const digit=(n,defaultValue,max=5)=>Number.isInteger(n)&&n>=0&&n<=max?n:defaultValue;
const vertex=(id,label,x,y)=>({id,label,x,y,edgeLabel:"",angleLabel:"",
 edgeLabelDx:0,edgeLabelDy:0,angleLabelDx:0,angleLabelDy:0,
 pointLabelDx:0,pointLabelDy:0,angleMark:"single",
 edgeConstraint:"free",rightAngle:false,locked:false});
const templates={
 triangle:[vertex("v-a","A",0,0),vertex("v-b","B",7,0),vertex("v-c","C",2.3,4.8)],
 rectangle:[vertex("v-a","A",0,0),vertex("v-b","B",8,0),vertex("v-c","C",8,4),vertex("v-d","D",0,4)],
 polygon:[vertex("v-a","A",0,0),vertex("v-b","B",7,0),vertex("v-c","C",8,4),vertex("v-d","D",3.5,6),vertex("v-e","E",-1,3)],
 "l-shape":[vertex("v-a","A",0,0),vertex("v-b","B",8,0),vertex("v-c","C",8,3),
  vertex("v-d","D",3,3),vertex("v-e","E",3,7),vertex("v-f","F",0,7)],
 "t-shape":[vertex("v-a","A",0,5),vertex("v-b","B",2,5),vertex("v-c","C",2,0),
  vertex("v-d","D",6,0),vertex("v-e","E",6,5),vertex("v-f","F",8,5),
  vertex("v-g","G",8,7),vertex("v-h","H",0,7)]
};
const allowedKinds=Object.keys(templates);
const signedArea=points=>points.reduce((sum,p,i)=>{
 const q=points[(i+1)%points.length];return sum+p.x*q.y-q.x*p.y;
},0)/2;
const orientation=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
const onSegment=(a,b,c)=>Math.min(a.x,b.x)<=c.x+1e-9&&c.x<=Math.max(a.x,b.x)+1e-9&&
 Math.min(a.y,b.y)<=c.y+1e-9&&c.y<=Math.max(a.y,b.y)+1e-9;
function crossing(a,b,c,d){
 const s1=orientation(a,b,c),s2=orientation(a,b,d),s3=orientation(c,d,a),s4=orientation(c,d,b);
 if(s1*s2<0&&s3*s4<0)return true;
 return (Math.abs(s1)<1e-9&&onSegment(a,b,c))||
  (Math.abs(s2)<1e-9&&onSegment(a,b,d))||
  (Math.abs(s3)<1e-9&&onSegment(c,d,a))||
  (Math.abs(s4)<1e-9&&onSegment(c,d,b));
}
export function newGeometryDraft(kind="triangle"){
 const k=allowedKinds.includes(kind)?kind:"triangle";
 return {kind:k,title:k==="triangle"?"Labelled triangle":k==="rectangle"?"Dimensioned rectangle":
  k==="l-shape"?"L-shaped composite region":k==="t-shape"?"T-shaped composite region":"Geometric construction",
  figureNumber:"1",caption:"",showTitle:true,showCaption:false,mode:"schematic",unit:"",sourceKind:"theoretical",sourceCredit:"",
  northAligned:false,showLengths:false,showAngles:false,showBearings:false,
  showGrid:false,showCoordinates:false,showDecomposition:false,showSensitivity:false,
  dimensionStyle:"inline",dimensionOffset:36,lengthFormat:"dp",lengthDigits:2,angleDigits:1,
  sensitivityStep:"",filled:false,note:"",edited:false,provenance:null,
  vertices:templates[k].map(v=>({...v})),auxPoints:[],guides:[]};
}
export function normalizeGeometryDraft(raw){
 const r=object(raw)?raw:{},d=newGeometryDraft(r.kind);
 for(const key of ["title","figureNumber","caption","unit","sourceCredit","note","sensitivityStep"]){
  if(typeof r[key]==="string")d[key]=text(r[key],["sourceCredit","note"].includes(key)?800:180);
 }
 if(["schematic","coordinate"].includes(r.mode))d.mode=r.mode;
 if(["inline","dimension"].includes(r.dimensionStyle))d.dimensionStyle=r.dimensionStyle;
 if(["dp","sf"].includes(r.lengthFormat))d.lengthFormat=r.lengthFormat;
 d.lengthDigits=digit(r.lengthDigits,2);
 d.angleDigits=digit(r.angleDigits,1,3);
 if(Number.isInteger(r.dimensionOffset)&&r.dimensionOffset>=24&&r.dimensionOffset<=85)
  d.dimensionOffset=r.dimensionOffset;
 if(["primary","secondary","theoretical","unsure"].includes(r.sourceKind))d.sourceKind=r.sourceKind;
 for(const key of ["showTitle","showCaption","northAligned","showLengths","showAngles","showBearings","showGrid",
  "showCoordinates","showDecomposition","showSensitivity","filled","edited"])if(typeof r[key]==="boolean")d[key]=r[key];
 const supplied=Array.isArray(r.vertices)?r.vertices:[];
 if(supplied.length>=3&&supplied.length<=MAX_GEOMETRY_VERTICES){
  d.vertices=supplied.map((v,i)=>({
   id:/^v-[a-z0-9-]{1,38}$/i.test(v?.id)?v.id:"v-"+i,
   label:text(v?.label,44),x:valid(v?.x)?v.x:null,y:valid(v?.y)?v.y:null,
   edgeLabel:text(v?.edgeLabel,100),angleLabel:text(v?.angleLabel,100),
   edgeLabelDx:shift(v?.edgeLabelDx),edgeLabelDy:shift(v?.edgeLabelDy),
   angleLabelDx:shift(v?.angleLabelDx),angleLabelDy:shift(v?.angleLabelDy),
   pointLabelDx:shift(v?.pointLabelDx),pointLabelDy:shift(v?.pointLabelDy),
   angleMark:["single","double","triple"].includes(v?.angleMark)?v.angleMark:"single",
   edgeConstraint:["free","horizontal","vertical"].includes(v?.edgeConstraint)?v.edgeConstraint:"free",
   rightAngle:v?.rightAngle===true,locked:v?.locked===true
  }));
 }
 d.auxPoints=normalizeAuxPoints(r.auxPoints);
 d.guides=normalizeGeometryGuides(r.guides);
 if(d.mode!=="coordinate")d.showBearings=false;
 if(object(r.provenance)&&r.provenance.kind==="image-tracer"){
  const p=r.provenance;
  d.provenance={kind:"image-tracer",traceFigureId:text(p.traceFigureId,65),
   traceTitle:text(p.traceTitle,160),imageName:text(p.imageName,160),
   sourceKind:["primary","secondary"].includes(p.sourceKind)?p.sourceKind:"unsure",
   sourceCredit:text(p.sourceCredit,500),perspective:text(p.perspective,30),
   displayPrecision:text(p.displayPrecision,12),knownLength:text(p.knownLength,80),
   referencePixels:valid(p.referencePixels)?p.referencePixels:null,
   unitsPerPixel:valid(p.unitsPerPixel)?p.unitsPerPixel:null,
   limitations:text(p.limitations,500),pixelPoints:(Array.isArray(p.pixelPoints)?p.pixelPoints:[])
     .slice(0,MAX_GEOMETRY_VERTICES).filter(x=>valid(x?.x)&&valid(x?.y))
     .map(x=>({x:x.x,y:x.y}))};
 }
 return d;
}
export const newGeometryStudio=()=>({open:false,zoomed:false,draft:newGeometryDraft(),figures:[],activeId:""});
export function normalizeGeometryStudio(raw){
 const r=object(raw)?raw:{};
 const figures=(Array.isArray(r.figures)?r.figures:[]).slice(0,MAX_GEOMETRY_FIGURES)
  .filter(object).map(f=>({id:text(f.id,65),entryId:text(f.entryId,80),
   savedAt:text(f.savedAt,42),draft:normalizeGeometryDraft(f.draft)}))
  .filter(f=>/^geometry-[a-z0-9-]+$/i.test(f.id));
 return {open:r.open===true,zoomed:r.zoomed===true,draft:normalizeGeometryDraft(r.draft),figures,
  activeId:figures.some(f=>f.id===r.activeId)?r.activeId:""};
}
export function geometryAnalysis(raw){
 const d=normalizeGeometryDraft(raw),points=d.vertices,n=points.length;
 const issues=[],notes=[];
 if(n<3||n>MAX_GEOMETRY_VERTICES)issues.push("Use between 3 and 8 vertices.");
 if(points.some(v=>!valid(v.x)||!valid(v.y)))issues.push("Each point needs finite x and y coordinates.");
 if(points.some((v,i)=>v.label.trim()===""||points.some((u,j)=>j!==i&&u.label.trim().toLowerCase()===v.label.trim().toLowerCase())))
  issues.push("Give every point a different, nonempty label.");
 let area=null,crosses=false,distances=[],angles=[],bearings=[];
 if(!issues.length){
  area=signedArea(points);
  if(Math.abs(area)<1e-9)issues.push("The shape has zero enclosed area. Move its vertices before saving.");
  distances=points.map((p,i)=>Math.hypot(points[(i+1)%n].x-p.x,points[(i+1)%n].y-p.y));
  if(distances.some(v=>v<1e-9))issues.push("Two adjacent points overlap. Separate the vertices.");
  for(let i=0;i<n;i++)for(let j=i+2;j<n;j++){
   if(i===0&&j===n-1)continue;
   if(crossing(points[i],points[(i+1)%n],points[j],points[(j+1)%n]))crosses=true;
  }
  if(crosses)issues.push("The boundary crosses itself. Rearrange points into a simple shape.");
  angles=points.map((p,i)=>{
   const a=points[(i+n-1)%n],b=points[(i+1)%n];
   const ux=a.x-p.x,uy=a.y-p.y,vx=b.x-p.x,vy=b.y-p.y;
   const angle=Math.atan2(Math.abs(ux*vy-uy*vx),ux*vx+uy*vy)*180/Math.PI;
   return orientation(a,p,b)*Math.sign(area)<0?360-angle:angle;
  });
  bearings=points.map((p,i)=>{
   const q=points[(i+1)%n];return (Math.atan2(q.x-p.x,q.y-p.y)*180/Math.PI+360)%360;
  });
 }
 if(d.mode==="schematic")notes.push("Schematic, not necessarily to scale: coordinate distances and angles are not measured values.");
 else notes.push("Coordinate construction: lengths and angles are derived from entered Cartesian coordinates.");
 if(d.mode==="coordinate"&&d.showBearings&&!d.northAligned)
  issues.push("To label bearings, first confirm that positive y points to geographic/grid north and x points east.");
 if(d.mode==="coordinate"&&d.showBearings&&d.northAligned)
  notes.push("Bearings are clockwise from the confirmed north direction; check the coordinate orientation and survey source.");
 if(d.sourceKind==="secondary"&&!d.sourceCredit.trim())
  issues.push("Give the source of secondary measurements or the underlying drawing.");
 if(d.sourceKind==="unsure")notes.push("Explain whether this construction uses hypothetical, measured or published values.");
 for(let i=0;i<n;i++){
  const p=points[i],next=points[(i+1)%n],previous=points[(i+n-1)%n];
  if(!valid(p.x)||!valid(p.y)||!valid(next.x)||!valid(next.y)||!valid(previous.x)||!valid(previous.y))continue;
  const tol=1e-7*Math.max(1,Math.abs(p.x),Math.abs(p.y),Math.abs(next.x),Math.abs(next.y));
  if(p.edgeConstraint==="horizontal"&&Math.abs(next.y-p.y)>tol)
   issues.push("Side "+p.label+" to "+next.label+" is marked horizontal but its endpoint heights differ.");
  if(p.edgeConstraint==="vertical"&&Math.abs(next.x-p.x)>tol)
   issues.push("Side "+p.label+" to "+next.label+" is marked vertical but its endpoint x-values differ.");
  if(p.rightAngle){
   const ux=previous.x-p.x,uy=previous.y-p.y,vx=next.x-p.x,vy=next.y-p.y;
   const lengthProduct=Math.hypot(ux,uy)*Math.hypot(vx,vy);
   if(lengthProduct<=1e-9||Math.abs(ux*vx+uy*vy)/lengthProduct>0.0001||
    (angles.length&&Math.abs(angles[i]-90)>0.05))
    issues.push("Angle at "+p.label+" is marked as a right angle but its sides are not perpendicular.");
  }
 }
 if(d.showSensitivity&&d.mode==="coordinate"){
  const delta=Number(d.sensitivityStep);
  if(!d.sensitivityStep.trim()||!Number.isFinite(delta)||delta<=0||delta>1e4)
   issues.push("Enter a positive coordinate perturbation for the sensitivity check.");
 }
 if(d.provenance?.kind==="image-tracer")
  notes.push("Imported coordinates are a snapshot of Image Tracer. Later edits or recalibrations in the original image do not automatically update this construction.");
 if(d.vertices.some(v=>v.edgeLabel||v.angleLabel)&&d.mode==="coordinate")
  notes.push("Student-entered side and angle annotations are not verified against coordinate calculations.");
 if(d.mode==="schematic"&&(d.showLengths||d.showAngles))
  notes.push("Automatic length and angle measurements are hidden for schematic diagrams; enter the labels you can justify.");
 issues.push(...geometryAnnotationIssues(d));
 if(d.guides.length||d.auxPoints.length)
  notes.push("Auxiliary lines and points are separate from the closed boundary. Heights are exact perpendicular projections on the chosen baseline; schematic labels are not measured values.");
 return {draft:d,ready:issues.length===0,issues,notes,area,
  lengths:distances,angles,bearings};
}
export const geometrySignature=d=>JSON.stringify([
 d.title,d.figureNumber,d.caption,d.showTitle,d.showCaption,
 d.kind,d.mode,d.unit,d.vertices,d.auxPoints,d.guides,
 d.dimensionStyle,d.dimensionOffset,d.lengthFormat,d.lengthDigits,d.angleDigits,
 d.northAligned,d.showLengths,d.showAngles,d.showBearings,d.showGrid,d.filled,
 d.showCoordinates,d.showDecomposition,d.showSensitivity,d.sensitivityStep,d.sourceKind,d.sourceCredit,d.provenance
]);
export function saveGeometryFigure(studio,entryId=""){
 const q=geometryAnalysis(studio?.draft);
 if(!q.ready)return{ok:false,error:q.issues[0],checks:q};
 const prev=studio.figures.find(f=>f.id===studio.activeId);
 if(!prev&&studio.figures.length>=MAX_GEOMETRY_FIGURES)
  return{ok:false,error:"Eight geometry figures are already saved. Existing work was not overwritten."};
 const id=prev?.id||"geometry-"+Date.now().toString(36)+"-"+Math.floor(Math.random()*10000).toString(36);
 const record={id,entryId:entryId||prev?.entryId||"",savedAt:new Date().toISOString(),
  draft:{...q.draft,edited:true}};
 const at=studio.figures.findIndex(f=>f.id===id);
 if(at<0)studio.figures.push(record);else studio.figures[at]=record;
 studio.activeId=id;studio.draft=normalizeGeometryDraft(record.draft);
 return{ok:true,record};
}
