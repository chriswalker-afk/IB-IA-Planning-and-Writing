import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {setCompletionNode} from "../src/completing/engine.js";
import {ENTRY_BASE} from "../src/completing/entry-record.js";
import {createCompletingViews} from "../src/completing/views.js";
import {mathematicalValidityContext,renderMathematicalValidityAid} from "../src/completing/mathematical-validity.js";
import {
 CONSEQUENCE_CHECKS,consequentialReflectionCue,renderConsequentialReflectionCue
} from "../src/completing/consequential-reflection.js";
import {
 conclusionCoherenceSnapshot,renderConclusionCoherenceCheck,renderConclusionWorkspace
} from "../src/completing/conclusion-workspace.js";

const e=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;")
 .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const icon=()=>'<span class="icon"></span>';
const field=(path,label)=>'<label data-path="'+e(path)+'">'+e(label)+'</label>';
const stateFor=(method="linear-regression",status="completed")=>{
 const state=createProjectState();
 state.route="completing";
 state.planning.fields.aim="Can a model support a justified estimate?";
 state.planning.fields.provisionalTitle="Estimating time from distance";
 state.entries=[{...ENTRY_BASE,id:"real-stage",phase:"first",status,methodId:method,
  title:"Test one mathematical result",
  result:"Observed fitted result, from genuine measurements",
  interpretation:"Original interpretation in my own words",
  limitations:"Only the observed range was tested"}];
 state.completion.activeEntryIndex=0;
 return state;
};
const completionView=s=>{
 const ctx={getState:()=>s,e,icon,
  button:(label,action)=>'<button data-action="'+e(action)+'">'+e(label)+'</button>',
  field,choose:(path,opts)=>'<div data-choice-path="'+e(path)+'">'+opts.map(x=>e(x.title)).join(",")+'</div>',
  summary:(label,value)=>'<p>'+e(label)+": "+e(value)+'</p>',
  sheetTitle:(_,title)=>'<h1>'+e(title)+'</h1>',tabletNav:()=>"",
  filled:x=>typeof x==="string"&&!!x.trim()};
 return createCompletingViews(ctx).viewCompleting();
};
const actualView=(s,node)=>{
 setCompletionNode(s,node);
 return completionView(s);
};
const conclusionView=s=>renderConclusionWorkspace({state:s,e,icon,field,
 F:(key,label)=>field("completion.fields."+key,label),
 criterionMarkedWritingBox:html=>html,criteriaField:html=>html,
 currentAim:()=>s.planning.fields.aim,plannedPrediction:()=>s.planning.fields.prediction,
 currentBenefit:()=>s.planning.fields.intendedUse,
 savedLimitations:()=>""});

