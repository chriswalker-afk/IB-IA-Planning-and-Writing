/** Read-only, keyboard-accessible IA Studio troubleshooting pop-in (Pass 3). */
import {studioHelpFor} from "./studio-help.js";
import {checkingHelpFor} from "./checking-help.js";
const fieldSelector=key=>'[data-bind="completion.fields.'+key+'"]';
const within=key=>'[data-bind$=".'+key+'"]';
const bounded=x=>typeof x==="string"?x.slice(0,250):"";
export function createStudioHelpController({getState,escapeHtml,onHub,onNavigate,onCheckingTarget}){
 const e=escapeHtml;
 let dialog=null,origin=null,active=null,selected=0,source='studio';
 function ensure(){
  if(dialog)return;
  dialog=document.createElement("dialog");
  dialog.id="studioStuckDialog";
  dialog.className="stuck-context-dialog stuck-studio-dialog";
  dialog.setAttribute("aria-labelledby","studioStuckTitle");
  dialog.setAttribute("aria-describedby","studioStuckIntro");
  document.body.append(dialog);
  dialog.addEventListener("cancel",event=>{event.preventDefault();close();});
  dialog.addEventListener("click",event=>{
   if(event.target===dialog){
    const r=dialog.getBoundingClientRect();
    if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();
    return;
   }
   const problem=event.target.closest("[data-studio-stuck-choice]");
   if(problem){
    selected=Math.max(0,Math.min(active?.choices.length-1||0,Number(problem.dataset.studioStuckChoice)||0));
    render();
    dialog.querySelector("#studioStuckAction")?.focus({preventScroll:true});
    return;
   }
   if(event.target.closest("[data-studio-stuck-close]")){close();return;}
   if(event.target.closest("[data-studio-stuck-hub]")){
    const trigger=origin;close(false);onHub?.(trigger);return;
   }
   if(event.target.closest("[data-studio-stuck-resource]")){
    // The registered resource action proceeds on the document's delegated
    // click handler. Release the modal first so the guide is usable.
    close(false);return;
   }
   if(event.target.closest("[data-studio-stuck-go]")){
    const choice=active?.choices[selected],prior=origin;
    if(!choice)return;
    const target=choice.targetNode;
    const spot=active.spot,node=active.node,context=source;
    close(false);
    if(context==="checking"){
     onCheckingTarget?.(choice.targetCheck||node);
     return;
    }
    if(target&&target!==node){onNavigate?.(target);return;}
    if(target===node){
     document.querySelector('[data-source-node="'+node+'"]')?.scrollIntoView?.({block:"start",behavior:"auto"});
     prior?.focus?.({preventScroll:true});return;
    }
    if(spot.startsWith("field:")){
     const field=spot.slice(6);
     // Prefer the actual active entry and canonical completion field, not a
     // copied spark in the introduction or a prior stage's archived note.
     const state=getState(),index=state.completion?.activeEntryIndex;
     const specific=index>=0?document.querySelector('[data-bind="entries.'+index+'.'+field+'"]'):null;
     const candidate=specific||document.querySelector(fieldSelector(field))||
      [...document.querySelectorAll(within(field))].find(el=>el.getClientRects().length);
     if(candidate){candidate.focus({preventScroll:true});return;}
    }
    const step=spot.startsWith("part:")?spot.slice(5):"";
    const selector=step?
     '[data-show-first-part="'+step+'"],[data-first-maths-writing-part="'+step+'"],[data-conclusion-part="'+step+'"]':"";
    const part=selector?document.querySelector(selector):null;
    if(part){part.scrollIntoView?.({block:"center",behavior:"auto"});
     const heading=part.querySelector("h3")||part;
     if(!heading.hasAttribute("tabindex"))heading.setAttribute("tabindex","-1");
     heading.focus?.({preventScroll:true});
    }else if(prior?.isConnected)prior.focus({preventScroll:true});
   }
  });
 }
 function render(){
  if(!dialog||!active)return;
  const chosen=active.choices[selected]||active.choices[0];if(!chosen)return;
  const tags=[
   active.route?"Possible/selected route: "+bounded(active.route):"",
   active.method?"Recorded method: "+bounded(active.method):"",
   active.selectedOutcome?"Student-confirmed outcome: "+bounded(active.selectedOutcome):""
  ].filter(Boolean);
  dialog.innerHTML='<div class="stuck-context-top"><span class="stuck-context-icon" aria-hidden="true">?</span>'+
   '<div><p class="stuck-context-eyebrow">I AM STUCK · '+(source==="checking"?"CHECKING":"IA STUDIO")+'</p>'+
   '<h2 id="studioStuckTitle" tabindex="-1">'+e(active.title)+'</h2></div>'+
   '<button type="button" class="stuck-context-close" data-studio-stuck-close aria-label="Close help">×</button></div>'+
   '<div class="stuck-context-body"><p id="studioStuckIntro">Which specific mathematical obstacle is holding you up? Choose the closest. Nothing in your IA is changed by reading this advice.</p>'+
   '<p class="stuck-context-selection">'+e(active.source)+
     (active.course?' · '+e(active.course):'')+'</p>'+
   (tags.length?'<div class="stuck-context-factual" role="note">'+tags.map(t=>'<span>'+e(t)+'</span>').join('')+'</div>':"")+
   '<div class="stuck-context-choices" role="group" aria-label="What are you stuck with?">'+
    active.choices.map((card,i)=>
      '<button type="button" data-studio-stuck-choice="'+i+
      '" aria-pressed="'+(i===selected)+'" class="stuck-context-choice'+(i===selected?' selected':'')+
      '">'+e(card.label)+'</button>').join("")+'</div>'+
   '<section class="stuck-context-recovery" aria-live="polite"><h3>First, ask yourself</h3>'+
   '<p>'+e(chosen.question)+'</p>'+
   '<h3 id="studioStuckAction" tabindex="-1">Try this now</h3><p>'+e(chosen.action)+'</p>'+
   '<h3>How to check whether it helped</h3><p>'+e(chosen.check)+'</p>'+
   '<p class="stuck-context-stop"><strong>A useful stopping point:</strong> '+e(chosen.stop)+'</p>'+
   '<details><summary>If I am still stuck</summary><p>'+e(chosen.fallback)+'</p>'+
   '<p class="stuck-context-boundary">'+e(chosen.boundary)+'</p></details></section>'+
   '<div class="stuck-context-actions"><button type="button" class="btn btn-primary" data-studio-stuck-go>'+
    e(source==="checking"?"Open this document check":
      chosen.targetNode?chosen.targetLabel||"Go to the relevant mathematical work":
      active.spot.startsWith("field:")?"Return to this question":
      active.spot.startsWith("part:")?"Return to this mathematical part":
      "Return to my mathematics")+'</button>'+
   (chosen.resourceId?'<button type="button" class="btn btn-secondary" data-studio-stuck-resource data-action="resource-open" data-resource-id="'+e(chosen.resourceId)+'" data-resource-help="true">Open related tutorial</button>':"")+
   '<button type="button" class="btn btn-quiet" data-studio-stuck-hub>More problems in I am stuck</button></div>'+
   '</div>';
 }
 function open(key,trigger,kind="studio"){
  if(typeof key!=="string")return false;
  const split=key.indexOf(":"),node=key.slice(0,split),spot=key.slice(split+1);
  if(split<0)return false;
  const state=getState();
  if(kind==="checking"&&state?.route!=="checking")return false;
  if(kind==="studio"&&(state?.route!=="completing"||node!==state.completion?.current))return false;
  const help=kind==="checking"?checkingHelpFor(state,spot):studioHelpFor(state,spot);
  if(!help||help.node!==node)return false;
  ensure();if(dialog.open)dialog.close();active=help;selected=0;origin=trigger;source=kind;
  render();dialog.showModal();
  dialog.querySelector("#studioStuckTitle")?.focus({preventScroll:true});
  return true;
 }
 function close(restore=true){
  if(!dialog?.open)return;
  dialog.close();
  const old=origin;active=null;origin=null;
  if(restore&&old?.isConnected)old.focus({preventScroll:true});
 }
 const click=event=>{
  const button=event.target?.closest?.("[data-studio-stuck],[data-checking-stuck]");
  if(!button)return;
  event.preventDefault();event.stopImmediatePropagation();
  const checking=button.hasAttribute("data-checking-stuck");
  open(checking?button.dataset.checkingStuck:button.dataset.studioStuck,
   button,checking?"checking":"studio");
 };
 document.addEventListener("click",click,true);
 return{open,close,destroy(){
  close(false);document.removeEventListener("click",click,true);dialog?.remove();dialog=null;
 }};
}
