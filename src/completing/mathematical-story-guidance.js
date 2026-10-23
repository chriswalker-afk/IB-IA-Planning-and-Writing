/** Small writing examples and reminders, never generated student findings. */
import {firstMathsContext} from "./first-maths-bridge.js";
import {writingGuidanceForFirstMaths} from "./first-maths-writing-guidance.js";
import {outcomeRouteForEntry,selectedInvestigativeRoute} from "./adaptive-journey.js";
import {methodFamilies} from "./method-identity.js";
import {linkedSources} from "./evidence-links.js";
import {routeById} from "../planning/investigative-routes.js";

export const MATHEMATICAL_LINK_HINT="Explain what the actual earlier result established, what it still does not establish, and why the next mathematics can address that gap. If your aim is already answered, explain why it is reasonable to conclude.";

const CHOICES=Object.freeze({
 relationships:"If the choice matters, explain whether your aim needs association or prediction. For predictions, justify any accuracy threshold by the intended use.",
 groups:"If it affects the comparison, explain why these groups, paired or independent observations, and measures of centre or spread suit your question.",
 categorical:"If a different grouping or denominator could change the answer, explain why your categories and conditional proportions answer the question.",
 variation:"If consistency matters, explain which measure of spread or meaningful comparison threshold makes the variation useful for your aim.",
 "fitted-models":"If the answer depends on the model, explain its form, assumptions and usable range. For predictions, justify any accuracy threshold by the intended use.",
 growth:"If the growth rule matters, explain why additive change, proportional change or another structure is appropriate, including any baseline you use.",
 cycles:"If a periodic model matters, explain the time interval and evidence or stated rule supporting your chosen period and other parameters.",
 trajectories:"If it affects the path or prediction, explain your coordinates, calibration and use of time information, rather than assuming a familiar curve.",
 optimisation:"If a different definition of best could change the answer, explain the objective and feasible constraints before judging the optimum.",
 images:"If it affects the estimated shape or size, explain the scale, boundary points or geometric approximation you chose.",
 triangulation:"If the measurement geometry affects the result, explain why the chosen angles, lengths and assumptions can determine the unknown quantity.",
 voronoi:"If the distance definition affects your answer, explain why it represents the intended meaning of nearest or accessible.",
 finance:"If a financial assumption affects the decision, explain the rates, time periods, costs or comparison measure you chose and why they fit the question.",
 chance:"If the probability assumptions affect the answer, explain the event structure and why your chosen probability, average outcome or risk measure addresses the aim.",
 proof:"If the claim depends on a domain or assumption, explain that restriction and why your argument can cover all the permitted cases.",
 iteration:"If the starting value, parameter range or stopping rule affects the claim, explain the choice and what your finite calculations can establish."
});

const METHOD_ROUTES=Object.freeze({
 pmcc:"relationships",spearman:"relationships","linear-regression":"fitted-models",
 "quadratic-fit":"fitted-models",exponential:"growth",sinusoidal:"cycles",power:"fitted-models",
 optimisation:"optimisation","geometric-model":"images",normal:"variation",binomial:"chance",
 "two-sample-t":"groups","chi-independence":"categorical","chi-fit":"categorical",
 probability:"chance","expected-value":"chance",voronoi:"voronoi",triangulation:"triangulation",
 "numerical-integration":"images","rates-from-data":"growth",proof:"proof",
 "finance-break-even":"finance","finance-compound":"finance","finance-loan":"finance","finance-cashflow":"finance"
});
const EXTENDED_ROUTES=Object.freeze({
 "nonlinear-model":"fitted-models","nonlinear-association":"relationships",
 "categorical-test":"categorical","expected-value":"chance",measurement:"triangulation",
 "finance-break-even":"finance","finance-compound":"finance","finance-loan":"finance","finance-cashflow":"finance"
});
const general=()=>({id:"general",title:"Your mathematical reasoning",origin:"general"});
const compatible=(route,kind)=>route&&(!kind||kind==="unsure"||route.kinds?.includes(kind));
const selection=(route,origin)=>route&&Object.hasOwn(CHOICES,route.id)?
 {id:route.id,title:route.title,origin}:general();

