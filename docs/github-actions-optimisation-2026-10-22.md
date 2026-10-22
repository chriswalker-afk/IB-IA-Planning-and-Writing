# GitHub Actions optimisation — 22 October 2026

## Goals and guarantees

IA Pathfinder has one always-on **Validate IA Pathfinder** workflow on every pull request to main and every main push; this runs `npm test` and `npm run build`. **Deploy IA Pathfinder** retains another `npm test` and build as a production deployment gate.

Browser-specific jobs continue exercising genuine desktop/phone journeys, exports and saved figures. They *build the browser distribution* but no longer independently repeat the entire Node test suite; the central validation workflow owns those tests. Relevant suites remain available with `workflow_dispatch` for manual thorough regression runs.

## Trigger policy

- Browser checks run for their relevant feature files and shared dependencies, not for all PRs by default.
- The previously all-PR Graph, Statistics, Table, Image Tracer, Native Data, Presentation Coach and Voronoi checks now match feature-aware paths. Graph no longer runs just because an unrelated file somewhere in `src/diagrams/**` was modified.
- Conformance has its own cross-cutting planning/writing path filters; report-export acceptance runs for the reporting pipeline, figures and relevant mathematical content. Neither is unconditionally triggered by every PR.
- Feature-specific checks that were intentionally push-only remain push-only; we have not added unnecessary PR gates.
- Changes to either shared CI setup action trigger every browser workflow that depends on it. A workflow file change also exercises its own acceptance tests.
- `workflow_dispatch` remains enabled for manual verification, including broad regression passes before significant releases.

## Caching

`.github/actions/setup-ci-node/action.yml` pins Node 22, reuses npm's **download** cache keyed by OS and `package.json`, and still performs `npm install` in each clean runner. No `package-lock.json` exists yet, so using `setup-node`'s lockfile-based npm cache or pretending builds use `npm ci` would be unsafe.

`.github/actions/setup-ci-browser/action.yml` pins Python 3.12, Playwright 1.57.0 and pypdf 5.9.0, caching pip downloads and Chromium browser binaries. Chromium's system dependencies are still installed when needed. If a pinned browser version changes, update the cache key in the composite action as well as the install command.

Cache keys do not grant access to credentials; pull request caches remain subject to GitHub's normal access rules. The actions do not persist student data.

## Cancellation

All non-deployment workflows use event-scoped and PR/branch-scoped concurrency:
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.event_name }}-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true
```
A newer PR commit cancels older runs of that same workflow for that PR, not other PRs or the foundation/unit validation workflow. A newer main push similarly supersedes older same-workflow main push checks. Deploy IA Pathfinder keeps its existing Pages-specific concurrency and cancellation settings. The post-deployment report check still runs only for successful deployments.

## QA and release policy

- `tests/ci-workflow-contract.test.js` checks setup consistency, central validation, feature-aware pull-request paths, cancellation, and report/deploy safeguards.
- GitHub Actions validates the native workflow and composite action definitions when the CI PR runs.
- Inspect the full unit/build result, relevant acceptance suites, and deployment result before merging. Running unrelated browser jobs is not a prerequisite for a focused change unless a shared dependency changed.
- Full manual conformance and report checks remain appropriate for major releases or workflow infrastructure changes.

**Trade-off:** Dependency installation and individual browser builds remain separate in each browser workflow; they are cached but not shared as a single build artifact. A future optimisation could introduce one trusted build-artifact producer, provided it carefully handles PR trust boundaries and provenance.
