import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SAMPLE_BRIEFS, sampleBriefById} from '../src/core/samples/briefs.js';
import {SAMPLE_FIELD_CONTRACT, sampleFieldContractByPath, inspectSampleFieldCoverage} from '../src/core/samples/field-contract.js';
import {INVESTIGATIVE_ROUTES} from '../src/planning/investigative-routes.js';
import {PLANNING_FIELD_DEFAULTS} from '../src/planning/engine.js';
import {C_FIELD_DEFAULTS, createCompletionState, normalizeCompletionState} from '../src/completing/engine.js';
import {ENTRY_BASE} from '../src/completing/entry-record.js';
import {SOURCE_FIELDS} from '../src/completing/evidence-links.js';
import {createProjectState} from '../src/core/project-state.js';
import {normalizePrimaryQuantities} from '../src/planning/primary-quantities.js';
import {normalizePlanningAccuracy} from '../src/planning/data-decisions.js';

test('the editorial briefs cover the sixteen live routes exactly once without claiming availability', () => {
  assert.equal(SAMPLE_BRIEFS.length, 16);
  assert.equal(new Set(SAMPLE_BRIEFS.map(item => item.id)).size, 16);
  assert.deepEqual(SAMPLE_BRIEFS.map(item => item.routeId).sort(), INVESTIGATIVE_ROUTES.map(item => item.id).sort());
  for (const brief of SAMPLE_BRIEFS) {
    assert.equal(sampleBriefById(brief.id), brief);
    for (const key of ['title', 'aim', 'courseScope', 'evidencePlan']) assert.ok(brief[key].trim(), brief.id + '.' + key);
    for (const key of ['stages', 'figures', 'keyChecks']) assert.ok(brief[key].length && brief[key].every(text => text.trim()), brief.id + '.' + key);
    for (const key of ['ready', 'authored', 'available', 'status', 'completed']) assert.equal(Object.hasOwn(brief, key), false, 'A brief cannot set ' + key);
  }
  assert.equal(sampleBriefById('does-not-exist'), null);
});

test('contract paths match the current planning, completion and mathematical-entry schemas', () => {
  assert.equal(new Set(SAMPLE_FIELD_CONTRACT.map(item => item.path)).size, SAMPLE_FIELD_CONTRACT.length);
  const fieldGroups = [
    ['planning.fields.', PLANNING_FIELD_DEFAULTS],
    ['completion.fields.', C_FIELD_DEFAULTS],
    ['entries[].', ENTRY_BASE]
  ];
  for (const [prefix, defaults] of fieldGroups) {
    const paths = SAMPLE_FIELD_CONTRACT.filter(item => item.path.startsWith(prefix)).map(item => item.path.slice(prefix.length));
    assert.deepEqual(paths.sort(), Object.keys(defaults).sort(), 'Schema additions/removals need an explicit contract decision: ' + prefix);
  }
  for (const key of SOURCE_FIELDS) {
    const active = sampleFieldContractByPath('completion.fields.' + key);
    const saved = sampleFieldContractByPath('completion.sourceRecords[].fields.' + key);
    assert.ok(saved, 'Missing saved source field: ' + key);
    assert.equal(saved.category, active.category);
    assert.equal(saved.appliesTo, active.appliesTo);
  }
});

