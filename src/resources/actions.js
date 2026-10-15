import {resourceById,TOOLS,RESOURCES} from './catalog.js';
import {resourceContext} from './context.js';
import {newResourceSession,setResourcePreference,normalizeResourceState} from './state.js';
/** Returns UI intents; never updates an entry, source, approval or mathematical stage. */
export function resourceAction(state,session,action,data={},parent=''){
 if(!action.startsWith('resource-'))return null;
 const help=data.resourceHelp==='true';
 if(action==='resource-open'||action==='resource-browse'){
  if(action==='resource-open'&&!resourceById(data.resourceId))return {ok:false,error:'That tutorial is not available.'};
  if(parent!=='resources')Object.assign(session,newResourceSession(),{help,parent:parent==='stuck'?'stuck':''});
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
