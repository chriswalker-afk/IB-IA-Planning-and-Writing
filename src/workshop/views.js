/** Optional Maths Workshop within the existing Tools & Tutorials drawer.
 * All content is editorial, escaped and read-only. No network, grades or project edits.
 */
import {WORKSHOP_DEFINITIONS,WORKSHOP_LESSONS,PATHWAY_LEARNING,definitionById,lessonById} from "./catalog.js";
import {INVESTIGATIVE_ROUTES,routeById} from "../planning/investigative-routes.js";
import {escapeHtml as e,icon} from "../ui/primitives.js";

const action=(name,label,attrs="",primary=false)=>
 '<button type="button" class="btn '+(primary?'btn-primary':'btn-secondary')+'" data-action="resource-workshop-'+name+'" '+attrs+'>'+e(label)+'</button>';
const safe=(value,n=120)=>String(value||"").slice(0,n);
const routeIds=new Set(INVESTIGATIVE_ROUTES.map(r=>r.id));
const subjectLabels={Data:"Data",Models:"Models",Calculus:"Calculus",Decisions:"Decisions",Geometry:"Geometry",Probability:"Probability",Reasoning:"Reasoning"};
const filtered=(session)=>{
 const routeId=routeIds.has(session.workshopRoute)?session.workshopRoute:"";
 const scope=routeId?PATHWAY_LEARNING[routeId]:null;
 const q=safe(session.workshopQuery).trim().toLowerCase();
 const terms=WORKSHOP_DEFINITIONS.filter(x=>(!scope||scope.terms.includes(x.id))&&
  (!q||[x.id,x.title,x.meaning,x.example,x.category,x.notation].join(" ").toLowerCase().includes(q)));
 const lessons=WORKSHOP_LESSONS.filter(x=>(!scope||scope.lessons.includes(x.id))&&
  (!q||[x.id,x.title,x.when,x.avoid,x.category,...x.definitionIds].join(" ").toLowerCase().includes(q)));
 return {terms,lessons,routeId};
};
const definitionCard=d=>'<article class="workshop-term-card">'+
 '<span class="workshop-eyebrow">'+e(subjectLabels[d.category]||d.category)+'</span>'+
 '<h4>'+e(d.title)+'</h4><p>'+e(d.meaning)+'</p>'+
 action("term","Read definition",'data-workshop-id="'+e(d.id)+'"')+'</article>';
const lessonCard=l=>'<article class="workshop-lesson-card"><span class="workshop-eyebrow">'+e(l.category)+'</span>'+
 '<h4>'+e(l.title)+'</h4><p>'+e(l.when)+'</p><small>'+e(l.skill)+'</small>'+
 action("lesson","Open guided lesson",'data-workshop-id="'+e(l.id)+'"',true)+'</article>';
export function workshopList(session){
 const {terms,lessons,routeId}=filtered(session);
 const selected=routeId?routeById(routeId):null;
 const parts=[
 '<p class="workshop-count" role="status">'+lessons.length+' guided lesson'+(lessons.length===1?"":"s")+
 ' · '+terms.length+' definition'+(terms.length===1?"":"s")+
 (selected?' for '+e(selected.title):' in the starter library')+'.</p>',
 '<section class="workshop-section"><h3>Guided mathematics</h3>'+
 '<p>Show me → Help me → My turn. Practice values are invented, not evidence for your IA.</p>'+
 (lessons.length?'<div class="workshop-grid">'+lessons.map(lessonCard).join("")+'</div>':
 '<p class="workshop-empty">No guided lessons match this selection yet. Later batches will add more methods. Try All pathways to explore the current pilots.</p>')+'</section>',
 '<section class="workshop-section"><h3>Quick mathematical definitions</h3>'+
 '<p>Short explanations you can use to understand notation and decide what to learn next.</p>'+
 (terms.length?'<div class="workshop-grid workshop-definitions">'+terms.map(definitionCard).join("")+'</div>':
 '<p class="workshop-empty">No matching terms. Try a shorter search or choose All pathways.</p>')+'</section>'
 ];
 return parts.join("");
}
const lessonNav=step=>'<div class="workshop-lesson-tabs" role="group" aria-label="Choose how much mathematical help you need">'+
 [["show","Show me"],["help","Help me"],["turn","My turn"]].map(([id,label])=>
  '<button type="button" data-action="resource-workshop-step" data-workshop-step="'+id+
  '" class="workshop-tab'+(step===id?' active':'')+'" aria-pressed="'+(step===id)+'">'+e(label)+'</button>').join("")+'</div>';
