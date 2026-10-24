/** Maths Workshop Batch 0: a small canonical learning library, not an IA author.
 * Pathway associations are browsing links, not syllabus approvals or required methods.
 * Practice uses invented values and never touches a student's mathematics or project.
 */
import {BATCH1_DEFINITIONS,BATCH1_LESSONS} from './batch-1.js';
const define=(id,category,title,meaning,example,notation="")=>
 Object.freeze({id,category,title,meaning,example,notation});
export const WORKSHOP_DEFINITIONS=Object.freeze([
 define("population","Data","Population","The entire group or collection about which a question is being asked.","Every Year 12 student at a school."),
 define("sample","Data","Sample","The observed subset selected from a population. Its selection affects how far conclusions can be generalised.","A group of 30 volunteers is not automatically representative of the year."),
 define("paired-data","Data","Paired numerical data","Two numerical quantities recorded for the same observational unit; the original pairing must be preserved.","Each student's height and standing reach are one pair."),
 define("mean","Data","Mean","The total of numerical observations divided by their number.","For 2, 4, 6 the mean is 4.","x̄ = Σx / n"),
 define("median","Data","Median","The middle ordered value, or the average of the two central ordered values for an even number of observations.","For 1, 2, 10 the median is 2."),
 define("standard-deviation","Data","Standard deviation","A measure of how spread out observations are around their mean. Population and sample standard deviations use different divisors.","For population values 2, 4, 4, 6, the population SD is √2.","σ = √(Σ(x − μ)² / N);  s = √(Σ(x − x̄)² / (n − 1))"),
 define("correlation","Data","Correlation","A statistical description of association. Pearson's r measures linear association, not causation.","r = −0.8 suggests a strong negative linear association in the observed data.","−1 ≤ r ≤ 1"),
 define("residual","Data","Residual","The difference between an observed value and its model-predicted value.","Observed 8, predicted 7.5: residual +0.5.","residual = observed − predicted"),
 define("model","Models","Mathematical model","A mathematical representation of a situation based on chosen assumptions, variables and restrictions.","A quadratic can approximate a trajectory over a measured interval."),
 define("parameter","Models","Parameter","A quantity in a mathematical model whose value controls its behaviour.","In y = a + bx, b represents the change in y per one-unit change in x."),
 define("domain","Models","Domain","The set of input values for which a function or model is defined or intended to apply.","A positive physical length restricts the feasible domain."),
 define("extrapolation","Models","Extrapolation","Using a model to estimate beyond the input range represented in the observed data.","Predicting a decade ahead from a single week of observations."),
 define("derivative","Calculus","Derivative","The instantaneous rate of change of a differentiable function with respect to its input.","If A(x) = 12x − x², then A'(x) = 12 − 2x."),
 define("stationary-point","Calculus","Stationary point","A point on a differentiable curve where its derivative is zero. It need not be a maximum or minimum.","Solve A'(x) = 0, then check the nature and domain of the point.","f'(x) = 0"),
 define("constraint","Decisions","Constraint","A condition that restricts the possible values or designs in a mathematical problem.","The perimeter of a fenced rectangle is fixed at 24 m."),
 define("objective-function","Decisions","Objective function","The mathematical quantity to maximise or minimise in an optimisation problem.","Area A(x) = x(12 − x) when the available fence length is 24 m."),
 define("scale-factor","Geometry","Scale factor","The multiplier converting corresponding lengths between a diagram and a real object. Area scales by its square.","A length scale factor of 2 multiplies areas by 4."),
 define("uncertainty","Geometry","Measurement uncertainty","The limited certainty of a measured quantity from resolution, measurement method and other relevant effects. Resolution alone is not a measured uncertainty interval.","A measured angle may shift a calculated height substantially."),
 define("euclidean-distance","Geometry","Euclidean distance","Straight-line distance between two points in a plane.","For (1,2) and (4,6), distance = 5.","d = √((x₂ − x₁)² + (y₂ − y₁)²)"),
 define("voronoi-cell","Geometry","Voronoi cell","A region whose points are at least as close to one chosen site as to any other site under the selected distance measure.","A cell describes nearest-site coverage using straight-line distance."),
 define("probability","Probability","Probability","A number from 0 to 1 describing the likelihood of an event under a stated model.","For a fair six-sided die, P(6) = 1/6.","0 ≤ P(A) ≤ 1"),
 define("expected-value","Probability","Expected value","The probability-weighted mean of the possible numerical outcomes of a random variable.","A game that pays £4 with probability 1/4 and £0 otherwise has gross expected payout £1.","E(X) = Σ[x · P(X = x)]"),
 define("conjecture","Reasoning","Conjecture","A precise mathematical statement proposed as true but not yet proved.","Testing five cases can suggest a conjecture, not establish it generally."),
 define("counterexample","Reasoning","Counterexample","A single permitted case that disproves a universal claim.","One odd number that fails a claimed rule for all odd numbers refutes the rule."),
 define("iteration","Reasoning","Iteration","Repeatedly applying a stated mathematical rule to obtain the next value.","xₙ₊₁ = (xₙ + 2/xₙ)/2, from a positive starting value."),
 define("convergence","Reasoning","Convergence","A sequence approaches a finite limit as the term number increases.","Values appearing to settle numerically suggest, but do not prove, convergence.")
,
 ...BATCH1_DEFINITIONS
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
  worked:{context:"Illustrative complete population: 2, 4, 4, 6 (arbitrary units).",steps:[
   "Add the values: 2 + 4 + 4 + 6 = 16; divide by 4. The mean is 4.",
   "Subtract the mean to obtain deviations: −2, 0, 0, +2.",
   "Square and sum the deviations: 4 + 0 + 0 + 4 = 8.",
   "For this complete population, divide by N = 4; take the square root: σ = √2 ≈ 1.414.",
   "If these four observations are a sample used to estimate a wider population's variability, use n − 1 = 3: s = √(8/3) ≈ 1.633."
  ],answer:"Mean = 4; population SD ≈ 1.414; sample SD ≈ 1.633.",interpretation:"These are different quantities because they answer different questions. State which version you used and why."},
  guided:{question:"For the fictional values 2, 3, 5, 10, what is the mean?",options:[["4","4"],["5","5"],["10","10"]],correct:"5",
   hint:"Add all four values, then divide the total by four.",
   feedback:"2 + 3 + 5 + 10 = 20, and 20 ÷ 4 = 5."},
  independent:{question:"For the complete population 1, 3, 5, calculate the mean and population standard deviation.",
   answer:"Mean = 3; population SD = √(8/3) ≈ 1.633.",
   reasoning:"The deviations are −2, 0, +2; their squares sum to 8. Divide by N = 3, then square-root."},
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
  worked:{context:"Illustrative paired observations (x,y): (1,2), (2,3), (3,5), (4,4).",steps:[
    "Keep every x and y value paired. The means are x̄ = 2.5 and ȳ = 3.5.",
    "Subtract the means. x deviations: −1.5, −0.5, 0.5, 1.5; y deviations: −1.5, −0.5, 1.5, 0.5.",
    "Sum the cross-products: Σ[(x − x̄)(y − ȳ)] = 4.",
    "Sum the squared deviations: Σ(x − x̄)² = 5 and Σ(y − ȳ)² = 5.",
    "Calculate r = 4 / √(5 × 5) = 0.8."
   ],answer:"r = 0.8",interpretation:"The values show positive linear association in this tiny illustrative set. The coefficient alone does not establish causation or generalisability."},
  guided:{question:"You calculate r = −0.84 for two paired measurements. What does its sign tell you?",
   options:[["positive","Positive linear association"],["negative","Negative linear association"],["causal","One variable causes the other"]],
   correct:"negative",hint:"The sign tells you the direction of the linear association, not whether one quantity causes the other.",
   feedback:"A negative coefficient describes an inverse direction of linear association. Its magnitude describes strength."},
  independent:{question:"For (1,3), (2,5), (3,4), (4,8), calculate Pearson's r and interpret the sign.",
   answer:"r = 7/√70 ≈ 0.837; positive linear association in the example.",
   reasoning:"x̄ = 2.5, ȳ = 5, sum of cross-products = 7, and sums of squared deviations = 5 and 14."},
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
   "Let one side be x m and the other be (12 − x) m, because 2x + 2y = 24.",
   "The objective is A(x) = x(12 − x) = 12x − x², with 0 < x < 12.",
   "Differentiate: A'(x) = 12 − 2x.",
   "Solve A'(x) = 0 to obtain x = 6.",
   "A''(x) = −2 < 0; the area tends to zero at the boundaries. The global maximum is A(6) = 36 m²."
  ],answer:"The maximum area is 36 m², for a 6 m by 6 m square.",
  interpretation:"The conclusion depends on the idealised perimeter constraint. Other practical restrictions could alter the design."},
  guided:{question:"With 20 m of fencing, A(x) = x(10 − x). What side length solves A'(x) = 0?",
   options:[["10","10 m"],["5","5 m"],["20","20 m"]],correct:"5",
   hint:"Differentiate A(x) = 10x − x² to get A'(x) = 10 − 2x.",
   feedback:"10 − 2x = 0 gives x = 5 m. You must still check this is a maximum in the feasible domain."},
  independent:{question:"A rectangle has a 32 m perimeter. Derive its area function and identify its greatest area.",
   answer:"A(x) = x(16 − x), 0 < x < 16. Maximum at x = 8; area = 64 m².",
   reasoning:"A'(x) = 16 − 2x, so x = 8. The second derivative is −2 and the boundary areas are zero."},
  technology:[{name:"Graphing software",command:"A(x) = x(12 - x) {0 < x < 12}",why:"Use a restricted graph to investigate and check the result, not to replace the derivation."}],
  existingGuide:"derivatives",
  ia:"Define the variables, derive the objective and constraints, show the differentiation and candidate checks, and interpret whether the mathematical optimum is a feasible real design."
 })
]);
export const LESSON_BY_ID=new Map(WORKSHOP_LESSONS.map(l=>[l.id,l]));
export const lessonById=id=>LESSON_BY_ID.get(id)||null;

