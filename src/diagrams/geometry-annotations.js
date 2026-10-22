/**
 * Optional IA construction annotations. These are independent of the closed
 * polygon whose perimeter and area are calculated in Geometry Studio.
 * Every referenced endpoint is a student-entered polygon or auxiliary point;
 * perpendicular heights are calculated from the selected baseline, not drawn
 * freehand or assumed from an unrelated photograph.
 */
export const MAX_GEOMETRY_AUX_POINTS=10,MAX_GEOMETRY_GUIDES=12;
const finite=n=>typeof n==="number"&&Number.isFinite(n)&&Math.abs(n)<=1e5;
const bounded=n=>typeof n==="number"&&Number.isFinite(n)&&Math.abs(n)<=90?n:0;
const text=(s,max)=>typeof s==="string"?s.slice(0,max):"";
export function normalizeAuxPoints(raw){
 return (Array.isArray(raw)?raw:[]).slice(0,MAX_GEOMETRY_AUX_POINTS).map((p,i)=>({
  id:/^p-[a-z0-9-]{1,40}$/i.test(p?.id)?p.id:"p-"+i,
  label:text(p?.label,44),x:finite(p?.x)?p.x:null,y:finite(p?.y)?p.y:null,
  labelDx:bounded(p?.labelDx),labelDy:bounded(p?.labelDy)
 }));
}
export function normalizeGeometryGuides(raw){
 return (Array.isArray(raw)?raw:[]).slice(0,MAX_GEOMETRY_GUIDES).map((g,i)=>({
  id:/^guide-[a-z0-9-]{1,45}$/i.test(g?.id)?g.id:"guide-"+i,
  kind:["solid","dashed","height","north"].includes(g?.kind)?g.kind:"dashed",
  from:text(g?.from,48),to:text(g?.to,48),
  baseStart:text(g?.baseStart,48),baseEnd:text(g?.baseEnd,48),
  label:text(g?.label,100),showLength:g?.showLength===true,
  labelDx:bounded(g?.labelDx),labelDy:bounded(g?.labelDy)
 }));
}
export function geometryPointLookup(d){
 return new Map([...(d.vertices||[]),...(d.auxPoints||[])].map(p=>[p.id,p]));
}
export function projectedHeight(from,a,b){
 if(!from||!a||!b||[from,a,b].some(p=>!finite(p.x)||!finite(p.y)))return null;
 const dx=b.x-a.x,dy=b.y-a.y,sq=dx*dx+dy*dy;
 if(sq<1e-12)return null;
 const t=((from.x-a.x)*dx+(from.y-a.y)*dy)/sq;
 const foot={x:a.x+t*dx,y:a.y+t*dy};
 return {...foot,t,length:Math.hypot(from.x-foot.x,from.y-foot.y)};
}
export function resolvedConstructionGuides(d){
 const lookup=geometryPointLookup(d);
 return (d.guides||[]).map(guide=>{
  const from=lookup.get(guide.from),a=lookup.get(guide.baseStart),b=lookup.get(guide.baseEnd);
  const height=guide.kind==="height"?projectedHeight(from,a,b):null;
  const to=guide.kind==="height"?height:lookup.get(guide.to);
  return {guide,from,to,baseA:a,baseB:b,height,
   length:from&&to&&finite(from.x)&&finite(from.y)&&finite(to.x)&&finite(to.y)?
    Math.hypot(from.x-to.x,from.y-to.y):null};
 });
}
export function geometryAnnotationIssues(d){
 const issues=[],vertices=d.vertices||[],aux=d.auxPoints||[],guides=d.guides||[];
 const points=[...vertices,...aux],names=new Set(),ids=new Set();
 for(const p of points){
  if(ids.has(p.id))issues.push("Construction points need different internal references.");
  ids.add(p.id);
  const label=(p.label||"").trim().toLowerCase();
  if(!label||names.has(label))issues.push("Give each polygon and auxiliary point a different nonempty label.");
  names.add(label);
  if(!finite(p.x)||!finite(p.y))issues.push("Each auxiliary construction point needs valid x and y coordinates.");
 }
 const lookup=geometryPointLookup(d);
 for(const {guide,from,to,baseA,baseB,height} of resolvedConstructionGuides(d)){
  if(guide.kind==="north"){
   if(!from)issues.push("Select an existing starting point for the north-reference line.");
   if(d.mode!=="coordinate"||!d.northAligned)
    issues.push("North-reference lines require coordinate mode and a confirmed east/north orientation.");
   continue;
  }
  if(!from||!to)issues.push("Each construction line must refer to existing points.");
  if(guide.kind==="height"){
   if(!baseA||!baseB||!height)issues.push("Choose a valid baseline with different endpoints for a perpendicular height.");
   if(baseA?.id===baseB?.id)issues.push("A perpendicular height needs two different baseline points.");
  }else if(guide.from===guide.to){
   issues.push("An auxiliary line needs two distinct endpoints.");
  }
  if(guide.showLength&&d.mode!=="coordinate")
   issues.push("Calculated auxiliary lengths need coordinate mode; schematic lengths must be entered as labels.");
  if(guide.kind==="height"&&height&&height.length<1e-8)
   issues.push("The selected height is zero; choose a point away from its baseline.");
 }
 if(guides.length>MAX_GEOMETRY_GUIDES||aux.length>MAX_GEOMETRY_AUX_POINTS)
  issues.push("Too many auxiliary annotations for one figure.");
 return [...new Set(issues)];
}
