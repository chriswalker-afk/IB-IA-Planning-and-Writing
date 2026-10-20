/**
 * Adaptive, evidence-led mathematical journeys.
 *
 * Shared by first exploration and every subsequent mathematical stage. A
 * planning pathway is a context, NOT an observation. Only a student-confirmed
 * real result plus a student-chosen outcome unlocks outcome-specific advice.
 * All 16 editorial investigative routes use their existing route branches.
 * Guidance never invents data, guarantees a grade or requires a new technique.
 */
import {INVESTIGATIVE_ROUTES,routeById} from "../planning/investigative-routes.js";

const has=x=>typeof x==="string"&&!!x.trim();
export const actualMathematics=x=>x?.status==="completed"&&has(x.result);
const extra=(id,title,next,check,question,alternative)=>({id,signal:title,next,check,question,alternative});

/** Additional result descriptions where the original Planning branches are
 * too broad for a genuine second or third mathematical stage.
 * They are alternatives students may select, never inferred classifications. */
export const JOURNEY_OUTCOME_EXTRAS=Object.freeze({
 relationships:[
  extra("quadratic-looking","The graph may have a quadratic shape","A turning point or broadly parabolic shape makes a quadratic a candidate, not a conclusion. Compare its assumptions and residuals with the evidence.","Do not infer a quadratic from a short curve segment or fit one before checking scale and domain.","Would a quadratic model explain the observed shape within my measured domain?","Compare a simpler or differently shaped function only when there is a mathematical reason."),
  extra("not-quadratic","The curve is not convincingly quadratic","Describe what the curve actually does: increases monotonically, levels off, changes direction repeatedly or has distinct phases. Consider a mathematical family whose properties fit that behaviour.","A cubic, exponential or power model is not automatically better. Test relevant shape, domain and residuals.","Which function family could explain the observed non-quadratic behaviour?","Would describing the genuine pattern answer the aim without fitting another curve?")
 ],
 groups:[
  extra("different-shapes","The distributions differ in shape, not just centre","Compare skew, unusual values and useful quantiles rather than treating a mean difference as the whole result.","Check that both groups were measured comparably and that samples are representative.","Does comparing the distributions' shapes change my original group comparison?","Check whether the spread or sampling method explains the apparent difference.")
 ],
 categorical:[
  extra("few-observations","Categories contain very few observations","Examine denominators, category definitions and expected counts before interpreting an apparent difference.","Do not declare dependence or independence from unstable percentages or invalid tests.","Are the observed category differences meaningful with these sample sizes?","Would transparent descriptive proportions be more defensible than an invalid test?")
 ],
 variation:[
  extra("measurement-limited","Measurement precision may explain the apparent variation","Compare observed spread with the instrument's resolution and distinguish variation from uncertainty.","A consistent set of readings can still be systematically biased.","How much of the variation could be explained by measurement uncertainty?","Would repeated measurements or an independently calibrated method change the claim?")
 ],
 "fitted-models":[
  extra("quadratic-plausible","A quadratic looks plausible over the measured domain","A quadratic model may be justified if the curvature and parameter meanings are relevant. Fit and check residuals and comparison with an appropriate simpler model.","A visually smooth fit or high R-squared alone cannot establish correctness, causation or reliable extrapolation.","Do a quadratic model's residuals and parameters support using it for my aim?","What conclusion is valid inside the range actually observed?"),
  extra("not-quadratic","The shape does not look quadratic","Identify whether the change is monotonic, levelling off, periodically repeating or occurring in phases, then compare a function family supported by that behaviour.","Do not automatically raise the polynomial degree: extra coefficients may overfit the evidence.","What alternative function structure would be mathematically justified by this shape?","Could a restricted or piecewise model be more honest than one global polynomial?"),
  extra("competing","More than one model seems plausible","Compare residual structure, interpretability, parameter count and justified domain—not only a single fit statistic.","Equally good interpolation does not mean equally credible predictions.","Which model is most defensible for the question and the valid domain?","Would sensitivity or a separate test range discriminate between the models?")
 ],
 growth:[
  extra("saturating","Growth appears to slow or approach a limit","Test whether the changing rate and real constraints undermine constant-ratio exponential growth.","A visually levelling curve is not automatically a logistic model.","Does a model with a meaningful upper bound better represent this process?","Would a shorter justified domain permit a simpler growth model?")
 ],
 cycles:[
  extra("too-short","Too little data to establish a complete cycle","Record the limited period of observation and whether more cycles or independent evidence are available.","An isolated rise and fall does not establish periodicity.","Do the available observations support any reliable period estimate?","Would a non-periodic baseline or additional observations be more appropriate?")
 ],
 trajectories:[
  extra("non-parabolic","The observed trajectory is not convincingly parabolic","Check scale, perspective, timing and whether physical assumptions justify an ideal quadratic path.","Higher-order polynomial interpolation is not a substitute for a physical explanation.","Can calibration or a time-based representation explain why the path differs from a parabola?","Could the discrepancy itself be a meaningful limitation of the ideal model?")
 ],
 optimisation:[
  extra("flat-optimum","Several feasible choices perform almost equally well","Investigate how sensitive the objective is near the best value and whether constraints favour a robust choice.","A tiny numerical difference may be smaller than model or measurement uncertainty.","Is the proposed optimum meaningfully better than nearby feasible choices?","Would a robustness comparison improve the recommendation?")
 ],
 images:[
  extra("different-curves","Different plausible boundary curves give different areas","Compare appropriate curve choices or a simpler geometric estimate and evaluate their effect on area or length.","Traced pixels and fitted curves are approximations; resolution and calibration matter.","How sensitive is the measured quantity to the chosen boundary model?","Would decomposition or a numerical estimate be more defensible?")
 ],
 triangulation:[
  extra("inconsistent-angles","Repeated angular observations disagree","Compare independent measurements and estimate how angle uncertainty propagates through the trigonometric calculation.","A precise-looking numerical answer cannot exceed the quality of the angular measurements.","How much do plausible angle errors change the calculated distance or height?","Would a better baseline or second observation position reduce the uncertainty?")
 ],
 voronoi:[
  extra("ambiguous-boundary","The boundary changes when sites or coordinates change","Test sensitivity of cell boundaries to coordinate precision or the inclusion of plausible sites.","Cell area by itself is not demand or service quality.","How robust are the nearest-site regions to coordinate uncertainty?","Would actual travel routes or a demand-weighted measure be more relevant?")
 ],
 finance:[
  extra("models-conflict","Different cost or growth scenarios produce conflicting decisions","Identify which assumptions determine the result and compare a defensible range of rates, prices or demand.","Do not introduce invented demand or treat a forecast as observed fact.","Which uncertain assumption could change the financial recommendation?","Could a break-even threshold or cash-flow check clarify the decision?")
 ],
 chance:[
  extra("too-few-trials","The simulation is too small for a stable estimate","Examine variability between replications or compare with an exact probability argument where justified.","Simulated relative frequency is not guaranteed to equal theoretical probability.","How stable is the estimated probability across independent runs?","Would a theoretical calculation be more informative than simply adding runs?")
 ],
 proof:[
  extra("restricted-proof","The argument works only for some values or conditions","State the valid domain precisely and determine whether the proof can be extended or a counterexample exists outside it.","Never generalise a restricted proof without a logical argument.","For which values is my argument valid, and what fails outside them?","Would a revised theorem be a stronger and more accurate conclusion?")
 ],
 iteration:[
  extra("sensitive-start","Different starting values give different iterative behaviour","Compare orbits under justified starting values and look for fixed points, cycles or sensitive dependence.","Numerical stability is not proof of convergence for all starting values.","What makes the iteration behave differently for different initial values?","Can fixed-point reasoning or a counterexample explain the observations?")
 ]
});