/** Every canonical pathway is linked to the relevant starter terms and optional lessons.
 * A pathway with no pilot lesson still has precise definitions and is queued for later batches.
 */
export const PATHWAY_LEARNING=Object.freeze({
 relationships:{terms:["paired-data","correlation","residual","model","sample","sampling-frame","selection-bias"],lessons:["pearson","sampling"]},
 groups:{terms:["population","sample","mean","median","standard-deviation","stratified-sample","sampling-frame","selection-bias","quartile","interquartile-range","box-plot"],lessons:["sampling","descriptive","distributions"]},
 categorical:{terms:["population","sample","probability","categorical-variable","two-way-table","conditional-proportion","percentage-point","nonresponse-bias"],lessons:["sampling","two-way"]},
 variation:{terms:["mean","median","standard-deviation","uncertainty","instrument-resolution","repeated-measurement","rounding-interval","random-error","systematic-error","quartile","interquartile-range","histogram"],lessons:["descriptive","distributions","uncertainty"]},
 "fitted-models":{terms:["model","parameter","domain","residual","extrapolation"],lessons:[]},
 growth:{terms:["model","parameter","domain","extrapolation"],lessons:[]},
 cycles:{terms:["model","parameter","domain"],lessons:[]},
 trajectories:{terms:["model","scale-factor","derivative","stationary-point"],lessons:[]},
 optimisation:{terms:["objective-function","constraint","derivative","stationary-point","domain"],lessons:["optimisation"]},
 images:{terms:["scale-factor","model","uncertainty","domain","instrument-resolution","sensitivity-analysis"],lessons:["uncertainty"]},
 triangulation:{terms:["scale-factor","uncertainty","euclidean-distance","rounding-interval","sensitivity-analysis"],lessons:["uncertainty"]},
 voronoi:{terms:["voronoi-cell","euclidean-distance","model"],lessons:[]},
 finance:{terms:["model","parameter","constraint","extrapolation","sensitivity-analysis"],lessons:["uncertainty"]},
 chance:{terms:["probability","expected-value","sample"],lessons:[]},
 proof:{terms:["conjecture","counterexample","domain"],lessons:[]},
 iteration:{terms:["iteration","convergence","parameter","domain"],lessons:[]}
});
export const workshopLessonForEntry=entry=>{
 if(!entry)return "";
 if(entry.methodId==="pmcc")return "pearson";
 if(entry.methodId==="optimisation")return "optimisation";
 if(!entry.methodId&&entry.kind==="distribution")return "descriptive";
 if(!entry.methodId&&entry.kind==="table")return "two-way";
 return "";
};
