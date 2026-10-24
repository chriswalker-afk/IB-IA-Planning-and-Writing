import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createProjectState,normalizeProjectState} from '../src/core/project-state.js';
import {applyPlanningField,planAutoAdvance,planningBack,planningMove,PLANNING_NODE_IDS} from '../src/planning/engine.js';
import {PLANNING_ROUTES} from '../src/planning/route-table.js';
import {addPrimaryQuantity,editPrimaryQuantity,updatePrimaryQuantity,removePrimaryQuantity,reusePrimaryQuantity} from '../src/planning/primary-quantities.js';
import {savePlannedAccuracy} from '../src/planning/data-decisions.js';
import {createPlanningViews} from '../src/ui/planning-views.js';
import {samplingPlanner} from '../src/ui/data-decisions-view.js';
import {planningLearningTrail} from '../src/ui/living-journey.js';
import {insightCapture} from '../src/ui/insight-threads.js';
import {createPlanningEnvelope,normalizePlanningEnvelope,getFieldDiff,mergePlanningEnvelope} from '../src/handover/schema.js';
import {modelFromEnvelope} from '../src/handover/report-model.js';

const s=()=>{
 const state=createProjectState();
 state.route='planning';
 state.planning.current='N03P';
 state.planning.fields.kind='statistics';
 state.planning.fields.dataSource='primary';
 return state;
};
const set=(s,k,v)=>assert(applyPlanningField(s,k,v),k);
const name=(s,n,u='')=>{set(s,'primaryQuantityName',n);set(s,'primaryQuantityUnit',u);return updatePrimaryQuantity(s);};
const measure=(s,n,u,basis,resolution='')=>{
 for(const [key,value] of Object.entries({
  primaryAccuracyQuantity:n,primaryAccuracyUnit:u,primaryAccuracyBasis:basis,
  primaryAccuracyResolution:resolution
 }))set(s,key,value);
 return savePlannedAccuracy(s,'primary');
};
const view=state=>{
 const e=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
 const ctx={getState:()=>state,e,icon:()=>'',button:(label)=>label,
  field:(path,label)=>'<label data-path="'+path+'">'+e(label)+'</label>',
  choose:()=>'',numberPick:()=>'',note:()=>'',summary:()=>'',helpButton:()=>'',helpBox:()=>'',tabletNav:()=>''};
 return createPlanningViews(ctx).viewPlanning();
};

