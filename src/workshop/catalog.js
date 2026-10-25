/** Maths Workshop Batch 0: a small canonical learning library, not an IA author.
 * Pathway associations are browsing links, not syllabus approvals or required methods.
 * Practice uses invented values and never touches a student's mathematics or project.
 */
import {BATCH1_DEFINITIONS,BATCH1_LESSONS} from './batch-1.js';
import {BATCH2_DEFINITIONS,BATCH2_LESSONS} from './batch-2.js';
import {HISTOGRAM_LESSON} from './histogram-lesson.js';
import {BATCH3_DEFINITIONS,BATCH3_LESSONS} from './batch-3.js';
import {BATCH4_DEFINITIONS} from './batch-4-definitions.js';
import {BATCH4_LESSONS} from './batch-4-lessons.js';
import {BATCH5_DEFINITIONS} from './batch-5-definitions.js';
import {BATCH5_LESSONS} from './batch-5-lessons.js';
const define=(id,category,title,meaning,example,notation="")=>
 Object.freeze({id,category,title,meaning,example,notation});
export const WORKSHOP_DEFINITIONS=Object.freeze([
 define("population","Data","Population","The entire group or collection about which a question is being asked.","Every Year 12 student at a school."),
 define("sample","Data","Sample","The observed subset selected from a population. Its selection affects how far conclusions can be generalised.","A group of 30 volunteers is not automatically representative of the year."),
 define("paired-data","Data","Paired numerical data","Two numerical quantities recorded for the same observational unit; the original pairing must be preserved.","Each student's height and standing reach are one pair."),
 define("mean","Data","Mean","The total of numerical observations divided by their number.","For \\(2,4,6\\), the mean is \\(\\bar{x}=4\\).","x̄ = Σx / n"),
 define("median","Data","Median","The middle ordered value, or the average of the two central ordered values for an even number of observations.","For 1, 2, 10 the median is 2."),
 define("standard-deviation","Data","Standard deviation","A measure of how spread out observations are around their mean. Population and sample standard deviations use different divisors.","For a complete population \\(2,4,4,6\\), the population standard deviation is \\(\\sigma=\\sqrt{2}\\).","σ = √(Σ(x − μ)² / N);  s = √(Σ(x − x̄)² / (n − 1))"),
 define("correlation","Data","Correlation","A statistical description of association. Pearson's r measures linear association, not causation.","A coefficient of \\(r=-0.8\\) suggests strong negative linear association in the observed data.","−1 ≤ r ≤ 1"),
 define("residual","Data","Residual","The difference between an observed value and its model-predicted value.","Observed \\(y=8\\), predicted \\(\\hat{y}=7.5\\): the residual is \\(e=0.5\\).","residual = observed − predicted"),
 define("model","Models","Mathematical model","A mathematical representation of a situation based on chosen assumptions, variables and restrictions.","A quadratic can approximate a trajectory over a measured interval."),
 define("parameter","Models","Parameter","A quantity in a mathematical model whose value controls its behaviour.","In \\(y=a+bx\\), \\(b\\) represents the change in \\(y\\) for a one-unit increase in \\(x\\)."),
 define("domain","Models","Domain","The set of input values for which a function or model is defined or intended to apply.","A positive physical length restricts the feasible domain."),
 define("extrapolation","Models","Extrapolation","Using a model to estimate beyond the input range represented in the observed data.","Predicting a decade ahead from a single week of observations."),
 define("derivative","Calculus","Derivative","The instantaneous rate of change of a differentiable function with respect to its input.","If \\(A(x)=12x-x^{2}\\), then \\(A'(x)=12-2x\\)."),
 define("stationary-point","Calculus","Stationary point","A point on a differentiable curve where its derivative is zero. It need not be a maximum or minimum.","Solve \\(A'(x)=0\\), then check the nature and domain of that point.","f'(x) = 0"),
 define("constraint","Decisions","Constraint","A condition that restricts the possible values or designs in a mathematical problem.","The perimeter of a fenced rectangle is fixed at 24 m."),
 define("objective-function","Decisions","Objective function","The mathematical quantity to maximise or minimise in an optimisation problem.","For a \\(24\\,\\mathrm{m}\\) perimeter, the rectangular area can be written \\(A(x)=x(12-x)\\)."),
 define("scale-factor","Geometry","Scale factor","The multiplier converting corresponding lengths between a diagram and a real object. Area scales by its square.","A length scale factor of 2 multiplies areas by 4."),
 define("uncertainty","Geometry","Measurement uncertainty","The limited certainty of a measured quantity from resolution, measurement method and other relevant effects. Resolution alone is not a measured uncertainty interval.","A measured angle may shift a calculated height substantially."),
 define("euclidean-distance","Geometry","Euclidean distance","Straight-line distance between two points in a plane.","For \\((1,2)\\) and \\((4,6)\\), the Euclidean distance is \\(d=5\\).","d = √((x₂ − x₁)² + (y₂ − y₁)²)"),
 define("voronoi-cell","Geometry","Voronoi cell","A region whose points are at least as close to one chosen site as to any other site under the selected distance measure.","A cell describes nearest-site coverage using straight-line distance."),
 define("probability","Probability","Probability","A number from 0 to 1 describing the likelihood of an event under a stated model.","For a fair six-sided die, \\(P(6)=\\frac{1}{6}\\).","0 ≤ P(A) ≤ 1"),
 define("expected-value","Probability","Expected value","The probability-weighted mean of the possible numerical outcomes of a random variable.","A game paying £4 with probability \\(\\frac14\\) and £0 otherwise has a gross expected payout of £1.","E(X) = Σ[x · P(X = x)]"),
 define("conjecture","Reasoning","Conjecture","A precise mathematical statement proposed as true but not yet proved.","Testing five cases can suggest a conjecture, not establish it generally."),
 define("counterexample","Reasoning","Counterexample","A single permitted case that disproves a universal claim.","One odd number that fails a claimed rule for all odd numbers refutes the rule."),
 define("iteration","Reasoning","Iteration","Repeatedly applying a stated mathematical rule to obtain the next value.","xₙ₊₁ = (xₙ + 2/xₙ)/2, from a positive starting value."),
 define("convergence","Reasoning","Convergence","A sequence approaches a finite limit as the term number increases.","Values appearing to settle numerically suggest, but do not prove, convergence.")
,
 ...BATCH1_DEFINITIONS,
 ...BATCH2_DEFINITIONS,
 ...BATCH3_DEFINITIONS,
 ...BATCH4_DEFINITIONS,
 ...BATCH5_DEFINITIONS
]);
export const DEFINITION_BY_ID=new Map(WORKSHOP_DEFINITIONS.map(d=>[d.id,d]));
export const definitionById=id=>DEFINITION_BY_ID.get(id)||null;

