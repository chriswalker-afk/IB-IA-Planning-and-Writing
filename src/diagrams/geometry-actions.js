import {newGeometryDraft,normalizeGeometryDraft,geometryAnalysis,geometrySignature,saveGeometryFigure,MAX_GEOMETRY_VERTICES} from "./geometry-core.js";
import {completeEntry,startFirstRepresentation} from "../completing/engine.js";
import {geometryFromTrace} from "./geometry-advanced.js";
export function setGeometryField(studio,key,value){
 const d=studio.draft;
 if(["title","figureNumber","unit","sourceCredit","note","sensitivityStep"].includes(key)){d[key]=String(value).slice(0,key==="note"||key==="sourceCredit"?800:180);d.edited=true;return true;}
 if(key==="mode"&&["schematic","coordinate"].includes(value)){d.mode=value;d.showBearings=false;d.edited=true;return true;}
 if(key==="sourceKind"&&["theoretical","primary","secondary","unsure"].includes(value)){d.sourceKind=value;return true;}
 if(["northAligned","showLengths","showAngles","showBearings","showGrid","showCoordinates","showDecomposition","showSensitivity","filled"].includes(key)){
  d[key]=value===true;d.edited=true;return true;
 }
 return false;
}
export function setGeometryVertex(studio,index,key,value){
 const v=studio.draft.vertices[index];if(!v)return false;
 if(["edgeConstraint"].includes(key)&&["free","horizontal","vertical"].includes(value)){v.edgeConstraint=value;studio.draft.edited=true;return true;}
 if(["rightAngle","locked"].includes(key)&&typeof value==="boolean"){v[key]=value;studio.draft.edited=true;return true;}
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
 d.vertices.push({id:"v-"+n,label:String.fromCharCode(65+n),x:(a.x+b.x)/2,y:(a.y+b.y)/2+1,
  edgeLabel:"",angleLabel:"",edgeConstraint:"free",rightAngle:false,locked:false});
 a.edgeConstraint="free";d.edited=true;return true;
}
export function geometryRemoveVertex(studio,index){
 const d=studio.draft;if(d.vertices.length<=3||index<0||index>=d.vertices.length)return false;
 d.vertices.splice(index,1);d.edited=true;return true;
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
 entry.geometryFigureId=saved.record.id;
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
