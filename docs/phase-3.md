# Phase 3 — Personalised planning documents and handover

**Implementation:** 14 October 2026 · **Status:** deployed and verified by automated tests.

**Website:** https://chriswalker-afk.github.io/IB-IA-Planning-and-Writing/

## What Phase 3 adds

The Phase 2 Planning journey now produces **two genuinely importable document formats**, both grounded in the same structured planning record:

- **PDF (default)**: a paginated, readable planning report generated in the browser with \`pdf-lib\`. A versioned \`ia-pathfinder-plan.json\` document attachment supports structured reimport.
- **Editable Word (.docx)**: the same conditional sections and student responses, generated with \`docx\`; a versioned custom XML part \`customXml/iaPathfinderPlan.xml\` supports structured reimport.
- **Original local JSON project backups** continue to work and remain the appropriate method to transfer *the entire working project*, including actual mathematical steps and IA Studio writing notes.
- **Direct Planning → Completing handover**: students can open IA Studio without a document round trip. A voluntary confirmation screen asks them to review their present aim, course, beneficiary and intended use, tentative prediction and planned first mathematical action. It does not block exploration.
- **Import a report (.pdf or .docx)** from Home, Save & export, the working report or IA Studio. Reads files locally, prioritising the embedded Pathfinder data. No account, cloud upload or third-party OCR.
- **Field-level review and conflict resolution**: displays imported vs currently saved answers, groups by question/feasibility/mathematics/timeline/teacher issues; defaults to selecting only missing answers, with options to select all, clear or choose individually. Only selected Planning fields change after confirmation.
- **Partial recovery**: if embedded data is missing but selectable, clearly labelled text is present, attempts a conservative field-only recovery and requests review. Scanned/image-only documents, corrupted files and unsupported exports receive manual-entry/JSON alternatives without erasing current work.
- **Historical warnings**: teacher questions, source/safety/consent flags, dates, and the original data-readiness and practical-ease assessments remain explicitly provisional and are never treated as teacher approval or IB IA marks.

## A practical student test

1. Complete a **Statistics → Both data sources → AI SL** Planning journey. Add a clear aim, intended beneficiary, separate WHY and IF TRUE responses, two tentative techniques, source dates, permission status and a teacher question.
2. At the end, use **Download my planning PDF**. Open the downloaded PDF and check that only relevant sections appear; choose **Import a planning document** and upload that same PDF. The website should recognise the snapshot, show its original export date and let you review any differences before applying them.
3. Repeat with **Download editable Word plan**. Open it in Word and confirm the document is readable and editable. Upload the original downloaded DOCX; it should restore the same planning answers.
4. **Conflict test:** change the aim in Pathfinder *after export*. Import the older document and check that the more recent aim is **not** selected by default. Select only one older answer and apply it; your newer aim should remain.
5. **Progress preservation:** enter a real mathematical result and a note in IA Studio. Import an earlier plan and confirm the actual result and student-authored note remain unchanged.
6. **Teacher flag:** export a plan with permissions unresolved. Reimport it; the interface should show teacher flags and must never infer that consent was granted.
7. **Start with no plan:** open IA Studio and choose *Review or update my plan*. A student can enter a compact aim/course/beneficiary even without a previously exported document.
8. **Portability:** download a full .json project backup, reopen it on another device/browser, and check that mathematical steps, history and notes restore. PDF/DOCX is intentionally planning-only.

## What the report includes

Sections appear only when applicable: aim and personal engagement; intended beneficiary and possible use; course, mathematics and suitability considerations; tentative prediction and the separate WHY / IF TRUE implication; appropriate primary and/or secondary source plan; theoretical starting material without irrelevant sampling prompts; anticipated limitations and method alternatives; historical feasibility ratings; dependencies, resources, permissions, fallback; first graph/calculation/simplified case and mathematical purpose; intended accuracy; milestones and relevant teacher questions.

Reports are **provisional documents**, not a substitute for the student’s own IA and not a predicted IA grade. The source Plan's optional label is student-chosen; personal participant information is never required.

## What *does not* import automatically

**Word or PDF content edited after export:** the embedded snapshot represents the plan **as it existed when exported**. Edits to the document's visible paragraphs or headings, including edits in Word, are **not automatically merged** into the embedded data. Third-party services can also strip the metadata. Importing the unchanged original PDF/Word restores the exported snapshot; when metadata is gone, the site attempts only cautious labelled-text recovery. Students must confirm any changes, or edit them directly in Pathfinder before generating a new report.

**Arbitrary PDFs or scanned copies:** unsupported. No OCR service. A scanned PDF has no reliable labelled text and will lead to manual recovery.

**Completed mathematics and IA Studio progress:** documents here store **Planning** only. The .json full project backup restores the complete state.

**Permission and teacher approval:** a document is not evidence that a teacher has signed off consent, safeguarding or mathematical suitability. Such conditions must be confirmed separately.

**Cloud sync:** local browser storage only; downloading an export does not publish or synchronise anything.

## Technical design and provenance

- \`src/handover/schema.js\`: strict report kind/version, sanitised import, planning-only data model, field-by-field diff and safe merge.
- \`src/handover/report-model.js\`: single conditional, student-facing document content used by both renderers.
- \`src/handover/formats/pdf.js\`: PDF with attached JSON and local attachment import.
- \`src/handover/formats/docx.js\`: editable Word with custom XML embedded payload and local XML read.
- \`src/handover/read-document.js\`: guarded local upload; embedded first, conservative labelled fallback second.
- \`src/ui/handover-views.js\`: accessible review/merge and direct-start confirmation.
- \`scripts/build.mjs\`: reproducible esbuild static build, lazy-loaded document libraries and local PDF.js worker.
- \`tests/handover.test.js\`, \`tests/handover-ui.test.js\` and \`tests/ui-smoke.test.js\`: roundtrip, fail-safe, conflict, escaping and migration checks.
- \`docs/coverage.csv\`: exact source sheet/row mapping with Phase 3 implemented/partial statuses.

The original Google Sheet remains untouched, and no document is uploaded to a server as part of the handover.

## Deferred

- **Phase 4:** the entire Completing IA flow, including actual results, interpretation, repeatable next mathematical questions and all C-node pathways.
- **Phase 5:** fuller contextual writing, accuracy, out-of-syllabus mathematical understanding and limitations.
- **Phase 6:** teacher-draft and final-review criteria with classroom acceptance testing.
- Future editorial improvement: stronger prioritisation of risks/action lists, compact timetable formatting and additional unsupported/edited document recovery cases. These remain marked partial in the coverage register rather than counted as complete.

## Validation and release

The GitHub Actions workflow **Validate IA Pathfinder** installs pinned libraries, runs all Node automated tests, and builds the browser distribution. The **Deploy IA Pathfinder** workflow validates again, builds the \`dist/\` output, and uploads only that tested bundle to GitHub Pages.

To build locally with Node 22+: \`npm install && npm test && npm run build\`.

The exported reports were verified programmatically for PDF structure/embedded attachment, DOCX package/Word XML and custom part, and successful import round-trips. Visual document review with long real student answers should be part of Phase 6 classroom testing, as individual document lengths can vary.