function renderLesson(session,l){
 const step=["show","help","turn"].includes(session.workshopStep)?session.workshopStep:"show";
 const trail='<div class="workshop-lesson-top">'+action("home","← Back to Maths Workshop")+
  '<span class="workshop-eyebrow">'+e(l.category)+'</span></div>';
 const definitions=l.definitionIds.map(definitionById).filter(Boolean).map(d=>
  '<button class="workshop-define-chip" type="button" data-action="resource-workshop-term" data-workshop-id="'+e(d.id)+'">'+e(d.title)+' '+icon("arrow-right")+'</button>').join("");
 let activity="";
 if(step==="show"){
  activity='<div class="workshop-example"><h4>Show me · Worked example</h4>'+
   '<p>'+e(l.worked.context)+'</p>'+(l.worked.table?'<div class="workshop-table-wrap"><table class="workshop-data-table"><caption>'+e(l.worked.table.caption)+'</caption><thead><tr>'+l.worked.table.headers.map(h=>'<th scope="col">'+e(h)+'</th>').join("")+'</tr></thead><tbody>'+l.worked.table.rows.map(row=>'<tr>'+row.map(v=>'<td>'+e(v)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>':"")+'<ol class="workshop-steps">'+l.worked.steps.map(t=>'<li>'+e(t)+'</li>').join("")+'</ol>'+
   '<p class="workshop-answer"><strong>Result:</strong> '+e(l.worked.answer)+'</p>'+
   '<p><strong>What it tells us:</strong> '+e(l.worked.interpretation)+'</p></div>'+
   action("step","Try this with help",'data-workshop-step="help"',true);
 }else if(step==="help"){
  const checkpoints=l.guided.parts||[l.guided];
  const current=Math.min(Math.max(Number(session.workshopCheckpoint)||0,0),checkpoints.length-1);
  const exercise=checkpoints[current];
  const selected=session.workshopChoice,known=exercise.options.some(([id])=>id===selected);
  const right=known&&selected===exercise.correct;
  activity='<div class="workshop-example"><h4>Help me · One step at a time</h4>'+
   '<p class="workshop-checkpoint-count">Checkpoint '+(current+1)+' of '+checkpoints.length+'</p>'+'<p>'+e(exercise.question)+'</p><p class="workshop-hint"><strong>Hint:</strong> '+e(exercise.hint)+'</p>'+
   '<div class="workshop-choice-list" role="group" aria-label="Choose an answer">'+
    exercise.options.map(([id,label])=>'<button type="button" class="workshop-choice'+(selected===id?' selected':'')+
      '" id="workshop-choice-'+e(id)+'" data-action="resource-workshop-choice" data-workshop-choice="'+e(id)+'" aria-pressed="'+(selected===id)+'">'+e(label)+'</button>').join("")+
    '</div>'+(known?'<p role="status" class="workshop-feedback '+(right?'correct':'retry')+'"><strong>'+
     (right?"That's right. ":"Not quite. ")+'</strong>'+e(right?exercise.feedback:exercise.hint)+'</p>':"")+
    '</div>'+(current>0?action("checkpoint","Previous checkpoint",'data-workshop-direction="-1"'):"")+(current<checkpoints.length-1?action("checkpoint","Next checkpoint",'data-workshop-direction="1"',true):action("step","Try independently",'data-workshop-step="turn"',true));
 }else{
  activity='<div class="workshop-example"><h4>My turn · Independent practice</h4>'+
   '<p>'+e(l.independent.question)+'</p>'+
   '<p class="workshop-hint">Work through this on paper or your own calculator before opening the answer.</p>'+
   '<details class="workshop-reveal"><summary>Reveal answer and reasoning</summary>'+
    '<p><strong>Answer:</strong> '+e(l.independent.answer)+'</p><p>'+e(l.independent.reasoning)+'</p></details></div>'+
   action("step","Review the worked example",'data-workshop-step="show"');
 }
 return '<article class="workshop-lesson" data-workshop-lesson="'+e(l.id)+'">'+trail+
  '<h3 tabindex="-1">'+e(l.title)+'</h3>'+
  '<p class="workshop-caution">This is a worked learning example, not a course recommendation. Check that this method is appropriate to your own syllabus and aim.</p>'+ 
  '<div class="workshop-guide-notes"><p><strong>Use this when:</strong> '+e(l.when)+'</p>'+
   '<p><strong>Check first:</strong> '+e(l.avoid)+'</p></div>'+
  '<section class="workshop-section"><h4>Definitions to know</h4><div class="workshop-chip-list">'+definitions+'</div></section>'+
  '<div class="workshop-formula"><strong>Useful relationship</strong><p>'+e(l.formula)+'</p></div>'+
  lessonNav(step)+activity+
  '<section class="workshop-section workshop-technology"><h4>'+icon("calculator")+' Technology: when is it faster?</h4>'+
  '<p class="workshop-skill-note">'+e(l.skill)+'. A tool can calculate efficiently, but cannot interpret an investigation for you.</p>'+
  l.technology.map(t=>'<div class="workshop-tech-row"><strong>'+e(t.name)+'</strong>'+
   '<code>'+e(t.command)+'</code><p>'+e(t.why)+'</p></div>').join("")+
  '<button type="button" class="btn btn-secondary" data-action="resource-open" data-resource-id="'+e(l.existingGuide)+'">'+
   'Open existing software instructions '+icon("arrow-right")+'</button></section>'+
  '<section class="workshop-section workshop-ia"><h4>In my actual IA</h4><p>'+e(l.ia)+'</p>'+
  '<p class="workshop-caution">These are fictional worked calculations, not your results. Reading this guide never writes to your IA, confirms mathematical accuracy or awards marks.</p></section>'+
  action("home","Back to all Maths Workshop resources")+'</article>';
}
function renderDefinition(session,d){
 const related=WORKSHOP_LESSONS.filter(l=>l.definitionIds.includes(d.id));
 return '<article class="workshop-definition-detail" data-workshop-definition="'+e(d.id)+'">'+
  action("home","← Back to Maths Workshop")+'<span class="workshop-eyebrow">'+e(d.category)+'</span>'+
  '<h3 tabindex="-1">'+e(d.title)+'</h3><p class="workshop-lead">'+e(d.meaning)+'</p>'+
  (d.notation?'<div class="workshop-formula"><strong>Notation or formula</strong><p>'+e(d.notation)+'</p></div>':"")+
  '<div class="workshop-example"><h4>Quick example</h4><p>'+e(d.example)+'</p></div>'+
  (related.length?'<div class="workshop-section"><h4>Explore this in a worked lesson</h4>'+
   related.map(l=>action("lesson",l.title,'data-workshop-id="'+e(l.id)+'"')).join("")+'</div>':"")+
  '<p class="workshop-caution">Definitions help you understand mathematics; they do not establish that a method suits your question or course.</p></article>';
}
export function renderWorkshop(state,session){
 const course=state?.planning?.fields?.course||state?.project?.course||"";
 const selected=routeIds.has(session.workshopRoute)?session.workshopRoute:"";
 const l=lessonById(session.workshopId),d=definitionById(session.workshopTerm);
 const intro='<div class="workshop-intro">'+
  '<p class="workshop-eyebrow">MATHS WORKSHOP</p>'+
  '<h3>Understand it. Try it. Use it thoughtfully.</h3>'+
  '<p>Find mathematical definitions, practise common IA methods, and learn when software can do the arithmetic. This is an optional learning library.</p>'+
  '<p class="workshop-caution">Course: '+e(course||'not selected')+'. A method appearing here is not a course recommendation or permission to use it. Check syllabus scope with your teacher when necessary.</p></div>';
 const navigation='<div class="workshop-top-actions">'+action("tools","← Tools & tutorials")+
  (l||d?action("home","Browse Workshop"):"")+'</div>';
 if(l)return '<div class="resource-library maths-workshop">'+navigation+renderLesson(session,l)+'</div>';
 if(d)return '<div class="resource-library maths-workshop">'+navigation+renderDefinition(session,d)+'</div>';
 const options=INVESTIGATIVE_ROUTES.map(r=>
  '<option value="'+e(r.id)+'"'+(selected===r.id?' selected':'')+'>'+e(r.title)+'</option>').join("");
 const filters='<div class="workshop-filters">'+
  '<label for="workshop-search">Search mathematics<input id="workshop-search" type="search" maxlength="120" data-resource-filter="workshopQuery" value="'+e(safe(session.workshopQuery))+'" placeholder="e.g. correlation, derivative, sample"></label>'+
  '<label for="workshop-route">Filter by investigative pathway<select id="workshop-route" data-resource-filter="workshopRoute">'+
  '<option value="">All 16 pathways</option>'+options+'</select></label></div>';
 return '<div class="resource-library maths-workshop" data-workshop-home="true">'+navigation+intro+filters+
  '<div id="resource-results">'+workshopList(session)+'</div>'+
  '<p class="workshop-caution">Pathway links are suggested learning resources, not required calculations. Later batches will add the remaining methods.</p></div>';
}
