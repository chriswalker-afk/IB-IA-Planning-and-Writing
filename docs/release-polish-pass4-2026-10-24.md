# Release polish — Pass 4: seven diagram-generator workspaces

24 October 2026 · branch `release-polish-pass4-diagram-workspaces`

## Aim

Make seven mathematically different figure generators feel like one application, without flattening their specific data, controls, analysis, or outputs. The shared sequence is **Create & refine → Check → Save or link → Export**. These are *workflow signposts*, not a claim that any IA or writing stage has been completed.

## Implemented

1. **One editable-draft / link / export action component.** `representationOutputActions` in `src/diagrams/workspace-ui.js` draws identical labelled action groups for graph, statistical diagram, formatted table, image/coordinate tracer, Voronoi, geometry and probability. It uses the studios’ original `data-action` identifiers, readiness validation and available formats. Each tool keeps its own specialist cross-tool transfer links and warnings.
2. **Draft saving no longer disappears in Table Studio.** `table-save` was already supported by `src/diagrams/table-studio-actions.js` and the app's event dispatcher; Pass 4 exposes it alongside the existing Save & link button. No new state, schema or persistence routine required.
3. **Correct stage language.** Every tool says **Save & link to this mathematical stage**, not “my first mathematics”, which was misleading when editing second or later stages.
4. **Save, link and export explained.** A reusable note distinguishes (a) an editable figure in the local project and restorable JSON backup, (b) a saved figure associated with the current IA Studio mathematical stage, and (c) a downloaded/copied standalone file. No action writes into Word/Google Docs or grants IB credit.
5. **Shared readiness and work-status panel.** `representation-workflow.js` calls the existing mathematical/presentation checks; the panel distinguishes missing requirements, checks passed, a saved copy, and a figure already linked to the current stage. It never treats presentation checks as a verified mathematical result. When an editor refreshes just its preview, the status updates in place without remounting the current input.
6. **Predictable return controls.** The shared seven-tool switcher visibly names whether Back returns to first/later mathematics or the original Tools & tutorials launch route. The five studios that previously displayed assorted “Close…” labels now display the same **All tools** secondary action. The existing `editorReturnNode`, original-route restoration and untouched draft preservation remain authoritative.
7. **One responsive action appearance.** `data/release-representation.css` (final source stylesheet) provides card separation, appropriately prominent primary link action, consistent export grids, accessible 44px touch targets, focus outlines, phone layouts and reduced-motion support. The site still produces one minified `site.css` (now 36 ordered inputs).

## Protected boundaries

- No mathematical equations, Figure SVG algorithms, analysis thresholds, source validation, calculated figures, inference rules, chart data, or new file-export implementations changed.
- Existing save, link, copy and download handlers remain responsible for changes; transfer actions still preserve the originating data and other saved figures.
- The 16 investigative routes, course/cohort guidance, 14 writing tips, diagrams, student fields, JSON backup format, and A–E / revised 2029 distinction remain unchanged.
- Saves remain local and restorable via JSON; full-project PDF/Word are readable reports. Merely displaying or saving a figure never completes writing or mathematics.
- The shared switcher remains the single source for tool navigation; individual studios do not introduce another sidebar or progress counter.

## Acceptance

- Node test `tests/release-representation-workflow.test.js`: seven mappings, existing actions, readiness gating, saved/link states, original launch return, export distinction, CSS production order.
- Extended `scripts/representation-pass5-browser.py` verifies each of the seven output panels on phone and desktop, the exposed Table draft save, visible first/later return labels and persistence across tool switches.
- Existing geometry, graph, table, statistical, probability, Voronoi, tracer, representation transfer and report-export suites should pass.
- Visual QA: 320, 390, 768, 1440px; action grouping, long button wrapping, scrollable preview, input focus, empty/invalid states, next-stage return, project backup, and 7-tool tab parity.

## Next

Pass 5 is the accessibility and responsive audit (especially keyboard focus and screen reader semantics), followed by Pass 6 launch verification. The pre-existing broad conformance JSON-export locator problem tracked in [#65](https://github.com/chriswalker-afk/IB-IA-Planning-and-Writing/issues/65) is independent, and should not be represented as a successful check until repaired.
