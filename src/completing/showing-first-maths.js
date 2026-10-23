/** Showing first mathematics: four honest writing moves, with contextual coaching.
 * Advice is never IA prose, and a planned method is never presented as a result.
 */
import {firstMathsContext} from "./first-maths-bridge.js";
import {writingGuidanceForFirstMaths} from "./first-maths-writing-guidance.js";
import {renderSparkShelf} from "../ui/insight-threads.js";

export const JOURNEY_SHOWING_GUIDANCE = Object.freeze({
 relationships:{
  introduce:"Before the scatter diagram, name the two measured quantities and units and explain that the graph will test whether a relationship is visible. Do not announce a linear association in advance.",
  show:"Show a readable scatter diagram of genuine paired observations, with each axis labelled and scaled. Do not paste the entire two-column dataset or a spreadsheet screenshot.",
  reflect:"Describe the actual shape: approximately straight, curved, clustered, unusual or unclear. Say what this does and does not show about your aim; compare with a predicted direction only if you made that prediction.",
  next:"If the pattern is approximately linear, Pearson's r could quantify linear association; a fitted line needs its own justification. If curved, examine a suitable non-linear model; if unclear, check variability or subgroup structure before computing coefficients."
 },
 groups:{
  introduce:"Introduce the two groups and the quantity being compared; explain why looking at their distributions will answer more than comparing two isolated averages.",
  show:"Choose compact, comparable box plots or other appropriate summary displays with consistent scales and units. Include only a small summary table if the exact values help interpretation.",
  reflect:"Discuss the actual centres, spreads, overlap and unusual values. A difference in sample means is not automatically a population-level difference.",
  next:"If the differences matter to the aim, compare variability or investigate whether assumptions justify a further statistical test. If the distributions tell the story, stop rather than adding calculations."
 },
 categorical:{
  introduce:"State the categories and relevant denominators before showing a two-way frequency table, and explain which proportions might answer the question.",
  show:"Show a concise frequency or proportion table with clear totals and non-overlapping categories. Never display a long list of individual responses.",
  reflect:"Compare actual proportions using the correct denominators; distinguish a difference in the sample from established association in a wider population.",
  next:"If investigating independence, check the actual expected frequencies and whether a chi-squared test is justified and suitable for the course. Revisit sparse categories before testing."
 },
 variation:{
  introduce:"Name the quantity whose consistency matters and explain why an initial distribution or repeated-measurement graph could reveal its reliability.",
  show:"Show a labelled histogram, box plot, dot plot or concise statistics table, using measurement units and appropriate precision rather than pages of raw readings.",
  reflect:"Describe observed spread, skew and unusual values in terms of the reliability question. Distinguish variation in the readings from measurement accuracy or bias.",
  next:"If shape supports it, consider a distribution model; otherwise compare robust spread measures, repeatability or measurement resolution before making a probabilistic claim."
 },
 "fitted-models":{
  introduce:"Identify the input, output and intended domain; say why a genuine plot or simple baseline model provides evidence for choosing a function.",
  show:"Display the data against the model on legible axes, or show the key equation and a concise sample of calculations. Show residuals if they affect the judgement, not a long fitted-value table.",
  reflect:"Explain where the fitted curve agrees or fails, including residual pattern and meaningful restrictions. A strong fit statistic does not prove a cause or justify extrapolation.",
  next:"Compare a simpler or structurally motivated model, inspect residuals or test the fit on a defensible range. Only add parameters when a genuine failure of the baseline warrants them."
 },
 growth:{
  introduce:"Explain why differences or ratios between successive values can test whether the quantity changes additively or proportionally.",
  show:"Present a short table of informative differences/ratios or a time plot with genuine observations and units, rather than every row in the source dataset.",
  reflect:"State whether differences or ratios actually look stable, over which interval, and whether this supports the growth assumption behind the aim.",
  next:"If differences are stable, examine a linear model; if ratios are stable, consider exponential growth/decay. If neither, explore a restricted range or a different model."
 },
 cycles:{
  introduce:"Explain that a time plot is needed to see whether a genuine repeating pattern exists before proposing a trigonometric model.",
  show:"Show enough of the time series to assess repetition, with readable time units, axes and a clear origin. Avoid a long table of every timestamp.",
  reflect:"Point out whether periods, midline and amplitude seem consistent or whether the actual record shows a trend or irregular cycles.",
  next:"If repeated cycles are supported, estimate a plausible period and test a sinusoidal model. If not, collect/verify another cycle or compare a simple trend instead."
 },
 trajectories:{
  introduce:"Define coordinates, scale and what the path represents. Tell the reader which feature of the plotted path is relevant to the prediction or aim.",
  show:"Present a calibrated plot or diagram with key observed positions and units, and only necessary calculations. Do not present a hypothetical perfect parabola as measured data.",
  reflect:"Describe the actual curvature or geometry and whether perspective, scaling or missing time information limits what can be inferred.",
  next:"Test a justified curve or calculate a meaningful trajectory feature; if calibration is uncertain, check scaling or collect reliable time/position information first."
 },
 optimisation:{
  introduce:"Identify what is being maximised or minimised, the feasible constraints and why the objective function or diagram belongs here.",
  show:"Write a clear objective function, feasible domain and a compact diagram or graph if useful. Show purposeful algebra, not a huge trial-and-error table.",
  reflect:"Interpret the actual candidate optimum in the context of the constraints. A stationary point alone is not proof of a feasible global optimum.",
  next:"Check endpoints and other candidates, justify maximum/minimum classification or test sensitivity to an important assumption before recommending a decision."
 },
 images:{
  introduce:"Introduce the image calibration, chosen origin and coordinate scale before displaying traced points or a curve.",
  show:"Show one clear, labelled calibrated image or coordinate diagram with selected informative points. Avoid a large table of all pixel coordinates, even in an appendix.",
  reflect:"Explain what the fitted boundary or area estimate means, including distortion, limited resolution and the consequences of hand-selected points.",
  next:"Compare a geometric estimate or alternative fit, or quantify how a different calibration changes the result if this affects the aim."
 },
 triangulation:{
  introduce:"Explain what unknown length or height the geometry will determine and identify which actual angles and distances appear in the labelled diagram.",
  show:"Draw a clear, scaled-where-possible diagram with labelled measurements, then show the short essential trigonometric working and units.",
  reflect:"Interpret the calculated quantity and its plausible precision. State if uncertain angles, assumed level ground or sight lines affect the answer.",
  next:"Check sensitivity to the measured angles or compare an independent triangle/position, but only when that check could change the conclusion."
 },
 voronoi:{
  introduce:"Define the sites and the meaning of distance, then explain why a Voronoi diagram helps answer a nearest-location question.",
  show:"Show a clear, scaled map with labelled sites and boundaries, not pages of coordinate calculations or raw location records.",
  reflect:"Interpret the actual nearest-site regions against the aim while distinguishing Euclidean closeness from road access, demand or capacity.",
  next:"Test a relevant boundary or compare straight-line distances with real travel measurements if the practical aim requires it."
 },
 finance:{
  introduce:"Explain which real decision is tested by the first cost, revenue or accumulation expression, and define rates and time units.",
  show:"Use a concise comparison table, graph or representative calculation with consistent currency, time basis and sensible rounding. Omit long repayment schedules, including in appendices.",
  reflect:"Interpret the actual difference or break-even value for the decision, and note how assumed rates, costs or time limits affect its meaning.",
  next:"Test a realistic alternative rate, fee or time horizon, or investigate break-even sensitivity only if it could reverse the decision."
 },
 chance:{
  introduce:"Define events, trial rules and the probability or expected quantity to be investigated before presenting a calculation or simulation.",
  show:"Show the essential exact work or a compact simulation summary with trial count and clearly defined outcomes. Do not paste every simulated trial.",
  reflect:"Interpret the probability or expected value against the aim; distinguish simulated frequencies from exact probabilities and describe meaningful variability.",
  next:"Check independence or equiprobability assumptions, compare simulation with an exact model, or vary parameters if the observed result raises a real uncertainty."
 },
 proof:{
  introduce:"State the precise conjecture, domain and relevant definitions before introducing your first example, diagram or algebraic argument.",
  show:"Display a few illuminating cases or one clear logical argument. Never replace a general proof with a long numerical table of confirming examples.",
  reflect:"Explain what the example actually establishes: supporting cases suggest a pattern; a valid counterexample disproves a universal claim; a proof establishes it.",
  next:"Look for a counterexample or a general algebraic/inductive argument as appropriate. If the proof is already complete, explain its consequence instead of manufacturing a second technique."
 },
 iteration:{
  introduce:"Define the recurrence or iteration rule, initial value and permitted parameters, and explain what behaviour the first iterations could reveal.",
  show:"Show a short, carefully rounded selection of iterates, a graph or the defining rule, not a spreadsheet dump of hundreds of terms.",
  reflect:"Describe the actual numerical pattern without claiming finite convergence proves a limit. Consider rounding, oscillation or starting-value dependence.",
  next:"Investigate a fixed-point equation or try distinct initial conditions if justified; use an analytical argument before asserting convergence or stability."
 }
});

