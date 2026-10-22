# Illustrative samples: Pass 1

22 October 2026

## Purpose and scope

The replacement samples demonstrate a fictional student completing a connected mathematical investigation. Their answers belong to that student's investigation: they explain the student's choices, perform the mathematics, interpret the actual results and develop the next question. Advice about what another student ought to write belongs in the existing help system.

Pass 1 establishes the authoring and presentation model with two complete investigations:

| Sample | Pathway | Mathematical story |
| --- | --- | --- |
| `standing-reach` | Relationships between two variables | Decide whether height alone can set a basketball drill target 25 cm above standing reach within ±5 cm. Keep 18 development cases and six reserved validation cases separate; proceed through inspection, regression, residuals/influence, validation and target-setting accuracy. |
| `tray-optimisation` | Optimising a design | Derive and optimise an open-tray volume, then incorporate a 4 cm height limit, a common ±1 mm setting error and a 1 mm nominal grid. Prove the best guaranteed-volume setting and investigate the tolerance threshold for a 99% capacity target. |

The complete samples are available through the sample picker. The other fourteen investigations are concrete editorial briefs for later authoring. A brief does not set an authored, ready, complete or available flag. Availability is derived from the registered authored specifications in `src/core/sample-library.js`.

The earlier five sample identifiers remain supported for old project backups. They are compatibility records, not additional completed references in the new public picker.

This document describes the implementation and its completion gates. It does not assert a deployment, CI result, school approval, assessed mark or completed external layout review.

## Files and responsibilities

| File | Responsibility |
| --- | --- |
| `src/core/samples/briefs.js` | One concrete investigation brief per current pathway. |
| `src/core/samples/field-contract.js` | Applicability, authorship and narrative role for current fields, saved records and compatibility/external exclusions. |
| `src/core/samples/standing-reach.js` | Authored first-person prose, data, mathematical stages, native figures and review evidence for the empirical pilot. |
| `src/core/samples/tray-optimisation.js` | Authored first-person prose, exact assumptions, mathematical stages, native figures and review evidence for the design pilot. |
| `src/core/sample-library.js` | Assemble authored specifications into the existing project-state model without inventing supplementary paragraphs. Derive public availability from actual specifications. |
| `src/core/sample-document-model.js` | Assemble the continuous IA reading model in narrative order, using the same saved answers as the sample fields. |
| `src/core/sample-ia-document.js` | Sample export entry point, including compatibility with older samples. |
| `src/completing/entry-record.js` and figure-linking/report modules | Preserve plural `figureRefs` so one stage may own more than one graph, table or other figure. |
| `src/ui/planning-views.js`, `src/planning/engine.js` and `src/planning/route-table.js` | Allow a modelling investigation to define mathematical assumptions without pretending to collect primary or secondary data, then join the ordinary planning route. |
| `src/completing/first-maths-bridge.js` | Carry that assumptions source into first-mathematics guidance while retaining the chosen modelling pathway. |
| `docs/illustrative-sample-field-contract.md` | Human-readable field inventory and coverage rules. |
| `tests/sample-field-contract.test.js` | Pathway coverage, schema alignment, canonical field mapping and explicit-branch coverage inspection. |
| `tests/model-assumptions-route.test.js` | Verify the real no-dataset modelling transition, UI applicability, saved context, existing source routes and review after changed assumptions. |

## Authorship standard

Every student-writing answer must do the mathematical work its prompt asks for. A first-person opening such as “I chose...” is insufficient if the remainder merely repeats advice. The answer needs the actual choice, the mathematical reason and, where appropriate, the calculation or evidence supporting it.

The samples use a natural first-person perspective. Equations, definitions, captions and neutral statements do not need an artificial “I” at the start of every sentence. Planning can be prospective. The completed narrative reports the investigation as performed, with expectations identified as expectations and extensions identified as future work.

Each sample has one stable question, a coherent source/assumption record and a consistent vocabulary of variables and units. Every stage answers a specific question; the previous finding must explain why the next stage is useful. The number of stages follows the investigation. There is no universal quota of calculations, diagrams or extensions.

The final answer must be supported by the actual results. A failed accuracy target, unsuitable model or disproved conjecture is a useful outcome. The author must not manufacture a successful result or add techniques simply to make a sample seem harder.

