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
  "histograms": [
    {
      "label": "Frequency density for any class",
      "tex": "\\text{frequency density}=\\frac{\\text{class frequency}}{\\text{class width}}",
      "spoken": "Frequency density equals the number of observations in a class divided by that class's numerical width."
    },
    {
      "label": "A histogram bar's area",
      "tex": "\\text{bar area}=\\text{class width}\\times\\text{frequency density}=\\text{class frequency}",
      "spoken": "Each histogram bar's area is its class width multiplied by its frequency density, giving the class frequency."
    },
    {
      "label": "Check total grouped frequency",
      "tex": "n=\\sum_{i=1}^{k}f_i",
      "spoken": "The total number of observations equals the sum of the frequencies of the k non-overlapping classes."
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
  }
});
