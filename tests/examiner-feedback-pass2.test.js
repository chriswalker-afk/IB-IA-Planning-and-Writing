import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {createCompletingViews} from "../src/completing/views.js";
import {createPlanningViews} from "../src/ui/planning-views.js";
import {setCompletionNode,normalizeCompletionState} from "../src/completing/engine.js";
import {ENTRY_BASE} from "../src/completing/entry-record.js";
import {
 STATISTICAL_TEST_READINESS,statisticalTestReadiness,renderStatisticalTestReadiness
} from "../src/completing/statistical-readiness.js";

const e=value=>String(value??"").replace(/&/g,"&amp;").replace(/</g,"&lt;")
 .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const icon=()=>""; // No icon CSS or external SVG is needed for semantic HTML checks.
function screen(s){
 const ctx={
  getState:()=>s,e,icon,
  button:(label,action)=>'<button data-action="'+e(action)+'">'+e(label)+'</button>',
  field:(path,label)=>'<label data-path="'+e(path)+'">'+e(label)+'</label>',
  choose:(path,options)=>'<div data-choice-path="'+e(path)+'">'+options.map(x=>e(x.title)).join(" ")+'</div>',
  summary:(label,value)=>'<p>'+e(label)+' '+e(value)+'</p>',
  sheetTitle:(_,title)=>'<h1>'+e(title)+'</h1>',
  tabletNav:()=>"",filled:value=>typeof value==="string"&&!!value.trim(),
  numberPick:()=>"",note:x=>x,helpButton:()=>"",helpBox:()=>""
 };
 return {completion:createCompletingViews(ctx),planning:createPlanningViews(ctx)};
}
function mathEntry(id,method,phase="first"){
 return {...ENTRY_BASE,id,phase,methodId:method,status:"planned"};
}
function cHtml(s,id){
 setCompletionNode(s,id);
 return screen(s).completion.viewCompleting();
}

test("only an explicitly selected hypothesis test unlocks the pre-test checklist",()=>{
 assert.deepEqual(Object.keys(STATISTICAL_TEST_READINESS).sort(),
  ["chi-fit","chi-independence","two-sample-t"]);
 const s=createProjectState();
 s.planning.fields.aim="Compare group means";s.planning.fields.kind="statistics";
 s.planning.routeExplorer.selectedRoute="groups";
 assert.equal(statisticalTestReadiness(null),null);
 for(const method of ["","pmcc","spearman","normal","binomial","other","toString","__proto__","constructor"]){
  assert.equal(statisticalTestReadiness({methodId:method,result:"Some statistics"}),null,method);
 }
 assert.equal(statisticalTestReadiness({methodId:"",technique:"Chi-squared independence",
  title:"Use a chi test",result:"The p-value is 0.001"}),null);
 const planned={methodId:"chi-independence",status:"planned",result:"",reviewNeeded:""};
 const before=JSON.stringify(planned);
 assert.equal(statisticalTestReadiness(planned).method,"chi-independence");
 assert.equal(renderStatisticalTestReadiness(planned,{e,icon}).includes("data-statistical-readiness"),true);
 assert.equal(JSON.stringify(planned),before,"Read-only advice must not mutate the student's mathematical step");
});

test("method-specific checks distinguish test conditions, statistics and honest conclusions",()=>{
 const t=renderStatisticalTestReadiness({methodId:"two-sample-t"},{e,icon});
 assert.match(t,/population means/);
 assert.match(t,/matched\/paired/);
 assert.match(t,/independent/);
 assert.match(t,/degrees of freedom/);
 assert.match(t,/effect size/);
 assert.match(t,/significance level/);
 assert(!t.includes("Yates"));
 const independence=renderStatisticalTestReadiness({methodId:"chi-independence"},{e,icon});
 assert.match(independence,/contingency table/);
 assert.match(independence,/row total/);
 assert.match(independence,/degrees of freedom/);
 assert.match(independence,/2×2 table/);
 assert.match(independence,/Yates/);
 assert.match(independence,/not evidence of causation/);
 const fit=renderStatisticalTestReadiness({methodId:"chi-fit"},{e,icon});
 assert.match(fit,/category probabilities/);
 assert.match(fit,/parameter estimation/);
 assert.match(fit,/interval boundaries/);
 assert.match(fit,/expected counts/);
 assert(!fit.includes("Yates"),"Yates must not be a universal chi-squared instruction");
 for(const html of [t,independence,fit]){
  assert.match(html,/<details><summary>/,"Native, keyboard and touch accessible disclosure");
  assert.match(html,/H0/);
  assert.match(html,/H1/);
  assert.match(html,/before/);
  assert.match(html,/p-value/);
  assert.match(html,/do not retrospectively claim/);
  assert(!html.includes("Your p-value is"),"Never pretend a result was computed");
  assert(!html.includes("<textarea"),"No duplicated compulsory answer form");
 }
});

test("reduced advice leaves essential method-specific help accessible and honours review flags",()=>{
 const student={...ENTRY_BASE,methodId:"chi-independence",status:"completed",result:"A real test",
  reviewNeeded:"yes",reviewReason:"The source changed."};
 const before=JSON.stringify(student);
 const full=renderStatisticalTestReadiness(student,{e,icon}),reduced=renderStatisticalTestReadiness(student,{e,icon,reduced:true});
 assert.match(full,/flagged for review/);
 assert.match(reduced,/is-reduced/);
 assert.match(reduced,/H0/);
 assert.match(reduced,/expected cell counts/);
 assert.match(reduced,/<summary>/);
 assert.equal(JSON.stringify(student),before);
 assert.equal(renderStatisticalTestReadiness({...student,reviewNeeded:""},{e,icon}).includes("flagged for review"),false);
});