test('canonical writing boxes and current conclusion fields are covered, not obsolete duplicates', () => {
  const views = readFileSync(new URL('../src/completing/views.js', import.meta.url), 'utf8');
  const guidance = readFileSync(new URL('../src/completing/guidance-views.js', import.meta.url), 'utf8');
  const conclusion = readFileSync(new URL('../src/completing/conclusion-workspace.js', import.meta.url), 'utf8');
  const liveFields = ['dataAimLink', 'methodReason', 'firstPurpose', 'firstMethodEvaluation'];
  for (const key of liveFields) {
    assert.match(views, new RegExp('F\\("' + key + '"'));
    assert.ok(sampleFieldContractByPath('completion.fields.' + key));
  }
  assert.match(views, /entryChoice\("priorLearningOnly"/);
  assert.match(guidance, /input\("completion.fields.scatterAimRelevance"/);
  for (const path of ['entries[].priorLearningOnly', 'completion.fields.scatterAimRelevance']) {
    assert.equal(sampleFieldContractByPath(path).category, 'metadata', 'Current optional selectors must not be pruned as retired prose.');
  }
  for (const key of ['mainConclusion', 'conclusionBenefit', 'conclusionExtension']) {
    assert.match(conclusion, new RegExp('F\\("' + key + '"'));
    assert.equal(sampleFieldContractByPath('completion.fields.' + key).includeInIA, true);
  }
  for (const path of ['scratch.conclusion', 'completion.fields.conclusionEvidence', 'completion.fields.conclusionUncertainty', 'completion.fields.conclusionAdvice', 'completion.fields.conclusionFocus']) {
    const field = sampleFieldContractByPath(path);
    assert.equal(field.category, 'legacy');
    assert.equal(field.includeInIA, false);
  }
});

test('saved quantity, accuracy and review record paths use the actual runtime shapes', () => {
  const samples = [
    ['planning.primaryQuantities[].', normalizePrimaryQuantities([{name: 'Length'}])[0]],
    ['planning.accuracyPlans[].', normalizePlanningAccuracy([{source: 'primary', quantity: 'Length'}])[0]],
    ['completion.accuracyDecisions[].', normalizeCompletionState({accuracyDecisions: [{id: 'accuracy-1', quantity: 'Length'}]}).accuracyDecisions[0]],
    ['completion.review.records.{reviewId}.', createCompletionState().review.records['draft-D02']]
  ];
  for (const [prefix, schema] of samples) {
    const keys = SAMPLE_FIELD_CONTRACT.filter(item => item.path.startsWith(prefix)).map(item => item.path.slice(prefix.length));
    assert.deepEqual(keys.sort(), Object.keys(schema).sort(), prefix);
  }
  assert.equal(sampleFieldContractByPath('completion.review.records.draft-D02.note').path, 'completion.review.records.{reviewId}.note');
  assert.equal(sampleFieldContractByPath('entries.2.result').path, 'entries[].result');
});

test('coverage inspects only the explicitly selected branches and exposes a missing repeated-stage answer', () => {
  const state = createProjectState();
  state.planning.fields.kind = 'theoretical';
  state.scratch.introduction = 'I investigated which positive integers are consecutive sums.';
  state.entries = [
    {...ENTRY_BASE, id: 'first', result: 'I found a pattern in exact cases.', interpretation: 'The cases suggest a conjecture, but do not prove it.'},
    {...ENTRY_BASE, id: 'proof', result: 'I proved both directions.', interpretation: ''}
  ];
  const selected = ['scratch.introduction', 'entries[].result', 'entries[].interpretation'];
  const coverage = inspectSampleFieldCoverage(state, selected);
  assert.equal(coverage[0].present, true);
  assert.equal(coverage[1].present, true);
  assert.deepEqual(coverage[2].missing, ['entries.1.interpretation']);
  assert.equal(coverage.some(item => /primary|secondary|sampling|feedback/.test(item.path)), false);
  assert.throws(() => inspectSampleFieldCoverage(state), /Choose the applicable/);
  assert.throws(() => inspectSampleFieldCoverage(state, ['completion.fields.imaginaryAnswer']), /Unknown/);
});

test('a particular review can be inspected without requiring unused checks or fabricated teacher feedback', () => {
  const state = createProjectState();
  state.completion.review.records['draft-D02'].note = 'I checked that the residual result explains why I reserved a prediction check.';
  const result = inspectSampleFieldCoverage(state, ['completion.review.records.draft-D02.note']);
  assert.equal(result[0].present, true);
  assert.equal(sampleFieldContractByPath('completion.review.feedbackItems').category, 'external');
  assert.equal(sampleFieldContractByPath('teacher.checkpoints').category, 'external');
  assert.equal(sampleFieldContractByPath('completion.review.records.final-D06.selfMark').includeInIA, false);
  assert.deepEqual(state.completion.review.feedbackItems, []);
});
