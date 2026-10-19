/**
 * Voronoi Studio: bounded Euclidean nearest-site regions in an explicitly
 * documented Cartesian coordinate system. No web maps, geocoding, or invented
 * site locations. Geometry is computed locally from student-entered points.
 */
import {finiteCell,splitHeading} from "./graph-core.js";
import {parseStatTable} from "./stat-studio-core.js";
import {MAX_IMAGE_CHARS} from "./image-tracer-core.js";
export const MAX_VORONOI_SITES=18,MAX_VORONOI_FIGURES=8,MAX_VORONOI_RAW=20000;
const text=(v,n=160)=>typeof v==="string"?v.slice(0,n):"";
const finite=n=>typeof n==="number"&&Number.isFinite(n);
const object=x=>x&&typeof x==="object"&&!Array.isArray(x);
const safeImage=s=>typeof s==="string"&&s.length<=MAX_IMAGE_CHARS&&/^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(s)?s:"";
const flags=["showGrid","showSites","showLabels","showBisector","showAreas","mapConfirmed","pendingPaste","edited"];
export function newVoronoiDraft(){
 return {raw:"",headers:"yes",sites:[],pendingPaste:false,edited:false,
  title:"",xLabel:"Horizontal coordinate",yLabel:"Vertical coordinate",unitMode:"unsure",unit:"",
  coordSystem:"unsure",metricConfirmed:false,sourceKind:"unsure",sourceCredit:"",
  regionMode:"auto",xMin:"",xMax:"",yMin:"",yMax:"",
  mapSrc:"",mapWidth:0,mapHeight:0,mapName:"",mapCredit:"",mapConfirmed:false,mapOpacity:.42,
  showGrid:true,showSites:true,showLabels:true,showBisector:false,showAreas:false,
  pairA:0,pairB:1,probeX:"",probeY:"",note:"",
  addName:"",addX:"",addY:"",addType:"observed",placeCandidate:false
 };
}
export function normalizeVoronoiDraft(raw){
 const d=newVoronoiDraft(),r=object(raw)?raw:{};
 for(const key of ["raw","headers","title","xLabel","yLabel","unitMode","unit",
  "coordSystem","sourceKind","sourceCredit","regionMode","xMin","xMax","yMin","yMax",
  "mapName","mapCredit","probeX","probeY","note","addName","addX","addY","addType"]){
  if(typeof r[key]==="string")d[key]=text(r[key],key==="raw"?MAX_VORONOI_RAW:
   ["sourceCredit","mapCredit","note"].includes(key)?550:160);
 }
 if(!["yes","no"].includes(d.headers))d.headers="yes";
 if(!["candidate","observed"].includes(d.addType))d.addType="candidate";
 d.placeCandidate=r.placeCandidate===true;
 if(!["unsure","unit","dimensionless"].includes(d.unitMode))d.unitMode="unsure";
 if(!["unsure","cartesian","latlon"].includes(d.coordSystem))d.coordSystem="unsure";
 if(!["unsure","primary","secondary"].includes(d.sourceKind))d.sourceKind="unsure";
 if(!["auto","manual","interactive"].includes(d.regionMode))d.regionMode="auto";
 d.sites=(Array.isArray(r.sites)?r.sites:[]).slice(0,MAX_VORONOI_SITES)
  .filter(object).map((s,i)=>({id:/^s-[a-z0-9-]{1,42}$/i.test(s.id)?s.id:"s-"+i,
    name:text(s.name,42),x:finite(s.x)?s.x:null,y:finite(s.y)?s.y:null,
    kind:s.kind==="candidate"?"candidate":"observed"}));
 for(const flag of flags)if(typeof r[flag]==="boolean")d[flag]=r[flag];
 d.metricConfirmed=r.metricConfirmed===true;
 d.pairA=Number.isInteger(r.pairA)&&r.pairA>=0&&r.pairA<d.sites.length?r.pairA:0;
 d.pairB=Number.isInteger(r.pairB)&&r.pairB>=0&&r.pairB<d.sites.length?r.pairB:1;
 d.mapSrc=safeImage(r.mapSrc);
 d.mapWidth=d.mapSrc&&Number.isInteger(r.mapWidth)&&r.mapWidth>=32&&r.mapWidth<=10000?r.mapWidth:0;
 d.mapHeight=d.mapSrc&&Number.isInteger(r.mapHeight)&&r.mapHeight>=32&&r.mapHeight<=10000?r.mapHeight:0;
 if(!d.mapWidth||!d.mapHeight)d.mapSrc="";
 if(finite(r.mapOpacity))d.mapOpacity=Math.max(.15,Math.min(.85,r.mapOpacity));
 return d;
}
export const newVoronoiStudio=()=>({open:false,draft:newVoronoiDraft(),figures:[],activeId:"",
 tool:"existing",selectedSiteId:"",keyboardCursor:{x:5,y:5},cursorVisible:false,history:{past:[],future:[]},
 scenario:{active:false,before:null,showOriginal:false}});
