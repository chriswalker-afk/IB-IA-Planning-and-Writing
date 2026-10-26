# Probability Distribution Studio — Pass 5.5 audit ledger

**26 October 2026.** Repository: `chriswalker-afk/IB-IA-Planning-and-Writing`. Baseline: Pass 5.4.4, PR #143, merged into `main`. This is an evidence-led audit and a queue for manageable correction PRs; it is **not** a claim that every browser, screen reader, model or scientific use case has already been verified.

## Principle

The figure must not visually or verbally establish more than the actual mathematics supports. Sensitivity is **hypothetical**, not a fitted model, second dataset, confidence interval, proof of accuracy or completed IA stage. Preserve student-authored records, the original model, editorial choice and clean exported figures. Fix false mathematical claims before cosmetic improvements.

## Findings ranked by risk

| ID | Severity | Evidence from the current implementation | Decision / verification |
| --- | --- | --- | --- |
| **MATH-01** | **High** | `formatDistributionProbability` formatted near-unit numbers to 15 significant digits; `analyzeDistribution` can return `1` by double-precision saturation while a normal, Poisson or binomial omitted tail is still strictly positive. The printed statement could claim certainty. | **Fix in Pass 5.5.1:** independently compute the omitted mass where stable and display `1 − [tail]`; retain ordinary four-place probabilities and all five model types. Test the actual SVG. |
| **VIS-01** | **High** | `distribution-whatif-render.js` sampled continuous normal densities at 420 global x-positions. On a shared range spanning widely separated means, the step can exceed many standard deviations and miss both peaks entirely. | **Fix in Pass 5.5.1:** retain shared axes, add locally concentrated normal samples around *each* mean, and explicitly flag when a curve is narrower than the shared-scale visual resolution. Assert SVG peak visibility and an accessible warning. |
| **MATH-02** | **Medium–high** | Count event boundaries were accepted with `Number.isInteger` even beyond JavaScript's safe integer range; such entries cannot represent exact discrete counts. | **Fix in Pass 5.5.1:** require safely representable integers for Poisson/binomial event boundaries; prevent an unsafe-precision loop when computing an omitted Poisson interval. |
| **ACC-01** | **Medium** | The What-if summary is an `aria-live="polite"` region regenerated on each parameter input. Frequent slider changes could announce too much content to assistive-technology users. Keyboard help and focus should be reviewed with a screen reader, not only DOM tests. | **Pass 5.5.2:** narrow announcements to a succinct status; review sliders, visual legends, keyboard/focus/disclosures and 320/390px mobile. |
| **UI-01** | **Medium** | `figureNumber` and `caption` are editable under figure appearance, but the SVG generator deliberately prints the title, axes and chosen mathematical labels, not an automatic caption or number. | **Pass 5.5.2:** make the figure-number/caption destination clear to students; avoid unneeded text inside the diagram. |
| **PROV-01** | **Medium** | Applying changed parameters to a model classified as primary/secondary requires acknowledgement and reclassifies it as assumed theoretical; saved originals remain untouched until explicitly saved. Models with unconfirmed source remain marked unconfirmed. | **Pass 5.5.3:** test all four provenance choices, source metadata, saved-figure revisions and consequent `needs-review` flags, including old backups. Avoid claiming hypothetical values came from observed or published data. |
| **NUM-01** | **Medium** | Numerical inverse algorithms handle finite continuous tails, discrete coverage jumps and Poisson support beyond the displayed window, but underflow and extreme quantile/display rounding still require a wider independent numerical grid. | **Pass 5.5.3:** stress normal, binomial, Poisson, uniform and custom discrete edge cases; check requested and achieved coverage independently, particularly near 0/1. |
| **EDU-01** | **Low–medium** | Contextual reflection is editor-only and student-authored. The existing Sparks, Insight Threads, Maths Workshop and `I am stuck` share stage context without creating a new result. | **Pass 5.5.4:** scenario walkthroughs for AA/AI SL and HL, primary/secondary/theoretical models, fixed event vs fixed target and first/later mathematical stages. Verify the questions are useful, not repetitive or grade-promising. |
| **DATA-01** | **Low–medium** | The canonical project normalizer preserves the editor's inverse and What-if query separately from saved figure drafts; existing tests cover JSON round trips and SVG/PNG separation. | **Pass 5.5.3:** expand corruption/truncation, legacy-version, saving and restoration tests; always preserve existing student writing, notes and linked references. |

## Completed checks already present in the codebase

