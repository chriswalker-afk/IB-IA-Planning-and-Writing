# Examiner feedback Pass 3 — Consequential reflection and coherence

**Date:** 26 October 2026  
**Preceded by:** [Pass 1 coverage audit](examiner-feedback-coverage-pass1-2026-10-26.md) and [Pass 2 sampling and statistical precision](examiner-feedback-pass2-2026-10-26.md).  
**Source synthesis:** examiner-feedback items **EF023, EF052** (title/aim/question consistency), **EF137–151** (mathematical consequences and limits) and **EF273–274** (robustness/sensitivity).

## Implementation

### 1. A meaningful mathematical challenge, *within* the existing validity help

The IA Studio's four-part writing stages already offer **Accuracy, assumptions & validity for this result**, via `renderMathematicalValidityAid`. This pass adds a single small `One mathematical way to test the consequence (optional)` prompt **inside its existing collapsed disclosure**, after the student's saved limitations and linked source/figure context. No extra card, form or mandatory step appears on the page.

`src/completing/consequential-reflection.js` offers optional **method-specific** variations, not invented results, for explicitly identified techniques including correlation, modelling, geometry, optimisation, probability distributions, testing, financial mathematics, numerical integration and theoretical proof. A generic prompt appears only if the student recorded a real limitation for an otherwise unclassified method. Students are asked to:

1. Pick **one** defensible changed condition (or a real counterexample/domain boundary for theoretical work).
2. Recalculate or test a genuinely comparable quantity, preserving the original result, source data and assumptions.
3. Decide whether the mathematical conclusion or practical interpretation actually changes; if no numerical check is feasible, explain the honest scope limit instead.

For suitable methods the aid includes an **Open diagram & table tools** button. It uses the existing `completion-open` action to open the established C31 representation hub, which already handles graph, distribution, geometry and other tool choices. Students should retain a clearly labelled original and alternative; there is **no automatic data manipulation, generator rerun, proof validation, added scenario, or numerical sensitivity calculation**. The linked-graph reminder only appears for a figure actually saved and explicitly associated with that mathematical stage.

**Gates:** a student-confirmed, non-empty `completed` result is necessary. If `reviewNeeded === "yes"`, the established review warning remains but no robustness prompt treats that stage as verified. Mere plans, a prior-stage result, title keywords or hypothetical predictions never unlock an identified mathematical test. For non-classified techniques without a recorded limitation, no generic cue appears.

**Reduced advice:** the existing disclosure remains closed by default and its essential advice still exists if the student opens it. No second writing field is added: students record any meaningful finding in their *existing* `entries[].interpretation` or `entries[].limitations` and the actual IA.

### 2. Check title → aim → answer without another box

The Conclusion C60 workspace now has **one collapsed, read-only comparison** *after* the student has recorded `completion.fields.mainConclusion`. It shows excerpts of the original `planning.fields.provisionalTitle`, the current saved mathematical aim, the existing conclusion answer, and any existing meaning/limitations paragraph. The student considers whether the question, variables, population and valid range are aligned.

This **does not** compare prose algorithmically, grade Criterion A or D, rewrite the introduction, infer that writing is coherent, or alter existing saved fields. It is absent before there is an actual saved answer, and notes that the title in the student's *real IA document* might have been revised separately from the Planning draft.

A previously selected result that has become planned, missing or review-flagged is explicitly marked as unresolved; the comparison never silently substitutes a different result. The established conclusion evidence picker remains the only way to choose supporting mathematics.

## No duplicate systems

- No new completion or entry schema fields; all answers stay in their canonical existing writing boxes.
- No changes to the mathematical engines, generated figure calculations, file formats, citations, backup or export routines.
- No new compulsory reflection/engagement/limitations sections and no fixed numerical threshold for whether a difference is 'significant'.
- No auto-authored student IA prose or automatic criterion scores.
- The comparison uses native `details/summary` markup, simple paragraphs, existing styling and escaped student content; it stays unobtrusive on 320–390 px screens.
- Current A–E feedback is not turned into a claim about revised 2029 assessment criteria.

## Verification

New `tests/examiner-feedback-pass3.test.js` covers stage and review gating, planned vs actual results, explicit technique selection, meaningful method-specific challenges, no unlinked figure evidence, reduced advice, initial and subsequent stages (C30/C40/C50), original data-state immutability, linked tool action, title/aim/answer comparison placement, missing-title fallbacks, stale conclusion-evidence flags, HTML escaping and backup restoration. The existing Playwright conformance journey now additionally tests these new controls on 390 px and 320 px viewports: keyboard-opening the single validity disclosure, following its existing C31 tool action without modifying real mathematical records, access in Reduce advice mode, review-flag gating, and opening the read-only title–aim–conclusion comparison without altering saved writing. Existing project and browser-acceptance workflows must all pass before merging.

## Next: Pass 4

Review **AA HL mathematical suitability and depth**, including nuanced use of SL course content; provide conditional advice about piecewise-function continuity/smoothness where used; finish a cross-course/cohort wording, duplication and usability audit. Do not assert an automatic syllabus match or apply legacy five-criterion marks to a student on the revised 2029 assessment framework.
