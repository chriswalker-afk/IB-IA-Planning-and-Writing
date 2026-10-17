import {createSamplePreview} from '../src/core/sample-preview.js';
import {createIllustrativeSample,SAMPLE_CHOICES} from '../src/core/illustrative-samples.js';
import {STATUS_LABELS,resumeRoute,rememberCheckpoint} from '../src/ui/journey.js';
import {journeyRail} from '../src/ui/journey-views.js';
import {C_MAJOR_STAGES,completionStage} from '../src/completing/engine.js';
import {ideaAction,ideaInput,ideaDifficultyInput,chooseTopic} from '../src/ideas/engine.js';
import {insightCapture} from '../src/ui/insight-threads.js';
import {planningLearningTrail} from '../src/ui/living-journey.js';
import {resourceDrawer,resourceList} from '../src/resources/views.js';
import {resourceAction,resourceFilter,resourcePreference} from '../src/resources/actions.js';
import {newResourceSession} from '../src/resources/state.js';
import {PRACTICE_PAIRS} from '../src/resources/catalog.js';
import {createStuckViews} from '../src/help/stuck-views.js';
import {captureStuckOrigin,isStuckNode} from '../src/help/stuck-state.js';
import {stuckAction} from '../src/help/stuck-actions.js';
import {stuckContext} from '../src/help/stuck.js';
import {conformanceAction} from "../src/completing/conformance-actions.js";
import {reviewEditChanged} from "../src/completing/review.js";
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
import {createProjectState,normalizeProjectState,persistProjectState} from "../src/core/project-state.js";
import {readRecordValue,updateRecordValue} from "../src/core/record-access.js";
import {icon,escapeHtml,cleanUrl,button} from "../src/ui/primitives.js";
import {referenceNodeForPrototypeStep} from "../src/core/prototype-bridge.js";
import {createPlanningViews} from "../src/ui/planning-views.js";
import {planningMove,planAutoAdvance,planningBack,planningEdit,applyPlanningField,toggleMath,selectedMaths,exploreMathRoute,chooseMathRoute,syncPlanningToProject,setPlanCurrent,planningFlags} from "../src/planning/engine.js";
import {createStudioViews} from "../src/ui/studio-views.js";
import {createCompletingViews} from "../src/completing/views.js";
import {setCompletionNode,moveCompletionRoute,completionBack,markCompletionStage,setCompletionField,addAccuracyDecision,completionSuggestions,sectionForNode,targetForSection,completeEntry,latestRealResult,flagDependentMathematics,acknowledgeMathReview} from "../src/completing/engine.js";
import {createProjectViews} from "../src/ui/project-views.js";
import {createHandoverViews} from "../src/ui/handover-views.js";
import {actOnWritingCue} from "../src/completing/guidance-actions.js";
import {eligibleWritingCues} from "../src/completing/writing-guidance.js";
import {selectLimitation,recordLimitation,limitationContextKey,relevantLimitations} from "../src/completing/limitation-guidance.js";
import {relevantBivariateOptions} from "../src/completing/bivariate-guidance.js";
import {resultFamily,routeNextQuestions} from "../src/completing/route-coach.js";
import {sourceResultForNext} from "../src/completing/engine.js";

import {createPlanningEnvelope,getFieldDiff,mergePlanningEnvelope} from "../src/handover/schema.js";
import {modelFromEnvelope,suggestedFilename} from "../src/handover/report-model.js";

