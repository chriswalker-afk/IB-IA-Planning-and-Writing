import {buildModellingPass3} from './modelling-pass3-helpers.js';
const STUDY={
  "id": "tide-cycles",
  "routeId": "cycles",
  "title": "How much can one tide-like sinusoid tell me?",
  "course": "AI SL",
  "mathSelected": [
    "AI08",
    "AI09"
  ],
  "technologyStage": 1,
  "description": "A complete constructed 12-hour cyclic-height model using three fitting cycles, a reserved cycle, harmonic regression, threshold crossings and conditional mismatch bounds.",
  "provenance": "Tide-like Height Cases v1: 49 constructed hourly heights in metres for t=0,…,48 h, referenced to an arbitrary fictional datum. Exact construction: H(t)=2.5+cos[π(t−2)/6]+0.18 cos(2πt/24), rounded to 0.001 m at integer hours. Fit only t=0,…,35 (three 12-hour cycles); reserve the complete t=36,…,48 cycle for a check. Values are synthetic, not a tidal station record, sea-level forecast, chart datum or navigational guidance.",
  "citation": "Tide-like Height Cases v1. Original explicitly constructed mathematical series in this project; no port or public tide table was consulted.",
  "readingNote": "This is a mathematical simulation, not an actual tide prediction. The height datum and hours are fictional; the threshold calculation cannot guide water access or navigation.",
  "idea": "A smooth repeating curve may describe several similar high-water cycles, but does it give a reliable time interval when a height is above my chosen threshold?",
  "aim": "How well does one sinusoid with a \\(12\\)-hour period describe three consecutive cycles of my constructed height record, and what window does it predict above \\(3.2\\text{ m}\\) in the fourth cycle? I will check the fourth cycle separately and examine the effect of a known bounded mismatch.",
  "motivation": "I was interested in the difference between recognising a repeated rise and fall and using that pattern to make a quantitative time-window claim.",
  "beneficiary": "I would use the model to understand the limits of periodic interpolation in a deliberately constructed series, not to plan a real visit to tidal water.",
  "intendedUse": "Compare a simple sinusoid with the reserved cycle and calculate which parts of a hypothetical threshold interval remain defensible when one systematic component is omitted.",
  "prediction": "I expect the 12-hour component to give useful approximate crossings but not reproduce every high and low because my constructed record also has a 24-hour component.",
  "predictionWhy": "A single sinusoid has one fixed midline and amplitude, whereas a second harmonic can make consecutive peaks unequal.",
  "predictionImplication": "A threshold prediction may be sensitive to the ignored component even if the apparent 12-hour period remains stable.",
  "firstAction": "Plot all forty-nine heights with an unambiguous t=0 and inspect successive peaks across at least three cycles.",
  "readinessImprovement": "I have fixed the time origin, artificial height datum, fitting cycles, fourth-cycle holdout and 3.2 m threshold in advance.",
  "teacherQuestion": "Can I justify the fixed-period harmonic fit and show a conditional crossing bound without implying that the series is a real tide forecast?",
  "methodRecord": "I retained 49 original constructed hourly cases. Only t=0–35 was used to estimate harmonic coefficients for a fixed 12-hour sinusoid; I then checked t=36–48 and solved the fourth-cycle threshold.",
  "sourcePopulation": "One synthetic periodic sequence with an arbitrary datum; no real coastal population or forecasting process.",
  "sampleSize": "49 hourly values, with 36 for fitting (t=0–35) and 13 in the held-out cycle (t=36–48).",
  "pairing": "Each height is indexed by a fixed integer hour from the same artificial time origin. The fourth cycle is never included in fitting.",
  "modelEvidence": "Three complete 12-hour fitting cycles and a separate, complete fourth cycle, with a deliberately disclosed 24-hour perturbation.",
  "inputs": "Elapsed time \\(t\\) in hours from an arbitrary constructed origin; height \\(H(t)\\) in metres above a fictional datum. The base period \\(P=12\\) h is estimated from approximately 12-hour peak separation.",
  "assumptions": "A single 12-hour harmonic is an initial candidate only. The source recipe contains a second 24-hour component, so fixed amplitude/phase of a single sine wave cannot exactly reproduce it.",
  "domain": "The fitted interval is \\(0\\le t<36\\) h. Check \\(36\\le t\\le48\\) h as one reserved cycle. A \\(3.2\\text{ m}\\) threshold is meaningful only for this fictional datum and source recipe.",
  "validation": "I compare training and held-out residual root mean squares and the maximum absolute reserved residual before assessing crossing predictions.",
  "alternative": "A two-component model using both 12-hour and 24-hour terms can reproduce the constructed mechanism more closely, but fitting a second term to the already designed data would not be independent physical confirmation.",
  "chosenMethod": "Estimate P≈12 h from three cycles, fit H=c+a cos(πt/6)+b sin(πt/6) by least squares on the first 36 cases, inspect the reserved cycle, then invert the sinusoid near its fourth crest.",
  "methodReason": "Fixing the period before fitting makes the harmonic coefficients and phase interpretable; comparing the next full cycle can reveal limitations that one smooth overlay might hide.",
  "methodLimit": "The observed heights were generated from two harmonics. One fitted sine wave cannot account for their alternating crest sizes and the residuals are not independent random errors.",
  "consequence": "The error in a predicted crossing time can be much greater than a height residual suggests when the wave's slope is small near a crest.",
  "mitigation": "I preserve the reserved cycle and use the known generating expression to bound all-time mismatch in this theoretical scenario, explicitly separate from empirical uncertainty.",
  "acceptable": "The fourth-cycle calculation describes these known constructed functions; it provides no sea-level forecast or safe access window.",
  "changedSincePlanning": "The fourth-cycle errors revealed unequal highs despite an almost constant twelve-hour spacing. This led me to qualify the calculated threshold times rather than using one precise interval uncritically.",
  "dataStatusSummary": "All 49 hourly constructed heights were retained, with 36 used to fit the single sinusoid and 13 reserved for its fourth-cycle comparison.",
  "dataAimLink": "I first plot \\(H\\) against elapsed time \\(t\\), marking a fictional \\(t=0\\) and consistent height datum. Peak separation suggests a trial period, but several cycles are needed before choosing a periodic family.",
  "firstEvaluation": "A time plot preserves the four-cycle sequence; interpreting a curve by one isolated peak would not give a defensible period estimate.",
  "definitions": "\\(t\\) is elapsed hours from my fictional origin; \\(H\\) is height in metres relative to an arbitrary datum; \\(P=12\\text{ h}\\) is the candidate cycle length; \\(M(t)\\) is the fitted single sinusoid; \\(r=H-M\\) is its signed height residual. Angular inputs are in radians.",
  "firstPresentation": "Figure 1 plots the whole fixed record. I use 0–35 h to estimate the model and keep the 36–48 h cycle separate.",
  "accuracyQuantity": "Constructed elapsed time and height",
  "accuracySymbol": "t, H",
  "accuracyUnit": "h; m",
  "accuracyResolution": "The grid is hourly and constructed heights are rounded to 0.001 m. This is not evidence of water-level sensor resolution or forecast accuracy.",
  "accuracyPolicy": "Fit from unrounded numerical arithmetic on the rounded input cases and display crossing hours to approximately 0.01 h only as a model computation.",
  "accuracyReason": "An hourly constructed grid cannot identify an actual continuous crossing without a model. The all-time ±0.24 m check is derived from the stipulated source formula, not from measurement precision.",
  "specialistTerms": "Phase shift locates a sinusoid's crest relative to t=0. A threshold-crossing window is the interval between the rising and falling solutions around one modelled crest, not a high-water forecast.",
  "predictionComparison": "As expected, a 12-hour sinusoid captures the repeated rise and fall but misses alternating crest size; the fourth-cycle errors are larger than the fitting errors.",
  "benefitFinding": "The threshold window becomes more informative when distinguished from an all-time bound based on the known omitted component.",
  "surpriseReason": "An appealing fixed-period curve can misplace the threshold window even though its frequency is very close to the visible 12-hour repetition.",
  "surpriseCheck": "I compared the unrounded fitted harmonic with the disclosed two-component generation rule and derived a conservative all-time 0.24 m mismatch bound.",
  "courseConcern": "Sinusoidal functions, amplitude, period, phase, linear least-squares coefficients and inverse cosine are within a clearly explained modelling investigation. The residual bound is algebraic, not a claim of advanced harmonic forecasting.",
  "technologyTool": "Graph plotter and harmonic least-squares calculator",
  "technologyInput": "Use \\(t=0,\\ldots,35\\), with three columns \\(1,\\cos(\\pi t/6),\\sin(\\pi t/6)\\), to fit the coefficients of \\(M(t)\\).",
  "technologyOutcome": "\\(M(t)=2.505+0.509993\\cos(\\pi t/6)+0.916073\\sin(\\pi t/6)\\), amplitude about \\(1.04847\\text{ m}\\), fourth-cycle crest at \\(t\\approx38.030\\text{ h}\\).",
  "technologyInterpretation": "The harmonic fit fixes a 12-hour period; residuals and a theoretical mismatch bound, not the appearance of the curve alone, govern my confidence in crossing times.",
  "courseWhy": "The periodic model is developed through multiple cycles, a reserved check and an inverse-trigonometric decision rather than only plotting a sine graph.",
  "mathsLearning": "I learned that a meaningful periodic approximation can give misleadingly precise crossing times when another harmonic changes crest heights.",
  "introduction": "I have noticed that many repeating patterns look almost sinusoidal, but 'almost' may matter when I want to know the times at which a curve crosses a chosen level. I constructed a tide-like mathematical record to test that difference without relying on a genuine sea-level source.\n \nMy series has 49 hourly values over four nominal 12-hour cycles, in metres relative to a fictional height datum. I will fit only the first three cycles, evaluate the next complete cycle without refitting, then ask when one sinusoid predicts a height at least \\(3.2\\text{ m}\\) around the fourth crest.\n \nI expected the repeated timing to be captured better than the size of every crest. My conclusion will concern the defined series only: the data are synthetic and the calculation is not navigation or coastal-safety guidance.",
  "dataNotes": "Tide-like Height Cases v1 [D1] were created from\n\\[\nH(t)=2.5+\\cos\\left(\\frac{\\pi(t-2)}6\\right)+0.18\\cos\\left(\\frac{2\\pi t}{24}\\right),\n\\]\nthen rounded to \\(0.001\\text{ m}\\) at each integer hour \\(t=0,\\ldots,48\\). These are the entire inputs; the 24-hour component intentionally produces unequal crests in consecutive 12-hour cycles. The height datum is arbitrary and does not match a real chart datum. Time t=0 is a fictional origin, not a calendar timestamp.\n \nI fixed \\(P=12\\text{ h}\\) after inspecting three crest separations, then fitted \\(M(t)=c+a\\cos(\\pi t/6)+b\\sin(\\pi t/6)\\) only on t=0–35. Every residual in t=36–48 uses these same coefficients. The known generation formula makes it possible to calculate a theoretical continuous-time discrepancy bound, which is different from estimating measurement error from the 49 sampled values.",
  "stages": [
    {
      "key": "cycle-inspection",
      "title": "Estimating a period from multiple cycles",
      "methodId": "follow-journey",
      "kind": "model",
      "technique": "Repeated peak locations and domain specification",
      "bridge": "My original question concerns a time window, so I first need evidence for a repeatable time scale, not a sinusoid chosen by name.",
      "purpose": "Figure 1 displays the entire constructed record with the fourth cycle clearly reserved from fitting.",
      "result": "In the first three 12-hour segments, the high points occur close to \\(t=2,14,26\\text{ h}\\). Their separation is \\(12\\text{ h}\\) each, giving a candidate period \\(P=12\\text{ h}\\) and angular frequency\n\\[\n\\omega=\\frac{2\\pi}{P}=\\frac{\\pi}{6}\\;\\mathrm{rad\\,h}^{-1}.\n\\]\nThe supplied heights at these three crests are \\(3.656,3.344,3.656\\text{ m}\\). Consecutive peaks are therefore not equally high, despite their near-equal spacing. Likewise the approximate lows at \\(8,20,32\\text{ h}\\) are \\(1.410,1.590,1.410\\text{ m}\\). This is a reason to test one sinusoid but not to assume it exactly describes the record.",
      "observationText": "Three clear crest spacings are near twelve hours, but their heights alternate.",
      "interpretation": "The dominant periodic timing is identifiable without pretending that amplitude and midline are perfectly fixed. A single harmonic is an approximation worth quantifying.",
      "limitations": "Hourly samples cannot locate the exact crest of a continuous curve; I use a twelve-hour candidate supported by several segments of this synthetic record.",
      "localTakeaway": "The first three cycles support a 12-hour candidate period, yet heights vary between peaks.",
      "nextQuestion": "Which twelve-hour sinusoid best fits the first three cycles, and what do its coefficients mean?",
      "nextWhy": "A period alone does not determine the height datum, amplitude or phase required for a threshold crossing.",
      "mathsInsight": "Stable crest spacing does not require identical crest heights.",
      "methodChangeReason": "I held the period fixed to avoid fitting extra parameters just to conceal the alternating levels.",
      "outcomeId": "repeating"
    },
    {
      "key": "harmonic-model",
      "title": "Estimating the single-sinusoid coefficients",
      "methodId": "sinusoidal",
      "kind": "model",
      "technique": "Fixed-frequency harmonic regression",
      "bridge": "The first three cycles suggested a twelve-hour pattern, so I now fit a midline and two harmonic coefficients.",
      "purpose": "Figure 2 overlays the fitted model only with its 36 fitting points. A sine and cosine at the same known frequency also form one sinusoid with an interpretable phase.",
      "result": "I fitted\n\\[\nM(t)=c+a\\cos(\\pi t/6)+b\\sin(\\pi t/6)\n\\]\nby minimising the sum of squared height residuals for \\(t=0,\\ldots,35\\). This is linear least squares in \\(c,a,b\\), even though the resulting function varies sinusoidally in \\(t\\). The solution is\n\\[\nM(t)=2.505+0.509993\\cos(\\pi t/6)+0.916073\\sin(\\pi t/6).\n\\]\nThe midline is \\(2.505\\text{ m}\\). Combining the harmonic terms gives amplitude \\(\\sqrt{a^2+b^2}\\approx1.04847\\text{ m}\\). The phase has the form\n\\[\nM(t)\\approx2.505+1.04847\\cos\\left(\\frac{\\pi}{6}(t-2.02982)\\right).\n\\]\nThe root mean squared error on the 36 fitting heights is approximately \\(0.1220\\text{ m}\\).",
      "observationText": "The single fitted curve captures the main twelve-hour cycle but places every crest around the same height.",
      "interpretation": "The model's crest occurs every twelve hours, at approximately 2.030, 14.030, 26.030 and 38.030 hours. Its fixed (1.04847\text{ m}) amplitude is an averaging compromise across the unequal constructed crests.",
      "limitations": "A 12-hour harmonic cannot represent the declared 24-hour component. Fitted coefficients minimise error on the chosen interval but do not make the omitted component disappear.",
      "localTakeaway": "The 12-hour least-squares model has midline 2.505 m and amplitude 1.04847 m; it reproduces the dominant timing but not every crest height.",
      "nextQuestion": "How badly does the fixed model miss the complete fourth cycle, and can its residuals explain which predictions are at risk?",
      "nextWhy": "A fitted curve's own training residuals do not test its description of an unseen cycle.",
      "mathsInsight": "Harmonic regression is linear in its coefficients when the period is fixed in advance.",
      "methodChangeReason": "I froze the three harmonic coefficients before examining the t=36–48 values.",
      "outcomeId": "repeating"
    },
    {
      "key": "reserved-cycle",
      "title": "The next full cycle reveals systematic mismatch",
      "methodId": "sinusoidal",
      "kind": "model",
      "technique": "Reserved-cycle residuals and model limitations",
      "bridge": "My single sinusoid looks smooth over the fitted cycles. I tested it against all thirteen points of the complete reserved fourth cycle.",
      "purpose": "Figure 3 displays supplied-minus-fitted residuals throughout all four cycles and distinguishes the checking cycle by its time range.",
      "result": "For the first 36 cases, RMSE is approximately \\(0.1220\\text{ m}\\). The 13 held-out cases at \\(t=36,\\ldots,48\\) have RMSE approximately \\(0.1601\\text{ m}\\), and their largest absolute sampled error is about \\(0.2127\\text{ m}\\). The signs show a regular deviation rather than completely unstructured variation.\n \nFor example, the constructed heights at \\(t=36,38,40\\) are \\(2.820,3.344,2.910\\text{ m}\\). The fixed sinusoid predicts about \\(3.015,3.553,3.043\\text{ m}\\) at those times. In the held-out cycle the model overstates the crest and can be on the wrong side of my chosen \\(3.2\\text{ m}\\) threshold near a crossing.\n \nThe second \\(24\\)-hour cosine in the declared generation rule explains why a single \\(12\\)-hour component cannot reproduce alternating highs. This is a mathematical explanation for the constructed residuals, not an independent discovery about actual sea levels.",
      "observationText": "The reserved crest at t=38 is lower than the fitted curve; the fixed periodic model does not capture the alternating height pattern.",
      "interpretation": "The period still gives useful approximate timing, but the model's crossing instants require a qualification tied to vertical model error and wave slope.",
      "limitations": "The 0.2127 m maximum is observed only at sampled integer hours; it cannot by itself bound the error between them. A continuous mismatch bound needs the disclosed generating expression or new mathematical assumptions.",
      "localTakeaway": "Reserved-cycle RMSE rises to about 0.1601 m and the largest sampled error is 0.2127 m, despite consistent twelve-hour timing.",
      "nextQuestion": "What crossing times does the one-sinusoid model give for 3.2 m, and how would a justified continuous mismatch bound change the usable window?",
      "nextWhy": "The user's decision concerns above-threshold time, not average vertical fitting error.",
      "mathsInsight": "A sampled residual maximum is not automatically a bound for every instant between readings.",
      "methodChangeReason": "I used the exact constructed recipe to bound mismatch continuously rather than treating sampled residuals as a confidence interval.",
      "outcomeId": "irregular"
    },
    {
      "key": "threshold-window",
      "title": "Solving the crossing and a conservative window",
      "methodId": "sinusoidal",
      "kind": "model",
      "technique": "Inverse cosine and deterministic mismatch bounds",
      "bridge": "The fourth crest occurs near 38 hours, so I solve for the rising and falling times around that crest, then test how model error could change the answer.",
      "purpose": "Figure 4 highlights the fourth cycle relative to 3.2 m; Table 1 compares exact model crossing times and conditional guaranteed/possible windows.",
      "result": "The single model can be written\n\\[\nM(t)=2.505+1.0484666\\cos\\left(\\frac{\\pi}{6}(t-2.0298201)\\right).\n\\]\nAround the fourth crest at \\(t_c\\approx38.02982\\), \\(M(t)=3.2\\) requires\n\\[\n\\cos\\left(\\frac{\\pi(t-t_c)}6\\right)=\\frac{3.2-2.505}{1.0484666}.\n\\]\nThe inverse cosine gives \\(t\\approx36.4138\\) rising and \\(t\\approx39.6458\\) falling, so \\(M(t)\\ge3.2\\text{ m}\\) between those instants.\n \nI next used the source recipe to justify a continuous mismatch bound. Its 24-hour term is at most \\(0.18\\text{ m}\\) in magnitude. The fitted-versus-original 12-hour coefficients differ by roughly \\(0.00999\\) and \\(0.05005\\), whose combined sinusoidal amplitude is \\(\\sqrt{0.00999^2+0.05005^2}\\approx0.05104\\text{ m}\\). Including the \\(0.005\\text{ m}\\) midline difference and at most \\(0.0005\\text{ m}\\) rounding gives a bound below \\(0.24\\text{ m}\\) for the explicitly constructed continuous comparison.\n \nConsequently \\(M(t)-0.24\\ge3.2\\) implies the true constructed function is above the threshold under that stated bound. This holds approximately from \\(t=37.133\\) to \\(38.927\\) h. Conversely \\(M(t)+0.24\\ge3.2\\) gives a broader possible vicinity, from roughly \\(35.887\\) to \\(40.173\\) h; its beginning precedes the held-out cycle. The intervals are deterministic consequences of the recipe, not probabilities or real-world safe windows.",
      "observationText": "The single-sine crossing window is wider than the window that can be certified above the threshold under the stipulated mismatch bound.",
      "interpretation": "The central mathematical answer is a predicted interval of 36.414–39.646 h, but only 37.133–38.927 h is guaranteed above 3.2 m under the conservative model-error condition. A precisely solved trigonometric equation is not the same as a precise prediction.",
      "limitations": "The ±0.24 m bound uses knowledge of this synthetic generating formula and is not transferable to a real tide. The possible vicinity outside the reserved domain is only mathematical context, not observed data.",
      "localTakeaway": "A single-sinusoid window spans about 3.23 h, but the all-time theoretical mismatch bound narrows the definitely-above interval to about 1.79 h.",
      "nextQuestion": "Would a genuinely separate real record support a stable twelve-hour component and a defensible forecast-error bound?",
      "nextWhy": "No confidence for a real water level follows from the constructed harmonic decomposition alone.",
      "mathsInsight": "A bounded height error maps nonlinearly to time error through the inverse cosine, especially near a flat crest.",
      "methodChangeReason": "I reported both the exact sinusoidal crossings and the conditional restricted window rather than claiming a single sure forecast.",
      "outcomeId": "irregular"
    }
  ],
  "figures": [
    {
      "id": "p3-tide-all",
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
      "id": "p3-tide-fit",
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
      "id": "p3-tide-residuals",
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
      "id": "p3-tide-threshold",
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
      "id": "p3-tide-windows",
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
          1.794
        ],
        [
          "Possibly above under error bound",
          35.887,
          40.173,
          4.286
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
    "mainConclusion": "The first three constructed cycles support a \\(12\\)-hour single-sinusoid approximation \\(M(t)=2.505+0.509993\\cos(\\pi t/6)+0.916073\\sin(\\pi t/6)\\). The fitted RMSE is about \\(0.1220\\text{ m}\\); on the prespecified fourth cycle it rises to about \\(0.1601\\text{ m}\\). The fourth-cycle peak is lower than the modelled crest, confirming that a single fixed-amplitude harmonic misses part of the deliberately constructed pattern.",
    "conclusionBenefit": "For the fictional \\(3.2\\text{ m}\\) threshold, the fitted model predicts an above-threshold window from \\(t\\approx36.414\\) to \\(39.646\\) h. Under a conservative continuous mismatch bound of \\(\\pm0.24\\text{ m}\\), derived from the disclosed two-component source recipe, only \\(t\\approx37.133\\)–\\(38.927\\) h is definitely above the threshold. These two intervals answer different questions: solving the chosen sinusoid exactly versus making a statement robust to a defined mismatch.",
    "conclusionExtension": "Real tide-level work would require original station data, an actual time origin and datum, longer independent validation, and a justified forecast-error treatment. A two-harmonic fit is a natural mathematical extension to this synthetic example but would still need evidence on genuinely new cycles. No navigational conclusion can be drawn from these invented values."
  },
  "review": {
    "story": "I established a period from three cycles, fitted one sinusoid, checked all thirteen fourth-cycle values and solved an above-threshold window with a proved recipe-based bound.",
    "sequence": "The repeated crest separation motivates a 12-hour fit; alternating crest height drives the fourth-cycle check; residual mismatch changes the meaning of a crossing time.",
    "notation": "I specify a fictional time origin, arbitrary height datum, radian angular frequency, signed residuals, and the limited meaning of a bounded synthetic error.",
    "purpose": "The decision is a mathematically conditional crossing window, never a tidal navigation or water-safety recommendation.",
    "limits": "The maximum sampled error is not used as a continuous guarantee; only the known exact two-component formula supports the 0.24 m all-time bound.",
    "calculations": "I recomputed the harmonic coefficients, crest phase and amplitude, fit/holdout RMSE, inverse-cosine crossings and the ±0.24 m constrained intervals.",
    "presentation": "Four editable time/fit/residual/threshold graphs and one compact crossing table preserve the chronology and units.",
    "sources": "The 49 observations, full generating formula, datum and held-out cycle are explicitly constructed and fully disclosed.",
    "figures": "Graphs distinguish fitted hours from the fourth-cycle check; the compact table shows nominal and conditional crossings rather than raw 49-row output.",
    "technology": "The least-squares design matrix uses 1, cos(πt/6), sin(πt/6) for t=0–35 only; the crossing follows algebraically from that fitted model."
  }
};
export const TIDE_CASES=Object.freeze(STUDY.dataSets[0].rows.map(row=>Object.freeze(row)));
export const TIDE_CYCLES_SPEC=buildModellingPass3(STUDY);
