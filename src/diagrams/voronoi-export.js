/** Local SVG, PNG, clipboard and site/region CSV export. No external tiles or network. */
import {analyzeVoronoi} from "./voronoi-core.js";
import {renderVoronoiSvg} from "./voronoi-render.js";
import {diagramUnitPower} from "./diagram-notation.js";
import {finiteCell} from "./graph-core.js";
const base=d=>String(d.title||"voronoi-diagram").normalize("NFKD")
 .replace(/[^a-z0-9 -]/gi,"").trim().replace(/\s+/g,"-").slice(0,65).toLowerCase()||"voronoi-diagram";
const cell=value=>{
 let s=String(value??"");
 if(finiteCell(s)===null&&/^\s*[=+\-@]/.test(s))s="'"+s;
 return '"'+s.replace(/"/g,'""')+'"';
};
export function voronoiCSV(raw){
 const q=analyzeVoronoi(raw);
 if(!q.ready)throw new Error("Complete the Voronoi quality checks before exporting coordinates.");
 const d=q.draft,rows=[["Site","Location type","X"+(d.unitMode==="unit"?" ("+d.unit+")":""),
  "Y"+(d.unitMode==="unit"?" ("+d.unit+")":""),"Clipped cell area"+(d.unitMode==="unit"?" ("+diagramUnitPower(d.unit,2)+")":"")]];
 for(const c of q.cells)
  rows.push([c.name,c.site.kind==="candidate"?"Hypothetical candidate":"Existing location",
   c.site.x,c.site.y,c.area]);
 rows.push([]);
 rows.push(["Study rectangle","xmin",q.bounds.xMin,"xmax",q.bounds.xMax]);
 rows.push(["Study rectangle","ymin",q.bounds.yMin,"ymax",q.bounds.yMax]);
 rows.push(["Distance metric","Euclidean planar distance"]);
 rows.push(["Limit","Area of a clipped cell is not population, road travel time or proof of an optimal location"]);
 if(d.sourceKind==="secondary")rows.push(["Site coordinate source",d.sourceCredit]);
 if(d.mapSrc)rows.push(["Background map source",d.mapCredit]);
 return rows.map(row=>row.map(cell).join(",")).join("\r\n")+"\r\n";
}
const download=(blob,name)=>{
 const url=URL.createObjectURL(blob),a=document.createElement("a");
 try{a.href=url;a.download=name;document.body.appendChild(a);a.click();}
 finally{a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500);}
};
async function asPng(svg){
 const src=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml;charset=utf-8"}));
 try{
  const picture=new Image();
  await new Promise((resolve,reject)=>{
   picture.onload=resolve;
   picture.onerror=()=>reject(new Error("Could not render the Voronoi SVG as an image. Try the SVG download."));
   picture.src=src;
  });
  const canvas=document.createElement("canvas");canvas.width=3000;canvas.height=2070;
  const ctx=canvas.getContext("2d");
  if(!ctx)throw new Error("Your browser cannot create a PNG canvas.");
  ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(picture,0,0,canvas.width,canvas.height);
  return await new Promise((resolve,reject)=>
   canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("Could not create a PNG.")),"image/png"));
 }finally{URL.revokeObjectURL(src);}
}
export async function exportVoronoi(raw,format){
 const q=analyzeVoronoi(raw);
 if(!q.ready)throw new Error("Check the site coordinates, metric, study rectangle, labels and sources first.");
 const name=base(q.draft);
 if(format==="csv"){
  download(new Blob([voronoiCSV(q.draft)],{type:"text/csv;charset=utf-8"}),name+"-sites.csv");
  return "Site coordinates and clipped cell areas downloaded. Use only relevant summary values in your IA.";
 }
 const svg=renderVoronoiSvg(q.draft);
 if(format==="svg"){
  download(new Blob([svg],{type:"image/svg+xml;charset=utf-8"}),name+".svg");
  return "Vector Voronoi diagram saved. Introduce it in your IA before showing it.";
 }
 if(format!=="png"&&format!=="copy")throw new Error("Unsupported Voronoi format.");
 const blob=await asPng(svg);
 if(format==="png"){
  download(blob,name+".png");
  return "High-resolution Voronoi diagram PNG downloaded.";
 }
 if(!navigator.clipboard?.write||typeof ClipboardItem==="undefined")
  throw new Error("Image clipboard is unavailable here; download PNG or SVG instead.");
 await navigator.clipboard.write([new ClipboardItem({"image/png":blob})]);
 return "Voronoi figure copied. Paste it into your actual IA after introducing its mathematical purpose.";
}
