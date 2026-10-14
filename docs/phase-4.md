# Phase 4 — Completing the IA: mathematical journey

**Status:** Implemented and automated-test verified, 15 October 2026.
**Live site:** https://chriswalker-afk.github.io/IB-IA-Planning-and-Writing/

## Purpose

Replace the early Completing prototype's illustrative tabs with a **source-linked, revisitable IA Studio** that follows students’ own genuine mathematics. Pathfinder is a *companion to* the actual IA manuscript in Word / Google Docs, not an IA writer. The student supplies every result, interpretation, inference and mathematical justification.

The original workbook's **52 Completing nodes and 223 directed source routes** are preserved in src/completing/catalog.js. Conditional screens and route actions are in src/completing/views.js and src/completing/engine.js.

## The student journey

**Start:** Continue an in-browser Planning record, import a Pathfinder PDF/Word planning snapshot with non-destructive conflict review, or start with blank/editable context. Review aim, course, beneficiary, prediction and outstanding consent/teacher questions. No file or account is compulsory.

**Choose a task:** A mobile-friendly focused dashboard offers Introduction, Sources & Methods, First Exploration, Mathematics, Conclusion, Communication, Teacher Draft and Final Checks. Stages are flexible and revisitable. Student-controlled statuses are Not started / Working / Complete for now / Needs review. Stage visits and filled fields do not constitute teacher sign-off or mathematical completion.

**Evidence and methods:** Distinguish planned and candidate sources from genuine material. Statistics, modelling and theoretical paths ask appropriate questions about the chosen evidence, relevant methods and mathematical limitations. A theoretical route has no fictional sample, survey or data requirement. Outstanding consent flags allow safe writing but no encouragement to proceed with restricted collection.

**First mathematical exploration:** Give the graph, simplified theoretical case or calculation a mathematical purpose **before** it is created. Record and locate the actual output. A still-planned calculation cannot be interpreted as a result. Discuss the observation in relation to the aim, intended beneficiary and earlier tentative prediction. Recall earlier accuracy decisions where appropriate.

**Repeatable mathematics:** The central loop is:

1. Previous **real** result and its local takeaway.
2. Worthwhile unanswered mathematical question.
3. Suitable course-level technique, with **why it follows the previous result**.
4. Student's actual working and outcome, linked to their own IA document.
5. Contextual interpretation, relevant limitation, accuracy and takeaway.
6. Repeat for a genuine mathematical reason, or conclude.

There is no compulsory number of sections or calculations. A no-pattern or negative result is legitimate; a student may end honestly rather than manufacture extra mathematics.

**Contextual advice:** Pearson's r follow-ups require an **actual** PMCC calculation, not a planned technique. Advice about the graph's shape comes from the relevant completed scatter result in that same chain, not an unrelated earlier plot. A small r says little about nonlinear association, and a large r does not establish causation or make regression mandatory. Surprising values prompt honest checking, never changing data to fit a prediction.

**Mathematical learning and technology:** Independently researched, unfamiliar mathematics should be explained at first appropriate use, while routine syllabus techniques need not be taught to the reader. Actual computer/calculator results should be mathematically interpreted.

**Accuracy:** Store per-quantity decisions—symbol, unit, original resolution, reporting policy and reason. Recall them only in relevant later mathematics. Do not impose arbitrary decimal places or confuse recorded resolution with proven measurement accuracy.

**Protect logical coherence:** When an earlier meaningful result or interpretation is revised, later mathematical sections that relied on it are flagged for **link review** without deleting their actual results or student writing. The student can inspect the new earlier finding and explicitly acknowledge the review; the system never automatically rewrites their reasoning. Changing the underlying aim, course, source or accuracy decision can also mark related completed stages as needing review.

**Conclusion:** Synthesize strong actual findings into a supported answer to the aim. Consider the original intended beneficiary, what can honestly be inferred and (only when meaningful) a mathematically motivated extension. Method-specific reflection belongs beside the mathematics, not collected solely at the end.

**Finish and save:** Communication, teacher draft/feedback and final-review stages remain accessible for revisiting. These do not calculate IB grades or replace school feedback rules. Local autosave and JSON full-project backup preserve actual mathematical results, notes and progression; PDF/Word are **Planning-only exports**.

## Traceability

| Source sheet/component | Phase 4 |
|---|---|
| Nodes (52 C nodes) | Source-labelled Completing screens |
| Routes (223 C transitions) | Node-specific routes with exact condition, target and source row |
| Completing the IA | Direct handover, import, blank start and flexible stage dashboard |
| Data Collection Guide | Statistics, modelling and theoretical pathways; specialist guidance partial |
| Completion Prompts | Core student-facing interactions; detailed prompt timing partial |
| Interpretation & Next Steps | Actual result interpretation, aim links and surprises; example library partial |
| Next Mathematical Step | Repeatable result → question → method → reason → actual result loop |
| Bivariate Decisions, Maths & Technology, Writing Moments, Limitation Examples | Relevant principles started; detailed gating deferred to Phase 5 |
| Draft & Final Review | Basic stage pathways, deeper criterion/feedback details deferred to Phase 6 |

Captured workbook text is not equivalent to executed educational logic; remaining inventories are marked partial or not implemented in docs/coverage.csv.

## Acceptance journeys

1. **Curved scatter:** Start a blank plan, record a real scatter result and choose curved. Write what it establishes, then select a next mathematical question and explain why. A nonlinear model might be appropriate; do not require a line of best fit.
2. **Pearson r:** Calculate a PMCC in a real linked mathematical section; check that Pearson-specific advice was absent while it was merely planned. Weak linear correlation does not mean no relationship.
3. **No apparent pattern:** Record the genuine inconclusive result, interpret it and choose *Enough relevant mathematics* to conclude without padding.
4. **Unexpected outlier:** Preserve the unusual observation, investigate a plausible cause or note that the issue remains unresolved; do not alter data to match the prediction.
5. **Theoretical investigation:** Define mathematical objects, assumptions and a small case without a compulsory sample or survey.
6. **Changed earlier result:** Create an actual first representation and a linked later mathematical section. Revise the first result. Confirm the later section is flagged for review but its result and writing are preserved; review and acknowledge the link.
7. **Old projects and portability:** Restore a full JSON backup from Phase 1/2/3 and check aim, original introduction, actual results, planned/completed statuses, teacher flags and link-review notices.
8. **Consent/privacy:** Record pending permission, complete safe writing and save. A student's own self-confirmation must not silently erase an earlier teacher concern.
9. **Mobile:** Navigate the eight-stage grid, revisit maths and open optional source routes on a phone without horizontal scrolling.

## Validation and deferrals

The GitHub Actions workflow runs all project, handover, mathematical engine, view, migration and simulated-browser tests; it builds and deploys the static distribution to GitHub Pages. The Completing workflow is device-local and does not upload student IA data.

**Phase 4 is an end-to-end Completing backbone, not full implementation of all 24 spreadsheet tabs.** Phase 5 will refine the timing and suppression of writing cues, detailed method-conditioned accuracy and limitations, bivariate decisions and independent maths understanding. Phase 6 will refine teacher-draft/final-review checks, accessibility, layout QA and classroom testing. Avoid describing partial editorial inventories as finished.
