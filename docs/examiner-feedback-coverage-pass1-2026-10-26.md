# Examiner feedback coverage and duplication audit — Pass 1

**Date:** 26 October 2026  
**Scope:** documentation and editorial triage only; no new student-facing controls, no changes to calculations or saved work.  
**Source:** *IB Mathematics IA Examiner Feedback: Actionable Checklist (2021–2026)*, uploaded 21-page synthesis covering AA SL, AI SL and AA HL. The synthesis explicitly says its 392 items are actionable **paraphrases**, not quotations from the examiner reports; 2025 uses source-linked summaries rather than original reports. It is not a substitute for the IB guide, applicable assessment criteria or integrity rules. The source PDF is **not committed** by this pass.

Companion file: [392-recommendation coverage ledger](examiner-feedback-coverage-ledger-2026-10-26.csv). Each EF001–EF392 identifier follows the order of bullet points in the supplied PDF, with section, PDF page, original checklist wording, assigned editorial theme, status, existing code locations and follow-up. IDs are stable **for this source PDF version**, not official IB identifiers.

## How coverage is judged

This is a **source-code and content inventory**, not a claim that the site automatically assesses the student's work or that a live student has mastered the advice.

- **Present:** there is identifiable current site guidance or functionality for this recommendation. Quality in a finished IA must still be checked by a student/teacher.
- **Partial:** there is related support, but a specific moment, explanation, course nuance or method condition merits improvement. Several bullets can lead to **one** targeted change.
- **Review-only:** the site provides writing/review support, but the definitive check must occur in the student's **actual IA document** or submitted file. Do not pretend Pathfinder can certify it.
- **Staff-only:** a recommendation concerns teaching, assessment, supervision, annotation or departmental moderation; it must **not** become another compulsory student field.
- **Policy-dependent:** the current school/IB session rules govern the action; do not hardcode historical requirements or treat process compliance as an A–E mark.

The 392 items were grouped into 61 editorial themes. Each row has a code location for traceability; code presence is not the same as complete classroom effectiveness. The CSV records the source recommendation text, including any source-PDF wording defects, without silently rewriting it.

## Overall classification

| Classification | Items | Editorial implication |
| --- | ---: | --- |
| Present in current guidance/tools | **213** | Preserve and consolidate; avoid extra boxes |
| Partial or specific enhancement | **51** | Prioritise **small number** of contextual improvements, not 51 fields |
| Review-only in the actual IA | **40** | Keep concise checks; never claim automatic document verification |
| Teacher / departmental responsibility | **75** | Keep off the default student journey |
| Requires current policy or submission rules | **13** | Refer to current school/IB instructions; do not award marks |
| **Total** | **392** | Every PDF bullet mapped exactly once in the ledger |

## Coverage by all 14 PDF sections

P = present; Δ = partial; R = actual-document review; T = teacher-owned; Policy = policy-dependent. These are counts of **source items**, not site feature counts or percentages of student attainment.

