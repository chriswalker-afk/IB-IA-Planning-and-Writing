import test from 'node:test';
import assert from 'node:assert/strict';
import {createProjectState,normalizeProjectState} from '../src/core/project-state.js';
import {applyPlanningField} from '../src/planning/engine.js';
import {assessmentFramework,assessmentBanner,REVISED_2029_CRITERIA} from '../src/essentials/assessment-cohorts.js';
import {CRITERION_SPOTS} from '../src/essentials/criteria-badges.js';
import {contextualBadgeGuidance} from '../src/essentials/criteria-badge-guidance.js';
import {formatView,rubricView,submissionView,criteriaPanel,essentialsNudge,essentialsSourceNote} from '../src/essentials/views.js';
import {createCheckingViews} from '../src/checking/views.js';
import {reviewChecksFor} from '../src/completing/review.js';
import {escapeHtml as e,icon} from '../src/ui/primitives.js';
function checkView(s){
 const v=createCheckingViews({getState:()=>s,e,icon,field:(key,label)=>'<div data-field="'+e(key)+'">'+e(label)+'</div>',
  button:(label,action)=>'<button data-action="'+e(action)+'">'+e(label)+'</button>',
  tabletNav:()=>'',
  sheetTitle:(_short,title,description)=>'<h1>'+e(title)+'</h1><p>'+e(description)+'</p>'});
 return v.viewChecking();
}
test('existing projects remain on current A-E criteria unless explicitly moved',()=>{
 const current=createProjectState(),original=JSON.stringify(current);
 assert.equal(current.planning.fields.assessmentFramework,'legacy');
 assert.equal(assessmentFramework(current),'legacy');
 assert.equal(assessmentBanner(current),'');
 assert.equal(JSON.stringify(current),original);
 assert(rubricView(current,{criterion:'E',level:'SL'}).includes('Criterion E'));
 assert(submissionView(current,{mode:'draft'}).includes('My evidence for A–E'));
 assert(checkView(current).includes('data-criterion-badge="checking:A"'));
 const legacy=JSON.parse(JSON.stringify(current));delete legacy.planning.fields.assessmentFramework;
 assert.equal(assessmentFramework(normalizeProjectState(legacy)),'legacy');
});
test('2029 selection persists through save/restore, safely returns to legacy, and retains review work',()=>{
 const state=createProjectState();
 state.completion.review.records['draft-D02'].location='p. 4: a genuine logical connection';
 state.entries=[{id:'work1',phase:'first',status:'completed',result:'A real result',kind:'theory'}];
 assert(applyPlanningField(state,'assessmentFramework','revised2029'));
 assert.equal(assessmentFramework(state),'revised2029');
 const saved=normalizeProjectState(JSON.parse(JSON.stringify(state)));
 assert.equal(assessmentFramework(saved),'revised2029');
 assert.equal(saved.completion.review.records['draft-D02'].location,'p. 4: a genuine logical connection');
 assert.equal(saved.entries[0].result,'A real result');
 assert(applyPlanningField(saved,'assessmentFramework','legacy'));
 assert.equal(assessmentFramework(saved),'legacy');
 assert.equal(saved.completion.review.records['draft-D02'].location,'p. 4: a genuine logical connection');
 assert.equal(saved.planning.fields.assessmentFramework,'legacy');
});
test('2029 rubric overview reports IB-published four criteria without inventing level descriptors',()=>{
 const s=createProjectState();applyPlanningField(s,'assessmentFramework','revised2029');
 assert.deepEqual(REVISED_2029_CRITERIA.map(x=>x.max),[4,6,4,6]);
 assert.deepEqual(REVISED_2029_CRITERIA.map(x=>x.name),
  ['Problem specification','Abstraction','Computation','Interpretation']);
 const summary=rubricView(s,{criterion:'E',level:'HL'});
 for(const criterion of REVISED_2029_CRITERIA){
  assert(summary.includes('data-revised-criterion="'+criterion.id+'"'));
  for(const strand of criterion.strands)assert(summary.includes(strand));
 }
 assert(summary.includes('Official IB Mathematics AA update'));
 assert(summary.includes('full achievement-level descriptors')||summary.includes('full achievement-level descriptors'.replace('achievement-level','achievement-level'))||summary.includes('full achievement-level descriptors'));
 assert(!summary.includes('data-rubric-criterion="E"'));
 assert(!summary.includes('ess-rubric-table'));
 assert(!summary.includes('Achievement descriptors · Criterion E'));
 assert(!summary.includes('Your recorded course uses the HL Criterion E reference'));
 const prior=submissionView(s,{mode:'draft'});
 assert(prior.includes('older A–E evidence records')||prior.includes('existing A–E evidence records'));
 assert(!prior.includes('data-ess-review'));
 assert(!prior.includes('data-evidence-criterion="E"'));
 const banner=assessmentBanner(s,e);
 assert(banner.includes('data-assessment-notice="revised2029"'));
 assert(banner.includes('data-essentials-tab="rubric"'));
 const glance=(()=>{s.route='planning';s.planning.current='N00';return essentialsNudge(s);})();
 assert(glance.includes('four revised criteria'));
 assert(!glance.includes('20 marks across five criteria'));
 assert(essentialsSourceNote(s).includes('first assessment 2029'));
 assert(formatView(s).includes('current mathematics course guide'));
 assert(criteriaPanel(s).includes('previous A–E criteria bubbles are hidden'));
});
test('2029 Checking hides incompatible A-E scoring checks without losing document review',()=>{
 const s=createProjectState();applyPlanningField(s,'assessmentFramework','revised2029');
 s.route='checking';s.ui.checkingMode='draft';
 s.completion.review.records['draft-D02'].location='Existing older entry';
 let html=checkView(s);
 assert(html.includes('data-checking-revised-overview'));
 assert(html.includes('A · Problem specification'));
 assert(html.includes('B · Abstraction'));
 assert(html.includes('C · Computation'));
 assert(html.includes('D · Interpretation'));
 assert(!html.includes('data-criterion-badge="checking:A"'));
 assert(!html.includes('data-checking-item="D02"'));
 assert(!html.includes('data-checking-item="D06"'));
 assert(!html.includes('data-checking-item="D16"'));
 assert(!html.includes('Can I point to genuine evidence for all five criteria?'));
 assert(html.includes('data-checking-item="D09"'));
 assert(html.includes('DOCUMENT CHECK'));
 assert(!html.includes('Read your IA through five lenses'));
 assert(!html.includes('Up to 6 marks'));
 assert.equal(s.completion.review.records['draft-D02'].location,'Existing older entry');
 s.ui.checkingMode='final';
 html=checkView(s);assert(html.includes('data-checking-revised-overview'));
 assert(!html.includes('data-checking-item="D03"'));
 assert(reviewChecksFor(s,'final').some(x=>x.id==='D03'),'underlying legacy review records are preserved');
});
test('Checking opens contextual pop-in advice using the same system as Planning',()=>{
 const s=createProjectState();s.route='checking';s.ui.checkingMode='draft';
 s.completion.review.records['draft-D04'].location='p. 8, own counterexample';
 s.completion.review.records['draft-D04'].note='I corrected the original conjecture';
 const before=JSON.stringify(s);
 for(const id of ['A','B','C','D','E']){
  const spot=CRITERION_SPOTS['checking:'+id];
  assert(spot?.criterion===id);
  assert(spot.why.length>40);
  const response=contextualBadgeGuidance(s,'checking:'+id,spot);
  assert(response.why.includes('checklist'));
  assert(response.stage.includes('draft'));
  assert.equal(response.real,false);
 }
 const C=contextualBadgeGuidance(s,'checking:C',CRITERION_SPOTS['checking:C']);
 assert(C.details.some(x=>x.text==='p. 8, own counterexample'));
 assert(C.details.some(x=>x.text==='I corrected the original conjecture'));
 s.ui.checkingMode='final';
 const final=contextualBadgeGuidance(s,'checking:C',CRITERION_SPOTS['checking:C']);
 assert(!final.details.some(x=>x.text.includes('counterexample')));
 assert.equal(s.completion.review.records['draft-D04'].note,'I corrected the original conjecture');
 assert.equal(JSON.stringify({...s,ui:{...s.ui,checkingMode:'draft'}}),before);
});