/** Questions are tied to the *specific confirmed branch* instead of a generic
 * "what should I do next?" writing prompt. Ordering follows Planning branches. */
const QUESTIONS=Object.freeze({
 relationships:["Does a linear association meaningfully answer my question, or is a prediction needed?","What nonlinear structure explains the observed curvature?","Could subgroup differences or an influential observation change the interpretation?","What cautious conclusion follows from the absence of a convincing pattern?"],
 groups:["How large is the difference in typical outcomes relative to variation?","How do group spreads differ, and why does that affect comparison?","Would a justified statistical test change the conclusion about the groups?","Could sampling or measurement conditions explain the apparent group differences?"],
 categorical:["How do conditional proportions differ across well-defined categories?","Are the assumptions of an independence test satisfied here?","How might category definitions or the sample distort the apparent association?"],
 variation:["How does the observed variation compare with a meaningful threshold?","Would robust summaries change the interpretation of skew and spread?","How influential are the unusual values, and are they genuine?"],
 "fitted-models":["Do the model's parameters and residuals justify its use on the observed domain?","What mathematical feature do the patterned residuals reveal?","Why does this model fail at the boundaries or outside its valid range?"],
 growth:["Do successive differences justify an additive rather than multiplicative model?","Do ratios support proportional growth over the observed interval?","What explains the change from one growth pattern to another?"],
 cycles:["Do several observed cycles support a meaningful period and amplitude?","Can a trend and a repeating component be distinguished?","What evidence, if any, supports a periodic model?"],
 trajectories:["Is a quadratic trajectory justified by the measurements and assumptions?","What does position against time reveal about the motion?","How much does calibration or perspective change the estimated path?"],
 optimisation:["Is the stationary point the best feasible choice after all candidates are checked?","Is the best objective value achieved at a feasible boundary?","How sensitive is the preferred design to meaningful practical constraints?"],
 images:["What estimate follows from decomposing the object into known shapes?","Which curve structure best describes the calibrated outline?","How much can perspective and point selection change the estimate?"],
 triangulation:["What unknown distance can be derived from the measured triangle?","How consistent are separate triangulated estimates?","Which measurement uncertainty most affects the answer?"],
 voronoi:["Which site is nearest according to the chosen distance definition?","How does actual route access differ from the Euclidean diagram?","How would demand weights change the accessibility conclusion?"],
 finance:["How do repeated financial changes affect the final outcome?","Is break-even achievable under justified cost and sales assumptions?","Which plausible assumption most influences financial viability?"],
 chance:["How close are modelled and simulated frequencies given their variability?","Which assumption might explain the discrepancy from theory?","How should expected outcomes and risk influence a decision?"],
 proof:["Can the observed pattern be proved for every allowed case?","Which condition must change after the counterexample?","Can an underlying structural property provide a proof?"],
 iteration:["Is the apparent limit a fixed point, and can convergence be justified?","What explains the observed oscillation or divergence?","How do stopping criteria and rounding affect the estimate?"]
});