| Section (PDF pages) | P | Δ | R | T | Policy | Current state and decision |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 01 Topic and aim (3–4) | 14 | 7 | 0 | 0 | 0 | Idea Lab, feasibility and adaptive routes are strong. AA HL depth and detailed pathways need a dedicated layer. |
| 02 Criterion A (4–5) | 20 | 2 | 9 | 0 | 0 | Four-part mathematical writing and evidence-led conclusion exist. Add one optional aim/title/conclusion alignment check; keep concision in actual-document review. |
| 03 Criterion B (5–7) | 26 | 0 | 20 | 0 | 0 | Variable/unit/figure and precision advice is already widespread. External IA typesetting and final layout require human review. |
| 04 Criterion C (7–8) | 24 | 0 | 0 | 0 | 0 | Student choice, genuine changes, non-compulsory primary data and mathematical voice are present. Avoid a separate 'engagement' box. |
| 05 Criterion D (8–10) | 30 | 15 | 0 | 0 | 0 | Reflect at each meaningful result; improve optional mathematical testing of assumptions, uncertainty and sensitivity rather than repeating limitations advice. |
| 06 Criterion E (10–11) | 29 | 0 | 0 | 0 | 0 | Method purpose, course understanding, technology interpretation and representative working already appear. AA HL specificity is recorded separately under section 01. |
| 07 Data, sampling, quality (12) | 18 | 2 | 0 | 0 | 0 | Population, unit, frame, sourcing and bias are covered. Add sample-size **justification**, not duplicate sample-size entry, and a paired-outlier nuance. |
| 08 Statistics (13–14) | 13 | 22 | 0 | 0 | 0 | Scatter-first and regression cautions are strong. Give selected tests a clearer pre-calculation conditions/hypotheses/significance checkpoint; chi-squared details belong behind a method-specific disclosure. |
| 09 Modelling (14–15) | 22 | 3 | 0 | 0 | 0 | Residuals, model comparison and validity are well supported. Connect real sensitivity checks; show piecewise continuity/smoothness advice only if relevant. |
| 10 Other approaches (16) | 7 | 0 | 0 | 0 | 0 | Existing Voronoi, geometry, optimisation, probability, simulation and Workshop guidance provide optional starting points. |
| 11 Teaching/support (16–18) | 0 | 0 | 0 | 39 | 0 | Professional practice: curriculum integration, exemplars, supervision, peer feedback and permissible teacher advice. No new student fields. |
| 12 Marking/moderation (18–19) | 0 | 0 | 0 | 31 | 0 | Teacher annotation, evidence-led marking, calibration and internal standardisation must not be simulated in the student UI. |
| 13 Integrity/references (19–20) | 10 | 0 | 6 | 3 | 0 | MLA/source and authenticity guidance exists; permitted AI use and actual authorship need human/teacher checks, not automated approval. |
| 14 Formatting/submission (20–21) | 0 | 0 | 5 | 2 | 13 | Final PDF, accessibility and upload require inspection outside Pathfinder. Check current anonymisation/format instructions, not historical assumptions. |
| **Total** | **213** | **51** | **40** | **75** | **13** | **392 unique recommendations** |

## Current implementation evidence

The table names **actual implementation surfaces**, not imagined pages. It should guide later changes to existing components rather than generate another unconnected advice system.

| Student moment | Existing implementation | Editorial assessment |
| --- | --- | --- |
| Find or refine a topic and aim | [Idea Lab](../src/ideas/views.js), [Planning pages](../src/ui/planning-views.js) | Supports authentic starting points, feasible investigations and revisable aims. AA HL catalogue is intentionally limited and honestly marked for teacher discussion. |
| Plan observations/sources | [Primary data steps](../src/ui/primary-data-steps.js), [Planning pages](../src/ui/planning-views.js) | Population, unit, frame, method, accuracy and published-source checks exist. **EF203** does not have one explicit sample-size *rationale* at the actual-data moment. |
| Write introduction and first mathematics | [Introduction advice](../src/completing/intro-writing-advice.js), [four-part first-maths page](../src/completing/views.js) | A clear purpose precedes work; real output is separated from a prediction or planned method. Do not add obligatory report-template sections. |
| Subsequent mathematical stages and reflection | [Adaptive journey](../src/completing/adaptive-journey.js), [mathematical validity](../src/completing/mathematical-validity.js), [result interpretation](../src/completing/result-interpretation.js), [limitations](../src/completing/limitation-guidance.js) | Well-developed reflection and mathematical checks. **EF137–151** suggests making the mathematical *consequence* of a relevant limitation easier to test on demand. |
| Visual and statistical evidence | [Graph editor](../src/diagrams/graph-view.js), [model diagnostics](../src/diagrams/graph-diagnostics-view.js), [Statistical Diagrams](../src/diagrams/stat-studio-view.js), [figure handover](../src/diagrams/presentation-coach-view.js) | Clear labels and residual/model checks. Not evidence that the student's externally authored IA is typeset correctly. |
| Hypothesis-test interpretation | [Validity checks](../src/completing/mathematical-validity.js), [adaptive test routes](../src/completing/extended-routes.js), [test technology tutorial](../src/resources/catalog.js), [definitions](../src/workshop/definition-connections.js) | Content exists but is dispersed. **EF230–251** needs a single conditional pre-test entry, especially for significance level, expected counts and degrees of freedom. |
| Technology and mathematical understanding | [Maths Workshop help](../src/help/workshop-help.js), [Workshop catalogue](../src/workshop/catalog.js), [Graph diagnostics](../src/diagrams/graph-diagnostics-view.js) | 'Show me – Help me – My turn', definitions and method-specific cautions reduce procedural overload. Do not add tutorials to the IA-writing page by default. |
| Conclusion and final review | [Conclusion workspace](../src/completing/conclusion-workspace.js), [Checking details](../src/checking/checklist.js), [reference review](../src/checking/reference-audit.js) | The conclusion selects genuine results and bounds claims. The student must still read and verify the actual final document. |
| Assessment cohort | [Cohort selector](../src/essentials/assessment-cohorts.js), [Planning course choice](../src/ui/planning-views.js) | Historical A–E examiner advice cannot be converted into marks or assumed to apply unchanged to the revised 2029 assessment cohort. Check the student's teacher-confirmed framework. |