function storyContext(state,entry,phase,start){
 const opening=()=>{
  const guide=writingGuidanceForFirstMaths(state);
  if(start.activeRoute)return selection(start.activeRoute,"journey");
  if(guide.origin==="technique"){
   // Reuse the shared course-technique mapping for the same technique that the
   // opening writer selected. This is a temporary context, not a state edit.
   const route=selectedInvestigativeRoute({...state,planning:{...state?.planning,
    routeExplorer:{selectedRoute:""},mathSelected:[guide.id]}});
   if(compatible(route,start.kind))return selection(route,"technique");
  }
  return general();
 };
 if(entry?.methodId==="other")return general();
 if(phase==="opening"||!entry)return opening();
 const route=outcomeRouteForEntry(state,entry);
 const methods=methodFamilies(entry,{allowPlanned:true});
 // An explicit current method outranks the original journey. Preserve growth
 // and cycle identities even though both have nonlinear-model outcome advice.
 const method=[...methods].find(id=>Object.hasOwn(METHOD_ROUTES,id));
 if(method)return selection(routeById(METHOD_ROUTES[method]),"method");
 if(entry.methodId&&entry.methodId!=="follow-journey")return general();
 if(entry.phase==="first"&&!entry.methodId)return opening();
 if(!entry.methodId&&(!route||!entry.journeyOutcome?.startsWith(route.id+":")))return general();
 const candidate=routeById(EXTENDED_ROUTES[route?.id]||route?.id);
 return compatible(candidate,start.kind)?selection(candidate,"journey"):general();
}

