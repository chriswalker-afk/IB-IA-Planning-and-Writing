# IA Pathfinder — IB Mathematics IA planning and writing companion

**Live website:** https://chriswalker-afk.github.io/IB-IA-Planning-and-Writing/

IA Pathfinder supports students through the **planning, mathematics, writing and review** of an IB Mathematics Internal Assessment. Students still write their assessed IA in their own Word or Google Docs file. This browser-local companion helps students formulate an authentic aim, identify viable mathematics and evidence, explain mathematical choices, interpret actual findings and reflect appropriately; it never invents results, automatically edits an external document, awards grades or replaces teacher feedback.

## Student journey

1. **Plan:** Start with an idea, compare possible ideas, or explore a branching Idea Lab; develop an aim, motivation, investigation type, evidence and sensible mathematical starting point.
2. **Choose mathematics:** Explore **16 investigative pathways** across statistics, modelling, geometry, optimisation, probability and theoretical work. These are suggestions, not prescribed or automatically selected IA methods. Course-suitability prompts remain cautious.
3. **Write and explore:** Move from an introduction and purposeful first mathematics into repeatable actual mathematical stages. Connect prior findings to the next mathematical question and method, document real calculations, interpret results and conclude with justified limitations and possible extensions.
4. **Seek help:** The Discovery Trail, contextual sparks, optional reduced-advice mode, relevant examples, Writer's Field Guide, criteria pop-ins and searchable **Tools & tutorials**, now featuring an MLA/Google Docs referencing guide with worked examples and short contextual citation reminders in Planning, Writing and figure handovers, provide support without filling the page with compulsory instructions.
5. **Create figures:** Seven integrated generators—**Graph & Model Explorer**, **Statistical Diagram Studio**, **Table Studio**, **Image & Coordinate Tracer**, **Voronoi Studio**, **Geometry & Measurement Studio**, and **Probability Tree Studio**—support editing, saving and relevant insertion into mathematical stages. Supported SVG/PNG figure downloads and full-project reports preserve figure provenance and appropriate mathematical labels.
6. **Review and export:** The Checking journey supports honest evidence-based reflection. **Backups & reports** provides full-project JSON backup/restore, readable working-project PDF, editable Word and a ZIP containing reports plus JSON. These documents are working records, **not a finished or assessed IA**.

### Maths Workshop — Batch 0 pilot