const SOURCE_REMINDERS={
 primary:"If values came from your own measurements, retain original units and instrument resolution. Introduce the measurement context briefly; avoid a collection diary.",
 secondary:"Credit the original published data, check stated units and original rounding, and avoid presenting copied rows as your own measurements.",
 both:"Distinguish original measurements from published figures and verify compatible units and definitions before combining them.",
 theoretical:"Use definitions, diagrams, meaningful examples or proofs. Sampling and a raw-data table are not required.",
 undecided:"Only show genuine mathematical work. A planned graph, dataset or prediction is not an observed finding."
};

export function showingMathsGuidance(state){
 const ctx=firstMathsContext(state),found=ctx.activeRoute&&JOURNEY_SHOWING_GUIDANCE[ctx.activeRoute.id];
 if(found)return {origin:"journey",id:ctx.activeRoute.id,title:ctx.activeRoute.title,source:SOURCE_REMINDERS[ctx.sourceKey],...found};
 const writing=writingGuidanceForFirstMaths(state);
 return {origin:writing.origin,id:writing.id,title:writing.title,source:SOURCE_REMINDERS[ctx.sourceKey],
  introduce:writing.method.introduce+" Before the output, name the question that makes this particular figure or calculation worth seeing.",
  show:"Present a compact, legible representation or genuinely worked example. Label quantities, units, symbols, source and precision when relevant; do not present a long raw-data table, even in an appendix.",
  reflect:"Describe what your actual result reveals and what it cannot establish. Connect the finding back to the aim and compare it with a tentative prediction only if one exists.",
  next:writing.evaluation.alternative+" Base the decision on your actual result, not a technique selected in Planning."
 };
}
const icons={introduce:"pencil",show:"chart",reflect:"target",next:"route"};
export function renderShowingMathsContext(state,phase,icon,e,{reduced=false}={}){
 const g=showingMathsGuidance(state),tip=g[phase];
 const heading=({introduce:"Words before the mathematics",show:"Show it clearly and selectively",reflect:"Read the actual mathematics",next:"Let the result choose the direction"})[phase];
 return '<aside class="show-first-context" data-show-first-context="'+e(phase)+'" data-show-first-origin="'+e(g.origin)+'" data-show-first-route="'+e(g.id)+'">'+
  '<div class="show-first-context-head">'+icon(icons[phase])+' <div><span class="intro-writing-guide-eyebrow">'+e(g.origin==="journey"?"YOUR INVESTIGATIVE JOURNEY":g.origin==="technique"?"YOUR SELECTED MATHEMATICS":"STARTING ADVICE")+'</span>'+
  '<strong>'+e(g.title)+' · '+e(heading)+'</strong></div></div>'+
  '<p>'+e(tip)+'</p>'+
  (!reduced&&phase==="show"?'<p class="show-first-context-source">'+icon("book")+' '+e(g.source)+'</p>':"")+
  (g.origin==="journey"&&!reduced?'<small>Use this only if it still fits your actual investigation. Your planned journey may change.</small>':"")+
  '</aside>';
}
const ADVICE=[
 ["Write before you show","Every diagram, table and calculation needs a sentence BEFORE it.","Explain what the reader is about to see, why it helps the aim and any essential symbols or units. A caption alone does not introduce the mathematics.","Figure 1: A scatter graph.","To investigate whether the quantities appear related, Figure 1 plots ... against ... using the observed values."],
 ["Keep mathematics selective","A useful display is better than a data dump.","Long raw-data tables belong neither in the main IA nor in the appendix. Use a concise summary table or graph, cite the original source and show only the calculations needed to make your reasoning clear.","Appendix A contains all 250 measurements.","Figure 1 shows the overall pattern; Table 1 summarises the values relevant to the comparison."],
 ["Reflect where the result appears","Tell the reader what genuine results mean for the aim.","Interpret the shape, numerical answer, approximation or proof immediately after presenting it. Compare with your prediction when relevant, and explain any restriction that materially affects the claim.","The answer is 0.83, so the hypothesis is proved.","The observed value suggests ... for these data, but it cannot establish ..."],
 ["Make the next step earn its place","Use the result to justify what follows, then join the notes into one argument.","Identify the precise question your result leaves open and why the proposed mathematics could answer it. When drafting, combine your interpretation, unanswered question and reason for the next step into a connected passage. Give the shared reason once, rather than repeating it at the end of one section and the start of the next. If the aim is answered, explain why you can stop.","Next I will use a quadratic because it is harder.","My line underestimates at both ends and overestimates in the middle. That curved error pattern makes a quadratic worth testing, so I will compare its errors with the line’s on the same cases."]
];
/** Four canonical source-writing lessons, also surfaced by the Field Guide. */
export const SHOWING_MATHS_TIPS=Object.freeze(ADVICE.map(row=>Object.freeze([...row])));
export function renderShowingMathsAdvice(state,icon,e,{reduced=false}={}){
 // Purpose, evidence and interpretation prompts remain inside the task itself.
 if(reduced)return "";
 return '<section class="studio-stage-advice show-first-advice" data-stage-advice="maths" data-advice-moved-to-guide="showing-mathematics" aria-label="Writing advice for showing the first mathematics">'+
  '<div class="studio-stage-advice-head"><span class="studio-stage-icon">'+icon("chart")+'</span><div>'+
  '<span class="intro-writing-guide-eyebrow">BEFORE YOU WRITE · SHOWING FIRST MATHEMATICS</span>'+
  '<h2>Introduce it. Show it. Interpret it. Follow it.</h2>'+
  '<p>Your reader should always know why a figure or calculation is appearing before they see it, and what it means immediately afterwards.</p></div></div>'+
  '<p class="show-first-no-tables">'+icon("info")+' <strong>Long tables are not IA content — not even in the appendix.</strong> Keep raw datasets in your working files and present only concise, useful summaries or graphs.</p>'+
  '<button type="button" class="writer-guide-inline-more" data-action="writer-guide-open" data-guide-tip="purpose" data-guide-spot="completing:C30:introduceA">'+icon("book")+' Four tips for showing mathematics clearly '+icon("arrow-right")+'</button>'+
  '</section>';
}

