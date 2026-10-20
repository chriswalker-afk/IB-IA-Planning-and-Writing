import {C_MAJOR_STAGES,completionStage} from '../completing/engine.js';
import {C_NODES} from '../completing/catalog.js';
import {reviewChecksFor} from '../completing/review.js';
export const STATUS_LABELS=Object.freeze({'not-started':'Not started',working:'Working on it',complete:'Ready for now','needs-review':'Needs review'});
export const JOURNEY_GROUPS=Object.freeze([
 {id:'plan',name:'Planning',icon:'compass',mode:'planning',role:'PLAN ONLY',description:'Aim, mathematical pathways, data or theory, sampling and accuracy',stages:['plan']},
 {id:'setup',name:'Start writing',icon:'pencil',mode:'writing',role:'WRITE IN IA',description:'Introduction, evidence choices and first mathematical method',stages:['C10','C20']},
 {id:'explore',name:'Explore & explain',icon:'chart',mode:'writing',role:'WRITE IN IA',description:'Linked mathematical stages, diagrams, calculations and interpretation',stages:['C30','C40']},
 {id:'finish',name:'Conclude & next steps',icon:'flag',mode:'writing',role:'WRITE IN IA',description:'Answer your mathematical aim, reflect on meaningful limitations and consider worthwhile next steps',stages:['C60']},
 {id:'check',name:'Check your IA',icon:'clipboard',mode:'checking',role:'CHECK YOUR IA',description:'Review the real document against Criteria A–E, track feedback and check final readiness',stages:['C70','C80','C90']}
]);
export const chapterRole=g=>g.mode==='planning'?'PLAN ONLY':g.mode==='checking'?'CHECK YOUR IA':'WRITE IN IA';
const has=v=>typeof v==='string'&&!!v.trim();
export function planningMilestones(s){
 const p=s?.planning?.fields||{};
 return [
  {name:'Working title',recorded:has(p.provisionalTitle),detail:'A provisional IA title has been saved, not finalised'},
  {name:'My question',recorded:has(p.aim||s.project?.aim),detail:'An investigation aim is recorded'},
  {name:'Starting material',recorded:has(p.kind==='theoretical'?(p.theoreticalCase||p.theoreticalObject):(p.dataSource||p.primaryWhat||p.secondaryUrl)),detail:'A proposed evidence or theoretical starting route is recorded'},
  {name:'Mathematical direction',recorded:has(p.course)&&has(p.kind),detail:'A course and investigation approach have been chosen; this is not completed mathematics'},
  {name:'Review my plan',recorded:s?.planning?.completed===true,detail:'The provisional planning review is marked ready'}
 ];
}
const isActual=e=>e?.status==='completed'&&has(e.result);
/** One entry per mathematical writing page. Never count a saved diagram alone as a result. */
export function mathematicalPages(s){
 const entries=Array.isArray(s?.entries)?s.entries:[],
  firsts=entries.map((entry,index)=>({entry,index})).filter(x=>x.entry?.phase==='first'),
  later=entries.map((entry,index)=>({entry,index})).filter(x=>x.entry?.phase==='substantial');
 const pages=[];
 // Several saved first representations still belong to the SAME first
 // four-part writing page, so they must not become fictitious extra stages.
 if(firsts.length){
  const current=firsts.find(x=>x.index===s.completion?.activeEntryIndex)||firsts.at(-1);
  pages.push({entry:current.entry,index:current.index,
   recordIndices:firsts.map(x=>x.index),stage:1,label:'First mathematics',
   status:firsts.some(x=>x.entry.reviewNeeded==='yes')?'needs-review':
    firsts.every(x=>isActual(x.entry))?'complete':'working'});
 }
 later.forEach(({entry,index},i)=>pages.push({
  entry,index,recordIndices:[index],stage:i+2,label:'Mathematical stage '+(i+2),
  status:entry.reviewNeeded==='yes'?'needs-review':isActual(entry)?'complete':'working'
 }));
 return pages;
}
export function mathematicalChapterSummary(s){
 const pages=mathematicalPages(s),
  ready=pages.filter(p=>p.status==='complete').length,
  review=pages.filter(p=>p.status==='needs-review').length,
  actualResults=(Array.isArray(s?.entries)?s.entries:[])
   .filter(x=>x&&['first','substantial'].includes(x.phase)&&isActual(x)).length;
 return {pages,ready,review,pending:pages.length-ready-review,actualResults};
}
export function chapterProgressCopy(s,group){
 if(group.id==='plan'){
  const milestones=planningMilestones(s),saved=milestones.filter(x=>x.recorded).length;
  return saved+' of '+milestones.length+' planning anchors saved';
 }
 if(group.id==='setup')return 'Introduction · introduce first mathematics';
 if(group.id==='explore'){
  const {pages,actualResults,review}=mathematicalChapterSummary(s);
  if(!pages.length)return 'First mathematics, then further stages if useful';
  return pages.length+' mathematical '+(pages.length===1?'stage':'stages')+
   ' · '+actualResults+' actual '+(actualResults===1?'result':'results')+
   (review?' · '+review+' to review':'');
 }
 if(group.id==='finish')return 'Conclusion · interpretation · potential next steps';
 const states=checkingMilestones(s);
 const n=states.reduce((acc,x)=>acc+x.done,0);
 return n?n+' student checks resolved · draft · feedback · final':'A–E checklist · draft · feedback · final';
}
export function checkingMilestones(s){
 const labels={draft:'Teacher draft',feedback:'Feedback & revisions',final:'Final check'};
 return ['draft','feedback','final'].map(mode=>{
  const rows=reviewChecksFor(s,mode),states=rows.map(x=>s.completion?.review?.records?.[mode+'-'+x.id]?.status||'unchecked');
  const done=states.filter(x=>x==='checked'||x==='not-applicable').length;
  const problems=states.filter(x=>x==='needs-work').length;
  const started=states.some(x=>x!=='unchecked')||
   (mode==='feedback'&&(s.completion?.review?.feedbackItems||[]).length>0);
  return {mode,name:labels[mode],done,total:rows.length,
   status:problems?'needs-review':done===rows.length&&done>0?'complete':started?'working':'not-started'};
 });
}
export function stageStatus(s,id){
 if(id!=='plan')return Object.hasOwn(STATUS_LABELS,s.completion?.stages?.[id])?s.completion.stages[id]:'not-started';
 if(s.planning?.completed)return 'complete';
 return s.planning?.visited?.length||Object.values(s.planning?.fields||{}).some(has)||has(s.project?.aim)?'working':'not-started';
}
export function groupStatus(s,group){
 if(group.id==='check'){
  const milestones=checkingMilestones(s),all=milestones.map(x=>x.status),
   stageStatuses=group.stages.map(id=>stageStatus(s,id));
  if(all.includes('needs-review')||stageStatuses.includes('needs-review'))return 'needs-review';
  if(all.every(x=>x==='complete'))return 'complete'; // The new checklist itself is the progress source.
  return all.some(x=>x!=='not-started')||stageStatuses.some(x=>x!=='not-started')?'working':'not-started';
 }
 const all=group.stages.map(id=>stageStatus(s,id));
 if(group.id==='explore'){
  const {pages,review}=mathematicalChapterSummary(s);
  if(review||all.includes('needs-review'))return 'needs-review';
  if(!pages.length)return all.some(x=>x!=='not-started')?'working':'not-started';
  // A student may mark the chapter ready for now, but only when the
  // recorded mathematical stages contain genuine, confirmed results.
  const hasFirst=pages.some(p=>p.entry.phase==='first');
  const hasLater=pages.some(p=>p.entry.phase==='substantial');
  const firstReady=!hasFirst||stageStatus(s,'C30')==='complete';
  const furtherReady=!hasLater||stageStatus(s,'C40')==='complete';
  return pages.every(p=>p.status==='complete')&&firstReady&&furtherReady?'complete':'working';
 }
 return all.includes('needs-review')?'needs-review':all.every(x=>x==='complete')?'complete':all.some(x=>x!=='not-started')?'working':'not-started';
}
export function resumeRoute(s){
 if(['planning','completing','checking'].includes(s.ui?.lastWorkRoute))return s.ui.lastWorkRoute;
 return s.completion?.visited?.length||s.entries?.length||Object.values(s.scratch||{}).some(has)?'completing':'planning';
}
export function currentGroup(s){
 const route=['planning','completing','checking'].includes(s.route)?s.route:resumeRoute(s);
 if(route==='planning')return JOURNEY_GROUPS[0];
 if(route==='checking')return JOURNEY_GROUPS.find(g=>g.id==='check');
 const realStage=n=>C_NODES.some(x=>x.id===n)?completionStage(n,s):null;
 const recent=[...(s.completion.history||[])].reverse().find(n=>realStage(n));
 const stage=realStage(s.completion.current)||realStage(s.ui?.lastStudioNode)||realStage(recent);
 return JOURNEY_GROUPS.find(g=>g.stages.includes(stage))||JOURNEY_GROUPS.find(g=>g.id==='setup');
}
export function groupTarget(s,g){
 if(g.id==='plan')return 'plan';
 if(g.id==='check')return 'checking';
 if(g.id==='explore'){
  // C50 is the repeatable later-page view; a generic C40 target loses its
  // place in the investigation after students have added Stage 3 or beyond.
  if(['C30','C40','C50'].includes(s.completion?.current)&&s.route==='completing')
   return s.completion.current;
  const pages=mathematicalPages(s);
  const active=pages.find(p=>p.recordIndices.includes(s.completion?.activeEntryIndex));
  const latest=active||pages.at(-1);
  return latest?.entry.phase==='substantial'?(latest.stage>2?'C50':'C40'):'C30';
 }
 // First entry through Chapter 2 should explain what changes when writing starts.
 // Anyone who has already begun Set up resumes their actual work instead.
 if(g.id==='setup'&&!s.completion.visited.some(id=>['C10','C20','C21S','C21M','C21T','C22','C23','C24','C25','C26'].includes(id))&&
  s.completion.stages.C10==='not-started'&&s.completion.stages.C20==='not-started')
  return 'C00';
 const stage=completionStage(s.completion.current,s);
 return g.stages.find(id=>stageStatus(s,id)==='needs-review')||
  (g.stages.includes(stage)?stage:g.stages.find(id=>stageStatus(s,id)!=='complete')||g.stages[0]);
}
export function resumeLabel(s){
 if(resumeRoute(s)==='checking')return 'Continue checking my IA';
 if(resumeRoute(s)==='planning')return 'Continue my planning';
 if(s.completion?.current==='C00')return 'Start writing in IA Studio';
 const name=s.completion.current==='C20'?'Introducing your first mathematics':C_NODES.find(n=>n.id===s.completion.current)?.label||'my IA Studio';
 return 'Continue: '+(name.length>65?name.slice(0,62)+'...':name);
}
export function rememberCheckpoint(s,title,detail,node='',entryId=''){
 Object.assign(s.ui,{latestTitle:String(title).slice(0,180),latestDetail:String(detail).slice(0,360),latestNode:node,latestEntry:entryId,latestAt:new Date().toISOString()});
}
export function latestCheckpoint(s){
 const ui=s.ui||{};
 if(!ui.latestTitle)return null;
 const stage=C_MAJOR_STAGES.find(x=>x.id===ui.latestNode);
 if(stage&&stageStatus(s,stage.id)==='needs-review')return {title:stage.name+' is ready to revisit',detail:'Your earlier work is still here. Check it against the changes you have made.'};
 const entry=s.entries.find(x=>x.id===ui.latestEntry);
 if(entry?.reviewNeeded==='yes')return {title:'A mathematical connection needs another look',detail:'Changing your approach is part of the investigation. Your results and notes are preserved.'};
 return {title:ui.latestTitle,detail:ui.latestDetail};
}
