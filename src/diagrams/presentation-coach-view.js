/** Accessible, compact student-facing advice. Never writes the IA for students. */
import {presentationSparks,presentationDiagnostics,figureCaption,handoverQuestions,contextualRepresentationAdvice} from "./presentation-coach-core.js";

const sparkIcon={aim:"target",planned:"sparkles",confirmed:"check-circle"};
export function renderPresentationCoach(state,type,draft,icon,e){
 const sparks=presentationSparks(state,type,draft);
 const diagnostics=presentationDiagnostics(state,type,draft);
 const matched=sparks.filter(x=>x.kind==="planned"||x.kind==="confirmed");
 return '<section class="ia-presentation-coach" data-presentation-coach="'+type+'" aria-label="Contextual mathematical presentation advice">'+
  '<header class="ia-coach-header"><span class="ia-coach-icon">'+icon("lightbulb")+'</span>'+
   '<div><strong>Make this mathematics communicate</strong>'+
   '<p>Advice responds to your current values and earlier decisions. It does not decide which model fits or award an IB grade.</p></div></header>'+
  '<div class="ia-coach-checks"><span class="ia-coach-kicker">CHECK THE MATHEMATICS</span>'+
   (diagnostics.length?diagnostics.map(item=>
    '<article class="ia-coach-point '+(item.tone==="check"?"ia-coach-important":"")+'">'+
    '<span class="ia-coach-point-icon">'+icon(item.tone==="check"?"alert-triangle":"search")+'</span>'+
    '<div><strong>'+e(item.title)+'</strong><p>'+e(item.detail)+'</p></div></article>').join(""):
    '<p>Choose and check a purposeful mathematical representation, then interpret the genuine output rather than assuming a pattern.</p>')+
  '</div>'+
  (matched.length?'<div class="ia-coach-sparks"><span class="ia-coach-kicker">'+icon("sparkles")+' SPARKS REUSED HERE</span>'+
   '<p>These were saved earlier; planning details must still be confirmed against what you actually collected or sourced.</p>'+
   matched.map(s=>'<div class="ia-coach-spark">'+
    icon(sparkIcon[s.kind]||"sparkles")+'<div><strong>'+e(s.title)+'</strong><p>'+e(s.detail)+'</p></div>'+
    '<span class="ia-coach-spark-status '+(s.kind==="confirmed"?"confirmed":"planned")+'">'+
    (s.kind==="confirmed"?"Recorded":"Planned")+'</span></div>').join("")+'</div>':
   '<p class="ia-coach-no-sparks">'+icon("sparkles")+
    ' <strong>No matching source or accuracy spark yet.</strong> You can still proceed; check source, sampling and precision in Planning or the IA introduction.</p>')+
  '<p class="ia-coach-criteria">Relevant self-checks: presentation (Criterion A), mathematical communication (B) and reflection (D). These prompts are not a grade prediction or a substitute for IB and school guidance.</p>'+
 '</section>';
}
export function renderFigureHandover(state,type,draft,icon,e,{id="",linked=false}={}){
 const questions=handoverQuestions(state,type,draft);
 const caption=figureCaption(state,type,draft);
 return '<section class="ia-figure-handover" data-figure-handover="'+type+'" aria-label="Prepare this figure or table for my IA">'+
  '<div class="ia-handover-head"><span class="ia-handover-icon">'+icon("pencil")+'</span>'+
  '<div><strong>'+(linked?"Use this saved figure in your IA":"Before moving this into your IA")+'</strong>'+
  '<p>Pathfinder creates a label and writing prompts, not your mathematical interpretation. Nothing is automatically inserted into your IA document.</p></div></div>'+
  '<div class="ia-handover-caption"><span class="ia-coach-kicker">FIGURE / TABLE LABEL AND SOURCE</span>'+
  '<p class="ia-handover-caption-text">'+e(caption)+'</p>'+
  '<button type="button" class="btn btn-secondary btn-sm" data-action="presentation-copy-caption" data-presentation-type="'+type+'"'+
  (id?' data-presentation-id="'+e(id)+'"':"")+'>'+
   icon("copy")+' Copy label and source</button>'+
  '<small>Review numbering, original citation, mathematical notation and your school style before pasting into Word or Google Docs.</small></div>'+
  '<div class="ia-handover-journey"><span class="ia-coach-kicker">THE FOUR PARTS TO WRITE IN YOUR OWN WORDS</span>'+
  '<ol><li><strong>Introduce before showing it</strong><p>'+e(questions.before)+'</p></li>'+
   '<li><strong>Interpret after the output</strong><p>'+e(questions.after)+'</p></li>'+
   '<li><strong>Evaluate a limitation</strong><p>'+e(questions.limitation)+'</p></li>'+
   '<li><strong>Link to the next step</strong><p>'+e(questions.next)+'</p></li></ol>'+
  '</div></section>';
}
export function renderHubDatasetEvidence(state,baseAdvice,icon,e){
 const advice=contextualRepresentationAdvice(state,baseAdvice);
 return '<section class="ia-hub-evidence" data-hub-dataset-evidence>'+
  '<span class="ia-hub-evidence-mark">'+icon(advice.data?"grid-2x2":"lightbulb")+'</span><div>'+
  '<strong>'+(advice.data?"Using the data you have entered":"Recommendations before you enter data")+'</strong>'+
  '<p>'+e(advice.note)+'</p>'+
  '<small>These are suitability suggestions, not an automatic inference of correlation, a proof or a requirement to use a particular technique.</small>'+
  '</div></section>';
}
