import {newGraphDraft} from "../../diagrams/graph-core.js";
import {newStatDraft} from "../../diagrams/stat-studio-core.js";
import {newTableDraft} from "../../diagrams/table-studio-core.js";
import {SOURCE_FIELDS} from "../../completing/evidence-links.js";

/**
 * A finite, reproducible fictional case sequence, not measurements from a grinder.
 * Authoring recipe: Python random.Random(1842); 60 successive gauss(18.16, 0.20)
 * values, each rounded to two decimal places. The first sequence was retained in
 * full and in its original order. The recipe is disclosed to prevent the later
 * fitted normal comparison being mistaken for independent physical validation.
 */
export const GRINDER_MASSES=Object.freeze([
 18.38,18.55,18.26,17.95,18.55,18.31,18.22,18.17,18.19,18.47,
 18.05,17.94,18.08,18.27,18.50,18.49,18.16,18.47,18.37,17.91,
 17.96,17.96,18.11,18.13,18.01,18.31,18.19,18.32,18.37,18.00,
 17.97,18.05,18.10,18.27,17.76,18.26,17.87,17.95,17.86,18.31,
 18.18,18.06,18.23,18.12,18.07,18.67,17.90,18.20,17.98,18.15,
 18.16,18.11,18.28,18.27,18.12,17.86,18.33,18.15,18.27,18.18
]);
export const GRINDER_CONDITIONS=Object.freeze({
 target:18,lower:17.7,upper:18.3,requiredFraction:0.95,
 timerSeconds:6,displayIncrement:0.01,blockSize:10
});
export const GRINDER_CASES=Object.freeze(GRINDER_MASSES.map((mass,index)=>
 Object.freeze([index+1,GRINDER_CONDITIONS.timerSeconds,mass])));

const sum=values=>values.reduce((a,b)=>a+b,0);
const average=values=>sum(values)/values.length;
const mean=average(GRINDER_MASSES),n=GRINDER_MASSES.length;
const centredSum=sum(GRINDER_MASSES.map(mass=>(mass-mean)**2));
const sampleSD=Math.sqrt(centredSum/(n-1));
const sorted=[...GRINDER_MASSES].sort((a,b)=>a-b);
const median=values=>(values[values.length/2-1]+values[values.length/2])/2;
const inTolerance=mass=>mass>=GRINDER_CONDITIONS.lower-1e-12&&mass<=GRINDER_CONDITIONS.upper+1e-12;

/** Numerical standard-normal CDF; no external service or fitted observations. */
export function grinderNormalCDF(z){
 if(!Number.isFinite(z))return z===Infinity?1:z===-Infinity?0:NaN;
 if(Math.abs(z)>=9)return z<0?0:1;
 const upper=Math.abs(z),intervals=1200,h=upper/intervals;
 const density=x=>Math.exp(-x*x/2)/Math.sqrt(2*Math.PI);
 let total=density(0)+density(upper);
 for(let i=1;i<intervals;i++)total+=(i%2?4:2)*density(i*h);
 return 0.5+Math.sign(z)*total*h/3;
}
export function grinderNormalCoverage(location,scale){
 if(!(scale>0))return NaN;
 return grinderNormalCDF((GRINDER_CONDITIONS.upper-location)/scale)-
  grinderNormalCDF((GRINDER_CONDITIONS.lower-location)/scale);
}
function bisectIncreasing(fn,target,low,high){
 for(let i=0;i<65;i++){
  const midpoint=(low+high)/2;
  if(fn(midpoint)<target)low=midpoint;else high=midpoint;
 }
 return (low+high)/2;
}
const z975=bisectIncreasing(grinderNormalCDF,0.975,0,4);
const maximumCentredSD=(GRINDER_CONDITIONS.upper-GRINDER_CONDITIONS.target)/z975;
const residualBiasBound=bisectIncreasing(bias=>1-grinderNormalCoverage(18+bias,0.15),0.05,0,0.1);
export const GRINDER_BLOCKS=Object.freeze(Array.from({length:6},(_,index)=>{
 const masses=GRINDER_MASSES.slice(index*10,index*10+10),blockMean=average(masses);
 return Object.freeze({first:index*10+1,last:index*10+10,mean:blockMean,
  sampleSD:Math.sqrt(sum(masses.map(mass=>(mass-blockMean)**2))/9),
  within:masses.filter(inTolerance).length});
}));
export const GRINDER_WINDOW_CHECKS=Object.freeze([53,54,57].map(count=>{
 const windows=Array.from({length:n-count+1},(_,index)=>Object.freeze({
  firstRank:index+1,lastRank:index+count,low:sorted[index],high:sorted[index+count-1],
  span:sorted[index+count-1]-sorted[index]
 }));
 const shortest=windows.reduce((best,window)=>window.span<best.span?window:best);
 return Object.freeze({count,windows:Object.freeze(windows),shortest});
}));
const centreShift=18-mean;
export const GRINDER_SCENARIOS=Object.freeze([
 {name:"Current",mean,sd:sampleSD},
 {name:"Centre only",mean:18,sd:sampleSD},
 {name:"Spread only",mean,sd:0.15},
 {name:"Centre and spread",mean:18,sd:0.15},
 {name:"Residual offset",mean:18.05,sd:0.15}
].map(scenario=>{
 const transformed=GRINDER_MASSES.map(mass=>scenario.mean+scenario.sd/sampleSD*(mass-mean));
 return Object.freeze({...scenario,normalFraction:grinderNormalCoverage(scenario.mean,scenario.sd),
  transformed:Object.freeze(transformed),transformedWithin:transformed.filter(inTolerance).length});
}));
export const GRINDER_CALCULATIONS=Object.freeze({
 n,mean,sampleSD,centredSum,descriptiveVariance:centredSum/n,
 median:median(sorted),q1:median(sorted.slice(0,30)),q3:median(sorted.slice(30)),
 min:sorted[0],max:sorted.at(-1),bias:mean-18,
 meanSquaredTargetError:average(GRINDER_MASSES.map(mass=>(mass-18)**2)),
 rootMeanSquaredTargetError:Math.sqrt(average(GRINDER_MASSES.map(mass=>(mass-18)**2))),
 below:GRINDER_MASSES.filter(mass=>mass<17.7).length,
 within:GRINDER_MASSES.filter(inTolerance).length,
 above:GRINDER_MASSES.filter(mass=>mass>18.3).length,
 fittedFraction:grinderNormalCoverage(mean,sampleSD),centreShift,
 centredFraction:grinderNormalCoverage(18,sampleSD),
 centredWithin:GRINDER_MASSES.map(mass=>mass+centreShift).filter(inTolerance).length,
 z975,maximumCentredSD,requiredSDReduction:1-maximumCentredSD/sampleSD,
 residualBiasBound
});

