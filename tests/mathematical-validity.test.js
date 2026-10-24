import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {setCompletionNode} from "../src/completing/engine.js";
import {METHOD_OPTIONS} from "../src/completing/guidance-context.js";
import {createCompletingViews} from "../src/completing/views.js";
import {insightItems,renderSparkShelf} from "../src/ui/insight-threads.js";
import {newGraphStudio,applyPastedGraphData} from "../src/diagrams/graph-core.js";
import {addGraphModel} from "../src/diagrams/graph-actions.js";
import {
 VALIDITY_CHECKS,mathematicalCourseContext,mathematicalValidityContext,
 savedFiguresForMathematics,renderMathematicalValidityAid,renderCourseUnderstandingAid,
 renderDiscoveryValidityRecall,renderConclusionValidityAid
} from "../src/completing/mathematical-validity.js";

const e=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const icon=()=>'<span class="icon"></span>';
function sample(methodId="linear-regression"){
 const s=createProjectState();
 s.planning.fields.aim="Can I estimate walking time from distance?";
 s.entries=[{id:"math1",phase:"first",status:"completed",methodId,
  title:"First measured result",result:"The recorded scatter rises with distance",
  interpretation:"A fitted line might describe the observed range",
  knowledge:"unsure"}];
 s.completion.activeEntryIndex=0;
 return s;
}
function validSavedGraph(){
 const g=newGraphStudio();
 applyPastedGraphData(g,"Time (s)\tDistance (m)\n0\t0\n1\t2.1\n2\t4.5\n3\t7.2");
 Object.assign(g.draft,{title:"Walking measurement graph",sourceKind:"primary"});
 assert.equal(addGraphModel(g,"linear").ok,true);
 return {id:"figure-valid1",entryId:"math1",savedAt:"2026-10-24",draft:structuredClone(g.draft)};
}
const view=s=>createCompletingViews({getState:()=>s,e,icon,
 button:(label,action)=>'<button data-action="'+e(action)+'">'+e(label)+'</button>',
 field:(path,label,hint='')=>'<label data-path="'+e(path)+'" data-hint="'+e(hint)+'">'+e(label)+'</label>',
 choose:(path,options)=>'<div data-choice-path="'+e(path)+'">'+options.map(x=>e(x.title)).join(",")+'</div>',
 summary:(label,value)=>'<p>'+e(label)+': '+e(value)+'</p>',
 sheetTitle:(_,title)=>'<h1>'+e(title)+'</h1>',tabletNav:()=>"",
 filled:x=>typeof x==="string"&&!!x.trim()
}).viewCompleting();

test("every specific student-selectable method receives a distinct mathematical validity check",()=>{
 const methods=METHOD_OPTIONS.map(x=>x[0]).filter(x=>!["","other","follow-journey"].includes(x));
 assert(methods.length>24);
 for(const id of methods){
  assert(VALIDITY_CHECKS[id],"Missing validity guide: "+id);
  const s=sample(id),v=mathematicalValidityContext(s,s.entries[0]);
  assert.equal(v.method,id);
  assert(v.rule.title.length>8,"Guide needs a meaningful heading for "+id);
  for(const property of ["question","limit"])
   assert(v.rule[property].length>25,property+" must be substantive for "+id);
 }
});

test("a free-text result or unrelated plan never determines the mathematical technique",()=>{
 const s=sample("other"),entry=s.entries[0];
 entry.title="Pearson correlation";
 entry.result="r = 0.93, extrapolation looks easy";
 let v=mathematicalValidityContext(s,entry);
 assert.equal(v.method,"general");
 s.planning.routeExplorer.selectedRoute="relationships";
 assert.equal(mathematicalValidityContext(s,entry).method,"general");
 entry.methodId="optimisation";
 assert.equal(mathematicalValidityContext(s,entry).method,"optimisation");
 entry.status="planned";
 assert.equal(mathematicalValidityContext(s,entry),null);
 assert.equal(renderMathematicalValidityAid(s,entry,{e,icon}),"");
 entry.status="completed";entry.result="";
 assert.equal(renderDiscoveryValidityRecall(s,entry,{e}),"");
});

