/**
 * Editor-only what-if controls, comparisons and chart. No comparison content
 * is embedded in the normal figure/export pipeline.
 */
import {compareDistributionWhatIf,DISTRIBUTION_PARAMETER_KEYS} from "./distribution-whatif-core.js";
import {renderDistributionWhatIfSvg,normalComparisonCompression} from "./distribution-whatif-render.js";
import {distributionLayout} from "./distribution-layout.js";
import {distributionWhatIfReflection} from "./distribution-whatif-reflection.js";
import {formatSensitivityProbability,formatSensitivityPoints,formatSensitivityNumber,formatSensitivitySigned} from "./distribution-sensitivity.js";

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

/** One question at a time; no new figure or mathematical-stage record is created. */
const comparisonChoice=(w,e)=>
 '<fieldset class="distribution-whatif-question" aria-label="What should remain fixed?">'+
 '<legend>What should stay fixed?</legend>'+
 [["event","The event boundary","How does its probability change?"],
  ["target","A probability target","How does the required cut-off change?"]]
 .map(([value,title,hint])=>
  '<label class="distribution-whatif-question-option"><input type="radio" name="distribution-whatif-comparison" '+
  'data-distribution-whatif-option="comparison" value="'+e(value)+'"'+
  ((w.comparison||"event")===value?' checked':'')+'>'+
  '<span><strong>'+e(title)+'</strong><small>'+e(hint)+'</small></span></label>').join("")+
 '</fieldset>';
const fixedTargetControls=(w,d,e)=>{
 const continuous=["normal","uniform"].includes(d.kind);
 const options=[["left","At most (≤) — left tail"],["right","At least (≥) — right tail"],
  ...(continuous?[["central","Central interval (equal tails)"]]:[])];
 return '<div class="distribution-whatif-target-controls" data-distribution-target-controls>'+
  '<label class="probability-field"><span>Which probability?</span><select data-distribution-whatif-option="targetMode">'+
  options.map(([value,title])=>'<option value="'+e(value)+'"'+(w.targetMode===value?' selected':'')+'>'+e(title)+'</option>').join("")+
  '</select></label>'+
  '<label class="probability-field"><span>Target probability (0 to 1)</span>'+
  '<input type="text" inputmode="decimal" autocomplete="off" data-distribution-whatif-option="targetProbability" '+
  'value="'+e(w.targetProbability??"0.95")+'" aria-describedby="distribution-whatif-target-help"></label>'+
  '<p class="distribution-whatif-hint" id="distribution-whatif-target-help">'+
  (continuous?'Find an event cut-off for the same desired coverage in each continuous model.':
   'Counts and outcomes are discrete: the smallest left cut-off or largest right cut-off meeting at least the target is used. Achieved coverage may exceed the target.')+
  '</p></div>';
};
const targetNumber=x=>formatSensitivityNumber(x,12);
const targetProbabilityText=(x,complement=null)=>{
 if(x===null||!Number.isFinite(x))return "—";
 if(Number.isFinite(complement)&&complement>0&&complement<1e-8&&x>=1-1e-8)
  return "1 − "+Number(complement.toPrecision(7)).toString();
 // Avoid displaying an achieved probability rounded to exactly one or zero.
 if(x!==0&&x!==1&&(x<1e-6||x>1-1e-6))return String(x);
 return formatSensitivityNumber(x,11);
};
const targetBoundary=(inverse,symbol,e)=>{
 const value=targetNumber(inverse.lower);
 if(inverse.mode==="central")
  return e(targetNumber(inverse.lower))+" ≤ "+e(symbol)+" ≤ "+e(targetNumber(inverse.upper));
 return e(symbol)+(inverse.mode==="left"?" ≤ ":" ≥ ")+e(value);
};
const fixedTargetResult=(q,symbol,e)=>{
 const t=q.target;
 if(!t?.ok)
  return '<section class="distribution-whatif-target-error" data-whatif-target-error role="status">'+
   '<strong>Check the target probability</strong><ul>'+
   (t?.issues||["Choose a valid probability and interval type."]).map(issue=>'<li>'+e(issue)+'</li>').join("")+
   '</ul><p>The original and alternative models are unchanged. No boundary is applied to the figure.</p></section>';
 const model=(caption,result,kind)=>
  '<div class="distribution-whatif-target-model" data-whatif-target-model="'+kind+'">'+
  '<strong>'+caption+'</strong><p class="distribution-whatif-target-equation">'+
   targetBoundary(result,symbol,e)+'</p>'+
   '<p>Achieved probability: <strong>'+e(targetProbabilityText(result.achieved,result.achievedComplement))+'</strong></p></div>';
 const change=t.mode==="central"?
  'Lower cut-off: '+e(formatSensitivitySigned(t.lowerChange))+
  '; upper cut-off: '+e(formatSensitivitySigned(t.upperChange)):
  'Cut-off moves by '+e(formatSensitivitySigned(t.lowerChange));
 const unit=q.originalDraft.unit.trim();
 return '<section class="distribution-whatif-target-result" data-whatif-target-result>'+
  '<strong>Same target probability: '+e(targetProbabilityText(t.requested))+'</strong>'+
  '<p class="distribution-whatif-target-intro">'+
   (t.mode==="central"?"Compare equal-tailed central intervals.":"Compare "+(t.mode==="left"?"left-tail":"right-tail")+" cut-offs.")+
   ' The shaded event in your IA figure is not changed.</p>'+
  '<div class="distribution-whatif-target-grid">'+
   model("Original model",t.original,"original")+model("Alternative model",t.alternative,"alternative")+
  '</div>'+
  '<p class="distribution-whatif-target-change"><strong>Boundary change (alternative minus original):</strong> '+
   change+(unit?' '+e(unit):'')+'</p>'+
  (t.discrete?'<p class="distribution-whatif-target-explainer">Inclusive discrete cut-offs give <strong>at least</strong> the requested coverage. Report the achieved probability for each model; equal cut-offs do not imply the distributions are identical.</p>':
   '<p class="distribution-whatif-target-explainer">Continuous cut-offs are numerical solutions. Their achieved values may differ slightly due to precision.</p>')+
  (t.sameBoundary?'<p class="distribution-whatif-target-explainer">The boundary does not move at this target. This can happen even when model parameters change.</p>':'')+
  '</section>';
};

