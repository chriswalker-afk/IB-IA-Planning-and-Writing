import test from 'node:test';
import assert from 'node:assert/strict';
import {CRITERIA,E_DESCRIPTORS,FORMAT_ITEMS,PROCESS_ITEMS,courseLevel} from '../src/essentials/catalog.js';
import {criteriaContext,dismissCriteria} from '../src/essentials/context.js';
import {criteriaPanel,formatView,rubricView,submissionView} from '../src/essentials/views.js';
import {EXAMPLE_CRITERIA,exampleCriteria} from '../src/essentials/example-criteria.js';
import {editCriterionReview} from '../src/essentials/review.js';
import {EXAMPLES} from '../src/examples/catalog.js';
import {createProjectState,normalizeProjectState} from '../src/core/project-state.js';
import {setReviewStatus} from '../src/completing/review.js';
const make=(node='C10',kind='modelling')=>{const s=createProjectState();s.route='completing';s.completion.current=node;Object.assign(s.planning.fields,{kind,course:'AA SL'});s.entries=[{id:'first',phase:'first',kind:'scatter',status:'completed',result:'My earlier result',knowledge:'syllabus',methodId:'',accuracyRefs:[],sourceRefs:[]},{id:'later',phase:'substantial',kind:'model',status:'completed',result:'My later result',methodId:'exponential',knowledge:'outside',researchSource:'My source',accuracyRefs:[],sourceRefs:[]}];s.completion.activeEntryIndex=0;s.completion.nextFromEntryId='first';return s;};
test('all descriptor levels and criterion maxima are present, including both distinct E rubrics',()=>{
 assert.deepEqual(Object.values(CRITERIA).map(c=>c.max),[4,4,3,3,6]);
 for(const id of ['A','B','C','D'])assert.equal(CRITERIA[id].descriptors.length,CRITERIA[id].max+1);
 assert.equal(E_DESCRIPTORS.SL.length,7);assert.equal(E_DESCRIPTORS.HL.length,7);
 assert.equal(E_DESCRIPTORS.SL[1],'Some relevant mathematics is used.');
 assert.equal(E_DESCRIPTORS.HL[1],'Some relevant mathematics is used. Limited understanding is demonstrated.');
 assert(E_DESCRIPTORS.HL[5].includes('sophistication or rigour'));assert(E_DESCRIPTORS.HL[6].includes('sophistication and rigour'));
 assert.equal(CRITERIA.A.descriptors[1],'The exploration has some coherence or some organization.');
});
test('course level is explicit; unknown or speculative text is not assumed SL',()=>{
 const s=make();for(const [course,level] of [['AA SL','SL'],['SL AI','SL'],['HL MAA','HL'],['AA HL','HL'],['Other',''],['',''],['SL or HL',''],['I might choose HL','']]){s.planning.fields.course=course;s.project.course='';assert.equal(courseLevel(s),level,course);}
 s.planning.fields.course='unsure';s.project.course='AA SL';assert.equal(courseLevel(s),'');
});
test('formatting distinguishes recommendations, bibliography exclusion and school advice without invented font rules',()=>{
 const t=formatView();assert(t.includes('12–20'));assert(t.includes('excluding the bibliography'));assert(t.includes('not a page-count pass/fail'));
 assert(t.includes('JIS recommendation'));assert(t.includes('Practical formatting advice'));assert(!t.includes('Times New Roman'));assert(!t.includes('must be 12'));
 for(const x of [...FORMAT_ITEMS,...PROCESS_ITEMS])assert(x.source&&x.label);
 assert(FORMAT_ITEMS.find(x=>x.id==='visuals').text.includes('Appendices can hold large datasets'));
 assert(PROCESS_ITEMS.find(x=>x.title==='Teacher advice on a draft').text.includes('orally or in writing'));
});
test('unknown E level asks rather than rendering an assumed descriptor table',()=>{
 const s=make();s.planning.fields.course='Other';const t=rubricView(s,{criterion:'E',level:''});assert(t.includes('Choose SL or HL'));assert(!t.includes('sophistication and rigour'));
 assert(rubricView(s,{criterion:'E',level:'HL'}).includes('sophistication and rigour'));
});
test('all reference views and contextual/example panels are read-only',()=>{
 const s=make(),before=JSON.stringify(s);formatView();rubricView(s,{criterion:'E',level:'HL'});submissionView(s,{mode:'draft'});criteriaPanel(s);for(const c of EXAMPLES)exampleCriteria(c);assert.equal(JSON.stringify(s),before);
});
test('two visible criterion actions accompany a uniform comparison and rubric route',()=>{
 const t=criteriaPanel(make());assert.equal((t.match(/class="criteria-row"/g)||[]).length,2);assert(t.includes('Show good presentation here by'));assert(t.includes('Show good personal engagement here by'));
 assert(/class="criteria-content"[^>]* hidden/.test(t));assert(t.includes('Compare examples'));assert(t.includes('View these criteria'));
});
test('dismissal changes only the UI and is scoped to the exact task and mathematical record',()=>{
 const s=make('C40'),before=JSON.stringify(s),k=criteriaContext(s).key;dismissCriteria(k,true);assert(/class="criteria-content"[^>]* hidden/.test(criteriaPanel(s)));
 s.completion.activeEntryIndex=1;assert.notEqual(criteriaContext(s).key,k);s.completion.activeEntryIndex=0;assert.equal(JSON.stringify(s),before);dismissCriteria(k,false);
});
test('an introduction and conclusion do not inherit a stale theoretical record',()=>{
 const s=make();s.entries[0].kind='theory';assert(!criteriaPanel(s).includes('without inventing a personal anecdote'));s.completion.current='C60';assert(criteriaPanel(s).includes('previously identified limitations'));
});
test('theoretical source guidance does not impose sampling, measurement or a beneficiary',()=>{
 const t=criteriaPanel(make('C20','theoretical'));assert(!/sampl|instrument|beneficiar/i.test(t));assert(t.includes('domain'));
});
test('next-step selection and C96 use the explicitly selected earlier result',()=>{
 const s=make('C35');s.completion.activeEntryIndex=1;assert.equal(criteriaContext(s).entry.id,'first');
 s.completion.current='C96';s.completion.writingOrigin={node:'C34B',entryId:'first'};
 assert.equal(criteriaContext(s).entry.id,'first');
 assert(criteriaContext(s).rows.some(r=>r.id==='D'));
 assert(criteriaPanel(s).includes('Full criteria rubric'));
});
test('a planned record gets preparation rather than an actual-result interpretation',()=>{
 const s=make('C34B');s.entries[0].status='planned';
 const rows=criteriaContext(s).rows;
 assert(rows.some(r=>r.by.includes('genuine result')));
 assert(!rows.some(r=>r.by.includes('this actual result means')));
 const panel=criteriaPanel(s);
 assert(panel.includes('Full criteria rubric'));
 assert(!panel.includes('data-action="criteria-toggle"'));
});
test('familiar, first unfamiliar, mixed and later reused mathematics remain distinct',()=>{
 const s=make('C40L');assert(criteriaPanel(s).includes('without a textbook-style tutorial'));
 s.completion.activeEntryIndex=1;assert(criteriaPanel(s).includes('at first use'));s.entries[1].knowledge='mixed';assert(criteriaPanel(s).includes('unfamiliar component'));
 s.entries[0]={...s.entries[1],id:'first'};assert(criteriaPanel(s).includes('already introduced'));
});
test('accuracy reminders mention only policies linked to the selected record',()=>{
 const s=make('C34A');s.completion.accuracyDecisions=[{id:'a',quantity:'Time',unit:'s',policy:'nearest second'},{id:'b',quantity:'Mass',unit:'kg',policy:'nearest kilogram'}];s.entries[0].accuracyRefs=['a'];const t=criteriaPanel(s);assert(t.includes('nearest second'));assert(!t.includes('nearest kilogram'));
});
test('all original examples connect to valid criterion annotations',()=>{
 assert.equal(Object.keys(EXAMPLE_CRITERIA).length,EXAMPLES.length);for(const c of EXAMPLES){assert(EXAMPLE_CRITERIA[c.id]);for(const id of Object.keys(EXAMPLE_CRITERIA[c.id]))assert(CRITERIA[id]);}
});
test('explicit edits reuse evidence records without changing findings, course or completion',()=>{
 const s=make(),entries=JSON.stringify(s.entries),stage=JSON.stringify(s.completion.stages);assert(editCriterionReview(s,{mode:'draft',id:'A',field:'location',value:'Page 3'}));
 assert.equal(s.completion.review.records['draft-D02'].location,'Page 3');assert.equal(JSON.stringify(s.entries),entries);assert.equal(JSON.stringify(s.completion.stages),stage);assert.equal(s.planning.fields.course,'AA SL');assert.equal(s.completion.review.records['final-D02'].location,'');
});
test('zero marks, maxima and SL/HL provenance survive full JSON normalization',()=>{
 const s=make();for(const mode of ['draft','final'])for(const id of Object.keys(CRITERIA))assert(editCriterionReview(s,{mode,id,field:'selfMark',value:mode==='draft'?'0':String(CRITERIA[id].max),level:mode==='draft'?'SL':'HL'}));
 const r=normalizeProjectState(JSON.parse(JSON.stringify(s)));assert.equal(r.completion.review.records['draft-D02'].selfMark,'0');assert.equal(r.completion.review.records['final-D06'].selfMark,'6');assert.equal(r.completion.review.records['final-D06'].markLevel,'HL');
});
test('invalid grades, unknown E level and prototype keys cannot be saved',()=>{
 for(const change of [{id:'A',value:'5'},{id:'D',value:'3.5'},{id:'E',value:'6'},{id:'__proto__',value:'2'},{field:'status',value:'checked'},{mode:'feedback',value:'2'}]){const s=make(),before=JSON.stringify(s);assert(!editCriterionReview(s,{mode:'draft',id:'A',field:'selfMark',value:'1',...change}));assert.equal(JSON.stringify(s),before);}
 const s=make();s.completion.review.records['draft-D06'].selfMark='6';s.completion.review.records['draft-D06'].markLevel='unknown';assert.equal(normalizeProjectState(s).completion.review.records['draft-D06'].selfMark,'');
});
test('editing checked evidence reopens only the relevant review check',()=>{
 const s=make();s.completion.review.records['draft-D02'].location='Page 2';assert(setReviewStatus(s,'draft','D02','checked').ok);editCriterionReview(s,{mode:'draft',id:'A',field:'location',value:'Page 4'});assert.equal(s.completion.review.records['draft-D02'].status,'needs-work');assert.equal(s.completion.review.records['final-D02'].status,'unchecked');
});
test('switching the reference level does not silently reinterpret an existing E self-mark',()=>{
 const s=make();editCriterionReview(s,{mode:'draft',id:'E',field:'selfMark',value:'5',level:'SL'});const t=submissionView(s,{mode:'draft',level:'HL'});assert(t.includes('recorded against SL'));assert(t.includes('Revisit this judgement'));assert.equal(s.completion.review.records['draft-D06'].markLevel,'SL');
});
test('student evidence text is escaped in the self-review view',()=>{
 const s=make();s.completion.review.records['draft-D02'].note='<img src=x onerror=alert(1)>';const t=submissionView(s,{mode:'draft'});assert(!t.includes('<img'));assert(t.includes('&lt;img'));
});

test('title route labels its compare control with title-specific examples',()=>{
 const s=make();s.route='planning';s.planning.current='N01';
 const html=criteriaPanel(s);
 assert(html.includes('Compare titles'));
 assert(html.includes('data-example-id="EX30"'));
 assert(!html.includes('Compare examples'));
});

test('motivation planning step uses one local C badge, with examples and rubric still available',()=>{
 const s=make();s.route='planning';s.planning.current='N01V';
 const x=criteriaContext(s),html=criteriaPanel(s);
 assert.deepEqual(x.rows.map(r=>r.id),['A','C','D']); // Legacy context remains available to rubric/review.
 assert(html.includes('Compare motivations'));
 assert(html.includes('data-example-topic="motivation"'));
 assert(html.includes('Full criteria rubric'));
 assert(!html.includes('data-action="criteria-toggle"'));
 assert(!html.includes('data-example-id="EX01"'));
 assert(html.includes('Tools & tutorials'));
});
