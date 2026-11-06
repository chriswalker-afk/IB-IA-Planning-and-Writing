/**
 * Two-way categorical frequency tables for the IB Mathematics IA.
 * Counts are student-entered observations, not inferred or invented values.
 * Row/column/grand totals are derived from the exact integer inputs.
 */
export const CONTINGENCY_MAX_ROWS=6;
export const CONTINGENCY_MAX_COLS=4;
export const CONTINGENCY_MAX_COUNT=1000000000;
const str=(value,length)=>typeof value==="string"?value.slice(0,length):"";
const clean=value=>String(value||"").trim();
const validLabel=value=>clean(value).length>0&&clean(value).length<=32;
const uniqueNames=values=>new Set(values.map(x=>clean(x).toLocaleLowerCase("en"))).size===values.length;
const sum=values=>values.reduce((total,value)=>total+value,0);

export function newContingencyDraft(){
 return {
  rowVariable:"",columnVariable:"",
  rows:["",""],columns:["",""],counts:[["",""],["",""]],
  display:"count",percentageDigits:"1"
 };
}
export function normalizeContingencyDraft(raw){
 const d=newContingencyDraft();
 if(!raw||typeof raw!=="object"||Array.isArray(raw))return d;
 d.rowVariable=str(raw.rowVariable,90);
 d.columnVariable=str(raw.columnVariable,90);
 for(const key of ["rows","columns"]){
  const max=key==="rows"?CONTINGENCY_MAX_ROWS:CONTINGENCY_MAX_COLS;
  if(Array.isArray(raw[key])){
   d[key]=raw[key].slice(0,max).map(value=>str(value,100));
   while(d[key].length<2)d[key].push("");
  }
 }
 d.counts=d.rows.map((_,i)=>d.columns.map((_,j)=>
  str(Array.isArray(raw.counts?.[i])?raw.counts[i][j]:"",32)));
 if(["count","row","column","overall"].includes(raw.display))d.display=raw.display;
 if(["0","1","2"].includes(String(raw.percentageDigits)))d.percentageDigits=String(raw.percentageDigits);
 return d;
}
export function editContingency(studio,kind,value,row=-1,col=-1){
 const d=studio?.draft?.contingency;
 if(studio?.draft?.mode!=="contingency"||!d||typeof value!=="string")return false;
 if(kind==="rowVariable"||kind==="columnVariable"){
  d[kind]=value.slice(0,90);return true;
 }
 if(kind==="display"){
  if(!["count","row","column","overall"].includes(value))return false;
  d.display=value;return true;
 }
 if(kind==="percentageDigits"){
  if(!["0","1","2"].includes(value))return false;
  d.percentageDigits=value;return true;
 }
 if(kind==="row"&&Number.isInteger(row)&&row>=0&&row<d.rows.length){
  d.rows[row]=value.slice(0,100);return true;
 }
 if(kind==="column"&&Number.isInteger(col)&&col>=0&&col<d.columns.length){
  d.columns[col]=value.slice(0,100);return true;
 }
 if(kind==="count"&&Number.isInteger(row)&&row>=0&&row<d.rows.length&&
  Number.isInteger(col)&&col>=0&&col<d.columns.length){
  d.counts[row][col]=value.slice(0,32);return true;
 }
 return false;
}
export function resizeContingency(studio,dimension,delta){
 const d=studio?.draft?.contingency;
 if(studio?.draft?.mode!=="contingency"||!d||!["rows","columns"].includes(dimension)||
  ![1,-1].includes(delta))return false;
 const length=d[dimension].length,max=dimension==="rows"?CONTINGENCY_MAX_ROWS:CONTINGENCY_MAX_COLS;
 if(length+delta<2||length+delta>max)return false;
 if(dimension==="rows"){
  if(delta===1){d.rows.push("");d.counts.push(d.columns.map(()=>""));}
  else{d.rows.pop();d.counts.pop();}
 }else{
  if(delta===1){d.columns.push("");d.counts.forEach(row=>row.push(""));}
  else{d.columns.pop();d.counts.forEach(row=>row.pop());}
 }
 return true;
}
export function contingencyWouldDiscard(studio,dimension){
 const d=studio?.draft?.contingency;
 if(!d)return false;
 if(dimension==="rows"){
  const last=d.rows.length-1;
  return !!clean(d.rows[last])||d.counts[last]?.some(value=>clean(value));
 }
 const last=d.columns.length-1;
 return !!clean(d.columns[last])||d.counts.some(row=>clean(row[last]));
}
const error=(code,message)=>({code:"contingency-"+code,message});
export function analyzeContingency(raw){
 const d=normalizeContingencyDraft(raw),problems=[],warnings=[];
 if(!clean(d.rowVariable)||!clean(d.columnVariable))
  problems.push(error("variables","Name both categorical variables, so the row and column groups have clear meanings."));
 else if(clean(d.rowVariable).toLocaleLowerCase("en")===clean(d.columnVariable).toLocaleLowerCase("en"))
  problems.push(error("same-variable","Choose two different categorical variables for a two-way table."));
 const topLeft=clean(d.rowVariable)+" / "+clean(d.columnVariable);
 if(topLeft.length>58)
  problems.push(error("variables-long","Shorten the two variable names so the combined row/column heading fits (58 characters maximum)."));
 for(const dimension of ["rows","columns"]){
  const names=d[dimension],label=dimension==="rows"?"row":"column";
  if(names.some(name=>!validLabel(name)))
   problems.push(error(label+"-labels","Give every "+label+" category a short, meaningful name (up to 32 characters)."));
  if(names.some(name=>clean(name).toLocaleLowerCase("en")==="total"))
   problems.push(error(label+"-total","Reserve Total for the calculated marginal totals; rename that "+label+" category."));
  if(!uniqueNames(names))
   problems.push(error(label+"-duplicates","Each "+label+" category must be different, ignoring spacing and capitalisation."));
 }
 const numbers=[],invalid=[];
 for(let i=0;i<d.rows.length;i++){
  const row=[];
  for(let j=0;j<d.columns.length;j++){
   const rawCell=clean(d.counts[i][j]),n=/^\d+$/.test(rawCell)?Number(rawCell):NaN;
   if(!rawCell||!Number.isSafeInteger(n)||n>CONTINGENCY_MAX_COUNT)invalid.push([i+1,j+1]);
   row.push(n);
  }
  numbers.push(row);
 }
 if(invalid.length){
  const first=invalid[0];
  problems.push(error("counts",invalid.length+" cell(s) need a non-negative whole-number frequency (0 is allowed; blank is not zero). First: row "+first[0]+", column "+first[1]+". Maximum count: "+CONTINGENCY_MAX_COUNT.toLocaleString("en")+"."));
 }
 if(problems.length)return {problems,warnings,model:null,draft:d};
 const rowTotals=numbers.map(sum);
 const columnTotals=d.columns.map((_,j)=>sum(numbers.map(row=>row[j])));
 const grandTotal=sum(rowTotals);
 if(!Number.isSafeInteger(grandTotal)||grandTotal<=0)
  problems.push(error("total","The grand total must be a positive, safe integer. Check the entered counts."));
 const emptyRows=rowTotals.map((n,i)=>n===0?i+1:null).filter(Boolean);
 const emptyColumns=columnTotals.map((n,j)=>n===0?j+1:null).filter(Boolean);
 if(emptyRows.length||emptyColumns.length){
  warnings.push(error("empty-groups","One or more category totals are zero. Keep empty categories only when including them is mathematically justified."));
  if(d.display==="row"&&emptyRows.length)
   problems.push(error("row-zero","Row percentages are undefined for an all-zero row. Use counts or revise the row categories."));
  if(d.display==="column"&&emptyColumns.length)
   problems.push(error("column-zero","Column percentages are undefined for an all-zero column. Use counts or revise the column categories."));
 }
 if(problems.length)return {problems,warnings,model:null,draft:d};
 const percentage=(n,denominator)=>(100*n/denominator).toFixed(Number(d.percentageDigits))+"%";
 const displayCount=(n,i,j)=>d.display==="count"?String(n):
  String(n)+" ("+percentage(n,d.display==="row"?rowTotals[i]:
   d.display==="column"?columnTotals[j]:grandTotal)+")";
 const rows=numbers.map((values,i)=>[
  clean(d.rows[i]),...values.map((n,j)=>displayCount(n,i,j)),String(rowTotals[i])
 ]);
 rows.push(["Total",...columnTotals.map(String),String(grandTotal)]);
 const countRows=numbers.map((values,i)=>[clean(d.rows[i]),...values.map(String),String(rowTotals[i])]);
 countRows.push(["Total",...columnTotals.map(String),String(grandTotal)]);
 const denominatorNote=d.display==="row"?"Each parenthesised percentage uses its row total as the denominator.":
  d.display==="column"?"Each parenthesised percentage uses its column total as the denominator.":
  d.display==="overall"?"Each parenthesised percentage uses the grand total as the denominator.":"Only exact frequencies are displayed.";
 const metadata="Two-way categorical frequency table. Rows: "+clean(d.rowVariable)+
  "; columns: "+clean(d.columnVariable)+". Grand total N = "+grandTotal+
  ". All marginal totals are calculated from the entered counts. "+
  denominatorNote+(d.display==="count"?"":" Marginal totals remain counts, not percentages.");
 return {
  problems,warnings,draft:d,
  model:{
   kind:"contingency",headers:[topLeft,...d.columns.map(clean),"Total"],
   rows,numeric:[false,...d.columns.map(()=>true),true],
   total:grandTotal,rowTotals,columnTotals,countRows,metadata,note:"",
   percentages:d.display
  }
 };
}
