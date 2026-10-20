/** Original fictional paired comparisons. Never use these as student results or assessable IA model answers. */
export const EXPANDED_EXAMPLES = [
  {
    "id": "EX35",
    "title": "Paired data: inspect the scatter before choosing a coefficient",
    "category": "presentation",
    "kind": "statistics",
    "topics": [
      "graph",
      "method",
      "interpretation",
      "relationships"
    ],
    "weak": "I chose Pearson correlation because my question has two numerical variables. I can calculate r before looking at the graph.",
    "strong": "For a fictional investigation of practice time and test percentage, I first plot each student's paired observations, identifying both quantities and their units. I inspect the shape, unusual observations and any grouping before deciding whether a linear-association measure would address the question. If the points curve or form distinct clusters, reporting Pearson's r without examining that structure could mislead.",
    "why": "A scatter diagram is a diagnostic first step, not merely decoration before an automatic PMCC. The student has not pretended that its shape or coefficient is known in advance.",
    "question": "What feature of your actual scatter makes a linear correlation coefficient appropriate—or makes you hesitate?",
    "visual": ""
  },
  {
    "id": "EX36",
    "title": "Comparing two groups: averages can conceal different spreads",
    "category": "presentation",
    "kind": "statistics",
    "topics": [
      "distribution",
      "graph",
      "method",
      "interpretation",
      "groups"
    ],
    "weak": "The two groups both have a mean of 10, so their performances are identical and there is nothing else to compare.",
    "strong": "In this fictional comparison, Group A has values 8, 9, 10, 11, 12 and Group B has 4, 6, 10, 14, 16. Both means and medians are 10, but their ranges are 4 and 12 respectively. I would show comparable distribution plots with the same scale and discuss this difference in variation before deciding whether the groups are practically similar. Five observations per group cannot establish a population-wide difference.",
    "why": "Every numerical statement is traceable to the five stated fictional values. Comparing variability alongside location prevents the same mean being mistaken for the same distribution; appropriate inference depends on sampling and the aim.",
    "question": "Would a difference or similarity in averages alone answer your group-comparison question?",
    "visual": "groups"
  },
  {
    "id": "EX37",
    "title": "Categorical data: use denominators, not just counts",
    "category": "presentation",
    "kind": "statistics",
    "topics": [
      "distribution",
      "table",
      "graph",
      "categorical"
    ],
    "weak": "Service point B had six late arrivals and A had eight, so B is better. I could plot each category as if it were a continuous variable.",
    "strong": "The fictional two-way table shows 8 late and 12 on-time observations at A, compared with 6 late and 24 on-time observations at B. I compare the late proportions using the correct row totals: 8/20 = 40% at A and 6/30 = 20% at B. A well-labelled two-way table or proportion chart communicates this difference; it does not establish a causal explanation or a wider population effect.",
    "why": "The correct denominators change the interpretation. The table is genuinely categorical, and no unperformed significance test or causal conclusion is smuggled into the comparison.",
    "question": "Have you stated the denominator for every proportion, and do your categories and data collection justify that comparison?",
    "visual": "twoway"
  },
  {
    "id": "EX38",
    "title": "Periodicity: distinguish a repeating cycle from a short trend",
    "category": "presentation",
    "kind": "modelling",
    "topics": [
      "graph",
      "model",
      "assumptions",
      "cycles"
    ],
    "weak": "My first few values go up and then down, so I fitted a sine curve. This proves that the phenomenon repeats every twelve hours.",
    "strong": "A fictional sequence covers three apparent 12-hour cycles, with peaks near 6, 18 and 30 hours. Before considering a sinusoidal model I would display the entire time range, check whether peak spacing and amplitude are reasonably consistent, and define time, measurement units and the observed domain. Even if a sine model describes these cycles, three periods do not guarantee that the same pattern continues indefinitely.",
    "why": "A sinusoidal choice must follow evidence of repetition, rather than be inferred from a single turning point. The limits of extrapolation and model assumptions are explicit.",
    "question": "How many cycles do your genuine observations cover, and which features support a periodic model?",
    "visual": "periodic"
  },
  {
    "id": "EX39",
    "title": "Voronoi diagrams: boundaries depend on a distance assumption",
    "category": "presentation",
    "kind": "modelling",
    "topics": [
      "diagram",
      "model",
      "assumptions",
      "voronoi"
    ],
    "weak": "I drew three regions around the three locations. The area in each region belongs to its nearest hospital, so everyone will travel quickest to that hospital.",
    "strong": "For three fictional sites A=(1,1), B=(5,1), and C=(1,5), I construct the Voronoi regions using ordinary Euclidean distance. The boundaries of A's region meet at (3,3), where the three sites are equally distant. This diagram identifies the nearest site in straight-line distance, within the chosen mapped domain. Real travel time depends on roads and other conditions, so it cannot be inferred from this diagram alone.",
    "why": "The coordinate system, site locations, mathematical definition of nearness and limitations are supplied. The labelled figure distinguishes an exact geometric construction from an unsupported service recommendation.",
    "question": "What metric defines 'nearest' in your investigation, and what would change if that metric changed?",
    "visual": "voronoi"
  },
  {
    "id": "EX40",
    "title": "Probability and simulation: compare experimental and exact results",
    "category": "mathematics",
    "kind": "statistics",
    "topics": [
      "calculation",
      "proof",
      "method",
      "chance"
    ],
    "weak": "My computer found at least one head in 72 of 100 trials of two coin flips. Therefore the probability is exactly 0.72.",
    "strong": "For two independent fair coin flips, the equally likely outcomes are HH, HT, TH and TT. Three have at least one head, so the theoretical probability is 3/4. In a fictional simulation this event occurred in 72 of 100 trials, giving a relative frequency of 0.72. The difference from 0.75 is plausible sampling variation; the simulation illustrates behaviour rather than proving the exact probability or establishing that the coin is fair.",
    "why": "A precise sample space supplies mathematical justification. A simulated frequency is empirical, not an exact probability, and assumptions of fairness and independence are stated.",
    "question": "Which result comes from mathematical reasoning, and which is only an estimate from simulation?",
    "visual": "simulation"
  },
  {
    "id": "EX41",
    "title": "Iteration: approaching a value is not a proof of convergence",
    "category": "mathematics",
    "kind": "theoretical",
    "topics": [
      "calculation",
      "proof",
      "next",
      "iteration"
    ],
    "weak": "My spreadsheet reaches 1.414214 after four steps. It proves the sequence always converges to square root two.",
    "strong": "Consider x_(n+1) = (x_n + 2/x_n)/2 with x_0 = 1. The next terms are 1.5, approximately 1.416667 and 1.414216. A positive fixed point must satisfy x = (x+2/x)/2, hence x²=2 and x=√2. These calculations and the fixed-point equation suggest the limit, but an argument establishing convergence from the chosen starting value is still required before declaring it proved.",
    "why": "Iteration, fixed-point reasoning and a convergence claim are different stages. The excerpt accurately states what the computed terms support and what they do not prove.",
    "question": "What justifies that the iteration actually converges, rather than simply having some close-looking terms?",
    "visual": "iteration"
  },
  {
    "id": "EX42",
    "title": "Tracing images: establish scale before interpreting coordinates",
    "category": "presentation",
    "kind": "modelling",
    "topics": [
      "diagram",
      "graph",
      "precision",
      "images"
    ],
    "weak": "The object is 40 pixels wide, so I measured it as 40 centimetres. My traced curve is accurate because it comes from a photograph.",
    "strong": "In a fictional planar photograph, a calibration segment representing 5.0 cm spans 100 pixels in the same plane as the traced object. A 40-pixel distance on that plane would represent 2.0 cm under a uniform scale. I would show the coordinate axes, calibration segment, labelled traced points and the transformation from pixel to physical units. Perspective or lens distortion could invalidate that simple conversion away from the calibrated plane.",
    "why": "The geometric scale is calculated rather than assumed, and its model limitations are mathematical. Pixel spacing is not automatically measurement accuracy.",
    "question": "Which reference length, viewpoint and coordinate convention make your traced dimensions defensible?",
    "visual": ""
  },
  {
    "id": "EX43",
    "title": "Primary measurement: resolution is not guaranteed accuracy",
    "category": "methods",
    "kind": "all",
    "topics": [
      "precision",
      "source",
      "variation"
    ],
    "weak": "The digital ruler shows 12.3 cm, so the length is exactly 12.3 ± 0.05 cm and all later calculations are accurate to two decimal places.",
    "strong": "Suppose a fictional digital measuring device displays lengths in steps of 0.1 cm, including a reading of 12.3 cm. I can report the displayed resolution as 0.1 cm, but cannot assign a ±0.05 cm accuracy bound without further information about the device, calibration and reading procedure. I retain appropriate digits in calculations and justify the precision of any derived result separately.",
    "why": "Recording increment, accuracy, possible uncertainty and reporting precision are not interchangeable. The passage does not invent a device specification or imply a bound that has not been verified.",
    "question": "Are you describing what the device displays, or an uncertainty supported by evidence?",
    "visual": ""
  },
  {
    "id": "EX44",
    "title": "Secondary data: printed decimals do not prove measurement accuracy",
    "category": "methods",
    "kind": "statistics",
    "topics": [
      "source",
      "precision",
      "references"
    ],
    "weak": "The published figure is 45%, so I know the original percentage was measured accurately to the nearest whole percent.",
    "strong": "A fictional table prints 45%. If the publisher truly rounded a more precise percentage to the nearest whole percent, the unrounded value would conventionally lie from 44.5% (inclusive) to 45.5% (exclusive). But without the publisher's methodology I cannot confirm that this was the rounding rule, or that the source measurement was accurate. I would identify the table, year, population and original source before analysing the figure.",
    "why": "An interval implied by a *stated* rounding rule is not evidence of data collection accuracy. Provenance, definitions and any uncertainty about the published method remain visible.",
    "question": "What does the original source establish about definitions, rounding and data quality—and what remains unknown?",
    "visual": ""
  },
  {
    "id": "EX45",
    "title": "Census, sample and sampling frame: describe what really happened",
    "category": "methods",
    "kind": "statistics",
    "topics": [
      "source",
      "sampling",
      "limitations"
    ],
    "weak": "I contacted every student in the club, so my 21 responses form a random census representing the entire year group.",
    "strong": "The fictional club register contains 28 members, and all 28 were invited to respond; 21 did. This was an attempted census of the club, with seven nonresponses—not a completed census of observed outcomes and not a random sample of the school year. The register is a frame for club members only. I can describe the 21 responses, consider how nonresponse may bias them, and explain why extending the claim beyond the club would require a different design.",
    "why": "Population, frame, attempted census, response and inference are explicitly separated. Calling a convenient or incomplete group 'random' cannot improve the strength of its conclusions.",
    "question": "Who belonged to the target population, which units were reachable, and who was actually observed?",
    "visual": ""
  },
  {
    "id": "EX46",
    "title": "Optimisation: compare stationary points with feasible boundaries",
    "category": "mathematics",
    "kind": "modelling",
    "topics": [
      "calculation",
      "method",
      "limitations",
      "optimisation"
    ],
    "weak": "My derivative is zero at one value, so I have found the best possible box. There is no need to examine restrictions or endpoints.",
    "strong": "For the idealised open box cut from a 30 cm by 20 cm sheet, V(x)=x(30−2x)(20−2x) cm³ and 0<x<10. Solving V'(x)=0 gives x=(25−5√7)/3≈3.924 cm inside this domain; the other stationary solution lies outside it. I check the derivative's sign and compare the limiting volumes as x approaches the excluded endpoints, where the volume tends to zero. This establishes the modelled volume maximum, not a claim about the box's strength or manufacturing cost.",
    "why": "The feasible domain and endpoint behaviour are essential to the optimisation. A stationary point alone is not a justified global maximum, and the physical interpretation remains conditional.",
    "question": "Have you checked every feasible candidate and any relevant boundary or limiting case?",
    "visual": ""
  },
  {
    "id": "EX47",
    "title": "Financial models: state the compounding convention",
    "category": "mathematics",
    "kind": "modelling",
    "topics": [
      "calculation",
      "method",
      "assumptions",
      "finance"
    ],
    "weak": "A 12% annual interest rate always produces 12% growth in a year. I will compare accounts by their headline percentages.",
    "strong": "Under a fictional deposit model with nominal annual interest of 12% compounded monthly and no fees, a starting balance P becomes P(1+0.12/12)^12 after one year. The effective annual growth is (1.01)^12−1≈12.68%, not 12%. This comparison needs the same investment period and a clearly stated compounding convention. It says nothing by itself about inflation, penalties, changing rates or the best real-world account.",
    "why": "The algebra exposes the actual assumptions behind a financial percentage. An effective growth comparison is not automatically a complete financial recommendation.",
    "question": "Are the rates, intervals and assumptions genuinely comparable in the decision you are investigating?",
    "visual": ""
  },
  {
    "id": "EX48",
    "title": "First-maths bridge: connect the aim without repeating your introduction",
    "category": "methods",
    "kind": "all",
    "topics": [
      "first-link",
      "aim",
      "coherence"
    ],
    "weak": "I already explained my aim. Now I will do calculations, draw graphs and use technology to find the answer.",
    "strong": "My question is whether a recorded quantity changes at a constant rate. I will first plot the observed quantity against time, because the shape of that graph can show whether a constant-rate model is even plausible. If my introduction already makes this connection, I can move directly to the graph without repeating the same bridge.",
    "why": "The reader understands why this initial piece of mathematics belongs here; the example does not promise a result or insert another generic methods paragraph.",
    "question": "Have you explained *why this first step*, once, in either your introduction or immediately before the mathematics?",
    "visual": ""
  },
  {
    "id": "EX49",
    "title": "First maths 2a: justify a technique without a textbook tutorial",
    "category": "methods",
    "kind": "all",
    "topics": [
      "first-method",
      "method",
      "coherence"
    ],
    "weak": "I will explain what a scatter graph is, describe how to plot each point and then calculate Pearson's r because these are methods we learned.",
    "strong": "I have genuine paired numerical observations. I will begin with a scatter diagram so I can inspect the form of their relationship and identify any unusual values before choosing a measure or model. This method can answer my immediate question without assuming in advance that the association is linear. I will label the quantities and units, but I do not need to teach a coursemate how to draw a scatter diagram.",
    "why": "The choice is justified through its mathematical purpose and the evidence required, not the availability or apparent sophistication of a technique. The statement does not claim to have seen an unproduced pattern.",
    "question": "What makes your chosen mathematics suitable for the question you are addressing at this point?",
    "visual": ""
  },
  {
    "id": "EX50",
    "title": "First maths 2b: limitations, alternatives and a defensible choice",
    "category": "methods",
    "kind": "all",
    "topics": [
      "first-evaluation",
      "assumptions",
      "limitations"
    ],
    "weak": "A scatter graph is accurate, but its limitation is human error. I will also use regression to make my investigation better.",
    "strong": "A scatter diagram will reveal the observed shape but will not itself quantify how well a model predicts values or justify causation. If the points are approximately linear, a fitted line and residuals may address a prediction aim; a clear curved pattern could instead motivate a model with different structure. I am starting with the scatter precisely because it lets evidence guide that choice. These are possible next steps, not findings or calculations I have already performed.",
    "why": "The mathematical limitation changes what may be concluded. Alternatives are conditional on genuine evidence, and the selected first method remains justified rather than mechanically extended.",
    "question": "What does your method *not* establish, and which alternative would only become useful if the results warranted it?",
    "visual": ""
  },
  {
    "id": "EX51",
    "title": "Conclusion, part 2: explain meaning and limits without repeating all the maths",
    "category": "conclusion",
    "kind": "all",
    "topics": [
      "conclusion-meaning",
      "interpretation",
      "limitations"
    ],
    "weak": "The calculations are shown in the previous pages. This is useful to everyone, although there may have been human error, and the investigation could be more accurate.",
    "strong": "The fictional model gives a useful estimate within the range of times actually observed, but the fitted parameters came from one trial and have not been tested for repeatability. I therefore use the estimate to answer my original question about this trial, not to advise anyone about different equipment or conditions. The details of the fit and residuals have already been explained beside the mathematics.",
    "why": "The meaning of the result is explicitly tied to its evidence and intended use. Only a consequential mathematical boundary is carried into the conclusion; earlier calculations and generic limitations are not repeated.",
    "question": "Does your conclusion explain what the answer can inform—and where its mathematical support ends?",
    "visual": ""
  },
  {
    "id": "EX52",
    "title": "Conclusion, part 3: a worthwhile optional mathematical next question",
    "category": "conclusion",
    "kind": "modelling",
    "topics": [
      "conclusion-next",
      "next",
      "reflection"
    ],
    "weak": "In future I could collect more data and use harder mathematics because this investigation has limitations.",
    "strong": "The fictional exponential fit described the measured cooling interval well, but it was fitted to one trial. Repeating comparable trials and examining how the fitted parameter k varies could test whether the predicted threshold time is stable. That would extend the mathematical question from fitting one curve to examining variability in the model's predictions. I have not carried out those additional trials; if my original aim is answered, I may instead finish here.",
    "why": "A proposed extension comes directly from a known restriction and names the mathematics it would investigate. It is not presented as completed work or an obligatory addition.",
    "question": "Which specific mathematical question remains open, and why would resolving it improve the answer?",
    "visual": ""
  },
  {
    "id": "EX53",
    "title": "Trajectories: a fitted parabola requires a calibrated coordinate system",
    "category": "presentation",
    "kind": "modelling",
    "topics": [
      "graph",
      "diagram",
      "method",
      "trajectories"
    ],
    "weak": "A basketball follows a parabola, so I traced some pixels and fitted a quadratic equation. I can use the equation to predict any shot.",
    "strong": "In a fictional side-view video I define horizontal and vertical axes, a scale from a reference length in the plane of motion, and the coordinates of selected ball centres. A quadratic model may approximate the observed arc, but I must inspect the residuals and restrict conclusions to the measured segment. Camera angle, centre-location uncertainty, and missing time information could limit how the fitted path relates to real projectile motion.",
    "why": "The figure and fitted function are presented as a testable geometric model, not a guaranteed physical law. Scale, coordinate definition and domain are necessary before coefficients have real-world meaning.",
    "question": "How were the coordinates calibrated, and what does your fitted curve legitimately predict?",
    "visual": ""
  },
  {
    "id": "EX54",
    "title": "Triangulation: use labelled geometry and check assumptions",
    "category": "mathematics",
    "kind": "modelling",
    "topics": [
      "diagram",
      "calculation",
      "method",
      "triangulation"
    ],
    "weak": "I used trigonometry to find the distance from the tree. My calculator gave 82.2, so the distance is exact.",
    "strong": "For a fictional level-ground survey, I measure a baseline AB=100 m and angles ∠PAB=40° and ∠PBA=55° to an inaccessible point P. The third angle is 85°, so the sine rule gives AP=100 sin55°/sin85°≈82.2 m. A labelled diagram identifies A, B and P and the measured angles. This estimate assumes the observations describe a common plane; the precision depends on baseline and angle measurements, not just the calculator display.",
    "why": "The result is reconstructable from defined measurements and correct geometry. The physical assumptions and precision of a derived distance are distinguished from an exact algebraic identity.",
    "question": "Could another student reproduce the calculation from your labelled diagram and stated assumptions?",
    "visual": ""
  },
  {
    "id": "EX55",
    "title": "Further mathematics: justify a new stage using the previous result",
    "category": "reflection",
    "kind": "all",
    "topics": [
      "next",
      "coherence",
      "engagement"
    ],
    "weak": "I have finished the graph, so I will now find a regression equation, then differentiate it and add some statistics to show harder mathematics.",
    "strong": "In this fictional modelling sequence, the residuals from the linear fit have a systematic curved pattern. This raises a specific new question: can a plausible alternative model reduce that structure without sacrificing interpretability? I will compare a curved model and its residuals within the observed domain, then decide whether the aim has been answered. If no consequential question remains, adding a further stage is not necessary.",
    "why": "The new technique follows a genuine mathematical finding and states what evidence could justify or reject it. The example does not prescribe a fixed number of stages or promote complexity for its own sake.",
    "question": "What *specific earlier result* makes your next mathematical stage worthwhile?",
    "visual": ""
  }
];
