import {analyzeDistribution,MAX_DISTRIBUTION_FIGURES} from "./distribution-core.js";
import {distributionLayout} from "./distribution-layout.js";
import {renderDistributionSvg} from "./distribution-render.js";
import {renderDistributionGuidance,distributionAim} from "./distribution-guidance.js";
import {distributionWhatIfWritingContext} from "./distribution-whatif-writing.js";
import {renderDistributionInverseHtml} from "./distribution-inverse-view.js";
import {renderDistributionWhatIfControls,distributionWhatIfPreviewHtml} from "./distribution-whatif-view.js";
import {representationOutputActions} from "./workspace-ui.js";
const field=(key,label,value,e)=>
 '<label class="probability-field"><span>'+e(label)+'</span><input type="text" data-distribution-field="'+key+'" value="'+e(value)+'"></label>';
const select=(key,label,value,options,e)=>
 '<label class="probability-field"><span>'+e(label)+'</span><select data-distribution-field="'+key+'">'+
 options.map(([v,t])=>'<option value="'+e(v)+'"'+(value===v?' selected':'')+'>'+e(t)+'</option>').join("")+'</select></label>';
const toggle=(key,label,checked)=>'<label class="probability-tick"><input type="checkbox" data-distribution-field="'+key+'"'+(checked?" checked":"")+'><span>'+label+'</span></label>';
const boundaryField=(key,label,value,e)=>'<div class="distribution-boundary-control">'+
 field(key,label,value,e)+
 '<div class="distribution-nudge" role="group" aria-label="'+e(label)+' adjustments">'+
 '<button type="button" class="btn btn-secondary btn-sm" data-action="distribution-nudge" data-distribution-boundary="'+key+
 '" data-distribution-direction="-1" aria-label="Decrease '+e(label.toLowerCase())+'">−</button>'+
 '<button type="button" class="btn btn-secondary btn-sm" data-action="distribution-nudge" data-distribution-boundary="'+key+
 '" data-distribution-direction="1" aria-label="Increase '+e(label.toLowerCase())+'">+</button></div></div>';
