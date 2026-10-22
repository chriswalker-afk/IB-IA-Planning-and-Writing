import {newGeometryDraft} from '../../diagrams/geometry-core.js';
import {newGraphDraft} from '../../diagrams/graph-core.js';
import {newTableDraft} from '../../diagrams/table-studio-core.js';

// A complete authored investigation. These are designed inputs and calculated
// consequences, not measurements or evidence of a manufactured tray.
const R=String.raw;
const volume=c=>c*(30-2*c)*(20-2*c);
const idealCut=(25-5*Math.sqrt(7))/3;
const idealVolume=volume(idealCut);
const lower99=3.484198595373365;
const provenance='Constructed design scenario: a 30 cm by 20 cm sheet, 4 cm height limit, nominal settings in 0.1 cm steps and a common setting error bounded by 0.1 cm. All volumes are calculated from the stated zero-thickness model.';
const aim=R`I want to choose a corner-cut setting for a tray made from a \(30\text{ cm}\times20\text{ cm}\) sheet that gives the greatest guaranteed volume while fitting below a \(4.0\text{ cm}\) height limit. I will allow a common setting error of up to \(1\text{ mm}\) and use nominal settings marked in \(1\text{ mm}\) steps.`;
const definitions=R`I use \(c\) for the actual common corner-cut size, \(n\) for my nominal setting and \(\varepsilon=c-n\) for its error, all in centimetres. The bound on the error is \(\delta\), so \(|\varepsilon|\le\delta\). The modelled volume is \(V(c)\), in \(\text{cm}^3\), and \(W(n)\) is the smallest volume allowed by the error interval. The height is \(c\).`;
const assumptions=R`I treat the sheet as an exact \(30\text{ cm}\times20\text{ cm}\) rectangle with negligible thickness. Equal square cuts and perpendicular folds produce a rectangular tray. One common setting controls all four corners: the same error changes every cut equally. My \(4.0\text{ cm}\) height limit and \(1\text{ mm}\) error bound are design assumptions, not measured clearances or estimates from an experiment. I ignore wall bowing, fold radius and joints.`;
const accuracyReason=R`I distinguish exact design inputs from hypothetical construction tolerance. A ruler increment of \(0.1\text{ cm}\) does not itself establish the error bound; I separately assume \(\delta=0.1\text{ cm}\). I retain unrounded calculations when comparing designs, report volumes to \(0.1\text{ cm}^3\) in the conclusion and never round an allowable error upwards.`;
const sourceFields={
 dataStatus:'theoretical',actualSourceType:'theoretical',
 actualSource:'My specified sheet dimensions, height restriction and error model, followed by calculations from rectangular geometry.',
 sourceCitation:'',actualMethod:R`I defined the dimensions and restrictions of a hypothetical design problem. I derived its volume function and calculated the comparison values; I did not measure or manufacture a tray.`,
 modelEvidence:'A geometric model derived from the specified design, not a regression fitted to observations.',
 modelInputs:R`Sheet length \(30\text{ cm}\), width \(20\text{ cm}\), maximum height \(4.0\text{ cm}\), error bound \(\delta=0.1\text{ cm}\), nominal setting increment \(0.1\text{ cm}\).`,
 modelAssumptions:assumptions,
 modelDomain:R`A non-degenerate tray requires \(0<c<10\). With error and the height restriction, \(n>\delta\) and \(n+\delta\le4\). For the initial \(\delta=0.1\), this becomes \(0.1<n\le3.9\), with \(n\) a multiple of \(0.1\).`,
 modelValidation:R`I checked the expanded cubic against length × width × height, checked the derivative's sign and compared its stationary value with nearby values and the limiting boundary volumes. I then proved the guaranteed-volume bound rather than relying on a sampled graph.`,
 modelAlternative:R`I compared the best exact cut, the available nominal settings, and the smallest volume over a whole error interval. These choices have different objectives even though they use the same geometric model.`,
 alternativeMethod:'I could compare many cut sizes in a spreadsheet, but a finite grid could miss the best exact value and would not prove a guarantee for every permitted error.',
 chosenMethod:'I derived a polynomial volume model, used differentiation to locate its maximum, and then used inequalities and endpoint comparisons to include tolerance.',
 methodReason:R`I began with rectangular geometry because equal corner cuts determine all three tray dimensions. Expressing each dimension in terms of the same variable lets me derive the capacity function instead of assuming a curve from a few plotted values.`,
 methodLimitation:'The common-setting model keeps the tray rectangular. Four unequal corner errors could produce incompatible folds, so this model does not describe every possible cutting mistake.',
 limitationConsequence:'My guaranteed volume applies to the stated geometric and common-error assumptions. It is not a tested guarantee of usable capacity in a real folded-card tray.',
 limitationMitigation:'I state the assumptions before calculating, preserve them through each comparison and separate a future independent-corner-error investigation from the results proved here.',
 limitationAcceptable:'The model answers my stated mathematical design question. It would need physical measurements and a revised geometry before I used it as a manufacturing specification.',
 dataAimLink:R`I first need to express capacity in terms of the cut size. In Figure 1, each pair of folds removes \(2c\) from a sheet dimension, so the same choice that increases height also reduces both base dimensions.`
};