## Evidence and mathematics

Constructed teaching data and exact design assumptions are labelled explicitly at the sample level. A fictional narrative must not masquerade as a real student submission, a verified experiment or a published empirical dataset. External citations are supplied only for real consulted sources. Teacher comments, consent, school dates, marks and authentication are never invented.

The tray sample uses `kind: modelling` with `dataSource: theoretical`: its starting material consists of defined dimensions, constraints and assumptions. The same source option is available to ordinary modelling projects at N03. It uses the existing `theoreticalAim` and `theoreticalCase` fields with model-specific questions, then joins prediction and practical checks without entering a primary/secondary collection branch. Its optimisation pathway remains selected. The source choice does not assert empirical validation or teacher approval.

The mathematical record must contain reproducible data or defined exact objects, meaningful calculations and the reasoning needed to interpret them. Raw working datasets remain available in the project. The IA reading view uses selected tables and diagrams that advance the argument; it does not obtain apparent substance by printing a large dataset or a long repayment/iteration schedule.

For every empirical example, verify the numerical results independently of the displayed rounded text. Retain paired identities, prespecified development/validation splits, justified exclusions and any repeated-measure structure. For a theoretical example, check the quantified domain and the logical completeness of the argument. For a model, check feasible domains, parameter meanings, assumptions and the scope of any extrapolation.

Mixed prose and mathematical notation use the existing supported equation format. Meaningful variables are defined before use; exact equality and approximation are distinguished; units are consistent. Familiar course mathematics is used clearly without long textbook tutorials. Unfamiliar mathematics is explained at its first necessary use, with an authentic source where one was consulted.

## How the fields become a complete IA

The continuous browser reader, PDF and Word document share an ordered document model. They use the same authored saved answers as the field views. The document model selects their narrative order; it does not concatenate every planning, review or compatibility field.

The intended reading order is:

1. Introduction: a concise personal purpose and mathematical aim.
2. Starting material and mathematical approach: essential source/definitions, the first-step bridge at its chosen location, method justification and relevant initial evaluation.
3. Each mathematical stage: transition/purpose, actual mathematics and figures, interpretation, consequential limitations, then the justified next question or stopping point.
4. Conclusion: answer, meaning and limits, then a worthwhile possible extension if one remains.
5. Real sources or constructed-material provenance where needed.

Section numbers depend on the actual stage count. A bridge already used in the introduction is not printed again before the first stage. A transition should not repeat a whole previous paragraph. Concise local takeaways may power navigation and guidance without being pasted as a second interpretation in the IA.

Native saved figures remain editable in the existing generators. A figure belongs to its mathematical stage, has an appropriate title/caption and appears at the point where the prose needs it. Plural `figureRefs` preserve multiple figures made with the same tool. The ordered reading/export blocks place output before its interpretation rather than appending all diagrams after the text.

The ordinary full-project export remains a working record, including Planning and Checking where applicable. The complete sample IA export has a separate purpose: reading the mathematical investigation itself. The project backup preserves the full editable state.

## Current field contract

The contract distinguishes five categories:

| Category | Treatment |
| --- | --- |
| `authored` | A substantive answer belongs in the relevant current sample-writing field. |
| `conditional` | Populate only when that source, method, uncertainty, review or support branch applies. |
| `metadata` | A selector, ID, link, mirrored value or editor state must agree with the authored investigation; it is not extra IA prose. |
| `legacy` | Preserve earlier saved work on import; do not manufacture duplicate historical notes for new examples. |
| `external` | Do not fabricate teacher/peer feedback, permissions, school-confirmed requirements or marks. A genuine open student question may be recorded. |

`includeInIA` indicates material that can belong in the ordered narrative. It is not a requirement to print every populated field. Source and accuracy records reuse the meaning of their current editor fields; there must not be a contradictory second account when a stage selects a saved source.

Theoretical work does not need an empirical population or sampling frame. Primary and secondary branches are disjoint unless a sample genuinely uses both. Model checking, unfamiliar-mathematics explanations, surprise checks and future extensions are relevant only where the investigation supports them. The three current conclusion fields are `mainConclusion`, `conclusionBenefit` and `conclusionExtension`; older conclusion notes are not filled as additional endings.

## Completion gates for every further sample

Before a brief becomes available in the public picker:

