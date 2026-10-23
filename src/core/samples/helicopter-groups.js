import {newStatDraft} from '../../diagrams/stat-studio-core.js';
import {newTableDraft} from '../../diagrams/table-studio-core.js';
import {SOURCE_FIELDS} from '../../completing/evidence-links.js';

/**
 * Fixed constructed flight log. An object is one helicopter, not one drop.
 * The three integers are elapsed video frames in three separate drops.
 * Nothing in this file is a record of an actual flight or a random sample.
 */
export const HELICOPTER_FRAME_RATE=50;
export const HELICOPTER_USEFUL_GAIN=0.20;
export const HELICOPTER_CASES=Object.freeze([
 ['A01','A',88,93,95],['A02','A',87,82,83],['A03','A',97,105,98],
 ['A04','A',89,85,90],['A05','A',101,108,109],['A06','A',98,93,91],
 ['A07','A',80,85,81],['A08','A',104,98,104],['A09','A',87,91,92],
 ['A10','A',101,99,94],['A11','A',85,84,89],['A12','A',100,93,95],
 ['B01','B',99,107,109],['B02','B',98,89,95],['B03','B',114,125,118],
 ['B04','B',102,95,103],['B05','B',102,113,112],['B06','B',95,87,88],
 ['B07','B',133,142,148],['B08','B',99,109,101],['B09','B',118,109,118],
 ['B10','B',92,99,100],['B11','B',119,108,109],['B12','B',104,112,105]
].map(([id,design,...frames])=>Object.freeze({id,design,frames:Object.freeze(frames)})));
const R=String.raw;
const sum=values=>values.reduce((a,b)=>a+b,0);
const mean=values=>sum(values)/values.length;
const median=values=>{
 const sorted=[...values].sort((a,b)=>a-b),m=Math.floor(sorted.length/2);
 return sorted.length%2?sorted[m]:(sorted[m-1]+sorted[m])/2;
};
const f=(value,places=3)=>Number(value).toFixed(places);
const caseMean=item=>sum(item.frames)/(3*HELICOPTER_FRAME_RATE);
const groups=Object.fromEntries(['A','B'].map(design=>[design,HELICOPTER_CASES.filter(item=>item.design===design)]));
function summary(cases){
 const values=cases.map(caseMean),sorted=[...values].sort((a,b)=>a-b),m=Math.floor(values.length/2);
 const average=mean(values),q1=median(sorted.slice(0,m)),q3=median(sorted.slice(Math.ceil(values.length/2)));
 return {n:values.length,mean:average,median:median(values),q1,q3,iqr:q3-q1,
  sd:Math.sqrt(sum(values.map(value=>(value-average)**2))/(values.length-1)),
  min:sorted[0],max:sorted.at(-1)};
}
export const HELICOPTER_SUMMARIES=Object.freeze({A:Object.freeze(summary(groups.A)),B:Object.freeze(summary(groups.B))});
export const HELICOPTER_COMPARISONS=Object.freeze(groups.A.flatMap(a=>groups.B.map(b=>{
 // Integer arithmetic preserves equality at a threshold such as 0.20 s.
 const frameSumDifference=sum(b.frames)-sum(a.frames);
 return Object.freeze({aId:a.id,bId:b.id,frameSumDifference,difference:frameSumDifference/150});
})));
export const HELICOPTER_OMISSIONS=Object.freeze(HELICOPTER_CASES.map(omitted=>{
 const a=groups.A.filter(item=>item.id!==omitted.id),b=groups.B.filter(item=>item.id!==omitted.id);
 return Object.freeze({omitted:omitted.id,nA:a.length,nB:b.length,
  meanA:mean(a.map(caseMean)),meanB:mean(b.map(caseMean)),difference:mean(b.map(caseMean))-mean(a.map(caseMean))});
}));