const stages=[
 {
  key:'volume-model',title:'Connecting the cuts to the tray volume',bridge:R`My aim concerns capacity, so I began by expressing the three tray dimensions using one variable.`,
  purpose:R`Figure 1 shows the sheet and its fold lines. The four corner squares are removed before the remaining sides are folded upwards. I illustrated the layout at \(c=3.9\text{ cm}\), but used a variable cut size in the calculation.`,
  technique:'Rectangular geometry and polynomial modelling',methodId:'algebra',kind:'model',knowledge:'syllabus',
  result:R`The base has length \(30-2c\), width \(20-2c\), and height \(c\). Therefore
\[V(c)=c(30-2c)(20-2c).\]
Expanding gives
\[V(c)=4c^3-100c^2+600c.\]
Each factor must be positive. The width gives the strongest restriction, \(20-2c>0\), so the geometric domain is \(0<c<10\). The extra height restriction will later reduce the feasible choices, but I first kept this wider domain to establish an ideal benchmark.

For example, a \(3\text{ cm}\) cut gives a \(24\text{ cm}\times14\text{ cm}\) base and \(V(3)=1008\text{ cm}^3\). A \(4\text{ cm}\) cut gives \(V(4)=4\times22\times12=1056\text{ cm}^3\), whereas \(V(5)=5\times20\times10=1000\text{ cm}^3\). Thus increasing the height does not necessarily increase capacity.`,
  interpretation:R`The comparison places a promising cut near \(4\text{ cm}\), rather than at the tallest possible tray. The trade-off is visible in the product: an increase in \(c\) improves the height factor but reduces both base factors. These three examples do not establish which cut is best between them.`,
  limitations:R`The volume is the capacity of an ideal rectangular prism. I have not subtracted space occupied by card thickness or allowed for non-vertical walls, so the numerical volumes are model outputs, not measured capacities.`,
  localTakeaway:R`I obtained \(V(c)=4c^3-100c^2+600c\) on \(0<c<10\), with \(V(4)>V(3)\) and \(V(4)>V(5)\). This suggests an interior maximum that needs a continuous calculation.`,
  nextQuestion:'Which exact cut maximises the ideal volume, and how much better is it than a 4.0 cm cut?',
  nextWhy:'The initial comparisons leave all the cut sizes between the chosen examples unresolved.',
  mathsInsight:'The height and base dimensions cannot be optimised independently because all three depend on the same cut.',
  methodChangeReason:'I moved from evaluating selected cases to differentiating the volume function so that I could locate and justify its continuous maximum.',
  outcomeId:'stationary'
 },
 {
  key:'ideal-maximum',title:'Finding the ideal maximum and judging its precision',
  bridge:R`The volume model gave a promising region but no exact best cut. I used its rate of change to locate the maximum.`,
  purpose:R`I compared the stationary points with the geometric domain and the boundary behaviour. Figure 2 shows the full model, including the loss of volume as either the height or the base width approaches zero.`,
  technique:'Differentiation, stationary points and domain checks',methodId:'optimisation',kind:'calculus',knowledge:'syllabus',
  result:R`Differentiating gives
\[V'(c)=12c^2-200c+600.\]
Solving \(V'(c)=0\) gives
\[c=\frac{25\pm5\sqrt7}{3}.\]
The smaller root is \(c_*\approx3.9237478\text{ cm}\); the other is approximately \(12.7429\text{ cm}\), outside \(0<c<10\). Within the domain, \(V'\) is positive before \(c_*\) and negative after it. Also, \(V(c)\) tends to zero as \(c\) approaches either \(0\) or \(10\). Together these facts establish the global maximum on the geometric domain, not just a stationary candidate.

Substitution gives
\[V(c_*)\approx1056.3059\text{ cm}^3.\]
My initial whole-centimetre trial of \(4.0\text{ cm}\) loses only
\[\frac{1056.3059-1056}{1056.3059}\times100\%\approx0.0290\%.\]
I also checked \(V''(c)=24c-200\), so \(V''(c_*)=-40\sqrt7<0\), consistent with the maximum.`,
  interpretation:R`My original expectation of a useful cut near \(4\text{ cm}\) was supported. On my prescribed \(0.1\text{ cm}\) marking grid, however, \(c_*\) rounds to \(3.9\text{ cm}\), not \(4.0\text{ cm}\). The exact value \(V(3.9)=1056.276\text{ cm}^3\) also exceeds \(V(4.0)=1056\text{ cm}^3\). The \(4.0\text{ cm}\) trial was a convenient whole-centimetre comparison, not the nearest available setting. These nominal capacities still do not answer my aim: I need to check the complete error interval around a setting, including whether its largest actual height fits.`,
  limitations:R`The derivative optimises \(V\) for an exact cut; it says nothing by itself about a range of possible cuts. Rounding the optimum cannot establish that every allowed error still fits below the shelf.`,
  localTakeaway:R`The ideal optimum is \(c_*=(25-5\sqrt7)/3\), with volume approximately \(1056.3059\text{ cm}^3\). The nearest permitted mark is \(3.9\text{ cm}\); I still need to justify its feasibility and performance under the stated error.`,
  nextQuestion:'Which nominal settings remain feasible throughout the 1 mm error interval, and what volumes can they guarantee?',
  nextWhy:'The nominal capacities are close, but the height constraint and the least favourable actual volume depend on the whole error interval.',
  mathsInsight:'A mathematically exact optimum and a useful practical setting answer different questions.',
  methodChangeReason:'I replaced a single exact cut with an interval around a nominal setting so that the stated error and height restriction could affect the decision.',
  outcomeId:'flat-optimum'
 },
 {
  key:'error-interval',title:'Including the height limit and a common setting error',
  bridge:R`The ideal calculation left the possible error untreated. I wrote the actual cut as \(c=n+\varepsilon\), where \(n\) is the chosen setting.`,
  purpose:R`For the specified \(\delta=0.1\text{ cm}\), I compared the complete interval \([n-0.1,n+0.1]\). Table 1 records nearby settings, while Figure 3 makes the shallow peak visible.`,
  technique:'Interval constraints and sensitivity comparisons',methodId:'optimisation',kind:'model',knowledge:'syllabus',
  result:R`Fitting below the \(4.0\text{ cm}\) limit for every permitted error requires
\[n+0.1\le4,\qquad n\le3.9.\]
I also require \(n-0.1>0\), so the feasible nominal interval is \(0.1<n\le3.9\). My marking rule restricts \(n\) to multiples of \(0.1\text{ cm}\).

At \(n=3.9\), the possible actual cuts range from \(3.8\) to \(4.0\text{ cm}\). The maximum of \(V\) lies inside that interval; its minimum must be at an endpoint because the function increases up to \(c_*\) and decreases afterwards. I found
\[V(3.8)=1055.488,\qquad V(4.0)=1056\]
in cubic centimetres. The guaranteed modelled volume is therefore \(1055.488\text{ cm}^3\), or approximately \(99.9226\%\) of the unconstrained ideal maximum. The nominal dimensions are \(22.2\text{ cm}\times12.2\text{ cm}\times3.9\text{ cm}\).

For comparison, \(n=3.8\) guarantees \(V(3.7)=1053.612\text{ cm}^3\), and \(n=3.7\) guarantees \(V(3.6)=1050.624\text{ cm}^3\). The \(4.0\text{ cm}\) setting reaches \(4.1\text{ cm}\), so I reject it even though its nominal volume is attractive.`,
  interpretation:R`A \(3.9\text{ cm}\) setting sacrifices only about \(0.0774\%\) of the ideal volume in its least favourable allowed case, while respecting the height limit. This is stronger than quoting its nominal volume of \(1056.276\text{ cm}^3\), because that single value hides the error interval. The limiting case for this setting is the smaller actual cut, not the largest allowed height.`,
  limitations:R`My error describes one shared setting, such as a common cutting-and-folding template. It does not describe four independently misplaced cuts. I have also assumed that the stated error bound is always met; it is not a probability interval inferred from trials.`,
  localTakeaway:R`Among the nearby settings, \(n=3.9\text{ cm}\) is feasible and guarantees \(1055.488\text{ cm}^3\) under the common \(\pm0.1\text{ cm}\) error model. A nominal \(4.0\text{ cm}\) cut is infeasible.`,
  nextQuestion:'Can I prove that 3.9 cm gives the greatest guaranteed volume, rather than merely winning this short comparison?',
  nextWhy:'A table of nearby choices is not a proof that every other feasible setting performs no better.',
  mathsInsight:'The least favourable endpoint depends on the volume curve; a larger actual cut is not always a worse error.',
  methodChangeReason:'I turned the numerical comparison into an optimisation of the minimum volume over each error interval.',
  outcomeId:'real-world'
 },
 {
  key:'guaranteed-optimum',title:'Proving the best guaranteed design',
  bridge:R`The interval comparison suggested \(n=3.9\text{ cm}\). I now needed a bound that applied to every feasible setting.`,
  purpose:R`I defined \(W(n)\) to be the smallest volume generated by any permitted common error. This makes the word “guaranteed” a precise mathematical objective. Figure 4 shows this objective on the last part of the feasible interval.`,
  technique:'Maximising a lower bound using monotonicity',methodId:'optimisation',kind:'calculus',knowledge:'syllabus',
  result:R`For \(0.1<n\le3.9\), I define
\[W(n)=\min_{|\varepsilon|\le0.1}V(n+\varepsilon).\]
The choice \(\varepsilon=-0.1\) is always allowed, so
\[W(n)\le V(n-0.1).\]
Every feasible setting satisfies \(0<n-0.1\le3.8<c_*\). Since \(V\) is increasing on this whole interval,
\[W(n)\le V(n-0.1)\le V(3.8)=1055.488.\]
Stage 3 established that \(W(3.9)=1055.488\). The upper bound on every design's guaranteed volume is therefore attained at \(n=3.9\), which proves it is globally best under these constraints. It is also an allowed \(0.1\text{ cm}\) setting, so restricting the choices to the marking grid does not change this result.

For the graph, I evaluated the endpoint form
\[W(n)=\min\{V(n-0.1),V(n+0.1)\}.\]
This endpoint formula is valid because \(V\) has only one turning point on the relevant actual-cut range, and that point is a maximum. The graph illustrates the proved result; I did not use its pixel resolution to establish optimality.`,
  interpretation:R`The preferred nominal setting occurs at the boundary \(n=3.9\), even though the original continuous exact-volume problem had an interior optimum. The height restriction together with positive setting error creates this new feasible boundary. The answer happens to match the nearest permitted mark to \(c_*\), but rounding alone could not establish the guarantee: the bound proves that every feasible setting performs no better.`,
  limitations:R`The conclusion is a guarantee within my defined model, not a guarantee that a real tray will hold this volume. Unknown card thickness and unequal folds could alter both capacity and clearance. I have optimised volume, not stiffness or ease of assembly.`,
  localTakeaway:R`For every feasible nominal setting, \(W(n)\le1055.488\text{ cm}^3\), with equality at \(n=3.9\text{ cm}\). Thus \(3.9\text{ cm}\) is the best guaranteed-volume design for the specified \(1\text{ mm}\) common error.`,
  nextQuestion:'How much could the common error increase before no available setting could retain 99% of the ideal volume and still fit?',
  nextWhy:'The initial 1 mm bound was an assumption. Finding a threshold shows how strongly the conclusion depends on that assumption.',
  mathsInsight:'An attainable upper bound can prove a constrained optimum without differentiating a complicated minimum function.',
  methodChangeReason:'Having solved the original design problem, I varied its error bound to test the range over which a nearly optimal design remains possible.',
  outcomeId:'boundary'
 },
 {
  key:'tolerance-threshold',title:'Finding the error threshold for a 99% capacity target',
  bridge:R`The original design retained more than \(99.9\%\) of the ideal volume in the least favourable case. I used a \(99\%\) target to test how much less accurate the setting could become. This percentage is my stated design criterion, not an experimentally established requirement.`,
  purpose:R`I first found the smallest actual cut that reaches the target, then asked whether an entire error interval could fit between that cut and the height limit. Table 2 compares the nearby nominal ruler settings.`,
  technique:'Polynomial inequality, numerical root finding and discrete choices',methodId:'optimisation',kind:'algebra',knowledge:'syllabus',
  result:R`The target volume is
\[T=0.99V(c_*)\approx1045.7428365\text{ cm}^3.\]
Solving \(4c^3-100c^2+600c=T\) on the increasing part of the curve gives a lower cut \(a\approx3.484198595\text{ cm}\). I checked the root by bracketing it between \(3.4841\) and \(3.4842\), where the cubic lies respectively below and above \(T\). Since \(V(4)=1056>T\), and there is just one maximum before \(4\), every actual cut in \([a,4]\) reaches the target and fits the height restriction.

An entire error interval stays in this acceptable range exactly when
\[a+\delta\le n\le4-\delta.\]
With continuous choice of \(n\), this is possible only if \(2\delta\le4-a\). The largest error bound is therefore
\[\delta_{\rm continuous}=\frac{4-a}{2}\approx0.257900702\text{ cm},\]
with \(n=(4+a)/2\approx3.742099298\text{ cm}\). That nominal setting is not available on my \(0.1\text{ cm}\) grid.

For a permitted setting \(n\), the largest error is
\[\delta_{\max}(n)=\min\{n-a,4-n\}.\]
This expression increases up to the midpoint and decreases afterwards, so only the adjacent grid settings \(3.7\) and \(3.8\) can win. They allow respectively \(0.215801405\text{ cm}\) and \(0.2\text{ cm}\). Thus the largest bound with the marking grid is approximately \(2.158\text{ mm}\), at \(n=3.7\text{ cm}\). A conservative limit stated to one decimal place in millimetres would be \(2.1\text{ mm}\), not \(2.2\text{ mm}\).`,
  interpretation:R`The marking grid reduces the theoretical tolerance from about \(2.579\text{ mm}\) to \(2.158\text{ mm}\). My original \(1\text{ mm}\) assumption is comfortably inside this limit, but this does not mean I can keep the \(3.9\text{ cm}\) setting when the error increases: it has only \(1\text{ mm}\) of height margin. A less accurate process requires a smaller nominal setting. The original recommendation remains \(3.9\text{ cm}\) for the original error bound; \(3.7\text{ cm}\) solves a different, larger-tolerance question.`,
  limitations:R`The threshold remains conditional on the common-error model. I have not assigned probabilities to errors or claimed that \(99\%\) of actual trays will succeed: \(99\%\) refers to retained capacity, and the claim concerns every error in the specified interval.`,
  localTakeaway:R`A \(0.1\text{ cm}\) nominal-setting grid permits at most about \(2.158\text{ mm}\) common error while guaranteeing \(99\%\) of the ideal capacity and height at most \(4\text{ cm}\). The unrestricted continuous bound is larger and is not an available ruler setting.`,
  nextQuestion:'How would independent corner errors and nonzero card thickness change the feasible geometry and the guaranteed capacity?',
  nextWhy:'Those effects could invalidate the rectangular-prism and common-setting assumptions, so they are the most relevant extension beyond the model I have solved.',
  mathsInsight:'The best continuous tolerance need not be attainable when the decision variable is restricted to a discrete set.',
  methodChangeReason:'I separated the continuous benchmark from the actual marking grid; treating them as interchangeable would overstate the allowable error.',
  outcomeId:'real-world'
 }
];

