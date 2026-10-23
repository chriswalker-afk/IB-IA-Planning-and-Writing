import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {captureStuckOrigin,normalizeStuckState} from "../src/help/stuck-state.js";
import {stuckAction} from "../src/help/stuck-actions.js";
import {createStuckViews} from "../src/help/stuck-views.js";
import {
 HUB_GROUPS,availableHubIssues,suggestedHubIssues,hubFilteredIssues,
 hubOriginalView,hubIssueFor,hubLegacyTopics,isHubIssueId
} from "../src/help/hub-issues.js";
import {STUCK_TOPICS} from "../src/help/stuck-catalog.js";
import {
 CHECKING_RECOVERY_CARDS,CHECKING_RECOVERY_SPOTS,checkingHelpFor,checkingHelpBadge
} from "../src/help/checking-help.js";
import {INVESTIGATIVE_ROUTES} from "../src/planning/investigative-routes.js";
import {REPRESENTATION_TOOLS} from "../src/diagrams/representation-registry.js";
import {journeyOutcomeOptions} from "../src/completing/adaptive-journey.js";
const escapeHtml=s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const fixture=(route="planning",node="N01")=>{
 const s=createProjectState();
 s.route=route;
 s.planning.current=node.startsWith("N")?node:"N01";
 s.completion.current=node.startsWith("C")?node:"C04";
 s.ui.checkingMode="draft";
 s.planning.fields.aim="What does this actual data suggest?";
 captureStuckOrigin(s);
 return s;
};
const render=s=>createStuckViews({getState:()=>s,e:escapeHtml,icon:()=>"",field:(path,label)=>
 '<div class="field-group"><label>'+escapeHtml(label)+'</label><textarea data-bind="'+escapeHtml(path)+'"></textarea></div>'}).render();
