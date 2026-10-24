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
 /* Methods are supplied below in the same source for ease of review. */
]);
