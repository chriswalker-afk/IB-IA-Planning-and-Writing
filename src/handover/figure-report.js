/** Student-owned mathematical figures for full-project readable exports.
 * Work is rendered from the saved generator drafts, never from a website screenshot.
 * An unlinked saved figure remains visible, but cannot be presented as a completed IA result.
 */
import {renderGraphSvg} from "../diagrams/graph-core.js";
import {renderPrintableTraceSvg,traceCoordinates} from "../diagrams/image-tracer-core.js";
import {renderStatSvg} from "../diagrams/stat-studio-render.js";
import {statMethodNote} from "../diagrams/stat-reading-guide.js";
import {renderTableSvg} from "../diagrams/table-studio-render.js";
import {renderVoronoiSvg} from "../diagrams/voronoi-render.js";

const trim=x=>String(x??"").trim();
const row=(label,value)=>trim(value)?{label,value:trim(value)}:null;
const joined=rows=>rows.map(r=>Array.isArray(r)?r.join(" | "):String(r)).join("\n");
const occupied=d=>!!(trim(d?.raw)||trim(d?.expression)||d?.imageSrc||
 (d?.points?.length||0)||(d?.sites?.length||0)||(d?.matrix||[]).some(r=>r.some(x=>trim(x))));
const titles={graph:"Graph",trace:"Coordinate tracing",stat:"Statistical diagram",table:"Mathematical table",voronoi:"Voronoi diagram"};
const specs=[
 {kind:"graph",store:"graphStudio",entryKey:"graphFigureId",render:d=>renderGraphSvg(d),
  details:d=>[
   row("Horizontal variable",d.xLabel+(d.xUnit?" ("+d.xUnit+")":"")),
   row("Vertical variable",d.yLabel+(d.yUnit?" ("+d.yUnit+")":"")),
   row("Mathematical expression",d.expression),
   row("Graph data columns",(d.columns||[]).join(", ")),
   row("Entered source data",d.raw||joined(d.matrix||[])),
   row("Source or collection note",d.sourceText),row("Figure caption",d.caption)
  ]},
 {kind:"trace",store:"imageTracer",entryKey:"imageTraceId",render:d=>renderPrintableTraceSvg(d,d.view),
  details:d=>[
   row("Image",d.imageName),row("Axis labels",[d.xLabel,d.yLabel].filter(Boolean).join(" / ")),
   row("Scale reference",d.knownLength?(d.knownLength+" "+(d.unit||"")).trim():""),
   row("Chosen coordinates",traceCoordinates(d).filter(x=>x.coordinate).map(x=>
    "P"+x.index+": ("+x.coordinate.x.toFixed(5)+", "+x.coordinate.y.toFixed(5)+")").join("\n")),
   row("Perspective or accuracy notes",d.limitations),
   row("Image source",d.sourceCredit),row("Figure caption",d.caption)
  ]},
 {kind:"stat",store:"statStudio",entryKey:"statFigureId",render:d=>renderStatSvg(d),
  details:d=>[
   row("Diagram type",d.kind),row("Statistical method and convention",statMethodNote(d)),
   row("Variable",d.variable+(d.unit?" ("+d.unit+")":""))
   row("Entered source data",d.raw||joined(d.matrix||[])),
   row("Statistical source",d.sourceText),row("Figure caption",d.caption)
  ]},
 {kind:"table",store:"tableStudio",entryKey:"tableFigureId",render:d=>renderTableSvg(d),
  details:d=>[
   row("Why this table was created",d.purpose),
   row("Displayed columns",(d.headings?.length?d.headings:d.columns||[]).join(" | ")),
   row("Entered source data",d.raw||joined(d.matrix||[])),
   row("Source or provenance",d.sourceText),row("Table note",d.note)
  ]},
 {kind:"voronoi",store:"voronoiStudio",entryKey:"voronoiFigureId",render:d=>renderVoronoiSvg(d),
  details:d=>[
   row("Coordinate system",d.coordSystem),
   row("Axis names",[d.xLabel,d.yLabel].filter(Boolean).join(" / ")),
   row("Sites entered",(d.sites||[]).map(x=>x.name+" ("+x.x+", "+x.y+")"+
    (x.kind==="candidate"?" — hypothetical candidate":"")).join("\n")),
   row("Pasted site data",d.raw),row("Site source",d.sourceCredit),
   row("Background map",d.mapName),row("Map source",d.mapCredit),
   row("Student notes",d.note)
  ]}
];
function buildFigure(spec,record,{draft=false}={}){
 const d=record.draft||{},title=trim(d.title)||titles[spec.kind];
 let svg="",error="";
 try{svg=spec.render(d);}
 catch(e){error="The diagram could not be reconstructed: "+(e?.message||"unknown render problem");}
 return {id:record.id,entryId:record.entryId||"",entryKey:spec.entryKey,
  kind:spec.kind,title:(draft?"In-progress draft · ":"")+title,
  status:draft?"Workspace draft, not yet saved as a finished figure":"Student-saved figure; mathematical correctness is not independently checked",
  rows:[row("Figure number",d.figureNumber||d.number),...spec.details(d)].filter(Boolean),
  svg,error};
}
export function collectProjectFigures(state){
 const output=[];
 for(const spec of specs){
  const studio=state?.[spec.store]||{},figures=Array.isArray(studio.figures)?studio.figures:[];
  for(const item of figures){
   if(item?.draft)output.push(buildFigure(spec,item));
  }
  // Saving a project can retain edits to a diagram that have not been saved
  // as a named figure. Never silently lose these in a working-record export.
  if(occupied(studio.draft)){
   const current=figures.find(x=>x.id===studio.activeId);
   if(!current||JSON.stringify(current.draft)!==JSON.stringify(studio.draft)){
    output.push(buildFigure(spec,{id:spec.kind+"-current-draft",entryId:"",draft:studio.draft},{draft:true}));
   }
  }
 }
 return output;
}
export function figureForEntry(figure,entry){
 return !!(figure.entryId&&figure.entryId===entry.id ||
  entry[figure.entryKey]&&entry[figure.entryKey]===figure.id);
}
export function sectionForSavedDataset(dataset,i){
 const rows=[
  row("Column labels",(dataset.columns||[]).join(" | ")),
  row("Student-entered dataset",(dataset.matrix||[]).map(r=>r.join(" | ")).join("\n")),
  row("Provenance",dataset.sourceText)
 ].filter(Boolean);
 return rows.length?{title:"Saved working dataset "+(i+1)+": "+(trim(dataset.name)||"Untitled"),
  description:"A saved dataset snapshot, not automatically a figure in the IA.",rows}:null;
}
/** The same prepared PNG bytes feed PDF and Word; ZIP need not rasterise twice. */
export async function prepareFigureImage(figure){
 if(figure.pngBytes||!figure.svg)return figure;
 if(typeof document==="undefined"||typeof Image==="undefined"||typeof URL==="undefined"||
  typeof URL.createObjectURL!=="function"){
  // Model inspection and existing non-browser unit tests do not have a canvas.
  // In the website, failure to render a saved image must instead stop the export.
  return figure;
 }
 const box=/\bviewBox=["']\s*([0-9.+-]+)\s+([0-9.+-]+)\s+([0-9.+-]+)\s+([0-9.+-]+)\s*["']/.exec(figure.svg);
 const naturalW=box?Number(box[3]):960,naturalH=box?Number(box[4]):660;
 const scale=Math.max(.25,Math.min(2.4,2200/naturalW,2700/naturalH));
 const url=URL.createObjectURL(new Blob([figure.svg],{type:"image/svg+xml;charset=utf-8"}));
 try{
  const image=new Image();
  await new Promise((resolve,reject)=>{
   image.onload=resolve;
   image.onerror=()=>reject(new Error("Cannot render saved "+figure.kind+" figure: "+figure.title));
   image.src=url;
  });
  const canvas=document.createElement("canvas");
  canvas.width=Math.max(1,Math.round(naturalW*scale));
  canvas.height=Math.max(1,Math.round(naturalH*scale));
  const ctx=canvas.getContext("2d");
  if(!ctx)throw new Error("This browser cannot create a canvas for the project figures.");
  ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(image,0,0,canvas.width,canvas.height);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(x=>x?resolve(x):
   reject(new Error("Could not encode the saved figure as PNG.")),"image/png"));
  figure.pngBytes=new Uint8Array(await blob.arrayBuffer());
  figure.pixelWidth=canvas.width;figure.pixelHeight=canvas.height;
  return figure;
 }finally{URL.revokeObjectURL(url);}
}
export async function prepareReportFigures(model){
 for(const section of model.sections||[])
  for(const figure of section.figures||[]){
   if(figure.error)throw new Error(figure.error);
   await prepareFigureImage(figure);
  }
 return model;
}
