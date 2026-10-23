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
  "description": "A constructed cooling investigation connects an explicitly defined logarithmic fit to a target time, later-value checks and three alternative ambient assumptions.",
  "provenance": "Cooling Cup Cases v1: sixteen constructed two-minute temperature entries from 0 to 30 minutes. They were generated from T=26+58 exp(-0.04t) °C with the fixed offsets (0,0.2,-0.2,0.1,-0.1,0.2,-0.15,0.1,-0.1,0.15,-0.1,0.1,-0.1,0.15,-0.2,0.1) °C, then rounded to 0.1 °C. Entries at 0–20 min were allocated to modelling; 22–30 min to a prespecified check. The ambient 26 °C and alternative 25/27 °C scenarios are assumptions, not measured room temperatures.",
  "citation": "Cooling Cup Cases v1. Original deliberately constructed data and generation recipe supplied in this project; no physical cup or thermometer was used.",
  "readingNote": "Sixteen constructed temperatures support a conditional time estimate and stated comparisons. They do not record the exact crossing of a physical drink.",
  "idea": "I want a modelled time for a chosen temperature, together with checks that show what that number does and does not establish.",
  "aim": "To estimate when the constructed cooling series reaches \\(50\\,^\\circ\\mathrm C\\) using a model fitted to the \\(0\\)–\\(20\\) minute values, compare that estimate with the five later values and a local interpolation, and determine how refitting at ambient temperatures of \\(25\\), \\(26\\) and \\(27\\,^\\circ\\mathrm C\\) changes the answer.",
  "motivation": "A decreasing temperature curve does not by itself give a dependable target time. I want to connect the cooling model, the later supplied values and the ambient assumption to the precision of the final answer.",
  "beneficiary": "I would use the result to understand a conditional threshold estimate for this hypothetical cup. The chosen temperature is a scenario input, not a drinking recommendation.",
  "intendedUse": "Report a modelled threshold time with explicit numerical comparisons, without presenting an interpolated time or a small temperature error as a measured crossing-time accuracy.",
  "prediction": "I expect a roughly constant proportional decrease in temperature above the assumed ambient. I also expect the estimated crossing to lie between the supplied 22- and 24-minute values.",
  "predictionWhy": "The constructed series was generated from an ambient-offset exponential, so this is a consistency expectation about the supplied recipe, not a discovery of a physical cooling law.",
  "predictionImplication": "An exponential can give a time beyond the fitting interval, but the values excluded from its coefficients and the alternative ambient refits must be examined before choosing how to report it.",
  "firstAction": "Preserve the stated fitting/checking split, define excess temperature above ambient and compare equal-time changes before fitting a logarithmic line.",
  "readinessImprovement": "I have an answerable comparison aim, the complete construction recipe and a fixed distinction between values used for coefficients and values used to check the resulting curve.",
  "teacherQuestion": "Have I explained the transformed least-squares objective, Celsius error summaries and conditional timing comparison clearly enough for an AI SL reader?",
  "methodRecord": "I retained all sixteen constructed pairs in time order. Only the eleven values at 0–20 minutes enter the log-line fit. I then evaluated the fixed curve on the five later values, solved the target, interpolated between its two neighbouring entries and repeated the fit at three stated ambient assumptions.",
  "sourcePopulation": "Only this declared constructed cup-in-room scenario, not a population of drinks or recorded experiments.",
  "sampleSize": "16 constructed readings at two-minute steps; 11 for fitting, five reserved.",
  "pairing": "Each temperature belongs to the exact time at which the fictional record places it; I preserve order and do not sort temperatures separately.",
  "modelEvidence": "A fixed, deliberately exponential 0–30 minute series with all values visible. Five entries are excluded from estimating coefficients; they are not an unseen physical experiment.",
  "inputs": "Elapsed time \\(t\\) in minutes, temperature \\(T\\) in degrees Celsius and excess \\(E=T-A\\) in Celsius degrees. The nominal ambient \\(A=26\\,^\\circ\\mathrm C\\) and alternatives \\(25\\) and \\(27\\,^\\circ\\mathrm C\\) are supplied assumptions.",
  "assumptions": "A constant ambient and one exponential excess-temperature curve over the specified window. The chosen fitting rule gives equal weight to squared log-excess discrepancies. No probability distribution for the constructed offsets or physical thermometer accuracy is assumed.",
  "domain": "Coefficients use \\(0\\le t\\le20\\) min. The later checks are at \\(22,24,26,28,30\\) min. The estimated crossing near \\(22.07\\) min is an extrapolation beyond the fitting interval, although it lies inside the full supplied record.",
  "validation": "I compare original-scale errors on five values excluded from fitting and calculate a separate straight-line interpolation between the 22- and 24-minute entries. These check agreement within the constructed record; neither supplies a known physical crossing time or a continuous error bound.",
  "alternative": "A single constant-drop line would ignore the decreasing excess-temperature changes. A local line between two neighbouring values is useful as a separate interpolation check, but does not establish the true path between them. Fitting squared Celsius errors directly would also be a different objective from the chosen log fit.",
  "chosenMethod": "Define and derive an equally weighted least-squares line in log excess, invert it to temperature, compare Celsius errors and solve the target. Refit the same eleven entries separately for each stated ambient.",
  "methodReason": "I choose an exponential of \\(E=T-A\\) because the question concerns cooling towards the ambient level. A fixed proportional decrease in \\(E\\) becomes a straight-line relationship after taking logarithms. I will state what that fit minimises and then return to Celsius, since a small transformed discrepancy alone does not answer a temperature question.",
  "methodLimit": "The known construction rule favours an exponential. Equal log-error weighting is a chosen modelling criterion, not evidence that the fixed additive offsets are random multiplicative errors.",
  "consequence": "Agreement with this designed record cannot measure the accuracy of a physical crossing time. It also does not justify treating a largest sampled temperature error as an error bound between samples.",
  "mitigation": "I keep the later cases out of the coefficients, distinguish the interpolation comparison from truth and compare the three ambient refits in minutes before setting the reporting precision.",
  "acceptable": "The work answers a conditional numerical question for this fixed series. It does not estimate a population cooling law or calibrated uncertainty for a real cup.",
  "changedSincePlanning": "The later values agree closely with the fitted curve, as expected from their recipe. The useful result is a target time with explicit comparison scales, rather than a claim that those checks establish true timing accuracy.",
  "dataStatusSummary": "All sixteen original constructed values remain in time order: eleven fitting entries and five later checking entries, with no deletions or newly invented readings.",
  "dataAimLink": "Let \\(E=T-A\\) be the temperature difference above ambient. At the nominal setting, the target \\(50\\,^\\circ\\mathrm C\\) corresponds to \\(E=24\\,^\\circ\\mathrm C\\). I therefore need a curve for the excess that can be inverted to find its time. The supplied values at \\(22\\) and \\(24\\) minutes will give a separate local comparison, while the three ambient assumptions will test how much the definition of excess changes the fitted answer.",
  "firstEvaluation": "The whole-record plot will make the time ordering and reference level visible. It cannot determine a fitted rate or the path between the supplied times, so I will use the earlier values to define a curve and reserve the later values for stated numerical comparisons.",
  "definitions": "\\(t\\) is elapsed time in min; \\(A\\) is the assumed ambient temperature in °C; \\(T\\) is a supplied temperature and \\(\\widehat T(t)\\) a modelled temperature in °C. \\(E=T-A>0\\) is excess temperature, \\(B>0\\) the fitted initial excess, and \\(k>0\\) the decay constant in \\(\\mathrm{min}^{-1}\\). The transformed variable is \\(z=\\ln[E/(1\\,^\\circ\\mathrm C)]\\), a dimensionless number.",
  "firstPresentation": "Figure 1 shows all sixteen values for transparency. The fixed split, rather than whether a point has been seen on a graph, determines whether it enters the fitted coefficients.",
  "accuracyQuantity": "Constructed drink temperature and time",
  "accuracySymbol": "T, t",
  "accuracyUnit": "°C; min",
  "accuracyResolution": "Constructed temperatures are recorded to 0.1 °C and elapsed times at two-minute increments; no thermometer calibration or timer uncertainty has been measured.",
  "accuracyPolicy": "Keep full coefficients for calculations. Report the nominal model crossing as about 22.1 min, with the separate interpolation and ambient comparisons stated. Additional displayed digits identify computations, not measured timing accuracy.",
  "accuracyReason": "The interpolation differs by about 0.124 min, the three ambient estimates span about 0.124 min, and a temperature amount comparable to the largest later error corresponds to roughly 0.24 min under the fixed inverse. These comparisons make a hundredth-minute accuracy claim unjustified.",
  "specialistTerms": "Excess temperature is the difference above ambient. A residual is supplied minus fitted temperature. RMSE is the square root of the mean squared discrepancy in a specified set. A value excluded from fitting checks the fixed curve without changing its coefficients.",
  "predictionComparison": "The estimated crossing lies between the supplied 22- and 24-minute entries, and the later errors remain small for this constructed series. This supports agreement with the record, not measured timing accuracy.",
  "benefitFinding": "I connected the fitting objective to the temperature scale, separated numerical agreement from a true crossing-time error and used the sensitivity comparisons to decide how to report the answer.",
  "surpriseReason": "Refitting after a one-degree ambient change alters both coefficients, yet the three calculated target times span only about 0.124 min. This is similar to the gap between the exponential and local interpolation answers.",
  "surpriseCheck": "I repeated the transformation and fit using the same eleven pairs at each ambient, checked positive excesses and solved the same target. I did not interpret the three outputs as a bound over every ambient between them.",
  "courseConcern": "The core uses exponential and logarithmic modelling. I explain the additional algebraic least-squares derivation, original-scale RMSE and exact inverse comparison at first use; no differential-equation or unexplained exponential-derivative argument is needed.",
  "technologyTool": "Graph plotter, logarithms and least-squares calculator",
  "technologyInput": "Fit \\(z_i=\\ln[(T_i-26)/(1\\,^\\circ\\mathrm C)]\\) against the eleven times \\(0,2,\\ldots,20\\). Retain the full fitted intercept and slope, convert back to Celsius and then evaluate the five later pairs without refitting.",
  "technologyOutcome": "The line has intercept \\(c\\approx4.060320467\\) and slope \\(m\\approx-0.039981565\\,\\mathrm{min}^{-1}\\), giving \\(B\\approx57.992893\\,^\\circ\\mathrm C\\), \\(k=-m\\) and a \\(50\\,^\\circ\\mathrm C\\) solution near \\(22.0668\\) min.",
  "technologyInterpretation": "The displayed model is the inverse of a specified logarithmic least-squares fit. Celsius discrepancies and threshold times answer different questions, so I calculate and interpret both rather than substituting one for the other.",
  "courseWhy": "Exponential and logarithmic modelling serve one target-time question. The extra methods are explained through squared-error algebra and the same logarithmic inverse rather than introduced as unexplained calculator outputs.",
  "mathsLearning": "I learned that a transformation changes the fitting objective as well as the graph, and that a numerical timing comparison can inform reporting without becoming a validated uncertainty bound.",
  "introduction": "I want to know when a model of a cooling drink reaches a chosen temperature, and how much confidence the available comparisons give in that number. I use \\(50\\,^\\circ\\mathrm C\\) as a target in a fictional scenario; it is not a recommendation about drinking temperature.\n\nMy material is Cooling Cup Cases v1, sixteen constructed temperatures at two-minute intervals from \\(0\\) to \\(30\\) minutes [D1]. I will fit an exponential of temperature above an assumed \\(26\\,^\\circ\\mathrm C\\) ambient using the first eleven values, estimate the target time, and compare the fixed curve with the five later values. A straight line between the two values surrounding the target will provide a second time estimate. Finally, I will refit at the supplied ambient alternatives \\(25\\) and \\(27\\,^\\circ\\mathrm C\\) and use those comparisons to choose how precisely to report the answer.\n\nThe construction recipe is already exponential, so I expect a close fit. The question is what the fitted estimate and its checks establish within this record. No physical cup or exact observed crossing time is available.",
  "dataNotes": "The series [D1] was made by evaluating \\(26+58e^{-0.04t}\\) at \\(t=0,2,\\ldots,30\\) minutes, adding the fixed offsets\n\\[\n(0,0.2,-0.2,0.1,-0.1,0.2,-0.15,0.1,\n-0.1,0.15,-0.1,0.1,-0.1,0.15,-0.2,0.1)\n\\]\nin Celsius degrees, then rounding to the nearest \\(0.1\\,^\\circ\\mathrm C\\). I retain all sixteen time-temperature pairs. Their displayed decimal step is a construction rule, not thermometer accuracy.\n\nThe supplied split assigns \\(0\\)–\\(20\\) minutes to fitting and \\(22\\)–\\(30\\) minutes to checking. All values are visible in Figure 1; “reserved” means excluded from calculating the coefficients, not unseen or independently measured. I will not change the fit after inspecting the later errors. The ambient values \\(25\\), \\(26\\) and \\(27\\,^\\circ\\mathrm C\\) are three alternative assumptions applied to the same record, not new room observations.",
  "stages": [
    {
      "key": "time-and-excess",
      "title": "Choosing a model for temperature above ambient",
      "methodId": "follow-journey",
      "kind": "model",
      "technique": "Time-series plot and excess-temperature ratios",
      "bridge": "Before estimating a time, I need to decide whether equal time steps are better represented by equal temperature drops or by equal proportional changes in excess temperature.",
      "purpose": "Figure 1 preserves the full ordered record and the assumed ambient reference. I calculate the following changes using the eleven fitting entries only.",
      "result": "At \\(t=0,2,4\\) minutes, the excesses above \\(26\\,^\\circ\\mathrm C\\) are \\(58.0\\), \\(53.7\\) and \\(49.2\\) Celsius degrees. The first two equal-time ratios are\n\\[\n\\frac{53.7}{58.0}\\approx0.9259,\\qquad\n\\frac{49.2}{53.7}\\approx0.9162.\n\\]\nAcross all ten two-minute steps in the fitting set, the ratios run from about \\(0.9130\\) to \\(0.9311\\). Thus a factor near \\(0.92\\), or a reduction of about \\(8\\%\\) of the excess each step, is a useful candidate rather than an exact rule. By contrast, the first temperature drop is \\(4.3\\,^\\circ\\mathrm C\\), whereas the drop from \\(18\\) to \\(20\\) minutes is \\(2.4\\,^\\circ\\mathrm C\\).\n\nI therefore test\n\\[\n\\widehat T(t)=A+Be^{-kt},\\qquad B>0,\\quad k>0.\n\\]\nHere \\(B\\) is the initial fitted excess and \\(k\\) controls its decay. The factor for any two-minute step is \\(e^{-2k}\\), independent of the starting time. Adding \\(A\\) returns to Celsius and makes the curve approach the ambient from above.",
      "observationText": "Fitting-period excess ratios are near 0.92 over equal two-minute steps, while the degree drops are smaller near the end of that period.",
      "interpretation": "The reference level is part of the model: an exponential of raw Celsius temperature would approach zero instead. Modelling excess therefore connects the observed shape of this constructed series to the stipulated ambient.",
      "limitations": "These calculations check the compatibility of the chosen form with its deliberately exponential source. They do not establish a physical cooling law or a random-error model.",
      "localTakeaway": "A proportional decrease in excess gives an ambient-offset exponential candidate; the ratios alone do not determine its two fitted coefficients.",
      "nextQuestion": "I now need a reproducible way to estimate the initial excess and decay constant from all eleven fitting values.",
      "nextWhy": "A logarithm turns the candidate exponential into a line, so I can define and explain a squared-error fit instead of selecting coefficients by eye.",
      "mathsInsight": "A fixed ratio of excesses over equal time steps becomes a fixed change in their logarithms.",
      "methodChangeReason": "The candidate shape has a reason, but a target-time calculation requires explicit coefficients and a stated fitting rule.",
      "outcomeId": "multiplicative",
      "knowledge": "syllabus"
    },
    {
      "key": "log-regression",
      "title": "Defining and deriving the logarithmic fit",
      "methodId": "exponential",
      "kind": "model",
      "technique": "Natural-log transformation and straight-line regression",
      "bridge": "The near-constant ratios motivate an exponential, but do not supply its coefficients. I use logarithms to turn that multiplicative pattern into a line with an explicit fitting objective.",
      "purpose": "Figure 2 contains the eleven transformed fitting pairs. Figure 3 later shows the resulting curve back in Celsius, including the times excluded from estimating it.",
      "result": "For positive excess \\(E\\), define \\(z=\\ln[E/(1\\,^\\circ\\mathrm C)]\\). Dividing by one Celsius degree makes the logarithm input dimensionless. At two minutes, \\(z=\\ln(53.7)\\approx3.983413\\). The natural log inverts \\(e^x\\); its product and power rules give\n\\[\nz=\\ln\\!\\left(\\frac{B}{1\\,^\\circ\\mathrm C}e^{-kt}\\right)\n=c+mt,\\qquad\nc=\\ln\\!\\left(\\frac{B}{1\\,^\\circ\\mathrm C}\\right),\\quad m=-k.\n\\]\nThus the exponential candidate becomes a straight line.\n\nI choose the line that minimises\n\\[\nS(c,m)=\\sum_{i=1}^{11}[z_i-c-mt_i]^2.\n\\]\nThis is the least-squares criterion [M1]. Squaring prevents positive and negative discrepancies from cancelling. A transformed discrepancy is\n\\[\nz_i-(c+mt_i)=\\ln\\!\\left(\\frac{E_i}{\\widehat E_i}\\right).\n\\]\nConsequently, equal ratios of supplied to fitted excess receive equal penalties, wherever they occur in the record. This fits the proportional-change idea, but is a modelling choice: it does not minimise the sum of squared Celsius errors.\n\nTo explain the numerical line, I centre the values at their means:\n\\[\n\\bar t=10,\\qquad \\bar z\\approx3.660504814,\\qquad\nx_i=t_i-10,\\quad y_i=z_i-\\bar z.\n\\]\nLet \\(h=c+10m-\\bar z\\), the line's vertical displacement at the mean time. Its residual becomes \\(y_i-mx_i-h\\). Since \\(\\sum x_i=\\sum y_i=0\\), expanding the squares gives\n\\[\nS=\\sum y_i^2-2m\\sum x_i y_i+m^2\\sum x_i^2+11h^2.\n\\]\nThe eleven pairs give\n\\[\n\\sum x_i^2=440,\\qquad\nC=\\sum x_i y_i\\approx-17.591888762.\n\\]\nCompleting the square in \\(m\\) rewrites the same expression as\n\\[\nS=\\sum y_i^2-\\frac{C^2}{440}\n+440\\left(m-\\frac{C}{440}\\right)^2+11h^2.\n\\]\nOnly the last two terms depend on the chosen coefficients, and both are nonnegative. The minimum therefore has \\(h=0\\) and\n\\[\nm=\\frac{C}{440}\\approx-0.039981565\\,\\mathrm{min}^{-1},\n\\qquad c=\\bar z-10m\\approx4.060320467.\n\\]\nThis also explains why the fitted line passes through the two means.\n\nReturning from \\(z\\) to excess requires exponentiation, then adding the ambient:\n\\[\nB=(1\\,^\\circ\\mathrm C)e^c\\approx57.992893\\,^\\circ\\mathrm C,\n\\qquad\n\\widehat T(t)\\approx26+57.992893e^{-0.039981565t}.\n\\]\nTemperatures in the final expression are in degrees Celsius. I retain the full fitted coefficients in calculations; the displayed equation is rounded.",
      "observationText": "The centred algebra and numerical regression give the same logarithmic line; exponentiating its intercept restores the fitted initial excess.",
      "interpretation": "The fitted starting temperature is about \\(83.9929\\,^\\circ\\mathrm C\\), close to the supplied \\(84.0\\,^\\circ\\mathrm C\\). The model now gives a reproducible temperature at any specified time. Whether those temperatures agree with the later entries, and when the curve reaches the target, still require calculations on the original scale.",
      "limitations": "The log fit weights proportional excess discrepancies. The constructed offsets were added in Celsius, so there is no basis for claiming that this objective is the statistically correct error model; its original-scale performance must be examined separately.",
      "localTakeaway": "The explicit log-squared-error objective gives \\(\\widehat T(t)\\approx26+57.992893e^{-0.039981565t}\\), with full coefficients retained for subsequent work.",
      "nextQuestion": "What time does this fixed curve give for 50 °C, and how does that use beyond 20 minutes compare with the later supplied values?",
      "nextWhy": "The target concerns Celsius and time, so I must invert the fitted curve and evaluate its discrepancies in Celsius rather than rely on the appearance of a straight log plot.",
      "mathsInsight": "Transforming the response changes which discrepancies least squares minimises; back-transforming the fitted line does not turn it into a least-squares fit in Celsius.",
      "methodChangeReason": "I stop estimating coefficients and use the fixed model to calculate the target and check the excluded values.",
      "outcomeId": "model-fit",
      "knowledge": "mixed",
      "unfamiliarComponent": "Deriving the straight-line least-squares coefficients algebraically and interpreting the objective after a logarithmic response transformation.",
      "knowledgeNotes": "The printed working defines a dimensionless logarithm, shows its inverse, expresses a log discrepancy as a log ratio and completes a centred squared-error expression to obtain the line. This goes beyond obtaining a regression equation from technology.",
      "researchSource": "NIST/SEMATECH e-Handbook of Statistical Methods, §4.1.4.1, Linear Least Squares Regression [M1], https://www.itl.nist.gov/div898/handbook/pmd/section1/pmd141.htm. The centred derivation and log-ratio interpretation for these constructed pairs are my own algebra.",
      "understandingExample": "The data give \\(\\bar t=10\\), \\(\\bar z\\approx3.660504814\\), \\(\\sum x_i^2=440\\) and \\(\\sum x_i y_i\\approx-17.591888762\\). Minimising the two nonnegative square terms gives \\(m=C/440\\approx-0.039981565\\) and \\(c=\\bar z-10m\\approx4.060320467\\)."
    },
    {
      "key": "reserved-threshold",
      "title": "Solving the target and checking the later values",
      "methodId": "exponential",
      "kind": "model",
      "technique": "Temperature residuals, logarithms and interpolation",
      "bridge": "The last fitting entry is still above 50 °C at 20 minutes, so the desired time lies beyond the interval used for the coefficients. I solve the fixed equation, then examine the later values before interpreting that extrapolation.",
      "purpose": "Figure 4 shows signed Celsius discrepancies for the whole record, with the last five distinguished by their checking role. I do not use them to adjust the fitted curve.",
      "result": "The target excess is \\(50-26=24\\,^\\circ\\mathrm C\\). Dividing by the fitted initial excess and taking logarithms gives\n\\[\ne^{-kt}=\\frac{24}{B},\\qquad\n-kt=\\ln\\!\\left(\\frac{24}{B}\\right),\\qquad\nt_*=\\frac{\\ln(B/24)}{k}\\approx22.0668\\text{ min}.\n\\]\nHere \\(B\\) and \\(24\\) are both entered in Celsius degrees, so their ratio is dimensionless. The positive target excess makes the inverse valid. This is extrapolation beyond the fitting interval \\(0\\)–\\(20\\) minutes, although it lies inside the full supplied record.\n\nFor each supplied pair I define \\(r_i=T_i-\\widehat T(t_i)\\). A positive value means the curve is cooler than the supplied entry. At \\(22\\) minutes,\n\\[\nr=50.2-\\widehat T(22)\\approx50.2-50.0642185\\approx+0.1358\\,^\\circ\\mathrm C.\n\\]\nThe five later discrepancies, in time order, are approximately\n\\[\n(+0.1358,-0.1149,+0.1923,-0.2317,+0.1232)\\,^\\circ\\mathrm C.\n\\]\nFor root mean squared error (RMSE) [M2], I average the squared discrepancies, then take the square root to return to Celsius:\n\\[\n\\begin{aligned}\n\\mathrm{RMSE}_{\\rm fit}\n&\\approx\\sqrt{\\frac{0.224018925}{11}}\n\\approx0.1427\\,^\\circ\\mathrm C,\\\\\n\\mathrm{RMSE}_{\\rm later}\n&\\approx\\sqrt{\\frac{0.137477966}{5}}\n\\approx0.1658\\,^\\circ\\mathrm C.\n\\end{aligned}\n\\]\nThese denominators describe the eleven and five particular discrepancies; I am not estimating a population variance. The later errors are somewhat larger on average, but remain within about a quarter of a degree at those five times.\n\nThe supplied values \\(T(22)=50.2\\) and \\(T(24)=48.1\\,^\\circ\\mathrm C\\) bracket the target. A separate local straight-line interpolation assumes a constant drop only between that pair. Reaching 50 uses \\(0.2\\) of the total \\(2.1\\)-degree drop, hence the same fraction of the two-minute interval:\n\\[\nt_{\\rm line}=22+2\\left(\\frac{0.2}{2.1}\\right)\n\\approx22.1905\\text{ min}.\n\\]\nThis is about \\(0.1236\\) min later than the exponential estimate. The two methods agree on a crossing shortly after 22 minutes; their difference is not a measured timing error because neither supplies the true continuous path between the entries.",
      "observationText": "The later Celsius RMSE is about 0.1658 °C. The exponential target time is about 22.0668 min, and the two-point interpolation gives about 22.1905 min.",
      "interpretation": "The excluded entries support the model as an approximation to this record near the target. They also show why reporting the calculated 22.0668 minutes without qualification would overstate what is known: a reasonable local interpolation gives a different time.",
      "limitations": "Five checks from the same construction recipe cannot establish a continuous error bound between them. In particular, a small Celsius RMSE is not a timing-accuracy claim.",
      "localTakeaway": "The model and the neighbouring supplied values place the target shortly after 22 minutes, but the record does not identify an exact crossing time.",
      "nextQuestion": "How much do the three ambient assumptions move the fitted target time, and what reporting precision do these comparisons justify?",
      "nextWhy": "Ambient enters every logarithm, so its effect must be assessed by refitting before I can compare that change with the difference between the two time estimates.",
      "mathsInsight": "A later-value error summary and an interpolated threshold are different checks; neither becomes an observed crossing-time error merely because the numbers are close.",
      "methodChangeReason": "The target has a nominal answer and a separate interpolation comparison. I now test the stated ambient alternatives in the same time units before concluding.",
      "outcomeId": "model-fit",
      "knowledge": "mixed",
      "unfamiliarComponent": "Defining RMSE on fitting and excluded values, and distinguishing a numerical interpolation comparison from measured timing accuracy.",
      "knowledgeNotes": "The printed narrative defines signed Celsius discrepancies, works one example, gives the square-mean-root calculation for each set, derives the logarithmic inverse and derives the interpolation fraction. It explicitly identifies the estimate as extrapolation from the fitting interval.",
      "researchSource": "Hyndman, R. J. and Athanasopoulos, G., Forecasting: Principles and Practice, 3rd edition, §5.8, Evaluating point forecast accuracy [M2], https://otexts.com/fpp3/toolbox.html#evaluating-point-forecast-accuracy. I use its RMSE definition and distinction between fitted and excluded cases, without claiming genuine new observations in this constructed example.",
      "understandingExample": "At \\(22\\) minutes the discrepancy is \\(50.2-50.0642185\\approx+0.1358\\,^\\circ\\mathrm C\\). The five later squared discrepancies total about \\(0.137477966\\), giving \\(\\sqrt{0.137477966/5}\\approx0.1658\\,^\\circ\\mathrm C\\). Separately, \\(0.2/2.1\\) of a two-minute drop gives \\(22.1905\\) minutes by local interpolation."
    },
    {
      "key": "ambient-sensitivity",
      "title": "Refitting ambient assumptions and choosing the reported precision",
      "methodId": "follow-journey",
      "kind": "model",
      "technique": "Conditional parameter changes and threshold comparison",
      "bridge": "The exponential and local interpolation differ by about 0.124 minute. I now put the ambient changes on the same time scale, so I can judge their effect on the answer rather than compare unrelated coefficients.",
      "purpose": "Table 1 records three separate fits of the same eleven earlier entries, one for each stated ambient. The original temperatures and fitting/checking split remain fixed.",
      "result": "For each assumed \\(A\\), I recalculate\n\\[\nz_i(A)=\\ln\\!\\left(\\frac{T_i-A}{1\\,^\\circ\\mathrm C}\\right),\n\\]\nfit its line by the same criterion and recover \\(B_A\\) and \\(k_A\\). Every fitting excess remains positive: even the smallest fitting temperature, \\(52\\,^\\circ\\mathrm C\\), exceeds all three ambients. Subtracting a different \\(A\\) changes the log values by different amounts, so both fitted coefficients must be re-estimated. Merely replacing 26 in the old equation would test a different model.\n\nThe inverse \\(t_A=\\ln[B_A/(50-A)]/k_A\\), with the temperature ratio evaluated in consistent units, gives\n\\[\nt_{25}\\approx22.0070,\\qquad\nt_{26}\\approx22.0668,\\qquad\nt_{27}\\approx22.1309\\text{ min}.\n\\]\nThe spread of these three calculated times is \\(0.1239\\) min, about \\(7.4\\) seconds. It is similar to the \\(0.1236\\)-minute difference from local interpolation. This is a comparison of three specified assumptions, not a proved range over every ambient between 25 and 27 °C.\n\nI also need to understand what a Celsius discrepancy means on a time scale. The largest later discrepancy has magnitude about \\(0.2317\\,^\\circ\\mathrm C\\), at \\(28\\) minutes. I keep the nominal curve fixed and ask how much its time changes if the target is shifted by a temperature amount \\(d\\). Its new target excess is \\(24\\,^\\circ\\mathrm C+d\\). Provided this is positive, as it is for both small changes below, subtracting the two logarithmic inverses gives\n\\[\n\\begin{aligned}\n\\tau(d)&=\\frac{\\ln[B/(24\\,^\\circ\\mathrm C+d)]}{k},\\\\\n\\Delta t&=\\tau(d)-\\tau(0)\n=-\\frac{\\ln[1+d/(24\\,^\\circ\\mathrm C)]}{k}.\n\\end{aligned}\n\\]\nFor \\(d=+0.231679\\,^\\circ\\mathrm C\\), the higher target is reached about \\(0.2403\\) min earlier; for the negative of that amount, the lower target is reached about \\(0.2426\\) min later. Thus a temperature amount of this size corresponds locally to roughly \\(0.24\\) min on the fixed curve. The inverse explains that comparison directly, without assuming a constant cooling rate.\n\nThis is not a timing-error interval: the sampled maximum occurred at 28 minutes, and I have not bounded the unknown path near the target by that amount. It is a scale comparison for interpreting the displayed decimals. I retain extra digits to distinguish calculations, but report the nominal estimate as about \\(22.1\\) minutes, alongside the local interpolation of about \\(22.2\\) minutes and the three ambient results. I do not claim accuracy to a hundredth of a minute.",
      "observationText": "The three ambient fits span about 0.124 min. A temperature amount equal to the largest later discrepancy corresponds to about 0.24 min under the fixed inverse, without providing a timing bound.",
      "interpretation": "At this target, the chosen ambient alternatives move the estimate only slightly. The comparisons support a qualified answer of roughly 22 minutes and explain why the nominal 22.1-minute result should be accompanied by its assumptions, rather than presented as a precise observed event.",
      "limitations": "The three ambient scenarios are not confidence limits, and the target-shift calculation is not a probability statement. These results do not test changing room conditions, another cup or a target much nearer ambient.",
      "localTakeaway": "The three specified refits give 22.0070, 22.0668 and 22.1309 minutes. Reporting about 22.1 minutes for the nominal model is appropriate only with the separate comparisons and their limits.",
      "nextQuestion": "The target estimate, later-value comparison and three ambient refits now answer the question I set.",
      "nextWhy": "A claim about the actual accuracy of a physical cooling time would require new observations, not further digits from this constructed record.",
      "mathsInsight": "Refitting a changed reference level and shifting a target on a fixed curve are distinct operations. Their numerical effects can be compared in minutes without turning either into a validated uncertainty interval.",
      "methodChangeReason": "I use the comparisons to qualify the final time and stop, rather than add a new investigation after the stated numerical aim is answered.",
      "outcomeId": "different",
      "knowledge": "mixed",
      "unfamiliarComponent": "Refitting after an ambient-offset change and deriving an exact fixed-model temperature-to-time comparison for reporting precision.",
      "knowledgeNotes": "The narrative explains why changing the ambient changes every transformed value and requires a new fit. It then subtracts two logarithmic inverses to derive the target-shift formula and states why a sampled temperature discrepancy cannot become a continuous timing bound.",
      "researchSource": "",
      "understandingExample": "For the nominal model, \\(\\Delta t=-\\ln[1+d/(24\\,^\\circ\\mathrm C)]/k\\). At \\(d\\approx+0.231679\\,^\\circ\\mathrm C\\), this is about \\(-0.2403\\) min; changing the sign of \\(d\\) gives about \\(+0.2426\\) min. These are conditional changes in target time, not inferred bounds on a physical event."
    }
  ],
  "figures": [
    {
      "id": "figure-p3-cool-time",
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
      "id": "figure-p3-cool-log",
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
      "ySymbol": "E",
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
      "id": "figure-p3-cool-curve",
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
      "id": "figure-p3-cool-residual",
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
      "id": "table-p3-cool-sensitivity",
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
    "mainConclusion": "The nominal model fitted to the eleven \\(0\\)–\\(20\\) minute values gives a \\(50\\,^\\circ\\mathrm C\\) time of about \\(22.1\\) minutes. It extrapolates beyond the fitting interval, but agrees with the later supplied bracket of \\(22\\)–\\(24\\) minutes. Local interpolation gives about \\(22.2\\) minutes, and the five later temperature discrepancies have RMSE about \\(0.166\\,^\\circ\\mathrm C\\). Those are checks of agreement with the constructed record, not a measurement of the true crossing-time error.",
    "conclusionBenefit": "Refitting separately at ambient temperatures of \\(25\\), \\(26\\) and \\(27\\,^\\circ\\mathrm C\\) gives times from \\(22.0070\\) to \\(22.1309\\) minutes across those three cases. Their spread is about \\(0.124\\) minute, similar to the interpolation comparison. The exact target-shift calculation also shows why a small Celsius discrepancy need not correspond to negligible time: an amount near \\(0.232\\,^\\circ\\mathrm C\\) represents about \\(0.24\\) minute on the fixed curve. I therefore give a conditional estimate of roughly 22 minutes, with 22.1 minutes identifying the nominal model, rather than claim hundredth-minute accuracy.",
    "conclusionExtension": "A focused physical follow-up would record room and drink temperatures in repeated trials, state instrument resolution and calibration, and sample more closely near 50 °C. A model fitted on earlier readings could then be compared with a separately observed crossing. Those observations are what this constructed example lacks."
  },
  "review": {
    "story": "The argument moves from an answerable target-time comparison to excess ratios, an explained log fit, later Celsius checks, three ambient refits and a qualified reported time.",
    "sequence": "Each transition identifies what the preceding result leaves unresolved. The final stage ends the numerical aim; the one physical follow-up appears only in the conclusion.",
    "notation": "The logarithm uses a dimensionless excess ratio. Symbols, squared-error objectives and Celsius discrepancies are defined at first use. The target-shift inverse is derived with consistent temperature units.",
    "purpose": "The answer is a conditional modelled time with stated comparisons, not a claim about observed crossing-time accuracy or drinking preference.",
    "limits": "Later cases are excluded from coefficients but already visible and generated by the same recipe. Three discrete ambient scenarios and a sampled-error scale comparison are not continuous or probabilistic bounds.",
    "calculations": "The log-line coefficients, centred sums, Celsius squared-error totals, target inverse, interpolation, three ambient refits and exact positive/negative target shifts were recomputed from the retained values.",
    "presentation": "All five native figures and the three editable datasets are retained. The rewritten reader and every PDF/Word page still require rendered inspection before the presentation review can be marked complete.",
    "presentationChecked": false,
    "sources": "The construction recipe and split are disclosed. Primary method sources identify the least-squares criterion and RMSE/checking distinction; the worked algebra and all numerical cases are derived here.",
    "figures": "The time, log-excess, back-transformed and discrepancy graphs and the ambient table preserve their original IDs, values, captions and placement.",
    "technology": "Only the eleven earlier pairs enter each transformed regression. Full coefficients are retained internally, and all later comparisons use the fixed appropriate fit."
  },
  "planningExtra": {
    "mathsOutside": "outside",
    "mathsRevisedWhy": "Exponential and logarithmic modelling provide the familiar core. I explain the additional centred least-squares derivation, transformed fitting objective, RMSE and conditional temperature-to-time comparison in the actual narrative, with worked examples rather than assumed knowledge."
  },
  "completionExtra": {
    "mathsLearning": "I explain which objective the transformation minimises, why its inverse restores Celsius, how the excluded errors are summarised, why ambient changes require refitting and why an exact target-shift calculation does not establish a timing-error bound.",
    "referencesIssue": "[D1] identifies the constructed data. [M1] supports least squares and [M2] supports RMSE and the fitting/checking distinction. The displayed derivations, interpolation and sensitivity calculations are my own work on those inputs."
  },
  "references": [
    {
      "label": "[D1] Constructed case record",
      "value": "Cooling Cup Cases v1: sixteen constructed two-minute temperature entries from 0 to 30 minutes. They were generated from T=26+58 exp(-0.04t) °C with the fixed offsets (0,0.2,-0.2,0.1,-0.1,0.2,-0.15,0.1,-0.1,0.15,-0.1,0.1,-0.1,0.15,-0.2,0.1) °C, then rounded to 0.1 °C. Entries at 0–20 min were allocated to modelling; 22–30 min to a prespecified check. The ambient 26 °C and alternative 25/27 °C scenarios are assumptions, not measured room temperatures."
    },
    {
      "label": "[M1] Least-squares method",
      "value": "NIST/SEMATECH e-Handbook of Statistical Methods, §4.1.4.1, Linear Least Squares Regression. https://www.itl.nist.gov/div898/handbook/pmd/section1/pmd141.htm. I use the squared-error criterion to define the line in log excess. The centred-coordinate derivation, log-ratio interpretation and numerical substitutions here are my own algebra."
    },
    {
      "label": "[M2] Error summaries and checking",
      "value": "Hyndman, R. J. and Athanasopoulos, G., Forecasting: Principles and Practice, 3rd edition, §5.8, Evaluating point forecast accuracy. https://otexts.com/fpp3/toolbox.html#evaluating-point-forecast-accuracy. I use the RMSE definition and distinction between cases used for fitting and checking. The five later values here are constructed cases excluded from the coefficients, not genuine new physical observations."
    }
  ]
};
export const COOLING_CASES=Object.freeze(STUDY.dataSets[0].rows.map(row=>Object.freeze(row)));
export const DRINK_COOLING_SPEC=buildModellingPass3(STUDY);
