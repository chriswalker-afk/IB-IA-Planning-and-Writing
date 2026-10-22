import {newProbabilityDraft,normalizeProbabilityDraft,probabilityAnalysis,probabilitySignature,saveProbabilityFigure,activeParents,leafKeys} from "./probability-core.js";
import {completeEntry,startFirstRepresentation} from "../completing/engine.js";

export function setProbabilityField(studio,key,value){
 const d=studio.draft;
 if(["title","figureNumber","sourceCredit","note","eventName","conditionName"].includes(key)){
  d[key]=String(value).slice(0,["note","sourceCredit"].includes(key)?800:180);
 }else if(key==="stages"&&[2,3,"2","3"].includes(value)){
  d.stages=Number(value);const allowed=new Set(leafKeys(d.stages));
  d.eventLeaves=d.eventLeaves.filter(x=>allowed.has(x));
  d.conditionLeaves=d.conditionLeaves.filter(x=>allowed.has(x));
 }else if(key==="sourceKind"&&["theoretical","primary","secondary","unsure"].includes(value))d.sourceKind=value;
 else if(["showProducts","showEventCalculation"].includes(key)&&typeof value==="boolean")d[key]=value;
 else return false;
 d.edited=true;return true;
}
export function setProbabilityStage(studio,index,value){
 if(!Number.isInteger(index)||index<0||index>2)return false;
 studio.draft.stageLabels[index]=String(value).slice(0,80);studio.draft.edited=true;return true;
}
export function setProbabilityBranch(studio,parent,index,key,value){
 if(!activeParents(studio.draft.stages).includes(parent)||![0,1].includes(index)||
  !["label","probability"].includes(key))return false;
 studio.draft.branches[parent][index][key]=String(value).slice(0,key==="label"?80:60);
 studio.draft.edited=true;return true;
}
export function toggleProbabilityLeaf(studio,membership,path,checked){
 if(!["eventLeaves","conditionLeaves"].includes(membership)||!leafKeys(studio.draft.stages).includes(path))return false;
 const values=new Set(studio.draft[membership]);
 if(checked)values.add(path);else values.delete(path);
 studio.draft[membership]=[...values];studio.draft.edited=true;return true;
}
export function freshProbability(studio){
 studio.activeId="";studio.draft=newProbabilityDraft();studio.open=true;
}
export function loadProbability(studio,id){
 const found=studio.figures.find(x=>x.id===id);
 if(!found)return false;
 studio.activeId=id;studio.draft=normalizeProbabilityDraft(found.draft);studio.open=true;return true;
}
function reviewChanged(state,previous,record){
 if(!previous?.entryId||probabilitySignature(previous.draft)===probabilitySignature(record.draft))return false;
 const entry=state.entries.find(x=>x.id===previous.entryId);
 if(!entry||entry.status!=="completed"||!entry.result?.trim())return false;
 entry.reviewNeeded="yes";
 entry.reviewReason="A linked probability tree changed. Recheck branch assumptions, conditional probabilities, event definitions and conclusions in your written IA.";
 state.completion.stages[entry.phase==="first"?"C30":"C40"]="needs-review";
 return true;
}
export function saveProbabilityDraft(state){
 const studio=state.probabilityStudio,previous=studio.figures.find(f=>f.id===studio.activeId);
 const saved=saveProbabilityFigure(studio);
 return saved.ok?{...saved,reviewNeeded:reviewChanged(state,previous,saved.record)}:saved;
}
export function saveAndLinkProbability(state){
 const studio=state.probabilityStudio,previous=studio.figures.find(f=>f.id===studio.activeId);
 const q=probabilityAnalysis(studio.draft);
 if(!q.ready)return {ok:false,error:q.issues[0]};
 let index=previous?.entryId?state.entries.findIndex(e=>e.id===previous.entryId):-1;
 const active=completeEntry(state);
 if(index<0&&["first","substantial"].includes(active?.phase)&&
  (active.phase==="substantial"||!active.probabilityFigureId||active.probabilityFigureId===studio.activeId))
  index=state.completion.activeEntryIndex;
 if(index<0){
  const created=startFirstRepresentation(state);
  if(!created.ok)return created;
  index=created.index??state.completion.activeEntryIndex;
 }
 const entry=state.entries[index],saved=saveProbabilityFigure(studio,entry.id);
 if(!saved.ok)return saved;
 const reviewNeeded=reviewChanged(state,previous,saved.record);
 entry.probabilityFigureId=saved.record.id;
 if(!entry.title?.trim())entry.title=saved.record.draft.title;
 if(!entry.technique?.trim())entry.technique="Conditional probability tree";
 entry.kind="diagram";state.completion.activeEntryIndex=index;state.ui.mathIndex=index;
 if(entry.phase==="first")state.completion.fields.firstType="diagram";
 return {...saved,index,reviewNeeded};
}
