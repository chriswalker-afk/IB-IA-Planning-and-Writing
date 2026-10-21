/**
 * Pure distribution mathematics shared by histograms and dot plots.
 * Never truncate or synthesise observations. Compare samples with their own n.
 */
import {boxStats} from "./box-analysis.js";
import {continuousBins} from "./continuous-classes.js";

const finite=n=>typeof n==="number"&&Number.isFinite(n);
export function distributionSummary(values,quartileRule="halves"){
 if(!values.length||values.some(v=>!finite(v)))return null;
 const a=[...values].sort((x,y)=>x-y),n=a.length;
 const box=boxStats(a,quartileRule,"none");
 // Welford's algorithm: calculate sample SD without catastrophic cancellation.
 let mean=0,m2=0;
 for(let i=0;i<n;i++){
  const delta=a[i]-mean;mean+=delta/(i+1);m2+=delta*(a[i]-mean);
 }
 const sd=n>1?Math.sqrt(Math.max(0,m2/(n-1))):0;
 return {n,min:a[0],max:a.at(-1),range:a.at(-1)-a[0],
  q1:box.q1,median:box.median,q3:box.q3,iqr:box.iqr,mean,sd};
}
/** A strictly descriptive B-A difference; never a test of significance. */
export function distributionComparisons(series){
 const result=[];
 for(let i=0;i<series.length;i++)for(let j=i+1;j<series.length;j++){
  const a=series[i],b=series[j],x=a.summary,y=b.summary;
  if(!x||!y)continue;
  result.push({first:a.name,second:b.name,nFirst:x.n,nSecond:y.n,
   medianDifference:y.median-x.median,meanDifference:y.mean-x.mean,
   iqrDifference:y.iqr-x.iqr,sdDifference:y.sd-x.sd});
 }
 return result;
}
function niceWidthAtLeast(raw){
 if(!finite(raw)||raw<=0)return null;
 const order=10**Math.floor(Math.log10(raw));
 for(const coefficient of [1,2,2.5,5,10]){
  const width=coefficient*order;
  if(width>=raw*(1-1e-12))return Number(width.toPrecision(12));
 }
 return null;
}
/** Suggestions are user-selectable starting points, not automatically applied. */
export function histogramBinSuggestions(values,maxBins=36){
 if(values.length<2||values.some(v=>!finite(v)))return [];
 const a=[...values].sort((x,y)=>x-y),n=a.length,span=a.at(-1)-a[0];
 if(!finite(span)||span<0)return [];
 const iqr=distributionSummary(a,"linear")?.iqr??0;
 const rules=[
  ["sturges","Sturges",Math.ceil(1+Math.log2(n)),"Based on sample size; a common initial choice."],
  ["fd","Freedman–Diaconis",iqr>0&&span>0?span/(2*iqr/Math.cbrt(n)):null,
   "Uses the IQR and sample size; robust to distant values, but can create many bins."],
  ["sqrt","Square-root",Math.ceil(Math.sqrt(n)),"A simple sample-size-based starting point."]
 ];
 return rules.map(([key,label,count,note])=>{
  if(!count||!finite(count))return {key,label,available:false,reason:"IQR is zero or the range is degenerate; choose and justify a class width manually."};
  const requested=span===0?Math.max(0.001,Math.abs(a[0])/10,1):span/count;
  let width=niceWidthAtLeast(requested);
  let check=null;
  for(let i=0;i<15&&width;i++){
   check=continuousBins(a,String(width),"",maxBins);
   if(!check.error)break;
   width=niceWidthAtLeast(width*1.2);
  }
  if(!width||check?.error)return {key,label,available:false,reason:"The suggested intervals cannot be represented reliably for these measurements."};
  return {key,label,available:true,width,bins:check.bins.length,
   note,approximate:true};
 });
}
/** Every group is counted on the same half-open class boundaries. */
export function alignedHistograms(entries,width,start=""){
 if(!entries.length)return {error:"Choose at least one measurement group."};
 const pooled=entries.flatMap(s=>s.values);
 const base=continuousBins(pooled,String(width),String(start),36);
 if(base.error)return {error:base.error};
 const bins=base.bins.map(b=>({...b}));
 const low=bins[0].low,classWidth=bins[0].high-low;
 if(!finite(classWidth)||classWidth<=0)return {error:"Invalid common class width."};
 const series=[];
 for(const entry of entries){
  const groupBins=bins.map(b=>({low:b.low,high:b.high,frequency:0,density:0,relativeDensity:0}));
  for(const value of entry.values){
   const index=Math.floor((value-low)/classWidth+1e-10);
   if(index<0||index>=groupBins.length)return {error:"A measurement falls outside the common class boundaries."};
   groupBins[index].frequency++;
  }
  for(const bin of groupBins){
   bin.density=bin.frequency/(bin.high-bin.low);
   bin.relativeDensity=entry.values.length?bin.density/entry.values.length:0;
  }
  series.push({...entry,n:entry.values.length,bins:groupBins});
 }
 return {bins,series,pooledTotal:pooled.length,
  commonStart:low,commonEnd:bins.at(-1).high};
}
/**
 * Pixel-aware dot placement. X is always the exact measured value:
 * only the *vertical* level changes to prevent overlapping markers.
 */
export function dotPlacement(values,low,high,width,mode="individual",gap=10){
 if(!(high>low)||!(width>0))return {dots:[],levels:0};
 const points=mode==="counted"?
  [...values.reduce((m,v)=>(m.set(v,(m.get(v)||0)+1),m),new Map()).entries()]
   .map(([value,count])=>({value,count})):
  values.map(value=>({value,count:1}));
 points.sort((a,b)=>a.value-b.value);
 const lastX=[],dots=[];
 for(const point of points){
  const x=width*(point.value-low)/(high-low);
  let level=lastX.findIndex(prev=>x-prev>=gap-1e-9);
  if(level<0){level=lastX.length;lastX.push(-Infinity);}
  lastX[level]=x;
  dots.push({...point,x,level});
 }
 return {dots,levels:lastX.length};
}
