/** Small opt-in controls using the existing visual vocabulary. */
import {linkedAccuracy,linkedSources} from './evidence-links.js';
import {reviewChecksFor} from './review.js';
import {reviewAccess} from '../essentials/views.js';
export function createConformanceViews(ctx){
 const {getState,e,field,button,summary}=ctx;
 const input=(p,l,help='',opts={})=>field(p,l,help,opts);
 const act=(action,label,attrs='')=>'<button type="button" class="btn btn-quiet btn-sm" data-action="'+action+'" '+attrs+'>'+e(label)+'</button>';
 const small=t=>'<p class="field-hint">'+e(t)+'</p>';
 function sourceManager(){
  const c=getState().completion;
  return '<details id="source-manager" class="completion-help"><summary>Sources used in this investigation ('+c.sourceRecords.length+')</summary>'+small('Record each actual source or method separately. Select the sources used by each mathematical result; source changes then flag only linked work.')+
   c.sourceRecords.map(s=>act('conformance-source-select',s.fields.actualSource||'Unnamed source','data-id="'+e(s.id)+'" aria-pressed="'+(s.id===c.activeSourceId)+'"')+(s.legacy?small('Earlier shared source. Check its links to existing mathematics.'):'' )).join('')+
   '<div class="button-row">'+act('conformance-source-save','Record current source / method')+act('conformance-source-new','Add a separate source')+'</div></details>';
 }
 function inputLinks(kind){
  const s=getState(),entry=s.entries[s.completion.activeEntryIndex];
  if(!entry)return'';
  const all=kind==='accuracy'?s.completion.accuracyDecisions:s.completion.sourceRecords;
  if(!all.length)return'';
  const linked=kind==='accuracy'?linkedAccuracy(s,entry):linkedSources(s,entry);
  return '<details id="input-links-'+kind+'" class="completion-help input-links" data-input-links="'+kind+'"><summary>'+(kind==='accuracy'?'Input accuracy':'Actual sources')+' for this result ('+linked.length+' linked)</summary>'+small('Choose all and only the inputs this result actually uses. No selection is also valid, for example for exact mathematics.')+
   all.map(x=>'<button type="button" class="choice tight" role="checkbox" aria-checked="'+linked.some(v=>v.id===x.id)+'" data-action="conformance-input-link" data-kind="'+kind+'" data-id="'+e(x.id)+'" data-index="'+s.completion.activeEntryIndex+'">'+e(kind==='accuracy'?x.quantity+(x.unit?' ('+x.unit+')':''):x.fields.actualSource||'Unnamed source')+'</button>').join('')+'</details>';
 }
 function accuracyNote(){
  const s=getState(),entry=s.entries[s.completion.activeEntryIndex],all=linkedAccuracy(s,entry);
  return all.length?'<div class="inline-note"><div><strong>Accuracy from your earlier measurement/source decision</strong>'+all.map(x=>'<p>'+e(x.quantity+(x.unit?' ('+x.unit+')':'')+': '+x.policy+(x.resolution?'. Original resolution: '+x.resolution:''))+'</p>').join('')+small('Apply these policies only where the inputs limit the result. Keep guard digits; an exact derivation need not be rounded.')+'</div></div>':'';
 }
 const entryOptions=s=>[['','Choose the relevant mathematical result'],...s.entries.map(x=>[x.id,x.title||'Mathematical record'])];
 function review(mode){
  const s=getState(),checks=reviewChecksFor(s,mode),r=s.completion.review;
  const count=checks.filter(x=>r.records[mode+'-'+x.id].status==='checked').length;
  const actionAttrs=(id)=>'data-mode="'+mode+'" data-id="'+id+'"';
  return '<section class="conformance-review"><h3>'+(mode==='final'?'Final self-review':mode==='feedback'?'Feedback check-in':'Whole-draft self-review')+'</h3>'+small('Check the actual IA you wrote. Saving these notes never declares it ready, submits it or predicts a mark.')+
   (mode==='feedback'?small('Keep the advice, the action and your verification separate.'):'<p>Can a reader follow the mathematics? Are important results explained where they occur? Have you inspected the whole document?</p>')+
   (s.entries.some(x=>x.priorLearningOnly==='yes')?small('You recorded a prior-learning-only concern. Revisit the course-level mathematics with your teacher rather than adding complexity for its own sake.'):'')+
   (mode==='draft'&&s.completion.fields.draftComplete==='not-yet'?small('Your draft is marked incomplete. Finish the missing work before using the permitted complete-draft feedback opportunity.'):'')+
   (mode==='final'&&r.feedbackItems.some(x=>x.status!=='verified')?small('Some feedback actions have not yet been marked implemented and checked. Revisit those actions before declaring your own final file ready.'):'')+
   reviewAccess(s,mode)+'<details id="review-checklist-'+mode+'" class="completion-help"><summary>Optional detailed checks and A-E evidence ('+count+' checked)</summary>'+checks.map(x=>{
    const key=mode+'-'+x.id,rec=r.records[key],p='completion.review.records.'+key+'.';
    return '<details id="review-'+mode+'-'+x.id+'" class="review-check" data-review-check="'+x.id+'"><summary>'+e(x.area)+' - '+e(rec.status.replaceAll('-',' '))+'</summary><p>'+e(x.question)+'</p>'+small('Look for: '+x.evidence)+small(x.action)+small(x.guardrail)+
     input(p+'location','Where in my actual IA?','Page, figure, equation or section')+
     input(p+'note','My evidence or reason this is not relevant','My own observation',{type:'textarea',rows:2})+
     input(p+'action','One repair, if needed','A specific correction',{type:'textarea',rows:2})+
     input(p+'entryId','Mathematical result to revisit (when relevant)','',{type:'select',options:entryOptions(s)})+
     '<div class="button-row">'+[['needs-work','Needs work'],['checked','I checked this'],['not-applicable','Not relevant']].map(([status,label])=>act('conformance-review-status',label,actionAttrs(x.id)+' data-status="'+status+'"')).join('')+
     act('conformance-review-repair','Return to the relevant work',actionAttrs(x.id))+'</div></details>';
   }).join('')+'</details>'+button('Save a full project backup','export-json','btn-quiet')+'</section>';
 }
 function feedback(){
  const s=getState(),r=s.completion.review,p='completion.review.';
  return '<details id="review-feedback" class="completion-help"><summary>Feedback actions: recorded, implemented and checked ('+r.feedbackItems.length+')</summary>'+small('Record permitted written feedback or verbal advice already received. Do not request an extra written-feedback round here; follow your school instructions.')+
   review('feedback')+input(p+'feedbackKind','Source of this actual feedback','',{type:'select',options:[['written','Permitted written feedback already received'],['verbal','Verbal advice already received']]})+
   input(p+'feedbackNote','Actual feedback note','Do not enter identifying participant data',{type:'textarea',rows:2})+
   input(p+'feedbackAction','One specific revision I will make','Record an action, not a claim it is done',{type:'textarea',rows:2})+
   input(p+'feedbackLocation','Where in my IA?','Section, figure or equation')+
   input(p+'feedbackEntryId','Relevant mathematical result (optional)','',{type:'select',options:entryOptions(s)})+
   input(p+'feedbackNode','Where should I return to make the correction?','',{type:'select',options:[['C40','Mathematics'],['C34B','Interpretation'],['C20','Sources and methods'],['C10','Introduction'],['C60','Conclusion'],['C70N','Notation and communication']]})+
   act('conformance-feedback-add','Record this feedback action')+
   r.feedbackItems.map((x,i)=>'<div class="summary-block" data-feedback-item="'+i+'"><strong>'+e(x.action)+'</strong>'+summary('Actual feedback',x.note)+summary('Location',x.location)+summary('Status',x.status)+
    act('conformance-feedback-repair','Revisit the affected work','data-index="'+i+'"')+
    (x.status==='recorded'?act('conformance-feedback-progress','I made this revision in my IA','data-index="'+i+'" data-status="implemented"'):input(p+'feedbackItems.'+i+'.verification','How did I check the revised work?','The calculation, reasoning or rendering I checked',{type:'textarea',rows:2})+
     (x.status==='implemented'?act('conformance-feedback-progress','I verified this revision','data-index="'+i+'" data-status="verified"'):small('Verified by you, not automatically approved by a teacher.')) )+'</div>').join('')+'</details>';
 }
 function returnToReview(){
  const c=getState().completion;
  return c.review.returnTo&&c.current!==c.review.returnTo?'<div class="button-row">'+act('conformance-review-return','Return to my saved review')+small('Your evidence and repair notes are preserved. Revisiting work does not automatically mark a check complete.')+'</div>':'';
 }
 function reviewReport(){
  const s=getState(),r=s.completion.review,records=Object.entries(r.records).filter(([,v])=>v.note||v.location||v.action||v.selfMark!==''&&v.selfMark!==undefined);
  if(!records.length&&!r.feedbackItems.length)return'';
  return '<h2>My draft and final self-review</h2>'+small('Student evidence and optional provisional self-marks, not teacher assessment or approval.')+
   records.map(([key,v])=>'<div class="summary-block"><strong>'+e(key)+'</strong>'+summary('Status',v.status)+summary('Evidence location',v.location)+summary('My evidence',v.note)+summary('Repair action',v.action)+(v.selfMark!==''&&v.selfMark!==undefined?summary('My provisional self-mark'+(v.markLevel?' ('+v.markLevel+')':''),v.selfMark):'')+'</div>').join('')+
   r.feedbackItems.map(x=>'<div class="summary-block"><strong>'+e(x.action)+'</strong>'+summary('Actual feedback',x.note)+summary('Status',x.status)+summary('Revision verification',x.verification)+'</div>').join('');
 }
 return{sourceManager,inputLinks,accuracyNote,review,feedback,returnToReview,reviewReport};
}
