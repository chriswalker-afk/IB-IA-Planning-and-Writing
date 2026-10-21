/**
 * Compact, genuinely useful mathematical tables for an IB Mathematics IA.
 * Large pasted datasets may be summarised, but raw data are never silently
 * truncated into a "presentable" table or moved into an appendix.
 */
import {finiteCell,splitHeading,formatGraphMath} from "./graph-core.js";
import {parseStatTable,boxStats} from "./stat-studio-core.js";
export const TABLE_MAX_ROWS=500,TABLE_MAX_COLS=8,TABLE_MAX_SAVED=12;
const trimmed=(x,n=120)=>typeof x==="string"?x.slice(0,n):"";
const object=x=>x&&typeof x==="object"&&!Array.isArray(x);
const sum=xs=>xs.reduce((s,v)=>s+v,0);
const mean=xs=>sum(xs)/xs.length;
const median=xs=>boxStats(xs).median;
const unitDefault=()=>({mode:"unsure",unit:""});
/** Strict, size-bounded representation of a Graph Plotter transfer.
 * A snapshot is intentionally static; it never silently refits after source edits.
 */
export function normalizeTableGraphSnapshot(raw){
 if(!object(raw)||raw.version!==1||!Array.isArray(raw.rows)||!raw.rows.length||
  raw.rows.length>TABLE_MAX_ROWS)return null;
 const rows=[];
 for(const row of raw.rows){
  if(!object(row)||typeof row.x!=="string"||typeof row.y!=="string"||
   row.x.length>120||row.y.length>120||finiteCell(row.x)===null||finiteCell(row.y)===null||
   typeof row.predicted!=="number"||!Number.isFinite(row.predicted)||
   typeof row.residual!=="number"||!Number.isFinite(row.residual))return null;
  rows.push({x:row.x,y:row.y,predicted:row.predicted,residual:row.residual});
 }
 const coefficients=Array.isArray(raw.coefficients)&&raw.coefficients.length<=4&&
  raw.coefficients.every(x=>typeof x==="number"&&Number.isFinite(x))?raw.coefficients.slice():[];
 const parameters={};
 if(object(raw.parameters))for(const [key,value] of Object.entries(raw.parameters).slice(0,20)){
  if(/^[a-zA-Z][a-zA-Z0-9]{0,29}$/.test(key)&&typeof value==="number"&&Number.isFinite(value))
   parameters[key]=value;
 }
 return {version:1,rows,coefficients,parameters,
  graphTitle:trimmed(raw.graphTitle,110),graphFigureId:trimmed(raw.graphFigureId,55),
  modelId:trimmed(raw.modelId,55),modelType:trimmed(raw.modelType,35),
  modelLabel:trimmed(raw.modelLabel,95),equation:trimmed(raw.equation,350),
  method:trimmed(raw.method,240),modelNote:trimmed(raw.modelNote,300),
  graphSourceX:trimmed(raw.graphSourceX,100),graphSourceY:trimmed(raw.graphSourceY,100)};
}
export function tableGraphSnapshotIssue(d){
 const snap=d.graphSnapshot;
 if(!snap)return "";
 if(d.mode!=="calculated")return "";
 if(d.columns.length!==2||d.matrix.length!==snap.rows.length||
  d.calcXIndex!==0||d.calcYIndex!==1)return "The graph snapshot no longer matches the imported source columns or row count. Re-transfer the model from Graph Plotter or switch to manual coefficients.";
 for(let i=0;i<snap.rows.length;i++){
  const actual=d.matrix[i],original=snap.rows[i];
  if(!actual||actual.length!==2||String(actual[0])!==original.x||String(actual[1])!==original.y)
   return "Source row "+(i+1)+" changed since transfer. Stored model predictions are not recalculated automatically; re-transfer the model or switch to manual coefficients.";
 }
 return "";
}
export const newTableDraft=()=>({
 mode:"compact",raw:"",headers:"auto",columns:[],matrix:[],pendingPaste:false,
 columnSelectionMode:"all",displayColumns:[],rowSelection:"",selectionReason:"",
 calcXIndex:0,calcYIndex:1,calcModel:"linear",calcA:"",calcB:"",calcC:"",
 calcShowPrediction:true,calcShowResidual:true,calcShowPercent:false,graphSnapshot:null,
 headings:[],unitDecisions:[],selected:[0],measures:["mean","median"],categoryIndex:0,showPercent:true,
 title:"",number:"1",purpose:"",sourceKind:"unsure",sourceText:"",note:"",
 decimals:"2",numberFormat:"source",quartileRule:"halves",showRowLines:true,
 showColumnLines:true,cellAlignment:"center",columnFormats:{}
});
export const newTableStudio=()=>({open:false,draft:newTableDraft(),figures:[],activeId:""});
export function normalizeTableDraft(raw){
 const d=newTableDraft(),r=object(raw)?raw:{};
 for(const key of ["mode","raw","headers","title","number","purpose","sourceKind","sourceText","note",
  "columnSelectionMode","rowSelection","selectionReason","calcModel","calcA","calcB","calcC",
  "decimals","numberFormat","quartileRule","cellAlignment"]){
  const max=key==="raw"?85000:key==="sourceText"||key==="purpose"||key==="note"?500:key==="selectionReason"?360:140;
  if(typeof r[key]==="string")d[key]=r[key].slice(0,max);
 }
 if(!["compact","summary","frequency","calculated"].includes(d.mode))d.mode="compact";
 if(!["all","custom"].includes(d.columnSelectionMode))d.columnSelectionMode="all";
 if(!["linear","quadratic"].includes(d.calcModel))d.calcModel="linear";
 if(!["auto","yes","no"].includes(d.headers))d.headers="auto";
 if(!["unsure","primary","secondary"].includes(d.sourceKind))d.sourceKind="unsure";
 if(!["source","fixed"].includes(d.numberFormat))d.numberFormat="source";
 if(!["0","1","2","3","4"].includes(d.decimals))d.decimals="2";
 if(!["halves","linear"].includes(d.quartileRule))d.quartileRule="halves";
 if(!["center","numeric"].includes(d.cellAlignment))d.cellAlignment="center";
 d.columns=Array.isArray(r.columns)?r.columns.slice(0,TABLE_MAX_COLS).map(x=>trimmed(x,95)):[];
 d.matrix=Array.isArray(r.matrix)?r.matrix.slice(0,TABLE_MAX_ROWS).filter(Array.isArray)
  .map(row=>row.slice(0,TABLE_MAX_COLS).map(x=>trimmed(x,120))):[];
 d.headings=d.columns.map((original,i)=>{
  const heading=Array.isArray(r.headings)?r.headings[i]:undefined;
  return typeof heading==="string"?trimmed(heading,95):trimmed(splitHeading(original).label,95);
 });
 d.unitDecisions=d.columns.map((original,i)=>{
  const fromHeader=splitHeading(original),rawDecision=Array.isArray(r.unitDecisions)?r.unitDecisions[i]:null;
  const mode=["unsure","unit","dimensionless"].includes(rawDecision?.mode)?rawDecision.mode:(fromHeader.unit?"unit":"unsure");
  return {mode,unit:typeof rawDecision?.unit==="string"?trimmed(rawDecision.unit,35):fromHeader.unit};
 });
 d.displayColumns=Array.isArray(r.displayColumns)?
  [...new Set(r.displayColumns.filter(Number.isInteger).filter(i=>i>=0&&i<d.columns.length))].sort((a,b)=>a-b).slice(0,5):[];
 d.calcXIndex=Number.isInteger(r.calcXIndex)&&r.calcXIndex>=0&&r.calcXIndex<d.columns.length?r.calcXIndex:0;
 d.calcYIndex=Number.isInteger(r.calcYIndex)&&r.calcYIndex>=0&&r.calcYIndex<d.columns.length?r.calcYIndex:Math.min(1,Math.max(0,d.columns.length-1));
 for(const key of ["calcShowPrediction","calcShowResidual","calcShowPercent"])
  if(typeof r[key]==="boolean")d[key]=r[key];
 d.selected=Array.isArray(r.selected)?
  [...new Set(r.selected.filter(Number.isInteger).filter(i=>i>=0&&i<d.columns.length))].slice(0,4):
  d.columns.map((_,i)=>i).slice(0,Math.min(3,d.columns.length));
 d.measures=Array.isArray(r.measures)?
  [...new Set(r.measures.filter(m=>["mean","median","minmax","sd","iqr"].includes(m)))].slice(0,3):
  ["mean","median"];
 d.categoryIndex=Number.isInteger(r.categoryIndex)?Math.max(0,Math.min(d.columns.length-1,r.categoryIndex)):0;
 if(typeof r.pendingPaste==="boolean")d.pendingPaste=r.pendingPaste;
 if(typeof r.showPercent==="boolean")d.showPercent=r.showPercent;
 if(typeof r.showRowLines==="boolean")d.showRowLines=r.showRowLines;
 if(typeof r.showColumnLines==="boolean")d.showColumnLines=r.showColumnLines;
 d.graphSnapshot=normalizeTableGraphSnapshot(r.graphSnapshot);
 if(object(r.columnFormats)){
  d.columnFormats={};
  for(const [key,rawFormat] of Object.entries(r.columnFormats).slice(0,18)){
   if(!/^(?:compact:[0-7]|calculated:(?:[0-4]|x|y|prediction|residual|percentage)|frequency:[0-4]|summary:(?:[0-4]|mean|median|sd|iqr|minmax))$/.test(key)||!object(rawFormat))continue;
   const mode=["default","source","dp","sf"].includes(rawFormat.mode)?rawFormat.mode:"default";
   const rawDigits=String(rawFormat.digits??"2");
   const digits=/^[0-6]$/.test(rawDigits)?rawDigits:"2";
   d.columnFormats[key]={mode,digits:mode==="sf"&&digits==="0"?"2":digits};
  }
 }
 return d;
}
export function normalizeTableStudio(raw){
 const v=object(raw)?raw:{},figures=(Array.isArray(v.figures)?v.figures:[]).slice(0,TABLE_MAX_SAVED)
  .filter(object).map(x=>({id:trimmed(x.id,65),entryId:trimmed(x.entryId,80),
   savedAt:trimmed(x.savedAt,38),draft:normalizeTableDraft(x.draft)}))
  .filter(f=>/^table-[a-z0-9-]+$/i.test(f.id));
 return {open:v.open===true,draft:normalizeTableDraft(v.draft),figures,
  activeId:figures.some(f=>f.id===v.activeId)?v.activeId:""};
}
export function importTableData(studio,raw){
 const d=studio.draft,parsed=parseStatTable(raw,d.headers,d.mode==="frequency"?"bar":"box");
 if(parsed.columns.length>TABLE_MAX_COLS)throw new Error("Select at most eight source columns.");
 const columns=parsed.columns,matrix=parsed.matrix;
 d.raw=String(raw).slice(0,85000);d.columns=columns;d.matrix=matrix;d.pendingPaste=false;
 d.headings=columns.map(c=>splitHeading(c).label);
 d.unitDecisions=columns.map(c=>{
  const parsedHeading=splitHeading(c);
  return {mode:parsedHeading.unit?"unit":"unsure",unit:parsedHeading.unit};
 });
 const numeric=columns.map((_,i)=>({index:i,count:matrix.filter(r=>finiteCell(r[i])!==null).length}))
  .filter(r=>r.count>0).sort((a,b)=>b.count-a.count||a.index-b.index);
 d.selected=(d.mode==="summary"?numeric.slice(0,3).map(x=>x.index):columns.map((_,i)=>i).slice(0,4));
 d.categoryIndex=0;d.columnFormats={};
 d.columnSelectionMode="all";d.displayColumns=[];d.rowSelection="";d.selectionReason="";
 d.calcA="";d.calcB="";d.calcC="";d.graphSnapshot=null;
 d.calcXIndex=numeric[0]?.index??0;
 d.calcYIndex=numeric.find(entry=>entry.index!==d.calcXIndex)?.index??Math.min(1,Math.max(0,d.columns.length-1));
 return {rows:matrix.length,columns:columns.length,hasHeaders:parsed.hasHeaders};
}
/** No silent sampling: a blank selection means every row, never the first eight.
 * The student must explicitly name source rows when the source exceeds eight.
 */
