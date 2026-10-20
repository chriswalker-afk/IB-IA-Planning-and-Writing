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
   if(link.needsReview)id="thinking";
   else if(link.advice?.status==="ready")id="why-now";
   else if(entry.methodId==="proof")id="thinking";
  }
 }
 return byId.get(id)||null;
}
/** Deliberately selective: a writing box gets one writing-craft bubble only
 * when the student can use a specific existing Field Guide example there.
 * Multiple criteria may be shown on the same field; one guide icon is enough.
 * This is CURRENT-IA writing advice, not a criterion or a mark predictor.
 */
const box=(tip,label,cue)=>Object.freeze({tip,label,cue});
const FIELD_FOCUS={
 "completing:C10:aim":box("voice","Introduction and motivation","Explain your genuine reason for exploring this question, and make your own mathematical decisions visible without fabricating a personal story."),
 "completing:C20:methodIntroduction":box("thinking","Introducing your mathematical method","Name the first mathematical idea and why it helps answer your aim; avoid a tutorial of familiar course techniques."),
 "completing:C20:methodEvaluation":box("boundaries","Evaluating your opening method","Identify a mathematical assumption or restriction and a reasonable alternative. Before doing the work, describe limitations as possibilities, not discoveries."),
 "completing:C20:firstPurpose":box("purpose","First mathematical question","Make the purpose of your opening representation or calculation explicit before you present it."),
 "completing:C21S:samplingRationale":box("sources","Sampling and evidence","Explain which population and comparison your actual data can support; planning a sample is not evidence that it was collected."),
 "completing:C21S:responseBias":box("boundaries","Sample limitations","Explain how a particular selection or response issue could affect an inference, rather than listing generic human errors."),
 "completing:C21M:modelAssumptions":box("lab","Mathematical model assumptions","Explain which simplifications are mathematical and why they might matter for your aim."),
 "completing:C21M:modelDomain":box("boundaries","Model domain","State the conditions and input range in which your model can reasonably be used."),
 "completing:C21T:theoreticalObject":box("thinking","Theoretical starting point","Define the object, conjecture or structure precisely. A few examples do not automatically establish a general claim."),
 "completing:C22:methodReason":box("purpose","Why this method?","Explain the question the chosen method answers; difficulty alone does not make it appropriate."),
 "completing:C23:limitationConsequence":box("boundaries","Consequences of a limitation","Explain how the limitation changes the mathematical interpretation or strength of the conclusion."),
 "completing:C24:accuracyReason":box("sources","Defensible precision","Justify approximation or precision from the measurements, inputs or sensitivity of the mathematics."),
 "completing:C25:variableDefinitions":box("audience","Definitions and mathematical notation","Define significant variables and units, but do not reteach routine syllabus mathematics."),
 "completing:C26:dataAimLink":box("why-now","Linking back to your aim","Explain once why this mathematical starting point advances your aim; avoid repeating your introduction."),
 "completing:C30:introduceA":box("purpose","Introducing the first figure or calculation","Prepare your reader for what this particular mathematical work will reveal, not just the method you planned."),
 "completing:C30:result":box("graphs","Showing your first genuine mathematics","Present a clear, labelled representation or sufficient working for a reader to check your mathematical claim."),
 "completing:C30:reflectD":box("react","Interpreting the first finding","React to what your real result shows about the aim; only compare it with an earlier prediction if one was recorded."),
 "completing:C30:nextD":box("why-now","Explaining what follows","Connect the next mathematical question to a verified finding, or explain why it is sensible to conclude now."),
 "completing:C31:firstPurpose":box("graphs","Purposeful diagram or table","Every figure or table should answer a specific question, with readable scales, titles, labels and units where appropriate."),
 "completing:C32:purpose":box("purpose","Before the first mathematical output","Give the reader a mathematical reason to look at the calculation or figure."),
 "completing:C33:title":box("audience","Showing enough mathematical working","Include definitions, significant working and clear presentation without repeating routine calculations."),
 "completing:C34:observation":box("react","Describing the observed result","Distinguish what is mathematically established from what you merely expected."),
 "completing:C34A:accuracyForResult":box("boundaries","Accuracy and reliability","Explain how significant uncertainty could change the mathematical result or interpretation."),
 "completing:C34B:title":box("react","Interpreting your mathematical result","Explain the result's meaning in relation to your aim, not just a value or diagram description."),
 "completing:C34U:surpriseCheck":box("imperfect","Checking an unexpected finding","Let a genuine surprise prompt a mathematical check, never a manufactured setback."),
 "completing:C35:nextQuestion":box("why-now","The next mathematical question","Make the question follow from the actual result, without adding an unnecessary stage just for complexity."),
 "completing:C35:nextReason":box("thinking","Justifying a next technique","Explain what further mathematical insight the proposed technique can reasonably provide."),
 "completing:C35H:nextReason":box("why-now","Choosing a worthwhile next step","Select a new approach only if a real finding has raised a question it can address."),
 "completing:C35B:scatterPattern":box("react","Reading the scatter pattern","Describe the actual shape before deciding whether a linear measure or model is justified."),
 "completing:C35P:title":box("react","Interpreting correlation","Describe the observed direction and strength of linear association, avoiding causal claims."),
 "completing:C40T:technologyInterpretation":box("audience","Explaining technology-supported mathematics","Communicate meaningful input, output and mathematical reasoning rather than describing clicks or pasting a screenshot."),
 "completing:C40D:courseWhy":box("purpose","Why the chosen method fits","Justify why the mathematics answers your question, not its relative sophistication."),
 "completing:C40L:researchedUnderstanding":box("audience","Explaining unfamiliar mathematics","Explain independently learned reasoning enough for a reader to follow, while keeping familiar procedures concise."),
 "completing:C61:mainConclusion":box("story","Your strongest mathematical answer","Answer the original aim using the key results you genuinely established."),
 "completing:C62:benefit":box("react","Meaning of your answer","Explain what the answer means for the original question without exceeding what the mathematics shows."),
 "completing:C63:extension":box("why-now","Potential next steps","Suggest a worthwhile mathematical follow-up only if your findings leave a meaningful question open."),
 "completing:C64:title":box("edit","Keeping the conclusion concise","Keep the central mathematical answer and its essential qualifications; cut repeated calculations and generic future work."),
 "completing:C60:meaningAndLimits":box("boundaries","Meaning and limits of the conclusion","State what the mathematics can and cannot establish, including only limitations that materially change your answer."),
 "completing:C70:presentationIssue":box("graphs","Presentation and readability","Repair titles, figure labels, notation and mathematical flow where they originally appear in the IA."),
 "completing:C70N:notationIssue":box("audience","Clear mathematical notation","Make symbols, equalities, units and approximations consistent without adding a tutorial."),
 "completing:C80:feedbackAction":box("edit","Your next drafting action","Choose a specific revision that improves the real mathematics or communication, within your school's feedback rules."),
 "completing:C80D:feedbackAction":box("edit","Turning feedback into revision","Explain what you will improve in the actual IA and how you will check that the revision works."),
 "completing:C90:finalRequirements":box("edit","Final writing check","Review concise mathematical communication, authentic reasoning and necessary attribution before submission.")
};
for(const stage of ["C40","C50"]){
 const key=suffix=>"completing:"+stage+":"+suffix;
 FIELD_FOCUS[key("bridgeA")]=box("why-now","Connecting mathematical stages","Explain what the previous confirmed result raises and why a new mathematical question is justified.");
 FIELD_FOCUS[key("resultB")]=box("audience","Presenting this mathematical stage","Present genuine calculations, proof or diagrams clearly enough to verify the mathematical reasoning.");
 FIELD_FOCUS[key("interpretD")]=box("react","Interpreting this stage","Explain what this result establishes for your aim and where its mathematical limitations lie.");
 FIELD_FOCUS[key("nextD")]=box("why-now","Deciding what follows","Choose the next mathematical step because of a genuine result, or conclude if your aim has been answered.");
}
export const FIELD_GUIDE_FIELD_SPOTS=Object.freeze(FIELD_FOCUS);
export function writerGuideFieldBubble(state,node,keys,icon,e){
 const choices=Array.isArray(keys)?keys:[keys];
 const key=choices.find(k=>Object.hasOwn(FIELD_GUIDE_FIELD_SPOTS,k));
 if(!key||!state||!icon||!e)return "";
 const focus=FIELD_GUIDE_FIELD_SPOTS[key];
 let tipId=focus.tip;
 if(key==="completing:C30:result"){
  const format=state?.completion?.fields?.firstType||"";
  if(["calculation","theory"].includes(format)||state?.planning?.fields?.kind==="theoretical")tipId="audience";
 }
 if(!byId.has(tipId))return "";
 return '<button type="button" class="writer-guide-field-bubble" data-action="writer-guide-open" data-guide-tip="'+e(tipId)+
  '" data-guide-spot="'+e(key)+'" aria-label="Writer’s Field Guide: '+e(focus.label)+'. Open a writing example." title="Writer’s Field Guide · '+e(focus.label)+'">'+icon("book")+'</button>';
}
export function writingGuideRecommendation(state,node,requestedTip="",spotKey=""){
 if(!node||!CUES[node])return null;
 const tip=(requestedTip&&byId.get(requestedTip))||chooseTip(state,node);
 if(!tip)return null;
 const focus=Object.hasOwn(FIELD_GUIDE_FIELD_SPOTS,spotKey)?FIELD_GUIDE_FIELD_SPOTS[spotKey]:null;
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
  if(link.needsReview)note=entry.reviewNeeded==="yes"?
    "The earlier stage was revised. Review your existing mathematical connection before treating it as established.":
    link.prior&&!actualMathematics(link.prior)?
    "The previous stage does not yet contain a completed result. Do not present a planned mathematical step as a finding.":
    "The link to the earlier result still needs review or a confirmed follow-up outcome. Do not describe it as a verified next step yet.";
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
 return {tip,node,stage:focus?.label||titleOf(state,node),cue:focus?.cue||CUES[node],note,question,spotKey:focus?spotKey:""};
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
