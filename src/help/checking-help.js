/**
 * Pass 4: student-selectable repair for a REAL Checking obstacle.
 * No document reading, source verification, assessment score or teacher
 * approval is implied by a Pathfinder note or a checked status.
 */
import {citationAuditPointers} from "../checking/reference-audit.js";
const row=(id,label,question,action,check,stop,fallback,boundary,extras={})=>
 Object.freeze({id,label,question,action,check,stop,fallback,boundary,...extras});
export const CHECKING_RECOVERY_CARDS=Object.freeze([
 row("draft-incomplete","I cannot tell whether my teacher draft is ready",
  "Does the actual draft include performed mathematics, its interpretation and a provisional answer to the aim?",
  "Open the real IA document and locate one completed calculation, its interpretation and the conclusion. List only the missing sections.",
  "Can you identify where each part appears, or one precise item still to finish?",
  "A short, honest list of draft dependencies.",
  "Check your school's permitted feedback stage and ask what level of completion is required.",
  "A project plan and Pathfinder notes do not themselves constitute a completed teacher draft."),
 row("narrative-gap","My mathematical story has an unexplained jump",
  "Which actual result is the later calculation supposed to build on?",
  "Find that earlier result in the actual IA. State its mathematical finding, one unanswered property, and what the next calculation can establish.",
  "Would this new mathematics make sense without an invented bridge or repeated introduction?",
  "One checked dependency, or a stage to reconsider.",
  "Return to the mathematical stage and examine the actual calculations before polishing a paragraph.",
  "Do not invent a reason after the fact or repeat generic prose advice."),
 row("notation-check","I cannot find the important notation mistakes",
  "Can a reader reproduce one calculation using the defined symbols, quantities, and units?",
  "Choose one equation and follow every symbol back to its definition. Check exact versus rounded equality and all units or domain restrictions.",
  "Does substituting a genuine test value produce the stated result?",
  "One corrected equation, symbol or unit.",
  "Ask someone to check the single mathematical step you cannot verify.",
  "A clean layout does not guarantee correct mathematics."),
 row("personal-choice","I cannot show where my own decisions changed the mathematics",
  "Which genuine choice changed what you calculated, tested or concluded?",
  "Locate one real decision in the IA, such as a parameter restriction, variable selection, failed model or alternative. Compare the mathematical output with the other plausible choice.",
  "Does that decision have an identifiable mathematical consequence?",
  "One authentic mathematical decision and its effect.",
  "Do not manufacture a personal story; revise the explanation only once you identify a real choice.",
  "First-person language alone is not evidence of a genuine mathematical decision."),
 row("reflection-real","My reflection sounds general and is not tied to a result",
  "What actual value, pattern or proved condition led you to revisit your reasoning?",
  "Choose one genuine mathematical result and test what it does and does not establish. Compare a relevant assumption, alternative or limitation against that result.",
  "Could that check change your mathematical interpretation?",
  "One mathematically consequential reflection.",
  "If the finding is incomplete, return to the calculation rather than writing an imagined reflection.",
  "Do not turn a generic inconvenience into a mathematical limitation."),
 row("math-check","I do not know which calculation to verify first",
  "Which step would most affect the investigation answer if it were wrong?",
  "Select that equation or table cell. Recalculate one intermediate value independently with the original inputs, units and justified accuracy.",
  "Do you obtain the recorded result from the same actual inputs and assumptions?",
  "One verified computation or a precise mathematical discrepancy.",
  "Use a second method, small limiting case or teacher question only for the unresolved part.",
  "Pathfinder has not checked the mathematics in your external document."),
 row("pdf-legibility","My draft looks different when I export or print it",
  "Can you read a long equation, graph scale and figure reference at normal viewing size?",
  "Export the current draft PDF. Inspect one page with a long equation and one page containing a diagram or table at typical reading size.",
  "Are labels, symbols, page breaks and captions legible without zooming into a screenshot?",
  "One layout correction confirmed in the exported file.",
  "Fix the original file and export again instead of editing a PDF copy only.",
  "Do not assume formatting rules from an earlier cohort apply to your assessment year."),
 row("reader-confused","Another reader cannot follow one part of my argument",
  "Which single calculation or inference requires an unstated assumption?",
  "Ask them to point to the exact line where the reasoning stops being checkable. Trace the missing definition, intermediate step or mathematical dependency.",
  "Can they now follow the mathematics using the actual displayed working?",
  "One repaired mathematical link.",
  "If the mathematics is incorrect, correct it first; writing polish cannot fix that.",
  "A reader's confusion does not by itself identify an assessment mark."),
 row("mla-need","I cannot tell which sources in my IA need MLA citations",
  "Was an idea, dataset, image, unusual method or wording taken from outside your own work?",
  "Open the actual IA document and identify one borrowed item at its point of use. Find its original source, then decide whether a citation and a Works Cited entry are required.",
  "Can you trace that particular borrowed item to the genuine publication?",
  "One source correctly identified at the place it is used.",
  "Use the MLA guide for the correct source type and details; check other borrowed items separately.",
  "Absence of notes in Pathfinder does not prove the real IA contains no outside sources.",
  {targetCheck:"D09",resourceId:"mla-citations"}),
 row("mla-match","My in-text MLA references and Works Cited do not match",
  "Is the mismatch an uncited borrowed item, an incomplete entry or a source on the list that is never used?",
  "Choose one in-text citation and find its matching Works Cited entry. Then choose one Works Cited entry and locate where it was cited. Correct that pair, including author/organisation, title, date, URL and page-number placeholder if applicable.",
  "Can you navigate from text to source AND from source back to the actual passage?",
  "One verified two-way MLA citation pair.",
  "Inspect every other citation after updating the bibliography; Google Docs may retain uncited source entries.",
  "Pathfinder cannot inspect or validate citations inside your real Word or Google Docs document.",
  {targetCheck:"D09",resourceId:"mla-citations"}),
 row("mla-data-figure","My figure is my own, but the data or image came from someone else",
  "Who created the underlying dataset or original image?",
  "Open the figure in your actual IA and distinguish 'I made this graph' from 'I collected these data'. Credit the original publisher at the relevant point and check that its MLA entry matches.",
  "Can a reader find the original data or image without guessing its provenance?",
  "One accurately attributed figure and source.",
  "Check the original licensing or permission requirement separately where applicable.",
  "Creating the chart does not transfer authorship of the published dataset.",
  {targetCheck:"D09",resourceId:"mla-citations"}),
 row("mla-location","I have the original source but cannot make a usable MLA entry",
  "Is it a published dataset, article, web page, image or resource teaching a method?",
  "Open the source itself and record its author/organisation, actual title, publisher, date and stable URL or publication details. Use the MLA guide or your editor's citation tool to assemble one entry.",
  "Does the entry lead back to the exact material you actually used?",
  "One source entry matched to real source metadata.",
  "Leave genuinely missing details absent under MLA conventions; do not invent dates or authors.",
  "Do not copy citation-generator output without checking its underlying facts.",
  {targetCheck:"D09",resourceId:"mla-citations"}),
 row("format-current","I cannot decide which formatting rules apply",
  "What does the current school or assessment-cohort guidance actually require?",
  "Check the current teacher/school instructions for page count, identification, file format and submission rules. Compare one item against the exported file.",
  "Can you point to the current instruction, not a remembered former-cohort rule?",
  "One verified requirement or a precise school question.",
  "Keep the mathematical document legible while awaiting a format clarification.",
  "Do not treat earlier 2026 A–E advice as confirmed 2029 rules."),
 row("authorship-own","I cannot tell whether I have acknowledged outside help correctly",
  "Can you explain and reproduce the mathematical decisions as your own work?",
  "Choose one substantial mathematical step and explain how you produced it. Identify any external method, dataset, illustration or assistance used and check its required acknowledgement.",
  "Is the actual work attributable and are sources or assistance acknowledged under current rules?",
  "One verified ownership/acknowledgement decision.",
  "Check the school's current AI/assistance policy; ask your teacher if a type of help is permitted.",
  "A citation does not make otherwise prohibited assistance acceptable.",
  {targetCheck:"D12"}),
 row("feedback-meaning","I have teacher feedback but cannot turn it into a correction",
  "What exact mathematical claim, calculation or figure did the comment question?",
  "Choose one actual permitted comment. Locate the affected line or figure and decide what mathematical step or explanation to repair. Record a single specific change.",
  "Could you point to the revised place rather than merely ticking off a feedback note?",
  "One correction with an identifiable location in your IA.",
  "Ask what the comment refers to if unclear, within your school's feedback limits.",
  "Do not invent teacher comments, approval or a second written feedback round.",
  {targetCheck:"D13"}),
 row("feedback-no-comment","I have not received permitted written feedback",
  "Has the teacher issued written feedback, or do you only have verbal advice or a future opportunity?",
  "Check the current feedback arrangements. Continue your own self-review on one mathematical error without entering an imagined teacher comment.",
  "Is the actual feedback record honest about whether written or verbal advice exists?",
  "One safe self-check or a confirmed next permitted step.",
  "If needed, prepare one focused question for your teacher rather than requesting an unauthorised draft review.",
  "Not receiving written feedback is not teacher approval and must not be marked as received.",
  {targetCheck:"D13"}),
 row("feedback-verify","I made the change but cannot tell if it solved the problem",
  "Which actual error or mathematical misunderstanding was the revision intended to correct?",
  "Re-run one calculation, check the revised diagram against original data, or read the repaired inference in the real document. Record what was verified.",
  "Is the original issue corrected in the version you intend to submit?",
  "One verified revision, or a precise remaining difficulty.",
  "If checking reveals a new issue, leave the feedback action open rather than marking it verified.",
  "A tick in Pathfinder is a student record, not independent verification.",
  {targetCheck:"D15"}),
 row("submitted-version","I have edited my IA but do not know if the PDF is current",
  "Was the final PDF exported after the last mathematical or citation change?",
  "Export the latest file again. Search the PDF for one revision and one MLA citation that you know were changed.",
  "Do both changes appear in the actual file you intend to submit?",
  "One confirmed final-file version.",
  "Check the destination and filename using your school's instructions.",
  "A local Pathfinder backup is not a school submission."),
 row("submission-where","I cannot find the correct final submission instructions",
  "Have you seen a current instruction specifying where, how and when to submit?",
  "Check the latest school/teacher instructions and confirm the required format, exact location and deadline; record the unresolved question if any.",
  "Can you follow the verified instructions without guessing?",
  "One accurate submission action or teacher question.",
  "Keep a local project and final-file copy, but do not assume this website submits your IA.",
  "Pathfinder cannot submit, grade or confirm receipt of a real IA.")
]);
const byId=Object.fromEntries(CHECKING_RECOVERY_CARDS.map(x=>[x.id,x]));
export const CHECKING_RECOVERY_SPOTS=Object.freeze({
 D01:["draft-incomplete","pdf-legibility"],D02:["narrative-gap","reader-confused"],D03:["notation-check","math-check"],
 D04:["personal-choice","narrative-gap"],D05:["reflection-real","math-check"],D06:["math-check","narrative-gap"],
 D07:["pdf-legibility","notation-check"],D08:["reader-confused","narrative-gap"],
 D09:["mla-match","mla-need","mla-data-figure"],D10:["format-current","pdf-legibility"],
 D11:["math-check","draft-incomplete"],D12:["authorship-own","mla-need"],
 D13:["feedback-meaning","feedback-no-comment"],D14:["feedback-meaning","feedback-verify"],
 D15:["feedback-verify","submitted-version"],D16:["math-check","reflection-real"],
 D17:["submitted-version","pdf-legibility"],D18:["format-current","submission-where"],
 D19:["pdf-legibility","notation-check"],D20:["math-check","reader-confused"],D21:["submission-where","submitted-version"],
 feedback:["feedback-meaning","feedback-verify","feedback-no-comment"]
});
export const checkingCard=id=>Object.hasOwn(byId,id)?byId[id]:null;
export function checkingHelpFor(state,spot){
 if(state?.route!=="checking")return null;
 const mode=["draft","feedback","final"].includes(state.ui?.checkingMode)?state.ui.checkingMode:"draft";
 let node=spot==="feedback"?"feedback":String(spot).replace(/^check:/,"");
 if(!Object.hasOwn(CHECKING_RECOVERY_SPOTS,node))return null;
 const records=state.completion?.review?.records||{};
 let ids=[...CHECKING_RECOVERY_SPOTS[node]];
 const recorded=state.completion?.review?.feedbackItems||[];
 if(node==="D09"){
  // A list of saved source pointers is only a hint, never a verified audit.
  const pointers=citationAuditPointers(state);
  ids=pointers.length?["mla-match","mla-need","mla-data-figure"]:["mla-need","mla-match","mla-location"];
 }
 if(node==="D13"||node==="feedback")ids=recorded.length?
  ["feedback-meaning","feedback-verify","feedback-no-comment"]:
  ["feedback-no-comment","feedback-meaning","feedback-verify"];
 if(node==="D15"&&recorded.some(x=>x.status==="implemented"))ids=["feedback-verify","submitted-version"];
 const current=records[mode+"-"+node]?.status||"unchecked";
 const choice=ids.map(checkingCard).filter(Boolean).slice(0,3);
 if(!choice.length)return null;
 return Object.freeze({node,spot,mode,title:node==="feedback"?
  "Troubleshoot teacher feedback":"Unblock this document check",source:"Inspect your actual IA document — Pathfinder has not read it",
  status:current,choices:choice,selectedOutcome:"",route:"",course:""});
}
export function checkingHelpBadge(state,spot,e=x=>String(x)){
 const help=checkingHelpFor(state,spot);if(!help)return "";
 const key=help.node+":"+spot;
 return '<button type="button" class="stuck-help-badge" id="checking-stuck-'+e(state.ui?.checkingMode||"draft")+'-'+e(help.node)+'-'+e(spot==="feedback"?"feedback":"check")+'" data-checking-stuck="'+e(key)+
  '" aria-haspopup="dialog" aria-label="I am stuck: '+e(help.title)+'" '+
  'title="Get one precise, checkable way forward"><span aria-hidden="true">?</span></button>';
}
