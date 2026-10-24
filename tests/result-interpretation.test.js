import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createProjectState,normalizeProjectState} from '../src/core/project-state.js';
import {METHOD_OPTIONS} from '../src/completing/guidance-context.js';
import {INVESTIGATIVE_ROUTES} from '../src/planning/investigative-routes.js';
import {journeyOutcomeOptions} from '../src/completing/adaptive-journey.js';
import {createCompletingViews} from '../src/completing/views.js';
import {renderSparkShelf,insightItems} from '../src/ui/insight-threads.js';
import {setCompletionNode} from '../src/completing/engine.js';
import {TECHNIQUE_INTERPRETATIONS,ROUTE_INTERPRETATIONS,resultInterpretationGuidance,
 renderResultInterpretationAid} from '../src/completing/result-interpretation.js';

const sample=(method='pmcc')=>{
 const s=createProjectState();
 s.planning.fields.aim='How does travel time relate to distance?';
 s.planning.routeExplorer.selectedRoute='relationships';
 s.entries=[{id:'math-one',phase:'first',status:'completed',methodId:method,
  title:'Interpreting my mathematics',result:'r = 0.78',
  purpose:'Explore the association before deciding whether predictions are useful'}];
 s.completion.activeEntryIndex=0;
 return s;
};
const e=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const icon=()=>'<span class="icon"></span>';

test('each selectable confirmed method has a genuinely dedicated interpretation guide',()=>{
 const s=sample();
 const used=METHOD_OPTIONS.map(x=>x[0]).filter(id=>!['','follow-journey','other'].includes(id));
 assert(used.length>=24);
 for(const id of used){
  s.entries[0].methodId=id;
  const g=resultInterpretationGuidance(s,s.entries[0]);
  assert.equal(g.key,id,'no unrelated method may replace '+id);
  assert.equal(g.origin,'method');
  assert(g.title.length>8,id+' needs a clear method title');
  for(const key of ['meaning','context','boundary','check'])
   assert(g[key].length>36,id+' needs substantive '+key);
  assert(g.boundary!==g.context,id+' must distinguish meaning from scope');
 }
 assert(Object.keys(TECHNIQUE_INTERPRETATIONS).includes('scatter'));
});

test('all 16 investigative pathways give route-specific questions only after real results',()=>{
 const s=sample('');
 for(const route of INVESTIGATIVE_ROUTES){
  s.planning.routeExplorer.selectedRoute=route.id;
  s.entries[0].methodId='';s.entries[0].kind='';
  const g=resultInterpretationGuidance(s,s.entries[0]);
  assert.equal(g.key,route.id);
  assert.equal(g.origin,'planned-route');
  assert(ROUTE_INTERPRETATIONS[route.id],route.id);
  const ui=renderResultInterpretationAid(s,s.entries[0],{icon,e});
  assert(ui.includes('planned route'));
  assert(!ui.includes('was used to calculate'));
 }
 s.planning.fields.kind='theoretical';
 s.planning.routeExplorer.selectedRoute='relationships';
 assert.equal(resultInterpretationGuidance(s,s.entries[0]).key,'general',
  'an incompatible old planning route must not decide the current interpretation');
 s.entries[0].status='planned';
 assert.equal(resultInterpretationGuidance(s,s.entries[0]),null);
 assert.equal(renderResultInterpretationAid(s,s.entries[0],{icon,e}),'');
});

test('method identity outranks the original route, but Other never guesses the technique from text',()=>{
 const s=sample('optimisation');
 assert.equal(resultInterpretationGuidance(s,s.entries[0]).key,'optimisation');
 s.entries[0].methodId='other';
 s.entries[0].title='Strong PMCC';
 s.entries[0].result='Pearson r = 0.96';
 let g=resultInterpretationGuidance(s,s.entries[0]);
 assert.equal(g.key,'general');
 assert(!g.meaning.includes('linear association'));
 s.entries[0].methodId='';
 s.entries[0].kind='scatter';
 g=resultInterpretationGuidance(s,s.entries[0]);
 assert.equal(g.key,'scatter');
 assert(!g.meaning.includes('r:'));
});

test('the interpretation stays anchored to the recorded aim, output and mathematical purpose',()=>{
 const s=sample('linear-regression');
 const before=JSON.stringify(s);
 const g=resultInterpretationGuidance(s,s.entries[0]);
 assert.equal(g.aim,s.planning.fields.aim);
 assert.equal(g.result,'r = 0.78');
 assert.equal(g.purpose,s.entries[0].purpose);
 assert.match(g.meaning,/gradient/);
 assert.match(g.boundary,/extrapolation/);
 const html=renderResultInterpretationAid(s,s.entries[0],{icon,e,reduced:true});
 for(const text of [g.aim,g.result,g.purpose,'What the mathematics tells you','What this result does not establish'])
  assert(html.includes(text),text);
 assert(html.includes('data-insight-source="result:math-one"'));
 assert(html.includes('is-reduced'));
 assert(html.includes('<details'));
 assert(!html.includes('<details open'));
 assert.equal(JSON.stringify(s),before);
});

test('selected outcome personalises mathematical cautions without inferring an outcome',()=>{
 const s=sample('pmcc');
 s.planning.routeExplorer.selectedRoute='relationships';
 let g=resultInterpretationGuidance(s,s.entries[0]);
 assert.equal(g.selected,null);
 const option=journeyOutcomeOptions(s,s.entries[0]).find(x=>x.id!=='uncertain');
 assert(option);
 s.entries[0].journeyOutcome=option.value;
 g=resultInterpretationGuidance(s,s.entries[0]);
 assert.deepEqual(g.selected,{title:option.title,check:option.check});
 let html=renderResultInterpretationAid(s,s.entries[0],{icon,e});
 assert(html.includes(option.title));
 assert(html.includes(option.check));
 s.entries[0].reviewNeeded='yes';
 g=resultInterpretationGuidance(s,s.entries[0]);
 assert.equal(g.selected,null);
 html=renderResultInterpretationAid(s,s.entries[0],{icon,e});
 assert(html.includes('needs review'));
 assert(!html.includes('Your selected description of this finding'));
});

