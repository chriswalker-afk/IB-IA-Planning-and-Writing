/**
 * Geometry & Measurement Studio. Diagrams are student-authored constructions:
 * schematic vertices never imply accurate scale, distance or angle. Derived
 * quantities are available only when Cartesian coordinates are declared.
 */
export const MAX_GEOMETRY_VERTICES=8,MAX_GEOMETRY_FIGURES=8;
const object=x=>x&&typeof x==="object"&&!Array.isArray(x);
const text=(s,n=220)=>typeof s==="string"?s.slice(0,n):"";
const valid=n=>typeof n==="number"&&Number.isFinite(n)&&Math.abs(n)<=1e5;
const vertex=(id,label,x,y)=>({id,label,x,y,edgeLabel:"",angleLabel:""});
const templates={
 triangle:[vertex("v-a","A",0,0),vertex("v-b","B",7,0),vertex("v-c","C",2.3,4.8)],
 rectangle:[vertex("v-a","A",0,0),vertex("v-b","B",8,0),vertex("v-c","C",8,4),vertex("v-d","D",0,4)],
 polygon:[vertex("v-a","A",0,0),vertex("v-b","B",7,0),vertex("v-c","C",8,4),vertex("v-d","D",3.5,6),vertex("v-e","E",-1,3)]
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
 return {kind:k,title:k==="triangle"?"Labelled triangle":k==="rectangle"?"Dimensioned rectangle":"Geometric construction",
  figureNumber:"1",mode:"schematic",unit:"",sourceKind:"theoretical",sourceCredit:"",
  northAligned:false,showLengths:false,showAngles:false,showBearings:false,
  showGrid:false,showCoordinates:false,filled:false,note:"",edited:false,
  vertices:templates[k].map(v=>({...v}))};
}
export function normalizeGeometryDraft(raw){
 const r=object(raw)?raw:{},d=newGeometryDraft(r.kind);
 for(const key of ["title","figureNumber","unit","sourceCredit","note"]){
  if(typeof r[key]==="string")d[key]=text(r[key],["sourceCredit","note"].includes(key)?800:180);
 }
 if(["schematic","coordinate"].includes(r.mode))d.mode=r.mode;
 if(["primary","secondary","theoretical","unsure"].includes(r.sourceKind))d.sourceKind=r.sourceKind;
 for(const key of ["northAligned","showLengths","showAngles","showBearings","showGrid",
  "showCoordinates","filled","edited"])if(typeof r[key]==="boolean")d[key]=r[key];
 const supplied=Array.isArray(r.vertices)?r.vertices:[];
 if(supplied.length>=3&&supplied.length<=MAX_GEOMETRY_VERTICES){
  d.vertices=supplied.map((v,i)=>({
   id:/^v-[a-z0-9-]{1,38}$/i.test(v?.id)?v.id:"v-"+i,
   label:text(v?.label,44),x:valid(v?.x)?v.x:null,y:valid(v?.y)?v.y:null,
   edgeLabel:text(v?.edgeLabel,100),angleLabel:text(v?.angleLabel,100)
  }));
 }
 if(d.mode!=="coordinate")d.showBearings=false;
 return d;
}
export const newGeometryStudio=()=>({open:false,draft:newGeometryDraft(),figures:[],activeId:""});
export function normalizeGeometryStudio(raw){
 const r=object(raw)?raw:{};
 const figures=(Array.isArray(r.figures)?r.figures:[]).slice(0,MAX_GEOMETRY_FIGURES)
  .filter(object).map(f=>({id:text(f.id,65),entryId:text(f.entryId,80),
   savedAt:text(f.savedAt,42),draft:normalizeGeometryDraft(f.draft)}))
  .filter(f=>/^geometry-[a-z0-9-]+$/i.test(f.id));
 return {open:r.open===true,draft:normalizeGeometryDraft(r.draft),figures,
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
 if(d.vertices.some(v=>v.edgeLabel||v.angleLabel)&&d.mode==="coordinate")
  notes.push("Student-entered side and angle annotations are not verified against coordinate calculations.");
 if(d.mode==="schematic"&&(d.showLengths||d.showAngles))
  notes.push("Automatic length and angle measurements are hidden for schematic diagrams; enter the labels you can justify.");
 return {draft:d,ready:issues.length===0,issues,notes,area,
  lengths:distances,angles,bearings};
}
export const geometrySignature=d=>JSON.stringify([
 d.kind,d.mode,d.unit,d.vertices,d.northAligned,d.showLengths,d.showAngles,d.showBearings,
 d.showCoordinates,d.sourceKind,d.sourceCredit
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
 studio.activeId=id;studio.draft={...record.draft,vertices:record.draft.vertices.map(p=>({...p}))};
 return{ok:true,record};
}
