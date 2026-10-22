import test from 'node:test';
import assert from 'node:assert/strict';
import {createProjectState, normalizeProjectState} from '../src/core/project-state.js';
import {applyPlanningField, planAutoAdvance, planningMove} from '../src/planning/engine.js';
import {PLANNING_ROUTES} from '../src/planning/route-table.js';
import {createPlanningViews} from '../src/ui/planning-views.js';
import {firstMathsContext, firstMathsExampleTopic, renderFirstMathsSparks} from '../src/completing/first-maths-bridge.js';
import {escapeHtml, icon} from '../src/ui/primitives.js';

const setup = (kind = 'modelling') => {
  const state = createProjectState();
  state.route = 'planning';
  state.planning.current = 'N03';
  applyPlanningField(state, 'kind', kind);
  applyPlanningField(state, 'course', 'AA SL');
  state.planning.routeExplorer.selectedRoute = kind === 'modelling' ? 'optimisation' : 'relationships';
  return state;
};
const assumptions = state => {
  applyPlanningField(state, 'dataSource', 'theoretical');
  applyPlanningField(state, 'theoreticalAim', 'Which common cut gives the greatest guaranteed tray volume?');
  applyPlanningField(state, 'theoreticalCase', 'I define a 30 cm by 20 cm sheet and a common cut c, with 0 < c < 10 cm. These dimensions are exact model inputs.');
};
const renderPlanning = state => createPlanningViews({
  getState: () => state, icon: () => '', e: escapeHtml, button: () => '',
  field: (path, label) => '<label data-field="' + path + '">' + escapeHtml(label) + '</label>',
  choose: (path, options) => '<div data-choice="' + path + '">' + options.map(option =>
    '<span data-value="' + option.value + '">' + escapeHtml(option.title) + '</span>').join('') + '</div>',
  numberPick: () => '', note: () => '', summary: (label, value) => label + ': ' + value,
  helpButton: () => '', helpBox: () => '', tabletNav: () => ''
}).viewPlanning();

test('modelling can define assumptions and join prediction and common practical checks without a data branch', () => {
  const state = setup();
  assumptions(state);
  const transition = planAutoAdvance(state);
  assert.equal(transition.ok, true, transition.error);
  assert.equal(state.planning.current, 'N01P');
  assert.equal(transition.route.answer, 'Defined mathematical assumptions');
  assert.equal(transition.route.sourceRow, null);
  assert(PLANNING_ROUTES.includes(transition.route));
  assert.equal(state.journey.answers.N03.route, 'Defined mathematical assumptions');
  assert.deepEqual(state.planning.sourceBranches, {primary: false, secondary: false});
  assert.equal(planAutoAdvance(state).ok, true);
  assert.equal(state.planning.current, 'N03D');
  applyPlanningField(state, 'dataAvailability', 'in-hand');
  applyPlanningField(state, 'permissionNeed', 'no');
  applyPlanningField(state, 'practicalBlocker', 'no');
  assert.equal(planAutoAdvance(state).ok, true);
  assert.equal(state.planning.current, 'N03H');
  assert.equal(state.project.kind, 'modelling');
  assert.equal(state.project.dataStatus, 'theoretical');
  assert.equal(state.project.dataDetails, state.planning.fields.theoreticalCase);
  assert.equal(state.entries.length, 0);
  assert.equal(state.completion.sourceRecords.length, 0);
  assert.equal(state.planning.completed, false);
  assert.equal(state.teacher.feedbackStatus, 'not-requested');
  assert.deepEqual(state.teacher.checkpoints, []);
});

test('the assumptions route requires a modelling choice and some defined starting material', () => {
  const model = setup();
  applyPlanningField(model, 'dataSource', 'theoretical');
  assert.equal(planAutoAdvance(model).ok, false);
  assert.equal(model.planning.current, 'N03');
  applyPlanningField(model, 'theoreticalCase', 'A rectangle with positive side lengths.');
  assert.equal(planAutoAdvance(model).ok, true);
  const statistics = setup('statistics');
  assumptions(statistics);
  assert.equal(planAutoAdvance(statistics).ok, false);
  assert.equal(planningMove(statistics, 'Defined mathematical assumptions').ok, false);
  assert.equal(statistics.planning.current, 'N03');
  assert.equal(statistics.journey.history.length, 0);
});

test('existing primary, secondary and both-source choices retain their own routes', () => {
  for (const [source, destination] of [['primary', 'N03P'], ['secondary', 'N03S'], ['both', 'N03B']]) {
    for (const kind of ['statistics', 'modelling']) {
      const state = setup(kind);
      applyPlanningField(state, 'dataSource', source);
      assert.equal(planAutoAdvance(state).ok, true);
      assert.equal(state.planning.current, destination);
    }
  }
});

test('the modelling option and assumption fields appear only in their applicable planning branch', () => {
  const state = setup();
  assert.match(renderPlanning(state), /data-value="theoretical"/);
  assert.doesNotMatch(renderPlanning(setup('statistics')), /data-value="theoretical"/);
  assert.doesNotMatch(renderPlanning(setup('theoretical')), /data-value="theoretical"/);
  assumptions(state);
  const html = renderPlanning(state);
  assert.match(html, /data-field="planning.fields.theoreticalAim"/);
  assert.match(html, /data-field="planning.fields.theoreticalCase"/);
  assert.match(html, /Which starting quantities, assumptions and constraints will define the model/);
  assert.doesNotMatch(html, /data-field="planning.fields.primaryHow"/);
  state.planning.current = 'N06';
  assert.match(renderPlanning(state), /Defined mathematical assumptions · I define a 30 cm by 20 cm sheet/);
});

test('saved assumptions retain the modelling pathway and appropriate first-mathematics guidance', () => {
  const state = setup();
  assumptions(state);
  const restored = normalizeProjectState(JSON.parse(JSON.stringify(state)));
  const before = JSON.stringify(restored);
  const context = firstMathsContext(restored);
  assert.equal(context.kind, 'modelling');
  assert.equal(context.sourceKey, 'theoretical');
  assert.equal(context.activeRoute.id, 'optimisation');
  assert.equal(context.mismatched, false);
  assert.equal(context.sourceDetails, state.planning.fields.theoreticalCase);
  assert.equal(context.source.title, 'Defined model assumptions');
  assert.match(context.source.guidance, /distinguish mathematical checks from empirical validation/);
  assert.notEqual(firstMathsExampleTopic(restored), 'proof');
  const html = renderFirstMathsSparks(restored, icon, escapeHtml);
  assert.match(html, /Defined model assumptions/);
  assert.match(html, /data-node="N03"[^>]*>[^<]*Review source choices/);
  assert.equal(JSON.stringify(restored), before);
});

test('changing defined assumptions marks dependent completed mathematics for review', () => {
  const state = setup();
  assumptions(state);
  for (const stage of ['C20', 'C30', 'C40', 'C60']) state.completion.stages[stage] = 'complete';
  applyPlanningField(state, 'theoreticalCase', 'I now impose a maximum height of 4 cm.');
  for (const stage of ['C20', 'C30', 'C40', 'C60']) assert.equal(state.completion.stages[stage], 'needs-review');
});
