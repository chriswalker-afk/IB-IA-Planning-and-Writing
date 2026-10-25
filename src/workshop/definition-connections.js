/** Editorial concept links for Maths Workshop.
 * A curated network of meaningful mathematical relationships, not fuzzy search,
 * student-specific recommendations, or inferred syllabus requirements.
 * An optional sampling hub shows the full method family in small labelled groups.
 */
import {WORKSHOP_DEFINITIONS,definitionById} from "./catalog.js";

const group=(title,hub,ids)=>Object.freeze({title,hub,ids:Object.freeze(ids)});
export const DEFINITION_CONNECTION_GROUPS=Object.freeze([
 group("Sampling foundations","sampling",["sampling","population","sample","sampling-unit","observational-unit","sampling-frame","census","sample-size"]),
 group("Probability sampling methods","sampling",["sampling","probability-sampling","simple-random-sample","stratified-sample","systematic-sample","sampling-interval","cluster-sample"]),
 group("Non-probability sampling methods","sampling",["sampling","nonprobability-sampling","convenience-sample","quota-sample","voluntary-response-sample"]),
 group("Quality of a sample","sampling",["sampling","representative-sample","selection-bias","nonresponse-bias","sampling-variability","sample-size"]),
 group("Centre and spread","mean",["mean","median","standard-deviation","quartile","interquartile-range","outlier","skewness"]),
 group("Distributions and diagrams","frequency",["frequency","histogram","frequency-density","box-plot","quartile","interquartile-range","skewness"]),
 group("Categorical comparisons","categorical-variable",["categorical-variable","two-way-table","conditional-proportion","percentage-point","frequency","conditional-probability"]),
 group("Paired data and association","correlation",["paired-data","correlation","rank","tied-rank","spearman-rho","monotonic-association","regression-line"]),
 group("Linear regression","regression-line",["model","parameter","regression-line","gradient","intercept","centred-sums","least-squares","fitted-value"]),
 group("Residual checks","residual",["residual","residual-plot","residual-pattern","sum-squared-errors","rmse","r-squared","influential-observation","holdout-data"]),
 group("Comparing models","nonlinear-regression",["nonlinear-regression","quadratic-model","exponential-model","transformed-regression","log-transformation","holdout-data","overfitting","rmse"]),
 group("Scope and reliability of models","model",["model","domain","extrapolation","parameter","feasible-domain","holdout-data","overfitting"]),
 group("Quadratic functions","quadratic-model",["quadratic-model","vertex-form","quadratic-roots","discriminant","stationary-point","global-extremum","feasible-domain"]),
 group("Exponential growth and logs","exponential-model",["exponential-model","logarithm","log-transformation","doubling-time","half-life","compound-interest"]),
 group("Periodic functions","period",["amplitude","period","midline","phase-shift","angular-frequency"]),
 group("Rates and differentiation","derivative",["derivative","average-rate","instantaneous-rate","second-derivative","stationary-point","initial-condition"]),
 group("Integration and accumulation","definite-integral",["definite-integral","antiderivative","signed-area","initial-condition","average-rate"]),
 group("Optimisation and constraints","objective-function",["constraint","objective-function","feasible-domain","global-extremum","stationary-point","derivative","capacity-constraint"]),
 group("Measurement quality","uncertainty",["uncertainty","instrument-resolution","repeated-measurement","rounding-interval","random-error","systematic-error","relative-uncertainty","significant-figures","reliability","validity"]),
 group("Bounds and sensitivity","sensitivity-analysis",["uncertainty","sensitivity-analysis","worst-case-bounds","sensitivity-check","relative-uncertainty","significant-figures","financial-scenario"]),
 group("Images and coordinate calibration","calibration-factor",["pixel-coordinate","image-origin","reference-length","calibration-factor","scale-factor","perspective-distortion","area-scale","dimensional-units"]),
 group("Triangulation and bearings","baseline",["baseline","bearing","interior-angle","sine-rule","cosine-rule","triangle-area","euclidean-distance"]),
 group("Areas and units","triangle-area",["triangle-area","composite-region","cross-section-volume","area-scale","dimensional-units","scale-factor"]),
 group("Voronoi constructions","voronoi-cell",["voronoi-cell","voronoi-boundary","voronoi-vertex","perpendicular-bisector","locus","euclidean-distance","distance-metric"]),
 group("Compound interest and annual rates","compound-interest",["finance-principal","simple-interest","compound-interest","nominal-interest-rate","periodic-interest-rate","compounding-frequency","effective-annual-rate","future-value-finance","interest-earned"]),
 group("Loan repayments","loan-amortisation",["loan-balance","payment-amount","loan-amortisation","interest-component","principal-component","negative-amortisation","loan-term","periodic-interest-rate","finance-principal"]),
 group("Profit and break-even","profit-function",["revenue-function","fixed-cost","variable-cost","contribution-margin","break-even-point","profit-function","capacity-constraint","financial-threshold"]),
 group("Cash flow and liquidity","cash-balance",["cash-inflow","cash-outflow","net-cash-flow","cash-balance","liquidity-shortfall","loan-balance"]),
 group("Discounting future cash flows","net-present-value",["time-value-of-money","discount-rate","present-value-finance","net-present-value","cash-inflow","cash-outflow"]),
 group("Financial decisions under uncertainty","financial-scenario",["financial-scenario","financial-threshold","sensitivity-analysis","profit-function","capacity-constraint","net-present-value"]),
 group("Events and their probabilities","probability",["probability","event","sample-space","complement-event","intersection-event","disjoint-events","independent-events"]),
 group("Conditional events and trees","conditional-probability",["conditional-probability","joint-probability","independent-events","probability-tree","intersection-event","conditional-proportion"]),
 group("Random variables and expectation","discrete-random-variable",["discrete-random-variable","probability-distribution","expected-value","expected-net-value","discrete-variance","probability"]),
 group("Probability and simulation","monte-carlo-simulation",["theoretical-probability","simulated-trial","relative-frequency","monte-carlo-simulation","random-number-seed","law-of-large-numbers","sampling-variability"]),
 group("Binomial trials","binomial-distribution",["bernoulli-trial","binomial-distribution","combination-count","cumulative-probability","probability-distribution","independent-events"]),
 group("Normal models","normal-distribution",["normal-distribution","standard-score","probability-density","cumulative-probability","probability-distribution"]),
 group("Evidence and inference","null-hypothesis",["null-hypothesis","alternative-hypothesis","p-value","significance-level","type-i-error","practical-significance","confidence-interval","sampling-variability"]),
 group("Conjectures and counterexamples","conjecture",["conjecture","counterexample","universal-claim","existential-claim","counterexample-domain","mathematical-proof","deductive-reasoning"]),
 group("Logic and proof methods","mathematical-proof",["implication-converse","necessary-condition","sufficient-condition","direct-proof","proof-by-contradiction","proof-by-cases","mathematical-proof"]),
 group("Algebraic proof and parity","direct-proof",["algebraic-identity","parity","integer-divisibility","direct-proof","proof-by-cases","universal-claim"]),
 group("Induction","mathematical-induction",["mathematical-induction","base-case","induction-hypothesis","inductive-step","finite-series","conjecture"]),
 group("Recurrence and indexing","recurrence-relation",["iteration","sequence-term","recurrence-relation","initial-value","explicit-sequence-rule","finite-series"]),
 group("Arithmetic and geometric sequences","sequence-term",["arithmetic-sequence","common-difference","geometric-sequence","common-ratio","sequence-term","finite-series","explicit-sequence-rule"]),
 group("Fixed points and convergence","convergence",["convergence","fixed-point","fixed-point-equation","contraction-mapping","oscillation-cycle","divergent-iteration","recurrence-relation"]),
 group("Numerical accuracy","numerical-stopping-rule",["numerical-stopping-rule","absolute-approximation-error","iteration-residual","numerical-stability","convergence"]),
 group("Bisection and error bounds","bisection-method",["sign-change-bracket","bisection-method","bisection-error-bound","numerical-stopping-rule","absolute-approximation-error"]),
 group("Newton–Raphson and reliability","newton-raphson-method",["newton-raphson-method","iteration-residual","numerical-stability","derivative","initial-value","convergence"])
]);

