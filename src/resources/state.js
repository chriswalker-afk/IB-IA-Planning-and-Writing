/** Resource choices are local UI preferences, never evidence of completed mathematics. */
export const TOOL_CHOICES = ['', 'sheets', 'desmos'];
export const IMAGE_CHOICES = ['', 'import', 'visual', 'points'];
const safeKey = k => typeof k === 'string' && k.length <= 300 && !['__proto__','constructor','prototype'].includes(k);
export function createResourceState(){return {preferences:{},hidden:{}};}
export function normalizeResourceState(raw){
 const out=createResourceState();
 if(!raw || typeof raw!=='object' || Array.isArray(raw))return out;
 if(raw.preferences && typeof raw.preferences==='object'){
  for(const [key,value] of Object.entries(raw.preferences).slice(-240)){
   if(!safeKey(key)||!value||typeof value!=='object')continue;
   out.preferences[key]={tool:TOOL_CHOICES.includes(value.tool)?value.tool:'',image:IMAGE_CHOICES.includes(value.image)?value.image:''};
  }
 }
 if(raw.hidden && typeof raw.hidden==='object'){
  for(const [key,value] of Object.entries(raw.hidden).slice(-300))if(safeKey(key)&&value===true)out.hidden[key]=true;
 }
 return out;
}
export function setResourcePreference(state,scope,key,value){
 const allowed=key==='tool'?TOOL_CHOICES:key==='image'?IMAGE_CHOICES:[];
 if(!safeKey(scope)||!allowed.includes(value))return false;
 if(!state.resources)state.resources=createResourceState();
 const prior=state.resources.preferences[scope]||{tool:'',image:''};
 state.resources.preferences[scope]={...prior,[key]:value};
 state.resources=normalizeResourceState(state.resources);
 return true;
}
export function newResourceSession(){return {id:'',query:'',tool:'',category:'',limit:8,discoveryArea:'',discoveryType:'all',discoveryLimit:16,help:false,parent:'',contextMode:'current',mode:'tools',workshopId:'',workshopTerm:'',workshopTrail:[],workshopQuery:'',workshopRoute:'',workshopStep:'show',workshopCheckpoint:0,workshopChoice:'',workshopReturn:false};}