const read=p=>readFileSync(new URL(p,import.meta.url),"utf8");
function createHarness(savedValue){
  const events={};
  const store=new Map(savedValue?[["ia-pathfinder-prototype-v1",JSON.stringify(savedValue)]]:[]);
  const classList={add(){},remove(){},toggle(){}};
  const elements={};
  for(const id of ["#main","#drawerLayer","#saveStatus","#pathCount","#sideMilestones","#importFile","#reportImportFile","#toast"]){
    elements[id]={innerHTML:"",textContent:"",hidden:id==="#drawerLayer",classList,focus(){},addEventListener(n,cb){events["file-"+n]=cb;}};
  }
  elements["#drawerLayer"].querySelector=()=>({focus(){}});
  const document={
    querySelector:q=>elements[q]??null,
    getElementById:()=>null,
    querySelectorAll:()=>[],
    addEventListener:(n,cb)=>events[n]=cb,
    contains:()=>true,
    body:{classList}
  };
  const storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
  const window={scrollTo(){},confirm:()=>true,alert(){},print(){}};
  const script=read("../app.js").replace(/^import\s+.*;\s*$/gm,"");
  // The real browser suite exercises the independent native-dialog controller.
  const globals={createSamplePreview,createIllustrativeSample,SAMPLE_CHOICES,STATUS_LABELS,resumeRoute,rememberCheckpoint,journeyRail,C_MAJOR_STAGES,completionStage,structuredClone,captureReturn:()=>({scroll:0,attributes:[]}),restoreReturn:()=>{},createEssentialsController:()=>({}),editCriterionReview:()=>false,createExampleController:()=>({}),ideaAction,ideaInput,ideaDifficultyInput,chooseTopic,
     attachIdeaMapGraph:()=>()=>{},insightCapture,planningLearningTrail,resourceDrawer,resourceList,resourceAction,resourceFilter,resourcePreference,newResourceSession,PRACTICE_PAIRS,createStuckViews,captureStuckOrigin,isStuckNode,stuckAction,stuckContext,
    conformanceAction,reviewEditChanged,document,window,localStorage:storage,console,clearTimeout(){},setTimeout(){return 1;},
    createProjectState,normalizeProjectState,persistProjectState,
    newState:createProjectState,normalise:normalizeProjectState,
    KEY:"ia-pathfinder-prototype-v1",
    readRecordValue,updateRecordValue,icon,escapeHtml,cleanUrl,button,
    referenceNodeForPrototypeStep,createPlanningViews,createStudioViews,createCompletingViews,createProjectViews,
    setCompletionNode,moveCompletionRoute,completionBack,markCompletionStage,setCompletionField,addAccuracyDecision,completionSuggestions,sectionForNode,targetForSection,completeEntry,latestRealResult,flagDependentMathematics,acknowledgeMathReview,
    createHandoverViews,createPlanningEnvelope,getFieldDiff,mergePlanningEnvelope,modelFromEnvelope,suggestedFilename,
    actOnWritingCue,eligibleWritingCues,selectLimitation,recordLimitation,limitationContextKey,relevantLimitations,relevantBivariateOptions,resultFamily,routeNextQuestions,sourceResultForNext,
    planningMove,planAutoAdvance,planningBack,planningEdit,applyPlanningField,toggleMath,selectedMaths,exploreMathRoute,chooseMathRoute,syncPlanningToProject,setPlanCurrent,planningFlags
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
test("adaptive Planning follows genuine spreadsheet source nodes and retains student answers",()=>{
 const h=createHarness();
 h.action("start-planning");
 assert(h.html.includes('data-source-node="N00"'));
 h.choose("planning.fields.ideaStatus","yes");
 h.action("plan-advance");assert(h.html.includes('data-source-node="N01"'));
 h.write("planning.fields.aim","How does X relate to Y?");
 h.action("plan-advance");assert(h.html.includes('data-source-node="N01V"'));
 assert(h.html.includes('Why does this matter?'));
 assert(h.html.includes('data-spark-editor="aim"'));
 assert(h.html.includes('data-spark-library'));
 assert(h.html.includes('data-bind="planning.fields.aim"'));
 assert(h.html.includes('data-bind="planning.fields.beneficiary"'));
 assert(h.html.includes('Compare motivations'));
 h.choose("planning.fields.beneficiaryType","me");
 h.write("planning.fields.beneficiary","I want to understand whether this relationship could guide my decision.");
 h.action("plan-advance");assert(h.html.includes('data-source-node="N02"'));
 h.choose("planning.fields.kind","statistics");
 h.choose("planning.fields.statisticsContext","Paired numerical");
 h.action("plan-advance");assert(h.html.includes('data-source-node="N02M"'));
 assert(h.html.includes("Mathematics AI SL")&&h.html.includes("Mathematics AA SL"));
 h.choose("planning.fields.course","AA SL");
 assert(h.html.includes("Three ways to explore mathematics"));
 assert(h.html.includes("Relationships between two variables"));
 h.action("math-open-route",{routeId:"relationships"});
 assert(h.html.includes("What pattern, if any, is supported"));
 assert(h.html.includes('data-math-id="AA15"'));
 h.action("plan-toggle-math",{mathId:"AA15"});
 assert(h.saved.planning.mathSelected.includes("AA15"));
 h.action("math-select-route",{routeId:"relationships"});
 assert.equal(h.saved.planning.routeExplorer.selectedRoute,"relationships");
 assert(h.html.includes("Route spark saved"));
 h.action("math-mode",{mode:"routes"});
 assert(h.html.includes("Data &amp; statistics")||h.html.includes("Data & statistics"));
 assert(h.html.includes("Explore 16 mathematical journeys"));
 h.action("math-mode",{mode:"all"});
 assert(h.html.includes("Search AA SL mathematics"));
 assert(h.html.includes("Linear regression"));
 assert(h.saved.planning.mathSelected.includes("AA15"));
 h.action("plan-advance");assert(h.html.includes('data-source-node="N03"'));
 h.choose("planning.fields.dataSource","secondary");
 h.action("plan-advance");assert(h.html.includes('data-source-node="N03S"'));
 h.choose("planning.fields.secondaryStatus","ready");
 h.action("plan-advance");assert(h.html.includes('data-source-node="N03D"'));
 h.action("plan-advance");assert(h.html.includes('data-source-node="N03E"'));
 assert(h.html.includes("Before you start"));
 h.choose("planning.fields.dataReadiness","4");
 h.choose("planning.fields.permissionNeed","no");
 h.choose("planning.fields.practicalBlocker","no");
 h.action("plan-advance");assert(h.html.includes('data-source-node="N03G"'));
 h.choose("planning.fields.practicalEase","3");
 h.action("plan-advance");assert(h.html.includes('data-source-node="N03H"'));
 h.action("plan-advance");assert(h.html.includes('data-source-node="N01P"'));
 assert(h.saved.planning.mathSelected.includes("AA15"));
 h.choose("planning.fields.predictionId","S01");
 h.action("plan-advance");assert(h.html.includes('data-source-node="N04R"'));
 h.action("plan-advance");assert(h.html.includes('data-source-node="N04M"'));
 h.action("plan-advance");assert(h.html.includes('data-source-node="N05V"'));
 h.action("plan-advance");assert(h.html.includes('data-source-node="N05"'));
 h.action("plan-advance");assert(h.html.includes('data-source-node="N06E"'));
 h.action("plan-advance");assert(h.html.includes('data-source-node="N06T"'));
 h.action("plan-advance");assert(h.html.includes('data-source-node="N06"'));
 h.action("plan-advance");assert(h.html.includes('data-source-node="N07"'));
 assert.equal(h.saved.project.aim,"How does X relate to Y?");
 assert.equal(h.saved.planning.completed,true);
 assert.equal(h.saved.version,2);
});

test("new Phase 3 handover panel and report export actions remain reachable",()=>{
 const h=createHarness();
 assert(h.html.includes("Import an existing plan"));
 h.action("open-handover");
 assert(h.drawer.includes("Confirm your starting plan")||h.drawer.includes("current investigation aim")||h.drawer.includes("Current investigation aim"));
 assert(h.drawer.includes("I have reviewed these details"));
 h.action("handover-confirm");
 assert.equal(typeof h.saved.handover.confirmedAt,"string");
 assert(h.saved.handover.confirmedAt.length>10);
 h.action("open-panel",{panel:"files"});
 assert(h.drawer.includes("Download planning PDF"));
 assert(h.drawer.includes("Download editable Word"));
 assert(h.drawer.includes("Import planning PDF or Word"));
 h.nav("report");assert(h.html.includes("Download structured PDF"));
});
test("Phase 4 follows genuine Completing routes and never interprets planned mathematics",()=>{
 const h=createHarness();
 h.nav("completing");assert(h.html.includes('data-source-node="C00"'));
 h.action("completion-route",{condition:"Start without a saved plan"});
 assert(h.html.includes('data-source-node="C02"'));
 h.write("planning.fields.aim","What does the actual evidence tell me?");
 h.action("completion-route",{condition:"Confirm or update carried-forward information"});
 assert(h.html.includes('data-source-node="C03"'));
 h.action("completion-route",{condition:"Idea and permissions reviewed"});
 assert(h.html.includes('data-source-node="C04"'));
 h.action("completion-route",{condition:"Prepare first representation"});
 assert(h.html.includes('data-source-node="C30"'));
 h.action("completion-route",{condition:"Begin purposeful initial exploration"});
 assert(h.html.includes('data-source-node="C31"'));
 h.choose("completion.fields.firstType","scatter");
 h.write("completion.fields.firstPurpose","See whether an observed relationship is straight or curved.");
 h.action("completion-route",{condition:"Chosen useful initial representation or calculation"});
 assert(h.html.includes('data-source-node="C32"'));
 assert.equal(h.saved.entries.length,1);
 assert.equal(h.saved.entries[0].status,"planned");
 h.action("completion-route",{condition:"Purpose and symbols defined"});
 assert(h.html.includes('data-source-node="C33"'));
 h.action("completion-route",{condition:"Figure or brief calculation checked"});
 assert(h.html.includes('data-source-node="C33"')); // blocked: no real result
 h.choose("entries.0.status","completed");
 h.choose("entries.0.kind","scatter");
 h.write("entries.0.result","Real observations show a curved pattern");
 h.action("completion-route",{condition:"Figure or brief calculation checked"});
 assert(h.html.includes('data-source-node="C34"'));
 h.choose("entries.0.observation","curved");
 h.write("entries.0.observationText","A curved pattern appears in the scatter.");
 h.action("completion-route",{condition:"Observation made; check accuracy where new, then reconnect to aim/prediction"});
 assert(h.html.includes('data-source-node="C34B"'));
 h.write("entries.0.interpretation","A curved model may fit the data better than a straight line.");
 h.write("entries.0.localTakeaway","A straight line may be inadequate.");
 h.action("completion-route",{condition:"Consistent with prediction, or no prediction, or sufficiently explained"});
 assert(h.html.includes('data-source-node="C35"'));
 h.write("completion.fields.nextQuestion","Which curved model is mathematically justified?");
 h.write("completion.fields.nextReason","The observed shape is not close to a straight line.");
 h.action("completion-route",{condition:"Begin FIRST justified mathematical section (or the next appropriate method)"});
 assert(h.html.includes('data-source-node="C40"'));
 assert.equal(h.saved.entries.length,2);
 assert.equal(h.saved.entries[1].status,"planned");
 assert(h.saved.entries[1].purpose.includes("observed shape"));
 assert.equal(h.saved.entries[0].status,"completed");
});
test("map, report and sample discovery still render after refactoring",()=>{
 const h=createHarness();
 h.nav("path");assert(h.html.includes("My mathematical path"));
 h.nav("report");assert(h.html.includes("My mathematical investigation"));
 h.action("open-demos");assert(h.drawer.includes("Choose a sample"));
 h.action("load-demo",{demo:"curved"});
 assert(h.html.includes("Sample preview"));
 h.nav("report");assert(h.html.includes("DEMONSTRATION DATA"));
});
test("saved v1 browser project migrates on load without losing its real notes",()=>{
 const v1={version:1,route:"completing",project:{aim:"Old question",precision:"nearest 0.1",permissions:"pending"},
 ui:{planStep:3,planMax:4,studioSection:"overview"},scratch:{introduction:"My original text"},entries:[],cues:{}};
 const h=createHarness(v1);
 assert(h.html.includes('class="task-heading"'));
 h.action("open-files"); // opens save panel but has no unintended state reset
 h.nav("planning");h.action("plan-edit",{node:"N01"});
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

test("reopening IA Studio resumes the exact source C-node instead of resetting the student to its overview",()=>{
 const h=createHarness();
 h.nav("completing");
 h.action("completion-open",{node:"C21M"});
 assert(h.html.includes('data-source-node="C21M"'));
 h.nav("home");
 h.action("go-studio");
 assert(h.html.includes('data-source-node="C21M"'));
 h.action("studio-overview");
 assert(h.html.includes('data-source-node="C04"'));
});

test("Phase 5 writing advice respects student control instead of launching a queue of unwanted prompts",()=>{
 const h=createHarness();
 h.write("planning.fields.aim","How do changing measurements influence an outcome?");
 h.write("planning.fields.motivation","My interest in realistic measurements");
 h.nav("completing");
 h.action("completion-open",{node:"C10"});
 assert(h.html.includes("Useful writing moment"));
 assert(h.html.includes("data-writing-cue="));
 const match=h.html.match(/data-guidance-id="(W\d\d)" data-guidance-key="([^"]+)"/);
 assert(match);
 h.action("guidance-writing-action",{guidanceId:match[1],guidanceKey:match[2],guidanceEvent:"covered-start"});
 assert(h.html.includes("Confirm already covered"));
 h.write("completion.guidanceUi.locationDraft","Introduction, second paragraph");
 h.action("guidance-writing-action",{guidanceId:match[1],guidanceKey:match[2],guidanceEvent:"covered"});
 assert.equal(h.saved.writingLedger[match[2]].location,"Introduction, second paragraph");
 assert(!h.html.includes("Useful writing moment")); // no instant replacement with another cue
 h.action("guidance-more");
 assert(!h.html.includes("Useful writing moment")); // no additional relevance from the same node
 assert.equal(h.saved.writingLedger[match[2]].status,"already-covered");
});
test("Phase 5 optional limitations never auto-record source possibilities as real weaknesses",()=>{
 const h=createHarness();
 h.write("planning.fields.kind","statistics");
 h.nav("completing");
 h.action("completion-open",{node:"C23"});
 assert(h.html.includes("Would any mathematical limitation actually matter here?"));
 assert.equal(h.saved.completion.confirmedLimitations.length,0);
 h.action("guidance-limit-toggle");
 h.action("guidance-limit-select",{limitId:"custom"});
 h.write("completion.limitationDraft.explanation","The source contains only some respondents");
 h.action("guidance-limit-record");
 assert.equal(h.saved.completion.confirmedLimitations.length,0); // consequence required
 h.write("completion.limitationDraft.consequence","The inference is limited to the source group");
 h.action("guidance-limit-record");
 assert.equal(h.saved.completion.confirmedLimitations.length,1);
 h.action("completion-open",{node:"C60"});
 assert(h.html.includes("Limitations you previously identified"));
});

test('problem-first support opens over Planning and keeps its exact node and draft',()=>{
 const s=createProjectState();s.route='planning';s.planning.current='N01';s.planning.fields.aim='An unfinished aim';const h=createHarness(s);
 h.action('open-stuck');assert(h.drawer.includes('My question is too broad'));assert(h.html.includes('data-source-node="N01"'));
 h.action('stuck-topic',{topic:'aim'});assert(h.drawer.includes('Try this now'));assert.equal(h.saved.planning.fields.aim,'An unfinished aim');
 h.action('stuck-return');assert.equal(h.saved.planning.current,'N01');assert.equal(h.saved.route,'planning');
});
test('support work and return restores selected earlier result without marking it complete',()=>{
 const s=createProjectState();s.route='completing';s.completion.current='C34B';s.entries=[{id:'a',phase:'first',status:'completed',result:'Original result',interpretation:'My original interpretation'},{id:'b',phase:'substantial',status:'planned',result:''}];s.completion.activeEntryIndex=0;
 const h=createHarness(s);h.action('open-stuck');h.action('stuck-topic',{topic:'next'});h.action('stuck-work');assert.equal(h.saved.completion.current,'C35');assert.equal(h.saved.completion.nextFromEntryId,'a');
 h.action('stuck-return');assert.equal(h.saved.completion.current,'C34B');assert.equal(h.saved.completion.activeEntryIndex,0);assert.equal(h.saved.entries[0].interpretation,'My original interpretation');assert.equal(h.saved.entries[1].status,'planned');
});
test('support action notes are private and do not overwrite IA notes',()=>{
 const h=createHarness();h.action('open-stuck');h.action('stuck-topic',{topic:'aim'});h.write('completion.support.drafts.aim.action','Choose one quantity');h.action('stuck-save');assert.equal(h.saved.completion.support.task.status,'pending');assert.equal(h.saved.scratch.introduction,'');
});

test('tools library opens over Planning and preserves its node, answers and progress',()=>{
 const s=createProjectState();s.route='planning';s.planning.current='N01';s.planning.fields.aim='My own incomplete aim';const h=createHarness(s);
 h.action('resource-browse');assert(h.drawer.includes('Search tasks'));assert(h.html.includes('data-source-node="N01"'));
 h.action('resource-open',{resourceId:'sheets-pmcc'});assert(h.drawer.includes('=CORREL(A2:A7,B2:B7)'));assert(h.drawer.includes('Video walkthrough'));
 h.action('resource-close');assert(h.html.includes('data-source-node="N01"'));
 h.action('open-stuck');assert.equal(h.saved.planning.fields.aim,'My own incomplete aim');assert.equal(h.saved.planning.completed,false);
});
test('resource guide returns to the same stuck topic rather than another mathematical stage',()=>{
 const h=createHarness();h.action('open-stuck');h.action('stuck-topic',{topic:'calculation'});h.action('resource-browse',{resourceHelp:'true'});h.action('resource-open',{resourceId:'desmos-start'});h.action('resource-close');assert(h.drawer.includes('My calculation or software is not working'));
});

test('a saved aim spark can be edited directly on the motivation page',()=>{
 const s=createProjectState();s.route='planning';s.planning.current='N01V';
 s.planning.fields.aim='My current mathematical aim';s.project.aim=s.planning.fields.aim;
 const h=createHarness(s);
 assert(h.html.includes('data-spark-editor="aim"'));
 assert(h.html.includes('data-spark-library'));
 assert(h.html.includes('My current mathematical aim'));
 h.write('planning.fields.aim','My revised mathematical aim');
 assert.equal(h.saved.planning.fields.aim,'My revised mathematical aim');
 assert.equal(h.saved.project.aim,'My revised mathematical aim');
 assert(h.html.includes('data-bind="planning.fields.beneficiary"'));
});
