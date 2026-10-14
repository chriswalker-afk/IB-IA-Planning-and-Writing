# IA Pathfinder — IB Mathematics IA companion

**Live website:** https://chriswalker-afk.github.io/IB-IA-Planning-and-Writing/

IA Pathfinder is a responsive, browser-local **planning and writing companion** for IB Mathematics Internal Assessments. Students produce the actual IA in Word or Google Docs. Pathfinder helps them plan a meaningful question, make deliberate mathematical choices, interpret *their own* results, and connect one mathematical section naturally to the next.

## Current release: Phase 4 — Completing the IA

The source workbook's **52 Completing nodes and 223 routed decisions** are now represented in a source-linked, navigable IA Studio. The interface has a focused stage dashboard and an honest, repeatable mathematical journey:

1. **Start** from an in-browser plan, a saved Pathfinder PDF/Word planning document, or blank.
2. **Review** the aim, course, intended beneficiary, tentative prediction and outstanding consent/teacher questions.
3. **Confirm** what data, mathematical objects or sources genuinely exist, separately from what was merely planned.
4. **Prepare a first purposeful graph or calculation**, stating its mathematical reason **before** it appears in the actual IA.
5. **Record and interpret the genuine result**, relate it to the aim and initial prediction, and recognise relevant limitations and accuracy.
6. **Choose what mathematical question follows**, justify a suitable method, do new mathematics and interpret the real finding; repeat as useful, or conclude without forcing a calculation quota.
7. **Synthesize** the actual findings for the investigation aim and beneficiary, and revisit communication, teacher draft and final self-check.
8. **Save or transfer** the entire project via JSON backup; local autosave also works on the current browser.

Contextual Pearson / bivariate guidance now requires actual results rather than a technique selected in Planning. Earlier scatter patterns do not leak into unrelated later mathematics. Changing an earlier genuine result can flag **dependent mathematical steps** for explicit review without deleting their student-written results or explanations.

All stage statuses and reviews are student-controlled. There is **no IA mark predictor, fabricated result, automatic teacher approval, or required number of mathematical sections**.

### Earlier phases remain available

- **Phase 2 — Planning:** 32 Planning nodes, 61 source routes, 51 selectable provisional AI SL / AA SL mathematical techniques and 22 contextual prediction nudges. Feasibility and readiness scores are practical planning checks, not grades.
- **Phase 3 — Documents and handover:** personalised PDF and editable Word planning reports, each with an embedded versioned **planning-only** snapshot; local import with explicit field-level comparison; optional direct handover and full-project JSON backup.

**Important:** Word/PDF text changed *after export* does not automatically update its embedded snapshot. Imported planning documents do not contain completed mathematics; for full IA Studio transfer use the JSON backup. No cloud sync, account, server-side OCR or automatic data-source verification is provided.

## Documentation

- [Phase 4: mathematical journey, guardrails and student acceptance scenarios](docs/phase-4.md)
- [Phase 3: export, reimport and safe handover](docs/phase-3.md)
- [Phase 2: Planning](docs/phase-2.md)
- [Line-by-line source coverage](docs/coverage.md)
- [Exact coverage register](docs/coverage.csv)

The original 24-tab Google Sheet, captured on 14 October 2026, remains the editorial reference. **The Completing backbone is implemented, but the more specialist contextual prompts across the workbook are not all implemented yet.** Phase 5 will improve just-in-time guidance, method-specific limitations, accuracy reuse, researched mathematics and writing-cue suppression. Phase 6 will deepen draft/final review and classroom acceptance testing.

## Privacy and educational boundaries

Local browser storage persists work **on one device only**; it is not cloud synchronisation. Student projects and their exports should not contain identifiable participant information or restricted data. Pending privacy/consent and teacher questions must be resolved outside the app before the affected collection or use. Mathematical evidence, interpretation, notation, conclusions and recommendations belong to the student.

## Build and test

Requirements: Node.js 22+.

- Install dependencies: npm install
- Run the automated tests: npm test
- Build the static website: npm run build

GitHub Actions installs pinned document libraries, tests migrations, exports and Completing flows, then deploys the generated dist/ site to GitHub Pages. No application server or database is required.
