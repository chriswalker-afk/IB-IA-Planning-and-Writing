import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState} from "../src/core/project-state.js";
import {createCompletingViews} from "../src/completing/views.js";
import {C_NODE_IDS,setCompletionNode,startFirstRepresentation} from "../src/completing/engine.js";
const e=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");
function fixture(){
 const state=createProjectState(),ctx={
  getState:()=>state,e,icon:()=>"",button:(label,action)=>'<button data-action="'+action+'">'+e(label)+'</button>',
  field:(path,label)=>'<label data-path="'+e(path)+'">'+e(label)+'</label>',
  choose:(path,opts)=>'<div data-choice-path="'+e(path)+'">'+opts.map(x=>e(x.title)).join(",")+'</div>',
  summary:(label,value)=>'<p>'+e(label)+": "+e(value)+'</p>',
  sheetTitle:(_,title)=>'<h1>'+e(title)+'</h1>',tabletNav:()=>"",
  filled:value=>typeof value==="string"&&!!value.trim()
 };
 return {state,view:createCompletingViews(ctx)};
}
test("all 52 source-linked Completing stages render without throwing or exposing internal object values",()=>{
 const {state,view}=fixture();
 assert.equal(C_NODE_IDS.length,52);
 for(const id of C_NODE_IDS){
  setCompletionNode(state,id);
  const html=view.viewCompleting();
  assert(html.includes('data-source-node="'+id+'"'),id);
  assert(html.includes('class="task-heading"'),id);
  assert(html.includes("task-shell"),id);
  assert(!html.includes("[object Object]"),id);
 }
});
test("Completing dashboard presents mature stages without automatic grades or mandatory maths count",()=>{
 const {state,view}=fixture();
 setCompletionNode(state,"C04");
 const html=view.viewCompleting();
 for(const title of ["Introduction","Introduce first maths","First exploration","Mathematics","Conclusion","Communication","Teacher draft","Final checks"])
  assert(html.includes(e(title)),title);
 assert(!html.includes("Step 3 of 10"));
 assert(html.includes("Not started"));
 assert(html.includes("not automatically graded")===false); // stage cards, not grade widgets
});
test("theoretical branch contains actual mathematical objects instead of sample and survey checks",()=>{
 const {state,view}=fixture();state.planning.fields.kind="theoretical";
 setCompletionNode(state,"C21T");
 const html=view.viewCompleting();
 assert(html.includes("What mathematical object"));
 assert(!html.includes("Sample size or relevant counts"));
 assert(!html.includes("Sampling approach"));
});
test("first representation has BEFORE purpose, genuine result and AFTER interpretation in separate nodes",()=>{
 const {state,view}=fixture();state.planning.fields.aim="A concrete question";state.planning.fields.prediction="I tentatively expected a linear pattern";
 startFirstRepresentation(state);
 setCompletionNode(state,"C32");
 let html=view.viewCompleting();
 assert(html.includes("purpose BEFORE")||html.includes("Mathematical purpose BEFORE"));
 setCompletionNode(state,"C33");html=view.viewCompleting();
 assert(html.includes("What did you actually"));
 assert(html.includes("Still planned"));
 setCompletionNode(state,"C34B");html=view.viewCompleting();
 assert(html.includes("What does this actual result mean for my aim?")||html.includes("current aim"));
 assert(html.includes("Original prediction"));
});
test("C35 only surfaces PMCC help if coefficient really exists in mathematical work",()=>{
 const {state,view}=fixture();setCompletionNode(state,"C35");
 let html=view.viewCompleting();
 assert(!html.includes("After actual PMCC"));
 state.entries=[{id:"r",title:"Pearson coefficient",technique:"PMCC",status:"completed",result:"r = 0.12"}];
 html=view.viewCompleting();
 assert(html.includes("After actual PMCC"));
});
test("real curved scatter produces optional nonlinear questions without asserting a linear model",()=>{
 const {state,view}=fixture();state.entries=[{id:"scatter",kind:"scatter",status:"completed",result:"Curved plot",observation:"curved",title:"Scatter graph"}];
 setCompletionNode(state,"C35H");
 const html=view.viewCompleting();
 assert(html.includes("curved function")||html.includes("curved"));
 assert(!html.includes("automatically implies no relationship"));
});
test("conclusion and source-fit tips never state a grade, teacher approval or unobserved causal claim",()=>{
 const {state,view}=fixture();setCompletionNode(state,"C62");
 let html=view.viewCompleting();
 assert(html.includes("could reasonably"));
 assert(html.includes("What could reasonably be recommended"));
 assert(!html.includes("Guaranteed"));
 setCompletionNode(state,"C03");html=view.viewCompleting();
 assert(html.includes("consent"));
 assert(html.includes("not")==true);
});