1. **Resolve the brief.** Fix the question, intended course scope, evidence/assumptions, variable definitions and plausible result-dependent stages.
2. **Complete the mathematics.** Create the working dataset or exact objects, calculate and check results, and settle the actual conclusion before writing persuasive prose around it.
3. **Author all applicable answers.** Use the field contract to map the complete narrative and specific planning/review decisions. Explicitly identify unused branches, metadata and compatibility-only fields.
4. **Build the native figures.** Save editable generator state and verify the figure values against the calculation source. Link each figure to the correct stage, including multiple same-tool figures where needed.
5. **Read the investigation continuously.** Remove the surrounding prompts and assess whether the selected prose, mathematics and figures make one clear argument. Check all transitions and the return to the original aim.
6. **Check the actual rendered outputs.** Inspect the browser reader and exported PDF/Word at normal reading size for equation rendering, legibility, placement, repeated text, page breaks and clipping.
7. **Check project behaviour.** Load the sample, visit its current Planning/Writing/Checking fields, reopen and edit figures, return to the same stage and verify the full backup/import path. Sample exploration must remain isolated from the student's own project.
8. **Register the authored specification.** Availability comes from the completed specification and its verification, not a brief flag or a minimum word count.

Automated coverage checks establish route coverage, valid field keys, links and numeric consistency where appropriate. They cannot certify student voice, coherence, mathematical depth or the relevance of a diagram. Those require an editorial and mathematical read. A browser visit or a populated field is not evidence that the fictional student performed a check.

## Proposed remaining authoring sequence

### Pass 1 verification record

The two pilots' mathematics was checked independently from the supplied data or geometric assumptions. The checks cover the fixed development/validation split, regression and all omission refits, every validation and rounded-target result, the tray's full feasible domain, every nominal setting under its common error, and the distinct continuous/grid tolerance bounds.

The full local automated suite passed (85 test files). Browser acceptance passed for both samples at desktop (1440 px) and phone (390 px) widths, including the continuous reader, rendered equations, six native figures per sample, generator return, edits across reload, sample switching, PDF/Word downloads and full editable project backups. The original personal project remained unchanged throughout.

Both sample PDFs contain 15 pages without a page-count target. PDF pages and rendered Word documents were inspected for mathematical notation, figure placement, table legibility and clipping. Word figures use a wider layout so compact result tables remain readable. The sample self-review records reflect these completed checks; teacher feedback and school/submission checks remain unclaimed. GitHub workflow and deployment results belong to the associated pull request and Actions records.

### Further authoring

Use the empirical and design pilots to settle the shared presentation and authoring contract. Then author small, reviewable groups of complete investigations rather than producing sixteen disconnected fields at once:

- Data comparisons: helicopter groups, revision formats and grinder reliability.
- Functions and modelling: stopping distance, cooling, tides and ball clearance.
- Geometry and decisions: leaf area, inaccessible height, water stations and repayments.
- Probability and reasoning: stop-on-gold, consecutive sums and square-root iteration.

Each completed group must pass the same gates. It may require adapting the brief in response to its actual mathematics; the pathway identity and original educational purpose should remain clear.

## Sixteen investigation briefs

The following catalogue mirrors `SAMPLE_BRIEFS`. These are authoring briefs; only the two registered complete investigations are available in Pass 1.

### 1. Can height set a fair basketball drill target?

**ID / pathway:** `standing-reach` / `relationships`

**Aim:** How accurately can I use height alone to set a basketball drill target 25 cm above a participant's standing reach, with a tolerance of ±5 cm?

**Course scope:** AI SL or AA SL: paired data, Pearson correlation where justified, least-squares regression, residuals, interpolation and a contextual prediction check. Statistical generalisation is limited by the constructed sample.

**Evidence plan:** Use 24 explicitly constructed pairs of height and standing reach in centimetres. Fix 18 development cases and six validation cases before fitting. Keep the validation values separate from model selection and preserve all cases.

**Mathematical development:**

1. Plot the paired heights and standing reaches to decide whether a linear description is plausible.
2. Calculate correlation and a regression model; interpret the gradient and intercept within the observed height range.
3. Inspect residuals and investigate the most influential case without automatically deleting it.
4. Predict standing reach for the six reserved cases and compare prediction errors with the ±5 cm requirement.
5. Translate reach predictions into drill targets by adding 25 cm, then decide whether height alone meets the stated accuracy criterion.

