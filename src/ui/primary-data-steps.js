/**
 * Two primary-data decisions: what/how/accuracy together, then sampling.
 * No quantity name or unit needs to be typed a second time for accuracy.
 * Previously saved accuracy plans remain editable; guidance is opt-in.
 */
import {SAMPLING_METHODS,samplingMethod,plannedAccuracyText} from '../planning/data-decisions.js';
import {samplingRecap,accuracyRecap} from './data-decisions-view.js';

const label=(e,icon,step)=>'<div class="primary-mini-progress" aria-label="Primary data plan, step '+step+' of 2">'+
 '<div class="primary-mini-progress-top"><strong>PRIMARY DATA PLAN</strong><span>Step '+step+' of 2</span></div>'+
 '<div class="primary-mini-progress-track">'+[1,2].map(i=>
 '<span class="'+(i<step?'done':i===step?'current':'waiting')+'">'+
 (i<step?icon('check-circle'):i)+' <small>'+e(['','Collect & measure','Sampling'][i])+'</small></span>').join('')+
 '</div></div>';

const summary=(state,{e,icon})=>{
 const p=state.planning,f=p.fields,n=p.primaryQuantities.length;
 const rules=(p.accuracyPlans||[]).filter(x=>x.source==='primary').length;
 return '<div class="primary-previous-steps" aria-label="Your collection plan">'+
 icon('check-circle')+' <span><strong>From your collection plan:</strong> '+
 e((f.primaryHow||f.primaryWhat||'Details still developing').slice(0,95))+
 (n?' · '+n+' '+(n===1?'quantity':'quantities'):'')+
 (rules?' · '+rules+' accuracy '+(rules===1?'rule':'rules'):'')+
 '</span></div>';
};

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

