import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createProjectState,normalizeProjectState} from '../src/core/project-state.js';
import {createPlanningViews} from '../src/ui/planning-views.js';
import {ideaAction,ideaInput} from '../src/ideas/engine.js';
import {cleanDraft,normalizeIdeaState} from '../src/ideas/state.js';
import {applyPlanningField,chooseMathRoute,setPlanCurrent} from '../src/planning/engine.js';
import {
 ideaLabPlanningContext,renderIdeaLabPlanningCue,renderIdeaLabWritingCue
} from '../src/planning/idea-lab-bridge.js';
import {selectedInvestigativeRoute} from '../src/completing/adaptive-journey.js';
import {writingGuidanceForFirstMaths} from '../src/completing/first-maths-writing-guidance.js';

const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const view={e:esc,icon:()=>'<svg class="icon"></svg>'};
const clone=x=>JSON.parse(JSON.stringify(x));
function start(){
 const s=createProjectState();s.route='planning';setPlanCurrent(s,'N00B');return s;
}
const action=(s,name,data={})=>{
 const result=ideaAction(s,'idea-'+name,data);
 assert(result?.ok,JSON.stringify({name,error:result?.error}));
 return result;
};
function selectedSport(){
 const s=start();
 action(s,'map-root',{root:'hobbies'});
 action(s,'map-topic',{topic:'sport'});
 action(s,'map-route',{routeId:'optimisation'});
 assert.equal(ideaLabPlanningContext(s),null,'Clicking a bubble cannot create a route hint');
 action(s,'explore',{seed:'math-sport-optimise',map:'true'});
 const question='How could I use geometry to optimise a badminton court position?';
 assert(ideaInput(s,'question',question));
 assert(ideaInput(s,'clarity','4'));
 assert(ideaInput(s,'quickStart','3'));
 const saved=action(s,'save');
 assert.equal(ideaLabPlanningContext(s),null,'A shortlisted question is not yet selected');
 assert.equal(s.planning.routeExplorer.selectedRoute,'');
 assert.deepEqual(s.planning.mathSelected,[]);
 assert(!s.ideaExplorer.shortlist[0].question.includes('Where should'));
 action(s,'use',{id:saved.id});
 assert.equal(s.planning.current,'N01');
 assert.equal(s.planning.fields.aim,question);
 return s;
}
function selectedEvidence({contextual=false}={}){
 const s=start();
 action(s,'map-mode',{mode:'data'});
 action(s,'map-root',{root:'record'});
 action(s,'map-access',{branch:'survey'});
 action(s,'map-route',{routeId:'categorical'});
 const id=contextual?'math-school-event':'evidence-record-survey-categorical';
 action(s,'explore',{seed:id,map:'true'});
 assert(ideaInput(s,'question','How could I compare event preferences using approved responses?'));
 assert(ideaInput(s,'clarity','3'));
 assert(ideaInput(s,'quickStart','3'));
 const saved=action(s,'save');
 action(s,'use',{id:saved.id});
 return s;
}
const cue=(s,placement)=>renderIdeaLabPlanningCue(s,placement,view);
const writing=s=>renderIdeaLabWritingCue(s,{...view,reduced:s.ui.adviceMode==='reduced'});
function planningHtml(s){
 const ctx={getState:()=>s,e:esc,icon:()=>'<svg class="icon"></svg>',
  button:(title,action)=>'<button data-action="'+esc(action)+'">'+esc(title)+'</button>',
  field:(path,label)=>'<label>'+esc(label)+'</label>',
  choose:(path,items)=>items.map(x=>'<label>'+esc(x.title)+'</label>').join(''),
  numberPick:()=>'',note:x=>x,
  summary:(label,val)=>'<p>'+esc(label)+' '+esc(val)+'</p>',
  helpButton:()=>'',helpBox:()=>'',tabletNav:()=>''};
 return createPlanningViews(ctx).viewPlanning();
}
test('Only a student-selected mathematical Idea Lab aim supplies the handover',()=>{
 const s=selectedSport();
 const ctx=ideaLabPlanningContext(s);
 assert.equal(ctx.status,'current');
 assert.equal(ctx.routeId,'optimisation');
 assert.equal(ctx.lensLabel,'Find the best');
 assert.equal(ctx.seedId,'math-sport-optimise');
 assert.equal(ctx.sourceLabel,'Sport & performance');
 assert(ctx.first.includes('Sketch')||ctx.first.includes('derive'));
 assert(ctx.evidence.length>30);
 assert.equal(ctx.hasPlannedRoute,false);
 assert.equal(s.planning.routeExplorer.selectedRoute,'');
 assert.deepEqual(s.planning.mathSelected,[]);
 assert.equal(s.teacher.pendingApproval,false);
 assert.equal(s.entries.length,0);
 const before=JSON.stringify(s);
 const rendered=cue(s,'maths');
 assert(rendered.includes('FROM YOUR SELECTED IDEA LAB POSSIBILITY'));
 assert(rendered.includes('data-action="math-open-route" data-route-id="optimisation"'));
 assert(rendered.includes('does not select it'));
 assert(rendered.includes('Evidence and limitations to check (optional)'));
 assert.equal(JSON.stringify(s),before,'Rendering guidance must never write planning fields');
 const first=cue(s,'first');
 assert(first.includes('EARLIER MATHEMATICAL FIRST MOVE'));
 assert(!first.includes('data-action="plan-toggle-math"'));
 assert(cue(s,'review').includes('No investigative route has been saved'));
 assert(writing(s).includes('AN EARLIER POSSIBILITY'));
 assert.equal(selectedInvestigativeRoute(s),null);
 assert.equal(writingGuidanceForFirstMaths(s).origin,'general');
});
test('Explicit Planning routes and edited aims take priority over old Idea Lab sparks',()=>{
 const s=selectedSport();
 chooseMathRoute(s,'optimisation');
 assert.equal(ideaLabPlanningContext(s).status,'current');
 assert(ideaLabPlanningContext(s).hasPlannedRoute);
 assert(cue(s,'maths').includes('explicitly saved'));
 assert.equal(cue(s,'first'),'');
 assert.equal(writing(s),'');
 chooseMathRoute(s,'growth');
 assert.equal(ideaLabPlanningContext(s).status,'superseded');
 assert(cue(s,'maths').includes('explicit choice is preserved until you change it'));
 assert.equal(cue(s,'evidence'),'');
 assert.equal(cue(s,'first'),'');
 assert.equal(writing(s),'');
 assert.equal(s.planning.routeExplorer.selectedRoute,'growth');
 chooseMathRoute(s,'');
 applyPlanningField(s,'aim','How could I compare two different growth models?');
 assert.equal(ideaLabPlanningContext(s).status,'outdated');
 assert(cue(s,'maths').includes('revised your investigation aim'));
 assert.equal(cue(s,'first'),'');
 assert.equal(cue(s,'review'),'');
 assert.equal(writing(s),'');
 assert.equal(s.planning.mathSelected.length,0);
});
test('Data-first provenance survives saving, editing and full project JSON normalization',()=>{
 for(const contextual of [false,true]){
  const s=selectedEvidence({contextual});
  const ctx=ideaLabPlanningContext(s);
  assert.equal(ctx.status,'current');
  assert.equal(ctx.routeId,'categorical');
  assert.equal(ctx.evidenceEntryId,'record.survey');
  assert.equal(ctx.evidenceKind,'primary');
  assert(ctx.sourceLabel.includes('count or ask'));
  assert(ctx.sourceLabel.includes('Ask an appropriate question'));
  assert(ctx.needsPermission);
  const chosen=s.ideaExplorer.shortlist.find(x=>x.id===s.ideaExplorer.selectedId);
  assert.equal(chosen.mapOrigin?.mode,'data');
  assert.equal(chosen.mapOrigin?.root,'record');
  assert.equal(chosen.mapOrigin?.dataBranch,'survey');
  assert.equal(chosen.mapOrigin?.mathRoute,'categorical');
  assert(cue(s,'evidence').includes('school permission'));
  assert(cue(s,'evidence').includes('informed consent'));
  assert(!cue(s,'evidence').includes('already collected'));
  const restored=normalizeProjectState(clone(s));
  assert.equal(ideaLabPlanningContext(restored).evidenceEntryId,'record.survey');
  assert.deepEqual(restored.ideaExplorer.shortlist,s.ideaExplorer.shortlist);
  assert.deepEqual(restored.planning.mathSelected,[]);
  restored.planning.current='N03S';
  assert.equal(cue(restored,'evidence'),'','Primary collection reminder should not be repeated on the secondary source form');
 }
});
test('Reduced advice hides optional detail but preserves safety and route access',()=>{
 const s=selectedSport();
 s.ui.adviceMode='reduced';
 const html=cue(s,'maths');
 assert(html.includes('data-action="math-open-route"'));
 assert(html.includes('not</strong> a selected technique'));
 assert(!html.includes('One first calculation'));
 assert.equal(cue(s,'first'),'');
 assert.equal(cue(s,'review'),'');
 assert.equal(writing(s),'');
 assert.equal(cue(s,'evidence'),'');
 const survey=selectedEvidence({contextual:true});
 survey.ui.adviceMode='reduced';
 assert(cue(survey,'evidence').includes('school permission'));
 assert(!cue(survey,'evidence').includes('Earlier evidence possibility'));
 assert(!cue(survey,'maths').includes('One first calculation'));
});
test('Course preview is never an automatic AA HL technique recommendation',()=>{
 const s=selectedSport();
 applyPlanningField(s,'course','AA HL');
 const ctx=ideaLabPlanningContext(s);
 assert(ctx.coursePreview.teacherReview);
 assert.equal(ctx.coursePreview.techniqueExamples.length,0);
 assert(cue(s,'maths').includes('Teacher check recommended'));
 assert.equal(s.planning.routeExplorer.selectedRoute,'');
 assert.deepEqual(s.planning.mathSelected,[]);
});
test('Older activity-labelled and own-authored ideas do not gain inferred routes',()=>{
 const s=createProjectState();
 const oldQuestion='How could I estimate the area of a particular leaf?';
 s.ideaExplorer=normalizeIdeaState({
  map:{mode:'interests',root:'world',topic:'nature',subtopic:'Leaves'},
  shortlist:[{id:'idea-1',seedId:'leaf-outline',question:oldQuestion,
   clarity:4,quickStart:4,fromMap:true}],
  selectedId:'idea-1'
 });
 s.planning.fields.aim=oldQuestion;s.project.aim=oldQuestion;
 assert.equal(ideaLabPlanningContext(s),null);
 assert.equal(cue(s,'maths'),'');
 const own=selectedSport();
 const d=own.ideaExplorer.shortlist[0];
 d.seedId='own';d.fromMap=false;
 assert.equal(ideaLabPlanningContext(own),null);
 const tampered=cleanDraft({seedId:'math-sport-optimise',fromMap:true,question:'A question',
  mapOrigin:{mode:'data',root:'record',dataBranch:'survey',mathRoute:'optimisation'}});
 assert(!Object.hasOwn(tampered,'mapOrigin'),'Invalid provenance must not survive import');
});
test('Planning screens and first-writing introduction integrate without writing answers',()=>{
 const s=selectedSport();
 const before=JSON.stringify([s.planning.fields,s.planning.mathSelected,s.planning.routeExplorer,s.entries]);
 const moments=[
  ['N02M','maths'],['N04S','maths'],['N04T','maths'],
  ['N03','evidence'],['N03P','evidence'],['N03S','evidence'],['N03D','evidence'],
  ['N01P','first'],['N06','review'],['N07','first']
 ];
 for(const [node,placement] of moments){
  s.planning.current=node;
  const html=planningHtml(s);
  assert(html.includes('data-idea-lab-handoff="'+placement+'"'),node);
  assert(!html.includes('undefined'),node);
 }
 assert.equal(JSON.stringify([s.planning.fields,s.planning.mathSelected,s.planning.routeExplorer,s.entries]),before);
 const views=readFileSync(new URL('../src/completing/views.js',import.meta.url),'utf8');
 assert(views.includes('renderIdeaLabWritingCue(s,{e,icon,reduced:isAdviceReduced(s)})'));
 assert(!views.includes('selectedInvestigativeRoute=ideaLabPlanningContext'));
 const css=readFileSync(new URL('../data/investigative-routes.css',import.meta.url),'utf8');
 assert(css.includes('.idea-lab-handoff-link:focus-visible'));
 assert(css.includes('@media(max-width:570px)'));
});
