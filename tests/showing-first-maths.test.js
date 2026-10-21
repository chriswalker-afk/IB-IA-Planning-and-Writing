import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState} from "../src/core/project-state.js";
import {escapeHtml,icon} from "../src/ui/primitives.js";
import {JOURNEY_SHOWING_GUIDANCE,showingMathsGuidance,renderShowingMathsAdvice,renderShowingMathsSparks,renderShowingMathsContext} from "../src/completing/showing-first-maths.js";
import {renderStudioWritingStage} from "../src/completing/studio-writing-stages.js";

test("all investigative journeys have four separate grounded showing prompts",()=>{
 assert.equal(Object.keys(JOURNEY_SHOWING_GUIDANCE).length,16);
 for(const [id,g] of Object.entries(JOURNEY_SHOWING_GUIDANCE)){
  for(const key of ["introduce","show","reflect","next"])assert.ok(g[key]?.length>40,id+" missing "+key);
 }
});
test("no long raw data tables are recommended",()=>{
 const x=renderShowingMathsAdvice(createProjectState(),icon,escapeHtml);
 assert.match(x,/not even in the appendix/i);
 assert.match(x,/before they see it/i);
 assert.equal((x.match(/data-show-first-tip=/g)||[]).length,0);
 assert.match(x,/Four tips for showing mathematics clearly/);
 assert.match(x,/data-advice-moved-to-guide="showing-mathematics"/);
});
test("source and route advice stays safe when saved data are untrusted",()=>{
 const s=createProjectState();s.planning.fields.aim="<script>bad()</script>";
 const g=showingMathsGuidance(s);assert.ok(g.introduce&&g.next);
 const html=renderShowingMathsSparks(s,icon,escapeHtml);
 assert.ok(!html.includes("<script>"));assert.match(html,/&lt;script&gt;/);
});
test("the four-stage writing screen displays in both guidance modes",()=>{
 for(const reduced of [true,false]){
  const html=renderStudioWritingStage(createProjectState(),"C30",{
   icon,e:escapeHtml,taskHtml:'<div data-show-first-part="introduce"></div>',
   taskIntro:"A genuine first result",reduced
  });
  assert.match(html,/Showing your first mathematics/);
  assert.match(html,/show-first-sparks/);
  if(reduced){
   assert.match(html,/data-advice-mode="reduced"/);
   assert(!html.includes("show-first-advice"),"Optional first mathematics advice should be hidden");
   assert.match(html,/Show real mathematics, label figures and units clearly/);
   assert.match(html,/data-reduced-saved-context/);
  }else{
   assert.match(html,/show-first-advice/);
   assert.match(html,/data-writing-examples/);
  }
 }
});
test("contextual advice changes for an explicitly selected route",()=>{
 const s=createProjectState();
 const initial=showingMathsGuidance(s);
 assert.ok(initial.introduce);
 s.planning.routeExplorer.selectedRoute="relationships";
 const next=showingMathsGuidance(s);
 if(next.origin==="journey"){
  assert.match(renderShowingMathsContext(s,"next",icon,escapeHtml),/Pearson/);
 }
});
