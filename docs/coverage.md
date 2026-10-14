# IA Pathfinder — spreadsheet migration and implementation coverage

**Source snapshot:** 14 October 2026. All 24 original Google Sheet tabs are retained as read-only versioned JSON under data/. **The source spreadsheet has not been modified.** Capturing source content is not the same as implementing its educational instructions.

## Count of source records

| Runtime status | Count | Meaning |
|---|---:|---|
| Phase 2 implemented | **166** | Planning routes/nodes, available course mathematics catalogue and contextual predictions |
| Phase 2 partial | **65** | Additional Planning editorial details still to refine |
| Phase 3 implemented | **61** | PDF/Word planning reports, embedded snapshots and safe handover/import logic |
| Phase 3 partial | **8** | Particular report layout/third-party text recovery refinements |
| Phase 4 implemented | **275** | **52 Completing nodes and 223 source transitions** connected to screens/route engine |
| Phase 4 partial | **338** | Completing, data-method, first-result, interpretation and next-step prompt inventories, with core behaviour but not every conditional specialty |
| Prototype partial | **5** | Legacy prototype-level interactions retained, to align with later guidance |
| Not implemented | **512** | Mainly contextual writing moments, specialist Maths & Technology, bivariate and limitations libraries, advanced review content |
| **Total** | **1,430** | Unique indexed records across the 24 workbook tabs |

The source flowchart has **84 nodes and 284 routes**: Planning represents 32 nodes and 61 routes, while Completing represents 52 nodes and 223 routes. Editorial spreadsheet statuses (Agreed, Working draft, Needs discussion) are different from runtime completion statuses and student stage statuses.

## Source-to-code traceability

- [Exact row-level audit with spreadsheet tab, source row, ID, status and implementation reference](coverage.csv).
- [Phase 4: Completing workflow design and acceptance tests](phase-4.md).
- [Phase 3: personalised planning reports, import and handover](phase-3.md).
- [Phase 2: source-derived Planning journey](phase-2.md).
- [Manifest and all source nodes/routes](../data/catalog/index.json).
- Planning engine and responsive interface: src/planning/ and src/ui/planning-views.js.
- Phase 4 source-linked Completing engine, 52 screens and route choices: src/completing/catalog.js, engine.js and views.js.
- Actual mathematical step migration, revist/review flags, precision memory and state transitions: src/completing/entry-record.js and src/core/project-state.js.
- Shared current-project data and browser actions: app.js, src/core/record-access.js.
- Personalised reports, versioned planning snapshots and guarded import: src/handover/.
- Automated regression tests: tests/completing-engine.test.js, tests/completing-views.test.js, tests/ui-smoke.test.js, plus Planning, project-state and document round-trip suites.

## Exactly what is functional in Phase 4

- A source-linked screen for each original Completing node, with exact source-row destinations for all 223 transitions.
- A student-friendly stage dashboard and direct Planning/Word/PDF/blank starts.
- Genuine evidence vs planned evidence separation, statistics, modelling and theoretical pathways.
- First purposeful figure/calculation with *before* explanation and *after* real interpretation.
- Repeatable previous real result → unanswered question → justified mathematical method → genuine result → local takeaway loop, plus a valid stop-and-conclude option.
- Contextual Pearson/scatter guidance conditioned on confirmed real work and the relevant mathematical chain, not stale earlier plots.
- Per-quantity accuracy decisions recalled when appropriate, student-described limitations, new mathematical learning and technology meaning.
- Revision flags for later mathematics that depends on changed earlier results; original student work preserved for reconsideration.
- Meaningful conclusion, presentation, teacher-draft and final review entry points, all explicitly non-grading.
- Local autosave, JSON whole-project backups, and backwards-compatible project migrations.

## What remains partial

Phase 4 implemented the **routed Completing backbone**, not full coverage of every nuanced worksheet prompt. In particular, Phase 5 should refine relevance and timing of contextual writing moments, detailed sampling and measurement advice, analysis-specific limitations, PMCC/subsequent-model branching, accuracy reminders tied to *each* mathematical quantity, and the quality/suppression of guidance.

Phase 6 should deepen criteria A–E and school feedback instructions, conduct classroom acceptance tests including long student answers and mobile/a11y QA, and check rendered PDF/Word exports across diverse projects. The website does **not** grade, verify consent, collect evidence, or automatically create a student's IA.

PDF/Word handovers contain a point-in-time **Planning snapshot**, not updated Word-body edits or mathematical results. Full JSON backups store the ongoing Completing workspace. Permission flags are not automatically cleared by importing a document.

**Interpreting the audit:** Implemented refers to a connected, tested source-linked node or route. Partial means representative educational behaviour is functional but the complete conditional editorial content is still unfinished. Not implemented means the content is captured as source reference but not yet used in the student interface.