test("only explicitly linked source and accuracy records are recalled for the current mathematical stage",()=>{
 const s=sample(),entry=s.entries[0];
 s.completion.sourceRecords=[
  {id:"actual1",fields:{actualSource:"Measurements from stopwatch",dataStatus:"ready",
   actualMethod:"Repeated trials",modelDomain:"Observed times only",modelAssumptions:"Stable conditions"}},
  {id:"other",fields:{actualSource:"Unrelated class survey",dataStatus:"ready",
   actualMethod:"Anonymous response"}}];
 s.completion.accuracyDecisions=[
  {id:"acc1",quantity:"Time",unit:"s",resolution:"nearest 0.1 s",policy:"Show to 1 dp",
   reason:"Matches instrument display"},
  {id:"acc2",quantity:"Temperature",unit:"°C",resolution:"nearest degree",
   policy:"Show whole numbers"}];
 s.planning.fields.firstAccuracy="nearest 1 mm";
 let v=mathematicalValidityContext(s,entry);
 assert.equal(v.sourceLinks.length,0);
 assert.equal(v.accuracyLinks.length,0);
 assert.match(v.accuracyQuestions,/No confirmed accuracy decision/);
 entry.sourceRefs=["actual1"];entry.accuracyRefs=["acc1"];
 const before=JSON.stringify(s);
 v=mathematicalValidityContext(s,entry);
 assert.deepEqual(v.sourceLinks.map(x=>x.id),["actual1"]);
 assert.deepEqual(v.accuracyLinks.map(x=>x.id),["acc1"]);
 const html=renderMathematicalValidityAid(s,entry,{e,icon});
 for(const expected of ["Measurements from stopwatch","nearest 0.1 s","Show to 1 dp",
  "Observed times only","Stable conditions","Matches instrument display"])
  assert(html.includes(expected),expected);
 assert(!html.includes("Unrelated class survey"));
 assert(!html.includes("Temperature"));
 assert(!html.includes("nearest 1 mm"));
 assert(!html.includes("±0.1"),"resolution must never be turned into assumed uncertainty");
 assert.equal(JSON.stringify(s),before);
});

test("theoretical proof uses domain/logic validity, not invented measurement uncertainty",()=>{
 const s=sample("proof");
 s.entries[0].kind="theory";
 s.entries[0].result="Induction step verified for every positive integer";
 const guide=mathematicalValidityContext(s,s.entries[0]);
 assert.equal(guide.theoretical,true);
 assert.match(guide.sourceQuestions,/definitions|hypotheses/);
 assert.match(guide.accuracyQuestions,/symbolic|numerical approximation/);
 assert(!guide.sourceQuestions.includes("source has not been"));
});

test("a linked saved graph recalls its actual in-sample model diagnostics, not a working draft",()=>{
 const s=sample("linear-regression"),entry=s.entries[0];
 const saved=validSavedGraph();s.graphStudio.figures=[saved];entry.graphFigureId=saved.id;
 const before=JSON.stringify(s);
 const fig=savedFiguresForMathematics(s,entry);
 assert.equal(fig.length,1);
 assert.equal(fig[0].ready,true);
 assert.deepEqual(fig[0].observedRange,[0,3]);
 assert.equal(fig[0].models.length,1);
 assert.equal(fig[0].models[0].n,4);
 assert(Number.isFinite(fig[0].models[0].rmse));
 assert(Number.isFinite(fig[0].models[0].r2));
 let html=renderMathematicalValidityAid(s,entry,{e,icon});
 assert(html.includes("Saved, in-sample model diagnostics"));
 assert(html.includes("RMSE")&&html.includes("R²")&&html.includes("n = 4"));
 assert(html.includes("Observed input range: 0 to 3 s"));
 assert(html.includes("not proof of predictive accuracy"));
 s.graphStudio.draft.raw="999999\t99999";
 const afterwards=savedFiguresForMathematics(s,entry);
 assert.equal(afterwards[0].models[0].rmse,fig[0].models[0].rmse);
 s.graphStudio.draft.raw="";
 assert.equal(JSON.stringify(s),before);
});

test("invalid, hidden, unrelated, and unsaved graph models cannot become authoritative checks",()=>{
 const s=sample("quadratic-fit"),entry=s.entries[0];
 const graph=validSavedGraph();s.graphStudio.figures=[graph];
 assert.equal(savedFiguresForMathematics(s,entry).length,0);
 s.graphStudio.activeId=graph.id;
 s.graphStudio.draft=structuredClone(graph.draft);
 assert.equal(savedFiguresForMathematics(s,entry).length,0);
 entry.graphFigureId=graph.id;
 graph.draft.title="";
 let x=savedFiguresForMathematics(s,entry)[0];
 assert.equal(x.ready,false);
 assert.equal(x.models.length,0);
 assert.match(x.warning,/unresolved figure checks/);
 graph.draft.title="Restored saved title";
 graph.draft.models[0].visible=false;
 x=savedFiguresForMathematics(s,entry)[0];
 assert.equal(x.models.length,0);
 s.entries.push({id:"other-math",phase:"substantial",status:"completed",
  result:"Another result",graphFigureId:graph.id});
 assert.equal(savedFiguresForMathematics(s,entry).length,0,
  "conflicting explicit stage ownership must be treated as ambiguous");
});

