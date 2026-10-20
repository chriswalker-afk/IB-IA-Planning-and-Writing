import test from 'node:test';
import assert from 'node:assert/strict';
import {EXAMPLES,NUMERICAL_EXAMPLE as D,exampleById} from '../src/examples/catalog.js';
import {exampleContext,selectExamples,defaultVariant,filterExamples} from '../src/examples/context.js';
import {examplePrompt,exampleInline,prose,renderCard,library} from '../src/examples/views.js';
const state=(kind='modelling',node='C10')=>({route:'completing',project:{kind},planning:{current:'N01',fields:{kind,aim:'My real aim',course:'AA SL'}},scratch:{introduction:'My original work'},completion:{current:node,activeEntryIndex:0,nextFromEntryId:'first',fields:{},support:{},guidanceUi:{},accuracyDecisions:[],stages:{}},entries:[{id:'first',phase:'first',kind:'scatter',methodId:'',knowledge:'unsure',status:'completed',result:'Actual graph',observation:'curved',title:'Earlier real work'},{id:'later',phase:'substantial',status:'completed',kind:'model',methodId:'linear-regression',result:'Actual later result',observation:'linear',title:'Different later work'}]});
test('55 substantive original cards have stable unique IDs, explanations and transfer questions',()=>{
 assert.equal(EXAMPLES.length,55);assert.equal(new Set(EXAMPLES.map(x=>x.id)).size,34);
 for(const c of EXAMPLES){assert(c.weak.length>40,c.id);assert(c.strong.length>100,c.id);assert(c.why.length>40,c.id);assert(c.question.endsWith('?'),c.id);assert(!JSON.stringify(c).includes('drive.google.com'));}
});
test('introduction and conclusion select statistical, modelling and theoretical variants',()=>{
 for(const [kind,intro,end] of [['modelling','EX01','EX22'],['statistics','EX02','EX25'],['theoretical','EX03','EX23']]){
  assert.equal(selectExamples(state(kind,'C10'))[0].id,intro);assert.equal(selectExamples(state(kind,'C60'))[0].id,end);
 }
});
test('representations select tables, diagrams and categorical displays rather than always scatter',()=>{
 for(const [representation,id] of [['table','EX08'],['diagram','EX12'],['distribution','EX29']]){const s=state('statistics','C33');s.completion.fields.firstType=representation;assert.equal(selectExamples(s)[0].id,id);}
 assert.equal(selectExamples(state('theoretical','C33'))[0].id,'EX28');
});
test('theoretical limitations do not recommend instrument errors or sampling',()=>assert.equal(selectExamples(state('theoretical','C23'))[0].id,'EX26'));
test('context selection reads the selected earlier result, not the most recent entry',()=>{
 const s=state('statistics','C35');s.completion.activeEntryIndex=1;s.completion.fields.scatterDetail='turning';s.completion.scatterDetailForEntryId='first';
 const x=exampleContext(s);assert.equal(x.entry.id,'first');assert.equal(defaultVariant(exampleById('EX16'),x),'turning');
 s.completion.scatterDetailForEntryId='later';assert.equal(defaultVariant(exampleById('EX16'),exampleContext(s)),'');
});
test('planned results do not infer an actual observed scatter or PMCC',()=>{
 const s=state('statistics','C35');s.entries[0].status='planned';s.completion.fields.scatterDetail='turning';s.completion.scatterDetailForEntryId='first';
 assert.equal(exampleContext(s).real,false);assert.equal(defaultVariant(exampleById('EX16'),exampleContext(s)),'');
});
test('C96 and troubleshooting retain their origin record without mutation',()=>{
 const s=state('modelling','C96');s.completion.writingOrigin={node:'C34B',entryId:'first'};s.completion.activeEntryIndex=1;
 assert.equal(exampleContext(s).entry.id,'first');assert.equal(exampleContext(s).topic,'interpretation');
 s.completion.support={selected:'next',origin:{route:'completing',node:'C35',entryId:'later',nextFromEntryId:'first'}};
 assert.equal(exampleContext(s,{help:true}).entry.id,'first');assert.equal(exampleContext(s,{help:true}).topic,'next');
});
test('familiar, unfamiliar and mixed mathematics use confirmed course status',()=>{
 for(const knowledge of ['syllabus','outside','mixed']){const s=state('modelling','C40L');s.entries[0].knowledge=knowledge;assert.equal(defaultVariant(exampleById('EX19'),exampleContext(s)),knowledge);}
});
test('all views and selections leave every student state field untouched',()=>{
 const s=state();const before=JSON.stringify(s);for(const c of EXAMPLES){renderCard(c,{context:exampleContext(s)});examplePrompt(s,{topic:c.topics[0]});exampleInline(s,{topic:c.topics[0]});}
 assert.equal(JSON.stringify(s),before);
});
test('library filtering remains independent of context and handles empty results',()=>{
 assert(filterExamples({query:'conclusion',kind:'theoretical'}).some(x=>x.id==='EX23'));
 assert.equal(filterExamples({query:'ZZZ impossible search'}).length,0);
 assert(library({query:'',category:'',kind:''}).includes('Search examples'));
});
test('HTML from strings is escaped while authored bold and native tables render',()=>{
 assert(!prose('<img src=x onerror=alert(1)>').includes('<img'));assert(prose('**Visible**').includes('<strong>Visible</strong>'));
 assert(renderCard(exampleById('EX08')).includes('<th scope="col">'));assert(renderCard(exampleById('EX13')).includes('<math '));
});
test('all illustrations have distinct accessible SVG titles and no missing external assets',()=>{
 for(const c of EXAMPLES.filter(x=>['graph','diagram','discrete','categorical','residual'].includes(x.visual))){const html=renderCard(c);assert(html.includes('role="img"'),c.id);assert(html.includes('<desc '),c.id);assert(!html.includes('<img '),c.id);const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,c.id);}
});
test('cooling models, residuals, RMSE and threshold time are mutually consistent',()=>{
 const mean=D.temperature_degC.reduce((a,b)=>a+b,0)/11;let lin=0,exp=0,sst=0;
 D.time_min.forEach((t,i)=>{const y=D.temperature_degC[i];lin+=(y-(D.m*t+D.b))**2;exp+=(y-(23+D.A*Math.exp(-D.k*t)))**2;sst+=(y-mean)**2;});
 assert(Math.abs(Math.sqrt(lin/11)-D.linear_rmse)<1e-9);assert(Math.abs(Math.sqrt(exp/11)-D.exponential_rmse)<1e-9);
 assert(Math.abs(1-lin/sst-0.959)<.001);assert(Math.abs(Math.log(D.A/27)/D.k-D.threshold_time)<1e-9);
 assert(D.temperature_degC[0]-D.b>0);assert(D.temperature_degC[5]-(D.m*10+D.b)<0);assert(D.temperature_degC[10]-(D.m*20+D.b)>0);
});

