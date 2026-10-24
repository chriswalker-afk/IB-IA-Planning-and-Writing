import test from 'node:test';
import assert from 'node:assert/strict';
import {createProjectState} from '../src/core/project-state.js';
import {readFileSync} from 'node:fs';
import {escapeHtml,icon} from '../src/ui/primitives.js';
import {isStudioWritingNode,renderStudioWritingStage,STUDIO_WRITING_GROUPS,STUDIO_WRITING_NODES} from '../src/completing/studio-writing-stages.js';
import {renderSparkShelf} from '../src/ui/insight-threads.js';
import {writerStageAdviceBundle} from '../src/completing/writer-stage-advice.js';
const make=()=>{
 const s=createProjectState();s.route='completing';s.completion.current='C20';
 s.planning.fields.aim='Does the amount of dough affect volume?';
 s.planning.fields.motivation='I wanted to explore a real pattern.';
 s.planning.fields.prediction='I expect an increase';
 return s;
};
const stage=(s,node,opts={})=>renderStudioWritingStage(s,node,{
 icon,e:escapeHtml,taskHtml:'<textarea data-bind="completion.fields.exampleNote"></textarea>',
 taskIntro:'Only describe real evidence and mathematics',...opts
});
test('four-part layout is consistently present through all three writing sections',()=>{
 const keys=Object.keys(STUDIO_WRITING_GROUPS);
 assert.deepEqual(keys,['data','maths','conclusion']);
 assert.equal(STUDIO_WRITING_NODES.length,31);
 assert.equal(new Set(STUDIO_WRITING_NODES).size,31);
 const s=make(),before=JSON.stringify(s);
 for(const [group,nodes] of Object.entries(STUDIO_WRITING_GROUPS)){
  for(const node of nodes){
   const html=stage(s,node);
   const sections=node==='C60'?['advice','task','examples']:['advice','sparks','task','examples'];
   const order=sections.map(k=>html.indexOf('data-writing-stage-part="'+k+'"'));
   assert(order.every(x=>x>=0),node+' missing one part');
   assert(order.every((x,i)=>i===0||x>order[i-1]),node+' not logically ordered');
   assert(html.includes('data-stage-advice="'+group+'"'),node);
   assert(html.includes('data-writing-examples'),node);
   assert(html.includes('data-example-topic='),node);
   assert(html.includes('actual IA document'),node);
   assert(html.includes('data-bind="completion.fields.exampleNote"'),node);
   assert(!html.includes('Why this matters in the criteria'),node);
   assert.equal((html.match(/data-writing-examples/g)||[]).length,1,node);
  }
 }
 assert.equal(JSON.stringify(s),before,'read-only writing views must not change student planning or results');
 assert(!isStudioWritingNode('C10'));assert(!isStudioWritingNode('C80'));
});
test('IA writing reminder keeps its heading and explanation together for all 31 writing stages',()=>{
 const state=make(),before=JSON.stringify(state);
 for(const node of STUDIO_WRITING_NODES){
  const html=stage(state,node);
  assert.equal((html.match(/class="studio-stage-writing-location" role="note"/g)||[]).length,1,node);
  assert(html.includes('<div class="studio-stage-writing-location-copy"><strong>Write in your actual IA document</strong><p>'),node);
  assert(node==='C60'?html.includes('No text is inserted into your IA automatically.'):html.includes('nothing is inserted into your IA automatically.'),node);
  assert(!html.includes('<p class="studio-stage-writing-location">'),node);
 }
 const css=readFileSync(new URL('../data/chapter-onboarding.css',import.meta.url),'utf8');
 assert(css.includes('grid-template-columns:19px minmax(0,1fr)'),"reminder icon and copy must use distinct grid columns");
 assert(css.includes('.studio-stage-writing-location-copy{min-width:0'),"copy should shrink safely at phone widths");
 assert(css.includes('.studio-stage-writing-location-copy p'),"paragraph should be rendered as one block");
 assert.equal(JSON.stringify(state),before,"layout must not change saved student work");
});
test('all writing stages preserve four or six original lessons in pop-ins while the page stays task-focused',()=>{
 const s=make();
 for(const node of ['C20','C30','C40','C50','C60']){
  const html=stage(s,node);
  assert(!html.includes('data-studio-tip='),node);
  assert(!html.includes('data-first-maths-tip='),node);
  assert(!html.includes('studio-stage-advice-cards'),node);
  assert(html.includes('writer-guide-inline-more'),node);
  assert(writerStageAdviceBundle(s,node)?.items.length===4,node);
 }
 for(const node of ['C21S','C24','C32','C34B','C61','C64']){
  const html=stage(s,node);
  assert(html.includes('One thing to keep in mind')||node==='C61',node);
  assert(html.includes('data-guide-scope="stage"'),node);
  assert.equal(writerStageAdviceBundle(s,node)?.items.length,4,node);
 }
 for(const node of ['C20','C30','C60']){
  const html=stage(s,node,{reduced:true});
  assert(html.includes('data-advice-mode="reduced"'),node);
  assert(html.includes('data-writing-stage-part="task"'),node);
  assert(!html.includes('data-writing-stage-part="advice"'),node);
  assert(!html.includes('data-writing-examples'),node);
  assert(!html.includes('writer-guide-inline-more'),node);
  if(node==='C30')assert(html.includes('Show real mathematics, label figures and units clearly'),node);
 }
});
test('reduced mode is task-first throughout every writing stage, without losing sparks or task fields',()=>{
 const s=make(),before=JSON.stringify(s);
 for(const node of STUDIO_WRITING_NODES){
  const full=stage(s,node),compact=stage(s,node,{reduced:true});
  assert(compact.includes('data-writing-stage-flow data-advice-mode="reduced"'),node);
  assert(compact.includes('data-writing-stage-part="task"'),node);
  assert(!compact.includes('data-writing-stage-part="advice"'),node);
  assert(!compact.includes('data-writing-stage-part="examples"'),node);
  assert(!compact.includes('data-writing-examples'),node);
  assert(!compact.includes('studio-stage-advice-head'),node);
  assert(!compact.includes('writer-guide-inline-more'),node);
  assert(compact.includes('data-bind="completion.fields.exampleNote"'),node);
  if(node==="C20"||node==="C30"){
   assert(compact.includes('Your saved aim'),node);
   assert(compact.includes('Does the amount of dough affect volume?'),node);
  }
  assert(compact.includes('nothing is inserted into your IA automatically.'),node);
  assert(compact.length<full.length,node+' did not become smaller');
  const task=compact.indexOf('data-writing-stage-part="task"');
  const spark=compact.indexOf('data-writing-stage-part="sparks"');
  if(node==='C60'){
   assert.equal(spark,-1,'Conclusion has no supplementary sparks section');
  }else{
   assert(spark>task,'Saved mathematical context should come AFTER the task');
   assert(compact.includes('data-reduced-saved-context'),node);
   assert(compact.includes('<details class="writing-stage-reduced-reference"'),node);
  }
 }
 assert.equal(JSON.stringify(s),before,'Switching advice mode never changes students\' evidence, notes or saved mathematical stages');
});
test('Data guidance about honest evidence remains intact in pop-ins, and theoretical work remains valid',()=>{
 const s=make();
 const empirical=stage(s,'C20');
 assert(empirical.includes('Four practical first-mathematics writing tips'));
 const exact=writerStageAdviceBundle(s,'C20');
 assert(exact.items.some(t=>t.title==='Your plan is not your result'));
 assert(exact.items.some(t=>t.title==='Get to the mathematics'));
 assert(exact.items.some(t=>t.title==='Connect your first step to your aim'));
 const theoretical=stage(s,'C21T');
 assert(theoretical.includes('data-example-topic="proof"'));
 assert(theoretical.includes('theoretical starting point'));
 assert(writerStageAdviceBundle(s,'C21T').items.some(t=>t.detail.includes('pretend data')));
});
test('Mathematical interpretation and a concise honest conclusion keep their support without duplicating cards',()=>{
 const s=make();
 const math=stage(s,'C40');
 assert(math.includes('data-example-topic="calculation"'));
 assert(math.includes('Four')||math.includes('four writing tips'));
 const mathsTips=writerStageAdviceBundle(s,'C40').items;
 assert(mathsTips.some(t=>t.detail.includes('no quota')));
 assert(mathsTips.some(t=>/residuals|pattern in the errors/.test(t.strong)));
 const conclusion=stage(s,'C60');
 assert(conclusion.includes('real results'));
 assert(conclusion.includes('Answer · support · qualify'));
 assert(conclusion.includes('four writing tips'));
 assert(conclusion.includes('data-example-topic="conclusion"'));
 const conclusionTips=writerStageAdviceBundle(s,'C60').items;
 assert(conclusionTips.some(t=>t.detail.includes('prediction')||t.weak.includes('prediction')),'Prediction advice remains in the Field Guide rather than a duplicate page card');
 assert(conclusionTips.some(t=>t.title==='Answer your aim'));
 assert(conclusionTips.some(t=>t.detail.includes('future mathematical question')));
});
test('sparks contain only saved grounded ideas; no invented actual result is promoted',()=>{
 const s=make();
 s.planning.fields.primaryWhat='Measure a possible future variable';
 let html=stage(s,'C20');
 assert(html.includes('Does the amount of dough affect volume?'));
 assert(html.includes('These are your choices, brought back when they can help'));
 assert(html.includes('data-spark-library'));
 assert(!html.includes('Your sparks are back'),'stage header avoids a second spark heading');
  s.completion.current='C60';
 const untouched=JSON.stringify(s);
 html=stage(s,'C60');
 assert(!html.includes('data-writing-stage-part="sparks"'),"Conclusion uses its single workspace for saved context instead of another large panel");
 assert.equal(JSON.stringify(s),untouched);
});
test('extra mathematical help remains available but not forced into the main flow',()=>{
 const s=make();
 const html=stage(s,'C34',{help:'EXISTING_HELP_AND_WRITING_LEDGER'});
 assert(html.includes('EXISTING_HELP_AND_WRITING_LEDGER'));
 assert(html.includes('studio-stage-more-help'));
 assert(html.indexOf('EXISTING_HELP_AND_WRITING_LEDGER')>html.indexOf('data-writing-stage-part="examples"'));
 assert(!html.includes('EXISTING_HELP_AND_WRITING_LEDGER</section>'));
});
test('user-supplied saved sparks render as escaped text rather than executable HTML',()=>{
 const s=make();s.planning.fields.aim='<img src=x onerror=alert(1)>';
 const html=stage(s,'C20');
 assert(html.includes('&lt;img'));
 assert(!html.includes('<img'));
});