export function distributionPreviewHtml(studio){
 return '<div class="distribution-preview'+(studio.zoomed?' distribution-preview-detail':'')+
 '" data-distribution-preview role="region" tabindex="'+(studio.zoomed?'0':'-1')+
 '" aria-label="'+(studio.zoomed?'Enlarged probability figure; scroll sideways to inspect labels':'Probability figure preview')+'">'+
 renderDistributionSvg(studio.draft,{interactive:true})+'</div>';
}
export function distributionFeedbackHtml(studio,e){
 const q=analyzeDistribution(studio.draft),layout=distributionLayout(q);
 const clipped=q.ready&&q.draft.mode!=="none"&&[q.lower,q.upper].some(v=>v!==null&&
  (layout.x(v)<layout.plot.left-1||layout.x(v)>layout.plot.right+1));
 const crowded=q.ready&&q.draft.kind==="custom"&&q.points.length>1&&
  q.points.slice(1).some((p,i)=>Math.abs(layout.x(p.x)-layout.x(q.points[i].x))<6);
 return '<section class="probability-quality" data-distribution-feedback>'+
 (q.issues.length?'<strong>Before saving or exporting</strong><ul>'+q.issues.map(t=>'<li>'+e(t)+'</li>').join("")+'</ul>':
  '<strong>Figure ready for export</strong>'+(q.statement?'<p>'+e(q.statement)+'</p>':""))+
 (clipped?'<p class="distribution-caution"><strong>Boundary outside the displayed window:</strong> the model probability still uses the full event, but this boundary is not visible. Consider whether the current figure explains the event clearly enough.</p>':"")+
 (crowded?'<p class="distribution-caution"><strong>Very close numerical outcomes:</strong> some custom bars may overlap or become difficult to distinguish at this size. Consider a compact probability table instead.</p>':"")+
 '<details><summary>Model assumptions and interpretation</summary><ul>'+q.notes.map(t=>'<li>'+e(t)+'</li>').join("")+'</ul></details></section>';
}
export function distributionOutputHtml(studio,icon,e){
 const q=analyzeDistribution(studio.draft);
 return '<div data-distribution-output class="probability-output">'+
 representationOutputActions(icon,e,{type:"distribution",ready:q.ready,
  saveAction:"distribution-save",linkAction:"distribution-use",
  disabledReason:q.issues[0]||"Complete the figure first.",
  formats:[["distribution-svg","Download SVG","download"],["distribution-png","Download PNG","download"]]})+
 '<p>'+Math.max(0,MAX_DISTRIBUTION_FIGURES-studio.figures.length)+' free saved-figure slots. Mathematical explanation stays in the editor, not in the figure.</p></div>';
}
export function renderDistributionStudio(state,icon,e){
 const s=state.distributionStudio,d=s.draft;
 return '<section class="probability-studio representation-studio" data-distribution-studio aria-label="Probability Distribution Studio">'+
 '<div class="representation-studio-intro"><span class="intro-writing-guide-eyebrow">PROBABILITY DISTRIBUTION STUDIO</span>'+
 '<h2>Illustrate a probability model</h2><p>Choose a theoretical distribution and shade an optional event. Only the title, mathematical graph and chosen labels appear in your exported IA figure.</p>'+
 '<p class="distribution-accessible-status" data-distribution-a11y-status role="status" aria-live="polite" aria-atomic="true"></p></div>'+
 '<div class="probability-workspace"><div class="probability-controls" data-representation-step="create">'+
 '<h3>1. Figure and model</h3>'+
 select("kind","Distribution",d.kind,[["normal","Normal"],["binomial","Binomial"],["poisson","Poisson"],["uniform","Continuous uniform"],["custom","Custom discrete"]],e)+
 field("title","Figure title (required)",d.title,e)+
 field("symbol","Random variable letter (e.g. X, T or Y)",d.symbol,e)+
 field("unit","Units (optional)",d.unit,e)+
 (d.kind==="normal"?field("mu","Mean (μ)",d.mu,e)+field("sigma","Standard deviation (σ)",d.sigma,e):
 d.kind==="binomial"?field("n","Number of trials (n)",d.n,e)+field("p","Probability of success (p)",d.p,e):
 d.kind==="poisson"?field("lambda","Mean event count per interval (λ)",d.lambda,e):
 d.kind==="uniform"?field("a","Lower limit (a)",d.a,e)+field("b","Upper limit (b)",d.b,e):
 '<label class="probability-field distribution-outcome-entry"><span>Outcome, probability — one pair per line</span>'+
 '<textarea rows="6" spellcheck="false" data-distribution-field="customPoints" aria-describedby="distribution-outcomes-tip">'+e(d.customPoints)+'</textarea>'+
 '<small id="distribution-outcomes-tip">For example: enter -2, 0.2 on the first line, 0, 0.5 on the second, and 3, 0.3 on the third. Use a comma or tab to separate each outcome from its probability. No automatic normalisation.</small></label>')+
 '<h3>2. Probability to highlight</h3>'+
 select("mode","Highlight",d.mode,[["none","No probability"],["left","At most / left tail (≤)"],
 ["right","At least / right tail (≥)"],["between","Between two inclusive boundaries"],
 ["outside","Outside two boundaries"]].concat(["binomial","poisson","custom"].includes(d.kind)?[["exact","Exact outcome (=)"]]:[]),e)+
 (d.mode!=="none"?boundaryField("lower",["between","outside"].includes(d.mode)?"Lower boundary":"Value / boundary",d.lower,e):"")+
 (["between","outside"].includes(d.mode)?boundaryField("upper","Upper boundary",d.upper,e):"")+
 renderDistributionInverseHtml(s,e)+
 renderDistributionWhatIfControls(s,e,distributionAim(state),distributionWhatIfWritingContext(state))+
 '<details class="ia-figure-presentation-settings"><summary>IA figure appearance</summary>'+
 select("size","Figure size",d.size,[["compact","Compact"],["standard","Standard IA"],["wide","Wide"]],e)+
 select("printStyle","Printing",d.printStyle,[["colour","Colour"],["mono","Monochrome"]],e)+
 toggle("showProbability","Print probability statement inside figure",d.showProbability)+
 toggle("showParameters","Show model parameters in figure",d.showParameters)+
 (["normal","uniform"].includes(d.kind)?toggle("showMean","Show mean marker",d.showMean):"")+
 field("figureNumber","Figure number for IA label (optional)",d.figureNumber,e)+
 field("caption","Caption for IA label (optional)",d.caption,e)+
 '<p class="distribution-caption-help" data-distribution-caption-help>These are kept for the <strong>IA figure label and source</strong> in the writing handover, not printed inside the SVG or PNG. Place the label beneath the figure in your final IA; use the figure title above the graph.</p>'+
 '</details><h3>3. Model provenance</h3>'+
 select("sourceKind","Where did your model parameters or probabilities come from?",d.sourceKind,
 [["theoretical","Assumed theoretical model"],["primary","Estimated from my data"],
 ["secondary","Published data"],["unsure","Not yet confirmed"]],e)+
 (d.sourceKind==="secondary"?field("sourceCredit","Source reference",d.sourceCredit,e):"")+
 '<label class="probability-field"><span>Assumptions or limitations (not printed)</span><textarea data-distribution-field="note" rows="3">'+e(d.note)+'</textarea></label>'+
 '<button type="button" class="btn btn-quiet btn-sm" data-action="distribution-new">+ New distribution figure</button>'+
 '</div><div class="probability-main"><div class="probability-preview-header"><h3>Figure preview</h3>'+
 '<div class="probability-preview-controls" role="group" aria-label="Preview magnification">'+
 '<button type="button" class="btn btn-secondary btn-sm" data-action="distribution-preview-fit" aria-pressed="'+(!s.zoomed)+'">Fit figure</button>'+
 '<button type="button" class="btn btn-secondary btn-sm" data-action="distribution-preview-detail" aria-pressed="'+(!!s.zoomed)+'">Enlarge to check labels</button></div></div>'+
 distributionPreviewHtml(s)+
 distributionWhatIfPreviewHtml(s,e)+
 '<p class="probability-canvas-note">Drag a marker or use arrow keys to change a boundary. For exact values, type above (or use −/+ on a phone). Custom discrete markers snap to entered outcomes. Editing controls and help are never printed in the exported IA figure.</p>'+
 distributionFeedbackHtml(s,e)+renderDistributionGuidance(state,icon,e)+'<div data-representation-step="use">'+distributionOutputHtml(s,icon,e)+'</div>'+
 (s.figures.length?'<details class="probability-saved"><summary>Saved distributions ('+s.figures.length+')</summary>'+
 s.figures.map(f=>'<div class="probability-saved-row"><strong>'+e(f.draft.title||"Distribution")+'</strong>'+
 '<button type="button" class="btn btn-secondary btn-sm" data-action="distribution-load" data-distribution-id="'+e(f.id)+'">Edit figure</button></div>').join("")+
 '</details>':"")+'</div></div></section>';
}
