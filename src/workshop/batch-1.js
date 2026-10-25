/** Maths Workshop Batch 1: data essentials.
 * Shared IDs belong to src/workshop/catalog.js; this file contains editorial
 * teaching examples, not observations, IA results or course approval.
 */
const term=(id,category,title,meaning,example,notation="")=>
 Object.freeze({id,category,title,meaning,example,notation});

export const BATCH1_DEFINITIONS=Object.freeze([
 term("sampling-frame","Data","Sampling frame","The list or operational method used to identify eligible members of the target population; omissions can bias a sample.","A current list of eligible students, rather than only those who visit one club."),
 term("census","Data","Census","Collecting information from every member of the defined population.","Surveying every member of one class is a census of that class, not of the whole year."),
 term("simple-random-sample","Data","Simple random sample","A sample in which every possible subset of the stated size from the sampling frame is equally likely to be selected.","Randomly choose 20 distinct IDs from an eligible list of 100."),
 term("stratified-sample","Data","Stratified sample","Sampling separately from defined non-overlapping groups, often in proportion to their population sizes.","Select 12 students from a group of 60 and 8 from a group of 40 for a sample of 20."),
 term("convenience-sample","Data","Convenience sample","Choosing accessible people or cases rather than giving all eligible members a defined random chance.","Surveying the first 20 friends who reply."),
 term("selection-bias","Data","Selection bias","A systematic difference introduced when the sampling process favours certain eligible cases over others.","A lunchtime survey can miss students who are elsewhere."),
 term("nonresponse-bias","Data","Nonresponse bias","Possible distortion when people who do not respond differ meaningfully from those who do.","If dissatisfied students are less likely to answer, observed satisfaction may be inflated."),
 term("representative-sample","Data","Representative sample","A sample that resembles the relevant population on features important to the question. Random selection helps but does not guarantee this.","A sample spanning the relevant year groups may be more useful than one class alone."),
 term("sample-size","Data","Sample size","The number of distinct observations or sampling units included in an analysis.","\\(n=30\\) denotes 30 sampling units, not automatically 30 independent people.","n = number of sampling units"),
 term("frequency","Data","Frequency","The number of observed cases in a category or numerical interval.","Six observations in \\(10\\leq t<20\\) give frequency \\(6\\)."),
 term("quartile","Data","Quartile","A value that marks a quarter point in an ordered dataset. Different accepted calculation conventions can give different results for small sets.","Using median-of-halves on \\(2,3,3,4,5,5,7,11\\) gives \\(Q_1=3\\) and \\(Q_3=6\\)."),
 term("interquartile-range","Data","Interquartile range","The difference between upper and lower quartiles, describing the spread of the middle half of the data.","If \\(Q_1=3\\) and \\(Q_3=6\\), then \\(\\mathrm{IQR}=3\\).","IQR = Q3 − Q1"),
 term("outlier","Data","Potential outlier","A data value unusually distant from the bulk of a dataset. An outlier rule flags values for checking, not automatic removal.","The \\(1.5\\times\\mathrm{IQR}\\) rule flags values above \\(Q_3+1.5\\,\\mathrm{IQR}\\) or below \\(Q_1-1.5\\,\\mathrm{IQR}\\)."),
 term("skewness","Data","Skewness","Asymmetry of a distribution, such as a long tail extending to the right.","A few unusually long journey times can produce right-skewed data."),
 term("histogram","Data","Histogram","A diagram for grouped numerical values: each bar covers an interval and its area represents frequency. For unequal widths, height is frequency density.","A class twice as wide needs a suitable lower height if its frequency is unchanged."),
 term("frequency-density","Data","Frequency density","The frequency in a numerical class divided by that class's width; the height of a histogram bar when its area represents frequency.","Eight observations across a width of four give frequency density \\(\\frac84=2\\).","frequency density = frequency / class width"),
 term("box-plot","Data","Box plot","A compact display of median, quartiles and spread, sometimes including whiskers and potential outliers according to a stated convention.","Compare medians and IQRs of two groups using matching scales."),
 term("categorical-variable","Data","Categorical variable","A variable whose recorded values are labels or categories, even when numbers are used as codes.","Preferred study location: library, classroom or home."),
 term("two-way-table","Data","Two-way frequency table","A table counting occurrences for each combination of two categorical variables.","Rows show study groups; columns show preferred activities."),
 term("conditional-proportion","Data","Conditional proportion","The fraction in a category among members of a specified group. The denominator is the total for that group.","If 18 of 30 students in Group X prefer A, the within-X proportion is \\(\\frac{18}{30}=0.6\\).","P(A | X) = count(A and X) / count(X)"),
 term("percentage-point","Data","Percentage-point difference","The arithmetic difference between two percentages, not their percentage change.","\\(60\\%-40\\%=20\\) percentage points, not a 20% relative increase."),
 term("instrument-resolution","Measurement","Instrument resolution","The smallest distinguishable increment in an instrument's display or reading. It does not by itself establish accuracy or a defensible total measurement-uncertainty bound.","A device displaying 0.1 cm increments has 0.1 cm displayed resolution."),
 term("repeated-measurement","Measurement","Repeated measurement","Taking a measurement several times under stated conditions to assess variation and possible instability.","Record five independently repeated measurements instead of copying the same reading."),
 term("rounding-interval","Measurement","Rounding interval","The interval of values that would round to the same reported number under a stated rounding rule.","If correctly rounded, \\(10.0\\,\\mathrm{cm}\\) to the nearest \\(0.1\\,\\mathrm{cm}\\) gives a rounding-only interval \\([9.95,10.05)\\,\\mathrm{cm}\\)."),
 term("random-error","Measurement","Random error","Unpredictable changes in repeated measurements that cause scatter around a value.","Slight changes in judging the end of a ruler can vary readings."),
 term("systematic-error","Measurement","Systematic error","A consistent shift caused by a flawed method, calibration or assumption; repeating readings need not remove it.","A zero offset of +0.2 cm can bias every reading."),
 term("relative-uncertainty","Measurement","Relative uncertainty","An uncertainty estimate or bound expressed as a fraction of a nonzero reported quantity. The underlying uncertainty must be justified first.","A rounding-only half-step \\(0.05\\,\\mathrm{cm}\\) relative to \\(10.0\\,\\mathrm{cm}\\) is \\(\\frac{0.05}{10.0}\\times100\\%=0.5\\%\\).","relative uncertainty = absolute uncertainty / |value|"),
 term("sensitivity-analysis","Measurement","Sensitivity analysis","Checking how a derived result changes when important inputs or assumptions vary within an explicitly chosen range.","Recalculate a square's area using slightly smaller and larger possible side lengths."),
 term("significant-figures","Measurement","Significant figures","Digits retained in a reported value to communicate justified precision; extra calculator digits are not automatically meaningful.","A measured result may be shown as 3.4 cm rather than 3.400000 cm."),
 term("reliability","Measurement","Reliability","The consistency of a measurement or procedure under comparable repeated conditions.","Similar repeated timings suggest consistency, but not necessarily accuracy."),
 term("validity","Measurement","Validity","Whether the evidence, measurement or mathematical procedure actually addresses the intended question.","A test of reaction time may not validly measure overall sporting skill.")
]);
const guide=(id,category,title,definitionIds,details)=>Object.freeze({id,category,title,definitionIds,...details});

