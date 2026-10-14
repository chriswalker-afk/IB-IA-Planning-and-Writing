/** Student-owned writing guidance progress. No action writes to the IA document. */
import {eligibleWritingCues} from "./writing-guidance.js";
const actions=new Set(["write-now","covered-start","covered","not-relevant","defer","example","save-note","written"]);
const savedStatus=new Set(["already-covered","not-relevant","deferred","noted","written"]);
const str=v=>typeof v==="string"?v.trim():"";
export function actOnWritingCue(state,{id,key,action}){
 if(!actions.has(action))return{ok:false,error:"Unknown writing prompt action."};
 const node=state.completion.current;
 const cue=eligibleWritingCues(state,node,{includingAcknowledged:true}).find(x=>x.id===id&&x.key===key);
 if(!cue)return{ok:false,error:"This writing suggestion no longer matches the actual project context."};
 const ui=state.completion.guidanceUi;
 if(!state.writingLedger||typeof state.writingLedger!=="object")state.writingLedger={};
 const old=state.writingLedger[key];
 const base=old?.fingerprint===cue.fingerprint?old:{};
 if(action==="example"){
  ui.exampleKey=ui.exampleKey===key?"":key;
  return{ok:true,action};
 }
 if(action==="covered-start"){
  ui.coveredKey=ui.coveredKey===key?"":key;
  ui.writeKey="";ui.coveredKey="";ui.exampleKey="";
  ui.locationDraft=str(base.location);
  return{ok:true,action};
 }
 if(action==="write-now"){
  if(ui.writeKey===key){ui.writeKey="";return{ok:true,action:"closed"};}
  ui.writeKey=key;ui.coveredKey="";ui.exampleKey="";
  ui.noteDraft=str(base.note);ui.locationDraft=str(base.location);
  return{ok:true,action};
 }
 const states={"covered":"already-covered","not-relevant":"not-relevant","defer":"deferred",
  "save-note":"noted","written":"written"};
 if(action==="save-note"&&!str(ui.noteDraft))
  return{ok:false,error:"Write your own short note or use 'I updated my IA' after editing the actual document."};
 const location=(action==="save-note"||action==="written"||action==="covered")?
  (str(ui.locationDraft)||str(base.location)).slice(0,400):str(base.location).slice(0,400);
 const note=(action==="save-note"||action==="written")?str(ui.noteDraft).slice(0,5000):str(base.note).slice(0,5000);
 const updated={
  id,scope:cue.scope,fingerprint:cue.fingerprint,
  status:states[action],location,note,at:new Date().toISOString(),
  claimedInIA:action==="written"||action==="covered"
 };
 state.writingLedger[key]=updated;
 // Dismissing one should never unleash an unwanted queue of other messages.
 ui.quietNode=node;
 ui.writeKey="";ui.exampleKey="";
 if(["save-note","written","covered"].includes(action)){ui.locationDraft="";ui.noteDraft="";}
 return{ok:true,record:updated};
}
export function writingCueStatus(state,key){
 const item=state.writingLedger?.[key];
 if(!item||!savedStatus.has(item.status))return null;
 return item;
}
export function quietAutoWritingCue(state,node=state.completion.current){
 return state.completion.guidanceUi.quietNode===node;
}
export function writingStatusSummary(state){
 const list=Object.values(state.writingLedger||{}).filter(x=>x&&savedStatus.has(x.status));
 return list.reduce((a,x)=>(a[x.status]=(a[x.status]||0)+1,a),{});
}
