# IA Pathfinder — source migration and implementation coverage

**Google Sheet snapshot:** \`IA Pathfinder — Flowchart Draft\`, 14 October 2026. Source sheets are preserved in \`data/sheets/*.json\`, normalized route data in \`data/flow/*.json\`, and Phase 2 catalogs in \`src/planning/\`. No changes have been made to the source Google Sheet.

## Current coverage by source item

| Runtime status | Count | Meaning |
|---|---:|---|
| phase2-implemented | **166** | All 32 Planning nodes, 61 Planning routes, 51 mathematics options, 22 prediction nudges |
| phase2-partial | **90** | Supplementary planning prompts/teacher guidance/feasibility and Phase 3 report-format requirements |
| prototype-partial | **37** | Existing preliminary Completing interactions |
| not-implemented | **1,137** | Primarily Completing and advanced contextual advice to be built in later phases |
| **Total indexed records** | **1,430** | From all 24 tabs |

Total source flowchart: **84 nodes and 284 route connections**. Planning specifically: **32 nodes and 61 route connections**. The original node editorial statuses are retained: 41 Agreed, 42 Working drafts, 1 Needs discussion. Those statuses are *different* from implementation status.

## Artifacts

- [Detailed row-by-row coverage register](coverage.csv): exact source ID, sheet, row, editorial status, runtime status and implementation location.
- [Phase 2 implementation and test notes](phase-2.md): what now works in Planning, routes to review, safety distinctions, and Phase 3 handover boundaries.
- [Source manifest](../data/catalog/index.json): all 24 sheet snapshots and source paths.
- [Full flowchart nodes](../data/flow/nodes.json) and [routes](../data/flow/routes.json).
- \`src/planning/catalog.js\`: AI SL/AA SL maths, prediction, feasibility, teacher prompts with provenance.
- \`src/planning/route-table.js\`: original 61 Planning conditions and source row refs.
- \`src/planning/engine.js\`: actual Planning state, branch execution, flags, conditional suggestions and join safeguards.
- \`src/ui/planning-views.js\`: focused mobile/desktop student screens.
- \`tests/planning-engine.test.js\` and \`tests/planning-ui-coverage.test.js\`: complete node rendering, routes, combined data, predictions, course menus, consent and migration.

## Interpreting coverage

**Source captured** does not mean implemented. An implemented Planning node means a source-linked interactive screen/branch is present and has automated test coverage. Supplementary draft prompts may still need editorial refinement even when the surrounding node is implemented.

No general spreadsheet prose is evaluated as if it were executable code; approved source conditions are explicitly mapped to student actions. A provisional summary never claims to be teacher-approved and never treats expected findings as actual observations.

## Remaining work

- **Phase 3** — polished PDF/Word planning documents and resilient reimport of machine-readable projects.
- **Phase 4** — full C-node Completing flow with flexible mathematics stages, interpretation and authentic next questions.
- **Phase 5** — precise triggers and suppression for writing moments, mathematical limitations, accuracy reuse and mathematical learning.
- **Phase 6** — teacher feedback, final review and comprehensive classroom acceptance testing.

No fixed number of mathematical sections, predicted IA grade, or arbitrary compulsory mathematical sophistication has been introduced.
