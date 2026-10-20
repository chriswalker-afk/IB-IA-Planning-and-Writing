/** One source of stage-specific writing craft for the CURRENT Mathematics IA.
 * Writing advice is separate from criterion bubbles and from mathematical evidence.
 * A planned route cannot be treated as a finding; only saved real results can drive
 * outcome-specific prompts. No student's words are inserted in an IA document.
 */
import {FIELD_GUIDE_TIPS,FIELD_GUIDE_CONTEXT} from "./writer-field-guide.js";
 import {actualMathematics,selectedInvestigativeRoute,selectedJourneyOutcome,stageLinkContext} from "./adaptive-journey.js";

const byId=new Map(FIELD_GUIDE_TIPS.map(t=>[t.id,t]));
const SOURCE_NODES=new Set(["C20","C21S","C21M","C21T","C22","C23","C24","C25","C26"]);
const FIRST_NODES=new Set(["C30","C31","C32","C33","C34","C34A","C34B","C34U","C35","C35H","C35B","C35P"]);
const LATER_NODES=new Set(["C40","C50","C40T","C40D","C40L"]);
const CONCLUSION_NODES=new Set(["C60","C61","C62","C63","C64"]);
const RESULT_NODES=new Set(["C34","C34A","C34B","C34U","C35","C35H","C35B","C35P"]);
const limited=(value,n=175)=>typeof value==="string"?(value.trim().length>n?value.trim().slice(0,n-1).trimEnd()+"…":value.trim()):"";
const titleOf=(state,node)=>({
 C10:"Your introduction",C20:"Introducing the first mathematics",
 C30:"First mathematical exploration",C40:"Your next mathematical stage",
 C50:"Further mathematical exploration",C60:"Your conclusion",
 C70:"Mathematical communication",C80:"Draft review",C90:"Final review"
}[node]||"Your current writing step");
const CUES=Object.freeze({
 C10:"Let the reader see a genuine reason for your aim and the mathematical question you are asking, without inventing a story.",
 C20:"Justify this opening mathematical choice rather than announcing every technique you might use.",
 C21S:"Name what the sample can represent and any meaningful restriction on the inference.",
 C21M:"Make the assumptions and valid domain of the model visible before relying on its outputs.",
 C21T:"Define the objects and conditions clearly; examples may support a conjecture but cannot replace proof.",
 C22:"Make the mathematical purpose of the method visible to the reader.",
 C23:"Connect the limitation to a specific mathematical claim, not a generic practical difficulty.",
 C24:"Identify where the precision, source or technology actually affects your mathematics.",
 C25:"Define only what your mathematical reader genuinely needs to follow the next step.",
 C26:"Connect this evidence and method to your aim once, without repeating a bridge already made.",
 C30:"Introduce one useful representation or calculation, then use its actual outcome to decide what follows.",
 C31:"Present labelled, readable mathematical evidence; a figure or table must support a question.",
 C32:"Prepare the reader for the mathematics with its purpose, not a tutorial about routine methods.",
 C33:"Include enough working or a clear representation for a mathematical reader to check your reasoning.",
 C34:"Interpret what your actual mathematics establishes and where its conclusion stops.",
 C34A:"Only discuss accuracy if it could change how your result should be understood.",
 C34B:"Compare your actual finding with an earlier expectation without claiming that the expectation was evidence.",
 C34U:"Explain a genuine surprise and why it changed your mathematical thinking; never invent a setback.",
 C35:"Make the next question arise from a result you really found, or conclude if your aim is answered.",
 C35H:"Explain which gap in the existing mathematics would make the suggested technique useful.",
 C35B:"Read the real shape first; a scatter diagram does not automatically justify a straight line or Pearson's r.",
 C35P:"Describe linear association responsibly; correlation is not causation and says nothing conclusive about a curved pattern.",
 C40:"Make the reason for this mathematical stage explicit, showing how it follows from the investigation so far.",
 C50:"Show why this further mathematics adds something worthwhile rather than lengthening the IA.",
 C40T:"State the meaningful inputs, mathematical operation and output of technology rather than just naming software.",
 C40D:"Justify a method for the question and evidence, not merely for its sophistication.",
 C40L:"Explain unfamiliar mathematics clearly; spare the reader a tutorial of routine course procedures.",
 C60:"Answer the original aim using real findings, explain what they mean and discuss meaningful next steps if relevant.",
 C61:"Use the most decisive mathematical results to support the answer; do not repeat the calculations.",
 C62:"Explain what the mathematical conclusion really tells you about your original purpose.",
 C63:"A next step is worthwhile only if a genuine finding leaves an interesting mathematical question.",
 C64:"Cut repeated calculations and generic future-work claims; keep the mathematical answer and essential qualifications.",
 C70:"Review the real document for clear figures, notation, equations and mathematical flow.",
 C70N:"Repair unclear notation, rounding, units and diagrams where they occur in your IA.",
 C80:"Prioritise meaningful, permitted revision in the actual draft.",
 C80D:"Check your draft's mathematical writing, not only the presence of sections.",
 C90:"Keep the final IA concise, accurate, attributed and authentically your own."
});
function chooseTip(state,node){
 let id=FIELD_GUIDE_CONTEXT[node]||"";
 const p=state?.planning?.fields||{},c=state?.completion||{},entry=state?.entries?.[c.activeEntryIndex];
 const first=c.fields?.firstType||"";
 if(node==="C20"||node==="C21T"){
  if(p.kind==="theoretical"||p.dataSource==="theoretical"||node==="C21T")id="purpose";
 }
 if(["C30","C31","C33"].includes(node)){
  if(p.kind==="theoretical"||["theory","calculation","proof"].includes(first))id=node==="C33"?"audience":"thinking";
  else if(first||node==="C31")id="graphs";
 }
 if(LATER_NODES.has(node)&&entry?.phase==="substantial"){
  if(["C40","C50"].includes(node)){
   const link=stageLinkContext(state,entry);
   if(link.needsReview)id="imperfect";
   else if(link.advice?.status==="ready")id="why-now";
   else if(entry.methodId==="proof")id="thinking";
  }
 }
 return byId.get(id)||null;
}
export function writingGuideRecommendation(state,node,requestedTip=""){
 if(!node||!CUES[node])return null;
 const tip=(requestedTip&&byId.get(requestedTip))||chooseTip(state,node);
 if(!tip)return null;
 const entry=state?.entries?.[state?.completion?.activeEntryIndex];
 let note="",question="";
 if(SOURCE_NODES.has(node)){
  const kind=state?.planning?.fields?.kind||state?.project?.kind||"";
  const route=selectedInvestigativeRoute(state);
  const compatible=route&&(!kind||kind==="unsure"||route.kinds?.includes(kind));
  if(compatible)note="Your planned investigative route: "+limited(route.title,100)+". Treat this as a possible starting point, not a finding.";
  else if(kind==="theoretical")note="Your starting material is theoretical; there is no need to invent data or observations.";
 }else if(LATER_NODES.has(node)&&entry?.phase==="substantial"){
  const link=stageLinkContext(state,entry);
  if(link.needsReview)note="An earlier mathematical result has changed. Check this connection before describing it as established.";
  else if(link.prior&&actualMathematics(link.prior)){
   note="Earlier recorded finding: "+limited(link.finding||link.prior.result);
   if(link.advice?.status==="ready"&&link.advice.chosen){
    question="Your selected follow-up: "+limited(link.advice.chosen.question,145);
   }
  }
  if(!note&&entry?.title)note="Your current mathematical stage: "+limited(entry.title,100)+". Check that the reason for choosing it is genuine.";
 }else if(FIRST_NODES.has(node)&&RESULT_NODES.has(node)&&entry&&actualMathematics(entry)){
  const choice=selectedJourneyOutcome(state,entry);
  note="Your recorded result: "+limited(entry.localTakeaway||entry.interpretation||entry.observationText||entry.result);
  if(choice)question="The outcome you selected: "+limited(choice.title,100)+". "+limited(choice.question,145);
 }else if(CONCLUSION_NODES.has(node)){
  const completed=(state?.entries||[]).filter(actualMathematics);
  if(completed.length){
   const latest=completed[completed.length-1];
   note="Use your "+completed.length+" recorded mathematical stage"+(completed.length===1?"":"s")+" as evidence; do not turn a planned prediction into a finding.";
   if(latest.localTakeaway||latest.interpretation)question="A saved finding to consider: "+limited(latest.localTakeaway||latest.interpretation,155);
  }
 }
 return {tip,node,stage:titleOf(state,node),cue:CUES[node],note,question};
}
/** ONE compact contextual entrance per writing stage; the global header is the universal entrance. */
export function renderWriterGuideAccess(state,node,icon,e){
 const rec=writingGuideRecommendation(state,node);
 if(!rec)return "";
 return '<button type="button" class="writer-guide-context-badge" data-action="writer-guide-open" data-guide-node="'+e(node)+
  '" data-guide-tip="'+e(rec.tip.id)+'" aria-label="Open relevant Writing Guide example: '+e(rec.tip.title)+'" title="'+e(rec.tip.title)+'">'+
  '<span class="writer-guide-context-badge-icon">'+icon("book")+'</span>'+
  '<span>Field Guide example</span>'+icon("arrow-up-right")+'</button>';
}
