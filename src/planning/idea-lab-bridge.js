/**
 * Idea Lab → Planning / Writing · Pass 3.
 *
 * A READ-ONLY bridge from a student-selected, rated Idea Lab possibility.
 * Exploring a bubble is never a selection. Neither this module nor a render
 * function writes an aim, technique, route, method, evidence or completed work.
 * A subsequently revised aim or explicitly selected different Planning route
 * takes precedence over the earlier Idea Lab suggestion.
 */
import {IDEA_TOPICS} from '../ideas/catalog.js';
import {
 ideaMathStarterById,ideaMathLens,ideaMathCoursePreview,ideaMathEvidenceEntry,
 IDEA_DATA_MATH_ENTRYPOINTS,ideaMathEvidenceStarterId
} from '../ideas/math-pathways.js';
import {ideaMapRoot,ideaMapBranches} from '../ideas/mindmap.js';
import {routeById} from './investigative-routes.js';

const same=(a,b)=>String(a||'').trim()===String(b||'').trim();
const trimmed=x=>typeof x==='string'?x.trim():'';

/** Pure provenance lookup. A draft from another branch, an old activity seed,
 * or an unselected idea is not carried into later mathematics suggestions.
 */
export function ideaLabPlanningContext(state){
 const explorer=state?.ideaExplorer||{},id=explorer.selectedId||'';
 const chosen=(Array.isArray(explorer.shortlist)?explorer.shortlist:[])
  .find(x=>x.id===id);
 if(!chosen?.fromMap||!trimmed(chosen.question))return null;
 const seed=ideaMathStarterById(chosen.seedId);
 const route=routeById(seed?.routeId);
 const lens=ideaMathLens(route?.id);
 if(!seed||!route||!lens)return null;
 const p=state?.planning?.fields||{};
 const actualAim=trimmed(p.aim||state?.project?.aim);
 const stale=!actualAim||!same(actualAim,chosen.question);
 const selected=routeById(state?.planning?.routeExplorer?.selectedRoute);
 const superseded=!!selected&&selected.id!==route.id;
 const recorded=chosen.mapOrigin?.mode==='data'?
  ideaMathEvidenceEntry(chosen.mapOrigin.root,chosen.mapOrigin.dataBranch):null;
 const evidenceEntry=recorded?.routeIds.includes(route.id)?recorded:
  IDEA_DATA_MATH_ENTRYPOINTS.find(x=>x.routeIds.includes(route.id)&&
   ideaMathEvidenceStarterId(x.root,x.branch,route.id)===chosen.seedId)||null;
 const sourceRoot=evidenceEntry?ideaMapRoot('data',evidenceEntry.root):null;
 const sourceBranch=evidenceEntry?ideaMapBranches(sourceRoot).find(x=>x.id===evidenceEntry.branch):null;
 const topic=IDEA_TOPICS.find(x=>x.id===seed.topic);
 const sourceLabel=evidenceEntry?[sourceRoot?.label,sourceBranch?.label].filter(Boolean).join(' → '):
  topic?.label||'A personal context';
 const course=trimmed(p.course||state?.project?.course);
 const coursePreview=ideaMathCoursePreview({routeId:route.id,review:seed.review},course);
 const kind=trimmed(p.kind);
 const kindReview=!!kind&&kind!=='unsure'&&route.kinds.length>0&&!route.kinds.includes(kind);
 const source=trimmed(p.dataSource);
 const evidenceReview=!!evidenceEntry&&!!source&&
  (evidenceEntry.root==='find'&&source==='primary'||
   evidenceEntry.root!=='find'&&source==='secondary');
 return Object.freeze({
  seedId:seed.id,routeId:route.id,routeTitle:route.title,lensLabel:lens.label,
  title:seed.title,focus:trimmed(chosen.focus),sourceLabel,first:seed.first,
  evidence:seed.material,caution:seed.caution,personalise:seed.narrow,
  initialQuestion:seed.question,selectedAim:chosen.question,
  status:stale?'outdated':superseded?'superseded':'current',
  selectedPlanningRoute:selected?.id||'',selectedPlanningTitle:selected?.title||'',
  hasPlannedRoute:!!selected,course,coursePreview,kindReview,evidenceReview,
  evidenceKind:evidenceEntry?(evidenceEntry.root==='find'?'secondary':'primary'):'both',
  evidenceEntryId:evidenceEntry?.id||'',
  needsPermission:evidenceEntry?.id==='record.survey'||evidenceEntry?.id==='find.image'
 });
}

