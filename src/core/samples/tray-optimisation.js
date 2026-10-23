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
const aim=R`I want to choose a nominal corner-cut setting for a tray made from a \(30\text{ cm}\times20\text{ cm}\) sheet that gives the greatest guaranteed volume while keeping its height at or below \(4.0\text{ cm}\). I will allow a common setting error of up to \(1\text{ mm}\) and use nominal settings marked in \(1\text{ mm}\) steps. I will then qualify that decision by finding how large the error bound could become if I accepted a loss of at most \(1\%\) of the ideal capacity and could choose a different nominal setting.`;
const definitions=R`I use \(n\) for the nominal setting I choose and \(c\) for the actual common corner-cut size. Their difference is the setting error \(\varepsilon=c-n\), so \(c=n+\varepsilon\). All three lengths are in centimetres. I write \(\delta\) for the nonnegative bound on the error: \(|\varepsilon|\le\delta\) means that the actual cut lies between \(n-\delta\) and \(n+\delta\). The tray height is \(c\), and its modelled volume is \(V(c)\), in \(\text{cm}^3\). For the initial fixed bound \(\delta=0.1\text{ cm}\), I call the smallest possible volume at setting \(n\) its guaranteed volume, \(W(n)\).`;
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
 methodReason:R`Rectangular geometry links the competing effects of a larger cut: greater height and a smaller base. I can derive the volume from those dimensions, then use its rate of change to establish an exact benchmark before introducing an error interval.`,
 methodLimitation:'The common-setting model keeps the tray rectangular. Four unequal corner errors could produce incompatible folds, so this model does not describe every possible cutting mistake.',
 limitationConsequence:'My guaranteed volume applies to the stated geometric and common-error assumptions. It is not a tested guarantee of usable capacity in a real folded-card tray.',
 limitationMitigation:'I state the assumptions before calculating, preserve them through each comparison and separate a future independent-corner-error investigation from the results proved here.',
 limitationAcceptable:'The model answers my stated mathematical design question. It would need physical measurements and a revised geometry before I used it as a manufacturing specification.',
 dataAimLink:R`The starting quantities define a design problem rather than a dataset to fit. To choose a setting, I first need a function that converts each possible actual cut into capacity; only then can I compare what different settings guarantee.`
};

