import test from 'node:test';
import assert from 'node:assert/strict';
import {
 CRITERION_SPOTS,criterionSpotFor,criterionPageHeading,criterionMarkedField,
 criterionBadge,isCriterionSpotPage
} from '../src/essentials/criteria-badges.js';
import {CRITERIA} from '../src/essentials/catalog.js';
import {createProjectState} from '../src/core/project-state.js';

test('pass-one opportunity map contains exactly one box and three page-title badges',()=>{
 const keys=Object.keys(CRITERION_SPOTS);
 assert.deepEqual(keys,[
  'planning:N01V:benefit','planning:N02M:title',
  'completing:C34B:title','completing:C70N:title'
 ]);
 assert.deepEqual(keys.map(k=>CRITERION_SPOTS[k].criterion),['C','E','D','B']);
 assert.equal(criterionSpotFor('planning','N02M'),'planning:N02M:title');
 assert.equal(criterionSpotFor('completing','C34B'),'completing:C34B:title');
 assert.equal(criterionSpotFor('completing','C70N'),'completing:C70N:title');
 assert.equal(criterionSpotFor('planning','N01V'),'');
 assert.equal(criterionSpotFor('completing','C20'),'');
 assert(isCriterionSpotPage('planning','N01V'));
 assert(!isCriterionSpotPage('planning','N03D'));
 for(const spot of Object.values(CRITERION_SPOTS)){
  assert(CRITERIA[spot.criterion]);
  for(const k of ['why','strong','avoid','reminder','location','stage'])assert(spot[k].length>25,k);
 }
});
test('box badges preserve existing labels and use real buttons with accurate accessible names',()=>{
 const html=criterionMarkedField('<div class="field-group"><label for="benefit">Who could benefit?</label><textarea id="benefit"></textarea></div>','planning:N01V:benefit');
 assert(html.includes('class="criterion-marked-field"'));
 assert(html.includes('aria-label="Criterion C — Personal engagement: advice for Who might benefit, and how could the answer help?"'));
 assert(html.includes('<textarea id="benefit"></textarea>'));
 assert(html.includes('type="button"'));
 assert(html.includes('data-criterion-badge="planning:N01V:benefit"'));
 assert(!html.includes('data-bind="'));
 assert.equal(criterionBadge('planning:INVALID'),'');
 assert.equal(criterionMarkedField('original','missing'),'original');
});
test('page title markers render selectively without inserting user text as HTML',()=>{
 for(const [route,node,letter] of [
  ['planning','N02M','E'],['completing','C34B','D'],['completing','C70N','B']
 ]){
  const html=criterionPageHeading('Task <b>title</b>',route,node);
  assert(html.includes('class="criterion-title-row"'));
  assert(html.includes('Task &lt;b&gt;title&lt;/b&gt;'));
  assert(html.includes('Criterion '+letter+' — '));
  assert(html.includes('class="task-heading"'));
 }
 assert(!criterionPageHeading('Ordinary', 'planning','N03D').includes('criterion-badge'));
});
test('badge rendering is read only and does not mutate stored IA work',()=>{
 const s=createProjectState(),before=JSON.stringify(s);
 criterionPageHeading(s.planning.fields.aim,'planning','N02M');
 criterionMarkedField('a user-editable field','planning:N01V:benefit');
 assert.equal(JSON.stringify(s),before);
});
