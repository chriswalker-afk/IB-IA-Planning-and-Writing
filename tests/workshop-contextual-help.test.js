import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState} from "../src/core/project-state.js";
import {contextualWorkshopHelp,renderContextualWorkshopHelp,WORKSHOP_HELP_ROUTES,workshopHelpFocus} from "../src/help/workshop-help.js";
import {hubOriginalView} from "../src/help/hub-issues.js";
import {STUDIO_RECOVERY_SPOTS} from "../src/help/studio-help.js";
import {PLANNING_RECOVERY_SPOTS} from "../src/help/planning-help.js";
import {INVESTIGATIVE_ROUTES} from "../src/planning/investigative-routes.js";
import {WORKSHOP_DEFINITIONS,WORKSHOP_LESSONS,definitionById,lessonById} from "../src/workshop/catalog.js";
import {newResourceSession} from "../src/resources/state.js";
import {resourceAction} from "../src/resources/actions.js";
import {renderWorkshop} from "../src/workshop/views.js";
import {escapeHtml} from "../src/ui/primitives.js";

const state=(route="planning",node="N03P2")=>{
 const s=createProjectState();
 s.route=route;s.planning.current=route==="planning"?node:"N01";
 s.completion.current=route==="completing"?node:"C04";
 s.planning.fields.course="AI SL";
 return s;
};
const setRoute=(s,route)=>{s.planning.routeExplorer.selectedRoute=route;return s;};
const withMethod=(s,methodId)=>{
 s.entries=[{id:"support-entry",title:"Student's real title (do not use to infer a method)",methodId,phase:"substantial",status:"planned",result:"",kind:"table"}];
 s.completion.activeEntryIndex=0;
 return s;
};
const project=s=>JSON.stringify({planning:s.planning,completion:s.completion,entries:s.entries,resources:s.resources,project:s.project});