export function primaryQuantitiesView(state,{F,select,e,icon}){
 const p=state.planning,f=p.fields,items=p.primaryQuantities||[],editing=p.primaryQuantityEditId;
 const rules=(p.accuracyPlans||[]).filter(x=>x.source==='primary');
 const draft=String(f.primaryAccuracyQuantity||'').trim();
 const selected=items.find(q=>q.name.toLowerCase()===draft.toLowerCase());
 const active=!!draft||!!p.accuracyEditId;
 return '<section class="primary-quantities" aria-label="Quantities and recording accuracy">'+
 '<div class="primary-section-title">'+icon('ruler')+' <div><h3>What will you record, and to what precision?</h3>'+
 '<p>Add each important measurement or category once. Then set its recording accuracy when you know it.</p></div></div>'+
 (items.length?'<div class="primary-quantity-list">'+items.map(q=>{
  const rule=rules.find(r=>r.quantity.toLowerCase()===q.name.toLowerCase());
  return '<div class="primary-quantity'+(rule?' has-accuracy':'')+'" data-primary-quantity-id="'+e(q.id)+'">'+
   '<span class="primary-quantity-icon">'+icon(rule?'sparkles':'circle')+'</span>'+
   '<span class="primary-quantity-text"><strong>'+e(q.name)+(q.unit?' ('+e(q.unit)+')':'')+'</strong>'+
   '<small class="primary-quantity-rule">'+(rule?e(plannedAccuracyText(rule)):'Recording accuracy not set yet — you can decide later')+'</small></span>'+
   '<button type="button" data-action="plan-use-quantity" data-quantity-id="'+e(q.id)+'" aria-label="'+(rule?'Review':'Set')+' accuracy for '+e(q.name)+'">'+(rule?'Review accuracy':'Set accuracy')+'</button>'+
   '<button type="button" data-action="plan-edit-quantity" data-quantity-id="'+e(q.id)+'" aria-label="Rename '+e(q.name)+'">Edit</button>'+
   '<button type="button" data-action="plan-remove-quantity" data-quantity-id="'+e(q.id)+'" aria-label="Remove '+e(q.name)+'">Remove</button>'+
   '</div>';
  }).join('')+'</div>':'<p class="primary-hint">Start with one or two quantities. Exact counts and categories are fine too.</p>')+
 '<div class="primary-add-quantity"><div class="primary-add-quantity-fields">'+
 F('primaryQuantityName',editing?'Rename this quantity':'Quantity or category','e.g. jump distance')+
 F('primaryQuantityUnit','Unit (only if needed)','e.g. cm, s')+'</div>'+
 '<button type="button" class="btn btn-secondary primary-quantity-add" data-action="plan-save-quantity">'+
 icon(editing?'check':'plus')+(editing?' Update quantity':' Add quantity')+'</button>'+
 (editing?'<button type="button" class="btn btn-quiet btn-sm" data-action="plan-cancel-quantity">Cancel editing</button>':'')+
 '</div>'+
 '<details class="primary-accuracy-editor" data-primary-accuracy-editor'+(active?' open':'')+'>'+
 '<summary>'+icon('pencil')+' '+(active?'Accuracy for '+e(draft):'Set or review recording accuracy')+' '+icon('chevron-down')+'</summary>'+
 (active?'<div class="primary-step-extra-content">'+
 '<p class="primary-accuracy-target">Recording: <strong>'+e(draft)+(f.primaryAccuracyUnit?' ('+e(f.primaryAccuracyUnit)+')':'')+'</strong>'+
 (selected?' · copied from your quantity list':' · previously saved quantity')+'</p>'+
 select('primaryAccuracyBasis','How will you record it?',primaryBasis)+
 (f.primaryAccuracyBasis?'<p class="data-quality-basis-note">'+icon('info')+' '+e(basisReminder[f.primaryAccuracyBasis]||'')+'</p>':'')+
 (f.primaryAccuracyBasis!=='exact'?F('primaryAccuracyResolution','Recording increment or rounding','e.g. nearest 0.1 cm'):'')+
 '<details class="primary-step-extra primary-uncertainty-more"><summary>Other uncertainty to check (optional) '+icon('chevron-down')+'</summary>'+
 '<div class="primary-step-extra-content">'+
 F('primaryAccuracyUncertainty','Known tolerance or uncertainty','e.g. manufacturer tolerance')+
 '</div></details>'+
 '<button type="button" class="btn btn-secondary data-accuracy-save" data-action="plan-save-accuracy" data-source="primary">'+
 icon('sparkles')+' Save accuracy spark</button></div>':
 '<p class="primary-hint primary-editor-prompt">Select <strong>Set accuracy</strong> beside a quantity to choose its recording rule. You only need to provide the method and recording increment; the name and unit are reused automatically.</p>')+
 '</details>'+
 (rules.length?'<details class="primary-saved-precision"><summary>'+icon('sparkles')+' '+rules.length+' saved accuracy '+(rules.length===1?'spark':'sparks')+' (view or remove)</summary>'+
 rules.map(x=>'<div class="primary-saved-row">'+icon('sparkles')+
  '<span>'+e(plannedAccuracyText(x))+'</span>'+
  '<button type="button" data-action="plan-edit-accuracy" data-accuracy-id="'+e(x.id)+'">Edit</button>'+
  '<button type="button" data-action="plan-remove-accuracy" data-accuracy-id="'+e(x.id)+'" aria-label="Remove accuracy for '+e(x.quantity)+'">Remove</button></div>').join('')+
 '</details>':'')+
 accuracyRecap('primary',icon)+
 '<p class="primary-hint">A scale division or displayed digit tells you recording resolution, not necessarily the instrument’s actual accuracy. If you are unsure, save “Not sure yet” and revisit after a trial.</p>'+
 '</section>';
}

