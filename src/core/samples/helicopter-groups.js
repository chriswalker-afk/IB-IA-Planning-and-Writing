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
const aim='I want to compare the three-drop mean flight times of two paper-helicopter designs from the same stated height, and decide whether design B offers a useful advantage of at least 0.20 s relative to the variation between helicopters.';
const definitions=R`I write \(F_{gik}\) for the elapsed-frame count for design \(g\), helicopter \(i\), drop \(k\), where \(g\in\{A,B\}\), \(i=1,\ldots,12\) and \(k=1,2,3\). The drop time is \(t_{gik}=F_{gik}/50\) seconds. My comparison unit is the helicopter's three-drop mean, \(x_{gi}=(t_{gi1}+t_{gi2}+t_{gi3})/3\). I use \(\bar x_A\) and \(\bar x_B\) for the means of the 12 helicopter means, and \(\Delta=\bar x_B-\bar x_A\) for their difference.`;
const sourceFields={
 dataStatus:'ready',actualSourceType:'secondary',actualSource:sourceText,
 sourceCitation:'Helicopter Flight Log v1. Original constructed teaching log supplied in the editable project, including all 72 elapsed-frame counts and the helicopter IDs.',
 actualMethod:'I used the supplied constructed flight log. Its scenario specifies two complete paper designs, 12 distinct helicopters of each design and three drops per helicopter from 2.00 m. I converted each frame count to seconds and averaged the three drops under the same ID. I did not conduct physical drops or generate observations by sampling a real population.',
 statisticalPopulation:'The finite collection of 12 constructed A helicopters and 12 constructed B helicopters. Any probability in my investigation concerns a specified selection from those lists, not a population of future helicopters.',
 sampleOrCensus:'',
 samplingMethod:'I included every helicopter in the supplied log. The records are constructed rather than randomly sampled or experimentally randomised observations. Each ID denotes a separate object; the three records under an ID are repeated drops of that object.',
 samplingRationale:'My question is a comparison within the fixed design scenario. Giving each helicopter one three-drop mean keeps an unusually variable object from acquiring more weight simply because it was dropped repeatedly.',
 sampleSize:'24 distinct helicopters: 12 of each design. Three drops per helicopter give 72 frame-count readings; the group comparison contains 12 helicopter means per design.',
 pairing:'The three drops are matched within a helicopter ID. A01 and B01 are different objects, not a matched pair: I did not use a paired-difference test or subtract corresponding row numbers.',
 responseBias:'There are no survey responses. The constructed log cannot establish how representative the objects are, whether real drops would be independent, or whether release conditions would favour one design.',
 dataCleaning:'I checked 24 distinct IDs, one design per ID and exactly three positive integer frame counts per helicopter. I retained every record, including B07. Omission calculations are labelled diagnostics and never replace the full-data comparison.',
 dataStatusSummary:'The complete 24-by-three log is retained. The figures use one three-drop mean per object, and the 144 A–B differences are calculated combinations of those same 24 means.',
 chosenMethod:'Compare per-helicopter distributions, means, medians and spread; diagnose one-object sensitivity; enumerate the finite A–B comparison space; bound the effect of frame-selection error.',
 alternativeMethod:'I considered an unpaired two-sample t-test on the helicopter means. A hypothetical population significance statement would not answer my finite-list question or establish practical usefulness, so I used descriptive comparisons and exact counting instead.',
 methodReason:R`I started with a dot plot of the 12 helicopter means for each design. It shows all the objects, including overlap and unusually long flights, without treating three drops of the same object as three separate helicopters. I then used a common-scale box plot to compare the centres and middle halves. My practical criterion is a gain of at least \(0.20\text{ s}\), including equality; I chose it before calculating the summaries.`,
 methodLimitation:'A mean of three drops describes that object under the stated procedure. It does not guarantee the duration of its next drop, and the constructed log cannot validate a real experimental procedure.',
 limitationConsequence:'I can establish which claims are true for these defined records, but cannot estimate a future manufacturing success rate or attribute the difference to rotor length alone.',
 limitationMitigation:'I kept the complete designs and repeated-drop structure explicit, retained B07, checked all single-object omissions and bounded a specified timing error rather than inventing a confidence interval.',
 limitationAcceptable:'I can recommend a design for mean performance within the constructed comparison and state how often its recorded object mean has the chosen advantage over a uniformly selected object from the other list.',
 dataAimLink:R`A design that has a longer average time might still be disappointing in a particular comparison. I therefore began by looking at the distribution of one three-drop mean per helicopter, rather than only the best drop or the grand mean. The two displayed groups each contain 12 objects.`
};
const completionFields={
 ...sourceFields,
 changedSincePlanning:'The larger centre for B agreed with my prediction, but its long upper tail and overlap with A made a claim of consistently better performance too strong. I added finite-pair counting and a timing-bound check after the initial summaries.',
 permissionStatus:'not-needed',permissionNotes:'This investigation uses an identified constructed log. It contains no personal data, actual school experiment, permission grant or recorded video of people.',
 firstMathsBridgePlacement:'before',firstType:'distribution',
 firstPurpose:'How do the distributions of the 12 three-drop helicopter means differ in position, overlap and unusual values?',
 firstDefinitions:definitions,
 firstPresentation:'Figure 1 shows every helicopter mean on a common seconds scale. Figure 2 uses median-of-halves quartiles, with a point for any value outside the stated 1.5 IQR fences.',
 firstMethodEvaluation:'A histogram of all 72 drops would conceal which readings came from the same object. A bar chart of two means would conceal the overlap and B07. I chose individual dots followed by boxes, retaining the three underlying readings in the working log. Neither representation by itself establishes population independence or a useful gain.',
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
 courseWhy:'I developed descriptive statistics through an outlier-sensitivity calculation, an explicit finite probability space, expected difference and algebraic error bounds. Each calculation changes what I can say about the usefulness of the design comparison.',
 courseConcern:'I have kept the investigation within descriptive statistics, finite probabilities and algebra rather than presenting a test without a meaningful sampling claim. This is a scope judgement, not recorded teacher approval.',
 mathsLearning:'I learned that the average of all A–B differences can be comfortably above a practical threshold while many individual differences fall below it. I also found that a sensitivity check can be reassuring alone but less reassuring when combined with another uncertainty.',
 notationIssue:'I distinguish a drop time t, a helicopter mean x, a group mean and the B-minus-A difference Δ. I use s_g for sample standard deviation and write seconds as a unit, avoiding an unexplained reuse of the same symbol.',
 presentationIssue:'The narrative uses the object-level distributions and compact summaries. The 72 raw readings, all 24 omission diagnostics and all 144 pair calculations remain in the editable datasets rather than being printed as long tables.',
 referencesIssue:'I identify the source as the original constructed Helicopter Flight Log v1. The figures and arithmetic are my calculations from it; no external experiment, photograph, mathematical test or borrowed result is attributed to a fabricated source.',
 finalProofread:'I have read every page of the final PDF and Word documents and checked the reader’s figures at desktop and phone widths. I found no remaining missing text, clipped equation or incomplete caption in these versions. Peer, teacher and school-format checks remain unrecorded.',
 draftComplete:'ready'
};

