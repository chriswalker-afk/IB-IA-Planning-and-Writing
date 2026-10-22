# Cleanup Pass 5 — Final integration and regression acceptance

**22 October 2026** · Follows [Pass 1](pass1-cleanup-audit-2026-10-22.md), [Pass 2](pass2-cleanup-implementation-2026-10-22.md), [Pass 3](pass3-styles-deployment-2026-10-22.md) and [Pass 4](pass4-repository-maintenance-2026-10-22.md).

This cleanup pass is **not** the earlier “Pass 5” of the diagram-generator implementation. It is a final, cross-feature safety check after repository consolidation. No student-facing screen, saved field, IA guidance, source workbook or figure creator needs deletion to pass this audit.

## Scope of protected student experience

| Component | Required integrity |
| --- | --- |
| Planning and Writing | Home, Planning, Writing, Checking, My Path and Backups/reports remain navigable; new onboarding screens are exercised rather than bypassed for new students |
| Mathematics | All 16 editorial mathematical pathways; no route is treated as an actual result or a prescribed method; actual results and chosen outcomes drive subsequent mathematical advice |
| Figure creators | Graph & Model, Statistical Diagrams, Tables, Image Tracer, Voronoi, Geometry & Measurement, Probability Tree; preserve editor draft, figure/stage ownership and relevant mathematical labels |
| Project restoration | Legacy v1 and current v2 full-project JSON; former Planning and Conclusion IDs redirect to current screens without losing student text; saved figure references survive normalisation, import and reload |
| Assessment modes | Earlier A–E for current students and the separately selected 2029 published-overview mode; no automatic grade conversion, reclassification or deletion of old review notes |
| Output and accessibility | Full-project PDF/Word/ZIP and JSON, report-image exports, desktop/phone browser behaviour, keyboard and reduced-advice access, source evidence and notation |

## Test architecture

**Node release contract:** `tests/cleanup-pass5-final.test.js` checks all 16 pathways, seven creators and valid saved figure IDs, old v1 project restoration, versioned round-trip preservation of seven linked figure records, cohort changes, and the exact preservation of all 13 older conformance scripts. `tests/ci-workflow-contract.test.js` verifies the CI matrix and its required acceptance suites. The always-on `npm test` and `npm run build` gates are retained.

**Final browser matrix:** `.github/workflows/cleanup-pass5-browser.yml` runs five independently reported groups with `fail-fast: false`: (1) pathways, return navigation, current onboarding and full JSON import; (2) graph, statistics and tables; (3) tracer, Voronoi, geometry and probability; (4) current/2029 assessment pop-ins; (5) mixed mathematical notation and PDF, Word and ZIP reports. Real Chromium desktop and mobile screenshots and structured results are uploaded as artifacts.

**Conformance suite improvement:** `.github/workflows/conformance-browser.yml` now runs all 13 previously sequential acceptance scripts as **five** independent browser jobs: writing/help, idea/resources/examples, mathematics, criteria, and experience. The source scripts are not silently removed, force-clicked or converted into no-op checks. Where user-facing pages had changed since the old scripts were written, their starting fixtures and assertions were updated to use the real onboarding, adaptive result outcomes, criterion badge rails and contextual Help locations.

The intended acceptance standard is green unit/build, all six final browser groups, all five conformance browser groups, and the focused investigative-mathematics acceptance. A green build alone is insufficient to call the site fully regression-verified.

## Correctness boundaries

- A restored student calculation, observation, status, method, saved diagram, source link or critique is not silently replaced with an invented result; changing criteria view must not regrade the work.
- Saved figure IDs must satisfy each generator's own schema; simply inserting test data into an unchecked JSON object is not proof that real restoration works.
- When an old screen is redirected, regression tests check the modern destination **and** historical field values.
- Only genuinely produced results unlock suggestions. The mathematical route and method are context, never a forced finding. Revised 2029 guidance remains a published overview where detailed descriptors are not available.
- New browser test fixtures may start after a completed welcome when testing a specific later screen, but separate onboarding tests must exercise the actual first-time welcome and Continue interaction.
- Original historical documentation and workbook JSON remain available in GitHub; Pass 3 still excludes source-only snapshots from the published site.

## Release and remaining-review policy

Use the Pass 5 PR's **latest head SHA**, not cancelled checks belonging to earlier intermediate commits, to verify the gates. Keep any genuine failures visible, with screenshots/tracebacks where available. A failing test must be repaired to exercise the intended real interface or clearly identified as a remaining issue; do not weaken student guidance, skip browser suites or misreport a pending job as passed.

Original conformance tracking: [issue #65](https://github.com/chriswalker-afk/IB-IA-Planning-and-Writing/issues/65). Close it only when its complete retained matrix has passed, including desktop and mobile, otherwise record the still-failing scenarios.
