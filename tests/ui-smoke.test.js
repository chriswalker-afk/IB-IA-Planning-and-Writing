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
import {newGraphDraft,saveGraphFigure,renderGraphSvg,graphData,splitHeading,analyseGraph} from "../src/diagrams/graph-core.js";
import {renderGraphQuality,renderGraphActions,graphSourceChoices} from "../src/diagrams/graph-view.js";
import {updateGraphField,chooseGraphType,importGraphTable,loadSavedGraph,freshGraph,saveAndLinkGraph,saveGraphDraft} from "../src/diagrams/graph-actions.js";
import {exportGraphFigure} from "../src/diagrams/graph-export.js";
import {imageTraceChecks,renderTraceOverlaySvg,renderCleanTraceSvg,traceCoordinates,traceCalibration} from "../src/diagrams/image-tracer-core.js";
import {renderImageTracer,tracePreviewHtml,traceWorkingHtml,traceQualityHtml,traceOutputHtml} from "../src/diagrams/image-tracer-view.js";
import {setTraceField,setTraceView,setTraceTool,usePhoto,tapTrace,undoTracer,removeTracerPoint,startNewTrace,restoreSavedTrace,saveTraceDraft,saveAndLinkTrace} from "../src/diagrams/image-tracer-actions.js";
import {importTracePhoto,rotateTracePhoto} from "../src/diagrams/image-tracer-upload.js";
import {exportTraceFigure} from "../src/diagrams/image-tracer-export.js";
import {statAnalysis,importStatTable,newStatDraft} from "../src/diagrams/stat-studio-core.js";
import {renderStatSvg} from "../src/diagrams/stat-studio-render.js";
import {renderStatStudio,statDataChoices,statPreviewHtml,statSummaryHtml,statQualityHtml,statOutputHtml} from "../src/diagrams/stat-studio-view.js";
import {setStatField,changeStatKind,toggleStatSeries,importStatValues,freshStat,loadStat,saveStatDraft,saveAndLinkStat} from "../src/diagrams/stat-studio-actions.js";
import {exportStat} from "../src/diagrams/stat-studio-export.js";
import {analyzeTable,importTableData,newTableDraft} from "../src/diagrams/table-studio-core.js";
import {renderTableSvg} from "../src/diagrams/table-studio-render.js";
import {renderTableStudio,tableDataChoices,tablePreviewHtml,tableQualityHtml,tableOutputHtml} from "../src/diagrams/table-studio-view.js";
import {setTableField,setTableColumn,chooseTableMode,toggleTableVariable,toggleTableMeasure,loadTable,freshTable,saveTableDraft,saveAndLinkTable} from "../src/diagrams/table-studio-actions.js";
import {exportTable} from "../src/diagrams/table-studio-export.js";
import {nativeGridSummary,editNativeHeading,editNativeCell,pasteNativeRange,NATIVE_MAX_ROWS,NATIVE_PAGE_ROWS} from "../src/diagrams/native-data-core.js";
import {handleNativeDataAction,nativeStudio,activeNativeType} from "../src/diagrams/native-data-actions.js";
import {analyzeVoronoi,importVoronoiSites,voronoiBounds} from "../src/diagrams/voronoi-core.js";
import {renderVoronoiSvg,voronoiLayout} from "../src/diagrams/voronoi-render.js";
import {voronoiPreviewHtml,voronoiResultHtml,voronoiQualityHtml,voronoiOutputHtml} from "../src/diagrams/voronoi-view.js";
import {setVoronoiField,setVoronoiSite,addVoronoiSite,removeVoronoiSite,clearVoronoiMap,useVoronoiMap,beginVoronoi,loadVoronoi,saveVoronoiDraft,saveAndLinkVoronoi} from "../src/diagrams/voronoi-actions.js";
import {exportVoronoi} from "../src/diagrams/voronoi-export.js";
import {renderRepresentationHub,renderRepresentationSwitcher,representationFocusActive} from "../src/diagrams/representation-hub.js";
import {renderPresentationCoach,renderFigureHandover} from "../src/diagrams/presentation-coach-view.js";
import {figureCaption} from "../src/diagrams/presentation-coach-core.js";
import {displayVoronoiBounds,coordinateFromCanvas,canvasPosition,voronoiFrame,recordVoronoiHistory,applyVoronoiFrame,undoVoronoi,redoVoronoi,freezeVoronoiWindow,fitVoronoiSites,setVoronoiTool,selectVoronoiSite,moveVoronoiSite,proposeVoronoiComparison,showVoronoiComparison,finishVoronoiComparison,selectNearestBisector} from "../src/diagrams/voronoi-interactions.js";
import {renderWriterFieldGuide} from "../src/completing/writer-field-guide.js";
import {setCompletionNode,moveCompletionRoute,completionBack,markCompletionStage,setCompletionField,addMathematicalStage,routesAt,addAccuracyDecision,completionSuggestions,sectionForNode,targetForSection,completeEntry,latestRealResult,flagDependentMathematics,acknowledgeMathReview} from "../src/completing/engine.js";
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
  for(const id of ["#main","#drawerLayer","#saveStatus","#pathCount","#sideMilestones","#importFile","#reportImportFile","#graphCsvFile","#imageTraceFile","#statCsvFile","#tableCsvFile","#voronoiCsvFile","#voronoiMapFile","#toast"]){
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
  const globals={createSamplePreview,createIllustrativeSample,SAMPLE_CHOICES,STATUS_LABELS,resumeRoute,rememberCheckpoint,journeyRail,C_MAJOR_STAGES,completionStage,structuredClone,captureReturn:()=>({scroll:0,attributes:[]}),restoreReturn:()=>{},createEssentialsController:()=>({open(){}}),createCriterionBadgeController:()=>({}),editCriterionReview:()=>false,createExampleController:()=>({}),ideaAction,ideaInput,ideaDifficultyInput,chooseTopic,
     attachIdeaMapGraph:()=>()=>{},insightCapture,planningLearningTrail,resourceDrawer,resourceList,resourceAction,resourceFilter,resourcePreference,newResourceSession,PRACTICE_PAIRS,createStuckViews,captureStuckOrigin,isStuckNode,stuckAction,stuckContext,
    conformanceAction,reviewEditChanged,document,window,localStorage:storage,console,clearTimeout(){},setTimeout(){return 1;},
    createProjectState,normalizeProjectState,persistProjectState,
    newState:createProjectState,normalise:normalizeProjectState,
    KEY:"ia-pathfinder-prototype-v1",
    readRecordValue,updateRecordValue,icon,escapeHtml,cleanUrl,button,
    referenceNodeForPrototypeStep,createPlanningViews,createStudioViews,createCompletingViews,renderWriterFieldGuide,createProjectViews,
    newGraphDraft,saveGraphFigure,renderGraphSvg,graphData,splitHeading,analyseGraph,renderGraphQuality,renderGraphActions,graphSourceChoices,
    updateGraphField,chooseGraphType,importGraphTable,loadSavedGraph,freshGraph,saveAndLinkGraph,saveGraphDraft,exportGraphFigure,
    imageTraceChecks,renderTraceOverlaySvg,renderCleanTraceSvg,traceCoordinates,traceCalibration,renderImageTracer,
    tracePreviewHtml,traceWorkingHtml,traceQualityHtml,traceOutputHtml,setTraceField,setTraceView,setTraceTool,
    usePhoto,tapTrace,undoTracer,removeTracerPoint,startNewTrace,restoreSavedTrace,saveTraceDraft,saveAndLinkTrace,
    importTracePhoto,rotateTracePhoto,exportTraceFigure,
    statAnalysis,importStatTable,newStatDraft,renderStatSvg,renderStatStudio,statPreviewHtml,statSummaryHtml,
    statQualityHtml,statOutputHtml,statDataChoices,setStatField,changeStatKind,toggleStatSeries,importStatValues,freshStat,loadStat,
    saveStatDraft,saveAndLinkStat,exportStat,
    analyzeTable,importTableData,newTableDraft,renderTableSvg,renderTableStudio,tablePreviewHtml,tableQualityHtml,
    tableOutputHtml,tableDataChoices,setTableField,setTableColumn,chooseTableMode,toggleTableVariable,toggleTableMeasure,
    loadTable,freshTable,saveTableDraft,saveAndLinkTable,exportTable,
    nativeGridSummary,editNativeHeading,editNativeCell,pasteNativeRange,NATIVE_MAX_ROWS,NATIVE_PAGE_ROWS,handleNativeDataAction,nativeStudio,activeNativeType,
    analyzeVoronoi,importVoronoiSites,voronoiBounds,renderVoronoiSvg,voronoiLayout,
    voronoiPreviewHtml,voronoiResultHtml,voronoiQualityHtml,voronoiOutputHtml,
    setVoronoiField,setVoronoiSite,addVoronoiSite,removeVoronoiSite,clearVoronoiMap,useVoronoiMap,
    beginVoronoi,loadVoronoi,saveVoronoiDraft,saveAndLinkVoronoi,exportVoronoi,
    renderRepresentationHub,renderRepresentationSwitcher,representationFocusActive,renderPresentationCoach,renderFigureHandover,figureCaption,
    displayVoronoiBounds,coordinateFromCanvas,canvasPosition,voronoiFrame,recordVoronoiHistory,applyVoronoiFrame,undoVoronoi,redoVoronoi,freezeVoronoiWindow,fitVoronoiSites,setVoronoiTool,selectVoronoiSite,moveVoronoiSite,proposeVoronoiComparison,showVoronoiComparison,finishVoronoiComparison,selectNearestBisector,
    setCompletionNode,moveCompletionRoute,completionBack,markCompletionStage,setCompletionField,addMathematicalStage,routesAt,addAccuracyDecision,completionSuggestions,sectionForNode,targetForSection,completeEntry,latestRealResult,flagDependentMathematics,acknowledgeMathReview,
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
 assert(h.html.includes('data-planning-intro="true"'));
 assert(h.html.includes('Sparks remember your ideas'));
 assert(h.html.includes('Criteria appear where they matter'));
 h.action('planning-intro-continue');
 assert(h.html.includes('I have an idea'));
 assert(!h.html.includes('data-planning-intro="true"'));
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
 h.action("plan-advance");assert(h.html.includes('data-source-node="N01P"'));
 assert(h.html.includes('data-action="plan-refine-toggle"'));
 assert(!h.html.includes('id="planning-prediction-refine-panel"'));
 h.action("plan-refine-toggle");
 assert(h.html.includes('id="planning-prediction-refine-panel"'));
 assert(h.html.includes("Three ways to explore mathematics"));
 assert(h.saved.planning.refinePlanOpen);
 assert(h.saved.planning.mathSelected.includes("AA15"));
 h.choose("planning.fields.predictionId","S01");
 h.action("plan-advance");assert(h.html.includes('data-source-node="N03D"'));
 assert(h.html.includes("Two quick checks"));
 assert(!h.html.includes("Rate data readiness /5"));
 assert(!h.html.includes("Rate completion ease /5"));
 h.choose("planning.fields.dataAvailability","some");
 h.choose("planning.fields.permissionNeed","no");
 h.choose("planning.fields.practicalBlocker","no");
 h.action("plan-advance");assert(h.html.includes('data-source-node="N03H"'));
 h.action("plan-advance");assert(h.html.includes('data-source-node="N06T"'));
 assert(!h.saved.planning.completedNodes.includes("N05V"));
 h.action("plan-advance");assert(h.html.includes('data-source-node="N06"'));
 h.action("plan-advance");assert(h.html.includes('data-source-node="N07"'));
 assert.equal(h.saved.project.aim,"How does X relate to Y?");
 assert.equal(h.saved.planning.completed,true);
 assert.equal(h.saved.version,2);
 assert(h.html.includes('CHAPTER 1 COMPLETE'));
 assert(h.html.includes('planning-finish-handoff'));
 assert(h.html.includes('Finish planning &amp; begin writing'));
 assert(h.html.includes('data-action="plan-finish-writing"'));
 assert(!h.html.includes('data-action="go-report" data-condition='));
 h.action('plan-finish-writing');
 assert(h.html.includes('data-source-node="C00"'));
 assert(h.html.includes('Set up: start writing your IA'));
 assert(h.html.includes('Start writing my introduction'));
 assert(h.html.includes('data-action="setup-start-writing"'));
 assert.equal(h.saved.route,'completing');
 assert.equal(h.saved.completion.current,'C00');
 assert.equal(h.saved.completion.stages.C10,'not-started');
 h.action('setup-start-writing');
 assert(h.html.includes('data-source-node="C10"'));
 assert(h.html.includes('My own working introduction notes'));
 assert(h.html.includes('criterion-writing-bubbles'));
 assert.equal(h.saved.completion.current,'C10');
 assert.equal(h.saved.ui.studioSection,'intro');
 assert.equal(h.saved.planning.completed,true);
 assert.equal(h.saved.planning.current,'N07');
 assert.equal(h.saved.project.aim,'How does X relate to Y?');
 assert(h.saved.journey.history.some(x=>x.from==='N07'&&x.to==='C00'));
});

