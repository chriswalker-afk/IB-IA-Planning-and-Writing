/**
 * Common problem catalogue for the central "I am stuck" hub.
 * Reuses the same authored cards as the Planning/Studio/Checking bubbles:
 * no independent, lower-quality rewrite of the mathematical advice.
 */
import {PLANNING_RECOVERY_CARDS,PLANNING_RECOVERY_SPOTS,planningHelpFor} from "./planning-help.js";
import {STUDIO_RECOVERY_CARDS,STUDIO_RECOVERY_SPOTS,ROUTE_RECOVERY,TOOL_RECOVERY,studioHelpFor} from "./studio-help.js";
import {CHECKING_RECOVERY_CARDS,CHECKING_RECOVERY_SPOTS,checkingHelpFor} from "./checking-help.js";
import {selectedInvestigativeRoute,outcomeRouteForEntry,actualMathematics} from "../completing/adaptive-journey.js";
import {completeEntry,isPearsonResult,scatterForNext} from "../completing/engine.js";
import {REPRESENTATION_TOOLS,activeRepresentationTool} from "../diagrams/representation-registry.js";
import {STUCK_TOPICS} from "./stuck-catalog.js";

export const HUB_GROUPS=Object.freeze([
 ["ideas","Ideas & planning"],
 ["evidence","Data, sources & methods"],
 ["maths","Doing mathematics"],
 ["meaning","Understanding results"],
 ["checking","Checking & improving"],
 ["practical","Practical help"]
].map(([id,label])=>Object.freeze({id,label})));
const hubs=Object.freeze({planning:PLANNING_RECOVERY_CARDS,
 studio:[...STUDIO_RECOVERY_CARDS,...Object.values(ROUTE_RECOVERY),...Object.values(TOOL_RECOVERY)],
 checking:CHECKING_RECOVERY_CARDS});
