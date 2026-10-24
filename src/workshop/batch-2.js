/** Maths Workshop Batch 2: relationships and fitting.
 * Fictional mathematical examples, never imported into a student's project.
 * Each method retains a show/hint/independent sequence; data and answer options
 * are deliberately distinct from the user's real investigation.
 */
const term=(id,category,title,meaning,example,notation="")=>
 Object.freeze({id,category,title,meaning,example,notation});
export const BATCH2_DEFINITIONS=Object.freeze(
 [
  {
    "id": "rank",
    "category": "Data",
    "title": "Rank",
    "meaning": "An ordered position given to an observation after sorting a numerical variable. Preserve the original paired rows when ranking two variables.",
    "example": "For values 8, 3, 5, ascending ranks are 3, 1, 2.",
    "notation": ""
  },
  {
    "id": "tied-rank",
    "category": "Data",
    "title": "Tied rank",
    "meaning": "Equal values share the average of the rank positions they would occupy. Rank order and the handling of ties must be stated.",
    "example": "Two equal observations occupying positions 2 and 3 each receive rank 2.5.",
    "notation": "\\(R=\\frac{r_{\\text{first}}+r_{\\text{last}}}{2}\\)"
  },
  {
    "id": "spearman-rho",
    "category": "Data",
    "title": "Spearman's rank correlation",
    "meaning": "Spearman's rho describes the strength and direction of monotonic association by correlating the paired ranks. It does not establish cause.",
    "example": "If two quantities mostly increase together, Spearman's rho is often positive, even if their scatterplot bends.",
    "notation": "\\(\\rho_s=\\operatorname{corr}(R_x,R_y)\\)"
  },
  {
    "id": "monotonic-association",
    "category": "Data",
    "title": "Monotonic association",
    "meaning": "A pattern tending consistently in one direction as the input grows, even when the change is not along a straight line.",
    "example": "A positive exponential growth pattern can be strongly monotonic but not linear.",
    "notation": ""
  },
  {
    "id": "regression-line",
    "category": "Models",
    "title": "Straight-line regression model",
    "meaning": "A fitted straight line relating a response y to an explanatory variable x, typically by minimising squared vertical residuals.",
    "example": "A fitted slope of 0.8 describes a modelled response increase of 0.8 units per additional x unit.",
    "notation": "\\(\\hat{y}=a+bx\\)"
  },
  {
    "id": "gradient",
    "category": "Models",
    "title": "Regression slope",
    "meaning": "The change in fitted response for a one-unit increase in x. With ordinary least squares and an intercept, it equals the centred cross-product sum divided by the x-deviation sum.",
    "example": "A slope of 1.6 means the model predicts 1.6 more y units for each extra x unit.",
    "notation": "\\(b=\\frac{S_{xy}}{S_{xx}}\\)"
  },
  {
    "id": "intercept",
    "category": "Models",
    "title": "Regression intercept",
    "meaning": "The fitted response when x is zero. This may be an algebraic model parameter rather than a meaningful real-world prediction if zero is outside the data range.",
    "example": "An intercept of 1.5 does not automatically represent a measurable baseline.",
    "notation": "\\(a=\\bar{y}-b\\bar{x}\\)"
  },
  {
    "id": "centred-sums",
    "category": "Models",
    "title": "Centred sums for regression",
    "meaning": "Summations around the observed means used for an ordinary least-squares line with an intercept. All x-values and y-values remain paired.",
    "example": "With four points, x-centred sum Sxx = 5 and xy-centred sum Sxy = 4 yield slope 0.8.",
    "notation": "\\(S_{xx}=\\sum_i(x_i-\\bar{x})^2,\\;S_{xy}=\\sum_i(x_i-\\bar{x})(y_i-\\bar{y})\\)"
  },
  {
    "id": "least-squares",
    "category": "Models",
    "title": "Least squares",
    "meaning": "A fitting method choosing parameters to minimise the sum of squared residuals on the stated fitting data and scale.",
    "example": "An ordinary least-squares line minimises vertical squared errors in y, not horizontal distances or every other error measure.",
    "notation": ""
  },
  {
    "id": "fitted-value",
    "category": "Models",
    "title": "Fitted or predicted value",
    "meaning": "The y-value produced by the chosen model at a specified x. It is distinct from the observed y-value.",
    "example": "For the line y-hat = 1.5 + 0.8x, x = 2 gives predicted y = 3.1.",
    "notation": "\\(\\hat{y}_i=f(x_i;\\theta)\\)"
  },
  {
    "id": "sum-squared-errors",
    "category": "Models",
    "title": "Sum of squared errors (SSE)",
    "meaning": "The sum of squared differences between observed values and model predictions, computed on a specified common response scale.",
    "example": "Residuals 0, 0, 0, 1 give SSE = 1.",
    "notation": "\\(\\mathrm{SSE}=\\sum_{i=1}^{n}(y_i-\\hat{y}_i)^2\\)"
  },
  {
    "id": "residual-plot",
    "category": "Models",
    "title": "Residual plot",
    "meaning": "A graph of residuals against an input or fitted value, used to check whether important patterns remain after fitting.",
    "example": "A U-shaped series of residuals suggests a straight-line model is missing curvature.",
    "notation": ""
  },
  {
    "id": "residual-pattern",
    "category": "Models",
    "title": "Systematic residual pattern",
    "meaning": "A structure in errors, such as curvature, widening spread or clusters, indicating that some model behaviour or data feature has not been explained.",
    "example": "Positive residuals at both ends and negative residuals in the middle suggest missing curvature.",
    "notation": ""
  },
  {
    "id": "nonlinear-regression",
    "category": "Models",
    "title": "Nonlinear regression",
    "meaning": "Fitting a model that is not simply a straight line in the original input and response, such as a quadratic, exponential or sinusoidal function.",
    "example": "A curve may describe accelerating growth better than a straight line, but requires diagnostics and a meaningful domain.",
    "notation": ""
  },
  {
    "id": "exponential-model",
    "category": "Models",
    "title": "Exponential model",
    "meaning": "A multiplicative model with base b and scale a. For positive a and b, a constant step in x multiplies the prediction by the same factor.",
    "example": "A fictional sequence 2, 6, 18, 54 for x = 0, 1, 2, 3 follows y = 2 times 3 to the power x.",
    "notation": "\\(y=ab^x,\\quad a>0,\\;b>0\\)"
  },
  {
    "id": "quadratic-model",
    "category": "Models",
    "title": "Quadratic model",
    "meaning": "A second-degree polynomial in x, potentially useful for a single turning point or a pattern of roughly constant second differences at equally spaced inputs.",
    "example": "Values 2, 3, 6, 11 at x = 0, 1, 2, 3 follow y = x squared plus 2.",
    "notation": "\\(y=ax^2+bx+c,\\quad a\\ne0\\)"
  },
  {
    "id": "log-transformation",
    "category": "Models",
    "title": "Log transformation",
    "meaning": "Taking logarithms of positive quantities. An exponential relation becomes straight in x on the log-y scale.",
    "example": "For y = 2 times 3 to the power x, ln y = ln 2 + x ln 3.",
    "notation": "\\(\\ln y=\\ln a+x\\ln b\\)"
  },
  {
    "id": "transformed-regression",
    "category": "Models",
    "title": "Transformed regression",
    "meaning": "Fitting a model after transforming a variable. Least squares on a log scale minimises log residuals, not the original y-scale residuals.",
    "example": "Exponential regression on logged responses may differ from fitting exponential parameters directly on original y values.",
    "notation": ""
  },
  {
    "id": "r-squared",
    "category": "Models",
    "title": "Coefficient of determination (R-squared)",
    "meaning": "For a specified response scale, baseline mean and fitted values, one minus SSE divided by total sum of squares. A higher in-sample value alone does not guarantee a better generalisable model.",
    "example": "Two models can both have R-squared above 0.9 yet behave very differently on new observations.",
    "notation": "\\(R^2=1-\\frac{\\mathrm{SSE}}{\\sum_i(y_i-\\bar{y})^2}\\)"
  },
  {
    "id": "rmse",
    "category": "Models",
    "title": "Root mean squared error (RMSE)",
    "meaning": "The square root of average squared residual on a stated dataset; it has the response variable's units. State whether evaluation uses training or held-out observations.",
    "example": "SSE = 1 over four predictions gives RMSE = 0.5 response units.",
    "notation": "\\(\\mathrm{RMSE}=\\sqrt{\\frac{1}{n}\\sum_{i=1}^{n}(y_i-\\hat{y}_i)^2}\\)"
  },
  {
    "id": "holdout-data",
    "category": "Models",
    "title": "Holdout or validation data",
    "meaning": "Observations not used to choose or fit parameters, kept aside to check how predictions generalise to unseen cases.",
    "example": "A model with a lower training error can still predict a withheld observation less accurately.",
    "notation": ""
  },
  {
    "id": "overfitting",
    "category": "Models",
    "title": "Overfitting",
    "meaning": "When a model captures noise or accidental details of the observed sample rather than a stable underlying pattern, often showing weak performance on unseen data.",
    "example": "A high-degree polynomial can interpolate every observed point while behaving implausibly between or beyond them.",
    "notation": ""
  },
  {
    "id": "influential-observation",
    "category": "Models",
    "title": "Influential observation",
    "meaning": "A point whose inclusion or exclusion substantially changes a fitted model. Influence is not the same as having a large residual.",
    "example": "A point at an extreme x-value can noticeably change regression slope even when its residual is small.",
    "notation": ""
  }
].map(d=>term(d.id,d.category,d.title,d.meaning,d.example,d.notation))
);
const guide=(id,category,title,definitionIds,details)=>
 Object.freeze({id,category,title,definitionIds,...details});
