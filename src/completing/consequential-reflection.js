/**
 * Examiner feedback Pass 3 — a single, optional mathematical challenge
 * inside the existing validity disclosure, not another writing box.
 *
 * Read only the validity context of the current real mathematical stage.
 * No parsing of student prose to guess a result, no fabricated sensitivity
 * calculation, no automatic claim that a model or assumption is reliable.
 */
const cue=(change,compare,tool="")=>Object.freeze({change,compare,tool});

export const CONSEQUENCE_CHECKS=Object.freeze({
 pmcc:cue(
  "Verify any apparently influential (x, y) pair against the original source. If a sensitivity comparison is justified, calculate the association with the genuine full dataset and a clearly labelled alternative.",
  "Compare the direction and magnitude of r, not just whether an isolated coordinate seems extreme. Retain the original data and justify any exclusion.",
  "Graph Studio"),
 spearman:cue(
  "Inspect ties and the complete (x, y) pairs in the original scatter. If a verified influential pair matters, compare the rank calculations with a clearly identified alternative.",
  "Compare the rank association and any change in the interpretation of the aim; do not discard inconvenient observations.",
  "Graph Studio"),
 "linear-regression":cue(
  "Choose one defensible model assumption or genuinely influential paired observation to challenge, while preserving the original data and fitted line.",
  "Recalculate a relevant coefficient, predicted value or residual error on the same defined range; explain whether the conclusion or prediction changes.",
  "Graph Studio"),
 "quadratic-fit":cue(
  "Compare one justified alternative functional form, fit or constraint, using the same observed points and input domain.",
  "Compare original-scale residuals and the model's meaningful parameters or turning point, not R² alone.",
  "Graph Studio"),
 exponential:cue(
  "Investigate whether a plausible change in the assumed growth factor or time interval changes your fitted or theoretical prediction.",
  "Compare predictions at the same time point and check whether the new value remains supported by the observations.",
  "Graph Studio"),
 sinusoidal:cue(
  "Test one plausible change in period, amplitude or baseline against the observed cycles.",
  "Compare the resulting prediction or residual pattern within the observed interval; a single apparent cycle cannot prove long-term periodicity.",
  "Graph Studio"),
 power:cue(
  "Check a defensible scaling or exponent alternative while preserving the original observed data.",
  "Compare predictions and errors on the original scale and within the valid positive domain.",
  "Graph Studio"),
 optimisation:cue(
  "Change one justified parameter or constraint, then recompute all feasible candidates including boundaries.",
  "Compare the optimal value, objective and feasibility; explain whether the practical recommendation survives the change."),
 "geometric-model":cue(
  "Vary one measured dimension or idealised boundary by a justified uncertainty or alternative shape assumption.",
  "Recalculate the relevant length, area or volume in the same units and test whether the reported conclusion materially changes.",
  "Geometry & Measurements"),
 triangulation:cue(
  "Change one measured baseline or angle by a defensible instrument or source uncertainty, keeping the original measurement.",
  "Recalculate the derived quantity and compare its change with the precision and purpose of the original result.",
  "Geometry & Measurements"),
 voronoi:cue(
  "Test a defensible change to one site, boundary or distance metric, keeping the original site arrangement for comparison.",
  "Check whether a particular nearest-site region or location decision changes; straight-line distance may not represent real travel.",
  "Voronoi Studio"),
 normal:cue(
  "Change one justified model parameter while holding the event and other parameters fixed. Keep the original distribution unchanged until you intentionally compare alternatives.",
  "Compare the probabilities of the same event, noting whether each parameter is measured, estimated or hypothetical.",
  "Probability Distribution Studio"),
 binomial:cue(
  "Change one justified trial count or success probability while preserving the precise event definition and original scenario.",
  "Compare the resulting event probabilities and decide whether the interpretation changes; do not present a scenario as observed data.",
  "Probability Distribution Studio"),
 "two-sample-t":cue(
  "Recheck the chosen test variant, independence and distribution assumptions using the genuine group data. If a defensible alternative is warranted, label it clearly.",
  "Compare the estimated group difference and uncertainty, not only which side of the significance threshold the p-value falls on."),
 "chi-independence":cue(
  "Inspect observed and expected cell counts and the independence assumption. If category definitions genuinely need revision, justify them before recalculating.",
  "Compare whether the evidence of association remains defensible; never regroup categories or rerun tests simply to obtain significance."),
 "chi-fit":cue(
  "Check how the hypothesised category probabilities and groups were justified, along with expected counts and the test's degrees of freedom.",
  "If a defensible model or grouping alternative exists, compare test conditions and interpretation without treating a non-significant result as proof."),
 probability:cue(
  "Challenge one clearly stated event, conditional probability or independence assumption, while keeping the original event definitions available.",
  "Recalculate the same requested probability where mathematically appropriate; explain how the inference depends on the assumption.",
  "Probability Tree Studio"),
 "expected-value":cue(
  "Change one defensible outcome probability or payoff while retaining the original scenario and total probability of one.",
  "Recalculate expected value and, where relevant, the risk of an unacceptable outcome; decide whether the choice changes.",
  "Probability Distribution Studio"),
 "finance-break-even":cue(
  "Vary one justified cost, price or capacity constraint without replacing the original budget.",
  "Recalculate break-even, check whether it remains feasible and assess whether the decision changes."),
 "finance-compound":cue(
  "Vary one plausible rate, compounding frequency or time assumption while retaining the original calculation.",
  "Compare final values and explain whether the financial interpretation is robust within those assumptions."),
 "finance-loan":cue(
  "Test one plausible change in the periodic interest rate or repayment term.",
  "Recalculate periodic payment and total lifetime cost, not just the lower monthly instalment."),
 "finance-cashflow":cue(
  "Change a plausible timing or amount of one cash receipt or payment.",
  "Recalculate the minimum intermediate balance and when a cash shortfall begins, not just the final balance."),
 "numerical-integration":cue(
  "Repeat the approximation with a justified finer partition or a method suited to the same integrand.",
  "Compare estimates and convergence without claiming that agreement proves the exact integral."),
 "rates-from-data":cue(
  "Compare a different defensible interval width or treatment of measurement noise without changing the original observations.",
  "Compare estimated rates in the same units and consider whether a claimed instantaneous rate is justified.",
  "Graph Studio"),
 proof:cue(
  "Test the boundary of the stated domain, a special case or a plausible counterexample to the original conjecture.",
  "If the claim survives, explain the general logical step that proves it; numerical examples alone never establish a universal proof."),
 algebra:cue(
  "Check a domain boundary, excluded denominator or substitution introduced by your algebraic transformations.",
  "Substitute candidates into the original statement and explain which solutions remain valid.")
});

