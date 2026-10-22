# Illustrative-sample field contract

22 October 2026

## Scope

This is the explicit mapping between an authored fictional investigation and the current Pathfinder record. The code source is `src/core/samples/field-contract.js`. It classifies every Planning and Completing default field, every canonical mathematical-entry field, and the saved source, quantity, accuracy, limitation and review records used by samples.

Coverage means answering every applicable student question well. It does not mean filling all keys in every example. Statistical, modelling, theoretical, primary-source and secondary-source branches have different needs. Compatibility fields and external teacher/school records are not additional writing tasks.

The prose remains in the fictional student's perspective. A review note records what I checked and what I found; it does not tell another student what to do. Planning answers may be prospective. Mathematical results, interpretations and the conclusion report the work actually defined in the sample. Data provenance and the fictional status remain explicit.

## Path notation and categories

- `planning.fields.aim` is a single saved field.
- `entries[].result` applies separately to every mathematical entry.
- `planning.primaryQuantities[]` contains saved quantity records with `id`, `name` and `unit`.
- `planning.accuracyPlans[]` contains `id`, `source`, `quantity`, `unit`, `resolution`, `basis` and `uncertainty`.
- `completion.sourceRecords[].fields.*` is the saved version of the corresponding actual-source editor field; `id` links it to mathematical entries.
- `completion.accuracyDecisions[]` contains `id`, `quantity`, `symbol`, `unit`, `resolution`, `policy`, `reason` and `sourceId`.
- `completion.review.records.{reviewId}.note` is one review evidence note, such as `completion.review.records.draft-D02.note`.
- `entries[].figureRefs` is the plural list of stage-owned tool/figure references; the existing singular keys remain supported.

| Category | Meaning |
| --- | --- |
| authored | A direct student answer belongs in the current sample workflow. |
| conditional | Populate when the specified branch or mathematical circumstance applies. |
| metadata | Consistent selectors, record IDs, links, mirrors or editor state. |
| legacy | Preserved compatibility material, not new required prose. |
| external | No fabricated approvals, teacher/peer comments, marks or school-confirmed requirements. |

`includeInIA` identifies material that may appear in the ordered IA reader/export. It does not automatically print or duplicate a field. The narrative must choose one home for each passage. A stage title, local takeaway, selection or planning answer may support the interface without becoming a repeated paragraph.

## Main writing map

| Current surface | Canonical answer | Authored requirement |
| --- | --- | --- |
| Introduction | `scratch.introduction` | A brief, personal opening with a focused mathematical aim and necessary context. |
| Introduce first mathematics | `dataAimLink`, `methodReason`, `firstPurpose`, `firstMethodEvaluation` | The reason for starting here, the chosen method, the specific question and the relevant evaluation; no routine tutorial. |
| First exploration: introduce | `entries[0].purpose` | Actual student wording before the first figure or calculation. |
| First exploration: show | `entries[0].result` and its saved figures | The actual calculation, proof or diagram, with clear variables, units and notation. |
| First exploration: reflect | `entries[0].interpretation` | What the actual finding means for the aim and any earlier prediction. |
| First exploration: follow | First-entry `nextQuestion`/`nextWhy`, mirrored by current `nextQuestion`/`nextReason` | The next mathematical question and why it follows, or a justified decision to conclude. |
| Later stages: connect | Each entry's `title`, `bridge`, `purpose`, `methodId` and `technique` | A specific question arising from the preceding finding and a justified method. |
| Later stages: show | Each entry's `result` and saved figures | Performed mathematics with enough working to show understanding. |
| Later stages: interpret | `interpretation`, `localTakeaway`, `limitations` when relevant | A substantive interpretation, a concise reusable finding and consequential qualifications. |
| Later stages: follow | `nextQuestion`, `nextWhy` | A result-dependent next step or a reason to stop. |
| Conclusion: answer | `mainConclusion` | The strongest answer supported by the decisive calculations or proof. |
| Conclusion: meaning | `conclusionBenefit` | Meaning for the original purpose and the restrictions that alter the final claim. |
| Conclusion: possible extension | `conclusionExtension` | A worthwhile remaining question if one exists; no compulsory extension. |
| Checking | A specific review's `location`, `note`, `action` and `status` | Evidence of checking an actual passage, result or figure; no advice in place of an answer. |

Field keys in this compact table are relative to `completion.fields` unless another prefix is shown. The complete inventory below gives absolute paths.

## Conditional branches and deliberate blanks

An empirical sample explains its actual source, counts, units and selection process. Where sampling matters, it defines population, unit, frame, independence or pairing, relevant bias and justified handling of exclusions. It does not label convenience observations as random or repeat readings as independent units.

A model defines variables, parameters, domain and assumptions. Validation and alternative-model fields contain what the student actually compared. A theoretical investigation gives mathematical definitions, restrictions, exact cases and proof; empirical sampling and instrument fields are not required. An exact geometry model may still have a deliberately assumed tolerance, which is identified as an assumption rather than measured uncertainty.

For a model that uses defined assumptions without collected data, keep `planning.fields.kind` as `modelling` and choose `planning.fields.dataSource = theoretical`. N03 then displays model-specific labels for the existing `theoreticalAim` and `theoreticalCase` fields. The latter records starting quantities, units, assumptions and constraints. This branch joins the optional prediction and common practical checks directly; it does not require either a primary or secondary data plan. The chosen modelling pathway remains active in IA Studio. The source type describes the origin of the starting material, while the investigation type describes the mathematical work.

Quantity-specific precision belongs in saved accuracy records. The transient fields used to add or edit a quantity are not a second completed record and may be empty after saving. Likewise, first-output fallback fields exist for the period before a first entry is created; a complete sample uses a first entry, and compatibility mirrors must agree with it.

Unfamiliar-mathematics explanation is needed only for a genuinely unfamiliar idea. A surprising result needs a relevant check, not a mandatory surprise narrative. Source/method limitations belong at the point where they affect the inference; they are not copied into every stage or collected into a generic conclusion.

Two current optional selectors are metadata rather than retired prose: `scatterAimRelevance` records whether further mathematics advances the aim in the bivariate guidance, and each entry's `priorLearningOnly` records the student's course-depth self-check. Use supported choice values when those panels are used; do not replace a choice with a prose paragraph or manufacture a teacher judgement.

The current conclusion uses three authored fields. Earlier `scratch.conclusion`, `conclusionEvidence`, `conclusionUncertainty`, `conclusionAdvice` and `conclusionFocus` remain import-compatible but should not be filled as extra endings for new examples. Retired ease/readiness ratings and former planning screens are not prerequisites for sample completeness.

Teacher-feedback records, external reader responses, school-confirmed dates, candidate identity and marks stay unclaimed. A sample can be mathematically complete without claiming external authentication. Genuine student questions about scope may be displayed as questions.

## Coverage inspection

`inspectSampleFieldCoverage(state, expectedPaths)` checks only paths explicitly selected by its caller. The caller first decides which source and support branches belong to the sample. Concrete paths such as `entries.2.interpretation` and `completion.review.records.draft-D02.note` are supported alongside array patterns. A missing repeated-stage answer is reported with its concrete index.

Do not request the wildcard review path when only some review checks apply: select the relevant review IDs. Do not treat an empty conditional branch as a failure merely because the schema supports it. The helper checks presence only. It cannot decide whether writing is in the student voice, whether a proof is valid, whether a calculation is correct, or whether the assembled investigation has sufficient substance.

The focused tests compare the contract with the current Planning/Completing/entry schemas and real normalized quantity, accuracy and review shapes. They also check exact coverage of the sixteen live pathways, saved-source field consistency, current conclusion fields, a missing repeated-stage response and the separation of optional review from external feedback.

## Complete inventory

The tables below are generated from the explicit code contract. “Narrative” means eligible for deliberate inclusion, not automatically printed or always required. The separate `appliesTo` and `when` values must be respected when authoring an individual sample.

### Planning answers and choices

