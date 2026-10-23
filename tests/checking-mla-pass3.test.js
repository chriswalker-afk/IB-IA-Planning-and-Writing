import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createProjectState,normalizeProjectState} from '../src/core/project-state.js';
import {createCheckingViews} from '../src/checking/views.js';
import {citationAuditPointers,renderCitationAudit} from '../src/checking/reference-audit.js';
import {CHECKING_DETAILS,reviewCounts} from '../src/checking/checklist.js';
import {setReviewStatus,reviewChecksFor,reviewEditChanged} from '../src/completing/review.js';
import {resourceAction} from '../src/resources/actions.js';
import {newResourceSession} from '../src/resources/state.js';
import {icon,escapeHtml as e} from '../src/ui/primitives.js';
const render=s=>createCheckingViews({
 getState:()=>s,e,icon,
 field:(path,label)=>'<label data-field="'+e(path)+'">'+e(label)+'</label>',
 button:(label,action)=>'<button data-action="'+action+'">'+e(label)+'</button>',
 sheetTitle:(id,title)=>'<h1>'+e(title)+'</h1>',
 tabletNav:()=>''
}).viewChecking();
const between=(html,id)=>{const start=html.indexOf('data-checking-item="'+id+'"');assert(start>=0);const end=html.indexOf('</article>',start);assert(end>=start);return html.slice(start,end);};
const mark=(s,mode,id,note)=>{s.completion.review.records[mode+'-'+id].note=note;return setReviewStatus(s,mode,id,'checked');};

test('Pass 3: draft and final show one MLA spotlight linked to D09 and the existing tutorial',()=>{
 const s=createProjectState(),before=JSON.stringify(s);
 for(const mode of ['draft','final']){
  s.ui.checkingMode=mode;
  const html=render(s);
  assert.equal((html.match(/data-checking-mla-spotlight/g)||[]).length,1);
  assert(html.includes('href="#checking-audit-'+mode+'"'));
  assert(html.includes('id="checking-audit-'+mode+'"'));
  assert(html.includes('data-action="resource-open" data-resource-id="mla-citations"'));
  assert(html.includes('data-checking-item="D09"'));
  assert(html.includes('data-checking-item="D12"'),'authorship checked both at draft and final');
  assert.equal((html.match(/data-checking-mla-audit/g)||[]).length,1);
  assert.equal((html.match(/data-checking-authenticity-audit/g)||[]).length,1);
  assert.equal(between(html,'D09').includes('data-criterion-badge'),false);
  assert.equal(between(html,'D12').includes('data-criterion-badge'),false);
  assert.equal(between(html,'D12').includes('data-status="not-applicable"'),false);
 }
 s.ui.checkingMode='feedback';
 const feedback=render(s);
 assert(!feedback.includes('data-checking-mla-spotlight'));
 assert(!feedback.includes('data-checking-item="D09"'));
 assert(!feedback.includes('data-checking-item="D12"'));
 s.ui.checkingMode='draft';
 assert.equal(JSON.stringify(s),before,'rendering may not modify the actual student project');
});

test('Pass 3: MLA audit is a four-step two-way cross-check, not a citation generator',()=>{
 const s=createProjectState(),card=between(render(s),'D09');
 for(const text of ['Audit each source in your actual IA','Text → Works Cited','Works Cited → text','Recheck after edits','Scan the body','Google Docs','(World Bank)','the original material']){
  assert(card.includes(text),text);
 }
 assert(card.includes('What did I verify in both directions?'));
 assert(card.includes('data-field="completion.review.records.draft-D09.note"'));
 assert(card.includes('data-action="conformance-review-repair"'));
 assert(!card.includes('data-action="checking-generate-bibliography"'));
 assert(!card.includes('<input type="checkbox"'));
 const res=resourceAction(s,newResourceSession(),'resource-open',{resourceId:'mla-citations'});
 assert(res.ok&&res.open);
});

test('Pass 3: user must document the two-way audit instead of ticking D09 with only a page number',()=>{
 const s=createProjectState();
 const a=s.completion.review.records['draft-D09'];
 a.location='Body pp. 3–8 and Works Cited';
 assert.equal(setReviewStatus(s,'draft','D09','checked').ok,false);
 assert.equal(a.status,'unchecked');
 assert.match(setReviewStatus(s,'draft','D09','checked').error,/both directions|two-way/i);
 a.note='I traced each borrowed dataset from its in-text citation to Works Cited, checked original URLs, and removed one uncited saved source.';
 assert(setReviewStatus(s,'draft','D09','checked').ok);
 assert.equal(a.status,'checked');
 assert.equal(s.completion.review.records['final-D09'].status,'unchecked');
 const old=a.note;a.note='I changed a data source; need to recheck the references';
 reviewEditChanged(s,'completion.review.records.draft-D09.note',old,a.note);
 assert.equal(a.status,'needs-work');
 assert.equal(a.checkedAt,'');
 assert.equal(setReviewStatus(s,'final','D09','checked').ok,false);
 s.completion.review.records['final-D09'].note='I checked the final PDF and rebuilt the matching Works Cited list in Google Docs.';
 assert(setReviewStatus(s,'final','D09','checked').ok);
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.equal(restored.completion.review.records['draft-D09'].status,'needs-work');
 assert.equal(restored.completion.review.records['final-D09'].status,'checked');
});

