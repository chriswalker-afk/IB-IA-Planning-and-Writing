/**
 * Optional alternative evidence routes for the current IB Mathematics A–E IA criteria.
 *
 * These are conditional opportunities, never a checklist, mark prediction or requirement
 * to use a technique. Content is editorially authored; no user result is generated.
 */
import {courseLevel} from "./catalog.js";
import {routeById} from "../planning/investigative-routes.js";
import {methodFamilies} from "../completing/method-identity.js";
import {completeEntry,sourceResultForNext} from "../completing/engine.js";

const item=(title,how)=>Object.freeze({title,how});
const profile=(C,D,E)=>Object.freeze({C:Object.freeze(C),D:Object.freeze(D),E:Object.freeze(E)});

export const OTHER_CRITERION_PATHS=Object.freeze({
 relationships:profile(
  [item("An evidence-led question","If your genuine scatter suggests a new feature, choose to investigate it and explain why that decision changes your investigation."),
   item("A mathematical comparison of viewpoints","If grouping or an unusual observation matters, decide independently to examine the groups or influential point without deleting inconvenient data."),
   item("A reasoned change of technique","If the shape is not approximately linear, justify why you explored an alternative to Pearson correlation rather than automatically calculating it.")],
  [item("Check how secure the association is","Where appropriate, examine the effect of a defensibly identified influential observation on the conclusion; retain and explain authentic data."),
   item("Interpret the actual graph and statistic together","If a coefficient and scatter appear to disagree, explain what the graph reveals and what the statistic does and does not measure."),
   item("Limit what can be inferred","Distinguish linear association from causation and explain how the actual sampling design restricts the claim.")],
  [item("Justify the mathematical measure","Explain why the observed shape and variable types make the chosen coefficient or model suitable; calculate and interpret it correctly."),
   item("Validate an optional fitted model","If prediction is relevant, inspect residuals and the observed domain rather than treating a regression output as proof."),
   item("Check a meaningful claim independently","Where useful, verify a calculated gradient, coefficient or fitted prediction by a second mathematical step.")]),
 groups:profile(
  [item("Choose a meaningful mathematical comparison","Decide whether differences in centre, spread or shape matter most for your original question, rather than reporting every statistic."),
   item("Investigate an unexpected feature","If a genuine subgroup or unusual distribution emerges, justify a new comparison and how it changes your interpretation."),
   item("Design a fair comparison","Explain your own choice of comparable groups, scale or measurement conditions when that choice materially shapes the mathematics.")],
  [item("Look beyond averages","If groups have similar means, examine whether their variability or shapes support a different interpretation."),
   item("Evaluate a robust comparison","When an unusual observation affects a mean, compare the effect of a defensible alternative such as median or interquartile range."),
   item("Respect the sample","Explain which population and sampling conditions the observed differences do—and do not—justify claims about.")],
  [item("Calculate the relevant summaries correctly","Show enough work to establish means or medians, measures of spread and their interpretation."),
   item("Justify any formal test","Only where permitted and suitable, identify hypotheses, assumptions and mathematical meaning; a p-value alone does not explain an outcome."),
   item("Use comparable representations","Use common axes, units and scales where relevant so the statistical comparison is mathematically valid.")]),
 categorical:profile(
  [item("Define categories purposefully","Justify categories and the comparison you chose to investigate, considering whether a different grouping would address the aim better."),
   item("Explore an independently noticed imbalance","If a genuine difference between groups appears, choose a meaningful conditional comparison rather than just highlighting the largest count.")],
  [item("Check the denominator","Recalculate an interpretation with the relevant row or column totals when raw counts could be misleading."),
   item("Evaluate the classification","Consider how missing responses, category definitions or sampling may change what the comparison establishes.")],
  [item("Show conditional proportions accurately","Use an interpretable two-way table and the correct denominators before making a mathematical claim."),
   item("Justify a possible independence test","If such a test is appropriate to the course and data, check independence and expected-count assumptions rather than applying it mechanically.")]),
 model:profile(
  [item("Develop a model from evidence","Choose, modify or reject a mathematical structure because of an observed pattern, not because a particular function seems impressive."),
   item("Design a purposeful model check","If residuals or a prediction matter to your aim, select a test that could distinguish between plausible models."),
   item("Explore a meaningful alternative","If a model fails in a consequential way, justify a new assumption, domain or mathematical approach.")],
  [item("Read the residuals, not only the fit score","If actual residuals have structure, explain why that questions an otherwise small error value."),
   item("Test a consequential assumption","If a parameter, calibrated measurement or boundary is uncertain, investigate how a justified change affects the answer."),
   item("Evaluate the domain","Distinguish a justified interpolation from an unsupported extrapolation; a good fit does not guarantee a physical explanation.")],
  [item("Explain how the model was obtained","Derive or fit parameters with enough mathematical detail to demonstrate understanding of the chosen approach."),
   item("Use a genuine validation check","Where useful, compare predictions with actual data, residuals, or a second sound mathematical check."),
   item("Justify the mathematical model's scope","Define variables, units, conditions and the domain; explain why this structure is mathematically appropriate.")]),
 optimisation:profile(
  [item("Choose a defensible objective","Explain why the mathematical quantity you optimise is the one that matters for your investigation."),
   item("Refine a design mathematically","Where genuinely useful, develop or compare constraints or an alternative objective rather than merely repeating differentiation."),
   item("Challenge an apparent optimum","If a practical constraint contradicts the first result, use that insight to shape a new mathematical question.")],
  [item("Evaluate all feasible candidates","Check relevant endpoints or limiting cases and explain why a stationary point is not automatically the global optimum."),
   item("Test sensitivity to constraints","Where a dimension or boundary is uncertain, examine whether its justified variation changes the optimum significantly."),
   item("Separate model and reality","Explain the impact of assumptions such as material thickness, cost or stability if they affect the intended recommendation.")],
  [item("Justify the optimisation fully","Specify the objective, feasible domain, candidates, sign or other rigorous test and a supported extremum."),
   item("Validate the critical value","Check units and plausibility and, where useful, compare with a graph or another mathematical argument."),
   item("Generalise when it clarifies the aim","If appropriate, show how the optimum depends on a parameter without introducing complexity for display.")]),
 geometry:profile(
  [item("Create an original geometric construction","Explain a purposeful choice of representation, coordinate system or geometric decomposition."),
   item("Investigate an alternative measurement","If different viewpoints or decompositions give genuinely different outcomes, explore why this happens.")],
  [item("Examine measurement sensitivity","If calibration, angles or scale are uncertain, assess the effect on the final geometric quantity."),
   item("Test the geometric assumptions","Explain whether the planar model, viewing angle or geometry of the actual situation supports the result.")],
  [item("Make the construction reproducible","Define axes, units, angles and geometric conditions and justify the relationships used."),
   item("Cross-check the geometric calculation","Where appropriate, use a second trigonometric or geometric relation or a repeat measurement to validate the result.")]),
 voronoi:profile(
  [item("Choose a meaningful notion of nearness","Independently justify why the selected sites, domain and distance metric represent the question you are asking."),
   item("Explore a genuine change in configuration","If a service point or site moves, investigate how the region boundaries change and why that matters to your aim.")],
  [item("Challenge the distance assumption","Explain what Euclidean proximity establishes and why it may differ from travel time or practical access."),
   item("Consider stability of the regions","Where meaningful, test whether a small change in site position, study boundary or distance metric materially affects the answer.")],
  [item("Justify boundaries mathematically","Use perpendicular bisectors, equidistance or a clear construction, with a defined coordinate system and domain."),
   item("Check region membership","Where useful, calculate distances at selected boundary or interior points rather than relying on an unlabelled software diagram.")]),
 finance:profile(
  [item("Design a genuine decision model","Explain why the chosen rate, repayment period or comparison answers your specific question."),
   item("Investigate a relevant alternative","Independently choose to compare a different term, rate convention or scenario when it would affect the decision.")],
  [item("Check the effect of changing assumptions","If fees, inflation, rates or timing could change the decision, quantify a plausible variation rather than listing generic limitations."),
   item("Respect model scope","Explain which conclusions depend on fixed rates or other idealisations and which remain supported.")],
  [item("Derive or explain the model","Show how compound-growth, annuity or cash-flow expressions represent the agreed time intervals and assumptions."),
   item("Make a fair financial comparison","Use the same time horizon, consistent compounding and correctly interpreted effective amounts or rates."),
   item("Validate a numerical outcome","Where helpful, test a limiting or simple case or reconstruct an initial repayment or balance.")]),
 probability:profile(
  [item("Construct your own cases or simulation","Choose a sample space, events or purposeful experiment that addresses a mathematical question you identified."),
   item("Investigate an unexpected difference","If a genuine simulation and theoretical result differ, decide whether more trials or a different model is worth examining.")],
  [item("Compare theory with a real simulation","Separate theoretical probability from observed relative frequency; explain possible sampling variation without pretending a simulation proves the exact value."),
   item("Evaluate independence and assumptions","If the model depends on independence, fairness or other conditions, explain how a change affects the conclusion.")],
  [item("Justify a sample space or distribution","Show why outcomes are equally likely where assumed, or why a selected distribution suits the event."),
   item("Validate the calculation","Use exact reasoning, a complementary probability or another appropriate check, distinguishing it from approximate simulation.")]),
 proof:profile(
  [item("Create and test a conjecture","Make your own precise mathematical prediction from observations or examples, then choose how to investigate it."),
   item("Construct a meaningful counterexample","If a conjecture fails, design a counterexample or refine the statement and explain how that changes your investigation."),
   item("Explore a different mathematical perspective","Where useful, try a diagram, algebraic argument or alternative structure to understand why the result holds.")],
  [item("Assess the exact scope of a proof","State the domain and hypotheses under which the conclusion holds, and identify cases not established."),
   item("Learn from a failed conjecture","Explain precisely how a genuine counterexample or exceptional case changes the claim."),
   item("Compare arguments critically","If you have different valid approaches, discuss what one reveals or establishes beyond the other.")],
  [item("Build a rigorous argument","Write logical steps with definitions, hypotheses and valid implications rather than claiming a general rule from examples."),
   item("Establish or restrict a generalisation","If appropriate, prove the statement for a wider domain or give a clear counterexample to an over-generalised claim."),
   item("Validate the logic","Check necessary cases and any hidden assumptions; an independent example is a useful check, not a replacement for proof.")]),
 iteration:profile(
  [item("Investigate different initial conditions","Where the recurrence invites it, independently choose initial values or a parameter to explore a worthwhile mathematical question."),
   item("Form a conjecture from patterns","Distinguish experimental patterns from an eventual mathematical proof of convergence or a fixed point.")],
  [item("Question an apparent limit","Explain why a few close decimal values alone do not establish convergence."),
   item("Examine dependence on the starting point","If relevant, test whether changing an allowed initial value alters convergence or stability.")],
  [item("Justify convergence where necessary","Derive a possible fixed point and give an argument about convergence or the domain of validity rather than inferring it from a spreadsheet."),
   item("Evaluate numerical accuracy","Where appropriate, bound or estimate iterative error and explain stopping criteria.")]),
 numerical:profile(
  [item("Design an appropriate numerical check","Choose step size, partition or approximation rule because it addresses a genuine accuracy or modelling question."),
   item("Investigate a different approximation","Where relevant, independently compare two strategies and explain what the difference reveals.")],
  [item("Test sensitivity to the step size","Check whether reasonable refinements materially change the result and what this implies for reliability."),
   item("Distinguish approximation from equality","Explain the consequence of discretisation or rounding when it affects the final claim.")],
  [item("Show the numerical mathematics","Define the interval, algorithm, units, parameters and enough work to demonstrate understanding."),
   item("Validate the approximation","Where possible, compare successive refinements, a bound or a known mathematical case.")]),
 general:profile(
  [item("Pursue a student-owned mathematical question","Explain a genuine conjecture, comparison or methodological decision that changed the investigation."),
   item("Develop a different mathematical perspective","If appropriate, compare two defensible approaches and explain what you learned from choosing between them.")],
  [item("Test the consequence of a limitation","Where there is an important mathematical assumption or uncertainty, investigate its implications for the claim."),
   item("Evaluate a meaningful alternative","Explain what an independently justified comparison or counterexample reveals about your earlier result.")],
  [item("Justify mathematical reasoning","Show the key intermediate steps, definitions and conditions needed for a reader to follow a correct argument."),
   item("Check a mathematical conclusion","Where useful, verify a calculation, test a boundary case or explain why a generalisation follows.")])
});

