# Illustrative IA Pass 3 — Functions and modelling

**Authoring date:** 22 October 2026  
**Branch:** `illustrative-samples-pass3`  
**Source of truth:** the four native sample specifications under `src/core/samples/`; the same fields, figures and tables populate the student journey, reader, exports and project backups.

## Scope and editorial approach

Pass 1 completed standing reach and tray optimisation. Pass 2 completed paper helicopters, revision-format choices and grinder reliability. Pass 3 completes the next four **functions and modelling** routes from the 16-journey editorial catalogue:

| Route | Sample ID | Model and decision | Authored native figures |
| --- | --- | --- | ---: |
| Fitted models | `stopping-distance` | Compare linear baseline to physically motivated constrained quadratic; reserve high-speed predictions; vary reaction time | 4 |
| Growth and decay | `drink-cooling` | Fit excess temperature above an assumed 26 °C; test later points; solve the 50 °C crossing and refit alternative ambient assumptions | 5 |
| Cyclic models | `tide-cycles` | Fit 12-hour sine to three cycles; reserve the fourth; calculate a 3.2 m crossing interval and qualify it with a synthetic all-time bound | 5 |
| Trajectories | `ball-clearance` | Calibrate image coordinates, fit a quadratic, measure centre-to-barrier-top clearance and construct a counterexample to robust clearance | 5 |

The sample picker grows to **nine** completed investigations; seven route briefs remain (geometry/decisions and probability/reasoning). The four completed Pass 3 entries remain first-person student writing, not teacher commentary or a checklist in place of working. Each has an explicitly qualified and different conclusion. All four use **disclosed constructed data**; none claims a physical experiment, original tide station, road-safety study, filmed throw, measured instrument accuracy or independently confirmed teacher feedback.

## Mathematical verification anchors

### Stopping Distance Design Cases v1
- Input speeds: 20–85 km/h in 5 km/h steps; 11 training pairs (20–70), three reserved (75–85).
- Linear least-squares estimate: `s = −10.590909 + 1.03909091 v`; fitting RMSE 1.367449 m; reserved RMSE 6.232415 m.
- Constrained least-squares estimate, intercept zero: `s = 0.50189311 v + 0.00597024 v²`; fitting RMSE 0.343043 m; reserved RMSE 0.390746 m.
- At 60 km/h the constrained curve predicts 51.60646 m. A **hypothetical** 0.25 s reaction-time difference changes reaction distance by 4.16667 m, without pretending to validate a real braking model.

### Cooling Cup Cases v1
- Sixteen two-minute values; 0–20 min fit, 22–30 min reserved.
- Fit `ln(T−26)` with least squares: `T(t) = 26 + 57.99289293 exp(−0.03998156537 t)` (°C; t in min).
- Fitting RMSE 0.142707 °C; reserved RMSE 0.165818 °C.
- 50 °C predicted at 22.066836 min; interpolation between constructed times 22 and 24 min gives 22.190476 min.
- Refitting the *same* fitting values after changing the assumed ambient to 25 °C or 27 °C yields times 22.007026 min and 22.130883 min. These are sensitivity scenarios, not confidence intervals.

### Tide-like Height Cases v1
- Forty-nine hourly height values in a fictional datum, exact recipe `H(t) = 2.5 + cos[π(t−2)/6] + 0.18 cos(π t/12)`, rounded to 0.001 m.
- First 36 cases fit `M(t) = 2.505 + 0.50999267 cos(πt/6) + 0.91607295 sin(πt/6)`; last 13 are a complete reserved fourth cycle.
- Fitting RMSE 0.121985 m; reserved RMSE 0.160115 m.
- A 3.2 m nominal model window around the fourth crest runs from t≈36.413798 to 39.645842 hours.
- The **synthetic source recipe** gives a continuous comparison bound below 0.24 m, yielding the conditional definitely-above interval t≈37.133073–38.926567 hours. The source recipe—not the largest sampled residual—is required to justify that bound. Nothing here is tidal or navigational guidance.

### Calibrated Ball Frame Cases v1
- Seven constructed pixel centres, a common hypothetical 100 px/m scale, and a barrier top at (X=450 px,Y=248 px).
- Least-squares quadratic `P(X)=−0.002 X²+1.199285714 X+120.214286`; pixel residual RMSE 1.921946.
- Nominal centre-to-top gap `P(450)−248 = +6.892857 px` or ~6.9 cm.
- An allowed adverse scenario (barrier X=460, top=250, centres all 3 px lower) gives **−4.314286 px**; positive nominal centre clearance is **not** robust. A common change of px/m scale cannot change the sign, and unknown ball radius prevents a full-ball clearance claim.

## Integrity and acceptance

The data tables retain the complete fictional source values and, where applicable, the frozen train/check split. All derived graphs and short tables use the native Graph Plotter/Table Studio, with IDs recognised by project normalization, appropriate one-letter variable symbols and no more than five displayed table columns. Equations, captions, units and axis domains follow the same model as the narrative.

The testing expansion includes an independent five-test Pass 3 numerical regression file; the existing authoring contract, restoration and full-document tests now run across all nine authored samples. The acceptance runner is sharded into **three parallel groups** in both dedicated and conformance workflows to keep nine samples from serially exceeding CI time budgets.

The reader, real PDF and Word downloads, preserved personal workspace, native editing, and actual ZIP backup restoration must pass before merging. This record does not claim that a screenshot or exported page was visually reviewed unless that review has actually occurred. Teacher sign-off, school deadlines, grading and student completion are never invented.

## Following pass

Author the next four **geometry and decisions** briefs: calibrated leaf area, inaccessible height, Voronoi water stations and loan repayments, while retaining all nine earlier completed examples. Then address the final three probability and mathematical-reasoning briefs.
