import {createSamplePreview} from "./src/core/sample-preview.js";
import {createIllustrativeSample,SAMPLE_CHOICES} from "./src/core/illustrative-samples.js";
import {sampleIAWritingWords} from "./src/core/sample-current-workflow.js";
import {captureReturn,restoreReturn} from "./src/ui/return-context.js";
import {STATUS_LABELS,resumeRoute,rememberCheckpoint} from "./src/ui/journey.js";
import {insightCapture} from "./src/ui/insight-threads.js";
import {planningLearningTrail} from "./src/ui/living-journey.js";
import {createExampleController} from "./src/examples/controller.js";
import {createEssentialsController} from "./src/essentials/controller.js";
import {createCriterionBadgeController} from "./src/essentials/criteria-badges.js";
import {assessmentFramework,assessmentBanner} from "./src/essentials/assessment-cohorts.js";
import {editCriterionReview} from "./src/essentials/review.js";
import {ideaAction,ideaInput,ideaDifficultyInput,chooseTopic} from './src/ideas/engine.js';
import {attachIdeaMapGraph} from './src/ideas/map-layout.js';
import {resourceDrawer,resourceList} from './src/resources/views.js';
import {resourceAction,resourceFilter,resourcePreference} from './src/resources/actions.js';
import {newResourceSession} from './src/resources/state.js';
import {PRACTICE_PAIRS} from './src/resources/catalog.js';
import {createStuckViews} from './src/help/stuck-views.js';
import {captureStuckOrigin,isStuckNode} from './src/help/stuck-state.js';
import {stuckAction} from './src/help/stuck-actions.js';
import {stuckContext} from './src/help/stuck.js';
import {conformanceAction} from "./src/completing/conformance-actions.js";
import {reviewEditChanged} from "./src/completing/review.js";
import {createPlanningEnvelope,getFieldDiff,mergePlanningEnvelope} from "./src/handover/schema.js";
import {modelFromEnvelope,suggestedFilename} from "./src/handover/report-model.js";
import {createHandoverViews} from "./src/ui/handover-views.js";
import {createCheckingViews} from "./src/checking/views.js";
import {actOnWritingCue} from "./src/completing/guidance-actions.js";
import {eligibleWritingCues} from "./src/completing/writing-guidance.js";
import {selectLimitation,recordLimitation,limitationContextKey,relevantLimitations} from "./src/completing/limitation-guidance.js";
import {relevantBivariateOptions} from "./src/completing/bivariate-guidance.js";
import {resultFamily,routeNextQuestions} from "./src/completing/route-coach.js";

import { planningMove, planAutoAdvance, planningBack, planningEdit, applyPlanningField, toggleMath, selectedMaths, exploreMathRoute, chooseMathRoute, syncPlanningToProject, setPlanCurrent, planningFlags } from "./src/planning/engine.js";
import { createPlanningViews } from "./src/ui/planning-views.js";
import {savePlannedAccuracy,editPlannedAccuracy,removePlannedAccuracy} from "./src/planning/data-decisions.js";
import {updatePrimaryQuantity,editPrimaryQuantity,removePrimaryQuantity,reusePrimaryQuantity} from "./src/planning/primary-quantities.js";
import {applySuggestedTimeline,localToday,validDate,timelineWeek} from "./src/planning/timeline.js";
import { createStudioViews } from "./src/ui/studio-views.js";
import {createCompletingViews} from "./src/completing/views.js";
import {toggleConclusionResult} from "./src/completing/conclusion-workspace.js";
import {newGraphDraft,saveGraphFigure,renderGraphSvg,graphData,splitHeading,analyseGraph} from "./src/diagrams/graph-core.js";
import {renderGraphQuality,renderGraphActions,graphSourceChoices,renderGraphModelSummary} from "./src/diagrams/graph-view.js";
import {renderModelComparison,renderResidualPanelContents} from "./src/diagrams/graph-diagnostics-view.js";
import {updateGraphField,chooseGraphType,importGraphTable,loadSavedGraph,freshGraph,saveAndLinkGraph,saveGraphDraft,addGraphModel,toggleGraphModel,removeGraphModel,updateGraphModelExpression,updateGraphModelOption} from "./src/diagrams/graph-actions.js";
import {exportGraphFigure} from "./src/diagrams/graph-export.js";
import {imageTraceChecks,renderTraceOverlaySvg,renderCleanTraceSvg,traceCoordinates,traceCalibration} from "./src/diagrams/image-tracer-core.js";
import {renderImageTracer,tracePreviewHtml,traceWorkingHtml,traceQualityHtml,traceOutputHtml} from "./src/diagrams/image-tracer-view.js";
import {setTraceField,setTraceView,setTraceTool,usePhoto,tapTrace,undoTracer,removeTracerPoint,startNewTrace,restoreSavedTrace,saveTraceDraft,saveAndLinkTrace} from "./src/diagrams/image-tracer-actions.js";
import {importTracePhoto,rotateTracePhoto} from "./src/diagrams/image-tracer-upload.js";
import {exportTraceFigure} from "./src/diagrams/image-tracer-export.js";
import {statAnalysis,importStatTable,newStatDraft} from "./src/diagrams/stat-studio-core.js";
import {renderStatSvg} from "./src/diagrams/stat-studio-render.js";
import {renderStatStudio,statDataChoices,statPreviewHtml,statSummaryHtml,statQualityHtml,statOutputHtml,statReadingGuideHtml} from "./src/diagrams/stat-studio-view.js";
import {setStatField,changeStatKind,toggleStatSeries,importStatValues,freshStat,loadStat,saveStatDraft,saveAndLinkStat,chooseHistogramSuggestion} from "./src/diagrams/stat-studio-actions.js";
import {exportStat} from "./src/diagrams/stat-studio-export.js";
import {analyzeTable,importTableData,newTableDraft,tableColumnFormat} from "./src/diagrams/table-studio-core.js";
import {renderTableSvg} from "./src/diagrams/table-studio-render.js";
import {renderTableStudio,tableDataChoices,tablePreviewHtml,tableA4PreviewHtml,tableQualityHtml,tableOutputHtml} from "./src/diagrams/table-studio-view.js";
import {setTableField,setTableColumn,setTableColumnFormat,toggleTableDisplayColumn,chooseTableMode,toggleTableVariable,toggleTableMeasure,loadTable,freshTable,saveTableDraft,saveAndLinkTable} from "./src/diagrams/table-studio-actions.js";
import {exportTable} from "./src/diagrams/table-studio-export.js";
import {transferTableHistogram,transferTableCurve,transferStatFrequencyTable} from "./src/diagrams/frequency-handover.js";
import {copyGraphModelToTable,detachTableGraphModel} from "./src/diagrams/graph-to-table.js";
import {nativeGridSummary,editNativeHeading,editNativeCell,pasteNativeRange,NATIVE_MAX_ROWS,NATIVE_PAGE_ROWS} from "./src/diagrams/native-data-core.js";
import {handleNativeDataAction,nativeStudio,activeNativeType} from "./src/diagrams/native-data-actions.js";
import {analyzeVoronoi,importVoronoiSites,voronoiBounds} from "./src/diagrams/voronoi-core.js";
import {renderVoronoiSvg,voronoiLayout} from "./src/diagrams/voronoi-render.js";
import {voronoiPreviewHtml,voronoiResultHtml,voronoiQualityHtml,voronoiOutputHtml} from "./src/diagrams/voronoi-view.js";
import {setVoronoiField,setVoronoiSite,addVoronoiSite,removeVoronoiSite,clearVoronoiMap,useVoronoiMap,beginVoronoi,loadVoronoi,saveVoronoiDraft,saveAndLinkVoronoi} from "./src/diagrams/voronoi-actions.js";
import {exportVoronoi} from "./src/diagrams/voronoi-export.js";
import {geometryAnalysis} from "./src/diagrams/geometry-core.js";
import {snapGeometryEdge,snapGeometryRightAngle,moveGeometryVertex} from "./src/diagrams/geometry-advanced.js";
import {renderGeometrySvg,geometryLayout} from "./src/diagrams/geometry-render.js";
import {geometryPreviewHtml,geometryQualityHtml,geometryOutputHtml} from "./src/diagrams/geometry-view.js";
import {setGeometryField,setGeometryVertex,geometryTemplate,geometryAddVertex,geometryRemoveVertex,geometryFresh,loadGeometry,saveGeometryDraft,saveAndLinkGeometry,importGeometryFromTrace, geometryAddAuxPoint,geometryRemoveAuxPoint,setGeometryAuxPoint,geometryAddGuide,geometryRemoveGuide,setGeometryGuide,moveGeometryAuxPoint} from "./src/diagrams/geometry-actions.js";
import {exportGeometry} from "./src/diagrams/geometry-export.js";
import {probabilityPreviewHtml,probabilityQualityHtml,probabilityOutputHtml} from "./src/diagrams/probability-view.js";
import {setProbabilityField,setProbabilityStage,setProbabilityBranch,toggleProbabilityLeaf,freshProbability,loadProbability,saveProbabilityDraft,saveAndLinkProbability} from "./src/diagrams/probability-actions.js";
import {chooseProbabilityPreset,enableFlexibleProbability,addProbabilityOutcome,removeProbabilityOutcome,changeProbabilityContinuation} from "./src/diagrams/probability-flexible-actions.js";
import {exportProbability} from "./src/diagrams/probability-export.js";
import {displayVoronoiBounds,coordinateFromCanvas,canvasPosition,voronoiFrame,recordVoronoiHistory,applyVoronoiFrame,undoVoronoi,redoVoronoi,freezeVoronoiWindow,fitVoronoiSites,setVoronoiTool,selectVoronoiSite,moveVoronoiSite,proposeVoronoiComparison,showVoronoiComparison,finishVoronoiComparison,selectNearestBisector} from "./src/diagrams/voronoi-interactions.js";
import {renderRepresentationHub,renderRepresentationSwitcher,representationFocusActive} from "./src/diagrams/representation-hub.js";
import {REPRESENTATION_TOOLS,representationTool,activeRepresentationTool,closeRepresentationTools,activateRepresentationTool,representationFigureKey,representationReturnNode} from "./src/diagrams/representation-registry.js";
import {renderPresentationCoach,renderFigureHandover} from "./src/diagrams/presentation-coach-view.js";
import {figureCaption} from "./src/diagrams/presentation-coach-core.js";
import {renderWriterFieldGuide,renderWriterGuideWelcome,shouldShowWriterGuideWelcome,renderWriterGuidePopin} from "./src/completing/writer-field-guide.js";
import {writingGuideRecommendation} from "./src/completing/writer-guide-context.js";
import {C_MAJOR_STAGES,setCompletionNode,moveCompletionRoute,completionBack,markCompletionStage,setCompletionField,startFirstRepresentation,addMathematicalStage,routesAt,addAccuracyDecision,completionSuggestions,sectionForNode,targetForSection,completionStage,completeEntry,latestRealResult,sourceResultForNext,flagDependentMathematics,acknowledgeMathReview} from "./src/completing/engine.js";
import {adaptiveNextDirections,flagJourneyRouteDependents} from "./src/completing/adaptive-journey.js";

