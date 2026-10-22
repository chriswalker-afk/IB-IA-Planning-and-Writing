import {newGraphDraft} from "../../diagrams/graph-core.js";
import {newTableDraft} from "../../diagrams/table-studio-core.js";
import {SOURCE_FIELDS} from "../../completing/evidence-links.js";

/**
 * One complete fictional student investigation. Numerical inputs are fixed,
 * including the development/validation allocation. No source or participant is
 * presented as real. The narrative and saved figures use these same inputs.
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
 actualMethod:"I used the fixed paired-case table without alteration. I reserved cases 4, 8, 12, 16, 20 and 24 before fitting; the other 18 cases formed my development set.",
 statisticalPopulation:"My conclusions concern the 24 constructed cases and the stated design conditions. They do not estimate a school population.",
 sampleOrCensus:"census",samplingMethod:"I included all 24 supplied cases: 18 for model development and six for a separate prediction check. This is a partition of a fixed design set, not random sampling of people.",
 samplingRationale:"Keeping every fourth case for validation gives me six unused reach values spread across the height range. I fixed that allocation before calculating a model.",
 sampleSize:"24 cases: 18 development, six reserved validation.",
 pairing:"I kept height and standing reach under the same case ID; I never sorted one column separately.",
 responseBias:"There are no survey responses. The important source limitation is how the constructed cases represent variation in body proportions.",
 dataCleaning:"I checked that each case has one numerical height and reach in centimetres, retained every case and made no substitutions or exclusions.",
 modelEvidence:"The 18 development pairs supply the fit; the six reserved pairs test its predictions.",
 modelInputs:"H is height in cm and R is standing reach in cm. Development H ranges from 154 to 192; reserved H ranges from 158 to 189.",
 modelAssumptions:"I treat the conditional trend as approximately linear over 155–190 cm. I do not assume that two cases with the same height must have identical reach.",
 methodLimitation:"A narrow scatter around a line can coexist with individual prediction errors that exceed my five-centimetre tolerance."
};

// The saved source and its editor share the same authored values.
const completionFields={
  ...sourceFields,
  changedSincePlanning:"My expectation of a useful initial setting remained reasonable, but the unused-case errors changed my view of individual accuracy. I concluded that the final target should use a direct reach measurement.",
  permissionStatus:"not-needed",permissionNotes:"My investigation uses only the declared constructed dataset; I have no participant data.",
  dataStatusSummary:"I analysed all 24 cases under the original allocation: 18 development and six validation. I retained every supplied value.",
  dataAimLink:String.raw`My aim asks whether a target can be placed within \(5\text{ cm}\) of the position based on standing reach. I therefore need paired values of height \(H\) and reach \(R\), with both quantities in centimetres. Plotting \(R\) vertically against \(H\) lets me inspect the direction, shape and spread before treating height as a predictor. A coefficient alone would not tell me how many centimetres a proposed target might be wrong.`,
  chosenMethod:"A paired scatter, least-squares regression of R on H, residual and single-case sensitivity checks, followed by reserved-case validation.",
  methodReason:String.raw`I chose a scatter diagram first because my cases contain two numerical quantities. I kept \(H\) on the horizontal axis because it is the value available when I make a prediction. If the plot supports a linear trend, a regression of \(R\) on \(H\) can supply the predicted reach needed for my target rule. I did not begin by selecting a polynomial degree.`,
  firstPurpose:String.raw`I want my first plot to show whether the 18 development cases support a linear prediction across my proposed domain \(155\le H\le190\). I am looking for the overall direction and for departures large enough to make an individual prediction unreliable.`,
  firstMethodEvaluation:"I considered showing a table of reach-to-height ratios, but that would obscure how the pairs are distributed across the range. I also considered a line joining the cases, but there is no time sequence joining one case to the next. A scatter preserves the individual pairs. Its limitation is that a visually tight pattern does not quantify a five-centimetre prediction error; I will need a fitted rule and separate validation.",
  firstMathsBridgePlacement:"before",firstType:"scatter",
  firstDefinitions:String.raw`I use \(H\) for height and \(R\) for the vertical distance from the floor to the fingertips with one arm extended upwards. Both are in cm. The proposed target is \(25\text{ cm}\) above standing reach. My acceptable error is at most \(5\text{ cm}\), including equality.`,
  firstPresentation:"Figure 1 plots the 18 development pairs. The axes are labelled with the quantities and centimetres; a break indicates the truncated height and reach scales.",
  accuracyForResult:"I retain unrounded fitted coefficients for all predictions. Two decimal places in the results describe my arithmetic, not the physical accuracy of a measurement.",
  variableDefinitions:String.raw`\(H\): height (cm); \(R\): standing reach (cm); \(\widehat R\): predicted reach (cm); \(e=R-\widehat R\): prediction error or development residual (cm); \(T\): chosen target setting (cm). I use \(r\), in lower case, only for Pearson's coefficient.`,
  specialistTerms:"Standing reach is the floor-to-fingertip height with one arm extended upwards. A target's extra reach is its height minus standing reach. My five-centimetre tolerance is a design choice for this investigation.",
  modelValidation:"I fixed cases 4, 8, 12, 16, 20 and 24 as validation cases before fitting. I evaluated the development equation once on these six cases without refitting.",
  modelAlternative:"I considered measuring standing reach directly. I did not fit extra curves after seeing the validation errors because that would turn the reserved cases into model-development data.",
  modelDomain:"155≤H≤190 cm; the development set spans 154–192 cm.",
  limitationConsequence:"A high correlation cannot ensure a fair individual target: different reaches at similar heights translate directly into different amounts to reach above standing position.",
  limitationMitigation:"I separated fit from validation, retained every case, and made the final recommendation conditional on the calculated errors.",
  limitationAcceptable:"The data answer my stated design question for these fixed cases. They do not establish a population success rate.",
  accuracyQuantity:"Height H and standing reach R",accuracySymbol:"H, R",accuracyUnit:"cm",
  accuracyResolution:"The supplied table uses integer centimetres; this is a data convention, not a tested instrument resolution.",
  accuracyPolicy:"I calculate with unrounded coefficients, display predictions to 0.01 cm and round apparatus targets to the nearest 5 cm.",
  accuracyReason:"Keeping guard digits prevents rounding from changing the model comparison. I examine apparatus rounding separately because it affects the actual target.",
  pairedDataType:"paired-numerical",
  scatterPattern:"linear",scatterDetail:"rough-linear",scatterAimRelevance:"yes",pmccSignal:"meaningful-linear",
  pmccInterpretation:String.raw`I obtained \(r\approx0.98614\), a strong positive linear association in my development set. It measures how closely the pairs follow a line; it is not the fraction of individual targets that will be accurate.`,
  predictionComparison:"The positive trend matched my initial expectation. The validation errors did not support using height alone for every individual target within ±5 cm.",
  benefitFinding:"A height rule gives an initial estimate, but a direct reach measurement is needed to choose an individual setting under my stated tolerance.",
  technologyTool:"I used the graph generator for scatter and fitted-line figures and a spreadsheet-style calculation for regression, residuals and the 18 single-case refits.",
  technologyInput:"Development cases 1–3, 5–7, 9–11, 13–15, 17–19 and 21–23, with H as predictor and R as response; validation cases were excluded from fitting.",
  technologyOutcome:String.raw`My 18-case fit is \(\widehat R\approx9.78323485+1.25788857H\). The development RMSE is \(2.40368\text{ cm}\), while the reserved-case RMSE is \(5.45906\text{ cm}\).`,
  technologyInterpretation:"I checked the software's fitted coefficients against the centred-sum calculation and checked a reserved-case error by substitution. The difference between fitted and validation RMSE changed my conclusion.",
  courseWhy:"I used correlation and linear regression as the core methods, then algebra and numerical comparisons to connect their outputs to the target decision.",
  courseConcern:"My investigation uses a small constructed dataset, so I have kept claims about practical use conditional rather than presenting a real-population recommendation.",
  mathsLearning:"I initially associated a very high correlation with a reliable individual estimate. The error calculations showed me why a strong overall relationship can still be too inaccurate for a particular decision.",
  notationIssue:"I used upper-case R for reach and lower-case r for correlation throughout. I distinguished exact definitions from rounded outputs with an approximation sign.",
  presentationIssue:"I placed the scatter beside its interpretation, the residual graph beside the diagnostic discussion, and the two six-row decision tables beside their calculations. The complete case table remains in the editable dataset.",
  referencesIssue:"I identified the constructed case table in the source record and figure source notes. I used no external participant data or borrowed images.",
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
  idea:"I want to predict standing reach from height so that I can choose an initial setting for an adjustable basketball drill.",
  aim:"To investigate whether height can predict standing reach accurately enough to set a target 25 cm above reach, within a tolerance of ±5 cm, for the constructed cases with heights between 155 and 190 cm.",
  motivation:"Measuring height is convenient, but the quantity that determines the extra reach needed is standing reach. I want to know whether the convenience of a height rule is worth its prediction error.",
  beneficiaryType:"me",beneficiary:"I would use the result when designing an initial target setting for my proposed drill.",
  intendedUse:"I will compare the target given by my height rule with the target that uses the case's stated standing reach.",
  kind:"statistics",statisticsContext:"Paired numerical",dataSource:"secondary",course:"AA SL",
  prediction:"I expect an approximately positive linear relationship. I predict that height will give a useful starting setting, but I am less certain that every prediction will be within 5 cm.",
  predictionWhy:"Taller cases are likely to have greater reach, while different arm and torso proportions could create differences at similar heights.",
  predictionImplication:"If the errors are small enough, a height rule could provide an individual setting; if they are too large, I would still need a direct reach measurement.",
  courseSuitability:"yes",mathsOutside:"syllabus",
  mathsRevisedWhy:"If a fitted line looks convincing, I will still test predictions because the aim concerns individual accuracy rather than the visual strength of a trend.",
  permissionNeed:"no",permissionDetails:"I will use only the supplied constructed cases. There is no personal information or proposed collection from participants.",
  practicalBlocker:"no",
  firstAction:"I will plot R against H for the development set, keeping the six reserved reaches out of model fitting.",
  firstAccuracy:"I will retain full coefficient precision in calculations and round displayed predictions to 0.01 cm. Final apparatus settings will use 5 cm intervals.",
  teacherNeed:"I would discuss whether my explanation of model checking and the practical error criterion gives the investigation an appropriate scope.",
  teacherQuestion:"Have I made the difference between association, fitted error and individual prediction accuracy clear enough?",
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
  alternativeMethod:"A direct reach measurement would avoid the height-to-reach prediction. I will compare the benefit of that information with the convenience of the height rule.",
  readinessImprovement:"I have recorded the split and error threshold in advance so that I cannot adjust them after seeing a favourable fit."
 },
 completion:completionFields,
 introduction:String.raw`I became interested in the fairness of a basketball reach drill in which each person tries to touch a marker above their head. I use “fair” to mean equal extra reach above standing reach in this model; it does not establish equal effort or jumping difficulty. A single marker height gives different extra reaches to people of different sizes. My first thought was to adjust the marker using height, but the starting point for the movement is standing reach rather than the top of the head. Two people of similar height could therefore need different settings.

My aim is to investigate whether height can predict standing reach accurately enough to set a target \(25\text{ cm}\) above reach, within a tolerance of \(\pm5\text{ cm}\), for heights between \(155\) and \(190\text{ cm}\). I chose the extra \(25\text{ cm}\) as a fixed design condition and \(5\text{ cm}\) as the largest setting error I am willing to accept. These choices make “accurate enough” a question I can answer numerically.

I expect a strong positive relationship between height and reach. However, the variation in body proportions makes me less confident about an individual prediction. My investigation uses the declared set of 24 constructed cases. I can judge my proposed rule on these cases, while its performance for real players would require separate evidence. The distinction that matters to me is whether a convenient initial estimate is also good enough to choose the final setting.`,
 dataNotes:String.raw`I define height as \(H\) and standing reach as \(R\), both in centimetres. Standing reach is the vertical distance from the floor to the fingertips with one arm extended upwards. I keep each pair under its supplied case ID. The integers in the case table are the given values; I do not interpret them as evidence that a measuring instrument is accurate to \(1\text{ cm}\).

Before fitting any model, I allocated cases \(4,8,12,16,20,24\) to a reserved validation set. I used the remaining 18 pairs to develop and check the model. This every-fourth-case allocation gives validation heights from \(158\) to \(189\text{ cm}\), inside the development range of \(154\) to \(192\text{ cm}\). I fixed the allocation rather than choosing cases according to how closely they fitted.

I defined success in advance as \(\lvert R-\widehat R\rvert\le5\text{ cm}\), where \(\widehat R\) is predicted reach. I also specified that an actual marker can be set only at multiples of \(5\text{ cm}\). These are two separate checks: first I will assess the numerical prediction, then the setting that would actually be used. I retained all 24 cases in the working dataset, and used compact figures and result tables in the investigation.`,
 stages:[
  {
   key:"inspect-pairs",title:"Inspect the height–reach relationship",
   bridge:"My target decision needs a prediction of reach from height. I first examined whether the development pairs supported a useful numerical relationship.",
   purpose:String.raw`I plotted the 18 development cases as Figure 1. I used height \(H\) on the horizontal axis because height is the information available when the target is first chosen. I did not include the reserved reaches in this initial assessment.`,
   technique:"Paired scatter and contextual comparison",methodId:"other",kind:"scatter",knowledge:"syllabus",
   observation:"linear",
   observationText:"I see an approximately straight rising band across the 18 development pairs, with no separated group. The nearby heights 162 and 164 cm have reaches 209 and 218 cm, so the general trend still leaves individual variation relevant to my five-centimetre target tolerance.",
   result:String.raw`The development heights run from \(154\) to \(192\text{ cm}\), and reaches from \(202\) to \(252\text{ cm}\). Figure 1 shows a clear rising band without a visible bend or separated group. A straight line therefore seems a reasonable first model over my proposed domain.

The points do not lie exactly on a line. For example, cases 13 and 17 have \((H,R)=(162,209)\) and \((164,218)\). Their heights differ by \(2\text{ cm}\), but their reaches differ by \(9\text{ cm}\). I cannot interpret that pair as a local growth rate: these are different constructed cases. It does show why an overall trend cannot determine every individual reach.

I kept the scatter unconnected because there is no continuous journey from one case to the next. The non-zero axis starts allow me to see the spread clearly; the marked breaks make those truncated scales explicit.`,
   interpretation:"The direction agrees with my prediction, and the approximate shape gives me a reason to calculate a linear model. The nine-centimetre difference between two nearby heights also keeps my original five-centimetre criterion relevant. I need the actual vertical discrepancies, not only a description such as “strong relationship”.",
   limitations:"The development set has only 18 constructed cases. Its appearance does not establish a universal human relationship, and an apparently straight pattern might conceal individual differences that matter for my target.",
   localTakeaway:"A linear prediction is a defensible candidate, but visible case-to-case variation means that its accuracy must be tested.",
   nextQuestion:"What fitted reach does a given height predict, and how strong is the linear association?",
   nextWhy:"The plot suggests a line, while my target formula requires a numerical predicted reach.",
   mathsInsight:"I separated the choice of a plausible model from the later judgement that its errors are small enough.",
   methodChangeReason:"The approximately straight rising band gave me a specific reason to fit a line.",
   outcomeId:"linear"
  },
  {
   key:"fit-reach",title:"Calculate and interpret the regression",
   bridge:"Figure 1 supports a linear candidate. I next needed its equation so that a height could produce a target estimate.",
   purpose:String.raw`I fitted \(\widehat R=a+bH\) by least squares using the 18 development pairs. This minimises the sum of squared vertical discrepancies in reach, which is the quantity my rule must predict. Figure 2 shows the resulting line on the same pairs.`,
   technique:"Pearson correlation and least-squares linear regression",methodId:"linear-regression",kind:"model",knowledge:"syllabus",
   result:String.raw`For the development data I obtained \(\sum H=3125\), \(\sum R=4107\), \(\sum H^2=544857\) and \(\sum HR=715942\). Thus \(\bar H=3125/18\approx173.6111\) and \(\bar R=4107/18\approx228.1667\). I used the centred sums
\[
 S_{HH}=\sum(H_i-\bar H)^2\approx2322.2778,\qquad
 S_{HR}=\sum(H_i-\bar H)(R_i-\bar R)\approx2921.1667.
\]
The gradient and intercept are
\[
 b=\frac{S_{HR}}{S_{HH}}\approx1.25788857,\qquad
 a=\bar R-b\bar H\approx9.78323485.
\]
My fitted rule is therefore
\[
 \widehat R\approx9.78323485+1.25788857H.
\]
Using \(S_{RR}=3778.5\), I also calculated
\[
 r=\frac{S_{HR}}{\sqrt{S_{HH}S_{RR}}}\approx0.986142.
\]
At \(H=175\), my unrounded coefficients give \(\widehat R\approx229.91\text{ cm}\). I used the full coefficients in subsequent calculations; the displayed decimal approximation is not a new rounded model.`,
   interpretation:String.raw`Within this range, an extra centimetre of height corresponds to about \(1.26\text{ cm}\) of predicted reach. I cannot interpret the intercept as the reach of a zero-height person because \(H=0\) is far outside my domain. The coefficient \(r\) shows a strong positive linear association, but it does not say that \(98.6\%\) of my predictions will be accurate. The prediction at \(175\text{ cm}\) gives me an initial target near \(254.91\text{ cm}\), but I have not yet established its reliability.`,
   limitations:"Least squares makes this line perform as well as possible on the development pairs under its squared-error criterion. That fitted performance can be optimistic for cases not used to choose the coefficients.",
   localTakeaway:"The fitted line supplies the prediction I need, but the high correlation does not settle the target-accuracy question.",
   nextQuestion:"Do residuals or a single influential case undermine this fitted rule?",
   nextWhy:"Before using the reserved cases, I want to check whether the line is missing a visible shape or depends heavily on one development pair.",
   mathsInsight:"A regression slope, an intercept and a correlation coefficient answer different questions; I interpreted each in relation to my variables.",
   methodChangeReason:"The fitted equation made its discrepancies calculable, so I could examine the part of each reach that height did not explain.",
   outcomeId:"fits"
  },
  {
   key:"check-development",title:"Check residuals and sensitivity",
   bridge:"The development fit is strong, but I need to know what its numerical success conceals before treating it as a useful rule.",
   purpose:String.raw`I defined the residual \(e_i=R_i-\widehat R_i\). Figure 3 plots these discrepancies against height. I then repeated the fit with each development case omitted in turn, using the omissions only to diagnose sensitivity.`,
   technique:"Residual analysis and one-case-at-a-time regression sensitivity",methodId:"linear-regression",kind:"model",knowledge:"syllabus",
   result:String.raw`The residuals fall on both sides of zero, without a clear curved pattern. Their range is approximately \(-4.56\) to \(3.83\text{ cm}\). For case 13,
\[
 e_{13}=209-(9.78323485+1.25788857\times162)\approx-4.56\text{ cm}.
\]
I obtained a squared-residual sum of about \(103.99785\text{ cm}^2\), giving
\[
 \mathrm{RMSE}_{\mathrm{dev}}
 =\sqrt{\frac{\sum e_i^2}{18}}
 \approx2.40\text{ cm}.
\]
Every development residual meets my five-centimetre criterion. I used division by 18 because I am describing the mean squared prediction discrepancy on these 18 cases, rather than estimating an error variance with a degrees-of-freedom correction.

For the sensitivity check I calculated 18 additional lines. The gradients ranged from about \(1.23216\), with case 13 omitted, to \(1.28582\), with case 9 omitted. Table 1 shows those two extreme-gradient diagnostics alongside the original fit. Across all 18 refits, the largest prediction change anywhere from \(H=155\) to \(190\) was about \(0.765\text{ cm}\). I checked the interval endpoints because the difference between two fitted lines is linear; its greatest absolute value on a closed interval occurs at an endpoint.`,
   interpretation:"The residual plot gives me no clear mathematical reason to add curvature. The single-case check suggests that one development case is not controlling the predictions in my chosen range. I retained all 18 pairs in the final equation. These results justify testing the existing line; they do not establish accuracy on new cases.",
   limitations:"Single-case omission tests the influence of one supplied pair at a time. It does not test a different case population, systematic changes to several values, or the omission of a relevant variable such as arm length.",
   localTakeaway:"The development model is locally stable and fits its own cases within tolerance; its performance on unused cases remains unknown.",
   nextQuestion:"Does the unchanged equation meet my tolerance on the six reserved cases?",
   nextWhy:"A stable fitted line can still give inaccurate predictions, so the original validation set is the next direct test of my aim.",
   mathsInsight:"I checked sensitivity through changes to predicted reach, because unstable-looking coefficients matter only through their effect on the decision.",
   methodChangeReason:"The development diagnostics did not justify changing the model, so I kept it fixed for validation.",
   outcomeId:"fits"
  },
  {
   key:"validate-reach",title:"Test the six reserved predictions",
   bridge:"My development checks were encouraging. I now used the six reaches that had played no part in fitting the line.",
   purpose:"I substituted each reserved height into the unchanged 18-case equation. Table 2 shows every reserved case, its predicted reach and the error R−predicted reach.",
   technique:"Reserved-case prediction errors, RMSE and absolute error",methodId:"linear-regression",kind:"model",knowledge:"syllabus",
   result:String.raw`The result was less successful than the development fit suggested. For case 12, \(H=172\) and \(R=233\), so
\[
 \widehat R_{12}\approx226.14\text{ cm},\qquad
 e_{12}=233-226.1400684\approx6.86\text{ cm}.
\]
Only cases 4 and 16 have \(\lvert e\rvert\le5\text{ cm}\): \(2\) of the \(6\) reserved predictions. The largest absolute error is about \(6.86\text{ cm}\). I summarised all six errors in two ways:
\[
 \mathrm{MAE}=\frac{\sum_{i=1}^{6}|e_i|}{6}\approx5.23\text{ cm},
 \qquad
 \mathrm{RMSE}_{\mathrm{val}}
 =\sqrt{\frac{\sum_{i=1}^{6}e_i^2}{6}}\approx5.46\text{ cm}.
\]
The mean signed error is only about \(-0.037\text{ cm}\). That small mean is misleading if used as an accuracy measure: positive and negative errors nearly cancel. I need the absolute or squared discrepancies because either direction can make my proposed target unfair.`,
   interpretation:"My equation captures the overall association but does not satisfy my individual-accuracy requirement on four reserved cases. The validation RMSE is more than twice the development RMSE. I therefore changed my judgement: the fitted model is useful as an initial estimate, but the evidence here does not support trusting it to set every individual's final target.",
   limitations:"Six reserved cases give a limited diagnostic, and they are constructed rather than randomly sampled. The observed 2/6 success count is a description of these cases, not a prediction that exactly one third of future players would meet the tolerance. I did not use these errors to search for a more flattering curve.",
   localTakeaway:"The reserved-case test weakens the case for an individual height-only setting despite the very high development correlation.",
   nextQuestion:"What happens when the predicted reach becomes an actual target at a five-centimetre setting?",
   nextWhy:"My aim concerns the marker that would be used, so I need to include its rounding rule and assess the resulting extra reach.",
   mathsInsight:"A nearly zero average signed error can coexist with substantial individual errors because opposite errors cancel.",
   methodChangeReason:"The prediction errors changed the proposed use of the model and made the final apparatus setting the relevant quantity to examine.",
   outcomeId:"uncertain"
  },
  {
   key:"choose-target",title:"Translate prediction error into the drill setting",
   bridge:"Height alone did not predict every reserved reach accurately enough. I checked the consequence for the target rather than stopping at an error statistic.",
   purpose:String.raw`I defined the ideal target as \(T^*=R+25\). My height-based apparatus rule rounds the predicted target to the nearest multiple of \(5\text{ cm}\):
\[
 T=5\,\operatorname{round}\!\left(\frac{\widehat R+25}{5}\right).
\]
I compared \(T\) with \(T^*\) for all six reserved cases in Table 3.`,
   technique:"Algebraic error propagation and practical rounding",methodId:"linear-regression",kind:"model",knowledge:"syllabus",
   result:String.raw`The six settings are \(235,240,250,260,270,275\text{ cm}\), in the reserved-case order. Their errors \(T-T^*\) are \(-1,3,-8,4,-5,9\text{ cm}\). Four meet the original \(\pm5\text{ cm}\) criterion, including the boundary value \(-5\).

This improvement from \(2/6\) to \(4/6\) is incidental. Let \(q=T-(\widehat R+25)\) be the rounding adjustment, for which \(|q|\le2.5\). Since \(e=R-\widehat R\),
\[
 T-T^*=-e+q.
\]
Rounding can oppose an existing error or reinforce it. Case 8 changes from a \(5.33\text{ cm}\) overestimate of its ideal unrounded target to a \(3\text{ cm}\) overestimate after rounding, while case 24 worsens from about \(6.52\) to \(9\text{ cm}\). For cases 12 and 24 the actual extra reaches are only \(250-233=17\text{ cm}\) and \(275-241=34\text{ cm}\), rather than my intended \(25\text{ cm}\).

I also considered a hypothetical height-reading error of \(\pm0.5\text{ cm}\), holding the fitted coefficients fixed. Before target rounding this changes predicted reach by
\[
 |\Delta\widehat R|=|b\,\Delta H|\le1.25788857(0.5)\approx0.629\text{ cm}.
\]
That is smaller than the main reserved-case discrepancies. The rounded setting can still jump by \(5\text{ cm}\) near a rounding boundary, so I would not treat \(0.629\text{ cm}\) as a bound on the final marker change.`,
   interpretation:"I would use the height rule to position the marker approximately, then measure standing reach to choose the individual setting. Within my design, rounding the directly measured ideal target R+25 to the nearest 5 cm would introduce at most 2.5 cm of setting error before any measurement uncertainty. That directly addresses the source of the two large failures in Table 3.",
   limitations:"The height-error calculation is a scenario based on an assumed ±0.5 cm input change, not an estimated instrument uncertainty. A direct reach measurement would also need a consistent posture and a checked measurement method in any real use.",
   localTakeaway:"The proposed height rule provides an initial setting, but it cannot replace a direct reach measurement under my individual-error criterion.",
   nextQuestion:"Would adding a second body measurement reduce the prediction error enough to justify the extra measurement?",
   nextWhy:"The remaining discrepancy is variation in reach at a given height. A second relevant measurement could address that source of variation, but would require a new dataset and a fresh validation set.",
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
  mainConclusion:String.raw`For these constructed cases, height alone gave a useful initial reach estimate but did not meet my requirement for every individual target. My development equation was \(\widehat R\approx9.78323+1.25789H\), with \(r\approx0.98614\). Despite that strong association, only \(2/6\) reserved reach predictions were within \(5\text{ cm}\), and their RMSE was about \(5.46\text{ cm}\).

After applying the specified target rule, four of the six rounded settings were within tolerance. The other two were \(8\text{ cm}\) too low and \(9\text{ cm}\) too high, producing extra reaches of \(17\) and \(34\text{ cm}\) instead of \(25\text{ cm}\). I would therefore use the height equation to choose an initial position and use a direct standing-reach measurement for the final individual setting.`,
  conclusionBenefit:"The most consequential limitation is variation in reach at similar heights, rather than a single influential development point: the single-case refits changed predictions by less than 0.77 cm across my domain. I also learned that a small mean signed error can hide substantial individual inaccuracies, and that rounding does not consistently improve them. My original positive-trend prediction was supported, while confidence in precise individual settings was reduced. These conclusions apply to the fixed cases and design conditions; the small reserved set does not establish a population success rate.",
  conclusionExtension:"I would next investigate whether a second measurement, such as arm span, reduces the discrepancy in reach predictions enough to justify measuring it. I would first specify the new model and practical tolerance, then collect or construct a separately justified development set and a fresh validation set. Reusing the six cases that shaped my present conclusion would weaken that new test."
 },
 reviews:[
  {id:"D01",location:"Introduction, five mathematical stages and conclusion",
   note:"My draft contains a defined practical aim, the completed regression, numerical diagnostics, reserved-case validation, six purposeful figures/tables and an answer to the original target-setting question.",
   action:"I will keep school-specific submission checks separate from the mathematical completeness of this draft."},
  {id:"D02",location:"The final paragraph of each stage and the opening paragraph of the next",
   note:"My sequence follows the unresolved question at each point: shape, prediction equation, fitted-model checks, unused-case accuracy and the actual target. The conclusion returns to the original ±5 cm criterion.",
   action:"I retained the same aim and tolerance throughout and removed any need for a separate unrelated technique."},
  {id:"D03",location:"Variable definitions, Figures 1–3 and Tables 1–3",
   note:"I distinguish reach R from correlation r, use e=R−predicted reach consistently, and state the opposite sign convention for target error. Axes and table columns carry centimetres where appropriate, and rounded numerical results use approximation signs.",
   action:"I will recheck those symbols and units if I change a figure or export layout."},
  {id:"D04",location:"Introduction, data allocation, validation and target-setting stage",
   note:"My own decisions shape the investigation: I chose a 25 cm challenge and ±5 cm tolerance, fixed a validation allocation, retained the original fit after diagnostic omissions and changed its proposed use when the errors were too large.",
   action:"I have explained the reasons for those decisions at the point where they affect the mathematics."},
  {id:"D05",location:"Interpretations after regression, sensitivity, validation and target rounding",
   note:"I compare the strong correlation with individual accuracy, explain the nearly cancelling signed errors, and show why rounding helps some cases while worsening another. My recommendation changes because of the calculated errors.",
   action:"I kept the consequential limitations next to the results they restrict and condensed them in the conclusion."},
  {id:"D06",location:"Regression derivation and all error calculations",
   note:"I checked the coefficients from the centred sums, the 18-case residual RMSE, every reserved prediction and the rounded settings. The endpoint argument justifies the sensitivity bound without searching arbitrary points.",
   action:"I will rerun the arithmetic if any supplied value or design condition changes."},
  {id:"D07",status:"checked",location:"Complete reader, PDF and Word document",
   note:"I used short captions and at most six rows in each displayed result table. Each saved figure is placed with the paragraph that introduces or interprets it, and the complete input dataset remains available separately.",
   action:"I checked the exported pages at normal reading size, particularly the two five-column decision tables, and kept the figure labels, captions and mathematical expressions readable."},
  {id:"D09",location:"Source record and dataset reference",
   note:"I have identified Standing Reach Design Cases v1 as constructed data and retained the complete inputs. My figures use that dataset and my calculations; I have not attributed the values to a real study or participants.",
   action:"No external source is used in this draft; I will add a full reference if an extension uses published material."},
  {id:"D11",location:"Regression, residual, validation and target-setting results",
   note:"The draft includes actual equations, a worked residual, a worked reserved prediction, two error summaries and all six rounded target outcomes. The results are completed calculations rather than a list of planned methods.",
   action:"I checked that the conclusion quotes the reserved-case results, not only the development fit."},
  {id:"D19",location:"Figure 1 and Tables 1–3; editable working datasets",
   note:"I show every reserved case in the main argument because all six determine the accuracy judgement. Table 1 shows the explicitly identified extreme-gradient diagnostics, with all 18 sensitivity calculations retained in the working dataset.",
   action:"I kept the full source data accessible without inserting a long raw-data table into the narrative."},
  {id:"D20",location:"Regression calculation and sensitivity analysis",
   note:"I state the input allocation, reproduce the regression from numerical sums and explain why endpoint comparisons cover the whole sensitivity interval. I interpret the software outputs in centimetres and check a prediction by substitution.",
   action:"I retained the editable generator drafts and complete calculation inputs so the numerical outputs can be reproduced."}
 ],
 references:[
  {label:"Data record",value:"Standing Reach Design Cases v1. Original constructed 24-case teaching dataset supplied with this illustrative project. The complete paired values and fixed development/validation allocation are retained in the editable dataset."},
  {label:"Calculation record",value:"Single-case sensitivity calculations, version 1. My 18 refits of the stated development dataset, retained with the project. All graphs and tables in the investigation are generated from these inputs."}
 ]
};