const stages=[
 {
  key:'volume-model',title:'Connecting the cuts to the tray volume',bridge:R`I began with the actual cut, because it determines the dimensions regardless of which nominal mark produced it.`,
  purpose:R`Figure 1 shows the four corner squares to remove and the fold lines of the remaining sheet. Its illustrated value \(c=3.9\text{ cm}\) makes the layout visible; the derivation below keeps \(c\) variable.`,
  technique:'Rectangular geometry and polynomial modelling',methodId:'algebra',kind:'model',knowledge:'syllabus',
  result:R`The base has length \(30-2c\), width \(20-2c\), and height \(c\). Therefore
\[V(c)=c(30-2c)(20-2c).\]
Expanding gives
\[V(c)=4c^3-100c^2+600c.\]
Each dimension must be positive. The width gives the strongest upper restriction, \(20-2c>0\), so a non-degenerate tray requires \(0<c<10\). My design also requires \(c\le4\), but I first examine the wider geometric domain to find the ideal capacity against which to judge that restriction.

For example, a \(3\text{ cm}\) cut gives a \(24\text{ cm}\times14\text{ cm}\) base and \(V(3)=1008\text{ cm}^3\). A \(4\text{ cm}\) cut gives \(V(4)=4\times22\times12=1056\text{ cm}^3\), whereas \(V(5)=5\times20\times10=1000\text{ cm}^3\). Thus increasing the height does not necessarily increase capacity.`,
  interpretation:R`A cut near \(4\text{ cm}\) is promising. The product explains why: increasing \(c\) improves the height factor but reduces both base factors, so choosing the tallest geometric tray would not maximise its volume.`,
  limitations:R`The \(5\text{ cm}\) trial already exceeds my height limit; I use it only to examine the descending side of the unrestricted model. Three selected values still leave all the cuts between them unresolved.`,
  localTakeaway:R`I obtained \(V(c)=4c^3-100c^2+600c\) on \(0<c<10\), with \(V(4)>V(3)\) and \(V(4)>V(5)\). This suggests an interior maximum that needs a continuous calculation.`,
  nextQuestion:'I therefore need to locate the point where increasing the cut stops increasing the volume.',
  nextWhy:'Differentiating the model will identify that change continuously, so a high value in a short table is not mistaken for the maximum.',
  mathsInsight:'The height and base dimensions cannot be optimised independently because all three depend on the same cut.',
  methodChangeReason:'I moved from evaluating selected cases to differentiating the volume function so that I could locate and justify its continuous maximum.',
  outcomeId:'stationary'
 },
 {
  key:'ideal-maximum',title:'Finding the ideal maximum and judging its precision',
  bridge:R`For this benchmark I temporarily assume that the chosen cut is made exactly. The derivative \(V'(c)\) gives the change in volume per unit increase in cut size; its sign tells me where a larger cut helps.`,
  purpose:R`I look for a zero derivative, then check the sign on both sides and the geometric boundaries. Figure 2 places this calculation on the full volume curve.`,
  technique:'Differentiation, stationary points and domain checks',methodId:'optimisation',kind:'calculus',knowledge:'syllabus',
  result:R`Differentiating gives
\[V'(c)=12c^2-200c+600.\]
Solving \(V'(c)=0\) gives
\[c=\frac{25\pm5\sqrt7}{3}.\]
I name the smaller root \(c_*=(25-5\sqrt7)/3\approx3.9237478\text{ cm}\). The other is approximately \(12.7429\text{ cm}\), outside \(0<c<10\). Within the domain, \(V'\) is positive before \(c_*\) and negative after it: volume increases to this cut and decreases afterwards. Also, \(V(c)\) tends to zero as \(c\) approaches either \(0\) or \(10\). These checks establish the global maximum.

Substitution gives
\[V(c_*)\approx1056.3059\text{ cm}^3.\]
My initial whole-centimetre trial of \(4.0\text{ cm}\) loses only
\[\frac{V(c_*)-V(4)}{V(c_*)}\times100\%\approx0.0290\%.\]
As a second check, \(V''(c)=24c-200\) and \(V''(c_*)=-40\sqrt7<0\): the slope is decreasing through zero there, consistent with a maximum.`,
  interpretation:R`The exact optimum is already below \(4\text{ cm}\), so the height restriction alone would not change it. Its nearest permitted \(0.1\text{ cm}\) mark is \(3.9\text{ cm}\), with \(V(3.9)=1056.276\text{ cm}^3\), slightly more than \(V(4.0)=1056\text{ cm}^3\). Thus the whole-centimetre trial is close in capacity but is not even the nearest available mark.`,
  limitations:R`Those values assume exact cuts. A nominal setting can have an attractive capacity while its positive error makes the tray too tall, and rounding \(c_*\) does not check this.`,
  localTakeaway:R`The ideal optimum is \(c_*=(25-5\sqrt7)/3\), with volume approximately \(1056.3059\text{ cm}^3\). The nearest permitted mark is \(3.9\text{ cm}\); I still need to justify its feasibility and performance under the stated error.`,
  nextQuestion:'I now replace each nominal capacity by the full interval of actual cuts allowed by the 1 mm error.',
  nextWhy:'Checking both the height and the smallest volume over that interval will turn the exact benchmark into a candidate design for my stated conditions.',
  mathsInsight:'A mathematically exact optimum and a useful practical setting answer different questions.',
  methodChangeReason:'I replaced a single exact cut with an interval around a nominal setting so that the stated error and height restriction could affect the decision.',
  outcomeId:'flat-optimum'
 },
 {
  key:'error-interval',title:'Including the height limit and a common setting error',
  bridge:R`With \(\delta=0.1\text{ cm}\), choosing \(n\) allows every actual cut in \([n-0.1,n+0.1]\). I must therefore check the highest possible tray, rather than just its nominal height.`,
  purpose:R`I use the height restriction to identify feasible settings, then compare the least volume each can produce. Figure 3 shows the shallow peak and Table 1 records the nearby candidates.`,
  technique:'Interval constraints and sensitivity comparisons',methodId:'optimisation',kind:'model',knowledge:'mixed',
  result:R`The largest allowed cut must be at or below \(4.0\text{ cm}\), giving
\[n+0.1\le4,\qquad n\le3.9.\]
The smallest cut must remain positive: \(n-0.1>0\). Thus \(0.1<n\le3.9\), with \(n\) a multiple of \(0.1\text{ cm}\). Equality at the height limit is permitted in my specification.

At \(n=3.9\), the possible actual cuts range from \(3.8\) to \(4.0\text{ cm}\). The function increases to \(c_*\) and then decreases, so an interior point cannot give the smallest volume on this interval. I only need to compare the two endpoint values:
\[V(3.8)=1055.488,\qquad V(4.0)=1056\]
in cubic centimetres. The smaller is \(1055.488\text{ cm}^3\). Every allowed cut produces at least this volume, and the allowed cut \(c=3.8\) attains it, so this is exactly \(W(3.9)\). It is approximately \(99.9226\%\) of the ideal maximum. The nominal dimensions are \(22.2\text{ cm}\times12.2\text{ cm}\times3.9\text{ cm}\).

For comparison, \(n=3.8\) guarantees \(V(3.7)=1053.612\text{ cm}^3\), and \(n=3.7\) guarantees \(V(3.6)=1050.624\text{ cm}^3\). The \(4.0\text{ cm}\) setting reaches \(4.1\text{ cm}\), so I reject it even though its nominal volume is attractive.`,
  interpretation:R`The candidate \(n=3.9\text{ cm}\) loses only about \(0.0774\%\) of ideal capacity in its least favourable allowed case. The volume limit comes from the smaller cut, while the height limit comes from the larger one; looking at only one direction of error would miss part of the decision.`,
  limitations:R`This is an absolute bound for one common setting, such as a cutting-and-folding template. I have not estimated how often a process stays within it, and the calculation does not describe four independently misplaced corners.`,
  localTakeaway:R`Among the nearby settings, \(n=3.9\text{ cm}\) is feasible and guarantees \(1055.488\text{ cm}^3\) under the common \(\pm0.1\text{ cm}\) error model. A nominal \(4.0\text{ cm}\) cut is infeasible.`,
  nextQuestion:'The nearby comparison makes 3.9 cm a strong candidate, but it leaves the other feasible settings unchecked.',
  nextWhy:'I next seek a bound on every setting’s guaranteed volume. If 3.9 cm attains that bound, the design decision will be proved without a long search.',
  mathsInsight:'The least favourable endpoint depends on the volume curve; a larger actual cut is not always a worse error.',
  methodChangeReason:'I turned the numerical comparison into an optimisation of the minimum volume over each error interval.',
  outcomeId:'real-world',
  unfamiliarComponent:'Replacing an exact capacity by the least volume over a common-error interval and justifying why endpoint evaluation is sufficient.',
  knowledgeNotes:'The printed calculation derives both feasibility inequalities, uses the increase-then-decrease shape to locate the minimum at an endpoint, and explains why the attained minimum is a guarantee for every allowed error.',
  understandingExample:R`At \(n=3.9\), the endpoint volumes are \(V(3.8)=1055.488\) and \(V(4)=1056\text{ cm}^3\). The lower value is attained and no interior cut is worse, so \(W(3.9)=1055.488\text{ cm}^3\).`,
  researchSource:''
 },
 {
  key:'guaranteed-optimum',title:'Proving the best guaranteed design',
  bridge:R`I have a feasible design that guarantees \(1055.488\text{ cm}^3\). To prove it is best, I need to show that no feasible design can guarantee a larger amount.`,
  purpose:R`I write the minimum explicitly as a function of the nominal setting. Here “minimum” means the least volume among all cuts allowed by the error, not their average or just the nominal capacity.`,
  technique:'Maximising a lower bound using monotonicity',methodId:'optimisation',kind:'calculus',knowledge:'mixed',
  result:R`For \(0.1<n\le3.9\), the definition is
\[W(n)=\min_{|\varepsilon|\le0.1}V(n+\varepsilon).\]
The subscript asks me to include every error from \(-0.1\) to \(+0.1\text{ cm}\). Each resulting volume is at least \(W(n)\), so \(W(n)\) is a lower bound on what that setting produces.

To compare settings, I instead need an upper bound on \(W(n)\). The error \(\varepsilon=-0.1\) is always allowed. The least volume cannot exceed this particular outcome, giving
\[W(n)\le V(n-0.1).\]
Every feasible setting satisfies \(0<n-0.1\le3.8<c_*\). Volume increases on this entire range, so
\[W(n)\le V(n-0.1)\le V(3.8)=1055.488.\]
The previous endpoint calculation showed \(W(3.9)=1055.488\). Thus every feasible design is bounded above by a value that \(n=3.9\) actually attains. This proves the global optimum, including all the prescribed ruler marks because \(3.9\) is one of them.

For Figure 4 I use the equivalent endpoint form
\[W(n)=\min\{V(n-0.1),V(n+0.1)\}.\]
The braces ask for the smaller of two numbers. This works throughout the feasible range: \(V\) increases then decreases, with no interior minimum, so the least value on any error interval occurs at an endpoint.

The graph displays an absolute-value expression for this same function. To trace it, let \(A=V(n-0.1)\) and \(B=V(n+0.1)\). Then
\[\min(A,B)=\frac{A+B-|A-B|}{2}.\]
If \(A\le B\), the absolute difference is \(B-A\), and this expression reduces to \(A\); the other ordering gives \(B\). Expanding the two cubic endpoint values gives
\[\frac{A+B}{2}=4n^3-100n^2+600.12n-1,\]
\[\frac{B-A}{2}=1.2n^2-20n+60.004.\]
Subtracting the absolute value of the second expression from the first therefore produces the plotted \(W\). The graph illustrates the bound already proved.`,
  interpretation:R`My best nominal setting lies at the boundary \(n=3.9\), even though the exact-volume optimum was an interior point. Positive error reserves \(0.1\text{ cm}\) of height margin and creates this new boundary. The answer matches the nearest mark to \(c_*\), but the attained-bound argument supplies the justification that rounding could not.`,
  limitations:R`This proof keeps the error bound fixed at \(1\text{ mm}\). It does not show that the same setting remains feasible if the bound grows: \(3.9\text{ cm}\) already uses all its permitted height margin.`,
  localTakeaway:R`For every feasible nominal setting, \(W(n)\le1055.488\text{ cm}^3\), with equality at \(n=3.9\text{ cm}\). Thus \(3.9\text{ cm}\) is the best guaranteed-volume design for the specified \(1\text{ mm}\) common error.`,
  nextQuestion:'The fixed-error decision is now solved. I will qualify it with the 99% capacity criterion stated at the outset.',
  nextWhy:'Allowing at most a 1% loss gives a precise way to ask how much larger the error bound could become if I also changed the nominal setting.',
  mathsInsight:'An attainable upper bound can prove a constrained optimum without differentiating a complicated minimum function.',
  methodChangeReason:'Having solved the fixed-error problem, I varied its error bound to test how much tolerance is compatible with a stated near-optimal capacity.',
  outcomeId:'boundary',
  unfamiliarComponent:'Defining a minimum over an error interval, proving its maximum through an attained bound, and rewriting an endpoint minimum using absolute value.',
  knowledgeNotes:'The printed proof distinguishes a lower bound on the outcomes of one setting from an upper bound on what any setting can guarantee. It explains the inequality directions and derives the minimum identity and both polynomial parts shown in the native graph.',
  understandingExample:R`The allowed error \(-0.1\) gives \(W(n)\le V(n-0.1)\le V(3.8)\). Since \(n=3.9\) attains that limit, no other feasible setting can guarantee more. For \(A\le B\), \((A+B-|A-B|)/2=(A+B-(B-A))/2=A\).`,
  researchSource:''
 },
 {
  key:'tolerance-threshold',title:'Finding the error threshold for a 99% capacity target',
  bridge:R`I now allow \(\delta\) to vary, while keeping the sheet, height limit and nominal marks unchanged. A different nominal setting is permitted; the requirement is that every allowed error preserves at least \(99\%\) of the ideal volume.`,
  purpose:R`I first find the acceptable range of actual cuts. Then I fit the widest possible symmetric error interval inside that range, finally checking the prescribed ruler marks in Table 2.`,
  technique:'Polynomial inequality, numerical root finding and discrete choices',methodId:'optimisation',kind:'algebra',knowledge:'mixed',
  result:R`Writing \(T\) for the target volume,
\[T=0.99V(c_*)\approx1045.7428365\text{ cm}^3.\]
I need the lower cut at which \(V(c)\) first reaches \(T\). I name it \(a\) and solve \(V(c)-T=0\) on the increasing part of the curve. At \(c=3\) the difference is negative, and at \(c=3.9\) it is positive. I repeatedly halve this interval, evaluate the difference at the midpoint and keep the half whose endpoint signs differ. Continuity keeps a root inside each retained interval; the increasing volume makes that root unique there.

For a reproducible check, the retained crossing lies between \(3.4841\) and \(3.4842\):
\[V(3.4841)-T\approx-0.0048156,\]
\[V(3.4842)-T\approx+0.0000686\]
in cubic centimetres. Continuing the calculation gives \(a\approx3.484198595\text{ cm}\). Volume rises from \(T\) at \(a\) to the maximum and then falls to \(V(4)=1056>T\). Therefore every actual cut in \([a,4]\), and no smaller positive cut, meets both the capacity target and the height restriction.

The error interval \([n-\delta,n+\delta]\) stays inside \([a,4]\) exactly when
\[n-\delta\ge a,\qquad n+\delta\le4,\]
or equivalently
\[a+\delta\le n\le4-\delta.\]
For any setting to satisfy both inequalities, the left bound cannot exceed the right: \(2\delta\le4-a\). At equality the interval fills the available range, so its centre gives
\[\delta_{\rm continuous}=\frac{4-a}{2}\approx0.257900702\text{ cm},\]
\[n=\frac{4+a}{2}\approx3.742099298\text{ cm}.\]
This proves the continuous limit, but its nominal setting is not on my \(0.1\text{ cm}\) grid.

For an available setting inside \([a,4]\), the two distances to the acceptable boundaries are \(n-a\) and \(4-n\). The error cannot exceed either distance, so
\[\delta_{\max}(n)=\min\{n-a,4-n\}.\]
To the left of the midpoint \((4+a)/2\), the smaller distance is \(n-a\), which increases with \(n\). To the right it is \(4-n\), which decreases. Thus every grid mark farther from the midpoint on either side loses to the adjacent mark on that side. Only \(3.7\) and \(3.8\) can win.

Those settings allow respectively \(0.215801405\text{ cm}\) and \(0.2\text{ cm}\). The largest grid-compatible bound is therefore approximately \(2.158\text{ mm}\), at \(n=3.7\text{ cm}\). A conservative limit stated to one decimal place in millimetres is \(2.1\text{ mm}\), not \(2.2\text{ mm}\), because rounding the maximum upwards would permit cuts below the capacity threshold.`,
  interpretation:R`The marking grid reduces the continuous tolerance of about \(2.579\text{ mm}\) to about \(2.158\text{ mm}\). This does not replace my original recommendation: \(3.9\text{ cm}\) maximises guaranteed volume for the fixed \(1\text{ mm}\) bound, while \(3.7\text{ cm}\) maximises the bound I can tolerate after accepting a \(1\%\) capacity loss. Keeping \(3.9\text{ cm}\) when the error increases would breach the height limit.`,
  limitations:R`The threshold remains conditional on the common-error model. I have not assigned probabilities to errors or claimed that \(99\%\) of actual trays will succeed: \(99\%\) refers to retained capacity, and the claim concerns every error in the specified interval.`,
  localTakeaway:R`A \(0.1\text{ cm}\) nominal-setting grid permits at most about \(2.158\text{ mm}\) common error while guaranteeing \(99\%\) of ideal capacity and height at most \(4\text{ cm}\). The unrestricted continuous bound is larger and is not an available ruler setting.`,
  nextQuestion:'I can now conclude: the original setting is proved best for the specified error, and the tolerance calculation states how that decision changes when less capacity is acceptable.',
  nextWhy:'Both parts of my design question are answered within the stated geometry and common-error assumptions.',
  mathsInsight:'The best continuous tolerance need not be attainable when the decision variable is restricted to a discrete set.',
  methodChangeReason:'I separated the continuous benchmark from the actual marking grid; treating them as interchangeable would overstate the allowable error.',
  outcomeId:'real-world',
  unfamiliarComponent:'Using a sign-changing numerical bracket to locate the capacity threshold, then proving a continuous interval limit and the best discrete setting.',
  knowledgeNotes:'The printed working explains interval halving and why continuity and increase identify the unique root. It derives both endpoint constraints, the continuous midpoint limit, and why only the two adjacent ruler marks need comparison. The 99% capacity preference is separate from a success probability.',
  understandingExample:R`The opposite signs at \(3.4841\) and \(3.4842\) enclose \(a\). At \(n=3.7\), the volume margin is about \(0.215801405\text{ cm}\), smaller than the \(0.3\text{ cm}\) height margin. At \(n=3.8\), the \(0.2\text{ cm}\) height margin is limiting, so \(3.7\) permits the larger error.`,
  researchSource:''
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
  mathsOutside:'outside',course:'AA SL',courseSuitability:'yes',
  mathsRevisedWhy:'Polynomial modelling and differentiation provide the course core. I will explain the additional interval-minimum argument, attained bound, absolute-value graph expression, numerical bracketing and discrete midpoint comparison in the investigation itself.',
  prediction:R`I expect a cut near \(4\text{ cm}\) to give a large volume, but a slightly smaller nominal setting may be better once the \(4\text{ cm}\) height limit and positive setting error are included.`,
  predictionWhy:'Tiny cuts give little height, while large cuts leave a narrow base; an intermediate cut should balance the two effects.',
  predictionImplication:'If the volume is fairly flat near its maximum, I may be able to gain clearance with little loss of capacity.',
  firstAction:'Derive the product for the volume and establish the positive-dimension domain.',
  firstAccuracy:accuracyReason,
  teacherQuestion:'Is the progression from exact optimisation to a guaranteed design and a discrete tolerance threshold sufficiently focused for my course?',
  teacherSafeAction:'I can define the model and check its algebra without claiming a teacher has approved its scope.',
  universalTeacherQuestion:'Does the final guarantee make clear which geometric assumptions it depends on?'
 },
 introduction:R`I am interested in whether a mathematically optimal design is also useful to make. Reporting a cut to several decimal places seems unhelpful if a small error changes whether the finished object fits its space. I chose an open tray because increasing its height necessarily reduces its base, creating a trade-off I can describe geometrically.

My constructed scenario uses a \(30\text{ cm}\times20\text{ cm}\) sheet and permits a tray height at or below \(4.0\text{ cm}\), including equality. I want the nominal corner-cut setting that gives the greatest guaranteed volume when one common setting error can be as large as \(1\text{ mm}\) in either direction. Nominal settings are available in \(1\text{ mm}\) steps. These are specified inputs, not measurements from a tray I have manufactured.

After choosing the best setting for that error bound, I will ask how large the error could become if I were willing to retain at least \(99\%\) of the ideal capacity and could change the setting. I chose \(99\%\) to give “nearly optimal” a precise meaning: I am willing to trade at most \(1\%\) of capacity for greater tolerance. This is my design preference, not an established requirement or a claim about the percentage of trays that succeed.`,
 dataNotes:[R`I conceptually remove equal corner squares and fold the remaining sides at right angles. Negligible sheet thickness and vertical walls make the result a rectangular prism. The sheet dimensions and height limit are exact specifications within this model; I have not estimated them from a ruler.`,
 definitions,
 R`One common setting controls all four corners, so the same error changes every cut equally. I separately assume the initial error bound \(\delta=0.1\text{ cm}\); the \(0.1\text{ cm}\) spacing of marks does not establish that accuracy. I have not assigned probabilities to the possible errors or assumed that four independent cutting mistakes would be identical.

I retain unrounded calculations when comparing designs, display rounded results with approximation signs and report final volumes to \(0.1\text{ cm}^3\). An allowable error will be rounded down if it must be stated on a coarser scale, so reporting does not enlarge the proved limit.`].join('\n\n'),

 completion:{
  ...sourceFields,changedSincePlanning:'I kept the sheet, height limit and common-error model fixed. I extended the final calculation to distinguish continuous settings from the prescribed marking grid.',
  permissionStatus:'not-needed',permissionNotes:'No participant data, restricted source or physical trial is used in this mathematical design scenario.',
  courseConcern:'The tailored guarantee and discrete tolerance arguments extend the routine optimisation. I define their notation and derive each step in the printed narrative so that the reader can follow them without prior knowledge of these methods.',
  firstMathsBridgePlacement:'before',
  firstPurpose:R`How does the actual common cut \(c\) determine the tray volume and its feasible domain?`,
  firstMethodEvaluation:'The diagram checks which lengths belong in the model. The graphs will show the resulting shape, while the derivative and interval arguments must establish the decisions between plotted values.',
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
  courseWhy:'The core is polynomial modelling and differentiation. I develop it through explicitly derived interval bounds and a discrete tolerance decision, explaining the additional arguments where they are used.',
  mathsLearning:'I distinguish a lower bound on the outcomes of one setting from an upper bound on every setting’s guarantee. I derive the absolute-value minimum, explain numerical bracketing, and use increasing and decreasing boundary margins to justify the discrete tolerance choice.',
  notationIssue:'I used c only for the actual cut, n for the nominal setting and δ for the error bound. I kept cm and cm³ distinct and used ≈ for rounded values.',
  presentationIssue:'The six existing native figures and their placement are retained. Fresh reader, PDF and Word presentation review is pending after this narrative revision.',
  referencesIssue:'All starting values are disclosed as design assumptions. The numerical output is calculated from the displayed model, so I have not supplied invented measurement dates or source URLs.',
  draftComplete:'ready',
  finalProofread:'I have checked the revised argument and independently recalculated its principal values. A fresh complete-reader and all-page PDF and Word proofread is pending; I have not recorded a peer or teacher review.',
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
  mainConclusion:R`For the specified \(30\text{ cm}\times20\text{ cm}\) sheet, height at most \(4.0\text{ cm}\) and common error bounded by \(1\text{ mm}\), I would choose \(n=3.9\text{ cm}\). Its nominal dimensions are \(22.2\text{ cm}\times12.2\text{ cm}\times3.9\text{ cm}\). Every allowed cut lies between \(3.8\) and \(4.0\text{ cm}\), and the smallest modelled volume is \(1055.488\text{ cm}^3\), approximately \(1055.5\text{ cm}^3\) or \(99.9226\%\) of the ideal maximum. No other feasible setting can guarantee more, because the bound on every design is attained by this one.

The exact optimum \(c_*\approx3.9237\text{ cm}\) provided the capacity benchmark. Rounding it suggested the same nominal mark, but only the interval argument established feasibility and the greatest guaranteed capacity. The \(4.0\text{ cm}\) whole-centimetre trial was close in nominal volume yet could produce a tray that was too tall.`,
  conclusionBenefit:R`The sensitivity calculation qualifies this recommendation. If I accept at most a \(1\%\) loss from ideal capacity, the prescribed marks permit a common error bound of about \(2.158\text{ mm}\), provided I choose \(n=3.7\text{ cm}\). A conservatively reported limit is \(2.1\text{ mm}\). The continuous benchmark of about \(2.579\text{ mm}\) is unavailable on this marking grid. Thus the setting for greatest guaranteed volume at the original accuracy differs from the setting for greatest tolerance at the relaxed capacity target.

These are mathematical guarantees within an exact-sheet, zero-thickness, rectangular-tray and common-error model. They neither establish how accurate a physical cutting process is nor measure a manufactured tray’s usable capacity. In particular, the result cannot be transferred unchanged to independent corner errors.`,
  conclusionExtension:R`A focused next investigation would replace the one common cut with four independently bounded corner cuts. I would first determine which combinations permit compatible rectangular folds; only after resolving that geometry could I define and optimise an interior volume. This would test the assumption most directly responsible for reducing the present problem to one variable.`
 },

 reviews:[
  {id:'D01',location:'Introduction, five mathematical sections and conclusion',note:'I have included the defined design, worked mathematics, interpretation, figures and a conclusion answering the original decision.',action:'My content review does not claim a school submission or teacher approval.'},
  {id:'D02',location:'Transitions between the five mathematical sections',note:'The narrative follows the actual findings from geometry to an exact benchmark, an interval guarantee, its optimum and the 99% tolerance qualification.',action:'I use connected statements at the section boundaries and close the final stage before one focused extension in the conclusion.'},
  {id:'D03',location:'Starting-material definitions and all equations, graphs and tables',note:'I define c, n, ε, δ, V and W in the printed investigation, then explain the minimum notation, absolute-value identity and numerical bracket where they first appear.',action:'I distinguish actual from nominal lengths, state the inclusive height restriction, and separate exact values from approximations.'},
  {id:'D04',location:'Choice of objective and final tolerance comparison',note:'My decision to optimise a guaranteed volume, then compare continuous and discrete settings, establishes both a justified design and its allowable error.',action:'I distinguish the 4.0 cm whole-centimetre trial from the nearest permitted mark of 3.9 cm, and explain why 3.7 cm belongs only to the larger-tolerance question.'},
  {id:'D05',location:'Interpretations after each result',note:'I connect the shallow optimum, height margin and marking-grid restriction to their consequences for the design.',action:'I keep the common-error limitation beside the first interval calculation and again qualify the final guarantee.'},
  {id:'D06',location:'Derivative, attained-bound proof and target-volume inequality',note:'The polynomial model, derivative and tailored interval arguments answer the two stated design decisions. The additional methods are explained in the main narrative.',action:'I independently recalculated the endpoint volumes, root bracket, continuous limit and grid choices; I also checked the algebra behind the plotted minimum.'},
  {id:'D07',location:'Complete reader, PDF and Word document',note:'Fresh presentation review is pending for the revised narrative, including its longer minimum-function explanation and numerical bracket.',action:'I still need to inspect the reader at desktop and phone widths and every exported PDF and Word page for equation, figure, table and page-break issues.',status:'unchecked'},
  {id:'D09',location:'Starting-material paragraph and source note',note:'The sheet, clearance and tolerance are explicitly constructed inputs. My equations and figures are derived from them, with no external dataset or borrowed image.',action:'I have not added fictional measurement dates, references or source URLs.'},
  {id:'D11',location:'All five mathematical sections',note:'I show the volume derivation, derivative roots, interval calculations, attained-bound proof, absolute-value graph identity and numerical threshold with its bracket.',action:'The continuous and discrete tolerance arguments are derived in printed fields rather than left only in learning notes.'},
  {id:'D19',location:'Figures 1–4 and Tables 1–2',note:'The figures sit with their mathematical explanations, and the displayed tables contain only the settings needed for the two decisions.',action:'The longer working-results record is available as project data rather than inserted as a large table.'},
  {id:'D20',location:'Volume graphs and final numerical root',note:'I trace the plotted minimum back to its endpoint volumes and explain repeated interval halving for the target-volume crossing.',action:'The proofs establish the optima; the graph and numerical solver support the calculations without replacing those arguments.'}
 ],
 references:[{label:'Design and mathematical source',value:'My explicitly constructed tray scenario and the derivations displayed in this investigation. No external measurements, illustrations, quotations or datasets are used.'}]
};
