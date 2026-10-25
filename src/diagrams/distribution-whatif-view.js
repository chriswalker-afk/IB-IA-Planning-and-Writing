/**
 * Editor-only what-if controls, comparisons and chart. No comparison content
 * is embedded in the normal figure/export pipeline.
 */
import {compareDistributionWhatIf,DISTRIBUTION_PARAMETER_KEYS} from "./distribution-whatif-core.js";
import {renderDistributionWhatIfSvg} from "./distribution-whatif-render.js";

const labels={mu:"Mean (μ)",sigma:"Standard deviation (σ)",n:"Number of trials (n)",
 p:"Success probability (p)",lambda:"Event rate (λ)",a:"Lower limit (a)",b:"Upper limit (b)",
 customPoints:"Outcome and probability pairs"};
const numberText=v=>{
 if(v===null||v===undefined||!Number.isFinite(v))return "—";
 if(v===0||v===1)return String(v);
 return Number(v.toPrecision(9)).toString();
};
const signed=v=>(v>0?"+":"")+numberText(v);
function sliderSettings(d,key){
 const n=Number(d[key]),sigma=Number(d.sigma),span=Number(d.b)-Number(d.a);
 if(key==="n")return {min:1,max:150,step:1};
 if(key==="p")return {min:0,max:1,step:0.01};
 if(key==="lambda")return {min:0,max:100,step:0.1};
 if(!Number.isFinite(n))return null;
 let min,max,step;
 if(key==="mu"){
  if(!(sigma>0)||!Number.isFinite(sigma))return null;
  min=n-3*sigma;max=n+3*sigma;step=sigma/30;
 }else if(key==="sigma"){
  if(!(n>0))return null;
  min=Math.max(1e-12,n*.2);max=Math.min(1e12,n*3);step=n/50;
 }else if(["a","b"].includes(key)){
  if(!(span>0)||!Number.isFinite(span))return null;
  min=n-2*span;max=n+2*span;step=span/40;
 }else return null;
 return [min,max,step].every(Number.isFinite)&&max>min&&step>0?
  {min,max,step}:null;
}
const parameterControl=(d,whatIf,key,e)=>{
 if(key==="customPoints")return '<label class="probability-field distribution-whatif-custom"><span>Alternative outcome probabilities (value, probability)</span>'+
  '<textarea rows="6" spellcheck="false" data-distribution-whatif-field="customPoints" data-whatif-control="value">'+
  e(whatIf.values[key]??"")+'</textarea>'+
  '<small>Keep distinct outcome values and probabilities that total 1. Values are never normalised for you.</small></label>';
 const settings=sliderSettings(d,key);
 const text='<input type="text" inputmode="decimal" data-distribution-whatif-field="'+e(key)+
  '" data-whatif-control="value" value="'+e(whatIf.values[key]??"")+'" aria-label="Alternative '+e(labels[key])+'">';
 const n=Number(whatIf.values[key]);
 const slider=settings?'<input type="range" data-distribution-whatif-field="'+e(key)+
  '" data-whatif-control="range" min="'+settings.min+'" max="'+settings.max+'" step="'+settings.step+
  '" value="'+(Number.isFinite(n)?Math.max(settings.min,Math.min(settings.max,n)):settings.min)+
  '" aria-label="Adjust alternative '+e(labels[key])+' with a slider">':"";
 return '<div class="distribution-whatif-field"><label class="probability-field"><span>Alternative '+e(labels[key])+'</span>'+text+'</label>'+
  (slider?'<div class="distribution-whatif-slider">'+slider+'</div>':"")+
  '<small>Original: '+e(d[key])+'</small></div>';
};
export function distributionWhatIfSummaryHtml(studio,e){
 const q=compareDistributionWhatIf(studio);
 if(q.status==="idle")return "";
 if(q.status==="stale")return '<div class="distribution-whatif-error" role="alert"><strong>Original model changed.</strong>'+
  '<p>Restart the comparison before applying an alternative. Your original figure is unchanged.</p></div>';
 if(q.status==="invalid")return '<div class="distribution-whatif-error" role="alert"><strong>Check these parameters</strong><ul>'+
  q.issues.map(issue=>'<li>'+e(issue)+'</li>').join("")+'</ul>'+
  '<p>Nothing has been applied. Check the values rather than silently adjusting them.</p></div>';
 if(!q.ready)return "";
 const fmt=x=>e(numberText(x));
 const metric=(label,original,alternative,delta=null)=>
  '<div class="distribution-whatif-metric"><span>'+label+'</span><div><strong>'+fmt(original)+
  '</strong><span aria-hidden="true">→</span><strong>'+fmt(alternative)+'</strong></div>'+
  (delta!==null?'<small>Change: '+e(signed(delta))+'</small>':"")+'</div>';
 const event=q.originalProbability!==null?'<p class="distribution-whatif-event">Same fixed event: <strong>'+
  e(q.eventStatement)+'</strong></p>'+metric("Event probability",q.originalProbability,q.alternativeProbability,q.deltaProbability):
  '<p class="distribution-whatif-event">Choose an event in “Probability to highlight” to compare its probability under both models. The mean and spread are compared below.</p>';
 const eventProblems=q.eventIssues.length?'<p class="distribution-whatif-error">'+
  e("The event needs correction before its probability can be compared: "+q.eventIssues[0])+'</p>':"";
 return '<div class="distribution-whatif-summary-content">'+
  '<p class="distribution-whatif-legend"><span>Original</span><span>Alternative</span></p>'+
  '<div class="distribution-whatif-metrics">'+event+
  metric("Mean",q.original.mean,q.alternative.mean,q.alternative.mean-q.original.mean)+
  metric("Standard deviation",Math.sqrt(q.original.variance),Math.sqrt(q.alternative.variance),
   Math.sqrt(q.alternative.variance)-Math.sqrt(q.original.variance))+'</div>'+
  eventProblems+
  (q.changed&&q.eventIssues.length===0?
   '<button type="button" class="btn btn-secondary" data-action="distribution-whatif-apply">Apply alternative to figure</button>':
   '<p class="distribution-whatif-hint">'+(q.changed?
    "Correct the event before applying these parameters.":
    "Change an alternative parameter to explore its effect.")+'</p>')+
  '<p class="distribution-whatif-hint">The original figure and saved copies remain unchanged until you choose Apply. A model comparison does not establish which model fits observed data.</p>'+
  '</div>';
}
export function renderDistributionWhatIfControls(studio,e){
 const w=studio.whatIf||{},d=studio.draft;
 return '<details class="distribution-whatif-panel" data-distribution-whatif-panel'+
  (w.active||w.status==="applied"?' open':'')+'>'+
  '<summary>Explore model parameters <span class="distribution-whatif-tag">What if?</span></summary>'+
  '<div class="distribution-whatif-body">'+
  (!w.active?
   (w.status==="applied"?'<p class="distribution-whatif-applied" role="status">Alternative parameters applied to the editable figure. Review the event before saving or exporting.</p>':"")+
   '<p>Explore a different model without changing your original figure. Compare the same event, then decide whether to apply your alternative.</p>'+
   '<button type="button" class="btn btn-secondary" data-action="distribution-whatif-start">Start a comparison</button>':
   '<p>Change the <strong>alternative</strong> parameters below. Sliders and number fields update the comparison live; your original remains untouched.</p>'+
   (DISTRIBUTION_PARAMETER_KEYS[w.kind]||[]).map(k=>parameterControl(d,w,k,e)).join("")+
   '<div class="distribution-whatif-actions">'+
   '<button type="button" class="btn btn-quiet btn-sm" data-action="distribution-whatif-reset">Reset alternative</button>'+
   '<button type="button" class="btn btn-quiet btn-sm" data-action="distribution-whatif-discard">Discard comparison</button></div>'+
   '<div data-distribution-whatif-summary class="distribution-whatif-summary" aria-live="polite">'+
   distributionWhatIfSummaryHtml(studio,e)+'</div>')+
  '</div></details>';
}
export function distributionWhatIfPreviewHtml(studio,e){
 const w=studio.whatIf;
 if(!w?.active)return "";
 const q=compareDistributionWhatIf(studio);
 const chart=q.ready?renderDistributionWhatIfSvg(q):"";
 return '<section class="distribution-whatif-preview" data-distribution-whatif-preview>'+
  '<h3>Original and alternative — shared axes</h3>'+
  (q.ready?'<div class="distribution-whatif-canvas">'+chart+'</div>'+
    '<p class="distribution-whatif-scroll-note">Swipe sideways to inspect the graph at a readable size.</p>'+
  '<p>Grey dashed: original. Blue: alternative. Both share the same scales. '+
    (q.originalProbability!==null?
     'The pale highlighted region and boundary markers indicate the same event in both models.':
     'Select an event in section 2 to compare the probabilities at a fixed boundary.')+'</p>':
   '<p class="distribution-whatif-preview-error">'+e(q.status==="stale"?
    "Original parameters changed. Restart the comparison to see updated curves.":"Enter valid model parameters to compare shapes.")+'</p>')+
  '</section>';
}