test("returning to a finished plan resumes existing IA Studio writing, without resetting it",()=>{
 const state=createProjectState();
 state.route='planning';state.planning.current='N07';state.planning.completed=true;
 state.planning.fields.aim='How closely can a quadratic describe the observed pattern?';
 state.completion.current='C34B';
 state.completion.visited=['C10','C20','C34B'];
 state.completion.fields.changedSincePlanning='Adjusted the variables after first results';
 state.scratch.introduction='Saved student writing';
 state.entries=[{id:'math-a',phase:'first',status:'completed',result:'A genuine sample result',interpretation:'An actual explanation'}];
 const h=createHarness(state),previous=h.saved;
 assert(h.html.includes('Return to IA Studio'));
 assert(!h.html.includes('Finish planning &amp; begin writing'));
 h.action('plan-finish-writing');
 assert(h.html.includes('data-source-node="C34B"'));
 assert.equal(h.saved.completion.current,'C34B');
 assert.equal(h.saved.scratch.introduction,previous.scratch.introduction);
 assert.equal(h.saved.entries.length,previous.entries.length);
 assert.equal(h.saved.entries[0].id,previous.entries[0].id);
 assert.equal(h.saved.entries[0].result,previous.entries[0].result);
 assert.equal(h.saved.entries[0].interpretation,previous.entries[0].interpretation);
 assert.equal(h.saved.completion.fields.changedSincePlanning,previous.completion.fields.changedSincePlanning);
 assert.equal(h.saved.planning.completed,true);
});

