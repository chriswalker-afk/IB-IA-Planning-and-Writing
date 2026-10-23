import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {PLANNING_NODE_IDS,setPlanCurrent,LEGACY_DESTINATION} from "../src/planning/engine.js";
import {C_NODE_IDS} from "../src/completing/engine.js";
import {adviceFor,availableTopics} from "../src/help/stuck.js";
import {captureStuckOrigin,normalizeStuckState} from "../src/help/stuck-state.js";
import {
 planningHelpFor,planningHelpBadge,planningHelpMarkedField,
 PLANNING_RECOVERY_CARDS,PLANNING_RECOVERY_SPOTS
} from "../src/help/planning-help.js";

const fixture=(node="N00B")=>{
 const state=createProjectState();
 state.route="planning";state.planning.current=node;
 return state;
};
const escapeHtml=s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;")
 .replaceAll(">","&gt;").replaceAll('"',"&quot;");

test("Pass 2 authors distinct, actionable, testable problem recovery, not criteria text",()=>{
 assert(PLANNING_RECOVERY_CARDS.length>=25);
 const seen=new Set();
 for(const c of PLANNING_RECOVERY_CARDS){
  assert(!seen.has(c.id),c.id);seen.add(c.id);
  assert(c.label.length>=17&&c.label.length<105,c.id);
  assert(/[?]$/.test(c.question),c.id);
  for(const k of ["action","check","stop","fallback","boundary"])assert(c[k].length>=32,c.id+":"+k);
  assert(!/criterion [A-E]|marks predicted|stronger writing/i.test(c.action),c.id);
  assert(c.action.split(/\s+/).length<=75,c.id);
 }
 for(const [spot,meta] of Object.entries(PLANNING_RECOVERY_SPOTS)){
  const [node,key]=spot.split(":");
  assert(PLANNING_NODE_IDS.includes(node),spot);
  assert(["page","aim","secondaryUrl","prediction"].includes(key),spot);
  assert(meta.title&&meta.ids.length>=1&&meta.ids.length<=4,spot);
  assert(meta.ids.every(id=>seen.has(id)),spot);
 }
});
test("current Idea Lab mode switches different diagnosis choices without assuming any IA result",()=>{
 const s=fixture("N00B");
 const before=JSON.stringify(s);
 const interest=planningHelpFor(s,"page");
 assert(interest.choices.some(x=>x.id==="interest-to-maths"));
 assert(!interest.choices.some(x=>x.id==="data-not-verifiable"));
 assert.equal(JSON.stringify(s),before);
 s.ideaExplorer.map.mode="data";
 const evidence=planningHelpFor(s,"page");
 assert(evidence.choices.some(x=>x.id==="data-to-question"));
 assert(evidence.choices.some(x=>x.id==="data-not-verifiable"));
 assert(!evidence.choices.some(x=>x.id==="interest-too-specific"));
});
test("Planning bubbles are on the current question only and never assume blank means failure",()=>{
 const s=fixture("N01");
 const h=planningHelpFor(s,"aim");
 assert.equal(h.choices.length,2);
 assert.equal(planningHelpFor(s,"page"),null);
 assert.equal(planningHelpFor(s,"secondaryUrl"),null);
 const bubble=planningHelpBadge(s,"aim",escapeHtml);
 assert.match(bubble,/data-stuck-help="N01:aim"/);
 assert.match(bubble,/aria-haspopup="dialog"/);
 assert.match(bubble,/I am stuck/);
 s.route="completing";
 assert.equal(planningHelpFor(s,"aim"),null);
 assert.equal(planningHelpBadge(s,"aim",escapeHtml),"");
});
test("field badge wraps native label without replacing the editable input or its association",()=>{
 const s=fixture("N01");
 const input='<div class="field-group"><label class="field-label" for="field-planning-fields-aim">My aim</label><textarea id="field-planning-fields-aim" data-bind="planning.fields.aim">Original</textarea></div>';
 const r=planningHelpMarkedField(s,"aim",input,escapeHtml);
 assert(r.includes("stuck-field-header"));
 assert(r.includes(input.slice(input.indexOf("<label"),input.indexOf("</label>")+8)));
 assert(r.includes('data-bind="planning.fields.aim"'));
 assert(r.includes(">Original</textarea>"));
 assert.equal(planningHelpMarkedField(s,"other",input,escapeHtml),input);
});
test("theoretical route does not promote sample/data recovery or force a dataset",()=>{
 const s=fixture("N03D");
 s.planning.fields.kind="theoretical";s.planning.fields.dataSource="theoretical";
 const h=planningHelpFor(s,"page");
 assert(h&&h.choices.every(x=>!["availability","published-origin","population-frame","sample-choice"].includes(x.id)));
 s.planning.current="N02T";
 assert(planningHelpFor(s,"page").choices.some(x=>x.id==="theory-no-start"));
});
test("pending permission gets safe and useful first choice; recording it never implies approval",()=>{
 const s=fixture("N03D");
 s.planning.fields.permissionNeed="yes";s.teacher.pendingApproval=true;
 const initial=JSON.stringify(s),h=planningHelpFor(s,"page");
 assert.equal(h.choices[0].id,"consent-waiting");
 assert.equal(h.choices[0].targetNode,"N06T");
 assert.match(h.choices[0].action,/on hold/);
 assert.match(h.choices[0].boundary,/not a mathematical limitation/);
 assert.equal(JSON.stringify(s),initial);
 const n=normalizeProjectState(JSON.parse(initial));
 assert.equal(n.planning.fields.permissionNeed,"yes");
});
test("specific planned choices produce neutral context cues, not a fabricated diagnosis",()=>{
 const s=fixture("N02M");
 s.planning.fields.course="AA SL";
 assert.equal(planningHelpFor(s,"page").context,"AA SL");
 s.planning.fields.course="AA HL";
 assert.equal(planningHelpFor(s,"page").context,"AA HL");
 s.planning.current="N03";s.planning.fields.dataSource="secondary";
 assert.equal(planningHelpFor(s,"page").context,"secondary");
});
test("reduced advice does not remove help and never changes any planning or mathematical entry",()=>{
 const s=fixture("N01P");s.ui.adviceMode="reduced";
 s.planning.fields.prediction="I might find that ...";
 s.entries=[{id:"x",status:"completed",result:"7"}];
 const before=JSON.stringify(s);
 assert(planningHelpFor(s,"prediction").choices.some(x=>x.id==="prediction-not-sure"));
 assert(planningHelpBadge(s,"prediction",escapeHtml));
 assert.equal(JSON.stringify(s),before);
});
test("legacy help destinations point to live stages, not retired Planning pages",()=>{
 const s=fixture("N01");
 captureStuckOrigin(s);
 for(const t of availableTopics(s)){
  const d=adviceFor(s,t.id).target;
  if(d.route==="planning"){
   assert(PLANNING_NODE_IDS.includes(d.node),t.id);
   assert(!Object.hasOwn(LEGACY_DESTINATION,d.node),t.id);
  }
  if(d.route==="completing")assert(C_NODE_IDS.includes(d.node),t.id);
 }
});
test("legacy support captures Checking as a safe origin and retains fields after backup normalization",()=>{
 const s=createProjectState();s.route="checking";
 const origin=captureStuckOrigin(s,{scrollY:91,focusId:"my-review-control"});
 assert.equal(origin.route,"checking");
 const result=normalizeStuckState(JSON.parse(JSON.stringify(s.completion.support)));
 assert.equal(result.origin.route,"checking");
 assert.equal(result.origin.scrollY,91);
 assert.equal(result.origin.focusId,"my-review-control");
 assert.equal(result.task,null);
});
test("untrusted student content cannot become Planning pop-in HTML through a field badge",()=>{
 const s=fixture("N01");s.planning.fields.aim='<img src=x onerror="alert(1)">';
 const h=planningHelpFor(s,"aim");
 assert(h.choices.every(x=>!x.action.includes("<img")));
 const badge=planningHelpBadge(s,"aim",escapeHtml);
 assert(!badge.includes("<img"));
});