const sourceId="source-grinder-cases";
const sourceText="Grinder Dose Cases v1: 60 constructed masses in their supplied order; no physical grinder measurements.";
const rawTable=(columns,rows)=>[columns.join("\t"),...rows.map(row=>row.join("\t"))].join("\n");
const fixed=(value,digits=3)=>Number(value).toFixed(digits);
const caseRows=GRINDER_CASES.map(([trial,timer,mass])=>[String(trial),fixed(timer,1),fixed(mass,2)]);
const probabilityRows=Array.from({length:33},(_,index)=>{
 const location=17.6+index*0.025;
 return [fixed(location,3),fixed(100*grinderNormalCoverage(location,sampleSD),6)];
});
function graphDraft({title,number,rows,columns,xLabel,xSymbol,xUnit,yLabel,ySymbol,yUnit,
 kind="scatter",xMin,xMax,yMin,yMax,caption,source=sourceText,models=[]}){
 return {...newGraphDraft(),kind,columns,matrix:rows.map(row=>row.map(String)),raw:rawTable(columns,rows),
  xIndex:0,yIndex:1,xLabel,xSymbol,xUnit,xUnitMode:xUnit?"unit":"dimensionless",
  yLabel,ySymbol,yUnit,yUnitMode:yUnit?"unit":"dimensionless",title,figureNumber:String(number),
  sourceKind:source===sourceText?"secondary":"theoretical",sourceText:source,caption,
  xMin:String(xMin),xMax:String(xMax),yMin:String(yMin),yMax:String(yMax),models,
  includeZeroY:yMin===0,showPoints:true,showGrid:true,showLegend:models.length>0,equationPlacement:"legend"};
}
function tableDraft({title,number,columns,rows,units,note,purpose}){
 return {...newTableDraft(),mode:"compact",headers:"yes",columns,headings:columns,
  matrix:rows.map(row=>row.map(String)),raw:rawTable(columns,rows),
  unitDecisions:units.map(unit=>({mode:unit?"unit":"dimensionless",unit})),
  title,number:String(number),purpose,sourceKind:"theoretical",
  sourceText:"My calculations from Grinder Dose Cases v1 and the stated scenarios.",note,
  numberFormat:"source",showRowLines:true,cellAlignment:"numeric"};
}
const sourceFields={
 dataStatus:"ready",actualSourceType:"secondary",actualSource:sourceText,
 sourceCitation:"Grinder Dose Cases v1. Original constructed teaching data supplied with this project, including the complete ordered table and declared generation recipe.",
 actualMethod:"I analysed all 60 supplied masses in their original order. The scenario assigns every case the same 6.0 s timer setting and a 0.01 g display increment. The cases were generated once with Python Random(1842), using gauss(18.16, 0.20) and rounding to two decimal places. They are not a physical experiment.",
 statisticalPopulation:"My descriptive results concern the 60 supplied cases. A physical population of future grinder doses has not been sampled or validated.",
 sampleOrCensus:"",
 samplingMethod:"I retained the complete constructed sequence, including its largest and smallest values; I did not choose a favourable run or discard initial cases.",
 samplingRationale:"Keeping order makes apparent changes visible. Including the entire fixed sequence prevents a tolerance fraction from being improved through selective exclusions.",
 sampleSize:"60 cases, divided into six consecutive blocks of 10 for the order check.",
 pairing:"Each mass stays attached to its original trial index. The index is order, not a second independently measured variable or elapsed time.",
 responseBias:"No people were surveyed. The dominant selection limitation is that a synthetic sequence cannot establish how a real grinder behaves across beans, settings or runs.",
 dataCleaning:"I checked that trial IDs 1–60 occur exactly once and all masses have two decimal places. I retained every value, including trial 46 at 18.67 g, and made no replacements or exclusions.",
 modelEvidence:"The histogram and numerical summaries describe the finite cases. The known normal construction explains why a normal comparison is informative as a model exercise; it cannot independently validate normality for physical doses.",
 modelInputs:"Individual mass X in g; fitted location equal to the case mean 18.172333… g and fitted scale equal to sample SD 0.196368… g; target 18.00 g; inclusive tolerance 17.70–18.30 g; desired fraction 0.95.",
 modelAssumptions:"The normal comparison assumes a fixed location and scale for individual masses. Future-run interpretation would also need evidence about stable operating conditions and dependence. Translation and rescaling scenarios assume that all deviations change by the same stated rule; they are not new observations.",
 methodLimitation:"The apparent shift between early and later blocks makes a single pooled location questionable for a physical process. Neither one histogram nor the known synthetic generating rule verifies a real grinder.",
};
const completionFields={
 ...sourceFields,
 changedSincePlanning:"The ordered blocks made me restrict the normal calculation to a conditional comparison. The centering calculation then showed that correcting the average alone could not achieve my 95% objective, so I investigated the spread and the sensitivity to a remaining offset.",
 permissionStatus:"not-needed",permissionNotes:"I used only declared constructed cases and public mathematical references. I collected no participant or business data.",
 dataStatusSummary:"There is no calibration record or independent physical run. I cannot determine true weighing accuracy, physical stability or how a timer adjustment changes the mass distribution from these cases.",
 dataAimLink:String.raw`My aim concerns individual doses, so I need both their distances from \(18.00\text{ g}\) and the number inside \([17.70,18.30]\text{ g}\). I keep trial order because a pooled average could conceal a change during a run. My first representation therefore uses trial index horizontally and dose mass vertically.`,
 chosenMethod:"An ordered plot and fixed blocks, distribution summaries, an observed tolerance count, a conditional normal comparison, then translation and spread sensitivity.",
 methodReason:String.raw`I began with an ordered plot because repeatability requires more than a narrow-looking histogram. NIST describes the run-sequence plot as a way to inspect changes in location or spread [1]. Keeping \(i\) beside \(m_i\) lets me see whether pooling all the cases might hide such a change before I calculate a single mean and standard deviation.`,
 firstPurpose:String.raw`Do the 60 masses show an apparent change with trial order that would make a single pooled description misleading?`,
 firstMethodEvaluation:"I considered beginning with a histogram, but it would erase order. I used consecutive blocks of 10 as a transparent numerical companion to the ordered plot, fixing those equal blocks before comparing their means. I did not fit a trend line: an apparent fall over part of one short sequence would not establish a persistent drift law. The ordered plot identifies questions about stability; it does not establish independence or prove their cause.",
 firstMathsBridgePlacement:"before",firstType:"scatter",
 firstDefinitions:String.raw`\(i\) is the trial index, \(m_i\) its supplied mass in g, and \(n=60\). The fixed timer setting is \(6.0\text{ s}\). My target is \(18.00\text{ g}\), my inclusive tolerance is \(\pm0.30\text{ g}\), and my desired fraction within tolerance is \(0.95\). These are design choices, not published coffee standards.`,
 firstPresentation:"Figure 1 preserves all 60 cases in order. Its lower vertical bound is the lower tolerance limit, 17.70 g, and its horizontal reference is the upper limit, 18.30 g; the truncated mass scale is explicit.",
 variableDefinitions:String.raw`\(m_i\): supplied mass (g); \(\bar m\): case mean (g); \(s\): sample standard deviation (g); \(b=\bar m-18\): mean offset (g); \(X\): individual mass in a conditional normal model; \(\mu,\sigma\): its location and standard deviation (g); \(\Phi\): standard-normal cumulative distribution function; \(d\): common shift (g); \(k\): dimensionless spread multiplier.`,
 specialistTerms:"A timed dose is the mass delivered during one fixed timer cycle. I use reliability to mean being within my stated mass tolerance; I do not infer coffee flavour or beverage quality from mass alone.",
 modelDomain:"The fixed 6.0 s scenario and mass band 17.70–18.30 g. The sensitivity calculation varies assumed means from 17.60 to 18.40 g and positive standard deviations; it does not extrapolate a fitted mass-versus-time rule.",
 modelValidation:"I compared the fitted normal proportion with the observed fraction as an internal descriptive check. I did not use the same cases to claim independent validation. New ordered physical runs, a checked balance and justified operating conditions would be needed for that.",
 modelAlternative:"I retained the empirical tolerance fraction and used a sorted-window argument that makes no normal assumption. This established a centering limitation even if I decline a normal probability forecast.",
 limitationConsequence:"The 75% case fraction and the 73.41% conditional normal area are different quantities. Neither establishes the probability for a physical grinder's next dose.",
 limitationMitigation:"I preserved order, reported the block means, kept every supplied case, declared the construction recipe and separated observed results from hypothetical changes in mean and spread.",
 limitationAcceptable:"I can answer how this finite sequence performs and what the stated normal scenarios would require. I cannot select a new timer setting or certify future physical reliability.",
 accuracyForResult:"I retain unrounded means, standard deviations and normal probabilities in calculations. I display original masses to 0.01 g, derived means and SDs usually to 0.001 g, and model percentages to 0.01 percentage points.",
 accuracyQuantity:"Dose mass",accuracySymbol:"m",accuracyUnit:"g",
 accuracyResolution:"The supplied values use a 0.01 g display increment. Ideal nearest-increment rounding would contribute at most 0.005 g; calibration accuracy and other measurement errors are not supplied.",
 accuracyPolicy:"I retain the original two-decimal inputs, use guard digits in transformations and compare endpoints before rounding displayed results.",
 accuracyReason:"Resolution controls the reporting grid, not the unknown true-mass error. Later shifts put cases exactly on tolerance boundaries, so display rounding could matter to those hypothetical counts.",
 predictionComparison:"I expected clustered masses to make a fixed timer useful, but the actual within-tolerance fraction was only 75%. Even exact centering left too much variation for my 95% objective, under either the finite-case argument or the conditional normal comparison.",
 benefitFinding:"I would keep weighing individual doses in the proposed setup until a new physical check supports the desired tolerance. My calculations identify separate centering and spread targets rather than an unsupported timer adjustment.",
 technologyTool:"I used the native ordered graph, histogram and tables, together with a calculation file for summaries, sorted windows and numerical normal CDF evaluations.",
 technologyInput:"All 60 masses in original order; limits 17.70 and 18.30 g; normal parameters mu=18.172333… and sigma=0.196368… g. For sensitivity I changed the assumed mean and SD explicitly and kept the limits fixed.",
 technologyOutcome:String.raw`My conditional fitted-normal area is \(0.73411993\). At \(\mu=18\), the maximum SD giving area \(0.95\) is approximately \(0.153064\text{ g}\). With \(\sigma=0.15\text{ g}\), the permitted magnitude of a mean offset is approximately \(0.030568\text{ g}\).`,
 technologyInterpretation:"I checked normal areas by direct numerical integration, checked the centered result using equal tails, and bracketed the final offset threshold between 0.0305 and 0.0306 g. The output describes individual model masses, not confidence in an estimated mean.",
 courseWhy:"Descriptive statistics and normal probabilities answer the reliability question. Expanding squared deviations explains bias versus spread, and translation plus a sorted-window argument tests a practical change without needing a new distributional assumption.",
 courseConcern:"My probability conclusions remain conditional because the evidence is constructed and does not establish a stable physical process. The central methods are descriptive statistics, algebra and normal distribution calculations at AI SL scope; I have made no teacher-approval claim.",
 mathsLearning:"I learned that removing a mean error and reducing variation solve different parts of the problem. I also found that the shift giving the largest finite tolerance count need not place the finite mean exactly at the target.",
 notationIssue:"I distinguish the sample variance with denominator 59 from the descriptive mean squared deviation with denominator 60. In N(mu,sigma squared), the second parameter is variance. Percentages describe individual model masses, never a confidence interval for the mean.",
 presentationIssue:"I placed the ordered plot before the pooled histogram, kept the complete 60-case table in the working data, and used compact tables for block means, probabilities, window widths and sensitivity. I checked the complete exported layout, including the distinction between calculated probabilities and observed case counts.",
 referencesIssue:"The data source explicitly says constructed, and its generation recipe is retained. I cite NIST's run-sequence and normal-distribution pages where those methods enter the argument; neither is the source of my masses or chosen tolerance.",
 draftComplete:"ready",
 finalProofread:"I read every page of the PDF and Word exports and checked the reader at desktop and phone widths. The probability graph, table headings, normal equations and sorted-window argument remain complete; each section heading stays with its opening prose. I have not recorded a peer, teacher or school-format check.",
};

