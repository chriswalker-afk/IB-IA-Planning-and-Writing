import {EXPANDED_EXAMPLES} from "./expanded-catalog.js";
/** Original fictional teaching excerpts. Not IB-approved model answers or student findings. */
export const EXAMPLES = [
  {
    "id": "EX01",
    "title": "Introduction: a mathematical question, not a list of techniques",
    "weak": "This exploration investigates the cooling of tea using mathematics. First I will collect readings every two minutes, then create graphs, calculate gradients, compare regression models and finally draw a conclusion.",
    "strong": "When I make tea while studying, I sometimes forget about it until it is lukewarm. This made me wonder whether mathematics could help me predict when the tea reaches a comfortable drinking temperature. My aim is to investigate how the temperature of one cup of tea changes over time and whether a mathematical model can give a useful estimate of when it reaches 50 °C. I suspect that the cooling slows over time, but I want to see whether the mathematics supports that expectation.",
    "why": "A genuine motivation leads directly to a specific mathematical aim. The reader knows the question without being given a fixed list of methods or unperformed calculations. An initial expectation is explicitly tentative. The opening observation is appropriate only if it is genuinely the student's experience; invented backstories are not improvements.",
    "question": "Can a reader say what mathematical question you are answering, and what evidence could answer it?",
    "introFeatures": [
      {
        "label": "The motivation",
        "quote": "When I make tea while studying",
        "why": "An authentic observation explains why this specific question matters to the investigator. Do not borrow the fictional backstory."
      },
      {
        "label": "The mathematical aim",
        "quote": "My aim is to investigate how the temperature of one cup of tea changes over time",
        "why": "The reader knows what quantity is changing and what mathematical question the investigation hopes to answer."
      },
      {
        "label": "An open journey",
        "quote": "I suspect that the cooling slows over time",
        "why": "This is a tentative expectation, not a conclusion or a promise to carry out particular calculations."
      }
    ],
    "category": "introduction",
    "kind": "modelling",
    "topics": [
      "introduction",
      "aim"
    ],
    "visual": ""
  },
  {
    "id": "EX02",
    "title": "Introduction: a statistical investigation without causal overclaiming",
    "weak": "I will investigate the effect of music on mathematics performance. First I will survey students, then make a scatter plot, calculate the Pearson correlation coefficient, perform regression and prove my hypothesis.",
    "strong": "Students in my class have different practice routines, and I was curious whether those differences are reflected in their mathematics test results. My aim is to investigate whether weekly music-practice time and mathematics test percentage appear associated in a sample from my class. Because the observations are not an experiment, any relationship I find would not show that practising music causes a change in attainment.",
    "why": "The improved introduction identifies the mathematical quantities, offers a genuine reason for the question and avoids promising a specific sequence of calculations. It states a legitimate limitation of an observational investigation without claiming to know the eventual relationship.",
    "question": "Are you investigating an association, a difference, a prediction or a causal claim?",
    "introFeatures": [
      {
        "label": "The motivation",
        "quote": "I was curious whether those differences are reflected in their mathematics test results",
        "why": "A genuine question motivates exploring a possible relationship, not proving a preconceived explanation."
      },
      {
        "label": "The mathematical aim",
        "quote": "whether weekly music-practice time and mathematics test percentage appear associated",
        "why": "Both variables and the kind of relationship sought are made explicit."
      },
      {
        "label": "An honest starting point",
        "quote": "any relationship I find would not show",
        "why": "The student avoids causal overclaiming before any observations have been analysed."
      }
    ],
    "category": "introduction",
    "kind": "statistics",
    "topics": [
      "introduction",
      "aim"
    ],
    "visual": ""
  },
  {
    "id": "EX03",
    "title": "Introduction: authentic mathematical curiosity without a forced real-life story",
    "weak": "Number patterns are important in everyday life. I have always loved mathematics and will investigate some interesting patterns. I will use algebra and hopefully find a formula.",
    "strong": "When I tested a few integers, I noticed that the difference between each integer's cube and the integer itself seemed divisible by six. My aim is to determine whether this holds for every integer and to understand what mathematical property explains the pattern. A few examples made me curious, but they do not yet settle the question.",
    "why": "An authentic mathematical observation provides the motivation, and a precise conjecture becomes the aim. No invented practical beneficiary or detailed methods itinerary is necessary. This elementary statement alone would not constitute a sufficiently substantial IA.",
    "question": "What exactly is your conjecture, and what would count as a proof or counterexample?",
    "introFeatures": [
      {
        "label": "The mathematical curiosity",
        "quote": "I noticed that the difference between each integer's cube and the integer itself seemed divisible by six",
        "why": "Curiosity can be purely mathematical. A practical benefit or personal life story is not compulsory."
      },
      {
        "label": "The precise aim",
        "quote": "determine whether this holds for every integer",
        "why": "The reader knows the claim that needs to be established or disproved."
      },
      {
        "label": "Not a finished result",
        "quote": "they do not yet settle the question",
        "why": "The writer distinguishes a pattern in tested cases from a proof."
      }
    ],
    "category": "introduction",
    "kind": "theoretical",
    "topics": [
      "introduction",
      "aim"
    ],
    "visual": ""
  },
  {
    "id": "EX34",
    "title": "Introduction: explain specialist context briefly, then return to mathematics",
    "weak": "Bread making is a complex process involving gluten, yeast activity, fermentation, water absorption and many chemical reactions. Different flour proteins behave differently, and bakers use a range of methods. I will explain bread science in detail and then investigate some mathematical relationships.",
    "strong": "When baking, I noticed that recipes use different dough hydration percentages. Dough hydration is the mass of water expressed as a percentage of the flour mass. I want to investigate whether the hydration percentage is associated with how much a loaf expands during baking. The mathematical relationship interests me more than the details of bread chemistry.",
    "why": "The specialist term is defined briefly so the reader can follow the question. The student immediately states an investigable mathematical aim instead of writing a long non-mathematical background essay. This is a fictional example; the motivation must be genuine for the writer.",
    "question": "What specialist term does your reader need to understand before they can follow your mathematical aim?",
    "category": "introduction",
    "kind": "all",
    "topics": [
      "introduction",
      "context",
      "aim"
    ],
    "visual": "",
    "introFeatures": [
      {
        "label": "Necessary vocabulary",
        "quote": "Dough hydration is the mass of water expressed as a percentage of the flour mass",
        "why": "One concise definition is enough for a reader to understand the mathematical variable."
      },
      {
        "label": "The mathematical aim",
        "quote": "whether the hydration percentage is associated with how much a loaf expands",
        "why": "The context becomes a mathematical question rather than an unrelated science explanation."
      },
      {
        "label": "Where to stop",
        "quote": "The mathematical relationship interests me more than the details of bread chemistry",
        "why": "The background is deliberately brief. Specialist science can be introduced later only where it genuinely affects the mathematics."
      }
    ]
  },
  {
    "id": "EX04",
    "title": "Aim and scope: make an optimisation problem answerable",
    "weak": "I will find the best box and prove which design is most efficient.",
    "strong": "For an open box made by removing equal corner squares from a 30 cm by 20 cm rectangle and folding the sides, I will find the cut size that maximises the internal volume in an idealised zero-thickness model. If the cut size is x cm, the feasible domain is 0 < x < 10. This does not by itself identify the strongest or cheapest manufactured box.",
    "why": "The objective, constraints, variable and limits of the claim are explicit. The restricted claim is more useful than the vague word best. The domain follows from positive base dimensions, not a software graph window.",
    "question": "What does best mean mathematically in your investigation?",
    "category": "methods",
    "kind": "modelling",
    "topics": [
      "aim",
      "method",
      "diagram"
    ],
    "visual": ""
  },
  {
    "id": "EX05",
    "title": "Choosing a method: explain what it will answer",
    "weak": "I chose an exponential regression because it is a more advanced technique than a straight line.",
    "strong": "The temperature readings decrease rapidly at first and then more slowly. I will compare a linear model with an exponential model that approaches the recorded room temperature of 23 °C. The comparison will test whether allowing the rate of cooling to change improves the description of these observations; complexity alone is not a reason to prefer it.",
    "why": "The choice follows the observed pattern and the aim. It remains a model to test, not a fact established by its plausible shape.",
    "question": "Which feature of the evidence makes this method worth considering?",
    "category": "methods",
    "kind": "modelling",
    "topics": [
      "method",
      "next"
    ],
    "visual": ""
  },
  {
    "id": "EX06",
    "title": "Sampling and sources: honest scope rather than a better-sounding label",
    "weak": "I randomly surveyed 12 friends, so my results represent the year group.",
    "strong": "I asked 12 friends who were available to take part, so this is a convenience sample, not a random sample of the year group. Friends may share interests or routines. Any pattern describes this sample and cannot be assumed to represent all students in the year group. A wider, planned sampling process would be needed to investigate that broader claim.",
    "why": "Nothing about the actual sample has been secretly improved. The description and conclusion are brought into line with what was really done. A proposed future improvement is not presented as completed work.",
    "question": "Who could enter your sample, who could not, and how might that affect your conclusion?",
    "category": "methods",
    "kind": "statistics",
    "topics": [
      "source",
      "limitations"
    ],
    "visual": ""
  },
  {
    "id": "EX07",
    "title": "Assumptions: give a mathematical consequence",
    "weak": "I assumed the room temperature stayed the same because assumptions are needed in a model.",
    "strong": "I used 23 °C as a constant room temperature in the exponential model. This fixes the temperature that the model approaches as time increases. If the surroundings change appreciably during the trial, that fixed limit is no longer an adequate description, so a good fit to the early readings would not automatically justify predictions later in the trial.",
    "why": "The assumption is linked to a specific part of the model and a restriction on inference. The text does not claim that room temperature was monitored continuously unless that actually happened.",
    "question": "Which result or model feature would change if this assumption failed?",
    "category": "methods",
    "kind": "modelling",
    "topics": [
      "assumptions",
      "limitations"
    ],
    "visual": ""
  },
  {
    "id": "EX08",
    "title": "Tables: make raw measurements interpretable",
    "weak": "| x | y |\n|---|---|\n| 0 | 82 |\n| 2 | 73.6 |\n| 4 | 66.80000 |",
    "strong": "**Table 1. First three of the 11 readings in the fictional cooling trial.**\n\n| Time since first reading, t / min | Recorded temperature, T / °C |\n|---|---|\n| 0 | 82.0 |\n| 2 | 73.6 |\n| 4 | 66.8 |\n\nTemperature values are recorded to the instrument display resolution of 0.1 °C. The full set of readings is provided with this teaching example; none is a measurement made by the reader.",
    "why": "The numerical values have not changed. The improved headings define the quantities and units, the caption identifies the table's purpose, and the displayed precision is consistent with the stated recording convention. Display resolution is not a claim about calibration accuracy.",
    "question": "Could someone interpret each column without searching through the rest of your IA?",
    "category": "presentation",
    "kind": "all",
    "topics": [
      "table",
      "precision"
    ],
    "visual": "table"
  },
  {
    "id": "EX09",
    "title": "Tables: summarise comparisons instead of dumping repeated calculations",
    "weak": "The linear model had an error of 2.902405670764504 and the exponential model had 0.2594977085945776. The full substitution into the error formula is written out again for every reading.",
    "strong": "**Table 2. In-sample fit to the same 11 fictional observations.**\n\n| Fitted model | RMSE / °C |\n|---|---|\n| Linear | 2.90 |\n| Exponential with room temperature fixed at 23 °C | 0.259 |\n\nRMSE has been defined at its first use. One representative residual calculation is shown there. The smaller RMSE supports the exponential model as the better fit to these observations, but this is a comparison using the fitting data, not an independent validation test.",
    "why": "The table states what is being compared, reports a meaningful quantity with units and places repeated routine calculations in proportion to their value. A lower fitting error is not converted into a claim of universal predictive accuracy.",
    "question": "Which numbers does the reader need to compare, and which repeated steps add no new understanding?",
    "category": "presentation",
    "kind": "modelling",
    "topics": [
      "table",
      "technology"
    ],
    "visual": "comparison"
  },
  {
    "id": "EX10",
    "title": "Graphs: make the visual itself useful, not merely more decorative",
    "weak": "The graph is titled Chart 1. Neither axis names a quantity or unit. Its legend says Series 1, Series 2 and Series 3. The measured points are joined without explaining whether the joining segments are a model. The caption says only: My graph.",
    "strong": "Figure 1 names time in minutes and temperature in °C, shows the 11 observations as points, and identifies the two fitted models using both labels and distinguishable line styles. Curves are shown over the observed interval, 0 to 20 minutes.\n\n**Caption:** Figure 1. Linear and exponential models fitted to the same fictional cooling measurements. The data and exponential curve flatten as time increases; the linear model assumes a constant rate of change. Residuals are needed to assess the quality of the fit more carefully.",
    "why": "This is a comparison of actual rendered graphs, not just advice about graphs. The improved visual separates observations from models, preserves the same underlying data and adds an interpretation. A graph axis does not automatically have to start at zero; its range should serve the mathematical question without misleading the reader.",
    "question": "What can a reader tell from this figure, and what still needs further analysis?",
    "category": "presentation",
    "kind": "modelling",
    "topics": [
      "graph"
    ],
    "visual": "graph"
  },
  {
    "id": "EX11",
    "title": "A convincing-looking graph can still support a poor model",
    "weak": "The linear model has R-squared = 0.959, so it is accurate and can be used for any future time.",
    "strong": "Although the linear model has R-squared approximately 0.959, its residuals are positive near both ends of the observed interval and mostly negative in the middle. That pattern suggests the line misses the curvature. Extending the same line beyond the measured interval would eventually predict a temperature below the fixed room temperature, which is inconsistent with the cooling setting being modelled. I will compare a model with a decreasing cooling rate rather than treating a large R-squared as sufficient validation.",
    "why": "The fitted statistic is interpreted alongside structure in the residuals and the context. This is a model-critique example, distinct from fixing labels. The claimed residual pattern is verified from the supplied fictional data.",
    "question": "Where does the model fail even though its overall fit statistic looks impressive?",
    "category": "reflection",
    "kind": "modelling",
    "topics": [
      "model",
      "interpretation"
    ],
    "visual": "residual"
  },
  {
    "id": "EX12",
    "title": "Diagrams: define the mathematical object",
    "weak": "This unlabelled folded-box sketch is followed by a volume formula, but the reader cannot tell which lengths the symbols describe.",
    "strong": "The labelled net and open-box diagram use the same x throughout: height x cm, length (30 - 2x) cm and width (20 - 2x) cm. Ignoring thickness, V(x) = x(30 - 2x)(20 - 2x) cm³ for 0 < x < 10. The diagram explains the origin of each factor.",
    "why": "The original vector diagrams connect the physical shape to the variables and feasible domain. An unlabelled illustration supplies context but does not define a mathematical model.",
    "question": "Does the diagram explain where every term in your formula comes from?",
    "category": "presentation",
    "kind": "modelling",
    "topics": [
      "diagram"
    ],
    "visual": "diagram"
  },
  {
    "id": "EX13",
    "title": "Mathematical presentation: define, calculate, interpret",
    "weak": "y = 23 + 58.9555e^(-0.07485275x). Set y = 50. The answer is x = 10.43310146.",
    "strong": "Let t be the time in minutes after the first reading and let T̂(t) be the modelled temperature in °C. The fitted model and the steps for solving T̂(t) = 50 are shown below.\n\nThe displayed coefficients are rounded; calculation uses the stored full-precision fit. Following the earlier reporting convention, I report a model-based estimate of about 10 minutes after the first reading, not an observed crossing time.",
    "why": "The notation has a stable meaning, the calculation has a purpose, and the result returns to the context. This shows the relevant application of familiar algebra without adding a tutorial on logarithms. The reporting convention does not establish an uncertainty bound.",
    "question": "Have you explained what the result means, rather than stopping at the software output?",
    "category": "mathematics",
    "kind": "all",
    "topics": [
      "calculation",
      "notation"
    ],
    "visual": "equations"
  },
  {
    "id": "EX14",
    "title": "Technology: expose the mathematical inputs and meaning",
    "weak": "I entered the numbers into the software and it gave me the equation in the screenshot. This is correct because the software calculated it.",
    "strong": "I fitted the 11 recorded time-temperature pairs to the model T̂(t) = 23 + A exp(-kt), with the room temperature fixed at 23 °C. The fitting procedure minimised the sum of squared temperature residuals and gave A approximately 58.9555 °C and k approximately 0.07485275 per minute. The screenshot documents the output; the model equation, residual comparison and interpretation show what it means.",
    "why": "The reader can identify the data, the fitted form, the fixed and estimated quantities, and the output's role. The explanation concerns the mathematics rather than a sequence of buttons. A screenshot may support the account but is not the whole account.",
    "question": "What did the technology calculate, from which inputs, and how did you check or interpret it?",
    "category": "mathematics",
    "kind": "modelling",
    "topics": [
      "technology"
    ],
    "visual": ""
  },
  {
    "id": "EX15",
    "title": "Interpretation: link an actual result to the aim",
    "weak": "The exponential model had the smaller RMSE. My hypothesis was correct.",
    "strong": "The exponential model's RMSE was approximately 0.259 °C, compared with 2.90 °C for the linear model, using the same 11 readings. This supports my prediction about which of these two models fits this trial better. It does not show that the same fitted parameters apply to a different cup or that predictions beyond the observed interval are reliable.",
    "why": "The claim states the evidence, comparison and scope. It avoids using one favourable result as proof of a broader hypothesis. This is a local interpretation immediately after the comparison, not a paragraph to save for the final conclusion.",
    "question": "What part of your aim has this result answered, and what has it not answered?",
    "category": "reflection",
    "kind": "modelling",
    "topics": [
      "interpretation"
    ],
    "visual": ""
  },
  {
    "id": "EX16",
    "title": "The next logical mathematical step: follow the evidence, not a technique checklist",
    "weak": "I have made a scatter graph, so next I will calculate a correlation coefficient and then always find a regression line.",
    "strong": "**Near-linear case:** The paired observations show an approximately straight decreasing pattern. If my purpose is to estimate one variable from the other, a linear regression is worth investigating; I will also assess its residuals and the range in which predictions are defensible.\n\n**Turning-pattern case:** A small Pearson coefficient does not explain away a clear U-shaped scatter. I will investigate the turning pattern and consider a model that addresses my actual prediction question. Replacing Pearson with a rank coefficient would not by itself solve a non-monotonic modelling problem.\n\n**No useful next question:** If the completed mathematics has answered the aim within its limitations, I can move to a conclusion rather than add a technique simply to make the IA longer.",
    "why": "These are separate contextual variants, not a menu of compulsory calculations. Regression serves a prediction or modelling purpose; neither a large nor a small correlation coefficient mechanically determines the next step.",
    "question": "Which unanswered mathematical question follows from this actual result?",
    "category": "reflection",
    "kind": "all",
    "topics": [
      "next"
    ],
    "visual": "",
    "variants": [
      {
        "id": "linear",
        "label": "Approximately linear paired data",
        "strong": "The genuine paired observations show an approximately straight decreasing pattern. Since my aim is to estimate one variable from the other, I will investigate a linear regression, examine its residuals and restrict predictions to a defensible range. The purpose is prediction, not simply adding a technique."
      },
      {
        "id": "turning",
        "label": "A turning or U-shaped pattern",
        "strong": "A small Pearson coefficient does not explain away the U-shaped scatter. I need a model that addresses the turning pattern and my mathematical question. Replacing Pearson with a rank coefficient would not by itself address this non-monotonic pattern."
      },
      {
        "id": "monotonic",
        "label": "A curved, one-direction pattern",
        "strong": "The observations increase but do not follow a straight line. If my question is about rank association, a rank measure could be worth considering; if it is about numerical prediction, I need to investigate a plausible curved model. These purposes are different."
      },
      {
        "id": "unclear",
        "label": "No clear pattern",
        "strong": "Neither the graph nor the completed analysis supports a clear pattern. I will check variable definitions, pairing and relevant source issues without discarding inconvenient observations. An honest limited conclusion may be more useful than forcing a model."
      },
      {
        "id": "stop",
        "label": "Enough evidence to conclude",
        "strong": "The completed mathematics has answered the aim within its established limitations. I can bring the findings together rather than add a technique just to make the investigation longer."
      }
    ]
  },
  {
    "id": "EX17",
    "title": "Limitations: identify the consequence, not a generic weakness",
    "weak": "There may have been human error, and I could have collected more data.",
    "strong": "This investigation used one cooling trial with one cup. The small residuals describe agreement with those 11 readings but do not estimate how much the fitted parameters would vary between repeated trials. Therefore the result supports an account of this trial, not a general claim about all cups of tea. Repeated trials under the same recorded conditions would help assess that repeatability.",
    "why": "The limitation is specific to the real design, explains what remains unknown and restricts the claim accordingly. It does not invent a completed repeatability test or attach irrelevant limitations to every IA.",
    "question": "Which inference becomes less secure because of this limitation?",
    "category": "reflection",
    "kind": "modelling",
    "topics": [
      "limitations"
    ],
    "visual": ""
  },
  {
    "id": "EX18",
    "title": "Degree of accuracy: separate recording, calculation and reporting",
    "weak": "Everything is rounded to three significant figures. The calculator gives 10.433101456 minutes, so that is the exact answer.",
    "strong": "I record temperature readings to the display resolution of 0.1 °C and keep their recorded precision in the raw table. I retain full-precision fitted coefficients during calculations. For the estimated threshold time I use a nearest-minute reporting convention, giving about 10 minutes rather than the calculator's long decimal. This rounding convention does not establish that the estimate is accurate to within one minute; uncertainty in the model has not been quantified.",
    "why": "Different quantities need different decisions. The later output explicitly recalls the earlier relevant policy. Exact counts and exact symbolic results should not be rounded merely to match measured temperatures. Instrument resolution and measurement uncertainty are not interchangeable.",
    "question": "Which earlier precision decision applies to this quantity, and are you claiming more accuracy than the evidence supports?",
    "category": "mathematics",
    "kind": "all",
    "topics": [
      "precision"
    ],
    "visual": ""
  },
  {
    "id": "EX19",
    "title": "Explaining unfamiliar mathematics versus applying familiar mathematics",
    "weak": "I used RMSE because a website said it was good. It gave the exponential model a lower number. I also included two pages explaining how to solve a linear equation, even though that was familiar course mathematics.",
    "strong": "**When RMSE is unfamiliar to this student:** I used the root mean square error RMSE = √(Σ(observed − predicted)² / n) to compare fitted models [cite the source actually consulted]. For each observation, the residual is the recorded temperature minus the model's temperature. Squaring prevents positive and negative residuals cancelling; averaging puts the comparison on a per-observation basis, and the square root returns the units to °C. For example, at 10 minutes the residual is 51.4 - 50.88965, approximately 0.510 °C. A smaller RMSE means a closer fit under this criterion, not proof that the model is valid.\n\n**When the technique is already familiar course mathematics:** State the relevant quantities and what is being calculated, show the application at an appropriate level, and interpret it. Omit a textbook-style introduction to the technique.\n\n**An authentic mathematical learning insight:** The residual pattern helped me distinguish a model that is numerically close from one that captures the shape of the relationship.",
    "why": "The explanation is conditional on the student's course and familiarity, not on a hard-coded assumption that RMSE is outside every syllabus. Even a familiar method still needs defined variables, justified choices and interpreted results. A genuine new mathematical insight is different from a procedural tutorial.",
    "question": "What mathematical idea did you actually need to learn, and where does your work demonstrate that understanding?",
    "category": "mathematics",
    "kind": "all",
    "topics": [
      "understanding",
      "learning"
    ],
    "visual": "",
    "variants": [
      {
        "id": "syllabus",
        "label": "Verified within my course",
        "strong": "I apply the familiar technique, define quantities and units, justify why it belongs in this investigation, and interpret the output. I omit a textbook-style explanation of routine course mechanics. Familiarity does not remove the need to show the relevant application."
      },
      {
        "id": "outside",
        "label": "A genuinely unfamiliar idea",
        "strong": "For the unfamiliar RMSE comparison, I define residual = observed minus predicted. Squaring prevents opposite signs cancelling; averaging makes a per-observation measure, and the square root restores temperature units. At 10 minutes, the fictional residual is 51.4 - 50.88965 ≈ 0.510°C. I cite the source I actually consulted and explain that a smaller RMSE is a closer fit under this criterion, not proof of validity."
      },
      {
        "id": "mixed",
        "label": "One new part of a familiar method",
        "strong": "I use the familiar algebra directly and explain only the newly researched model or error measure where it is first needed. A relevant worked step demonstrates my understanding of that new part, with the source credited at its first use."
      },
      {
        "id": "learning",
        "label": "A genuine mathematical insight",
        "strong": "Examining residuals taught me to distinguish a model that is numerically close from one that represents the shape of a relationship. This changed how I assessed my first model. I should describe this insight only if I genuinely reached it."
      }
    ]
  },
  {
    "id": "EX20",
    "title": "Theoretical work: numerical evidence is not a proof",
    "weak": "The values of n cubed minus n are divisible by six for n = 1, 2, 3, 4 and 5, so this proves the result for every integer.",
    "strong": "The tested cases support the conjecture, but a general argument is needed. Factorising gives n cubed minus n = n(n - 1)(n + 1). These are three consecutive integers: at least one is even and one is divisible by three. Their product is therefore divisible by six for every integer n.",
    "why": "The improved version moves from particular cases to a reason that covers the whole stated domain. This is an accessible communication example, not a claim that this single elementary proof meets the mathematical demands of an entire IA.",
    "question": "Which sentence makes your argument cover all cases, rather than only the examples you tested?",
    "category": "mathematics",
    "kind": "theoretical",
    "topics": [
      "proof",
      "calculation"
    ],
    "visual": "proof"
  },
  {
    "id": "EX21",
    "title": "Personal engagement: show a decision that changes the investigation",
    "weak": "I am very passionate about this topic, so I was personally engaged throughout. I enjoyed using the software.",
    "strong": "The straight-line residuals had a systematic pattern rather than appearing randomly scattered around zero. This led me to question my first model and compare it with one that could represent a slowing rate of cooling. That decision changed the estimate and the confidence I could place in my original prediction.",
    "why": "The improved passage shows an authentic mathematical response to evidence. It should appear where the decision was made, not as an isolated paragraph claiming a criterion. Only write it if the decision genuinely occurred; students should not manufacture a false sequence of discovery.",
    "question": "Where can the reader see a mathematical decision you made and its consequences?",
    "category": "reflection",
    "kind": "all",
    "topics": [
      "engagement",
      "next"
    ],
    "visual": ""
  },
  {
    "id": "EX22",
    "title": "Conclusion: answer the aim using the results already established",
    "weak": "In conclusion, mathematics was useful and I proved that the exponential model is accurate. My hypothesis was right. There were some errors, but the experiment was a success.",
    "strong": "For the one fictional cooling trial, an exponential model fitted the recorded temperatures over 0–20 minutes better than a straight line: the in-sample RMSE values were approximately 0.259 °C and 2.90 °C respectively. The fitted exponential estimated reaching 50 °C after about 10 minutes. This answers the original question for the observed trial, not for every cup or set of conditions. A possible next mathematical question is how much the fitted threshold time would vary between repeated trials; that has not been investigated here.",
    "why": "The conclusion answers the aim using only previously established results, limits its scope without repeating every earlier criticism, and offers a specific optional mathematical extension rather than a generic call for more data. That extension is not a completed result.",
    "question": "Can each claim in your conclusion be traced to an actual result or limitation already discussed?",
    "category": "conclusion",
    "kind": "modelling",
    "topics": [
      "conclusion"
    ],
    "visual": ""
  },
  {
    "id": "EX23",
    "title": "An honest limited conclusion can be stronger than a forced success story",
    "weak": "My proposed rule failed for one input, but most of the examples worked, so I have proved the rule approximately.",
    "strong": "The conjecture that n squared plus n plus 41 is prime for every non-negative integer is false: at n = 40 the expression equals 1681, which is 41 squared. The earlier successful cases therefore provide no proof of a universal rule. This counterexample answers the original yes-or-no question, even though it contradicts my prediction. A revised investigation could ask which inputs necessarily produce a factor of 41; that further question has not yet been resolved here.",
    "why": "The counterexample is a genuine mathematical outcome, not a failed IA that needs a positive story. The text distinguishes the completed finding from a possible extension and avoids treating approximate language as a repair to a false universal statement. This is a teaching excerpt, not an IA-sized investigation.",
    "question": "What have you actually established, even when it is different from what you expected?",
    "category": "conclusion",
    "kind": "theoretical",
    "topics": [
      "conclusion"
    ],
    "visual": ""
  },
  {
    "id": "EX24",
    "title": "Coherence and attribution: make the route through the mathematics traceable",
    "weak": "As shown above, the answer is different. I then did another calculation. The equation came from the internet. All of the long software outputs are included in the appendix.",
    "strong": "Figure 1 suggested a slowing rate of cooling. Residuals of the first fit revealed a systematic pattern, so I compared a more appropriate model and then used Table 2 to justify my final estimate. In an actual IA, a model definition adapted from an external source needs an in-text citation at first use and a matching reference-list entry containing the real author or organisation, title, publication date and retrievable location. The fitted coefficients belong to my calculation and must not be attributed to that source. **Illustrative citation format only:** (Author, Year) — this is not a genuine source to copy.",
    "why": "The passage traces result, next question and conclusion, and distinguishes borrowed ideas from the student's own fitted parameters. Citation structure is demonstrated without inventing a real publication; the actual investigation must include verifiable sources, not the teaching placeholder.",
    "question": "Can the reader follow why each section exists and identify where external ideas or data entered?",
    "category": "review",
    "kind": "all",
    "topics": [
      "coherence",
      "references"
    ],
    "visual": ""
  },
  {
    "id": "EX25",
    "title": "Conclusion: a limited statistical finding",
    "category": "conclusion",
    "kind": "statistics",
    "topics": [
      "conclusion"
    ],
    "weak": "The correlation was weak, so music has no effect on anyone’s mathematics results.",
    "strong": "For this separate fictional convenience sample of 20 students, Pearson's r was 0.12. The recorded pairs therefore show little linear association between weekly music-practice time and test percentage. This does not establish causation or rule out every non-linear relationship, and the convenience sample cannot justify a claim about all students. The evidence does not support my hoped-for recommendation. If the existing scatter revealed a meaningful curved pattern, testing that structure could be a worthwhile next question; otherwise a limited conclusion is appropriate.",
    "why": "The conclusion separates the observed linear association from causation and population inference. A possible next mathematical question is conditional on genuine evidence rather than a required extra calculation; no unperformed curve fit is reported.",
    "question": "Does the scope of your statistical conclusion match the design and actual results?",
    "visual": ""
  },
  {
    "id": "EX26",
    "title": "Theoretical limitations: state what your proof covers",
    "category": "reflection",
    "kind": "theoretical",
    "topics": [
      "limitations",
      "assumptions"
    ],
    "weak": "There may have been measurement error in my proof. More data would make it valid.",
    "strong": "The argument for divisibility of n³ - n by six assumes n is an integer. Its consecutive-integer reasoning does not justify a claim for arbitrary real n. The proof covers the stated integer domain; testing additional values is not needed to make that proof general.",
    "why": "A theoretical investigation may need domain and assumption checks rather than irrelevant sampling or instrument limitations. Do not invent a weakness when none affects the claim.",
    "question": "Which assumptions and domain does your argument actually use?",
    "visual": ""
  },
  {
    "id": "EX27",
    "title": "Interpretation: correlation is not the percentage caused",
    "category": "reflection",
    "kind": "statistics",
    "topics": [
      "interpretation"
    ],
    "weak": "r = 0.72 means that music practice caused 72% of the test results.",
    "strong": "In this separate fictional example, r = 0.72 describes a positive linear association in the paired sample: larger practice times tend to occur with larger test percentages. The coefficient is not a percentage of results caused by practice. I still need to examine the scatter and sampling context before making a broader claim.",
    "why": "The mathematical meaning of the statistic is separated from causal and population claims. The fictional value is not computed from the cooling data.",
    "question": "Have you interpreted the statistic according to what it actually measures?",
    "visual": ""
  },
  {
    "id": "EX28",
    "title": "Graphs: respect a discrete domain",
    "category": "presentation",
    "kind": "theoretical",
    "topics": [
      "graph"
    ],
    "weak": "A smooth curve passes through calculated square-array tile counts for side lengths 1, 2, 3 and 4; I then claim the model also represents an arrangement with 2.5 tiles along each side.",
    "strong": "I investigate square arrays with n tiles along each side, where n is a positive integer and the total is n². The four cases (1,1), (2,4), (3,9) and (4,16) are plotted as separate points, with the horizontal axis labelled 'Tiles per side, n'. The algebraic expression extends to other real inputs, but a non-integer number of complete tiles along a side is not another arrangement in this discrete investigation.",
    "why": "The mathematical object and its domain are defined before choosing a graph. A continuous formula can describe a function beyond the discrete problem without making those extra inputs valid physical cases.",
    "question": "Which plotted inputs are actually meaningful for your investigation?",
    "visual": "discrete"
  },
  {
    "id": "EX29",
    "title": "Graphs: categories are not a continuous variable",
    "category": "presentation",
    "kind": "statistics",
    "topics": [
      "graph",
      "distribution"
    ],
    "weak": "Three categories labelled A, B and C are connected with a curve, suggesting meaningful intermediate category values.",
    "strong": "Separate bars show the counts for the three categories in the same fictional sample: A has 8 observations, B has 12, and C has 5. The vertical axis starts at zero and identifies frequency. This display compares counts; it does not suggest intermediate categories or a regression relationship.",
    "why": "The representation matches categorical data. Zero-baseline bars support count comparisons; this is not a rule that every scatter-graph axis must begin at zero.",
    "question": "Does the representation fit your variable type?",
    "visual": "categorical"
  },
  {
    "id": "EX30",
    "title": "Provisional IA titles: a question you can actually investigate",
    "category": "methods",
    "kind": "all",
    "topics": [
      "title",
      "aim",
      "engagement"
    ],
    "weak": "**Too broad:** 'Mathematics in basketball'.\n\n**Assumes a conclusion:** 'Why practising music improves maths grades'.\n\n**Just names a technique:** 'Using correlation and regression'.",
    "strong": "**Modelling:** 'How well does a quadratic model describe the path of a basketball shot recorded on video?'\n\n**Statistics:** 'Is weekly music-practice time associated with mathematics test marks in a sample of students?'\n\n**Mathematical curiosity:** 'How does the number of ways to tile a 2 by n rectangle with dominoes change as n increases?'",
    "why": "A useful working title identifies an investigable relationship, property or problem. It need not promise a result, name impressive techniques, or announce that the topic is a personal passion. It can change when genuine calculations lead somewhere interesting. These are fictional prompts, not guaranteed suitable IA topics or titles to copy.",
    "question": "What precisely might your mathematics answer? Which words would you revise if the evidence leads to a different question?",
    "visual": ""
  },
  {
    "id": "EX31",
    "title": "Motivation: an answer that could inform a choice",
    "category": "methods",
    "kind": "modelling",
    "topics": [
      "motivation"
    ],
    "weak": "I am going to find the maximum volume of a box because differentiation gives a mathematical answer and I think calculus is useful.",
    "strong": "I want to understand how the size of corner cut-outs changes the volume of an open box made from one fixed sheet. Comparing the volumes could help me decide which cut size is worth trying. The calculation will give an idealised answer; I will need to return to the original design question when interpreting whether that answer is useful, since the model does not test the box's strength.",
    "why": "This explains a worthwhile question and what knowing the answer might change, rather than simply saying a technique will produce a result. Its practical meaning remains provisional; the eventual mathematics must support the claim. The student does not need to invent an emotional backstory.",
    "question": "What could you understand, compare, explain or decide once you know the answer—and will you check that when interpreting your results?",
    "visual": ""
  },
  {
    "id": "EX32",
    "title": "Motivation: comparing evidence for a real decision",
    "category": "methods",
    "kind": "statistics",
    "topics": [
      "motivation"
    ],
    "weak": "I will collect queue times and calculate an average. This will give me a result for my IA.",
    "strong": "I want to know whether the wait at two service points differs enough to make choosing one rather than the other worthwhile. I could record waiting times in comparable periods, examine the distributions and judge whether the observed difference is meaningful for that choice. Even if one seems faster in my sample, I will need to consider how variable the waits are before recommending a change.",
    "why": "There is a clear reason for investigating rather than just a planned statistic. The intended beneficiary is not an automatic finding; any advice would depend on the actual sample, variation and limitations.",
    "question": "Does your proposed mathematical answer help someone make a decision or understand something—and would your evidence justify that use?",
    "visual": ""
  },
  {
    "id": "EX33",
    "title": "Motivation: a genuine mathematical question without a made-up beneficiary",
    "category": "methods",
    "kind": "theoretical",
    "topics": [
      "motivation"
    ],
    "weak": "I really love number patterns and want to use algebra to get an interesting answer, which will show my passion for mathematics.",
    "strong": "Looking at arrangements of dominoes on a 2 by n rectangle, I began to wonder how the number of tilings depends on the positive integer n. My aim is to investigate whether the counts satisfy a recurrence and, if they do, explain mathematically why that relationship holds. Small cases may suggest a rule, but I will not treat them as a proof.",
    "why": "The curiosity is connected to a precise count and an answerable recurrence question, not an invented personal benefit. It remains a provisional mathematical question: a few observed cases cannot prove a rule, and a suitable IA would need sufficient further mathematical development.",
    "question": "What mathematical uncertainty do you genuinely want to resolve, and how would you know whether your argument answered it?",
    "visual": ""
  },
  ...EXPANDED_EXAMPLES
];
export const NUMERICAL_EXAMPLE = {
  "time_min": [
    0.0,
    2.0,
    4.0,
    6.0,
    8.0,
    10.0,
    12.0,
    14.0,
    16.0,
    18.0,
    20.0
  ],
  "temperature_degC": [
    82.0,
    73.6,
    66.8,
    60.7,
    55.1,
    51.4,
    46.7,
    43.9,
    40.5,
    38.6,
    36.0
  ],
  "A": 58.95551706090591,
  "k": 0.07485275099584918,
  "m": -2.2313636363636355,
  "b": 76.43181818181819,
  "linear_rmse": 2.902405670764504,
  "exponential_rmse": 0.2594977085945776,
  "threshold_time": 10.433101456252894,
  "exp_pred10": 50.88965137231965,
  "residual10": 0.5103486276803508
};
export const exampleById = id => EXAMPLES.find(x => x.id === id) || null;
