import {examplePrompt,exampleButton} from "../examples/views.js";
import {resourcePrompt} from "../resources/views.js";
import {suggestedTopics,availableTopics,adviceFor,stuckContext} from "./stuck.js";
import {topicById} from "./stuck-catalog.js";
import {HUB_GROUPS,hubOriginalView,suggestedHubIssues,hubFilteredIssues,hubIssueFor,hubLegacyTopics} from "./hub-issues.js";

/** Filter only the visible hub DOM, not the student project. A filter is never an IA result. */
export function applyStuckBrowseFilter(root){
 if(!root?.querySelector)return 0;
 const input=root.querySelector("[data-stuck-search]");
 const query=String(input?.value||"").trim().toLocaleLowerCase().slice(0,120);
 const selected=root.querySelector('[data-stuck-group-filter][aria-pressed="true"]')?.dataset.stuckGroupFilter||"all";
 let visible=0;
 for(const card of root.querySelectorAll("[data-stuck-search-item]")){
  const group=card.dataset.stuckSearchGroup||"";
  const haystack=(card.dataset.stuckSearchItem||"").toLocaleLowerCase();
  const show=(!query||haystack.includes(query))&&(selected==="all"||selected===group);
  card.hidden=!show;
  if(show)visible++;
 }
 for(const section of root.querySelectorAll("[data-stuck-group-section]")){
  section.hidden=![...section.querySelectorAll("[data-stuck-search-item]")].some(x=>!x.hidden);
  if(query&&!section.hidden)section.open=true;
 }
 const count=root.querySelector("[data-stuck-search-count]");
 if(count)count.textContent=visible+" matching problem"+(visible===1?"":"s")+
  (query?" for “"+query.slice(0,50)+"”":"");
 const empty=root.querySelector("[data-stuck-no-results]");
 if(empty)empty.hidden=visible!==0;
 return visible;
}
export function createStuckViews({getState,e,icon,field}){
 const action=(name,label,extra="",primary=false)=>'<button type="button" class="btn '+
  (primary?"btn-primary":"btn-secondary")+'" data-action="stuck-'+name+'" '+extra+'>'+e(label)+'</button>';
 const pick=(issue,{compact=false}={})=>'<button type="button" class="stuck-topic'+
  (issue.origin==="contextual"?" stuck-topic-specific":"")+
  '" data-action="stuck-topic" data-topic="'+e(issue.id)+'"><span><strong>'+e(issue.label)+
  '</strong>'+(compact?"":issue.question?'<small>'+e(issue.question)+'</small>':"")+
  '</span>'+icon("chevron-right")+'</button>';
 const basicPick=t=>pick({id:t.id,label:t.label},{compact:true});
 const modernDetail=(a)=>'<section class="stuck-next stuck-recovery" aria-label="One checkable recovery path">'+
  '<h4>First, ask yourself</h4><p>'+e(a.question)+'</p>'+
  '<h4>Try this now</h4><p>'+e(a.action)+'</p>'+
  '<h4>How to check whether it helped</h4><p>'+e(a.check)+'</p>'+
  '<p class="stuck-outcome"><strong>A useful stopping point:</strong> '+e(a.outcome)+'</p>'+
  (a.target?.route==='checking'?'<p class="stuck-caption">Use your actual IA document to make the check. Pathfinder does not inspect the file.</p>':"")+
  action("work",a.target?.route==="checking"?"Open the relevant document check":
   a.target?.route==="planning"?"Go to the relevant Planning step":
   "Return to this mathematical work","",true)+
  (a.resourceId?'<button class="btn btn-secondary" type="button" data-action="resource-open" data-resource-id="'+e(a.resourceId)+'" data-resource-help="true">'+icon("book")+" Open relevant tutorial</button>":"")+
  '</section>'+
  '<details class="stuck-example"><summary>If I am still stuck / another check</summary><p>'+e(a.fallback)+'</p>'+
  '<p class="stuck-boundary">'+e(a.boundary)+'</p></details>';
 function render(){
  const state=getState(),s=state.completion.support,x=stuckContext(state),
   a=hubIssueFor(state,s.selected)||adviceFor(state,s.selected),origin=hubOriginalView(state),
   suggestions=suggestedHubIssues(state),all=hubFilteredIssues(state),legacy=hubLegacyTopics(state);
  const route=origin.route,mode=state.ui?.checkingMode||"draft";
  const context=route==="checking"?"Checking · "+(mode==="feedback"?"feedback and revisions":mode==="final"?"final document":"draft review"):
   route==="planning"?"Planning · "+(state.planning.fields.aim||"developing your investigation"):
   (x.entry?"IA Studio · "+(x.entry.title||"selected mathematical step"):
    "IA Studio · "+(state.planning.fields.aim||"current work"));
  const f=state.completion.fields,notes=[
   ["Earlier obstacle",f.blockedBy],["Earlier next action",f.oneSafeAction],
   ["Candidate source",f.alternateSource],["Source fit",f.alternateFit],
   ["Data issue",f.limitedDataIssue],["Earlier target date",f.stuckFollowup]
  ].filter(([,v])=>v);
  const oldNotes=notes.length?'<details class="stuck-legacy"><summary>Earlier help notes (kept)</summary>'+
   notes.map(([k,v])=>'<p><strong>'+e(k)+':</strong> '+e(v)+'</p>').join("")+'</details>':"";
  const footer=oldNotes+'<div class="stuck-footer">'+action("return","Return to my work")+
   action("backup","Download full backup")+'</div>';
  const saved=s.task?.status==="pending"?'<details class="stuck-saved"><summary>'+
   icon("bookmark")+' My saved next action</summary><p>'+e(s.task.action)+'</p>'+
   (s.task.note?'<p class="stuck-caption">'+e(s.task.note)+'</p>':"")+
   action("resume","Review this action")+action("resolved","This got me moving")+'</details>':"";
  if(!a){
   const groups=HUB_GROUPS.map(group=>{
    const issues=all.filter(issue=>issue.group===group.id);
    return issues.length?'<details class="stuck-topic-group" data-stuck-group-section="'+e(group.id)+'">'+
      '<summary>'+e(group.label)+' <span>'+issues.length+'</span></summary><div class="stuck-group-issues">'+
      issues.map(item=>'<div data-stuck-search-group="'+e(group.id)+
       '" data-stuck-search-item="'+e([item.label,item.question,item.action,item.check].join(" ").toLowerCase())+
       '">'+pick(item)+'</div>').join("")+'</div></details>':"";
   }).join("");
   const oldGroups=[...new Set(legacy.map(t=>t.group))].map(group=>
    '<div class="stuck-topic-group"><h3>'+e(group)+'</h3>'+
    legacy.filter(t=>t.group===group).map(basicPick).join("")+'</div>').join("");
   return '<div class="stuck-support stuck-hub" data-stuck-hub>'+
    '<p class="stuck-intro">What is getting in your way? Choose the problem closest to yours; no answer or mathematics will be changed by opening help.</p>'+
    '<p class="stuck-context">'+e(context.slice(0,220))+'</p>'+
    saved+
    '<section class="stuck-suggested" aria-label="Specific help for your current task"><h3>Likely difficulties at this step</h3>'+
    '<p class="stuck-caption">These are optional starting points from your recorded stage—not assumptions that something is wrong.</p>'+
    '<div class="stuck-topics">'+(suggestions.length?suggestions.map(item=>pick(item)).join(""):
     suggestedTopics(state).slice(0,3).map(basicPick).join(""))+'</div></section>'+
    '<details class="stuck-browse"'+(s.browse?' open':'')+'><summary>'+icon("search")+
     ' Find another problem · browse or search</summary>'+
    '<div class="stuck-browse-inner">'+
      '<label class="field-label" for="stuck-hub-search">Search by what is difficult</label>'+
      '<input id="stuck-hub-search" type="search" autocomplete="off" data-stuck-search '+
      'placeholder="e.g. data source, residual, citation, feedback">'+
      '<div class="stuck-group-filters" role="group" aria-label="Filter problems by task">'+
      [{id:"all",label:"All"},...HUB_GROUPS].map(g=>
       '<button type="button" class="stuck-filter" data-stuck-group-filter="'+e(g.id)+
       '" aria-pressed="'+(g.id==="all")+'">'+e(g.label)+'</button>').join("")+'</div>'+
      '<p class="stuck-caption" role="status" aria-live="polite" data-stuck-search-count>'+
       all.length+' matching problems</p>'+
      '<p class="stuck-caption" data-stuck-no-results hidden>No problems match this search. Try fewer words or choose an earlier general help topic below.</p>'+
      '<div class="stuck-browse-groups">'+groups+'</div></div></details>'+
    '<details class="stuck-legacy-browse"><summary>More general difficulties and earlier help topics</summary>'+
     '<p class="stuck-caption">These 24 established topics remain available for returning students and saved projects.</p>'+
     oldGroups+'</details>'+
    '<div class="stuck-quick-links">'+basicPick(topicById("unsure"))+
     '<div class="resource-quiet"><button type="button" class="btn btn-quiet" data-action="resource-browse" data-resource-help="true">Tools & tutorials</button></div>'+
     exampleButton("Browse illustrative examples",{browse:true,help:true})+'</div>'+
    '<details class="stuck-practical"><summary>Practical help: saved notes, returning and backups</summary>'+
     '<p>Your personal notes stay in this project. They do not mark mathematics completed or submit the IA.</p>'+
     (notes.length?oldNotes:"")+
     action("teacher","Prepare a focused teacher question")+'</details>'+
    '<div class="stuck-footer">'+action("return","Return to my work")+
     action("backup","Download full backup")+'</div></div>';
  }
  const legacyIssue=!a.origin;
  const draft="completion.support.drafts."+a.id;
  const cardTitle=legacyIssue?topicById(a.id)?.label||a.label:a.label;
  const specific=!legacyIssue?modernDetail(a):
   '<section class="stuck-next"><h4>Try this now</h4><p>'+e(a.action)+'</p>'+
   '<p class="stuck-why">'+e(a.reason)+'</p>'+
   '<p class="stuck-outcome"><strong>A useful stopping point:</strong> '+e(a.outcome)+'</p>'+
   action("work",a.label,"",true)+'</section>'+
   examplePrompt(state,{help:true})+
   '<details class="stuck-example"><summary>More thinking help</summary>'+
    '<p class="stuck-caption">Illustrative thinking only—not your findings or wording to copy.</p><p>'+e(a.example)+'</p></details>'+
   '<p class="stuck-boundary">'+e(a.boundary)+'</p>'+resourcePrompt(state,{help:true});
  const alternatives=legacyIssue?a.alternatives:
   suggestions.filter(issue=>issue.id!==a.id).slice(0,2);
  return '<div class="stuck-support stuck-focused">'+
   action("menu","Back to problems")+
   '<h3 class="stuck-heading" tabindex="-1">'+e(cardTitle)+'</h3>'+
   '<p class="stuck-context">'+e(context.slice(0,220))+'</p>'+specific+
   '<details id="stuck-alternatives"'+(s.more?' open':'')+'><summary>That did not help / try another route</summary>'+
    '<p>Choose only what fits your difficulty. A teacher can help with a precise unresolved mathematical question.</p>'+
    '<div class="stuck-topics">'+alternatives.map(item=>legacyIssue?basicPick(item):pick(item,{compact:true})).join("")+'</div>'+
    '<div class="stuck-teacher"><h4>Ask a focused teacher question</h4>'+
    '<p>Name the mathematical or source issue, the one check you tried, and the exact step where you are blocked. Do not share participant identities.</p>'+
    action("teacher","Prepare a teacher question")+'</div></details>'+
   '<details class="stuck-save"><summary>Save my own next action (optional)</summary>'+
    '<p class="stuck-caption">Private project note only. Saving it never marks this issue or any IA section as complete.</p>'+
    field(draft+".action","The one thing I will do next","A small task I choose",{type:"textarea",rows:2})+
    field(draft+".note","What I tried / question to keep (optional)","Avoid personal or identifying data",{type:"textarea",rows:2})+
    action("save","Save my next action")+
    (s.task?.issue===a.id?'<p role="status" class="stuck-caption">Saved action: '+
      e(s.task.status==="resolved"?"you marked it as helpful":"pending")+'</p>':"")+
   '</details>'+footer+'</div>';
 }
 function returnBanner(){const s=getState().completion.support;return s.returnPending?
   '<div class="stuck-return-banner"><span>You opened this task from help.</span>'+
   action("return","Return to my previous work")+action("stay","Keep working here")+'</div>':"";}
 const searchListener=event=>{
  if(!event.target?.matches?.("[data-stuck-search]"))return;
  applyStuckBrowseFilter(event.target.closest("[data-stuck-hub]"));
 };
 const filterListener=event=>{
  const button=event.target?.closest?.("[data-stuck-group-filter]");
  if(!button)return;
  event.preventDefault();event.stopImmediatePropagation();
  const root=button.closest("[data-stuck-hub]");
  root?.querySelectorAll("[data-stuck-group-filter]").forEach(el=>
    el.setAttribute("aria-pressed",String(el===button)));
  applyStuckBrowseFilter(root);
 };
 if(typeof document!=="undefined"){
  document.addEventListener("input",searchListener,true);
  document.addEventListener("click",filterListener,true);
 }
 return{render,returnBanner,destroy(){
  if(typeof document!=="undefined"){
   document.removeEventListener("input",searchListener,true);
   document.removeEventListener("click",filterListener,true);
  }
 }};
}
