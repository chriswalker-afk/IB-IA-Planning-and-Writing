import test from 'node:test';
import assert from 'node:assert/strict';
import {createProjectState} from '../src/core/project-state.js';
import {applyPlanningField} from '../src/planning/engine.js';
import {icon,escapeHtml} from '../src/ui/primitives.js';
import {essentialsNudge} from '../src/essentials/views.js';
import {INTRODUCTION_TIPS,renderIntroductionSparkPrompt,renderIntroductionWritingAdvice,renderIntroductionOptionalExamples} from '../src/completing/intro-writing-advice.js';
import {renderWritingStageFlow} from '../src/completing/stage-writing-flow.js';
import {criterionMarkedWritingBox} from '../src/essentials/criteria-badges.js';
import {renderSparkShelf} from '../src/ui/insight-threads.js';
import {CRITERION_SPOTS} from '../src/essentials/criteria-badges.js';
import {insightMeaning,insightItems} from '../src/ui/insight-threads.js';
import {exampleById} from '../src/examples/catalog.js';
import {renderCard} from '../src/examples/views.js';

const make=()=>{const s=createProjectState();s.route='completing';s.completion.current='C10';return s;};
test('document setup and format belong to Set up, not the Introduction',()=>{
 const s=make();const original=JSON.stringify(s);
 assert.equal(essentialsNudge(s),'');
 s.completion.current='C00';
 const html=essentialsNudge(s);
 assert(html.includes('Set up your IA document'));
 assert(html.includes('Format and length'));
 assert(html.includes('data-essentials-tab="format"'));
 assert(html.includes('12–20 double-spaced pages'));
 assert(html.includes('whole IA'));
 assert.equal(JSON.stringify(s),JSON.stringify({...JSON.parse(original),completion:{...JSON.parse(original).completion,current:'C00'}}));
});
test('introduction sparks become explicit writing prompts without claiming the actual document is written',()=>{
 const s=make(),start=JSON.stringify(s);
 let html=renderIntroductionSparkPrompt(s,icon,escapeHtml);
 assert(html.includes('Turn your sparks into an opening'));
 assert.equal((html.match(/data-intro-spark="/g)||[]).length,3);
 assert(html.includes('data-intro-spark-state="missing"'));
 assert(html.includes('data-node="N01A"'));
 assert(html.includes('data-node="N01V"'));
 assert(html.includes('data-intro-spark="prediction"'));
 assert(html.includes('data-action="intro-prediction-open"'));
 assert(html.includes('data-bind="planning.fields.prediction"'));
 assert(html.includes('data-bind="planning.fields.predictionWhy"'));
 assert(html.includes('in your actual IA document'));
 assert.equal(JSON.stringify(s),start);
 s.planning.fields.aim='How well can a mathematical model explain my result?';
 s.planning.fields.motivation='I noticed a pattern and wanted to investigate it.';
 html=renderIntroductionSparkPrompt(s,icon,escapeHtml);
 assert.equal((html.match(/data-intro-spark-state="ready"/g)||[]).length,2);
 assert(html.includes('data-intro-spark="prediction" data-intro-spark-state="missing"'));
 assert(html.includes('Review spark'));
 assert(html.includes('data-intro-spark="aim"'));
 assert(html.includes('How well can a mathematical model explain my result?'));
 assert.deepEqual(s.scratch,JSON.parse(start).scratch);
});
test('introduction writing craft remains fully accessible without six large cards above the task',()=>{
 assert.equal(INTRODUCTION_TIPS.length,6);
 assert.equal(INTRODUCTION_TIPS.filter(t=>t.essential).length,4);
 assert.equal(new Set(INTRODUCTION_TIPS.map(t=>t.id)).size,6);
 const html=renderIntroductionWritingAdvice(icon,escapeHtml,{state:make()});
 assert(html.includes('Before you write'));
 assert(html.includes('Write the opening, not the ending'));
 assert(html.includes('State your precise mathematical aim'));
 assert(html.includes('non-mathematical specialist terms briefly'));
 assert.equal((html.match(/data-intro-advice="/g)||[]).length,0);
 assert(html.includes('All six introduction writing tips'));
 assert(html.includes('data-guide-spot="completing:C10:aim"'));
 assert(!html.includes('data-criterion-badge="completing:C10:aim"'));
 assert(!html.includes('Set up your IA document'));
 assert(!html.includes('Why this matters in the criteria'));
 for(const t of INTRODUCTION_TIPS)assert(t.body.length>90&&t.weak.length>15&&t.strong.length>25);
 const reduced=renderIntroductionWritingAdvice(icon,escapeHtml,{reduced:true,state:make()});
 assert.equal(reduced,"","Reduced mode omits the duplicate before-you-write panel; the task and bubbles remain");
 assert.equal(INTRODUCTION_TIPS.length,6,"All source lessons are preserved and appear in the Field Guide");
});
test('criterion A/C comments are introduction-specific, and remain best-fit guidance',()=>{
 const a=CRITERION_SPOTS['completing:C10:aim'],c=CRITERION_SPOTS['completing:C10:motivation'];
 assert(a.strong.includes('few focused paragraphs'));
 assert(a.reminder.includes('not a prescribed IB'));
 assert(c.strong.includes('authentic'));
 assert(c.reminder.includes('completed mathematical exploration'));
});
test('featured spark descriptions explicitly prompt written use and prefer recorded motivation',()=>{
 const s=make();
 s.planning.fields.aim='How does the variable affect the outcome?';
 s.planning.fields.motivation='I genuinely want to explain this unusual relationship.';
 s.planning.fields.beneficiary='My club';
 const items=insightItems(s);
 assert.equal(items.find(x=>x.id==='motivation').value,s.planning.fields.motivation);
 assert(insightMeaning(s,'C10',items.find(x=>x.id==='aim')).includes('actual IA introduction'));
 assert(insightMeaning(s,'C10',items.find(x=>x.id==='motivation')).includes('actual IA'));
});
test('introduction examples favour aims, motivation and an open mathematical journey',()=>{
 for(const id of ['EX01','EX02','EX03','EX34']){
  const example=exampleById(id),html=renderCard(example);
  assert(example.introFeatures?.length===3);
  assert(html.includes('What makes the stronger introduction work?'));
  assert(!html.includes('onclick='));
  for(const f of example.introFeatures)assert(example.strong.includes(f.quote),id+': '+f.label);
 }
 assert(exampleById('EX34').strong.includes('Dough hydration'));
});

test('Introduction updates the canonical prediction and reasoning spark for later comparison',()=>{
 const s=make();s.planning.completed=true;s.completion.stages.C10='working';
 const before=JSON.stringify(s);
 const initial=renderIntroductionSparkPrompt(s,icon,escapeHtml);
 assert(initial.includes('data-intro-spark="prediction" data-intro-spark-state="missing"'));
 assert(initial.includes('To consider'));
 assert(initial.includes('Review and update'));
 assert.equal(JSON.stringify(s),before);
 const prediction='I suspect area grows more quickly than the price';
 const why='Because area changes with the square of the diameter.';
 assert.equal(applyPlanningField(s,'prediction',prediction),true);
 assert.equal(applyPlanningField(s,'predictionWhy',why),true);
 assert.equal(s.planning.completed,true); // Optional refinement does not restart Planning.
 assert.equal(s.planning.fields.prediction,prediction);
 assert.equal(s.project.prediction,prediction);
 assert.equal(s.planning.fields.predictionWhy,why);
 assert.equal(s.project.predictionWhy,why);
 const saved=insightItems(s).find(x=>x.id==='prediction');
 assert(saved.value.includes(prediction));
 assert(saved.value.includes(why));
 assert(saved.go.node==='N01P');
 assert(insightMeaning(s,'C10',saved).includes('actual IA'));
 assert(insightMeaning(s,'C34B',saved).includes('Compare'));
 const updated=renderIntroductionSparkPrompt(s,icon,escapeHtml);
 assert(updated.includes('data-intro-spark="prediction" data-intro-spark-state="ready"'));
 assert(updated.includes('Spark saved'));
 assert(updated.includes(prediction));
 assert(updated.includes(why));
});
test('Introduction safely escapes free-text prediction input and does not invent a conclusion',()=>{
 const s=make();s.planning.fields.prediction='<img src=x onerror=alert(1)>';
 s.planning.fields.predictionWhy='<script>not real evidence</script>';
 const html=renderIntroductionSparkPrompt(s,icon,escapeHtml);
 assert(!html.includes('<img'));
 assert(!html.includes('<script>'));
 assert(html.includes('&lt;img'));
 assert(html.includes('&lt;script&gt;'));
 assert(html.includes('not a mathematical result'));
 assert(html.includes('what you genuinely hope to learn'));
});
test('An updated prediction does not suppress existing true results or reset Planning from Studio',()=>{
 const s=make();s.planning.completed=true;
 s.completion.stages.C10='complete';s.completion.stages.C40='complete';
 assert.equal(applyPlanningField(s,'prediction','A possible pattern'),true);
 assert.equal(s.planning.completed,true);
 assert.equal(s.completion.stages.C10,'needs-review');
 assert.equal(s.completion.stages.C40,'needs-review');
 s.route='planning';s.planning.completed=true;
 assert.equal(applyPlanningField(s,'prediction','A different possible pattern'),true);
 assert.equal(s.planning.completed,false);
});

test('guided writing puts saved context and the task before optional craft guidance and examples',()=>{
 const html=renderWritingStageFlow({advice:'ADVICE-ONE',sparks:'SPARKS-TWO',task:'WRITE-THREE',examples:'EXAMPLES-FOUR'});
 assert(html.indexOf('SPARKS-TWO')<html.indexOf('WRITE-THREE'));
 assert(html.indexOf('WRITE-THREE')<html.indexOf('ADVICE-ONE'));
 assert(html.indexOf('ADVICE-ONE')<html.indexOf('EXAMPLES-FOUR'));
 assert.equal((html.match(/data-writing-stage-part=/g)||[]).length,4);
 assert(renderWritingStageFlow({advice:'ONE'}).includes('ONE'));
});
test('one field can display contextual A/C bubbles without a second criterion panel',()=>{
 const textarea='<div class="field-group"><label>My working notes</label><textarea></textarea></div>';
 const html=criterionMarkedWritingBox(textarea,['completing:C10:aim','completing:C10:motivation']);
 assert(html.includes('criterion-marked-writing-box'));
 assert(html.includes('criterion-writing-bubbles'));
 assert.equal((html.match(/data-criterion-badge=/g)||[]).length,2);
 assert.equal((html.match(/<textarea/g)||[]).length,1);
 assert(!html.includes('Why this matters in the criteria'));
 assert.equal(criterionMarkedWritingBox(textarea,[]),textarea);
});
test('examples and other sparks are reachable without repeated featured cards',()=>{
 const s=make();
 s.planning.fields.aim='Do larger pizzas give better value?';
 s.planning.fields.motivation='I buy pizza and want to compare them.';
 const lib=renderSparkShelf(s,'C10',{surface:'studio',libraryOnly:true});
 assert(!lib.includes('spark-shelf-featured'));
 assert(lib.includes('Browse all saved sparks'));
 assert(lib.includes('data-spark-library'));
 const examples=renderIntroductionOptionalExamples(icon);
 assert(examples.includes('Compare introductions (optional)'));
 assert(examples.includes('data-example-id="EX34"'));
 assert(examples.includes('data-example-topic="introduction"'));
 assert.equal((examples.match(/data-writing-examples/g)||[]).length,1);
});