const example=(id,interpretation,gap,next,paragraph)=>Object.freeze({
 id,
 notes:Object.freeze([
  Object.freeze({label:"Interpretation",text:interpretation}),
  Object.freeze({label:"Gap",text:gap}),
  Object.freeze({label:"Next mathematics",text:next})
 ]),
 paragraph
});
const EXAMPLES=Object.freeze({
 paired:example("paired-association",
  "The scatter is roughly straight, with a correlation coefficient of 0.96.",
  "The design requires predictions within 2 cm; association alone does not establish that accuracy.",
  "Fit a line and compare observed-minus-predicted errors with the 2 cm requirement.",
  "The roughly straight scatter and correlation coefficient of 0.96 make a line worth testing, but they do not establish whether predictions meet the design's 2 cm requirement. I will fit a line and compare the observed-minus-predicted errors with that requirement, because those errors measure how far each prediction misses the observed value."),
 model:example("model-errors",
  "The model's checked errors range from −4 to +3 cm.",
  "The application requires errors within ±2 cm; the model does not meet that requirement on every checked case.",
  "Plot observed-minus-predicted errors against the input before considering a different model or narrower range. A narrower range would also narrow the conclusion.",
  "The model's checked errors range from −4 to +3 cm, so some exceed the required ±2 cm. This shows a limitation without yet explaining where it occurs. I will plot the observed-minus-predicted errors against the input to locate the larger errors. Their pattern can help me decide whether a different model or a narrower usable range is justified. A narrower range would also narrow my conclusion."),
 spread:example("comparison-spread",
  "Both groups have a mean completion time of 12 minutes.",
  "Equal means do not establish equal consistency, which is the aim of the comparison.",
  "Compare interquartile ranges to examine the spread of the middle half of each group's times.",
  "Both groups have a mean completion time of 12 minutes, but this does not show whether their times are equally consistent. Since consistency is the aim of the comparison, I will compare the interquartile ranges. These describe the spread of the middle half of each group's times, so they address a feature that the means alone leave unanswered."),
 categories:example("unequal-denominators",
  "Group A has 8 successes out of 20; group B has 18 out of 60.",
  "The larger count in B uses a group three times as large, so counts alone do not compare success rates.",
  "Compare 8/20 = 40% with 18/60 = 30%: a sample difference of ten percentage points, without claiming a population difference.",
  "Group B had more successes, but it was three times as large. The counts alone therefore do not answer which sample had the higher success rate. I compared proportions: 8/20 = 40% and 18/60 = 30%. Success was ten percentage points more frequent in sample A. This answers the sample comparison, but does not alone establish a population difference."),
 stipulated:example("stipulated-model",
  "Under the stated cost and price assumptions, earlier algebra gives profit P(x) = −x² + 12x − 20.",
  "The assumed capacity allows integer outputs 0 ≤ x ≤ 10; the best feasible output is still unknown.",
  "Rewrite P(x) = 16 − (x − 6)²: its greatest permitted value is 16 at x = 6.",
  "The profit expression alone does not identify the best permitted output. The assumed capacity restricts output to integers 0 ≤ x ≤ 10. Rewriting P(x) = −x² + 12x − 20 as 16 − (x − 6)² shows that P cannot exceed 16, and x = 6 is feasible. Six units therefore maximise profit within this model; the conclusion still depends on its stated cost and price assumptions."),
 image:example("image-scale",
  "The estimated outline covers 40 grid squares in the image.",
  "A square count does not yet give the object's physical area; calibration gives each square a side of 0.5 cm.",
  "Convert using square area: 40 × (0.5)² = 10 cm², while retaining the boundary approximation.",
  "The outline covers an estimated 40 grid squares, but this count alone does not give its physical area. Calibration gives each square a side of 0.5 cm, so I used the area of a square to convert the count: 40 × (0.5)² = 10 cm². This answers the area question at the stated scale, while retaining the approximation made at the boundary."),
 distance:example("distance-definition",
  "The defined points (0, 0) and (3, 4) have horizontal and vertical separations of 3 and 4 units.",
  "The components do not yet give the straight-line separation asked for; a road journey would be a different question.",
  "Use the right triangle: d = √(3² + 4²) = 5 units under the stated scale.",
  "The defined points (0, 0) and (3, 4) have horizontal and vertical separations of 3 and 4 units, but neither component alone answers the straight-line distance question. I used them as the legs of a right triangle: d = √(3² + 4²) = 5 units. This calculation addresses the required separation under the stated scale; it does not measure a road journey."),
 chance:example("simulation-variation",
  "The exact model predicts a probability of 1/4; one simulation gives 240/1000 = 0.24.",
  "A finite simulation can vary, so the difference from 0.25 does not alone refute the model.",
  "Compare independent runs to examine variation before deciding whether to revisit the trial assumptions.",
  "The model predicts 0.25, whereas this run gave 240/1000 = 0.24. A finite simulation need not match the theoretical value exactly, so this difference alone does not refute the model. I will compare independent runs to examine the variation before deciding whether the disagreement calls for checking the trial assumptions."),
 pure:example("sequence-reasoning",
  "For a₀ = 8 and aₙ₊₁ = aₙ/2, the first terms are 8, 4, 2, 1.",
  "Finite examples do not establish the limit.",
  "Repeated multiplication by 1/2 gives aₙ = 8(1/2)ⁿ. Repeated halving makes this smaller than any chosen positive amount, establishing a limit of zero for the stated rule.",
  "For a₀ = 8 and aₙ₊₁ = aₙ/2, the first terms decrease, but examples alone do not establish a limit. Each step multiplies by 1/2, so after n steps aₙ = 8(1/2)ⁿ. Repeated halving eventually makes this smaller than any chosen positive amount; this is why the sequence tends to zero. The argument covers every nonnegative integer n for the stated rule and starting value, so further numerical examples are unnecessary."),
 exactChance:example("probability-and-risk",
  "The defined game has equally likely net gains of +3 and −1 units, giving expected gain (3 − 1)/2 = 1 unit.",
  "A positive average gain does not answer whether a single play can lose money.",
  "The loss outcome has probability 1/2; distinguish that risk from the expected gain.",
  "The defined game has expected gain (3 − 1)/2 = 1 unit, but that average does not answer whether a single play can lose money. Its two equally likely net outcomes are +3 and −1 units, so I calculated a loss probability of 1/2. This addresses the risk of one play and shows why a positive expectation alone is insufficient for that decision."),
 geometry:example("defined-geometry",
  "A rectangle with fixed perimeter 12 units and one side x has area A(x) = x(6 − x), where 0 < x < 6.",
  "The formula gives areas but does not yet identify the largest permitted area.",
  "Rewrite A(x) = 9 − (x − 3)²; the largest area is 9 square units when both sides are 3 units.",
  "For a rectangle with perimeter 12 units and one side x, A(x) = x(6 − x) gives the area, but it does not yet identify the largest permitted value. I rewrote it as A(x) = 9 − (x − 3)². Since the square is nonnegative, the area cannot exceed 9 square units. Taking x = 3 is within 0 < x < 6 and makes both sides 3 units, so it achieves that maximum under the fixed-perimeter assumption."),
 domain:example("stated-model-domain",
  "The stated model for distance remaining is d(t) = 12 − 3t metres, with time t in seconds; d(5) = −3 metres.",
  "A negative distance remaining is not meaningful, so the rule needs a usable time domain.",
  "Solve d(t) ≥ 0 with t ≥ 0 to obtain 0 ≤ t ≤ 4; restrict the conclusion to the time up to arrival.",
  "The stated rule d(t) = 12 − 3t gives −3 metres remaining at t = 5 seconds, which is not meaningful. The formula therefore needs a usable time domain before it can answer the distance question. Solving 12 − 3t ≥ 0 together with t ≥ 0 gives 0 ≤ t ≤ 4. I can use the model up to arrival, but it does not describe what happens afterwards."),
 cycleRule:example("defined-periodic-rule",
  "The stated model is h(t) = 3 + 2 sin(πt/6), with h in metres and t in hours.",
  "The formula alone does not yet explain when its pattern repeats.",
  "One full sine cycle of duration T needs an angle change of 2π; (π/6)T = 2π gives period T = 12 hours within this model.",
  "The stated model h(t) = 3 + 2 sin(πt/6) gives height in metres, but its repeating time is not yet explicit. A full sine cycle needs an angle change of 2π. Writing T for one cycle's duration, I solved (π/6)T = 2π to obtain T = 12 hours. This identifies the repeat interval implied by the rule; it does not by itself verify that a real process follows the model.")
});
const EXAMPLE_BY_ROUTE=Object.freeze({
 relationships:"paired",groups:"spread",categorical:"categories",variation:"spread",
 "fitted-models":"model",growth:"model",cycles:"model",trajectories:"model",
 optimisation:"stipulated",images:"image",triangulation:"distance",voronoi:"distance",finance:"stipulated",
 chance:"chance",proof:"pure",iteration:"pure",general:"pure"
});
const ANALYTIC_EXAMPLE_BY_ROUTE=Object.freeze({
 relationships:"domain",groups:"pure",categorical:"exactChance",variation:"pure",
 "fitted-models":"domain",growth:"pure",cycles:"cycleRule",trajectories:"domain",
 optimisation:"stipulated",images:"geometry",triangulation:"distance",voronoi:"distance",finance:"stipulated",
 chance:"exactChance",proof:"pure",iteration:"pure",general:"pure"
});

