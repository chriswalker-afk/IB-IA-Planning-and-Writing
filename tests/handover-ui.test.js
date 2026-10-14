import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState} from "../src/core/project-state.js";
import {applyPlanningField, toggleMath} from "../src/planning/engine.js";
import {createPlanningEnvelope,getFieldDiff} from "../src/handover/schema.js";
import {createHandoverViews} from "../src/ui/handover-views.js";

const escape=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
function fixture(){
 const existing=createProjectState(),incoming=createProjectState();
 applyPlanningField(incoming,"aim","Could <math> be persuasive?");
 applyPlanningField(incoming,"beneficiary","A student group");
 applyPlanningField(incoming,"course","AI SL");
 applyPlanningField(incoming,"permissionNeed","yes");
 applyPlanningField(incoming,"teacherQuestion","Ask my teacher about consent");
 toggleMath(incoming,"AI15");
 applyPlanningField(existing,"aim","A newer question I want to preserve");
 existing.entries=[{status:"completed",result:"My actual result"}];
 const envelope=createPlanningEnvelope(incoming);
 const changes=getFieldDiff(existing,envelope);
 const ui=createHandoverViews({
  getState:()=>existing,e:escape,icon:()=>"",
  button:(label,action)=>'<button data-action="'+action+'">'+escape(label)+'</button>',
  field:(path,label)=>'<label>'+escape(label)+'</label>'
 });
 return {existing,envelope,changes,ui};
}
test("document preview shows both old and new values without interpreting text as HTML",()=>{
 const {envelope,changes,ui}=fixture();
 const html=ui.preview({kind:"embedded",fileName:"plan.docx",envelope,changes,warning:"Edited text may not sync"},new Set(["course"]));
 assert(html.includes("A newer question"));
 assert(html.includes("Could &lt;math&gt; be persuasive?"));
 assert(!html.includes("Could <math>"));
 assert(html.includes('data-merge-key="aim"'));
 assert(html.includes('data-merge-key="mathSelected"'));
 assert(html.includes('data-action="merge-apply"'));
 assert(html.includes("completed mathematics"));
 assert(html.includes("will NOT be replaced"));
});
test("unresolved teacher guidance is visible during review without claiming approval",()=>{
 const {envelope,changes,ui}=fixture();
 const html=ui.preview({kind:"embedded",fileName:"plan.pdf",envelope,changes},new Set());
 assert(html.includes("Points originally flagged for teacher review"));
 assert(html.includes("Importing this file is not permission"));
});
test("manual recovery avoids false claims and offers existing work pathways",()=>{
 const {ui}=fixture();
 const html=ui.manual("Scanned PDF without readable text");
 assert(html.includes("Scanned PDF"));
 assert(html.includes('data-action="open-handover"'));
 assert(html.includes('data-action="import-json"'));
});
test("direct handover lets students edit current purpose and course before acknowledgement",()=>{
 const {ui}=fixture();
 const html=ui.confirmation();
 assert(html.includes("Current investigation aim"));
 assert(html.includes("Current beneficiary"));
 assert(html.includes("Mathematics course"));
 assert(html.includes("I have reviewed these details"));
 assert(html.includes("does not confirm consent"));
});
test("a handover confirmation is invalidated by revised maths or a changed beneficiary",()=>{
 const s=createProjectState();
 s.handover.confirmedAt="2026-10-14T10:00:00.000Z";
 applyPlanningField(s,"beneficiary","A new intended audience");
 assert.equal(s.handover.confirmedAt,"");
 assert.equal(s.handover.needsReview,true);
 applyPlanningField(s,"course","AI SL");
 s.handover.confirmedAt="2026-10-14T10:01:00.000Z";
 toggleMath(s,"AI15");
 assert.equal(s.handover.confirmedAt,"");
});