const sourceId='source-helicopter-constructed-log';
const sourceText='Helicopter Flight Log v1: 24 constructed helicopters, each with three elapsed-frame counts at an assumed 50 frames per second; no physical flights were recorded.';
const aim='I want to compare the recorded three-drop mean flight times of designs A and B: does B gain at least 0.20 s on average, and how often does a uniformly chosen recorded B helicopter have that useful advantage over a uniformly chosen A helicopter?';
const definitions=R`I write \(F_{gik}\) for the elapsed-frame count for design \(g\), helicopter \(i\), drop \(k\), where \(g\in\{A,B\}\), \(i=1,\ldots,12\) and \(k=1,2,3\). The drop time is \(t_{gik}=F_{gik}/50\) seconds. My comparison unit is the helicopter's three-drop mean, \(x_{gi}=(t_{gi1}+t_{gi2}+t_{gi3})/3\). I use \(\bar x_A\) and \(\bar x_B\) for the means of the 12 helicopter means, and \(\Delta=\bar x_B-\bar x_A\) for their difference.`;
const sourceFields={
 dataStatus:'ready',actualSourceType:'secondary',actualSource:sourceText,
 sourceCitation:'Helicopter Flight Log v1. Original constructed teaching log supplied in the editable project, including all 72 elapsed-frame counts and the helicopter IDs.',
 actualMethod:'I used the supplied constructed flight log. Its scenario specifies two complete paper designs, 12 distinct helicopters of each design and three drops per helicopter from 2.00 m. I converted each frame count to seconds and averaged the three drops under the same ID. I did not conduct physical drops or generate observations by sampling a real population.',
 statisticalPopulation:'The finite collection of 12 constructed A helicopters and 12 constructed B helicopters. Any probability in my investigation concerns a specified selection from those lists, not a population of future helicopters.',
 sampleOrCensus:'',
 samplingMethod:'I included every helicopter in the supplied log. The records are constructed rather than randomly sampled or experimentally randomised observations. Each ID denotes a separate object; the three records under an ID are repeated drops of that object.',
 samplingRationale:R`I compare objects, so each helicopter contributes one three-drop mean. Every object has the same number of drops, so this preserves the pooled group mean while making the plotted spread and later pair comparisons refer to helicopters rather than releases.`,
 sampleSize:'24 distinct helicopters: 12 of each design. Three drops per helicopter give 72 frame-count readings; the group comparison contains 12 helicopter means per design.',
 pairing:'The three drops are matched within a helicopter ID. A01 and B01 are different objects, not a matched pair: I did not use a paired-difference test or subtract corresponding row numbers.',
 responseBias:'There are no survey responses. The constructed log cannot establish how representative the objects are, whether real drops would be independent, or whether release conditions would favour one design.',
 dataCleaning:'I checked 24 distinct IDs, one design per ID and exactly three positive integer frame counts per helicopter. I retained every record, including B07. Omission calculations are labelled diagnostics and never replace the full-data comparison.',
 dataStatusSummary:'The complete 24-by-three log is retained. The figures use one three-drop mean per object, and the 144 A–B differences are calculated combinations of those same 24 means.',
 chosenMethod:R`Compare object-level distributions and centres; diagnose the effect of omitting each whole object; count equally weighted A–B choices; then derive bounds under a stated endpoint-timing model.`,
 alternativeMethod:R`A two-sample significance test would concern a population or randomisation model that this constructed log does not provide. My finite-list decision can instead be answered by direct comparisons and exact counting, with separate sensitivity calculations.`,
 methodReason:R`I begin with every helicopter mean visible on a common scale. Individual dots can reveal overlap and unusually large values that a chart of two group averages would hide. I then compare a mean with a median, and a spread measure using every distance from the mean with one using the middle half of the values. Agreement or disagreement between these summaries will determine what needs checking next.`,
 methodLimitation:'A mean of three drops describes that object under the stated procedure. It does not guarantee the duration of its next drop, and the constructed log cannot validate a real experimental procedure.',
 limitationConsequence:'I can establish which claims are true for these defined records, but cannot estimate a future manufacturing success rate or attribute the difference to rotor length alone.',
 limitationMitigation:'I kept the complete designs and repeated-drop structure explicit, retained B07, checked all single-object omissions and bounded a specified timing error rather than inventing a confidence interval.',
 limitationAcceptable:R`The log supports a conditional choice for average three-drop performance and exact proportions for a specified selection from its two object lists. It does not establish the performance of new objects.`,
 dataAimLink:R`A three-drop mean gives one object a summary under the stated procedure without letting its best release define its performance. Giving those summaries equal weight makes the comparison reflect the complete supplied collection rather than a selection of favourable flights.`
};
const completionFields={
 ...sourceFields,
 changedSincePlanning:R`B's larger centre supported my expectation, but the overlap and B07 made the meaning of that advantage more specific. I checked whether any one object controlled the mean decision, counted useful individual comparisons and finally joined the omission and timing checks because both affect the same 0.20 s threshold.`,
 permissionStatus:'not-needed',permissionNotes:'This investigation uses an identified constructed log. It contains no personal data, actual school experiment, permission grant or recorded video of people.',
 firstMathsBridgePlacement:'before',firstType:'distribution',
 firstPurpose:'How do the distributions of the 12 three-drop helicopter means differ in position, overlap and unusual values?',
 firstDefinitions:definitions,
 firstPresentation:'Figure 1 shows every helicopter mean on a common seconds scale. Figure 2 uses median-of-halves quartiles, with a point for any value outside the stated 1.5 IQR fences.',
 firstMethodEvaluation:R`The three readings under one ID describe repeated releases of the same object. Pooling the 72 drops without object IDs would lose that structure, even though equal numbers of readings per object leave each design’s mean unchanged. I keep all readings in the working log and use the plots to compare the 12 object summaries per design. Population inference would require evidence beyond these supplied lists.`,
 variableDefinitions:definitions,
 specialistTerms:'A rotor is one of the two paper blades folded in opposite directions. In this investigation a flight lasts from release until the first floor contact. I compare complete designs A and B, not an isolated aerodynamic property.',
 accuracyQuantity:'Elapsed video-frame count and derived flight time',accuracySymbol:'F, t',accuracyUnit:'s',
 accuracyResolution:'The scenario uses 50 frames per second, hence 0.02 s between frames. The integer counts are supplied constructed inputs.',
 accuracyPolicy:'I use the frame sums in calculations, display object means to 0.01 s and descriptive standard deviations to 0.001 s. I keep unrounded values when checking 0.20 s and use integer frame-sum comparisons for equality.',
 accuracyReason:'Averaging three readings can produce a fraction of a frame interval, but it does not establish finer measurement accuracy. I test a separate endpoint-selection bound instead of dividing an assumed error by three.',
 accuracyForResult:'My 0.020 s duration-error bound assumes each endpoint can be located within half a frame at a fixed 50 frames per second. It excludes frame-rate error, parallax and an incorrectly identified release or contact event; it is a sensitivity assumption, not a measured calibration.',
 predictionComparison:'B had the larger mean and median, as I expected. However, 20 of the 144 possible A–B comparisons favoured A and three were tied. Only 86 comparisons gave B the full 0.20 s useful gain.',
 benefitFinding:'I would choose B for mean performance in this fixed scenario, while explaining that its average advantage does not guarantee a useful improvement for every selected pair of helicopters.',
 surpriseReason:'B07 was well beyond the other B means, and B had a much larger standard deviation even though the middle-half spread increased only moderately.',
 surpriseCheck:'I examined all three B07 frame counts and calculated every one-helicopter omission. B07 remained an included observation because the constructed log contains no evidence that it is an erroneous entry.',
 nextMethod:'Group means, medians, interquartile ranges and sample standard deviations',
 technologyTool:'Editable statistical diagram generator and scripted arithmetic on the supplied integer frame-count log',
 technologyInput:'I formed all 144 ordered combinations of one A helicopter mean and one B helicopter mean. I counted positive differences and differences of at least 0.20 s using the original frame sums.',
 technologyOutcome:R`I obtained 121 strict B wins, three ties and 20 A wins. Exactly 86 of the 144 combinations had \(x_B-x_A\ge0.20\text{ s}\). Their mean difference was \(0.290\text{ s}\).`,
 technologyInterpretation:'I checked one row of pair counts by hand and derived why the mean of all pair differences equals the difference of the group means. The 144 outputs reuse the same 24 objects and do not provide 144 independent experimental observations.',
 courseWhy:R`AI SL descriptive statistics and finite probabilities provide the starting methods. I extend them by deriving the one-object mean updates, explaining why the mean of all pair differences equals the difference of group means, and propagating deterministic timing bounds. Each derivation is included where it first affects the decision.`,
 courseConcern:R`The sample-SD convention and the tailored omission and error-bound arguments need explanation rather than a syllabus label alone. I derive the necessary algebra in the paper and distinguish calculated finite-list probabilities from population inference; no teacher approval is claimed.`,
 mathsLearning:'I learned that the average of all A–B differences can be comfortably above a practical threshold while many individual differences fall below it. I also found that a sensitivity check can be reassuring alone but less reassuring when combined with another uncertainty.',
 notationIssue:'I distinguish a drop time t, a helicopter mean x, a group mean and the B-minus-A difference Δ. I use s_g for sample standard deviation and write seconds as a unit, avoiding an unexplained reuse of the same symbol.',
 presentationIssue:R`The three plots and three short tables carry the main comparison. All 72 readings, 24 omission diagnostics and 144 pair calculations remain in the working datasets. The revised reader and PDF/Word pages are not yet inspected; layout verification must follow the new prose.`,
 referencesIssue:R`The data and hypothetical procedure are identified as Helicopter Flight Log v1. NIST/SEMATECH method references [M1] and [M2] support the sample-standard-deviation and box-plot conventions. The omission, finite-pair and timing-bound derivations are shown directly; no external experiment or image is claimed.`,
 finalProofread:R`The revised mathematical argument and source calculations have been checked, but the revised PDF and Word pages are not yet inspected. A fresh full-page review and desktop/phone reader check remain pending. Peer, teacher and school-format checks remain unrecorded.`,
 draftComplete:'ready'
};

