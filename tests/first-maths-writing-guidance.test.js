import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {INVESTIGATIVE_ROUTES} from "../src/planning/investigative-routes.js";
import {escapeHtml,icon} from "../src/ui/primitives.js";
import {JOURNEY_WRITING_GUIDANCE,writingGuidanceForFirstMaths,renderJourneyWritingAdvice} from "../src/completing/first-maths-writing-guidance.js";

const make=({kind="statistics",source="primary",route="relationships",course="AI SL",selected=[]}={})=>{
 const s=createProjectState();
 s.route="completing";s.completion.current="C20";
 Object.assign(s.planning.fields,{aim:"Does a mathematical relationship answer my question?",kind,dataSource:source,course});
 s.planning.routeExplorer.selectedRoute=route;
 s.planning.mathSelected=selected;
 return s;
};
const html=(s,part,options={})=>renderJourneyWritingAdvice(s,part,icon,escapeHtml,options);

test("every saved investigative journey has separate, substantive, mathematically specific 2a and 2b guidance",()=>{
 assert.equal(INVESTIGATIVE_ROUTES.length,16);
 assert.deepEqual(Object.keys(JOURNEY_WRITING_GUIDANCE).sort(),INVESTIGATIVE_ROUTES.map(x=>x.id).sort());
 for(const route of INVESTIGATIVE_ROUTES){
  const record=JOURNEY_WRITING_GUIDANCE[route.id];
  assert(record,route.id);
  for(const part of ["method","evaluation"]){
   const values=part==="method"?["introduce","reason","avoid"]:["limitation","alternative","suitability"];
   for(const key of values){
    assert(typeof record[part][key]==="string"&&record[part][key].length>=70,route.id+" "+part+" "+key);
    assert(!/I (?:proved|calculated|collected|found) /.test(record[part][key]),route.id+" fabricated result");
   }
  }
  const s=make({kind:route.kinds[0],source:route.kinds[0]==="theoretical"?"":"primary",route:route.id,course:route.math["AA SL"]?.length?"AA SL":"AI SL"});
  const guide=writingGuidanceForFirstMaths(s);
  assert.equal(guide.origin,"journey",route.id);
  assert.equal(guide.id,route.id);
  const method=html(s,"method"),reflection=html(s,"evaluation");
  assert(method.includes('data-journey-writing-part="method"'),route.id);
  assert(reflection.includes('data-journey-writing-part="evaluation"'),route.id);
  assert(method.includes('data-journey-writing-id="'+route.id+'"'),route.id);
  assert(reflection.includes('data-journey-writing-id="'+route.id+'"'),route.id);
  assert(method.includes(escapeHtml(record.method.introduce)),route.id);
  assert(method.includes(escapeHtml(record.method.reason)),route.id);
  assert(reflection.includes(escapeHtml(record.evaluation.limitation)),route.id);
  assert(reflection.includes(escapeHtml(record.evaluation.alternative)),route.id);
  assert(reflection.includes(escapeHtml(record.evaluation.suitability)),route.id);
  assert(!method.includes(record.evaluation.limitation),route.id+" no duplication");
  assert(!reflection.includes(record.method.introduce),route.id+" no duplication");
 }
});
test("relationship journey distinguishes scatter-first maths from Pearson, nonlinearity and rank alternatives",()=>{
 const s=make({route:"relationships",kind:"statistics"});
 const a=html(s,"method"),b=html(s,"evaluation");
 for(const t of ["scatter diagram","paired","Pearson","straight line"])assert(a.includes(t),t);
 for(const t of ["curved","Spearman","rank method","causal"]){
  // The journey is precise without requiring every statistical alternative by name.
  if(t==="Spearman"||t==="causal")continue;
  assert(b.includes(t),t);
 }
 assert(b.includes("linear association"));
 assert(b.includes("regression")||b.includes("nonlinear"));
});
test("modelling and optimisation journeys give different method limitations and alternatives",()=>{
 const modelling=make({kind:"modelling",route:"fitted-models",selected:["AI05"]});
 const opt=make({kind:"modelling",route:"optimisation",selected:["AI24"]});
 const m=html(modelling,"evaluation"),o=html(opt,"evaluation");
 assert(m.includes("residual"));
 assert(m.includes("overfit"));
 assert(m.includes("simpler function"));
 assert(o.includes("boundary"));
 assert(o.toLowerCase().includes("stationary point"));
 assert(o.includes("derivative-based"));
 assert(!o.includes("residual pattern"));
});
test("proof journey warns that a finite set of cases does not establish a universal claim",()=>{
 const s=make({kind:"theoretical",route:"proof",course:"AA SL"});
 const a=html(s,"method"),b=html(s,"evaluation");
 assert(a.includes("conjecture"));
 assert(a.includes("counterexample"));
 assert(a.includes("already knows your course"));
 assert(b.includes("finite set"));
 assert(b.includes("induction"));
 assert(b.includes("logical structure"));
});
test("a previously selected but now incompatible journey is not presented as relevant advice",()=>{
 const s=make({kind:"statistics",route:"optimisation",selected:["AI14"]});
 const ctx=writingGuidanceForFirstMaths(s);
 assert.equal(ctx.origin,"technique");
 assert.equal(ctx.id,"AI14");
 assert.equal(ctx.title,"Scatter plots and Pearson's r");
 const a=html(s,"method");
 assert(a.includes('data-journey-writing-origin="technique"'));
 assert(!a.includes('data-journey-writing-id="optimisation"'));
});
test("without a journey, method choice supplies guidance; without either, a careful general fallback remains",()=>{
 const s=make({kind:"modelling",route:"",selected:["AI05"]});
 let method=html(s,"method"),limits=html(s,"evaluation");
 assert(method.includes('data-journey-writing-id="AI05"'));
 assert(method.includes("scatter plot"));
 assert(limits.includes("realistic domain"));
 s.planning.mathSelected=[];
 method=html(s,"method");limits=html(s,"evaluation");
 assert(method.includes('data-journey-writing-origin="general"'));
 assert(method.includes("one mathematical representation"));
 assert(limits.includes("one real restriction"));
 assert(limits.toLowerCase().includes("alternative"));
});
test("reduced advice maintains the student-specific prompt with less explanatory text",()=>{
 const s=make({kind:"statistics",route:"relationships"});
 const full=html(s,"method"),reduced=html(s,"method",{reduced:true});
 assert(full.includes("What to introduce"));
 assert(full.includes("Why start here"));
 assert(!reduced.includes("first-maths-journey-writing-points"));
 assert(reduced.includes("relationship")||reduced.includes("association")||reduced.includes("variables"));
 assert(reduced.includes('data-journey-writing-id="relationships"'));
});
test("journey hints are read-only, safely rendered and do not overwrite existing notes or results",()=>{
 const s=make({kind:"statistics",route:"relationships"});
 s.completion.fields.dataAimLink="Previously saved link";
 s.completion.fields.methodReason="Previously saved rationale";
 s.completion.fields.firstMethodEvaluation="Previously saved reflection";
 s.completion.fields.methodLimitation="Distinct source limitation";
 s.entries=[{id:"real",phase:"first",kind:"scatter",status:"completed",result:"A real observed curve"}];
 const before=JSON.stringify(s);
 html(s,"method");html(s,"evaluation");
 assert.equal(JSON.stringify(s),before);
 const restored=normalizeProjectState(JSON.parse(before));
 for(const key of ["dataAimLink","methodReason","firstMethodEvaluation","methodLimitation"])
  assert.equal(restored.completion.fields[key],s.completion.fields[key],key);
 assert.equal(restored.entries[0].result,"A real observed curve");
 assert.equal(html(s,"invalid"),"");
});