/** A high-level entry point deserves breadth. Other terms get concise paths. */
export const SAMPLING_HUB_SECTIONS=Object.freeze([
 Object.freeze({title:"Start with the population and frame",ids:Object.freeze(["population","sample","census","sampling-unit","observational-unit","sampling-frame","sample-size"])}),
 Object.freeze({title:"Compare probability sampling methods",ids:Object.freeze(["probability-sampling","simple-random-sample","stratified-sample","systematic-sample","sampling-interval","cluster-sample"])}),
 Object.freeze({title:"Compare non-probability sampling methods",ids:Object.freeze(["nonprobability-sampling","convenience-sample","quota-sample","voluntary-response-sample"])}),
 Object.freeze({title:"Check representativeness and bias",ids:Object.freeze(["representative-sample","selection-bias","nonresponse-bias","sampling-variability"])})
]);

/** Small curated cross-topic bridges keep related ideas discoverable. */
export const DEFINITION_CONNECTION_BRIDGES=Object.freeze({
 "sample":["sampling","sampling-unit","representative-sample"],
 "population":["sampling","census","sampling-frame"],
 "census":["sampling","population","sampling-frame"],
 "sampling-frame":["sampling","selection-bias","sampling-unit"],
 "sampling-unit":["sampling","sampling-frame","observational-unit"],
 "observational-unit":["sampling","sampling-unit","cluster-sample"],
 "simple-random-sample":["sampling","sampling-frame","selection-bias"],
 "stratified-sample":["sampling","sampling-frame","representative-sample"],
 "systematic-sample":["sampling","sampling-frame","selection-bias"],
 "sampling-interval":["sampling","systematic-sample","sampling-frame"],
 "cluster-sample":["sampling","sampling-unit","observational-unit"],
 "convenience-sample":["sampling","selection-bias","representative-sample"],
 "quota-sample":["sampling","selection-bias","stratified-sample"],
 "voluntary-response-sample":["sampling","selection-bias","nonresponse-bias"],
 "sampling-variability":["sampling","sample-size","confidence-interval"],
 "nonresponse-bias":["sampling","sample","representative-sample"],
 "representative-sample":["sampling","sample-size","selection-bias"],
 "probability-sampling":["sampling","sampling-frame","selection-bias"],
 "nonprobability-sampling":["sampling","selection-bias","representative-sample"],
 "selection-bias":["sampling","sampling-frame","convenience-sample"],
 "standard-deviation":["discrete-variance","normal-distribution"],
 "relative-uncertainty":["instrument-resolution","sensitivity-analysis"],
 "validity":["sampling","representative-sample"],
 "reliability":["repeated-measurement","random-error"],
 "paired-data":["sampling-unit","observational-unit"],
 "holdout-data":["overfitting","extrapolation"],
 "correlation":["spearman-rho","regression-line"],
 "quartile":["box-plot","interquartile-range"],
 "financial-threshold":["break-even-point","profit-function"],
 "sample-size":["sampling","sampling-variability"],
 "cumulative-probability":["binomial-distribution","normal-distribution"]
});