export function renderShowingMathsSparks(state,icon,e){
 const ctx=firstMathsContext(state),p=state?.planning?.fields||{},f=state?.completion?.fields||{};
 const source=SOURCE_REMINDERS[ctx.sourceKey];
 const pred=p.prediction||state?.project?.prediction||"No earlier prediction recorded — you do not need to invent one.";
 const accuracy=p.firstAccuracy||state?.completion?.accuracyDecisions?.map(x=>[x.quantity,x.resolution,x.policy].filter(Boolean).join(": ")).filter(Boolean).join("; ")||"Check original measurement/source precision when it affects this result.";
 const mini=(name,value)=>'<div class="show-first-spark"><strong>'+e(name)+'</strong><p>'+e(value)+'</p></div>';
 return '<section class="studio-stage-sparks show-first-sparks" aria-label="Relevant saved sparks">'+
  '<div class="studio-stage-sparks-head">'+icon("sparkles")+' <div><span class="intro-writing-guide-eyebrow">FROM YOUR INVESTIGATION</span><h2>Use your relevant sparks</h2><p>These saved choices guide the writing; check them against the work you actually carried out.</p></div></div>'+
  '<div class="show-first-spark-grid">'+mini("Your aim",ctx.aim||"Return to Planning to define your aim.")+
  mini("Original prediction (if any)",pred)+mini("Relevant accuracy",accuracy)+
  (f.firstPurpose?mini("First mathematical question",f.firstPurpose):"")+'</div>'+
  '<p class="show-first-source-reminder">'+icon("book")+' '+e(source)+'</p>'+
  (renderSparkShelf(state,"C30",{surface:"studio",hideHeading:true})||"")+
  '</section>';
}