test("contextual Workshop: all 16 chosen pathways map to valid canonical terms and lessons",()=>{
 assert.equal(Object.keys(WORKSHOP_HELP_ROUTES).length,16);
 assert.deepEqual(Object.keys(WORKSHOP_HELP_ROUTES).sort(),INVESTIGATIVE_ROUTES.map(r=>r.id).sort());
 assert.equal(WORKSHOP_DEFINITIONS.length,243);assert.equal(WORKSHOP_LESSONS.length,45);
 for(const [routeId,p] of Object.entries(WORKSHOP_HELP_ROUTES)){
  for(const key of ["start","calculate","interpret","follow"])assert(definitionById(p[key]),routeId+" missing "+key);
  assert(lessonById(p.lesson),routeId+" missing lesson "+p.lesson);
  const s=setRoute(state("planning","N04S"),routeId),before=project(s);
  const help=contextualWorkshopHelp(s,{spot:"page",issueId:"maths-too-many"});
  assert(help?.routeId===routeId,routeId);
  assert(help.termId&&help.lessonId,routeId);
  assert.equal(project(s),before,routeId+" changed student work");
 }
});
test("contextual Workshop: the sampling box gives a sampling hub even without a mathematical route",()=>{
 const s=state("planning","N03P2"),before=project(s);
 for(const issue of ["population-frame","sample-choice","fix:planning:sample-choice"]){
  const x=contextualWorkshopHelp(s,{spot:"page",issueId:issue});
  assert(x?.termId==="sampling");
  assert.equal(x.lessonId,"sampling");
  const html=renderContextualWorkshopHelp(x,escapeHtml,{compact:true});
  assert(html.includes('data-workshop-term="sampling"'));
  assert(html.includes('data-workshop-id="sampling"'));
  assert(html.includes('data-resource-help="true"'));
  assert.match(html,/Sampling and data selection/);
 }
 assert.equal(project(s),before);
});
test("contextual Workshop: exact writing box changes the mathematical focus on the same route",()=>{
 const s=setRoute(state("completing","C40"),"fitted-models");
 assert.equal(contextualWorkshopHelp(s,{spot:"field:purpose"})?.termId,"model");
 assert.equal(contextualWorkshopHelp(s,{spot:"field:result"})?.termId,"regression-line");
 assert.equal(contextualWorkshopHelp(s,{spot:"part:show"})?.termId,"regression-line");
 assert.equal(contextualWorkshopHelp(s,{spot:"field:interpretation"})?.termId,"residual");
 assert.equal(contextualWorkshopHelp(s,{spot:"part:reflect"})?.termId,"residual");
 assert.equal(contextualWorkshopHelp(s,{spot:"field:nextQuestion"})?.termId,"residual-pattern");
 assert.equal(contextualWorkshopHelp(s,{spot:"part:next"})?.termId,"residual-pattern");
 for(const spot of ["field:purpose","field:result","field:interpretation","field:nextQuestion"]){
  assert(Object.hasOwn(STUDIO_RECOVERY_SPOTS,"C40:"+spot),spot+" not an actual writing box");
 }
});
test("contextual Workshop: selected mathematical method overrides a broader Planning pathway, never prose",()=>{
 const s=setRoute(withMethod(state("completing","C40"),"finance-loan"),"relationships");
 const before=project(s);
 const h=contextualWorkshopHelp(s,{spot:"field:result",issueId:"real-calculation"});
 assert.equal(h?.routeId,"finance");assert.equal(h.lessonId,"finance-loan-repayments");
 assert.equal(h.termId,"loan-amortisation");
 assert(contextualWorkshopHelp(s,{spot:"field:interpretation"})?.lessonId==="finance-loan-repayments");
 s.entries[0].methodId="pmcc";
 assert.equal(contextualWorkshopHelp(s,{spot:"field:interpretation"})?.routeId,"relationships");
 assert.equal(contextualWorkshopHelp(s,{spot:"field:interpretation"})?.lessonId,"pearson");
 s.entries[0].methodId="other";
 s.entries[0].title="I calculated a loan and NPV!";
 s.entries[0].technique="We might calculate loan repayments later";
 assert.equal(contextualWorkshopHelp(s,{spot:"field:result"})?.routeId,"relationships");
 assert.notEqual(contextualWorkshopHelp(s,{spot:"field:result"})?.lessonId,"finance-loan-repayments");
});
test("contextual Workshop: explicitly selected theory and probability pathways get suitable links",()=>{
 const proof=setRoute(state("completing","C30"),"proof");
 const q=contextualWorkshopHelp(proof,{spot:"part:show",issueId:"theory-first"});
 assert(q?.termId==="mathematical-proof"&&q.lessonId==="proof-conjectures");
 const iter=setRoute(state("planning","N04S"),"iteration");
 assert(contextualWorkshopHelp(iter,{spot:"page",issueId:"course-depth"})?.termId==="recurrence-relation");
 const probability=setRoute(state("completing","C30"),"chance");
 assert(contextualWorkshopHelp(probability,{spot:"field:result",issueId:"real-calculation"})?.lessonId==="conditional-probability-tree");
 assert(contextualWorkshopHelp(probability,{spot:"field:interpretation"})?.termId==="expected-value");
});
test("contextual Workshop: consent, unavailable evidence, writing and checking do not trigger premature mathematical instructions",()=>{
 const sample=state("planning","N03P2");
 for(const issue of ["consent-waiting","permission","source-real","source-kind","availability"])
  assert.equal(contextualWorkshopHelp(sample,{spot:"page",issueId:issue}),null,issue);
 const theory=setRoute(state("planning","N03P2"),"proof");theory.planning.fields.kind="theoretical";
 assert.equal(contextualWorkshopHelp(theory,{spot:"page",issueId:"sample-choice"}),null);
 assert.equal(contextualWorkshopHelp(state("planning","N01"),{spot:"aim"}),null);
 assert.equal(contextualWorkshopHelp(state("completing","C10"),{spot:"page"}),null);
 assert.equal(contextualWorkshopHelp(setRoute(state("completing","C60"),"finance"),{spot:"part:answer"}),null);
 assert.equal(contextualWorkshopHelp(state("checking","D09"),{spot:"check:D09"}),null);
 assert.equal(contextualWorkshopHelp(state("completing","C30"),{spot:"field:result"}),null,"No method or route chosen");
});
test("contextual Workshop: hub origin remembers exact help bubble location, not the C95 hub node",()=>{
 const s=setRoute(state("completing","C95"),"optimisation");
 s.completion.support.origin={route:"completing",node:"C40",planNode:"N01",entryId:"",nextFromEntryId:"",helpSpot:"C40:field:interpretation"};
 const view=hubOriginalView(s);
 assert.equal(view.completion.current,"C40");
 assert.equal(view.helpSpot,"C40:field:interpretation");
 const h=contextualWorkshopHelp(view,{spot:view.helpSpot,issueId:"fix:studio:meaning-units"});
 assert(h?.routeId==="optimisation"&&h.termId==="global-extremum"&&h.lessonId==="optimisation");
});
test("contextual Workshop: direct links open the exact definition or guided lesson and preserve IA state",()=>{
 const s=setRoute(state("planning","N03P2"),"groups");
 const before=project(s);
 const h=contextualWorkshopHelp(s,{spot:"page",issueId:"population-frame"});
 const html=renderContextualWorkshopHelp(h,escapeHtml);
 assert(html.includes('data-workshop-route="groups"'));
 assert(!/<script|onerror|<iframe/i.test(html));
 const session=newResourceSession();
 assert(resourceAction(s,session,"resource-workshop",{resourceHelp:"true",workshopRoute:h.routeId,workshopTerm:h.termId},"stuck").ok);
 assert.equal(session.mode,"workshop");assert.equal(session.parent,"stuck");
 assert.equal(session.workshopTerm,"sampling");assert.equal(session.workshopId,"");
 assert(renderWorkshop(s,session).includes('data-workshop-definition="sampling"'));
 assert(resourceAction(s,session,"resource-workshop",{resourceHelp:"true",workshopRoute:h.routeId,workshopId:h.lessonId},"stuck").ok);
 assert.equal(session.workshopId,"sampling");assert.equal(session.workshopTerm,"");
 assert(renderWorkshop(s,session).includes('data-workshop-lesson="sampling"'));
 assert.equal(project(s),before);
});
test("contextual Workshop: issue choice and box identity remain distinct even on one route",()=>{
 assert.equal(workshopHelpFocus("field:result","","C40"),"calculate");
 assert.equal(workshopHelpFocus("field:interpretation","","C40"),"interpret");
 assert.equal(workshopHelpFocus("field:nextQuestion","","C40"),"follow");
 assert.equal(workshopHelpFocus("field:result","sample-relevance","C40"),"sampling");
 assert.equal(workshopHelpFocus("page","proof","C40"),"proof");
 assert.equal(workshopHelpFocus("part:introduce","method-conditions","C40"),"start");
 const noL=renderContextualWorkshopHelp(null,escapeHtml);
 assert.equal(noL,"");
});