The optional **Maths Workshop** lives in Tools & Tutorials. It includes **26 quick mathematical definitions**, three worked **Show me → Help me → My turn** lessons (mean and standard deviation, Pearson's correlation coefficient, and optimisation by differentiation), technology shortcuts, and learning links for all **16 investigative pathways**. Students can open it from Help, route details and relevant IA Studio method selectors; Reduce Advice keeps the optional inline prompts quiet. Practice is fictional and read-only, never recorded as student work or assigned an IA grade. See [the Batch 0 release notes](docs/maths-workshop-batch-0-2026-10-24.md) for coverage, safety and the Batch 1 backlog.

### Maths Workshop — Data essentials and model evaluation

**Batch 1** extends the searchable glossary with 31 terms and five additional guided lessons on sampling and bias, descriptive distributions, histogram frequency density, two-way proportions and measurement uncertainty. Each has worked mathematics, two checkpoints, independent practice, and optional links to native Statistical Diagram Studio, Table Studio and existing tutorials. **Batch 2** adds relationships and model evaluation. The combined Workshop now has **80 definitions and 13 lessons**. Practice remains fictional and never changes student IA work. See the [Batch 1 coverage notes](docs/maths-workshop-batch-1-2026-10-24.md) and [Batch 2 notes](docs/maths-workshop-batch-2-2026-10-24.md).

### Maths Workshop — Batch 3 functions and calculus

Batch 3 adds **20 definitions** and **five new Show me → Help me → My turn lessons** on quadratics, exponential/logarithmic functions, periodic sine models, derivatives and rates, and definite integration. The Workshop now includes **100 definitions and 18 lessons**, all read-only teaching examples with contextual course cautions. See [Batch 3 notes](docs/maths-workshop-batch-3-2026-10-24.md); Batch 4 will focus on geometry and measurement.

### Maths Workshop — Batch 4: Geometry and measurement

Batch 4 adds **22 glossary definitions** and **five guided geometry lessons**, bringing the optional Workshop to **122 definitions and 23 lessons**. Students can practise calibrated image coordinates, triangulation, composite area and volume, Voronoi nearest-site regions, and measurement sensitivity, with labelled maths, two guided checkpoints, independent practice, contextual IA interpretation and opt-in links to the Image Tracer, Geometry & Measurement Studio and Voronoi Studio. All values are invented for learning; practice never modifies student work. See [Batch 4 notes](docs/maths-workshop-batch-4-2026-10-25.md). **Batch 5** will cover probability, simulation and statistical inference.

### Complete illustrative investigations

The sample picker contains **five complete fictional student investigations**: standing reach, paper-helicopter groups, revision-format preferences, coffee-grinder reliability and tray optimisation. Each uses connected first-person writing, checked mathematics, stated constructed data or assumptions, and editable native figures. The same answers appear in the Planning, Writing and Checking fields and in a continuous IA reader with separate PDF and Word downloads. Samples open in an isolated preview; exploring or editing them does not replace the student's own project.

The [sample field contract](docs/illustrative-sample-field-contract.md) and 16 editorial briefs define the remaining authoring work. [Pass 1](docs/illustrative-samples-pass1-2026-10-22.md) established the first two complete examples and shared architecture; [Pass 2](docs/illustrative-samples-pass2-2026-10-22.md) adds the other three statistics pathways. The remaining **11 briefs are not presented as completed IAs**.

### Save and restore are not the same as report reimport

- **Full-project JSON** is the portable source of truth for complete planning, writing, stage records, diagrams, decisions and review flags, including migration of older saved projects.
- **PDF and Word full-project reports** are readable/editable records for working outside the site; editing them does **not** automatically restore the full project or synchronise an external IA. Existing planning-only document-import routes have their own limited reimport/field-comparison behaviour.
- Work is primarily stored **in the student's own browser/device**; it is not automatically uploaded or cloud-synchronised. Keep regular JSON backups, especially before clearing browser data or changing devices.

## Assessment guidance

The site retains the published **current A–E IA assessment guidance**, including the appropriate SL/HL mathematical criterion, and supports an explicitly separate **2029 assessment-cohort preparation mode** where implemented. The new-cohort material must not silently replace existing assessment advice for current students. Assessment opportunities are guidance, not grading.

## For maintainers

- **Current source:** `index.html`, `app.js`, `src/`, source stylesheets in `styles.css` and `data/*.css`, and original catalogue/flow/sheet JSON under `data/`.
- **Production:** `npm run build` creates `dist/` with a bundled app and ordered/minified stylesheet. Historical `data/catalog/` and `data/sheets/` stay in GitHub but are deliberately **not deployed**. The original `data/flow/` is retained in the deployed site. Source-hosting dependencies remain in the repository for development.
- **Tests:** Node.js 22+, `npm install`, `npm test`, `npm run build`, and `npm run audit:screens` for the screen/dependency register. Browser test scripts under `scripts/` and relevant GitHub Actions verify live journeys, desktop/phone behaviour, mathematical figures, backups and report downloads.
- **CI policy:** The always-on validation checks `npm test` and the production build. Deployment retains an independent release gate. Focused browser suites run for relevant changes; post-deployment report verification is separately retained. Do not make suites disappear merely to improve check times.
- **Browser conformance:** [PR #71](https://github.com/chriswalker-afk/IB-IA-Planning-and-Writing/pull/71) updated older assertions to the current welcome screens, optional panels and mathematical journeys. All 13 broad browser suites run in five independent CI groups; failures retain their artifacts and do not cancel unrelated groups.

## Documentation map

- [Documentation index and archive policy](docs/README.md): current guides, historical design and completed pass notes, with original files and paths retained.
- [Cleanup Passes 1–3](docs/pass1-cleanup-audit-2026-10-22.md), [Pass 2](docs/pass2-cleanup-implementation-2026-10-22.md), [Pass 3](docs/pass3-styles-deployment-2026-10-22.md); [Pass 4 maintenance](docs/pass4-repository-maintenance-2026-10-22.md).
- [Representation integration and all seven studios](docs/representation-integration-pass5-2026-10-22.md), [16 investigative pathways](docs/expanded-applied-mathematical-routes-2026-10-16.md), [Writer's Field Guide](docs/writers-field-guide-2026-10-18.md) and [assessment criteria](docs/essentials-and-criteria-2026-10-15.md).
- [Original source-workbook coverage](docs/coverage.md), [coverage register](docs/coverage.csv), [historical phases](docs/phase-2.md).

### Data and classroom safeguards

Do not record identifiable or restricted participant information without appropriate arrangements. This application does not verify consent, issue teacher approvals, fabricate observations, or provide a substitute for school review. Mathematical limitations should arise from actual evidence and methods—not from a generic checklist.

### Maths Workshop — Batch 5: Probability and inference
Batch 5 adds **34 definitions** and **six guided lessons**, bringing the Workshop to **156 definitions and 29 lessons**. Students practise conditional probability trees, discrete expected values, reproducible simulation, binomial probabilities, normal models and careful statistical inference. Mathematical assumptions, independence, tails, sampling and honest interpretation are central. All examples are fictional and read-only. See [Batch 5 notes](docs/maths-workshop-batch-5-2026-10-25.md). **Batch 6** will focus on finance.

### Maths Workshop — Batch 6: Financial modelling
Batch 6 adds **34 finance definitions**, **six complete guided financial lessons** and **two Google Sheets tutorials**, bringing the Workshop to **190 definitions and 35 lessons**. Topics include compound interest and effective rates, loan repayments, break-even, cash-flow timing, discounted cash flows and sensitivity. Every teaching scenario is fictional, with rate-convention and feasibility checks; practice remains read-only. See [Batch 6 notes](docs/maths-workshop-batch-6-2026-10-25.md). **Batch 7** will cover proof, sequences, iteration and convergence.
