/**
 * Statistical diagram mathematics for IB IA Pathfinder.
 * Genuine student data only: no seeded points, auto-fitted distributions, or server transfer.
 * Quartile conventions are explicit; histogram height is frequency density.
 */
import {escapeGraph,finiteCell,splitHeading} from "./graph-core.js";
import {continuousBins,groupedClassBins} from "./continuous-classes.js";

export const STAT_TYPES=Object.freeze([
 ["histogram","Histogram","Continuous measurements with class widths and frequency density."],
 ["box","Box plot","Distribution, median, IQR and possible outliers; compare groups."],
 ["dot","Dot plot","See actual measured values and repeated readings."],
 ["bar","Comparative bar chart","Compare categories using counts or within-group percentages."]
]);
export const MAX_STAT_ROWS=500,MAX_STAT_COLS=9,MAX_STAT_FIGURES=12,MAX_STAT_RAW=85000;
const txt=(v,n=120)=>typeof v==="string"?v.slice(0,n):"";
const finite=v=>typeof v==="number"&&Number.isFinite(v);
const ncell=x=>finiteCell(x);
const valid=v=>v&&typeof v==="object"&&!Array.isArray(v);
export function newStatDraft(){
 return {
  kind:"histogram",raw:"",columns:[],matrix:[],pendingPaste:false,headers:"auto",
  selected:[0],categoryIndex:0,lowIndex:0,highIndex:1,frequencyIndex:2,
  histogramInput:"raw",binWidth:"",binStart:"",barMode:"count",
  quartileRule:"halves",outlierRule:"tukey",
  title:"",figureNumber:"1",variable:"",unit:"",unitMode:"unsure",sourceKind:"unsure",sourceText:"",
  caption:"",min:"",max:"",showGrid:true,showOutliers:true,showLabels:true
 };
}
export function normalizeStatDraft(raw){
 const d=newStatDraft(),r=valid(raw)?raw:{};
 for(const key of ["kind","raw","headers","histogramInput","binWidth","binStart","barMode",
  "quartileRule","outlierRule","title","figureNumber","variable","unit","unitMode","sourceKind","sourceText",
  "caption","min","max"]){
  const cap=key==="raw"?MAX_STAT_RAW:key==="sourceText"?480:key==="caption"?480:150;
  d[key]=txt(r[key],cap)|| (typeof r[key]==="string"?"":d[key]);
 }
 if(!STAT_TYPES.some(t=>t[0]===d.kind))d.kind="histogram";
 if(!["auto","yes","no"].includes(d.headers))d.headers="auto";
 if(!["raw","table"].includes(d.histogramInput))d.histogramInput="raw";
 if(!["count","percent"].includes(d.barMode))d.barMode="count";
 if(!["halves","linear"].includes(d.quartileRule))d.quartileRule="halves";
 if(!["tukey","minmax"].includes(d.outlierRule))d.outlierRule="tukey";
 if(!["unit","dimensionless","unsure"].includes(d.unitMode))d.unitMode="unsure";
 if(!["primary","secondary","unsure"].includes(d.sourceKind))d.sourceKind="unsure";
 d.columns=Array.isArray(r.columns)?r.columns.slice(0,MAX_STAT_COLS).map(x=>txt(x,110)):[];
 d.matrix=Array.isArray(r.matrix)?r.matrix.slice(0,MAX_STAT_ROWS)
  .filter(Array.isArray).map(row=>row.slice(0,MAX_STAT_COLS).map(x=>txt(x,115))):[];
 const selected=Array.isArray(r.selected)?r.selected.filter(Number.isInteger):[];
 d.selected=[...new Set(selected.filter(x=>x>=0&&x<d.columns.length))].slice(0,5);
 if(!d.selected.length&&!Array.isArray(r.selected))d.selected=[0];
 for(const key of ["categoryIndex","lowIndex","highIndex","frequencyIndex"]){
  d[key]=Number.isInteger(r[key])?Math.min(Math.max(0,r[key]),Math.max(0,d.columns.length-1)):d[key];
 }
 for(const key of ["pendingPaste","showGrid","showOutliers","showLabels"]){
  if(typeof r[key]==="boolean")d[key]=r[key];
 }
 return d;
}
export const newStatStudio=()=>({open:false,draft:newStatDraft(),figures:[],activeId:""});
export function normalizeStatStudio(raw){
 const s=newStatStudio(),r=valid(raw)?raw:{};
 const figures=(Array.isArray(r.figures)?r.figures:[]).slice(0,MAX_STAT_FIGURES).filter(valid)
  .map(f=>({id:txt(f.id,65),entryId:txt(f.entryId,80),savedAt:txt(f.savedAt,38),draft:normalizeStatDraft(f.draft)}))
  .filter(f=>/^stat-[a-z0-9-]+$/i.test(f.id));
 return {open:r.open===true,draft:normalizeStatDraft(r.draft),figures,
  activeId:figures.some(f=>f.id===r.activeId)?r.activeId:""};
}
function parseDelimited(s,delimiter){
 const rows=[];let current=[],cell="",inQuote=false;
 for(let i=0;i<s.length;i++){
  const c=s[i];
  if(c==='"'){
   if(inQuote&&s[i+1]==='"'){cell+='"';i++;}
   else inQuote=!inQuote;
  }else if(c===delimiter&&!inQuote){current.push(cell.trim());cell="";}
  else if((c==="\r"||c==="\n")&&!inQuote){
   if(c==="\r"&&s[i+1]==="\n")i++;
   current.push(cell.trim());if(current.some(x=>x!==""))rows.push(current);
   current=[];cell="";
  }else cell+=c;
 }
 if(inQuote)throw new Error("One quoted cell is unfinished. Check the copied table.");
 current.push(cell.trim());if(current.some(x=>x!==""))rows.push(current);
 return rows;
}
export function parseStatTable(raw,headers="auto",kind="box"){
 const s=String(raw??"");
 if(!s.trim())throw new Error("Paste genuine measurements or a frequency table from Google Sheets.");
 if(s.length>MAX_STAT_RAW)throw new Error("Data exceed 85,000 characters. Select a smaller range.");
 const delimiter=s.includes("\t")?"\t":s.includes(";")&&!s.includes(",")?";":",";
 const rows=parseDelimited(s,delimiter);
 if(!rows.length)throw new Error("No table rows were found.");
 if(rows.length>MAX_STAT_ROWS+1)throw new Error("Select at most 500 data rows.");
 const width=Math.max(...rows.map(row=>row.length));
 if(width>MAX_STAT_COLS)throw new Error("Use no more than 9 columns at once.");
 if(rows.some(row=>row.length!==width))throw new Error("All rows must contain the same number of columns. Check your selection or CSV commas.");
 const first=rows[0];
 const hasHeaders=headers==="yes"||headers!=="no"&&(
  kind==="bar"?
   first.slice(1).some(x=>ncell(x)===null)||/^(category|choice|response|option|type|class|group|item|outcome|answer|year)$/i.test(first[0].trim()):
   first.some(x=>ncell(x)===null)
 );
 const columns=Array.from({length:width},(_,i)=>
  hasHeaders?txt(first[i]||"Column "+(i+1),110):"Column "+(i+1));
 const matrix=rows.slice(hasHeaders?1:0).map(row=>row.map(x=>txt(x,115)));
 if(matrix.length===0)throw new Error("No actual data rows were found.");
 if(matrix.length>MAX_STAT_ROWS)throw new Error("Select at most 500 data rows.");
 return {columns,matrix,hasHeaders,delimiter};
}
export function importStatTable(studio,raw){
 const d=studio.draft;
 const data=parseStatTable(raw,d.headers,d.kind);
 d.raw=String(raw).slice(0,MAX_STAT_RAW);
 d.columns=data.columns;d.matrix=data.matrix;d.pendingPaste=false;
 const numeric=data.columns.map((_,i)=>({
  index:i,valid:data.matrix.filter(row=>ncell(row[i])!==null).length
 })).filter(x=>x.valid>0).sort((a,b)=>b.valid-a.valid||a.index-b.index);
 d.selected=numeric.slice(0,d.kind==="histogram"?1:Math.min(4,numeric.length)).map(x=>x.index);
 if(!d.selected.length)d.selected=[0];
 if(d.kind==="bar"){
  d.categoryIndex=0;d.selected=numeric.filter(x=>x.index!==d.categoryIndex).slice(0,4).map(x=>x.index);
 }else if(d.kind==="histogram"&&d.histogramInput==="table"){
  d.lowIndex=0;d.highIndex=1;d.frequencyIndex=2;
 }
 const heading=data.columns[d.selected[0]??0]||"";
 const split=splitHeading(heading);
 if(!d.variable.trim()||d.variable==="Value")d.variable=split.label;
 if(split.unit){d.unit=split.unit;d.unitMode="unit";}
 return {rows:data.matrix.length,columns:data.columns.length,hasHeaders:data.hasHeaders};
}
const median=sorted=>{
 if(!sorted.length)return null;
 const n=sorted.length,m=n>>1;
 return n%2?sorted[m]:(sorted[m-1]+sorted[m])/2;
};
function quantileLinear(sorted,p){
 if(sorted.length===1)return sorted[0];
 const index=p*(sorted.length-1),a=Math.floor(index),b=Math.ceil(index);
 return sorted[a]+(sorted[b]-sorted[a])*(index-a);
}
export function boxStats(values,rule="halves",outlierRule="tukey"){
 const a=values.slice().sort((x,y)=>x-y),n=a.length;
 if(!n)return null;
 const med=median(a);
 const lower=a.slice(0,Math.floor(n/2)),upper=a.slice(Math.ceil(n/2));
 const q1=rule==="linear"?quantileLinear(a,.25):(median(lower)??a[0]);
 const q3=rule==="linear"?quantileLinear(a,.75):(median(upper)??a[n-1]);
 const iqr=q3-q1,fences=[q1-1.5*iqr,q3+1.5*iqr];
 const outliers=outlierRule==="tukey"?a.filter(x=>x<fences[0]||x>fences[1]):[];
 const core=outlierRule==="tukey"?a.filter(x=>x>=fences[0]&&x<=fences[1]):a;
 return {n,min:a[0],q1,median:med,q3,max:a[n-1],iqr,
  lowWhisker:core[0]??a[0],highWhisker:core.at(-1)??a[n-1],outliers,fences,values:a};
}
const numericCols=d=>d.selected.filter(i=>i>=0&&i<d.columns.length);
function columnData(d,index){
 const values=[];let skipped=0;
 for(const row of d.matrix){
  if(row[index]==="")continue;
  const value=ncell(row[index]);
  if(value===null)skipped++;
  else values.push(value);
 }
 return {values,skipped};
}
function buildRawHistogram(d){
 const col=numericCols(d)[0],source=columnData(d,col);
 const b=continuousBins(source.values,d.binWidth,d.binStart,36);
 return {...b,values:source.values,skipped:source.skipped};
}
function buildGroupedHistogram(d){
 if(d.columns.length<3)return {bins:[],error:"A grouped-frequency histogram needs lower, upper and frequency columns."};
 const result=groupedClassBins(d.matrix,d.lowIndex,d.highIndex,d.frequencyIndex,36);
 return {...result,values:[],skipped:0};
}
function barAnalysis(d){
 const categories=[],names=numericCols(d).filter(i=>i!==d.categoryIndex);
 if(!names.length)return {categories:[],error:"Choose at least one numerical group column, different from the category column."};
 const seen=new Set();
 for(let i=0;i<d.matrix.length;i++){
  const row=d.matrix[i],category=(row[d.categoryIndex]||"").trim();
  if(!category)return {categories:[],error:"Row "+(i+1)+" has an empty category."};
  if(seen.has(category))return {categories:[],error:"The category '"+category+"' appears more than once. Combine it before graphing."};
  seen.add(category);
  const counts=names.map(index=>ncell(row[index]));
  if(counts.some(x=>x===null||x<0||!Number.isSafeInteger(x)))
   return {categories:[],error:"Row "+(i+1)+" needs a non-negative whole-number count in every selected group."};
  categories.push({category,counts});
 }
 const totals=names.map((_,i)=>categories.reduce((s,r)=>s+r.counts[i],0));
 if(d.barMode==="percent"&&totals.some(n=>n<=0))
  return {categories:[],error:"A group with zero observations cannot be converted into percentages."};
 return {categories:categories.map(c=>({...c,values:c.counts.map((n,i)=>d.barMode==="count"?n:100*n/totals[i])})),
  names:names.map(i=>d.columns[i]),totals};
}
export function statAnalysis(raw){
 const d=normalizeStatDraft(raw),problems=[],warnings=[];
 const fail=(code,message)=>problems.push({code,message});
 const warn=(code,message)=>warnings.push({code,message});
 if(!d.title.trim())fail("title","Give your diagram a descriptive title.");
 if(!d.variable.trim())fail("variable","Name the measured quantity or categorical characteristic.");
 if(d.kind!=="bar"){
  if(d.unitMode==="unsure")fail("unit-decision","Confirm whether the quantity has a unit.");
  if(d.unitMode==="unit"&&!d.unit.trim())fail("unit","Give the measured unit.");
 }
 if(d.sourceKind==="unsure")fail("source-kind","Confirm where the genuine data came from.");
 if(d.sourceKind==="secondary"&&!d.sourceText.trim())fail("source","Credit the original published dataset.");
 if(!d.matrix.length)fail("data","Paste a genuine table and choose Read pasted table.");
 if(d.pendingPaste)fail("pending","The pasted data have changed. Select Read pasted table to use the latest values.");
 if(d.title.length>95)warn("title-length","The title may be too long to read when printed.");
 if(d.matrix.length>300)warn("many-rows","Large data tables should stay in working files, not the IA or appendix.");
 let result={kind:d.kind};
 if(d.kind==="histogram"){
  const data=d.histogramInput==="table"?buildGroupedHistogram(d):buildRawHistogram(d);
  if(data.error)fail("histogram-data",data.error);
  const bins=data.bins||[];
  if(bins.length<1&&!data.error)fail("histogram-empty","No usable histogram classes were found.");
  const total=bins.reduce((s,b)=>s+b.frequency,0);
  if(total<2&&!data.error)fail("histogram-n","At least two observations are needed.");
  const gaps=bins.some((b,i)=>i>0&&b.low>bins[i-1].high+Math.max(1,Math.abs(b.low))*1e-10);
  if(gaps)warn("class-gaps","The intervals contain gaps. Show these as empty space on the continuous x-axis; do not close them visually.");
  if(d.histogramInput==="raw"&&data.skipped)fail("invalid-values",data.skipped+" non-numeric value(s) are present. Correct or remove them in the source before graphing.");
  if(d.histogramInput==="raw"&&bins.length>20)warn("many-bins","Consider whether many narrow bins communicate the distribution effectively.");
  if(d.histogramInput==="table")warn("class-assumption","Explain how grouped data and the class boundaries were obtained; original values cannot be recovered from frequencies.");
  result={...result,bins,total,skipped:data.skipped||0};
 }else if(d.kind==="box"||d.kind==="dot"){
  const series=numericCols(d).map(i=>{
   const data=columnData(d,i);
   return {index:i,name:d.columns[i]||"Group "+(i+1),...data,
    box:d.kind==="box"?boxStats(data.values,d.quartileRule,d.outlierRule):null};
  });
  if(!series.length)fail("series","Select at least one numeric column.");
  if(series.some(s=>s.name.length>24))fail("series-labels","Shorten group headings to 24 characters or fewer for a readable diagram.");
  if(series.some(s=>s.values.length<(d.kind==="box"?5:2)))
   fail("observations",d.kind==="box"?"Each box plot requires at least five usable measurements.":"Each dot plot requires at least two usable measurements.");
  for(const s of series){
   if(s.skipped)fail("invalid-values",s.skipped+" invalid value(s) in '"+s.name+"'. Correct or remove them in the source before graphing.");
   if(s.values.length>120&&d.kind==="dot")fail("dot-crowded","The dot plot would contain over 120 points in '"+s.name+"'. Use a histogram or box plot.");
   if(d.kind==="dot"){
    const counts=new Map();
    for(const v of s.values)counts.set(v,(counts.get(v)||0)+1);
    const maxStack=Math.max(1,Math.min(22,Math.floor((394/Math.max(1,series.length))*.75/5.8)));
    if(Math.max(0,...counts.values())>maxStack)fail("dot-stack","Repeated observations in '"+s.name+"' would overlap at print size. Use fewer groups or a frequency diagram.");
   }
   if(s.box?.iqr===0)warn("zero-iqr","The group '"+s.name+"' has zero IQR. Quartiles or outliers may be less informative.");
  }
  if(d.kind==="box"){
   if(d.outlierRule==="tukey"&&!d.showOutliers&&series.some(s=>s.box?.outliers.length))
    fail("hidden-outliers","The whiskers exclude observed outliers. Show those points, or use min–max whiskers and describe the choice.");
   if(d.outlierRule==="tukey")warn("outliers","Whiskers extend to the most extreme non-outlier observations; 1.5 × IQR observations are shown separately.");
   if(series.some(s=>s.values.length<10))warn("small-sample","A small sample produces unstable quartiles. Explain your sampling and any limitations.");
  }
  if(d.kind==="dot"&&series.some(s=>new Set(s.values).size>50))warn("overplot","Many unique values may produce crowded dots. A box plot or histogram may communicate better.");
  result={...result,series};
 }else if(d.kind==="bar"){
  const b=barAnalysis(d);
  if(b.error)fail("bar-data",b.error);
  if(b.categories.length<2&&!b.error)fail("categories","Use at least two meaningful categories.");
  if(b.categories.length>12)fail("category-limit","Use at most 12 categories, or combine minor categories with justification.");
  if(b.categories.some(c=>c.category.length>21))fail("category-labels","Shorten long category labels in your working table and explain any abbreviations.");
  if(b.names?.some(name=>name.length>38))fail("legend-labels","Shorten long group headings so the legend can be read at printed size.");
  if((b.names||[]).length>4)fail("group-limit","Use at most four groups for a readable comparison.");
  if(b.totals?.length>1&&d.barMode==="count"){
   const small=Math.min(...b.totals),large=Math.max(...b.totals);
   if(small===0||large>small*1.25)warn("group-size","The groups have different sample sizes. Counts can mislead: consider percentages of each group's total.");
  }
  if(d.barMode==="percent")warn("percent-denominator","Percentages use each group's total across the displayed categories as the denominator. Check whether that matches your population or sampling question.");
  result={...result,...b};
 }
 let override=null;
 const lo=d.min.trim()?ncell(d.min):null,hi=d.max.trim()?ncell(d.max):null;
 if(d.min.trim()||d.max.trim()){
  if(lo===null||hi===null||hi<=lo)fail("range","Give both valid manual axis limits, with maximum greater than minimum.");
  else override=[lo,hi];
 }
 if(d.kind==="bar"&&override&&override[0]!==0)fail("zero-bar","A categorical bar chart must start its frequency/percentage axis at zero.");
 if(d.kind==="histogram"&&override){
  if(override[0]>Math.min(...(result.bins||[{low:0}]).map(x=>x.low))||
     override[1]<Math.max(...(result.bins||[{high:1}]).map(x=>x.high)))
   fail("cropped-classes","The chosen horizontal range must include every class boundary.");
 }
 if((d.kind==="dot"||d.kind==="box")&&override&&result.series?.some(s=>s.values.some(x=>x<override[0]||x>override[1])))
  fail("cropped-points","The chosen horizontal scale excludes observations or outliers.");
 if(d.kind==="bar"&&override&&result.categories?.some(c=>c.values.some(x=>x>override[1])))
  fail("cropped-bars","The upper scale limit cuts off a bar.");
 return {draft:d,ready:problems.length===0,problems,warnings,result,override};
}
export const statSignature=d=>JSON.stringify([d.kind,d.matrix,d.columns,d.selected,d.categoryIndex,d.lowIndex,
 d.highIndex,d.frequencyIndex,d.histogramInput,d.binWidth,d.binStart,d.barMode,d.quartileRule,d.outlierRule,d.min,d.max]);
export function saveStatFigure(studio,entryId=""){
 const q=statAnalysis(studio.draft);
 if(!q.ready)return {ok:false,error:"Resolve the required statistical diagram checks first.",checks:q};
 const previous=studio.figures.find(f=>f.id===studio.activeId);
 if(!previous&&studio.figures.length>=MAX_STAT_FIGURES)
  return {ok:false,error:"Twelve saved statistical diagrams are already stored. Earlier work will not be discarded."};
 const id=previous?.id||"stat-"+Date.now().toString(36)+"-"+Math.floor(Math.random()*10000).toString(36);
 const record={id,entryId:entryId||previous?.entryId||"",savedAt:new Date().toISOString(),draft:q.draft};
 const index=studio.figures.findIndex(f=>f.id===id);
 if(index>=0)studio.figures[index]=record;else studio.figures.push(record);
 studio.activeId=id;
 return {ok:true,record};
}
