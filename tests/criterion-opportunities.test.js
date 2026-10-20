import test from 'node:test';
import assert from 'node:assert/strict';
import {createProjectState} from '../src/core/project-state.js';
import {INVESTIGATIVE_ROUTES} from '../src/planning/investigative-routes.js';
import {CRITERION_SPOTS} from '../src/essentials/criteria-badges.js';
import {criterionAlternativeOpportunities,criterionOpportunityProfile,OTHER_CRITERION_PATHS} from '../src/essentials/criterion-opportunities.js';

function project({kind='modelling',course='AA SL',route='fitted-models'}={}){
 const state=createProjectState();
 state.route='completing';
 state.planning.fields.kind=kind;
 state.planning.fields.course=course;
 state.planning.fields.aim='What mathematical conclusion is supported?';
 state.planning.routeExplorer.selectedRoute=route;
 state.entries=[
  {id:'first',phase:'first',status:'completed',kind:'model',title:'First mathematics',
   result:'A real finding in the first stage',localTakeaway:'An observed departure from the initial model'},
  {id:'later',phase:'substantial',fromEntryId:'first',title:'Fit a model',
   methodId:'quadratic-fit',technique:'Quadratic regression',
   status:'completed',result:'Fitted a quadratic to actual data',
   localTakeaway:'Residuals show an unexpected pattern',knowledge:'syllabus'}
 ];
 state.completion.activeEntryIndex=1;
 return state;
}
function opt(s,key){
 return criterionAlternativeOpportunities(s,key,CRITERION_SPOTS[key]);
}
test('Pass 3 adds no new criterion badges or stored fields',()=>{
 assert.equal(Object.keys(CRITERION_SPOTS).length,72);
 const s=project(),before=JSON.stringify(s);
 for(const key of ['completing:C40:nextC','completing:C40:interpretD','completing:C40:resultE',
  'completing:C50:nextC','completing:C50:interpretD','completing:C50:resultE']){
  const r=opt(s,key);
  assert(r);
  assert.equal(r.criterion,CRITERION_SPOTS[key].criterion);
  assert(r.items.length>=2&&r.items.length<=3);
  assert(r.reminder.includes('not a checklist'));
  assert.equal(r.status,'based-on-completed-work');
 }
 assert.equal(JSON.stringify(s),before);
});
test('all 16 investigative journeys have genuine, different C, D and E suggestions',()=>{
 const s=project();s.entries=[];s.completion.activeEntryIndex=0;
 const observed=new Set();
 for(const route of INVESTIGATIVE_ROUTES){
  s.planning.routeExplorer.selectedRoute=route.id;
  s.planning.fields.kind=route.kinds[0];
  for(const [key,letter] of [['planning:N01V:benefit','C'],['completing:C23:limitationConsequence','D'],
   ['planning:N02M:title','E']]){
   const x=opt(s,key);
   assert(x&&x.criterion===letter,route.id+'/'+letter);
   assert(x.profile in OTHER_CRITERION_PATHS,route.id);
   assert(x.items.every(y=>y.title.length>14&&y.how.length>70),route.id+'/'+letter);
   assert.equal(x.status,'possible',route.id+'/'+letter);
   assert(!JSON.stringify(x).includes('A real finding in the first stage'));
  }
  observed.add(criterionOpportunityProfile(s,'planning:N02M:title'));
 }
 assert(observed.size>=9,'journeys should cover multiple mathematical profiles');
});
test('the active method overrides a different planning journey, but Other stays generic',()=>{
 const s=project({kind:'theoretical',route:'proof'});
 assert.equal(opt(s,'completing:C40:resultE').profile,'model');
 s.entries[1].methodId='proof';
 assert.equal(opt(s,'completing:C40:resultE').profile,'proof');
 assert(opt(s,'completing:C40:resultE').items.some(x=>x.how.includes('hypotheses')||x.how.includes('implications')));
 s.entries[1].methodId='other';
 assert.equal(opt(s,'completing:C40:resultE').profile,'general');
 s.entries[1].methodId='voronoi';
 assert.equal(opt(s,'completing:C50:interpretD').profile,'voronoi');
 s.entries[1].methodId='finance-compound';
 assert.equal(opt(s,'completing:C50:nextC').profile,'finance');
 s.entries[1].methodId='optimisation';
 assert.equal(opt(s,'completing:C40:interpretD').profile,'optimisation');
 s.entries[1].methodId='binomial';
 assert.equal(opt(s,'completing:C50:resultE').profile,'probability');
 s.entries[1].methodId='numerical-integration';
 assert.equal(opt(s,'completing:C50:resultE').profile,'numerical');
});
test('suggestions remain possible until the relevant record is completed and review-free',()=>{
 const s=project(), key='completing:C40:interpretD';
 assert.equal(opt(s,key).status,'based-on-completed-work');
 s.entries[1].status='planned';
 assert.equal(opt(s,key).status,'possible');
 assert(opt(s,key).reminder.includes('not evidence of completed mathematics'));
 s.entries[1].status='completed';
 s.entries[1].reviewNeeded='yes';
 assert.equal(opt(s,key).status,'possible');
 s.entries[1].reviewNeeded='';
 assert.equal(opt(s,key).status,'based-on-completed-work');
 s.entries[1].result='';
 assert.equal(opt(s,key).status,'possible');
 s.entries[1].result='Real result';
 s.completion.activeEntryIndex=0;
 const first=opt(s,'completing:C40:resultE');
 assert.equal(first.profile,'model','when no method is identified, the matching modelling pathway is the relevant starting point');
 assert(!JSON.stringify(first).includes('Residuals show an unexpected pattern'));
});
test('Criterion E advice distinguishes SL, HL and unknown courses without demanding beyond-syllabus maths',()=>{
 const s=project(),key='completing:C40:resultE';
 let x=opt(s,key);
 assert.equal(x.level,'SL');
 assert(x.levelNote.includes('correctly'));
 assert(x.levelNote.includes('More advanced techniques are not required'));
 s.planning.fields.course='AA HL';
 x=opt(s,key);
 assert.equal(x.level,'HL');
 assert(x.levelNote.includes('sophistication and rigour'));
 assert(x.levelNote.includes('beyond the syllabus is not required'));
 s.planning.fields.course='HL MAA';
 assert.equal(opt(s,key).level,'HL');
 s.planning.fields.course='not selected';
 x=opt(s,key);
 assert.equal(x.level,'unknown');
 assert(x.levelNote.includes('Confirm the applicable SL or HL'));
});
test('only contextual C, D or E badges offer extra routes, never A, B or the five-criterion review',()=>{
 const s=project();
 assert.equal(opt(s,'completing:C40:bridgeA'),null);
 assert.equal(opt(s,'completing:C40:resultB'),null);
 assert.equal(opt(s,'completing:C80D:title'),null);
 assert.equal(opt(s,'completing:C90F:title'),null);
 assert.equal(opt(s,'completing:C70:title'),null);
 assert.equal(opt(s,'completing:C70N:title'),null);
 assert.equal(criterionAlternativeOpportunities(s,'completing:C50:resultE',{criterion:'A'}),null);
 assert.equal(criterionAlternativeOpportunities(s,'unknown:C50:resultE',{criterion:'E'}),null);
});
test('optional advice remains relevant in the conclusion but never claims an uncompleted result',()=>{
 const s=project({kind:'theoretical',route:'proof'}),key='completing:C60:meaningAndLimits';
 let x=opt(s,key);
 assert.equal(x.profile,'model','a completed model is the actual last step, not the original proof route');
 assert.equal(x.status,'based-on-completed-work');
 s.entries[1].status='planned';
 x=opt(s,key);
 assert.equal(x.status,'based-on-completed-work','the earlier first mathematical result remains confirmed');
 s.entries[0].status='planned';
 x=opt(s,key);
 assert.equal(x.status,'possible');
 assert(!JSON.stringify(x).includes('Fitted a quadratic'));
});
