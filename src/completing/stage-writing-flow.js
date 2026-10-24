/** Shared IA Studio writing-stage layout.
 * Guided mode shows the instructional sequence. Reduced mode starts with the
 * actual writing task and makes saved context available on demand.
 * No stored notes or field-help bubbles are altered by this presentation.
 */
export function renderWritingStageFlow({advice="",sparks="",task="",examples="",reduced=false}={}){
 const section=(name,content)=>content?'<div class="writing-stage-part writing-stage-'+name+'" data-writing-stage-part="'+name+'">'+content+'</div>':"";
 if(reduced){
  // Keep every saved spark, planning link, source/accuracy cue and editable
  // prediction under one native disclosure. Leave the writing task and its
  // green/purple help bubbles immediately visible.
  const references=sparks?'<details class="writing-stage-reduced-reference" data-reduced-saved-context>'+
   '<summary><strong>Review my saved ideas (optional)</strong>'+
   '<small>Open Planning notes, mathematical starting points and earlier sparks only when you need them.</small></summary>'+
   '<div class="writing-stage-reduced-reference-body">'+sparks+'</div></details>':"";
  return '<div class="writing-stage-flow is-reduced" data-writing-stage-flow data-advice-mode="reduced">'+
   section("task",task)+section("sparks",references)+'</div>';
 }
 // Existing field-level criteria, stuck and method help remain on the task.
 // Show the relevant saved context first, let students write next, and move
 // supplementary craft/exemplars after the work rather than repeating a wall.
 return '<div class="writing-stage-flow" data-writing-stage-flow data-advice-mode="guided">'+
  section("sparks",sparks)+section("task",task)+section("advice",advice)+section("examples",examples)+'</div>';
}
