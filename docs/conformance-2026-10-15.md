# Conformance pass - 15 October 2026

This pass addresses findings F01-F07 in the read-only audit of revision `8963894`. It preserves the 24-tab source snapshot, all 84 source nodes, all 284 source routes, the current design and student-authored work. It is not a claim that every one of the 1,430 indexed source/editorial records has passed classroom acceptance.

## Changes and verification map

| Finding | Implemented correction | Regression evidence |
|---|---|---|
| F01 Actual mathematics | One shared authoritative method classifier. An explicit method, including Other, overrides free text. Titles/results never identify performed techniques. Legacy technique-field matching remains conservative. | Negative PMCC titles, explicit normal/Other, genuine and planned PMCC in `tests/conformance.test.js` |
| F02 Curved plots | Unclassified curvature stays unclassified. The student must distinguish monotonic from turning/periodic before rank-association advice. Pairing and PMCC interpretations belong to their own graph/result. | Curved, monotonic, turning, weak PMCC and multiple-graph cases |
| F03 Accuracy | Exact stable IDs; unambiguous legacy migration; multiple input links per result; source-specific quantities; relevant-only wording and downstream review flags. | Length/time speed, unrelated temperature, blank symbols, full JSON and cue-suppression tests |
| F04 Writing helper | A quiet helper control on every Completing screen. C96 reuses the originating stage/result, cue, five actions, note and suppression state; its return restores the work. | No-data, result interpretation, unfamiliar first use, note preservation and restored sessions |
| F05 Draft/final review | D01-D21 are milestone-gated optional checks with original row references, evidence locations, targeted repair/return and separate feedback recorded/implemented/verified states. | Exact source-text mapping, required student evidence, no automatic completion, technology timing, revisions and persistence |
| F06 First-use understanding | A confirmed unfamiliar method receives its explanation cue before any output exists. Ordinary syllabus methods do not receive tutorials; reuse of an introduced concept is not another first use. | Outside, mixed, syllabus, new component and repeat-use tests |
| F07 Source dependencies | Separate saved actual source/method records, explicit many-to-many mathematics links, affected-only downstream flags and preserved original text. Legacy shared sources are labelled for link review. | Independent datasets A/B, candidate-source isolation, migration and source switching |

The main writing helper still never inserts text in Word/Google Docs. A private saved note is distinct from the student's confirmation that they updated their actual IA. Save/export is not readiness, submission, marking or permission.

The readable working record now carries source/accuracy links and review/feedback evidence. PDF/Word exports remain planning-only; the full JSON backup carries the entire working project.

## Verified results

[Pre-publication GitHub QA run](https://github.com/chriswalker-afk/IB-IA-Planning-and-Writing/actions/runs/38667045053): **163 tests passed, production build passed, all 10 Chromium browser journeys passed, no page-script errors**. The validated source revision was `48912af3584ea05a9ed7b27055eb57dd7e50ee6f`. The published application files were byte-compared against that validated source; temporary transfer/workflow files are not part of the release.

The 10 browser journeys cover actual-method identity, unclassified/monotonic/turning curves, multiple precision inputs, independent-source revision, origin-aware writing help, no-data writing help, unfamiliar mathematics before output, targeted review/repair/return, feedback plus downloaded/reimported full JSON backup, and the readable working report. The tests exercise desktop and 390px phone layouts, focus retention on new input-link controls and horizontal overflow. Phone and report screenshots were also inspected. These are targeted browser checks, not a full accessibility certification.

Run `npm test` and `npm run build` to repeat the unit and production checks. The pass adds 39 conformance regressions to the existing 124 Planning, Completing, guidance, report and persistence tests. One earlier geometry-limitation assertion is intentionally tightened: an unrelated saved length is no longer evidence that the current result uses it; the student must link the relevant quantity.

## Repeatable browser acceptance

The reproducible synthetic-project checks are `scripts/conformance-fixtures.mjs` and `scripts/conformance-browser.py`. The read-only **Conformance browser acceptance** workflow runs on pull requests to main or can be started manually in GitHub Actions. It does not change repository files or student projects. Results and screenshots are kept as workflow artifacts for seven days.

Re-run locally with Python Playwright 1.57.0 and its Chromium browser installed:

```sh
npm run build
node scripts/conformance-fixtures.mjs
python -m http.server 8765 --directory dist
# In another terminal:
python scripts/conformance-browser.py
```

`IA_QA_OUTPUT` overrides the default `qa-output` directory; `IA_QA_URL` overrides the local test URL. The synthetic figures/results are test fixtures, never real student findings.

## Scope still requiring professional judgement

No automated test confirms a student's mathematical understanding, actual external document edits, teacher approval, current school deadlines, or every real classroom project. The optional review asks students to inspect their own final file; it does not inspect a Word/PDF they have not supplied. Broader long-document visual QA, other browsers, accessibility auditing and classroom acceptance remain separate work rather than being declared complete by this pass.
