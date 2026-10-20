import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createProjectState,normalizeProjectState} from '../src/core/project-state.js';
import {createCheckingViews} from '../src/checking/views.js';
import {CHECKING_CRITERIA,CHECKING_DETAILS,reviewCounts} from '../src/checking/checklist.js';
import {setReviewStatus,reviewChecksFor} from '../src/completing/review.js';
import {conformanceAction} from '../src/completing/conformance-actions.js';
import {JOURNEY_GROUPS,groupStatus,groupTarget,currentGroup,checkingMilestones} from '../src/ui/journey.js';
import {discoveryTrail,chapterRibbon} from '../src/ui/living-journey.js';
import {journeyRail} from '../src/ui/journey-views.js';
import {icon,escapeHtml as e} from '../src/ui/primitives.js';
function render(s){
 const view=createCheckingViews({
  getState:()=>s,e,icon,
  field:(path,label)=>'<label data-field="'+e(path)+'">'+e(label)+'</label>',
  button:(label,action)=>'<button data-action="'+action+'">'+e(label)+'</button>',
  sheetTitle:(_label,title)=>'<h1>'+e(title)+'</h1>',tabletNav:()=>''
 });
 return view.viewChecking();
}
test('new Checking phase is a separate navigable chapter, not an extra mathematical step',()=>{
 const s=createProjectState(),before=JSON.stringify(s);
 assert.deepEqual(JOURNEY_GROUPS.map(x=>x.id),['plan','setup','explore','finish','check']);
 assert.deepEqual(JOURNEY_GROUPS[3].stages,['C60']);
 assert.deepEqual(JOURNEY_GROUPS[4].stages,['C70','C80','C90']);
 assert.equal(groupTarget(s,JOURNEY_GROUPS[4]),'checking');
 s.route='checking';assert.equal(currentGroup(s).id,'check');
 for(const html of [journeyRail(s),chapterRibbon(s),discoveryTrail(s)])
  assert(html.includes('data-target="checking"'));
 assert.equal(groupStatus(s,JOURNEY_GROUPS[4]),'not-started');
 assert.equal(JSON.stringify(s).replace('"route":"checking"','"route":"home"'),before);
});
test('new review page renders A-E bubbles with the correct maxima and detailed sourced guidance',()=>{
 const s=createProjectState(),html=render(s);
 assert.equal(html.match(/data-action="checking-mode"/g).length,3);
 assert(html.includes('data-action="checking-rubric"'));
 for(const [id,meta] of Object.entries(CHECKING_CRITERIA)){
  assert(html.includes('data-criterion="'+id+'"'),id);
  assert(html.includes(meta.name),meta.name);
  assert(html.includes('Up to '+meta.max+' marks'));
  assert.deepEqual(CHECKING_DETAILS['D0'+(id.charCodeAt(0)-65+2)].criteria,[id]);
 }
 for(const id of ['D02','D03','D04','D05','D06']){
  assert(html.includes('data-checking-item="'+id+'"'));
  assert(html.includes('data-field="completion.review.records.draft-'+id+'.location"'));
 }
 assert(html.includes('data-checking-item="D09"'));
 assert(html.includes('data-checking-item="D19"'));
 assert(html.includes('data-action="conformance-review-repair"'));
 assert(!html.includes('IB grade prediction'));
});
test('checks use persistent draft and final evidence, never self-mark automatically',()=>{
 const s=createProjectState(),before=JSON.stringify(s);
 render(s);
 assert.equal(JSON.stringify(s),before);
 assert.equal(setReviewStatus(s,'draft','D02','checked').ok,false,'must give evidence');
 s.completion.review.records['draft-D02'].location='p. 3, connection to model';
 assert(setReviewStatus(s,'draft','D02','checked').ok);
 let counts=reviewCounts(s,'draft',reviewChecksFor(s,'draft'));
 assert.equal(counts.checked,1);assert.equal(counts.done,1);
 assert.equal(setReviewStatus(s,'draft','D03','not-applicable').ok,false,'N/A requires reason');
 s.completion.review.records['draft-D03'].note='I did not use a type of diagram';
 assert(setReviewStatus(s,'draft','D03','not-applicable').ok);
 counts=reviewCounts(s,'draft',reviewChecksFor(s,'draft'));
 assert.equal(counts.checked,1);assert.equal(counts.done,2);
 assert.equal(checkingMilestones(s)[0].status,'working');
 assert(render(s).includes('2 of '+counts.total+' checks resolved'));
 s.ui.checkingMode='final';const final=render(s);
 assert(final.includes('completion.review.records.final-D02.location'));
 assert(final.includes('data-checking-item="D16"'));
 assert(!final.includes('2 of '+counts.total+' checks resolved'),'draft progress cannot be copied as final');
 const saved=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.equal(saved.completion.review.records['draft-D02'].status,'checked');
 assert.equal(saved.ui.checkingMode,'final');
 assert.equal(saved.completion.review.records['final-D02'].status,'unchecked');
});
test('feedback step records real advice and status in the pre-existing shared records',()=>{
 const s=createProjectState();
 s.ui.checkingMode='feedback';
 let html=render(s);
 for(const path of ['feedbackNote','feedbackAction','feedbackKind','feedbackLocation'])
  assert(html.includes('data-field="completion.review.'+path+'"'));
 s.completion.review.feedbackItems.push({id:'feedback-1',kind:'verbal',note:'Recheck the domain',action:'Limit the model to measured values',location:'page 6',entryId:'',node:'C40',status:'recorded'});
 html=render(s);
 assert(html.includes('Recheck the domain'));
 assert(html.includes('data-action="conformance-feedback-progress"'));
 assert(html.includes('data-status="implemented"'));
 assert.equal(groupStatus(s,JOURNEY_GROUPS[4]),'working');
});
test('repair navigation remembers Checking and returns to the same checklist',()=>{
 const s=createProjectState();s.route='checking';
 const rec=s.completion.review.records['draft-D02'];
 rec.action='Make the jump between stages clear';
 const repair=conformanceAction(s,'conformance-review-repair',{mode:'draft',id:'D02'});
 assert(repair.ok);
 assert.equal(s.route,'completing');
 assert.equal(s.completion.review.returnTo,'checking');
 const back=conformanceAction(s,'conformance-review-return');
 assert(back.ok);assert.equal(s.route,'checking');assert.equal(s.completion.review.returnTo,'');
});
test('review source guidance covers all shared D01-D21 records with explicit criterion mapping',()=>{
 const all=Object.keys(CHECKING_DETAILS);
 assert.equal(all.length,21);
 for(let n=1;n<=21;n++){
  const id='D'+String(n).padStart(2,'0');
  assert(CHECKING_DETAILS[id],id);
  assert(CHECKING_DETAILS[id].lookFor.length>=2,id);
  for(const letter of CHECKING_DETAILS[id].criteria)assert(CHECKING_CRITERIA[letter],id+letter);
 }
 assert.deepEqual(CHECKING_DETAILS.D16.criteria,['A','B','C','D','E']);
 assert.deepEqual(CHECKING_DETAILS.D03.criteria,['B']);
 assert.deepEqual(CHECKING_DETAILS.D07.criteria,['A','B']);
 const css=readFileSync(new URL('../data/checking.css',import.meta.url),'utf8');
 assert(css.includes('@media(max-width:690px)'));
 assert(css.includes('.checking-criterion-bubble:focus-visible'));
});
