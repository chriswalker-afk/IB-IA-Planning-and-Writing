import {buildModellingPass3} from './modelling-pass3-helpers.js';
const STUDY={
  "id": "stopping-distance",
  "routeId": "fitted-models",
  "title": "Comparing stopping-distance models and a reaction-time assumption",
  "course": "AI SL",
  "mathSelected": [
    "AI04",
    "AI09"
  ],
  "technologyStage": 2,
  "description": "A complete fictional comparison that uses residuals to choose a model, checks deliberately higher speeds, and separates prediction error from a reaction-time scenario.",
  "provenance": "Stopping Distance Design Cases v1: 14 explicitly constructed (speed in km/h, total distance in m) pairs, generated from s=0.5v+0.006v² plus a fixed small signed perturbation and rounded to 0.01 m. Speeds 20–70 km/h (11 cases) are the prespecified fitting set; 75, 80 and 85 km/h (three cases) were held out. These are not measured stopping distances, a published traffic dataset, braking trials or road-safety recommendations.",
  "citation": "Stopping Distance Design Cases v1, original constructed teaching data in this project; not a published or experimentally observed dataset.",
  "readingNote": "Fictional case study. Speed–distance values are constructed; the 75–85 km/h cases are a reserved numerical check and do not validate braking behaviour on real roads.",
  "idea": "I want to understand why the model with the smaller fitting error may still need a separate check of its shape, predictions and physical assumptions.",
  "aim": "I want to decide which of two models, a straight line or \\(s=av+bv^2\\), better predicts the three constructed stopping distances at \\(75,80,85\\text{ km h}^{-1}\\) after fitting only the eleven cases at \\(20\\)–\\(70\\text{ km h}^{-1}\\). I will compare their individual prediction errors and reserved-case RMSE. I will then calculate how a stipulated \\(\\pm0.25\\text{ s}\\) change in the chosen model’s reaction time changes its prediction at \\(60\\text{ km h}^{-1}\\), with braking deceleration fixed.",
  "motivation": "I am interested in how a simple formula can miss a pattern even when it passes through the middle of the data, and in what its coefficients allow me to conclude about a changed assumption.",
  "beneficiary": "I would use this constructed example to understand model comparison and the conditions attached to a prediction.",
  "intendedUse": "Choose the better of the two fixed models for the three supplied higher-speed cases, then quantify a separate change in its predicted distance under a specified reaction-time scenario.",
  "prediction": "I expect the straight line to underestimate the largest reserved distances because the braking part grows faster than speed.",
  "predictionWhy": "Under an ideal constant braking deceleration, braking distance is proportional to the square of speed; the distance travelled during reaction is proportional to speed.",
  "predictionImplication": "If the line misses the shape, its higher-speed errors may grow. Even if the alternative predicts the constructed cases closely, I must separately examine the effect of changing an assumption in that formula.",
  "firstAction": "Keep the 11 fitting cases separate from the three reserved values, then make a scatter and fit a linear baseline.",
  "readinessImprovement": "I have fixed the fitting/validation split and the generating units before comparing fitted parameters.",
  "teacherQuestion": "Have I explained the least-squares derivations, RMSE, reserved-case comparison and ideal-motion assumptions clearly enough beyond the familiar AI SL regression and function work?",
  "methodRecord": "I retained all fourteen supplied pairs. Only the eleven speeds from 20 to 70 km/h determine either fit; the three higher speeds provide a deliberate extrapolation check. Both models have two fitted coefficients. I explain their least-squares coefficients algebraically and compare their errors on the same three reserved cases before changing only the selected model’s reaction-time parameter.",
  "sourcePopulation": "These 14 constructed speed–distance cases only; they are not a sample of roads, vehicles or motorists.",
  "sampleSize": "11 fitting cases and three reserved numerical checks.",
  "pairing": "Each distance stays paired with its own speed. The three highest-speed cases are not used in fitting.",
  "modelEvidence": "One constructed series on 20–85 km/h with a fixed 20–70 km/h model-fitting range.",
  "inputs": "\\(v\\) in km/h; total stopping distance \\(s\\) in m. The speed-to-metres-per-second conversion is \\(u=v/3.6\\). The constructed records were generated from \\(s=0.5v+0.006v^2\\) with small preset deviations; I fitted the two candidate models without treating that recipe as independent physical evidence.",
  "assumptions": "I use an idealised constant reaction time and constant braking deceleration when interpreting the quadratic's positive coefficients. Road gradient, tyre grip, traffic, braking system and individual human variation are all outside the model.",
  "domain": "Fit only on \\(20\\le v\\le70\\text{ km h}^{-1}\\); compare against supplied constructed cases at \\(75,80,85\\text{ km h}^{-1}\\). I make no claims outside \\(20\\)–\\(85\\text{ km h}^{-1}\\), or about real driving.",
  "validation": "The 75, 80 and 85 km/h cases are excluded from both coefficient calculations. They check extrapolation above the fitting range within the disclosed constructed series. I compare all three signed errors, their magnitudes and reserved RMSE; they are not independent evidence about actual vehicles.",
  "alternative": "The unrestricted line p+qv is a two-parameter baseline for an approximately constant increase in distance per unit speed. The two-parameter alternative av+bv² includes curvature and imposes zero distance at zero speed. A free quadratic intercept would add a third parameter and discard that boundary condition, so I do not introduce it.",
  "chosenMethod": "Fit a least-squares line, inspect its residuals, then fit the constrained s=av+bv² model to the same 11 cases and compare the three reserved values.",
  "methodReason": "The two candidates answer a particular comparison: is a constant increase in distance per unit speed sufficient, or does including the braking term improve the predictions? Each has two fitted coefficients, so the quadratic does not gain an extra fitting parameter. I keep the line’s intercept free to give the straight-line baseline its least-squares fit over \\(20\\)–\\(70\\text{ km h}^{-1}\\); I impose the zero-distance condition only in the model derived from the two motion assumptions. I use the same fitting pairs and the same reserved checks for both.",
  "methodLimit": "A constructed series was partly designed to resemble a quadratic, so agreement with it cannot establish a real braking law. Both fits are conditional descriptions of the supplied numbers.",
  "consequence": "A small average fitting error does not show where a model misses the shape or how far its prediction changes when a parameter assumption changes.",
  "mitigation": "I disclose the recipe, keep the fitting and reserved cases separate, inspect signed residuals, and change reaction time alone in a stated conditional calculation.",
  "acceptable": "This is an illustration of modelling, not evidence for selecting a safe following distance or a real-world stopping rule.",
  "changedSincePlanning": "The line’s U-shaped residuals identified a reason for the quadratic comparison. The quadratic then had smaller absolute errors at all three reserved speeds, so I used it for the separate reaction-time calculation.",
  "dataStatusSummary": "All 14 fixed constructed pairs are in the source record. I fitted with 11 and retained the final three for a held-out arithmetic test.",
  "dataAimLink": "The source table therefore supplies two distinct tasks. The eleven lower-speed pairs determine the coefficients, while the three higher-speed pairs test what those fixed formulas predict beyond the fitting range. Because the second part of my aim changes reaction time alone, I also need a model whose two terms can be interpreted separately. Figure 1 starts with the line so that any improvement has a stated baseline.",
  "firstEvaluation": "The scatter keeps each pair visible, but visual agreement cannot answer the comparison. I need a defined fitting rule, numerical errors and a check at the speeds excluded from fitting. A low fitting error will also leave the separate reaction-time question unanswered.",
  "definitions": "\\(v\\): speed in km/h; \\(u=v/3.6\\): speed in m/s; \\(s\\): total stopping distance in m; \\(r=s-\\widehat s\\): signed model residual in m. My quadratic \\(\\widehat s=av+bv^2\\) has no constant term, unlike the fitted baseline \\(\\widehat s=p+qv\\).",
  "firstPresentation": "Figure 1 contains the 11 fitting pairs and the unrestricted least-squares line. Reserved cases are not shown or fitted here.",
  "accuracyQuantity": "Constructed speed and stopping distance",
  "accuracySymbol": "v, s",
  "accuracyUnit": "km/h; m",
  "accuracyResolution": "Speeds are set 5 km/h apart and distances are rounded to 0.01 m in the fictional cases; neither is a tested instrument resolution.",
  "accuracyPolicy": "Use full calculated coefficients for subsequent arithmetic. Show additional digits where needed to reproduce a fit, and report the final distances to 0.01 m. The stipulated ±0.25 s reaction change is a scenario, not a measured uncertainty interval.",
  "accuracyReason": "I preserved the 11-to-three split and full coefficients. Rounding the input distance is much smaller than the difference between the models' reserved predictions.",
  "specialistTerms": "Reaction distance is u times an assumed reaction time; ideal constant-deceleration braking gives u²/(2d). Their sum, not either component alone, is total modelled stopping distance.",
  "predictionComparison": "As expected, the straight-line residuals bend and its three high-speed errors are all positive. The constrained quadratic tracks those reserved constructed cases much more closely.",
  "benefitFinding": "The reserved cases favour the quadratic, but that ranking and its sensitivity to a changed reaction time are different conclusions supported by different calculations.",
  "surpriseReason": "A formula can agree closely with the supplied constructed cases while its prediction changes by several metres under the separately stipulated reaction-time change.",
  "surpriseCheck": "I changed the reaction-time term by ±0.25 s without refitting the invented dataset and calculated the resulting distance change exactly.",
  "courseConcern": "AI SL function and regression work provides the core. I explain the additional manual least-squares derivations, constrained two-term fit, residual/RMSE comparison and separate checking procedure in the printed argument. I derive the constant-deceleration distance model from its stated assumptions rather than invoking an unexplained physical formula.",
  "technologyTool": "Graph plotter and calculator",
  "technologyInput": "The eleven fitting pairs, the five sums A=Σv², B=Σv³, C=Σv⁴, D=Σvs and E=Σv²s for the constrained calculation, and the three untouched reserved pairs for checking.",
  "technologyOutcome": "The line was \\(\\widehat s=-10.59091+1.03909v\\); the two-term quadratic was \\(\\widehat s=0.501893v+0.00597024v^2\\).",
  "technologyInterpretation": "I use technology to evaluate the displayed sums and draw the models. The algebra explains which coefficients minimise the criterion, and the residual calculations determine the model comparison.",
  "courseWhy": "The investigation uses familiar linear and quadratic functions, then explains the additional least-squares algebra and checking methods that connect the fitted formulas to the stated question.",
  "mathsLearning": "I can now distinguish a fitting criterion, a comparison on cases excluded from fitting, and a conditional change in a model parameter. Success in one does not establish success in the others.",
  "introduction": "Stopping distance interested me because two simple ideas lead to different dependences on speed. During a fixed reaction time, doubling speed doubles the distance travelled; under constant braking deceleration, the braking distance grows with the square of speed. I wanted to understand what is lost when one straight line is used to describe their combined effect.\n\nI use fourteen explicitly constructed speed–distance pairs, not observations of a vehicle. My first question is which of two models, a straight line or \\(s=av+bv^2\\), better predicts the three supplied distances at \\(75,80,85\\text{ km h}^{-1}\\) when both are fitted only to the eleven cases at \\(20\\)–\\(70\\text{ km h}^{-1}\\). I will compare the individual prediction errors and their root mean squared error, an average error measure I explain below. This is a comparison between models for these cases; I am not setting a standard for an acceptable real stopping distance.\n\nI then ask a different, conditional question: how much does the selected model’s predicted distance at \\(60\\text{ km h}^{-1}\\) change if its reaction time is changed by \\(\\pm0.25\\text{ s}\\), while braking deceleration stays fixed? I choose 60 because it is a supplied speed inside the fitting range, so this calculation adds no further speed extrapolation. A quarter-second is a stipulated, easily interpreted change in each direction, not an estimate of human reaction-time variability. Together these questions let me distinguish agreement with a case set from dependence on an assumption.",
  "dataNotes": "I write \\(v\\) for the numerical speed in kilometres per hour and \\(s\\) for total stopping distance in metres. Stopping Distance Design Cases v1 [D1] contains the fourteen speeds \\(20,25,\\ldots,85\\). I generated each distance using \\(s=0.5v+0.006v^2\\), added the corresponding offset \\(0.4,-0.5,0.2,-0.3,0.5,0,-0.4,0.3,-0.1,0.4,-0.3,0.4,-0.5,0.2\\) metres, and rounded to \\(0.01\\text{ m}\\). That rounding describes the constructed numbers, not a measuring instrument. Since the recipe contains a quadratic, I expect the quadratic candidate to perform well; the investigation examines how the comparison and its limitations can be justified.\n\nI fixed the first eleven pairs as the fitting set and the last three as the reserved set before calculating the coefficients. Reserving the highest speeds deliberately tests extrapolation above the fitting range, where the difference between a line and a curved model may be exposed. It does not test performance throughout a population of speeds. Both parts come from the same known recipe, and no real braking trials are implied.\n\nTo motivate the alternative model, I use two idealised assumptions: the vehicle keeps its initial speed throughout a reaction time \\(\\tau\\), measured in seconds, and then slows at a constant positive deceleration \\(d\\), measured in \\(\\text{m s}^{-2}\\), until it stops. The speed in metres per second is\n\\[\nu=v\\frac{1000}{3600}=\\frac{v}{3.6}.\n\\]\nThe reaction distance is therefore \\(u\\tau\\). Constant deceleration means that speed decreases by \\(d\\) metres per second in each second, so braking from \\(u\\) to zero takes \\(u/d\\) seconds. Speed decreases linearly during this interval, making its average \\((u+0)/2=u/2\\). Multiplying that average speed by braking time gives\n\\[\n\\text{braking distance}=\\frac{u}{2}\\frac{u}{d}=\\frac{u^2}{2d}.\n\\]\nAdding the two distances and substituting \\(u=v/3.6\\) produces\n\\[\ns=\\frac{\\tau}{3.6}v+\\frac{1}{2d(3.6)^2}v^2=av+bv^2.\n\\]\nThus \\(a\\) and \\(b\\) are the coefficients of the reaction and braking terms when \\(v\\) is entered in km/h and the predicted distance is in metres. This model has zero distance at zero speed, as the assumptions require. The boundary condition is imposed, not verified by a zero-speed observation. Positive fitted coefficients will allow the interpretations \\(\\tau=3.6a\\) and \\(d=1/[2b(3.6)^2]\\); they will not independently measure those physical quantities.",
  "stages": [
    {
      "key": "baseline",
      "title": "Fitting a simple baseline before choosing a curve",
      "methodId": "linear-regression",
      "kind": "model",
      "technique": "Least-squares straight-line fit",
      "bridge": "I first need a rule for choosing the baseline line, rather than a line selected by eye.",
      "purpose": "Figure 1 shows the eleven fitting pairs and their least-squares line, \\(\\widehat s_L=p+qv\\). A hat denotes a predicted distance, and the subscript L identifies the line. The intercept \\(p\\) and gradient \\(q\\) are chosen to minimise the sum of squared vertical errors [M1]. For case \\(i\\), the signed residual is \\(r_i=s_i-\\widehat s_i\\): positive means the prediction is too small, and negative means it is too large. Squaring these errors prevents opposite signs from cancelling and gives greater weight to larger discrepancies.",
      "result": "For the eleven fitting pairs, the least-squares criterion is\n\\[\n\\mathrm{SSE}_L=\\sum_{i=1}^{11}(s_i-p-qv_i)^2.\n\\]\nHere \\(i\\) identifies a pair, \\(\\sum\\) means add over those eleven pairs, and SSE means sum of squared errors. To see why the usual coefficient formulas minimise it, I subtract the means: \\(x_i=v_i-\\bar v\\) and \\(y_i=s_i-\\bar s\\), so \\(\\sum x_i=\\sum y_i=0\\). Write the intercept as \\(p=\\bar s-q\\bar v+h\\), where \\(h\\) is a vertical displacement from the line passing through the mean pair. Substitution and expansion give\n\\[\n\\mathrm{SSE}_L=\\sum(y_i-qx_i-h)^2\n=\\sum(y_i-qx_i)^2+11h^2.\n\\]\nThe terms linear in \\(h\\) disappear because \\(\\sum(y_i-qx_i)=0\\). For every gradient, the smallest error therefore has \\(h=0\\), so \\(p=\\bar s-q\\bar v\\). Completing the remaining square in \\(q\\) gives\n\\[\n\\sum(y_i-qx_i)^2\n=\\sum y_i^2-\\frac{(\\sum x_i y_i)^2}{\\sum x_i^2}\n+\\left(\\sum x_i^2\\right)\n\\left(q-\\frac{\\sum x_i y_i}{\\sum x_i^2}\\right)^2.\n\\]\nOnly the last term depends on \\(q\\). Its positive coefficient makes the minimum occur when that square is zero. The numerical sums are \\(\\bar v=45\\), \\(\\bar s=397.85/11\\approx36.16818\\), \\(\\sum x_i^2=2750\\) and \\(\\sum x_i y_i=2857.5\\). Consequently,\n\\[\nq=\\frac{2857.5}{2750}\\approx1.03909091,\n\\qquad p=\\bar s-q\\bar v\\approx-10.590909,\n\\]\nso my baseline is \\(\\widehat s_L\\approx-10.590909+1.03909091v\\) metres.\n\nI use root mean squared error, abbreviated RMSE, to summarise the size of a set of errors [M2]. I square each residual, average these squares over the cases being assessed, and take the square root to return to metres:\n\\[\n\\mathrm{RMSE}=\\sqrt{\\frac{1}{n}\\sum_{i=1}^{n}r_i^2}.\n\\]\nHere \\(n\\) is the number of assessed cases, eleven for this fit. For example, at \\(v=20\\), the line predicts approximately \\(10.1909\\text{ m}\\), so the residual is \\(12.80-10.1909\\approx2.6091\\text{ m}\\). Adding all eleven squared residuals using the unrounded coefficients gives \\(\\mathrm{SSE}_L\\approx20.56909\\text{ m}^2\\), hence \\(\\mathrm{RMSE}_L\\approx\\sqrt{20.56909/11}\\approx1.3674\\text{ m}\\). This is a descriptive error summary, not an estimate of measurement uncertainty or a rule saying every error is smaller than 1.3674 m.",
      "observationText": "The distances rise increasingly quickly with speed; the straight line passes through the middle but does not follow the ends.",
      "interpretation": "The line provides the numerical baseline, but one average cannot reveal whether it repeatedly misses the same part of the pattern. Its negative intercept would also predict a negative distance at zero speed, so I cannot interpret this line as a physical rule down to rest.",
      "limitations": "Allowing that intercept gives the straight-line candidate its best squared-error fit on the specified range. It does not separate the reaction and braking distances, and the fitted cases contain no evidence near zero speed.",
      "localTakeaway": "My baseline is \\(\\widehat s_L=-10.590909+1.039091v\\), with about \\(1.3674\\text{ m}\\) fitting RMSE.",
      "nextQuestion": "The remaining question is whether the errors change sign systematically as speed increases.",
      "nextWhy": "Plotting the signed residuals against speed will preserve the information about direction and position that was lost when I reduced them to one RMSE.",
      "mathsInsight": "A fitted model's intercept can improve the training fit while violating a proposed physical boundary condition.",
      "methodChangeReason": "I inspect the line’s signed errors before deciding whether an alternative shape is justified.",
      "outcomeId": "systematic",
      "knowledge": "mixed",
      "unfamiliarComponent": "Deriving least-squares coefficients algebraically and interpreting RMSE, beyond obtaining a regression line from technology.",
      "knowledgeNotes": "I define squared error, centre both variables, separate a vertical offset and complete the square to explain the fitted line. I then define RMSE in metres and calculate it from the squared-error total.",
      "researchSource": "NIST/SEMATECH, e-Handbook of Statistical Methods, §4.1.4.1, Linear Least Squares Regression [M1]; Hyndman and Athanasopoulos, Forecasting: Principles and Practice, §5.8 [M2].",
      "understandingExample": "For the eleven pairs, \\(\\bar v=45\\), \\(\\bar s\\approx36.16818\\), \\(\\sum x_i^2=2750\\) and \\(\\sum x_i y_i=2857.5\\). Completing the square gives \\(q=2857.5/2750\\approx1.03909091\\) and \\(p=\\bar s-q\\bar v\\approx-10.590909\\). The error total \\(20.56909\\text{ m}^2\\) gives \\(\\sqrt{20.56909/11}\\approx1.3674\\text{ m}\\)."
    },
    {
      "key": "linear-residuals",
      "title": "Reading the systematic residual pattern",
      "methodId": "linear-regression",
      "kind": "model",
      "technique": "Signed residuals and domain checking",
      "bridge": "I kept the fitted line unchanged and calculated its signed error at each of the eleven fitting speeds.",
      "purpose": "Figure 2 plots those residuals against speed with a horizontal zero reference. A point above zero means the line underpredicts that case; a point below zero means it overpredicts.",
      "result": "Three calculations illustrate the pattern. At \\(v=20\\), the prediction \\(10.1909\\text{ m}\\) is below the supplied \\(12.80\\text{ m}\\), so \\(r_L\\approx+2.6091\\text{ m}\\). At \\(v=45\\), the line predicts \\(36.1682\\text{ m}\\) against \\(34.65\\text{ m}\\), giving \\(r_L\\approx-1.5182\\text{ m}\\). At \\(v=70\\), it predicts \\(62.1455\\text{ m}\\) against \\(64.10\\text{ m}\\), giving \\(r_L\\approx+1.9545\\text{ m}\\). The full plot has a U-shaped pattern: residuals near the ends are positive, while those through most of the middle are negative.\n\nThis tells me where the line fails. Its constant gradient cannot follow the increasing rate at which these distances rise with speed. A positive squared-speed term is consistent with this pattern, and the reaction-plus-braking derivation has already supplied a reason for that particular term.",
      "observationText": "The baseline residuals have a U-shaped pattern with positive errors at both ends of the fitted range.",
      "interpretation": "The residual plot therefore turns a visual suspicion into a specific model comparison. I have a reason to test av+bv², rather than add polynomial terms simply to reduce the fitting error.",
      "limitations": "A U-shaped residual plot does not uniquely identify a quadratic or establish the physical assumptions. The disclosed quadratic recipe also makes this pattern expected in the present example.",
      "localTakeaway": "The line underpredicts at 20 and 70 km/h and overpredicts around 45 km/h; a quadratic comparison is justified.",
      "nextQuestion": "I now need to determine whether the zero-intercept quadratic actually reduces the errors and gives positive coefficients that can be interpreted using the two assumptions.",
      "nextWhy": "That requires fitting its two coefficients to the same eleven cases. Drawing a curved line through the scatter would not determine the least-squares model or show whether its coefficient signs make sense.",
      "mathsInsight": "Where the errors occur matters as much as their root mean square magnitude.",
      "methodChangeReason": "I test the two-term model already derived from reaction and constant-deceleration braking.",
      "outcomeId": "quadratic-plausible",
      "knowledge": "mixed",
      "unfamiliarComponent": "Using a signed residual pattern to diagnose a missing model shape rather than relying only on an error average.",
      "knowledgeNotes": "The residual definition and sign convention are explained at first use. This stage works through three actual residuals, connects their signs to under- and overprediction, and states why the pattern motivates but cannot prove a quadratic term.",
      "researchSource": "NIST/SEMATECH, Linear Least Squares Regression [M1], for the squared-error fitting criterion; the residual calculations and shape comparison here are my own work on the constructed pairs.",
      "understandingExample": "At \\(v=45\\), \\(r_L=34.65-36.16818\\approx-1.5182\\text{ m}\\), so the line is too high. At 20 and 70 km/h the residuals are positive, so the direction of the error differs between the middle and ends."
    },
    {
      "key": "quadratic",
      "title": "Fitting a reaction-plus-braking quadratic",
      "methodId": "quadratic-fit",
      "kind": "model",
      "technique": "Constrained least squares for two polynomial terms",
      "bridge": "I use \\(\\widehat s_Q=av+bv^2\\), where Q identifies the quadratic. Its zero intercept is built into the formula; I do not fit a free quadratic and then discard its constant term.",
      "purpose": "Figure 3 compares the resulting quadratic with the line on the same eleven fitting cases. Although the curve is quadratic in speed, each unknown coefficient multiplies a known term, so I can apply the least-squares criterion to a and b [M1]. I explain the constrained calculation because it is an additional method beyond obtaining a standard regression line from technology.",
      "result": "I minimise\n\\[\n\\mathrm{SSE}_Q(a,b)=\\sum_{i=1}^{11}(s_i-av_i-bv_i^2)^2.\n\\]\nAll sums in this calculation use the eleven fitting pairs and their numerical values in the stated units. To keep the expansion readable, define\n\\[\nA=\\sum v_i^2=25025,\\qquad B=\\sum v_i^3=1373625,\n\\]\n\\[\nC=\\sum v_i^4=79743125,\\qquad D=\\sum v_i s_i=20760.75,\n\\]\n\\[\nE=\\sum v_i^2s_i=1165498.75,\\qquad S=\\sum s_i^2=17379.2825.\n\\]\nExpanding the squared residuals gives\n\\[\n\\mathrm{SSE}_Q=S-2aD-2bE+a^2A+2abB+b^2C.\n\\]\nFor any fixed value of \\(b\\), I can complete the square in \\(a\\):\n\\[\n\\mathrm{SSE}_Q\n=A\\left(a-\\frac{D-Bb}{A}\\right)^2\n+S-2bE+b^2C-\\frac{(D-Bb)^2}{A}.\n\\]\nBecause \\(A=25025>0\\), the first term is smallest when its square is zero. Thus the best \\(a\\) for that particular \\(b\\) is \\((D-Bb)/A\\). Substituting it leaves a quadratic expression in just \\(b\\):\n\\[\n\\mathrm{SSE}_{\\min a}(b)\n=S-\\frac{D^2}{A}-2Lb+Kb^2,\n\\]\nwhere\n\\[\nK=C-\\frac{B^2}{A}\\approx4344697.8022>0,\n\\qquad L=E-\\frac{BD}{A}\\approx25938.9011.\n\\]\nCompleting this second square gives\n\\[\n\\mathrm{SSE}_{\\min a}(b)\n=S-\\frac{D^2}{A}-\\frac{L^2}{K}\n+K\\left(b-\\frac{L}{K}\\right)^2.\n\\]\nThe first three terms are constants. Since \\(K>0\\), this remaining square is minimised at \\(b=L/K\\). Choosing that value and then its corresponding \\(a\\) makes both completed-square terms zero, so it gives the least possible SSE over both coefficients. Using the full values of the sums, I obtain\n\\[\nb=\\frac{L}{K}\\approx0.0059702428753,\n\\qquad a=\\frac{D-Bb}{A}\\approx0.5018931121.\n\\]\nMy fitted model is consequently\n\\[\n\\widehat s_Q\\approx0.50189311v+0.00597024v^2.\n\\]\nThe eleven squared residuals sum to approximately \\(1.2944645\\text{ m}^2\\), giving \\(\\mathrm{RMSE}_Q\\approx\\sqrt{1.2944645/11}\\approx0.3430\\text{ m}\\). For example, the prediction at 60 km/h is \\(51.6065\\text{ m}\\), so its residual against the supplied \\(51.50\\text{ m}\\) is about \\(-0.1065\\text{ m}\\).\n\nBoth coefficients are positive, as required by the proposed interpretation. Matching them with the derived motion formula gives\n\\[\n\\tau=3.6a\\approx1.8068\\text{ s},\n\\qquad d=\\frac{1}{2b(3.6)^2}\\approx6.4621\\text{ m s}^{-2}.\n\\]\nThese are the reaction time and deceleration implied by this fitted hypothetical model. They are not separately observed quantities.",
      "observationText": "The constrained curve follows the two ends of the constructed series better than the baseline.",
      "interpretation": "The quadratic reduces fitting RMSE from 1.3674 m to 0.3430 m using the same number of fitted coefficients as the line. Its positive coefficients also retain the intended reaction and braking interpretations. This answers the fitting and interpretation questions, but my original model comparison concerns the three higher speeds.",
      "limitations": "The coefficients were chosen to minimise errors on these eleven cases, and the series was constructed from a quadratic recipe. A better fitting score alone therefore cannot establish the reserved predictions or performance on real data.",
      "localTakeaway": "The constrained model is \\(\\widehat s_Q=0.50189311v+0.00597024v^2\\), with \\(0.3430\\text{ m}\\) fitting RMSE.",
      "nextQuestion": "The unresolved comparison is whether the quadratic also has smaller errors at 75, 80 and 85 km/h, with both models now fixed.",
      "nextWhy": "Using those excluded pairs checks the higher-speed predictions without allowing their distances to determine the coefficients. Once that comparison selects a model, I can address the second part of the aim by changing its reaction-time parameter alone.",
      "mathsInsight": "Constraining the intercept changes both the fitted coefficients and the interpretation; it is not the same as ordinary unconstrained quadratic regression.",
      "methodChangeReason": "I finish fitting before examining the reserved errors, then treat reaction-time sensitivity as a separate conditional calculation.",
      "outcomeId": "model-fit",
      "knowledge": "mixed",
      "unfamiliarComponent": "Deriving and fitting the constrained two-term least-squares model by eliminating one coefficient and completing the square in the other.",
      "knowledgeNotes": "I define five data sums, expand the squared-error criterion, minimise first in a for each fixed b, and complete a second square in b. The positive numerical coefficients establish a minimum without using partial derivatives. I then connect a and b to the ideal reaction time and deceleration.",
      "researchSource": "NIST/SEMATECH, Linear Least Squares Regression [M1], for least squares in models linear in their coefficients. The two-square derivation and numerical substitutions here are my own algebra.",
      "understandingExample": "With \\(A=25025\\), \\(B=1373625\\), \\(C=79743125\\), \\(D=20760.75\\), \\(E=1165498.75\\), I obtain \\(K=C-B^2/A\\approx4344697.8022>0\\) and \\(L=E-BD/A\\approx25938.9011\\). The minimum has \\(b=L/K\\approx0.0059702428753\\), then \\(a=(D-Bb)/A\\approx0.5018931121\\)."
    },
    {
      "key": "reserved-check",
      "title": "Reserved speeds and a reaction-time sensitivity",
      "methodId": "follow-journey",
      "kind": "model",
      "technique": "Prediction errors and parameter sensitivity",
      "bridge": "I now apply each fixed formula to the same three excluded speeds. Since these distances did not determine the coefficients, their errors check a different part of the constructed series from the fitting errors [M2].",
      "purpose": "Table 1 places the supplied distances, both predictions and both signed errors side by side. Keeping every reserved case visible lets me check whether the RMSE comparison hides a case where the model ranking is reversed.",
      "result": "The supplied distances at \\(75,80,85\\text{ km h}^{-1}\\) are \\(71.65,77.90,86.05\\text{ m}\\). For example, at 75 km/h the line predicts approximately \\(67.3409\\text{ m}\\), giving \\(71.65-67.3409\\approx+4.3091\\text{ m}\\). The quadratic predicts approximately \\(71.2246\\text{ m}\\), giving \\(71.65-71.2246\\approx+0.4254\\text{ m}\\).\n\nAcross the three speeds, the line’s signed errors are approximately \\(+4.309,+5.364,+8.318\\text{ m}\\); it underpredicts every distance and its errors grow with speed. The quadratic’s errors are approximately \\(+0.425,-0.461,+0.254\\text{ m}\\). Each has smaller magnitude than the corresponding line error. Using the full-precision errors before squaring gives\n\\[\n\\mathrm{RMSE}_{L,\\mathrm{reserved}}\n\\approx\\sqrt{116.5290083/3}\\approx6.2324\\text{ m},\n\\]\n\\[\n\\mathrm{RMSE}_{Q,\\mathrm{reserved}}\n\\approx\\sqrt{0.4580466/3}\\approx0.3907\\text{ m}.\n\\]\nHere I divide by three because three cases are being assessed; I have not refitted either formula. Both the individual magnitudes and the reserved RMSE favour the quadratic. This completes the first comparison for the specified cases.\n\nThat result leaves my second question open. Agreement with the supplied distances does not tell me what happens if the reaction-time assumption changes. I therefore keep the selected quadratic’s braking deceleration fixed and use the stipulated speed of 60 km/h. Its predicted \\(51.6065\\text{ m}\\) consists of \\(a(60)\\approx30.1136\\text{ m}\\) of reaction distance and \\(b(60)^2\\approx21.4929\\text{ m}\\) of braking distance.\n\nWrite \\(\\Delta\\tau\\) for the change in reaction time and \\(\\Delta s\\) for the resulting change in predicted distance. At fixed speed and deceleration, the braking terms cancel when I subtract the original prediction from the changed one:\n\\[\n\\Delta s=\\left(u(\\tau+\\Delta\\tau)+\\frac{u^2}{2d}\\right)\n-\\left(u\\tau+\\frac{u^2}{2d}\\right)=u\\Delta\\tau.\n\\]\nTherefore the stipulated changes \\(\\Delta\\tau=\\pm0.25\\text{ s}\\) give\n\\[\n\\Delta s=\\frac{60}{3.6}(\\pm0.25)\n\\approx\\pm4.1667\\text{ m}.\n\\]\nThe two conditional distance predictions are approximately \\(47.44\\text{ m}\\) and \\(55.77\\text{ m}\\), compared with \\(51.61\\text{ m}\\) for the fitted parameter. These are two what-if calculations, not lower and upper confidence limits.",
      "observationText": "The linear reserved errors increase at high speeds, whereas the quadratic's three errors stay below half a metre in magnitude.",
      "interpretation": "The quadratic is the better of these two fixed models for all three reserved cases. Separately, the stipulated quarter-second change shifts its 60 km/h prediction by about 4.17 m. That shift is larger than its 0.3907 m reserved RMSE, but the quantities answer different questions: one changes an assumption, while the other measures disagreement with supplied distances. Close agreement with the constructed cases therefore does not describe the prediction’s sensitivity by itself.",
      "limitations": "The reserved cases share the known constructed mechanism and cover only three speeds above the fitting range. The reaction-time scenario neither measures human variability nor tests whether the model ranking would change under different data. It changes the selected formula while keeping its braking deceleration fixed.",
      "localTakeaway": "Held-out RMSE is 6.2324 m for the line versus 0.3907 m for the constrained quadratic, while a hypothetical quarter-second reaction change shifts the 60 km/h estimate by 4.1667 m.",
      "nextQuestion": "Both parts of my stated question are now answered: the quadratic wins the reserved-case comparison, and the selected prediction changes by ±4.17 m under the stipulated reaction-time change.",
      "nextWhy": "I stop here because further polynomial terms or another fit would address a different comparison. Establishing how either model represents an actual vehicle would require new observations, which this constructed investigation does not contain.",
      "mathsInsight": "A model comparison and a parameter-sensitivity calculation answer different questions even when both results are expressed in metres.",
      "methodChangeReason": "After selecting the quadratic on the reserved cases, I keep its deceleration fixed and change only the stipulated reaction time.",
      "outcomeId": "constraints",
      "knowledge": "mixed",
      "unfamiliarComponent": "Separating error on cases excluded from fitting from a deterministic change in a model parameter.",
      "knowledgeNotes": "I explain why the reserved cases provide a different check from fitted residuals, calculate their RMSE with n=3, and define Δ as a change before deriving Δs=(v/3.6)Δτ at fixed deceleration. The scenario is not a confidence interval or a test of a changed model ranking.",
      "researchSource": "Hyndman and Athanasopoulos, Forecasting: Principles and Practice, 3rd edition, §5.8, Evaluating point forecast accuracy [M2]. I adapt the distinction between fitting and checking to higher-speed paired cases, not to a time-series forecasting procedure.",
      "understandingExample": "At 75 km/h, the quadratic residual is \\(71.65-71.2246\\approx0.4254\\text{ m}\\). Its three squared errors total about \\(0.4580466\\text{ m}^2\\), so the reserved RMSE is \\(\\sqrt{0.4580466/3}\\approx0.3907\\text{ m}\\). Separately, \\(\\Delta\\tau=0.25\\text{ s}\\) at 60 km/h gives \\(\\Delta s=(60/3.6)(0.25)\\approx4.1667\\text{ m}\\)."
    }
  ],
  "figures": [
    {
      "id": "figure-p3-stop-linear",
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
      "id": "figure-p3-stop-residual",
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
      "id": "figure-p3-stop-overlay",
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
      "id": "table-p3-stop-held",
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
    "mainConclusion": "For Stopping Distance Design Cases v1, the constrained quadratic \\(\\widehat s_Q\\approx0.50189311v+0.00597024v^2\\) answers my model-comparison question better than the line. The line’s U-shaped fitting residuals identified the missing curvature; the derived reaction and braking terms supplied a reason to test this particular alternative. On the three specified higher speeds, the quadratic has smaller absolute errors in every case and reserved RMSE \\(0.3907\\text{ m}\\), compared with \\(6.2324\\text{ m}\\) for the line. That result concerns these fixed constructed predictions, not a general stopping rule.",
    "conclusionBenefit": "The separate assumption check qualifies what this choice means. At \\(60\\text{ km h}^{-1}\\), the selected model predicts \\(51.61\\text{ m}\\) with its implied reaction time of about \\(1.8068\\text{ s}\\). Changing that time by the stipulated \\(\\pm0.25\\text{ s}\\), while keeping deceleration fixed, changes the prediction by \\(\\pm4.17\\text{ m}\\), giving approximately \\(47.44\\) or \\(55.77\\text{ m}\\). I have established both a comparative result and a conditional dependence on an assumption; the small reserved residuals do not remove that dependence.",
    "conclusionExtension": "A focused next investigation would measure reaction time and total stopping distance independently under fixed braking conditions, then examine whether the observed distance changes follow \\(\\Delta s=u\\Delta\\tau\\). That would test the assumption that drives my second conclusion instead of simply refitting the same designed cases. Those observations are outside this investigation; the present result is complete within its stated constructed scope."
  },
  "review": {
    "story": "The line provides a defined baseline, its residuals motivate the constrained quadratic, reserved errors select the model, and a separate reaction-time calculation answers the second part of the original aim.",
    "sequence": "Each stage identifies what the preceding result leaves unresolved. The final stage and conclusion explicitly close the two stated questions instead of opening an unperformed extra mathematical stage.",
    "notation": "I define speed and distance units, predicted values, signed residuals, SSE and RMSE, all constants in the least-squares derivations, and Δ as a change. I use approximate signs for rounded coefficients and outputs.",
    "purpose": "The decision is a comparative judgement on three constructed higher-speed cases followed by a specified parameter change, not a universal accuracy claim or a real stopping-distance recommendation.",
    "limits": "The known quadratic recipe, deliberate extrapolation check, imposed zero intercept and stipulated reaction-time change are explained where they affect the argument.",
    "calculations": "I recomputed both coefficient sets, all least-squares sums, the fitting and reserved errors, the parameter interpretations and the two reaction-time scenario predictions. The minimum is justified by two positive completed-square terms.",
    "presentation": "The complete reader and PDF/Word outputs still require export inspection. The figures remain beside the results they support, and the new mathematical explanations are in rendered prose fields.",
    "sources": "I retain the complete constructed recipe as [D1], cite NIST/SEMATECH for the least-squares criterion [M1] and OTexts for RMSE and separate checking [M2], and distinguish those sources from my algebra and fictional cases.",
    "figures": "Three native graphs and one native table use the same case IDs and calculated values as the text.",
    "technology": "Technology evaluates the explicitly defined sums and draws the models; the printed derivations explain the coefficients, and worked errors reproduce the interpretation. The reserved values never determine either fit."
  },
  "planningExtra": {
    "mathsOutside": "outside",
    "mathsRevisedWhy": "The core is AI SL regression and linear/quadratic functions. I explain the additional least-squares derivations and constrained fit using completing the square, define residuals and RMSE with worked values, and explain the reserved-case and parameter-sensitivity procedures where they first enter the printed argument."
  },
  "references": [
    {
      "label": "[D1] Constructed case record",
      "value": "Stopping Distance Design Cases v1: 14 explicitly constructed (speed in km/h, total distance in m) pairs, generated from s=0.5v+0.006v² plus a fixed small signed perturbation and rounded to 0.01 m. Speeds 20–70 km/h (11 cases) are the prespecified fitting set; 75, 80 and 85 km/h (three cases) were held out. These are not measured stopping distances, a published traffic dataset, braking trials or road-safety recommendations."
    },
    {
      "label": "Calculation record",
      "value": "The editable fourteen-case table and working calculation table supplied with this investigation. The coefficient derivations, residuals, scenario calculations and figures are my own working from those constructed inputs."
    },
    {
      "label": "[M1] Least-squares method",
      "value": "NIST/SEMATECH. e-Handbook of Statistical Methods, §4.1.4.1, Linear Least Squares Regression. https://www.itl.nist.gov/div898/handbook/pmd/section1/pmd141.htm (accessed 23 October 2026). Source for the least-squares criterion and models linear in their coefficients. I give my own algebraic derivations by completing squares for the line and the constrained two-term model."
    },
    {
      "label": "[M2] Error measure and separate checking cases",
      "value": "Hyndman, R. J., and Athanasopoulos, G. (2021). Forecasting: Principles and Practice, 3rd edition. OTexts, Melbourne. §5.8, Evaluating point forecast accuracy. https://otexts.com/fpp3/toolbox.html#evaluating-point-forecast-accuracy (accessed 23 October 2026). Source for RMSE and the distinction between fitting and test errors. I apply these ideas to fixed higher-speed paired cases, not to a time-series forecasting procedure."
    }
  ]
};
export const STOPPING_CASES=Object.freeze(STUDY.dataSets[0].rows.map(row=>Object.freeze(row)));
export const STOPPING_DISTANCE_SPEC=buildModellingPass3(STUDY);