/** Optional questions stay in the editor and never populate an IA response. */
export function distributionWhatIfReflectionHtml(studio,q,aim,e,writing=null){
 const reflection=distributionWhatIfReflection(q,studio.draft,aim);
 if(!reflection)return "";
 const questions=reflection.prompts.map(({id,title,question})=>
  '<div class="distribution-whatif-reflection-item" data-reflection-prompt="'+e(id)+'">'+
  '<strong>'+e(title)+'</strong><p>'+e(question)+'</p></div>').join("");
 return '<details class="distribution-whatif-reflection" data-distribution-whatif-reflection'+
  (studio.whatIf?.reflectionOpen?' open':'')+'>'+
  '<summary>What does this tell me? <small>Optional reflection</small></summary>'+
  '<div class="distribution-whatif-reflection-body">'+
  (reflection.aim?'<p class="distribution-whatif-reflection-aim"><strong>Your saved aim</strong> '+e(reflection.aim)+'</p>':"")+
  questions+
  '<p class="distribution-whatif-reflection-caution">'+e(reflection.caution)+
  ' Use these questions to develop your own mathematical judgement, not as text to paste into your IA.</p>'+
  (writing?'<div class="distribution-whatif-writing-bridge" data-distribution-writing-bridge>'+
    '<p class="distribution-whatif-writing-note" data-distribution-insight-status>'+
    (writing.hasInsight?'Your existing Insight Threads already reflect notes you recorded in IA Studio.':
     'Insight Threads reuse your own IA Studio writing; this comparison is not automatically recorded as a discovery.')+
    (writing.needsRealResult?' A hypothetical comparison does not count as completed mathematical work.':'')+
    '</p>'+
    '<div class="distribution-whatif-writing-actions">'+
    '<button type="button" class="btn btn-secondary btn-sm" data-action="distribution-whatif-write">Continue in IA Studio</button>'+
    (writing.lessonId?'<button type="button" class="btn btn-quiet btn-sm" data-action="resource-workshop" data-workshop-id="'+e(writing.lessonId)+'" data-resource-help="true">Related Maths Workshop</button>':'')+
    '<button type="button" class="btn btn-quiet btn-sm" data-studio-stuck="C31:whatif" aria-haspopup="dialog">I am stuck</button>'+
    '</div></div>':'')+
  '</div></details>';
}
export function distributionWhatIfSummaryHtml(studio,e,aim="",writing=null){
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
 const sensitivity=q.sensitivity;
 const event=q.comparison==="event"&&q.originalProbability!==null?'<p class="distribution-whatif-event">Same fixed event: <strong>'+
  e(q.eventStatement)+'</strong></p>'+metric("Event probability",q.originalProbability,q.alternativeProbability):
  q.comparison==="target"?fixedTargetResult(q,studio.draft.symbol.trim()||"X",e):
  '<p class="distribution-whatif-event">Choose an event in “Probability to highlight” to compare its probability under both models. The mean and spread are compared below.</p>';
 const eventProblems=q.eventIssues.length?'<p class="distribution-whatif-error">'+
  e("The event needs correction before its probability can be compared: "+q.eventIssues[0])+'</p>':"";
 return '<div class="distribution-whatif-summary-content">'+
  '<p class="distribution-whatif-legend"><span>Original</span><span>Alternative</span></p>'+
  '<div class="distribution-whatif-metrics">'+event+
  metric("Mean",q.original.mean,q.alternative.mean,q.alternative.mean-q.original.mean)+
  metric("Standard deviation",Math.sqrt(q.original.variance),Math.sqrt(q.alternative.variance),
   Math.sqrt(q.alternative.variance)-Math.sqrt(q.original.variance))+'</div>'+
  (sensitivity?.eventValid?'<div class="distribution-whatif-sensitivity" data-distribution-sensitivity><strong>Event-probability change</strong><p>'+e(formatSensitivityPoints(sensitivity.deltaProbability))+' percentage points (alternative minus original)</p><small>Original: '+e(formatSensitivityProbability(q.originalProbability,sensitivity.originalComplement))+' · Alternative: '+e(formatSensitivityProbability(q.alternativeProbability,sensitivity.alternativeComplement))+'</small>'+(sensitivity.tailPrecision?'<p>Rare upper-tail probabilities are shown using their complements to avoid rounding an extremely small tail to zero.</p>':'')+'</div>':'')+
  (sensitivity?'<div class="distribution-whatif-sensitivity" data-distribution-parameter-change><strong>'+e(sensitivity.parameter.title)+'</strong><p>'+e(sensitivity.parameter.detail)+'</p></div>':'')+
  distributionWhatIfReflectionHtml(studio,q,aim,e,writing)+
  (q.changed&&["primary","secondary"].includes(studio.draft.sourceKind)?'<p class="distribution-whatif-hint" data-distribution-source-warning>Applying this alternative will reclassify these parameters as an assumed theoretical model and clear the original source credit. The existing saved figure will not change until you save it.</p>':'')+
  eventProblems+
  (q.changed&&q.eventIssues.length===0&&(q.comparison!=="target"||q.target?.ok)?
   '<button type="button" class="btn btn-secondary" data-action="distribution-whatif-apply">Apply alternative to figure</button>':
   '<p class="distribution-whatif-hint">'+(q.changed?
    q.comparison==="target"?"Correct the target probability before applying these parameters.":"Correct the event before applying these parameters.":
    "Change an alternative parameter to explore its effect.")+'</p>')+
  '<p class="distribution-whatif-hint">The original figure and saved copies remain unchanged until you choose Apply. A model comparison does not establish which model fits observed data.</p>'+
  '</div>';
}
export function renderDistributionWhatIfControls(studio,e,aim="",writing=null){
 const w=studio.whatIf||{},d=studio.draft;
 return '<details class="distribution-whatif-panel" data-distribution-whatif-panel'+
  (w.active||w.status==="applied"?' open':'')+'>'+
  '<summary>Explore model parameters <span class="distribution-whatif-tag">What if?</span></summary>'+
  '<div class="distribution-whatif-body">'+
  (!w.active?
   (w.status==="applied"?'<p class="distribution-whatif-applied" role="status">Alternative parameters applied to the editable figure. Review the event before saving or exporting.</p>':"")+
   '<p>Explore a different model without changing your original figure. Compare either a fixed event or a fixed target probability, then decide whether to apply your alternative.</p>'+
   '<button type="button" class="btn btn-secondary" data-action="distribution-whatif-start">Start a comparison</button>':
   '<p>Change the <strong>alternative</strong> parameters below. Sliders and number fields update the comparison live; your original remains untouched.</p>'+
   comparisonChoice(w,e)+(w.comparison==="target"?fixedTargetControls(w,d,e):"")+
   (DISTRIBUTION_PARAMETER_KEYS[w.kind]||[]).map(k=>parameterControl(d,w,k,e)).join("")+
   '<div class="distribution-whatif-actions">'+
   '<button type="button" class="btn btn-quiet btn-sm" data-action="distribution-whatif-reset">Reset alternative</button>'+
   '<button type="button" class="btn btn-quiet btn-sm" data-action="distribution-whatif-discard">Discard comparison</button></div>'+
   '<div data-distribution-whatif-summary class="distribution-whatif-summary">'+
   distributionWhatIfSummaryHtml(studio,e,aim,writing)+'</div>')+
  '</div></details>';
}
export function distributionWhatIfPreviewHtml(studio,e){
 const w=studio.whatIf;
 if(!w?.active)return "";
 const q=compareDistributionWhatIf(studio);
 const chart=q.ready?renderDistributionWhatIfSvg(q):"";
 const targetBounds=q.comparison==="target"&&q.target?.ok?
  [q.target.original.lower,q.target.alternative.lower,
   ...(q.target.mode==="central"?[q.target.original.upper,q.target.alternative.upper]:[])]:[];
 const l0=q.ready?distributionLayout(q.original):null,l1=q.ready?distributionLayout(q.alternative):null;
 const rangeMin=l0&&l1?Math.min(l0.domainMin,l1.domainMin):null;
 const rangeMax=l0&&l1?Math.max(l0.domainMax,l1.domainMax):null;
 const outside=targetBounds.some(x=>x<rangeMin||x>rangeMax);
 return '<section class="distribution-whatif-preview" data-distribution-whatif-preview>'+
  '<h3>'+(q.comparison==="target"?"Cut-offs under both models — shared axes":"Original and alternative — shared axes")+'</h3>'+
  (q.ready?'<div class="distribution-whatif-canvas" data-distribution-whatif-canvas tabindex="0" role="region" aria-label="Original and alternative probability distributions; scroll horizontally to inspect the graph" aria-describedby="distribution-whatif-scroll-note">'+chart+'</div>'+
    '<p class="distribution-whatif-scroll-note" id="distribution-whatif-scroll-note">Swipe sideways, or focus the graph and use arrow keys, to inspect its labels at a readable size.</p>'+
  '<p>Grey dashed line (or hatched bars): original. Blue solid line or bars: alternative. Both share the same scales. '+
    (q.comparison==="target"?
      (q.target?.ok?'Grey and blue vertical markers identify the respective inverse boundaries. Different cut-offs represent different events at the same target; no common region is shaded.':
       'Enter a valid target to display its cut-offs.'):
      (q.originalProbability!==null?
       'The pale highlighted region and boundary markers indicate the same event in both models.':
       'Select an event in section 2 to compare the probabilities at a fixed boundary.'))+'</p>'+
   (outside?'<p class="distribution-whatif-hint" data-whatif-marker-note>One or more cut-offs are outside the displayed model window. Use the full numerical values above; the chart does not represent all extreme boundaries.</p>':"")+
   (normalComparisonCompression(q)?'<p class="distribution-whatif-hint" data-whatif-scale-warning role="note"><strong>Shared-scale limitation:</strong> at least one normal density is narrower than can be represented clearly at this scale. Compare numerical values; do not judge spread or peak shape from the compressed curve.</p>':""):
   '<p class="distribution-whatif-preview-error">'+e(q.status==="stale"?
    "Original parameters changed. Restart the comparison to see updated curves.":"Enter valid model parameters to compare shapes.")+'</p>')+
  '</section>';
}