**Planned representations:**

- Scatter plot with meaningful height/reach labels
- Fitted line and residual plot
- Compact development-versus-validation error summary
- Target error display with ±5 cm reference limits

**Checks that determine completion:**

- Every pair stays paired and appears in only one fixed partition.
- Fit and validation values reproduce from the saved dataset.
- Adding 25 cm does not change the prediction error.
- A strong correlation is not itself evidence that the ±5 cm tolerance is met.
- The conclusion states the observed-domain and constructed-data limits.


### 2. Which paper helicopter design stays airborne longer?

**ID / pathway:** `helicopter-groups` / `groups`

**Aim:** How do the flight-time distributions of two paper helicopter designs differ under the same drop conditions, and is the difference useful compared with their variability?

**Course scope:** AI SL core: comparative distributions, centre, spread and a justified two-sample comparison only if its conditions and course scope are satisfied. AA SL alternative: descriptive comparison and uncertainty without assuming an inferential test is in the course.

**Evidence plan:** Construct a labelled teaching dataset for independent paper helicopters of two designs under a fixed drop height and procedure. Distinguish separate helicopters from repeated drops of the same helicopter; define the independent unit before any test.

**Mathematical development:**

1. Compare flight-time distributions on a common scale and inspect skew, overlap and unusual values.
2. Calculate and interpret differences in centre alongside IQR or standard deviation.
3. Check independent units and sampling conditions before any inferential extension; investigate whether observed design differences are robust to the spread.
4. Make a bounded design recommendation using the magnitude and consistency of the observed difference.

**Planned representations:**

- Comparable box plots with shared units and scale
- Small summary table of counts, centres and spreads
- Effect-size or difference display appropriate to the chosen analysis

**Checks that determine completion:**

- Repeated drops are not silently counted as independent helicopters.
- Both groups use comparable measurement conditions.
- Any test, null hypothesis and assumptions are stated correctly.
- Statistical significance is distinguished from practical usefulness.
- Authentic unusual values are retained or explicitly investigated.


### 3. Do revision-format preferences differ between year groups?

**ID / pathway:** `revision-formats` / `categorical`

**Aim:** Is year group associated with preferred mathematics revision format in a defined school sample, and which category differences account for the pattern?

**Course scope:** AI SL: conditional proportions, contingency tables and chi-squared independence subject to appropriate expected counts and independent responses. Do not advertise this test as an automatic AA SL route.

**Evidence plan:** Construct anonymous counts for a defined sample choosing one mutually exclusive preferred format. Retain group totals and a documented category definition; include no identifiable responses or invented permissions.

**Mathematical development:**

1. Build the two-way frequency table and compare within-year proportions using the correct denominators.
2. Calculate expected frequencies under independence and check whether the table supports the proposed test.
3. Carry out and interpret a chi-squared independence calculation, including degrees of freedom and the prespecified decision rule.
4. Inspect the contributions and proportional differences to explain the association and its sampling limits.

**Planned representations:**

- Concise contingency table including totals
- 100% stacked bar chart of within-year preferences
- Expected-count or contribution summary

**Checks that determine completion:**

- Every observation belongs to one year and one preference category.
- Row, column and grand totals agree.
- The denominator of each proportion is explicit.
- Expected frequencies and degrees of freedom are reproducible.
- No categories are combined merely to obtain a desired result; association is not causation.


### 4. How reliable is a timed coffee-grinder dose?

**ID / pathway:** `grinder-reliability` / `variation`

**Aim:** How consistently does a fixed grinding time deliver an 18 g dose, and what can I justify about the chance of falling within an agreed tolerance?

**Course scope:** AI SL or AA SL: distribution summaries, standard deviation and a normal model only if shape and process assumptions make it reasonable. Observed proportions remain a valid alternative.

**Evidence plan:** Construct repeated dose masses in grams in their original trial order, recording a fixed timer setting and stated balance resolution. Preserve the order so drift can be distinguished from independent variation.

**Mathematical development:**

1. Plot the ordered readings and their distribution to identify drift, skew or unusual doses.
2. Summarise centre and spread, separating bias from repeatability.
3. Compare the observed in-tolerance proportion with a justified distribution model, or explain why the model is unsuitable.
4. Investigate whether a revised target or setting changes the tolerance conclusion without hiding process variability.

