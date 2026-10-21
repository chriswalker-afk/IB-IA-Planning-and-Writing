/** Shared class boundaries for the histogram and grouped-frequency table.
 * Left-inclusive, right-exclusive, including an exact final-boundary value in
 * the next class. Counts and areas always derive from original finite values.
 */
import {finiteCell} from "./graph-core.js";
export function continuousBins(values,widthText,startText="",maxClasses=36){
 if(!Array.isArray(values)||values.length<2||values.some(v=>!Number.isFinite(v)))
  return {error:"At least two finite numerical observations are required.",bins:[]};
 const width=finiteCell(widthText),startRaw=String(startText??"").trim();
 const start=startRaw?finiteCell(startRaw):null;
 if(width===null||width<=0)return {error:"Choose a positive class width, justified by the measurement scale.",bins:[]};
 if(startRaw&&start===null)return {error:"The first class boundary must be a finite number.",bins:[]};
 const min=Math.min(...values),max=Math.max(...values);
 const low=startRaw?start:Math.floor(min/width)*width;
 if(!Number.isFinite(low)||low>min)return {error:"The first class boundary is invalid or lies above an observation.",bins:[]};
 const count=Math.floor((max-low)/width+1e-10)+1;
 if(!Number.isFinite(count)||count<1)return {error:"The class intervals are not numerically valid.",bins:[]};
 if(count>maxClasses)return {error:"This class width produces "+count+" classes. Choose a wider interval; the original observations have not been discarded.",bins:[]};
 const bins=Array.from({length:count},(_,i)=>{
  const a=low+i*width,b=low+(i+1)*width;
  return {low:a,high:b,frequency:0,density:0};
 });
 if(bins.some(b=>!Number.isFinite(b.low)||!Number.isFinite(b.high)||b.high<=b.low))
  return {error:"Class limits cannot be represented reliably at this measurement scale.",bins:[]};
 for(const value of values){
  const index=Math.floor((value-low)/width+1e-10);
  if(index<0||index>=count)return {error:"A measurement falls outside the chosen class intervals.",bins:[]};
  bins[index].frequency++;
 }
 for(const b of bins)b.density=b.frequency/(b.high-b.low);
 if(bins.some(b=>!Number.isFinite(b.density)))return {error:"Frequency density cannot be calculated reliably.",bins:[]};
 return {bins,total:values.length};
}
/** Validate supplied grouped frequencies without treating their counts as measurements. */
export function groupedClassBins(matrix,lowIndex,highIndex,frequencyIndex,maxClasses=36){
 if(!Array.isArray(matrix)||!matrix.length)return {bins:[],error:"Enter the class boundaries and frequencies."};
 if(new Set([lowIndex,highIndex,frequencyIndex]).size!==3)
  return {bins:[],error:"Choose separate lower-boundary, upper-boundary and frequency columns."};
 if(matrix.length>maxClasses)return {bins:[],error:"There are more than "+maxClasses+" intervals; no classes have been hidden."};
 const bins=[];
 for(let i=0;i<matrix.length;i++){
  const row=matrix[i],a=finiteCell(row?.[lowIndex]),b=finiteCell(row?.[highIndex]),f=finiteCell(row?.[frequencyIndex]);
  if(a===null||b===null||f===null)return {bins:[],error:"Source class "+(i+1)+" has an invalid or missing boundary or frequency."};
  if(b<=a)return {bins:[],error:"Source class "+(i+1)+" needs an upper boundary greater than its lower boundary."};
  if(!Number.isSafeInteger(f)||f<0)return {bins:[],error:"Source class "+(i+1)+" needs a non-negative whole-number frequency."};
  bins.push({low:a,high:b,frequency:f,density:f/(b-a)});
 }
 bins.sort((a,b)=>a.low-b.low);
 for(let i=1;i<bins.length;i++){
  const scale=Math.max(1,Math.abs(bins[i].low),Math.abs(bins[i-1].high));
  if(bins[i].low<bins[i-1].high-scale*1e-10)return {bins:[],error:"Classes overlap. Each observation must belong to only one interval."};
 }
 const total=bins.reduce((n,b)=>n+b.frequency,0);
 if(!Number.isSafeInteger(total)||bins.some(b=>!Number.isFinite(b.density)))
  return {bins:[],error:"The grouped frequencies or densities exceed the reliable numeric range."};
 return {bins,total,gaps:bins.some((b,i)=>i>0&&b.low>bins[i-1].high+Math.max(1,Math.abs(b.low))*1e-10)};
}
