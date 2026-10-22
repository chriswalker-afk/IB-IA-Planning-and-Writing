import {probabilityAnalysis} from "./probability-core.js";
import {renderProbabilitySvg} from "./probability-render.js";
const fileName=x=>(String(x||"probability-tree").trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").slice(0,58)||"probability-tree");
function download(blob,name){
 const url=URL.createObjectURL(blob),anchor=document.createElement("a");
 try{anchor.href=url;anchor.download=name;document.body.appendChild(anchor);anchor.click();}
 finally{anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),2500);}
}
export async function exportProbability(raw,format){
 const checked=probabilityAnalysis(raw);
 if(!checked.ready)throw new Error(checked.issues[0]||"Complete all conditional branch probabilities first.");
 const svg=renderProbabilitySvg(checked.draft),name=fileName(checked.draft.title);
 if(format==="svg"){
  download(new Blob([svg],{type:"image/svg+xml;charset=utf-8"}),name+".svg");
  return "Probability tree SVG downloaded. Explain the branches and assumptions in your IA.";
 }
 if(format!=="png")throw new Error("Unsupported probability tree export.");
 const url=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml;charset=utf-8"}));
 try{
  const image=new Image();
  await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(new Error("Could not render probability tree as PNG."));image.src=url;});
  const canvas=document.createElement("canvas");canvas.width=2600;canvas.height=1712;
  const context=canvas.getContext("2d");if(!context)throw new Error("Canvas is unavailable.");
  context.fillStyle="#fff";context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("Could not generate PNG.")),"image/png"));
  download(blob,name+".png");return "High-resolution probability tree PNG downloaded.";
 }finally{URL.revokeObjectURL(url);}
}
