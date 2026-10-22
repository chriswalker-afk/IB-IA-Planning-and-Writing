import {buildModellingPass3} from './modelling-pass3-helpers.js';
const STUDY={
  "id": "ball-clearance",
  "routeId": "trajectories",
  "title": "Does a calibrated ball arc really clear the barrier?",
  "course": "AA SL",
  "mathSelected": [
    "AA06",
    "AA25"
  ],
  "technologyStage": 1,
  "description": "A complete constructed pixel-calibration investigation: quadratic arc fit, barrier clearance, a scale-invariance insight and a decision reversed by plausible coordinate changes.",
  "provenance": "Calibrated Ball Frame Cases v1: a synthetic side-view image-coordinate scenario with seven ball centres (horizontal pixel X, height-from-origin pixel Y): (0,120), (100,222), (200,277), (300,300), (400,283), (500,218), (600,120). A constructed reference of 100 pixels per metre applies equally to horizontal and vertical coordinates in a single assumed frontoparallel plane. Barrier evaluation uses X=450 pixels and a top level Y=248 pixels. Alternative scale 98–102 px/m, ball-coordinate shifts ±3 px, barrier position shifts ±10 px and top-edge registration shifts ±2 px are explicitly assumed scenarios, not observed errors. No real photograph, frame timing, physical throw or permissioned video is claimed.",
  "citation": "Calibrated Ball Frame Cases v1, original synthetic coordinates and defined reference scale included in this project; no camera image or observations.",
  "readingNote": "Fictional quadratic trajectory case. Coordinates, scale and barrier are constructed; the result does not establish a real ball clears any obstacle.",
  "idea": "A ball appears to arch over a hurdle in a side-view picture, but judging the clearance from a picture alone seems imprecise.",
  "aim": "What clearance does a least-squares quadratic fitted to seven constructed calibrated ball positions predict at a barrier located at \\(X=450\\) pixels with top height \\(Y=248\\) pixels, and could stated coordinate and calibration alternatives reverse the conclusion?",
  "motivation": "I want to distinguish the visual impression of a ball passing over an obstacle from a quantitative conclusion that survives the precision of locating its path and the top of the obstacle.",
  "beneficiary": "I would use the result to evaluate the reliability of a hypothetical visual-clearance decision, not to assert any actual sporting outcome.",
  "intendedUse": "Calculate a signed height difference at the barrier, translate it into metres and test whether that positive or negative conclusion is robust.",
  "prediction": "I expect a parabolic model to produce a small positive clearance at the barrier, but I suspect the sign may change under a plausible shift of identified coordinates.",
  "predictionWhy": "A nearly tangent path can be separated from a barrier by very few pixels, and its slope near the barrier means horizontal misplacement affects vertical height.",
  "predictionImplication": "An apparently clear curve might be inconclusive once camera calibration and position selection are considered.",
  "firstAction": "Write down the reference pixels-per-metre scale and the common pixel origin before fitting anything, and plot the seven coordinate pairs.",
  "readinessImprovement": "I fixed the scale, origin, seven point centres and barrier dimensions as one documented constructed scenario.",
  "teacherQuestion": "Are the pixel-to-metre conversion and independent sensitivity scenarios mathematically clear without introducing unsupported velocity or acceleration?",
  "methodRecord": "I defined the seven pixel centres and fixed the barrier at X=450, top Y=248 pixels. I fitted a quadratic to all seven points, calculated its value at the barrier and tested explicitly stated coherent perturbations without claiming any camera measurements.",
  "sourcePopulation": "A single idealised constructed view in one vertical plane; no population of shots or frames.",
  "sampleSize": "Seven fixed ball-centre coordinates in one synthetic frame, not seven independent throws or times.",
  "pairing": "Each horizontal pixel coordinate remains paired with its own ball-centre vertical coordinate and the same chosen origin.",
  "modelEvidence": "Seven constructed coordinates from a nominal side-view arc, plus a separate constructed barrier coordinate and reference scale.",
  "inputs": "Pixel coordinates \\(X,Y\\) share a floor-aligned origin, with height increasing upwards. The nominal calibration is \\(100\\text{ px m}^{-1}\\), so \\(x=X/100\\) metres and \\(h=Y/100\\) metres. The barrier top is \\(248\\text{ px}=2.48\\text{ m}\\) at \\(X=450\\text{ px}=4.50\\text{ m}\\).",
  "assumptions": "All points and the barrier lie in a common vertical plane; the camera is frontoparallel without lens distortion, perspective shrinkage or rotation. A quadratic is a modelling candidate, not established physical motion.",
  "domain": "Fit and interpret the arc only for \\(0\\le X\\le600\\) pixels (\\(0\\le x\\le6\\) m at the nominal scale). The barrier at \\(X=450\\) lies inside this interval. No temporal quantities exist.",
  "validation": "I check the fitted curve against all seven coordinates, its vertex and the difference from the stated barrier top. I vary the scale and the coherent coordinate selections separately.",
  "alternative": "Joining all seven dots could estimate a height but has no single smooth clearance curve at X=450; choosing a higher-degree interpolating polynomial would force individual constructed pixel offsets through the model.",
  "chosenMethod": "Fit a least-squares quadratic Y=aX²+bX+c, compute its vertex and height at X=450, then compare that height with the barrier coordinate and test explicit perturbations.",
  "methodReason": "A quadratic can describe a simple parabolic arc and gives a well-defined height at the barrier between the supplied coordinate samples.",
  "methodLimit": "One untimed synthetic frame supplies position but no time information; I cannot infer speed, vertical acceleration or flight duration. Camera perspective assumptions are untested.",
  "consequence": "A small nominal clearance can switch sign if the barrier position or selected heights move by only a few pixels; a fitted curve's apparent smoothness is not proof of clearance.",
  "mitigation": "I preserve the calibration in original pixels, retain all seven points, show the exact fitted coefficients and give specific adverse and favourable scenarios instead of an unjustified confidence interval.",
  "acceptable": "I can describe a nominal modelled clearance for the constructed one-plane scenario, but the sign is not robust enough to assert an actual obstacle is cleared.",
  "changedSincePlanning": "The quadratic initially suggested a seven-pixel clearance, but a coherent adverse coordinate selection made it negative. I therefore changed my final decision from 'clear' to 'not established'.",
  "dataStatusSummary": "Seven fictional ball-centre pairs and one barrier reference are retained without deletions. All are fixed hypothetical coordinates, not collected video data.",
  "dataAimLink": "I need a coordinate system before assessing the arc. Both the ball and the barrier share one pixel origin and one scale. The signed gap at \\(X=450\\) is a vertical difference in pixels first; changing units consistently cannot by itself change whether the gap is positive.",
  "firstEvaluation": "Plotting raw pixel points preserves the actual discrete coordinates before an assumed curve. A screenshot-like smooth line without the scale or barrier dimension would give a false impression of measured precision.",
  "definitions": "\\(X,Y\\): horizontal and height pixels from one constructed origin. \\(x=X/s,h=Y/s\\): metres when the common calibration is \\(s\\) pixels per metre. \\(P(X)\\): fitted pixel-height quadratic. \\(C=P(450)-248\\): nominal vertical clearance in pixels, positive for modelled clearance.",
  "firstPresentation": "Figure 1 plots all seven coordinate centres in their original pixel system. Table 1 gives the reference scale, barrier position and top-edge height used in the later calculation.",
  "accuracyQuantity": "Image coordinates and calibration",
  "accuracySymbol": "X, Y, s",
  "accuracyUnit": "px; px/m",
  "accuracyResolution": "The integer coordinates are constructed pixel positions. The ±3 px centre, ±10 px barrier position, ±2 px top edge and scale range 98–102 px/m are separate hypotheses; no camera accuracy is measured.",
  "accuracyPolicy": "Fit using all original integer coordinates and unrounded coefficients. Quote gap to 0.1 pixel and about 1 mm on the nominal metre scale; do not imply the physical resolution is 1 mm.",
  "accuracyReason": "The nominal gap is about seven pixels, comparable with plausible differences in point selection and barrier placement. I test their consequences explicitly.",
  "specialistTerms": "Clearance is the fitted centre-height minus the top edge at the same horizontal position. Calibration converts pixels to metres within the assumed single plane. A still image cannot provide elapsed time or speed.",
  "predictionComparison": "The nominal parabola gave a positive 6.893-pixel gap as anticipated, but an adverse permitted coordinate scenario changes its sign.",
  "benefitFinding": "Checking the same-plane scale shows a useful invariance: a common change of pixels per metre alters the numerical metre gap but not the sign; uncertain coordinate placement can.",
  "surpriseReason": "A 2% change in a common calibration scale cannot reverse which object is higher in the same pixel frame, while a ten-pixel horizontal change in barrier location can.",
  "surpriseCheck": "I evaluated P at X=440, 450 and 460, shifted all seven track centres coherently by ±3 pixels and varied the barrier top by ±2 pixels without changing source points silently.",
  "courseConcern": "This investigation uses quadratic regression, vertex and domain, pixel-to-metre conversion and sensitivity. I do not claim velocity or acceleration from a single untimed image.",
  "technologyTool": "Graph plotter and least-squares quadratic calculator",
  "technologyInput": "The seven original (X,Y) pixel pairs, using a quadratic in X with a freely fitted constant term and no time variable.",
  "technologyOutcome": "\\(P(X)=-0.002000X^2+1.199285714X+120.214286\\) px. At \\(X=450\\), \\(P\\approx254.893\\) px and nominal \\(C\\approx6.893\\) px.",
  "technologyInterpretation": "I converted the signed clearance after fitting in pixels. The adverse and favourable scenarios are explicit altered-input calculations, not probability intervals.",
  "courseWhy": "The central mathematics is a fitted quadratic evaluated at a meaningful location, followed by a mathematical decision about robustness.",
  "mathsLearning": "I found that some uncertainty changes only units while another part changes the sign of the quantity the aim cares about.",
  "introduction": "From the side, a ball following an arc can appear to skim over a barrier. I wanted to know whether calling that a clearance is justified mathematically when I choose discrete ball centres and a reference scale from one view.\n \nI constructed seven image coordinates for a single hypothetical ball path and defined a barrier at pixel \\(X=450\\), top height \\(Y=248\\). All values use one common origin and an assumed \\(100\\)-pixels-per-metre calibration. My aim is to fit a quadratic, calculate the signed gap, then test whether coordinate alternatives could change a positive decision.\n \nI expected a small nominal positive gap, but I did not regard that as enough to claim success. There is no real photograph or throw behind the constructed data; in particular, I cannot calculate flight speed or acceleration.",
  "dataNotes": "Calibrated Ball Frame Cases v1 [D1] consists of the seven fixed pairs \\((0,120),(100,222),(200,277),(300,300),(400,283),(500,218),(600,120)\\), all in pixels. The origin is on an assumed horizontal floor line directly below the first point, with positive Y upwards. A common \\(100\\text{ px/m}\\) scale is defined by a fictional reference marker in the same plane. The barrier is located at \\(X=450\\) px with top edge \\(Y=248\\) px.\n \nFor sensitivity only, I permit a common calibration between 98 and 102 px/m, a chosen barrier X shift up to 10 pixels, a top-edge selection shift up to 2 pixels and a coherent ±3-pixel vertical shift of all selected ball centres. These are specified modelling alternatives rather than calibrated error limits. They do not generate new observations. A common rescaling leaves the sign of a pixel difference unchanged, provided the camera plane and pixel origin assumptions remain valid.",
  "stages": [
    {
      "key": "calibration",
      "title": "Calibrating and locating the points and obstacle",
      "methodId": "follow-journey",
      "kind": "model",
      "technique": "Coordinate calibration and domain choice",
      "bridge": "Before fitting a model I need to know what my image coordinates actually mean and whether the barrier lies between the supplied points.",
      "purpose": "Figure 1 shows all seven constructed centre coordinates on pixel axes. Table 1 states the common scale and barrier dimensions separately.",
      "result": "The selected horizontal pixel coordinates \\(X=0,100,\\ldots,600\\) represent \\(x=0,1,\\ldots,6\\) m at the nominal \\(s=100\\text{ px/m}\\). Similarly each pixel height is \\(h=Y/100\\) m. For example, \\((300,300)\\) px becomes \\((3.00,3.00)\\) m.\n \nThe barrier at \\(X=450\\) px corresponds to \\(x=4.50\\) m, while its top height \\(Y=248\\) px corresponds to \\(h_b=2.48\\) m. Because \\(0<450<600\\), using a fitted curve here is interpolation within the coordinate domain, not extrapolation. I keep the fit in pixels at first, so both sides of a clearance subtraction use the identical calibration and origin.",
      "observationText": "The seven points form a single arch; the barrier is inside the observed horizontal range and lies on the descending side.",
      "interpretation": "A common coordinate system makes a numerical clearance possible. A perspective shift or a separate scale for the barrier would invalidate this simple comparison.",
      "limitations": "All dimensions come from a fictional frontoparallel view with no lens distortion. A scale reference drawn in another plane would not justify the same conversion.",
      "localTakeaway": "The constructed arc covers 0–6 m and the barrier lies at 4.50 m with top 2.48 m in the nominal coordinate system.",
      "nextQuestion": "Which quadratic best represents the seven points, and where is its vertex within the observed interval?",
      "nextWhy": "The barrier sits between observed positions, so I need a justified height function at its exact X coordinate.",
      "mathsInsight": "Comparing a fitted point and an obstacle requires a common origin and physical plane, not merely matching graph paper units.",
      "methodChangeReason": "I chose a quadratic only after plotting the entire arch and confirming the barrier is inside the span.",
      "outcomeId": "quadratic"
    },
    {
      "key": "quadratic-path",
      "title": "Fitting the arc and locating its maximum height",
      "methodId": "quadratic-fit",
      "kind": "model",
      "technique": "Quadratic least squares and vertex calculation",
      "bridge": "The points suggest a concave-down quadratic. I fitted one curve to all seven, rather than joining each neighbouring pair and choosing a convenient segment.",
      "purpose": "Figure 2 overlays the least-squares quadratic on the original seven pixel pairs. The fitted function uses original pixels, so the metre conversion does not introduce extra rounding.",
      "result": "The least-squares fit of \\(P(X)=aX^2+bX+c\\) to all seven pairs is\n\\[\nP(X)\\approx-0.002000X^2+1.199285714X+120.214286.\n\\]\nFor \\(X=0,100,\\ldots,600\\), the root mean squared residual is approximately \\(1.922\\) pixels. Differentiating gives \\(P'(X)=-0.004X+1.199285714\\), so the turning point is\n\\[\nX_v=\\frac{-b}{2a}\\approx299.8214\\text{ px},\n\\qquad P(X_v)\\approx300.0001\\text{ px}.\n\\]\nAt the defined 100 px/m scale, the vertex is near \\(x=2.998\\text{ m},h=3.000\\text{ m}\\). The negative squared coefficient and interior vertex agree with the downward arc seen in Figure 1. No elapsed time is present, so this derivative is slope of height against horizontal distance, not velocity.",
      "observationText": "The quadratic follows the constructed arch with small pixel-scale residuals and reaches its maximum close to the middle point.",
      "interpretation": "The fitted curve supplies a height at horizontal positions not directly listed, including the barrier's X coordinate. The vertex is descriptive geometry, not evidence for a flight-time law.",
      "limitations": "A near-parabolic shape is plausible for a ball in an ideal plane, but perspective, spin, wind and point-selection uncertainty are not established by seven synthetic coordinates.",
      "localTakeaway": "The fitted concave-down arc has vertex near (299.82,300.00) pixels and about 1.922 pixels residual RMSE.",
      "nextQuestion": "What signed gap does this fixed quadratic predict at the barrier, and is its magnitude large enough to interpret?",
      "nextWhy": "The purpose is clearance at X=450 rather than simply finding the highest point.",
      "mathsInsight": "A low fitting RMSE does not say whether a seven-pixel clearance is robust to choosing positions from an image.",
      "methodChangeReason": "I evaluated the fixed curve at the obstacle rather than fitting extra terms to reduce its residual further.",
      "outcomeId": "model-fit"
    },
    {
      "key": "nominal-clearance",
      "title": "Calculating signed clearance at the barrier",
      "methodId": "follow-journey",
      "kind": "model",
      "technique": "Function evaluation and calibrated height comparison",
      "bridge": "I now have the fitted pixel-height function and the barrier top expressed in the same frame, so clearance is a subtraction rather than a visual judgement.",
      "purpose": "Figure 3 focuses on the height of the fitted arc around X=450 px; the horizontal 248-pixel reference denotes the barrier top level.",
      "result": "At \\(X_b=450\\), the quadratic gives\n\\[\nP(450)=-0.002(450)^2+1.199285714(450)+120.214286\n\\approx254.892857\\text{ px}.\n\\]\nThe signed nominal centre-to-top gap is\n\\[\nC=P(450)-248\\approx+6.892857\\text{ px}.\n\\]\nUsing the common scale \\(100\\text{ px/m}\\), this becomes \\(C\\approx0.06893\\text{ m}\\), about \\(6.9\\text{ cm}\\). The sign is positive and suggests nominal modelled clearance for the centre of the ball. It does not account for the ball's radius: a physical clearance of an entire ball would need a radius and the lowest point of its boundary, neither of which I have defined.\n \nAn important check is that changing a single shared calibration to \\(s=98\\) or \\(102\\text{ px/m}\\) changes the numerical centre gap to about \\(0.07034\\) or \\(0.06758\\text{ m}\\), but cannot change its sign because the same positive divisor applies to both objects.",
      "observationText": "The fitted centre passes about seven pixels above the barrier top on the defined pixel axes.",
      "interpretation": "The positive 6.893-pixel quantity answers centre-to-top clearance only under the nominal frame. It is not yet a claim the whole ball clears, or that even the centre-gap sign is stable under a different coordinate selection.",
      "limitations": "Without ball radius or evidence of physical scale and perspective, the calculation cannot establish an actual collision-free trajectory. A common scale error is not the only uncertainty.",
      "localTakeaway": "Nominal centre clearance is +6.893 px, about 6.9 cm at 100 px/m. Common rescaling preserves the sign, but point selection might not.",
      "nextQuestion": "Can a plausible coherent change in selected pixel coordinates make the predicted clearance negative?",
      "nextWhy": "The positive margin is small compared with the shifts allowed in the stated scenario.",
      "mathsInsight": "A shared positive unit conversion does not alter the sign of a difference; errors in the underlying positions can.",
      "methodChangeReason": "I explored altered coordinate assumptions without quietly editing the original records.",
      "outcomeId": "quadratic"
    },
    {
      "key": "coordinate-sensitivity",
      "title": "Testing a decision that can reverse under pixel choices",
      "methodId": "follow-journey",
      "kind": "model",
      "technique": "Coherent perturbation scenarios and robust interpretation",
      "bridge": "A positive nominal centre gap still may not justify calling the path clear. I checked explicit alternative inputs within my stated ranges.",
      "purpose": "Table 2 compares nominal, adverse and favourable coordinate selections, with all original cases kept unchanged in the working dataset.",
      "result": "My adverse scenario moves the barrier to \\(X=460\\) px, sets its top at \\(250\\) px and shifts every fitted ball-centre Y value down by \\(3\\) px. A common vertical shift of every response changes only the fitted intercept, so the new path height is \\(P(460)-3\\). The signed centre gap becomes\n\\[\nC_{\\rm adverse}=P(460)-3-250\\approx-4.3143\\text{ px}.\n\\]\nIt is negative, so even the *centre* is below the barrier top in that admissible constructed scenario.\n \nThe favourable scenario moves the barrier to \\(X=440\\) px, lowers its top to \\(246\\) px and shifts all centres up by \\(3\\) px:\n\\[\nC_{\\rm favourable}=P(440)+3-246=+17.7000\\text{ px}.\n\\]\nThese two alternatives are not proven worst-case bounds for every independently perturbed centre coordinate; they are explicit permitted counterexamples showing the nominal positive sign is not invariant. Nor do they form a probabilistic confidence interval. The scale range 98–102 px/m affects the numerical metre value but leaves all these pixel signs unchanged under the common-plane assumption.",
      "observationText": "The centre-gap sign changes from positive to negative in one coherent input scenario allowed by the stated alternatives.",
      "interpretation": "My original visual expectation of a small clearance is not a stable conclusion. The defensible answer is that nominal modelled centre clearance is positive, but centre clearance under the allowed coordinate choices—and whole-ball clearance—has not been established.",
      "limitations": "The sensitivity uses hypothetical error allowances, not empirically measured pixel-location variation. Independent point perturbations, ball radius, perspective and lens distortion may alter the result further.",
      "localTakeaway": "A nominal +6.893 px centre gap reverses to −4.314 px in one admissible scenario, so the sign is not robust; actual whole-ball clearance is untested.",
      "nextQuestion": "What radius, calibrated image plane and independently checked centre locations would be required to make a robust full-ball clearance claim?",
      "nextWhy": "The missing dimensions and uncertain point selections are precisely what stop the nominal sign from answering the real-world question.",
      "mathsInsight": "An explicit counterexample to robustness is sufficient to reject a claim that every allowed coordinate selection produces clearance.",
      "methodChangeReason": "I concluded at the defensible scope rather than adding unsupported time-based mechanics.",
      "outcomeId": "poor-scale"
    }
  ],
  "figures": [
    {
      "id": "figure-p3-ball-pixels",
      "tool": "graph",
      "stage": 0,
      "after": "purpose",
      "title": "Seven constructed ball centres in image pixels",
      "number": 1,
      "columns": [
        "Horizontal pixel X",
        "Height pixel Y"
      ],
      "rows": [
        [
          0,
          120
        ],
        [
          100,
          222
        ],
        [
          200,
          277
        ],
        [
          300,
          300
        ],
        [
          400,
          283
        ],
        [
          500,
          218
        ],
        [
          600,
          120
        ]
      ],
      "xLabel": "Horizontal pixel",
      "yLabel": "Height pixel",
      "xSymbol": "X",
      "ySymbol": "Y",
      "xUnit": "px",
      "yUnit": "px",
      "xMin": 0,
      "xMax": 600,
      "yMin": 100,
      "yMax": 325,
      "caption": "The vertical coordinate increases upwards from the defined floor origin. All seven centres are constructed, not traced from real footage."
    },
    {
      "id": "table-p3-ball-calibration",
      "tool": "table",
      "stage": 0,
      "after": "result",
      "title": "Defined scale and barrier coordinates",
      "number": 1,
      "columns": [
        "Reference",
        "Pixels",
        "Metres"
      ],
      "rows": [
        [
          "Scale reference",
          100,
          1
        ],
        [
          "Barrier X",
          450,
          4.5
        ],
        [
          "Barrier top Y",
          248,
          2.48
        ]
      ],
      "units": [
        "",
        "px",
        "m"
      ],
      "calculated": true,
      "note": "The common hypothetical scale is 100 px/m. X and Y use the same datum and plane; seven source ball-centre pairs remain in the editable working data."
    },
    {
      "id": "figure-p3-ball-fit",
      "tool": "graph",
      "stage": 1,
      "after": "result",
      "title": "Least-squares quadratic and constructed centres",
      "number": 2,
      "columns": [
        "Horizontal pixel X",
        "Height pixel Y"
      ],
      "rows": [
        [
          0,
          120
        ],
        [
          100,
          222
        ],
        [
          200,
          277
        ],
        [
          300,
          300
        ],
        [
          400,
          283
        ],
        [
          500,
          218
        ],
        [
          600,
          120
        ]
      ],
      "xLabel": "Horizontal pixel",
      "yLabel": "Height pixel",
      "xSymbol": "X",
      "ySymbol": "Y",
      "xUnit": "px",
      "yUnit": "px",
      "xMin": 0,
      "xMax": 600,
      "yMin": 100,
      "yMax": 325,
      "models": [
        {
          "id": "model-ball-quad",
          "type": "quadratic",
          "visible": true
        }
      ],
      "caption": "Quadratic regression uses all seven original centres. The x variable in the fitted equation refers to horizontal pixel X, not elapsed time."
    },
    {
      "id": "figure-p3-ball-near",
      "tool": "graph",
      "stage": 2,
      "after": "result",
      "title": "Fitted path height near the barrier X coordinate",
      "number": 3,
      "columns": [
        "Horizontal pixel X",
        "Fitted height px"
      ],
      "rows": [
        [
          400,
          279.929
        ],
        [
          410,
          275.721
        ],
        [
          420,
          271.114
        ],
        [
          430,
          266.107
        ],
        [
          440,
          260.7
        ],
        [
          450,
          254.893
        ],
        [
          460,
          248.686
        ],
        [
          470,
          242.079
        ],
        [
          480,
          235.071
        ],
        [
          490,
          227.664
        ],
        [
          500,
          219.857
        ]
      ],
      "xLabel": "Horizontal pixel",
      "yLabel": "Modelled height",
      "xSymbol": "X",
      "ySymbol": "P",
      "xUnit": "px",
      "yUnit": "px",
      "xMin": 400,
      "xMax": 500,
      "yMin": 205,
      "yMax": 290,
      "models": [
        {
          "id": "model-ball-barrier",
          "type": "custom",
          "expression": "248",
          "visible": true
        }
      ],
      "caption": "The horizontal line is only the barrier top height reference, not a barrier spanning 400–500 px. The actual decision is at X=450.",
      "calculated": true
    },
    {
      "id": "table-p3-ball-sensitivity",
      "tool": "table",
      "stage": 3,
      "after": "result",
      "title": "Centre-clearance sensitivity examples",
      "number": 2,
      "columns": [
        "Case",
        "Barrier X",
        "Top Y",
        "Centre shift",
        "Gap"
      ],
      "rows": [
        [
          "Nominal",
          450,
          248,
          0,
          6.893
        ],
        [
          "Adverse",
          460,
          250,
          -3,
          -4.314
        ],
        [
          "Favourable",
          440,
          246,
          3,
          17.7
        ]
      ],
      "units": [
        "",
        "px",
        "px",
        "px",
        "px"
      ],
      "calculated": true,
      "note": "Coherent sensitivity scenarios, not best/worst statistical intervals. Full-ball clearance additionally requires ball radius."
    }
  ],
  "dataSets": [
    {
      "name": "Ball Frame Cases v1 — seven constructed pixel centres",
      "columns": [
        "X px",
        "Y px"
      ],
      "rows": [
        [
          0,
          120
        ],
        [
          100,
          222
        ],
        [
          200,
          277
        ],
        [
          300,
          300
        ],
        [
          400,
          283
        ],
        [
          500,
          218
        ],
        [
          600,
          120
        ]
      ],
      "sourceText": "Synthetic pixel coordinates with assumed common 100 px/m calibration; not real footage."
    },
    {
      "name": "Quadratic fitted heights and residuals",
      "columns": [
        "X px",
        "Given Y px",
        "Fitted Y px",
        "Residual px"
      ],
      "rows": [
        [
          0,
          120,
          120.21428571428572,
          -0.2142857142857224
        ],
        [
          100,
          222,
          220.14285714285717,
          1.8571428571428328
        ],
        [
          200,
          277,
          280.07142857142856,
          -3.071428571428555
        ],
        [
          300,
          300,
          300,
          0
        ],
        [
          400,
          283,
          279.92857142857144,
          3.071428571428555
        ],
        [
          500,
          218,
          219.85714285714283,
          -1.8571428571428328
        ],
        [
          600,
          120,
          119.78571428571428,
          0.2142857142857224
        ]
      ],
      "sourceText": "Least-squares quadratic fitted to all seven original points."
    },
    {
      "name": "Barrier and sensitivity comparisons",
      "columns": [
        "Scenario",
        "Barrier X px",
        "Top Y px",
        "Centre shift px",
        "Predicted centre px",
        "Centre gap px"
      ],
      "rows": [
        [
          "Nominal",
          450,
          248,
          0,
          254.89285714285717,
          6.892857142857167
        ],
        [
          "Adverse",
          460,
          250,
          -3,
          245.68571428571425,
          -4.314285714285745
        ],
        [
          "Favourable",
          440,
          246,
          3,
          263.70000000000005,
          17.700000000000045
        ]
      ],
      "sourceText": "Alternative mathematical input scenarios; the original centre coordinates are unchanged."
    }
  ],
  "conclusion": {
    "mainConclusion": "For the seven constructed centres, the quadratic model \\(P(X)=-0.002X^2+1.199285714X+120.214286\\) gives a nominal height \\(P(450)\\approx254.893\\) px at the barrier, whose stipulated top is 248 px. The nominal *centre-to-top* gap is therefore \\(+6.893\\) px, approximately \\(+6.9\\) cm at the fictional 100 px/m scale. This is a positive geometric centre gap in the model, not proof that the whole ball passes above the barrier.",
    "conclusionBenefit": "The coordinate alternatives change the answer: moving the barrier ten pixels right and two pixels higher while shifting all seven ball-centre choices three pixels lower gives a centre gap of approximately \\(-4.314\\) px. I therefore cannot claim even the centre clears for every allowed input choice. A common scale variation from 98 to 102 px/m changes the size in metres but not the sign; point placement and the missing ball radius matter much more to the decision.",
    "conclusionExtension": "A real study would need a suitable side-on image with measured scale in the same plane, verified lens/perspective treatment, justified centre-location uncertainty, barrier dimensions and ball radius. Time-stamped frames would be required before estimating velocities or accelerations. I have not obtained those measurements or demonstrated any actual clearance."
  },
  "review": {
    "story": "I converted the fixed pixels to metres, fitted a quadratic, located the vertex, calculated nominal centre clearance and tested coherent coordinate alternatives that reverse the decision.",
    "sequence": "Calibration establishes the shared frame; the arch supports quadratic interpolation; the fitted barrier height yields a nominal gap; point shifts expose a non-robust claim.",
    "notation": "I distinguish X/Y image pixels from x/h metres, centre clearance from full-ball clearance, and a common scale error from input coordinate changes.",
    "purpose": "The final decision acknowledges an inconclusive clearance under allowed point choices rather than claiming a successful ball flight.",
    "limits": "No camera image or timing exists; the permitted shifts are scenarios, not a measured confidence region, and ball radius is missing.",
    "calculations": "I verified the seven-point quadratic least-squares coefficients, vertex, pixel gap, scale invariance and the negative adverse counterexample.",
    "presentation": "Three native graphs and two compact tables show the original coordinates, fitted path, barrier reference and sensitivity results at useful stages.",
    "sources": "All centre positions, barrier pixel coordinates, scale and hypothetical deviations are original explicit teaching inputs.",
    "figures": "The near-barrier height reference is labelled as a line level, not a physically wide barrier or an actual frame.",
    "technology": "All original coordinates are shown and the quadratic was calculated from them; I do not infer time-based motion from a static geometry model."
  }
};
export const BALL_CASES=Object.freeze(STUDY.dataSets[0].rows.map(row=>Object.freeze(row)));
export const BALL_CLEARANCE_SPEC=buildModellingPass3(STUDY);
