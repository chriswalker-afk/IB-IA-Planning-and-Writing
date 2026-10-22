import {R,f,graph,table,finishDecisionSpec} from './decision-sample-tools.js';
import {newGeometryDraft,normalizeGeometryDraft} from '../../diagrams/geometry-core.js';
const rad=d=>d*Math.PI/180;
export function sightHeight(alpha,beta,b=15,e=1.5){
 const ta=Math.tan(rad(alpha)),tb=Math.tan(rad(beta));
 if(!(b>0&&alpha>beta&&beta>0&&alpha<90))throw new Error('Require b>0 and 0<beta<alpha<90 degrees.');
 const x=b*tb/(ta-tb),z=x*ta;return {x,z,H:e+z};
}
export const HEIGHT_INPUTS=Object.freeze({alpha:42,beta:27,b:15,e:1.5,angleBound:.5,baselineBound:.1,eyeBound:.02});
export const HEIGHT_RESULT=sightHeight(42,27);
const q=HEIGHT_RESULT;
export const heightAngleInterval=b=>{const beta=Math.atan(q.z/(q.x+b))*180/Math.PI;
 return {b,beta,low:sightHeight(42.5,beta-.5,b).H,high:sightHeight(41.5,beta+.5,b).H};};
const sensitivity=[
 ['Near angle only',sightHeight(42.5,27).H,sightHeight(41.5,27).H],
 ['Far angle only',sightHeight(42,26.5).H,sightHeight(42,27.5).H],
 ['Baseline only',sightHeight(42,27,14.9).H,sightHeight(42,27,15.1).H],
 ['Instrument height only',sightHeight(42,27,15,1.48).H,sightHeight(42,27,15,1.52).H],
 ['All stated inputs',sightHeight(42.5,26.5,14.9,1.48).H,sightHeight(41.5,27.5,15.1,1.52).H]
];
const geometry=newGeometryDraft('triangle');
Object.assign(geometry,{title:'Two positions on one level baseline',figureNumber:'1',mode:'schematic',unit:'m',showCaption:true,
 sourceKind:'theoretical',sourceCredit:'My constructed two-sight-line model; not a surveyed site.',
 caption:'A is nearer the mast than B. B, A and D lie at the same instrument height e above the ground; DT is H-e.',
 vertices:[
  {...geometry.vertices[0],label:'B',x:-15,y:0,edgeLabel:R`x+b`,angleLabel:R`\beta=27^\circ`,angleLabelDy:-8},
  {...geometry.vertices[1],label:'D',x:q.x,y:0,edgeLabel:R`H-e`,rightAngle:true},
  {...geometry.vertices[2],label:'T',x:q.x,y:q.z,edgeLabel:'',angleLabel:''}
 ],auxPoints:[{id:'p-a',label:'A',x:0,y:0,labelDx:0,labelDy:20}],
 guides:[{id:'guide-near',kind:'solid',from:'p-a',to:'v-c',label:R`\alpha=42^\circ`,showLength:false},
 {id:'guide-baseline',kind:'solid',from:'v-a',to:'p-a',label:'b = 15 m',showLength:false}],
 note:'The instrument-height correction is added after calculating DT. The diagram encodes a mathematical scenario, not real measurements.'});
