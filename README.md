# IA Pathfinder — Hybrid Pathfinder

A responsive companion for IB Mathematics Internal Assessments, designed to help students develop a meaningful investigation from **genuine mathematical decisions and findings**. The finished IA is authored in Word or Google Docs. Pathfinder supports planning, authentic maths records, interpretation and appropriately timed writing advice.

**Live website:** https://chriswalker-afk.github.io/IB-IA-Planning-and-Writing/

## Current release — Phase 3: Documents and handover

**Planning (Phase 2)** uses the original Google Sheet's **32 Planning nodes and 61 routes**, with purposeful branching, feasibility ratings, risk and teacher check-ins, a searchable **51-technique** AI SL / AA SL maths catalogue, and **22 context-filtered prediction nudges**.

**Planning documents and handover (Phase 3)** now support:
- **Download a personalised PDF plan** with readable, conditional student answers and an embedded versioned planning snapshot.
- **Download an editable Word (.docx) plan** with the same answers and its own embedded importable snapshot.
- **Import a previous Pathfinder PDF or Word report** locally, preview differences, and select which earlier Planning fields to merge. Blank current fields are selected by default; conflicting fields are **not**.
- **Direct Planning → IA Studio confirmation** of current aim, course, intended beneficiary, planned first maths and provisional prediction.
- **Preserve actual mathematical work, writing notes and teacher flags** when merging a planning report. Imported documents never imply data were collected or consent was granted.
- **JSON full-project backup and restore** for mathematical steps, notes, and planning across devices.

**How to use and test:** [docs/phase-3.md](docs/phase-3.md)  
**Source coverage:** [docs/coverage.md](docs/coverage.md)  
**Planning design:** [docs/phase-2.md](docs/phase-2.md)

### Important limitation of embedded document data

The importable snapshot records the plan **at the time the PDF or Word report was generated**. Editing paragraphs in Word *afterwards* does **not** automatically update its embedded snapshot. Third-party editors may strip that data. If metadata is missing, Pathfinder attempts only clearly labelled text recovery with explicit student confirmation; scanned PDFs are not reliably supported. Re-enter edits in Pathfinder and export a fresh plan, or restore a JSON backup.

PDF and Word are **planning handovers**, not full records of completed maths. Use the **JSON backup** to transfer the entire IA Studio project.

### IA Studio — Completing still in development

The existing IA Studio prototype supports recording actual mathematics separately from planned techniques, interpreting results and choosing a purposeful next question. Most of the source sheet's full Completing flow and contextual guidance remain scheduled for Phases 4–6. Example investigations are fictional and clearly labelled.

**Safeguards:** A plan is not a result. Predictions are not findings. A teacher question is not an approval. Planning readiness/ease ratings are not IB marks. The site does not invent mathematical evidence, automatically grade IAs, verify external datasets, approve data collection or force a fixed number of calculations.

Browser autosave is **device-local**. No user accounts, cloud sync, default remote OCR or publication of student plans. Avoid uploading personal participant data or restricted information.

## Development

Node 22+ required to build the static site. No server database or hosting backend:

\`\`\`sh
npm install
npm test
npm run build
\`\`\`

The build emits \`dist/\` using esbuild with lazily loaded PDF/Word libraries and a PDF text worker. GitHub Actions validates, builds and deploys \`dist/\` to GitHub Pages.

The original Google Sheet remains the editorial reference; its 24 tabs were captured into versioned read-only JSON snapshots on 14 October 2026. Changes to the Sheet must be reviewed before updating application logic.
