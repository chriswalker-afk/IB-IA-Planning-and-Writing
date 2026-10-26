/**
 * Pass 5.5.2 — short, deliberate screen-reader messages.
 * These pure messages are announced only on a committed change or explicit
 * action; the live chart, reflection, and long validation summary stay silent
 * while a student moves a slider or types a number.
 */
import {analyzeDistribution,formatDistributionProbability} from "./distribution-core.js";
import {compareDistributionWhatIf} from "./distribution-whatif-core.js";
import {currentDistributionInverse} from "./distribution-inverse-actions.js";
import {formatSensitivityPoints} from "./distribution-sensitivity.js";
const number=v=>Number.isFinite(v)?Number(v.toPrecision(10)).toString():"unavailable";
export function distributionFigureAnnouncement(studio){
 const q=analyzeDistribution(studio?.draft);
 if(q.issues.length)return "Figure needs correction: "+q.issues[0];
 return q.statement?"Figure ready. "+q.statement:
  "Figure ready. No probability event is selected.";
}
export function distributionInverseAnnouncement(studio){
 const {status,result}=currentDistributionInverse(studio);
 if(status==="stale")return "Inverse boundary is out of date. Recalculate with the current model.";
 if(!result?.ok)return "Inverse calculation needs correction: "+(result?.issues?.[0]||"check the probability target.");
 if(status==="applied")return "Boundary applied to the original figure. Review the highlighted event.";
 const d=studio.draft,variable=d.symbol.trim()||"X";
 return "Boundary calculated for "+variable+". Requested probability "+
  formatDistributionProbability(result.requested)+
  "; achieved probability "+formatDistributionProbability(result.achieved,result.achievedComplement)+
  ". Apply boundary to update the figure.";
}
export function distributionWhatIfAnnouncement(studio){
 const q=compareDistributionWhatIf(studio);
 if(q.status==="idle")return "Start a comparison to explore alternative model parameters.";
 if(q.status==="stale")return "Comparison out of date. Restart after changing the original model.";
 if(q.status==="invalid")return "Check alternative parameters: "+(q.issues?.[0]||"invalid model.");
 if(!q.ready)return "Comparison not available. Check the model.";
 if(!q.changed)return "Original and alternative parameters match. Change an alternative parameter to compare.";
 if(q.comparison==="target"){
  if(!q.target?.ok)return "Check the fixed probability target: "+(q.target?.issues?.[0]||"invalid target.");
  const t=q.target;
  return "Fixed probability target "+number(t.requested)+". Original "+
   (t.mode==="central"?"interval "+number(t.original.lower)+" to "+number(t.original.upper):
    "cut-off "+number(t.original.lower))+
   "; alternative "+(t.mode==="central"?"interval "+number(t.alternative.lower)+" to "+number(t.alternative.upper):
    "cut-off "+number(t.alternative.lower))+
   ". Achieved probabilities "+formatDistributionProbability(t.original.achieved,t.original.achievedComplement)+" and "+formatDistributionProbability(t.alternative.achieved,t.alternative.achievedComplement)+".";
 }
 if(!q.sensitivity?.eventValid)return "Choose a valid fixed event before comparing probabilities.";
 return "Fixed event: original probability "+
  formatDistributionProbability(q.originalProbability,q.sensitivity.originalComplement)+
  "; alternative probability "+
  formatDistributionProbability(q.alternativeProbability,q.sensitivity.alternativeComplement)+
  ". Change "+formatSensitivityPoints(q.sensitivity.deltaProbability)+" percentage points.";
}