import { createProjectViews } from "./src/ui/project-views.js";
import { createProjectState as newState, normalizeProjectState as normalise, persistProjectState, STORAGE_KEY as KEY } from "./src/core/project-state.js";
import { readRecordValue, updateRecordValue } from "./src/core/record-access.js";
import { icon, escapeHtml, cleanUrl, button } from "./src/ui/primitives.js";
import {supportsMathInField,mathFieldTools} from "./src/math/editor-shell.js";
import {diagramHtmlMath,formatDiagramShorthand,hasDiagramEquation} from "./src/diagrams/diagram-notation.js";
import { referenceNodeForPrototypeStep } from "./src/core/prototype-bridge.js";
/* IA Pathfinder — Phase 4 Completing workflow. Student-authored results only. */
(() => {
  "use strict";
  const $ = (s, root = document) => root.querySelector(s);
  const e = escapeHtml;
  let state = newState();
  const previewStorage=(()=>{try{return sessionStorage;}catch{return null;}})();
  const preview=createSamplePreview(previewStorage,normalise);
  const resourceSession = newResourceSession();
  createExampleController(() => state); // Read-only, ephemeral examples; no student state writes.
  const essentialsController=createEssentialsController({getState:()=>state,onEdit:data=>{if(!editCriterionReview(state,data))return false;save();return true;},onChangedClose:()=>render()});
  createCriterionBadgeController({getState:()=>state,
    openRubric:(criterion,trigger)=>essentialsController.open({tab:"rubric",criterion},trigger),
    openReview:(mode,trigger)=>essentialsController.open({tab:"submission",mode},trigger)});
  let lastFocus = null;
  let lastDrawer = "";
  let drawerReturn=null;
  let pendingImport = null;
  let importSelected = new Set();
  let exportBusy = false;
  let toastHandle = null;
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) state = normalise(JSON.parse(saved));
  } catch(err) { console.warn("Unable to restore saved prototype", err); }
  const resumedPreview=preview.resume();
  if(resumedPreview)state=resumedPreview;
  const main = $("#main");
  const layer = $("#drawerLayer");
  const guidePopinHost = document.querySelector("#writerGuidePopinLayer") || {hidden:true,innerHTML:"",querySelector:()=>null};
  let guidePopinOrigin=null;
  let guidePopinRecommendation=null;
  const planTitles = ["Your starting point","Shape your question","Have a clear motivation","Choose a direction","Your data or starting material","Is it feasible?","Plan your mathematics","Make a prediction","Your first mathematical move","Your planning snapshot"];
  const studioSections = [
    {id:"intro",name:"Introduction",sub:"Set out your purpose and motivation",icon:"pencil"},
    {id:"data",name:"Data & methods",sub:"Record what you actually have and did",icon:"flask"},
    {id:"math",name:"Mathematical journey",sub:"Explore, interpret, and decide what follows",icon:"chart"},
    {id:"conclusion",name:"Conclusion",sub:"Bring the key findings together",icon:"flag"},
    {id:"review",name:"Final review",sub:"Check communication and prepare your own draft",icon:"check-circle"}
  ];
  const filled = value => typeof value === "string" ? !!value.trim() : !!value;
  const hasPlan = () => state.planning.visited.length > 0 || state.ui.planMax > 0 || filled(state.project.aim) || filled(state.project.idea);
  const hasStudio = () => state.entries.length > 0 || state.completion.visited.length>0 || Object.values(state.scratch).some(filled) || Object.values(state.completion.fields).some(filled);
  const demoFlag = () => state.demo ? '<span class="meta-pill gold">' + icon("sparkles") + ' Sample investigation</span>' : "";
  const field = (path, label, placeholder, opts = {}) => {
    const value = getPath(path) ?? "";
    const type = opts.type || "text";
    const hint = opts.hint ? '<p class="field-hint">' + e(opts.hint) + '</p>' : "";
    const rows = opts.rows || 3;
    const fieldId = "field-" + path.replace(/[^a-z0-9-]/gi, "-") + (opts.drawer ? "-drawer" : "");
    const input = type === "textarea"
      ? '<textarea class="field" id="' + fieldId + '" data-bind="' + e(path) + '" rows="' + rows + '" placeholder="' + e(placeholder) + '">' + e(value) + '</textarea>'
      : type === "select"
      ? '<select class="field" id="' + fieldId + '" data-bind="' + e(path) + '">' + (opts.options || []).map(op => '<option value="' + e(op[0]) + '"' + (value === op[0] ? " selected" : "") + '>' + e(op[1]) + '</option>').join("") + '</select>'
      : '<input class="field" type="' + e(type) + '" id="' + fieldId + '" data-bind="' + e(path) + '" placeholder="' + e(placeholder) + '" value="' + e(value) + '">';
    return '<div class="field-group"><label class="field-label" for="' + fieldId + '">' + e(label) + '</label>' + input + hint +
      (supportsMathInField(path,type,opts)?mathFieldTools(path):"")+ '</div>';
  };
  const stuckViews=createStuckViews({getState:()=>state,e,icon,field});
  const handoverViews=createHandoverViews({getState:()=>state,icon,e,button,field});

  // MathJax is split out of the initial page load. Existing writing stays
  // plain text; the optional editor operates on the exact caret selection.
  let mathEditorPromise=null;
  const getMathEditor=()=>mathEditorPromise||(mathEditorPromise=import("./src/math/editor.js"));
  
  // Consistent optional notation palette for diagram labels, not numeric data.
  function diagramNotationField(root){
    if(!root)return null;
    if(root.dataset.notationCol!==undefined)return root.parentElement?.querySelector('[data-table-col="'+root.dataset.notationCol+'"][data-table-part="'+root.dataset.notationPart+'"]');
    if(root.dataset.notationSiteIndex!==undefined)return root.parentElement?.querySelector('[data-voronoi-site="'+root.dataset.notationSiteIndex+'"][data-voronoi-site-key="name"]');
    if(root.dataset.notationVertexIndex!==undefined)return root.closest(".geometry-vertex")?.querySelector('[data-geometry-vertex="'+root.dataset.notationVertexIndex+'"][data-geometry-vertex-key="'+root.dataset.notationKey+'"]');
    const kind=root.dataset.notationStudio,key=root.dataset.notationKey;
    return root.parentElement?.querySelector('[data-'+kind+'-field="'+key+'"]');
  }
  function refreshDiagramValuePreview(root){
    const field=diagramNotationField(root),preview=root?.querySelector("[data-notation-value-preview]");
    if(!field||!preview)return;
    const raw=field.value||"",maths=hasDiagramEquation(raw)||formatDiagramShorthand(raw)!==raw;
    preview.hidden=!maths;
    if(maths)preview.innerHTML='<small>Label preview</small><span>'+diagramHtmlMath(raw)+'</span>';
    else preview.textContent="";
  }
  function refreshDiagramValuePreviews(scope){
    scope?.querySelectorAll?.("[data-diagram-notation]")?.forEach(refreshDiagramValuePreview);
  }
  async function handleDiagramNotation(el){
    const root=el.closest("[data-diagram-notation]");
    if(!root)return;
    const field=diagramNotationField(root),panel=root.querySelector("[data-notation-panel]");
    if(!field||!panel)return;
    const action=el.dataset.action;
    if(action==="diagram-notation-toggle"||action==="diagram-notation-close"){
      const show=action==="diagram-notation-toggle"&&panel.hidden;
      document.querySelectorAll("[data-diagram-notation] [data-notation-panel]").forEach(other=>{
        if(other!==panel){other.hidden=true;other.closest("[data-diagram-notation]")?.querySelector(".diagram-notation-toggle")?.setAttribute("aria-expanded","false");}
      });
      panel.hidden=!show;
      const toggle=root.querySelector(".diagram-notation-toggle");
      toggle?.setAttribute("aria-expanded",String(show));
      if(show){refreshDiagramValuePreview(root);panel.querySelector("[data-diagram-expression]")?.focus();}
      else toggle?.focus({preventScroll:true});
      return;
    }
    let insert=el.dataset.notationToken||el.dataset.tableToken||"";
    if(action==="diagram-notation-insert"){
      const tex=panel.querySelector("[data-diagram-expression]")?.value.trim()||"";
      if(!tex){
        const error=panel.querySelector("[data-diagram-notation-error]");
        if(error){error.textContent="Enter a mathematical expression first.";error.hidden=false;}
        panel.querySelector("[data-diagram-expression]")?.focus();
        return;
      }
      try{
        const {mathSvg}=await import("./src/math/mixed-math.js");
        mathSvg(tex);
      }catch(error){
        const output=panel.querySelector("[data-diagram-notation-error]");
        if(output){output.textContent=error.message;output.hidden=false;}
        return;
      }
      insert="\\("+tex+"\\)";
    }
    if(!insert||root.isConnected===false||field.isConnected===false)return;
    const error=panel.querySelector("[data-diagram-notation-error]");
    if(error){error.hidden=true;error.textContent="";}
    const start=field.selectionStart??field.value.length,end=field.selectionEnd??start;
    const draft=field.value.slice(0,start)+insert+field.value.slice(end);
    let changed=false;
    const studio=root.dataset.notationStudio;
    if(studio==="graph")changed=updateGraphField(state.graphStudio,root.dataset.notationKey,draft);
    else if(studio==="stat")changed=setStatField(state.statStudio,root.dataset.notationKey,draft);
    else if(studio==="trace")changed=setTraceField(state.imageTracer,root.dataset.notationKey,draft);
    else if(studio==="geometry"&&root.dataset.notationVertexIndex!==undefined)
      changed=setGeometryVertex(state.geometryStudio,Number(root.dataset.notationVertexIndex),root.dataset.notationKey,draft);
    else if(studio==="geometry")changed=setGeometryField(state.geometryStudio,root.dataset.notationKey,draft);
    else if(studio==="voronoi"&&root.dataset.notationSiteIndex!==undefined)
      changed=setVoronoiSite(state.voronoiStudio,Number(root.dataset.notationSiteIndex),"name",draft);
    else if(studio==="voronoi")changed=setVoronoiField(state.voronoiStudio,root.dataset.notationKey,draft);
    else if(studio==="table"&&root.dataset.notationCol!==undefined)
      changed=setTableColumn(state.tableStudio,Number(root.dataset.notationCol),root.dataset.notationPart,draft);
    else if(studio==="table")changed=setTableField(state.tableStudio,root.dataset.notationKey,draft);
    else return;
    if(!changed)return;
    field.value=studio==="graph"?state.graphStudio.draft[root.dataset.notationKey]:
      studio==="stat"?state.statStudio.draft[root.dataset.notationKey]:
      studio==="trace"?state.imageTracer.draft[root.dataset.notationKey]:
      studio==="geometry"&&root.dataset.notationVertexIndex!==undefined?
        state.geometryStudio.draft.vertices[Number(root.dataset.notationVertexIndex)]?.[root.dataset.notationKey]||"":
      studio==="geometry"?state.geometryStudio.draft[root.dataset.notationKey]:
      studio==="voronoi"&&root.dataset.notationSiteIndex!==undefined?
        state.voronoiStudio.draft.sites[Number(root.dataset.notationSiteIndex)]?.name||"":
      studio==="voronoi"?state.voronoiStudio.draft[root.dataset.notationKey]:
      root.dataset.notationCol!==undefined?(root.dataset.notationPart==="heading"?
        state.tableStudio.draft.headings[Number(root.dataset.notationCol)]:
        state.tableStudio.draft.unitDecisions[Number(root.dataset.notationCol)]?.unit):
      state.tableStudio.draft[root.dataset.notationKey];
    const caret=Math.min(start+insert.length,field.value.length);
    field.focus({preventScroll:true});field.setSelectionRange?.(caret,caret);
    refreshDiagramValuePreview(root);
    save();
    if(studio==="graph")refreshGraphPreview();
    else if(studio==="stat")refreshStatPreview();
    else if(studio==="trace")refreshTracePreview();
    else if(studio==="geometry")refreshGeometryPreview();
    else if(studio==="voronoi")refreshVoronoiPreview();
    else refreshTablePreview();
  }

  function refreshMathPreviews(scope){
    const roots=scope?.querySelectorAll?.(".math-writing-tools")||[];
    const toRender=[...roots].filter(root=>{
      const textarea=root.closest(".field-group")?.querySelector('textarea[data-bind]');
      return textarea&&/\\(?:\(|\[)/.test(textarea.value);
    });
    if(!toRender.length)return;
    void getMathEditor().then(mod=>{
      for(const root of toRender){
        const textarea=root.closest(".field-group")?.querySelector('textarea[data-bind]');
        if(textarea&&root.isConnected!==false)mod.refreshMathWritingPreview(root,textarea);
      }
    }).catch(error=>console.warn("Equation preview unavailable",error));
  }
  async function mathAction(el){
    const root=el.closest(".math-writing-tools");
    if(!root)return;
    const textarea=root.closest(".field-group")?.querySelector('textarea[data-bind]');
    if(!textarea)return;
    const mod=await getMathEditor();
    if(root.isConnected===false)return;
    const slot=root.querySelector("[data-math-composer-slot]");
    const toggle=root.querySelector('[data-action="math-open"]');
    const action=el.dataset.action;
    const close=()=>{
      slot.innerHTML="";toggle?.setAttribute("aria-expanded","false");
      textarea.focus({preventScroll:true});
    };
    if(action==="math-close"){close();return;}
    if(action==="math-open"||action==="math-edit-existing"){
      if(action==="math-open"&&slot.querySelector("[data-math-composer]")){close();return;}
      // Never create two competing equation forms on the page.
      for(const other of document.querySelectorAll("[data-math-composer-slot]")){
        if(other!==slot){other.innerHTML="";other.closest(".math-writing-tools")?.
         querySelector('[data-action="math-open"]')?.setAttribute("aria-expanded","false");}
      }
      const start=textarea.selectionStart??textarea.value.length,end=textarea.selectionEnd??start;
      slot.innerHTML=mod.mathComposer();
      const composer=slot.querySelector("[data-math-composer]");
      composer.dataset.replaceStart=String(start);composer.dataset.replaceEnd=String(end);
      if(action==="math-edit-existing"){
        const at=Number(el.dataset.mathStart),endAt=Number(el.dataset.mathEnd);
        const token=(await import("./src/math/mixed-math.js")).mixedMathTokens(textarea.value)
         .find(t=>t.type==="math"&&t.start===at&&t.end===endAt);
        if(!token){close();return;}
        composer.dataset.replaceStart=String(at);composer.dataset.replaceEnd=String(endAt);
        composer.querySelector("[data-math-expression]").value=token.value;
        composer.querySelector("[data-math-display]").value=token.display?"display":"inline";
      }
      toggle?.setAttribute("aria-expanded","true");
      mod.refreshMathExpressionPreview(composer);
      composer.querySelector("[data-math-expression]")?.focus({preventScroll:false});
      return;
    }
    const composer=slot.querySelector("[data-math-composer]");
    if(!composer)return;
    const input=composer.querySelector("[data-math-expression]");
    if(action==="math-template"){
      const id=el.dataset.mathTemplate,templates=(await import("./src/math/mixed-math.js")).EQUATION_TEMPLATES;
      const example=templates.find(t=>t.id===id);
      if(!example)return;
      const start=input.selectionStart??0,end=input.selectionEnd??start;
      if(input.value.trim())input.setRangeText(example.tex,start,end,"end");
      else input.value=example.tex;
      input.focus();mod.refreshMathExpressionPreview(composer);return;
    }
    if(action==="math-insert"){
      try{
        const {insertMixedEquation}=await import("./src/math/mixed-math.js");
        const result=insertMixedEquation(textarea.value,input.value,{
          start:Number(composer.dataset.replaceStart),end:Number(composer.dataset.replaceEnd),
          display:composer.querySelector("[data-math-display]").value==="display"
        });
        textarea.value=result.value;
        textarea.setSelectionRange?.(result.cursor,result.cursor);
        updateBoundField(textarea.dataset.bind,result.value);
        save();
        mod.refreshMathWritingPreview(root,textarea);
        close();
        toast("Equation inserted in your answer","Your text and the typeset equation will be retained in the project export.");
      }catch(error){
        const problem=composer.querySelector("[data-math-error]");
        if(problem){problem.textContent=error.message||"Check the equation.";problem.hidden=false;}
        input.focus();
      }
    }
  }

  const getPath = path => readRecordValue(state,path);
  const putPath = (path,value) => updateRecordValue(state,path,value);
  function refreshSavedSpark(path){
    // Update only the read-only indicators. Never rerender a focused text field.
    const node=state.route==="planning"?state.planning.current:state.route==="completing"?state.completion.current:"";
    if(!node||typeof main?.querySelector!=="function")return;
    const captures=main.querySelectorAll(".task-shell .insight-capture");
    if(/^(planning\.fields\.|completion\.fields\.|entries\.)/.test(path))for(const current of captures){
      const html=insightCapture(state,current.dataset.insightSource||node);
      if(html)current.outerHTML=html;
    }
    if(state.route==="planning"){
      const currentTrail=main.querySelector(".planning-learning-trail");
      if(currentTrail){
        // Refresh only read-only progress: never replace the student's focused input
        // or the active support controls next to the trail.
        const wrapper=document.createElement("div");
        wrapper.innerHTML=planningLearningTrail(state);
        const updated=wrapper.querySelector(".planning-learning-trail");
        const oldChapters=currentTrail.querySelector(".planning-trail-desktop");
        const newChapters=updated?.querySelector(".planning-trail-desktop");
        const oldCompact=currentTrail.querySelector(".planning-trail-compact");
        const newCompact=updated?.querySelector(".planning-trail-compact");
        if(oldChapters&&newChapters){
          const wasOpen=oldChapters.querySelector(".planning-trail-checkpoints")?.open;
          if(wasOpen)newChapters.querySelector(".planning-trail-checkpoints").open=true;
          oldChapters.replaceWith(newChapters);
        }
        if(oldCompact&&newCompact){
          const wasOpen=oldCompact.open;
          const wasCheckpointsOpen=oldCompact.querySelector(".planning-trail-checkpoints")?.open;
          newCompact.open=wasOpen;
          if(wasCheckpointsOpen)newCompact.querySelector(".planning-trail-checkpoints").open=true;
          oldCompact.replaceWith(newCompact);
        }
      }
    }
  }
  function refreshNativeWorksheet(type){
    const studio=nativeStudio(state,type),root=main.querySelector?.('[data-native-grid="'+type+'"]');
    if(!studio||!root)return;
    const status=nativeGridSummary(studio.draft),metric=root.querySelector("[data-native-metrics]");
    if(metric)metric.textContent=status.filled+" entered values · "+status.rows+" working rows · "+
     (studio.draft.columns.length||2)+" columns"+
     (status.incomplete?" · "+status.incomplete+" incomplete rows":"");
    const raw=root.closest("[data-graph-studio],[data-stat-studio],[data-table-studio]")?.
      querySelector('[data-'+type+'-field="raw"]');
    if(raw&&studio.draft.raw===""&&raw.value!=="")raw.value="";
    const options=main.querySelector?.('[data-native-choices="'+type+'"]');
    if(options)options.innerHTML=type==="graph"?graphSourceChoices(studio,icon,e):
     type==="stat"?statDataChoices(studio,e):tableDataChoices(studio,e);
    if(type==="graph"){
     for(const key of ["xLabel","yLabel"]){
      const input=main.querySelector?.('[data-graph-field="'+key+'"]');
      if(input&&document.activeElement!==input)input.value=studio.draft[key];
     }
    }
    if(type==="stat"){
     const input=main.querySelector?.('[data-stat-field="variable"]');
     if(input&&document.activeElement!==input)input.value=studio.draft.variable;
    }
    if(type==="graph")refreshGraphPreview();
    if(type==="stat")refreshStatPreview();
    if(type==="table")refreshTablePreview();
  }
  function openNativeTool(type){
    if(!nativeStudio(state,type))return;
    rememberMathEditorOrigin();
    if(state.completion.current!=="C31")setCompletionNode(state,"C31",{reason:"dataset-transfer"});
    state.route="completing";
    activateRepresentationTool(state,type);
    save();render();
    document.querySelector?.('[data-native-grid="'+type+'"]')?.scrollIntoView?.({block:"start",behavior:"auto"});
  }
  function refreshPresentation(type){
    const tool=representationTool(type);
    if(!tool)return;
    const studio=state[tool.studio],root=main.querySelector?.('[data-'+tool.root+']');
    if(!studio?.draft||!root)return;
    const coach=root.querySelector('[data-presentation-coach="'+type+'"]');
    if(coach){
      const moreOpen=coach.querySelector("details.ia-coach-more")?.open===true;
      coach.outerHTML=renderPresentationCoach(state,type,studio.draft,icon,e);
      if(moreOpen){
       const extra=root.querySelector("details.ia-coach-more");
       if(extra)extra.open=true;
      }
    }
    const handover=root.querySelector('[data-figure-handover="'+type+'"]');
    if(handover)handover.outerHTML=renderFigureHandover(state,type,studio.draft,icon,e);
  }
  function refreshGraphPreview(){
    const d=state.graphStudio?.draft;
    const image=main.querySelector?.("[data-graph-preview]");
    if(!image||!d)return;
    image.innerHTML=renderGraphSvg(d);
    const quality=main.querySelector?.("[data-graph-quality]");
    if(quality)quality.innerHTML=renderGraphQuality(state.graphStudio,icon,e);
    const actions=main.querySelector?.("[data-graph-output]");
    if(actions)actions.innerHTML=renderGraphActions(state.graphStudio,icon,e);
    const status=main.querySelector?.("[data-graph-preview-meta]");
    if(status)status.textContent=d.kind==="function"?"Function (not collected observations)":graphData(d).points.length+" paired observations plotted";
    const modelResult=analyseGraph(d);
    main.querySelectorAll?.("[data-graph-model-summary]")?.forEach(element=>{
      const model=modelResult.models?.find(m=>m.id===element.dataset.graphModelSummary);
      if(model)element.innerHTML=renderGraphModelSummary(model,e);
    });
    const comparison=main.querySelector?.("[data-graph-comparison]");
    if(comparison)comparison.innerHTML=renderModelComparison(d,modelResult,e);
    const residual=main.querySelector?.("[data-graph-residual-content]");
    if(residual)residual.innerHTML=renderResidualPanelContents(d,modelResult,icon,e);
    refreshPresentation("graph");
  }

  function rememberMathEditorOrigin(){
    if(["C30","C40","C50"].includes(state.completion.current))
      state.completion.editorReturnNode=state.completion.current;
  }
  function avoidEditingUnrelatedStageFigure(studio,entry,fresh){
    if(entry?.phase!=="substantial")return;
    const saved=studio.figures.find(x=>x.id===studio.activeId);
    if(saved&&saved.entryId!==entry.id)fresh(studio);
  }
  function navigateGraph(figureId=""){
    rememberMathEditorOrigin();
    if(state.completion.current!=="C31")setCompletionNode(state,"C31",{reason:"graph-editor"});
    activateRepresentationTool(state,"graph");
    const entry=completeEntry(state);
    if(!figureId)avoidEditingUnrelatedStageFigure(state.graphStudio,entry,freshGraph);
    const id=figureId||entry?.graphFigureId;
    if(id&&state.graphStudio.figures.some(x=>x.id===id))
      loadSavedGraph(state.graphStudio,id);
    save();render();
    document.querySelector?.("[data-graph-studio]")?.scrollIntoView?.({block:"start",behavior:"auto"});
  }
  function refreshTracePreview(){
    const tracer=state.imageTracer;
    if(!tracer?.open||state.completion.current!=="C31")return;
    const mainRoot=document.querySelector?.("[data-image-tracer]");
    if(!mainRoot)return;
    const photo=mainRoot.querySelector("[data-trace-preview]");
    if(photo)photo.outerHTML=tracePreviewHtml(tracer,icon,e);
    const list=mainRoot.querySelector("[data-trace-working]");
    if(list)list.outerHTML=traceWorkingHtml(tracer,icon,e);
    const quality=mainRoot.querySelector("[data-trace-quality]");
    if(quality)quality.innerHTML=traceQualityHtml(tracer,icon,e);
    const output=mainRoot.querySelector("[data-trace-output]");
    if(output)output.innerHTML=traceOutputHtml(tracer,icon,e);
    refreshPresentation("trace");
  }
  function navigateTrace(figureId=""){
    rememberMathEditorOrigin();
    if(state.completion.current!=="C31")setCompletionNode(state,"C31",{reason:"trace-editor"});
    activateRepresentationTool(state,"trace");
    const entry=completeEntry(state);
    if(!figureId)avoidEditingUnrelatedStageFigure(state.imageTracer,entry,startNewTrace);
    const id=figureId||entry?.imageTraceId;
    if(id&&state.imageTracer.figures.some(x=>x.id===id))
      restoreSavedTrace(state.imageTracer,id);
    save();render();
    document.querySelector?.("[data-image-tracer]")?.scrollIntoView?.({block:"start",behavior:"auto"});
  }
  function refreshStatPreview(){
    if(!state.statStudio?.open||state.completion.current!=="C31")return;
    const root=main.querySelector?.("[data-stat-studio]");if(!root)return;
    const preview=root.querySelector("[data-stat-preview]");
    if(preview)preview.outerHTML=statPreviewHtml(state.statStudio,icon,e);
    const reading=root.querySelector("[data-stat-reading-guide]");
    if(reading)reading.outerHTML=statReadingGuideHtml(state.statStudio,icon,e);
    const summary=root.querySelector("[data-stat-summary]");
    if(summary)summary.innerHTML='<h3>Compact numerical summary</h3>'+statSummaryHtml(state.statStudio,icon,e);
    const quality=root.querySelector("[data-stat-quality]");
    if(quality)quality.innerHTML=statQualityHtml(state.statStudio,icon,e);
    const output=root.querySelector("[data-stat-output]");
    if(output)output.innerHTML=statOutputHtml(state.statStudio,icon,e);
    refreshPresentation("stat");
  }
  function navigateStat(figureId=""){
    rememberMathEditorOrigin();
    if(state.completion.current!=="C31")setCompletionNode(state,"C31",{reason:"stat-editor"});
    activateRepresentationTool(state,"stat");
    const entry=completeEntry(state);
    if(!figureId)avoidEditingUnrelatedStageFigure(state.statStudio,entry,freshStat);
    const id=figureId||entry?.statFigureId;
    if(id&&state.statStudio.figures.some(x=>x.id===id))
      loadStat(state.statStudio,id);
    save();render();
    document.querySelector?.("[data-stat-studio]")?.scrollIntoView?.({block:"start",behavior:"auto"});
  }
  function refreshTablePreview(){
    if(!state.tableStudio?.open||state.completion.current!=="C31")return;
    const root=main.querySelector?.("[data-table-studio]");
    if(!root)return;
    const preview=root.querySelector("[data-table-preview]");
    if(preview)preview.outerHTML=tablePreviewHtml(state.tableStudio,e);
    const paper=root.querySelector("[data-table-a4]");
    if(paper){
      const wasOpen=paper.querySelector("details")?.open===true;
      paper.outerHTML=tableA4PreviewHtml(state.tableStudio,e);
      if(wasOpen)root.querySelector("[data-table-a4] details").open=true;
    }
    const quality=root.querySelector("[data-table-quality]");
    if(quality)quality.innerHTML=tableQualityHtml(state.tableStudio,icon,e);
    const output=root.querySelector("[data-table-output]");
    if(output)output.innerHTML=tableOutputHtml(state.tableStudio,icon);
    refreshPresentation("table");
  }
  function navigateTable(figureId=""){
    rememberMathEditorOrigin();
    if(state.completion.current!=="C31")setCompletionNode(state,"C31",{reason:"table-editor"});
    activateRepresentationTool(state,"table");
    const entry=completeEntry(state);
    if(!figureId)avoidEditingUnrelatedStageFigure(state.tableStudio,entry,freshTable);
    const id=figureId||entry?.tableFigureId;
    if(id&&state.tableStudio.figures.some(x=>x.id===id))
      loadTable(state.tableStudio,id);
    save();render();
    document.querySelector?.("[data-table-studio]")?.scrollIntoView?.({block:"start",behavior:"auto"});
  }
  function refreshVoronoiPreview(){
    if(!state.voronoiStudio?.open||state.completion.current!=="C31")return;
    const root=main.querySelector?.("[data-voronoi-studio]");if(!root)return;
    const preview=root.querySelector("[data-voronoi-preview]");
    if(preview)preview.outerHTML=voronoiPreviewHtml(state.voronoiStudio,icon,e);
    const summary=root.querySelector("[data-voronoi-summary]");
    if(summary)summary.innerHTML='<h3>Explore your actual results</h3>'+voronoiResultHtml(state.voronoiStudio,e);
    const quality=root.querySelector("[data-voronoi-quality]");
    if(quality)quality.innerHTML=voronoiQualityHtml(state.voronoiStudio,icon,e);
    const output=root.querySelector("[data-voronoi-output]");
    if(output)output.innerHTML=voronoiOutputHtml(state.voronoiStudio,icon);
    refreshPresentation("voronoi");
    const current=state.voronoiStudio;
    root.querySelectorAll?.("[data-voronoi-site]").forEach(input=>{
      if(document.activeElement===input)return;
      const site=current.draft.sites[Number(input.dataset.voronoiSite)];
      if(!site)return;
      const key=input.dataset.voronoiSiteKey;
      const value=site[key];if(input.value!==String(value??""))input.value=String(value??"");
    });
    root.querySelectorAll?.(".voronoi-site-row").forEach((row,i)=>{
      row.classList.toggle("selected",current.draft.sites[i]?.id===current.selectedSiteId);
    });
  }
  function refreshGeometryPreview(){
    const root=main.querySelector?.("[data-geometry-studio]");if(!root||!state.geometryStudio?.open)return;
    const preview=root.querySelector("[data-geometry-preview]");if(preview){
      const left=preview.scrollLeft;
      preview.outerHTML=geometryPreviewHtml(state.geometryStudio);
      root.querySelector("[data-geometry-preview]").scrollLeft=left;
    }
    const quality=root.querySelector("[data-geometry-quality]");if(quality)quality.outerHTML=geometryQualityHtml(state.geometryStudio,icon,e);
    const output=root.querySelector(".geometry-output");if(output)output.outerHTML=geometryOutputHtml(state.geometryStudio,icon);
    refreshPresentation("geometry");
  }
  function refreshProbabilityPreview(){
    const root=main.querySelector?.("[data-probability-studio]");
    if(!root||!state.probabilityStudio?.open)return;
    const preview=root.querySelector("[data-prob-preview]");
    if(preview){
      const left=preview.scrollLeft;
      preview.outerHTML=probabilityPreviewHtml(state.probabilityStudio);
      root.querySelector("[data-prob-preview]").scrollLeft=left;
    }
    const quality=root.querySelector("[data-prob-quality]");
    if(quality)quality.outerHTML=probabilityQualityHtml(state.probabilityStudio,e);
    const output=root.querySelector("[data-prob-output]");
    if(output)output.outerHTML=probabilityOutputHtml(state.probabilityStudio,icon);
    // Keep conditional history legends and selected-path labels accurate while
    // a student edits outcome text, without detaching the focused input.
    const d=state.probabilityStudio.draft;
    const pathLabel=id=>id?[...id].map((bit,i)=>
      d.branches[id.slice(0,i)]?.[Number(bit)]?.label||"unlabelled outcome").join(" → "):"Starting event";
    root.querySelectorAll("[data-prob-history]").forEach(node=>
      node.textContent=pathLabel(node.dataset.probHistory));
    root.querySelectorAll("[data-prob-path-label]").forEach(node=>
      node.textContent=pathLabel(node.dataset.probPathLabel));
    root.querySelectorAll("[data-prob-stage-label]").forEach(node=>
      node.textContent=d.stageLabels[Number(node.dataset.probStageLabel)]||"Stage");
    root.querySelectorAll("[data-prob-event-heading]").forEach(node=>
      node.textContent=node.dataset.probEventHeading==="eventLeaves"?d.eventName:d.conditionName);
    refreshPresentation("probability");
  }
  function navigateProbability(figureId=""){
    rememberMathEditorOrigin();
    if(state.completion.current!=="C31")setCompletionNode(state,"C31",{reason:"probability-editor"});
    activateRepresentationTool(state,"probability");
    const entry=completeEntry(state);
    if(!figureId)avoidEditingUnrelatedStageFigure(state.probabilityStudio,entry,freshProbability);
    const id=figureId||entry?.probabilityFigureId;
    if(id&&state.probabilityStudio.figures.some(f=>f.id===id))
      loadProbability(state.probabilityStudio,id);
    save();render();
    document.querySelector?.("[data-probability-studio]")?.scrollIntoView?.({block:"start",behavior:"auto"});
  }
  function navigateGeometry(id=""){
    rememberMathEditorOrigin();if(state.completion.current!=="C31")setCompletionNode(state,"C31",{reason:"geometry-editor"});
    activateRepresentationTool(state,"geometry");
    const entry=completeEntry(state);
    if(!id)avoidEditingUnrelatedStageFigure(state.geometryStudio,entry,geometryFresh);
    const saved=id||entry?.geometryFigureId;
    if(saved)loadGeometry(state.geometryStudio,saved);
    save();render();document.querySelector?.("[data-geometry-studio]")?.scrollIntoView?.({block:"start",behavior:"auto"});
  }
  function navigateVoronoi(figureId=""){
    rememberMathEditorOrigin();
    if(state.completion.current!=="C31")setCompletionNode(state,"C31",{reason:"voronoi-editor"});
    activateRepresentationTool(state,"voronoi");
    const entry=completeEntry(state);
    if(!figureId)avoidEditingUnrelatedStageFigure(state.voronoiStudio,entry,beginVoronoi);
    const id=figureId||entry?.voronoiFigureId;
    if(id&&state.voronoiStudio.figures.some(x=>x.id===id))
      loadVoronoi(state.voronoiStudio,id);
    save();render();
    document.querySelector?.("[data-voronoi-studio]")?.scrollIntoView?.({block:"start",behavior:"auto"});
  }
  // The resource library opens the same registered editors as IA Studio.
  // Keep the current page and active editor when a user visits from Planning,
  // Checking or a later mathematical stage.
  const diagramNavigators=Object.freeze({
    graph:navigateGraph,stat:navigateStat,table:navigateTable,
    trace:navigateTrace,voronoi:navigateVoronoi,geometry:navigateGeometry,probability:navigateProbability
  });
  function activeResourceCreator(){
    return activeRepresentationTool(state)?.id||"";
  }
  function closeResourceCreators(){
    closeRepresentationTools(state);
  }
  function clearResourceCreatorReturn(){
    state.ui.resourceCreatorReturnRoute="";
    state.ui.resourceCreatorReturnNode="";
    state.ui.resourceCreatorReturnTool="";
  }
  function launchResourceCreator(type){
    if(!representationTool(type)||!Object.hasOwn(diagramNavigators,type)){
      toast("That diagram creator is unavailable.");return;
    }
    state.ui.resourceCreatorReturnRoute=state.route;
    state.ui.resourceCreatorReturnNode=state.completion.current||"C00";
    state.ui.resourceCreatorReturnTool=activeResourceCreator();
    if(!layer.hidden)closeDrawer(false);
    state.route="completing";
    diagramNavigators[type]();
  }
  function returnFromResourceCreator(){
    const route=state.ui.resourceCreatorReturnRoute;
    if(!route)return;
    const node=state.ui.resourceCreatorReturnNode;
    const priorTool=state.ui.resourceCreatorReturnTool;
    clearResourceCreatorReturn();
    closeResourceCreators();
    if(node&&node!==state.completion.current){
      if(state.completion.history.at(-1)===node)state.completion.history.pop();
      setCompletionNode(state,node,{history:false,reason:"return-from-resource-creator"});
    }
    if(node==="C31"){
      if(representationTool(priorTool))activateRepresentationTool(state,priorTool);
    }
    nav(route,{top:true});
  }
  function updateBoundField(path,value) {
    if(path.startsWith("planning.fields.")){
      const before=getPath(path),ok=applyPlanningField(state,path.slice("planning.fields.".length),value);
      if(ok&&before!==value&&state.handover?.confirmedAt){state.handover.confirmedAt="";state.handover.needsReview=true;}
      return ok;
    }
    if(path.startsWith("completion.fields.")){
      return setCompletionField(state,path.slice("completion.fields.".length),value);
    }
    const before=getPath(path);
    const changed=putPath(path,value);
    if(changed)reviewEditChanged(state,path,before,value);
    if(changed&&before!==value){
      if(path.startsWith("entries.")){
        const [,index,key]=path.split(".");
        if(/^\d+$/.test(index)){
          flagDependentMathematics(state,Number(index),key,before,value);
          syncOutcome(path,value);
          if(before!==value&&["technique","methodId"].includes(key))state.entries[Number(index)].resultSignal="";
         }
      }
      let stage=path==="scratch.introduction"?"C10":path==="scratch.conclusion"?"C60":
        path==="scratch.dataNotes"?"C20":path==="scratch.finalReview"?"C90":
        path.startsWith("entries.")?(state.entries[Number(path.split(".")[1])]?.phase==="first"?"C30":"C40"):null;
      if(stage&&state.completion.stages[stage]==="complete")state.completion.stages[stage]="needs-review";
    }
    if(changed&&state.handover?.confirmedAt&&(path.startsWith("planning.fields.")||path.startsWith("project."))){
      state.handover.confirmedAt="";state.handover.needsReview=true;
    }
    // Editing the project-context drawer must not leave the Planning record stale.
    const mirror={"project.aim":"aim","project.course":"course",
      "project.beneficiary":"beneficiary","project.precision":"firstAccuracy"};
    if(changed&&mirror[path])applyPlanningField(state,mirror[path],value);
    return changed;
  }
  // Explicit, result-scoped student decisions. No inference from a prediction or coefficient.
  function syncOutcome(path,value){
    const match=/^entries\.(\d+)\.(resultSignal|observation)$/.exec(path);
    if(!match)return;
    const entry=state.entries[Number(match[1])],c=state.completion;
    if(!entry)return;
    if(match[2]==="resultSignal"&&resultFamily(entry)==="pmcc"){
      c.fields.pmccSignal=value;
      c.pmccSignalForEntryId=entry.id;
    }
    if(match[2]==="observation"&&entry.kind==="scatter"){
      c.fields.scatterPattern=value;
      c.scatterPatternForEntryId=entry.id;
      c.fields.scatterDetail="";
      c.scatterDetailForEntryId="";
    }
  }
  function save() {
    if(preview.active){preview.save(state);setSaveStatus("Sample preview only");refreshProgress();return;}
    try { persistProjectState(state,localStorage); setSaveStatus("Saved on this device"); refreshProgress(); }
    catch { setSaveStatus("Could not save — export a backup",true); }
  }
  function setSaveStatus(message,error=false) {
    const el=$("#saveStatus");
    if(el){el.innerHTML='<span class="save-dot"></span> ' + e(message);el.classList.toggle("error",error);}
  }
  function toast(text,detail="") {
    const el=$("#toast");
    el.innerHTML=detail?'<span class="toast-check">'+icon("check-circle")+'</span><div><strong>'+e(text)+'</strong><p>'+e(detail)+'</p></div>':e(text);
    el.classList.toggle("checkpoint-toast",!!detail);el.classList.add("show");
    clearTimeout(toastHandle);toastHandle=setTimeout(()=>el.classList.remove("show"),detail?6500:3500);
  }
  function previewBanner(){
    const figureCount=(state.graphStudio?.figures?.length||0)+(state.tableStudio?.figures?.length||0);
    const wordCount=preview.active?sampleIAWritingWords(state):0;
    return preview.active?'<aside class="sample-preview-banner" aria-label="Sample preview"><div><strong>'+icon("sparkles")+' Fully worked fictional sample</strong><p>Three linked mathematical stages with editable Pathfinder graphs/tables, a developed IA-style mathematical narrative, Planning and A–E checking notes. Fictional teaching material only; your own investigation is unchanged.</p><p class="sample-preview-metrics">'+wordCount.toLocaleString()+' IA-facing words · '+figureCount+' editable saved figures · not a finished submission</p></div><div class="button-row">'+button("See the sample journey","sample-journey","btn-secondary btn-sm")+button("Read IA-style sample PDF","export-sample-ia-pdf","btn-secondary btn-sm")+button("Return to my investigation","leave-preview","btn-primary")+button("Another sample","open-demos","btn-quiet btn-sm")+'</div></aside>':"";
  }
  function leavePreview(){
    if(!preview.active)return;
    const origin=preview.position;
    let latest=null;try{latest=localStorage.getItem(KEY);}catch{}
    closeDrawer(false);state=preview.leave(latest);drawerReturn=null;
    render();setSaveStatus("Your investigation restored");restoreReturn(origin);
    toast("Back to your investigation. Sample changes were kept separate.");
  }
  function choose(path, options, opts={}) {
    const value = getPath(path);
    const shape=opts.stack?"choice-stack":"choice-grid";
    return '<div class="'+shape+'" role="group" aria-label="'+e(opts.label||"Choose an option")+'">' +
      options.map(o => {
        const isSelected=String(value) === String(o.value);
        return '<button type="button" class="choice'+(opts.tight?" tight":"")+(isSelected?" selected":"")+
          '" aria-pressed="'+isSelected+'" data-choice="'+e(path)+'" data-value="'+e(o.value)+'">' +
          (o.icon?'<span class="choice-symbol">'+icon(o.icon)+'</span>':"") +
          '<span class="choice-body"><span class="choice-title">'+e(o.title)+'</span>'+(o.desc?'<span class="choice-subtitle">'+e(o.desc)+'</span>':"")+
          '</span><span class="choice-marker">'+icon("check")+'</span></button>';
      }).join("") + '</div>';
  }
  function numberPick(path,title) {
    const v = Number(getPath(path));
    return '<div class="field-group"><label class="field-label">'+e(title)+'</label><div class="selection-number" role="group" aria-label="'+e(title)+'">'+
      [1,2,3,4,5].map(n=>'<button type="button" class="number-btn'+(v===n?" selected":"")+'" data-choice="'+e(path)+'" data-value="'+n+'" aria-pressed="'+(v===n)+'">'+n+'</button>').join("")+'</div><p class="field-hint">1 = not ready yet · 5 = well prepared. A reflection, not an IB grade.</p></div>';
  }
  const overline = (text) => '<p class="eyebrow">'+e(text)+'</p>';
  const note = (text, warning=false) => '<div class="inline-note'+(warning?" warning":"")+'">'+icon(warning?"info":"lightbulb")+'<p>'+text+'</p></div>';
  function panelCard(label,text,action,iconName,badge="") {
    return '<button type="button" class="studio-tile" data-action="'+action+'"><span class="feature-icon">'+icon(iconName)+'</span><strong>'+e(label)+'</strong><p>'+e(text)+'</p>'+badge+'</button>';
  }
  function sheetTitle(label,title,sub="") {
    return '<div class="page-top"><div>'+overline(label)+'<h1>'+e(title)+'</h1>'+(sub?'<p class="page-intro">'+e(sub)+'</p>':"")+'</div>'+demoFlag()+'</div>';
  }
  function helpButton(key,label="Help me think") {
    return '<button class="help-inline" type="button" data-action="toggle-help" data-help="'+e(key)+'">'+icon("lightbulb")+e(label)+icon(state.ui.helpKey===key?"chevron-left":"chevron-right")+'</button>';
  }
  function helpBox(key,content) {
    return state.ui.helpKey===key ? '<div class="help-details">'+content+'</div>' : "";
  }
  function cue(key,title,text) {
    const status=state.cues[key];
    if(["done","not-relevant"].includes(status)) return "";
    const opened=state.ui.openCue===key;
    return '<div class="micro-cue"><div class="micro-cue-top">'+icon("pencil")+e(title)+'</div><p>'+e(text)+'</p>'+
      '<div class="button-row">' +
      '<button type="button" class="btn" data-action="cue-write" data-key="'+e(key)+'">Write a note</button>'+
      '<button type="button" class="btn" data-action="cue-covered" data-key="'+e(key)+'">Already covered</button>'+
      '<button type="button" class="btn" data-action="cue-skip" data-key="'+e(key)+'">Not relevant</button></div>'+
      (opened?'<div class="field-group" style="margin-top:15px">'+field('cueNotes.'+key,'Your own note (not your finished IA)','Record your thoughts in your own words.',{type:"textarea",rows:3})+
      button("Close note","close-cue","btn-sm btn-light")+'</div>':"")+'</div>';
  }
  function readableArea(area) {
    return ({relationships:"Relationships and patterns",models:"Mathematical models",optimisation:"Optimisation or rates of change",proof:"Mathematical reasoning and proof",other:"Student-chosen mathematics",unsure:"To be decided"})[area]||"To be decided";
  }
  function summary(title,text) {const has=filled(text);return '<div class="summary-block'+(!has?" is-empty":"")+'"><span class="label">'+e(title)+'</span><p>'+e(has?text:"Not decided yet")+'</p></div>';}
  // The view factories depend on mutable student state but do not own navigation or persistence.
  const viewDependencies = { getState:()=>state, icon, e, button, field, choose, numberPick,
    note, summary, filled, readableArea, helpButton, helpBox, cue, panelCard,
    overline, sheetTitle, demoFlag, hasPlan, hasStudio, planTitles, studioSections,
    referenceNodeForPrototypeStep, tabletNav:()=>tabletNav() };
  const {viewPlanning}=createPlanningViews(viewDependencies);
  const {mathDefault,currentMath,suggestions}=createStudioViews(viewDependencies);
  const {viewCompleting}=createCompletingViews(viewDependencies);
  const {viewHome,viewPath,viewReport,tabletNav}=createProjectViews(viewDependencies);
  const {viewChecking}=createCheckingViews(viewDependencies);
  // The permanent sidebar is navigation only. Chapter progress belongs in
  // the single Discovery Trail displayed by the active workspace.
  function refreshPathCount(){
    const badge=$("#pathCount");
    if(badge)badge.textContent=String(state.entries.length);
  }
  function refreshProgress(){
    refreshPathCount();
    document.querySelectorAll('[data-action="completion-mark"]').forEach(b=>{
      const active=state.completion.stages[b.dataset.stage]===b.dataset.status;
      b.setAttribute('aria-pressed',String(active));b.classList.toggle('selected',active);
    });
  }
  function filterMathOptions() {
    const query=(state.planning.mathSearch||"").toLocaleLowerCase("en").trim();
    document.querySelectorAll(".plan-math-option").forEach(el=>{
      el.hidden=!!query && !(el.dataset.searchText||"").includes(query);
    });
  }
  function handlePlanningResult(result){
    if(!result?.ok){toast(result?.error||"Please review this answer.");return;}
    syncPlanningToProject(state);
    const checkpoint=result.route?.from==="N06"&&result.route?.to==="N07";
    if(checkpoint)rememberCheckpoint(state,"Your provisional plan is ready to take forward","Keep the question purposeful. You can revisit your plan as the evidence develops.","N07");
    if(result.route?.to==="C00"||result.completePlanning===true&&result.route?.to==="C00"){
      setCompletionNode(state,"C00");nav("completing");return;
    }
    nav("planning");
    if(checkpoint)toast(state.ui.latestTitle,state.ui.latestDetail);
    else {
      const from=result.route?.from;
      const sparks={
        N01:["Your working title is taking shape","Your provisional title and question can guide this investigation. Revise them if the mathematics develops."],
        N03:["A possible evidence route","This is your plan for getting started, not a claim that evidence has been collected."],
        N01P:["Your early expectation","A prediction is optional and provisional. Actual mathematics will determine what is supported."]
      };
      if(sparks[from]&&result.route&&
         (from!=="N01"||(state.planning.fields.provisionalTitle||state.planning.fields.aim)?.trim())&&
         (from!=="N03"||state.planning.fields.dataSource?.trim())&&
         (from!=="N01P"||(state.planning.fields.prediction||state.planning.fields.predictionId)?.trim())){
        toast(...sparks[from]);
      }
    }
  }
  function handleCompletionResult(result){
    if(!result?.ok){toast(result?.error||"Please review this mathematical decision.");return;}
    if(result.targetRoute==="planning"){nav("planning");return;}
    nav("completing");
  }
  function requestConclusionReview(){
    if(state.completion.current==="C60"){nav("completing");return;}
    state.completion.conclusionWarningOpen=true;
    save();render();
    const warning=document.querySelector?.("[data-conclusion-gate]");
    warning?.scrollIntoView?.({block:"start",behavior:"smooth"});
    warning?.focus?.({preventScroll:true});
  }
  function returnToShowingFirstMaths(reason){
    // Generators remain editable, but they are not an extra writing stage.
    // Using an intentionally hidden figure again should make its preview visible.
    const selected=REPRESENTATION_TOOLS.find(tool=>tool.linkedReason===reason);
    if(selected){
      const id=state[selected.studio]?.activeId;
      const key=selected.id+":"+id;
      if(id&&Array.isArray(state.completion.hiddenFirstFigures))
        state.completion.hiddenFirstFigures=state.completion.hiddenFirstFigures.filter(x=>x!==key);
    }
    const page=representationReturnNode(state);
    closeRepresentationTools(state);
    state.completion.editorReturnNode="";
    setCompletionNode(state,page,{reason});
    save();render();
    document.querySelector?.('[data-show-first-part="show"]')?.scrollIntoView?.({block:"start",behavior:"auto"});
  }
  let detachIdeaMapGraph=()=>{};
  function render(opts={}) {
    if(state.ui.resourceCreatorReturnRoute&&(state.route!=="completing"||state.completion.current!=="C31"))
      clearResourceCreatorReturn();
    closeGuidePopin(false);
    detachIdeaMapGraph();
    const map={home:viewHome,planning:viewPlanning,completing:viewCompleting,checking:viewChecking,path:viewPath,report:viewReport};
    document.body.classList.toggle("representation-focus-active",representationFocusActive(state));
    document.body.classList.toggle("route-completing",state.route==="completing");
    main.dataset.assessmentFramework=assessmentFramework(state);
    main.innerHTML=previewBanner()+assessmentBanner(state,e)+stuckViews.returnBanner()+map[state.route]();
    refreshMathPreviews(main);
    refreshDiagramValuePreviews(main);
    detachIdeaMapGraph=attachIdeaMapGraph(main);
    if(preview.active)setSaveStatus("Sample preview only");
    filterMathOptions();
    document.querySelectorAll("[data-nav]").forEach(b=>b.classList.toggle("active",b.dataset.nav===state.route));
    refreshPathCount();
    if(state.geometryStudio?.zoomed){
      const zoomPreview=main.querySelector("[data-geometry-preview]");
      if(zoomPreview)zoomPreview.scrollLeft=(zoomPreview.scrollWidth-zoomPreview.clientWidth)/2;
    }
    if(state.probabilityStudio?.zoomed){
      const zoomPreview=main.querySelector("[data-prob-preview]");
      if(zoomPreview)zoomPreview.scrollLeft=(zoomPreview.scrollWidth-zoomPreview.clientWidth)/2;
    }
    if(opts.top){window.scrollTo({top:0,behavior:"auto"});main.focus({preventScroll:true})}
    // Show only at the first entry to C00; never for example previews or other stages.
    if(state.ui.writingIntroSeen===true&&!state.ui.writingIntroOpen&&shouldShowWriterGuideWelcome(state,preview.active)&&layer.hidden&&!document.querySelector("dialog[open]"))
      openDrawer("writer-guide-intro");
  }
  function nav(route,opts={}) {
    state.route=route;
    if(["planning","completing","checking"].includes(route))state.ui.lastWorkRoute=route;
    if(route==="completing"&&completionStage(state.completion.current,state))state.ui.lastStudioNode=state.completion.current;
    drawerReturn=null;
    if(route==="completing"&&opts.section) {
      const target=targetForSection(opts.section);
      if(target==="C60"&&state.completion.current!=="C60"){
        requestConclusionReview();return;
      }
      setCompletionNode(state,target,{reason:"stage-navigation"});
    }
    if(state.ui.resourceCreatorReturnRoute&&(route!=="completing"||state.completion.current!=="C31"))
      clearResourceCreatorReturn();
    state.ui.helpKey="";state.ui.openCue="";
    save();render({top:true});
  }
  function addMath(nextTitle="") {
    state.entries.push({...mathDefault(),title:nextTitle});
    state.ui.mathIndex=state.entries.length-1;
    state.ui.mathPhase="work";
    nav("completing",{section:"math"});
  }
  function editMath(index) {
    if(!state.entries[index])return;
    state.ui.mathIndex=index;state.completion.activeEntryIndex=index;state.ui.mathPhase="work";
    const entry=state.entries[index];
    const mathStages=state.entries.slice(0,index+1).filter(x=>x.phase==="substantial").length;
    setCompletionNode(state,entry.phase==="first"?"C30":mathStages>1?"C50":"C40");
    nav("completing");
  }
  function demo(kind) {
    // A labelled, isolated and fully populated fictional investigation.
    // Loading/switching previews NEVER replaces the personal browser project.
    const next=createIllustrativeSample(kind);
    next.ui.adviceMode=state.ui.adviceMode; // Keep each student’s help preference when trying a safe sample.
    const origin=drawerReturn||captureReturn();
    state=preview.begin(state,next,{scroll:origin.scroll,attributes:origin.attributes});
    save();closeDrawer(false);render({top:true});
    toast("Illustrative investigation opened. Your own project is safe.");
  }
  function openDrawer(panel,guide=null) {
    closeGuidePopin(false);
    if(layer.hidden){
      const active=document.activeElement;
      if(active?.matches?.('button,input,textarea,select,summary,a'))drawerReturn=captureReturn(active);
      else if(!drawerReturn)drawerReturn=captureReturn(lastFocus||active);
    }
    closeDrawer(false);
    lastDrawer=panel;
    const p=state.project;
    let body="";
    if(panel==="project"){
      body='<section><p class="text-muted">Your details stay in this browser unless you deliberately export them.</p>'+
        (state.demo?note("You are editing an illustrative sample project.",true):"")+
        field("project.aim","Current aim","What do you want to find out?",{type:"textarea",rows:3,drawer:true})+
        field("project.course","IB Mathematics course","Select your course",{type:"select",drawer:true,options:[["","Select a course"],["AA SL","Mathematics AA SL"],["AI SL","Mathematics AI SL"],["AA HL","Mathematics AA HL"],["AI HL","Mathematics AI HL"] ]})+
        field("project.beneficiary","Meaning or intended benefit","Who might use this, or why does it interest you?",{type:"textarea",rows:2,drawer:true})+
        field("project.precision","Measurement accuracy to remember","Units, precision or rounding", {type:"textarea",rows:2,drawer:true})+
        field("project.documentUrl","Link to my real IA document (optional)","https://docs.google.com/…", {type:"url",drawer:true,hint:"Keep the finished IA in Word or Google Docs. Pathfinder never edits your document."})+
        (cleanUrl(p.documentUrl)?'<a class="btn btn-secondary" href="'+e(cleanUrl(p.documentUrl))+'" target="_blank" rel="noopener noreferrer">Open my IA document '+icon("arrow-up-right")+'</a>':"")+
        '</section><div class="panel-list">'+button("Review my plan","go-planning","btn-secondary")+button("See my journey","go-path","btn-light")+'</div>';
    }else if(panel==="files"){
      body='<section><h3>Whole project · Planning and IA Studio</h3>'+
        '<p>Download a readable record of your Planning, mathematical steps, results, interpretations, sources, accuracy decisions, limitations, reflections and review notes. These are working records, not your finished IA.</p>'+
        '<div class="panel-list">'+button("Download full project PDF","export-full-pdf","btn-primary","", "download")+
        button("Download editable full project Word","export-full-docx","btn-secondary","", "download")+
        button("Download complete project bundle (.zip)","export-full-zip","btn-secondary","", "download")+'</div>'+
        '<p class="field-hint">The ZIP includes both readable reports plus the full restorable JSON backup. PDF/Word can only reimport Planning fields. Edits to downloaded documents never update Pathfinder. Keep your project files private.</p></section>'+
      '<section><h3>Planning document · take it with you</h3>'+
        '<p>Create a personalised PDF or editable Word plan. Each Pathfinder export includes an importable snapshot of the answers that existed at the time of export.</p>'+
        '<div class="panel-list">'+button("Download planning PDF","export-plan-pdf","btn-primary","", "download")+
        button("Download editable Word plan","export-plan-docx","btn-secondary","", "download")+
        button("Import planning PDF or Word","import-report","btn-secondary","", "upload")+
        button("View readable working record","go-report","btn-light","", "file")+'</div>'+
        '<p class="field-hint">Edits made later to the visible PDF/Word text do not automatically update the embedded snapshot. Import and review, or update Pathfinder directly.</p></section>'+
      '<section><h3>Full project backup</h3><p>For reliable restoration of your actual mathematics, writing notes and Planning across devices, use the JSON project backup. Browser saving stays local; no cloud sync.</p>'+
        button("Download entire project (.json)","export-json","btn-secondary","", "download")+
        button("Restore entire project backup","import-json","btn-secondary","", "upload")+'</section>'+
      '<section><h3>Start fresh</h3><p>Starting a new project replaces the local workspace. Export a full backup first if needed.</p>'+
        button("Start a new project","new-project","btn-danger","", "refresh")+'</section>';
    }else if(panel==="resources"){
      body=resourceDrawer(state,resourceSession);
    }else if(panel==="writer-guide"){
      body=renderWriterFieldGuide(icon,e,guide,state);
    }else if(panel==="writer-guide-intro"){
      body=renderWriterGuideWelcome(icon,e);
    }else if(panel==="help"){
      body='<section><p>Pathfinder is a thinking and writing companion. You remain the author of your mathematics and explanations.</p><div class="panel-list">'+
        '<button class="panel-link" data-action="open-stuck">I am stuck '+icon("arrow-right")+'</button>'+
        '<button class="panel-link" data-action="resource-browse">Tools &amp; tutorials '+icon("arrow-right")+'</button>'+
        '<button class="panel-link" data-action="writer-guide-open">Writer\'s Field Guide '+icon("arrow-right")+'</button>'+
        '<button class="panel-link" data-action="go-path">How do I see my journey? '+icon("arrow-right")+'</button>'+
        '<button class="panel-link" data-action="open-files">How do I keep my work safe? '+icon("arrow-right")+'</button>'+
        '<button class="panel-link" data-action="open-demos">Try an illustrative sample '+icon("arrow-right")+'</button></div></section>'+
        '<section><h3>A useful rhythm</h3><p>Ask a mathematical question → do real mathematics → interpret the result in context → choose what genuinely follows. Repeat only when there is a reason.</p></section>'+
        '<p class="drawer-footer">Planning and document handover are available. Use I am stuck for a specific obstacle, or the writing helper for where an explanation belongs. Pathfinder does not calculate marks, validate sources, or approve permissions.</p>';
    }else if(panel==="import-preview"){
      body=pendingImport?handoverViews.preview(pendingImport,importSelected):
        handoverViews.manual("No planning document has been selected.");
    }else if(panel==="import-manual"){
      body=handoverViews.manual(pendingImport?.reason);
    }else if(panel==="handover"){
      body=handoverViews.confirmation();
    }else if(panel==="demos"){
      const choices=SAMPLE_CHOICES;
      body='<section><p>Browse five substantial fictional investigations with a current Planning route, three connected mathematical stages, actual editable graph/table-generator figures, worked calculations, interpretation, a concise conclusion and A–E checking prompts. <strong>These are invented teaching examples, not real IA submissions or evidence of a real dataset.</strong></p>'+
        '<div class="panel-list">'+choices.map(({id:key,title:label,description:desc})=>
        '<button type="button" class="panel-link" data-action="load-demo" data-demo="'+key+'"><span><strong>'+e(label)+'</strong><br><span class="text-muted" style="font-weight:400">'+e(desc)+'</span></span>'+icon("arrow-right")+'</button>').join("")+'</div></section>'+
        note("Each sample stays in a separate preview. Its length and mathematical figures illustrate an IA-scale journey; it is not a real student IA, contains no genuine empirical measurements, teacher approval or IB mark. Return to your own investigation unchanged, or choose another scenario.");
    }else if(panel==="stuck"){
      body=stuckViews.render();
    }
    const titles={resources:"Tools & tutorials",project:"My project",files:"Save & export",help:"Here to help","writer-guide":"The IA Writer's Field Guide","writer-guide-intro":"Your Writer's Field Guide",demos:"Choose a sample",stuck:"Find a way forward", "import-preview":"Review planning import","import-manual":"Recover a plan",handover:"Confirm your starting plan"};
    layer.hidden=false;document.body.classList.add("dialog-open");
    document.querySelectorAll(".topbar,.app-grid,.mobile-nav").forEach(el=>el.inert=true);
    layer.innerHTML='<aside class="drawer'+(panel==="resources"?" resource-drawer":"")+(panel==="writer-guide"?" writer-guide-drawer":panel==="writer-guide-intro"?" writer-guide-drawer writer-guide-welcome-drawer":"")+'" role="dialog" aria-modal="true" aria-labelledby="drawerTitle" tabindex="-1"><div class="drawer-header"><h2 id="drawerTitle">'+titles[panel]+'</h2>'+
      '<button class="btn btn-secondary btn-sm" type="button" data-action="close-drawer">'+(panel==="resources"&&resourceSession.parent==="stuck"?"Back to I am stuck":"Return to my work")+' '+icon("x")+'</button></div>'+body+'</aside>';
    refreshMathPreviews(layer);
    $(".drawer",layer).focus();
  }
  function closeDrawer(restore=true) {
    layer.hidden=true;layer.innerHTML="";document.body.classList.remove("dialog-open");
    document.querySelectorAll(".topbar,.app-grid,.mobile-nav").forEach(el=>el.inert=false);
    if(restore){restoreReturn(drawerReturn||captureReturn(lastFocus));drawerReturn=null;}
  }
  function dismissDrawer(){
    if(lastDrawer==="writer-guide-intro"){
      state.ui.writerGuideIntroSeen=true;
      save();
      closeDrawer();
    }else if(lastDrawer==="resources"&&resourceSession.parent==="stuck")openDrawer("stuck");
    else closeDrawer();
  }
  function exportJson() {
    try {
      const payload=JSON.stringify({...state,route:"home"},null,2);
      const blob=new Blob([payload],{type:"application/json"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=url;a.download=preview.active?"ia-pathfinder-sample.json":"ia-pathfinder-project.json";document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),3000);toast(preview.active?"Fictional sample downloaded. Your own project is unchanged.":"Your whole investigation is backed up.");
    } catch(err) {toast("Backup could not be created. Please try again.");console.error(err);}
  }

  async function exportFullProjectDocument(format){
    if(exportBusy){toast("An export is already being prepared.");return;}
    exportBusy=true;
    setSaveStatus("Creating full project export…");
    try{
      const mod=await import("./src/handover/full-export.js");
      const result=await mod.createFullProjectExport(state,format);
      downloadFile(result.bytes,(preview.active?"sample-":"")+result.name,result.mime);
      setSaveStatus("Saved on this device");
      toast(format==="zip"?"Complete project bundle downloaded, including the restorable backup.":format==="pdf"?"Full working record PDF downloaded.":"Editable full working record downloaded.");
    }catch(error){
      console.error("Full project export failed",error);
      setSaveStatus("Export failed — your existing work is unchanged",true);
      toast("Could not create that full project export. Your work is unchanged; you can still download JSON.");
    }finally{exportBusy=false;}
  }

  async function exportIllustrativeIAPdf(){
    if(!preview.active||!state.demo){toast("Open a fictional illustrative sample first.");return;}
    if(exportBusy){toast("Please wait for the current export.");return;}
    exportBusy=true;setSaveStatus("Preparing illustrated IA-style example…");
    try{
      const {createIllustrativeIAExport}=await import("./src/core/sample-ia-document.js");
      const result=await createIllustrativeIAExport(state);
      downloadFile(result.bytes,result.name,result.mime);
      setSaveStatus("Saved on this device");
      toast("Fictional IA-style writing example downloaded with its mathematical figures.");
    }catch(error){
      console.error("Illustrative IA PDF export failed",error);
      setSaveStatus("Illustrative PDF could not be created",true);
      toast("That example PDF could not be generated; your original project is safe.");
    }finally{exportBusy=false;}
  }

  function downloadFile(bytes,name,mime){
    const blob=new Blob([bytes],{type:mime});
    const url=URL.createObjectURL(blob),a=document.createElement("a");
    try{
      a.href=url;a.download=name;document.body.appendChild(a);a.click();
    }finally{
      a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
    }
  }
  async function exportPlanningDocument(format){
    if(exportBusy){toast("A planning report is already being prepared.");return;}
    exportBusy=true;
    setSaveStatus("Creating planning document…");
    const exportState=state,sampleExport=preview.active;
    try{
      const snapshot=createPlanningEnvelope(state),model=modelFromEnvelope(snapshot);
      let bytes,mime;
      if(format==="pdf"){
        const mod=await import("./src/handover/formats/pdf.js");
        bytes=await mod.createPdfPlanningReport(snapshot);
        mime="application/pdf";
      }else{
        const mod=await import("./src/handover/formats/docx.js");
        bytes=await mod.createDocxPlanningReport(snapshot);
        mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      }
      downloadFile(bytes,(sampleExport?"sample-":"")+suggestedFilename(model,format),mime);
      if(state===exportState){state.handover.lastExportAt=snapshot.exportedAt;save();}
      toast(format==="pdf"?"Planning PDF downloaded.":"Editable planning Word document downloaded.");
    }catch(error){
      console.error("Planning report export failed",error);
      setSaveStatus("Export failed — your browser work remains saved",true);
      toast("Could not create that report. Try the other format or export JSON.");
    }finally{exportBusy=false;}
  }
  async function readPlanningDocument(file){
    try{
      setSaveStatus("Reading document on this device…");
      const {readHandoverDocument}=await import("./src/handover/read-document.js");
      const result=await readHandoverDocument(file);
      if(result.kind==="manual"){
        pendingImport={reason:result.reason};importSelected=new Set();
        openDrawer("import-manual");return;
      }
      const differences=getFieldDiff(state,result.envelope);
      pendingImport={
        envelope:result.envelope,fileName:result.name,kind:result.kind,
        changes:differences,warning:result.warning
      };
      importSelected=new Set(differences.filter(x=>x.recommended).map(x=>x.key));
      openDrawer("import-preview");
    }catch(error){
      console.warn("Could not import planning document",error);
      pendingImport={reason:"The document could not be safely read: "+error.message+
        " Your existing work has not been changed."};
      importSelected=new Set();
      openDrawer("import-manual");
    }finally{
      setSaveStatus("Saved on this device");
    }
  }
  function updateImportSelections(mode){
    if(!pendingImport?.changes)return;
    importSelected=new Set(pendingImport.changes.filter(d=>
      mode==="all"||(mode==="missing"&&d.recommended)
    ).map(d=>d.key));
    openDrawer("import-preview");
  }
  function applySelectedImport(){
    if(!pendingImport?.envelope){toast("Choose a planning document first.");return;}
    const keys=[...importSelected];
    if(!keys.length){toast("Select at least one planning answer to import.");return;}
    try{
      const merge=mergePlanningEnvelope(state,pendingImport.envelope,keys,{
        origin:pendingImport.fileName||"report"
      });
      if(merge.unchanged){toast("No changes selected.");return;}
      state=merge.state;
      if(["C00","C01"].includes(state.completion.current)){
        const routeLabel=pendingImport.kind==="partial"?"Only some fields recognized":"Recognized document / fields extracted";
        if(state.completion.current==="C01")moveCompletionRoute(state,routeLabel);
        else setCompletionNode(state,"C02",{reason:"review-imported-answers"});
        state.route="completing";
      }
      state.handover.confirmedAt="";
      state.handover.needsReview=true;
      state.handover.lastImportAt=new Date().toISOString();
      state.handover.lastImportSource=pendingImport.fileName||"planning document";
      pendingImport=null;importSelected.clear();
      save();render();
      openDrawer("handover");
      toast(merge.applied.length+" planning answers imported; review current details.");
    }catch(error){
      console.error("Planning merge failed",error);
      toast("These answers could not be merged. Your existing project is unchanged.");
    }
  }

  function positionGuidePopin(){
    const popin=guidePopinHost.querySelector(".writer-guide-popin");
    if(!popin||guidePopinHost.hidden||!guidePopinOrigin?.getBoundingClientRect)return;
    if(window.matchMedia("(max-width: 700px)").matches){popin.style.removeProperty("top");popin.style.removeProperty("left");return;}
    const rect=guidePopinOrigin.getBoundingClientRect();
    const width=popin.offsetWidth||420,edge=12;
    const x=rect.right+width+edge<=innerWidth?rect.right+10:rect.left-width-10>=edge?rect.left-width-10:Math.min(innerWidth-width-edge,Math.max(edge,rect.left));
    const y=Math.max(edge,Math.min(rect.top-18,innerHeight-Math.min(popin.offsetHeight,innerHeight-24)-edge));
    popin.style.left=x+"px";popin.style.top=y+"px";
  }
  function closeGuidePopin(restore=true){
    if(guidePopinHost.hidden)return;
    const origin=guidePopinOrigin;
    guidePopinHost.hidden=true;guidePopinHost.innerHTML="";
    guidePopinOrigin=null;guidePopinRecommendation=null;
    if(origin?.isConnected)origin.setAttribute?.("aria-expanded","false");
    if(restore&&origin?.isConnected)origin.focus({preventScroll:true});
  }
  function openGuidePopin(origin,guide){
    if(!guide?.tip)return;
    if(!guidePopinHost.hidden&&guidePopinOrigin===origin){closeGuidePopin();return;}
    closeGuidePopin(false);
    guidePopinOrigin=origin;guidePopinRecommendation=guide;
    origin.setAttribute?.("aria-expanded","true");
    guidePopinHost.innerHTML=renderWriterGuidePopin(icon,e,guide);
    guidePopinHost.hidden=false;
    positionGuidePopin();
    guidePopinHost.querySelector(".writer-guide-popin-close")?.focus({preventScroll:true});
  }
  function openFullWriterGuide(guide){
    closeGuidePopin(false);
    openDrawer("writer-guide",guide);
    if(guide){
      const card=layer.querySelector('[data-guide-card="'+guide.tip.id+'"]');
      if(card){card.open=true;card.scrollIntoView?.({block:"start",behavior:"auto"});card.querySelector("summary")?.focus({preventScroll:true});}
    }
  }

  function changeNavAction(action,el) {
    if(action==="resume-work")return nav(resumeRoute(state));
    if(action==="go-home")return nav("home");
    if(action==="go-planning")return nav("planning");
    if(action==="go-checking")return nav("checking");
    if(action==="go-studio")return nav("completing"); // Resume the saved C-stage; "Studio overview" remains a separate action.
    if(action==="writer-guide-popin-close"){closeGuidePopin();return;}
    if(action==="writer-guide-popin-full"){
      const guide=guidePopinRecommendation;
      const origin=guidePopinOrigin;
      if(origin?.isConnected){lastFocus=origin;drawerReturn=captureReturn(origin);}
      openFullWriterGuide(guide);return;
    }
    if(action==="writer-guide-open"){
      const tip=String(el.dataset.guideTip||"").replace(/[^a-z0-9-]/g,"");
      const spot=String(el.dataset.guideSpot||"").replace(/[^A-Za-z0-9:-]/g,"");
      const node=state.route==="completing"?state.completion.current:"";
      const guide=writingGuideRecommendation(state,node,tip,spot);
      if(guide&&(spot||el.dataset.guideScope==="stage"||el.classList.contains("writer-guide-context-badge")||el.closest(".writer-guide-return"))){
        openGuidePopin(el,guide);
      }else{
        if(layer.hidden)lastFocus=el;
        openFullWriterGuide(guide);
      }
      return;
    }
    if(action==="writing-intro-continue"){
      state.ui.writingIntroSeen=true;state.ui.writingIntroOpen=false;
      save();render({top:true});return;
    }
    if(action==="writing-intro-open"){
      state.ui.writingIntroOpen=true;
      // Reopening a feature tour should never erase the student's current stage.
      save();render({top:true});return;
    }
    if(action==="setup-start-writing"){
      const result=setCompletionNode(state,"C10",{reason:"setup-to-introduction"});
      if(result.ok)nav("completing");
      else toast(result.error||"Unable to begin the introduction.");
      return;
    }
    if(action==="go-path")return nav("path");
    if(action==="go-report")return nav("report");
    if(action==="open-files")return openDrawer("files");
    if(action==="open-demos")return openDrawer("demos");
    if(action==="open-stuck"){captureStuckOrigin(state,{scrollY:window.scrollY||0,focusId:document.activeElement?.id||""});if(!el.closest(".drawer"))lastFocus=el;save();return openDrawer("stuck");}
    if(["studio-overview","studio-intro","studio-data","studio-math","studio-conclusion","studio-review"].includes(action))return nav("completing",{section:action.slice(7)});
    return false;
  }
  function clickAction(el) {
    const action=el.dataset.action||"";
    if(["table-symbol","diagram-notation-token","diagram-notation-insert","diagram-notation-toggle","diagram-notation-close"].includes(action)){void handleDiagramNotation(el).catch(err=>toast("Notation error",err.message));return;}
     if(["math-open","math-edit-existing","math-close","math-template","math-insert"].includes(action)){void mathAction(el).catch(err=>toast("Maths editor error: "+err.message));return;}
    if(handleNativeDataAction(state,action,el,{save,render,toast,
      confirm:message=>window.confirm(message),openTool:openNativeTool}))return;
    if(action==="presentation-copy-caption"){
      const type=el.dataset.presentationType,
        tool=representationTool(type),
        studio=tool?state[tool.studio]:null;
      if(!studio){toast("Unknown figure type");return;}
      const id=el.dataset.presentationId||"";
      const draft=id?studio.figures.find(f=>f.id===id)?.draft:
        studio.open?studio.draft:null;
      if(!draft){toast("Figure unavailable","Open or restore the saved version before copying its label.");return;}
      const caption=figureCaption(state,type,draft);
      if(typeof navigator!=="undefined"&&navigator.clipboard?.writeText){
        navigator.clipboard.writeText(caption)
          .then(()=>toast("Label and source copied","Check the citation and numbering before pasting. Write your own mathematical interpretation."))
          .catch(()=>toast("Could not copy automatically","Select and copy the visible caption manually."));
      }else toast("Clipboard unavailable","Select and copy the label shown in your IA handover.");
      return;
    }
    if(preview.active&&["import-json","import-report","new-project","merge-apply"].includes(action)){
      toast("Return to your investigation before importing or starting a project.");return;
    }
    const idea=ideaAction(state,action,el.dataset);
    if(idea){
      if(!idea.ok){toast(idea.error);return;}
      save();
      if(idea.navigate){nav("planning");return;}
      if(idea.render)render();
      if(idea.message){toast(idea.message);const status=$("#idea-save-status");if(status)status.textContent=idea.message;}
      if(idea.focus){const target=$("#"+idea.focus);if(target)target.focus();}
      return;
    }
    const resources=resourceAction(state,resourceSession,action,el.dataset,layer.hidden?"":lastDrawer);
    if(resources){
      if(!resources.ok){toast(resources.error);return;}
      if(resources.creator){launchResourceCreator(resources.creator);return;}
      if(resources.creatorReturn){returnFromResourceCreator();return;}
      if(resources.save)save();
      if(resources.render){render();if(!layer.hidden&&lastDrawer==="stuck")openDrawer("stuck");return;}
      if(resources.open){if(layer.hidden)lastFocus=el;openDrawer("resources");return;}
      if(resources.list){const target=$("#resource-results",layer);if(target)target.innerHTML=resourceList(resourceSession);return;}
      if(resources.close){
        if(resourceSession.parent==="stuck")openDrawer("stuck");
        else {closeDrawer();if(!lastFocus||!document.contains(lastFocus))main.focus({preventScroll:true});}
        return;
      }
      if(resources.copy){
        const status=$("#resource-copy-status",layer),input=$("#resource-practice-data",layer);
        const fallback=()=>{if(input){input.focus();input.select();}if(status)status.textContent="Select and copy the practice table above. It has not been added to your project.";};
        if(typeof navigator!=="undefined"&&navigator.clipboard?.writeText){
          navigator.clipboard.writeText(PRACTICE_PAIRS).then(()=>{if(status)status.textContent="Practice table copied. Your own data and results are unchanged.";}).catch(fallback);
        }else fallback();
        return;
      }
      return;
    }
    if(changeNavAction(action,el)!==false)return;
    if(action==="intro-prediction-open"){
      const panel=$("#intro-prediction-spark",main);
      if(panel){
        panel.open=true;
        panel.scrollIntoView?.({behavior:"auto",block:"start"});
        const field=panel.querySelector('[data-bind="planning.fields.prediction"]');
        field?.focus({preventScroll:true});
      }
      return;
    }
    const support=stuckAction(state,action,el.dataset);
    if(support){
      if(!support.ok){toast(support.error);return;}
      if(support.backup){exportJson();return;}
      if(support.return){
        if(!layer.hidden&&!state.completion.support.returnPending){closeDrawer();save();return;}
        const o=state.completion.support.origin;state.completion.support.returnPending=false;
        closeDrawer(false);
        if(o){
          if(o.route==="planning")setPlanCurrent(state,o.planNode,{history:false});
          else if(o.route==="completing")setCompletionNode(state,o.node,{history:false});
          state.completion.activeEntryIndex=state.entries.findIndex(e=>e.id===o.entryId);
          if(state.completion.activeEntryIndex>=0)state.ui.mathIndex=state.completion.activeEntryIndex;
          state.completion.nextFromEntryId=o.nextFromEntryId;state.route=o.route;
        }else if(isStuckNode(state.completion.current)){setCompletionNode(state,"C04");}
        save();render();window.scrollTo({top:o?.scrollY||0,behavior:"auto"});
        const focus=o?.focusId?document.querySelector('[id="'+o.focusId.replace(/[^a-z0-9_-]/gi,"")+'"]'):null;
        if(focus)focus.focus({preventScroll:true});else main.focus({preventScroll:true});return;
      }
      if(support.target){
        const x=stuckContext(state),t=support.target;state.completion.support.returnPending=true;
        closeDrawer(false);
        if(t.panel){save();render();openDrawer(t.panel);return;}
        if(t.route==="planning")setPlanCurrent(state,t.node);
        else if(t.route==="completing"){
          // A C35/C96 destination must refer to the result the student asked about.
          state.completion.activeEntryIndex=x.index;if(x.index>=0)state.ui.mathIndex=x.index;
          if(t.node==="C96")setCompletionNode(state,x.node,{history:false});
          setCompletionNode(state,t.node);
          if(x.entry)state.completion.nextFromEntryId=x.entry.id;
        }
        nav(t.route);return;
      }
      save();
      if(support.stay)render();
      else if(!layer.hidden){openDrawer("stuck");
        if(support.saved){const details=layer.querySelector('.stuck-save');if(details)details.open=true;}
        const heading=layer.querySelector('.stuck-heading');if(heading)heading.focus({preventScroll:true});
      }else render();
      if(support.message)toast(support.message);return;
    }
    // A status is a record of a real document check, not a one-click claim.
    // Reveal the existing evidence fields before asking the student to retry.
    if(action==="conformance-review-status"&&el.closest?.(".checking-page")){
      const {mode,id,status}=el.dataset;
      const rec=state.completion?.review?.records?.[mode+"-"+id]||{};
      const missing=status==="checked"&&!String(rec.location||rec.note||"").trim()||
       status==="not-applicable"&&!String(rec.note||"").trim();
      if(missing){
       const details=el.closest(".checking-item")?.querySelector(".checking-item-details");
       if(details){
        details.open=true;
        const path="completion.review.records."+mode+"-"+id+"."+
         (status==="not-applicable"?"note":"location");
        details.querySelector('[data-bind="'+path+'"]')?.focus({preventScroll:false});
       }
       toast(status==="not-applicable"?"Explain why this check does not apply.":
         "First note the page, figure, equation or evidence you actually checked.");
       return;
      }
    }
    const conformance=conformanceAction(state,action,el.dataset);
    if(conformance){
      if(!conformance.ok){toast(conformance.error);return;}
      const open=[...document.querySelectorAll("details[open]")].map(x=>x.id).filter(Boolean);
      save();render();
      if(conformance.message&&/source|method|accuracy/i.test(conformance.message))toast("A useful decision saved",conformance.message);
      for(const id of open){const detail=document.querySelector("#"+id);if(detail)detail.open=true;}
      const focus=[...document.querySelectorAll("[data-action]")].find(x=>Object.entries(el.dataset).every(([k,v])=>x.dataset[k]===v));
      if(focus)focus.focus({preventScroll:true});
      if(conformance.message)toast(conformance.message);
      return;
    }
    switch(action){
      case "checking-mode":{
        const mode=el.dataset.checkingMode;
        if(!["draft","feedback","final"].includes(mode))break;
        state.ui.checkingMode=mode;save();render();
        document.querySelector('[data-action="checking-mode"][data-checking-mode="'+mode+'"]')?.focus({preventScroll:true});
        break;
      }
      case "checking-rubric":{
        const id=el.dataset.criterion;
        if(!["A","B","C","D","E"].includes(id))break;
        essentialsController.open({tab:"rubric",criterion:id},el);
        break;
      }
      case "checking-conclusion":{
        if(state.completion.current!=="C60"){state.route="completing";requestConclusionReview();}
        else nav("completing");
        break;
      }
      case "checking-studio":{
        setCompletionNode(state,"C04",{reason:"checking-return-to-studio"});
        nav("completing");break;
      }
      case "leave-preview":leavePreview();break;
      case "sample-journey":nav("path");break;
      case "insight-focus":{
        const trail=el.closest(".living-trail"),id=el.dataset.threadId;
        if(!trail)break;
        const buttons=[...trail.querySelectorAll('[data-action="insight-focus"]')];
        const was=el.getAttribute("aria-pressed")==="true";
        buttons.forEach(b=>b.setAttribute("aria-pressed",String(!was&&b===el)));
        trail.querySelectorAll("[data-thread-id].living-thread-line").forEach(line=>line.classList.toggle("is-active",!was&&line.dataset.threadId===id));
        trail.querySelectorAll("[data-thread-detail]").forEach(d=>d.hidden=was||d.dataset.threadDetail!==id);
        const note=trail.querySelector("[data-thread-instruction]");if(note)note.hidden=!was;
        break;
      }
      case "spark-edit-accuracy":{
        const record=state.planning?.accuracyPlans?.find(x=>x.id===el.dataset.accuracyId);
        if(!record){toast("This accuracy spark is no longer saved.");break;}
        const target=record.source==="secondary"?"N03S":"N03P";
        const move=planningEdit(state,target);
        if(!move.ok){toast(move.error||"That Planning section is not available.");break;}
        const source=editPlannedAccuracy(state,record.id);
        if(!source){toast("That quantity could not be loaded for editing.");break;}
        handlePlanningResult(move);
        const input=document.querySelector('[data-bind="planning.fields.'+source+'AccuracyQuantity"]');
        if(input){input.scrollIntoView({block:"center",behavior:"auto"});input.focus({preventScroll:true});}
        toast("Edit your original accuracy spark","Save the edited rule to update it everywhere.");
        break;
      }
      case "insight-jump":{
        // Sparks link back to the original student-owned record without changing it.
        const type=el.dataset.insightType;
        if(type==="entry"){
          const i=Number(el.dataset.index);
          if(!Number.isInteger(i)||i<0||i>=state.entries.length){toast("That mathematical record is no longer available.");break;}
          editMath(i);break;
        }
        if(type==="planning"){
          handlePlanningResult(planningEdit(state,el.dataset.node));break;
        }
        if(type==="completion"){
          handleCompletionResult(setCompletionNode(state,el.dataset.node,{reason:"insight-original"}));break;
        }
        break;
      }
      case "journey-open":{
        const target=el.dataset.target;
        if(target==="plan"){
          state.completion.conclusionWarningOpen=false;nav("planning");
        }else if(target==="checking"){
          state.completion.conclusionWarningOpen=false;nav("checking");
        }else if(target==="C60"&&state.completion.current!=="C60"){
          // The Discovery Trail is also a direct path to the conclusion,
          // so it must honour the same readiness check as the end-page CTA.
          state.route="completing";state.ui.lastWorkRoute="completing";
          requestConclusionReview();
        }else{
          state.completion.conclusionWarningOpen=false;
          handleCompletionResult(setCompletionNode(state,target,{reason:"journey-navigation"}));
        }
        break;
      }
      case "journey-toggle-all":{
        const nodes=[...main.querySelectorAll(".journey-chapter")],open=!nodes.every(x=>x.open);
        nodes.forEach(x=>x.open=open);el.setAttribute("aria-expanded",String(open));el.textContent=open?"Collapse full path":"Show full path";break;
      }
      case "start-planning": setPlanCurrent(state,state.planning.current||"N00");nav("planning");break;
      case "timeline-generate":
      case "timeline-reset":{
        const force=action==="timeline-reset";
        if(force&&!window.confirm("Replace your edited milestone dates with fresh suggestions? School deadlines will not change."))break;
        const result=applySuggestedTimeline(state,applyPlanningField,{today:localToday(),force});
        if(!result.ok){toast(result.error);break;}
        save();render();
        const target=$("#timeline-suggestion");
        if(target)target.scrollIntoView({block:"nearest",behavior:"auto"});
        toast(result.preserved.length&&!force?"Timeline updated; "+result.preserved.length+" manually edited date(s) were kept.":"Your suggested milestones are ready. Dates can be changed in the optional detailed planner.");
        break;
      }
      case "planning-help-toggle":{
        const panel=el.closest(".planning-trail-support");
        if(panel){
          const open=panel.classList.toggle("is-open");
          el.setAttribute("aria-expanded",String(open));
        }
        break;
      }
      case "planning-intro-continue":
        state.ui.planningIntroSeen=true;state.ui.planningIntroOpen=false;
        save();render({top:true});break;
      case "planning-intro-open":
        state.ui.planningIntroOpen=true;
        save();render({top:true});break;
      case "plan-next":
      case "plan-advance":handlePlanningResult(planAutoAdvance(state));break;
      case "plan-route":handlePlanningResult(planningMove(state,el.dataset.condition));break;
      case "plan-finish-writing":{
        if(state.route!=="planning"||state.planning.current!=="N07"){
          toast("Finish reviewing your provisional plan before entering IA Studio.");break;
        }
        // Keep the original Planning-to-Completing provenance edge.
        const result=planningMove(state,"Continue into Completing in this session");
        if(!result.ok){toast(result.error||"Unable to open IA Studio.");break;}
        syncPlanningToProject(state);
        const hasStudioWork=state.completion.visited.some(id=>!["C00","C01"].includes(id))||
          state.entries.length>0||Object.values(state.scratch||{}).some(filled);
        // First arrival opens a real introductory writing box instead of
        // making students choose "Continue my plan" on another start screen.
        // Revisiting Planning never resets work already underway in IA Studio.
        if(!hasStudioWork&&["C00","C01"].includes(state.completion.current))
          setCompletionNode(state,"C00",{reason:"planning-to-writing-welcome"});
        nav("completing");
        break;
      }
      case "plan-back":handlePlanningResult(planningBack(state));break;
      case "plan-edit":handlePlanningResult(planningEdit(state,el.dataset.node));break;
      case "plan-refine-toggle":{
        if(state.planning.current!=="N01P")break;
        state.planning.refinePlanOpen=!state.planning.refinePlanOpen;
        save();render();
        const trigger=document.querySelector('[data-action="plan-refine-toggle"]');
        trigger?.focus({preventScroll:true});
        if(state.planning.refinePlanOpen)document.getElementById("planning-prediction-refine-panel")?.scrollIntoView({block:"nearest",behavior:"auto"});
        break;
      }
      case "path-plan":{
        const map={"0":"N00","1":"N01","5":"N03D"};
        handlePlanningResult(planningEdit(state,map[el.dataset.index]||"N00"));break;
      }
      case "math-mode":{
        if(!exploreMathRoute(state,{mode:el.dataset.mode})){toast("That way of exploring mathematics is unavailable.");break;}
        save();render();
        const tab=document.getElementById("journey-tab-"+el.dataset.mode);
        tab?.focus({preventScroll:true});
        break;
      }
      case "math-family":{
        if(!exploreMathRoute(state,{family:el.dataset.family})){toast("That route category is unavailable.");break;}
        save();render();
        const chosen=document.querySelector('[data-action="math-family"][data-family="'+el.dataset.family+'"]');
        chosen?.focus({preventScroll:true});
        break;
      }
      case "math-open-route":{
        const id=el.dataset.routeId;
        const revisit=el.dataset.revisit==="true";
        const currentlyOpen=!revisit&&state.planning.routeExplorer.openRoute===id;
        const mode=state.planning.routeExplorer.mode==="all"?"routes":state.planning.routeExplorer.mode;
        if(!exploreMathRoute(state,{mode,openRoute:currentlyOpen?'':id})){toast("That route is unavailable.");break;}
        save();render();
        if(!currentlyOpen){
          const heading=document.getElementById("journey-detail-title");
          heading?.focus({preventScroll:true});
          document.getElementById("journey-detail")?.scrollIntoView({block:"nearest",behavior:"auto"});
        }else{
          const trigger=document.querySelector('[data-action="math-open-route"][data-route-id="'+id+'"]');
          trigger?.focus({preventScroll:true});
        }
        break;
      }
      case "math-select-route":
      case "math-remove-route":{
        const removing=action==="math-remove-route";
        const id=removing?"":el.dataset.routeId;
        const earlierRoute=state.planning.routeExplorer.selectedRoute||"";
        if(!chooseMathRoute(state,id)){toast("That investigative route could not be saved.");break;}
        const flagged=flagJourneyRouteDependents(state,earlierRoute);
        save();render();
        if(flagged)toast("Mathematical connections to review",flagged+" later mathematical stage(s) may rely on advice from your earlier investigative journey. Existing work is preserved.");
        const detail=document.getElementById("journey-detail");
        if(detail)detail.scrollIntoView({block:"nearest",behavior:"auto"});
        toast(removing?"Your route spark was removed; selected mathematics is unchanged.":
          "Route spark saved. Branches remain optional until supported by your mathematics.");
        break;
      }
      case "plan-save-quantity":{
        const where=captureReturn(el);
        const result=updatePrimaryQuantity(state);
        if(!result.ok){toast(result.error);break;}
        save();render();restoreReturn(where);
        toast(result.updated?"Quantity updated":"Quantity added",
         "This quantity will be available when you plan its recording accuracy.");
        break;
      }
      case "plan-edit-quantity":{
        if(!editPrimaryQuantity(state,el.dataset.quantityId)){toast("Quantity not found.");break;}
        save();render();
        const name=document.querySelector('[data-bind="planning.fields.primaryQuantityName"]');
        name?.scrollIntoView({block:"center",behavior:"auto"});
        name?.focus({preventScroll:true});
        break;
      }
      case "plan-cancel-quantity":{
        state.planning.primaryQuantityEditId="";
        state.planning.fields.primaryQuantityName="";
        state.planning.fields.primaryQuantityUnit="";
        const where=captureReturn(el);
        save();render();restoreReturn(where);break;
      }
      case "plan-remove-quantity":{
        if(!window.confirm("Remove this provisional quantity from your collection list? Existing accuracy sparks and actual mathematical work will be preserved."))break;
        const where=captureReturn(el);
        if(!removePrimaryQuantity(state,el.dataset.quantityId)){toast("Quantity not found.");break;}
        save();render();restoreReturn(where);
        toast("Quantity removed","Separately saved recording-accuracy sparks were preserved.");
        break;
      }
      case "plan-use-quantity":{
        if(!reusePrimaryQuantity(state,el.dataset.quantityId)){toast("Quantity not found.");break;}
        save();render();
        const editor=document.querySelector("[data-primary-accuracy-editor]");
        if(editor)editor.open=true;
        const input=document.querySelector('[data-bind="planning.fields.primaryAccuracyBasis"]');
        input?.scrollIntoView({block:"center",behavior:"auto"});
        input?.focus({preventScroll:true});
        break;
      }
      case "plan-save-accuracy":{
        const prior=captureReturn(el);
        const result=savePlannedAccuracy(state,el.dataset.source);
        if(!result.ok){toast(result.error);break;}
        save();render();restoreReturn(prior);
        toast(result.updated?"Accuracy spark updated":"Accuracy spark saved",
         "This is a provisional recording rule; confirm its accuracy when you use actual data.");
        break;
      }
      case "plan-edit-accuracy":{
        const source=editPlannedAccuracy(state,el.dataset.accuracyId);
        if(!source){toast("That saved accuracy plan could not be found.");break;}
        save();render();
        const input=document.querySelector('[data-bind="planning.fields.'+source+'AccuracyQuantity"]');
        if(input){input.scrollIntoView({block:"center",behavior:"auto"});input.focus({preventScroll:true});}
        toast("Editing saved accuracy spark","Save again to update this quantity's rule.");
        break;
      }
      case "plan-remove-accuracy":{
        if(!window.confirm("Remove this provisional accuracy spark? No real calculations or evidence will be deleted."))break;
        const origin=captureReturn(el);
        if(!removePlannedAccuracy(state,el.dataset.accuracyId)){toast("That accuracy plan was not found.");break;}
        save();render();restoreReturn(origin);
        toast("Accuracy spark removed","Recorded mathematical results were not changed.");
        break;
      }
      case "plan-toggle-math":{
        const id=el.dataset.mathId;
        if(!toggleMath(state,id)){toast("Choose a technique from your selected course.");break;}
        const selected=state.planning.mathSelected.includes(id);
        // Preserve search, keyboard focus and scroll position while multiple options are chosen.
        document.querySelectorAll(".plan-math-option, .math-route-option, .journey-technique").forEach(node=>{
          if(node.dataset.mathId!==id)return;
          node.classList.toggle("selected",selected);
          node.setAttribute("aria-pressed",String(selected));
          const marker=node.querySelector("[data-math-route-status]");
          if(marker)marker.textContent=selected?(node.classList.contains("journey-technique")?"In my mathematics plan":"Added to my plan"):
            (node.classList.contains("journey-technique")?"Add this technique":"Add this possibility");
          const markIcon=node.querySelector(".math-route-select > .icon");
          if(markIcon)markIcon.outerHTML=icon(selected?"check-circle":"plus-circle");
        });
        const count=document.querySelector(".plan-math-count strong");
        if(count)count.textContent=state.planning.mathSelected.length;
        const local=selectedMaths(state).filter(item=>item.course===state.planning.fields.course).map(item=>item.label);
        document.querySelectorAll(".journey-maths-current > span:last-child").forEach(node=>{
          node.textContent=local.length+" technique"+(local.length===1?"":"s")+" chosen";
        });
        const selectedCount=document.querySelector("[data-math-selected-count]");
        if(selectedCount)selectedCount.textContent=local.length;
        const selectedSummary=document.querySelector("[data-math-selection-summary]");
        if(selectedSummary)selectedSummary.textContent=local.length?" · "+local.join(" · "):" · Nothing selected yet — that is okay";
        save();break;
      }
      case "studio-tab":nav("completing",{section:el.dataset.section});break;
      case "toggle-advice-mode":{
        const where=captureReturn(el);
        state.ui.adviceMode=state.ui.adviceMode==="reduced"?"guided":"reduced";
        save();render();restoreReturn(where);
        toast(state.ui.adviceMode==="reduced"?
         "Essential instructions only. All green and purple help bubbles remain available.":"Full contextual advice restored.");
        break;
      }
      case "route-coach-next":{
        const prior=state.completion.current==="C35"?sourceResultForNext(state):null;
        if(!prior||prior.id!==el.dataset.entryId){toast("Review the latest actual result before selecting a next question.");break;}
        const question=routeNextQuestions(state,prior)[Number(el.dataset.index)];
        if(!question){toast("That next-question suggestion is no longer applicable.");break;}
        const current=state.completion.fields.nextQuestion.trim();
        if(current&&current!==question&&!window.confirm("Replace your existing next mathematical question? Your previous result will not change."))break;
        setCompletionField(state,"nextQuestion",question);
        if(current!==question){
          setCompletionField(state,"nextMethod","");
          setCompletionField(state,"nextReason","");
        }
        save();render();
        const target=document.querySelector('[data-bind="completion.fields.nextQuestion"]');
        if(target)target.focus({preventScroll:true});
        toast("Question selected as a possibility. Write your own mathematical reason before starting.");
        break;
      }
      case "representation-filter":{
        const value=el.dataset.representationFilter;
        if(!["all","data","geometry","models","decisions"].includes(value))break;
        state.ui.representationFilter=value;
        save();render();break;
      }
      case "representation-jump":{
        const step=el.dataset.representationStep;
        if(!["create","refine","use"].includes(step))break;
        main.querySelector('[data-representation-step="'+step+'"]')?.scrollIntoView({block:"start",behavior:"smooth"});
        break;
      }
      case "representation-back":{
        closeRepresentationTools(state);
        save();render();break;
      }
      case "representation-return":{
        // A tool is not an extra writing stage. Return to the same first
        // or later four-part mathematics page the student came from.
        returnToShowingFirstMaths("representation-return");
        break;
      }
      case "probability-open":navigateProbability();break;
      case "probability-preview-fit":case "probability-preview-detail":{
        const zoomed=action==="probability-preview-detail";
        state.probabilityStudio.zoomed=zoomed;save();
        const root=main.querySelector("[data-probability-studio]");
        const preview=root?.querySelector("[data-prob-preview]");
        if(preview){
          preview.classList.toggle("probability-preview-detail",zoomed);
          preview.scrollLeft=zoomed?(preview.scrollWidth-preview.clientWidth)/2:0;
        }
        root?.querySelectorAll("[data-action=probability-preview-fit],[data-action=probability-preview-detail]")
          .forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.action===action)));
        break;
      }
      case "probability-preset":{
        const studio=state.probabilityStudio;
        if((studio.draft.edited||studio.activeId)&&!window.confirm(
         "Choose a new starting layout? This replaces the current working tree and its outcome probabilities. Previously saved figures are kept."))break;
        if(!chooseProbabilityPreset(studio,el.dataset.probPreset)){toast("Unknown tree layout.");break;}
        save();render();toast("Starting layout ready","Enter and justify the probabilities for each active split.");
        break;
      }
      case "probability-flexibilise":{
        if(!enableFlexibleProbability(state.probabilityStudio))break;
        save();render();toast("Flexible branching enabled","Your existing outcomes and entered probabilities are preserved.");
        break;
      }
      case "probability-outcome-add":{
        const studio=state.probabilityStudio,parent=el.dataset.probParent||"";
        const result=addProbabilityOutcome(studio,parent);
        if(!result.ok){toast("Cannot add outcome",result.error);break;}
        studio.editLevel=parent.length;save();render();break;
      }
      case "probability-outcome-remove":{
        const studio=state.probabilityStudio,parent=el.dataset.probParent||"";
        if(!window.confirm("Remove this outcome and its dependent branches? Remaining outcome paths and event selections will be renumbered. Save your current tree first if needed."))break;
        const result=removeProbabilityOutcome(studio,parent,Number(el.dataset.probIndex));
        if(!result.ok){toast("Cannot remove outcome",result.error);break;}
        studio.editLevel=parent.length;save();render();break;
      }
      case "probability-path-continuation":{
        const studio=state.probabilityStudio,path=el.dataset.probPath||"";
        const more=el.dataset.probContinue==="true";
        if(!more&&!window.confirm("Finish this path here? Descendant splits will be kept for later but excluded from calculations, and affected event selections will be cleared."))break;
        const result=changeProbabilityContinuation(studio,path,more);
        if(!result.ok){toast("Cannot change this path",result.error);break;}
        studio.editLevel=more?path.length:path.length-1;save();render();break;
      }
      case "probability-new":{
        if(state.probabilityStudio.draft.edited&&!window.confirm("Start a new probability tree? Save the current draft if you need it."))break;
        freshProbability(state.probabilityStudio);save();render();break;
      }
      case "probability-load":{
        if(!loadProbability(state.probabilityStudio,el.dataset.probId)){toast("Saved tree not found.");break;}
        save();render();break;
      }
      case "probability-save":{
        const result=saveProbabilityDraft(state);
        if(!result.ok){toast("Check the probability tree",result.error);break;}
        save();render();toast("Editable probability tree saved",
         result.reviewNeeded?"Recheck your earlier linked mathematical conclusions.":"Included in your project backup.");
        break;
      }
      case "probability-use":{
        const result=saveAndLinkProbability(state);
        if(!result.ok){toast("Check the probability tree",result.error);break;}
        returnToShowingFirstMaths("linked-probability");
        toast("Probability tree linked to this mathematical stage");break;
      }
      case "probability-svg":case "probability-png":{
        exportProbability(state.probabilityStudio.draft,action.slice("probability-".length))
          .then(message=>toast(message)).catch(err=>toast("Probability tree export unavailable",err.message));
        break;
      }
      case "geometry-open":navigateGeometry();break;
      case "geometry-close":state.geometryStudio.open=false;save();render();break;
      case "geometry-preview-fit":case "geometry-preview-detail":{
        const zoomed=action==="geometry-preview-detail";
        state.geometryStudio.zoomed=zoomed;save();
        const root=main.querySelector("[data-geometry-studio]"),preview=root?.querySelector("[data-geometry-preview]");
        if(preview){
          preview.classList.toggle("geometry-preview-detail",zoomed);
          preview.scrollLeft=zoomed?(preview.scrollWidth-preview.clientWidth)/2:0;
        }
        root?.querySelectorAll("[data-action=geometry-preview-fit],[data-action=geometry-preview-detail]")
          .forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.action===action)));
        break;
      }
      case "geometry-template":{
        if(state.geometryStudio.draft.edited&&!window.confirm("Switch template? Save your current figure first if needed."))break;
        geometryTemplate(state.geometryStudio,el.dataset.geometryTemplate);save();render();break;
      }
      case "geometry-add":{
        if(!geometryAddVertex(state.geometryStudio)){toast("The diagram already has eight points.");break;}
        save();render();break;
      }
      case "geometry-remove":{
        if(!geometryRemoveVertex(state.geometryStudio,Number(el.dataset.geometryIndex)))break;
        save();render();break;
      }
      case "geometry-aux-add":{
        if(!geometryAddAuxPoint(state.geometryStudio)){toast("The construction already has ten extra points.");break;}
        save();render();break;
      }
      case "geometry-aux-remove":{
        const result=geometryRemoveAuxPoint(state.geometryStudio,Number(el.dataset.geometryIndex));
        if(!result.ok){toast("Point could not be removed",result.error);break;}
        save();render();break;
      }
      case "geometry-guide-add":{
        if(!geometryAddGuide(state.geometryStudio,el.dataset.geometryGuideKind)){
          toast("The construction already has twelve lines.");break;
        }
        save();render();break;
      }
      case "geometry-guide-remove":{
        if(!geometryRemoveGuide(state.geometryStudio,Number(el.dataset.geometryIndex)))break;
        save();render();break;
      }
      case "geometry-new":{
        if(state.geometryStudio.draft.edited&&!window.confirm("Start a new figure? Save your current version first if you want to keep it."))break;
        geometryFresh(state.geometryStudio);save();render();break;
      }
      case "geometry-load":{
        if(!loadGeometry(state.geometryStudio,el.dataset.geometryId)){toast("Saved figure not found.");break;}
        save();render();break;
      }
      case "geometry-align-edge":case "geometry-snap-right":{
        const index=Number(el.dataset.geometryIndex);
        const outcome=action==="geometry-align-edge"?
         snapGeometryEdge(state.geometryStudio,index):snapGeometryRightAngle(state.geometryStudio,index);
        if(!outcome.ok){toast("Cannot apply this construction",outcome.error);break;}
        save();render();toast("Construction updated","Recheck any related side lengths, angles and calculations.");
        break;
      }
      case "geometry-import-trace":{
        if(state.geometryStudio.draft.edited&&!window.confirm(
         "Replace the current unsaved construction with a new outline from Image Tracer? Saved figures and the original tracing will remain unchanged."))break;
        const result=importGeometryFromTrace(state,el.dataset.geometryTraceId||"");
        if(!result.ok){toast("Outline could not be transferred",result.error);break;}
        activateRepresentationTool(state,"geometry");save();render();
        toast("Traced coordinates transferred","A new independent construction was created from "+
         result.points+" points. The original photograph and calibration remain in Image Tracer.");
        break;
      }
      case "geometry-save":{
        const result=saveGeometryDraft(state);if(!result.ok){toast(result.error);break;}
        save();render();toast("Editable geometry saved",result.reviewNeeded?"Review earlier mathematical conclusions after changing this figure.":"Included in your project backup.");break;
      }
      case "geometry-use":{
        const result=saveAndLinkGeometry(state);if(!result.ok){toast(result.error);break;}
        returnToShowingFirstMaths("linked-geometry");toast("Geometry linked to this mathematical stage");break;
      }
      case "geometry-svg":case "geometry-png":{
        exportGeometry(state.geometryStudio.draft,action.slice("geometry-".length)).then(message=>toast(message)).catch(err=>toast("Geometry export unavailable",err.message));break;
      }
      case "voronoi-open":navigateVoronoi();break;
      case "voronoi-close":state.voronoiStudio.open=false;save();render();break;
      case "voronoi-tool":{
        if(state.voronoiStudio.scenario?.showOriginal)break;
        if(setVoronoiTool(state.voronoiStudio,el.dataset.voronoiTool)){save();refreshVoronoiPreview();}
        break;
      }
      case "voronoi-undo":case "voronoi-redo":{
        if(state.voronoiStudio.scenario?.showOriginal)break;
        const changed=action==="voronoi-undo"?undoVoronoi(state.voronoiStudio):redoVoronoi(state.voronoiStudio);
        if(changed){save();render();}
        break;
      }
      case "voronoi-fit":{
        const studio=state.voronoiStudio;
        if(studio.scenario?.active)break;
        if(studio.draft.regionMode==="manual"&&!window.confirm("Replace your justified study boundary with a fitted working window?"))break;
        if(fitVoronoiSites(studio)){save();render();}
        break;
      }
      case "voronoi-select-site":{
        if(selectVoronoiSite(state.voronoiStudio,Number(el.dataset.siteIndex))){save();refreshVoronoiPreview();}
        break;
      }
      case "voronoi-bisector-selected":{
        const before=voronoiFrame(state.voronoiStudio.draft);
        if(selectNearestBisector(state.voronoiStudio)){
          recordVoronoiHistory(state.voronoiStudio,before);save();render();
        }break;
      }
      case "voronoi-scenario-start":{
        if(proposeVoronoiComparison(state.voronoiStudio)){save();render();}
        else toast("Add two distinct sites before starting a comparison.");
        break;
      }
      case "voronoi-scenario-view":{
        const studio=state.voronoiStudio;
        if(showVoronoiComparison(studio,!studio.scenario.showOriginal)){save();render();}
        break;
      }
      case "voronoi-scenario-restore":case "voronoi-scenario-keep":{
        if(action==="voronoi-scenario-restore"&&!window.confirm("Restore the original sites and discard this what-if arrangement? Your earlier source positions are retained."))break;
        if(finishVoronoiComparison(state.voronoiStudio,{restore:action==="voronoi-scenario-restore"})){
          save();render();toast(action==="voronoi-scenario-restore"?"Original arrangement restored":
            "Hypothetical version kept","Proposed sites remain labelled and distinct from existing sites.");
        }break;
      }
      case "voronoi-parse":{
        if(state.voronoiStudio.scenario?.active){toast("Finish the what-if comparison before replacing the source sites.");break;}
        try{
          const before=voronoiFrame(state.voronoiStudio.draft);
          const parsed=importVoronoiSites(state.voronoiStudio,state.voronoiStudio.draft.raw);
          recordVoronoiHistory(state.voronoiStudio,before);
          state.voronoiStudio.selectedSiteId="";
          setVoronoiTool(state.voronoiStudio,"select");
          save();render();
          toast("Site coordinates imported",parsed.sites+" genuine sites recognised. Confirm equal distance units and a meaningful study window.");
        }catch(error){toast("Could not read site coordinates",error.message);}
        break;
      }
      case "voronoi-upload":document.querySelector("#voronoiCsvFile")?.click();break;
      case "voronoi-map-upload":document.querySelector("#voronoiMapFile")?.click();break;
      case "voronoi-map-clear":{
        if(state.voronoiStudio.draft.mapSrc&&!window.confirm("Remove the background map? Your site coordinates and saved versions will remain."))break;
        clearVoronoiMap(state.voronoiStudio);save();render();
        toast("Background map cleared","Coordinates and Voronoi cells have been retained.");break;
      }
      case "voronoi-add-site":{
        const studio=state.voronoiStudio,d=studio.draft;
        if(studio.scenario?.active&&d.addType==="observed"){toast("Existing sites are locked during a comparison. Choose Proposed location.");break;}
        const result=addVoronoiSite(studio,{name:d.addName,x:d.addX,y:d.addY,kind:d.addType});
        if(!result.ok){toast(result.error);break;}
        save();render();
        toast(result.site.kind==="candidate"?"Hypothetical site added":"Site added",
          "The nearest-site regions now reflect the additional site. A candidate is a what-if scenario, not evidence of an actual facility.");
        break;
      }
      case "voronoi-delete-site":{
        const index=Number(el.dataset.siteIndex);
        if(!removeVoronoiSite(state.voronoiStudio,index)){
          toast("That site is protected during the what-if comparison.");break;
        }
        save();render();toast("Site removed","Recheck whether the remaining locations still answer your aim.");break;
      }
      case "voronoi-new":{
        if(state.voronoiStudio.draft.sites.length&&state.voronoiStudio.draft.title.trim()&&
          !window.confirm("Start a new Voronoi diagram? Save your current editable version first."))break;
        beginVoronoi(state.voronoiStudio);save();render();toast("New Voronoi diagram ready");break;
      }
      case "voronoi-load":{
        if(!loadVoronoi(state.voronoiStudio,el.dataset.voronoiId)){toast("Saved diagram not found.");break;}
        save();render();toast("Saved Voronoi diagram loaded for editing");break;
      }
      case "voronoi-save":{
        const record=saveVoronoiDraft(state);
        if(!record.ok){toast(record.error);break;}
        save();render();
        toast("Voronoi diagram saved",record.reviewNeeded?
         "Changes to this geometry require revisiting a previous written result.":
         "Editable figure saved locally and in your JSON backup, not automatically inserted into your IA.");
        break;
      }
      case "voronoi-use":{
        const result=saveAndLinkVoronoi(state);
        if(!result.ok){toast(result.error);break;}
        returnToShowingFirstMaths("linked-voronoi");
        toast("Voronoi construction linked to this mathematical stage",result.reviewNeeded?
         "Recheck interpretations after the changed site locations or assumptions.":
         "Introduce the figure in your own IA and justify the distance model. Constructing cells does not prove optimal placement.");
        break;
      }
      case "voronoi-svg":case "voronoi-png":case "voronoi-csv":case "voronoi-copy":{
        const format=action.slice("voronoi-".length);
        const existing=state.voronoiStudio.figures.find(x=>x.id===state.voronoiStudio.activeId);
        const record=existing?.entryId?saveVoronoiDraft(state):{ok:true,reviewNeeded:false};
        if(!record.ok){toast(record.error);break;}
        if(existing?.entryId)save();
        exportVoronoi(state.voronoiStudio.draft,format).then(message=>toast(message,
         record.reviewNeeded?"Earlier mathematical interpretations of this figure now need review.":""))
         .catch(error=>toast("Voronoi export unavailable",error.message||"Try downloading the SVG."));
        break;
      }
      case "table-symbol":{
        if(!state.tableStudio?.open||state.completion.current!=="C31")break;
        const index=Number(el.dataset.tableCol),part=el.dataset.tablePart;
        const token=el.dataset.tableToken||"";
        if(!Number.isInteger(index)||!["heading","unit"].includes(part)||!token||token.length>24)break;
        const selector='input[data-table-col="'+index+'"][data-table-part="'+part+'"]';
        const field=el.closest(".ia-table-column-card")?.querySelector(selector)||
          main.querySelector('[data-native-choices="table"] '+selector);
        if(!field)break;
        const start=Number.isInteger(field.selectionStart)?field.selectionStart:field.value.length;
        const end=Number.isInteger(field.selectionEnd)?field.selectionEnd:start;
        const candidate=field.value.slice(0,start)+token+field.value.slice(end);
        if(!setTableColumn(state.tableStudio,index,part,candidate))break;
        field.value=part==="heading"?state.tableStudio.draft.headings[index]:
          state.tableStudio.draft.unitDecisions[index]?.unit||"";
        save();refreshTablePreview();
        field.focus({preventScroll:true});
        field.setSelectionRange(Math.min(start+token.length,field.value.length),
          Math.min(start+token.length,field.value.length));
        break;
      }
      case "table-return-to-graph":
        openNativeTool("graph");break;
      case "table-detach-model":{
        if(!detachTableGraphModel(state.tableStudio)){toast("No copied model to detach");break;}
        save();render();
        toast("Switched to independent coefficients",
          "Your original paired source values remain. Check the coefficients before exporting this table.");
        break;
      }
      case "table-to-stat":{
        const result=transferTableHistogram(state);
        if(!result.ok){toast("Cannot make this histogram",result.error);break;}
        openNativeTool("stat");
        toast("Matching histogram prepared",
         "Copied "+result.bins+" class intervals without changing the original table. The diagram uses frequency density, not counts, as bar heights.");
        break;
      }
      case "table-to-ogive":case "table-to-polygon":{
        const kind=action==="table-to-ogive"?"ogive":"polygon";
        const result=transferTableCurve(state,kind);
        if(!result.ok){toast("Cannot prepare this statistical curve",result.error);break;}
        openNativeTool("stat");
        toast(kind==="ogive"?"Cumulative-frequency curve prepared":"Frequency polygon prepared",
          "All "+result.bins+" source class intervals are retained. The original Table Studio work has not changed.");
        break;
      }
      case "table-open":navigateTable();break;
      case "table-close":state.tableStudio.open=false;save();render();break;
      case "table-mode":{
        if(!chooseTableMode(state.tableStudio,el.dataset.tableMode))break;
        save();render();break;
      }
      case "table-parse":{
        try{
          const result=importTableData(state.tableStudio,state.tableStudio.draft.raw);
          save();render();
          toast("Table cells imported",result.rows+" source rows and "+result.columns+" columns. Choose a short results table or a purposeful summary.");
        }catch(error){toast("Could not read these table cells",error.message);}
        break;
      }
      case "table-upload":document.querySelector("#tableCsvFile")?.click();break;
      case "table-new":{
        if(state.tableStudio.draft.matrix.length&&state.tableStudio.draft.title.trim()&&!window.confirm(
          "Start another table? Save this one first if you want to keep an editable copy."))break;
        freshTable(state.tableStudio);save();render();toast("New table ready");break;
      }
      case "table-load":{
        if(!loadTable(state.tableStudio,el.dataset.tableId)){toast("Saved table not found.");break;}
        save();render();toast("Saved table loaded for editing");break;
      }
      case "table-save":{
        const result=saveTableDraft(state);
        if(!result.ok){toast(result.error);break;}
        save();render();toast("Table saved",result.reviewNeeded?
         "The mathematics changed. Review any completed calculation or interpretation tied to this table.":
         "Editable table saved in your local project and JSON backup, not automatically inserted into your IA.");break;
      }
      case "table-use":{
        const result=saveAndLinkTable(state);
        if(!result.ok){toast(result.error);break;}
        returnToShowingFirstMaths("linked-table");
        toast("Formatted table linked to this mathematical stage",result.reviewNeeded?
         "Your previous result needs reviewing against the changed table.":
         "Introduce the table in your actual IA before displaying it. Creating it has not marked the mathematics as complete.");
        break;
      }
      case "table-svg":case "table-png":case "table-copy":case "table-csv":
      case "table-html":case "table-editable":{
        const format=action.slice("table-".length);
        const prior=state.tableStudio.figures.find(f=>f.id===state.tableStudio.activeId);
        const record=prior?.entryId?saveTableDraft(state):{ok:true,reviewNeeded:false};
        if(!record.ok){toast(record.error);break;}
        if(prior?.entryId)save();
        exportTable(state.tableStudio.draft,format).then(message=>toast(message,
         record.reviewNeeded?"You changed the underlying mathematics: check the earlier written interpretation.":""))
         .catch(error=>toast("Table export unavailable",error.message||"Try PNG or Download editable HTML."));
        break;
      }
      case "stat-to-table":{
        const result=transferStatFrequencyTable(state);
        if(!result.ok){toast("Cannot prepare a grouped-frequency table",result.error);break;}
        openNativeTool("table");
        toast("Grouped-frequency table prepared",
          "Copied "+result.bins+" complete class intervals and original provenance. Saved diagrams remain unchanged.");
        break;
      }
      case "stat-open":navigateStat();break;
      case "stat-close":state.statStudio.open=false;save();render();break;
      case "stat-kind":{
        if(!changeStatKind(state.statStudio,el.dataset.statValue))break;
        save();render();break;
      }
      case "stat-bin-suggestion":{
        if(!chooseHistogramSuggestion(state.statStudio,el.dataset.statValue)){toast("This suggested width is not available for the selected measurements.");break;}
        save();render();
        toast("Class width suggested","Inspect the resulting shape and justify the class width in your investigation.");
        break;
      }
      case "stat-new":{
        if(state.statStudio.draft.matrix.length&&state.statStudio.draft.title.trim()&&!window.confirm(
          "Start a fresh statistical diagram? Save this one first if you want to keep it editable."))break;
        freshStat(state.statStudio);save();render();
        toast("New statistical diagram started","Earlier saved statistical diagrams remain available below.");break;
      }
      case "stat-parse":{
        try{
          const result=importStatValues(state.statStudio,state.statStudio.draft.raw);
          save();render();
          toast("Statistical table imported",result.rows+" rows and "+result.columns+" columns recognised. Verify your variables, units and categories.");
        }catch(error){toast("Could not read the statistical table",error.message);}
        break;
      }
      case "stat-upload":document.querySelector("#statCsvFile")?.click();break;
      case "stat-reset-scale":{
        state.statStudio.draft.min="";state.statStudio.draft.max="";
        save();render();break;
      }
      case "stat-load":{
        if(!loadStat(state.statStudio,el.dataset.statId)){toast("Saved statistical diagram not found.");break;}
        save();render();toast("Saved statistical diagram loaded for editing");break;
      }
      case "stat-save":{
        const record=saveStatDraft(state);
        if(!record.ok){toast(record.error);break;}
        save();render();
        toast("Statistical diagram saved",record.reviewNeeded?
         "The statistics changed. Recheck any completed conclusion based on this diagram.":
         "This editable figure is saved locally and included in your project backup, not inserted into your IA.");
        break;
      }
      case "stat-use":{
        const record=saveAndLinkStat(state);
        if(!record.ok){toast(record.error);break;}
        returnToShowingFirstMaths("linked-statistics");
        toast("Statistical diagram linked to your mathematics",record.reviewNeeded?
         "Your earlier numerical interpretation now needs checking.":
         "Next, introduce this figure in your actual IA, then explain only the results genuinely supported by the data.");
        break;
      }
      case "stat-svg":case "stat-png":case "stat-copy":case "stat-csv":{
        const format=action.slice("stat-".length);
        const old=state.statStudio.figures.find(x=>x.id===state.statStudio.activeId);
        const linked=old?.entryId?saveStatDraft(state):{ok:true,reviewNeeded:false};
        if(!linked.ok){toast(linked.error);break;}
        if(old?.entryId)save();
        exportStat(state.statStudio.draft,format).then(message=>toast(message,
          linked.reviewNeeded?"Any earlier interpretation of changed statistics now needs review.":""))
          .catch(error=>toast("Statistical export unavailable",error.message||"Try SVG or CSV instead."));
        break;
      }
      case "trace-open":navigateTrace();break;
      case "trace-close":
        state.imageTracer.open=false;save();render();break;
      case "trace-upload":
        document.querySelector("#imageTraceFile")?.click();break;
      case "trace-mode":{
        if(!setTraceTool(state.imageTracer,el.dataset.traceValue))break;
        save();render();
        document.querySelector?.("[data-trace-preview]")?.scrollIntoView?.({block:"center",behavior:"smooth"});
        break;
      }
      case "trace-view":{
        if(!setTraceView(state.imageTracer,el.dataset.traceValue))break;
        save();refreshTracePreview();break;
      }
      case "trace-new":{
        if(state.imageTracer.draft.imageSrc&&state.imageTracer.draft.points.length&&!window.confirm(
          "Start a fresh tracing? Saved tracings remain available, but changes not saved to the current tracing will be lost."))break;
        startNewTrace(state.imageTracer);save();render();
        toast("New tracing ready","Your saved tracings remain available below the studio.");break;
      }
      case "trace-load":{
        if(!restoreSavedTrace(state.imageTracer,el.dataset.traceId)){toast("Saved tracing not found.");break;}
        save();render();toast("Saved tracing loaded for editing");break;
      }
      case "trace-undo":{
        if(!undoTracer(state.imageTracer)){toast("Nothing to undo yet.");break;}
        save();render();break;
      }
      case "trace-delete-point":{
        if(!removeTracerPoint(state.imageTracer,Number(el.dataset.traceIndex))){toast("Point not found.");break;}
        save();render();break;
      }
      case "trace-clear-points":{
        if(state.imageTracer.draft.points.length&&!window.confirm("Clear all traced points? The photograph and calibration remain."))break;
        state.imageTracer.draft.points=[];state.imageTracer.draft.mode="trace";
        save();render();break;
      }
      case "trace-rotate-left":case "trace-rotate-right":{
        const d=state.imageTracer.draft;
        if(!d.imageSrc){toast("Upload a photograph first.");break;}
        if((d.points.length||d.origin||d.refA)&&!window.confirm(
          "Rotating the image resets coordinate points, origin and calibration. Continue?"))break;
        const beforeSrc=d.imageSrc;
        rotateTracePhoto(beforeSrc,action==="trace-rotate-right").then(img=>{
          if(state.imageTracer.draft.imageSrc!==beforeSrc)return;
          usePhoto(state.imageTracer,{...img,name:d.imageName});
          save();render();toast("Photograph rotated","Mark the origin, x direction and reference again.");
        }).catch(error=>toast("Could not rotate photograph",error.message));
        break;
      }
      case "trace-save":{
        const result=saveTraceDraft(state);
        if(!result.ok){toast(result.error);break;}
        save();render();
        toast("Tracing draft saved",result.reviewNeeded?
          "The tracing changed. Check earlier mathematics and interpretation before using that result.":
          "This editable tracing is now included in your local project and JSON backup, not inserted into your IA.");
        break;
      }
      case "trace-use":{
        const result=saveAndLinkTrace(state);
        if(!result.ok){toast(result.error);break;}
        returnToShowingFirstMaths("linked-trace");
        toast("Tracing linked to this mathematical stage",result.reviewNeeded?
         "The tracing changed; recheck any interpretation of the previous measurements.":
         "Introduce the figure in your own IA and explain the calibration. Creating it has not completed the mathematics.");
        break;
      }
      case "trace-svg":case "trace-png":case "trace-copy":case "trace-csv":{
        const format=action.slice("trace-".length);
        // Align the exported figure with the saved linked mathematical record.
        const linked=state.imageTracer.figures.find(x=>x.id===state.imageTracer.activeId);
        const record=linked?.entryId?saveTraceDraft(state):{ok:true,reviewNeeded:false};
        if(!record.ok){toast(record.error);break;}
        if(linked?.entryId)save();
        exportTraceFigure(state.imageTracer.draft,format).then(message=>toast(message,
          record.reviewNeeded?"Any earlier interpretation of this altered tracing now needs review.":""))
          .catch(error=>toast("Tracing export unavailable",error.message||"Try downloading a PNG instead."));
        break;
      }
      case "graph-open":navigateGraph();break;
      case "graph-close":
        state.graphStudio.open=false;save();render();break;
      case "graph-type":{
        if(!chooseGraphType(state.graphStudio,el.dataset.graphValue))break;
        save();render();break;
      }
      case "graph-model-add":{
        const result=addGraphModel(state.graphStudio);
        if(!result.ok){toast("Cannot add model",result.error);break;}
        save();render();
        toast("Model added","This curve was added at your request. Consider whether its mathematical structure suits your observations.");
        break;
      }
      case "graph-model-toggle":{
        if(!toggleGraphModel(state.graphStudio,el.dataset.graphModelId))break;
        save();render();break;
      }
      case "graph-to-table":{
        const result=copyGraphModelToTable(state,el.dataset.graphModelId||"");
        if(!result.ok){toast("Cannot transfer this model",result.error);break;}
        openNativeTool("table");
        toast("Model copied into Table Studio",
          result.requiresSelection?"All "+result.rows+" observed pairs and full-precision predictions are retained. Choose up to eight source rows and explain your selection.":
          "Full-precision model predictions and residuals were transferred. The original graph is unchanged.");
        break;
      }
      case "graph-model-remove":{
        if(!removeGraphModel(state.graphStudio,el.dataset.graphModelId))break;
        save();render();break;
      }
      case "graph-new":{
        freshGraph(state.graphStudio);save();render();
        toast("New graph started","Previously saved graph drafts remain available below the editor.");break;
      }
      case "graph-clear-scale":{
        const d=state.graphStudio.draft;
        for(const key of ["xMin","xMax","yMin","yMax"])d[key]="";
        save();render();break;
      }
      case "graph-upload":
        document.querySelector?.("#graphCsvFile")?.click?.();break;
      case "graph-parse":{
        try{
          const result=importGraphTable(state.graphStudio,state.graphStudio.draft.raw);
          save();render();
          toast("Spreadsheet values imported",result.rows+" rows and "+result.columns+" columns recognised. Check your labels, units and source.");
        }catch(err){toast("Could not import these values",err.message);}
        break;
      }
      case "graph-load":{
        if(!loadSavedGraph(state.graphStudio,el.dataset.graphId)){toast("Saved graph not found.");break;}
        save();render();toast("Graph loaded for editing");break;
      }
      case "graph-save":{
        const result=saveGraphDraft(state);
        if(!result.ok){toast(result.error);break;}
        save();render();toast("Graph draft saved",result.reviewNeeded?
         "The diagram changed: review any completed mathematics or interpretations linked to it.":
         "It is stored on this device and included in your JSON project backup. It is not yet in your IA.");break;
      }
      case "graph-use":{
        const result=saveAndLinkGraph(state);
        if(!result.ok){toast(result.error);break;}
        returnToShowingFirstMaths("linked-graph");
        toast("Graph linked to your maths",result.reviewNeeded?
         "You changed the underlying mathematics: review your previous interpretation.":
         "Next, write your introductory sentence and put the saved figure in your own IA document. No result has been marked as completed.");
        break;
      }
      case "graph-svg":case "graph-png":case "graph-copy":case "graph-residual-svg":case "graph-residual-png":{
        const format=action.slice("graph-".length);
        // Keep the linked copy and its review status aligned with any exported edits.
        const prior=state.graphStudio.figures.find(x=>x.id===state.graphStudio.activeId);
        const result=prior?.entryId?saveGraphDraft(state):{ok:true,reviewNeeded:false};
        if(!result.ok){toast(result.error);break;}
        if(prior?.entryId)save();
        exportGraphFigure(state.graphStudio.draft,format).then(message=>toast(message,
          result.reviewNeeded?"The changed graph also flagged your earlier mathematical interpretation for review.":""))
          .catch(error=>toast("Graph export unavailable",error.message||"Try downloading the PNG instead."));
        break;
      }
      case "first-figure-select":{
        const index=state.entries.findIndex(x=>x.id===el.dataset.entryId&&["first","substantial"].includes(x.phase));
        if(index<0)break;
        state.completion.activeEntryIndex=index;state.ui.mathIndex=index;
        const stageCount=state.entries.slice(0,index+1).filter(x=>x.phase==="substantial").length;
        setCompletionNode(state,state.entries[index].phase==="first"?"C30":stageCount>1?"C50":"C40",
          {reason:"figure-result-selected"});
        save();render();
        document.querySelector?.('[data-first-inline-result]')?.scrollIntoView?.({block:"center",behavior:"auto"});
        break;
      }
      case "first-figure-edit":{
        const kind=el.dataset.figureKind,id=el.dataset.figureId;
        const tool=representationTool(kind);
        if(!tool||!state[tool.studio]?.figures.some(x=>x.id===id))break;
        diagramNavigators[kind]?.(id);
        break;
      }
      case "first-figure-hide":case "first-figure-restore":{
        const key=el.dataset.figureKey||"";
        const parsed=representationFigureKey(key);
        if(!parsed||!state[parsed.tool.studio]?.figures.some(f=>f.id===parsed.id))break;
        const visible=new Set(state.completion.hiddenFirstFigures||[]);
        if(action==="first-figure-hide")visible.add(key);
        else visible.delete(key);
        state.completion.hiddenFirstFigures=[...visible].slice(-80);
        const top=window.scrollY;save();render();window.scrollTo({top,behavior:"auto"});
        break;
      }
      case "journey-use-direction":{
        const index=state.entries.findIndex(x=>x?.id===el.dataset.entryId);
        const prior=state.entries[index],active=completeEntry(state);
        if(index<0||!prior||active?.id!==prior.id||
          !["C30","C40","C50"].includes(state.completion.current)){
          toast("Return to the result this mathematical question belongs to.");break;
        }
        const advice=adaptiveNextDirections(state,prior);
        const chosen=advice.status==="ready"&&advice.directions.find(x=>x.id===el.dataset.direction);
        if(!chosen){toast("Confirm your genuine finding before selecting a question.");break;}
        const oldQuestion=prior.phase==="first"?state.completion.fields.nextQuestion:prior.nextQuestion;
        if(oldQuestion&&oldQuestion!==chosen.question&&!window.confirm(
          "Replace your current mathematical question? Your own justification will remain unchanged."))break;
        const oldDirection=prior.journeyDirection||"";
        if(prior.phase==="first"){
          setCompletionField(state,"nextQuestion",chosen.question);
        }else{
          prior.nextQuestion=chosen.question;
          flagDependentMathematics(state,index,"nextQuestion",oldQuestion,chosen.question);
        }
        // Recommendations suggest a QUESTION, not ready-made student reasoning.
        // The student must write their own justification in Section 4.
        prior.journeyDirection=chosen.id;
        flagDependentMathematics(state,index,"journeyDirection",oldDirection,chosen.id);
        save();render();
        document.querySelector('[data-bind="'+(prior.phase==="first"?
          "completion.fields.nextReason":"entries."+index+".nextWhy")+'"]')?.
          scrollIntoView?.({block:"center",behavior:"smooth"});
        toast("Mathematical possibility selected","Now write why this follows from your specific result, in your own words.");
        break;
      }
      case "stage-add":{
        const created=addMathematicalStage(state);
        if(!created.ok){
          toast("Before adding another stage",created.error);
          document.querySelector?.('[data-show-first-part="show"]')?.scrollIntoView?.({block:"center",behavior:"smooth"});
          break;
        }
        const position=state.entries.slice(0,state.completion.activeEntryIndex+1).filter(x=>x.phase==="substantial").length;
        state.completion.conclusionWarningOpen=false;
        setCompletionNode(state,position>1?"C50":"C40",{reason:created.existing?"resume-maths-stage":"new-maths-stage"});
        nav("completing",{top:true});break;
      }
      case "conclusion-result-toggle":{
        const result=toggleConclusionResult(state,el.dataset.entryId);
        if(!result.ok){toast("Choose a confirmed result",result.error);break;}
        save();render();break;
      }
      case "stage-conclude":requestConclusionReview();break;
      case "conclusion-cancel":{
        state.completion.conclusionWarningOpen=false;save();render();break;
      }
      case "conclusion-confirm":{
        state.completion.conclusionWarningOpen=false;
        handleCompletionResult(setCompletionNode(state,"C60",{reason:"confirmed-ready-for-conclusion"}));break;
      }
      case "completion-route":{
        const route=routesAt(state.completion.current).find(x=>x.condition===el.dataset.condition);
        if(route?.to==="C60"&&state.completion.current!=="C60"){requestConclusionReview();break;}
        handleCompletionResult(moveCompletionRoute(state,el.dataset.condition));break;
      }
      case "completion-open":{
        if(el.dataset.node==="C60"&&state.completion.current!=="C60"){requestConclusionReview();break;}
        handleCompletionResult(setCompletionNode(state,el.dataset.node,{reason:"student-revisit"}));break;
      }
      case "completion-back":handleCompletionResult(completionBack(state));break;
      case "completion-mark":{
        const id=el.dataset.stage,status=el.dataset.status,previous=state.completion.stages[id];
        if(previous===status)return;
        const origin=captureReturn(el);
        if(!markCompletionStage(state,id,status)){toast("Unknown stage status.");break;}
        const title=C_MAJOR_STAGES.find(x=>x.id===id)?.name||"Stage";
        const text=status==="complete"?title+" marked ready for now":status==="needs-review"?title+" marked to revisit":title+": working on it";
        const detail=status==="complete"?"Your notes are saved. Revisit them whenever your investigation develops.":status==="needs-review"?"Your existing work stays in place. Refining your thinking is part of the investigation.":"Pick one useful next action. Your work stays saved as you go.";
        rememberCheckpoint(state,text,detail,id);save();render();restoreReturn(origin);toast(text,detail);break;
      }
      case "completion-review-import":
        setCompletionNode(state,"C02",{reason:"review-unchanged-import"});
        closeDrawer(false);nav("completing");break;
      case "completion-entry-reviewed":{
        const index=Number(el.dataset.index);
        if(!Number.isInteger(index)||!acknowledgeMathReview(state,index)){toast("No mathematical link is awaiting review.");break;}
        rememberCheckpoint(state,"Mathematical connection reviewed","Revising a connection is useful progress. Your actual IA writing remains yours to update.","",state.entries[index].id);
        save();render();toast(state.ui.latestTitle,state.ui.latestDetail);break;
      }
      case "guidance-writing-action":{
        const result=actOnWritingCue(state,{id:el.dataset.guidanceId,
          key:el.dataset.guidanceKey,action:el.dataset.guidanceEvent});
        if(!result.ok){toast(result.error);break;}
        save();render();
        if(result.record?.status==="noted")toast("Your note is saved in Pathfinder. It has not been inserted into your IA.");
        if(result.record?.status==="written")toast("Recorded as written in your IA, as you confirmed.");
        break;
      }
      case "guidance-more":
        state.completion.guidanceUi.expanded=!state.completion.guidanceUi.expanded;
        save();render();break;
      case "guidance-select":{
        const selected=eligibleWritingCues(state).find(x=>x.key===el.dataset.guidanceKey);
        if(!selected){toast("That tip is no longer relevant.");break;}
        state.completion.guidanceUi.selectedKey=selected.key;
        state.completion.guidanceUi.expanded=true;
        save();render();break;
      }
      case "guidance-maths-toggle":
        state.completion.guidanceUi.mathsExpanded=!state.completion.guidanceUi.mathsExpanded;
        save();render();break;
      case "guidance-limit-toggle":
        state.completion.guidanceUi.limitsExpanded=!state.completion.guidanceUi.limitsExpanded;
        save();render();break;
      case "guidance-limit-more":{
        const ui=state.completion.guidanceUi;
        const eligible=relevantLimitations(state);
        ui.limitPage=(ui.limitPage+1)*3>=eligible.length?0:ui.limitPage+1;
        ui.limitsExpanded=true;save();render();break;
      }
      case "guidance-limit-select":{
        const result=selectLimitation(state,el.dataset.limitId);
        if(!result.ok){toast(result.error);break;}
        state.completion.guidanceUi.limitsExpanded=true;
        save();render();break;
      }
      case "guidance-limit-record":{
        const result=recordLimitation(state);
        if(!result.ok){toast(result.error);break;}
        save();render();toast("Your actual limitation and mathematical consequence were recorded in Pathfinder.");break;
      }
      case "guidance-limit-cancel":
        state.completion.guidanceUi.limitDraftVisible=false;
        state.completion.limitationDraft={id:"",entryId:"",explanation:"",consequence:"",mitigation:"",location:""};
        save();render();break;
      case "guidance-limit-none":
        state.completion.guidanceUi.limitNoneKey=limitationContextKey(state);
        state.completion.guidanceUi.limitsExpanded=false;
        save();render();break;
      case "guidance-bivariate-use":{
        const ideas=relevantBivariateOptions(state);
        const idea=ideas[Number(el.dataset.index)];
        if(!idea){toast("Review the actual graph before choosing a question.");break;}
        setCompletionField(state,"nextQuestion",idea.question);
        setCompletionField(state,"nextReason","");
        setCompletionField(state,"nextMethod","");
        save();render();
        toast("Question selected as a possibility. Write your own mathematical reason before starting.");
        break;
      }
      case "completion-record-accuracy":{
        const result=addAccuracyDecision(state);
        if(!result.ok){toast(result.error);break;}
        save();render();toast("Accuracy spark saved","This accuracy policy can reappear wherever you explicitly link it to later mathematics.");break;
      }
      case "completion-edit-entry":editMath(Number(el.dataset.index));break;
      case "completion-suggest":{
        const item=completionSuggestions(state)[Number(el.dataset.index)];
        if(item){setCompletionField(state,"nextQuestion",item[0]);save();render();}
        break;
      }
      case "completion-first-from-map":
        setCompletionNode(state,"C30");nav("completing");break;
      case "completion-next-from-map":{
        const recent=latestRealResult(state);
        if(recent){setCompletionNode(state,"C35");nav("completing");}
        else if(state.entries.length){editMath(state.entries.length-1);}
        else{setCompletionNode(state,"C30");nav("completing");}
        break;
      }
      case "math-add":{
        setCompletionNode(state,latestRealResult(state)?"C35":"C30");
        nav("completing");break;
      }
      case "edit-step":editMath(Number(el.dataset.index));break;
      case "math-phase": state.ui.mathPhase=el.dataset.phase;save();render();break;
      case "math-work":state.ui.mathPhase="work";save();render({top:true});break;
      case "math-interpret":
        if(currentMath() && currentMath().status!=="completed"){toast("Record actual mathematics before interpreting a result.");return;}
        state.ui.mathPhase="interpret";save();render({top:true});break;
      case "math-next":state.ui.mathPhase="next";save();render({top:true});break;
      case "suggest-next":{
        const st=state.entries[Number(el.dataset.index)];
        if(!st)break;
        const item=suggestions(st)[Number(el.dataset.suggestion)];
        if(item){st.nextQuestion=item[0];save();render();}
        break;
      }
      case "math-add-next":{
        const st=currentMath();
        if(!st || !filled(st.nextQuestion)){toast("Record a real mathematical finding and next question first.");return;}
        setCompletionField(state,"nextQuestion",st.nextQuestion);
        setCompletionField(state,"nextReason",st.nextWhy||"");
        setCompletionNode(state,"C35");
        nav("completing");break;
      }
      case "toggle-help":{
        const origin=captureReturn(el);
        state.ui.helpKey=state.ui.helpKey===el.dataset.help?"":el.dataset.help;
        save();render();restoreReturn(origin);break;
      }
      case "cue-write":state.ui.openCue=el.dataset.key;save();render();break;
      case "close-cue":state.ui.openCue="";save();render();break;
      case "cue-covered":state.cues[el.dataset.key]="done";state.ui.openCue="";save();render();toast("Noted — this reminder won't keep appearing.");break;
      case "cue-skip":state.cues[el.dataset.key]="not-relevant";state.ui.openCue="";save();render();toast("Okay — this cue is now hidden.");break;
      case "writer-guide-welcome-dismiss":dismissDrawer();break;
      case "writer-guide-welcome-full":{
        state.ui.writerGuideIntroSeen=true;
        save();
        openDrawer("writer-guide");
        break;
      }
      case "writer-guide-stage-jump":{
        const group=String(el.dataset.guideBundle||"").replace(/[^a-z-]/g,"");
        const target=el.closest(".drawer")?.querySelector('[data-writer-advice-group="'+group+'"]');
        if(target){
          target.open=true;
          target.scrollIntoView?.({block:"start",behavior:"auto"});
          target.querySelector("summary")?.focus?.({preventScroll:true});
        }
        break;
      }
      case "writer-guide-filter":{
        const guide=el.closest(".writer-guide-main");if(!guide)break;
        const family=el.dataset.guideFilter||"all";
        let visible=0;
        guide.querySelectorAll("[data-guide-card]").forEach(card=>{
          card.hidden=family!=="all"&&card.dataset.guideFamily!==family;
          if(!card.hidden)visible++;
        });
        guide.querySelectorAll("[data-action='writer-guide-filter']").forEach(b=>b.setAttribute("aria-pressed",String(b===el)));
        guide.querySelectorAll(".writer-guide-tip-section").forEach(section=>{
          section.hidden=![...section.querySelectorAll("[data-guide-card]")].some(c=>!c.hidden);
        });
        const count=guide.querySelector(".writer-guide-filter-count");
        if(count)count.textContent=family==="all"?"Showing all 14 tips":"Showing "+visible+" tips for this theme";
        break;
      }
      case "writer-guide-example":{
        const example=el.closest(".writer-guide-example");if(!example)break;
        const show=el.dataset.guideView==="stronger"?"stronger":"ordinary";
        example.querySelectorAll("[data-guide-view]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.guideView===show)));
        example.querySelectorAll("[data-guide-text]").forEach(paragraph=>{paragraph.hidden=paragraph.dataset.guideText!==show;});
        const why=example.querySelector(".writer-guide-example-why");if(why)why.hidden=show!=="stronger";
        break;
      }
      case "writer-guide-story":{
        const story=el.closest(".writer-guide-story");if(!story)break;
        const index=el.dataset.storyStep;
        story.querySelectorAll("[data-story-step]").forEach(button=>{
          button.setAttribute("aria-pressed",String(button===el));
          button.classList.toggle("is-active",button===el);
        });
        story.querySelectorAll("[data-story-panel]").forEach(panel=>{panel.hidden=panel.dataset.storyPanel!==index;});
        break;
      }
      case "open-panel":lastFocus=el;openDrawer(el.dataset.panel);break;
      case "close-drawer":dismissDrawer();break;
      case "load-demo":
        demo(el.dataset.demo);break;
      case "export-json":exportJson();break;
      case "export-plan-pdf":void exportPlanningDocument("pdf");break;
      case "export-plan-docx":void exportPlanningDocument("docx");break;
      case "export-sample-ia-pdf":void exportIllustrativeIAPdf();break;
      case "export-full-pdf":void exportFullProjectDocument("pdf");break;
      case "export-full-docx":void exportFullProjectDocument("docx");break;
      case "export-full-zip":void exportFullProjectDocument("zip");break;
      case "import-report":{
        const target=$("#reportImportFile");
        if(target)target.click();else toast("The document upload control is unavailable.");
        break;
      }
      case "open-handover":lastFocus=el;openDrawer("handover");break;
      case "merge-select-missing":updateImportSelections("missing");break;
      case "merge-select-all":updateImportSelections("all");break;
      case "merge-select-none":updateImportSelections("none");break;
      case "merge-apply":applySelectedImport();break;
      case "handover-confirm":
        if(!state.handover)state.handover={};
        state.handover.confirmedAt=new Date().toISOString();
        state.handover.needsReview=false;
        save();closeDrawer();render();
        toast("Starting details reviewed. Teacher flags, if any, remain open.");break;
      case "import-json":$("#importFile").click();break;
      case "print-report":window.print();break;
      case "new-project":
        if(!window.confirm("Start a new project? Your current local work will be replaced. Download a backup first if you need it."))return;
        state=newState();save();closeDrawer();nav("home");toast("A fresh workspace is ready.");break;
    }
  }
  // Native pointer editing; document-level tracking survives live SVG replacements.
  let voronoiPointer=null;
  function voronoiPointerWorld(session,event){
    const p=session.svg.createSVGPoint();p.x=event.clientX;p.y=event.clientY;
    return coordinateFromCanvas(session.layout,session.bounds,p.matrixTransform(session.inverse));
  }
  function redrawVoronoiAtScroll(){
    const top=window.scrollY;
    save();render();window.scrollTo({top,behavior:"auto"});
  }
  // Geometry vertices can be dragged without interfering with Voronoi
  // interactions. A confirmed save is still required to alter a linked figure.
  let geometryPointer=null;
  document.addEventListener("pointerdown",evt=>{
    if(!state.geometryStudio?.open||state.completion.current!=="C31"||evt.button>0)return;
    const point=evt.target.closest?.("[data-geometry-vertex-index],[data-geometry-aux-index]"),
      svg=point?.closest?.("[data-geometry-canvas]");
    if(!point||!svg){
      // A pointerup can be lost when a draggable SVG is refreshed. Never
      // keep a stale drag armed when the user presses a Save or Export button.
      if(geometryPointer){geometryPointer=null;save();}
      return;
    }
    const aux=point.dataset.geometryAuxIndex!==undefined;
    const index=Number(aux?point.dataset.geometryAuxIndex:point.dataset.geometryVertexIndex),transform=svg.getScreenCTM?.();
    if(!transform||!Number.isInteger(index))return;
    let inverse;try{inverse=transform.inverse();}catch{return;}
    geometryPointer={id:evt.pointerId,svg,inverse,index,aux,layout:geometryLayout(state.geometryStudio.draft)};
    evt.preventDefault();
  });
  document.addEventListener("pointermove",evt=>{
    const drag=geometryPointer;if(!drag||drag.id!==evt.pointerId)return;
    if(evt.pointerType!=="touch"&&!(evt.buttons&1)){
      // The original SVG circle may have been detached while redrawing.
      // When no mouse button is held, further movement is not dragging.
      geometryPointer=null;save();return;
    }
    const svgPoint=drag.svg.createSVGPoint();svgPoint.x=evt.clientX;svgPoint.y=evt.clientY;
    const pt=svgPoint.matrixTransform(drag.inverse),coord=drag.layout.from(pt.x,pt.y);
    if(!Number.isFinite(coord.x)||!Number.isFinite(coord.y))return;
    const p=drag.aux?state.geometryStudio.draft.auxPoints[drag.index]:
     state.geometryStudio.draft.vertices[drag.index];if(!p)return;
    if(!(drag.aux?moveGeometryAuxPoint:moveGeometryVertex)(state.geometryStudio,drag.index,
      Math.round(coord.x*100)/100,Math.round(coord.y*100)/100))return;
    refreshGeometryPreview();
  });
  document.addEventListener("pointerup",evt=>{
    if(geometryPointer?.id!==evt.pointerId)return;
    const drag=geometryPointer;
    geometryPointer=null;save();
    // Updating the whole page here can detach an unrelated button between
    // pointerdown and click, silently swallowing the student's Save action.
    const root=main.querySelector?.("[data-geometry-studio]");
    for(const axis of ["x","y"]){
      const input=root?.querySelector(drag.aux?
       '[data-geometry-aux="'+drag.index+'"][data-geometry-aux-key="'+axis+'"]':
       '[data-geometry-vertex="'+drag.index+'"][data-geometry-vertex-key="'+axis+'"]');
      if(input&&document.activeElement!==input)
        input.value=(drag.aux?state.geometryStudio.draft.auxPoints[drag.index]:
         state.geometryStudio.draft.vertices[drag.index])?.[axis]??"";
    }
  });
  document.addEventListener("pointercancel",evt=>{
    if(geometryPointer?.id===evt.pointerId){geometryPointer=null;save();}
  });
  document.addEventListener("keydown",evt=>{
    const target=evt.target?.closest?.("[data-geometry-vertex-index],[data-geometry-aux-index]");
    if(!target||!state.geometryStudio?.open||!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(evt.key))return;
    const aux=target.dataset.geometryAuxIndex!==undefined;
    const index=Number(aux?target.dataset.geometryAuxIndex:target.dataset.geometryVertexIndex);
    const p=aux?state.geometryStudio.draft.auxPoints[index]:state.geometryStudio.draft.vertices[index];
    if(!p||p.locked)return;evt.preventDefault();geometryPointer=null;
    const step=evt.shiftKey?1:.1;
    if(evt.key==="ArrowLeft")p.x-=step;
    if(evt.key==="ArrowRight")p.x+=step;
    if(evt.key==="ArrowUp")p.y+=step;
    if(evt.key==="ArrowDown")p.y-=step;
    if(!(aux?moveGeometryAuxPoint:moveGeometryVertex)(state.geometryStudio,index,
       Number(p.x.toFixed(3)),Number(p.y.toFixed(3))))return;
    save();render();
    main.querySelector?.('['+(aux?'data-geometry-aux-index':'data-geometry-vertex-index')+'="'+index+'"]')?.focus?.();
  });
  document.addEventListener("pointerdown",evt=>{
    if(!state.voronoiStudio?.open||state.completion.current!=="C31"||state.voronoiStudio.scenario?.showOriginal)return;
    const svg=evt.target.closest?.("[data-voronoi-canvas]");
    if(!svg||evt.button>0)return;
    const transform=svg.getScreenCTM?.();if(!transform)return;
    const studio=state.voronoiStudio,bounds=displayVoronoiBounds(studio.draft),layout=voronoiLayout(bounds);
    if(!layout)return;
    let inverse;try{inverse=transform.inverse();}catch{return;}
    const hit=evt.target.closest?.("[data-voronoi-site-index],[data-voronoi-cell-index]");
    const index=hit?.dataset.voronoiSiteIndex!==undefined?Number(hit.dataset.voronoiSiteIndex):
      hit?.dataset.voronoiCellIndex!==undefined?Number(hit.dataset.voronoiCellIndex):-1;
    voronoiPointer={id:evt.pointerId,svg,inverse,bounds,layout,index,
      isSite:hit?.dataset.voronoiSiteIndex!==undefined,isCell:hit?.dataset.voronoiCellIndex!==undefined,
      startX:evt.clientX,startY:evt.clientY,
      before:voronoiFrame(studio.draft),tool:studio.tool,dragged:false,
      locked:studio.scenario?.active&&index>=0&&studio.draft.sites[index]?.kind==="observed"};
    if(index>=0&&["select","inspect"].includes(studio.tool))selectVoronoiSite(studio,index);
    evt.preventDefault();
  });
  document.addEventListener("pointermove",evt=>{
    const session=voronoiPointer;
    if(!session||evt.pointerId!==session.id||!state.voronoiStudio?.open)return;
    if(session.tool!=="select"||!session.isSite||session.index<0||session.locked)return;
    if(!session.dragged&&Math.hypot(evt.clientX-session.startX,evt.clientY-session.startY)<4)return;
    const p=voronoiPointerWorld(session,evt);if(!p)return;
    const studio=state.voronoiStudio;
    freezeVoronoiWindow(studio);
    const moved=moveVoronoiSite(studio,session.index,p.x,p.y,{record:false});
    if(moved.ok&&moved.changed){session.dragged=true;refreshVoronoiPreview();}
    evt.preventDefault();
  });
  document.addEventListener("pointerup",evt=>{
    const session=voronoiPointer;
    if(!session||evt.pointerId!==session.id)return;
    voronoiPointer=null;const studio=state.voronoiStudio;if(!studio?.open)return;
    if(session.dragged){
      recordVoronoiHistory(studio,session.before);redrawVoronoiAtScroll();return;
    }
    if(session.index>=0&&(session.isSite&&session.tool!=="test"||
      session.isCell&&["select","inspect"].includes(session.tool))){
      selectVoronoiSite(studio,session.index);redrawVoronoiAtScroll();
      if(session.locked&&session.tool==="select")toast("Existing sites are protected in a comparison.");
      return;
    }
    if(Math.hypot(evt.clientX-session.startX,evt.clientY-session.startY)>9)return;
    const p=voronoiPointerWorld(session,evt);if(!p)return;
    if(session.tool==="existing"||session.tool==="candidate"){
      if(studio.scenario?.active&&session.tool==="existing"){
        toast("Use Place proposed during a what-if comparison.");return;
      }
      const before=voronoiFrame(studio.draft);
      freezeVoronoiWindow(studio);
      const result=addVoronoiSite(studio,{name:"",x:canvasPosition(p.x),y:canvasPosition(p.y),
        kind:session.tool==="candidate"?"candidate":"observed"},before);
      if(!result.ok){applyVoronoiFrame(studio.draft,before);toast(result.error);return;}
      redrawVoronoiAtScroll();return;
    }
    if(session.tool==="test"){
      const before=voronoiFrame(studio.draft);
      studio.draft.probeX=String(canvasPosition(p.x));
      studio.draft.probeY=String(canvasPosition(p.y));
      recordVoronoiHistory(studio,before);redrawVoronoiAtScroll();
    }
  });
  document.addEventListener("pointercancel",evt=>{
    if(!voronoiPointer||evt.pointerId!==voronoiPointer.id)return;
    const before=voronoiPointer.before;voronoiPointer=null;
    applyVoronoiFrame(state.voronoiStudio.draft,before);redrawVoronoiAtScroll();
  });
  document.addEventListener("click",evt=>{
    if(!guidePopinHost.hidden&&!evt.target.closest?.("#writerGuidePopinLayer,[data-action='writer-guide-open']"))closeGuidePopin(false);
    if(!guidePopinHost.hidden&&evt.target===guidePopinHost){closeGuidePopin();return;}
    const traceTap=evt.target.closest?.("[data-trace-tap]");
    if(traceTap&&state.imageTracer?.open){
      const svg=traceTap.closest("[data-trace-canvas]");
      const transform=svg?.getScreenCTM?.();
      if(!svg||!transform)return;
      const point=svg.createSVGPoint();
      point.x=evt.clientX;point.y=evt.clientY;
      const imagePoint=point.matrixTransform(transform.inverse());
      const result=tapTrace(state.imageTracer,imagePoint.x,imagePoint.y);
      if(!result.ok){toast(result.error);return;}
      const oldY=window.scrollY;
      save();render();window.scrollTo({top:oldY,behavior:"auto"});
      return;
    }
    const navButton=evt.target.closest("[data-nav]");
    if(navButton){nav(navButton.dataset.nav);return;}
    const choice=evt.target.closest("[data-choice]");
    if(choice) {
      const path=choice.dataset.choice;
      const previous=getPath(path);
      const numeric=["project.readiness","project.ease"].includes(path);
      if(path.startsWith("planning.fields.")){
        applyPlanningField(state,path.slice("planning.fields.".length),choice.dataset.value);
      }else if(path.startsWith("completion.fields.")){
        setCompletionField(state,path.slice("completion.fields.".length),choice.dataset.value);
      }else{
        putPath(path,numeric?Number(choice.dataset.value):choice.dataset.value);
        if(path.startsWith("entries.")&&previous!==choice.dataset.value){
          const [,index,key]=path.split(".");
          if(/^\d+$/.test(index)){
           flagDependentMathematics(state,Number(index),key,previous,choice.dataset.value);
           syncOutcome(path,choice.dataset.value);
          }
          const stage=state.entries[Number(index)]?.phase==="first"?"C30":"C40";
          if(state.completion.stages[stage]==="complete")state.completion.stages[stage]="needs-review";
        }
      }
      if(path.endsWith(".status")&&path.startsWith("entries.")&&previous!==choice.dataset.value){state.ui.helpKey="";}
      let resultMoment=false;
      if(path.startsWith("entries.")&&path.endsWith(".status")&&previous!==choice.dataset.value&&choice.dataset.value==="completed"){
        const entry=state.entries[Number(path.split(".")[1])];
        if(entry?.result?.trim()){
          rememberCheckpoint(state,"A mathematical result recorded",entry.interpretation?.trim()?"Your result and interpretation are on your path. Decide what question follows.":"Now connect this finding to your aim, then decide what question follows.","",entry.id);
          resultMoment=true;
        }
      }
      save();render();
      if(resultMoment)toast(state.ui.latestTitle,state.ui.latestDetail);
      const focusTarget=[...document.querySelectorAll("[data-choice]")].find(x=>x.dataset.choice===path&&x.dataset.value===choice.dataset.value);
      if(focusTarget)focusTarget.focus({preventScroll:true});
      return;
    }
    const action=evt.target.closest("[data-action]");
    if(action){if(action.closest(".drawer")&&action.dataset.action!=="close-drawer"&&
      ["resume-work","go-home","go-planning","go-path","go-report","go-studio","go-checking","open-files","open-demos","open-stuck"].includes(action.dataset.action))closeDrawer(false);
      clickAction(action);return;}
    if(evt.target===layer)dismissDrawer();
  });
  document.addEventListener("input",evt=>{
    const target=evt.target;
    if(target.dataset.probBranchParent!==undefined){
      if(setProbabilityBranch(state.probabilityStudio,target.dataset.probBranchParent,
         Number(target.dataset.probBranchIndex),target.dataset.probBranchKey,target.value)){
        save();refreshProbabilityPreview();
      }return;
    }
    if(target.dataset.probStage!==undefined){
      if(setProbabilityStage(state.probabilityStudio,Number(target.dataset.probStage),target.value)){
        save();refreshProbabilityPreview();
      }return;
    }
    if(target.dataset.probLeaf!==undefined){
      if(toggleProbabilityLeaf(state.probabilityStudio,target.dataset.probMembership,target.dataset.probLeaf,target.checked)){
        save();refreshProbabilityPreview();
      }return;
    }
    if(target.dataset.probField!==undefined){
      const value=target.type==="checkbox"?target.checked:target.value;
      if(setProbabilityField(state.probabilityStudio,target.dataset.probField,value)){
        save();
        if(target.tagName==="SELECT"||target.type==="checkbox")render();
        else refreshProbabilityPreview();
      }return;
    }

    if(target.dataset.diagramExpression!==undefined){
      const root=target.closest("[data-diagram-notation]"),box=root?.querySelector("[data-diagram-expression-preview]");
      const error=root?.querySelector("[data-diagram-notation-error]");
      if(error){error.textContent="";error.hidden=true;}
      const candidate=target.value.trim();
      if(box)void getMathEditor().then(async()=>{
        const {mathSvg}=await import("./src/math/mixed-math.js");
        if(!box.isConnected||target.value.trim()!==candidate)return;
        try{box.innerHTML=candidate?mathSvg(candidate).svg:"Your expression preview appears here.";}
        catch(err){box.textContent=err.message;}
      }).catch(err=>{if(box?.isConnected)box.textContent="Maths preview unavailable: "+err.message;});
      return;
    }
    // Show the formatted label beside its source field; never transform cell values.
    if(target.matches?.('[data-graph-field],[data-stat-field],[data-trace-field],[data-table-field],[data-table-col],[data-voronoi-field],[data-voronoi-site-key="name"],[data-geometry-field],[data-geometry-vertex],[data-geometry-aux],[data-geometry-guide]')){
      const studio=target.closest("[data-graph-studio],[data-stat-studio],[data-image-tracer],[data-table-studio],[data-voronoi-studio],[data-geometry-studio]");
      for(const root of studio?.querySelectorAll?.("[data-diagram-notation]")||[]){
        if(diagramNotationField(root)===target){refreshDiagramValuePreview(root);break;}
      }
    }
     if(target.dataset.mathExpression!==undefined||target.dataset.mathDisplay!==undefined){
      void getMathEditor().then(mod=>mod.refreshMathExpressionPreview(target.closest("[data-math-composer]")));
      return;
    }
    if(target.dataset.nativeHeading!==undefined||target.dataset.nativeCell!==undefined){
      const type=target.dataset.nativeType,studio=nativeStudio(state,type);
      if(!studio||type!==activeNativeType(state))return;
      const col=Number(target.dataset.nativeCol);
      const ok=target.dataset.nativeHeading!==undefined?
       editNativeHeading(studio,type,col,target.value):
       editNativeCell(studio,type,Number(target.dataset.nativeRow),col,target.value);
      if(ok){save();refreshNativeWorksheet(type);}
      return;
    }
    if(target.dataset.geometryAux!==undefined){
      const index=Number(target.dataset.geometryAux),key=target.dataset.geometryAuxKey;
      if(setGeometryAuxPoint(state.geometryStudio,index,key,target.value)){
        save();refreshGeometryPreview();
      }return;
    }
    if(target.dataset.geometryGuide!==undefined){
      const index=Number(target.dataset.geometryGuide),key=target.dataset.geometryGuideKey;
      const value=target.type==="checkbox"?target.checked:target.value;
      if(setGeometryGuide(state.geometryStudio,index,key,value)){
        save();if(target.tagName==="SELECT")render();else refreshGeometryPreview();
      }return;
    }
    if(target.dataset.geometryVertex!==undefined){
      const index=Number(target.dataset.geometryVertex),key=target.dataset.geometryVertexKey,
        value=target.type==="checkbox"?target.checked:target.value;
      if(setGeometryVertex(state.geometryStudio,index,key,value)){
        save();refreshGeometryPreview();
        if(["edgeConstraint","rightAngle","locked"].includes(key)){
         const controls=target.closest(".geometry-vertex"),point=state.geometryStudio.draft.vertices[index];
         const align=controls?.querySelector('[data-action="geometry-align-edge"]');
         const square=controls?.querySelector('[data-action="geometry-snap-right"]');
         if(align)align.disabled=point.edgeConstraint==="free";
         if(square)square.disabled=!point.rightAngle;
         if(key==="locked")controls?.querySelectorAll('[data-geometry-vertex-key="x"],[data-geometry-vertex-key="y"]')
          .forEach(input=>input.disabled=point.locked);
        }
      }return;
    }
    if(target.dataset.geometryField!==undefined){
      if(setGeometryField(state.geometryStudio,target.dataset.geometryField,target.type==="checkbox"?target.checked:target.value)){
        save();if(target.tagName==="SELECT"||target.type==="checkbox")render();else refreshGeometryPreview();
      }return;
    }
    if(target.dataset.voronoiSite!==undefined){
      if(setVoronoiSite(state.voronoiStudio,Number(target.dataset.voronoiSite),
          target.dataset.voronoiSiteKey,target.value)){
        save();refreshVoronoiPreview();
      }
      return;
    }
    if(target.dataset.voronoiField!==undefined){
      if(setVoronoiField(state.voronoiStudio,target.dataset.voronoiField,
        target.type==="checkbox"?target.checked:target.value)){
        save();refreshVoronoiPreview();
      }
      return;
    }
    if(target.dataset.tableCol!==undefined){
      const index=Number(target.dataset.tableCol);
      if(setTableColumn(state.tableStudio,index,target.dataset.tablePart,target.value)){
        save();refreshTablePreview();
      }
      return;
    }
    if(target.dataset.tableField!==undefined){
      if(setTableField(state.tableStudio,target.dataset.tableField,target.type==="checkbox"?target.checked:target.value)){
        save();refreshTablePreview();
      }
      return;
    }
    if(target.dataset.statField!==undefined){
      if(setStatField(state.statStudio,target.dataset.statField,target.type==="checkbox"?target.checked:target.value)){
        save();refreshStatPreview();
      }
      return;
    }
    if(target.dataset.traceField!==undefined){
      const value=target.type==="checkbox"?target.checked:target.value;
      if(setTraceField(state.imageTracer,target.dataset.traceField,value)){
        save();refreshTracePreview();
      }
      return;
    }
    if(target.dataset.graphModelPeriod!==undefined){
      if(updateGraphModelOption(state.graphStudio,target.dataset.graphModelPeriod,"period",target.value)){
        save();refreshGraphPreview();
      }
      return;
    }
    if(target.dataset.graphModelMethod!==undefined){
      if(updateGraphModelOption(state.graphStudio,target.dataset.graphModelMethod,"fitMethod",target.value)){
        save();refreshGraphPreview();
      }
      return;
    }
    if(target.dataset.graphModelExpression!==undefined){
      if(updateGraphModelExpression(state.graphStudio,target.dataset.graphModelExpression,target.value)){
        save();refreshGraphPreview();
      }
      return;
    }
    if(target.dataset.graphField!==undefined){
      if(updateGraphField(state.graphStudio,target.dataset.graphField,target.type==="checkbox"?target.checked:target.value)){
        save();
        if(target.dataset.graphField!=="modelReflection")refreshGraphPreview();
      }
      return;
    }
    if(target.dataset.ideaInput!==undefined){
      if(ideaInput(state,target.dataset.ideaInput,target.value,{savedId:target.dataset.ideaSaved||""}))save();
      return;
    }
    if(target.dataset.resourceFilter!==undefined){
      if(resourceFilter(resourceSession,target.dataset.resourceFilter,target.value)){
        const result=$("#resource-results",layer);if(result)result.innerHTML=resourceList(resourceSession);
      }
      return;
    }
    if(target.dataset.planSearch!==undefined){
      state.planning.mathSearch=target.value.slice(0,90);filterMathOptions();return;
    }
    if(target.dataset.bind){
      const mathRoot=target.closest?.(".field-group")?.querySelector?.(".math-writing-tools");
      if(mathRoot&&target.tagName==="TEXTAREA"){
        void getMathEditor().then(mod=>mod.refreshMathWritingPreview(mathRoot,target))
          .catch(error=>console.warn("Equation preview unavailable",error));
      }
      updateBoundField(target.dataset.bind,target.value);
      save();refreshSavedSpark(target.dataset.bind);
      // Keep the optional prediction spark visibly updated while typing.
      // This status means "saved in Pathfinder", never "written in the IA".
      if(target.dataset.bind==="planning.fields.prediction"){
        const row=main.querySelector?.('[data-intro-spark="prediction"]');
        if(row){
          const saved=!!target.value.trim();
          row.dataset.introSparkState=saved?"ready":"missing";
          const status=row.querySelector(".intro-spark-prediction-status");
          if(status)status.textContent=saved?"Spark saved":"To consider";
        }
      }
      // Keep the compact, editable motivation-page aim spark in sync without
      // rerendering (which would steal focus from the student's textarea).
      if(target.dataset.bind==="planning.fields.aim"){
        const preview=main.querySelector?.("[data-motivation-aim-preview]");
        if(preview){
          const value=target.value.trim();
          preview.textContent=value?(value.length>90?value.slice(0,89)+"…":value):"Your aim is still developing";
        }
      }
      // Updating a returned Planning spark edits the same canonical field.
      main.querySelectorAll?.("[data-spark-preview-path]").forEach(preview=>{
        if(preview.dataset.sparkPreviewPath!==target.dataset.bind)return;
        const value=target.value.trim();
        preview.textContent=value.length>90?value.slice(0,89)+"…":value||"Still developing";
      });
    }
  });
  document.addEventListener("paste",evt=>{
    const target=evt.target;
    if(target?.dataset?.nativeHeading===undefined&&target?.dataset?.nativeCell===undefined)return;
    const raw=evt.clipboardData?.getData("text/plain")||"";
    if(!/[\t\r\n]/.test(raw))return;
    const type=target.dataset.nativeType,studio=nativeStudio(state,type);
    if(!studio||type!==activeNativeType(state))return;
    evt.preventDefault();
    const result=pasteNativeRange(studio,type,
     target.dataset.nativeHeading!==undefined?0:Number(target.dataset.nativeRow),
     Number(target.dataset.nativeCol),raw,{headings:target.dataset.nativeHeading!==undefined});
    if(!result.ok){toast("Cannot paste this data block",result.error);return;}
    studio.nativePage=Math.floor((target.dataset.nativeHeading!==undefined?0:Number(target.dataset.nativeRow))/NATIVE_PAGE_ROWS);
    save();render();
    toast("Cells pasted",result.rows+" rows and "+result.cols+" columns added. Check units and missing values.");
  });
  document.addEventListener("change",evt=>{
    const target=evt.target;
    if(target.dataset.probBranchParent!==undefined||target.dataset.probStage!==undefined||
       target.dataset.probLeaf!==undefined||target.dataset.probField!==undefined){
      // Already saved on input; a change after blur must not detach an action button.
      return;
    }

    if(target.dataset.geometryVertex!==undefined){
      const index=Number(target.dataset.geometryVertex),key=target.dataset.geometryVertexKey;
      const point=state.geometryStudio.draft.vertices[index],value=target.type==="checkbox"?target.checked:target.value;
      // Input has already saved this selection; do not detach the
      // editor between a button mouse-down and click.
      if(point&&String(point[key]??"")===String(value))return;
      if(setGeometryVertex(state.geometryStudio,index,key,value)){save();refreshGeometryPreview();}
      return;
    }
    if(target.dataset.geometryField!==undefined){
      const key=target.dataset.geometryField,value=target.type==="checkbox"?target.checked:target.value;
      if(state.geometryStudio.draft[key]===value)return;
      if(setGeometryField(state.geometryStudio,key,value)){
        save();if(target.tagName==="SELECT"||target.type==="checkbox")render();else refreshGeometryPreview();
      }return;
    }
    if(target.dataset.voronoiSite!==undefined){
      const index=Number(target.dataset.voronoiSite),key=target.dataset.voronoiSiteKey;
      const old=state.voronoiStudio.draft.sites[index]?.[key];
      if(setVoronoiSite(state.voronoiStudio,index,key,target.value)){
        save();
        if(target.tagName==="SELECT"){const cursor=captureReturn(target);render();restoreReturn(cursor);}
        else if(String(old)!==target.value)refreshVoronoiPreview();
      }
      return;
    }
    if(target.dataset.voronoiField!==undefined){
      const key=target.dataset.voronoiField,value=target.type==="checkbox"?target.checked:target.value;
      const old=state.voronoiStudio.draft[key];
      if(setVoronoiField(state.voronoiStudio,key,value)){
        save();
        if(target.tagName==="SELECT"||target.type==="checkbox"){
          const cursor=captureReturn(target);render();restoreReturn(cursor);
        }else if(old!==value)refreshVoronoiPreview();
      }
      return;
    }
    if(target.dataset.tableDisplayColumn!==undefined){
      if(!toggleTableDisplayColumn(state.tableStudio,Number(target.dataset.tableDisplayColumn),target.checked))
        toast("Choose up to five displayed columns","The original source values have not been changed.");
      save();render();return;
    }
    if(target.dataset.tableVariable!==undefined){
      const ok=toggleTableVariable(state.tableStudio,Number(target.dataset.tableVariable),target.checked);
      if(!ok)toast("Choose no more than four comparable numerical groups for the summary.");
      save();render();return;
    }
    if(target.dataset.tableMeasure!==undefined){
      const ok=toggleTableMeasure(state.tableStudio,target.dataset.tableMeasure,target.checked);
      if(!ok)toast("Use at most three summary statistics so your table stays readable.");
      save();render();return;
    }
    if(target.dataset.tableFormatIndex!==undefined){
      const index=Number(target.dataset.tableFormatIndex),part=target.dataset.tableFormatPart;
      if(setTableColumnFormat(state.tableStudio,index,part,target.value)){
        save();refreshTablePreview();
        const row=target.closest(".ia-table-column-precision-row");
        const digitsWrapper=row?.querySelector("[data-table-format-digits]");
        const mode=tableColumnFormat(state.tableStudio.draft,index).mode;
        if(digitsWrapper){
          digitsWrapper.hidden=mode!=="dp"&&mode!=="sf";
          const digitsSelect=digitsWrapper.querySelector('[data-table-format-part="digits"]');
          const rule=tableColumnFormat(state.tableStudio.draft,index);
          if(digitsSelect){
            digitsSelect.value=rule?.digits||"2";
            const zero=digitsSelect.querySelector('option[value="0"]');
            if(zero)zero.disabled=mode==="sf";
          }
          const hint=digitsWrapper.querySelector("span");
          if(hint)hint.textContent=mode==="sf"?"Significant figures":"Decimal places";
        }
      }
      return;
    }
    if(target.dataset.tableCol!==undefined){
      const index=Number(target.dataset.tableCol),key=target.dataset.tablePart;
      const original=key==="heading"?state.tableStudio.draft.headings[index]:
        state.tableStudio.draft.unitDecisions[index]?.[key==="unitMode"?"mode":"unit"];
      if(setTableColumn(state.tableStudio,index,key,target.value)){
        save();
        if(target.tagName==="SELECT"){
          const cursor=captureReturn(target);render();restoreReturn(cursor);
        }else if(original!==target.value){
          // Rare autofill/change without input; avoid replacing buttons on a normal blur.
          refreshTablePreview();
        }
      }
      return;
    }
    if(target.dataset.tableField!==undefined){
      const key=target.dataset.tableField,value=target.type==="checkbox"?target.checked:target.value;
      const original=state.tableStudio.draft[key];
      if(setTableField(state.tableStudio,key,value)){
        save();
        if(target.tagName==="SELECT"||target.type==="checkbox"){
          const cursor=captureReturn(target);render();restoreReturn(cursor);
        }else if(original!==value){
          // The input handler already refreshed live output while typing.
          // Rendering again during blur can remove a button before its click fires.
          refreshTablePreview();
        }
      }
      return;
    }
    if(target.dataset.statSeries!==undefined){
      const index=Number(target.dataset.statSeries),changed=toggleStatSeries(state.statStudio,index,target.checked);
      if(!changed){
        toast("Select at most five measurement groups (four for bar charts), not the category column.");
      }
      save();render();return;
    }
    if(target.dataset.statField!==undefined){
      if(setStatField(state.statStudio,target.dataset.statField,target.type==="checkbox"?target.checked:target.value)){
        save();
        if(target.tagName==="SELECT"||target.type==="checkbox"){
          const place=captureReturn(target);
          render();restoreReturn(place);
        }else refreshStatPreview();
      }
      return;
    }
    if(target.dataset.traceField!==undefined){
      const value=target.type==="checkbox"?target.checked:target.value;
      if(setTraceField(state.imageTracer,target.dataset.traceField,value)){
        save();
        if(target.tagName==="SELECT"||target.type==="checkbox"){
          const previous=captureReturn(target);render();restoreReturn(previous);
        }else refreshTracePreview();
      }
      return;
    }
    if(target.dataset.graphModelMethod!==undefined){
      if(updateGraphModelOption(state.graphStudio,target.dataset.graphModelMethod,"fitMethod",target.value)){
        save();
        const position=captureReturn(target);render();restoreReturn(position);
      }
      return;
    }
    if(target.dataset.graphModelPeriod!==undefined){
      if(updateGraphModelOption(state.graphStudio,target.dataset.graphModelPeriod,"period",target.value)){
        save();refreshGraphPreview();
      }
      return;
    }
    if(target.dataset.graphModelExpression!==undefined){
      if(updateGraphModelExpression(state.graphStudio,target.dataset.graphModelExpression,target.value)){
        save();refreshGraphPreview();
      }
      return;
    }
    if(target.dataset.graphField!==undefined){
      if(updateGraphField(state.graphStudio,target.dataset.graphField,target.type==="checkbox"?target.checked:target.value)){
        save();
        if(target.dataset.graphField==="modelReflection")return;
        if(target.tagName==="SELECT"||target.type==="checkbox"){
          const position=captureReturn(target);
          render();restoreReturn(position);
        }else refreshGraphPreview();
      }
      return;
    }
    if(target.dataset.ideaDifficulty!==undefined){
      if(ideaDifficultyInput(state,target.dataset.ideaDifficulty,target.checked))save();
      return;
    }
    if(target.dataset.ideaTopic!==undefined){
      if(chooseTopic(state,target.value)){save();render();const select=$("#idea-topic");if(select)select.focus({preventScroll:true});}
      return;
    }
    if(target.dataset.ideaInput!==undefined){
      if(ideaInput(state,target.dataset.ideaInput,target.value,{savedId:target.dataset.ideaSaved||""}))save();
      return;
    }
    if(target.dataset.resourceFilter!==undefined){
      if(resourceFilter(resourceSession,target.dataset.resourceFilter,target.value)){
        const result=$("#resource-results",layer);if(result)result.innerHTML=resourceList(resourceSession);
      }
      return;
    }
    if(target.dataset.resourcePref!==undefined){
      if(resourcePreference(state,resourceSession,target.dataset.resourcePref,target.value)){
        save();render();openDrawer("resources");
        const details=$(".resource-preferences",layer);if(details)details.open=true;
        const input=$("#resource-pref-"+target.dataset.resourcePref,layer);if(input)input.focus({preventScroll:true});
      }
      return;
    }
    if(target.dataset.check){state.cues[target.dataset.check]=target.checked?"done":"open";save();}
    if(target.dataset.mergeKey!==undefined){
      const key=target.dataset.mergeKey;
      if(pendingImport?.changes?.some(x=>x.key===key)){
        if(target.checked)importSelected.add(key);else importSelected.delete(key);
        const n=$("#mergeCount",layer);if(n)n.textContent=importSelected.size;
      }
      return;
    }
    if(target.dataset.bind){
      updateBoundField(target.dataset.bind,target.value);
      save();
      const path=target.dataset.bind;
      if(path==="planning.fields.course"||path==="planning.fields.ideaSelected"||
       path==="planning.fields.assessmentFramework"||
       ["planning.fields.primarySamplingMethod","planning.fields.primarySamplingFrame",
        "planning.fields.primaryAccuracyBasis","planning.fields.secondaryAccuracyBasis",
        "planning.fields.permissionNeed","planning.fields.practicalBlocker",
        "planning.fields.dataAvailability"].includes(path)||
       ["completion.fields.firstMathsBridgePlacement",
        "completion.fields.scatterDetail","completion.fields.scatterAimRelevance",
        "entries."+state.completion.activeEntryIndex+".methodId",
        "entries."+state.completion.activeEntryIndex+".accuracyRef"].includes(path)||
       (["C30","C40","C50"].includes(state.completion.current)&&(
         (state.completion.current==="C30"&&
           ["completion.fields.firstWorkStatus","completion.fields.firstWorkResult",
            "completion.fields.firstWorkTitle","completion.fields.firstWorkLocation"].includes(path))||
         /^entries\.\d+\.(status|result|title|resultRef|journeyOutcome)$/.test(path)))||
       /^entries\.\d+\.resultSignal$/.test(path)||
       (/^entries\.\d+\.result$/.test(path)&&["C40","C50"].includes(state.completion.current)&&
        state.entries[Number(path.split(".")[1])]?.status==="completed")){
       const at=window.scrollY;render();
       if(["C30","C40","C50"].includes(state.completion.current))window.scrollTo({top:at,behavior:"auto"});
       if(/^entries\.\d+\.resultSignal$/.test(path)||path==="completion.fields.firstMathsBridgePlacement"){
         const input=document.querySelector('[data-bind="'+path+'"]');
         if(input)input.focus({preventScroll:true});
       }
      }
      if(state.route==="planning"&&state.planning.current==="N03H"&&path.startsWith("planning.fields.milestone")){
        const key=path.slice("planning.fields.".length),f=state.planning.fields;
        const dateTarget=document.querySelector('[data-timeline-date="'+key+'"]');
        const weekTarget=document.querySelector('[data-timeline-week="'+key+'"]');
        if(dateTarget)dateTarget.textContent=validDate(f[key])?
          new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}).format(new Date(f[key]+"T12:00:00Z")):"Date to decide";
        if(weekTarget)weekTarget.textContent=validDate(f[key])&&validDate(f.timelineStart)?
          "Week "+timelineWeek(f.timelineStart,f[key]):"Not scheduled";
      }
    }
  });
  document.addEventListener("submit",evt=>{if(evt.target.closest(".resource-filter-form"))evt.preventDefault();});
  document.addEventListener("keydown",evt=>{
    const target=evt.target;
    const notationPanel=target?.closest?.("[data-notation-panel]");
    if(notationPanel&&evt.key==="Escape"){
      evt.preventDefault();
      notationPanel.hidden=true;
      const toggle=notationPanel.closest("[data-diagram-notation]")?.querySelector(".diagram-notation-toggle");
      toggle?.setAttribute("aria-expanded","false");
      toggle?.focus({preventScroll:true});
      return;
    }
    if(notationPanel&&evt.key==="Enter"&&target?.dataset?.diagramExpression!==undefined){
      evt.preventDefault();
      notationPanel.querySelector('[data-action="diagram-notation-insert"]')?.click();
      return;
    }
    if(target?.dataset?.nativeCell!==undefined&&evt.key==="Enter"){
      const type=target.dataset.nativeType,studio=nativeStudio(state,type);
      if(studio&&type===activeNativeType(state)){
       evt.preventDefault();
       const row=Number(target.dataset.nativeRow)+(evt.shiftKey?-1:1),col=Number(target.dataset.nativeCol);
       if(row<0||row>=NATIVE_MAX_ROWS)return;
       let next=main.querySelector?.('[data-native-cell][data-native-row="'+row+'"][data-native-col="'+col+'"]');
       if(!next){
        editNativeCell(studio,type,row,col,"");
        studio.nativePage=Math.floor(row/NATIVE_PAGE_ROWS);
        save();render();
        next=main.querySelector?.('[data-native-cell][data-native-row="'+row+'"][data-native-col="'+col+'"]');
       }
       next?.focus?.();next?.select?.();
      }
      return;
    }
    // Keyboard users can inspect/adjust sites and place points on a focused grid.
    const hit=evt.target.closest?.("[data-voronoi-site-index],[data-voronoi-cell-index],[data-voronoi-plane]");
    if(hit&&state.voronoiStudio?.open&&!state.voronoiStudio.scenario?.showOriginal){
      const studio=state.voronoiStudio,bounds=displayVoronoiBounds(studio.draft);
      const index=hit.dataset.voronoiSiteIndex!==undefined?Number(hit.dataset.voronoiSiteIndex):
        hit.dataset.voronoiCellIndex!==undefined?Number(hit.dataset.voronoiCellIndex):-1;
      const arrow={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]}[evt.key];
      if(index>=0&&arrow&&studio.tool==="select"){
        evt.preventDefault();
        const site=studio.draft.sites[index];
        if(!site)return;
        const k=evt.shiftKey?20:100;
        const dx=(bounds.xMax-bounds.xMin)/k,dy=(bounds.yMax-bounds.yMin)/k;
        const result=moveVoronoiSite(studio,index,site.x+arrow[0]*dx,site.y+arrow[1]*dy);
        if(result.ok&&result.changed){
          redrawVoronoiAtScroll();
          document.querySelector?.('[data-voronoi-site-index="'+index+'"]')?.focus?.();
        }else if(!result.ok)toast(result.error);
        return;
      }
      if(hit.dataset.voronoiPlane!==undefined&&arrow){
        evt.preventDefault();
        const cursor=studio.keyboardCursor||{x:(bounds.xMin+bounds.xMax)/2,y:(bounds.yMin+bounds.yMax)/2};
        const center=cursor.x<bounds.xMin||cursor.x>bounds.xMax||cursor.y<bounds.yMin||cursor.y>bounds.yMax?
          {x:(bounds.xMin+bounds.xMax)/2,y:(bounds.yMin+bounds.yMax)/2}:cursor;
        const fraction=evt.shiftKey?100:20;
        studio.keyboardCursor={
          x:Math.max(bounds.xMin,Math.min(bounds.xMax,canvasPosition(center.x+arrow[0]*(bounds.xMax-bounds.xMin)/fraction))),
          y:Math.max(bounds.yMin,Math.min(bounds.yMax,canvasPosition(center.y+arrow[1]*(bounds.yMax-bounds.yMin)/fraction)))
        };
        studio.cursorVisible=true;save();refreshVoronoiPreview();
        document.querySelector?.("[data-voronoi-plane]")?.focus?.();
        return;
      }
      if(evt.key==="Enter"||evt.key===" "){
        evt.preventDefault();
        if(index>=0){
          selectVoronoiSite(studio,index);save();refreshVoronoiPreview();
          document.querySelector?.('[data-voronoi-site-index="'+index+'"]')?.focus?.();
          return;
        }
        if(hit.dataset.voronoiPlane!==undefined){
          const cursor=studio.keyboardCursor||{x:5,y:5},at={
            x:Math.min(bounds.xMax,Math.max(bounds.xMin,cursor.x)),
            y:Math.min(bounds.yMax,Math.max(bounds.yMin,cursor.y))};
          if(studio.tool==="existing"||studio.tool==="candidate"){
            if(studio.scenario?.active&&studio.tool==="existing"){
              toast("Place proposals, not measured sites, during a comparison.");return;
            }
            const before=voronoiFrame(studio.draft);
            freezeVoronoiWindow(studio);
            const result=addVoronoiSite(studio,{name:"",x:at.x,y:at.y,
              kind:studio.tool==="candidate"?"candidate":"observed"},before);
            if(!result.ok){applyVoronoiFrame(studio.draft,before);toast(result.error);return;}
            redrawVoronoiAtScroll();
          }else if(studio.tool==="test"){
            const before=voronoiFrame(studio.draft);
            studio.draft.probeX=String(at.x);studio.draft.probeY=String(at.y);
            recordVoronoiHistory(studio,before);redrawVoronoiAtScroll();
          }else return;
          document.querySelector?.("[data-voronoi-plane]")?.focus?.();
          return;
        }
      }
    }
    if(evt.key==="Escape"&&!guidePopinHost.hidden){evt.preventDefault();closeGuidePopin();return;}
    if(evt.key==="Escape"&&!layer.hidden&&!document.querySelector("dialog[open]")){evt.preventDefault();dismissDrawer();}
    if(evt.key==="Tab"&&!layer.hidden){
      const focusable=[...layer.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled]),summary')].filter(el=>el.getClientRects().length);
      if(!focusable.length)return;
      const first=focusable[0],last=focusable[focusable.length-1];
      if(evt.shiftKey&&(document.activeElement===first||document.activeElement===layer.querySelector(".drawer"))){evt.preventDefault();last.focus();}
      if(!evt.shiftKey&&document.activeElement===last){evt.preventDefault();first.focus();}
    }
  });
  $("#importFile").addEventListener("change",async evt=>{
    if(preview.active){evt.target.value="";toast("Return to your investigation before restoring a backup.");return;}
    const input=evt.target;const file=input.files&&input.files[0];
    if(!file)return;
    try{
      if(file.size>4_000_000)throw new Error("This project backup exceeds the supported 4 MB limit. Remove large unused images or use a smaller project export.");
      const imported=normalise(JSON.parse(await file.text()));
      if(!window.confirm("Replace the current local project with this backup?"))return;
      state=imported;state.route="home";save();closeDrawer();render({top:true});toast("Project backup restored.");
    }catch(err){window.alert("This file could not be imported. "+err.message);}
    finally{input.value="";}
  });
  $("#imageTraceFile").addEventListener("change",async evt=>{
    const input=evt.target,file=input.files?.[0];if(!file)return;
    try{
      const draft=state.imageTracer.draft;
      if(draft.imageSrc&&(draft.points.length||draft.origin||draft.refA)&&!window.confirm(
        "Replacing this photo clears its origin, reference measurements and traced points. Continue?"))return;
      setSaveStatus("Preparing photograph on this device…");
      const result=await importTracePhoto(file);
      usePhoto(state.imageTracer,result);
      state.imageTracer.open=true;state.graphStudio.open=false;state.statStudio.open=false;state.tableStudio.open=false;
      if(state.completion.current!=="C31")setCompletionNode(state,"C31",{reason:"trace-photo"});
      save();render();
      toast("Photograph ready","Set the origin, positive x direction and reference scale. The picture stays on this device.");
    }catch(error){toast("Could not import photograph",error.message||"Choose a JPG or PNG.");}
    finally{input.value="";}
  });
  document.addEventListener("paste",async evt=>{
    if(!state.imageTracer?.open||state.completion.current!=="C31"||!evt.target.closest?.(".image-tracer"))return;
    if(evt.target.closest("input,textarea,[contenteditable]"))return;
    const item=[...(evt.clipboardData?.items||[])].find(x=>x.kind==="file"&&["image/png","image/jpeg","image/webp"].includes(x.type));
    const file=item?.getAsFile?.();
    if(!file)return;
    evt.preventDefault();
    if(state.imageTracer.draft.points.length&&!window.confirm("Replace this photo and clear the tracing?"))return;
    try{
      const picture=await importTracePhoto(file);
      usePhoto(state.imageTracer,picture);
      save();render();toast("Image pasted","The image is kept on this device. Calibrate before exporting.");
    }catch(error){toast("Image paste unavailable",error.message);}
  });
  $("#voronoiCsvFile").addEventListener("change",async evt=>{
    const input=evt.target,file=input.files?.[0];if(!file)return;
    try{
      if(file.size>20000)throw new Error("Select at most 20 KB of site coordinates.");
      const data=importVoronoiSites(state.voronoiStudio,await file.text());
      state.voronoiStudio.open=true;
      state.graphStudio.open=false;state.imageTracer.open=false;state.statStudio.open=false;state.tableStudio.open=false;
      if(state.completion.current!=="C31")setCompletionNode(state,"C31",{reason:"voronoi-csv"});
      save();render();toast("Voronoi site data imported",data.sites+" valid sites.");
    }catch(error){toast("Voronoi coordinate import unavailable",error.message);}
    finally{input.value="";}
  });
  $("#voronoiMapFile").addEventListener("change",async evt=>{
    const input=evt.target,file=input.files?.[0];if(!file)return;
    try{
      const image=await importTracePhoto(file);
      useVoronoiMap(state.voronoiStudio,image);
      state.voronoiStudio.open=true;
      state.graphStudio.open=false;state.imageTracer.open=false;state.statStudio.open=false;state.tableStudio.open=false;
      if(state.completion.current!=="C31")setCompletionNode(state,"C31",{reason:"voronoi-map"});
      save();render();
      toast("Map image imported locally","Set the four coordinate bounds, credit the image and confirm that its scale and projection match.");
    }catch(error){toast("Voronoi image import unavailable",error.message||"Use PNG, JPG or WebP.");}
    finally{input.value="";}
  });
  $("#tableCsvFile").addEventListener("change",async evt=>{
    const input=evt.target,file=input.files?.[0];if(!file)return;
    try{
      if(file.size>85000)throw new Error("Choose a smaller CSV/TSV file, at most 85 KB.");
      const imported=importTableData(state.tableStudio,await file.text());
      state.tableStudio.open=true;state.statStudio.open=false;state.graphStudio.open=false;state.imageTracer.open=false;state.voronoiStudio.open=false;
      if(state.completion.current!=="C31")setCompletionNode(state,"C31",{reason:"table-csv"});
      save();render();
      toast("Table data imported",imported.rows+" source rows. Long raw tables cannot be exported directly.");
    }catch(error){toast("Could not import table data",error.message);}
    finally{input.value="";}
  });
  $("#statCsvFile").addEventListener("change",async evt=>{
    const input=evt.target,file=input.files?.[0];if(!file)return;
    try{
      if(file.size>85000)throw new Error("Choose a smaller CSV/TSV file, no larger than 85 KB.");
      const result=importStatValues(state.statStudio,await file.text());
      state.statStudio.open=true;state.imageTracer.open=false;state.graphStudio.open=false;state.tableStudio.open=false;state.voronoiStudio.open=false;
      if(state.completion.current!=="C31")setCompletionNode(state,"C31",{reason:"statistics-csv"});
      save();render();
      toast("Statistical table imported",result.rows+" rows recognised. Check selected columns and units.");
    }catch(error){toast("Statistical import unavailable",error.message);}
    finally{input.value="";}
  });
  $("#graphCsvFile").addEventListener("change",async evt=>{
    const input=evt.target,file=input.files?.[0];if(!file)return;
    try{
      if(file.size>85000)throw new Error("Choose a smaller CSV or TSV file, under 85 KB.");
      const raw=await file.text(),result=importGraphTable(state.graphStudio,raw);
      state.graphStudio.open=true;state.statStudio.open=false;state.imageTracer.open=false;state.tableStudio.open=false;state.voronoiStudio.open=false;setCompletionNode(state,"C31",{reason:"graph-csv"});
      save();render();
      toast("CSV data imported",result.rows+" rows and "+result.columns+" columns read. Confirm source, labels and units.");
    }catch(err){toast("Could not import CSV",err.message);}
    finally{input.value="";}
  });
  $("#reportImportFile").addEventListener("change",async event=>{
    if(preview.active){event.target.value="";toast("Return to your investigation before importing a plan.");return;}
    const file=event.target.files?.[0];
    if(!file)return;
    try{await readPlanningDocument(file);}
    finally{event.target.value="";}
  });
  document.addEventListener("toggle",evt=>{
    if(!evt.target.matches?.(".journey-chapter"))return;
    const control=main.querySelector('[data-action="journey-toggle-all"]');
    if(control){const all=[...main.querySelectorAll('.journey-chapter')].every(x=>x.open);control.setAttribute('aria-expanded',String(all));control.textContent=all?'Collapse full path':'Show full path';}
  },true);
  window.addEventListener?.("resize",positionGuidePopin);
  window.addEventListener?.("scroll",()=>{if(!guidePopinHost.hidden)positionGuidePopin();},true);
  // Welcome: current route from a previous session should always remain reachable and understandable.
  render();
})();