/** Each lesson uses a checked worked example, TWO helped checkpoints, one new
 * independent task, a technology comparison and a bridge back to the real IA.
 * Guided checkpoints remain device-session-only, not assessment results.
 */
export const BATCH1_LESSONS=Object.freeze([
 guide("sampling","Data & statistics","Sampling fairly and recognising bias",
 ["sampling","population","sample","sampling-unit","sampling-frame","stratified-sample","simple-random-sample","selection-bias","nonresponse-bias","representative-sample"],{
  skill:"Plan and justify the selection yourself; technology can randomise a suitable list",
  when:"When a question needs observations from people or other units and the population is larger than your practical data collection.",
  avoid:"A random-number generator cannot repair missing members of a sampling frame, voluntary response, nonresponse or a missing permission process.",
  formula:"For proportional strata: sample from group = total sample × (group population / total population). Round allocations to whole units and check the sum.",
  worked:{
   context:"Fictional investigation: a defined population has 100 eligible students, with 60 in Group A and 40 in Group B. A proportional stratified sample of 20 is planned.",
   table:{caption:"Population and proposed sample allocation",headers:["Group","Population","Sample allocation"],rows:[["A","60","12"],["B","40","8"],["Total","100","20"]]},
   steps:[
    "Define the question and target population first: all 100 eligible students, not just people who see a survey link.",
    "Make a complete, permitted sampling frame; identify the 60 and 40 distinct eligible members in the two non-overlapping groups.",
    "Calculate the allocations: Group A, \\(20\\times\\frac{60}{100}=12\\); Group B, \\(20\\times\\frac{40}{100}=8\\). Check \\(12+8=20\\).",
    "Randomly select 12 different eligible IDs from A and 8 from B using a defined method; do not substitute the quickest respondents.",
    "Record whether people declined or did not respond. If replacements are needed, follow and disclose a pre-agreed rule.",
    "Describe whose views could still be absent and restrict the conclusion to the population your method can reasonably support."
   ],
   answer:"Planned allocation: \\(n_A=12\\), \\(n_B=8\\), with \\(n=20\\). Fair selection still depends on the frame, actual random choice and responses.",
   interpretation:"The allocation is a design calculation, not a guarantee of an unbiased or representative final dataset."
  },
  guided:{parts:[
   {question:"A population contains \\(75\\) in A and \\(25\\) in B. You plan a proportional stratified sample of \\(20\\). How many are chosen from A?",
    options:[["15","15 students"],["10","10 students"],["75","75 students"]],correct:"15",
    hint:"Multiply the 20 places by the fraction of the population in Group A.",
    feedback:"\\(20\\times\\frac{75}{100}=15\\) from A, leaving five places for B."},
   {question:"You invite only the first 20 students walking past one room. Which concern should you report?",
    options:[["convenience","It is a convenience sample with possible selection bias"],["random","It is a simple random sample of the whole year"],["census","It is a census of every student"]],
    correct:"convenience",hint:"Ask whether everyone in the target population had a stated, equal chance to be invited.",
    feedback:"Ease of access does not give all eligible students equal inclusion chances. State who may be missed."}
  ]},
  independent:{
   question:"A fictional population has \\(90\\) eligible students in A and \\(60\\) in B. Plan a proportional stratified sample of \\(30\\). Explain selection and one possible source of bias.",
   answer:"Select \\(18\\) from A and \\(12\\) from B, randomly within separate complete eligible lists.",
   reasoning:"\\(30\\times\\frac{90}{150}=18\\) and \\(30\\times\\frac{60}{150}=12\\). Missing eligible members or nonresponse could still bias the data."
  },
  technology:[
   {name:"Google Sheets",command:"=RAND()",why:"Give each eligible ID a temporary random value, freeze the generated values, sort separately within each stratum, then choose the required number. This does not construct a fair frame."},
   {name:"Google Forms",command:"Design and distribute a survey",why:"Useful for gathering answers once selection and permissions are decided; sharing a link publicly is not a random-sampling method."}
  ],
  existingGuide:"forms",relatedGuides:["organise"],
  ia:"Explain the population, sampling unit, frame, group allocations, actual selection and nonresponse. Justify the inference scope. Avoid claiming that a planned random sample guarantees representativeness."
 }),
 guide("distributions","Data & statistics","Describe distributions and choose the right diagram",
 ["frequency","median","quartile","interquartile-range","outlier","skewness","histogram","frequency-density","box-plot"],{
  skill:"Understand quartiles and class widths by hand; use software for repeated diagrams",
  when:"When your IA needs to describe or compare the spread, shape and unusual values of numerical observations.",
  avoid:"Histogram bars represent numerical intervals, not categories. For unequal intervals, use frequency density. Quartile software may use a different convention from a hand calculation.",
  formula:"IQR = Q3 − Q1. Potential-outlier fences: Q1 − 1.5 × IQR and Q3 + 1.5 × IQR. Histogram height = frequency / class width.",
  worked:{
   context:"Ordered fictional measurements: \\(2,3,3,4,5,5,7,11\\) (arbitrary units). Use the median-of-halves convention; then consider a histogram.",
   table:{caption:"Splitting the ordered observations into halves",headers:["Lower half","Upper half"],rows:[["2, 3, 3, 4","5, 5, 7, 11"]]},
   steps:[
    "Keep the values ordered. For eight observations, the median is \\(\\frac{4+5}{2}=4.5\\) units.",
    "For the lower half, \\(Q_1=\\frac{3+3}{2}=3\\). For the upper half, \\(Q_3=\\frac{5+7}{2}=6\\).",
    "The spread is \\(\\mathrm{IQR}=6-3=3\\) units. The upper fence is \\(Q_3+1.5\\,\\mathrm{IQR}=10.5\\), so \\(11\\) is flagged for checking, not automatically removed.",
    "A box plot can display the median and IQR. If comparing groups, put them on a common axis and inspect both typical value and spread.",
    "For grouped numerical data, histogram bar area represents frequency. A class of width \\(2\\) with frequency \\(4\\) has density \\(\\frac42=2\\).",
    "A class of width \\(4\\) with frequency \\(8\\) also has density \\(\\frac84=2\\): twice the count, but the same height. Explain class-width choices."
   ],
   answer:"Median \\(4.5\\); \\(Q_1=3\\); \\(Q_3=6\\); \\(\\mathrm{IQR}=3\\). The value \\(11\\) exceeds the \\(10.5\\) upper fence.",
   interpretation:"The flag prompts an investigation of context, not automatic exclusion. A box plot summarises spread; a histogram shows distribution shape."
  },
  guided:{parts:[
   {question:"For \\(1,2,3,4,5,6,7,8\\), use median-of-halves. What is \\(\\mathrm{IQR}\\)?",
    options:[["4","4"],["5","5"],["6","6"]],correct:"4",
    hint:"\\(Q_1=\\frac{2+3}{2}\\) and \\(Q_3=\\frac{6+7}{2}\\).",
    feedback:"\\(Q_1=2.5\\) and \\(Q_3=6.5\\), so \\(\\mathrm{IQR}=4\\)."},
   {question:"Histogram class A has frequency \\(6\\) and width \\(2\\); B has frequency \\(8\\) and width \\(4\\). Which bar should be taller?",
    options:[["a","A: height \\(\\frac62=3\\), compared with B's \\(\\frac84=2\\)"],["b","B: its frequency is larger"],["equal","Both must have the same height"]],
    correct:"a",hint:"Compare frequencies divided by class widths, not the raw frequencies.",
    feedback:"Density A is \\(\\frac62=3\\); density B is \\(\\frac84=2\\). Bar area still represents frequency."}
  ]},
  independent:{
   question:"For \\(1,2,2,3,4,6,7,17\\), find the median, \\(Q_1\\), \\(Q_3\\), \\(\\mathrm{IQR}\\), upper \\(1.5\\times\\mathrm{IQR}\\) fence and any flagged value (median-of-halves).",
   answer:"Median \\(3.5\\); \\(Q_1=2\\); \\(Q_3=6.5\\); \\(\\mathrm{IQR}=4.5\\); upper fence \\(13.25\\); \\(17\\) is flagged.",
   reasoning:"Median \\(=\\frac{3+4}{2}\\). The lower half gives \\(Q_1=2\\); the upper half gives \\(Q_3=6.5\\). Check the unusual value before interpreting it."
  },
  technology:[
   {name:"Desmos",command:"boxplot(L)",why:"Create an optional box plot from a numerical list. Check which quartile convention the tool uses before comparing with hand-calculated values."},
   {name:"Desmos",command:"histogram(L, 1)",why:"Try a chosen class width of 1 for a small list, then review whether another bin width changes the story."},
   {name:"Google Sheets",command:"=MEDIAN(A2:A9)",why:"Use technology for larger numerical datasets after checking units, missing values and definitions."}
  ],
  existingGuide:"distribution-graphs",relatedGuides:["summary-stats"],creator:"stat",
  ia:"State the quartile convention and diagram choices only where they affect your interpretation. Compare centre, spread, distribution shape and genuine anomalies, not just a collection of plots."
 }),
 guide("two-way-proportions","Data & statistics","Two-way tables and conditional percentages",
 ["categorical-variable","two-way-table","frequency","conditional-proportion","percentage-point","sample"],{
  skill:"Check the denominator by hand; use a pivot table for large datasets",
  when:"When two categorical variables are recorded for the same observation and your question compares choices or groups.",
  avoid:"Conditional percentages depend on the denominator. Comparing raw counts across unequal groups is misleading; a difference in a sample does not establish causation.",
  formula:"Within-group percentage = (relevant cell / specified row or column total) × 100%. Percentage-point difference = percentage A − percentage B.",
  worked:{
   context:"Fictional survey counts of 50 observations. Group X and Group Y choose between A and B.",
   table:{caption:"Fictional two-way frequency table (counts)",headers:["Group","Choice A","Choice B","Row total"],rows:[["X","18","12","30"],["Y","8","12","20"],["Column total","26","24","50"]]},
   steps:[
    "Identify the categories and count one response per sampling unit. Group X has \\(18+12=30\\) responses.",
    "Check totals: Group Y has \\(8+12=20\\), Choice A has \\(18+8=26\\), and the grand total is \\(50\\).",
    "To compare Choice A within each group, use its row total: \\(P(A\\mid X)=\\frac{18}{30}=60\\%\\) and \\(P(A\\mid Y)=\\frac8{20}=40\\%\\).",
    "The gap is \\(60\\%-40\\%=20\\) percentage points, not a \\(20\\%\\) relative increase.",
    "If asking for Group X among those choosing A, use the A-column total: \\(P(X\\mid A)=\\frac{18}{26}\\approx69.2\\%\\).",
    "Explain the exact comparison made and who was sampled. These sample proportions do not prove a causal connection."
   ],
   answer:"Choice A within X: \\(60\\%\\); within Y: \\(40\\%\\); gap \\(20\\) percentage points. Among those choosing A, \\(\\frac{18}{26}\\approx69.2\\%\\) belong to X.",
   interpretation:"The direction of conditioning changes the denominator and often the meaning. Choose it to match your investigative question."
  },
  guided:{parts:[
   {question:"Of \\(20\\) observations in Group Y, \\(8\\) chose A. What proportion of Group Y chose A?",
    options:[["row","\\(\\frac8{20}=40\\%\\)"],["all","\\(\\frac8{50}=16\\%\\)"],["column","\\(\\frac8{26}\\approx30.8\\%\\)"]],
    correct:"row",hint:"The question says OF GROUP Y: use Group Y's total of 20.",
    feedback:"The row total is \\(20\\), so \\(\\frac8{20}=40\\%\\). Other denominators answer different questions."},
   {question:"What percentage choosing A belong to X (\\(18\\) out of \\(26\\) Choice A responses)?",
    options:[["69","\\(\\frac{18}{26}\\approx69.2\\%\\)"],["60","\\(\\frac{18}{30}=60\\%\\)"],["36","\\(\\frac{18}{50}=36\\%\\)"]],
    correct:"69",hint:"This time the condition is choosing A, so the denominator is the total who chose A.",
    feedback:"There are \\(26\\) Choice A responses, of which \\(18\\) are X: \\(\\frac{18}{26}\\approx69.2\\%\\)."}
  ]},
  independent:{
   question:"Another fictional table has Group 1: \\(14\\) Yes and \\(6\\) No; Group 2: \\(10\\) Yes and \\(30\\) No. Find within-group Yes percentages and their percentage-point gap.",
   answer:"Group 1: \\(\\frac{14}{20}=70\\%\\). Group 2: \\(\\frac{10}{40}=25\\%\\). The gap is \\(45\\) percentage points.",
   reasoning:"Use row totals \\(20\\) and \\(40\\). The grand total \\(60\\) answers a different question, and the percentages do not establish causality."
  },
  technology:[
   {name:"Google Sheets",command:"=B2/SUM(B2:C2)",why:"For a table with Group 1 in row 2 and Yes/No counts in B2:C2, format as a percentage to obtain the within-row Yes percentage."},
   {name:"Google Sheets",command:"Pivot table → Rows: group; Columns: choice; Values: count of observation ID",why:"Efficient for a larger dataset; check that IDs are counted once and row, column and grand totals reconcile."}
  ],
  existingGuide:"two-way",relatedGuides:["forms"],creator:"table",
  ia:"Include a labelled table only if it makes the comparison clearer. State the conditioning group, sample size, denominators and percentage-point interpretation; distinguish descriptive association from a claim of statistical significance."
 }),
 guide("measurement","Measurement & reliability","Measurement resolution and sensible uncertainty checks",
 ["uncertainty","instrument-resolution","rounding-interval","relative-uncertainty","repeated-measurement","random-error","systematic-error","sensitivity-analysis"],{
  skill:"State measurement assumptions; use technology to repeat a justified sensitivity calculation",
  when:"When a measured input, pixel calibration, distance, angle or derived quantity may limit the credibility of a mathematical conclusion.",
  avoid:"A rounding interval is NOT a complete measurement-uncertainty estimate. Device calibration, viewing angle, repeated readings and methodology may matter more than the displayed digits.",
  formula:"If a value is correctly rounded to the nearest step h, its rounding-only interval is [reported − h/2, reported + h/2). Relative half-step = (h/2) / |reported| for nonzero reported values.",
  worked:{
   context:"A fictional square side is correctly rounded to \\(10.0\\,\\mathrm{cm}\\) to the nearest \\(0.1\\,\\mathrm{cm}\\). Consider rounding alone, not overall measurement accuracy.",
   table:{caption:"Rounding-only sensitivity calculation for the square",headers:["Case","Side (cm)","Area (cm²)"],rows:[["Lower rounding edge","9.95","99.0025"],["Reported value","10.00","100.0000"],["Upper rounding edge (excluded)","10.05","101.0025"]]},
   steps:[
    "Record the reported side \\(s_{\\mathrm{r}}=10.0\\,\\mathrm{cm}\\) and its rounding step \\(h=0.1\\,\\mathrm{cm}\\).",
    "Under correct nearest-step rounding alone, the side lies in \\([9.95,10.05)\\,\\mathrm{cm}\\), because \\(\\frac h2=0.05\\,\\mathrm{cm}\\).",
    "For a square, \\(A=s^2\\). At the reported length, \\(A=10.0^2=100\\,\\mathrm{cm}^2\\).",
    "At the rounding edges: \\(9.95^2=99.0025\\,\\mathrm{cm}^2\\) and \\(10.05^2=101.0025\\,\\mathrm{cm}^2\\). For positive sides, area increases with side length.",
    "The rounding-only relative half-step is \\(\\frac{0.05}{10.0}\\times100\\%=0.5\\%\\). The area changes by roughly \\(1\\%\\) near this value, not exactly the same percentage.",
    "Check instrument calibration, repeated readings and method limitations separately. Do not label the rounding edges as a proven total uncertainty interval."
   ],
   answer:"Nominal area \\(100\\,\\mathrm{cm}^2\\). Under the rounding-only model, \\(A\\in[99.0025,101.0025)\\,\\mathrm{cm}^2\\).",
   interpretation:"This shows the sensitivity of the derived area to one explicit rounding assumption. Other sources of uncertainty may be larger or asymmetric."
  },
  guided:{parts:[
   {question:"A positive length is correctly rounded to \\(6.2\\,\\mathrm{cm}\\) to the nearest \\(0.1\\,\\mathrm{cm}\\). What is the rounding-only half-step?",
    options:[["05","0.05 cm"],["1","0.1 cm"],["2","0.2 cm"]],correct:"05",
    hint:"A value can be up to half one rounding step away from the displayed value.",
    feedback:"Half of \\(0.1\\,\\mathrm{cm}\\) is \\(0.05\\,\\mathrm{cm}\\), giving \\([6.15,6.25)\\,\\mathrm{cm}\\) for rounding alone."},
   {question:"You display 6.200000 cm instead of 6.2 cm without changing the instrument. What happens to the measurement's actual accuracy?",
    options:[["same","It does not improve just because more digits are displayed"],["better","It becomes a million times more accurate"],["zero","Its uncertainty becomes zero"]],
    correct:"same",hint:"Think about the physical procedure, not the calculator display.",
    feedback:"Extra displayed digits cannot repair instrument limitations, calibration issues or measurement bias."}
  ]},
  independent:{
   question:"A square side is correctly rounded to \\(8.0\\,\\mathrm{cm}\\) to the nearest \\(0.1\\,\\mathrm{cm}\\). Find its nominal and rounding-only area bounds, then state one limitation.",
   answer:"Nominal \\(A=64\\,\\mathrm{cm}^2\\). The rounding-only side interval \\([7.95,8.05)\\,\\mathrm{cm}\\) gives \\(A\\in[63.2025,64.8025)\\,\\mathrm{cm}^2\\).",
   reasoning:"Square the positive interval endpoints \\(7.95^2\\) and \\(8.05^2\\). Calibration, viewing angle and other errors are not included, so this is not a total uncertainty bound."
  },
  technology:[
   {name:"Google Sheets",command:"=(A2-0.05)^2 and =(A2+0.05)^2",why:"If A2 holds a positive side length correctly rounded to 0.1 cm, evaluate its rounding-only area edges; adapt the half-step only when justified."},
   {name:"Spreadsheet or calculator",command:"Recalculate the result for a justified range of input values",why:"Useful sensitivity check for a derived formula. Vary one assumption deliberately and record which result or conclusion changes."}
  ],
  existingGuide:"reporting-precision",relatedGuides:["image-scale"],
  ia:"Describe the measuring device and procedure, actual precision and any defensible bounds or repeated-measurement evidence. Make clear which uncertainties are assessed and which remain unknown. Interpret how sensitive the conclusion is."
 })
]);
