import {newStatDraft} from "../../diagrams/stat-studio-core.js";
import {newTableDraft} from "../../diagrams/table-studio-core.js";
import {SOURCE_FIELDS} from "../../completing/evidence-links.js";

/** Fixed constructed inputs, not a survey or a random simulation. Each row of
 * REVISION_RESPONSES represents one anonymous response slot with one choice.
 * All narrative values, editable figures and working records use this table. */
const R=String.raw;
export const REVISION_YEARS=Object.freeze(["Year 11","Year 12","Year 13"]);
export const REVISION_FORMATS=Object.freeze(["Video","Quiz","Problems"]);
export const REVISION_COUNTS=Object.freeze([
 Object.freeze([27,18,15]),Object.freeze([24,24,32]),Object.freeze([19,31,50])
]);
export const REVISION_ALPHA=0.05;
const sum=values=>values.reduce((total,value)=>total+value,0);
const digits=(value,places=2)=>Number(value).toFixed(places);
const rawTable=(columns,rows)=>[columns.join("\t"),...rows.map(row=>row.join("\t"))].join("\n");

let responseNumber=0;
export const REVISION_RESPONSES=Object.freeze(REVISION_COUNTS.flatMap((row,i)=>
 row.flatMap((count,j)=>Array.from({length:count},()=>Object.freeze([
  "R"+String(++responseNumber).padStart(3,"0"),REVISION_YEARS[i],REVISION_FORMATS[j]
 ])))
));

