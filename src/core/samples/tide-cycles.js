import {buildModellingPass3} from './modelling-pass3-helpers.js';
const STUDY={
  "id": "tide-cycles",
  "routeId": "cycles",
  "title": "What can one sinusoid establish about a tide-like threshold window?",
  "course": "AI SL",
  "mathSelected": [
    "AI08",
    "AI09"
  ],
  "technologyStage": 1,
  "description": "A complete constructed cyclic-height investigation: derive a fixed 12-hour sinusoid, check a reserved cycle, and distinguish its threshold prediction from a continuously justified error bound.",
  "provenance": "Tide-like Height Cases v1: 49 constructed hourly heights in metres for t=0,…,48 h, referenced to an arbitrary fictional datum. Exact construction: H(t)=2.5+cos[π(t−2)/6]+0.18 cos(2πt/24), rounded to 0.001 m at integer hours. Fit only t=0,…,35 (three 12-hour cycles); reserve the complete t=36,…,48 cycle for a check. Values are synthetic, not a tidal station record, sea-level forecast, chart datum or navigational guidance.",
  "citation": "Tide-like Height Cases v1. Original explicitly constructed mathematical series in this project; no port or public tide table was consulted.",
  "readingNote": "This is a mathematical simulation, not an actual tide prediction. The height datum and hours are fictional; the threshold calculation cannot guide water access or navigation.",
  "idea": "I want to quantify what is lost when a deliberately simple sinusoid replaces a known curve with two repeating components, especially when that replacement is used to decide when a height crosses a level.",
  "aim": "How well does one \\(12\\)-hour sinusoid describe the first three twelve-hour blocks of my constructed height record, and what interval does it predict at or above \\(3.2\\text{ m}\\) around the fourth crest? I will check the reserved fourth block and determine which part of that interval a continuous mismatch bound can certify.",
  "motivation": "The timing of repeated rises and falls looked more stable than their heights. I wanted to understand whether that regular timing was enough to support a threshold interval.",
  "beneficiary": "I would use the result to understand the difference between solving an approximate model and establishing a property of the constructed function it represents.",
  "intendedUse": "Compare the fitted and reserved height errors, then distinguish a nominal above-threshold interval around the fourth crest from a sufficient interval justified by the known source recipe.",
  "prediction": "I expect a 12-hour sinusoid to capture the repeated timing but overstate the lower fourth crest, because the disclosed 24-hour component makes alternate peaks unequal.",
  "predictionWhy": "A single sinusoid repeats the same crest height every twelve hours; the slower component in the constructed function does not.",
  "predictionImplication": "Correct-looking timing may still give an interval that includes heights below the stipulated 3.2 m threshold.",
  "firstAction": "Use the first three twelve-hour blocks of the plotted record to check the candidate peak spacing, while keeping hours 36–48 out of coefficient fitting.",
  "readinessImprovement": "I have specified the artificial time origin and datum, the 36 fitting inputs, the 13 reserved inputs and the hypothetical 3.2 m threshold before calculating the model.",
  "teacherQuestion": "Does the printed derivation explain the fixed-frequency fit, phase conversion and continuous bound well enough to justify the stated fourth-crest interval?",
  "methodRecord": "I retained all 49 rounded hourly values. I fitted three coefficients using only hours 0–35, checked the fixed model at hours 36–48, and used the disclosed continuous function separately to bound its mismatch at every instant.",
  "sourcePopulation": "One explicitly defined continuous function and its 49 rounded hourly values; there is no sampled coastal population.",
  "sampleSize": "49 hourly inputs: 36 fitting values at t=0,…,35 and 13 reserved values at t=36,…,48, including both ends of the reserved twelve-hour interval.",
  "pairing": "Each rounded height stays attached to its integer hour. Reserved values do not enter any coefficient sum; their generating formula is nevertheless known from the start.",
  "modelEvidence": "The first three twelve-hour blocks have sampled peaks at hours 2, 14 and 26, giving two twelve-hour separations and unequal heights. A fourth block is reserved for checking the same fitted curve.",
  "inputs": "Elapsed time \\(t\\) in hours from a fictional origin; continuous height \\(H(t)\\) in metres above an arbitrary datum; rounded hourly input \\(h_i\\) at integer hour \\(i\\). The tested period \\(P=12\\text{ h}\\) is disclosed in the recipe and checked against the fitting peaks.",
  "assumptions": "The model deliberately uses one fixed 12-hour sinusoid although the constructed function also contains a slower 24-hour cosine. Time is exact by construction, and all 36 fitting height discrepancies receive equal weight.",
  "domain": "Fitting uses integer hours \\(0,\\ldots,35\\) in \\(0\\le t<36\\). Checking uses \\(36\\le t\\le48\\). The threshold calculation selects the connected interval around the fourth crest near \\(t=38\\); 3.2 m is a stipulated fictional level.",
  "validation": "I define and compare root mean squared height errors on the fitting and reserved inputs, inspect their signs, and check an explicit threshold disagreement. Separately, I prove a continuous discrepancy bound from the known formula.",
  "alternative": "Including the disclosed 24-hour term would target a different, more complex model. My question is how much the chosen single sinusoid retains and loses, so I do not add that term after inspecting its errors.",
  "chosenMethod": "Fix the disclosed 12-hour candidate period, use a sum of squared height discrepancies to determine c, a and b in M(t)=c+a cos(πt/6)+b sin(πt/6), check the reserved inputs, and solve threshold inequalities using a derived continuous bound.",
  "methodReason": "I retain one fixed-period sinusoid so that I can measure the consequence of the stated simplification. I choose its three coefficients by making the total squared vertical discrepancies on the 36 fitting inputs as small as possible; I will show how that rule determines each coefficient.",
  "methodLimit": "The known 24-hour component produces systematic departures from a fixed-amplitude 12-hour curve. Neither a close overlay nor small average height errors can establish an exact crossing time.",
  "consequence": "An error of a few tenths of a metre can change whether a time belongs to the above-threshold interval, even when the repeated timing is approximately right.",
  "mitigation": "I keep the coefficient check separate from a proof using the continuous source expression. The proof covers times between hourly inputs, which their sampled errors alone cannot do.",
  "acceptable": "The conclusion concerns the specified constructed function and fourth-crest interval. It is not an estimate of sea level or an access recommendation.",
  "changedSincePlanning": "The reserved model exceeds 3.2 m at hour 37 while the supplied height is below it. This concrete disagreement makes a continuous height-error bound necessary before I can certify any threshold interval.",
  "dataStatusSummary": "All 49 original rounded hourly inputs are retained. Only the first 36 determine the model, and the last 13 check it without refitting.",
  "dataAimLink": "This design separates two questions: how closely one sinusoid follows the supplied hourly heights, and what those comparisons can establish about a continuous threshold interval. The first needs a fixed fit and separate checking values; the second needs an argument between the sampled hours.",
  "firstEvaluation": "The plotted sequence can show repeated timing and unequal crests. It cannot by itself choose the best coefficients or justify what happens between the hourly points, so those are the calculations that follow.",
  "definitions": "\\(t\\) is elapsed time in hours; \\(H(t)\\) is the exact constructed height in metres; \\(h_i\\) is its rounded input at integer hour \\(i\\); \\(M(t)\\) is the fitted model; \\(r_i=h_i-M(i)\\) is a signed sampled discrepancy. All trigonometric inputs are in radians.",
  "firstPresentation": "Figure 1 preserves the whole sequence. Its hours 0–35 supply the fitting calculation; hours 36–48 remain checking inputs even though they are visible in the complete record.",
  "accuracyQuantity": "Constructed elapsed time and height",
  "accuracySymbol": "t, H",
  "accuracyUnit": "h; m",
  "accuracyResolution": "Heights are rounded to 0.001 m at integer hours. These are constructed numerical inputs, not claims about sensor or forecast precision.",
  "accuracyPolicy": "Use full numerical precision from the rounded input values; display model coefficients and crossing times with approximate signs. Calculate durations before rounding their endpoints.",
  "accuracyReason": "The hourly rounding is at most 0.0005 m. The much larger 0.24 m continuous model-error bound is derived from the disclosed function, with coefficient changes caused by fitting the rounded inputs already included.",
  "specialistTerms": "A phase shift locates a sinusoid's crest relative to the chosen time origin. A sufficient threshold condition guarantees the stated inequality; a necessary condition only identifies where the inequality has not been ruled out.",
  "predictionComparison": "The fixed curve reproduces the repeated rise and fall but overstates the lower reserved crest. Its larger reserved error and the hour-37 threshold disagreement support the initial concern.",
  "benefitFinding": "The final comparison distinguishes the 3.23-hour nominal window from the approximately 1.79-hour interval that the continuous error bound certifies.",
  "surpriseReason": "A curve can reproduce the twelve-hour repetition and still place an hourly input on the wrong side of a threshold.",
  "surpriseCheck": "At t=37 the model is about 3.405 m while the supplied value is 3.192 m. I then derive an all-time bound of about 0.23604 m for H−M and conservatively use 0.24 m.",
  "courseConcern": "I explain the fixed-frequency least-squares derivation, trigonometric coefficient-to-phase conversion, RMSE and reserved checking, and the continuous bound as additional methods beyond basic AI SL sinusoidal modelling. Their reasoning appears in the ordinary printed narrative.",
  "technologyTool": "Spreadsheet sums, graph plotter and radian-mode trigonometric calculator",
  "technologyInput": "For \\(i=0,\\ldots,35\\), calculate \\(C_i=\\cos(\\pi i/6)\\), \\(S_i=\\sin(\\pi i/6)\\), and the three sums \\(\\sum h_i\\), \\(\\sum h_iC_i\\), \\(\\sum h_iS_i\\). No reserved height enters these sums.",
  "technologyOutcome": "\\(M(t)\\approx2.505+0.509992667\\cos(\\pi t/6)+0.916072952\\sin(\\pi t/6)\\), with amplitude about \\(1.048466582\\text{ m}\\) and fourth crest at \\(38.02982014\\text{ h}\\).",
  "technologyInterpretation": "The sums are justified by a completed-square argument. Technology evaluates them and the inverse cosine; the bound and its sufficient/necessary interpretations are shown separately.",
  "courseWhy": "The investigation connects periodic modelling to a specific threshold decision and explains the additional fitting and error-bound mathematics needed to justify that decision.",
  "mathsLearning": "I learned why a mathematically exact solution of an approximate curve is a different claim from a guaranteed inequality for the function it approximates.",
  "introduction": "A repeating rise and fall can look convincingly sinusoidal even when successive peaks have different heights. I wanted to know what that difference would mean if I used a simple curve to decide when a height crossed a chosen level. I therefore constructed a tide-like series whose formula is known, so that I can examine the consequences of simplifying it.\n\nMy question is: how well does one \\(12\\)-hour sinusoid describe the first three twelve-hour blocks, and what interval does it predict at or above \\(3.2\\text{ m}\\) around the fourth crest? I will check the same fitted model on the reserved fourth block, then determine which part of its interval can be certified using a continuous mismatch bound.\n\nThe \\(3.2\\text{ m}\\) level is a stipulated scenario: it lies above the constructed midline and below the designed peaks, so it creates a rising and a falling crossing. It represents no real access requirement. I expect the repeating timing to be captured more closely than the lower fourth crest. The purpose is to quantify the information lost by a single sinusoid, not to rediscover a hidden generating rule or predict an actual tide.",
  "dataNotes": "Tide-like Height Cases v1 [D1] begin with the continuous function\n\\[\nH(t)=2.5+\\cos\\left(\\frac{\\pi(t-2)}6\\right)\n       +0.18\\cos\\left(\\frac{\\pi t}{12}\\right).\n\\]\nHere \\(t\\) is elapsed time in hours from an arbitrary origin, and \\(H(t)\\) is height in metres above a fictional datum. The first cosine repeats every \\(12\\) hours and the second every \\(24\\) hours. I know both components from the start; the question is what happens when the fitted model retains only the faster repetition.\n\nThe supplied input \\(h_i\\) is \\(H(i)\\) rounded to the nearest \\(0.001\\text{ m}\\), for integer hours \\(i=0,\\ldots,48\\). Thus \\(|h_i-H(i)|\\le0.0005\\text{ m}\\). This distinction matters: the rounded hourly inputs do not define heights between those hours, whereas the disclosed function does.\n\nI use hours \\(0,\\ldots,35\\) for fitting: three blocks containing all twelve hourly phase positions. I reserve hours \\(36,\\ldots,48\\), including both ends of the following twelve-hour interval, for checking without refitting. Reserving these thirteen values means excluding them from the coefficient calculation; their known origin and visibility in Figure 1 prevent me from treating them as independent evidence of a real forecasting process.\n\nI keep the disclosed \\(12\\)-hour period fixed and check its compatibility with the fitting peaks. Let \\(M(t)\\) denote the resulting single-sinusoid model. Later, I will use \\(H(t)\\) itself to establish a continuous bound for \\(H(t)-M(t)\\). That proof has a different role from the reserved hourly comparison.",
  "stages": [
    {
      "key": "cycle-inspection",
      "title": "Checking the chosen time scale against the fitting cycles",
      "methodId": "follow-journey",
      "kind": "model",
      "technique": "Repeated peak locations and domain specification",
      "bridge": "Before calculating a threshold interval, I need to check whether the single twelve-hour cycle I have chosen represents the main timing in the fitting record.",
      "purpose": "Figure 1 shows the complete sequence. I use only the first three blocks for this initial check; the fourth block remains outside the fit.",
      "result": "The sampled high points in the first three blocks occur at \\(t=2,14,26\\text{ h}\\). These three peaks provide two separations, \\(14-2=12\\) and \\(26-14=12\\) hours. They support the chosen \\(P=12\\text{ h}\\) candidate; they do not independently estimate an unknown period.\n\nOne complete cycle corresponds to \\(2\\pi\\) radians, so the angle advances at\n\\[\n\\omega=\\frac{2\\pi}{P}=\\frac{\\pi}{6}\\ \\mathrm{rad\\,h}^{-1}.\n\\]\nThe three peak heights are \\(3.656,3.344,3.656\\text{ m}\\), while the sampled lows at \\(t=8,20,32\\text{ h}\\) are \\(1.410,1.590,1.410\\text{ m}\\). Equal peak spacing therefore coexists with unequal heights. A twelve-hour sinusoid may retain the timing, but its fixed crest and trough heights will force a compromise.",
      "observationText": "Three fitting peaks give two twelve-hour separations; their heights alternate.",
      "interpretation": "This gives me a reason to keep the simple periodic family while measuring the error it creates. Including the slower component would remove the simplification that my question is meant to examine.",
      "limitations": "The integer-hour peaks locate sampled maxima, not the exact maxima of the continuous function. The formula supplies the candidate period; this plot only checks that it is visible in the fitting inputs.",
      "localTakeaway": "The chosen twelve-hour timing is compatible with the first three blocks, but a fixed-amplitude curve cannot reproduce their unequal peaks.",
      "nextQuestion": "I now need the midline, amplitude and phase of the single sinusoid that best follows those 36 fitting inputs.",
      "nextWhy": "Peak spacing alone does not determine a crossing time: the curve's height and position within each cycle also matter.",
      "mathsInsight": "A repeated time scale does not imply repeated peak heights.",
      "methodChangeReason": "I retain the stated period and quantify the compromise in the remaining three coefficients.",
      "outcomeId": "repeating",
      "knowledge": "syllabus"
    },
    {
      "key": "harmonic-model",
      "title": "Deriving the fixed-period fit and its phase",
      "methodId": "sinusoidal",
      "kind": "model",
      "technique": "Fixed-frequency harmonic regression",
      "bridge": "With the period fixed, I can determine the curve's height and phase from all 36 fitting inputs instead of selecting one high and one low by eye.",
      "purpose": "Figure 2 compares the resulting fit with those inputs. I explain its coefficient calculation before using the fitted curve to infer any time interval.",
      "result": "Write\n\\[\nM(t)=c+a\\cos(\\omega t)+b\\sin(\\omega t),\\qquad \\omega=\\frac{\\pi}{6}.\n\\]\nThe constants \\(c,a,b\\) have units of metres. Although \\(M\\) is not a straight line in time, it is linear in these three coefficients: each multiplies a known function. The least-squares criterion [M1] chooses them to minimise the sum of squared vertical discrepancies.\n\nFor each fitting hour \\(i=0,\\ldots,35\\), define \\(C_i=\\cos(\\omega i)\\) and \\(S_i=\\sin(\\omega i)\\). Writing SSE for the sum of squared errors, the quantity to minimise is\n\\[\n\\mathrm{SSE}(c,a,b)=\\sum_{i=0}^{35}(h_i-c-aC_i-bS_i)^2.\n\\]\nSquaring prevents positive and negative discrepancies from cancelling and gives larger discrepancies greater weight. I give each supplied height equal weight.\n\nThe complete, evenly spaced cycles simplify this calculation. Opposite angles cancel in the sums of sine and cosine. A quarter-turn exchanges their squares and reverses their product, so over each full cycle the two square sums are equal and the product sum is zero. Since \\(C_i^2+S_i^2=1\\), the 36 inputs give\n\\[\n\\sum C_i=\\sum S_i=\\sum C_iS_i=0,\\qquad\n\\sum C_i^2=\\sum S_i^2=18.\n\\]\nEvery sum here and below is over the 36 fitting hours. Expanding the squared discrepancies therefore gives\n\\[\n\\begin{aligned}\n\\mathrm{SSE}={}&\\sum h_i^2+36c^2+18a^2+18b^2\\\\\n&-2c\\sum h_i-2a\\sum h_iC_i-2b\\sum h_iS_i.\n\\end{aligned}\n\\]\nThere are no terms involving products of two unknown coefficients. To minimise each remaining quadratic, I use\n\\[\nkx^2-2qx=k\\left(x-\\frac qk\\right)^2-\\frac{q^2}{k}.\n\\]\nFor positive \\(k\\), the square is smallest at \\(x=q/k\\). Applying this separately with \\(k=36,18,18\\) proves that the minimum occurs at\n\\[\nc=\\frac{\\sum h_i}{36},\\qquad\na=\\frac{\\sum h_iC_i}{18},\\qquad\nb=\\frac{\\sum h_iS_i}{18}.\n\\]\nThe numerical sums are \\(90.18\\), approximately \\(9.179867998\\), and approximately \\(16.489313133\\). Thus the fitted values are\n\\[\nc=2.505,\\qquad a\\approx0.509992667,\\qquad b\\approx0.916072952.\n\\]\nThis derives the coefficients rather than treating them as unexplained calculator output.\n\nTo combine the two terms, put \\(\\theta=\\omega t\\), and let \\(A>0\\) be an amplitude and \\(\\phi\\) a phase angle. The cosine difference identity [M3] gives\n\\[\nA\\cos(\\theta-\\phi)=A\\cos\\phi\\cos\\theta+A\\sin\\phi\\sin\\theta.\n\\]\nMatching coefficients requires \\(A\\cos\\phi=a\\) and \\(A\\sin\\phi=b\\). Squaring and adding gives \\(A=\\sqrt{a^2+b^2}\\); since both coefficients are positive, \\(\\phi\\) is in the first quadrant and \\(\\phi=\\arctan(b/a)\\). Here \\(\\arctan\\) returns the angle whose tangent is \\(b/a\\), in radians. I obtain\n\\[\nA\\approx1.048466582\\text{ m},\\qquad\n\\phi\\approx1.062811340,\\qquad\n\\tau=\\frac{\\phi}{\\omega}\\approx2.029820141\\text{ h}.\n\\]\nThe same fitted curve is consequently\n\\[\nM(t)\\approx2.505+1.048466582\n\\cos\\left(\\frac{\\pi}{6}(t-2.029820141)\\right).\n\\]\nIts midline is \\(c\\), amplitude is \\(A\\), and crests occur at \\(t=\\tau+12k\\), where \\(k\\) is an integer.\n\nI summarise the remaining height discrepancies using the root mean squared error, or RMSE [M2]. Define the signed residual \\(r_i=h_i-M(i)\\); a positive value means the supplied height exceeds the model. RMSE squares these values, averages them, then takes the square root to return to metres. For example,\n\\[\nr_2\\approx3.656-3.553338781=+0.102661219\\text{ m}.\n\\]\nUsing the unrounded fitted coefficients gives\n\\[\n\\sum_{i=0}^{35}r_i^2\\approx0.535692886\\text{ m}^2,\\qquad\n\\mathrm{RMSE}_{\\mathrm{fit}}\n=\\sqrt{\\frac{\\sum_{i=0}^{35}r_i^2}{36}}\n\\approx0.121985\\text{ m}.\n\\]\nThe denominator is 36 because I am describing the mean squared discrepancy across those 36 cases, not estimating an unknown random-error variance.",
      "observationText": "The best fixed-period fit has midline 2.505 m, amplitude about 1.04847 m and fitting RMSE about 0.1220 m.",
      "interpretation": "Every fitted crest has height about 3.55347 m and occurs roughly 2.030 hours into its twelve-hour block. This is the required averaging compromise between the unequal supplied peaks.",
      "limitations": "These coefficients minimise the chosen fitting criterion, but that fact concerns only the first 36 heights. The RMSE is an average vertical discrepancy; it is not a maximum error or a bound on a crossing time.",
      "localTakeaway": "The fixed-period coefficients follow from three separate completed squares, and the phase conversion supplies the crest location needed for the threshold calculation.",
      "nextQuestion": "The unresolved question is how this unchanged curve describes the reserved fourth cycle, particularly near the 3.2 m level.",
      "nextWhy": "Those heights played no part in minimising the fitting error. Comparing them with the fixed model checks the approximation where my eventual interval is to be used.",
      "mathsInsight": "Full, evenly spaced cycles make the coefficient products cancel, allowing a fixed-frequency least-squares fit to be derived by elementary algebra.",
      "methodChangeReason": "I keep the derived coefficients fixed when moving from fitting inputs to the reserved comparison.",
      "outcomeId": "model-fit",
      "knowledge": "mixed",
      "unfamiliarComponent": "Fixed-frequency least squares using trigonometric sum cancellation; conversion of sine and cosine coefficients to amplitude and phase; residual RMSE.",
      "knowledgeNotes": "The printed result defines the squared-error criterion, explains why the mixed sums vanish, completes three separate squares, derives the phase conversion and defines RMSE in metres.",
      "understandingExample": "The coefficient \\(a=\\sum h_iC_i/18\\approx9.179867998/18\\approx0.509992667\\). At hour 2, \\(r_2\\approx3.656-3.553338781=0.102661219\\text{ m}\\); the fitting RMSE is \\(\\sqrt{0.535692886/36}\\approx0.121985\\text{ m}\\).",
      "researchSource": "NIST/SEMATECH, e-Handbook of Statistical Methods, §4.1.4.1, Linear Least Squares Regression [M1], https://www.itl.nist.gov/div898/handbook/pmd/section1/pmd141.htm; Hyndman and Athanasopoulos, Forecasting: Principles and Practice, §5.8 [M2], https://otexts.com/fpp3/toolbox.html#evaluating-point-forecast-accuracy; OpenStax, Algebra and Trigonometry 2e, §9.2 [M3], https://openstax.org/books/algebra-and-trigonometry-2e/pages/9-2-sum-and-difference-identities. The cycle-sum and completed-square derivation is my own working."
    },
    {
      "key": "reserved-cycle",
      "title": "Checking the reserved block against the same curve",
      "methodId": "sinusoidal",
      "kind": "model",
      "technique": "Reserved-cycle residuals and model limitations",
      "bridge": "I now evaluate the fitted curve at all thirteen reserved hours, without changing its period or coefficients.",
      "purpose": "Figure 3 shows signed supplied-minus-model discrepancies over the complete record; the checking values are those at hours 36–48.",
      "result": "Keeping fitting and checking cases separate [M2] avoids making their errors small by using the same heights to choose the coefficients. Here it is a check on a known constructed series, not a blind forecast experiment. I continue to use \\(r_i=h_i-M(i)\\) for the plotted signed discrepancies on both parts of the record.\n\nFor the reserved inputs,\n\\[\n\\sum_{i=36}^{48}r_i^2\\approx0.333279226\\text{ m}^2,\\qquad\n\\mathrm{RMSE}_{\\mathrm{reserve}}\n\\approx\\sqrt{\\frac{0.333279226}{13}}\n\\approx0.160115\\text{ m}.\n\\]\nThis exceeds the fitting RMSE of approximately \\(0.121985\\text{ m}\\). The largest absolute reserved discrepancy occurs at \\(t=37\\):\n\\[\nr_{37}\\approx3.192-3.404703081=-0.212703081\\text{ m}.\n\\]\nThat example connects the height error directly to my aim. The model is above \\(3.2\\text{ m}\\), but the supplied height is below it. Even the exact \\(H(37)\\) is below the threshold, because the rounding allowance gives \\(H(37)\\le3.1925<3.2\\).\n\nAt the sampled fourth peak, \\(h_{38}=3.344\\text{ m}\\) while \\(M(38)\\approx3.553339\\text{ m}\\). The signs in Figure 3 vary systematically through the blocks. This agrees with the disclosed slower cosine: one curve that repeats every twelve hours cannot follow the alternating peak heights of the construction.",
      "observationText": "The reserved RMSE rises to 0.1601 m, and hour 37 is explicitly misclassified relative to the threshold.",
      "interpretation": "The repeated timing is insufficient to establish the nominal threshold interval. The error at hour 37 demonstrates a failure relevant to the decision, rather than merely a less attractive fit statistic.",
      "limitations": "The maximum of 0.2127 m concerns thirteen integer-hour discrepancies. It gives no guarantee between those times, and the same known generating recipe underlies both fitting and reserved values.",
      "localTakeaway": "A fixed fit can cross the stipulated level before the constructed function does; sampled residual summaries cannot certify the continuous interval.",
      "nextQuestion": "I need to calculate the model's two crossings around the fourth crest, then determine how much of the intervening interval survives a justified continuous error allowance.",
      "nextWhy": "The disclosed function lets me bound H−M at every instant. That supplies the missing bridge from hourly discrepancies to an above-threshold statement between samples.",
      "mathsInsight": "An average error and a sampled maximum answer different questions from an inequality that holds continuously.",
      "methodChangeReason": "I use the known formula for the continuous proof and do not promote the reserved sampled maximum into an all-time bound.",
      "outcomeId": "residual-structure",
      "knowledge": "mixed",
      "unfamiliarComponent": "Reserved-case checking and the distinction between sampled error summaries and continuous guarantees.",
      "knowledgeNotes": "The reserved values are excluded from coefficient fitting but come from the disclosed same recipe. The printed example at hour 37 shows a threshold failure, while its rounding allowance establishes that the continuous height is also below the level.",
      "understandingExample": "At hour 37, \\(M(37)\\approx3.404703\\) while \\(h_{37}=3.192\\). Since \\(|H(37)-h_{37}|\\le0.0005\\), the continuous value is at most \\(3.1925<3.2\\text{ m}\\), despite the model's positive threshold margin.",
      "researchSource": "Hyndman and Athanasopoulos, Forecasting: Principles and Practice, 3rd ed., §5.8, Evaluating point forecast accuracy [M2], https://otexts.com/fpp3/toolbox.html#evaluating-point-forecast-accuracy. I adapt the separation of fitting and checking and the RMSE definition; this constructed exercise does not establish real forecasting accuracy."
    },
    {
      "key": "threshold-window",
      "title": "From model crossings to a continuously justified interval",
      "methodId": "sinusoidal",
      "kind": "model",
      "technique": "Inverse cosine and deterministic mismatch bounds",
      "bridge": "The hour-37 disagreement shows why solving the single sinusoid is only the first part of the threshold question. I will compare that solution with an interval justified for the constructed function.",
      "purpose": "Figure 4 shows the reserved inputs and stipulated level. Table 1 summarises the model and error-bound intervals connected to the fourth crest near 38 hours.",
      "result": "The fitted fourth crest is at \\(t_c=\\tau+36\\approx38.029820141\\text{ h}\\), so I can write \\(M(t)=c+A\\cos[\\omega(t-t_c)]\\). For a level \\(\\ell\\) between the model's minimum and maximum,\n\\[\nM(t)=\\ell\n\\quad\\Longleftrightarrow\\quad\n\\cos[\\omega(t-t_c)]=\\frac{\\ell-c}{A}.\n\\]\nThe inverse cosine \\(\\arccos\\) returns the angle between \\(0\\) and \\(\\pi\\) with that cosine. The two solutions bracketing this crest are\n\\[\nt_\\pm=t_c\\pm\\frac{6}{\\pi}\n\\arccos\\left(\\frac{\\ell-c}{A}\\right).\n\\]\nCosine rises to its maximum at the centre and falls afterwards, so the model is at least \\(\\ell\\) between those solutions.\n\nPutting \\(\\ell=3.2\\text{ m}\\) gives\n\\[\nt_-\\approx36.413798,\\qquad t_+\\approx39.645842.\n\\]\nThe nominal interval lasts about \\(3.232044\\text{ h}\\). Its inclusion of \\(t=37\\) is consistent with the failure found in the reserved comparison.\n\nTo establish a continuous bound, put \\(\\theta=\\pi t/6\\). Applying the cosine difference identity already used for the phase gives\n\\[\nH(t)=2.5+\\tfrac12\\cos\\theta+\\tfrac{\\sqrt3}{2}\\sin\\theta\n       +0.18\\cos(\\theta/2).\n\\]\nConsequently\n\\[\n\\begin{aligned}\nH(t)-M(t)={}&(2.5-c)+p\\cos\\theta+q\\sin\\theta\\\\\n&+0.18\\cos(\\theta/2),\n\\end{aligned}\n\\]\nwhere \\(p=\\tfrac12-a\\approx-0.009992667\\) and\n\\(q=\\tfrac{\\sqrt3}{2}-b\\approx-0.050047548\\).\n\nI need a bound valid for every angle, not just the sampled ones. Expanding the two squares below gives the identity\n\\[\n(p\\cos\\theta+q\\sin\\theta)^2+\n(p\\sin\\theta-q\\cos\\theta)^2=p^2+q^2.\n\\]\nThe second square is non-negative, so\n\\[\n|p\\cos\\theta+q\\sin\\theta|\n\\le\\sqrt{p^2+q^2}\\approx0.051035384\\text{ m}.\n\\]\nAlso \\(|\\cos(\\theta/2)|\\le1\\). Since the magnitude of a sum cannot exceed the sum of its magnitudes,\n\\[\n\\begin{aligned}\n|H(t)-M(t)|\n&\\le |2.5-c|+\\sqrt{p^2+q^2}+0.18\\\\\n&\\approx0.236035384\\text{ m}<0.24\\text{ m}.\n\\end{aligned}\n\\]\nThe coefficient differences already reflect fitting the rounded inputs. At integer hours, the separate rounding allowance adds at most \\(0.0005\\text{ m}\\) to this upper bound, giving a value below \\(0.23654\\text{ m}\\), still less than \\(0.24\\text{ m}\\). It is not needed to bound the exact continuous \\(H(t)\\).\n\nI conservatively use \\(B=0.24\\text{ m}\\), so at every instant\n\\[\nM(t)-B\\le H(t)\\le M(t)+B.\n\\]\nThis band yields two different logical statements. If \\(M(t)-B\\ge3.2\\), then \\(H(t)\\ge3.2\\) is guaranteed. Conversely, if \\(H(t)\\ge3.2\\), then \\(M(t)+B\\ge3.2\\) is necessary. The latter only says that an above-threshold value has not been ruled out by the bound.\n\nFor the guaranteed interval I therefore substitute \\(\\ell=3.44\\) into the same crossing formula. Its endpoints around this crest are\n\\[\nt_-\\approx37.133073,\\qquad t_+\\approx38.926567,\n\\]\ngiving duration about \\(1.793494\\text{ h}\\). For the interval not ruled out by the bound, I use \\(\\ell=2.96\\), giving approximately \\(35.887140\\) to \\(40.172501\\text{ h}\\). This broader fourth-crest vicinity has duration about \\(4.285361\\text{ h}\\); within the reserved domain its relevant portion begins at \\(t=36\\).\n\nTable 1 rounds these calculations to three decimal places, using unrounded endpoints to calculate each duration. Its intervals concern this crest. Periodic repetition also leaves a short possible portion near the next crest, approximately \\(47.887\\)–\\(48\\text{ h}\\), at the end of the reserved domain; the table is not a list of every possible above-threshold time in that domain.",
      "observationText": "The model's nominal fourth-crest interval lasts about 3.232 h; the continuous bound certifies about 1.793 h within it.",
      "interpretation": "The curve's exactly defined nominal crossings do not describe H exactly. The bound does certify the central interval, while leaving parts near the model crossings undecided. A different, sharper calculation using the full formula could certify more; I have not shown that H is below 3.2 m everywhere outside the sufficient interval.",
      "limitations": "The guarantee follows from the disclosed constructed function and the derived bound. It is neither a confidence interval nor a transferable estimate of real tide-prediction error; the decimal crossing times express numerical calculation, not observational time precision.",
      "localTakeaway": "The nominal window and the sufficient window answer distinct parts of the original question, and both are now supported by worked mathematics.",
      "nextQuestion": "I can now answer the stated question: one sinusoid captures the main repetition, but its nominal interval needs a narrower, continuously justified qualification.",
      "nextWhy": "I stop here because the fit, reserved check and fourth-crest interval have all been established. Fitting the second component or finding exact crossings of H would change the question.",
      "mathsInsight": "A continuous vertical bound gives a sufficient interval and a wider necessary condition through two different inverse-cosine equations.",
      "methodChangeReason": "I close the investigation once the original single-sinusoid question has been answered, rather than adding a more complex fit after its limitations are known.",
      "outcomeId": "residual-structure",
      "knowledge": "mixed",
      "unfamiliarComponent": "A deterministic continuous discrepancy bound and its conversion into sufficient and necessary threshold conditions.",
      "knowledgeNotes": "The printed proof expands the known source function, bounds its coefficient mismatch with a sum-of-squares identity, adds the bounded omitted term, and distinguishes exact H from rounded h_i. The inequalities M−B≤H≤M+B explain the two different threshold intervals.",
      "understandingExample": "With \\(B=0.24\\), \\(M(t)\\ge3.44\\) guarantees \\(H(t)\\ge3.2\\); \\(M(t)<2.96\\) rules it out. Values between these two model levels leave the decision unresolved by this bound alone.",
      "researchSource": "OpenStax, Algebra and Trigonometry 2e, §9.2, Sum and Difference Identities [M3], https://openstax.org/books/algebra-and-trigonometry-2e/pages/9-2-sum-and-difference-identities. The sum-of-squares bound, rounding distinction and threshold implications are derived explicitly from the stated constructed function."
    }
  ],
  "figures": [
    {
      "id": "figure-p3-tide-all",
      "tool": "graph",
      "stage": 0,
      "after": "purpose",
      "title": "Four cycles with the final cycle reserved",
      "number": 1,
      "kind": "time",
      "columns": [
        "Elapsed hours",
        "Constructed height (m)"
      ],
      "rows": [
        [
          0,
          3.18
        ],
        [
          1,
          3.54
        ],
        [
          2,
          3.656
        ],
        [
          3,
          3.493
        ],
        [
          4,
          3.09
        ],
        [
          5,
          2.547
        ],
        [
          6,
          2
        ],
        [
          7,
          1.587
        ],
        [
          8,
          1.41
        ],
        [
          9,
          1.507
        ],
        [
          10,
          1.844
        ],
        [
          11,
          2.326
        ],
        [
          12,
          2.82
        ],
        [
          13,
          3.192
        ],
        [
          14,
          3.344
        ],
        [
          15,
          3.239
        ],
        [
          16,
          2.91
        ],
        [
          17,
          2.453
        ],
        [
          18,
          2
        ],
        [
          19,
          1.681
        ],
        [
          20,
          1.59
        ],
        [
          21,
          1.761
        ],
        [
          22,
          2.156
        ],
        [
          23,
          2.674
        ],
        [
          24,
          3.18
        ],
        [
          25,
          3.54
        ],
        [
          26,
          3.656
        ],
        [
          27,
          3.493
        ],
        [
          28,
          3.09
        ],
        [
          29,
          2.547
        ],
        [
          30,
          2
        ],
        [
          31,
          1.587
        ],
        [
          32,
          1.41
        ],
        [
          33,
          1.507
        ],
        [
          34,
          1.844
        ],
        [
          35,
          2.326
        ],
        [
          36,
          2.82
        ],
        [
          37,
          3.192
        ],
        [
          38,
          3.344
        ],
        [
          39,
          3.239
        ],
        [
          40,
          2.91
        ],
        [
          41,
          2.453
        ],
        [
          42,
          2
        ],
        [
          43,
          1.681
        ],
        [
          44,
          1.59
        ],
        [
          45,
          1.761
        ],
        [
          46,
          2.156
        ],
        [
          47,
          2.674
        ],
        [
          48,
          3.18
        ]
      ],
      "xLabel": "Elapsed time",
      "yLabel": "Constructed height",
      "xSymbol": "t",
      "ySymbol": "H",
      "xUnit": "h",
      "yUnit": "m",
      "xMin": 0,
      "xMax": 48,
      "yMin": 1,
      "yMax": 4,
      "caption": "Values at every integer hour. The model fitting range ends at t=35; the complete fourth cycle from t=36 is reserved."
    },
    {
      "id": "figure-p3-tide-fit",
      "tool": "graph",
      "stage": 1,
      "after": "result",
      "title": "Fixed-frequency sinusoid on the first three cycles",
      "number": 2,
      "kind": "time",
      "columns": [
        "Elapsed hours",
        "Constructed height (m)"
      ],
      "rows": [
        [
          0,
          3.18
        ],
        [
          1,
          3.54
        ],
        [
          2,
          3.656
        ],
        [
          3,
          3.493
        ],
        [
          4,
          3.09
        ],
        [
          5,
          2.547
        ],
        [
          6,
          2
        ],
        [
          7,
          1.587
        ],
        [
          8,
          1.41
        ],
        [
          9,
          1.507
        ],
        [
          10,
          1.844
        ],
        [
          11,
          2.326
        ],
        [
          12,
          2.82
        ],
        [
          13,
          3.192
        ],
        [
          14,
          3.344
        ],
        [
          15,
          3.239
        ],
        [
          16,
          2.91
        ],
        [
          17,
          2.453
        ],
        [
          18,
          2
        ],
        [
          19,
          1.681
        ],
        [
          20,
          1.59
        ],
        [
          21,
          1.761
        ],
        [
          22,
          2.156
        ],
        [
          23,
          2.674
        ],
        [
          24,
          3.18
        ],
        [
          25,
          3.54
        ],
        [
          26,
          3.656
        ],
        [
          27,
          3.493
        ],
        [
          28,
          3.09
        ],
        [
          29,
          2.547
        ],
        [
          30,
          2
        ],
        [
          31,
          1.587
        ],
        [
          32,
          1.41
        ],
        [
          33,
          1.507
        ],
        [
          34,
          1.844
        ],
        [
          35,
          2.326
        ]
      ],
      "xLabel": "Elapsed time",
      "yLabel": "Constructed height",
      "xSymbol": "t",
      "ySymbol": "H",
      "xUnit": "h",
      "yUnit": "m",
      "xMin": 0,
      "xMax": 35,
      "yMin": 1,
      "yMax": 4,
      "models": [
        {
          "id": "model-tide-harm",
          "type": "custom",
          "expression": "2.505+0.50999267*cos(pi*x/6)+0.91607295*sin(pi*x/6)",
          "visible": true
        }
      ],
      "caption": "The single sinusoid has a fixed twelve-hour period. Only the first 36 values determined its coefficients."
    },
    {
      "id": "figure-p3-tide-residuals",
      "tool": "graph",
      "stage": 2,
      "after": "result",
      "title": "Signed height residuals across the four cycles",
      "number": 3,
      "kind": "time",
      "columns": [
        "Elapsed hours",
        "Residual (m)"
      ],
      "rows": [
        [
          0,
          0.165
        ],
        [
          1,
          0.1353
        ],
        [
          2,
          0.1027
        ],
        [
          3,
          0.0719
        ],
        [
          4,
          0.0467
        ],
        [
          5,
          0.0256
        ],
        [
          6,
          0.005
        ],
        [
          7,
          -0.0183
        ],
        [
          8,
          -0.0467
        ],
        [
          9,
          -0.0819
        ],
        [
          10,
          -0.1227
        ],
        [
          11,
          -0.1626
        ],
        [
          12,
          -0.195
        ],
        [
          13,
          -0.2127
        ],
        [
          14,
          -0.2093
        ],
        [
          15,
          -0.1821
        ],
        [
          16,
          -0.1333
        ],
        [
          17,
          -0.0684
        ],
        [
          18,
          0.005
        ],
        [
          19,
          0.0757
        ],
        [
          20,
          0.1333
        ],
        [
          21,
          0.1721
        ],
        [
          22,
          0.1893
        ],
        [
          23,
          0.1854
        ],
        [
          24,
          0.165
        ],
        [
          25,
          0.1353
        ],
        [
          26,
          0.1027
        ],
        [
          27,
          0.0719
        ],
        [
          28,
          0.0467
        ],
        [
          29,
          0.0256
        ],
        [
          30,
          0.005
        ],
        [
          31,
          -0.0183
        ],
        [
          32,
          -0.0467
        ],
        [
          33,
          -0.0819
        ],
        [
          34,
          -0.1227
        ],
        [
          35,
          -0.1626
        ],
        [
          36,
          -0.195
        ],
        [
          37,
          -0.2127
        ],
        [
          38,
          -0.2093
        ],
        [
          39,
          -0.1821
        ],
        [
          40,
          -0.1333
        ],
        [
          41,
          -0.0684
        ],
        [
          42,
          0.005
        ],
        [
          43,
          0.0757
        ],
        [
          44,
          0.1333
        ],
        [
          45,
          0.1721
        ],
        [
          46,
          0.1893
        ],
        [
          47,
          0.1854
        ],
        [
          48,
          0.165
        ]
      ],
      "xLabel": "Elapsed time",
      "yLabel": "Height residual",
      "xSymbol": "t",
      "ySymbol": "r",
      "xUnit": "h",
      "yUnit": "m",
      "xMin": 0,
      "xMax": 48,
      "yMin": -0.3,
      "yMax": 0.3,
      "models": [
        {
          "id": "model-tide-zero",
          "type": "custom",
          "expression": "0",
          "visible": true
        }
      ],
      "calculated": true,
      "caption": "Residual = constructed height − fixed fitted model. The last 13 values are out-of-fit checking cases; patterns reflect the omitted 24-hour component."
    },
    {
      "id": "figure-p3-tide-threshold",
      "tool": "graph",
      "stage": 3,
      "after": "purpose",
      "title": "Fourth-cycle values and the 3.2 m level",
      "number": 4,
      "kind": "time",
      "columns": [
        "Elapsed hours",
        "Constructed height (m)"
      ],
      "rows": [
        [
          36,
          2.82
        ],
        [
          37,
          3.192
        ],
        [
          38,
          3.344
        ],
        [
          39,
          3.239
        ],
        [
          40,
          2.91
        ],
        [
          41,
          2.453
        ],
        [
          42,
          2
        ],
        [
          43,
          1.681
        ],
        [
          44,
          1.59
        ],
        [
          45,
          1.761
        ],
        [
          46,
          2.156
        ],
        [
          47,
          2.674
        ],
        [
          48,
          3.18
        ]
      ],
      "xLabel": "Elapsed time",
      "yLabel": "Constructed height",
      "xSymbol": "t",
      "ySymbol": "H",
      "xUnit": "h",
      "yUnit": "m",
      "xMin": 36,
      "xMax": 48,
      "yMin": 1,
      "yMax": 4,
      "models": [
        {
          "id": "model-tide-level",
          "type": "custom",
          "expression": "3.2",
          "visible": true
        }
      ],
      "caption": "The horizontal line is the invented decision threshold, not a measured datum. The continuous modelled crossings are calculated separately."
    },
    {
      "id": "table-p3-tide-windows",
      "tool": "table",
      "stage": 3,
      "after": "result",
      "title": "Fourth crest: crossing and conditional windows",
      "number": 1,
      "columns": [
        "Interpretation",
        "Rising time",
        "Falling time",
        "Duration"
      ],
      "rows": [
        [
          "Fitted M≥3.2",
          36.414,
          39.646,
          3.232
        ],
        [
          "Guaranteed if error≤0.24 m",
          37.133,
          38.927,
          1.793
        ],
        [
          "Possibly above under error bound",
          35.887,
          40.173,
          4.285
        ]
      ],
      "units": [
        "",
        "h",
        "h",
        "h"
      ],
      "calculated": true,
      "note": "The possible interval begins before t=36. Only the synthetic source recipe justifies the continuous ±0.24 m comparison; none of these are real tide forecasts."
    }
  ],
  "dataSets": [
    {
      "name": "Tide-like Height Cases v1 — complete constructed hourly record",
      "columns": [
        "Elapsed hour",
        "Height m",
        "Use"
      ],
      "rows": [
        [
          0,
          3.18,
          "fit"
        ],
        [
          1,
          3.54,
          "fit"
        ],
        [
          2,
          3.656,
          "fit"
        ],
        [
          3,
          3.493,
          "fit"
        ],
        [
          4,
          3.09,
          "fit"
        ],
        [
          5,
          2.547,
          "fit"
        ],
        [
          6,
          2,
          "fit"
        ],
        [
          7,
          1.587,
          "fit"
        ],
        [
          8,
          1.41,
          "fit"
        ],
        [
          9,
          1.507,
          "fit"
        ],
        [
          10,
          1.844,
          "fit"
        ],
        [
          11,
          2.326,
          "fit"
        ],
        [
          12,
          2.82,
          "fit"
        ],
        [
          13,
          3.192,
          "fit"
        ],
        [
          14,
          3.344,
          "fit"
        ],
        [
          15,
          3.239,
          "fit"
        ],
        [
          16,
          2.91,
          "fit"
        ],
        [
          17,
          2.453,
          "fit"
        ],
        [
          18,
          2,
          "fit"
        ],
        [
          19,
          1.681,
          "fit"
        ],
        [
          20,
          1.59,
          "fit"
        ],
        [
          21,
          1.761,
          "fit"
        ],
        [
          22,
          2.156,
          "fit"
        ],
        [
          23,
          2.674,
          "fit"
        ],
        [
          24,
          3.18,
          "fit"
        ],
        [
          25,
          3.54,
          "fit"
        ],
        [
          26,
          3.656,
          "fit"
        ],
        [
          27,
          3.493,
          "fit"
        ],
        [
          28,
          3.09,
          "fit"
        ],
        [
          29,
          2.547,
          "fit"
        ],
        [
          30,
          2,
          "fit"
        ],
        [
          31,
          1.587,
          "fit"
        ],
        [
          32,
          1.41,
          "fit"
        ],
        [
          33,
          1.507,
          "fit"
        ],
        [
          34,
          1.844,
          "fit"
        ],
        [
          35,
          2.326,
          "fit"
        ],
        [
          36,
          2.82,
          "reserve"
        ],
        [
          37,
          3.192,
          "reserve"
        ],
        [
          38,
          3.344,
          "reserve"
        ],
        [
          39,
          3.239,
          "reserve"
        ],
        [
          40,
          2.91,
          "reserve"
        ],
        [
          41,
          2.453,
          "reserve"
        ],
        [
          42,
          2,
          "reserve"
        ],
        [
          43,
          1.681,
          "reserve"
        ],
        [
          44,
          1.59,
          "reserve"
        ],
        [
          45,
          1.761,
          "reserve"
        ],
        [
          46,
          2.156,
          "reserve"
        ],
        [
          47,
          2.674,
          "reserve"
        ],
        [
          48,
          3.18,
          "reserve"
        ]
      ],
      "sourceText": "Exact generation formula and rounded display convention are stated in the introduction."
    },
    {
      "name": "Harmonic fit and complete residual record",
      "columns": [
        "Elapsed hour",
        "Supplied height",
        "Single-sine prediction",
        "Residual",
        "Use"
      ],
      "rows": [
        [
          0,
          3.18,
          3.01499267,
          0.16500733000000034,
          "fit"
        ],
        [
          1,
          3.54,
          3.404703082963854,
          0.135296917036146,
          "fit"
        ],
        [
          2,
          3.656,
          3.5533387814197517,
          0.10266121858024846,
          "fit"
        ],
        [
          3,
          3.493,
          3.42107295,
          0.07192704999999977,
          "fit"
        ],
        [
          4,
          3.09,
          3.0433461114197518,
          0.046653888580248104,
          "fit"
        ],
        [
          5,
          2.547,
          2.521369867036146,
          0.02563013296385419,
          "fit"
        ],
        [
          6,
          2,
          1.9950073300000002,
          0.00499266999999981,
          "fit"
        ],
        [
          7,
          1.587,
          1.6052969170361462,
          -0.01829691703614622,
          "fit"
        ],
        [
          8,
          1.41,
          1.4566612185802479,
          -0.046661218580247965,
          "fit"
        ],
        [
          9,
          1.507,
          1.58892705,
          -0.08192705,
          "fit"
        ],
        [
          10,
          1.844,
          1.966653888580248,
          -0.12265388858024795,
          "fit"
        ],
        [
          11,
          2.326,
          2.4886301329638534,
          -0.1626301329638533,
          "fit"
        ],
        [
          12,
          2.82,
          3.0149926699999994,
          -0.19499266999999953,
          "fit"
        ],
        [
          13,
          3.192,
          3.404703082963854,
          -0.21270308296385387,
          "fit"
        ],
        [
          14,
          3.344,
          3.553338781419752,
          -0.20933878141975226,
          "fit"
        ],
        [
          15,
          3.239,
          3.42107295,
          -0.18207295000000023,
          "fit"
        ],
        [
          16,
          2.91,
          3.0433461114197526,
          -0.1333461114197525,
          "fit"
        ],
        [
          17,
          2.453,
          2.5213698670361455,
          -0.06836986703614567,
          "fit"
        ],
        [
          18,
          2,
          1.9950073300000004,
          0.004992669999999588,
          "fit"
        ],
        [
          19,
          1.681,
          1.6052969170361466,
          0.07570308296385342,
          "fit"
        ],
        [
          20,
          1.59,
          1.456661218580248,
          0.13333878141975197,
          "fit"
        ],
        [
          21,
          1.761,
          1.58892705,
          0.17207295,
          "fit"
        ],
        [
          22,
          2.156,
          1.9666538885802471,
          0.189346111419753,
          "fit"
        ],
        [
          23,
          2.674,
          2.488630132963852,
          0.18536986703614788,
          "fit"
        ],
        [
          24,
          3.18,
          3.0149926699999994,
          0.16500733000000078,
          "fit"
        ],
        [
          25,
          3.54,
          3.4047030829638545,
          0.13529691703614555,
          "fit"
        ],
        [
          26,
          3.656,
          3.5533387814197517,
          0.10266121858024846,
          "fit"
        ],
        [
          27,
          3.493,
          3.42107295,
          0.07192704999999977,
          "fit"
        ],
        [
          28,
          3.09,
          3.043346111419753,
          0.04665388858024677,
          "fit"
        ],
        [
          29,
          2.547,
          2.521369867036146,
          0.02563013296385419,
          "fit"
        ],
        [
          30,
          2,
          1.9950073300000022,
          0.004992669999997812,
          "fit"
        ],
        [
          31,
          1.587,
          1.6052969170361464,
          -0.018296917036146443,
          "fit"
        ],
        [
          32,
          1.41,
          1.456661218580248,
          -0.04666121858024819,
          "fit"
        ],
        [
          33,
          1.507,
          1.5889270500000003,
          -0.08192705000000045,
          "fit"
        ],
        [
          34,
          1.844,
          1.9666538885802487,
          -0.12265388858024862,
          "fit"
        ],
        [
          35,
          2.326,
          2.488630132963854,
          -0.16263013296385376,
          "fit"
        ],
        [
          36,
          2.82,
          3.014992669999999,
          -0.1949926699999991,
          "reserve"
        ],
        [
          37,
          3.192,
          3.404703082963853,
          -0.21270308296385299,
          "reserve"
        ],
        [
          38,
          3.344,
          3.5533387814197517,
          -0.20933878141975182,
          "reserve"
        ],
        [
          39,
          3.239,
          3.421072950000001,
          -0.18207295000000112,
          "reserve"
        ],
        [
          40,
          2.91,
          3.0433461114197513,
          -0.13334611141975117,
          "reserve"
        ],
        [
          41,
          2.453,
          2.52136986703615,
          -0.06836986703615011,
          "reserve"
        ],
        [
          42,
          2,
          1.9950073300000009,
          0.004992669999999144,
          "reserve"
        ],
        [
          43,
          1.681,
          1.6052969170361466,
          0.07570308296385342,
          "reserve"
        ],
        [
          44,
          1.59,
          1.456661218580248,
          0.13333878141975197,
          "reserve"
        ],
        [
          45,
          1.761,
          1.5889270500000003,
          0.17207294999999956,
          "reserve"
        ],
        [
          46,
          2.156,
          1.9666538885802451,
          0.189346111419755,
          "reserve"
        ],
        [
          47,
          2.674,
          2.488630132963854,
          0.1853698670361461,
          "reserve"
        ],
        [
          48,
          3.18,
          3.014992669999999,
          0.16500733000000123,
          "reserve"
        ]
      ],
      "sourceText": "Single sinusoid fitted only on hours 0–35."
    },
    {
      "name": "Crossing computations",
      "columns": [
        "Scenario",
        "Rising hour",
        "Falling hour",
        "Duration hours"
      ],
      "rows": [
        [
          "Fitted",
          36.413798,
          39.645842,
          3.232044
        ],
        [
          "Definite under bound",
          37.133073,
          38.926567,
          1.793494
        ],
        [
          "Possible under bound",
          35.88714,
          40.172501,
          4.285361
        ]
      ],
      "sourceText": "Calculated inverse-cosine crossing times for threshold 3.2 m and conditional vertical offsets ±0.24 m."
    }
  ],
  "conclusion": {
    "mainConclusion": "The chosen \\(12\\)-hour sinusoid describes the main timing of the first three twelve-hour blocks of the constructed record, with midline \\(2.505\\text{ m}\\), amplitude about \\(1.04847\\text{ m}\\) and fitting RMSE about \\(0.1220\\text{ m}\\). Its unchanged reserved-block RMSE rises to about \\(0.1601\\text{ m}\\). More decisively for my aim, at hour 37 it predicts a height above \\(3.2\\text{ m}\\) while the constructed function is below that level. The unequal peaks therefore matter to the threshold decision, even though their main spacing is retained.",
    "conclusionBenefit": "Around the fourth crest, the fitted model predicts an interval from approximately \\(36.414\\) to \\(39.646\\text{ h}\\), lasting \\(3.232\\text{ h}\\). The separate all-time proof gives \\(|H-M|<0.24\\text{ m}\\), which certifies approximately \\(37.133\\)–\\(38.927\\text{ h}\\), lasting \\(1.793\\text{ h}\\), above the stipulated level. This is a sufficient central interval, not a claim that the constructed function is below the level everywhere else. The wider bound-only vicinity in Table 1 identifies where the result remains undecided by that bound.",
    "conclusionExtension": "My expectation was supported: one sinusoid preserves the repeated timing more convincingly than it preserves the threshold interval. I have answered the intended simplification question without fitting away the known mismatch. A separate investigation could compare exact crossings of the two-component function with these conservative bounds, but that calculation is not needed for the present conclusion. No navigational conclusion follows from the artificial datum, hours and heights."
  },
  "review": {
    "story": "The chosen single-sinusoid simplification leads to a derived fit; the reserved threshold failure motivates a continuous bound; the bound gives the qualified fourth-crest interval requested in the aim.",
    "sequence": "Three fitting peaks supply two spacings. The full generating formula is disclosed before fitting, the fourth-cycle inputs never determine coefficients, and the final stage explicitly closes the original question.",
    "notation": "I distinguish exact continuous H(t), rounded hourly h_i, fitted M(t) and sampled r_i. Angles are in radians, all fitting sums have explicit ranges, rounded outputs use approximate signs, and necessary/sufficient intervals are distinguished.",
    "purpose": "The stipulated 3.2 m level creates a hypothetical threshold question around the fourth crest. It is not a real access requirement, and the known construction is used to examine information lost by simplification.",
    "limits": "The sampled maximum is not promoted into a continuous bound. The exact-function proof, hourly rounding allowance, reserved-domain boundary and next-crest possible portion are explained where they affect the conclusion.",
    "calculations": "I recomputed the three coefficient sums, completed-square minimum, phase and amplitude, fitting and reserved errors, continuous 0.236035384 m bound, and three inverse-cosine intervals. Two native-table duration cells were corrected to use unrounded crossings before rounding.",
    "presentation": "The four native graphs and crossing table remain attached to the same stages. Complete reader, PDF and Word review is still required after this narrative revision.",
    "presentationChecked": false,
    "sources": "The constructed recipe is identified as [D1]. NIST supports the least-squares criterion [M1], OTexts supplies the error measure and separate-checking distinction [M2], and OpenStax supplies the cosine identity [M3]; the displayed derivations are my own working.",
    "figures": "All graph definitions, source rows, working rows and crossing endpoints are retained. Only the guaranteed and possible duration cells change from 1.794 and 4.286 to correctly rounded 1.793 and 4.285 h.",
    "technology": "Technology evaluates disclosed scalar sums and radian inverse trigonometric functions. The printed mathematics explains their purpose and meaning without requiring unexplained matrices or a black-box fit."
  },
  "planningExtra": {
    "mathsOutside": "outside",
    "mathsRevisedWhy": "The core uses AI SL sinusoidal modelling. I explain the additional fixed-frequency least-squares derivation, coefficient-to-phase identity, RMSE and reserved-case design, and continuous mismatch proof in ordinary printed fields at their first use."
  },
  "references": [
    {
      "label": "[D1] Constructed case record",
      "value": "Tide-like Height Cases v1: 49 constructed hourly heights in metres for t=0,…,48 h, referenced to an arbitrary fictional datum. Exact construction: H(t)=2.5+cos[π(t−2)/6]+0.18 cos(2πt/24), rounded to 0.001 m at integer hours. Fit only t=0,…,35 (three 12-hour cycles); reserve the complete t=36,…,48 cycle for a check. Values are synthetic, not a tidal station record, sea-level forecast, chart datum or navigational guidance."
    },
    {
      "label": "Calculation record",
      "value": "The editable 49-hour input record, complete fixed-model discrepancy table and unrounded crossing calculations supplied with this investigation. All coefficient sums, phase conversions, bounds and interval calculations are my own working from these constructed inputs."
    },
    {
      "label": "[M1] Least-squares criterion",
      "value": "NIST/SEMATECH. e-Handbook of Statistical Methods, §4.1.4.1, Linear Least Squares Regression. https://www.itl.nist.gov/div898/handbook/pmd/section1/pmd141.htm (accessed 23 October 2026). Source for minimising squared discrepancies in models linear in their coefficients. The cycle-sum cancellation and completed-square derivation are shown here explicitly."
    },
    {
      "label": "[M2] Error measure and separate checking",
      "value": "Hyndman, R. J., and Athanasopoulos, G. (2021). Forecasting: Principles and Practice, 3rd edition. OTexts, Melbourne. §5.8, Evaluating point forecast accuracy. https://otexts.com/fpp3/toolbox.html#evaluating-point-forecast-accuracy (accessed 23 October 2026). Source for the RMSE definition and separation of fitting from checking values. Their use here evaluates one disclosed constructed series, not a real forecasting process."
    },
    {
      "label": "[M3] Trigonometric identity",
      "value": "OpenStax. Algebra and Trigonometry 2e, §9.2, Sum and Difference Identities. https://openstax.org/books/algebra-and-trigonometry-2e/pages/9-2-sum-and-difference-identities (accessed 23 October 2026). Source for the displayed cosine difference identity used in the amplitude/phase conversion and expansion of the known source function. The continuous bound and threshold implications are derived in the investigation."
    }
  ]
};
export const TIDE_CASES=Object.freeze(STUDY.dataSets[0].rows.map(row=>Object.freeze(row)));
export const TIDE_CYCLES_SPEC=buildModellingPass3(STUDY);
