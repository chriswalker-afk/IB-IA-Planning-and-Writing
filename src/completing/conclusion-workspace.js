/** A single evidence-led conclusion workspace.
 * Deliberately uses existing student-owned C61–C63 fields. Earlier C60/C61–
 * C64 text remains editable, never merged silently into supposed IA prose.
 */
import {methodFamilies} from "./method-identity.js";
import {adaptiveNextDirections} from "./adaptive-journey.js";
import {renderSparkShelf} from "../ui/insight-threads.js";
import {renderConclusionReasoningThread,recordedDecisionNotes} from "./reasoning-thread.js";
import {renderConclusionValidityAid} from "./mathematical-validity.js";

const has=value=>typeof value==="string"&&!!value.trim();
const short=(s,max=215)=>{
 const v=typeof s==="string"?s.trim():"";
 return v.length<=max?v:v.slice(0,max-1).trimEnd()+"…";
};
const validResult=x=>x?.status==="completed"&&has(x.result);
const review=x=>x?.reviewNeeded==="yes";
const selectedResultIds=state=>Array.isArray(state?.completion?.conclusionResultIds)?
 state.completion.conclusionResultIds.filter(x=>typeof x==="string"):[];
export function conclusionResults(state){
 const selected=new Set(selectedResultIds(state));
 return (state?.entries||[]).map((entry,index)=>({
  entry,index,valid:validResult(entry),review:review(entry),
  selected:selected.has(entry?.id)
 })).filter(x=>x.valid||x.review);
}
/** Toggling evidence is a pointer to student-verified work, never an inferred
 * conclusion or a generated claim. Stale/flagged entries cannot be selected. */
