import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState} from "../src/core/project-state.js";
import {createPlanningViews} from "../src/ui/planning-views.js";
import {PLANNING_NODE_IDS} from "../src/planning/engine.js";

function screenFixture(){
 const state=createProjectState();state.route="planning";
 const e=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;");
 const ctx={
  getState:()=>state,icon:()=>"",e,button:(label)=>label,
  field:(path,label)=>'<label>'+e(label)+'</label>',
  choose:(path,opts)=>opts.map(x=>'<label>'+e(x.title)+'</label>').join(""),
  numberPick:()=>"",note:(t)=>t,summary:(label,value)=>'<p>'+e(label)+' '+e(value)+'</p>',
  helpButton:()=>"",helpBox:()=>"",tabletNav:()=>""
 };
 return {state,view:createPlanningViews(ctx)};
}
test("all 32 normalized Planning nodes render without throwing, with exact node trace",()=>{
 const {state,view}=screenFixture();
 assert.equal(PLANNING_NODE_IDS.length,32);
 for(const node of PLANNING_NODE_IDS){
  state.planning.current=node;
  const html=view.viewPlanning();
  assert(html.includes('data-source-node="'+node+'"'),node);
  assert(html.includes('class="task-shell'),node);
  assert(html.includes("Back")||html.includes("Home")||(node==="N00"&&html.includes("Let's go")),node);
  assert(!html.includes("undefined"),node);
 }
});
test("course options are shown only for the matching SL syllabus",()=>{
 const {state,view}=screenFixture();state.planning.current="N04S";
 state.planning.fields.course="AI SL";
 let html=view.viewPlanning();
 assert(html.includes("Voronoi diagrams"));
 assert(!html.includes("Integration by substitution"));
 state.planning.fields.course="AA SL";html=view.viewPlanning();
 assert(html.includes("Integration by substitution"));
 assert(!html.includes("Voronoi diagrams"));
 state.planning.fields.course="AA HL";html=view.viewPlanning();
 assert(html.includes("Course review needed"));
});
test("primary+secondary branch visibly tracks two distinct confirmation steps",()=>{
 const {state,view}=screenFixture();
 state.planning.current="N03B";state.planning.fields.dataSource="both";
 let html=view.viewPlanning();
 assert(html.includes("Answer primary questions"));
 assert(html.includes("Answer secondary questions"));
 state.planning.sourceBranches.primary=true;html=view.viewPlanning();
 assert(html.includes("Edit primary questions"));
 assert(html.includes("Answer secondary questions"));
});
test("theoretical prompts don't ask for data sampling and specialist checkpoint is available",()=>{
 const {state,view}=screenFixture();state.planning.current="N08";
 state.planning.fields.kind="theoretical";
 let html=view.viewPlanning();
 assert(html.includes("tentative conjecture"));
 assert(!html.includes("Sampling strategy"));
 assert(html.includes("Plan milestones and course mathematics"));
 assert(html.includes("Continue to review"));
});
test("unresolved consent exposes teacher support and never pretends approval",()=>{
 const {state,view}=screenFixture();state.planning.current="N03F";
 state.planning.fields.permissionNeed="yes";
 let html=view.viewPlanning();
 assert(html.includes("Discuss permissions with my teacher"));
 assert(html.includes("do not begin affected data collection"));
 assert(html.includes('data-condition="Safety / privacy / consent unresolved"'));
});
test("statistical prediction choices use chosen data context",()=>{
 const {state,view}=screenFixture();state.planning.current="N01P";
 state.planning.fields.kind="statistics";
 state.planning.fields.statisticsContext="Paired numerical";
 const html=view.viewPlanning();
 assert(html.includes("roughly linear positive"));
 assert(html.includes("relationship be curved"));
 assert(!html.includes("binomial distribution"));
});
test("phase two planning uses route-progress milestones rather than a compulsory fixed step count",()=>{
 const {state,view}=screenFixture();
 const html=view.viewPlanning();
 assert(html.includes("Find your question"));
 assert(html.includes("Plan your evidence"));
 assert(!html.includes("Step 1 of 10"));
});

