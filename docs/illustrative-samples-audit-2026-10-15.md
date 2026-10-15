# Illustrative sample quality audit — 15 October 2026

## Why these were rebuilt

The original five previews were early prototypes: one brief fictional scatter plot or small-case pattern, a few Planning answers, and almost none of the newer IA Studio journey. Reopening such a preview from the current app made the source/method, mathematical extension, reflection, conclusion, communication and review screens look unfinished.

The revised **five fictional examples** use a single maintainable data factory in \`src/core/illustrative-samples.js\`, so their Planning, Studio, linked mathematics and exports cannot silently diverge into separate old implementations.

| Sample | Clearly constructed starting material | First actual step | Further mathematics | Reason for the conclusion |
| --- | --- | --- | --- | --- |
| Nearly straight | Six invented pairs: sleep hours versus reaction time | Scatter and shape | Pearson's r, linear fit and residuals | A very tidy descriptive linear relationship, **not causation** |
| Curved | Six invented decreasing values with a flattening trend | Scatter and shrinking successive changes | Straight-line residual critique; baseline-adjusted exponential fit | A large absolute r need not validate the linear form; baseline is assumed |
| Unclear | Six invented variable values | Scatter lacking direction | Pearson's r; two-group mean comparison | Inconclusive evidence can justify **not fitting** another model |
| Unusual point | Six invented pairs, one high value at x=7 | Scatter and unusual-pair recognition | Whole-data correlation/fit; with/without sensitivity analysis | Exclusion without independent reason is unjustified |
| Theoretical | Exact integer cases n=1,2,3,4 | Table of sums of cubes and triangular squares | General telescoping proof; interval-sum extension | Finite checks make a conjecture, a proof establishes the identity |

### Mathematical quality controls

For the four empirical stories the whole dataset is displayed with units and all calculated summaries use the same six values. Pearson correlations, slopes, intercepts, residuals and RMSE are checked numerically; the curved example explicitly fixes an assumed 250 ms baseline and does not present that value as observed. The unusual-pair case compares models **diagnostically**, never quietly replaces the full dataset. The theoretical case proves the positive-integer identity by deriving \`T_n² - T_(n-1)² = n³\` and extends it to interval sums; one worked interval example is checked.

### Field coverage

All five cases now include:

- A substantial and course-relevant Planning narrative: aim, motivation, why the mathematics is useful, prediction/conjecture, feasibility, first step, alternative route, provisional eight-week timeline, a specific teacher question and no invented official deadlines.
- Four substantive student-style writing-note sections: introduction, source/definitions, conclusion and future review.
- **Three completed fictional mathematical records** with explicit purposes, results, interpretation in context, limitations, logical links to prior results and a genuinely motivated next question.
- IA Studio records for source/assumptions, first representation, mathematical progression, conclusion and communication. For empirical cases, explicit source IDs and presentation accuracy decisions link to each mathematical step. For the theoretical case, numerical definitions and proof assumptions replace irrelevant data-collection fields.
- A–E **draft and prospective final self-review guidance**, all marked unchecked, without fabricated grades or teacher certification.
- A student-controlled teaching preview that remains separated from the personal project. A **See the sample journey** action exposes the full working trajectory.

### Deliberately unfilled, rather than invented

All samples are **fictional teaching work**, not assessed IB exemplars, verified empirical measurements, real surveys, published datasets, a student's finished IA document, teacher feedback, predicted marks, school deadlines, or permission to collect participant data. Such values are **intentionally blank or explicitly described as not performed**, rather than producing false completeness.

For the empirical cases, the “secondary” source route is used only to illustrate analysis of an already available fictional table. Its publisher and citation fields explicitly disclose that **no real secondary source exists**. Those previews must not be used as submitted IA data. For the theoretical case, no fake population, sampling or instrument uncertainty is supplied.

Teacher draft and final check milestones are left unfinished where actual school documents or feedback would be required. Preview stage labels represent illustrative working progress only.

### Export and test gates

\`tests/illustrative-samples.test.js\` verifies every applicable Planning and Studio field, completion sections, three-result chains, exact numerical/proof content, linkage consistency, grade/teacher/permission safeguards, project restoration and full ZIP export. The existing sample-preview isolation tests continue to protect students’ own local storage.

\`scripts/illustrative-samples-browser.py\` exercises all five choices at desktop and phone widths, navigates into sample sections, checks a draft review and full archive, changes samples, reloads and returns to the original project without mutation. It runs alongside the rest of the browser acceptance suite.

Pedagogical judgement remains with the teacher. These exemplars show **a coherent route through Pathfinder**, not a claim that six simulated values or one algebraic identity alone would earn a high IB IA mark.
