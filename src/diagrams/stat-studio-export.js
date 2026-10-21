/** Browser-local, printable statistical diagrams and compact working-data summaries. */
import {statAnalysis} from "./stat-studio-core.js";
import {renderStatSvg} from "./stat-studio-render.js";
import {diagramUnitPower} from "./diagram-notation.js";
const filename=d=>(String(d.title||"statistical-diagram").normalize("NFKD")
 .replace(/[^a-z0-9 -]/gi,"").trim().replace(/\s+/g,"-").slice(0,64).toLowerCase()||"statistical-diagram");
const cell=value=>{
 let s=String(value??"");
 if(/^\s*[=+\-@]/.test(s))s="'"+s; // Avoid executing imported column names in spreadsheets.
 return '"'+s.replace(/"/g,'""')+'"';
};
export function statSummaryCSV(raw){
 const q=statAnalysis(raw);
 if(!q.ready)throw new Error("Resolve the required statistical checks before exporting.");
 const d=q.draft,r=q.result;let rows=[];
 if(d.kind==="histogram"){
  rows=[["Lower boundary"+(d.unitMode==="unit"?" ("+d.unit+")":""),
   "Upper boundary"+(d.unitMode==="unit"?" ("+d.unit+")":""),
   "Class width"+(d.unitMode==="unit"?" ("+d.unit+")":""),"Frequency",
   "Frequency density"+(d.unitMode==="unit"?" ("+diagramUnitPower(d.unit,-1)+")":"")],...r.bins.map(b=>[
    b.low,b.high,b.high-b.low,b.frequency,b.density
   ])];
  if(d.histogramInput==="raw"&&r.series?.length>1){
   rows=[["Group","Lower boundary","Upper boundary","Frequency","Frequency density","Relative-frequency density","Percentage of group"],
    ...r.series.flatMap(group=>group.bins.map(bin=>[group.name,bin.low,bin.high,bin.frequency,bin.density,bin.relativeDensity,100*bin.frequency/group.n]))];
  }
 }else if(d.kind==="ogive"){
  rows=[["Group","Class lower boundary","Class upper boundary","Class frequency",
   "Cumulative frequency","Cumulative percentage"],...(r.curves||[]).flatMap(group=>
    group.curve.rows.map(bin=>[group.name,bin.low,bin.high,bin.frequency,bin.cumulative,bin.cumulativePercent]))];
  rows.push([],["INTERPOLATED PERCENTILES — grouped class estimates, not raw-data quartiles"],
   ["Group","n","Estimated Q1","Estimated median","Estimated Q3","Selected percentile","Estimated selected percentile"]);
  for(const group of r.curves||[]){
   const x=group.curve.estimates;
   rows.push([group.name,group.n,x.q1,x.median,x.q3,d.curveShowPercentile?d.curvePercentile:"",
    d.curveShowPercentile?x.percentile:""]);
  }
 }else if(d.kind==="polygon"){
  rows=[["Group","Lower boundary","Upper boundary","Class midpoint","Frequency","Frequency density",
   "Relative-frequency density"],...(r.polygons||[]).flatMap(group=>
    group.polygon.points.map((point,i)=>[group.name,group.bins[i].low,group.bins[i].high,
     point.x,point.frequency,point.density,point.relativeDensity]))];
 }else if(d.kind==="box"){
  rows=[["Group","n","Minimum","Q1","Median","Q3","Maximum","IQR","Mean",
   "Sample standard deviation","MAD","Lower whisker","Upper whisker","Whisker rule",
   "Outlier screening rule","Lower screening threshold","Upper screening threshold",
   "Score cutoff","Number flagged","Flagged measurements","Flagged scores"],
  ...r.series.map(s=>{
   const b=s.box;
   return [s.name,b.n,b.min,b.q1,b.median,b.q3,b.max,b.iqr,b.mean,b.sd,b.mad,
    b.lowWhisker,b.highWhisker,b.whiskerMode,b.outlierMethod,
    b.limits?.[0]??"",b.limits?.[1]??"",b.threshold??"",
    b.outliers.length,b.outliers.join("; "),b.flagged.map(v=>v.score===null?"":v.score).join("; ")];
  })];
  if(r.comparisons?.length){
   rows.push([],["PAIRWISE DESCRIPTIVE COMPARISONS — second minus first"]);
   rows.push(["First group","Second group","n first","n second","Median difference",
    "IQR difference","Range difference","Flagged-count difference"]);
   for(const c of r.comparisons)rows.push([c.first,c.second,c.nFirst,c.nSecond,
    c.medianDifference,c.iqrDifference,c.rangeDifference,c.outlierDifference]);
  }
 }else if(d.kind==="dot"){
  rows=[["Group","Measurement"],...r.series.flatMap(s=>s.values.map(v=>[s.name,v]))];
  rows.push([],["GROUP SUMMARIES"],["Group","n","Mean","Median","Q1","Q3","IQR","Sample SD"]);
  for(const s of r.series)rows.push([s.name,s.summary.n,s.summary.mean,s.summary.median,s.summary.q1,s.summary.q3,s.summary.iqr,s.summary.sd]);
 }else{
  const isPercent=d.barStyle==="stacked100"||d.barStyle==="grouped"&&d.barMode==="percent";
  rows=[["Category",...r.names.map(name=>name+(isPercent?" (%)":" (count)"))],
   ...r.categories.map(cat=>[cat.category,...cat.values])];
  rows.push([],["ORIGINAL CATEGORY COUNTS"],["Category",...r.names.map(name=>name+" (count)"),"Category total"]);
  for(const cat of r.categories)rows.push([cat.category,...cat.counts,cat.categoryTotal]);
  rows.push([],["Chart type",d.barStyle],["Percentage denominator",r.denominator],
   ["Category sort",d.barSort]);
 }
 return rows.map(row=>row.map(cell).join(",")).join("\r\n")+"\r\n";
}
function download(blob,name){
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 try{
  a.href=url;a.download=name;document.body.appendChild(a);a.click();
 }finally{a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500);}
}
async function png(svg){
 const url=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml;charset=utf-8"}));
 try{
  const image=new Image();
  await new Promise((resolve,reject)=>{
   image.onload=resolve;
   image.onerror=()=>reject(new Error("The SVG could not be rendered as PNG. Try SVG export."));
   image.src=url;
  });
  const canvas=document.createElement("canvas");canvas.width=2880;
  // Annotated comparative box plots can be taller than the standard 960 × 630
  // diagram. Preserve their actual SVG aspect ratio in the PNG export.
  const viewBox=svg.match(/viewBox="0 0 ([0-9]+) ([0-9]+)"/);
  canvas.height=viewBox?Math.round(canvas.width*Number(viewBox[2])/Number(viewBox[1])):1890;
  const ctx=canvas.getContext("2d");
  if(!ctx)throw new Error("This browser cannot render a canvas.");
  ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(image,0,0,canvas.width,canvas.height);
  return await new Promise((resolve,reject)=>
   canvas.toBlob(b=>b?resolve(b):reject(new Error("Could not generate the PNG.")),"image/png"));
 }finally{URL.revokeObjectURL(url);}
}
export async function exportStat(draft,format){
 const q=statAnalysis(draft);
 if(!q.ready)throw new Error("Resolve the required data, scale and presentation checks first.");
 const base=filename(q.draft);
 if(format==="csv"){
  download(new Blob([statSummaryCSV(q.draft)],{type:"text/csv;charset=utf-8"}),base+"-summary.csv");
  return "Statistical calculations CSV downloaded. Keep long raw tables in your working file, not in your IA.";
 }
 const svg=renderStatSvg(q.draft);
 if(format==="svg"){
  download(new Blob([svg],{type:"image/svg+xml;charset=utf-8"}),base+".svg");
  return "Vector statistical diagram downloaded for your IA document.";
 }
 if(format!=="png"&&format!=="copy")throw new Error("Unsupported statistical export type.");
 const blob=await png(svg);
 if(format==="png"){
  download(blob,base+".png");
  return "High-resolution PNG diagram downloaded for your IA.";
 }
 if(!navigator.clipboard?.write||typeof ClipboardItem==="undefined")
  throw new Error("Copy PNG is not supported by this browser. Download PNG instead.");
 await navigator.clipboard.write([new ClipboardItem({"image/png":blob})]);
 return "Statistical diagram copied as a PNG. Paste after the sentence that introduces it.";
}
