/** One dedicated, student-driven Checking page.
 * All edits use the existing completion.review records and conformance actions.
 * Criterion bubbles open shared contextual advice then the full rubric; no automatic grading.
 */
import {reviewChecksFor} from '../completing/review.js';
import {renderCitationSpotlight,renderCitationAudit,renderAuthenticityAudit} from './reference-audit.js';
import {CHECKING_CRITERIA,CHECKING_DETAILS,CHECKING_MODES,reviewCounts} from './checklist.js';
import {chapterRibbon} from '../ui/living-journey.js';
import {workspaceHeader} from '../ui/workspace-navigation.js';
import {criterionBadge} from '../essentials/criteria-badges.js';
import {checkingHelpBadge} from '../help/checking-help.js';
import {isRevisedAssessment,REVISED_2029_CRITERIA} from '../essentials/assessment-cohorts.js';
const statusText={'unchecked':'Not checked','needs-work':'Needs work','checked':'Checked in my IA','not-applicable':'Not relevant here'};
const scoreKeys=['A','B','C','D','E'];
const stateStatus=(s,mode,id)=>s.completion?.review?.records?.[mode+'-'+id]?.status||'unchecked';
export function createCheckingViews(ctx){
 const {getState,e,icon,field,button,sheetTitle,tabletNav}=ctx;
 const badge=letter=>criterionBadge('checking:'+letter);
 const badges=(letters,revised)=>revised?
  '<span class="checking-process-tag" aria-label="Document check, not an assessed 2029 criterion">'+icon('clipboard')+' DOCUMENT CHECK</span>':
  letters.length?'<span class="checking-criterion-bubbles" role="group" aria-label="Relevant current IB assessment criteria">'+letters.map(badge).join('')+'</span>':
  '<span class="checking-process-tag" aria-label="Process requirement, not an additional criterion mark">'+icon('clipboard')+' PROCESS</span>';
 const action=(name,text,attributes='')=>'<button type="button" class="btn btn-secondary btn-sm" data-action="'+name+'" '+attributes+'>'+text+'</button>';
 const listItem=(s,check,mode)=>{
  const details=CHECKING_DETAILS[check.id]||{criteria:[],focus:check.question,lookFor:[],source:''};
  const revised=isRevisedAssessment(s);
  const tips=revised&&check.id==='D10'?
    ['Check the current school formatting and cover instructions','Inspect equations, figures, captions and pagination at reading size','Do not assume earlier-cohort length guidance is a verified 2029 requirement']:
    details.lookFor;
  const key=mode+'-'+check.id,record=s.completion.review.records[key]||{},current=stateStatus(s,mode,check.id);
  const stem='completion.review.records.'+key+'.',attrs='data-mode="'+mode+'" data-id="'+check.id+'"';
  const options=s.entries.map(x=>[x.id,x.title||'Mathematical stage']).filter(x=>x[0]);
  return '<article class="checking-item '+current+'" data-checking-item="'+e(check.id)+'"'+
   (check.id==='D09'?' id="checking-audit-'+mode+'" tabindex="-1"':'')+'>'+
   '<div class="checking-item-top">'+badges(details.criteria,revised)+
    '<span class="checking-item-status '+current+'">'+e(statusText[current]||'Not checked')+'</span>'+
    checkingHelpBadge(s,"check:"+check.id,e)+'</div>'+
   '<h4>'+e(details.focus)+'</h4>'+
   '<p class="checking-item-question">'+e(check.question)+'</p>'+
   '<div class="checking-item-actions" role="group" aria-label="Review '+e(check.area)+'">'+
    [['checked','I checked this'],['needs-work','Needs work'],...(check.id==='D12'?[]:[['not-applicable','Not relevant']])].map(([v,label])=>
     '<button type="button" data-action="conformance-review-status" '+attrs+' data-status="'+v+
      '" class="checking-status-action '+(current===v?'is-selected':'')+'" aria-pressed="'+(current===v)+'">'+
      (v==='checked'?icon('check-circle'):v==='needs-work'?icon('alert-circle'):icon('x-circle'))+' '+label+'</button>').join('')+
   '</div>'+
   '<details id="checking-review-'+mode+'-'+check.id+'" class="checking-item-details"'+(current==='needs-work'?' open':'')+'>'+
    '<summary>'+icon('lightbulb')+' What should I look for?'+
      (record.location||record.note?'<span class="checking-has-evidence">'+icon('check')+' Evidence noted</span>':'')+icon('chevron-right')+'</summary>'+
    '<div class="checking-item-inner">'+
      (tips.length?'<ul class="checking-look-for">'+tips.map(v=>'<li>'+e(v)+'</li>').join('')+'</ul>':'')+
      (check.id==='D09'?renderCitationAudit(s,icon,e):check.id==='D12'?renderAuthenticityAudit(icon):'')+
      '<p class="checking-source-note">'+e(revised?'Earlier-cohort checking guidance: confirm current IB and school expectations.':details.source)+'</p>'+
      (details.processNote?'<p class="checking-process-explanation"><strong>Important process requirement:</strong> '+e(revised?'This is an essential document, integrity or submission check, not an additional score under the 2029 assessment criteria.':details.processNote)+'</p>':'')+
      '<p class="checking-evidence-reminder">'+(check.id==='D09'?
        'Before marking checked, verify citations against the original sources in your actual IA, then record the two-way check in the note below. Pathfinder does not inspect your file.':
        check.id==='D12'?'Check the actual latest IA for student authorship and permitted support. Record what you verified; this cannot be marked not relevant.':
        'To mark a check as done, record where you checked in your actual IA or what you verified. For “Not relevant”, explain why. Your Word/PDF is not inspected automatically.')+'</p>'+
      field(stem+'location',check.id==='D09'?'Where did I check in the IA?':'Where in my actual IA?',check.id==='D09'?'Pages, figures and Works Cited location':'Page, section, figure or equation')+
      field(stem+'note',check.id==='D09'?'What did I verify in both directions?':check.id==='D12'?'What did I verify about my own work and support?':'My evidence, or why this is not relevant',
       check.id==='D09'?'Name the citations and Works Cited checks actually completed':check.id==='D12'?'My own mathematics, appropriate acknowledgement and ethical use':'What I actually checked',
       {type:'textarea',rows:2})+
      field(stem+'action','My specific correction, if needed','One useful change to my own document',{type:'textarea',rows:2})+
      (options.length?field(stem+'entryId','Related mathematical stage (optional)','',{type:'select',options:[['','No specific stage'],...options]}):'')+
      action('conformance-review-repair',icon('arrow-left')+' Return to the affected work',attrs)+
    '</div></details></article>';
 };
 const evidenceInfo=(s)=>{
  const issues=(s.entries||[]).filter(x=>x.reviewNeeded==='yes'),openFeedback=(s.completion?.review?.feedbackItems||[]).filter(x=>x.status!=='verified');
  return (issues.length||openFeedback.length)?'<div class="checking-notices" role="note">'+icon('alert-circle')+
   '<p>'+(issues.length?e(issues.length+' mathematical '+(issues.length===1?'stage is':'stages are')+' flagged for review. '):'')+
   (openFeedback.length?e(openFeedback.length+' recorded feedback '+(openFeedback.length===1?'action is':'actions are')+' not yet verified.'):'' )+
   ' Check your actual document; Pathfinder flags are reminders, not proof of an error.</p></div>':'';
 };
 const feedbackPanel=(s)=>{
  const r=s.completion.review,p='completion.review.';
  const entries=s.entries.map(x=>[x.id,x.title||'Mathematical stage']).filter(x=>x[0]);
  return '<section class="checking-feedback">'+
   '<div class="checking-section-head"><div><h3>Record the advice you actually received</h3>'+
   '<p>The JIS guide describes one teacher-written feedback opportunity. You can record verbal suggestions and the permitted written feedback without implying approval.</p></div>'+
    checkingHelpBadge(s,"feedback",e)+'</div>'+
   '<div class="checking-feedback-form">'+
   field(p+'feedbackKind','How was the advice given?','',{type:'select',options:[['written','Written feedback (permitted teacher round)'],['verbal','Verbal advice']]})+
   field(p+'feedbackNote','What feedback did you receive?','An actual comment from your teacher',{type:'textarea',rows:3})+
   field(p+'feedbackAction','What will you change?','A specific mathematical or written correction',{type:'textarea',rows:2})+
   field(p+'feedbackLocation','Where does this apply in your IA?','Page, section or figure')+
   (entries.length?field(p+'feedbackEntryId','Related mathematical stage','',{type:'select',options:[['','No specific stage'],...entries]}):'')+
   field(p+'feedbackNode','Which part needs revision?','',{type:'select',options:[['C40','Mathematical work'],['C34B','Interpretation'],['C20','Sources and methods'],['C10','Introduction'],['C60','Conclusion'],['C70N','Mathematical communication']]})+
   action('conformance-feedback-add',icon('plus-circle')+' Record feedback action')+'</div>'+
   (r.feedbackItems.length?'<h4>My feedback actions</h4>'+
    r.feedbackItems.map((item,i)=>'<article class="checking-feedback-item"><div><strong>'+e(item.action)+'</strong>'+
      '<span class="checking-feedback-state">'+e(item.status==='verified'?'I verified this revision':item.status==='implemented'?'Revised — needs checking':'Not yet revised')+'</span></div>'+
      '<p>'+e(item.note)+'</p>'+(item.location?'<small>Where: '+e(item.location)+'</small>':'')+
      (item.status!=='recorded'?field(p+'feedbackItems.'+i+'.verification','How did I verify this change?','Refer to the actual revised maths or wording',{type:'textarea',rows:2}):'')+
      '<div class="checking-feedback-actions">'+
      action('conformance-feedback-repair',icon('arrow-left')+' Go to affected work','data-index="'+i+'"')+
      (item.status==='recorded'?action('conformance-feedback-progress','I made this revision','data-index="'+i+'" data-status="implemented"'):
       item.status==='implemented'?action('conformance-feedback-progress','I checked the revision','data-index="'+i+'" data-status="verified"'):'')+
      '</div></article>').join(''):'<p class="checking-empty">No teacher feedback has been recorded here yet. That does not mean none has been received.</p>')+
   '</section>';
 };
 const criteria=(s,checks,mode)=>{
  const individual=checks.filter(c=>['D02','D03','D04','D05','D06'].includes(c.id)),
   others=checks.filter(c=>!individual.includes(c));
  if(isRevisedAssessment(s)){
    const overview='<section class="checking-revised-overview" data-checking-revised-overview>'+
     '<h3>Updated IA criteria · first assessment 2029 onwards</h3>'+
     '<p>The IB has published these four criteria and their strands. These are not full mark-band descriptors. Your former A–E review records are preserved, not translated into 2029 marks.</p>'+
     '<div class="checking-revised-grid">'+REVISED_2029_CRITERIA.map(x=>
       '<article><strong>'+x.id+' · '+e(x.name)+'</strong><small>'+x.max+' marks</small>'+
       '<p>'+e(x.strands.join(' · '))+'</p></article>').join('')+'</div>'+
     '<button type="button" class="btn btn-secondary btn-sm" data-action="essentials-open" data-essentials-tab="rubric">Read the official-criteria overview</button>'+
     '</section>';
    return overview+'<section class="checking-document-section"><div class="checking-section-head"><div>'+
     '<h3>Review the actual IA document</h3><p>These document and integrity checks are not extra criterion marks. Match your mathematical inquiry to the updated rubric with your teacher.</p></div></div>'+
     '<div class="checking-doc-grid">'+checks.map(check=>listItem(s,check,mode)).join('')+'</div></section>';
  }
  const badgeIntro='<div class="checking-criteria-legend">'+scoreKeys.map(letter=>{
   const m=CHECKING_CRITERIA[letter];
   return '<div>'+badge(letter)+'<span><strong>'+e(m.name)+'</strong><small>Up to '+m.max+' marks</small></span></div>';
  }).join('')+'</div>'+ 
   '<p class="checking-bubble-key"><strong>A–E</strong> bubbles point to the assessed IB criteria. <strong>PROCESS</strong> identifies essential integrity, feedback or submission checks; these do not award additional criterion marks.</p>';
  return badgeIntro+
   (individual.length?'<section class="checking-criteria-sections"><div class="checking-section-head"><div><h3>Read your IA through five lenses</h3><p>These checks come from the IB criteria. Open each one for the specific things to look for.</p></div></div>'+
    '<div class="checking-criteria-grid">'+individual.map(check=>listItem(s,check,mode)).join('')+'</div></section>':'')+
   (others.length?'<section class="checking-document-section"><div class="checking-section-head"><div><h3>Presentation, integrity and practical checks</h3><p>Only record checks relevant to your own investigation. “Not relevant” needs a brief reason.</p></div></div>'+
    '<div class="checking-doc-grid">'+others.map(check=>listItem(s,check,mode)).join('')+'</div></section>':'');
 };
 function viewChecking(){
  const s=getState(),mode=['draft','feedback','final'].includes(s.ui?.checkingMode)?s.ui.checkingMode:'draft';
  const revised=isRevisedAssessment(s);
  const checks=reviewChecksFor(s,mode).filter(x=>!revised||!['D02','D03','D04','D05','D06','D16'].includes(x.id));
  const counts=reviewCounts(s,mode,checks);
  const stages=[['C70','Review notation and presentation'],['C80','Teacher draft & feedback records'],['C90','Final communication and submission notes']];
  return '<div class="page wide checking-page">'+tabletNav()+
   workspaceHeader(s,{route:"checking",focus:CHECKING_MODES.find(x=>x.id===mode)?.title||"Review my IA"})+
   chapterRibbon(s)+
   sheetTitle('CHECK YOUR IA','Checking',revised?
      'Review your actual IA document using the published 2029 criteria overview. Older A–E bubbles and self-marks do not apply to this cohort.':
      'A final look at the mathematics and the writing in your own IA document. Criterion bubbles explain which assessment expectation is relevant.')+
   '<section class="checking-intro"><div class="checking-intro-icon">'+icon('clipboard')+'</div><div><h2>Read it like someone else will.</h2>'+
   '<p>Use the actual Word document or final PDF, not your Pathfinder notes. Check what is really there, record where you found it, and return to repair anything that needs attention. Checking never submits or grades your work.</p>'+
   '</div></section>'+
   '<nav class="checking-mode-tabs" aria-label="Choose when you are checking">'+CHECKING_MODES.map(x=>
    '<button type="button" data-action="checking-mode" data-checking-mode="'+x.id+'"'+(mode===x.id?' aria-current="page"':'')+
    ' class="checking-mode-tab '+(mode===x.id?'active':'')+'">'+
    icon(x.id==='draft'?'clipboard':x.id==='feedback'?'message':'check-circle')+
    '<span><strong>'+e(x.title)+'</strong><small>'+e(x.short)+'</small></span></button>').join('')+'</nav>'+
   '<div class="checking-progress"><div><strong>'+counts.done+' of '+counts.total+' checks resolved</strong>'+
    '<span>'+counts.checked+' checked'+(counts.needsWork?' · '+counts.needsWork+' needing work':'')+'</span></div>'+
    '<div class="checking-progress-track" role="progressbar" aria-label="Student-recorded checks resolved (not an IB mark)" aria-valuenow="'+counts.done+
    '" aria-valuemin="0" aria-valuemax="'+Math.max(1,counts.total)+'"><span style="width:'+(counts.total?100*counts.done/counts.total:0)+'%"></span></div>'+
    '<p>These counts record your own '+(revised?'document':'document and criterion')+' checks, not a predicted IA mark. You can revisit or revise them at any time.</p></div>'+
   evidenceInfo(s)+renderCitationSpotlight(mode,icon)+
   (mode==='feedback'?'<div class="checking-feedback-phase">'+criteria(s,checks,mode)+feedbackPanel(s)+'</div>':criteria(s,checks,mode))+
   '<section class="checking-next"><h3>Useful next actions</h3>'+
   '<p>Keep working on your actual IA, then come back to check the revised file. Your progress and evidence notes are stored locally.</p>'+
   '<div class="checking-next-buttons">'+
    button('Return to my conclusion','checking-conclusion','btn-secondary','','flag')+
    button('Revisit writing & maths','checking-studio','btn-secondary','','pencil')+
    button('Save the complete project','export-full-zip','btn-primary','','download')+
   '</div><details class="checking-old-tools"><summary>More communication and teacher-review tools '+icon('chevron-right')+'</summary>'+
   '<div class="button-row">'+stages.map(([node,title])=>'<button type="button" class="btn btn-secondary btn-sm" data-action="completion-open" data-node="'+node+'">'+e(title)+'</button>').join('')+
   '</div></details></section>'+
   '</div>';
 }
 return {viewChecking};
}
