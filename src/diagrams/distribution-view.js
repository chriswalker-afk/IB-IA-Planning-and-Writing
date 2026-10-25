import {analyzeDistribution,MAX_DISTRIBUTION_FIGURES} from "./distribution-core.js";
import {renderDistributionSvg} from "./distribution-render.js";
import {representationOutputActions} from "./workspace-ui.js";
const field=(key,label,value,e)=>
 '<label class="probability-field"><span>'+e(label)+'</span><input type="text" data-distribution-field="'+key+'" value="'+e(value)+'"></label>';
const select=(key,label,value,options,e)=>
 '<label class="probability-field"><span>'+e(label)+'</span><select data-distribution-field="'+key+'">'+
 options.map(([v,t])=>'<option value="'+e(v)+'"'+(value===v?' selected':'')+'>'+e(t)+'</option>').join("")+'</select></label>';
const toggle=(key,label,checked)=>'<label class="probability-tick"><input type="checkbox" data-distribution-field="'+key+'"'+(checked?" checked":"")+'><span>'+label+'</span></label>';
export function distributionPreviewHtml(studio){
 return '<div class="distribution-preview" data-distribution-preview>'+renderDistributionSvg(studio.draft)+'</div>';
}
export function distributionFeedbackHtml(studio,e){
 const q=analyzeDistribution(studio.draft);
 return '<section class="probability-quality" data-distribution-feedback aria-live="polite">'+
 (q.issues.length?'<strong>Before saving or exporting</strong><ul>'+q.issues.map(t=>'<li>'+e(t)+'</li>').join("")+'</ul>':
  '<strong>Figure ready for export</strong>'+(q.statement?'<p>'+e(q.statement)+'</p>':""))+
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
 '<h2>Illustrate a probability model</h2><p>Choose a theoretical distribution and shade an optional event. Only the title, mathematical graph and chosen labels appear in your exported IA figure.</p></div>'+
 '<div class="probability-workspace"><div class="probability-controls" data-representation-step="create">'+
 '<h3>1. Figure and model</h3>'+
 select("kind","Distribution",d.kind,[["normal","Normal"],["binomial","Binomial"]],e)+
 field("title","Figure title (required)",d.title,e)+
 field("symbol","Random variable letter (e.g. X, T or Y)",d.symbol,e)+
 field("unit","Units (optional)",d.unit,e)+
 (d.kind==="normal"?field("mu","Mean (μ)",d.mu,e)+field("sigma","Standard deviation (σ)",d.sigma,e):
 field("n","Number of trials (n)",d.n,e)+field("p","Probability of success (p)",d.p,e))+
 '<h3>2. Probability to highlight</h3>'+
 select("mode","Highlight",d.mode,[["none","No probability"],["left","At most / left tail (≤)"],
 ["right","At least / right tail (≥)"],["between","Between two inclusive boundaries"],
 ["outside","Outside two boundaries"]].concat(d.kind==="binomial"?[["exact","Exact value (=)"]]:[]),e)+
 (d.mode!=="none"?field("lower",["between","outside"].includes(d.mode)?"Lower boundary":"Value / boundary",d.lower,e):"")+
 (["between","outside"].includes(d.mode)?field("upper","Upper boundary",d.upper,e):"")+
 '<details class="ia-figure-presentation-settings"><summary>IA figure appearance</summary>'+
 select("size","Figure size",d.size,[["compact","Compact"],["standard","Standard IA"],["wide","Wide"]],e)+
 select("printStyle","Printing",d.printStyle,[["colour","Colour"],["mono","Monochrome"]],e)+
 toggle("showProbability","Print probability statement inside figure",d.showProbability)+
 toggle("showParameters","Show model parameters in figure",d.showParameters)+
 (d.kind==="normal"?toggle("showMean","Show mean marker",d.showMean):"")+
 field("figureNumber","Figure number (optional)",d.figureNumber,e)+
 field("caption","Figure caption (optional)",d.caption,e)+
 '</details><h3>3. Model provenance</h3>'+
 select("sourceKind","Where did your parameters come from?",d.sourceKind,
 [["theoretical","Assumed theoretical model"],["primary","Estimated from my data"],
 ["secondary","Published data"],["unsure","Not yet confirmed"]],e)+
 (d.sourceKind==="secondary"?field("sourceCredit","Source reference",d.sourceCredit,e):"")+
 '<label class="probability-field"><span>Assumptions or limitations (not printed)</span><textarea data-distribution-field="note" rows="3">'+e(d.note)+'</textarea></label>'+
 '<button type="button" class="btn btn-quiet btn-sm" data-action="distribution-new">+ New distribution figure</button>'+
 '</div><div class="probability-main"><div class="probability-preview-header"><h3>Figure preview</h3></div>'+
 distributionPreviewHtml(s)+
 '<p class="probability-canvas-note">White-background vector figure; annotations and warnings below are not exported. Check readability at the intended document size.</p>'+
 distributionFeedbackHtml(s,e)+'<div data-representation-step="use">'+distributionOutputHtml(s,icon,e)+'</div>'+
 (s.figures.length?'<details class="probability-saved"><summary>Saved distributions ('+s.figures.length+')</summary>'+
 s.figures.map(f=>'<div class="probability-saved-row"><strong>'+e(f.draft.title||"Distribution")+'</strong>'+
 '<button type="button" class="btn btn-secondary btn-sm" data-action="distribution-load" data-distribution-id="'+e(f.id)+'">Edit figure</button></div>').join("")+
 '</details>':"")+'</div></div></section>';
}