test('primary collection and sampling use two screens while keeping provenance',()=>{
 for(const id of ['N03P','N03P2'])assert(PLANNING_NODE_IDS.includes(id));
 assert(!PLANNING_NODE_IDS.includes('N03P3'));
 const route=(from,to)=>PLANNING_ROUTES.find(x=>x.from===from&&x.to===to);
 assert.equal(route('N03P','N03P2').sourceRow,null);
 assert.equal(route('N03P2','N01P').sourceRow,null);
 assert.equal(route('N03P','N03J').sourceRow,19);
 const state=s();
 assert(!planAutoAdvance(state).ok);
 set(state,'primaryHow','Measure jump distance with a tape');
 assert(planAutoAdvance(state).ok);
 assert.equal(state.planning.current,'N03P2');
 assert(!planAutoAdvance(state).ok);
 set(state,'primarySamplingMethod','convenience');
 set(state,'primaryStatus','unsure');
 assert(planAutoAdvance(state).ok);
 assert.equal(state.planning.current,'N01P');
 assert.deepEqual(['N03P','N03P2'].map(id=>state.planning.completedNodes.includes(id)),[true,true]);
 assert(planningBack(state).ok);
 assert.equal(state.planning.current,'N03P2');
});
test('legacy direct-complete edge uses the merged collection screen',()=>{
 const state=s();set(state,'primaryHow','Measure with a ruler');
 assert(planningMove(state,'Complete').ok);
 assert.equal(state.planning.current,'N03P2');
});
test('quantities and their units can be collected, edited and safely reused for precision',()=>{
 const state=s();
 assert(name(state,'Jump height','cm').ok);
 assert(name(state,'Elapsed time','s').ok);
 assert(!name(state,'Jump height','metres').ok); // no duplicate keys
 assert.equal(state.planning.primaryQuantities.length,2);
 const id=state.planning.primaryQuantities[0].id;
 assert(editPrimaryQuantity(state,id));
 set(state,'primaryQuantityName','Standing jump height');
 assert(updatePrimaryQuantity(state).updated);
 assert.equal(state.planning.primaryQuantities[0].id,id);
 assert(reusePrimaryQuantity(state,id));
 assert.equal(state.planning.fields.primaryAccuracyQuantity,'Standing jump height');
 assert.equal(state.planning.fields.primaryAccuracyUnit,'cm');
 assert(measure(state,'Standing jump height','cm','analogue','nearest 0.1 cm').ok);
 assert.equal(state.planning.accuracyPlans.length,1);
 assert(editPrimaryQuantity(state,id));
 set(state,'primaryQuantityUnit','mm');
 assert(updatePrimaryQuantity(state).ok);
 assert.equal(state.planning.accuracyPlans[0].unit,'mm');
 assert(reusePrimaryQuantity(state,id));
 assert.equal(state.planning.fields.primaryAccuracyBasis,'analogue');
 assert.equal(state.planning.accuracyEditId,state.planning.accuracyPlans[0].id);
 assert(removePrimaryQuantity(state,id));
 assert.equal(state.planning.primaryQuantities.length,1);
 assert.equal(state.planning.accuracyPlans.length,1); // never silently delete an existing spark
 assert.equal(state.evidence.accuracyDecisions.length,0); // do not invent actual measurements
});
test('ready plans require each named quantity accuracy on sampling finish',()=>{
 const state=s();set(state,'primaryHow','Measure two variables with a ruler and stopwatch');
 name(state,'Height','cm');name(state,'Duration','s');
 assert(planAutoAdvance(state).ok);
 set(state,'primarySamplingMethod','convenience');
 set(state,'primarySamplingFrame','no');set(state,'primaryRepeatable','yes');
 set(state,'primaryPopulation','Accessible pupils');set(state,'primarySamplingUnit','One pupil');
 set(state,'primaryStatus','ready');
 assert(measure(state,'Height','cm','analogue','nearest 1 mm').ok);
 assert(!planAutoAdvance(state).ok);
 assert(measure(state,'Duration','s','digital','nearest 0.01 s').ok);
 assert(planAutoAdvance(state).ok);assert.equal(state.planning.current,'N01P');
});
test('quantity and accuracy live together on screen one; sampling lives on screen two',()=>{
 const state=s();set(state,'primaryHow','Measure jump distance');
 name(state,'Jump distance','cm');
 let h=view(state);
 assert(h.includes('Step 1 of 2'));assert(h.includes('What will I collect, and how?'));
 assert(h.includes('data-action="plan-use-quantity"'));
 assert(h.includes('primary-accuracy-editor'));
 assert(!h.includes('Sampling and census: quick recap'));
 assert(planAutoAdvance(state).ok);
 h=view(state);
 assert(h.includes('Step 2 of 2'));assert(h.includes('How will I choose my data?'));
 assert(h.includes('Sampling and census: quick recap'));
 assert(!h.includes('data-action="plan-save-accuracy"'));
 set(state,'primarySamplingMethod','convenience');set(state,'primaryStatus','unsure');
 assert(planAutoAdvance(state).ok);
 const trail=planningLearningTrail(state);
 assert(trail.includes('What do you predict might happen?'));
 assert(trail.includes('Right now in Planning'));
 assert(!trail.includes('Every screen counts'));
});
test('saved accuracy sparks remain on the merged screen',()=>{
 const state=s();set(state,'primaryHow','Measure reaction times');
 set(state,'primarySamplingMethod','convenience');
 assert(measure(state,'Reaction time','s','digital','nearest 0.01 s').ok);
 assert(insightCapture(state,'N03P').includes('Spark saved'));
 const h=view(state);
 assert(h.includes('Reaction time'));
});
test('combined primary/secondary route preserves both branch completion checks',()=>{
 const state=s();set(state,'dataSource','both');
 set(state,'primaryHow','Measure a variable');
 assert(planAutoAdvance(state).ok);
 set(state,'primarySamplingMethod','unsure');set(state,'primaryStatus','unsure');
 assert(planAutoAdvance(state).ok);
 assert.equal(state.planning.current,'N03B');
 assert.equal(state.planning.sourceBranches.primary,true);
 assert.equal(state.planning.sourceBranches.secondary,false);
});
test('older plans and PDF/Word snapshot imports preserve named quantities and earlier measurement accuracy',()=>{
 const state=s();name(state,'Height','cm');name(state,'Duration','s');
 assert(measure(state,'Height','cm','digital','nearest 0.1 cm').ok);
 const backup=normalizeProjectState(JSON.parse(JSON.stringify(state)));
 assert.deepEqual(backup.planning.primaryQuantities,state.planning.primaryQuantities);
 const envelope=createPlanningEnvelope(state);
 const parsed=normalizePlanningEnvelope(envelope);
 assert.deepEqual(parsed.planning.primaryQuantities,state.planning.primaryQuantities);
 const report=modelFromEnvelope(envelope);
 const primary=report.sections.find(x=>x.title.includes('Primary data collection'));
 assert(primary.rows.some(x=>x.label==='Individual quantities and units'&&x.value.includes('Height (cm)')));
 const target=s();
 assert(getFieldDiff(target,envelope).some(x=>x.key==='primaryQuantities'));
 const without=mergePlanningEnvelope(target,envelope,[]);
 assert.deepEqual(without.state.planning.primaryQuantities,[]);
 const imported=mergePlanningEnvelope(target,envelope,['primaryQuantities']);
 assert.equal(imported.state.planning.primaryQuantities.length,2);
 assert.deepEqual(imported.state.evidence.accuracyDecisions,[]);
 const legacy=structuredClone(state);
 delete legacy.planning.primaryQuantities;
 const restored=normalizeProjectState(legacy);
 assert(restored.planning.primaryQuantities.some(q=>q.name==='Height'));
 assert.deepEqual(restored.planning.accuracyPlans,state.planning.accuracyPlans);
});
test('responsive CSS and browser hooks exist without hiding progress or required choices',()=>{
 const css=readFileSync(new URL('../data/primary-data-steps.css',import.meta.url),'utf8');
 for(const term of ['.primary-mini-progress','.primary-mini-progress-track',
  '.primary-quantity','.primary-precision-item','.primary-accuracy-editor',
  '@media(max-width:650px)','prefers-reduced-motion:reduce'])assert(css.includes(term),term);
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 for(const term of ['plan-save-quantity','plan-edit-quantity','plan-use-quantity','plan-cancel-quantity','plan-remove-quantity'])
  assert(app.includes('case "'+term+'"'),term);
});