- Five model families: normal, binomial, Poisson, continuous uniform and custom discrete; source and model validation are shared by figure and model comparisons.
- Pass 5.1 inverse engine is reused by inverse controls and the fixed-probability What-if comparison. Discrete cut-offs report *achieved* rather than presumed exact coverage.
- A fixed-event comparison retains the same mathematical event; a fixed-target comparison independently solves the boundaries for the two models. A combined parameter change is labelled as a scenario, not a single-parameter derivative.
- What-if editors, comparison charts and reflection guidance are not exported as IA figures; parameter application is an explicit action.
- Existing functional and Playwright acceptance tests exercise desktop, 390px and 320px controls, exports and writing links. This ledger's *pending* items need additional targeted checks, not assumptions of perfect coverage.

## Implementation schedule

1. **Pass 5.5.1 — Mathematical display fidelity (this PR).** Correct near-certainty statements, unresolved normal peaks on shared scales and unsafe integer boundaries. Add pure mathematics, export and browser tests covering all five models and original drafts. Run the entire GitHub Actions suite before merging.
2. **Pass 5.5.2 — Accessibility and presentation.** Targeted screen-reader/status and keyboard review, no loss of focus while manipulating controls; 320px/390px layouts, long equations, title/caption guidance and monochrome legibility.
3. **Pass 5.5.3 — Numerical, provenance and restoration stress audit.** Boundary extremes, rare-event tails and inverse probability accuracy; all source classifications, review flags, saved model comparisons, backups, SVG/PNG separation and legacy recovery.
4. **Pass 5.5.4 — Educational integration and final release regression.** Follow representative IA pathways through Planning → Distribution Studio → interpretation → Sparks / Insight Threads / Maths Workshop / I am stuck; refine only repeated or unhelpful advice. Final issue register and stop/go recommendation.

Do not introduce universal sensitivity scores, automated IA paragraphs, inferred empirical support or additional calculators during this audit. A separate PR is appropriate for each correction cluster so failed browser checks can be diagnosed without disturbing completed mathematics or student data.

## Pass 5.5.2 — Accessibility/presentation corrections (PR #145)

The changes address **ACC-01** and **UI-01** without changing distribution mathematics:

- **Short announcements:** the changing validation summary, inverse result and What-if summary are no longer live regions. A single persistent, visually hidden polite status message announces deliberate/committed changes, invalid models or explicit inverse calculations. This avoids re-reading all metrics, reflection prompts and guidance on each slider input.
- **Keyboard and focus:** changing distribution dropdowns/checkboxes retains focus after the editor redraws; start/reset/discard comparisons and applied inverse results return focus appropriately; enlarged preview and wide comparison region support keyboard horizontal scrolling, with a visible focus outline.
- **Touch and narrow screens:** boundary nudges and the what-if slider have 44px targets; the SVG boundary has a 44px transparent hit stroke; the 320px boundary-grid typo is corrected. Long numerical equations continue to wrap inside their panels.
- **Non-colour encoding:** monochrome discrete **exports** use the same hatched selected-probability pattern as continuous shading, with stronger borders. Editor-only discrete comparison graphs distinguish hatched/dashed original bars from solid alternatives. SVG descriptions explain axes and the encoded model rather than relying only on colours.
- **Figure metadata:** IA figure number and caption fields now explicitly state that they are for the external figure label/source handover, **not** embedded in the SVG/PNG. The existing figure-label generator and original metadata are preserved.
- **Regression evidence:** pure tests exercise all five models, inverse and fixed-event/fixed-target announcements, source metadata/backup preservation, clean exports and mono patterns. Playwright journeys check desktop/390px/320px focus, scroll, committed announcements, 44px targets and SVG/PNG.

**Remaining manual verification:** keyboard-only walkthroughs and a real screen-reader session (NVDA, VoiceOver or equivalent) are still recommended before declaring WCAG conformance. Automated markup and browser tests do not independently establish screen-reader usability. Keep any further accessibility changes in a targeted follow-up rather than claiming certification.

## Pass 5.5.3 — numerical, provenance and restoration stress results

**Scope:** fixes **NUM-01**, **PROV-01** and **DATA-01** without introducing a new distribution, editing saved student conclusions or silently adding mathematical evidence.