const uncertainty=(route)=>extra("uncertain","I cannot yet tell what this result establishes",
 "Revisit the actual output, units, assumptions and precision. A limited or negative conclusion is valid; never create a pattern to match your plan.",
 "Do not choose a more advanced method solely to make the investigation longer.",
 "What can I defensibly conclude from the evidence available so far?",
 "Would checking source quality or an assumption change the interpretation?");
const outcomeKey=(route,id)=>route+":"+id;
const activeRoute=state=>routeById(state?.planning?.routeExplorer?.selectedRoute||"");
export const selectedInvestigativeRoute=activeRoute;
export function journeyOutcomeOptions(state){
 const route=activeRoute(state);
 if(!route)return [];
 const base=route.branches.map((b,i)=>({
  id:b.id,value:outcomeKey(route.id,b.id),title:b.signal,
  next:b.next,check:b.check,question:QUESTIONS[route.id]?.[i]||route.question,
  alternative:"Would checking a key assumption materially change this finding?"
 }));
 const extras=JOURNEY_OUTCOME_EXTRAS[route.id]||[];
 return [...base,...extras,uncertainty(route)].map(x=>({
  ...x,value:outcomeKey(route.id,x.id),
  title:x.title||x.signal
 }));
}
export function selectedJourneyOutcome(state,entry){
 if(!actualMathematics(entry))return null;
 const route=activeRoute(state),choice=entry?.journeyOutcome||"";
 if(!route||!choice.startsWith(route.id+":"))return null;
 return journeyOutcomeOptions(state).find(x=>x.value===choice)||null;
}
export function journeySelectionIsStale(state,entry){
 return actualMathematics(entry)&&has(entry?.journeyOutcome)&&!selectedJourneyOutcome(state,entry);
}
export function priorStageFor(state,entry){
 if(!entry?.fromEntryId)return null;
 return state.entries?.find(x=>x?.id===entry.fromEntryId)||null;
}
/** Deliberately not a cryptographic hash: this is local revision detection,
 * allowing links on imported projects to be reviewed without deleting text. */