test("first Planning screen asks one three-way question and keeps support for later",()=>{
 const {state,view}=screenFixture();
 const start=view.viewPlanning();
 for(const label of ["I have an idea","I'm choosing between ideas","Help me find an idea"]){
  assert(start.includes(label),label);
 }
 assert(start.includes('planning-kickoff'));
 assert(start.includes('planning-learning-trail'));
 assert(start.includes("Let's go"));
 assert(!start.includes("A possible topic or question"));
 assert(!start.includes("My interests (optional)"));
 assert(!start.includes("Compare two or three possible ideas"));
 assert(!start.includes("Your IA at a glance"));
 assert(!start.includes("Help me think"));
 assert(!start.includes("Tools & tutorials"));
 assert(!start.includes("criteria-panel"));
 state.planning.current="N01";
 const next=view.viewPlanning();
 assert(next.includes("My provisional IA title"));
 assert(next.includes("What do I want to find out mathematically?"));
 assert(next.includes("Personal engagement is not how much you love the topic."));
 assert(next.includes('planning-trail-support'));
 assert(next.includes('data-example-id="EX30"'));
 assert(next.includes('data-insight-source="N01"'));
 assert(next.includes('data-insight-source="N01A"'));
 assert(!next.includes('data-bind="planning.fields.motivation"'));
 assert(!next.includes('resource-prompt'));
 assert(!next.includes('planning-kickoff'));
 const i=next.indexOf('class="planning-page-main"');
 assert(i>=0);
 assert(!next.slice(i).includes('criteria-panel'));
});

test("the idea-map starting page focuses on branches instead of the old help and dropdown",()=>{
 const {state,view}=screenFixture();state.planning.current="N00B";
 const html=view.viewPlanning();
 assert(html.includes("My hobbies &amp; interests"));
 assert(html.includes("My daily life"));
 assert(html.includes("My world"));
 assert(html.includes("Start with data I can get"));
 assert(html.includes('idea-map-quickstart'));
 assert(html.includes('data-idea-map-network'));
 assert(html.includes('data-idea-map-connectors'));
 assert(html.includes('data-idea-node="hub"'));
 assert(!html.includes('id="idea-topic"'));
 assert(!html.includes('What makes a promising starting point?'));
 assert(!html.includes('Help me think'));
 assert(!html.includes('idea-start'));
 assert(!html.includes('resource-prompt'));
});

test('motivation screen has one why/who/how response and a small inline-editable aim spark',()=>{
 const {state,view}=screenFixture();
 state.planning.current='N01V';
 state.planning.fields.aim='How well does my model describe an observed trajectory?';
 let html=view.viewPlanning();
 assert(html.includes('Have a clear motivation'));
 assert(html.includes('A mathematical result is an outcome, not a reason'));
 assert(html.includes('data-motivation-aim-spark'));
 assert(html.includes('data-motivation-aim-preview'));
 assert(html.includes('View / edit'));
 assert(html.includes('data-bind="planning.fields.aim"'));
 assert.equal((html.match(/data-bind="planning.fields.beneficiary"/g)||[]).length,1);
 assert(!html.includes('data-bind="planning.fields.intendedUse"'));
 assert(!html.includes('Your ideas are back'));
 assert(html.includes('Who might benefit, and how'));
 assert(html.includes('We will return to this'));
 assert(html.includes('Why does this matter?'));
 assert(html.includes('Compare motivations'));
 assert(html.includes('data-insight-source="N01V"'));
 const s=state.planning.fields;
 s.beneficiary='I want to compare two trajectories to understand which model fits better.';
 html=view.viewPlanning();
 assert(html.includes('Spark saved · Your motivation'));
 assert(html.includes('My aim spark'));
 assert(html.includes('planning-trail-support'));
});
