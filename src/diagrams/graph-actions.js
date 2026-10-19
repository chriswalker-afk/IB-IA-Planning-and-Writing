/** Student-authorised graph edits and explicit links to the mathematical journey. */
import {analyseGraph,applyPastedGraphData,newGraphDraft,normalizeGraphDraft,saveGraphFigure,splitHeading} from "./graph-core.js";
import {completeEntry,startFirstRepresentation} from "../completing/engine.js";

const ALLOWED=new Set(Object.keys(newGraphDraft()));
const FLAGS=new Set(["showGrid","showPoints","includeZeroY"]);
const SELECTORS=new Set(["xIndex","yIndex"]);
export function updateGraphField(studio,key,value){
 const d=studio?.draft;
 if(!d||!ALLOWED.has(key)||["matrix","columns","pendingPaste","kind"].includes(key))return false;
 if(FLAGS.has(key)){d[key]=!!value;return true;}
 if(SELECTORS.has(key)){
  const index=Number(value);
  if(!Number.isInteger(index)||index<0||index>=d.columns.length)return false;
  d[key]=index;
  const axis=key==="xIndex"?"x":"y",h=splitHeading(d.columns[index]);
  d[axis+"Label"]=h.label;d[axis+"Unit"]=h.unit;
  d[axis+"UnitMode"]=h.unit?"unit":"unsure";
  return true;
 }
 if(typeof value!=="string")return false;
 d[key]=value.slice(0,key==="raw"?85000:key==="expression"?180:500);
 if(key==="raw")d.pendingPaste=true;
 return true;
}
export function chooseGraphType(studio,kind){
 if(!["scatter","time","function"].includes(kind))return false;
 const d=studio.draft,old=d.kind;
 if(old===kind)return true;
 d.kind=kind;
 d.xMin="";d.xMax="";d.yMin="";d.yMax="";
 if(kind==="scatter")d.showPoints=true;
 if(kind==="function"){
  d.xLabel="x";d.yLabel="f(x)";d.xUnit="";d.yUnit="";
  d.xUnitMode="dimensionless";d.yUnitMode="dimensionless";d.title="";
 }else if(old==="function"){
  const x=splitHeading(d.columns[d.xIndex]||""),y=splitHeading(d.columns[d.yIndex]||"");
  d.xLabel=x.label;d.yLabel=y.label;d.xUnit=x.unit;d.yUnit=y.unit;
  d.xUnitMode=x.unit?"unit":"unsure";d.yUnitMode=y.unit?"unit":"unsure";d.title="";
 }
 return true;
}
export function importGraphTable(studio,text){
 return applyPastedGraphData(studio,text);
}
export function loadSavedGraph(studio,id){
 const record=studio.figures.find(x=>x.id===id);
 if(!record)return false;
 studio.activeId=id;studio.draft=normalizeGraphDraft(record.draft);studio.open=true;
 return true;
}
export function freshGraph(studio){
 studio.activeId="";studio.draft=newGraphDraft();studio.open=true;
}
const mathSignature=d=>JSON.stringify([d.kind,d.matrix,d.columns,d.xIndex,d.yIndex,d.expression,d.xMin,d.xMax,d.yMin,d.yMax]);
function flagChangedGraph(state,previous,current){
 if(!previous?.entryId||mathSignature(previous.draft)===mathSignature(current.draft))return false;
 const entry=state.entries.find(x=>x.id===previous.entryId);
 if(!entry||entry.status!=="completed"||!entry.result?.trim())return false;
 entry.reviewNeeded="yes";
 entry.reviewReason="The underlying data, function or graph scales changed. Recheck the corresponding written result and interpretation.";
 state.completion.stages[entry.phase==="first"?"C30":"C40"]="needs-review";
 return true;
}
export function saveGraphDraft(state){
 const studio=state.graphStudio,prior=studio.figures.find(x=>x.id===studio.activeId);
 const saved=saveGraphFigure(studio);
 if(!saved.ok)return saved;
 return {...saved,reviewNeeded:flagChangedGraph(state,prior,saved.record)};
}
export function saveAndLinkGraph(state){
 const studio=state.graphStudio;
 if(!analyseGraph(studio.draft).ready)return {ok:false,error:"Resolve the required graph quality checks before linking this figure."};
 const prior=studio.figures.find(x=>x.id===studio.activeId);
 let index=-1;
 if(prior?.entryId)index=state.entries.findIndex(x=>x.id===prior.entryId);
 const active=completeEntry(state);
 if(index<0&&active?.phase==="first"&&active.status==="planned"&&(!active.graphFigureId||active.graphFigureId===studio.activeId))
  index=state.completion.activeEntryIndex;
 if(index<0){
  const fresh=startFirstRepresentation(state);
  if(!fresh.ok)return fresh;
  index=fresh.index??state.completion.activeEntryIndex;
 }
 const entry=state.entries[index];
 if(!entry)return {ok:false,error:"Could not find a mathematical step to link this graph to."};
 const saved=saveGraphFigure(studio,entry.id);
 if(!saved.ok)return saved;
 const reviewNeeded=flagChangedGraph(state,prior,saved.record);
 entry.graphFigureId=saved.record.id;
 if(entry.phase==="first"&&!entry.title.trim())entry.title=saved.record.draft.title;
 entry.kind=saved.record.draft.kind==="scatter"?"scatter":
  saved.record.draft.kind==="function"?"model":"other";
 state.completion.activeEntryIndex=index;state.ui.mathIndex=index;
 state.completion.fields.firstType=entry.kind==="scatter"?"scatter":"other";
 return {ok:true,record:saved.record,index,reviewNeeded};
}