## Genuine enhancements, grouped into a small backlog

| Item / source bullets | Current gap | Intended location and **minimal** change | Pass |
| --- | --- | --- | --- |
| Sample-size justification — **EF203**, linked to EF197–202 | Actual sample size is recorded in C21S but its suitability is not explicitly explained. | One *optional* short rationale next to the canonical **actual** sample size; conditional for empirical sample-based investigations. Avoid a second sample-size field. | **2** |
| Paired outliers — **EF214** | General outlier guidance exists; the distinction between a paired unusual observation and an unusual value of a single variable should be explicit where applicable. | Small help within the existing data/Graph Studio path. Never silently remove genuine observations. | **2** |
| Test choice, hypotheses and assumptions — **EF230–243** | Checks and tutorial content are spread across different screens; the student may meet them after calculating. | One collapsed method-specific pre-test aid, only after the student explicitly selects a test. Set hypotheses and significance level **before** examining outcomes. | **2** |
| Chi-squared conditions — **EF244–251** | Expected counts and degrees of freedom are present in guidance but not always assembled as one timely verification step. | Put observed/expected counts, categorisation, degrees of freedom and assumption checks together. Discuss continuity/Yates correction **only where actually relevant**; never require it universally. | **2** |
| Aim/title/conclusion alignment — **EF023, EF052** | Aim and result are recalled, but final semantic consistency is not a single deliberate comparison. | Read-only comparison with one optional self-question; no model-generated judgement about whether the student's prose is mathematically consistent. | **3** |
| Quantified limitation/sensitivity — **EF137–151, EF273–274** | Existing reflection and validity prompts could lead more directly to one genuine mathematical check. | Reuse existing analysis and what-if controls; ask what changed and whether it materially alters the claim. Only after a real result; no automatic IA prose. | **3** |
| AA HL pathway and depth — **EF006, EF008–009, EF012–014, EF021** | Detailed mathematics selection is AI SL / AA SL; AA HL is marked for teacher review. | Add an honest AA HL route/depth advisory layer. Ordinary SL-content mathematics is not automatically unsuitable for HL; sophistication of application and demonstrated understanding matter. No automatic syllabus certification. | **4** |
| Piecewise model regularity — **EF275** | Continuity and smoothness are specialist concerns not worth displaying to every student. | Add optional, conditional modelling guidance for students who actually use piecewise functions. | **4** |

**Important:** 'Partial' means an editorial opportunity, not a promise to introduce 51 UI elements. Multiple examiner bullets above map to **eight targeted ideas**, some of which should be improvements to existing help rather than new fields.

## Duplication and visual-density register

| Cluster | Advice currently encountered in | Keep as primary action; avoid |
| --- | --- | --- |
| Aim, motivation, personal engagement | Planning N01/N01V, Introduction, Writer's Field Guide, Checking D04 | Keep genuine mathematical choice at the task; avoid a new mandatory engagement paragraph, repeated motivational essay or automatic mark language. |
| Reflection and mathematical limits | C30/C40/C50, validity aid, limitations guidance, Writer's Field Guide, Checking D05 | **One inline reflection task per result** plus one optional deeper mathematical test; avoid another permanent limitations checklist. |
| Sampling and representativeness | N03P2, C21S, data source/limitation screens, Workshop glossary, Checking | Record sample facts once; use read-only echoes; add only a short justification beside the real sample. |
| Method suitability/course depth | N02M, C30/C40 method identity, criteria bubbles, Maths Workshop, Checking D06 | Keep contextual course caveats and optional Workshop support, not repeat a full syllabus lesson on every screen. |
| Precision and units | Planning quantity/accuracy decisions, C24, figure editor, Graph accuracy echoes, Checking D03 | Preserve one source-grounded precision record and local reminders; no second universal rounding form. |
| Mathematical communication | Writer's Field Guide, C25, figure coach/captions, Checklist D03/D07/D17 | Make figure-level advice available at export, and full-document checking at the end; do not overfill mathematical writing tasks. |
| Source attribution/MLA | Planning source entry, Writing citation prompts, diagram provenance, Checking D09/reference audit | Keep attribution at original use and final audit; no site-wide repeated referencing banner or assertion that the site verifies Works Cited. |
| Modelling diagnostics | Graph Explorer, result interpretation, mathematical validity, Workshop | Link to residuals/sensitivity tools from interpretation, not duplicate diagnostic controls or claim high R² proves validity. |
| Teacher approval, feedback, assessment | Planning checkpoints, Checking revision records, assessment-criteria help | Student may record **real** teacher feedback; no implied approval, invented teacher comment, automated moderation or earned criterion marks. |

