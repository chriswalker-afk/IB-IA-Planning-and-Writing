# Illustrative student investigations — Pass 2

Pass 2 completes the three remaining statistics briefs: **paper-helicopter groups**, **revision-format preferences**, and **coffee-grinder dose reliability**. Together with standing reach and tray optimisation, the public picker contains **five complete fictional investigations**. The other 11 pathways remain editorial briefs for later authoring passes.

This is the illustrative-sample authoring pass described in [Pass 1](illustrative-samples-pass1-2026-10-22.md), separate from the repository's earlier cleanup and representation passes. The [current field contract](illustrative-sample-field-contract.md) continues to define the applicable answers, records, optional branches and external claims.

## What constitutes a completed sample

Each new sample has one focused question and one stable constructed dataset. The first-person student answers contain actual mathematical decisions, calculations, interpretations and consequential limitations. The continuous IA reader selects those same answers in narrative order; it does not substitute advice or concatenate every planning and review field.

The complete mathematical record includes editable source data, saved native diagrams and tables, linked mathematical stages, variable and accuracy decisions, source provenance, the three current conclusion answers and specific self-review notes. School dates, consent, teacher responses, marks and authentication are not fabricated. Fields with no truthful applicable selection remain unset, with the actual scope explained in the relevant source or method answer.

The number of stages and figures follows each investigation. There is no common word, page, diagram or calculation quota. Long raw datasets and exhaustive diagnostic calculations stay in the editable project; the narrative uses selected representations that advance the argument.

## Helicopter groups

**Specification:** [`helicopter-groups.js`](../src/core/samples/helicopter-groups.js). **Pathway:** comparing groups. **Intended course:** AI SL.

The investigation asks whether design B offers a useful flight-time gain of at least 0.20 s. The constructed log contains 12 distinct helicopters per design and three elapsed-frame counts per helicopter, at a defined 50 frames per second. One helicopter's three-drop mean is the comparison unit. The 72 readings are never treated as 72 independently constructed helicopters; corresponding A and B row numbers do not imply matched pairs.

The argument develops from individual dots and common-scale box plots to means, medians, spread, an influential-object check, finite-pair counting and a timing-error bound:

- A's mean is 1.86333 s and B's is 2.15333 s, giving a 0.290 s mean advantage, approximately 15.56% of A's mean. The median advantage is 0.26 s.
- B07's three-drop mean is 2.82 s, above the stated Tukey upper fence of 2.72 s. It remains in the main analysis. All 24 one-helicopter omission diagnostics retain a mean advantage above 0.20 s; the minimum is approximately 0.229394 s when B07 is omitted.
- Uniform, independent selection of one mean from each fixed list gives 144 equally likely combinations: 121 strict B wins, three ties and 20 A wins. Exactly 86 combinations, about 59.7%, give B the specified useful gain. This probability concerns selection from the supplied lists; it is not a future-flight success rate.
- A half-frame bound at each endpoint implies a duration error of at most 0.02 s and a B-minus-A difference error of at most 0.04 s. Worst-case errors do not diminish merely by averaging. The full-log mean advantage lies between 0.250 s and 0.330 s under that model, while the useful-pair count can range from 78 to 95 out of 144.
- Combining the B07 omission with the adverse timing shift lowers the mean gain to approximately 0.189394 s. The sample therefore explains why two separately reassuring sensitivity checks need not preserve the practical criterion when combined.

The conclusion prefers B for mean performance within the fixed scenario while retaining the limits on individual advantages and transfer to real objects. A population significance test is not added to a question defined on a finite constructed log.

## Revision-format preferences

**Specification:** [`revision-formats.js`](../src/core/samples/revision-formats.js). **Pathway:** categorical association. **Intended course:** AI SL.

The fixed constructed table compares Years 11, 12 and 13 with three exclusive first-choice revision formats: worked-example videos, self-marking quizzes and extended exam problems. The row totals are 60, 80 and 100, respectively:

| Year group | Videos | Quizzes | Exam problems | Total |
| --- | ---: | ---: | ---: | ---: |
| Year 11 | 27 | 18 | 15 | 60 |
| Year 12 | 24 | 24 | 32 | 80 |
| Year 13 | 19 | 31 | 50 | 100 |
| Total | 70 | 73 | 97 | 240 |

