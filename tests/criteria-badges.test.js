import test from 'node:test';
import assert from 'node:assert/strict';
import {
 CRITERION_SPOTS,criterionSpotFor,criterionPageHeading,criterionMarkedField,
 criterionBadge,isCriterionSpotPage,criterionFieldSpots
} from '../src/essentials/criteria-badges.js';
import {CRITERIA} from '../src/essentials/catalog.js';
import {contextualBadgeGuidance} from '../src/essentials/criteria-badge-guidance.js';
import {createProjectState} from '../src/core/project-state.js';

test('three passes retain selective and specific criteria without new administrative badges',()=>{
 const keys=Object.keys(CRITERION_SPOTS);
 assert.equal(keys.length,45);
 for(const [key,criterion] of [
  ['planning:N01V:benefit','C'],['planning:N02M:title','E'],
  ['completing:C10:aim','A'],['completing:C10:motivation','C'],
  ['completing:C20:source','A'],['completing:C20:method','C'],
  ['completing:C20:firstBridge','A'],['completing:C20:firstChoice','C'],['completing:C20:firstPurpose','E'],
  ['completing:C21S:samplingRationale','C'],['completing:C21S:responseBias','D'],
  ['completing:C21M:modelAssumptions','E'],['completing:C21M:modelDomain','D'],
  ['completing:C21T:theoreticalObject','E'],
  ['completing:C22:methodReason','C'],['completing:C23:limitationConsequence','D'],
  ['completing:C24:accuracyReason','B'],['completing:C25:variableDefinitions','B'],
  ['completing:C26:dataAimLink','A'],
  ['completing:C34A:accuracyForResult','B'],['completing:C34U:surpriseCheck','D'],
  ['completing:C35H:nextReason','C'],['completing:C40D:courseWhy','E'],
  ['completing:C34B:title','D'],['completing:C70N:title','B'],
  ['completing:C31:firstPurpose','E'],['completing:C32:purpose','A'],
  ['completing:C33:title','B'],['completing:C34:observation','E'],
  ['completing:C35:nextQuestion','C'],['completing:C35:nextReason','D'],
  ['completing:C35B:title','E'],['completing:C35P:title','E'],
  ['completing:C40:title','E'],['completing:C50:title','E'],
  ['completing:C40T:title','E'],['completing:C40L:title','E'],
  ['completing:C61:mainConclusion','A'],['completing:C61:uncertainty','D'],
  ['completing:C62:benefit','D'],['completing:C63:extension','D'],
  ['completing:C64:title','A'],['completing:C70:title','A'],
  ['completing:C80D:title','A'],['completing:C90F:title','A']
 ])assert.equal(CRITERION_SPOTS[key].criterion,criterion);
 assert.equal(criterionSpotFor('planning','N02M'),'planning:N02M:title');
 assert.equal(criterionSpotFor('completing','C34B'),'completing:C34B:title');
 assert.equal(criterionSpotFor('completing','C70N'),'completing:C70N:title');
 assert.equal(criterionSpotFor('planning','N01V'),'');
 assert.equal(criterionSpotFor('completing','C20'),'');
 assert(isCriterionSpotPage('planning','N01V'));
 assert(!isCriterionSpotPage('planning','N03D'));
 assert.deepEqual(criterionFieldSpots('completing','C35'),['completing:C35:nextQuestion','completing:C35:nextReason']);
 assert.deepEqual(criterionFieldSpots('completing','C34'),['completing:C34:observation']);
 assert.deepEqual(criterionFieldSpots('completing','C33'),[]);
 assert(isCriterionSpotPage('completing','C31'));
 assert(isCriterionSpotPage('completing','C35'));
 assert(isCriterionSpotPage('completing','C35P'));
 assert(!isCriterionSpotPage('completing','C35H'));
 assert(!isCriterionSpotPage('completing','C21S'));
 assert(!isCriterionSpotPage('completing','C90'));
 assert(!isCriterionSpotPage('completing','C80'));
 assert.deepEqual(criterionFieldSpots('completing','C61'),
  ['completing:C61:mainConclusion','completing:C61:uncertainty']);
 assert.deepEqual(criterionFieldSpots('completing','C62'),['completing:C62:benefit']);
 assert.deepEqual(criterionFieldSpots('completing','C63'),['completing:C63:extension']);
 assert.deepEqual(CRITERION_SPOTS['completing:C80D:title'].criteria,['A','B','C','D','E']);
 assert.deepEqual(CRITERION_SPOTS['completing:C90F:title'].criteria,['A','B','C','D','E']);
 for(const spot of Object.values(CRITERION_SPOTS)){
  assert(CRITERIA[spot.criterion]);
  for(const k of ['why','strong','avoid','reminder'])assert(spot[k].length>25,k);
  assert(spot.location.length>12&&spot.stage.length>8);
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
  ['planning','N02M','E'],['completing','C34B','D'],['completing','C70N','B'],
  ['completing','C33','B'],['completing','C35B','E'],
  ['completing','C35P','E'],['completing','C40','E'],
  ['completing','C50','E'],['completing','C40T','E'],
  ['completing','C40L','E'],['completing','C64','A'],
  ['completing','C70','A']
 ]){
  const html=criterionPageHeading('Task <b>title</b>',route,node);
  assert(html.includes('class="criterion-title-row"'));
  assert(html.includes('Task &lt;b&gt;title&lt;/b&gt;'));
  assert(html.includes('Criterion '+letter+' — '));
  assert(html.includes('class="task-heading"'));
 }
 for(const node of ['C80D','C90F']){
  const html=criterionPageHeading('Review <b>title</b>','completing',node);
  assert(html.includes('criterion-badge-multi'));
  assert(html.includes('aria-label="Criteria A–E: advice for'));
  assert(html.includes('Review &lt;b&gt;title&lt;/b&gt;'));
  assert(html.includes('>A–E</span>'));
 }
 assert(!criterionPageHeading('Ordinary', 'planning','N03D').includes('criterion-badge'));
});
test('badge rendering is read only and does not mutate stored IA work',()=>{
 const s=createProjectState(),before=JSON.stringify(s);
 criterionPageHeading(s.planning.fields.aim,'planning','N02M');
 criterionMarkedField('a user-editable field','planning:N01V:benefit');
 assert.equal(JSON.stringify(s),before);
});

