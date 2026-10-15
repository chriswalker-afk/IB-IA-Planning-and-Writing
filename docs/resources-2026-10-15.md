# Tools & tutorials - 15 October 2026

## Delivered experience

One optional resource card at a relevant stage, with a searchable/filterable library accessible through Help, Planning, Completing and the existing I am stuck panel. Opening a guide preserves the current page and mathematical record; returning from a help-origin guide restores the same help topic.

The library has **31 written task guides**; **19** have links to publisher-listed video walkthroughs. Each guide includes when to use it, steps, a check of the output, and what to record or interpret in the student's own IA. Examples and six tab-separated practice pairs are clearly synthetic. Copying practice data is an explicit action and never imports it into the IA project.

The task-specific preferred tool and picture-help choice are UI preferences only. They do not select mathematics, claim data collection, mark stages complete or claim an external document edit. JSON backup/restore preserves them. No third-party embeds, autoplay, analytics, uploaded images or external resource requests are made when the library is opened. External links open a new tab with no referrer and never contain the student's project information.

## Topic inventory

| Area | Written guides |
|---|---|
| Data preparation and graphics | Organise matched data; choose a chart; Sheets scatter; Desmos basics; Desmos tables; summary statistics; distribution plots |
| Association and models | Sheets PMCC; Desmos PMCC using corr; actual-PMCC interpretation; Sheets linear fit; Desmos regression; model/residual checks |
| Image investigations | Import image; calibrate scale; choose visual fit versus recorded coordinates; adjust a curve visually; record contour points; restrict a curve |
| Data sources | Forms and responses; two-way tables; World Bank data; graph digitisation |
| Mathematical tools | Derivatives; definite integrals; normal distribution; binomial distribution; a preselected inference test |
| Communication/access | Save and export figures; report precision; Desmos with JAWS |

The reusable machine-readable catalogue is `src/resources/catalog.js`: exact source/video URLs, publisher, check date, device/account note, video caveat, written fallback and related tasks. Filters operate locally and do not send search text to an external provider.

## Placement and mathematical safeguards

- Planning previews never treat a tentative method as already performed. Non-mathematical stages do not inherit an unrelated active result.
- A selected Pearson method leads to CORREL in Sheets or corr in Desmos, not to a regression imposed just to obtain a coefficient. Interpretation guidance is prioritised only after a completed, recorded result.
- Scatter plots do not automatically recommend a coefficient or regression. A curved scatter does not imply monotonicity or select Spearman.
- A selected regression gets fitting instructions, then output/model checking. The current record, including an explicitly selected earlier result, drives the resource.
- A picture-help choice is explicit. Importing, calibrating, visually fitting and fitting recorded coordinates are different tasks. Desmos does not automatically regress on image pixels. Changed linked work can make calibration relevant again.
- Sampled coordinates remain approximate. Source permissions, perspective distortion, proportional scaling and scale-squared area conversion are explained. Synthetic practice values are not evidence.
- Inference appears contextually only for a selected test with an explicit course/understanding status. Library browsing is always labelled as a preview when not selected; it is not course approval.
- Dismissed cards stay quiet until relevant context changes. Browsing is still available. No watch/reading completion badge claims mathematical understanding.

## Link and video verification

Public publisher pages were checked on **15 October 2026**, using official Google/Desmos documentation and the named educational publishers. Video links generally open the publisher page containing the named video, rather than pretending it is a direct player. The image-import candidate is linked from the University at Albany KNILT teaching page, with an older-interface warning. Dataspire's older recordings and the Automeris older interface are labelled.

**The videos have not been watched end to end for this release.** Captions, current controls, advertisements, region and school-network availability still need teacher preview. A source-page check is not a guarantee that the video will play. The UI states that limitation. No task has a fabricated video, invented duration or a claimed teacher approval. No reviewed video is promised for tasks without one; their written steps remain usable.

For maintenance, review the catalogue's exact URLs on the publisher sites, update `checkedAt`, and distinguish a genuinely removed page from access blocking. Preview video content and captions before changing `status` or `watchedInFull`. Keep dated notes and a written fallback. The catalogue is independent of the original spreadsheet snapshot, which is unchanged.

## Custom recording backlog (not produced)

| Proposed recording | Target | Focus |
|---|---|---|
| Paired data to scatter and PMCC in Sheets | 4-5 minutes | Keep pairs; plot; CORREL; a range error; interpret only own result |
| Import and calibrate a photograph | 3-4 minutes | Origin, reference dimension, proportional scale, perspective |
| Visual fit versus regression | 3-4 minutes | Sliders versus recorded points; state actual fitting procedure |
| From image coordinates to a justified curve | 4-5 minutes | Contour selection, plausible function, regression, domain |
| Check the model, not just R-squared | 3-4 minutes | Residual pattern, sensible behaviour, fit range |
| Graph to useful IA figure | 2-3 minutes | Labels, units, caption, source, saved editable graph |

These are production briefs, not available screen recordings. The corresponding written guides and existing relevant external videos are the current student resources.

## Reproducible checks

`npm test` includes resource catalogue, scope, actual/planned work, tool preference, no unwanted method selection, safe links, local search, migration/backup, dismissal, and ownership regression checks. `scripts/resources-browser.py` adds 14 desktop/phone journeys to the 25 existing conformance/help journeys. The permanent read-only browser workflow runs all three scripts. Tests use synthetic projects, never student work.

## Verified release checks

[GitHub QA run 38674604258](https://github.com/chriswalker-afk/IB-IA-Planning-and-Writing/actions/runs/38674604258) passed **228 unit/regression tests**, the production build and **all 39 Chromium browser journeys** (14 resource, 15 help and 10 conformance journeys). The release adds 34 resource/UI regressions. No page-script errors were recorded. Desktop and 360px/390px phone screenshots were visually inspected.

The browser checks cover first-click guide navigation after searching, local filtering/pagination, the selected tool, picture workflows, actual-result interpretation, C96/help origins, safe returns, dismissal, keyboard focus, practice copying, no automatic external requests and a full JSON download/reimport. A duplicate change event after search was corrected so it no longer replaces the guide button while a student is clicking it.

Validated application revision: `db68069086d2cda743a1b94010ab8ca5c8a16e40`. All 17 implementation/documentation/test files were byte-compared with the validated source artifact before release. Only this verification section and the permanent read-only browser workflow are added after that check. Temporary transfer payloads and the temporary QA workflow are not published to main.

Browser checks ran on the repository's GitHub Actions runner because the local managed browser does not permit localhost navigation. These are targeted synthetic checks, not a full accessibility certification, video-content approval, cross-browser guarantee or evidence of student mathematical understanding.
