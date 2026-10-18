import {CRITERIA,courseLevel} from './catalog.js';
import {criteriaContext} from './context.js';
import {contextualBadgeGuidance} from './criteria-badge-guidance.js';
import {guidanceContext} from '../completing/guidance-context.js';
import {firstUnfamiliarUse,methodFamilies} from '../completing/method-identity.js';
import {linkedAccuracy} from '../completing/evidence-links.js';
import {escapeHtml} from '../ui/primitives.js';

/** Selective, read-only opportunities. A badge never represents a score or checklist point. */
export const CRITERION_SPOTS=Object.freeze({
 'planning:N01V:benefit':Object.freeze({
  criterion:'C',location:'Who might benefit, and how could the answer help?',stage:'Planning · motivation',
  why:'Your genuine purpose can influence which mathematical questions you pursue and which decisions you make. A personal story by itself is not evidence of engagement.',
  strong:'Give one real reason for investigating the question. Say what knowing the answer could help you understand, compare or decide, then let that purpose guide your later mathematical choices.',
  avoid:'Avoid invented beneficiaries, generic claims that mathematics is useful, or assuming your original prediction will be proved.',
  reminder:'This is an opportunity to develop personal engagement later, not a mark awarded for completing a planning box.'
 }),
 'planning:N02M:title':Object.freeze({
  criterion:'E',location:'Choose your course and explore possible mathematics.',stage:'Planning · mathematical direction',
  why:'Mathematics should serve your investigation aim and suit your course. Choosing a long list of advanced techniques does not make an investigation mathematically stronger.',
  strong:'Identify a mathematical question that your proposed technique might answer. Keep the choice provisional and check course suitability with your teacher where uncertain.',
  avoid:'Avoid selecting techniques because they appear impressive, or assuming a suggested pathway is formal syllabus verification.',
  reminder:'This is a provisional choice. Criterion E is demonstrated through relevant, correct mathematics and understanding in the completed exploration.'
 }),
 'completing:C31:firstPurpose':Object.freeze({
  criterion:'E',location:'Why might this help answer the aim?',stage:'IA Studio · select an initial representation',
  why:'A mathematical representation is useful when it could answer a specific part of your investigation question.',
  strong:'Choose a graph, diagram, example or calculation for a mathematical reason. State the question it might reveal and whether you have the genuine evidence it requires.',
  avoid:'Avoid beginning with a graph simply because it is familiar, choosing a technique to impress, or inventing data to get started.',
  reminder:'Choosing an initial representation is a plan, not evidence of completed mathematical work.'
 }),
 'completing:C32:purpose':Object.freeze({
  criterion:'A',location:'Mathematical purpose BEFORE it',stage:'IA Studio · introduce your first mathematics',
  why:'A brief mathematical bridge helps the reader understand why the next representation belongs in your exploration.',
  strong:'Before the working or figure, explain which question the step is designed to investigate and link it to the preceding aim or finding.',
  avoid:'Avoid dropping in an unexplained figure, writing a long generic introduction or reporting a result before doing the mathematics.',
  reminder:'Coherence is judged across the whole exploration, not by one introductory sentence.'
 }),
 'completing:C33:title':Object.freeze({
  criterion:'B',location:'Create the actual figure or calculation',stage:'IA Studio · communicate your first mathematics',
  why:'A reader needs correctly labelled and presented mathematics to understand what has genuinely been done.',
  strong:'Put the real diagram, graph, table or calculation into your IA. Define necessary symbols, label axes and units, identify relevant scales and use defensible accuracy.',
  avoid:'Avoid screenshots with unreadable notation, unlabeled graphs, invented results or calling a planned calculation completed.',
  reminder:'Different representation types are not required for their own sake. Communicate the mathematics you actually use.'
 }),
 'completing:C34:observation':Object.freeze({
  criterion:'E',location:'What can you really observe?',stage:'IA Studio · observe an actual result',
  why:'Accurate mathematical interpretation begins with reading what the representation actually establishes.',
  strong:'Describe the mathematical feature you can justify, such as a value, trend, turning point, boundary, counterexample or absence of a clear pattern. Distinguish conjecture from proof.',
  avoid:'Avoid reporting an expected pattern as a finding, interpreting a relationship that the graph does not show, or claiming that correlation proves causation.',
  reminder:'A mathematical observation should rest on a genuine result. Its meaning for the aim is discussed in the next reflection step.'
 }),
 'completing:C35:nextQuestion':Object.freeze({
  criterion:'C',location:'What worthwhile mathematical question remains unanswered?',stage:'IA Studio · choose your own next question',
  why:'Personal engagement can be demonstrated when you make an informed mathematical decision that develops your investigation.',
  strong:'Choose a follow-up that answers a real gap in your previous result or tests an interesting mathematical consequence. You can also decide that enough has been established.',
  avoid:'Avoid adding a calculation for quantity, copying a suggested route automatically or pretending every result creates a new question.',
  reminder:'An independent mathematical decision matters through how it shapes the exploration, not because a question box was filled.'
 }),
 'completing:C35:nextReason':Object.freeze({
  criterion:'D',location:'Why would this next technique follow from the previous result?',stage:'IA Studio · justify the next step',
  why:'A well-founded next step reflects on what the previous mathematics answered and what it left uncertain.',
  strong:'Refer to a real previous finding or limitation. Explain why the proposed technique could resolve the remaining issue—or explain why the investigation can conclude.',
  avoid:'Avoid claiming a planned or unsupported result, repeating a technique list or inventing a weakness to justify more mathematics.',
  reminder:'Reflection can include deciding that another calculation is not necessary.'
 }),
 'completing:C35B:title':Object.freeze({
  criterion:'E',location:'Interpret the actual scatter pattern',stage:'IA Studio · paired numerical data',
  why:'The mathematical method chosen after a scatter graph should match its actual shape and the investigation aim.',
  strong:'Look at the real pattern before selecting Pearson correlation or a model. Determine whether a linear relationship is plausible, and consider genuine curvature or outliers.',
  avoid:'Avoid forcing a line through a curved trend or saying that a low Pearson r means there is no relationship of any kind.',
  reminder:'A pattern choice must describe real data. The badge does not certify that a scatter graph or calculation is correct.'
 }),
 'completing:C35P:title':Object.freeze({
  criterion:'E',location:'After an actual Pearson correlation calculation',stage:'IA Studio · linear association',
  why:'Pearson r describes the direction and strength of linear association in paired numerical data, not every type of relationship.',
  strong:'Interpret an r value only after calculating it. Compare its implications with the scatter plot and decide whether a fitted model, a check or no further calculation is justified.',
  avoid:'Avoid treating correlation as causation, a low r as proof of no relationship, or a hypothetical r as an actual finding.',
  reminder:'The next technique should be useful for your aim, not obligatory because r was calculated.'
 }),
 'completing:C40:title':Object.freeze({
  criterion:'E',location:'First substantial mathematical section',stage:'IA Studio · relevant mathematics',
  why:'Criterion E values mathematics that is relevant, correct and understood. Mathematical depth should serve the investigation.',
  strong:'Link the technique to the previous mathematical question, show meaningful working and explain what an actual result establishes. Verify course suitability rather than assuming unfamiliar means advanced.',
  avoid:'Avoid a disconnected calculation, unexplained software output or a textbook tutorial for a familiar syllabus technique.',
  reminder:'A planned method is not an actual result. The use of mathematics is assessed across the exploration.'
 }),
 'completing:C50:title':Object.freeze({
  criterion:'E',location:'Further substantial mathematics',stage:'IA Studio · develop the mathematical investigation',
  why:'A later method should deepen the answer, test a genuine uncertainty or extend a real earlier mathematical result.',
  strong:'Explain why the new mathematics follows from the selected previous result, demonstrate and check the steps, then interpret the result before proceeding.',
  avoid:'Avoid repeating similar techniques for length, treating a list of methods as mathematical depth or skipping interpretation between sections.',
  reminder:'There is no compulsory number of substantial calculations. Concluding can be the strongest next decision.'
 }),
 'completing:C40T:title':Object.freeze({
  criterion:'E',location:'Explain technology-assisted mathematics',stage:'IA Studio · technology with understanding',
  why:'Using a GDC, spreadsheet, graphing tool or code is not itself evidence that the underlying mathematics is understood.',
  strong:'Identify the mathematical operation, its meaningful inputs, what the actual output represents and why the result matters for your question.',
  avoid:'Avoid relying on screenshots, unexplained fitted parameters, unexplained code or excessive calculator digits.',
  reminder:'Technology helps carry out mathematics. Understanding and justified interpretation remain important.'
 }),
 'completing:C40L:title':Object.freeze({
  criterion:'E',location:'Explain unfamiliar mathematics when genuinely needed',stage:'IA Studio · mathematical understanding',
  why:'An unfamiliar idea needs enough explanation to demonstrate your own understanding when it first contributes to the investigation.',
  strong:'Identify precisely what was new, state the relevant definitions and conditions, show a short meaningful step or check and acknowledge sources you actually used.',
  avoid:'Avoid calling a technique beyond the syllabus without checking, reteaching familiar course formulas or copying a long general tutorial.',
  reminder:'Once unfamiliar mathematics has genuinely been introduced and understood, reuse it without repeating the explanation.'
 }),
 'completing:C34B:title':Object.freeze({
  criterion:'D',location:'Reconnect with aim and prediction',stage:'IA Studio · interpretation',
  why:'Reflection moves beyond describing a result. It considers what the actual mathematics tells you about your aim, its implications and the questions still left open.',
  strong:'Use a result you genuinely obtained. Explain what it establishes in context, how it compares with any earlier expectation, and what you can reasonably conclude or investigate next.',
  avoid:'Avoid merely repeating a graph description, claiming an expected result without evidence, or assuming an inconclusive result is a failure.',
  reminder:'Meaningful reflection can appear throughout the exploration, not only in its final conclusion.'
 }),
 'completing:C61:mainConclusion':Object.freeze({
  criterion:'A',location:'The strongest answer I can support',stage:'IA Studio · conclusion in context',
  why:'A coherent conclusion answers the original mathematical aim using only the work actually carried out.',
  strong:'Give a concise, qualified answer and connect it to the key results or arguments already presented in your IA. An inconclusive result can be an honest answer.',
  avoid:'Avoid introducing brand-new calculations, copying the full working again, or claiming that a planned result has been established.',
  reminder:'Criterion A concerns coherence across the whole exploration. One conclusion paragraph does not establish it by itself.'
 }),
 'completing:C61:uncertainty':Object.freeze({
  criterion:'D',location:'What important uncertainty remains?',stage:'IA Studio · evaluate the conclusion',
  why:'Reflection involves recognising how genuine limitations or uncertainty affect the strength and meaning of a mathematical conclusion.',
  strong:'Identify a limitation that actually changes what you can claim. Explain its consequence, or explain why your established mathematical result has a clear domain or scope.',
  avoid:'Avoid a generic list of weaknesses, speculative errors presented as facts, or saying an uncertainty is harmless without evidence.',
  reminder:'Link to reflections already made beside the mathematics rather than rewriting them at the end.'
 }),
 'completing:C62:benefit':Object.freeze({
  criterion:'D',location:'What can the actual results tell that audience?',stage:'IA Studio · implications of the result',
  why:'Connecting genuine findings back to the original purpose is a meaningful opportunity for reflection.',
  strong:'Explain what your mathematics can and cannot help someone understand or decide. If it does not support the hoped-for use, say so.',
  avoid:'Avoid treating motivation or an initial prediction as evidence, inventing advice or assuming that every investigation has a practical beneficiary.',
  reminder:'A mathematical investigation can have an intellectual purpose; do not invent an external audience.'
 }),
 'completing:C63:extension':Object.freeze({
  criterion:'D',location:'One mathematical question that might follow (optional)',stage:'IA Studio · a meaningful extension',
  why:'An extension may demonstrate reflection if it genuinely follows from an established mathematical result or unresolved question.',
  strong:'Only if useful, identify one mathematical consequence, special case or model restriction worth examining, and explain its connection to your findings.',
  avoid:'Avoid generic future-work suggestions, adding more data without a mathematical reason, or treating an extension as compulsory.',
  reminder:'No extension is required when the mathematics already supports a reasonable stopping point.'
 }),
 'completing:C64:title':Object.freeze({
  criterion:'A',location:'Keep the conclusion concise and connected',stage:'IA Studio · coherent ending',
  why:'The conclusion should complete the thread from the aim through the mathematical development, without repeating everything.',
  strong:'Summarise what the mathematics established, acknowledge only consequential limits, and remove working or critique that belongs earlier.',
  avoid:'Avoid another long methods section, new unperformed checks, or a conclusion disconnected from the original aim.',
  reminder:'Edit the actual document where changes belong; reviewing this page alone cannot demonstrate coherence.'
 }),
 'completing:C70:title':Object.freeze({
  criterion:'A',location:'Review clarity across the actual document',stage:'IA Studio · presentation and coherence',
  why:'Presentation concerns an organised mathematical argument, not decoration alone. Readers need clear connections between the aim, representations and conclusions.',
  strong:'Inspect the real IA. Introduce each major representation where it supports a mathematical claim, remove needless repetition and connect sections logically.',
  avoid:'Avoid prioritising colour or formatting over understanding, hiding essential mathematics in an appendix or claiming review notes are corrections already made.',
  reminder:'The notation-specific Criterion B badge remains on its dedicated screen, so this page does not need a second letter.'
 }),
 'completing:C80D:title':Object.freeze({
  criterion:'A',criteria:Object.freeze(['A','B','C','D','E']),
  location:'Review my complete teacher draft against A–E',stage:'IA Studio · optional draft self-review',
  why:'A useful draft self-review checks the mathematics actually written, the organisation, the decisions made and the reflection already evidenced.',
  strong:'Locate examples in the real draft for each of A–E and make one specific revision plan where needed. Use the existing evidence-review panel rather than filling out a second criteria form.',
  avoid:'Avoid self-awarding marks for completing Pathfinder screens or describing unfinished mathematics as a complete draft.',
  reminder:'Your draft evidence pointers and self-marks remain your own provisional judgements, not teacher approval.'
 }),
 'completing:C90F:title':Object.freeze({
  criterion:'A',criteria:Object.freeze(['A','B','C','D','E']),
  location:'Check the final exploration against A–E',stage:'IA Studio · final evidence review',
  why:'The final review should locate genuine evidence in the actual revised document and identify any significant gaps without making up work.',
  strong:'Review coherence (A), communication (B), demonstrated personal engagement (C), substantive reflection (D) and suitable, understood mathematics (E), using your saved evidence pointers.',
  avoid:'Avoid treating five completed boxes as five achieved criteria, redoing advice already addressed or claiming that the website predicts an IA grade.',
  reminder:'This remains a self-review. The site does not inspect or grade your final document or submit it to the IB.'
 }),
 'completing:C70N:title':Object.freeze({
  criterion:'B',location:'Notation and mathematical presentation',stage:'IA Studio · notation review',
  why:'A reader should be able to follow your mathematics through appropriate, consistent symbols, units, definitions, equations and representations.',
  strong:'Check your own document in place. Define a variable when first used, label figures appropriately and distinguish exact equality from justified approximation.',
  avoid:'Avoid undefined symbols, missing units or treating many calculator digits as automatically accurate. Different graph types are not required just to tick a box.',
  reminder:'Fix the original mathematical passage. This review box is not itself evidence that the finished document is correctly communicated.'
 })
});
const TITLE_SPOTS=Object.freeze({
 'completing:C33':'completing:C33:title',
 'completing:C35B':'completing:C35B:title',
 'completing:C35P':'completing:C35P:title',
 'completing:C40':'completing:C40:title',
 'completing:C50':'completing:C50:title',
 'completing:C40T':'completing:C40T:title',
 'completing:C40L':'completing:C40L:title',
 'completing:C64':'completing:C64:title',
 'completing:C70':'completing:C70:title',
 'completing:C80D':'completing:C80D:title',
 'completing:C90F':'completing:C90F:title',
 'planning:N02M':'planning:N02M:title',
 'completing:C34B':'completing:C34B:title',
 'completing:C70N':'completing:C70N:title'
});
export const criterionSpotFor=(route,node)=>TITLE_SPOTS[route+':'+node]||'';
const FIELD_SPOTS=Object.freeze({
 'completing:C31':['completing:C31:firstPurpose'],
 'completing:C32':['completing:C32:purpose'],
 'completing:C34':['completing:C34:observation'],
 'completing:C35':['completing:C35:nextQuestion','completing:C35:nextReason'],
 'completing:C61':['completing:C61:mainConclusion','completing:C61:uncertainty'],
 'completing:C62':['completing:C62:benefit'],
 'completing:C63':['completing:C63:extension']
});
export const criterionFieldSpots=(route,node)=>route==='completing'?(FIELD_SPOTS[route+':'+node]||[]):[];
export const isCriterionSpotPage=(route,node)=>route==='planning'&&node==='N01V'||
 Boolean(criterionSpotFor(route,node))||criterionFieldSpots(route,node).length>0;