const evidenceFixture=()=>{
 const state=createProjectState();
 state.route='completing';state.planning.fields.aim='How well does my model describe actual observations?';
 state.planning.fields.kind='statistics';state.planning.fields.course='AI SL';
 state.entries=[{
  id:'actual-one',phase:'first',kind:'scatter',title:'Actual scatter graph',
  technique:'Plot paired measurements',status:'completed',
  result:'A curved upward pattern with a surprising point',
  localTakeaway:'The trend is not well described by a straight line.',
  knowledge:'syllabus',accuracyRefs:['accuracy-a']
 }];
 state.completion.activeEntryIndex=0;state.completion.nextFromEntryId='actual-one';
 state.completion.fields.nextQuestion='Would a curved model describe these values better?';
 state.completion.fields.scatterPattern='curved';
 state.completion.scatterPatternForEntryId='actual-one';
 state.completion.accuracyDecisions=[{id:'accuracy-a',quantity:'Time',policy:'nearest 0.1 seconds',unit:'s'}];
 return state;
};
const info=(state,key)=>contextualBadgeGuidance(state,key,CRITERION_SPOTS[key]);
test('next-question C and justification D reflect only the selected actual result',()=>{
 const s=evidenceFixture(),before=JSON.stringify(s);
 const c=info(s,'completing:C35:nextQuestion');
 const d=info(s,'completing:C35:nextReason');
 assert(c.real&&d.real);
 assert(c.details.some(x=>x.text.includes('trend is not well described')));
 assert(d.details.some(x=>x.text.includes('Would a curved model')));
 assert.equal(JSON.stringify(s),before);
 s.entries[0].status='planned';
 const unavailable=info(s,'completing:C35:nextReason');
 assert.equal(unavailable.real,false);
 assert(unavailable.strong.includes('Complete and check a genuine'));
 assert(!unavailable.details.some(x=>x.label==='Selected previous genuine finding'));
});
test('actual scatter context is specific, with no false Pearson calculation or forced regression',()=>{
 const s=evidenceFixture();
 const x=info(s,'completing:C35B:title');
 assert(x.strong.includes('nonlinear'));
 assert(x.details.some(x=>x.text.includes('not well described')));
 const pmcc=info(s,'completing:C35P:title');
 assert(pmcc.reminder.includes('not a finding'));
 assert(!pmcc.details.some(x=>x.label.includes('Pearson result')));
 s.entries[0].kind='model';s.entries[0].methodId='pmcc';s.entries[0].technique='Pearson correlation';
 s.entries[0].result='r=0.72';
 const actualPMCC=info(s,'completing:C35P:title');
 assert(actualPMCC.details.some(x=>x.text==='r=0.72'));
});
test('new mathematical observation and presentation guidance never invent completed mathematics',()=>{
 const s=evidenceFixture();
 const first=info(s,'completing:C34:observation');
 assert(first.real);assert(first.details.some(x=>x.text.includes('not well described by a straight line')));
 assert(first.details.some(x=>x.text.includes('nearest 0.1 seconds')));
 s.entries[0].status='planned';
 for(const key of ['completing:C33:title','completing:C34:observation']){
  const planned=info(s,key);
  assert(!planned.real);
  assert(planned.why.includes('not an actual finding'));
  assert(!planned.details.some(x=>x.label==='Genuine result of this mathematical step'));
 }
 s.completion.fields.firstType='table';
 assert(info(s,'completing:C31:firstPurpose').details.some(x=>x.text==='a numerical table'));
});
test('substantial E badges use course familiarity, researched first use and the active entry only',()=>{
 const s=evidenceFixture();
 s.entries.push({id:'later-one',phase:'substantial',title:'A curved model',
  technique:'Quadratic regression',methodId:'quadratic-fit',status:'planned',
  knowledge:'outside',unfamiliarComponent:'Least-squares quadratic',
  result:'',accuracyRefs:[]});
 s.completion.activeEntryIndex=1;
 let g=info(s,'completing:C40:title');
 assert(!g.real);assert(g.strong.includes('Complete and check'));
 assert(g.details.some(x=>x.text==='Quadratic regression'));
 assert(!g.details.some(x=>x.text.includes('curved upward pattern')));
 s.entries[1].status='completed';s.entries[1].result='A fitted quadratic equation';
 g=info(s,'completing:C40:title');
 assert(g.real);assert(g.strong.includes('precise unfamiliar component'));
 assert(g.reminder.includes('cite the source'));
 s.entries[1].knowledge='syllabus';
 g=info(s,'completing:C50:title');
 assert(g.strong.includes('no need to teach'));
 s.entries[1].knowledge='unsure';
 g=info(s,'completing:C40L:title');
 assert(g.reminder.includes('Course status remains uncertain'));
 s.entries[1].knowledge='outside';
 s.entries[1].researchSource='An actual mathematical text';
 s.entries.push({...s.entries[1],id:'later-two',phase:'substantial'});
 s.completion.activeEntryIndex=2;
 g=info(s,'completing:C50:title');
 assert(g.strong.includes('already explained'));
});
test('technology guidance belongs to selected record rather than another calculation',()=>{
 const s=evidenceFixture();
 s.entries.push({id:'math-two',phase:'substantial',status:'completed',
  technique:'Solve the model',result:'Modelled coefficient',
  knowledge:'syllabus'});
 s.completion.activeEntryIndex=1;
 s.completion.fields.technologyForEntryId='actual-one';
 s.completion.fields.technologyTool='Spreadsheet used for the earlier scatter';
 const before=info(s,'completing:C40T:title');
 assert(!before.details.some(x=>x.label==='Tool used on this record'));
 s.completion.fields.technologyForEntryId='math-two';
 const after=info(s,'completing:C40T:title');
 assert(after.details.some(x=>x.text.includes('Spreadsheet used')));
});

