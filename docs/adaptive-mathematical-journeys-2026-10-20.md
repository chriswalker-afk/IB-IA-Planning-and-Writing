# Adaptive mathematical journeys: 20 October 2026

## Purpose

Every mathematical stage in **Explore & Explain** should begin from what the previous stage *actually demonstrated*. Selecting mathematics in Planning is not a mathematical finding. A method can be plausible before it is used, but an outcome (good fit, non-quadratic shape, counterexample, poor prediction, etc.) must be confirmed by the student after genuine work.

The original 16 investigative journeys, first-mathematics introductions, mathematical-coach checks, the diagram tools, and the four writing sections remain intact. This pass connects them with one shared, persistent result-to-next-step model.

## Student experience

1. In **Section 2**, show actual calculations/figures and confirm the mathematical work has been performed.
2. In **Section 3**, choose **what the actual result suggests** from route- and method-relevant outcomes. An inconclusive or unexpected result is always allowed. A predicted technique or a rough visual similarity is never taken as mathematical proof.
3. In **Section 4**, receive one relevant next mathematical question plus an optional mathematical assumption/sensitivity check. Each explains why it might matter. A chosen question can be copied to editable writing notes. It does not add a mathematical stage or assert a result.
4. **Add a new mathematical stage** inherits the previous confirmed result, the student's selected outcome, original takeaway, and revision signature. The new page's Section 1 explains the mathematical direction while the student writes their own bridge and justification.
5. Each later Section 1 exposes the **mathematical method of this stage**. When the student actually performs a new method, the next result classifications adapt to that method, rather than repeating the initial pathway. Example: relationship/scatter → possible quadratic or non-quadratic shape → justified exponential or quadratic fitting → residuals, parameters, comparison and domain checks.

The system never requires students to add a technique; **Continue to Conclusion** remains available after the existing readiness reminder.

## Editorial and mathematical coverage

The 16 journeys are sourced from `src/planning/investigative-routes.js`: relationships, groups, categorical, variation, fitted models, growth, cycles, trajectories, optimisation, image modelling, triangulation, Voronoi, finance, probability/simulation, proof and iteration. Every route has multiple meaningful branch outcomes, an inconclusive option, a purpose-specific question and a mathematical validity check. Extra outcomes distinguish a parabolic-looking curve from non-quadratic curvature, residual inadequacy from good fit, measurement instability from real variation, and analogous important decisions.

For stage-specific work, `src/completing/method-identity.js` and `src/completing/extended-routes.js` supply explicit method identity and specialist outcomes (compound-interest assumptions, cash-flow, amortisation, Voronoi access, Spearman's rank association, nonlinear-model residuals, chi-squared test conditions, expected value and triangulation). This stage-level adaptation uses the technique the student chooses in the method selector, not keywords guessed from their results.

The original course choice (AI SL, AA SL or AA HL) informs cautions without asserting a particular result, demanding HL mathematics, guaranteeing marks or teaching methods that the student hasn't justified.

## Source validity, revisions and compatibility

- New optional fields in the canonical mathematical entry: `journeyOutcome`, `journeyDirection`, `journeyRouteId`, `journeySourceOutcome`, `journeySourceSignature`.
- Outcome values have a stable route/method-family prefix. Selecting another route or method does not silently transfer a previous, incompatible result classification.
- A new stage inherits an **immutable snapshot** of the previous outcome and source signature. If the earlier confirmed result, interpretation, method or outcome changes, dependent work is flagged for review. Original mathematics and student-written reasoning are never automatically deleted or replaced.
- Review acknowledgment updates the source provenance only after the previous result remains genuinely confirmed.
- Older saved projects import with empty optional fields and normalise without inventing outcome decisions. The signature uses normalised empty values to avoid false changes after save/load.
- All text remains Pathfinder notes; writing is not automatically inserted into the student's IA. Claims of causation, valid extrapolation, statistical significance, optimality and proof always require the appropriate mathematical justification.

## Verification

- `tests/adaptive-journey.test.js`: all 16 routes, specialised method branches, quadratic vs non-quadratic outcomes, no predictions as findings, honest uncertainty, multi-stage provenance, save/load consistency, course notes and descendant review.
- `tests/completing-views.test.js`: first and subsequent four-part screens, method-specific outcomes and conditional advice.
- `tests/ui-smoke.test.js`: editable next-question controls, stage 2–3 progression, route change and preserved writing.
- `scripts/chapter-onboarding-browser.py`: phone and desktop acceptance for selection, stage creation, switching from graph shape to model residuals, and review warnings.
- Existing project/document export, full unit suite, build and browser checks remain required before merging.