/** Badge is a real, accessible button; it never edits student work or progress. */
export function criterionBadge(key){
 const spot=Object.hasOwn(CRITERION_SPOTS,key)?CRITERION_SPOTS[key]:null;
 if(!spot)return '';
 return '<button type="button" class="criterion-badge" data-criterion-badge="'+escapeHtml(key)+
  '" aria-label="Criterion '+spot.criterion+' — '+escapeHtml(CRITERIA[spot.criterion].name)+
  ': advice for '+escapeHtml(spot.location)+'" title="Why Criterion '+spot.criterion+' matters here">'+
  '<span aria-hidden="true">'+spot.criterion+'</span></button>';
}
export function criterionMarkedField(html,key){
 return html&&Object.hasOwn(CRITERION_SPOTS,key)?'<div class="criterion-marked-field">'+html+criterionBadge(key)+'</div>':html;
}
export function criterionPageHeading(title,route,node){
 const key=criterionSpotFor(route,node),name=escapeHtml(title);
 return key?'<div class="criterion-title-row"><h1 class="task-heading">'+name+'</h1>'+criterionBadge(key)+'</div>':
  '<h1 class="task-heading">'+name+'</h1>';
}
const block=(name,text)=>'<section class="criterion-popin-part"><h3>'+escapeHtml(name)+'</h3><p>'+escapeHtml(text)+'</p></section>';

