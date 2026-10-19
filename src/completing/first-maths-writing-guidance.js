/** Writing-specific guidance for the first actual mathematical section.
 * Every selected INVESTIGATIVE_ROUTE has bespoke support for BOTH
 * 2a method introduction and 2b mathematical limitations/alternatives.
 * This is guidance, not prose generated for the student's IA.
 */
import {firstMathsContext} from "./first-maths-bridge.js";
import {orderSelectedTechniqueGuides,techniqueStartingGuide} from "./technique-start-advice.js";

export const JOURNEY_WRITING_GUIDANCE=Object.freeze({
 "relationships":Object.freeze({
  method:Object.freeze({introduce:"Introduce a scatter diagram of genuine paired numerical observations, naming the variables and units. Do not open with Pearson’s r or regression before seeing the points.",reason:"The first question is whether the data support a describable relationship—and, crucially, whether a straight line is even plausible.",avoid:"Avoid a tutorial on drawing scatter diagrams or predicting that the association will be linear."}),
  evaluation:Object.freeze({limitation:"Pearson’s r measures linear association; a curved pattern, distinct groups, influential points or a restricted domain could make it misleading.",alternative:"If the pattern is curved, explore an appropriate nonlinear model; if consistently monotonic but not linear, consider a rank method where suitable. Investigate justified unusual values before removing them.",suitability:"A scatter diagram is a sensible first test precisely because it lets the mathematical shape determine whether any subsequent coefficient or model is appropriate."})
 }),
 "groups":Object.freeze({
  method:Object.freeze({introduce:"Introduce comparable displays for the two groups, identifying what each observation measures and whether samples are paired or independent.",reason:"Comparing distributions shows typical outcomes and variation, not just two isolated averages.",avoid:"Do not explain how to calculate a mean or box plot if these are already familiar course techniques."}),
  evaluation:Object.freeze({limitation:"Unequal spreads, skew, sample sizes and non-comparable measurement conditions can weaken an inference from an average difference.",alternative:"Compare medians and interquartile ranges as well as means, or consider a formal test only if its mathematical assumptions and course suitability are met.",suitability:"Begin with distribution comparisons because they reveal whether a single mean difference captures the important features."})
 }),
 "categorical":Object.freeze({
  method:Object.freeze({introduce:"Introduce a two-way frequency table of genuine categorical observations, defining each category and the meaning of row or column totals.",reason:"Relevant conditional or row percentages help reveal whether the proportions vary across groups.",avoid:"Do not treat category labels as numerical measurements or begin with a chi-squared calculation."}),
  evaluation:Object.freeze({limitation:"Sparse or overlapping categories, poor denominators, non-independent observations or small expected counts can invalidate an interpretation or independence test.",alternative:"Compare well-defined proportions first; where appropriate in AI SL, check expected counts before considering a chi-squared test.",suitability:"A frequency table is justified first because the categories and denominators must be clear before testing association."})
 }),
 "variation":Object.freeze({
  method:Object.freeze({introduce:"Introduce a distribution or repeated-measurement display for the quantity whose consistency matters. Identify units and measurement precision.",reason:"The mathematical question is how spread and unusual readings affect reliability, beyond the average.",avoid:"Avoid a long account of every measurement action unless it changes the mathematical interpretation."}),
  evaluation:Object.freeze({limitation:"A small observed spread does not establish unbiased or precise measurement; skew, outliers and device resolution can also affect a summary.",alternative:"Compare median and quartiles with mean and standard deviation, or consider a normal model only if the actual shape warrants it.",suitability:"Descriptive displays are suitable first because they reveal the shape and variation that determine whether a later probability model is sensible."})
 }),
 "fitted-models":Object.freeze({
  method:Object.freeze({introduce:"Define input/output variables, domain and units, then introduce a simple baseline function or a genuine plot before fitting a more elaborate curve.",reason:"A baseline makes it possible to compare what a model explains with what it fails to capture, instead of choosing the fanciest formula.",avoid:"Do not describe a polynomial, exponential or regression technique as justified just because it appeared in Planning."}),
  evaluation:Object.freeze({limitation:"A fitted curve can overfit, conceal systematic residuals or fail outside the observed range; a high fit statistic does not prove a mechanism.",alternative:"Compare with a simpler function, study residual patterns or test a defensible alternative assumption before adding parameters.",suitability:"The chosen baseline is appropriate if its structure answers the aim and its limitations can be checked with genuine data or mathematical constraints."})
 }),
 "growth":Object.freeze({
  method:Object.freeze({introduce:"Introduce measurements over equal time intervals, or a clearly specified growth rule; compare successive differences and meaningful ratios.",reason:"The starting question is whether change is additive, proportional or follows neither pattern.",avoid:"Do not introduce an exponential formula before explaining what would make multiplicative change relevant."}),
  evaluation:Object.freeze({limitation:"Proportional growth may fail when rates vary, values approach zero or physical constraints affect the process.",alternative:"If differences rather than ratios are stable, compare a linear model; if neither remains stable, consider separate phases or a different mathematical structure.",suitability:"This comparison of changes is the right opening because it tests the central assumption before a growth or decay model is selected."})
 }),
 "cycles":Object.freeze({
  method:Object.freeze({introduce:"Introduce a time-based plot covering enough observations to assess repetition, with the time scale and units visible.",reason:"A sinusoidal model should follow evidence of a cycle, not a short rise or fall.",avoid:"Avoid teaching how sine or cosine functions work to a reader who knows the course."}),
  evaluation:Object.freeze({limitation:"A short record, varying amplitude, trend or irregular timing can make an apparently periodic curve unreliable.",alternative:"Compare a simpler trend or a trend-plus-cycle description, or collect/verify additional periods before fitting a periodic model.",suitability:"A time plot is appropriate first because period, amplitude and midline can only be justified if repeating behaviour is actually supported."})
 }),
 "trajectories":Object.freeze({
  method:Object.freeze({introduce:"Explain the mathematical coordinates and scale you will use to describe the path, then introduce a labelled plot or model of actual positions.",reason:"This first step tests whether the geometry of the path can support the intended prediction or comparison.",avoid:"Do not presume a perfect parabola merely because projectiles are often modelled quadratically."}),
  evaluation:Object.freeze({limitation:"Perspective distortion, uncertain scaling, missing time information and idealised motion assumptions can all undermine the model.",alternative:"Compare a directly measured geometric path with a suitable function, seek calibrated positions or analyse position against time if timestamps are reliable.",suitability:"A coordinate representation is justified when it makes the observed path measurable and its modelling assumptions can be checked."})
 }),
 "optimisation":Object.freeze({
  method:Object.freeze({introduce:"Define the quantity to maximise or minimise and derive an expression in variables with a feasible domain and constraints.",reason:"A mathematical optimum cannot be justified until the feasible choices and what 'best' means are explicit.",avoid:"Do not begin with differentiation merely because optimisation appears in the title."}),
  evaluation:Object.freeze({limitation:"Stationary points may be minima, maxima or neither, and an unconstrained answer can be physically impossible or inferior to a boundary value.",alternative:"Compare a graph, table of feasible cases or endpoint values with any derivative-based candidates; test sensitivity to significant assumptions.",suitability:"The chosen objective function is suitable only if it represents the aim and the candidate optimum is checked over the actual domain."})
 }),
 "images":Object.freeze({
  method:Object.freeze({introduce:"Introduce a calibrated coordinate diagram or a limited set of boundary points from the image, with a defensible scale.",reason:"These coordinates allow the boundary, dimensions or area of the target shape to be investigated mathematically.",avoid:"Do not spend pages describing the object itself when only a short explanation of the image is needed."}),
  evaluation:Object.freeze({limitation:"Perspective, pixel resolution and hand-picked points can dominate the accuracy of a curve or calculated area.",alternative:"Compare simple geometric decomposition with an appropriate fitted boundary, numerical estimate or a second calibration where practical.",suitability:"A calibrated first representation is justified because it exposes approximation error before more complicated curve fitting or integration."})
 }),
 "triangulation":Object.freeze({
  method:Object.freeze({introduce:"Draw a labelled diagram of the actual geometric configuration, identifying which angle and length measurements are known.",reason:"This makes it clear which trigonometric relationship can determine the unknown quantity relevant to the aim.",avoid:"Do not reteach the sine or cosine rule; explain instead why the relationship fits this geometry."}),
  evaluation:Object.freeze({limitation:"Angle uncertainty, assumed level ground, line-of-sight constraints and an inaccurate diagram may have substantial effects on the result.",alternative:"Use a different observation position or repeated angle measurements, compare independent triangle configurations, or test how changing an input affects the output.",suitability:"The selected trigonometric method is appropriate if the actual geometry supports it and its sensitivity is acceptable for the question."})
 }),
 "voronoi":Object.freeze({
  method:Object.freeze({introduce:"Define the site coordinates and a meaningful distance measure, then introduce a scaled map or the perpendicular-bisector construction.",reason:"The initial mathematics asks which locations are nearest under that precise definition of distance.",avoid:"Avoid describing the full geography or claiming the nearest location must also be the most accessible."}),
  evaluation:Object.freeze({limitation:"Straight-line distance may ignore roads, travel time, capacity or unequal demand, while inaccurate coordinates change the regions.",alternative:"Compare selected Euclidean distances with actual route-based measures or consider demand-weighted alternatives if the aim requires them.",suitability:"A Voronoi model suits a nearest-site question under Euclidean distance; explain clearly what it cannot establish about practical access."})
 }),
 "finance":Object.freeze({
  method:Object.freeze({introduce:"Identify documented costs, rates, time units and a decision variable, then introduce the simplest relevant cost, revenue or accumulation expression.",reason:"Your first calculation should compare outcomes that matter to the actual decision, not demonstrate a finance formula for its own sake.",avoid:"Avoid assuming constant interest or costs without stating that simplification."}),
  evaluation:Object.freeze({limitation:"Fixed rates, omitted fees, inflation, price uncertainty and time restrictions can reverse the answer from a simple financial model.",alternative:"Compare a break-even analysis, compound model or alternative rate scenario only when it addresses the actual decision; test sensitivity to assumptions.",suitability:"The selected model is suitable when its variables represent the decision and its results can be interpreted for plausible conditions."})
 }),
 "chance":Object.freeze({
  method:Object.freeze({introduce:"Define the sample space, events, trial structure and mathematical assumptions before introducing a probability calculation or simulation.",reason:"This first model establishes what probability or expected outcome could actually answer the aim.",avoid:"Do not assume independent trials, equally likely outcomes or a binomial distribution simply because they are convenient."}),
  evaluation:Object.freeze({limitation:"A finite simulation fluctuates; dependent events, an inaccurate probability estimate or a misleading expected value may invalidate a conclusion.",alternative:"Compare an exact probability calculation with simulation, test alternative assumptions or examine outcome variability alongside expected value.",suitability:"The method is appropriate if it matches the real event structure and the chosen calculation addresses the intended risk or decision."})
 }),
 "proof":Object.freeze({
  method:Object.freeze({introduce:"State the conjecture with its mathematical domain and assumptions, then introduce small cases or a potential counterexample to sharpen the claim.",reason:"Cases help discover possible structure, but the investigative goal is a justified general result, not a catalogue of examples.",avoid:"Do not explain routine algebraic manipulations or present a few confirming cases as a proof."}),
  evaluation:Object.freeze({limitation:"A finite set of examples cannot prove a universal statement, while hidden domain restrictions or overlooked counterexamples may refute it.",alternative:"Consider algebraic reasoning, a suitable induction argument or a strategic counterexample, depending on the precise claim and course suitability.",suitability:"The chosen method is appropriate when its logical structure can establish the claim for every allowed case, not merely the examples tested."})
 }),
 "iteration":Object.freeze({
  method:Object.freeze({introduce:"Define the recurrence or iteration rule, starting value and parameter range, then display a few correctly calculated iterates.",reason:"Your first cases allow you to ask whether behaviour depends on the starting point and whether a fixed point is plausible.",avoid:"Do not equate several close numerical terms with mathematical proof of convergence."}),
  evaluation:Object.freeze({limitation:"Finite iteration, numerical rounding, sensitive starting values and oscillation can make an apparent limit unreliable.",alternative:"Compare different initial conditions or step sizes, identify a fixed-point equation, or investigate stability where the mathematics is accessible.",suitability:"Iteration is a suitable starting experiment if you distinguish observations from a later analytical justification of convergence or divergence."})
 }),
});
export function writingGuidanceForFirstMaths(state){
 const ctx=firstMathsContext(state),route=ctx.activeRoute;
 if(route){
  const guide=JOURNEY_WRITING_GUIDANCE[route.id];
  if(guide)return {origin:"journey",title:route.title,id:route.id,...guide};
 }
 const {active,other}=orderSelectedTechniqueGuides(ctx.selected,"",state?.planning?.fields?.course||"");
 const chosen=active[0]||other[0];
 const item=chosen&&techniqueStartingGuide(chosen.id);
 if(item)return {
  origin:"technique",title:chosen.label,id:chosen.id,
  method:{
   introduce:item.first,
   reason:"Explain which mathematical feature this method would let you investigate: "+item.look,
   avoid:"Use the technique's name and mathematical purpose, not a step-by-step tutorial of a familiar syllabus procedure."
  },
  evaluation:{
   limitation:chosen.caution||"Identify the assumption, domain or type of mathematical question this method cannot address reliably.",
   alternative:"Compare with another plausible mathematical representation or technique only if the limitation could change the answer. "+item.next,
   suitability:"Justify the method against the aim and evidence you actually have, rather than claiming that it must be correct because you chose it."
  }
 };
 return {
  origin:"general",title:"Your own mathematical starting point",id:"",
  method:{
   introduce:"Name one mathematical representation, calculation or carefully defined theoretical case that you might genuinely begin with.",
   reason:"Explain the mathematical question it could answer, using your aim and the available evidence or assumptions.",
   avoid:"Don't describe every future technique, teach familiar syllabus material or imply a planned result has already been established."
  },
  evaluation:{
   limitation:"Identify one real restriction on the proposed mathematics: its assumptions, input domain, representativeness of a model or type of conclusion.",
   alternative:"Consider a different representation, model, mathematical argument or simplification that might address that particular restriction.",
   suitability:"Explain why your chosen opening is a sensible way to investigate the aim despite the limitation, and what would make you reconsider it."
  }
 };
}
const adviceRow=(icon,e,tag,text)=>'<div class="first-maths-writing-guidance-row"><span class="first-maths-writing-guidance-bullet">'+icon(tag==="method-introduce"?"calculator":tag==="method-reason"?"target":tag==="evaluation-limitation"?"info":tag==="evaluation-alternative"?"git-branch":"check-circle")+'</span><p>'+e(text)+'</p></div>';
export function renderJourneyWritingAdvice(state,part,icon,e,{reduced=false}={}){
 const advice=writingGuidanceForFirstMaths(state);
 if(!["method","evaluation"].includes(part))return "";
 const body=part==="method"?advice.method:advice.evaluation;
 const kicker=advice.origin==="journey"?"YOUR CHOSEN INVESTIGATIVE JOURNEY":
  advice.origin==="technique"?"FROM YOUR SELECTED MATHEMATICS":"A STARTING POINT TO CONSIDER";
 const title=part==="method"?"Introducing this method":"Evaluating this method";
 const main=part==="method"?
  [{key:"method-introduce",title:"What to introduce",copy:body.introduce},
   {key:"method-reason",title:"Why start here",copy:body.reason}]:
  [{key:"evaluation-limitation",title:"Mathematical limitation",copy:body.limitation},
   {key:"evaluation-alternative",title:"Alternative or check",copy:body.alternative},
   {key:"evaluation-fit",title:"Why this approach may suit the aim",copy:body.suitability}];
 return '<aside class="first-maths-journey-writing-advice" data-journey-writing-part="'+part+'" data-journey-writing-origin="'+e(advice.origin)+'" data-journey-writing-id="'+e(advice.id)+'">'+
  '<div class="first-maths-journey-writing-head"><span class="first-maths-journey-writing-icon">'+icon(part==="method"?"compass":"layers")+'</span><div>'+
   '<span class="first-maths-guide-eyebrow">'+e(kicker)+'</span>'+
   '<strong>'+e(advice.title)+' · '+e(title)+'</strong></div></div>'+
  (!reduced?'<div class="first-maths-journey-writing-points">'+main.map(row=>
   '<div class="first-maths-journey-writing-point">'+
    '<strong>'+e(row.title)+'</strong>'+adviceRow(icon,e,row.key,row.copy)+'</div>').join("")+'</div>'+
   (part==="method"?'<p class="first-maths-journey-writing-reminder">'+icon("book")+
    ' Your reader already knows your course: justify your choice without explaining routine syllabus calculations. Explain genuinely new mathematics at its first use.</p>':
    '<p class="first-maths-journey-writing-reminder">'+icon("lightbulb")+
    ' These may be anticipated limitations. Revisit them after completing the maths and only claim weaknesses or comparisons you actually investigated.</p>'):
   '<p class="first-maths-journey-writing-reduced">'+e(part==="method"?body.reason:body.limitation)+'</p>')+
  (advice.origin==="journey"?'<p class="first-maths-journey-writing-notes">This is guidance from a possible journey, not a method you must follow. If you change methods, revise your writing to reflect what you actually used.</p>':'')+
 '</aside>';
}
