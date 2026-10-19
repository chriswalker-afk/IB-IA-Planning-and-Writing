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
