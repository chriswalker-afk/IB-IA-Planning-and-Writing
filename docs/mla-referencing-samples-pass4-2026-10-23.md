# MLA referencing in the illustrative IAs — Pass 4 (23 October 2026)

## Scope and approach

The **13 complete fictional IA samples** now demonstrate the same MLA citation method as the student-facing Planning, Writing and Checking guidance. The route catalogue contains 16 mathematical pathways, but only 13 currently have complete authored sample IAs; the other three are briefs, not full IAs. Neither the unfinished briefs nor the older five short demonstrations are presented as externally referenced investigations.

The goal is **credible scholarly attribution in a continuous student narrative**, not an artificial requirement to cite every syllabus formula. All fictitious datasets, coordinate lists, experimental-looking measurements, probability scenarios and generated diagrams remain explicitly labelled as constructed teaching material.

## Outside sources audited

Existing references were checked against the actual publisher pages (23 October 2026). The canonical references module stores full MLA-style Works Cited entries, source URLs, and matching author–title in-text citation labels.

| Illustrative IA | Actual outside works | Worked referencing |
|---|---:|---|
| Standing reach | 2 | NIST/SEMATECH least squares; Hyndman–Athanasopoulos error measures |
| Paper helicopters | 2 | NIST/SEMATECH measures of scale and box-plot fences |
| Revision-format comparisons | 4 | OpenStax independence test; NIST chi-square distribution and critical values; SciPy function documentation |
| Grinder reliability | 2 | NIST/SEMATECH run-sequence plot and normal model |
| Stopping distance | 2 | NIST/SEMATECH least squares; Hyndman–Athanasopoulos error checking |
| Cooling drink | 2 | NIST/SEMATECH least squares; Hyndman–Athanasopoulos errors |
| Tide-like heights | 3 | NIST/SEMATECH least squares; Hyndman–Athanasopoulos errors; OpenStax cosine identity |
| Ball clearance | 2 | NIST/SEMATECH least squares; Hyndman–Athanasopoulos RMSE |
| Tray optimisation | 0 | Self-contained defined geometry, calculus and tolerances |
| Leaf area | 0 | Authored constructed image, calibration and derived integrations |
| Inaccessible height | 0 | Fictional survey geometry and student-derived sensitivity |
| Water stations | 0 | Fictional coordinates, Voronoi/nearest-distance reasoning |
| Repayment plans | 0 | Fictional monetary offers and derived ledger mathematics |

**Total:** 19 source uses across eight full examples; five genuinely self-contained examples have no external Works Cited. The source registry contains 12 distinct external works. No fake publisher, field experiment, physical observation or fabricated authority has been inserted for constructed inputs.

## Implementation contract

- `src/core/samples/mla-references.js` is the central editorial reference registry and per-sample mapping. Legacy numeric markers such as `[M1]`, `[M2]`, `[D1]`, and the grinder's `[1]`/`[2]` are rewritten for the **authored samples** only. Constructed records are described as constructed examples, never included as published Works Cited.
- The narrative, stage source notes and reference contract are upgraded together in the sample-spec assembly, so source attribution is visible when students explore the **editable Planning and Writing fields**, not just in a separate reader appendix.
- Grinder references, previously confined to metadata, are placed in normal first-person mathematical prose when the run-sequence and normal-model methods are introduced.
- The continuous reader, exported Word and exported PDF use the same source of truth. When actual displayed sample prose cites a canonical outside work, it is included exactly once in the final **Works Cited** section. When a sample has no genuine outside citations, the final section is an honest **Constructed inputs and provenance** note instead.
- MLA works are alphabetically ordered; web references include original URLs, access date and source title. A small “Open original source” hyperlink is available in the reader, with HTTPS, `noopener noreferrer`, and no-referrer protection.
- An editable sample can be revised: removing all displayed references to a cited source removes its Works Cited entry from that sample's next reader/export. This is **not** automatic reference verification of any real student's external IA.
- All original values, mathematical equations, diagram data, audience disclaimers and learner prompts remain intact. The actual default student's work is never modified when browsing or editing a fictional preview.

## Verification

Tests cover all 13 complete works, MLA text ↔ Works Cited matching, a truthful zero-reference case, no leftover numeric author-source tags, secure links, project round trips, source removal after edits, and citation placement in the grinder example. Existing browser acceptance additionally checks the source list within real exported PDF and DOCX files.

## Outside works checked against publisher pages

- NIST/SEMATECH: https://www.itl.nist.gov/div898/handbook/
- Hyndman and Athanasopoulos, *Forecasting: Principles and Practice*: https://otexts.com/fpp3/toolbox.html
- OpenStax, *Introductory Statistics 2e*: https://openstax.org/books/introductory-statistics-2e/pages/11-3-test-of-independence
- OpenStax, *Algebra and Trigonometry 2e*: https://openstax.org/books/algebra-and-trigonometry-2e/pages/9-2-sum-and-difference-identities
- SciPy `chi2_contingency`: https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.contingency.chi2_contingency.html

A working demonstration of MLA is not a finished bibliography for someone else's IA. Students must cite the publications they actually use, consult the original work and verify Google Docs' generated entries.
