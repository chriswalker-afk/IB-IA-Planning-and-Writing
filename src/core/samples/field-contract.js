/**
 * Authorship contract for the current illustrative-sample workflow.
 *
 * `includeInIA` identifies material that may belong in the ordered sample
 * narrative. It does NOT concatenate every populated field, make optional
 * branches compulsory, or promise that an answer is mathematically sound.
 * `[]` denotes an array item; `{reviewId}` denotes a draft/final review record.
 */
import {SOURCE_FIELDS} from '../../completing/evidence-links.js';

const rows = (prefix, appliesTo, category, includeInIA, items) => items.map(
  ([key, label, purpose, when = '']) => ({
    path: prefix + key, label, appliesTo, category, purpose, includeInIA,
    ...(when ? {when} : {})
  })
);
const P = (appliesTo, category, includeInIA, items) => rows('planning.fields.', appliesTo, category, includeInIA, items);
const C = (appliesTo, category, includeInIA, items) => rows('completion.fields.', appliesTo, category, includeInIA, items);
const E = (category, includeInIA, items) => rows('entries[].', 'stage', category, includeInIA, items);

const planning = [
  ...P('all', 'authored', false, [
    ['provisionalTitle', 'My provisional IA title', 'A specific working title consistent with the aim; reuse it as the sample document title.'],
    ['aim', 'What do I want to find out mathematically?', 'A focused first-person mathematical question, including the scope that the conclusion will answer.'],
    ['beneficiary', 'Who might benefit, and how could the answer help?', 'One genuine fictional-student reason for investigating; no promised impact or predetermined answer.'],
    ['motivation', 'Why I care about this question', 'The same personal purpose when the setup screen exposes it; do not create a second competing motivation.']
  ]),
  ...P('all', 'conditional', false, [
    ['idea', 'My starting idea', 'A concise starting observation or curiosity.', 'Only if the chosen starting route displays it.'],
    ['intendedUse', 'What might the findings help us understand or decide?', 'An intended use consistent with the main motivation, without duplicating it in the final narrative.', 'Current setup editing or a preserved earlier note.'],
    ['otherMaths', 'Another technique I might use (optional)', 'A tentative additional method with a mathematical purpose.', 'Only a genuinely considered method outside the selected menu.'],
    ['otherCourseMaths', 'Mathematics I might explore (optional)', 'A course-appropriate mathematical possibility or an honest suitability question.', 'For a course not covered by the AI SL/AA SL menu.'],
    ['mathsRevisedWhy', 'Why might this mathematical direction help? (optional)', 'A reason tied to the aim for revising the provisional method.', 'If the planned mathematics was revised.'],
    ['prediction', 'My tentative prediction or conjecture (optional)', 'An initial expectation, clearly distinguished from the eventual result.', 'If the student makes a prediction.'],
    ['predictionWhy', 'Why do I expect this? (optional)', 'The observation or mathematical argument behind the initial expectation.', 'When a prediction exists.'],
    ['predictionImplication', 'If it were true, what might it mean? (optional)', 'A conditional implication for the original purpose.', 'When a prediction exists and the implication is useful.'],
    ['readinessImprovement', 'One useful next step (optional)', 'A practical, specific planning action rather than generic advice.', 'If evidence access or feasibility needs improvement.'],
    ['unsecured', 'What needs arranging? (optional)', 'A particular outstanding resource or access issue and a realistic next action.', 'Only when practicalBlocker is yes.'],
    ['alternativeMethod', 'Another method or source considered (optional)', 'A feasible alternative considered by the fictional student and why it might differ.', 'If the source or sampling branch calls for an alternative.'],
    ['planIdentifier', 'Optional label for my copy of this plan', 'A sample plan/revision label; not a claim of candidate identity.', 'If useful for the downloadable planning record.']
  ]),
  ...P('all', 'metadata', false, [
    ['ideaStatus', 'Where are you starting?', 'Choose the represented starting route without filling the other mutually exclusive routes.'],
    ['beneficiaryType', 'Who might benefit from my investigation?', 'Choose the category matching the authored motivation.'],
    ['kind', 'What kind of investigation is this?', 'Set statistics, modelling or theoretical to match the investigation.'],
    ['dataSource', 'Where will your data or evidence come from?', 'Choose primary, secondary or both for data; a modelling investigation may instead choose theoretical for defined quantities and assumptions with no collected dataset.'],
    ['dataAvailability', 'What evidence can you work with now?', 'A planning state for observations or defined starting material; it does not independently establish that collection happened.'],
    ['practicalBlocker', 'Is anything essential stopping you getting started?', 'Show the access follow-up only when needed; a model may still require resources to define or check its assumptions.'],
    ['course', 'My IB Maths course', 'Set the intended course honestly; a selected course is not a verified level judgement.'],
    ['assessmentFramework', 'Assessment framework', 'Use the current intended cohort framework; do not convert old projects or imply a mark.'],
    ['predictionId', 'Prediction prompt considered', 'Select a relevant optional prompt; never copy its advice as the answer.'],
    ['mathsOutside', 'Mathematics beyond or uncertain within my course', 'Record the actual scope decision; unfamiliar mathematics still needs explanation.'],
    ['courseSuitability', 'Mathematical suitability self-check', 'A student scope choice, not teacher approval.'],
    ['firstAction', 'Suggested first mathematical step', 'A provisional spark only; the actual first entry remains the source of completed mathematics.'],
    ['firstAccuracy', 'Relevant accuracy spark', 'A concise reflection of saved quantity-specific decisions where the existing spark uses it.']
  ]),
  ...P('empirical', 'metadata', false, [
    ['statisticsContext', 'What form might your data take?', 'Choose paired numerical, groups, categories or a distribution consistently with the evidence.']
  ]),
  ...P('primary', 'conditional', false, [
    ['primaryHow', 'What will you collect, and how?', 'Describe the proposed units, procedure and repeatable conditions in the student voice.', 'Primary or both-source plan.'],
    ['primaryEquipment', 'Equipment or resources', 'Name the actual planned instrument or resource and relevant resolution.', 'When equipment is needed.'],
    ['primaryWhen', 'When could you start?', 'A clearly fictional planning date, not a school-confirmed deadline.', 'If a date helps the sample plan.'],
    ['primaryWhere', 'Where would you collect it?', 'A non-identifying setting consistent with the procedure.', 'Primary collection or observation.'],
    ['primaryPopulation', 'Population or objects', 'Define the population/process/object the investigation is intended to describe.', 'Primary or both-source plan.'],
    ['primarySamplingUnit', 'One sampling unit', 'Define the independent unit; distinguish repeated readings from independent participants/objects.', 'When units or repeated trials matter.'],
    ['primarySamplingFrameDetails', 'Describe the frame or difficulty', 'A realisable frame or honest coverage limit in the fictional scenario.', 'When a sampling frame is relevant.'],
    ['primarySampling', 'Why might this method work?', 'Justify the choice for this aim, including the important inference restriction.', 'When a sampling choice is relevant.']
  ]),
  ...P('primary', 'metadata', false, [
    ['primarySamplingMethod', 'Sampling method', 'Use a supported sampling ID; choose not-applicable for one chosen object rather than inventing a population.'],
    ['primarySamplingFrame', 'Sampling frame', 'Choose the frame status that agrees with the authored details.'],
    ['primaryRepeatable', 'Could I collect follow-up observations?', 'A feasibility choice, not evidence that additional measurements exist.'],
    ['primaryStatus', 'Status of source plan', 'Preserve an honest proposed/available status.'],
    ['primaryQuantityName', 'Quantity or category', 'Transient quantity-editor draft; completed samples use planning.primaryQuantities[].name.'],
    ['primaryQuantityUnit', 'Unit (only if needed)', 'Transient quantity-editor draft; completed samples use planning.primaryQuantities[].unit.']
  ]),
  ...P('secondary', 'conditional', false, [
    ['secondaryUrl', 'Source link (optional while searching)', 'A real original URL when using published evidence; leave blank for constructed evidence rather than inventing a source.', 'An external published source is actually used.'],
    ['secondaryPublisher', 'Who published the source?', 'The verified publisher or an explicit constructed-data provenance statement.', 'A secondary source plan is selected.'],
    ['secondaryVariables', 'Which variables and units will you use?', 'Identify selected columns and definitions, including compatible units.', 'A secondary source plan is selected.'],
    ['secondaryScope', 'Which dates, population or subset are relevant?', 'Define the justified subset before analysis.', 'A secondary source plan is selected.'],
    ['secondarySamplingOrigin', 'How were the published observations selected? (if known)', 'State known provenance and what is unknown without inventing a random selection process.', 'Published observations have a relevant selection process.']
  ]),
  ...P('secondary', 'metadata', false, [
    ['secondaryVerified', 'Source verification status', 'Do not mark an invented publisher or uninspected URL as verified.'],
    ['secondaryStatus', 'Status of source plan', 'Distinguish an intended source from usable evidence.']
  ]),
  ...['primary', 'secondary'].flatMap(source => P(source, 'metadata', false, [
    [`${source}AccuracyQuantity`, 'Quantity / column', 'Transient accuracy-editor draft; completed records belong in planning.accuracyPlans[].'],
    [`${source}AccuracyUnit`, 'Unit (if any)', 'Transient editor draft; use the saved quantity-specific unit.'],
    [`${source}AccuracyResolution`, source === 'primary' ? 'Recording increment / degree of accuracy' : 'Original resolution or published rounding (if known)', 'Transient editor draft; do not confuse displayed resolution with validated uncertainty.'],
    [`${source}AccuracyBasis`, 'Basis of the accuracy decision', 'Transient editor choice; saved records distinguish exact, measured, published and unknown bases.'],
    [`${source}AccuracyUncertainty`, 'Known or possible uncertainty (optional)', 'Transient editor draft; save only justified uncertainty or explicitly identify what is unknown.']
  ])),
  ...P('all', 'conditional', false, [
    ['theoreticalAim', 'What mathematical property or conjecture might you investigate? / What mathematical question will the model investigate?', 'State the precise property or model question and its domain; the modelling branch keeps its own selected pathway.', 'Theoretical investigation, or modelling with dataSource theoretical (defined assumptions).'],
    ['theoreticalCase', 'What small example or calculation could you explore safely? / Which starting quantities, assumptions and constraints will define the model?', 'For theory, give an illuminating exact case or candidate counterexample. For modelling without collected data, define starting quantities, units, assumptions and constraints without inventing measurement.', 'Theoretical investigation, or modelling with dataSource theoretical (defined assumptions).']
  ]),
  ...P('theory', 'conditional', false, [
    ['theoreticalPrediction', 'A tentative conjecture (optional)', 'State the conjecture without treating examples as proof.', 'A conjecture is useful.'],
    ['theoreticalWhy', 'Why might the claim hold?', 'Give the structural reason or pattern behind the conjecture.', 'A theoretical prediction exists.']
  ]),
  ...P('all', 'external', false, [
    ['permissionNeed', 'Do permissions or restrictions need attention?', 'Record an honest need/none/unsure choice; never infer a grant of permission.'],
    ['permissionDetails', 'Brief note for my teacher', 'A fictional-student question or restriction, with no personal details or invented approval.'],
    ['teacherNeed', 'Which part of the plan needs advice?', 'A specific suitability, access or scope question, not a teacher answer.'],
    ['teacherQuestion', 'A specific question for my teacher', 'An authored question may be shown; no response or approval is fabricated.'],
    ['teacherSafeAction', 'One safe step I can do before getting feedback', 'A realistic student planning action, not evidence of a teacher instruction.'],
    ['teacherExtra', 'Anything else you would like your teacher to know? (optional)', 'A relevant uncertainty only if the scenario calls for it.'],
    ['universalTeacherQuestion', 'Anything you would like to discuss with your teacher? (optional)', 'A specific open question rather than a claimed sign-off.'],
    ['teacherSchedule', 'Possible discussion date (optional)', 'Leave unset unless explicitly presented as an invented planning date.'],
    ['milestoneSchoolDraft', 'School draft deadline', 'No school-confirmed date is invented.'],
    ['milestoneSchoolFinal', 'School final deadline', 'No submission or deadline confirmation is invented.']
  ]),
  ...P('all', 'conditional', false, [
    ['timelineWeeks', 'Weeks available', 'A coherent illustrative work plan, not a real deadline.', 'If a timeline is included.'],
    ['timelineEarly', 'How early could I start?', 'A realistic illustrative early-start decision.', 'If a timeline is included.'],
    ['timelineStart', 'My possible start date', 'Clearly hypothetical planning date.', 'If a timeline is included.'],
    ['milestonePlan', 'Planning and introduction', 'A coherent proposed milestone.', 'If a timeline is included.'],
    ['milestoneData', 'Evidence ready', 'A proposed milestone consistent with source access.', 'If empirical evidence and a timeline are used.'],
    ['milestoneFirstVisual', 'First useful representation', 'A proposed milestone; not an assertion the figure exists.', 'If a timeline is included.'],
    ['milestoneVisualReview', 'Review first representation', 'A proposed chance to respond to the actual finding.', 'If a timeline is included.'],
    ['milestoneFirstMath', 'First substantial mathematics', 'A proposed milestone with appropriate scope.', 'If a timeline is included.'],
    ['milestoneFurtherMath', 'Further mathematics and conclusion', 'Reserve room for result-dependent development rather than a fixed technique quota.', 'If a timeline is included.'],
    ['milestoneDraft', 'Complete draft', 'A proposed complete-draft milestone, not teacher confirmation.', 'If a timeline is included.'],
    ['milestoneReview', 'Review and revisions', 'A proposed self-review milestone.', 'If a timeline is included.'],
    ['milestoneAdjustment', 'Timeline adjustment', 'A specific planning revision if useful.', 'If the illustrative plan changes.']
  ]),
  ...P('all', 'legacy', false, [
    ...[
      ['originalIdea', 'Earlier starting idea'], ['interest', 'Earlier interest note'],
      ['otherIdea1', 'Earlier alternative idea 1'], ['otherIdea2', 'Earlier alternative idea 2'],
      ['ideaSelected', 'Earlier selected idea'], ['ideaAccess', 'Earlier idea-access note'], ['ideaValue', 'Earlier idea-value note'],
      ['primaryWhat', 'Earlier proposed measurements'], ['methodReason', 'Earlier planned method reason'],
      ['methodLimitation', 'Earlier anticipated limitation'], ['methodMitigation', 'Earlier mitigation note'],
      ['sourceFirstDate', 'Earlier first-evidence date'], ['sourceFullDate', 'Earlier complete-data date'],
      ['dataReadiness', 'Earlier data-readiness score'], ['dependencies', 'Earlier dependency list'],
      ['softwareReady', 'Earlier software-readiness note'], ['workloadHours', 'Earlier workload estimate'],
      ['cleaningBurden', 'Earlier cleaning estimate'], ['externalRisks', 'Earlier external risks'],
      ['minimumVersion', 'Earlier minimum version'], ['backupMethod', 'Earlier backup method'],
      ['pilotReady', 'Earlier pilot readiness'], ['costIssue', 'Earlier cost issue'], ['sourceRights', 'Earlier source-rights note'],
      ['dataSufficiency', 'Earlier data sufficiency'], ['negativeResultViable', 'Earlier negative-result check'],
      ['presentationManageable', 'Earlier presentation check'], ['practicalEase', 'Earlier practical-ease score'],
      ['easeImprovement', 'Earlier ease improvement'], ['mathsWhy', 'Earlier mathematics rationale'],
      ['predictionPrior', 'Earlier superseded prediction'], ['predictionExploration', 'Earlier uncertain-prediction note'],
      ['suitabilityWhy', 'Earlier suitability rationale'], ['figureType', 'Earlier planned figure type'],
      ['figureOther', 'Earlier alternative figure'], ['figurePurpose', 'Earlier figure purpose'],
      ['changeTrigger', 'Earlier change trigger'], ['changeAdaptation', 'Earlier adaptation'], ['fallbackEvidence', 'Earlier fallback evidence']
    ].map(([key, label]) => [key, label, 'Retained for compatibility with earlier records. Do not manufacture a new answer or duplicate current sample prose here.'])
  ])
];

