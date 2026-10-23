import {newGraphDraft} from "../../diagrams/graph-core.js";
import {newTableDraft} from "../../diagrams/table-studio-core.js";
import {SOURCE_FIELDS} from "../../completing/evidence-links.js";

/**
 * One complete fictional student investigation. Numerical inputs are fixed,
 * including the development/validation allocation. The case data are
 * constructed; no real participants are claimed. Method references are cited
 * separately. The narrative and saved figures use these same numerical inputs.
 */
export const REACH_CASES=Object.freeze([
 [1,154,202],[2,168,222],[3,181,238],[4,158,211],
 [5,160,212],[6,174,227],[7,188,246],[8,165,212],
 [9,156,209],[10,170,226],[11,184,237],[12,172,233],
 [13,162,209],[14,176,235],[15,190,249],[16,179,231],
 [17,164,218],[18,178,231],[19,192,252],[20,186,250],
 [21,166,216],[22,180,236],[23,182,242],[24,189,241]
].map(row=>Object.freeze(row)));
export const REACH_VALIDATION_IDS=Object.freeze([4,8,12,16,20,24]);
const validation=new Set(REACH_VALIDATION_IDS);
const development=REACH_CASES.filter(row=>!validation.has(row[0]));
const reserved=REACH_CASES.filter(row=>validation.has(row[0]));
const total=(rows,f)=>rows.reduce((sum,row)=>sum+f(row),0);
function fit(rows){
 const n=rows.length,meanH=total(rows,row=>row[1])/n,meanR=total(rows,row=>row[2])/n;
 const shh=total(rows,row=>(row[1]-meanH)**2);
 const shr=total(rows,row=>(row[1]-meanH)*(row[2]-meanR));
 const srr=total(rows,row=>(row[2]-meanR)**2);
 const b=shr/shh,a=meanR-b*meanH;
 return {a,b,meanH,meanR,shh,shr,srr,r:shr/Math.sqrt(shh*srr),predict:h=>a+b*h};
}
const fitted=fit(development);
const leaveOneOut=development.map(row=>{
 const reduced=fit(development.filter(other=>other[0]!==row[0]));
 return {omitted:row[0],...reduced};
});
const decimals=(value,digits=2)=>Number(value).toFixed(digits);
const sourceId="source-standing-reach-cases";
const sourceText="Standing Reach Design Cases v1: 24 fixed constructed pairs supplied with this fictional investigation; no real participants or published measurements.";
const rawTable=(columns,rows)=>[columns.join("\t"),...rows.map(row=>row.join("\t"))].join("\n");
function graphDraft({title,number,rows,yLabel="Standing reach",ySymbol="R",caption,models=[],residual=false}){
 const columns=["Height (cm)",residual?"Residual (cm)":"Standing reach (cm)"];
 return {...newGraphDraft(),kind:"scatter",columns,matrix:rows.map(row=>row.map(String)),
  raw:rawTable(columns,rows),xLabel:"Height",xSymbol:"H",xUnit:"cm",xUnitMode:"unit",
  yLabel,ySymbol,yUnit:"cm",yUnitMode:"unit",title,figureNumber:String(number),
  sourceKind:"secondary",sourceText,caption,models,
  xMin:"150",xMax:"195",yMin:residual?"-6":"195",yMax:residual?"6":"260",
  includeZeroY:residual,showLegend:models.length>0,showGrid:true,equationPlacement:"legend"};
}
function tableDraft({title,number,columns,rows,units,note,purpose}){
 return {...newTableDraft(),mode:"compact",headers:"yes",columns,headings:columns,
  matrix:rows.map(row=>row.map(String)),raw:rawTable(columns,rows),
  unitDecisions:units.map(unit=>({mode:unit?"unit":"dimensionless",unit})),
  title,number:String(number),purpose,sourceKind:"theoretical",
  sourceText:"My calculations from Standing Reach Design Cases v1.",note,
  numberFormat:"source",showRowLines:true,cellAlignment:"numeric"};
}
const sourceFields={
 dataStatus:"ready",actualSourceType:"secondary",actualSource:sourceText,
 sourceCitation:"Standing Reach Design Cases v1, supplied as the editable 24-case dataset in this sample project. Original constructed teaching data.",
 actualMethod:"I used the fixed paired-case table without alteration. Before fitting, I kept the supplied every-fourth-case allocation: cases 4, 8, 12, 16, 20 and 24 for validation, and the other 18 for development.",
 statisticalPopulation:"My conclusions concern the 24 constructed cases and the stated design conditions. They do not estimate a school population.",
 sampleOrCensus:"census",samplingMethod:"I included all 24 supplied cases: 18 for model development and six for a separate prediction check. This is a partition of a fixed design set, not random sampling of people.",
 samplingRationale:"The fixed every-fourth-case allocation leaves 18 pairs for fitting and six unused reaches for checking, with validation heights spread inside the development range. Keeping the allocation unchanged prevents me from choosing validation cases because they happen to fit well; it does not make the cases a random population sample.",
 sampleSize:"24 cases: 18 development, six reserved validation.",
 pairing:"I kept height and standing reach under the same case ID; I never sorted one column separately.",
 responseBias:"There are no survey responses. The important source limitation is how the constructed cases represent variation in body proportions.",
 dataCleaning:"I checked that each case has one numerical height and reach in centimetres, retained every case and made no substitutions or exclusions.",
 modelEvidence:"The 18 development pairs supply the fit; the six reserved pairs test its predictions.",
 modelInputs:"H is height in cm and R is standing reach in cm. Development H ranges from 154 to 192; reserved H ranges from 158 to 189.",
 modelAssumptions:"I test an approximately linear height–reach trend over 155–190 cm, inside the development range. The model predicts reach from height but allows individual cases to depart from its line.",
 methodLimitation:"A narrow scatter around a line can coexist with individual prediction errors that exceed my five-centimetre tolerance."
};

