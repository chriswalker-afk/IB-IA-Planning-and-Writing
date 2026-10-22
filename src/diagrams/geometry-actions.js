import {newGeometryDraft,normalizeGeometryDraft,geometryAnalysis,geometrySignature,saveGeometryFigure,MAX_GEOMETRY_VERTICES} from "./geometry-core.js";
import {MAX_GEOMETRY_AUX_POINTS,MAX_GEOMETRY_GUIDES} from "./geometry-annotations.js";
import {completeEntry,startFirstRepresentation} from "../completing/engine.js";
import {linkRepresentationFigure} from "./figure-linking.js";
import {geometryFromTrace} from "./geometry-advanced.js";
const nudge=value=>{
 const raw=String(value).trim(),n=raw===""?0:Number(raw);
 return Number.isFinite(n)&&Math.abs(n)<=90?n:null;
};
const coordinate=value=>{
 const raw=String(value).trim(),n=Number(raw);
 return raw!==""&&Number.isFinite(n)&&Math.abs(n)<=1e5?n:null;
};
export function setGeometryField(studio,key,value){
 const d=studio.draft;
 if(["title","figureNumber","caption","unit","sourceCredit","note","sensitivityStep"].includes(key)){d[key]=String(value).slice(0,key==="note"||key==="sourceCredit"?800:180);d.edited=true;return true;}
 if(key==="mode"&&["schematic","coordinate"].includes(value)){d.mode=value;d.showBearings=false;d.edited=true;return true;}
 if(key==="sourceKind"&&["theoretical","primary","secondary","unsure"].includes(value)){d.sourceKind=value;d.edited=true;return true;}
 if(key==="dimensionStyle"&&["inline","dimension"].includes(value)){d.dimensionStyle=value;d.edited=true;return true;}
 if(key==="lengthFormat"&&["dp","sf"].includes(value)){d.lengthFormat=value;d.edited=true;return true;}
 if(["lengthDigits","angleDigits","dimensionOffset"].includes(key)){
  const n=Number(value),maximum=key==="angleDigits"?3:5;
  if(key==="dimensionOffset"&&Number.isInteger(n)&&n>=24&&n<=85){d[key]=n;d.edited=true;return true;}
  if(key!=="dimensionOffset"&&Number.isInteger(n)&&String(value).trim()!==""&&n>=0&&n<=maximum&&
    !(key==="lengthDigits"&&d.lengthFormat==="sf"&&n===0)){
   d[key]=n;d.edited=true;return true;
  }
  return false;
 }
 if(["showTitle","showCaption","northAligned","showLengths","showAngles","showBearings","showGrid","showCoordinates","showDecomposition","showSensitivity","filled"].includes(key)){
  d[key]=value===true;d.edited=true;return true;
 }
 return false;
}
export function setGeometryVertex(studio,index,key,value){
 const v=studio.draft.vertices[index];if(!v)return false;
 if(["edgeConstraint"].includes(key)&&["free","horizontal","vertical"].includes(value)){v.edgeConstraint=value;studio.draft.edited=true;return true;}
 if(["rightAngle","locked"].includes(key)&&typeof value==="boolean"){v[key]=value;studio.draft.edited=true;return true;}
 if(key==="angleMark"&&["single","double","triple"].includes(value)){v.angleMark=value;studio.draft.edited=true;return true;}
 if(["edgeLabelDx","edgeLabelDy","angleLabelDx","angleLabelDy","pointLabelDx","pointLabelDy"].includes(key)){
  const n=nudge(value);if(n===null)return false;
  v[key]=n;studio.draft.edited=true;return true;
 }
 if(["label","edgeLabel","angleLabel"].includes(key)){v[key]=String(value).slice(0,key==="label"?44:100);studio.draft.edited=true;return true;}
 if(key==="x"||key==="y"){
  if(v.locked)return false;
  const n=Number(value),valid=String(value).trim()!==""&&Number.isFinite(n)&&Math.abs(n)<=1e5;
  // A cleared or invalid coordinate must never silently reuse the old value.
  v[key]=valid?n:null;studio.draft.edited=true;return true;
 }return false;
}
export function geometryTemplate(studio,kind){
 if(!["triangle","rectangle","polygon","l-shape","t-shape"].includes(kind))return false;
 studio.activeId="";studio.draft=newGeometryDraft(kind);studio.open=true;return true;
}
export function geometryAddVertex(studio){
 const d=studio.draft;if(d.vertices.length>=MAX_GEOMETRY_VERTICES)return false;
 const n=d.vertices.length,a=d.vertices[n-1],b=d.vertices[0];
 const defaults=newGeometryDraft().vertices[0];
 let key="v-"+n;while(d.vertices.some(v=>v.id===key))key+="-x";
 d.vertices.push({...defaults,id:key,label:String.fromCharCode(65+n),
  x:(a.x+b.x)/2,y:(a.y+b.y)/2+1});
 a.edgeConstraint="free";d.edited=true;return true;
}
export function geometryRemoveVertex(studio,index){
 const d=studio.draft;if(d.vertices.length<=3||index<0||index>=d.vertices.length)return false;
 d.vertices.splice(index,1);d.edited=true;return true;
}
/** Independent point and construction lines never affect the polygon area. */
export function geometryAddAuxPoint(studio){
 const d=studio?.draft;if(!d||d.auxPoints.length>=MAX_GEOMETRY_AUX_POINTS)return false;
 const a=d.vertices[0],b=d.vertices[1];
 let i=1,id="p-"+i;while(d.auxPoints.some(p=>p.id===id)){i++;id="p-"+i;}
 const used=new Set([...d.vertices,...d.auxPoints].map(p=>p.label.toLowerCase()));
 let label="P";for(let k=1;used.has(label.toLowerCase());k++)label="P"+k;
 d.auxPoints.push({id,label,x:(a.x+b.x)/2,y:(a.y+b.y)/2,labelDx:0,labelDy:0});
 d.edited=true;return true;
}
export function moveGeometryAuxPoint(studio,index,x,y){
 const d=studio?.draft,p=d?.auxPoints?.[index];
 if(!p||!Number.isFinite(x)||!Number.isFinite(y)||Math.abs(x)>1e5||Math.abs(y)>1e5)return false;
 p.x=x;p.y=y;d.edited=true;return true;
}
export function setGeometryAuxPoint(studio,index,key,value){
 const d=studio?.draft,p=d?.auxPoints?.[index];if(!p)return false;
 if(key==="label"){p.label=String(value).slice(0,44);d.edited=true;return true;}
 if(["x","y"].includes(key)){p[key]=coordinate(value);d.edited=true;return true;}
 if(["labelDx","labelDy"].includes(key)){
  const v=nudge(value);if(v===null)return false;
  p[key]=v;d.edited=true;return true;
 }return false;
}
export function geometryRemoveAuxPoint(studio,index){
 const d=studio?.draft,p=d?.auxPoints?.[index];
 if(!p)return {ok:false,error:"Construction point not found."};
 if(d.guides.some(g=>[g.from,g.to,g.baseStart,g.baseEnd].includes(p.id)))
  return {ok:false,error:"Remove or redirect lines that use this point before deleting it."};
 d.auxPoints.splice(index,1);d.edited=true;return {ok:true};
}
export function geometryAddGuide(studio,kind="dashed"){
 const d=studio?.draft;if(!d||d.guides.length>=MAX_GEOMETRY_GUIDES||
  !["solid","dashed","height","north"].includes(kind))return false;
 let i=1,id="guide-"+i;while(d.guides.some(g=>g.id===id)){i++;id="guide-"+i;}
 const vertices=d.vertices,points=[...vertices,...d.auxPoints];
 d.guides.push({id,kind,from:vertices[0].id,
  to:points[2]?.id||vertices[1].id,baseStart:vertices[1].id,
  baseEnd:vertices[2].id,label:kind==="height"?"h":"",
  showLength:false,labelDx:0,labelDy:0});
 d.edited=true;return true;
}
export function setGeometryGuide(studio,index,key,value){
 const d=studio?.draft,g=d?.guides?.[index];if(!g)return false;
 if(key==="kind"&&["solid","dashed","height","north"].includes(value)){g.kind=value;d.edited=true;return true;}
 if(["from","to","baseStart","baseEnd"].includes(key)){
  if(![...d.vertices,...d.auxPoints].some(p=>p.id===value))return false;
  g[key]=value;d.edited=true;return true;
 }
 if(key==="label"){g.label=String(value).slice(0,100);d.edited=true;return true;}
 if(key==="showLength"&&typeof value==="boolean"){g.showLength=value;d.edited=true;return true;}
 if(["labelDx","labelDy"].includes(key)){
  const n=nudge(value);if(n===null)return false;g[key]=n;d.edited=true;return true;
 }return false;
}
export function geometryRemoveGuide(studio,index){
 const d=studio?.draft;if(!d||index<0||index>=d.guides.length)return false;
 d.guides.splice(index,1);d.edited=true;return true;
}
export function geometryFresh(studio){studio.activeId="";studio.draft=newGeometryDraft();studio.open=true;}
export function loadGeometry(studio,id){
 const record=studio.figures.find(f=>f.id===id);if(!record)return false;
 studio.activeId=id;studio.draft=normalizeGeometryDraft(record.draft);studio.open=true;return true;
}
function flagGeometryReview(state,previous,record){
 if(!previous?.entryId||geometrySignature(previous.draft)===geometrySignature(record.draft))return false;
 const entry=state.entries.find(e=>e.id===previous.entryId);
 if(!entry||entry.status!=="completed"||!entry.result?.trim())return false;
 entry.reviewNeeded="yes";entry.reviewReason="A linked geometry figure changed. Recheck distances, angles, bearings and the mathematical conclusions in your written IA.";
 state.completion.stages[entry.phase==="first"?"C30":"C40"]="needs-review";return true;
}
export function saveGeometryDraft(state){
 const studio=state.geometryStudio,previous=studio.figures.find(f=>f.id===studio.activeId);
 const saved=saveGeometryFigure(studio);
 return saved.ok?{...saved,reviewNeeded:flagGeometryReview(state,previous,saved.record)}:saved;
}
export function saveAndLinkGeometry(state){
 const studio=state.geometryStudio,previous=studio.figures.find(f=>f.id===studio.activeId);
 if(!geometryAnalysis(studio.draft).ready)return{ok:false,error:geometryAnalysis(studio.draft).issues[0]};
 let index=previous?.entryId?state.entries.findIndex(e=>e.id===previous.entryId):-1;
 const active=completeEntry(state);
 if(index<0&&["first","substantial"].includes(active?.phase)&&
  (active.phase==="substantial"||!active.geometryFigureId||active.geometryFigureId===studio.activeId))
  index=state.completion.activeEntryIndex;
 if(index<0){
  const created=startFirstRepresentation(state);if(!created.ok)return created;
  index=created.index??state.completion.activeEntryIndex;
 }
 const entry=state.entries[index],saved=saveGeometryFigure(studio,entry.id);
 if(!saved.ok)return saved;
 const reviewNeeded=flagGeometryReview(state,previous,saved.record);
 linkRepresentationFigure(state,"geometry",saved.record,entry);
 if(!entry.title?.trim())entry.title=saved.record.draft.title;
 if(!entry.technique?.trim())entry.technique="Geometric construction and measurement";
 // The diagram itself does not determine the student’s mathematical method.
 // Preserve any explicit method they chose in their writing stage.
 entry.kind="diagram";state.completion.activeEntryIndex=index;state.ui.mathIndex=index;
 if(entry.phase==="first")state.completion.fields.firstType="diagram";
 return{ok:true,record:saved.record,index,reviewNeeded};
}

/** A saved trace remains untouched. Import creates a new editable geometry draft. */
export function importGeometryFromTrace(state,traceFigureId=""){
 const tracer=state?.imageTracer;
 const record=traceFigureId?tracer?.figures?.find(f=>f.id===traceFigureId):null;
 if(traceFigureId&&!record)return{ok:false,error:"That saved tracing could not be found."};
 const converted=geometryFromTrace(record?.draft||tracer?.draft,{traceFigureId});
 if(!converted.ok)return converted;
 const geometry=state.geometryStudio;
 geometry.activeId="";geometry.draft=converted.draft;geometry.open=true;
 return{...converted,recordedSource:!!record};
}
