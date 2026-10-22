/**
 * One coherent representation chooser instead of a growing stack of launch
 * boxes. Current-stage mathematics takes precedence over provisional planning;
 * neither the plan nor a suggested generator establishes an actual result.
 */
import {contextualRepresentationAdvice} from "./presentation-coach-core.js";
import {renderHubDatasetEvidence} from "./presentation-coach-view.js";
import {methodFamilies} from "../completing/method-identity.js";
import {REPRESENTATION_TOOLS,activeRepresentationTool,representationReturnNode} from "./representation-registry.js";
export {REPRESENTATION_TOOLS} from "./representation-registry.js";
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
 images:{name:"Modelling shapes from images",ids:["trace","geometry"],
  why:["Calibrate a picture before using traced measurements.","Construct and annotate relevant geometric shapes."]},
 triangulation:{name:"Measurement and triangulation",ids:["geometry","trace"],
  why:["Draw labelled triangles, measurement baselines and angles.","Calibrate positions from a photograph when necessary."]},
 voronoi:{name:"Locations and Voronoi diagrams",ids:["voronoi","trace"],
  why:["Construct nearest-site regions from projected Cartesian coordinates.","Calibrate sites from a scale map if their coordinates are not yet available."]},
 finance:{name:"Business and financial decisions",ids:["table","graph"],
  why:["Compare rates, scenarios and useful numerical outcomes.","Plot financially meaningful cost/revenue models and domains."]},
 chance:{name:"Probability and simulation",ids:["probability","stat"],
  why:["Use a tree for genuinely successive or conditional outcomes; justify every branch probability.","Use statistical diagrams for empirical or simulated distributions, not invented observations."]},
 proof:{name:"Conjecture, proof and counterexamples",ids:["graph","table"],
  why:["Explore examples visually while remembering that a graph is not proof.","Show a few selected cases, not a long list of substitutions."]},
 iteration:{name:"Iteration and convergence",ids:["graph","table"],
  why:["Plot a function or related sequence behaviour; diagrams alone do not prove convergence.","Show a short series of genuinely calculated iterates and a justified stopping rule."]}
};
const fallback={
 scatter:["graph","stat"],distribution:["stat","table"],diagram:["geometry","trace"],
 table:["table","stat"],calculation:["table","graph"],theory:["graph","table"],other:["graph","table"],unsure:["graph","stat"]
};
/**
 * Students choose a method for the present mathematical stage. Rules are
 * matched to its explicit method identity (or an unambiguous saved technique),
 * never inferred from aim text or hypothetical results. New creators can join
 * these lists in later passes once fully functional.
 */
const methods=[
 {keys:["voronoi"],name:"Voronoi construction",ids:["voronoi","trace"],
  why:["Use genuine site coordinates and a justified distance metric.","Calibrate measured sites from a suitable map if needed."]},
 {keys:["triangulation"],name:"Triangulation and surveying",ids:["geometry","trace"],
  why:["Construct a labelled measurement triangle and clarify assumptions.","Use photo calibration if the positions came from an image."]},
 {keys:["geometric-model"],name:"Geometric modelling",ids:["geometry","trace"],
  why:["Construct dimensioned geometry to explain the mathematical model.","Extract points from a calibrated photograph if needed."]},
 {keys:["optimisation"],name:"Optimisation",ids:["graph","table"],
  why:["Inspect the objective over its feasible domain.","Compare constraints, endpoints and candidate optima."]},
 {keys:["probability","expected-value"],name:"Conditional probability or expected value",ids:["probability","table"],
  why:["Model successive outcomes explicitly, checking the conditional probabilities at each split.","Show outcomes or expected-value working in a concise table when appropriate."]},
 {keys:["binomial"],name:"Binomial probability",ids:["probability","stat"],
  why:["For two or three trials, a tree can illustrate sequences; justify any independence assumption.","Use distribution diagrams only for observed or simulated results."]},
 {keys:["pmcc","spearman","linear-regression","quadratic-fit","fitted-model","exponential","sinusoidal","power"],name:"Relationship or fitted model",ids:["graph","table"],
  why:["Plot real observations or a derived model, with its justified domain.","Summarise relevant fitted parameters or comparisons."]},
 {keys:["normal","two-sample-t","chi-independence","chi-fit"],name:"Statistical comparison",ids:["stat","table"],
  why:["Inspect the observed distribution or groups before interpreting a test.","State the relevant assumptions and sample summaries."]},
 {keys:["finance-break-even","finance-compound","finance-loan","finance-cashflow"],name:"Financial modelling",ids:["table","graph"],
  why:["Compare scenarios, costs and assumptions transparently.","Graph derived cost or revenue functions over a meaningful domain."]},
 {keys:["numerical-integration","rates-from-data"],name:"Numerical approximation",ids:["graph","table"],
  why:["Graph the function or measurements when it clarifies the calculation.","Present only the numerical steps essential to the reasoning."]},
 {keys:["proof","algebra"],name:"Mathematical reasoning",ids:["graph","table"],
  why:["A diagram can suggest cases, but it cannot prove a general claim.","A few selected calculations may clarify the argument."]}
];
const laterKindFallback={scatter:["graph","stat"],model:["graph","table"],
 theory:["graph","table"],other:["table","graph"]};