const completion = [
  ...rows('scratch.', 'all', 'authored', true, [
    ['introduction', 'My own working introduction notes', 'In a sample, a polished first-person introduction containing the aim, personal reason and essential context; the ordinary student notes workflow is unchanged.']
  ]),
  ...rows('scratch.', 'all', 'conditional', true, [
    ['dataNotes', 'My earlier source notes', 'For the sample reader, use an authored source/definitions passage and avoid repeating the current source and method answers.', 'When the starting material or definitions need explaining.']
  ]),
  ...rows('scratch.', 'all', 'conditional', false, [
    ['finalReview', 'My earlier review notes (editable)', 'Specific evidence of an actual sample check, not instructions to the reader.', 'Only if the sample has a useful revision note.']
  ]),
  ...rows('scratch.', 'all', 'legacy', false, [
    ['conclusion', 'My earlier conclusion draft or notes', 'Leave empty for new examples; use the three current conclusion fields.']
  ]),
  ...C('all', 'authored', true, [
    ['dataAimLink', 'How does this first mathematics connect to my aim?', 'One or two student sentences linking the first mathematical question to the aim; print once at the selected placement.'],
    ['methodReason', 'My method and why I chose it', 'Name and justify the first method in this investigation without a routine syllabus tutorial.'],
    ['firstMethodEvaluation', 'My mathematical limitations, alternatives and justification', 'Explain relevant assumptions, a plausible alternative and why this starting method fits the aim.'],
    ['mainConclusion', 'My answer to the investigation question', 'Answer the original aim with the decisive established result, value, range or proof.'],
    ['conclusionBenefit', 'My interpretation and the important limits', 'Explain meaning for the original purpose and only the restrictions that change the final claim.']
  ]),
  ...C('all', 'authored', false, [
    ['firstPurpose', 'The mathematical question for my first figure or calculation', 'A precise starting question reused in the first-stage screen; not another paragraph to repeat.']
  ]),
  ...C('all', 'conditional', true, [
    ['actualSource', 'What evidence or mathematical starting material do I actually have?', 'Describe the actual constructed dataset, verified published evidence or exact mathematical object.', 'Include at the point the material is introduced.'],
    ['sourceCitation', 'Original published source and date (if relevant)', 'A traceable real citation only when an external source was actually used.', 'An original external source is used.'],
    ['actualMethod', 'How did I actually obtain or define it?', 'The fictional student explains the procedure or definitions; constructed-data disclosure stays clear.', 'Source or definition details are needed by the reader.'],
    ['variableDefinitions', 'Important symbols with meanings and units', 'Define meaningful variables at first use; preserve units and notation across all outputs.', 'New variables or units need defining.'],
    ['specialistTerms', 'Any important non-mathematical specialist words', 'Briefly explain only terms needed by a mathematically literate reader.', 'An unfamiliar contextual term is necessary.'],
    ['conclusionExtension', 'A worthwhile future mathematical question (if any)', 'One justified future question following from the findings; do not invent a compulsory extension.', 'A worthwhile unresolved question remains.']
  ]),
  ...C('all', 'metadata', false, [
    ['firstMathsBridgePlacement', 'Have I already explained why I am starting here?', 'Select intro or before consistently and print the bridge only once.'],
    ['dataStatus', 'What starting material is ready?', 'Set the evidence state consistently; a saved plan does not count as completed mathematics.'],
    ['actualSourceType', 'Type of actual source', 'Match primary, secondary or theoretical to the actual source record.'],
    ['draftComplete', 'Is the draft complete?', 'Only the actual authored sample and checked mathematics can support a complete-draft state.']
  ]),
  ...C('empirical', 'conditional', true, [
    ['statisticalPopulation', 'Population or group the analysis could describe', 'Define the actual inference scope.', 'The investigation draws an empirical comparison or statistical conclusion.'],
    ['samplingMethod', 'How observations were actually selected', 'Describe the selection actually represented in the fictional scenario.', 'Sampling is relevant.'],
    ['samplingRationale', 'Why is this design relevant to the aim?', 'Tie the sampling choice to the aim and its limits.', 'Sampling is relevant.'],
    ['sampleSize', 'Sample size or relevant counts', 'Give counts that reproduce from the evidence, including separate groups/partitions.', 'Counts are relevant.'],
    ['pairing', 'For paired data, were measurements genuinely matched? (if applicable)', 'Explain the observation pairing or repeated-measure structure.', 'Paired quantities or repeated measurements are used.'],
    ['responseBias', 'Potential selection, response or group-comparison issue', 'Explain the concrete consequence for generalisation, comparison or interpretation.', 'A consequential selection or group issue exists.'],
    ['dataCleaning', 'Missing, filtered or excluded values and why (if applicable)', 'State the actual rule and its effect; never remove inconvenient values silently.', 'Values were missing, filtered, excluded or explicitly checked.']
  ]),
  ...C('empirical', 'metadata', false, [
    ['sampleOrCensus', 'Sample or census?', 'Match the authored source description and target population.']
  ]),
  ...C('model', 'conditional', true, [
    ['modelEvidence', 'What supports the model?', 'Identify the observations, known dimensions or stated assumptions supporting the model.', 'A model is developed.'],
    ['modelInputs', 'Variables, parameters, units and sources', 'Define each model input/parameter and keep measured and fitted quantities distinct.', 'A model is developed.'],
    ['modelAssumptions', 'Which simplifications matter?', 'State the assumptions that determine the model and their mathematical consequences.', 'A model is developed.'],
    ['modelDomain', 'What input range or constraints make sense?', 'State the feasible or evidence-supported domain and units.', 'A model is developed.'],
    ['modelValidation', 'How could the model be checked, if feasible?', 'For a completed sample, identify the actual performed validation and its limits.', 'A meaningful validation is feasible.'],
    ['modelAlternative', 'An alternative model worth considering (optional)', 'Name a mathematically plausible alternative and why the findings motivate it.', 'An alternative is genuinely considered.']
  ]),
  ...C('theory', 'conditional', true, [
    ['theoreticalObject', 'What mathematical object, structure or conjecture is involved?', 'State the precise object, conjecture and domain.', 'A theoretical argument is used.'],
    ['theoreticalCase', 'One small useful case or potential counterexample', 'Show an illuminating exact case and explain what it can and cannot establish.', 'A case helps introduce the argument.'],
    ['theoreticalAssumptions', 'Which assumptions, restrictions or terms matter?', 'State positivity, integrality, domain or other conditions needed for the proof.', 'A theoretical argument is used.']
  ]),
  ...C('all', 'conditional', true, [
    ['alternativeMethod', 'Another genuinely feasible method', 'A specific alternative relevant to the same aim.', 'A method comparison is useful.'],
    ['chosenMethod', 'Which method did you actually choose?', 'Name the actual choice and keep it consistent with the performed mathematics.', 'The method-choice support screen is relevant.'],
    ['methodLimitation', 'Most consequential limitation of your actual source or method', 'Identify an actual mathematical restriction, not a generic practical inconvenience.', 'The restriction affects the result.'],
    ['limitationConsequence', 'How might it affect the result or restrict a conclusion?', 'Explain the direction or scope of the mathematical effect.', 'A consequential limitation is identified.'],
    ['limitationMitigation', 'What did you actually do to reduce or check it?', 'Describe a performed check or state the unresolved constraint honestly.', 'A limitation was investigated or remains unresolved.'],
    ['limitationAcceptable', 'What can you still reasonably conclude?', 'Give the strongest defensible claim after the limitation.', 'A consequential limitation is identified.'],
    ['accuracyForResult', 'Is the display defensible?', 'Explain precision only where it changes this result or interpretation.', 'Result accuracy is consequential.'],
    ['predictionComparison', 'How does the result compare with your starting prediction, conjecture or hope?', 'Compare the actual result with the genuine earlier expectation.', 'An earlier prediction exists.'],
    ['benefitFinding', 'What might this mean for the intended beneficiary?', 'A cautious implication supported by the mathematics.', 'A supported practical or explanatory implication exists.'],
    ['surpriseReason', 'What differs from my expectation, or is uncertain?', 'Identify the particular unexpected result.', 'A surprise genuinely arises.'],
    ['surpriseCheck', 'One plausible mathematical or source-based check', 'Explain the specific check and distinguish completed checking from future work.', 'An unexpected result needs investigation.'],
    ['pmccInterpretation', 'What value or finding did I calculate and what does it mean?', 'Interpret the calculated coefficient as linear association in context.', 'Pearson correlation was actually calculated.'],
    ['technologyInput', 'Inputs or mathematical operation used', 'Explain the mathematical operation and actual inputs, not software clicks.', 'Technology produced a result.'],
    ['technologyOutcome', 'What numerical or graphical output was produced?', 'Give the actual checked output.', 'Technology produced a result.'],
    ['technologyInterpretation', 'What does that output mathematically mean for the aim?', 'Demonstrate understanding of the output in the investigation.', 'Technology produced a result.'],
    ['researchedUnderstanding', 'What have I learned about how it works?', 'Explain only the genuinely unfamiliar idea and its relevant reasoning.', 'New mathematics was actually researched.'],
    ['mathsLearning', 'What did learning this change about my investigation?', 'A concrete conceptual insight that changed the mathematics.', 'Genuine conceptual learning occurred.']
  ]),
  ...C('all', 'conditional', false, [
    ['changedSincePlanning', 'What has changed since Planning? (optional)', 'A specific student account of a change, consistent with preserved original intentions.', 'A meaningful change occurred.'],
    ['dataStatusSummary', 'One important uncertainty still to resolve (optional)', 'A specific remaining source or parameter question.', 'An unresolved issue affects the work.'],
    ['firstDefinitions', 'Variables, units or assumptions the reader needs here', 'Only definitions not already supplied; the narrative prints each once.', 'Optional first-step preparation.'],
    ['firstPresentation', 'Check title, labels, axes, units, source and readable precision', 'Record a specific performed check or repair.', 'The optional first-presentation check is used.'],
    ['firstResultSummary', 'What is the essential local takeaway?', 'A concise finding consistent with the actual first entry.', 'The optional observation screen is used.'],
    ['nextQuestion', 'What mathematical question remains unanswered? (if any)', 'The first-stage transition question; keep consistent with that entry, not a global replacement for all later stages.', 'After a real first-stage result.'],
    ['nextReason', 'My written bridge to the next step (or conclusion)', 'The first-stage transition rationale; the ordered narrative selects it once.', 'After a real first-stage result.'],
    ['nextMethod', 'Which technique might answer THAT question?', 'The next chosen technique follows the actual finding.', 'Another stage is justified.'],
    ['courseWhy', 'What mathematical question does this technique answer?', 'A specific scope justification rather than a claim of difficulty or marks.', 'Course suitability is being reviewed.'],
    ['researchedMethod', 'Which new mathematical idea did I use?', 'Name the genuinely new idea and source.', 'New mathematics was actually researched.'],
    ['presentationIssue', 'One issue with labels, graphs, flow or layout', 'A specific review finding or performed correction.', 'A presentation review is recorded.'],
    ['referencesIssue', 'Are data sources, technology and borrowed techniques referenced?', 'Specific citation evidence or an actual missing reference.', 'A references review is recorded.'],
    ['notationIssue', 'Notation or mathematical presentation to repair', 'An identified equation, symbol, unit or approximation-sign issue.', 'A notation review is recorded.'],
    ['feedbackAction', 'One specific correction and how I will verify it', 'A specific self-revision or response to actual feedback; never invent teacher comments.', 'A revision action is recorded.'],
    ['finalProofread', 'What still needs proofreading or verifying?', 'Actual remaining issues or evidence of completed checks.', 'Final self-review is represented.']
  ]),
  ...C('all', 'metadata', false, [
    ['technologyTool', 'Which software, GDC, code or spreadsheet was actually used?', 'Name only an actual tool used for the saved evidence.'],
    ['technologyForEntryId', 'Mathematical stage using this technology', 'Link to the entry that produced the explained output.'],
    ['firstType', 'First representation type', 'The type must match the actual first entry or saved figure.'],
    ['firstObservedFeature', 'First observed feature', 'A compatibility mirror of the actual first-entry finding; do not author a second inconsistent observation.'],
    ['scatterPattern', 'Actual scatter pattern', 'Choose the observed shape, not the hoped-for prediction.'],
    ['scatterDetail', 'Relevant scatter detail', 'An actual feature used by contextual guidance.'],
    ['scatterAimRelevance', 'Would further mathematics advance the original aim?', 'Select yes, no or unsure from the actual finding; the current bivariate guidance uses this decision.'],
    ['pairedDataType', 'Paired-data structure', 'Match the observations and method.'],
    ['pmccSignal', 'Calculated correlation outcome', 'Select the outcome supported by the calculated coefficient and graph.']
  ]),
  ...C('all', 'external', false, [
    ['permissionStatus', 'Current permissions or restrictions', 'Do not imply external approval from the presence of sample data.'],
    ['permissionNotes', 'What restriction or decision still matters?', 'A relevant open restriction or an explicit no-personal-data scenario.'],
    ['courseConcern', 'Course-suitability concern', 'An open scope question; no invented teacher judgement.'],
    ['theoreticalQuestion', 'Anything to discuss about course suitability?', 'A student question, not a teacher answer.'],
    ['writtenFeedback', 'What written feedback did I actually receive, if any?', 'Leave empty in fictional teaching samples unless actual authorised feedback exists.'],
    ['finalRequirements', 'Confirmed submission and formatting requirements', 'Do not invent current school deadlines, candidate identity, submission or authentication.']
  ]),
  ...C('all', 'metadata', false, [
    ...[
      ['accuracyQuantity', 'Quantity measured or sourced'], ['accuracySymbol', 'Symbol (optional)'],
      ['accuracyUnit', 'Unit'], ['accuracyResolution', 'Instrument/source resolution and uncertainty, if known'],
      ['accuracyReason', 'Why does that accuracy make sense?'], ['accuracyPolicy', 'Reasonable display accuracy for calculated results']
    ].map(([key, label]) => [key, label, 'Accuracy editor/current-selection field. The saved completion.accuracyDecisions[] record owns the linked quantity-specific decision.'])
  ]),
  ...C('all', 'conditional', false, [
    ...[
      ['firstOutputIntroduction', 'My words to introduce this figure, table or calculation'],
      ['firstWorkTitle', 'Title or name of this step'], ['firstWorkResult', 'What did you actually produce or calculate?'],
      ['firstWorkLocation', 'Where does it appear in my IA? (optional)'],
      ['firstWorkStatus', 'Has this mathematical work been produced?'],
      ['firstInterpretation', 'My reflection on what this result means']
    ].map(([key, label]) => [key, label, 'Fallback used only before a first entry exists. Completed examples use entries[0] and must not create a conflicting duplicate.', 'No first mathematical entry exists yet.'])
  ]),
  ...C('all', 'conditional', false, [
    ...[
      ['blocker', 'What is blocking me?'], ['blockedBy', 'Specific obstacle'],
      ['alternateSource', 'Alternative source to investigate'], ['alternateFit', 'Why that alternative fits'],
      ['limitedDataIssue', 'Issue with the available data'], ['oneSafeAction', 'One useful next action'],
      ['stuckFollowup', 'Follow-up after help'], ['writingLocation', 'Where this writing belongs'], ['writingDecision', 'Writing decision']
    ].map(([key, label]) => [key, label, 'Optional contextual-help note. Populate only when the fictional journey actually uses this support; it is not an extra IA paragraph.', 'The corresponding contextual-help branch is used.'])
  ]),
  ...C('all', 'legacy', false, [
    ...[
      ['methodAim', 'Earlier method-to-aim note'], ['actualDate', 'Earlier source date'],
      ['courseLevel', 'Earlier broad course check to review'], ['accuracyDataType', 'Earlier accuracy data type'],
      ['nextStepSelected', 'Earlier next-step summary'],
      ['sourcePopulation', 'Earlier source population'], ['dataCount', 'Earlier evidence count'],
      ['collectionStatus', 'Earlier collection status'], ['groupFairness', 'Earlier group-fairness note'],
      ['modelSensitivity', 'Earlier model-sensitivity note'], ['sourceReferences', 'Earlier source-reference note'],
      ['aimLinkedResult', 'Earlier result-to-aim note'],
      ['nextLocation', 'Earlier next-step location'],
      ['pmccMeaning', 'Earlier correlation meaning'], ['conclusionEvidence', 'Earlier supporting-results notes'],
      ['conclusionUncertainty', 'Earlier uncertainty and limitation notes'], ['conclusionAdvice', 'Earlier recommendations or decisions'],
      ['conclusionFocus', 'Earlier notes on tightening the ending'], ['draftCriteria', 'Earlier A–E draft notes'],
      ['revisionEvidence', 'Earlier revision evidence'], ['finalCriteria', 'Earlier A–E final notes']
    ].map(([key, label]) => [key, label, 'Compatibility note only; preserve imports but do not manufacture redundant answers in a new sample.'])
  ])
];

