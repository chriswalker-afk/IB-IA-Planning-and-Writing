import test from 'node:test';
import assert from 'node:assert/strict';
import {createProjectState} from '../src/core/project-state.js';
import {icon,escapeHtml} from '../src/ui/primitives.js';
import {essentialsNudge} from '../src/essentials/views.js';
import {INTRODUCTION_TIPS,renderIntroductionSparkPrompt,renderIntroductionWritingAdvice} from '../src/completing/intro-writing-advice.js';
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
 assert(html.includes('Write about these two sparks now'));
 assert.equal((html.match(/data-intro-spark="/g)||[]).length,2);
 assert(html.includes('data-intro-spark-state="missing"'));
 assert(html.includes('data-node="N01A"'));
 assert(html.includes('data-node="N01V"'));
 assert.equal(JSON.stringify(s),start);
 s.planning.fields.aim='How well can a mathematical model explain my result?';
 s.planning.fields.motivation='I noticed a pattern and wanted to investigate it.';
 html=renderIntroductionSparkPrompt(s,icon,escapeHtml);
 assert.equal((html.match(/data-intro-spark-state="ready"/g)||[]).length,2);
 assert(html.includes('Use in your IA'));
 assert.deepEqual(s.scratch,JSON.parse(start).scratch);
});
test('introduction writing craft is coherent, accessible, contextual and collapsible',()=>{
 assert.equal(INTRODUCTION_TIPS.length,6);
 assert.equal(INTRODUCTION_TIPS.filter(t=>t.essential).length,3);
 const tips=new Set(INTRODUCTION_TIPS.map(t=>t.id));
 assert.equal(tips.size,6);
 const html=renderIntroductionWritingAdvice(icon,escapeHtml);
 assert(html.includes('Write the opening, not the ending'));
 assert(html.includes('Start the journey; don&#39;t write an itinerary'));
 assert.equal((html.match(/data-intro-advice="/g)||[]).length,6);
 assert(html.includes('Three more ways to keep it sharp'));
 assert(html.includes('data-example-id="EX34"'));
 assert(html.includes('data-example-topic="introduction"'));
 assert(html.includes('data-guide-tip="thinking"'));
 assert(html.includes('data-criterion-badge="completing:C10:aim"'));
 assert(html.includes('data-criterion-badge="completing:C10:motivation"'));
 assert(!html.includes('Set up your IA document'));
 assert(!html.includes('Format and length'));
 assert(html.includes('not a prescribed IB word limit'));
 for(const t of INTRODUCTION_TIPS)assert(t.body.length>90&&t.weak.length>15&&t.strong.length>25);
 const reduced=renderIntroductionWritingAdvice(icon,escapeHtml,{reduced:true});
 assert(reduced.includes('State your precise mathematical aim'));
 assert(!reduced.includes('data-intro-advice='));
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
