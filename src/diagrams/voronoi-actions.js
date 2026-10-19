/** Actions that preserve observed sites and treat proposals as hypothetical. */
import {newVoronoiDraft,normalizeVoronoiDraft,analyzeVoronoi,importVoronoiSites,
 saveVoronoiFigure,voronoiSignature,MAX_VORONOI_SITES} from "./voronoi-core.js";
import {completeEntry,startFirstRepresentation} from "../completing/engine.js";
const strings=new Set(["raw","headers","title","xLabel","yLabel","unitMode","unit",
 "coordSystem","sourceKind","sourceCredit","regionMode","xMin","xMax","yMin","yMax",
 "mapCredit","probeX","probeY","note","addName","addX","addY","addType"]);
const booleans=new Set(["showGrid","showSites","showLabels","showBisector","showAreas",
 "metricConfirmed","mapConfirmed","placeCandidate"]);
const selects=new Set(["pairA","pairB"]);
export function setVoronoiField(studio,key,value){
 const d=studio?.draft;if(!d)return false;
 if(strings.has(key)){
  if(typeof value!=="string")return false;
  const prev=d[key];
  d[key]=value.slice(0,key==="raw"?20000:{"sourceCredit":550,"mapCredit":550,"note":550}[key]||160);
  if(key==="raw"&&d.raw!==prev&&d.sites.length)d.pendingPaste=true;
  if(key==="headers"&&d.headers!==prev&&d.raw&&d.sites.length)d.pendingPaste=true;
  return true;
 }
 if(booleans.has(key)){d[key]=value===true;return true;}
 if(selects.has(key)){
  const n=Number(value);if(!Number.isInteger(n)||n<0||n>=d.sites.length)return false;
  d[key]=n;return true;
 }
 if(key==="mapOpacity"){
  const n=Number(value);if(!Number.isFinite(n))return false;
  d.mapOpacity=Math.max(.15,Math.min(.85,n));return true;
 }
 return false;
}
export function setVoronoiSite(studio,index,field,value){
 const d=studio?.draft,p=d?.sites?.[index];
 if(!p)return false;
 if(field==="name"){p.name=String(value).slice(0,42);d.edited=true;return true;}
 if(field==="kind"&&["observed","candidate"].includes(value)){p.kind=value;d.edited=true;return true;}
 if(field==="x"||field==="y"){
  const n=String(value).trim()?Number(value):NaN;
  p[field]=Number.isFinite(n)&&Math.abs(n)<=1e8?n:null;
  d.edited=true;return true;
 }
 return false;
}
export function addVoronoiSite(studio,site){
 const d=studio.draft;
 if(d.sites.length>=MAX_VORONOI_SITES)return{ok:false,error:"Use at most eighteen sites for a readable diagram."};
 const x=Number(site.x),y=Number(site.y);
 if(!String(site.x).trim()||!String(site.y).trim()||
  !Number.isFinite(x)||!Number.isFinite(y)||Math.abs(x)>1e8||Math.abs(y)>1e8)
  return{ok:false,error:"Enter two valid Cartesian coordinates to add a site."};
 const kind=site.kind==="observed"?"observed":"candidate";
 const name=String(site.name||"").trim()||(
  kind==="candidate"?"Candidate "+(1+d.sites.filter(s=>s.kind==="candidate").length):
  "Site "+(d.sites.length+1));
 if(name.length>42||d.sites.some(s=>s.name.toLowerCase()===name.toLowerCase()))
  return{ok:false,error:"Choose a different, short name for this site."};
 if(d.sites.some(s=>Math.hypot(s.x-x,s.y-y)<1e-9))
  return{ok:false,error:"A site already exists at these coordinates."};
 const newSite={id:"s-"+Date.now().toString(36)+"-"+d.sites.length,name,x,y,kind};
 d.sites.push(newSite);d.addName="";d.addX="";d.addY="";
 d.edited=true;d.placeCandidate=false;
 return{ok:true,site:newSite};
}
export function removeVoronoiSite(studio,index){
 const d=studio.draft;
 if(!Number.isInteger(index)||index<0||index>=d.sites.length)return false;
 d.sites.splice(index,1);
 d.pairA=0;d.pairB=d.sites.length>1?1:0;
 d.edited=true;return true;
}
export function clearVoronoiMap(studio){
 const d=studio.draft;
 for(const key of ["mapSrc","mapName","mapCredit"])d[key]="";
 d.mapWidth=0;d.mapHeight=0;d.mapConfirmed=false;
}
export function useVoronoiMap(studio,image){
 if(!image?.src||!Number.isInteger(image.width)||!Number.isInteger(image.height))
  throw new Error("A valid map image could not be opened.");
 const d=studio.draft;
 d.mapSrc=image.src;d.mapWidth=image.width;d.mapHeight=image.height;
 d.mapName=image.name||"Imported map";d.mapConfirmed=false;d.regionMode="manual";
}
export function beginVoronoi(studio){
 studio.activeId="";studio.draft=newVoronoiDraft();studio.open=true;
}
export function loadVoronoi(studio,id){
 const fig=studio.figures.find(f=>f.id===id);
 if(!fig)return false;
 studio.activeId=id;studio.draft=normalizeVoronoiDraft(fig.draft);studio.open=true;
 return true;
}
export function noteVoronoiChange(state,previous,record){
 if(!previous?.entryId||voronoiSignature(previous.draft)===voronoiSignature(record.draft))return false;
 const entry=state.entries.find(e=>e.id===previous.entryId);
 if(!entry||entry.status!=="completed"||!entry.result?.trim())return false;
 entry.reviewNeeded="yes";
 entry.reviewReason="The site coordinates, proposed site, study window, map calibration or distance assumption changed. Recheck earlier distances, Voronoi regions and written interpretations in your actual IA.";
 state.completion.stages[entry.phase==="first"?"C30":"C40"]="needs-review";
 return true;
}
export function saveVoronoiDraft(state){
 const studio=state.voronoiStudio,previous=studio.figures.find(f=>f.id===studio.activeId);
 const saved=saveVoronoiFigure(studio);
 if(!saved.ok)return saved;
 return {...saved,reviewNeeded:noteVoronoiChange(state,previous,saved.record)};
}
export function saveAndLinkVoronoi(state){
 const studio=state.voronoiStudio;
 if(!analyzeVoronoi(studio.draft).ready)
  return{ok:false,error:"Finish the coordinate-system, metric, source, labels and map checks first."};
 const previous=studio.figures.find(f=>f.id===studio.activeId);
 let index=previous?.entryId?state.entries.findIndex(e=>e.id===previous.entryId):-1;
 const active=completeEntry(state);
 if(index<0&&active?.phase==="first"&&active.status==="planned"&&
  (!active.voronoiFigureId||active.voronoiFigureId===studio.activeId))
  index=state.completion.activeEntryIndex;
 if(index<0){
  const created=startFirstRepresentation(state);
  if(!created.ok)return created;
  index=created.index??state.completion.activeEntryIndex;
 }
 const entry=state.entries[index];
 if(!entry)return{ok:false,error:"Could not find a mathematical step to link."};
 const saved=saveVoronoiFigure(studio,entry.id);
 if(!saved.ok)return saved;
 const reviewNeeded=noteVoronoiChange(state,previous,saved.record);
 entry.voronoiFigureId=saved.record.id;
 if(entry.phase==="first"&&(!entry.title.trim()||["First purposeful representation","diagram","other","table"].includes(entry.title)))
  entry.title=saved.record.draft.title;
 if(!entry.technique.trim())entry.technique="Euclidean Voronoi regions and perpendicular bisectors";
 if(!entry.methodId?.trim())entry.methodId="voronoi";
 entry.kind="other";state.completion.activeEntryIndex=index;state.ui.mathIndex=index;
 state.completion.fields.firstType="diagram";
 return {ok:true,record:saved.record,index,reviewNeeded};
}
