/** Rasterise standalone SVG math locally for PDF and Word image runs.
 * Uses the same MathJax renderer as the answer preview. Browser only;
 * no request is sent to a server and no personal text is transmitted.
 */
import {mathSvg} from "./mixed-math.js";
const cache=new Map(),MAX_IMAGES=140;
export async function mathPng(tex,{display=false}={}){
 const key=(display?"D:":"I:")+tex;
 if(cache.has(key))return cache.get(key);
 if(typeof document==="undefined"||typeof Image==="undefined"||
    typeof URL==="undefined"||typeof URL.createObjectURL!=="function")
  throw new Error("Illustrated mathematics in PDF and Word must be exported from a browser.");
 const m=mathSvg(tex,{display});
 const pixelPerEx=28;
 const width=Math.ceil(m.widthEx*pixelPerEx),height=Math.ceil(m.heightEx*pixelPerEx);
 if(width>7000||height>4000)throw new Error("This equation is too large for a document; please split it.");
 // Stand-alone numeric dimensions make SVG rasterisation independent of the
 // browser's default font size and ensure every formula stays in its place.
 const svg=m.svg
  .replace(/\bwidth="[0-9.]+ex"/,'width="'+width+'"')
  .replace(/\bheight="[0-9.]+ex"/,'height="'+height+'"');
 const url=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml;charset=utf-8"}));
 try{
  const image=new Image();
  await new Promise((resolve,reject)=>{
   image.onload=resolve;image.onerror=()=>reject(new Error("This equation could not be rendered as a document image."));
   image.src=url;
  });
  const canvas=document.createElement("canvas");
  canvas.width=width;canvas.height=height;
  const context=canvas.getContext("2d");
  if(!context)throw new Error("Your browser does not support mathematical image export.");
  context.clearRect(0,0,width,height);
  context.drawImage(image,0,0,width,height);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(
   x=>x?resolve(x):reject(new Error("Could not save the mathematical rendering.")),"image/png"
  ));
  const result={...m,bytes:new Uint8Array(await blob.arrayBuffer()),pixelWidth:width,pixelHeight:height};
  if(cache.size>=MAX_IMAGES)cache.delete(cache.keys().next().value);
  cache.set(key,result);
  return result;
 }finally{URL.revokeObjectURL(url);}
}
