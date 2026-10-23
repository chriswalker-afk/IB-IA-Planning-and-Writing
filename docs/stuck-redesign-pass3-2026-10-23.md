# “I am stuck” redesign — Pass 3: mathematical journeys and IA Studio
23 October 2026 · student-facing implementation

## Purpose and role distinction

Pass 3 adds a **specific, opt-in troubleshooting repair** to IA Studio and its mathematical writing workflow. The amber question-mark bubble asks the student to choose what is preventing their next mathematical action. Its answer is a diagnostic, one small mathematical test/check/calculation, a check for success, a stopping point and a fallback. It is not a writing formula, a rubric or a predicted IA mark.

This remains separate from:
- **Criteria bubbles (green):** why a particular assessment criterion is relevant.
- **Writer’s Field Guide (purple):** how to communicate mathematical thinking.
- **I am stuck (amber):** what exact mathematical obstacle to investigate, what to test now and how to know if it is resolved.

No help card inserts IA text, changes a stage status, decides an observed outcome, fabricates figures or samples, completes a calculation, or claims teacher approval.

## Context and interventions

The source of truth is `src/help/studio-help.js`, `src/help/studio-help-popin.js`; CSS is shared with the Planning version in `data/stuck-contextual.css`. The existing `src/completing/adaptive-journey.js` remains the only system for mathematical outcomes and evidence-led next-step suggestions.

Available surfaces:
- **Introduction:** separating the mathematical unknown from unsupported predictions.
- **Introducing first mathematics:** bridging from aim to first output, choosing and checking one method, alternatives, mathematical limitations.
- **Evidence and definitions:** actual source readiness, samples, model assumptions, theoretical cases, precision and notation.
- **Four-part first mathematics:** starting a purposeful figure/calculation, verifying real output and notation, interpreting genuine findings, identifying a mathematical reason to continue or stop.
- **Later repeated four-part stages:** genuine dependency on the previous stage; stale source/outcome or changed method opens a repair, not automatically rewritten mathematics.
- **Result and next-question pages:** an explicit real-result gate, student-chosen outcomes, unknown/unexpected findings, Pearson versus actual scatter shape, meaningful next methods.
- **Seven diagram generators:** graph, statistics, table, image tracer, Voronoi, geometry/measurement, probability tree; tool-specific short checks when its editor is open.
- **Technology and mathematical understanding:** check a calculator result from a small case, method assumptions, newly researched mathematics and course suitability.
- **Conclusion:** distinguish a real, partial mathematical answer from a plan, check meaningful mathematical limitations, consider whether an extra stage is necessary.

### Conditional result gate

The selector reuses `actualMathematics(entry)`: an entry must have **status = completed and a non-blank actual result**. A planned method, prediction, saved title, provisional source or generated figure does **not** satisfy this.

Only a **student-selected** `journeyOutcome` that matches the active confirmed result’s mathematical route and is not flagged for review exposes the corresponding existing `adaptiveNextDirections` advice. The conditional advice quotes the selected mathematical question and diagnostic as a **possibility to check**, never as a result that has already occurred.

When:
- the result has not been performed, an amber bubble offers first-output and calculation checking, not invented interpretations;
- the result exists but no outcome was selected, it helps the student inspect the actual mathematical feature;
- the selected outcome is stale, the student is sent back to verify it rather than shown an old route’s next technique;
- a later stage depends on a changed predecessor, it offers a dependency recheck without silently rewriting a student’s stage;
- the source is a genuine Pearson result with a linked scatter, the student can troubleshoot linear versus curved association; it never assumes monotonicity.

These protections apply to the 2026 A–E and 2029 A–D assessment cohorts alike.

### Route and generator coverage

Exactly 16 authored route repairs accompany the pre-existing investigative route registry: relationships, groups, categorical, variation, fitted models, growth, cycles, trajectories, optimisation, images, triangulation, Voronoi, finance, chance, proof, iteration. They ask for mathematically different concrete tasks: e.g. verify paired observations; compare centre and spread; reconcile a contingency table; check residuals; compare differences and ratios; verify repeats/period; compare derivatives and domain endpoints; calibrate image coordinates; check a Voronoi bisector; reconcile financial periods; check conditional branch totals; test a general conjecture or recurrence.

Seven tool repairs use the `REPRESENTATION_TOOLS` registry, ensuring that the problem offered in the generator pop-in matches the actual editor open in IA Studio.

## Integration and preserving student state

- Page/part bubbles are authored in `src/completing/views.js` and `src/completing/conclusion-workspace.js`. A field-level DOM attachment runs **after** the existing page is rendered, inserting amber help into the established Criteria/Writer’s Field Guide rail. It never rewrites a label, `data-bind`, field ID, user text or saved entry.
- The native `dialog` in `src/help/studio-help-popin.js` supports keyboard focus, Escape, modal background, a close control and an explicit route back to the originating writing part or actual field. The more-problems action opens the existing global drawer and captures the original mathematical stage and selected entry, not the start of IA writing.
- Help is always on demand and **remains present under Reduce advice**. No additional persisted fields are required; the current pop-in choice is ephemeral.
- Additional temporary browser decorations do not affect JSON backups, future assessment framework, historical C95 support notes, generated figures, teacher flags or the real mathematical entry graph.

## Verification

The dedicated `tests/stuck-studio-pass3.test.js` covers:
1. All authored problems and source-backed placements; distinct mathematics for every one of the 16 routes.
2. Actual-result and actual-outcome gating, the uncertain/stale route case and unsupported PMCC title.
3. A later mathematics page returning to **itself**, not dropping the student back at C30.
4. Unaltered student writing, mathematical entries, permission flags and JSON normalization after help inspection.
5. All seven generator cases; 2029 assessment and Reduced advice availability.
6. A student-confirmed outcome changing without automatic interpretation or a fake calculation.

The desktop/mobile `scripts/chapter-onboarding-browser.py` acceptance also tests native modal opening, Escape/focus return, field help sharing the existing Criteria/Writer rail, planned-versus-actual gating, tool-specific help and empty-evidence conclusion decisions. The build, complete Node test suite and other browser workflows must pass before merge.

## Pass 4, deliberately not in Pass 3

Rework the central **I am stuck hub** with search/browse and clearer issue triage. Bring Checking, MLA referencing, feedback and exports into this common system, preserving the original 24 problem IDs, private next-task notes, project backups and return-to-work behaviour.
