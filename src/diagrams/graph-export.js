/** Browser export only. SVG is generated from escaped student strings; no remote resources. */
import {analyseGraph,graphFileBase,renderGraphSvg,renderGraphResidualSvg} from "./graph-core.js";
const svgBlob=svg=>new Blob([svg],{type:"image/svg+xml;charset=utf-8"});
const triggerDownload=(blob,name)=>{
 const url=URL.createObjectURL(blob),link=document.createElement("a");
 try{
  link.href=url;link.download=name;document.body.appendChild(link);link.click();
 }finally{
  link.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
 }
};
async function asPng(svg){
 const source=URL.createObjectURL(svgBlob(svg));
 try{
  const picture=new Image();
  picture.decoding="async";
  await new Promise((resolve,reject)=>{
   picture.onload=()=>resolve();
   picture.onerror=()=>reject(new Error("Unable to render this graph as a PNG."));
   picture.src=source;
  });
  const canvas=document.createElement("canvas"),scale=3;
  canvas.width=(picture.naturalWidth||940)*scale;
  canvas.height=(picture.naturalHeight||620)*scale;
  const context=canvas.getContext("2d");
  if(!context)throw new Error("This browser does not provide a 2D canvas.");
  context.fillStyle="#ffffff";context.fillRect(0,0,canvas.width,canvas.height);
  context.drawImage(picture,0,0,canvas.width,canvas.height);
  return await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("Could not create the PNG.")),"image/png"));
 }finally{URL.revokeObjectURL(source);}
}
export async function exportGraphFigure(draft,format){
 const q=analyseGraph(draft);
 if(!q.ready)throw new Error("Fix the required graph quality checks before exporting.");
 const residual=["residual-svg","residual-png"].includes(format);
 const model=q.selectedResidualModel;
 if(residual&&(!q.draft.showResidualPlot||!model?.visible||!model.valid||!model.diagnostics?.ok))
  throw new Error("Select a visible model that predicts every observation, then show its residual plot before exporting.");
 const svg=residual?renderGraphResidualSvg(draft):renderGraphSvg(draft);
 if(!svg)throw new Error("There is no residual plot to export.");
 const basename=graphFileBase(draft)+(residual?"-residuals-"+model.type:"");
 const outputFormat=residual?format.slice("residual-".length):format;
 if(outputFormat==="svg"){
  triggerDownload(svgBlob(svg),basename+".svg");
  return residual?"Residual SVG downloaded. Explain the error pattern in your IA.":"SVG figure downloaded. Insert it after introducing it in your IA.";
 }
 if(!["png","copy"].includes(outputFormat))throw new Error("Unsupported graph export.");
 const png=await asPng(svg);
 if(outputFormat==="png"){
  triggerDownload(png,basename+".png");
  return residual?"Residual PNG downloaded. Introduce and interpret it in your IA.":
   "High-resolution PNG downloaded. Insert it into your actual IA document.";
 }
 if(!navigator.clipboard?.write||typeof ClipboardItem==="undefined")
  throw new Error("Direct image copying is unavailable in this browser. Download the PNG instead.");
 await navigator.clipboard.write([new ClipboardItem({"image/png":png})]);
 return "Graph copied as a PNG. Paste it into Google Docs after your introductory sentence.";
}
