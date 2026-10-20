/**
 * Current (October 2026) teaching samples: figures, A–E checks and IA-sized
 * student-facing explanations. These are fictional *working demonstrations*,
 * never teacher-graded or ready-to-submit student IAs.
 *
 * The earlier factory establishes the mathematically verified numerical/proof
 * spine. This module enriches the SAME five samples with the current, active
 * path (Plan -> Write -> Checking) and authored generator figures.
 */
import {newGraphDraft,analyseGraph} from '../diagrams/graph-core.js';
import {newTableDraft,analyzeTable} from '../diagrams/table-studio-core.js';
import {journeyOutcomeOptions,journeySourceSignature,outcomeRouteForEntry} from '../completing/adaptive-journey.js';
import {reviewChecksFor} from '../completing/review.js';
import {CHECKING_DETAILS} from '../checking/checklist.js';

const pf=x=>String(x??'').trim();
const notes=(...sections)=>sections.filter(Boolean).join('\n\n');
const n=(v,decimals=2)=>Number(v).toFixed(decimals);
const sleepHours=[4,5,6,7,8,9];
const subjects={
 linear:{
  title:'How accurately can a straight-line model represent this constructed relationship?',
  route:'relationships',initial:'linear',middle:'linear',final:'fits',
  intro:'The important question in this example is whether a relationship that looks straight can support a defensible numerical interpretation. A downward plot is an observation about a set of pairs; a coefficient then measures the strength of their linear association; a fitted equation finally allows a rate of change and residuals to be examined. These are three different mathematical questions, not three compulsory techniques.',
  stage1:'The plotted values fall steadily as x rises in one-hour intervals. The vertical range is visibly large compared with the small departures from a descending straight line. This is useful preliminary evidence of a linear association, but the eye alone cannot specify its numerical strength. A scatter diagram is preferable to connecting the observations, because the horizontal values are paired cases, not repeated measurements of a continuously tracked individual.',
  stage2:'The sign of r must be negative because the data descend. Before computing it I identify x and y as paired variables and examine the cloud for curvature or one unusually influential point. A coefficient near −1 describes how strongly the centred values line up on a negative linear trend. It does not imply that one extra hour of sleep caused a particular change in reaction time. Its scale is unitless; the meaningful change in milliseconds per hour requires a fitted equation instead.',
  stage3:'For a line ŷ=a+bx, the least-squares gradient is b=Sxy/Sxx and the intercept is a=ȳ−b x̄. A residual is observed y minus predicted ŷ; its sign says whether the line overestimated or underestimated that constructed observation. The root-mean-square residual measures a typical discrepancy in milliseconds and should be assessed alongside the graph, rather than replacing visual interpretation. The regression parameters describe these deliberately neat six pairs and not an independently verified physical relationship.',
  implication:'For this artificially tidy table, the negative linear relationship is exceptionally strong, and a straight line describes the chosen range well. The gradient is a mathematical rate in milliseconds per additional hour in the constructed pairs. There is no uncertainty estimate for a real population, however, and no study design that would license interpreting the gradient as a causal effect. The method works as a demonstration of how scatter, PMCC, a fitted line and residuals should be connected.',
  limits:'The data were chosen to align almost perfectly with a line. In a real observational study participants would differ in other ways and the interpretation would require a meaningful population, measurement procedure, instrument details, and an ethical design. Even if a real r were similarly high, correlation would not establish causation. Extrapolating to implausibly short or long sleep durations would be particularly unjustified because neither the model nor its empirical validity has been tested there.',
  future:'A worthwhile next investigation would use a properly documented and ethically collected or published dataset and test whether residuals remain small across a broader but still justified domain. If the real pattern bends, the next step should be an explicit comparison with a plausible alternative, not the automatic addition of a more complicated polynomial.'
 },
 curved:{
  title:'How should a model change when residuals expose a curve?',
  route:'fitted-models',initial:'systematic',middle:'systematic',final:'multiplicative',
  intro:'This example begins with a decreasing pattern that visibly becomes less steep. There is a temptation to summarise the data using one impressive-looking correlation coefficient, but that number addresses linear association, not whether a straight line represents the changing rate properly. The better question is what the deviations from a proposed line reveal, and whether an alternative function has a mathematical reason to be considered.',
  stage1:'The consecutive drops are 48, 29, 17, 10 and 7 milliseconds. Because the x-values rise by exactly one hour each time, these differences can be compared directly; their magnitudes decrease markedly. A constant-gradient line would predict approximately equal changes for equal increments of x, which these constructed points do not exhibit. The first plot therefore motivates a diagnostic model comparison rather than a declaration that a particular curve must be correct.',
  stage2:'A large absolute correlation coefficient may coexist with a visibly inappropriate linear model. After calculating the least-squares line, take each observed y and subtract its predicted value. Across increasing x, a positive–negative–positive residual sequence is systematic rather than random-looking scatter about zero. This shows the line is missing a shape feature: fitting a different function may be worthwhile, provided the new structure reflects a meaningful assumption and the same range is used for a fair comparison.',
  stage3:'One candidate for a decreasing curve that flattens is y=250+A·b^(x−4), with 0<b<1. Here 250 milliseconds is explicitly an ASSUMED baseline, not a limit demonstrated by the source. Subtracting 250 gives z=y−250>0; taking logarithms gives ln(z)=ln(A)+(x−4)ln(b), a straight-line relationship in transformed coordinates. The fitted values and RMSE can be compared with the linear model using the same six pairs, but a smaller fitting error cannot verify that the baseline is physiological or correct.',
  implication:'For the six invented pairs, a baseline-adjusted exponential form captures the diminishing differences and yields smaller residuals than the line. The comparison answers the mathematical question about structure: the linear model lacks curvature that matters for interpolation within this dataset. It does not show that human reaction time approaches 250 milliseconds, that the decay parameter persists outside this range, or that sleep changes response time in the way described.',
  limits:'The apparent lower bound was chosen to make the algebra illustrative. Its value strongly influences the transformed values ln(y−250), particularly when y gets close to 250. Different plausible baselines would produce different coefficients and potentially different predictions. The independent x-values are hours but are not actual observed people; no measurement uncertainty, sampling bias or external validity can be estimated. A model-comparison exercise cannot correct those missing empirical foundations.',
  future:'The mathematically meaningful extension is sensitivity to the assumed baseline: choose a few defensible candidate baseline values, refit on identical data, compare residual behaviour, and explain when the logarithmic transformation ceases to be valid. With a genuine data source, ask whether a saturation model is supported by the wider observed domain.'
 },
 unclear:{
  title:'What can we conclude when a proposed linear relationship is weak?',
  route:'relationships',initial:'none',middle:'none',final:'uncertain',
  intro:'An IA exploration should not be forced to confirm its opening prediction. This constructed example was designed to show how a mathematically useful conclusion can be negative or inconclusive. The first question is whether a direction or shape is convincing on a scatter diagram. A coefficient then quantifies one particular type of relationship, and a simple descriptive comparison asks whether a decision to stop modelling is reasonable.',
  stage1:'The six points rise and fall across the horizontal range without a persuasive upward or downward alignment. Because the values vary on both sides of an imagined flat trend, there is no immediate visual reason to prefer a predictive straight line. This is not evidence that x and y are independent: many different patterns, including curves and subgroups, could escape a single line, and the sample contains only six fabricated cases.',
  stage2:'Pearson’s r uses the centred products (xi−x̄)(yi−ȳ) and normalises by the two sums of squared deviations. The signs of these products compete, leading to a coefficient near zero. This statement is deliberately narrow: it means weak LINEAR association in this constructed set. It neither proves a complete absence of relationship nor establishes statistical independence. Computing a best-fit line only for diagnostics helps show why its explanatory value is tiny.',
  stage3:'A transparent descriptive comparison divides the six ordered x-values into two stated groups, x=4–6 and x=7–9, and calculates an average y for each. The grouping is chosen explicitly; it is not a randomised experiment, nor an inferential significance test. A difference between such tiny groups must be interpreted against the large fluctuations in individual values. Finding a small average difference is grounds for a cautious conclusion, not for inventing an additional technique.',
  implication:'The predicted strong downward trend is not supported by this particular fabricated table. That conclusion is the outcome of a complete mathematical pathway: visual examination, a targeted measure of linear association, and an appropriately modest descriptive follow-up. The investigation can stop here without fitting an arbitrary high-degree polynomial or claiming that the absence of a convincing trend is a universal fact about reaction time.',
  limits:'Only six simulated observations were used, and they were chosen to illustrate uncertainty. Their group assignments are artificial; neither a population nor an uncertainty model is defined. In a real investigation, a weak observed coefficient might arise from sample size, uncontrolled variables, nonlinearity, or measurement noise. The numerical outcome here cannot distinguish among those explanations. That limitation reduces the strength of the conclusion but does not make the calculations pointless.',
  future:'If a genuine well-documented dataset were available, a useful next question would test whether the weak linear conclusion is stable across larger samples and whether any alternative shape was actually motivated by the plotted values. The strongest next action might be to redesign data collection, not to perform another formula.'
 },
 unexpected:{
  title:'How much can one unusual observation change a regression?',
  route:'relationships',initial:'groups',middle:'groups',final:'systematic',
  intro:'An unusual point is not necessarily an error. This example treats an invented observation that does not fit the trend of its neighbours as a mathematical question about model sensitivity, rather than as an inconvenience to be deleted. All six pairs belong to the main analysis. A second five-point calculation is clearly labelled diagnostic: it shows what is influenced by the unusual pair without changing which evidence is reported.',
  stage1:'Most of the plotted points follow a downward trend, but the value at x=7 hours sits well above the others. Reading that location from a labelled scatter plot comes before any decision to use correlation or regression. It is especially important not to connect the points as though they form a continuous trace. The observation is influential because it occupies the centre of the x-range while being far above a line through its neighbours.',
  stage2:'Calculate Pearson’s r and a least-squares line using all six values. The residual at x=7 is large and positive: the observed synthetic y-value exceeds the value predicted by the fitted line. Because least squares minimises squared residuals, a large departure can affect both the slope and the intercept. The full-data r therefore reflects the influence of all points, including the one that contradicts the simple trend.',
  stage3:'Repeat the regression once with the point at x=7 excluded, but label the result “sensitivity analysis only”. Compare both gradients, both coefficients and the prediction at x=7. This does not establish that the five-point model is the correct model; it only measures how much the conclusions change under a deliberately altered dataset. With no independent reason to label the observation erroneous, the full-six-point analysis remains the substantive answer.',
  implication:'The unusual invented value changes the apparent strength and prediction of the regression markedly. Reporting both fits transparently teaches a valuable mathematical lesson: a single influential point can alter a coefficient, and the presence of that point must be acknowledged in the interpretation. This is a statement about these numbers, not a claim about genuine participants, measurement mistakes or real effects of sleep.',
  limits:'A real outlier might arise from a measurement error, an unusual but genuine case, changing conditions or a different process. This teaching sample has no experiment log or source documentation capable of separating those possibilities. Simply comparing with and without the observation cannot justify excluding it. Six constructed points are too few to support broad generalisation, and results outside 4–9 hours have no demonstrated meaning.',
  future:'A defensible next investigation would seek repeated readings or independently recorded contextual information for unusually high observations, then assess whether a revised model is warranted. The central lesson is to test sensitivity and explain decisions rather than make inconvenient evidence disappear.'
 },
 theory:{
  title:'Why are sums of consecutive cubes triangular squares?',
  route:'proof',initial:'pattern',middle:'proof',final:'uncertain',
  intro:'The initial observation is a number pattern: the first few sums of cubes coincide with perfect squares. The investigation becomes mathematically meaningful only when it asks WHY the pattern continues. I will define the terms, explore small cases, form a precise conjecture, then prove the relationship for every positive integer. The final stage follows naturally from the proven result by extending it to sums over a general integer interval.',
  stage1:'For n=1,2,3,4, calculate Sn=1³+2³+⋯+n³ and Tn=n(n+1)/2. The displayed table reveals Sn=Tn² in every tested case. A finite set of correct calculations does not prove a universal statement: many false conjectures agree with their first four examples. The table is therefore a device for noticing and defining a pattern, not a substitute for general algebraic reasoning.',
  stage2:'Write Tn=n(n+1)/2 and T(n−1)=n(n−1)/2. Factoring the difference of the squares gives Tn²−T(n−1)²=[n²/4][(n+1)²−(n−1)²]=[n²/4](4n)=n³. Now add that equality for k=1,2,…,n. Each intermediate T(k)² occurs once with a plus sign and once with a minus sign, so all interior terms cancel, leaving Sn=Tn²−T0²=Tn² because T0=0. This is a proof for all positive integers n: no extra numerical cases are needed to extend its validity.',
  stage3:'The established formula can be used to sum cubes over any interval of consecutive integers with 1≤m≤n. Subtract the sum up to m−1 from the sum up to n: Σ(k³,k=m…n)=Tn²−T(m−1)². This follows from cancellation of common prefix terms, not from a fresh guess. The example m=3,n=5 gives 27+64+125=216, while T5²−T2²=225−9=216. Once the identity has been proved, this worked case checks the arithmetic of the application, not the proof itself.',
  implication:'The proof resolves the original conjecture in its stated domain. The surprising numerical squares are explained by a telescoping difference: each cube is exactly the increase between consecutive squared triangular numbers. The interval formula is an extension with a clear mathematical purpose, because it makes a new class of sums immediate. The work is coherent without introducing advanced terminology merely to seem difficult.',
  limits:'The algebra relies on integer indexing, the definition of a finite sum, and 1≤m≤n for the interval result. It has not proved anything about arbitrary non-integer summation limits. Four initial examples could not have established the identity, although they were useful for choosing an approach. The mathematical validity of the proof can be checked line by line; its suitability and depth as a real AA HL IA still require teacher discussion.',
  future:'A genuine next mathematical question is whether adjacent differences of another polynomial sequence could yield sums of fourth powers, and what new degree of polynomial would be required. Such an investigation would need its own derivation and should be undertaken only if it serves a revised aim and appropriate course scope.'
 }
};

