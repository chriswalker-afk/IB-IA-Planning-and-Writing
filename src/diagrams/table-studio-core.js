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
export const newTableDraft=()=>({
 mode:"compact",raw:"",headers:"auto",columns:[],matrix:[],pendingPaste:false,
 columnSelectionMode:"all",displayColumns:[],rowSelection:"",selectionReason:"",
 calcXIndex:0,calcYIndex:1,calcModel:"linear",calcA:"",calcB:"",calcC:"",
 calcShowPrediction:true,calcShowResidual:true,calcShowPercent:false,
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
 if(object(r.columnFormats)){
  d.columnFormats={};
  for(const [key,rawFormat] of Object.entries(r.columnFormats).slice(0,18)){
   if(!/^(?:compact:[0-4]|frequency:[0-4]|summary:(?:[0-4]|mean|median|sd|iqr|minmax))$/.test(key)||!object(rawFormat))continue;
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
 d.calcA="";d.calcB="";d.calcC="";
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
export const tableFormatKey=(d,index,mode=d.mode)=>mode==="summary"&&index>=2&&d.measures?.[index-2]?
 "summary:"+d.measures[index-2]:mode+":"+index;
export const tableColumnFormat=(d,index,mode=d.mode)=>{
 const stored=d.columnFormats?.[tableFormatKey(d,index,mode)]??d.columnFormats?.[mode+":"+index];
 const kind=["source","dp","sf"].includes(stored?.mode)?stored.mode:"default";
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
 const defaultSource=!derived&&d.mode==="compact"&&d.numberFormat==="source";
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
 if(headings.some(h=>!h.trim()))fail("headings","Every displayed column needs a meaningful heading.");
 if(headings.some(h=>!meaningfulLimit(h)))fail("headings-long","Shorten long headings and put full explanations into your surrounding writing.");
 if(d.matrix.some(row=>row.some(c=>c.length>80||c.includes("\n"))))
  fail("cell-length","A cell is too long to format readably. Shorten it or move the explanation into the IA text.");
 const validSummary=d.mode==="summary",validFrequency=d.mode==="frequency";
 let model=null;
 if(d.mode==="compact"){
  if(d.matrix.length>8)fail("raw-table-too-long",
   "This is a long raw-data table. Do not include it in the IA or appendix. Use a summary table or a graph instead.");
  if(d.columns.length>5)fail("too-wide","Use no more than five columns in a compact IA table. Select a smaller purposeful range.");
  if(d.matrix.some(row=>row.length!==d.columns.length))fail("ragged","Every row needs the same number of cells.");
  if(d.matrix.some(row=>row.some(cell=>!String(cell).trim())))
   fail("empty-cell","An empty displayed cell needs an explicit, mathematically meaningful value or explanation.");
  const nums=d.columns.map((_,i)=>columnType(d,i));
  if(nums.some(c=>c.mixed))fail("mixed-column",
   "A column mixes numerical values and text. Check errors or missing measurements rather than silently treating them as labels.");
  nums.forEach((n,i)=>{
   const u=d.unitDecisions[i]||unitDefault();
   if(n.numeric&&u.mode==="unsure")fail("units","For numerical column "+(i+1)+", state a unit or choose dimensionless.");
   if(n.numeric&&u.mode==="unit"&&!u.unit.trim())fail("units","Enter the unit for column "+(i+1)+".");
  });
  if(!problems.some(p=>["data","raw-table-too-long","too-wide","ragged","empty-cell","cell-length","mixed-column"].includes(p.code))){
   model={headers:d.columns.map((_,i)=>tableHeader(d,i)),
    rows:d.matrix.map(row=>row.map((value,index)=>displayValue(value,d,false,index))),
    numeric:nums.map(n=>n.numeric),kind:"compact",
    note:d.note||"",metadata:""};
  }
  if(d.matrix.length>5)warn("many-rows",
   "Check that every displayed row is needed to follow your mathematics. The complete dataset belongs in working files.");
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
 if(d.mode==="compact"){
  const custom=d.columns.map((_,i)=>tableColumnFormat(d,i)).some(f=>f.mode==="dp"||f.mode==="sf");
  if(custom)warn("column-rounding",
   "Custom decimal places or significant figures affect displayed cells only. Check that the number of digits reflects actual measurement resolution; the source observations are unchanged.");
 }
 if(d.numberFormat==="fixed"&&d.mode==="compact")
  warn("rounding","Fixed decimal places change only the displayed values. Do not claim greater measurement accuracy or round intermediate calculations.");
 if(d.mode!=="compact")
  warn("display-precision","Choose sensible decimal places for derived values. Displayed digits are not a statement of measurement uncertainty.");
 if(d.purpose.trim().length===0)warn("purpose",
  "Before the table in your IA, explain which mathematical question it helps answer.");
 if(!model&&d.matrix.length)warn("no-preview","A valid compact output cannot yet be made from these cells.");
 return {ready:problems.length===0&&!!model,problems,warnings,model,draft:d};
}
export const tableSignature=d=>JSON.stringify([d.mode,d.matrix,d.columns,d.headings,d.unitDecisions,
 d.selected,d.measures,d.categoryIndex,d.showPercent,d.decimals,d.numberFormat,d.quartileRule,d.columnFormats]);
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
