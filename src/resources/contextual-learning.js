/** Context-specific resource bridge for Help & Tips, focused I am stuck, and
 * Tools & tutorials. Use only the explicitly selected route/method and the
 * registered help spot: NEVER infer a method from student prose or a graph.
 *
 * A resource suggestion is optional learning support, not IA content,
 * approval, a calculated result, or completion evidence.
 */
import {contextualWorkshopHelp,renderContextualWorkshopHelp} from '../help/workshop-help.js';
import {resourceContext,resourceSuggestions} from './context.js';
import {resourceById} from './catalog.js';
import {lessonById} from '../workshop/catalog.js';
import {representationTool,activeRepresentationTool} from '../diagrams/representation-registry.js';
import {completeEntry,sourceResultForNext} from '../completing/engine.js';

const NEEDS_TEACHER=/(?:course-depth|course-choice|out-of-course|method-conditions|teacher-specific)/;
const otherWork=/^C(?:10|60|61|62|63|64|70|80|90)/;
const real=e=>e?.status==='completed'&&!!e?.result?.trim();
const string=v=>typeof v==='string'?v.slice(0,120):'';
const recordedEntry=state=>{
 if(state?.route!=='completing')return null;
 const node=string(state.completion?.current);
 if(!/^C(?:3[0-5]|40|50)/.test(node))return null;
 return /^C35/.test(node)?sourceResultForNext(state):completeEntry(state);
};
const area=spot=>{
 const name=string(spot).split(':');
 if(name.length>1&&/^[NC]\d\d/.test(name[0]))return name.slice(1).join(':');
 return string(spot);
};
const pictureSpot=spot=>/(?:part:show|field:(?:result|firstWorkResult|figure|diagram|calculation|technologyOutcome)|technology|diagram)/i.test(area(spot));
/** Teaching aid selection must be driven by a recorded technique or a
 * specific data/task box, not by the route's attractive example method.
 */
export function contextualLearningChoices(state,{spot='page',issueId=''}={}){
 const issue=string(issueId),location=area(spot),h=contextualWorkshopHelp(state,{spot,issueId:issue});
 if(!h)return null;
 const planning=state.route==='planning',node=planning?string(state.planning?.current):string(state.completion?.current);
 if(!planning&&otherWork.test(node))return null;
 const entry=recordedEntry(state),method=string(entry?.methodId),actual=real(entry);
 const theoretical=state.planning?.fields?.kind==='theoretical'||state.planning?.fields?.dataSource==='theoretical';
 const needsConsent=state.teacher?.pendingApproval===true||
  ['pending','unsure'].includes(state.completion?.fields?.permissionStatus)||
  ['yes','unsure'].includes(state.planning?.fields?.permissionNeed);
 const lesson=lessonById(h.lessonId),teacherCheck=NEEDS_TEACHER.test(issue);
 const preferences=resourceContext(state).tool;
 let guideId='';
 // Reading a path example is not a reason to recommend its calculation.
 if(!teacherCheck&&h.focus==='sampling'){
  if(!theoretical&&!needsConsent&&state.planning.fields.dataSource==='primary')guideId='forms';
  else if(!theoretical&&state.planning.fields.dataSource==='secondary')guideId='secondary-data';
 }else if(!teacherCheck&&h.focus==='precision'){
  if(!theoretical)guideId='reporting-precision';
 }else if(!teacherCheck&&h.focus==='proof'){
  if(h.routeId==='proof'&&['C30','C31','C40','C50'].includes(node))guideId='proof-exploration';
 }else if(!teacherCheck&&method&&method!=='other'&&entry&&!planning){
  const guides=resourceSuggestions(state).filter(x=>x.id!=='chart-choice'&&x.id!=='export-figure'&&x.id!=='desmos-start');
  if(h.focus==='calculate'&&!actual){
   if(method==='pmcc')guideId=preferences==='desmos'?'desmos-pmcc':'sheets-pmcc';
   else guideId=guides.find(g=>g.id===lesson?.existingGuide||lesson?.relatedGuides?.includes(g.id))?.id||
    (lesson?.existingGuide&&resourceById(lesson.existingGuide)?lesson.existingGuide:'');
  }
  if(h.focus==='interpret'&&actual)guideId=guides.find(g=>['pmcc-meaning','model-check'].includes(g.id))?.id||'';
  if(h.focus==='follow'&&actual)guideId=guides.find(g=>g.id==='model-check')?.id||'';
 }
 // Figures are only surfaced where the student is doing a diagram or
 // showing mathematics, after a route/method/creator is explicitly chosen.
 let creatorId='';
 const explicit=!!h.routeId&&(!!entry?.methodId&&entry.methodId!=='other'||
  !!state?.planning?.routeExplorer?.selectedRoute||
  node==='C31'&&!!activeRepresentationTool(state));
 if(!planning&&['C30','C31','C40','C50'].includes(node)&&
   (node==='C31'||pictureSpot(location))&&explicit&&!teacherCheck&&!needsConsent){
  creatorId=activeRepresentationTool(state)?.id||lesson?.creator||'';
  if(!representationTool(creatorId))creatorId='';
 }
 const guide=resourceById(guideId)||null,creator=representationTool(creatorId);
 if(!guide&&!creator&&!h.termId&&!h.lessonId)return null;
 return Object.freeze({...h,guideId:guide?.id||'',guideTitle:guide?.title||'',
  creatorId:creator?.id||'',creatorTitle:creator?.title||'',
  spot:location,reason:location.startsWith('field:')?'this writing box':
   location.startsWith('part:')?'this mathematical stage':'your current task'});
}
/** The existing Workshop card is the single mathematical guidance surface.
 * At most one extra practical action appears below it. */
export function renderContextualLearningHelp(state,escapeHtml,{spot='page',issueId='',compact=true}={}){
 const h=contextualLearningChoices(state,{spot,issueId});if(!h)return '';
 const e=escapeHtml;
 const original=renderContextualWorkshopHelp(h,e,{compact});
 const button=h.guideId?
  '<button type="button" class="btn btn-secondary" data-action="resource-open" data-resource-id="'+e(h.guideId)+
   '" data-resource-help="true" data-resource-spot="'+e(string(spot))+
   '" data-resource-issue="'+e(string(issueId))+'">Software / task steps: '+e(h.guideTitle)+'</button>':
  h.creatorId?'<button type="button" class="btn btn-secondary" data-action="resource-creator-open" data-resource-creator="'+
   e(h.creatorId)+'">Optional creator: '+e(h.creatorTitle)+'</button>':'';
 return '<div class="resource-contextual-learning" data-resource-context-reason="'+e(h.reason)+'">'+original+
  (button?'<div class="resource-contextual-practical"><span>Also useful for '+e(h.reason)+'</span>'+button+'</div>':'')+
  '</div>';
}