// The saved source and its editor share the same authored values.
const completionFields={
  ...sourceFields,
  changedSincePlanning:"The development fit supported my expectation of a positive linear trend, but four reserved reach predictions exceeded my tolerance. I therefore rejected the tested height rule as a substitute for standing reach when choosing the final marker. I did not establish whether a preliminary height estimate offers any practical advantage.",
  permissionStatus:"not-needed",permissionNotes:"My investigation uses only the declared constructed dataset; I have no participant data.",
  dataStatusSummary:"I analysed all 24 cases under the original allocation: 18 development and six validation. I retained every supplied value.",
  dataAimLink:String.raw`The target rule gives me a direct way to judge a reach prediction. Let the ideal marker be \(T^*=R+25\) and the unrounded height-based marker be \(\widetilde T=\widehat R+25\), where \(\widehat R\) is predicted standing reach. Their difference is
\[
 \widetilde T-T^*=(\widehat R+25)-(R+25)=\widehat R-R=-e,
 \qquad e=R-\widehat R.
\]
Thus every centimetre of reach-prediction error becomes a centimetre of target error, with the opposite sign. A positive \(e\) would place the marker too low; a negative \(e\) would place it too high. Before apparatus rounding, my success condition is exactly \(|e|\le5\text{ cm}\). The common extra \(25\text{ cm}\) cancels, so choosing another fixed extra reach would not remove a prediction error.`,
  chosenMethod:"A paired scatter, least-squares regression of R on H, residual and single-case sensitivity checks, followed by reserved-case validation.",
  methodReason:String.raw`I therefore need a method that predicts \(R\) from \(H\) and lets me examine errors in centimetres of reach. I put \(H\) on the horizontal axis because it is the proposed input to the rule, and \(R\) on the vertical axis because it is the quantity to be predicted. A scatter diagram lets the development pairs determine whether a straight line is a reasonable first candidate.`,
  firstPurpose:String.raw`I want to decide whether a straight line is a defensible candidate for predicting standing reach over \(155\le H\le190\), and to identify any visible variation that might threaten the \(5\text{ cm}\) target tolerance.`,
  firstMethodEvaluation:"A list of reach-to-height ratios would hide where large discrepancies occur across the height range, while joining the points would imply a sequence between different cases. I chose an unconnected scatter to preserve that information. It can guide the choice of a model, but the error identity means that its success must eventually be judged numerically on the reserved reaches.",
  firstMathsBridgePlacement:"before",firstType:"scatter",
  firstDefinitions:String.raw`I use \(H\) for height and \(R\) for standing reach, both in cm. Predicted reach is \(\widehat R\), and \(e=R-\widehat R\). The ideal target is \(T^*=R+25\), while \(\widetilde T=\widehat R+25\) is the unrounded prediction-based target. Since \(\widetilde T-T^*=-e\), my tolerance requires \(|e|\le5\), including equality. After rounding to a permitted marker setting, I use \(T\) for the actual chosen target.`,
  firstPresentation:"Figure 1 plots the 18 development pairs. The axes are labelled with the quantities and centimetres; a break indicates the truncated height and reach scales.",
  accuracyForResult:"I retain unrounded fitted coefficients for all predictions. Two decimal places in the results describe my arithmetic, not the physical accuracy of a measurement.",
  variableDefinitions:String.raw`\(H\): height; \(R\): standing reach; \(\widehat R\): predicted reach; \(e=R-\widehat R\): prediction error or development residual; \(T^*=R+25\): ideal target; \(\widetilde T=\widehat R+25\): unrounded prediction-based target; \(T\): rounded marker setting. All these quantities are in cm. I use lower-case \(r\) only for Pearson's dimensionless correlation coefficient.`,
  specialistTerms:"Standing reach is the floor-to-fingertip height with one arm extended upwards. Extra reach is marker height minus standing reach. In this model, a target 25 cm above reach with a ±5 cm tolerance permits extra reaches from 20 to 30 cm; it does not define equal effort or jumping difficulty.",
  modelValidation:"I fixed cases 4, 8, 12, 16, 20 and 24 as validation cases before fitting. I evaluated the development equation once on these six cases without refitting.",
  modelAlternative:"I compared the height rule with setting the marker from standing reach itself. I did not fit another curve after seeing the validation errors, because those same six cases would then no longer provide an unused check of that new choice.",
  modelDomain:"155≤H≤190 cm; the development set spans 154–192 cm.",
  limitationConsequence:"The target-error identity makes individual prediction error decisive. A high correlation describes the overall linear pattern but cannot ensure that a particular case's extra reach lies between 20 and 30 cm.",
  limitationMitigation:"I separated fit from validation, retained every case, and made the final recommendation conditional on the calculated errors.",
  limitationAcceptable:"The data answer my stated design question for these fixed cases. They do not establish a population success rate.",
  accuracyQuantity:"Height H and standing reach R",accuracySymbol:"H, R",accuracyUnit:"cm",
  accuracyResolution:"The supplied table uses integer centimetres; this is a data convention, not a tested instrument resolution.",
  accuracyPolicy:"I calculate with unrounded coefficients, display predictions to 0.01 cm and round apparatus targets to the nearest 5 cm.",
  accuracyReason:"Keeping guard digits prevents rounding from changing the model comparison. I examine apparatus rounding separately because it affects the actual target.",
  pairedDataType:"paired-numerical",
  scatterPattern:"linear",scatterDetail:"rough-linear",scatterAimRelevance:"yes",pmccSignal:"meaningful-linear",
  pmccInterpretation:String.raw`I obtained \(r\approx0.98614\), a strong positive linear association in my development set. It measures how closely the pairs follow a line; it is not the fraction of individual targets that will be accurate.`,
  predictionComparison:"The positive trend matched my initial expectation. The reserved errors and the two failing rounded settings did not support using this fitted height rule for every individual target within ±5 cm.",
  benefitFinding:"I can calculate a possible preliminary estimate from height, but its convenience has not been tested. For the fixed cases, using standing reach itself removes the height-to-reach prediction error and leaves only the specified marker rounding to assess.",
  technologyTool:"I used the graph generator for scatter and fitted-line figures, a statistics calculation for Pearson's coefficient, and spreadsheet-style calculations for regression, residuals and the 18 single-case refits.",
  technologyInput:"Development cases 1–3, 5–7, 9–11, 13–15, 17–19 and 21–23, with H as predictor and R as response; validation cases were excluded from fitting.",
  technologyOutcome:String.raw`My 18-case fit is \(\widehat R\approx9.78323485+1.25788857H\). The development RMSE is \(2.40368\text{ cm}\), while the reserved-case RMSE is \(5.45906\text{ cm}\).`,
  technologyInterpretation:"I checked the software's fitted coefficients against the centred-sum calculation and checked a reserved-case error by substitution. The difference between fitted and validation RMSE changed my conclusion.",
  courseWhy:"Correlation and linear regression form the AA SL core. I extend them by deriving the least-squares coefficients using completing the square, explaining residual and prediction-error summaries, and checking reserved cases and one-case omissions. Each extension is introduced, worked through and connected to the target decision.",
  courseConcern:"I do not assume that the reader already knows residual diagnostics, RMSE, MAE, reserved-case validation or omission sensitivity. I define those methods where they enter the argument and explain the manual least-squares calculation through familiar algebra rather than unexplained formulas or partial derivatives.",
  mathsLearning:"I expected the positive height–reach relationship to help with target setting. Writing the target error in terms of the reach error showed me what the model actually had to achieve; validation then showed why strong association and a stable fitted line were insufficient for that individual decision.",
  notationIssue:"I used upper-case R for reach and lower-case r for correlation throughout. I distinguished exact definitions from rounded outputs with an approximation sign.",
  presentationIssue:"I placed the scatter beside its interpretation, the residual graph beside the diagnostic discussion, and the two six-row decision tables beside their calculations. The complete case table remains in the editable dataset.",
  referencesIssue:"I identify the constructed case table in the source record and figure notes. I cite NIST/SEMATECH for least squares and Hyndman and Athanasopoulos for prediction-error measures and the separation of fitting and checking cases. The algebra, numerical examples and figures are my own working with the supplied constructed cases; no external participant data or borrowed images are used.",
  draftComplete:"ready",
};