const provenance='Two Sight Lines v1: a constructed level-ground scenario with nearer elevation 42 degrees, farther elevation 27 degrees, horizontal baseline 15.0 m and equal instrument height 1.50 m. A third check position lies 25 m behind the nearer point and has stipulated rounded elevation 21.6 degrees. For sensitivity only, each main angle may differ by 0.5 degree, the 15 m baseline by 0.10 m and instrument height by 0.02 m. No physical survey, calibration or safety/access assessment has occurred.';
const definitions=R`\(H\) is total mast height, \(e\) the common instrument height, \(z=H-e\) the rise above eye level, \(x\) the unknown horizontal distance from nearer position A to the mast, and \(b\) the horizontal distance from farther B to A, all in metres. Angles of elevation \(\alpha\) at A and \(\beta\) at B are in degrees, with \(0<\beta<\alpha<90^\circ\).`;
export const INACCESSIBLE_HEIGHT_SPEC=finishDecisionSpec({
 id:'inaccessible-height',routeId:'triangulation',title:'How reliably can two sight lines determine a height?',course:'AA SL',sourceType:'theoretical',mathSelected:['AA11','AA12'],
 description:'Derive a two-position height formula, check a third sight line, bound interacting angle errors and compare baseline choices without inventing a survey.',
 readingNote:'A complete fictional geometry investigation. Angles, baseline and error allowances are defined inputs, not real survey measurements.',provenance,definitions,technologyStage:2,
 planning:{
  idea:'I will estimate the height of a hypothetical mast whose base distance I cannot measure directly, using two accessible aligned positions.',
  aim:'I want to derive a mast-height estimate from two stated elevation angles and a baseline, then determine whether angle uncertainty permits a precise answer and whether changing the baseline improves it.',
  motivation:'An angle display can give a precise-looking height even when a small change in direction moves the inferred intersection substantially. I want to understand which part of the geometry controls that sensitivity.',
  beneficiaryType:'me',beneficiary:'I would use the result to judge a proposed mathematical measurement arrangement before claiming that its calculated height is reliable.',
  intendedUse:'Report a nominal height with a justified conditional range and compare the effect of alternative observing positions.',
  theoreticalAim:'Determine H from a level 15 m baseline, elevation angles 42 and 27 degrees, and a common 1.50 m instrument height, with specified input ranges.',
  theoreticalCase:'I will draw both sight lines in one vertical plane. The farther position is 15 m behind the nearer, and both instrument axes are at the same height. I will first solve the nominal triangle equations, then vary inputs.',
  prediction:'I expect a height near 20 m, but a short baseline or small angular separation may amplify error.',
  predictionWhy:'If two rays are almost parallel, a small change in either direction can move their intersection far away.',
  predictionImplication:'Choosing positions that give sufficiently different angles may matter more than displaying additional calculator decimals.',
  firstAction:'Draw the nearer and farther triangles and label the common rise H-e before using tangent.',
  firstAccuracy:'Keep hypothetical input bounds separate from instrument display resolution and from a statistical confidence interval.',
  permissionDetails:'This is a defined geometric scenario, not a plan to enter or measure a real restricted site.',
  teacherQuestion:'Does the monotonicity argument justify all simultaneous input bounds, rather than only several trial calculations?',
  teacherSafeAction:'I can establish the algebra and examine sensitivity without collecting or claiming any actual survey data.',
  milestoneAdjustment:'My provisional six-week sequence is diagram and derivation, numerical consistency, individual and combined input bounds, baseline comparisons, and writing/review.'
 },
 introduction:R`I wanted to understand how two angles can reveal a height when the distance to the object's base is unavailable. A calculator may produce many digits, but those digits seem unhelpful if moving an angle by half a degree changes the answer by a metre.

I constructed a mast scenario with a 15 m horizontal baseline between two positions. The nearer angle of elevation is \(42^\circ\), the farther \(27^\circ\), and both instrument axes are 1.50 m above the same level ground. My aim is to derive the height, examine the consequences of specified input changes, and compare possible baseline lengths.

I expect the nominal result to be around 20 m. My more important prediction is that a small separation between the sight-line angles will make the estimate sensitive. No mast was surveyed: the scenario lets me investigate that mathematical issue without presenting invented measurements as observations.`,
 dataNotes:R`Two Sight Lines v1 [D1] fixes the order of the positions: B is farther from the mast, A is nearer, and the mast's ground base lies beyond A on the same horizontal line. The baseline is \(BA=15\) m. Both angles are measured upward from a common horizontal instrument-height line, not from the ground at one point and eye level at another.

I treat the nominal inputs as exact for the first calculation. For a later uncertainty model, I permit \(41.5\le\alpha\le42.5\) and \(26.5\le\beta\le27.5\), in degrees, \(14.9\le b\le15.1\) m, and \(1.48\le e\le1.52\) m. These are explicit mathematical intervals, not experimentally calibrated accuracy claims.

The additional position 25 m behind A has a stipulated rounded angle of \(21.6^\circ\). I use it only as an internal consistency check. Its agreement cannot independently verify the same-plane or level-ground assumptions in a real setting.`,
 source:{actualSource:provenance,actualMethod:'I defined the positions, angles and allowable ranges, then derived a two-triangle relation. I did not use measured distances or claim to operate a surveying instrument.',
  modelEvidence:'A specified two-position geometry with a separate stipulated rounded-angle consistency check.',modelInputs:'b=15.0 m, alpha=42 degrees, beta=27 degrees, e=1.50 m; later the explicitly stated bounded input alternatives.',
  modelAssumptions:'A vertical mast, level ground, aligned observing positions and equal instrument heights define one common vertical plane. The baseline is horizontal, not a sloping ground distance.',
  modelDomain:'b>0 and 0<beta<alpha<90 degrees. The permitted main angle intervals never overlap.',
  modelValidation:'I substitute the result back into both tangent equations and compare the calculated angle at the third specified position with its rounded input.',
  modelAlternative:'A single angle would suffice if the distance to the base were known, but here that distance is unknown. Two positions supply a second independent equation in the nominal model.',
  modelSensitivity:'I first change one input at a time, then use monotonicity to bound every simultaneous combination. Baseline comparisons keep the nominal mast geometry fixed.',
  chosenMethod:'Two tangent equations, elimination of unknown base distance, monotonic interval bounds and baseline sensitivity.',
  methodReason:'The two right triangles share the same vertical rise above the instrument line. Their base lengths differ by the known baseline, giving equations in two unknowns.',
  methodLimitation:'Level-ground and common-instrument-height errors change the geometry itself; they are not covered by changing only the stated angles.',
  limitationConsequence:'My height interval is conditional on that geometry and cannot be called a verified accuracy specification for a real instrument.',
  limitationMitigation:'I state the common height explicitly, include its allowed interval once, and separate a consistency check from external validation.',
  limitationAcceptable:'The calculations solve the stated geometric and input-bound problem; a physical estimate needs actual observations and checks of alignment and levels.'},
 completion:{
  permissionNotes:'No site entry, instrument use or physical survey is claimed.',changedSincePlanning:'The nominal height was near 20 m, but the simultaneous input interval was wide enough to rule out reporting the calculator digits as measurement accuracy.',
  dataStatusSummary:'All starting quantities are specified assumptions. The third angle is an internal numerical consistency check, not new field evidence.',
  dataAimLink:R`I cannot use \(H=x\tan\alpha\) directly because \(x\) is unknown and the angle is taken above instrument height. I therefore start with the shared rise \(z=H-e\) in two triangles.`,
  firstMethodEvaluation:'A diagram makes the order of the angles and the instrument correction explicit. Substituting two angles into an unexplained formula would hide why the denominator can become sensitive.',
  firstPresentation:'Figure 1 labels the nearer point A, farther B, top T and horizontal reference D at instrument height.',
  specialistTerms:'An angle of elevation is measured above the horizontal. A bounded input interval states allowed alternatives; it is not a confidence interval unless a probability model is separately supplied.',
  predictionComparison:'The nominal result is about 19.1 m, as expected. Reducing the baseline to 2 m makes the angle-only range dramatically wider, confirming the importance of angular separation.',
  benefitFinding:'I can explain why a nominal height of 19.1 m needs a roughly 17.8-20.6 m conditional qualification under the specified inputs.',
  nextMethod:'Eliminating the unknown distance from two tangent equations',
  technologyTool:'Degree-mode calculator and graph plotter',technologyInput:'The derived height function and the endpoints of the specified angle, baseline and instrument-height ranges.',
  technologyOutcome:R`The nominal estimate is \(H\approx19.105675\) m; the full specified input interval gives approximately 17.7752-20.6173 m.`,
  technologyInterpretation:'Calculator values evaluate the derived formula. The monotonicity argument, not a sampled graph, proves where the interval endpoints occur.',
  courseWhy:'Trigonometric modelling, simultaneous equations and monotonic comparisons develop a focused AA SL measurement question.',courseConcern:'I avoid interpreting a plotted sensitivity sample as a proof covering all allowed inputs.',
  mathsLearning:'I learned that the denominator represents angular separation and that a longer baseline must be compared with a correspondingly changed far angle.'
 },
 accuracy:[
  {quantity:'Angles of elevation',symbol:'alpha, beta',unit:'degrees',resolution:'Nominal 42 and 27 degrees; separately assumed +/-0.5 degree intervals.',policy:'Use degree mode and retain unrounded tangents. Evaluate full interval extremes before choosing a reporting precision.',reason:'The difference between the two tangent values controls the inferred intersection and amplifies angle changes.'},
  {quantity:'Horizontal baseline',symbol:'b',unit:'m',resolution:'Nominal 15.0 m; separate assumed +/-0.10 m bound.',policy:'Use the horizontal baseline in both triangle equations and scale it only once.',reason:'The height above the instrument line is proportional to b when angles are fixed.'},
  {quantity:'Common instrument height',symbol:'e',unit:'m',resolution:'Nominal 1.50 m with a separate assumed +/-0.02 m bound.',policy:'Add the common height once after finding the rise z.',reason:'Both angle measurements use the same elevated reference line.'}
 ],
 stages:[
  {key:'derive',title:'Eliminating the inaccessible base distance',kind:'model',methodId:'follow-journey',technique:'Two right triangles and algebraic elimination',knowledge:'syllabus',outcomeId:'triangle',
   bridge:'The unknown ground distance prevents a one-triangle calculation. The second sight line supplies another equation without requiring access to the base.',
   purpose:'In Figure 1 the rise DT is z=H-e. The nearer and farther horizontal distances are x and x+b respectively.',
   result:R`Using tangent in degree mode gives
\[\tan\alpha=\frac zx,\qquad \tan\beta=\frac z{x+b}.\]
Thus \(x\tan\alpha=(x+b)\tan\beta\), so
\[x=\frac{b\tan\beta}{\tan\alpha-\tan\beta},\quad
H=e+\frac{b\tan\alpha\tan\beta}{\tan\alpha-\tan\beta}.\]
I require \(b>0\) and \(0<\beta<\alpha<90^\circ\); then the denominator and inferred distance are positive. Interchanging the angles without changing the diagram would make the distance negative, revealing an inconsistent setup.

Dividing numerator and denominator by \(\tan\alpha\tan\beta\) gives the equivalent form
\[z=\frac b{\cot\beta-\cot\alpha}.\]
This second form will help me identify the effect of changing either angle.`,
   interpretation:'The unknown distance is eliminated, but a new issue is exposed: nearly equal angles produce a small denominator. The derivation explains the sensitivity rather than treating it as a mysterious calculator behaviour.',
   limitations:'The shared rise z requires equal instrument levels and a common vertical plane. A slope in the ground or unequal instrument heights would require different equations.',
   localTakeaway:'Two angles and a horizontal baseline determine H under the stated geometry, with angular separation appearing in the denominator.',
   nextQuestion:'What height follows from the nominal inputs, and is it consistent with both triangles and the third stated angle?',
   nextWhy:'I should verify the derived expression on the actual scenario before exploring uncertainty.',
   mathsInsight:'Eliminating an inaccessible distance does not remove uncertainty; it relocates sensitivity into a difference of trigonometric values.',methodChangeReason:'I apply and check the derived formula rather than selecting a numerical answer without a geometric test.'},
  {key:'nominal',title:'A nominal height and an internal consistency check',kind:'model',methodId:'follow-journey',technique:'Trigonometric evaluation and inverse tangent',knowledge:'syllabus',outcomeId:'repeat',
   bridge:'The formula now allows a numerical estimate while keeping the instrument correction separate.',
   purpose:'Table 1 records the inferred distance, rise and total height. I check the result by reconstructing the sight-line angles.',
   result:R`Substituting \(b=15\), \(\alpha=42^\circ\), \(\beta=27^\circ\) and \(e=1.50\) gives
\[x\approx19.553083\text{ m},\qquad z\approx17.605675\text{ m},\qquad H\approx19.105675\text{ m}.\]
For example, \(17.605675/19.553083\approx\tan42^\circ\), while \(17.605675/(19.553083+15)\approx\tan27^\circ\). These substitutions check both the algebra and the position order. Omitting e would understate the total height by 1.50 m.

At the third position, 25 m behind A, the model predicts
\[\gamma=\tan^{-1}\left(\frac{17.605675}{19.553083+25}\right)\approx21.5620^\circ.\]
This rounds to the stipulated \(21.6^\circ\). It is consistent within the chosen half-degree angular allowance, but a rounded constructed angle is not an independent field measurement.`,
   interpretation:'The nominal 19.1 m answer is internally coherent. It is premature to attach significance to the remaining digits: the next question is how much the permitted angle changes move the answer.',
   limitations:'Substituting into the original equations confirms a calculation, not the truth of its physical assumptions. The third angle remains part of the hypothetical scenario.',
   localTakeaway:'The nominal estimate is 19.105675 m and predicts 21.562 degrees at the third position, consistent with its rounded stated angle.',
   nextQuestion:'What is the complete height range when all four specified inputs can change together?',
   nextWhy:'A nominal calculation and consistency check do not quantify the uncertainty that the aim asks about.',
   mathsInsight:'An instrument-height correction changes the target quantity, whereas extra calculator digits only change its displayed precision.',methodChangeReason:'I keep the nominal scenario fixed as a reference and examine its stated input intervals.'},
  {key:'bounds',title:'Bounding simultaneous input changes',kind:'model',methodId:'follow-journey',technique:'Monotonicity and interval extremes',knowledge:'syllabus',outcomeId:'sensitivity',
   bridge:'I first compared one-at-a-time changes to see what matters, then looked for an argument that covers every simultaneous combination.',
   purpose:'Table 2 separates individual input effects from the combined range. Its bounds are calculated from the formula, not estimated from a scatter of simulated values.',
   result:R`For fixed angles, \(z\) increases with the positive baseline b, and total height increases with e. On \(0^\circ<\theta<90^\circ\), \(\cot\theta\) decreases as \(\theta\) increases. Therefore, in \(z=b/(\cot\beta-\cot\alpha)\), increasing \(\alpha\) increases the denominator and decreases z; increasing \(\beta\) decreases the denominator and increases z.

The permitted angles always obey \(\alpha>\beta\), so there is no zero denominator inside the input box. Consequently the smallest height occurs at
\[(\alpha,\beta,b,e)=(42.5^\circ,26.5^\circ,14.9,1.48),\]
and the largest at
\[(\alpha,\beta,b,e)=(41.5^\circ,27.5^\circ,15.1,1.52).\]
They give approximately 17.7752 m and 20.6173 m. Monotonicity makes these the extrema over the whole stated box, not just two examples.

With both angles fixed, the baseline allowance changes the height by only about 0.1174 m each way, and the instrument-height allowance by 0.02 m. With only the angles allowed to vary, the interval is approximately 17.9045-20.4708 m. Angular choices dominate this scenario.`,
   interpretation:'The nominal value near 19.1 m needs a range spanning nearly 2.85 m under the full allowances. I would not claim that 19.106 m is a reliable measured height. The asymmetric distances from the nominal value also show why an automatic symmetric rounding error is inappropriate.',
   limitations:'This is a deterministic input-box bound. It assigns no probabilities, and unmodelled ground slope, misalignment or unequal instrument heights could produce values outside it.',
   localTakeaway:'Every allowed combination under the stated geometry gives approximately 17.7752-20.6173 m; angular uncertainty is the main contributor.',
   nextQuestion:'Could a different horizontal baseline reduce the angular sensitivity without changing the mast being modelled?',
   nextWhy:'The denominator suggests that the observing geometry, not just numerical precision, may be improved.',
   mathsInsight:'A verified monotonic direction can locate extremes over a multidimensional input range without an exhaustive numerical grid.',methodChangeReason:'I compare prospective baseline choices using the same nominal mast and nearer position.'},
  {key:'baseline',title:'Why a longer baseline must change the far angle',kind:'model',methodId:'follow-journey',technique:'Controlled geometry comparisons and sensitivity',knowledge:'syllabus',outcomeId:'sensitivity',
   bridge:'If I change b but leave both angles fixed, my formula describes a different mast. To compare observing arrangements fairly, I hold the nominal x and z fixed instead.',
   purpose:'Figure 2 plots the calculated width of the angle-only height interval as the far position changes. Table 3 compares four specified baselines.',
   result:R`For a new baseline b, the same nominal geometry gives
\[\beta(b)=\tan^{-1}\left(\frac{17.605675}{19.553083+b}\right).\]
I preserve the nearer \(42^\circ\) angle, use this new nominal far angle, and allow \(\pm0.5^\circ\) on both. Here b and e are held exact to isolate angular effects.

At b=2 m, \(\beta\approx39.2437^\circ\), and the height range is approximately 14.4078-29.1462 m. At b=15 m the range is 17.9045-20.4708 m; at b=25 m it is 18.1072-20.1972 m; at b=35 m it is 18.1477-20.1345 m. Increasing 15 to 25 m reduces the interval width from about 2.5663 to 2.0900 m, an 18.6% reduction. The next extra 10 m gives a much smaller improvement.

For all allowed angles to keep \(\alpha>\beta\), their nominal separation must exceed the sum of their half-degree bounds, namely \(1^\circ\). If the angular intervals overlap, valid angles can approach equality from above and yield arbitrarily large heights; sampling a few values would miss that issue. The short 2 m baseline avoids overlap but remains highly sensitive.`,
   interpretation:'For the defined choices, a 25 m baseline is a worthwhile mathematical improvement over 15 m, but it does not make half-degree angular errors negligible. I have not proved that 25 m is optimal among all distances or established that such a real observing position is accessible.',
   limitations:'These comparisons isolate angle sensitivity at the same nominal geometry. They do not include increased baseline measurement error at longer distances or determine real site access.',
   localTakeaway:'Changing the far position while recalculating its angle can reduce sensitivity; keeping both angles fixed would compare different objects instead.',
   nextQuestion:'Would documented angle repeatability and independently checked levels narrow the interval in a real measurement?',
   nextWhy:'Those missing observations determine whether this mathematical arrangement delivers the accuracy a physical task needs.',
   mathsInsight:'A fair sensitivity comparison must keep the object fixed and vary only the measurement arrangement.',methodChangeReason:'I conclude with a qualified estimate and a geometry-based improvement, not an invented survey precision.'}
 ],
 figures:[
  {id:'geometry-height-sight-lines',tool:'geometry',stage:0,after:'purpose',draft:normalizeGeometryDraft(geometry)},
  table({id:'table-height-nominal',stage:1,number:1,title:'Nominal geometry and consistency',columns:['Quantity','Calculated value','Unit'],rows:[['Near distance x',f(q.x,5),'m'],['Rise above instrument z',f(q.z,5),'m'],['Total height H',f(q.H,5),'m'],['Third predicted angle',f(Math.atan(q.z/(q.x+25))*180/Math.PI,4),'degrees']],note:'Values are calculations from stipulated inputs; displayed precision is not a claim of measurement accuracy.'}),
  table({id:'table-height-inputs',stage:2,number:2,title:'Individual and combined input effects',columns:['Changed input','Lower H','Upper H'],rows:sensitivity.map(([n,l,h])=>[n,f(l,4),f(h,4)]),units:['','m','m'],note:'Unchanged inputs remain nominal. The last row permits all stated inputs to change simultaneously.'}),
  graph({id:'figure-height-baseline',stage:3,number:2,title:'Height-interval width for a fixed nominal mast',rows:Array.from({length:67},(_,i)=>{const b=2+i*.5,r=heightAngleInterval(b);return [b,r.high-r.low];}),xLabel:'Horizontal baseline',yLabel:'Angle-only interval width',xSymbol:'b',ySymbol:'W',xUnit:'m',yUnit:'m',bounds:[0,36,0,16],caption:'Calculated scenario points. The far angle changes with baseline to preserve the same mast; b and e are exact in this comparison.'}),
  table({id:'table-height-baselines',stage:3,number:3,title:'Four observing arrangements',columns:['Baseline','Far angle','Lower H','Upper H','Width'],rows:[2,15,25,35].map(b=>{const r=heightAngleInterval(b);return [b,f(r.beta,4),f(r.low,4),f(r.high,4),f(r.high-r.low,4)];}),units:['m','degrees','m','m','m'],note:'Only the two angles vary by +/-0.5 degree. This is not the full original-input interval.'})
 ],
 dataSets:[{name:'Two Sight Lines v1 - input assumptions',columns:['Quantity','Nominal','Half-width','Unit'],rows:[['Near angle',42,.5,'degrees'],['Far angle',27,.5,'degrees'],['Baseline',15,.1,'m'],['Instrument height',1.5,.02,'m']],sourceText:provenance},
  {name:'Nominal and third-position geometry',columns:['Quantity','Value','Unit'],rows:[['x',q.x,'m'],['z',q.z,'m'],['H',q.H,'m'],['Third baseline',25,'m'],['Third stipulated angle',21.6,'degrees'],['Third predicted angle',Math.atan(q.z/(q.x+25))*180/Math.PI,'degrees']],sourceText:'The third angle is a stipulated rounded internal check, not independent physical evidence.'},
  {name:'Complete baseline sensitivity calculations',columns:['Baseline m','Far angle degrees','Angle-only lower H','Angle-only upper H'],rows:Array.from({length:67},(_,i)=>{const r=heightAngleInterval(2+i*.5);return [r.b,r.beta,r.low,r.high];}),sourceText:'Modelled arrangements for a fixed nominal mast and nearer point.'}],
 conclusion:{mainConclusion:R`The nominal two-position model gives \(H\approx19.1057\) m, including the 1.50 m instrument height. It satisfies both tangent equations and predicts the stipulated third angle to its stated rounding. Under the complete prescribed angle, baseline and instrument-height ranges, the conditional height interval is approximately 17.7752-20.6173 m. I therefore regard 19.1 m as a nominal estimate, not a precise measured answer.`,
  conclusionBenefit:R`The two angular bounds dominate the uncertainty. Comparing observing arrangements while keeping the mast fixed shows that increasing the baseline from 15 to 25 m reduces the angle-only interval width by about 18.6%, whereas a 2 m baseline is very sensitive. This answers the methodological part of my aim: geometry can improve the estimate, but more displayed decimal places cannot. The bound remains conditional on level, aligned positions and common instrument height.`,
  conclusionExtension:'For a physical investigation I would check horizontal levels and alignment, measure actual angular repeatability and the horizontal baseline, then use those documented bounds in the same analysis. A genuine third independently measured position could test consistency; the stipulated angle here cannot supply that empirical assurance.'},
 reviews:[
  {id:'D01',location:'Derivation through conclusion',note:'I derived the height relation, applied it, checked a third position, bounded all main inputs and compared alternative baselines.',action:'I answered both the nominal-height and reliability parts of my aim.'},
  {id:'D02',location:'Four mathematical stages',note:'The unknown distance leads to elimination, the nominal solution to consistency, the small denominator to bounds, and the angular sensitivity to a baseline comparison.',action:'I kept the same mast geometry when changing the observation arrangement.'},
  {id:'D03',location:'Diagram, definitions and formulae',note:'I distinguish H from H-e, use degrees in tangents, place the larger angle at the nearer point, and state a positive-denominator domain.',action:'I add instrument height once and keep horizontal baseline distinct from sloping ground distance.'},
  {id:'D04',location:'Bound and arrangement choice',note:'My concern about misleading precision leads to an explicit interval and a justified comparison of possible positions.',action:'I do not select a better-looking rounded height as evidence of greater accuracy.'},
  {id:'D05',location:'Monotonicity and limitations',note:'I prove the extreme directions over the stated input box and explain why overlapping angle intervals can make a finite bound impossible.',action:'I distinguish deterministic bounds from confidence intervals and physical instrument accuracy.'},
  {id:'D06',location:'Tangent equations and endpoint evaluations',note:'I substitute the inferred x and z into both triangles and check the monotonic endpoints independently.',action:'The third-angle calculation is labelled an internal consistency check.'},
  {id:'D07',status:'unchecked',location:'Reader and PDF/Word',note:'The diagram and compact tables are assigned to their respective calculations, with a separate baseline-sensitivity graph.',action:'Final rendered geometry labels and exported pages need visual inspection.'},
  {id:'D09',location:'Source and assumptions',note:'All angles, distances and input intervals are explicitly stipulated. I have not invented survey dates, permissions or calibration evidence.',action:'I keep real-site conclusions outside the model.'},
  {id:'D11',location:'Worked stages',note:'Every stage contains completed formulae and numerical comparisons, including the global interval argument.',action:'I do not replace calculations with instructions about what a survey should do.'},
  {id:'D19',location:'Figure 1, Figure 2 and Tables 1-3',note:'The diagram explains the geometry and the graph summarises calculated sensitivity; the full baseline record stays in project data.',action:'The baseline table separates angular-only bounds from the complete original uncertainty box.'},
  {id:'D20',location:'Calculator and graph calculations',note:'I state the exact functions and angle units and use an analytical monotonicity argument to justify the extremes.',action:'The sampled graph illustrates rather than proves the range.'}
 ]
});