test("mathematical consequences are contextual, not another universal reflection form",()=>{
 const s=stateFor();
 const entry=s.entries[0];
 const before=JSON.stringify(s);
 const context=mathematicalValidityContext(s,entry);
 const cue=consequentialReflectionCue(context);
 assert.equal(cue.method,"linear-regression");
 assert.match(cue.change,/assumption|influential/);
 assert.match(cue.compare,/coefficient|predicted value|residual/);
 assert.equal(cue.tool,"Graph Studio");
 const html=renderMathematicalValidityAid(s,entry,{icon,e});
 assert.equal((html.match(/class="math-validity-aid/g)||[]).length,1,
  "Add the check inside existing disclosure, not an additional prominent box");
 assert.match(html,/data-consequential-reflection="real-stage"/);
 assert.match(html,/data-action="completion-open" data-node="C31"/);
 assert(html.indexOf("Your limitation note") < html.indexOf("One mathematical way to test the consequence"));
 assert.match(html,/<details><summary>/);
 assert.equal(JSON.stringify(s),before,"Read-only prompts must not write into a saved stage");
});

test("a planned, empty, or review-flagged result never becomes sensitivity evidence",()=>{
 const s=stateFor("linear-regression","planned"),entry=s.entries[0];
 assert.equal(mathematicalValidityContext(s,entry),null);
 assert.equal(renderMathematicalValidityAid(s,entry,{icon,e}),"");
 entry.status="completed";entry.result="";
 assert.equal(mathematicalValidityContext(s,entry),null);
 entry.result="A genuine observed result";entry.reviewNeeded="yes";
 const flagged=renderMathematicalValidityAid(s,entry,{icon,e});
 assert.match(flagged,/flagged for review/);
 assert(!flagged.includes("data-consequential-reflection"));
 entry.reviewNeeded="";
 assert.match(renderMathematicalValidityAid(s,entry,{icon,e}),/data-consequential-reflection/);
});

test("explicit mathematical method matters, not planning guesses or free-text similarity",()=>{
 const s=stateFor("other"),entry=s.entries[0];
 entry.title="Correlation and regression, with a claimed perfect fit";
 entry.result="The calculated Pearson correlation and regression were excellent";
 entry.limitations="";
 s.planning.routeExplorer.selectedRoute="relationships";
 assert.equal(mathematicalValidityContext(s,entry).method,"general");
 assert.equal(consequentialReflectionCue(mathematicalValidityContext(s,entry)),null);
 assert(!renderMathematicalValidityAid(s,entry,{icon,e}).includes("data-consequential-reflection"));
 entry.limitations="I changed one source assumption";
 const cue=consequentialReflectionCue(mathematicalValidityContext(s,entry));
 assert.equal(cue.method,"general");
 assert.match(cue.change,/one important limitation/);
 assert.equal(cue.tool,"","No unjustified tool recommendation for an unspecified method");
 assert(!renderMathematicalValidityAid(s,entry,{icon,e}).includes('data-node="C31"'));
});

test("different mathematical routes suggest a genuine method-specific comparison",()=>{
 const cases=[
  ["pmcc",/full dataset/,"Graph Studio"],
  ["optimisation",/parameter or constraint/,""],
  ["geometric-model",/measured dimension/,"Geometry & Measurements"],
  ["normal",/one justified model parameter/,"Probability Distribution Studio"],
  ["binomial",/trial count or success probability/,"Probability Distribution Studio"],
  ["two-sample-t",/genuine group data/,""],
  ["chi-independence",/expected cell counts/,""],
  ["chi-fit",/category probabilities/,""],
  ["probability",/conditional probability/,"Probability Tree Studio"],
  ["finance-cashflow",/cash receipt or payment/,""],
  ["numerical-integration",/finer partition/,""],
  ["proof",/boundary of the stated domain/,""],
  ["algebra",/domain boundary/,""]
 ];
 for(const [method,pattern,tool] of cases){
  assert.ok(Object.hasOwn(CONSEQUENCE_CHECKS,method),method);
  const c=consequentialReflectionCue({
   entryId:"id",result:"Genuine completed work",method,needsReview:false,
   figures:[],confirmedLimitations:[],recordedLimitation:""
  });
  assert.match(c.change,pattern,method);
  assert.equal(c.tool,tool,method);
  assert.match(c.compare,/compare|recalculate|substitute|explain|interpret|not |which|state|check/i,method);
 }
});

test("only explicitly linked saved graphs are recalled as evidence, never an unsaved draft",()=>{
 const s=stateFor("linear-regression");
 s.graphStudio.draft={title:"Unlinked draft",points:[{x:1,y:2}]};
 let cue=consequentialReflectionCue(mathematicalValidityContext(s,s.entries[0]));
 assert.equal(cue.linkedGraph,false);
 const linked=consequentialReflectionCue({
  entryId:"real-stage",result:"Genuine fitted result",method:"linear-regression",
  needsReview:false,figures:[{id:"fig1",kind:"graph",ready:true}],
  confirmedLimitations:[],recordedLimitation:""
 });
 assert.equal(linked.linkedGraph,true);
 const html=renderConsequentialReflectionCue({entryId:"real-stage",result:"Completed model",method:"linear-regression",
  needsReview:false,figures:[{id:"fig1",kind:"graph",ready:true}],
  confirmedLimitations:[],recordedLimitation:""},{e,icon});
 assert.match(html,/explicitly linked saved graph/);
 assert(!html.includes("Unlinked draft"));
});

test("reduced advice retains collapsed consequence guidance without changing other writing",()=>{
 const s=stateFor("normal");s.ui.adviceMode="reduced";
 setCompletionNode(s,"C30");
 const before=JSON.stringify(s),html=completionView(s);
 assert.match(html,/data-consequential-reflection="real-stage"/);
 assert.match(html,/consequential-reflection-cue is-reduced/);
 assert.match(html,/Open diagram &amp; table tools/);
 assert.equal(JSON.stringify(s),before,
  "Rendering in reduced mode must not rewrite data or notes");
});

test("consequence prompt remains confined to the real result in the later mathematical stage",()=>{
 const s=stateFor("proof");
 s.entries[0].result="A genuine earlier proof";
 s.entries.push({...ENTRY_BASE,id:"later",phase:"substantial",fromEntryId:"real-stage",
   methodId:"optimisation",status:"completed",result:"An actual optimum"});
 s.completion.activeEntryIndex=1;
 for(const page of ["C40","C50"]){
  const html=actualView(s,page);
  assert.match(html,/data-consequential-reflection="later"/,page);
  assert(!html.includes('data-consequential-reflection="real-stage"'),page);
 }
 s.entries[1].reviewNeeded="yes";
 assert(!actualView(s,"C40").includes('data-consequential-reflection="later"'));
});

test("conclusion consistency check is single, collapsed and uses only existing fields",()=>{
 const s=stateFor("linear-regression");
 s.completion.fields.mainConclusion="The fitted line is useful only in the measured range.";
 s.completion.fields.conclusionBenefit="Predictions beyond that range were not tested.";
 s.completion.conclusionResultIds=["real-stage"];
 const before=JSON.stringify(s);
 const context=conclusionCoherenceSnapshot(s,s.planning.fields.aim);
 assert.equal(context.title,"Estimating time from distance");
 assert.equal(context.aim,"Can a model support a justified estimate?");
 assert.equal(context.answer,s.completion.fields.mainConclusion);
 const html=conclusionView(s);
 assert.match(html,/data-conclusion-coherence/);
 assert.equal((html.match(/data-conclusion-coherence/g)||[]).length,1);
 assert.match(html,/Estimating time from distance/);
 assert.match(html,/The fitted line is useful only in the measured range/);
 assert.match(html,/Predictions beyond that range were not tested/);
 assert(html.indexOf('data-conclusion-part="meaning"')<html.indexOf("data-conclusion-coherence"));
 assert(html.indexOf("data-conclusion-coherence")<html.indexOf('data-conclusion-part="next"'));
 assert.match(html,/<details class="conclusion-original-context conclusion-coherence-check/);
 assert(!html.includes("You scored")&&!html.includes("automatically matches"));
 assert.equal(JSON.stringify(s),before);
});

test("no conclusion answer means no premature comparison or extra writing box",()=>{
 const s=stateFor();
 s.completion.fields.conclusionBenefit="An earlier limitation note";
 assert.equal(conclusionCoherenceSnapshot(s,s.planning.fields.aim),null);
 assert(!conclusionView(s).includes("data-conclusion-coherence"));
 s.completion.fields.mainConclusion="An answer recorded from my work";
 s.planning.fields.provisionalTitle="";
 const html=conclusionView(s);
 assert.match(html,/No provisional title saved/);
 assert.match(html,/data-conclusion-coherence/);
 assert.equal((html.match(/data-path="completion.fields.mainConclusion"/g)||[]).length,1);
});

test("flagged selected evidence stays visibly unconfirmed, never silently replaced",()=>{
 const s=stateFor("linear-regression");
 s.completion.fields.mainConclusion="My earlier conclusion needs checking";
 s.entries[0].reviewNeeded="yes";
 s.completion.conclusionResultIds=["real-stage"];
 s.entries.push({...ENTRY_BASE,id:"unrelated",status:"completed",
  result:"A different valid result",methodId:"normal"});
 const c=conclusionCoherenceSnapshot(s,s.planning.fields.aim);
 assert.equal(c.unresolvedCount,1);
 const html=conclusionView(s);
 assert.match(html,/1 selected mathematical result is no longer confirmed/);
 assert.match(html,/no substitute result has been chosen/);
 assert(!html.includes("data-consequential-reflection"),"No new sensitivity claim on the final conclusion page");
});

test("student-authored title, maths, reflection, limits and conclusion survive restoration",()=>{
 const s=stateFor("binomial");
 s.planning.fields.provisionalTitle="My own working title";
 s.planning.fields.aim="My own mathematical question";
 s.entries[0].interpretation="My original actual interpretation";
 s.entries[0].limitations="My recorded mathematical limitation";
 s.entries[0].reviewNeeded="yes";
 s.completion.fields.mainConclusion="My own final conclusion";
 s.completion.fields.conclusionBenefit="My own statement of limits";
 s.completion.conclusionResultIds=["real-stage"];
 const before=JSON.stringify(s);
 renderConclusionCoherenceCheck(s,s.planning.fields.aim,{e,icon,reduced:true});
 renderMathematicalValidityAid(s,s.entries[0],{e,icon});
 assert.equal(JSON.stringify(s),before);
 const imported=normalizeProjectState(structuredClone(s));
 for(const field of ["provisionalTitle","aim"])
  assert.equal(imported.planning.fields[field],s.planning.fields[field]);
 for(const field of ["mainConclusion","conclusionBenefit"])
  assert.equal(imported.completion.fields[field],s.completion.fields[field]);
 for(const field of ["result","interpretation","limitations","reviewNeeded"])
  assert.equal(imported.entries[0][field],s.entries[0][field]);
 assert.deepEqual(imported.completion.conclusionResultIds,["real-stage"]);
});

test("student text is escaped and never interpolated as HTML or a generated verdict",()=>{
 const s=stateFor("linear-regression");
 s.planning.fields.provisionalTitle='<img src=x onerror="alert(1)">';
 s.planning.fields.aim='<script>document.wrong()</script>';
 s.completion.fields.mainConclusion='<b>my answer</b> & not automatically verified';
 const html=renderConclusionCoherenceCheck(s,s.planning.fields.aim,{e,icon});
 assert(!html.includes("<img"));
 assert(!html.includes("<script"));
 assert(!html.includes("<b>my answer"));
 assert.match(html,/&lt;img/);
 assert.match(html,/&lt;script/);
 assert.match(html,/&lt;b&gt;my answer/);
 assert.match(html,/not an automatic similarity score/);
});
