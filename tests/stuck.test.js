import test from 'node:test';
import assert from 'node:assert/strict';
import {createProjectState,normalizeProjectState} from '../src/core/project-state.js';
import {C_NODE_IDS,setCompletionNode} from '../src/completing/engine.js';
import {PLANNING_NODE_IDS} from '../src/planning/engine.js';
import {STUCK_TOPICS} from '../src/help/stuck-catalog.js';
import {captureStuckOrigin,normalizeStuckState} from '../src/help/stuck-state.js';
import {adviceFor,stuckContext,suggestedTopics,availableTopics} from '../src/help/stuck.js';
import {stuckAction} from '../src/help/stuck-actions.js';
import {createStuckViews} from '../src/help/stuck-views.js';
import {escapeHtml} from '../src/ui/primitives.js';
function fixture({node='C34B',kind='statistics',method='pmcc',status='completed'}={}){
 const s=createProjectState();s.route='completing';s.planning.fields.kind=kind;s.planning.fields.course='AA SL';s.planning.fields.aim='How do these two quantities relate?';
 s.entries=[{id:'current',phase:'substantial',methodId:method,knowledge:'syllabus',title:'Selected work',status,result:status==='completed'?'r = 0.23':'',interpretation:'A tentative sample finding',accuracyRefs:[]}];s.completion.activeEntryIndex=0;s.completion.current=node;captureStuckOrigin(s);return s;
}
const view=s=>createStuckViews({getState:()=>s,e:escapeHtml,icon:()=>'',field:(path,label)=>'<label>'+escapeHtml(label)+'<input data-bind="'+path+'"></label>'}).render();
test('support provides distinct problems with source references, concise first actions and labelled examples',()=>{
 assert.equal(STUCK_TOPICS.length,24);assert.equal(new Set(STUCK_TOPICS.map(t=>t.id)).size,24);
 for(const t of STUCK_TOPICS){assert(t.refs&&t.example&&t.boundary);assert(t.action.split(/\s+/).length<65,t.id);}
});
test('starting Planning prioritises shaping the aim, not a missing-data form',()=>{
 const s=fixture();s.route='planning';s.planning.current='N01';captureStuckOrigin(s);
 const ids=suggestedTopics(s).map(t=>t.id);assert.equal(ids[0],'aim');assert(!ids.includes('no-data'));assert.equal(stuckContext(s).entry,null);
});
test('planning help does not interpret a stale completed calculation',()=>{
 const s=fixture();s.route='planning';captureStuckOrigin(s);
 assert.match(adviceFor(s,'interpret').reason,/No completed result/);
});
test('data ready changes suggested problems without declaring a flaw',()=>{
 const s=fixture({node:'C20'});s.completion.fields.dataStatus='ready';
 assert.equal(suggestedTopics(s)[0].id,'source');assert(!suggestedTopics(s).some(t=>t.id==='no-data'));
});
test('theoretical projects skip sample/data suggestions and retain proof-specific help',()=>{
 const s=fixture({kind:'theoretical',method:'proof'});
 assert.equal(suggestedTopics(s)[0].id,'proof');assert(!availableTopics(s).some(t=>['no-data','source','partial'].includes(t.id)));
 assert.match(adviceFor(s,'interpret').example,/claim for every/);
});
test('unresolved permission prioritises safe preparation without changing consent',()=>{
 const s=fixture();s.teacher.pendingApproval=true;
 assert.equal(suggestedTopics(s)[0].id,'permission');assert.match(adviceFor(s,'no-data').action,/on hold/);assert.equal(adviceFor(s,'no-data').target.node,'C03');assert.equal(s.teacher.pendingApproval,true);
});
test('the normal menu recommends at most five problems with deeper alternatives closed',()=>{
 const s=fixture();assert(suggestedTopics(s).length<=5);const html=view(s);
 assert(html.includes('Other problems'));assert(!html.includes('<details class="stuck-browse" open'));
});
test('one support card has one primary action, with example and saving optional',()=>{
 const s=fixture();s.completion.support.selected='interpret';const html=view(s);
 assert.equal((html.match(/btn-primary/g)||[]).length,1);assert(html.includes('Show a small example'));assert(html.includes('Save my own next action (optional)'));assert(!html.includes(' open'));
});
test('every available advice card has a valid destination and at most two alternatives',()=>{
 for(const planning of [true,false])for(const real of [true,false]){
  const s=fixture({status:real?'completed':'planned'});if(planning){s.route='planning';captureStuckOrigin(s);}
  for(const t of availableTopics(s)){
   const a=adviceFor(s,t.id);assert(a.alternatives.length<=2);assert(a.target);
   if(a.target.route==='planning')assert(PLANNING_NODE_IDS.includes(a.target.node),t.id);
   if(a.target.route==='completing')assert(C_NODE_IDS.includes(a.target.node),t.id);
  }
 }
});
test('opening and reading help never fabricates results or changes aims, source choices or stage status',()=>{
 const s=fixture(),before=JSON.stringify([s.entries,s.planning,s.teacher,s.completion.stages]);
 for(const t of availableTopics(s)){stuckAction(s,'stuck-topic',{topic:t.id});adviceFor(s,t.id);view(s);}
 assert.equal(JSON.stringify([s.entries,s.planning,s.teacher,s.completion.stages]),before);
});
test('a rejected PMCC title does not create PMCC interpretation advice',()=>{
 const s=fixture({method:'normal'});s.entries[0].title='Normal model rather than PMCC';
 assert(!adviceFor(s,'interpret').action.includes('Pearson'));assert.match(adviceFor(s,'calculation').action,/standard deviation/);
});
test('planned mathematics has preparatory help rather than interpretation of nonexistent results',()=>{
 const s=fixture({status:'planned'});for(const id of ['interpret','next','unexpected']){const a=adviceFor(s,id);assert.match(a.reason,/No completed result/);assert.notEqual(a.target.node,'C34B');}
});
test('unclassified curved plot never gets an assumed monotonic or rank-correlation recommendation',()=>{
 const s=fixture({node:'C35',method:'other'});Object.assign(s.entries[0],{phase:'first',kind:'scatter',observation:'curved'});s.completion.nextFromEntryId='current';captureStuckOrigin(s);
 const a=adviceFor(s,'next');assert.match(a.example,/does not establish monotonicity/);assert(!a.action.includes('Spearman'));
});
test('selected earlier result, not the last record, anchors next-step help',()=>{
 const s=fixture({node:'C35',method:'other'});Object.assign(s.entries[0],{phase:'first',kind:'scatter',observation:'unclear'});s.entries.push({id:'later',phase:'substantial',methodId:'pmcc',status:'completed',result:'r=0.9'});s.completion.nextFromEntryId='current';captureStuckOrigin(s);
 assert.match(adviceFor(s,'next').example,/Little visible pattern/);assert(!adviceFor(s,'next').action.includes('Pearson interpretation'));
});
test('precision advice refers to linked inputs only',()=>{
 const s=fixture();s.completion.accuracyDecisions=[{id:'a',quantity:'Distance'},{id:'b',quantity:'Time'},{id:'c',quantity:'Temperature'}];s.entries[0].accuracyRefs=['a','b'];
 const text=adviceFor(s,'precision').action;assert(text.includes('Distance, Time'));assert(!text.includes('Temperature'));
});
test('verified syllabus learning does not demand a textbook explanation in the IA',()=>{const s=fixture();assert.match(adviceFor(s,'understanding').action,/do not add a textbook tutorial/);});
test('saving requires the student to choose an action, not accepting generated IA prose',()=>{
 const s=fixture();stuckAction(s,'stuck-topic',{topic:'next'});assert(!stuckAction(s,'stuck-save').ok);
 s.completion.support.drafts.next.action='Check whether a curved model fits the evidence';s.completion.support.drafts.next.note='Ask about the residual plot.';
 assert(stuckAction(s,'stuck-save').ok);assert.equal(s.completion.support.task.status,'pending');assert.equal(s.entries.length,1);assert.equal(s.scratch.conclusion,'');
});
test('only the student can mark a saved action helpful; opening work is not completion',()=>{
 const s=fixture();s.completion.support.selected='next';s.completion.support.drafts.next.action='Check the plot';stuckAction(s,'stuck-save');
 stuckAction(s,'stuck-work');assert.equal(s.completion.support.task.status,'pending');stuckAction(s,'stuck-resolved');assert.equal(s.completion.support.task.status,'resolved');assert(Object.values(s.completion.stages).every(v=>v==='not-started'));
});
test('separate issue drafts and unresolved action survive the full backup normalizer',()=>{
 const s=fixture();s.completion.support.selected='aim';s.completion.support.drafts.aim.action='Narrow the scope';s.completion.support.drafts.aim.note='Keep my original expectation';stuckAction(s,'stuck-save');stuckAction(s,'stuck-topic',{topic:'method'});s.completion.support.drafts.method.action='Check suitability';
 const n=normalizeProjectState(JSON.parse(JSON.stringify(s)));assert.equal(n.completion.support.drafts.aim.action,'Narrow the scope');assert.equal(n.completion.support.drafts.method.action,'Check suitability');assert.equal(n.completion.support.task.status,'pending');assert.equal(n.completion.support.origin.node,'C34B');
});
test('old projects get optional empty support without altering mathematical records',()=>{
 const s=fixture();delete s.completion.support;const n=normalizeProjectState(JSON.parse(JSON.stringify(s)));assert.equal(n.completion.support.selected,'');assert.equal(n.entries[0].result,'r = 0.23');assert.equal(n.completion.support.task,null);
});
test('support does not preserve untrusted keys, invalid issues or unbounded inputs',()=>{
 const n=normalizeStuckState(JSON.parse('{"selected":"__proto__","drafts":{"__proto__":{"polluted":"yes"},"aim":{"action":"text"}},"origin":{"route":"javascript:x"},"task":{"issue":"aim","action":"fine","status":"complete"}}'));
 assert.equal(n.selected,'');assert.equal(n.origin,null);assert.equal(n.task.status,'pending');assert.equal({}.polluted,undefined);assert.equal(n.drafts.aim.action,'text');
});
test('displayed aim, result title and private notes are escaped',()=>{
 const s=fixture();s.entries[0].title='<img src=x onerror=alert(1)>';s.completion.support.task={issue:'aim',action:'<script>bad()</script>',status:'pending'};
 const html=view(s);assert(!html.includes('<img'));assert(!html.includes('<script>'));assert(html.includes('&lt;img'));
});
test('legacy C95 entry keeps the original mathematical location and same help component',()=>{
 const s=fixture();setCompletionNode(s,'C95');assert.equal(s.completion.support.origin.node,'C34B');assert.equal(s.completion.support.origin.entryId,'current');assert.equal(stuckContext(s).node,'C34B');
});
test('a different work context resets the selected help topic but retains private drafts',()=>{
 const s=fixture();s.completion.support.selected='next';s.completion.support.drafts.next.action='My own task';s.completion.current='C10';captureStuckOrigin(s);assert.equal(s.completion.support.selected,'');assert.equal(s.completion.support.drafts.next.action,'My own task');
});
test('data or introduction help does not inherit a stale active mathematical step',()=>{
 const s=fixture({node:'C10'});assert.equal(stuckContext(s).entry,null);assert.equal(adviceFor(s,'writing').target.node,'C10');
});
test('help at the conclusion can choose a completed record rather than pretend none exists',()=>{
 const s=fixture({node:'C61'});assert.equal(adviceFor(s,'interpret').target.route,'path');assert.match(adviceFor(s,'interpret').action,/Choose the completed result/);
});
test('earlier legacy help notes remain accessible and are not silently promoted into the IA',()=>{
 const s=fixture();s.completion.fields.oneSafeAction='My original pending task';s.completion.fields.alternateSource='A candidate to check';assert(view(s).includes('My original pending task'));assert(view(s).includes('Earlier help notes (kept)'));assert.equal(s.scratch.dataNotes,'');
});

test('writing help uses the source or conclusion section instead of restarting the introduction',()=>{
 const data=fixture({node:'C20'});data.completion.fields.dataStatus='ready';
 assert.equal(adviceFor(data,'writing').target.node,'C96');assert.match(adviceFor(data,'writing').action,/actually used/);
 const end=fixture({node:'C60'});assert.match(adviceFor(end,'writing').action,/strongest answer/);assert.equal(adviceFor(end,'writing').target.node,'C96');
 const intro=fixture({node:'C10'});assert.equal(adviceFor(intro,'writing').target.node,'C10');
});
