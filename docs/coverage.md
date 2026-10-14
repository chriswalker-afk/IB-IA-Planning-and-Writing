# IA Pathfinder — source migration and implementation coverage

**Snapshot:** Google Sheet \`IA Pathfinder — Flowchart Draft\`, 14 October 2026. Its original 24 tabs and all indexed source rows are preserved in the repository; **the source Google Sheet has not been changed**.

## Coverage by source item

| Runtime status | Count | Meaning |
|---|---:|---|
| Phase 2 implemented | **166** | All 32 Planning nodes, 61 Planning routes, 51 listed techniques and 22 prediction nudges |
| Phase 2 partial | **65** | Supplemental Planning draft prompts, feasibility details and editorial rules still needing refinement |
| Phase 3 implemented | **61** | Personalised planning PDF/Word sections, source planning fields, selected import/recovery/merge routes |
| Phase 3 partial | **8** | Some exact editorial report layouts, third-party/edited document recovery and deferred completion-snapshot details |
| Prototype partial | **37** | Preliminary Completing interactions that are not yet the full source flowchart |
| Not implemented | **1,093** | Primarily Completing nodes, guidance libraries and later teacher/final-review features |
| **Total** | **1,430** | Unique indexed records across all 24 sheet tabs |

The original flowchart has **84 nodes and 284 routes**; Planning accounts for **32 nodes and 61 routes**. Editorial statuses **41 Agreed, 42 Working draft and 1 Needs discussion** refer to workbook content, **not** technical completion.

## Traceability and implementation

- [Complete row-by-row coverage register](coverage.csv): source tab/row, item ID, editorial status, runtime status, implementation file and next phase.
- [Phase 3 document, handover and reimport tests](phase-3.md): student review paths, safe recovery limits and implementation details.
- [Phase 2 Planning details](phase-2.md): branching, syllabus menus, context checks and planning tests.
- [Source tab manifest](../data/catalog/index.json), [full node table](../data/flow/nodes.json) and [all source routes](../data/flow/routes.json).
- \`src/planning/\` and \`src/ui/planning-views.js\`: fully navigable, conditional Planning.
- \`src/handover/schema.js\`: versioned planning snapshot, explicit field-level diff/merge, historical teacher concerns.
- \`src/handover/report-model.js\`: common conditional content in all generated reports.
- \`src/handover/formats/\`: paginated PDF with embedded JSON; editable Word with embedded custom XML.
- \`src/handover/read-document.js\`: local document upload, metadata-first import, conservative text fallback.
- \`src/ui/handover-views.js\`: student confirmation, conflict comparison, manual recovery.
- \`tests/handover.test.js\`, \`tests/handover-ui.test.js\`, \`tests/ui-smoke.test.js\`: automated round-trip, conflict, migration and consent safeguards.

## Interpretation

**Captured data is not executed logic.** “Implemented” means the appropriate student-facing action or data path is connected and tested against the mapped source requirement; related draft content may still need editorial review.

**Docx/PDF import restores the embedded exported plan, not subsequent visible-document edits.** If a document was modified later, changes must be confirmed or re-entered; absence of a reliable embedded snapshot triggers cautious manual recovery. A report does not include completed mathematical results; only the full JSON project backup carries all IA Studio work.

No document import claims teacher approval, validates participant consent or converts tentative ratings into an IA score.

## Next phases

- **Phase 4:** build the complete C-node Completing system and repeatable evidence → interpretation → next mathematical question loop.
- **Phase 5:** exact contextual writing-moment, mathematical limitations, accuracy memory, outside-syllabus understanding and relevant prompts with suppression.
- **Phase 6:** draft/final review, real classroom acceptance tests, accessibility and report visual QA against long and varied student responses.

The interface should remain light even as its mathematical judgement becomes more nuanced.
