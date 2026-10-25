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
  "quadratic-functions": [
    {"label":"Completed-square form","tex":"y=a(x-h)^2+k","spoken":"The quadratic's vertex is h comma k."},
    {"label":"Vertex of a quadratic","tex":"h=-\\frac{b}{2a}","spoken":"For a x squared plus b x plus c, the vertex input is minus b over two a."}
  ],
  "exponential-logarithms": [
    {"label":"Exponential growth model","tex":"N(t)=a\\,b^t","spoken":"N at time t equals initial amount a times b to power t."},
    {"label":"Solve for time","tex":"t=\\frac{\\ln(N/a)}{\\ln b}","spoken":"Time is log of the output divided by initial amount, over log of the growth factor."}
  ],
  "sinusoidal-functions": [
    {"label":"Sine model with phase shift","tex":"y=d+A\\sin\\!\\left(\\frac{2\\pi(t-c)}{T}\\right)","spoken":"Midline d plus amplitude A times sine of two pi times shifted time over period T."},
    {"label":"Period and angular frequency","tex":"\\omega=\\frac{2\\pi}{T}","spoken":"Angular frequency equals two pi divided by period."}
  ],
  "derivatives-motion": [
    {"label":"Instantaneous velocity","tex":"v(t)=\\frac{ds}{dt}","spoken":"Velocity is the derivative of position with respect to time."},
    {"label":"Acceleration","tex":"a(t)=\\frac{d^2s}{dt^2}","spoken":"Acceleration is the second time derivative of position."}
  ],
  "integrals-accumulation": [
    {"label":"Accumulated change","tex":"\\Delta Q=\\int_{a}^{b}r(t)\\,dt","spoken":"The accumulated change is the definite integral of rate r over the interval."},
    {"label":"Fundamental theorem of calculus","tex":"\\int_{a}^{b}r(t)\\,dt=F(b)-F(a)","spoken":"If F is an antiderivative of r, evaluate F at the upper bound minus lower bound."}
  ],
  "image-calibration": [
    {"label":"Length per image pixel","tex":"s=\\frac{L_{\\mathrm{ref}}}{p_{\\mathrm{ref}}}","spoken":"Real reference length divided by the corresponding pixel length gives length per pixel."},
    {"label":"Calibrated distance","tex":"d=s\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}","spoken":"Calibrated length equals the metres per pixel factor times the pixel coordinate distance."},
    {"label":"Area scaling","tex":"A_{\\mathrm{real}}=s^2A_{\\mathrm{pixels}}","spoken":"Area in real square units equals square of the length scale times the image pixel area."}
  ],
  "triangulation": [
    {"label":"Triangle angle sum","tex":"A+B+C=180^\\circ","spoken":"The three interior angles of a plane triangle total one hundred and eighty degrees."},
    {"label":"Sine rule","tex":"\\frac{AB}{\\sin C}=\\frac{AC}{\\sin B}=\\frac{BC}{\\sin A}","spoken":"The ratio of each side length to the sine of its opposite angle is the same."},
    {"label":"Cosine rule","tex":"c^2=a^2+b^2-2ab\\cos C","spoken":"Side c squared equals a squared plus b squared minus twice a b cosine of included angle C."}
  ],
  "geometric-areas": [
    {"label":"Subtract a cut-out","tex":"A_{\\mathrm{region}}=A_{\\mathrm{outer}}-A_{\\mathrm{cutout}}","spoken":"Composite region area equals outer area minus the removed area."},
    {"label":"Prism volume","tex":"V=A_{\\mathrm{cross\\ section}}\\,h","spoken":"For a prism, volume equals constant cross-sectional area times perpendicular length."},
    {"label":"Similarity area scale","tex":"A_{\\mathrm{new}}=k^2 A_{\\mathrm{old}}","spoken":"When lengths scale by k, area scales by k squared."}
  ],
  "voronoi-regions": [
    {"label":"Equality of squared site distances","tex":"(x-x_A)^2+(y-y_A)^2=(x-x_B)^2+(y-y_B)^2","spoken":"A point is equidistant from sites A and B when the two squared distance expressions are equal."},
    {"label":"Bisector in the worked example","tex":"x=4","spoken":"The perpendicular bisector of sites zero zero and eight zero is the vertical line x equals four."},
    {"label":"Triple-site vertex","tex":"V=\\left(4,\\frac{5}{3}\\right)","spoken":"The intersection of the two worked bisectors is four comma five thirds."}
  ],
  "geometry-sensitivity": [
    {"label":"Nominal rectangle area","tex":"A_0=LW","spoken":"Area at reported dimensions equals length times width."},
    {"label":"Positive-input lower and upper bounds","tex":"L_{\\min}W_{\\min}\\le A\\le L_{\\max}W_{\\max}","spoken":"For positive input intervals, the smallest rectangle area uses both lower endpoints and the largest uses both upper endpoints."},
    {"label":"Worked example bound","tex":"38.61\\le A\\le41.41\\quad(\\mathrm{m}^2)","spoken":"Under the given plausible input intervals the calculated area is between thirty eight point six one and forty one point four one square metres."}
  ],

  "conditional-probability-tree":[
   {label:"Multiply along a path",tex:"P(A\\cap B)=P(A)P(B\\mid A)",spoken:"Joint probability is first-event probability times the second conditional probability."},
   {label:"Condition on the observed event",tex:"P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)}",spoken:"Conditional probability of A given B is the probability of both divided by probability of B, which must be positive."}
  ],
  "discrete-expected-value":[
   {label:"Expected net outcome",tex:"E(X)=\\sum_x xP(X=x)",spoken:"Expected net outcome is the weighted sum of possible net values."},
   {label:"Spread of the net outcome",tex:"\\operatorname{Var}(X)=E(X^2)-[E(X)]^2",spoken:"Variance is the expected square minus the square of the expected value."}
  ],
  "simulation-design":[
   {label:"Estimated event probability",tex:"\\hat p=\\frac{k}{n}",spoken:"Simulated relative frequency is successes k divided by complete simulated trials n."},
   {label:"Theoretical two-head event",tex:"P(X=2)=\\binom32\\left(\\frac12\\right)^3=\\frac38",spoken:"Exactly two heads in three independent fair tosses has probability three eighths."}
  ],
  "binomial-models":[
   {label:"Binomial probability mass",tex:"P(X=k)=\\binom nk p^k(1-p)^{n-k}",spoken:"For n independent trials with constant success probability p, exactly k successes has a binomial probability."},
   {label:"Complementary upper tail",tex:"P(X\\ge1)=1-P(X=0)",spoken:"At least one success equals one minus the probability of zero successes."}
  ],
  "normal-models":[
   {label:"Normal distribution parameters",tex:"X\\sim N(\\mu,\\sigma^2)",spoken:"A normal model is specified by mean mu and variance sigma squared."},
   {label:"Standard score",tex:"z=\\frac{x-\\mu}{\\sigma}",spoken:"A standard score is observed value minus model mean divided by model standard deviation."}
  ],
  "inference-evidence":[
   {label:"One-sided null and alternative",tex:"H_0:p=0.5,\\quad H_1:p>0.5",spoken:"The null probability of success is half; the pre-specified alternative is greater than half."},
   {label:"Inclusive upper-tail probability",tex:"P(X\\ge8\\mid H_0)=\\frac{\\binom{10}{8}+\\binom{10}{9}+\\binom{10}{10}}{2^{10}}",spoken:"Under ten independent fair coin tosses the upper-tail probability for eight or more heads includes counts eight, nine and ten."}
  ],
  "finance-compound-growth": [
    {"label":"Periodic rate from nominal annual rate","tex":"i=\\frac{r}{m}","spoken":"Periodic rate i equals nominal annual rate r divided by m compounding periods per year."},
    {"label":"Compound future value","tex":"FV=P\\left(1+\\frac{r}{m}\\right)^{mt}","spoken":"Future value equals principal times the periodic growth factor over m times t intervals."},
    {"label":"Effective annual rate","tex":"r_{\\mathrm{eff}}=\\left(1+\\frac{r}{m}\\right)^m-1","spoken":"Effective annual rate is the compounded annual factor minus one."}
  ],
  "finance-loan-repayments": [
    {"label":"Fixed end-of-period payment","tex":"M=\\frac{Pi}{1-(1+i)^{-n}}","spoken":"Payment M equals principal times periodic rate divided by one minus the inverse n-period growth factor, for positive rate and equal end-period payments."},
    {"label":"Loan-balance recurrence","tex":"B_k=(1+i)B_{k-1}-M","spoken":"The new balance equals the prior balance plus its interest minus the period-end payment."},
    {"label":"Interest and principal components","tex":"I_k=iB_{k-1},\\quad Q_k=M-I_k","spoken":"Interest is periodic rate times opening balance. Principal reduction is payment minus interest."}
  ],
  "finance-break-even": [
    {"label":"Linear profit function","tex":"\\Pi(q)=(p-v)q-F","spoken":"Profit is selling price minus variable cost per item, times quantity, minus fixed cost."},
    {"label":"Break-even sales threshold","tex":"q_{\\mathrm{BE}}=\\frac{F}{p-v},\\quad p>v","spoken":"Break-even sales quantity is fixed cost divided by positive contribution per item, if demand and capacity allow."}
  ],
  "finance-cashflow": [
    {"label":"Monthly net cash flow","tex":"C_k=I_k-O_k","spoken":"Net cash flow is cash received minus cash paid in period k."},
    {"label":"Running cash balance","tex":"B_k=B_{k-1}+C_k","spoken":"Closing cash in one period equals opening cash plus the net cash movement."}
  ],
  "finance-present-value": [
    {"label":"Discount a future cash flow","tex":"PV_t=\\frac{C_t}{(1+d)^t}","spoken":"Present value of a period t cash flow is its signed amount divided by one plus the discount rate to power t."},
    {"label":"Net present value includes time zero","tex":"NPV=C_0+\\sum_{t=1}^{T}\\frac{C_t}{(1+d)^t}","spoken":"NPV includes the immediate signed cash flow at time zero and discounts each later signed cash flow."}
  ],
  "finance-sensitivity": [
    {"label":"Profit in each scenario","tex":"\\Pi=(p-v)q-F","spoken":"For each financial scenario calculate contribution margin times sales quantity minus fixed cost."},
    {"label":"Threshold selling price","tex":"p_*=v+\\frac{F}{q},\\qquad q>0","spoken":"At a fixed positive sales quantity, the break-even selling price equals unit cost plus fixed cost per sold item."}
  ],
  "proof-conjectures": [
   {"label":"Universal statement and counterexample","tex":"\\forall n\\in D,\\ P(n)","spoken":"A universal claim says P of n holds for every n in the stated domain D."},
   {"label":"Counterexample refutes the universal claim","tex":"n=4:\\quad 4^2+4+1=21=3\\times7","spoken":"At n equals four, the expression is twenty one, which is three times seven, so it is not prime."}
  ],
  "proof-direct-reasoning": [
   {"label":"Difference of consecutive squares","tex":"(n+1)^2-n^2=2n+1","spoken":"The difference of consecutive squares is two n plus one, which is odd when n is an integer."},
   {"label":"Algebraic evenness for multiples of four","tex":"n=4k=2(2k),\\quad k\\in\\mathbb Z","spoken":"Every multiple of four has the form two times an integer, so is even."}
  ],
  "proof-induction-patterns": [
   {"label":"Claim about a positive integer index","tex":"\\sum_{j=1}^{n}(2j-1)=n^2,\\quad n\\ge1","spoken":"The sum of the first n positive odd integers equals n squared for any positive integer n."},
   {"label":"Induction step from k to k plus one","tex":"k^2+(2k+1)=(k+1)^2","spoken":"Using the induction hypothesis for the first k odd terms, adding the next odd term gives k plus one squared."}
  ],
  "iteration-sequences": [
   {"label":"Arithmetic nth term and partial sum","tex":"a_n=a_1+(n-1)d,\\quad S_n=\\frac n2\\left[2a_1+(n-1)d\\right]","spoken":"For an arithmetic sequence indexed from one, the nth term adds n minus one common differences; the sum adds the first n terms."},
   {"label":"Geometric nth term","tex":"b_n=b_1r^{n-1}","spoken":"The nth geometric term is the first term times the common ratio to the n minus one power."}
  ],
  "iteration-fixed-points": [
   {"label":"Fixed-point condition","tex":"g(L)=L","spoken":"A fixed point L is unchanged by applying the map g."},
   {"label":"Proven error contraction for the example","tex":"|x_n-1|=3^{-n}\\longrightarrow0","spoken":"For the chosen starting value, absolute error from the fixed point after n steps is three to the minus n, which tends to zero."}
  ],
  "iteration-bisection": [
   {"label":"Retained bracket midpoint","tex":"m=\\frac{a+b}{2}","spoken":"The bisection midpoint is the average of the current lower and upper endpoints."},
   {"label":"Certified midpoint error","tex":"|m-\\alpha|\\le\\frac{b-a}{2}","spoken":"If a root alpha remains in the bracket from a to b, the midpoint's absolute error is at most half the bracket width."}
  ],
  "iteration-newton": [
   {"label":"General Newton update","tex":"x_{n+1}=x_n-\\frac{f(x_n)}{f'(x_n)}","spoken":"Subtract f of the current estimate divided by its derivative, provided that derivative is nonzero."},
   {"label":"Newton update for square root of two","tex":"x_{n+1}=\\frac12\\left(x_n+\\frac{2}{x_n}\\right)","spoken":"For f of x equals x squared minus two, average the current nonzero estimate and two divided by that estimate."}
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
  ],
  "poisson-models":[
   {"label":"Poisson probability for an exact count","tex":"P(X=k)=\\frac{e^{-\\lambda}\\lambda^k}{k!}","spoken":"The Poisson exact count probability equals e to minus lambda times lambda to power k, divided by k factorial."},
   {"label":"Poisson mean and variance","tex":"E(X)=\\lambda,\\quad \\mathrm{Var}(X)=\\lambda","spoken":"Both mean and variance equal lambda for a Poisson random variable."}
  ],
  "uniform-continuous-models":[
   {"label":"Density inside the uniform support","tex":"f(x)=\\frac{1}{b-a},\\quad a\\le x\\le b","spoken":"For values between a and b, the uniform density equals one over b minus a."},
   {"label":"Interval area inside the support","tex":"P(c\\le X\\le d)=\\frac{d-c}{b-a},\\quad a\\le c\\le d\\le b","spoken":"When the event interval lies inside the support, its probability equals its length divided by the entire support width."}
  ],
  "custom-discrete-models":[
   {"label":"Valid discrete probability total","tex":"\\sum_i p_i=1,\\qquad p_i\\ge0","spoken":"All discrete outcome probabilities must be nonnegative and their sum must equal one."},
   {"label":"Expected value from discrete outcomes","tex":"E(X)=\\sum_i x_i p_i","spoken":"Expected value equals the sum of each outcome multiplied by its probability."}
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
  "vertex-form": {"tex":"y=a(x-h)^2+k","spoken":"A quadratic in vertex form has turning point h comma k."},
  "discriminant": {"tex":"\\Delta=b^2-4ac","spoken":"The discriminant is b squared minus four a c."},
  "doubling-time": {"tex":"T=\\frac{\\ln 2}{\\ln b}","spoken":"Doubling time equals natural log of two divided by natural log of b, for b greater than one."},
  "logarithm": {"tex":"\\ln(e^x)=x","spoken":"Natural log and the exponential function are inverses."},
  "period": {"tex":"T=\\frac{2\\pi}{\\lvert b\\rvert}","spoken":"A sine or cosine function with coefficient b on the input has period two pi over the absolute value of b."},
  "angular-frequency": {"tex":"\\omega=\\frac{2\\pi}{T}","spoken":"Angular frequency is two pi over the period."},
  "average-rate": {"tex":"\\frac{\\Delta y}{\\Delta x}","spoken":"Average rate is change in output divided by nonzero change in input."},
  "definite-integral": {"tex":"\\int_a^b f(x)\\,dx","spoken":"The definite integral of f from a to b gives signed accumulation."},
  "antiderivative": {"tex":"F'(x)=f(x)","spoken":"The derivative of an antiderivative F is the original function f."},
  "calibration-factor": {"tex":"s=\\frac{L_{\\mathrm{ref}}}{p_{\\mathrm{ref}}}","spoken":"Calibration scale is known real reference length divided by corresponding pixel length."},
  "area-scale": {"tex":"A_{\\mathrm{new}}=k^2 A_{\\mathrm{old}}","spoken":"Area after a uniform linear scale factor k is k squared times original area."},
  "sine-rule": {"tex":"\\frac{a}{\\sin A}=\\frac{b}{\\sin B}","spoken":"In a plane triangle the side over sine opposite angle ratios agree."},
  "cosine-rule": {"tex":"c^2=a^2+b^2-2ab\\cos C","spoken":"Cosine rule for the side opposite included angle C."},
  "triangle-area": {"tex":"A=\\frac{1}{2}ab\\sin C","spoken":"Triangle area is one half of two side lengths times sine of their included angle."},
  "cross-section-volume": {"tex":"V=Ah","spoken":"For a prism, volume equals constant cross-section area times its perpendicular length."},
  "worst-case-bounds": {"tex":"A\\ge L_{\\min}W_{\\min}","spoken":"For positive length and width within stated intervals, the product of the lower endpoints gives a conservative area lower bound."},
  "complement-event": {"tex":"P(A^c)=1-P(A)","spoken":"Complement probability equals one minus event probability."},
  "intersection-event": {"tex":"P(A\\cap B)","spoken":"Intersection means both A and B occur."},
  "conditional-probability": {"tex":"P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)}","spoken":"Probability of A given B is probability of both divided by probability of B, when B has positive probability."},
  "independent-events": {"tex":"P(A\\cap B)=P(A)P(B)","spoken":"For independent events, the probability of both is the product of their probabilities."},
  "joint-probability": {"tex":"P(A\\cap B)=P(A)P(B\\mid A)","spoken":"Joint probability is first-event probability times the other conditional probability."},
  "probability-distribution": {"tex":"\\sum_x P(X=x)=1","spoken":"The probabilities of all discrete outcomes add to one."},
  "discrete-variance": {"tex":"\\operatorname{Var}(X)=E(X^2)-[E(X)]^2","spoken":"Variance equals expected squared value minus squared expectation."},
  "relative-frequency": {"tex":"\\hat p=\\frac{k}{n}","spoken":"Relative frequency is successes over trials."},
  "binomial-distribution": {"tex":"P(X=k)=\\binom nk p^k(1-p)^{n-k}","spoken":"Probability of k successes in a binomial model with n trials and probability p."},
  "combination-count": {"tex":"\\binom nk=\\frac{n!}{k!(n-k)!}","spoken":"n choose k is n factorial divided by k factorial times n minus k factorial."},
  "cumulative-probability": {"tex":"P(X\\le k)=\\sum_{j=0}^kP(X=j)","spoken":"Discrete cumulative probability up to and including k sums probabilities from zero through k for a nonnegative count."},
  "normal-distribution": {"tex":"X\\sim N(\\mu,\\sigma^2)","spoken":"A normal distribution has mean mu and variance sigma squared."},
  "standard-score": {"tex":"z=\\frac{x-\\mu}{\\sigma}","spoken":"Standard score is deviation from mean divided by standard deviation."},
  "simple-interest": {"tex":"A=P(1+rt)","spoken":"Simple-interest amount is principal times one plus annual rate times years, when the rate is constant."},
  "compound-interest": {"tex":"A=P(1+i)^n","spoken":"Compounded amount is principal times one plus periodic rate to the number of periods."},
  "periodic-interest-rate": {"tex":"i=\\frac{r}{m}","spoken":"When r is a stated nominal annual rate, periodic i is r divided by m compounding periods per year."},
  "effective-annual-rate": {"tex":"r_{\\mathrm{eff}}=\\left(1+\\frac{r}{m}\\right)^m-1","spoken":"Effective annual rate equals one-year compound growth factor minus one."},
  "future-value-finance": {"tex":"FV=P(1+i)^n","spoken":"Future value is present principal multiplied by n periodic growth factors."},
  "interest-component": {"tex":"I_k=iB_{k-1}","spoken":"Interest in period k is the periodic rate times the preceding balance."},
  "principal-component": {"tex":"Q_k=M-I_k","spoken":"The principal repaid is the full payment less interest charged during that period."},
  "revenue-function": {"tex":"R(q)=pq","spoken":"Revenue is price per item multiplied by the number of items sold."},
  "contribution-margin": {"tex":"c=p-v","spoken":"Contribution per unit is selling price minus variable cost per unit."},
  "break-even-point": {"tex":"q_{\\mathrm{BE}}=\\frac{F}{p-v}","spoken":"When contribution is positive, break-even quantity equals fixed cost divided by contribution per item."},
  "profit-function": {"tex":"\\Pi(q)=(p-v)q-F","spoken":"Profit equals total contribution minus fixed cost."},
  "net-cash-flow": {"tex":"C_k=I_k-O_k","spoken":"Net cash flow is actual cash receipts minus actual cash payments in period k."},
  "cash-balance": {"tex":"B_k=B_{k-1}+I_k-O_k","spoken":"End-period cash equals start-period cash plus inflows minus outflows."},
  "present-value-finance": {"tex":"PV=\\frac{FV}{(1+d)^t}","spoken":"A future value is discounted by one plus rate to power time."},
  "net-present-value": {"tex":"NPV=C_0+\\sum_{t=1}^T\\frac{C_t}{(1+d)^t}","spoken":"Net present value is immediate cash flow plus the discounted values of each future signed cash flow."},
  "financial-threshold": {"tex":"p_*=v+\\frac{F}{q}","spoken":"At specified positive sales, the zero-profit selling price is unit variable cost plus fixed cost per item."},
  "algebraic-identity": {"tex":"(a+b)^2=a^2+2ab+b^2","spoken":"The square of a sum is the square of the first term plus twice their product plus the square of the second."},
  "parity": {"tex":"n=2k\\ \\text{or}\\ n=2k+1,\\ k\\in\\mathbb Z","spoken":"An integer is even when twice an integer, or odd when twice an integer plus one."},
  "integer-divisibility": {"tex":"b\\mid a\\iff a=bk,\\quad k\\in\\mathbb Z","spoken":"b divides a if and only if a equals b times an integer k, for nonzero b."},
  "base-case": {"tex":"P(n_0)","spoken":"The base case verifies the mathematical statement P at the starting index n nought."},
  "induction-hypothesis": {"tex":"P(k)","spoken":"The induction hypothesis temporarily assumes the statement at an arbitrary permitted integer k."},
  "inductive-step": {"tex":"P(k)\\Rightarrow P(k+1)","spoken":"Show that the truth at k implies the truth at the next integer k plus one."},
  "recurrence-relation": {"tex":"a_{n+1}=f(a_n)","spoken":"A first-order recurrence gives the next term by applying f to the current term."},
  "arithmetic-sequence": {"tex":"a_n=a_1+(n-1)d","spoken":"For a first term indexed at one and common difference d, the nth term adds n minus one increments."},
  "common-difference": {"tex":"d=a_{n+1}-a_n","spoken":"The arithmetic common difference is the next term minus the current term."},
  "geometric-sequence": {"tex":"a_n=a_1r^{n-1}","spoken":"For a geometric sequence with first term indexed at one and ratio r, the nth term multiplies by r to the n minus one power."},
  "common-ratio": {"tex":"r=\\frac{a_{n+1}}{a_n}","spoken":"The geometric ratio is the next term divided by the previous nonzero term."},
  "finite-series": {"tex":"S_n=\\sum_{k=1}^n a_k","spoken":"The partial sum of a sequence indexed from one adds terms one through n."},
  "fixed-point": {"tex":"g(L)=L","spoken":"Fixed point L is unchanged when the iteration function g is applied."},
  "fixed-point-equation": {"tex":"L=g(L)","spoken":"A candidate limit L satisfies the fixed-point equation."},
  "contraction-mapping": {"tex":"|g(x)-g(y)|\\le q|x-y|","spoken":"A contraction has distance shrink factor q strictly less than one on the stated region."},
  "absolute-approximation-error": {"tex":"e=|x_{\\mathrm{approx}}-x_{\\mathrm{exact}}|","spoken":"Absolute approximation error is the magnitude of the difference between approximate and exact values."},
  "iteration-residual": {"tex":"r=|f(x)|","spoken":"The equation residual is the magnitude of f at an approximate root."},
  "sign-change-bracket": {"tex":"f(a)f(b)<0","spoken":"A strict sign change means the product of endpoint function values is negative, assuming they are finite."},
  "bisection-method": {"tex":"m=\\frac{a+b}{2}","spoken":"Bisection tests the midpoint between the two current bracket endpoints."},
  "bisection-error-bound": {"tex":"|m-\\alpha|\\le\\frac{b-a}{2}","spoken":"For a bracketed root alpha, midpoint absolute error cannot exceed half the bracket width."},
  "newton-raphson-method": {"tex":"x_{n+1}=x_n-\\frac{f(x_n)}{f'(x_n)}","spoken":"A Newton iterate subtracts f divided by its derivative, when the derivative is nonzero."},
  "rmse": {
    "tex": "\\mathrm{RMSE}=\\sqrt{\\frac{1}{n}\\sum_{i=1}^{n}(y_i-\\hat{y}_i)^2}",
    "spoken": "Root mean squared error is the square root of mean squared prediction error on the evaluation dataset."
  }
});