const stages=[
 {
  key:'object-distributions',title:'Comparing helicopters rather than counting drops',
  bridge:R`A design is represented by the objects made from it. Dropping one helicopter three times provides three readings of that object, not three different examples of the design.`,
  purpose:R`For design \(g\) and helicopter \(i\), I use its three-drop mean \(x_{gi}=(t_{gi1}+t_{gi2}+t_{gi3})/3\). Figure 1 gives each of these means one dot. This matches a choice between helicopters, while retaining all three releases rather than selecting an object's best flight.`,
  technique:'Repeated-reading aggregation and comparative dot plots',methodId:'follow-journey',kind:'other',knowledge:'syllabus',
  observationText:'The B means tend to lie to the right of A, but the ranges overlap from 1.80 to 2.12 s. B07 has a three-drop mean of 2.82 s, separated from the next B mean at 2.38 s. I need to quantify the centres and spread before deciding whether the shift is useful.',
  result:R`For A01 the counts 88, 93 and 95 give times of \(1.76\), \(1.86\) and \(1.90\text{ s}\). Its summary is therefore
\[
x_{A1}=\frac{88+93+95}{3\times50}=1.84\text{ s}.
\]
I repeat this for all objects, giving \(n_A=n_B=12\) means. Because every object has three readings, averaging these twelve means gives the same group mean as averaging its 36 drop times. The reason for keeping the object summaries is the meaning of their variation and of a later A–B comparison, not a change to that overall average.

A's means range from \(1.64\) to \(2.12\text{ s}\), and B's from \(1.80\) to \(2.82\text{ s}\). The intervals overlap between \(1.80\) and \(2.12\text{ s}\). B07, at \(2.82\text{ s}\), is separated from the next B mean, \(2.38\text{ s}\); it remains included because an isolated dot alone gives no reason to call a record wrong.`,
  interpretation:R`B's distribution is shifted towards longer times, but the order is not uniform: some A objects have higher recorded means than some B objects. A design preference based on these dots must account for that overlap.`,
  limitations:R`The comparison describes three-drop means. It does not predict an object's next release or measure its repeatability separately. A01 and B01 are different objects; their shared row number supplies no matching condition.`,
  localTakeaway:'The 12 B means tend to be larger, but the ranges overlap and B07 may affect average-based comparisons.',
  nextQuestion:R`The useful-gain decision now requires the size of the shift, not just its direction.`,
  nextWhy:R`A mean and a median will show whether two different descriptions of centre support the same decision, while spread measures will help locate the effect of B07.`,
  mathsInsight:R`Equal numbers of drops make the pooled and object-level group means equal, but the two distributions answer different questions. I compare object summaries because the choice is between helicopters.`,
  methodChangeReason:R`The visible overlap and separated B07 value make both centre and the location of extra spread relevant.`,
  outcomeId:'different-shapes'
 },
 {
  key:'centres-and-spreads',title:'Measuring the average gain and the variability',
  bridge:R`B07 makes it especially important to distinguish the middle of a group from its long upper tail. A single summary of variability could conceal that difference.`,
  purpose:R`I compare the means and medians, then two measures of spread. For twelve sorted values, my quartiles are the medians of the lower six and upper six; their difference, \(\mathrm{IQR}=Q_3-Q_1\), describes the middle half. Figure 2 uses this convention. The sample standard deviation \(s_g\) uses every value's distance from its group mean, so it can reveal variation that the IQR leaves outside the box.`,
  technique:'Comparative means, medians, standard deviations and interquartile ranges',methodId:'follow-journey',kind:'calculation',knowledge:'mixed',
  unfamiliarComponent:R`Sample-SD denominator convention and the algebraic identity for the sum of squared deviations.`,
  knowledgeNotes:R`Means, medians, quartiles and standard deviation are AI SL content. I explain the reported sample-SD convention, its distinction from dividing by n, and derive the calculation identity in the printed result.`,
  researchSource:R`NIST/SEMATECH e-Handbook, §1.3.5.6 Measures of Scale [M1], https://www.itl.nist.gov/div898/handbook/eda/section3/eda356.htm; §1.3.3.7 Box Plot [M2], https://www.itl.nist.gov/div898/handbook/eda/section3/boxplot.htm. Accessed 23 October 2026.`,
  understandingExample:R`Because \(\sum x_i=n\bar x\), expanding \(\sum(x_i-\bar x)^2\) gives \(\sum x_i^2-(\sum x_i)^2/n\). For A this produces \(s_A\approx0.15011\text{ s}\).`,
  result:R`Writing \(\bar x_g\) for the mean of design \(g\)'s twelve object means, the totals give
\[
\bar x_A=\frac{22.36}{12}\approx1.86333\text{ s},\qquad
\bar x_B=\frac{25.84}{12}\approx2.15333\text{ s}.
\]
Their difference is
\[
\Delta=\bar x_B-\bar x_A=0.290\text{ s},
\]
about \(15.56\%\) of A's mean. It exceeds my \(0.20\text{ s}\) criterion by \(0.090\text{ s}\).

For standard deviation I use the conventional sample formula [M1]: subtract the group mean from each value, square the differences, divide their total by \(n-1\), and take the square root. Here \(n\) is the number of object means and the root restores seconds:
\[
s_g=\sqrt{\frac{\sum_i(x_{gi}-\bar x_g)^2}{n-1}}.
\]
The \(n-1\) denominator identifies the reported sample-SD convention; it is not a claim that these constructed objects are a random sample. Dividing by \(n\) would instead describe the full finite list's standard deviation. For the two groups of twelve, that would multiply both reported values by \(\sqrt{11/12}\), leaving their ratio unchanged.

To show the calculation behind the output, \(\sum x_i=n\bar x\) gives
\[
\begin{aligned}
\sum(x_i-\bar x)^2
&=\sum x_i^2-2\bar x\sum x_i+n\bar x^2\\
&=\sum x_i^2-\frac{(\sum x_i)^2}{n}.
\end{aligned}
\]
The sums of squares are \(41.912\text{ s}^2\) for A and \(56.448\text{ s}^2\) for B. Thus
\[
s_A=\sqrt{\frac{41.912-22.36^2/12}{11}}
\approx0.15011\text{ s},
\]
and the same calculation for B gives \(s_B\approx0.27067\text{ s}\). Squaring gives an unusually distant value more influence than a nearby one; the IQR provides a complementary comparison of the middle.

A has \(Q_1=1.74\), median \(1.86\) and \(Q_3=1.98\), in seconds. B has \(Q_1=1.97\), median \(2.12\) and \(Q_3=2.27\). The median gain is therefore \(0.26\text{ s}\), while the IQRs are \(0.24\) and \(0.30\text{ s}\).

I use the conventional box-plot fence [M2], \(Q_3+1.5\mathrm{IQR}\), to flag a value unusually far above the middle half. For B it is
\[
2.27+1.5(0.30)=2.72\text{ s}.
\]
B07 exceeds this fence. The upper whisker ends at the largest value inside it, \(2.38\text{ s}\), while the \(2.82\text{ s}\) point stays visible.`,
  interpretation:R`Both centre measures exceed the useful-gain threshold, so the direction of the decision does not depend on using the mean. However, B's standard deviation is about \(1.80\) times A's, while its IQR is only \(1.25\) times A's. The extra spread is therefore more pronounced when distant values receive weight. That identifies the upper tail as a concrete reason to test the mean recommendation's sensitivity.`,
  limitations:R`The fence is a screening convention, not proof of an erroneous entry. These descriptive calculations also require neither normally distributed flights nor equal group variances; I have not used them to make an inferential claim.`,
  localTakeaway:'B has a 0.290 s larger mean and a 0.26 s larger median, but its longer upper tail raises the standard deviation substantially.',
  nextQuestion:R`The unresolved issue is whether one helicopter contributes enough to move the mean gain across 0.20 s.`,
  nextWhy:R`Recalculating the same decision after each whole-object omission will measure that influence directly, while preserving every record in the main comparison.`,
  mathsInsight:R`The sample-SD calculation weights squared distances, whereas the IQR depends on the middle ordered values. Their different spread ratios locate the aspect of variation that needs checking.`,
  methodChangeReason:R`The tail-sensitive spread is substantially larger for B, so I check the mean-gain threshold under whole-object omissions rather than declaring B07 invalid.`,
  outcomeId:'centre'
 },
 {
  key:'single-object-sensitivity',title:'Checking whether one helicopter controls the conclusion',
  bridge:R`Each omission will be a separate diagnostic; none will replace the all-object comparison. I keep the same useful-gain threshold so that any change in the decision comes from the omitted object.`,
  purpose:R`For each of the 24 IDs, I temporarily remove that helicopter and its three readings, recompute the two group means and their difference, then restore it before checking the next ID. The affected group has eleven objects and the other still has twelve. Table 2 shows the full result and selected extreme diagnostics; all 24 calculations remain in the working data.`,
  technique:'One-helicopter-at-a-time sensitivity and algebraic mean updates',methodId:'follow-journey',kind:'calculation',knowledge:'mixed',
  unfamiliarComponent:R`Whole-object omission sensitivity and exact mean-update formulas.`,
  knowledgeNotes:R`I define and carry out all 24 omissions, restore the full list between cases and derive each update by removing one contribution from a twelve-object total. This is an explained extension of mean arithmetic, not a sampling interval.`,
  researchSource:R``,
  understandingExample:R`Omitting B07 leaves \((25.84-2.82)/11\) for B's mean, so the gain is approximately \(0.229394\text{ s}\). The full-log result still includes B07.`,
  result:R`B07's counts give \(2.66\), \(2.84\) and \(2.96\text{ s}\). All three exceed the next-largest object mean, \(2.38\text{ s}\), so its long mean cannot be explained by only one long drop.

I write \(\Delta_{-B_j}\) for the mean gain with B helicopter \(j\) omitted. The subscript labels the omission. Removing \(x_{Bj}\) from B's total and dividing the remainder among eleven objects gives
\[
\begin{aligned}
\Delta_{-B_j}
&=\frac{12\bar x_B-x_{Bj}}{11}-\bar x_A\\
&=\Delta+\frac{\bar x_B-x_{Bj}}{11}.
\end{aligned}
\]
The last term shows the direction of influence: omitting a B mean above its group mean reduces the advantage. For B07,
\[
\Delta_{-B07}=\frac{25.84-2.82}{11}-\frac{22.36}{12}
\approx0.229394\text{ s}.
\]
Its omission leaves a B mean of approximately \(2.09273\text{ s}\). Repeating the standard-deviation calculation with eleven values and denominator ten gives \(s_B\approx0.17917\text{ s}\), a marked reduction from \(0.27067\text{ s}\).

Omitting an A helicopter instead changes the subtracted mean:
\[
\begin{aligned}
\Delta_{-A_i}
&=\bar x_B-\frac{12\bar x_A-x_{Ai}}{11}\\
&=\Delta+\frac{x_{Ai}-\bar x_A}{11}.
\end{aligned}
\]
Across all 24 omissions, the gain ranges from about \(0.229394\text{ s}\), omitting B07, to \(0.322121\text{ s}\), omitting B06. The A-only omissions range from about \(0.269697\) to \(0.313333\text{ s}\). The formulas explain the overall extremes: removing B's largest mean reduces its advantage most, and removing its smallest increases it most.`,
  interpretation:R`Every one-object omission preserves a mean gain above \(0.20\text{ s}\). B07 raises the full-log gain by about \(0.0606\text{ s}\), but does not alone create the useful mean advantage. I kept all 24 objects in the main results because the log supplies no evidence of an erroneous record. The smallest diagnostic margin is only about \(0.0294\text{ s}\); I retain that value for the later timing check.`,
  limitations:R`This is a finite set of sensitivity calculations, not 24 new experiments or a statistical uncertainty interval. It tests one absence at a time; it does not establish stability under several omissions or a change to the complete production process.`,
  localTakeaway:'The useful mean gain survives every single-object omission, although its smallest margin above 0.20 s is only about 0.0294 s.',
  nextQuestion:R`The mean decision survives this check, but it still leaves the overlap in Figure 1 unquantified.`,
  nextWhy:R`I now examine each possible A–B object comparison, so that a large average cannot stand in for the frequency of a useful individual gain.`,
  mathsInsight:R`Subtracting one contribution from a fixed group total gives an exact influence formula. The sign and size of the removed object's deviation explain the diagnostic result.`,
  methodChangeReason:R`Single-object sensitivity answers whether the mean depends on one record; exact pair counting answers the separate consistency question in my aim.`,
  outcomeId:'centre'
 },
 {
  key:'finite-pair-comparison',title:'Separating an average improvement from a particular advantage',
  bridge:R`An average gain can combine many small improvements with a few large ones. To describe consistency, I need to know how often the actual A–B differences reach my threshold.`,
  purpose:R`I define a selection rule: choose one of the twelve A means uniformly, and independently choose one of the twelve B means uniformly. Uniformly means each listed object has chance \(1/12\); the independent choices give each ordered pair chance \((1/12)(1/12)=1/144\). This gives the objects equal weight without pretending to know which will be manufactured or chosen in reality. For pair \((i,j)\), let \(D_{ij}=x_{Bj}-x_{Ai}\). I calculate all \(12\times12=144\) differences.`,
  technique:'Finite sample-space counting and expected difference',methodId:'follow-journey',kind:'calculation',knowledge:'mixed',
  unfamiliarComponent:R`The tailored finite pair-selection model and the double-sum proof connecting expected difference to group means.`,
  knowledgeNotes:R`Finite probabilities and expected value are course methods. I define the equal pair weights and explain the double sum in words, then count how often every group value occurs to derive the identity in the printed result.`,
  researchSource:R``,
  understandingExample:R`Each B mean appears in twelve differences and each A mean is subtracted twelve times. Dividing the total by 144 leaves \(\bar x_B-\bar x_A=0.290\text{ s}\), whereas only 86 differences reach \(0.20\text{ s}\).`,
  result:R`B is strictly higher in 121 comparisons, equal in three and lower in 20. Probability under the stated rule is the number of qualifying pairs divided by 144, so
\[
P(D>0)=\frac{121}{144}\approx0.8403.
\]
For the useful-gain question, exactly 86 pairs reach \(0.20\text{ s}\):
\[
P(D\ge0.20)=\frac{86}{144}\approx0.5972.
\]
Three pairs are exactly on the boundary and count as useful. Since an object mean is its frame sum divided by 150, I test whether B's frame sum exceeds A's by at least \(150(0.20)=30\) frames. Counting integers avoids a rounded decimal deciding whether equality is included. Figure 3 displays these differences in bins; the threshold counts use the original values.

For example, A01's \(1.84\text{ s}\) requires a B mean of at least \(2.04\text{ s}\); eight B objects qualify. A05's \(2.12\text{ s}\) requires at least \(2.32\text{ s}\), met only by B03 at \(2.38\) and B07 at \(2.82\text{ s}\). The chosen A object therefore matters even though every one receives the same weight.

The expected difference \(E(D)\) is the probability-weighted average of all possible differences. With equal probabilities, it is their ordinary mean. In the double sum below, I first add over all twelve B choices for one A, then repeat for each A. Each B mean appears twelve times and each A mean is subtracted twelve times:
\[
\begin{aligned}
E(D)&=\frac{1}{144}\sum_{i=1}^{12}\sum_{j=1}^{12}(x_{Bj}-x_{Ai})\\
&=\frac{12\sum_jx_{Bj}-12\sum_ix_{Ai}}{144}\\
&=\bar x_B-\bar x_A=0.290\text{ s}.
\end{aligned}
\]
This identity connects the pairwise result to the earlier mean calculation. The differences range from \(-0.32\) to \(1.18\text{ s}\), so an average above \(0.20\text{ s}\) can coexist with many gains below it: their sizes as well as their frequencies determine the average.`,
  interpretation:R`The distinction in my aim is now numerical. B is higher in about 84% of these recorded comparisons, but reaches the full useful gain in about 60%. I can prefer it for average performance without promising the chosen improvement for every particular pair.`,
  limitations:R`The 144 differences reuse the same 24 means; they are not independent experimental trials. Independence here belongs to the defined act of choosing from two lists, not to the drops that produced them. I do not treat 144 as a new experimental sample size, and the probability concerns recorded three-drop means rather than future single flights.`,
  localTakeaway:'The expected finite-list difference is 0.290 s, but only 86/144 pair choices give the chosen 0.20 s useful gain.',
  nextQuestion:R`Three useful pairs lie exactly on 0.20 s, and the smallest omission margin was only about 0.0294 s.`,
  nextWhy:R`These specific margins make frame-selection precision relevant to both parts of the decision. I therefore test a stated timing bound instead of inferring accuracy from the displayed decimals.`,
  mathsInsight:R`Expected gain averages the sizes of all differences; the threshold probability counts which differences qualify. Equal pair probabilities arise from the stated selection rule, not from extra experimental observations.`,
  methodChangeReason:R`The exact boundary cases and the small omission margin identify the quantities whose timing sensitivity must be checked.`,
  outcomeId:'sampling'
 },
 {
  key:'timing-bound',title:'Testing the conclusion against frame-selection error',
  bridge:R`The fixed counts make the arithmetic exact, but the hypothetical video procedure would still require selecting release and contact endpoints. I now ask how a specified endpoint error could change the mean gain and the useful-pair count.`,
  purpose:R`I assume the frame rate is exactly 50 per second and each identifiable event is assigned to its nearest frame. That idealisation places an endpoint within half a frame of its recorded position. It is a sensitivity assumption, not a calibration established by this log. I allow the errors to share a direction, so any conclusion that survives is valid without assuming random, independent or cancelling errors. Table 3 keeps the full-data result separate from the B07-omission diagnostic.`,
  technique:'Endpoint error propagation and threshold sensitivity bounds',methodId:'follow-journey',kind:'calculation',knowledge:'mixed',
  unfamiliarComponent:R`Deterministic propagation of endpoint errors, attainable count bounds and combined sensitivity.`,
  knowledgeNotes:R`I define each signed correction, bound a difference by the sum of magnitudes, and show why averaging does not reduce a shared bound. I then translate the difference bound into sufficient and necessary threshold conditions and exhibit simultaneous shifts attaining both counts.`,
  researchSource:R``,
  understandingExample:R`If all B means move down \(0.02\text{ s}\) and all A means move up \(0.02\text{ s}\), every difference falls by \(0.04\text{ s}\). Exactly the 78 original differences at least \(0.24\text{ s}\) remain useful.`,
  result:R`One frame lasts \(1/50=0.02\text{ s}\), so the allowed endpoint correction is at most \(0.01\text{ s}\). Let \(e_s\) and \(e_e\) be the signed corrections to the recorded start and end times. Since duration is end minus start, its correction is \(\varepsilon_t=e_e-e_s\). Its magnitude cannot exceed the sum of the endpoint magnitudes:
\[
|\varepsilon_t|\le|e_e|+|e_s|\le0.01+0.01=0.02\text{ s}.
\]
For corrections \(\varepsilon_1,\varepsilon_2,\varepsilon_3\) to three drops, their mean has correction
\[
|\varepsilon_x|=
\left|\frac{\varepsilon_1+\varepsilon_2+\varepsilon_3}{3}\right|
\le\frac{0.02+0.02+0.02}{3}=0.02\text{ s}.
\]
Averaging cannot reduce this worst-case bound: all three corrections may be \(+0.02\), or all \(-0.02\). The same argument for twelve object means, or eleven after an omission, gives the same \(0.02\text{ s}\) bound for a group mean. Subtracting two bounded means allows a \(0.04\text{ s}\) change to either a group difference or an individual pair difference.

Writing \(\Delta_{\rm adjusted}\) for the group difference after any allowed corrections, the full log gives
\[
0.290-0.040\le\Delta_{\rm adjusted}\le0.290+0.040,
\]
so its possible values lie between \(0.250\) and \(0.330\text{ s}\), all above the criterion. To see the limit of that protection, let \(\delta\ge0\) be a bound on each duration's correction, in seconds. The lowest allowed mean gain is \(0.290-2\delta\). Solving
\[
0.290-2\delta\ge0.20
\quad\Longleftrightarrow\quad
\delta\le0.045\text{ s}
\]
gives the largest duration-error bound that guarantees the full-data useful mean gain. The lower value is attainable by shifting every B duration down by \(\delta\) and every A duration up by \(\delta\).

For a pair to remain useful after an adverse \(0.04\text{ s}\) shift, its recorded difference must be at least \(0.24\text{ s}\); 78 pairs meet that condition. Conversely, a difference below \(0.16\text{ s}\) cannot reach \(0.20\) even with the favourable shift; only 95 pairs reach \(0.16\). With the same uniform selection rule,
\[
\frac{78}{144}\le P(D_{\rm adjusted}\ge0.20)\le\frac{95}{144},
\]
about \(54.2\%\) to \(66.0\%\). These are attainable bounds for the whole count, not just separate guesses for each pair: move every B mean down by \(0.02\) and every A mean up by \(0.02\) to attain the lower count, and reverse the shifts for the upper count.

The earlier omission check concerns the same mean-gain decision. Combining its least favourable case with the allowed adverse timing shift gives
\[
\Delta_{-B07}-0.040\approx0.189394\text{ s},
\]
which falls below \(0.20\text{ s}\). Omission alone and timing alone preserve the criterion, but the combined assumptions need not.`,
  interpretation:R`The full-log mean recommendation survives this timing model, while a useful individual advantage remains far from certain. The combined check identifies the limit of a stronger claim: discounting B07 and allowing a shared adverse timing shift can remove the useful mean gain. That is a conditional scenario, not evidence that either adjustment should be made to the recorded results.`,
  limitations:R`These are deterministic sensitivity bounds, not a confidence interval. They cover identifiable endpoints and a fixed frame rate; they do not cover an obscured event, inconsistent release height or a changed paper object. No supplied video verifies the half-frame assumption.`,
  localTakeaway:'All recorded objects support B for mean performance, including the stated timing bound, but the useful-gain claim is conditional and individual pair outcomes remain variable.',
  nextQuestion:R`The calculations now answer both the average-gain question and the frequency of a useful recorded comparison, with the important sensitivity limits attached.`,
  nextWhy:R`Another statistic on the same list would not establish transfer to real objects. I therefore stop the calculation here and state the design choice within the evidence available.`,
  mathsInsight:R`The same-direction construction explains why averaging does not shrink the worst-case error. It also proves the pair-count bounds can be attained simultaneously. Two individually reassuring checks need not remain reassuring when combined.`,
  methodChangeReason:R`The omission and timing checks alter the same threshold decision, so combining them is necessary to state the limits of the recommendation before concluding.`,
  outcomeId:'sampling'
 }
];