The sample uses within-year percentages before comparing preferences, so the unequal row totals cannot create a misleading raw-count comparison. A native 100% stacked bar chart preserves those denominators. The statistical argument states its hypotheses and significance rule before the test, calculates expected counts and contributions, then examines what the association would mean for an actual format decision.

All expected counts are at least 17.5. The chi-squared statistic is approximately 14.543302 with four degrees of freedom and a right-tail p-value of approximately 0.00574850. Under the explicitly stated independence model, the decision at 5% is rejection. The constructed records do not establish an association in a real school population.

Almost all of the statistic comes from the outer video/problem cells. The practical comparison is more restrained: choosing each year's modal format matches 109 of 240 recorded preferences, compared with 97 of 240 for the single overall modal format. The gain is only five percentage points, and many preferences remain unmatched. The sample therefore does not use statistical significance as a justification for assigning every student in a year one revision format.

The sensitivity analysis checks all 18 possible single-response category corrections. Each retains the 5% test decision, with p-values approximately 0.00253–0.01215. A separately stated four-record Year 11 video-to-problem correction crosses 0.05. This is a conditional correction scenario, not evidence that four responses were actually misclassified.

## Coffee-grinder dose reliability

**Specification:** [`grinder-reliability.js`](../src/core/samples/grinder-reliability.js). **Pathway:** distribution and variation. **Intended course:** AI SL.

The investigation uses 60 ordered constructed dose masses from one fixed-setting scenario. It defines an 18 g target, an inclusive 17.70–18.30 g tolerance band and a 95% reliability criterion before judging the counts. Trial order is retained rather than discarded when the values are sorted for distribution calculations.

The mean is approximately 18.17233 g, the sample standard deviation is 0.196368 g, and 45 of 60 recorded doses fall inside the tolerance. The ordered plot and block means show an apparent order pattern; the constructed sequence cannot establish physical drift. A fitted pooled normal distribution is therefore treated as a conditional comparison, not evidence of a stable, independent physical dosing process. Its predicted in-band proportion is approximately 73.412%.

The sample separates centring from consistency. Translating the existing masses to have mean 18 g leaves their spread unchanged and places 51 of 60 inside the band; the corresponding centred-normal probability is approximately 87.342%. A stronger exact argument then shows that **no translation of this fixed set can achieve 57 of 60**: its shortest sorted window containing 57 values is 0.69 g wide, larger than the 0.60 g tolerance width.

Under a centred normal scenario, achieving 95% in-band probability requires a standard deviation no greater than approximately 0.153064 g. A hypothetical standard deviation of 0.15 g gives approximately 95.450%; a hypothetical 0.05 g mean offset reduces that to approximately 94.239%. These are modelled requirements, not claims about an untested grinder adjustment or a newly collected dataset.

The conclusion therefore identifies spread reduction and stability checks as necessary parts of a future physical investigation. The source recipe is disclosed so that constructing normal-like values cannot masquerade as independent evidence validating a normal model. Recording resolution is kept separate from balance calibration and accuracy.

## Integration and regression checks

The three specifications join the existing authored-sample registry in pathway order. The same state assembly supplies the fields, continuous reader, PDF, Word document and project backups. There is no parallel canned narrative to become inconsistent with edited answers. Earlier sample IDs and ordinary project workflows remain supported.

Review of the new statistical figures exposed a presentation omission: their saved figure numbers were absent from the native SVG. The statistical renderer now displays the supplied number above the title, so references such as “Figure 2” remain identifiable in the reader and image-based exports. Blank numbers remain optional, and label escaping is preserved. The figure-number regression test covers the visible label, an already-prefixed number, a blank number and escaped input.

The dot-plot description now refers to supplied values rather than assuming that every input was physically measured. Graph legends identify theoretical inputs as calculated or constructed points, so the grinder's probability calculations are not labelled as observed doses. Source records retain every applicable method, model and limitation answer when a student reselects a source. All five completed investigations explicitly identify their working draft as ready, and their provisional timelines remain separate from absent school-confirmed dates.

