/**
 * Interpretation Insights — method-specific mathematical reading support.
 *
 * This is an editorial, read-only lens on an actual student-recorded result.
 * It does not parse a free-text result into numbers, infer a theorem, perform
 * calculations, assess the IA, or add new student-owned records. Methods are
 * selected explicitly; a planned route is clearly labelled as contextual only.
 */
import {methodFamilies} from './method-identity.js';
import {selectedInvestigativeRoute,selectedJourneyOutcome} from './adaptive-journey.js';
import {routeAdvice} from './route-coach.js';
import {escapeHtml,icon as defaultIcon} from '../ui/primitives.js';

const str=value=>typeof value==='string'?value.trim():'';
const done=entry=>entry?.status==='completed'&&!!str(entry.result);
const preview=(value,length=260)=>{
 const text=str(value);
 return text.length>length?text.slice(0,length-1)+'…':text;
};
const prompt=(title,meaning,context,boundary,check)=>Object.freeze({
 title,meaning,context,boundary,check
});

/** The interpretation skill must match the mathematics actually selected, not
 * a keyword in the result or an assumed route. Each guide teaches a distinct
 * mathematical inference, its scope, and a useful validity check. */
export const TECHNIQUE_INTERPRETATIONS=Object.freeze({
 pmcc:prompt("Pearson's correlation",
  "Identify the sign and magnitude of r: it describes direction and strength of linear association in these paired data and has no units.",
  "Name both measured variables. Explain what increasing values of one tend to accompany in the other, using the scatter as well as r.",
  "Correlation alone does not establish causation or predictive accuracy. A small r does not rule out a curved or other non-linear pattern.",
  "Inspect the scatter for curvature, groups and influential points before deciding what this coefficient supports."),
 spearman:prompt("Spearman's rank correlation",
  "Interpret the sign and strength of the monotonic association between the ranks, rather than claiming that the original quantities change linearly.",
  "Say what higher or lower ranks in the actual variables tend to accompany and why ranking was meaningful here.",
  "A rank coefficient does not give a prediction equation, show causation, or necessarily detect a relationship that reverses direction.",
  "Check for tied ranks and a turning pattern in the original scatter; these can affect how useful the coefficient is."),
 'linear-regression':prompt("Straight-line regression",
  "Interpret the gradient as change in the output per unit increase in the input. Interpret the intercept only if the input value zero is meaningful in the model's domain.",
  "Use the actual variable names and units. Distinguish describing the recorded points from predicting a new output.",
  "A fitted line and a high fit statistic do not establish causation, accurate individual predictions or reliable extrapolation.",
  "Compare observed and predicted values, examine residuals and identify the input range in which the model is defensible."),
 'quadratic-fit':prompt("Polynomial modelling",
  "Interpret the model's shape and relevant coefficients or turning points, explaining which mathematical features matter for your question.",
  "Give meaning to the variables, turning point or changes in gradient only where they correspond to a sensible part of the investigated domain.",
  "A polynomial can fit noisy points closely without representing the process; higher degree and higher R² do not automatically improve validity.",
  "Inspect residual structure, edge behaviour and whether a simpler justified model could answer the same aim."),
 'piecewise-model':prompt("Piecewise functions and joins",
  "Interpret each branch as a mathematical rule for its stated domain, and explain what a threshold, corner or change of rule means for the investigation.",
  "Define the variables and interval endpoints and explain which branch includes each join value. Use the actual model rather than assuming a smooth curve.",
  "A piecewise definition need not be continuous; a continuous function need not have matching one-sided derivatives. Real jumps and corners may be mathematically appropriate.",
  "Evaluate one-sided limits and join values where continuity matters. Check one-sided derivatives only if smoothness is required, and compare a justified boundary or rule alternative."),
 exponential:prompt("Exponential growth or decay",
  "Distinguish a multiplicative change per equal interval from an additive change. Interpret the growth or decay factor and its period.",
  "Translate the factor into change over the actual time or input unit, and explain the starting value in your situation.",
  "A short increasing sequence does not prove constant proportional growth or justify forecasting far beyond observed values.",
  "Compare successive ratios when appropriate, examine errors and state where constant proportional change is plausible."),
 sinusoidal:prompt("Sinusoidal or periodic modelling",
  "Interpret amplitude, midline, period and phase in the units of the quantities being modelled.",
  "Explain what a peak, trough or one complete cycle represents in the investigated situation.",
  "A smooth rise and fall over one short interval does not by itself prove a repeating cycle or stable future periodicity.",
  "Check repeated cycles, residuals and whether a trend is mixed with the periodic component."),
 power:prompt("Power-law modelling",
  "Interpret the exponent as a scaling relationship, not simply as a curve that happens to fit the points.",
  "Describe how the output is predicted to change when the input is multiplied by a factor; check that the relevant quantities and domain make sense.",
  "A log transformation changes the fitting error measure. Positivity restrictions and original-scale prediction errors can limit the model.",
  "Compare original-scale residuals and check the positivity, units and input range required by the chosen fitting method."),
 optimisation:prompt("Differentiation and optimisation",
  "Interpret a stationary point as a candidate optimum until its type, domain and feasibility have been established.",
  "State the objective being maximised or minimised, its units, and the real constraints on the variable.",
  "Solving a derivative equal to zero does not alone prove a global optimum; a mathematically optimal value may violate a constraint.",
  "Check endpoints, other stationary points and feasible candidates; then explain how assumptions affect the recommendation."),
 'geometric-model':prompt("Geometric model or measurement",
  "Interpret the derived area, length or volume as a quantity from the stated geometry, not as a perfectly observed physical fact.",
  "Keep dimensions, units and any scale conversion explicit; connect the calculated quantity to the purpose of the investigation.",
  "Approximated boundaries, idealised shapes and imprecise dimensions can limit the accuracy of the result.",
  "Consider how changes in the measured dimensions or shape assumption would alter the calculated quantity."),
 normal:prompt("Normal-distribution model",
  "Explain how the calculated standardised value or probability relates to distance from the model mean in standard deviations.",
  "Interpret the event or threshold in the original units and distinguish the fitted model from the observed sample.",
  "Using a normal formula does not establish that the underlying data are normally distributed or representative of a population.",
  "Inspect shape, skew, outliers and the basis for the estimated mean and standard deviation."),
 binomial:prompt("Binomial probability",
  "Interpret the probability as referring to a stated number of successes in a fixed number of trials under a defined success probability.",
  "Define a trial and a success in the investigated context, then explain the event the calculated probability represents.",
  "The model relies on the relevant trials having two outcomes, a fixed success probability and appropriate independence.",
  "Check whether the actual process meets those assumptions and whether an observed count is plausible under the model."),
 'two-sample-t':prompt("Two-sample t-test",
  "Explain the estimated difference between groups and what the test result suggests about the specified null hypothesis.",
  "Use the two actual groups, units, sample sizes and direction of the difference; distinguish practical importance from statistical evidence.",
  "A nonsignificant result does not prove equal population means. A small p-value is not the size of the effect or proof of causation.",
  "Check sampling, independence, distribution and any variance assumptions of the version of the test used."),
 'chi-independence':prompt("Chi-squared independence test",
  "Interpret whether the observed counts provide evidence of an association between the stated categorical variables.",
  "Name the categories and describe which observed versus expected counts or conditional proportions are relevant.",
  "A p-value is not the strength of association or a causal explanation; a nonsignificant result does not prove independence.",
  "Check expected frequencies, sampling and independent observations before relying on the test."),
 'chi-fit':prompt("Chi-squared goodness-of-fit",
  "Interpret how the observed category counts compare with the specified theoretical or proposed distribution.",
  "Identify which categories contribute most to any discrepancy and what the expected distribution represents.",
  "Failure to reject a distribution is not proof that it is true. Small expected counts or unverified probabilities can invalidate the test.",
  "Check the source of expected probabilities, expected frequencies and observation independence."),
 probability:prompt("Conditional probability",
  "Interpret the probability with its conditioning event and sample space explicitly stated.",
  "Explain what information is assumed known and which event the numerical probability refers to.",
  "Reversing the conditioning events or assuming independence without justification can change the answer.",
  "Check the event definitions and whether the relevant denominators and probabilities are justified."),
 'expected-value':prompt("Expected value and risk",
  "Interpret expected value as a weighted long-run average under the stated outcome probabilities.",
  "Explain the units of gain, loss or benefit and what a single outcome could still look like.",
  "A positive expectation is not a guaranteed gain, the most likely result, or enough by itself for a risk-sensitive decision.",
  "Inspect the probability and magnitude of losses and consider whether variation changes the conclusion."),
 voronoi:prompt("Voronoi regions",
  "Interpret each region as points nearest to a particular site under the specified distance measure.",
  "Describe the meaning of a boundary and how the sites and chosen distance represent the actual access question.",
  "Euclidean closeness is not automatically road access, demand, service quality or an optimal new location.",
  "Check clipping boundaries, coordinate accuracy and whether a different relevant distance metric changes assignments."),
 triangulation:prompt("Triangulation and surveying",
  "Interpret the estimated length or height as a consequence of the measured geometry and the chosen trigonometric relationships.",
  "Explain the baseline, reference angle and units and identify exactly which geometric quantity was calculated.",
  "Exact-looking trigonometry does not guarantee an accurate physical measurement; angle errors can be strongly magnified.",
  "Vary uncertain angles or the baseline by plausible amounts and examine the effect on the final estimate."),
 'numerical-integration':prompt("Numerical integration",
  "Interpret the numerical sum as an approximation to the accumulated quantity or area described by the integral.",
  "Explain the interval, units and what the accumulated quantity measures in the original situation.",
  "A numerical approximation is not generally an exact value; accuracy depends on the function, spacing and method.",
  "Compare a justified finer subdivision or an exact result when available, and discuss the difference."),
 'rates-from-data':prompt("Rates estimated from data",
  "Interpret a finite difference as average change over the chosen input interval, with output units per input unit.",
  "Identify the two observations or interval and explain the physical or contextual meaning of the sign and size.",
  "An average rate over an interval does not establish an instantaneous derivative; small noisy intervals can make estimates unstable.",
  "Compare nearby intervals and consider measurement resolution before interpreting changes in rate."),
 'finance-break-even':prompt("Costs, revenue and break-even",
  "Interpret the break-even quantity as where modelled revenue and cost are equal, distinguishing a threshold from an actual observed sale.",
  "State the units, relevant fixed and variable costs, feasible sales quantities and what a positive or negative profit would mean.",
  "Break-even does not prove that demand, capacity, cash timing or other business constraints make a plan viable.",
  "Compare the threshold with justified demand and capacity assumptions and examine sensitivity to price and cost."),
 'finance-compound':prompt("Compound growth or investment",
  "Interpret the final amount and growth factor over the actual compounding periods.",
  "Distinguish principal, accumulated interest and the assumed rate; connect the time scale to the question.",
  "A formula using a fixed rate is a conditional projection, not a guaranteed investment return or a loan repayment model.",
  "Check effective versus nominal rate, compounding period and sensitivity to reasonable rate changes."),
 'finance-loan':prompt("Loan repayment and amortisation",
  "Interpret each payment, outstanding balance and total interest over the scheduled periods.",
  "Explain which repayment periods and interest rates were used and what the final loan balance means.",
  "A smaller instalment can increase total interest; loan affordability cannot be inferred from a future-value formula alone.",
  "Check effective periodic rates and compare both payment size and lifetime cost."),
 'finance-cashflow':prompt("Cash-flow modelling",
  "Interpret the cumulative balance as cash available after receipts and payments at each specified time.",
  "Identify the lowest cash balance and periods when cash may be insufficient, not merely the final profit.",
  "Accounting profit and positive ending cash do not show that every interim repayment or purchase is affordable.",
  "Check payment timing and plausible downside scenarios, distinguishing observed costs from assumptions."),
 proof:prompt("Proof, conjecture or counterexample",
  "State exactly what has been proved, disproved or merely suggested by the argument.",
  "Identify the mathematical objects, allowed domain and the logical step that makes the conclusion valid for every permitted case.",
  "Many numerical examples do not prove a universal statement. One valid counterexample can disprove it, but only for the claim stated.",
  "Check quantifiers, hidden assumptions and whether the argument covers the full proposed domain."),
 algebra:prompt("Algebraic derivation or domain",
  "Interpret the solved expression, parameter relationship or restriction in terms of the original question.",
  "State what every variable represents and which mathematical values are permitted.",
  "Manipulations such as dividing by an expression, squaring, taking logarithms or inverting a function can add or exclude solutions.",
  "Substitute possible solutions back and check domain restrictions introduced during the derivation."),
 scatter:prompt("A first scatter diagram",
  "Describe the actual direction, form, clustering and spread of the plotted observations before choosing a coefficient or a model.",
  "Name both variables and their units; refer to the genuine feature of the points, not a relationship you expected to see.",
  "A plotted pattern alone does not prove causation, linearity or a justified predictive equation.",
  "Check unusual points, grouped observations, scale and whether there is a convincing straight or curved pattern.")
});