export function toggleConclusionResult(state,id){
 if(!has(id))return{ok:false,error:"Choose a real mathematical result."};
 const entries=Array.isArray(state?.entries)?state.entries:[];
 const entry=entries.find(x=>x?.id===id);
 if(!entry)return{ok:false,error:"The mathematical record is no longer available."};
 const old=selectedResultIds(state).filter(key=>entries.some(x=>x?.id===key)),current=old.includes(id);
 if(!current&&(!validResult(entry)||review(entry)))
  return{ok:false,error:"This result needs to be completed or reviewed before you use it as conclusion evidence."};
 // Stale selections remain visible for review until the student selects fresh
 // evidence; they must not fill the three-result quota or displace new choices.
 const confirmed=old.filter(key=>entries.some(x=>x?.id===key&&validResult(x)&&!review(x)));
 if(!current&&confirmed.length>=3)return{ok:false,error:"Choose up to three decisive results. You can change your selection at any time."};
 state.completion.conclusionResultIds=current?old.filter(x=>x!==id):[...confirmed,id];
 if(state.completion.stages.C60==="complete")state.completion.stages.C60="needs-review";
 return{ok:true,selected:!current};
}
function mathematicalTip(state){
 const active=conclusionResults(state).filter(x=>x.valid&&!x.review);
 const selectedIds=selectedResultIds(state);
 const chosen=selectedIds.length?active.find(x=>x.selected)?.entry:active.at(-1)?.entry;
 if(!chosen)return "A conclusion can be provisional. Report only the mathematical results you have actually established.";
 const f=methodFamilies(chosen);
 if(f.has("pmcc")||/pearson|correlation|pmcc/i.test((chosen.technique||"")+" "+(chosen.title||"")))
  return "Correlation describes association, not causation. Interpret the coefficient alongside the shape and range of your actual data.";
 if(f.has("optimisation")||/optimi[sz]|stationary|maximum|minimum/i.test((chosen.technique||"")+" "+(chosen.title||"")))
  return "State the feasible domain and constraints. A stationary point alone does not establish the best feasible solution.";
 if(f.has("proof")||/proof|induction|counterexample/i.test((chosen.technique||"")+" "+(chosen.title||"")))
  return "State exactly what was proved and for which assumptions or domain; testing examples is not a general proof.";
 if(f.has("voronoi")||/voronoi/i.test((chosen.technique||"")+" "+(chosen.title||"")))
  return "Explain the distance metric and service-area assumptions; a Voronoi boundary is not automatically the best real-world decision.";
 if(f.has("model")||/regress|model|quadratic|exponential/i.test((chosen.technique||"")+" "+(chosen.title||"")))
  return "Keep the model's tested domain, residual behaviour and assumptions in view before claiming predictive validity.";
 if(f.has("probability")||/probability|simulation/i.test((chosen.technique||"")+" "+(chosen.title||"")))
  return "Distinguish theoretical probability from simulated estimates and acknowledge uncertainty or assumptions that matter.";
 return "State the range and assumptions of the actual result. A mathematically valid conclusion can still be limited in scope.";
}
function evidencePicker(state,e,icon){
 const results=conclusionResults(state),eligible=results.filter(x=>x.valid&&!x.review);
 const invalid=results.filter(x=>x.review||!x.valid);
 const chosen=selectedResultIds(state);
 const ordered=eligible.slice().sort((a,b)=>(Number(b.selected)-Number(a.selected))||(b.index-a.index));
 const first=ordered.slice(0,3),more=ordered.slice(3);
 const row=x=>{
  const st=x.entry,chosenNow=x.selected,caption=st.localTakeaway||st.interpretation||st.observationText||st.result;
  return '<button type="button" class="conclusion-evidence-item'+(chosenNow?' is-selected':'')+
   '" data-action="conclusion-result-toggle" data-entry-id="'+e(st.id)+
   '" aria-pressed="'+chosenNow+'" aria-label="'+e((chosenNow?"Remove":"Select")+
    " mathematical result "+(st.title||"stage "+(x.index+1)))+'">'+
   '<span class="conclusion-evidence-check">'+icon(chosenNow?"check-circle":"circle")+'</span>'+
   '<span class="conclusion-evidence-copy"><strong>'+e(st.technique||st.title||"Mathematical stage "+(x.index+1))+
   '</strong><span>'+e(short(caption,175))+'</span></span>'+
   '<span class="conclusion-evidence-choice">'+(chosenNow?"Selected":"Choose")+'</span></button>';
 };
 const flagged=invalid.length?'<div class="conclusion-evidence-flagged" role="note">'+
  '<strong>'+icon("alert-circle")+' Mathematical work requiring review</strong>'+
  invalid.map(x=>'<div><span>'+e(x.entry.title||"Mathematical stage "+(x.index+1))+
   ' — not currently confirmed for use in the conclusion.</span>'+
   '<button type="button" data-action="completion-edit-entry" data-index="'+x.index+
   '">Review mathematics '+icon("arrow-right")+'</button></div>').join("")+'</div>':"";
 if(!eligible.length)return '<section class="conclusion-evidence" aria-label="Your mathematical evidence">'+
  '<div class="conclusion-evidence-head"><strong>'+icon("check-circle")+' Your mathematical findings</strong></div>'+
  '<p class="conclusion-evidence-empty">No confirmed, review-free results are available yet. You can sketch a provisional conclusion, but do not claim mathematics you have not completed.</p>'+
  flagged+'</section>';
 return '<section class="conclusion-evidence" data-conclusion-evidence aria-label="Choose mathematical evidence">'+
  '<div class="conclusion-evidence-head"><strong>'+icon("check-circle")+' Your mathematical findings</strong>'+
   '<span>'+eligible.length+' student-confirmed result'+(eligible.length===1?"":"s")+' · '+eligible.filter(x=>x.selected).length+
    ' selected</span></div>'+
  '<p>Choose up to three findings that best support your answer. These are references to real mathematics, not automatically written IA prose.</p>'+
  '<div class="conclusion-evidence-list">'+first.map(row).join("")+'</div>'+
  (more.length?'<details class="conclusion-evidence-more"><summary>See '+more.length+
   ' other result'+(more.length===1?"":"s")+' '+icon("chevron-right")+'</summary>'+
   '<div class="conclusion-evidence-list">'+more.map(row).join("")+'</div></details>':"")+
  flagged+'</section>';
}
function previousWriting(state,field,F,e){
 const f=state.completion?.fields||{},slots=[
  ["scratch","My earlier free-form conclusion notes",state?.scratch?.conclusion,
   ()=>field("scratch.conclusion","My earlier conclusion draft or notes","Previously written notes remain editable",{type:"textarea",rows:5})],
  ["evidence","Earlier notes on supporting evidence",f.conclusionEvidence,
   ()=>F("conclusionEvidence","Earlier supporting-results notes","Results from earlier mathematical stages",{type:"textarea",rows:3})],
  ["limits","Earlier uncertainty notes",f.conclusionUncertainty,
   ()=>F("conclusionUncertainty","Earlier uncertainty and limitation notes","Only limitations affecting the final mathematical claim",{type:"textarea",rows:3})],
  ["advice","Earlier notes on recommendations",f.conclusionAdvice,
   ()=>F("conclusionAdvice","Earlier recommendations or decisions","Keep only evidence-supported advice",{type:"textarea",rows:3})],
  ["focus","Earlier editing checklist",f.conclusionFocus,
   ()=>F("conclusionFocus","Earlier notes on tightening the ending","Repetitions to remove or move",{type:"textarea",rows:3})]
 ];
 const saved=slots.filter(x=>has(x[2]));
 if(!saved.length)return"";
 return '<details class="conclusion-previous-notes" data-conclusion-legacy>'+
  '<summary>'+e("Earlier conclusion notes ("+saved.length+")")+
    '<span>Preserved from the old multi-page workspace</span></summary>'+
  '<div><p>These are your original notes, not automatically copied into the new writing boxes. You can edit or reuse your own words in your actual IA document.</p>'+
   saved.map(x=>x[3]()).join("")+'</div></details>';
}
function potentialQuestions(state,e,icon){
 const results=conclusionResults(state),selectedIds=selectedResultIds(state);
 const available=results.filter(x=>x.valid&&!x.review);
 const last=selectedIds.length?available.find(x=>x.selected)?.entry:available.at(-1)?.entry;
 if(!last)return"";
 const advice=adaptiveNextDirections(state,last),fromResult=advice?.status==="ready"?
  (advice.directions||[]).slice(0,2).map(x=>x.question):[];
 const original=has(recordedDecisionNotes(state,last).question)?[recordedDecisionNotes(state,last).question]:[];
 const questions=[...new Set([...original,...fromResult])].slice(0,2);
 if(!questions.length)return"";
 return '<details class="conclusion-next-help"><summary>'+icon("sparkles")+
   ' Questions suggested by your real findings '+icon("chevron-right")+'</summary>'+
   '<p>These are possibilities for future exploration, not work already completed or an instruction to add another IA stage.</p>'+
   '<div>'+questions.map(q=>'<p>'+e(q)+'</p>').join("")+'</div>'+
   '<p>Choose only one that genuinely adds value, explain why, or leave the extension out.</p></details>';
}
export function renderConclusionWorkspace({state,e,icon,field,F,criterionMarkedWritingBox,
 criteriaField,currentAim,plannedPrediction,currentBenefit,stuckBubble=()=>"",savedLimitations=()=>""}){
 const p=state.planning?.fields||{},f=state.completion?.fields||{};
 const aim=currentAim(),previous=previousWriting(state,field,F,e);
 const limits=savedLimitations(),shelf=renderSparkShelf(state,"C60",{surface:"studio",hideHeading:true});
 const other=[["Original prediction (not evidence)",plannedPrediction()],
  ["Original purpose or intended use",currentBenefit()||p.intendedUse],
  ["Original expectation or conjecture",p.predictionWhy]].filter(([,v])=>has(v));
 const context='<div class="conclusion-context"><div class="conclusion-context-aim">'+
  '<span>'+icon("target")+' YOUR MATHEMATICAL AIM</span>'+
  '<strong>'+e(aim||"Your aim has not been recorded yet. You can return to Planning to clarify it.")+'</strong></div>'+
  evidencePicker(state,e,icon)+
  (other.length||limits||shelf?
   '<details class="conclusion-original-context"><summary>'+icon("layers")+
   ' Original expectations, purpose and saved sparks '+icon("chevron-right")+'</summary><div>'+
    other.map(([title,v])=>'<p><strong>'+e(title)+'</strong> '+e(short(v,500))+'</p>').join("")+
    limits+(shelf||"")+
   '</div></details>':"")+'</div>';
 return '<div class="conclusion-workspace" data-conclusion-workspace>'+
  '<p class="conclusion-workspace-lead">Three ideas: <strong>answer</strong> your aim, explain its <strong>meaning and limits</strong>, then consider <strong>potential next steps</strong>. Write only what your mathematics supports.</p>'+
  context+
  renderConclusionReasoningThread(state,{icon,e,reduced:state.ui?.adviceMode==="reduced"})+
  renderConclusionValidityAid(state,{icon,e,reduced:state.ui?.adviceMode==="reduced"})+
  '<section class="conclusion-writing-part" data-conclusion-part="answer">'+
   '<div class="conclusion-part-title"><span class="conclusion-part-number">1</span><div>'+
     '<h3>What is your best-supported mathematical answer?</h3>'+
     '<p>Use your most decisive results or proof, with specific values or references where helpful. An uncertain or negative finding is legitimate.</p></div>'+stuckBubble("part:answer")+'</div>'+
   criterionMarkedWritingBox(F("mainConclusion","My answer to the investigation question",
    "What have I established mathematically? Which actual results support this answer?",
    {type:"textarea",rows:5}),["completing:C61:mainConclusion"])+
  '</section>'+
  '<section class="conclusion-writing-part" data-conclusion-part="meaning">'+
   '<div class="conclusion-part-title"><span class="conclusion-part-number">2</span><div>'+
     '<h3>What does that answer mean, and where does it apply?</h3>'+
     '<p>Explain the significance for your original question or purpose. Include only the assumptions, uncertainty or domain restrictions that change the conclusion.</p></div>'+stuckBubble("part:meaning")+'</div>'+
   criterionMarkedWritingBox(F("conclusionBenefit","My interpretation and the important limits",
    "What can I responsibly conclude, and what does the mathematics NOT establish?",
    {type:"textarea",rows:5}),["completing:C60:meaningAndLimits"])+
   '<p class="conclusion-specific-tip">'+icon("lightbulb")+
    ' <strong>Mathematical reminder:</strong> '+e(mathematicalTip(state))+'</p>'+
  '</section>'+
  '<section class="conclusion-writing-part conclusion-potential" data-conclusion-part="next">'+
   '<div class="conclusion-part-title"><span class="conclusion-part-number">3</span><div>'+
    '<h3>Potential next steps</h3><span class="conclusion-part-optional">OPTIONAL</span>'+
    '<p>Is there one or two worthwhile mathematical questions that your findings leave open? Say what you would investigate and why it could help. No speculative extension is required.</p></div>'+stuckBubble("part:next")+'</div>'+
   criteriaField(F("conclusionExtension","A worthwhile future mathematical question (if any)",
    "My result raises the question of … . Investigating this could …",
    {type:"textarea",rows:3}),"completing:C63:extension")+
   potentialQuestions(state,e,icon)+
  '</section>'+
  previous+
  '<section class="conclusion-downloads" aria-label="Download your project">'+
   '<h3>Keep a copy of your investigation</h3>'+
   '<p>Download your actual saved work, figures and planning. The full report is a working record, not your finished IA.</p>'+
   '<div class="conclusion-download-actions">'+
    '<button type="button" class="btn btn-primary" data-action="export-full-pdf">'+icon("download")+' Download full project PDF</button>'+
    '<button type="button" class="btn btn-secondary" data-action="export-full-docx">'+icon("download")+' Editable full project Word</button>'+
    '<button type="button" class="btn btn-secondary" data-action="export-plan-pdf">'+icon("download")+' Planning PDF</button>'+
    '<button type="button" class="btn btn-quiet" data-action="open-files">'+icon("archive")+' All downloads and backup</button>'+
   '</div></section>'+
  '<nav class="conclusion-workspace-actions" aria-label="Continue from your conclusion">'+
   '<button type="button" class="btn btn-secondary" data-action="completion-open" data-node="C04">'+
    icon("layers")+' My stages</button>'+
   '<button type="button" class="btn btn-secondary" data-action="completion-mark" data-stage="C60" data-status="complete">'+
    icon("check-circle")+' Mark conclusion ready for now</button>'+
   '<button type="button" class="btn btn-primary" data-action="go-checking">'+
    'Continue to Checking '+icon("arrow-right")+'</button>'+
  '</nav>'+
 '</div>';
}