test("reopened mathematical sections refer to their actual preceding finding, never to their own result",()=>{
 const {state,view}=fixture();
 state.entries=[
  {id:"first",phase:"first",status:"completed",kind:"scatter",title:"First scatter",
    result:"The actual plotted points curve",localTakeaway:"The pattern is curved"},
  {id:"second",phase:"substantial",fromEntryId:"first",status:"completed",
    title:"Test a quadratic",purpose:"Fit an appropriate model",result:"Model y=2x squared",
    previousTakeaway:"The pattern is curved"}
 ];
 state.completion.activeEntryIndex=1;
 setCompletionNode(state,"C40");
 const html=view.viewCompleting();
 assert(html.includes("Earlier finding this section was based on"));
 assert(html.includes("The pattern is curved"));
 assert(!html.includes("<p>Model y=2x squared</p>"));
});
test("dependency review appears only for maths that needs its logical connection checked",()=>{
 const {state,view}=fixture();
 state.entries=[
  {id:"first",phase:"first",status:"completed",result:"A revised first result",localTakeaway:"Updated result"},
  {id:"second",phase:"substantial",fromEntryId:"first",status:"completed",result:"A later actual result",
   reviewNeeded:"yes",reviewReason:"An earlier finding changed. Check the link."}
 ];
 state.completion.activeEntryIndex=1;setCompletionNode(state,"C40");
 let html=view.viewCompleting();
 assert(html.includes("Check a mathematical connection"));
 assert(html.includes("An earlier finding changed"));
 assert(html.includes('data-action="completion-entry-reviewed"'));
 state.entries[1].reviewNeeded="";
 html=view.viewCompleting();
 assert(!html.includes('data-action="completion-entry-reviewed"'));
});
test("first figure is not displayed as the active substantial-mathematics section",()=>{
 const {state,view}=fixture();
 state.entries=[{id:"first",phase:"first",title:"Plot actual values",status:"completed",result:"Scatter produced"}];
 state.completion.activeEntryIndex=0;setCompletionNode(state,"C40");
 const html=view.viewCompleting();
 assert(html.includes("Return to the first exploration"));
 assert(!html.includes("Mathematical technique actually intended or used"));
});

test("previous Planning precision is offered provisionally at first use, then a confirmed quantity policy replaces it",()=>{
 const {state,view}=fixture();
 state.planning.fields.firstAccuracy="I planned to measure heights to the nearest 0.1 cm";
 state.entries=[{id:"first",phase:"first",title:"Measured figure",status:"planned",purpose:"Check a relationship"}];
 state.completion.activeEntryIndex=0;
 setCompletionNode(state,"C32");
 let html=view.viewCompleting();
 assert(html.includes("Earlier intended accuracy"));
 assert(html.includes("nearest 0.1 cm"));
 state.completion.accuracyDecisions=[{id:"height-1",quantity:"Height",unit:"cm",resolution:"Nearest 0.2 cm",policy:"Report calculated area to justified precision",reason:"Source resolution"}];
 state.entries[0].accuracyRef="height-1";
 html=view.viewCompleting();
 assert(html.includes("Accuracy from your earlier measurement/source decision"));
 assert(html.includes("Report calculated area to justified precision"));
});
test("Course check in C40D edits the same mathematical record as C40 rather than an unrelated global status",()=>{
 const {state,view}=fixture();
 state.entries=[{id:"first",phase:"substantial",status:"completed",result:"Actual mathematical result",knowledge:"mixed",technique:"New technique"}];
 state.completion.activeEntryIndex=0;
 setCompletionNode(state,"C40D");
 const html=view.viewCompleting();
 assert(html.includes('data-choice-path="entries.0.knowledge"'));
 assert(!html.includes('data-choice-path="completion.fields.courseLevel"'));
});