/** When the student has recorded a route but not a specific method, speak about
 * the mathematical question, never pretend a particular technique was used. */
export const ROUTE_INTERPRETATIONS=Object.freeze({
 relationships:prompt("Relationships in paired data","Describe the form, direction and spread of the actual paired observations.","Explain what the pattern says about the two named variables.","An association is not causation, and a visible trend is not automatically a prediction model.","Check the scatter shape before deciding whether a coefficient or function is warranted."),
 groups:prompt("Comparing groups","Compare centre, spread and shape with the same units and comparable scales.","Explain how large the observed group difference is relative to variation.","A difference in samples does not automatically establish a population difference.","Check sampling comparability, group sizes and whether different spreads affect the interpretation."),
 categorical:prompt("Categorical comparisons","Read proportions using the correct group denominators.","State which categories or groups were compared and how the rates differ.","Unequal raw counts alone cannot establish different rates or population association.","Check category definitions, denominators and sampling before interpreting a test."),
 variation:prompt("Variation and consistency","Explain whether the observed spread is large or small relative to a meaningful benchmark.","Name the quantity, units and whether consistency or extremes matter for the aim.","A small sample spread is not automatically a reliable population claim or proof of accurate measurement.","Compare spread with measurement resolution and inspect skew or unusual values."),
 'fitted-models':prompt("Interpreting a fitted model","Describe what the model predicts on the investigated input range.","Explain parameters and prediction errors using the actual variables and units.","An attractive curve or large R² does not establish predictive validity outside the observed domain.","Check residuals, plausible parameter meanings and the usable input range."),
 growth:prompt("Growth patterns","Distinguish approximately constant differences from approximately constant ratios.","Connect the observed pattern to the actual time or input intervals.","A short run of values cannot establish a universal growth law.","Check the relevant differences, ratios and errors before selecting a model."),
 cycles:prompt("Repeating behaviour","Identify any supported cycle length, size of variation and baseline.","State what repeated features mean using the time or position units.","One rise and fall does not establish stable periodicity.","Check whether repeated cycles were actually observed."),
 trajectories:prompt("Trajectories and motion","Describe position or path within the coordinate system actually measured.","Relate the shape and parameters to the chosen time or distance variables.","A parabolic-looking plot is not proof of an ideal trajectory or a physical law.","Check calibration, perspective and relevant physical assumptions."),
 optimisation:TECHNIQUE_INTERPRETATIONS.optimisation,
 images:prompt("Image and shape measurements","Interpret the calculated size or boundary using the calibrated scale.","Explain the physical quantity represented by the traced or approximated outline.","Pixel counts and idealised boundaries are approximations, not exact geometry.","Check scale, perspective and sensitivity to boundary selection."),
 triangulation:TECHNIQUE_INTERPRETATIONS.triangulation,
 voronoi:TECHNIQUE_INTERPRETATIONS.voronoi,
 finance:prompt("Financial modelling","Explain which financial threshold, change or balance the result represents.","State the time period and the cost, rate or demand assumptions used.","A conditional model is not observed demand, guaranteed growth or proof of financial feasibility.","Test the assumption most likely to change the decision."),
 chance:prompt("Probability and simulation","Explain the event or expected outcome described by the calculation.","Distinguish theoretical probabilities from finite experimental or simulated frequencies.","Simulation results vary and do not automatically establish exact probabilities.","Check the model assumptions and variation between repeated runs."),
 proof:TECHNIQUE_INTERPRETATIONS.proof,
 iteration:prompt("Sequences and iteration","Describe what the calculated terms reveal and whether there is an established limit or cycle.","Explain the recurrence, starting value and parameter conditions.","A finite list of terms does not prove convergence or behaviour for every starting value.","Check fixed points, possible oscillation and whether a general argument is available.")
});
const GENERAL=prompt("Your mathematical result",
 "Identify the particular mathematical quantity, relationship or property your work establishes.",
 "Connect that finding to a named part of your investigation aim and give appropriate units or conditions.",
 "Do not claim more than the actual work establishes; distinguish observations from a general proof or a reliable prediction.",
 "Identify one assumption, mathematical check or restriction that could change your interpretation.");

