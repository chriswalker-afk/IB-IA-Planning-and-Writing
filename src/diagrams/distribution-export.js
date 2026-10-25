import {analyzeDistribution} from "./distribution-core.js";
import {renderDistributionSvg} from "./distribution-render.js";
const name=s=>String(s||"probability-distribution").toLowerCase().replace(/[^a-z0-9-]+/g,"-").slice(0,55)||"distribution";
function download(blob,file){
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 try{a.href=url;a.download=file;document.body.appendChild(a);a.click();}
 finally{a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500);}
}
export async function exportDistribution(raw,format){
 const q=analyzeDistribution(raw);
 if(!q.ready)throw new Error(q.issues[0]);
 const svg=renderDistributionSvg(q.draft),filename=name(q.draft.title);
 if(format==="svg"){
  download(new Blob([svg],{type:"image/svg+xml;charset=utf-8"}),filename+".svg");
  return "IA-ready vector figure downloaded.";
 }
 if(format!=="png")throw new Error("Unknown export type.");
 const url=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml;charset=utf-8"}));
 try{
  const image=new Image();
  await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error("Unable to render PNG."));image.src=url;});
  const canvas=document.createElement("canvas"),scale=3;
  canvas.width=image.naturalWidth*scale;canvas.height=image.naturalHeight*scale;
  const ctx=canvas.getContext("2d");
  if(!ctx)throw new Error("Canvas is unavailable.");
  ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("PNG encoding failed.")),"image/png"));
  download(blob,filename+".png");
  return "High-resolution PNG downloaded.";
 }finally{URL.revokeObjectURL(url);}
}
