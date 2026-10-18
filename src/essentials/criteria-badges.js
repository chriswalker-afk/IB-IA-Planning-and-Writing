import {CRITERIA,courseLevel} from './catalog.js';
import {criteriaContext} from './context.js';
import {escapeHtml} from '../ui/primitives.js';

/** Four deliberately selective opportunities. These are not grades or checklist points. */
export const CRITERION_SPOTS=Object.freeze({
 'planning:N01V:benefit':Object.freeze({
  criterion:'C',location:'Who might benefit, and how could the answer help?',stage:'Planning · motivation',
  why:'Your genuine purpose can influence which mathematical questions you pursue and which decisions you make. A personal story by itself is not evidence of engagement.',
  strong:'Give one real reason for investigating the question. Say what knowing the answer could help you understand, compare or decide, then let that purpose guide your later mathematical choices.',
  avoid:'Avoid invented beneficiaries, generic claims that mathematics is useful, or assuming your original prediction will be proved.',
  reminder:'This is an opportunity to develop personal engagement later, not a mark awarded for completing a planning box.'
 }),
 'planning:N02M:title':Object.freeze({
  criterion:'E',location:'Choose your course and explore possible mathematics.',stage:'Planning · mathematical direction',
  why:'Mathematics should serve your investigation aim and suit your course. Choosing a long list of advanced techniques does not make an investigation mathematically stronger.',
  strong:'Identify a mathematical question that your proposed technique might answer. Keep the choice provisional and check course suitability with your teacher where uncertain.',
  avoid:'Avoid selecting techniques because they appear impressive, or assuming a suggested pathway is formal syllabus verification.',
  reminder:'This is a provisional choice. Criterion E is demonstrated through relevant, correct mathematics and understanding in the completed exploration.'
 }),
 'completing:C34B:title':Object.freeze({
  criterion:'D',location:'Reconnect with aim and prediction',stage:'IA Studio · interpretation',
  why:'Reflection moves beyond describing a result. It considers what the actual mathematics tells you about your aim, its implications and the questions still left open.',
  strong:'Use a result you genuinely obtained. Explain what it establishes in context, how it compares with any earlier expectation, and what you can reasonably conclude or investigate next.',
  avoid:'Avoid merely repeating a graph description, claiming an expected result without evidence, or assuming an inconclusive result is a failure.',
  reminder:'Meaningful reflection can appear throughout the exploration, not only in its final conclusion.'
 }),
 'completing:C70N:title':Object.freeze({
  criterion:'B',location:'Notation and mathematical presentation',stage:'IA Studio · notation review',
  why:'A reader should be able to follow your mathematics through appropriate, consistent symbols, units, definitions, equations and representations.',
  strong:'Check your own document in place. Define a variable when first used, label figures appropriately and distinguish exact equality from justified approximation.',
  avoid:'Avoid undefined symbols, missing units or treating many calculator digits as automatically accurate. Different graph types are not required just to tick a box.',
  reminder:'Fix the original mathematical passage. This review box is not itself evidence that the finished document is correctly communicated.'
 })
});
const TITLE_SPOTS=Object.freeze({
 'planning:N02M':'planning:N02M:title',
 'completing:C34B':'completing:C34B:title',
 'completing:C70N':'completing:C70N:title'
});
export const criterionSpotFor=(route,node)=>TITLE_SPOTS[route+':'+node]||'';
export const isCriterionSpotPage=(route,node)=>route==='planning'&&node==='N01V'||Boolean(criterionSpotFor(route,node));

/** Badge is a real, accessible button; it never edits student work or progress. */
export function criterionBadge(key){
 const spot=Object.hasOwn(CRITERION_SPOTS,key)?CRITERION_SPOTS[key]:null;
 if(!spot)return '';
 return '<button type="button" class="criterion-badge" data-criterion-badge="'+escapeHtml(key)+
  '" aria-label="Criterion '+spot.criterion+' — '+escapeHtml(CRITERIA[spot.criterion].name)+
  ': advice for '+escapeHtml(spot.location)+'" title="Why Criterion '+spot.criterion+' matters here">'+
  '<span aria-hidden="true">'+spot.criterion+'</span></button>';
}
export function criterionMarkedField(html,key){
 return CRITERION_SPOTS[key]?'<div class="criterion-marked-field">'+html+criterionBadge(key)+'</div>':html;
}
export function criterionPageHeading(title,route,node){
 const key=criterionSpotFor(route,node),name=escapeHtml(title);
 return key?'<div class="criterion-title-row"><h1 class="task-heading">'+name+'</h1>'+criterionBadge(key)+'</div>':
  '<h1 class="task-heading">'+name+'</h1>';
}
const block=(name,text)=>'<section class="criterion-popin-part"><h3>'+escapeHtml(name)+'</h3><p>'+escapeHtml(text)+'</p></section>';

