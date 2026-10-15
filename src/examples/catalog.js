/** Original fictional teaching excerpts. Not IB-approved model answers or student findings. */
export const EXAMPLES = [
  {
    "id": "EX01",
    "title": "Introduction: a mathematical question, not a list of techniques",
    "weak": "This exploration investigates the cooling of tea using mathematics. I will take temperature readings, draw graphs and calculate equations. Exponential functions have many applications, so I will use one to show how the temperature changes. I predict that the tea will become colder as time passes.",
    "strong": "I often leave a cup of tea beside me while studying and notice that it seems to cool quickly at first, then more slowly. I want to investigate how well linear and exponential models describe its temperature over 20 minutes, and use the better-supported model to estimate when it reaches my chosen reference temperature of 50 °C. I will use readings from one uncovered 250 ml cup, taken at two-minute intervals. My prediction is that a decreasing exponential model will describe the slowing rate of cooling better, but the measurements must determine whether that prediction is supported.",
    "why": "The same topic now has a specific mathematical purpose, a manageable scope and a provisional prediction. The method is connected to the question rather than presented as a technique checklist. The opening observation is appropriate only for a student for whom it is genuine; an invented backstory is not an improvement.",
    "question": "Can a reader say what mathematical question you are answering, and what evidence could answer it?",
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
    "weak": "I will investigate whether practicing music makes students better at mathematics. I will survey 20 students, calculate a correlation coefficient and use a line of best fit to prove my hypothesis.",
    "strong": "I want to investigate whether weekly music-practice time and the most recent mathematics test percentage are associated in a sample of 20 students from the same class. I will first inspect the paired numerical observations, then choose an appropriate measure of association. The survey is observational, so it cannot establish that music practice causes higher mathematics attainment; other differences between students may matter.",
    "why": "The improved version defines the quantities and population, removes the predetermined conclusion and makes the scope of inference explicit. It does not turn an observational survey into a controlled experiment by changing the wording.",
    "question": "Are you investigating an association, a difference, a prediction or a causal claim?",
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
    "strong": "For the first few positive integers, the difference between the cube and the original number appears to be divisible by six. I want to determine whether this is true for every integer, rather than only the cases I have tested, and to explain which feature of the expression makes it happen. I will distinguish numerical evidence for the conjecture from a general argument.",
    "why": "A theoretical exploration can have a clear purpose without claiming an external beneficiary or inventing a personal anecdote. This short example illustrates how to state a conjecture; it is not a claim that this elementary result alone constitutes a sufficiently substantial IA.",
    "question": "What exactly is your conjecture, and what would count as a proof or counterexample?",
    "category": "introduction",
    "kind": "theoretical",
    "topics": [
      "introduction",
      "aim"
    ],
    "visual": ""
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
    "strong": "**When RMSE is unfamiliar to this student:** I used the root mean square of the residuals to compare the models [cite the source actually consulted]. For each observation, the residual is the recorded temperature minus the model's temperature. Squaring prevents positive and negative residuals cancelling; averaging puts the comparison on a per-observation basis, and the square root returns the units to °C. For example, at 10 minutes the residual is 51.4 - 50.88965, approximately 0.510 °C. A smaller RMSE means a closer fit under this criterion, not proof that the model is valid.\n\n**When the technique is already familiar course mathematics:** State the relevant quantities and what is being calculated, show the application at an appropriate level, and interpret it. Omit a textbook-style introduction to the technique.\n\n**An authentic mathematical learning insight:** The residual pattern helped me distinguish a model that is numerically close from one that captures the shape of the relationship.",
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
    "strong": "For the single 250 ml cup in this investigation, the exponential model described the recorded temperatures over 0 to 20 minutes more closely than the linear model: their in-sample RMSE values were approximately 0.259 °C and 2.90 °C respectively. The exponential model estimated that the temperature reached the chosen 50 °C reference after about 10 minutes, using the reporting convention established earlier. This supports my prediction about the slowing rate of cooling in this trial. It is not a measured crossing time, an independent validation result or a recommendation for other cups and conditions. The single-trial design limits what I can say about repeatability.",
    "why": "The conclusion answers the stated question, selects the most relevant evidence and keeps the claim within its limits. Every calculation and qualification used here has already been introduced; the conclusion is not the place to unveil an unperformed test.",
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
    "strong": "Figure 1 suggested a slowing rate of cooling. The residuals of the first model confirmed that a constant rate missed the pattern, so the next section compared an exponential model fitted to the same readings. Table 2 summarises that comparison and supports the model used for the final estimate. The model form and any unfamiliar method are credited where they first enter the work [cite the sources actually used]; the fitted parameter values come from this investigation's data. Essential reasoning stays in the main text, while a lengthy raw output belongs in an appendix only when it is useful for checking the work.",
    "why": "The improved version connects representation, finding, next question, method and conclusion. It distinguishes an external idea from the student's own fit and does not hide essential reasoning in an appendix. The bracketed citation instruction is deliberately a placeholder: no fictional source is being presented as real.",
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
    "strong": "In this fictional sample of 20 students, the calculated Pearson coefficient of 0.12 provides little evidence of a linear association between weekly music-practice time and the test percentage. This does not rule out every form of relationship or establish a causal effect. The convenience sample restricts generalisation. My analysis therefore does not support the broader recommendation I initially hoped to make.",
    "why": "This is a separate fictional statistical scenario, not the cooling dataset. The conclusion distinguishes a small linear coefficient, causation and the sample’s scope; these qualifications must already have been discussed.",
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
    "weak": "A smooth curve passes through counts for 1, 2, 3 and 4 tiles; it is used to claim a prediction for 2.5 tiles.",
    "strong": "The four calculated cases are plotted as separate points. The horizontal axis is the number of tiles, n, so its mathematical domain is positive integers. A smooth extension may help visualise a formula, but it is not an additional case of this discrete problem.",
    "why": "A graph should not silently enlarge the mathematical domain. The fictional points are (1,1), (2,4), (3,9) and (4,16).",
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
  }
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
