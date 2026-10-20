/** Read-only, entry-scoped criterion guidance. Never infer results from plans. */
import {guidanceContext} from '../completing/guidance-context.js';
import {firstUnfamiliarUse,methodFamilies} from '../completing/method-identity.js';
import {linkedAccuracy} from '../completing/evidence-links.js';
import {CRITERIA,REVIEW_IDS} from './catalog.js';

const str=x=>typeof x==='string'?x.trim():'';
const short=x=>str(x).replace(/\s+/g,' ').slice(0,160);
const firstTypes={scatter:'a scatter graph',distribution:'a group or distribution comparison',
 diagram:'a mathematical diagram',table:'a numerical table',calculation:'a purposeful calculation',
 theory:'a mathematical example or conjecture',other:'another representation',
 unsure:'an undecided first representation'};
const needsReal=new Set(['C33','C34','C34B','C35','C35B','C35P','C40','C50','C40T','C40L']);

const closingNodes=new Set(['C60','C61','C62','C63','C64','C70','C80D','C90F']);
const REVIEW_FOCUS=Object.freeze({
 A:'Follow the coherent thread from aim to relevant mathematics and a concise conclusion.',
 B:'Check real notation, symbols, equations, diagrams, units and suitable accuracy.',
 C:'Find independent choices and mathematical questions that actually shaped the investigation.',
 D:'Find meaningful analysis of implications, limitations and next steps alongside results.',
 E:'Find relevant, correct, course-appropriate mathematics with understanding and justified reasoning.'
});
/** Conclusion/review advice can reference only genuinely marked completed records. */
export function closingBadgeGuidance(state,key,base){
 const node=key.split(':')[1],p=state.planning?.fields||{},f=state.completion?.fields||{};
 const all=Array.isArray(state.entries)?state.entries:[];
 const done=all.filter(x=>x?.status==='completed'&&str(x.result));
 const latest=done.at(-1);
 const result={...base,details:[],real:done.length>0,reviewRows:[],reviewMode:''};
 const add=(label,value)=>{if(short(value)&&result.details.length<3)result.details.push({label,text:short(value)});};
 add('Your recorded investigation aim',p.aim||state.project?.aim);
 if(node==='C60'||node==='C61'||node==='C62'||node==='C63'||node==='C64'){
  if(latest){
   add('Last mathematical finding marked completed',latest.localTakeaway||latest.result);
   if(latest.reviewNeeded==='yes')result.reminder='An earlier result has an outstanding review flag after a change. Recheck it before relying on the conclusion.';
  }else{
   result.why='A mathematical conclusion must be grounded in the actual IA. There are no mathematical results marked completed in this Pathfinder project yet.';
   result.strong='Check your actual IA document and record or revisit genuinely completed mathematics before stating what it establishes. An incomplete or inconclusive result must not be rewritten as success.';
   result.reminder='Pathfinder cannot verify calculations in an external IA document. No result is invented to fill this gap.';
  }
  if(node==='C60'){
   if(result.real&&(p.intendedUse||p.beneficiary))
    add('Original intended use (not evidence)',p.intendedUse||p.beneficiary);
   if(result.real&&p.kind==='theoretical')
    result.strong='Explain exactly what your proof or argument establishes, under which definitions and assumptions, and what remains unproved. Link this mathematical insight to your original aim without inventing a practical beneficiary or repeating earlier working.';
  }
  if(node==='C62'){
   if(p.beneficiary||p.intendedUse)add('Your original purpose (not evidence)',p.intendedUse||p.beneficiary);
   else result.strong=result.real?
    'Explain what the actual mathematics clarified about your original mathematical question, even if it has no external beneficiary. Keep claims within the scope of the evidence.':
    'Return to the actual investigation before interpreting its value. A theoretical IA does not need an invented outside beneficiary.';
  }
  if(node==='C63'&&result.real)
   result.reminder='A mathematical extension is optional. A sound conclusion can be the best stopping point even when more calculations are possible.';
  if(node==='C61'&&p.kind==='theoretical'&&result.real)
   result.strong='State what your argument genuinely proved, the domain and assumptions for which it holds, and any unresolved mathematical case. Tested examples must not be described as a general proof.';
  if(node==='C64'&&f.conclusionFocus)add('Your own earlier editing intention (not yet verified)',f.conclusionFocus);
 }else if(node==='C70'){
  if(f.presentationIssue)add('Your recorded presentation concern (not yet checked)',f.presentationIssue);
  if(f.referencesIssue)add('Your recorded source concern (not yet checked)',f.referencesIssue);
  result.reminder='This site has not inspected your Word/PDF file. Make and verify any corrections in the actual document.';
 }else if(node==='C80D'||node==='C90F'){
  const mode=node==='C80D'?'draft':'final',reviews=state.completion?.review?.records||{};
  result.reviewMode=mode;
  result.reviewRows=Object.keys(REVIEW_FOCUS).map(id=>{
   const rec=reviews[mode+'-'+REVIEW_IDS[id]]||{};
   return {id,title:CRITERIA[id].name,focus:REVIEW_FOCUS[id],
    location:short(rec.location)};
  });
  if(mode==='draft'&&f.draftComplete!=='ready'){
   result.reminder='The draft is not confirmed complete in this project. The review is still useful for planning repairs but is not teacher approval or an extra feedback opportunity.';
  }else if(mode==='final'){
   result.reminder='Review the actual final file. Earlier draft evidence pointers are not copied across as final evidence, and this site neither inspects nor submits the document.';
  }
  if(!done.length){
   result.strong='Locate evidence in your actual IA file for A–E, even if this site does not contain completed mathematical records. Do not infer that a blank Pathfinder record proves the document is incomplete, or invent evidence to fill it.';
  }
  if(state.completion?.review?.feedbackItems?.some(x=>x.status!=='verified')){
   add('Revision reminder','Some previously recorded feedback actions are not yet marked verified in Pathfinder. Check the actual revised document.');
  }
  const pending=all.filter(x=>x.reviewNeeded==='yes');
  if(pending.length)add('Review reminder','One or more mathematical records are flagged for rechecking after earlier edits; verify their consequences before finalising.');
 }
 return result;
}