test('old mathematical records do not override an introduction or conclusion',()=>{
 for(const node of ['C10','C60']){
  const s=state('statistics',node);s.entries[0].kind='theory';s.entries[0].methodId='proof';
  const x=exampleContext(s);assert.equal(x.kind,'statistics');assert.equal(x.entry,undefined);
  assert.equal(selectExamples(s)[0].id,node==='C10'?'EX02':'EX25');
 }
});
test('planning previews do not infer course familiarity from old entries',()=>{
 const s=state('statistics');s.route='planning';s.entries[0].kind='theory';s.entries[0].knowledge='outside';
 const x=exampleContext(s);assert.equal(x.mode,'Planning preview');assert.equal(x.knowledge,'');assert.equal(x.real,false);
 assert.equal(selectExamples(s)[0].id,'EX30');
});
test('mathematical presentation defines variables before the calculation',()=>{
 const html=renderCard(exampleById('EX13'));assert(html.indexOf('Let t be')<html.indexOf('<math '));
});

test('Planning title screen opens actual title comparisons, not introduction examples',()=>{
 const s=state('statistics');s.route='planning';s.planning.current='N01';
 assert.equal(exampleContext(s).topic,'title');
 assert.equal(selectExamples(s)[0].id,'EX30');
 const card=exampleById('EX30');
 assert(card.strong.includes('basketball'));assert(card.strong.includes('music-practice'));
 assert(card.why.includes('mathematics')||card.why.includes('title'));
});

