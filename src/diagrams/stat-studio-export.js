/** Browser-local, printable statistical diagrams and compact working-data summaries. */
import {statAnalysis} from "./stat-studio-core.js";
import {renderStatSvg} from "./stat-studio-render.js";
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
   "Class width","Frequency","Frequency density"],...r.bins.map(b=>[
    b.low,b.high,b.high-b.low,b.frequency,b.density
   ])];
 }else if(d.kind==="box"){
  rows=[["Group","n","Minimum","Q1","Median","Q3","Maximum","IQR",
   "Lower whisker","Upper whisker","Number of possible outliers"],
  ...r.series.map(s=>[s.name,s.box.n,s.box.min,s.box.q1,s.box.median,s.box.q3,
   s.box.max,s.box.iqr,s.box.lowWhisker,s.box.highWhisker,s.box.outliers.length])];
 }else if(d.kind==="dot"){
  rows=[["Group","Measurement"],...r.series.flatMap(s=>s.values.map(v=>[s.name,v]))];
 }else rows=[["Category",...r.names.map(name=>name+(d.barMode==="percent"?" (%)":" (count)"))],
  ...r.categories.map(cat=>[cat.category,...cat.values])];
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
  const canvas=document.createElement("canvas");canvas.width=2880;canvas.height=1890;
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
  return "Statistical summary CSV downloaded. Keep long raw tables in your working file, not in your IA.";
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
