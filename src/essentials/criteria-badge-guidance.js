/** Read-only, entry-scoped criterion guidance. Never infer results from plans. */
import {guidanceContext} from '../completing/guidance-context.js';
import {firstUnfamiliarUse,methodFamilies} from '../completing/method-identity.js';
import {linkedAccuracy} from '../completing/evidence-links.js';

const str=x=>typeof x==='string'?x.trim():'';
const short=x=>str(x).replace(/\s+/g,' ').slice(0,160);
const firstTypes={scatter:'a scatter graph',distribution:'a group or distribution comparison',
 diagram:'a mathematical diagram',table:'a numerical table',calculation:'a purposeful calculation',
 theory:'a mathematical example or conjecture',other:'another representation',
 unsure:'an undecided first representation'};
const needsReal=new Set(['C33','C34','C34B','C35','C35B','C35P','C40','C50','C40T','C40L']);

export function contextualBadgeGuidance(state,key,base){
 const result={...base,details:[],real:false};
 const [route,node]=key.split(':');
 if(route!=='completing')return result;
 const ctx=guidanceContext(state,node),entry=ctx.entry,c=ctx.c||{},f=ctx.f||{},real=ctx.real===true;
 result.real=real;
 const add=(label,value)=>{if(short(value)&&result.details.length<3)result.details.push({label,text:short(value)});};
 add('Your current aim',ctx.aim);
 if(node==='C31'){
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