const lesson=(id,category,title,definitionIds,details)=>Object.freeze({id,category,title,definitionIds,...details});
export const WORKSHOP_LESSONS=Object.freeze([
 lesson("descriptive","Data & statistics","Mean and standard deviation",["mean","standard-deviation","sample"],{
  skill:"Understand both approaches",
  when:"When you need to describe a numerical dataset's typical value and variation.",
  avoid:"The mean may be misleading for strongly skewed distributions or unusual values. Distinguish the sample formula from the population formula.",
  formula:"x̄ = Σx / n; population σ = √(Σ(x − μ)² / N); sample s = √(Σ(x − x̄)² / (n − 1))",
  worked:{context:"Illustrative complete population: \\(2,4,4,6\\) (arbitrary units).",steps:[
   "Add the values: \\(2+4+4+6=16\\). Divide by four to obtain \\(\\bar{x}=4\\).",
   "Subtract \\(\\bar{x}=4\\) to obtain deviations \\(-2,\\,0,\\,0,\\,+2\\).",
   "Square and sum the deviations: \\(4+0+0+4=8\\).",
   "This is the complete population, so divide by \\(N=4\\). Then \\(\\sigma=\\sqrt{\\frac84}=\\sqrt2\\approx1.414\\).",
   "If they are instead a sample used to estimate wider population variation, divide by \\(n-1=3\\): \\(s=\\sqrt{\\frac83}\\approx1.633\\)."
  ],answer:"Mean \\(\\bar{x}=4\\); population SD \\(\\sigma\\approx1.414\\); sample SD \\(s\\approx1.633\\).",interpretation:"These are different quantities because they answer different questions. State which version you used and why."},
  guided:{question:"For the fictional values \\(2,3,5,10\\), what is the mean?",options:[["4","4"],["5","5"],["10","10"]],correct:"5",
   hint:"Add all four values, then divide the total by four.",
   feedback:"\\(2+3+5+10=20\\), and \\(\\bar{x}=\\frac{20}{4}=5\\)."},
  independent:{question:"For the complete population \\(1,3,5\\), calculate the mean and population standard deviation.",
   answer:"Mean \\(\\mu=3\\); population SD \\(\\sigma=\\sqrt{\\frac83}\\approx1.633\\).",
   reasoning:"The deviations are \\(-2,0,+2\\), whose squares sum to \\(8\\). Divide by \\(N=3\\), then take the square root."},
  technology:[{name:"Google Sheets",command:"=AVERAGE(A2:A5)",why:"Use for the mean of a real numerical range."},
   {name:"Google Sheets",command:"=STDEV.P(A2:A5)",why:"Use only when the listed values represent the complete population being described."},
   {name:"Google Sheets",command:"=STDEV.S(A2:A5)",why:"Use when calculating sample standard deviation."}],
  existingGuide:"summary-stats",
  ia:"Label the quantity and units, name the spread measure, show only useful working, and interpret whether variation matters for your question. The table alone is not an investigation."
 }),
 lesson("pearson","Data & statistics","Pearson's correlation coefficient",["paired-data","correlation","residual"],{
  skill:"Technology recommended for real datasets",
  when:"When two paired numerical variables show a relationship for which linear association is a meaningful question.",
  avoid:"A curved pattern can have a low r, r does not demonstrate causation, and one influential point can change the coefficient.",
  formula:"r = Σ[(x − x̄)(y − ȳ)] / √(Σ(x − x̄)² · Σ(y − ȳ)²)",
  worked:{context:"Illustrative paired observations \\((x,y)\\): \\((1,2),(2,3),(3,5),(4,4)\\).",steps:[
    "Keep each \\(x\\) and \\(y\\) value paired. The means are \\(\\bar{x}=2.5\\) and \\(\\bar{y}=3.5\\).",
    "Subtract the means. The \\(x\\) deviations are \\(-1.5,-0.5,0.5,1.5\\); the paired \\(y\\) deviations are \\(-1.5,-0.5,1.5,0.5\\).",
    "Sum the centred cross-products: \\(S_{xy}=\\sum(x_i-\\bar{x})(y_i-\\bar{y})=4\\).",
    "Sum the squared deviations: \\(S_{xx}=5\\) and \\(S_{yy}=5\\).",
    "Calculate \\(r=\\frac{4}{\\sqrt{5\\times5}}=0.8\\)."
   ],answer:"\\(r=0.8\\)",interpretation:"The values show positive linear association in this tiny illustrative set. The coefficient alone does not establish causation or generalisability."},
  guided:{question:"You calculate \\(r=-0.84\\) for two paired measurements. What does its sign tell you?",
   options:[["positive","Positive linear association"],["negative","Negative linear association"],["causal","One variable causes the other"]],
   correct:"negative",hint:"The sign tells you the direction of the linear association, not whether one quantity causes the other.",
   feedback:"A negative coefficient describes an inverse direction of linear association. Its magnitude describes strength."},
  independent:{question:"For \\((1,3),(2,5),(3,4),(4,8)\\), calculate Pearson's \\(r\\) and interpret its sign.",
   answer:"\\(r=\\frac7{\\sqrt{70}}\\approx0.837\\); positive linear association in this illustrative sample.",
   reasoning:"\\(\\bar{x}=2.5,\\;\\bar{y}=5\\). The centred cross-product sum is \\(7\\); the squared-deviation sums are \\(5\\) and \\(14\\)."},
  technology:[{name:"Google Sheets",command:"=CORREL(A2:A5,B2:B5)",why:"Use matched numerical columns with identical row ranges; inspect the scatter first."},
   {name:"Desmos",command:"corr(x_1,y_1)",why:"For named x₁ and y₁ lists derived from the same paired observations."}],
  existingGuide:"sheets-pmcc",
  ia:"Provide the actual paired variables and a useful scatter plot, state the coefficient and interpret it in context. Do not reproduce an enormous hand-calculation table or claim causation."
 }),
 lesson("optimisation","Calculus & decisions","Finding a maximum by differentiation",["objective-function","constraint","derivative","stationary-point","domain"],{
  skill:"Show your mathematical reasoning",
  when:"When you have a justified differentiable objective function, defined constraints and a feasible domain.",
  avoid:"A derivative equal to zero identifies a candidate only. Check feasible endpoints, other candidates and the physical meaning.",
  formula:"Find f'(x) = 0, then compare valid candidates and domain boundaries.",
  worked:{context:"A rectangle uses 24 m of fencing. Find the largest possible area, assuming the full perimeter is fenced.",steps:[
   "Let one side be \\(x\\,\\mathrm{m}\\) and the other \\((12-x)\\,\\mathrm{m}\\), because \\(2x+2y=24\\).",
   "The area is \\(A(x)=x(12-x)=12x-x^2\\), with feasible domain \\(0<x<12\\).",
   "Differentiate: \\(A'(x)=12-2x\\).",
   "Solve \\(A'(x)=0\\) to obtain \\(x=6\\).",
   "Since \\(A''(x)=-2<0\\), the candidate is a local maximum. The area approaches zero at the feasible boundaries, so the global maximum is \\(A(6)=36\\,\\mathrm{m}^2\\)."
  ],answer:"Maximum area: \\(36\\,\\mathrm{m}^2\\), achieved by a \\(6\\,\\mathrm{m}\\times6\\,\\mathrm{m}\\) square.",
  interpretation:"The conclusion depends on the idealised perimeter constraint. Other practical restrictions could alter the design."},
  guided:{question:"With \\(20\\,\\mathrm{m}\\) of fencing, \\(A(x)=x(10-x)\\). What side length solves \\(A'(x)=0\\)?",
   options:[["10","10 m"],["5","5 m"],["20","20 m"]],correct:"5",
   hint:"Differentiate \\(A(x)=10x-x^2\\) to obtain \\(A'(x)=10-2x\\).",
   feedback:"\\(10-2x=0\\) gives \\(x=5\\,\\mathrm{m}\\). Check that this is a maximum within the feasible domain."},
  independent:{question:"A rectangle has perimeter \\(32\\,\\mathrm{m}\\). Derive its area function and identify its greatest area.",
   answer:"\\(A(x)=x(16-x)\\) for \\(0<x<16\\). The maximum occurs at \\(x=8\\), with \\(A_{\\max}=64\\,\\mathrm{m}^2\\).",
   reasoning:"\\(A'(x)=16-2x\\), so \\(x=8\\). Since \\(A''(x)=-2\\) and the boundary areas approach zero, this is the global maximum."},
  technology:[{name:"Graphing software",command:"A(x) = x(12 - x) {0 < x < 12}",why:"Use a restricted graph to investigate and check the result, not to replace the derivation."}],
  existingGuide:"derivatives",
  ia:"Define the variables, derive the objective and constraints, show the differentiation and candidate checks, and interpret whether the mathematical optimum is a feasible real design."
 }),
 ...BATCH1_LESSONS,
 ...BATCH2_LESSONS,
 HISTOGRAM_LESSON,
 ...BATCH3_LESSONS,
 ...BATCH4_LESSONS,
 ...BATCH5_LESSONS
]);
export const LESSON_BY_ID=new Map(WORKSHOP_LESSONS.map(l=>[l.id,l]));
export const lessonById=id=>LESSON_BY_ID.get(id)||null;