const id=(surface,card)=>"fix:"+surface+":"+card.id;
const normalize=x=>typeof x==="string"?x.trim().toLowerCase():"";
const str=x=>typeof x==="string"?x.trim():"";
const groupOf=(surface,card)=>{
 const x=card.id;
 if(surface==="checking")return "checking";
 if(surface==="planning"){
  if(/idea|interest|aim|motivation|purpose|theory-no-start|question|course|route|method-choice/.test(x))return "ideas";
  if(/source|data|sample|population|permission|consent|accuracy|published|primary|secondary/.test(x))return "evidence";
  return "maths";
 }
 if(/tool-|show-|table-|figure-|axis-/.test(x))return "maths";
 if(/source|sample|precision|model-limits|method-conditions|method-alternative/.test(x))return "evidence";
 if(/outcome|meaning|interpret|unexpected|result-needs-review|pmcc|model-residual|next-|stages-|conclusion/.test(x))return "meaning";
 if(/intro|bridge|first/.test(x))return "ideas";
 return "maths";
};
const resourceByCard=Object.freeze({
 "mla-need":"mla-citations","mla-match":"mla-citations","mla-data-figure":"mla-citations","mla-location":"mla-citations",
 "source-real":"secondary-data","sample-relevance":"two-way","sample-choice":"organise",
 "show-which":"chart-choice","show-axis":"reporting-precision",
 "source-precision":"reporting-precision","precision-impact":"reporting-precision",
 "pmcc-curved":"pmcc-meaning","model-residual":"model-check",
 "model-limits":"model-check","out-of-course":"restrictions",
 "real-calculation":"reporting-precision","tool-graph":"desmos-regression",
 "tool-stat":"distribution-graphs","tool-table":"organise",
 "tool-trace":"image-scale","tool-voronoi":"chart-choice",
 "tool-geometry":"restrictions","tool-probability":"binomial",
 "route-optimisation":"derivatives","route-growth":"desmos-regression",
 "route-images":"image-scale","route-relationships":"sheets-scatter",
 "route-fitted-models":"model-check","route-variation":"summary-stats",
 "route-finance":"organise","route-chance":"binomial"
});
export function hubOriginalView(state){
 const o=state.completion?.support?.origin,route=o?.route||state.route;
 const planning=o?{...state.planning,current:o.planNode}:state.planning;
 const completion=o?{...state.completion,current:o.node,
  activeEntryIndex:state.entries.findIndex(e=>e.id===o.entryId),
  nextFromEntryId:o.nextFromEntryId}:state.completion;
 return {...state,route,planning,completion,helpSpot:o?.helpSpot||"",
  ui:o?.route==="checking"?{...state.ui,checkingMode:o.checkMode||"draft"}:state.ui};
}
const targetFor=(view,surface,card)=>{
 if(surface==="planning"){
  const spots=Object.entries(PLANNING_RECOVERY_SPOTS).filter(([,spec])=>spec.ids.includes(card.id));
  // The source step is preferred to any generic destination.
  const matching=spots.find(([key])=>key.startsWith(view.planning.current+":"))||spots[0];
  const node=card.targetNode||matching?.[0].split(":")[0]||view.planning.current;
  const spot=matching?.[0].split(":").slice(1).join(":")||"";
  return{route:"planning",node,focusField:card.focusField||(spot!=="page"?spot:"")};
 }
 if(surface==="studio"){
  const spots=Object.entries(STUDIO_RECOVERY_SPOTS).filter(([,arr])=>arr.includes(card.id));
  const current=view.completion.current;
  const match=spots.find(([key])=>key.startsWith(current+":"))||spots[0];
  const node=(card.id==="selected-outcome-help"||
   card.id==="not-yet-result"&&["C40","C50"].includes(current))?current:
   card.targetNode||match?.[0].split(":")[0]||(["C40","C50"].includes(current)?current:"C30");
  return{route:"completing",node};
 }
 if(surface==="checking"){
  const match=Object.entries(CHECKING_RECOVERY_SPOTS)
   .find(([,arr])=>arr.includes(card.id));
  const check=card.targetCheck||match?.[0]||"D09";
  return{route:"checking",check:check==="feedback"?"D13":check};
 }
 return{route:view.route};
};
const asIssue=(view,surface,card)=>Object.freeze({
 id:id(surface,card),source:surface,group:groupOf(surface,card),label:card.label,
 action:card.action,question:card.question,check:card.check,
 outcome:card.stop,fallback:card.fallback,boundary:card.boundary,
 target:targetFor(view,surface,card),resourceId:card.resourceId||resourceByCard[card.id]||"",
 origin:"contextual",cardId:card.id
});
export function availableHubIssues(state){
 const view=hubOriginalView(state),surface=view.route==="planning"?"planning":
  view.route==="checking"?"checking":"studio";
 if(!["planning","checking","completing"].includes(view.route))return [];
 let cards=hubs[surface];
 if(surface==="planning"&&(view.planning.fields.kind==="theoretical"||
   view.planning.fields.dataSource==="theoretical"))
  cards=cards.filter(x=>!/published|sample-choice|population|primary|secondary|data-not-verifiable/.test(x.id));
 if(surface==="studio"){
  const entry=completeEntry(view),route=entry&&actualMathematics(entry)?
   outcomeRouteForEntry(view,entry):selectedInvestigativeRoute(view);
  const activeRoute=route?.id||"",activeTool=activeRepresentationTool(view)?.id;
  // Route overlays are meaningful only for the relevant chosen route or stage.
  cards=cards.filter(c=>!c.id.startsWith("route-")||c.id==="route-"+activeRoute);
  // Never offer Pearson-specific repairs from a title or a planned PMCC.
  if(!(entry&&actualMathematics(entry)&&isPearsonResult(entry)&&scatterForNext(view)))
   cards=cards.filter(c=>c.id!=="pmcc-curved");
  if(view.planning.fields.kind==="theoretical")
   cards=cards.filter(c=>!["sample-relevance","source-precision"].includes(c.id));
  // All tools remain searchable; put the open tool first in contextual suggestions.
  void activeTool;
 }
 let out=cards.map(c=>asIssue(view,surface,c));
 if(surface==="studio"){
  const candidate=["part:next","part:reflect","page"].map(spot=>studioHelpFor(view,spot))
   .find(x=>x?.choices.some(c=>c.id==="selected-outcome-help"));
  const outcome=candidate?.choices.find(c=>c.id==="selected-outcome-help");
  if(outcome)out=[...out,asIssue(view,"studio",outcome)];
 }
 return out;
}
export function hubIssueFor(state,issueId){
 return availableHubIssues(state).find(x=>x.id===issueId)||null;
}
export function suggestedHubIssues(state){
 const view=hubOriginalView(state),all=availableHubIssues(state);
 if(!all.length)return [];
 const surface=view.route;
 const selected=[],push=x=>{if(x&&!selected.some(y=>y.id===x.id))selected.push(x);};
 if(surface==="planning"){
  const node=view.planning.current;
  const hinted=view.helpSpot.startsWith(node+":")?view.helpSpot.slice(node.length+1):"";
  const keys=[...new Set([hinted,...Object.keys(PLANNING_RECOVERY_SPOTS)
   .filter(k=>k.startsWith(node+":"))
   .map(x=>x.slice(node.length+1))
   .sort((a,b)=>Number(b==="page")-Number(a==="page"))])].filter(Boolean);
  for(const key of keys){
   const h=planningHelpFor(view,key);
   if(h)for(const card of h.choices)push(all.find(x=>x.cardId===card.id));
  }
 }else if(surface==="completing"){
  const node=view.completion.current;
  const entry=completeEntry(view),actual=!!entry&&actualMathematics(entry);
  const hinted=view.helpSpot.startsWith(node+":")?view.helpSpot.slice(node.length+1):"";
  const typical=node==="C30"||node==="C40"||node==="C50"?
   actual?["part:next","part:reflect","page","part:show","part:introduce"]:
    ["part:show","page","part:introduce","part:reflect","part:next"]:
   ["page","field:interpretation","part:next"];
  const spots=[...new Set([hinted,...typical])].filter(Boolean);
  for(const spot of spots){
   const h=studioHelpFor(view,spot);
   if(h)for(const card of h.choices)push(all.find(x=>x.cardId===card.id));
  }
 }else if(surface==="checking"){
  const mode=["draft","feedback","final"].includes(view.ui.checkingMode)?view.ui.checkingMode:"draft";
  const records=view.completion.review?.records||{};
  const urgent=Object.keys(CHECKING_RECOVERY_SPOTS)
   .filter(k=>/^D\d\d$/.test(k)&&records[mode+"-"+k]?.status==="needs-work");
  const hinted=view.helpSpot.startsWith("feedback:")?"feedback":
   /^D\d{2}:/.test(view.helpSpot)?view.helpSpot.slice(0,3):"";
  const checks=[...new Set([hinted,...(mode==="feedback"?
   ["feedback",...urgent,"D13","D15","D09"]:
   mode==="final"?[...urgent,"D09","D12","D17","D21"]:
   [...urgent,"D09","D11","D12","D01"])] )].filter(Boolean);
  for(const key of checks){
   const h=checkingHelpFor(view,key==="feedback"?"feedback":"check:"+key);
   if(h)for(const card of h.choices)push(all.find(x=>x.cardId===card.id));
  }
 }
 // Safety-critical work remains the first option even if source/syllabus
 // conditions would otherwise point to attractive mathematics.
 const pending=view.teacher?.pendingApproval===true||
  ["pending","unsure"].includes(view.completion.fields.permissionStatus)||
  ["yes","unsure"].includes(view.planning.fields.permissionNeed);
 const theoretical=(view.planning.fields.kind||view.project.kind)==="theoretical";
 if(pending&&!theoretical){
  const issue=hubLegacyTopics(state).find(x=>x.id==="permission");
  if(issue)return[issue,...selected.filter(x=>x.id!=="permission")].slice(0,4);
 }
 return selected.slice(0,4);
}
export function hubFilteredIssues(state,{query="",group="all"}={}){
 const q=normalize(query).slice(0,120),g=group==="all"||HUB_GROUPS.some(x=>x.id===group)?group:"all";
 const practical=hubLegacyTopics(state)
  .filter(x=>["overwhelmed","restore","unsure"].includes(x.id))
  .map(x=>({id:x.id,label:x.label,question:x.reason,action:x.action,
   check:x.outcome,fallback:x.example,group:"practical",origin:"legacy"}));
 return [...availableHubIssues(state),...practical].filter(x=>(g==="all"||x.group===g)&&
  (!q||normalize([x.label,x.question,x.action,x.check,x.fallback].join(" ")).includes(q)));
}
export function hubLegacyTopics(state){
 // Original 24 topics remain browsable even when detailed contextual fixes exist.
 const view=hubOriginalView(state),theory=(view.planning.fields.kind||view.project.kind)==="theoretical";
 return STUCK_TOPICS.filter(t=>!theory||!["no-data","source","partial"].includes(t.id));
}
export const isHubIssueId=id=>typeof id==="string"&&/^fix:(?:planning|studio|checking):[a-z][a-z0-9-]{2,90}$/.test(id);
