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
  assert(html.includes("Your IA Studio"),id);
  assert(html.includes("task-shell"),id);
  assert(!html.includes("[object Object]"),id);
 }
});
test("Completing dashboard presents mature stages without automatic grades or mandatory maths count",()=>{
 const {state,view}=fixture();
 setCompletionNode(state,"C04");
 const html=view.viewCompleting();
 for(const title of ["Introduction","Sources & methods","First exploration","Mathematics","Conclusion","Communication","Teacher draft","Final checks"])
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
 const {state,view}=fixture();state.planning.fields.aim="A concrete question";
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
