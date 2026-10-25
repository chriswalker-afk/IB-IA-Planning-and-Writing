/**
 * Pass 5.2 — inverse calculator editor state and explicit apply transaction.
 * The mathematical engine is pure. Query settings live in the editor record;
 * neither a query nor calculating it changes the saved/printed IA figure.
 */
import {newDistributionInverseQuery,normalizeDistributionDraft,analyzeDistribution} from "./distribution-core.js";
import {inverseDistribution} from "./distribution-inverse.js";
import {setDistributionField} from "./distribution-actions.js";

const parameterKeys={
 normal:["mu","sigma"],binomial:["n","p"],poisson:["lambda"],
 uniform:["a","b"],custom:["customPoints"]
};
const queryFor=studio=>studio.inverse||(studio.inverse=newDistributionInverseQuery());

/** Ignore cosmetic text, source metadata, and manual event boundaries. */
export function distributionInverseModelSignature(raw){
 const d=normalizeDistributionDraft(raw);
 return JSON.stringify([d.kind,...(parameterKeys[d.kind]||[]).map(key=>d[key])]);
}
export function setDistributionInverseField(studio,key,value){
 if(!studio?.draft)return false;
 const query=queryFor(studio);
 if(key==="mode"){
  if(!["left","right","central"].includes(value)||
    value==="central"&&!["normal","uniform"].includes(studio.draft.kind))return false;
 }else if(key==="probability"){
  if(typeof value!=="string")return false;
  value=value.slice(0,64);
 }else return false;
 if(query[key]===value)return false;
 query[key]=value;query.status="idle";query.signature="";
 return true;
}
export function calculateDistributionInverse(studio){
 const query=queryFor(studio),signature=distributionInverseModelSignature(studio.draft);
 const result=inverseDistribution(studio.draft,{mode:query.mode,probability:query.probability});
 query.status="calculated";query.signature=signature;
 return result;
}
/** Recompute every time; old values are never trusted as the current model. */
export function currentDistributionInverse(studio){
 const query=queryFor(studio);
 if(query.status==="idle")return {status:"idle",result:null};
 if(query.signature!==distributionInverseModelSignature(studio.draft))
  return {status:"stale",result:null};
 return {status:query.status,result:inverseDistribution(studio.draft,{
  mode:query.mode,probability:query.probability})};
}
export function applyDistributionInverse(studio){
 const current=currentDistributionInverse(studio);
 if(current.status!=="calculated"&&current.status!=="applied")
  return {ok:false,error:"Calculate a boundary for the current model before applying it."};
 const result=current.result;
 if(!result?.ok)return {ok:false,error:result?.issues?.[0]||"The inverse calculation is invalid."};
 // A valid inverse does not require a title, but its resulting event must
 // also satisfy the same mathematical event validation as the graph itself.
 const check=analyzeDistribution({...studio.draft,...result.event,
  title:"Inverse calculation",symbol:"X",sourceKind:"theoretical"});
 if(!check.ready)return {ok:false,error:check.issues[0]};
 const changed=studio.draft.mode!==result.event.mode||
  studio.draft.lower!==result.event.lower||
  (result.event.upper!==undefined&&studio.draft.upper!==result.event.upper);
 if(changed){
  for(const [key,value] of Object.entries(result.event))
   if(!setDistributionField(studio,key,value))return {ok:false,error:"Unable to update the "+key+" boundary."};
 }
 queryFor(studio).status="applied";
 return {ok:true,result,changed};
}
