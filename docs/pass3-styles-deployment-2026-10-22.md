# Pass 3 — Styles, production assets and responsive QA

**22 October 2026** · follows the [Pass 1 source audit](pass1-cleanup-audit-2026-10-22.md) and [Pass 2 safe retirement](pass2-cleanup-implementation-2026-10-22.md).

## Goals and implementation

| Concern | Baseline | Pass 3 |
| --- | --- | --- |
| Loaded CSS | 29 ordered `<link>` requests totalling **520,657 bytes** of source CSS (including base and responsive overrides) | The production `dist/index.html` loads **one** generated minified `site.css`, **498,416 bytes** in the initial CI build; original CSS source and cascade order are preserved |
| Original workbook records | `scripts/build.mjs` published the whole `data` tree, including `data/catalog/` (**1,781,043 bytes**) and `data/sheets/` (**892,673 bytes**) | All **2,673,716 bytes** of these audit/snapshot JSON files remain in the GitHub repository and existing source tests, but are not copied to Pages |
| Historical route data | `data/flow/nodes.json` and `routes.json` shipped along with the whole `data` tree | Retained in `dist/data/flow/` so source-route references continue to resolve |
| Third-party dependencies | Published `vendor/*.js` (already bundled again by esbuild) and the source-hosting import map | Source `index.html`, import map, pinned vendor modules and worker remain intact in GitHub. The esbuild production HTML drops the redundant import map and `vendor` bundles; preserves PDF worker and distributes all four licence notices in `dist/licenses/` |
| Deploy regression protection | The build copied whole directories without an explicit production asset allowlist | `scripts/audit-deploy-assets.mjs` checks the complete output tree, required assets, 29→1 CSS order, source-hosting compatibility and archive exclusion. Build fails if new unreviewed files get published |

After bundling, the first passing production-build log reported **28 published files totalling 7,158,202 bytes**. This is uncompressed artifact size, not a measured browser transfer, and comparisons with prior builds are estimates until a like-for-like archived artifact measurement is performed. A browser generally requests only the needed scripts and assets.

## CSS preservation details

`scripts/build-styles.mjs` reads the stylesheet list directly from the source `index.html`, preserving its order and every original selector (including tool-specific, responsive, reduced-motion and criteria-guide styles). esbuild minifies but does not purge selectors or rename classes. A guard rejects unexpected relative `url()` assets or late `@import` rules rather than silently breaking resource paths during bundling. The Google Fonts import remains as before.

This pass deliberately avoids deleting duplicate-looking CSS declarations without proving cascade equivalence: repeated rules inside desktop/phone media queries and specificity overrides can be intentional. Source files remain easy to edit; only the published CSS is consolidated. Future source-level selector refactoring should use screenshots and computed-style comparisons at representative screen sizes.

## Retention and compatibility

- No student field, saved diagram/figure, JSON export format, import migration, mathematical advice, Field Guide pop-in, A–E rubric or `revised2029` assessment preparation was changed.
- `pdf.worker.min.mjs` is still deployed for fallbacks when a PDF has no embedded Pathfinder snapshot, and reports remain downloaded locally.
- Original `data/catalog`, `data/sheets`, `data/flow`, `styles.css` and `data/*.css` files are **still present in GitHub**. The source page still works with pinned self-hosted vendor libraries without an npm bundler.
- The `dist/` folder is a generated deployment artifact. URLs under `dist/data/catalog`, `dist/data/sheets` and `dist/vendor` are intentionally no longer distributed; use their source repository links if an original workbook needs review.

## Checks

- `npm test` covers the original 1,000+ unit tests plus `tests/pass3-deploy-assets.test.js` for font, CSS order, all seven diagram stylesheet sources, source-workbook preservation and revised criteria.
- `npm run build` runs the production allowlist auditor automatically; `node scripts/audit-deploy-assets.mjs` can audit an already built `dist` independently.
- `.github/workflows/pass3-build-browser.yml` runs focused, parallel desktop/phone browser checks on **representation integration (all seven creators), Graph Studio, Statistical Studio, chapter onboarding, criteria badges, and PDF/Word/ZIP exports** when production packaging changes.
- The pre-existing monolithic conformance failure is separately tracked in [issue #65](https://github.com/chriswalker-afk/IB-IA-Planning-and-Writing/issues/65). Do not weaken its checks or mistake it for a Pass 3 regression.

## Next step

Pass 4 should tidy workflows and obsolete GitHub branches cautiously, keeping all meaningful QA safeguards. Consider an optional dedicated CSS selector audit only after production-size and screenshot baselines have stabilised.
