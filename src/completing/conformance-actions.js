/** Explicit student actions only; never modify the student's external IA. */
import {recordSource,selectSource,toggleInputLink} from './evidence-links.js';
import {setReviewStatus,addFeedbackAction,progressFeedback,reviewChecksFor} from './review.js';
import {setCompletionNode} from './engine.js';
export function conformanceAction(state,action,data={}){
 const c=state.completion,r=c.review;
 if(!action.startsWith('conformance-'))return null;
 if(action==='conformance-source-save')return recordSource(state);
 if(action==='conformance-source-select')return selectSource(state,data.id);
 if(action==='conformance-source-new'){
  if(!c.sourceRecords.length){const saved=recordSource(state);if(!saved.ok)return saved;}
  return recordSource(state,{fresh:true});
 }
 if(action==='conformance-input-link')return toggleInputLink(state,data.kind,data.id,Number(data.index));
 if(action==='conformance-review-status')return setReviewStatus(state,data.mode,data.id,data.status);
 if(action==='conformance-feedback-add')return addFeedbackAction(state);
 if(action==='conformance-feedback-progress')return progressFeedback(state,Number(data.index),data.status);
 if(action==='conformance-review-return'){
  const node=r.returnTo||'C04';r.returnTo='';r.repairKey='';return setCompletionNode(state,node);
 }
 if(action==='conformance-review-repair'||action==='conformance-feedback-repair'){
  let node,entryId,key;
  if(action==='conformance-review-repair'){
   const def=reviewChecksFor(state,data.mode).find(x=>x.id===data.id);
   if(!def)return{ok:false,error:'This check is not available in this review.'};
   key=data.mode+'-'+data.id;node=def.target;entryId=r.records[key].entryId;
  }else{
   const item=r.feedbackItems[Number(data.index)];
   if(!item)return{ok:false,error:'That feedback action is not available.'};
   node=item.node;entryId=item.entryId;key=item.id;
  }
  const mathematical=['C35','C34B','C40','C40D','C40T'].includes(node);
  let index=state.entries.findIndex(e=>e.id===entryId);
  if(mathematical&&index<0)index=state.entries.findLastIndex(e=>e.status==='completed'&&e.result?.trim());
  if(mathematical&&index<0)node='C30';
  r.returnTo=c.current;r.repairKey=key;
  const result=setCompletionNode(state,node);
  if(!result.ok){r.returnTo='';return result;}
  if(mathematical&&index>=0){c.activeEntryIndex=index;state.ui.mathIndex=index;c.nextFromEntryId=state.entries[index].id;}
  return result;
 }
 return{ok:false,error:'Unknown conformance action.'};
}