test('Pass 3: source-free work may explain D09 not relevant, but D12 authenticity is universal',()=>{
 const s=createProjectState();
 assert.equal(setReviewStatus(s,'draft','D09','not-applicable').ok,false);
 s.completion.review.records['draft-D09'].note='My self-contained exploration uses no external data, quotes or independently borrowed methods.';
 assert(setReviewStatus(s,'draft','D09','not-applicable').ok);
 assert.equal(setReviewStatus(s,'draft','D12','not-applicable').ok,false);
 assert.equal(setReviewStatus(s,'final','D12','not-applicable').ok,false);
 const own=s.completion.review.records['draft-D12'];
 own.location='The full manuscript';
 assert.equal(setReviewStatus(s,'draft','D12','checked').ok,false);
 own.note='I reread each mathematical explanation; any permitted assistance and source material is acknowledged.';
 assert(setReviewStatus(s,'draft','D12','checked').ok);
 assert.equal(s.completion.review.records['final-D12'].status,'unchecked');
 s.completion.review.records['final-D12'].note='I reviewed authorship, diagrams and permitted support in the final version.';
 assert(setReviewStatus(s,'final','D12','checked').ok);
 assert.equal(reviewCounts(s,'final',reviewChecksFor(s,'final')).checked,1+Number(s.completion.review.records['final-D09'].status==='checked'));
});

test('Pass 3: source reminders come from real saved project pointers without assuming any citation is verified',()=>{
 const s=createProjectState();
 const empty=citationAuditPointers(s);
 assert.deepEqual(empty,[]);
 assert(renderCitationAudit(s,icon,e).includes('does <strong>not</strong> mean your actual IA contains nothing to cite.'));
 s.completion.sourceRecords=[
  {id:'x1',fields:{actualSourceType:'secondary',actualSource:'World Bank population data',sourceCitation:'World Bank Open Data URL'}},
  {id:'x2',fields:{actualSourceType:'primary',actualSource:'My own measurements',sourceCitation:''}}
 ];
 s.entries=[
  {id:'e1',phase:'first',title:'Examine a graph',status:'completed',sourceRefs:['x1'],graphFigureId:'g1'},
  {id:'e2',phase:'substantial',title:'Read about <script>alert(1)</script>',status:'completed',knowledge:'outside',researchSource:'Textbook by a researcher'},
  {id:'e3',phase:'substantial',title:'Planned uncompleted technique',status:'planned',knowledge:'outside',researchSource:'Not actually used'}
 ];
 s.graphStudio.figures.push({id:'g1',entryId:'e1',draft:{title:'Chart of published values',sourceKind:'secondary',sourceText:'World Bank original table'}});
 const pointers=citationAuditPointers(s);
 assert(pointers.some(x=>x.kind==='Published source'&&x.name.includes('World Bank')));
 assert(pointers.some(x=>x.kind==='Researched mathematics'));
 assert(pointers.some(x=>x.kind==='Graph'));
 assert(!pointers.some(x=>x.name.includes('My own measurements')));
 assert(!pointers.some(x=>x.name.includes('Planned uncompleted')));
 const result=renderCitationAudit(s,icon,e);
 assert(result.includes('Notes you may want to trace'));
 assert(result.includes('World Bank original table'));
 assert(!result.includes('<script>'));
 assert(result.includes('&lt;script&gt;'));
 assert(result.includes('These were saved in Pathfinder'));
 assert(result.includes('they are <em>not</em> verified citations'));
});

test('Pass 3: no 2029 phantom A-E marks and the same integrity review remains available',()=>{
 const s=createProjectState();
 s.planning.fields.assessmentFramework='revised2029';
 s.ui.checkingMode='final';
 const html=render(s);
 const d09=between(html,'D09'),d12=between(html,'D12');
 assert(html.includes('Updated IA criteria · first assessment 2029 onwards'));
 assert(d09.includes('DOCUMENT CHECK'));
 assert(d12.includes('DOCUMENT CHECK'));
 assert(!d09.includes('data-criterion-badge'));
 assert(!d12.includes('data-criterion-badge'));
 assert(d09.includes('data-checking-mla-audit'));
 assert(d12.includes('data-checking-authenticity-audit'));
 assert.deepEqual(CHECKING_DETAILS.D09.criteria,[]);
 assert.deepEqual(CHECKING_DETAILS.D12.criteria,[]);
});

test('Pass 3: integrity screens work in Reduce advice without removing the core citation check',()=>{
 const s=createProjectState();s.ui.adviceMode='reduced';s.ui.checkingMode='final';
 const html=render(s);
 assert(html.includes('data-checking-mla-spotlight'));
 assert(html.includes('data-checking-mla-audit'));
 assert(html.includes('data-checking-authenticity-audit'));
 assert(html.includes('data-resource-id="mla-citations"'));
 const css=readFileSync(new URL('../data/checking.css',import.meta.url),'utf8');
 assert(css.includes('.checking-mla-spotlight'));
 assert(css.includes('.checking-mla-audit'));
 assert(css.includes('@media(max-width:480px)'));
});