export function journeySourceSignature(state,entry){
 if(!entry)return "";
 const route=activeRoute(state)?.id||"";
 const json=JSON.stringify([route,entry.id,entry.status,entry.result,entry.journeyOutcome,
  entry.resultSignal,entry.observation,entry.localTakeaway,entry.interpretation]);
 let h=2166136261;
 for(let i=0;i<json.length;i++)h=Math.imul(h^json.charCodeAt(i),16777619);
 return (h>>>0).toString(16).padStart(8,"0");
}
export function needsJourneyLinkReview(state,child){
 const parent=priorStageFor(state,child);
 if(!child||!parent)return false;
 return child.reviewNeeded==="yes"||
  (has(child.journeySourceSignature)&&child.journeySourceSignature!==journeySourceSignature(state,parent));
}
function questionCard(id,question,why,check){
 return {id,question,why,check};
}
export function adaptiveNextDirections(state,entry){
 const route=activeRoute(state);
 if(!actualMathematics(entry))return{status:"unverified",route,chosen:null,directions:[]};
 if(!route)return{status:"no-route",route:null,chosen:null,directions:[]};
 const chosen=selectedJourneyOutcome(state,entry);
 if(!chosen)return{status:journeySelectionIsStale(state,entry)?"stale":"choose",route,chosen:null,directions:[]};
 const base=questionCard("follow",chosen.question,chosen.next,chosen.check);
 const alternative=questionCard("check",
  chosen.alternative||"Would testing a key assumption change this interpretation?",
  "Investigate only if this would change the original question or the reliability of the result.",
  chosen.check);
 return{status:"ready",route,chosen,directions:[base,alternative],
  stop:"If the mathematical evidence already answers your aim sufficiently, you can conclude instead of adding an unnecessary technique."};
}
export function stageLinkContext(state,entry){
 const prior=priorStageFor(state,entry);
 const advice=prior?adaptiveNextDirections(state,prior):null;
 return {prior,advice,needsReview:needsJourneyLinkReview(state,entry),
  finding:prior?(prior.localTakeaway||prior.interpretation||prior.observationText||prior.result||""):""};
}
/** Updating an earlier route is a change of advice context, not permission to
 * rewrite mathematics or silently accept a stale descendant. */
export function flagJourneyRouteDependents(state,previousRoute){
 const current=activeRoute(state)?.id||"";
 if(previousRoute===current)return 0;
 let count=0;
 for(const item of state.entries||[]){
  if(!item||!has(item.journeyOutcome)&&!has(item.journeySourceSignature))continue;
  if(item.fromEntryId||item.phase==="substantial"){
   item.reviewNeeded="yes";
   item.reviewReason="The investigative journey changed. Recheck whether the earlier outcome still supports this mathematical stage.";
   count++;
  }
 }
 if(count&&state.completion?.stages){
  for(const node of ["C40","C60"])if(state.completion.stages[node]==="complete")
   state.completion.stages[node]="needs-review";
 }
 return count;
}
