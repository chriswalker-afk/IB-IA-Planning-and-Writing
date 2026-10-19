/** Export mathematical tables as editable HTML, accurate SVG, PNG and compact CSV. */
import {analyzeTable} from "./table-studio-core.js";
import {renderTableSvg,tableToHtml,tableToTsv} from "./table-studio-render.js";
import {finiteCell} from "./graph-core.js";

const base=d=>String(d.title||"mathematical-table").normalize("NFKD").replace(/[^a-z0-9 -]/gi,"")
 .trim().replace(/\s+/g,"-").slice(0,65).toLowerCase()||"mathematical-table";
const fileDownload=(blob,name)=>{
 const url=URL.createObjectURL(blob),link=document.createElement("a");
 try{link.href=url;link.download=name;document.body.appendChild(link);link.click();}
 finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),2500);}
};
const csvCell=value=>{
 let s=String(value??"");
 if(finiteCell(s)===null&&/^\s*[=+\-@]/.test(s))s="'"+s;
 return '"'+s.replace(/"/g,'""')+'"';
};
export function tableCSV(raw){
 const q=analyzeTable(raw);
 if(!q.ready)throw new Error("Correct the required table checks before exporting.");
 return [q.model.headers,...q.model.rows].map(row=>row.map(csvCell).join(",")).join("\r\n")+"\r\n";
}
async function makePng(svg){
 const url=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml;charset=utf-8"}));
 try{
  const pic=new Image();
  await new Promise((resolve,reject)=>{
   pic.onload=resolve;pic.onerror=()=>reject(new Error("Could not render the table as an image; try SVG export."));
   pic.src=url;
  });
  const canvas=document.createElement("canvas");
  const scale=2.5,width=pic.naturalWidth||900,height=pic.naturalHeight||450;
  canvas.width=Math.min(3000,Math.round(width*scale));
  canvas.height=Math.min(4500,Math.round(height*scale));
  const ctx=canvas.getContext("2d");
  if(!ctx)throw new Error("This browser cannot create a table image.");
  ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(pic,0,0,canvas.width,canvas.height);
  return await new Promise((resolve,reject)=>
   canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("PNG output could not be created.")),"image/png"));
 }finally{URL.revokeObjectURL(url);}
}
export async function exportTable(raw,format){
 const quality=analyzeTable(raw);
 if(!quality.ready)throw new Error("Fix the essential size, unit, source and mathematical checks before exporting.");
 const d=quality.draft,file=base(d);
 if(format==="csv"){
  fileDownload(new Blob([tableCSV(d)],{type:"text/csv;charset=utf-8"}),file+"-summary.csv");
  return "Compact table CSV downloaded. Keep full raw data separately in your working files.";
 }
 if(format==="html"){
  fileDownload(new Blob(['<!doctype html><meta charset="utf-8"><title>'+d.title.replace(/[<>]/g,"")+'</title>'+tableToHtml(d)],
   {type:"text/html;charset=utf-8"}),file+"-editable.html");
  return "Editable HTML table downloaded. Open it and copy the table into your document.";
 }
 if(format==="editable"){
  if(!navigator.clipboard?.write||typeof ClipboardItem==="undefined")
   throw new Error("Rich clipboard copying is unavailable. Use Download editable HTML or PNG instead.");
  await navigator.clipboard.write([new ClipboardItem({
   "text/html":new Blob([tableToHtml(d)],{type:"text/html"}),
   "text/plain":new Blob([tableToTsv(d)],{type:"text/plain"})
  })]);
  return "Editable formatted table copied. Paste into Google Docs; check its layout after pasting.";
 }
 const svg=renderTableSvg(d);
 if(format==="svg"){
  fileDownload(new Blob([svg],{type:"image/svg+xml;charset=utf-8"}),file+".svg");
  return "Compact table SVG downloaded for your IA.";
 }
 if(format!=="png"&&format!=="copy")throw new Error("Unsupported table export type.");
 const blob=await makePng(svg);
 if(format==="png"){
  fileDownload(blob,file+".png");
  return "High-resolution formatted table PNG downloaded.";
 }
 if(!navigator.clipboard?.write||typeof ClipboardItem==="undefined")
  throw new Error("Image clipboard copying is not available; download PNG instead.");
 await navigator.clipboard.write([new ClipboardItem({"image/png":blob})]);
 return "Table copied as a PNG image. Place it after the sentence introducing the table.";
}
