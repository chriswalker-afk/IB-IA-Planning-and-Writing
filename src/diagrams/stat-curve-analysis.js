/**
 * Pure cumulative-frequency and frequency-polygon calculations.
 * A grouped ogive uses linear interpolation within each source interval.
 * Such percentiles are estimates, even if individual observations originally
 * supplied the grouped frequencies. No invented raw values or observations.
 */
const numeric=x=>typeof x==="number"&&Number.isFinite(x);
const nearly=(a,b)=>Math.abs(a-b)<=1e-10*Math.max(1,Math.abs(a),Math.abs(b));

/** Preserve gaps as horizontal cumulative segments; never imply data inside a gap. */
export function cumulativeClasses(bins){
 if(!Array.isArray(bins)||!bins.length)return {error:"There must be at least one class.",points:[]};
 const total=bins.reduce((n,b)=>n+b.frequency,0);
 if(!Number.isSafeInteger(total)||total<=0)return {error:"The total frequency must be a positive safe integer.",points:[]};
 let cumulative=0,prior=null;
 const rows=[],points=[{x:bins[0].low,cumulative:0,percent:0}];
 for(const [index,b] of bins.entries()){
  if(!numeric(b.low)||!numeric(b.high)||b.high<=b.low||
     !Number.isSafeInteger(b.frequency)||b.frequency<0)
   return {error:"Invalid interval or class frequency.",points:[]};
  if(prior!==null){
   if(b.low<prior&&!nearly(b.low,prior))return {error:"Classes overlap.",points:[]};
   if(b.low>prior&&!nearly(b.low,prior))
    points.push({x:b.low,cumulative,percent:100*cumulative/total,plateau:true});
  }
  cumulative+=b.frequency;
  const record={...b,midpoint:b.low+(b.high-b.low)/2,
   cumulative,cumulativePercent:100*cumulative/total};
  rows.push(record);
  points.push({x:b.high,cumulative,percent:100*cumulative/total});
  prior=b.high;
 }
 if(rows.some(b=>!numeric(b.midpoint)||!numeric(b.cumulativePercent)))
  return {error:"The boundaries cannot be represented reliably.",points:[]};
 return {rows,points,total};
}
/** Rank = p/100 times total; interpolation assumes uniform density within a class. */
export function groupedPercentile(bins,p){
 const c=cumulativeClasses(bins);
 if(c.error||!numeric(p)||p<=0||p>=100)return null;
 const target=c.total*p/100;
 let before=0;
 for(const bin of c.rows){
  if(bin.frequency>0&&target<=before+bin.frequency+1e-10){
   const fraction=Math.max(0,Math.min(1,(target-before)/bin.frequency));
   return bin.low+fraction*(bin.high-bin.low);
  }
  before+=bin.frequency;
 }
 return null;
}
export function groupedCurve(bins,percentile=90){
 const model=cumulativeClasses(bins);
 if(model.error)return model;
 const estimates={q1:groupedPercentile(bins,25),median:groupedPercentile(bins,50),
  q3:groupedPercentile(bins,75),percentile:groupedPercentile(bins,percentile)};
 return {...model,estimates,percentile,estimated:true};
}
/** Frequency polygon points mark observed class midpoints, not made-up endpoints. */
export function frequencyPolygon(bins,relative=false,totalOverride=null){
 if(!Array.isArray(bins)||!bins.length)return {error:"Frequency classes are missing.",points:[]};
 const total=totalOverride??bins.reduce((n,b)=>n+b.frequency,0);
 if(!Number.isSafeInteger(total)||total<=0)return {error:"Frequency total must be positive.",points:[]};
 const points=[];
 let previous=null;
 for(const b of bins){
  const width=b.high-b.low;
  if(!numeric(b.low)||!numeric(b.high)||width<=0||!Number.isSafeInteger(b.frequency)||b.frequency<0)
   return {error:"The frequency polygon needs valid class limits and counts.",points:[]};
  const density=b.frequency/width;
  const value=relative?density/total:density;
  if(!numeric(value))return {error:"Frequency density is outside the reliable numerical range.",points:[]};
  points.push({x:b.low+width/2,y:value,frequency:b.frequency,density,
   relativeDensity:density/total,gapBefore:previous!==null&&b.low>previous&&!nearly(b.low,previous)});
  previous=b.high;
 }
 return {points,total,relative};
}
/** Stacked bar options retain source counts and identify the denominator explicitly. */
export function categoricalBars(categories,names,barMode="count",style="grouped",order="source"){
 const totals=names.map((_,i)=>categories.reduce((n,c)=>n+c.counts[i],0));
 const records=categories.map((c,i)=>{
  const categoryTotal=c.counts.reduce((n,v)=>n+v,0);
  const countValues=c.counts.slice();
  const values=c.counts.map((v,j)=>style==="stacked100"?100*v/categoryTotal:
   style==="stacked"?v:barMode==="percent"?100*v/totals[j]:v);
  return {...c,counts:countValues,categoryTotal,values,originalIndex:i};
 });
 if(order==="name")records.sort((a,b)=>a.category.localeCompare(b.category)||a.originalIndex-b.originalIndex);
 if(order==="total-desc"||order==="total-asc"){
  const dir=order==="total-desc"?-1:1;
  records.sort((a,b)=>dir*(a.categoryTotal-b.categoryTotal)||a.originalIndex-b.originalIndex);
 }
 return {categories:records,names,totals,
  denominator:style==="stacked100"?"category":style==="stacked"?"counts":barMode==="percent"?"group":"counts"};
}
