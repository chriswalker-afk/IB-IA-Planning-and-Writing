import {probabilityAnalysis,activeParents,leafKeys,MAX_PROBABILITY_FIGURES} from "./probability-core.js";
import {renderProbabilitySvg} from "./probability-render.js";
import {renderPresentationCoach,renderFigureHandover} from "./presentation-coach-view.js";
const field=(key,name,value,e,placeholder="")=>
 '<label class="probability-field"><span>'+e(name)+'</span><input type="text" data-prob-field="'+key+
 '" value="'+e(value)+'" placeholder="'+e(placeholder)+'"></label>';
const tick=(key,name,checked)=>'<label class="probability-tick"><input type="checkbox" data-prob-field="'+key+'"'+
 (checked?" checked":"")+'><span>'+name+'</span></label>';
const fmt=n=>n===null?"—":Number(n.toFixed(6)).toString();
const history=(d,parent)=>parent?parent.split("").map((bit,i)=>
 d.branches[parent.slice(0,i)][Number(bit)].label||"unlabelled outcome").join(" → "):"Starting event";
export function probabilityPreviewHtml(studio){
 return '<div class="probability-preview" data-prob-preview>'+renderProbabilitySvg(studio.draft)+'</div>';
}
export function probabilityQualityHtml(studio,e){
 const a=probabilityAnalysis(studio.draft),d=a.draft,parts=[];
 if(a.issues.length){
  parts.push('<h3>Check before saving</h3><ul>'+a.issues.slice(0,9).map(x=>'<li>'+e(x)+'</li>').join("")+'</ul>'+
    (a.issues.length>9?'<p>There are '+(a.issues.length-9)+' other checks.</p>':""));
 }else{
  parts.push('<h3>All branch pairs sum to 1</h3><p>The '+d.stages+'-stage tree has '+a.paths.length+
   ' terminal paths. Their total probability is '+fmt(a.total)+
   '. This verifies arithmetic consistency, not that your underlying probabilities are justified.</p>');
 }
 if(d.showProducts){
  parts.push('<h4>Optional path calculations</h4>');
  if(!a.ready)parts.push('<p>Complete every branch before calculating path probabilities.</p>');
  else parts.push('<div class="probability-path-table"><table><thead><tr><th>Outcome sequence</th><th>Branch product</th><th>Path probability</th></tr></thead><tbody>'+
    a.paths.map(p=>'<tr><td>'+e(p.labels.join(" → "))+'</td><td>'+e(p.steps.join(" × "))+'</td><td>'+fmt(p.probability)+'</td></tr>').join("")+
    '</tbody></table></div>');
 }
 if(d.showEventCalculation){
  parts.push('<h4>Optional event and conditional calculations</h4>');
  if(!a.ready)parts.push('<p>Calculations appear after all branch probabilities are valid.</p>');
  else{
   if(a.event!==null)parts.push('<p>P('+e(d.eventName)+') = <strong>'+fmt(a.event)+'</strong></p>');
   if(a.condition!==null)parts.push('<p>P('+e(d.conditionName)+') = <strong>'+fmt(a.condition)+'</strong></p>');
   if(a.intersection!==null)parts.push('<p>P('+e(d.eventName)+' ∩ '+e(d.conditionName)+') = <strong>'+fmt(a.intersection)+'</strong></p>');
   if(a.conditional!==null)parts.push('<p>P('+e(d.eventName)+' | '+e(d.conditionName)+
     ') = '+fmt(a.intersection)+' ÷ '+fmt(a.condition)+' = <strong>'+fmt(a.conditional)+'</strong></p>');
   else if(a.condition===0)parts.push('<p class="probability-alert">The conditional probability is undefined because the conditioning event has probability zero.</p>');
   if(!d.eventLeaves.length||!d.conditionLeaves.length)
    parts.push('<p>Select the terminal outcomes belonging to each event to calculate its probability. Overlap is allowed and required when events intersect.</p>');
  }
 }
 parts.push('<p class="probability-safeguard">Each later branch is conditional on the exact preceding path. A tree alone does not prove independence, validate a sampling model, or establish a real-world probability.</p>');
 if(d.note.trim())parts.push('<p><strong>Your limitations:</strong> '+e(d.note)+'</p>');
 return '<section class="probability-quality" data-prob-quality>'+parts.join("")+'</section>';
}
export function probabilityOutputHtml(studio,icon){
 const remaining=MAX_PROBABILITY_FIGURES-studio.figures.length+(studio.activeId?1:0);
 const ready=probabilityAnalysis(studio.draft).ready,disabled=ready?"":" disabled";
 return '<div class="probability-output" data-prob-output><div class="probability-buttons">'+
 '<button type="button" class="btn btn-secondary" data-action="probability-save"'+disabled+'>'+icon("save")+' Save editable figure</button>'+
 '<button type="button" class="btn btn-primary" data-action="probability-use"'+disabled+'>'+icon("arrow-right")+' Use in this mathematical stage</button>'+
 '<button type="button" class="btn btn-secondary" data-action="probability-svg"'+disabled+'>Download SVG</button>'+
 '<button type="button" class="btn btn-secondary" data-action="probability-png"'+disabled+'>Download PNG</button></div>'+
 '<p>'+remaining+' saved-figure slot(s) available. '+(ready?"Check that every probability and modelling assumption is defensible before using this in your IA.":
 'Complete the validation checks before saving, linking or downloading. Unsaved edits remain in your local project and JSON backup.')+
 '</p></div>';
}
function stageEditor(d,level,e){
 const ids=activeParents(d.stages).filter(x=>x.length===level),open=level===0;
 return '<details class="probability-stage"'+(open?" open":"")+'><summary><strong>Stage '+(level+1)+
 '</strong><span>'+e(d.stageLabels[level])+'</span></summary><div class="probability-stage-body">'+
 '<label class="probability-field"><span>Stage '+(level+1)+' label</span><input type="text" data-prob-stage="'+level+
 '" value="'+e(d.stageLabels[level])+'"></label>'+
 ids.map(id=>'<fieldset class="probability-split"><legend>'+e(history(d,id))+'</legend>'+
 '<p>These two conditional probabilities must sum to 1.</p>'+
 [0,1].map(bit=>'<div class="probability-branch-fields"><label><span>Outcome '+(bit+1)+'</span>'+
 '<input type="text" data-prob-branch-parent="'+e(id)+'" data-prob-branch-index="'+bit+
 '" data-prob-branch-key="label" value="'+e(d.branches[id][bit].label)+'" placeholder="Outcome label (supports maths notation)"></label>'+
 '<label><span>Probability</span><input type="text" inputmode="decimal" data-prob-branch-parent="'+e(id)+
 '" data-prob-branch-index="'+bit+'" data-prob-branch-key="probability" value="'+e(d.branches[id][bit].probability)+
 '" placeholder="e.g. 0.6, 3/5 or 60%"></label></div>').join("")+'</fieldset>').join("")+'</div></details>';
}
function eventEditor(studio,e){
 const d=studio.draft;
 return '<section class="probability-events"><h3>Optional event calculations</h3>'+
 tick("showProducts","Show products along complete outcome paths",d.showProducts)+
 tick("showEventCalculation","Calculate selected events and conditional probabilities",d.showEventCalculation)+
 (d.showEventCalculation?'<p>Select the <strong>complete paths</strong> that belong to each event. P(E | C) means the chance of E given C; overlapping paths contribute to the intersection.</p>'+
 '<div class="probability-event-fields">'+field("eventName","Event name",d.eventName,e,"E")+
 field("conditionName","Given event",d.conditionName,e,"C")+'</div>'+
 '<div class="probability-path-select"><table><thead><tr><th>Complete outcome path</th><th>'+e(d.eventName)+'</th><th>'+e(d.conditionName)+'</th></tr></thead><tbody>'+
 leafKeys(d.stages).map(id=>'<tr><td>'+e(history(d,id))+'</td>'+
 ["eventLeaves","conditionLeaves"].map(key=>'<td><label class="probability-path-check"><input type="checkbox" data-prob-leaf="'+id+
 '" data-prob-membership="'+key+'"'+(d[key].includes(id)?" checked":"")+'> <span class="visually-hidden">Include path in '+e(key==="eventLeaves"?d.eventName:d.conditionName)+'</span></label></td>').join("")+'</tr>').join("")+
 '</tbody></table></div>':"")+'</section>';
}
export function renderProbabilityStudio(state,icon,e){
 const studio=state.probabilityStudio,d=studio.draft;
 return '<section class="probability-studio representation-studio" data-probability-studio aria-label="Probability Tree Studio">'+
 '<div class="representation-studio-intro"><span class="intro-writing-guide-eyebrow">PROBABILITY TREE STUDIO</span>'+
 '<h2>Build a conditional probability story</h2><p>Enter your own outcomes and branch probabilities. Each pair must sum to one, and later branches describe probabilities <strong>given the earlier outcomes</strong>—not necessarily independent events.</p></div>'+
 '<div class="probability-workspace"><div class="probability-controls" data-representation-step="create">'+
 '<h3>1. Set up your tree</h3>'+
 '<label class="probability-field"><span>Number of stages</span><select data-prob-field="stages"><option value="2"'+(d.stages===2?" selected":"")+'>Two stages (4 outcomes)</option><option value="3"'+(d.stages===3?" selected":"")+'>Three stages (8 outcomes)</option></select></label>'+
 field("title","Figure title",d.title,e)+field("figureNumber","Figure number",d.figureNumber,e)+
 '<div class="probability-buttons"><button type="button" class="btn btn-quiet btn-sm" data-action="probability-new">+ Start new tree</button></div>'+
 '<h3>2. Enter conditional branches</h3><p>Each panel describes an event after its exact preceding outcome history. Use decimals, fractions or percentages; values are never completed or normalised automatically.</p>'+
 Array.from({length:d.stages},(_,i)=>stageEditor(d,i,e)).join("")+
 '<div data-representation-step="refine">'+eventEditor(studio,e)+
 '<h3>3. Source and assumptions</h3>'+
 '<label class="probability-field"><span>Probability source</span><select data-prob-field="sourceKind">'+
 [["theoretical","Theoretical model"],["primary","My own observations / estimates"],["secondary","Published data"],["unsure","To confirm"]].map(([value,label])=>
 '<option value="'+value+'"'+(d.sourceKind===value?" selected":"")+'>'+label+'</option>').join("")+'</select></label>'+
 field("sourceCredit","Original source reference (if needed)",d.sourceCredit,e)+
 '<label class="probability-field"><span>Justification, dependence and limitations</span><textarea rows="3" data-prob-field="note">'+e(d.note)+'</textarea></label>'+
 '</div></div><div class="probability-main"><h3>Live probability tree</h3>'+probabilityPreviewHtml(studio)+
 '<p class="probability-canvas-note">On smaller screens the complete tree fits the available width. Enlarge with your device zoom if you need to inspect a dense three-stage diagram.</p>'+
 probabilityQualityHtml(studio,e)+renderPresentationCoach(state,"probability",d,icon,e)+
 '<div data-representation-step="use">'+probabilityOutputHtml(studio,icon)+renderFigureHandover(state,"probability",d,icon,e)+'</div>'+
 (studio.figures.length?'<details class="probability-saved"><summary>Saved probability trees ('+studio.figures.length+')</summary>'+
 studio.figures.map(fig=>'<div class="probability-saved-row"><strong>'+e(fig.draft.title||"Probability tree")+'</strong>'+
 '<button type="button" class="btn btn-secondary btn-sm" data-action="probability-load" data-prob-id="'+e(fig.id)+'">Edit saved tree</button></div>').join("")+'</details>':"")+
 '</div></div></section>';
}
