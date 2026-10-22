# Pass 4 — Repository maintenance, historical documentation and branch hygiene

**22 October 2026.** Baseline `main` commit: `e95a8d6339dd1d9ce1ca62bcd7cb0f758f439b13`.

## Changes

1. **README:** replaced the accumulation of dated release notes with a concise current site guide: Planning and IA writing journeys, sixteen mathematics pathways, seven creators, guidance modes, backups/reports, 2029 assessment preparation, development and known limitations. In particular, corrected the old contradictory claim that all Word/PDF reports are planning-only.
2. **Documentation:** retained original files at their existing paths, adding [docs/README.md](README.md) as a curated current/history index. Source workbook JSON, design chronology, audit records and coverage data stay in source control.
3. **GitHub Actions:** removed an obsolete push-only `fix-report-exports-2026-10-15` writeback job and its broad `contents: write` permission. The report export browser check still runs on relevant PRs or dispatch and following successful deployment, with desktop/phone report-download assertions and artifact uploads. The always-on Node/build and deployment release gates are unchanged. Other focused workflows were already de-duplicated in the [22 October CI optimisation](github-actions-optimisation-2026-10-22.md), so no additional browser coverage was eliminated.
4. **Merged branches:** audited all 61 non-`main` branches present at the baseline. Each had exactly one closed/merged PR into `main`, and the PR head SHA equalled the current branch SHA. The temporary one-time workflow `.github/workflows/pass4-prune-verified-branches.yml` enforces these conditions again, verifies the merge commits are ancestors of baseline `main`, checks for branch protection or changes and removes only unchanged verified refs. Its final run and removal are to be checked before declaring pruning complete. No release tags, PRs or merged Git commits are deleted.

## Protected compatibility and content

- Both published current A–E assessment guidance and the optional `revised2029` preparation.
- All 16 investigative pathways, all seven native figure generators and cross-stage links, JSON backup/version migration, PDF/Word/ZIP reports, and the Writer's Field Guide.
- Original source records, historical planning/conclusion IDs and former workbook/design snapshots.
- Every essential unit/browser acceptance and independent deployment gate. Existing [conformance issue #65](https://github.com/chriswalker-afk/IB-IA-Planning-and-Writing/issues/65) remains tracked independently rather than skipped.

## Acceptance

- `npm test` and `npm run build` stay required on PR and `main`; browser checks triggered for CI-relevant files remain.
- Report-export workflow retains `workflow_run` success gating, current PR pathways, pinned dependency setup and `--live` post-deployment checks, but no writeback to a retired branch.
- The branch-pruning workflow must report a verified run before removing its own file. GitHub PR records and commit history serve as the permanent branch archive.
- No live student-facing JavaScript, stylesheet, curriculum advice or saved schema was changed in this pass.

## Future Pass 5

Perform a final end-to-end regression audit across the current welcome/Planning/IA Writing/Checking routes, all 16 journeys and seven studios, historic JSON migrations, cohort guidance, desktop/phone behaviour and exported figures/reports. Keep conformance browser failure #65 visible until independently resolved.
