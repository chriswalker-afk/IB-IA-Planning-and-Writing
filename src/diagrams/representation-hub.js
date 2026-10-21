/**
 * One coherent representation chooser instead of a growing stack of launch
 * boxes. Advice follows a student's explicitly selected provisional route,
 * falling back to their own first-type selection, never invented analysis.
 */
import {contextualRepresentationAdvice} from "./presentation-coach-core.js";
import {renderHubDatasetEvidence} from "./presentation-coach-view.js";
export const REPRESENTATION_TOOLS=Object.freeze([
 {id:"graph",title:"Graph plotter",action:"graph-open",icon:"chart",
  detail:"Scatter plots, time series and function graphs with axis and unit checks.",
  groups:["data","models"]},
 {id:"stat",title:"Statistical diagrams",action:"stat-open",icon:"chart",
  detail:"Histograms, box plots, dot plots and comparative bar charts.",
  groups:["data"]},
 {id:"table",title:"Table Studio",action:"table-open",icon:"table",
  detail:"Short labelled tables, summary statistics and frequency tables.",
  groups:["data","decisions"]},
 {id:"trace",title:"Image & coordinate tracer",action:"trace-open",icon:"image",
  detail:"Calibrate a photo or scale drawing, trace points and export coordinates.",
  groups:["geometry","models"]},
 {id:"voronoi",title:"Voronoi Studio",action:"voronoi-open",icon:"map",
  detail:"Plot real site coordinates, construct nearest-site cells and test proposed sites.",
  groups:["geometry","decisions"]}
]);
export const REPRESENTATION_FILTERS=Object.freeze([
 ["all","All tools"],["data","Explore data"],["geometry","Explore geometry"],
 ["models","Build a model"],["decisions","Make decisions"]
]);
// Each pair is editorially grounded in the saved route's actual first maths.
const routes={
 relationships:{name:"Relationships between two variables",ids:["graph","stat"],
  why:["Begin by inspecting genuine paired points, not by assuming a regression.","A distribution view can reveal subgroups or unusual values before fitting."]},
 groups:{name:"Comparing groups",ids:["stat","table"],
  why:["Compare distributions, not just averages.","Show concise, comparable summaries, sample sizes and units."]},
 categorical:{name:"Categorical relationships",ids:["table","stat"],
  why:["Start with a small frequency/proportion table and an explicit denominator.","Use discrete categorical comparisons rather than continuous bars."]},
 variation:{name:"Variation and reliability",ids:["stat","table"],
  why:["See spread, outliers and shape before choosing a summary.","Summarise centre and variability using genuine measurements."]},
 "fitted-models":{name:"Building and testing models",ids:["graph","table"],
  why:["Plot observed values and a justified mathematical function.","Show only essential model parameters and comparisons."]},
 growth:{name:"Growth and decay",ids:["graph","table"],
  why:["Look at changes over equal time intervals before selecting a model.","Summarise selected rates or model parameters clearly."]},
 cycles:{name:"Cycles and periodic behaviour",ids:["graph","stat"],
  why:["Inspect chronological data before assuming a repeating model.","Compare variability or groups when cycles are not clear."]},
 trajectories:{name:"Movement and trajectories",ids:["trace","graph"],
  why:["Extract defensible coordinates from a calibrated photograph.","Plot measured positions or a justified trajectory function."]},
 optimisation:{name:"Optimising a design",ids:["graph","table"],
  why:["Plot a justified function over its feasible domain.","Compare selected candidate values and constraints concisely."]},
 images:{name:"Modelling shapes from images",ids:["trace","graph"],
  why:["Calibrate an image and trace measurements before fitting.","Explore a meaningful curve only after checking scale."]},
 triangulation:{name:"Measurement and triangulation",ids:["trace","graph"],
  why:["A calibrated image can record reliable measured coordinates.","Plot measured results or a model over an appropriate domain."]},
 voronoi:{name:"Locations and Voronoi diagrams",ids:["voronoi","trace"],
  why:["Construct nearest-site regions from projected Cartesian coordinates.","Calibrate sites from a scale map if their coordinates are not yet available."]},
 finance:{name:"Business and financial decisions",ids:["table","graph"],
  why:["Compare rates, scenarios and useful numerical outcomes.","Plot financially meaningful cost/revenue models and domains."]},
 chance:{name:"Probability and simulation",ids:["stat","table"],
  why:["Compare authentic simulated or empirical distributions.","Summarise counts, proportions and relevant outcomes."]},
 proof:{name:"Conjecture, proof and counterexamples",ids:["graph","table"],
  why:["Explore examples visually while remembering that a graph is not proof.","Show a few selected cases, not a long list of substitutions."]},
 iteration:{name:"Iteration and convergence",ids:["graph","table"],
  why:["Plot a function or related sequence behaviour; diagrams alone do not prove convergence.","Show a short series of genuinely calculated iterates and a justified stopping rule."]}
};
const fallback={
 scatter:["graph","stat"],distribution:["stat","table"],diagram:["trace","voronoi"],
 table:["table","stat"],calculation:["table","graph"],theory:["graph","table"],other:["graph","table"],unsure:["graph","stat"]
};
export function representationAdvice(state){
 const route=state.planning?.routeExplorer?.selectedRoute,
  chosen=routes[route],type=state.completion?.fields?.firstType||"unsure";
 const ids=chosen?.ids||fallback[type]||fallback.unsure;
 return {chosen,ids,reason:chosen?"Saved provisional pathway: "+chosen.name:
   type&&type!=="unsure"?"Based on your selected first representation":"Useful starting points",
  why:chosen?.why||["A possible starting tool, not a prescribed technique.","Choose tools only when they help communicate genuine mathematics."]};
}
export function renderRepresentationHub(state,icon,e){
 const advice=representationAdvice(state),suggestions=contextualRepresentationAdvice(state,advice),
  filter=state.ui?.representationFilter||"all",
  first=suggestions.ids.map((id,i)=>({...REPRESENTATION_TOOLS.find(tool=>tool.id===id),reason:suggestions.why[i]}));
 const chosen=new Set(suggestions.ids),all=REPRESENTATION_TOOLS.filter(t=>!chosen.has(t.id));
 const recommended='<div class="representation-feature-grid">'+first.map(t=>
  '<button type="button" class="representation-card representation-card-featured" data-action="'+t.action+'">'+
  '<span class="representation-card-top">'+icon(t.icon)+' <span>Relevant suggestion</span></span>'+
  '<strong>'+e(t.title)+'</strong><small>'+e(t.reason)+'</small>'+
  '<span class="representation-card-cta">Open tool '+icon("arrow-right")+'</span></button>').join("")+'</div>';
 const visible=filter==="all"?all:REPRESENTATION_TOOLS.filter(t=>t.groups.includes(filter)&&!chosen.has(t.id));
 const catalog='<div class="representation-catalog" data-representation-catalog>'+
 (visible.length?visible.map(t=>
  '<button type="button" class="representation-card representation-card-small" data-action="'+t.action+'">'+
  '<span class="representation-card-icon">'+icon(t.icon)+'</span><span class="representation-card-details"><strong>'+
  e(t.title)+'</strong><small>'+e(t.detail)+'</small></span>'+icon("arrow-right")+'</button>').join(""):'<p>No tools in this category yet. Choose another mathematical purpose.</p>')+'</div>';
 return '<section class="representation-hub" data-representation-hub aria-label="Choose a mathematical representation">'+
 '<header class="representation-header"><div><span class="intro-writing-guide-eyebrow">'+icon("layers")+
 ' CHOOSE YOUR MATHEMATICAL REPRESENTATION</span><h2>Which tool helps tell your mathematical story?</h2>'+
 '<p>Start from your investigative aim. A clear, purposeful figure is more valuable than using extra mathematics just to make the IA look complicated.</p></div></header>'+
 '<div class="representation-context"><div><span class="representation-context-kicker">'+icon("route")+' YOUR PATHWAY</span>'+
 '<strong>'+e(advice.reason)+'</strong><p>These recommendations come from your <em>provisional</em> planning choice. They do not identify a pattern in your actual data or require you to use either method.</p></div>'+
 '<span class="representation-context-count">'+suggestions.ids.length+' suggestions</span></div>'+
  renderHubDatasetEvidence(state,advice,icon,e)+
 recommended+
 '<div class="representation-browse-head"><div><h3>Browse the other mathematical tools</h3>'+
 '<p>Nothing is locked. You can always use your own software or select a mathematical calculation that needs no diagram.</p></div></div>'+
 '<div class="representation-filters" role="group" aria-label="Filter tools by mathematical purpose">'+
 REPRESENTATION_FILTERS.map(([value,label])=>
  '<button type="button" class="representation-filter'+(value===filter?" active":"")+
  '" data-action="representation-filter" data-representation-filter="'+value+
  '" aria-pressed="'+(value===filter)+'">'+e(label)+'</button>').join("")+'</div>'+
 catalog+
 '<p class="representation-writing-reminder">'+icon("info")+
 ' <strong>After creating a diagram or table:</strong> introduce it in your IA <em>before</em> showing it. Then interpret it against your aim, prediction (if any), precision and justified next mathematical step. Long raw-data tables belong in working files, not the IA or appendix.</p>'+
 '</section>';
}
/** A larger canvas is activated only in C31 while one tool is open. */
export function representationFocusActive(state){
 return state?.route==="completing"&&state.completion?.current==="C31"&&
  Boolean(state.graphStudio?.open||state.statStudio?.open||state.tableStudio?.open||
   state.imageTracer?.open||state.voronoiStudio?.open);
}
export function renderRepresentationSwitcher(state,icon,e){
 const active=REPRESENTATION_TOOLS.find(t=>[
  ["graph",state.graphStudio?.open],["stat",state.statStudio?.open],
  ["table",state.tableStudio?.open],["trace",state.imageTracer?.open],
  ["voronoi",state.voronoiStudio?.open]
 ].some(([id,open])=>t.id===id&&open));
 const steps=[["create","1 · Create"],["refine","2 · Refine"],["use","3 · Use in IA"]];
 const fromLibrary=state.ui?.resourceCreatorReturnRoute||"";
 const originLabel={
  home:"Back to Home",planning:"Back to Planning",completing:"Back to IA Studio",
  checking:"Back to Checking",path:"Back to My path",report:"Back to my report"
 };
 const backButton=fromLibrary?
  '<button type="button" class="btn btn-quiet btn-sm" data-action="resource-creator-return">'+
   icon("arrow-left")+' '+e(originLabel[fromLibrary]||"Back to my work")+'</button>':
  '<button type="button" class="btn btn-quiet btn-sm" data-action="completion-open" data-node="C30">'+
   icon("arrow-left")+' Back to my IA</button>';

 return '<div class="representation-workspace-header" data-representation-workspace data-representation-switcher>'+
  '<nav class="representation-workspace-bar" aria-label="Mathematical tool navigation">'+
  '<div class="representation-workspace-identity"><span class="representation-workspace-mark">'+
    icon(active?.icon||"layers")+'</span><span><small>IA Studio / Explore &amp; explain</small>'+
    '<strong>'+e(active?.title||"Mathematical workspace")+'</strong></span></div>'+
  '<div class="representation-workspace-actions">'+
   backButton+
   '<button type="button" class="btn btn-secondary btn-sm" data-action="representation-back">'+
    icon("grid-2x2")+' All tools</button></div></nav>'+
  '<nav class="representation-workspace-steps" aria-label="Jump within this generator">'+
   steps.map(([id,label])=>'<button type="button" data-action="representation-jump" data-representation-step="'+id+
    '" aria-label="'+e("Go to "+label.replace(/^[0-9] · /,""))+'">'+e(label)+'</button>').join("")+
  '</nav><p class="representation-workspace-guidance">'+icon("info")+
   ' Explore with genuine or clearly identified hypothetical information. Refine the presentation, then save and use it in your own IA when ready.</p></div>';
}