const rawTable=(columns,rows)=>[columns.join('\t'),...rows.map(row=>row.join('\t'))].join('\n');
const meanRows=groups.A.map((a,index)=>[caseMean(a),caseMean(groups.B[index])]);
function distribution(kind,title,number,caption){
 const columns=['Design A','Design B'];
 return {...newStatDraft(),kind,headers:'yes',columns,selected:[0,1],
  matrix:meanRows.map(row=>row.map(String)),raw:rawTable(columns,meanRows),
  title,figureNumber:String(number),variable:'Three-drop helicopter mean',unit:'s',unitMode:'unit',
  sourceKind:'theoretical',sourceText,caption,min:'1.5',max:'3.0',
  quartileRule:'halves',outlierRule:'tukey',whiskerMode:'nonoutlier',boxPrecision:'2',
  showBoxMedian:true,showBoxQuartiles:false,showBoxOutlierValues:true,dotMean:false,dotMedian:false};
}
function table(title,number,columns,rows,units,purpose,note){
 return {...newTableDraft(),mode:'compact',headers:'yes',columns,headings:columns,
  matrix:rows.map(row=>row.map(String)),raw:rawTable(columns,rows),
  unitDecisions:units.map(unit=>({mode:unit?'unit':'dimensionless',unit})),
  title,number:String(number),purpose,note,sourceKind:'theoretical',
  sourceText:'My calculations from the constructed Helicopter Flight Log v1.',
  numberFormat:'source',showRowLines:true,cellAlignment:'numeric'};
}
const summaryRows=['A','B'].map(design=>[design,...['mean','median','sd','iqr'].map(key=>f(HELICOPTER_SUMMARIES[design][key]))]);
const omissionRows=[['All objects',12,12,0.29],...['B07','A07','B06'].map(id=>{
 const row=HELICOPTER_OMISSIONS.find(item=>item.omitted===id);return ['Omit '+id,row.nA,row.nB,row.difference];
})].map(([label,nA,nB,difference])=>[label,nA,nB,f(difference,4),f(difference-0.2,4)]);
const pairRows=HELICOPTER_COMPARISONS.map(item=>[item.difference]);
const pairHistogram={...newStatDraft(),kind:'histogram',headers:'yes',columns:['B minus A'],selected:[0],
 matrix:pairRows.map(row=>row.map(String)),raw:rawTable(['B minus A'],pairRows),
 title:'Differences for every finite A–B choice',figureNumber:'3',variable:'B minus A helicopter mean',unit:'s',unitMode:'unit',
 sourceKind:'theoretical',sourceText,caption:'144 calculated combinations reuse 24 helicopter means. They are not 144 independent flights.',
 histogramInput:'raw',binStart:'-0.4',binWidth:'0.1',histogramLabels:'frequency',min:'-0.4',max:'1.3'};