const sheet=newGeometryDraft('rectangle');
Object.assign(sheet,{
 title:'Sheet and fold lines for the tray',figureNumber:'1',mode:'coordinate',unit:'cm',sourceKind:'theoretical',sourceCredit:'My constructed sheet geometry.',
 showTitle:true,showCaption:true,showLengths:false,showAngles:false,dimensionStyle:'dimension',dimensionOffset:40,
 caption:'The four corner squares are removed. Dashed lines mark the folds; the layout is illustrated at c = 3.9 cm.',
 vertices:[
  {...sheet.vertices[0],label:'A',x:0,y:0,edgeLabel:'30 cm',rightAngle:true},
  {...sheet.vertices[1],label:'B',x:30,y:0,edgeLabel:'20 cm',rightAngle:true},
  {...sheet.vertices[2],label:'C',x:30,y:20,edgeLabel:'30 cm',rightAngle:true},
  {...sheet.vertices[3],label:'D',x:0,y:20,edgeLabel:'20 cm',rightAngle:true}
 ],
 auxPoints:[['e','E',3.9,0],['f','F',3.9,20],['g','G',26.1,0],['h','H',26.1,20],['i','I',0,3.9],['j','J',30,3.9],['k','K',0,16.1],['l','L',30,16.1]].map(([id,label,x,y])=>({id:'p-'+id,label,x,y,labelDx:0,labelDy:0})),
 guides:[['left','e','f'],['right','g','h'],['lower','i','j'],['upper','k','l']].map(([id,from,to])=>({id:'guide-'+id,kind:'dashed',from:'p-'+from,to:'p-'+to,label:'',showLength:false})),
 note:'The fold layout is a geometric construction. The outer rectangle is the sheet, not the remaining net after cutting.'
});
const graph=(title,number,expression,xMin,xMax,yMin,yMax,caption,xSymbol='c',ySymbol='V')=>({...newGraphDraft(),
 kind:'function',title,figureNumber:String(number),expression,xMin:String(xMin),xMax:String(xMax),yMin:String(yMin),yMax:String(yMax),
 xLabel:xSymbol==='n'?'Nominal setting, n':'Actual cut size, c',yLabel:ySymbol==='W'?'Guaranteed volume, W':'Modelled volume, V',
 xSymbol,ySymbol,xUnit:'cm',yUnit:R`\mathrm{cm}^{3}`,xUnitMode:'unit',yUnitMode:'unit',
 sourceKind:'theoretical',sourceText:provenance,showPoints:false,showGrid:true,showLegend:false,caption
});
const table=(title,number,columns,rows,units,note)=>({...newTableDraft(),title,number:String(number),
 columns,headings:columns,matrix:rows.map(row=>row.map(String)),
 unitDecisions:units.map(unit=>({mode:unit?'unit':'dimensionless',unit:unit||''})),
 sourceKind:'theoretical',sourceText:'Values calculated from my stated tray model.',note,
 purpose:'I compare the specific settings that determine the design decision.',numberFormat:'source',cellAlignment:'numeric'
});
const comparisonRows=[
 ['3.7','3.6 to 3.8','1050.624','3.8','Yes'],
 ['3.8','3.7 to 3.9','1053.612','3.9','Yes'],
 ['3.9','3.8 to 4.0','1055.488','4.0','Yes'],
 ['4.0','3.9 to 4.1','1054.684','4.1','No']
];
const thresholdRows=[3.6,3.7,3.8,3.9].map(n=>[n.toFixed(1),(10*(n-lower99)).toFixed(4),(10*(4-n)).toFixed(1),(10*Math.min(n-lower99,4-n)).toFixed(4)]);

