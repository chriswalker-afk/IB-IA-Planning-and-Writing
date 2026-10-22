# Pass 2 — Retire superseded IA screens without losing student work

22 October 2026. Follows the [Pass 1 audit](pass1-cleanup-audit-2026-10-22.md) and [full node register](pass1-screen-register-2026-10-22.md).

## Changes implemented

| Superseded code | Active replacement | Safeguard |
| --- | --- | --- |
| `src/ui/studio-views.js`: old six-tab Overview, Introduction, Data, Mathematics, Conclusion and Review UI (240 lines) | Live `src/completing/views.js` and `src/completing/studio-writing-stages.js` | Three still-referenced `mathDefault`, `currentMath` and `suggestions` helpers extracted intact to `src/completing/legacy-math-helpers.js`, used by the existing action dispatcher |
| Nine retired Planning view cases: `N03J`, `N03E`, `N03F`, `N03G`, `N04R`, `N04M`, `N05V`, `N05`, `N06E` | Unified readiness (`N03D`), prediction/refinement (`N01P`) and teacher checkpoint (`N06T`) | Keep ten historical redirects, including `N03P3`, and preserve all saved planning answers/source rows |
| Nine corresponding obsolete Planning auto-advance branches | Live `planAutoAdvance` paths through the current journey | Keep historical short-route conditions and source-sheet provenance in `planningMove` and the route tables |
| Separate C61–C64 Conclusion rendering | C60 three-part Conclusion: supported answer, meaning and limits, optional next questions | Keep C61–C64 saved-state redirects; C60 reuses answer/interpretation/extension fields and shows earlier supporting evidence, uncertainty, recommendation, editing and scratch notes without rewriting them |
| Legacy Planning example-bubble inclusion for old screens | Existing contextual examples beside active questions | Keep original example catalogue and teacher/route guidance |

## What was deliberately kept

- Current student writing guidance, Field Guide lessons and criterion help bubbles. The old C61–C64 criterion spot IDs still annotate the unified Conclusion wherever appropriate.
- The A–E assessment system for earlier cohorts, and the published `revised2029` preparation in live Planning and Checking screens.
- All seven diagram generators and their saved figures, switching, caption/notation tools, embedded report exports and JSON import/export.
- Original workbook data in `data/catalog`, `data/flow` and `data/sheets`, their provenance/source-row references, and every legacy free-text field in the project schema.
- `LEGACY_DESTINATION`, `conclusionPage`, old route history and original fields, so old student backups safely open the modern screens.
- Three small legacy math helpers and the remaining event-action compatibility pathways; these are isolated rather than deleted without proving no old restore paths require them.

## Validation

Pass 2 adds `tests/pass2-retirement.test.js`. It verifies removal of redundant screen cases, preserved alternative navigation and original text, safe C61–C64 reopening in C60, all seven generator registrations, and both assessment cohorts.

`npm test` and `npm run build` must pass. Browser acceptance should cover desktop/phone journeys, green/purple help bubbles, 2029 criteria, diagram editors, and reports. Use `npm run audit:screens` to confirm retired nodes no longer have standalone renderers and to detect any broken runtime import.

## Boundaries of this pass

Only implementation code made redundant by current routing was retired. No student answers, examples, useful live writing lessons, original source data, or new-criteria preparation were removed. CSS consolidation and deploying source-only workbook snapshots belong in Pass 3; historical GitHub branches and workflow housekeeping belong in Pass 4.