test('legacy mathematical outcome decisions also support interpretation without an invented branch',()=>{
 const s=sample('pmcc');
 const entry=s.entries[0];
 entry.kind='scatter';
 entry.observation='curved';
 entry.resultSignal='weak-linear';
 let g=resultInterpretationGuidance(s,entry);
 assert(g.selected&&g.selected.title.includes('curved graph'));
 assert.match(g.selected.check,/nonlinear|small|model/i);
 entry.resultSignal='';
 entry.observation='';
 g=resultInterpretationGuidance(s,entry);
 assert.equal(g.selected,null);
 entry.reviewNeeded='yes';entry.resultSignal='weak-linear';
 g=resultInterpretationGuidance(s,entry);
 assert.equal(g.selected,null);
});

test('the interpretation aid escapes unsafe text, preserves saved projects, and invents no result',()=>{
 const s=sample('proof');
 s.entries[0].result='<img src=x onerror="alert(1)">';
 s.planning.fields.aim='<svg onload=alert(1)>';
 const before=JSON.stringify(s);
 const html=renderResultInterpretationAid(s,s.entries[0],{icon,e});
 assert(!html.includes('<img'));
 assert(!html.includes('<svg'));
 assert(html.includes('&lt;img'));
 assert(html.includes('&lt;svg'));
 assert.equal(JSON.stringify(s),before);
 const restored=normalizeProjectState(JSON.parse(before));
 assert.equal(resultInterpretationGuidance(restored,restored.entries[0]).key,'proof');
 s.entries[0].result='';
 assert.equal(resultInterpretationGuidance(s,s.entries[0]),null);
});

function viewFixture(){
 const state=sample('pmcc');
 const ctx={getState:()=>state,e,icon,
  button:(label,action)=>'<button data-action="'+action+'">'+e(label)+'</button>',
  field:(path,label,hint='')=>'<label data-path="'+e(path)+'" data-hint="'+e(hint)+'">'+e(label)+'</label>',
  choose:(path,options)=>'<div data-choice-path="'+e(path)+'">'+options.map(x=>e(x.title)).join(',')+'</div>',
  summary:(label,value)=>'<p>'+e(label)+': '+e(value)+'</p>',
  sheetTitle:(_,title)=>'<h1>'+e(title)+'</h1>',tabletNav:()=>'',filled:x=>typeof x==='string'&&!!x.trim()
 };
 return {state,views:createCompletingViews(ctx)};
}
test('interpretation Insights appear at the first and later mathematical reflection tasks',()=>{
 const {state,views}=viewFixture();
 setCompletionNode(state,'C30');
 let html=views.viewCompleting();
 assert(html.includes('data-result-interpretation="pmcc"'));
 assert(html.includes('Help interpret: Pearson'));
 assert(html.indexOf('data-result-interpretation="pmcc"')<html.lastIndexOf('My reflection on what this result means'));
 state.entries.push({id:'math-two',phase:'substantial',fromEntryId:'math-one',
  status:'completed',methodId:'optimisation',result:'Feasible stationary point',
  purpose:'Find the best feasible value'});
 state.completion.activeEntryIndex=1;
 setCompletionNode(state,'C40');
 html=views.viewCompleting();
 assert(html.includes('data-result-interpretation="optimisation"'));
 assert(html.includes('stationary point as a candidate'));
 assert(html.includes('How does travel time relate to distance?'));
 assert(!html.includes('data-result-interpretation="pmcc"'));
 setCompletionNode(state,'C50');html=views.viewCompleting();
 assert(html.includes('data-result-interpretation="optimisation"'),
  'a later mathematical stage must retain the same focused interpretation');
 state.ui.adviceMode='reduced';
 html=views.viewCompleting();
 assert(html.includes('data-result-interpretation="optimisation"'));
 assert(html.includes('is-reduced'));
});

test('the optional mathematical reading support does not replace the existing criteria and help',()=>{
 const {state,views}=viewFixture();
 for(const node of ['C34B','C35P']){
  setCompletionNode(state,node);
  const html=views.viewCompleting();
  assert(html.includes('data-result-interpretation="pmcc"'),node);
  assert(html.includes('What does this')||html.includes('What value or finding'),node);
 }
 const css=readFileSync(new URL('../data/spark-shelf.css',import.meta.url),'utf8');
 for(const key of ['.result-interpretation-disclosure','summary:focus-visible','@media(max-width:650px)','prefers-reduced-motion:reduce'])
  assert(css.includes(key),key);
});

test('saved Discovery Sparks recall the same mathematical interpretation without new storage',()=>{
 const s=sample('linear-regression'),before=JSON.stringify(s);
 const shelf=renderSparkShelf(s,'C34B',{surface:'studio'});
 assert(shelf.includes('data-spark-reading="linear-regression"'));
 assert(shelf.includes('gradient'));
 assert(shelf.includes('extrapolation'));
 assert(shelf.includes('data-spark-id="result:math-one"'));
 assert.equal(JSON.stringify(s),before);
 const spark=insightItems(s).find(x=>x.id==='result:math-one');
 assert(spark&&spark.value==='r = 0.78');
 s.entries[0].status='planned';
 assert(!renderSparkShelf(s,'C34B',{surface:'studio'}).includes('data-spark-reading="linear-regression"'));
});
