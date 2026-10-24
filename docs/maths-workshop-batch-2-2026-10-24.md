# Maths Workshop — Batch 2: Relationships and fitting
24 October 2026

## Purpose
Teach students how to **choose, compute, interpret and criticise** common relationships and mathematical models in a Maths IA. This is an optional read-only learning library. It is not an automatic assessment, project-writing tool or syllabus authorisation.

## Coverage
Adds **23 reusable mathematical definitions** (80 across Batches 0–2), plus **five complete mathematical method lessons** (12 total), each with labelled MathJax formulas, a worked example with fictional data, two guided checkpoints, an independent problem, an appropriate technology shortcut, limitations and what a student would need to explain in their actual IA.

| Method | What is newly taught | Existing software guide |
| --- | --- | --- |
| Spearman's rank correlation | Paired ranking, tied average ranks, untied difference shortcut and why to correlate ranked columns when ties occur | Organise paired data |
| Straight-line regression | Centred sums, slope/intercept, ordinary least squares, predictions, residuals and meaningful input domains | Sheets linear regression |
| Nonlinear fitting | Exponential parameter identification, log transformation, quadratic contrast, original-scale errors and the distinction between an exact pattern and regression | Desmos regression |
| Residual diagnostics | Signed residuals, systematic residual plots, SSE/RMSE, why a zero residual sum is not a good-fit guarantee | Model check |
| Fair model comparison | Common evaluation observations, original-scale RMSE, conditional R², model complexity, withheld observations and out-of-sample checking | Model check |

The 16 investigative pathways retain stable IDs. Relevant new study links appear on **relationships**, **fitted models**, **growth/decay**, **periodic patterns**, **trajectories** and **financial modelling**. Technique selectors for Spearman, linear regression and several explicitly chosen nonlinear model families can open matching introductory lessons; a vague title or an unrelated technique never triggers a method automatically.

## Worked arithmetic checks
1. Spearman, no ties: x ranks (1,2,3,4,5), y ranks (1,3,2,5,4), sum of squared rank differences = 4, rho = 0.8. Independent example gives rho = -0.7. With x ranks (1,2.5,2.5,4) and y ranks (1,2,3,4), correlating average ranks gives ~0.9486833; the untied shortcut (0.95) is NOT exact with ties.
2. Linear: four points (1,2), (2,3), (3,5), (4,4) produce x-mean 2.5, y-mean 3.5, Sxx = 5, Sxy = 4, slope = 0.8, intercept = 1.5. Predicted y at x = 3 is 3.9, giving residual +1.1.
3. Nonlinear: exact fictional y = (2,6,18,54) at x = (0,1,2,3) identifies y = 2·3^x. This is **not** passed off as a least-squares result. Actual noisy data require parameter fitting, original-scale residual analysis and restrictions.
4. Residuals: the five observations (4,1,0,1,4) with horizontal fitted line y-hat = 2 give residuals (+2,-1,-2,-1,+2), sum zero, SSE 14 and RMSE sqrt(14/5) ~1.673; the U-shaped residual plot shows missing structure.
5. Comparison: candidates y-hat_A = 1+2x and y-hat_B = 1+2x+0.1x² on the same four observations (x 0–3, y 1,3,5,8) give training SSE 1 vs 0.18; training RMSE 0.5 vs ~0.212 and R² ~0.963 vs ~0.993. A withheld point (4,9) is predicted exactly by A but has error -1.6 under B. One withheld point itself is not conclusive; it demonstrates why training fit does not settle model selection.

## Mathematical and academic-integrity safeguards
- Maintain the original paired observations when sorting or ranking; tied ranks receive average positions.
- **Pearson's r and Spearman's rho are distinct.** Google Sheets CORREL calculates Pearson correlation on its supplied columns; calculate Spearman by first creating **rank columns** and then applying CORREL to those columns.
- Regression direction matters: fitting y from x is not interchangeable with fitting x from y.
- Do not infer cause from association, meaning from an extrapolated intercept, or future accuracy from in-sample R².
- On transformed scales, different least-squares objectives and R² interpretations may apply. Compare original-response errors when the goal is to predict original response values.
- A quadratic suggested by second differences or an exponential suggested by a constant ratio is a candidate to test, not a conclusion about actual collected data.
- Use the same response units, original observations, and defensible evaluation split for error comparisons; include residual plots and mathematical interpretations, not only output from technology.
- Every worked table and check is **fictional**. No practice answer is inserted into a student's actual IA.

## Technology checks
- Google Sheets documents `RANK.AVG(value,data,[is_ascending])` for tied mean ranks and `CORREL(data_y,data_x)` for Pearson correlation; applying CORREL to *paired rank columns* computes Spearman's rho.
- Google Sheets documents `SLOPE(data_y,data_x)` and `INTERCEPT(data_y,data_x)` for straight-line regression.
- Desmos documents exponential model regression syntax `y_1 ~ a b^(x_1)`, its regression log mode, and RMSE.

Official sources (consulted 24 October 2026):
- https://support.google.com/docs/table/25273/
- https://support.google.com/docs/answer/3093990
- https://support.google.com/docs/answer/3094048
- https://support.google.com/docs/answer/3093632
- https://help.desmos.com/hc/en-us/articles/204349605-Log-Mode
- https://help.desmos.com/hc/en-us/articles/202529129-What-is-RMSE

## Verification
- Complete coverage and stable links: `tests/workshop.test.js`
- Independently recomputed numerical examples and temporary, read-only guided interactions: `tests/workshop-batch-2.test.js`
- Complete MathJax formula rendering, glossary notation and safe fallbacks: `tests/workshop-math-notation.test.js`
- Narrow-phone and desktop practice, SVG/formula display, external tutorial return paths and unchanged student data: `scripts/resources-browser.py`
- Existing full repository test, production-build and browser conformance gates continue to apply.

## Next: Batch 3 — Functions and calculus
This batch should extend **mathematical meaning**, not repeat the simple fitting demonstrations in Batch 2. It should cover:
1. **Quadratic models and turning points:** deriving a model, parameter roles, domains, stationary points.
2. **Growth, decay and logarithms:** interpreting multiplicative parameters, doubling/half-life, transformed versus original scales.
3. **Periodic models:** amplitude, midline, phase and period, fitting across more than one cycle.
4. **Differentiation in investigations:** rates, extrema, feasible intervals, sensitivity and interpretation of derivatives.
5. **Integration in investigations:** accumulated change, area/volume under models and valid numerical versus exact methods.

Maintain Show me → Help me → My turn and consistent MathJax notation, using existing Desmos/Sheets/diagram tools when technology is faster. Keep context-sensitive course-scope cautions, especially for advanced model families and calculus techniques.