export function primaryDataWhat(state,{F,select,e,icon}){
 const f=state.planning.fields;
 return label(e,icon,1)+
 '<section class="primary-focus-block">'+
 F('primaryHow','What will you collect, and how?','e.g. Measure the distance of each jump with a tape measure and record each result in cm.',{type:'textarea',rows:2})+
 (f.primaryWhat&&f.primaryWhat!==f.primaryHow?
  '<details class="primary-step-extra"><summary>'+icon('book')+' Earlier collection note '+icon('chevron-down')+'</summary>'+
  '<div class="primary-step-extra-content"><p class="primary-hint">'+e(f.primaryWhat)+'</p></div></details>':'')+
 '<details class="primary-step-extra"><summary>'+icon('clipboard-list')+' Equipment, timing and location (optional) '+icon('chevron-down')+'</summary>'+
 '<div class="primary-step-extra-content">'+
 F('primaryEquipment','Equipment or resources','e.g. tape measure with 1 mm marks')+
 '<div class="data-quality-pair">'+
 F('primaryWhen','When could you start?','',{type:'date'})+
 F('primaryWhere','Where would you collect it?','Setting without personal details')+
 '</div></div></details>'+
 '</section>'+
 primaryQuantitiesView(state,{F,select,e,icon})+
 '<p class="primary-hint">This is a plan, not collected results. You can refine a method or precision after a small permitted trial.</p>';
}

export function primaryDataSampling(state,{F,select,e,icon}){
 const f=state.planning.fields,method=samplingMethod(f.primarySamplingMethod);
 const methodCard=method?'<div class="primary-sampling-feedback" aria-live="polite">'+
 '<div class="primary-feedback-head">'+icon('sparkles')+' <strong>Sampling spark saved</strong></div>'+
 '<p><b>Useful here:</b> '+e(method.good)+'</p>'+
 '<p><b>Watch out:</b> '+e(method.watch)+'</p>'+
 '</div>':'';
 return label(e,icon,2)+summary(state,{e,icon})+
 '<section class="primary-focus-block">'+
 '<div class="primary-section-title">'+icon('layers')+' <div><h3>Who or what will you choose?</h3>'+
 '<p>Define the group and one sampling unit, then choose a realistic method before collecting anything.</p></div></div>'+
 '<div class="data-quality-pair">'+
 F('primaryPopulation','Population or objects','e.g. the Year 12 students I can access')+
 F('primarySamplingUnit','One sampling unit','e.g. one pupil, one football, or one trial')+'</div>'+
 select('primarySamplingMethod','My census or sampling approach',SAMPLING_METHODS.map(m=>[m.id,m.label]))+
 methodCard+
 select('primarySamplingFrame','Could you identify every eligible unit? (sampling frame)',[
  ['yes','Yes — I have a suitable list or way to identify units'],
  ['no','No — I cannot identify every eligible unit'],
  ['unsure','I need to check'],
  ['not-applicable','Not applicable to this investigation']])+
 select('primaryRepeatable','Could you start quickly and collect more observations later?',[
  ['yes','Yes — easy to start and repeat or extend'],
  ['maybe','Possibly — I need to check access or timing'],
  ['no','Not easily — I may need a smaller plan']])+
 (f.primarySamplingFrame==='no'&&['simple-random','systematic','stratified','cluster'].includes(f.primarySamplingMethod)?
  '<p class="data-quality-warning">'+icon('info')+' This method normally needs a suitable sampling frame. You might need a different approach or keep the plan uncertain.</p>':'')+
 '<details class="primary-step-extra"><summary>'+icon('pencil')+' Explain or refine my sampling decision (optional) '+icon('chevron-down')+'</summary>'+
 '<div class="primary-step-extra-content">'+
 F('primarySamplingFrameDetails','Describe the frame or difficulty','e.g. a class list, or no complete list')+
 F('primarySampling','Why might this method work?','Consider access, speed, bias and follow-up observations',{type:'textarea',rows:2})+
 F('alternativeMethod','Another method or source considered (optional)','One realistic alternative, if you considered one',{type:'textarea',rows:2})+
 '</div></details>'+
 samplingRecap(e,icon)+'</section>'+
 '<section class="primary-focus-block primary-readiness">'+
 select('primaryStatus','Is your primary-data plan ready to try?',[
 ['ready','Yes — I have a workable sampling and recording plan'],
 ['unsure','Still uncertain — I need to check something']])+
 '<p class="primary-hint">You can continue while uncertain. Before marking ready, check the sampling method and recording accuracy for the quantities you will actually measure.</p>'+
 '</section>';
}