### Explicit no-new-box decisions

Do **not** add student fields for the 75 staff-only recommendations (including annotated marking, internal moderation, teacher-authentication checks, teaching hours and class use of exemplars). Do **not** turn the 13 policy-dependent items into universal requirements. The site should also avoid compulsory prediction fields, lengthy personal rationale, generic limitations sections, forced advanced mathematics, repeated sample-size entry, full test tutorials on every page, and one checkbox per examiner bullet.

## Additional source caveats

1. **PDF export wording:** visual inspection confirms that at least EF063 (page 6) and EF085 (page 7) have a missing symbol in the **supplied PDF itself** (not just text extraction). Retain their source transcription in the ledger, and verify any exact symbol-specific wording against an authoritative original before republishing it as advice. In context EF085 concerns the distinction between equality and approximation, but do not invent the omitted glyph in a supposed source quotation.
2. **Assessment cohort:** the PDF synthesises feedback about the historical five A–E criteria. The site has an explicit [2029 cohort option](../src/essentials/assessment-cohorts.js). Do not import old criterion marks/descriptors as binding rules for that option.
3. **Procedural claims:** historical page counts, feedback opportunities, anonymisation, upload format, word counts, teacher annotation and permitted AI use are not guaranteed to match every current school's instructions or assessment session. Refer students to their teacher/current guide and make no automatic compliance claims.
4. **Authenticity:** no field completion, saved figure, tool export, review flag or generated example proves an IA is authentic, mathematically sound or teacher approved.

## Contracts for implementation passes

**Pass 2 — Sampling and statistical precision.** Introduce the single conditional sample-size rationale, paired-outlier nuance and statistical-test readiness guidance. Keep a neutral default screen for non-statistical/theoretical routes. Tests: conditional visibility and timing; hypotheses and significance before p-value; chi-squared independence vs goodness-of-fit; expected frequencies/df and conditional corrections; keyboard, small screens, reduced-advice support; no new source/results generated or modified.

**Pass 3 — Consequential reflection and coherence.** Improve opt-in sensitivity/reflection guidance and connect to existing tools where an actual result supports it; display the saved title, aim and final claim together for an honest student check. Tests: no invented limits/claims, no inference from planned work, original figure and notes preserved, review-flag propagation, one reflection task per stage, reduced advice and mobile.

**Pass 4 — AA HL and consistency.** Review explicit AA HL pathway/depth guidance (including mathematical proof and model regularity when relevant), cohort-dependent wording, deduplication, all relevant crosslinks and final usability. Tests: AI SL, AA SL and AA HL distinctions; no invented HL approval; 2029 cohort not judged by legacy A–E; 320/390 px, keyboard/touch, backups and exports.

All future passes must preserve student-entered writing, Sparks, results, source classifications, review flags, figures and backups. No generated IA prose, invented observations, automatic grades or implicit teacher approval. Use existing pop-ins and disclosures before creating another prominent card.

## Verification boundary for Pass 1

- Every source bullet has exactly one EF identifier and editorial theme, covering PDF sections 01–14.
- The coverage ledger is a **planning/evidence register**, not a new source of live student prompts or an official IB criterion.
- Source-code anchor paths were checked against the current repository; a ledger integrity test validates count, order, statuses and paths.
- No student-facing JavaScript, CSS, data schemas, generator algorithms, backup formats or UI markup are intentionally changed in this pass.

**Next:** Pass 2 — targeted statistical and sampling improvements.