test("Pass 4: Checking repair cards are specific tasks, not rubric rewrites",()=>{
 assert(CHECKING_RECOVERY_CARDS.length>=18);
 for(const card of CHECKING_RECOVERY_CARDS){
  assert(card.label.length>20,card.id);
  assert(card.question.endsWith("?"),card.id);
  for(const name of ["action","check","stop","fallback","boundary"])
   assert(card[name].length>32,card.id+" "+name);
  assert(!/grade|predicted marks|criterion [A-E]/i.test(card.action),card.id);
 }
 const ids=CHECKING_RECOVERY_CARDS.map(x=>x.id);
 assert.equal(new Set(ids).size,ids.length);
 assert.equal(Object.keys(CHECKING_RECOVERY_SPOTS).filter(x=>x.startsWith("D")).length,21);
 for(const cards of Object.values(CHECKING_RECOVERY_SPOTS))
  assert(cards.every(x=>ids.includes(x)));
});
test("D09 source pointers are only prompts to inspect the real IA, not claims of verified citations",()=>{
 const s=fixture("checking");
 let h=checkingHelpFor(s,"check:D09");
 assert(h&&h.choices[0].id==="mla-need");
 assert.match(h.source,/not read/);
 s.completion.sourceRecords=[{id:"src",fields:{actualSourceType:"secondary",
  actualSource:"Published data",sourceCitation:"A real source to inspect"}}];
 h=checkingHelpFor(s,"check:D09");
 assert.equal(h.choices[0].id,"mla-match");
 assert(h.choices.some(x=>x.resourceId==="mla-citations"));
 assert.equal(s.completion.review.records["draft-D09"]?.status||"unchecked","unchecked");
});
test("Feedback help never attributes an absent comment or approves another review round",()=>{
 const s=fixture("checking");s.ui.checkingMode="feedback";
 assert.equal(checkingHelpFor(s,"feedback").choices[0].id,"feedback-no-comment");
 s.completion.review.feedbackItems=[{id:"f1",status:"implemented",note:"Recorded real verbal advice"}];
 assert.equal(checkingHelpFor(s,"feedback").choices[0].id,"feedback-meaning");
 assert(checkingHelpFor(s,"check:D15").choices.some(x=>x.id==="feedback-verify"));
 assert(!checkingHelpFor(s,"feedback").choices[0].action.includes("approved"));
});
test("Checking bubbles remain available in reduced mode and both assessment cohorts",()=>{
 const s=fixture("checking");s.ui.adviceMode="reduced";
 for(const year of ["legacy","revised2029"]){
  s.planning.fields.assessmentFramework=year;
  const badge=checkingHelpBadge(s,"check:D09",escapeHtml);
  assert(badge.includes('aria-haspopup="dialog"'));
  assert(badge.includes('data-checking-stuck="D09:check:D09"'));
  assert(checkingHelpFor(s,"check:D12"));
 }
 s.route="planning";assert.equal(checkingHelpBadge(s,"check:D09",escapeHtml),"");
});
test("Hub shows conditional repairs first and keeps original 24 topics untouched",()=>{
 const s=fixture("planning","N01");
 const suggested=suggestedHubIssues(s);
 assert(suggested.length<=4&&suggested.length>0);
 assert(suggested.every(x=>x.id.startsWith("fix:planning:")));
 assert.equal(hubLegacyTopics(s).length,STUCK_TOPICS.length);
 const html=render(s);
 assert(html.includes("Likely difficulties at this step"));
 assert(html.includes("Find another problem"));
 assert(html.includes("data-stuck-search"));
 assert(html.includes("stuck-legacy-browse"));
 assert(!html.includes("<script"));
});
test("Searchable categories and source-backed matching cover the current work",()=>{
 const s=fixture("checking");
 assert.equal(HUB_GROUPS.length,6);
 assert(hubFilteredIssues(s,{query:"MLA"}).some(x=>x.cardId==="mla-match"));
 assert(hubFilteredIssues(s,{query:"feedback",group:"checking"}).length>1);
 assert(hubFilteredIssues(s,{group:"ideas"}).length===0);
 assert(hubFilteredIssues(s,{query:"wordthatdoesnotexist123"}).length===0);
});
test("Hub surfaces genuine mathematics problems across all sixteen routes",()=>{
 for(const route of INVESTIGATIVE_ROUTES){
  const s=fixture("completing","C30");
  s.planning.routeExplorer.selectedRoute=route.id;
  s.entries=[{id:"stage",phase:"first",status:"planned",result:"",journeyOutcome:""}];
  s.completion.activeEntryIndex=0;
  captureStuckOrigin(s);
  const issues=availableHubIssues(s);
  assert(issues.some(x=>x.cardId==="route-"+route.id),route.id);
  assert(!issues.some(x=>x.cardId==="selected-outcome-help"),route.id);
  assert(!issues.some(x=>x.id==="fix:studio:route-proof")||route.id==="proof",route.id);
 }
});
test("All seven generators are searchable without creating any figures",()=>{
 const s=fixture("completing","C31");
 const before=JSON.stringify([s.entries,s.graphStudio,s.statStudio,s.probabilityStudio]);
 for(const tool of REPRESENTATION_TOOLS)
  assert(availableHubIssues(s).some(x=>x.id==="fix:studio:tool-"+tool.id));
 assert.equal(JSON.stringify([s.entries,s.graphStudio,s.statStudio,s.probabilityStudio]),before);
});
test("A confirmed outcome unlocks a specific repair only after real completed mathematics",()=>{
 const s=fixture("completing","C30");s.planning.routeExplorer.selectedRoute="growth";
 s.entries=[{id:"one",phase:"first",status:"planned",result:"",
  journeyOutcome:"growth:multiplicative"}];
 s.completion.activeEntryIndex=0;captureStuckOrigin(s);
 assert(!availableHubIssues(s).some(x=>x.cardId==="selected-outcome-help"));
 s.entries[0].result="2, 4, 8 as actual calculated terms";
 assert(!availableHubIssues(s).some(x=>x.cardId==="selected-outcome-help"));
 s.entries[0].status="completed";
 s.entries[0].journeyOutcome=journeyOutcomeOptions(s,s.entries[0])[0].value;
 captureStuckOrigin(s);
 const specific=availableHubIssues(s).find(x=>x.cardId==="selected-outcome-help");
 assert(specific);
 assert(specific.action.includes("actual result"));
 assert.equal(specific.target.node,"C30");
 s.planning.routeExplorer.selectedRoute="proof";
 assert(!availableHubIssues(s).some(x=>x.cardId==="selected-outcome-help"));
});
test("Pending permission takes priority and the central hub does not imply consent",()=>{
 const s=fixture("completing","C20");
 s.teacher.pendingApproval=true;
 const suggested=suggestedHubIssues(s);
 assert.equal(suggested[0].id,"permission");
 assert.match(render(s),/stuck-topic/);
 assert.equal(s.teacher.pendingApproval,true);
});
test("Contextual issue notes are lazy, private, and survive full-project JSON normalization",()=>{
 const s=fixture("checking");s.ui.checkingMode="feedback";captureStuckOrigin(s);
 const chosen=hubIssueFor(s,"fix:checking:feedback-verify");
 assert(chosen);
 assert(stuckAction(s,"stuck-topic",{topic:chosen.id}).ok);
 assert(Object.hasOwn(s.completion.support.drafts,chosen.id));
 assert(!stuckAction(s,"stuck-save").ok);
 s.completion.support.drafts[chosen.id].action="Reopen the final PDF and check one corrected figure";
 s.completion.support.drafts[chosen.id].note="The revised caption still needs checking";
 assert(stuckAction(s,"stuck-save").ok);
 const copy=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.equal(copy.completion.support.selected,chosen.id);
 assert.equal(copy.completion.support.task.issue,chosen.id);
 assert.equal(copy.completion.support.task.status,"pending");
 assert.equal(copy.completion.support.drafts[chosen.id].note,"The revised caption still needs checking");
 assert.equal(copy.completion.support.origin.checkMode,"feedback");
 assert.equal(copy.ui.checkingMode,"feedback");
 assert.equal(copy.completion.review.records["feedback-D09"]?.status||"unchecked","unchecked");
});
test("Saved current Checking mode persists through navigation and return",()=>{
 const s=fixture("checking");s.ui.checkingMode="final";captureStuckOrigin(s);
 assert.equal(s.completion.support.origin.checkMode,"final");
 s.route="completing";
 const view=hubOriginalView(s);
 assert.equal(view.route,"checking");
 assert.equal(view.ui.checkingMode,"final");
 assert(hubIssueFor(s,"fix:checking:mla-match"));
});
test("Bad IDs, prototype paths and unbounded drafts do not survive normalization",()=>{
 for(const id of ["__proto__","fix:checking:__proto__","fix:checking:<script>","fix:unknown:abc"])
  assert(!isHubIssueId(id),id);
 const n=normalizeStuckState({selected:"fix:checking:mla-match",
   drafts:{"fix:checking:mla-match":{action:"a".repeat(2500),note:"safe"}}});
 assert.equal(n.selected,"fix:checking:mla-match");
 assert.equal(n.drafts[n.selected].action.length,1000);
});
test("Help remains read-only in Checking, with source contents safely escaped",()=>{
 const s=fixture("checking");
 s.completion.review.feedbackItems=[{note:"<img src=x onerror=alert(1)>",action:"Review one figure"}];
 const before=JSON.stringify([s.entries,s.completion.review,s.planning]);
 const html=render(s);
 const x=checkingHelpFor(s,"check:D09"),y=hubFilteredIssues(s,{query:"mla"});
 assert(x&&y.length>0);
 assert(!html.includes("<img"));
 assert.equal(JSON.stringify([s.entries,s.completion.review,s.planning]),before);
});