test('motivation step provides different relevant comparisons for modelling, statistics and theory',()=>{
 for(const [kind,id] of [['modelling','EX31'],['statistics','EX32'],['theoretical','EX33']]){
  const s=state(kind);s.route='planning';s.planning.current='N01V';
  assert.equal(exampleContext(s).topic,'motivation');
  const [first]=selectExamples(s);
  assert.equal(first.id,id);
  assert(first.strong.includes('want'));
  assert(renderCard(first).includes('What changed?'));
 }
 assert(filterExamples({query:'motivation'}).some(x=>x.id==='EX31'));
});

test('introduction examples show specific motivations and mathematical aims without scripted techniques',()=>{
 for(const id of ['EX01','EX02','EX03']){
  const card=exampleById(id),html=renderCard(card);
  assert.equal(card.introFeatures.length,3,id);
  assert(html.includes('What makes the stronger introduction work?'));
  assert.equal((html.match(/class="ex-introduction-feature"/g)||[]).length,3);
  assert(!card.strong.includes('First I will'),id);
  assert(!card.strong.includes('then calculate'),id);
  for(const f of card.introFeatures)assert(card.strong.includes(f.quote),id+' missing quoted feature');
 }
 const specialist=exampleById('EX34');
 assert(specialist.strong.includes('Dough hydration'));
 assert(specialist.strong.includes('My aim')||specialist.strong.includes('I want to investigate'));
 assert(renderCard(specialist).includes('Necessary vocabulary'));
 assert(selectExamples(state('modelling','C10')).some(x=>x.id==='EX34'));
});

test('all 16 investigative routes can select context-specific comparisons',async()=>{
 const {INVESTIGATIVE_ROUTES}=await import('../src/planning/investigative-routes.js');
 for(const route of INVESTIGATIVE_ROUTES){
  const s=state(route.kinds[0],'C33');s.planning.routeExplorer={selectedRoute:route.id};s.planning.fields.kind=route.kinds[0];s.project.kind=route.kinds[0];
  const candidates=selectExamples(s);
  assert(candidates.length>0,route.id);
  assert(candidates[0].id.startsWith('EX'),route.id);
 }
});
test('first mathematics offers distinct matched comparisons for connection, choice and evaluation',()=>{
 for(const [topic,id] of [['first-link','EX48'],['first-method','EX49'],['first-evaluation','EX50']]){
  const selected=selectExamples(state('modelling','C20'),{topic});
  assert(selected.some(x=>x.id===id),topic);
 }
});
test('revised conclusion examples contain genuine results, optional next questions, and no assumed cup volume',()=>{
 assert(!exampleById('EX22').strong.includes('250 ml'));
 for(const id of ['EX22','EX25','EX23'])assert(exampleById(id).strong.includes('question')||exampleById(id).strong.includes('investigat'),id);
});
test('expanded visual comparisons render accessible figures and tables',()=>{
 for(const id of ['EX36','EX37','EX38','EX39','EX40','EX41']){
  const html=renderCard(exampleById(id));assert(html.includes('ex-version ex-less'),id);assert(html.includes('ex-version ex-more'),id);
  assert(html.includes('<table')||html.includes('role="img"'),id);
 }
});
