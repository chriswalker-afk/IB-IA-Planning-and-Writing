/**
 * Pass 3 — the mathematical reasoning thread.
 * The student's original mathematical entries (and the legacy first-stage
 * follow-up fields) remain the only source of truth. No text is generated as
 * an IA paragraph and no 'sufficient mathematics' verdict is inferred.
 */
import {adaptiveNextDirections,journeySelectionIsStale,journeySourceSignature} from "./adaptive-journey.js";
import {resultInterpretationGuidance} from "./result-interpretation.js";
import {escapeHtml,icon as defaultIcon} from "../ui/primitives.js";

const has=x=>typeof x==="string"&&!!x.trim();
const value=x=>typeof x==="string"?x.trim():"";
const confirmed=x=>x?.status==="completed"&&has(x.result);
const short=(x,n=240)=>{const s=value(x);return s.length>n?s.slice(0,n-1)+"…":s;};

/** Only use the shared first-mathematics notes if we can identify the source.
 * The explicit note on the entry always wins, including on older projects.
 */
export function recordedDecisionNotes(state,entry){
 if(!entry)return {question:"",reason:""};
 const c=state?.completion||{},entries=state?.entries||[];
 const first=entry.phase==="first"&&(
  entries[c.activeEntryIndex]?.id===entry.id||c.nextFromEntryId===entry.id||
  entries.filter(x=>x?.phase==="first").length===1
 );
 const question=value(entry.nextQuestion)||(first?value(c.fields?.nextQuestion):"");
 const reason=value(entry.nextWhy)||(first?value(c.fields?.nextReason):"");
 return {question,reason};
}

export function mathematicalReasoningThread(state,entry){
 if(!confirmed(entry))return null;
 const entries=state?.entries||[],notes=recordedDecisionNotes(state,entry);
 const children=entries.filter(x=>x?.fromEntryId===entry.id);
 const actual=children.filter(confirmed);
 const flagged=entry.reviewNeeded==="yes"||journeySelectionIsStale(state,entry);
 const interpretation=value(entry.localTakeaway||entry.interpretation||entry.observationText);
 const finding=interpretation||value(entry.result);
 const hasInterpretation=!!interpretation;
 const guide=resultInterpretationGuidance(state,entry);
 const adaptive=adaptiveNextDirections(state,entry);
 const reasonStatus=flagged?"review":notes.question&&notes.reason?"linked":
  notes.question?"reason-needed":notes.reason?"question-needed":"choose";
 const aim=value(state?.planning?.fields?.aim||state?.project?.aim);
 const selected=adaptive.status==="ready"?adaptive.directions.find(x=>x.id===entry.journeyDirection):null;
 const relevantCheck=adaptive.status==="ready"?
  value(adaptive.chosen?.check||selected?.check):
  value(guide?.check);
 return {
  entryId:value(entry.id),title:value(entry.title),aim,
  finding,hasInterpretation,output:value(entry.result),
  question:notes.question,reason:notes.reason,status:reasonStatus,flagged,
  suggested:adaptive.status==="ready"?value(selected?.question||adaptive.directions[0]?.question):"",
  check:relevantCheck,
  children:children.map(x=>({id:value(x.id),title:value(x.title),confirmed:confirmed(x),
   review:x.reviewNeeded==="yes",purpose:value(x.purpose||x.bridge),
   stale:has(x.journeySourceSignature)&&x.journeySourceSignature!==journeySourceSignature(state,entry)})),
  confirmedChildren:actual.length
 };
}

/** Read-only checklist beside existing next-question/justification fields.
 * 'Continue' is never decided by a model and 'Conclude' stays a valid option.
 */
