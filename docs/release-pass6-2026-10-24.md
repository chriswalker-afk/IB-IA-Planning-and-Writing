# Release readiness — Pass 6, start

24 October 2026 · branch `release-pass6-export-and-restore-gate`

## Purpose

Turn the five completed interface-polish passes into a testable public release, not just an attractive GitHub Pages build. Do not alter the mathematics, student-authored work, 16 investigation routes, diagram algorithms, course-specific or 2029 assessment guidance, backups or privacy model as a shortcut to obtaining green checks.

The public [Pass 5 deployment](https://github.com/chriswalker-afk/IB-IA-Planning-and-Writing/actions/runs/40042685138) succeeded at commit `8b025cf8`, and the foundation, accessibility, focused generators, illustrations, writing help and other browser flows passed. The general [conformance run](https://github.com/chriswalker-afk/IB-IA-Planning-and-Writing/actions/runs/40042685095) still had two failed groups. Review of their logs showed:

- **Writing and help → resources-preferences-backup-restore**: `scripts/resources-browser.py` selected the first `[data-action="export-json"]` regardless of visibility; it resolved to the intentionally hidden stale-Pages export recovery button and timed out.
- **Assessment guidance → essentials-shared-review-save-reload-backup**: `scripts/essentials-browser.py` used an unqualified drawer-wide selector that matched both the hidden recovery action and the normal project-backup action.
- Seven other conformance groups passed (including planning, mathematical decisions and five separate illustrative-sample groups). The normal backup, assessment notes, and resource preferences were not proven broken by these logs; correcting the selectors without a real download-and-restore check would nevertheless be inadequate.

## First repair batch in this PR

1. Keep the **two legitimate backup use cases**. A quick JSON download appears in the error-recovery alert when a document export fails; the standard full-project JSON backup remains in the ordinary Backup section. Mark their existing, unchanged `export-json` actions `data-backup-recovery` and `data-backup-primary` respectively.
2. Repair the two full conformance browser scenarios to target the **visible normal project-backup button**, confirm the error-recovery action is hidden on a healthy page, and still assert the downloaded JSON fields and the actual import.
3. Add a separate release gate that uses the **built site in Chromium**, not mocked browser state: desktop/phone JSON download, figure references and teacher-review notes, rejected or canceled imports leaving the original project untouched, a deliberately changed project restored from downloaded JSON, old version-1 localStorage migration into current version-2 export, and a fresh-browser import of that old project. All data is invented solely for QA.
4. Keep explicit Node tests for version-aware migration, no fabricated mathematical results, local storage key stability and preserved review and figure links.
5. Include the extra workflow in the CI inventory and link this note from the docs index.

## Release sign-off register

| Release gate | Status at start | Evidence needed for sign-off |
|---|---|---|
| Main site and Pages deployment | **Passed** for Pass 5 | Deploy current Pass 6 main commit successfully; confirm the served revision |
| Full conformance suite | **Blocked** by two backup selectors | Re-run all nine groups and require all green, with no hidden/forced clicks |
| JSON backup/restore | **New gate added; not yet verified** | Pass desktop+mobile real Chromium round trip, invalid/cancel cases and legacy v1 import |
| Student writing and mathematical journeys | Previously green, **requires PR regression** | Planning → IA Studio → Checking, all 16 pathways and seven creators, staged results not fabricated |
| Full-project PDF/Word/ZIP | Previously green, **requires PR regression** | Export works on current built files and ZIP retains JSON; PDF/Word are readable records, not full restore formats |
| Legacy project migration and assessment cohorts | Unit coverage already exists, **browser gate added** | Old notes/results/figure references survive; A–E and separately revised assessment guidance remain correct |
| Responsive / accessibility | Pass 5 phone/keyboard acceptance passed | Repeat on latest release; real-device screen reader, browser zoom and classroom devices still require manual evaluation |
| Privacy and student-safety wording | Existing local-only design | No backend sync or automated upload; user must deliberately download a JSON backup |
| Student trial / teacher sign-off | **Not yet done** | Use real phone/laptop with non-identifying trial data; record specific obstacles and resolve them |

## Remaining Pass 6 work after this batch

- Confirm the release branch's foundation, dedicated backup/restore, conformance and focused browser suites all pass. If not, fix root causes without force-clicking hidden controls or removing scenarios.
- Merge only after those gates pass and verify GitHub Pages serves the new commit.
- Resolve or explicitly retain [conformance issue #65](https://github.com/chriswalker-afk/IB-IA-Planning-and-Writing/issues/65) on the strength of a complete green run; do not close based on one isolated test.
- Carry out classroom-device and assistive-technology smoke tests and a final non-technical release checklist. This initial automated repair is **not** an assertion of WCAG certification or a completed release.