test("linked non-graph tools provide mathematical checks, not invented statistics",()=>{
 const s=sample("voronoi"),entry=s.entries[0];
 s.voronoiStudio.figures=[{id:"figure-voronoi1",entryId:entry.id,
  draft:{title:"School locations",sites:[]}}];
 entry.voronoiFigureId="figure-voronoi1";
 const figs=savedFiguresForMathematics(s,entry);
 assert.equal(figs.length,1);
 assert.equal(figs[0].kind,"voronoi");
 assert.match(figs[0].prompt,/distance definition/);
 assert.equal(figs[0].models,undefined);
 assert(!renderMathematicalValidityAid(s,entry,{e,icon}).includes("RMSE"));
});

test("syllabus and unfamiliar mathematics get appropriately different explanations",()=>{
 const s=sample("optimisation"),entry=s.entries[0];
 entry.knowledge="syllabus";
 let c=mathematicalCourseContext(s,entry);
 assert.match(c.text,/do not reproduce a textbook lesson/);
 entry.knowledge="outside";entry.unfamiliarComponent="Lagrange multipliers";
 c=mathematicalCourseContext(s,entry);
 assert.equal(c.firstUse,true);
 assert.equal(c.hasExplanation,false);
 let html=renderCourseUnderstandingAid(s,entry,{e,icon});
 assert(html.includes("first recorded use"));
 assert(html.includes("No explanation or worked step"));
 entry.knowledgeNotes="Use a constraint multiplier to find constrained stationary candidates.";
 entry.understandingExample="Solve grad f = λ grad g";
 html=renderCourseUnderstandingAid(s,entry,{e,icon});
 assert(html.includes("Use a constraint multiplier"));
 assert(html.includes("Solve grad f"));
 assert(!html.includes("No explanation or worked step"));
 s.entries.push({id:"math2",phase:"substantial",status:"completed",
  methodId:"optimisation",unfamiliarComponent:"Lagrange multipliers",
  knowledge:"outside",result:"A second constrained candidate"});
 c=mathematicalCourseContext(s,s.entries[1]);
 assert.equal(c.firstUse,false);
 assert.match(c.text,/earlier completed use/);
 assert(!c.text.includes("fully explained"));
 assert.equal(c.earlierExplanation,true);
 const laterHtml=renderCourseUnderstandingAid(s,s.entries[1],{e,icon});
 assert(laterHtml.includes("explanation or worked example is recorded"));
 assert(!laterHtml.includes("No explanation or worked step"));
 s.entries[0].knowledgeNotes="";
 s.entries[0].understandingExample="";
 c=mathematicalCourseContext(s,s.entries[1]);
 assert.equal(c.earlierExplanation,false);
 assert.equal(c.hasExplanation,false,"a mathematical reflection alone must not count as an explanation");
});

test("unknown course scope remains uncertain; a student's selection is not verified by Pathfinder",()=>{
 const s=sample("algebra"),entry=s.entries[0];
 entry.knowledge="unsure";
 const html=renderCourseUnderstandingAid(s,entry,{e,icon});
 assert(html.includes("data-course-scope=\"unsure\""));
 assert(html.includes("Check the actual mathematics"));
 assert(html.includes("Pathfinder cannot verify course coverage"));
});

test("confirmed limitations are recalled for the specific mathematics, never unrelated work",()=>{
 const s=sample(),entry=s.entries[0];
 s.completion.confirmedLimitations=[
  {id:"lim-one",entryId:entry.id,explanation:"Model domain is short",
   consequence:"Cannot use the fit for much larger distances"},
  {id:"lim-two",entryId:"another",explanation:"Other model failed",
   consequence:"Does not apply here"}
 ];
 const html=renderMathematicalValidityAid(s,entry,{e,icon});
 assert(html.includes("Model domain is short"));
 assert(html.includes("Cannot use the fit for much larger distances"));
 assert(!html.includes("Other model failed"));
});

test("changes flagged for review remain visible with advice in reduced mode",()=>{
 const s=sample("pmcc"),entry=s.entries[0];
 entry.reviewNeeded="yes";s.ui.adviceMode="reduced";
 let html=renderMathematicalValidityAid(s,entry,{e,icon,reduced:true});
 assert(html.includes("data-math-validity=\"math1\""));
 assert(html.includes("Review mathematical inputs and assumptions"));
 assert(html.includes("This result was flagged for review"));
 assert(html.includes("class=\"math-validity-aid is-reduced\""));
 assert(!html.includes("<details open"));
});

test("the Discovery Spark uses the same stage-specific validity, with no duplicate stored record",()=>{
 const s=sample("optimisation"),entry=s.entries[0];
 entry.sourceRefs=["one"];
 s.completion.sourceRecords=[{id:"one",fields:{actualSource:"Measured constraints",
  dataStatus:"ready"}}];
 const before=JSON.stringify(s);
 const full=renderSparkShelf(s,"C34B",{surface:"studio"});
 assert(full.includes("data-spark-validity=\"math1\""));
 assert(full.includes("Feasible optimum"));
 assert(full.includes("1 explicitly linked source"));
 assert.equal(JSON.stringify(s),before);
 const rec=insightItems(s).find(x=>x.id==="result:math1");
 assert(rec&&!rec.planned);
 entry.status="planned";
 assert(!renderSparkShelf(s,"C34B",{surface:"studio"}).includes("data-spark-validity=\"math1\""));
});

