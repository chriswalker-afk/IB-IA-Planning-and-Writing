import {STUCK_TOPICS,topicById} from './stuck-catalog.js';
import {guidanceContext} from '../completing/guidance-context.js';
import {completeEntry,sourceResultForNext,isPearsonResult,isScatterResult} from '../completing/engine.js';
import {writingOriginState} from '../completing/writing-origin.js';
const done=e=>e?.status==='completed'&&!!e.result?.trim();
export function stuckContext(state){
 const o=state.completion.support.origin;
 let view=state;
 if(o){view={...state,route:o.route,completion:{...state.completion,current:o.node,activeEntryIndex:state.entries.findIndex(e=>e.id===o.entryId),nextFromEntryId:o.nextFromEntryId}};}
 view=writingOriginState(view);
 const node=view.completion.current,planning=(o?.route||state.route)==='planning';
 const mathematical=/^C(?:3[2-5]|40|50)/.test(node);
 const entry=planning||!mathematical?null:/^C35/.test(node)?sourceResultForNext(view):completeEntry(view);
 const index=entry?state.entries.findIndex(e=>e.id===entry.id):-1;
 const g=guidanceContext({...view,completion:{...view.completion,activeEntryIndex:index}},planning?'C04':node);
 return{...g,entry,index,real:done(entry),planning,planNode:o?.planNode||state.planning.current,
  theory:(state.planning.fields.kind||state.project.kind)==='theoretical',node,
  waiting:state.teacher.pendingApproval||['pending','unsure'].includes(g.f.permissionStatus)||['yes','unsure'].includes(state.planning.fields.permissionNeed)};
}
export function suggestedTopics(state){
 const x=stuckContext(state);let ids;
 if(x.planning){
  if(['N00','N00B','N00C','N01','N01V','N02','N02U'].includes(x.planNode))ids=['aim','idea','method','prediction','overwhelmed'];
  else if(/^N03/.test(x.planNode))ids=['no-data','source','partial','permission','aim'];
  else if(['N01P','N04R'].includes(x.planNode))ids=['prediction','method','first','aim','overwhelmed'];
  else ids=['method','first','aim','understanding','overwhelmed'];
 }else if(/^C10/.test(x.node))ids=['writing','aim','prediction','overwhelmed','story'];
 else if(/^C35/.test(x.node)&&x.real)ids=['next','interpret','unexpected','understanding','conclusion'];
 else if(/^C(?:80|90)/.test(x.node))ids=['feedback','story','conclusion','writing','overwhelmed'];
 else if(/^C(?:60|61|62|63|64|70)/.test(x.node))ids=['conclusion','story','limitations','writing','precision'];
 else if(/^C2/.test(x.node))ids=x.hasActualSource?['source','partial','precision','limitations','first']:['no-data','source','partial','permission','precision'];
 else if(x.real)ids=['interpret','next','unexpected','calculation','writing'];
 else if(x.entry)ids=['calculation','understanding','first','writing','overwhelmed'];
 else ids=['aim','first','writing','no-data','overwhelmed'];
 if(x.theory)ids=['proof',...ids.filter(id=>!['no-data','source','partial','permission'].includes(id))];
 if(x.waiting&&!x.theory)ids=['permission',...ids.filter(id=>id!=='permission')];
 return [...new Set(ids)].slice(0,5).map(topicById);
}
export function availableTopics(state){return STUCK_TOPICS.filter(t=>!stuckContext(state).theory||!['no-data','source','partial'].includes(t.id));}
export function adviceFor(state,id){
 const base=availableTopics(state).find(t=>t.id===id);if(!base)return null;
 const x=stuckContext(state),e=x.entry,p=state.planning.fields,stage=(plan,comp)=>({route:x.planning?'planning':'completing',node:x.planning?plan:comp});
 const target={
  idea:{route:'planning',node:'N00B'},aim:stage('N01','C02'),method:stage(['AA SL','AI SL'].includes(p.course)?'N04S':'N04T',e?'C40D':'C31'),
  prediction:{route:'planning',node:'N01P'},'no-data':stage('N03','C20'),source:stage('N03','C20'),partial:stage('N03D','C20'),permission:stage('N02T','C03'),
  first:stage('N04S','C30'),calculation:stage('N04S',e?'C40T':'C30'),interpret:stage('N04S',x.real?'C34B':e?.phase==='first'?'C33':e?'C40':'C30'),
  next:stage('N04S',x.real?'C35':'C30'),unexpected:stage('N01P',x.real?'C34U':'C30'),understanding:stage('N04T',e?'C40D':'C30'),
  proof:stage('N04S',e?e.phase==='first'?'C33':'C40':'C30'),precision:stage('N03D','C24'),limitations:stage('N03D',x.real&&e?.phase!=='first'?'C40':'C23'),
  writing:stage('N01',e?'C96':'C10'),story:stage('N06','C70'),conclusion:stage('N06',state.entries.some(done)?'C60':'C30'),feedback:stage('N06T','C80D'),
  overwhelmed:stage('N03H','C04'),restore:{panel:'files'},unsure:{route:'planning',node:'N06T'}
 }[id];
 const buttons={idea:'Explore one idea',aim:'Refine my aim',method:'Review possible mathematics',prediction:'Revisit my tentative prediction','no-data':'Review my source plan',source:'Check my source',partial:'Review the available evidence',permission:'Review permission questions',first:'Plan my first mathematical move',calculation:'Check the mathematical task',interpret:'Interpret my selected result',next:'Choose what follows',unexpected:'Investigate the surprising result',understanding:'Check my understanding',proof:'Work on the mathematical case',precision:'Review accuracy decisions',limitations:'Review relevant limitations',writing:e?'Find the right writing location':'Work on my introduction',story:'Review the mathematical story',conclusion:'Review my conclusion',feedback:'Work through one feedback action',overwhelmed:'Review my next task',restore:'Open backups and import',unsure:'Prepare a teacher question'};
 let a={...base,target,label:buttons[id],context:x.planning?'Your planning':e?.title||'Your current work',alternatives:[]};
 if(x.theory&&id==='first')Object.assign(a,{action:'Choose one small mathematical case, label the quantities and calculate enough to see a possible pattern. State which general question this case could illuminate.',example:'Build a small table or labelled diagram from the definitions. Decide which feature might generalise, then test a different case or a possible counterexample.',boundary:'These are mathematical examples, not a pretend dataset. A general claim still needs a justified argument.'});
 if(['interpret','next','unexpected'].includes(id)&&!x.real){a.action='Choose a small purposeful calculation or representation first. When it has produced a result, record what it shows before deciding what follows.';a.reason='No completed result is selected for this help. A planned method or prediction is not yet evidence.';a.outcome='One first mathematical task, without claiming an unperformed result.';a.example='Write the question a diagram, numerical case or graph should answer. Keep its possible pattern as a prediction until you have produced it.';a.label='Plan the first useful mathematics';}
 if(!x.planning&&!x.real&&!e&&['interpret','next','unexpected'].includes(id)&&state.entries.some(done)){a.action='Choose the completed result you want to discuss from your mathematical path. Then open help from that result so the advice uses the right finding.';a.reason='Your project contains results, but none is selected in this section.';a.outcome='The relevant mathematical record, ready to interpret or extend.';a.target={route:'path'};a.label='Choose a result from my journey';}
 if(x.real&&id==='interpret'){
  if(isPearsonResult(e))a.action='Interpret the sign and size of your calculated Pearson coefficient as linear association in this sample. Compare it with the scatter, then explain what that means for your aim.';
  else if(x.method.has('fitted-model'))a.action='Interpret one parameter with its units and check the range where the fitted model is meaningful. Use the fit or residuals to qualify a prediction, rather than relying on an attractive curve.';
  else if(x.method.has('optimisation'))a.action='Explain what the candidate optimum means for the aim. Check the allowed domain, boundaries and constraints before claiming it is the best feasible solution.';
  else if(x.theory||x.method.has('proof'))a.action='State exactly which claim your reasoning establishes and under what conditions. If you only checked examples, describe the conjecture rather than calling it proved.';
 }
 if(x.real&&id==='interpret'){
  if(isPearsonResult(e))a.example='A coefficient describes the direction and strength of linear association in the observed sample. Read it with the scatter: a low coefficient can coexist with a curved pattern. It does not establish causation.';
  else if(x.method.has('optimisation'))a.example='A stationary point inside the allowed interval is a candidate, not automatically the best feasible value. Compare relevant boundary values and explain what the winning value would represent.';
  else if(x.theory||x.method.has('proof'))a.example='Separate "these examples support a pattern" from "this argument establishes the claim for every allowed value". State precisely what your own reasoning has reached.';
  else if(isScatterResult(e))a.example='Describe the shape, direction and any noteworthy scatter using your named quantities. Explain why that feature helps the question; do not claim a fitted equation or numerical coefficient you have not calculated.';
 }
 if(x.real&&id==='next'&&isScatterResult(e)){
  if(x.selectedPattern==='curved')a.example='Check whether the observed curve consistently increases/decreases or changes direction. That distinction matters before considering a nonlinear model or any rank-based association. A curve alone does not establish monotonicity.';
  else if(x.selectedPattern==='unclear')a.example='Little visible pattern may itself be a useful finding. State the scope of that observation before looking for a justified different question; do not keep testing variables just to obtain a strong association.';
  else if(x.selectedPattern==='linear')a.example='For matched numerical observations, a correlation coefficient may help quantify linear association. A fitted line has a different purpose: estimation or prediction. Choose either only if it helps the aim.';
 }
 if(x.real&&id==='limitations'&&isPearsonResult(e)){a.action='Read the actual coefficient beside the scatter. Consider whether linearity, an influential genuine observation or the sample scope restricts the conclusion you want to draw.';a.example='A small Pearson coefficient is not evidence against all relationships if the scatter is curved. Explain which kind of association your statistic can describe.';}
 if(x.real&&id==='next'&&isPearsonResult(e))a.action='Read your Pearson interpretation beside the actual scatter. Would a model answer a useful prediction question, does a non-linear shape need investigation, or is the association result already enough for your aim?';
 if(x.real&&id==='next'&&isScatterResult(e))a.action='Describe the observed shape before choosing a coefficient or model. Check that numerical observations are genuinely paired; then choose only mathematics that serves an unanswered part of the aim.';
 if(id==='understanding'&&e?.knowledge==='syllabus'){a.action='Locate the specific step you cannot justify and check a small worked case privately. In the IA, apply the verified syllabus method correctly and interpret it; do not add a textbook tutorial.';a.outcome='A checked step and a clear use of the method.';}
 if(id==='calculation'&&x.plannedMethod.has('pmcc')){a.action='Check that each pair of values belongs to the same observation and that both lists use the intended rows. Inspect the scatter before deciding whether a linear coefficient answers the question.';a.example='Removing a missing value from only one list shifts the pairs. Check matching records together; do not independently sort the two columns.';}
 if(id==='calculation'&&x.plannedMethod.has('normal')){a.action='Check what probability or boundary you need, the values used for the mean and standard deviation, and whether the input is a variance instead. Sketch the required region before using the tool.';a.example='A probability to the right of a value needs a different region from a probability between two values. The shaded region on a simple sketch should match the calculator operation.';}
 if(id==='precision'&&x.matchingAccuracy.length)a.action='Revisit the decisions linked to this result: '+x.matchingAccuracy.map(q=>q.quantity).join(', ')+'. Check units and source resolution, retain sufficient working digits, then justify the final reporting accuracy.';
 if(id==='no-data'&&x.waiting){a.action='Keep the affected data collection on hold. Define the quantities and units your aim needs, then identify one permission question and one safe preparatory task.';a.target=stage('N02T','C03');a.label='Review the permission question';}
 if(id==='writing'&&!e){a.action='Start with two short thoughts: what you want to find out, and your genuine reason for choosing it. Use your existing aim rather than trying to write the whole introduction at once.';a.outcome='The start of your own concise introduction, with no result claims.';}
 if(id==='writing'&&!x.planning&&!e&&!/^C10/.test(x.node)&&x.node!=='C04'){
  a.target={route:'completing',node:'C96'};a.label='Find the right writing location';
  a.action=base.action;a.outcome=base.outcome;
  if(/^C2/.test(x.node)){
   a.action=x.hasActualSource?'Describe the evidence or method you actually used and why it fits your aim. Explain a consequential limitation alongside that method, not as a general complaint.':'Write only the proposed source or method and why it could fit the aim. Keep it labelled as a plan until you have actually used it.';
   a.outcome='A short source or method explanation in the appropriate section.';
  }else if(/^C6/.test(x.node)){
   a.action=state.entries.some(done)?'Begin with the strongest answer your completed mathematics supports. Refer to a key result, then state any uncertainty that materially limits that answer.':'Outline what a conclusion will need to answer, but leave the answer provisional until you have relevant mathematical results.';
   a.outcome='A student-written synthesis, or a provisional outline without invented findings.';
  }
 }
 const altIds={idea:['aim','first'],aim:['method','source'],method:['first','understanding'],prediction:['first','aim'],'no-data':['writing','aim'],source:['aim','no-data'],partial:['source','aim'],permission:['writing','aim'],first:['aim','method'],calculation:['understanding','precision'],interpret:['writing','unexpected'],next:['interpret','conclusion'],unexpected:['partial','interpret'],understanding:['method','calculation'],proof:['first','understanding'],precision:['calculation','limitations'],limitations:['source','interpret'],writing:['interpret','story'],story:['aim','conclusion'],conclusion:['interpret','next'],feedback:['story','overwhelmed'],overwhelmed:['writing','unsure'],restore:['unsure'],unsure:['overwhelmed','aim']}[id]||[];
 a.alternatives=altIds.filter(t=>availableTopics(state).some(d=>d.id===t)).slice(0,2).map(topicById);
 return a;
}
