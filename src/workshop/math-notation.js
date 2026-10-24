/** Curated, read-only mathematical presentation for Maths Workshop.
 * MathJax is already part of IA Pathfinder. No automatic conversion of student
 * answers or ad hoc parsing of words into unverified mathematical equations.
 * Spoken equivalents remain available if SVG rendering cannot be used.
 *
 * New lessons should supply a labelled mathematical relationship here; 
 * each glossary notation needs a matched definition ID.
 */
export const WORKSHOP_LESSON_FORMULAS=Object.freeze({
  "descriptive": [
    {
      "label": "Arithmetic mean",
      "tex": "\\bar{x}=\\frac{1}{n}\\sum_{i=1}^{n}x_i",
      "spoken": "The mean x bar is the sum of n observations divided by n."
    },
    {
      "label": "Population standard deviation",
      "tex": "\\sigma=\\sqrt{\\frac{\\sum_{i=1}^{N}(x_i-\\mu)^2}{N}}",
      "spoken": "Population standard deviation sigma is the square root of the sum of squared deviations from the population mean, divided by the population size N."
    },
    {
      "label": "Sample standard deviation",
      "tex": " s=\\sqrt{\\frac{\\sum_{i=1}^{n}(x_i-\\bar{x})^2}{n-1}}",
      "spoken": "Sample standard deviation s is the square root of the sum of squared deviations from the sample mean, divided by n minus one."
    }
  ],
  "pearson": [
    {
      "label": "Centred cross-products",
      "tex": "S_{xy}=\\sum_{i=1}^{n}(x_i-\\bar{x})(y_i-\\bar{y})",
      "spoken": "S x y is the sum of the products of each x deviation and the corresponding y deviation."
    },
    {
      "label": "Squared deviations",
      "tex": "S_{xx}=\\sum_{i=1}^{n}(x_i-\\bar{x})^2,\\quad S_{yy}=\\sum_{i=1}^{n}(y_i-\\bar{y})^2",
      "spoken": "S x x and S y y are the sums of squared deviations for x and y, respectively."
    },
    {
      "label": "Pearson's correlation coefficient",
      "tex": "r=\\frac{S_{xy}}{\\sqrt{S_{xx}\\,S_{yy}}}",
      "spoken": "Pearson's r is the cross-product sum divided by the square root of the product of the two squared-deviation sums."
    }
  ],
  "optimisation": [
    {
      "label": "Candidate stationary points",
      "tex": "f'(x)=0,\\qquad x\\in D",
      "spoken": "Find points x in the feasible domain D where the first derivative is zero."
    },
    {
      "label": "Second derivative test (when applicable)",
      "tex": "f''(x)<0\\;\\Longrightarrow\\;\\text{local maximum}",
      "spoken": "If the second derivative is negative at a stationary point, that point is a local maximum. Compare boundaries and other candidates for a global maximum."
    }
  ],
  "sampling": [
    {
      "label": "Proportional stratified allocation",
      "tex": "n_h=n\\cdot\\frac{N_h}{N}",
      "spoken": "Sample size for stratum h equals total planned sample size times stratum population divided by overall population."
    },
    {
      "label": "Check the whole-number allocations",
      "tex": "\\sum_h n_h=n",
      "spoken": "After whole-number rounding, the stratum sample counts must add to the planned total sample size."
    }
  ],
  "distributions": [
    {
      "label": "Interquartile range",
      "tex": "\\mathrm{IQR}=Q_3-Q_1",
      "spoken": "The interquartile range equals the upper quartile minus the lower quartile."
    },
    {
      "label": "Potential-outlier fences",
      "tex": "Q_1-1.5\\,\\mathrm{IQR}\\qquad Q_3+1.5\\,\\mathrm{IQR}",
      "spoken": "The lower and upper one-point-five IQR fences are used to flag possible outliers, not automatically remove them."
    },
    {
      "label": "Histogram frequency density",
      "tex": "\\text{Frequency density}=\\frac{\\text{frequency}}{\\text{class width}}",
      "spoken": "Frequency density is the frequency divided by the class width."
    }
  ],
  "two-way-proportions": [
    {
      "label": "Conditional proportion",
      "tex": "P(A\\mid X)=\\frac{n(A\\cap X)}{n(X)}",
      "spoken": "The proportion choosing A within group X equals the number choosing A in X divided by the total in X."
    },
    {
      "label": "Within-group percentage",
      "tex": "p_X=\\frac{\\text{count in category A and group X}}{\\text{total in group X}}\\times100\\%",
      "spoken": "Within-group percentage is the relevant cell count divided by its group total, multiplied by 100."
    },
    {
      "label": "Percentage-point difference",
      "tex": "\\text{Gap in points}=p_X-p_Y",
      "spoken": "Percentage-point difference is the subtraction of two percentages stated using the same conditioning."
    }
  ],
  "measurement": [
    {
      "label": "Rounding-only interval",
      "tex": "x_{\\mathrm{r}}-\\frac{h}{2}\\leq x<x_{\\mathrm{r}}+\\frac{h}{2}",
      "spoken": "If x r is correctly rounded to the nearest step h, rounding alone places the underlying value between x r minus half h inclusive and x r plus half h exclusive."
    },
    {
      "label": "Rounding-only relative half-step",
      "tex": "\\frac{h/2}{\\lvert x_{\\mathrm{r}}\\rvert}\\times100\\%",
      "spoken": "The rounding half-step as a percentage of a nonzero reported value equals half the step divided by the absolute reported value, times 100."
    }
  ],
  "spearman": [
    {
      "label": "Correlation of paired ranks",
      "tex": "\\rho_s=\\operatorname{corr}(R_x,R_y)",
      "spoken": "Spearman rho is the Pearson correlation of paired ranks, with average ranks for ties."
    },
    {
      "label": "Shortcut for untied ranks only",
      "tex": "\\rho_s=1-\\frac{6\\sum_{i=1}^{n}d_i^2}{n(n^2-1)}",
      "spoken": "Only for observations without tied ranks, rho equals one minus six times the sum of squared rank differences divided by n times n squared minus one."
    },
    {
      "label": "Average rank for tied observations",
      "tex": "R_{\\text{tie}}=\\frac{r_{\\text{first}}+r_{\\text{last}}}{2}",
      "spoken": "Tied observations each receive the mean of their occupied rank positions."
    }
  ],
  "linear-regression": [
    {
      "label": "Least-squares slope",
      "tex": "b=\\frac{\\sum_i(x_i-\\bar{x})(y_i-\\bar{y})}{\\sum_i(x_i-\\bar{x})^2}",
      "spoken": "For ordinary least squares with an intercept and varying x, slope is the centred xy cross-product sum divided by the x squared-deviation sum."
    },
    {
      "label": "Regression intercept",
      "tex": "a=\\bar{y}-b\\bar{x}",
      "spoken": "The intercept equals mean y minus slope times mean x."
    },
    {
      "label": "Fitted line and residual",
      "tex": "\\hat{y}=a+bx,\\qquad e_i=y_i-\\hat{y}_i",
      "spoken": "The fitted response is a plus bx; the residual is observed response minus fitted response."
    }
  ],
  "nonlinear-fitting": [
    {
      "label": "Exponential candidate",
      "tex": "y=ab^x,\\qquad a>0,\\ b>0",
      "spoken": "An exponential model has initial scale a and positive multiplicative base b."
    },
    {
      "label": "Log transformation (positive responses)",
      "tex": "\\ln y=\\ln a+x\\ln b",
      "spoken": "Only for positive y, log y is log a plus x times log b; fitting on the log scale changes the error objective."
    },
    {
      "label": "Quadratic alternative",
      "tex": "y=ax^2+bx+c",
      "spoken": "A quadratic model can describe curvature or a turning point, but has a different structure from exponential growth."
    }
  ],
  "residual-diagnostics": [
    {
      "label": "Signed residual",
      "tex": "e_i=y_i-\\hat{y}_i",
      "spoken": "At each input the residual equals the observed response minus the model's prediction."
    },
    {
      "label": "Sum of squared residuals",
      "tex": "\\mathrm{SSE}=\\sum_{i=1}^{n} e_i^2",
      "spoken": "Sum squared errors is the sum of squared residuals."
    },
    {
      "label": "Descriptive root mean squared error",
      "tex": "\\mathrm{RMSE}=\\sqrt{\\frac{\\sum_{i=1}^{n}e_i^2}{n}}",
      "spoken": "RMSE is the square root of the average squared residual on the stated evaluation dataset."
    }
  ],
  "model-comparison": [
    {
      "label": "Same-scale comparison",
      "tex": "\\mathrm{RMSE}=\\sqrt{\\frac{\\mathrm{SSE}}{n}}",
      "spoken": "Compare candidate models on the same observations using root mean squared error in the original response units."
    },
    {
      "label": "R-squared with mean-response baseline",
      "tex": "R^2=1-\\frac{\\mathrm{SSE}}{\\sum_i(y_i-\\bar{y})^2}",
      "spoken": "Coefficient of determination is one minus squared error divided by squared deviation about the observed response mean, when the denominator is positive."
    },
    {
      "label": "Unseen prediction error",
      "tex": "e_{\\text{holdout}}=y_{\\text{holdout}}-\\hat{y}_{\\text{holdout}}",
      "spoken": "A held-out prediction error is the unseen observed response minus the prediction made without using that observation for fitting."
    }
  ]
});
export const WORKSHOP_DEFINITION_FORMULAS=Object.freeze({
  "mean": {
    "tex": "\\bar{x}=\\frac{\\sum_{i=1}^{n}x_i}{n}",
    "spoken": "Mean equals the sum of observed values divided by the number of values."
  },
  "standard-deviation": {
    "tex": "\\sigma=\\sqrt{\\frac{\\sum_{i=1}^{N}(x_i-\\mu)^2}{N}}",
    "spoken": "Population standard deviation uses the population mean and divisor N. The sample standard deviation uses the sample mean and divisor n minus one."
  },
  "correlation": {
    "tex": "-1\\leq r\\leq 1",
    "spoken": "Pearson's correlation r lies between minus one and one."
  },
  "residual": {
    "tex": "e_i=y_i-\\hat{y}_i",
    "spoken": "A residual is an observed value minus its predicted value."
  },
  "stationary-point": {
    "tex": "f'(x)=0",
    "spoken": "A stationary point of a differentiable function has derivative zero."
  },
  "euclidean-distance": {
    "tex": "d=\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}",
    "spoken": "Distance is the square root of the sum of the squared horizontal and vertical coordinate differences."
  },
  "probability": {
    "tex": "0\\leq P(A)\\leq 1",
    "spoken": "The probability of an event lies between zero and one."
  },
  "expected-value": {
    "tex": "\\operatorname{E}(X)=\\sum_x x\\,P(X=x)",
    "spoken": "Expected value is the sum over possible outcomes of each value multiplied by its probability."
  },
  "sample-size": {
    "tex": "n=\\text{number of sampling units}",
    "spoken": "n is the sample size, the number of sampling units."
  },
  "interquartile-range": {
    "tex": "\\mathrm{IQR}=Q_3-Q_1",
    "spoken": "Interquartile range equals the upper quartile minus the lower quartile."
  },
  "frequency-density": {
    "tex": "\\text{frequency density}=\\frac{\\text{frequency}}{\\text{class width}}",
    "spoken": "Frequency density equals frequency divided by class width."
  },
  "conditional-proportion": {
    "tex": "P(A\\mid X)=\\frac{n(A\\cap X)}{n(X)}",
    "spoken": "The conditional proportion of A given X is the number belonging to A and X divided by the total belonging to X."
  },
  "relative-uncertainty": {
    "tex": "\\text{relative uncertainty}=\\frac{\\text{justified absolute uncertainty}}{\\lvert\\text{reported value}\\rvert}",
    "spoken": "Relative uncertainty equals a justified absolute uncertainty divided by the magnitude of the reported value, which must not be zero."
  },
  "tied-rank": {
    "tex": "R=\\frac{r_{\\mathrm{first}}+r_{\\mathrm{last}}}{2}",
    "spoken": "Tied values each receive the average of the occupied rank positions."
  },
  "spearman-rho": {
    "tex": "\\rho_s=\\operatorname{corr}(R_x,R_y)",
    "spoken": "Spearman rho is the ordinary Pearson correlation of paired rank columns."
  },
  "regression-line": {
    "tex": "\\hat{y}=a+bx",
    "spoken": "A linear regression prediction is a plus b times x."
  },
  "gradient": {
    "tex": "b=\\frac{S_{xy}}{S_{xx}}",
    "spoken": "Slope is the centred cross-product sum divided by the centred x squared-deviation sum."
  },
  "intercept": {
    "tex": "a=\\bar{y}-b\\bar{x}",
    "spoken": "Intercept is mean y minus slope times mean x."
  },
  "centred-sums": {
    "tex": "S_{xx}=\\sum_i(x_i-\\bar{x})^2,\\quad S_{xy}=\\sum_i(x_i-\\bar{x})(y_i-\\bar{y})",
    "spoken": "S xx is the x sum of squared deviations; S xy is the sum of paired centred cross-products."
  },
  "fitted-value": {
    "tex": "\\hat{y}_i=f(x_i;\\theta)",
    "spoken": "Fitted value is the model evaluated at observed input x i using fitted parameters theta."
  },
  "sum-squared-errors": {
    "tex": "\\mathrm{SSE}=\\sum_{i=1}^{n}(y_i-\\hat{y}_i)^2",
    "spoken": "Sum squared errors is the sum of squared differences between observed and fitted responses."
  },
  "exponential-model": {
    "tex": "y=ab^x,\\quad a>0,\\ b>0",
    "spoken": "An exponential model takes the form a times b to power x, with positive a and b."
  },
  "quadratic-model": {
    "tex": "y=ax^2+bx+c,\\quad a\\ne0",
    "spoken": "A quadratic model is a x squared plus b x plus c, with a nonzero quadratic coefficient."
  },
  "log-transformation": {
    "tex": "\\ln y=\\ln a+x\\ln b",
    "spoken": "For positive responses, log y is log a plus x times log b in an exponential model."
  },
  "r-squared": {
    "tex": "R^2=1-\\frac{\\mathrm{SSE}}{\\sum_{i=1}^{n}(y_i-\\bar{y})^2}",
    "spoken": "R squared equals one minus SSE divided by the observed response total sum of squares on the same scale, when the denominator is positive."
  },
  "rmse": {
    "tex": "\\mathrm{RMSE}=\\sqrt{\\frac{1}{n}\\sum_{i=1}^{n}(y_i-\\hat{y}_i)^2}",
    "spoken": "Root mean squared error is the square root of mean squared prediction error on the evaluation dataset."
  }
});