/** Coverage is deliberately explicit so new method options cannot silently
 * inherit advice about another mathematical technique. */
export const INTERPRETATION_METHOD_KEYS=Object.freeze(Object.keys(TECHNIQUE_INTERPRETATIONS).filter(x=>x!=='scatter'));
export function resultInterpretationGuidance(state,entry){
 if(!done(entry))return null;
 const methodId=str(entry.methodId),methods=methodFamilies(entry);
 let key=INTERPRETATION_METHOD_KEYS.find(id=>methods.has(id))||'';
 let guide=key?TECHNIQUE_INTERPRETATIONS[key]:null,origin=key?'method':'';
 if(!guide&&methodId!=='other'&&entry.kind==='scatter'){
  guide=TECHNIQUE_INTERPRETATIONS.scatter;key='scatter';origin='representation';
 }
 if(!guide&&(!methodId||methodId==='follow-journey')){
  const route=selectedInvestigativeRoute(state);
  const plannedKind=str(state?.planning?.fields?.kind);
  const compatible=!plannedKind||plannedKind==='unsure'||route?.kinds?.includes(plannedKind);
  if(route&&compatible&&(entry.phase==='first'||methodId==='follow-journey')&&ROUTE_INTERPRETATIONS[route.id]){
   guide=ROUTE_INTERPRETATIONS[route.id];key=route.id;origin='planned-route';
  }
 }
 guide=guide||GENERAL;
 const needsReview=entry.reviewNeeded==='yes';
 const chosen=!needsReview?selectedJourneyOutcome(state,entry):null;
 // Legacy projects may have a confirmed method signal or scatter observation
 // without a newer journey outcome. Reuse the existing result-led coach rather
 // than silently losing the student's earlier decision.
 const legacy=!needsReview&&!chosen&&
  (str(entry.resultSignal)||(entry.kind==='scatter'&&str(entry.observation)))?
   routeAdvice(state,entry):null;
 return {
  ...guide,key:key||'general',origin:origin||'general',
  entryId:str(entry.id),result:str(entry.result),titleOfWork:str(entry.title),
  aim:str(state?.planning?.fields?.aim||state?.project?.aim),
  purpose:str(entry.purpose||entry.bridge),needsReview,
  selected:chosen?{title:chosen.title,check:chosen.check}:
   legacy?{title:legacy.heading,check:legacy.detail||legacy.essential}:null
 };
}

