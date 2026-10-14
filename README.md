# IA Pathfinder — Hybrid Pathfinder

A responsive companion that helps IB Mathematics students **plan a meaningful IA** and build their investigation from their own mathematical findings. Students write the finished IA in Word or Google Docs; Pathfinder holds decisions, prompts and short student-authored working notes.

**Website:** https://chriswalker-afk.github.io/IB-IA-Planning-and-Writing/

## Current release: Phase 2 — Planning

Planning now follows the Google Sheet's **32 source-linked Planning nodes and 61 defined routes**, replacing the earlier fixed ten-step walkthrough. Each student sees only the questions relevant to their pathway.

- Ideas, optional comparison, investigation aims, intended usefulness and beneficiaries
- Statistics, modelling or theoretical/no-data routes
- Primary/secondary/combined evidence planning; combined sources require both question sets
- Separate data readiness and practical completion-ease ratings (not IA grade predictions)
- Permissions, ethics, practical dependencies, deadlines and teacher checkpoints
- Searchable, multiple-selection **AI SL / AA SL** maths menu with **51 techniques**
- **22 conditional predictions** and separate WHY / IF TRUE implications
- Optional mathematics review after prediction, purposeful first diagram/calculation, contingency
- Personalised, readable working report, JSON backups, autosave and desktop/mobile journey map

**Phase 2 notes and review paths:** [docs/phase-2.md](docs/phase-2.md)  
**Complete source audit:** [docs/coverage.md](docs/coverage.md)

### IA Studio — currently an exploratory prototype

Completing has a functioning illustrative cycle: purposeful mathematics → actual result → interpretation → next mathematical question. The remaining C-node workflow and many contextual advice libraries are still planned for Phases 4–6. Sample results are fictional and labelled as such.

### Important distinctions

A planned technique is **not** a result. A prediction is **not** a finding. A teacher consultation flag is **not** approval. The site does **not** grade IAs, invent results, approve data collection or require a fixed number of mathematical sections.

Source-listed mathematics are *possible planning options* for AI SL and AA SL, not an independent certification against future syllabus changes. Other/HL courses receive a teacher-check pathway.

The printable report can be saved as a PDF, but it is not yet a structured PDF/DOCX handover: **Phase 3** will implement robust document reimport. **Use the JSON backup** for safe project restoration. Browser autosave is local to the device; there is no account or cross-device syncing. Avoid entering sensitive participant data or restricted personal information.

## Development

Static HTML, CSS and JavaScript ES modules; no external application framework, analytics or account system. No package install required:

- Open the website or serve the project with a local HTTP server.
- Run \`npm test\` on Node 22+ for pure routing, source coverage and simulated UI tests.
- GitHub Actions validates tests and deploys GitHub Pages.

The source Google Sheet was captured into 24 versioned read-only JSON snapshots on 14 October 2026. The original Sheet remains the editorial reference; edits to that Sheet should be intentionally re-imported and reviewed before changing runtime rules.
