import {IDEA_TOPICS,IDEA_SEEDS,IDEA_CHECKS} from './catalog.js';
import {ideaMapRoots,ideaMapRoot,ideaMapTopics,ideaMapBranches} from './mindmap.js';
const text=(v,n=1600)=>typeof v==='string'?v.slice(0,n):'';
const plain=v=>v&&typeof v==='object'&&!Array.isArray(v);
const ids=new Set(['own',...IDEA_SEEDS.map(s=>s.id)]);
const topicIds=new Set(['','other',...IDEA_TOPICS.map(s=>s.id)]);
export const MAX_IDEAS=3;
export function blankChecks(){return Object.fromEntries(IDEA_CHECKS.map(c=>[c.id,'']));}
export function cleanDraft(raw={}){
 const checks=blankChecks();
 for(const key of Object.keys(checks))checks[key]=['yes','maybe','no'].includes(raw.checks?.[key])?raw.checks[key]:'';
 return {savedId:/^idea-[1-9]\d{0,5}$/.test(raw.savedId||'')?raw.savedId:'',seedId:ids.has(raw.seedId)?raw.seedId:'own',question:text(raw.question),detail:text(raw.detail),
  focus:text(raw.focus,160),fromMap:raw.fromMap===true,trialNote:text(raw.trialNote),trialStatus:['workable','adjust','possible'].includes(raw.trialStatus)?raw.trialStatus:'',checks};
}
export function createIdeaState(){return {topic:'',subtopic:'',focus:'',offset:0,active:'',drafts:{},shortlist:[],nextId:1,pending:null,history:[],
 map:{mode:'interests',root:'',topic:'',subtopic:'',dataBranch:''}};}
export function normalizeIdeaState(raw){
 const s=createIdeaState();if(!plain(raw))return s;
 const m=plain(raw.map)?raw.map:{};
 s.map.mode=m.mode==='data'?'data':'interests';
 s.map.root=ideaMapRoot(s.map.mode,m.root)?.id||'';
 if(s.map.mode==='interests'){
  s.map.topic=ideaMapTopics(ideaMapRoot(s.map.mode,s.map.root)).find(x=>x.id===m.topic)?.id||'';
  s.map.subtopic=IDEA_TOPICS.find(x=>x.id===s.map.topic)?.subtopics.includes(m.subtopic)?m.subtopic:'';
 }else s.map.dataBranch=ideaMapBranches(ideaMapRoot(s.map.mode,s.map.root)).find(x=>x.id===m.dataBranch)?.id||'';
 s.topic=topicIds.has(raw.topic)?raw.topic:'';
 s.subtopic=IDEA_TOPICS.find(t=>t.id===s.topic)?.subtopics.includes(raw.subtopic)?raw.subtopic:'';
 // Old dropdown-based projects are carried into the nearest equivalent branch.
 // Abstract pattern ideas are intentionally not auto-recommended as a quick IA.
 if(!plain(raw.map)&&s.topic&&!['other','patterns'].includes(s.topic)){
  const home=ideaMapRoots('interests').find(x=>x.topics.includes(s.topic));
  if(home){s.map.root=home.id;s.map.topic=s.topic;s.map.subtopic=s.subtopic;}
 }
 s.focus=text(raw.focus,160);s.offset=Number.isInteger(raw.offset)?Math.max(0,Math.min(48,raw.offset)):0;
 if(plain(raw.drafts))for(const [key,value] of Object.entries(raw.drafts))if(ids.has(key)&&plain(value))s.drafts[key]=cleanDraft({...value,seedId:key});
 s.active=ids.has(raw.active)&&s.drafts[raw.active]?raw.active:'';
 const seen=new Set();
 for(const item of (Array.isArray(raw.shortlist)?raw.shortlist:[])){
  if(s.shortlist.length>=MAX_IDEAS)break;
  if(!plain(item)||!/^idea-[1-9]\d{0,5}$/.test(item.id)||seen.has(item.id))continue;
  const d=cleanDraft(item);if(!d.question.trim())continue;
  seen.add(item.id);s.shortlist.push({...d,id:item.id});
 }
 s.nextId=Math.max(1,...s.shortlist.map(x=>Number(x.id.slice(5))+1));
 if(Number.isInteger(raw.nextId)&&raw.nextId<999999)s.nextId=Math.max(s.nextId,raw.nextId);
 for(const h of (Array.isArray(raw.history)?raw.history:[]).slice(-50))if(plain(h))s.history.push({before:text(h.before),after:text(h.after),aimAtChoice:text(h.aimAtChoice),at:text(h.at,40)});
 // Restored files cannot carry an approval to replace the current idea.
 s.pending=null;return s;
}
