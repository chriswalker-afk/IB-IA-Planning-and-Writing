/** An independent, ephemeral viewer. Student state is read through getState and never written. */
import {exampleById} from './catalog.js';
import {exampleContext,selectExamples,defaultVariant} from './context.js';
import {e,renderCard,library,libraryResults} from './views.js';
export function createExampleController(getState){
 let dialog=null,session=null,returnFocus=null,scroll=0,overflow='';
 function ensure(){
  if(dialog)return;
  dialog=document.createElement('dialog');dialog.id='exampleDialog';dialog.className='ex-dialog';
  dialog.setAttribute('aria-labelledby','ex-dialog-title');
  dialog.innerHTML='<header class="ex-dialog-head"><div><p class="ex-eyebrow">IA PATHFINDER · OPTIONAL HELP</p><h2 id="ex-dialog-title">Compare examples</h2></div><button type="button" class="btn btn-secondary" data-example-close>Return to my work <span aria-hidden="true">×</span></button></header><div id="ex-body" class="ex-dialog-body"></div>';
  document.body.append(dialog);
  dialog.addEventListener('cancel',evt=>{evt.preventDefault();close();});
  dialog.addEventListener('click',evt=>{
   if(evt.target===dialog){const r=dialog.getBoundingClientRect();if(evt.clientX<r.left||evt.clientX>r.right||evt.clientY<r.top||evt.clientY>r.bottom)close();}
  });
 }
 function render(focus=true){
  const card=exampleById(session.id),host=dialog.querySelector('#ex-body');
  const related=session.related.filter(x=>x.id!==session.id);
  const nav='<nav class="ex-view-nav" aria-label="Example navigation"><button type="button" class="btn btn-quiet" data-example-library>Browse all examples</button><span class="ex-small">'+e(session.context.mode)+' · '+e(session.context.label.slice(0,90))+'</span></nav>';
  host.innerHTML=nav+(card?(related.length?'<div class="ex-related"><span>Also useful here:</span>'+related.map(c=>'<button type="button" data-example-select="'+c.id+'">'+e(c.title)+'</button>').join('')+'</div>':'')+renderCard(card,{context:session.context,variant:session.variant}):library(session));
  host.scrollTop=0;
  if(focus)host.querySelector('.ex-heading')?.focus({preventScroll:true});
 }
 function open(options={},trigger=document.activeElement){
  ensure();
  const state=getState(),context=exampleContext(state,options),related=selectExamples(state,options);
  const card=exampleById(options.id)||related[0];
  session={context,related,id:options.browse?'':card?.id||'',variant:card?defaultVariant(card,context):'',query:'',category:'',kind:''};
  if(!dialog.open){returnFocus=trigger;scroll=window.scrollY;overflow=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';dialog.showModal();}
  render();
 }
 function close(){
  if(!dialog?.open)return;
  dialog.close();document.documentElement.style.overflow=overflow;window.scrollTo({top:scroll,behavior:'auto'});
  if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
  else document.querySelector('#main')?.focus({preventScroll:true});
 }
 function click(evt){
  if(!(evt.target instanceof Element))return;
  const trigger=evt.target.closest('[data-action="example-open"]');
  if(trigger){
   evt.preventDefault();evt.stopImmediatePropagation();
   const d=trigger.dataset;open({topic:d.exampleTopic,cue:d.exampleCue,id:d.exampleId,help:d.exampleHelp==='true',browse:d.exampleBrowse==='true'},trigger);return;
  }
  const legacy=evt.target.closest('[data-action]');
  if(legacy){
   const d=legacy.dataset;
   if((d.action==='guidance-writing-action'&&d.guidanceEvent==='example')||
     (d.action==='completion-open'&&d.node==='C10E')||
     (d.action==='completion-route'&&/intro contrast examples/i.test(d.condition||''))){
    evt.preventDefault();evt.stopImmediatePropagation();open({topic:d.guidanceId?undefined:'introduction',cue:d.guidanceId},legacy);return;
   }
  }
  if(!dialog?.open||!dialog.contains(evt.target))return;
  const btn=evt.target.closest('button');if(!btn)return;
  evt.preventDefault();evt.stopImmediatePropagation();
  if(btn.hasAttribute('data-example-close'))close();
  else if(btn.hasAttribute('data-example-library')){session.id='';render();}
  else if(btn.dataset.exampleSelect){
   const card=exampleById(btn.dataset.exampleSelect);if(!card)return;
   session.id=card.id;session.variant=defaultVariant(card,session.context);render();
  }
 }
 function input(evt){
  const t=evt.target;if(!dialog?.open||!dialog.contains(t))return;
  if(t.dataset.exampleFilter){
   evt.stopImmediatePropagation();const key=t.dataset.exampleFilter;
   // A text input's later blur/change must not replace a card between pointerdown and click.
   const value=t.value.slice(0,160);
   if(['query','category','kind'].includes(key)&&session[key]!==value){session[key]=value;dialog.querySelector('#ex-results').innerHTML=libraryResults(session);}
  }
  if(evt.type==='change'&&t.hasAttribute('data-example-variant')){
   evt.stopImmediatePropagation();session.variant=t.value;const top=dialog.querySelector('#ex-body').scrollTop;render(false);
   dialog.querySelector('#ex-body').scrollTop=top;dialog.querySelector('#ex-variant')?.focus({preventScroll:true});
  }
 }
 function keydown(evt){
  if(!dialog?.open)return;
  // The underlying app may have a drawer focus trap. Keep it out of this top-layer viewer.
  if(evt.key==='Escape'){evt.preventDefault();evt.stopImmediatePropagation();close();}
  else if(evt.key==='Tab'){
   evt.stopImmediatePropagation();
   const nodes=[...dialog.querySelectorAll('button,input,select,summary,a[href]')].filter(n=>!n.disabled&&n.getClientRects().length);
   if(!nodes.length)return;
   const first=nodes[0],last=nodes.at(-1),active=document.activeElement;
   if(evt.shiftKey&&(active===first||!nodes.includes(active))){evt.preventDefault();last.focus();}
   else if(!evt.shiftKey&&(active===last||!dialog.contains(active))){evt.preventDefault();first.focus();}
  }
 }
 document.addEventListener('click',click,true);document.addEventListener('input',input,true);document.addEventListener('change',input,true);document.addEventListener('keydown',keydown,true);
 return {open,close,destroy(){close();dialog?.remove();document.removeEventListener('click',click,true);document.removeEventListener('input',input,true);document.removeEventListener('change',input,true);document.removeEventListener('keydown',keydown,true);}};
}
