/**
 * One coherent representation chooser instead of a growing stack of launch
 * boxes. Current-stage mathematics takes precedence over provisional planning;
 * neither the plan nor a suggested generator establishes an actual result.
 */
import {contextualRepresentationAdvice} from "./presentation-coach-core.js";
import {renderHubDatasetEvidence} from "./presentation-coach-view.js";
import {methodFamilies} from "../completing/method-identity.js";
import {REPRESENTATION_TOOLS,activeRepresentationTool,representationReturnNode} from "./representation-registry.js";
import {representationWorkflowState,renderRepresentationWorkflow} from "./representation-workflow.js";
export {REPRESENTATION_TOOLS} from "./representation-registry.js";
export const REPRESENTATION_FILTERS=Object.freeze([
 ["all","All tools"],["data","Explore data"],["geometry","Explore geometry"],
 ["models","Build a model"],["decisions","Make decisions"]
]);
// Each pair is editorially grounded in the saved route's actual first maths.
export const REPRESENTATION_ROUTE_GUIDANCE=Object.freeze({
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
 chance:{name:"Probability and simulation",ids:["probability","distribution","stat"],
  why:["Use a tree for genuinely successive or conditional outcomes; justify every branch probability.","Use statistical diagrams for empirical or simulated distributions, not invented observations."]},
 proof:{name:"Conjecture, proof and counterexamples",ids:["graph","table"],
  why:["Explore examples visually while remembering that a graph is not proof.","Show a few selected cases, not a long list of substitutions."]},
 iteration:{name:"Iteration and convergence",ids:["graph","table"],
  why:["Plot a function or related sequence behaviour; diagrams alone do not prove convergence.","Show a short series of genuinely calculated iterates and a justified stopping rule."]}
});
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
 {keys:["probability"],name:"Successive or conditional probability",ids:["probability","table"],
  why:["Model successive outcomes explicitly, checking the conditional probabilities at each split.","Show outcome tables or expected-value working when the calculation needs them."]},
 {keys:["expected-value"],name:"Expected value or risk comparison",ids:["table","probability"],
  why:["Record every mutually exclusive outcome, its probability and its payoff or value in a compact table.","Use a tree only when the risk question genuinely has successive conditional events."]},
 {keys:["binomial"],name:"Binomial probability",ids:["distribution","probability"],
  why:["Show the theoretical mass function, event probability and labelled counts.","For successive conditional events, a tree may be more suitable."]},
 {keys:["pmcc","spearman","linear-regression","quadratic-fit","fitted-model","exponential","sinusoidal","power"],name:"Relationship or fitted model",ids:["graph","table"],
  why:["Plot real observations or a derived model, with its justified domain.","Summarise relevant fitted parameters or comparisons."]},
 {keys:["normal"],name:"Normal probability model",ids:["distribution","stat"],
   why:["Illustrate theoretical areas under a justified normal model.","Inspect actual data separately before claiming normality."]},
  {keys:["two-sample-t","chi-independence","chi-fit"],name:"Statistical comparison",ids:["stat","table"],
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
 const route=state?.planning?.routeExplorer?.selectedRoute,chosen=REPRESENTATION_ROUTE_GUIDANCE[route],
  type=state?.completion?.fields?.firstType||"unsure";
 const ids=chosen?.ids||fallback[type]||fallback.unsure;
 return {chosen,ids,source:chosen?"route":type!=="unsure"?"first":"fallback",
  reason:chosen?"Saved provisional pathway: "+chosen.name:
   type!=="unsure"?"Based on your selected first representation":"Useful starting points",
  why:chosen?.why||["A possible starting tool, not a prescribed technique.","Choose tools only when they help communicate genuine mathematics."]};
}
export function representationVisibleTools(state){
 const advice=representationAdvice(state);
 const suggestions=contextualRepresentationAdvice(state,advice);
 const filter=state.ui?.representationFilter||"all";
 const eligible=t=>filter==="all"||t.groups.includes(filter);
 const recommended=[];
 const seen=new Set();
 for(let i=0;i<suggestions.ids.length;i++){
  const tool=REPRESENTATION_TOOLS.find(t=>t.id===suggestions.ids[i]);
  if(!tool||!eligible(tool)||seen.has(tool.id))continue;
  seen.add(tool.id);
  recommended.push({...tool,reason:suggestions.why[i]||tool.detail});
 }
 const remaining=REPRESENTATION_TOOLS.filter(t=>eligible(t)&&!seen.has(t.id));
 return {advice,suggestions,filter,recommended,remaining,total:recommended.length+remaining.length};
}
export function renderRepresentationHub(state,icon,e){
 const {advice,suggestions,filter,recommended,remaining,total}=representationVisibleTools(state),
  reduced=state.ui?.adviceMode==="reduced";
 const featured='<div class="representation-feature-grid">'+recommended.map(t=>
  '<button type="button" class="representation-card representation-card-featured" data-action="'+t.action+'">'+
  '<span class="representation-card-top">'+icon(t.icon)+' <span>Relevant suggestion</span></span>'+
  '<strong>'+e(t.title)+'</strong><small>'+e(t.reason)+'</small>'+
  '<span class="representation-card-cta">Open tool '+icon("arrow-right")+'</span></button>').join("")+'</div>';
 const catalog='<div class="representation-catalog" data-representation-catalog>'+
  remaining.map(t=>'<button type="button" class="representation-card representation-card-small" data-action="'+t.action+'">'+
  '<span class="representation-card-icon">'+icon(t.icon)+'</span><span class="representation-card-details"><strong>'+
  e(t.title)+'</strong><small>'+e(t.detail)+'</small></span>'+icon("arrow-right")+'</button>').join("")+'</div>';
 return '<section class="representation-hub" data-representation-hub data-representation-advice-mode="'+(reduced?"reduced":"guided")+'" aria-label="Choose a mathematical representation">'+
 (state.ui?.resourceCreatorReturnRoute?
  '<button type="button" class="btn btn-quiet btn-sm resource-creator-hub-back" data-action="resource-creator-return">'+
   icon("arrow-left")+' Back to my previous page</button>':'')+
 '<header class="representation-header"><div><span class="intro-writing-guide-eyebrow">'+icon("layers")+
 ' CHOOSE YOUR MATHEMATICAL REPRESENTATION</span><h2>Which tool helps tell your mathematical story?</h2>'+
 (reduced?"":'<p>Start from your investigative aim. A purposeful figure is more valuable than extra mathematics just to make the IA look complicated.</p>')+'</div></header>'+
 '<div class="representation-context"><div><span class="representation-context-kicker">'+icon("route")+' RECOMMENDATION CONTEXT</span>'+
 '<strong>'+e(advice.reason)+'</strong>'+
 (reduced?"":'<p>Suggestions reflect your current method, a confirmed next question or a provisional plan. They do not identify a pattern in your data or require a particular generator.</p>')+'</div>'+
 '<span class="representation-context-count">'+total+' matching tool'+(total===1?"":"s")+'</span></div>'+
 (reduced?'<details class="representation-optional-context"><summary>'+icon("info")+
  ' Why these tools? (optional)</summary><p>'+e(suggestions.note)+'</p>'+
   renderHubDatasetEvidence(state,advice,icon,e)+'</details>':
  renderHubDatasetEvidence(state,advice,icon,e))+
 '<div data-representation-recommended>'+(recommended.length?featured:
  '<p class="representation-filter-note">No featured suggestion matches this category. Browse the available tools below or select All tools.</p>')+'</div>'+
 '<div class="representation-browse-head"><div><h3>Browse '+(filter==="all"?"other tools":"this category")+'</h3>'+
 (reduced?"":'<p>Nothing is locked. You can use your own software or select a calculation that needs no diagram.</p>')+'</div></div>'+
 '<div class="representation-filters" role="group" aria-label="Filter tools by mathematical purpose">'+
 REPRESENTATION_FILTERS.map(([value,label])=>
  '<button type="button" class="representation-filter'+(value===filter?" active":"")+
  '" data-action="representation-filter" data-representation-filter="'+value+
  '" aria-pressed="'+(value===filter)+'">'+e(label)+'</button>').join("")+'</div>'+
 (remaining.length?catalog:'<p class="representation-filter-note">'+
  (total?"All matching tools are already featured above.":"No tools match this category.")+'</p>')+
 '<p class="representation-writing-reminder">'+icon("info")+
 '<span class="inline-notice-copy"><strong>Use in your IA:</strong> introduce each relevant figure before showing it, and interpret the actual mathematics afterwards. Saving a figure does not automatically establish a result.</span></p>'+
 '</section>';
}
/** A larger canvas is activated only in C31 while one tool is open. */
export function representationFocusActive(state){
 return state?.route==="completing"&&state.completion?.current==="C31"&&
  Boolean(activeRepresentationTool(state));
}
export function renderRepresentationSwitcher(state,icon,e){
 const active=activeRepresentationTool(state);
 const fromLibrary=state.ui?.resourceCreatorReturnRoute||"";
 const originLabel={
  home:"Back to Home",planning:"Back to Planning",completing:"Back to IA Studio",
  checking:"Back to Checking",path:"Back to My path",report:"Back to my report"
 };
 const backLabel=fromLibrary?originLabel[fromLibrary]||"Back to my work":
  representationReturnNode(state)==="C30"?"Back to first mathematics":"Back to later mathematics";
 const backAction=fromLibrary?"resource-creator-return":"representation-return";
 const backTarget=fromLibrary?"":' data-node="'+representationReturnNode(state)+'"';
 const back='<button type="button" class="representation-workspace-tool representation-workspace-tool-back"'+
  ' data-action="'+backAction+'"'+backTarget+' aria-label="'+e(backLabel)+'" title="'+e(backLabel)+'">'+
  '<span class="representation-workspace-tool-icon" aria-hidden="true">'+icon("arrow-left")+'</span>'+
  '<span class="representation-workspace-tool-label">'+e(backLabel)+'</span></button>';
 const tools=REPRESENTATION_TOOLS.map(tool=>{
  const selected=active?.id===tool.id;
  return '<button type="button" class="representation-workspace-tool'+(selected?' is-active':'')+'"'+
   ' data-action="representation-switch" data-representation-tool="'+e(tool.id)+'"'+
   (selected?' aria-current="page"':'')+
   ' aria-label="'+e(selected?"Current tool: "+tool.title:"Open "+tool.title)+'" title="'+e(tool.title)+'">'+
   '<span class="representation-workspace-tool-icon" aria-hidden="true">'+icon(tool.icon)+'</span>'+
   '<span class="representation-workspace-tool-label">'+e(tool.navLabel||tool.title)+'</span></button>';
 }).join("");
 return '<div class="representation-workspace-header" data-representation-workspace data-representation-switcher>'+
  '<div class="representation-workspace-bar">'+
  '<div class="representation-workspace-identity"><span class="representation-workspace-mark">'+
    icon(active?.icon||"layers")+'</span><span><small>'+(fromLibrary?e("Tools & tutorials · Figure creator"):e("IA Studio · Explore & explain"))+'</small>'+
    '<strong>'+e(active?.title||"Mathematical workspace")+'</strong></span></div>'+
  '<div class="representation-workspace-actions">'+
   '<button type="button" class="btn btn-secondary btn-sm" data-action="representation-back">'+
    icon("grid-2x2")+' All tools</button></div></div>'+
  '<nav class="representation-workspace-tools" aria-label="Diagram creators and return navigation">'+
   back+tools+'</nav>'+
  renderRepresentationWorkflow(representationWorkflowState(state),icon,e)+
  '<p class="representation-workspace-guidance">'+icon("info")+'<span class="inline-notice-copy">'+
   ' Save an editable draft to keep a figure for later; Save &amp; link associates it with this mathematical stage. Downloads are separate files and do not write your IA.</span></p></div>';
}
