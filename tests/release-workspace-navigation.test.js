import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createProjectState} from "../src/core/project-state.js";
import {workspacePosition,workspaceHeader} from "../src/ui/workspace-navigation.js";
import {createProjectViews} from "../src/ui/project-views.js";
import {icon} from "../src/ui/primitives.js";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("one workspace location model names Planning, writing chapters and Checking without inventing progress",()=>{
 const s=createProjectState();
 s.route="planning";
 const planning=workspacePosition(s,{route:"planning",focus:"Evidence"});
 assert.equal(planning.chapterNumber,1);
 assert.equal(planning.title,"Planning");
 assert.equal(planning.focus,"Evidence");
 s.route="completing";
 s.completion.current="C40";
 const writing=workspacePosition(s,{route:"completing",focus:"Explore my mathematics"});
 assert.equal(writing.title,"IA Studio");
 assert.equal(writing.chapterNumber,3);
 assert.equal(writing.chapterLabel,"Explore & explain");
 assert.equal(workspacePosition(s,{route:"completing",overview:true}).chapterNumber,null);
 s.route="checking";
 const checking=workspacePosition(s,{route:"checking",focus:"Teacher draft"});
 assert.equal(checking.chapterNumber,5);
 assert.equal(checking.title,"Checking");
});

test("workspace banner uses the global My path action and escapes dynamic labels",()=>{
 const s=createProjectState();
 const html=workspaceHeader(s,{route:"planning",focus:'Sample <b> & students'});
 assert.match(html,/aria-label="Current location and journey navigation"/);
 assert.match(html,/data-workspace-route="planning"/);
 assert.match(html,/Chapter 1 · Planning/);
 assert.match(html,/Full path/);
 assert.match(html,/data-nav="path"/);
 assert.match(html,/Sample &lt;b&gt; &amp; students/);
 assert(!html.includes('Sample <b>'));
 assert.equal((html.match(/data-nav="path"/g)||[]).length,1);
 assert.equal(workspaceHeader(s,{route:"report"}),"");
});

test("all three current working views share the location component but retain original stages",()=>{
 const plan=read("src/ui/planning-views.js");
 const studio=read("src/completing/views.js");
 const check=read("src/checking/views.js");
 for(const [source,area] of [[plan,"planning"],[studio,"completing"],[check,"checking"]]){
  assert(source.includes('workspaceHeader('),area);
  assert(source.includes('route:"'+area+'"'),area+" route");
  assert(source.includes('tabletNav()'),area+" quick navigation");
 }
 assert(plan.includes("planningLearningTrail("),"Planning keeps contextual Discovery Trail");
 assert(studio.includes("chapterRibbon(s)"),"IA Studio keeps five-chapter ribbon");
 assert(check.includes("chapterRibbon(s)"),"Checking keeps five-chapter ribbon");
 assert(plan.includes("plan-back")&&plan.includes("plan-advance"),"Planning back/continue routes stay intact");
 assert(studio.includes("completion-back")&&studio.includes("completion-open"),"IA Studio history and stage return stay intact");
 assert(check.includes("checking-mode")&&check.includes("checking-studio"),"Checking modes and return actions stay intact");
});

test("tablet navigation offers Checking and exposes exactly one current page",()=>{
 const s=createProjectState();
 const views=createProjectViews({getState:()=>s,icon});
 for(const route of ["home","planning","completing","checking","path"]){
  s.route=route;
  const nav=views.tabletNav();
  assert.match(nav,/aria-label="Quick navigation"/);
  assert.equal((nav.match(/data-nav="/g)||[]).length,5);
  assert.equal((nav.match(/aria-current="page"/g)||[]).length,1);
  assert.match(nav,new RegExp('data-nav="'+route+'" aria-current="page"'));
 }
});

test("side and bottom navigation receive a semantic current-page state; record counts are not chapter progress",()=>{
 const html=read("index.html"),app=read("app.js");
 assert(html.includes('id="pathCount" hidden aria-hidden="true"'));
 assert(html.includes('class="mobile-nav-link active" type="button" aria-current="page"'));
 assert(html.includes('class="side-link active" type="button" aria-current="page"'));
 assert(app.includes('b.setAttribute("aria-current","page")'));
 assert(app.includes('b.removeAttribute("aria-current")'));
 assert(app.includes('badge.hidden=count===0'));
 assert(app.includes("including planned work"),"Records are not equated with finished mathematics");
});

test("responsive wayfinding preserves keyboard and print access",()=>{
 const css=read("data/workspace-navigation.css");
 const html=read("index.html");
 assert(html.includes('href="./data/workspace-navigation.css"'));
 assert(css.includes("workspace-wayfinding-full:focus-visible"));
 assert(css.includes("@media(max-width:760px)"));
 assert(css.includes("@media(max-width:400px)"));
 assert(css.includes("prefers-reduced-motion:reduce"));
 assert(css.includes("@media print"));
});
