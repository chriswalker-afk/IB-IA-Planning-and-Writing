import {buildModellingPass3} from './modelling-pass3-helpers.js';
const STUDY={
  "id": "ball-clearance",
  "routeId": "trajectories",
  "title": "Does the modelled ball centre stay above the barrier?",
  "course": "AA SL",
  "mathSelected": [
    "AA06",
    "AA25"
  ],
  "technologyStage": 1,
  "description": "A constructed ball-centre model connects a quadratic fit to one decision: whether its positive gap survives stated coordinate changes.",
  "provenance": "Calibrated Ball Frame Cases v1: a synthetic side-view image-coordinate scenario with seven ball centres (horizontal pixel X, height-from-origin pixel Y): (0,120), (100,222), (200,277), (300,300), (400,283), (500,218), (600,120). A constructed reference of 100 pixels per metre applies equally to horizontal and vertical coordinates in a single assumed frontoparallel plane. Barrier evaluation uses X=450 pixels and a top level Y=248 pixels. Alternative scale 98–102 px/m, ball-coordinate shifts ±3 px, barrier position shifts ±10 px and top-edge registration shifts ±2 px are explicitly assumed scenarios, not observed errors. No real photograph, frame timing, physical throw or permissioned video is claimed.",
  "citation": "Calibrated Ball Frame Cases v1, original synthetic coordinates and defined reference scale included in this project; no camera image or observations.",
  "readingNote": "A complete fictional investigation of a ball-centre gap. The seven coordinates, barrier and alternative inputs are constructed; no actual throw or whole-ball clearance is established.",
  "idea": "A positive gap on a fitted ball path may look convincing, but I want to know whether that sign survives small, explicitly defined changes in the coordinates.",
  "aim": "To calculate the centre-to-top gap predicted by a quadratic fitted to seven constructed ball centres at a barrier with \\(X=450\\) px and top \\(Y=248\\) px, then determine whether the gap stays positive under the supplied coordinate and calibration alternatives.",
  "motivation": "The useful question for me is whether a positive geometric margin survives the assumptions used to calculate it. The highest point of an attractive arc does not by itself settle clearance at a particular barrier.",
  "beneficiary": "I would use this investigation to understand when a modelled centre-clearance claim is justified, rather than to decide the outcome of a real sporting event.",
  "intendedUse": "Compare the nominal signed centre gap with its values under the stated alternative inputs, and distinguish that necessary condition from whole-ball clearance.",
  "prediction": "I expect a small positive nominal centre gap. I am less certain that it remains positive when barrier position, barrier height and all centre heights change within the prescribed alternatives.",
  "predictionWhy": "The barrier is on the descending part of the arch. Moving it horizontally can therefore reduce the predicted centre height, while vertical changes can consume the remaining gap.",
  "predictionImplication": "A permitted negative gap would be enough to reject a claim of positive centre clearance throughout the stated alternatives, even if the original quadratic fits the seven points closely.",
  "firstAction": "Define the signed centre gap and its permitted input changes, then check the common origin, scale and horizontal domain of the seven points.",
  "readinessImprovement": "I have fixed the seven centres, barrier, common scale and alternative-input budgets before choosing the regression coefficients. The question concerns this defined scenario, not measured camera uncertainty.",
  "teacherQuestion": "Does my algebraic least-squares derivation and explanation of coherent coordinate changes make the extension beyond routine quadratic modelling clear?",
  "methodRecord": "I retained all seven supplied centres. I defined a quadratic fit by the sum of squared vertical residuals, derived its coefficients using a centred coordinate, evaluated the centre gap and used the derivative plus an exact quadratic correction to explain the adverse scenario.",
  "sourcePopulation": "A single idealised constructed view in one vertical plane; no population of shots or frames.",
  "sampleSize": "Seven fixed ball-centre coordinates in one synthetic frame, not seven independent throws or times.",
  "pairing": "Each horizontal pixel coordinate remains paired with its own ball-centre vertical coordinate and the same chosen origin.",
  "modelEvidence": "The seven fixed centres form one arch on a common coordinate plane. They support testing a quadratic interpolation model; they are not observations that establish a law of flight.",
  "inputs": "Pixel coordinates \\(X,Y\\) share a floor-aligned origin, with height increasing upwards. The nominal calibration is \\(100\\text{ px m}^{-1}\\), so \\(x=X/100\\) metres and \\(h=Y/100\\) metres. The barrier top is \\(248\\text{ px}=2.48\\text{ m}\\) at \\(X=450\\text{ px}=4.50\\text{ m}\\).",
  "assumptions": "The original centres and barrier use one frontoparallel plane, one origin and a common positive scale. I give the seven vertical residuals equal weight and treat their original horizontal coordinates as fixed. The permitted centre alteration is one common vertical shift, not independent noise at every point.",
  "domain": "The fitted coordinate domain is \\(0\\le X\\le600\\) px. The barrier alternatives remain inside it at \\(440\\le X_b\\le460\\) px. No time variable or ball radius is supplied.",
  "validation": "I check the fitted residuals and exact coefficient algebra, then test the sign of the derived gap on the supplied alternative inputs. This is a consistency and sensitivity analysis within a constructed model, not independent empirical validation.",
  "alternative": "Joining neighbouring points would give a piecewise linear interpolation. I use a quadratic as the simplest polynomial that can represent a smooth rise and fall; a more flexible curve would need a separate reason, not merely a smaller fitting error.",
  "chosenMethod": "An equally weighted least-squares quadratic in the original pixel coordinates, followed by function evaluation, a shared-scale sign check and exact changes in the gap under coherent coordinate alternatives.",
  "methodReason": "I need a height between supplied positions, so I need an explicit function of horizontal position. A straight line cannot describe the observed rise and fall, whereas a quadratic can do so with three coefficients. I give every supplied centre equal weight because no case has a stated claim to greater reliability; this defines my fitting rule, rather than a probability model for errors.",
  "methodLimit": "The quadratic is one candidate interpolation model. A small residual does not prove its physical correctness or guarantee a positive gap after the permitted inputs change.",
  "consequence": "Clearance depends on the fitted height at the barrier and on the barrier top, not on the average fit across the arch. A change concentrated at this comparison can reverse the sign.",
  "mitigation": "I retain the original coordinates, keep full coefficient precision and explain the separate mathematical effects of horizontal displacement, coherent vertical shift and common scale before drawing the final decision.",
  "acceptable": "The specified alternatives are enough to test the stated robustness claim for this centre model. They do not establish a probability of failure or an actual collision-free path.",
  "changedSincePlanning": "The nominal centre gap is positive, as I expected. The horizontal change alone leaves a small positive gap, but the combined permitted coordinate changes make it negative, so the robust-positive claim fails.",
  "dataStatusSummary": "All seven supplied centres are retained unchanged. Alternative calculations are labelled as scenarios and do not replace the source coordinates.",
  "dataAimLink": "Let \\(P(X)\\) be the fitted centre height in pixels. At the nominal barrier I will evaluate \\(C_0=P(450)-248\\). A positive value means the modelled centre is above the top at that horizontal position. For a common calibration \\(s>0\\) pixels per metre, the metre gap is \\(C_0/s\\), so changing this scale cannot change the sign. My stronger question is whether the pixel gap remains positive for every allowed coordinate choice. One permitted negative example would be enough to answer that question negatively.",
  "firstEvaluation": "This is a test of a particular smooth model, not proof that a ball follows a parabola. Connecting adjacent points is another interpolation choice, while forcing a more elaborate curve through all seven centres would hide their deviations from a simple arch. I will keep those deviations visible and distinguish fitting error from the separate input alternatives.",
  "definitions": "\\(X,Y\\): horizontal and vertical pixel coordinates, with positive height upwards. \\(s\\): common calibration in px/m. \\(P(X)\\): fitted centre height. \\(C_0=P(450)-248\\): nominal centre-to-top gap in pixels. \\(u=(X-300)/100\\) and \\(q=u^2-4\\) are dimensionless fitting coordinates. \\(e_i=Y_i-P(X_i)\\) is a signed vertical residual. The changes \\(\\delta_X,\\delta_Y,\\delta_B\\) denote barrier horizontal shift, common centre-height shift and barrier-top shift, all in pixels.",
  "firstPresentation": "Figure 1 preserves all seven original centres. Table 1 records the scale and barrier inputs so that the height comparison uses one coordinate frame.",
  "accuracyQuantity": "Image coordinates and calibration",
  "accuracySymbol": "X, Y, s",
  "accuracyUnit": "px; px/m",
  "accuracyResolution": "Integer pixels are the supplied coordinate convention. The ±3 px coherent centre shift, ±10 px barrier-position shift, ±2 px top-height shift and 98–102 px/m scale are explicitly stipulated alternatives, not measured camera resolution or confidence limits.",
  "accuracyPolicy": "I retain exact or unrounded coefficients for calculations, display the nominal gap to about 0.1 pixel and use a corresponding rounded metre value. Extra decimal places allow the arithmetic to be checked; they do not imply physical measurement accuracy.",
  "accuracyReason": "The available margin and the allowed changes must be compared in the same pixel units before conversion. I test their effects directly instead of treating the small fitting RMSE as an uncertainty allowance.",
  "specialistTerms": "Centre-to-top clearance is the fitted centre height minus the barrier top at the same horizontal position. Robustly positive here means positive for every permitted input choice. A coherent centre shift moves all seven vertical coordinates by the same amount. These definitions do not establish whole-ball clearance.",
  "predictionComparison": "The positive nominal gap matched my expectation. Its reversal under the combined adverse choices rejected the stronger claim that this centre gap stays positive throughout the allowed alternatives.",
  "benefitFinding": "I can distinguish changes that alter the decision from changes that only alter its numerical units. The common scale preserves the gap sign, while the specified coordinate changes can reverse it.",
  "surpriseReason": "A ten-pixel shift of the barrier to the right almost consumes the nominal gap but does not reverse it alone. The additional permitted centre and top-height shifts are what make the combined adverse gap negative.",
  "surpriseCheck": "I evaluated the unchanged quadratic at 440, 450 and 460 pixels, proved how a common vertical shift changes its intercept, and checked the exact gap-change formula against the adverse and favourable table values.",
  "courseConcern": "I use familiar quadratic functions, completing the square and differentiation, then explain the additional least-squares derivation, RMSE summary and coherent-input sensitivity argument where they enter the investigation. I do not assume that these extensions are already known or use unexplained matrix or statistical formulas.",
  "technologyTool": "Graph plotter and numerical quadratic regression, checked by an exact algebraic calculation",
  "technologyInput": "All seven original pixel pairs, an equally weighted sum of squared vertical residuals and a quadratic with a free constant term. The scenario calculations retain these fitted coefficients except for the proved common intercept shift.",
  "technologyOutcome": "The technology output agrees with \\(P(X)=-X^2/500+(1679/1400)X+1683/14\\). Its fitting RMSE is about \\(1.922\\) px; the nominal, adverse and favourable centre gaps are about \\(+6.893,-4.314,+17.700\\) px.",
  "technologyInterpretation": "The exact centred-coordinate derivation checks the regression output independently of the plot. The scenario comparison answers the robustness question; neither a smooth graph nor a small fitting RMSE does so alone.",
  "courseWhy": "The core quadratic model becomes a linked investigation because its fit is explained, its derivative is used at the barrier and its nominal answer is tested against specified input changes.",
  "mathsLearning": "I began by asking whether a fitted arc lay above a barrier. Defining the signed gap showed that I needed to track how each input changes that one quantity. The derivative and an exact quadratic correction explain why several individually small changes can overturn the nominal answer.",
  "introduction": "A fitted arc can look comfortably above a barrier while the numerical gap is small. I want to determine whether a positive gap remains convincing when the coordinates used to calculate it are changed within stated limits. I will use seven constructed ball-centre positions and a barrier at \\(X=450\\) pixels with top height \\(Y=248\\) pixels, all in one defined coordinate frame.\n \nMy question concerns the modelled centre height at the barrier. A centre below the top rules out clearance there, but a centre above it does not establish that the whole ball passes: no ball radius is supplied. I therefore ask whether a quadratic model gives a positive centre-to-top gap and whether that sign survives the prescribed alternatives.\n \nI expect a small positive nominal gap. I will treat that as a result to test, rather than a final decision. The coordinates and alternatives are fictional mathematical inputs [D1]; there is no photograph, real throw or measured camera uncertainty behind them.",
  "dataNotes": "The supplied centres are \\((0,120),(100,222),(200,277),(300,300),(400,283),(500,218),(600,120)\\), in pixels [D1]. The origin lies on an assumed horizontal floor line below the first point, and positive \\(Y\\) points upwards. The original centres and barrier share a frontoparallel plane and a nominal calibration of \\(100\\text{ px/m}\\). I retain every centre and fit in pixels, so the gap compares two quantities in the same frame before any unit conversion.\n \nThe supplied alternatives allow the barrier horizontal coordinate to change by up to \\(10\\) px, its top height by up to \\(2\\) px, and all seven centre heights together by up to \\(3\\) px. The common scale may lie from \\(98\\) to \\(102\\text{ px/m}\\). These are the scenario's stated budgets, not error estimates inferred from a nonexistent image. At the nominal scale, the position allowances correspond to \\(0.10\\), \\(0.02\\) and \\(0.03\\) m. Their importance will depend on the gap and the slope of the fitted curve, rather than on their size alone.\n \nA common centre-height shift represents one systematic registration alternative. It is deliberately simpler than selecting each centre independently. I will test the robust-positive claim within these stated alternatives; I will not interpret the scenarios as equally likely events or replace the original data with them.",
  "stages": [
    {
      "key": "calibration",
      "title": "Establishing one coordinate frame for the gap",
      "methodId": "follow-journey",
      "kind": "model",
      "technique": "Coordinate calibration and domain choice",
      "bridge": "Before comparing a fitted height with the barrier top, I need to check that the coordinates describe the same plane and that the barrier lies inside the supplied horizontal range.",
      "purpose": "Figure 1 shows the seven original centres, and Table 1 keeps the calibration and barrier dimensions visible beside them.",
      "result": "At the nominal scale, \\(x=X/100\\) and \\(h=Y/100\\) in metres. For example, \\((300,300)\\) px becomes \\((3.00,3.00)\\) m. The barrier becomes \\((4.50,2.48)\\) m. Its horizontal coordinate satisfies \\(0<450<600\\), so evaluating a fitted curve there is interpolation between supplied positions. Even the alternative barrier coordinates, \\(440\\)–\\(460\\) px, remain inside that domain.\n \nThe centres rise towards the middle of the record and then fall. This supports testing a single arch-shaped function, while retaining the possibility that the individual centres will not lie exactly on it.",
      "observationText": "The common frame permits a height comparison, and the entire barrier-position range lies within the original coordinate domain.",
      "interpretation": "The domain check makes interpolation possible. It does not select the coefficients of the curve or show that its predicted gap will survive the coordinate alternatives.",
      "limitations": "A different image plane, origin or scale for the barrier would undermine this comparison. Those geometric complications are excluded by the supplied scenario rather than established by real calibration.",
      "localTakeaway": "The original and alternative barrier locations are inside the 0–600 px span, with centre and barrier heights expressed in one shared frame.",
      "nextQuestion": "How can I determine the quadratic from all seven pairs instead of forcing it through a convenient selection of three?",
      "nextWhy": "Using all the pairs allows departures from a simple arch to remain visible and gives me a stated rule for what the fitted curve represents.",
      "mathsInsight": "Interpolation requires a meaningful common coordinate frame as well as an input inside the observed horizontal span.",
      "methodChangeReason": "I retained a simple quadratic candidate and all seven centres; I did not choose points to force an exact arch.",
      "outcomeId": "quadratic",
      "knowledge": "syllabus"
    },
    {
      "key": "quadratic-path",
      "title": "Deriving the fitted quadratic and understanding its errors",
      "methodId": "quadratic-fit",
      "kind": "model",
      "technique": "Quadratic least squares and vertex calculation",
      "bridge": "I make “best fit” precise by comparing vertical discrepancies between each supplied centre and a candidate quadratic. This gives an equation I can calculate and check, rather than judge from the appearance of its graph.",
      "purpose": "Figure 2 will compare the resulting curve with the same seven original pairs. I first explain how the coefficients and the fitting-error summary are obtained.",
      "result": "For a candidate \\(P(X)=aX^2+bX+c\\), define the signed residual \\(e_i=Y_i-P(X_i)\\). A positive residual places the supplied centre above the fitted curve. Least squares chooses the coefficients to minimize \\(\\mathrm{SSE}=\\sum_{i=1}^{7}e_i^2\\) [M1]. Squaring prevents positive and negative discrepancies from cancelling and gives larger discrepancies more influence. A quadratic is linear in its unknown coefficients: once \\(X_i\\) is supplied, the numbers multiplying \\(a,b,c\\) are fixed.\n \nTo derive this particular fit using familiar algebra, I centre and scale the horizontal coordinate:\n\\[\nu=\\frac{X-300}{100},\\qquad q=u^2-4.\n\\]\nThe seven \\(u\\)-values are \\(-3,-2,-1,0,1,2,3\\), and their squares have mean \\(4\\). Thus \\(u\\) and \\(q\\) are dimensionless. Writing the same quadratic as \\(\\alpha+\\beta u+\\gamma q\\) does not restrict the possible curves. The useful sums are\n\\[\n\\sum u_i=\\sum q_i=\\sum u_iq_i=0,\\qquad\n\\sum u_i^2=28,\\quad\\sum q_i^2=84.\n\\]\nFor example, the products \\(u_iq_i\\) cancel in opposite pairs, while the central product is zero. From the supplied heights I also obtain\n\\[\n\\sum Y_i=1540,\\qquad\\sum u_iY_i=-2,\\qquad\\sum q_iY_i=-1680,\n\\]\nand \\(\\sum Y_i^2=372426\\). Expanding \\(\\sum[Y_i-\\alpha-\\beta u_i-\\gamma q_i]^2\\), the mixed coefficient terms disappear because their sums are zero. Completing the remaining squares gives\n\\[\n\\begin{aligned}\n\\mathrm{SSE}&=\\frac{181}{7}+7(\\alpha-220)^2\\\\\n&\\quad+28\\left(\\beta+\\frac1{14}\\right)^2+84(\\gamma+20)^2.\n\\end{aligned}\n\\]\nEvery square is nonnegative, so the minimum occurs at \\(\\alpha=220\\), \\(\\beta=-1/14\\) and \\(\\gamma=-20\\). Substituting \\(q=u^2-4\\) gives\n\\[\nP(X)=300-\\frac{u}{14}-20u^2\n=-\\frac{X^2}{500}+\\frac{1679X}{1400}+\\frac{1683}{14}.\n\\]\nThis agrees with the numerical regression output\n\\[\nP(X)\\approx-0.002000X^2+1.199285714X+120.214286.\n\\]\nI use the exact expression in subsequent calculations.\n \nThe minimum SSE is \\(181/7\\) squared pixels. The root mean squared error, or RMSE, is the square root of the mean of the seven squared residuals [M2]:\n\\[\n\\mathrm{RMSE}=\\sqrt{\\frac{\\sum e_i^2}{7}}\n=\\sqrt{\\frac{181}{49}}\\approx1.922\\text{ px}.\n\\]\nI divide by seven because I am describing these seven fitting discrepancies, not estimating a population variance. For example, \\(P(200)\\approx280.071429\\) px, so the supplied centre at \\(277\\) px has residual approximately \\(-3.071429\\) px. RMSE summarizes the overall discrepancy in the original height units; it is not a bound on every discrepancy or a prediction-error allowance.\n \nDifferentiating the fitted quadratic gives\n\\[\nP'(X)=-0.004X+\\frac{1679}{1400}.\n\\]\nIts zero is at \\(X_v\\approx299.8214\\) px, with \\(P(X_v)\\approx300.0001\\) px: about \\((2.998,3.000)\\) m at the nominal scale. The negative quadratic coefficient makes this an interior maximum. The barrier, even at \\(X=440\\), lies to its right on the descending branch. The derivative measures change in centre height per horizontal displacement here; there is no time variable from which to infer velocity.",
      "observationText": "The exact algebra reproduces the numerical quadratic. Its small fitting residuals describe the supplied arch, and the entire barrier range lies on its descending branch.",
      "interpretation": "The vertex now has a role in the decision: moving the barrier farther right lowers the fitted centre height. The 1.922-pixel RMSE describes the fit across the arch, but it does not show whether the separate barrier comparison remains positive after its inputs change.",
      "limitations": "The fitting rule treats the original horizontal coordinates as fixed and gives all vertical discrepancies equal weight. It is a defined approximation to these seven cases, not a claim of normally distributed errors or a verified physical law.",
      "localTakeaway": "The same quadratic is obtained by exact centred-coordinate algebra and numerical regression; its descending branch makes barrier-position changes consequential.",
      "nextQuestion": "At the nominal barrier location, how far above its top does this fixed fitted centre actually lie?",
      "nextWhy": "That signed gap gives the available margin against which the coordinate changes must be judged.",
      "mathsInsight": "A small average fitting discrepancy cannot establish the sign of a different quantity involving a barrier and changed coordinates.",
      "methodChangeReason": "I use the derivative to understand the barrier comparison rather than treating the vertex as an unrelated geometric result.",
      "outcomeId": "model-fit",
      "knowledge": "mixed",
      "unfamiliarComponent": "Deriving a three-coefficient least-squares quadratic with centred coordinates, and defining the residual RMSE.",
      "knowledgeNotes": "The least-squares criterion minimizes the sum of squared vertical residuals. On the symmetric centred grid, the mixed sums vanish, so completing the square separates the three coefficient choices. RMSE is the square root of the mean squared residual, expressed in pixels.",
      "understandingExample": "For \\(u=(X-300)/100\\) and \\(q=u^2-4\\), the supplied pairs give \\(\\sum u_iY_i=-2\\) and \\(\\sum u_i^2=28\\), producing the coefficient \\(\\beta=-2/28=-1/14\\). At \\(X=200\\), the residual is \\(277-280.071429\\approx-3.071429\\) px.",
      "researchSource": "NIST/SEMATECH e-Handbook of Statistical Methods, §4.1.4.1, Linear Least Squares Regression [M1], https://www.itl.nist.gov/div898/handbook/pmd/section1/pmd141.htm. Hyndman and Athanasopoulos, Forecasting: Principles and Practice, 3rd ed., §5.8, Evaluating point forecast accuracy [M2], https://otexts.com/fpp3/toolbox.html#evaluating-point-forecast-accuracy. I adapt the RMSE definition to fitting residuals; the centred-coordinate derivation and calculations are my own."
    },
    {
      "key": "nominal-clearance",
      "title": "Finding the nominal margin and separating scale from sign",
      "methodId": "follow-journey",
      "kind": "model",
      "technique": "Function evaluation and calibrated height comparison",
      "bridge": "I now keep the fitted coefficients fixed and compare the centre height with the barrier top at the same horizontal coordinate.",
      "purpose": "Figure 3 shows the curve near the barrier and the reference height of 248 pixels, making the subtraction visible.",
      "result": "Substituting \\(X_b=450\\) into the exact quadratic gives\n\\[\nP(450)=\\frac{7137}{28}\\approx254.892857\\text{ px}.\n\\]\nThe nominal centre-to-top gap is therefore\n\\[\nC_0=P(450)-248=\\frac{193}{28}\\approx+6.892857\\text{ px}.\n\\]\nAt \\(100\\text{ px/m}\\), this is \\(C_0/100\\approx0.06893\\) m, or about \\(6.9\\) cm. The positive sign answers the nominal centre-height question.\n \nI can now separate a change of units from a change in the underlying positions. Using the same positive divisor for the centre and barrier gives\n\\[\n\\frac{P(450)}s-\\frac{248}s=\\frac{C_0}s.\n\\]\nAt \\(s=98\\) and \\(102\\text{ px/m}\\), the gaps are approximately \\(0.07034\\) and \\(0.06758\\) m. Their sizes differ, but both remain positive. This sign invariance depends on a common scale and origin; it would not justify comparing objects calibrated in different planes.",
      "observationText": "The nominal centre gap is +6.893 px. A common scale change alters its metre value but leaves its sign unchanged.",
      "interpretation": "The 6.893-pixel gap is the margin available to absorb coordinate changes. The calibration range alone cannot use up that margin in sign terms, so the remaining question concerns the positions themselves.",
      "limitations": "This positive value belongs to the chosen curve and nominal coordinates. It is not yet a result for the allowed coordinate alternatives, and the fitting RMSE cannot be substituted for those separately specified changes.",
      "localTakeaway": "The nominal centre is above the top, but common rescaling and changes of position have mathematically different effects on that conclusion.",
      "nextQuestion": "Which permitted coordinate changes reduce this margin, and can their combined effect exceed it?",
      "nextWhy": "I need the direction and size of each contribution to the gap, not additional decimal places in the nominal answer.",
      "mathsInsight": "Dividing a difference by a common positive scale preserves its sign; altering either position can change the sign.",
      "methodChangeReason": "I retain the pixel gap as the decision quantity and examine the specified coordinate alternatives before making a robustness claim.",
      "outcomeId": "quadratic",
      "knowledge": "syllabus"
    },
    {
      "key": "coordinate-sensitivity",
      "title": "Explaining the reversal and deciding when to stop",
      "methodId": "follow-journey",
      "kind": "model",
      "technique": "Coherent perturbation scenarios and robust interpretation",
      "bridge": "On the descending branch, moving the barrier to the right lowers the fitted centre height. Shifting the centres down or the top up also reduces the gap. I will quantify these effects instead of treating all pixel changes as interchangeable.",
      "purpose": "Table 2 compares the nominal, adverse and favourable choices. The original centres remain unchanged in the source dataset; these are explicitly altered-input calculations.",
      "result": "First I need to justify how a common vertical centre shift changes the fitted curve. If every supplied height becomes \\(Y_i+d\\) and I replace \\(P\\) by \\(P+d\\), then\n\\[\n(Y_i+d)-[P(X_i)+d]=Y_i-P(X_i)=e_i.\n\\]\nEvery residual is unchanged. This correspondence also works backwards for any candidate quadratic, so the minimum sum of squares is unchanged: only the fitted constant term increases by \\(d\\). This argument applies to a common shift; independently moving each centre would require a different calculation.\n \nLet \\(\\delta_X\\) be the change in barrier horizontal position, \\(\\delta_Y\\) the common centre-height shift and \\(\\delta_B\\) the barrier-top shift. The permitted magnitudes are respectively \\(10\\), \\(3\\) and \\(2\\) pixels. The changed gap is\n\\[\nC=P(450+\\delta_X)+\\delta_Y-(248+\\delta_B).\n\\]\nFor the quadratic coefficient \\(a=-0.002\\), expanding and subtracting \\(C_0\\) gives the exact identity\n\\[\n\\begin{aligned}\n\\Delta C&=C-C_0\\\\\n&=P'(450)\\delta_X+a\\delta_X^2+\\delta_Y-\\delta_B.\n\\end{aligned}\n\\]\nThe slope is \\(P'(450)\\approx-0.600714\\): near the barrier, a one-pixel movement to the right lowers the centre height by about \\(0.60\\) pixel. The \\(a\\delta_X^2\\) term keeps the formula exact for the full displacement, rather than relying on that local rate alone.\n \nFor the adverse choices \\((\\delta_X,\\delta_Y,\\delta_B)=(10,-3,2)\\), the horizontal contribution is\n\\[\nP(460)-P(450)\\approx(-0.600714286)(10)-0.002(10)^2\n\\approx-6.207143\\text{ px}.\n\\]\nBy itself, that still leaves about \\(+0.685714\\) px. The common centre shift and the barrier-top shift remove another \\(3+2=5\\) px, so the total change is approximately \\(-11.207143\\) px. Equivalently,\n\\[\nC_{\\rm adverse}=P(460)-3-250\\approx-4.314286\\text{ px}.\n\\]\nThe combined choices, rather than the horizontal shift alone, reverse the sign.\n \nFor comparison, the favourable choices \\((-10,+3,-2)\\) give\n\\[\nC_{\\rm favourable}=P(440)+3-246=+17.7000\\text{ px}.\n\\]\nThe common calibration remains positive throughout \\(98\\)–\\(102\\text{ px/m}\\), so it cannot change either scenario's sign. These two calculations are neither a confidence interval nor a claimed worst-case bound for independent perturbations of all seven centres. They are two permitted cases within the defined coherent-shift scenario.",
      "observationText": "The adverse combined changes turn the +6.893 px nominal centre gap into −4.314 px. The horizontal change alone is insufficient to reverse it.",
      "interpretation": "The robust-positive claim requires every permitted input choice to retain a positive gap. The adverse choice is permitted and its gap is negative, so one counterexample settles that claim. My initial positive expectation survives only for the nominal model inputs.",
      "limitations": "The supplied allowances are not measured uncertainties, and independent centre changes, perspective effects and ball radius are outside this calculation. I have rejected positivity throughout the stated alternatives, not estimated how often a real ball would fail to clear.",
      "localTakeaway": "One permitted combined coordinate change gives a negative centre gap, so the nominal positive result is not robust within the stipulated scenario.",
      "nextQuestion": "I can therefore finish the investigation without determining the most negative gap over every permitted combination.",
      "nextWhy": "That optimization would answer a different question. The stated claim only requires me to decide whether every permitted gap stays positive, and the counterexample has settled it.",
      "mathsInsight": "The derivative describes the direction of a small horizontal effect, the quadratic term makes its finite change exact, and the counterexample determines the logical strength of the final claim.",
      "methodChangeReason": "I concluded once the robustness claim was settled instead of adding a new technique without an unresolved question.",
      "outcomeId": "poor-scale",
      "knowledge": "mixed",
      "unfamiliarComponent": "Coherent-input sensitivity, translation of a least-squares fit and an exact finite-change formula for the gap.",
      "knowledgeNotes": "A common vertical shift of all responses can be matched by the same intercept shift, preserving every residual and the least-squares minimum. Expanding a quadratic at X=450 separates the slope contribution, the quadratic correction and the two vertical shifts. One permitted negative case disproves positivity for every permitted case.",
      "understandingExample": "The exact change is \\(\\Delta C=P'(450)\\delta_X-0.002\\delta_X^2+\\delta_Y-\\delta_B\\). With \\((\\delta_X,\\delta_Y,\\delta_B)=(10,-3,2)\\), it is about \\(-11.207143\\) px, exceeding the nominal \\(+6.892857\\) px margin in magnitude and leaving \\(-4.314286\\) px.",
      "researchSource": ""
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
    "mainConclusion": "The fitted quadratic gives a nominal centre-to-top gap of \\(+6.893\\) px, about \\(+6.9\\) cm at the stipulated \\(100\\text{ px/m}\\) scale. However, moving the barrier \\(10\\) px right and \\(2\\) px higher while shifting every centre \\(3\\) px lower gives \\(-4.314\\) px. The centre therefore does not remain above the top for every allowed input choice.",
    "conclusionBenefit": "The calculation explains the failure rather than merely displaying it: the descending slope makes horizontal placement consequential, and the two vertical changes consume the remaining margin. A common positive scale changes the metre value but cannot restore a negative sign. The small fitting RMSE describes the original arch; it is not a guarantee for this barrier decision.",
    "conclusionExtension": "A useful follow-up would define the ball's radius and replace the stipulated allowances with evidence from a calibrated image in the same plane, including how centre and top positions are located. That would support a new question about whole-ball clearance. I have not obtained those inputs or demonstrated that any real ball clears a barrier."
  },
  "planningExtra": {
    "mathsOutside": "outside",
    "mathsRevisedWhy": "Quadratic functions, completing the square and differentiation provide the familiar core. I explain the additional least-squares derivation, residual RMSE and coherent-input sensitivity argument with definitions and worked steps rather than treating those extensions as already understood."
  },
  "completionExtra": {
    "mathsLearning": "Deriving the fit made its criterion explicit. Writing the gap change in terms of horizontal slope, quadratic correction and vertical shifts then connected the calculations to the robustness decision.",
    "referencesIssue": "D1 identifies the original constructed inputs. M1 supports the least-squares criterion and linearity in coefficients; M2 supplies the RMSE definition, adapted here to fitting residuals. The derivation and scenario algebra are my own."
  },
  "references": [
    {
      "label": "[D1] Constructed case record",
      "value": "Calibrated Ball Frame Cases v1: a synthetic side-view image-coordinate scenario with seven ball centres (horizontal pixel X, height-from-origin pixel Y): (0,120), (100,222), (200,277), (300,300), (400,283), (500,218), (600,120). A constructed reference of 100 pixels per metre applies equally to horizontal and vertical coordinates in a single assumed frontoparallel plane. Barrier evaluation uses X=450 pixels and a top level Y=248 pixels. Alternative scale 98–102 px/m, ball-coordinate shifts ±3 px, barrier position shifts ±10 px and top-edge registration shifts ±2 px are explicitly assumed scenarios, not observed errors. No real photograph, frame timing, physical throw or permissioned video is claimed."
    },
    {
      "label": "[M1] Least-squares method",
      "value": "NIST/SEMATECH e-Handbook of Statistical Methods, §4.1.4.1, Linear Least Squares Regression. https://www.itl.nist.gov/div898/handbook/pmd/section1/pmd141.htm. I use its least-squares criterion and distinction between polynomial shape and linear dependence on fitted coefficients. The centred-coordinate derivation and numerical working here are my own."
    },
    {
      "label": "[M2] Error measure",
      "value": "Hyndman, R. J. and Athanasopoulos, G., Forecasting: Principles and Practice, 3rd ed., §5.8, Evaluating point forecast accuracy. https://otexts.com/fpp3/toolbox.html#evaluating-point-forecast-accuracy. I adapt the RMSE definition to the seven fitting residuals; this is not a time-series forecast or an independent validation set."
    }
  ],
  "review": {
    "story": "The centre-gap question governs the coordinate setup, quadratic fit, nominal comparison and adverse scenario. The negative permitted case answers the stated robustness question.",
    "sequence": "A common frame makes the comparison meaningful; a checked least-squares equation supplies the interpolated height; the derivative and exact finite-change formula explain the loss of the nominal margin.",
    "notation": "I distinguish pixel coordinates, dimensionless fitting coordinates, signed residuals, centre gap and the three separate coordinate changes. The derivative is a geometric slope, not a velocity.",
    "purpose": "The decision concerns positivity of a centre-to-top gap throughout explicitly stated alternatives. It does not claim actual sporting success or whole-ball clearance.",
    "limits": "The coordinate budgets are stipulated, the centre shift is coherent, and no probability distribution or ball radius is supplied. A permitted counterexample is enough to reject the robust-positive claim.",
    "calculations": "I checked the seven-point centred sums, completed-square least-squares expression, residual RMSE, vertex, nominal gap and both scenario values. The horizontal-only gap stays positive; the combined adverse choices reverse it.",
    "presentation": "The existing native figures and tables remain beside the corresponding argument. The complete reader and PDF/Word layout still need rendered inspection.",
    "sources": "I identify the constructed inputs as D1 and distinguish the consulted least-squares and RMSE explanations in M1 and M2 from my own algebra and calculations.",
    "figures": "The seven original points, fitted curve, nominal barrier reference and scenario table retain their fixed values. The barrier-height reference is a level, not a drawing of a physical obstacle width.",
    "technology": "Numerical regression is checked against exact centred-coordinate algebra. I calculated the scenario effects from the same fitted polynomial rather than treating a graph image as the evidence."
  }
};
export const BALL_CASES=Object.freeze(STUDY.dataSets[0].rows.map(row=>Object.freeze(row)));
export const BALL_CLEARANCE_SPEC=buildModellingPass3(STUDY);
