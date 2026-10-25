/**
 * Pass 5.3 — pure parameter exploration. Every comparison evaluates the SAME
 * student-selected event against two theoretical models; no observed data or
 * claimed fit is inferred. Original drafts and saved figures are untouched.
 */
import {analyzeDistribution,normalizeDistributionDraft} from "./distribution-core.js";
import {distributionSensitivity} from "./distribution-sensitivity.js";

export const DISTRIBUTION_PARAMETER_KEYS=Object.freeze({
 normal:Object.freeze(["mu","sigma"]),binomial:Object.freeze(["n","p"]),
 poisson:Object.freeze(["lambda"]),uniform:Object.freeze(["a","b"]),
 custom:Object.freeze(["customPoints"])
});
const params=d=>DISTRIBUTION_PARAMETER_KEYS[d.kind]||[];
export function distributionWhatIfSignature(raw){
 const d=normalizeDistributionDraft(raw);
 return JSON.stringify([d.kind,...params(d).map(k=>d[k])]);
}
export const distributionWhatIfValues=raw=>{
 const d=normalizeDistributionDraft(raw);
 return Object.fromEntries(params(d).map(key=>[key,d[key]]));
};
const displayModel=(draft,caption)=>({
 ...draft,title:caption,symbol:/^[A-Z\u0391-\u03A9]$/u.test(draft.symbol.trim())?draft.symbol:"X",
 sourceKind:"theoretical",sourceCredit:"",showMean:false,showParameters:false,
 showProbability:false,figureNumber:"",caption:""
});
const extraIssues=()=>[]; // Uniform validation in parseCustomDiscrete.
/**
 * A signature mismatch indicates the main model was edited during a what-if.
 * Do not automatically rebase, or a prior alternative could replace new work.
 */
export function compareDistributionWhatIf(studio){
 const w=studio?.whatIf;
 if(!w?.active)return {status:"idle",ready:false,changed:false,issues:[],eventIssues:[]};
 const source=normalizeDistributionDraft(studio.draft);
 if(source.kind!==w.kind||distributionWhatIfSignature(source)!==w.source)
  return {status:"stale",ready:false,changed:false,issues:["The original model parameters changed. Restart the comparison to use the new model."],eventIssues:[]};
 const fields=params(source);
 const changedKeys=fields.filter(key=>w.values?.[key]!==source[key]);
 const changed=changedKeys.length>0;
 const alternative=normalizeDistributionDraft({...source,...Object.fromEntries(fields.map(key=>[key,w.values?.[key]??source[key]]))});
 const originalDraft=displayModel(source,"Original model"),alternativeDraft=displayModel(alternative,"Alternative model");
 const original=analyzeDistribution({...originalDraft,mode:"none"});
 const proposed=analyzeDistribution({...alternativeDraft,mode:"none"});
 const issues=[...original.issues.map(s=>"Original: "+s),...proposed.issues.map(s=>"Alternative: "+s),
  ...extraIssues(original).map(s=>"Original: "+s),...extraIssues(proposed).map(s=>"Alternative: "+s)];
 if(issues.length)return {status:"invalid",ready:false,changed,issues,eventIssues:[],
  original,alternative:proposed,originalDraft,alternativeDraft};
 const result={status:"ready",ready:true,changed,issues:[],eventIssues:[],
  original,alternative:proposed,originalDraft,alternativeDraft,eventMode:source.mode,changedKeys,
  originalProbability:null,alternativeProbability:null,deltaProbability:null};
 if(source.mode!=="none"){
  const first=analyzeDistribution(originalDraft),second=analyzeDistribution(alternativeDraft);
  if(first.ready&&second.ready){
   result.originalEvent=first;result.alternativeEvent=second;
   result.originalProbability=first.probability;
   result.alternativeProbability=second.probability;
   result.deltaProbability=second.probability-first.probability;
   result.eventStatement=first.statement.split(" = ")[0];
  }else result.eventIssues=[...first.issues,...second.issues]
   .filter((s,i,a)=>a.indexOf(s)===i);
 }
 result.sensitivity=distributionSensitivity(result,changedKeys);
 if(result.sensitivity?.eventValid)result.deltaProbability=result.sensitivity.deltaProbability;
 return result;
}
