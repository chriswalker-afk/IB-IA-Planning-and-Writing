import {CRITERIA,E_DESCRIPTORS,FORMAT_ITEMS,PROCESS_ITEMS,SOURCE_NOTE,HL_NOTE,BEST_FIT,REVIEW_IDS,courseLevel} from './catalog.js';
import {criteriaContext,isCriteriaDismissed} from './context.js';
import {isCriterionSpotPage} from './criteria-badges.js';
import {exampleButton,examplePrompt,e} from '../examples/views.js';
import {EXAMPLE_CRITERIA} from './example-criteria.js';
import {isRevisedAssessment,REVISED_2029_CRITERIA,REVISED_2029_SOURCE,REVISED_2029_SOURCE_AI} from './assessment-cohorts.js';
export function essentialsButton(label='IA essentials',options={}){
 const attrs=Object.entries(options).filter(([k,v])=>['tab','criterion','mode','level'].includes(k)&&v).map(([k,v])=>' data-essentials-'+k+'="'+e(v)+'"').join('');
 return '<button type="button" class="btn btn-quiet essentials-trigger" data-action="essentials-open"'+attrs+'>'+e(label)+'</button>';
}
const source=x=>'<p class="ess-source"><span>'+e(x.label)+'</span> '+e(x.source)+'</p>';
export function essentialsNudge(state){
 const n=state.route==='planning'?state.planning.current:state.completion.current;
 if(state.route==='planning'&&n==='N00'&&isRevisedAssessment(state))
  return '<details class="ess-at-glance"><summary>Your IA at a glance · 2029</summary><p>Individual mathematical exploration · 20% of the course · four revised criteria: Problem specification, Abstraction, Computation and Interpretation. Confirm your school’s current formatting requirements.</p>'+essentialsButton('Published criteria overview',{tab:'rubric'})+'</details>';
 if(state.route==='planning'&&n==='N00')return '<details class="ess-at-glance"><summary>Your IA at a glance</summary><p>Individual mathematical exploration · 20% of the course · 20 marks across five criteria.<br>Approximately 12–20 double-spaced pages. Quality matters more than length.</p>'+essentialsButton('Format & length',{tab:'format'})+essentialsButton('View rubric',{tab:'rubric'})+'</details>';
 if(state.route==='completing'&&n==='C00'&&isRevisedAssessment(state))
  return '<section class="setup-document-guide" aria-labelledby="setup-document-heading"><h3 id="setup-document-heading">Set up your IA document</h3><p>Write in your own document. Use precise mathematics and well-labelled diagrams, and record sources as you work. The 2029 assessment criteria have changed: check current guidance for format and length rather than relying on earlier-cohort requirements.</p>'+essentialsButton('Updated criteria overview',{tab:'rubric'})+'</section>';
 if(state.route==='completing'&&n==='C00')return '<section class="setup-document-guide" aria-labelledby="setup-document-heading">'+
  '<div class="setup-document-guide-top"><span class="setup-document-guide-icon" aria-hidden="true">✎</span><div>'+
   '<h3 id="setup-document-heading">Set up your IA document</h3>'+
   '<p>Open your own Word or Google Docs file before writing. Choose a clear working title, use readable equations and figures, and record sources as you work. Pathfinder prompts are <strong>not</strong> inserted into your document automatically.</p></div></div>'+
  '<div class="setup-document-guide-bottom"><span class="setup-document-guide-summary">About 12–20 double-spaced pages for the <strong>whole IA</strong> is the IB guideline, not an introduction target or an automatic limit. Check your school requirements.</span>'+
  essentialsButton('Format and length',{tab:'format'})+'</div></section>';
 if(state.route==='completing'&&['C80','C90'].includes(n)&&isRevisedAssessment(state))
  return '<aside class="ess-setup"><strong>Checking the 2029 IA</strong><span>Review the actual document using the revised four-criterion overview. The earlier A–E self-review does not apply.</span>'+essentialsButton('Read 2029 criteria',{tab:'rubric'})+'</aside>';
 if(state.route==='completing'&&['C80','C90'].includes(n))return '<aside class="ess-setup"><strong>Check the actual document</strong><span>Review formatting, references, authenticity and the five criteria before submission.</span>'+essentialsButton('Before submission',{tab:'submission',mode:n==='C80'?'draft':'final'})+'</aside>';
 return '';
}
export function criteriaPanel(state,{writingTools=''}={}){
 if(isRevisedAssessment(state))return '<section class="criteria-panel task-support" aria-label="Updated mathematics IA assessment guidance">'+
  '<p class="ess-small"><strong>2029 assessment cohort:</strong> the previous A–E criteria bubbles are hidden. The published four-criterion overview is available, while the mathematical writing and help tools remain usable.</p>'+
  essentialsButton('View updated 2029 criteria',{tab:'rubric'})+writingTools+'</section>';
 const x=criteriaContext(state),hidden=isCriteriaDismissed(x.key),id='tips-'+x.key;
 const criteria=x.rows.length?'<button type="button" class="btn btn-secondary btn-sm criteria-dismiss" data-action="criteria-toggle" aria-controls="'+id+'" aria-expanded="'+!hidden+'">Relevant criteria <span class="support-letters">'+x.rows.map(r=>r.id).join(' / ')+'</span></button>':essentialsButton('Assessment criteria',{tab:'rubric'});
 const titleStep=state.route==='planning'&&state.planning?.current==='N01';
 const motivationStep=state.route==='planning'&&state.planning?.current==='N01V';
 const exampleAction=motivationStep?exampleButton('Compare motivations',{topic:'motivation'}):titleStep?exampleButton('Compare titles',{topic:'title',id:'EX30'}):exampleButton('Compare examples');
 // The local letter badge now owns the tailored guidance. Keep useful tools,
 // but do not duplicate generic A/C/D or B/E explanations below it.
 if(isCriterionSpotPage(x.route,x.node)){
  return '<section class="criteria-panel task-support criterion-local-support" aria-label="More support for this step"><div class="criteria-actions support-actions">'+
   exampleAction+essentialsButton('Full criteria rubric',{tab:'rubric'})+
   '<button type="button" class="btn btn-secondary btn-sm" data-action="resource-browse">Tools & tutorials</button>'+
   '<button type="button" class="btn btn-secondary btn-sm" data-action="open-stuck">I am stuck</button></div>'+
   writingTools+'</section>';
 }
 return '<section class="criteria-panel task-support" data-criteria-key="'+e(x.key)+'" aria-label="Support for this step"><div class="criteria-actions support-actions">'+exampleAction+criteria+'<button type="button" class="btn btn-secondary btn-sm" data-action="resource-browse">Tools & tutorials</button><button type="button" class="btn btn-secondary btn-sm" data-action="open-stuck">I am stuck</button></div>'+
 '<div class="criteria-content" id="'+id+'"'+(hidden?' hidden':'')+'>'+x.rows.map(r=>'<div class="criteria-row"><span class="criterion-letter" aria-hidden="true">'+r.id+'</span><p><strong>'+e(CRITERIA[r.id].name)+'</strong><br>Show good '+e(CRITERIA[r.id].name.toLowerCase())+' here by '+e(r.by)+'</p></div>').join('')+
 (x.policy?'<p class="criteria-policy">'+e(x.policy)+'. Apply only where these inputs limit this result; keep guard digits.</p>':'')+
 (x.route==='planning'?'<p class="ess-small">Planning guidance, not evidence that you have completed these actions.</p>':'')+essentialsButton('View these criteria',{tab:'rubric',criterion:x.rows[0]?.id||'A'})+'</div>'+writingTools+'</section>';
}
export function formatView(state){
 if(isRevisedAssessment(state))return '<h3 class="ess-heading" tabindex="-1">Format & length · 2029 cohort</h3>'+
  '<p class="ess-emphasis">Use your current mathematics course guide and school instructions to verify page length, spacing and submission format. The supplied earlier-cohort format extract is not being presented as a verified 2029 rule.</p>'+
  '<p class="ess-small">This Pathfinder project can still help organise writing, diagrams and sources. The updated IA criteria overview is available below.</p>'+essentialsButton('See revised criteria',{tab:'rubric'});
 return '<h3 class="ess-heading" tabindex="-1">Format & length</h3><div class="ess-facts"><div><strong>12–20</strong><span>approximate pages</span></div><div><strong>Double</strong><span>line spacing</span></div><div><strong>20%</strong><span>course assessment</span></div><div><strong>20</strong><span>maximum IA marks</span></div></div><p class="ess-emphasis">The quality of your mathematical writing matters more than length. Include graphs and diagrams in the stated page range; the bibliography is excluded.</p><p class="ess-small">IB extract, printed pp.81–84; JIS slide 2. This is not an automatic page-count pass/fail limit.</p><div class="ess-information">'+FORMAT_ITEMS.map(x=>'<section id="ess-format-'+x.id+'"><h4>'+e(x.title)+'</h4><p>'+e(x.text)+'</p><p class="ess-small">'+e(x.detail)+'</p>'+source(x)+'</section>').join('')+'</div>'+essentialsButton('Read the assessment criteria',{tab:'rubric'});
}
function descriptorTable(id,level){
 const c=CRITERIA[id],rows=id==='E'?E_DESCRIPTORS[level]:c.descriptors;
 if(!rows)return '<p class="ess-emphasis">Choose SL or HL above to view the correct Criterion E descriptors. Your course has not been assumed.</p>';
 return '<table class="ess-rubric-table"><caption>Achievement descriptors · '+e(id==='E'?'Criterion E — '+level:'Criterion '+id+' — SL and HL')+'</caption><thead><tr><th scope="col">Mark</th><th scope="col">Descriptor</th></tr></thead><tbody>'+rows.map((t,i)=>'<tr><th scope="row">'+i+'</th><td>'+e(t)+'</td></tr>').join('')+'</tbody></table><p class="ess-small">Descriptor wording from the supplied IB guide extract. Explanations below are separate student-facing guidance.</p>';
}
export function levelPicker(state,session){
 const confirmed=courseLevel(state),selected=session.level||confirmed;
 return '<div class="ess-level"><label for="ess-level">Criterion E reference level</label><select id="ess-level" data-essentials-level><option value="">Choose level</option><option value="SL"'+(selected==='SL'?' selected':'')+'>SL</option><option value="HL"'+(selected==='HL'?' selected':'')+'>HL</option></select><p class="ess-small">'+(confirmed?'Recorded course level: '+confirmed+'.':'No unambiguous course level is recorded.')+' Switching this reference does not change your course. Criteria A–D are shared; E differs.</p></div>';
}
export function rubricView(state,session){
 if(isRevisedAssessment(state))return '<h3 class="ess-heading" tabindex="-1">Updated IA assessment criteria · first assessment 2029</h3>'+
  '<p class="ess-emphasis">The IB has published these four criteria and their strands for SL and HL. This is an overview, not the full achievement-level descriptors or an automatic conversion from the older five-criterion scheme.</p>'+
  '<div class="ess-revised-grid" data-essentials-revised-rubric>'+REVISED_2029_CRITERIA.map(x=>
   '<section class="ess-revised-criterion" data-revised-criterion="'+x.id+'"><h4>'+x.id+' · '+e(x.name)+' <span>/ '+x.max+'</span></h4>'+
   '<p>'+e(x.focus)+'</p><strong>Published strands</strong><ul>'+x.strands.map(s=>'<li>'+e(s)+'</li>').join('')+'</ul></section>').join('')+'</div>'+
  '<p class="ess-small">Sources: <a href="'+e(REVISED_2029_SOURCE)+'" target="_blank" rel="noopener noreferrer">Official IB Mathematics AA update</a> · '+
  '<a href="'+e(REVISED_2029_SOURCE_AI)+'" target="_blank" rel="noopener noreferrer">Official IB Mathematics AI update</a>. Consult the applicable full subject guide and your teacher before self-assessment.</p>'+
  essentialsButton('Before submission',{tab:'submission',mode:session.mode||'draft'});
 const id=Object.hasOwn(CRITERIA,session.criterion)?session.criterion:'A',c=CRITERIA[id],level=session.level||courseLevel(state);
 const examplePriority={A:["EX24","EX22","EX30","EX10","EX08"],B:["EX13","EX10","EX12","EX28","EX29"],C:["EX21","EX16","EX55","EX31","EX33"],D:["EX17","EX11","EX15","EX23","EX25"],E:["EX20","EX13","EX19","EX11","EX14"]};
 const examples=(examplePriority[id]||[]).filter(key=>Object.hasOwn(EXAMPLE_CRITERIA[key]||{},id)).map(key=>[key,EXAMPLE_CRITERIA[key]]);
 return '<h3 class="ess-heading" tabindex="-1">Assessment criteria</h3><p class="ess-small">'+e(BEST_FIT)+'</p><div class="ess-criteria-nav" role="group" aria-label="Assessment criterion">'+Object.entries(CRITERIA).map(([key,v])=>'<button type="button" data-essentials-criterion="'+key+'" aria-pressed="'+(key===id)+'"><strong>'+key+' · '+e(v.name)+'</strong><span>Maximum '+v.max+'</span></button>').join('')+'</div><section class="ess-criterion" data-rubric-criterion="'+id+'"><h3>'+id+' · '+e(c.name)+' <span class="ess-small">/ '+c.max+'</span></h3><p>'+e(c.summary)+'</p>'+(id==='E'?levelPicker(state,session):'')+descriptorTable(id,level)+'<h4>What this means</h4><p>'+e(c.meaning)+'</p><p>'+e(c.note)+'</p>'+(id==='E'&&level==='HL'?'<p class="ess-emphasis">'+e(HL_NOTE)+'</p>':'')+'<h4>Ways to show it</h4><p class="ess-small">Adapted from JIS slide '+({A:43,B:44,C:45,D:46,E:47}[id])+'. Opportunities, not a compulsory checklist.</p><ul class="ess-ways">'+c.ways.map(t=>'<li>'+e(t)+'</li>').join('')+'</ul><p class="ess-source">'+e(c.source)+'</p><div class="ess-example-links"><strong>Compare examples</strong>'+examples.map(([key])=>exampleButton(exampleTitle(key),{id:key})).join('')+'</div></section>'+essentialsButton('Record my own evidence',{tab:'submission',mode:session.mode||'draft'});
}
const exampleTitle=id=>({EX01:'Introduction',EX02:'Statistical introduction',EX03:'Theoretical introduction',EX04:'Aim and domain',EX05:'Choosing a method',EX06:'Sampling and scope',EX07:'Model assumptions',EX08:'Tables and precision',EX09:'Summarising results',EX10:'Graph presentation',EX11:'Model critique',EX12:'Labelled diagrams',EX13:'Mathematical presentation',EX14:'Explaining technology',EX15:'Interpreting a result',EX16:'Next mathematical step',EX17:'Limitations',EX18:'Accuracy',EX19:'Understanding mathematics',EX20:'Proof',EX21:'Authentic choices',EX22:'Conclusion',EX23:'Counterexample',EX24:'Coherence',EX25:'Statistical conclusion',EX31:'Motivation for modelling',EX32:'Motivation for statistics',EX33:'Mathematical curiosity',EX34:'Specialist vocabulary'}[id]||'Compare example');
function evidenceFields(state,mode,id,level){
 const c=CRITERIA[id],r=state.completion.review.records[mode+'-'+REVIEW_IDS[id]];
 const input=(field,label,rows=2)=>'<label for="ess-'+mode+'-'+id+'-'+field+'">'+e(label)+'</label><textarea id="ess-'+mode+'-'+id+'-'+field+'" data-ess-review="'+field+'" data-ess-id="'+id+'" rows="'+rows+'" maxlength="5000">'+e(r[field]||'')+'</textarea>';
 const oldLevel=id==='E'&&r.selfMark!==''?r.markLevel||'not recorded':'';
 const canMark=id!=='E'||['SL','HL'].includes(level);
 return '<section class="ess-evidence-card" data-evidence-criterion="'+id+'"><div class="ess-evidence-heading"><h4>'+id+' · '+e(c.name)+'</h4>'+essentialsButton('View rubric',{tab:'rubric',criterion:id,mode})+'</div>'+(id==='E'?levelPicker(state,{level}):'')+'<div class="ess-evidence-grid"><div>'+input('location','Page(s), figure(s) or section(s) in my actual IA')+input('note','My evidence / reason for my judgement')+'</div><div>'+input('action','One improvement I will make, if needed')+'<label for="ess-'+mode+'-'+id+'-mark">My provisional self-mark (optional, maximum '+c.max+')</label><select id="ess-'+mode+'-'+id+'-mark" data-ess-review="selfMark" data-ess-id="'+id+'"'+(!canMark?' disabled':'')+'><option value="">Not self-marked</option>'+Array.from({length:c.max+1},(_,i)=>'<option value="'+i+'"'+(String(r.selfMark)===String(i)?' selected':'')+'>'+i+'</option>').join('')+'</select>'+(id==='E'?'<p class="ess-small" data-evidence-level>'+(!canMark?'Choose the reference level above before entering a Criterion E self-mark.':oldLevel?'Existing self-mark recorded against '+e(oldLevel)+(oldLevel!==level?'. Revisit this judgement before using the '+level+' rubric.':'.'):'A self-mark entered here will be recorded against '+level+'.')+'</p>':'')+'</div></div></section>';
}
export function submissionView(state,session){
 if(isRevisedAssessment(state))return '<h3 class="ess-heading" tabindex="-1">Before submission · 2029 cohort</h3>'+
  '<p class="ess-emphasis">The existing A–E evidence records and self-marks belong to the previous assessment framework. They remain saved in your project but are not shown or translated for this cohort.</p>'+
  '<p>Check the actual document against the published strands below and seek the full 2029 guidance from your teacher. These are discussion prompts, not full descriptors or a marking checklist.</p>'+
  '<div class="ess-revised-grid">'+REVISED_2029_CRITERIA.map(x=>
   '<section class="ess-revised-criterion"><h4>'+x.id+' · '+e(x.name)+'</h4><p>'+e(x.focus)+'</p></section>').join('')+'</div>'+
  essentialsButton('View published criteria',{tab:'rubric'});
 const mode=session.mode==='final'?'final':'draft',level=session.level||courseLevel(state),p=state.planning?.fields||{};
 const date=mode==='draft'?p.milestoneSchoolDraft:p.milestoneSchoolFinal;
 return '<h3 class="ess-heading" tabindex="-1">Before submission</h3><div class="ess-review-modes" role="group" aria-label="Self-review version"><button type="button" data-essentials-mode="draft" aria-pressed="'+(mode==='draft')+'">Before my teacher draft</button><button type="button" data-essentials-mode="final" aria-pressed="'+(mode==='final')+'">Before final submission</button></div><p>'+e(mode==='draft'?'Inspect the complete draft you will give to your teacher.':'Inspect the actual revised document, not only your earlier draft.')+' These are your own notes and optional provisional judgements, not automatic marks, teacher approval or a submission.</p>'+(date?'<p class="ess-small">Date in your plan: '+e(date)+'. Check this is your school’s agreed deadline.</p>':'<p class="ess-small">Confirm the deadline and submission method with your teacher; no date is assumed here.</p>')+essentialsButton('Check formatting & length',{tab:'format'})+'<h4>My evidence for A–E</h4><p class="ess-small">These fields use the same records as your existing detailed self-review. Editing a note does not mark the stage complete. A changed checked record becomes due for review again. Back up the project JSON to keep these notes.</p><div role="status" class="ess-save-note" id="ess-review-status"></div>'+Object.keys(CRITERIA).map(id=>evidenceFields(state,mode,id,level)).join('')+'<h3>Working independently & getting feedback</h3><div class="ess-information">'+PROCESS_ITEMS.map(x=>'<section><h4>'+e(x.title)+'</h4><p>'+e(x.text)+'</p>'+source(x)+'</section>').join('')+'</div>';
}
export function reviewAccess(state,mode){
 if(!['draft','final'].includes(mode))return '';
 if(isRevisedAssessment(state))return '<aside class="ess-review-access"><strong>Updated 2029 mathematics IA criteria</strong><p>The earlier A–E self-review is stored but not applicable to this assessment cohort. Check the four revised criteria with your teacher.</p>'+essentialsButton('Read revised criteria',{tab:'rubric'})+'</aside>';
 return '<aside class="ess-review-access"><strong>'+ (mode==='draft'?'Before my teacher draft':'Before final submission')+' · A–E evidence</strong><p>Use the full rubric, record page references and choose an improvement. Optional self-marks are your judgement, never an automatic score.</p>'+essentialsButton('Open criterion self-review',{tab:'submission',mode})+essentialsButton('Format & length',{tab:'format'})+'</aside>';
}
export const essentialsSourceNote=state=>isRevisedAssessment(state)?
 '<p class="ess-provenance">Revised-criteria overview based on the public IB Mathematics AA and AI curriculum updates for first assessment 2029. Full achievement descriptors and current school submission rules must be confirmed from the applicable official guide.</p>':
 '<p class="ess-provenance">'+e(SOURCE_NOTE)+'</p>';