export const HELICOPTER_GROUPS_SPEC={
 id:'helicopter-groups',routeId:'groups',title:'Which paper helicopter gives a useful increase in flight time?',
 description:'A complete comparison of two fictional designs: preserve repeated drops, compare centre and spread, investigate an unusual helicopter, and distinguish average advantage from consistency.',
 course:'AI SL',mathSelected:['AI13','AI19'],technologyStage:3,
 readingNote:'A complete fictional student investigation using a constructed log of 24 paper helicopters and 72 drop readings. The flight times and experiment description are teaching inputs, not a record of real flights.',
 provenance:'This original fictional investigation uses Helicopter Flight Log v1, a fixed constructed table of integer elapsed-frame counts. Each of 24 named objects has three readings, with a defined conversion of 50 frames per second. The author specified the complete table before writing the comparison. A has per-object mean frame counts 92, 84, 100, 88, 106, 94, 82, 102, 90, 98, 86 and 96; B has 105, 94, 119, 100, 109, 90, 141, 103, 115, 97, 112 and 107. The within-object offsets are the differences between those means and the three saved integer counts; they were constructed, not randomly drawn. The 18 by 4 cm paper blanks, 6 versus 9 cm rotors, 2.00 m release height, equal clips and video protocol define a hypothetical comparison. No physical trial, random allocation, consent, teacher approval, school submission or assessed mark is claimed. Finite-list probabilities concern only the explicit uniform selection of one of the 12 supplied object means from each design.',
 planning:{
  planIdentifier:'Paper helicopter comparison: objects, repeated drops and useful differences',ideaStatus:'yes',
  provisionalTitle:'Which paper helicopter gives a useful increase in flight time?',
  idea:'I want to compare two paper helicopter designs without allowing one lucky drop or one unusually successful helicopter to decide which design I choose.',
  aim,motivation:'A paper helicopter that stays airborne longer is more enjoyable to watch, but I would be disappointed if an impressive average concealed unreliable performance. I want a numerical meaning for a useful improvement.',
  beneficiaryType:'me',beneficiary:'I would use the comparison to choose a design for a model classroom demonstration and to explain how much variation to expect within the supplied cases.',
  intendedUse:R`Choose between the two supplied designs for average three-drop performance, report how often an equally weighted A–B comparison gains at least 0.20 s, and state the assumptions under which those conclusions hold.`,
  kind:'statistics',statisticsContext:'Two groups',dataSource:'secondary',dataAvailability:'in-hand',course:'AI SL',
  prediction:'I expect design B, with the longer rotors, to have the longer typical flight time. I am less certain whether its advantage will be consistent across individual helicopters.',
  predictionWhy:'Longer rotors suggest a possible way to slow descent, but the complete designs also have different body lengths. This is a starting intuition, not an established physical law or proof of the outcome.',
  predictionImplication:R`A gain of at least 0.20 s in the mean would support B for my chosen average-performance decision. The frequency of that gain for particular recorded pairs will describe its consistency without imposing an unannounced probability target.`,
  courseSuitability:'yes',mathsOutside:'outside',
  otherMaths:R`I will explain the sample-SD convention and derive whole-object omission formulas, the expected pair-difference identity and conditional timing-error bounds. The starting descriptive statistics and finite probabilities are course mathematics.`,
  mathsRevisedWhy:R`I will use the actual gap after each result: overlap needs a pair comparison; a long tail needs an influence calculation; near-threshold margins need a stated timing bound.`,
  secondaryPublisher:'Helicopter Flight Log v1, original constructed teaching material supplied with this sample.',
  secondaryVariables:'Helicopter ID, design A or B, and three elapsed-frame counts. At the stipulated 50 frames per second, frame count is divided by 50, giving time in seconds.',
  secondaryScope:'All 24 constructed objects, 12 per design, with three drops each. My primary comparison will use one three-drop mean per object.',
  secondarySamplingOrigin:'The complete records were constructed for this fictional investigation. They are not a probability sample, and no real randomised experimental allocation is claimed.',
  secondaryVerified:'yes',secondaryStatus:'ready',
  alternativeMethod:'I could compare the best drop of each design, but that would favour occasional extremes and ignore typical performance. A significance test would require a separate, meaningful sampling claim.',
  readinessImprovement:'I will check the IDs and the three-reading structure before graphing, and state the 0.20 s useful-gain criterion before calculating the summaries.',
  practicalBlocker:'no',permissionNeed:'no',permissionDetails:'I am analysing supplied constructed records. I will not present them as actual collected data or claim permission for a physical school experiment.',
  firstAction:'Calculate one three-drop mean per helicopter and plot both groups on a common seconds scale.',
  firstAccuracy:'Keep integer frame counts in the raw log; use unrounded means for calculations and state a separate endpoint-selection error model.',
  teacherNeed:'I would like to discuss whether the finite-list probability and error-bound reasoning sufficiently develop the descriptive comparison without pretending to make population inferences.',
  teacherQuestion:'Have I clearly separated repeated drops, independent object units and calculated combinations in my argument?',
  teacherSafeAction:'I can check the full input table, derive the means and prepare the first common-scale figure while keeping the hypothetical provenance explicit.',
  universalTeacherQuestion:'Does my conclusion explain both why B is preferable on average and why a particular comparison can still disappoint?',
  timelineWeeks:'6',timelineEarly:'yes',
  milestoneAdjustment:'My illustrative sequence is to check the log, compare distributions, investigate influential objects, count useful differences, examine timing sensitivity, then write and review. I have not supplied school-confirmed dates.'
 },
 completion:completionFields,
 introduction:R`I would like a paper helicopter for a classroom demonstration to remain airborne long enough to watch its motion. Choosing a design by its best drop could be misleading: I also want to know whether a reported advantage is shared across the objects being compared. I investigate this using Helicopter Flight Log v1, an explicitly constructed record of twelve A helicopters and twelve B helicopters, with three readings per object. I did not carry out physical flights.

My aim has two parts. Does B's recorded three-drop mean performance exceed A's by a useful amount on average? How often does a particular B object have that useful advantage over an A object, when every listed object receives equal weight? The first is my design-choice criterion; the second describes the consistency of that choice rather than requiring a separate success percentage.

I set the useful gain at at least \(0.20\text{ s}\), including equality, before calculating the group results. This is a personal threshold for the fictional demonstration: a gain of one or two frame intervals would not persuade me to change designs, whereas I choose ten intervals as the minimum I would count as worthwhile. At the stated 50 frames per second, ten intervals are \(0.20\text{ s}\). This choice is not a measured perceptual limit or an externally validated performance standard.

I initially expected B's longer rotors to favour longer flights. The complete layouts also differ in body length, so this is a starting expectation about the designs, not a claim that the log can isolate an aerodynamic cause.`,
 dataNotes:R`The scenario gives both designs an \(18\text{ cm}\times4\text{ cm}\) paper blank and the same clip. Its two rotor strips are each \(2\text{ cm}\) wide and folded in opposite directions. A uses \(6\text{ cm}\) rotors and B uses \(9\text{ cm}\) rotors, leaving different body lengths; each lower body is folded to the same nominal width. I therefore compare complete layouts rather than rotor length alone.

The stipulated procedure releases each object without a push, with the clip bottom \(2.00\text{ m}\) above the floor. The three columns represent drop rounds intended to interleave A and B in the same still indoor setting. Time runs from release to first floor contact. These conditions define the hypothetical comparison; no video or recorded order establishes that a real experiment achieved them.

I write \(F_{gik}\) for the supplied elapsed-frame count, where \(g\) denotes A or B, \(i=1,\ldots,12\) identifies a helicopter and \(k=1,2,3\) identifies its drop. The converted time is \(t_{gik}=F_{gik}/50\) seconds. I checked the 24 distinct IDs and three positive integer counts under each, found no missing entries and retained every object. The complete log remains in the editable working data.

I use exact frame sums in calculations, display object means to \(0.01\text{ s}\) and summary standard deviations to \(0.001\text{ s}\), retaining extra digits where a threshold comparison needs them. An average may contain a fraction of a frame interval; that is arithmetic precision, not evidence of improved timing accuracy.`,
 stages,
 figures:[
  {id:'stat-helicopter-means',tool:'stat',stage:0,after:'purpose',draft:distribution('dot','All helicopter means, with repeated drops kept together',1,'Each dot is one helicopter mean from three drops; there are 12 objects per design.')},
  {id:'stat-helicopter-boxes',tool:'stat',stage:1,after:'purpose',draft:distribution('box','Centres, middle halves and the unusually long B flight',2,'Median-of-halves quartiles; 1.5 IQR fences flag B07, which remains included in all main calculations.')},
  {id:'table-helicopter-summary',tool:'table',stage:1,after:'result',draft:table('Centres and spreads of helicopter means',1,['Design','Mean','Median','Sample SD','IQR'],summaryRows,['','s','s','s','s'],'I compare resistant and mean-based summaries of the same 12 means in each design.','Each row summarises 12 helicopter means. All four summaries are in seconds; extra digits do not imply measurement accuracy.')},
  {id:'table-helicopter-omissions',tool:'table',stage:2,after:'result',draft:table('Selected one-helicopter sensitivity checks',2,['Calculation','A count','B count','Mean gain','Above 0.20'],omissionRows,['','','','s','s'],'I show the all-object result, the lowest B-omission result, the lowest A-omission result and the highest overall diagnostic.','All 24 omissions are retained in the working dataset. These are diagnostics; B07 remains in the full comparison.')},
  {id:'stat-helicopter-pair-differences',tool:'stat',stage:3,after:'result',draft:pairHistogram},
  {id:'table-helicopter-timing',tool:'table',stage:4,after:'result',draft:table('Mean gains under the stated timing bound',3,['Object set','Recorded gain','Lower bound','Upper bound'],[
   ['All 24','0.2900','0.2500','0.3300'],['B07 omitted','0.2294','0.1894','0.2694']
  ],['','s','s','s'],'I distinguish timing sensitivity with all objects from the combined timing-and-omission diagnostic.','Each duration may shift by at most 0.020 s; the B-minus-A difference may shift by 0.040 s. These are not confidence intervals.')}
 ],
 sources:[{id:sourceId,fields:Object.fromEntries(SOURCE_FIELDS.map(key=>[key,completionFields[key]||'']))}],
 planningAccuracy:[
  {id:'pa-helicopter-frame-count',source:'secondary',quantity:'Elapsed-frame count F',unit:'frames',resolution:'Integer counts at a stipulated 50 frames per second.',basis:'exact',uncertainty:'The counts are supplied constructed inputs. A real endpoint-selection error is not known from the log.'},
  {id:'pa-helicopter-flight-time',source:'secondary',quantity:'Flight time t',unit:'s',resolution:'0.02 s per frame; three counts contribute to each helicopter mean.',basis:'rounded',uncertainty:'I will test the separate assumption that each endpoint can be selected within half a frame. I will not treat repeated drops as independent new helicopters or divide a shared error bound by three.'}
 ],
 primaryQuantities:[],
 accuracy:[
  {id:'accuracy-helicopter-recording',quantity:'Elapsed frames and converted time',symbol:'F, t',unit:'s',resolution:'Integer frame counts at an assumed fixed 50 frames per second.',policy:completionFields.accuracyPolicy,reason:'The original integer counts preserve threshold equality and keep recorded resolution distinct from displayed calculation precision.',sourceId},
  {id:'accuracy-helicopter-endpoints',quantity:'Duration and mean-difference sensitivity',symbol:'δ, Δ',unit:'s',resolution:'One frame is 0.02 s; the tested event-selection bound is half a frame at each endpoint.',policy:'Under that explicit model, each duration and each mean may shift by 0.02 s, so a B-minus-A difference may shift by 0.04 s.',reason:'Worst-case same-direction errors do not cancel through averaging. These are conditional deterministic bounds, not a calibrated measurement uncertainty or confidence interval.',sourceId}
 ],
 dataSets:[
  {name:'Helicopter Flight Log v1: complete constructed readings',columns:['Helicopter ID','Design','Drop 1 frames','Drop 2 frames','Drop 3 frames','Three-drop mean (s)'],rows:HELICOPTER_CASES.map(item=>[item.id,item.design,...item.frames,caseMean(item)]),sourceText},
  {name:'All one-helicopter omission diagnostics',columns:['Omitted helicopter','A count','B count','A mean (s)','B mean (s)','B minus A (s)'],rows:HELICOPTER_OMISSIONS.map(item=>[item.omitted,item.nA,item.nB,item.meanA,item.meanB,item.difference]),sourceText:'Diagnostic calculations from the full constructed log; no object is removed from the main analysis.'},
  {name:'All 144 finite A–B choices',columns:['A helicopter','B helicopter','Frame-sum difference','B minus A (s)','Gain at least 0.20 s'],rows:HELICOPTER_COMPARISONS.map(item=>[item.aId,item.bId,item.frameSumDifference,item.difference,item.frameSumDifference>=30?'Yes':'No']),sourceText:'One combination of each A and B object mean. These 144 calculations reuse the same 24 objects and are not independent trials.'}
 ],
 conclusion:{
  mainConclusion:R`For average three-drop performance within this log, I would choose B. Its mean is approximately \(2.153\text{ s}\), compared with \(1.863\text{ s}\) for A: a gain of \(0.290\text{ s}\), about \(15.6\%\) of A's mean. That clears my personal \(0.20\text{ s}\) criterion, and the \(0.26\text{ s}\) median gain supports the same direction without relying on the mean alone.

The second part of the aim qualifies that choice. Under uniform independent selection from the two recorded lists, B is higher in \(121/144\) comparisons, but reaches the useful gain in \(86/144\), about \(59.7\%\). A useful average advantage therefore does not imply a useful advantage for every particular pair. These are exact proportions of the supplied comparisons, not estimates of a manufacturing success rate.`,
  conclusionBenefit:R`The sensitivity calculations show how far the recommendation is supported. Every single-object omission leaves the mean gain above \(0.20\text{ s}\). With all objects retained, the stated timing model allows a gain from \(0.250\) to \(0.330\text{ s}\), still useful, and a useful-pair proportion from about \(54.2\%\) to \(66.0\%\). However, combining the B07 omission with the adverse timing shift can lower the gain to about \(0.1894\text{ s}\). The two checks support a conditional choice, not a guarantee under every combined change.

I learned to distinguish the average size of an advantage from how frequently it reaches a chosen threshold. My conclusion concerns three-drop object means, not future flights or newly made helicopters. The constructed source, the complete-design comparison and the unverified endpoint assumption limit transfer beyond this mathematical scenario.`,
  conclusionExtension:R`To test that transfer, I would compare a new batch of separately made objects with a recorded interleaved release order and a checked timing procedure, keeping the same stated useful-gain criterion. Retaining object IDs and individual drops would allow repeatability and between-object variation to be examined separately. That supplies new evidence for the unresolved practical question rather than another summary of this fixed log.`
 },
 reviews:[
  {id:'D01',location:'Introduction, five mathematical stages and conclusion',note:'I have a stated decision threshold, the complete constructed inputs, completed calculations, interpretations and a conclusion answering the original comparison. The draft is mathematical work rather than a collection plan.',action:'School submission and teacher feedback are separate processes; neither is claimed here.'},
  {id:'D02',location:'Transitions from the first distribution to the timing-bound section',note:'Each next question follows a specific finding: overlap, tail-sensitive spread, single-object influence, finite-pair usefulness and timing boundary cases. The conclusion returns to the original 0.20 s threshold.',action:'I removed the need for a significance test by stating the finite-list scope instead of attaching an unsupported population claim.'},
  {id:'D03',location:'Variable definitions, Figures 1–3 and Tables 1–3',note:'I distinguished frames, drop times, object means, group means and differences. Box-plot quartiles use the stated convention; the timing bounds and pair counts include equality at the useful-gain threshold.',action:'I checked displayed rounded values against unrounded frame-sum calculations and kept seconds attached to numerical timing results.'},
  {id:'D04',location:'Choice of 0.20 s, B07 diagnostic and finite-pair question',note:'My decisions shape the mathematics: I specify usefulness, give each helicopter one mean, retain an unusual value and change the comparison from average gain to a particular finite-list choice.',action:'I explain why each of those decisions is relevant to the demonstration I am considering.'},
  {id:'D05',location:'Interpretations after the summaries, omissions, pair counts and timing bounds',note:'I explain why standard deviation and IQR tell different stories, why a useful mean does not imply consistent individual gains, and why combining two sensitivity checks can weaken the conclusion.',action:'I retain the combined 0.1894 s diagnostic in the conclusion rather than presenting only the reassuring checks.'},
  {id:'D06',location:'Mean and SD calculations, omission formulas, pair-space identity and error propagation',note:'I checked the three-drop denominators, the n−1 standard deviations, all 24 omission results and all 144 finite comparisons. I derived the expected-difference identity and propagated endpoint bounds without assuming cancellation.',action:'I independently recomputed the numeric claims from the integer frame log; any change to the log requires the figures and conclusion to be recomputed.'},
  {id:'D07',status:'needs-work',location:'Revised continuous reader and exported PDF/Word pages',note:'The revised reader and PDF/Word pages are not yet inspected. Fresh all-page layout and desktop/phone checks are required after the coherence and explanation edits.',action:'Check every equation, figure, table, caption and page break in the revised exports; update this record only after actual inspection.'},
  {id:'D09',location:'Source record, opening disclosure and method references',note:'The log and procedure are constructed teaching material. The two genuine NIST/SEMATECH references support the sample-SD and box-plot conventions; no external flight data, video or image is claimed.',action:'I cite the methods at first use and retain the complete internal data record, keeping methodological sources distinct from the constructed observations.'},
  {id:'D11',location:'All five mathematical stages',note:'The draft contains worked object means, a standard-deviation calculation, quartile fences, omission algebra, exact pair counts and conditional error bounds. Each output is followed by its meaning for the design decision.',action:'I checked that the conclusion refers to completed calculations rather than my initial prediction.'},
  {id:'D19',location:'Short narrative tables and three editable working datasets',note:'The plots show all 24 object means, and the main text includes the calculations needed to understand the result. The full raw log, omission list and pair list remain available without inserting a 144-row table into the narrative.',action:'I label the displayed omission cases as selected diagnostics and preserve every omitted-case result in the working dataset.'},
  {id:'D20',location:'Finite-pair counting and statistical diagrams',note:'I state the integer inputs and threshold operation, check an eight-success row by hand and derive why the mean pair difference must equal the group-mean difference. The figures use those same object means.',action:'I retained the saved statistical drafts and exact frame counts so the calculations can be reproduced and edited.'}
 ],
 references:[
  {label:'Constructed source',value:'Helicopter Flight Log v1. Original 24-object teaching dataset supplied with this project. All 72 integer elapsed-frame counts, the assumed 50 frames-per-second conversion and object identities are retained in the editable working data. No physical measurements or randomised experiment are claimed.'},
  {label:'Calculation records',value:'All one-helicopter omission diagnostics and all 144 finite A–B choices. My calculations from the stated source, retained with the project. The omission and pair-mean identities and the conditional timing bounds are derived in the investigation.'},
  {label:'[M1] Sample standard deviation',value:'NIST/SEMATECH e-Handbook of Statistical Methods, §1.3.5.6, Measures of Scale. Definition of sample variance and standard deviation, and the influence of squared deviations. https://www.itl.nist.gov/div898/handbook/eda/section3/eda356.htm (accessed 23 October 2026).'},
  {label:'[M2] Box-plot screening convention',value:'NIST/SEMATECH e-Handbook of Statistical Methods, §1.3.3.7, Box Plot, subsection Box plots with fences. The 1.5 IQR fence convention; the median-of-halves quartiles are specified in my own calculation. https://www.itl.nist.gov/div898/handbook/eda/section3/boxplot.htm (accessed 23 October 2026).'}
 ]
};
