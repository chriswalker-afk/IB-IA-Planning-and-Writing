import {C_MAJOR_STAGES,completionStage} from '../completing/engine.js';
import {C_NODES} from '../completing/catalog.js';
export const STATUS_LABELS=Object.freeze({'not-started':'Not started',working:'Working on it',complete:'Ready for now','needs-review':'Needs review'});
export const JOURNEY_GROUPS=Object.freeze([
 {id:'plan',name:'Planning',icon:'compass',mode:'planning',role:'PLAN ONLY',description:'Shape your question and possible approach',stages:['plan']},
 {id:'setup',name:'Start writing',icon:'pencil',mode:'writing',role:'WRITE IN IA',description:'Introduction, sources and methods',stages:['C10','C20']},
 {id:'explore',name:'Explore & explain',icon:'chart',mode:'writing',role:'WRITE IN IA',description:'Mathematics, results and interpretation',stages:['C30','C40']},
 {id:'finish',name:'Conclude & review',icon:'flag',mode:'writing',role:'WRITE IN IA',description:'Conclusions, presentation and final checks',stages:['C60','C70','C80','C90']}
]);
export const chapterRole=g=>g.mode==='planning'?'PLAN ONLY':'WRITE IN IA';
const has=v=>typeof v==='string'&&!!v.trim();
export function stageStatus(s,id){
 if(id!=='plan')return Object.hasOwn(STATUS_LABELS,s.completion?.stages?.[id])?s.completion.stages[id]:'not-started';
 if(s.planning?.completed)return 'complete';
 return s.planning?.visited?.length||Object.values(s.planning?.fields||{}).some(has)||has(s.project?.aim)?'working':'not-started';
}
export function groupStatus(s,group){
 const all=group.stages.map(id=>stageStatus(s,id));
 return all.includes('needs-review')?'needs-review':all.every(x=>x==='complete')?'complete':all.some(x=>x!=='not-started')?'working':'not-started';
}
export function resumeRoute(s){
 if(['planning','completing'].includes(s.ui?.lastWorkRoute))return s.ui.lastWorkRoute;
 return s.completion?.visited?.length||s.entries?.length||Object.values(s.scratch||{}).some(has)?'completing':'planning';
}
export function currentGroup(s){
 const route=['planning','completing'].includes(s.route)?s.route:resumeRoute(s);
 if(route==='planning')return JOURNEY_GROUPS[0];
 const realStage=n=>C_NODES.some(x=>x.id===n)?completionStage(n,s):null;
 const recent=[...(s.completion.history||[])].reverse().find(n=>realStage(n));
 const stage=realStage(s.completion.current)||realStage(s.ui?.lastStudioNode)||realStage(recent);
 return JOURNEY_GROUPS.find(g=>g.stages.includes(stage))||JOURNEY_GROUPS.find(g=>g.id==='setup');
}
export function groupTarget(s,g){
 if(g.id==='plan')return 'plan';
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
 if(resumeRoute(s)==='planning')return 'Continue my planning';
 if(s.completion?.current==='C00')return 'Start writing in IA Studio';
 const name=C_NODES.find(n=>n.id===s.completion.current)?.label||'my IA Studio';
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
