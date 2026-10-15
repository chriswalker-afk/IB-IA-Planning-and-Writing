# Mathematical-route expansion — financial modelling, Voronoi and further applications

## Why this pass matters

The original result-led IA coach supports Pearson correlation, regression, outliers, optimisation and proof. This extension reuses **the same interface, confirmed-result safeguards, stage transitions, outcome cards, optional next-question buttons, and Reduce advice preference**. It does not introduce a second wizard.

IB mathematical exploration quality comes from **course-appropriate understanding, development, justified decisions and reflection**. There is no compulsory quota of formulas or techniques. One well-developed mathematical argument can be valuable; many shallow substitutions do not automatically improve it.

The new routes distinguish a successful isolated computation from a purposeful sustained investigation, without calculating an IB mark or predicting a grade.

## Mathematical journeys and immediate decision points

| Student method | Finding selections | Essential advice at actual result | Mathematical follow-up options |
| --- | --- | --- | --- |
| Revenue/cost/profit and break-even | Break-even found / unrealistic / demand unknown / price- or cost-sensitive | Break-even is not demand, capacity or cash viability | Test realistic sales and capacity, price/cost sensitivity or relevant financing |
| Compound interest | Value calculated / rate-period mismatch / rate sensitivity / financing needed | Effective periodic rates, matching horizons, meaning of value | Growth comparison, changing assumptions, loan balance or repayments if borrowing |
| Loan/amortisation | Affordable / unaffordable / longer loan costs more / rate unclear | Repayment model is time-dependent; distinguish instalment and total interest | Balance recurrence, compare terms and forecast cash for every period |
| Cash flow | Positive / shortfall despite profit / demand sensitivity / doubtful assumptions | Profit is not cash; show when receipts and repayments occur | Find negative-balance periods, evaluate scenarios, compare thresholds |
| Voronoi | Nearest-service cells / unequal areas / underserved / new site / metric questionable | Nearest straight-line site is not automatically best service or demand | Define the objective: minimax distance, mean weighted travel, feasible sites, compare access |
| Spearman/rank association | Monotonic / turning / weak rank / uncertain | Rank correlation does not fit an equation; turning is not monotonic | Interpret association, justified nonlinear function or cautious conclusion |
| Nonlinear models | Plausible / patterned residuals / competing fits / bad extrapolation | Explain model choice and parameters; a high R² is not proof | Residual tests, domain/assumptions, appropriate model comparisons |
| Categorical chi-squared | Small expected frequencies / evidence against null / insufficient evidence / sampling concerns | Do not turn p-values into causal claims or proof of a null | Check validity, interpret practical meaning and limits |
| Expected value | Positive / near fair / high variation / dubious probabilities | Expected value is not guaranteed single-play outcome | Compare probability of loss, variability, assumptions or decisions |
| Triangulation | Agreement / angle sensitivity / disagreement / unrealistic geometry | Correct trig substitution cannot rescue unverified measurements | Check propagation of angular/baseline uncertainty, geometry and precision |

### Timing and advice prominence

- **Before** the actual calculation (C32 or C40/C50 when the step is planned), a short purpose-and-depth question appears beside the selected method. No finding is invented in advance.
- **Immediately after** a completed result (C34 for a first calculation, C40/C50 for later work), a visible mathematical check includes a specifically labelled **Mathematical development** safeguard, and students can select an honest interpretation.
- In **C35**, the selected outcome leads to one or two optional next questions that may be copied into the student's editable question field. Pathfinder still offers **Enough to conclude**; it never adds a technique automatically.
- **Reduce advice** suppresses detailed supplementary tips and optional next-step buttons, but keeps the core interpretation, student selection and mathematical-development safeguard.
- A mathematically specific course warning notes that compound interest can be relevant in AI SL, but one substituted formula is insufficient development. Financial topics in AA SL/HL require checking the mathematics is appropriately demanding for the actual course. Students are not directed into higher-level techniques merely for appearances.

### Decisions and correctness

Each branch is triggered **only by the student-selected method and an actually completed mathematical record**. There is no automatic inference from the IA aim, expected prediction, a text match to the result or a guessed numeric threshold. Invalid course or mathematical assumptions are not silently approved.

Selecting a later result cannot overwrite or fabricate earlier numerical work. Changing method clears a stale interpretation. Existing student projects still normalise, including earlier choices; full-project exports preserve recorded route selections. A refined 'periodic' graph choice remains consistent with the broader 'curved' category, avoiding contradictory selection state.

These routes **do not claim** that any particular technique guarantees high marks, that an unfamiliar method is automatically better, that Voronoi cells represent population, or that a significant hypothesis test proves causation. Real data sourcing, permission, teacher scope and course checking are still required.

## Verification

- \`tests/extended-routes.test.js\`: course-level breadth, planned-vs-actual guard, each selected outcome, financial depth and compound interest, Voronoi objective, model/rank distinction, chi-squared interpretation, expected-value risk, measurement uncertainty, lower-advice mode, state/export persistence.
- \`scripts/extended-routes-browser.py\`: desktop and phone end-to-end interaction with selected outcomes, immediate advice, reduced-mode persistence and periodic scatter selection.
- Existing \`npm test\`, \`npm run build\`, report-export tests and entire site browser journey suite remain regression gates.

A classroom review should check the relevance and tone of the prompts with AI SL, AA SL and AA HL students before inferring an improvement in actual IA attainment.
