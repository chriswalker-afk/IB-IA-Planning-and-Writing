import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createProjectState,normalizeProjectState,persistProjectState,loadProjectState,STATE_VERSION} from "../src/core/project-state.js";
import {INVESTIGATIVE_ROUTES} from "../src/planning/investigative-routes.js";
import {REPRESENTATION_TOOLS} from "../src/diagrams/representation-registry.js";
import {representationAdvice} from "../src/diagrams/representation-hub.js";
import {assessmentFramework,REVISED_2029_CRITERIA} from "../src/essentials/assessment-cohorts.js";

const svgPixel="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/b0gAAAAASUVORK5CYII=";
const copy=x=>JSON.parse(JSON.stringify(x));

test("cleanup final release gate: every pathway resolves to active mathematical creators",()=>{
 assert.equal(INVESTIGATIVE_ROUTES.length,16);
 assert.equal(new Set(INVESTIGATIVE_ROUTES.map(x=>x.id)).size,16);
 assert.equal(REPRESENTATION_TOOLS.length,7);
 assert.equal(new Set(REPRESENTATION_TOOLS.map(x=>x.id)).size,7);
 for(const route of INVESTIGATIVE_ROUTES){
  const s=createProjectState();s.planning.routeExplorer.selectedRoute=route.id;
  const info=representationAdvice(s);
  assert.equal(info.source,"route");
  assert.equal(info.ids.length,2,route.id);
  for(const id of info.ids)assert(REPRESENTATION_TOOLS.some(t=>t.id===id),route.id+" "+id);
 }
});
test("cleanup final release gate: an old draft and its conclusion restore honestly in today's UI",()=>{
 const older={
  version:1,route:"completing",completion:{current:"C63",fields:{
   mainConclusion:"This is the student's original conclusion",
   conclusionUncertainty:"Only a restricted domain is supported"
  }},project:{aim:"A question that predates the diagram studios",permissions:"pending"},
  planning:{current:"N03J",fields:{aim:"The earlier student aim",teacherQuestion:"Ask before extrapolating"}},
  entries:[{id:"old-one",phase:"legacy",status:"planned",result:"",title:"An intended model"}],
  scratch:{introduction:"My original paragraph"},
  cueNotes:{"old-one":"I would like to compare later"}
 };
 const restored=normalizeProjectState(copy(older));
 assert.equal(restored.version,STATE_VERSION);
 assert.equal(restored.planning.current,"N03D");
 assert.equal(restored.completion.current,"C60");
 assert.equal(restored.completion.fields.mainConclusion,older.completion.fields.mainConclusion);
 assert.equal(restored.entries.length,1);
 assert.equal(restored.entries[0].result,"");
 assert.equal(restored.entries[0].status,"planned");
 assert.equal(restored.scratch.introduction,older.scratch.introduction);
 assert.equal(restored.teacher.pendingApproval,true);
 assert.equal(assessmentFramework(restored),"legacy");
});
test("cleanup final release gate: full JSON preserves all seven figure links and legacy review through 2029 changes",()=>{
 const s=createProjectState();
 s.route="completing";s.completion.current="C40";s.completion.activeEntryIndex=0;
 s.planning.fields.aim="An evidence-led mathematical investigation";
 s.planning.fields.assessmentFramework="revised2029";
 s.entries=[{id:"one",phase:"first",status:"completed",result:"Measured mathematical result",title:"Actual work"}];
 s.completion.review.records["draft-D02"].location="Original A-E self-review, page 3";
 s.scratch.introduction="The student's wording";
 s.completion.fields.mainConclusion="A cautious original conclusion";
 for(const tool of REPRESENTATION_TOOLS){
  const id="pass5-"+tool.id,studio=s[tool.studio],draft=copy(studio.draft);
  if(tool.id==="trace"){draft.imageSrc=svgPixel;draft.width=32;draft.height=32;}
  studio.figures=[{id,entryId:"one",savedAt:"2026-10-22T00:00:00.000Z",draft}];
  s.entries[0][tool.entryKey]=id;
 }
 const mem=new Map(),storage={
  getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v)
 };
 persistProjectState(s,storage);
 let restored=loadProjectState(storage);
 assert.equal(restored.entries[0].result,"Measured mathematical result");
 assert.equal(restored.completion.review.records["draft-D02"].location,"Original A-E self-review, page 3");
 assert.equal(assessmentFramework(restored),"revised2029");
 assert.equal(REVISED_2029_CRITERIA.length,4);
 restored.planning.fields.assessmentFramework="legacy";
 assert.equal(assessmentFramework(restored),"legacy");
 restored.planning.fields.assessmentFramework="revised2029";
 restored=normalizeProjectState(copy(restored));
 for(const tool of REPRESENTATION_TOOLS){
  const id="pass5-"+tool.id;
  assert.equal(restored.entries[0][tool.entryKey],id,tool.id);
  assert.equal(restored[tool.studio].figures[0]?.id,id,tool.id);
  assert.equal(restored[tool.studio].figures[0]?.entryId,"one",tool.id);
 }
 assert.equal(restored.completion.fields.mainConclusion,"A cautious original conclusion");
 assert.equal(restored.scratch.introduction,"The student's wording");
 assert.equal(restored.completion.review.records["draft-D02"].location,"Original A-E self-review, page 3");
});
test("cleanup final release gate preserves every formerly monolithic conformance browser journey",()=>{
 const wf=readFileSync(".github/workflows/conformance-browser.yml","utf8");
 const suites=["conformance","stuck","resources","ideas","examples","essentials","experience",
  "timeline","criterion-level","illustrative-samples","math-routes","extended-routes","living-journey"];
 assert.match(wf,/fail-fast: false/);
 assert.match(wf,/workflow_dispatch:/);
 assert.match(wf,/npm run build/);
 for(const suite of suites){
  assert.equal((wf.match(new RegExp(" "+suite+"(?= |\\n)", "g"))||[]).length,1,
   suite+" must be executed once, not silently removed or duplicated");
 }
 assert.match(wf,/conformance-fixtures\.mjs/);
 assert.match(wf,/examples-fixtures\.mjs/);
 assert.match(wf,/experience-fixtures\.mjs/);
 assert.match(wf,/status=0/);
 assert.match(wf,/\|\| status=1/);
});
test("cleanup final release gate retains all seven real-browser generator suites plus restore/cohort/export coverage",()=>{
 const wf=readFileSync(".github/workflows/cleanup-pass5-browser.yml","utf8");
 for(const suite of ["representation-pass5","investigative-routes","chapter-onboarding",
  "graph-studio","stat-studio","table-studio","image-tracer","voronoi-interactive",
  "geometry-studio","probability-tree","criteria-badges","mixed-math","report-exports",
  "cleanup-pass5"]){
  assert(wf.includes("scripts/"+suite+"-browser.py"),"Missing acceptance suite "+suite);
 }
 assert.match(wf,/fail-fast: false/);
 assert.match(wf,/workflow_dispatch:/);
 assert.match(wf,/pull_request:/);
 assert.match(wf,/npm run build/);
 assert.match(wf,/upload-artifact@v4/);
});
