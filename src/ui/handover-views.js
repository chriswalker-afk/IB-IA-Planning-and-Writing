import {FIELD_GROUPS} from "../handover/schema.js";
import {planningFlags,selectedMaths} from "../planning/engine.js";

/**
 * Review-driven handover UI. Document bytes are untrusted: every displayed
 * value must pass through the host's escaping function.
 */
export function createHandoverViews(ctx){
 const {e,icon,button,field}=ctx;
 const short=(s,limit=350)=>{
  const value=String(s??"").trim();
  return value.length>limit?value.slice(0,limit)+" …":value;
 };
 const summary=(heading,text)=>'<div class="handover-value"><span>'+e(heading)+'</span><p>'+e(short(text)||"Not recorded")+'</p></div>';
 function preview(pending,selected){
  const state=ctx.getState(),diffs=pending.changes||[];
  const count=[...selected].filter(key=>diffs.some(d=>d.key===key)).length;
  const existingProgress=state.entries.length>0||Object.values(state.scratch).some(v=>String(v??"").trim());
  let result='<section><p class="text-muted">Choose what to copy from this document. Nothing changes until you confirm.</p>'+
   '<div class="handover-provenance"><div><strong>'+e(pending.fileName||"Planning document")+'</strong>'+
   '<p>Original export: '+e(pending.envelope.exportedAt?.slice(0,10)||"Date unknown")+
   ' · '+e(pending.kind==="partial"?"Partial text recovery":"Embedded Pathfinder planning snapshot")+'</p></div>'+
   '<span class="status-tag pending">Not teacher-approved</span></div>'+
   (pending.envelope.demo?'<p class="inline-warning">This is a demonstration project, not real evidence or student work.</p>':"")+
   (pending.warning?'<p class="field-hint">'+e(pending.warning)+'</p>':"")+
   '<div class="compare-highlight">'+summary("Aim in this document",pending.envelope.planning.fields.aim)+
   summary("Aim currently saved",state.planning.fields.aim)+'</div>'+
   (existingProgress?'<p class="inline-warning">Your completed mathematics and Studio writing notes will NOT be replaced. Only explicitly chosen Planning answers can change.</p>':
    '<p class="field-hint">This import changes Planning answers only; it never marks planned mathematics as completed.</p>')+
   (pending.envelope.teacher?.openFlags?.length?'<div class="handover-warning"><strong>Points originally flagged for teacher review</strong>'+
   '<ul>'+pending.envelope.teacher.openFlags.map(x=>'<li>'+e(x.title)+'</li>').join("")+'</ul>'+
   '<p>Importing this file is not permission or confirmation of any teacher decision.</p></div>':"")+
   '<div class="button-row handover-select-toolbar">'+button("Fill missing answers","merge-select-missing","btn-light")+
   button("Select all","merge-select-all","btn-quiet")+button("Clear selection","merge-select-none","btn-quiet")+'</div>';
  if(!diffs.length)result+='<p class="field-hint">All recognisable planning answers already match this project. There is nothing new to import.</p>';
  else {
   for(const group of Object.keys(FIELD_GROUPS)){
    const items=diffs.filter(d=>d.group===group);
    if(!items.length)continue;
    result+='<div class="handover-diff-group"><h3>'+e(group)+'</h3>'+
     items.map(d=>'<label class="handover-diff-row"><input type="checkbox" data-merge-key="'+e(d.key)+'"'+
      (selected.has(d.key)?' checked':"")+'>'+
      '<span class="handover-diff-body"><strong>'+e(d.label)+'</strong>'+
      '<span><em>Currently saved</em>'+e(short(d.old)||"— Not recorded")+'</span>'+
      '<span class="handover-incoming"><em>From document</em>'+e(short(d.next))+'</span></span></label>').join("")+
     '</div>';
   }
  }
  return result+'<div class="handover-actions"><p><strong id="mergeCount">'+count+'</strong> planning changes selected</p>'+
   button("Import selected answers","merge-apply","btn-primary")+
   button("Keep current project","close-drawer","btn-quiet")+'</div></section>';
 }
 function manual(message){
  return '<section><h3>We could not recover a complete plan</h3>'+
   '<p class="text-muted">'+e(message||"No machine-readable data found.")+'</p>'+
   '<div class="handover-warning"><strong>Useful ways forward</strong>'+
   '<p>If possible, upload the original IA Pathfinder PDF/Word export or a JSON project backup. Printing or resaving a document through another app can remove its embedded project data.</p>'+
   '<p>Scanned PDFs cannot be reconstructed automatically, but you can still continue with an incomplete plan.</p></div>'+
   '<div class="panel-list">'+button("Enter or confirm the basics","open-handover","btn-primary")+
   button("Restore JSON backup","import-json","btn-secondary")+
   button("Continue in IA Studio","go-studio","btn-quiet")+'</div></section>';
 }
 function confirmation(){
  const s=ctx.getState(),f=s.planning.fields,flags=planningFlags(s);
  return '<section><p class="text-muted">Confirm what is still true now that your investigation is beginning. This revisits the plan; it never creates an IA introduction for you.</p>'+
   (s.handover.confirmedAt?'<p class="field-hint">Last reviewed: '+e(s.handover.confirmedAt.slice(0,10))+'</p>':"")+
   field("planning.fields.aim","Current investigation aim","What mathematical question are you exploring?",{type:"textarea",rows:3,drawer:true})+
   field("planning.fields.course","IB Mathematics course","",{type:"select",drawer:true,options:[
     ["","To confirm"],["AI SL","AI SL"],["AA SL","AA SL"],["AI HL","AI HL"],["AA HL","AA HL"],["other","Other / to confirm"] ]})+
   field("planning.fields.kind","Investigation type","",{type:"select",drawer:true,options:[
     ["","To confirm"],["statistics","Statistics"],["modelling","Modelling"],["theoretical","Theoretical / no dataset"],["unsure","Not sure yet"] ]})+
   field("planning.fields.beneficiary","Current beneficiary / personal purpose","Who could use or benefit from knowing the result?",{type:"textarea",rows:2,drawer:true})+
   field("planning.fields.intendedUse","What the results might help someone understand or decide","An intended use, not yet proven by findings",{type:"textarea",rows:2,drawer:true})+
   field("planning.fields.prediction","Original prediction (still provisional)","What did you initially expect?",{type:"textarea",rows:2,drawer:true})+
   field("planning.fields.firstAction","First mathematical action in your plan","What might you do first?",{type:"textarea",rows:2,drawer:true})+
   '<div class="handover-warning"><strong>Teacher discussion and permissions</strong>'+
   ((flags.length||s.teacher.concerns?.length)?'<ul>'+[...flags.map(x=>x.title),...(s.teacher.concerns||[])].map(x=>'<li>'+e(x)+'</li>').join("")+'</ul>':
    '<p>No additional planning flags are identified. That is not evidence of teacher approval.</p>')+
   '<p>Confirmation records that you reviewed these starting details. It does not confirm consent, source access or syllabus suitability.</p></div>'+
   '<div class="panel-list">'+button("I have reviewed these details","handover-confirm","btn-primary")+
   button("Go to my IA Studio","go-studio","btn-secondary")+'</div></section>';
 }
 return {preview,manual,confirmation};
}