**Planned representations:**

- Dose against trial order
- Histogram or box plot with tolerance bounds
- Compact observed-versus-modelled tolerance summary

**Checks that determine completion:**

- Balance resolution is not equated with true measurement accuracy.
- A tight spread does not establish an unbiased 18 g target.
- A normal model is checked rather than assumed.
- Trial dependence or drift restricts a probability claim.
- Any changed setting is explicitly a modelled scenario unless new data are supplied.


### 5. When does a linear stopping-distance model stop being useful?

**ID / pathway:** `stopping-distance` / `fitted-models`

**Aim:** Over a stated speed range, how well do linear and structurally motivated quadratic models describe stopping distance, and how do their prediction errors affect a distance estimate?

**Course scope:** AI SL or AA SL: functions, regression, residuals and domain restrictions; explain any additional fitting method at first use.

**Evidence plan:** Use explicitly constructed speed–distance observations or a verified original published dataset selected during authoring. Keep units consistent and distinguish reaction distance from braking distance when defining the model.

**Mathematical development:**

1. Define speed and stopping-distance quantities and fit a simple baseline within the observed range.
2. Inspect the baseline residuals to identify the mathematical feature it misses.
3. Derive or motivate a quadratic term and compare fit, residual structure and parameter interpretation.
4. Check selected predictions and sensitivity to a model assumption; state where extrapolation is unsupported.

**Planned representations:**

- Observed data with baseline model
- Comparable model residuals
- Linear/quadratic overlay and a compact prediction comparison

**Checks that determine completion:**

- Speed units are converted before physical interpretation.
- Total stopping distance is not confused with braking distance.
- A better fit statistic alone does not prove a model.
- Models are compared on the same evidence and domain.
- The fictional investigation is not road-safety guidance.


### 6. How long until my drink reaches a chosen temperature?

**ID / pathway:** `drink-cooling` / `growth`

**Aim:** How well can an exponential model of excess temperature estimate when a drink reaches a chosen temperature in a specified room?

**Course scope:** AI SL or AA SL: exponential decay, logarithms and parameter interpretation. A differential-equation derivation is optional and requires an explicit course check.

**Evidence plan:** Construct a temperature time series and a separately stated ambient temperature with meaningful thermometer resolution. Model the difference from room temperature, not a decay towards 0 °C.

**Mathematical development:**

1. Plot temperature and inspect successive changes in excess temperature above the ambient level.
2. Fit and interpret an exponential excess-temperature model over a defensible interval.
3. Check residuals and calculate the modelled time to the chosen temperature.
4. Vary the ambient temperature or plausible parameter uncertainty to evaluate how stable that time estimate is.

**Planned representations:**

- Temperature and ambient-level time plot
- Excess-temperature model with residuals
- Compact threshold-time sensitivity table

**Checks that determine completion:**

- All logarithm arguments are positive.
- The ambient offset is retained throughout the calculation.
- Time and temperature units remain consistent.
- The threshold is within a defensible prediction range.
- The conclusion distinguishes model uncertainty from thermometer resolution.


### 7. How useful is a single sinusoid for a tidal-height record?

**ID / pathway:** `tide-cycles` / `cycles`

**Aim:** How accurately can a single sinusoidal model describe several consecutive tidal cycles and estimate a specified height-crossing window?

**Course scope:** AI SL or AA SL: sinusoidal functions, parameter interpretation, solving equations and residual analysis. Any richer tidal model is an optional extension, not a required technique.

**Evidence plan:** Construct a clearly labelled multicycle tidal-height record with a fixed time origin and height datum, or verify an original public source during authoring. Reserve a complete later cycle for a stated prediction check.

**Mathematical development:**

1. Inspect several cycles to estimate period, midline, amplitude and phase.
2. Build a single-sinusoid model and explain each parameter in the chosen units.
3. Evaluate residuals and the reserved cycle to identify unequal heights or shifting timing.
4. Solve for a specified height crossing and qualify the resulting time window using the observed model error.

**Planned representations:**

- Several tidal cycles with explicit time origin
- Sinusoidal overlay and residual display
- Height-threshold intersections on a selected interval