const stage = [
  ...E('authored', true, [
    ['title', 'What mathematical question is this stage investigating?', 'A specific stage question used as the section heading, not a generic technique label.'],
    ['purpose', 'Why is the chosen approach appropriate here?', 'For the first entry, introduce the output; for later entries, explain why the chosen approach follows the previous finding.'],
    ['result', 'What did you actually produce or calculate?', 'Actual worked mathematics, equations, proof or a checked graphical result; never advice, a placeholder or a future intention.'],
    ['interpretation', 'What does this result mean for my aim?', 'Explain the specific mathematical meaning in context immediately after the output.']
  ]),
  ...E('authored', false, [
    ['localTakeaway', 'One mathematical takeaway from this stage', 'A concise established finding for adaptive guidance; avoid repeating the entire interpretation.']
  ]),
  ...E('conditional', true, [
    ['bridge', 'My linking sentence from the previous result', 'A first-person transition from the preceding actual finding; select once rather than repeating the previous nextWhy.', 'Every later stage with a predecessor.'],
    ['limitations', 'Important limitation, assumption or uncertainty (if relevant)', 'Only a restriction that affects this result or what can be inferred.', 'A consequential restriction exists.'],
    ['nextQuestion', 'What mathematical question remains unanswered? (optional)', 'A specific question raised by this result, placed before the reason for following it; a final question may identify a clearly future extension.', 'Another mathematical question exists.'],
    ['nextWhy', 'My bridge to another stage, or explanation for concluding', 'Explain why the next question matters or why this investigation can now conclude.', 'A transition or stopping explanation is needed.'],
    ['knowledgeNotes', 'How does that unfamiliar mathematics work here?', 'Explain the genuinely unfamiliar idea at its first use.', 'Knowledge is mixed or outside.'],
    ['understandingExample', 'A relevant worked step or small demonstration (optional)', 'A relevant demonstration that establishes understanding.', 'Unfamiliar mathematics benefits from a small worked case.'],
    ['researchSource', 'Original resource consulted (if relevant)', 'An actual traceable source for an unfamiliar idea; no fabricated citation.', 'An external mathematical source was used.'],
    ['mathsInsight', 'My genuine new mathematical insight', 'A real structural insight and how it affected the investigation.', 'There is a substantive new insight.'],
    ['methodChangeReason', 'Has a limitation of the earlier work led me to change method? (optional)', 'The actual reason for a changed method, tied to an earlier finding.', 'The method genuinely changed.']
  ]),
  ...E('conditional', false, [
    ['observationText', 'What can you really observe?', 'A concrete feature of the actual output, without replacing interpretation.', 'The optional observation screen is used.'],
    ['unfamiliarComponent', 'Exactly which idea is new?', 'Identify only the unfamiliar component.', 'Knowledge is mixed or outside.']
  ]),
  ...E('metadata', false, [
    ['priorLearningOnly', 'Check course-level mathematical depth (optional)', 'Select no, yes or unsure only when using this optional current check; it is a student scope judgement, not verified teacher approval.'],
    ...[
      ['id', 'Mathematical record ID'], ['phase', 'First or substantial stage'], ['fromEntryId', 'Previous mathematical record'],
      ['previousTakeaway', 'Earlier confirmed mathematical finding'], ['technique', 'Mathematical technique or argument'],
      ['methodId', 'Mathematical method'], ['knowledge', 'Familiarity with this technique'], ['kind', 'Type of mathematics'],
      ['status', 'Has this mathematics actually been produced?'], ['resultRef', 'Where does it appear in my IA? (optional)'],
      ['observation', 'Observed-pattern category'], ['resultSignal', 'My interpretation so far'],
      ['journeyOutcome', 'My interpretation of this genuine result'], ['journeyDirection', 'Chosen next direction'],
      ['journeySourceOutcome', 'Previous outcome informing this choice'], ['journeySourceSignature', 'Signature of preceding evidence'],
      ['journeyRouteId', 'Investigative pathway'], ['graphFigureId', 'Linked graph'], ['imageTraceId', 'Linked calibrated trace'],
      ['statFigureId', 'Linked statistical diagram'], ['tableFigureId', 'Linked table'], ['voronoiFigureId', 'Linked Voronoi diagram'],
      ['geometryFigureId', 'Linked geometry diagram'], ['probabilityFigureId', 'Linked probability diagram'], ['distributionFigureId', 'Linked probability distribution'],
      ['figureRefs', 'All figures belonging to this stage'],
      ['accuracyRefs', 'Linked accuracy decisions'], ['sourceRefs', 'Linked actual sources'], ['reviewNeeded', 'Dependent work requiring review'],
      ['reviewReason', 'Reason to revisit the mathematics'], ['reviewCheckedAt', 'Student review date'], ['createdAt', 'Record creation time']
    ].map(([key, label]) => [key, label, 'Internal or selected record value. It must agree with the actual authored mathematics and links; it is not additional IA prose.'])
  ]),
  ...E('legacy', false, [
    ['accuracyRef', 'Earlier single accuracy reference', 'Retain old imports; new samples use accuracyRefs[].']
  ])
];

