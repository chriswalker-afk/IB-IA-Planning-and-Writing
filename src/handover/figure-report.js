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
import {renderGeometrySvg} from "../diagrams/geometry-render.js";
import {orthogonalDecomposition,geometrySensitivity} from "../diagrams/geometry-advanced.js";
import {renderProbabilitySvg} from "../diagrams/probability-render.js";
import {probabilityAnalysis,probabilityParentPaths} from "../diagrams/probability-core.js";
import {representationTool} from "../diagrams/representation-registry.js";
import {linkedRepresentationEntry} from "../diagrams/figure-linking.js";

const trim=x=>String(x??"").trim();
const row=(label,value)=>trim(value)?{label,value:trim(value)}:null;
const joined=rows=>rows.map(r=>Array.isArray(r)?r.join(" | "):String(r)).join("\n");
const occupied=d=>!!(trim(d?.raw)||trim(d?.expression)||d?.imageSrc||
 (d?.points?.length||0)||(d?.sites?.length||0)||(d?.edited&&d?.vertices?.length||0)||(d?.edited&&d?.branches)||(d?.matrix||[]).some(r=>r.some(x=>trim(x))));
const titles={graph:"Graph",trace:"Coordinate tracing",stat:"Statistical diagram",table:"Mathematical table",voronoi:"Voronoi diagram",geometry:"Geometric construction",probability:"Probability tree"};
const registeredFigure=id=>{
 const tool=representationTool(id);
 if(!tool)throw new Error("Unregistered diagram kind: "+id);
 return {kind:tool.id,store:tool.studio,entryKey:tool.entryKey};
};
const specs=[
 {...registeredFigure("graph"),render:d=>renderGraphSvg(d),
  details:d=>[
   row("Horizontal variable",d.xLabel+(d.xUnit?" ("+d.xUnit+")":"")),
   row("Vertical variable",d.yLabel+(d.yUnit?" ("+d.yUnit+")":"")),
   row("Mathematical expression",d.expression),
   row("Graph data columns",(d.columns||[]).join(", ")),
   row("Entered source data",d.raw||joined(d.matrix||[])),
   row("Source or collection note",d.sourceText),row("Figure caption",d.caption)
  ]},
 {...registeredFigure("trace"),render:d=>renderPrintableTraceSvg(d,d.view),
  details:d=>[
   row("Image",d.imageName),row("Axis labels",[d.xLabel,d.yLabel].filter(Boolean).join(" / ")),
   row("Scale reference",d.knownLength?(d.knownLength+" "+(d.unit||"")).trim():""),
   row("Chosen coordinates",traceCoordinates(d).filter(x=>x.coordinate).map(x=>
    "P"+x.index+": ("+x.coordinate.x.toFixed(5)+", "+x.coordinate.y.toFixed(5)+")").join("\n")),
   row("Perspective or accuracy notes",d.limitations),
   row("Image source",d.sourceCredit),row("Figure caption",d.caption)
  ]},
 {...registeredFigure("stat"),render:d=>renderStatSvg(d),
  details:d=>[
   row("Diagram type",d.kind),row("Statistical method and convention",statMethodNote(d)),
   row("Variable",d.variable+(d.unit?" ("+d.unit+")":"")),
   row("Entered source data",d.raw||joined(d.matrix||[])),
   row("Statistical source",d.sourceText),row("Figure caption",d.caption)
  ]},
 {...registeredFigure("table"),render:d=>renderTableSvg(d),
  details:d=>[
   row("Why this table was created",d.purpose),
   row("Displayed columns",(d.headings?.length?d.headings:d.columns||[]).join(" | ")),
   row("Entered source data",d.raw||joined(d.matrix||[])),
   row("Source or provenance",d.sourceText),row("Table note",d.note)
  ]},
 {...registeredFigure("voronoi"),render:d=>renderVoronoiSvg(d),
  details:d=>[
   row("Coordinate system",d.coordSystem),
   row("Axis names",[d.xLabel,d.yLabel].filter(Boolean).join(" / ")),
   row("Sites entered",(d.sites||[]).map(x=>x.name+" ("+x.x+", "+x.y+")"+
    (x.kind==="candidate"?" — hypothetical candidate":"")).join("\n")),
   row("Pasted site data",d.raw),row("Site source",d.sourceCredit),
   row("Background map",d.mapName),row("Map source",d.mapCredit),
   row("Student notes",d.note)
  ]},
 {...registeredFigure("geometry"),render:d=>renderGeometrySvg(d),details:d=>[
   row("Scale",d.mode==="coordinate"?"Coordinate-based":"Schematic; not necessarily to scale"),
   row("Student-entered vertices and labels",(d.vertices||[]).map(p=>p.label+" ("+p.x+", "+p.y+")"+
    (p.edgeLabel?" | side: "+p.edgeLabel:"")+(p.angleLabel?" | angle: "+p.angleLabel:"")).join("\n")),
   row("Construction points",(d.auxPoints||[]).map(p=>
     p.label+" ("+p.x+", "+p.y+")").join("\n")),
   row("Auxiliary constructions",(d.guides||[]).map(g=>
     [g.kind,g.from,g.kind==="height"?"to baseline "+g.baseStart+"–"+g.baseEnd:g.kind==="north"?"north":g.to,
      g.label?"label: "+g.label:"",
      g.showLength?"calculated length displayed":""].filter(Boolean).join(" | ")).join("\n")),
   row("Annotation settings",[
      "Side labels: "+(d.dimensionStyle==="dimension"?"dimension arrows":"adjacent"),
      "Length format: "+(d.lengthFormat==="sf"?"significant figures":"decimal places")+" ("+d.lengthDigits+")",
      "Angle decimals: "+d.angleDigits
    ].join("; ")),
   row("Construction requirements",(d.vertices||[]).map((p,i)=>[
     p.edgeConstraint&&p.edgeConstraint!=="free"?"Side "+p.label+": "+p.edgeConstraint:"",
     p.rightAngle?"Angle at "+p.label+": 90 degrees required":"",
     p.locked?"Point "+p.label+": coordinates locked":""
    ].filter(Boolean).join("; ")).filter(Boolean).join("\n")),
   row("Rectangular decomposition",d.showDecomposition?(()=>{
    const result=orthogonalDecomposition(d);
    return result.ok?result.rectangles.map((r,i)=>
      "R"+(i+1)+": "+r.width+" x "+r.height+" = "+r.area).join("; ")+"; total="+result.area:
     result.reason;
   })():""),
   row("Local sensitivity check",d.showSensitivity?(()=>{
    const result=geometrySensitivity(d);
    return result.ok?"One-coordinate-at-a-time ±"+result.delta+
     "; max observed area change="+result.maxAreaChange+
     "; max observed perimeter change="+result.maxPerimeterChange+
     ". Not a joint uncertainty bound or confidence interval.":result.reason;
   })():""),
   row("Image Tracer provenance",d.provenance?.kind==="image-tracer"?
    [
     "Original figure: "+(d.provenance.traceFigureId||"unsaved tracer draft"),
     "Photograph: "+d.provenance.imageName,"Perspective: "+d.provenance.perspective,
     "Known reference: "+d.provenance.knownLength+" "+d.unit,
     "Reference pixels: "+d.provenance.referencePixels,
     "Unit per pixel: "+d.provenance.unitsPerPixel,
     "Display decimals: "+d.provenance.displayPrecision,
     "Original limitations: "+d.provenance.limitations,
     "Transferred pixel vertices: "+(d.provenance.pixelPoints||[]).map(p=>"("+p.x+", "+p.y+")").join(", ")
    ].filter(Boolean).join("\n"):""),
   row("Unit",d.unit),row("North orientation",d.northAligned?"x east / y north":""),
   row("Source type",d.sourceKind),row("Original source",d.sourceCredit),row("Figure caption",d.caption),row("Limitations",d.note)]},
  {...registeredFigure("probability"),render:d=>renderProbabilitySvg(d),details:d=>{
    const a=probabilityAnalysis(d);
    return [
     row("Model",d.treeMode==="flexible"?
       "Flexible tree, up to "+d.stages+" stages, "+a.paths.length+" terminal paths; each active split conditional on its exact history":
       d.stages+" successive binary stages; each later split conditional on its complete history"),
     row("Stage labels",(d.stageLabels||[]).slice(0,d.stages).join(" → ")),
     row("Entered outcomes and branch probabilities",Object.entries(d.branches||{})
       .filter(([key])=>probabilityParentPaths(a.draft).includes(key)).map(([parent,branches])=>
       (parent||"start")+": "+(branches||[]).map(x=>x.label+" = "+x.probability).join(" / ")).join("\n")),
     row("Terminal paths",a.paths.map(p=>p.labels.join(" → ")+(p.key.length<d.stages?" (ends early)":"")).join("\n")),
     row("Diagram spacing",d.treeMode==="flexible"?d.layoutStyle:"Legacy binary layout"),
     row("Validity",a.ready?"Each active split sums to 1; total path probability = "+a.total:a.issues.join("; ")),
     row("Path products",d.showProducts&&a.ready?a.paths.map(x=>x.labels.join(" → ")+
       ": "+x.steps.join(" × ")+" = "+x.probability).join("\n"):""),
     row("Selected event outcomes",d.showEventCalculation?
       "E ("+d.eventName+"): "+(d.eventLeaves||[]).join(", ")+
       "; C ("+d.conditionName+"): "+(d.conditionLeaves||[]).join(", "):""),
     row("Conditional calculations",d.showEventCalculation&&a.ready?
       ["P(E)="+a.event,"P(C)="+a.condition,"P(E∩C)="+a.intersection,
        "P(E|C)="+(a.conditional===null?"undefined or unselected":a.conditional)].join("; "):""),
     row("Source type",d.sourceKind),row("Original probability source",d.sourceCredit),row("Figure caption",d.caption),
     row("Dependence, estimates and limitations",d.note)
    ];
  }}
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
   if(item?.draft){
    const {linked}=linkedRepresentationEntry(state?.entries||[],spec.entryKey,item);
    const figure=buildFigure(spec,item);
    // Restore placement from the explicit entry field on older JSON backups.
    figure.entryId=linked?.id||"";
    output.push(figure);
   }
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
 if(!figure||!entry)return false;
 const explicit=entry[figure.entryKey];
 if(explicit&&explicit!==figure.id)return false;
 return !!(explicit===figure.id||(figure.entryId&&figure.entryId===entry.id));
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
