/**
 * Editor-only inverse probability controls. None of this text or state is
 * inserted into the SVG or the saved figure's mathematical draft.
 */
import {currentDistributionInverse} from "./distribution-inverse-actions.js";

const numberText=v=>{
 if(v===0||v===1||Number.isInteger(v))return String(v);
 return Number(v.toPrecision(12)).toString();
};
const probabilityText=v=>{
 if(v===0||v===1)return String(v);
 if(v<0.00001)return Number(v.toPrecision(10)).toString();
 if(v>0.99999)return String(v); // never round an achieved tail up to an exact 1
 return Number(v.toPrecision(10)).toString();
};
export function distributionInverseResultHtml(studio,e){
 const {status,result}=currentDistributionInverse(studio);
 if(status==="idle")return '<p class="distribution-inverse-placeholder">Enter a target and calculate first. Your diagram remains unchanged until you apply the result.</p>';
 if(status==="stale")return '<p class="distribution-inverse-warning" role="alert">The model parameters have changed. Calculate again before applying a boundary.</p>';
 if(!result?.ok)return '<div class="distribution-inverse-warning" role="alert"><strong>Check the inverse calculation</strong><ul>'+
  (result?.issues||["Unable to calculate a boundary."]).map(issue=>'<li>'+e(issue)+'</li>').join("")+'</ul></div>';
 const d=studio.draft,symbol=d.symbol.trim()||"X",discrete=!["normal","uniform"].includes(d.kind);
 const bounds=result.mode==="central"?
  numberText(result.lower)+" ≤ "+symbol+" ≤ "+numberText(result.upper):
  symbol+(result.mode==="left"?" ≤ ":" ≥ ")+numberText(result.lower);
 const notes=discrete?
  '<p class="distribution-inverse-explainer">This is an <strong>inclusive cut-off</strong>. Discrete probabilities jump between outcomes, so the achieved probability may be greater than the target.</p>'+
  (result.adjacentProbability!==null?'<p class="distribution-inverse-small">Next boundary in the opposite direction gives probability '+
   e(probabilityText(result.adjacentProbability))+' — below the requested coverage.</p>':""):
  '<p class="distribution-inverse-explainer">The boundary is calculated numerically for the chosen continuous model'+
  (result.mode==="central"?", using equal tails":"" )+'.</p>';
 return '<div class="distribution-inverse-result-content">'+
  '<strong>Calculated boundary</strong><p class="distribution-inverse-equation">'+e(bounds)+'</p>'+
  '<div class="distribution-inverse-metrics"><div><span>Requested probability</span><strong>'+e(probabilityText(result.requested))+
  '</strong></div><div><span>Achieved probability</span><strong>'+e(probabilityText(result.achieved))+'</strong></div></div>'+
  notes+
  (status==="applied"?
   '<p class="distribution-inverse-applied">Applied to the figure. You can still edit the event boundaries above.</p>':
   '<button type="button" class="btn btn-secondary" data-action="distribution-inverse-apply">Apply boundary to figure</button>'+
   '<p class="distribution-inverse-small">The calculation has not changed the shaded event yet.</p>')+
  '</div>';
}
export function renderDistributionInverseHtml(studio,e){
 const d=studio.draft,query=studio.inverse||{mode:"left",probability:"0.95"};
 const continuous=["normal","uniform"].includes(d.kind);
 const options=[
  ["left","Lower-tail boundary: P("+d.symbol+" ≤ x)"],
  ["right","Upper-tail boundary: P("+d.symbol+" ≥ x)"],
  ...(continuous?[["central","Central probability (equal tails)"]]:[])
 ];
 return '<details class="distribution-inverse-panel" data-distribution-inverse-panel>'+
  '<summary>Find a boundary from a probability <span class="distribution-inverse-tag">Inverse calculation</span></summary>'+
  '<div class="distribution-inverse-body">'+
  '<p>Work backwards: choose a probability, calculate the boundary, then decide whether to apply it to your figure.</p>'+
  '<label class="probability-field"><span>Which probability?</span><select data-distribution-inverse-field="mode">'+
  options.map(([value,label])=>'<option value="'+e(value)+'"'+(value===query.mode?" selected":"")+'>'+e(label)+'</option>').join("")+
  '</select></label>'+
  '<label class="probability-field"><span>Target probability (between 0 and 1)</span>'+
  '<input type="text" inputmode="decimal" autocomplete="off" data-distribution-inverse-field="probability" value="'+e(query.probability)+'" aria-describedby="distribution-inverse-probability-help"></label>'+
  '<p class="distribution-inverse-small" id="distribution-inverse-probability-help">'+
  (continuous?"For example, enter 0.95 to find a 95% boundary or central interval.":
   "For example, enter 0.8 to find a cut-off covering at least 80% of the model probability.")+
  '</p>'+
  '<button type="button" class="btn btn-primary" data-action="distribution-inverse-calculate">Calculate boundary</button>'+
  '<div class="distribution-inverse-result" data-distribution-inverse-result role="status" aria-live="polite" aria-atomic="true">'+
  distributionInverseResultHtml(studio,e)+'</div></div></details>';
}
