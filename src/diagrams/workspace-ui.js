/** Consistent, accessible empty-state pattern for every representation studio. */
export function representationEmpty(icon,e,{symbol="layers",title,description,action="",actionText=""}={}){
 const cta=action&&actionText?
  '<button type="button" class="btn btn-secondary btn-sm representation-empty-action" data-action="'+e(action)+'">'+
   icon("arrow-right")+e(actionText)+'</button>':"";
 return '<div class="representation-empty" role="status">'+
  '<span class="representation-empty-symbol">'+icon(symbol)+'</span>'+
  '<div class="representation-empty-copy"><strong>'+e(title||"Nothing here yet")+'</strong>'+
  '<p>'+e(description||"Create or import real mathematical information to begin.")+'</p></div>'+
  cta+'</div>';
}


/**
 * Shared, action-preserving output layout across all seven figure generators.
 * A draft save stores an editable figure; Save & link additionally attaches it
 * to the student's current mathematical entry. Exports are separate files.
 * The caller supplies existing data-action IDs and readiness checks; this
 * function NEVER invokes an action or marks an IA stage complete.
 */
export function representationOutputActions(icon,e,{
 type,ready=false,saveAction,linkAction,formats=[],
 disabledReason="Resolve the required mathematical and presentation checks first.",
 linkGroupClass="",saveGroupClass="",exportGroupClass=""
}={}){
 if(!type||!saveAction||!linkAction)throw new Error("A registered studio and existing save/link actions are required.");
 const disabled=ready?"":' disabled aria-disabled="true" title="'+e(disabledReason)+'"';
 const action=(id,label,symbol="download",primary=false)=>
  '<button type="button" class="btn '+(primary?"btn-primary":"btn-secondary btn-sm")+
  '" data-action="'+e(id)+'"'+disabled+'>'+icon(symbol)+e(label)+'</button>';
 return '<div class="representation-figure-actions" data-representation-actions="'+e(type)+
  '" data-representation-ready="'+!!ready+'">'+
  '<div class="representation-figure-use '+e(linkGroupClass)+'" role="group" aria-label="Link this figure to my mathematical stage">'+
   '<span class="representation-figure-action-kicker">USE IN IA STUDIO</span>'+
   action(linkAction,"Save & link to this mathematical stage","check-circle",true)+'</div>'+
  '<div class="representation-figure-save '+e(saveGroupClass)+'" role="group" aria-label="Keep an editable saved figure">'+
   '<span class="representation-figure-action-kicker">KEEP EDITABLE</span>'+
   action(saveAction,"Save editable draft","save")+'</div>'+
  '<div class="representation-figure-export '+e(exportGroupClass)+'" role="group" aria-label="Copy or download a finished figure">'+
   '<span class="representation-figure-action-kicker">COPY OR DOWNLOAD</span>'+
   '<div class="representation-figure-formats">'+formats.map(([id,label,symbol])=>
    action(id,label,symbol||"download")).join("")+'</div></div>'+
  '<p class="representation-figure-action-explain">Saving keeps an editable figure in this project and its JSON backup. Linking also associates it with this mathematical stage. Copying or downloading makes a file for your real IA; it does not save your draft, insert the figure or complete the mathematics.</p>'+
  '</div>';
}