function hasTheoreticalInputs(state,entry,context,start){
 if(entry?.kind==="theory")return true;
 const completion=state?.completion;
 const sources=entry&&completion?linkedSources(state,entry):[];
 const fields=sources.length?sources.map(source=>source.fields):
  !(completion?.sourceRecords||[]).length&&completion?.fields?[completion.fields]:[];
 if(fields.some(field=>["ready","partial"].includes(field.dataStatus)&&field.actualSourceType!=="theoretical"))return false;
 if(fields.some(field=>field.dataStatus==="theoretical"||field.actualSourceType==="theoretical"))return true;
 // A current method is not overridden by an old investigation kind. Explicit
 // source choices remain useful when no linked or legacy source settles this.
 return state?.planning?.fields?.dataSource==="theoretical"||
  (context.origin!=="method"&&start.sourceKey==="theoretical");
}

/** Returns editorial teaching content only. No result is inferred or stored. */
export function mathematicalStoryGuidance(state,{entry=null,phase="later"}={}){
 const start=firstMathsContext(state),context=storyContext(state,entry,phase,start);
 const noMeasurements=hasTheoreticalInputs(state,entry,context,start);
 const exampleId=(noMeasurements?ANALYTIC_EXAMPLE_BY_ROUTE:EXAMPLE_BY_ROUTE)[context.id];
 return {...context,
  choiceHint:CHOICES[context.id]||"If a choice of definition, assumption, comparison or method could change the answer, explain why you made it and how it affects the claim.",
  example:EXAMPLES[exampleId]
 };
}

export function renderConsequentialChoice(state,icon,e,{entry=null,phase="later",reduced=false}={}){
 if(reduced)return "";
 const guide=mathematicalStoryGuidance(state,{entry,phase});
 return '<aside class="math-story-choice" data-story-choice data-story-route="'+e(guide.id)+'">'+
  icon("lightbulb")+'<p><strong>A choice worth explaining</strong> '+e(guide.choiceHint)+'</p></aside>';
}

export function renderStorySynthesis(state,icon,e,{entry=null,phase="later",reduced=false}={}){
 if(reduced)return "";
 const guide=mathematicalStoryGuidance(state,{entry,phase}),sample=guide.example;
 return '<details class="math-story-synthesis" data-story-synthesis data-story-route="'+e(guide.id)+'">'+
  '<summary>'+icon("book")+'<span>From separate notes to one passage</span>'+icon("chevron-right")+'</summary>'+
  '<div class="math-story-synthesis-body"><p class="math-story-example-label">Illustrative example — use your own findings</p>'+
  '<dl class="math-story-notes">'+sample.notes.map(note=>'<div><dt>'+e(note.label)+'</dt><dd>'+e(note.text)+'</dd></div>').join("")+'</dl>'+
  '<p class="math-story-passage-label"><strong>Combined passage</strong></p>'+
  '<p class="math-story-passage">'+e(sample.paragraph)+'</p>'+
  '<p class="math-story-writing-note">These notes form one passage; a shared reason need not be repeated in each paragraph. Explain unfamiliar mathematics when it first appears. Conclude when the aim is answered instead of adding an unnecessary stage.</p></div></details>';
}