// The closed form here is specific to four degrees of freedom. It evaluates
// the same right-tail probability as scipy.stats.chi2_contingency, checked
// independently when authoring. It is not a general chi-squared calculator.
function analyseCounts(counts){
 const rowTotals=counts.map(sum),columnTotals=counts[0].map((_,j)=>sum(counts.map(row=>row[j])));
 const n=sum(rowTotals),expected=rowTotals.map(row=>columnTotals.map(column=>row*column/n));
 const contributions=counts.map((row,i)=>row.map((value,j)=>(value-expected[i][j])**2/expected[i][j]));
 const chi2=sum(contributions.map(sum)),df=(counts.length-1)*(counts[0].length-1);
 if(df!==4)throw new Error("This authored probability calculation requires four degrees of freedom.");
 return {rowTotals,columnTotals,n,expected,contributions,chi2,df,p:Math.exp(-chi2/2)*(1+chi2/2)};
}
export const REVISION_ANALYSIS=analyseCounts(REVISION_COUNTS);
function reclassify(year,from,to,count=1){
 const counts=REVISION_COUNTS.map(row=>[...row]);
 counts[year][from]-=count;counts[year][to]+=count;
 return {year,from,to,count,counts,...analyseCounts(counts)};
}
export const REVISION_SINGLE_CORRECTIONS=Object.freeze(REVISION_YEARS.flatMap((_,year)=>
 REVISION_FORMATS.flatMap((_,from)=>REVISION_FORMATS.flatMap((_,to)=>
  from===to?[]:[reclassify(year,from,to)]
 ))
));
export const REVISION_DIRECTED_CHECKS=Object.freeze([1,2,3,4].map(count=>reclassify(0,0,2,count)));
const weakestSingle=REVISION_SINGLE_CORRECTIONS.reduce((a,b)=>a.chi2<b.chi2?a:b);
const strongestSingle=REVISION_SINGLE_CORRECTIONS.reduce((a,b)=>a.chi2>b.chi2?a:b);
const sourceId="source-revision-formats-cases";
const sourceText="Revision Format Cases v1: 240 constructed response slots; no real students were surveyed.";
const countRows=REVISION_COUNTS.map((row,i)=>[REVISION_YEARS[i],...row,REVISION_ANALYSIS.rowTotals[i]]);
countRows.push(["Total",...REVISION_ANALYSIS.columnTotals,REVISION_ANALYSIS.n]);
const countColumns=["Year group","Video","Quiz","Problems","Total"];
const barColumns=["Year group",...REVISION_FORMATS];
const barRows=REVISION_COUNTS.map((row,i)=>[REVISION_YEARS[i],...row]);
function tableDraft({title,number,columns,rows,purpose,note,original=false}){
 return {...newTableDraft(),mode:"compact",headers:"yes",columns,headings:columns,
  matrix:rows.map(row=>row.map(String)),raw:rawTable(columns,rows),
  unitDecisions:columns.map(()=>({mode:"dimensionless",unit:""})),
  title,number:String(number),purpose,sourceKind:original?"secondary":"theoretical",
  sourceText:original?sourceText:"My calculations from Revision Format Cases v1.",note,
  numberFormat:"source",showRowLines:true,cellAlignment:"numeric"};
}
const barDraft={...newStatDraft(),kind:"bar",headers:"yes",columns:barColumns,
 matrix:barRows.map(row=>row.map(String)),raw:rawTable(barColumns,barRows),
 categoryIndex:0,selected:[1,2,3],barStyle:"stacked100",barMode:"percent",barLabels:"percent",
 barSort:"source",title:"Preferred revision format within each year",figureNumber:"1",
 variable:"Year group",unitMode:"dimensionless",sourceKind:"secondary",sourceText,
 min:"0",max:"100",showGrid:true,showLabels:true,
 caption:"Each bar uses its own year total: Year 11 n=60, Year 12 n=80, Year 13 n=100. The three choices within each year sum to 100%."
};
const sourceFields={
 dataStatus:"ready",actualSourceType:"secondary",actualSource:sourceText,
 sourceCitation:"Revision Format Cases v1. Original constructed teaching dataset supplied with this illustrative project; the nine defining counts and all 240 expanded response records are retained.",
 actualMethod:"I used the fixed 3×3 count table, then expanded it into anonymous records. Within Year 11 I assigned 27 Video, 18 Quiz and 15 Problems records; within Year 12, 24, 24 and 32; within Year 13, 19, 31 and 50. Sequential IDs identify slots, not people or times of response.",
 statisticalPopulation:"My descriptive results concern the 240 supplied response slots. The chi-squared calculation uses a hypothetical independent-response sampling model for Years 11–13; I have no observed school population from which to infer preferences.",
 samplingMethod:"The counts were deliberately constructed before this analysis. I did not draw a random sample, collect replies or reconstruct a real survey. I analysed every supplied slot.",
 samplingRationale:"The unequal year totals let me distinguish counts from within-year proportions. I use the independence model as an explicit conditional comparison, while keeping real-population inference outside what these inputs establish.",
 sampleSize:"240 constructed responses: 60 in Year 11, 80 in Year 12 and 100 in Year 13. Format totals are 70 Video, 73 Quiz and 97 Problems.",
 pairing:"Each record contains one year group and one preferred format from the same response slot. A record enters exactly one cell; I do not count the three possible choices as three responses.",
 responseBias:"A forced first choice can depend on the wording and immediate revision task. For a real survey, volunteers, friend groups, class teachers and examination exposure could all affect the comparison. These constructed counts contain no evidence that such effects were controlled.",
 dataCleaning:"I checked unique record IDs, valid year and format labels, one choice per record, and agreement between the expanded records and every table margin. I retained all 240 records; none are missing, excluded or combined.",
 methodLimitation:"Adequate expected counts do not establish random selection or independent real responses. Also, a preference describes a first choice, not the effectiveness of that revision activity.",
 limitationConsequence:"The p-value is conditional on a sampling model, and the best matching rule describes these same cases. Neither establishes how a real school would respond or which resource improves examination performance.",
 limitationMitigation:"I separated the observed proportions, the conditional test and the resource-matching calculation. I also evaluated every single-record format correction and a stated larger correction scenario without replacing the original inputs.",
 limitationAcceptable:"I can explain the association in this fixed table, calculate what the independence model would make of it, and measure how much a year-based recommendation changes preference matching within these cases."
};
const completionFields={
 ...sourceFields,
 changedSincePlanning:"The direction of the percentage differences matched my initial expectation, but I had overestimated how useful year group would be for choosing just one format. The calculated gain is only 12 matches out of 240, so I changed the proposed recommendation to a choice of resources with a possible year-based starting suggestion.",
 permissionStatus:"not-needed",permissionNotes:"I used only constructed response slots. There are no participant identities, collected replies or claimed survey permissions.",
 dataStatusSummary:"All nine supplied counts and all 240 expanded records are available. What remains unknown is how an actual school would respond to the same question.",
 dataAimLink:R`My aim concerns the distribution of first choices within each year, so the useful denominator is that year's response total. I need to compare those conditional proportions before deciding what an independence test or a resource recommendation would add.`,
 methodReason:R`I began with a two-way count table because every response has two categorical labels. I then converted each row to percentages for a \(100\%\) stacked bar chart. This preserves the three-part choice within each year while making years with \(60\), \(80\) and \(100\) records comparable.`,
 firstPurpose:"I want to establish which revision formats differ in their within-year shares, and which apparent count differences are explained by unequal year totals.",
 firstMethodEvaluation:"I considered separate pie charts, but aligned bars give me a common percentage scale. A scatter diagram or a mean of format codes would impose numerical meaning on labels. The table and bars describe the cases accurately, but cannot judge the size of a discrepancy under an independence model or establish a causal effect of year group.",
 firstMathsBridgePlacement:"before",firstType:"table",
 firstDefinitions:R`\(O_{ij}\) is the supplied count in year \(i\) and format \(j\); \(n_i\) is a year total, \(m_j\) a format total, and \(n=240\). \(E_{ij}\) is an expected count under independence. These are counts, not percentages.`,
 firstPresentation:"Table 1 contains all row and column totals. Figure 1 uses a zero-to-100 percentage scale, retains the same format order in each year, and identifies the three denominators in its caption.",
 accuracyForResult:"I keep the integer counts exact and use unrounded expected values in every test. I display expected counts to two decimal places, contributions to four, and p-values to six; I compare the unrounded p-value with 0.05.",
 variableDefinitions:R`\(i\) labels Years 11, 12 and 13; \(j\) labels Video, Quiz and Problems. \(O_{ij}\), \(E_{ij}\), \(n_i\), \(m_j\) and \(n\) are counts. \(\chi^2\) is the summed discrepancy statistic, \(p\) its right-tail probability under the null model, and \(\alpha=0.05\) my decision threshold. A percentage-point difference is a subtraction of percentages.`,
 specialistTerms:"A first-choice match means that the recommended format equals the single format recorded for that response. It does not measure satisfaction with all resources, time spent revising or improved learning.",
 alternativeMethod:"I could stop with descriptive percentages if I wanted only to summarise these cases. I used a conditional independence calculation to examine how the same discrepancy would compare with a specified sampling model, then returned to proportions and match counts for practical meaning.",
 chosenMethod:"Within-year proportions, a chi-squared independence calculation with checked expected counts, cell contributions, two resource-matching rules and explicit format-reclassification sensitivity.",
 accuracyQuantity:"Response counts",accuracySymbol:"O, E",accuracyUnit:"",
 accuracyResolution:"Supplied counts are exact non-negative integers. Expected counts are calculated values and may be fractional.",
 accuracyPolicy:"I never round expected counts before calculating contributions; I retain full precision for the p-value comparison and report proportions with their denominators.",
 accuracyReason:"Rounding expected counts would change the test statistic even though no response has changed. Integer source counts do not remove uncertainty about category meanings or the relevance of the sampling model.",
 pairedDataType:"categorical",
 predictionComparison:"Video preference falls from 45% in Year 11 to 19% in Year 13, and Problems rises from 25% to 50%, as I had expected. However, recommending a separate modal format for each year raises matching only from 40.4% to 45.4% in these cases.",
 benefitFinding:"The calculated year pattern can suggest the first resource displayed in my proposed menu, but it does not support hiding the other formats. More than half of the cases would still receive a different format from their recorded first choice.",
 technologyTool:"I used the native statistical and table generators for the figures, and a short calculation with Python/SciPy to verify the chi-squared statistic, expected frequencies, four degrees of freedom and right-tail probability. The saved working calculations use the equivalent df=4 tail formula.",
 technologyInput:"The 3×3 matrix [[27,18,15],[24,24,32],[19,31,50]], excluding totals. I used Pearson's chi-squared test with correction=False, and recomputed expected counts from the new margins for each hypothetical correction.",
 technologyOutcome:R`I obtained \(\chi^2\approx14.54330179\), \(df=4\) and \(p\approx0.005748497\). Across all 18 single-response format corrections, \(p\) ranged from approximately \(0.002532\) to \(0.012148\).`,
 technologyInterpretation:"I reproduced one expected count and one contribution by substitution, checked the statistic by summing the contributions, and compared the probability with SciPy and NIST's critical value. The software evaluates the null-model tail; it cannot establish that my inputs came from independent random sampling.",
 courseWhy:"My main methods are AI SL conditional proportions and chi-squared independence. The later comparisons use the same counts, arithmetic and the stated test; they answer whether the apparent association helps my resource decision.",
 courseConcern:"I used the four-degree-of-freedom tail expression to reproduce a technology output, without making a derivation of the chi-squared distribution part of the investigation. I would discuss whether my explanation of the conditional inference is sufficiently clear.",
 mathsLearning:"I learned that a statistically unusual table can provide only a small improvement in a practical decision. I also saw that changing a significance decision need not remove the visible proportional differences.",
 notationIssue:"I use O for supplied counts and E for expected counts. I distinguish p, a probability under the null model, from within-year preference proportions and from the 5% significance threshold.",
 presentationIssue:"I retained only the contingency, expected-count, contribution and sensitivity tables in the narrative, with the percentage chart beside its interpretation. The complete 240-record expansion and every single-correction result remain in the editable working data.",
 referencesIssue:"I identified the original constructed data separately from the mathematical sources. I consulted OpenStax for the independence-test setup, NIST for the distribution and critical value, and SciPy's own documentation for the numerical check; none supplied the response counts.",
 draftComplete:"ready",
 finalProofread:"I checked my arithmetic and source links, read every page of the PDF and Word exports, and inspected the reader at desktop and phone widths. The contribution and sensitivity tables, percentage denominators and mathematical expressions remain complete and legible. I have not recorded a peer, teacher or school-format check."
};