export function tableDisplayRows(d){
 const count=d.matrix?.length||0,raw=String(d.rowSelection||"").trim();
 if(!raw)return count<=8?
  {ok:true,indices:Array.from({length:count},(_,i)=>i),custom:false}:
  {ok:false,indices:[],custom:false,error:"Choose up to eight source row numbers. No rows have been selected automatically."};
 const tokens=raw.split(",").map(x=>x.trim());
 if(!tokens.length||tokens.some(x=>!/^\d+(?:\s*-\s*\d+)?$/.test(x)))
  return {ok:false,indices:[],custom:true,error:"Enter source row numbers separated by commas, such as 1, 4, 8-10."};
 const set=new Set();
 for(const token of tokens){
  const [a,b]=token.split("-").map(x=>Number(x.trim()));
  const first=a,last=b??a;
  if(!Number.isSafeInteger(first)||!Number.isSafeInteger(last)||first<1||last<first||last>count)
   return {ok:false,indices:[],custom:true,error:"Every selected row number must be between 1 and "+count+"."};
  if(last-first>8)return {ok:false,indices:[],custom:true,error:"Show at most eight source rows in one table."};
  for(let i=first;i<=last;i++)set.add(i-1);
  if(set.size>8)return {ok:false,indices:[],custom:true,error:"Show at most eight source rows in one table."};
 }
 const indices=[...set].sort((a,b)=>a-b);
 return {ok:indices.length>0,indices,custom:true};
}
export function tableDisplayColumns(d){
 const count=d.columns?.length||0;
 if(d.columnSelectionMode==="custom")return [...new Set(d.displayColumns||[])]
  .filter(i=>Number.isInteger(i)&&i>=0&&i<count).sort((a,b)=>a-b);
 return Array.from({length:count},(_,i)=>i);
}
export function tableSelectionDetails(d,columns,rows){
 const totalRows=d.matrix.length,totalCols=d.columns.length;
 const selectedRowSubset=rows.length<totalRows,selectedColSubset=columns.length<totalCols;
 return {selectedRowSubset,selectedColSubset,subset:selectedRowSubset||selectedColSubset,
  rowNumbers:rows.map(i=>i+1),rowCount:rows.length,sourceRows:totalRows,
  columnCount:columns.length,sourceColumns:totalCols};
}
const columnType=(d,index)=>{
 let numeric=0,other=0,blanks=0;
 for(const row of d.matrix){
  const value=String(row[index]??"").trim();
  if(!value){blanks++;continue;}
  if(finiteCell(value)!==null)numeric++;else other++;
 }
 return {numeric:numeric>0&&numeric>=other,mixed:numeric>0&&other>0,numericCount:numeric,
  otherCount:other,blanks};
};
export function tableHeader(d,index){
 const label=String(d.headings[index]||"").trim(),decision=d.unitDecisions[index]||unitDefault();
 const base=splitHeading(label).label||label;
 return decision.mode==="unit"&&decision.unit.trim()?base+" ("+decision.unit.trim()+")":label;
}
/** Display-only rules keyed to the output table column. Never edit the observations. */
/** Summary settings follow a named statistic if students reorder chosen measures. */
export const tableFormatKey=(d,index,mode=d.mode)=>{
 if(mode==="summary"&&index>=2&&d.measures?.[index-2])return "summary:"+d.measures[index-2];
 // Compact formats follow source columns, not positions in a selected subset.
 if(mode==="compact")return "compact:"+(tableDisplayColumns(d)[index]??index);
 // Calculated formats follow the mathematical quantity even when result columns are toggled.
 if(mode==="calculated"){
  if(index===0)return "calculated:x";
  if(index===1)return "calculated:y";
  const results=[...(d.calcShowPrediction?["prediction"]:[]),...(d.calcShowResidual?["residual"]:[]),
   ...(d.calcShowPercent?["percentage"]:[])];
  return "calculated:"+(results[index-2]??index);
 }
 return mode+":"+index;
};
export const tableColumnFormat=(d,index,mode=d.mode)=>{
 const stored=d.columnFormats?.[tableFormatKey(d,index,mode)]??d.columnFormats?.[mode+":"+index];
 const rawKind=["source","dp","sf"].includes(stored?.mode)?stored.mode:"default";
 const kind=mode==="calculated"&&index>=2&&rawKind==="source"?"default":rawKind;
 const digits=Number(stored?.digits);
 return {mode:kind,digits:Number.isInteger(digits)&&digits>=0&&digits<=6?digits:2};
};
const formatNumber=(number,kind,digits)=>{
 const value=kind==="sf"?Number(number).toPrecision(Math.max(1,digits)):Number(number).toFixed(digits);
 const clean=value.replace(/^-0(?=\.0+$|$)/, "0").replace(/^-0\.0+(?=e)/,match=>match.slice(1));
 return kind==="sf"?formatGraphMath(clean.replace(/e\+?(-?\d+)$/i,(_whole,power)=>" × 10^"+power)):clean;
};
const displayValue=(v,d,derived=false,index=-1,mode=d.mode)=>{
 const rule=tableColumnFormat(d,index,mode);
 const defaultSource=!derived&&["compact","calculated"].includes(mode)&&d.numberFormat==="source";
 const kind=rule.mode==="default"?(defaultSource?"source":"dp"):rule.mode;
 if(kind==="source"&&!derived)return String(v??"");
 const numeric=typeof v==="number"&&Number.isFinite(v)?v:finiteCell(v);
 if(numeric===null||!Number.isFinite(numeric))return String(v??"");
 const digits=rule.mode==="default"?Number(d.decimals):rule.digits;
 return formatNumber(numeric,kind==="sf"?"sf":"dp",digits);
};
const formatMeasure=(values,measure,rule)=>{
 const stats=boxStats(values,rule,"minmax"),avg=mean(values);
 if(measure==="mean")return avg;
 if(measure==="median")return stats.median;
 if(measure==="iqr")return stats.iqr;
 if(measure==="sd")return values.length>1?Math.sqrt(sum(values.map(v=>(v-avg)**2))/(values.length-1)):NaN;
 if(measure==="minmax")return [stats.min,stats.max];
 return null;
};
const measureLabels={mean:"Mean",median:"Median",iqr:"IQR",sd:"Sample SD",minmax:"Min–max"};
const addErr=(list,code,message)=>list.push({code,message});
const meaningfulLimit=label=>label.length<=58&&!/\n/.test(label);
export function analyzeTable(raw){
 const d=normalizeTableDraft(raw),problems=[],warnings=[];
 const fail=(code,message)=>addErr(problems,code,message);
 const warn=(code,message)=>addErr(warnings,code,message);
 if(!d.title.trim())fail("title","Add a short, descriptive table title.");
 if(d.title.length>95)fail("title-long","Shorten the table title so it fits the page.");
 if(!/^[1-9]\d{0,2}$/.test(d.number))fail("number","Give a positive table number (for example, 1 or 2).");
 if(d.sourceKind==="unsure")fail("source","Identify whether the table uses your own data or an external source.");
 if(d.sourceKind==="secondary"&&!d.sourceText.trim())fail("credit","Credit the published data source.");
 if(d.note.length>190)fail("note-length","Keep the table note short; explain the fuller reasoning in your IA text.");
 if(!d.matrix.length)fail("data","Enter actual data in the worksheet, or paste and import existing data.");
 if(d.pendingPaste)fail("unparsed","The pasted cells have changed. Read the latest values before exporting.");
 const headings=d.headings;
 const chooseRows=["compact","calculated"].includes(d.mode);
 const chosen=chooseRows?tableDisplayRows(d):{ok:true,indices:[],custom:false};
 const cols=d.mode==="compact"?tableDisplayColumns(d):
  d.mode==="calculated"?[d.calcXIndex,d.calcYIndex]:d.columns.map((_,i)=>i);
 const visibleHeadingIndices=["compact","calculated"].includes(d.mode)?cols:d.columns.map((_,i)=>i);
 if(visibleHeadingIndices.some(i=>!headings[i]?.trim()))fail("headings","Every displayed source column needs a meaningful heading.");
 if(visibleHeadingIndices.some(i=>!meaningfulLimit(headings[i]||"")))fail("headings-long",
  "Shorten displayed headings and put full explanations into your surrounding writing.");
 if(d.matrix.some(row=>row.some(c=>c.length>80||c.includes("\n"))))
  fail("cell-length","A cell is too long to format readably. Shorten it or move the explanation into the IA text.");
 const selection=chooseRows?tableSelectionDetails(d,cols,chosen.indices):null;
 if(chooseRows){
  if(!chosen.ok)fail(d.matrix.length>8&&!d.rowSelection.trim()?"raw-table-too-long":"row-selection",
   chosen.error||"Choose source row numbers to display.");
  if(chosen.ok&&(!chosen.indices.length||chosen.indices.length>8))
   fail("row-count","Choose between one and eight source rows.");
  if(selection?.subset&&d.selectionReason.trim().length<18)
   fail("selection-reason","Explain in at least a short sentence why these particular rows or columns are shown; do not conceal inconvenient data.");
  if(selection?.subset)warn("selected-subset","This is an explicitly selected subset, not the full dataset. Explain the choice and retain every original observation in your working files.");
 }
 const validSummary=d.mode==="summary",validFrequency=d.mode==="frequency",validCalculated=d.mode==="calculated";
 const provenance=selection?.subset?
  "Selected source rows "+selection.rowNumbers.join(", ")+" of "+selection.sourceRows+
  "; "+selection.columnCount+" of "+selection.sourceColumns+" source columns. Selection reason: "+d.selectionReason.trim():"";
 let model=null;
 if(d.mode==="compact"){
  if(cols.length===0)fail("no-columns","Choose at least one source column to display.");
  if(cols.length>5)fail("too-wide","Choose at most five source columns. Nothing has been removed automatically.");
  if(d.matrix.some(row=>row.length!==d.columns.length))fail("ragged","Every row in the source dataset needs the same number of cells.");
  const displayRows=chosen.ok?chosen.indices.map(i=>d.matrix[i]):[];
  if(displayRows.some(row=>cols.some(i=>!String(row[i]??"").trim())))
   fail("empty-cell","An included source row contains an empty displayed value. Check the data or explain a defensible selection.");
  const nums=cols.map(i=>{
   let numeric=0,other=0;
   for(const row of displayRows){
    const v=String(row[i]??"").trim();
    if(!v)continue;
    if(finiteCell(v)===null)other++;else numeric++;
   }
   return {numeric:numeric>0&&numeric>=other,mixed:numeric>0&&other>0};
  });
  if(nums.some(c=>c.mixed))fail("mixed-column","An included column mixes numerical and text values. Check the source measurements.");
  cols.forEach((i,j)=>{
   const u=d.unitDecisions[i]||unitDefault();
   if(nums[j].numeric&&u.mode==="unsure")fail("units","Confirm the unit or dimensionless status for displayed column "+(i+1)+".");
   if(nums[j].numeric&&u.mode==="unit"&&!u.unit.trim())fail("units","Enter the unit for displayed column "+(i+1)+".");
  });
  if(!problems.some(p=>["data","raw-table-too-long","row-selection","row-count","no-columns","too-wide","ragged","empty-cell","cell-length","mixed-column"].includes(p.code))){
   model={headers:cols.map(i=>tableHeader(d,i)),
    rows:displayRows.map(row=>cols.map((i,j)=>displayValue(row[i],d,false,j,"compact"))),
    numeric:nums.map(n=>n.numeric),kind:"compact",note:d.note||"",metadata:provenance,
    sourceRowIndices:chosen.indices,sourceColumnIndices:cols};
  }
  if(displayRows.length>5)warn("many-rows","Check each displayed row is necessary to understand the mathematics.");
 }else if(validCalculated){
  const x=d.calcXIndex,y=d.calcYIndex;
  if(d.columns.length<2||x===y)fail("calculated-variables","Choose two different numerical source columns: x and observed y.");
  if(!d.calcShowPrediction&&!d.calcShowResidual&&!d.calcShowPercent)
   fail("calculated-output","Choose at least one calculated result to display.");
  const snapshot=d.graphSnapshot;
  if(snapshot){
   const issue=tableGraphSnapshotIssue(d);
   if(issue)fail("graph-snapshot-stale",issue);
  }else{
   if(!["linear","quadratic"].includes(d.calcModel))fail("calculated-model","Choose a supported model.");
  }
  const coefficients=[d.calcA,d.calcB,...(d.calcModel==="quadratic"?[d.calcC]:[])];
  const numericCoeffs=snapshot?[]:coefficients.map(c=>finiteCell(c));
  if(!snapshot&&numericCoeffs.some(v=>v===null))
   fail("calculated-coefficients","Enter finite numerical coefficients for the model. Table Studio does not invent or fit them.");
  if([x,y].some(i=>i<0||i>=d.columns.length))fail("calculated-variables","Select columns that exist in your source data.");
  if([x,y].some(i=>{
   const u=d.unitDecisions[i]||unitDefault();
   return u.mode==="unsure"||u.mode==="unit"&&!u.unit.trim();
  }))fail("calculated-units","Confirm the units (or dimensionless status) of both source variables.");
  const rows=[];
  for(const index of chosen.ok?chosen.indices:[]){
   const rawRow=d.matrix[index],xv=finiteCell(rawRow?.[x]),yv=finiteCell(rawRow?.[y]);
   if(xv===null||yv===null){
    fail("calculated-source","Source row "+(index+1)+" has a missing or non-numeric x or y value; do not silently omit it.");continue;
   }
   const [a,b,c=0]=numericCoeffs;
   const original=snapshot?.rows[index];
   const predicted=snapshot?(original?.predicted??NaN):
    d.calcModel==="quadratic"?a*xv*xv+b*xv+c:a*xv+b;
   const residual=snapshot?(original?.residual??NaN):yv-predicted;
   if(!Number.isFinite(predicted)||!Number.isFinite(residual)){
    fail("calculated-overflow","Model calculation at source row "+(index+1)+" is not finite. Check coefficients and data.");continue;
   }
   if(d.calcShowPercent&&yv===0){
    fail("calculated-zero","Percentage deviation from an observed value of zero is undefined at source row "+(index+1)+". Turn that column off or choose justified nonzero observations.");continue;
   }
   const row=[displayValue(rawRow[x],d,false,0,"calculated"),displayValue(rawRow[y],d,false,1,"calculated")];
   if(d.calcShowPrediction)row.push(displayValue(predicted,d,true,row.length,"calculated"));
   if(d.calcShowResidual)row.push(displayValue(residual,d,true,row.length,"calculated"));
   if(d.calcShowPercent)row.push(displayValue(100*residual/Math.abs(yv),d,true,row.length,"calculated"));
   rows.push(row);
  }
  if(!problems.some(p=>["graph-snapshot-stale","calculated-source","calculated-overflow","calculated-zero","calculated-variables","calculated-coefficients","calculated-units","calculated-output","raw-table-too-long","row-selection","row-count"].includes(p.code))&&rows.length){
   const yUnit=d.unitDecisions[y].mode==="unit"?" ("+d.unitDecisions[y].unit+")":"";
   const label=snapshot?snapshot.modelLabel:d.calcModel==="quadratic"?"ŷ = a x^2 + b x + c":"ŷ = a x + b";
   const eq=snapshot?snapshot.equation:d.calcModel==="quadratic"?"a="+d.calcA+", b="+d.calcB+", c="+d.calcC:
    "a="+d.calcA+", b="+d.calcB;
   const headers=[tableHeader(d,x),tableHeader(d,y)];
   if(d.calcShowPrediction)headers.push("Predicted ŷ"+yUnit);
   if(d.calcShowResidual)headers.push("Residual y−ŷ"+yUnit);
   if(d.calcShowPercent)headers.push("Percentage deviation (%)");
   model={headers,rows,numeric:headers.map(()=>true),kind:"calculated",note:d.note||"",
    metadata:(snapshot?"Graph Plotter snapshot from "+snapshot.graphTitle+": "+label+"; "+eq+". "+snapshot.method+".":
      label+" ("+eq+").")+" Residual = observed − predicted."+
     (d.calcShowPercent?" Percentage deviation = 100 × residual / |observed|.":"")+
     (snapshot?" Predictions were transferred at full precision; this is not a live link.":" Calculated from unrounded source values.")+
     (provenance?" "+provenance:""),
    sourceRowIndices:chosen.indices,sourceColumnIndices:[x,y]};
  }
  warn("model-provenance",d.graphSnapshot?
   "Model results are a copy from Graph Plotter. Changing the graph does not automatically update this table; transfer it again after fitting a new model.":
   "Coefficients must come from a justified calculation or fitted model elsewhere in your IA. This table does not fit a model.");
 }else if(validSummary){
  if(!d.selected.length)fail("variables","Select at least one numerical column to summarise.");
  if(d.selected.length>4)fail("many-variables","Select at most four comparable variables/groups.");
  if(!d.measures.length)fail("measures","Choose one to three informative statistics.");
  if(d.measures.length>3)fail("many-measures","Use at most three summary measures so the table remains compact.");
  const selected=d.selected,commonUnits=[];
  let rows=[];
  for(const index of selected){
   const type=columnType(d,index),u=d.unitDecisions[index]||unitDefault();
   if(type.otherCount)fail("invalid-numeric",
    "Column '"+(headings[index]||index+1)+"' contains non-numeric values. Correct them before summarising.");
   if(type.blanks)warn("missing-observations",
    "There are "+type.blanks+" missing values in '"+headings[index]+"'. The displayed n excludes these; explain why values are missing.");
   if(type.numericCount<2)fail("small-sample",
    "At least two actual measurements are needed in '"+(headings[index]||"selected column")+"'.");
   if(!headings[index]?.trim())continue;
   if(u.mode==="unsure"||u.mode==="unit"&&!u.unit.trim())fail("summary-unit",
    "Confirm the measurement unit or dimensionless status for '"+headings[index]+"'.");
   commonUnits.push(u.mode==="dimensionless"?"(dimensionless)":u.unit.trim().toLowerCase());
   const values=d.matrix.map(row=>finiteCell(row[index])).filter(x=>x!==null);
   if(values.length>=2){
    const measures=d.measures.map(m=>{
     const x=formatMeasure(values,m,d.quartileRule);
     return Array.isArray(x)?x.map(v=>displayValue(v,d,true,d.measures.indexOf(m)+2,"summary")).join("–"):
      displayValue(x,d,true,d.measures.indexOf(m)+2,"summary");
    });
    rows.push([headings[index],String(values.length),...measures]);
   }
  }
  if(new Set(commonUnits).size>1)fail("incompatible-units",
   "For one comparison table, selected groups must share the same units. Convert consistently or use separate tables.");
  if(!problems.some(p=>["variables","invalid-numeric","small-sample","measures","many-measures","summary-unit","incompatible-units","headings","headings-long"].includes(p.code))
    &&rows.length&&d.measures.length){
   const unit=d.unitDecisions[selected[0]],suffix=unit.mode==="unit"?" ("+unit.unit+")":"";
   const outputHeaders=["Variable / group","n",...d.measures.map(m=>measureLabels[m]+suffix)];
   model={headers:outputHeaders,rows,numeric:[false,true,...d.measures.map(()=>true)],
    kind:"summary",note:d.note||"",
    metadata:(d.measures.includes("sd")?"Sample SD uses n − 1. ":"")+
     (d.measures.includes("iqr")?
      (d.quartileRule==="halves"?"IQR from median-of-halves quartiles.":"IQR from linearly interpolated quartiles. "):"")+
     "Calculations use the original unrounded observations."};
   if(d.measures.includes("minmax"))model.numeric[d.measures.indexOf("minmax")+2]=false;
  }
 }else if(validFrequency){
  if(!d.columns.length)fail("category-col","Choose a column containing discrete responses.");
  const col=d.categoryIndex,counts=new Map();
  let missing=0;
  for(const row of d.matrix){
   const name=String(row[col]??"").trim();
   if(!name){missing++;continue;}
   counts.set(name,(counts.get(name)||0)+1);
  }
  if(missing)fail("missing-category",missing+" missing category value(s) need resolving before export.");
  if(counts.size<2)fail("categories","At least two distinct categories are needed.");
  if(counts.size>8)fail("too-many-categories",
   "More than eight categories would make this table too long. Group categories mathematically in your source sheet and justify the grouping; do not hide categories automatically.");
  if([...counts.keys()].some(s=>s.length>32))fail("long-category",
   "Shorten category labels in the source sheet, explaining abbreviations in your IA.");
  const total=sum([...counts.values()]);
  if(!problems.some(p=>["missing-category","categories","too-many-categories","long-category"].includes(p.code))
   &&total>=2){
   const labels=[headings[col]||"Category","Frequency (count)"];
   if(d.showPercent)labels.push("Percentage (%)");
   const rows=[...counts.entries()].map(([name,n])=>[name,String(n),...(d.showPercent?[displayValue(100*n/total,d,true,2,"frequency")]:[])]);
   rows.push(["Total",String(total),...(d.showPercent?["100"]:[])]);
   model={headers:labels,rows,numeric:[false,true,...(d.showPercent?[true]:[])],kind:"frequency",
    note:d.note||"",metadata:"Denominator: all "+total+" non-missing responses; every response is counted once."};
  }
 }
 if(model){
  if(model.headers.some(x=>x.length>58))fail("formatted-headings",
   "The resulting headings are too long. Use a shorter label or reduce the number of displayed statistics.");
  if(model.rows.some(row=>row.some(c=>String(c).length>58)))fail("formatted-cells",
   "The resulting table contains a very long cell. Shorten the source label or change the layout.");
  if(model.headers.length>5)fail("formatted-wide",
   "This summary is too wide. Select fewer statistics or groups.");
 }
 if(d.mode==="compact"||d.mode==="calculated"){
  const custom=Array.from({length:model?.headers.length||0},(_,i)=>tableColumnFormat(d,i)).some(f=>f.mode==="dp"||f.mode==="sf");
  if(custom)warn("column-rounding",
   "Custom decimal places or significant figures affect displayed cells only. Check that the number of digits reflects actual measurement resolution; the source observations are unchanged.");
 }
 if(d.numberFormat==="fixed"&&["compact","calculated"].includes(d.mode))
  warn("rounding","Fixed decimal places change only the displayed values. Do not claim greater measurement accuracy or round intermediate calculations.");
 if(d.mode!=="compact")
  warn("display-precision","Choose sensible decimal places for derived values. Displayed digits are not a statement of measurement uncertainty.");
 if(d.purpose.trim().length===0)warn("purpose",
  "Before the table in your IA, explain which mathematical question it helps answer.");
 if(!model&&d.matrix.length)warn("no-preview","A valid compact output cannot yet be made from these cells.");
 return {ready:problems.length===0&&!!model,problems,warnings,model,draft:d};
}
export const tableSignature=d=>JSON.stringify([d.mode,d.matrix,d.columns,d.headings,d.unitDecisions,
 d.selected,d.measures,d.categoryIndex,d.showPercent,d.decimals,d.numberFormat,d.quartileRule,d.columnFormats,
 d.columnSelectionMode,d.displayColumns,d.rowSelection,d.selectionReason,d.calcXIndex,d.calcYIndex,d.calcModel,
 d.calcA,d.calcB,d.calcC,d.calcShowPrediction,d.calcShowResidual,d.calcShowPercent,d.graphSnapshot]);
export function saveTableFigure(studio,entryId=""){
 const q=analyzeTable(studio.draft);
 if(!q.ready)return {ok:false,error:"Resolve the table size, source, units and mathematical quality checks before saving.",checks:q};
 const existing=studio.figures.find(f=>f.id===studio.activeId);
 if(!existing&&studio.figures.length>=TABLE_MAX_SAVED)
  return {ok:false,error:"Twelve tables are already saved. Earlier student work has not been overwritten."};
 const id=existing?.id||"table-"+Date.now().toString(36)+"-"+Math.floor(Math.random()*9999).toString(36);
 const record={id,entryId:entryId||existing?.entryId||"",savedAt:new Date().toISOString(),draft:q.draft};
 const index=studio.figures.findIndex(f=>f.id===id);
 if(index<0)studio.figures.push(record);else studio.figures[index]=record;
 studio.activeId=id;return {ok:true,record};
}
