import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState} from "../src/core/project-state.js";
import {createCompletingViews} from "../src/completing/views.js";
import {C_NODE_IDS,setCompletionNode,startFirstRepresentation,setCompletionField,addMathematicalStage} from "../src/completing/engine.js";
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
  assert(html.includes('data-source-node="'+(["C61","C62","C63","C64"].includes(id)?"C60":id)+'"'),id);
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
 assert.equal(state.completion.current,"C60");
 assert(html.includes("What does that answer mean"));
 assert(html.includes("Potential next steps"));
 assert(html.includes("conclusionExtension"));
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
 const priorContext=html.slice(html.indexOf("Earlier finding this section was based on"),
  html.indexOf('data-show-first-part="show"'));
 assert(!priorContext.includes("Model y=2x squared"),"stage 2 must link to stage 1, not itself");
 // Showing its own real result in Section 3 is now intentional, not a circular bridge.
 assert(html.includes("Model y=2x squared"));
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

test("first-mathematics writing screen includes all generators and records maths without a duplicate first-move page",()=>{
 const {state,view}=fixture();
 state.planning.routeExplorer.selectedRoute="groups";
 setCompletionNode(state,"C30");
 const html=view.viewCompleting();
 assert.match(html,/data-show-first-part="show"/);
 assert.match(html,/data-show-first-tools/);
 for(const action of ["graph-open","stat-open","table-open","trace-open","voronoi-open"]){
  assert.ok(html.includes('data-action="'+action+'"'),action);
 }
 assert.match(html,/FROM YOUR PLANNING/);
 assert.match(html,/data-first-inline-result/);
 assert.match(html,/data-path="completion.fields.firstWorkResult"/);
 assert.match(html,/data-path="completion.fields.firstWorkStatus"/);
 assert(!html.includes('data-action="completion-first-record"'));
 assert(!html.includes('data-condition="Begin purposeful initial exploration"'));
 setCompletionNode(state,"C31");
 const legacy=view.viewCompleting();
 assert.match(legacy,/Diagram &amp; table tools/);
 assert.match(legacy,/data-node="C30"/);
 assert(!legacy.includes('data-condition="Chosen useful initial representation or calculation"'));
});
test("first-mathematics next-question writing is reused rather than requested twice",()=>{
 const {state,view}=fixture();
 startFirstRepresentation(state);
 const entry=state.entries[0];
 entry.status="completed";entry.result="Both groups have different spreads";
 entry.interpretation="The second group is more variable";
 state.completion.fields.nextQuestion="Are the spreads sensitive to an outlier?";
 state.completion.fields.nextReason="A single high value may be distorting the range.";
 setCompletionNode(state,"C34B");
 const reflection=view.viewCompleting();
 assert.match(reflection,/Your interpretation from Show your mathematics/);
 assert(!reflection.includes('data-path="entries.0.interpretation"'));
 setCompletionNode(state,"C35");
 const next=view.viewCompleting();
 assert.match(next,/Your next question from Show your mathematics/);
 assert.match(next,/Your earlier justification for the next step/);
 assert(!next.includes('data-path="completion.fields.nextQuestion"'));
 assert(!next.includes('data-path="completion.fields.nextReason"'));
});

test("saved diagrams of all five generator types appear in the first-section gallery",()=>{
 const {state,view}=fixture();setCompletionNode(state,"C30");
 const kinds=[["graphStudio","figure-abc"],["statStudio","stat-abc"],
  ["tableStudio","table-abc"],["imageTracer","trace-abc"],
  ["voronoiStudio","voronoi-abc"]];
 for(const [key,id] of kinds)state[key].figures.push({
  id,entryId:"",savedAt:"2026-10-20T00:00:00Z",draft:state[key].draft
 });
 const html=view.viewCompleting();
 assert.match(html,/data-first-figure-gallery/);
 assert.match(html,/5 saved/);
 for(const [,id] of kinds)assert.ok(html.includes(id),id);
 assert.match(html,/data-action="first-figure-edit"/);
 assert.match(html,/data-action="first-figure-hide"/);
});

test("Section 2 and 3 reuse one verified result, and never assume a saved figure is evidence",()=>{
 const {state,view}=fixture();setCompletionNode(state,"C30");
 setCompletionField(state,"firstWorkResult","I calculated a maximum of 3.4 m.");
 assert.equal(state.entries.length,1);
 assert.equal(state.entries[0].status,"planned");
 let html=view.viewCompleting();
 assert.ok(!html.includes("data-show-first-result-anchor"));
 assert.match(html,/data-path="entries.0.result"/);
 setCompletionField(state,"firstWorkStatus","completed");
 assert.equal(state.entries.length,1);
 assert.equal(state.entries[0].status,"completed");
 html=view.viewCompleting();
 assert.match(html,/data-show-first-result-anchor/);
 assert.match(html,/I calculated a maximum of 3.4 m/);
 assert.match(html,/data-path="entries.0.interpretation"/);
 assert.ok(!html.includes('data-action="completion-first-record"'));
});