test("pre-test checklist appears before showing calculations on first and later maths screens",()=>{
 const s=createProjectState();
 s.entries=[mathEntry("first","chi-independence")];
 s.completion.activeEntryIndex=0;
 let html=cHtml(s,"C30");
 assert.match(html,/data-statistical-readiness="chi-independence"/);
 assert(html.indexOf('data-statistical-readiness=') < html.indexOf('data-show-first-part="show"'));
 assert(html.indexOf('data-show-first-part="introduce"') < html.indexOf('data-statistical-readiness='));
 s.entries[0].methodId="proof";
 html=cHtml(s,"C30");
 assert(!html.includes("data-statistical-readiness"),"No test advice when theoretical proof is selected");
 s.entries[0]={...s.entries[0],status:"completed",result:"A legitimate earlier result",methodId:"proof"};
 s.entries.push({...mathEntry("later","two-sample-t","substantial"),fromEntryId:"first"});
 s.completion.activeEntryIndex=1;
 for(const page of ["C40","C50"]){
  html=cHtml(s,page);
  assert.match(html,/data-statistical-readiness="two-sample-t"/);
  assert(html.indexOf('data-statistical-readiness=') < html.indexOf('data-show-first-part="show"'),page);
 }
 s.ui.adviceMode="reduced";
 html=cHtml(s,"C40");
 assert.match(html,/statistical-readiness-aid is-reduced/);
});

test("the same saved sampling rationale now sits beside the genuine count, not in a duplicate box",()=>{
 const s=createProjectState();
 const f=s.completion.fields;
 f.statisticalPopulation="Students with access to the school canteen";
 f.sampleOrCensus="sample";f.sampleSize="26";
 f.samplingRationale="26 observations limit subgroups but allow one initial estimate.";
 f.pairing="Scores and meal prices from the same observations";
 f.dataCleaning="One transcription error corrected against original";
 const before=JSON.stringify(s.completion.fields);
 let html=cHtml(s,"C21S");
 assert.equal(html.match(/data-path="completion.fields.sampleSize"/g)?.length,1);
 assert.equal(html.match(/data-path="completion.fields.samplingRationale"/g)?.length,1);
 assert(html.indexOf('data-path="completion.fields.sampleSize"') <
  html.indexOf('data-path="completion.fields.samplingRationale"'));
 assert.match(html,/data-sample-rationale open/,"Existing text must be exposed for review");
 assert.match(html,/data-paired-outlier-check/);
 assert.match(html,/complete \(x, y\) pair/);
 assert.match(html,/not just whether one x or y value is extreme/);
 assert.match(html,/do not discard inconvenient data to force a prediction/i);
 assert.equal(JSON.stringify(s.completion.fields),before);
 f.sampleOrCensus="census";f.pairing="";
 html=cHtml(s,"C21S");
 assert.match(html,/attempted census/);
 assert.match(html,/missed units or nonresponse/);
 assert(!html.includes("data-paired-outlier-check"));
 f.sampleOrCensus="secondary";
 html=cHtml(s,"C21S");
 assert.match(html,/published data/);
 assert.match(html,/source population, sample size and selection method/);
 f.sampleOrCensus="unsure";
 html=cHtml(s,"C21S");
 assert.match(html,/before judging whether the number and selection method/);
 html=cHtml(s,"C21T");
 assert(!html.includes("data-sample-rationale"),"Theoretical work must not inherit sample requirements");
});

test("planning adds sample-size thinking without a second speculative sample count",()=>{
 const s=createProjectState();s.route="planning";
 s.planning.current="N03P2";s.planning.fields.dataSource="primary";
 const html=screen(s).planning.viewPlanning();
 assert.match(html,/You do not need a fixed sample count in your plan/);
 assert.match(html,/once you have actual observations/i);
 assert.match(html,/why might this method work/i);
 assert(!html.includes('primarySampleSize'),"One actual count only, captured in C21S");
});

test("legacy backups preserve the original sampling answer and all mathematical writing",()=>{
 const s=createProjectState();
 s.completion.fields.samplingRationale="The collected sample allows a narrow comparison, not a population claim.";
 s.completion.fields.sampleSize="19";
 s.entries=[{...mathEntry("original","chi-independence"),result:"An actual result",
  interpretation:"A careful student interpretation",reviewNeeded:"yes"}];
 const raw=structuredClone(s);
 const restored=normalizeProjectState(raw);
 assert.equal(restored.completion.fields.samplingRationale,s.completion.fields.samplingRationale);
 assert.equal(restored.completion.fields.sampleSize,"19");
 assert.equal(restored.entries[0].result,"An actual result");
 assert.equal(restored.entries[0].interpretation,"A careful student interpretation");
 assert.equal(restored.entries[0].reviewNeeded,"yes");
 const incomplete=normalizeCompletionState({fields:{sampleSize:"12",samplingRationale:"A real old note"}});
 assert.equal(incomplete.fields.sampleSize,"12");
 assert.equal(incomplete.fields.samplingRationale,"A real old note");
});