const str=x=>typeof x==="string"?x.trim():"";
/** Does not infer findings from free text. Accepts only a real, review-free
 * mathematical-validity context produced by mathematicalValidityContext. */
export function consequentialReflectionCue(context){
 if(!context||context.needsReview||!str(context.result)||!str(context.entryId))return null;
 const method=str(context.method),specific=Object.hasOwn(CONSEQUENCE_CHECKS,method)?
  CONSEQUENCE_CHECKS[method]:null;
 const hasLimitation=!!str(context.recordedLimitation)||
  (Array.isArray(context.confirmedLimitations)&&context.confirmedLimitations.length>0);
 if(!specific&&!hasLimitation)return null;
 const chosen=specific||cue(
  "Choose one important limitation you actually recorded, and vary only a plausible input, condition or domain restriction.",
  "Compare the original and changed result with a relevant mathematical quantity; if nothing can be tested, explain the honest restriction instead.");
 const linkedGraph=(context.figures||[]).some(x=>x.kind==="graph"&&x.ready===true);
 return Object.freeze({entryId:context.entryId,method,
  change:chosen.change,compare:chosen.compare,tool:chosen.tool,
  linkedGraph,hasLimitation});
}

export function renderConsequentialReflectionCue(context,{icon=()=>"",e=x=>String(x),reduced=false}={}){
 const check=consequentialReflectionCue(context);
 if(!check)return "";
 return '<div class="math-validity-row consequential-reflection-cue'+(reduced?' is-reduced':'')+
  '" data-consequential-reflection="'+e(check.entryId)+'">'+
  '<strong>One mathematical way to test the consequence (optional)</strong>'+
  '<p><b>What to vary:</b> '+e(check.change)+'</p>'+
  '<p><b>What to compare:</b> '+e(check.compare)+'</p>'+
  (check.linkedGraph&&check.tool==="Graph Studio"?
   '<p>There is an explicitly linked saved graph for this stage. You can inspect its original data and diagnostics before trying a labelled comparison; a saved fit is not proof of predictive accuracy.</p>':"")+
  (check.tool?
   '<p>When helpful, use the existing '+e(check.tool)+' to explore an alternative. Keep the original and the changed scenario distinct.</p>'+
   '<button type="button" class="btn btn-secondary btn-sm" data-action="completion-open" data-node="C31">'+
   icon("layers")+' Open diagram &amp; table tools</button>':"")+
  '<p class="math-validity-honesty">Use a genuine result and one justified change. Record any numerical difference and its meaning in your existing reflection or actual IA; no extra paragraph is required. A hypothetical comparison is not new evidence and no sensitivity value has been calculated here.</p>'+
  '</div>';
}