const recordFields = [
  ...rows('planning.primaryQuantities[].', 'primary', 'metadata', false, [
    ['id', 'Planned quantity reference', 'Stable saved quantity ID.'],
    ['name', 'Quantity or category', 'The named quantity actually proposed for collection.'],
    ['unit', 'Unit (only if needed)', 'A meaningful unit; exact categories need no artificial unit.']
  ]),
  ...rows('planning.accuracyPlans[].', 'empirical', 'metadata', false, [
    ['id', 'Planned accuracy reference', 'Stable saved plan ID.'], ['source', 'Primary or secondary source', 'Match the source branch.'],
    ['quantity', 'Quantity / column', 'Match a real planned quantity.'], ['unit', 'Unit (if any)', 'Use the same unit throughout.'],
    ['resolution', 'Recording increment or published rounding', 'Do not silently treat resolution as true error.'],
    ['basis', 'Basis of accuracy', 'Use an explicit exact/measured/published/unknown basis.'],
    ['uncertainty', 'Known or possible uncertainty', 'A justified bound or an explicit unknown, not invented precision.']
  ]),
  ...rows('completion.accuracyDecisions[].', 'empirical', 'conditional', true, [
    ['quantity', 'Quantity measured or sourced', 'Identify the actual input or exact quantity.', 'Accuracy matters for a measured/modelled result.'],
    ['symbol', 'Symbol (optional)', 'Use the same meaningful symbol as the equations.', 'A symbol is useful.'],
    ['unit', 'Unit', 'Use consistent units.', 'The quantity has units.'],
    ['resolution', 'Instrument/source resolution and uncertainty, if known', 'Distinguish measurement increment, known tolerance and reported rounding.', 'A measurement or rounded source is used.'],
    ['policy', 'Reasonable display accuracy for calculated results', 'A defensible exact-versus-approximate and reporting policy.', 'Results require a precision decision.'],
    ['reason', 'Why does that accuracy make sense?', 'Tie the decision to actual uncertainty or sensitivity.', 'Results require a precision decision.']
  ]),
  ...rows('completion.accuracyDecisions[].', 'empirical', 'metadata', false, [
    ['id', 'Accuracy decision reference', 'Stable ID linked from the affected entries.'],
    ['sourceId', 'Source reference', 'Link the decision to the source whose inputs it qualifies.']
  ]),
  ...rows('completion.sourceRecords[].', 'all', 'metadata', false, [
    ['id', 'Actual source reference', 'Stable ID linked from the entries using this material.'],
    ['legacy', 'Earlier source record', 'False for a newly authored source; do not mark obsolete inherited text as current evidence.']
  ]),
  ...rows('completion.confirmedLimitations[].', 'stage', 'conditional', true, [
    ['explanation', 'What applies', 'A specific confirmed mathematical restriction.', 'The limitation is relevant to a particular result.'],
    ['consequence', 'Mathematical consequence', 'Explain its effect on the inference or numerical result.', 'A confirmed limitation exists.'],
    ['mitigation', 'Checking or mitigation', 'A performed check or an honest unresolved restriction.', 'A confirmed limitation exists.']
  ]),
  ...rows('completion.confirmedLimitations[].', 'stage', 'metadata', false, [
    ['id', 'Limitation reference', 'Stable record ID.'], ['sourceId', 'Related source', 'Link only the affected source.'],
    ['stage', 'Relevant writing stage', 'Link the relevant current screen.'], ['entryId', 'Related mathematical stage', 'Link the result actually affected.'],
    ['location', 'Where discussed in the IA', 'An actual narrative section or equation.'], ['at', 'Recorded date', 'A record timestamp, not a teacher verification.']
  ]),
  ...rows('', 'all', 'metadata', false, [
    ['planning.mathSelected', 'Provisional mathematical techniques', 'Selected menu IDs represent intentions, not performed work.'],
    ['planning.routeExplorer.selectedRoute', 'Selected mathematical pathway', 'Exactly the pathway covered by the corresponding brief.'],
    ['planning.routeExplorer.firstStep', 'Provisional first mathematical step', 'A planning spark; actual work belongs to the first entry.'],
    ['completion.conclusionResultIds', 'Chosen mathematical evidence for the conclusion', 'Reference completed, review-free entries supporting the answer.']
  ]),
  ...rows('completion.review.records.{reviewId}.', 'review', 'conditional', false, [
    ['location', 'Where in my actual IA?', 'Point to the exact section, figure or equation inspected.', 'An applicable draft/final review check is recorded.'],
    ['note', 'My evidence, or why this is not relevant', 'First-person evidence of a performed check or a precise not-applicable explanation; never advice to the reader.', 'An applicable review check is recorded.'],
    ['action', 'My specific correction, if needed', 'An identified correction and how I will check it.', 'A review found something to repair.']
  ]),
  ...rows('completion.review.records.{reviewId}.', 'review', 'metadata', false, [
    ['status', 'My review status', 'Checked requires evidence; not-applicable requires a reason.'],
    ['entryId', 'Related mathematical stage (optional)', 'Reference the result actually inspected.'],
    ['checkedAt', 'Review date', 'A self-review timestamp, not external verification.']
  ]),
  ...rows('completion.review.records.{reviewId}.', 'review', 'external', false, [
    ['selfMark', 'Optional provisional student self-mark', 'Leave empty in the fictional samples; no marks or attainment are asserted.'],
    ['markLevel', 'Reference rubric level', 'Do not turn the teaching example into an assessed exemplar.']
  ]),
  ...rows('completion.review.', 'review', 'external', false, [
    ['feedbackItems', 'Recorded teacher feedback actions', 'Leave empty unless actual authorised feedback exists; never invent a teacher response.'],
    ['feedbackNote', 'What feedback did you receive?', 'No fictional teacher comment.'],
    ['feedbackAction', 'What will you change?', 'Do not populate a teacher-feedback editing draft in a new sample.'],
    ['feedbackLocation', 'Where does this apply in your IA?', 'No invented feedback location.'],
    ['feedbackEntryId', 'Related mathematical stage', 'No fabricated feedback relationship.']
  ]),
  ...rows('teacher.', 'review', 'external', false, [
    ['checkpoints', 'Teacher check-ins', 'No invented teacher meetings, approval or authentication.'],
    ['feedbackStatus', 'Teacher feedback status', 'Keep not-requested unless actual feedback exists.'],
    ['pendingApproval', 'Approval still needed', 'A pending flag may reflect an open question; it never claims approval.']
  ])
];