export const TRAY_OPTIMISATION_SPEC={
 id:'tray-optimisation',routeId:'optimisation',title:'A storage tray that still fits when the cut is imperfect',
 description:'A complete design investigation: derive a volume model, find an ideal optimum, and choose a setting that remains useful under a height limit and cutting tolerance.',
 course:'AA SL',mathSelected:['AA06','AA22'],technologyStage:4,provenance,
 readingNote:'A complete fictional student investigation of a defined tray design. Dimensions, clearance and cutting tolerances are stated assumptions; the volumes are calculated from the geometric model.',
 planning:{
  provisionalTitle:'A storage tray that still fits when the cut is imperfect',ideaStatus:'yes',
  idea:'I will optimise an open tray cut from one rectangular sheet, then test whether the answer survives a specified mathematical tolerance.',
  aim,motivation:'A cut reported to many decimal places looks precise, but I want to know whether those extra digits offer useful capacity and how a setting error could make a tray too tall.',
  beneficiaryType:'me',beneficiary:'I would use the result to choose a setting in this modelled storage-tray design.',
  intendedUse:'Choose a nominal cut that fits the stated height restriction for every permitted common setting error.',
  kind:'modelling',dataSource:'theoretical',
  theoreticalAim:aim,theoreticalCase:R`I will define a zero-thickness \(30\text{ cm}\times20\text{ cm}\) sheet, four equal corner cuts and perpendicular folds. The tray must fit a \(4.0\text{ cm}\) height limit. My nominal setting will be a multiple of \(0.1\text{ cm}\), with one common setting error bounded by \(\pm0.1\text{ cm}\). These are assumptions, not measurements. I can first compare cuts of \(3,4,5\text{ cm}\) to understand the volume trade-off.`,
  alternativeMethod:'A spreadsheet search could suggest a good cut, but I want an argument covering every feasible cut and error.',
  readinessImprovement:'My inputs are fully specified. I need to keep the continuous optimum separate from the nominal marking grid and from the actual cut.',
  permissionNeed:'no',permissionDetails:'I am investigating a defined geometry; I will not collect participant data or claim to have built or tested the tray.',
  practicalBlocker:'no',dataAvailability:'in-hand',timelineWeeks:'6',timelineEarly:'yes',
  mathsOutside:'syllabus',course:'AA SL',courseSuitability:'yes',
  mathsRevisedWhy:'I will add the interval argument because an exact maximum alone does not address the stated setting error.',
  prediction:R`I expect a cut near \(4\text{ cm}\) to give a large volume, but a slightly smaller nominal setting may be better once the \(4\text{ cm}\) height limit and positive setting error are included.`,
  predictionWhy:'Tiny cuts give little height, while large cuts leave a narrow base; an intermediate cut should balance the two effects.',
  predictionImplication:'If the volume is fairly flat near its maximum, I may be able to gain clearance with little loss of capacity.',
  firstAction:'Derive the product for the volume and establish the positive-dimension domain.',
  firstAccuracy:accuracyReason,
  teacherQuestion:'Is the progression from exact optimisation to a guaranteed design and a discrete tolerance threshold sufficiently focused for my course?',
  teacherSafeAction:'I can define the model and check its algebra without claiming a teacher has approved its scope.',
  universalTeacherQuestion:'Does the final guarantee make clear which geometric assumptions it depends on?'
 },
 introduction:R`I am interested in whether a mathematically optimal design is also a useful design to make. A cut reported to several decimal places seems less helpful if a small setting error changes whether the object fits its space. I chose an open storage tray because increasing its height necessarily reduces its base, giving a trade-off I could describe mathematically.

I constructed a design scenario with a \(30\text{ cm}\times20\text{ cm}\) sheet and a maximum tray height of \(4.0\text{ cm}\). My aim is to choose the nominal corner-cut setting that gives the greatest guaranteed volume when a common setting error can be as large as \(1\text{ mm}\). Nominal settings are available in \(1\text{ mm}\) steps. These are defined inputs, not measurements from a tray I have manufactured.

I expected an intermediate cut near \(4\text{ cm}\) to be useful: a very small cut gives little height, while a large one leaves little base. I also expected the height restriction to favour a setting below the exact capacity optimum. I wanted to find how much capacity that margin would cost and how strongly my answer depended on the assumed accuracy.`,
 dataNotes:R`I removed equal squares of side \(c\) conceptually from all four corners and folded the remaining sides at right angles. In my zero-thickness model, this produces a rectangular prism. The original sheet dimensions and height limit are exact specifications of the problem, not quantities whose uncertainty I estimated from a ruler.

My error model is a shared setting error: if the nominal setting is \(n\), all four cuts use the same actual value \(c=n+\varepsilon\). Initially I take \(|\varepsilon|\le0.1\text{ cm}\). The \(0.1\text{ cm}\) spacing of permitted nominal marks is a separate restriction. I have not assumed that four independent cuts would make identical errors, and I have not assigned probabilities to the possible error values.

I keep full calculator precision for comparisons and use approximation signs when displaying rounded results. The sheet diagram, graphs and short tables are generated from this model.`,
 completion:{
  ...sourceFields,changedSincePlanning:'I kept the sheet, height limit and common-error model fixed. I extended the final calculation to distinguish continuous settings from the prescribed marking grid.',
  permissionStatus:'not-needed',permissionNotes:'No participant data, restricted source or physical trial is used in this mathematical design scenario.',
  courseConcern:'My work uses polynomial algebra, differentiation, inequalities and numerical equation solving. I have not recorded teacher approval or a predicted mark.',
  firstMathsBridgePlacement:'before',
  firstPurpose:R`How does the actual common cut \(c\) determine the tray volume and its feasible domain?`,
  firstMethodEvaluation:'A labelled geometric diagram makes the dependencies clearer than a table of volumes alone. I used the diagram to derive the function before graphing it, so the curve has a stated geometric meaning.',
  firstType:'diagram',firstDefinitions:definitions,
  firstPresentation:'Figure 1 identifies the sheet and fold lines. The first calculation derives the volume and tests three cut sizes.',
  accuracyQuantity:'Common cut setting',accuracySymbol:'c',accuracyUnit:'cm',
  accuracyResolution:'0.1 cm nominal increments; separately assumed ±0.1 cm common error.',accuracyReason,
  accuracyPolicy:'Retain full working precision; use the permitted nominal grid for the design and round allowable error thresholds conservatively downwards.',
  accuracyForResult:accuracyReason,
  variableDefinitions:definitions,
  specialistTerms:'By guaranteed volume I mean the minimum of the modelled volume over every error in a stated interval. I use a nominal setting for the chosen mark and an actual cut for the value after the common error.',
  predictionComparison:R`The ideal optimum was near \(4\text{ cm}\), as I expected. Its nearest permitted \(0.1\text{ cm}\) mark, \(3.9\text{ cm}\), also proved optimal for guaranteed volume under the error and height restrictions. The least favourable allowed case loses less than \(0.1\%\) of ideal capacity. The convenient whole-centimetre trial of \(4.0\text{ cm}\) is infeasible once positive setting error is included.`,
  benefitFinding:'I can distinguish the nominal setting to choose from the accuracy needed to justify the stated capacity guarantee.',
  surpriseReason:'The continuous tolerance threshold is not attainable with the specified nominal marks, even though the underlying geometry has not changed.',
  surpriseCheck:'I compared the two marks on either side of the continuous best setting and checked both the lower-capacity and upper-height restrictions.',
  nextMethod:stages[1].technique,
  technologyTool:'Graph plotter and numerical equation solver',technologyInput:R`I plotted \(V(c)=c(30-2c)(20-2c)\) and solved \(V(c)=0.99V(c_*)\) on \(3<c<c_*\).`,
  technologyOutcome:R`The lower target-volume solution was \(c\approx3.484198595\text{ cm}\). I verified its bracket and used it in the interval inequalities.`,
  technologyInterpretation:'The graph illustrated the derived function; the derivative and inequality argument established the optima. The numerical root supplied the boundary of the acceptable actual-cut interval.',
  courseWhy:'The substantial mathematics is polynomial modelling and differentiation, developed through a justified tolerance and domain analysis.',
  mathsLearning:'I found that maximising the worst permitted outcome changes the mathematical objective, and that a discrete setting grid can reduce the tolerance achievable by a continuous model.',
  notationIssue:'I used c only for the actual cut, n for the nominal setting and δ for the error bound. I kept cm and cm³ distinct and used ≈ for rounded values.',
  presentationIssue:'I placed the fold diagram with the volume derivation and the short comparison tables with the decisions they support. Each graph has a defined domain and labelled quantities.',
  referencesIssue:'All starting values are disclosed as design assumptions. The numerical output is calculated from the displayed model, so I have not supplied invented measurement dates or source URLs.',
  draftComplete:'ready',
 },
 stages,
 figures:[
  {id:'geometry-tray-folds',tool:'geometry',stage:0,draft:sheet,after:'purpose'},
  {id:'figure-tray-full-volume',tool:'graph',stage:1,after:'result',draft:graph('Volume across the geometric domain',2,'x*(30-2*x)*(20-2*x)',0,10,0,1120,'The ideal model has an interior maximum; c = 0 and c = 10 are limiting degenerate cases.')},
  {id:'figure-tray-near-maximum',tool:'graph',stage:2,after:'result',draft:graph('Volume near the ideal maximum',3,'x*(30-2*x)*(20-2*x)',3.5,4.2,1045,1058,'The enlarged scale shows the shallow maximum. Feasibility also requires the actual height c to be at most 4 cm.')},
  {id:'table-tray-settings',tool:'table',stage:2,after:'interpretation',draft:table('Settings under a 1 mm common error',1,['Nominal setting','Actual cut range','Minimum volume','Maximum height','Fits height limit'],comparisonRows,['cm','cm',R`\mathrm{cm}^{3}`,'cm',''],'The error is common to all cuts; the 4.0 cm setting is infeasible at its upper endpoint.')},
  {id:'figure-tray-guaranteed',tool:'graph',stage:3,after:'result',draft:graph('Guaranteed volume on the feasible settings',4,'4*x^3-100*x^2+600.12*x-1-abs(1.2*x^2-20*x+60.004)',3.5,3.9,1040,1060,'W is the minimum over the full ±0.1 cm common-error interval, not the nominal volume.','n','W')},
  {id:'table-tray-threshold',tool:'table',stage:4,after:'result',draft:table('Error bounds for a 99% capacity target',2,['Setting n','Volume bound','Height bound','Allowed error'],thresholdRows,['cm','mm','mm','mm'],'Displayed bounds are rounded; I used unrounded values to compare the settings.')}
 ],
 sources:[{id:'source-tray-design',fields:sourceFields}],
 accuracy:[{id:'accuracy-tray-setting',quantity:'Common cut and fold setting',symbol:'c',unit:'cm',resolution:'0.1 cm nominal marking increment',
  policy:'Assumed common error ±0.1 cm; final allowable error thresholds rounded down.',reason:accuracyReason,sourceId:'source-tray-design'}],
 dataSets:[
  {name:'Tray design assumptions',columns:['Quantity','Value','Unit'],rows:[['Sheet length',30,'cm'],['Sheet width',20,'cm'],['Maximum height',4,'cm'],['Initial error bound',0.1,'cm'],['Nominal increment',0.1,'cm']],sourceText:provenance},
  {name:'Tray setting comparison',columns:['Nominal setting','Lower actual cut','Upper actual cut','Minimum volume','Fits height limit'],rows:[
   [3.7,3.6,3.8,1050.624,'Yes'],[3.8,3.7,3.9,1053.612,'Yes'],[3.9,3.8,4,1055.488,'Yes'],[4,3.9,4.1,1054.684,'No']
  ],sourceText:'Calculated endpoint comparisons for a common ±0.1 cm setting error.'},
  {name:'Tray checked mathematical results',columns:['Result','Value','Unit'],rows:[
   ['Ideal cut',idealCut,'cm'],['Ideal volume',idealVolume,'cm³'],['99% target',0.99*idealVolume,'cm³'],['Lower 99% cut',lower99,'cm'],
   ['Continuous maximum error',(4-lower99)/2,'cm'],['Continuous threshold setting',(4+lower99)/2,'cm'],['Grid maximum error',3.7-lower99,'cm'],
   ['Grid threshold setting',3.7,'cm'],['Original best setting',3.9,'cm'],['Original guaranteed volume',1055.488,'cm³']
  ],sourceText:'Values supporting the derivations; this working record is not a long table inserted in the IA.'}
 ],
 conclusion:{
  mainConclusion:R`For my specified \(30\text{ cm}\times20\text{ cm}\) sheet, \(4.0\text{ cm}\) height limit and common setting error bounded by \(1\text{ mm}\), I would choose a nominal cut of \(3.9\text{ cm}\). The nominal tray dimensions are \(22.2\text{ cm}\times12.2\text{ cm}\times3.9\text{ cm}\). Every allowed common error keeps the actual height at or below \(4.0\text{ cm}\), and the model guarantees approximately \(1055.5\text{ cm}^3\), or \(99.9226\%\) of the ideal maximum. The attainable-bound argument shows that no other feasible setting can guarantee more under these assumptions.

The exact optimum, approximately \(3.9237\text{ cm}\), established a useful benchmark. Its nearest permitted mark is \(3.9\text{ cm}\), but the interval argument was needed to establish that this same setting maximises guaranteed capacity. The convenient whole-centimetre trial of \(4.0\text{ cm}\) preserves almost all nominal capacity but could breach the height limit.`,
  conclusionBenefit:R`My investigation showed why the meaning of “best” matters: finding an exact maximum, comparing permitted settings and maximising guaranteed capacity require different arguments. It also quantified the importance of the error assumption. Retaining at least \(99\%\) of ideal capacity is possible with a common error up to about \(2.158\text{ mm}\) on the prescribed marking grid, provided I change the nominal setting to \(3.7\text{ cm}\). That threshold is smaller than the continuous benchmark of about \(2.579\text{ mm}\).

These are mathematical guarantees inside a zero-thickness, rectangular-tray, common-error model. They do not measure the reliability of a cutting process or establish the usable capacity of a physical tray. In particular, I cannot transfer the result unchanged to four independent corner errors.`,
  conclusionExtension:R`I would next model unequal corner errors and finite card thickness. The first question would be whether the four sides can still meet at right angles; only after resolving that geometry would it make sense to optimise interior capacity. Measuring a few constructed trays could then test whether the common-setting model and its stated error bound are adequate for actual use.`
 },
 reviews:[
  {id:'D01',location:'Introduction, five mathematical sections and conclusion',note:'I have included the defined design, worked mathematics, interpretation, figures and a conclusion answering the original decision.',action:'My content review does not claim a school submission or teacher approval.'},
  {id:'D02',location:'Transitions between the five mathematical sections',note:'Each question follows from the preceding result: model, ideal maximum, error interval, guaranteed optimum and tolerance threshold.',action:'I removed repeated summaries from the mathematical working and kept the final recommendation in the conclusion.'},
  {id:'D03',location:'Definitions and all equations, graphs and tables',note:'I distinguished actual cut c, nominal setting n and error bound δ; I stated domains and used cm³ for volume.',action:'I checked exact equalities separately from rounded numerical values and identified the enlarged graph scales.'},
  {id:'D04',location:'Choice of objective and final tolerance comparison',note:'My decision to optimise a guaranteed volume, then compare continuous and discrete settings, establishes both a justified design and its allowable error.',action:'I distinguish the 4.0 cm whole-centimetre trial from the nearest permitted mark of 3.9 cm, and explain why 3.7 cm belongs only to the larger-tolerance question.'},
  {id:'D05',location:'Interpretations after each result',note:'I connect the shallow optimum, height margin and marking-grid restriction to their consequences for the design.',action:'I keep the common-error limitation beside the first interval calculation and again qualify the final guarantee.'},
  {id:'D06',location:'Derivative, attainable-bound proof and target-volume inequality',note:'The polynomial algebra, differentiation and inequalities all answer the stated design question. I checked the geometric domain before choosing an optimum.',action:'I checked the second derivative, the monotonicity argument and the two grid settings surrounding the continuous tolerance optimum.'},
  {id:'D07',location:'Complete reader, PDF and Word document',note:'I checked the equations, fold diagram, function plots and short comparison tables at normal reading size. The figures appear with the calculations they support, and the table headings distinguish the volume and height bounds.',action:'I checked the exported pages for clipped equations and captions and used concise table headings so the four columns remain readable.',status:'checked'},
  {id:'D09',location:'Starting-material paragraph and source note',note:'The sheet, clearance and tolerance are explicitly constructed inputs. My equations and figures are derived from them, with no external dataset or borrowed image.',action:'I have not added fictional measurement dates, references or source URLs.'},
  {id:'D11',location:'All five mathematical sections',note:'I have shown the volume derivation, derivative roots, interval calculations, proof of the guaranteed optimum and numerical threshold with its bracket.',action:'I checked that each result is completed mathematics rather than a promise to calculate it later.'},
  {id:'D19',location:'Figures 1–4 and Tables 1–2',note:'The figures sit with their mathematical explanations, and the displayed tables contain only the settings needed for the two decisions.',action:'The longer working-results record is available as project data rather than inserted as a large table.'},
  {id:'D20',location:'Volume graphs and final numerical root',note:'I state the function and numerical equation entered, interpret the outputs and check the threshold by a sign-changing bracket.',action:'The proofs establish the optima; I do not treat a software graph or solver output as a proof.'}
 ],
 references:[{label:'Design and mathematical source',value:'My explicitly constructed tray scenario and the derivations displayed in this investigation. No external measurements, illustrations, quotations or datasets are used.'}]
};
