/** Transform and compress student-selected raster photos entirely in the browser.
 * Embedded base64 image travels with the JSON project backup: no remote fetch.
 */
import {MAX_IMAGE_CHARS} from "./image-tracer-core.js";
const TYPES=new Set(["image/jpeg","image/png","image/webp"]);
const MAX_BYTES=14_000_000;
function loadPicture(url){
 return new Promise((resolve,reject)=>{
  const img=new Image();
  img.onload=()=>resolve(img);
  img.onerror=()=>reject(new Error("This picture could not be decoded. Try a JPG or PNG."));
  img.src=url;
 });
}
function encodeImage(img,rotation=0){
 const originalW=img.naturalWidth,originalH=img.naturalHeight;
 if(originalW<32||originalH<32||Math.max(originalW,originalH)>12000)
  throw new Error("This image is too small or large to trace reliably.");
 for(const maxSide of [1500,1300,1100,950,800,680,540]){
  for(const quality of [.83,.72,.59]){
   const scale=Math.min(1,maxSide/Math.max(originalW,originalH));
   const w=Math.max(32,Math.round(originalW*scale)),h=Math.max(32,Math.round(originalH*scale));
   const flipped=Math.abs(rotation)===90;
   const canvas=document.createElement("canvas");
   canvas.width=flipped?h:w;canvas.height=flipped?w:h;
   const ctx=canvas.getContext("2d");
   if(!ctx)throw new Error("The browser could not create an image canvas.");
   ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);
   ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(rotation*Math.PI/180);
   ctx.drawImage(img,-w/2,-h/2,w,h);
   let data=canvas.toDataURL("image/webp",quality);
   if(!data.startsWith("data:image/webp;"))data=canvas.toDataURL("image/jpeg",quality);
   if(data.length<=MAX_IMAGE_CHARS)return{src:data,width:canvas.width,height:canvas.height,
    originalWidth:originalW,originalHeight:originalH,compressed:data.length>=MAX_IMAGE_CHARS*.8||scale<1};
  }
 }
 throw new Error("This image is too complex to save locally at usable detail. Crop it in your photos app or choose a smaller image.");
}
export async function importTracePhoto(file){
 if(!file||!TYPES.has(file.type))throw new Error("Choose a JPG, PNG or WebP image. SVG and HEIC images are not supported.");
 if(file.size>MAX_BYTES)throw new Error("Choose an image under 14 MB; a smaller or cropped photograph works best.");
 const url=URL.createObjectURL(file);
 try{
  const img=await loadPicture(url);
  const result=encodeImage(img);
  return {...result,name:String(file.name||"Imported image").slice(0,130)};
 }finally{URL.revokeObjectURL(url);}
}
export async function rotateTracePhoto(dataUrl,clockwise=true){
 if(!/^data:image\/(?:jpeg|png|webp);base64,/i.test(dataUrl)||dataUrl.length>MAX_IMAGE_CHARS)
  throw new Error("Upload a supported raster image before rotating.");
 const img=await loadPicture(dataUrl);
 return encodeImage(img,clockwise?90:-90);
}