// A saved source has the same source-specific fields as the live source editor.
// Reuse their editorial meaning so a record cannot quietly change the meaning
// of a field when a later stage selects a different source.
const sourceCopies = SOURCE_FIELDS.map(key => {
  const field = completion.find(item => item.path === 'completion.fields.' + key);
  if (!field) throw new Error('Missing illustrative-sample source contract: ' + key);
  return {...field, path: 'completion.sourceRecords[].fields.' + key,
    purpose: field.purpose + ' This is the saved source version; the active editor must agree when this source is selected.'};
});

export const SAMPLE_FIELD_CONTRACT = Object.freeze(
  [...planning, ...completion, ...stage, ...recordFields, ...sourceCopies].map(Object.freeze)
);
const byPath = new Map(SAMPLE_FIELD_CONTRACT.map(field => [field.path, field]));
export const sampleFieldContractByPath = path => byPath.get(path) || byPath.get(
  String(path).replace(/\.(\d+)(?=\.|$)/g, '[]')
    .replace(/^(completion\.review\.records)\.(?:draft|feedback|final)-D\d{2}(?=\.)/, '$1.{reviewId}')
) || null;

/**
 * Inspect only caller-selected coverage paths. The caller must decide which
 * branches apply to the sample; no conditional field becomes compulsory merely
 * because it exists in this contract. Empty array branches are reported absent.
 * This checks presence, not authorship, correctness, relevance or IA quality.
 */
