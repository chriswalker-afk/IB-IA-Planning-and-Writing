import test from "node:test";
import assert from "node:assert/strict";
import {PLANNING_CATALOG} from "../src/planning/catalog.js";
import {INVESTIGATIVE_ROUTES} from "../src/planning/investigative-routes.js";
import {createProjectState} from "../src/core/project-state.js";
import {escapeHtml,icon} from "../src/ui/primitives.js";
import {
 TECHNIQUE_START_GUIDES,techniqueStartingGuide,orderSelectedTechniqueGuides,sourceAdviceForTechnique
} from "../src/completing/technique-start-advice.js";
import {firstMathsContext,renderFirstMathsSparks,renderSelectedMathematicsAdvice} from "../src/completing/first-maths-bridge.js";

const make=({source="primary",kind="statistics",course="AI SL",route=""}={})=>{
 const s=createProjectState();
 s.route="completing";s.completion.current="C20";
 Object.assign(s.planning.fields,{kind,dataSource:source,course,aim:"How can mathematics answer this question?"});
 s.planning.routeExplorer.selectedRoute=route;
 return s;
};
const render=s=>renderSelectedMathematicsAdvice(s,icon,escapeHtml);
test("every catalogued AI SL and AA SL choice has a unique, purposeful beginning, diagnostic and decision",()=>{
 const ids=PLANNING_CATALOG.math.map(x=>x.id);
 assert.equal(ids.length,51);
 assert.deepEqual(Object.keys(TECHNIQUE_START_GUIDES).sort(),ids.slice().sort());
 assert.equal(new Set(ids).size,ids.length);
 for(const item of PLANNING_CATALOG.math){
  const g=techniqueStartingGuide(item.id);
  assert(g,item.id+" missing guide");
  assert(["data","flex","abstract"].includes(g.mode),item.id);
  for(const field of ["first","look","next"]){
   assert(g[field].length>50,item.id+" needs substantial "+field+" advice");
   assert(!/\bI (?:collected|measured|discovered|proved)\b/.test(g[field]),item.id+": no invented personal results");
  }
  assert.notEqual(g.first,g.next,item.id);
 }
 assert.equal(techniqueStartingGuide("unknown"),null);
});
test("a quadratic or cubic plan starts with evaluating curvature, not fitting an automatic polynomial",()=>{
 const s=make({kind:"modelling",source:"primary"});
 s.planning.mathSelected=["AI05"];
 const h=render(s);
 assert(h.includes('data-technique-start-guide="AI05"'));
 assert(h.includes("Quadratic or cubic models"));
 assert(h.includes("scatter plot"));
 assert(h.includes("turning point"));
 assert(h.includes("quadratic from a cubic"));
 assert(h.includes("simplest justified model"));
 assert(h.includes("prediction")||h.includes("residuals"));
 assert(h.includes("permission")||h.includes("permitted"));
 assert(!h.includes('data-technique-start-guide="AI15"'));
});
test("Pearson correlation and regression begin with a diagnostic scatter, not premature calculation",()=>{
 const s=make({route:"relationships"});s.planning.mathSelected=["AI15","AI14"];
 const ctx=firstMathsContext(s),h=render(s);
 assert.equal(ctx.activeRoute.id,"relationships");
 const first=h.indexOf('data-technique-start-guide="AI14"');
 const second=h.indexOf('data-technique-start-guide="AI15"');
 assert(first>=0 && second>first);
 assert(h.includes("paired observations")||h.includes("paired values"));
 assert(h.includes("approximately linear"));
 assert(h.includes("association")||h.includes("Pearson's r"));
 assert(h.includes('data-first-maths-other-guides'));
});
test("sampling, hypothesis tests, theoretical proof and calculus all have prerequisites rather than tutorials",()=>{
 const expected={
  AI13:["population","sample","spread"],
  AI20:["two-way frequency table","expected counts","independence"],
  AI21:["expected","observed","chi-squared"],
  AI22:["two groups","independent","t-test"],
  AI24:["constraints","objective","boundaries"],
  AA04:["claim","counterexample","proof"],
  AA09:["domain","one-to-one","inverse"],
  AA21:["function","derivative","appropriate rule"],
  AA24:["integral","substitution","bounds"],
  AA25:["velocity","acceleration","initial conditions"]
 };
 for(const [id,terms] of Object.entries(expected)){
  const g=techniqueStartingGuide(id);
  const combined=[g.first,g.look,g.next].join(" ").toLowerCase();
  for(const t of terms)assert(combined.includes(t.toLowerCase()),id+" must mention "+t);
 }
});
test("primary, secondary, mixed and theoretical sources change the actionable advice safely",()=>{
 const s=make();s.planning.mathSelected=["AI14"];
 const html=source=>{s.planning.fields.dataSource=source;return render(s);};
 assert(html("primary").includes("permitted"));
 assert(html("secondary").includes("published data"));
 assert(html("secondary").includes("Cite the source"));
 assert(html("both").includes("comparable variables"));
 assert(!html("both").includes("measurements you collected yourself"));
 s.planning.fields.kind="theoretical";
 const theory=render(s);
 assert(theory.includes("should not pretend to have observations"));
 s.planning.mathSelected=["AA04"];
 s.planning.fields.course="AA SL";
 const abstract=render(s);
 assert(abstract.includes("collecting a dataset is not automatically necessary"));
});
test("a student who chose several techniques sees one clear start and can open advice for every alternative",()=>{
 const s=make({kind:"modelling",route:"fitted-models"});
 s.planning.mathSelected=["AI09","AI05","AI04","AI06","AI15"];
 const h=render(s);
 assert.equal((h.match(/data-technique-start-guide=/g)||[]).length,5);
 assert(h.includes('data-first-maths-other-guides'));
 assert(h.includes('Advice for my other mathematical possibilities (4)'));
 assert(h.includes('data-technique-start-guide="AI04"'));
 assert(h.indexOf('data-technique-start-guide="AI04"')<h.indexOf('data-technique-start-guide="AI09"'),
  "relevant diagnostic must be featured before complex model evaluation");
 assert.equal((h.match(/first-maths-guide-steps/g)||[]).length,5);
});
test("all 16 optional investigative journeys supply a concrete first step when none of the catalog is chosen",()=>{
 assert.equal(INVESTIGATIVE_ROUTES.length,16);
 for(const route of INVESTIGATIVE_ROUTES){
  const s=make({kind:route.kinds[0],route:route.id,source:route.kinds[0]==="theoretical"?"":"secondary"});
  const h=render(s);
  assert(h.includes('data-route-start-guide="'+route.id+'"'),route.id);
  assert(h.includes(escapeHtml(route.title)),route.id);
  assert(h.includes(escapeHtml(route.first[1])),route.id);
  assert(h.includes(escapeHtml(route.question)),route.id);
  assert(h.includes("Try first"),route.id);
  assert(h.includes("Then decide"),route.id);
 }
});
test("stale route is ignored, and mismatched course is flagged without inventing syllabus equivalence",()=>{
 const s=make({kind:"statistics",course:"AA SL",route:"optimisation"});
 s.planning.mathSelected=["AI05","AA15"];
 const h=render(s);
 assert(!h.includes('data-route-start-guide="optimisation"'));
 assert(h.indexOf('data-technique-start-guide="AA15"')<h.indexOf('data-technique-start-guide="AI05"'));
 assert(h.includes("current course choice differs"));
 assert(h.includes("AA15") || h.includes("Pearson's correlation coefficient"));
 assert(!h.includes("AA15 is verified for AA HL"));
});
test("a custom mathematical idea receives honest support without guessing a technique",()=>{
 const s=make({kind:"modelling",source:"primary"});
 s.planning.fields.otherMaths="Fractal perimeters";
 let h=render(s);
 assert(h.includes('data-custom-maths-start'));
 assert(h.includes("Fractal perimeters"));
 assert(h.includes("legitimate example"));
 s.planning.mathSelected=["AI05"];
 h=render(s);
 assert(h.includes('data-technique-start-guide="AI05"'));
 assert(h.includes('data-first-maths-other-guides'));
 assert(h.includes("Fractal perimeters"));
});
test("missing choices get genuinely useful guidance and never fabricate results",()=>{
 const s=make();s.planning.fields.kind="";
 let h=render(s);
 assert(h.includes("No technique needed yet"));
 assert(h.includes("small, genuine example"));
 assert.equal(s.entries.length,0);
 s.planning.mathSelected=["AI14"];
 const before=JSON.stringify(s);
 h=renderFirstMathsSparks(s,icon,escapeHtml);
 assert(h.includes("How could I actually start?"));
 assert(h.includes("Try first"));
 assert(h.includes("Look for"));
 assert(h.includes("Then decide"));
 assert(h.indexOf("How could I actually start?")<h.indexOf("Browse all saved sparks"));
 assert.equal(JSON.stringify(s),before);
});
test("all custom and Planning text is escaped, including when displayed inside expandable cards",()=>{
 const s=make();
 s.planning.fields.otherMaths='<img src=x onerror=alert(1)>';
 s.planning.fields.aim='<script>alert(1)</script>';
 const h=renderFirstMathsSparks(s,icon,escapeHtml);
 assert(h.includes("&lt;img"));
 assert(h.includes("&lt;script"));
 assert(!h.includes('<img'));
 assert(!h.includes('<script'));
});