export function renderMathematicalDecisionThread(state,entry,{icon=defaultIcon,e=escapeHtml,reduced=false}={}){
 const thread=mathematicalReasoningThread(state,entry);
 if(!thread)return"";
 const status=thread.flagged?"Earlier mathematics needs review":
  thread.status==="linked"?"Question and reason recorded":
  thread.status==="reason-needed"?"Question saved · explain why it helps":
  thread.status==="question-needed"?"Reason saved · clarify the question":
  "Choose whether more mathematics would help";
 const snippet=(label,text,placeholder)=>'<div class="reasoning-thread-part"><strong>'+e(label)+'</strong>'+
  (text?'<p>'+e(short(text,500))+'</p>':'<p class="reasoning-thread-empty">'+e(placeholder)+'</p>')+'</div>';
 const suggested=thread.suggested&&!thread.question?
  '<p class="reasoning-thread-suggestion"><strong>One possibility, not a decision:</strong> '+e(thread.suggested)+'</p>':"";
 return '<section class="math-reasoning-thread'+(reduced?' is-reduced':'')+
  '" data-reasoning-thread="'+e(thread.entryId)+'" data-reasoning-status="'+e(thread.status)+'">'+
  '<details class="math-reasoning-disclosure"><summary>'+icon("git-branch")+
   '<span><strong>Connect my finding to my next decision</strong><small>'+e(status)+'</small></span>'+
   icon("chevron-right")+'</summary><div class="math-reasoning-body">'+
  (thread.flagged?'<p class="reasoning-thread-review" role="note">This mathematical record or its chosen outcome needs review. Recheck it before using it to justify another calculation or a final claim.</p>':'')+
  (thread.aim?'<p class="reasoning-thread-aim"><strong>My investigation question:</strong> '+e(short(thread.aim,340))+'</p>':'')+
  '<div class="reasoning-thread-parts">'+
   snippet('1 · What I have established'+(thread.hasInterpretation?'':' (recorded output only)'),
    thread.finding,'Record and interpret your actual mathematics before deciding.')+
   snippet('2 · The mathematical question left open',thread.question,
    'What does the finding not yet settle? A question is optional if a qualified conclusion is enough.')+
   snippet('3 · Why the next mathematics would resolve that gap',thread.reason,
    'Explain the missing evidence or argument and why your chosen mathematics would address it — not just that it is another technique.')+
  '</div>'+suggested+
  (thread.check?'<p class="reasoning-thread-check"><strong>Mathematical validity check to consider:</strong> '+e(thread.check)+'</p>':'')+
  '<div class="reasoning-thread-choices"><div><strong>'+icon("arrow-right")+' Continue investigating</strong>'+
   '<p>Only if a specific unanswered question matters for your aim. Write the question and your own mathematical reason in the fields below.</p></div>'+
   '<div><strong>'+icon("flag")+' Conclude responsibly</strong>'+
   '<p>If the available evidence answers your aim within clearly stated conditions, an honest conclusion is valid. An unresolved point can instead become a limitation or optional extension.</p></div></div>'+
  (thread.children.length?'<p class="reasoning-thread-linked"><strong>Linked later work:</strong> '+
   thread.children.map(c=>e(c.title||'Mathematical stage')+
    (c.review||c.stale?' (needs link review)':c.confirmed?' (result recorded)':' (planned)')).join(' · ')+
   '. Check whether each later result actually answers the question; creating a stage does not establish its answer.</p>':'')+
  '<p class="reasoning-thread-honesty">These are your own notes and mathematical checks, not a verified interpretation or text inserted into your IA.</p>'+
  '</div></details></section>';
}

/** In an existing later-stage provenance card, privilege the student's actual
 * recorded question/reason over a generic suggested mathematical direction.
 */
