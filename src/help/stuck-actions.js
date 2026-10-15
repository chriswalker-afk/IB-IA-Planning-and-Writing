import {adviceFor,availableTopics} from './stuck.js';
/** Returns a navigation intent; only explicit workspace actions execute it. */
export function stuckAction(state,action,data={}){
 if(!action.startsWith('stuck-'))return null;
 const s=state.completion.support;
 if(action==='stuck-menu'){s.selected='';s.more=false;return{ok:true};}
 if(action==='stuck-topic'){
  if(!availableTopics(state).some(t=>t.id===data.topic))return{ok:false,error:'Choose an available help topic.'};
  s.selected=data.topic;s.more=false;return{ok:true};
 }
 if(action==='stuck-save'){
  const draft=s.drafts[s.selected];
  if(!draft?.action.trim())return{ok:false,error:'Write the small action you want to keep. You can also return without saving an action.'};
  s.task={issue:s.selected,action:draft.action.trim().slice(0,1000),note:draft.note.trim().slice(0,3000),status:'pending'};return{ok:true,message:'Your next action is saved here, still pending. Your IA has not changed.',saved:true};
 }
 if(action==='stuck-resume'){
  if(!s.task)return{ok:false,error:'There is no saved action.'};
  if(!availableTopics(state).some(t=>t.id===s.task.issue))return{ok:false,error:'Your project has changed. Your saved action is preserved; choose a problem relevant to your current work.'};
  s.selected=s.task.issue;return{ok:true};
 }
 if(action==='stuck-resolved'){if(s.task)s.task.status='resolved';return{ok:true,message:'Recorded as helpful. No mathematical stage has been marked complete.'};}
 if(action==='stuck-stay'){s.returnPending=false;return{ok:true,stay:true};}
 if(action==='stuck-return')return{ok:true,return:true};
 if(action==='stuck-backup')return{ok:true,backup:true};
 if(action==='stuck-teacher')return{ok:true,target:{route:'planning',node:'N06T'}};
 if(action==='stuck-work'){
  const a=adviceFor(state,s.selected);return a?{ok:true,target:a.target}:{ok:false,error:'Choose a problem first.'};
 }
 return{ok:false,error:'That help action is not available.'};
}
