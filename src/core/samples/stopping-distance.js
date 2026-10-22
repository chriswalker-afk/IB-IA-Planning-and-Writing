import {buildModellingPass3} from './modelling-pass3-helpers.js';
const STUDY={
  "id": "stopping-distance",
  "routeId": "fitted-models",
  "title": "When a straight-line stopping model becomes misleading",
  "course": "AI SL",
  "mathSelected": [
    "AI04",
    "AI09"
  ],
  "technologyStage": 2,
  "description": "A complete fictional comparison of linear and physically motivated quadratic stopping-distance models, with reserved predictions, residuals and reaction-time sensitivity.",
  "provenance": "Stopping Distance Design Cases v1: 14 explicitly constructed (speed in km/h, total distance in m) pairs, generated from s=0.5v+0.006v² plus a fixed small signed perturbation and rounded to 0.01 m. Speeds 20–70 km/h (11 cases) are the prespecified fitting set; 75, 80 and 85 km/h (three cases) were held out. These are not measured stopping distances, a published traffic dataset, braking trials or road-safety recommendations.",
  "citation": "Stopping Distance Design Cases v1, original constructed teaching data in this project; not a published or experimentally observed dataset.",
  "readingNote": "Fictional case study. Speed–distance values are constructed; the 75–85 km/h cases are a reserved numerical check and do not validate braking behaviour on real roads.",
  "idea": "A straight line may appear useful for estimating total stopping distance at low speeds, but I suspect it will miss how braking distance grows.",
  "aim": "I want to compare a straight-line model and a model with reaction and braking terms for the 11 constructed speed–distance cases at \\(20\\) to \\(70\\text{ km h}^{-1}\\), then test their distance predictions at three reserved speeds from \\(75\\) to \\(85\\text{ km h}^{-1}\\). I will also ask how a change in reaction time affects an estimate at \\(60\\text{ km h}^{-1}\\).",
  "motivation": "I am interested in why small changes in driving speed can produce larger changes in a predicted distance. I want to see when a straight-line approximation ceases to answer even a controlled modelling question.",
  "beneficiary": "I would use the result to understand the difference between convenient statistical interpolation and a model with interpretable terms, not to advise real drivers.",
  "intendedUse": "Choose which model is more defensible for the constructed domain and explain how a reaction-time assumption changes its meaning.",
  "prediction": "I expect the straight line to underestimate the largest reserved distances because the braking part grows faster than speed.",
  "predictionWhy": "Under an ideal constant braking deceleration, braking distance is proportional to the square of speed; the distance travelled during reaction is proportional to speed.",
  "predictionImplication": "A fit that looks acceptable near the middle may be misleading near the high end, and the effect may be large compared with the small rounding in the constructed values.",
  "firstAction": "Keep the 11 fitting cases separate from the three reserved values, then make a scatter and fit a linear baseline.",
  "readinessImprovement": "I have fixed the fitting/validation split and the generating units before comparing fitted parameters.",
  "teacherQuestion": "Is the contrast between a fitted baseline, an interpretable quadratic term and held-out model error within my selected syllabus scope?",
  "methodRecord": "I retained all 14 supplied pairs and prespecified that only speeds 20–70 would determine the coefficients. I calculated ordinary least squares for a line and constrained least squares for a quadratic with zero intercept, then compared both against the same three reserved distances.",
  "sourcePopulation": "These 14 constructed speed–distance cases only; they are not a sample of roads, vehicles or motorists.",
  "sampleSize": "11 fitting cases and three reserved numerical checks.",
  "pairing": "Each distance stays paired with its own speed. The three highest-speed cases are not used in fitting.",
  "modelEvidence": "One constructed series on 20–85 km/h with a fixed 20–70 km/h model-fitting range.",
  "inputs": "\\(v\\) in km/h; total stopping distance \\(s\\) in m. The speed-to-metres-per-second conversion is \\(u=v/3.6\\). The constructed records were generated from \\(s=0.5v+0.006v^2\\) with small preset deviations; I fitted the two candidate models without treating that recipe as independent physical evidence.",
  "assumptions": "I use an idealised constant reaction time and constant braking deceleration when interpreting the quadratic's positive coefficients. Road gradient, tyre grip, traffic, braking system and individual human variation are all outside the model.",
  "domain": "Fit only on \\(20\\le v\\le70\\text{ km h}^{-1}\\); compare against supplied constructed cases at \\(75,80,85\\text{ km h}^{-1}\\). I make no claims outside \\(20\\)–\\(85\\text{ km h}^{-1}\\), or about real driving.",
  "validation": "I froze the three high-speed cases before fitting. I report separate root mean squared errors for fitting and reserved cases, as well as the three individual signed reserved residuals.",
  "alternative": "A straight line with a freely fitted intercept is a simple baseline, while a zero-intercept quadratic with separate v and v² terms encodes the proposed reaction-plus-braking structure. A free three-coefficient polynomial could reduce training error but weaken the physical interpretation.",
  "chosenMethod": "Fit a least-squares line, inspect its residuals, then fit the constrained s=av+bv² model to the same 11 cases and compare the three reserved values.",
  "methodReason": "My question concerns both the mathematical shape and the meaning of the coefficients. A linear baseline reveals whether its residuals curve; the two-term model corresponds to separate distance mechanisms under explicit assumptions.",
  "methodLimit": "A constructed series was partly designed to resemble a quadratic, so agreement with it cannot establish a real braking law. Both fits are conditional descriptions of the supplied numbers.",
  "consequence": "A small within-range error may hide larger reserved-case errors; a coefficient interpretation is only as credible as the ideal physical assumptions.",
  "mitigation": "I disclose the generating formula, retain all cases, separate the reserved set and calculate prediction errors and a reaction-time sensitivity independently.",
  "acceptable": "This is an illustration of modelling, not evidence for selecting a safe following distance or a real-world stopping rule.",
  "changedSincePlanning": "The curved linear residuals supported my initial suspicion. The reserved cases, not the training fit alone, became my deciding comparison.",
  "dataStatusSummary": "All 14 fixed constructed pairs are in the source record. I fitted with 11 and retained the final three for a held-out arithmetic test.",
  "dataAimLink": "I first plotted total stopping distance \\(s\\) against speed \\(v\\). I did not treat stopping distance and braking distance as synonyms: the response combines a reaction term and a braking term. A line is a deliberate baseline, not my assumed physical law.",
  "firstEvaluation": "A scatter with an automatically fitted straight line is transparent and leaves individual cases visible. It cannot by itself distinguish reaction from braking or show whether the largest distances are predicted well.",
  "definitions": "\\(v\\): speed in km/h; \\(u=v/3.6\\): speed in m/s; \\(s\\): total stopping distance in m; \\(r=s-\\widehat s\\): signed model residual in m. My quadratic \\(\\widehat s=av+bv^2\\) has no constant term, unlike the fitted baseline \\(\\widehat s=p+qv\\).",
  "firstPresentation": "Figure 1 contains the 11 fitting pairs and the unrestricted least-squares line. Reserved cases are not shown or fitted here.",
  "accuracyQuantity": "Constructed speed and stopping distance",
  "accuracySymbol": "v, s",
  "accuracyUnit": "km/h; m",
  "accuracyResolution": "Speeds are set 5 km/h apart and distances are rounded to 0.01 m in the fictional cases; neither is a tested instrument resolution.",
  "accuracyPolicy": "Fit with unrounded arithmetic and quote distances to 0.01 m; a separately specified ±0.25 s reaction-time change is a scenario, not a confidence limit.",
  "accuracyReason": "I preserved the 11-to-three split and full coefficients. Rounding the input distance is much smaller than the difference between the models' reserved predictions.",
  "specialistTerms": "Reaction distance is u times an assumed reaction time; ideal constant-deceleration braking gives u²/(2d). Their sum, not either component alone, is total modelled stopping distance.",
  "predictionComparison": "As expected, the straight-line residuals bend and its three high-speed errors are all positive. The constrained quadratic tracks those reserved constructed cases much more closely.",
  "benefitFinding": "The model comparison shows why curvature, interpretation and an independent prediction check are more useful than reporting just one regression score.",
  "surpriseReason": "The quadratic fit is interpretable, but a modest change in assumed reaction time moves the 60 km/h estimate by metres rather than centimetres.",
  "surpriseCheck": "I changed the reaction-time term by ±0.25 s without refitting the invented dataset and calculated the resulting distance change exactly.",
  "courseConcern": "I use least squares, residuals, quadratic functions and speed-unit conversion; the constant-deceleration interpretation is explained as an ideal assumption rather than a verified physical result.",
  "technologyTool": "Graph plotter and calculator",
  "technologyInput": "The 11 speed–distance pairs and the zero-intercept least-squares equations for coefficients a and b.",
  "technologyOutcome": "The line was \\(\\widehat s=-10.59091+1.03909v\\); the two-term quadratic was \\(\\widehat s=0.501893v+0.00597024v^2\\).",
  "technologyInterpretation": "I used the fitted expressions to compute the errors directly rather than choosing a curve because it appears visually smoother.",
  "courseWhy": "The investigation develops a quantitative comparison of linear versus quadratic models with a genuine held-out arithmetic check and a parameter-based sensitivity analysis.",
  "mathsLearning": "I learned that fitting data and interpreting a physical mechanism are separate tasks, and that a small training error cannot justify unsupported extrapolation.",
  "introduction": "I wondered why a straight-line rule can feel convenient even when a physical process is expected to curve. Stopping distance was an appealing example because I can separate two simple effects in a model: distance travelled during reaction and distance travelled while braking. I am not attempting to give driving advice.\n \nI constructed a fourteen-case speed–distance table for speeds from \\(20\\) to \\(85\\text{ km h}^{-1}\\), with distances in metres. My aim is to compare a straight line with an \\(av+bv^2\\) model, fit both using the first eleven cases and test their distance estimates against the last three. I fixed that split before fitting.\n \nI expected a straight line to fall below the high-speed cases. I also wanted to ask whether an apparently accurate formula is still useful when its assumed reaction time changes. The observations are constructed teaching values; no real car was driven or tested.",
  "dataNotes": "Stopping Distance Design Cases v1 [D1] was constructed by evaluating \\(s=0.5v+0.006v^2\\) on the fourteen specified speeds, adding the signed offsets \\(0.4,-0.5,0.2,-0.3,0.5,0,-0.4,0.3,-0.1,0.4,-0.3,0.4,-0.5,0.2\\) metres, and rounding to \\(0.01\\text{ m}\\). This is the complete generation recipe. I preserve each speed–distance pair and its order; the highest three are reserved from both fits.\n \nThe baseline fits \\(s=p+qv\\), so it is free to have a nonzero intercept even though that intercept would be unphysical at zero speed. My alternative fits \\(s=av+bv^2\\) with intercept fixed at zero. For physical interpretation only, ideal motion with reaction time \\(\\tau\\) seconds and constant deceleration \\(d\\) in \\(\\text{m s}^{-2}\\) gives \\(s=(\\tau/3.6)v+v^2/(2d(3.6)^2)\\). That expression motivates the two terms; the constructed fit does not measure either parameter independently.",
  "stages": [
    {
      "key": "baseline",
      "title": "Fitting a simple baseline before choosing a curve",
      "methodId": "linear-regression",
      "kind": "model",
      "technique": "Least-squares straight-line fit",
      "bridge": "I began with the simplest numerical description of total distance against speed.",
      "purpose": "Figure 1 shows all eleven fitting pairs without the three reserved cases. I calculate a line to establish a baseline against which a more structural model can be judged.",
      "result": "For the eleven fitting cases \\(v=20,25,\\ldots,70\\), I used the least-squares rule \\(s=p+qv\\), with\n\\[\nq=\\frac{\\sum(v-\\overline v)(s-\\overline s)}{\\sum(v-\\overline v)^2},\n\\quad p=\\overline s-q\\overline v.\n\\]\nThis gives \\(\\widehat s_L=-10.590909+1.03909091v\\) metres. Its fitting root mean square error, \\(\\sqrt{\\sum(s-\\widehat s_L)^2/11}\\), is approximately \\(1.3674\\text{ m}\\). The negative intercept illustrates why a convenient statistical line must not be interpreted as the physical distance rule down to \\(v=0\\).",
      "observationText": "The distances rise increasingly quickly with speed; the straight line passes through the middle but does not follow the ends.",
      "interpretation": "The linear model gives a useful middle-range summary, but the negative extrapolated intercept and visible curvature are reasons to inspect residuals before answering the prediction question.",
      "limitations": "A fitted line with nonzero intercept does not separate reaction from braking and is not meaningful near zero or beyond the constructed range.",
      "localTakeaway": "My baseline is \\(\\widehat s_L=-10.590909+1.039091v\\), with about \\(1.3674\\text{ m}\\) fitting RMSE.",
      "nextQuestion": "Is the baseline error random-looking, or does its pattern suggest a missing dependence on speed?",
      "nextWhy": "An average error alone does not show whether the formula is systematically high or low at different speeds.",
      "mathsInsight": "A fitted model's intercept can improve the training fit while violating a proposed physical boundary condition.",
      "methodChangeReason": "The visible curvature called for a residual plot to diagnose the line rather than silently replacing it.",
      "outcomeId": "systematic"
    },
    {
      "key": "linear-residuals",
      "title": "Reading the systematic residual pattern",
      "methodId": "linear-regression",
      "kind": "model",
      "technique": "Signed residuals and domain checking",
      "bridge": "The line's fitting RMSE hid where its errors occur. I calculated one residual for each of its eleven fitted cases.",
      "purpose": "Figure 2 plots signed residual s minus linear prediction, with the horizontal zero reference; I retained all eleven points.",
      "result": "At \\(v=20\\), the linear formula predicts about \\(10.1909\\text{ m}\\), compared with the constructed \\(12.80\\text{ m}\\), giving \\(r_L\\approx+2.6091\\text{ m}\\). At \\(v=45\\), it predicts \\(36.1682\\text{ m}\\) versus \\(34.65\\text{ m}\\), giving \\(r_L\\approx-1.5182\\text{ m}\\). At \\(v=70\\), it predicts \\(62.1455\\text{ m}\\) versus \\(64.10\\text{ m}\\), giving \\(r_L\\approx+1.9545\\text{ m}\\). The positive–negative–positive sequence forms a U-shaped residual pattern.\n \nThe line is not merely noisy: its middle errors differ systematically in sign from the errors near the endpoints. The direction is consistent with a positive \\(v^2\\) term. I cannot establish that term from the residual plot alone, so I next fit a constrained candidate.",
      "observationText": "The baseline residuals have a U-shaped pattern with positive errors at both ends of the fitted range.",
      "interpretation": "A model may have a tolerable overall error but miss the shape of the data. The U-pattern gives a reason for a quadratic comparison; increasing polynomial degree without interpretation would be weaker.",
      "limitations": "The residual pattern was partly designed into the constructed values, so this diagnostic demonstrates the model choice but is not empirical evidence about vehicle mechanics.",
      "localTakeaway": "The line underpredicts at 20 and 70 km/h and overpredicts around 45 km/h; a quadratic comparison is justified.",
      "nextQuestion": "Does a zero-intercept quadratic remove the residual structure while allowing interpretable reaction and braking terms?",
      "nextWhy": "The quadratic offers both curvature and a physical boundary condition that the original fitted line lacks.",
      "mathsInsight": "Where the errors occur matters as much as their root mean square magnitude.",
      "methodChangeReason": "I chose the smallest additional speed term consistent with the assumed distance mechanisms.",
      "outcomeId": "quadratic-plausible"
    },
    {
      "key": "quadratic",
      "title": "Fitting a reaction-plus-braking quadratic",
      "methodId": "quadratic-fit",
      "kind": "model",
      "technique": "Constrained least squares for two polynomial terms",
      "bridge": "The residual pattern suggested a quadratic. I imposed zero distance at zero speed in the model itself, rather than fitting an unconstrained second-degree polynomial.",
      "purpose": "Figure 3 overlays the linear baseline and my entered quadratic on the same eleven speed–distance pairs. Both use identical fitting cases.",
      "result": "I minimise \\(\\sum_{i=1}^{11}(s_i-av_i-bv_i^2)^2\\). Differentiating this sum with respect to \\(a\\) and \\(b\\) leads to\n\\[\na\\sum v_i^2+b\\sum v_i^3=\\sum v_i s_i,\\qquad\na\\sum v_i^3+b\\sum v_i^4=\\sum v_i^2s_i.\n\\]\nSolving gives \\(a\\approx0.50189311\\) and \\(b\\approx0.00597024\\), hence\n\\[\n\\widehat s_Q=0.50189311v+0.00597024v^2.\n\\]\nThe fitting RMSE falls to approximately \\(0.3430\\text{ m}\\). Under the ideal model \\(s=(\\tau/3.6)v+v^2/(2d(3.6)^2)\\), these coefficients correspond to \\(\\tau\\approx1.8068\\text{ s}\\) and \\(d\\approx6.4621\\text{ m s}^{-2}\\). These are parameter interpretations in the constructed model, not estimates of real reaction time or tyre friction.",
      "observationText": "The constrained curve follows the two ends of the constructed series better than the baseline.",
      "interpretation": "The quadratic has fewer systematic errors on the fitting set, and its two terms can be linked to distinct hypothetical mechanisms. The improvement is not independent validation; I next evaluate the reserved speeds without changing either fit.",
      "limitations": "Because I constructed the cases using a quadratic starting rule, a better quadratic fit is an expected result. It cannot establish a universal braking law.",
      "localTakeaway": "The constrained model is \\(\\widehat s_Q=0.50189311v+0.00597024v^2\\), with \\(0.3430\\text{ m}\\) fitting RMSE.",
      "nextQuestion": "How do the two fixed models perform on the three speeds they have not seen, and how sensitive is the choice to reaction time?",
      "nextWhy": "The comparison matters only if improved training fit translates into meaningfully better independent numerical predictions.",
      "mathsInsight": "Constraining the intercept changes both the fitted coefficients and the interpretation; it is not the same as ordinary unconstrained quadratic regression.",
      "methodChangeReason": "I froze the two models before checking the reserved records and changed the objective from description to prediction.",
      "outcomeId": "model-fit"
    },
    {
      "key": "reserved-check",
      "title": "Reserved speeds and a reaction-time sensitivity",
      "methodId": "follow-journey",
      "kind": "model",
      "technique": "Prediction errors and parameter sensitivity",
      "bridge": "Both models are now fixed. I used only their coefficients and the three values I kept out of the fitting process.",
      "purpose": "Table 1 shows the two model predictions at every reserved speed alongside the supplied distance; the calculated differences are signed as observed minus predicted.",
      "result": "The reserved observed distances at \\(75,80,85\\text{ km h}^{-1}\\) are \\(71.65,77.90,86.05\\text{ m}\\). The line's signed errors are approximately \\(+4.309,+5.364,+8.318\\text{ m}\\), producing a reserved RMSE of \\(6.2324\\text{ m}\\). For the constrained quadratic, they are approximately \\(+0.425,-0.461,+0.254\\text{ m}\\), giving reserved RMSE \\(0.3907\\text{ m}\\). I did not refit with these cases.\n \nAt \\(60\\text{ km h}^{-1}\\), my quadratic gives \\(\\widehat s_Q\\approx51.6065\\text{ m}\\), split into about \\(30.1136\\text{ m}\\) from the \\(av\\) term and \\(21.4929\\text{ m}\\) from \\(bv^2\\). At \\(60/3.6\\text{ m s}^{-1}\\), a separate hypothetical reaction-time change of \\(\\pm0.25\\text{ s}\\) changes the total by\n\\[\n\\Delta s=\\frac{60}{3.6}(\\pm0.25)=\\pm4.1667\\text{ m}.\n\\]\nThus reaction-time variation is substantially larger than the quadratic's error against this particular fictional training set.",
      "observationText": "The linear reserved errors increase at high speeds, whereas the quadratic's three errors stay below half a metre in magnitude.",
      "interpretation": "I prefer the quadratic for describing the constructed cases and checking 75–85 km/h within this designed example. I would not use either formula for real road decisions; untested conditions and reaction time can dominate the neat regression residual.",
      "limitations": "These three held-out values were generated by the same invented mechanism and are not an external experiment. A ±0.25 s scenario is not a measured uncertainty interval. Speeds beyond 85 km/h are unsupported.",
      "localTakeaway": "Held-out RMSE is 6.2324 m for the line versus 0.3907 m for the constrained quadratic, while a hypothetical quarter-second reaction change shifts the 60 km/h estimate by 4.1667 m.",
      "nextQuestion": "Would an actual independent braking dataset support these parameter assumptions over any specified conditions?",
      "nextWhy": "The current material cannot distinguish a mathematically well-matched constructed curve from reliable physical prediction.",
      "mathsInsight": "The error caused by an uncertain model parameter can be far larger than its error against intentionally regular training cases.",
      "methodChangeReason": "A parameter scenario addresses robustness; it is not a third fit or an extra set of observations.",
      "outcomeId": "constraints"
    }
  ],
  "figures": [
    {
      "id": "p3-stop-linear",
      "tool": "graph",
      "stage": 0,
      "after": "result",
      "title": "Constructed speed–distance pairs with linear baseline",
      "number": 1,
      "columns": [
        "Speed (km/h)",
        "Total distance (m)"
      ],
      "rows": [
        [
          20,
          12.8
        ],
        [
          25,
          15.75
        ],
        [
          30,
          20.6
        ],
        [
          35,
          24.55
        ],
        [
          40,
          30.1
        ],
        [
          45,
          34.65
        ],
        [
          50,
          39.6
        ],
        [
          55,
          45.95
        ],
        [
          60,
          51.5
        ],
        [
          65,
          58.25
        ],
        [
          70,
          64.1
        ]
      ],
      "xLabel": "Speed",
      "yLabel": "Total stopping distance",
      "xSymbol": "v",
      "ySymbol": "s",
      "xUnit": "km/h",
      "yUnit": "m",
      "xMin": 18,
      "xMax": 72,
      "yMin": 5,
      "yMax": 70,
      "models": [
        {
          "id": "model-stop-line",
          "type": "linear",
          "visible": true
        }
      ],
      "caption": "Eleven constructed fitting pairs only. The least-squares line is a baseline, not a real stopping-distance rule."
    },
    {
      "id": "p3-stop-residual",
      "tool": "graph",
      "stage": 1,
      "after": "result",
      "title": "Linear-baseline residuals across speed",
      "number": 2,
      "columns": [
        "Speed (km/h)",
        "Residual (m)"
      ],
      "rows": [
        [
          20,
          2.6091
        ],
        [
          25,
          0.3636
        ],
        [
          30,
          0.0182
        ],
        [
          35,
          -1.2273
        ],
        [
          40,
          -0.8727
        ],
        [
          45,
          -1.5182
        ],
        [
          50,
          -1.7636
        ],
        [
          55,
          -0.6091
        ],
        [
          60,
          -0.2545
        ],
        [
          65,
          1.3
        ],
        [
          70,
          1.9545
        ]
      ],
      "xLabel": "Speed",
      "yLabel": "Linear residual",
      "xSymbol": "v",
      "ySymbol": "r",
      "xUnit": "km/h",
      "yUnit": "m",
      "xMin": 18,
      "xMax": 72,
      "yMin": -3,
      "yMax": 4,
      "models": [
        {
          "id": "model-stop-zero",
          "type": "custom",
          "expression": "0",
          "visible": true
        }
      ],
      "caption": "Positive residual means supplied total distance exceeds the baseline prediction. Zero is an error reference, not measured data.",
      "calculated": true
    },
    {
      "id": "p3-stop-overlay",
      "tool": "graph",
      "stage": 2,
      "after": "result",
      "title": "Fixed linear and zero-intercept quadratic models",
      "number": 3,
      "columns": [
        "Speed (km/h)",
        "Total distance (m)"
      ],
      "rows": [
        [
          20,
          12.8
        ],
        [
          25,
          15.75
        ],
        [
          30,
          20.6
        ],
        [
          35,
          24.55
        ],
        [
          40,
          30.1
        ],
        [
          45,
          34.65
        ],
        [
          50,
          39.6
        ],
        [
          55,
          45.95
        ],
        [
          60,
          51.5
        ],
        [
          65,
          58.25
        ],
        [
          70,
          64.1
        ]
      ],
      "xLabel": "Speed",
      "yLabel": "Total stopping distance",
      "xSymbol": "v",
      "ySymbol": "s",
      "xUnit": "km/h",
      "yUnit": "m",
      "xMin": 18,
      "xMax": 72,
      "yMin": 5,
      "yMax": 70,
      "models": [
        {
          "id": "model-stop-lin",
          "type": "linear",
          "visible": true
        },
        {
          "id": "model-stop-quad",
          "type": "custom",
          "expression": "0.50189311*x+0.00597024*x^2",
          "visible": true
        }
      ],
      "caption": "The custom quadratic is the explicitly constrained s=av+bv² fit, not an unconstrained quadratic regression. The baseline and candidate share the same 11 fitting cases."
    },
    {
      "id": "p3-stop-held",
      "tool": "table",
      "stage": 3,
      "after": "result",
      "title": "Predictions at the three reserved speeds",
      "number": 1,
      "columns": [
        "v",
        "Supplied s",
        "Linear",
        "Quadratic",
        "Residuals L/Q"
      ],
      "rows": [
        [
          75,
          71.65,
          67.34,
          71.22,
          "4.309 / 0.425"
        ],
        [
          80,
          77.9,
          72.54,
          78.36,
          "5.364 / -0.461"
        ],
        [
          85,
          86.05,
          77.73,
          85.8,
          "8.318 / 0.254"
        ]
      ],
      "units": [
        "km/h",
        "m",
        "m",
        "m",
        "m"
      ],
      "note": "Signed supplied−predicted residuals in last column are shown as linear / constrained quadratic. All predictions use the fitted coefficients without the held-out speeds.",
      "calculated": true
    }
  ],
  "dataSets": [
    {
      "name": "Stopping Distance Design Cases v1 — complete fixed input",
      "columns": [
        "Speed km/h",
        "Total distance m",
        "Split"
      ],
      "rows": [
        [
          20,
          12.8,
          "fit"
        ],
        [
          25,
          15.75,
          "fit"
        ],
        [
          30,
          20.6,
          "fit"
        ],
        [
          35,
          24.55,
          "fit"
        ],
        [
          40,
          30.1,
          "fit"
        ],
        [
          45,
          34.65,
          "fit"
        ],
        [
          50,
          39.6,
          "fit"
        ],
        [
          55,
          45.95,
          "fit"
        ],
        [
          60,
          51.5,
          "fit"
        ],
        [
          65,
          58.25,
          "fit"
        ],
        [
          70,
          64.1,
          "fit"
        ],
        [
          75,
          71.65,
          "reserve"
        ],
        [
          80,
          77.9,
          "reserve"
        ],
        [
          85,
          86.05,
          "reserve"
        ]
      ],
      "sourceText": "Synthetic data with the explicit formula and perturbation list recorded in the introduction."
    },
    {
      "name": "Stopping model predictions — complete working",
      "columns": [
        "Speed",
        "Observed distance",
        "Linear prediction",
        "Quadratic prediction",
        "Linear residual",
        "Quadratic residual",
        "Split"
      ],
      "rows": [
        [
          20,
          12.8,
          10.190909090909077,
          12.425959412,
          2.6090909090909236,
          0.3740405880000015,
          "fit"
        ],
        [
          25,
          15.75,
          15.386363636363622,
          16.278729627500002,
          0.3636363636363775,
          -0.5287296275000024,
          "fit"
        ],
        [
          30,
          20.6,
          20.581818181818168,
          20.430011988,
          0.01818181818183362,
          0.16998801200000102,
          "fit"
        ],
        [
          35,
          24.55,
          25.777272727272713,
          24.8798064935,
          -1.2272727272727124,
          -0.3298064934999978,
          "fit"
        ],
        [
          40,
          30.1,
          30.97272727272726,
          29.628113143999997,
          -0.872727272727257,
          0.4718868560000047,
          "fit"
        ],
        [
          45,
          34.65,
          36.16818181818181,
          34.6749319395,
          -1.5181818181818088,
          -0.024931939500000055,
          "fit"
        ],
        [
          50,
          39.6,
          41.363636363636346,
          40.020262880000004,
          -1.7636363636363441,
          -0.4202628800000028,
          "fit"
        ],
        [
          55,
          45.95,
          46.5590909090909,
          45.6641059655,
          -0.6090909090908951,
          0.2858940345000036,
          "fit"
        ],
        [
          60,
          51.5,
          51.754545454545436,
          51.606461196,
          -0.2545454545454362,
          -0.10646119599999793,
          "fit"
        ],
        [
          65,
          58.25,
          56.949999999999974,
          57.8473285715,
          1.3000000000000256,
          0.4026714284999997,
          "fit"
        ],
        [
          70,
          64.1,
          62.14545454545453,
          64.38670809199999,
          1.9545454545454675,
          -0.2867080919999978,
          "fit"
        ],
        [
          75,
          71.65,
          67.34090909090908,
          71.22459975749999,
          4.309090909090926,
          0.42540024250001807,
          "reserve"
        ],
        [
          80,
          77.9,
          72.53636363636362,
          78.361003568,
          5.363636363636388,
          -0.4610035679999953,
          "reserve"
        ],
        [
          85,
          86.05,
          77.73181818181816,
          85.7959195235,
          8.318181818181841,
          0.2540804764999933,
          "reserve"
        ]
      ],
      "sourceText": "Working calculations from the complete constructed case set. Reserved speeds were not used to determine either fit."
    }
  ],
  "conclusion": {
    "mainConclusion": "For Stopping Distance Design Cases v1, I prefer the constrained model \\(\\widehat s_Q=0.50189311v+0.00597024v^2\\) to the straight line. The U-shaped baseline residuals identify a mathematical feature missing from the line; the quadratic reduces fitting RMSE from about \\(1.3674\\text{ m}\\) to \\(0.3430\\text{ m}\\). On the three prespecified reserved speeds, it reduces RMSE from about \\(6.2324\\text{ m}\\) to \\(0.3907\\text{ m}\\). This answers the comparison for these constructed records, not for actual vehicles.",
    "conclusionBenefit": "At \\(60\\text{ km h}^{-1}\\) the quadratic predicts about \\(51.61\\text{ m}\\), but changing only the hypothetical reaction time by \\(\\pm0.25\\text{ s}\\) moves that distance by \\(\\pm4.17\\text{ m}\\). This matters more to my original question than the neat fit: interpreting the two terms and examining a meaningful assumption give a more qualified answer than reporting a regression score.",
    "conclusionExtension": "To investigate real stopping behaviour I would need independently collected, permissioned observations with a specified vehicle, surface, braking procedure, timing method and documented uncertainty, plus genuinely unseen trials for checking. I have not performed those tests and would not use this fictional curve for road-safety guidance."
  },
  "review": {
    "story": "I completed a line, residual diagnosis, constrained quadratic, held-out comparison and reaction-time sensitivity; each supports the same final model judgement.",
    "sequence": "Curved scatter leads to baseline, U-shaped residuals to a physically motivated quadratic, and fitted parameters to reserved predictions and sensitivity.",
    "notation": "I distinguished km/h from m/s, total distance from braking distance, baseline residual from quadratic residual, and invented precision from uncertainty.",
    "purpose": "The decision concerns which constructed model is defensible, not a recommended safe stopping distance.",
    "limits": "The model is deliberately synthetic; the coefficients cannot validate real reaction times, grip or braking.",
    "calculations": "I recomputed both least-squares models and all three reserved errors; the 60 km/h reaction-time shift uses v/3.6.",
    "presentation": "The baseline, residual graph, overlay and held-out table appear adjacent to their interpretations.",
    "sources": "The data recipe and all 14 invented values are declared, with the reserved allocation explicit.",
    "figures": "Three native graphs and one native table use the same case IDs and calculated values as the text.",
    "technology": "The regression parameters and RMSE figures come from the 11 training pairs; they do not come from the reserved set."
  }
};
export const STOPPING_CASES=Object.freeze(STUDY.dataSets[0].rows.map(row=>Object.freeze(row)));
export const STOPPING_DISTANCE_SPEC=buildModellingPass3(STUDY);