export const REVISION_FORMATS_SPEC={
 id:"revision-formats",routeId:"categorical",
 title:"Does year group help me choose a maths revision format?",
 description:"A categorical association is tested, explained and put to practical use: how much does knowing the year improve a first-choice recommendation?",
 course:"AI SL",mathSelected:["AI13","AI20"],technologyStage:2,
 readingNote:"A complete fictional student investigation using an explicitly constructed 240-response case set. The counts, anonymous expansion and sensitivity calculations are supplied with the editable project.",
 provenance:"This is an original fictional student investigation using constructed teaching material, not a survey of real students. Revision Format Cases v1 fixes Year 11 counts at 27 Video, 18 Quiz and 15 Problems; Year 12 at 24, 24 and 32; and Year 13 at 19, 31 and 50. I expand those counts in year order and then Video/Quiz/Problems order, assigning anonymous slot IDs R001–R240. Each slot has exactly one year and one choice. This deterministic construction is not a random simulation. The first-person account explains completed mathematics on these fixed inputs; it claims no real collection, permissions, teacher feedback, submission or awarded mark.",
 planning:{
  planIdentifier:"Revision-format preference and a first-resource recommendation",ideaStatus:"yes",
  provisionalTitle:"Does year group help me choose a maths revision format?",
  idea:"I want to compare the first maths revision format chosen by different year groups and see whether that information would help me design a resource menu.",
  aim:"I want to investigate how year group is associated with preferred maths revision format in the supplied constructed Years 11–13 response set, and whether using year group meaningfully improves a single-format first recommendation.",
  motivation:"When I revise I have to choose between watching an explanation and attempting questions. I am interested in whether a useful starting suggestion should depend on year group, while still allowing students to choose for themselves.",
  beneficiaryType:"me",beneficiary:"I would use the result to decide how to organise the first suggested resource in my proposed maths revision menu.",
  intendedUse:"I will compare one format suggested to everyone with a format chosen separately for each year, measuring how many supplied first choices each rule matches.",
  kind:"statistics",statisticsContext:"Two categorical variables",dataSource:"secondary",course:"AI SL",
  prediction:"I expect the older-year cases to prefer extended problems more often and worked-example videos less often. I am less certain that year group will identify a useful single recommendation for most cases.",
  predictionWhy:"Examination-style practice seems a plausible priority nearer the end of school, whereas an explained example could be a more attractive starting point earlier. This is a conjecture about the defined scenario, not an observed age effect.",
  predictionImplication:"If within-year preferences differ enough, a year-specific first suggestion might match more cases. If the gain is small, a choice of formats may be more useful than one default.",
  courseSuitability:"yes",mathsOutside:"syllabus",
  permissionNeed:"no",permissionDetails:"I will analyse only supplied constructed response slots. I am not proposing a survey or using personal information.",
  practicalBlocker:"no",dataAvailability:"in-hand",
  firstAction:"I will prepare a two-way table and divide each year row by its own total before comparing preferences.",
  firstAccuracy:"I will keep source counts exact and retain unrounded expected counts. Percentages will always show or identify the year denominator; significance decisions will use the unrounded p-value.",
  secondaryPublisher:"Revision Format Cases v1, original constructed teaching data supplied with this sample.",
  secondaryVariables:"One year label (Year 11, Year 12 or Year 13) and one preferred format (Video, Quiz or Problems) per anonymous response slot. These are categories without measurement units.",
  secondaryScope:"All 240 defined response slots: 60 Year 11, 80 Year 12 and 100 Year 13. The same forced-choice question and three format definitions apply to every year.",
  secondaryVerified:"yes",secondaryStatus:"ready",
  secondarySamplingOrigin:"The nine counts define a constructed response set. There is no real sampling frame, response rate or random selection process to verify.",
  alternativeMethod:"Descriptive percentages alone would answer how these cases differ. A chi-squared test may add a conditional comparison with independence, provided I state its sampling assumptions and check every expected count first.",
  teacherNeed:"I would discuss the distinction between describing the constructed cases and making a conditional inference under a sampling model.",
  teacherQuestion:"Is the purpose and limitation of my independence calculation clear enough when the response counts are constructed?",
  teacherSafeAction:"I can check that the category definitions, anonymous records, totals and within-year percentages agree before seeking feedback.",
  universalTeacherQuestion:"Have I connected the practical matching calculation closely enough to my original aim?",
  timelineWeeks:"6",timelineEarly:"yes",
  milestoneAdjustment:"My provisional six-week sequence is to check the cases and definitions, compare percentages, develop the independence calculation, assess practical matching and sensitivity, then write and review. I aim to finish the working draft early enough to revise it. These are relative milestones, not school-confirmed dates."
 },
 completion:completionFields,
 introduction:R`When I revise mathematics, watching a worked example and attempting a set of problems feel like different starting points. I wanted to know whether year group would help me make a sensible first suggestion in a revision-resource menu. I was especially interested in the difference between detecting a pattern and making a recommendation that suits an individual.

My aim is to investigate how year group is associated with preferred maths revision format in the supplied constructed Years 11–13 response set, and whether using year group meaningfully improves a single-format first recommendation. The three options are a worked-example video, a self-marking quiz and extended exam-style problems. I compare preferences, not which activity produces better learning.

I expect the older-year cases to favour extended problems more often. My proposed practical comparison is between suggesting one format to everyone and selecting a format separately for each year. I will count a recommendation as a match only when it equals the recorded first choice. This gives me a concrete way to judge how useful an association would be. My investigation uses the declared constructed material; any conclusion about a real school would require actual response evidence.`,
 dataNotes:R`The fixed question is: “If you had one \(20\)-minute session to revise mathematics before a test, which of these three activities would you choose first?” Video means watching a worked-example explanation; Quiz means answering short self-marked questions with immediate answers; Problems means writing extended exam-style solutions before checking a worked solution. Each slot selects one option only, even if more than one activity might be useful. These operational definitions make the recorded categories mutually exclusive; they do not imply that learning activities never overlap.

My source is Revision Format Cases v1 [D1]. Its defining counts are \((27,18,15)\), \((24,24,32)\) and \((19,31,50)\) in Year 11, Year 12 and Year 13 respectively, in Video–Quiz–Problems order. I expanded them in that order into IDs R001–R240. Thus R001–R027 are Year 11 Video slots, and the same consecutive-block rule produces the remaining records. The IDs are bookkeeping labels, not collection order or participant identities. I checked that each appears once and that every record has both required labels.

Before evaluating the test, I fixed \(\alpha=0.05\) and the rule: reject the independence model when its right-tail \(p<0.05\), otherwise do not reject it. I kept the three categories and all records unchanged. For that conditional calculation I assume separate responses, independent between individuals, from a well-defined Years 11–13 sampling population. The constructed input does not establish those sampling conditions; I distinguish this model comparison from evidence about a real population.`,
 stages:[
  {
   key:"within-year-pattern",title:"Comparing preferences on the same scale",
   bridge:"I first needed to know whether differences in the number of choices reflected different preferences or simply different numbers of records in each year.",
   purpose:R`Table 1 preserves all nine supplied counts and both sets of margins. In Figure 1 I divide each count by its own row total, so each year occupies one complete \(100\%\) bar.`,
   technique:"Two-way frequency table and conditional proportions",methodId:"other",kind:"other",knowledge:"syllabus",
   observationText:"The within-year Video share falls from 45% to 19% and Problems rises from 25% to 50%, while Quiz stays at about 30%. The year totals differ, so the nearly unchanged Quiz proportion is more informative than its increase from 18 to 31 records.",
   result:R`The year totals are \(60\), \(80\) and \(100\), giving \(n=240\). The format totals are \(70\) Video, \(73\) Quiz and \(97\) Problems. For example,
\[
 P(\text{Video}\mid\text{Year 11})=\frac{27}{60}=0.45,
 \qquad P(\text{Video}\mid\text{Year 13})=\frac{19}{100}=0.19.
\]
Here these probabilities describe a uniformly chosen slot from the specified year. The within-year percentages in Video–Quiz–Problems order are \((45,30,25)\), \((30,30,40)\) and \((19,31,50)\).

The Video share decreases by \(45-19=26\) percentage points between Years 11 and 13; the Problems share increases by \(50-25=25\) points. Quiz is almost unchanged at \(30\%\), \(30\%\) and \(31\%\). Its raw count rises from \(18\) to \(31\), which would suggest a much larger difference if I ignored the denominators.`,
   interpretation:R`The main pattern is a change between Video and Problems, not a general rise in every form of question practice. Video is the most common Year 11 choice, while Problems is most common in Years 12 and 13. Nevertheless, the leading format reaches only \(45\%\), \(40\%\) and \(50\%\) respectively. I already have reason to question whether one suggestion per year would suit most cases.`,
   limitations:"The chart gives exact descriptive proportions for these cases. It does not distinguish a discrepancy that could be common under a sampling model from one that would be unusual under that model, and it records neither second choices nor learning outcomes.",
   localTakeaway:"Video falls from 45% to 19%, Problems rises from 25% to 50%, and Quiz stays near 30%. No year's leading format has more than half of its cases.",
   nextQuestion:"What counts would I expect if format and year were independent, and are those expected counts large enough for the planned test?",
   nextWhy:"To compare the pattern with independence, I need a numerical benchmark that preserves the unequal year sizes and the overall popularity of each format.",
   mathsInsight:"The denominator changed my interpretation of the Quiz counts: thirteen extra choices correspond to only one percentage point.",
   methodChangeReason:"The descriptive pattern justified checking a specific independence model rather than treating unequal counts as evidence by themselves.",
   outcomeId:"percentages"
  },
  {
   key:"independence-benchmark",title:"Building and checking the independence benchmark",
   bridge:"The bar chart identified the differences. I next asked what the same year totals would look like if every year shared the overall format proportions.",
   purpose:R`I defined \(H_0\): year group and first-choice format are independent in the stipulated response model. My alternative \(H_1\) is that they are associated. I used the overall format proportions to construct the expected counts in Table 2, following the independence-test setup in OpenStax [M1].`,
   technique:"Expected frequencies under independence",methodId:"follow-journey",kind:"calculation",knowledge:"syllabus",
   result:R`I denote the count in row \(i\), column \(j\) by \(O_{ij}\), the year total by \(n_i\) and the format total by \(m_j\). Under independence, the estimated common probability for format \(j\) is \(m_j/n\), so
\[
 E_{ij}=n_i\frac{m_j}{n}.
\]
For Year 11 Video,
\[
 E_{11}=60\times\frac{70}{240}=17.5.
\]
For Year 13 Problems,
\[
 E_{33}=100\times\frac{97}{240}=\frac{485}{12}\approx40.4167.
\]
The common proportions are approximately \(29.1667\%\), \(30.4167\%\) and \(40.4167\%\). Multiplying these by each year total produces Table 2. Every expected count is at least \(17.5\), so all nine satisfy my conservative check of \(E_{ij}\ge5\). I did not merge any categories. The expected row totals remain \(60\), \(80\) and \(100\), and their column totals remain \(70\), \(73\) and \(97\).`,
   interpretation:R`Independence would not give \(240/9\) in every cell, because neither the year sizes nor the format totals are equal. The expected table gives each year the same format proportions, adjusted to its size. A fractional expectation such as \(17.5\) is a model average, so I keep it fractional even though an actual count must be an integer.`,
   limitations:"The expected-count check supports the numerical chi-squared approximation. The record audit prevents duplicate counting, but neither check proves independent selection of real respondents. If classmates coordinated their answers or only enthusiasts volunteered, a valid-looking expected table would not repair that problem.",
   localTakeaway:"The independence benchmark preserves both margins and has a minimum expected count of 17.5; sparse cells do not obstruct the planned conditional calculation.",
   nextQuestion:"How large is the combined discrepancy from that benchmark, and what is its right-tail probability?",
   nextWhy:"I can now aggregate the discrepancies using a method that accounts for the expected size of each cell, rather than choosing a single striking percentage difference.",
   mathsInsight:"Independence means the same conditional distribution in each year, not equal numbers in all nine cells.",
   methodChangeReason:"Having checked the expected frequencies, I could carry out the prespecified test without changing the categories or threshold.",
   outcomeId:"test"
  },
  {
   key:"conditional-test",title:"Measuring the discrepancy from independence",
   bridge:"The expected frequencies gave me a valid numerical benchmark. I measured the complete table's discrepancy from that benchmark, retaining all nine cells.",
   purpose:R`I calculated Pearson's statistic by summing \((O-E)^2/E\). Table 3 shows every cell contribution; this also lets me inspect what drives the total after making the overall test decision.`,
   technique:"Chi-squared independence test and cell contributions",methodId:"chi-independence",kind:"statistics",knowledge:"syllabus",
   result:R`For Year 11 Video, the contribution is
\[
 \frac{(27-17.5)^2}{17.5}=\frac{90.25}{17.5}\approx5.157143.
\]
Using the unrounded expectations for all cells gives
\[
 \chi^2=\sum_{i=1}^{3}\sum_{j=1}^{3}\frac{(O_{ij}-E_{ij})^2}{E_{ij}}
 \approx14.54330179.
\]
There are \((3-1)(3-1)=4\) degrees of freedom. Once both margins are fixed, choosing the first two entries in each of the first two rows determines the remaining five cells; the nine contributions are not nine freely varying counts.

I evaluated the right-tail probability
\[
 p=P(\chi^2_4\ge14.54330179)\approx0.005748497.
\]
For four degrees of freedom, my saved calculation uses the tail expression \(P(\chi^2_4\ge x)=e^{-x/2}(1+x/2)\). I used this as a distribution evaluation, not as a new fitted model, and checked the output with SciPy's \(3\times3\) independence-test calculation [M3]. The chi-squared distribution is documented by NIST [M2]; deriving it is outside my aim. NIST's \(5\%\) upper-tail critical value is approximately \(9.488\) [M4], which gives the same decision because \(14.5433>9.488\).

Since \(0.005748497<0.05\), I reject \(H_0\) for the stipulated model. I made that comparison using the unrounded probability.`,
   interpretation:R`If responses were independently sampled under the independence model, a discrepancy at least this large would have probability about \(0.575\%\) according to the chi-squared approximation. That is evidence against that model conditional on those assumptions. It is not the probability that independence is true, and the constructed counts do not become evidence about a real school simply because the tail area is small.

The statistic also has no sign: squaring makes both excesses and shortfalls positive contributions. I therefore need to return to the original proportions to explain the direction and practical meaning of the association.`,
   limitations:"This is one overall test, not nine separate tests proving individual cells different. I have not used a small p-value to establish causation, a developmental change within the same student, or an effective teaching method.",
   localTakeaway:"The fixed table gives chi-squared 14.5433 with four degrees of freedom and p≈0.005748, rejecting the stated independence model at the prespecified 5% level.",
   nextQuestion:"Which differences produce the discrepancy, and how much better would a year-based first suggestion match the recorded preferences?",
   nextWhy:"My original purpose concerns a useful resource suggestion. A model rejection by itself gives neither the direction of the differences nor the number of people a proposed rule would match.",
   mathsInsight:"The tail probability describes the compatibility of the whole table with an assumed sampling model; it does not measure the benefit of a recommendation.",
   methodChangeReason:"After the overall test I used contributions descriptively, then evaluated a decision in units of matched preferences.",
   outcomeId:"evidence-against"
  },
  {
   key:"practical-meaning",title:"From an association to a resource decision",
   bridge:"The conditional test identified an overall discrepancy. I returned to its largest components before deciding whether year group actually improved my proposed recommendation.",
   purpose:R`I used Table 3 to locate the important discrepancies, then compared two rules on the same \(240\) cases: choose one format for everyone, or choose one format separately within each year. For each rule I selected the format that maximises matches in these existing cases.`,
   technique:"Contribution analysis, conditional proportions and preference matching",methodId:"follow-journey",kind:"calculation",knowledge:"syllabus",
   result:R`The four cells for Video and Problems in Years 11 and 13 contribute
\[
 5.157143+3.528351+3.543810+2.272337\approx14.5016,
\]
or about \(99.71\%\) of the total statistic. Year 11 has \(27-17.5=9.5\) more Video choices than expected and \(15-24.25=-9.25\) fewer Problems choices; Year 13 has the reverse pattern. The Quiz shares are close to the pooled share, so their contributions are tiny. This explains the overall discrepancy descriptively; it is not a series of cell-by-cell significance claims.

For a single format across all years, Problems gives the most matches because its total \(97\) is larger than \(70\) or \(73\). Its match proportion is
\[
 \frac{97}{240}\times100\%\approx40.42\%.
\]
If I can choose separately by year, the best choices are Video for Year 11 and Problems for Years 12 and 13. The number of matches becomes
\[
 \max(27,18,15)+\max(24,24,32)+\max(19,31,50)
 =27+32+50=109.
\]
Therefore the match proportion is \(109/240\approx45.42\%\), an improvement of exactly \((12/240)\times100=5\) percentage points. This is an upper bound for any deterministic one-format-per-year rule on these cases: each row already contributes its largest available count. There are still \(240-109=131\) mismatches.`,
   interpretation:R`The association has a clear direction, but knowing the year gives only twelve additional first-choice matches. The upper bound matters: changing which single format I choose for a year cannot make this rule match a majority of the full response set. I would therefore retain all three choices in my proposed menu. A year-based starting suggestion could be useful, but a compulsory format would disregard more than half of the recorded preferences.

This changed how I viewed my original expectation. A \(26\)-point difference between the youngest and oldest Video shares sounds decisive, yet a sizeable difference between groups can coexist with considerable diversity inside each group.`,
   limitations:"I chose and assessed the rules on the same fixed counts. The 45.42% is a descriptive maximum for these inputs, not a validated prediction rate for new students. A match also need not produce better revision; I have no outcome measurements with which to compare learning.",
   localTakeaway:"Using the year raises first-choice matching from 97 to 109 out of 240, only five percentage points; even the best one-format-per-year rule leaves 131 mismatches.",
   nextQuestion:"Would a small change in how first choices were recorded change the test decision or the practical message?",
   nextWhy:"The forced-choice categories are simple, but a student's initial choice could depend on wording. I checked sensitivity to explicit reclassifications before treating the completed calculation as robust.",
   mathsInsight:"The row maxima give a proof of the best possible matching rate for the stated class of rules, not just a trial of one convenient allocation.",
   methodChangeReason:"The gap between significant association and limited matching benefit made the stability of those two conclusions worth examining separately.",
   outcomeId:"percentages"
  },
  {
   key:"sensitivity",title:"Checking how stable the two conclusions are",
   bridge:"My test decision and my resource decision answer different questions. I investigated whether both survived a small, precisely defined change in the recorded categories.",
   purpose:R`I considered one hypothetical format correction at a time, keeping its year fixed. There are \(3\times3\times2=18\) distinct year–original-format–replacement-format moves, since each original format can move to either of the other two. Changing different records in the same year and format produces the same count table, so these cover all single-record format corrections. I recomputed both column totals and every expected count after each move. Table 4 shows the extremes, followed by a larger stated scenario.`,
   technique:"Exhaustive single-response reclassification and directed sensitivity",methodId:"chi-independence",kind:"statistics",knowledge:"syllabus",
   result:R`Across all \(18\) single-response corrections, the smallest statistic is approximately \(12.827992\), when one Year 11 Video becomes Problems, giving \(p\approx0.012148\). The largest is approximately \(16.395704\), for the reverse Year 11 move, giving \(p\approx0.002532\). Every expected count remains above \(17\), and all \(18\) probabilities remain below \(0.05\). The original decision therefore survives any one correction of the specified kind, not just the most convenient example.

I then followed the first, discrepancy-reducing direction further. With three Year 11 Video slots changed to Problems, that row becomes \((24,18,18)\) and \(p\approx0.043760\). With four it becomes \((23,18,19)\), giving new format totals \((66,73,101)\), \(\chi^2\approx8.507687\) and \(p\approx0.074655\). I would no longer reject independence at my original threshold in that four-change scenario. These four changes are \(4/240\approx1.67\%\) of all slots, but \(4/60\approx6.67\%\) of Year 11. I have not proved that four is the minimum over every possible multi-record change.

The practical message remains. In the four-change scenario the best year-based rule matches \(23+32+50=105\) cases, or \(43.75\%\), compared with \(101/240\approx42.08\%\) for Problems throughout. Video still differs between Years 11 and 13 by approximately \(38.33-19=19.33\) percentage points even though the significance decision has changed.`,
   interpretation:R`The test is stable against one recording correction, but that does not mean stable against every plausible change in wording or response behaviour. The larger scenario demonstrates that crossing \(p=0.05\) does not suddenly erase a pattern: visible differences remain, while the model-based evidence is no longer sufficient for my chosen rejection rule. It would be wrong to describe this scenario as proving independence.

More consistently, both the original and altered cases leave a majority unmatched by one format per year. My cautious resource conclusion therefore survives this check even when the binary test decision changes. I retained the original table for the main result; none of these hypothetical corrections is an excuse to replace an inconvenient response.`,
   limitations:"This is a category-recording sensitivity check, not a confidence interval or a model of sampling variation. It cannot quantify how likely a correction is, repair a biased survey, or establish independence between actual respondents.",
   localTakeaway:"Every single-record format correction preserves the 5% rejection decision. One explicit four-record change does not; in both situations a single format per year matches fewer than half the cases.",
   nextQuestion:"Would a second independently collected response set reproduce the proportions and the modest gain in preference matching?",
   nextWhy:"I can now answer the question for the defined cases and state the conditional test result. Assessing a real school or predicting new preferences needs new evidence rather than further manipulation of the same table.",
   mathsInsight:"Sensitivity of a threshold decision and sensitivity of a practical conclusion are different properties; I evaluated them separately.",
   methodChangeReason:"I kept the original categories and significance level fixed, varying only the explicitly stated response assignments.",
   outcomeId:"sampling-question"
  }
 ],
 figures:[
  {id:"table-revision-observed",tool:"table",stage:0,after:"purpose",draft:tableDraft({
   title:"First-choice revision counts and totals",number:1,columns:countColumns,rows:countRows,original:true,
   purpose:"Show the complete contingency table and the denominators used in every within-year comparison.",
   note:"Video, Quiz and Problems are the three defined, mutually exclusive first choices. Each of the 240 constructed records is counted once."})},
  {id:"stat-revision-percentages",tool:"stat",stage:0,after:"result",draft:barDraft},
  {id:"table-revision-expected",tool:"table",stage:1,after:"result",draft:tableDraft({
   title:"Expected counts under independence",number:2,columns:["Year group",...REVISION_FORMATS],
   rows:REVISION_ANALYSIS.expected.map((row,i)=>[REVISION_YEARS[i],...row.map(value=>digits(value))]),
   purpose:"Check every expected count before evaluating the chi-squared test.",
   note:"Displayed to two decimal places; calculations use the unrounded row-total × column-total / 240 values. Expectations may be fractional."})},
  {id:"table-revision-contributions",tool:"table",stage:2,after:"result",draft:tableDraft({
   title:"Each cell's contribution to chi-squared",number:3,columns:["Year group",...REVISION_FORMATS],
   rows:REVISION_ANALYSIS.contributions.map((row,i)=>[REVISION_YEARS[i],...row.map(value=>digits(value,4))]),
   purpose:"Make the overall statistic reproducible and identify which discrepancies contribute most.",
   note:"Each entry is (observed − expected)² / expected. The sum before rounding is 14.54330179; these are contributions, not separate significance tests."})},
  {id:"table-revision-sensitivity",tool:"table",stage:4,after:"result",draft:tableDraft({
   title:"Sensitivity to specified Year 11 format changes",number:4,
   columns:["Scenario","Chi-squared","p-value","5% decision"],
   rows:[
    ["Original",REVISION_ANALYSIS],
    ["1 Video → Problems",weakestSingle],
    ["1 Problems → Video",strongestSingle],
    ["3 Video → Problems",REVISION_DIRECTED_CHECKS[2]],
    ["4 Video → Problems",REVISION_DIRECTED_CHECKS[3]]
   ].map(([label,record])=>[label,digits(record.chi2,4),digits(record.p,6),record.p<REVISION_ALPHA?"Reject H0":"Do not reject H0"]),
   purpose:"Show the extremes among all single-record moves and the stated larger sensitivity scenario.",
   note:"Hypothetical reclassifications within Year 11; n=240 and df=4 throughout. Expected counts are recomputed after every change. The original source is retained."})}
 ],
 sources:[{id:sourceId,fields:Object.fromEntries(SOURCE_FIELDS.map(key=>[key,completionFields[key]||""]))}],
 planningAccuracy:[
  {id:"pa-secondary-revision-counts",source:"secondary",quantity:"Year × format counts",unit:"",
   resolution:"Exact integer counts in the defining table.",basis:"exact",
   uncertainty:"The counts are fixed inputs, not measured estimates. A category or transcription change alters a cell assignment; I will examine that separately from numerical rounding."}
 ],
 primaryQuantities:[],
 accuracy:[
  {id:"accuracy-revision-counts",quantity:"Supplied response counts",symbol:"O",unit:"",
   resolution:"Exact integer counts, one per constructed response slot.",
   policy:"I retain all original counts and identify each hypothetical correction separately.",
   reason:"Rounding a count would discard information. Exact arithmetic does not establish the real-world accuracy of the chosen categories.",sourceId},
  {id:"accuracy-revision-proportions",quantity:"Conditional proportions",symbol:"O/n_i",unit:"",
   resolution:"Calculated from exact counts and the corresponding year total.",
   policy:"I report percentages with explicit denominators, generally to one or two decimal places, and distinguish percentage points from relative percentage change.",
   reason:"The smallest possible change differs by year: one response is 1/60, 1/80 or 1/100 of that row. Extra displayed digits do not add response information.",sourceId},
  {id:"accuracy-revision-test",quantity:"Expected counts, contributions and right-tail probability",symbol:"E, χ², p",unit:"",
   resolution:"Calculated quantities; no instrument resolution applies.",
   policy:"I retain full precision internally; display E to 2 decimals, contributions and χ² to 4, and p to 6. I use unrounded p for comparison with 0.05.",
   reason:"Premature rounding of fractional expectations could alter the statistic. The test decision should not depend on a display choice.",sourceId}
 ],
 dataSets:[
  {name:"Revision Format Cases v1 — all constructed response slots",columns:["Slot ID","Year group","First-choice format"],rows:REVISION_RESPONSES,
   sourceText:"Deterministic expansion of the nine stated counts in year order then Video/Quiz/Problems order. These are anonymous constructed slots, not observations of real students."},
  {name:"Revision Format Cases v1 — defining count table",columns:countColumns,rows:countRows,sourceText},
  {name:"All 18 single-response format corrections",columns:["Year","From","To","Chi-squared","Right-tail p","Minimum E"],
   rows:REVISION_SINGLE_CORRECTIONS.map(record=>[REVISION_YEARS[record.year],REVISION_FORMATS[record.from],REVISION_FORMATS[record.to],record.chi2,record.p,Math.min(...record.expected.flat())]),
   sourceText:"My exhaustive hypothetical one-record reclassification checks. Every row starts from the original table; year totals remain fixed and format totals and expected counts are recalculated."},
  {name:"Directed Year 11 Video-to-Problems sensitivity",columns:["Changed slots","Year 11 Video","Year 11 Quiz","Year 11 Problems","Chi-squared","Right-tail p","Best year-rule matches","Best common-rule matches"],
   rows:REVISION_DIRECTED_CHECKS.map(record=>[record.count,...record.counts[0],record.chi2,record.p,sum(record.counts.map(row=>Math.max(...row))),Math.max(...record.columnTotals)]),
   sourceText:"A stated sensitivity path, not a minimum-change search or replacement dataset. Each row moves the specified number of Year 11 slots from Video to Problems."}
 ],
 conclusion:{
  mainConclusion:R`For my fixed response set, year group is associated with a clear change in preferred revision format: Video falls from \(45\%\) in Year 11 to \(19\%\) in Year 13, while Problems rises from \(25\%\) to \(50\%\). Quiz remains close to \(30\%\). The independence calculation gives \(\chi^2\approx14.5433\), four degrees of freedom and \(p\approx0.005748\), rejecting the stipulated independence model at the prespecified \(5\%\) level. The Video/Problems differences in Years 11 and 13 account for about \(99.71\%\) of the statistic.

However, year group improves my best single-format recommendation by only \((12/240)\times100=5\) percentage points: \(97\) first-choice matches become \(109\). Even the row-by-row maximum leaves \(131\) mismatches. I therefore answered the second part of my aim more cautiously than the first: a clear association does not make year group a sufficiently informative basis for imposing one revision format.`,
  conclusionBenefit:R`I would keep Video, Quiz and Problems available in my proposed menu, using the year pattern at most to choose an initial suggestion. I reached that decision from the limited improvement in matching, not from treating the p-value as a measure of usefulness.

The original rejection survives every single-record format correction I checked. One explicit four-record change gives \(p\approx0.074655\), but still leaves fewer than half the cases matched by the best year-based rule. This separates a threshold-sensitive test decision from my more stable practical conclusion. All claims remain tied to the constructed cases and conditional response model; they establish neither an age-caused change nor improved learning from any format.`,
  conclusionExtension:"My next investigation would keep the same definitions and test a recommendation on a new, independently collected response set, with a documented sampling frame and a separate treatment of non-response. I would fix the recommendation before examining that set and compare its actual matching rate with the 45.42% descriptive maximum here. If my aim changed to improving learning, I would need an outcome measure and a different study design; preference counts alone cannot answer that question."
 },
 reviews:[
  {id:"D01",location:"Introduction through conclusion",note:"I completed the frequency comparison, conditional test, practical rule comparison and sensitivity check. The conclusion answers both the association question and the usefulness question with the calculated values.",action:"I kept the actual calculation results in the draft rather than describing methods I might carry out."},
  {id:"D02",location:"The five mathematical stages",note:"The unequal totals lead to proportions; their pattern leads to an independence benchmark and test; the rejection leads to practical matching; the forced-choice limitation leads to sensitivity. Each transition responds to the preceding result.",action:"I removed repeated category definitions from later stages and referred back to the same three choices."},
  {id:"D03",location:"Definitions and Tables 1–4",note:"I distinguish O from E, counts from percentages, p from alpha, and percentage points from relative percentage changes. The displayed expectations are rounded only after the calculations.",action:"I checked that every percentage denominator is its year total or the explicitly stated total of 240."},
  {id:"D04",location:"Practical meaning and conclusion",note:"My personal decision is whether to offer a year-based first suggestion. I defined a match, compared two rules and used row maxima to show why a different one-format rule cannot fix the majority-mismatch problem in these cases.",action:"I changed my proposed menu decision in response to the five-percentage-point improvement, without claiming a learning benefit."},
  {id:"D05",location:"Interpretations and sensitivity",note:"I evaluated the expected-count condition separately from sampling independence, limited the p-value interpretation, and showed a scenario where the test decision changes while the practical conclusion remains.",action:"I retained the original table and described altered tables as hypothetical checks."},
  {id:"D06",location:"Expected counts, test and rule calculations",note:"I reproduced the expected frequencies and contributions, checked the four degrees of freedom, and verified the right-tail calculation against SciPy and NIST's critical value. I recomputed all margins in each of the 18 single-correction checks.",action:"I checked the 97-versus-109 matching totals and the 105-versus-101 totals in the four-change scenario directly from their count tables."},
  {id:"D07",status:"checked",location:"Complete reader and exported PDF/Word document",note:"I inspected every page of the PDF and Word exports and all five figures in the desktop and phone reader. The stacked-bar legend, year denominators, contribution and sensitivity tables, equations and captions remain complete.",action:"I shortened the chart's source label so the full constructed-data description is visible, and rechecked the revised chart and tables in the reader and both document formats."},
  {id:"D09",location:"Source record and references D1/M1–M4",note:"I identified the constructed input and deterministic expansion separately from the consulted mathematical and software sources. No source is presented as a survey of real students.",action:"I checked that the source record, figure notes and full response dataset use the same provenance."},
  {id:"D11",location:"All five stage results",note:"My working includes a conditional proportion, two expected counts, a contribution, the summed statistic and probability, a maximum-matching argument and numerical sensitivity results.",action:"I linked the conclusion to the completed practical calculation as well as the test."},
  {id:"D19",location:"Table 1, Figure 1 and Tables 2–4; working data",note:"The narrative contains the entire nine-cell table and the compact summaries needed for the argument. The 240-record expansion and all 18 single-correction checks remain available separately, without filling the narrative with raw records.",action:"I identified why the two single-correction extremes were selected for Table 4 and retained every other calculation in the working dataset."},
  {id:"D20",location:"Conditional test and sensitivity calculation",note:"I state the exact matrix supplied to the test, explain the expected-count formula, sum the contributions and disclose the four-degree-of-freedom probability evaluation. I interpret the software output under its assumptions.",action:"I preserved editable generator data and the full sensitivity inputs, so a category change can be traced through the margins and test."}
 ],
 references:[
  {label:"[D1] Constructed data",value:"Revision Format Cases v1. Original constructed teaching material supplied with this illustrative project. Nine defining counts, their deterministic 240-slot expansion and all calculation records are available in the editable working data."},
  {label:"[M1] Independence-test method",value:"OpenStax, Introductory Statistics 2e, §11.3, Test of Independence. Consulted for expected frequencies, the chi-squared statistic, degrees of freedom and the expected-count condition. https://openstax.org/books/introductory-statistics-2e/pages/11-3-test-of-independence (accessed 22 October 2026)."},
  {label:"[M2] Reference distribution",value:"NIST/SEMATECH e-Handbook of Statistical Methods, §1.3.6.6.6, Chi-Square Distribution. Reference for the distribution used to evaluate the four-degree-of-freedom right tail. https://www.itl.nist.gov/div898/handbook/eda/section3/eda3666.htm (accessed 22 October 2026)."},
  {label:"[M3] Numerical verification",value:"SciPy documentation, scipy.stats.contingency.chi2_contingency. I used the Pearson test on the stated 3×3 count matrix with correction=False and checked the expected frequencies, statistic, degrees of freedom and p-value. https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.contingency.chi2_contingency.html (accessed 22 October 2026)."},
  {label:"[M4] Critical value",value:"NIST/SEMATECH e-Handbook of Statistical Methods, §1.3.6.7.4, Critical Values of the Chi-Square Distribution. The four-degree-of-freedom 95th percentile is tabulated as 9.488. https://www.itl.nist.gov/div898/handbook/eda/section3/eda3674.htm (accessed 22 October 2026)."}
 ]
};