export const GRINDER_RELIABILITY_SPEC={
 id:"grinder-reliability",routeId:"variation",
 title:"How reliable is a timed coffee-grinder dose?",
 description:"An 18 g dose investigation separates a shifted average from variation, then tests whether centering or reduced spread could meet a declared tolerance.",
 course:"AI SL",mathSelected:["AI13","AI18"],technologyStage:4,
 readingNote:"A complete fictional student investigation using 60 supplied constructed masses in their original order. The data recipe, fixed-setting assumptions and hypothetical improvement scenarios are declared.",
 provenance:"This is an original fictional student investigation. Grinder Dose Cases v1 consists of 60 synthetic masses, not readings from a real grinder or balance. To reproduce the authoring sequence in Python, initialise random.Random(1842), take 60 successive gauss(18.16, 0.20) values and round each to two decimal places. The first generated sequence was frozen in its original order without exclusions. The recipe is an authoring device and is disclosed; its normal construction cannot independently validate any normal model for physical doses. The fixed 6.0 s timer, 18.00 g target, inclusive ±0.30 g tolerance, 95% desired fraction and 0.01 g display increment are scenario choices. No experiment, calibration, new setting, external review, submission or awarded mark is claimed.",
 planning:{
  planIdentifier:"Timed grinder: centre, spread and tolerance",ideaStatus:"yes",
  provisionalTitle:"How reliable is a timed coffee-grinder dose?",
  idea:"I want to investigate whether one fixed timer cycle could deliver an 18 g dose consistently enough for a coffee setup I am designing.",
  aim:"To determine how the 60 constructed masses at one fixed 6.0 s setting meet my inclusive 17.70–18.30 g tolerance, and investigate what centering and variation would need to change to reach a desired 95% within that band.",
  motivation:"Using a timer would be convenient, but an average near 18 g would not reassure me if many individual doses needed correction. I want a mathematical definition of consistent enough before judging the cases.",
  beneficiaryType:"me",beneficiary:"I would use the result to decide whether my proposed timed-dose setup still needs individual weighing and what a later physical trial should investigate.",
  intendedUse:"I will distinguish the finite fraction meeting my criterion from conditional model probabilities and use the difference to decide what is still unverified.",
  kind:"statistics",statisticsContext:"One numerical variable",dataSource:"secondary",course:"AI SL",
  prediction:"I expect the masses to cluster, but I suspect that a satisfactory average alone will not be enough for 95% to fall within ±0.30 g.",
  predictionWhy:"Some doses can be too high and others too low even when their signed errors cancel. A timer controls duration, whereas my criterion concerns each delivered mass.",
  predictionImplication:"If centering alone is insufficient, I will need to investigate spread rather than recommend a timer change from the average error alone.",
  courseSuitability:"yes",mathsOutside:"syllabus",
  mathsRevisedWhy:"I will begin with order and distribution, then choose any probability model conditionally. A location or spread sensitivity check will be useful only if it follows an actual limitation of the first result.",
  permissionNeed:"no",permissionDetails:"I will analyse the supplied constructed cases and public mathematical references, with no personal data or proposed human participants.",
  practicalBlocker:"no",dataAvailability:"in-hand",
  firstAction:"I will preserve trial order, plot all 60 masses and compare six consecutive blocks of 10 before pooling the data.",
  firstAccuracy:"I will preserve the supplied 0.01 g increments and carry extra digits in calculations. I will not turn that display resolution into a claim that true masses are accurate to 0.01 g.",
  teacherNeed:"I would discuss whether my distinction between descriptive counts and conditional probabilities is clear enough for the investigation's scope.",
  teacherQuestion:"Does my explanation show why a distribution model and a physical reliability claim need different evidence?",
  teacherSafeAction:"I can verify the full case table, arithmetic, transformations and source descriptions while that scope question remains open.",
  teacherExtra:"I would like feedback on the reasoning connecting the centering limitation to the spread investigation, without adding a statistical test solely for complexity.",
  universalTeacherQuestion:"Have I restricted the conclusion clearly enough to the constructed cases and explicit model conditions?",
  secondaryPublisher:"Grinder Dose Cases v1, original constructed teaching data supplied with this illustrative project.",
  secondaryVariables:"Trial index i, the scenario's fixed timer setting in seconds, and dose mass m in grams to two decimal places.",
  secondaryScope:"The complete ordered sequence of 60 cases at a fixed 6.0 s setting. There are no dates, real machines or participant population attached to it.",
  secondaryVerified:"yes",secondaryStatus:"ready",
  secondarySamplingOrigin:"The first 60 values from the declared fixed-seed normal generation recipe were rounded to 0.01 g and retained without exclusions. They were not sampled from a physical grinder.",
  alternativeMethod:"The direct fraction within tolerance needs no distributional fit. I can also inspect translations of the finite cases without assuming that new physical doses follow a normal distribution.",
  readinessImprovement:"I have fixed the tolerance, desired fraction and equal block sizes before comparing the calculated outcomes, and retained the ordered source table.",
  timelineWeeks:"6",timelineEarly:"yes",
  milestoneAdjustment:"My relative working plan is definitions and sources, order and distribution, tolerance analysis, sensitivity, writing and review. I have not assigned school dates or claimed a submitted draft."
 },
 completion:completionFields,
 introduction:String.raw`I wanted to know whether a timer could replace weighing every dose in a coffee setup I was designing. The useful output for my decision is the mass delivered, not simply how long the grinder runs. I chose \(18.00\text{ g}\) as my target and, before analysing the cases, defined an acceptable displayed mass as
\[
17.70\le m\le18.30\text{ g}.
\]
Equality counts as acceptable. I also chose a desired fraction of \(95\%\) within this band. These are my design criteria, not claims about a universal coffee standard or the effect of mass on flavour.

My aim is to determine how consistently a fixed \(6.0\text{ s}\) setting meets that criterion in the supplied 60-case sequence, then investigate whether changing its centre or spread could achieve the desired fraction. I want to separate two questions: are doses generally too high or too low, and how far do individual doses vary around their own average? Those questions could lead to different changes in a proposed setup.

This is a design investigation using declared constructed data. I have not tested a physical grinder. I will distinguish conclusions about the finite cases from probabilities that depend on an assumed distribution, and keep any changed-setting scenario separate from an experiment I have not performed.`,
 dataNotes:String.raw`I used all 60 masses in Grinder Dose Cases v1, retaining their trial indices. The complete table is in the editable working data. The cases were generated once from a normal authoring sequence and rounded to two decimal places; the exact recipe is recorded with the source. That known construction is not evidence that a real grinder has a normal output. The scenario holds the timer at \(6.0\text{ s}\), with no timer calibration or relationship between duration and mass supplied.

I treated the \(0.01\text{ g}\) increment as a display convention. Ideal rounding to the nearest increment would differ from an unrounded reading by at most \(0.005\text{ g}\), but the increment tells me nothing about calibration bias or other weighing error. My numerical analysis uses the displayed masses as its fixed inputs. I therefore cannot certify a true-mass tolerance from this source.

I numbered cases \(i=1,\ldots,60\), used \(m_i\) for mass in grams, and retained every case. I fixed six consecutive blocks of ten for an order comparison. I did not remove the beginning of the sequence as a supposed warm-up period or remove large values after seeing their effect.`,
 stages:[
  {
   key:"order",title:"Does pooling the run conceal a change?",bridge:"",
   purpose:String.raw`Figure 1 shows each \(m_i\) against its original index. I joined neighbouring points only to make their order visible; the segments do not describe what happened between doses. The lower axis bound is \(17.70\text{ g}\), and the horizontal reference marks \(18.30\text{ g}\). Table 1 then summarises the same fixed blocks of ten, so I can compare location without selecting favourable portions.`,
   technique:"Run-sequence plot and consecutive-block summaries",methodId:"follow-journey",kind:"scatter",knowledge:"syllabus",
   observation:"unclear",
   observationText:"The first four ten-dose means fall from 18.305 to 18.040 g, then recover to 18.156 and 18.173 g. I see an apparent order effect without a persistent linear trend. The plot makes a pooled summary worth questioning, but cannot establish physical drift or independence.",
   result:String.raw`For each block I calculated its mean from all ten masses. For example, the first block totals \(183.05\text{ g}\), giving
\[
\bar m_{1:10}=\frac{183.05}{10}=18.305\text{ g}.
\]
The next three block means are \(18.224\), \(18.136\) and \(18.040\text{ g}\), followed by \(18.156\) and \(18.173\text{ g}\). The first-to-fourth difference is therefore \(0.265\text{ g}\), almost the size of my one-sided \(0.30\text{ g}\) tolerance. Only five of the first ten cases are acceptable, compared with nine in each of the final three blocks.`,
   interpretation:String.raw`The early part is higher than much of the middle of the sequence, although the pattern does not continue as a steady fall. A single pooled mean will hide this ordering. I cannot read the plot as six interchangeable demonstrations of the same physical performance, and I would not use a descending regression line to predict a later dose.

This changes the role of my later probability calculation. I can use one normal distribution as a conditional description of the pooled cases, but I cannot claim that the plot has established a stable physical process.`,
   limitations:"A short sequence can show apparent changes by chance; the disclosed synthetic generation does not make this pattern evidence of warming up or grinder drift. Conversely, a plot without an obvious trend would not establish independence. I would need repeated physical runs and information about operating conditions to investigate those questions.",
   localTakeaway:"The first four block means fall by 0.265 g overall, so a pooled normal comparison must remain conditional and cannot certify stable physical performance.",
   nextQuestion:"How much of the mismatch with 18 g comes from the average offset, and how much from variation around that average?",
   nextWhy:"The order check limits interpretation, but it does not quantify the size of the overall error. I next need a distribution and separate measures of centre and spread.",
   mathsInsight:"A histogram can preserve every value while discarding information relevant to reliability: the order in which the values occur.",
   methodChangeReason:"I kept the order warning in view when moving to pooled summaries, rather than treating pooling as proof of constant behaviour.",
   outcomeId:"uncertain"
  },
  {
   key:"centre-spread",title:"Is the main problem an offset or a wide spread?",
   bridge:"I kept all 60 cases together for a descriptive calculation, while retaining the warning that their order raises.",
   purpose:String.raw`I chose \(0.10\text{ g}\) histogram classes so their widths are easy to compare with my \(0.60\text{ g}\) acceptance band. Figure 2 uses frequency density as its vertical scale: a class with frequency \(f\) has height \(f/0.10\). The labels give the actual counts. I then calculated summaries from the original values, not from class midpoints.`,
   technique:"Histogram, mean, median, standard deviation and squared-error decomposition",methodId:"follow-journey",kind:"model",knowledge:"syllabus",
   result:String.raw`The total mass is \(1090.34\text{ g}\), so
\[
\bar m=\frac{1090.34}{60}\approx18.172333\text{ g}.
\]
The median is \(18.165\text{ g}\). Using the medians of the lower and upper halves gives \(Q_1=18.030\), \(Q_3=18.295\), and \(\mathrm{IQR}=0.265\text{ g}\). The range is \(18.67-17.76=0.91\text{ g}\). The usual \(1.5\mathrm{IQR}\) fences are \(17.6325\) and \(18.6925\text{ g}\); no case lies outside them. I retained the high value \(18.67\text{ g}\), which is still a genuine part of this supplied list.

With the conventional sample standard deviation,
\[
s=\sqrt{\frac{\sum_{i=1}^{60}(m_i-\bar m)^2}{59}}
  =\sqrt{\frac{2.275073333\ldots}{59}}
  \approx0.196368\text{ g}.
\]
The mean offset is \(b=\bar m-18\approx0.172333\text{ g}\). To connect the two quantities, I wrote \(m_i-18=(m_i-\bar m)+b\), squared and summed. The cross term vanishes because \(\sum(m_i-\bar m)=0\), leaving
\[
\frac1{60}\sum(m_i-18)^2
=\frac1{60}\sum(m_i-\bar m)^2+b^2.
\]
Numerically this is \(0.067616667\approx0.037917889+0.029698778\), in \(\text{g}^2\). The root mean squared distance from the target is therefore approximately \(0.260032\text{ g}\).`,
   interpretation:String.raw`The histogram has one broad concentration near \(18.1\)–\(18.3\text{ g}\), with a longer upper extreme. The close mean and median do not make the average correct for my target: both exceed \(18.00\text{ g}\). Around \(43.9\%\) of the mean squared target error is the squared offset, with the rest due to variation around the mean. This decomposition makes centering worth examining, but also shows why it cannot remove all of the error.

I used denominator \(60\) in the decomposition because I was averaging the squared errors of these 60 cases. I used denominator \(59\) in \(s^2\), the conventional sample variance I will insert into the conditional normal comparison. Substituting \(s^2\) for the first term of that identity would be incorrect.`,
   limitations:"The choice of bin width affects appearance, and an absence of Tukey outliers is not a normality test. The target RMSE is an overall distance measure, not the fraction of doses that meet the tolerance. None of these summaries resolves the ordering issue or establishes balance accuracy.",
   localTakeaway:"The mean is 0.172333 g high and the sample SD is 0.196368 g; removing the offset would leave substantial variation.",
   nextQuestion:"What fraction actually lies within tolerance, and what would a pooled normal comparison say about individual masses?",
   nextWhy:"My criterion is a fraction within a fixed band, so I now need to count that event directly rather than substitute a mean, SD or RMSE for it.",
   mathsInsight:"The squared-error identity separates an avoidable location offset from the spread that a common shift cannot change.",
   methodChangeReason:"A descriptive error magnitude did not answer the stated tolerance question, so I moved to direct counts and an explicitly conditional probability calculation.",
   outcomeId:"wide"
  },
  {
   key:"tolerance",title:"What does the observed tolerance fraction establish?",
   bridge:"I used my original acceptance band to classify every case, without widening it after seeing the distribution.",
   purpose:String.raw`I first counted the finite cases. I then used a normal model only as a comparison whose assumptions remain visible. Its parameters describe individual masses, not sample means. The known normal authoring recipe and the broadly single-peaked histogram make this an interpretable mathematical scenario; neither supplies physical validation.`,
   technique:"Observed tolerance proportion and conditional normal probabilities",methodId:"normal",kind:"model",knowledge:"syllabus",
   result:String.raw`There are no masses below \(17.70\text{ g}\), \(45\) inside the inclusive band, and \(15\) above the \(18.30\text{ g}\) upper limit. My observed case fraction is
\[
\widehat p=\frac{45}{60}=0.75.
\]
For the conditional comparison I used \(X\sim N(\bar m,s^2)\), with \(\bar m\approx18.172333\) and \(s\approx0.196368\), in grams. If \(Z\) is standard normal, \(\Phi(z)=P(Z\le z)\); standardising the two endpoints gives
\[
z_L=\frac{17.70-\bar m}{s}\approx-2.405342,
\qquad z_U=\frac{18.30-\bar m}{s}\approx0.650138.
\]
Using the numerical normal CDF [2], I obtained
\[
P(17.70\le X\le18.30)=\Phi(z_U)-\Phi(z_L)
\approx0.73411993.
\]
Table 2 compares all three regions. The model assigns about \(0.81\%\) below the band and \(25.78\%\) above it, leaving \(73.41\%\) inside.`,
   interpretation:String.raw`The \(75\%\) finite fraction and \(73.41\%\) model area are close enough to make the scale of the problem clear: both are far from my desired \(95\%\). They are not two independent confirmations. I estimated the model parameters from the same cases being compared.

The asymmetric failures fit the positive mean offset. All 15 observed failures are high, and the model's upper tail is much larger than its lower tail because \(18.30\text{ g}\) lies only about \(0.65s\) above the fitted mean. My next question is therefore whether centering the distribution could solve the problem.`,
   limitations:String.raw`I do not adopt \(0.7341\) as a validated probability for the next physical dose. The case construction, apparent changes with order and unknown calibration prevent that conclusion. A normal probability here is an area describing individual model masses; it is not a confidence interval for a mean. I also cannot invoke the central limit theorem to make individual masses normal.

For the original count, ideal \(\pm0.005\text{ g}\) display rounding alone cannot change a classification: no supplied value is close enough to either boundary. That observation still does not bound an unknown calibration error.`,
   localTakeaway:"45/60 cases meet the band, versus a conditional normal area of 73.41%; neither meets 95%, and neither is a certified physical success probability.",
   nextQuestion:"Could any common shift of the existing masses reach 95%, or does the spread itself prevent that?",
   nextWhy:"A setting change might change the mean, but I need to test the mathematical effect of centering before treating it as a solution.",
   mathsInsight:"A distribution can look reasonably concentrated yet fail a narrow operational tolerance frequently when the band is not centred on its mean.",
   methodChangeReason:"I moved from describing the original cases to a clearly labelled translation scenario, because the large upper failure count suggests an offset worth testing.",
   outcomeId:"wide"
  },
  {
   key:"centering",title:"Can a common shift alone reach my 95% target?",
   bridge:"I treated a common mass shift as a hypothetical change, without claiming that a particular timer adjustment would produce it.",
   purpose:String.raw`I began with exact centering, \(y_i=m_i+d\) where \(d=18-\bar m\). I then widened the question to every possible common shift. This separates a property of the fixed data from a normal-model prediction and avoids choosing a shift just because it improves one summary.`,
   technique:"Translation invariance, sorted windows and fixed-width normal coverage",methodId:"algebra",kind:"model",knowledge:"syllabus",
   result:String.raw`For exact centering, \(d\approx-0.172333\text{ g}\), so \(\bar y=18\). Also
\[
y_i-\bar y=(m_i+d)-(\bar m+d)=m_i-\bar m.
\]
Every centred deviation is unchanged: the sample SD remains \(0.196368\text{ g}\). Recounting the translated values gives \(51/60=85\%\) inside the band.

To examine any shift, I sorted a copy of the masses as \(m_{(1)}\le\cdots\le m_{(60)}\). A common shift can place a group inside my tolerance only if its original span is at most \(0.60\text{ g}\). For \(k\) included values, a narrowest group can be chosen as a consecutive sorted window: skipping an intermediate value cannot reduce the two endpoints. I therefore checked all \(61-k\) windows of size \(k\), with widths \(m_{(j+k-1)}-m_{(j)}\).

Table 3 shows minimum widths of \(0.60\), \(0.61\) and \(0.69\text{ g}\) for \(53\), \(54\) and \(57\) values. A shift of \(-0.20\text{ g}\) fits the 53 values from \(17.90\) to \(18.50\text{ g}\) exactly into my band. No shift can include 54, so the finite maximum is \(53/60\approx88.33\%\). My \(95\%\) criterion would require at least \(57\) cases.

For the normal comparison with the same SD, centering gives
\[
P(17.70\le X\le18.30)
=2\Phi\!\left(\frac{0.30}{s}\right)-1
\approx0.87342299.
\]
Figure 3 plots the calculated coverage as I vary the assumed normal mean while keeping \(s\) fixed.`,
   interpretation:String.raw`For a symmetric normal density that decreases away from its mean, a fixed-width interval contains the greatest area when centred on the mean. Moving it away loses density near the centre and gains lower density in the other tail. Thus \(87.34\%\) is the best conditional normal coverage at this spread, not merely the result of one convenient trial.

The finite count is less symmetric: its best shift is \(-0.20\text{ g}\), leaving mean \(17.972333\text{ g}\), rather than exactly \(18\). This is why I did not assume that centering and maximising a finite count are identical. Both arguments nevertheless rule out reaching my objective by a common shift alone.`,
   limitations:String.raw`These are transformed cases and conditional distributions, not newly collected doses. The finite optimum places supplied values exactly on the tolerance boundaries, so its \(53/60\) count treats the displayed inputs as exact; an unknown weighing error could alter it. The sorted-window result establishes what translation can do to this list, not the best possible outcome of a physical timer change that might also alter spread.`,
   localTakeaway:"No common shift can put more than 53/60 fixed cases inside tolerance; a centred normal with the current SD reaches only 87.34%. Spread must also change in any successful model scenario.",
   nextQuestion:"How small would the spread need to be, and how sensitive would the improvement be to a remaining mean offset?",
   nextWhy:"The centering limit gives a reason to investigate scale. I can now derive a spread requirement instead of proposing an untested timer setting.",
   mathsInsight:"A translation preserves every centred deviation, while maximising a finite in-band count depends on the widths of sorted groups rather than only their mean.",
   methodChangeReason:"I added a distribution-free window argument because the normal comparison alone could not establish what translation does to the supplied finite cases.",
   outcomeId:"meaningful-result"
  },
  {
   key:"sensitivity",title:"What would meeting 95% require from centre and spread?",
   bridge:"Since centering alone was insufficient, I considered a family of hypothetical distributions with both location and spread made explicit.",
   purpose:String.raw`I wrote the general normal coverage as
\[
p(\mu,\sigma)=\Phi\!\left(\frac{18.30-\mu}{\sigma}\right)
-\Phi\!\left(\frac{17.70-\mu}{\sigma}\right),\qquad \sigma>0.
\]
This lets me change one parameter at a time. I can also define a finite transformation \(y_i=\mu'+k(m_i-\bar m)\), with \(k=\sigma'/s\); it has mean \(\mu'\) and sample SD \(\sigma'\). The rule describes a scenario, not a claim that adjusting a grinder will scale every deviation in that way.`,
   technique:"Inverse normal probability and sensitivity to location and scale",methodId:"normal",kind:"model",knowledge:"syllabus",
   result:String.raw`At \(\mu=18\), my desired condition becomes
\[
2\Phi(0.30/\sigma)-1\ge0.95
\quad\Longleftrightarrow\quad
0.30/\sigma\ge\Phi^{-1}(0.975).
\]
Since \(\Phi^{-1}(0.975)\approx1.959964\), the centred normal requirement is
\[
\sigma\le\frac{0.30}{1.959964}\approx0.153064\text{ g}.
\]
That is a reduction of at least \(22.05\%\) from the current fitted \(s\), within this model. I chose \(0.15\text{ g}\) as a nearby scenario to compare in Table 4.

Reducing spread alone, with the original mean, gives only \(80.18\%\) inside. Changing the mean to \(18.00\) as well gives \(95.45\%\). However, if that latter scenario retains a \(+0.05\text{ g}\) offset, its coverage drops to \(94.24\%\). To quantify the small margin, I solved
\[
\Phi\!\left(\frac{0.30-b}{0.15}\right)
-\Phi\!\left(\frac{-0.30-b}{0.15}\right)=0.95
\]
for positive \(b\). The root is approximately \(0.030568\text{ g}\), between \(0.0305\) and \(0.0306\text{ g}\). By symmetry, with \(\sigma=0.15\text{ g}\), the model reaches at least \(95\%\) only while the magnitude of the mean offset is no more than about \(0.03057\text{ g}\).`,
   interpretation:String.raw`The proposed improvement needs both location and spread. A mean close to target cannot compensate for the original variation, and a smaller SD does not compensate sufficiently for the original positive offset. Even the combined \(18.00\text{ g}\), \(0.15\text{ g}\) scenario has little margin against a shifted centre.

The \(0.01\text{ g}\) display increment does not certify that the true mean is within \(0.03057\text{ g}\) of the target. My \(+0.05\text{ g}\) calculation is a hypothetical sensitivity check, not a measured calibration error. It shows why calibration and repeated-run location would matter to a physical follow-up.`,
   limitations:"The calculated 95% is a fraction of individual masses under the specified normal model, not a confidence level or a guarantee about a future run. No evidence here shows that a changed setting can achieve SD 0.15 g. With only one timer setting and no physical calibration data, I cannot convert the mass offset into a justified number of seconds to add or remove.",
   localTakeaway:"A centred normal needs SD no greater than 0.153064 g to reach 95%; at SD 0.15 g, a residual mean offset above about 0.030568 g defeats that objective.",
   nextQuestion:"Would separate physical runs at defined timer settings achieve both a stable mean near 18 g and sufficiently small spread?",
   nextWhy:"I can now conclude the case study: the existing sequence fails my criterion, common centering cannot rescue it, and the improvement targets depend on conditions that a new physical investigation would need to test.",
   mathsInsight:"A threshold on spread is conditional on centering. Reporting one favourable probability without perturbing the mean would conceal how little tolerance the proposed improvement has for offset.",
   methodChangeReason:"I varied the mean after calculating the centred SD threshold because the first scenario was only slightly above 95%, making residual offset a consequential uncertainty.",
   outcomeId:"measurement-limited"
  }
 ],
 figures:[
  {id:"figure-grinder-order",tool:"graph",stage:0,after:"purpose",draft:graphDraft({
   title:"Dose masses in supplied order",number:1,kind:"time",
   columns:["Trial index","Dose mass (g)"],rows:GRINDER_MASSES.map((mass,index)=>[index+1,fixed(mass,2)]),
   xLabel:"Trial index",xSymbol:"i",xUnit:"",yLabel:"Dose mass",ySymbol:"m",yUnit:"g",
   xMin:1,xMax:60,yMin:17.7,yMax:18.7,
   models:[{id:"model-grinder-upper-limit",type:"custom",expression:"18.3",visible:true}],
   caption:"All 60 constructed cases, joined only to show order. The lower axis bound is 17.70 g; the horizontal reference is the upper tolerance limit, 18.30 g. The mass axis is truncated."
  })},
  {id:"table-grinder-blocks",tool:"table",stage:0,after:"result",draft:tableDraft({
   title:"Six consecutive blocks of ten",number:1,
   columns:["Trials","Mean","Sample SD","Within band"],units:["","g","g",""],
   rows:GRINDER_BLOCKS.map(block=>[block.first+"–"+block.last,fixed(block.mean),fixed(block.sampleSD),block.within+" / 10"]),
   note:"Blocks and tolerance were fixed before comparison; every supplied case is included.",
   purpose:"Compare changes in location and spread without discarding trial order."
  })},
  {id:"stat-grinder-distribution",tool:"stat",stage:1,after:"purpose",draft:{
   ...newStatDraft(),kind:"histogram",headers:"yes",columns:["Dose mass (g)"],
   matrix:GRINDER_MASSES.map(mass=>[fixed(mass,2)]),raw:rawTable(["Dose mass (g)"],GRINDER_MASSES.map(mass=>[fixed(mass,2)])),
   selected:[0],histogramInput:"raw",binWidth:"0.1",binStart:"17.7",histogramCompare:"single",histogramLabels:"frequency",
   title:"Distribution of the 60 supplied masses",figureNumber:"2",variable:"Dose mass",unit:"g",unitMode:"unit",
   sourceKind:"secondary",sourceText,caption:"Equal 0.10 g classes from 17.70 g. Bar heights are frequency density; labels are counts. Pooling removes the order visible in Figure 1.",
   min:"17.7",max:"18.7",showGrid:true,showLabels:true
  }},
  {id:"table-grinder-tolerance",tool:"table",stage:2,after:"result",draft:tableDraft({
   title:"Observed fractions and conditional normal areas",number:2,
   columns:["Mass region","Cases","Case fraction","Normal area"],units:["","","%","%"],
   rows:[
    ["Below 17.70 g","0 / 60","0.00",fixed(100*grinderNormalCDF((17.7-mean)/sampleSD),2)],
    ["17.70–18.30 g","45 / 60","75.00",fixed(100*grinderNormalCoverage(mean,sampleSD),2)],
    ["Above 18.30 g","15 / 60","25.00",fixed(100*(1-grinderNormalCDF((18.3-mean)/sampleSD)),2)]
   ],note:"The normal uses the same cases' mean and sample SD. This is an internal comparison, not independent physical validation.",
   purpose:"Distinguish the finite count from the probability area supplied by an assumed model."
  })},
  {id:"table-grinder-windows",tool:"table",stage:3,after:"result",draft:tableDraft({
   title:"Narrowest sorted windows",number:3,
   columns:["Values included","Windows checked","Minimum span","One achieving interval"],units:["","","g","g"],
   rows:GRINDER_WINDOW_CHECKS.map(check=>[check.count,check.windows.length,fixed(check.shortest.span,2),
    fixed(check.shortest.low,2)+"–"+fixed(check.shortest.high,2)]),
   note:"The acceptance band is 0.60 g wide. A common shift cannot compress any window's span.",
   purpose:"Check all possible translations of the finite cases without assuming a normal distribution."
  })},
  {id:"figure-grinder-mean-sensitivity",tool:"graph",stage:3,after:"interpretation",draft:graphDraft({
   title:"Normal coverage when only the mean changes",number:3,
   columns:["Assumed mean (g)","Within tolerance (%)"],rows:probabilityRows,
   xLabel:"Assumed mean",xSymbol:"μ",xUnit:"g",yLabel:"Within tolerance",ySymbol:"p",yUnit:"%",
   xMin:17.6,xMax:18.4,yMin:0,yMax:100,
   models:[{id:"model-grinder-desired-fraction",type:"custom",expression:"95",visible:true}],
   source:"My normal-CDF calculations with SD 0.196368… g and fixed limits 17.70–18.30 g.",
   caption:"Calculated probabilities at assumed means 0.025 g apart, not measured doses. The maximum is 87.34% at 18.00 g. The horizontal reference is my desired 95%."
  })},
  {id:"table-grinder-scenarios",tool:"table",stage:4,after:"result",draft:tableDraft({
   title:"Conditional location and spread scenarios",number:4,
   columns:["Scenario","Assumed mean","Assumed SD","Normal within band"],units:["","g","g","%"],
   rows:GRINDER_SCENARIOS.map(scenario=>[scenario.name,fixed(scenario.mean),fixed(scenario.sd),fixed(100*scenario.normalFraction,2)]),
   note:"Every row is a conditional normal calculation. Altered parameters are hypotheses, not results from a changed timer setting.",
   purpose:"Separate centering, spread reduction and the effect of a residual mean offset."
  })}
 ],
 sources:[{id:sourceId,fields:Object.fromEntries(SOURCE_FIELDS.map(key=>[key,completionFields[key]||""]))}],
 planningAccuracy:[{
  id:"planning-accuracy-grinder-mass",source:"secondary",quantity:"Supplied dose mass",unit:"g",
  resolution:"Two decimal places: a 0.01 g display increment.",basis:"rounded",
  uncertainty:"Ideal rounding contributes at most 0.005 g; true balance accuracy and calibration error are unknown."
 }],
 primaryQuantities:[],
 accuracy:[
  {id:"accuracy-grinder-mass",quantity:"Supplied dose mass",symbol:"m",unit:"g",
   resolution:"The constructed values are rounded to 0.01 g. An ideal rounding error is at most 0.005 g; physical balance accuracy is not known.",
   policy:"I preserve the supplied two-decimal inputs, retain guard digits and classify unrounded transformed values before displaying them.",
   reason:"Original classifications are separated from the boundaries by more than 0.005 g, but some hypothetical shifts place values on the boundaries. Resolution cannot certify calibration.",sourceId},
  {id:"accuracy-grinder-model",quantity:"Calculated normal probabilities and parameter thresholds",symbol:"p, σ, b",unit:"",
   resolution:"Numerical outputs from the stated finite inputs and conditional normal model, not additional measurements.",
   policy:"I show model probabilities to 0.01 percentage points, ordinary means and SDs to 0.001 g, and threshold values with enough guard digits to distinguish the checked bounds.",
   reason:"The numerical root is much more precise than the physical evidence. I report its conditional meaning and do not convert guard digits into measurement accuracy.",sourceId}
 ],
 dataSets:[
  {name:"Grinder Dose Cases v1",columns:["Trial index","Fixed timer (s)","Dose mass (g)"],rows:caseRows,sourceKind:"secondary",sourceText},
  {name:"Grinder ordered block calculations",columns:["First trial","Last trial","Mean (g)","Sample SD (g)","Within tolerance"],
   rows:GRINDER_BLOCKS.map(block=>[block.first,block.last,block.mean,block.sampleSD,block.within]),
   sourceText:"My calculations from all six fixed consecutive blocks of ten in Grinder Dose Cases v1."},
  {name:"Grinder sorted-window checks",columns:["Values included","First sorted rank","Last sorted rank","Lower mass (g)","Upper mass (g)","Span (g)"],
   rows:GRINDER_WINDOW_CHECKS.flatMap(check=>check.windows.map(window=>[check.count,window.firstRank,window.lastRank,window.low,window.high,window.span])),
   sourceText:"Every sorted window of lengths 53, 54 and 57; these exhaustive finite checks do not assume a normal distribution."},
  {name:"Grinder normal mean sensitivity",columns:["Assumed mean (g)","Within tolerance (%)"],rows:probabilityRows,
   sourceText:"Calculated normal probabilities with unchanged sample SD and limits 17.70–18.30 g. These points are model evaluations, not measurements."},
  {name:"Grinder hypothetical parameter scenarios",columns:["Scenario","Assumed mean (g)","Assumed SD (g)","Normal fraction","Transformed cases within band"],
   rows:GRINDER_SCENARIOS.map(scenario=>[scenario.name,scenario.mean,scenario.sd,scenario.normalFraction,scenario.transformedWithin]),
   sourceText:"Normal areas and the explicitly hypothetical transformation y=mu+(sigma/s)(m−mean). The transformed counts are not newly observed doses."}
 ],
 conclusion:{
  mainConclusion:String.raw`The supplied fixed-setting sequence does not meet my chosen reliability criterion: only \(45/60=75\%\) of the displayed masses lie within \(17.70\)–\(18.30\text{ g}\), compared with my desired \(95\%\). The mean is approximately \(18.172\text{ g}\), so the distribution is high relative to the target, but its sample SD of approximately \(0.196\text{ g}\) also matters.

Correcting the mean alone cannot solve this case study. Exact centering puts \(51/60\) translated values within tolerance, and the sorted-window argument limits any common shift to \(53/60\). Under the conditional normal comparison, even perfect centering reaches only about \(87.34\%\) at the current spread. I would therefore not recommend a timer adjustment as a sufficient solution merely because it corrected the average.`,
  conclusionBenefit:String.raw`Within a centred normal model, reaching \(95\%\) requires \(\sigma\le0.153064\text{ g}\), about \(22.05\%\) below the fitted current SD. The nearby \(0.15\text{ g}\) scenario reaches \(95.45\%\) only with careful centering; a \(0.05\text{ g}\) mean offset lowers it to \(94.24\%\). This gives me separate location and spread questions for a practical follow-up.

The sequence is constructed, its early and later blocks differ, and no balance calibration or new timer setting has been tested. I have therefore established finite-case results and conditional improvement requirements, not the future reliability of a real machine. For my proposed setup I would keep weighing individual doses until new physical evidence supports dispensing with that check.`,
  conclusionExtension:"I would next compare several defined timer settings using new ordered physical runs, with the same beans and stated operating conditions, and a balance whose calibration has been checked. I would examine whether the mean response to time is consistent across runs and whether the spread changes with setting. I would then test a chosen setting on a separate run rather than use the cases that selected it as evidence of success. That would address the missing link between my mass-based scenarios and an actual timer decision."
 },
 reviews:[
  {id:"D01",location:"Introduction, five linked stages and conclusion",
   note:"My draft includes the fixed target and tolerance, the complete source sequence, actual summaries and probabilities, a finite-window argument, conditional sensitivity and an answer to the original aim.",
   action:"I have kept the unresolved physical validation and school process separate from the completed case-study mathematics."},
  {id:"D02",location:"Order check through centering and spread sensitivity",
   note:"Each stage responds to the preceding result: an order warning limits pooling; centre and spread lead to a direct tolerance count; the offset suggests centering; centering's limit motivates a spread calculation. I have not added an unrelated statistical test.",
   action:"I checked that every transition names the question the next calculation answers."},
  {id:"D03",location:"Notation, squared-error identity, normal equations and all figure captions",
   note:"I distinguish mass in grams, variance in squared grams, percentages and dimensionless trial index. I explain the different denominators 60 and 59, define Phi, and use approximation signs for rounded results.",
   action:"I corrected the wording so a normal coverage interval cannot be mistaken for a confidence interval."},
  {id:"D04",location:"Introduction, source decisions and scenario selection",
   note:"My criteria are explicit choices made before the count. I retained every case, preserved order, rejected a timer recommendation unsupported by the source and chose a remaining-offset check because the 0.15 g scenario had little margin.",
   action:"I linked each choice to its mathematical consequence rather than adding a personal story about an experiment I did not perform."},
  {id:"D05",location:"Interpretations and limitations following each result",
   note:"I explain why apparent drift is not proof of drift, why a near-target mean is insufficient, why a fitted comparison is not validation, and why maximum finite count differs from exact centering. The conclusion changes as a result of those checks.",
   action:"I retained the consequences beside the relevant results rather than moving every limitation into the ending."},
  {id:"D06",location:"Summaries, translation proof, sorted windows and normal sensitivity",
   note:"I independently checked summaries from integer hundredths, all tolerance classifications, the exhaustive window widths and normal areas by numerical integration. I checked the offset root on both sides and explained why the location optimum is centred for a symmetric unimodal normal density.",
   action:"If a case or criterion changes, I will recompute the entire linked analysis, including displayed table values and the conclusion."},
  {id:"D07",status:"checked",location:"Whole exported reader, PDF and Word document",
   note:"I inspected every PDF and Word page and all seven saved figures in the desktop and phone reader. The ordered plot, probability curve, normal equations and all four tables retain their axes, units, values and source notes.",
   action:"I corrected the probability graph's legend to identify calculated points, kept the section-five heading with its opening prose, and reworded the tolerance count so punctuation does not wrap on its own. I rechecked the revised pages."},
  {id:"D09",location:"Source record, source notes and references [1]–[2]",
   note:"I disclose the exact constructed-data recipe and credit the NIST pages for the run-sequence and normal-CDF methods. Those references do not supply the masses, timer, tolerance or success criterion.",
   action:"I checked that the source labels do not imply real collection, calibration or independent normal-model validation."},
  {id:"D11",location:"All five mathematical stages",
   note:"The narrative includes a worked block mean, full summary values, the squared-error derivation, a normal standardisation, the translation identity, exhaustive window results and inverse-normal sensitivity. These are completed calculations, not proposed methods.",
   action:"I verified that the conclusion uses the computed finite and conditional results with their distinct meanings."},
  {id:"D19",location:"Compact result tables and editable working data",
   note:"All 60 source masses remain available in their original order. The body uses six block rows, three tolerance rows, three window summaries and five scenarios; the full window calculations are also retained.",
   action:"I kept the necessary width argument in the main text so the reader does not need the working-data table to understand the conclusion."},
  {id:"D20",location:"Normal-CDF calculation and final sensitivity stage",
   note:"I specify both limits and both distribution parameters, show the standardisation, derive the centred SD threshold and bracket the offset root. I distinguish the model's individual-dose probability from estimation uncertainty.",
   action:"I retained editable figure inputs and reproducible calculation data, and checked the software results with independent arithmetic and integration."}
 ],
 references:[
  {label:"Data record",value:"Grinder Dose Cases v1. Original constructed 60-case teaching dataset supplied with this illustrative project. Reproduction: Python random.Random(1842), 60 successive gauss(18.16, 0.20) values, each rounded to two decimal places; the first sequence is retained in full and in order. No physical measurements are claimed."},
  {label:"[1] Run-sequence method",value:"NIST/SEMATECH. e-Handbook of Statistical Methods, section 1.3.3.25, ‘Run-Sequence Plot’. https://www.itl.nist.gov/div898/handbook/eda/section3/eda33p.htm . Accessed 22 October 2026. Consulted for the role of preserving observation order when inspecting changes in location and spread."},
  {label:"[2] Normal distribution",value:"NIST/SEMATECH. e-Handbook of Statistical Methods, section 1.3.6.6.1, ‘Normal Distribution’. https://www.itl.nist.gov/div898/handbook/eda/section3/eda3661.htm . Accessed 22 October 2026. Consulted for the location/scale model, standard normal CDF and numerical inverse-CDF interpretation."},
  {label:"Calculation record",value:"My calculation record uses the fixed ordered inputs, six consecutive blocks, all sorted windows of lengths 53, 54 and 57, and the explicitly stated normal location/scale scenarios. Graphs and tables are generated from these retained inputs. Numerical normal areas were cross-checked by direct integration."}
 ]
};