/** Native modal gives inert background, Escape behaviour and keyboard focus containment. */
export function createCriterionBadgeController({getState,openRubric=()=>{}}){
 let dialog=null,origin=null,current='';
 function ensure(){
  if(dialog)return;
  dialog=document.createElement('dialog');
  dialog.id='criterionBadgeDialog';
  dialog.className='criterion-popin';
  dialog.setAttribute('aria-labelledby','criterionBadgeTitle');
  dialog.setAttribute('aria-describedby','criterionBadgeSummary');
  document.body.appendChild(dialog);
  dialog.addEventListener('cancel',evt=>{evt.preventDefault();close();});
  dialog.addEventListener('click',evt=>{
   if(evt.target!==dialog)return;
   const r=dialog.getBoundingClientRect();
   if(evt.clientX<r.left||evt.clientX>r.right||evt.clientY<r.top||evt.clientY>r.bottom)close();
  });
 }
 function open(key,trigger=document.activeElement){
  if(!Object.hasOwn(CRITERION_SPOTS,key))return;
  ensure();if(dialog.open)dialog.close();
  current=key;origin=trigger;
  const state=getState(),p=contextualBadgeGuidance(state,key,CRITERION_SPOTS[key]),c=CRITERIA[p.criterion];
  const planned=key==='completing:C34B:title'&&!criteriaContext(state).real;
  const why=planned?'An interpretation can support Reflection only when it is based on actual mathematics. A proposed calculation or prediction is not a result.':p.why;
  const strong=planned?'First complete and check a genuine graph, calculation or argument. Then explain what that specific result means for your aim; do not invent findings.':p.strong;
  const level=p.criterion==='E'?courseLevel(state):'';
  dialog.innerHTML='<div class="criterion-popin-header"><div class="criterion-popin-heading">'+
   '<span class="criterion-popin-letter" aria-hidden="true">'+p.criterion+'</span><div>'+
   '<p class="criterion-popin-eyebrow">RELEVANT HERE · '+escapeHtml(p.stage)+'</p>'+
   '<h2 id="criterionBadgeTitle">Criterion '+p.criterion+' · '+escapeHtml(c.name)+'</h2></div></div>'+
   '<button type="button" class="criterion-popin-close" data-criterion-badge-close aria-label="Close criterion guidance">×</button></div>'+
   '<div class="criterion-popin-body"><p class="criterion-popin-location" id="criterionBadgeSummary">'+escapeHtml(p.location)+'</p>'+
   block('Why this matters here',why)+
   block('What a strong response looks like',strong)+
   block('Avoid this',p.avoid)+
   (p.details.length?'<section class="criterion-popin-context" aria-label="Your investigation context"><h3>Using your work</h3>'+
    p.details.map(x=>'<p><strong>'+escapeHtml(x.label)+'</strong> '+escapeHtml(x.text)+'</p>').join('')+'</section>':'')+
   '<p class="criterion-popin-note">'+escapeHtml(p.reminder)+'</p>'+
   (p.criterion==='E'?'<p class="criterion-popin-level">'+
    escapeHtml(level?'Your recorded course uses the '+level+' Criterion E reference.':'Confirm whether the SL or HL Criterion E rubric applies to your course.')+'</p>':'')+
   '<p class="criterion-popin-disclaimer">A badge is guidance, not evidence, a score or a predicted mark. IB criteria use best-fit judgement across the actual exploration.</p>'+
   '<div class="criterion-popin-actions"><button class="btn btn-secondary" type="button" data-criterion-badge-rubric="'+p.criterion+'">Read the full Criterion '+p.criterion+' rubric</button>'+
   '<button class="btn btn-quiet" type="button" data-criterion-badge-close>Return to my work</button></div></div>';
  dialog.showModal();
  dialog.querySelector('#criterionBadgeTitle')?.setAttribute('tabindex','-1');
  dialog.querySelector('#criterionBadgeTitle')?.focus({preventScroll:true});
 }
 function close(){
  if(!dialog?.open)return;
  dialog.close();
  const target=origin?.isConnected?origin:document.querySelector('[data-criterion-badge="'+current+'"]');
  target?.focus({preventScroll:true});
 }
 function click(evt){
  if(!(evt.target instanceof Element))return;
  const badge=evt.target.closest('[data-criterion-badge]');
  if(badge){
   evt.preventDefault();evt.stopImmediatePropagation();
   open(badge.dataset.criterionBadge,badge);return;
  }
  if(!dialog?.open||!dialog.contains(evt.target))return;
  const rubric=evt.target.closest('[data-criterion-badge-rubric]');
  if(rubric){
   evt.preventDefault();evt.stopImmediatePropagation();
   const id=rubric.dataset.criterionBadgeRubric,anchor=origin;
   close();openRubric(id,anchor);return;
  }
  if(evt.target.closest('[data-criterion-badge-close]')){
   evt.preventDefault();evt.stopImmediatePropagation();close();
  }
 }
 document.addEventListener('click',click,true);
 return {open,close,destroy(){
  close();document.removeEventListener('click',click,true);dialog?.remove();dialog=null;
 }};
}