**Checks that determine completion:**

- The time datum and angular units are stated.
- Period is estimated from more than an incomplete cycle.
- The correct crossing branch and interval are selected.
- Fit cycles and validation cycles stay distinct.
- The sample is not a navigation or safety prediction.


### 8. Does a modelled ball path clear a barrier?

**ID / pathway:** `ball-clearance` / `trajectories`

**Aim:** What clearance does a calibrated quadratic model predict above a specified barrier, and is that conclusion stable under reasonable coordinate uncertainty?

**Course scope:** AI SL or AA SL: quadratic functions, coordinate geometry, turning points and sensitivity. Time-based velocity is excluded unless actual time information is available.

**Evidence plan:** Use a constructed calibrated frame or explicit coordinate set for a ball path and a defined barrier. Record scale, origin and the assumption that the motion is viewed in a common vertical plane.

**Mathematical development:**

1. Calibrate coordinates and inspect the observed path before choosing a quadratic.
2. Fit the curve and calculate meaningful trajectory features within the recorded domain.
3. Evaluate the height at the barrier and calculate the predicted clearance.
4. Perturb the scale or selected coordinates within a stated uncertainty and test whether the clearance decision changes.

**Planned representations:**

- Calibrated trajectory with barrier dimensions
- Observed coordinates and quadratic overlay
- Clearance and sensitivity comparison

**Checks that determine completion:**

- Pixels are converted to physical units with a documented scale.
- Perspective assumptions are explicit.
- The barrier lies in the modelled domain.
- No speed or acceleration is inferred from an untimed still image.
- The sign and size of clearance are interpreted against uncertainty.


### 9. Choosing the corner cut for an open tray

**ID / pathway:** `tray-optimisation` / `optimisation`

**Aim:** Which nominal corner cut gives the greatest guaranteed tray volume from a 30 cm by 20 cm card while meeting a 4.0 cm height limit, a common ±1 mm setting error and a 1 mm marking grid?

**Course scope:** AA SL or AI SL: a constrained volume function, differentiation, feasible candidates and a sensitivity comparison. The optimum belongs to the stated idealised construction.

**Evidence plan:** Use a defined 30 cm × 20 cm rectangular card, equal corner cuts, a 4.0 cm height limit and an explicit zero-thickness fold model. Treat common ±1 mm setting error and a 1 mm nominal marking grid as separate stated assumptions; no physical measurement is claimed.

**Mathematical development:**

1. Draw and label the net, derive the volume function and establish the feasible cut domain.
2. Differentiate, solve for candidates, and compare the feasible stationary point with the boundaries.
3. Compare the ideal cut of approximately 3.9237 cm with 4.0 cm, then use the height limit and error interval to examine feasible nominal cuts.
4. Prove that a 3.9 cm nominal cut maximises the smallest volume over every permitted common error.
5. Vary the error bound and distinguish the continuous and 1 mm-grid thresholds for retaining at least 99% of ideal capacity.

**Planned representations:**

- Labelled rectangular net and folded-tray dimensions
- Volume function on its feasible domain
- Compact practical-cut/tolerance comparison

**Checks that determine completion:**

- The volume is x(30−2x)(20−2x) with 0<x<10 cm.
- The non-feasible stationary point is rejected.
- The global maximum claim is justified with domain and boundary reasoning.
- Exact and rounded values use appropriate notation.
- Tolerance analysis states what varies and does not pretend a physical tray was measured.


### 10. Estimating a leaf area from a calibrated outline

**ID / pathway:** `leaf-area` / `images`

**Aim:** How closely do a piecewise curve model and a geometric approximation agree on the area of one calibrated leaf outline, and how sensitive is that area to calibration and boundary choices?

**Course scope:** AA SL or AI SL: coordinate models and area by integration or suitable numerical approximation. Explain any numerical method that is outside the chosen course.

**Evidence plan:** Provide a locally saved constructed or permitted reference image with a visible scale in the same plane as the leaf. Preserve the calibration, selected boundary points and segment domains.

**Mathematical development:**

1. Calibrate the image, define the origin and select informative upper/lower boundary coordinates.
2. Fit suitable piecewise boundaries and inspect where the model departs from the outline.
3. Calculate the enclosed area and compare it with an independent geometric or numerical approximation.
4. Vary calibration or defensible boundary choices to quantify their effect on the reported area.

