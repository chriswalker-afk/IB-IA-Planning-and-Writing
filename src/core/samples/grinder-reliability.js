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
 dataAimLink:"My criterion concerns individual masses, so I need a direct tolerance count. Before pooling the cases, however, I will preserve their order: an acceptable overall summary could conceal a high early portion and a lower later one.",
 chosenMethod:"An ordered plot and fixed blocks, distribution summaries, an observed tolerance count, a conditional normal comparison, then translation and spread sensitivity.",
 methodReason:"A run-sequence plot places each mass against its index and can reveal changes in location or spread [1]. I therefore begin with that plot, accompanied by six consecutive blocks of ten. The equal blocks give comparable summaries of the entire sequence and keep the boundaries independent of the outcomes.",
 firstPurpose:String.raw`Do the 60 masses show an apparent change with trial order that would make a single pooled description misleading?`,
 firstMethodEvaluation:"I fixed those blocks before comparing their means. A histogram would discard the ordering, while a fitted trend line could turn a short apparent fall into an unjustified prediction of continued drift. The order check will determine how cautiously I interpret a pooled distribution; it will not identify a physical cause or prove independence.",
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
 predictionComparison:"The original 75% fraction misses the declared goal. Correcting only the mean is insufficient by both the exhaustive finite-window proof and the conditional normal maximum; the combined scenario needs reduced spread and a closely controlled centre.",
 benefitFinding:"I would keep weighing individual doses in the proposed setup until a new physical check supports the desired tolerance. My calculations identify separate centering and spread targets rather than an unsupported timer adjustment.",
 technologyTool:"I used the native ordered graph, histogram and tables, together with a calculation file for summaries, sorted windows and numerical normal CDF evaluations.",
 technologyInput:"All 60 masses in original order; limits 17.70 and 18.30 g; normal parameters mu=18.172333… and sigma=0.196368… g. For sensitivity I changed the assumed mean and SD explicitly and kept the limits fixed.",
 technologyOutcome:String.raw`My conditional fitted-normal area is \(0.73411993\). At \(\mu=18\), the maximum SD giving area \(0.95\) is approximately \(0.153064\text{ g}\). With \(\sigma=0.15\text{ g}\), the permitted magnitude of a mean offset is approximately \(0.030568\text{ g}\).`,
 technologyInterpretation:"I checked normal areas by direct numerical integration, checked the centered result using equal tails, and bracketed the final offset threshold between 0.0305 and 0.0306 g. The output describes individual model masses, not confidence in an estimated mean.",
 courseWhy:"Descriptive statistics and normal probabilities answer the reliability question. Expanding squared deviations explains bias versus spread, and translation plus a sorted-window argument tests a practical change without needing a new distributional assumption.",
 courseConcern:"The descriptive statistics and normal probabilities provide the familiar core. The squared-error decomposition, exhaustive window proof, affine transformation and numerical threshold reasoning are additional mathematical explanations included in the narrative. I have made no teacher-approval claim, and the probability conclusions remain conditional on the stated model.",
 mathsLearning:"The target-error expansion shows why a mean correction cannot remove spread. The sorted-window proof distinguishes maximising a finite tolerance count from centering. The joint scenario and offset bracket then show why a favourable spread requirement depends on how closely the mean is controlled.",
 notationIssue:"I distinguish the sample variance with denominator 59 from the descriptive mean squared deviation with denominator 60. In N(mu,sigma squared), the second parameter is variance. Percentages describe individual model masses, never a confidence interval for the mean.",
 presentationIssue:"All seven native figures and five editable datasets are retained. The revised complete reader and every fresh PDF and Word page still require visual inspection before the presentation review can be marked complete.",
 referencesIssue:"The data source explicitly says constructed, and its generation recipe is retained. I cite NIST's run-sequence and normal-distribution pages where those methods enter the argument; neither is the source of my masses or chosen tolerance.",
 draftComplete:"ready",
 finalProofread:"The revised mathematical narrative is complete, but its new reader and exported pages have not yet been visually checked. I have not recorded a peer, teacher or school-format review.",
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
  aim:"To assess the 60 constructed masses against my inclusive 17.70–18.30 g tolerance, determine whether any common shift could put at least 57 of them inside it, and derive the centre and spread requirements for 95% coverage under a stated normal model.",
  motivation:"Using a timer would be convenient, but an average near 18 g would not reassure me if many individual doses needed correction. I want a mathematical definition of consistent enough before judging the cases.",
  beneficiaryType:"me",beneficiary:"I would use the result to decide whether my proposed timed-dose setup still needs individual weighing and what a later physical trial should investigate.",
  intendedUse:"I will distinguish the finite fraction meeting my criterion from conditional model probabilities and use the difference to decide what is still unverified.",
  kind:"statistics",statisticsContext:"One numerical variable",dataSource:"secondary",course:"AI SL",
  prediction:"I expect the masses to cluster, but I suspect that a satisfactory average alone will not be enough for 95% to fall within ±0.30 g.",
  predictionWhy:"Some doses can be too high and others too low even when their signed errors cancel. A timer controls duration, whereas my criterion concerns each delivered mass.",
  predictionImplication:"If centering alone is insufficient, I will need to investigate spread rather than recommend a timer change from the average error alone.",
  courseSuitability:"yes",mathsOutside:"outside",
  mathsRevisedWhy:"Descriptive statistics and normal probabilities provide the core. I explain the extra algebraic decomposition, finite-window optimisation, affine mean/SD proof and numerical threshold reasoning at first use in the continuous investigation, instead of treating them as unexplained technology output.",
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
 introduction:"A timer would be convenient in the coffee setup I am designing, but a suitable average is not enough if individual doses often need correction. I therefore chose a mass-based decision rule before analysing the cases. My target is \\(18.00\\text{ g}\\), and an acceptable displayed mass satisfies\n\\[\n17.70\\le m\\le18.30\\text{ g}.\n\\]\nEquality counts as acceptable. The \\(0.30\\text{ g}\\) allowance is about \\(1.7\\%\\) of the target; I use it as a specified design tolerance, without claiming that it defines coffee quality. I also require at least \\(95\\%\\) within the band, representing a convenience goal of at most one exception in twenty. For 60 cases this means at least \\(57\\) acceptable masses. Fixing both criteria now prevents me from making the result favourable by widening the band later.\n\nMy material is a supplied constructed sequence at one fixed \\(6.0\\text{ s}\\) setting. I will assess its current fraction, determine whether a common shift could bring at least 57 cases into tolerance, and then derive centre and spread requirements under a stated normal model. This separates a change in average mass from a change in the variation around that average.\n\nI have not tested a physical grinder. My conclusions will concern the fixed cases and explicit mathematical scenarios. With only one timer setting and no physical mass-versus-time relationship, a calculated mass correction cannot by itself specify a new duration.",
 dataNotes:"I used all 60 masses in Grinder Dose Cases v1, retaining their original trial indices. The complete table remains in the editable working data. The first sequence from the declared normal generation recipe was rounded to two decimal places and retained in full; the exact recipe appears in the source record. That known construction is not evidence that a real grinder has a normal output. The fixed \\(6.0\\text{ s}\\) timer and the tolerance are scenario conditions, not measured operating performance.\n\nI use \\(i=1,\\ldots,60\\) for order and \\(m_i\\) for the corresponding mass in grams. The index is not elapsed time. The \\(0.01\\text{ g}\\) display increment means ideal rounding can change an unrounded value by at most \\(0.005\\text{ g}\\); it supplies no bound on calibration error. I analyse the displayed masses as fixed inputs and retain every value, including the highest, \\(18.67\\text{ g}\\). Neither removing an apparent warm-up period nor discarding an inconvenient extreme is justified by this source.",
 stages:[
  {
    "key": "order",
    "title": "Does pooling the run conceal a change?",
    "bridge": "",
    "purpose": "Figure 1 retains each \\(m_i\\) beside its original index. Joining neighbouring points shows order, not what happened between doses. The lower axis bound is my lower limit, \\(17.70\\text{ g}\\), and the horizontal reference marks \\(18.30\\text{ g}\\). Table 1 uses the same six fixed blocks to quantify what the ordered plot suggests.",
    "technique": "Run-sequence plot and consecutive-block summaries",
    "methodId": "follow-journey",
    "kind": "scatter",
    "knowledge": "syllabus",
    "observation": "unclear",
    "observationText": "The first four ten-dose means fall from 18.305 to 18.040 g, then recover to 18.156 and 18.173 g. I see an apparent order effect without a persistent linear trend. The plot makes a pooled summary worth questioning, but cannot establish physical drift or independence.",
    "result": "For each block I averaged all ten masses. The first block totals \\(183.05\\text{ g}\\), so\n\\[\n\\bar m_{1:10}=\\frac{183.05}{10}=18.305\\text{ g}.\n\\]\nThe next three means are \\(18.224\\), \\(18.136\\) and \\(18.040\\text{ g}\\), followed by \\(18.156\\) and \\(18.173\\text{ g}\\). The first-to-fourth difference is \\(0.265\\text{ g}\\), almost my one-sided \\(0.30\\text{ g}\\) allowance. Five of the first ten cases meet the band, compared with nine in each of the final three blocks.\n\nTable 1 also reports each block's sample standard deviation: square the departures from that block's mean, divide their sum by \\(10-1=9\\), then take the square root. This restores grams and compares within-block spread with differences between block means.",
    "interpretation": "The early portion is higher than much of the middle, but the later recovery prevents me from describing a persistent fall. A pooled mean will conceal that ordering. I can still describe all 60 supplied cases, but any single normal distribution used later must remain a conditional comparison, not evidence that a physical process has a constant mean and spread.",
    "limitations": "A short sequence can show apparent changes by chance; the disclosed synthetic generation does not make this pattern evidence of warming up or grinder drift. Conversely, a plot without an obvious trend would not establish independence. Repeated physical runs and operating information would be needed to investigate those questions.",
    "localTakeaway": "The first four block means fall by 0.265 g overall, so a pooled normal comparison must remain conditional and cannot certify stable physical performance.",
    "nextQuestion": "The order check limits what I can infer, but leaves the total size and source of the mass error unresolved.",
    "nextWhy": "I will separate the average offset from the variation around that average before deciding which change is worth testing.",
    "mathsInsight": "A histogram can preserve every value while discarding information relevant to reliability: the order in which the values occur.",
    "methodChangeReason": "I kept the order warning in view when moving to pooled summaries, rather than treating pooling as proof of constant behaviour.",
    "outcomeId": "uncertain"
  },
  {
    "key": "centre-spread",
    "title": "Is the main problem an offset or a wide spread?",
    "bridge": "The block means differ, yet all 60 cases still form the fixed list I must assess. I now pool them for that descriptive purpose, retaining the order warning.",
    "purpose": "Figure 2 uses \\(0.10\\text{ g}\\) classes, one sixth of the acceptance band's width, to show the distribution on a useful scale for this question. A class with frequency \\(f\\) has frequency-density height \\(f/0.10\\), so its area represents the count; the labels also show those counts. I calculate the following summaries from the original values, not from class midpoints.",
    "technique": "Histogram, mean, median, standard deviation and squared-error decomposition",
    "methodId": "follow-journey",
    "kind": "model",
    "knowledge": "mixed",
    "result": "The masses total \\(1090.34\\text{ g}\\), giving\n\\[\n\\bar m=\\frac{1090.34}{60}\\approx18.172333\\text{ g}.\n\\]\nThe median is \\(18.165\\text{ g}\\). Medians of the lower and upper halves give \\(Q_1=18.030\\) and \\(Q_3=18.295\\text{ g}\\), so the middle half spans an interquartile range of \\(0.265\\text{ g}\\). The full range is \\(18.67-17.76=0.91\\text{ g}\\). The usual \\(1.5\\mathrm{IQR}\\) fences, \\(Q_1-1.5\\mathrm{IQR}\\) and \\(Q_3+1.5\\mathrm{IQR}\\), are \\(17.6325\\) and \\(18.6925\\text{ g}\\). No case lies outside them; this is a descriptive check, not a reason to discard any supplied value.\n\nFor spread I use the conventional sample standard deviation,\n\\[\ns=\\sqrt{\\frac{\\sum_{i=1}^{60}(m_i-\\bar m)^2}{59}}\n=\\sqrt{\\frac{2.275073333\\ldots}{59}}\n\\approx0.196368\\text{ g}.\n\\]\nSquaring prevents positive and negative departures from cancelling, and the square root returns to grams. The sample convention uses \\(n-1=59\\): once the mean is calculated, the centred departures sum to zero, so the last departure is determined by the others. I will use this sample scale in the normal comparison [2].\n\nTo distinguish offset from spread, let \\(b=\\bar m-18\\approx0.172333\\text{ g}\\) and \\(a_i=m_i-\\bar m\\). Each target error is \\(m_i-18=a_i+b\\). Expanding and averaging gives\n\\[\n\\begin{aligned}\n\\frac1{60}\\sum(m_i-18)^2\n&=\\frac1{60}\\sum a_i^2+\\frac{2b}{60}\\sum a_i+b^2\\\\\n&=\\frac1{60}\\sum a_i^2+b^2,\n\\end{aligned}\n\\]\nbecause \\(\\sum a_i=0\\). Here the divisor is 60 because I am averaging these 60 squared errors, not calculating sample variance. Numerically,\n\\[\n0.067616667\\approx0.037917889+0.029698778\n\\quad\\text{in }\\mathrm{g}^2.\n\\]\nTaking the square root of the mean squared target error gives the root mean squared distance, \\(\\sqrt{0.067616667}\\approx0.260032\\text{ g}\\).",
    "interpretation": "The close mean and median both exceed \\(18.00\\text{ g}\\), so a central-looking histogram does not imply correct centering. The squared offset contributes about \\(43.9\\%\\) of the mean squared target error, since \\(0.029698778/0.067616667\\approx0.4392\\). Correcting that offset is therefore worth testing, but it would leave the variation term.\n\nThis identity also prevents a denominator mistake: its variation term is \\((59/60)s^2\\), not \\(s^2\\). More importantly for my aim, a share of squared error is not a share of unacceptable doses. I still need the direct band count.",
    "limitations": "Bin width changes the appearance of the histogram, and the absence of Tukey outliers is not a normality test. These pooled summaries neither remove the ordering limitation nor establish balance accuracy.",
    "localTakeaway": "The mean is 0.172333 g high and the sample SD is 0.196368 g; removing the offset would leave substantial variation.",
    "nextQuestion": "The decomposition identifies two possible sources of failure without establishing the actual acceptable fraction.",
    "nextWhy": "I will count the fixed tolerance event, then use a conditional distribution to compare explicit changes in centre and spread.",
    "mathsInsight": "The squared-error identity separates an avoidable location offset from the spread that a common shift cannot change.",
    "methodChangeReason": "A descriptive error magnitude did not answer the stated tolerance question, so I moved to direct counts and an explicitly conditional probability calculation.",
    "outcomeId": "wide",
    "unfamiliarComponent": "An algebraic decomposition of mean squared target error into centred variation and squared mean offset.",
    "knowledgeNotes": "The printed calculation defines the centred departure, expands the square, uses its zero sum to remove the cross term, and explains the different divisors 60 and 59. The square root and units of the target RMSE are explained at first use.",
    "understandingExample": "The mean squared target error \\(0.067616667\\text{ g}^2\\) separates into \\(0.037917889\\text{ g}^2\\) of centred variation and \\(0.029698778\\text{ g}^2\\) of squared offset. A common shift can remove the latter without changing the former.",
    "researchSource": "NIST/SEMATECH, e-Handbook of Statistical Methods, §1.3.6.6.1, Normal Distribution [2], https://www.itl.nist.gov/div898/handbook/eda/section3/eda3661.htm, supports using the sample mean and sample SD as location and scale estimates. The squared-error identity is derived here from the displayed algebra."
  },
  {
    "key": "tolerance",
    "title": "What does the observed tolerance fraction establish?",
    "bridge": "The mean is about 0.172 g high, but the decision rule concerns individual masses rather than their average error. I keep the original limits unchanged.",
    "purpose": "The direct count answers the finite-list question without a distributional assumption. I then use a normal distribution to make centre and spread changes mathematically explicit. Its known role in constructing the cases makes this an interpretable comparison, while providing no independent evidence about physical doses.",
    "technique": "Observed tolerance proportion and conditional normal probabilities",
    "methodId": "normal",
    "kind": "model",
    "knowledge": "syllabus",
    "result": "No mass is below \\(17.70\\text{ g}\\); \\(45\\) are in the inclusive band and \\(15\\) are above \\(18.30\\text{ g}\\). Thus the finite fraction is\n\\[\n\\widehat p=\\frac{45}{60}=0.75,\n\\]\nbelow the required \\(57/60=0.95\\).\n\nFor the conditional comparison, \\(X\\) represents an individual model mass. I use \\(X\\sim N(\\bar m,s^2)\\): the first parameter is the mean and the second is the variance, with \\(\\bar m\\approx18.172333\\text{ g}\\) and \\(s\\approx0.196368\\text{ g}\\) [2]. The normal curve is symmetric about its mean, and probabilities are areas beneath it.\n\nSubtracting \\(\\bar m\\) and dividing by \\(s\\) expresses a mass in standard-deviation units. The resulting \\(Z=(X-\\bar m)/s\\) has standard-normal mean zero and SD one. Its cumulative function \\(\\Phi(z)=P(Z\\le z)\\) is the area to the left of \\(z\\). The two limits become\n\\[\nz_L=\\frac{17.70-\\bar m}{s}\\approx-2.405342,\n\\qquad z_U=\\frac{18.30-\\bar m}{s}\\approx0.650138.\n\\]\nSubtracting the lower cumulative area from the upper leaves the band area:\n\\[\nP(17.70\\le X\\le18.30)\n=\\Phi(z_U)-\\Phi(z_L)\\approx0.73411993.\n\\]\nI evaluate these normal areas numerically [2]. Table 2 gives about \\(0.81\\%\\) below, \\(73.41\\%\\) inside and \\(25.78\\%\\) above the band.",
    "interpretation": "The \\(75\\%\\) case fraction and \\(73.41\\%\\) model area are both far below \\(95\\%\\). They are not two independent confirmations: both use the same 60 cases.\n\nAll 15 finite failures are high. In the model, too, the upper tail dominates because the upper limit is only about \\(0.65s\\) above the mean. This gives a specific reason to test a downward shift before considering more complicated changes.",
    "limitations": "The fitted area is not a validated probability for the next physical dose, and it is not a confidence interval for a mean. I cannot invoke the central limit theorem to make individual masses normal: that theorem concerns the distribution of averages as sample size increases.\n\nIdeal \\(\\pm0.005\\text{ g}\\) display rounding alone cannot change any original classification; every supplied value is farther than that from either boundary. This preserves the displayed-case result, while leaving unknown calibration error unresolved.",
    "localTakeaway": "45/60 cases meet the band, versus a conditional normal area of 73.41%; neither meets 95%, and neither is a certified physical success probability.",
    "nextQuestion": "The concentration of failures above the band suggests centering, but does not show that centering is sufficient.",
    "nextWhy": "I will first correct the mean exactly, then check every possible common shift so that the best finite count is established rather than assumed.",
    "mathsInsight": "A distribution can look reasonably concentrated yet fail a narrow operational tolerance frequently when the band is not centred on its mean.",
    "methodChangeReason": "I moved from describing the original cases to a clearly labelled translation scenario, because the large upper failure count suggests an offset worth testing.",
    "outcomeId": "wide"
  },
  {
    "key": "centering",
    "title": "Can a common shift alone reach my 95% target?",
    "bridge": "Because all original failures are high, my first hypothetical change places the average at the target. I treat this as a mathematical translation, not a claim about a particular timer adjustment.",
    "purpose": "Let \\(y_i=m_i+d\\), adding the same mass change \\(d\\) to every case. I first choose \\(d=18-\\bar m\\) for exact centering, then ask whether another common shift could give a larger acceptable count. The second question matters because meeting a tolerance is not the same objective as making the mean correct.",
    "technique": "Translation invariance, sorted windows and fixed-width normal coverage",
    "methodId": "algebra",
    "kind": "model",
    "knowledge": "mixed",
    "result": "Exact centering uses \\(d\\approx-0.172333\\text{ g}\\), giving \\(\\bar y=18\\). Its effect on every centred departure is\n\\[\ny_i-\\bar y=(m_i+d)-(\\bar m+d)=m_i-\\bar m.\n\\]\nThe squared departures and their SD are therefore unchanged: \\(s_y=s\\approx0.196368\\text{ g}\\). Recounting the shifted values gives \\(51/60=85\\%\\), still below \\(95\\%\\).\n\nTo check any common shift, consider a group whose smallest and largest original masses are \\(L\\) and \\(U\\). All of it fits after translation precisely when\n\\[\n17.70-L\\le d\\le18.30-U.\n\\]\nSuch a \\(d\\) exists if and only if the lower bound does not exceed the upper, which rearranges to \\(U-L\\le0.60\\text{ g}\\). Thus a span no wider than my band is both necessary and sufficient; moving the group cannot compress it.\n\nI sort a copy as \\(m_{(1)}\\le\\cdots\\le m_{(60)}\\). For a group of \\(k\\) values, its narrowest possible span occurs among consecutive sorted values. Indeed, the interval between any group's endpoints also contains all intermediate values, from which a consecutive group of \\(k\\) can be taken without increasing the span. I therefore check all \\(61-k\\) widths\n\\[\nm_{(j+k-1)}-m_{(j)},\\qquad j=1,\\ldots,61-k.\n\\]\nTable 3 gives minimum spans of \\(0.60\\), \\(0.61\\) and \\(0.69\\text{ g}\\) for \\(53\\), \\(54\\) and \\(57\\) values. A shift of \\(-0.20\\text{ g}\\) places the 53 cases from \\(17.90\\) to \\(18.50\\text{ g}\\) exactly in the tolerance band. No shift can include 54; a larger group would contain 54 as well, so it cannot fit either. The finite maximum is consequently \\(53/60\\approx88.33\\%\\), below the required 57 cases.\n\nFor the normal comparison, centering puts the limits equally far from the mean. Symmetry gives \\(\\Phi(-a)=1-\\Phi(a)\\), so at unchanged SD,\n\\[\nP(17.70\\le X\\le18.30)\n=2\\Phi\\!\\left(\\frac{0.30}{s}\\right)-1\n\\approx0.87342299.\n\\]",
    "interpretation": "This centred normal area is also the largest possible at the fixed spread. A normal curve's height decreases with distance from its mean [2]. Moving a fixed-width interval away from the mean removes a strip at the nearer edge and adds an equal-width strip farther out; the lost area is larger. Symmetry gives the same result in the other direction. Thus \\(87.34\\%\\) is a maximum, not just one favourable trial. Figure 3 illustrates it for assumed means from \\(17.60\\) to \\(18.40\\text{ g}\\).\n\nThe fixed cases need not behave symmetrically. Their best shift, \\(-0.20\\text{ g}\\), leaves a mean of \\(17.972333\\text{ g}\\), rather than exactly 18. I therefore keep the two results distinct: the window proof establishes the finite maximum, while the curve-area argument establishes the normal-model maximum. Both exclude a location-only solution.",
    "limitations": "The finite optimum treats the supplied numbers as exact and places some values exactly on the boundaries; unlike the original count, this count could change under a small weighing error. Both analyses describe stipulated changes. A physical timer adjustment might also change spread, so the translation bound is not a bound on every possible change to a real grinder.",
    "localTakeaway": "No common shift can put more than 53/60 fixed cases inside tolerance; a centred normal with the current SD reaches only 87.34%. Spread must also change in any successful model scenario.",
    "nextQuestion": "Even the best common shift leaves at least seven of these 60 cases outside, and the best normal coverage at the current SD is below 95%.",
    "nextWhy": "This is the reason to investigate reduced spread. I will derive a normal-model requirement and test how much residual offset it can tolerate.",
    "mathsInsight": "A translation preserves every centred deviation, while maximising a finite in-band count depends on the widths of sorted groups rather than only their mean.",
    "methodChangeReason": "I added a distribution-free window argument because the normal comparison alone could not establish what translation does to the supplied finite cases.",
    "outcomeId": "meaningful-result",
    "unfamiliarComponent": "Proving the maximum finite tolerance count using sorted windows, and explaining why a centred fixed-width interval maximises normal coverage.",
    "knowledgeNotes": "The printed proof derives both bounds on an admissible shift, shows that their compatibility is equivalent to a span no greater than 0.60 g, and explains why consecutive sorted windows exhaust the finite question. A separate area comparison explains the normal optimum.",
    "understandingExample": "The 53 values between \\(17.90\\) and \\(18.50\\text{ g}\\) fit after \\(d=-0.20\\text{ g}\\). Every 54-value window spans at least \\(0.61\\text{ g}\\), so none can fit into a \\(0.60\\text{ g}\\) band, regardless of the shift.",
    "researchSource": "NIST/SEMATECH, e-Handbook of Statistical Methods, §1.3.6.6.1, Normal Distribution [2], https://www.itl.nist.gov/div898/handbook/eda/section3/eda3661.htm, gives the symmetric normal density and its location/scale form. The translation and finite-window proofs are derived in the narrative."
  },
  {
    "key": "sensitivity",
    "title": "What would meeting 95% require from centre and spread?",
    "bridge": "The previous maxima rule out centering alone. I now keep the same tolerance and make both the assumed mean and the spread explicit, so any successful scenario has identifiable requirements.",
    "purpose": "For a normal mass with mean \\(\\mu\\) and SD \\(\\sigma>0\\), the coverage is\n\\[\np(\\mu,\\sigma)=\\Phi\\!\\left(\\frac{18.30-\\mu}{\\sigma}\\right)\n-\\Phi\\!\\left(\\frac{17.70-\\mu}{\\sigma}\\right).\n\\]\nI vary these parameters one at a time, without fitting a relationship between mass and timer duration.\n\nFor comparison with the fixed list, I also define a transformation to chosen mean \\(\\mu'\\) and SD \\(\\sigma'>0\\):\n\\[\ny_i=\\mu'+k(m_i-\\bar m),\\qquad k=\\frac{\\sigma'}s>0.\n\\]\nSince the original centred departures sum to zero, averaging gives \\(\\bar y=\\mu'\\). Every new centred departure is \\(k(m_i-\\bar m)\\), so\n\\[\ns_y^2=\\frac1{59}\\sum k^2(m_i-\\bar m)^2=k^2s^2,\n\\qquad s_y=ks=\\sigma'.\n\\]\nThis proves what the transformation changes. It scales every departure by the same factor; recounting it will describe those transformed inputs, not newly observed doses.",
    "technique": "Inverse normal probability and sensitivity to location and scale",
    "methodId": "normal",
    "kind": "model",
    "knowledge": "mixed",
    "result": "At \\(\\mu=18\\), symmetry puts equal probability in the two tails. Coverage of \\(0.95\\) leaves \\(0.025\\) in each tail, so the cumulative area at the upper limit must be at least \\(0.975\\). Thus\n\\[\n2\\Phi(0.30/\\sigma)-1\\ge0.95\n\\quad\\Longleftrightarrow\\quad\n0.30/\\sigma\\ge\\Phi^{-1}(0.975).\n\\]\nHere \\(\\Phi^{-1}(0.975)\\) means the standard-normal value with 0.975 of the area to its left, not the reciprocal of a probability. Numerical inversion gives \\(1.959964\\ldots\\) [2], hence\n\\[\n\\sigma\\le\\frac{0.30}{1.959964\\ldots}\n\\approx0.153064\\text{ g}.\n\\]\nRelative to the current \\(s\\), this is a reduction of at least \\(1-0.153064037\\ldots/s\\approx22.05\\%\\), conditional on exact centering.\n\nI choose \\(0.15\\text{ g}\\) as a nearby, simply stated SD below that limit. Table 4 isolates the changes: with the original mean, this smaller spread gives only \\(80.18\\%\\) normal coverage; with the mean also moved to \\(18.00\\text{ g}\\), it gives \\(95.45\\%\\). That is a small margin. A stipulated \\(+0.05\\text{ g}\\) mean offset, equal to five display increments, lowers the area to \\(94.24\\%\\).\n\nApplying the proved transformation to the original list gives respectively \\(50/60\\), \\(58/60\\) and \\(56/60\\) in these three scenarios. The combined change meets the finite 57-case target, whereas the residual-offset case misses it. These counts are not the model probabilities and provide no independent observations; they show what the same parameter choices do to the retained finite pattern.\n\nTo find the normal model's remaining offset margin, write \\(b=\\mu-18\\) and solve, for \\(b\\ge0\\),\n\\[\n\\Phi\\!\\left(\\frac{0.30-b}{0.15}\\right)\n-\\Phi\\!\\left(\\frac{-0.30-b}{0.15}\\right)=0.95.\n\\]\nCoverage changes continuously with the mean, and the earlier area argument shows that it decreases as the centre moves away. At \\(b=0\\) it exceeds 0.95; at \\(b=0.05\\) it is below. I repeatedly halve that interval and retain the half whose endpoints still lie on opposite sides of 0.95. This numerical bracketing gives\n\\[\np(18.0305,0.15)\\approx0.9500201,\n\\qquad p(18.0306,0.15)\\approx0.9499906,\n\\]\nwith the boundary at \\(b\\approx0.030568\\text{ g}\\). Symmetry therefore gives the joint condition: at \\(\\sigma=0.15\\text{ g}\\), normal coverage is at least 95% only while \\(|\\mu-18|\\) is no more than about \\(0.03057\\text{ g}\\).",
    "interpretation": "The improvement requires both changes. A target mean cannot compensate for the current spread, and the proposed smaller spread does not compensate for the original offset. Even their combination has little room for a displaced centre.\n\nThe calculated \\(0.03057\\text{ g}\\) threshold is not a claim about attainable calibration. A \\(0.01\\text{ g}\\) display grid cannot certify that the true mean is inside it, and the tested \\(0.05\\text{ g}\\) shift was an assumption, not a measured error. I retain guard digits to show which side of the mathematical threshold a calculation lies on, without treating them as additional measurement accuracy.",
    "limitations": "The normal 95% describes individual model masses, not a confidence level or a guarantee about a future run. No evidence here shows that a changed setting can achieve SD 0.15 g. With only one timer setting and no physical calibration data, I cannot convert the mass offset into a justified number of seconds to add or remove.",
    "localTakeaway": "A centred normal needs SD no greater than 0.153064 g to reach 95%; at SD 0.15 g, a residual mean offset above about 0.030568 g defeats that objective.",
    "nextQuestion": "The original count, the translation limits and the joint centre-and-spread scenarios now answer the finite-case and model questions I set.",
    "nextWhy": "I can conclude here. The remaining link between a timer change and those mass parameters requires physical evidence, rather than another calculation on this same list.",
    "mathsInsight": "A threshold on spread is conditional on centering. Reporting one favourable probability without perturbing the mean would conceal how little tolerance the proposed improvement has for offset.",
    "methodChangeReason": "I varied the mean after calculating the centred SD threshold because the first scenario was only slightly above 95%, making residual offset a consequential uncertainty.",
    "outcomeId": "measurement-limited",
    "unfamiliarComponent": "Deriving the mean and SD of a shifted-and-scaled finite list, and obtaining a residual-offset threshold through monotonic normal coverage and numerical bracketing.",
    "knowledgeNotes": "The printed calculation proves the affine mean/SD effects, derives the equal-tail inverse-normal condition, explains the inverse notation and describes interval halving using passing and failing probabilities. It keeps transformed counts separate from distribution areas.",
    "understandingExample": "At \\(\\sigma=0.15\\text{ g}\\), the normal area is about \\(0.9500201\\) at mean \\(18.0305\\text{ g}\\) and \\(0.9499906\\) at \\(18.0306\\text{ g}\\). The threshold lies between them; finer interval halving gives offset \\(0.030568\\text{ g}\\).",
    "researchSource": "NIST/SEMATECH, e-Handbook of Statistical Methods, §1.3.6.6.1, Normal Distribution [2], https://www.itl.nist.gov/div898/handbook/eda/section3/eda3661.htm, supports numerical normal CDF and inverse-CDF evaluation. The affine proof, equal-tail rearrangement and bracketing are explained for this investigation."
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
  mainConclusion:"The supplied sequence fails my declared criterion: \\(45/60=75\\%\\) of its displayed masses lie within \\(17.70\\)–\\(18.30\\text{ g}\\), rather than the required \\(57/60=95\\%\\). The mean is about \\(18.172\\text{ g}\\), but correcting it alone cannot solve the finite problem. Exact centering gives \\(51/60\\), and the exhaustive sorted-window argument limits any common shift to \\(53/60\\). This identifies variation, as well as offset, as a necessary part of an improvement scenario.\n\nThe conditional normal comparison agrees on that structural limitation: its current \\(s\\approx0.196\\text{ g}\\) gives at most \\(87.34\\%\\) coverage, even when centred. Reaching \\(95\\%\\) with mean 18 requires \\(\\sigma\\le0.153064\\text{ g}\\), about \\(22.05\\%\\) below the fitted scale. These are separate mathematical results for the fixed list and the assumed distribution, not interchangeable estimates of physical performance.",
  conclusionBenefit:"The nearby mean-18, SD-0.15 scenario reaches \\(95.45\\%\\) normal coverage and puts \\(58/60\\) transformed cases inside the band. Its margin is small: a \\(0.05\\text{ g}\\) mean offset gives \\(94.24\\%\\) and \\(56/60\\), respectively. Under that normal SD, the allowable offset is only about \\(0.03057\\text{ g}\\). A useful follow-up therefore has to check centering as well as spread.\n\nI have established finite-case limits and conditional requirements, not the future reliability of a real machine. The constructed source, ordering differences and missing calibration prevent that stronger conclusion. For the proposed setup, these calculations do not justify dispensing with individual weighing or recommending a new timer setting.",
  conclusionExtension:"A focused physical follow-up would collect repeated ordered runs at defined timer settings, using stated operating conditions and a checked balance. It would measure how both mean and spread change with duration, then assess a chosen setting on a separate run. That would supply the missing evidence linking the mass requirements to a timer decision."
 },
 reviews:[
  {
    "id": "D01",
    "location": "Introduction, five linked stages and conclusion",
    "note": "My draft includes the fixed target and tolerance, the complete source sequence, actual summaries and probabilities, a finite-window argument, conditional sensitivity and an answer to the original aim.",
    "action": "I have kept the unresolved physical validation and school process separate from the completed case-study mathematics."
  },
  {
    "id": "D02",
    "location": "Order check through centering and spread sensitivity",
    "note": "Each stage responds to the preceding result: an order warning limits pooling; centre and spread lead to a direct tolerance count; the offset suggests centering; centering's limit motivates a spread calculation. I have not added an unrelated statistical test.",
    "action": "I checked that every transition names the question the next calculation answers."
  },
  {
    "id": "D03",
    "location": "Notation, squared-error identity, normal equations and all figure captions",
    "note": "I define mass, squared-mass error, standardisation, cumulative area and inverse-normal notation where used. The variance expansion explains the different divisors 60 and 59, while the affine proof separates changed means from changed SDs.",
    "action": "I distinguish finite counts, model areas and parameter thresholds, and retain approximation signs for rounded numbers."
  },
  {
    "id": "D04",
    "location": "Introduction, source decisions and scenario selection",
    "note": "My criteria are explicit choices made before the count. I retained every case, preserved order, rejected a timer recommendation unsupported by the source and chose a remaining-offset check because the 0.15 g scenario had little margin.",
    "action": "I linked each choice to its mathematical consequence rather than adding a personal story about an experiment I did not perform."
  },
  {
    "id": "D05",
    "location": "Interpretations and limitations following each result",
    "note": "I explain why apparent drift is not proof of drift, why a near-target mean is insufficient, why a fitted comparison is not validation, and why maximum finite count differs from exact centering. The conclusion changes as a result of those checks.",
    "action": "I retained the consequences beside the relevant results rather than moving every limitation into the ending."
  },
  {
    "id": "D06",
    "location": "Summaries, translation proof, sorted windows and normal sensitivity",
    "note": "I independently recomputed the complete generation recipe, summaries, all tolerance counts, sorted-window minima, endpoint-shift maximum, normal probabilities, affine counts and threshold brackets. The normal probabilities were checked independently of the sample calculation routine.",
    "action": "The displayed proofs explain the translation bound, centred normal optimum and affine mean/SD effects; numerical agreement alone is not used in place of those arguments."
  },
  {
    "id": "D07",
    "status": "unchecked",
    "location": "Whole exported reader, PDF and Word document",
    "note": "The revised complete reader and every fresh PDF and Word page require visual review. All seven figures and five datasets are retained; no completed presentation check is claimed for this revision.",
    "action": "I will inspect equations, tables, figures, source notes and page breaks at desktop and phone widths and on every exported page."
  },
  {
    "id": "D09",
    "location": "Source record, source notes and references [1]–[2]",
    "note": "I disclose the exact constructed-data recipe and credit the NIST pages for the run-sequence and normal-CDF methods. Those references do not supply the masses, timer, tolerance or success criterion.",
    "action": "I checked that the source labels do not imply real collection, calibration or independent normal-model validation."
  },
  {
    "id": "D11",
    "location": "All five mathematical stages",
    "note": "The narrative includes completed calculations and explains the squared-error expansion, standardisation, finite-window equivalence, affine mean/SD changes, equal-tail inversion and offset bracketing at first use. The last stage closes the stated aim before one physical extension.",
    "action": "I verified that the conclusion uses the computed finite and conditional results with their distinct meanings."
  },
  {
    "id": "D19",
    "location": "Compact result tables and editable working data",
    "note": "All 60 source masses remain available in their original order. The body uses six block rows, three tolerance rows, three window summaries and five scenarios; the full window calculations are also retained.",
    "action": "I kept the necessary width argument in the main text so the reader does not need the working-data table to understand the conclusion."
  },
  {
    "id": "D20",
    "location": "Normal-CDF calculation and final sensitivity stage",
    "note": "I specify both limits and both distribution parameters, show the standardisation, derive the centred SD threshold and bracket the offset root. I distinguish the model's individual-dose probability from estimation uncertainty.",
    "action": "I retained editable figure inputs and reproducible calculation data, and checked the software results with independent arithmetic and integration."
  }
],
 references:[
  {label:"Data record",value:"Grinder Dose Cases v1. Original constructed 60-case teaching dataset supplied with this illustrative project. Reproduction: Python random.Random(1842), 60 successive gauss(18.16, 0.20) values, each rounded to two decimal places; the first sequence is retained in full and in order. No physical measurements are claimed."},
  {label:"[1] Run-sequence method",value:"NIST/SEMATECH. e-Handbook of Statistical Methods, section 1.3.3.25, ‘Run-Sequence Plot’. https://www.itl.nist.gov/div898/handbook/eda/section3/eda33p.htm . Accessed 23 October 2026. Consulted for the role of preserving observation order when inspecting changes in location and spread."},
  {label:"[2] Normal distribution",value:"NIST/SEMATECH. e-Handbook of Statistical Methods, section 1.3.6.6.1, ‘Normal Distribution’. https://www.itl.nist.gov/div898/handbook/eda/section3/eda3661.htm . Accessed 23 October 2026. Consulted for the location/scale model, standard normal CDF and numerical inverse-CDF interpretation."},
  {label:"Calculation record",value:"My calculation record uses the fixed ordered inputs, six consecutive blocks, all sorted windows of lengths 53, 54 and 57, and the explicitly stated normal location/scale scenarios. Graphs and tables are generated from these retained inputs. Numerical normal areas were cross-checked by direct integration."}
 ]
};
