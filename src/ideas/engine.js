import {IDEA_SEEDS,IDEA_TOPICS,IDEA_CHECKS,IDEA_DIFFICULTIES,seedById,OWN_PROMPT} from './catalog.js';
import {createIdeaState,cleanDraft,MAX_IDEAS} from './state.js';
import {ideaMapRoot,ideaMapTopics,ideaMapBranches,ideaMapIdeas} from './mindmap.js';
import {planningMove,setPlanCurrent,applyPlanningField} from '../planning/engine.js';
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
export function beginIdea(state,id,{fromMap=false,fresh=false}={}){
 const s=ideaState(state),seed=id==='own'?OWN_PROMPT:seedById(id);if(!seed)return false;
 if(fresh||!s.drafts[id])s.drafts[id]=cleanDraft({seedId:id,question:fromMap?'':seed.question,focus:s.focus||s.map?.subtopic||s.subtopic,fromMap});
 else if(fromMap)s.drafts[id].fromMap=true;
 s.active=id;s.pending=null;return true;
}
export function ideaInput(state,key,value,{savedId=''}={}){
 const s=ideaState(state),text=String(value??'');
 if(key==='focus'){s.focus=text.slice(0,160);return true;}
 const d=savedId?s.shortlist.find(c=>c.id===savedId):s.drafts[s.active];if(!d)return false;
 if(['question','detail','trialNote'].includes(key)){d[key]=text.slice(0,1600);s.pending=null;return true;}
 if(['clarity','quickStart'].includes(key)&&/^[1-5]$/.test(text)){d[key]=Number(text);s.pending=null;return true;}
 if(key==='trialStatus'&&['','workable','adjust','possible'].includes(text)){d[key]=text;return true;}
 if(IDEA_CHECKS.some(c=>c.id===key)&&['','yes','maybe','no'].includes(text)){d.checks[key]=text;return true;}
 return false;
}
export function ideaDifficultyInput(state,id,checked,{savedId=''}={}){
 if(!IDEA_DIFFICULTIES.some(x=>x.id===id))return false;
 const s=ideaState(state),d=savedId?s.shortlist.find(x=>x.id===savedId):s.drafts[s.active];
 if(!d)return false;
 d.difficulties=d.difficulties.filter(x=>x!==id);
 if(checked)d.difficulties.push(id);
 s.pending=null;return true;
}
export function chooseTopic(state,id){
 if(!['','other',...IDEA_TOPICS.map(t=>t.id)].includes(id))return false;
 const s=ideaState(state);s.topic=id;s.subtopic='';s.offset=0;s.active='';s.pending=null;return true;
}
export function saveIdea(state,{asNew=false}={}){
 const s=ideaState(state),d=s.drafts[s.active];
 if(!d?.question.trim())return{ok:false,error:'Write your own possible investigation aim first.'};
 if(!d.clarity||!d.quickStart)return{ok:false,error:'Give your idea a clarity rating and a quick-start rating before saving it.'};
 const existing=asNew?null:s.shortlist.find(x=>x.id===d.savedId);
 if(!existing&&s.shortlist.length>=MAX_IDEAS)return{ok:false,error:'You already have three active ideas. Reject one (you can restore it later) before adding another. Your draft is safe.'};
 const value={...clone(d),id:existing?.id||'idea-'+s.nextId++};
 if(existing)s.shortlist[s.shortlist.indexOf(existing)]=value;
 else s.shortlist.push(value);
 d.savedId=value.id;
 return{ok:true,id:value.id,message:existing?'Your idea and ratings have been updated.':'Idea saved with your ratings. Compare it with your other possibilities.'};
}
function origin(state){return{idea:state.planning.fields.idea,aim:state.planning.fields.aim,projectIdea:state.project.idea,projectAim:state.project.aim};}
function applyIdea(state,d){
 const s=ideaState(state),f=state.planning.fields,old=origin(state);
 const before=old.idea||old.projectIdea;
 const changed=before!==d.question||old.aim!==d.question||old.projectAim!==d.question;
 if(changed){
  s.history.push({before,after:d.question,aimAtChoice:old.aim||old.projectAim,at:new Date().toISOString()});
  s.history=s.history.slice(-50);
  if(!f.originalIdea)f.originalIdea=before||d.question;
  // The selected, student-authored question IS their provisional aim.
  // Use the normal planning setter so the existing aim spark and reports reuse it.
  applyPlanningField(state,'idea',d.question);
  applyPlanningField(state,'aim',d.question);
  if(state.entries.length&&before!==d.question)
   for(const key of ['C10','C40','C60'])
    if(state.completion.stages[key]==='complete')state.completion.stages[key]='needs-review';
 }
 applyPlanningField(state,'ideaStatus','yes');
 s.selectedId=s.shortlist.some(x=>x.id===d.id)?d.id:'';
 s.pending=null;
 state.planning.notices=[changed?
  'Your selected aim has been saved as a spark and will return when it helps your mathematical investigation. Your earlier work is retained; review any previous title or completed writing if the direction changed.':
  'Your selected aim is ready. You can revisit it as the investigation develops.'];
 const node=state.planning.current;
 const move=['N00B','N00C'].includes(node)?
  planningMove(state,node==='N00B'?'Ready with one idea':'Selected one idea'):
  setPlanCurrent(state,'N01');
 return {...move,navigate:true};
}
export function requestIdeaUse(state,savedId='',candidate=null){
 const s=ideaState(state),d=candidate||(savedId?s.shortlist.find(x=>x.id===savedId):null);
 if(!d?.question.trim())return{ok:false,error:'Select a saved and evaluated possibility first.'};
 if(!d.clarity||!d.quickStart)return{ok:false,error:'Rate the clarity and how quickly you can start before selecting this idea.'};
 const old=origin(state);
 const changes=old.idea!==d.question||old.projectIdea!==d.question||old.aim!==d.question||old.projectAim!==d.question;
 const hasPrior=!!(old.idea||old.projectIdea||old.aim||old.projectAim||state.entries.length);
 if(changes&&hasPrior){
  s.pending={draft:clone(d),origin:old};
  return{ok:true,render:true,focus:'idea-confirm-heading'};
 }
 return applyIdea(state,d);
}
export function confirmIdeaUse(state){
 const s=ideaState(state),p=s.pending;
 if(!p)return{ok:false,error:'Choose a possibility before confirming it.'};
 if(JSON.stringify(p.origin)!==JSON.stringify(origin(state))){
  s.pending=null;
  return{ok:false,error:'Your current plan has changed. Review the chosen aim again before replacing it.'};
 }
 return applyIdea(state,p.draft);
}
/** Only handles explicit Idea Explorer controls. Browsing never writes planning answers. */
export function ideaAction(state,action,data={}){
 if(!action.startsWith('idea-'))return null;
 if(state.route!=='planning'||!['N00B','N00C'].includes(state.planning.current))return {ok:false,error:'Open the optional Idea Explorer from Planning first.'};
 const s=ideaState(state);
 switch(action){
  case 'idea-map-mode':{
   if(!['interests','data'].includes(data.mode))return{ok:false,error:'That map is unavailable.'};
   if(s.map.mode===data.mode)return{ok:true};
   s.map={mode:data.mode,root:'',topic:'',subtopic:'',dataBranch:''};s.active='';s.pending=null;
   return{ok:true,render:true,focus:'idea-map-heading'};
  }
  case 'idea-map-root':{
   const root=ideaMapRoot(s.map.mode,data.root);if(!root)return{ok:false,error:'Choose a starting branch.'};
   s.map.root=s.map.root===root.id?'':root.id;s.map.topic='';s.map.subtopic='';s.map.dataBranch='';
   return{ok:true,render:true,focus:'idea-map-root-'+root.id};
  }
  case 'idea-map-topic':{
   if(!ideaMapTopics(ideaMapRoot(s.map.mode,s.map.root)).some(x=>x.id===data.topic))return{ok:false,error:'Choose a branch on your map.'};
   s.map.topic=data.topic;s.map.subtopic='';s.topic=data.topic;s.subtopic='';
   return{ok:true,render:true,focus:'idea-map-topic-'+data.topic};
  }
  case 'idea-map-leaf':{
   const topic=IDEA_TOPICS.find(x=>x.id===s.map.topic);
   if(!topic?.subtopics.includes(data.subtopic))return{ok:false,error:'Choose a visible detail to grow this branch.'};
   s.map.subtopic=data.subtopic;s.subtopic=data.subtopic;
   return{ok:true,render:true,focus:'idea-map-directions-heading'};
  }
  case 'idea-map-access':{
   if(!ideaMapBranches(ideaMapRoot(s.map.mode,s.map.root)).some(x=>x.id===data.branch))return{ok:false,error:'Choose a visible data direction.'};
   s.map.dataBranch=data.branch;
   return{ok:true,render:true,focus:'idea-map-directions-heading'};
  }
  case 'idea-map-reset':{
   s.map.root='';s.map.topic='';s.map.subtopic='';s.map.dataBranch='';
   return{ok:true,render:true,focus:'idea-map-heading'};
  }
  case 'idea-explore':{
   if(data.map==='true'&&!ideaMapIdeas({...s.map}).some(x=>x.id===data.seed))return{ok:false,error:'That branch is no longer open.'};
   if(!beginIdea(state,data.seed,{fromMap:data.map==='true'}))return{ok:false,error:'That starting direction is unavailable.'};
   s.editorReturn='N00B';
   return{ok:true,render:true,focus:'idea-detail-heading'};
  }
  case 'idea-own':{
   const origin=state.planning.current;
   beginIdea(state,'own',{fresh:true});s.editorReturn=origin;
   return{ok:true,render:true,focus:'idea-question'};
  }
  case 'idea-map-open':{
   s.active='';s.pending=null;s.editorReturn='N00B';
   setPlanCurrent(state,'N00B');return{ok:true,render:true,focus:'idea-map-heading'};
  }
  case 'idea-browse':{
   s.active='';s.pending=null;
   const dest=s.editorReturn==='N00C'?'N00C':'N00B';
   setPlanCurrent(state,dest);
   return{ok:true,render:true,focus:dest==='N00C'?'idea-compare-heading':'idea-map-heading'};
  }
  case 'idea-rate':{
   if(!['clarity','quickStart'].includes(data.field)||!/^[1-5]$/.test(data.value||''))return{ok:false,error:'Choose a rating from 1 to 5.'};
   if(!ideaInput(state,data.field,data.value))return{ok:false,error:'Open an idea to rate it.'};
   return{ok:true,render:true,focus:'idea-'+data.field+'-'+data.value};
  }
  case 'idea-subtopic':if(!IDEA_TOPICS.find(t=>t.id===s.topic)?.subtopics.includes(data.subtopic))return{ok:false,error:'Choose one of the available subtopics.'};s.subtopic=s.subtopic===data.subtopic?'':data.subtopic;s.offset=0;return{ok:true,render:true,focus:'idea-subtopic-'+IDEA_TOPICS.find(t=>t.id===s.topic).subtopics.indexOf(data.subtopic)};
  case 'idea-more':{const c=ideaChoices(state);if(c.total)s.offset=(s.offset+3)%c.total;return{ok:true,render:true,focus:'idea-directions-heading'};}
  case 'idea-angle':{const seed=currentSeed(state),pool=IDEA_SEEDS.filter(x=>x.topic===seed.topic);if(!pool.length)return{ok:true};beginIdea(state,pool[(pool.findIndex(x=>x.id===seed.id)+1)%pool.length].id);return{ok:true,render:true,focus:'idea-detail-heading'};}
  case 'idea-save-copy':
  case 'idea-save':{
   const result=saveIdea(state,{asNew:action==='idea-save-copy'});
   if(!result.ok)return result;
   s.active='';s.pending=null;
   if(state.planning.current==='N00B')planningMove(state,'I brainstormed possible ideas');
   else setPlanCurrent(state,'N00C');
   return {...result,render:true,focus:'idea-compare-heading'};
  }
  case 'idea-legacy':{
   const f=state.planning.fields;
   if(!['idea','originalIdea','otherIdea1','otherIdea2'].includes(data.key)||!f[data.key]?.trim())return{ok:false,error:'That earlier idea is unavailable.'};
   beginIdea(state,'own',{fresh:true});s.drafts.own.question=f[data.key];s.editorReturn='N00C';
   return{ok:true,render:true,focus:'idea-question'};
  }
  case 'idea-compare':s.active='';s.pending=null;if(state.planning.current==='N00B'){
   if(s.shortlist.length)planningMove(state,'I brainstormed possible ideas');
   else setPlanCurrent(state,'N00C'); // Browsing an empty comparison is not completion.
  }return{ok:true,render:true,focus:'idea-compare-heading'};
  case 'idea-edit-saved':{
   const d=s.shortlist.find(x=>x.id===data.id);
   if(!d)return{ok:false,error:'That saved possibility is no longer here.'};
   s.drafts[d.seedId]=cleanDraft({...d,savedId:d.id});
   s.active=d.seedId;s.pending=null;s.editorReturn='N00C';
   setPlanCurrent(state,'N00C');return{ok:true,render:true,focus:'idea-question'};
  }
  case 'idea-remove':{
   const candidate=s.shortlist.find(x=>x.id===data.id);
   if(!candidate)return{ok:false,error:'That possibility is not active.'};
   s.shortlist=s.shortlist.filter(x=>x.id!==data.id);
   s.rejected=[...s.rejected,{...clone(candidate),rejectedAt:new Date().toISOString()}].slice(-60);
   if(s.selectedId===data.id)s.selectedId='';
   s.pending=null;
   return{ok:true,render:true,focus:'idea-compare-heading',
    message:'Idea moved to Rejected ideas. You can restore it; your current investigation is unchanged.'};
  }
  case 'idea-restore':{
   const candidate=s.rejected.find(x=>x.id===data.id);
   if(!candidate)return{ok:false,error:'That rejected idea is unavailable.'};
   if(s.shortlist.length>=MAX_IDEAS)return{ok:false,error:'You have three active ideas. Reject one before restoring another.'};
   s.rejected=s.rejected.filter(x=>x.id!==data.id);
   const {rejectedAt,...rest}=candidate;
   s.shortlist.push(rest);
   return{ok:true,render:true,focus:'idea-compare-heading',message:'Your idea and its ratings have been restored.'};
  }
  case 'idea-use':return requestIdeaUse(state,data.id||'');
  case 'idea-confirm':return confirmIdeaUse(state);
  case 'idea-cancel':s.pending=null;s.active='';setPlanCurrent(state,'N00C');return{ok:true,render:true,focus:'idea-compare-heading'};
  case 'idea-keep':{
   const current=state.planning.fields.aim||state.project.aim||state.planning.fields.idea||state.project.idea;
   if(!current.trim())return{ok:false,error:'There is no current idea or aim yet. Explore or write one first.'};
   s.pending=null;
   return{...planningMove(state,state.planning.current==='N00B'?'Ready with one idea':'Keep original idea'),navigate:true};
  }
  default:return{ok:false,error:'That idea action is unavailable.'};
 }
}