test("conclusion recalls only selected review-free mathematical work and never fabricates validation",()=>{
 const s=sample("pmcc");
 s.entries[0].title="Association";
 s.entries.push({id:"other",phase:"substantial",status:"completed",
  methodId:"optimisation",title:"Best dimensions",result:"A stationary point",
  reviewNeeded:"yes"});
 let html=renderConclusionValidityAid(s,{e,icon});
 assert(html.includes("Association")&&html.includes("Linear association"));
 assert(!html.includes("Best dimensions"));
 s.entries.push({id:"math3",phase:"substantial",status:"completed",
  methodId:"proof",title:"General argument",result:"By induction"});
 s.completion.conclusionResultIds=["math1"];
 html=renderConclusionValidityAid(s,{e,icon});
 assert(html.includes("Association"));
 assert(!html.includes("General argument"));
 s.completion.conclusionResultIds=["math3"];
 html=renderConclusionValidityAid(s,{e,icon});
 assert(html.includes("General argument"));
 assert(!html.includes("Association"));
 s.entries[2].reviewNeeded="yes";
 assert.equal(renderConclusionValidityAid(s,{e,icon}).includes("General argument"),false);
 s.entries[0].status="planned";
 assert.equal(renderConclusionValidityAid(s,{e,icon}),"");
});

test("real writing screens and saved project round trips keep validity checks without adding fields",()=>{
 const s=sample("linear-regression"),entry=s.entries[0],before=JSON.stringify(s);
 for(const node of ["C30","C34A"]){
  setCompletionNode(s,node);
  const html=view(s);
  assert(html.includes("data-math-validity=\"math1\""),node);
  assert(html.includes("Input quality"),node);
 }
 s.entries.push({id:"math2",phase:"substantial",fromEntryId:entry.id,status:"completed",
  methodId:"proof",knowledge:"outside",result:"A proof by induction",
  unfamiliarComponent:"Induction for this recurrence"});
 s.completion.activeEntryIndex=1;
 for(const node of ["C40","C50","C40D","C40L"]){
  setCompletionNode(s,node);
  const html=view(s);
  assert(html.includes('data-course-understanding="math2"')||html.includes('data-math-validity="math2"'),node);
  if(["C40","C50"].includes(node)){
   assert(html.includes('</details><aside class="math-course-aid'),
    "The optional course panel must not be nested inside the method disclosure: "+node);
   // Existing browser journeys target the direct summary of this disclosure.
   // Adding another summary beneath it breaks strict-mode navigation.
   const anchor=html.indexOf('<details class="math-stage-optional-method">');
   const course=html.indexOf('data-course-understanding="math2"');
   assert(anchor>=0&&course>anchor,node);
   assert(html.lastIndexOf("</details>",course)>anchor,node);
  }
 }
 setCompletionNode(s,"C60");
 let html=view(s);
 assert(html.includes("data-conclusion-validity"));
 assert(html.includes("Do the mathematical limitations change my conclusion?"));
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.equal(restored.version,s.version);
 assert.equal(restored.entries.length,2);
 assert.equal(mathematicalValidityContext(restored,restored.entries[1]).method,"proof");
 const css=readFileSync(new URL("../data/spark-shelf.css",import.meta.url),"utf8");
 for(const selector of [".math-validity-aid",".spark-validity-recall",
  ".conclusion-validity-aid","summary:focus-visible","prefers-reduced-motion:reduce"])
  assert(css.includes(selector),selector);
 assert.equal(JSON.stringify(entry),JSON.stringify(JSON.parse(before).entries[0]));
});

test("student text is escaped, and no automatic claim of mathematical accuracy is made",()=>{
 const s=sample("linear-regression"),entry=s.entries[0];
 entry.title="<img src=x onerror=alert(1)>";
 entry.result="<script>alert(1)</script>";
 entry.limitations="<svg onload=alert(1)>";
 s.completion.sourceRecords=[{id:"x",fields:{dataStatus:"ready",
  actualSource:"<img src=x onerror=alert(1)>",modelDomain:"<svg onload=alert(1)>"}}];
 entry.sourceRefs=["x"];
 const a=renderMathematicalValidityAid(s,entry,{e,icon});
 assert(!a.includes("<img"));
 assert(!a.includes("<script"));
 assert(!a.includes("<svg"));
 assert(a.includes("&lt;svg"));
 assert(a.includes("not an independently checked error bound"));
});
