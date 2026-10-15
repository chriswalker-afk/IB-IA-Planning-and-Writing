# IA Pathfinder — spreadsheet migration and implementation coverage

**Source snapshot:** 14 October 2026. All 24 original Google Sheet tabs are retained as read-only source JSON. **The original spreadsheet has not been modified.** Capturing source content is not the same as implementing its educational instructions.

## Source records by implementation status

| Runtime status | Count | Meaning |
|---|---:|---|
| Phase 2 implemented | **166** | Planning nodes, routes and core mathematical/prediction catalogues |
| Phase 2 partial | **65** | More detailed Planning draft prompts and editorial refinements |
| Phase 3 implemented | **61** | PDF/Word planning reports, embedded snapshots and safe handover/import |
| Phase 3 partial | **8** | Report layout and nonstandard/edited-document recovery refinements |
| Phase 4 implemented | **275** | **52 Completing nodes and 223 source transitions** |
| Phase 4 partial | **338** | Detailed Completing, data-method and next-step prompt inventories still needing editorial tuning |
| Phase 5 implemented | **146** | **66 Writing Moments, 30 Maths & Technology, 38 Limitation Examples, 12 Bivariate Decisions** with actual-state relevance guards and student-controlled UI |
| Phase 5 partial | **114** | Supporting examples, test cases and additional editorial/acceptance principles not individually validated in class |
| Conformance implemented | **21** | D01-D21 milestone-gated draft, feedback and final self-review |
| Not implemented | **236** | Other reference material or future Phase 6 draft/final-review work |
| **Total** | **1,430** | Unique indexed source records across the 24 tabs |

The original flowchart contains **84 nodes and 284 routes**, split as Planning 32 nodes/61 routes and Completing 52 nodes/223 routes. Source editorial states (Agreed / Working draft / Needs discussion) should not be confused with website implementation or student progress.

## Implementation links

- [Exact row-level coverage register](coverage.csv): original sheet, source row/ID, editorial status, implementation files and partial/future status.
- [Phase 5 contextual advice and source-aligned acceptance journeys](phase-5.md).
- [Phase 4 Completing workflow](phase-4.md).
- [Phase 3 document handover](phase-3.md).
- [Phase 2 Planning](phase-2.md).
- [All source nodes and routes](../data/flow/nodes.json).
- Student-facing IA Studio: src/completing/views.js and src/completing/engine.js.
- Source-preserving guidance catalogue: src/completing/guidance-catalog.js.
- Source/evidence/method/accuracy and course context: src/completing/guidance-context.js.
- One-cue writing priority, localisation, suppression and student acknowledgements: src/completing/writing-guidance.js and guidance-actions.js.
- Actual method-based limitations and defensible-inference records: src/completing/limitation-guidance.js.
- Observed paired scatter and actual Pearson follow-ups: src/completing/bivariate-guidance.js.
- Method/syllabus/independent-learning questions: src/completing/maths-guidance.js.
- Responsive opt-in interface: src/completing/guidance-views.js.
- Project migrations, mathematics and source revisions: src/core/project-state.js, src/completing/entry-record.js, app.js.
- Automated verification: tests/phase5-guidance.test.js, tests/ui-smoke.test.js, Completing/Planning/handovers tests and the GitHub Actions validation/build workflow.

## What Phase 5 implementation means

Source-linked W/M/L/B entries are **not all displayed to every student**. Each has stage, actual-data status, method/course or interpretation prerequisites. Student-selected plans, candidate datasets and generic predictions are insufficient to unlock actual-result interpretation or method-specific limitation advice.

Writing advice: **one default moment**, optional more, labelled IA location, “Write now / Already covered / Not relevant / Show an example / Dismiss”, per-result/source scope and saved student choice. No separate AI-authored text is inserted in Word or Google Docs.

Limitations: question prompts shown on demand, maximum three at a time, data-method versus active-maths separation, student explanation plus **real mathematical consequence** required before a limitation is recorded. Only confirmed limitations appear in the conclusion.

Bivariate: actual plotted paired quantitative data; graph shape nuance; actual coefficient required for Pearson advice; regression and Spearman conditional, course checked and optional; no causal claim or fabricated finding.

Accuracy: per-quantity source-unit-resolution records and explicit link to an affected calculation, only relevant reminders, exact versus approximate distinction, preserved student work and flagged follow-up on material changes.

Mathematical depth: verified syllabus methods applied, unfamiliar out-of-course *components* explained at first genuine use, unknown course decisions deferred to teacher/syllabus, mathematical learning shared only when actual.

## Remaining work

The **146 core Phase 5 rules are connected**, but 114 supporting case/example records are marked partial because they require classroom review; they are not represented as individually proven teaching outcomes. Some Phase 4 supplementary source pages also remain partial despite having functional foundational prompts. The 15 October conformance pass connects D01-D21 to optional milestone-specific review, evidence and verified revision interactions. Broader accessibility checks, long-answer layout/document QA and real student acceptance remain separate. See [conformance corrections and verification](conformance-2026-10-15.md).

Pathfinder does **not** verify permissions, prove source reliability, automatically grade IAs, synchronise accounts or write whole IA documents. PDF/Word exports contain a point-in-time Planning snapshot only; the full JSON project backup carries actual mathematical and writing activity.
