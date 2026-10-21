/**
 * Shared native dataset input for Graph Plotter, Statistical Diagrams and Table Studio.
 * Editing never fabricates measurements; source strings and recorded precision are retained.
 * Saved datasets are explicitly versioned snapshots, not background live links.
 */
import {finiteCell,splitHeading} from "./graph-core.js";

export const NATIVE_MAX_ROWS=500;
export const NATIVE_MAX_SHELF=6;
export const NATIVE_PAGE_ROWS=16;
export const NATIVE_LIMITS=Object.freeze({graph:10,stat:9,table:8});
const clean=(v,n=110)=>String(v??"").slice(0,n).replace(/\r?\n/g," ");
const validType=type=>Object.hasOwn(NATIVE_LIMITS,type);
const copy=x=>JSON.parse(JSON.stringify(x));
const countFilled=matrix=>matrix.reduce((n,r)=>n+r.filter(v=>String(v??"").trim()!=="").length,0);
const columnsFor=(draft,type)=>draft.columns.length||((type==="stat"&&draft.kind==="bar"||type==="stat"&&draft.histogramInput==="table")?3:2);
const ensureCols=(draft,type,count)=>{
 if(!validType(type)||!Number.isInteger(count)||count<1||count>NATIVE_LIMITS[type])return false;
 while(draft.columns.length<count)draft.columns.push("");
 if(type==="table"){
  draft.headings??=[];draft.unitDecisions??=[];
  while(draft.headings.length<count)draft.headings.push("");
  while(draft.unitDecisions.length<count)draft.unitDecisions.push({mode:"unsure",unit:""});
 }
 return true;
};
const invalidatePaste=d=>{d.raw="";d.pendingPaste=false;};
export function nativeGridSummary(draft){
 const rows=draft.matrix||[],width=draft.columns?.length||0;
 return {rows:rows.length,cols:width,filled:countFilled(rows),
  incomplete:rows.filter(r=>r.some(v=>String(v??"").trim())&&Array.from({length:width},(_,i)=>r[i]??"").some(v=>!String(v).trim())).length};
}
export function editNativeHeading(studio,type,index,value){
 const d=studio?.draft;
 if(!d||!validType(type)||!Number.isInteger(index)||index<0||index>=NATIVE_LIMITS[type])return false;
 if(!ensureCols(d,type,index+1))return false;
 const text=clean(value,95),old=d.columns[index],previous=splitHeading(old),heading=splitHeading(text);
 d.columns[index]=text;
 if(type==="graph"){
  for(const [axis,key] of [["x",d.xIndex],["y",d.yIndex]]){
   if(key===index&&(!d[axis+"Label"]||d[axis+"Label"]===previous.label))d[axis+"Label"]=heading.label;
   if(key===index&&heading.unit&&(!d[axis+"Unit"]||d[axis+"Unit"]===previous.unit)){
    d[axis+"Unit"]=heading.unit;d[axis+"UnitMode"]="unit";
   }
  }
 }else if(type==="stat"){
  if(index===(d.selected?.[0]??0)&&(!d.variable||d.variable===previous.label))d.variable=heading.label;
  if(index===(d.selected?.[0]??0)&&heading.unit&&(!d.unit||d.unit===previous.unit)){
   d.unit=heading.unit;d.unitMode="unit";
  }
 }else{
  d.headings[index]=heading.label;
  if(heading.unit&&(!d.unitDecisions[index].unit||d.unitDecisions[index].unit===previous.unit))
   d.unitDecisions[index]={mode:"unit",unit:heading.unit.slice(0,35)};
 }
 invalidatePaste(d);
 return true;
}
export function editNativeCell(studio,type,row,col,value){
 const d=studio?.draft;
 if(!d||!validType(type)||!Number.isInteger(row)||row<0||row>=NATIVE_MAX_ROWS||
  !Number.isInteger(col)||col<0||col>=NATIVE_LIMITS[type])return false;
 if(!ensureCols(d,type,Math.max(col+1,d.columns.length||1)))return false;
 while(d.matrix.length<=row)d.matrix.push(Array(d.columns.length).fill(""));
 for(const r of d.matrix)while(r.length<d.columns.length)r.push("");
 d.matrix[row][col]=clean(value,110);
 invalidatePaste(d);
 if(type==="stat"){
  if(d.kind==="bar"){
   if(!d.selected?.length)d.selected=d.columns.map((_,i)=>i).filter(i=>i!==d.categoryIndex).slice(0,4);
  }else if(!d.selected?.length)d.selected=[0];
 }
 if(type==="table"&&!d.selected?.length)d.selected=[col];
 return true;
}
export function addNativeRows(studio,type,count=1){
 const d=studio?.draft;
 if(!d||!validType(type)||![1,5].includes(count))return false;
 if(d.matrix.length+count>NATIVE_MAX_ROWS)return false;
 if(!ensureCols(d,type,columnsFor(d,type)))return false;
 for(let i=0;i<count;i++)d.matrix.push(Array(d.columns.length).fill(""));
 invalidatePaste(d);
 return true;
}
export function removeNativeRow(studio,type,index){
 const d=studio?.draft;if(!d||!validType(type)||!Number.isInteger(index)||index<0||index>=d.matrix.length)return false;
 d.matrix.splice(index,1);invalidatePaste(d);return true;
}
export function addNativeColumn(studio,type){
 const d=studio?.draft;if(!d||!validType(type)||columnsFor(d,type)>=NATIVE_LIMITS[type])return false;
 if(!ensureCols(d,type,columnsFor(d,type)+1))return false;
 for(const row of d.matrix)while(row.length<d.columns.length)row.push("");
 invalidatePaste(d);return true;
}
export function removeNativeColumn(studio,type,index){
 const d=studio?.draft;
 if(!d||!validType(type)||!Number.isInteger(index)||index<0||index>=d.columns.length||d.columns.length<=2)return false;
 d.columns.splice(index,1);
 for(const row of d.matrix)row.splice(index,1);
 if(type==="table"){
  d.headings.splice(index,1);d.unitDecisions.splice(index,1);
  d.selected=[...new Set(d.selected.filter(i=>i!==index).map(i=>i>index?i-1:i).filter(i=>i>=0&&i<d.columns.length))];
  d.categoryIndex=Math.min(d.columns.length-1,d.categoryIndex>=index?Math.max(0,d.categoryIndex-1):d.categoryIndex);
 }else if(type==="stat"){
  d.selected=[...new Set(d.selected.filter(i=>i!==index).map(i=>i>index?i-1:i))];
  for(const k of ["categoryIndex","lowIndex","highIndex","frequencyIndex"])
   d[k]=Math.max(0,Math.min(d.columns.length-1,d[k]>index?d[k]-1:d[k]));
 }else{
  d.xIndex=d.xIndex>index?d.xIndex-1:Math.min(d.xIndex,d.columns.length-1);
  d.yIndex=d.yIndex>index?d.yIndex-1:Math.min(d.yIndex,d.columns.length-1);
  if(d.xIndex===d.yIndex)d.yIndex=d.xIndex===0?1:0;
 }
 invalidatePaste(d);return true;
}
export function parseNativeRange(text){
 const str=String(text??"");
 if(str.length>85000)throw new Error("Paste a smaller selection (85,000 characters maximum).");
 const delim=str.includes("\t")?"\t":str.includes(";")&&!str.includes(",")?";":",";
 const rows=[];let row=[],cell="",quoted=false;
 for(let i=0;i<str.length;i++){
  const c=str[i];
  if(c==='"'){if(quoted&&str[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
  else if(c===delim&&!quoted){row.push(cell);cell="";}
  else if((c==="\r"||c==="\n")&&!quoted){
   if(c==="\r"&&str[i+1]==="\n")i++;
   row.push(cell);rows.push(row);row=[];cell="";
  }else cell+=c;
 }
 if(quoted)throw new Error("The pasted range contains an unfinished quoted cell.");
 row.push(cell);if(row.some(x=>x!=="")||rows.length===0)rows.push(row);
 if(rows.length>1&&rows.at(-1).every(x=>x===""))rows.pop();
 return rows;
}
export function pasteNativeRange(studio,type,startRow,startCol,text,{headings=false}={}){
 const d=studio?.draft;
 if(!d||!validType(type))return {ok:false,error:"Unknown worksheet."};
 let rows;try{rows=parseNativeRange(text);}catch(err){return{ok:false,error:err.message};}
 const height=rows.length-(headings?1:0),width=Math.max(...rows.map(r=>r.length));
 if(!Number.isInteger(startCol)||startCol<0||startCol+width>NATIVE_LIMITS[type]||
  !Number.isInteger(startRow)||startRow<0||startRow+Math.max(0,height)>NATIVE_MAX_ROWS)
  return {ok:false,error:"The pasted block exceeds the worksheet's 500-row or column limit."};
 if(!rows.every(r=>r.every(v=>clean(v,110)===String(v).replace(/\r?\n/g," "))))
  return {ok:false,error:"A pasted cell is longer than 110 characters. Shorten it before importing."};
 if(headings)rows[0].forEach((v,j)=>editNativeHeading(studio,type,startCol+j,v));
 rows.slice(headings?1:0).forEach((r,i)=>r.forEach((v,j)=>editNativeCell(studio,type,startRow+i,startCol+j,v)));
 return {ok:true,rows:Math.max(0,height),cols:width};
}
export function normalizeNativeShelf(raw){
 if(!Array.isArray(raw))return[];
 return raw.slice(0,NATIVE_MAX_SHELF).filter(x=>x&&typeof x==="object"&&/^data-[a-z0-9-]+$/i.test(x.id||""))
  .map(d=>({id:clean(d.id,65),name:clean(d.name,75),savedAt:clean(d.savedAt,40),
   columns:Array.isArray(d.columns)?d.columns.slice(0,10).map(x=>clean(x,95)):[],
   matrix:Array.isArray(d.matrix)?d.matrix.slice(0,NATIVE_MAX_ROWS)
    .filter(Array.isArray).map(row=>row.slice(0,10).map(x=>clean(x,110))):[],
   sourceKind:["unsure","primary","secondary","theoretical"].includes(d.sourceKind)?d.sourceKind:"unsure",
   sourceText:clean(d.sourceText,500)})).filter(d=>d.columns.length>=1&&d.matrix.length>0);
}
export function nativeSnapshot(draft,name=""){
 if(!draft?.columns?.length||!draft.matrix?.length||!countFilled(draft.matrix))
  return {ok:false,error:"Enter at least one real value and give each column a heading before saving or reusing this dataset."};
 if(draft.columns.some(h=>!String(h).trim()))
  return {ok:false,error:"Name every column before saving it for another generator."};
 return {ok:true,dataset:{name:clean(String(name).trim()||draft.title?.trim()||draft.columns.slice(0,2).join(" and "),75),
  columns:copy(draft.columns),matrix:copy(draft.matrix),
  sourceKind:draft.sourceKind||"unsure",sourceText:draft.sourceText||""}};
}
export function saveNativeDataset(state,type,name){
 if(!validType(type))return {ok:false,error:"Unknown generator."};
 const result=nativeSnapshot(state[type==="graph"?"graphStudio":type==="stat"?"statStudio":"tableStudio"].draft,name);
 if(!result.ok)return result;
 const list=state.dataShelf??[];
 if(list.length>=NATIVE_MAX_SHELF)return {ok:false,error:"The dataset shelf holds six copies. Remove an older snapshot before saving another."};
 const id="data-"+Date.now().toString(36)+"-"+Math.floor(Math.random()*100000).toString(36);
 const record={...result.dataset,id,savedAt:new Date().toISOString()};
 state.dataShelf=[...list,record];return {ok:true,record};
}
export function deleteNativeDataset(state,id){
 const before=state.dataShelf?.length||0;
 state.dataShelf=(state.dataShelf||[]).filter(d=>d.id!==id);
 return before!==state.dataShelf.length;
}
export function applyNativeDataset(studio,type,dataset){
 const d=studio?.draft;
 if(!d||!validType(type)||!dataset||!Array.isArray(dataset.columns)||!Array.isArray(dataset.matrix))
  return {ok:false,error:"Dataset cannot be read."};
 if(dataset.columns.length>NATIVE_LIMITS[type]||dataset.matrix.length>NATIVE_MAX_ROWS)
  return {ok:false,error:"This tool accepts up to "+NATIVE_LIMITS[type]+" columns and 500 rows. Select a smaller dataset without deleting the original."};
 if(type==="graph"&&dataset.columns.length<2)return {ok:false,error:"Graph Plotter needs two columns containing paired variables."};
 const columns=dataset.columns.map(x=>clean(x,95)),matrix=dataset.matrix.map(r=>
  Array.from({length:columns.length},(_,i)=>clean(r[i]??"",110)));
 d.columns=columns;d.matrix=matrix;invalidatePaste(d);
 studio.activeId=""; // Never overwrite a previously linked/saved figure on dataset transfer.
 d.title="";
 d.sourceKind=["primary","secondary"].includes(dataset.sourceKind)?dataset.sourceKind:
  type==="graph"&&dataset.sourceKind==="theoretical"?"theoretical":"unsure";
 d.sourceText=clean(dataset.sourceText,500);
 if(type==="graph"){
  d.kind="scatter"; // A genuine paired dataset should not be hidden behind an old function graph.
  d.xIndex=0;d.yIndex=1;d.xMin="";d.xMax="";d.yMin="";d.yMax="";
  for(const [axis,i] of [["x",0],["y",1]]){
   const heading=splitHeading(columns[i]);d[axis+"Label"]=heading.label;d[axis+"Unit"]=heading.unit;
   d[axis+"UnitMode"]=heading.unit?"unit":"unsure";
  }
 }else if(type==="stat"){
  const numeric=columns.map((_,i)=>({i,n:matrix.filter(row=>finiteCell(row[i])!==null).length}))
    .filter(r=>r.n>0).sort((a,b)=>b.n-a.n||a.i-b.i);
  d.selected=d.kind==="bar"?numeric.filter(r=>r.i!==0).slice(0,4).map(r=>r.i):
   numeric.slice(0,d.kind==="histogram"?1:5).map(r=>r.i);
  if(!d.selected.length)d.selected=[0];d.categoryIndex=0;
  d.lowIndex=0;d.highIndex=1;d.frequencyIndex=Math.min(columns.length-1,2);
  const {label,unit}=splitHeading(columns[d.selected[0]??0]);
  d.variable=label;d.unit=unit;d.unitMode=unit?"unit":"unsure";d.min="";d.max="";
 }else{
  d.headings=columns.map(h=>splitHeading(h).label);
  // A newly transferred dataset is not the same source variables: reset old formatting.
  d.columnFormats={};
  d.rowSelection="";d.selectionReason="";d.columnSelectionMode="all";d.displayColumns=[];
  d.calcA="";d.calcB="";d.calcC="";d.graphSnapshot=null;
  d.unitDecisions=columns.map(h=>{const {unit}=splitHeading(h);return{mode:unit?"unit":"unsure",unit};});
  const numeric=columns.map((_,i)=>({i,n:matrix.filter(row=>finiteCell(row[i])!==null).length}))
   .filter(r=>r.n>0).sort((a,b)=>b.n-a.n||a.i-b.i);
  d.selected=d.mode==="summary"?numeric.slice(0,3).map(x=>x.i):columns.map((_,i)=>i).slice(0,4);
  d.calcXIndex=numeric[0]?.i??0;
  d.calcYIndex=numeric.find(x=>x.i!==d.calcXIndex)?.i??Math.min(1,columns.length-1);
  d.categoryIndex=0;d.note="";d.purpose="";
 }
 return {ok:true,rows:matrix.length,cols:columns.length};
}