export function inspectSampleFieldCoverage(state, expectedPaths) {
  if (!Array.isArray(expectedPaths)) throw new TypeError('Choose the applicable sample paths before inspecting coverage.');
  const present = value => typeof value === 'string' ? value.trim().length > 0 :
    Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined;
  const expand = (value, parts, concrete = '') => {
    if (!parts.length) return [{path: concrete, value}];
    const [part, ...rest] = parts;
    if (part === '{reviewId}') return Object.entries(value || {}).flatMap(([key, item]) =>
      expand(item, rest, concrete + (concrete ? '.' : '') + key));
    const array = part.endsWith('[]'), key = array ? part.slice(0, -2) : part;
    const nextPath = concrete + (concrete ? '.' : '') + key;
    if (array) return (Array.isArray(value?.[key]) ? value[key] : []).flatMap((item, index) =>
      expand(item, rest, nextPath + '.' + index));
    return expand(value?.[key], rest, nextPath);
  };
  return [...new Set(expectedPaths)].map(path => {
    const field = sampleFieldContractByPath(path);
    if (!field) throw new Error('Unknown illustrative-sample field: ' + path);
    const instances = expand(state, path.split('.'));
    return {
      path, category: field.category,
      present: instances.length > 0 && instances.every(item => present(item.value)),
      missing: instances.length ? instances.filter(item => !present(item.value)).map(item => item.path) : [path]
    };
  });
}