test('Pass 3 conclusion advice honours real results and theoretical scope rather than inventing findings',()=>{
 const s=evidenceFixture(),before=JSON.stringify(s);
 s.planning.fields.beneficiary='To compare the usefulness of two models';
 let g=info(s,'completing:C61:mainConclusion');
 assert(g.real);assert(g.details.some(x=>x.text.includes('not well described by a straight line')));
 assert(g.details.some(x=>x.text.includes('How well does my model')));
 g=info(s,'completing:C62:benefit');
 assert(g.details.some(x=>x.text.includes('compare the usefulness')));
 assert(!g.details.some(x=>x.label.includes('Actual beneficiary')));
 s.planning.fields.kind='theoretical';
 g=info(s,'completing:C61:mainConclusion');
 assert(g.strong.includes('domain and assumptions'));
 s.planning.fields.kind='statistics';
 s.entries[0].status='planned';
 for(const key of ['completing:C61:mainConclusion','completing:C61:uncertainty',
  'completing:C62:benefit','completing:C63:extension','completing:C64:title']){
  const x=info(s,key);
  assert(!x.real,key);
  assert(x.why.includes('no mathematical results marked completed'),key);
  assert(!x.details.some(d=>d.label==='Last mathematical finding marked completed'),key);
  assert(x.reminder.includes('cannot verify'),key);
 }
 assert.equal(s.entries[0].status,'planned');
});
test('Conclusion reflections and presentation references remain student observations, not verified repairs',()=>{
 const s=evidenceFixture();
 s.completion.fields.conclusionFocus='Move a repeated method before the conclusion';
 s.completion.fields.presentationIssue='Graph 1 needs clearer labels';
 s.completion.fields.referencesIssue='Check the attribution for the plotted data';
 s.entries[0].reviewNeeded='yes';
 const before=JSON.stringify(s);
 const uncertainty=info(s,'completing:C61:uncertainty');
 assert(uncertainty.reminder.includes('outstanding review flag'));
 const conclusion=info(s,'completing:C64:title');
 assert(conclusion.details.some(x=>x.label.includes('not yet verified')));
 const presentation=info(s,'completing:C70:title');
 assert(presentation.details.some(x=>x.text.includes('Graph 1')));
 assert(presentation.details.some(x=>x.label.includes('not yet checked')));
 assert(presentation.reminder.includes('not inspected'));
 assert.equal(JSON.stringify(s),before);
});
test('A-E combined badge reuses draft/final evidence pointers, never a predicted score or automatic status',()=>{
 const s=evidenceFixture();
 const review=s.completion.review.records;
 review['draft-D02'].location='Draft section 1';
 review['draft-D06'].location='Draft equations 3-5';
 review['draft-D06'].selfMark='6';
 review['final-D02'].location='Revised page 2 <img src=x>';
 review['final-D06'].location='Revised equation 6';
 s.completion.fields.draftComplete='not-yet';
 let g=info(s,'completing:C80D:title');
 assert.equal(g.reviewMode,'draft');
 assert.deepEqual(g.reviewRows.map(x=>x.id),['A','B','C','D','E']);
 assert(g.reviewRows.find(x=>x.id==='A').location==='Draft section 1');
 assert(g.reviewRows.find(x=>x.id==='E').location==='Draft equations 3-5');
 assert(g.reviewRows.find(x=>x.id==='B').location==='');
 assert(!JSON.stringify(g).includes('"6"'));
 assert(g.reminder.includes('not confirmed complete'));
 g=info(s,'completing:C90F:title');
 assert.equal(g.reviewMode,'final');
 assert(g.reviewRows.find(x=>x.id==='A').location.includes('<img src=x>'));
 assert(g.reviewRows.find(x=>x.id==='E').location==='Revised equation 6');
 assert(!JSON.stringify(g.reviewRows).includes('Draft section 1'));
 assert(g.reminder.includes('does not inspect')||g.reminder.includes('neither inspects'));
 s.entries[0].status='planned';
 g=info(s,'completing:C90F:title');
 assert(!g.real);
 assert(g.strong.includes('actual IA file'));
 assert(g.reviewRows.find(x=>x.id==='E').location==='Revised equation 6');
});
test('Reading Pass 3 criteria advice does not change the saved mathematical project or existing self-review',()=>{
 const s=evidenceFixture();
 s.completion.review.records['final-D03'].location='Page 5';
 s.completion.review.feedbackItems.push({status:'implemented'});
 const before=JSON.stringify(s);
 for(const key of [
  'completing:C61:mainConclusion','completing:C61:uncertainty',
  'completing:C62:benefit','completing:C63:extension',
  'completing:C64:title','completing:C70:title',
  'completing:C80D:title','completing:C90F:title'
 ])info(s,key);
 assert.equal(JSON.stringify(s),before);
 assert(info(s,'completing:C90F:title').details.some(x=>x.text.includes('feedback actions')));
});

test('introduction A and C badges guide the writing rather than awarding marks',()=>{
 const aim=CRITERION_SPOTS['completing:C10:aim'];
 const motive=CRITERION_SPOTS['completing:C10:motivation'];
 assert(aim.strong.includes('few focused paragraphs'));
 assert(aim.reminder.includes('not a prescribed IB introduction'));
 assert(motive.avoid.includes('invented personal anecdote'));
 const s=createProjectState();s.route='completing';s.completion.current='C10';
 s.planning.fields.aim='A genuine precise mathematical aim';
 s.planning.fields.motivation='I wondered about an observed pattern';
 const before=JSON.stringify(s);
 const a=contextualBadgeGuidance(s,'completing:C10:aim',aim);
 const c=contextualBadgeGuidance(s,'completing:C10:motivation',motive);
 assert(a.details.some(x=>x.text.includes('mathematical aim')));
 assert(c.details.some(x=>x.text.includes('observed pattern')));
 assert.equal(JSON.stringify(s),before);
});
