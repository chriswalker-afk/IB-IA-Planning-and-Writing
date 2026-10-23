/** One student-facing vocabulary for three DISTINCT advice systems.
 * I am stuck = unblock the immediate obstacle; Field Guide = writing craft;
 * IB criteria = assessment relevance. None changes or grades student work.
 * The same destinations also remain reachable contextually beside task fields.
 */
export const GUIDANCE_CHOICES=Object.freeze([
 Object.freeze({
  id:"stuck",title:"I am stuck",action:"open-stuck",icon:"lightbulb",
  purpose:"I cannot move forward. Help me identify the obstacle and try one specific next action."
 }),
 Object.freeze({
  id:"writing",title:"Writer's Field Guide",action:"writer-guide-open",icon:"book",
  purpose:"I know what I want to say, but need help explaining my mathematical thinking clearly."
 }),
 Object.freeze({
  id:"criteria",title:"IB criteria",action:"essentials-open",icon:"check-circle",
  purpose:"I want to understand what the assessment looks for, without predicting a mark."
 })
]);
export function guidanceChoices(icon,escapeHtml){
 const e=escapeHtml;
 return '<div class="guidance-choice-list" role="group" aria-label="Choose the kind of help you need">'+
  GUIDANCE_CHOICES.map(choice=>
   '<button type="button" class="panel-link guidance-choice guidance-choice-'+choice.id+
   '" data-action="'+choice.action+'">'+
   '<span class="guidance-choice-icon">'+icon(choice.icon)+'</span>'+
   '<span class="guidance-choice-copy"><strong>'+e(choice.title)+'</strong><small>'+e(choice.purpose)+'</small></span>'+
   icon("arrow-right")+'</button>'
  ).join("")+'</div>';
}