test("first mathematical page ends with two clear progression choices",()=>{
 const {state,view}=fixture();state.route="completing";setCompletionNode(state,"C30");
 const html=view.viewCompleting(),next=html.indexOf('data-show-first-part="next"');
 assert(next>=0);
 assert(html.indexOf('data-action="stage-add"',next)>next);
 assert(html.indexOf('data-action="stage-conclude"',next)>next);
 assert(!html.includes('data-condition="Continue / choose another stage"'));
});
test("subsequent mathematical stages have four parts and link directly to a prior result",()=>{
 const {state,view}=fixture();state.route="completing";
 state.entries=[{id:"first",phase:"first",status:"completed",title:"Initial scatter",
  result:"Measured data follow a curve",localTakeaway:"Linear regression misses the curve"}];
 state.completion.activeEntryIndex=0;
 assert(addMathematicalStage(state).ok);
 setCompletionNode(state,"C40");
 let html=view.viewCompleting();
 assert(html.includes('data-math-stage-page="2"'));
 assert(html.includes("Linear regression misses the curve"));
 for(const section of ["introduce","show","reflect","next"])
  assert(html.includes('data-show-first-part="'+section+'"'),section);
 for(const field of ["bridge","purpose","result","interpretation","nextQuestion","nextWhy"])
  assert(html.includes('data-path="entries.1.'+field+'"'),field);
 assert(html.includes('data-action="stage-add"'));
 assert(html.includes('data-action="stage-conclude"'));
 state.entries[1].status="completed";
 state.entries[1].result="Quadratic model gives smaller residuals";
 state.entries[1].localTakeaway="Quadratic is a better fit";
 assert(addMathematicalStage(state).ok);
 setCompletionNode(state,"C50");
 html=view.viewCompleting();
 assert(html.includes('data-math-stage-page="3"'));
 assert(html.includes("Quadratic is a better fit"));
 assert(html.includes('data-path="entries.2.bridge"'));
});
test("conclusion warning is non-mandatory guidance with an explicit decision",()=>{
 const {state,view}=fixture();state.route="completing";setCompletionNode(state,"C30");
 state.completion.conclusionWarningOpen=true;
 const html=view.viewCompleting();
 assert(html.includes('data-conclusion-gate'));
 assert(html.includes("no required number of calculations or stages"));
 assert(!html.includes("12–20 pages"));
 assert(html.includes('data-action="conclusion-confirm"'));
 assert(html.includes('data-action="conclusion-cancel"'));
 assert(html.indexOf('data-conclusion-gate')<html.indexOf('data-source-node="C30"'));
});
test("later-stage figure galleries display only diagrams linked to that stage",()=>{
 const {state,view}=fixture();state.route="completing";
 state.entries=[{id:"first",phase:"first",status:"completed",title:"First output",result:"Observed graph",graphFigureId:"figure-one"},
  {id:"second",phase:"substantial",status:"planned",title:"Follow-on mathematics",fromEntryId:"first",graphFigureId:"figure-two"}];
 state.graphStudio.figures=[
  {id:"figure-one",entryId:"first",savedAt:"2026-10-20T01:00:00Z",draft:state.graphStudio.draft},
  {id:"figure-two",entryId:"second",savedAt:"2026-10-20T02:00:00Z",draft:state.graphStudio.draft}
 ];
 state.completion.activeEntryIndex=1;setCompletionNode(state,"C40");
 const html=view.viewCompleting();
 assert(html.includes('data-first-figure-key="graph:figure-two"'));
 assert(!html.includes('data-first-figure-key="graph:figure-one"'));
});

