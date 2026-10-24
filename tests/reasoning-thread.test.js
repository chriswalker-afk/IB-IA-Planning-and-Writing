import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createProjectState,normalizeProjectState} from '../src/core/project-state.js';
import {setCompletionField,setCompletionNode,addMathematicalStage,flagDependentMathematics} from '../src/completing/engine.js';
import {journeySourceSignature} from '../src/completing/adaptive-journey.js';
import {createCompletingViews} from '../src/completing/views.js';
import {insightItems,insightCapture,featuredSparkItems} from '../src/ui/insight-threads.js';
import {
 recordedDecisionNotes,mathematicalReasoningThread,renderMathematicalDecisionThread,
 renderPriorDecisionLink,renderConclusionReasoningThread
} from '../src/completing/reasoning-thread.js';

const e=x=>String(x??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const icon=x=>'<span class="icon" data-icon="'+e(x)+'"></span>';
const make=()=>{
 const s=createProjectState();
 s.planning.fields.aim='Which box dimensions maximise volume within the constraints?';
 s.entries=[{id:'step-one',title:'Volume model',phase:'first',status:'completed',
  methodId:'optimisation',result:'V = 36x - 4x^2',
  interpretation:'The stationary point may maximise usable volume',
  nextQuestion:'Is the stationary point feasible?',
  nextWhy:'I need to compare the boundary and the stated constraints.'}];
 s.completion.activeEntryIndex=0;
 return s;
};
const view=state=>createCompletingViews({
 getState:()=>state,e,icon,
 button:(text,action)=>'<button data-action="'+e(action)+'">'+e(text)+'</button>',
 field:(path,label,hint='')=>'<label data-path="'+e(path)+'" data-hint="'+e(hint)+'">'+e(label)+'</label>',
 choose:(path,opts)=>'<div data-choice-path="'+e(path)+'">'+opts.map(o=>e(o.title)).join(',')+'</div>',
 summary:(label,value)=>'<p>'+e(label)+': '+e(value)+'</p>',
 sheetTitle:(id,title)=>'<h1>'+e(title)+'</h1>',
 tabletNav:()=>'',filled:x=>typeof x==='string'&&!!x.trim()
}).viewCompleting();

test('no mathematical decision thread is invented for an unperformed calculation',()=>{
 const s=make(),first=s.entries[0];
 first.status='planned';
 assert.equal(mathematicalReasoningThread(s,first),null);
 assert.equal(renderMathematicalDecisionThread(s,first,{icon,e}),'');
 assert.equal(renderConclusionReasoningThread(s,{icon,e}),'');
 first.status='completed';first.result='';
 assert.equal(mathematicalReasoningThread(s,first),null);
});

test('a recorded result, specific mathematical question and own reason remain distinct',()=>{
 const s=make(),first=s.entries[0],before=JSON.stringify(s);
 const thread=mathematicalReasoningThread(s,first);
 assert.equal(thread.status,'linked');
 assert.equal(thread.finding,first.interpretation);
 assert.equal(thread.question,first.nextQuestion);
 assert.equal(thread.reason,first.nextWhy);
 assert.match(thread.check,/endpoint|candidates|domain|condition|constraint|boundary/i);
 assert.equal(thread.confirmedChildren,0);
 assert.equal(JSON.stringify(s),before,'deriving guidance must not change a project');
 const html=renderMathematicalDecisionThread(s,first,{icon,e});
 for(const phrase of ['What I have established','The mathematical question left open',
  'Why the next mathematics would resolve that gap','Continue investigating','Conclude responsibly'])
  assert(html.includes(phrase),phrase);
 assert(html.includes('data-reasoning-status="linked"'));
 assert(!html.includes('data-action="stage-add"'),'the read-only coach must not replace real navigation');
});

test('missing question or reason prompts an honest decision, never auto-fills an answer',()=>{
 const s=make(),first=s.entries[0];
 first.nextWhy='';
 assert.equal(mathematicalReasoningThread(s,first).status,'reason-needed');
 first.nextQuestion='';
 assert.equal(mathematicalReasoningThread(s,first).status,'choose');
 assert(renderMathematicalDecisionThread(s,first,{icon,e}).includes('an honest conclusion is valid'));
 first.nextWhy='I must check my assumptions';
 assert.equal(mathematicalReasoningThread(s,first).status,'question-needed');
});

test('the first four-part screen and the What next pages write to the same canonical first record',()=>{
 const s=make(),first=s.entries[0];
 setCompletionNode(s,'C30');
 setCompletionField(s,'nextQuestion','Would a boundary beat the stationary point?');
 setCompletionField(s,'nextReason','Because the domain includes two endpoints.');
 assert.equal(first.nextQuestion,'Would a boundary beat the stationary point?');
 assert.equal(first.nextWhy,'Because the domain includes two endpoints.');
 setCompletionNode(s,'C35');
 setCompletionField(s,'nextQuestion','Are both endpoints feasible?');
 setCompletionField(s,'nextReason','My previous optimum depends on a feasibility check.');
 assert.equal(first.nextQuestion,'Are both endpoints feasible?');
 assert.equal(first.nextWhy,'My previous optimum depends on a feasibility check.');
 assert.equal(insightItems(s).find(x=>x.id==='direction:step-one').value,'Are both endpoints feasible?');
 assert(featuredSparkItems(s,'C35').some(x=>x.id==='direction:step-one'));
 assert(insightCapture(s,'C35').includes('Your possible next mathematical question'));
});

test('a genuine C35 question and reason seed the correct subsequent mathematical stage',()=>{
 const s=make(),parent=s.entries[0];
 // No route selected: a student's own mathematical connection is still valid.
 parent.methodId='';
 s.completion.current='C35';s.completion.nextFromEntryId=parent.id;
 setCompletionField(s,'nextQuestion','Check the feasible boundary candidates');
 setCompletionField(s,'nextReason','The stationary point alone cannot establish the global optimum.');
 const created=addMathematicalStage(s);
 assert.equal(created.ok,true);
 const child=s.entries.at(-1);
 assert.equal(child.fromEntryId,parent.id);
 assert.equal(child.title,'Check the feasible boundary candidates');
 assert.equal(child.purpose,'The stationary point alone cannot establish the global optimum.');
 assert.equal(child.status,'planned','no new stage may start as a confirmed result');
 assert.equal(parent.nextQuestion,'Check the feasible boundary candidates');
 assert.equal(parent.nextWhy,'The stationary point alone cannot establish the global optimum.');
});

test('shared follow-up notes are rehydrated when C35 moves to a different completed source',()=>{
 const s=make(),original=s.entries[0];
 const later={id:'step-two',phase:'substantial',fromEntryId:'step-one',status:'completed',
  title:'Boundary comparison',result:'V(0)=0 and V(3)=72',
  nextQuestion:'How sensitive is the chosen design?',nextWhy:'Small errors might change the ranking.'};
 s.entries.push(later);
 s.completion.current='C40';s.completion.activeEntryIndex=1;
 s.completion.nextFromEntryId='step-one';
 s.completion.fields.nextQuestion=original.nextQuestion;
 s.completion.fields.nextReason=original.nextWhy;
 setCompletionNode(s,'C35');
 assert.equal(s.completion.nextFromEntryId,'step-two');
 assert.equal(s.completion.fields.nextQuestion,later.nextQuestion);
 assert.equal(s.completion.fields.nextReason,later.nextWhy);
 setCompletionField(s,'nextQuestion','Does a 1 mm change alter the maximum?');
 assert.equal(later.nextQuestion,'Does a 1 mm change alter the maximum?');
 assert.equal(original.nextQuestion,'Is the stationary point feasible?');
});

test('a first-stage legacy fallback cannot inherit notes from a later mathematical stage',()=>{
 const s=make(),first=s.entries[0];
 first.nextQuestion='';first.nextWhy='';
 s.entries.push({id:'later',phase:'substantial',status:'completed',fromEntryId:first.id,
  title:'Later model',result:'A measured prediction',
  nextQuestion:'Is the prediction valid outside the range?',nextWhy:'The domain may be too narrow.'});
 s.completion.current='C35';s.completion.nextFromEntryId='later';s.completion.activeEntryIndex=1;
 s.completion.fields.nextQuestion='Is the prediction valid outside the range?';
 s.completion.fields.nextReason='The domain may be too narrow.';
 const firstNotes=recordedDecisionNotes(s,first);
 assert.equal(firstNotes.question,'');
 assert.equal(firstNotes.reason,'');
 setCompletionNode(s,'C30');
 assert.equal(s.completion.activeEntryIndex,0);
 assert.equal(s.completion.fields.nextQuestion,'');
 assert.equal(s.completion.fields.nextReason,'');
 setCompletionNode(s,'C35');
 assert.equal(s.completion.nextFromEntryId,'later');
 assert.equal(s.completion.fields.nextQuestion,'Is the prediction valid outside the range?');
});

test('C35H and C35P amendments remain attached to the selected result',()=>{
 const s=make();s.completion.nextFromEntryId='step-one';
 for(const node of ['C35H','C35P']){
  s.completion.current=node;
  setCompletionField(s,'nextReason','Check point '+node+' because the result depends on a mathematical condition.');
  assert.equal(s.entries[0].nextWhy,'Check point '+node+' because the result depends on a mathematical condition.');
 }
});

test('later mathematical stages retain exact predecessor provenance and existing students notes',()=>{
 const s=make(),parent=s.entries[0];
 const child={id:'second',phase:'substantial',title:'Check feasible region',
  status:'planned',fromEntryId:parent.id,purpose:'I need to examine endpoints'};
 child.journeySourceSignature=journeySourceSignature(s,parent);
 s.entries.push(child);
 const before=JSON.stringify(s),thread=mathematicalReasoningThread(s,parent);
 assert.equal(thread.children.length,1);
 assert.equal(thread.confirmedChildren,0);
 const html=renderPriorDecisionLink(s,child,{icon,e});
 assert(html.includes('Is the stationary point feasible?'));
 assert(html.includes('I need to compare the boundary'));
 assert(html.includes('I need to examine endpoints'));
 assert(!html.includes('needs link review'));
 assert.equal(JSON.stringify(s),before);
 const spark=insightItems(s).find(x=>x.id==='direction:step-one');
 assert(spark.planned,'a linked question remains a proposed question, not a performed result');
 assert.deepEqual(spark.linked,['second']);
 assert(spark.details.some(d=>d.value.includes('Check feasible region (planned)')));
 child.status='completed';child.result='The feasible boundary is x=3';
 assert.equal(mathematicalReasoningThread(s,parent).confirmedChildren,1);
 assert(insightItems(s).find(x=>x.id==='direction:step-one').usage.includes('not automatically proof'));
});

test('changing a predecessor flags a dependent stage instead of silently endorsing stale reasoning',()=>{
 const s=make(),parent=s.entries[0];
 const child={id:'second',phase:'substantial',fromEntryId:parent.id,status:'completed',
  result:'The maximum feasible volume is 72',purpose:'Check the endpoints',
  journeySourceSignature:journeySourceSignature(s,parent)};
 s.entries.push(child);
 const old=parent.nextQuestion;parent.nextQuestion='Does the upper constraint change the answer?';
 flagDependentMathematics(s,0,'nextQuestion',old,parent.nextQuestion);
 assert.equal(child.reviewNeeded,'yes');
 const html=renderPriorDecisionLink(s,child,{icon,e});
 assert(html.includes('data-reasoning-link-review="true"'));
 assert(html.includes('Recheck whether this next method'));
 assert.equal(mathematicalReasoningThread(s,parent).children[0].review,true);
});

test('an older saved project with missing original next-question notes can still find its explicit child',()=>{
 const s=make();s.entries[0].nextQuestion='';s.entries[0].nextWhy='';
 s.completion.fields.nextQuestion='';s.completion.fields.nextReason='';
 s.entries.push({id:'legacy-child',fromEntryId:'step-one',phase:'substantial',status:'planned',
  title:'Inspect boundary values',purpose:'The model may only be valid over a restricted interval.'});
 const item=insightItems(s).find(x=>x.id==='direction:step-one');
 assert(item&&item.planned);
 assert(item.value.includes('Inspect boundary'));
 assert(item.details.some(x=>x.label.includes('linked')));
});

test('conclusion support preserves an unanswered question as optional and never claims sufficiency',()=>{
 const s=make();const before=JSON.stringify(s);
 const html=renderConclusionReasoningThread(s,{icon,e,reduced:true});
 assert(html.includes('data-conclusion-reasoning="step-one"'));
 assert(html.includes('Is the stationary point feasible?'));
 assert(html.includes('appropriately qualified conclusion'));
 assert(html.includes('class="conclusion-reasoning is-reduced"'));
 assert(!html.includes('<details open'));
 assert(!html.includes('You have sufficient mathematics'));
 assert.equal(JSON.stringify(s),before);
 s.entries.push({id:'flagged-last',phase:'substantial',status:'completed',
  title:'Needs checking',result:'A misleading number',reviewNeeded:'yes',nextQuestion:'Unknown'});
 const later=renderConclusionReasoningThread(s,{icon,e});
 assert(later.includes('The stationary point may maximise usable volume'));
 assert(!later.includes('A misleading number'));
 assert(later.includes('need review'));
});

test('contextual prompts draw mathematical checks from the actual selected method',()=>{
 const s=make(),x=s.entries[0];
 let t=mathematicalReasoningThread(s,x);
 assert.match(t.check,/endpoint|candidate|constraint|domain/i);
 x.methodId='proof';
 t=mathematicalReasoningThread(s,x);
 assert.match(t.check,/quantifier|domain|assumption|argument/i);
 x.methodId='pmcc';
 t=mathematicalReasoningThread(s,x);
 assert.match(t.check,/scatter|shape|point/i);
});

test('student-provided HTML is escaped within reasoning and successor links',()=>{
 const s=make(),p=s.entries[0];
 p.result='<img src=x onerror="alert(1)">';
 p.interpretation='<svg onload=alert(1)>';
 p.nextQuestion='<script>alert(1)</script>';
 p.nextWhy='Use <b>an extra method</b>';
 s.planning.fields.aim='<script>alert(1)</script>';
 const a=renderMathematicalDecisionThread(s,p,{icon,e});
 assert(!a.includes('<script'));
 assert(!a.includes('<img'));
 assert(!a.includes('<svg'));
 assert(a.includes('&lt;script&gt;'));
 assert(a.includes('&lt;svg'));
 const child={id:'later',fromEntryId:'step-one',title:'<b>danger</b>',purpose:'<img src=x>',status:'planned'};
 s.entries.push(child);
 const b=renderPriorDecisionLink(s,child,{icon,e});
 assert(!b.includes('<img'));
 assert(!b.includes('<b>danger'));
 assert(b.includes('&lt;img'));
});

test('C30, C35, later stages and conclusion show the same decision context at the correct task',()=>{
 const s=make();
 setCompletionNode(s,'C30');
 let html=view(s);
 assert(html.includes('data-reasoning-thread="step-one"'));
 assert(html.indexOf('data-reasoning-thread="step-one"')<html.lastIndexOf('What mathematical question remains unanswered?'));
 setCompletionNode(s,'C35');html=view(s);
 assert(html.includes('data-reasoning-thread="step-one"'));
 s.entries.push({id:'second',fromEntryId:'step-one',phase:'substantial',status:'completed',
  title:'Boundary check',result:'Feasible maximum: 72 cm³',purpose:'A feasible optimum is needed.',
  nextQuestion:'How robust is the answer?',nextWhy:'The measurement resolution may matter.'});
 s.completion.activeEntryIndex=1;
 setCompletionNode(s,'C40');html=view(s);
 assert(html.includes('data-prior-reasoning="step-one"'));
 assert(html.includes('data-reasoning-thread="second"'));
 assert(html.includes('How robust is the answer?'));
 setCompletionNode(s,'C50');html=view(s);
 assert(html.includes('data-reasoning-thread="second"'));
 setCompletionNode(s,'C60');html=view(s);
 assert(html.includes('data-conclusion-reasoning="second"'));
 assert(html.includes('How robust is the answer?'));
});

test('reduced advice keeps the optional reasoning disclosure accessible',()=>{
 const s=make();s.ui.adviceMode='reduced';
 setCompletionNode(s,'C30');
 const html=view(s);
 assert(html.includes('data-reasoning-thread="step-one"'));
 assert(html.includes('class="math-reasoning-thread is-reduced"'));
 assert(html.includes('<details class="math-reasoning-disclosure">'));
 assert(!html.includes('<details class="math-reasoning-disclosure" open'));
 const style=readFileSync(new URL('../data/spark-shelf.css',import.meta.url),'utf8');
 for(const text of ['.reasoning-thread-parts','.reasoning-prior-link',
  '.conclusion-reasoning','summary:focus-visible','prefers-reduced-motion:reduce'])
  assert(style.includes(text),text);
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.equal(mathematicalReasoningThread(restored,restored.entries[0]).status,'linked');
});