test('Prediction is written before optional plan refinement, including when refinement is expanded',()=>{
 const state=s();
 state.planning.current='N01P';
 state.planning.fields.aim='How does hydration relate to bread volume?';
 state.planning.fields.predictionId='X01';
 state.planning.fields.prediction='I predict a rising volume';
 state.planning.fields.predictionWhy='A small earlier case suggested an increase';
 for(const open of [false,true]){
  state.planning.refinePlanOpen=open;
  const before=JSON.stringify(state),html=view(state);
  const prediction=html.indexOf('data-path="planning.fields.prediction"');
  const why=html.indexOf('data-path="planning.fields.predictionWhy"');
  const refine=html.indexOf('class="planning-prediction-refine"');
  assert(prediction>=0&&why>prediction&&refine>why,
   'Consider a prediction and its reason before refining the mathematical plan');
  assert(html.includes('data-action="plan-refine-toggle"'));
  assert.equal(JSON.stringify(state),before,'Changing presentation must not alter planning decisions');
 }
});
test('Sampling frame is checked before choosing a sampling method, in both planning renderers',()=>{
 const state=s();state.planning.current='N03P2';
 state.planning.fields.primarySamplingFrame='no';
 state.planning.fields.primarySamplingMethod='simple-random';
 const before=JSON.stringify(state),html=view(state);
 const frame=html.indexOf('data-path="planning.fields.primarySamplingFrame"');
 const method=html.indexOf('data-path="planning.fields.primarySamplingMethod"');
 const caution=html.indexOf('class="data-quality-warning"');
 assert(frame>=0&&method>frame&&caution>method);
 assert(html.includes('This method normally needs a suitable sampling frame'));
 const facade={
  F:key=>'<input data-test-field="'+key+'">',
  select:key=>'<select data-test-field="'+key+'"></select>',
  e:v=>String(v??''),icon:()=>''
 };
 const alternate=samplingPlanner(state,facade);
 const frameAlt=alternate.indexOf('data-test-field="primarySamplingFrame"');
 const methodAlt=alternate.indexOf('data-test-field="primarySamplingMethod"');
 assert(frameAlt>=0&&methodAlt>frameAlt,'Alternative sampling UI must follow the same decision order');
 assert(alternate.includes('Your chosen method normally needs a suitable frame'));
 assert.equal(JSON.stringify(state),before);
});
