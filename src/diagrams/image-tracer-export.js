/** Print-ready local exports for traced images and measured coordinates. */
import {imageTraceChecks,renderPrintableTraceSvg,traceCoordinates} from "./image-tracer-core.js";
const fileBase=d=>(String(d.title||"traced-coordinates").normalize("NFKD").replace(/[^a-z0-9 -]/gi,"").trim().replace(/\s+/g,"-").slice(0,65).toLowerCase()||"traced-coordinates");
function download(blob,name){
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 try{
  a.href=url;a.download=name;document.body.appendChild(a);a.click();
 }finally{a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500);}
}
function csvCell(value){
 let s=String(value??"");
 // Protect spreadsheet programs from formula execution when names come from student input.
 if(/^\s*[=+\-@]/.test(s))s="'"+s;
 return '"'+s.replace(/"/g,'""')+'"';
}
export function traceCSV(draft){
 const checked=imageTraceChecks(draft);
 if(!checked.ready)throw new Error("Correct the required calibration and figure checks before exporting coordinates.");
 const d=checked.draft,header=["Point",d.xLabel+" ("+d.unit+")",d.yLabel+" ("+d.unit+")"];
 const rows=traceCoordinates(d).map(row=>[
  "P"+row.index,row.coordinate.x.toFixed(Number(d.precision)),row.coordinate.y.toFixed(Number(d.precision))
 ]);
 return [header,...rows].map(row=>row.map(csvCell).join(",")).join("\r\n")+"\r\n";
}
const svgBlob=svg=>new Blob([svg],{type:"image/svg+xml;charset=utf-8"});
async function pngFromSvg(svg){
 const url=URL.createObjectURL(svgBlob(svg));
 try{
  const img=new Image();
  await new Promise((resolve,reject)=>{
   img.onload=resolve;
   img.onerror=()=>reject(new Error("Could not render the image-backed figure in this browser. Try SVG export."));
   img.src=url;
  });
  const canvas=document.createElement("canvas");
  canvas.width=1920;canvas.height=1400;
  const ctx=canvas.getContext("2d");
  if(!ctx)throw new Error("Canvas drawing is not supported by this browser.");
  ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(img,0,0,canvas.width,canvas.height);
  return await new Promise((resolve,reject)=>
   canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("Unable to create a PNG file.")),"image/png"));
 }finally{URL.revokeObjectURL(url);}
}
export async function exportTraceFigure(draft,format){
 const check=imageTraceChecks(draft);
 if(!check.ready)throw new Error("Complete the essential calibration and presentation checks before exporting.");
 const d=check.draft,base=fileBase(d);
 if(format==="csv"){
  download(new Blob([traceCSV(d)],{type:"text/csv;charset=utf-8"}),base+"-points.csv");
  return "Coordinates CSV downloaded. Check rounding before using these values in your analysis.";
 }
 const svg=renderPrintableTraceSvg(d,d.view);
 if(format==="svg"){
  download(svgBlob(svg),base+"-"+d.view+".svg");
  return "The labelled vector figure was downloaded for insertion into your IA.";
 }
 if(format!=="png"&&format!=="copy")throw new Error("Unknown tracing export type.");
 const png=await pngFromSvg(svg);
 if(format==="png"){
  download(png,base+"-"+d.view+".png");
  return "High-resolution tracing PNG downloaded for your IA document.";
 }
 if(!navigator.clipboard?.write||typeof ClipboardItem==="undefined")
  throw new Error("This browser cannot copy an image. Download PNG instead.");
 await navigator.clipboard.write([new ClipboardItem({"image/png":png})]);
 return "Tracing copied as a PNG. Paste it into your IA after introducing the diagram.";
}
