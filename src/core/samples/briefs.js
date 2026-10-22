/**
 * Editorial briefs for the sixteen planned fictional IA investigations.
 * A brief is not an authored sample or evidence of readiness. The sample
 * registry derives availability from the actual, validated sample documents.
 */
export const SAMPLE_BRIEFS = Object.freeze([
  {
    id: 'standing-reach', routeId: 'relationships',
    title: 'Can height set a fair basketball drill target?',
    aim: 'How accurately can I use height alone to set a basketball drill target 25 cm above a participant\'s standing reach, with a tolerance of ±5 cm?',
    courseScope: 'AI SL or AA SL: paired data, Pearson correlation where justified, least-squares regression, residuals, interpolation and a contextual prediction check. Statistical generalisation is limited by the constructed sample.',
    evidencePlan: 'Use 24 explicitly constructed pairs of height and standing reach in centimetres. Fix 18 development cases and six validation cases before fitting. Keep the validation values separate from model selection and preserve all cases.',
    stages: [
      'Plot the paired heights and standing reaches to decide whether a linear description is plausible.',
      'Calculate correlation and a regression model; interpret the gradient and intercept within the observed height range.',
      'Inspect residuals and investigate the most influential case without automatically deleting it.',
      'Predict standing reach for the six reserved cases and compare prediction errors with the ±5 cm requirement.',
      'Translate reach predictions into drill targets by adding 25 cm, then decide whether height alone meets the stated accuracy criterion.'
    ],
    figures: ['Scatter plot with meaningful height/reach labels', 'Fitted line and residual plot', 'Compact development-versus-validation error summary', 'Target error display with ±5 cm reference limits'],
    keyChecks: ['Every pair stays paired and appears in only one fixed partition.', 'Fit and validation values reproduce from the saved dataset.', 'Adding 25 cm does not change the prediction error.', 'A strong correlation is not itself evidence that the ±5 cm tolerance is met.', 'The conclusion states the observed-domain and constructed-data limits.']
  },
  {
    id: 'helicopter-groups', routeId: 'groups',
    title: 'Which paper helicopter design stays airborne longer?',
    aim: 'How do the flight-time distributions of two paper helicopter designs differ under the same drop conditions, and is the difference useful compared with their variability?',
    courseScope: 'AI SL core: comparative distributions, centre, spread and a justified two-sample comparison only if its conditions and course scope are satisfied. AA SL alternative: descriptive comparison and uncertainty without assuming an inferential test is in the course.',
    evidencePlan: 'Construct a labelled teaching dataset for independent paper helicopters of two designs under a fixed drop height and procedure. Distinguish separate helicopters from repeated drops of the same helicopter; define the independent unit before any test.',
    stages: [
      'Compare flight-time distributions on a common scale and inspect skew, overlap and unusual values.',
      'Calculate and interpret differences in centre alongside IQR or standard deviation.',
      'Check independent units and sampling conditions before any inferential extension; investigate whether observed design differences are robust to the spread.',
      'Make a bounded design recommendation using the magnitude and consistency of the observed difference.'
    ],
    figures: ['Comparable box plots with shared units and scale', 'Small summary table of counts, centres and spreads', 'Effect-size or difference display appropriate to the chosen analysis'],
    keyChecks: ['Repeated drops are not silently counted as independent helicopters.', 'Both groups use comparable measurement conditions.', 'Any test, null hypothesis and assumptions are stated correctly.', 'Statistical significance is distinguished from practical usefulness.', 'Authentic unusual values are retained or explicitly investigated.']
  },
  {
    id: 'revision-formats', routeId: 'categorical',
    title: 'Do revision-format preferences differ between year groups?',
    aim: 'Is year group associated with preferred mathematics revision format in a defined school sample, and which category differences account for the pattern?',
    courseScope: 'AI SL: conditional proportions, contingency tables and chi-squared independence subject to appropriate expected counts and independent responses. Do not advertise this test as an automatic AA SL route.',
    evidencePlan: 'Construct anonymous counts for a defined sample choosing one mutually exclusive preferred format. Retain group totals and a documented category definition; include no identifiable responses or invented permissions.',
    stages: [
      'Build the two-way frequency table and compare within-year proportions using the correct denominators.',
      'Calculate expected frequencies under independence and check whether the table supports the proposed test.',
      'Carry out and interpret a chi-squared independence calculation, including degrees of freedom and the prespecified decision rule.',
      'Inspect the contributions and proportional differences to explain the association and its sampling limits.'
    ],
    figures: ['Concise contingency table including totals', '100% stacked bar chart of within-year preferences', 'Expected-count or contribution summary'],
    keyChecks: ['Every observation belongs to one year and one preference category.', 'Row, column and grand totals agree.', 'The denominator of each proportion is explicit.', 'Expected frequencies and degrees of freedom are reproducible.', 'No categories are combined merely to obtain a desired result; association is not causation.']
  },
  {
    id: 'grinder-reliability', routeId: 'variation',
    title: 'How reliable is a timed coffee-grinder dose?',
    aim: 'How consistently does a fixed grinding time deliver an 18 g dose, and what can I justify about the chance of falling within an agreed tolerance?',
    courseScope: 'AI SL or AA SL: distribution summaries, standard deviation and a normal model only if shape and process assumptions make it reasonable. Observed proportions remain a valid alternative.',
    evidencePlan: 'Construct repeated dose masses in grams in their original trial order, recording a fixed timer setting and stated balance resolution. Preserve the order so drift can be distinguished from independent variation.',
    stages: [
      'Plot the ordered readings and their distribution to identify drift, skew or unusual doses.',
      'Summarise centre and spread, separating bias from repeatability.',
      'Compare the observed in-tolerance proportion with a justified distribution model, or explain why the model is unsuitable.',
      'Investigate whether a revised target or setting changes the tolerance conclusion without hiding process variability.'
    ],
    figures: ['Dose against trial order', 'Histogram or box plot with tolerance bounds', 'Compact observed-versus-modelled tolerance summary'],
    keyChecks: ['Balance resolution is not equated with true measurement accuracy.', 'A tight spread does not establish an unbiased 18 g target.', 'A normal model is checked rather than assumed.', 'Trial dependence or drift restricts a probability claim.', 'Any changed setting is explicitly a modelled scenario unless new data are supplied.']
  },
  {
    id: 'stopping-distance', routeId: 'fitted-models',
    title: 'When does a linear stopping-distance model stop being useful?',
    aim: 'Over a stated speed range, how well do linear and structurally motivated quadratic models describe stopping distance, and how do their prediction errors affect a distance estimate?',
    courseScope: 'AI SL or AA SL: functions, regression, residuals and domain restrictions; explain any additional fitting method at first use.',
    evidencePlan: 'Use explicitly constructed speed–distance observations or a verified original published dataset selected during authoring. Keep units consistent and distinguish reaction distance from braking distance when defining the model.',
    stages: [
      'Define speed and stopping-distance quantities and fit a simple baseline within the observed range.',
      'Inspect the baseline residuals to identify the mathematical feature it misses.',
      'Derive or motivate a quadratic term and compare fit, residual structure and parameter interpretation.',
      'Check selected predictions and sensitivity to a model assumption; state where extrapolation is unsupported.'
    ],
    figures: ['Observed data with baseline model', 'Comparable model residuals', 'Linear/quadratic overlay and a compact prediction comparison'],
    keyChecks: ['Speed units are converted before physical interpretation.', 'Total stopping distance is not confused with braking distance.', 'A better fit statistic alone does not prove a model.', 'Models are compared on the same evidence and domain.', 'The fictional investigation is not road-safety guidance.']
  },
  {
    id: 'drink-cooling', routeId: 'growth',
    title: 'How long until my drink reaches a chosen temperature?',
    aim: 'How well can an exponential model of excess temperature estimate when a drink reaches a chosen temperature in a specified room?',
    courseScope: 'AI SL or AA SL: exponential decay, logarithms and parameter interpretation. A differential-equation derivation is optional and requires an explicit course check.',
    evidencePlan: 'Construct a temperature time series and a separately stated ambient temperature with meaningful thermometer resolution. Model the difference from room temperature, not a decay towards 0 °C.',
    stages: [
      'Plot temperature and inspect successive changes in excess temperature above the ambient level.',
      'Fit and interpret an exponential excess-temperature model over a defensible interval.',
      'Check residuals and calculate the modelled time to the chosen temperature.',
      'Vary the ambient temperature or plausible parameter uncertainty to evaluate how stable that time estimate is.'
    ],
    figures: ['Temperature and ambient-level time plot', 'Excess-temperature model with residuals', 'Compact threshold-time sensitivity table'],
    keyChecks: ['All logarithm arguments are positive.', 'The ambient offset is retained throughout the calculation.', 'Time and temperature units remain consistent.', 'The threshold is within a defensible prediction range.', 'The conclusion distinguishes model uncertainty from thermometer resolution.']
  },
  {
    id: 'tide-cycles', routeId: 'cycles',
    title: 'How useful is a single sinusoid for a tidal-height record?',
    aim: 'How accurately can a single sinusoidal model describe several consecutive tidal cycles and estimate a specified height-crossing window?',
    courseScope: 'AI SL or AA SL: sinusoidal functions, parameter interpretation, solving equations and residual analysis. Any richer tidal model is an optional extension, not a required technique.',
    evidencePlan: 'Construct a clearly labelled multicycle tidal-height record with a fixed time origin and height datum, or verify an original public source during authoring. Reserve a complete later cycle for a stated prediction check.',
    stages: [
      'Inspect several cycles to estimate period, midline, amplitude and phase.',
      'Build a single-sinusoid model and explain each parameter in the chosen units.',
      'Evaluate residuals and the reserved cycle to identify unequal heights or shifting timing.',
      'Solve for a specified height crossing and qualify the resulting time window using the observed model error.'
    ],
    figures: ['Several tidal cycles with explicit time origin', 'Sinusoidal overlay and residual display', 'Height-threshold intersections on a selected interval'],
    keyChecks: ['The time datum and angular units are stated.', 'Period is estimated from more than an incomplete cycle.', 'The correct crossing branch and interval are selected.', 'Fit cycles and validation cycles stay distinct.', 'The sample is not a navigation or safety prediction.']
  },
  {
    id: 'ball-clearance', routeId: 'trajectories',
    title: 'Does a modelled ball path clear a barrier?',
    aim: 'What clearance does a calibrated quadratic model predict above a specified barrier, and is that conclusion stable under reasonable coordinate uncertainty?',
    courseScope: 'AI SL or AA SL: quadratic functions, coordinate geometry, turning points and sensitivity. Time-based velocity is excluded unless actual time information is available.',
    evidencePlan: 'Use a constructed calibrated frame or explicit coordinate set for a ball path and a defined barrier. Record scale, origin and the assumption that the motion is viewed in a common vertical plane.',
    stages: [
      'Calibrate coordinates and inspect the observed path before choosing a quadratic.',
      'Fit the curve and calculate meaningful trajectory features within the recorded domain.',
      'Evaluate the height at the barrier and calculate the predicted clearance.',
      'Perturb the scale or selected coordinates within a stated uncertainty and test whether the clearance decision changes.'
    ],
    figures: ['Calibrated trajectory with barrier dimensions', 'Observed coordinates and quadratic overlay', 'Clearance and sensitivity comparison'],
    keyChecks: ['Pixels are converted to physical units with a documented scale.', 'Perspective assumptions are explicit.', 'The barrier lies in the modelled domain.', 'No speed or acceleration is inferred from an untimed still image.', 'The sign and size of clearance are interpreted against uncertainty.']
  },
  {
    id: 'tray-optimisation', routeId: 'optimisation',
    title: 'Choosing the corner cut for an open tray',
    aim: 'Which nominal corner cut gives the greatest guaranteed tray volume from a 30 cm by 20 cm card while meeting a 4.0 cm height limit, a common ±1 mm setting error and a 1 mm marking grid?',
    courseScope: 'AA SL or AI SL: a constrained volume function, differentiation, feasible candidates and a sensitivity comparison. The optimum belongs to the stated idealised construction.',
    evidencePlan: 'Use a defined 30 cm × 20 cm rectangular card, equal corner cuts, a 4.0 cm height limit and an explicit zero-thickness fold model. Treat common ±1 mm setting error and a 1 mm nominal marking grid as separate stated assumptions; no physical measurement is claimed.',
    stages: [
      'Draw and label the net, derive the volume function and establish the feasible cut domain.',
      'Differentiate, solve for candidates, and compare the feasible stationary point with the boundaries.',
      'Compare the ideal cut of approximately 3.9237 cm with 4.0 cm, then use the height limit and error interval to examine feasible nominal cuts.',
      'Prove that a 3.9 cm nominal cut maximises the smallest volume over every permitted common error.',
      'Vary the error bound and distinguish the continuous and 1 mm-grid thresholds for retaining at least 99% of ideal capacity.'
    ],
    figures: ['Labelled rectangular net and folded-tray dimensions', 'Volume function on its feasible domain', 'Compact practical-cut/tolerance comparison'],
    keyChecks: ['The volume is x(30−2x)(20−2x) with 0<x<10 cm.', 'The non-feasible stationary point is rejected.', 'The global maximum claim is justified with domain and boundary reasoning.', 'Exact and rounded values use appropriate notation.', 'Tolerance analysis states what varies and does not pretend a physical tray was measured.']
  },
  {
    id: 'leaf-area', routeId: 'images',
    title: 'Estimating a leaf area from a calibrated outline',
    aim: 'How closely do a piecewise curve model and a geometric approximation agree on the area of one calibrated leaf outline, and how sensitive is that area to calibration and boundary choices?',
    courseScope: 'AA SL or AI SL: coordinate models and area by integration or suitable numerical approximation. Explain any numerical method that is outside the chosen course.',
    evidencePlan: 'Provide a locally saved constructed or permitted reference image with a visible scale in the same plane as the leaf. Preserve the calibration, selected boundary points and segment domains.',
    stages: [
      'Calibrate the image, define the origin and select informative upper/lower boundary coordinates.',
      'Fit suitable piecewise boundaries and inspect where the model departs from the outline.',
      'Calculate the enclosed area and compare it with an independent geometric or numerical approximation.',
      'Vary calibration or defensible boundary choices to quantify their effect on the reported area.'
    ],
    figures: ['Calibrated outline with chosen points', 'Piecewise boundary curves with shaded area', 'Compact independent-area and sensitivity comparison'],
    keyChecks: ['Image dimensions are not treated as physical units without calibration.', 'Upper-minus-lower boundaries and integration domains are correct.', 'Area units are squared.', 'A scale-factor error changes area quadratically.', 'Smoother curves are not automatically more accurate; the original reference stays available.']
  },
  {
    id: 'inaccessible-height', routeId: 'triangulation',
    title: 'Estimating a height I cannot measure directly',
    aim: 'How well can two accessible angle-of-elevation positions determine an inaccessible height, and which measurements most affect the estimate?',
    courseScope: 'AI SL or AA SL: trigonometry, equations, geometric assumptions and sensitivity. Any calculus-based error propagation is optional.',
    evidencePlan: 'Construct a reproducible baseline, two angles, instrument height and associated resolutions. Define level-ground and common-vertical-plane assumptions with one consistent diagram.',
    stages: [
      'Draw the two-position geometry and derive equations for the unknown horizontal distance and height.',
      'Solve using the stated baseline and angles, including the instrument-height correction.',
      'Check the result with an independent position or a mathematically equivalent calculation.',
      'Vary the measured angles and baseline within stated bounds to decide a defensible reporting precision.'
    ],
    figures: ['Labelled baseline and two elevation triangles', 'Trigonometric calculation diagram', 'Height sensitivity to angle and baseline changes'],
    keyChecks: ['The nearer and farther angles match the geometry.', 'Instrument height is added once.', 'Angle units and trigonometric functions are consistent.', 'Bounded sensitivity is not incorrectly described as a statistical confidence interval.', 'Reported digits reflect measurement sensitivity.']
  },
  {
    id: 'water-stations', routeId: 'voronoi',
    title: 'Where would an extra water station improve access?',
    aim: 'How would adding one water station change nearest-station distances across a simplified site, and which candidate location best improves the chosen access measure?',
    courseScope: 'AI SL: coordinate geometry, perpendicular bisectors and Voronoi regions. AA SL use requires an explicit scope check rather than an automatic syllabus claim.',
    evidencePlan: 'Use a constructed bounded site map with explicit coordinates and a small set of candidate sites and demand/check points. Define whether the objective concerns maximum, average or weighted distance before comparing candidates.',
    stages: [
      'Plot existing stations and construct nearest-station regions using Euclidean distance.',
      'Calculate baseline distances at the defined check points and identify the inadequately served area.',
      'Add each feasible candidate and compare the same access measure on the same check points.',
      'Test a path restriction or plausible demand weighting to examine whether the recommended location changes.'
    ],
    figures: ['Bounded site map with labelled stations and Voronoi boundaries', 'Before/after nearest-distance comparison', 'Compact candidate and sensitivity summary'],
    keyChecks: ['Voronoi cells are clipped to the stated site boundary.', 'The objective is fixed before choosing the best candidate.', 'Check points do not silently change between scenarios.', 'Straight-line distance is distinguished from walking distance.', 'Capacity and real-world permissions are not inferred from geometry.']
  },
  {
    id: 'repayment-plans', routeId: 'finance',
    title: 'Which repayment plan costs less under stated terms?',
    aim: 'For a fixed borrowed amount, how do two defined repayment plans compare in total cost and repayment time, and which assumptions could reverse the preference?',
    courseScope: 'AI SL or AA SL: compound changes, recurrence relations, geometric sums or financial technology with explained inputs. Use constructed offers, not claims about current lenders.',
    evidencePlan: 'Define two fictional offers with principal, compounding period, payment timing, rate, fees and treatment of the final payment. State a consistent currency and time basis.',
    stages: [
      'Derive the balance recurrence and verify the first few payments against the stated timing.',
      'Calculate repayment time, final payment and total paid for both plans.',
      'Compare total costs and explain the tradeoff between payment size and duration.',
      'Vary a rate or fee over a stated range and locate where the preferred option changes.'
    ],
    figures: ['Balance-versus-time comparison', 'Concise total-cost and final-payment table', 'Rate or fee sensitivity graph'],
    keyChecks: ['Annual and per-period rates are not confused.', 'Payments occur at the stated beginning or end of each period.', 'The last payment is capped correctly instead of overpaying a negative balance.', 'Fees and rounding conventions are included consistently.', 'The conclusion is a fictional model comparison, not financial advice.']
  },
  {
    id: 'stop-on-gold', routeId: 'chance',
    title: 'Is a stop-on-gold drawing game fair?',
    aim: 'What is the expected net outcome of a game that stops on a gold draw or after a fixed maximum number of draws, and how do replacement rules affect a fair entry price?',
    courseScope: 'AI SL or AA SL: conditional probability, unequal-depth trees, a discrete distribution and expected value; simulation provides a check rather than a substitute for exact reasoning.',
    evidencePlan: 'Specify a fictional bag composition, maximum draw count, replacement rule, stopping rule, rewards and entry fee. Use a saved probability-tree model and reproducible simulated trials.',
    stages: [
      'Construct an unequal-depth probability tree that stops each path when the rules require it.',
      'Calculate the terminal outcome distribution and expected payout, then subtract the entry fee.',
      'Check the exact expectation with a reproducible simulation summary and explain sampling variation.',
      'Change the replacement rule or bag composition and determine how the fair fee changes.'
    ],
    figures: ['Labelled stopping-condition probability tree', 'Terminal-outcome probability and payout table', 'Simulation estimate against trial count'],
    keyChecks: ['Branches after a stopping event do not exist.', 'Conditional probabilities update correctly without replacement.', 'Terminal probabilities sum to one.', 'Net gain and payout are not confused.', 'Simulation seed/trial count and uncertainty are recorded; simulated frequency is not exact probability.']
  },
  {
    id: 'consecutive-sums', routeId: 'proof',
    title: 'Which positive integers are consecutive sums?',
    aim: 'Which positive integers can be written as a sum of at least two consecutive positive integers, and how can I justify a complete characterisation?',
    courseScope: 'AA SL-oriented algebraic reasoning, arithmetic series, parity and proof; course suitability depends on the depth of the chosen argument, not on the count of examples.',
    evidencePlan: 'Generate a small exact search table from positive starting terms and at least two terms, retaining failures as well as successes. Use the table to form a conjecture, then replace finite checking with a general argument.',
    stages: [
      'Explore selected integers to identify a pattern and look deliberately for counterexamples.',
      'Express a run of k consecutive positive integers starting at a as k(2a+k−1)/2 and analyse parity and divisibility.',
      'Prove why powers of two cannot have the required representation and construct a representation for every other positive integer.',
      'Check the positive-start restriction and interpret the characterisation using examples at its boundary.'
    ],
    figures: ['Short exact cases-and-counterexamples table', 'Arithmetic-run or factor-pair diagram if it clarifies the proof', 'Compact worked representations tied to the general argument'],
    keyChecks: ['At least two terms and a positive starting integer are enforced.', 'Finite examples are not presented as a proof.', 'Both necessity and sufficiency are established.', 'An odd-factor construction is checked when its naive starting value would be non-positive.', 'The integer 1 and powers of two are handled explicitly.']
  },
  {
    id: 'square-root-iteration', routeId: 'iteration',
    title: 'Why does a square-root iteration converge?',
    aim: 'How does the iteration x_(n+1)=(x_n+A/x_n)/2 approximate √A from positive starting values, and what explains its convergence and observed speed?',
    courseScope: 'AA SL-oriented sequences, algebraic inequalities and limits; a local error argument or Newton interpretation may require additional explained mathematics and a course check.',
    evidencePlan: 'Use an explicit positive A and several positive starting values, computing unrounded iterates for validation. Store a short selected table and the recurrence rather than hundreds of spreadsheet rows.',
    stages: [
      'Generate selected iterates from contrasting positive starts and describe the observed behaviour without claiming numerical proof.',
      'Solve the fixed-point equation and establish positivity, bounds and monotonic behaviour after the first step.',
      'Use the bound and monotonicity argument to justify convergence to the positive square root.',
      'Derive an error relationship and compare it with computed errors to explain speed and the limits of rounded output.'
    ],
    figures: ['Short selected-iterate and error table', 'Iteration function with y=x and optional cobweb steps', 'Error comparison on a readable scale'],
    keyChecks: ['A>0 and x_0>0 are stated.', 'Convergence is proved rather than inferred from repeated displayed digits.', 'A fixed point alone is not treated as proof of attraction.', 'Rounding is postponed in validation computations.', 'Any claimed convergence rate follows from a derived error relationship.']
  }
].map(brief => Object.freeze({
  ...brief,
  stages: Object.freeze([...brief.stages]),
  figures: Object.freeze([...brief.figures]),
  keyChecks: Object.freeze([...brief.keyChecks])
})));

export const sampleBriefById = id => SAMPLE_BRIEFS.find(brief => brief.id === id) || null;
