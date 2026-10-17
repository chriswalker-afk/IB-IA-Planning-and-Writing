import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createProjectState,normalizeProjectState} from '../src/core/project-state.js';
import {applyPlanningField,planAutoAdvance} from '../src/planning/engine.js';
import {
 SAMPLING_METHODS,samplingMethod,plannedAccuracyText,savePlannedAccuracy,removePlannedAccuracy,
 editPlannedAccuracy,normalizePlanningAccuracy,samplingSparkValue
} from '../src/planning/data-decisions.js';
import {insightItems,insightForCurrent,insightCapture,insightMeaning} from '../src/ui/insight-threads.js';
import {createPlanningViews} from '../src/ui/planning-views.js';
import {createPlanningEnvelope,normalizePlanningEnvelope,getFieldDiff,mergePlanningEnvelope} from '../src/handover/schema.js';
import {modelFromEnvelope} from '../src/handover/report-model.js';

const s=()=>{const x=createProjectState();x.route='planning';x.planning.current='N03P';x.planning.fields.kind='statistics';x.planning.fields.course='AI SL';return x;};
const lastStep=()=>{const x=s();x.planning.current='N03P3';return x;};
const set=(state,key,value)=>assert(applyPlanningField(state,key,value));
const escape=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const render=state=>{
 const ctx={getState:()=>state,e:escape,icon:()=>'',button:()=>'',field:(p,label)=>'<label data-path="'+p+'">'+label+'</label>',
  choose:()=>'',numberPick:()=>'',note:()=>'',summary:()=>'',helpButton:()=>'',helpBox:()=>'',tabletNav:()=>''};
 return createPlanningViews(ctx).viewPlanning();
};
const save=(state,source,quantity,unit,basis,resolution,uncertainty='')=>{
 for(const [key,v] of Object.entries({
  [source+'AccuracyQuantity']:quantity,[source+'AccuracyUnit']:unit,[source+'AccuracyBasis']:basis,
  [source+'AccuracyResolution']:resolution,[source+'AccuracyUncertainty']:uncertainty
 }))set(state,key,v);
 return savePlannedAccuracy(state,source);
};
test('census, five probability approaches, convenience, voluntary and not applicable have useful pros/cons',()=>{
 assert.equal(SAMPLING_METHODS.length,9);
 assert.equal(new Set(SAMPLING_METHODS.map(x=>x.id)).size,9);
 for(const m of SAMPLING_METHODS){assert(m.label&&m.good.length>30&&m.watch.length>30&&m.use.length>30);}
 assert(samplingMethod('census').good.includes('No sampling variation'));
 assert(samplingMethod('simple-random').watch.includes('frame'));
 assert(samplingMethod('convenience').watch.includes('not representative'));
 assert(samplingMethod('voluntary').watch.includes('choose to respond'));
 assert.equal(samplingMethod('invalid'),null);
});
test('students choose a sampling approach before a statistical primary route can be marked as addressed',()=>{
 const x=lastStep();set(x,'primaryStatus','ready');
 assert(!planAutoAdvance(x).ok);
 set(x,'primarySamplingMethod','unsure');
 assert(!planAutoAdvance(x).ok);
 set(x,'primaryStatus','unsure');
 assert(planAutoAdvance(x).ok);
 const ready=lastStep();set(ready,'primarySamplingMethod','simple-random');set(ready,'primaryStatus','ready');
 assert(!planAutoAdvance(ready).ok);
 set(ready,'primaryPopulation','Students in Year 12');
 set(ready,'primarySamplingUnit','One student');
 assert(!planAutoAdvance(ready).ok);
 set(ready,'primaryWhat','Reaction time in seconds');
 set(ready,'primaryHow','Use a calibrated stopwatch for each participant');
 set(ready,'primarySamplingFrame','no');
 set(ready,'primaryRepeatable','yes');
 assert(!planAutoAdvance(ready).ok); // a random sample cannot proceed without a suitable frame
 set(ready,'primarySamplingFrame','yes');
 assert(!planAutoAdvance(ready).ok); // requires a stated recording increment
 assert(save(ready,'primary','Reaction time','s','digital','nearest 0.01 s').ok);
 assert(planAutoAdvance(ready).ok);
 assert.equal(ready.evidence.sources.length,0);
 const model=lastStep();model.planning.fields.kind='modelling';set(model,'primaryStatus','unsure');
 assert(planAutoAdvance(model).ok);
});
test('the sampling plan saves actual student choices and does not claim representativeness',()=>{
 const x=s();x.planning.current='N03P2';
 for(const [key,v] of Object.entries({
  primarySamplingMethod:'convenience',primaryPopulation:'Accessible club members',
  primarySamplingUnit:'One member',primarySamplingFrame:'no',
  primarySamplingFrameDetails:'No complete club membership list',
  primaryRepeatable:'yes',primarySampling:'Quick to start and feasible follow up'
 }))set(x,key,v);
 assert(samplingSparkValue(x.planning.fields).includes('Accessible club members'));
 const items=insightItems(x);
 const spark=items.find(t=>t.id==='sampling-plan');
 assert(spark&&spark.planned&&spark.type==='sampling');
 assert(insightForCurrent(x,'C21S').some(v=>v.id==='sampling-plan'));
 assert(insightMeaning(x,'C21S',spark).includes('Convenience'));
 assert(insightCapture(x,'N03P2').includes('Spark saved'));
 assert(render(x).includes('Sampling spark saved'));
 assert(render(x).includes('Your chosen method normally needs')===false);
});
test('primary and published-source accuracy can be saved for multiple quantities without fictional uncertainty',()=>{
 const x=s();
 let result=save(x,'primary','Height','cm','analogue','nearest 0.1 cm');
 assert(result.ok);assert.equal(x.planning.accuracyPlans.length,1);
 assert.equal(x.planning.accuracyPlans[0].uncertainty,'');
 assert(plannedAccuracyText(x.planning.accuracyPlans[0]).includes('nearest 0.1 cm'));
 assert(save(x,'primary','Time','s','digital','nearest 0.01 s','Manufacturer ±0.04 s').ok);
 assert(save(x,'secondary','Published mean rainfall','mm','rounded','nearest 1 mm').ok);
 assert(save(x,'secondary','Number of households','','exact','').ok);
 assert.equal(x.planning.accuracyPlans.length,4);
 assert.deepEqual(x.planning.mathSelected,[]);
 assert.equal(x.completion.accuracyDecisions.length,0);
 assert.equal(x.evidence.accuracyDecisions.length,0);
 const planned=insightItems(x).filter(t=>t.id.startsWith('planned-accuracy:'));
 assert.equal(planned.length,4);
 assert(planned.every(t=>t.planned));
 assert(insightForCurrent(x,'C24').some(t=>t.id.startsWith('planned-accuracy:')));
 assert(insightForCurrent(x,'C34').some(t=>t.id.startsWith('planned-accuracy:')));
 assert(!insightItems(x).some(t=>t.id.startsWith('accuracy:')));
 x.planning.current='N03S';
 assert(render(x).includes('Published mean rainfall'));
 assert(render(x).includes('Original resolution or published rounding'));
});
test('edit and remove work on exact record identity even when quantity changes',()=>{
 const x=s();
 assert(save(x,'primary','Mass','g','digital','nearest 1 g').ok);
 const first=x.planning.accuracyPlans[0].id;
 assert.equal(editPlannedAccuracy(x,first),'primary');
 assert.equal(x.planning.accuracyEditId,first);
 set(x,'primaryAccuracyQuantity','Object mass');
 const edited=savePlannedAccuracy(x,'primary');
 assert(edited.ok&&edited.updated);
 assert.equal(x.planning.accuracyPlans.length,1);
 assert.equal(x.planning.accuracyPlans[0].id,first);
 assert.equal(x.planning.accuracyPlans[0].quantity,'Object mass');
 assert.equal(x.planning.accuracyEditId,'');
 assert(save(x,'primary','Temperature','°C','digital','nearest 0.1 °C').ok);
 assert.equal(editPlannedAccuracy(x,first),'primary');
 set(x,'primaryAccuracyQuantity','Temperature');
 assert.equal(savePlannedAccuracy(x,'primary').ok,false); // never silently overwrites another record
 assert(removePlannedAccuracy(x,first));
 assert.equal(x.planning.accuracyPlans.length,1);
 assert(!removePlannedAccuracy(x,first));
});
test('recording unknown precision creates an honest spark, not a falsely ready plan',()=>{
 const x=lastStep();
 set(x,'primaryStatus','ready');
 set(x,'primaryWhat','Height in metres');
 set(x,'primaryHow','Record readings from measuring equipment');
 set(x,'primarySamplingMethod','convenience');
 set(x,'primarySamplingUnit','One person');
 set(x,'primaryPopulation','Accessible Year 12 pupils');
 set(x,'primarySamplingFrame','no');
 set(x,'primaryRepeatable','maybe');
 assert(save(x,'primary','Height','m','unknown','').ok);
 assert(!planAutoAdvance(x).ok);
 set(x,'primaryStatus','unsure');
 assert(planAutoAdvance(x).ok);
});
test('incomplete degree-of-accuracy drafts are not saved; unknown and exact are legitimate',()=>{
 const x=s();
 let r=save(x,'primary','Length','m','digital','');
 assert(!r.ok&&r.error.includes('increment'));
 assert.equal(x.planning.accuracyPlans.length,0);
 assert(save(x,'primary','Length','m','unknown','').ok);
 assert(save(x,'secondary','A category','','exact','').ok);
 assert(x.planning.accuracyPlans.every(item=>item.basis==='unknown'||item.basis==='exact'));
 const sanitized=normalizePlanningAccuracy([
  {source:'secondary',quantity:'Observations',basis:'unknown'},
  {source:'secondary',quantity:'observations',resolution:'FORGED'},
  {source:'wrong',quantity:'Not valid'},
  {source:'primary',quantity:'<script>alert(1)</script>',basis:'invalid',id:'../../escape'}]);
 assert.equal(sanitized.length,2);
 assert(sanitized[1].id.startsWith('pa-primary-'));
 assert.equal(sanitized[1].basis,'unknown');
 const ss=lastStep();
 ss.planning.accuracyPlans=sanitized;
 assert(!render(ss).includes('<script>'));
});
test('primary data is split into three focused screens, with optional help on steps two and three',()=>{
 const x=s();
 let html=render(x);
 for(const term of ['What data will I collect?','Step 1 of 3','What will you record?','primaryQuantityName','Add quantity'])
  assert(html.includes(term),term);
 assert(!html.includes('Sampling and census: quick recap'));
 assert(!html.includes('data-action="plan-save-accuracy"'));
 x.planning.current='N03P2';set(x,'primarySamplingMethod','simple-random');set(x,'primarySamplingFrame','no');
 html=render(x);
 for(const term of ['How will I choose my data?','Step 2 of 3','sampling approach',
  'Sampling and census: quick recap','Could you start quickly',
  'This method normally needs a suitable sampling frame'])
  assert(html.includes(term),term);
 assert(!html.includes('data-action="plan-save-accuracy"'));
 x.planning.current='N03P3';
 html=render(x);
 for(const term of ['How will I collect it accurately?','Step 3 of 3','primary-accuracy-step',
  'How do I judge a measuring device','Save accuracy spark','Can you start collecting data'])
  assert(html.includes(term),term);
 assert(html.includes('data-action="plan-save-accuracy" data-source="primary"'));
 assert(!html.includes('Sampling and census: quick recap'));
});
test('old project backup and embedded documents remain readable; new provisional rules travel safely',()=>{
 const original=s();
 set(original,'dataSource','primary');
 assert(save(original,'primary','Length','cm','analogue','nearest 1 mm').ok);
 set(original,'primarySamplingMethod','census');
 set(original,'primarySamplingUnit','One section of material');
 set(original,'primaryPopulation','Every section in my small sample box');
 const copy=normalizeProjectState(JSON.parse(JSON.stringify(original)));
 assert.deepEqual(copy.planning.accuracyPlans,original.planning.accuracyPlans);
 assert.equal(copy.planning.fields.primarySamplingMethod,'census');
 const plan=createPlanningEnvelope(original);
 assert.equal(plan.planning.accuracyPlans.length,1);
 assert.equal(plan.planning.fields.primarySamplingMethod,'census');
 const model=modelFromEnvelope(plan);
 const primary=model.sections.find(t=>t.title.includes('Primary data collection'));
 assert(primary.rows.some(row=>row.label==='Sampling approach'&&row.value.includes('Census')));
 assert(primary.rows.some(row=>row.label.includes('recording precision')&&row.value.includes('nearest 1 mm')));
 const restored=normalizePlanningEnvelope(plan);
 assert.deepEqual(restored.planning.accuracyPlans,original.planning.accuracyPlans);
 const older=structuredClone(plan);
 delete older.planning.accuracyPlans;
 delete older.planning.fields.primarySamplingMethod;
 const oldImported=normalizePlanningEnvelope(older);
 assert.deepEqual(oldImported.planning.accuracyPlans,[]);
 assert.equal(oldImported.planning.fields.primarySamplingMethod,'');
 const blank=s();blank.planning.accuracyPlans=[];
 const differences=getFieldDiff(blank,plan);
 assert(differences.some(x=>x.key==='accuracyPlans'));
 assert(differences.some(x=>x.key==='primarySamplingMethod'));
 const noMerge=mergePlanningEnvelope(blank,plan,[]);
 assert.equal(noMerge.state.planning.accuracyPlans.length,0);
 const yesMerge=mergePlanningEnvelope(blank,plan,['accuracyPlans','primarySamplingMethod']);
 assert.equal(yesMerge.state.planning.accuracyPlans.length,1);
 assert.equal(yesMerge.state.planning.fields.primarySamplingMethod,'census');
 assert.equal(yesMerge.state.evidence.accuracyDecisions.length,0);
});
test('responsive design uses neutral teaching containers and reserved spark colours',()=>{
 const css=readFileSync(new URL('../data/data-decisions.css',import.meta.url),'utf8');
 for(const term of ['.sampling-recap','.sampling-method-row','.plan-sampling-spark','.data-accuracy-spark',
  '.data-accuracy-actions','@media(max-width:650px)','prefers-reduced-motion:reduce'])
  assert(css.includes(term),term);
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 for(const action of ['plan-save-accuracy','plan-edit-accuracy','plan-remove-accuracy'])assert(app.includes('case "'+action+'"'));
 const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert(index.includes('data/data-decisions.css'));
});
