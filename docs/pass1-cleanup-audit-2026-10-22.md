# Pass 1 — Screen, dependency and saved-project audit

**22 October 2026 · baseline:** main `4f473e248d43bf2bbdce598fb7872067d6d6ad91`.

**Scope:** documentation, a source-derived inventory and safety tests. No student-facing page, advice, figure, source data, export or criteria mode has been removed.

## Complete source-node inventory

Run `npm run audit:screens` for the full row-by-row Planning and Completing register, including source IDs, whether a renderer exists, legacy redirection, contextual-help classification, and a conservative static route-graph indicator. Run `npm run audit:screens:write` for both Markdown and JSON in `docs/generated/`.

The inventory also traverses JavaScript imports from `app.js`, lists candidate non-runtime source modules and missing relative imports, records all seven diagram studios, and summarises CSS/source-workbook size. **No static import or route-graph finding, on its own, proves a page or file is safe to delete:** student choices, dynamic views, tests, imports, old bookmarks and persisted projects must be checked.

## Audited features and cleanup candidates

| Area | Source-backed finding | Disposition |
| --- | --- | --- |
| Main website | One `index.html` entry and six application routes: home, planning, completing, checking, path and report | Keep |
| Planning | Ten old node IDs redirect to modern screens. Retained route tables also preserve original workbook provenance | Preserve redirects and text; retire dead rendering separately |
| IA Studio | 52 C-node source records; old `C61`–`C64` conclusion pages now reopen unified `C60` | Review duplicate branches for Pass 2, not the saved fields |
| Older IA Studio module | `src/ui/studio-views.js` still defines its former six-tab UI. The app retains only three helper exports (`mathDefault`, `currentMath`, `suggestions`) and renders new IA Studio via `src/completing/views.js` | Best Pass 2 extraction target |
| Examples and help | `C10E` is intercepted by the shared Examples viewer; `C95*` are contextual help nodes; `C96` holds writing guidance | Preserve; these are not unused pages |
| Seven diagram tools | Graph, statistics, tables, image tracer, Voronoi, geometry and probability all appear in `representation-registry.js` | Preserve editors, IA links, exports, saved records and backups |
| New IA criteria | `revised2029` is a live mode in Planning, Studio and Checking, not a separate old page. Old A–E remains default for earlier students | Explicitly protected |
| Workbook reference data | 31 `data/{catalog,flow,sheets}` JSON files, approximately 2.84 MB; tests and documentation cite these records | Keep in GitHub; review only deployed copies in Pass 3 |
| Styling | 29 loaded stylesheets, approximately 521 KB of CSS source; repeated rules may be responsive or deliberate | Measure actual use before removing selectors |
| CI and branches | 24 workflow definitions and numerous historical feature branches | Leave until Pass 4; do not sacrifice checks for a tidier list |

### Planning IDs requiring compatibility

| Historical ID | Current screen |
| --- | --- |
| `N03P3` | `N03P` |
| `N03J`, `N03E`, `N03F`, `N03G` | `N03D` |
| `N04R`, `N04M` | `N01P` |
| `N05V`, `N05`, `N06E` | `N06T` |

These redirects are implemented in `src/planning/engine.js`. The old fields and source-sheet records contain real student choices; redirecting the screen should not erase those answers.

### Completing IDs requiring compatibility

`C61`, `C62`, `C63`, and `C64` redirect to `C60`. `C10E` is a shared Examples-viewer compatibility route. `C95`, `C95D`, `C95A`, `C95L`, `C95Q`, `C95N` are contextual help; `C96` is contextual writing help. `C31` is a *live* common diagram tools workspace, not an abandoned page.

## Criteria badge browser regression

The main-branch Criteria badge acceptance job failed because earlier assertions required badges to be **direct children** of their outer marked field. The new shared field-header help rail correctly nests badges nearer the label. In Pass 1, the browser check now locates its owning field, verifies exactly one labelled textarea and exactly one badge in that field's help rail, and checks `C40/C50` method-suitability placement explicitly. All popup, keyboard, saved-data and rubric assertions are retained. The focused workflow is now eligible on relevant pull requests, not only after merging.

## Saved-project and new-criteria safety

`tests/pass1-compatibility.test.js` verifies: (1) explicit old Planning redirects while preserving student answers, teacher concerns and actual results; (2) old Conclusion IDs reopening C60 without rewriting the student's answer; (3) version 1 JSON migration without invented mathematical work; (4) a version 2 full local backup with seven linked figures, saved writing notes, and explicit `revised2029`; and (5) that the six main routes and all seven generators remain registered.

These extend—not replace—the existing export, route, diagram, accessibility and criterion tests.

## Pass 2 priorities and deletion gates

1. Extract the three **still-live** math-entry helpers from `src/ui/studio-views.js`; only then retire its uncalled old page renderer.
2. Inspect old C61–C64 rendering and guidance references; preserve the four redirects and every historical conclusion answer.
3. Examine retired Planning render/advance branches while preserving old route provenance and all saved inputs.
4. For each candidate orphan identified by the runtime-import graph, inspect script/test usage, dynamic imports, hidden navigation and student backup references before removal.
5. Check every change on mobile and desktop; run all existing browser journeys, diagram suites, reports and backup migrations. Never remove substantive advice without an equivalent current home.

**Pass 1 deliberately makes no file-removal decisions.** A green inventory/test suite establishes a safety baseline; interactive reachability still needs targeted browser verification when an individual old screen is retired.
