/** Shared IA Studio writing-stage layout.
 *  Each stage has one primary task and one predictable reading order.
 *  Optional examples cannot interrupt the student's main writing prompt.
 */
export function renderWritingStageFlow({advice="",sparks="",task="",examples=""}={}){
 const section=(name,content)=>content?'<div class="writing-stage-part writing-stage-'+name+'" data-writing-stage-part="'+name+'">'+content+'</div>':"";
 return '<div class="writing-stage-flow" data-writing-stage-flow>'+
  section("advice",advice)+
  section("sparks",sparks)+
  section("task",task)+
  section("examples",examples)+
 '</div>';
}