test("first mathematics asks about a genuine route-specific outcome, not a planned fit",()=>{
 const {state,view}=fixture();
 state.route="completing";state.planning.routeExplorer.selectedRoute="fitted-models";
 state.entries=[{id:"first-result",phase:"first",status:"completed",
  title:"My actual scatter diagram",result:"Observed curved points",localTakeaway:"Not clearly a parabola",
  journeyOutcome:"fitted-models:not-quadratic"}];
 state.completion.activeEntryIndex=0;setCompletionNode(state,"C30");
 const html=view.viewCompleting();
 assert(html.includes('data-journey-outcome-picker'));
 assert(html.includes('data-path="entries.0.journeyOutcome"'));
 assert(html.includes('data-journey-next-state="ready"'));
 assert(html.includes('data-action="journey-use-direction"'));
 assert(html.includes("The shape does not look quadratic"));
 assert(html.includes("What alternative function structure"));
 assert(html.includes("more advanced")||html.includes("automatically"),"course-sensitive caution appears");
});
test("later mathematics explicitly responds to previous chosen finding rather than recycled planning advice",()=>{
 const {state,view}=fixture();
 state.route="completing";state.planning.routeExplorer.selectedRoute="fitted-models";
 state.entries=[
  {id:"parent",phase:"first",title:"Initial scatter",status:"completed",
   result:"Points do not follow a parabola",journeyOutcome:"fitted-models:not-quadratic",
   localTakeaway:"The relation increases then levels off",journeyDirection:"follow"},
  {id:"child",phase:"substantial",title:"Investigate a new model",status:"planned",
   fromEntryId:"parent",bridge:"An appropriate alternative is needed",result:""}
 ];
 state.completion.activeEntryIndex=1;setCompletionNode(state,"C40");
 const html=view.viewCompleting();
 assert(html.includes('data-journey-stage-link'));
 assert(html.includes("Points do not follow a parabola")||html.includes("increases then levels off"));
 assert(html.includes("alternative function structure"));
 assert(html.includes('data-journey-outcome-waiting'));
 assert(!html.includes('data-journey-next-state="ready"'),"new stage has not made a new finding yet");
});
test("later stage gains its own new result options and suggestions, then can lead to stage three",()=>{
 const {state,view}=fixture();
 state.route="completing";state.planning.routeExplorer.selectedRoute="growth";
 state.entries=[
  {id:"initial",phase:"first",title:"First differences",status:"completed",
   result:"Differences are not constant",journeyOutcome:"growth:different"},
  {id:"growth-model",phase:"substantial",title:"Investigate growth",status:"completed",
   fromEntryId:"initial",result:"Observed ratios are more stable than differences",
   journeyOutcome:"growth:multiplicative",localTakeaway:"Ratios suggest multiplicative change"}
 ];
 state.completion.activeEntryIndex=1;setCompletionNode(state,"C40");
 const html=view.viewCompleting();
 assert(html.includes('data-journey-outcome-picker'));
 assert(html.includes('data-path="entries.1.journeyOutcome"'));
 assert(html.includes('data-journey-next-state="ready"'));
 assert(html.includes("Do ratios support proportional growth"));
 assert(html.includes('data-action="stage-add"'));
});

test("later-stage outcomes switch from the original journey to a confirmed method's result family",()=>{
 const {state,view}=fixture();
 state.route="completing";state.planning.routeExplorer.selectedRoute="relationships";
 state.entries=[
  {id:"scatter",phase:"first",status:"completed",title:"First observation",
   result:"Observed curvature",journeyOutcome:"relationships:curve"},
  {id:"fit",phase:"substantial",status:"completed",fromEntryId:"scatter",
   methodId:"quadratic-fit",title:"Quadratic fit",result:"Residual trend",
   journeyOutcome:"nonlinear-model:residual-structure"}
 ];
 state.completion.activeEntryIndex=1;setCompletionNode(state,"C40");
 const html=view.viewCompleting();
 assert(html.includes("Nonlinear models, fits and residuals"));
 assert(html.includes('data-path="entries.1.journeyOutcome"'));
 assert(html.includes("Residuals reveal a systematic pattern"));
 assert(html.includes('data-journey-next-state="ready"'));
 assert(html.includes("residual"));
});

test("returning to the first maths after creating later stages retains direct links to every page",()=>{
 const {state,view}=fixture();state.route="completing";
 state.entries=[
  {id:"first",phase:"first",status:"completed",result:"Observed pattern"},
  {id:"second",phase:"substantial",fromEntryId:"first",status:"completed",result:"Evaluated a model"},
  {id:"third",phase:"substantial",fromEntryId:"second",status:"planned",result:""}
 ];
 state.completion.activeEntryIndex=0;setCompletionNode(state,"C30");
 const html=view.viewCompleting();
 for(let index=0;index<3;index++)
  assert(html.includes('data-action="completion-edit-entry" data-index="'+index+'"'));
 assert(html.includes("Mathematical stage 2"));
 assert(html.includes("Mathematical stage 3"));
 assert(html.includes('aria-current="page"'));
});
