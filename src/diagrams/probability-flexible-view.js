/** Flexible-mode editors reuse the existing probability and event controls. */
import {FLEXIBLE_PRESETS,flexibleTreeStructure,MAX_TREE_OUTCOMES,MAX_TREE_STAGES} from "./probability-flexible-core.js";
const hist=(d,id)=>id?[...id].map((digit,index)=>
 d.branches[id.slice(0,index)]?.[Number(digit)]?.label||"unlabelled outcome").join(" → "):"Starting event";
export function probabilityPresetChooser(d,e){
 return '<div class="probability-presets" aria-label="Tree starting layouts">'+
 '<h4>Starting layouts</h4><p>Choose a ready-made structure or start with only two outcomes. Templates leave probabilities blank for you to enter.</p>'+
 '<div class="probability-presets-grid">'+FLEXIBLE_PRESETS.map(p=>
  '<button type="button" class="btn btn-secondary btn-sm" data-action="probability-preset" data-prob-preset="'+p.id+
  '" title="'+e(p.description)+'">'+e(p.label)+'</button>').join("")+'</div>'+
 (d.treeMode==="standard"?'<button type="button" class="btn btn-secondary btn-sm" data-action="probability-flexibilise">Keep this tree and unlock flexible branching</button>':
  '<p class="probability-mode-note">Flexible mode: splits may have 2–5 outcomes, and different paths can finish at different stages.</p>')+
 '</div>';
}
function parentEditor(d,parent,leaves,e){
 const id=parent.id,children=d.branches[id],past=hist(d,id);
 return '<fieldset class="probability-split probability-flex-split"><legend data-prob-history="'+e(id)+'">'+e(past)+'</legend>'+
 '<p>This '+children.length+'-way split is conditional on the preceding path. Its probabilities must total 1.</p>'+
 children.map((child,index)=>{
  const path=id+index,isLeaf=leaves.has(path),canExtend=path.length<d.stages;
  return '<div class="probability-flex-outcome"><div class="probability-branch-fields">'+
    '<label><span>Outcome '+(index+1)+'</span><input type="text" data-prob-branch-parent="'+e(id)+
    '" data-prob-branch-index="'+index+'" data-prob-branch-key="label" value="'+e(child.label)+'" placeholder="Outcome label"></label>'+
    '<label><span>Probability</span><input type="text" inputmode="decimal" data-prob-branch-parent="'+e(id)+
    '" data-prob-branch-index="'+index+'" data-prob-branch-key="probability" value="'+e(child.probability)+
    '" placeholder="e.g. 1/3 or 0.4"></label></div>'+
    '<div class="probability-flex-branch-actions">'+
     '<span class="probability-order-actions" role="group" aria-label="Order of outcomes">'+
     '<button type="button" class="btn btn-quiet btn-sm" data-action="probability-outcome-move" data-prob-parent="'+e(id)+
      '" data-prob-index="'+index+'" data-prob-direction="-1" aria-label="Move outcome '+(index+1)+' up"'+
      (index===0?' disabled':'')+'>↑ Move up</button>'+
     '<button type="button" class="btn btn-quiet btn-sm" data-action="probability-outcome-move" data-prob-parent="'+e(id)+
      '" data-prob-index="'+index+'" data-prob-direction="1" aria-label="Move outcome '+(index+1)+' down"'+
      (index===children.length-1?' disabled':'')+'>↓ Move down</button></span>'+
     (canExtend?'<button type="button" class="btn btn-quiet btn-sm" data-action="probability-path-continuation" data-prob-path="'+
      e(path)+'" data-prob-continue="'+(isLeaf?"true":"false")+'">'+(isLeaf?'+ Add next split':'Finish this path here')+'</button>':
      '<span class="probability-final-note">Final stage</span>')+
     (children.length>2?'<button type="button" class="btn btn-quiet btn-sm probability-remove-choice" data-action="probability-outcome-remove" data-prob-parent="'+
       e(id)+'" data-prob-index="'+index+'">Remove outcome</button>':"")+
    '</div>'+
    '<details class="probability-label-nudge"><summary>Adjust label placement</summary>'+
     '<p>Move the outcome/probability label together. The branch probabilities do not change.</p>'+
     '<div class="probability-label-nudge-grid">'+
     [['x','Horizontal (−48 to 48 px)',-48,48],['y','Vertical (−28 to 8 px)',-28,8]].map(([axis,label,min,max])=>
      '<label>'+label+'<input type="number" step="1" min="'+min+'" max="'+max+
      '" data-prob-offset-path="'+e(path)+'" data-prob-offset-axis="'+axis+
      '" value="'+(d.labelOffsets?.[path]?.[axis]||0)+'"></label>').join("")+
     '</div></details></div>';
 }).join("")+
 '<button type="button" class="btn btn-secondary btn-sm" data-action="probability-outcome-add" data-prob-parent="'+e(id)+'"'+
 (children.length>=MAX_TREE_OUTCOMES?' disabled':'')+'>+ Add outcome to this split</button>'+
 '</fieldset>';
}
export function probabilityFlexibleEditors(studio,e){
 const d=studio.draft,tree=flexibleTreeStructure(d),leaves=new Set(tree.leaves);
 return '<div class="probability-flex-intro"><p>Each active split has its own probabilities. Use <strong>Add outcome</strong> for three or more possibilities; <strong>Finish this path here</strong> for an early outcome, or <strong>Add next split</strong> to investigate that outcome further. No probabilities are filled automatically.</p></div>'+
 Array.from({length:d.stages},(_,level)=>{
  const parents=tree.parents.filter(p=>p.depth===level),open=level===0||studio.editLevel===level;
  if(!parents.length)return "";
  return '<details class="probability-stage probability-flex-stage"'+(open?' open':'')+'><summary><strong>Stage '+(level+1)+
    '</strong><span data-prob-stage-label="'+level+'">'+e(d.stageLabels[level])+'</span>'+
    '<small>'+parents.length+' active split'+(parents.length===1?'':'s')+'</small></summary><div class="probability-stage-body">'+
    '<label class="probability-field"><span>Stage '+(level+1)+' label</span><input type="text" data-prob-stage="'+level+
    '" value="'+e(d.stageLabels[level])+'"></label>'+
    parents.map(parent=>parentEditor(d,parent,leaves,e)).join("")+
    '</div></details>';
 }).join("")+
 '<p class="probability-limit-note">Move outcomes up or down without losing their conditional subtrees or selected event paths. Maximum '+MAX_TREE_STAGES+' stages, '+MAX_TREE_OUTCOMES+
 ' outcomes per split and 32 complete paths. An early terminal path still contributes to the total probability.</p>';
}
