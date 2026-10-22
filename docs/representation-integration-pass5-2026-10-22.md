# Pass 5 — Whole-site integration and usability audit

This is the final integration pass for the two new figure creators introduced in Passes 1–4 alongside the five existing generators. See [PR #52](https://github.com/chriswalker-afk/IB-IA-Planning-and-Writing/pull/52). The mathematical exploration and writing remain student-owned: **a suggested tool is optional, a saved figure is not a completed mathematical result, and a model needs justified assumptions**.

## Six integration surfaces audited

| Surface | Invariant / implemented fix | Check |
| --- | --- | --- |
| All 16 investigative journeys | Every route has two ranked, appropriately qualified optional creator links, plus a common seven-tool catalogue later in writing. Original geometry/conditional-risk-specific caution is retained; duplicate buttons are removed. | `representation-pass5.test.js`, route-view tests |
| First mathematics (C30) | One purposeful tool picker, all seven tools, no artificial requirement to use any; saved figures remain editable without claiming results. | C30 gallery and figure export tests |
| Later mathematical stages (C40, C50) | Current method supersedes provisional planning recommendations. Figure gallery is scoped to the active stage and the editor returns to that stage. Geometry drafts cannot silently carry from an unrelated stage. | Route/method unit tests and desktop/phone browser acceptance |
| Tools & Tutorials | Every creator is registered once, accessible alongside written tutorials, and returns to the originating page with student notes intact. | Chapter onboarding browser and Pass 5 browser acceptance |
| Guided versus reduced advice | Reduced mode trims optional introductory prose while retaining the recommended reasons, core IA warning, category filters and expandable contextual/dataset advice. Writer-guide and criteria bubbles remain outside these changes. | Reduced-mode unit/browser and Field Guide regression |
| Saved figures, backups, PDF/Word/ZIP | All seven generators share stage-link management; replacing a figure leaves it saved but unlinked; removed links flag completed work for review. Explicit legacy stage identifiers prevail over stale saved-record metadata. | Figure-link tests, full-export tests, Report export browser |

## Sixteen-route recommendation matrix

| Route | First suggestion | Second suggestion | Mathematical caution |
| --- | --- | --- | --- |
| Relationships between two variables | Graph Plotter | Statistical Diagrams | Inspect actual pairs before selecting a model |
| Comparing groups | Statistical Diagrams | Table Studio | Comparable scales, sample sizes and distributions |
| Categorical relationships | Table Studio | Statistical Diagrams | Correct count/proportion denominator |
| Variation and reliability | Statistical Diagrams | Table Studio | Explain spread and measurement resolution |
| Building and testing models | Graph Plotter | Table Studio | Fitted curves do not demonstrate causation |
| Growth and decay | Graph Plotter | Table Studio | Test additive versus proportional change |
| Cycles and periodic behaviour | Graph Plotter | Statistical Diagrams | One incomplete oscillation cannot establish periodicity |
| Movement and trajectories | Image & Coordinate Tracer | Graph Plotter | Calibrate perspective/scale; do not infer time from photos |
| Optimising a design | Graph Plotter | Table Studio | State constraints and feasible domain; geometry remains an optional third tool for physical designs |
| Modelling shapes from images | Image & Coordinate Tracer | Geometry & Measurement Studio | Calibrate first; distinguish real from schematic lengths |
| Measurement and triangulation | Geometry & Measurement Studio | Image & Coordinate Tracer | Clarify actual measurements, bearings and accuracy |
| Locations and Voronoi diagrams | Voronoi Studio | Image & Coordinate Tracer | Straight-line nearness is not travel time |
| Business and financial decisions | Table Studio | Graph Plotter | Probability Tree remains a qualified optional third tool for successive dependent risks |
| Probability and simulation | Probability Tree Studio | Statistical Diagrams | A probability tree is only useful for genuinely successive/conditional outcomes; do not infer independence |
| Conjecture, proof and counterexamples | Graph Plotter | Table Studio | A graph or list of cases is not proof |
| Iteration and convergence | Graph Plotter | Table Studio | Numerical plots do not prove convergence |

**No new mandatory stages** are added. Recommendations on the writing pages use the selected mathematical method when recorded, not the original route. For later stages with no method, the site recommends generally useful representations without pretending it knows the student's results. Suggestions are deliberately constrained to actual registered tools.

## Navigation and responsive behaviour

- On the route-detail page, each generator link uses the established `resource-creator-open` path, rather than a second navigation implementation. A return action restores the originating Planning, Writing or other page and preserves notes.
- All seven creators share `representationReturnNode`, the C31 editor shell, purpose filters and link-to-stage workflow.
- Selecting a purpose filter shows only creators matching the selected category, across both featured recommendations and the remaining catalogue. No duplicates or false “no tools” message when all matches were featured.
- In reduced mode, source/context explanations are placed in an expandable “Why these tools?” region, not destroyed. The essential caveat that saving is not mathematical verification is still visible.
- Phone styles allow keyboard-focusable, wrap-safe chooser cards and a simplified workspace toolbar. Individual studios retain their own fitted/enlarged viewing controls where implemented.

## Figure lifecycle and project integrity

The shared `figure-linking.js` utility enforces one active mathematical stage association per saved figure across Graph, Statistics, Table, Tracer, Voronoi, Geometry and Probability. If a stage chooses a different figure, the earlier saved figure stays in the project's working materials but no longer claims to belong to that stage. If a change affects completed mathematical writing, it is flagged for review, not silently marked complete again.

For old project backups, figure records may contain outdated `entryId` values while entries store their explicit `*FigureId` references. Gallery and full-project report resolution favour the explicit reference and avoid presenting an unrelated figure as part of another stage's completed mathematics.

## Verification

- `tests/representation-pass5.test.js`: 16 routes, seven creators, all category filters, reduced advice, first/later stage return destinations, saved figures and exports, legacy links, review flags and catalogue access.
- `scripts/representation-pass5-browser.py`: desktop (1440px), phone (390px); recommended/fallback choices, purpose filtering, reduce advice, editor and return, later C40/C50 stages, Planning > Tools & Tutorials > creator > Planning.
- `.github/workflows/representation-pass5-browser.yml`: CI unit/build plus real Chromium acceptance and screenshots.
- Existing full-project PDF/Word/ZIP, mathematical generator and chapter-onboarding suites must pass before merge.

### Known unrelated limitations

The mixed mathematics formula-restoration browser test has failed on `main` since before the geometry/probability work, so it should be repaired separately. Many other mathematical investigations are best presented as calculations, proofs or text rather than requiring any creator. Pass 5 does not add unsupported generators, imply that figure creation constitutes IB marking compliance, or automatically insert output into a student's own IA.
