import test from 'node:test';
import assert from 'node:assert/strict';
import {createProjectState} from '../src/core/project-state.js';
import {contextualLearningChoices,renderContextualLearningHelp} from '../src/resources/contextual-learning.js';
import {resourceDrawer} from '../src/resources/views.js';
import {resourceAction} from '../src/resources/actions.js';
import {newResourceSession,setResourcePreference} from '../src/resources/state.js';
import {WORKSHOP_HELP_ROUTES} from '../src/help/workshop-help.js';
import {escapeHtml as e} from '../src/ui/primitives.js';

function fixture({route='completing',node='C40',path='relationships',method='pmcc',status='planned',result=''}={}){
 const s=createProjectState();
 s.route=route;s.completion.current=node;s.planning.current=route==='planning'?node:'N01';
 s.planning.fields.course='AI SL';
 s.planning.routeExplorer.selectedRoute=path;
 if(method){
  s.entries=[{id:'selected-maths',title:'A student-defined topic, not a source for a guessed method',
   methodId:method,phase:'substantial',status,result,kind:'table',knowledge:'syllabus',
   sourceRefs:[],accuracyRefs:[]}];
  s.completion.activeEntryIndex=0;
 }
 return s;
}
const intact=s=>JSON.stringify({planning:s.planning,completion:s.completion,entries:s.entries,project:s.project,resources:s.resources,scratch:s.scratch});
const h=(s,spot,issueId='')=>contextualLearningChoices(s,{spot,issueId});
test('Pass 3: shared contextual help recognises the exact writing box on the same route',()=>{
 const s=fixture({path:'fitted-models',method:'linear-regression'}),before=intact(s);
 assert.equal(h(s,'field:purpose').focus,'start');
 assert.equal(h(s,'field:result').focus,'calculate');
 assert.equal(h(s,'field:interpretation').focus,'interpret');
 assert.equal(h(s,'field:nextQuestion').focus,'follow');
 assert.equal(h(s,'field:result').termId,'regression-line');
 assert.equal(h(s,'field:interpretation').termId,'residual');
 assert.equal(h(s,'field:nextQuestion').termId,'residual-pattern');
 assert.equal(h(s,'field:interpretation').guideId,'','A plan is not a completed result');
 assert.equal(intact(s),before);
});
test('Pass 3: actual selected method chooses a tutorial only for the relevant work and respects preferred tool',()=>{
 const s=fixture(),before=intact(s);
 assert.equal(h(s,'field:result').lessonId,'pearson');
 assert.equal(h(s,'field:result').guideId,'sheets-pmcc');
 setResourcePreference(s,'entry:selected-maths','tool','desmos');
 assert.equal(h(s,'field:result').guideId,'desmos-pmcc');
 const html=renderContextualLearningHelp(s,e,{spot:'field:result'});
 assert(html.includes('data-resource-id="desmos-pmcc"'));
 assert(html.includes('data-resource-spot="field:result"'));
 assert(html.includes('data-workshop-help-focus="calculate"'));
 assert(!html.includes('<iframe'));
 assert(!html.includes('<script'));
 assert.notEqual(intact(s),before,'Only the explicitly chosen tool preference should change');
});
test('Pass 3: topic or title alone never chooses a technique or inappropriate software',()=>{
 const s=fixture({path:'',method:'other'});
 s.entries[0].title="I might choose Pearson correlation or a normal test later";
 s.entries[0].technique='Please calculate PMCC for me';
 const before=intact(s);
 assert.equal(h(s,'field:result'),null);
 assert.equal(h(s,'field:interpretation'),null);
 assert.equal(intact(s),before);
});
test('Pass 3: each of sixteen explicitly chosen pathways has a definition and practice route without forcing extra methods',()=>{
 for(const [path] of Object.entries(WORKSHOP_HELP_ROUTES)){
  const s=fixture({route:'planning',node:'N04S',path,method:''}),before=intact(s);
  const x=h(s,'page');
  assert(x?.lessonId&&x?.termId,path);
  assert.equal(x.guideId,'',path+' must not assume a technique before it is selected');
  assert.equal(x.creatorId,'',path+' must not launch a figure in planning');
  assert.equal(intact(s),before);
 }
});
test('Pass 3: sampling box uses actual data-source choice, not the broader pathway',()=>{
 const s=fixture({route:'planning',node:'N03P2',path:'optimisation',method:''});
 assert.equal(h(s,'page','sample-choice').termId,'sampling');
 assert.equal(h(s,'page','sample-choice').lessonId,'sampling');
 s.planning.fields.dataSource='secondary';
 assert.equal(h(s,'page','sample-choice').guideId,'secondary-data');
 s.planning.fields.dataSource='primary';
 assert.equal(h(s,'page','sample-choice').guideId,'forms');
 s.teacher.pendingApproval=true;
 assert.equal(h(s,'page','sample-choice').guideId,'');
 assert.equal(h(s,'page','permission'),null);
 s.teacher.pendingApproval=false;s.planning.fields.kind='theoretical';
 assert.equal(h(s,'page','sample-choice'),null);
});
test('Pass 3: course-depth concerns offer conceptual guidance but no unsupported practical shortcut',()=>{
 const s=fixture({route:'planning',node:'N04S',path:'finance',method:''});
 const x=h(s,'page','course-depth');
 assert(x?.lessonId&&x?.termId);
 assert.equal(x.guideId,'');
 assert.equal(x.creatorId,'');
});
test('Pass 3: relevant figure creator only appears for a chosen pathway and actual figure work',()=>{
 const s=fixture({node:'C31',path:'voronoi',method:''});
 assert.equal(h(s,'page').creatorId,'voronoi');
 s.completion.current='C40';
 assert.equal(h(s,'field:purpose').creatorId,'');
 assert.equal(h(s,'field:result').creatorId,'voronoi');
 s.planning.routeExplorer.selectedRoute='';
 assert.equal(h(s,'field:result'),null);
});
test('Pass 3: theoretical investigations can learn proof without being asked for data collection',()=>{
 const s=fixture({node:'C30',path:'proof',method:''});
 s.planning.fields.kind='theoretical';
 const x=h(s,'part:show','theory-first');
 assert.equal(x.lessonId,'proof-conjectures');
 assert.equal(x.guideId,'proof-exploration');
 assert(!renderContextualLearningHelp(s,e,{spot:'part:show',issueId:'theory-first'}).includes('data-resource-id="forms"'));
});
test('Pass 3: conclusion, checking, introduction and unresolved permission do not inject method advice',()=>{
 const s=fixture({path:'relationships'});
 for(const node of ['C10','C60','C70','C80']){s.completion.current=node;assert.equal(h(s,'page'),null,node);}
 s.route='checking';assert.equal(h(s,'page'),null);
 s.route='planning';s.planning.current='N03P2';assert.equal(h(s,'page','consent-waiting'),null);
});
test('Pass 3: the help origin preserves the exact box and issue on entering Tools & tutorials',()=>{
 const s=fixture({path:'optimisation',method:'optimisation'});
 const before=intact(s),u=newResourceSession();
 s.completion.support.origin={
  route:'completing',node:'C40',planNode:'N01',entryId:'selected-maths',
  nextFromEntryId:'',helpSpot:'C40:field:interpretation',checkMode:'draft'
 };
 s.completion.support.selected='fix:studio:meaning-units';
 s.completion.current='C95';
 assert(resourceAction(s,u,'resource-browse',{resourceHelp:'true'},'stuck').open);
 assert.equal(u.parent,'stuck');
 assert.equal(u.supportSpot,'C40:field:interpretation');
 assert.equal(u.supportIssue,'fix:studio:meaning-units');
 const html=resourceDrawer(s,u);
 assert(html.includes('Help for this writing box'));
 assert(html.includes('data-workshop-help-focus="interpret"'));
 assert(html.includes('data-workshop-term="global-extremum"'));
 assert(resourceAction(s,u,'resource-open',{resourceId:'derivatives'},'resources').open);
 assert(resourceAction(s,u,'resource-list',{},'resources').open);
 assert.equal(u.supportSpot,'C40:field:interpretation');
 assert.equal(s.completion.current,'C95');
 assert.equal(s.entries[0].methodId,'optimisation');
});
test('Pass 3: a focused pop-in tutorial carries its box without leaking a private aim',()=>{
 const s=fixture();
 s.planning.fields.aim='PRIVATE AIM <img src=x onerror=alert(1)>';
 const html=renderContextualLearningHelp(s,e,{spot:'C40:field:result',issueId:'real-calculation'});
 assert(html.includes('data-resource-spot="C40:field:result"'));
 assert(!html.includes('PRIVATE AIM'));
 assert(!html.includes('onerror='));
 const u=newResourceSession(),before=intact(s);
 assert(resourceAction(s,u,'resource-open',{resourceId:'sheets-pmcc',
  resourceHelp:'true',resourceSpot:'C40:field:result',resourceIssue:'real-calculation'},'help').open);
 assert.equal(u.supportSpot,'C40:field:result');
 assert.equal(u.supportIssue,'real-calculation');
 assert.equal(intact(s),before);
});


test('Pass 3: a specific source or permission obstacle suppresses generic method recommendations',()=>{
 const s=fixture({route:'planning',node:'N03P2',path:'relationships',method:''});
 s.planning.fields.dataSource='primary';
 s.completion.support.origin={route:'planning',planNode:'N03P2',node:'C00',
  entryId:'',nextFromEntryId:'',helpSpot:'N03P2:page'};
 s.completion.support.selected='permission';
 const before=intact(s),u=newResourceSession();
 assert(resourceAction(s,u,'resource-browse',{resourceHelp:'true'},'stuck').open);
 const html=resourceDrawer(s,u);
 assert(!html.includes('class="resource-current resource-home-relevant"'));
 assert(!html.includes('data-resource-id="forms"'));
 assert.equal(intact(s),before);
});