/** Native modal gives inert background, Escape behaviour and keyboard focus containment. */
export function createCriterionBadgeController({getState,openRubric=()=>{}}){
 let dialog=null,origin=null,current='';
 function ensure(){
  if(dialog)return;
  dialog=document.createElement('dialog');
  dialog.id='criterionBadgeDialog';
  dialog.className='criterion-popin';
  dialog.setAttribute('aria-labelledby','criterionBadgeTitle');
  dialog.setAttribute('aria-describedby','criterionBadgeSummary');
  document.body.appendChild(dialog);
  dialog.addEventListener('cancel',evt=>{evt.preventDefault();close();});
  dialog.addEventListener('click',evt=>{
   if(evt.target!==dialog)return;
   const r=dialog.getBoundingClientRect();
   if(evt.clientX<r.left||evt.clientX>r.right||evt.clientY<r.top||evt.clientY>r.bottom)close();
  });
 }
 function open(key,trigger=document.activeElement){
  if(!Object.hasOwn(CRITERION_SPOTS,key))return;
  ensure();if(dialog.open)dialog.close();
  current=key;origin=trigger;
  const p=CRITERION_SPOTS[key],c=CRITERIA[p.criterion],state=getState();
  const planned=key==='completing:C34B:title'&&!criteriaContext(state).real;
  const why=planned?'An interpretation can support Reflection only when it is based on actual mathematics. A proposed calculation or prediction is not a result.':p.why;
  const strong=planned?'First complete and check a genuine graph, calculation or argument. Then explain what that specific result means for your aim; do not invent findings.':p.strong;
  const level=p.criterion==='E'?courseLevel(state):'';
  dialog.innerHTML='<div class="criterion-popin-header"><div class="criterion-popin-heading">'+
   '<span class="criterion-popin-letter" aria-hidden="true">'+p.criterion+'</span><div>'+
   '<p class="criterion-popin-eyebrow">RELEVANT HERE · '+escapeHtml(p.stage)+'</p>'+
   '<h2 id="criterionBadgeTitle">Criterion '+p.criterion+' · '+escapeHtml(c.name)+'</h2></div></div>'+
   '<button type="button" class="criterion-popin-close" data-criterion-badge-close aria-label="Close criterion guidance">×</button></div>'+
   '<div class="criterion-popin-body"><p class="criterion-popin-location" id="criterionBadgeSummary">'+escapeHtml(p.location)+'</p>'+
   block('Why this matters here',why)+
   block('What a strong response looks like',strong)+
   block('Avoid this',p.avoid)+
   '<p class="criterion-popin-note">'+escapeHtml(p.reminder)+'</p>'+
   (p.criterion==='E'?'<p class="criterion-popin-level">'+
    escapeHtml(level?'Your recorded course uses the '+level+' Criterion E reference.':'Confirm whether the SL or HL Criterion E rubric applies to your course.')+'</p>':'')+
   '<p class="criterion-popin-disclaimer">A badge is guidance, not evidence, a score or a predicted mark. IB criteria use best-fit judgement across the actual exploration.</p>'+
   '<div class="criterion-popin-actions"><button class="btn btn-secondary" type="button" data-criterion-badge-rubric="'+p.criterion+'">Read the full Criterion '+p.criterion+' rubric</button>'+
   '<button class="btn btn-quiet" type="button" data-criterion-badge-close>Return to my work</button></div></div>';
  dialog.showModal();
  dialog.querySelector('#criterionBadgeTitle')?.setAttribute('tabindex','-1');
  dialog.querySelector('#criterionBadgeTitle')?.focus({preventScroll:true});
 }
 function close(){
  if(!dialog?.open)return;
  dialog.close();
  const target=origin?.isConnected?origin:document.querySelector('[data-criterion-badge="'+current+'"]');
  target?.focus({preventScroll:true});
 }
 function click(evt){
  if(!(evt.target instanceof Element))return;
  const badge=evt.target.closest('[data-criterion-badge]');
  if(badge){
   evt.preventDefault();evt.stopImmediatePropagation();
   open(badge.dataset.criterionBadge,badge);return;
  }
  if(!dialog?.open||!dialog.contains(evt.target))return;
  const rubric=evt.target.closest('[data-criterion-badge-rubric]');
  if(rubric){
   evt.preventDefault();evt.stopImmediatePropagation();
   const id=rubric.dataset.criterionBadgeRubric,anchor=origin;
   close();openRubric(id,anchor);return;
  }
  if(evt.target.closest('[data-criterion-badge-close]')){
   evt.preventDefault();evt.stopImmediatePropagation();close();
  }
 }
 document.addEventListener('click',click,true);
 return {open,close,destroy(){
  close();document.removeEventListener('click',click,true);dialog?.remove();dialog=null;
 }};
}
