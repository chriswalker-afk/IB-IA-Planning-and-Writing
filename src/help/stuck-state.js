/** Small, private support state. No help action is a mathematical result. */
import {TOPIC_IDS} from './stuck-catalog.js';
const str=(v,n=3000)=>typeof v==='string'?v.slice(0,n):'';
const routes=['home','planning','completing','checking','path','report'];
export const isStuckNode=n=>/^C95(?:D|A|L|Q|N)?$/.test(n||'');
export function createStuckState(){return{origin:null,selected:'',browse:false,more:false,returnPending:false,
 drafts:Object.fromEntries(TOPIC_IDS.map(id=>[id,{action:'',note:''}])),task:null};}
export function normalizeStuckState(v){
 const s=createStuckState();if(!v||typeof v!=='object')return s;
 if(v.origin&&routes.includes(v.origin.route)){
  const o=v.origin;s.origin={route:o.route,planNode:/^N\d{2}[A-Z]?$/.test(o.planNode)?o.planNode:'N00',
   node:/^C\d{2}[A-Z]?$/.test(o.node)?o.node:'C04',entryId:str(o.entryId,160),nextFromEntryId:str(o.nextFromEntryId,160),
   scrollY:Math.max(0,Math.min(100000,Number(o.scrollY)||0)),focusId:str(o.focusId,180)};
 }
 s.selected=TOPIC_IDS.includes(v.selected)?v.selected:'';s.browse=v.browse===true;s.more=v.more===true;s.returnPending=!!s.origin&&v.returnPending===true;
 for(const id of TOPIC_IDS)if(v.drafts?.[id])s.drafts[id]={action:str(v.drafts[id].action,1000),note:str(v.drafts[id].note)};
 if(v.task&&TOPIC_IDS.includes(v.task.issue)&&str(v.task.action).trim())s.task={issue:v.task.issue,action:str(v.task.action,1000),note:str(v.task.note),status:v.task.status==='resolved'?'resolved':'pending'};
 return s;
}
export function captureStuckOrigin(state,{scrollY=0,focusId=''}={}){
 const c=state.completion,s=c.support;
 if(isStuckNode(c.current)&&state.route==='completing'&&s.origin)return s.origin;
 const origin={route:state.route,planNode:state.planning.current,node:c.current,
  entryId:state.entries[c.activeEntryIndex]?.id||'',nextFromEntryId:c.nextFromEntryId||'',scrollY,focusId};
 const old=s.origin;
 if(!old||['route','planNode','node','entryId','nextFromEntryId'].some(k=>old[k]!==origin[k])){s.selected='';s.browse=false;s.more=false;}
 s.origin=origin;s.returnPending=false;return origin;
}
