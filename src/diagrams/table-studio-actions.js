/** Student-owned table edits and explicit, non-completing mathematical links. */
import {
 newTableDraft,normalizeTableDraft,importTableData,analyzeTable,saveTableFigure,tableSignature,tableFormatKey
} from "./table-studio-core.js";
import {completeEntry,startFirstRepresentation} from "../completing/engine.js";
const fields=new Set(["raw","headers","title","number","purpose","sourceKind","sourceText","note",
 "decimals","numberFormat","quartileRule","cellAlignment"]);
export function setTableField(studio,key,value){
 const d=studio?.draft;if(!d)return false;
 if(fields.has(key)){
  if(typeof value!=="string")return false;
  if(key==="cellAlignment"&&!["center","numeric"].includes(value))return false;
  const old=d[key];
  d[key]=value.slice(0,key==="raw"?85000:["purpose","sourceText","note"].includes(key)?500:140);
  if((key==="raw"||key==="headers")&&old!==d[key]&&d.matrix.length)d.pendingPaste=true;
  return true;
 }
 if(["showPercent","showRowLines","showColumnLines"].includes(key)){d[key]=value===true;return true;}
 if(key==="categoryIndex"){
  const i=Number(value);
  if(!Number.isInteger(i)||i<0||i>=d.columns.length)return false;
  d.categoryIndex=i;return true;
 }
 return false;
}
export function setTableColumn(studio,index,key,value){
 const d=studio?.draft;
 if(!d||!Number.isInteger(index)||index<0||index>=d.columns.length)return false;
 if(key==="heading"&&typeof value==="string"){
  d.headings[index]=value.slice(0,95);return true;
 }
 if(!d.unitDecisions[index])d.unitDecisions[index]={mode:"unsure",unit:""};
 if(key==="unitMode"&&["unsure","unit","dimensionless"].includes(value)){
  d.unitDecisions[index].mode=value;
  return true;
 }
 if(key==="unit"&&typeof value==="string"){
  d.unitDecisions[index].unit=value.slice(0,35);return true;
 }
 return false;
}
/** Change one displayed numeric column without touching stored measurements. */
export function setTableColumnFormat(studio,index,part,value){
 const d=studio?.draft;
 if(!d||!Number.isInteger(index)||index<0||index>4||!["mode","digits"].includes(part))return false;
 const output=analyzeTable(d).model;
 if(!output||index>=output.headers.length)return false;
 if(d.mode==="compact"?!output.numeric[index]:index<2)return false;
 const old=d.columnFormats?.[tableFormatKey(d,index)]||d.columnFormats?.[d.mode+":"+index]||{mode:"default",digits:"2"};
 if(part==="mode"&&!["default","dp","sf",...(d.mode==="compact"?["source"]:[])].includes(value))return false;
 if(part==="digits"&&(!/^[0-6]$/.test(String(value))||old.mode==="sf"&&String(value)==="0"))return false;
 const mode=part==="mode"?value:old.mode;
 const digits=part==="digits"?String(value):old.digits==="0"&&mode==="sf"?"2":old.digits||"2";
 if(!d.columnFormats||typeof d.columnFormats!=="object")d.columnFormats={};
 d.columnFormats[tableFormatKey(d,index)]={mode,digits};
 return true;
}
export function chooseTableMode(studio,mode){
 if(!["compact","summary","frequency"].includes(mode))return false;
 const d=studio.draft;if(d.mode===mode)return true;
 d.mode=mode;
 if(mode==="summary"){
  const selected=d.columns.map((_,i)=>i).filter(i=>
   d.matrix.some(row=>/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(String(row[i]||"").trim())));
  d.selected=selected.slice(0,3);
  d.measures=["mean","median"];
 }else if(mode==="compact")d.selected=d.columns.map((_,i)=>i).slice(0,Math.min(4,d.columns.length));
 d.categoryIndex=0;
 return true;
}
export function toggleTableVariable(studio,index,checked){
 const d=studio.draft;
 if(!Number.isInteger(index)||index<0||index>=d.columns.length)return false;
 const next=d.selected.filter(i=>i!==index);
 if(checked){
  if(next.length>=4)return false;
  next.push(index);
  next.sort((a,b)=>a-b);
 }
 d.selected=next;return true;
}
export function toggleTableMeasure(studio,key,checked){
 const d=studio.draft;
 if(!["mean","median","minmax","sd","iqr"].includes(key))return false;
 const next=d.measures.filter(m=>m!==key);
 if(checked){
  if(next.length>=3)return false;
  next.push(key);
 }
 d.measures=next;return true;
}
export function loadTable(studio,id){
 const previous=studio.figures.find(x=>x.id===id);
 if(!previous)return false;
 studio.activeId=id;studio.draft=normalizeTableDraft(previous.draft);studio.open=true;
 return true;
}
export function freshTable(studio){
 studio.activeId="";studio.draft=newTableDraft();studio.open=true;
}
function markChanged(state,old,record){
 if(!old?.entryId||tableSignature(old.draft)===tableSignature(record.draft))return false;
 const entry=state.entries.find(e=>e.id===old.entryId);
 if(!entry||entry.status!=="completed"||!entry.result?.trim())return false;
 entry.reviewNeeded="yes";
 entry.reviewReason="The numerical input, displayed values, summary measures or table selection changed. Recheck any completed calculation or interpretation in your IA.";
 state.completion.stages[entry.phase==="first"?"C30":"C40"]="needs-review";
 return true;
}
export function saveTableDraft(state){
 const studio=state.tableStudio,prior=studio.figures.find(f=>f.id===studio.activeId);
 const saved=saveTableFigure(studio);
 if(!saved.ok)return saved;
 return {...saved,reviewNeeded:markChanged(state,prior,saved.record)};
}
export function saveAndLinkTable(state){
 const studio=state.tableStudio,quality=analyzeTable(studio.draft);
 if(!quality.ready)return{ok:false,error:"Complete the table's mathematical and presentation checks before linking."};
 const prior=studio.figures.find(f=>f.id===studio.activeId);
 let index=prior?.entryId?state.entries.findIndex(e=>e.id===prior.entryId):-1;
 const active=completeEntry(state);
 if(index<0&&["first","substantial"].includes(active?.phase)&&
  (active.phase==="substantial"||!active.tableFigureId||active.tableFigureId===studio.activeId))
  index=state.completion.activeEntryIndex;
 if(index<0){
  const created=startFirstRepresentation(state);
  if(!created.ok)return created;
  index=created.index??state.completion.activeEntryIndex;
 }
 const entry=state.entries[index];
 if(!entry)return{ok:false,error:"No current mathematical step could be found."};
 const saved=saveTableFigure(studio,entry.id);
 if(!saved.ok)return saved;
 const reviewNeeded=markChanged(state,prior,saved.record);
 entry.tableFigureId=saved.record.id;
 if(entry.phase==="first"&&(!entry.title.trim()||["First purposeful representation","table","other"].includes(entry.title)))
  entry.title=saved.record.draft.title;
 if(!entry.technique.trim())
  entry.technique=quality.draft.mode==="summary"?"Descriptive summary statistics":
   quality.draft.mode==="frequency"?"Categorical frequency and percentage table":"Compact results table";
 entry.kind="other";
 state.completion.activeEntryIndex=index;state.ui.mathIndex=index;
 if(entry.phase==="first")state.completion.fields.firstType="table";
 return {ok:true,record:saved.record,index,reviewNeeded};
}
