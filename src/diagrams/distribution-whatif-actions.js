/**
 * Explicit what-if transactions. An edit changes only whatIf.values.
 * "Apply alternative" validates the complete model before touching the draft.
 */
import {newDistributionWhatIfState} from "./distribution-core.js";
import {DISTRIBUTION_PARAMETER_KEYS,distributionWhatIfSignature,
 distributionWhatIfValues,compareDistributionWhatIf} from "./distribution-whatif-core.js";
import {setDistributionField} from "./distribution-actions.js";

export function startDistributionWhatIf(studio){
 if(!studio?.draft)return false;
 studio.whatIf={active:true,status:"exploring",kind:studio.draft.kind,
  source:distributionWhatIfSignature(studio.draft),
  values:distributionWhatIfValues(studio.draft)};
 return true;
}
export function setDistributionWhatIfField(studio,key,value){
 const w=studio?.whatIf;
 if(!w?.active||typeof value!=="string"||!(DISTRIBUTION_PARAMETER_KEYS[w.kind]||[]).includes(key))
  return false;
 const max=key==="customPoints"?3200:180;
 const next=value.slice(0,max);
 if(w.values[key]===next)return false;
 w.values[key]=next;
 return true;
}
/** Comparison choice and target are editor-only. A target never edits the shaded event. */
export function setDistributionWhatIfOption(studio,key,value){
 const w=studio?.whatIf;
 if(!w?.active||typeof value!=="string")return false;
 if(key==="comparison"){
  if(!["event","target"].includes(value))return false;
 }else if(key==="targetMode"){
  if(!["left","right","central"].includes(value)||
   value==="central"&&!["normal","uniform"].includes(w.kind))return false;
 }else if(key==="targetProbability"){
  value=value.slice(0,64);
 }else return false;
 if(w[key]===value)return false;
 w[key]=value;
 return true;
}
/** Rebase alternative parameters without discarding the question being explored. */
export function resetDistributionWhatIf(studio){
 if(!studio?.draft)return false;
 const w=studio.whatIf||newDistributionWhatIfState();
 const settings={comparison:w.comparison,targetMode:w.targetMode,targetProbability:w.targetProbability};
 if(!startDistributionWhatIf(studio))return false;
 Object.assign(studio.whatIf,settings);
 if(studio.whatIf.targetMode==="central"&&!["normal","uniform"].includes(studio.draft.kind))
  studio.whatIf.targetMode="left";
 return true;
}
export function discardDistributionWhatIf(studio){
 if(!studio?.whatIf)return false;
 studio.whatIf=newDistributionWhatIfState();
 return true;
}
export function applyDistributionWhatIf(studio,acknowledgeProvenance=false){
 const q=compareDistributionWhatIf(studio);
 if(!q.ready)return {ok:false,error:q.issues[0]||"Restart the comparison and enter valid parameters."};
 if(q.eventIssues.length)return {ok:false,error:"Check the chosen event before applying: "+q.eventIssues[0]};
 if(q.comparison==="target"&&!q.target?.ok)
  return {ok:false,error:q.target?.issues?.[0]||"Choose a valid fixed probability target before applying."};
 if(!q.changed)return {ok:false,error:"Change at least one alternative parameter before applying."};
 if(["primary","secondary"].includes(studio.draft.sourceKind)&&acknowledgeProvenance!==true)
  return {ok:false,needsProvenance:true,error:"Confirm that the alternative is hypothetical; applying it will reset the source classification to assumed theoretical and clear the old source credit."};
 // Use the current studio's native editor mutation; this marks the draft
 // as edited without silently saving or linking a figure.
 for(const key of DISTRIBUTION_PARAMETER_KEYS[studio.draft.kind])
  if(studio.draft[key]!==studio.whatIf.values[key])
   setDistributionField(studio,key,studio.whatIf.values[key]);
 if(["primary","secondary"].includes(studio.draft.sourceKind)){
  setDistributionField(studio,"sourceKind","theoretical");
  setDistributionField(studio,"sourceCredit","");
 }
 studio.whatIf={...newDistributionWhatIfState(),status:"applied"};
 return {ok:true,comparison:q};
}