export const STANDING_REACH_SPEC={
 id:"standing-reach",routeId:"relationships",
 title:"Can height alone set a fair basketball reach target?",
 description:"A strong correlation meets a practical test: predict standing reach, check unused cases, and decide whether a height-based drill setting is accurate enough.",
 course:"AA SL",
 readingNote:"A complete fictional student investigation using 24 deliberately constructed height–reach pairs. The data and fixed development/validation split are supplied with the editable project.",
 provenance:"This is an original fictional student investigation. The 24 height/reach pairs are constructed teaching data, not observations of real people. The author fixed the entire case table and the every-fourth-case validation allocation before writing the analysis. Heights and reaches use centimetres; their integer presentation is a design convention, not a claim about instrument accuracy. The offsets from R=1.25H+10 are −0.5, 2, 1.75, 3.5, 2, −0.5, 1, −4.25, 4, 3.5, −3, 8, −3.5, 5, 1.5, −2.75, 3, −1.5, 2, 7.5, −1.5, 1, 4.5 and −5.25 cm in case order. These offsets define cases rather than a probability distribution. The first-person narrative models a completed design investigation using that declared material; it claims no real collection, approval, submission or awarded mark.",
 planning:{
  planIdentifier:"Standing reach and basketball target design",ideaStatus:"yes",
  provisionalTitle:"Can height alone set a fair basketball reach target?",
  idea:"I want to test whether predicting standing reach from height is accurate enough to choose an individual marker setting for an adjustable basketball reach drill.",
  aim:"To investigate whether height can predict standing reach accurately enough to set a target 25 cm above reach, within a tolerance of ±5 cm, for the constructed cases with heights between 155 and 190 cm.",
  motivation:"A height-based rule seems a possible shortcut, but the distance a person must reach above their starting position depends on standing reach. I want to find out whether the prediction error makes that shortcut unsuitable before assuming it is helpful.",
  beneficiaryType:"me",beneficiary:"I would use the result to decide whether my modelled drill should set its marker from height or from standing reach itself.",
  intendedUse:"I will compare the target given by my height rule with the target that uses the case's stated standing reach.",
  kind:"statistics",statisticsContext:"Paired numerical",dataSource:"secondary",course:"AA SL",
  prediction:"I expect an approximately positive linear relationship, so height may supply a reasonable candidate prediction. I am less certain that its individual errors will stay within 5 cm, which is the condition I need to test.",
  predictionWhy:"Taller cases are likely to have greater reach, while different arm and torso proportions could create differences at similar heights.",
  predictionImplication:"If the resulting marker errors meet my tolerance, the rule would remain a candidate for these cases. If they are too large, I will compare it with using standing reach directly rather than treating a strong correlation as sufficient.",
  courseSuitability:"yes",mathsOutside:"outside",
  mathsRevisedWhy:"My core methods are AA SL correlation and linear regression. I will explain the additional least-squares derivation, residual and error measures, reserved-case check and omission sensitivity, using defined notation and worked examples rather than assuming these extensions are familiar.",
  permissionNeed:"no",permissionDetails:"I will use only the supplied constructed cases. There is no personal information or proposed collection from participants.",
  practicalBlocker:"no",
  firstAction:"I will plot R against H for the development set, keeping the six reserved reaches out of model fitting.",
  firstAccuracy:"I will retain full coefficient precision and display predictions to 0.01 cm. I will stipulate marker positions at multiples of 5 cm, assess their rounding separately from prediction error, and not treat integer input values as evidence of measured instrument accuracy.",
  teacherNeed:"I would discuss whether my explanation of model checking and the practical error criterion gives the investigation an appropriate scope.",
  teacherQuestion:"Have I explained the methods beyond core AA SL clearly enough for a reader to follow the least-squares argument, error summaries and model checks, as well as their connection to the target decision?",
  teacherSafeAction:"I can finish checking the arithmetic and the links between my figures, equations and conclusions.",
  teacherExtra:"I would like feedback on the clarity of my argument, especially the transition from a strong correlation to the target-setting decision.",
  universalTeacherQuestion:"Is my conclusion restricted clearly enough to the constructed cases and the design conditions?",
  timelineWeeks:"6",timelineEarly:"yes",
  milestoneAdjustment:"My working sequence is source definitions, development analysis, validation, target calculations, writing and review; school deadlines remain separate.",
  secondaryPublisher:"Standing Reach Design Cases v1, original constructed dataset supplied with this sample.",
  secondaryVariables:"H = height in cm; R = standing reach in cm; case ID identifies the paired values.",
  secondaryScope:"24 constructed cases. Eighteen are allocated to model development; cases 4, 8, 12, 16, 20 and 24 are reserved for validation.",
  secondaryVerified:"yes",secondaryStatus:"ready",
  secondarySamplingOrigin:"The cases were constructed, not sampled from a human population. Every fourth case is reserved before fitting.",
  dataAvailability:"in-hand",
  alternativeMethod:"Using standing reach directly would avoid height-to-reach prediction error. I will compare the resulting marker error with the height rule; the investigation will not measure whether either procedure saves time.",
  readinessImprovement:"I have recorded the split and error threshold in advance so that I cannot adjust them after seeing a favourable fit."
 },
 completion:completionFields,
 introduction:String.raw`In a basketball reach drill, a marker at one fixed height does not ask everyone to reach the same distance above their standing position. I wanted to investigate a rule that adjusts the marker for each person. Height seemed a possible input, but the movement begins at standing reach: the height of the fingertips with one arm extended upwards. Two people of similar height can have different standing reaches, so a rule based on height needs more justification than the observation that taller people generally reach higher.

My aim is to investigate whether height can predict standing reach accurately enough to set a marker \(25\text{ cm}\) above reach, with a target error of at most \(5\text{ cm}\), for heights between \(155\) and \(190\text{ cm}\). The extra \(25\text{ cm}\) is a stipulated challenge for this design, not a recommended jumping height. I chose the \(\pm5\text{ cm}\) tolerance to make the acceptable extra reach explicit: it must lie between \(20\) and \(30\text{ cm}\), including the endpoints. This is the limited meaning of “fair” that I will test; equal extra reach would not establish equal effort or equal difficulty.

I use 24 supplied, deliberately constructed height–reach pairs. I expect their overall relationship to be positive and roughly linear, but that does not tell me whether an individual's marker will meet my tolerance. My decision will depend on the size of the resulting target errors, rather than on how convincing a fitted line looks. The answer will concern these cases and the stated design conditions; a real-player claim would need separate evidence.`,
 dataNotes:String.raw`I denote height by \(H\) and standing reach by \(R\), both in centimetres, and keep each supplied pair under its case ID. The integer values are fixed inputs to this numerical investigation; they do not establish the accuracy of a physical measuring instrument. I retain all 24 pairs in the editable working dataset.

Before fitting any model, I kept the supplied allocation of every fourth case, \(4,8,12,16,20,24\), for validation. By validation I mean checking predictions against values that were not used to choose or fit the rule. The 18 development pairs determine the model; the six reserved heights will later produce predictions, which I will compare with their unused reaches. Keeping the roles separate avoids judging accuracy only on values that helped select the coefficients. This uses the fitting/checking distinction explained by Hyndman and Athanasopoulos, §5.8 [M2], here applied to paired cases rather than a time sequence.

The allocation gives validation heights from \(158\) to \(189\text{ cm}\), spread inside the development range of \(154\) to \(192\text{ cm}\). It provides a separate numerical check without selecting cases according to their later errors; it is not random sampling of people.

I restrict the proposed rule to \(155\le H\le190\), convenient whole-five-centimetre limits inside that development range. Keeping the bracketing development cases lets me test predictions within the observed range instead of extending a line beyond it. I also stipulate that the marker has positions only at multiples of \(5\text{ cm}\). This describes the hypothetical apparatus, not a measurement result. It means I must distinguish the error in a continuous prediction from the error after choosing an available marker position.`,
 stages:[
  {
   key:"inspect-pairs",title:"What the height–reach pattern allows me to predict",
   bridge:"A height rule is worth developing only if the paired values show a pattern that a simple model can represent. My first decision was therefore about the form of that pattern, before calculating any coefficients.",
   purpose:String.raw`Figure 1 shows the 18 development pairs. I used truncated axes to make their vertical spread visible and marked the non-zero starts explicitly. The reserved reaches remain outside this model-development step.`,
   technique:"Paired scatter and contextual comparison",methodId:"other",kind:"scatter",knowledge:"syllabus",
   observation:"linear",
   observationText:"I see an approximately straight rising band across the 18 development pairs, with no separated group. The nearby heights 162 and 164 cm have reaches 209 and 218 cm, so the general trend still leaves individual variation relevant to my five-centimetre target tolerance.",
   result:String.raw`The development heights run from \(154\) to \(192\text{ cm}\), and reaches from \(202\) to \(252\text{ cm}\). Figure 1 shows a rising band without a clear bend or a separated group. This supports a straight line as a candidate over my proposed domain.

The spread matters as well as the direction. Cases 13 and 17 have \((H,R)=(162,209)\) and \((164,218)\): a height difference of \(2\text{ cm}\) accompanies a reach difference of \(9\text{ cm}\). These are different cases, so dividing those differences would not give a person's growth rate. The comparison instead shows why a predicted trend cannot be treated as an exact reach for each case.`,
   interpretation:"The positive direction agrees with my expectation. The roughly straight band gives me a reason to try a line with a slope and intercept; nothing here requires the reach-to-height ratio to be constant or the line to pass through the origin. My data are far from zero height, so forcing that additional condition would need a separate justification.",
   limitations:"The nearby pair does not by itself establish that a fitted rule will fail the tolerance: the error depends on where that rule places each prediction. I must calculate the vertical discrepancies before judging the individual settings.",
   localTakeaway:"A linear prediction is a defensible candidate, but visible case-to-case variation means that its accuracy must be tested.",
   nextQuestion:"My next question was which straight line to use to predict standing reach from a given height.",
   nextWhy:"That would turn the visible pattern into a numerical rule whose errors I could compare with the target tolerance. I would also calculate correlation to describe the pattern, keeping that description separate from the accuracy decision.",
   mathsInsight:"I separated the choice of a plausible model from the later judgement that its errors are small enough.",
   methodChangeReason:"The approximately straight rising band gave me a specific reason to fit a line.",
   outcomeId:"linear"
  },
  {
   key:"fit-reach",title:"Turning the pattern into a prediction rule",
   bridge:String.raw`The identity \(\widetilde T-T^*=-e\) tells me which direction of error matters: vertical error in reach becomes error in the proposed marker height. I therefore fitted reach on height, rather than reversing the two variables.`,
   purpose:String.raw`I used least squares to choose the intercept \(a\) and gradient \(b\) in \(\widehat R=a+bH\). Following the criterion in NIST/SEMATECH, §4.4.3.1 [M1], I minimise the sum of squared errors
\[
 \mathrm{SSE}=\sum(R_i-a-bH_i)^2.
\]
Here \(i\) labels a development pair and \(\sum\) adds over all 18 such pairs. Squaring prevents opposite errors from cancelling and gives larger errors greater weight. I wanted to understand how this criterion determines the line, so I worked through its straight-line case using means and completing the square. Figure 2 shows the resulting fit.`,
   technique:"Pearson correlation and least-squares linear regression",methodId:"linear-regression",kind:"model",knowledge:"mixed",
   unfamiliarComponent:"Deriving the least-squares coefficients, beyond using technology to obtain and interpret the AA SL regression line.",
   knowledgeNotes:"Pearson correlation and linear regression are my familiar core. I explain the manual least-squares extension by centring the variables, separating a vertical offset, and completing a square in the gradient; I do not assume a two-variable calculus method.",
   researchSource:"NIST/SEMATECH e-Handbook of Statistical Methods, §4.4.3.1, Least Squares [M1], https://www.itl.nist.gov/div898/handbook/pmd/section4/pmd431.htm. I use its least-squares criterion and give an algebraic derivation for my straight line.",
   understandingExample:String.raw`Writing \(u_i=H_i-\bar H\), \(v_i=R_i-\bar R\), and \(a=\bar R-b\bar H+c\) gives \(\mathrm{SSE}=\sum(v_i-bu_i)^2+18c^2\). The minimum has \(c=0\). Completing the square in \(b\) then gives \(b=S_{HR}/S_{HH}\), so \(b\approx2921.1667/2322.2778\approx1.25788857\) and \(a\approx9.78323485\).`,
   result:String.raw`I denote the mean height and reach by \(\bar H\) and \(\bar R\). Subtracting these means gives centred values
\[
 u_i=H_i-\bar H,\qquad v_i=R_i-\bar R,
 \qquad \sum u_i=\sum v_i=0.
\]
The two sums are zero because deviations above a mean balance deviations below it. For any chosen gradient \(b\), I can write the intercept as \(a=\bar R-b\bar H+c\), where \(c\) is the extra vertical offset from a line through the mean point. The error for pair \(i\) is then \(v_i-bu_i-c\). Expanding its square and adding gives
\[
 \mathrm{SSE}=\sum(v_i-bu_i-c)^2
 =\sum(v_i-bu_i)^2+18c^2.
\]
The cross term disappears because \(\sum(v_i-bu_i)=0\). Since \(18c^2\ge0\), any fixed gradient gives its smallest SSE at \(c=0\). Thus the best line for that gradient passes through \((\bar H,\bar R)\), and \(a=\bar R-b\bar H\).

To choose the gradient, I abbreviate the remaining sums as \(S_{HH}=\sum u_i^2\), \(S_{HR}=\sum u_iv_i\) and \(S_{RR}=\sum v_i^2\). Expanding and completing the square gives
\[
 \begin{aligned}
 \mathrm{SSE}(b)&=S_{RR}-2bS_{HR}+b^2S_{HH}\\
 &=S_{HH}\left(b-\frac{S_{HR}}{S_{HH}}\right)^2
   +S_{RR}-\frac{S_{HR}^2}{S_{HH}}.
 \end{aligned}
\]
The heights are not all equal, so \(S_{HH}>0\). The final two terms do not depend on \(b\); the squared term is smallest when it is zero. This explains why the least-squares gradient is \(b=S_{HR}/S_{HH}\).

For my development data, \(\sum H=3125\), \(\sum R=4107\), \(\sum H^2=544857\) and \(\sum HR=715942\). Hence \(\bar H=3125/18\approx173.6111\), \(\bar R=4107/18\approx228.1667\), and the centred sums are
\[
 S_{HH}=\sum(H_i-\bar H)^2\approx2322.2778,\qquad
 S_{HR}=\sum(H_i-\bar H)(R_i-\bar R)\approx2921.1667.
\]
Also, \(S_{RR}=3778.5\). Substituting into the expressions I have derived gives
\[
 b=\frac{S_{HR}}{S_{HH}}\approx1.25788857,\qquad
 a=\bar R-b\bar H\approx9.78323485.
\]
My fitted rule is therefore
\[
 \widehat R\approx9.78323485+1.25788857H.
\]
Using the same 18 height–reach pairs in the statistics calculation, I obtained Pearson's coefficient
\[
 r\approx0.986142.
\]
At \(H=175\), my unrounded coefficients give \(\widehat R\approx229.91\text{ cm}\). I used the full coefficients in subsequent calculations; the displayed decimal approximation is not a new rounded model.`,
   interpretation:String.raw`Within my height range, increasing the input by \(1\text{ cm}\) increases the fitted reach by about \(1.26\text{ cm}\). The intercept locates this line; it is not a meaningful prediction for a zero-height person. The correlation confirms a strong positive linear association, but \(r\approx0.98614\) does not mean that \(98.6\%\) of individual predictions meet my tolerance.

For the illustrative height \(175\text{ cm}\), the continuous target would be \(\widetilde T\approx229.91+25=254.91\text{ cm}\). This shows how the equation would set a target, but there is no supplied reach at exactly that height with which to establish its error.`,
   limitations:"Least squares optimises the total squared error on the development cases; my aim requires an acceptable target for each individual case. Those are different criteria. A line can be the best least-squares fit and still have errors larger than 5 cm, particularly on cases that did not help determine its coefficients.",
   localTakeaway:"The fitted line supplies the prediction I need, but the high correlation does not settle the target-accuracy question.",
   nextQuestion:"Before testing the reserved cases, I asked whether the development errors revealed a reason to reconsider this particular line.",
   nextWhy:"A systematic bend in the residuals would challenge its shape, while a large prediction change after omitting one pair would show that the rule depended strongly on that pair. Both can be checked without using the reserved reaches to choose a model.",
   mathsInsight:"A regression slope, an intercept and a correlation coefficient answer different questions; I interpreted each in relation to my variables.",
   methodChangeReason:"The fitted equation made its discrepancies calculable, so I could examine the part of each reach that height did not explain.",
   outcomeId:"fits"
  },
  {
   key:"check-development",title:"Checking the fitted errors and prediction stability",
   bridge:"I used the development data for two different checks: whether the line missed a visible pattern, and whether its predictions were sensitive to any one supplied pair. Neither check could yet answer how it would perform on unused reaches.",
   purpose:String.raw`A residual is the discrepancy left after fitting: \(e_i=R_i-\widehat R_i\). A positive value means the line predicts too little reach; a negative value means it predicts too much. Figure 3 plots residuals against height. A curved pattern, such as predominantly positive errors at both ends and negative ones in the middle, would suggest a shape that the straight line misses. I also examined sensitivity: how much the predictions change when one development pair is left out.`,
   technique:"Residual analysis and one-case-at-a-time regression sensitivity",methodId:"linear-regression",kind:"model",knowledge:"mixed",
   unfamiliarComponent:"Residual diagnostics, root mean square error and one-case-at-a-time refitting as additional model checks.",
   knowledgeNotes:"I define the residual and explain its sign, calculate RMSE by squaring, averaging and square-rooting the errors, and describe every step of the omission check. The endpoint comparison follows from the difference of two lines being linear.",
   researchSource:"Hyndman and Athanasopoulos, Forecasting: Principles and Practice, 3rd ed., §5.8 [M2], https://otexts.com/fpp3/toolbox.html, for the error measure. The omission calculation uses my explicitly stated algorithm and the least-squares formula derived in the previous stage.",
   understandingExample:String.raw`The fitted reach at \(H=162\) is approximately \(213.56\), so case 13 has residual \(209-213.56\approx-4.56\text{ cm}\). Omitting that pair and recalculating the means and centred sums on the remaining 17 cases gives \(b_{-13}\approx1.23216\) and \(a_{-13}\approx14.53584\); its prediction at \(H=155\) is about \(0.765\text{ cm}\) above the original prediction.`,
   result:String.raw`The residuals fall on both sides of zero, without a clear curved pattern. Their range is approximately \(-4.56\) to \(3.83\text{ cm}\). For case 13,
\[
 e_{13}\approx209-(9.78323485+1.25788857\times162)\approx-4.56\text{ cm}.
\]
To summarise their sizes, I used root mean square error (RMSE), as defined by Hyndman and Athanasopoulos, §5.8 [M2]. I square each error, find the mean of those squares, then take the square root. Squaring stops opposite signs cancelling; the square root returns the result from \(\text{cm}^2\) to centimetres. My squared-residual sum is approximately \(103.99785\text{ cm}^2\), so
\[
 \mathrm{RMSE}_{\mathrm{dev}}
 =\sqrt{\frac{\sum e_i^2}{18}}
 \approx\sqrt{\frac{103.99785}{18}}
 \approx2.40\text{ cm}.
\]
Every development residual has magnitude below \(5\text{ cm}\), so all 18 continuous reach predictions meet the preliminary error check. This is not yet a check of rounded marker positions. RMSE gives larger errors more weight, but its average does not replace the individual comparisons. The denominator is 18 because I am averaging these 18 squared errors.

For each sensitivity refit, I removed one pair, recalculated both means and both centred sums on the remaining 17 pairs, then used the same formulas for \(b\) and \(a\). I restored the pair before trying the next omission. For example, without case 13 the remaining height and reach sums are 2963 and 3898. Using a subscript \(-13\) to mean “case 13 omitted” gives
\[
 \begin{aligned}
 b_{-13}&\approx\frac{2685.52941}{2179.52941}\approx1.23216021,\\
 a_{-13}&=\frac{3898}{17}-b_{-13}\frac{2963}{17}\approx14.53584152.
 \end{aligned}
\]
At \(H=155\), this line predicts about \(205.52067\text{ cm}\), compared with the original \(204.75596\text{ cm}\): a change of about \(0.76471\text{ cm}\). I compare predictions because the intercept changes with the gradient, and reach is what enters the target rule.

The 18 gradients range from about \(1.23216\), omitting case 13, to \(1.28582\), omitting case 9. Table 1 shows these two extreme-gradient diagnostics beside the original fit; the complete refits remain in the working dataset.

Across all omissions, the largest change in a continuous prediction anywhere from \(H=155\) to \(190\) was about \(0.765\text{ cm}\). I checked those two endpoints for each refit because subtracting two straight-line equations gives another straight line. Its values move steadily between its endpoint values, so no intermediate value can be farther from zero than both endpoints. This covers the whole domain, rather than just the three heights in Table 1.`,
   interpretation:"There is no clear residual curvature suggesting that I should add a quadratic term. Omitting a single pair changes the continuous predictions by less than 1 cm, small compared with my 5 cm tolerance. I retained all 18 pairs in the final equation: the omissions diagnosed influence and were not a way of selecting a more favourable fit.",
   limitations:"This stability concerns continuous reach predictions under one-case omissions. It does not establish that the later rounded marker choices stay unchanged, nor does it test a different collection of cases or simultaneous changes to several values.",
   localTakeaway:"The line has no clear curved residual pattern, its development reach errors meet the preliminary tolerance, and its continuous predictions change by less than 0.77 cm under any single-case omission. Unused-case accuracy and rounded target performance remain to be checked.",
   nextQuestion:"The unresolved question was now whether the same equation would predict the six reserved reaches closely enough.",
   nextWhy:"The development results gave me a reason to keep this candidate, not to lower the standard it had to meet. I fixed the coefficients and carried the original five-centimetre criterion into the reserved-case test.",
   mathsInsight:"I checked sensitivity through changes to predicted reach, because unstable-looking coefficients matter only through their effect on the decision.",
   methodChangeReason:"The development diagnostics did not justify changing the model, so I kept it fixed for validation.",
   outcomeId:"fits"
  },
  {
   key:"validate-reach",title:"Testing predictions that did not help determine the line",
   bridge:"This check could change my judgement even if the equation and its correlation remained exactly the same. Its purpose was to test prediction on the unused reaches, rather than obtain a better fit to the values I had already analysed.",
   purpose:"I substituted each reserved height into the unchanged 18-case equation. Table 2 includes all six cases, their supplied and predicted reaches, and the errors R−predicted reach. I judged each absolute error against 5 cm before summarising the set.",
   technique:"Reserved-case prediction errors, RMSE and absolute error",methodId:"linear-regression",kind:"model",knowledge:"mixed",
   unfamiliarComponent:"Using unchanged-model predictions on reserved cases, and calculating mean absolute error alongside RMSE.",
   knowledgeNotes:"I explain why unused reaches provide a different check from fitted residuals. I define MAE as the mean of the error magnitudes, give the absolute-error total and division by six, and compare it with the squared-error total used for RMSE.",
   researchSource:"Hyndman and Athanasopoulos, Forecasting: Principles and Practice, 3rd ed., §5.8, Evaluating point forecast accuracy [M2], https://otexts.com/fpp3/toolbox.html. I apply the fitting/checking distinction and error definitions to these paired cases, not a time-series procedure.",
   understandingExample:String.raw`The six absolute errors sum to approximately \(31.3841\text{ cm}\), giving \(\mathrm{MAE}=31.3841/6\approx5.23\text{ cm}\). Their squared errors sum to approximately \(178.8083\text{ cm}^2\), giving \(\mathrm{RMSE}=\sqrt{178.8083/6}\approx5.46\text{ cm}\). Neither summary replaces checking each case against the tolerance.`,
   result:String.raw`The result was less successful than the development fit suggested. For case 12, \(H=172\) and \(R=233\), so
\[
 \widehat R_{12}\approx226.14\text{ cm},\qquad
 e_{12}\approx233-226.1400684\approx6.86\text{ cm}.
\]
Only cases 4 and 16 have \(\lvert e\rvert\le5\text{ cm}\): \(2\) of the \(6\) reserved predictions. The largest absolute error is about \(6.86\text{ cm}\). I also calculated mean absolute error (MAE): take the magnitude of each error, add those magnitudes and divide by the number of cases [M2]. For example, case 8's error is about \(-5.33\text{ cm}\), so it contributes \(+5.33\text{ cm}\) to the absolute-error total. For the following summaries, each sum is over the six reserved cases:
\[
 \mathrm{MAE}=\frac{\sum|e_i|}{6}
 \approx\frac{31.3841}{6}\approx5.23\text{ cm}.
\]
Using the same squaring, averaging and square-rooting procedure as before,
\[
 \mathrm{RMSE}_{\mathrm{val}}
 =\sqrt{\frac{\sum e_i^2}{6}}
 \approx\sqrt{\frac{178.8083}{6}}\approx5.46\text{ cm}.
\]
MAE describes the average magnitude of the reach error; RMSE gives extra weight to the larger discrepancies and can be compared with the development RMSE. Neither average tells me that every case is acceptable. The mean signed error is only about \(-0.037\text{ cm}\), because the positive and negative errors nearly cancel. That cancellation cannot make an individual's target correct: the identity \(\widetilde T-T^*=-e\) shows that either sign can breach my tolerance.`,
   interpretation:"The continuous prediction fails the five-centimetre requirement on four reserved cases, despite the strong correlation and the small changes under single-case refits. The validation RMSE is also more than twice the development RMSE. I therefore cannot use the fitted appearance or stability of the line as evidence that it gives sufficiently accurate individual targets. The apparatus rounding still needs its own check before I make the final decision.",
   limitations:"The 2/6 count describes these six fixed cases; it is not an estimate that one third of future players would meet the tolerance. It is enough to identify failures of this candidate rule, but not to prove that every possible height-based model would fail. Trying another curve because of these errors would use the reserved cases to develop that alternative, so it would need a fresh check.",
   localTakeaway:"The reserved-case test weakens the case for an individual height-only setting despite the very high development correlation.",
   nextQuestion:"The last part of my original question concerned the available marker positions, rather than the continuous predictions alone.",
   nextWhy:"Rounding might move a marker towards its ideal position or away from it. I therefore needed to apply the stipulated five-centimetre setting rule to every reserved case and judge the actual extra reach it produced.",
   mathsInsight:"A nearly zero average signed error can coexist with substantial individual errors because opposite errors cancel.",
   methodChangeReason:"The reserved errors ruled out treating fitted performance as evidence of individual accuracy. I then completed the preplanned marker-rounding check before deciding whether the actual target rule met the aim.",
   outcomeId:"uncertain"
  },
  {
   key:"choose-target",title:"Judging the marker settings against the original aim",
   bridge:String.raw`The continuous target error is \(-e\), but a marker at \(\widetilde T=\widehat R+25\) may not be an available setting. I now included that final design restriction, using the same cases and the same tolerance.`,
   purpose:String.raw`My apparatus rule rounds the predicted target to the nearest multiple of \(5\text{ cm}\):
\[
 T=5\,\operatorname{round}\!\left(\frac{\widehat R+25}{5}\right).
\]
Here \(\operatorname{round}(x)\) means the nearest integer, with an exact half-way value rounded to the higher integer. Dividing by 5 expresses the target as a number of five-centimetre steps; rounding chooses a whole number of steps, and multiplying by 5 returns a height in centimetres. For case 8, \(\widetilde T\approx242.33485\), so \(T=5\operatorname{round}(48.46697)=5(48)=240\text{ cm}\).

Table 3 compares the setting \(T\) with the ideal \(T^*=R+25\), and also gives the actual extra reach \(T-R\). These express the same acceptance test in two ways: \(|T-T^*|\le5\) is equivalent to \(20\le T-R\le30\).`,
   technique:"Algebraic error propagation and practical rounding",methodId:"linear-regression",kind:"model",knowledge:"mixed",
   unfamiliarComponent:"The round operator and a sensitivity comparison between a continuous prediction and stepped marker settings.",
   knowledgeNotes:"I use familiar algebra with straight lines and inequalities, but introduce round(x), its half-way convention, the half-step error bound, and delta notation explicitly. The concrete case 8 calculation explains why a small continuous change can cross a whole marker step.",
   researchSource:"",
   understandingExample:String.raw`For case 8, the predicted target is about \(242.33485\text{ cm}\). Dividing by five gives \(48.46697\), whose nearest integer is 48, so the chosen setting is \(240\text{ cm}\). The maximum distance to the nearer of two settings five centimetres apart is half their spacing, \(2.5\text{ cm}\).`,
   result:String.raw`The six settings are \(235,240,250,260,270,275\text{ cm}\), in the reserved-case order. Their errors \(T-T^*\) are \(-1,3,-8,4,-5,9\text{ cm}\). Four meet the original \(\pm5\text{ cm}\) criterion, including the boundary value \(-5\).

This improvement from \(2/6\) to \(4/6\) is incidental to the six particular predictions, rather than evidence that rounding corrects the model. Let \(q=T-\widetilde T\) be the rounding adjustment. Between two settings five centimetres apart, a target is at most halfway from the nearer one; hence \(|q|\le2.5\text{ cm}\). Extending the earlier error identity gives
\[
 T-T^*=-e+q.
\]
Rounding can oppose an existing error or reinforce it. Case 8 changes from a \(5.33\text{ cm}\) overestimate of its ideal target to a \(3\text{ cm}\) overestimate after rounding, while case 24 worsens from about \(6.52\) to \(9\text{ cm}\). The two failing cases, 12 and 24, have actual extra reaches of \(250-233=17\text{ cm}\) and \(275-241=34\text{ cm}\). Both lie outside the original \(20\)–\(30\text{ cm}\) interval.

I then asked whether a small change in the supplied height could alter this decision. I chose \(\pm0.5\text{ cm}\), half the table's one-centimetre input step, as a sensitivity scenario rather than an estimate of instrument error. Let \(\Delta H\) denote the change in height input and \(\Delta\widehat R\) the resulting change in predicted reach. Holding the coefficients fixed gives
\[
 \Delta\widehat R=[a+b(H+\Delta H)]-[a+bH]=b\Delta H.
\]
Therefore, if \(|\Delta H|\le0.5\),
\[
 |\Delta\widehat R|=|b\,\Delta H|\le1.25788857(0.5)\approx0.629\text{ cm}.
\]
That continuous change is smaller than the main reserved-case discrepancies. The rounded setting can still jump by \(5\text{ cm}\) near a rounding boundary: increasing case 8's height input from \(165\) to \(165.5\text{ cm}\) moves its setting from \(240\) to \(245\text{ cm}\), turning a \(3\text{ cm}\) target error into \(8\text{ cm}\). Thus neither the small input sensitivity nor the earlier stable continuous refits guarantee stable rounded decisions.`,
   interpretation:String.raw`For these cases, the direct alternative is to use the supplied standing reach and choose
\[
 T_R=5\,\operatorname{round}\!\left(\frac{R+25}{5}\right).
\]
This removes the reach-prediction term: \(T_R-(R+25)\) is only a rounding error, of magnitude at most \(2.5\text{ cm}\). With the given \(R\) values treated as exact inputs, the extra reach must therefore lie between \(22.5\) and \(27.5\text{ cm}\), inside my acceptable interval. This is a reason to prefer standing reach itself for the final setting in the defined model.`,
   limitations:"In real use, standing reach would have measurement uncertainty as well. The 2.5 cm bound applies to rounding an accurate reach value, not to the complete physical procedure. My constructed inputs let me compare the two mathematical rules, but do not establish either procedure's measurement accuracy or convenience.",
   localTakeaway:"The tested height rule fails the final target criterion on two reserved cases. Using the fixed standing reaches directly removes prediction error and keeps marker-rounding error within 2.5 cm; physical measurement accuracy remains outside the supplied evidence.",
   nextQuestion:"I can now answer the original target-setting question: the tested height rule has two explicit failures after all the stipulated setting steps are included.",
   nextWhy:"I stopped here because the model, its unused-case predictions and the actual marker choices have all been judged against the same criterion. Adding a new predictor or relaxing the tolerance would change the investigation rather than repair this result.",
   mathsInsight:"A practical rounding rule changes individual errors in both directions, and an input-precision calculation must distinguish the continuous prediction from the stepped final setting.",
   methodChangeReason:"I converted the numerical finding into the actual decision required by my aim, while keeping the original tolerance unchanged.",
   outcomeId:"uncertain"
  }
 ],
 figures:[
  {id:"figure-reach-development",tool:"graph",stage:0,after:"purpose",
   draft:graphDraft({title:"Height and standing reach: development cases",number:1,
    rows:development.map(([,h,r])=>[h,r]),
    caption:"The 18 development pairs. The six reserved reaches are excluded from this plot and from fitting."})},
  {id:"figure-reach-fit",tool:"graph",stage:1,after:"result",
   draft:graphDraft({title:"Least-squares reach prediction",number:2,
    rows:development.map(([,h,r])=>[h,r]),
    models:[{id:"model-reach-linear",type:"linear",visible:true}],
    caption:"The least-squares line uses all 18 development pairs. The displayed equation uses H for height and R for reach."})},
  {id:"figure-reach-residuals",tool:"graph",stage:2,after:"purpose",
   draft:graphDraft({title:"Development residuals against height",number:3,residual:true,
    rows:development.map(([,h,r])=>[h,r-fitted.predict(h)]),yLabel:"Reach residual",ySymbol:"e",
    caption:"Residual = given reach − fitted reach. All development cases are retained; zero is shown on the residual axis."})},
  {id:"table-reach-sensitivity",tool:"table",stage:2,after:"result",
   draft:tableDraft({title:"Prediction sensitivity to one omitted development case",number:1,
    columns:["Fit","Gradient","At H=155","At H=175","At H=190"],units:["","","cm","cm","cm"],
    rows:[["All 18",decimals(fitted.b,5),...([155,175,190].map(h=>decimals(fitted.predict(h))))],
     ...[13,9].map(id=>{const reduced=leaveOneOut.find(row=>row.omitted===id);
      return ["Omit "+id,decimals(reduced.b,5),...([155,175,190].map(h=>decimals(reduced.predict(h))))];})],
    purpose:"I show the original prediction and the two extreme-gradient refits from all 18 diagnostic omissions.",
    note:"Diagnostic refits only. Cases 13 and 9 give the minimum and maximum gradients; the final model retains all 18 cases."})},
  {id:"table-reach-validation",tool:"table",stage:3,after:"result",
   draft:tableDraft({title:"Predictions for every reserved case",number:2,
    columns:["Case","Height H","Reach R","Predicted R","Error e"],units:["","cm","cm","cm","cm"],
    rows:reserved.map(([id,h,r])=>[id,h,r,decimals(fitted.predict(h)),decimals(r-fitted.predict(h))]),
    purpose:"I compare every unused-case prediction with its supplied reach under the original five-centimetre criterion.",
    note:"All six reserved cases, fixed before fitting. Error = given reach − predicted reach. Predictions use unrounded coefficients."})},
  {id:"table-reach-targets",tool:"table",stage:4,after:"result",
   draft:tableDraft({title:"The rounded target and its actual extra reach",number:3,
    columns:["Case","Setting T","Ideal R+25","Target error","Extra reach"],units:["","cm","cm","cm","cm"],
    rows:reserved.map(([id,h,r])=>{const target=5*Math.round((fitted.predict(h)+25)/5);return [id,target,r+25,target-r-25,target-r];}),
    purpose:"I assess the apparatus setting, including the rounding step, against the ideal target for all reserved cases.",
    note:"Target error = setting − ideal target. Extra reach = setting − standing reach. An error of exactly ±5 cm meets my criterion."})}
 ],
 sources:[{id:sourceId,fields:Object.fromEntries(SOURCE_FIELDS.map(key=>[key,completionFields[key]||""]))}],
 planningAccuracy:[
  {id:"pa-secondary-reach-height",source:"secondary",quantity:"Height H",unit:"cm",
   resolution:"Integer centimetres in the supplied case table.",basis:"rounded",
   uncertainty:"The constructed inputs do not establish instrument accuracy. I will examine a separate hypothetical height-reading change of ±0.5 cm."},
  {id:"pa-secondary-reach-standing",source:"secondary",quantity:"Standing reach R",unit:"cm",
   resolution:"Integer centimetres in the supplied case table.",basis:"rounded",
   uncertainty:"I will treat the given reaches as fixed values for this design study and retain guard digits in predicted reaches; physical reach-measurement uncertainty is not supplied."}
 ],
 primaryQuantities:[],
 accuracy:[
  {id:"accuracy-reach-input",quantity:"Supplied height and standing reach",symbol:"H, R",unit:"cm",
   resolution:"Integer centimetres in the constructed case table.",
   policy:"I preserve the supplied integers and use unrounded fitted coefficients; I display derived predictions to 0.01 cm.",
   reason:"These are exact inputs for my numerical study. Display precision is separate from physical measurement uncertainty.",sourceId},
  {id:"accuracy-reach-target",quantity:"Target setting",symbol:"T",unit:"cm",
   resolution:"Five-centimetre apparatus intervals, specified as a design condition.",
   policy:"I round the predicted target to the nearest multiple of 5 cm and evaluate the resulting setting error separately.",
   reason:"The final decision uses a stepped apparatus setting, so its rounding error must be included in the conclusion.",sourceId}
 ],
 dataSets:[
  {name:"Standing Reach Design Cases v1",columns:["Case ID","Height H (cm)","Standing reach R (cm)","Role"],
   rows:REACH_CASES.map(([id,h,r])=>[String(id),String(h),String(r),validation.has(id)?"Reserved validation":"Development"]),
   sourceText},
  {name:"All single-case sensitivity refits",columns:["Omitted case","Intercept","Gradient","Prediction at 155","Prediction at 190"],
   rows:leaveOneOut.map(row=>[row.omitted,row.a,row.b,row.predict(155),row.predict(190)].map(String)),
   sourceText:"My 18 diagnostic refits of the development data. The original all-case model remains the final prediction rule."}
 ],
 conclusion:{
  mainConclusion:String.raw`The linear height-based rule I developed does not meet my target-setting requirement on all the checked cases. Its equation, \(\widehat R\approx9.78323+1.25789H\), captures a strong development association, with \(r\approx0.98614\). Nevertheless, only \(2/6\) reserved reach predictions were within \(5\text{ cm}\), and their RMSE was about \(5.46\text{ cm}\). The development correlation therefore did not provide the individual accuracy my aim required.

The decisive check is the marker that would actually be chosen. After rounding to the stipulated \(5\text{ cm}\) positions, four of the six settings met the tolerance, but two were \(8\text{ cm}\) too low and \(9\text{ cm}\) too high. Their extra reaches of \(17\) and \(34\text{ cm}\) lie outside my original \(20\)–\(30\text{ cm}\) interval. I would therefore base the final individual setting on a direct standing-reach measurement, whose own accuracy would need checking. For the exact reaches supplied here, setting the marker from \(R+25\) leaves at most \(2.5\text{ cm}\) of rounding error and satisfies the design criterion.`,
  conclusionBenefit:"The investigation gave me a numerical way to distinguish a convincing fit from an acceptable target-setting rule. A strong association and continuous predictions that changed by less than 0.77 cm under single-case omissions made it a defensible candidate to test; neither established that its final targets were acceptable. The error identity connected every reach discrepancy to the marker decision, while the reserved cases and rounding calculation exposed the failures. My expectation of a positive linear pattern was supported, but I cannot justify replacing standing reach with this fitted rule. Height could still supply a preliminary estimate, but I have not demonstrated an advantage to doing so. These conclusions concern the fixed cases and design assumptions, and do not establish a population success rate or rule out every other height-based model.",
  conclusionExtension:"A focused extension would investigate the accuracy needed when standing reach itself is measured. I would use repeated measurements under a consistent posture to justify a reach-error bound, then examine how that bound combines with the five-centimetre marker spacing. That would test whether the direct-setting alternative can meet the same extra-reach criterion in physical use, where the exact-input assumption of this investigation no longer holds."
 },
 reviews:[
  {id:"D01",location:"Introduction, five mathematical stages and conclusion",
   note:"My draft defines the target criterion, derives its connection to reach-prediction error, develops and checks a regression, tests reserved cases, and judges the rounded markers. The six figures/tables support those decisions, and the conclusion answers the original setting question.",
   action:"I will keep school-specific submission checks separate from the mathematical completeness of this draft."},
  {id:"D02",location:"The final paragraph of each stage and the opening paragraph of the next",
   note:"Each stage resolves a question needed for the next: whether a line is plausible, which line predicts reach, whether development diagnostics justify keeping it, how it performs on unused reaches, and what the rounded markers require. The final stage explains why I can conclude, and the future extension appears once in the conclusion.",
   action:"I read the selected answer fields as continuous prose, gave adjoining paragraphs different jobs and kept the original target criterion unchanged."},
  {id:"D03",location:"Variable definitions, Figures 1–3 and Tables 1–3",
   note:"I distinguish reach R from correlation r, define ideal, continuous and rounded targets, and derive why reach error and unrounded target error have opposite signs. Axes and table columns carry centimetres where appropriate, and rounded numerical results use approximation signs.",
   action:"I will recheck those symbols and units if I change a figure or export layout."},
  {id:"D04",location:"Introduction, data allocation, validation and target-setting stage",
   note:"I explain the stipulated 25 cm challenge, interpret the ±5 cm tolerance as an extra-reach interval, justify the interpolation domain, and preserve the supplied validation allocation. The target-error identity motivates regression in reach, and the observed failures determine my final judgement.",
   action:"I distinguish design choices from measured facts and do not claim that the height rule has a demonstrated practical advantage as a preliminary setting."},
  {id:"D05",location:"Interpretations after regression, sensitivity, validation and target rounding",
   note:"I distinguish least-squares fit from the individual acceptance criterion, interpret the error summaries, and limit the omission check to continuous predictions. Rounding helps some reserved cases but worsens another; a small input change can cross a marker boundary. Those calculations lead to the direct-reach comparison.",
   action:"I kept the consequential limitations next to the results they restrict and condensed them in the conclusion."},
  {id:"D06",location:"Regression derivation and all error calculations",
   note:"I derived the least-squares coefficients by centring and completing the square, then checked the numerical fit, worked omission, RMSE and MAE totals, every reserved prediction and the rounded settings. I defined unfamiliar notation, showed why the endpoint check covers the continuous interval, and justified the nearest-setting bound.",
   action:"I will rerun the arithmetic if any supplied value or design condition changes."},
  {id:"D07",status:"checked",location:"Complete reader, PDF and Word document",
   note:"I used short captions and at most six rows in each displayed result table. Each saved figure is placed with the paragraph that introduces or interprets it, and the complete input dataset remains available separately.",
   action:"I checked the exported pages at normal reading size, particularly the two five-column decision tables, and kept the figure labels, captions and mathematical expressions readable."},
  {id:"D09",location:"Source record and dataset reference",
   note:"I identify Standing Reach Design Cases v1 as constructed data, retain its complete inputs, and distinguish it from the real methodology references. NIST/SEMATECH supports the least-squares criterion; Hyndman and Athanasopoulos support the error measures and fitting/checking distinction. The numerical results and figures use my supplied cases.",
   action:"I placed [M1] and [M2] beside the methods they support and supplied full references. I have not attributed the constructed pairs to either source or to real participants."},
  {id:"D11",location:"Regression, residual, validation and target-setting results",
   note:"The draft includes the target-error identity, regression calculation, a worked residual, a worked reserved prediction, two error summaries, all six rounded target outcomes and the direct-reach rounding bound. Each result has a role in the stated decision.",
   action:"I checked that the conclusion quotes the reserved-case results, not only the development fit."},
  {id:"D19",location:"Figure 1 and Tables 1–3; editable working datasets",
   note:"I show every reserved case in the main argument because all six determine the accuracy judgement. Table 1 shows the explicitly identified extreme-gradient diagnostics, with all 18 sensitivity calculations retained in the working dataset.",
   action:"I kept the full source data accessible without inserting a long raw-data table into the narrative."},
  {id:"D20",location:"Regression calculation and sensitivity analysis",
   note:"I state the input allocation, use technology for Pearson's coefficient, and explain the regression coefficients through an algebraic derivation. The 17-case omission example and endpoint argument make the sensitivity algorithm reproducible. I explain error units and the rounding operator rather than treating software outputs as self-explanatory.",
   action:"I retained the editable generator drafts and complete calculation inputs so the numerical outputs can be reproduced."}
 ],
 references:[
  {label:"Data record",value:"Standing Reach Design Cases v1. Original constructed 24-case teaching dataset supplied with this illustrative project. The complete paired values and fixed development/validation allocation are retained in the editable dataset."},
  {label:"Calculation record",value:"Single-case sensitivity calculations, version 1. My 18 refits of the stated development dataset, retained with the project. All graphs and tables in the investigation are generated from these inputs."},
  {label:"[M1] Least-squares method",value:"NIST/SEMATECH. e-Handbook of Statistical Methods, §4.4.3.1, Least Squares. https://www.itl.nist.gov/div898/handbook/pmd/section4/pmd431.htm (accessed 23 October 2026). Source for the sum-of-squared-errors criterion and straight-line coefficient formulas; I explain those formulas here using centring and completing the square."},
  {label:"[M2] Prediction-error measures and separate checking cases",value:"Hyndman, R. J., and Athanasopoulos, G. (2021). Forecasting: Principles and Practice, 3rd edition. OTexts, Melbourne. §5.8, Evaluating point forecast accuracy. https://otexts.com/fpp3/toolbox.html (accessed 23 October 2026). Source for MAE, RMSE and the distinction between fitting and test data. I apply these ideas to fixed paired cases; I do not use a time-series forecasting procedure."}
 ]
};