export function normalizeVoronoiStudio(raw){
 const r=object(raw)?raw:{};
 const figures=(Array.isArray(r.figures)?r.figures:[]).slice(0,MAX_VORONOI_FIGURES)
  .filter(object).map(f=>({id:text(f.id,65),entryId:text(f.entryId,80),savedAt:text(f.savedAt,42),
   draft:normalizeVoronoiDraft(f.draft)})).filter(f=>/^voronoi-[a-z0-9-]+$/i.test(f.id));
 const draft=normalizeVoronoiDraft(r.draft);
 const frameKeys=["sites","raw","headers","edited","pendingPaste","pairA","pairB","probeX","probeY",
  "showBisector","regionMode","xMin","xMax","yMin","yMax","xLabel","yLabel","unitMode","unit"];
 const frame=raw=>{
  if(!object(raw)||!Array.isArray(raw.sites))return null;
  const clean=normalizeVoronoiDraft(raw),out={};
  for(const key of frameKeys)out[key]=clean[key];
  return out;
 };
 const history=object(r.history)?r.history:{};
 const past=(Array.isArray(history.past)?history.past:[]).slice(-24).map(frame).filter(Boolean);
 const future=(Array.isArray(history.future)?history.future:[]).slice(-24).map(frame).filter(Boolean);
 const scenario=object(r.scenario)?r.scenario:{},original=frame(scenario.before);
 const tool=["existing","select","inspect","test","candidate"].includes(r.tool)?r.tool:
  draft.placeCandidate?"candidate":draft.sites.length?"select":"existing";
 return {open:r.open===true,draft,figures,
  activeId:figures.some(f=>f.id===r.activeId)?r.activeId:"",
  tool,selectedSiteId:draft.sites.some(s=>s.id===r.selectedSiteId)?r.selectedSiteId:"",
  keyboardCursor:{x:finite(r.keyboardCursor?.x)?r.keyboardCursor.x:5,
   y:finite(r.keyboardCursor?.y)?r.keyboardCursor.y:5},cursorVisible:r.cursorVisible===true,
  history:{past,future},scenario:{active:scenario.active===true&&!!original,
   before:scenario.active===true?original:null,showOriginal:scenario.showOriginal===true&&!!original}};

}
export function parseVoronoiSites(raw,headers="yes"){
 if(String(raw||"").length>MAX_VORONOI_RAW)throw new Error("Choose a smaller site list (at most 20,000 characters).");
 const parsed=parseStatTable(raw,headers,"box");
 if(![2,3].includes(parsed.columns.length))
  throw new Error("Paste 2 columns (x, y) or 3 columns (site name, x, y), preferably with headings.");
 if(parsed.matrix.length>MAX_VORONOI_SITES)
  throw new Error("Use no more than 18 sites so cell boundaries and labels remain readable.");
 if(parsed.matrix.length<2)throw new Error("At least two distinct sites are needed.");
 const three=parsed.columns.length===3,sites=parsed.matrix.map((row,i)=>{
  const name=three?row[0].trim():"Site "+(i+1),x=finiteCell(row[three?1:0]),y=finiteCell(row[three?2:1]);
  if(!name||name.length>42||x===null||y===null||Math.abs(x)>1e8||Math.abs(y)>1e8)
   throw new Error("Check row "+(i+1)+": every site needs a short name and two finite Cartesian coordinates.");
  return {id:"s-"+i,name,x,y,kind:"observed"};
 });
 const seen=new Set();
 for(const s of sites){
  if(seen.has(s.name.toLowerCase()))throw new Error("Each site needs a different name: '"+s.name+"'.");
  seen.add(s.name.toLowerCase());
 }
 for(let i=0;i<sites.length;i++)for(let j=i+1;j<sites.length;j++)
  if(Math.hypot(sites[i].x-sites[j].x,sites[i].y-sites[j].y)<1e-9)
   throw new Error("Two sites share the same coordinates. Resolve this before constructing cells.");
 const hx=splitHeading(parsed.columns[three?1:0]),hy=splitHeading(parsed.columns[three?2:1]);
 return {sites,columns:parsed.columns,hasHeaders:parsed.hasHeaders,x: hx,y:hy};
}
export function importVoronoiSites(studio,raw){
 const d=studio.draft,parsed=parseVoronoiSites(raw,d.headers);
 d.raw=String(raw);d.sites=parsed.sites;d.edited=false;d.pendingPaste=false;d.pairA=0;d.pairB=1;
 if(d.regionMode==="interactive")d.regionMode="auto";
 if(parsed.hasHeaders){
  if(parsed.x.label)d.xLabel=parsed.x.label;
  if(parsed.y.label)d.yLabel=parsed.y.label;
  if(parsed.x.unit&&parsed.x.unit===parsed.y.unit){
   d.unit=parsed.x.unit;d.unitMode="unit";
  }
 }
 return {sites:parsed.sites.length,hasHeaders:parsed.hasHeaders};
}
const positiveArea=poly=>Math.abs(poly.reduce((s,p,i)=>{
 const q=poly[(i+1)%poly.length];return s+p.x*q.y-q.x*p.y;
},0))/2;
/** Clip a polygon to all points nearer site A than site B. */
export function clipNearest(poly,a,b){
 if(!poly.length)return[];
 const nx=b.x-a.x,ny=b.y-a.y;
 // Relative form avoids squaring large coordinate values:
 // (x - (a+b)/2) dot (b-a) <= 0.
 const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
 const signed=p=>(p.x-mx)*nx+(p.y-my)*ny;
 const magnitude=Math.max(1,...poly.map(p=>Math.abs(signed(p))));
 const eps=1e-12*magnitude;
 const out=[];
 let previous=poly[poly.length-1],fPrev=signed(previous),insidePrev=fPrev<=eps;
 for(const next of poly){
  const fNext=signed(next),insideNext=fNext<=eps;
  if(insidePrev!==insideNext){
   const denom=fPrev-fNext;
   if(Math.abs(denom)>1e-20){
    const t=Math.max(0,Math.min(1,fPrev/denom));
    out.push({x:previous.x+t*(next.x-previous.x),y:previous.y+t*(next.y-previous.y)});
   }
  }
  if(insideNext)out.push({x:next.x,y:next.y});
  previous=next;fPrev=fNext;insidePrev=insideNext;
 }
 return out;
}
export function voronoiCells(sites,bounds){
 const rect=[{x:bounds.xMin,y:bounds.yMin},{x:bounds.xMax,y:bounds.yMin},
  {x:bounds.xMax,y:bounds.yMax},{x:bounds.xMin,y:bounds.yMax}];
 return sites.map((site,i)=>{
  let polygon=rect;
  sites.forEach((other,j)=>{if(j!==i)polygon=clipNearest(polygon,site,other);});
  return {name:site.name,site,polygon,area:polygon.length>=3?positiveArea(polygon):0};
 });
}
export function voronoiBounds(d){
 const sites=d.sites;
 if(d.regionMode==="manual"||d.regionMode==="interactive"){
  const raw=[d.xMin,d.xMax,d.yMin,d.yMax];
  if(raw.some(x=>!String(x).trim()))return null;
  const vals=raw.map(finiteCell);
  if(vals.some(x=>x===null))return null;
  const [xMin,xMax,yMin,yMax]=vals;
  if(xMax<=xMin||yMax<=yMin)return null;
  return {xMin,xMax,yMin,yMax,manual:d.regionMode==="manual"};
 }
 if(!sites.length)return null;
 const xs=sites.map(s=>s.x).filter(finite),ys=sites.map(s=>s.y).filter(finite);
 if(!xs.length||!ys.length)return null;
 const xMin=Math.min(...xs),xMax=Math.max(...xs),yMin=Math.min(...ys),yMax=Math.max(...ys);
 const pad=Math.max((xMax-xMin)*.18,(yMax-yMin)*.18,Math.abs(xMax)*.002,Math.abs(yMax)*.002,1e-5);
 return {xMin:xMin-pad,xMax:xMax+pad,yMin:yMin-pad,yMax:yMax+pad,manual:false};
}
export function nearestSite(sites,at){
 if(!sites.length||!finite(at?.x)||!finite(at?.y))return null;
 const candidates=sites.map((site,i)=>({...site,index:i,distance:Math.hypot(at.x-site.x,at.y-site.y)}))
  .sort((a,b)=>a.distance-b.distance||a.index-b.index);
 const tied=candidates.filter(x=>Math.abs(x.distance-candidates[0].distance)<=1e-9*Math.max(1,x.distance));
 return {name:candidates[0].name,distance:candidates[0].distance,tied:tied.map(x=>x.name),index:candidates[0].index};
}
export function bisectorInBounds(a,b,bounds){
 const mx=(a.x+b.x)/2,my=(a.y+b.y)/2,dx=-(b.y-a.y),dy=b.x-a.x;
 const candidates=[];
 // p = midpoint + t * perpendicular_direction, intersect boundary lines.
 const add=(t)=>{if(!Number.isFinite(t))return;const p={x:mx+t*dx,y:my+t*dy};
  const e=1e-8*Math.max(1,bounds.xMax-bounds.xMin,bounds.yMax-bounds.yMin);
  if(p.x>=bounds.xMin-e&&p.x<=bounds.xMax+e&&p.y>=bounds.yMin-e&&p.y<=bounds.yMax+e)
   candidates.push(p);
 };
 if(Math.abs(dx)>1e-15){add((bounds.xMin-mx)/dx);add((bounds.xMax-mx)/dx);}
 if(Math.abs(dy)>1e-15){add((bounds.yMin-my)/dy);add((bounds.yMax-my)/dy);}
 const unique=candidates.filter((p,i)=>candidates.findIndex(q=>Math.hypot(q.x-p.x,q.y-p.y)<1e-8)===i);
 if(unique.length<2)return null;
 let max=0,pair=null;
 for(let i=0;i<unique.length;i++)for(let j=i+1;j<unique.length;j++){
  const dist=Math.hypot(unique[i].x-unique[j].x,unique[i].y-unique[j].y);
  if(dist>max){max=dist;pair=[unique[i],unique[j]];}
 }
 return pair;
}
export function analyzeVoronoi(raw){
 const d=normalizeVoronoiDraft(raw),errors=[],warnings=[];
 const fail=(code,message)=>errors.push({code,message}),warn=(code,message)=>warnings.push({code,message});
 if(!d.title.trim()||d.title.length>95)fail("title","Use a concise descriptive title (up to 95 characters).");
 if(!d.xLabel.trim()||!d.yLabel.trim())fail("axes","Label both Cartesian axes meaningfully.");
 if(d.unitMode==="unsure")fail("units","Confirm the coordinate unit or mark the coordinates dimensionless.");
 if(d.unitMode==="unit"&&!d.unit.trim())fail("unit","Supply the coordinate distance unit, used on both axes.");
 if(d.coordSystem==="unsure")fail("projection","Confirm that coordinates use a Cartesian or appropriately projected system.");
 if(d.coordSystem==="latlon")fail("latlon","Latitude and longitude in degrees are not planar distances. Convert to a suitable projected coordinate system first.");
 if(!d.metricConfirmed)fail("metric","Confirm that straight-line Euclidean distance is justified for this question.");
 if(d.sourceKind==="unsure")fail("source","Say whether the site locations are your own measurements or secondary data.");
 if(d.sourceKind==="secondary"&&!d.sourceCredit.trim())fail("source-credit","Credit the original site coordinate dataset.");
 if(d.pendingPaste)fail("stale","You changed the pasted cells. Read the latest data before saving or exporting.");
 if(d.sites.length<2)fail("sites","Enter or import at least two real, distinct site coordinates.");
 if(d.sites.length>MAX_VORONOI_SITES)fail("site-limit","Use at most 18 sites per diagram.");
 if(d.sites.some(s=>!s.name.trim()||!finite(s.x)||!finite(s.y)||Math.abs(s.x)>1e8||Math.abs(s.y)>1e8))
  fail("invalid-site","Every site needs a distinct, short name and finite x and y values.");
 if(new Set(d.sites.map(s=>s.name.toLowerCase().trim())).size!==d.sites.length)
  fail("duplicate-names","Site names must be distinct.");
 for(let i=0;i<d.sites.length;i++)for(let j=i+1;j<d.sites.length;j++)
  if(Math.hypot(d.sites[i].x-d.sites[j].x,d.sites[i].y-d.sites[j].y)<1e-9)
   fail("coincident","Two sites have identical locations; their Voronoi regions cannot be distinguished.");
 let bounds=voronoiBounds(d);
 if(["manual","interactive"].includes(d.regionMode)&&!bounds)fail("bounds","Define finite xmin, xmax, ymin and ymax, with positive widths.");
 if(bounds){
  if(bounds.xMax-bounds.xMin<1e-10||bounds.yMax-bounds.yMin<1e-10)
   fail("collapsed-domain","The study area is too narrow to make a legible diagram.");
  if(d.sites.some(s=>s.x<bounds.xMin||s.x>bounds.xMax||s.y<bounds.yMin||s.y>bounds.yMax))
   fail("site-outside","All sites must be inside the displayed study rectangle. Expand it or check coordinates.");
 }
 if(d.regionMode==="auto")warn("auto-window",
  "This is an automatically padded rectangular viewing window, not a real geographic or administrative boundary. Region areas depend on the chosen window.");
 else if(d.regionMode==="interactive")warn("working-window",
  "This is a working coordinate rectangle, not a justified geographical boundary. Clipped cell areas depend on the chosen limits.");
 else warn("study-area","Cells are clipped to your chosen rectangle. This is only the actual study area if you can justify its bounds.");
 warn("metric-assumption","Voronoi cells compare straight-line distances, not road travel times, cost, safety, catchment demand or optimal facility location.");
 if(d.sites.length>10)warn("many-sites","Site labels may be crowded. Consider a smaller justified investigation area or fewer locations.");
 if(d.edited)warn("edited","Site locations were changed after importing. Check source accuracy and document changes.");
 if(d.sites.some(s=>s.kind==="candidate"))warn("candidate",
  "A proposed candidate is a hypothetical location. Distinguish this what-if geometry from existing site locations and do not claim an optimum from the tessellation alone.");
 if(d.showAreas)warn("area-context","Cell areas refer only to this rectangular domain, in squared coordinate units; they do not measure population or demand.");
 let mapRatio=null;
 if(d.mapSrc){
  if(!d.mapCredit.trim())fail("map-credit","Give the source of the background map or photograph.");
  if(!d.mapConfirmed)fail("map-calibration",
   "Confirm the image represents exactly the specified rectangular coordinate extent, without perspective or projection distortion.");
  if(d.regionMode!=="manual")fail("map-bounds","A background map needs explicit axis bounds for its four edges.");
  if(bounds&&d.mapWidth&&d.mapHeight){
   const worldRatio=(bounds.xMax-bounds.xMin)/(bounds.yMax-bounds.yMin);
   mapRatio=worldRatio/(d.mapWidth/d.mapHeight);
   if(Math.abs(mapRatio-1)>.05)fail("map-ratio",
    "The mapped rectangle and image aspect ratios disagree by over 5%. Check image crop, coordinate calibration and units; stretching would misrepresent distances.");
  }
 }
 const probePresent=Boolean(d.probeX.trim()||d.probeY.trim());
 const probeX=finiteCell(d.probeX),probeY=finiteCell(d.probeY);
 if(probePresent&&(probeX===null||probeY===null))fail("probe","Enter both numeric coordinates for the optional test location.");
 const probe=probePresent&&probeX!==null&&probeY!==null?{x:probeX,y:probeY}:null;
 if(probe&&bounds&&(probe.x<bounds.xMin||probe.x>bounds.xMax||probe.y<bounds.yMin||probe.y>bounds.yMax))
  fail("probe-outside","The test location must be inside the displayed study rectangle.");
 if(d.showBisector&&(!d.sites[d.pairA]||!d.sites[d.pairB]||d.pairA===d.pairB))
  fail("bisector-sites","Choose two different sites to show their perpendicular bisector.");
 const canCompute=bounds&&d.sites.length>=2&&!errors.some(e=>[
  "invalid-site","duplicate-names","coincident","site-outside","bounds","collapsed-domain","sites"].includes(e.code));
 const cells=canCompute?voronoiCells(d.sites,bounds):[];
 const area=cells.reduce((a,c)=>a+c.area,0),domainArea=bounds?(bounds.xMax-bounds.xMin)*(bounds.yMax-bounds.yMin):0;
 if(cells.length&&Math.abs(area-domainArea)>1e-6*Math.max(1,domainArea))
  fail("cell-area","Unable to verify that the cells cover the stated domain without gaps or overlaps.");
 return {ready:errors.length===0,errors,warnings,draft:d,bounds,cells,probe,
  nearest:probe?nearestSite(d.sites,probe):null,mapRatio,domainArea};
}
export const voronoiSignature=d=>JSON.stringify([d.sites,d.coordSystem,d.unitMode,d.unit,d.regionMode,
 d.xMin,d.xMax,d.yMin,d.yMax,d.metricConfirmed,d.probeX,d.probeY,d.mapSrc,d.mapConfirmed]);
export function saveVoronoiFigure(studio,entryId=""){
 const q=analyzeVoronoi(studio.draft);
 if(!q.ready)return {ok:false,error:"Resolve the Voronoi coordinate, projection and source checks before saving.",checks:q};
 const prev=studio.figures.find(x=>x.id===studio.activeId);
 if(!prev&&studio.figures.length>=MAX_VORONOI_FIGURES)
  return {ok:false,error:"Eight saved Voronoi diagrams already exist. Earlier student work has not been overwritten."};
 const id=prev?.id||"voronoi-"+Date.now().toString(36)+"-"+Math.floor(Math.random()*10000).toString(36);
 const record={id,entryId:entryId||prev?.entryId||"",savedAt:new Date().toISOString(),draft:q.draft};
 const index=studio.figures.findIndex(f=>f.id===id);
 if(index<0)studio.figures.push(record);else studio.figures[index]=record;
 studio.activeId=id;return {ok:true,record};
}