test("the finish-writing action cannot bypass unfinished Planning",()=>{
 const h=createHarness(createProjectState());
 h.action('plan-finish-writing');
 assert.equal(h.saved.route,'home');
 assert.equal(h.saved.completion.current,'C00');
});

test("Set up welcomes students, recommends Planning and captures missing provisional sparks without forcing it",()=>{
 const s=createProjectState();s.route='completing';
 const h=createHarness(s);
 assert(h.html.includes('data-source-node="C00"'));
 assert(h.html.includes('Your writing starts here.'));
 assert(h.html.includes('Write relevant Set up answers directly into your actual IA document'));
 assert(h.html.includes('does not automatically insert text'));
 assert(h.html.includes('Complete Planning first'));
 assert(h.html.includes('Quick-fill missing sparks'));
 assert(h.html.includes('data-bind="planning.fields.aim"'));
 assert(h.html.includes('data-bind="planning.fields.beneficiary"'));
 assert(h.html.includes('data-action="setup-start-writing"'));
 assert(h.html.includes('Set up your IA document'));
 assert(h.html.includes('Format and length'));
 assert(h.html.includes('data-essentials-tab="format"'));
 assert(!h.html.includes('data-action="completion-mark"'));
 h.write('planning.fields.aim','Is the observed pattern well modelled by a quadratic?');
 h.write('planning.fields.beneficiary','I want to compare two possible models');
 assert.equal(h.saved.planning.fields.aim,'Is the observed pattern well modelled by a quadratic?');
 assert.equal(h.saved.planning.fields.beneficiary,'I want to compare two possible models');
 assert.equal(h.saved.planning.completed,false);
 h.action('setup-start-writing');
 assert.equal(h.saved.completion.current,'C10');
 assert(h.html.includes('My own working introduction notes'));
 assert(h.html.includes('Write your introduction'));
 assert(h.html.includes('Turn your sparks into an opening'));
 assert(h.html.includes('data-writing-stage-flow'));
 for(const part of ['advice','sparks','task','examples'])assert(h.html.includes('data-writing-stage-part="'+part+'"'));
 assert(h.html.includes('criterion-writing-bubbles'));
 assert(!h.html.includes('intro-criteria-mini'));
 assert(!h.html.includes('spark-shelf-featured'));
 assert(h.html.includes('data-writing-examples'));
 assert(h.html.includes('Start the journey; don&#39;t write an itinerary'));
 assert(h.html.includes('data-intro-spark="aim"'));
 assert(h.html.includes('data-intro-spark="motivation"'));
 assert(h.html.includes('data-intro-spark="prediction"'));
 assert(h.html.includes('data-bind="planning.fields.prediction"'));
 assert(h.html.includes('data-bind="planning.fields.predictionWhy"'));
 assert(h.html.includes('Define specialist terms briefly'));
 h.write('planning.fields.prediction','I suspect quadratic growth');
 h.write('planning.fields.predictionWhy','Because of the pattern in small cases');
 assert.equal(h.saved.planning.fields.prediction,'I suspect quadratic growth');
 assert.equal(h.saved.planning.fields.predictionWhy,'Because of the pattern in small cases');
 assert.equal(h.saved.project.prediction,'I suspect quadratic growth');
 assert(h.html.includes('data-criterion-badge="completing:C10:aim"'));
 assert(h.html.includes('data-criterion-badge="completing:C10:motivation"'));
 assert(!h.html.includes('Set up your IA document'));
 assert.equal(h.saved.planning.completed,false);
});
test("Set up uses saved Planning sparks without creating repeated mandatory inputs",()=>{
 const s=createProjectState();
 s.route='completing';s.completion.current='C00';s.planning.completed=true;
 s.planning.fields.aim='A genuine mathematical aim';s.planning.fields.beneficiary='My own curiosity';
 s.planning.fields.provisionalTitle='An exploration';
 s.planning.fields.kind='theoretical';s.planning.fields.theoreticalCase='Squares and triangles';s.planning.fields.course='AA SL';
 const h=createHarness(s);
 assert(h.html.includes('Your starting sparks are available'));
 assert(h.html.includes('Review my Planning'));
 assert(h.html.includes('View all sparks'));
 assert(!h.html.includes('class="setup-quick-sparks"'));
 assert(h.html.includes('data-spark-editor="aim"'));
 assert(h.html.includes('data-spark-editor="motivation"'));
 assert(h.html.includes('data-action="setup-start-writing"'));
 h.action('setup-start-writing');
 assert.equal(h.saved.completion.current,'C10');
 assert.equal(h.saved.planning.fields.aim,'A genuine mathematical aim');
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

test("Introduction keeps optional writing advice accessible without a competing cue queue",()=>{
 const h=createHarness();
 h.write("planning.fields.aim","How do changing measurements influence an outcome?");
 h.write("planning.fields.motivation","My interest in realistic measurements");
 h.nav("completing");
 h.action("completion-open",{node:"C10"});
 assert(h.html.includes("Write your introduction"));
 assert(!h.html.includes("data-writing-cue="));
 assert(!h.html.includes("Useful writing moment"));
 assert(h.html.includes('data-action="writer-guide-open"'));
 assert(h.html.includes('data-writing-examples'));
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

test("Writer's Field Guide replaces the old tile, opens without changing student work and returns contextually",()=>{
 const s=createProjectState();s.route="completing";s.completion.current="C00";
 s.planning.fields.aim="Is larger pizza better value?";s.scratch.introduction="My original opening";
 const h=createHarness(s);
 assert(h.html.includes("Key advice to read before you start writing"));
 assert(h.html.includes("Explore 14 writing tips"));
 assert(!h.html.includes("Write, check, revise"));
 const original=h.saved;
 h.action("writer-guide-open");
 assert(h.drawer.includes("Make your IA worth reading."));
 assert(h.drawer.includes("The six essentials"));
 assert(h.drawer.includes("Eight more ideas when you need them"));
 assert(h.drawer.includes("This isn&#39;t a lab report!"));
 assert(h.drawer.includes("data-action=\"writer-guide-example\""));
 assert(h.drawer.includes("data-action=\"writer-guide-story\""));
 assert.deepEqual(h.saved,original);
 h.action("close-drawer");
 h.action("setup-start-writing");
 assert(h.html.includes("Full Writer&#39;s Field Guide")||h.html.includes("Full Writer's Field Guide"));
 assert(h.html.includes('data-action="writer-guide-open"'));
 h.action("writer-guide-open",{guideTip:"voice"});
 assert(h.drawer.includes("You&#39;re allowed to say &#39;I&#39;!"));
 assert.equal(h.saved.scratch.introduction,"My original opening");
 assert.equal(h.saved.planning.fields.aim,"Is larger pizza better value?");
});

test("all three writing chapters use the same four-part scaffold and preserve navigation",()=>{
 const groups={
  data:['C20','C21S','C21M','C21T','C22','C23','C24','C25','C26'],
  maths:['C30','C31','C32','C33','C34','C34A','C34B','C34U','C35','C35H','C35B','C35P','C40','C50','C40T','C40D','C40L'],
  conclusion:['C60','C61','C62','C63','C64']
 };
 const state=createProjectState();state.route='completing';
 state.planning.fields.aim='How does my mathematical expression behave?';
 state.planning.fields.motivation='I discovered a surprising pattern.';
 state.planning.fields.prediction='I think it increases.';
 state.entries=[{id:'math-first',phase:'first',status:'planned',kind:'other',title:'First representation',result:''}];
 state.completion.activeEntryIndex=0;
 for(const [group,nodes] of Object.entries(groups)){
  for(const node of nodes){
   state.completion.current=node;
   const h=createHarness(state);
   assert(h.html.includes('data-source-node="'+node+'"'),node);
   assert(h.html.includes('data-stage-advice="'+group+'"'),node);
   assert(h.html.includes(node==='C20'?'Your mathematical starting points':'Use your relevant sparks'),node);
   const positions=['advice','sparks','task','examples'].map(k=>h.html.indexOf('data-writing-stage-part="'+k+'"'));
   assert(positions.every(v=>v>0)&&positions.every((v,i)=>i===0||v>positions[i-1]),node);
   assert(h.html.includes('studio-stage-writing-location'),node);
   assert(h.html.includes('data-writing-examples'),node);
   assert(!h.html.includes('criteria-panel task-support'),node);
   assert(!h.html.includes('studio-ia-writing-reminder'),node);
   assert(h.html.includes('data-action="completion-route"')||h.html.includes('data-action="completion-open"'),node);
   assert.equal(h.saved.completion.current,node);
   assert.equal(h.saved.planning.fields.prediction,'I think it increases.');
  }
 }
});
test("contextual rubric bubbles are attached to real writing fields in the three new chapters",()=>{
 const state=createProjectState();state.route='completing';
 state.planning.fields.aim='An answerable mathematical question';
 state.entries=[{id:'math-sub',phase:'substantial',status:'planned',kind:'model',title:'Investigate a model',result:'',purpose:''}];
 state.completion.activeEntryIndex=0;
 const expects={
  C20:['completing:C20:source','completing:C20:method','completing:C20:firstBridge','completing:C20:firstChoice','completing:C20:firstPurpose',
   'completing:C20:methodIntroduction','completing:C20:methodJustification',
   'completing:C20:methodEvaluation','completing:C20:methodSuitability'],
  C21S:['completing:C21S:samplingRationale','completing:C21S:responseBias'],
  C21M:['completing:C21M:modelAssumptions','completing:C21M:modelDomain'],
  C21T:['completing:C21T:theoreticalObject'],
  C22:['completing:C22:methodReason'],
  C23:['completing:C23:limitationConsequence'],
  C24:['completing:C24:accuracyReason'],
  C25:['completing:C25:variableDefinitions'],
  C26:['completing:C26:dataAimLink'],
  C31:['completing:C31:firstPurpose'],
  C32:['completing:C32:purpose'],
  C33:['completing:C33:title'],
  C34:['completing:C34:observation'],
  C34A:['completing:C34A:accuracyForResult'],
  C34B:['completing:C34B:title'],
  C34U:['completing:C34U:surpriseCheck'],
  C35:['completing:C35:nextQuestion','completing:C35:nextReason'],
  C35H:['completing:C35H:nextReason'],
  C35P:['completing:C35P:title'],
  C40:['completing:C40:title'],
  C50:['completing:C50:title'],
  C40T:['completing:C40T:title'],
  C40D:['completing:C40D:courseWhy'],
  C40L:['completing:C40L:title'],
  C60:['completing:C61:mainConclusion','completing:C61:uncertainty'],
  C61:['completing:C61:mainConclusion','completing:C61:uncertainty'],
  C62:['completing:C62:benefit'],
  C63:['completing:C63:extension'],
  C64:['completing:C64:title']
 };
 for(const [node,keys] of Object.entries(expects)){
  state.completion.current=node;
  const h=createHarness(state);
  for(const key of keys)assert.equal(h.html.split('data-criterion-badge="'+key+'"').length-1,1,node+': '+key);
 }
});
test("student notes and actual results remain unchanged when a stage is reorganised",()=>{
 const state=createProjectState();state.route='completing';state.completion.current='C60';
 state.planning.fields.aim='What can I genuinely conclude?';
 state.scratch.conclusion='The actual mathematical conclusion is still being written.';
 state.entries=[{id:'result-1',phase:'first',status:'completed',kind:'theory',title:'A case',result:'Found a counterexample',interpretation:'So the general claim was false'}];
 const h=createHarness(state);
 assert(h.html.includes('So the general claim was false')); // The page selects the already recorded interpretation before the raw result.
 assert(h.html.includes('scratch.conclusion'));
 assert.equal(h.saved.scratch.conclusion,state.scratch.conclusion);
 assert.equal(h.saved.entries[0].result,'Found a counterexample');
 assert(!h.html.includes('Your prediction is correct'));
});

test("after Introduction, first maths reuses the selected route and actual source status without duplicate IA prose",()=>{
 const state=createProjectState();state.route='completing';state.completion.current='C10';
 Object.assign(state.planning.fields,{
  aim:'Is there a linear relationship between two measured quantities?',
  motivation:'My interest in a real pattern',kind:'statistics',dataSource:'both',course:'AI SL',
  primaryWhat:'Measurements collected from a local experiment',
  secondaryPublisher:'A published scientific table',
  figurePurpose:'Start by inspecting paired values'
 });
 state.planning.routeExplorer.selectedRoute='relationships';
 state.planning.mathSelected=['AI14','AI15'];
 const h=createHarness(state);
 assert(h.html.includes('Introduce my first maths'));
 h.action("completion-open",{node:"C20"});
 assert.equal(h.saved.completion.current,'C20');
 assert(h.html.includes('data-first-maths-context'));
 assert(h.html.includes('Primary + secondary data'));
 assert(h.html.includes('Measurements collected from a local experiment'));
 assert(h.html.includes('A published scientific table'));
 assert(h.html.includes('Relationships between two variables'));
 assert(h.html.includes('Plot paired measurements')||h.html.includes('Start by inspecting paired values'));
 assert(h.html.includes('data-bind="completion.fields.firstMathsBridgePlacement"'));
 assert(h.html.includes('data-bind="completion.fields.dataAimLink"'));
 assert(h.html.includes('data-bind="completion.fields.firstPurpose"'));
 assert(h.html.includes('data-first-maths-source-details'));
 assert(h.html.includes('data-action="completion-open" data-node="C30"'));
 h.write('completion.fields.dataAimLink','I will inspect the paired quantities to assess the form of a relationship.');
 h.write('completion.fields.firstPurpose','What shape does the genuine data suggest?');
 assert.equal(h.saved.completion.fields.dataAimLink,'I will inspect the paired quantities to assess the form of a relationship.');
 h.action("completion-open",{node:"C30"});
 assert(h.html.includes('I will inspect the paired quantities to assess'));
 assert(h.html.includes('What shape does the genuine data suggest?'));
 h.action("completion-open",{node:"C31"});
 assert(h.html.includes('data-bind="completion.fields.firstPurpose"'));
 assert.equal(h.saved.planning.fields.dataSource,'both');
 assert.equal(h.saved.planning.routeExplorer.selectedRoute,'relationships');
 assert.deepEqual(h.saved.planning.mathSelected,['AI14','AI15']);
});
test("students who made the mathematical link in their Introduction skip repeated bridge writing",()=>{
 const s=createProjectState();s.route='completing';s.completion.current='C20';
 s.planning.fields.kind='theoretical';s.planning.fields.theoreticalCase='The diagonals in polygons';
 s.planning.routeExplorer.selectedRoute='proof';
 const h=createHarness(s);
 assert(h.html.includes('Mathematical objects / theoretical cases'));
 assert(h.html.includes('Explore a few small cases'));
 assert(h.html.includes('data-bind="completion.fields.dataAimLink"'));
 h.choose("completion.fields.firstMathsBridgePlacement","intro");
 assert.equal(h.saved.completion.fields.firstMathsBridgePlacement,'intro');
 assert(h.html.includes('There is no need to repeat it'));
 assert(!h.html.includes('data-bind="completion.fields.dataAimLink"'));
 assert(h.html.includes('data-bind="completion.fields.firstPurpose"'));
 assert(h.html.includes('data-bind="completion.fields.actualSource"'));
 h.action("completion-open",{node:"C30"});
 assert(h.html.includes('You already explained why this follows from your aim'));
 assert.equal(h.saved.entries.length,0);
});
test("first-maths source details remain editable without becoming an unrelated mandatory lab report",()=>{
 const s=createProjectState();s.route='completing';s.completion.current='C20';
 s.planning.fields.kind='statistics';s.planning.fields.dataSource='secondary';
 s.planning.fields.secondaryPublisher='Published census table';
 s.completion.fields.actualSource='The genuine table originally selected';
 s.completion.fields.actualMethod='I transcribed published values with units';
 s.completion.fields.dataStatus='partial';
 const h=createHarness(s);
 assert(h.html.includes('Published census table'));
 assert(h.html.includes('data-first-maths-source-details'));
 for(const k of ['actualSource','actualMethod','dataStatus'])
  assert(h.html.includes(k));
 assert(h.html.includes('I transcribed published values with units'));
 assert.equal(h.saved.completion.fields.actualSource,'The genuine table originally selected');
 h.write("completion.fields.actualMethod","I used the published data and verified its definitions");
 assert.equal(h.saved.completion.fields.actualMethod,"I used the published data and verified its definitions");
 assert(h.html.includes('Introduce your first mathematical step'));
});

test("first maths presents technique-specific mathematical reasoning, not just selected chips",()=>{
 const state=createProjectState();state.route="completing";state.completion.current="C20";
 Object.assign(state.planning.fields,{
  kind:"modelling",dataSource:"primary",course:"AI SL",
  aim:"How can I model the volume of a changing container?",
  primaryWhat:"Dimensions and capacity measurements"
 });
 state.planning.mathSelected=["AI05"];
 const before=JSON.stringify(state);
 const h=createHarness(state);
 assert(h.html.includes('data-technique-start-guide="AI05"'));
 for(const message of ["Quadratic or cubic models","How could I actually start?","Try first","Look for","Then decide",
  "turning point","scatter plot","quadratic from a cubic"])
  assert(h.html.includes(message),message);
 assert(h.html.includes('data-source-context="primary"'));
 assert(h.html.includes("permitted"));
 assert(h.html.includes('data-bind="completion.fields.firstPurpose"'));
 assert.equal(JSON.stringify(h.saved.planning.fields),JSON.stringify(state.planning.fields));
 assert.equal(JSON.stringify(h.saved.planning.mathSelected),JSON.stringify(state.planning.mathSelected));
 assert.equal(h.saved.entries.length,0);
});
test("multiple mathematical choices provide one contextual starting suggestion and optional alternatives",()=>{
 const s=createProjectState();s.route="completing";s.completion.current="C20";
 Object.assign(s.planning.fields,{course:"AI SL",kind:"statistics",dataSource:"secondary"});
 s.planning.fields.secondaryPublisher="An official dataset";
 s.planning.routeExplorer.selectedRoute="relationships";
 s.planning.mathSelected=["AI15","AI14","AI16"];
 const h=createHarness(s);
 assert(h.html.includes('data-first-maths-other-guides'));
 assert(h.html.includes('Advice for my other mathematical possibilities (2)'));
 assert(h.html.includes('data-technique-start-guide="AI14"'));
 assert(h.html.includes('data-technique-start-guide="AI15"'));
 assert(h.html.includes('data-technique-start-guide="AI16"'));
 assert(h.html.indexOf('data-technique-start-guide="AI14"')<h.html.indexOf('data-technique-start-guide="AI15"'));
 assert(h.html.includes("published data"));
 assert(h.html.includes("Cite the source"));
 assert(h.html.includes("An official dataset"));
 assert(h.html.includes('data-first-maths-source-details'));
});
test("theoretical first mathematics follows the saved investigative journey without inventing observations",()=>{
 const s=createProjectState();s.route="completing";s.completion.current="C20";
 Object.assign(s.planning.fields,{course:"AA SL",kind:"theoretical",
  theoreticalCase:"Test a conjecture for integer n"});
 s.planning.routeExplorer.selectedRoute="proof";
 const h=createHarness(s);
 assert(h.html.includes('data-route-start-guide="proof"'));
 assert(h.html.includes("Explore a few small cases"));
 assert(h.html.includes("general"));
 assert(!h.html.includes('data-technique-start-guide="AI05"'));
 assert.equal(h.saved.entries.length,0);
});

test("first mathematics has three separate writing cards and reuses existing method-reason notes",()=>{
 const s=createProjectState();s.route="completing";s.completion.current="C20";
 Object.assign(s.planning.fields,{kind:"statistics",dataSource:"secondary",course:"AI SL",
  aim:"Does a meaningful relationship exist between two measured quantities?"});
 s.planning.routeExplorer.selectedRoute="relationships";
 s.planning.mathSelected=["AI14","AI15"];
 s.completion.fields.methodLimitation="Existing sampling or source caveat";
 const h=createHarness(s);
 const order=["connection","method","evaluation"].map(k=>
  h.html.indexOf('data-first-maths-writing-part="'+k+'"'));
 assert(order.every(x=>x>0)&&order.every((x,i)=>i===0||x>order[i-1]));
 for(const name of ["dataAimLink","methodReason","firstMethodEvaluation","firstPurpose"])
  assert.equal((h.html.match(new RegExp('data-bind="completion.fields.'+name+'"','g'))||[]).length,1,name);
 assert(h.html.includes('data-journey-writing-part="method"'));
 assert(h.html.includes('data-journey-writing-part="evaluation"'));
 assert(h.html.includes('data-journey-writing-id="relationships"'));
 assert(h.html.includes("already knows the course mathematics"));
 assert(h.html.includes("linear association"));
 assert(h.html.includes("rank method"));
 for(const key of ["methodIntroduction","methodJustification","methodEvaluation","methodSuitability"])
  assert.equal((h.html.match(new RegExp('data-criterion-badge="completing:C20:'+key+'"','g'))||[]).length,1,key);
 h.write("completion.fields.dataAimLink","A first scatter diagram follows from my question.");
 h.write("completion.fields.methodReason","I will compare paired values using a scatter diagram to inspect mathematical shape.");
 h.write("completion.fields.firstMethodEvaluation","A linear coefficient may miss curvature; a rank method might be more suitable if the pattern is monotonic.");
 h.write("completion.fields.firstPurpose","Is the observed association approximately linear?");
 assert.equal(h.saved.completion.fields.methodLimitation,"Existing sampling or source caveat");
 assert.equal(h.saved.completion.fields.methodReason,"I will compare paired values using a scatter diagram to inspect mathematical shape.");
 assert(h.saved.completion.fields.firstMethodEvaluation.includes("rank method"));
 h.action("completion-open",{node:"C22"});
 assert(h.html.includes('data-bind="completion.fields.methodReason"'));
 assert(h.html.includes("I will compare paired values"));
 h.action("completion-open",{node:"C23"});
 assert(h.html.includes('data-bind="completion.fields.methodLimitation"'));
 assert(h.html.includes("Existing sampling or source caveat"));
 h.action("completion-open",{node:"C30"});
 assert(h.html.includes("A first scatter diagram follows"));
 assert(h.html.includes("A linear coefficient may miss curvature"));
 assert(h.html.includes("I will compare paired values"));
 assert.equal(h.saved.entries.length,0);
});
test("an already-explained bridge does not suppress 2a and 2b writing fields",()=>{
 const s=createProjectState();s.route="completing";s.completion.current="C20";
 s.planning.fields.kind="theoretical";
 s.planning.routeExplorer.selectedRoute="proof";
 s.completion.fields.firstMathsBridgePlacement="intro";
 s.completion.fields.dataAimLink="Existing paragraph in my Introduction";
 s.completion.fields.methodReason="I will test small cases before seeking a general proof.";
 s.completion.fields.firstMethodEvaluation="Examples alone do not prove a universal statement.";
 const h=createHarness(s);
 assert(h.html.includes('data-first-maths-writing-part="connection"'));
 assert(h.html.includes("There is no need to repeat it"));
 assert(h.html.includes('data-first-maths-writing-part="method"'));
 assert(h.html.includes('data-first-maths-writing-part="evaluation"'));
 assert(h.html.includes("I will test small cases"));
 assert(h.html.includes("Examples alone do not prove"));
 assert.equal((h.html.match(/data-bind="completion.fields.dataAimLink"/g)||[]).length,1);
 assert(h.html.includes('data-journey-writing-id="proof"'));
 h.write("completion.fields.firstMethodEvaluation","Finite checks are not a general proof; I will look for a logical argument.");
 assert.equal(h.saved.completion.fields.methodReason,"I will test small cases before seeking a general proof.");
 assert(h.saved.completion.fields.firstMethodEvaluation.includes("Finite checks"));
 assert.equal(h.saved.completion.fields.dataAimLink,"Existing paragraph in my Introduction");
});
test("a changed investigative journey refreshes method advice without changing saved student's notes",()=>{
 const s=createProjectState();s.route="completing";s.completion.current="C20";
 s.planning.fields.kind="modelling";
 s.planning.routeExplorer.selectedRoute="fitted-models";
 s.completion.fields.methodReason="My own approach for this aim";
 s.completion.fields.firstMethodEvaluation="My own mathematical evaluation";
 const h=createHarness(s);
 assert(h.html.includes('data-journey-writing-id="fitted-models"'));
 const changed=h.saved;
 changed.planning.routeExplorer.selectedRoute="optimisation";
 const reopened=createHarness(changed); // Planning made a different route choice before returning to Studio.
 assert(reopened.html.includes('data-journey-writing-id="optimisation"'));
 assert(reopened.html.toLowerCase().includes("stationary points"));
 assert(reopened.html.includes("My own approach for this aim"));
 assert.equal(reopened.saved.completion.fields.firstMethodEvaluation,"My own mathematical evaluation");
});


test("showing first mathematics always provides three writing areas with the correct criteria, but no writing box in section two",()=>{
 const s=createProjectState();s.route="completing";s.completion.current="C30";
 s.planning.fields.aim="How does a measured quantity vary?";
 const h=createHarness(s);
 for(const part of ["introduce","reflect","next"])
  assert(h.html.includes('data-show-first-writing-box="'+part+'"'),part);
 const blocks=["introduce","show","reflect","next"].map(name=>{
  const start=h.html.indexOf('data-show-first-part="'+name+'"');
  return {name,start};
 });
 assert(blocks.every(x=>x.start>=0),JSON.stringify(blocks));
 assert(blocks.every((x,i)=>i===0||x.start>blocks[i-1].start),"writing parts should appear in order");
 const showPart=h.html.slice(blocks[1].start,blocks[2].start);
 assert(showPart.includes('data-bind="completion.fields.firstWorkResult"'),"Section 2 records output briefly, without an extra page");
 for(const key of ["firstOutputIntroduction","firstInterpretation","nextQuestion","nextReason"])
  assert(h.html.includes('data-bind="completion.fields.'+key+'"'),key);
 for(const key of ["introduceA","introduceB","reflectD","reflectE","nextC","nextD"])
  assert.equal((h.html.match(new RegExp('data-criterion-badge="completing:C30:'+key+'"','g'))||[]).length,1,key);
 h.write("completion.fields.firstOutputIntroduction","The first graph will display X against Y to investigate whether they are related.");
 h.write("completion.fields.firstInterpretation","Draft: I must inspect the real graph before interpreting it.");
 h.write("completion.fields.nextQuestion","Should I test whether a linear pattern is plausible?");
 h.write("completion.fields.nextReason","I can justify this only after inspecting the actual points.");
 const saved=h.saved;
 assert.equal(saved.completion.fields.firstOutputIntroduction,"The first graph will display X against Y to investigate whether they are related.");
 assert.equal(saved.completion.fields.firstInterpretation,"Draft: I must inspect the real graph before interpreting it.");
 assert.equal(saved.completion.fields.nextQuestion,"Should I test whether a linear pattern is plausible?");
 assert.equal(saved.completion.fields.nextReason,"I can justify this only after inspecting the actual points.");
 assert.equal(saved.entries.length,0,"draft boxes should not invent a completed mathematical record");
 h.action("completion-open",{node:"C20"});h.action("completion-open",{node:"C30"});
 assert(h.html.includes("The first graph will display X against Y"));
 assert(h.html.includes("I can justify this only after inspecting"));
});
test("first mathematical writing drafts transfer to the real entry when it is created and keep the same criteria bubbles",()=>{
 const s=createProjectState();s.route="completing";s.completion.current="C30";
 s.completion.fields.firstOutputIntroduction="Before Figure 1 I will show the observed paired quantities.";
 s.completion.fields.firstInterpretation="Provisional reflection to check after producing the diagram.";
 s.completion.fields.firstPurpose="What form does the relationship have?";
 const h=createHarness(s);
 h.action("completion-open",{node:"C31"});
 h.action("completion-route",{condition:"Chosen useful initial representation or calculation"});
 assert.equal(h.saved.completion.current,"C32");
 assert.equal(h.saved.entries.length,1);
 assert.equal(h.saved.entries[0].status,"planned");
 assert.equal(h.saved.entries[0].purpose,"Before Figure 1 I will show the observed paired quantities.");
 assert.equal(h.saved.entries[0].interpretation,"Provisional reflection to check after producing the diagram.");
 h.action("completion-open",{node:"C30"});
 assert(h.html.includes('data-bind="entries.0.purpose"'));
 assert(h.html.includes('data-bind="entries.0.interpretation"'));
 assert(h.html.includes('data-criterion-badge="completing:C30:introduceA"'));
 assert(h.html.includes('data-criterion-badge="completing:C30:reflectD"'));
 assert(h.html.includes('data-bind="completion.fields.nextReason"'));
 const start=h.html.indexOf('data-show-first-part="show"'),end=h.html.indexOf('data-show-first-part="reflect"');
 assert(h.html.slice(start,end).includes('data-bind="entries.0.result"'),"Section 2 edits the same canonical result");
 h.write("entries.0.interpretation","The actual result changes my initial expectation.");
 h.write("entries.0.result","The plotted data are curved.");
 h.choose("entries.0.status","completed");
 assert.equal(h.saved.entries[0].interpretation,"The actual result changes my initial expectation.");
 assert.equal(normalizeProjectState(h.saved).entries[0].interpretation,"The actual result changes my initial expectation.");
 assert.equal(normalizeProjectState(h.saved).completion.fields.firstOutputIntroduction,"Before Figure 1 I will show the observed paired quantities.");
});

test("students can create consecutive separate mathematical pages and reconsider a conclusion",()=>{
 const s=createProjectState();s.route="completing";s.completion.current="C30";
 s.entries=[{id:"first",phase:"first",status:"completed",title:"Original graph",
  result:"The observed relationship bends",localTakeaway:"A straight line does not fit"}];
 s.completion.activeEntryIndex=0;
 const h=createHarness(s);
 assert(h.html.includes('data-action="stage-add"'));
 h.action("stage-add");
 assert.equal(h.saved.completion.current,"C40");
 assert.equal(h.saved.entries.length,2);
 assert.equal(h.saved.entries[1].fromEntryId,"first");
 assert(h.html.includes('data-math-stage-page="2"'));
 assert(h.html.includes('data-show-first-part="introduce"'));
 assert(h.html.includes('data-show-first-part="show"'));
 assert(h.html.includes('data-show-first-part="reflect"'));
 assert(h.html.includes('data-show-first-part="next"'));
 h.write("entries.1.result","Quadratic model has better residuals");
 h.choose("entries.1.status","completed");
 h.write("entries.1.localTakeaway","Quadratic fits better than linear");
 h.write("entries.1.nextQuestion","Can the turning point optimise my aim?");
 h.write("entries.1.nextWhy","The vertex is a useful extremum");
 h.action("stage-add");
 assert.equal(h.saved.completion.current,"C50");
 assert.equal(h.saved.entries.length,3);
 assert.equal(h.saved.entries[2].fromEntryId,h.saved.entries[1].id);
 assert.equal(h.saved.entries[2].title,"Can the turning point optimise my aim?");
 assert.equal(h.saved.entries[2].status,"planned");
 assert.equal(h.saved.entries[2].result,"");
 assert(h.html.includes('data-math-stage-page="3"'));
 h.action("stage-conclude");
 assert.equal(h.saved.completion.current,"C50","no conclusion without confirmation");
 assert(h.html.includes("12–20 pages"));
 h.action("conclusion-cancel");
 assert.equal(h.saved.completion.current,"C50");
 assert(!h.html.includes('data-conclusion-gate'));
 h.action("stage-conclude");
 h.action("conclusion-confirm");
 assert.equal(h.saved.completion.current,"C60");
});
test("all direct requests for the conclusion pause at the advisory warning first",()=>{
 const s=createProjectState();s.route="completing";s.completion.current="C04";
 const h=createHarness(s);
 h.action("completion-open",{node:"C60"});
 assert.equal(h.saved.completion.current,"C04");
 assert(h.html.includes('data-conclusion-gate'));
 h.action("conclusion-cancel");
 assert(!h.html.includes('data-conclusion-gate'));
 h.action("completion-open",{node:"C35"});
 h.action("completion-route",{condition:"Enough relevant mathematics—bring findings together"});
 assert.equal(h.saved.completion.current,"C35");
 assert(h.html.includes('data-conclusion-gate'));
 h.action("conclusion-confirm");
 assert.equal(h.saved.completion.current,"C60");
});