/** Return sectioned, unique, valid links. No keyword similarity or inferred course. */
export function relatedDefinitionSections(id){
 if(!definitionById(id))return [];
 if(id==="sampling")return SAMPLING_HUB_SECTIONS.map(section=>({
  title:section.title,
  definitions:section.ids.map(definitionById).filter(Boolean)
 }));
 const included=new Set([id]),result=[];
 let remaining=10;
 for(const g of DEFINITION_CONNECTION_GROUPS){
  if(!g.ids.includes(id)||remaining<=0)continue;
  const ordered=[...(g.hub&&g.hub!==id?[g.hub]:[]),...g.ids];
  const definitions=[];
  for(const target of ordered){
   if(definitions.length>=6||remaining<=0)break;
   if(included.has(target))continue;
   const d=definitionById(target);
   if(!d)continue;
   included.add(target);definitions.push(d);remaining--;
  }
  if(definitions.length)result.push({title:g.title,definitions});
 }
 const bridges=(DEFINITION_CONNECTION_BRIDGES[id]||[]).map(definitionById).filter(d=>d&&!included.has(d.id)).slice(0,remaining);
 if(bridges.length)result.push({title:"Also useful",definitions:bridges});
 return result;
}
export const relatedDefinitionIds=id=>relatedDefinitionSections(id).flatMap(section=>section.definitions.map(d=>d.id));

/** An audit-only helper: no definition should be left isolated. */
export function unconnectedDefinitionIds(){
 return WORKSHOP_DEFINITIONS.filter(d=>relatedDefinitionIds(d.id).length<2).map(d=>d.id);
}
