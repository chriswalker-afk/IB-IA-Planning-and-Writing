import {exampleContext} from '../examples/context.js';
import {linkedAccuracy} from '../completing/evidence-links.js';
import {firstUnfamiliarUse} from '../completing/method-identity.js';
const pair=(id,by)=>({id,by});
const str=v=>typeof v==='string'?v.trim():'';
/** Stage-local suggestions: a preview never becomes evidence of completed work. */
export function criteriaContext(state,options={}){
 const x=exampleContext(state,options),n=x.node||'',c=state.completion||{};
 const theory=x.kind==='theoretical';let rows=[];
 if(x.route==='planning'){
  if(/^N03/.test(n))rows=theory?[pair('C','choosing a conjecture or starting case for a reason you can explain.'),pair('E','checking the domain and mathematical assumptions of your proposed argument.')]:[pair('C','explaining which feasible source or collection method you would choose, and why.'),pair('D','considering how the proposed source or sampling method could restrict your eventual answer.')];
  else if(/^N04/.test(n))rows=[pair('E','choosing course-appropriate mathematics that would help answer the aim, not adding techniques for their own sake.'),pair('C','explaining the mathematical question behind your proposed approach.')];
  else if(['N05','N05V'].includes(n))rows=[pair('B','planning a representation whose quantities, units and variables will be clear.'),pair('A','explaining what the first representation will contribute to the investigation.')];
  else rows=[pair('A','making the aim specific enough to guide a coherent investigation.'),pair('C',theory?'identifying the mathematical question or conjecture that genuinely interests you.':'explaining the genuine question or observation behind your chosen focus.')];
 }else if(['C10','C10E','C02'].includes(n))rows=[pair('A','stating the aim clearly and keeping background focused on what the reader needs.'),pair('C',theory?'explaining the mathematical curiosity behind the investigation, without inventing a personal anecdote.':'explaining how a genuine question or observation influenced what you chose to investigate.')];
 else if(['C20','C21S','C21M','C21T','C22','C23','C26'].includes(n)){
  const source=c.sourceRecords?.find(s=>s.id===c.activeSourceId)?.fields||c.fields||{};
  const actual=['ready','partial','theoretical'].includes(source.dataStatus);
  rows=theory?[pair('E','stating the objects, domain and assumptions used in your argument.'),pair('D','explaining how those assumptions restrict the claim you can establish.')]:[
   pair('C',actual?'explaining why you chose this source or method over feasible alternatives.':'explaining which source or method you propose, and why; do not describe unperformed collection as completed.'),
   pair('D',actual?'connecting an actual limitation of this source or method to the conclusion it could affect.':'considering the consequences of possible limitations, without claiming they have occurred.')];
 }else if(n==='C24'||n==='C34A')rows=[pair('B','distinguishing recorded resolution, calculation precision and a justified reporting convention.'),pair('E',theory?'keeping exact reasoning exact unless a numerical approximation serves the argument.':'not treating calculator digits as evidence of accuracy or certainty.')];
 else if(n==='C25'||n==='C70N')rows=[pair('B','defining variables and key terms where needed and using consistent notation, units and approximation signs.'),pair('A','keeping each equation or representation alongside the discussion that uses it.')];
 else if(['C30','C31','C32','C33'].includes(n))rows=[pair('B',theory?'making the mathematical objects, domain and labels in your representation unambiguous.':'labelling quantities, variables, units and scales and distinguishing observations from fitted models.'),pair('A','introducing this representation and placing it beside the part of the argument it supports.')];
 else if(['C34','C34B'].includes(n))rows=x.real?[pair('D','explaining what this actual result means for the aim, what remains unresolved, and how it compares with any earlier prediction.'),pair('E',theory?'distinguishing a tested pattern, conjecture, proof and counterexample in what you claim.':'interpreting the output correctly and checking whether it is reasonable in context.')]:[pair('E','obtaining and checking a genuine result before claiming an interpretation.'),pair('D','planning to connect the eventual finding to the aim; an intended technique is not evidence.')];
 else if(/^C35/.test(n)||n==='C34U')rows=[pair('D',x.real?'identifying the unanswered question that follows from this selected result, or explaining why it is enough to conclude.':'identifying what genuine evidence is still needed before choosing a result-led next step.'),pair('C','explaining your own reason for a next question or change of approach; do not add mathematics simply to fill a section.')];
 else if(['C40','C50','C40D','C40L','C40T'].includes(n)){
  rows=[pair('E',theory?'using course-appropriate mathematics with justified steps and a clear distinction between examples and proof.':'using a relevant, course-appropriate method correctly and showing why its results are meaningful.'),pair('B','defining necessary quantities and setting out the essential reasoning clearly and consistently.')];
  if(n==='C40T')rows=[pair('E','explaining the mathematical operation, its inputs and what the technology output means.'),pair('B','identifying fixed quantities, fitted parameters and appropriate notation rather than relying on a screenshot alone.')];
  if(n==='C40D'||n==='C40L'||x.knowledge==='outside'||x.knowledge==='mixed'){
   if(x.knowledge==='syllabus')rows[0]=pair('E','applying and interpreting familiar course mathematics without a textbook-style tutorial; still justify choices and show understanding.');
   else if(x.knowledge==='mixed')rows[0]=pair('E','explaining the unfamiliar component at first use, while applying familiar course techniques without reteaching them.');
   else if(x.knowledge==='outside')rows[0]=pair('E','explaining the researched mathematics at first use, citing your actual source and demonstrating your own understanding.');
   else rows[0]=pair('E','checking which mathematics is familiar from your course and which needs a first-use explanation; do not assume its status.');
  }
  if(['outside','mixed'].includes(x.knowledge)&&x.entry&&!firstUnfamiliarUse(state,x.entry))rows[0]=pair('E','applying the unfamiliar idea already introduced, linking back to its explanation instead of repeating a tutorial.');
  if(str(x.entry?.mathsInsight)||x.topic==='learning')rows[1]=pair('D','explaining what you genuinely learned mathematically and how it changed your understanding, rather than inventing a discovery.');
 }else if(/^C6/.test(n))rows=[pair('A','answering the aim through a concise synthesis of mathematics already presented.'),pair('D',theory?'explaining what was established, its domain and any genuine unresolved question.':'discussing implications and previously identified limitations, without adding unperformed checks or new results.')];
 else if(['C70','C80','C80D','C90','C90F'].includes(n))rows=[pair('A','checking the whole investigation for logical connections, relevance and unnecessary repetition.'),pair('B','checking definitions, equations, figures and appropriate accuracy in the actual finished document.')];
 else return {...x,rows:[],key:n};
 const policies=x.entry?linkedAccuracy(state,x.entry):[];
 const policy=policies.length?'Earlier accuracy for this result: '+policies.map(a=>a.quantity+(a.unit?' ('+a.unit+')':'')+': '+a.policy).join('; '):'';
 const raw=[x.route,n,x.entry?.id||'',/^C2/.test(n)?c.activeSourceId||'':'',x.kind,x.knowledge,x.real?'actual':'preview',policy].join('|');
 let h=2166136261;for(const ch of raw)h=Math.imul(h^ch.charCodeAt(0),16777619);
 return {...x,rows,policy,key:'criteria-'+(h>>>0).toString(16)};
}
const dismissed=new Set();
export const isCriteriaDismissed=key=>dismissed.has(key);
export function dismissCriteria(key,hidden){if(hidden)dismissed.add(key);else dismissed.delete(key);if(dismissed.size>300)dismissed.delete(dismissed.values().next().value);}
