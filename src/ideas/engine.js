import {IDEA_SEEDS,IDEA_TOPICS,IDEA_CHECKS,seedById,OWN_PROMPT} from './catalog.js';
import {createIdeaState,cleanDraft,MAX_IDEAS} from './state.js';
import {planningMove,setPlanCurrent} from '../planning/engine.js';
const clone=v=>JSON.parse(JSON.stringify(v));
export function ideaState(state){return state.ideaExplorer||(state.ideaExplorer=createIdeaState());}
export function currentSeed(state){return seedById(ideaState(state).active)||OWN_PROMPT;}
export function ideaChoices(state){
 const s=ideaState(state);
 if(s.topic==='other')return {items:[],total:0};
 let candidates=IDEA_SEEDS.filter(x=>!s.topic||x.topic===s.topic);
 if(!s.topic){ // Interleave categories, rather than show three of the same interest.
  candidates=IDEA_TOPICS.flatMap((_,i)=>IDEA_TOPICS.map(t=>IDEA_SEEDS.filter(x=>x.topic===t.id)[i])).filter(Boolean);
 }
 if(s.subtopic)candidates=[...candidates.filter(x=>x.tags.includes(s.subtopic)),...candidates.filter(x=>!x.tags.includes(s.subtopic))];
 const start=s.offset%candidates.length;
 return {items:[...candidates.slice(start),...candidates.slice(0,start)].slice(0,3),total:candidates.length};
}
export function beginIdea(state,id){
 const s=ideaState(state),seed=id==='own'?OWN_PROMPT:seedById(id);if(!seed)return false;
 if(!s.drafts[id])s.drafts[id]=cleanDraft({seedId:id,question:seed.question,focus:s.focus||s.subtopic});
 s.active=id;s.pending=null;return true;
}
export function ideaInput(state,key,value,{savedId=''}={}){
 const s=ideaState(state),text=String(value??'');
 if(key==='focus'){s.focus=text.slice(0,160);return true;}
 const d=savedId?s.shortlist.find(c=>c.id===savedId):s.drafts[s.active];if(!d)return false;
 if(['question','detail','trialNote'].includes(key)){d[key]=text.slice(0,1600);s.pending=null;return true;}
 if(key==='trialStatus'&&['','workable','adjust','possible'].includes(text)){d[key]=text;return true;}
 if(IDEA_CHECKS.some(c=>c.id===key)&&['','yes','maybe','no'].includes(text)){d.checks[key]=text;return true;}
 return false;
}
export function chooseTopic(state,id){
 if(!['','other',...IDEA_TOPICS.map(t=>t.id)].includes(id))return false;
 const s=ideaState(state);s.topic=id;s.subtopic='';s.offset=0;s.active='';s.pending=null;return true;
}
export function saveIdea(state,{asNew=false}={}){
 const s=ideaState(state),d=s.drafts[s.active];
 if(!d?.question.trim())return {ok:false,error:'Write a possible direction, or edit the suggested starting point first.'};
 const existing=asNew?null:s.shortlist.find(x=>x.id===d.savedId);
 if(!existing&&s.shortlist.length>=MAX_IDEAS)return {ok:false,error:'Your shortlist already has three ideas. Compare them or remove one before saving another. Your draft is still here.'};
 const value={...clone(d),id:existing?.id||'idea-'+s.nextId++};
 if(existing)s.shortlist[s.shortlist.indexOf(existing)]=value;else s.shortlist.push(value);
 d.savedId=value.id;
 return {ok:true,message:existing?'Saved possibility updated. Your current plan is unchanged.':'Possibility saved. Your current plan is unchanged.'};
}
function origin(state){return {idea:state.planning.fields.idea,aim:state.planning.fields.aim,projectIdea:state.project.idea,projectAim:state.project.aim};}
function applyIdea(state,d){
 const f=state.planning.fields,s=ideaState(state),before=f.idea||state.project.idea;
 if(before!==d.question){
  s.history.push({before,after:d.question,aimAtChoice:f.aim||state.project.aim,at:new Date().toISOString()});s.history=s.history.slice(-50);
  if(!f.originalIdea)f.originalIdea=before||d.question;
  f.idea=d.question;state.project.idea=d.question;
  state.planning.completed=false;
  state.handover.confirmedAt='';state.handover.needsReview=true;
  // A changed topic needs review, not rewritten results or invented approval.
  if(state.entries.length)for(const key of ['C10','C40','C60'])if(state.completion.stages[key]==='complete')state.completion.stages[key]='needs-review';
 }
 f.ideaStatus='yes';state.project.ideaStatus='yes';s.pending=null;
 state.planning.notices=[f.aim?'Your idea is selected. The existing aim is unchanged: refine it only as needed. Earlier work has been retained.':'Your idea is selected. Develop its provisional aim next. No method, source or result has been selected for you.'];
 const node=state.planning.current;
 const move=['N00B','N00C'].includes(node)?planningMove(state,node==='N00B'?'Ready with one idea':'Selected one idea'):setPlanCurrent(state,'N01');
 return {...move,navigate:true};
}
export function requestIdeaUse(state,savedId='',candidate=null){
 const s=ideaState(state),d=candidate||(savedId?s.shortlist.find(x=>x.id===savedId):s.drafts[s.active]);
 if(!d?.question.trim())return{ok:false,error:'Write a possible direction first. No other field is required.'};
 const old=origin(state);
 if((old.idea||old.projectIdea)&&d.question!==(old.idea||old.projectIdea)||old.aim||old.projectAim||state.entries.length){s.pending={draft:clone(d),origin:old};return{ok:true,render:true,focus:'idea-confirm-heading'};}
 return applyIdea(state,d);
}
export function confirmIdeaUse(state){
 const s=ideaState(state),p=s.pending;if(!p)return{ok:false,error:'Choose the idea you want to develop before confirming.'};
 if(JSON.stringify(p.origin)!==JSON.stringify(origin(state))){s.pending=null;return{ok:false,error:'Your current plan changed. Review the idea again before replacing it.'};}
 return applyIdea(state,p.draft);
}
/** Only handles explicit Idea Explorer controls. Browsing never writes planning answers. */
export function ideaAction(state,action,data={}){
 if(!action.startsWith('idea-'))return null;
 if(state.route!=='planning'||!['N00B','N00C'].includes(state.planning.current))return {ok:false,error:'Open the optional Idea Explorer from Planning first.'};
 const s=ideaState(state);
 switch(action){
  case 'idea-explore':if(!beginIdea(state,data.seed))return{ok:false,error:'That starting direction is unavailable.'};return{ok:true,render:true,focus:'idea-detail-heading'};
  case 'idea-own':beginIdea(state,'own');setPlanCurrent(state,'N00B');return{ok:true,render:true,focus:'idea-question'};
  case 'idea-browse':s.active='';s.pending=null;setPlanCurrent(state,'N00B');return{ok:true,render:true,focus:'idea-topic'};
  case 'idea-subtopic':if(!IDEA_TOPICS.find(t=>t.id===s.topic)?.subtopics.includes(data.subtopic))return{ok:false,error:'Choose one of the available subtopics.'};s.subtopic=s.subtopic===data.subtopic?'':data.subtopic;s.offset=0;return{ok:true,render:true,focus:'idea-subtopic-'+IDEA_TOPICS.find(t=>t.id===s.topic).subtopics.indexOf(data.subtopic)};
  case 'idea-more':{const c=ideaChoices(state);if(c.total)s.offset=(s.offset+3)%c.total;return{ok:true,render:true,focus:'idea-directions-heading'};}
  case 'idea-angle':{const seed=currentSeed(state),pool=IDEA_SEEDS.filter(x=>x.topic===seed.topic);if(!pool.length)return{ok:true};beginIdea(state,pool[(pool.findIndex(x=>x.id===seed.id)+1)%pool.length].id);return{ok:true,render:true,focus:'idea-detail-heading'};}
  case 'idea-save-copy':return {...saveIdea(state,{asNew:true}),render:true,focus:'idea-save-status'};
  case 'idea-legacy':{const f=state.planning.fields;if(!['idea','originalIdea','otherIdea1','otherIdea2'].includes(data.key)||!f[data.key]?.trim())return{ok:false,error:'That earlier idea is unavailable.'};return requestIdeaUse(state,'',cleanDraft({seedId:'own',question:f[data.key]}));}
  case 'idea-save':return {...saveIdea(state),render:true,focus:'idea-save-status'};
  case 'idea-compare':s.pending=null;if(state.planning.current==='N00B')planningMove(state,'I brainstormed possible ideas');return{ok:true,render:true,focus:'idea-compare-heading'};
  case 'idea-edit-saved':{const d=s.shortlist.find(x=>x.id===data.id);if(!d)return{ok:false,error:'That saved possibility is no longer here.'};s.drafts[d.seedId]=cleanDraft({...d,savedId:d.id});s.active=d.seedId;s.pending=null;setPlanCurrent(state,'N00B');return{ok:true,render:true,focus:'idea-question'};}
  case 'idea-remove':s.shortlist=s.shortlist.filter(x=>x.id!==data.id);s.pending=null;return{ok:true,render:true,focus:'idea-compare-heading',message:'Removed from the shortlist. Your current plan is unchanged.'};
  case 'idea-use':return requestIdeaUse(state,data.id||'');
  case 'idea-confirm':return confirmIdeaUse(state);
  case 'idea-cancel':s.pending=null;return{ok:true,render:true,focus:state.planning.current==='N00C'?'idea-compare-heading':'idea-detail-heading'};
  case 'idea-keep':{if(!(state.planning.fields.idea||state.project.idea).trim())return{ok:false,error:'There is no current idea yet. Write your own or explore a direction.'};s.pending=null;return{...planningMove(state,state.planning.current==='N00B'?'Ready with one idea':'Keep original idea'),navigate:true};}
  default:return{ok:false,error:'That idea action is unavailable.'};
 }
}
