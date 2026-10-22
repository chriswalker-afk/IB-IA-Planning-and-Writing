/**
 * Coherent fictional investigations for the tab-local sample sandbox.
 * All empirical values are invented for teaching; they are NOT collected data.
 * Each scenario has a Planning record, linked mathematics and a prospective review.
 */
import {createProjectState} from "./project-state.js";
import {ENTRY_BASE} from "../completing/entry-record.js";
import {applyPlanningField} from "../planning/engine.js";
import {applySuggestedTimeline,localToday} from "../planning/timeline.js";
import {enrichCurrentIllustrativeSample} from "./sample-current-workflow.js";
import {REFERENCE_SAMPLE_CHOICES,referenceSampleSpec,createReferenceSample} from './sample-library.js';

export const SAMPLE_CHOICES=REFERENCE_SAMPLE_CHOICES;
// Historical sample IDs remain loadable for existing backups and preview tabs.
// Only completed, newly authored investigations appear in the public chooser.
export const LEGACY_SAMPLE_CHOICES=Object.freeze([
 {id:"linear",title:"A nearly straight pattern",description:"Scatter plot → Pearson's r → line of best fit and residuals."},
 {id:"curved",title:"A curved pattern",description:"Why a strong correlation does not make a straight-line model appropriate."},
 {id:"unclear",title:"No convincing linear relationship",description:"Analyse an inconclusive result without forcing another calculation."},
 {id:"unexpected",title:"An unusual observation",description:"Check model sensitivity without deleting inconvenient data."},
 {id:"theory",title:"A theoretical proof",description:"Numerical cases → a general proof → a meaningful extension."}
]);
const EMPIRICAL=Object.freeze({
 linear:{
  y:[352,329,307,283,260,238],shape:"linear",detail:"near-perfect",
  prediction:"Reaction time in this teaching example may decrease approximately linearly as hours of sleep increase.",
  first:"The six synthetic points lie almost on one descending straight line.",
  meaning:"The demonstration shows a very strong negative LINEAR association over the six chosen x-values. It does not show that extra sleep caused a faster response.",
  next:"Would Pearson's r quantify the apparent linear association?",
  fitWhy:"A nearly straight scatter makes a correlation coefficient a relevant next calculation, not a substitute for inspecting the graph.",
  limitation:"The points were deliberately made unusually tidy. Real reaction times fluctuate; these fabricated values cannot establish any real-world effect.",
  conclusion:"For this invented set, the association is almost perfectly negative and a straight-line approximation fits the six points closely. It would be unjustified to claim a causal sleep benefit or predict far outside 4–9 hours.",
  extension:"Would a genuine ethically obtained dataset still show roughly linear behaviour, and what happens to the fitted slope?"
 },
 curved:{
  y:[370,322,293,276,266,259],shape:"curved",detail:"monotonic",
  prediction:"A curved decrease that becomes less steep may describe the invented pattern better than a constant slope.",
  first:"The drops are 48, 29, 17, 10 and 7 ms as x increases by one hour; the reductions become smaller.",
  meaning:"The curve appears to level out in the constructed range, so forcing a straight line would overlook meaningful structure.",
  next:"Do residuals from a straight-line model show systematic curvature?",
  fitWhy:"A model comparison follows from the visible curvature; a large absolute Pearson r alone would be misleading.",
  limitation:"The horizontal asymptote of 250 ms is an illustrative modelling assumption, not a parameter measured independently. Six synthetic points do not establish a physiological limit.",
  conclusion:"In this fabricated example an exponential form with an assumed 250 ms baseline follows the curved values substantially better than a straight-line fit. The assumed baseline and extrapolation remain limitations.",
  extension:"How sensitive is the fitted decay factor to the assumed baseline, and would real data justify this functional form?"
 },
 unclear:{
  y:[300,270,335,285,320,290],shape:"unclear",detail:"unclear",
  prediction:"The constructed points may show little consistent association; the analysis should be willing to reject the initial prediction.",
  first:"The six points move up and down, with no stable increasing or decreasing pattern.",
  meaning:"The scatter gives no compelling reason to prefer a straight-line model for this tiny artificial table.",
  next:"Is Pearson's r close enough to zero to confirm the weak LINEAR association suggested by the graph?",
  fitWhy:"An r calculation can quantify the apparent absence of linear association, while not ruling out every nonlinear relationship.",
  limitation:"Six invented points provide poor evidence for any population claim. A small r cannot prove independence or the absence of every possible relationship.",
  conclusion:"The fabricated data have a very weak linear association. They do not support the original negative-trend prediction; an inconclusive result is still a valid mathematical finding.",
  extension:"Would a larger genuinely collected dataset, or a justified different design, clarify the relationship?"
 },
 unexpected:{
  y:[354,329,307,390,260,243],shape:"unexpected",detail:"unexpected",
  prediction:"Reaction time may usually fall as x increases, but an unusual observation could change a fitted model.",
  first:"Five points suggest a downward trend; the invented point (7 h, 390 ms) lies markedly above it.",
  meaning:"The unusual value is part of the fictional dataset. A model should not quietly discard it simply because it weakens the pattern.",
  next:"How much does this unusual pair change Pearson's r and the regression line?",
  fitWhy:"The graph reveals sensitivity to one observation, so comparing analyses with and without it is a diagnostic, not permission to exclude it.",
  limitation:"There is no independent reason to regard the unusual point as an error. The five-point fit is a sensitivity calculation, not the preferred estimate.",
  conclusion:"The invented outlier substantially weakens the full-data linear correlation. Removing it yields a much stronger association, but there is no evidence justifying its removal from the substantive conclusion.",
  extension:"What independent checks or repeated observations would establish whether the unusual value reflects error, genuine variation or a different condition?"
 }
});
const xs=[4,5,6,7,8,9];
const display=(n,d=2)=>Number(n.toFixed(d)).toFixed(d);
export function lineSummary(x,y){
 const n=x.length,mx=x.reduce((a,b)=>a+b,0)/n,my=y.reduce((a,b)=>a+b,0)/n;
 const xx=x.reduce((a,v)=>a+(v-mx)**2,0),yy=y.reduce((a,v)=>a+(v-my)**2,0);
 const xy=x.reduce((a,v,i)=>a+(v-mx)*(y[i]-my),0);
 const slope=xy/xx,intercept=my-slope*mx;
 const residuals=x.map((v,i)=>y[i]-(slope*v+intercept));
 return {slope,intercept,r:xy/Math.sqrt(xx*yy),rmse:Math.sqrt(residuals.reduce((a,v)=>a+v*v,0)/n),residuals};
}
export function exponentialSummary(y){
 const log=y.map(v=>Math.log(v-250));
 const fit=lineSummary(xs.map(x=>x-4),log);
 const scale=Math.exp(fit.intercept),factor=Math.exp(fit.slope);
 const predicted=xs.map(x=>250+scale*Math.pow(factor,x-4));
 const rmse=Math.sqrt(y.reduce((sum,value,i)=>sum+(value-predicted[i])**2,0)/y.length);
 return {scale,factor,rmse};
}
function entry(id,phase,props,fromEntryId=""){
 return {...ENTRY_BASE,id,phase,fromEntryId,status:"completed",knowledge:"syllabus",resultRef:"Illustrative IA working section · "+id,createdAt:"Fictional example — no submission",
  accuracyRefs:[],sourceRefs:[],...props};
}
const pairText=y=>xs.map((x,i)=>"("+x+" h, "+y[i]+" ms)").join("; ");
const focus={
 linear:"a plausible near-linear pattern",
 curved:"a changing rate of decrease",
 unclear:"what an inconclusive mathematical result can tell us",
 unexpected:"the effect of a potentially influential observation",
 theory:"the identity connecting sums of cubes and triangular numbers"
};
function evidenceFor(kind){
 if(kind==="theory")return null;
 const d=EMPIRICAL[kind],y=d.y,fit=lineSummary(xs,y),r=display(fit.r,5);
 const slope=display(fit.slope,2),intercept=display(fit.intercept,2);
 const line="y = "+intercept+(fit.slope<0?" − ":" + ")+display(Math.abs(fit.slope),2)+"x";
 const scatter=entry(kind+"-scatter","first",{
   title:"Plot the six fictional sleep/reaction-time pairs",
   purpose:"Inspect direction, shape and unusual points before choosing statistical mathematics.",
   technique:"Scatter graph of paired numerical variables",methodId:"other",kind:"scatter",
   result:"Synthetic teaching data ONLY (x = hours; y = milliseconds): "+pairText(y)+".",
   observation:d.shape,observationText:d.first,
   interpretation:d.meaning,
   localTakeaway:d.first+" This gives a reason to decide what calculation should follow.",
   limitations:"The points were made up for this example; there is no real sample or causal evidence.",
   nextQuestion:d.next,nextWhy:d.fitWhy,bridge:"The shape of the observed teaching plot motivates the next calculation.",
   mathsInsight:"A scatter plot should be inspected before using Pearson's r or a fitted line.",
   sourceRefs:["fictional-"+kind],accuracyRefs:["display-"+kind]
 });
 let second,third;
 if(kind==="linear"){
  second=entry(kind+"-r","substantial",{
   title:"Quantify the nearly linear relationship",
   purpose:"Determine whether the visual straight-line association is supported numerically.",
   technique:"Pearson's product-moment correlation coefficient",methodId:"pmcc",kind:"model",
   result:"Using the six invented pairs, Pearson's r = "+r+" (five decimal places).",
   observationText:"r is close to −1, confirming strong negative linear association in this artificial table.",
   interpretation:"Within x = 4–9 h, larger x-values go with smaller y-values in this fictional table; no causation can be inferred.",
   localTakeaway:"A line of best fit is now a reasonable descriptive model to evaluate.",
   limitations:"The points were chosen to be almost perfectly linear; an extreme r is not representative of a typical small human sample.",
   nextQuestion:"What does a fitted linear model predict, and do its residuals suggest inadequacy?",
   nextWhy:"Correlation measures association but gives neither a predictive equation nor a residual check.",
   bridge:"Because the plot and r agree on a linear pattern, calculate and test the regression line.",
   previousTakeaway:scatter.localTakeaway,knowledge:"syllabus",
   mathsInsight:"A value of r near −1 measures direction and strength, not an amount of change.",
   sourceRefs:scatter.sourceRefs,accuracyRefs:scatter.accuracyRefs
  },scatter.id);
  third=entry(kind+"-fit","substantial",{
   title:"Fit a line and inspect the residuals",
   purpose:"Translate the association into a rate of change and check how well the line fits.",
   technique:"Least-squares linear regression and residual analysis",methodId:"linear-regression",kind:"model",
   result:"Least-squares "+line+" (x in h, y in ms); r² = "+display(fit.r**2,5)+
     "; root-mean-square residual = "+display(fit.rmse,2)+" ms. At x = 7, predicted y = "+display(fit.slope*7+fit.intercept,2)+" ms.",
   observationText:"All six residuals are within about 1 ms of zero, because this is a deliberately tidy synthetic demonstration.",
   interpretation:"For these made-up points, each extra hour in the model corresponds to about "+display(Math.abs(fit.slope),2)+" ms lower predicted reaction time within the studied range.",
   localTakeaway:"The linear description is very close for the constructed domain, but has no empirical predictive validity beyond it.",
   limitations:d.limitation,
   nextQuestion:d.extension,nextWhy:"A real dataset would test whether this exceptionally tidy relationship is plausible.",
   previousTakeaway:second.localTakeaway,bridge:"The nearly perfect r justified testing a linear fit rather than switching models at random.",
   mathsInsight:"The slope has units of milliseconds per hour; r and r² have no units.",
   sourceRefs:scatter.sourceRefs,accuracyRefs:scatter.accuracyRefs
  },second.id);
 }else if(kind==="curved"){
  second=entry(kind+"-linear","substantial",{
   title:"Test whether a straight-line fit is adequate",
   purpose:"Quantify the linear trend, then check whether residuals show systematic structure.",
   technique:"Least-squares line and residual analysis",methodId:"linear-regression",kind:"model",
   result:"For all six synthetic pairs, r = "+r+", straight-line "+line+
     ", r² = "+display(fit.r**2,3)+", and RMSE = "+display(fit.rmse,2)+" ms. Residuals in x order: "+
     fit.residuals.map(v=>display(v,1)).join(", ")+" ms.",
   observationText:"Positive residuals at both ends and negative residuals in the middle form a curved residual pattern.",
   interpretation:"Even |r| ≈ "+display(Math.abs(fit.r),3)+" does not make the linear fit suitable: the systematic residuals expose a missed curve.",
   localTakeaway:"The structured residuals give a mathematical reason to try a decaying nonlinear model.",
   limitations:"The regression calculations use constructed points, not external measurements.",
   nextQuestion:"Can a decaying exponential describe the flattening while using a defensible domain?",
   nextWhy:"The successive changes become smaller, suggesting decay towards a lower level.",
   previousTakeaway:scatter.localTakeaway,bridge:"The curved scatter motivates a residual check before adopting a model.",
   mathsInsight:"A high absolute Pearson coefficient does not guarantee a good linear model.",
   sourceRefs:scatter.sourceRefs,accuracyRefs:scatter.accuracyRefs
  },scatter.id);
  const exp=exponentialSummary(y);
  third=entry(kind+"-exp","substantial",{
   title:"Fit a decay curve with an explicit baseline assumption",
   purpose:"Compare a curved model with the failed line and examine its assumptions.",
   technique:"Exponential decay after subtracting an assumed baseline",methodId:"exponential",kind:"model",
   result:"Assume a baseline of 250 ms for illustration, define z = y − 250 and regress ln(z) on (x − 4). Then y ≈ 250 + "+
     display(exp.scale,2)+"("+display(exp.factor,4)+")^(x − 4) ms. Its RMSE on the six artificial points is "+
     display(exp.rmse,2)+" ms, versus "+display(fit.rmse,2)+" ms for the line.",
   observationText:"This chosen exponential form reproduces the synthetic curved values much more closely.",
   interpretation:"The decay factor of "+display(exp.factor,4)+" per added hour describes the constructed example only; it is not a physiological law.",
   localTakeaway:"The curvature has a defensible mathematical explanation as a model comparison, not just an extra calculation.",
   limitations:d.limitation,
   nextQuestion:d.extension,nextWhy:"Model sensitivity to the assumed asymptote matters before interpreting it.",
   previousTakeaway:second.localTakeaway,bridge:"The line residuals justified trying exponential decay, rather than fitting an arbitrary curve.",
   knowledge:"mixed",unfamiliarComponent:"Transforming a baseline-subtracted response using ln(y−250).",
   knowledgeNotes:"Logarithms are familiar; interpreting the baseline and transformation requires extra explanation.",
   understandingExample:"ln(y−250) = ln(A) + (x−4)ln(b) makes a line in transformed coordinates only while y>250.",
   mathsInsight:"An excellent numerical fit cannot validate a baseline that was assumed rather than measured.",
   sourceRefs:scatter.sourceRefs,accuracyRefs:scatter.accuracyRefs
  },second.id);
 }else if(kind==="unclear"){
  second=entry(kind+"-pmcc","substantial",{
   title:"Calculate the strength of linear association",
   purpose:"Check whether any straight-line relationship is supported by the scattered invented points.",
   technique:"Pearson's product-moment correlation coefficient",methodId:"pmcc",kind:"model",
   result:"Using all six synthetic pairs: Pearson's r = "+r+", with r² = "+display(fit.r**2,4)+
     ". Fitted line (diagnostic only): "+line+".",
   observationText:"The coefficient is close to zero; a line accounts for about "+display(100*fit.r**2,2)+"% of the artificial y-variation.",
   interpretation:"There is little evidence of a linear relationship in this small constructed table. r≈0 is not proof of independence or no nonlinear structure.",
   localTakeaway:"There is no convincing reason to use the weak line for prediction; examine how variable the data are.",
   limitations:d.limitation,nextQuestion:"Do simple grouped summaries reveal a stable directional difference?",
   nextWhy:"A descriptive check can support a reasoned stopping decision without forcing an unrelated technique.",
   previousTakeaway:scatter.localTakeaway,bridge:"An unstructured scatter leads to quantifying, not assuming, weak linear association.",
   mathsInsight:"An inconclusive result is a legitimate result when properly interpreted and limited.",
   sourceRefs:scatter.sourceRefs,accuracyRefs:scatter.accuracyRefs
  },scatter.id);
  const low=(y[0]+y[1]+y[2])/3,high=(y[3]+y[4]+y[5])/3;
  third=entry(kind+"-means","substantial",{
   title:"Check descriptive variation without forcing a model",
   purpose:"Compare two small groups to decide whether the initial story is supported.",
   technique:"Simple grouped means and descriptive comparison",methodId:"other",kind:"model",
   result:"Mean response at x=4–6 h: "+display(low,2)+" ms; at x=7–9 h: "+display(high,2)+
     " ms. Difference (later − earlier): "+display(high-low,2)+" ms.",
   observationText:"The group means are close relative to the large point-to-point fluctuations.",
   interpretation:"These chosen groups do not provide persuasive evidence of a downward sleep/reaction-time pattern.",
   localTakeaway:"The mathematical outcome is genuinely inconclusive for this fictional table, so a complex fit would not be justified.",
   limitations:"Two groups of three invented observations are not an inferential test or population evidence.",
   nextQuestion:d.extension,nextWhy:"A changed data-collection design is more defensible than another arbitrary calculation.",
   previousTakeaway:second.localTakeaway,bridge:"The weak coefficient prompted an interpretable variability check, not compulsory model fitting.",
   mathsInsight:"Deciding to stop an unjustified model is a mathematical decision when based on results.",
   sourceRefs:scatter.sourceRefs,accuracyRefs:scatter.accuracyRefs
  },second.id);
 }else{
  second=entry(kind+"-full","substantial",{
   title:"Quantify the full-data correlation and fit",
   purpose:"Check how strongly the unusual observation affects the apparent trend.",
   technique:"Pearson's r and least-squares regression on all six values",methodId:"pmcc",kind:"model",
   result:"With the unusual point included: r = "+r+" and least-squares "+line+
     ". At 7 h the full-line residual is +"+display(fit.residuals[3],2)+" ms.",
   observationText:"The unusual point is much higher than the line; it affects both the fitted slope and r.",
   interpretation:"The synthetic data show some negative linear association, but the fit is strongly affected by a single observation.",
   localTakeaway:"The unusually large residual justifies checking how dependent the result is on that point.",
   limitations:d.limitation,nextQuestion:"How do the regression results change if this point is omitted for a sensitivity calculation only?",
   nextWhy:"Comparing fits gives a quantitative measure of the observation's influence, not a reason to erase it.",
   previousTakeaway:scatter.localTakeaway,bridge:"Inspect the unusual point before deciding whether any regression is trustworthy.",
   mathsInsight:"A moderate correlation may conceal a largely linear cluster and one influential value.",
   sourceRefs:scatter.sourceRefs,accuracyRefs:scatter.accuracyRefs
  },scatter.id);
  const xx=xs.filter(x=>x!==7),yy=y.filter((v,i)=>xs[i]!==7),other=lineSummary(xx,yy);
  third=entry(kind+"-sensitivity","substantial",{
   title:"Compare the fit with and without the unusual pair",
   purpose:"Quantify the influence of one observation without claiming it was an error.",
   technique:"Sensitivity analysis of regression coefficients",methodId:"linear-regression",kind:"model",
   result:"All six: r = "+r+", slope = "+display(fit.slope,2)+" ms/h. Five-point diagnostic omitting (7,390): r = "+
     display(other.r,5)+", slope = "+display(other.slope,2)+" ms/h. Its predicted value at 7 h is "+
     display(other.slope*7+other.intercept,2)+" ms, about "+
     display(390-(other.slope*7+other.intercept),2)+" ms below the unusual observation.",
   observationText:"One constructed pair changes the measured linear association substantially.",
   interpretation:"The five-point result is only a sensitivity check. Without independent evidence of an error, retain all six in the reported finding.",
   localTakeaway:"An investigation can be strengthened by explaining influential observations rather than concealing them.",
   limitations:d.limitation,nextQuestion:d.extension,nextWhy:"An external validity check is needed before excluding a real observation.",
   previousTakeaway:second.localTakeaway,bridge:"The full-data residual identified an influential point worth investigating.",
   mathsInsight:"Outlier exclusion changes the mathematical question and needs justification external to the desired fit.",
   sourceRefs:scatter.sourceRefs,accuracyRefs:scatter.accuracyRefs
  },second.id);
 }
 return {d,scatter,second,third,fit};
}
function theoryEvidence(){
 const first=entry("theory-cases","first",{
  title:"Look for a relationship between cubes and triangular numbers",
  purpose:"Investigate the first few cases before claiming any general identity.",
  technique:"Small numerical cases and a structured table",methodId:"other",kind:"theory",
  result:"n=1: 1³=1=T₁²; n=2: 1³+2³=9=T₂²; n=3: 1³+2³+3³=36=T₃²; n=4: 1³+2³+3³+4³=100=T₄², where Tₙ=n(n+1)/2.",
  observationText:"The sum of the first n cubes matches the square of the nth triangular number for n=1,2,3,4.",
  interpretation:"The first cases motivate the conjecture Σ(k³, k=1…n)=[n(n+1)/2]² for positive integers n. Four checks are not a proof.",
  localTakeaway:"The conjecture is plausible; a general algebraic justification is needed.",
  limitations:"Checking finitely many values cannot establish the statement for every positive integer.",
  nextQuestion:"Can adjacent triangular squares be related to one cube?",
  nextWhy:"If Tₙ²−Tₙ₋₁²=n³, the sum telescopes and the proposed identity follows.",
  bridge:"Numerical evidence suggests a general statement, so the next step must be a proof.",
  mathsInsight:"Examples discover a conjecture; they do not prove a statement about all integers."
 });
 const second=entry("theory-proof","substantial",{
  title:"Prove the sum-of-cubes identity by telescoping",
  purpose:"Establish the observed relationship for every positive integer n.",
  technique:"Algebraic factorisation and telescoping sums",methodId:"proof",kind:"theory",
  result:"Let Tₙ=n(n+1)/2 and T₀=0. Then Tₙ²−Tₙ₋₁² = (n²/4)[(n+1)²−(n−1)²] = (n²/4)(4n)=n³. Summing k=1 to n cancels the intermediate terms: Σk³=Tₙ²−T₀²=[n(n+1)/2]².",
  observationText:"Each consecutive difference of triangular squares is exactly the next integer cube.",
  interpretation:"This proves the identity for all positive integers, not just the four example cases.",
  localTakeaway:"The proof explains why the pattern holds and reveals a difference-of-squares structure.",
  limitations:"The argument is for positive integers with T₀=0; it does not establish an identity for arbitrary non-integer bounds.",
  nextQuestion:"Can the proof also yield an exact formula for cubes between two arbitrary integer limits?",
  nextWhy:"Subtracting two proven prefix sums should give a useful extension, not an unrelated technique.",
  previousTakeaway:first.localTakeaway,bridge:"The difference-of-squares calculation resolves the specific conjecture raised by the examples.",
  knowledge:"mixed",knowledgeNotes:"The algebra is familiar; presenting a telescoping argument may require independent explanation.",
  unfamiliarComponent:"Writing the sum of consecutive differences so that intermediate terms cancel.",
  researchSource:"No external proof source is claimed; the fictional reasoning is shown in full.",
  understandingExample:"(T₁²−T₀²)+(T₂²−T₁²)+⋯+(Tₙ²−Tₙ₋₁²)=Tₙ².",
  mathsInsight:"A general proof can arise from spotting how adjacent cases differ, not from checking more examples."
 },first.id);
 const third=entry("theory-extension","substantial",{
  title:"Extend the identity to a sum between two limits",
  purpose:"Find a useful general consequence of the proved formula and check a case.",
  technique:"Subtracting partial sums and factorising a difference of squares",methodId:"algebra",kind:"theory",
  result:"For positive integers 1≤m≤n, Σ(k³,k=m…n) = Tₙ² − Tₘ₋₁² = [n(n+1)/2]² − [(m−1)m/2]². Check m=3,n=5: 3³+4³+5³=27+64+125=216; T₅²−T₂²=15²−3²=225−9=216.",
  observationText:"A general interval of cubes can be found without adding each term separately.",
  interpretation:"The extension follows logically from the proved prefix-sum identity; the numerical check illustrates, but does not establish, the already derived formula.",
  localTakeaway:"The new formula answers a broader mathematical question generated by the first proof.",
  limitations:"The bounds m and n must be integers with 1≤m≤n; the formula is not a claim about arbitrary real limits.",
  nextQuestion:"Could a similar consecutive-difference construction help with fourth powers?",
  nextWhy:"That would extend the method, not merely add an unrelated calculation.",
  previousTakeaway:second.localTakeaway,bridge:"The prefix sum proven in the previous step naturally gives sums over arbitrary integer intervals.",
  mathsInsight:"Subtracting a known cumulative formula can generate useful generalisations.",
 },second.id);
 return {first,second,third};
}
function setPlan(s,values){
 for(const [key,value] of Object.entries(values))applyPlanningField(s,key,value);
}
export function createIllustrativeSample(kind,{today}={}){
 if(referenceSampleSpec(kind))return createReferenceSample(kind);
 if(!LEGACY_SAMPLE_CHOICES.some(x=>x.id===kind))throw new Error("Unknown sample illustration.");
 const isTheory=kind==="theory",sample=createProjectState();
 const course=isTheory?"AA HL":"AA SL",aim=isTheory?
  "Why does the sum of the first n cubes equal the square of the nth triangular number, and how can the result be extended?":
  "What does a constructed set of sleep-duration and reaction-time pairs reveal about the mathematical shape of their relationship?";
 const d=isTheory?null:EMPIRICAL[kind],story=isTheory?theoryEvidence():evidenceFor(kind);
 const p={
  planIdentifier:"FICTIONAL TEACHING SAMPLE — "+kind.toUpperCase(),
  ideaStatus:"yes",idea:isTheory?"The sum of consecutive cubes":"The relationship between sleep duration and reaction time",
  originalIdea:isTheory?"Patterns in powers and triangular numbers":"Synthetic sleep and reaction-time relationship",
  interest:isTheory?"Explaining why a numerical identity works, rather than simply spotting it":"How statistics and modelling can tell different stories from a scatter graph",
  aim,motivation:isTheory?
   "Small sums suggested a surprising square; I want a proof and a useful extension.":
   "I want to see how a mathematical decision should follow the shape of the evidence, especially when it is imperfect.",
  beneficiaryType:"me",beneficiary:isTheory?"Understand the structure of a mathematical identity.":"Learn to interpret a paired-variable analysis cautiously, not issue health advice.",
  intendedUse:isTheory?"Know when numerical examples are enough to conjecture, and what a general proof requires.":
   "Compare mathematical interpretations; do not use these invented numbers to change real sleep habits.",
  kind:isTheory?"theoretical":"statistics",
  statisticsContext:isTheory?"":"Paired numerical",
  dataSource:isTheory?"":"secondary",
  course,
  prediction:isTheory?"For each positive integer n, the sum of cubes 1³+⋯+n³ equals [n(n+1)/2]².":d.prediction,
  predictionWhy:isTheory?"The cases n=1,2,3,4 suggest the expression is a square. This remains a conjecture until proved.":
   "This is a hypothesis to investigate in the synthetic data, not a health claim.",
  predictionImplication:isTheory?"A proof would explain a general algebraic pattern rather than four special cases.":
   "If the plotted points supported the hypothesis, a suitable descriptive model might be worth testing.",
  predictionExploration:isTheory?"Try cases, formulate the identity precisely, and seek a proof independent of example checking.":
   "Inspect the points first; quantify only mathematical relationships justified by their shape.",
  courseSuitability:"unsure",
  suitabilityWhy:isTheory?"Ask the teacher if this proof and its extension provide enough depth for the AA HL IA.":
   "Explore appropriate AA SL correlation, model comparison and contextual interpretation; the data are fictional and cannot be submitted as empirical evidence.",
  mathsOutside:isTheory?"unsure":"within",
  otherCourseMaths:isTheory?"Algebraic difference-of-squares and telescoping proof; course suitability to confirm.":"",
  otherMaths:isTheory?"Proof using triangular numbers and consecutive differences":"",
  mathsWhy:isTheory?"Each result follows mathematically from the previous one, culminating in a general identity and extension.":
   "Correlation and regression are considered only where supported by the scatter and a clear purpose.",
  practicalEase:"4",easeImprovement:"Keep the first meaningful calculation short, then develop its mathematical consequences.",
  dependencies:isTheory?"Paper, algebra and time to check each proof step.":"A calculator or spreadsheet to verify the arithmetic; no participants or actual measurements.",
  unsecured:"",permissionNeed:"no",softwareReady:"yes",cleaningBurden:"none",
  workloadHours:"2",externalRisks:"",minimumVersion:isTheory?
   "Investigate four cases, prove the identity, and derive one justified extension.":
   "Graph six clearly labelled fictional pairs, carry out one justified analysis and explain a limitation.",
  backupMethod:isTheory?"If an algebraic route stalls, analyse the difference between adjacent cases.":
   "If real data cannot be obtained later, do not relabel this synthetic dataset as genuine: choose a validated source or switch to an appropriately scoped theoretical investigation.",
  dataSufficiency:isTheory?"":"unsure",negativeResultViable:"yes",presentationManageable:"yes",
  predictionId:"",figureType:isTheory?"table":"scatter",
  figurePurpose:isTheory?"Notice a possible square-number identity before attempting a proof.":
   "Decide whether a linear model, nonlinear model or no reliable fit is justified.",
  firstAction:isTheory?"Calculate the first few sums of cubes and compare triangular squares.":
   "Plot paired teaching values and describe their shape before calculating a coefficient.",
  firstAccuracy:isTheory?"All algebra is exact; distinguish a numerical check from a proof.":
   "The fictional y-values are displayed as whole milliseconds only for readability, not as a statement of instrument precision. Round model coefficients sensibly and retain guard digits.",
  changeTrigger:isTheory?"If the algebraic proof fails for some n, revisit the conjecture and domain.":
   "The scatter, residuals or influential point may contradict the initial expectation.",
  changeAdaptation:isTheory?"Use adjacent square differences or find a counterexample.":
   "Change the model or explain why no convincing model is supported; never remove awkward data without a reason.",
  fallbackEvidence:isTheory?"Use exact small cases and algebraic definitions.":
   "For real IA work, obtain ethically sourced genuine observations before claiming an empirical result.",
  teacherNeed:isTheory?"Depth, mathematical suitability and scope of a proof-based AA HL investigation.":
   "Whether a real source and further mathematics would be adequate for the student's course.",
  teacherQuestion:isTheory?"Does the derivation and extension show sufficient mathematical depth for my course?":
   "What extra real evidence would be needed before turning this learning demonstration into a genuine statistical IA?",
  teacherSafeAction:isTheory?"Continue checking the algebra and possible integer-domain extensions.":
   "Practice correct statistical interpretations on labelled simulated data while arranging an appropriate genuine source.",
  timelineWeeks:"8",timelineEarly:"yes"
 };
 if(!isTheory)Object.assign(p,{
  secondaryPublisher:"No publisher — constructed by Pathfinder for demonstration",
  secondaryVariables:"x = fictional hours of sleep (h), y = fictional reaction time (ms). Six pairs, x=4–9.",
  secondaryScope:"Exactly six invented cases. No participants, dates or population.",
  secondaryVerified:"no",secondaryStatus:"illustrative-only",
  dataAvailability:"some",dataReadiness:"3",
  methodReason:"Inspect the scatter before deciding which mathematical technique is appropriate.",
  alternativeMethod:"An alternative model should be tested only when justified by a mathematical feature.",
  methodLimitation:d.limitation,
  methodMitigation:"Show all invented values, explicit model assumptions and domain restrictions.",
  readinessImprovement:"Replace these fictional pairs with a properly documented and ethically obtained source for a real IA.",
  sourceRights:"unsure"
 });else Object.assign(p,{
  theoreticalAim:aim,theoreticalCase:"For n=1,2,3,4 compare the cube sum with Tₙ², where Tₙ=n(n+1)/2.",
  theoreticalPrediction:"Σ(k³,k=1…n)=[n(n+1)/2]² for positive integer n.",
  theoreticalWhy:"The first four exact cases agree, but these are not proof."
 });
 setPlan(sample,p);
 sample.planning.mathSelected=isTheory?[]:
  kind==="curved"?["AA15","AA16","AA07"]:
  kind==="linear"||kind==="unexpected"?["AA15","AA16"]:
  ["AA15"];
 sample.planning.sourceBranches.secondary=!isTheory;
 sample.planning.current="N07";sample.planning.completed=true;
 if(today)applySuggestedTimeline(sample,applyPlanningField,{today});
 else applySuggestedTimeline(sample,applyPlanningField,{today:localToday()});
 sample.planning.completed=true;sample.planning.notices=[];
 sample.demo=kind;sample.route="completing";
 sample.ui.mathIndex=0;sample.ui.mathPhase="interpret";sample.ui.studioSection="math";
 sample.ui.lastWorkRoute="completing";sample.ui.lastStudioNode="C34B";
 sample.project.documentUrl="";
 const theory=isTheory;
 const first=theory?story.first:story.scatter,second=story.second,third=story.third;
 sample.entries=[first,second,third];
 // Student-style route choices are demonstrated, never calculated or inserted into real work.
 const sampleSignals={
  linear:["","meaningful-linear","fit-sensible"],
  curved:["","poor-fit","fit-sensible"],
  unclear:["","weak-linear",""],
  unexpected:["","uncertain","outlier-effect"],
  theory:["pattern-only","proof-established","proof-established"]
 };
 sample.entries.forEach((step,i)=>{step.resultSignal=sampleSignals[kind][i]||"";});
 sample.completion.current="C34B";sample.completion.activeEntryIndex=0;
 sample.completion.history=["C10","C20","C30","C33","C34","C40","C60"];
 sample.completion.visited=["C10","C20","C30","C31","C32","C33","C34B","C35","C40","C60","C70","C80"];
 sample.completion.nextFromEntryId=first.id;
 sample.completion.pairedDataForEntryId=theory?"":first.id;
 sample.completion.scatterPatternForEntryId=theory?"":first.id;
 sample.completion.scatterDetailForEntryId=theory?"":first.id;
 sample.completion.pmccSignalForEntryId=theory?"":second.id;
 for(const id of ["C10","C20","C30","C40","C60","C70"])sample.completion.stages[id]="complete";
 sample.completion.stages.C80="working";sample.completion.stages.C90="not-started";
 const f=sample.completion.fields;
 Object.assign(f,{
  changedSincePlanning:"The first result drove the next mathematical choice, rather than following a fixed list of techniques.",
  permissionStatus:"No real collection or restricted source: fictional demo only.",
  dataStatus:theory?"theoretical":"ready",
  dataAimLink:"The mathematical steps ask progressively sharper questions related to the stated aim.",
  dataStatusSummary:theory?"Exact definitions and examples only — no empirical dataset.":
   "Six artificial teaching pairs are available for calculations. No real source has been obtained or verified.",
  firstType:theory?"theory":"scatter",
  firstPurpose:first.purpose,firstDefinitions:theory?
   "n is a positive integer; Tₙ=n(n+1)/2 is the nth triangular number.":
   "x=simulated hours of sleep (h); y=simulated reaction time (ms); each pair uses the same invented case.",
  firstPresentation:theory?"Table of n, Σk³ and Tₙ² for n=1,2,3,4.":
   "Scatter graph with clearly labelled axes and all six constructed pairs.",
  firstResultSummary:first.result,firstObservedFeature:first.observationText,
  firstInterpretation:first.interpretation,accuracyForResult:theory?
   "Exact integer and algebraic values.":
   "The y-values are integer display conventions, not instrument readings or measured resolution.",
  aimLinkedResult:first.localTakeaway,predictionComparison:theory?
   "The initial cases support, but do not prove, the conjecture; the next step supplies a proof.":
   "The observed shape is compared explicitly with the tentative prediction rather than assuming the prediction was correct.",
  benefitFinding:theory?"A mathematical explanation of the identity, not a real-world effect.":
   "Understanding responsible interpretation of invented data; no individual is advised.",
  surpriseReason:kind==="unexpected"?"One synthetic point (7 h,390 ms) is unusually high.":
   kind==="unclear"?"The hypothesised negative trend is not supported.":"",
  surpriseCheck:kind==="unexpected"?"Compare all-six and five-point fits as sensitivity checks; do not delete the point.":"Investigate the reason before changing the method.",
  nextQuestion:third.nextQuestion,nextMethod:third.technique,nextReason:third.nextWhy,
  nextLocation:"After the current mathematical argument, if further work is warranted.",
  variableDefinitions:theory?"n,m positive integers; Tₙ=n(n+1)/2.":
   "x: constructed sleep duration in hours; y: constructed response time in ms. No actual measurement units are being claimed.",
  specialistTerms:theory?"Triangular number; telescoping sum; conjecture versus proof.":
   "Pearson's r measures linear association. Regression line predicts y for a specified x. Residual = observed minus predicted.",
  sourceReferences:theory?"No external results claimed; the derivation is displayed in the demonstration.":
   "These points are invented by Pathfinder for instruction; this is not an external dataset citation.",
  mainConclusion:third.localTakeaway,
  conclusionBenefit:theory?"A general algebraic identity and interval-sum extension were established.":
   "The illustration demonstrates how mathematical interpretation changes when data shape or unusual points matter.",
  conclusionExtension:third.nextQuestion,
  notationIssue:theory?"Keep n, m and Tₙ consistent; state integer domains.":
   "Label x in hours and y in milliseconds; do not confuse r with a regression slope.",
  presentationIssue:"Integrate tables/graphs alongside mathematical explanation, not as unexplained appendices.",
  referencesIssue:theory?"Any independently researched method must be referenced if used in real IA work.":
   "Synthetic data cannot be cited as a real source; obtain and cite genuine data for a submitted IA.",
  nextStepSelected:"A mathematical next question is recorded after each completed step."
 });
 if(theory){
  Object.assign(f,{
   actualSourceType:"theoretical",actualSource:"Definitions of triangular numbers and small exact integer cases.",
   actualMethod:"Define Tₙ=n(n+1)/2; calculate small sums and derive adjacent differences symbolically.",
   theoreticalObject:"Sums of consecutive integer cubes and squares of triangular numbers.",
   theoreticalCase:"n=1,2,3,4 with exact calculations.",
   theoreticalAssumptions:"Positive integer n; for interval sum use 1≤m≤n.",
   theoreticalQuestion:aim,chosenMethod:"Algebraic telescoping",
   methodReason:"The difference between adjacent triangular squares is exactly one cube.",
   methodLimitation:"Checking small cases alone is not a proof.",
   limitationConsequence:"A numerical pattern may fail later even if early cases agree.",
   limitationMitigation:"Give the complete difference-of-squares derivation and state the domain.",
   limitationAcceptable:"The theorem is proven for positive integer n; no claim beyond this domain.",
   courseLevel:"AA HL",courseWhy:"A proof-focused teaching illustration; teacher to confirm appropriate depth.",
   researchedMethod:"Telescoping (explained in the sample, no external source claimed).",
   researchedUnderstanding:"The differences Tₖ²−Tₖ₋₁² cancel when added over consecutive k.",
   mathsLearning:"A proof establishes a general result and yields a new formula by subtracting sums."
  });
 }else{
  Object.assign(f,{
   actualSourceType:"secondary",
   actualSource:"Six explicitly FICTIONAL paired values generated solely for Pathfinder teaching: "+pairText(d.y),
   sourceCitation:"No real publication. These values are a synthetic teaching dataset, not a verified secondary source.",
   actualMethod:"Create six illustrative pairs with x=4…9 h; use all six; check calculations against the displayed table.",
   sourcePopulation:"No real participants or target population.",
   dataCount:"6 simulated pairs",collectionStatus:"Only a synthetic teaching table exists; no human data collection.",
   statisticalPopulation:"None — simulation, not observations of an actual group.",
   sampleOrCensus:"unsure",samplingMethod:"Constructed demonstration; no sampling frame, survey or random selection.",
   samplingRationale:"This example teaches statistical workflow only. There is no sampling design or empirical generalisability.",
   sampleSize:"6 (invented)",pairing:"Each fictional x-value is associated with exactly one fictional y-value.",
   responseBias:"Not estimable: there were no participants or responses.",
   groupFairness:"No real groups were sampled or compared.",
   dataCleaning:"All six invented pairs retained. No filtering, imputation or invented exclusion.",
   modelEvidence:"Only these six constructed values, with no independent evidence.",
   modelInputs:"x=4,5,6,7,8,9 hours; y="+d.y.join(",")+" milliseconds, paired in order.",
   modelAssumptions:"The points are pedagogical; any relationship is descriptive within 4–9 h. No causal inference.",
   modelDomain:"4≤x≤9 h only, and even there this is not a validated empirical model.",
   modelValidation:"Inspect scatter, residuals and (where relevant) alternative fits.",
   modelAlternative:kind==="curved"?"A baseline-adjusted exponential decay.":"Use only a model supported by the scatter and residual evidence.",
   modelSensitivity:kind==="unexpected"?"Compare all-six and five-point diagnostic fits; keep the full dataset.":
    kind==="curved"?"Check sensitivity to the assumed 250 ms baseline.":"Vary the constructed values to see whether interpretation is stable.",
   actualDate:"No collection date (constructed demonstration).",
   alternativeMethod:"A different model is conditional on the graph shape and residual evidence.",
   chosenMethod:second.technique+"; "+third.technique,
   methodReason:d.fitWhy,
   methodLimitation:d.limitation,limitationConsequence:"Cannot generalise to real individuals or infer causation.",
   limitationMitigation:"Label the synthetic origin, restrict the mathematical domain, show all pairs and explain assumptions.",
   limitationAcceptable:"Acceptable for learning the process; not acceptable as a real IA data source.",
   accuracyQuantity:"Synthetic reaction time",accuracySymbol:"y",accuracyUnit:"ms",
   accuracyResolution:"1 ms display increment only (not instrument precision)",
   accuracyPolicy:"Whole-ms teaching table; use guard digits in calculations and round final coefficients to 2–5 decimals as labelled.",
   accuracyReason:"Readability of a fabricated table, never an estimate of actual measurement uncertainty.",
   accuracyDataType:"simulated",
   scatterPattern:d.shape,scatterDetail:d.detail,pairedDataType:"paired-numerical",
   scatterAimRelevance:"The shape determines which further statistical question is worth asking.",
   pmccInterpretation:kind==="curved"?
    "A sizeable |r| is compatible with a curved relationship; use the residual shape before fitting a line.":
    second.interpretation,
   technologyTool:"Illustrative regression arithmetic, independently checked against the six synthetic pairs",
   technologyForEntryId:kind==="curved"?second.id:kind==="linear"?third.id:second.id,
   technologyInput:"x="+xs.join(",")+"; y="+d.y.join(","),
   technologyOutcome:second.result,technologyInterpretation:second.interpretation,
   courseLevel:"AA SL",courseWhy:"The selected examples use scatter, r and algebraic modelling as relevant.",
   mathsLearning:third.mathsInsight
  });
  const src={id:"fictional-"+kind,legacy:false,fields:{
   dataStatus:"ready",actualSourceType:"secondary",
   actualSource:"FICTIONAL TEACHING DATA: "+pairText(d.y),
   sourceCitation:"Created for a demonstration; no publisher, URL or verifiable empirical provenance.",
   actualMethod:"Compute using the six displayed invented pairs; no selection of real respondents.",
   statisticalPopulation:"None (constructed sample)",sampleOrCensus:"unsure",
   samplingMethod:"No sampling: points are deliberately synthetic.",sampleSize:"6 simulated pairs",
   pairing:"One x and one y per fictional case",dataCleaning:"All values retained",
   modelEvidence:"The six internally constructed pairs",modelInputs:"x=4..9 h; y="+d.y.join(",")+" ms",
   modelAssumptions:"Teaching example only. Validity of any model is restricted to invented values.",
   modelDomain:"4≤x≤9 h",methodReason:d.fitWhy,
   methodLimitation:d.limitation,dataAimLink:"Use the plot and calculations to answer the stated mathematical question."
  }};
  sample.completion.sourceRecords=[src];sample.completion.activeSourceId=src.id;
  sample.completion.accuracyDecisions=[{id:"display-"+kind,
   quantity:"Simulated reaction time",symbol:"y",unit:"ms",
   resolution:"Integer display step (NOT measurement precision)",
   policy:"Display simulated y as integers; guard digits in calculations; rounded estimates clearly labelled.",
   reason:"Presentation choice only; constructed data have no physical instrument uncertainty.",
   sourceId:src.id}];
  sample.completion.confirmedLimitations=[{
   id:"demo-limit-"+kind,sourceId:src.id,stage:"C40",entryId:third.id,
   explanation:d.limitation,consequence:"The mathematical finding concerns invented points, not real people.",
   mitigation:"Clearly label fictional data and only draw claims supported by calculations.",
   location:"Illustrative final analysis and conclusion",at:"Fictional example, not a student approval"
  }];
 }
 Object.assign(f,{
  dataStatusSummary:theory?f.dataStatusSummary:"The available six pairs are fabricated and cannot serve as a genuine secondary source.",
  nextQuestion:third.nextQuestion
 });
 sample.ideaExplorer.shortlist=[{
  id:"idea-1",savedId:"",seedId:"own",question:aim,detail:theory?
   "Exact numerical cases followed by a proof and interval-sum extension.":
   "A fictional demonstration comparing shapes, correlation, fit and limitations.",
  focus:"Mathematical reasoning, not a real empirical claim",
  trialNote:"A small complete example shows which mathematical question should follow.",
  trialStatus:"workable",
  checks:{}
 }];
 sample.ideaExplorer.nextId=2;
 sample.teacher.concerns=[p.teacherQuestion];sample.teacher.pendingApproval=false;
 sample.teacher.checkpoints=[];
 return enrichCurrentIllustrativeSample(sample,kind,{lineSummary,exponentialSummary});
}