export function renderPriorDecisionLink(state,entry,{icon=defaultIcon,e=escapeHtml}={}){
 const prior=state?.entries?.find(x=>x?.id===entry?.fromEntryId);
 if(!prior)return"";
 const thread=mathematicalReasoningThread(state,prior);
 if(!thread)return '<p class="reasoning-prior-review">The source mathematical stage is no longer a confirmed result. Review this link before relying on it.</p>';
 const sourceStale=has(entry.journeySourceSignature)&&
  entry.journeySourceSignature!==journeySourceSignature(state,prior);
 const warning=thread.flagged||entry.reviewNeeded==="yes"||sourceStale;
 const parts=[thread.question?'<p><strong>Question raised by that result:</strong> '+e(thread.question)+'</p>':'',
  thread.reason?'<p><strong>My mathematical reason:</strong> '+e(thread.reason)+'</p>':'',
  has(entry.purpose)&&entry.purpose!==thread.reason?
   '<p><strong>My purpose for this stage:</strong> '+e(entry.purpose)+'</p>':''].filter(Boolean);
 if(!parts.length&&!warning)return"";
 return '<div class="reasoning-prior-link" data-prior-reasoning="'+e(prior.id)+'" data-reasoning-link-review="'+warning+'">'+
  '<strong>'+icon("git-branch")+' My reasoning from the earlier result</strong>'+
  (parts.length?parts.join(""):'<p>Return to the earlier finding and explain what question this stage should resolve.</p>')+
  (warning?'<p class="reasoning-prior-review">A finding or mathematical decision changed. Recheck whether this next method still addresses the original question; existing writing is preserved.</p>':'')+
  '<small>This is your own recorded connection, not proof that this new stage answered the question.</small></div>';
}

/** Entering a conclusion is a valid path without an extra mathematical stage.
 * A saved open question must not be silently treated as solved or mandatory.
 */
export function renderConclusionReasoningThread(state,{icon=defaultIcon,e=escapeHtml,reduced=false}={}){
 const results=(state?.entries||[]).filter(confirmed);
 if(!results.length)return"";
 const safe=results.filter(x=>x.reviewNeeded!=="yes");
 // Never echo a flagged recent result as if it were the last usable finding.
 const last=safe.at(-1)||results.at(-1);
 const t=mathematicalReasoningThread(state,last);
 const open=!!t?.question,flagged=results.length-safe.length;
 const eligible=safe.length;
 const summary=open?'An earlier question may remain open — that can be acknowledged':'Decide what your confirmed findings justify';
 return '<section class="conclusion-reasoning'+(reduced?' is-reduced':'')+
  '" data-conclusion-reasoning="'+e(t.entryId)+'">'+
  '<details><summary>'+icon("git-branch")+' <span><strong>Does my mathematics answer the aim?</strong>'+
   '<small>'+e(summary)+'</small></span>'+icon("chevron-right")+'</summary>'+
  '<div class="conclusion-reasoning-body">'+
   (t.aim?'<p><strong>Investigation aim:</strong> '+e(short(t.aim,400))+'</p>':'')+
   (eligible?'<p><strong>Most recent recorded mathematical result:</strong> '+e(short(t.finding,500))+'</p>':
    '<p>There are no review-free confirmed findings. Do not present flagged mathematics as settled evidence.</p>')+
   (open?'<p><strong>Previously recorded unanswered question:</strong> '+e(t.question)+'</p>':'')+
   (t.reason?'<p><strong>Why another step might help:</strong> '+e(t.reason)+'</p>':'')+
   (flagged?'<p class="reasoning-prior-review">'+flagged+' mathematical record'+(flagged===1?'':'s')+
    ' need review before supporting the final claim.</p>':'')+
   '<div class="reasoning-conclusion-questions"><strong>Before deciding that more mathematics is unnecessary, ask:</strong>'+
    '<ul><li>Which genuine result answers the stated aim, and over what domain or assumptions?</li>'+
    '<li>Have I checked the mathematical condition most likely to change that answer?</li>'+
    '<li>Would another calculation genuinely alter the conclusion, or merely add length?</li>'+
    '<li>If a question remains open, can I state an appropriately qualified conclusion instead?</li></ul></div>'+
   '<p>You can write a justified, partial or uncertain conclusion. Your saved question is an optional future extension, not evidence that further work was carried out.</p>'+
  '</div></details></section>';
}
