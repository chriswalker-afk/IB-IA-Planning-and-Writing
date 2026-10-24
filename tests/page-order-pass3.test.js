import test from 'node:test';
import assert from 'node:assert/strict';
import {createProjectState,normalizeProjectState} from '../src/core/project-state.js';
import {createCheckingViews} from '../src/checking/views.js';
import {reviewChecksFor,setReviewStatus} from '../src/completing/review.js';
import {resourceDrawer} from '../src/resources/views.js';
import {newResourceSession} from '../src/resources/state.js';
import {icon,escapeHtml as e} from '../src/ui/primitives.js';
const view=s=>createCheckingViews({getState:()=>s,e,icon,field:(p,l)=>'<label data-field="'+e(p)+'">'+e(l)+'</label>',button:(l,a)=>'<button data-action="'+a+'">'+e(l)+'</button>',sheetTitle:(_a,t)=>'<h1>'+e(t)+'</h1>',tabletNav:()=>''}).viewChecking();
function inOrder(html,fragments){let last=-1;for(const f of fragments){const n=html.indexOf(f);assert(n>last,'Missing or out of order: '+f);last=n;}}
test('three checking modes: instruction, evidence and status, without changing state',()=>{
 for(const mode of ['draft','feedback','final']){
  const s=createProjectState();s.ui.checkingMode=mode;
  const before=JSON.stringify(s),html=view(s),id=reviewChecksFor(s,mode)[0].id;
  const p=html.indexOf('data-checking-item="'+id+'"'),card=html.slice(p,html.indexOf('</article>',p));
  inOrder(card,['What to check, record and confirm','1 · What to check','2 · Record what you verified','completion.review.records.'+mode+'-'+id+'.location','3 · Confirm your review status','data-action="conformance-review-status"']);
  assert.equal(JSON.stringify(s),before);
 }
});
test('MLA and authorship evidence precede corresponding confirmations',()=>{
 const s=createProjectState();
 for(const [mode,id,marker] of [['draft','D09','data-checking-mla-audit'],['final','D12','data-checking-authenticity-audit']]){
  s.ui.checkingMode=mode;const html=view(s),i=html.indexOf('data-checking-item="'+id+'"'),card=html.slice(i,html.indexOf('</article>',i));
  inOrder(card,[marker,'2 · Record what you verified','3 · Confirm your review status']);
  if(id==='D12')assert(!card.includes('data-status="not-applicable"'));
 }
 assert(!setReviewStatus(s,'draft','D02','checked').ok);
 s.completion.review.records['draft-D02'].location='Page 4';
 assert(setReviewStatus(s,'draft','D02','checked').ok);
 assert.equal(normalizeProjectState(JSON.parse(JSON.stringify(s))).completion.review.records['final-D02'].status,'unchecked');
});
test('feedback first; checklist second; saved revision verification third',()=>{
 const s=createProjectState();s.ui.checkingMode='feedback';const old=JSON.stringify(s),html=view(s);
 inOrder(html,['class="checking-feedback-form"','data-action="conformance-feedback-add"','class="checking-document-section"','class="checking-feedback checking-feedback-revisions"']);
 assert.equal(JSON.stringify(s),old);
});
test('resource search and contextual guides take priority over optional creators',()=>{
 const s=createProjectState();s.route='completing';s.completion.current='C40';
 s.entries=[{id:'a',methodId:'pmcc',phase:'substantial',status:'planned',result:'',knowledge:'syllabus',sourceRefs:[],accuracyRefs:[]}];s.completion.activeEntryIndex=0;s.completion.nextFromEntryId='a';
 const before=JSON.stringify(s),html=resourceDrawer(s,newResourceSession());
 inOrder(html,['class="resource-current"','class="resource-filter-form"','id="resource-search"','class="resource-quick-tools"','id="resource-results"']);
 assert(html.includes('data-resource-id="mla-citations"'));
 assert(html.includes('class="resource-creators resource-creators-compact"'));
 assert(html.includes('data-resource-creator="graph"'));
 assert.equal(JSON.stringify(s),before);
});