export function contextualBadgeGuidance(state,key,base){
 const result={...base,details:[],real:false};
 const [route,node]=key.split(':');
 if(route!=='completing')return result;
 if(closingNodes.has(node))return closingBadgeGuidance(state,key,base);
 const ctx=guidanceContext(state,node),entry=ctx.entry,c=ctx.c||{},f=ctx.f||{},real=ctx.real===true;
 result.real=real;
 const add=(label,value)=>{if(short(value)&&result.details.length<3)result.details.push({label,text:short(value)});};
 add('Your current aim',ctx.aim);
 if(node==='C10'){
  const p=state.planning?.fields||{};
  add('Your saved motivation (a Planning note, not IA prose)',p.motivation||p.beneficiary||p.intendedUse||state.project?.beneficiary);
  result.reminder=base.reminder;
 }else if(node==='C31'){
  if(firstTypes[f.firstType])add('Proposed first representation',firstTypes[f.firstType]);
  if(ctx.theoretical)result.avoid='Avoid mistaking a few examples for proof. Define your mathematical objects, domain and conditions.';
 }else if(node==='C32'){
  if(entry?.title)add('Your active mathematical step',entry.title);
  if(!entry)result.strong='Choose an actual mathematical record first; then explain what it is intended to investigate before presenting the real calculation or figure.';
 }else if(node==='C33'){
  if(entry?.kind==='theory')result.strong='Define objects, domain and assumptions. Make your argument readable and justify its mathematical steps; a tested case is not a proof.';
  if(entry?.kind==='scatter')result.strong='Plot genuine paired values with clear axes, quantities, units and an appropriate scale. Keep the real graph readable in the IA document.';
 }else if(node==='C34'){
  if(ctx.theoretical)result.strong='Distinguish an example, conjecture and proof. Describe exactly what the actual reasoning established or what a counterexample disproved.';
  if(entry?.kind==='scatter')result.strong='Describe the observed shape, numerical features and genuine unusual points. Correlation does not establish causation.';
 }else if(node==='C35'){
  if(real){
   add('Selected previous genuine finding',entry?.localTakeaway||entry?.result);
   if(entry?.reviewNeeded==='yes')result.reminder='This result was flagged after an upstream change. Recheck it before basing a new step on it.';
  }else{
   result.why='Your next mathematical question should follow from a real mathematical observation, rather than an invented or merely planned result.';
   result.strong='Complete and check a genuine step first, then identify what it answered and whether a new mathematical question is necessary. Concluding is also valid.';
  }
  if(f.nextQuestion)add('Your proposed next question',f.nextQuestion);
 }else if(node==='C35B'){
  const pattern=str(ctx.selectedPattern),scatter=ctx.scatter;
  if(scatter?.status==='completed'&&str(scatter.result)){
   add('Your actual scatter finding',scatter.localTakeaway||scatter.result);
   if(['curved','turning','monotonic','periodic'].includes(pattern))
    result.strong='Your recorded scatter appears nonlinear. Explore its shape first; a straight-line model or Pearson r may not answer the question well.';
   else if(['linear','near-perfect','rough-linear'].includes(pattern))
    result.strong='The recorded scatter may be approximately linear. Check paired numerical variables, unusual points and the aim before interpreting Pearson r or fitting a line.';
   else if(pattern==='unclear')result.strong='No clear linear shape does not prove no relationship. Consider whether the data support a different question or a more appropriate description.';
  }else result.strong='Inspect a genuine paired-data scatter plot first. A suggested correlation or model is not itself evidence that the relationship exists.';
 }else if(node==='C35P'){
  if(real&&methodFamilies(entry).has('pmcc'))add('Your genuine Pearson result',entry?.result);
  else{
   result.why='This checkpoint is relevant only after calculating Pearson correlation for genuine paired numerical data.';
   result.strong='Check that Pearson r has actually been calculated. Interpret linear association alongside the scatter shape; consider whether any next model would help the aim.';
   result.reminder='A planned or unverified Pearson coefficient is not a finding.';
  }
 }else if(['C40','C50','C40T','C40L'].includes(node)){
  add('Current mathematical step',entry?.technique||entry?.title);
  if(['outside','mixed'].includes(entry?.knowledge)){
   if(!firstUnfamiliarUse(state,entry))result.strong='Use the already explained unfamiliar idea and refer back to its first introduction. Apply it correctly instead of repeating a generic tutorial.';
   else result.strong='Explain the precise unfamiliar component at first use, including definitions, conditions and one meaningful piece of your own working. Cite a source you actually used.';
   if(!str(entry?.researchSource))result.reminder='If you learned this mathematics from an external source, cite the source you actually consulted. Do not invent a reference.';
  }else if(entry?.knowledge==='syllabus'&&['C40','C50','C40L'].includes(node))
   result.strong='Use familiar course mathematics correctly and interpret why it helps the aim. There is no need to teach a routine syllabus method.';
  else if(entry?.knowledge==='unsure')
   result.reminder='Course status remains uncertain. Check the syllabus or consult your teacher before calling a technique beyond your course.';
  if(node==='C40T'){
   if(entry&&c.fields?.technologyForEntryId===entry.id)add('Tool used on this record',f.technologyTool);
   else result.reminder='Describe only technology applied to the selected mathematical record, not another calculation’s output.';
  }
 }
 if(real&&needsReal.has(node)&&!['C35','C35B','C35P'].includes(node)){
  add('Genuine result of this mathematical step',entry?.localTakeaway||entry?.result);
  const linked=linkedAccuracy(state,entry).filter(x=>str(x.policy));
  if(linked.length){
   add('Earlier precision rule linked to this result',
    linked.map(x=>[str(x.quantity),str(x.policy)].filter(Boolean).join(': ')).join('; '));
  }
 }
 if(needsReal.has(node)&&!real&&!['C35','C35B','C35P'].includes(node)){
  result.why='A proposed mathematical step is not an actual finding. These criteria are demonstrated through genuine, correctly presented and interpreted mathematics.';
  result.strong=node==='C33'
   ?'Create and check the figure, diagram or calculation in your own IA before marking it as completed; use correct notation, units and relevant precision.'
   :'Complete and check the mathematics first. Then describe its genuine result, assumptions and connection to the question without inventing an outcome.';
  result.reminder='This work is currently a plan. The badge is guidance, not evidence of completed mathematics.';
 }
 return result;
}