const asWords=s=>pf(s).split(/\s+/).filter(Boolean).length;
const simulatedLabel='All values in these figures are deliberately fabricated for teaching; none are observations of real people.';
function entryText(s,kind){
 const x=subjects[kind],theory=kind==='theory';
 const unit=theory?'exact integer sums':'synthetic data in hours and milliseconds';
 const [first,second,third]=s.entries;
 for(const [i,paragraph] of [x.stage1,x.stage2,x.stage3].entries()){
  const entry=s.entries[i];
  entry.purpose=notes(entry.purpose,i===0?
   (theory?'The first table places exact sums next to the candidate square expression. Its role is exploratory, not evidential proof.':
    'Figure 1 places the six paired values on a labelled scatter plot; nothing is connected or fitted automatically.'):i===1?
   (theory?'The table checks the consecutive-difference structure numerically while the symbolic derivation establishes it for all relevant n.':
    'Figure 2 shows residuals from the whole-six-point least-squares line. The figure must be read with the equation and axes.'):
   (theory?'The interval examples make the derived identity usable and show exactly how to substitute limits.':
    'Table 1 reports the values needed for a numerical comparison, with units and the method stated in the nearby writing.'));
  // The result field is the work, not another summary of the entire investigation.
  entry.result=notes(entry.result,paragraph);
  entry.interpretation=notes(entry.interpretation,[
   i===0?'This first result only supports a *choice* of mathematical question. It does not prove that the next planned calculation is warranted until the observed shape has been interpreted.':
   i===1?'I use the calculation to examine the specific uncertainty left by the previous result. It is not a formula inserted only because the software can calculate it.':
   'The final stage is selected because it answers the unresolved question raised by the prior stage; a logical conclusion could now follow without any further compulsory calculation.',
   (theory?'Exact algebra does not rely on a measurement instrument or fitted error statistic.':
    'The mathematical conclusion is restricted to the fabricated pairs, so its limitation is one of empirical provenance and external validity, not merely arithmetic precision.')
  ]);
  entry.limitations=notes(entry.limitations,[
   'A strong mathematical justification should name the assumption or domain that would invalidate the claim, rather than offer a generic sentence about “human error”.',
   theory?'Check integer restrictions, notation and the logical distinction between a special case and a universal proof.':
    'No physical resolution, participant selection method or population can be estimated from fictional points; integer displays are formatting choices, not instrument accuracy.'
  ]);
  entry.nextWhy=notes(entry.nextWhy,
   'This follows from the observed '+unit+' and the explicit aim, not from a preset itinerary. A new stage would be skipped if the conclusion were already sufficiently established.');
  entry.mathsInsight=notes(entry.mathsInsight,
   i===0?'The displayed representation is evidence about structure; explain the pattern before selecting another technique.':
    i===1?'Show the actual method, not just the calculator answer; identify the meaning and any domain restrictions.':
    'Compare what the final calculation establishes with the aim, the assumptions and possible alternative interpretations.');
  entry.methodChangeReason=i===0?'Starting with the simplest informative representation avoids prematurely fitting a model.':
   i===1?'The preceding result determined whether this method could resolve a meaningful question.':
   'The earlier calculation identified the precise feature investigated here, so this is a reasoned development.';
  entry.reviewNeeded='';entry.reviewReason='';entry.reviewCheckedAt='';
  if(i>0)entry.journeyDirection='follow';
 }
 first.priorLearningOnly='no';second.priorLearningOnly='no';third.priorLearningOnly='no';
 // Course boundaries are not automatically inferred from method difficulty.
 if(theory){second.knowledge='mixed';second.researchSource=second.researchSource||'Student-created derivation within this fictional learning example.';}
}
function arrangeCurrentJourney(s,kind){
 const x=subjects[kind],steps=s.entries;
 const picked=kind==='theory'?['pattern','proof','uncertain']:
  kind==='curved'?['systematic','systematic','multiplicative']:
  kind==='linear'?['linear','linear','fits']:
  kind==='unclear'?['none','none','uncertain']:['groups','groups','systematic'];
 for(let i=0;i<steps.length;i++){
  const t=steps[i],route=outcomeRouteForEntry(s,t),choices=journeyOutcomeOptions(s,t);
  const match=choices.find(v=>v.id===picked[i])||choices.find(v=>v.id==='uncertain')||choices[0];
  t.journeyRouteId=route?.id||'';
  t.journeyOutcome=match?.value||'';
  if(i>0){t.journeySourceOutcome=steps[i-1].journeyOutcome;
   t.journeySourceSignature=journeySourceSignature(s,steps[i-1]);}
 }
}
function addFigure(s,kind,entryIndex,type,draft){
 const store=type==='graph'?s.graphStudio:s.tableStudio;
 const id=(type==='graph'?'figure-':'table-')+'sample-'+kind+'-'+(entryIndex+1);
 const record={id,entryId:s.entries[entryIndex].id,savedAt:'FICTIONAL teaching example; no verified collection',draft};
 store.figures.push(record);
 store.activeId=id;store.draft=JSON.parse(JSON.stringify(draft));
 s.entries[entryIndex][type==='graph'?'graphFigureId':'tableFigureId']=id;
 return record;
}
function graph(s,kind,entryIndex,{title,columns,rows,yLabel,yUnit,caption,figureNumber,zero=false}){
 const d=newGraphDraft();
 const data=rows.map(row=>row.map(String));
 Object.assign(d,{
  kind:'scatter',raw:[columns.join('\t'),...data.map(row=>row.join('\t'))].join('\n'),
  columns,matrix:data,title,figureNumber:String(figureNumber),
  xLabel:'Sleep duration',xUnit:'h',xUnitMode:'unit',
  yLabel,yUnit,yUnitMode:yUnit?'unit':'dimensionless',
  sourceKind:'secondary',sourceText:'Synthetic teaching values generated for Pathfinder; no real published dataset, survey or participants.',
  caption,showPoints:true,showGrid:true,includeZeroY:zero
 });
 const check=analyseGraph(d);
 if(!check.ready)throw new Error('Illustrative graph invalid: '+JSON.stringify({kind,problems:check.problems}));
 return addFigure(s,kind,entryIndex,'graph',d);
}
function table(s,kind,entryIndex,{title,columns,rows,units,number,notice}){
 const d=newTableDraft();
 const matrix=rows.map(row=>row.map(String));
 Object.assign(d,{
  mode:'compact',raw:[columns.join('\t'),...matrix.map(row=>row.join('\t'))].join('\n'),
  headers:'yes',columns,matrix,headings:columns,number:String(number),
  unitDecisions:columns.map((_,i)=>({mode:units[i]?'unit':'dimensionless',unit:units[i]||''})),
  title,purpose:'Show the decisive numerical values compactly and with meaningful units.',
  sourceKind:'primary',sourceText:'Student-style calculations using explicitly synthetic data; not externally measured.',
  note:notice||'Constructed teaching values only. No claims about real observations.',
  numberFormat:'source',showRowLines:true
 });
 const analysis=analyzeTable(d);
 if(!analysis.ready)throw new Error('Illustrative table invalid: '+JSON.stringify({kind,title,problems:analysis.problems}));
 return addFigure(s,kind,entryIndex,'table',d);
}
function buildFigures(s,kind,{lineSummary,exponentialSummary}){
 const exact=kind==='theory';
 if(exact){
  table(s,kind,0,{
   title:'Small cube sums compared with triangular squares',columns:['n','Sum of cubes','Triangular square'],
   rows:[[1,1,1],[2,9,9],[3,36,36],[4,100,100]],
   units:['','',''],number:1,notice:'Exact integer arithmetic; agreement in four examples is not a proof.'
  });
  table(s,kind,1,{
   title:'Consecutive triangular squares have cube differences',
   columns:['k','Previous square','Current square','Difference'],
   rows:[[1,0,1,1],[2,1,9,8],[3,9,36,27],[4,36,100,64],[5,100,225,125]],
   units:['','','',''],number:2,notice:'The table illustrates a difference identity proved symbolically in the surrounding mathematics.'
  });
  table(s,kind,2,{
   title:'Illustrations of the derived interval-sum identity',
   columns:['Lower bound m','Upper bound n','Direct sum','Derived formula'],
   rows:[[1,3,36,36],[2,4,99,99],[3,5,216,216]],
   units:['','','',''],number:3,notice:'The interval identity is proved from the prefix formula; these rows check applications.'
  });
  return;
 }
 const y=kind==='linear'?[352,329,307,283,260,238]:
  kind==='curved'?[370,322,293,276,266,259]:
  kind==='unclear'?[300,270,335,285,320,290]:
  [354,329,307,390,260,243];
 const fit=lineSummary(sleepHours,y),pred=x=>fit.slope*x+fit.intercept;
 graph(s,kind,0,{
  title:'Six constructed sleep-duration and reaction-time pairs',columns:['Sleep duration (h)','Simulated response (ms)'],
  rows:sleepHours.map((x,i)=>[x,y[i]]),yLabel:'Simulated reaction time',yUnit:'ms',figureNumber:1,
  caption:simulatedLabel+' Scatter points are deliberately not joined or automatically fitted.'
 });
 graph(s,kind,1,{
  title:'Deviations from the full-data least-squares line',columns:['Sleep duration (h)','Residual (ms)'],
  rows:sleepHours.map((x,i)=>[x,Number((y[i]-pred(x)).toFixed(4))]),
  yLabel:'Observed minus fitted value',yUnit:'ms',figureNumber:2,
  caption:'Residuals for the LINEAR model using all six fictional pairs. A pattern in residuals challenges this line, not the raw observations.'
 });
 let rows,columns,units,notice;
 if(kind==='linear'){
  columns=['Sleep duration','Simulated response','Line prediction','Residual'];units=['h','ms','ms','ms'];
  rows=sleepHours.map((x,i)=>[x,y[i],n(pred(x),2),n(y[i]-pred(x),2)]);
  notice='All six invented pairs retained; predicted values are rounded after fitting using unrounded coefficients.';
 }else if(kind==='curved'){
  const exp=exponentialSummary(y),curve=x=>250+exp.scale*Math.pow(exp.factor,x-4);
  columns=['Sleep duration','Simulated response','Line residual','Decay residual'];
  units=['h','ms','ms','ms'];
  rows=sleepHours.map((x,i)=>[x,y[i],n(y[i]-pred(x),2),n(y[i]-curve(x),2)]);
  notice='Same six fictional points for both models; 250 ms baseline is an explicit assumption, not a measured physiological limit.';
 }else if(kind==='unclear'){
  const a=y.slice(0,3),b=y.slice(3);
  columns=['Hours group','Count','Mean response','Range'];
  units=['','','ms','ms'];
  rows=[['4–6',a.length,n(a.reduce((v,w)=>v+w,0)/3,2),Math.max(...a)-Math.min(...a)],
   ['7–9',b.length,n(b.reduce((v,w)=>v+w,0)/3,2),Math.max(...b)-Math.min(...b)]];
  notice='Groups have three invented pairs each; these are descriptive means and ranges, not inferential tests.';
 }else{
  const xo=sleepHours.filter(x=>x!==7),yo=y.filter((_,i)=>sleepHours[i]!==7),sub=lineSummary(xo,yo);
  columns=['Model','Pairs used','Correlation r','Gradient'];units=['','','','ms/h'];
  rows=[['Full data',6,n(fit.r,5),n(fit.slope,2)],['Sensitivity only',5,n(sub.r,5),n(sub.slope,2)]];
  notice='Five-point line is a DIAGNOSTIC only. No independent reason exists to remove the unusual pair from the reported data.';
 }
 table(s,kind,2,{
  title:kind==='curved'?'Comparison of line and baseline-decay residuals':
   kind==='unclear'?'Descriptive group summary without inferential claims':
   kind==='unexpected'?'Full-data fit versus an outlier sensitivity check':
   'Fitted values and residuals on the six synthetic pairs',
  columns,rows,units,number:1,notice
 });
}
function updatePlanning(s,kind){
 const x=subjects[kind],p=s.planning.fields,theory=kind==='theory';
 Object.assign(p,{
  provisionalTitle:'ILLUSTRATIVE ONLY · '+x.title,
  ideaSelected:'The question is narrow enough to answer by a meaningful mathematical sequence, with clear limits.',
  ideaAccess:theory?'Exact mathematical definitions and algebra; no participants or datasets':
   'Six invented pairs available only for teaching; a genuine IA would first secure a traceable source.',
  ideaValue:'The value is in the mathematical argument and decisions, not a predetermined impressive result.',
  otherIdea1:theory?'Could the differences between adjacent square numbers reveal an identity?':
   'Could a plot or two-way table expose a different relationship? Only if data definitions justify it.',
  otherIdea2:theory?'Would a general algebraic relation emerge from n=1,2,3,4?':
   'Could a genuine dataset offer greater validity than these illustrative values?',
  mathsRevisedWhy:'After the first result, use only the next technique justified by the observed mathematical structure.',
  predictionPrior:theory?'This is initially a conjecture inferred from examples, not a proved theorem.':
   'The proposed shape is an expectation about constructed data, not a known empirical conclusion.',
  pilotReady:theory?'No pilot data collection is needed; check small exact examples.':
   'Only a teaching simulation is ready; no real data-collection pilot has been authorised.',
  costIssue:theory?'None beyond algebraic work and time to verify the proof.':
   'No participants or expenditure: generated teaching observations only.',
  practicalBlocker:theory?'no':'yes',
  permissionDetails:theory?'Pure mathematics only; no personal data or access permissions.':
   'No personal data used here. Do not infer school consent for a new study.',
  figurePurpose:theory?'Use labelled numerical tables to discover, prove and apply a pattern.':
   'Inspect a clear scatter, show whole-data residuals, and present one compact result table.',
  teacherExtra:'Ask whether the mathematical argument answers the aim without adding unnecessary techniques.',
  teacherSchedule:'Discuss course suitability at the next agreed checkpoint; no meeting date has been invented.',
  universalTeacherQuestion:'What mathematical question should I clarify before starting a further stage?',
  milestoneAdjustment:'These are sample planning dates, not school deadlines. Adjust the timeline to actual teacher instructions.'
 });
 if(!theory){
  Object.assign(p,{
   secondarySamplingOrigin:'None — synthetic instructional pairs, not a sample from a defined population.',
   secondaryAccuracyQuantity:'Simulated response-time labels',
   secondaryAccuracyUnit:'ms',
   secondaryAccuracyResolution:'Whole-number ms shown for presentation only',
   secondaryAccuracyBasis:'rounded',
   secondaryAccuracyUncertainty:'Not measurable: no instrument, participants or empirical uncertainty.',
   secondaryUrl:'', // no fake publisher link
   primarySamplingMethod:'',primarySamplingFrame:'',primarySampling:''
  });
  s.planning.accuracyPlans=[{
   id:'pa-secondary-1',source:'secondary',quantity:'Simulated response-time labels',
   unit:'ms',resolution:'Display increment of 1 ms only',basis:'rounded',
   uncertainty:'No real measurement uncertainty can be inferred from fabricated values.'
  }];
 } else {
  s.planning.accuracyPlans=[];s.planning.primaryQuantities=[];
 }
 s.planning.routeExplorer={
  mode:'routes',family:theory?'reasoning':kind==='curved'?'models':'data',
  selectedRoute:x.route,openRoute:x.route,
  firstStep:theory?'Test exact numerical cases':'Inspect the actual paired plot before fitting',
  status:'provisional'
 };
 // Current planning snapshots and current source types; never reopen retired tasks.
 s.planning.visited=['N00','N01','N01V','N02','N03','N01P','N03D','N04','N06','N07'];
 s.planning.sourceBranches={primary:false,secondary:!theory};
}
function currentWriting(s,kind){
 const x=subjects[kind],theory=kind==='theory',f=s.completion.fields;
 const aim=s.planning.fields.aim;
 s.scratch.introduction=notes(
  'FICTIONAL TEACHING EXAMPLE — NOT A SUBMITTABLE MATHEMATICS IA.',
  'Aim: '+aim,
  'I began with a question I could address by doing mathematics, rather than with a list of syllabus techniques. '+x.intro,
  theory?
   'The objects of study are exact positive-integer cube sums and triangular numbers. I define Tₙ=n(n+1)/2 with n a non-negative integer where T₀=0, and consider a general positive-integer n for the proposed identity. An initial table of cases will be used to find an appropriate conjecture; only a symbolic argument can establish a result for every integer in the domain.':
   'The x-coordinates represent invented sleep durations of 4 to 9 hours and the y-coordinates invented reaction times in milliseconds. They are intentionally constructed, not observations of any participant. No health inference, causal statement, sampling claim or measurement-accuracy estimate follows from them. I will keep the full six pairs visible, label both axes with units and inspect the graph before deciding which mathematical question follows.',
  'The route may branch: '+s.entries[0].nextQuestion+' The next stage will therefore have to earn its place by answering something the previous result left unresolved. I want the reader to see what led to my decision and what each calculation changes in my understanding.'
 );
 s.scratch.dataNotes=notes(
  theory?
   'FIRST MATHEMATICS — EXACT DEFINITIONS. The main numerical objects are the partial cube sum Sₙ=Σ(k³,k=1…n) and triangular number Tₙ=n(n+1)/2. Table 1 lists the first four exact values. This is mathematical exploration, not a sample or measurement.':
   'FIRST MATHEMATICS — SOURCE AND PLOT. Figure 1 shows all six teaching pairs with labelled axes, readable scale and explicit units. The points were generated for Pathfinder, and no external article, participant, survey or measuring instrument is represented.',
  'Why this representation? '+s.entries[0].purpose,
  'Before interpreting a coefficient or fitting a curve I identify the mathematical structure visible in the representation. '+x.stage1,
  'Limitations are considered at the point where they matter. '+(theory?
   'A small exact table can suggest a formula, but the next stage must prove it.':
   'Whole-number output is not proof of 1 ms physical precision; all estimates come from constructed values.')
 );
 Object.assign(f,{
  firstMathsBridgePlacement:'before',
  dataAimLink:notes('The first mathematical representation is chosen to answer one narrow part of the aim: '+x.stage1.slice(0,350),
   'The introduction sets the purpose. Here I explain only what the reader should look for in the first figure or table and why it allows a useful mathematical decision.'),
  methodAim:'The chosen method follows from the most recently established result and targets '+aim,
  firstMethodEvaluation:notes('I considered whether the first representation would make the main relationship visible. A more complicated calculation is not initially justified.', x.limits.slice(0,320)),
  firstOutputIntroduction:s.entries[0].purpose,
  firstWorkTitle:s.entries[0].title,
  firstWorkResult:s.entries[0].result.slice(0,950),
  firstWorkLocation:theory?'Table 1 and the first proof discussion':'Figure 1 and the first exploratory paragraph',
  firstWorkStatus:'completed',
  firstType:theory?'theory':'scatter',
  firstObservedFeature:s.entries[0].observationText,
  firstResultSummary:s.entries[0].result.slice(0,1200),
  firstInterpretation:s.entries[0].interpretation,
  dataAimLink:notes('The representation isolates a mathematical question from the aim; it is not a forecast of results.',x.stage1.slice(0,420)),
  mainConclusion:notes(
   'FICTIONAL EXAMPLE: '+x.implication,
   'The two decisive later mathematical steps were: '+s.entries[1].title+' and '+s.entries[2].title+
    '. I refer the reader to the worked equations and figures for the exact calculation, rather than repeating every number in the final paragraph.'
  ),
  conclusionBenefit:notes('Meaning and restrictions. '+x.limits,
   theory?'The proof is exact within the integer domain stated in the argument. A study of a different domain would need different definitions or reasoning.':
    'All plotted points are fictional, so even perfect arithmetic cannot transform them into evidence about real people. Any claimed relationship is internal to the constructed set.'),
  conclusionExtension:x.future,
  conclusionEvidence:'',conclusionUncertainty:'',conclusionAdvice:'',conclusionFocus:'',
  finalCriteria:'',finalProofread:'',finalRequirements:'',
  draftCriteria:'',writtenFeedback:'',feedbackAction:'',revisionEvidence:'',
  draftComplete:'not-yet', // a sample in Pathfinder is not an externally written teacher draft
  courseConcern:theory?'Ask the teacher whether the proof scope is adequate for an actual AA HL exploration.':
   'Ask the teacher about the syllabus fit before adding any more techniques.',
  permissionNotes:theory?'No empirical collection.':'Synthetic example; no permission to gather genuine human data is implied.',
  firstOutputIntroduction:s.entries[0].purpose,
  nextStepSelected:'The sample has enough mathematical material to answer its stated fictional aim; no fourth stage is compulsory.'
 });
 // Do not open the retired conclusion panel with duplicate outdated text.
 s.scratch.conclusion='';
 s.scratch.finalReview='';
 s.completion.conclusionResultIds=s.entries.slice(1).map(t=>t.id);
 s.completion.stages.C70='working';s.completion.stages.C80='not-started';s.completion.stages.C90='not-started';
 s.completion.visited=s.completion.visited.filter(node=>!['C80','C90'].includes(node));
 s.ui.checkingMode='draft';
}
function currentChecking(s,kind){
 const x=subjects[kind],isTheory=kind==='theory';
 for(const mode of ['draft','feedback','final']){
  for(const check of reviewChecksFor(s,mode)){
   const details=CHECKING_DETAILS[check.id],record=s.completion.review.records[mode+'-'+check.id];
   if(!details)throw new Error('Missing source-grounded checking guidance for '+check.id);
   record.status='unchecked';record.checkedAt='';record.selfMark='';record.markLevel='';
   record.location=mode==='final'?'Actual final IA file not created':
    mode==='feedback'?'No actual teacher feedback received':
    check.id==='D02'?'Introduction, mathematical stages 1–3 and conclusion notes':
    check.id==='D03'?'Generated figures 1–2, result table, definitions and calculations':
    check.id==='D04'?'Method decisions and stage-to-stage justifications':
    check.id==='D05'?'Interpretation and limitations after each result':
    check.id==='D06'?'All three mathematical stages and the supporting figures':
    'Sample Planning and mathematical working records';
   record.note=mode==='draft'?
    'Review prompt for an actual IA: '+details.focus+'. '+details.lookFor.join('; ')+
      '. This fictional working example is NOT a complete externally written teacher draft.':
    mode==='feedback'?
    'No teacher has supplied written or verbal feedback on this illustration. If feedback is received for a real project, record exactly what the teacher said and verify the actual correction.':
    'The final file has not been produced, read or submitted. Check these conditions in the actual final file, not merely within this sample: '+details.lookFor.join('; ')+'.';
   record.action=mode==='final'?'Only record completion after inspecting the actual final IA file.':
    mode==='feedback'?'Record genuine teacher comments, carry out revisions and verify changes.':
    check.id==='D06'?'Check the mathematics and units independently, especially '+(isTheory?'the telescoping proof':'the regression assumptions')+'.':
    'Return to the actual document and address any specific evidence or presentation gap before marking as checked.';
  }
 }
 s.completion.review.feedbackItems=[];
 s.teacher.feedbackStatus='not-requested';
 s.teacher.pendingApproval=false;s.teacher.checkpoints=[];
 s.completion.review.feedbackNote='';s.completion.review.feedbackAction='';
 s.completion.review.feedbackLocation='';
}
export function enrichCurrentIllustrativeSample(s,kind,math){
 if(!subjects[kind])throw new Error('Unknown teaching-sample scenario: '+kind);
 updatePlanning(s,kind);
 entryText(s,kind);
 arrangeCurrentJourney(s,kind);
 buildFigures(s,kind,math);
 currentWriting(s,kind);
 currentChecking(s,kind);
 // Figures and all their editable drafts belong to the preview, not the
 // student's personal project; the same data generate full-PDF figures.
 return s;
}
export function sampleIAWritingWords(s){
 const e=s.entries||[],f=s.completion?.fields||{};
 const body=[s.scratch.introduction,s.scratch.dataNotes,
  ...e.flatMap(x=>[x.purpose,x.result,x.interpretation,x.limitations,x.nextWhy]),
  f.mainConclusion,f.conclusionBenefit,f.conclusionExtension];
 return body.reduce((sum,x)=>sum+asWords(x),0);
}
