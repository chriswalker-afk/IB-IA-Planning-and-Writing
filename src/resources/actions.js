import {resourceById,TOOLS,RESOURCES} from './catalog.js';
import {resourceContext} from './context.js';
import {newResourceSession,setResourcePreference,normalizeResourceState} from './state.js';
import {REPRESENTATION_TOOLS} from '../diagrams/representation-registry.js';
import {PATHWAY_LEARNING,lessonById,definitionById,workshopLessonForEntry} from '../workshop/catalog.js';
/** Returns UI intents; never updates an entry, source, approval or mathematical stage. */
export function resourceAction(state,session,action,data={},parent=''){
 if(!action.startsWith('resource-'))return null;
 const help=data.resourceHelp==='true';
 if(action==='resource-workshop'){
  const returning=parent==='resources'&&data.workshopResume==='true'&&session.workshopReturn;
  if(parent!=='resources')Object.assign(session,newResourceSession(),{help,parent:parent==='stuck'?'stuck':''});
  session.mode='workshop';session.id='';
  const id=String(data.workshopRoute||'');
  if(!returning){
   session.workshopRoute=id&&Object.hasOwn(PATHWAY_LEARNING,id)?id:'';
   const chosen=String(data.workshopId||'');
   const ctx=resourceContext(state,{help:session.help});
   session.workshopId=lessonById(chosen)?chosen:(id?'':workshopLessonForEntry(ctx.entry));
   session.workshopTerm='';session.workshopTrail=[];
   session.workshopStep='show';session.workshopCheckpoint=0;session.workshopChoice='';
  }
  // Resuming from a software tutorial returns to the current learning checkpoint.
  session.workshopReturn=true;
  return {ok:true,open:true};
 }
 if(action==='resource-workshop-tools'){session.mode='tools';session.id='';return {ok:true,open:true};}
 if(action==='resource-workshop-home'){session.mode='workshop';session.workshopId='';session.workshopTerm='';session.workshopTrail=[];session.workshopChoice='';return {ok:true,open:true};}
 if(action==='resource-workshop-lesson'){
  const id=String(data.workshopId||'');
  if(!lessonById(id))return {ok:false,error:'That mathematical lesson is not available.'};
  if(session.workshopTerm)session.workshopTrail=[...(Array.isArray(session.workshopTrail)?session.workshopTrail:[]),{kind:'term',id:session.workshopTerm}].slice(-12);
  else if(session.workshopId&&session.workshopId!==id)session.workshopTrail=[...(Array.isArray(session.workshopTrail)?session.workshopTrail:[]),{kind:'lesson',id:session.workshopId}].slice(-12);
  session.mode='workshop';session.workshopId=id;session.workshopTerm='';session.workshopStep='show';session.workshopCheckpoint=0;session.workshopChoice='';
  return {ok:true,open:true};
 }
 if(action==='resource-workshop-term'){
  const id=String(data.workshopId||'');
  if(!definitionById(id))return {ok:false,error:'That mathematical definition is not available.'};
  if(session.workshopTerm&&session.workshopTerm!==id)session.workshopTrail=[...(Array.isArray(session.workshopTrail)?session.workshopTrail:[]),{kind:'term',id:session.workshopTerm}].slice(-12);
  else if(session.workshopId)session.workshopTrail=[...(Array.isArray(session.workshopTrail)?session.workshopTrail:[]),{kind:'lesson',id:session.workshopId}].slice(-12);
  session.mode='workshop';session.workshopId='';session.workshopTerm=id;
  return {ok:true,open:true};
 }
 if(action==='resource-workshop-back'){
  const trail=Array.isArray(session.workshopTrail)?session.workshopTrail:[];
  const previous=trail[trail.length-1];
  if(!previous||!(previous.kind==='term'?definitionById(previous.id):previous.kind==='lesson'?lessonById(previous.id):false))
   return {ok:false,error:'There is no previous Workshop item.'};
  session.workshopTrail=trail.slice(0,-1);
  session.mode='workshop';session.workshopTerm=previous.kind==='term'?previous.id:'';
  session.workshopId=previous.kind==='lesson'?previous.id:'';
  return {ok:true,open:true};
 }
 if(action==='resource-workshop-step'){
  const step=String(data.workshopStep||'');
  if(!lessonById(session.workshopId)||!['show','help','turn'].includes(step))return {ok:false,error:'That practice step is not available.'};
  session.workshopStep=step;session.workshopCheckpoint=0;session.workshopChoice='';return {ok:true,open:true};
 }
 if(action==='resource-workshop-checkpoint'){
  const parts=lessonById(session.workshopId)?.guided?.parts;
  const direction=Number(data.workshopDirection);
  if(session.workshopStep!=='help'||!parts||![-1,1].includes(direction))return {ok:false,error:'Checkpoint unavailable.'};
  const index=(session.workshopCheckpoint||0)+direction;
  if(index<0||index>=parts.length)return {ok:false,error:'Checkpoint unavailable.'};
  session.workshopCheckpoint=index;session.workshopChoice='';return {ok:true,open:true};
 }
 if(action==='resource-workshop-choice'){
  const l=lessonById(session.workshopId),choice=String(data.workshopChoice||'');
  const exercises=l?.guided?.parts||[l?.guided];const current=exercises[session.workshopCheckpoint||0];
  if(session.workshopStep!=='help'||!current?.options?.some(([id])=>id===choice))return {ok:false,error:'Choose one of the practice answers.'};
  session.workshopChoice=choice;return {ok:true,open:true};
 }
 if(action==='resource-creator-open'){
  const creator=String(data.resourceCreator||"");
  if(!REPRESENTATION_TOOLS.some(tool=>tool.id===creator))
   return {ok:false,error:"That diagram creator is not available."};
  return {ok:true,creator};
 }
 if(action==='resource-creator-return')return {ok:true,creatorReturn:true};
 if(action==='resource-open'||action==='resource-browse'){
  if(action==='resource-open'&&!resourceById(data.resourceId))return {ok:false,error:'That tutorial is not available.'};
  if(parent!=='resources')Object.assign(session,newResourceSession(),{help,parent:parent==='stuck'?'stuck':''});
  if(action==='resource-open'&&session.mode==='workshop')session.workshopReturn=true;
  session.mode='tools';
  session.id=action==='resource-open'?data.resourceId:'';
  return {ok:true,open:true};
 }
 if(action==='resource-hide'){
  const x=resourceContext(state,{help});
  state.resources=normalizeResourceState(state.resources);
  state.resources.hidden[x.hiddenKey]=true;
  state.resources=normalizeResourceState(state.resources);
  return {ok:true,save:true,render:true};
 }
 if(action==='resource-close')return {ok:true,close:true};
 if(action==='resource-list'){session.id='';return {ok:true,open:true};}
 if(action==='resource-clear'){session.query='';session.tool='';session.category='';session.limit=8;return {ok:true,open:true};}
 if(action==='resource-more'){session.limit=Math.min(RESOURCES.length,session.limit+8);return {ok:true,list:true};}
 if(action==='resource-copy')return {ok:true,copy:true};
 return {ok:false,error:'That tutorial action is not available.'};
}
export function resourceFilter(session,key,value){
 if(['workshopQuery','workshopRoute'].includes(key)){
  const next=String(value).slice(0,120);
  if(key==='workshopRoute'&&next!==''&&!Object.hasOwn(PATHWAY_LEARNING,next))return false;
  if(session[key]===next)return false;
  session[key]=next;return true;
 }
 if(!['query','tool','category'].includes(key))return false;
 if(key==='tool'&&value!==''&&!Object.hasOwn(TOOLS,value))return false;
 if(key==='category'&&value!==''&&!RESOURCES.some(r=>r.category===value))return false;
 const next=String(value).slice(0,120);
 // The browser emits change again on blur after input. Do not replace the
 // result button under the pointer and swallow its first click.
 if(session[key]===next)return false;
 session[key]=next;session.limit=8;return true;
}
export function resourcePreference(state,session,key,value){return setResourcePreference(state,resourceContext(state,{help:session.help}).scope,key,value);}
