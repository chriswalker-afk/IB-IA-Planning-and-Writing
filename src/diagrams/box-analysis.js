/**
 * Pure statistical calculations used by comparative box plots.
 * All observations are retained. "Outlier" means flagged by an explicitly
 * selected screening rule; it is not a reason to delete a value.
 */
const median=values=>{
 if(!values.length)return null;
 const middle=Math.floor(values.length/2);
 return values.length%2?values[middle]:(values[middle-1]+values[middle])/2;
};
function linearQuantile(sorted,p){
 if(sorted.length===1)return sorted[0];
 const index=p*(sorted.length-1),lo=Math.floor(index),hi=Math.ceil(index);
 return sorted[lo]+(sorted[hi]-sorted[lo])*(index-lo);
}
export const BOX_OUTLIER_METHODS=Object.freeze([
 ["tukey","1.5 × IQR (Tukey fences)"],
 ["extreme","3 × IQR (more extreme values)"],
 ["zscore","Z-score (sample standard deviation)"],
 ["modified","Modified Z-score (median and MAD)"],
 ["none","Do not classify outliers"],
 ["minmax","Legacy min–max, no outlier classification"]
]);
export const BOX_Z_CUTOFFS=Object.freeze(["2","2.5","3"]);
export const BOX_LABEL_PRECISIONS=Object.freeze(["auto","0","1","2","3","4"]);

export function formatBoxNumber(value,precision="auto"){
 if(typeof value!=="number"||!Number.isFinite(value))return "—";
 const result=precision==="auto"?Number(value.toPrecision(5)).toString():
  Number(value.toFixed(Number(BOX_LABEL_PRECISIONS.includes(precision)?precision:"2"))).toString();
 return result==="-0"?"0":result;
}
const uniqueMethod=method=>BOX_OUTLIER_METHODS.some(pair=>pair[0]===method)?method:"tukey";
const meanOf=a=>{
 let mean=0;
 a.forEach((x,i)=>{mean+=(x-mean)/(i+1);});
 return mean;
};
/** Quartiles, screening thresholds and whiskers are independent choices. */
export function boxStats(values,rule="halves",outlierRule="tukey",settings={}){
 const a=values.slice().sort((x,y)=>x-y),n=a.length;
 if(!n)return null;
 const med=median(a),lower=a.slice(0,Math.floor(n/2)),upper=a.slice(Math.ceil(n/2));
 const q1=rule==="linear"?linearQuantile(a,.25):(median(lower)??a[0]);
 const q3=rule==="linear"?linearQuantile(a,.75):(median(upper)??a[n-1]);
 const iqr=q3-q1,mean=meanOf(a);
 const squared=a.reduce((sum,x)=>sum+(x-mean)**2,0);
 const sd=n>1?Math.sqrt(squared/(n-1)):0;
 const mad=median(a.map(x=>Math.abs(x-med)).sort((x,y)=>x-y));
 const tukeyFences=[q1-1.5*iqr,q3+1.5*iqr];
 const selected=uniqueMethod(outlierRule);
 const method=selected==="minmax"?"none":selected;
 const whiskerMode=selected==="minmax"||settings.whiskerMode==="minmax"?"minmax":"nonoutlier";
 const zThreshold=BOX_Z_CUTOFFS.includes(String(settings.zThreshold))?Number(settings.zThreshold):3;
 const threshold=method==="zscore"?zThreshold:method==="modified"?3.5:
  method==="extreme"?3:method==="tukey"?1.5:null;
 let limits=null,methodAvailable=true,methodNote="";
 if(method==="tukey"||method==="extreme"){
  limits=[q1-threshold*iqr,q3+threshold*iqr];
 }else if(method==="zscore"){
  if(!Number.isFinite(sd)){methodAvailable=false;methodNote="Sample standard deviation cannot be computed reliably.";}
  else if(sd===0){methodNote="All observations are identical: Z-scores are undefined, and no value can be flagged.";}
  else limits=[mean-zThreshold*sd,mean+zThreshold*sd];
 }else if(method==="modified"){
  if(mad===0){
   if(a[0]!==a[n-1]){methodAvailable=false;methodNote="MAD is zero although observations differ. The modified Z-score rule is undefined here; choose another rule.";}
   else methodNote="All observations are identical: modified Z-scores are undefined, and no value can be flagged.";
  }else limits=[med-3.5*mad/0.6745,med+3.5*mad/0.6745];
 }
 if(limits&&!limits.every(Number.isFinite)){
  methodAvailable=false;methodNote="Outlier thresholds exceed the reliable numerical range.";
  limits=null;
 }
 const scores=a.map(value=>{
  if(method==="zscore"&&sd>0)return (value-mean)/sd;
  if(method==="modified"&&mad>0)return 0.6745*(value-med)/mad;
  return null;
 });
 const flagged=methodAvailable?a.flatMap((value,i)=>{
  const outside=limits!==null&&(method==="zscore"||method==="modified"?
   Math.abs(scores[i])>threshold:value<limits[0]||value>limits[1]);
  return outside?[{value,score:scores[i]}]:[];
 }):[];
 const outliers=flagged.map(item=>item.value);
 const core=whiskerMode==="minmax"?a:a.filter(value=>!outliers.includes(value));
 const safeCore=core.length?core:a;
 return {
  n,min:a[0],q1,median:med,q3,max:a[n-1],iqr,mean,sd,mad,values:a,
  fences:tukeyFences,limits,threshold,outlierMethod:method,outlierRule:selected,
  methodAvailable,methodNote,zThreshold,whiskerMode,
  lowWhisker:safeCore[0],highWhisker:safeCore.at(-1),
  outliers,flagged
 };
}
/** Differences are B - A in the source group order (descriptive, not inferential). */
export function boxComparisons(series){
 const result=[];
 for(let i=0;i<series.length;i++)for(let j=i+1;j<series.length;j++){
  const a=series[i].box,b=series[j].box;
  if(!a||!b)continue;
  result.push({
   first:series[i].name,second:series[j].name,
   nFirst:a.n,nSecond:b.n,
   medianDifference:b.median-a.median,iqrDifference:b.iqr-a.iqr,
   rangeDifference:(b.max-b.min)-(a.max-a.min),
   outlierDifference:b.outliers.length-a.outliers.length
  });
 }
 return result;
}