const ROUTE_PROFILES=Object.freeze({
 relationships:"relationships",groups:"groups",categorical:"categorical",variation:"groups",
 "fitted-models":"model",growth:"model",cycles:"model",trajectories:"model",
 optimisation:"optimisation",images:"geometry",triangulation:"geometry",
 voronoi:"voronoi",finance:"finance",chance:"probability",proof:"proof",iteration:"iteration"
});
const checked=e=>e?.status==="completed"&&typeof e.result==="string"&&!!e.result.trim()&&e.reviewNeeded!=="yes";
const methodMap=Object.freeze({
 "pmcc":"relationships","spearman":"relationships",
 "two-sample-t":"groups","normal":"groups",
 "chi-independence":"categorical","chi-fit":"categorical",
 "probability":"probability","binomial":"probability","expected-value":"probability",
 "linear-regression":"model","quadratic-fit":"model","exponential":"model","sinusoidal":"model",
 "power":"model","rates-from-data":"model",
 "optimisation":"optimisation","geometric-model":"geometry","voronoi":"voronoi","triangulation":"geometry",
 "finance-break-even":"finance","finance-compound":"finance","finance-loan":"finance","finance-cashflow":"finance",
 "numerical-integration":"numerical","proof":"proof","algebra":"proof"
});

function selectedEntry(state,node){
 const entries=Array.isArray(state?.entries)?state.entries:[];
 if(["C60","C61","C62","C63","C64"].includes(node))return entries.filter(checked).at(-1)||null;
 if(["C35","C35H","C35B","C35P"].includes(node))return sourceResultForNext(state);
 if(node==="N01V"||node==="N02M"||node==="C10"||node==="C20")return null;
 return completeEntry(state);
}
export function criterionOpportunityProfile(state,key){
 const [surface,node]=String(key||"").split(":");
 const entry=selectedEntry(state,node);
 const method=methodFamilies(entry,{allowPlanned:true});
 for(const id of Object.keys(methodMap))if(method.has(id))return methodMap[id];
 // An explicit "Other" method choice should not be overridden by an earlier planning route.
 if(entry?.methodId==="other")return "general";
 const direct=entry?.methodId;
 if(direct&&!["follow-journey"].includes(direct))return "general";
 const route=routeById(state?.planning?.routeExplorer?.selectedRoute);
 const kind=state?.planning?.fields?.kind||state?.project?.kind;
 if(route&&(!kind||route.kinds.includes(kind)))return ROUTE_PROFILES[route.id]||"general";
 if(entry?.kind==="theory"||kind==="theoretical")return "proof";
 if(entry?.kind==="scatter")return "relationships";
 if(kind==="statistics")return "groups";
 if(kind==="modelling")return "model";
 return "general";
}