const safetyText=(x)=>x.evidenceEntryId==='record.survey'?
 'Before any survey, check school permission, informed consent, privacy and the people your sample could represent. Do not collect identifiable information.':
 x.evidenceEntryId==='find.image'?
 'Check permission to use the image or recording, and whether scale, viewpoint and timestamps can actually be established.':
 '';
const shell=(kind,inner)=>'<aside class="idea-lab-handoff idea-lab-handoff-'+kind+
 '" data-idea-lab-handoff="'+kind+'" aria-label="Earlier Idea Lab direction">'+inner+'</aside>';
const revisitButton=()=>'<button type="button" class="idea-lab-handoff-link" data-action="plan-edit" data-node="N00B">Revisit Idea Lab</button>';

/**
 * Placement is strictly contextual: maths choice, evidence collection,
 * planned first move, or the provisional review. Advice only; no form fields.
 */
export function renderIdeaLabPlanningCue(state,placement,{e,icon}){
 const ctx=ideaLabPlanningContext(state);
 if(!ctx||!['maths','evidence','first','review'].includes(placement))return '';
 const reduced=state?.ui?.adviceMode==='reduced';
 if(ctx.status==='outdated'){
  if(reduced||placement!=='maths')return '';
  return shell('outdated','<span class="idea-lab-handoff-kicker">'+icon('info')+
   ' EARLIER IDEA LAB THOUGHT</span>'+
   '<p>You have since revised your investigation aim. The mathematical direction explored earlier ('+
   e(ctx.lensLabel)+') is not being recommended automatically for your current question.</p>'+
   revisitButton());
 }
 if(ctx.status==='superseded'){
  if(reduced||placement!=='maths')return '';
  return shell('superseded','<span class="idea-lab-handoff-kicker">'+icon('route')+
   ' YOUR ROUTE HAS CHANGED</span><p>Idea Lab suggested <strong>'+
   e(ctx.lensLabel)+'</strong>, but you subsequently saved <strong>'+
   e(ctx.selectedPlanningTitle)+'</strong> in Planning. Your later explicit choice takes priority.</p>');
 }
 if(placement==='maths'){
  return shell('maths',
   '<span class="idea-lab-handoff-kicker">'+icon('sparkles')+' FROM YOUR SELECTED IDEA LAB POSSIBILITY</span>'+
   '<h4>'+e(ctx.sourceLabel)+' → '+e(ctx.lensLabel)+'</h4>'+
   '<p>This mathematical direction came from your chosen possible aim. It is <strong>not</strong> a selected technique or confirmed investigative route.</p>'+
   (!reduced?'<p><strong>One first calculation or representation to consider:</strong> '+e(ctx.first)+'</p>'+
    '<p><strong>Evidence to check:</strong> '+e(ctx.evidence)+'</p>'+
    (ctx.kindReview?'<p class="idea-lab-handoff-caution">The investigation type you selected may not match this route. Reconsider rather than forcing the mathematics.</p>':'')+
    (ctx.evidenceReview?'<p class="idea-lab-handoff-caution">Your current evidence-source choice differs from the earlier Idea Lab starting material. Check what you can actually obtain.</p>':'')+
    (ctx.coursePreview?.teacherReview?'<p class="idea-lab-handoff-caution">Teacher check recommended: the course, scope or mathematical depth is not confirmed.</p>':''):'')+
   '<div class="idea-lab-handoff-actions">'+
   (ctx.hasPlannedRoute?'<span class="idea-lab-handoff-status">You have explicitly saved this route provisionally in Planning.</span>':
    '<button type="button" class="idea-lab-handoff-link" data-action="math-open-route" data-route-id="'+e(ctx.routeId)+'">'+
    'Explore this route (does not select it) '+icon('arrow-right')+'</button>')+
   '</div>');
 }
 if(placement==='evidence'){
  // Evidence from a data-first seed is relevant to primary or secondary steps
  // respectively; don't recommend a public dataset as primary observations.
  const node=state?.planning?.current||'';
  if((node==='N03P'||node==='N03P2')&&ctx.evidenceKind==='secondary'||
     node==='N03S'&&ctx.evidenceKind==='primary')return '';
  const safety=safetyText(ctx);
  if(reduced&&!safety)return '';
  return shell('evidence',
   '<span class="idea-lab-handoff-kicker">'+icon('clipboard-check')+' IDEA LAB · CHECK YOUR EVIDENCE</span>'+
   (!reduced?'<p><strong>Earlier evidence possibility:</strong> '+e(ctx.evidence)+'</p>'+
    '<p>Can you actually access it, identify its units and limitations, and use it to answer your current aim?</p>':'')+
   (ctx.evidenceReview&&!reduced?'<p class="idea-lab-handoff-caution">You have chosen a different evidence route in Planning. Verify it before relying on this earlier idea.</p>':'')+
   (safety?'<p class="idea-lab-handoff-caution" role="note">'+icon('info')+' '+e(safety)+'</p>':'')+
   (!reduced?'<p class="idea-lab-handoff-disclaimer">This is a possible source, not evidence you have collected or verified.</p>':''));
 }
 if(placement==='first'){
  if(reduced)return '';
  return shell('first',
   '<span class="idea-lab-handoff-kicker">'+icon('target')+' EARLIER MATHEMATICAL FIRST MOVE</span>'+
   '<p><strong>'+e(ctx.lensLabel)+':</strong> '+e(ctx.first)+'</p>'+
   '<p>Try this only if it still serves your current aim and real evidence. An initial idea does not establish which method your data will justify.</p>'+
   '<p class="idea-lab-handoff-disclaimer">No mathematical work has been completed or selected by this reminder.</p>');
 }
 if(reduced)return '';
 return shell('review','<span class="idea-lab-handoff-kicker">'+icon('compass')+
  ' IDEA LAB THREAD · PROVISIONAL</span>'+
  '<p>Earlier question explored: <strong>'+e(ctx.lensLabel)+'</strong> ('+e(ctx.sourceLabel)+
  '). It remains a possibility, not a confirmed technique or result. '+
  (ctx.hasPlannedRoute?'You subsequently chose a provisional route in Planning.':
   'No investigative route has been saved from this suggestion.')+
  '</p>');
}

/** Optional writing reminder only when no later route/technique supersedes it.
 * The real-result branching engine deliberately does not import this bridge.
 */
export function renderIdeaLabWritingCue(state,{e,icon,reduced=false}={}){
 if(reduced||state?.ui?.adviceMode==='reduced')return '';
 const ctx=ideaLabPlanningContext(state);
 if(!ctx||ctx.status!=='current'||ctx.hasPlannedRoute||
   (state?.planning?.mathSelected||[]).length>0)return '';
 return shell('writing','<span class="idea-lab-handoff-kicker">'+icon('compass')+
  ' FROM IDEA LAB · AN EARLIER POSSIBILITY</span>'+
  '<p>You considered <strong>'+e(ctx.lensLabel)+'</strong> when choosing your question. '+
  'Decide from the evidence and mathematics you <strong>actually use</strong> whether it still helps. '+
  'Do not describe this first-step suggestion as a calculation or finding.</p>');
}
