import {geometryAnalysis} from "./geometry-core.js";
import {renderGeometrySvg} from "./geometry-render.js";
const safeName=x=>(String(x||"geometry-figure").trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").slice(0,58)||"geometry-figure");
function download(blob,name){
 const u=URL.createObjectURL(blob),a=document.createElement("a");
 try{a.href=u;a.download=name;document.body.appendChild(a);a.click();}
 finally{a.remove();setTimeout(()=>URL.revokeObjectURL(u),2500);}
}
export async function exportGeometry(raw,format){
 const result=geometryAnalysis(raw);
 if(!result.ready)throw new Error(result.issues[0]||"Check the diagram before exporting.");
 const svg=renderGeometrySvg(result.draft),name=safeName(result.draft.title);
 if(format==="svg"){
  download(new Blob([svg],{type:"image/svg+xml;charset=utf-8"}),name+".svg");
  return "Geometry SVG downloaded. Introduce it before showing it in your IA.";
 }
 if(format!=="png")throw new Error("Unsupported geometry export.");
 const url=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml;charset=utf-8"}));
 try{
  const image=new Image();
  await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error("Could not render geometry to PNG."));image.src=url;});
  const dimensions=/viewBox="0 0 (\d+) (\d+)"/.exec(svg);
  if(!dimensions)throw new Error("Missing geometry figure dimensions.");
  const canvas=document.createElement("canvas");canvas.width=2*Number(dimensions[1]);canvas.height=2*Number(dimensions[2]);
  const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Canvas is unavailable.");
  ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("PNG creation failed.")),"image/png"));
  download(blob,name+".png");return "High-resolution geometry PNG downloaded.";
 }finally{URL.revokeObjectURL(url);}
}