/** Collapsed by default: the writing box stays primary; detailed mathematics
 * appears at the moment a student chooses to consult it, also in Reduced mode.
 */
export function renderResultInterpretationAid(state,entry,{icon=defaultIcon,e=escapeHtml,reduced=false}={}){
 const g=resultInterpretationGuidance(state,entry);
 if(!g)return '';
 const current=(label,body)=>'<div class="result-insight-anchor"><strong>'+e(label)+'</strong><p>'+e(preview(body))+'</p></div>';
 const part=(label,value)=>'<div class="result-insight-step"><strong>'+e(label)+'</strong><p>'+e(value)+'</p></div>';
 const descriptor=g.origin==='planned-route'?'A question suggested by your planned route, not confirmation of a method used':
  g.origin==='general'?'General mathematical reading questions — no specific method was confirmed':
  'Method-specific support based on the mathematical work you recorded';
 return '<aside class="result-interpretation-aid'+(reduced?' is-reduced':'')+
  '" data-result-interpretation="'+e(g.key)+'" data-insight-source="'+e('result:'+g.entryId)+'">'+
  '<details class="result-interpretation-disclosure"><summary>'+
  icon('lightbulb')+'<span><strong>Help interpret: '+e(g.title)+'</strong>'+
  '<small>Meaning · Context · Limits · Check</small></span>'+icon('chevron-right')+
  '</summary><div class="result-interpretation-body">'+
  '<p class="result-interpretation-origin">'+e(descriptor)+'</p>'+
  (g.aim?current('Your investigation aim',g.aim):'')+
  current(g.needsReview?'Your recorded output — needs review':'Your recorded mathematical output',g.result)+
  (g.purpose?current('Your recorded mathematical purpose',g.purpose):'')+
  (g.needsReview?'<p class="result-interpretation-warning" role="note">An earlier change flagged this mathematical record for review. Verify the result and its links before relying on an interpretation.</p>':'')+
  '<div class="result-interpretation-steps">'+
  part('1. What the mathematics tells you',g.meaning)+
  part('2. Explain it using your actual quantities',g.context)+
  part('3. What this result does not establish',g.boundary)+
  part('4. One mathematical check worth considering',g.check)+
  '</div>'+
  (g.selected?'<div class="result-interpretation-outcome"><strong>Your selected description of this finding: '+e(g.selected.title)+'</strong>'+
   '<p>Before relying on that description, check: '+e(g.selected.check)+'</p></div>':'')+
  '<p class="result-interpretation-honesty">These are mathematical reading prompts, not findings extracted or verified from your result. Use your own quantities, conditions and working to write the interpretation in your IA document.</p>'+
  '</div></details></aside>';
}