**Planned representations:**

- Calibrated outline with chosen points
- Piecewise boundary curves with shaded area
- Compact independent-area and sensitivity comparison

**Checks that determine completion:**

- Image dimensions are not treated as physical units without calibration.
- Upper-minus-lower boundaries and integration domains are correct.
- Area units are squared.
- A scale-factor error changes area quadratically.
- Smoother curves are not automatically more accurate; the original reference stays available.


### 11. Estimating a height I cannot measure directly

**ID / pathway:** `inaccessible-height` / `triangulation`

**Aim:** How well can two accessible angle-of-elevation positions determine an inaccessible height, and which measurements most affect the estimate?

**Course scope:** AI SL or AA SL: trigonometry, equations, geometric assumptions and sensitivity. Any calculus-based error propagation is optional.

**Evidence plan:** Construct a reproducible baseline, two angles, instrument height and associated resolutions. Define level-ground and common-vertical-plane assumptions with one consistent diagram.

**Mathematical development:**

1. Draw the two-position geometry and derive equations for the unknown horizontal distance and height.
2. Solve using the stated baseline and angles, including the instrument-height correction.
3. Check the result with an independent position or a mathematically equivalent calculation.
4. Vary the measured angles and baseline within stated bounds to decide a defensible reporting precision.

**Planned representations:**

- Labelled baseline and two elevation triangles
- Trigonometric calculation diagram
- Height sensitivity to angle and baseline changes

**Checks that determine completion:**

- The nearer and farther angles match the geometry.
- Instrument height is added once.
- Angle units and trigonometric functions are consistent.
- Bounded sensitivity is not incorrectly described as a statistical confidence interval.
- Reported digits reflect measurement sensitivity.


### 12. Where would an extra water station improve access?

**ID / pathway:** `water-stations` / `voronoi`

**Aim:** How would adding one water station change nearest-station distances across a simplified site, and which candidate location best improves the chosen access measure?

**Course scope:** AI SL: coordinate geometry, perpendicular bisectors and Voronoi regions. AA SL use requires an explicit scope check rather than an automatic syllabus claim.

**Evidence plan:** Use a constructed bounded site map with explicit coordinates and a small set of candidate sites and demand/check points. Define whether the objective concerns maximum, average or weighted distance before comparing candidates.

**Mathematical development:**

1. Plot existing stations and construct nearest-station regions using Euclidean distance.
2. Calculate baseline distances at the defined check points and identify the inadequately served area.
3. Add each feasible candidate and compare the same access measure on the same check points.
4. Test a path restriction or plausible demand weighting to examine whether the recommended location changes.

**Planned representations:**

- Bounded site map with labelled stations and Voronoi boundaries
- Before/after nearest-distance comparison
- Compact candidate and sensitivity summary

**Checks that determine completion:**

- Voronoi cells are clipped to the stated site boundary.
- The objective is fixed before choosing the best candidate.
- Check points do not silently change between scenarios.
- Straight-line distance is distinguished from walking distance.
- Capacity and real-world permissions are not inferred from geometry.


### 13. Which repayment plan costs less under stated terms?

**ID / pathway:** `repayment-plans` / `finance`

**Aim:** For a fixed borrowed amount, how do two defined repayment plans compare in total cost and repayment time, and which assumptions could reverse the preference?

**Course scope:** AI SL or AA SL: compound changes, recurrence relations, geometric sums or financial technology with explained inputs. Use constructed offers, not claims about current lenders.

**Evidence plan:** Define two fictional offers with principal, compounding period, payment timing, rate, fees and treatment of the final payment. State a consistent currency and time basis.

**Mathematical development:**

1. Derive the balance recurrence and verify the first few payments against the stated timing.
2. Calculate repayment time, final payment and total paid for both plans.
3. Compare total costs and explain the tradeoff between payment size and duration.
4. Vary a rate or fee over a stated range and locate where the preferred option changes.

**Planned representations:**

- Balance-versus-time comparison
- Concise total-cost and final-payment table
- Rate or fee sensitivity graph

**Checks that determine completion:**

- Annual and per-period rates are not confused.
- Payments occur at the stated beginning or end of each period.
- The last payment is capped correctly instead of overpaying a negative balance.
- Fees and rounding conventions are included consistently.
- The conclusion is a fictional model comparison, not financial advice.


