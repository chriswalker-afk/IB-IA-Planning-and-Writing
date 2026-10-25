/**
 * Three self-contained probability-model lessons, with deliberately fictional
 * values. Reading or practising NEVER writes findings into a student's IA.
 */
const term=(id,title,meaning,example,notation="")=>Object.freeze({
 id,category:"Probability",title,meaning,example,notation
});
const guide=(id,title,definitionIds,details)=>Object.freeze({
 id,category:"Probability & inference",title,definitionIds,...details
});
export const DISTRIBUTION_PASS4_DEFINITIONS=Object.freeze([
 term("poisson-distribution","Poisson distribution",
  "A count model for the number of events in a fixed interval, under a constant mean rate and independent occurrence assumptions.",
  "If a hypothetical counter has a mean of 2 arrivals per minute, a proposed count model is Poisson with λ=2."),
 term("continuous-uniform-distribution","Continuous uniform distribution",
  "A model with constant probability density 1/(b−a) on the interval [a,b]. Interval probability is proportional to length; any exact point has probability zero.",
  "For X uniform on [2,10], the probability of a value between 4 and 6 is 2/8."),
 term("custom-discrete-distribution","Custom discrete probability distribution",
  "A list of distinct numerical outcomes each assigned a nonnegative probability; the probabilities must sum to one. A table of model probabilities is not a sample of observed frequencies.",
  "An invented game has scores −2, 0 and 3 with probabilities 0.2, 0.5 and 0.3.")
]);
export const DISTRIBUTION_PASS4_LESSONS=Object.freeze([
 guide("poisson-models","Use a Poisson count model",["poisson-distribution","probability-distribution","cumulative-probability","expected-value","independent-events"],{
  skill:"Check constant rate and event independence before selecting a count probability",
  when:"You are modelling counts of independent events in a fixed interval of time, length or area with a defensible constant rate.",
  avoid:"Events clustered together, a changing rate, a restricted maximum count or dependence can invalidate the Poisson assumption. The counted events are not the same as the observed mean. A Poisson model has unbounded nonnegative integer support, even when the graph shows only a finite window.",
  formula:"For a Poisson rate λ, P(X=k)=e^(−λ)λ^k/k! and E(X)=λ.",
  worked:{context:"A fictional process is ASSUMED to have a Poisson count with a mean of two events per minute. Find the probability of no events and at least one event in one minute.",steps:[
   "Define X as the count of events in exactly one minute, not a continuous waiting time.",
   "Assume a constant expected count λ=2 and independent occurrences over the chosen interval.",
   "Write X~Poisson(2). Counts are integers from zero upwards.",
   "For no events, P(X=0)=e^(−2)·2^0/0!≈0.1353.",
   "Use the complement for at least one event: P(X≥1)=1−P(X=0)≈0.8647.",
   "Interpret this as the modelled probability for a minute under the assumed rate, NOT an observed frequency.",
   "Ask whether rates vary by time, whether events cluster, and how changing the observation interval would alter λ."
  ],answer:"P(X=0)≈0.1353; P(X≥1)≈0.8647, conditional on the Poisson assumptions.",
   interpretation:"A modelled minute has about an 86.47% chance of at least one event; this does not show that a real process follows Poisson assumptions."},
  guided:{parts:[
   {question:"For the invented model X~Poisson(3), which expression gives P(X=0)?",
    options:[["yes","e^(−3)≈0.0498"],["rate","3"],["minus","1−e^(−3)"]],correct:"yes",
    hint:"Use k=0 in e^(−λ)λ^k/k!. Remember 0!=1.",feedback:"P(X=0)=e^(−3)≈0.0498."},
   {question:"For the same invented model, what is P(X≥1)?",
    options:[["yes","1−e^(−3)≈0.9502"],["zero","e^(−3)≈0.0498"],["sure","1"]],correct:"yes",
    hint:"At least one is the complement of zero.",feedback:"Subtract the probability of zero events from one."}
  ]},
  independent:{question:"For a separate fictional model X~Poisson(4), calculate P(X=2) and P(X≤1).",
   answer:"P(X=2)=e^(−4)4²/2!≈0.1465. P(X≤1)=e^(−4)(1+4)≈0.0916.",
   reasoning:"Use the Poisson mass for exactly two; add the disjoint masses for zero and one. Both refer to the specified interval and assumed constant rate."},
  technology:[{name:"Pathfinder Probability Distribution Studio",
   command:"Choose Poisson → enter λ for the stated interval → set exact, at most, at least or between",
   why:"See the highlighted count probabilities and export a compact model figure. The plotted range does not truncate the probability calculation."}],
  existingGuide:"export-figure",relatedGuides:[],creator:"distribution",
  ia:"Name the events and the observation interval, explain where λ comes from, verify whether the rate and independence assumptions are plausible, and interpret a specific modelled probability. Contrast the model with any actual observed counts without treating the diagram as a fit test."
 }),
 guide("uniform-continuous-models","Use a continuous uniform probability model",["continuous-uniform-distribution","probability-density","cumulative-probability","probability-distribution"],{
  skill:"Use interval length, not density height, to calculate continuous probabilities",
  when:"A continuous quantity is defensibly modelled with equal probability density across a specified finite interval.",
  avoid:"A bounded numerical range does NOT by itself establish uniformity. A mechanism may favour particular parts of the range, and exact-point probability is zero for a continuous uniform model.",
  formula:"For X uniform on [a,b], density=1/(b−a); P(c≤X≤d)=length([c,d]∩[a,b])/(b−a).",
  worked:{context:"An illustrative mechanism is assumed to generate a uniformly distributed value between 2 and 10 units. Find the chance of a value between 4 and 7, and at least 6.",steps:[
   "Define X and explain why equal probability density throughout [2,10] might be a reasonable theoretical assumption.",
   "Identify a=2, b=10, total interval width 8 units.",
   "The constant probability density on the interval is 1/8 per unit.",
   "The event 4≤X≤7 covers a length of 7−4=3 units within the support.",
   "Calculate P(4≤X≤7)=3/8=0.375.",
   "The event X≥6 covers [6,10], length 4, so P(X≥6)=4/8=0.5.",
   "Interpret these as areas. Any single exact value has probability zero, even though the density is positive."
  ],answer:"P(4≤X≤7)=0.375; P(X≥6)=0.5, given X is uniform on [2,10].",
   interpretation:"A shaded interval represents a fraction of the total continuous area, conditional on constant density across the entire support."},
  guided:{parts:[
   {question:"For Y uniform on [0,8], what is P(2≤Y≤6)?",
    options:[["half","4/8=0.5"],["quarter","2/8=0.25"],["height","1/8=0.125"]],correct:"half",
    hint:"Divide the overlap length by the total support width.",feedback:"The selected length is four of eight units, so the probability is 0.5."},
   {question:"For the same continuous model, what is P(Y=3)?",
    options:[["zero","0"],["density","1/8"],["half","0.5"]],correct:"zero",
    hint:"An exact point has zero width. Probability is area.",feedback:"The density at 3 is 1/8, but an exact point has area zero."}
  ]},
  independent:{question:"For a separate invented model X uniform on [−2,4], find P(X≤1) and P(X≥2).",
   answer:"P(X≤1)=3/6=0.5; P(X≥2)=2/6=1/3.",
   reasoning:"Intersect each event with [−2,4] and divide its length by six. Neither event is determined by density height alone."},
  technology:[{name:"Pathfinder Probability Distribution Studio",
   command:"Choose Continuous uniform → enter a and b → choose left, right, between or outside",
   why:"Read the area of a selected interval and export a labelled rectangle-density graph. Continuous uniform has no exact-value event probability other than zero."}],
  existingGuide:"export-figure",relatedGuides:[],creator:"distribution",
  ia:"Define both limits and their units, explain why equal density is plausible rather than merely convenient, shade only the intended interval, interpret its model probability and discuss how nonuniform real behaviour would change the conclusion."
 }),
 guide("custom-discrete-models","Build and check a custom discrete probability distribution",["custom-discrete-distribution","discrete-random-variable","probability-distribution","expected-value"],{
  skill:"Check the complete outcome list and its probability total before calculating",
  when:"A random variable has a manageable list of explicitly justified numerical outcomes that does not follow a standard named distribution.",
  avoid:"Do not quietly turn raw counts into probabilities without stating a denominator. Duplicated outcomes, missing cases or probabilities that do not sum to one invalidate the distribution. These bars are model probabilities, not observed frequencies.",
  formula:"For distinct outcomes x_i, each P(X=x_i)≥0, ΣP(X=x_i)=1; E(X)=Σ x_iP(X=x_i).",
  worked:{context:"A purely fictional game has numerical net scores −2, 0 and 3, with respective probabilities 0.2, 0.5 and 0.3. Analyse its model.",steps:[
   "Define X as the net score; these are assumed probabilities for hypothetical outcomes.",
   "Record one outcome and probability per row: −2→0.2, 0→0.5 and 3→0.3.",
   "Check the outcomes are distinct and every probability is between zero and one.",
   "Check the complete probability total: 0.2+0.5+0.3=1.",
   "For a nonnegative score, P(X≥0)=0.5+0.3=0.8.",
   "Find the long-run mean: E(X)=−2(0.2)+0(0.5)+3(0.3)=0.5 net points.",
   "Explain why a long-run mean is not a guaranteed score in one round, and how a missing outcome would invalidate the model."
  ],answer:"P(X≥0)=0.8 and E(X)=0.5 net points; the latter is not a possible single-round score.",
   interpretation:"The model assigns probabilities to selected scores; it does not establish how often an actual game will produce them."},
  guided:{parts:[
   {question:"An invented discrete distribution uses P(X=0)=0.25, P(X=1)=0.50 and P(X=2)=0.25. Is it complete?",
    options:[["yes","Yes; all probabilities are nonnegative and sum to one"],["no","No; 0.25 is too small"],["maybe","Only if X is continuous"]],correct:"yes",
    hint:"Check the total, nonnegativity and distinct outcomes.",feedback:"0.25+0.50+0.25=1, with distinct numerical outcomes."},
   {question:"For the same invented distribution, what is P(X≥1)?",
    options:[["yes","0.75"],["half","0.50"],["quarter","0.25"]],correct:"yes",
    hint:"Add P(X=1) and P(X=2); the endpoints are inclusive.",feedback:"The selected outcomes 1 and 2 have total probability 0.75."}
  ]},
  independent:{question:"For a different fictional game, X=−1 has probability 0.4 and X=2 has probability 0.6. Find P(X>0) and E(X).",
   answer:"P(X>0)=0.6; E(X)=−1(0.4)+2(0.6)=0.8.",
   reasoning:"Include only the permitted outcomes in the event. The expected value is a long-run mean under the stated model, not the most likely outcome."},
  technology:[{name:"Pathfinder Probability Distribution Studio",
   command:"Choose Custom discrete → enter one numeric value, probability pair per line → check sum equals 1 → select event",
   why:"Enter negative or non-integer outcomes. Position the bars on their true numerical axis and export a short, meaningful chart."}],
  existingGuide:"export-figure",relatedGuides:[],creator:"distribution",
  ia:"Explain how probabilities were obtained and checked, include the full justified list of possible outcomes, choose a purposeful event or expectation, and interpret the model limitation. A figure does not replace the justification of the probability table."
 })
]);
