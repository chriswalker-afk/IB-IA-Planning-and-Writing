/**
 * Active, implemented diagram generators. Register a tool only once its
 * editor, save/link actions, gallery preview and full exports work. Never
 * expose unfinished future tools as dead buttons.
 */
export const REPRESENTATION_TOOLS=Object.freeze([
 {id:"graph",navLabel:"Graph",title:"Graph plotter",figureTitle:"Graph",action:"graph-open",icon:"chart",
  detail:"Scatter plots, time series and function graphs with axis and unit checks.",
  groups:["data","models"],studio:"graphStudio",entryKey:"graphFigureId",
  root:"graph-studio",linkedReason:"linked-graph"},
 {id:"stat",navLabel:"Statistics",title:"Statistical diagrams",figureTitle:"Statistical diagram",action:"stat-open",icon:"bar-chart",
  detail:"Histograms, box plots, dot plots and comparative bar charts.",
  groups:["data"],studio:"statStudio",entryKey:"statFigureId",
  root:"stat-studio",linkedReason:"linked-statistics"},
 {id:"table",navLabel:"Tables",title:"Table Studio",figureTitle:"Formatted table",action:"table-open",icon:"table",
  detail:"Short labelled tables, summary statistics and frequency tables.",
  groups:["data","decisions"],studio:"tableStudio",entryKey:"tableFigureId",
  root:"table-studio",linkedReason:"linked-table"},
 {id:"trace",navLabel:"Tracer",title:"Image & coordinate tracer",figureTitle:"Coordinate tracing",action:"trace-open",icon:"image",
  detail:"Calibrate a photo or scale drawing, trace points and export coordinates.",
  groups:["geometry","models"],studio:"imageTracer",entryKey:"imageTraceId",
  root:"image-tracer",linkedReason:"linked-trace"},
 {id:"voronoi",navLabel:"Voronoi",title:"Voronoi Studio",figureTitle:"Voronoi construction",action:"voronoi-open",icon:"map",
  detail:"Plot real site coordinates, construct nearest-site cells and test proposed sites.",
  groups:["geometry","decisions"],studio:"voronoiStudio",entryKey:"voronoiFigureId",
  root:"voronoi-studio",linkedReason:"linked-voronoi"},
 {id:"geometry",navLabel:"Geometry",title:"Geometry & Measurement Studio",figureTitle:"Geometric construction",action:"geometry-open",icon:"ruler",
  detail:"Build triangles or polygons with justified lengths, angles and bearings.",groups:["geometry","models"],
  studio:"geometryStudio",entryKey:"geometryFigureId",root:"geometry-studio",linkedReason:"linked-geometry"},
 {id:"distribution",navLabel:"Distributions",title:"Probability Distribution Studio",figureTitle:"Probability distribution",action:"distribution-open",icon:"chart-column",
  detail:"Normal and binomial models with shaded events and IA-ready figures.",groups:["models","decisions"],studio:"distributionStudio",entryKey:"distributionFigureId",root:"distribution-studio",linkedReason:"linked-distribution"},
 {id:"probability",navLabel:"Probability",title:"Probability Tree Studio",figureTitle:"Probability tree",action:"probability-open",icon:"git-branch",
  detail:"Create 2–3-stage conditional trees, validate branches and explore path/event probabilities.",
  groups:["decisions","models"],studio:"probabilityStudio",entryKey:"probabilityFigureId",
  root:"probability-studio",linkedReason:"linked-probability"}
].map(tool=>Object.freeze({...tool,groups:Object.freeze(tool.groups)})));
export const representationTool=id=>REPRESENTATION_TOOLS.find(tool=>tool.id===id)||null;
export const activeRepresentationTool=state=>REPRESENTATION_TOOLS.find(tool=>state?.[tool.studio]?.open===true)||null;
export function closeRepresentationTools(state){
 for(const tool of REPRESENTATION_TOOLS)if(state?.[tool.studio])state[tool.studio].open=false;
}
export function activateRepresentationTool(state,id){
 const chosen=representationTool(id);
 if(!chosen||!state?.[chosen.studio])return false;
 for(const tool of REPRESENTATION_TOOLS)if(state[tool.studio])state[tool.studio].open=tool.id===id;
 return true;
}
/**
 * A toolbar switch is not "open the linked figure again": it must preserve
 * current unsaved drafts. If the target editor points to a figure already
 * owned by another mathematical stage, retain its draft as a separate copy
 * rather than allowing the current stage to overwrite the older saved record.
 * Explicit stage links take precedence over stale legacy record.entryId data.
 */
export function switchRepresentationEditor(state,id){
 const tool=representationTool(id),current=activeRepresentationTool(state);
 if(!tool||!current||current.id===id||!state?.[tool.studio])
  return {ok:false,detached:false};
 const studio=state[tool.studio],record=studio.figures?.find(f=>f.id===studio.activeId);
 const active=state.entries?.[state.completion?.activeEntryIndex];
 const owners=record?(state.entries||[]).filter(entry=>entry?.[tool.entryKey]===record.id||entry?.figureRefs?.includes(tool.id+':'+record.id)):[];
 const belongsElsewhere=!!record&&(
  owners.some(entry=>entry.id!==active?.id)||
  (!owners.length&&!!record.entryId&&record.entryId!==active?.id)
 );
 if(belongsElsewhere)studio.activeId=""; // Keep draft; never mutate the saved older figure.
 activateRepresentationTool(state,id);
 return {ok:true,detached:belongsElsewhere};
}
export function representationFigureKey(key){
 const match=/^([a-z][a-z0-9-]*):([a-z0-9-]+)$/i.exec(String(key??""));
 const tool=match?representationTool(match[1]):null;
 return tool?{tool,id:match[2]}:null;
}
/** Return to the original mathematical page, including later stages. */
export function representationReturnNode(state){
 const saved=state?.completion?.editorReturnNode;
 if(["C30","C40","C50"].includes(saved))return saved;
 const index=state?.completion?.activeEntryIndex,entry=state?.entries?.[index];
 if(entry?.phase==="substantial"){
  const number=state.entries.slice(0,index+1).filter(x=>x?.phase==="substantial").length;
  return number>1?"C50":"C40";
 }
 return "C30";
}
