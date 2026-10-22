# Pass 1 — Source-node register (22 October 2026)

Source: current `src/planning/route-table.js`, `src/planning/engine.js`, `src/ui/planning-views.js`, `src/completing/catalog.js`, `src/completing/views.js` on the Pass 1 audit branch.

This is a complete **code-declared** screen register, not an assertion that every implemented view can be reached in an ordinary user journey. A retained source node may be a compatibility route. For dynamic import and unused-module candidates run `npm run audit:screens`.

## Planning: 35 source/view/legacy identifiers

| Node | Disposition | Redirect target | Renderer exists |
| --- | --- | --- | --- |
| N00 | Implemented view | — | yes |
| N00B | Implemented view | — | yes |
| N00C | Implemented view | — | yes |
| N01 | Implemented view | — | yes |
| N01P | Implemented view | — | yes |
| N01V | Implemented view | — | yes |
| N02 | Implemented view | — | yes |
| N02M | Implemented view | — | yes |
| N02T | Implemented view | — | yes |
| N02U | Implemented view | — | yes |
| N03 | Implemented view | — | yes |
| N03B | Implemented view | — | yes |
| N03D | Implemented view | — | yes |
| N03E | Redirected legacy | N03D | yes |
| N03F | Redirected legacy | N03D | yes |
| N03G | Redirected legacy | N03D | yes |
| N03H | Implemented view | — | yes |
| N03J | Redirected legacy | N03D | yes |
| N03P | Implemented view | — | yes |
| N03P2 | Implemented view | — | yes |
| N03P3 | Redirected legacy | N03P | no |
| N03R | Implemented view | — | yes |
| N03S | Implemented view | — | yes |
| N04 | Implemented view | — | yes |
| N04M | Redirected legacy | N01P | yes |
| N04R | Redirected legacy | N01P | yes |
| N04S | Implemented view | — | yes |
| N04T | Implemented view | — | yes |
| N05 | Redirected legacy | N06T | yes |
| N05V | Redirected legacy | N06T | yes |
| N06 | Implemented view | — | yes |
| N06E | Redirected legacy | N06T | yes |
| N06T | Implemented view | — | yes |
| N07 | Implemented view | — | yes |
| N08 | Implemented view | — | yes |

## IA Studio: 52 Completing source nodes

| Node | Source label | Disposition | Redirect/owner | Renderer exists |
| --- | --- | --- | --- | --- |
| C00 | Begin / resume Completing the IA | Implemented view | — | yes |
| C01 | Upload planning document / import | Implemented view | — | yes |
| C02 | Review prepopulated project details | Implemented view | — | yes |
| C03 | Check current idea and permissions | Implemented view | — | yes |
| C04 | Where are you in the IA? | Implemented view | — | yes |
| C10 | Introduction · short, personal, revisitable | Implemented view | — | yes |
| C20 | Data collection · methods, sampling, accuracy | Implemented view | — | yes |
| C30 | First purposeful diagram or brief calculation | Implemented view | — | yes |
| C40 | First substantial mathematics | Implemented view | — | yes |
| C50 | Further mathematics · reflect as you go | Implemented view | — | yes |
| C60 | Conclusion · synthesis and what next | Implemented view | — | yes |
| C70 | Clarity, presentation and referencing | Implemented view | — | yes |
| C80 | Draft, teacher feedback and revisions | Implemented view | — | yes |
| C90 | Final self-check and readiness | Implemented view | — | yes |
| C91 | Save a progress snapshot / resume | Implemented view | — | yes |
| C21S | Statistics · population and sampling | Implemented view | — | yes |
| C21M | Modelling · inputs, measurements and testing | Implemented view | — | yes |
| C21T | Theoretical / other route | Implemented view | — | yes |
| C22 | Compare methods → justify choice | Implemented view | — | yes |
| C23 | Collection-stage limitations only | Implemented view | — | yes |
| C24 | Measurement accuracy → reported precision | Implemented view | — | yes |
| C25 | Define terms and name variables meaningfully | Implemented view | — | yes |
| C26 | Data/method record · link back to aim | Implemented view | — | yes |
| C31 | Choose a purposeful FIRST move | Implemented view | — | yes |
| C32 | Before it: purpose and definitions | Implemented view | — | yes |
| C33 | Create + presentation check | Implemented view | — | yes |
| C34 | After it: what do you SEE? | Implemented view | — | yes |
| C35 | Next logical mathematical step · repeat | Implemented view | — | yes |
| C34A | Accuracy of THIS result · if needed | Implemented view | — | yes |
| C34B | Reconnect with aim and prediction | Implemented view | — | yes |
| C34U | Unexpected or unclear? Investigate, don't skip | Implemented view | — | yes |
| C35H | Optional next-step ideas from actual finding | Implemented view | — | yes |
| C61 | Draw together the essential answer | Redirected legacy | C60 | yes |
| C62 | Meaning for the intended beneficiary | Redirected legacy | C60 | yes |
| C63 | What would you investigate next? | Redirected legacy | C60 | yes |
| C64 | Keep the conclusion focused | Redirected legacy | C60 | yes |
| C10E | Compare introductions: optional examples | Shared Examples compatibility | Examples viewer | yes |
| C35B | Bivariate: which observed pattern? | Implemented view | — | yes |
| C40T | Explain technology-assisted mathematics | Implemented view | — | yes |
| C40D | Assess ACTUAL mathematical relevance and depth | Implemented view | — | yes |
| C70N | Notation and mathematical presentation | Implemented view | — | yes |
| C80D | Teacher-draft: complete, criteria, readability | Implemented view | — | yes |
| C90F | Final review A–E and proofreading | Implemented view | — | yes |
| C95 | I'm stuck — what is blocking me? | Contextual help | — | no |
| C95D | No data yet: make progress anyway | Contextual help | — | no |
| C95A | Find and check alternative data sources | Contextual help | — | no |
| C95L | Some data, but incomplete or poor quality | Contextual help | — | no |
| C95Q | Other hiccough: targeted support | Contextual help | — | no |
| C95N | One helpful next action | Contextual help | — | no |
| C96 | Where should I write this? | Implemented view | — | yes |
| C35P | After PMCC: which mathematical step follows? | Implemented view | — | yes |
| C40L | Explain new mathematics · only when relevant | Implemented view | — | yes |

## Global routes and protected modes

- The top-level application routes are `home`, `planning`, `completing`, `checking`, `path` and `report`.
- Seven live diagram generators share the IA Studio tool workspace: Graph, Statistics, Tables, Tracer, Voronoi, Geometry and Probability.
- `revised2029` is a *live in-place assessment option*, not a redundant old page. The A–E criteria remain essential for earlier cohorts and old projects.
- `C95*` are help routes, not retired mathematical stages; `C96` is writing support; `C10E` is redirected through the shared Examples controller.
- `C61`–`C64` Conclusion IDs redirect to `C60` while keeping historic student fields and guidance references.

## How to read this register

**Implemented view** means rendering code still handles the ID; some views may be navigated only by support choices or tests. **Redirected legacy** means the current navigation normalizes the ID; old saved text must still be imported. **Shared Examples compatibility** is an intentional controller interception. **Contextual help** is an optional support journey. **Review** would require investigation before deletion.

Pass 1 removes no code or records. For the scoped risks, testing safeguards and Pass 2 priorities, see `docs/pass1-cleanup-audit-2026-10-22.md`.