| Path / current label | Applies to / category | Narrative | Student answer or treatment |
| --- | --- | --- | --- |
| `planning.fields.provisionalTitle`<br>My provisional IA title | all / authored | No | A specific working title consistent with the aim; reuse it as the sample document title. |
| `planning.fields.aim`<br>What do I want to find out mathematically? | all / authored | No | A focused first-person mathematical question, including the scope that the conclusion will answer. |
| `planning.fields.beneficiary`<br>Who might benefit, and how could the answer help? | all / authored | No | One genuine fictional-student reason for investigating; no promised impact or predetermined answer. |
| `planning.fields.motivation`<br>Why I care about this question | all / authored | No | The same personal purpose when the setup screen exposes it; do not create a second competing motivation. |
| `planning.fields.idea`<br>My starting idea | all / conditional | No | A concise starting observation or curiosity. **When:** Only if the chosen starting route displays it. |
| `planning.fields.intendedUse`<br>What might the findings help us understand or decide? | all / conditional | No | An intended use consistent with the main motivation, without duplicating it in the final narrative. **When:** Current setup editing or a preserved earlier note. |
| `planning.fields.otherMaths`<br>Another technique I might use (optional) | all / conditional | No | A tentative additional method with a mathematical purpose. **When:** Only a genuinely considered method outside the selected menu. |
| `planning.fields.otherCourseMaths`<br>Mathematics I might explore (optional) | all / conditional | No | A course-appropriate mathematical possibility or an honest suitability question. **When:** For a course not covered by the AI SL/AA SL menu. |
| `planning.fields.mathsRevisedWhy`<br>Why might this mathematical direction help? (optional) | all / conditional | No | A reason tied to the aim for revising the provisional method. **When:** If the planned mathematics was revised. |
| `planning.fields.prediction`<br>My tentative prediction or conjecture (optional) | all / conditional | No | An initial expectation, clearly distinguished from the eventual result. **When:** If the student makes a prediction. |
| `planning.fields.predictionWhy`<br>Why do I expect this? (optional) | all / conditional | No | The observation or mathematical argument behind the initial expectation. **When:** When a prediction exists. |
| `planning.fields.predictionImplication`<br>If it were true, what might it mean? (optional) | all / conditional | No | A conditional implication for the original purpose. **When:** When a prediction exists and the implication is useful. |
| `planning.fields.readinessImprovement`<br>One useful next step (optional) | all / conditional | No | A practical, specific planning action rather than generic advice. **When:** If evidence access or feasibility needs improvement. |
| `planning.fields.unsecured`<br>What needs arranging? (optional) | all / conditional | No | A particular outstanding resource or access issue and a realistic next action. **When:** Only when practicalBlocker is yes. |
| `planning.fields.alternativeMethod`<br>Another method or source considered (optional) | all / conditional | No | A feasible alternative considered by the fictional student and why it might differ. **When:** If the source or sampling branch calls for an alternative. |
| `planning.fields.planIdentifier`<br>Optional label for my copy of this plan | all / conditional | No | A sample plan/revision label; not a claim of candidate identity. **When:** If useful for the downloadable planning record. |
| `planning.fields.ideaStatus`<br>Where are you starting? | all / metadata | No | Choose the represented starting route without filling the other mutually exclusive routes. |
| `planning.fields.beneficiaryType`<br>Who might benefit from my investigation? | all / metadata | No | Choose the category matching the authored motivation. |
| `planning.fields.kind`<br>What kind of investigation is this? | all / metadata | No | Set statistics, modelling or theoretical to match the investigation. |
| `planning.fields.dataSource`<br>Where will your data or evidence come from? | all / metadata | No | Choose primary, secondary or both for data; a modelling investigation may instead choose theoretical for defined quantities and assumptions with no collected dataset. |
| `planning.fields.dataAvailability`<br>What evidence can you work with now? | all / metadata | No | A planning state for observations or defined starting material; it does not independently establish that collection happened. |
| `planning.fields.practicalBlocker`<br>Is anything essential stopping you getting started? | all / metadata | No | Show the access follow-up only when needed; a model may still require resources to define or check its assumptions. |
| `planning.fields.course`<br>My IB Maths course | all / metadata | No | Set the intended course honestly; a selected course is not a verified level judgement. |
| `planning.fields.assessmentFramework`<br>Assessment framework | all / metadata | No | Use the current intended cohort framework; do not convert old projects or imply a mark. |
| `planning.fields.predictionId`<br>Prediction prompt considered | all / metadata | No | Select a relevant optional prompt; never copy its advice as the answer. |
| `planning.fields.mathsOutside`<br>Mathematics beyond or uncertain within my course | all / metadata | No | Record the actual scope decision; unfamiliar mathematics still needs explanation. |
| `planning.fields.courseSuitability`<br>Mathematical suitability self-check | all / metadata | No | A student scope choice, not teacher approval. |
| `planning.fields.firstAction`<br>Suggested first mathematical step | all / metadata | No | A provisional spark only; the actual first entry remains the source of completed mathematics. |
| `planning.fields.firstAccuracy`<br>Relevant accuracy spark | all / metadata | No | A concise reflection of saved quantity-specific decisions where the existing spark uses it. |
| `planning.fields.statisticsContext`<br>What form might your data take? | empirical / metadata | No | Choose paired numerical, groups, categories or a distribution consistently with the evidence. |
| `planning.fields.primaryHow`<br>What will you collect, and how? | primary / conditional | No | Describe the proposed units, procedure and repeatable conditions in the student voice. **When:** Primary or both-source plan. |
| `planning.fields.primaryEquipment`<br>Equipment or resources | primary / conditional | No | Name the actual planned instrument or resource and relevant resolution. **When:** When equipment is needed. |
| `planning.fields.primaryWhen`<br>When could you start? | primary / conditional | No | A clearly fictional planning date, not a school-confirmed deadline. **When:** If a date helps the sample plan. |
| `planning.fields.primaryWhere`<br>Where would you collect it? | primary / conditional | No | A non-identifying setting consistent with the procedure. **When:** Primary collection or observation. |
| `planning.fields.primaryPopulation`<br>Population or objects | primary / conditional | No | Define the population/process/object the investigation is intended to describe. **When:** Primary or both-source plan. |
| `planning.fields.primarySamplingUnit`<br>One sampling unit | primary / conditional | No | Define the independent unit; distinguish repeated readings from independent participants/objects. **When:** When units or repeated trials matter. |
| `planning.fields.primarySamplingFrameDetails`<br>Describe the frame or difficulty | primary / conditional | No | A realisable frame or honest coverage limit in the fictional scenario. **When:** When a sampling frame is relevant. |
| `planning.fields.primarySampling`<br>Why might this method work? | primary / conditional | No | Justify the choice for this aim, including the important inference restriction. **When:** When a sampling choice is relevant. |
| `planning.fields.primarySamplingMethod`<br>Sampling method | primary / metadata | No | Use a supported sampling ID; choose not-applicable for one chosen object rather than inventing a population. |
| `planning.fields.primarySamplingFrame`<br>Sampling frame | primary / metadata | No | Choose the frame status that agrees with the authored details. |
| `planning.fields.primaryRepeatable`<br>Could I collect follow-up observations? | primary / metadata | No | A feasibility choice, not evidence that additional measurements exist. |
| `planning.fields.primaryStatus`<br>Status of source plan | primary / metadata | No | Preserve an honest proposed/available status. |
| `planning.fields.primaryQuantityName`<br>Quantity or category | primary / metadata | No | Transient quantity-editor draft; completed samples use planning.primaryQuantities[].name. |
| `planning.fields.primaryQuantityUnit`<br>Unit (only if needed) | primary / metadata | No | Transient quantity-editor draft; completed samples use planning.primaryQuantities[].unit. |
| `planning.fields.secondaryUrl`<br>Source link (optional while searching) | secondary / conditional | No | A real original URL when using published evidence; leave blank for constructed evidence rather than inventing a source. **When:** An external published source is actually used. |
| `planning.fields.secondaryPublisher`<br>Who published the source? | secondary / conditional | No | The verified publisher or an explicit constructed-data provenance statement. **When:** A secondary source plan is selected. |
| `planning.fields.secondaryVariables`<br>Which variables and units will you use? | secondary / conditional | No | Identify selected columns and definitions, including compatible units. **When:** A secondary source plan is selected. |
| `planning.fields.secondaryScope`<br>Which dates, population or subset are relevant? | secondary / conditional | No | Define the justified subset before analysis. **When:** A secondary source plan is selected. |
| `planning.fields.secondarySamplingOrigin`<br>How were the published observations selected? (if known) | secondary / conditional | No | State known provenance and what is unknown without inventing a random selection process. **When:** Published observations have a relevant selection process. |
| `planning.fields.secondaryVerified`<br>Source verification status | secondary / metadata | No | Do not mark an invented publisher or uninspected URL as verified. |
| `planning.fields.secondaryStatus`<br>Status of source plan | secondary / metadata | No | Distinguish an intended source from usable evidence. |
| `planning.fields.primaryAccuracyQuantity`<br>Quantity / column | primary / metadata | No | Transient accuracy-editor draft; completed records belong in planning.accuracyPlans[]. |
| `planning.fields.primaryAccuracyUnit`<br>Unit (if any) | primary / metadata | No | Transient editor draft; use the saved quantity-specific unit. |
| `planning.fields.primaryAccuracyResolution`<br>Recording increment / degree of accuracy | primary / metadata | No | Transient editor draft; do not confuse displayed resolution with validated uncertainty. |
| `planning.fields.primaryAccuracyBasis`<br>Basis of the accuracy decision | primary / metadata | No | Transient editor choice; saved records distinguish exact, measured, published and unknown bases. |
| `planning.fields.primaryAccuracyUncertainty`<br>Known or possible uncertainty (optional) | primary / metadata | No | Transient editor draft; save only justified uncertainty or explicitly identify what is unknown. |
| `planning.fields.secondaryAccuracyQuantity`<br>Quantity / column | secondary / metadata | No | Transient accuracy-editor draft; completed records belong in planning.accuracyPlans[]. |
| `planning.fields.secondaryAccuracyUnit`<br>Unit (if any) | secondary / metadata | No | Transient editor draft; use the saved quantity-specific unit. |
| `planning.fields.secondaryAccuracyResolution`<br>Original resolution or published rounding (if known) | secondary / metadata | No | Transient editor draft; do not confuse displayed resolution with validated uncertainty. |
| `planning.fields.secondaryAccuracyBasis`<br>Basis of the accuracy decision | secondary / metadata | No | Transient editor choice; saved records distinguish exact, measured, published and unknown bases. |
| `planning.fields.secondaryAccuracyUncertainty`<br>Known or possible uncertainty (optional) | secondary / metadata | No | Transient editor draft; save only justified uncertainty or explicitly identify what is unknown. |
| `planning.fields.theoreticalAim`<br>What mathematical property or conjecture might you investigate? / What mathematical question will the model investigate? | all / conditional | No | State the precise property or model question and its domain; the modelling branch keeps its own selected pathway. **When:** Theoretical investigation, or modelling with dataSource theoretical (defined assumptions). |
| `planning.fields.theoreticalCase`<br>What small example or calculation could you explore safely? / Which starting quantities, assumptions and constraints will define the model? | all / conditional | No | For theory, give an illuminating exact case or candidate counterexample. For modelling without collected data, define starting quantities, units, assumptions and constraints without inventing measurement. **When:** Theoretical investigation, or modelling with dataSource theoretical (defined assumptions). |
| `planning.fields.theoreticalPrediction`<br>A tentative conjecture (optional) | theory / conditional | No | State the conjecture without treating examples as proof. **When:** A conjecture is useful. |
| `planning.fields.theoreticalWhy`<br>Why might the claim hold? | theory / conditional | No | Give the structural reason or pattern behind the conjecture. **When:** A theoretical prediction exists. |
| `planning.fields.permissionNeed`<br>Do permissions or restrictions need attention? | all / external | No | Record an honest need/none/unsure choice; never infer a grant of permission. |
| `planning.fields.permissionDetails`<br>Brief note for my teacher | all / external | No | A fictional-student question or restriction, with no personal details or invented approval. |
| `planning.fields.teacherNeed`<br>Which part of the plan needs advice? | all / external | No | A specific suitability, access or scope question, not a teacher answer. |
| `planning.fields.teacherQuestion`<br>A specific question for my teacher | all / external | No | An authored question may be shown; no response or approval is fabricated. |
| `planning.fields.teacherSafeAction`<br>One safe step I can do before getting feedback | all / external | No | A realistic student planning action, not evidence of a teacher instruction. |
| `planning.fields.teacherExtra`<br>Anything else you would like your teacher to know? (optional) | all / external | No | A relevant uncertainty only if the scenario calls for it. |
| `planning.fields.universalTeacherQuestion`<br>Anything you would like to discuss with your teacher? (optional) | all / external | No | A specific open question rather than a claimed sign-off. |
| `planning.fields.teacherSchedule`<br>Possible discussion date (optional) | all / external | No | Leave unset unless explicitly presented as an invented planning date. |
| `planning.fields.milestoneSchoolDraft`<br>School draft deadline | all / external | No | No school-confirmed date is invented. |
| `planning.fields.milestoneSchoolFinal`<br>School final deadline | all / external | No | No submission or deadline confirmation is invented. |
| `planning.fields.timelineWeeks`<br>Weeks available | all / conditional | No | A coherent illustrative work plan, not a real deadline. **When:** If a timeline is included. |
| `planning.fields.timelineEarly`<br>How early could I start? | all / conditional | No | A realistic illustrative early-start decision. **When:** If a timeline is included. |
| `planning.fields.timelineStart`<br>My possible start date | all / conditional | No | Clearly hypothetical planning date. **When:** If a timeline is included. |
| `planning.fields.milestonePlan`<br>Planning and introduction | all / conditional | No | A coherent proposed milestone. **When:** If a timeline is included. |
| `planning.fields.milestoneData`<br>Evidence ready | all / conditional | No | A proposed milestone consistent with source access. **When:** If empirical evidence and a timeline are used. |
| `planning.fields.milestoneFirstVisual`<br>First useful representation | all / conditional | No | A proposed milestone; not an assertion the figure exists. **When:** If a timeline is included. |
| `planning.fields.milestoneVisualReview`<br>Review first representation | all / conditional | No | A proposed chance to respond to the actual finding. **When:** If a timeline is included. |
| `planning.fields.milestoneFirstMath`<br>First substantial mathematics | all / conditional | No | A proposed milestone with appropriate scope. **When:** If a timeline is included. |
| `planning.fields.milestoneFurtherMath`<br>Further mathematics and conclusion | all / conditional | No | Reserve room for result-dependent development rather than a fixed technique quota. **When:** If a timeline is included. |
| `planning.fields.milestoneDraft`<br>Complete draft | all / conditional | No | A proposed complete-draft milestone, not teacher confirmation. **When:** If a timeline is included. |
| `planning.fields.milestoneReview`<br>Review and revisions | all / conditional | No | A proposed self-review milestone. **When:** If a timeline is included. |
| `planning.fields.milestoneAdjustment`<br>Timeline adjustment | all / conditional | No | A specific planning revision if useful. **When:** If the illustrative plan changes. |
| `planning.fields.originalIdea`<br>Earlier starting idea | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.interest`<br>Earlier interest note | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.otherIdea1`<br>Earlier alternative idea 1 | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.otherIdea2`<br>Earlier alternative idea 2 | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.ideaSelected`<br>Earlier selected idea | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.ideaAccess`<br>Earlier idea-access note | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.ideaValue`<br>Earlier idea-value note | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.primaryWhat`<br>Earlier proposed measurements | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.methodReason`<br>Earlier planned method reason | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.methodLimitation`<br>Earlier anticipated limitation | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.methodMitigation`<br>Earlier mitigation note | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.sourceFirstDate`<br>Earlier first-evidence date | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.sourceFullDate`<br>Earlier complete-data date | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.dataReadiness`<br>Earlier data-readiness score | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.dependencies`<br>Earlier dependency list | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.softwareReady`<br>Earlier software-readiness note | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.workloadHours`<br>Earlier workload estimate | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.cleaningBurden`<br>Earlier cleaning estimate | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.externalRisks`<br>Earlier external risks | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.minimumVersion`<br>Earlier minimum version | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.backupMethod`<br>Earlier backup method | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.pilotReady`<br>Earlier pilot readiness | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.costIssue`<br>Earlier cost issue | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.sourceRights`<br>Earlier source-rights note | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.dataSufficiency`<br>Earlier data sufficiency | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.negativeResultViable`<br>Earlier negative-result check | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.presentationManageable`<br>Earlier presentation check | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.practicalEase`<br>Earlier practical-ease score | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.easeImprovement`<br>Earlier ease improvement | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.mathsWhy`<br>Earlier mathematics rationale | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.predictionPrior`<br>Earlier superseded prediction | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.predictionExploration`<br>Earlier uncertain-prediction note | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.suitabilityWhy`<br>Earlier suitability rationale | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.figureType`<br>Earlier planned figure type | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.figureOther`<br>Earlier alternative figure | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.figurePurpose`<br>Earlier figure purpose | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.changeTrigger`<br>Earlier change trigger | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.changeAdaptation`<br>Earlier adaptation | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |
| `planning.fields.fallbackEvidence`<br>Earlier fallback evidence | all / legacy | No | Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here. |

### Introduction and private notes

| Path / current label | Applies to / category | Narrative | Student answer or treatment |
| --- | --- | --- | --- |
| `scratch.introduction`<br>My own working introduction notes | all / authored | Yes | In a sample, a polished first-person introduction containing the aim, personal reason and essential context; the ordinary student notes workflow is unchanged. |
| `scratch.dataNotes`<br>My earlier source notes | all / conditional | Yes | For the sample reader, use an authored source/definitions passage and avoid repeating the current source and method answers. **When:** When the starting material or definitions need explaining. |
| `scratch.finalReview`<br>My earlier review notes (editable) | all / conditional | No | Specific evidence of an actual sample check, not instructions to the reader. **When:** Only if the sample has a useful revision note. |
| `scratch.conclusion`<br>My earlier conclusion draft or notes | all / legacy | No | Leave empty for new examples; use the three current conclusion fields. |

### Current Completing fields and compatibility notes

| Path / current label | Applies to / category | Narrative | Student answer or treatment |
| --- | --- | --- | --- |
| `completion.fields.dataAimLink`<br>How does this first mathematics connect to my aim? | all / authored | Yes | One or two student sentences linking the first mathematical question to the aim; print once at the selected placement. |
| `completion.fields.methodReason`<br>My method and why I chose it | all / authored | Yes | Name and justify the first method in this investigation without a routine syllabus tutorial. |
| `completion.fields.firstMethodEvaluation`<br>My mathematical limitations, alternatives and justification | all / authored | Yes | Explain relevant assumptions, a plausible alternative and why this starting method fits the aim. |
| `completion.fields.mainConclusion`<br>My answer to the investigation question | all / authored | Yes | Answer the original aim with the decisive established result, value, range or proof. |
| `completion.fields.conclusionBenefit`<br>My interpretation and the important limits | all / authored | Yes | Explain meaning for the original purpose and only the restrictions that change the final claim. |
| `completion.fields.firstPurpose`<br>The mathematical question for my first figure or calculation | all / authored | No | A precise starting question reused in the first-stage screen; not another paragraph to repeat. |
| `completion.fields.actualSource`<br>What evidence or mathematical starting material do I actually have? | all / conditional | Yes | Describe the actual constructed dataset, verified published evidence or exact mathematical object. **When:** Include at the point the material is introduced. |
| `completion.fields.sourceCitation`<br>Original published source and date (if relevant) | all / conditional | Yes | A traceable real citation only when an external source was actually used. **When:** An original external source is used. |
| `completion.fields.actualMethod`<br>How did I actually obtain or define it? | all / conditional | Yes | The fictional student explains the procedure or definitions; constructed-data disclosure stays clear. **When:** Source or definition details are needed by the reader. |
| `completion.fields.variableDefinitions`<br>Important symbols with meanings and units | all / conditional | Yes | Define meaningful variables at first use; preserve units and notation across all outputs. **When:** New variables or units need defining. |
| `completion.fields.specialistTerms`<br>Any important non-mathematical specialist words | all / conditional | Yes | Briefly explain only terms needed by a mathematically literate reader. **When:** An unfamiliar contextual term is necessary. |
| `completion.fields.conclusionExtension`<br>A worthwhile future mathematical question (if any) | all / conditional | Yes | One justified future question following from the findings; do not invent a compulsory extension. **When:** A worthwhile unresolved question remains. |
| `completion.fields.firstMathsBridgePlacement`<br>Have I already explained why I am starting here? | all / metadata | No | Select intro or before consistently and print the bridge only once. |
| `completion.fields.dataStatus`<br>What starting material is ready? | all / metadata | No | Set the evidence state consistently; a saved plan does not count as completed mathematics. |
| `completion.fields.actualSourceType`<br>Type of actual source | all / metadata | No | Match primary, secondary or theoretical to the actual source record. |
| `completion.fields.draftComplete`<br>Is the draft complete? | all / metadata | No | Only the actual authored sample and checked mathematics can support a complete-draft state. |
| `completion.fields.statisticalPopulation`<br>Population or group the analysis could describe | empirical / conditional | Yes | Define the actual inference scope. **When:** The investigation draws an empirical comparison or statistical conclusion. |
| `completion.fields.samplingMethod`<br>How observations were actually selected | empirical / conditional | Yes | Describe the selection actually represented in the fictional scenario. **When:** Sampling is relevant. |
| `completion.fields.samplingRationale`<br>Why is this design relevant to the aim? | empirical / conditional | Yes | Tie the sampling choice to the aim and its limits. **When:** Sampling is relevant. |
| `completion.fields.sampleSize`<br>Sample size or relevant counts | empirical / conditional | Yes | Give counts that reproduce from the evidence, including separate groups/partitions. **When:** Counts are relevant. |
| `completion.fields.pairing`<br>For paired data, were measurements genuinely matched? (if applicable) | empirical / conditional | Yes | Explain the observation pairing or repeated-measure structure. **When:** Paired quantities or repeated measurements are used. |
| `completion.fields.responseBias`<br>Potential selection, response or group-comparison issue | empirical / conditional | Yes | Explain the concrete consequence for generalisation, comparison or interpretation. **When:** A consequential selection or group issue exists. |
| `completion.fields.dataCleaning`<br>Missing, filtered or excluded values and why (if applicable) | empirical / conditional | Yes | State the actual rule and its effect; never remove inconvenient values silently. **When:** Values were missing, filtered, excluded or explicitly checked. |
| `completion.fields.sampleOrCensus`<br>Sample or census? | empirical / metadata | No | Match the authored source description and target population. |
| `completion.fields.modelEvidence`<br>What supports the model? | model / conditional | Yes | Identify the observations, known dimensions or stated assumptions supporting the model. **When:** A model is developed. |
| `completion.fields.modelInputs`<br>Variables, parameters, units and sources | model / conditional | Yes | Define each model input/parameter and keep measured and fitted quantities distinct. **When:** A model is developed. |
| `completion.fields.modelAssumptions`<br>Which simplifications matter? | model / conditional | Yes | State the assumptions that determine the model and their mathematical consequences. **When:** A model is developed. |
| `completion.fields.modelDomain`<br>What input range or constraints make sense? | model / conditional | Yes | State the feasible or evidence-supported domain and units. **When:** A model is developed. |
| `completion.fields.modelValidation`<br>How could the model be checked, if feasible? | model / conditional | Yes | For a completed sample, identify the actual performed validation and its limits. **When:** A meaningful validation is feasible. |
| `completion.fields.modelAlternative`<br>An alternative model worth considering (optional) | model / conditional | Yes | Name a mathematically plausible alternative and why the findings motivate it. **When:** An alternative is genuinely considered. |
| `completion.fields.theoreticalObject`<br>What mathematical object, structure or conjecture is involved? | theory / conditional | Yes | State the precise object, conjecture and domain. **When:** A theoretical argument is used. |
| `completion.fields.theoreticalCase`<br>One small useful case or potential counterexample | theory / conditional | Yes | Show an illuminating exact case and explain what it can and cannot establish. **When:** A case helps introduce the argument. |
| `completion.fields.theoreticalAssumptions`<br>Which assumptions, restrictions or terms matter? | theory / conditional | Yes | State positivity, integrality, domain or other conditions needed for the proof. **When:** A theoretical argument is used. |
| `completion.fields.alternativeMethod`<br>Another genuinely feasible method | all / conditional | Yes | A specific alternative relevant to the same aim. **When:** A method comparison is useful. |
| `completion.fields.chosenMethod`<br>Which method did you actually choose? | all / conditional | Yes | Name the actual choice and keep it consistent with the performed mathematics. **When:** The method-choice support screen is relevant. |
| `completion.fields.methodLimitation`<br>Most consequential limitation of your actual source or method | all / conditional | Yes | Identify an actual mathematical restriction, not a generic practical inconvenience. **When:** The restriction affects the result. |
| `completion.fields.limitationConsequence`<br>How might it affect the result or restrict a conclusion? | all / conditional | Yes | Explain the direction or scope of the mathematical effect. **When:** A consequential limitation is identified. |
| `completion.fields.limitationMitigation`<br>What did you actually do to reduce or check it? | all / conditional | Yes | Describe a performed check or state the unresolved constraint honestly. **When:** A limitation was investigated or remains unresolved. |
| `completion.fields.limitationAcceptable`<br>What can you still reasonably conclude? | all / conditional | Yes | Give the strongest defensible claim after the limitation. **When:** A consequential limitation is identified. |
| `completion.fields.accuracyForResult`<br>Is the display defensible? | all / conditional | Yes | Explain precision only where it changes this result or interpretation. **When:** Result accuracy is consequential. |
| `completion.fields.predictionComparison`<br>How does the result compare with your starting prediction, conjecture or hope? | all / conditional | Yes | Compare the actual result with the genuine earlier expectation. **When:** An earlier prediction exists. |
| `completion.fields.benefitFinding`<br>What might this mean for the intended beneficiary? | all / conditional | Yes | A cautious implication supported by the mathematics. **When:** A supported practical or explanatory implication exists. |
| `completion.fields.surpriseReason`<br>What differs from my expectation, or is uncertain? | all / conditional | Yes | Identify the particular unexpected result. **When:** A surprise genuinely arises. |
| `completion.fields.surpriseCheck`<br>One plausible mathematical or source-based check | all / conditional | Yes | Explain the specific check and distinguish completed checking from future work. **When:** An unexpected result needs investigation. |
| `completion.fields.pmccInterpretation`<br>What value or finding did I calculate and what does it mean? | all / conditional | Yes | Interpret the calculated coefficient as linear association in context. **When:** Pearson correlation was actually calculated. |
| `completion.fields.technologyInput`<br>Inputs or mathematical operation used | all / conditional | Yes | Explain the mathematical operation and actual inputs, not software clicks. **When:** Technology produced a result. |
| `completion.fields.technologyOutcome`<br>What numerical or graphical output was produced? | all / conditional | Yes | Give the actual checked output. **When:** Technology produced a result. |
| `completion.fields.technologyInterpretation`<br>What does that output mathematically mean for the aim? | all / conditional | Yes | Demonstrate understanding of the output in the investigation. **When:** Technology produced a result. |
| `completion.fields.researchedUnderstanding`<br>What have I learned about how it works? | all / conditional | Yes | Explain only the genuinely unfamiliar idea and its relevant reasoning. **When:** New mathematics was actually researched. |
| `completion.fields.mathsLearning`<br>What did learning this change about my investigation? | all / conditional | Yes | A concrete conceptual insight that changed the mathematics. **When:** Genuine conceptual learning occurred. |
| `completion.fields.changedSincePlanning`<br>What has changed since Planning? (optional) | all / conditional | No | A specific student account of a change, consistent with preserved original intentions. **When:** A meaningful change occurred. |
| `completion.fields.dataStatusSummary`<br>One important uncertainty still to resolve (optional) | all / conditional | No | A specific remaining source or parameter question. **When:** An unresolved issue affects the work. |
| `completion.fields.firstDefinitions`<br>Variables, units or assumptions the reader needs here | all / conditional | No | Only definitions not already supplied; the narrative prints each once. **When:** Optional first-step preparation. |
| `completion.fields.firstPresentation`<br>Check title, labels, axes, units, source and readable precision | all / conditional | No | Record a specific performed check or repair. **When:** The optional first-presentation check is used. |
| `completion.fields.firstResultSummary`<br>What is the essential local takeaway? | all / conditional | No | A concise finding consistent with the actual first entry. **When:** The optional observation screen is used. |
| `completion.fields.nextQuestion`<br>What mathematical question remains unanswered? (if any) | all / conditional | No | The first-stage transition question; keep consistent with that entry, not a global replacement for all later stages. **When:** After a real first-stage result. |
| `completion.fields.nextReason`<br>My written bridge to the next step (or conclusion) | all / conditional | No | The first-stage transition rationale; the ordered narrative selects it once. **When:** After a real first-stage result. |
| `completion.fields.nextMethod`<br>Which technique might answer THAT question? | all / conditional | No | The next chosen technique follows the actual finding. **When:** Another stage is justified. |
| `completion.fields.courseWhy`<br>What mathematical question does this technique answer? | all / conditional | No | A specific scope justification rather than a claim of difficulty or marks. **When:** Course suitability is being reviewed. |
| `completion.fields.researchedMethod`<br>Which new mathematical idea did I use? | all / conditional | No | Name the genuinely new idea and source. **When:** New mathematics was actually researched. |
| `completion.fields.presentationIssue`<br>One issue with labels, graphs, flow or layout | all / conditional | No | A specific review finding or performed correction. **When:** A presentation review is recorded. |
| `completion.fields.referencesIssue`<br>Are data sources, technology and borrowed techniques referenced? | all / conditional | No | Specific citation evidence or an actual missing reference. **When:** A references review is recorded. |
| `completion.fields.notationIssue`<br>Notation or mathematical presentation to repair | all / conditional | No | An identified equation, symbol, unit or approximation-sign issue. **When:** A notation review is recorded. |
| `completion.fields.feedbackAction`<br>One specific correction and how I will verify it | all / conditional | No | A specific self-revision or response to actual feedback; never invent teacher comments. **When:** A revision action is recorded. |
| `completion.fields.finalProofread`<br>What still needs proofreading or verifying? | all / conditional | No | Actual remaining issues or evidence of completed checks. **When:** Final self-review is represented. |
| `completion.fields.technologyTool`<br>Which software, GDC, code or spreadsheet was actually used? | all / metadata | No | Name only an actual tool used for the saved evidence. |
| `completion.fields.technologyForEntryId`<br>Mathematical stage using this technology | all / metadata | No | Link to the entry that produced the explained output. |
| `completion.fields.firstType`<br>First representation type | all / metadata | No | The type must match the actual first entry or saved figure. |
| `completion.fields.firstObservedFeature`<br>First observed feature | all / metadata | No | A compatibility mirror of the actual first-entry finding; do not author a second inconsistent observation. |
| `completion.fields.scatterPattern`<br>Actual scatter pattern | all / metadata | No | Choose the observed shape, not the hoped-for prediction. |
| `completion.fields.scatterDetail`<br>Relevant scatter detail | all / metadata | No | An actual feature used by contextual guidance. |
| `completion.fields.scatterAimRelevance`<br>Would further mathematics advance the original aim? | all / metadata | No | Select yes, no or unsure from the actual finding; the current bivariate guidance uses this decision. |
| `completion.fields.pairedDataType`<br>Paired-data structure | all / metadata | No | Match the observations and method. |
| `completion.fields.pmccSignal`<br>Calculated correlation outcome | all / metadata | No | Select the outcome supported by the calculated coefficient and graph. |
| `completion.fields.permissionStatus`<br>Current permissions or restrictions | all / external | No | Do not imply external approval from the presence of sample data. |
| `completion.fields.permissionNotes`<br>What restriction or decision still matters? | all / external | No | A relevant open restriction or an explicit no-personal-data scenario. |
| `completion.fields.courseConcern`<br>Course-suitability concern | all / external | No | An open scope question; no invented teacher judgement. |
| `completion.fields.theoreticalQuestion`<br>Anything to discuss about course suitability? | all / external | No | A student question, not a teacher answer. |
| `completion.fields.writtenFeedback`<br>What written feedback did I actually receive, if any? | all / external | No | Leave empty in fictional teaching samples unless actual authorised feedback exists. |
| `completion.fields.finalRequirements`<br>Confirmed submission and formatting requirements | all / external | No | Do not invent current school deadlines, candidate identity, submission or authentication. |
| `completion.fields.accuracyQuantity`<br>Quantity measured or sourced | all / metadata | No | Accuracy editor/current-selection field. The saved completion.accuracyDecisions[] record owns the linked quantity-specific decision. |
| `completion.fields.accuracySymbol`<br>Symbol (optional) | all / metadata | No | Accuracy editor/current-selection field. The saved completion.accuracyDecisions[] record owns the linked quantity-specific decision. |
| `completion.fields.accuracyUnit`<br>Unit | all / metadata | No | Accuracy editor/current-selection field. The saved completion.accuracyDecisions[] record owns the linked quantity-specific decision. |
| `completion.fields.accuracyResolution`<br>Instrument/source resolution and uncertainty, if known | all / metadata | No | Accuracy editor/current-selection field. The saved completion.accuracyDecisions[] record owns the linked quantity-specific decision. |
| `completion.fields.accuracyReason`<br>Why does that accuracy make sense? | all / metadata | No | Accuracy editor/current-selection field. The saved completion.accuracyDecisions[] record owns the linked quantity-specific decision. |
| `completion.fields.accuracyPolicy`<br>Reasonable display accuracy for calculated results | all / metadata | No | Accuracy editor/current-selection field. The saved completion.accuracyDecisions[] record owns the linked quantity-specific decision. |
| `completion.fields.firstOutputIntroduction`<br>My words to introduce this figure, table or calculation | all / conditional | No | Fallback used only before a first entry exists. Completed examples use entries[0] and must not create a conflicting duplicate. **When:** No first mathematical entry exists yet. |
| `completion.fields.firstWorkTitle`<br>Title or name of this step | all / conditional | No | Fallback used only before a first entry exists. Completed examples use entries[0] and must not create a conflicting duplicate. **When:** No first mathematical entry exists yet. |
| `completion.fields.firstWorkResult`<br>What did you actually produce or calculate? | all / conditional | No | Fallback used only before a first entry exists. Completed examples use entries[0] and must not create a conflicting duplicate. **When:** No first mathematical entry exists yet. |
| `completion.fields.firstWorkLocation`<br>Where does it appear in my IA? (optional) | all / conditional | No | Fallback used only before a first entry exists. Completed examples use entries[0] and must not create a conflicting duplicate. **When:** No first mathematical entry exists yet. |
| `completion.fields.firstWorkStatus`<br>Has this mathematical work been produced? | all / conditional | No | Fallback used only before a first entry exists. Completed examples use entries[0] and must not create a conflicting duplicate. **When:** No first mathematical entry exists yet. |
| `completion.fields.firstInterpretation`<br>My reflection on what this result means | all / conditional | No | Fallback used only before a first entry exists. Completed examples use entries[0] and must not create a conflicting duplicate. **When:** No first mathematical entry exists yet. |
| `completion.fields.blocker`<br>What is blocking me? | all / conditional | No | Optional contextual-help note. Populate only when the fictional journey actually uses this support; it is not an extra IA paragraph. **When:** The corresponding contextual-help branch is used. |
| `completion.fields.blockedBy`<br>Specific obstacle | all / conditional | No | Optional contextual-help note. Populate only when the fictional journey actually uses this support; it is not an extra IA paragraph. **When:** The corresponding contextual-help branch is used. |
| `completion.fields.alternateSource`<br>Alternative source to investigate | all / conditional | No | Optional contextual-help note. Populate only when the fictional journey actually uses this support; it is not an extra IA paragraph. **When:** The corresponding contextual-help branch is used. |
| `completion.fields.alternateFit`<br>Why that alternative fits | all / conditional | No | Optional contextual-help note. Populate only when the fictional journey actually uses this support; it is not an extra IA paragraph. **When:** The corresponding contextual-help branch is used. |
| `completion.fields.limitedDataIssue`<br>Issue with the available data | all / conditional | No | Optional contextual-help note. Populate only when the fictional journey actually uses this support; it is not an extra IA paragraph. **When:** The corresponding contextual-help branch is used. |
| `completion.fields.oneSafeAction`<br>One useful next action | all / conditional | No | Optional contextual-help note. Populate only when the fictional journey actually uses this support; it is not an extra IA paragraph. **When:** The corresponding contextual-help branch is used. |
| `completion.fields.stuckFollowup`<br>Follow-up after help | all / conditional | No | Optional contextual-help note. Populate only when the fictional journey actually uses this support; it is not an extra IA paragraph. **When:** The corresponding contextual-help branch is used. |
| `completion.fields.writingLocation`<br>Where this writing belongs | all / conditional | No | Optional contextual-help note. Populate only when the fictional journey actually uses this support; it is not an extra IA paragraph. **When:** The corresponding contextual-help branch is used. |
| `completion.fields.writingDecision`<br>Writing decision | all / conditional | No | Optional contextual-help note. Populate only when the fictional journey actually uses this support; it is not an extra IA paragraph. **When:** The corresponding contextual-help branch is used. |
| `completion.fields.methodAim`<br>Earlier method-to-aim note | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. |
| `completion.fields.actualDate`<br>Earlier source date | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. |
| `completion.fields.courseLevel`<br>Earlier broad course check to review | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. |
| `completion.fields.accuracyDataType`<br>Earlier accuracy data type | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. |
| `completion.fields.nextStepSelected`<br>Earlier next-step summary | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. |
| `completion.fields.sourcePopulation`<br>Earlier source population | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. |
| `completion.fields.dataCount`<br>Earlier evidence count | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. |
| `completion.fields.collectionStatus`<br>Earlier collection status | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. |
| `completion.fields.groupFairness`<br>Earlier group-fairness note | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. |
| `completion.fields.modelSensitivity`<br>Earlier model-sensitivity note | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. |
| `completion.fields.sourceReferences`<br>Earlier source-reference note | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. |
| `completion.fields.aimLinkedResult`<br>Earlier result-to-aim note | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. |
| `completion.fields.nextLocation`<br>Earlier next-step location | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. |
| `completion.fields.pmccMeaning`<br>Earlier correlation meaning | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. |
| `completion.fields.conclusionEvidence`<br>Earlier supporting-results notes | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. |
| `completion.fields.conclusionUncertainty`<br>Earlier uncertainty and limitation notes | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. |
| `completion.fields.conclusionAdvice`<br>Earlier recommendations or decisions | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. |
| `completion.fields.conclusionFocus`<br>Earlier notes on tightening the ending | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. |
| `completion.fields.draftCriteria`<br>Earlier A–E draft notes | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. |
| `completion.fields.revisionEvidence`<br>Earlier revision evidence | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. |
| `completion.fields.finalCriteria`<br>Earlier A–E final notes | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. |

### Repeated mathematical stages

| Path / current label | Applies to / category | Narrative | Student answer or treatment |
| --- | --- | --- | --- |
| `entries[].purpose`<br>Why is the chosen approach appropriate here? | stage / authored | Yes | For the first entry, introduce the output; for later entries, explain why the chosen approach follows the previous finding. |
| `entries[].result`<br>What did you actually produce or calculate? | stage / authored | Yes | Actual worked mathematics, equations, proof or a checked graphical result; never advice, a placeholder or a future intention. |
| `entries[].interpretation`<br>What does this result mean for my aim? | stage / authored | Yes | Explain the specific mathematical meaning in context immediately after the output. |
| `entries[].title`<br>What mathematical question is this stage investigating? | stage / authored | Yes | A specific stage question used as the section heading, not a generic technique label. |
| `entries[].localTakeaway`<br>One mathematical takeaway from this stage | stage / authored | No | A concise established finding for adaptive guidance; avoid repeating the entire interpretation. |
| `entries[].bridge`<br>My linking sentence from the previous result | stage / conditional | Yes | A first-person transition from the preceding actual finding; select once rather than repeating the previous nextWhy. **When:** Every later stage with a predecessor. |
| `entries[].limitations`<br>Important limitation, assumption or uncertainty (if relevant) | stage / conditional | Yes | Only a restriction that affects this result or what can be inferred. **When:** A consequential restriction exists. |
| `entries[].nextWhy`<br>My bridge to another stage, or explanation for concluding | stage / conditional | Yes | Explain why the next question matters or why this investigation can now conclude. **When:** A transition or stopping explanation is needed. |
| `entries[].knowledgeNotes`<br>How does that unfamiliar mathematics work here? | stage / conditional | Yes | Explain the genuinely unfamiliar idea at its first use. **When:** Knowledge is mixed or outside. |
| `entries[].understandingExample`<br>A relevant worked step or small demonstration (optional) | stage / conditional | Yes | A relevant demonstration that establishes understanding. **When:** Unfamiliar mathematics benefits from a small worked case. |
| `entries[].researchSource`<br>Original resource consulted (if relevant) | stage / conditional | Yes | An actual traceable source for an unfamiliar idea; no fabricated citation. **When:** An external mathematical source was used. |
| `entries[].mathsInsight`<br>My genuine new mathematical insight | stage / conditional | Yes | A real structural insight and how it affected the investigation. **When:** There is a substantive new insight. |
| `entries[].methodChangeReason`<br>Has a limitation of the earlier work led me to change method? (optional) | stage / conditional | Yes | The actual reason for a changed method, tied to an earlier finding. **When:** The method genuinely changed. |
| `entries[].nextQuestion`<br>What mathematical question remains unanswered? (optional) | stage / conditional | Yes | A specific question raised by this result, placed before the reason for following it; a final question may identify a clearly future extension. **When:** Another mathematical question exists. |
| `entries[].observationText`<br>What can you really observe? | stage / conditional | No | A concrete feature of the actual output, without replacing interpretation. **When:** The optional observation screen is used. |
| `entries[].unfamiliarComponent`<br>Exactly which idea is new? | stage / conditional | No | Identify only the unfamiliar component. **When:** Knowledge is mixed or outside. |
| `entries[].priorLearningOnly`<br>Check course-level mathematical depth (optional) | stage / metadata | No | Select no, yes or unsure only when using this optional current check; it is a student scope judgement, not verified teacher approval. |
| `entries[].id`<br>Mathematical record ID | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].phase`<br>First or substantial stage | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].fromEntryId`<br>Previous mathematical record | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].previousTakeaway`<br>Earlier confirmed mathematical finding | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].technique`<br>Mathematical technique or argument | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].methodId`<br>Mathematical method | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].knowledge`<br>Familiarity with this technique | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].kind`<br>Type of mathematics | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].status`<br>Has this mathematics actually been produced? | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].resultRef`<br>Where does it appear in my IA? (optional) | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].observation`<br>Observed-pattern category | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].resultSignal`<br>My interpretation so far | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].journeyOutcome`<br>My interpretation of this genuine result | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].journeyDirection`<br>Chosen next direction | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].journeySourceOutcome`<br>Previous outcome informing this choice | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].journeySourceSignature`<br>Signature of preceding evidence | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].journeyRouteId`<br>Investigative pathway | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].graphFigureId`<br>Linked graph | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].imageTraceId`<br>Linked calibrated trace | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].statFigureId`<br>Linked statistical diagram | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].tableFigureId`<br>Linked table | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].voronoiFigureId`<br>Linked Voronoi diagram | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].geometryFigureId`<br>Linked geometry diagram | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].probabilityFigureId`<br>Linked probability diagram | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].figureRefs`<br>All figures belonging to this stage | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].accuracyRefs`<br>Linked accuracy decisions | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].sourceRefs`<br>Linked actual sources | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].reviewNeeded`<br>Dependent work requiring review | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].reviewReason`<br>Reason to revisit the mathematics | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].reviewCheckedAt`<br>Student review date | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].createdAt`<br>Record creation time | stage / metadata | No | Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose. |
| `entries[].accuracyRef`<br>Earlier single accuracy reference | stage / legacy | No | Retain old imports; new samples use accuracyRefs[]. |

### Saved quantities and precision plans

| Path / current label | Applies to / category | Narrative | Student answer or treatment |
| --- | --- | --- | --- |
| `planning.primaryQuantities[].id`<br>Planned quantity reference | primary / metadata | No | Stable saved quantity ID. |
| `planning.primaryQuantities[].name`<br>Quantity or category | primary / metadata | No | The named quantity actually proposed for collection. |
| `planning.primaryQuantities[].unit`<br>Unit (only if needed) | primary / metadata | No | A meaningful unit; exact categories need no artificial unit. |
| `planning.accuracyPlans[].id`<br>Planned accuracy reference | empirical / metadata | No | Stable saved plan ID. |
| `planning.accuracyPlans[].source`<br>Primary or secondary source | empirical / metadata | No | Match the source branch. |
| `planning.accuracyPlans[].quantity`<br>Quantity / column | empirical / metadata | No | Match a real planned quantity. |
| `planning.accuracyPlans[].unit`<br>Unit (if any) | empirical / metadata | No | Use the same unit throughout. |
| `planning.accuracyPlans[].resolution`<br>Recording increment or published rounding | empirical / metadata | No | Do not silently treat resolution as true error. |
| `planning.accuracyPlans[].basis`<br>Basis of accuracy | empirical / metadata | No | Use an explicit exact/measured/published/unknown basis. |
| `planning.accuracyPlans[].uncertainty`<br>Known or possible uncertainty | empirical / metadata | No | A justified bound or an explicit unknown, not invented precision. |

### Saved actual accuracy decisions

| Path / current label | Applies to / category | Narrative | Student answer or treatment |
| --- | --- | --- | --- |
| `completion.accuracyDecisions[].quantity`<br>Quantity measured or sourced | empirical / conditional | Yes | Identify the actual input or exact quantity. **When:** Accuracy matters for a measured/modelled result. |
| `completion.accuracyDecisions[].symbol`<br>Symbol (optional) | empirical / conditional | Yes | Use the same meaningful symbol as the equations. **When:** A symbol is useful. |
| `completion.accuracyDecisions[].unit`<br>Unit | empirical / conditional | Yes | Use consistent units. **When:** The quantity has units. |
| `completion.accuracyDecisions[].resolution`<br>Instrument/source resolution and uncertainty, if known | empirical / conditional | Yes | Distinguish measurement increment, known tolerance and reported rounding. **When:** A measurement or rounded source is used. |
| `completion.accuracyDecisions[].policy`<br>Reasonable display accuracy for calculated results | empirical / conditional | Yes | A defensible exact-versus-approximate and reporting policy. **When:** Results require a precision decision. |
| `completion.accuracyDecisions[].reason`<br>Why does that accuracy make sense? | empirical / conditional | Yes | Tie the decision to actual uncertainty or sensitivity. **When:** Results require a precision decision. |
| `completion.accuracyDecisions[].id`<br>Accuracy decision reference | empirical / metadata | No | Stable ID linked from the affected entries. |
| `completion.accuracyDecisions[].sourceId`<br>Source reference | empirical / metadata | No | Link the decision to the source whose inputs it qualifies. |

### Source-record identity

| Path / current label | Applies to / category | Narrative | Student answer or treatment |
| --- | --- | --- | --- |
| `completion.sourceRecords[].id`<br>Actual source reference | all / metadata | No | Stable ID linked from the entries using this material. |
| `completion.sourceRecords[].legacy`<br>Earlier source record | all / metadata | No | False for a newly authored source; do not mark obsolete inherited text as current evidence. |

### Saved source fields

| Path / current label | Applies to / category | Narrative | Student answer or treatment |
| --- | --- | --- | --- |
| `completion.sourceRecords[].fields.dataStatus`<br>What starting material is ready? | all / metadata | No | Set the evidence state consistently; a saved plan does not count as completed mathematics. This is the saved source version; the active editor must agree when this source is selected. |
| `completion.sourceRecords[].fields.actualSource`<br>What evidence or mathematical starting material do I actually have? | all / conditional | Yes | Describe the actual constructed dataset, verified published evidence or exact mathematical object. This is the saved source version; the active editor must agree when this source is selected. **When:** Include at the point the material is introduced. |
| `completion.sourceRecords[].fields.actualSourceType`<br>Type of actual source | all / metadata | No | Match primary, secondary or theoretical to the actual source record. This is the saved source version; the active editor must agree when this source is selected. |
| `completion.sourceRecords[].fields.sourceCitation`<br>Original published source and date (if relevant) | all / conditional | Yes | A traceable real citation only when an external source was actually used. This is the saved source version; the active editor must agree when this source is selected. **When:** An original external source is used. |
| `completion.sourceRecords[].fields.actualMethod`<br>How did I actually obtain or define it? | all / conditional | Yes | The fictional student explains the procedure or definitions; constructed-data disclosure stays clear. This is the saved source version; the active editor must agree when this source is selected. **When:** Source or definition details are needed by the reader. |
| `completion.sourceRecords[].fields.actualDate`<br>Earlier source date | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. This is the saved source version; the active editor must agree when this source is selected. |
| `completion.sourceRecords[].fields.sourcePopulation`<br>Earlier source population | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. This is the saved source version; the active editor must agree when this source is selected. |
| `completion.sourceRecords[].fields.dataCount`<br>Earlier evidence count | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. This is the saved source version; the active editor must agree when this source is selected. |
| `completion.sourceRecords[].fields.collectionStatus`<br>Earlier collection status | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. This is the saved source version; the active editor must agree when this source is selected. |
| `completion.sourceRecords[].fields.statisticalPopulation`<br>Population or group the analysis could describe | empirical / conditional | Yes | Define the actual inference scope. This is the saved source version; the active editor must agree when this source is selected. **When:** The investigation draws an empirical comparison or statistical conclusion. |
| `completion.sourceRecords[].fields.sampleOrCensus`<br>Sample or census? | empirical / metadata | No | Match the authored source description and target population. This is the saved source version; the active editor must agree when this source is selected. |
| `completion.sourceRecords[].fields.samplingMethod`<br>How observations were actually selected | empirical / conditional | Yes | Describe the selection actually represented in the fictional scenario. This is the saved source version; the active editor must agree when this source is selected. **When:** Sampling is relevant. |
| `completion.sourceRecords[].fields.samplingRationale`<br>Why is this design relevant to the aim? | empirical / conditional | Yes | Tie the sampling choice to the aim and its limits. This is the saved source version; the active editor must agree when this source is selected. **When:** Sampling is relevant. |
| `completion.sourceRecords[].fields.sampleSize`<br>Sample size or relevant counts | empirical / conditional | Yes | Give counts that reproduce from the evidence, including separate groups/partitions. This is the saved source version; the active editor must agree when this source is selected. **When:** Counts are relevant. |
| `completion.sourceRecords[].fields.responseBias`<br>Potential selection, response or group-comparison issue | empirical / conditional | Yes | Explain the concrete consequence for generalisation, comparison or interpretation. This is the saved source version; the active editor must agree when this source is selected. **When:** A consequential selection or group issue exists. |
| `completion.sourceRecords[].fields.pairing`<br>For paired data, were measurements genuinely matched? (if applicable) | empirical / conditional | Yes | Explain the observation pairing or repeated-measure structure. This is the saved source version; the active editor must agree when this source is selected. **When:** Paired quantities or repeated measurements are used. |
| `completion.sourceRecords[].fields.groupFairness`<br>Earlier group-fairness note | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. This is the saved source version; the active editor must agree when this source is selected. |
| `completion.sourceRecords[].fields.dataCleaning`<br>Missing, filtered or excluded values and why (if applicable) | empirical / conditional | Yes | State the actual rule and its effect; never remove inconvenient values silently. This is the saved source version; the active editor must agree when this source is selected. **When:** Values were missing, filtered, excluded or explicitly checked. |
| `completion.sourceRecords[].fields.modelEvidence`<br>What supports the model? | model / conditional | Yes | Identify the observations, known dimensions or stated assumptions supporting the model. This is the saved source version; the active editor must agree when this source is selected. **When:** A model is developed. |
| `completion.sourceRecords[].fields.modelInputs`<br>Variables, parameters, units and sources | model / conditional | Yes | Define each model input/parameter and keep measured and fitted quantities distinct. This is the saved source version; the active editor must agree when this source is selected. **When:** A model is developed. |
| `completion.sourceRecords[].fields.modelAssumptions`<br>Which simplifications matter? | model / conditional | Yes | State the assumptions that determine the model and their mathematical consequences. This is the saved source version; the active editor must agree when this source is selected. **When:** A model is developed. |
| `completion.sourceRecords[].fields.modelDomain`<br>What input range or constraints make sense? | model / conditional | Yes | State the feasible or evidence-supported domain and units. This is the saved source version; the active editor must agree when this source is selected. **When:** A model is developed. |
| `completion.sourceRecords[].fields.modelValidation`<br>How could the model be checked, if feasible? | model / conditional | Yes | For a completed sample, identify the actual performed validation and its limits. This is the saved source version; the active editor must agree when this source is selected. **When:** A meaningful validation is feasible. |
| `completion.sourceRecords[].fields.modelAlternative`<br>An alternative model worth considering (optional) | model / conditional | Yes | Name a mathematically plausible alternative and why the findings motivate it. This is the saved source version; the active editor must agree when this source is selected. **When:** An alternative is genuinely considered. |
| `completion.sourceRecords[].fields.modelSensitivity`<br>Earlier model-sensitivity note | all / legacy | No | Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample. This is the saved source version; the active editor must agree when this source is selected. |
| `completion.sourceRecords[].fields.theoreticalObject`<br>What mathematical object, structure or conjecture is involved? | theory / conditional | Yes | State the precise object, conjecture and domain. This is the saved source version; the active editor must agree when this source is selected. **When:** A theoretical argument is used. |
| `completion.sourceRecords[].fields.theoreticalCase`<br>One small useful case or potential counterexample | theory / conditional | Yes | Show an illuminating exact case and explain what it can and cannot establish. This is the saved source version; the active editor must agree when this source is selected. **When:** A case helps introduce the argument. |
| `completion.sourceRecords[].fields.theoreticalAssumptions`<br>Which assumptions, restrictions or terms matter? | theory / conditional | Yes | State positivity, integrality, domain or other conditions needed for the proof. This is the saved source version; the active editor must agree when this source is selected. **When:** A theoretical argument is used. |
| `completion.sourceRecords[].fields.theoreticalQuestion`<br>Anything to discuss about course suitability? | all / external | No | A student question, not a teacher answer. This is the saved source version; the active editor must agree when this source is selected. |
| `completion.sourceRecords[].fields.alternativeMethod`<br>Another genuinely feasible method | all / conditional | Yes | A specific alternative relevant to the same aim. This is the saved source version; the active editor must agree when this source is selected. **When:** A method comparison is useful. |
| `completion.sourceRecords[].fields.chosenMethod`<br>Which method did you actually choose? | all / conditional | Yes | Name the actual choice and keep it consistent with the performed mathematics. This is the saved source version; the active editor must agree when this source is selected. **When:** The method-choice support screen is relevant. |
| `completion.sourceRecords[].fields.methodReason`<br>My method and why I chose it | all / authored | Yes | Name and justify the first method in this investigation without a routine syllabus tutorial. This is the saved source version; the active editor must agree when this source is selected. |
| `completion.sourceRecords[].fields.methodLimitation`<br>Most consequential limitation of your actual source or method | all / conditional | Yes | Identify an actual mathematical restriction, not a generic practical inconvenience. This is the saved source version; the active editor must agree when this source is selected. **When:** The restriction affects the result. |
| `completion.sourceRecords[].fields.limitationConsequence`<br>How might it affect the result or restrict a conclusion? | all / conditional | Yes | Explain the direction or scope of the mathematical effect. This is the saved source version; the active editor must agree when this source is selected. **When:** A consequential limitation is identified. |
| `completion.sourceRecords[].fields.limitationMitigation`<br>What did you actually do to reduce or check it? | all / conditional | Yes | Describe a performed check or state the unresolved constraint honestly. This is the saved source version; the active editor must agree when this source is selected. **When:** A limitation was investigated or remains unresolved. |
| `completion.sourceRecords[].fields.limitationAcceptable`<br>What can you still reasonably conclude? | all / conditional | Yes | Give the strongest defensible claim after the limitation. This is the saved source version; the active editor must agree when this source is selected. **When:** A consequential limitation is identified. |
| `completion.sourceRecords[].fields.dataAimLink`<br>How does this first mathematics connect to my aim? | all / authored | Yes | One or two student sentences linking the first mathematical question to the aim; print once at the selected placement. This is the saved source version; the active editor must agree when this source is selected. |
| `completion.sourceRecords[].fields.dataStatusSummary`<br>One important uncertainty still to resolve (optional) | all / conditional | No | A specific remaining source or parameter question. This is the saved source version; the active editor must agree when this source is selected. **When:** An unresolved issue affects the work. |

### Saved consequential limitations

| Path / current label | Applies to / category | Narrative | Student answer or treatment |
| --- | --- | --- | --- |
| `completion.confirmedLimitations[].explanation`<br>What applies | stage / conditional | Yes | A specific confirmed mathematical restriction. **When:** The limitation is relevant to a particular result. |
| `completion.confirmedLimitations[].consequence`<br>Mathematical consequence | stage / conditional | Yes | Explain its effect on the inference or numerical result. **When:** A confirmed limitation exists. |
| `completion.confirmedLimitations[].mitigation`<br>Checking or mitigation | stage / conditional | Yes | A performed check or an honest unresolved restriction. **When:** A confirmed limitation exists. |
| `completion.confirmedLimitations[].id`<br>Limitation reference | stage / metadata | No | Stable record ID. |
| `completion.confirmedLimitations[].sourceId`<br>Related source | stage / metadata | No | Link only the affected source. |
| `completion.confirmedLimitations[].stage`<br>Relevant writing stage | stage / metadata | No | Link the relevant current screen. |
| `completion.confirmedLimitations[].entryId`<br>Related mathematical stage | stage / metadata | No | Link the result actually affected. |
| `completion.confirmedLimitations[].location`<br>Where discussed in the IA | stage / metadata | No | An actual narrative section or equation. |
| `completion.confirmedLimitations[].at`<br>Recorded date | stage / metadata | No | A record timestamp, not a teacher verification. |

### Pathway and conclusion links

| Path / current label | Applies to / category | Narrative | Student answer or treatment |
| --- | --- | --- | --- |
| `planning.mathSelected`<br>Provisional mathematical techniques | all / metadata | No | Selected menu IDs represent intentions, not performed work. |
| `planning.routeExplorer.selectedRoute`<br>Selected mathematical pathway | all / metadata | No | Exactly the pathway covered by the corresponding brief. |
| `planning.routeExplorer.firstStep`<br>Provisional first mathematical step | all / metadata | No | A planning spark; actual work belongs to the first entry. |
| `completion.conclusionResultIds`<br>Chosen mathematical evidence for the conclusion | all / metadata | No | Reference completed, review-free entries supporting the answer. |

### Review evidence and external process records

| Path / current label | Applies to / category | Narrative | Student answer or treatment |
| --- | --- | --- | --- |
| `completion.review.records.{reviewId}.location`<br>Where in my actual IA? | review / conditional | No | Point to the exact section, figure or equation inspected. **When:** An applicable draft/final review check is recorded. |
| `completion.review.records.{reviewId}.note`<br>My evidence, or why this is not relevant | review / conditional | No | First-person evidence of a performed check or a precise not-applicable explanation; never advice to the reader. **When:** An applicable review check is recorded. |
| `completion.review.records.{reviewId}.action`<br>My specific correction, if needed | review / conditional | No | An identified correction and how I will check it. **When:** A review found something to repair. |
| `completion.review.records.{reviewId}.status`<br>My review status | review / metadata | No | Checked requires evidence; not-applicable requires a reason. |
| `completion.review.records.{reviewId}.entryId`<br>Related mathematical stage (optional) | review / metadata | No | Reference the result actually inspected. |
| `completion.review.records.{reviewId}.checkedAt`<br>Review date | review / metadata | No | A self-review timestamp, not external verification. |
| `completion.review.records.{reviewId}.selfMark`<br>Optional provisional student self-mark | review / external | No | Leave empty in the fictional samples; no marks or attainment are asserted. |
| `completion.review.records.{reviewId}.markLevel`<br>Reference rubric level | review / external | No | Do not turn the teaching example into an assessed exemplar. |
| `completion.review.feedbackItems`<br>Recorded teacher feedback actions | review / external | No | Leave empty unless actual authorised feedback exists; never invent a teacher response. |
| `completion.review.feedbackNote`<br>What feedback did you receive? | review / external | No | No fictional teacher comment. |
| `completion.review.feedbackAction`<br>What will you change? | review / external | No | Do not populate a teacher-feedback editing draft in a new sample. |
| `completion.review.feedbackLocation`<br>Where does this apply in your IA? | review / external | No | No invented feedback location. |
| `completion.review.feedbackEntryId`<br>Related mathematical stage | review / external | No | No fabricated feedback relationship. |
| `teacher.checkpoints`<br>Teacher check-ins | review / external | No | No invented teacher meetings, approval or authentication. |
| `teacher.feedbackStatus`<br>Teacher feedback status | review / external | No | Keep not-requested unless actual feedback exists. |
| `teacher.pendingApproval`<br>Approval still needed | review / external | No | A pending flag may reflect an open question; it never claims approval. |