/** Every canonical pathway is linked to the relevant starter terms and optional lessons.
 * A pathway with no pilot lesson still has precise definitions and is queued for later batches.
 */
export const PATHWAY_LEARNING=Object.freeze({
 relationships:{terms:["paired-data","correlation","residual","model","sample","sampling-frame","selection-bias","rank","tied-rank","spearman-rho","monotonic-association","regression-line","residual-plot","rmse"],lessons:["pearson","spearman","linear-regression","residual-diagnostics","model-comparison","sampling"]},
 groups:{terms:["population","sample","mean","median","standard-deviation","stratified-sample","sampling-frame","selection-bias","quartile","interquartile-range","box-plot","null-hypothesis","sampling-variability"],lessons:["sampling","descriptive","distributions","inference-evidence"]},
 categorical:{terms:["population","sample","probability","categorical-variable","two-way-table","conditional-proportion","percentage-point","nonresponse-bias","conditional-probability","joint-probability","practical-significance"],lessons:["sampling","two-way-proportions","conditional-probability-tree"]},
 variation:{terms:["mean","median","standard-deviation","uncertainty","instrument-resolution","repeated-measurement","rounding-interval","random-error","systematic-error","quartile","interquartile-range","histogram","frequency-density","worst-case-bounds","sensitivity-check"],lessons:["descriptive","distributions","histograms","measurement","geometry-sensitivity"]},
 "fitted-models":{terms:["model","parameter","domain","residual","extrapolation","regression-line","least-squares","gradient","intercept","centred-sums","fitted-value","nonlinear-regression","quadratic-model","sum-squared-errors","residual-plot","residual-pattern","rmse","r-squared","holdout-data","overfitting","influential-observation","vertex-form","quadratic-roots","discriminant","feasible-domain","doubling-time","logarithm"],lessons:["linear-regression","nonlinear-fitting","residual-diagnostics","model-comparison","quadratic-functions","exponential-logarithms"]},
 growth:{terms:["model","parameter","domain","extrapolation","exponential-model","log-transformation","transformed-regression","nonlinear-regression","residual-plot","holdout-data","rmse","doubling-time","half-life","logarithm"],lessons:["nonlinear-fitting","residual-diagnostics","model-comparison","exponential-logarithms"]},
 cycles:{terms:["model","parameter","domain","residual-plot","residual-pattern","rmse","holdout-data","amplitude","period","midline","phase-shift","angular-frequency"],lessons:["residual-diagnostics","model-comparison","sinusoidal-functions"]},
 trajectories:{terms:["model","scale-factor","derivative","stationary-point","quadratic-model","residual","residual-plot","domain","rmse","vertex-form","instantaneous-rate","average-rate","second-derivative","calibration-factor","pixel-coordinate","perspective-distortion"],lessons:["nonlinear-fitting","residual-diagnostics","model-comparison","quadratic-functions","derivatives-motion","image-calibration"]},
 optimisation:{terms:["objective-function","constraint","derivative","stationary-point","domain","vertex-form","feasible-domain","global-extremum","composite-region","triangle-area","cross-section-volume","dimensional-units","sensitivity-check"],lessons:["optimisation","quadratic-functions","geometric-areas","geometry-sensitivity"]},
 images:{terms:["scale-factor","model","uncertainty","domain","instrument-resolution","sensitivity-analysis","definite-integral","signed-area","pixel-coordinate","image-origin","reference-length","calibration-factor","perspective-distortion","area-scale","composite-region","dimensional-units","sensitivity-check"],lessons:["measurement","integrals-accumulation","image-calibration","geometric-areas","geometry-sensitivity"]},
 triangulation:{terms:["scale-factor","uncertainty","euclidean-distance","rounding-interval","sensitivity-analysis","baseline","bearing","interior-angle","sine-rule","cosine-rule","triangle-area","calibration-factor","worst-case-bounds"],lessons:["measurement","triangulation","image-calibration","geometry-sensitivity"]},
 voronoi:{terms:["voronoi-cell","euclidean-distance","model","perpendicular-bisector","locus","voronoi-boundary","voronoi-vertex","distance-metric","reference-length","pixel-coordinate"],lessons:["voronoi-regions","image-calibration"]},
 finance:{terms:["model","parameter","constraint","extrapolation","sensitivity-analysis","exponential-model","nonlinear-regression","rmse","holdout-data","doubling-time","logarithm"],lessons:["measurement","nonlinear-fitting","model-comparison","exponential-logarithms"]},
 chance:{terms:["probability","expected-value","sample",...BATCH5_DEFINITIONS.map(d=>d.id)],lessons:BATCH5_LESSONS.map(l=>l.id)},
 proof:{terms:["conjecture","counterexample","domain"],lessons:[]},
 iteration:{terms:["iteration","convergence","parameter","domain"],lessons:[]}
});
export const workshopLessonForEntry=entry=>{
 if(!entry)return "";
 if(entry.methodId==="pmcc")return "pearson";
 if(entry.methodId==="spearman")return "spearman";
 if(entry.methodId==="linear-regression")return "linear-regression";
 if(["quadratic-fit","exponential","power"].includes(entry.methodId))return "nonlinear-fitting";
 if(entry.methodId==="optimisation")return "optimisation";
 if(entry.methodId==="derivatives")return "derivatives-motion";
 if(entry.methodId==="integration")return "integrals-accumulation";
 if(entry.methodId==="geometric-model")return "geometric-areas";
 if(entry.methodId==="triangulation")return "triangulation";
 if(entry.methodId==="voronoi")return "voronoi-regions";
 if(entry.methodId==="probability")return "conditional-probability-tree";
 if(entry.methodId==="expected-value")return "discrete-expected-value";
 if(entry.methodId==="binomial")return "binomial-models";
 if(entry.methodId==="normal")return "normal-models";
 if(["two-sample-t","chi-independence","chi-fit"].includes(entry.methodId))return "inference-evidence";
 if(!entry.methodId&&entry.kind==="distribution")return "descriptive";
 return "";
};
