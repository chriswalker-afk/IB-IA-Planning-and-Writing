import {renderGraphSvg} from "../diagrams/graph-core.js";
import {renderStatSvg} from "../diagrams/stat-studio-render.js";
import {renderTableSvg} from "../diagrams/table-studio-render.js";
import {renderTraceOverlaySvg,renderCleanTraceSvg} from "../diagrams/image-tracer-core.js";
import {renderVoronoiSvg} from "../diagrams/voronoi-render.js";
import {renderFigureHandover} from "../diagrams/presentation-coach-view.js";

/** Saved figures are mathematical working files, not verified conclusions. */
export const FIRST_FIGURE_TYPES=Object.freeze([
 {kind:"graph",studio:"graphStudio",entryKey:"graphFigureId",title:"Graph",icon:"chart"},
 {kind:"stat",studio:"statStudio",entryKey:"statFigureId",title:"Statistical diagram",icon:"chart"},
 {kind:"table",studio:"tableStudio",entryKey:"tableFigureId",title:"Formatted table",icon:"table"},
 {kind:"trace",studio:"imageTracer",entryKey:"imageTraceId",title:"Coordinate tracing",icon:"image"},
 {kind:"voronoi",studio:"voronoiStudio",entryKey:"voronoiFigureId",title:"Voronoi construction",icon:"map"}
]);

export function firstSavedFigures(state,{scope="first"}={}){
 const entries=Array.isArray(state?.entries)?state.entries:[];
 const result=[];
 for(const type of FIRST_FIGURE_TYPES){
  const figures=state?.[type.studio]?.figures||[];
  for(const figure of figures){
   if(!figure?.id||!figure.draft)continue;
   const entryIndex=entries.findIndex(x=>x?.id===figure.entryId);
   const linked=entryIndex>=0?entries[entryIndex]:null;
   const active=entries[state.completion?.activeEntryIndex];
   // New mathematical stages show only diagrams linked to this stage; earlier
   // or unrelated figures stay on their own pages.
   if(scope==="active"){
    if(!active||!linked||linked.id!==active.id)continue;
   }else if(linked&&linked.phase!=="first")continue;
   result.push({...type,figure,entryIndex,linked,kindKey:type.kind+":"+figure.id});
  }
 }
 return result.sort((a,b)=>(b.figure.savedAt||"").localeCompare(a.figure.savedAt||""));
}

function preview(item){
 const d=item.figure.draft;
 switch(item.kind){
  case "graph":return '<div class="graph-svg-wrap">'+renderGraphSvg(d)+'</div>';
  case "stat":return '<div class="stat-entry-figure">'+renderStatSvg(d)+'</div>';
  case "table":return '<div class="show-first-table-figure">'+renderTableSvg(d)+'</div>';
  case "trace":return '<div class="trace-entry-photo">'+(d.view==="math"?renderCleanTraceSvg(d):renderTraceOverlaySvg(d))+'</div>';
  case "voronoi":return '<div class="show-first-voronoi-figure">'+renderVoronoiSvg(d)+'</div>';
  default:return "";
 }
}

/** Display the active linked output and every other saved figure without
 * treating a saved plot as a completed IA result. */
export function renderFirstFigureGallery(state,icon,e,panels={},options={}){
 const entries=firstSavedFigures(state,options),active=state.entries?.[state.completion?.activeEntryIndex];
 const hidden=new Set(state.completion?.hiddenFirstFigures||[]);
 const picked=entries.find(x=>!hidden.has(x.kindKey)&&active&&
  active[x.entryKey]===x.figure.id);
 const others=entries.filter(x=>x!==picked&&!hidden.has(x.kindKey));
 const hiddenItems=entries.filter(x=>hidden.has(x.kindKey));
 if(!entries.length)return '<p class="show-first-no-figure">No diagrams are linked to this mathematical stage yet. A calculation or a theoretical example can also be shown without a diagram.</p>';
 const hide=(x)=>'<button class="btn btn-quiet btn-sm" type="button" data-action="first-figure-hide" data-figure-key="'+e(x.kindKey)+'">'+icon("eye-off")+' Hide preview</button>';
 const figureCard=(x)=>{
  const label=x.linked?"Linked to mathematical stage":"Saved tool draft";
  return '<article class="show-first-figure-extra" data-first-figure-key="'+e(x.kindKey)+'">'+
   '<div class="show-first-figure-extra-head"><span>'+icon(x.icon)+' <strong>'+e(x.figure.draft.title||x.title)+'</strong></span>'+
   '<small>'+e(label)+'</small></div>'+
   '<div class="show-first-figure-canvas">'+preview(x)+'</div>'+
   '<div class="show-first-figure-buttons">'+
    '<button type="button" class="btn btn-secondary btn-sm" data-action="first-figure-edit" data-figure-kind="'+e(x.kind)+'" data-figure-id="'+e(x.figure.id)+'">'+icon("pencil")+' Edit or export</button>'+
    (x.linked&&active?.id!==x.linked.id?
     '<button type="button" class="btn btn-secondary btn-sm" data-action="first-figure-select" data-entry-id="'+e(x.linked.id)+'">'+icon("arrow-right")+' Reflect on this result</button>':"")+
    hide(x)+'</div>'+
   renderFigureHandover(state,x.kind,x.figure.draft,icon,e,{id:x.figure.id,linked:!!x.linked})+'</article>';
 };
 const primary=picked?'<div class="show-first-figure-primary" data-first-figure-key="'+e(picked.kindKey)+'">'+
  (typeof panels[picked.kind]==="function"?panels[picked.kind]():figureCard(picked))+
  '<div class="show-first-figure-buttons">'+hide(picked)+'</div></div>':"";
 const shown=others.slice(0,2).map(figureCard).join("");
 const rest=others.length>2?
  '<details class="show-first-more-figures"><summary>Show '+(others.length-2)+' more saved diagrams or tables</summary>'+
   others.slice(2).map(figureCard).join("")+'</details>':"";
 const restore=hiddenItems.length?
  '<details class="show-first-hidden-figures"><summary>'+hiddenItems.length+' hidden preview'+(hiddenItems.length===1?"":"s")+' · Restore</summary>'+
  hiddenItems.map(x=>'<button type="button" class="btn btn-quiet btn-sm" data-action="first-figure-restore" data-figure-key="'+e(x.kindKey)+'">'+
   icon("eye")+' Show '+e(x.figure.draft.title||x.title)+'</button>').join("")+'</details>':"";
 return '<section class="show-first-figure-gallery" data-first-figure-gallery aria-label="Saved figures for this mathematical exploration">'+
  '<div class="show-first-gallery-heading"><div><strong>'+icon("layers")+' My saved diagrams and tables</strong>'+
  '<p>These are real saved figures, not automatic proof of a result. Insert the relevant ones in your IA, then explain what the mathematics actually establishes.</p></div>'+
  '<span>'+entries.length+' saved</span></div>'+
  primary+shown+rest+restore+'</section>';
}
