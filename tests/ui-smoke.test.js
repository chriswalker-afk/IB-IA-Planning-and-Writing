import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
import {createProjectState,normalizeProjectState,persistProjectState} from "../src/core/project-state.js";
import {readRecordValue,updateRecordValue} from "../src/core/record-access.js";
import {icon,escapeHtml,cleanUrl,button} from "../src/ui/primitives.js";
import {referenceNodeForPrototypeStep} from "../src/core/prototype-bridge.js";
import {createPlanningViews} from "../src/ui/planning-views.js";
import {createStudioViews} from "../src/ui/studio-views.js";
import {createProjectViews} from "../src/ui/project-views.js";

const read=p=>readFileSync(new URL(p,import.meta.url),"utf8");
function createHarness(savedValue){
  const events={};
  const store=new Map(savedValue?[["ia-pathfinder-prototype-v1",JSON.stringify(savedValue)]]:[]);
  const classList={add(){},remove(){},toggle(){}};
  const elements={};
  for(const id of ["#main","#drawerLayer","#saveStatus","#pathCount","#sideMilestones","#importFile","#toast"]){
    elements[id]={innerHTML:"",textContent:"",hidden:id==="#drawerLayer",classList,focus(){},addEventListener(n,cb){events["file-"+n]=cb;}};
  }
  elements["#drawerLayer"].querySelector=()=>({focus(){}});
  const document={
    querySelector:q=>elements[q]??null,
    querySelectorAll:()=>[],
    addEventListener:(n,cb)=>events[n]=cb,
    contains:()=>true,
    body:{classList}
  };
  const storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
  const window={scrollTo(){},confirm:()=>true,alert(){},print(){}};
  const script=read("../app.js").replace(/^import\s+.*;\s*$/gm,"");
  const globals={
    document,window,localStorage:storage,console,clearTimeout(){},setTimeout(){return 1;},
    createProjectState,normalizeProjectState,persistProjectState,
    readRecordValue,updateRecordValue,icon,escapeHtml,cleanUrl,button,
    referenceNodeForPrototypeStep,createPlanningViews,createStudioViews,createProjectViews
  };
  runInNewContext(script,globals,{filename:"app.js",timeout:5000});
  function click(type,dataset){
    const element={dataset,focus(){},closest(selector){return selector==="[data-"+type+"]"?this:null;}};
    events.click({target:element});
    return elements["#main"].innerHTML;
  }
  return {
    get html(){return elements["#main"].innerHTML;},
    get drawer(){return elements["#drawerLayer"].innerHTML;},
    get saved(){return JSON.parse(store.get("ia-pathfinder-prototype-v1")??"null");},
    action:(action,other={})=>click("action",{action,...other}),
    choose:(choice,value)=>click("choice",{choice,value}),
    nav:nav=>click("nav",{nav}),
    write:(bind,value)=>events.input({target:{dataset:{bind},value}}),
    status:()=>elements["#saveStatus"].innerHTML
  };
}
test("module app boots to the existing homepage with a keyboard-friendly navigation",()=>{
 const h=createHarness();
 assert(h.html.includes("Big questions"));
 assert(h.html.includes("Find my starting point"));
 assert(h.html.includes("data-nav=\"home\""));
});
test("ten-step prototype planning still works after UI extraction and traces to source nodes",()=>{
 const h=createHarness();
 h.action("start-planning");
 assert(h.html.includes('data-source-node="N00"'));
 h.choose("project.ideaStatus","yes");
 h.action("plan-next");assert(h.html.includes('data-source-node="N01"'));
 h.write("project.aim","How does X relate to Y?");
 h.action("plan-next");assert(h.html.includes("Who might benefit?"));
 h.action("plan-next");h.choose("project.kind","statistics");
 h.action("plan-next");h.choose("project.dataSource","secondary");
 h.action("plan-next");h.choose("project.readiness","4");
 h.action("plan-next");h.choose("project.mathsArea","relationships");
 h.action("plan-next");h.action("plan-next");h.action("plan-next");
 assert(h.html.includes("Your first path is taking shape"));
 assert.equal(h.saved.project.aim,"How does X relate to Y?");
 assert.equal(h.saved.version,2);
});
test("maths can remain planned without inventing interpretation, then actual work can be recorded",()=>{
 const h=createHarness();
 h.nav("completing");h.action("studio-math");h.action("math-add");
 assert(h.html.includes("Only planned so far"));
 assert(h.html.includes("Interpret result"));
 h.choose("entries.0.status","completed");h.choose("entries.0.kind","scatter");
 h.write("entries.0.result","Real graph shows a curved pattern");
 h.action("math-interpret");
 assert(h.html.includes("What does your mathematics tell you?"));
 h.choose("entries.0.observation","curved");
 h.write("entries.0.interpretation","A curved model might be appropriate.");
 h.action("math-next");
 assert(h.html.includes("Where does your investigation go next?"));
 h.action("suggest-next",{index:"0",suggestion:"0"});
 h.action("math-add-next");
 assert.equal(h.saved.entries.length,2);
 assert.equal(h.saved.entries[0].status,"completed");
 assert.equal(h.saved.entries[1].status,"planned");
});
test("map, report and sample discovery still render after refactoring",()=>{
 const h=createHarness();
 h.nav("path");assert(h.html.includes("My mathematical path"));
 h.nav("report");assert(h.html.includes("My mathematical investigation"));
 h.action("open-demos");assert(h.drawer.includes("Choose a sample"));
 h.action("load-demo",{demo:"curved"});
 assert(h.html.includes("Sample investigation"));
 h.nav("report");assert(h.html.includes("DEMONSTRATION DATA"));
});
test("saved v1 browser project migrates on load without losing its real notes",()=>{
 const v1={version:1,route:"completing",project:{aim:"Old question",precision:"nearest 0.1",permissions:"pending"},
 ui:{planStep:3,planMax:4,studioSection:"overview"},scratch:{introduction:"My original text"},entries:[],cues:{}};
 const h=createHarness(v1);
 assert(h.html.includes("Your IA Studio"));
 h.action("open-files"); // opens save panel but has no unintended state reset
 h.nav("planning");h.action("plan-next");
 assert.equal(h.saved.project.aim,"Old question");
 assert.equal(h.saved.scratch.introduction,"My original text");
 assert.equal(h.saved.teacher.pendingApproval,true);
});
test("mobile viewport rules and modular script reference remain present",()=>{
 const index=read("../index.html"),css=read("../styles.css");
 assert(index.includes('<script type="module" src="./app.js"></script>'));
 assert(css.includes("@media(max-width:760px)"));
 assert(css.includes(".mobile-nav"));
 assert(css.includes("prefers-reduced-motion"));
});