export const BATCH2_LESSONS=Object.freeze([

  {
    "id": "spearman",
    "category": "Data & statistics",
    "title": "Spearman's rank correlation (including tied ranks)",
    "definitionIds": [
      "paired-data",
      "rank",
      "tied-rank",
      "spearman-rho",
      "monotonic-association",
      "correlation",
      "influential-observation"
    ],
    "details": {
      "skill": "Rank paired observations by hand to understand the method; a spreadsheet can calculate larger datasets",
      "when": "When paired numerical observations appear to have a generally increasing or decreasing pattern that may curve rather than follow a straight line.",
      "avoid": "Spearman measures monotonic association, not causation. Keep pairs together. The familiar rank-difference shortcut is exact for untied ranks; with ties, assign average ranks and calculate Pearson correlation of the rank columns.",
      "formula": "Spearman rho = Pearson correlation of rank(x) and rank(y). With no tied ranks only: rho = 1 - 6 sum(d squared)/(n(n squared - 1)).",
      "worked": {
        "context": "Five fictional observations give x = 1, 2, 3, 4, 5 and their paired responses y = 10, 30, 20, 50, 40. There are no ties.",
        "table": {
          "caption": "Keep each pair together while assigning ascending ranks",
          "headers": [
            "x",
            "y",
            "rank x",
            "rank y",
            "d = rank x − rank y",
            "d²"
          ],
          "rows": [
            [
              "1",
              "10",
              "1",
              "1",
              "0",
              "0"
            ],
            [
              "2",
              "30",
              "2",
              "3",
              "−1",
              "1"
            ],
            [
              "3",
              "20",
              "3",
              "2",
              "+1",
              "1"
            ],
            [
              "4",
              "50",
              "4",
              "5",
              "−1",
              "1"
            ],
            [
              "5",
              "40",
              "5",
              "4",
              "+1",
              "1"
            ]
          ]
        },
        "steps": [
          "Check that each row really represents one paired observation. Rank the \\(x\\) and \\(y\\) columns separately from smallest to largest without moving one column away from its partner.",
          "The rank pairs are \\((1,1),(2,3),(3,2),(4,5),(5,4)\\). There are no repeated values, so no tied-rank adjustment is needed.",
          "Calculate each rank difference \\(d_i=R_{x,i}-R_{y,i}\\); the squares add to \\(\\sum d_i^2=0+1+1+1+1=4\\).",
          "For \\(n=5\\) with no ties, \\(\\rho_s=1-\\frac{6(4)}{5(5^2-1)}=1-\\frac{24}{120}=0.8\\).",
          "Interpret \\(\\rho_s=0.8\\) as relatively strong positive monotonic association in these five fictional pairs. It does not mean one variable causes the other.",
          "For tied observations, assign the average of the occupied rank positions and correlate the two rank columns instead of relying on the untied shortcut."
        ],
        "answer": "Spearman's rank correlation is \\(\\rho_s=0.8\\) for these five untied pairs.",
        "interpretation": "The coefficient describes the order of this illustrative sample. Draw the original scatterplot and check ties, influential points, and whether any apparent monotonic relationship makes sense."
      },
      "guided": {
        "parts": [
          {
            "question": "The ascending values are 1, 2, 2, 4. What rank should EACH of the two repeated 2s receive?",
            "options": [
              [
                "2",
                "Rank 2"
              ],
              [
                "2.5",
                "Rank \\(2.5\\)"
              ],
              [
                "3",
                "Rank 3"
              ]
            ],
            "correct": "2.5",
            "hint": "The repeated observations occupy positions 2 and 3, so share the mean of those positions.",
            "feedback": "The tied rank is \\(\\frac{2+3}{2}=2.5\\) for both observations."
          },
          {
            "question": "When x contains tied ranks, which calculation is appropriate for Spearman's rho?",
            "options": [
              [
                "correl",
                "Use CORREL on the two columns of averaged ranks"
              ],
              [
                "shortcut",
                "Always use 1 − 6Σd²/(n(n² − 1)) unchanged"
              ],
              [
                "sort",
                "Sort the y observations independently and then compare ranks"
              ]
            ],
            "correct": "correl",
            "hint": "The short rank-difference expression assumes no ties; the definition of rho is correlation between correctly paired rank columns.",
            "feedback": "Spearman's rho is the Pearson correlation of paired rank columns. Average ties, preserve row pairing and then correlate the ranks."
          }
        ]
      },
      "independent": {
        "question": "Use the untied rank shortcut on the fictional pairs x = 1, 2, 3, 4, 5 and y = 40, 30, 50, 20, 10. State the direction and one limitation.",
        "answer": "Ascending \\(y\\)-ranks are \\(4,3,5,2,1\\); \\(\\sum d_i^2=34\\), so \\(\\rho_s=1-\\frac{6(34)}{5(25-1)}=-0.7\\).",
        "reasoning": "The sample has a negative monotonic association: larger x generally accompanies smaller y. Five points alone cannot establish cause, reliability or the best explanatory model."
      },
      "technology": [
        {
          "name": "Google Sheets — average ranks",
          "command": "=RANK.AVG(A2,$A$2:$A$6,1)",
          "why": "Use ascending average ranks including ties. Fill down one rank column for x and another for y; preserve the same pair rows."
        },
        {
          "name": "Google Sheets — correlation of ranks",
          "command": "=CORREL(C2:C6,D2:D6)",
          "why": "Once the x- and y-rank columns are paired, this gives Spearman's rho. The ordinary CORREL of raw x and y values is Pearson, not Spearman."
        }
      ],
      "existingGuide": "organise",
      "ia": "Explain why monotonic association is relevant to the aim, show how ranks and ties were handled, give the technology or hand calculation, and interpret its direction with a scatterplot. State sample scope, possible outliers and why association is not causation."
    }
  },
  {
    "id": "linear-regression",
    "category": "Functions & modelling",
    "title": "Fit and interpret a straight-line regression",
    "definitionIds": [
      "paired-data",
      "least-squares",
      "regression-line",
      "gradient",
      "intercept",
      "centred-sums",
      "fitted-value",
      "residual",
      "domain"
    ],
    "details": {
      "skill": "Show a slope-and-intercept derivation once; use Sheets or Desmos to fit a larger dataset and examine residuals",
      "when": "When a scatterplot of paired numerical observations suggests a roughly straight-line pattern over a meaningful input range.",
      "avoid": "A fitted line minimises vertical squared residuals on the chosen dataset; it does not prove linearity, causation or reliable extrapolation. x is the explanatory quantity and y is the response. Do not interpret x = 0 outside the observed domain without justification.",
      "formula": "For a least-squares line with intercept: b = Sxy/Sxx, a = y-mean - b*x-mean, y-hat = a+bx. Requires variation in x.",
      "worked": {
        "context": "Use fictional paired data x = 1, 2, 3, 4 and y = 2, 3, 5, 4. Fit y on x by ordinary least squares with an intercept.",
        "table": {
          "caption": "Paired observations and predictions from the fitted line",
          "headers": [
            "x",
            "observed y",
            "fitted ŷ = 1.5 + 0.8x",
            "residual y − ŷ"
          ],
          "rows": [
            [
              "1",
              "2",
              "2.3",
              "−0.3"
            ],
            [
              "2",
              "3",
              "3.1",
              "−0.1"
            ],
            [
              "3",
              "5",
              "3.9",
              "+1.1"
            ],
            [
              "4",
              "4",
              "4.7",
              "−0.7"
            ]
          ]
        },
        "steps": [
          "Keep each paired observation intact. The means are \\(\\bar{x}=2.5\\) and \\(\\bar{y}=3.5\\).",
          "Compute centred sums \\(S_{xx}=\\sum(x_i-\\bar{x})^2=5\\) and \\(S_{xy}=\\sum(x_i-\\bar{x})(y_i-\\bar{y})=4\\).",
          "The least-squares slope is \\(b=\\frac{S_{xy}}{S_{xx}}=\\frac45=0.8\\), and the intercept is \\(a=\\bar{y}-b\\bar{x}=3.5-0.8(2.5)=1.5\\).",
          "The fitted relationship is \\(\\hat{y}=1.5+0.8x\\). Check it against observations in the table; for \\(x=3\\), \\(\\hat{y}=3.9\\), while observed \\(y=5\\).",
          "The residual at \\(x=3\\) is \\(e=5-3.9=1.1\\). Inspect all residuals for structure rather than judging the model from its slope or correlation alone.",
          "Interpret the slope with actual variable units. The intercept \\(\\hat{y}(0)=1.5\\) is not automatically meaningful because zero lies outside these recorded x-values."
        ],
        "answer": "Least-squares line \\(\\hat{y}=1.5+0.8x\\), fitted on \\(1\\leq x\\leq4\\); at \\(x=3\\), the residual is \\(+1.1\\).",
        "interpretation": "On this fictional range, the model estimates 0.8 extra y-units per x-unit. Its suitability depends on the scatterplot, context, influential points and patterns in residuals."
      },
      "guided": {
        "parts": [
          {
            "question": "A dataset has \\(S_{xy}=6\\) and \\(S_{xx}=3\\). What is the slope of its least-squares line with intercept?",
            "options": [
              [
                "2",
                "\\(b=2\\)"
              ],
              [
                "0.5",
                "\\(b=0.5\\)"
              ],
              [
                "18",
                "\\(b=18\\)"
              ]
            ],
            "correct": "2",
            "hint": "Use \\(b=\\frac{S_{xy}}{S_{xx}}\\) when \\(S_{xx}>0\\).",
            "feedback": "\\(b=\\frac63=2\\). The units are y-units per one x-unit."
          },
          {
            "question": "If all observed x-values lie between 20 and 40, what should you say about the line's intercept at x = 0?",
            "options": [
              [
                "outside",
                "It is a fitted parameter, but the x = 0 interpretation is outside the observed range"
              ],
              [
                "observed",
                "It directly describes an observed y when x = 0"
              ],
              [
                "cause",
                "It establishes the cause of the relationship"
              ]
            ],
            "correct": "outside",
            "hint": "Compare the requested input with the observed x-values before giving a practical interpretation.",
            "feedback": "Do not turn an extrapolated intercept into a measured baseline. Its numerical value can be reported, but real-world meaning needs justification."
          }
        ]
      },
      "independent": {
        "question": "Fit a least-squares line with intercept to fictional points (1,2), (2,4), (3,5), (4,7). Calculate the residual for the observation at x = 3.",
        "answer": "\\(S_{xx}=5,\\;S_{xy}=8,\\;b=1.6,\\;a=0.5\\). Thus \\(\\hat{y}=0.5+1.6x\\), and at \\(x=3\\), \\(\\hat{y}=5.3\\), giving residual \\(5-5.3=-0.3\\).",
        "reasoning": "The means are \\(\\bar{x}=2.5\\) and \\(\\bar{y}=4.5\\). Form \\(b=S_{xy}/S_{xx}\\) and \\(a=\\bar{y}-b\\bar{x}\\), then subtract fitted from observed y."
      },
      "technology": [
        {
          "name": "Google Sheets — regression coefficients",
          "command": "=SLOPE(B2:B5,A2:A5) and =INTERCEPT(B2:B5,A2:A5)",
          "why": "The response column B comes first and the explanatory x-column A second; keep the pairs aligned."
        },
        {
          "name": "Desmos — regression table",
          "command": "y_1 ~ a x_1 + b",
          "why": "Fit a line to the recorded table, check coefficient meaning and view the residuals. Do not automatically extend the model beyond observations."
        }
      ],
      "existingGuide": "sheets-linear",
      "ia": "State what x and y measure and their units; show how the line was found and interpret its slope and intercept within the observed input range. Include a suitable graph, examine residuals and explain any extrapolation, outliers and alternative explanations."
    }
  },
  {
    "id": "nonlinear-fitting",
    "category": "Functions & modelling",
    "title": "Choose and fit a nonlinear model (exponential example)",
    "definitionIds": [
      "nonlinear-regression",
      "exponential-model",
      "quadratic-model",
      "log-transformation",
      "transformed-regression",
      "parameter",
      "domain",
      "residual",
      "overfitting"
    ],
    "details": {
      "skill": "Recognise the structure by hand; let regression technology estimate parameters from noisy real data",
      "when": "When an initial scatterplot shows curvature or multiplicative change that a straight line cannot reasonably represent.",
      "avoid": "A curve with more parameters may fit the training data more closely without being a better explanation. The exact-data demonstration below identifies parameters; it is NOT a least-squares regression on noisy measurements. Exponential log transformations require positive y and change the fitting error scale.",
      "formula": "Exponential model y = a*b^x (a>0, b>0). After logarithms, ln y = ln a + x ln b. Quadratic models y = ax²+bx+c have a different structure.",
      "worked": {
        "context": "In a deliberately exact fictional example, four observations follow x = 0, 1, 2, 3 and y = 2, 6, 18, 54. Identify an exponential model, then explain how real regression would differ.",
        "table": {
          "caption": "An exact exponential example, for learning parameter identification",
          "headers": [
            "x",
            "observed y",
            "ratio to previous y",
            "fitted y = 2·3^x"
          ],
          "rows": [
            [
              "0",
              "2",
              "—",
              "2"
            ],
            [
              "1",
              "6",
              "3",
              "6"
            ],
            [
              "2",
              "18",
              "3",
              "18"
            ],
            [
              "3",
              "54",
              "3",
              "54"
            ]
          ]
        },
        "steps": [
          "Plot the paired observations first. For equal increases of \\(1\\) in \\(x\\), the differences \\(4,12,36\\) increase, so a straight line would not describe this exact pattern.",
          "The successive positive ratios are \\(\\frac62=\\frac{18}{6}=\\frac{54}{18}=3\\). This motivates an exponential model \\(y=ab^x\\), rather than proving that all real data must be exponential.",
          "At \\(x=0\\), the model gives \\(a=2\\). Multiplication by \\(3\\) per step gives \\(b=3\\), so the illustrative relation is \\(\\hat{y}=2\\cdot3^x\\).",
          "Check all four inputs. Because these numbers were constructed exactly, the residuals happen to be \\(0\\) at each point; this is parameter identification, NOT evidence of a robust fitted law.",
          "When \\(y>0\\), taking logs gives \\(\\ln y=\\ln 2+x\\ln 3\\). Fitting a line to \\(\\ln y\\) minimises errors on the log scale, whereas direct nonlinear least squares targets residuals in the original \\(y\\) units.",
          "With genuine imperfect observations, compare plausible functions (for example exponential and quadratic), fit parameters using technology, inspect original-scale residuals, domain, plausibility and performance on unseen data."
        ],
        "answer": "The exact fictional pattern is \\(\\hat{y}=2\\cdot3^x\\). This identification is not the same as proving that an exponential regression is appropriate for a real investigation.",
        "interpretation": "Exponential means a constant multiplicative factor for a fixed input change. A quadratic is a separate family with approximately constant second differences for equally spaced x. Use the observed pattern and purpose to justify any model."
      },
      "guided": {
        "parts": [
          {
            "question": "For equal x-steps, the fictional y-values 2, 3, 6, 11 have first differences 1, 3, 5 and second differences 2, 2. Which model family is structurally suggested?",
            "options": [
              [
                "quadratic",
                "Quadratic"
              ],
              [
                "exponential",
                "Exponential with a constant ratio"
              ],
              [
                "linear",
                "Straight line with a constant first difference"
              ]
            ],
            "correct": "quadratic",
            "hint": "For equally spaced x, first differences support a linear pattern; nearly constant second differences suggest a quadratic.",
            "feedback": "A quadratic such as \\(y=x^2+2\\) produces exactly these four values. A suggested shape still needs a contextual explanation and residual checks."
          },
          {
            "question": "A measured response contains zero and negative values. Can you directly fit ln(y) against x without changing or excluding those observations?",
            "options": [
              [
                "no",
                "No: real ln(y) is undefined at zero and negative y"
              ],
              [
                "yes",
                "Yes: log transforms always work for every response"
              ],
              [
                "fix",
                "Yes: silently replace nonpositive values with 1"
              ]
            ],
            "correct": "no",
            "hint": "Ask which real values have a logarithm and whether changing observations would distort the question.",
            "feedback": "A log-y transformation requires strictly positive responses. Do not silently discard or alter data; consider another justified method or model."
          }
        ]
      },
      "independent": {
        "question": "For exact fictional observations (0,3), (1,6), (2,12), (3,24), identify a multiplicative model and interpolate its value at x = 1.5. Why would fitting real measurements need more work?",
        "answer": "The pattern has \\(a=3\\) and \\(b=2\\), so \\(\\hat{y}=3\\cdot2^x\\). At \\(x=1.5\\), \\(\\hat{y}=3\\cdot2^{1.5}\\approx8.485\\).",
        "reasoning": "Ratios of consecutive positive responses are all 2. The interpolation lies inside the observed range, but real observations have noise; estimate parameters, report units and check original-scale residuals."
      },
      "technology": [
        {
          "name": "Desmos — direct nonlinear regression",
          "command": "y_1 ~ a b^{x_1}",
          "why": "With paired x_1/y_1 data, estimate parameters a and b. Check positive-base constraints as needed and inspect residuals on the response scale."
        },
        {
          "name": "Desmos — quadratic alternative",
          "command": "y_1 ~ a x_1^2 + b x_1 + c",
          "why": "Use only if a turning-point/second-difference shape is mathematically and contextually plausible, then evaluate the fit and domain."
        }
      ],
      "existingGuide": "desmos-regression",
      "ia": "Show the original scatterplot, compare relevant model families, state what each parameter means, report the fitting method and which error scale was minimised, and inspect residuals and domain. Do not mistake an artificial exact curve, log-transformed fit or larger R-squared for genuine explanatory power."
    }
  }

]);