1. **Tail-aware inverse results.** Retain the *independently calculated* unselected probability in the inverse result, including normal and Poisson upper tails and exact supported discrete complements. The inverse calculator, fixed-target What-if comparison and concise assistive announcements print `1 − [tail]` when the internally rounded coverage appears to be one but a genuine positive tail remains. Reject an extremely small normal/uniform target that cannot be represented numerically at the chosen parameter scale. A discrete coverage tolerance now scales to the requested probability, rather than treating a 1e-200 target as equivalent to zero.
2. **Rare event display.** If a normal, binomial or positive-rate Poisson event has mathematically positive support but its computed probability underflows to zero (or its complementary probability underflows to zero), the printed SVG uses `≈ 0` or `≈ 1` rather than making an impossible/certain statement. Editor-only guidance explains the precision limit, without changing the stored input, theoretical event or numerical engine.
3. **Appropriate completed-stage review flags.** Compare only *active distribution parameters*, event thresholds, variable/unit, assumptions and source classification/reference when deciding whether to flag an existing completed mathematical result. Cosmetic title, caption, figure number, print style, markers and sizing do not mark a mathematical conclusion as invalid. Genuine changes still flag the affected stage as `needs-review`; the student's text remains unedited.
4. **Historical/corrupt editor restoration.** An unsupported legacy central inverse mode on a discrete restored draft is returned to a safe idle left-tail setting; old saved figures and writing survive. Invalid, truncated and unsupported-version JSON uploads are rejected *before* replacing a student's active project.
5. **Evidence:** a pure test grid checks rare normal/Poisson/binomial/uniform/custom cut-offs, complementary coverage, all four provenance types, linked review flags, version 1 and 2 backups and clean SVG separation. Playwright runs at 1440/390/320px inspect saved/source parameters, inverse and What-if display, actual SVG export, cancelled source changes and JSON import failure/restore; existing PNG/browser export checks remain enabled.

**Follow-up:** Very small normal/Poisson tails below double-precision resolution are *not* claimed as exact measurements or proof of model fit; descriptions remain approximate. Actual NVDA/VoiceOver checks remain a manual accessibility task after 5.5.2. Pass 5.5.4 should review realistic IB AA/AI IA writing journeys and the usefulness and relevance of contextual support, then prepare the final quality register.


## Pass 5.5.4 — educational integration and final regression

**Issue EDU-01: addressed in the final audit PR.** The goal is a defensible *student journey*, not a machine-generated IA, a predicted grade or a declaration that a distribution is suitable for every course.

### Evidence and corrections

1. **Student pathway checks.** A new \`tests/distribution-pass5-5-4.test.js\` exercises the complete cross-product of AI SL, AA SL and AA HL; normal, binomial, Poisson, uniform and custom discrete models; fixed-event and fixed-target comparisons; primary, secondary, assumed and uncertain provenance; and first/later mathematics. These are realistic illustrative scenarios, *not* syllabus-membership or likely-grade claims. A Playwright journey checks chosen Planning question, model editing, contextual guidance, What-if, help, Maths Workshop and return to the existing student's interpretation at 1440, 390 and 320 pixels.
2. **Repair guidance drift.** The guidance previously used the *entire figure presentation signature* to warn that a linked model had changed, despite Pass 5.5.3 only flagging changed mathematical meaning. It now uses the exact same \`distributionInterpretationSignature\` as the saved-stage review rule: captions, colour and figure numbers no longer trigger a false mathematical revision warning; changed model parameters, event, assumptions, source or units still do.
3. **Fixed-target explanatory accuracy.** When comparing two hypothetical inverse cut-offs with no shaded original event, the writing guidance now explicitly distinguishes the requested/achieved target from a region actually applied to the IA figure. Existing fixed-event wording is maintained. Both comparisons remain optional and do not auto-write student text.
4. **Non-duplication and authenticity.** The optional three-question reflection remains collapsed until wanted, without a second notes store. The writing bridge returns to the existing first or later mathematical stage and focuses the real interpretation box. Sparks and Insight Threads read existing evidence, Maths Workshop uses registered lessons, and I am stuck offers exactly three targeted recovery choices only for a valid comparison. A proposed alternative never becomes a verified source, completed result, recorded observation or an additional saved figure.
5. **Regression gate.** Run the full repository Node test suite and the existing browser workflows, including distribution exports and mobile checks. Existing backups retain all source details and first-person writing. The clean SVG/PNG figures must exclude editor help, source explanation, hypothetical comparison and auto-generated prose.

### Final issue register and stop/go assessment

| Issue | Disposition | Remaining qualification |
| --- | --- | --- |
| MATH-01, VIS-01, MATH-02 | Addressed in 5.5.1 | Students still need to justify the modelling assumptions and chart domain. |
| ACC-01, UI-01 | Addressed in 5.5.2 | Manual keyboard-only and NVDA/VoiceOver usability verification remains; automated tests are not WCAG certification. |
| NUM-01, PROV-01, DATA-01 | Addressed in 5.5.3 | Ultra-small tails remain limited by floating-point arithmetic; an export is not scientific validation. |
| EDU-01 | Addressed in 5.5.4 | Real student/teacher usability trials and actual course-level mathematical judgement remain essential. |

**Release recommendation:** *Conditional go* after every applicable GitHub Actions check succeeds and the branch merges. No blocking automated audit issue is known within the stated test scope; do not describe this as an independently validated scientific model, guaranteed IB outcome or certified accessibility. In a supervised classroom pilot, confirm that learners can justify a source, choose and interpret an event, identify an honest limitation, and find the existing writing stage without being led to paste generated prose. Any genuine pilot issue should be a separate tracked fix, rather than expanding this final audit indefinitely.