const stages=[
 {
  key:'object-distributions',title:'Comparing helicopters rather than counting drops',
  bridge:'My first task was to choose a comparison unit that matched the design decision. A helicopter can be dropped several times without becoming several independent objects.',
  purpose:R`I converted each elapsed-frame count to seconds using \(t=F/50\), then averaged the three times under each helicopter ID. Figure 1 plots these 12 means per design, with the same horizontal scale. A01 and B01 share a row number only; they are not matched experimental partners.`,
  technique:'Repeated-reading aggregation and comparative dot plots',methodId:'follow-journey',kind:'other',knowledge:'syllabus',
  observationText:'The B means tend to lie to the right of A, but the ranges overlap from 1.80 to 2.12 s. B07 has a three-drop mean of 2.82 s, separated from the next B mean at 2.38 s. I need to quantify the centres and spread before deciding whether the shift is useful.',
  result:R`For A01 the three counts are 88, 93 and 95 frames. Its times are \(1.76\), \(1.86\) and \(1.90\text{ s}\), giving
\[x_{A1}=\frac{88+93+95}{3\times50}=1.84\text{ s}.\]
I used the same calculation for every object. There are 36 drops of each design, but the distribution I compare has \(n_A=n_B=12\) helicopter means. The 36 readings are useful for describing repeated drops; treating them as 36 separate manufactured helicopters would change the meaning of the comparison.

The A means extend from \(1.64\) to \(2.12\text{ s}\); the B means extend from \(1.80\) to \(2.82\text{ s}\). Their ranges overlap from \(1.80\) to \(2.12\text{ s}\), although most B means lie further to the right. B07, at \(2.82\text{ s}\), is visibly separated from the next B mean, \(2.38\text{ s}\). I retained it at this stage rather than deciding from the plot that it must be wrong.`,
  interpretation:'The plot supports my initial expectation that B usually stays airborne longer within this log. It also shows two qualifications: the designs overlap, and one B helicopter has a much longer mean than the others. I need numerical centres and spreads before deciding whether the difference is useful.',
  limitations:'A three-drop mean reduces the visible influence of a single release, but does not establish how the same object would perform on its next drop. Distinct IDs identify the experimental units in the scenario; they do not prove statistical independence or representativeness of a real experiment.',
  localTakeaway:'The 12 B means tend to be larger, but the ranges overlap and B07 may affect average-based comparisons.',
  nextQuestion:'How large is the difference in centre compared with the spread of the two groups?',
  nextWhy:'I need to compare the observed advantage with my 0.20 s criterion while accounting for the overlap and the long upper tail.',
  mathsInsight:'The number of measurements and the number of experimental units are different. Equal three-drop summaries give each constructed helicopter one place in the comparison.',
  methodChangeReason:'The individual dots revealed both a shift and an unusual value, so I compared resistant and mean-based summaries together.',
  outcomeId:'different-shapes'
 },
 {
  key:'centres-and-spreads',title:'Measuring the average gain and the variability',
  bridge:'The first plot suggested a shift towards longer flights for B, but the size of that shift and its dependence on the long tail were still unclear.',
  purpose:'I calculated means and medians to describe the centres, and sample standard deviations and interquartile ranges to describe the spreads. I used median-of-halves quartiles consistently in Figure 2 and Table 1.',
  technique:'Comparative means, medians, standard deviations and interquartile ranges',methodId:'follow-journey',kind:'calculation',knowledge:'syllabus',
  result:R`The sums of the 12 helicopter means are \(\sum x_A=22.36\text{ s}\) and \(\sum x_B=25.84\text{ s}\). Therefore
\[\bar x_A=\frac{22.36}{12}\approx1.86333\text{ s},\qquad
\bar x_B=\frac{25.84}{12}\approx2.15333\text{ s},\]
and
\[\Delta=\bar x_B-\bar x_A=0.290\text{ s}.\]
This is approximately \(100(0.290/1.86333)\approx15.56\%\) of A's mean, and exceeds my \(0.20\text{ s}\) criterion by \(0.090\text{ s}\).

For spread I used \(s_g=\sqrt{\sum(x_{gi}-\bar x_g)^2/(12-1)}\). For example, \(\sum x_A^2=41.912\text{ s}^2\), so
\[s_A=\sqrt{\frac{41.912-22.36^2/12}{11}}\approx0.15011\text{ s}.\]
The analogous calculation from \(\sum x_B^2=56.448\text{ s}^2\) gives \(s_B\approx0.27067\text{ s}\). I report the usual sample standard deviation of the 12 means; it is a descriptive spread, not the standard error of a population estimate.

For 12 sorted values, I take the median of the lower six and the median of the upper six. A has \(Q_1=1.74\), median \(1.86\), and \(Q_3=1.98\), all in seconds. B has \(Q_1=1.97\), median \(2.12\), and \(Q_3=2.27\). Thus the median difference is \(0.26\text{ s}\), and the IQRs are \(0.24\) and \(0.30\text{ s}\).

Using the \(1.5\times\mathrm{IQR}\) screening rule, B's upper fence is
\[2.27+1.5(0.30)=2.72\text{ s}.\]
B07 lies above it. The upper B whisker reaches the largest non-flagged mean, \(2.38\text{ s}\); the point at \(2.82\text{ s}\) remains visible.`,
  interpretation:R`Both centre measures favour B by more than \(0.20\text{ s}\). However, B's standard deviation is about 1.80 times A's, whereas its IQR is only 1.25 times A's. The middle halves are more similar in spread than the standard deviations suggest. This discrepancy makes the upper tail worth investigating. The mean gain is also only about 1.07 of B's standard deviations, which helps explain why a larger group average can coexist with substantial overlap; this ratio is descriptive, not a test statistic.`,
  limitations:'The 1.5 IQR rule flags an unusual value under a stated convention. It does not identify a recording mistake, justify deletion or establish a probability that an observation is genuine. I have not assumed normally distributed flights or equal group variances.',
  localTakeaway:'B has a 0.290 s larger mean and a 0.26 s larger median, but its longer upper tail raises the standard deviation substantially.',
  nextQuestion:'Could omitting one helicopter, especially B07, remove the useful mean gain?',
  nextWhy:'The mean-based recommendation needs a direct influence check before I rely on it.',
  mathsInsight:'Comparing the IQR with the standard deviation located the source of the extra spread more precisely than calling B simply less consistent.',
  methodChangeReason:'The disagreement between the two spread comparisons led me to diagnose the effect of each object, keeping the source data intact.',
  outcomeId:'centre'
 },
 {
  key:'single-object-sensitivity',title:'Checking whether one helicopter controls the conclusion',
  bridge:'B07 was unusual under the box-plot rule. I investigated its influence while retaining it in the main analysis.',
  purpose:'I recalculated the mean difference after omitting each of the 24 helicopters in turn. Each diagnostic removes one object and its three drops together. Table 2 shows the full result and the diagnostic cases that define the important comparisons; the complete set of 24 calculations is saved with the project.',
  technique:'One-helicopter-at-a-time sensitivity and algebraic mean updates',methodId:'follow-journey',kind:'calculation',knowledge:'syllabus',
  result:R`B07's counts are 133, 142 and 148 frames, giving \(2.66\), \(2.84\) and \(2.96\text{ s}\). All three are longer than the next-largest helicopter mean, so its long mean is not produced by just one unusually long drop. This observation does not prove that the procedure was unbiased; it explains why deleting a single reading would not answer my question.

If I omit B helicopter \(j\), its group mean becomes \((12\bar x_B-x_{Bj})/11\). Therefore its diagnostic difference is
\[\Delta_{-B_j}=\Delta+\frac{\bar x_B-x_{Bj}}{11}.\]
For B07,
\[\Delta_{-B07}=\frac{25.84-2.82}{11}-\frac{22.36}{12}
\approx0.229394\text{ s}.\]
The reduced B mean is approximately \(2.09273\text{ s}\), and its sample standard deviation becomes \(0.17917\text{ s}\). Removing this object reduces the apparent variability markedly, but the mean difference still exceeds \(0.20\text{ s}\).

Similarly, omitting A helicopter \(i\) gives
\[\Delta_{-A_i}=\Delta+\frac{x_{Ai}-\bar x_A}{11}.\]
Across all 24 one-object omissions, the differences range from approximately \(0.229394\text{ s}\), omitting B07, to \(0.322121\text{ s}\), omitting B06. Omitting an A object gives the narrower range \(0.269697\) to \(0.313333\text{ s}\). The formulas explain the extremes: removing the largest B mean decreases B's advantage most; removing its smallest mean increases it most.`,
  interpretation:R`No single helicopter is solely responsible for the mean difference exceeding my criterion. B07 increases the mean advantage by about \(0.0606\text{ s}\), but the advantage remains about \(0.2294\text{ s}\) without it. I kept all 24 objects in my main results because the log provides no reason to label B07 erroneous. The smaller margin of only \(0.0294\text{ s}\) in that diagnostic will matter when I examine timing precision.`,
  limitations:'These are sensitivity calculations, not 24 new experiments or an uncertainty interval. They examine the absence of one supplied object at a time, not several atypical objects, a different manufacturing process or a systematic bias affecting a whole design.',
  localTakeaway:'The useful mean gain survives every single-object omission, although its smallest margin above 0.20 s is only about 0.0294 s.',
  nextQuestion:'For how many particular A–B choices is the improvement at least 0.20 s?',
  nextWhy:'The mean comparison is reasonably stable, but it still does not quantify the overlap seen in the first figure.',
  mathsInsight:'An omission formula identifies both the size and direction of influence; I do not need to treat an outlier label as an instruction to remove data.',
  methodChangeReason:'Having checked the average, I changed the object of the comparison to a specific choice from each finite list.',
  outcomeId:'centre'
 },
 {
  key:'finite-pair-comparison',title:'Separating an average improvement from a particular advantage',
  bridge:'The mean result favoured B even without any one object. I now returned to the overlapping distributions to find what that result means for a particular comparison.',
  purpose:R`I defined a finite selection experiment: choose one of the 12 recorded A means uniformly, and independently choose one of the 12 recorded B means uniformly. Each ordered pair has probability \(1/144\). I calculated \(D_{ij}=x_{Bj}-x_{Ai}\) for all \(12\times12=144\) possible choices. Figure 3 displays the distribution of these differences; it contains no additional experimental data.`,
  technique:'Finite sample-space counting and expected difference',methodId:'follow-journey',kind:'calculation',knowledge:'syllabus',
  result:R`B's recorded mean is strictly larger in 121 combinations, equal in three and smaller in 20. Thus, under this explicit uniform-selection rule,
\[P(D>0)=\frac{121}{144}\approx0.8403.\]
The useful-gain question is stricter. Exactly 86 combinations have \(D\ge0.20\text{ s}\), giving
\[P(D\ge0.20)=\frac{86}{144}\approx0.5972.\]
There are three pairs exactly on the \(0.20\text{ s}\) boundary; I include them as specified in my criterion. I compared the integer frame sums before division so floating-point rounding could not change that boundary decision.

As a check, A01's \(1.84\text{ s}\) mean requires a B mean of at least \(2.04\text{ s}\) for a useful gain; eight of the 12 B means qualify. For A05, at \(2.12\text{ s}\), only B03 at \(2.38\) and B07 at \(2.82\) meet the required \(2.32\text{ s}\). A uniform choice of A therefore averages comparisons with very different prospects of a useful gain.

The mean of all the pair differences is not a new estimate. Algebra gives
\[
E(D)=\frac{1}{144}\sum_{i=1}^{12}\sum_{j=1}^{12}(x_{Bj}-x_{Ai})
=\frac{12\sum_jx_{Bj}-12\sum_ix_{Ai}}{144}
=\bar x_B-\bar x_A=0.290\text{ s}.
\]
This expected difference can exceed \(0.20\text{ s}\) even though only about \(59.7\%\) of the individual combinations reach it. The differences range from \(-0.32\text{ s}\) to \(1.18\text{ s}\), so the sizes of gains and losses matter as well as their counts.`,
  interpretation:'For a uniform choice from these two finite lists, B has a higher recorded mean in about 84% of comparisons, but provides the full useful gain in only about 60%. This changes how I would describe the recommendation: B is attractive for its average performance, while a useful advantage in a particular comparison is much less certain. A probability of 0.5972 here is a property of my stated list-selection experiment, not the chance that a newly made B helicopter will outperform a newly made A helicopter.',
  limitations:'The 144 differences reuse the same 24 object means many times. They are not independent experimental trials, and I do not use 144 as a statistical sample size or attach a binomial confidence interval. The selection rule concerns three-drop means, not the outcome of a single future drop.',
  localTakeaway:'The expected finite-list difference is 0.290 s, but only 86/144 pair choices give the chosen 0.20 s useful gain.',
  nextQuestion:'Could the frame-selection precision change either the average recommendation or the useful-pair count?',
  nextWhy:'Some pair differences lie exactly on the criterion, and the smallest omission margin is small, so display precision alone cannot establish the stability of the decision.',
  mathsInsight:'The expected difference equals the difference of means, whereas the probability of exceeding a threshold depends on the whole distribution of pair differences.',
  methodChangeReason:'The threshold count exposed boundary cases, which gave me a specific reason to propagate a stated timing error.',
  outcomeId:'sampling'
 },
 {
  key:'timing-bound',title:'Testing the conclusion against frame-selection error',
  bridge:'The frame counts fix the arithmetic, but their 0.02 s spacing would not make a real measured duration exact. I examined a specific timing scenario before stating my final recommendation.',
  purpose:R`I assumed a fixed rate of 50 frames per second and that each release and first-contact event could be located within half a frame of its recorded endpoint. I used worst-case bounds, without assuming independent or cancelling timing errors. Table 3 separates the full-data result from the B07-omission diagnostic.`,
  technique:'Endpoint error propagation and threshold sensitivity bounds',methodId:'follow-journey',kind:'calculation',knowledge:'syllabus',
  result:R`One frame lasts \(1/50=0.02\text{ s}\). Each endpoint can therefore be displaced by at most \(0.01\text{ s}\). Since duration is end time minus start time, the error in one duration satisfies
\[|\varepsilon_t|\le0.01+0.01=0.02\text{ s}.\]
For a three-drop mean,
\[|\varepsilon_x|=\left|\frac{\varepsilon_1+\varepsilon_2+\varepsilon_3}{3}\right|
\le\frac{0.02+0.02+0.02}{3}=0.02\text{ s}.\]
The bound does not become \(0.02/3\): all errors could have the same sign. Averaging the 12 object means does not reduce this worst-case bound either. Consequently the B-minus-A group difference and each pair difference can shift by at most \(0.04\text{ s}\).

For the full log, the corresponding mean-difference interval is
\[0.290-0.040\le\Delta_{\rm adjusted}\le0.290+0.040,
\qquad 0.250\le\Delta_{\rm adjusted}\le0.330.\]
It remains above \(0.20\text{ s}\). More generally, if each duration has error bounded by \(\delta\), the lowest possible difference is \(0.290-2\delta\). The full-data useful mean gain is guaranteed under that error model exactly while \(\delta\le0.045\text{ s}\).

For the pair count, any recorded difference of at least \(0.24\text{ s}\) remains at least \(0.20\) after the largest adverse shift. There are 78 such pairs. A recorded difference below \(0.16\text{ s}\) cannot reach \(0.20\) even after the largest favourable shift; 95 pairs have differences of at least \(0.16\). Thus
\[\frac{78}{144}\le P(D_{\rm adjusted}\ge0.20)\le\frac{95}{144},\]
or approximately \(54.2\%\) to \(66.0\%\), for the same uniform selection from the lists. These bounds can be attained within this error model: shifting every B mean down by \(0.02\) and every A mean up by \(0.02\) attains the lower count; reversing the shifts attains the upper count.

Finally, combining the B07-omission diagnostic with the adverse timing bound gives
\[0.2293939-0.040\approx0.1893939\text{ s},\]
which is below the useful-gain criterion. Omission alone and timing alone preserved that criterion, but their combination need not.`,
  interpretation:'The full-data recommendation is stable under the specified frame-selection bound, and the finite-list probability still indicates that a useful gain is far from guaranteed in every comparison. The combined sensitivity check prevents a stronger claim: if I both discount the most favourable B object and allow a design-wide timing shift, the mean gain need not reach 0.20 s. This does not justify deleting B07 or establish that such a shift occurred. It identifies how little evidence is available for an unconditional practical guarantee.',
  limitations:'These are deterministic sensitivity bounds, not a confidence interval. The half-frame assumption requires the two events to be identifiable; occlusion, inconsistent release height, frame-rate error or changes to the paper over repeated drops could create other errors. No supplied video or physical measurements validate those conditions.',
  localTakeaway:'All recorded objects support B for mean performance, including the stated timing bound, but the useful-gain claim is conditional and individual pair outcomes remain variable.',
  nextQuestion:'Would the same useful mean gain persist for a new independently constructed batch under a recorded, interleaved drop protocol?',
  nextWhy:'I have answered the fixed-log question. Testing a new batch with traceable release conditions would address the unresolved transfer to real objects more directly than adding another statistic to the same constructed records.',
  mathsInsight:'Averaging reduces neither a worst-case shared error nor the need to state what the error bound covers. Two individually reassuring sensitivity checks can have a less reassuring combined effect.',
  methodChangeReason:'I joined the timing and object-influence checks because both affect the same 0.20 s decision, then stopped rather than claiming a population result.',
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
  intendedUse:'Compare both average performance and the proportion of finite A–B choices with at least 0.20 s advantage, keeping the recommendation within the stated log.',
  kind:'statistics',statisticsContext:'Two groups',dataSource:'secondary',dataAvailability:'in-hand',course:'AI SL',
  prediction:'I expect design B, with the longer rotors, to have the longer typical flight time. I am less certain whether its advantage will be consistent across individual helicopters.',
  predictionWhy:'Longer rotors suggest a possible way to slow descent, but the complete designs also have different body lengths. This is a starting intuition, not an established physical law or proof of the outcome.',
  predictionImplication:'If the gain is large relative to the spread, I could choose B for the demonstration; if there is substantial overlap, I will need to explain the limits of that recommendation.',
  courseSuitability:'yes',mathsOutside:'syllabus',
  otherMaths:'I may enumerate the finite choices of one helicopter from each list to distinguish average gain from the frequency of a useful individual difference.',
  mathsRevisedWhy:'I will let the plotted shape and the practical 0.20 s threshold determine whether sensitivity or finite-pair calculations add something the group summaries cannot show.',
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
 introduction:R`I enjoy the contrast between a simple paper object and the complicated motion it produces. When choosing a paper helicopter for a demonstration, I would prefer one that stays airborne longer, but I would also want to know whether a reported improvement is typical or depends on a few fortunate flights. This led me to compare two designs using both the size and consistency of their flight-time advantage.

My aim is to compare the three-drop mean flight times of designs A and B from the same stated release height, and decide whether B offers a useful advantage relative to their variability. I defined a useful gain as at least \(0.20\text{ s}\), equal to ten frame intervals at the stipulated recording rate. I decided that an improvement of only one or two intervals would not be enough to change my design choice. This is my personal decision threshold, not an externally established performance requirement. I use it throughout instead of choosing a threshold after seeing the results.

The source is an explicitly constructed flight log representing 12 separate helicopters of each design, with three drops per helicopter. It is a fictional experimental scenario, not a record of flights I performed. The mathematical conclusions will describe those supplied objects and the stated measurement model. I expected B's longer rotors to increase the typical flight time, while recognising that both designs could have enough variation to make a particular comparison uncertain.`,
 dataNotes:R`The scenario uses the same \(18\text{ cm}\times4\text{ cm}\) paper blank and one identical clip for each object. The upper part is split into two \(2\text{ cm}\)-wide rotor strips, folded in opposite directions. A has \(6\text{ cm}\)-long rotors and B has \(9\text{ cm}\)-long rotors, leaving different body lengths. The lower body is folded lengthwise to the same nominal width and the clip is attached at its bottom. I compare these two complete layouts; I cannot isolate rotor length as the only physical cause because changing the slit also changes the body geometry.

The stated procedure releases each object without a push, with the bottom of its clip \(2.00\text{ m}\) above the floor in the same still indoor setting. Flight time runs from release to first contact. The three columns represent three drop rounds, with A and B intended to be interleaved. These conditions define the hypothetical log. There is no actual video, random allocation or recorded run order that could verify them, so I do not use them as evidence that a real experiment eliminated drift or release bias.

At the defined rate of 50 frames per second, I convert each integer frame count \(F\) into \(t=F/50\) seconds. I use one mean \(x\) of the three drops for each helicopter, then compare the 12 values of \(x\) in each design. The three drops within one ID are repeated measurements; corresponding A and B row numbers are not paired subjects. I included all objects and checked that there were no missing counts. The complete frame log is retained in the editable dataset.

I retain exact frame sums while calculating, report object means to \(0.01\text{ s}\) and standard deviations to \(0.001\text{ s}\), and use approximation signs for rounded outputs. Fractions of a frame produced by averaging are arithmetic results, not proof of more accurate timing. I examine a separate explicit error bound after the group comparison.`,
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
  mainConclusion:R`Within the constructed log, I would choose design B for its longer average flight time. Its mean three-drop performance is approximately \(2.153\text{ s}\), compared with \(1.863\text{ s}\) for A: a gain of \(0.290\text{ s}\), or about \(15.6\%\). The median gain of \(0.26\text{ s}\) also exceeds my chosen useful-gain threshold of \(0.20\text{ s}\). Every one-helicopter omission leaves the mean gain above that threshold, and the full-log gain remains between \(0.250\) and \(0.330\text{ s}\) under the stated timing model.

However, that average advantage is not a reliable promise for every particular comparison. If I choose uniformly and independently from the two lists of 12 recorded helicopter means, B is strictly higher in \(121/144\) choices, but exceeds A by at least \(0.20\text{ s}\) in only \(86/144\), approximately \(59.7\%\). The design preference is supported on average for these objects; the more demanding claim of a useful individual advantage is much less consistent.`,
  conclusionBenefit:R`My prediction about B's larger typical time was supported, while its greater variation mattered more than I initially expected. B07 increased the standard deviation strongly, but retaining or diagnosing that object did not reverse the mean ordering. The timing model gives a useful-pair proportion between about \(54.2\%\) and \(66.0\%\). If I combine the omission of B07 with the most adverse allowed timing shift, the mean gain falls to about \(0.1894\text{ s}\), so I cannot claim that every sensitivity combination preserves the \(0.20\text{ s}\) benefit.

The comparison uses 24 object means, not 72 independent helicopters or 144 independent pair trials. Its probabilities describe uniform selection from the fixed lists, not future flights or newly manufactured helicopters. The source is constructed, the complete designs differ in more than rotor length, and the video-error bound excludes other experimental biases. Those restrictions define the scope of my recommendation.`,
  conclusionExtension:'I would next compare a new batch of separately constructed objects under a recorded interleaved release order, using the same useful-gain threshold and an independently checked timing method. I would record the three drops and the object identities separately so that between-object variation and repeatability could be examined without increasing the apparent number of helicopters. That would test whether the present design preference transfers beyond this finite constructed log.'
 },
 reviews:[
  {id:'D01',location:'Introduction, five mathematical stages and conclusion',note:'I have a stated decision threshold, the complete constructed inputs, completed calculations, interpretations and a conclusion answering the original comparison. The draft is mathematical work rather than a collection plan.',action:'School submission and teacher feedback are separate processes; neither is claimed here.'},
  {id:'D02',location:'Transitions from the first distribution to the timing-bound section',note:'Each next question follows a specific finding: overlap, tail-sensitive spread, single-object influence, finite-pair usefulness and timing boundary cases. The conclusion returns to the original 0.20 s threshold.',action:'I removed the need for a significance test by stating the finite-list scope instead of attaching an unsupported population claim.'},
  {id:'D03',location:'Variable definitions, Figures 1–3 and Tables 1–3',note:'I distinguished frames, drop times, object means, group means and differences. Box-plot quartiles use the stated convention; the timing bounds and pair counts include equality at the useful-gain threshold.',action:'I checked displayed rounded values against unrounded frame-sum calculations and kept seconds attached to numerical timing results.'},
  {id:'D04',location:'Choice of 0.20 s, B07 diagnostic and finite-pair question',note:'My decisions shape the mathematics: I specify usefulness, give each helicopter one mean, retain an unusual value and change the comparison from average gain to a particular finite-list choice.',action:'I explain why each of those decisions is relevant to the demonstration I am considering.'},
  {id:'D05',location:'Interpretations after the summaries, omissions, pair counts and timing bounds',note:'I explain why standard deviation and IQR tell different stories, why a useful mean does not imply consistent individual gains, and why combining two sensitivity checks can weaken the conclusion.',action:'I retain the combined 0.1894 s diagnostic in the conclusion rather than presenting only the reassuring checks.'},
  {id:'D06',location:'Mean and SD calculations, omission formulas, pair-space identity and error propagation',note:'I checked the three-drop denominators, the n−1 standard deviations, all 24 omission results and all 144 finite comparisons. I derived the expected-difference identity and propagated endpoint bounds without assuming cancellation.',action:'I independently recomputed the numeric claims from the integer frame log; any change to the log requires the figures and conclusion to be recomputed.'},
  {id:'D07',status:'checked',location:'Continuous reader and exported PDF/Word pages',note:'I checked the reader’s figures at desktop and phone widths and every page of the PDF and Word exports. The worked fractions, standard-deviation formula, pair-sum identity and timing bounds remain complete, and all three figures and three tables retain their labels, units and source notes.',action:'I replaced the misleading measurement wording, compacted Table 1 and shortened the transition and A01 counting example. I rechecked the revised pages for clipping, isolated text and missing captions.'},
  {id:'D09',location:'Source record, opening disclosure and data references',note:'I identify the log, procedure and frame-rate assumption as constructed teaching material. I have no real video, randomised experiment, borrowed image or external dataset to cite.',action:'I have not added a fabricated publication or source URL; the complete internal data record is retained.'},
  {id:'D11',location:'All five mathematical stages',note:'The draft contains worked object means, a standard-deviation calculation, quartile fences, omission algebra, exact pair counts and conditional error bounds. Each output is followed by its meaning for the design decision.',action:'I checked that the conclusion refers to completed calculations rather than my initial prediction.'},
  {id:'D19',location:'Short narrative tables and three editable working datasets',note:'The plots show all 24 object means, and the main text includes the calculations needed to understand the result. The full raw log, omission list and pair list remain available without inserting a 144-row table into the narrative.',action:'I label the displayed omission cases as selected diagnostics and preserve every omitted-case result in the working dataset.'},
  {id:'D20',location:'Finite-pair counting and statistical diagrams',note:'I state the integer inputs and threshold operation, check an eight-success row by hand and derive why the mean pair difference must equal the group-mean difference. The figures use those same object means.',action:'I retained the saved statistical drafts and exact frame counts so the calculations can be reproduced and edited.'}
 ],
 references:[
  {label:'Constructed source',value:'Helicopter Flight Log v1. Original 24-object teaching dataset supplied with this project. All 72 integer elapsed-frame counts, the assumed 50 frames-per-second conversion and object identities are retained in the editable working data. No physical measurements or randomised experiment are claimed.'},
  {label:'Calculation records',value:'All one-helicopter omission diagnostics and all 144 finite A–B choices. My calculations from the stated source, retained with the project. The box-plot convention and error model are defined in the investigation; no external inferential result is used.'}
 ]
};