Visual review also improved the helicopter summary table and transition wording, shortened the revision chart's source label so it is fully visible, and corrected a PDF pagination defect. A PDF section heading now reserves room for two opening prose lines instead of being left alone at the bottom of a page. The browser export check rejects an orphan section heading.

The shared reference-sample tests explicitly require the five completed IDs and preserve the 16-pathway brief catalogue. They check field preservation, valid outcomes and links, current conclusion fields, equation rendering, figure placement and source-data restoration. Separate mathematics tests recompute each new investigation's numerical claims from its raw inputs and verify relevant figure data.

Browser acceptance now derives each registered sample's actual stage, equation and figure counts instead of assuming the two pilots' common five-stage/six-figure shape. It checks every registered sample on desktop and phone, the current Planning and Writing answers, all mathematical stages, Checking, continuous-reader equations, every saved figure, and PDF/Word exports. It edits a figure through every native editor used by the sample and checks the owning-stage return and saved edit after reload. Desktop cases also restore the complete JSON backup through the real import UI in a separate disposable profile. The original personal project remains unchanged throughout sample exploration, switching and exit.

The sample browser jobs have a 30-minute limit to accommodate five complete sets of exports and backup imports; the other conformance groups retain their existing limits. The dedicated sample workflow waits for its local HTTP server before starting. Optional `IA_QA_SAMPLES` selects registered IDs for a focused rerun; its default still checks all five. Download diagnostics identify the file, elapsed time, save status and export notification so that a timeout is actionable. The checks themselves remain enabled. Browser capture uses the site's reduced-motion mode and waits for font readiness, preventing drawer transitions and scrolling from shifting a figure during a screenshot.

Repeated export diagnostics identified a real slowdown in equation rasterisation: Chromium sometimes delayed each `canvas.toBlob` callback by approximately one second. The grinder document has 124 distinct equation renderings, so accumulated encoding waits could exceed the download timeout despite correct image loads and calculations. Equation export now encodes canvases up to one megapixel directly as PNG data; larger user formulas and native figures retain asynchronous encoding. Every formula in the five samples is below 0.43 megapixels. The same image dimensions, transparency and cache are preserved. A regression test supplies an idle callback that never fires, checks the resulting PNG bytes and dimensions, and verifies that an encoding failure releases its object URL and permits a retry.

### Verification record

The verification covers the actual saved specifications and exports:

- The production build succeeds and all **89 Node test files pass**.
- Each new investigation has nine substantive mathematics tests that recompute its claims from the source records. The shared tests cover all five completed IDs and all 16 pathway briefs.
- Desktop (1440 px) and phone (390 px) workflows cover all five samples, including native figure edits, reloads, conclusion fields and preservation of the personal project. All five complete backups were restored through the actual JSON import UI.
- The reader checks cover 663 mathematical expressions and 30 saved native figures across the five samples. The three new investigations contribute 18 of those figures.
- Every page of each new sample's final PDF and rendered Word document was inspected at reading size: helicopter **17 PDF / 19 Word**, revision **16 PDF / 18 Word**, and grinder **18 PDF / 19 Word**. These are observed pagination counts, not writing targets.
- All 18 new figures were also inspected in the desktop reader and settled phone captures. The earlier screenshot crops disappeared when animation and scrolling were stabilized.
- The three layout-review records were marked checked only after that inspection. Teacher feedback, school-format approval and authentication remain unrecorded.
- Three fresh-context grinder PDF/Word runs also passed with an extra one-second delay imposed on every remaining asynchronous canvas encoding. The corrected equation path uses no idle callbacks for the 124 distinct formulas. All 18 resulting PDF pages were pixel-identical to the reviewed version; the Word document body and all 132 embedded images were unchanged.

The final automated suite and export-regression outcomes are recorded with the associated pull request and GitHub Actions runs.

## Remaining authoring

The next groups remain:

1. Functions and modelling: stopping distance, cooling, tides and ball clearance.
2. Geometry and decisions: leaf area, inaccessible height, water stations and repayments.
3. Probability and reasoning: stop-on-gold, consecutive sums and square-root iteration.

Each brief still needs its own settled mathematics, complete student answers, purposeful editable figures and the same content, behaviour and export checks before appearing in the public picker.
