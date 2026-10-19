/** Student-controlled image tracer edits and explicitly linked working records. */
import {
 newImageTraceDraft,normalizeTraceDraft,addPhotoPoint,undoTrace,removeTracePoint,
 imageTraceChecks,saveTraceFigure,traceSignature
} from "./image-tracer-core.js";
import {completeEntry,startFirstRepresentation} from "../completing/engine.js";
const TEXT=new Set(["title","sourceKind","sourceCredit","xLabel","yLabel","unit","knownLength","precision","perspective","limitations","caption"]);
const BOOL=new Set(["showGrid","showLine","closeShape","showLabels"]);
export function setTraceField(tracer,key,value){
 const d=tracer?.draft;if(!d)return false;
 if(TEXT.has(key)){
  if(typeof value!=="string")return false;
  d[key]=value.slice(0,["sourceCredit","limitations","caption"].includes(key)?500:160);
  return true;
 }
 if(BOOL.has(key)){d[key]=value===true;return true;}
 if(key==="imageOpacity"&&Number.isFinite(Number(value))){
  d.imageOpacity=Math.max(.1,Math.min(1,Number(value)));return true;
 }
 return false;
}
export function setTraceView(tracer,view){
 if(!["photo","math"].includes(view))return false;
 tracer.draft.view=view;return true;
}
export function setTraceTool(tracer,tool){
 if(!["origin","direction","refA","refB","trace"].includes(tool))return false;
 tracer.draft.mode=tool;tracer.draft.view="photo";return true;
}
export function usePhoto(tracer,result){
 if(!result?.src||!Number.isInteger(result.width)||!Number.isInteger(result.height))return false;
 const d=tracer.draft;
 d.imageSrc=result.src;d.width=result.width;d.height=result.height;d.imageName=String(result.name||d.imageName).slice(0,130);
 d.origin=null;d.direction=null;d.refA=null;d.refB=null;d.points=[];
 d.mode="origin";d.view="photo";
 return true;
}
export function tapTrace(tracer,x,y){
 return addPhotoPoint(tracer.draft,{x,y});
}
export function undoTracer(tracer){return undoTrace(tracer.draft);}
export function removeTracerPoint(tracer,index){return removeTracePoint(tracer.draft,index);}
export function startNewTrace(tracer){
 tracer.activeId="";tracer.draft=newImageTraceDraft();tracer.open=true;
}
export function restoreSavedTrace(tracer,id){
 const record=tracer.figures.find(x=>x.id===id);
 if(!record)return false;
 tracer.activeId=id;tracer.draft=normalizeTraceDraft(record.draft);tracer.open=true;
 return true;
}
function markChangedMath(state,previous,record){
 if(!previous?.entryId||traceSignature(previous.draft)===traceSignature(record.draft))return false;
 const entry=state.entries.find(x=>x.id===previous.entryId);
 if(!entry||entry.status!=="completed"||!entry.result?.trim())return false;
 entry.reviewNeeded="yes";
 entry.reviewReason="The photograph, scale, coordinate frame or traced positions changed. Recheck measurements, mathematical conclusions and interpretations in your actual IA.";
 state.completion.stages[entry.phase==="first"?"C30":"C40"]="needs-review";
 return true;
}
export function saveTraceDraft(state){
 const tracer=state.imageTracer,prior=tracer.figures.find(x=>x.id===tracer.activeId);
 const saved=saveTraceFigure(tracer);
 if(!saved.ok)return saved;
 return {...saved,reviewNeeded:markChangedMath(state,prior,saved.record)};
}
export function saveAndLinkTrace(state){
 const tracer=state.imageTracer,checks=imageTraceChecks(tracer.draft);
 if(!checks.ready)return{ok:false,error:"Resolve the required photograph, calibration and point checks before linking the figure."};
 const prior=tracer.figures.find(x=>x.id===tracer.activeId);
 let index=-1;
 if(prior?.entryId)index=state.entries.findIndex(x=>x.id===prior.entryId);
 const active=completeEntry(state);
 if(index<0&&active?.phase==="first"&&active.status==="planned"&&(!active.imageTraceId||active.imageTraceId===tracer.activeId))
  index=state.completion.activeEntryIndex;
 if(index<0){
  const next=startFirstRepresentation(state);
  if(!next.ok)return next;
  index=next.index??state.completion.activeEntryIndex;
 }
 const entry=state.entries[index];
 if(!entry)return {ok:false,error:"The mathematical step for this figure could not be found."};
 const saved=saveTraceFigure(tracer,entry.id);
 if(!saved.ok)return saved;
 const reviewNeeded=markChangedMath(state,prior,saved.record);
 entry.imageTraceId=saved.record.id;
 if(entry.phase==="first"&&(!entry.title.trim()||["First purposeful representation","diagram","scatter","other"].includes(entry.title)))
  entry.title=saved.record.draft.title;
 if(!entry.technique.trim())entry.technique="Coordinate tracing and scale calibration";
 entry.kind="other";
 state.completion.activeEntryIndex=index;state.ui.mathIndex=index;
 state.completion.fields.firstType="diagram";
 return {ok:true,record:saved.record,index,reviewNeeded};
}
