/** Controlled edits and explicit links to student-generated mathematics. */
import {newStatDraft,normalizeStatDraft,statAnalysis,statSignature,importStatTable,saveStatFigure} from "./stat-studio-core.js";
import {completeEntry,startFirstRepresentation} from "../completing/engine.js";
import {splitHeading} from "./graph-core.js";

const TEXT=new Set(["raw","headers","histogramInput","binWidth","binStart","barMode",
 "quartileRule","outlierRule","whiskerMode","zThreshold","boxPrecision","histogramCompare","histogramLabels","dotMode",
 "title","figureNumber","variable","unit","unitMode","sourceKind","sourceText",
 "caption","min","max"]);
const SELECT=new Set(["categoryIndex","lowIndex","highIndex","frequencyIndex"]);
const CHECK=new Set(["showGrid","showOutliers","showLabels","showBoxQuartiles","showBoxMedian",
 "showBoxExtremes","showBoxWhiskers","showBoxOutlierValues","showBoxFences","showBoxMean","dotMean","dotMedian"]);
export function setStatField(studio,key,value){
 const d=studio?.draft;
 if(!d)return false;
 if(TEXT.has(key)){
  if(typeof value!=="string")return false;
  if(key==="histogramCompare"&&!["single","overlay","smallmultiples"].includes(value))return false;
  if(key==="histogramCompare"&&value!=="single"&&d.histogramInput==="table")return false;
  const original=d[key];
  d[key]=value.slice(0,key==="raw"?85000:key==="sourceText"||key==="caption"?480:150);
  if(key==="histogramCompare"&&value==="single")d.selected=d.selected.slice(0,1);
  if(key==="histogramInput"&&value==="table"){d.histogramCompare="single";d.selected=d.selected.slice(0,1);}
  if((key==="raw"||key==="headers")&&original!==d[key]&&d.matrix.length)d.pendingPaste=true;
  return true;
 }
 if(CHECK.has(key)){d[key]=value===true;return true;}
 if(key==="singleIndex"){
  const index=Number(value);
  if(!Number.isInteger(index)||index<0||index>=d.columns.length)return false;
  d.selected=[index];
  const {label,unit}=columnHeading(d.columns[index]);
  d.variable=label;
  if(unit){d.unitMode="unit";d.unit=unit;}
  return true;
 }
 if(SELECT.has(key)){
  const n=Number(value);
  if(!Number.isInteger(n)||n<0||n>=d.columns.length)return false;
  d[key]=n;
  if(key==="categoryIndex")d.selected=d.selected.filter(x=>x!==n);
  if(!d.variable||d.variable==="Value")d.variable=d.columns[n]||d.variable;
  return true;
 }
 return false;
}
function columnHeading(value){
 return splitHeading(value);
}
export function changeStatKind(studio,kind){
 if(!["histogram","box","dot","bar"].includes(kind))return false;
 const d=studio.draft,old=d.kind,oldFirst=d.selected?.[0]??0;
 if(old===kind)return true;
 d.kind=kind;d.min="";d.max="";
 if(kind==="bar"){
  d.categoryIndex=0;
  d.selected=d.selected.filter(i=>i!==d.categoryIndex).slice(0,4);
  if(!d.selected.length&&d.columns.length>1)d.selected=[1];
  if(d.columns.length)d.variable=d.columns[d.categoryIndex]||d.variable;
 }else{
  if(!d.selected.length||d.selected.every(i=>i===0)&&old==="bar"){
   d.selected=d.columns.length>1?[1]:[0];
  }
  d.selected=d.selected.slice(0,kind==="histogram"&&d.histogramCompare==="single"?1:5);
  if(d.columns.length){
   const split=columnHeading(d.columns[d.selected[0]||0]);
   // Switching between numerical chart styles must not discard a student's
   // edited mathematical label or unit for the same selected source variable.
   const sameMeasurement=old!=="bar"&&oldFirst===(d.selected[0]??0);
   if(!sameMeasurement||!d.variable.trim()){
    d.variable=split.label;
    if(split.unit){d.unit=split.unit;d.unitMode="unit";}
   }
  }
 }
 return true;
}
export function toggleStatSeries(studio,index,selected){
 const d=studio.draft;
 if(!Number.isInteger(index)||index<0||index>=d.columns.length)return false;
 if(d.kind==="histogram"&&(d.histogramInput==="table"||d.histogramCompare==="single"))return false;
 if(d.kind==="bar"&&index===d.categoryIndex)return false;
 const next=d.selected.filter(i=>i!==index);
 if(selected){
  const limit=d.kind==="bar"||d.kind==="histogram"?4:5;
  if(next.length>=limit)return false;
  next.push(index);next.sort((a,b)=>a-b);
 }
 d.selected=next;
 return true;
}
export function chooseHistogramSuggestion(studio,key){
 const d=studio?.draft;
 if(!d||d.kind!=="histogram"||d.histogramInput!=="raw")return false;
 const suggestion=statAnalysis(d).result.suggestions?.find(item=>item.key===key&&item.available);
 if(!suggestion)return false;
 d.binWidth=String(suggestion.width);
 d.binStart="";
 return true;
}
export function importStatValues(studio,raw){return importStatTable(studio,raw);}
export function freshStat(studio){studio.activeId="";studio.draft=newStatDraft();studio.open=true;}
export function loadStat(studio,id){
 const record=studio.figures.find(x=>x.id===id);
 if(!record)return false;
 studio.activeId=id;studio.draft=normalizeStatDraft(record.draft);studio.open=true;return true;
}
function flagChangedStats(state,old,record){
 if(!old?.entryId||statSignature(old.draft)===statSignature(record.draft))return false;
 const entry=state.entries.find(x=>x.id===old.entryId);
 if(!entry||entry.status!=="completed"||!entry.result?.trim())return false;
 entry.reviewNeeded="yes";
 entry.reviewReason="The observations, group selection, class intervals, quartile convention, outlier-screening rule, whisker rule or scale changed. Recheck earlier findings and interpretations in the IA.";
 state.completion.stages[entry.phase==="first"?"C30":"C40"]="needs-review";
 return true;
}
export function saveStatDraft(state){
 const studio=state.statStudio,previous=studio.figures.find(f=>f.id===studio.activeId);
 const saved=saveStatFigure(studio);
 if(!saved.ok)return saved;
 return {...saved,reviewNeeded:flagChangedStats(state,previous,saved.record)};
}
export function saveAndLinkStat(state){
 const studio=state.statStudio;
 if(!statAnalysis(studio.draft).ready)return{ok:false,error:"Fix the statistical data and diagram checks before linking."};
 const previous=studio.figures.find(f=>f.id===studio.activeId);
 let index=previous?.entryId?state.entries.findIndex(x=>x.id===previous.entryId):-1;
 const active=completeEntry(state);
 if(index<0&&["first","substantial"].includes(active?.phase)&&
  (active.phase==="substantial"||!active.statFigureId||active.statFigureId===studio.activeId))
  index=state.completion.activeEntryIndex;
 if(index<0){
  const first=startFirstRepresentation(state);
  if(!first.ok)return first;
  index=first.index??state.completion.activeEntryIndex;
 }
 const entry=state.entries[index];
 if(!entry)return{ok:false,error:"Cannot find a mathematical step for this diagram."};
 const saved=saveStatFigure(studio,entry.id);
 if(!saved.ok)return saved;
 const reviewNeeded=flagChangedStats(state,previous,saved.record);
 entry.statFigureId=saved.record.id;
 if(entry.phase==="first"&&(!entry.title.trim()||["First purposeful representation","distribution","table","diagram","other"].includes(entry.title)))
  entry.title=saved.record.draft.title;
 if(!entry.technique.trim())entry.technique={
  histogram:"Frequency-density histogram",box:"Box plot and quartiles",dot:"Dot plot",bar:"Comparative bar chart"
 }[saved.record.draft.kind];
 entry.kind="other";
 state.completion.activeEntryIndex=index;state.ui.mathIndex=index;
 if(entry.phase==="first")state.completion.fields.firstType="distribution";
 return {ok:true,record:saved.record,index,reviewNeeded};
}