function activeMathsEntry(state){
 if(state?.route!=="completing"||!["C30","C31","C40","C50"].includes(state?.completion?.current))return null;
 const entry=state.entries?.[state.completion.activeEntryIndex];
 return entry&&["first","substantial"].includes(entry.phase)?entry:null;
}
export function representationAdvice(state){
 const entry=activeMathsEntry(state);
 if(entry){
  const families=methodFamilies(entry,{allowPlanned:true});
  const match=methods.find(rule=>rule.keys.some(id=>families.has(id)));
  if(match)return {chosen:null,ids:match.ids,why:match.why,source:"method",
   reason:"Current mathematical method: "+match.name};
  if(entry.phase==="substantial"){
   const parent=state.entries?.find(item=>item?.id===entry.fromEntryId);
   const genuine=parent?.status==="completed"&&!!parent?.result?.trim();
   const followsResult=genuine&&!!parent?.journeyOutcome&&entry.journeySourceOutcome===parent.journeyOutcome;
   // A confirmed result justifies the next question, not a guessed next
   // method. Do not silently repeat the method of an earlier stage.
   return {chosen:null,ids:laterKindFallback[entry.kind]||["graph","table"],
    source:followsResult?"next":"stage",
    reason:followsResult?"This stage follows a confirmed mathematical result":"Current stage: choose a useful representation",
    why:["Choose a representation for the current question, not just the planning pathway.",
     "No generator is required when a concise calculation or proof is more appropriate."]};
  }
 }
 const route=state?.planning?.routeExplorer?.selectedRoute,chosen=routes[route],
  type=state?.completion?.fields?.firstType||"unsure";
 const ids=chosen?.ids||fallback[type]||fallback.unsure;
 return {chosen,ids,source:chosen?"route":type!=="unsure"?"first":"fallback",
  reason:chosen?"Saved provisional pathway: "+chosen.name:
   type!=="unsure"?"Based on your selected first representation":"Useful starting points",
  why:chosen?.why||["A possible starting tool, not a prescribed technique.","Choose tools only when they help communicate genuine mathematics."]};
}
export function renderRepresentationHub(state,icon,e){
 const advice=representationAdvice(state),suggestions=contextualRepresentationAdvice(state,advice),
  filter=state.ui?.representationFilter||"all",
  first=suggestions.ids.map((id,i)=>{const tool=REPRESENTATION_TOOLS.find(t=>t.id===id);return tool?{...tool,reason:suggestions.why[i]}:null;}).filter(Boolean);
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
 (state.ui?.resourceCreatorReturnRoute?
  '<button type="button" class="btn btn-quiet btn-sm resource-creator-hub-back" data-action="resource-creator-return">'+
   icon("arrow-left")+' Back to my previous page</button>':'')+
 '<header class="representation-header"><div><span class="intro-writing-guide-eyebrow">'+icon("layers")+
 ' CHOOSE YOUR MATHEMATICAL REPRESENTATION</span><h2>Which tool helps tell your mathematical story?</h2>'+
 '<p>Start from your investigative aim. A clear, purposeful figure is more valuable than using extra mathematics just to make the IA look complicated.</p></div></header>'+
 '<div class="representation-context"><div><span class="representation-context-kicker">'+icon("route")+' RECOMMENDATION CONTEXT</span>'+
 '<strong>'+e(advice.reason)+'</strong><p>Suggestions reflect your current method, a confirmed next question or a provisional plan. They do not identify a pattern in your data or require a particular generator.</p></div>'+
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
  Boolean(activeRepresentationTool(state));
}
export function renderRepresentationSwitcher(state,icon,e){
 const active=activeRepresentationTool(state);
 const steps=[["create","1 · Create"],["refine","2 · Refine"],["use","3 · Use in IA"]];
 const fromLibrary=state.ui?.resourceCreatorReturnRoute||"";
 const originLabel={
  home:"Back to Home",planning:"Back to Planning",completing:"Back to IA Studio",
  checking:"Back to Checking",path:"Back to My path",report:"Back to my report"
 };
 const backButton=fromLibrary?
  '<button type="button" class="btn btn-quiet btn-sm" data-action="resource-creator-return">'+
   icon("arrow-left")+' '+e(originLabel[fromLibrary]||"Back to my work")+'</button>':
  '<button type="button" class="btn btn-quiet btn-sm" data-action="representation-return" data-node="'+
   representationReturnNode(state)+'">'+icon("arrow-left")+' Back to my mathematical stage</button>';

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