const LEVEL_NOTES=Object.freeze({
 SL:"For SL, use relevant mathematics appropriate to your own course correctly, and make your understanding visible through explanation and meaningful checks. More advanced techniques are not required simply to obtain high marks.",
 HL:"For HL, give precise, justified mathematics with appropriate sophistication and rigour. That might involve a clear proof, a well-justified generalisation, a meaningful connection or a rigorous model check. Mathematics beyond the syllabus is not required for the highest marks.",
 unknown:"Confirm the applicable SL or HL assessment descriptors with your teacher. In either course, clear justification, correct mathematics and genuine understanding matter more than the number of techniques."
});
const RELEVANT_NODES=new Set([
 "N01V","N02M","C10","C20","C21S","C21M","C21T","C22","C23",
 "C30","C31","C32","C33","C34","C34B","C35","C35B","C35P","C35H",
 "C40","C50","C40T","C40D","C40L","C60","C61","C62","C63"
]);
/** Pure, read-only suggestion selector; use only with the existing C/D/E contextual bubbles. */
export function criterionAlternativeOpportunities(state,key,advice){
 const [surface,node]=String(key||"").split(":");
 const criterion=advice?.criterion;
 if(!["planning","completing"].includes(surface)||!RELEVANT_NODES.has(node)
   ||!["C","D","E"].includes(criterion)||Array.isArray(advice?.criteria))
  return null;
 const entry=selectedEntry(state,node),profileId=criterionOpportunityProfile(state,key);
 const current=OTHER_CRITERION_PATHS[profileId]||OTHER_CRITERION_PATHS.general;
 const level=criterion==="E"?courseLevel(state):"";
 const confirmed=checked(entry);
 const prospective=surface==="planning"||!confirmed;
 return Object.freeze({
  criterion,profile:profileId,level:level||"unknown",
  status:prospective?"possible":"based-on-completed-work",
  items:current[criterion],
  levelNote:criterion==="E"?LEVEL_NOTES[level||"unknown"]:"",
  reminder:prospective?
   "These are possibilities, not evidence of completed mathematics. Choose only an approach that serves your question; carry it out and explain it in your actual IA if it becomes worthwhile.":
   "These are alternative ways to develop your actual mathematics, not a checklist. Use only a genuine, worthwhile decision, evaluation or argument that is visible in your IA. No additional stage is compulsory."
 });
}
