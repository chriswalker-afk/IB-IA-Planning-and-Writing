/**
 * Three short primary-data decisions. Focus on one task per screen.
 * The comprehensive sampling and measuring-device recaps remain opt-in.
 */
import {SAMPLING_METHODS,samplingMethod,plannedAccuracyText} from '../planning/data-decisions.js';
import {samplingRecap,accuracyRecap} from './data-decisions-view.js';

const label=(e,icon,step)=>'<div class="primary-mini-progress" aria-label="Primary data plan, step '+step+' of 3">'+
 '<div class="primary-mini-progress-top"><strong>PRIMARY DATA PLAN</strong><span>Step '+step+' of 3</span></div>'+
 '<div class="primary-mini-progress-track">'+[1,2,3].map(i=>
 '<span class="'+(i<step?'done':i===step?'current':'waiting')+'">'+
 (i<step?icon('check-circle'):i)+' <small>'+e(['','What to collect','Sampling','Recording accuracy'][i])+'</small></span>').join('')+
 '</div></div>';
const summary=(state,{e,icon},step)=>{
 const p=state.planning,f=p.fields,n=p.primaryQuantities.length;
 return '<div class="primary-previous-steps" aria-label="Your earlier primary-data answers">'+
 icon('check-circle')+' <span><strong>From your earlier step'+(step===3?'s':'')+':</strong> '+
 e((f.primaryWhat||'Collection details still developing').slice(0,105))+
 (n?' · '+n+' named '+(n===1?'quantity':'quantities'):'')+
 (step===3&&samplingMethod(f.primarySamplingMethod)?' · '+e(samplingMethod(f.primarySamplingMethod).label):'')+
 '</span></div>';
};
export function primaryQuantitiesView(state,{F,e,icon}){
 const p=state.planning,f=p.fields,items=p.primaryQuantities||[],editing=p.primaryQuantityEditId;
 return '<section class="primary-quantities" aria-label="Your measurements or categories">'+
 '<div class="primary-section-title">'+icon('list-plus')+' <div><h3>What will you record?</h3>'+
 '<p>Name individual quantities or categories so Pathfinder can bring them back when you plan accuracy.</p></div></div>'+
 (items.length?'<div class="primary-quantity-list">'+items.map(q=>
 '<div class="primary-quantity" data-primary-quantity-id="'+e(q.id)+'">'+
 '<span class="primary-quantity-icon">'+icon('check-circle')+'</span>'+
 '<span class="primary-quantity-text"><strong>'+e(q.name)+'</strong>'+
 (q.unit?'<small>Unit: '+e(q.unit)+'</small>':'<small>No numerical unit needed</small>')+'</span>'+
 '<button type="button" data-action="plan-edit-quantity" data-quantity-id="'+e(q.id)+'" aria-label="Edit '+e(q.name)+'">Edit</button>'+
 '<button type="button" data-action="plan-remove-quantity" data-quantity-id="'+e(q.id)+'" aria-label="Remove '+e(q.name)+'">Remove</button>'+
 '</div>').join('')+'</div>':'')+
 '<div class="primary-add-quantity"><div class="primary-add-quantity-fields">'+
 F('primaryQuantityName',editing?'Rename this quantity':'Quantity or category','e.g. height, time, number of goals')+
 F('primaryQuantityUnit','Unit (if needed)','e.g. cm, s, kg')+'</div>'+
 '<button type="button" class="btn btn-secondary primary-quantity-add" data-action="plan-save-quantity">'+
 icon(editing?'check':'plus')+(editing?' Update quantity':' Add quantity')+'</button>'+
 (editing?'<button type="button" class="btn btn-quiet btn-sm" data-action="plan-cancel-quantity">Cancel editing</button>':'')+
 '</div><p class="primary-hint">Two or three clear quantities are often enough to start. Categories and exact counts need no invented unit.</p></section>';
}
export function primaryDataWhat(state,{F,e,icon}){
 return label(e,icon,1)+
 '<section class="primary-focus-block">'+
 F('primaryWhat','What are you hoping to collect?','e.g. I will record the distance and time of each trial.',{type:'textarea',rows:2})+
 '<div class="data-quality-pair">'+
 F('primaryPopulation','Which population, objects or events?','e.g. the six footballs available to me')+
 F('primarySamplingUnit','What counts as one unit?','e.g. one ball, one pupil or one recorded attempt')+'</div>'+
 '</section>'+
 primaryQuantitiesView(state,{F,e,icon})+
 '<p class="primary-hint">You can refine your quantities after trying a small permitted pilot. No data have been recorded yet.</p>';
}
export function primaryDataSampling(state,{F,select,e,icon}){
 const f=state.planning.fields,method=samplingMethod(f.primarySamplingMethod);
 const methodCard=method?'<div class="primary-sampling-feedback" aria-live="polite">'+
 '<div class="primary-feedback-head">'+icon('sparkles')+' <strong>Sampling spark saved</strong></div>'+
 '<p><b>Useful here:</b> '+e(method.good)+'</p>'+
 '<p><b>Watch out:</b> '+e(method.watch)+'</p>'+
 '</div>':'';
 return label(e,icon,2)+summary(state,{e,icon},2)+
 '<section class="primary-focus-block">'+
 '<div class="primary-section-title">'+icon('layers')+' <div><h3>How will you choose your observations?</h3>'+
 '<p>Choose a manageable method. You can change it after an initial trial.</p></div></div>'+
 select('primarySamplingMethod','My census or sampling approach',SAMPLING_METHODS.map(m=>[m.id,m.label]))+
 methodCard+
 select('primarySamplingFrame','Could you identify every eligible unit? (a sampling frame)',[
  ['yes','Yes — I have a suitable list or way to identify units'],
  ['no','No — I cannot identify every eligible unit'],
  ['unsure','I need to check'],
  ['not-applicable','Not applicable to my investigation']])+
 select('primaryRepeatable','Could you start quickly and collect more observations later?',[
  ['yes','Yes — easy to start and repeat or extend'],
  ['maybe','Possibly — I need to check access or timing'],
  ['no','Not easily — I may need a smaller plan']])+
 (f.primarySamplingFrame==='no'&&['simple-random','systematic','stratified','cluster'].includes(f.primarySamplingMethod)?
  '<p class="data-quality-warning">'+icon('info')+' This method normally needs a suitable sampling frame. You might need a different approach or to keep the plan uncertain.</p>':'')+
 '<details class="primary-step-extra"><summary>'+icon('pencil')+' Add an explanation (optional) '+icon('chevron-down')+'</summary>'+
 '<div class="primary-step-extra-content">'+
 F('primarySamplingFrameDetails','Describe the frame or difficulty','e.g. a class list, or no complete list')+
 F('primarySampling','Why might this method work for your IA?','Consider speed, access, bias or follow-up observations',{type:'textarea',rows:2})+
 '</div></details>'+
 samplingRecap(e,icon)+'</section>'+
 '<p class="primary-hint">A quick, honest opportunity sample can be more useful than an elaborate but impossible sampling plan. Interpret findings only for groups your data can support.</p>';
}
const primaryBasis=[
 ['analogue','Analogue instrument (marked scale)'],['digital','Digital instrument (displayed digits)'],
 ['estimated','Observation or calibrated image'],['exact','Exact count / category'],
 ['unknown','Not sure yet — precision to check']
];
const basisReminder={
 analogue:'Read the smallest marked division; half a division may be reasonable for one reading when justified, but it is not a universal uncertainty rule.',
 digital:'Use the smallest displayed change as the resolution. Check device specifications: display resolution is not necessarily instrument accuracy.',
 estimated:'Record how you established image scale, viewpoint and pixel uncertainty before claiming physical distances.',
 exact:'Counts or categories do not need an invented ± uncertainty; sampling and recording completeness can still limit conclusions.',
 unknown:'A provisional note is fine. Mark the overall plan uncertain until you establish the recording precision.'
};
export function primaryDataAccuracy(state,{F,select,e,icon}){
 const p=state.planning,f=p.fields,records=(p.accuracyPlans||[]).filter(x=>x.source==='primary');
 const quantities=p.primaryQuantities||[],basis=f.primaryAccuracyBasis;
 const hasDraft=!!f.primaryAccuracyQuantity,editing=!!p.accuracyEditId;
 const named=quantities.map(q=>{
  const saved=records.find(r=>r.quantity.toLowerCase()===q.name.toLowerCase());
  return '<div class="primary-precision-item" data-primary-precision-item="'+e(q.id)+'">'+
   '<span class="primary-precision-status">'+icon(saved?'check-circle':'circle')+'</span>'+
   '<span><strong>'+e(q.name)+'</strong>'+(q.unit?' <small>('+e(q.unit)+')</small>':'')+
   '<small>'+(saved?e(plannedAccuracyText(saved)):'Degree of accuracy still to decide')+'</small></span>'+
   '<button type="button" data-action="plan-use-quantity" data-quantity-id="'+e(q.id)+'">'+
   (saved?'Review':'Set accuracy')+'</button></div>';
 });
 return label(e,icon,3)+summary(state,{e,icon},3)+
 '<section class="primary-focus-block">'+
 F('primaryHow','How will you measure or collect it?','Describe one clear procedure and how you will record results.',{type:'textarea',rows:2})+
 F('primaryEquipment','Equipment or resources','e.g. a tape measure with 1 mm marks')+
 '<details class="primary-step-extra"><summary>'+icon('calendar')+' When and where? (optional) '+icon('chevron-down')+'</summary>'+
 '<div class="primary-step-extra-content"><div class="data-quality-pair">'+
 F('primaryWhen','When can you start?','',{type:'date'})+
 F('primaryWhere','Where will this take place?','Setting without personal details')+
 '</div></div></details>'+
 '</section><section class="primary-focus-block primary-accuracy-step" aria-label="Recording accuracy for each quantity">'+
 '<div class="primary-section-title">'+icon('ruler')+' <div><h3>How accurately can you record each quantity?</h3>'+
 '<p>Use your quantities from Step 1. One saved accuracy rule per measurement is a good starting point.</p></div></div>'+
 (named.length?'<div class="primary-precision-list">'+named.join('')+'</div>':
  '<p class="primary-hint">No named quantities yet. You can record a quantity below, or '+ 
  '<button type="button" class="primary-text-action" data-action="plan-edit" data-node="N03P">add some on Step 1</button>.</p>')+
 '<details class="primary-accuracy-editor" data-primary-accuracy-editor'+(hasDraft||editing||(!named.length&&!records.length)?' open':'')+'>'+
 '<summary>'+icon('pencil')+' '+(editing?'Update this accuracy rule':hasDraft?'Set recording accuracy':'Add or edit a recording rule')+' '+icon('chevron-down')+'</summary>'+
 '<div class="primary-step-extra-content"><div class="data-quality-pair">'+
 F('primaryAccuracyQuantity','Quantity','e.g. height, duration, category')+
 F('primaryAccuracyUnit','Unit (if any)','e.g. cm, s')+'</div>'+
 select('primaryAccuracyBasis','How is this quantity recorded?',primaryBasis)+
 (basis?'<p class="data-quality-basis-note">'+icon('info')+' '+e(basisReminder[basis]||'')+'</p>':'')+
 (basis!=='exact'?F('primaryAccuracyResolution','Recording increment / rounding',
  'e.g. nearest 0.1 cm'):'')+
 '<details class="primary-step-extra primary-uncertainty-more"><summary>Known uncertainty (optional) '+icon('chevron-down')+'</summary>'+
 '<div class="primary-step-extra-content">'+
 F('primaryAccuracyUncertainty','Other uncertainty to check','e.g. calibration tolerance')+'</div></details>'+
 '<button type="button" class="btn btn-secondary data-accuracy-save" data-action="plan-save-accuracy" data-source="primary">'+
 icon('sparkles')+' Save accuracy spark</button></div></details>'+
 (records.length?'<div class="primary-saved-precision"><strong>'+records.length+' saved accuracy '+(records.length===1?'spark':'sparks')+'</strong>'+
 records.map(x=>'<div class="primary-saved-row">'+icon('sparkles')+
  '<span>'+e(plannedAccuracyText(x))+'</span>'+
  '<button type="button" data-action="plan-edit-accuracy" data-accuracy-id="'+e(x.id)+'">Edit</button>'+
  '<button type="button" data-action="plan-remove-accuracy" data-accuracy-id="'+e(x.id)+'" aria-label="Remove accuracy for '+e(x.quantity)+'">Remove</button></div>').join('')+'</div>':'')+
 accuracyRecap('primary',icon)+'</section>'+
 '<section class="primary-focus-block primary-readiness">'+
 select('primaryStatus','Can you start collecting data?',[
 ['ready','Yes — I have a workable collection and recording plan'],
 ['unsure','Still uncertain — I need to check something']])+
 '<p class="primary-hint">If your measuring device or sampling method still needs checking, choose uncertain. You can continue planning without inventing precision.</p>'+
 '</section>';
}
