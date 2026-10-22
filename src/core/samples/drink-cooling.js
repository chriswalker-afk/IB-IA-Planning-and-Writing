import {buildModellingPass3} from './modelling-pass3-helpers.js';
const STUDY={
  "id": "drink-cooling",
  "routeId": "growth",
  "title": "When will a cooling drink reach 50 °C?",
  "course": "AI SL",
  "mathSelected": [
    "AI02",
    "AI06"
  ],
  "technologyStage": 1,
  "description": "A complete constructed cooling study: ambient-offset exponential regression, a reserved-temperature check, an interpolated crossing and ambient-model sensitivity.",
  "provenance": "Cooling Cup Cases v1: sixteen constructed two-minute temperature entries from 0 to 30 minutes. They were generated from T=26+58 exp(-0.04t) °C with the fixed offsets (0,0.2,-0.2,0.1,-0.1,0.2,-0.15,0.1,-0.1,0.15,-0.1,0.1,-0.1,0.15,-0.2,0.1) °C, then rounded to 0.1 °C. Entries at 0–20 min were allocated to modelling; 22–30 min to a prespecified check. The ambient 26 °C and alternative 25/27 °C scenarios are assumptions, not measured room temperatures.",
  "citation": "Cooling Cup Cases v1. Original deliberately constructed data and generation recipe supplied in this project; no physical cup or thermometer was used.",
  "readingNote": "Fictional study using sixteen constructed cooling values and a defined 26 °C room. The model crossing is not a test of a real drink.",
  "idea": "I want to estimate the time at which a hot drink passes a chosen temperature, while accounting for the fact it cools towards room temperature rather than zero.",
  "aim": "How accurately does an exponential model of the difference from a stated \\(26\\,^\\circ\\mathrm C\\) ambient temperature estimate when my constructed drink passes \\(50\\,^\\circ\\mathrm C\\), and how does changing the assumed ambient temperature to \\(25\\) or \\(27\\,^\\circ\\mathrm C\\) affect that result?",
  "motivation": "A hot drink changes temperature rapidly at first and more slowly as it approaches the room. I wanted to find a mathematically meaningful 'ready' time rather than subtracting the same number of degrees every minute.",
  "beneficiary": "I would use the result to understand a modelled threshold time for this hypothetical cup, not to judge drinking safety or a real person's preference.",
  "intendedUse": "Compare an exponential threshold crossing with the supplied later readings and test whether the ambient assumption materially changes the conclusion.",
  "prediction": "I expect the excess temperature to decrease by roughly the same proportion over equal two-minute intervals, making a logarithm useful for estimating the crossing.",
  "predictionWhy": "A model in which the rate is proportional to excess temperature approaches the ambient level but does not decay to absolute zero degrees Celsius.",
  "predictionImplication": "If the model is suitable over the specified window, a target above ambient can be solved by taking a logarithm, but the answer should be checked against later values.",
  "firstAction": "Plot temperature by time and inspect the differences and ratios of temperature above 26 °C.",
  "readinessImprovement": "The ambient datum, decimal convention and training/checking split were fixed before taking logarithms.",
  "teacherQuestion": "Does the ambient-offset exponential fitting and threshold-sensitivity discussion give an adequately purposeful investigation for AI SL?",
  "methodRecord": "I preserved all sixteen constructed times and temperatures. I used only t=0–20 min to fit log(T−26) versus time, then checked the 22–30 min entries without refitting.",
  "sourcePopulation": "Only this declared constructed cup-in-room scenario, not a population of drinks or recorded experiments.",
  "sampleSize": "16 constructed readings at two-minute steps; 11 for fitting, five reserved.",
  "pairing": "Each temperature belongs to the exact time at which the fictional record places it; I preserve order and do not sort temperatures separately.",
  "modelEvidence": "A fixed 0–30 minute temperature sequence with 26 °C as its stated ambient datum.",
  "inputs": "Time \\(t\\) in minutes, \\(T\\) in degrees Celsius and excess \\(E=T-A\\) in Celsius degrees, where the initial assumed ambient level is \\(A=26\\,^\\circ\\mathrm C\\).",
  "assumptions": "A single constant ambient level, a constant fractional cooling rate over the fitted period, comparable readings, no reheating and no phase change. I did not verify heat loss or thermometer calibration experimentally.",
  "domain": "Model fitted for \\(0\\le t\\le20\\) min and numerically checked at \\(22,24,26,28,30\\) min. The modelled \\(50\\,^\\circ\\mathrm C\\) crossing is close to \\(22.07\\) min, inside the supplied checking window.",
  "validation": "The five later values remain separate from fitting. I compare their signed errors and independently locate the crossing by interpolation between the 22- and 24-minute constructed entries.",
  "alternative": "A constant-rate linear cooling rule would ignore the ambient asymptote. A logarithm of raw temperature would incorrectly suggest cooling towards 0 °C; only log(T−A) matches the assumed model.",
  "chosenMethod": "Fit a straight line to log(T−26) against time, transform back to an exponential, inspect held-out temperature errors and compare threshold solutions after refitting with A=25,26,27.",
  "methodReason": "Taking logs makes an exponential excess-temperature model testable by a linear pattern, while preserving the physical meaning of room temperature.",
  "methodLimit": "The generating recipe itself is exponential, so a good fit is expected. A 0.1 °C display step is not evidence of thermometer accuracy, and a changing physical ambient would invalidate the constant-offset model.",
  "consequence": "A threshold computed from a good-looking trend can still be biased if the ambient datum or cooling conditions are wrong, especially for targets close to ambient.",
  "mitigation": "I held out later entries and re-estimated the rate under alternative ambient levels rather than merely altering the constant term after fitting.",
  "acceptable": "This comparison answers the numerical question for the fixed constructed series; no real drink-temperature prediction or safety claim is justified.",
  "changedSincePlanning": "The excess-temperature data were close to exponential as predicted. The held-out values and the ambient refits gave a more useful check than a high coefficient of fit alone.",
  "dataStatusSummary": "All sixteen synthetic values were retained in time order; 0–20 min is fitting material, 22–30 min is the checking portion.",
  "dataAimLink": "I plot \\(T\\) against \\(t\\) and calculate \\(E=T-26\\). Because my threshold \\(50\\,^\\circ\\mathrm C\\) is above room temperature, I can use a positive excess in a logarithm; fitting a raw \\(T=Ce^{-kt}\\) would have the wrong long-term limit.",
  "firstEvaluation": "The ordered time plot and the ambient reference identify the asymptote. The shape alone cannot quantify whether ratios are sufficiently stable, so the log transformation and residual check follow.",
  "definitions": "\\(t\\) is elapsed time in min; \\(A\\) is the assumed room temperature in °C; \\(T(t)\\) is drink temperature in °C; \\(E(t)=T(t)-A>0\\) is excess temperature; \\(B\\) is initial fitted excess; \\(k\\) is the decay constant in \\(\\mathrm{min}^{-1}\\).",
  "firstPresentation": "Figure 1 retains the complete time order and places a 26 °C ambient reference below the supplied temperatures. The model is fitted to the first eleven entries only.",
  "accuracyQuantity": "Constructed drink temperature and time",
  "accuracySymbol": "T, t",
  "accuracyUnit": "°C; min",
  "accuracyResolution": "Constructed temperatures are recorded to 0.1 °C and elapsed times at two-minute increments; no thermometer calibration or timer uncertainty has been measured.",
  "accuracyPolicy": "Use unrounded coefficients for logarithms and crossing times; report the threshold time to about 0.1 min as a model estimate, not a measurement.",
  "accuracyReason": "My time estimate is sensitive to the fitted decay model and ambient choice, not just the last displayed decimal place of a constructed temperature.",
  "specialistTerms": "Excess temperature is the amount by which a drink is hotter than its surroundings; its exponential decline approaches the ambient level from above. A half-life here means the time for excess temperature to halve in this model.",
  "predictionComparison": "The log-excess values are approximately linear and the exponential fit matches the five reserved temperatures closely, as expected from the constructed generating rule.",
  "benefitFinding": "I distinguished the ambient reference, the fitted decay rate, the 50 °C crossing, and the sensitivity of the modelled time to an uncertain room setting.",
  "surpriseReason": "A full ±1 °C change in the assumed ambient, with the rate refitted, moved the 50 °C time by only about 0.12 min across the two extremes.",
  "surpriseCheck": "I repeated the log regression at 25 and 27 °C, confirmed every log argument stayed positive, and solved the same 50 °C threshold each time.",
  "courseConcern": "The calculations use exponentials, logarithms, straight-line least squares and numerical residuals. I do not use a differential equation derivation.",
  "technologyTool": "Graph plotter, logarithms and least-squares calculator",
  "technologyInput": "Enter the eleven constructed pairs \\((t,\\ln(T-26))\\) for \\(t=0,2,\\ldots,20\\). Use the fitted slope and intercept for \\(T=26+Be^{-kt}\\).",
  "technologyOutcome": "The fitted intercept gives \\(B\\approx57.9929\\) and the slope gives \\(k\\approx0.0399816\\,\\mathrm{min}^{-1}\\). The \\(50\\,^\\circ\\mathrm C\\) solution is \\(t\\approx22.0668\\) min.",
  "technologyInterpretation": "I evaluated signed residuals in degrees Celsius on the original temperature scale and refitted the log line when changing ambient.",
  "courseWhy": "This uses AI SL exponential and logarithmic modelling with real purpose: estimate a threshold within a supplied checking range and decide how sensitive it is to the assumed ambient.",
  "mathsLearning": "I learned that a transformed fit is meaningful only if its offset and domain are justified, and that a parameter change can require a new fit rather than a cosmetic shift.",
  "introduction": "A hot drink cools quickly at first, then more slowly as it approaches the temperature of the room. I was interested in whether a mathematical model could give a specific time for a chosen temperature rather than assuming a constant drop each minute. I chose \\(50\\,^\\circ\\mathrm C\\) as the threshold for my fictional scenario, not as a universal safe drinking temperature.\n \nI prepared Cooling Cup Cases v1, a fully constructed series covering thirty minutes in a room whose temperature is assumed to remain \\(26\\,^\\circ\\mathrm C\\). My aim is to model the excess above ambient using the first eleven values, check the model against five reserved later values, then compare the threshold time when ambient is taken to be \\(25\\), \\(26\\) or \\(27\\,^\\circ\\mathrm C\\).\n \nI expected a roughly constant fractional decrease in excess temperature. I deliberately kept the later data out of the fitting calculation, so the threshold estimate has an additional numerical check.",
  "dataNotes": "Cooling Cup Cases v1 [D1] is constructed by evaluating \\(T=26+58e^{-0.04t}\\) at \\(t=0,2,\\ldots,30\\) minutes, adding the signed offsets \\(0,0.2,-0.2,0.1,-0.1,0.2,-0.15,0.1,-0.1,0.15,-0.1,0.1,-0.1,0.15,-0.2,0.1\\,^\\circ\\mathrm C\\), then rounding to the nearest \\(0.1\\,^\\circ\\mathrm C\\). That prescription produced all sixteen supplied values, without deletions. These records are neither thermometer readings nor a physical trial.\n \nThe ambient \\(26\\,^\\circ\\mathrm C\\) is a scenario setting, not a measured room temperature. I reserved entries at 22–30 minutes and used the earlier values for fitting. When I later test 25 and 27 °C, those are alternative modelling assumptions, not a new environment or newly collected data.",
  "stages": [
    {
      "key": "time-and-excess",
      "title": "Temperature, ambient level and successive changes",
      "methodId": "follow-journey",
      "kind": "model",
      "technique": "Time-series plot and excess-temperature ratios",
      "bridge": "To decide whether an exponential is appropriate, I first need to distinguish temperature itself from its difference above room temperature.",
      "purpose": "Figure 1 shows the sixteen supplied values and the fixed 26 °C ambient reference. I initially examine only the first eleven as a modelling set.",
      "result": "At \\(t=0\\), \\(E=T-26=58.0\\,^\\circ\\mathrm C\\). At \\(t=2\\), it is \\(53.7\\,^\\circ\\mathrm C\\), and at \\(t=4\\), it is \\(49.2\\,^\\circ\\mathrm C\\). The consecutive ratios are\n\\[\n\\frac{53.7}{58.0}\\approx0.9259,\\qquad\n\\frac{49.2}{53.7}\\approx0.9162.\n\\]\nThey are near one another but not identical. Raw temperature changes from \\(84.0\\) to \\(79.7\\) to \\(75.2\\,^\\circ\\mathrm C\\) are not constant differences. I therefore model \\(E\\), not \\(T\\), by a decreasing exponential and test the transformed values rather than requiring exact equal ratios.",
      "observationText": "The downward curve flattens and stays above the stipulated ambient reference. Two-minute excess ratios are near 0.92, not exactly constant.",
      "interpretation": "The level toward which the model cools matters. Treating zero Celsius as an asymptote would fit the wrong mathematical statement even if a short curve looked smooth.",
      "limitations": "The plot comes from a rule designed to be exponential and cannot establish actual cooling behaviour. A 26 °C reference is assumed, not recorded.",
      "localTakeaway": "Positive excess temperature falls by roughly a constant factor every two minutes, suggesting log(E) against t.",
      "nextQuestion": "What exponential model follows from the fitting-period values, and does the logarithmic transformation behave linearly?",
      "nextWhy": "Similar ratios motivate a candidate but are not yet fitted parameters or a prediction.",
      "mathsInsight": "An exponential of T−A and an exponential of T have fundamentally different limiting temperatures.",
      "methodChangeReason": "I moved from a qualitative sequence of ratios to an explicit fit of log excess.",
      "outcomeId": "multiplicative"
    },
    {
      "key": "log-regression",
      "title": "Estimating an exponential above room temperature",
      "methodId": "exponential",
      "kind": "model",
      "technique": "Natural-log transformation and straight-line regression",
      "bridge": "The data suggest a multiplicative change in excess temperature. Taking its natural logarithm lets me fit a straight line.",
      "purpose": "Figure 2 plots ln(T−26) over 0–20 minutes. Figure 3 overlays the back-transformed fitted curve with the full supplied temperature record, while the fit itself uses only the eleven earlier values.",
      "result": "For \\(E=T-26>0\\), I model\n\\[\n\\ln E=c-kt,\\qquad E=e^c e^{-kt}=Be^{-kt}.\n\\]\nLeast squares on the eleven fitting pairs gives \\(c\\approx\\ln(57.99289)\\) and slope \\(-k\\approx-0.039981565\\;\\mathrm{min}^{-1}\\). Therefore\n\\[\n\\widehat T(t)=26+57.99289e^{-0.039981565t}.\n\\]\nThe fitted initial temperature is \\(83.9929\\,^\\circ\\mathrm C\\), close to the supplied \\(84.0\\,^\\circ\\mathrm C\\). The model's excess-temperature half-life is \\(\\ln2/k\\approx17.34\\) min. I calculated residuals on the original Celsius scale; the fitting RMSE is approximately \\(0.1427\\,^\\circ\\mathrm C\\).",
      "observationText": "Log excess follows a near-straight trend over the eleven fitting times; the back-transformed curve remains above 26 °C.",
      "interpretation": "The decay constant has a defined unit and the ambient offset remains in the equation. The half-life concerns E rather than an absolute Celsius temperature. The close fit reflects the designed series, so I still need to check the excluded times.",
      "limitations": "Least squares on logarithms optimises transformed-scale errors, not temperature-scale squared errors. I report temperature residuals separately rather than treating those objectives as identical.",
      "localTakeaway": "The fitted curve is \\(\\widehat T=26+57.99289e^{-0.039981565t}\\); the excess half-life is about \\(17.34\\) minutes.",
      "nextQuestion": "Does this fixed curve reproduce the held-out temperatures near the chosen threshold, and where does it cross 50 °C?",
      "nextWhy": "The 50 °C decision requires a time, and the reserved later cases allow a check without refitting.",
      "mathsInsight": "A transformed model retains the physical offset when returning from logarithms.",
      "methodChangeReason": "I fixed the fitted parameters and evaluated errors in °C instead of choosing a curve by visual overlap.",
      "outcomeId": "model-fit"
    },
    {
      "key": "reserved-threshold",
      "title": "Testing the later temperatures and solving the crossing",
      "methodId": "exponential",
      "kind": "model",
      "technique": "Temperature residuals, logarithms and interpolation",
      "bridge": "The curve fitted 0–20 min well, but my threshold is later. I checked the five reserved readings without using them to adjust the formula.",
      "purpose": "Figure 4 plots all sixteen signed temperature residuals with a zero reference; the last five were not used in fitting.",
      "result": "The signed residuals at \\(t=22,24,26,28,30\\) min are approximately \\(+0.136,-0.115,+0.192,-0.232,+0.123\\,^\\circ\\mathrm C\\). Their RMSE is \\(0.1658\\,^\\circ\\mathrm C\\), compared with \\(0.1427\\,^\\circ\\mathrm C\\) on the fit period. The modest difference is a feature of the fixed invented series, not a population accuracy claim.\n \nSetting the exponential equal to \\(50\\) yields\n\\[\n50=26+57.99289e^{-0.039981565t},\\qquad\nt=\\frac{\\ln(57.99289/24)}{0.039981565}\n\\approx22.0668\\text{ min}.\n\\]\nThe logarithm argument is positive because the chosen target exceeds ambient. Independently, the supplied values \\(T(22)=50.2\\) and \\(T(24)=48.1\\) bracket 50 °C. Linear interpolation between these two readings gives \\(22+2(0.2/2.1)\\approx22.1905\\) min. The difference of about \\(0.124\\) min is a comparison of two mathematical approximations, not a measurement of actual crossing time.",
      "observationText": "The five reserved errors remain within about a quarter of a degree in this constructed sequence, with signs changing rather than drifting one way.",
      "interpretation": "The modelled crossing of about 22.1 min lies in a later interval already represented in the supplied data. The interpolation check suggests a similar answer, but neither model supplies physical certainty.",
      "limitations": "The interpolation uses only two times, so it assumes approximately linear change between readings. The supplied two-minute grid does not record the exact crossing.",
      "localTakeaway": "The exponential gives 22.0668 min and local linear interpolation gives about 22.1905 min for the constructed 50 °C crossing.",
      "nextQuestion": "Would a plausible one-degree change in the assumed room temperature change the modelled crossing enough to alter this result?",
      "nextWhy": "Room temperature is an assumption in the logarithm and both fitted parameters depend on it.",
      "mathsInsight": "A threshold above the ambient permits a meaningful logarithmic inverse; targets at or below ambient cannot be reached by this ideal decay from above in finite time.",
      "methodChangeReason": "I checked parameter sensitivity by refitting the same values under new ambient assumptions.",
      "outcomeId": "model-fit"
    },
    {
      "key": "ambient-sensitivity",
      "title": "Refitting at alternative ambient temperatures",
      "methodId": "follow-journey",
      "kind": "model",
      "technique": "Conditional parameter changes and threshold comparison",
      "bridge": "The fitted decay constant depended on subtracting 26 °C first. To test sensitivity honestly I repeated that transformation with different assumed ambient levels.",
      "purpose": "Table 1 shows the parameters refitted to exactly the same eleven training records with A=25,26,27 °C; no additional temperatures were invented for this step.",
      "result": "With \\(A=25\\,^\\circ\\mathrm C\\), the fitted initial excess is \\(B\\approx58.92714\\,^\\circ\\mathrm C\\), \\(k\\approx0.03896146\\;\\mathrm{min}^{-1}\\), and the solution of \\(50=A+Be^{-kt}\\) is \\(t\\approx22.0070\\) min. At \\(A=27\\,^\\circ\\mathrm C\\), I obtain \\(B\\approx57.06324\\), \\(k\\approx0.04105873\\;\\mathrm{min}^{-1}\\), and \\(t\\approx22.1309\\) min. The original \\(A=26\\) solution lies between them at \\(22.0668\\) min.\n \nThe full range of these three conditional times is only \\(0.124\\) min, approximately \\(7.4\\) s. By comparison, the largest held-out temperature residual is about \\(0.232\\,^\\circ\\mathrm C\\), which corresponds locally to roughly \\(0.24\\) min when divided by the model's temperature-change rate of about \\(0.96\\,^\\circ\\mathrm C\\) per minute near 50 °C. This last conversion is a local approximation, not a calibrated timing-error interval.",
      "observationText": "Changing the ambient by one degree changes both B and k, but the calculated 50 °C crossing remains around 22.1 minutes in this narrow scenario.",
      "interpretation": "The estimated time is fairly insensitive to the specific 25–27 °C ambient scenario when each fit is recalculated. That does not resolve unknown heat exchange, vessel properties or a changing environment.",
      "limitations": "The ambient alternatives are not confidence limits and the residual-to-time conversion is local. I cannot combine them into a tested probability of reaching a particular temperature.",
      "localTakeaway": "All three ambient refits place the modelled crossing between 22.007 and 22.131 min, within the 22–24 min constructed bracket.",
      "nextQuestion": "How would actual repeat readings, a changing room temperature or a second drink volume alter the decay-rate assumption?",
      "nextWhy": "The current model cannot establish transfer to a different object or setting using its deliberately constructed sequence.",
      "mathsInsight": "Changing a model's reference level can change its fitted rate; a sensitivity check must redo the transformation and fit.",
      "methodChangeReason": "I retain the best-defended scope—this fixed hypothetical 0–30 min series—rather than treating ambient choices as real observations.",
      "outcomeId": "different"
    }
  ],
  "figures": [
    {
      "id": "p3-cool-time",
      "tool": "graph",
      "stage": 0,
      "after": "purpose",
      "title": "Constructed temperatures and the ambient level",
      "number": 1,
      "kind": "time",
      "columns": [
        "Time (min)",
        "Temperature (°C)"
      ],
      "rows": [
        [
          0,
          84
        ],
        [
          2,
          79.7
        ],
        [
          4,
          75.2
        ],
        [
          6,
          71.7
        ],
        [
          8,
          68
        ],
        [
          10,
          65.1
        ],
        [
          12,
          61.7
        ],
        [
          14,
          59.2
        ],
        [
          16,
          56.5
        ],
        [
          18,
          54.4
        ],
        [
          20,
          52
        ],
        [
          22,
          50.2
        ],
        [
          24,
          48.1
        ],
        [
          26,
          46.7
        ],
        [
          28,
          44.7
        ],
        [
          30,
          43.6
        ]
      ],
      "xLabel": "Time",
      "yLabel": "Temperature",
      "xSymbol": "t",
      "ySymbol": "T",
      "xUnit": "min",
      "yUnit": "°C",
      "xMin": 0,
      "xMax": 30,
      "yMin": 25,
      "yMax": 86,
      "models": [
        {
          "id": "model-cool-ambient",
          "type": "custom",
          "expression": "26",
          "visible": true
        }
      ],
      "caption": "All sixteen invented values are shown in order. The constant line marks the assumed ambient, not a temperature record."
    },
    {
      "id": "p3-cool-log",
      "tool": "graph",
      "stage": 1,
      "after": "purpose",
      "title": "Natural logarithm of excess temperature",
      "number": 2,
      "columns": [
        "Time (min)",
        "ln excess"
      ],
      "rows": [
        [
          0,
          4.060443
        ],
        [
          2,
          3.983413
        ],
        [
          4,
          3.895894
        ],
        [
          6,
          3.822098
        ],
        [
          8,
          3.73767
        ],
        [
          10,
          3.666122
        ],
        [
          12,
          3.575151
        ],
        [
          14,
          3.50255
        ],
        [
          16,
          3.417727
        ],
        [
          18,
          3.346389
        ],
        [
          20,
          3.258097
        ]
      ],
      "xLabel": "Time",
      "yLabel": "ln excess",
      "xSymbol": "t",
      "ySymbol": "lnE",
      "xUnit": "min",
      "yUnit": "",
      "xMin": 0,
      "xMax": 21,
      "yMin": 3.15,
      "yMax": 4.2,
      "models": [
        {
          "id": "model-cool-log",
          "type": "linear",
          "visible": true
        }
      ],
      "caption": "Only the eleven modelling entries are used. A logarithm of a temperature ratio should formally be dimensionless; the ordinate uses ln[(T−A)/(1 °C)].",
      "calculated": true
    },
    {
      "id": "p3-cool-curve",
      "tool": "graph",
      "stage": 1,
      "after": "result",
      "title": "Exponential fit on the constructed temperature series",
      "number": 3,
      "kind": "time",
      "columns": [
        "Time (min)",
        "Temperature (°C)"
      ],
      "rows": [
        [
          0,
          84
        ],
        [
          2,
          79.7
        ],
        [
          4,
          75.2
        ],
        [
          6,
          71.7
        ],
        [
          8,
          68
        ],
        [
          10,
          65.1
        ],
        [
          12,
          61.7
        ],
        [
          14,
          59.2
        ],
        [
          16,
          56.5
        ],
        [
          18,
          54.4
        ],
        [
          20,
          52
        ],
        [
          22,
          50.2
        ],
        [
          24,
          48.1
        ],
        [
          26,
          46.7
        ],
        [
          28,
          44.7
        ],
        [
          30,
          43.6
        ]
      ],
      "xLabel": "Time",
      "yLabel": "Temperature",
      "xSymbol": "t",
      "ySymbol": "T",
      "xUnit": "min",
      "yUnit": "°C",
      "xMin": 0,
      "xMax": 30,
      "yMin": 25,
      "yMax": 86,
      "models": [
        {
          "id": "model-cool-exp",
          "type": "custom",
          "expression": "26+57.99289*exp(-0.039981565*x)",
          "visible": true
        }
      ],
      "caption": "The curve was fitted only on 0–20 min and then plotted without refitting over the reserved 22–30 min portion."
    },
    {
      "id": "p3-cool-residual",
      "tool": "graph",
      "stage": 2,
      "after": "result",
      "title": "Temperature residuals against elapsed time",
      "number": 4,
      "columns": [
        "Time (min)",
        "Residual (°C)"
      ],
      "rows": [
        [
          0,
          0.0071
        ],
        [
          2,
          0.1638
        ],
        [
          4,
          -0.2219
        ],
        [
          6,
          0.0761
        ],
        [
          8,
          -0.1177
        ],
        [
          10,
          0.219
        ],
        [
          12,
          -0.193
        ],
        [
          14,
          0.0654
        ],
        [
          16,
          -0.0882
        ],
        [
          18,
          0.1625
        ],
        [
          20,
          -0.0675
        ],
        [
          22,
          0.1358
        ],
        [
          24,
          -0.1149
        ],
        [
          26,
          0.1923
        ],
        [
          28,
          -0.2317
        ],
        [
          30,
          0.1232
        ]
      ],
      "xLabel": "Time",
      "yLabel": "Supplied minus model",
      "xSymbol": "t",
      "ySymbol": "r",
      "xUnit": "min",
      "yUnit": "°C",
      "xMin": 0,
      "xMax": 30,
      "yMin": -0.4,
      "yMax": 0.4,
      "models": [
        {
          "id": "model-cool-zero",
          "type": "custom",
          "expression": "0",
          "visible": true
        }
      ],
      "caption": "0–20 min: fitting residuals. 22–30 min: reserved residuals. Values are differences between constructed cases and the fitted model.",
      "calculated": true
    },
    {
      "id": "p3-cool-sensitivity",
      "tool": "table",
      "stage": 3,
      "after": "result",
      "title": "Ambient assumptions and time to 50 °C",
      "number": 1,
      "columns": [
        "Ambient A",
        "Initial excess B",
        "Decay rate k",
        "50 °C time"
      ],
      "rows": [
        [
          25,
          58.9271,
          0.038961,
          22.007
        ],
        [
          26,
          57.9929,
          0.039982,
          22.067
        ],
        [
          27,
          57.0632,
          0.041059,
          22.131
        ]
      ],
      "units": [
        "°C",
        "°C",
        "min⁻¹",
        "min"
      ],
      "note": "Each row refits log(T−A) on t=0–20 min; ambient changes are scenarios, not measured temperatures.",
      "calculated": true
    }
  ],
  "dataSets": [
    {
      "name": "Cooling Cup Cases v1 — original constructed time sequence",
      "columns": [
        "Time min",
        "Temperature °C",
        "Use"
      ],
      "rows": [
        [
          0,
          84,
          "fit"
        ],
        [
          2,
          79.7,
          "fit"
        ],
        [
          4,
          75.2,
          "fit"
        ],
        [
          6,
          71.7,
          "fit"
        ],
        [
          8,
          68,
          "fit"
        ],
        [
          10,
          65.1,
          "fit"
        ],
        [
          12,
          61.7,
          "fit"
        ],
        [
          14,
          59.2,
          "fit"
        ],
        [
          16,
          56.5,
          "fit"
        ],
        [
          18,
          54.4,
          "fit"
        ],
        [
          20,
          52,
          "fit"
        ],
        [
          22,
          50.2,
          "reserve"
        ],
        [
          24,
          48.1,
          "reserve"
        ],
        [
          26,
          46.7,
          "reserve"
        ],
        [
          28,
          44.7,
          "reserve"
        ],
        [
          30,
          43.6,
          "reserve"
        ]
      ],
      "sourceText": "Generated using the exponential recipe and offsets declared in the introduction."
    },
    {
      "name": "Cooling fit, residual and transformed working",
      "columns": [
        "Time min",
        "Supplied °C",
        "Excess °C",
        "ln excess",
        "Fitted °C",
        "Temperature residual °C",
        "Use"
      ],
      "rows": [
        [
          0,
          84,
          58,
          4.060443010546419,
          83.99289292984608,
          0.007107070153921313,
          "fit"
        ],
        [
          2,
          79.7,
          53.7,
          3.983413001514819,
          79.53616124018723,
          0.1638387598127764,
          "fit"
        ],
        [
          4,
          75.2,
          49.2,
          3.8958936234982624,
          75.4219276800429,
          -0.22192768004289576,
          "fit"
        ],
        [
          6,
          71.7,
          45.7,
          3.822098297900159,
          71.6238713988685,
          0.07612860113150077,
          "fit"
        ],
        [
          8,
          68,
          42,
          3.7376696182833684,
          68.11769429343889,
          -0.1176942934388876,
          "fit"
        ],
        [
          10,
          65.1,
          39.099999999999994,
          3.66612246699132,
          64.88096556048875,
          0.21903443951124757,
          "fit"
        ],
        [
          12,
          61.7,
          35.7,
          3.5751506887855933,
          61.89297819542344,
          -0.19297819542343575,
          "fit"
        ],
        [
          14,
          59.2,
          33.2,
          3.502549875922443,
          59.13461651904892,
          0.06538348095108404,
          "fit"
        ],
        [
          16,
          56.5,
          30.5,
          3.417726683613366,
          56.58823388482203,
          -0.08823388482203143,
          "fit"
        ],
        [
          18,
          54.4,
          28.4,
          3.3463891451671604,
          54.237539784251915,
          0.16246021574808367,
          "fit"
        ],
        [
          20,
          52,
          26,
          3.258096538021482,
          52.06749562820825,
          -0.06749562820824906,
          "fit"
        ],
        [
          22,
          50.2,
          24.200000000000003,
          3.186352633162641,
          50.064218537396144,
          0.13578146260385893,
          "reserve"
        ],
        [
          24,
          48.1,
          22.1,
          3.095577608523707,
          48.21489252649638,
          -0.11489252649637649,
          "reserve"
        ],
        [
          26,
          46.7,
          20.700000000000003,
          3.0301337002713233,
          46.50768651377048,
          0.19231348622952282,
          "reserve"
        ],
        [
          28,
          44.7,
          18.700000000000003,
          2.928523523860541,
          44.93167863159647,
          -0.2316786315964663,
          "reserve"
        ],
        [
          30,
          43.6,
          17.6,
          2.8678989020441064,
          43.47678635371098,
          0.12321364628902387,
          "reserve"
        ]
      ],
      "sourceText": "All predicted values use the regression fitted on t=0–20 min only."
    },
    {
      "name": "Ambient sensitivity refits",
      "columns": [
        "Assumed ambient °C",
        "Fitted B °C",
        "Fitted k /min",
        "Time to 50 °C min"
      ],
      "rows": [
        [
          25,
          58.92713890982444,
          0.03896146306492748,
          22.0070257812917
        ],
        [
          26,
          57.992892929846086,
          0.03998156536874183,
          22.066835774464757
        ],
        [
          27,
          57.06323642916472,
          0.041058726065759395,
          22.130882642252764
        ]
      ],
      "sourceText": "The same training values were transformed and refitted for each assumed ambient."
    }
  ],
  "conclusion": {
    "mainConclusion": "For my fixed constructed cooling series, fitting \\(\\ln(T-26)\\) over 0–20 min gives \\(\\widehat T(t)=26+57.99289e^{-0.039981565t}\\). It predicts \\(50\\,^\\circ\\mathrm C\\) after approximately \\(22.07\\) min. This lies within the supplied 22–24 min interval in which the recorded constructed temperatures decrease from \\(50.2\\) to \\(48.1\\,^\\circ\\mathrm C\\). Linear interpolation of those two points gives about \\(22.19\\) min. The five later cases have temperature RMSE about \\(0.166\\,^\\circ\\mathrm C\\), with no need to change the fitted equation.",
    "conclusionBenefit": "Refitting after changing the stipulated ambient from \\(26\\) to \\(25\\) or \\(27\\,^\\circ\\mathrm C\\) changes the modelled crossing to approximately \\(22.007\\) and \\(22.131\\) min. That is a relatively small change within this scenario, but it is not a measured confidence interval. More importantly, the result is a modelled crossing for a deliberately exponential series; its close match cannot demonstrate how a real drink will cool.",
    "conclusionExtension": "A future physical version would record actual room and drink temperatures with a stated calibrated instrument, use repeated independent trials and check whether the ambient remains constant. I would then test a fitted model on new readings before using its threshold time as a real prediction. None of those observations or validation claims are part of this fictional example."
  },
  "review": {
    "story": "I calculated excess ratios, fitted log excess, checked reserved Celsius errors, solved the threshold, interpolated between the two neighbouring entries and refitted alternative ambients.",
    "sequence": "Time plot motivates positive excess; log transformation supplies a model; held-out values check the threshold; ambient refits test a key assumption.",
    "notation": "I distinguish absolute Celsius readings from temperature differences, define the logarithm input as a numerical ratio to 1 °C, and give k in min⁻¹.",
    "purpose": "The answer is a modelled 50 °C crossing, not a general temperature recommendation or proof of real cooling conditions.",
    "limits": "The synthetic recipe intentionally gives an exponential pattern; ambient and time changes are stated modelling scenarios, not measured uncertainty.",
    "calculations": "I recomputed the log-regression slope, intercept, half-life, five held-out residuals, 50 °C inverse and all three ambient refits.",
    "presentation": "Four editable graphs and a four-column sensitivity table link the data, fit, residuals and final timing comparison.",
    "sources": "The sixteen values, generating formula, offset list, split and assumed ambient are disclosed; no real thermometer is claimed.",
    "figures": "Time, log excess, back-transformed temperature and residual graphs preserve the same constructed entries and axes.",
    "technology": "All three transformed regressions use precisely the eleven t=0–20 cases, never the five validation entries."
  }
};
export const COOLING_CASES=Object.freeze(STUDY.dataSets[0].rows.map(row=>Object.freeze(row)));
export const DRINK_COOLING_SPEC=buildModellingPass3(STUDY);
