/** Interactive Voronoi editing. Source coordinates are never silently replaced.
 * Geometry history is deliberately small and does not duplicate uploaded map images.
 */
import {analyzeVoronoi,voronoiBounds,nearestSite,MAX_VORONOI_SITES} from "./voronoi-core.js";

export const VORONOI_TOOLS=["existing","select","inspect","test","candidate"];
export const VORONOI_HISTORY_LIMIT=24;
export const VORONOI_STARTER_BOUNDS=Object.freeze({xMin:0,xMax:10,yMin:0,yMax:10,starter:true});
const FRAME_KEYS=["sites","raw","headers","edited","pendingPaste","pairA","pairB","probeX","probeY",
 "showBisector","regionMode","xMin","xMax","yMin","yMax","xLabel","yLabel","unitMode","unit"];
const clone=x=>JSON.parse(JSON.stringify(x));
const finite=n=>typeof n==="number"&&Number.isFinite(n);
export const displayVoronoiBounds=d=>voronoiBounds(d)||{...VORONOI_STARTER_BOUNDS};
export function voronoiFrame(d){
 const result={};
 for(const key of FRAME_KEYS)result[key]=clone(d[key]??(key==="sites"?[]:""));
 return result;
}
export function recordVoronoiHistory(studio,before){
 if(!studio||!before)return false;
 if(JSON.stringify(before)===JSON.stringify(voronoiFrame(studio.draft)))return false;
 studio.history??={past:[],future:[]};
 studio.history.past.push(before);
 studio.history.past=studio.history.past.slice(-VORONOI_HISTORY_LIMIT);
 studio.history.future=[];
 return true;
}
export function applyVoronoiFrame(d,frame){
 if(!frame||!Array.isArray(frame.sites))return false;
 for(const key of FRAME_KEYS)if(Object.prototype.hasOwnProperty.call(frame,key))d[key]=clone(frame[key]);
 return true;
}
export function undoVoronoi(studio){
 const h=studio?.history;
 if(!h?.past?.length)return false;
 const before=h.past.pop(),current=voronoiFrame(studio.draft);
 if(!applyVoronoiFrame(studio.draft,before))return false;
 h.future.push(current);h.future=h.future.slice(-VORONOI_HISTORY_LIMIT);
 studio.selectedSiteId=studio.draft.sites.some(s=>s.id===studio.selectedSiteId)?studio.selectedSiteId:"";
 return true;
}
export function redoVoronoi(studio){
 const h=studio?.history;
 if(!h?.future?.length)return false;
 const next=h.future.pop(),current=voronoiFrame(studio.draft);
 if(!applyVoronoiFrame(studio.draft,next))return false;
 h.past.push(current);h.past=h.past.slice(-VORONOI_HISTORY_LIMIT);
 studio.selectedSiteId=studio.draft.sites.some(s=>s.id===studio.selectedSiteId)?studio.selectedSiteId:"";
 return true;
}
export function freezeVoronoiWindow(studio){
 const d=studio.draft,b=displayVoronoiBounds(d);
 if(d.regionMode==="auto"){
  d.regionMode="interactive";d.xMin=String(Number(b.xMin.toPrecision(10)));
  d.xMax=String(Number(b.xMax.toPrecision(10)));
  d.yMin=String(Number(b.yMin.toPrecision(10)));
  d.yMax=String(Number(b.yMax.toPrecision(10)));
 }
 return displayVoronoiBounds(d);
}
export function fitVoronoiSites(studio){
 if(!studio.draft.sites.length)return false;
 const before=voronoiFrame(studio.draft),d=studio.draft;
 d.regionMode="auto";freezeVoronoiWindow(studio);
 return recordVoronoiHistory(studio,before);
}
export function coordinateFromCanvas(layout,bounds,point){
 if(!layout||!bounds||!point||!finite(point.x)||!finite(point.y))return null;
 const {left,top,width,height,scale}=layout;
 if(![left,top,width,height,scale].every(finite)||scale<=0)return null;
 const eps=1e-5;
 if(point.x<left-eps||point.x>left+width+eps||point.y<top-eps||point.y>top+height+eps)return null;
 return {x:bounds.xMin+(point.x-left)/scale,y:bounds.yMax-(point.y-top)/scale};
}
export function canvasPosition(value){
 return Number(value.toPrecision(8));
}
export function setVoronoiTool(studio,tool){
 if(!VORONOI_TOOLS.includes(tool))return false;
 studio.tool=tool;
 studio.draft.placeCandidate=tool==="candidate";
 return true;
}
export function selectVoronoiSite(studio,index){
 if(!Number.isInteger(index)||index<0||index>=studio.draft.sites.length)return false;
 studio.selectedSiteId=studio.draft.sites[index].id;
 return true;
}
export function moveVoronoiSite(studio,index,x,y,{record=true}={}){
 const d=studio.draft,p=d.sites[index];
 if(!p||!finite(x)||!finite(y)||Math.abs(x)>1e8||Math.abs(y)>1e8)return {ok:false,error:"Coordinates must be finite and within the supported range."};
 if(studio.scenario?.active&&p.kind==="observed")
  return {ok:false,error:"Existing sites are locked during a what-if comparison. Restore or finish the comparison before editing source coordinates."};
 const b=displayVoronoiBounds(d),epsilon=1e-8*Math.max(1,b.xMax-b.xMin,b.yMax-b.yMin);
 if(x<b.xMin-epsilon||x>b.xMax+epsilon||y<b.yMin-epsilon||y>b.yMax+epsilon)
  return {ok:false,error:"Move the site inside the visible rectangle, or expand the viewing window."};
 if(d.sites.some((s,i)=>i!==index&&Math.hypot(s.x-x,s.y-y)<1e-9))
  return {ok:false,error:"Two sites cannot occupy exactly the same position."};
 const nx=canvasPosition(x),ny=canvasPosition(y);
 if(p.x===nx&&p.y===ny)return{ok:true,changed:false};
 const before=record?voronoiFrame(d):null;
 p.x=nx;p.y=ny;d.edited=true;
 if(record)recordVoronoiHistory(studio,before);
 studio.selectedSiteId=p.id;
 return {ok:true,changed:true};
}
export function proposeVoronoiComparison(studio){
 if(studio.scenario?.active)return false;
 if(studio.draft.sites.length<2)return false;
 studio.scenario={active:true,before:voronoiFrame(studio.draft),showOriginal:false};
 setVoronoiTool(studio,"candidate");
 return true;
}
export function showVoronoiComparison(studio,original){
 if(!studio.scenario?.active)return false;
 studio.scenario.showOriginal=!!original;
 return true;
}
export function finishVoronoiComparison(studio,{restore=false}={}){
 if(!studio.scenario?.active||!studio.scenario.before)return false;
 const before=voronoiFrame(studio.draft);
 if(restore){
  applyVoronoiFrame(studio.draft,studio.scenario.before);
  recordVoronoiHistory(studio,before);
 }
 studio.scenario={active:false,before:null,showOriginal:false};
 setVoronoiTool(studio,"select");
 studio.selectedSiteId="";
 return true;
}
export function originalVoronoiDraft(studio){
 const b=studio.scenario?.before;
 if(!studio.scenario?.active||!b)return null;
 return {...studio.draft,...clone(b)};
}
export function voronoiInspection(studio){
 const d=studio.draft,q=analyzeVoronoi(d),index=d.sites.findIndex(s=>s.id===studio.selectedSiteId);
 if(index<0)return null;
 const site=d.sites[index],cell=q.cells[index]||null;
 const neighbours=d.sites.map((s,i)=>({site:s,index:i,distance:Math.hypot(site.x-s.x,site.y-s.y)}))
  .filter(x=>x.index!==index).sort((a,b)=>a.distance-b.distance||a.index-b.index);
 const bisector=neighbours[0]?{
  other:neighbours[0].site,otherIndex:neighbours[0].index,
  midpoint:{x:(site.x+neighbours[0].site.x)/2,y:(site.y+neighbours[0].site.y)/2},
  normal:{x:neighbours[0].site.x-site.x,y:neighbours[0].site.y-site.y}
 }:null;
 return {site,index,cell,neighbours,bisector,bounds:q.bounds};
}
export function selectNearestBisector(studio){
 const inspection=voronoiInspection(studio);
 if(!inspection?.bisector)return false;
 studio.draft.pairA=inspection.index;
 studio.draft.pairB=inspection.bisector.otherIndex;
 studio.draft.showBisector=true;
 return true;
}
export function voronoiComparison(studio){
 const original=originalVoronoiDraft(studio);
 if(!original)return null;
 const before=analyzeVoronoi(original),after=analyzeVoronoi(studio.draft);
 return {before,after,changes:after.cells.map((c,i)=>{
  const base=before.cells.find(x=>x.site.id===c.site.id);
  return {id:c.site.id,name:c.name,kind:c.site.kind,before:base?.area??null,
   after:c.area,delta:base?c.area-base.area:null};
 })};
}