### 14. Is a stop-on-gold drawing game fair?

**ID / pathway:** `stop-on-gold` / `chance`

**Aim:** What is the expected net outcome of a game that stops on a gold draw or after a fixed maximum number of draws, and how do replacement rules affect a fair entry price?

**Course scope:** AI SL or AA SL: conditional probability, unequal-depth trees, a discrete distribution and expected value; simulation provides a check rather than a substitute for exact reasoning.

**Evidence plan:** Specify a fictional bag composition, maximum draw count, replacement rule, stopping rule, rewards and entry fee. Use a saved probability-tree model and reproducible simulated trials.

**Mathematical development:**

1. Construct an unequal-depth probability tree that stops each path when the rules require it.
2. Calculate the terminal outcome distribution and expected payout, then subtract the entry fee.
3. Check the exact expectation with a reproducible simulation summary and explain sampling variation.
4. Change the replacement rule or bag composition and determine how the fair fee changes.

**Planned representations:**

- Labelled stopping-condition probability tree
- Terminal-outcome probability and payout table
- Simulation estimate against trial count

**Checks that determine completion:**

- Branches after a stopping event do not exist.
- Conditional probabilities update correctly without replacement.
- Terminal probabilities sum to one.
- Net gain and payout are not confused.
- Simulation seed/trial count and uncertainty are recorded; simulated frequency is not exact probability.


### 15. Which positive integers are consecutive sums?

**ID / pathway:** `consecutive-sums` / `proof`

**Aim:** Which positive integers can be written as a sum of at least two consecutive positive integers, and how can I justify a complete characterisation?

**Course scope:** AA SL-oriented algebraic reasoning, arithmetic series, parity and proof; course suitability depends on the depth of the chosen argument, not on the count of examples.

**Evidence plan:** Generate a small exact search table from positive starting terms and at least two terms, retaining failures as well as successes. Use the table to form a conjecture, then replace finite checking with a general argument.

**Mathematical development:**

1. Explore selected integers to identify a pattern and look deliberately for counterexamples.
2. Express a run of k consecutive positive integers starting at a as k(2a+k−1)/2 and analyse parity and divisibility.
3. Prove why powers of two cannot have the required representation and construct a representation for every other positive integer.
4. Check the positive-start restriction and interpret the characterisation using examples at its boundary.

**Planned representations:**

- Short exact cases-and-counterexamples table
- Arithmetic-run or factor-pair diagram if it clarifies the proof
- Compact worked representations tied to the general argument

**Checks that determine completion:**

- At least two terms and a positive starting integer are enforced.
- Finite examples are not presented as a proof.
- Both necessity and sufficiency are established.
- An odd-factor construction is checked when its naive starting value would be non-positive.
- The integer 1 and powers of two are handled explicitly.


### 16. Why does a square-root iteration converge?

**ID / pathway:** `square-root-iteration` / `iteration`

**Aim:** How does the iteration x_(n+1)=(x_n+A/x_n)/2 approximate √A from positive starting values, and what explains its convergence and observed speed?

**Course scope:** AA SL-oriented sequences, algebraic inequalities and limits; a local error argument or Newton interpretation may require additional explained mathematics and a course check.

**Evidence plan:** Use an explicit positive A and several positive starting values, computing unrounded iterates for validation. Store a short selected table and the recurrence rather than hundreds of spreadsheet rows.

**Mathematical development:**

1. Generate selected iterates from contrasting positive starts and describe the observed behaviour without claiming numerical proof.
2. Solve the fixed-point equation and establish positivity, bounds and monotonic behaviour after the first step.
3. Use the bound and monotonicity argument to justify convergence to the positive square root.
4. Derive an error relationship and compare it with computed errors to explain speed and the limits of rounded output.

**Planned representations:**

- Short selected-iterate and error table
- Iteration function with y=x and optional cobweb steps
- Error comparison on a readable scale

**Checks that determine completion:**

- A>0 and x_0>0 are stated.
- Convergence is proved rather than inferred from repeated displayed digits.
- A fixed point alone is not treated as proof of attraction.
- Rounding is postponed in validation computations.
- Any claimed convergence rate follows from a derived error relationship.
