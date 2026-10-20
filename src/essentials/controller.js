import {CRITERIA,courseLevel} from './catalog.js';
import {formatView,rubricView,submissionView,essentialsSourceNote} from './views.js';
import {dismissCriteria} from './context.js';
/** Reference navigation is ephemeral. Only onEdit persists an explicit student edit. */
export function createEssentialsController({getState,onEdit=()=>false,onChangedClose=()=>{}}){
 let dialog=null,session=null,origin=null,originAttrs=[],scroll=0,overflow='',edited=false;
 const tabs=[['format','Format & length'],['rubric','Assessment criteria'],['submission','Before submission']];
 function ensure(){
  if(dialog)return;
  dialog=document.createElement('dialog');dialog.id='essentialsDialog';dialog.className='ess-dialog';dialog.setAttribute('aria-labelledby','ess-dialog-title');
  dialog.innerHTML='<header class="ess-dialog-head"><div><p>IA PATHFINDER</p><h2 id="ess-dialog-title">IA essentials</h2></div><button type="button" class="btn btn-secondary" data-essentials-close>Return to my work <span aria-hidden="true">×</span></button></header><nav class="ess-tabs" aria-label="IA essentials sections">'+tabs.map(([id,title])=>'<button type="button" data-essentials-tab="'+id+'">'+title+'</button>').join('')+'</nav><div class="ess-dialog-body" id="ess-body"></div>';
  document.body.append(dialog);
  dialog.addEventListener('cancel',evt=>{evt.preventDefault();close();});
  dialog.addEventListener('click',evt=>{if(evt.target===dialog){const r=dialog.getBoundingClientRect();if(evt.clientX<r.left||evt.clientX>r.right||evt.clientY<r.top||evt.clientY>r.bottom)close();}});
 }
 function render(focus=true){
  const host=dialog.querySelector('#ess-body');
  host.innerHTML=(session.tab==='rubric'?rubricView(getState(),session):session.tab==='submission'?submissionView(getState(),session):formatView(getState()))+essentialsSourceNote(getState());
  dialog.querySelectorAll('[data-essentials-tab]').forEach(b=>b.setAttribute('aria-current',b.dataset.essentialsTab===session.tab?'page':'false'));
  host.scrollTop=0;if(focus)host.querySelector('.ess-heading')?.focus({preventScroll:true});
 }
 function open(options={},trigger=document.activeElement){
  ensure();
  // Returning to an existing parent reference must not leave it behind a modal child.
  if(dialog.open && trigger?.closest?.('#exampleDialog'))document.querySelector('#exampleDialog[open] [data-example-close]')?.click();
  if(!dialog.open){
   session={tab:'format',criterion:'A',mode:/^C90/.test(getState().completion?.current||'')?'final':'draft',level:''};
   origin=trigger;originAttrs=trigger instanceof Element?[...trigger.attributes].filter(a=>a.name==='id'||a.name.startsWith('data-')).map(a=>[a.name,a.value]):[];
   scroll=window.scrollY;overflow=document.documentElement.style.overflow;edited=false;
  }
  if(tabs.some(([id])=>id===options.tab))session.tab=options.tab;
  if(Object.hasOwn(CRITERIA,options.criterion||''))session.criterion=options.criterion;
  if(['draft','final'].includes(options.mode))session.mode=options.mode;
  if(['SL','HL'].includes(options.level))session.level=options.level;
  if(!dialog.open){document.documentElement.style.overflow='hidden';dialog.showModal();}
  render();
 }
 function close(){
  if(!dialog?.open)return;
  dialog.close();document.documentElement.style.overflow=overflow;
  if(edited)onChangedClose();
  window.scrollTo({top:scroll,behavior:'auto'});
  const replacement=origin?.isConnected?origin:[...document.querySelectorAll('button')].find(b=>originAttrs.length&&originAttrs.every(([k,v])=>b.getAttribute(k)===v));
  (replacement||document.querySelector('#main'))?.focus({preventScroll:true});
 }
 function click(evt){
  if(!(evt.target instanceof Element))return;
  const toggle=evt.target.closest('[data-action="criteria-toggle"]');
  if(toggle){
   evt.preventDefault();evt.stopImmediatePropagation();const panel=toggle.closest('[data-criteria-key]'),body=panel?.querySelector('.criteria-content');if(!body)return;
   body.hidden=!body.hidden;dismissCriteria(panel.dataset.criteriaKey,body.hidden);toggle.setAttribute('aria-expanded',String(!body.hidden));return;
  }
  const trigger=evt.target.closest('[data-action="essentials-open"]');
  if(trigger){evt.preventDefault();evt.stopImmediatePropagation();const d=trigger.dataset;open({tab:d.essentialsTab,criterion:d.essentialsCriterion,mode:d.essentialsMode,level:d.essentialsLevel},trigger);return;}
  if(!dialog?.open||!dialog.contains(evt.target))return;
  const b=evt.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-essentials-close')){evt.preventDefault();evt.stopImmediatePropagation();close();return;}
  for(const [attribute,key,valid] of [['essentialsTab','tab',tabs.map(t=>t[0])],['essentialsCriterion','criterion',Object.keys(CRITERIA)],['essentialsMode','mode',['draft','final']]]){
   if(valid.includes(b.dataset[attribute])){evt.preventDefault();evt.stopImmediatePropagation();session[key]=b.dataset[attribute];render();return;}
  }
 }
 function input(evt){
  const t=evt.target;if(!dialog?.open||!(t instanceof Element)||!dialog.contains(t))return;
  if(evt.type==='change'&&t.hasAttribute('data-essentials-level')){
   evt.stopImmediatePropagation();session.level=['SL','HL'].includes(t.value)?t.value:'';const top=dialog.querySelector('#ess-body').scrollTop;render(false);dialog.querySelector('#ess-body').scrollTop=top;dialog.querySelector('#ess-level')?.focus({preventScroll:true});return;
  }
  if(t.dataset.essReview){
   evt.stopImmediatePropagation();const changed=onEdit({mode:session.mode,id:t.dataset.essId,field:t.dataset.essReview,value:t.value,level:session.level||courseLevel(getState())});
   if(changed){edited=true;dialog.querySelector('#ess-review-status').textContent='Your own self-review notes are saved on this device. Your IA document and stage status have not been marked complete.';
    if(t.dataset.essId==='E'&&t.dataset.essReview==='selfMark'){const note=t.closest('.ess-evidence-card')?.querySelector('[data-evidence-level]');if(note)note.textContent=t.value===''?'No self-mark recorded.':'Self-mark recorded against '+(session.level||courseLevel(getState()))+'.';}
   }
  }
 }
 function keydown(evt){
  if(!dialog?.open||document.activeElement?.closest('dialog')!==dialog)return;
  if(evt.key==='Escape'){evt.preventDefault();evt.stopImmediatePropagation();close();}
  else if(evt.key==='Tab'){
   evt.stopImmediatePropagation();const nodes=[...dialog.querySelectorAll('button,input,select,textarea,summary,a[href]')].filter(n=>!n.disabled&&n.getClientRects().length),first=nodes[0],last=nodes.at(-1),a=document.activeElement;
   if(evt.shiftKey&&(a===first||!nodes.includes(a))){evt.preventDefault();last?.focus();}
   else if(!evt.shiftKey&&(a===last||!dialog.contains(a))){evt.preventDefault();first?.focus();}
  }
 }
 document.addEventListener('click',click,true);document.addEventListener('input',input,true);document.addEventListener('change',input,true);document.addEventListener('keydown',keydown,true);
 return {open,close,destroy(){close();dialog?.remove();document.removeEventListener('click',click,true);document.removeEventListener('input',input,true);document.removeEventListener('change',input,true);document.removeEventListener('keydown',keydown,true);}};
}
