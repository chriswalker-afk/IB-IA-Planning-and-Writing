import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createProjectState,normalizeProjectState} from '../src/core/project-state.js';
import {applyPlanningField,planAutoAdvance,planningBack,planningMove,PLANNING_NODE_IDS} from '../src/planning/engine.js';
import {PLANNING_ROUTES} from '../src/planning/route-table.js';
import {addPrimaryQuantity,editPrimaryQuantity,updatePrimaryQuantity,removePrimaryQuantity,reusePrimaryQuantity} from '../src/planning/primary-quantities.js';
import {savePlannedAccuracy} from '../src/planning/data-decisions.js';
import {createPlanningViews} from '../src/ui/planning-views.js';
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

test('new primary flow has three real navigable route nodes, without altering historical source rows',()=>{
 for(const id of ['N03P','N03P2','N03P3'])
  assert(PLANNING_NODE_IDS.includes(id),id);
 const route=(from,to)=>PLANNING_ROUTES.find(x=>x.from===from&&x.to===to);
 assert.equal(route('N03P','N03P2').sourceRow,null);
 assert.equal(route('N03P2','N03P3').sourceRow,null);
 assert.equal(route('N03P3','N03J').sourceRow,null);
 assert.equal(route('N03P','N03J').sourceRow,19);
 const state=s();
 assert(!planAutoAdvance(state).ok); // no data described
 set(state,'primaryWhat','Length and duration of repeated trials');
 assert(planAutoAdvance(state).ok);
 assert.equal(state.planning.current,'N03P2');
 assert(!planAutoAdvance(state).ok); // statistical sampling undecided
 set(state,'primarySamplingMethod','convenience');
 assert(planAutoAdvance(state).ok);
 assert.equal(state.planning.current,'N03P3');
 assert(!planAutoAdvance(state).ok); // collection plan not assessed yet
 set(state,'primaryStatus','unsure');
 assert(planAutoAdvance(state).ok);
 assert.equal(state.planning.current,'N03J');
 assert.deepEqual(['N03P','N03P2','N03P3'].map(id=>state.planning.completedNodes.includes(id)),[true,true,true]);
 assert(state.planning.completedNodes.every(x=>x!=='N03J'));
 assert(planningBack(state).ok);assert.equal(state.planning.current,'N03P3');
 assert(planningBack(state).ok);assert.equal(state.planning.current,'N03P2');
 assert.equal(state.planning.fields.primarySamplingMethod,'convenience');
});
test('legacy direct-complete transition enters the new three-step flow rather than skipping sampling',()=>{
 const state=s();set(state,'primaryWhat','Length of a measured object');
 const result=planningMove(state,'Complete');
 assert(result.ok);
 assert.equal(state.planning.current,'N03P2');
 assert.equal(state.journey.history.at(-1).sourceRow,null);
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
test('a genuinely ready primary plan needs recording accuracy for each named measurement',()=>{
 const state=s();set(state,'primaryWhat','Paired measurements');
 name(state,'Height','cm');name(state,'Duration','s');
 assert(planAutoAdvance(state).ok);
 set(state,'primarySamplingMethod','convenience');
 set(state,'primarySamplingFrame','no');set(state,'primaryRepeatable','yes');
 set(state,'primaryPopulation','Accessible class members');
 set(state,'primarySamplingUnit','One member');
 assert(planAutoAdvance(state).ok);
 set(state,'primaryHow','Use a scale and stopwatch to measure each participant');
 set(state,'primaryStatus','ready');
 assert(measure(state,'Height','cm','analogue','nearest 1 mm').ok);
 assert(!planAutoAdvance(state).ok); // Duration is missing a rule
 assert(measure(state,'Duration','s','digital','nearest 0.01 s').ok);
 assert(planAutoAdvance(state).ok);assert.equal(state.planning.current,'N03J');
});
test('three screens show different main tasks, with small learning-trail progress',()=>{
 const state=s();
 set(state,'primaryWhat','Jump distance and recorded time');
 name(state,'Jump distance','cm');
 let h=view(state);
 assert(h.includes('Step 1 of 3'));
 assert(h.includes('data-action="plan-save-quantity"'));
 assert(h.includes('What data will I collect?'));
 assert(!h.includes('data-action="plan-save-accuracy"'));
 assert(!h.includes('Sampling and census: quick recap'));
 assert(planAutoAdvance(state).ok);
 h=view(state);
 assert(h.includes('Step 2 of 3'));
 assert(h.includes('How will I choose my data?'));
 assert(h.includes('Sampling and census: quick recap'));
 assert(!h.includes('data-action="plan-save-accuracy"'));
 set(state,'primarySamplingMethod','convenience');
 assert(planAutoAdvance(state).ok);
 h=view(state);
 assert(h.includes('Step 3 of 3'));
 assert(h.includes('How will I collect it accurately?'));
 assert(h.includes('Jump distance'));
 assert(h.includes('data-action="plan-use-quantity"'));
 assert(h.includes('data-action="plan-save-accuracy"'));
 assert(!h.includes('Sampling and census: quick recap'));
 const trail=planningLearningTrail(state);
 assert(trail.includes('2 completed'));
 assert(trail.includes('Chose quantities to collect'));
 assert(trail.includes('Considered a sampling approach'));
});
test('sampling and accuracy sparks appear at their actual checkpoints',()=>{
 const state=s();
 set(state,'primaryWhat','Repeated times');
 set(state,'primarySamplingMethod','convenience');
 state.planning.current='N03P2';
 assert(insightCapture(state,'N03P2').includes('Spark saved'));
 assert(!insightCapture(state,'N03P3').includes('Spark saved'));
 assert(measure(state,'Reaction time','s','digital','nearest 0.01 s').ok);
 assert(insightCapture(state,'N03P3').includes('Spark saved'));
 const h=view(state);
 assert(!h.includes('data-action="plan-save-accuracy"'));
});
test('a combined primary+secondary plan returns to the source choice only after all three primary decisions',()=>{
 const state=s();set(state,'dataSource','both');
 state.planning.current='N03P';
 set(state,'primaryWhat','One measurement');
 assert(planAutoAdvance(state).ok);assert.equal(state.planning.sourceBranches.primary,false);
 set(state,'primarySamplingMethod','unsure');
 assert(planAutoAdvance(state).ok);assert.equal(state.planning.sourceBranches.primary,false);
 set(state,'primaryStatus','unsure');
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
