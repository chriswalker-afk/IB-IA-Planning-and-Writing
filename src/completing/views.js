import {chapterRibbon} from '../ui/living-journey.js';
import {renderFieldGuideTeaser,renderContextualGuide} from './writer-field-guide.js';
import {renderIntroductionSparkPrompt,renderIntroductionWritingAdvice,renderIntroductionOptionalExamples} from './intro-writing-advice.js';
import {renderWritingStageFlow} from './stage-writing-flow.js';
import {renderConclusionWorkspace} from './conclusion-workspace.js';
import {isStudioWritingNode,renderStudioWritingStage} from './studio-writing-stages.js';
import {firstMathsContext} from "./first-maths-bridge.js";
import {renderJourneyWritingAdvice} from "./first-maths-writing-guidance.js";
import {renderShowingMathsContext} from "./showing-first-maths.js";
import {renderGraphStudio} from "../diagrams/graph-view.js";
import {renderGraphSvg} from "../diagrams/graph-core.js";
import {renderImageTracer} from "../diagrams/image-tracer-view.js";
import {renderTraceOverlaySvg,renderCleanTraceSvg} from "../diagrams/image-tracer-core.js";
import {renderStatStudio} from "../diagrams/stat-studio-view.js";
import {renderStatSvg} from "../diagrams/stat-studio-render.js";
import {renderTableStudio} from "../diagrams/table-studio-view.js";
import {renderTableSvg} from "../diagrams/table-studio-render.js";
import {renderVoronoiStudio} from "../diagrams/voronoi-view.js";
import {renderVoronoiSvg} from "../diagrams/voronoi-render.js";
import {renderRepresentationHub,renderRepresentationSwitcher} from "../diagrams/representation-hub.js";
import {renderFirstFigureGallery} from "./first-figure-gallery.js";
import {renderFigureHandover} from "../diagrams/presentation-coach-view.js";
import {insightCapture,insightEcho,renderSparkShelf} from '../ui/insight-threads.js';
import {STATUS_LABELS,currentGroup,JOURNEY_GROUPS} from "../ui/journey.js";
import {groupedDashboard} from "../ui/journey-views.js";
import {examplePrompt,exampleInline} from "../examples/views.js";
import {criteriaPanel,essentialsNudge} from "../essentials/views.js";
import {criterionPageHeading,criterionMarkedField,criterionMarkedWritingBox} from "../essentials/criteria-badges.js";
import {resourcePrompt} from "../resources/views.js";
import {createStuckViews} from '../help/stuck-views.js';
import {isStuckNode} from '../help/stuck-state.js';
/**
 * Phase 4 — focused Completing screens keyed to the 52 C nodes.
 * The route actions use EXACT source-sheet condition strings. Students can
 * navigate freely and mark stage completion explicitly; a visit is not completion.
 */
import {createConformanceViews} from "./conformance-views.js";
import {C_NODES,C_PROMPTS} from "./catalog.js";
import {createGuidanceViews} from "./guidance-views.js";
import {routeAdvice,resultSignalOptions,routeNextQuestions,isAdviceReduced} from "./route-coach.js";
import {actualMathematics,selectedInvestigativeRoute,outcomeRouteForEntry,journeyOutcomeOptions,selectedJourneyOutcome,journeySelectionIsStale,adaptiveNextDirections,stageLinkContext} from "./adaptive-journey.js";
import {extendedPlanningCheck} from "./extended-routes.js";
import {METHOD_OPTIONS,COURSE_OPTIONS} from "./guidance-context.js";
import {
 C_MAJOR_STAGES,C_STAGE_STATUS,routesAt,completionStage,completionFlags,
 completeEntry,latestRealResult,sourceResultForNext,scatterForNext,canViewPmccFollowup,canViewScatterFollowup,completionSuggestions
} from "./engine.js";

export function createCompletingViews(ctx){
 const {getState,e,icon,field,choose,button,summary,sheetTitle,tabletNav,filled}=ctx;
 const titleMap=new Map(C_NODES.map(x=>[x.id,x.label]));
 const F=(key,label,placeholder="",opts={})=>field("completion.fields."+key,label,placeholder,opts);
 const guides=createGuidanceViews(ctx),extra=createConformanceViews(ctx),stuck=createStuckViews(ctx);
 const entryField=(key,label,placeholder="",opts={})=>{
  const state=getState(),i=state.completion.activeEntryIndex;
  return i>=0&&i<state.entries.length?field("entries."+i+"."+key,label,placeholder,opts):"";
 };
 const criteriaField=(html,key)=>isStudioWritingNode(getState().completion.current)?criterionMarkedField(html,key):isAdviceReduced(getState())?html:criterionMarkedField(html,key);
 const entryChoice=(key,options)=>{
  const c=getState().completion,i=c.activeEntryIndex;
  return i>=0?choose("entries."+i+"."+key,options,{tight:true}):"";
 };
 const choice=(key,values)=>choose("completion.fields."+key,values.map(([value,title,desc])=>({value,title,desc})),{tight:true});
 const smallSummary=(label,text)=>text?summary(label,text):"";
 const info=(title,text,warning=false)=>'<div class="inline-note'+(warning?" warning":"")+'">'+icon(warning?"info":"lightbulb")+
    '<p><strong>'+e(title)+'</strong> '+e(text)+'</p></div>';
 const action=(label,route,priority=false)=>'<button type="button" class="btn '+(priority?"btn-primary":"btn-secondary")+
  '" data-action="completion-route" data-condition="'+e(route.condition)+'">'+e(label||route.condition)+icon("arrow-right")+'</button>';
 const sourceAction=(condition,label=null,priority=false)=>{
  const route=routesAt(getState().completion.current).find(x=>x.condition===condition);
  return route?action(label,route,priority):"";
 };
 const routeList=(conditions)=>conditions.map(x=>sourceAction(x)).filter(Boolean).join("");
 const selectStage=(id)=>'<button type="button" class="btn btn-quiet btn-sm" data-action="completion-open" data-node="'+e(id)+'">'+e(titleMap.get(id)||id)+icon("arrow-right")+'</button>';
 const relevantRoute=(route)=>{
  if(route.to==="C10E")return false; // Replaced by the visible, read-only comparison viewer.
  // C31 is now a generator workspace, not a compulsory decision page. Legacy routes still work.
  if((getState().completion.current==="C30"&&route.to==="C31")||
     (getState().completion.current==="C31"&&route.to==="C32"))return false;
  const s=getState(),f=s.completion.fields,prior=latestRealResult(s),entry=completeEntry(s),
  current=s.completion.current,kind=s.planning.fields.kind||s.project.kind;
  if(current==="C04"&&["C10","C20","C30","C40","C50","C60","C70","C80","C90"].includes(route.to))
    return false; // The accessible dashboard cards already navigate to these stages.
  if(["C35P"].includes(route.to)&&!canViewPmccFollowup(s))return false;
  if(["C35B"].includes(route.to)&&!canViewScatterFollowup(s))return false;
  if(["C35H"].includes(route.to)&&!prior)return false;
  if(route.to==="C34"&&current!=="C95Q"&&
    !(entry?.status==="completed"&&filled(entry.result)))return false;
  if(current==="C20"){
    if(route.to==="C21T")return kind==="theoretical"||kind==="unsure"||!kind;
    if(route.to==="C21S")return kind==="statistics"||kind==="modelling";
    if(route.to==="C21M")return kind==="modelling"||kind==="statistics";
  }
  if(current==="C35"){
    if(["C35H","C35B","C35P"].includes(route.to))return false; // Already available beside the next-question form.
    const hasSubstantial=s.entries.some(x=>x.phase==="substantial"&&x.status==="completed"&&filled(x.result));
    if(route.to==="C40"&&hasSubstantial)return false;
    if(route.to==="C50"&&!hasSubstantial)return false;
  }
  if(current==="C35B"&&route.to==="C35"&&f.scatterPattern){
    const label=route.condition.toLowerCase();
    if(f.scatterPattern==="curved")return label.includes("curved");
    if(f.scatterPattern==="unclear")return label.includes("no clear");
    if(f.scatterPattern==="linear")return label.includes("straight");
    if(f.scatterPattern==="unexpected")return label.includes("uncertain");
    if(f.scatterPattern==="unsure")return label.includes("uncertain");
  }
  if(current==="C40"||current==="C50"){
    if(route.to==="C40L"&&entry?.knowledge==="syllabus")return false;
  }
  return true;
 };
 const allButtons=(current,primary=[])=>{
  // Branch choices live at the end of the four-part maths writing page.
  if(["C30","C40","C50","C60"].includes(current))return "";
  const rows=routesAt(current).filter(relevantRoute);
  const used=new Set(primary);
  const display=rows.filter(r=>used.has(r.condition));
  const remaining=rows.filter(r=>!used.has(r.condition));
  return '<div class="completion-footer"><div class="button-row">'+
     '<button type="button" class="btn btn-quiet" data-action="completion-back">'+icon("chevron-left")+' Back</button>'+
     display.map((r,i)=>action(null,r,i===0)).join("")+
   '</div>'+(remaining.length?'<details class="completion-options"><summary>Other useful routes ('+remaining.length+')</summary>'+
    '<div class="completion-route-grid">'+remaining.map(r=>action(null,r)).join("")+'</div></details>':"")+'</div>';
 };


 /** An outcome is a student's own observation, not a prediction or a planned
  * method. Its route-prefixed value is saved with the actual maths record. */
 const journeyOutcomePicker=entry=>{
  if(!entry)return "";
  const state=getState(),route=outcomeRouteForEntry(state,entry);
  if(!route)return '<div class="journey-outcome-intro">'+icon("compass")+
   '<p><strong>Want result-specific mathematical advice?</strong> You can choose an investigative journey in Planning. Your mathematics and writing are still yours to decide; selecting a route is optional.</p></div>';
  if(!actualMathematics(entry))
   return '<div class="journey-outcome-intro" data-journey-outcome-waiting>'+
    icon("lightbulb")+'<p><strong>After producing your mathematics:</strong> confirm your real result in Section 2. Then choose what it actually shows; your planned '+e(route.title)+' route does not determine the finding.</p></div>';
  const opts=journeyOutcomeOptions(state,entry),selected=selectedJourneyOutcome(state,entry);
  return '<section class="journey-outcome-picker" data-journey-outcome-picker>'+
   '<div class="journey-outcome-heading">'+icon("compass")+'<div>'+
    '<small>MY INVESTIGATIVE JOURNEY · '+e(route.title)+'</small>'+
    '<strong>What does your actual result suggest?</strong>'+
    '<p>Choose what the evidence supports, not what you expected when Planning. This decision shapes advice for the next mathematical stage.</p>'+
   '</div></div>'+
   entryField("journeyOutcome","My interpretation of this genuine result","",{
    type:"select",options:[["","Still considering — select a finding"],...opts.map(x=>[x.value,x.title])]
   })+
   (journeySelectionIsStale(state,entry)?'<p class="journey-outcome-warning">'+icon("alert-circle")+
    ' Your earlier interpretation belongs to a different investigative route or is no longer available. Select an outcome supported by your current work before using linked advice.</p>':"")+
   (selected?'<div class="journey-outcome-meaning"><strong>Mathematical consequence</strong>'+
     '<p>'+e(selected.next)+'</p><p><strong>Before claiming this:</strong> '+e(selected.check)+'</p></div>':"")+
   '<p class="journey-outcome-honesty">A mathematical outcome must be supported by your actual work. An observed shape is not proof that a model fits. You may choose an uncertain result or conclude responsibly.</p>'+
  '</section>';
 };
 const journeyNextDirections=entry=>{
  const state=getState(),ctx=adaptiveNextDirections(state,entry);
  if(!ctx.route||!actualMathematics(entry))return "";
  if(ctx.status!=="ready"){
   return '<aside class="journey-next-panel journey-next-empty" data-journey-next-state="'+e(ctx.status)+'">'+
    '<strong>'+icon("lightbulb")+' Let your actual result determine what follows</strong>'+
    '<p>'+e(ctx.status==="stale"?
       "The investigative route or mathematical technique has changed. Return to Section 3 and reconsider what this result really shows before using a recommendation.":
       ctx.status==="review"?
       "An earlier result or interpretation needs review before you use it as the basis for new mathematics. Recheck the mathematical connection first.":
       "Select the mathematical meaning of your confirmed result in Section 3. We will then offer relevant next questions and a mathematical reason for each.")+
    '</p></aside>';
  }
  return '<section class="journey-next-panel" data-journey-next-state="ready" aria-label="Result-led mathematical possibilities">'+
   '<div class="journey-next-header">'+icon("sparkles")+'<div>'+
    '<small>BASED ON WHAT YOU ACTUALLY FOUND</small>'+
    '<h4>Where might this result lead?</h4>'+
    '<p>'+e(ctx.chosen.title)+' — consider only a direction that would help answer your aim.</p>'+
   '</div></div>'+
   '<div class="journey-next-options">'+ctx.directions.map((option,i)=>
    '<div class="journey-next-option" data-journey-direction="'+e(option.id)+'">'+
     '<div><small>'+(i===0?"POSSIBLE NEXT QUESTION":"OPTIONAL VALIDITY CHECK")+'</small>'+
      '<strong>'+e(option.question)+'</strong><p>'+e(option.why)+'</p>'+
      (!isAdviceReduced(state)?'<p class="journey-next-check">'+icon("info")+' '+e(option.check)+'</p>':"")+
     '</div>'+
     '<button type="button" class="btn btn-secondary btn-sm" data-action="journey-use-direction"'+
      ' data-entry-id="'+e(entry.id)+'" data-direction="'+e(option.id)+'">'+
      icon(entry.journeyDirection===option.id?"check-circle":"arrow-right")+
      (entry.journeyDirection===option.id?" Selected as my question":" Use this question")+
     '</button></div>').join("")+'</div>'+
   '<p class="journey-next-endpoint">'+icon("flag")+' '+e(ctx.stop)+'</p>'+
   '<p class="journey-next-course">'+icon("book")+' '+e(ctx.courseNote)+'</p>'+
   '<p class="journey-next-note">These are possibilities, not performed mathematics. Selecting one copies an editable question only. Explain the mathematical reason in your own words; no stage is created automatically.</p>'+
  '</section>';
 };
 const journeyPredecessorAdvice=(state,entry)=>{
  const link=stageLinkContext(state,entry),prior=link.prior;
  if(!prior)return "";
  const ctx=link.advice,route=ctx?.route||selectedInvestigativeRoute(state);
  const choice=ctx?.directions.find(x=>x.id===prior.journeyDirection)||ctx?.directions[0];
  const warning=link.needsReview||ctx?.status==="stale"||!actualMathematics(prior);
  return '<section class="journey-stage-link" data-journey-stage-link data-link-state="'+
    (warning?"review":ctx?.status||"unknown")+'">'+
   '<div class="journey-stage-link-head">'+icon(warning?"alert-circle":"route")+'<div>'+
    '<small>YOUR PREVIOUS MATHEMATICAL FINDING</small>'+
    '<strong>'+e(prior.title||"Earlier mathematical result")+'</strong>'+
    (route?'<span>'+e(route.title)+'</span>':"")+
   '</div></div>'+
   (link.finding?'<blockquote>'+e(link.finding)+'</blockquote>':"")+
   (warning?'<p class="journey-stage-link-warning"><strong>Review this connection.</strong> The prior result, route or interpretation has changed, or is no longer confirmed. Re-check the mathematical reasoning before accepting this stage as justified. Your existing writing has been preserved.</p>':"")+
   (!warning&&ctx?.status==="ready"&&choice?
    '<div class="journey-stage-link-advice"><strong>Mathematically sensible next question</strong>'+
     '<p>'+e(choice.question)+'</p><p>'+e(choice.why)+'</p>'+
     '<small>'+e(choice.check)+'</small></div>':
    '<p class="journey-stage-link-reminder">Use the earlier genuine result to justify this choice. A technique planned before seeing the evidence is not by itself a reason to use it.</p>')+
   (entry.journeySourceOutcome&&entry.journeySourceOutcome!==prior.journeyOutcome?
    '<p class="journey-stage-link-warning">The earlier outcome selection was revised. Check whether your own bridge and method still make sense.</p>':"")+
   '<p class="journey-stage-link-note">The proposed question is advice, not a calculation. Use your own work and words in the IA.</p>'+
  '</section>';
 };
 const mathematicalPageLinks=(state,activeIndex)=>{
  const entries=state.entries||[],firstIndices=entries.flatMap((x,i)=>x?.phase==="first"?[i]:[]);
  const later=entries.flatMap((x,i)=>x?.phase==="substantial"?[i]:[]);
  // Several initial diagrams still belong to ONE first mathematical page.
  if(!later.length)return "";
  const firstIndex=firstIndices.includes(activeIndex)?activeIndex:firstIndices.at(-1);
  const indexes=[...(firstIndex===undefined?[]:[firstIndex]),...later];
  return '<nav class="math-stage-page-nav" aria-label="Your mathematical pages">'+
   indexes.map(index=>{
    const entry=entries[index],number=entry.phase==="first"?"First mathematics":
      "Mathematical stage "+(later.indexOf(index)+2);
    const selected=index===activeIndex||entry.phase==="first"&&firstIndices.includes(activeIndex);
    return '<button type="button" class="math-stage-page-link'+(selected?' selected':'')+
      '" data-action="completion-edit-entry" data-index="'+index+'"'+
      (selected?' aria-current="page"':'')+'>'+
      icon(entry.status==="completed"&&filled(entry.result)?"check-circle":"circle")+
      '<span>'+e(number)+'</span></button>';
   }).join("")+'</nav>';
 };
 const stageBranchActions=()=>{
  const s=getState(),active=completeEntry(s),confirmed=active?.status==="completed"&&filled(active.result);
  const advice=active?adaptiveNextDirections(s,active):null;
  const latest=active?.id===s.entries.at(-1)?.id;
  const ready=confirmed&&latest&&(!advice?.route||advice.status==="ready");
  return '<nav class="math-stage-branch" data-math-stage-branch aria-label="Choose your next mathematical stage">'+
   '<div class="math-stage-branch-heading"><strong>Where does your mathematical investigation go next?</strong>'+
   '<p>Another stage is useful when a genuine finding leads to a worthwhile mathematical question. You can also bring your work together in a conclusion.</p></div>'+
   '<div class="math-stage-branch-buttons">'+
    '<button type="button" class="btn btn-primary math-stage-branch-button" data-action="stage-add">'+
      '<span>'+icon("plus-circle")+' Add a new mathematical stage</span>'+icon("arrow-right")+'</button>'+
    '<button type="button" class="btn btn-primary math-stage-branch-button" data-action="stage-conclude">'+
      '<span>'+icon("flag")+' Continue to Conclusion</span>'+icon("arrow-right")+'</button>'+
   '</div>'+
   (!latest?'<p class="math-stage-branch-note">'+icon("info")+
    ' You are reviewing an earlier stage. Open the latest mathematical page before extending the chain.</p>':
    !confirmed?'<p class="math-stage-branch-note">'+icon("info")+
    ' To add another stage, confirm the actual mathematical result in Section 2. You may still conclude.</p>':
    !ready?'<p class="math-stage-branch-note">'+icon("info")+
    ' Confirm what your result establishes in Section 3, then write your question and mathematical justification in Section 4. An uncertain result is valid.</p>':
    '<p class="math-stage-branch-note">'+icon("info")+
    ' Only continue when the result raises a worthwhile question; concluding is equally valid.</p>')+
   '</nav>';
 };
 const conclusionReadiness=state=>{
  const count=state.entries.filter(x=>x?.status==="completed"&&filled(x.result)).length;
  const mathsStages=state.entries.filter(x=>["first","substantial"].includes(x.phase)).length;
  return '<section class="math-conclusion-gate" data-conclusion-gate role="alertdialog" aria-labelledby="math-conclusion-gate-title" tabindex="-1">'+
   '<div class="math-conclusion-gate-top"><span>'+icon("book")+'</span><div>'+
   '<span class="math-conclusion-gate-eyebrow">BEFORE YOU CONCLUDE</span>'+
   '<h2 id="math-conclusion-gate-title">Do you have enough mathematics to answer your aim?</h2></div></div>'+
   '<p>IB Mathematics exploration guidance suggests approximately <strong>12–20 pages</strong> (commonly double-spaced). This is guidance, <strong>not a compulsory page count or grading threshold</strong>. Follow your teacher\'s current requirements.</p>'+
   '<p>Check that your IA contains a well-developed mathematical investigation, actual calculations, diagrams or proofs where useful, interpretation of findings, and appropriate reflection on limitations. Do not add unnecessary mathematics merely to reach a length.</p>'+
   '<p class="math-conclusion-gate-evidence">So far in Pathfinder: <strong>'+count+' confirmed result'+(count===1?"":"s")+'</strong> across <strong>'+mathsStages+' mathematical stage'+(mathsStages===1?"":"s")+'</strong>. This is only a reminder; mathematics written directly in your IA may not be recorded here.</p>'+
   '<div class="math-conclusion-gate-buttons">'+
   '<button type="button" class="btn btn-primary" data-action="conclusion-confirm">'+
    'I have enough material — continue to Conclusion '+icon("arrow-right")+'</button>'+
   '<button type="button" class="btn btn-secondary" data-action="conclusion-cancel">Keep exploring for now</button></div>'+
  '</section>';
 };
 const bridgeFromPrior=()=>{
  const prior=sourceResultForNext(getState());
  if(!prior)return info("Actual mathematics first","When you have a genuine result, record what it shows before choosing another method.");
  return '<div class="completion-evidence-anchor">'+icon("route")+'<div><strong>What your previous mathematics actually established</strong>'+
    '<p>'+e(prior.localTakeaway||prior.interpretation||prior.observationText||prior.result)+'</p>'+
    '<span class="field-hint">'+e(prior.title||"Previous mathematical investigation")+'</span></div></div>';
 };
 const bridgeToActive=()=>{
  const state=getState(),entry=completeEntry(state);
  if(!entry)return info("Start with real mathematical evidence","A later technique should follow an actual finding or a clearly justified initial mathematical question.");
  const earlier=entry.fromEntryId?state.entries.find(x=>x.id===entry.fromEntryId):null;
  const takeaway=earlier&&(earlier.localTakeaway||earlier.interpretation||earlier.observationText||earlier.result);
  const recorded=takeaway||entry.previousTakeaway;
  if(!recorded)return info("Where does this technique come from?","Check the actual result or mathematical question that justifies this section. You need not add mathematics merely to fill a section.");
  return '<div class="completion-evidence-anchor">'+icon("route")+'<div><strong>Earlier finding this section was based on</strong>'+
    '<p>'+e(recorded)+'</p>'+
    (earlier?.reviewNeeded==="yes"?'<p class="field-hint">The earlier mathematical record has an outstanding review flag.</p>':"")+
    '</div></div>';
 };
 const miniList=()=>{
  const state=getState(),items=state.entries;
  if(!items.length)return"";
  return '<div class="completion-mini-list"><strong>My mathematical path</strong>'+
   items.map((st,i)=>'<button type="button" data-action="completion-edit-entry" data-index="'+i+'" class="'+
    (i===state.completion.activeEntryIndex?"current":"")+'"><span>'+(i+1)+'. '+e(st.title||"A mathematical step")+'</span>'+
    '<span class="status-tag '+(st.status==="completed"&&filled(st.result)?"":"pending")+'">'+
    (st.reviewNeeded==="yes"?"Needs review":st.status==="completed"&&filled(st.result)?"Actual result recorded":"Planned, not performed")+'</span></button>').join("")+'</div>';
 };
 const contextualPrompt=(node)=>{
  const entries=C_PROMPTS.filter(p=>p.node===node);
  return entries.length?'<details class="completion-help"><summary>'+icon("lightbulb")+' Help me think</summary>'+
    '<p>'+e(entries[0].prompt)+'</p></details>':"";
 };
 const currentAim=()=>getState().planning.fields.aim||getState().project.aim||"Still to decide";
 const currentBenefit=()=>getState().planning.fields.beneficiary||getState().project.beneficiary;
 const plannedPrediction=()=>getState().planning.fields.prediction||getState().project.prediction;
 const accuracySelector=()=>extra.inputLinks("accuracy")+extra.inputLinks("source");
 const accuracyNote=()=>{
  const state=getState(),accuracy=state.completion.accuracyDecisions,entry=completeEntry(state);
  if(!accuracy.length){
    const earlier=state.planning?.fields?.firstAccuracy;
    if(earlier&&state.completion.current==="C24")
      return info("An earlier planned accuracy decision to confirm",earlier+
        ". This was from Planning: check the actual data source, unit and original resolution before applying it to real calculations.");
    if(earlier&&entry?.phase==="first"&&state.completion.current==="C32")
      return info("Earlier intended accuracy",earlier+
        ". Confirm it against your actual source before choosing graph scales or reporting digits.");
    return"";
  }
  return extra.accuracyNote();
 };
 const entryReviewAlert=()=>{
  const s=getState(),i=s.completion.activeEntryIndex,entry=completeEntry(s);
  if(entry?.reviewNeeded!=="yes")return"";
  const parent=entry.fromEntryId?s.entries.find(x=>x.id===entry.fromEntryId):null;
  const previous=parent&&(parent.localTakeaway||parent.interpretation||parent.observationText||parent.result);
  return '<div class="completion-recheck" role="status"><strong>'+icon("alert-circle")+
    ' Check a mathematical connection</strong><p>'+e(entry.reviewReason||
    "Earlier mathematics changed. Check that this step still follows logically.")+'</p>'+
    (previous?'<p class="completion-recheck-reference"><strong>Updated earlier finding:</strong> '+e(previous)+'</p>':"")+
    '<p>This preserves your result and writing. Review the purpose, calculations and interpretation in your IA before confirming.</p>'+
    '<button type="button" class="btn btn-secondary" data-action="completion-entry-reviewed" data-index="'+i+'">I have checked this connection</button></div>';
 };
 const graphEntryPanel=()=>{
  const state=getState(),entry=completeEntry(state),id=entry?.graphFigureId;
  const fig=id?state.graphStudio?.figures?.find(x=>x.id===id):null;
  if(!fig)return "";
  return '<section class="graph-entry-preview" aria-label="Linked mathematical graph">'+
   '<h3>'+icon("chart")+' Your saved graph draft: '+e(fig.draft.title||"Untitled graph")+'</h3>'+
   '<p>This graph is saved in Pathfinder, not automatically inserted into your IA. Copy or download it, then put it <strong>after</strong> the sentence introducing it. Interpret only real results.</p>'+
   '<div class="graph-svg-wrap">'+renderGraphSvg(fig.draft)+'</div>'+
   renderFigureHandover(state,"graph",fig.draft,icon,e,{id:fig.id,linked:true})+
   '<button type="button" class="btn btn-secondary btn-sm" data-action="graph-open">'+icon("pencil")+' Edit or export this graph</button></section>';
 };
 const traceEntryPanel=()=>{
  const state=getState(),entry=completeEntry(state),id=entry?.imageTraceId;
  const fig=id?state.imageTracer?.figures?.find(x=>x.id===id):null;
  if(!fig)return "";
  return '<section class="trace-entry-panel" aria-label="Linked coordinate tracing">'+
   '<h3>'+icon("image")+' Your saved coordinate tracing: '+e(fig.draft.title||"Untitled tracing")+'</h3>'+
   '<p>This image and its traced points are saved in Pathfinder, not automatically added to the IA. Introduce the figure in your writing before inserting it. Explain your scale and any photographic limitations.</p>'+
   '<div class="trace-entry-photo">'+(fig.draft.view==="math"?renderCleanTraceSvg(fig.draft):renderTraceOverlaySvg(fig.draft))+'</div>'+
   renderFigureHandover(state,"trace",fig.draft,icon,e,{id:fig.id,linked:true})+
   '<button type="button" class="btn btn-secondary btn-sm" data-action="trace-open">'+icon("pencil")+' Edit or export this tracing</button></section>';
 };
 const statEntryPanel=()=>{
  const state=getState(),entry=completeEntry(state),id=entry?.statFigureId;
  const fig=id?state.statStudio?.figures?.find(x=>x.id===id):null;
  if(!fig)return "";
  return '<section class="stat-entry-preview" aria-label="Linked statistical diagram">'+
   '<h3>'+icon("chart")+' Your saved statistical diagram: '+e(fig.draft.title||"Untitled statistical diagram")+'</h3>'+
   '<p>This is a saved, editable figure—not an automatically written IA result. Introduce the figure before displaying it, then discuss what it genuinely reveals, your sampling and its limitations. Keep raw tables out of the IA and appendix.</p>'+
   '<div class="stat-entry-figure">'+renderStatSvg(fig.draft)+'</div>'+
   renderFigureHandover(state,"stat",fig.draft,icon,e,{id:fig.id,linked:true})+
   '<button type="button" class="btn btn-secondary btn-sm" data-action="stat-open">'+icon("pencil")+' Edit or export this diagram</button></section>';
 };
 const tableEntryPanel=()=>{
  const state=getState(),entry=completeEntry(state),id=entry?.tableFigureId;
  const fig=id?state.tableStudio?.figures?.find(x=>x.id===id):null;
  if(!fig)return "";
  return '<section class="ia-table-entry" aria-label="Linked mathematical table">'+
   '<h3>'+icon("table")+' Your saved mathematical table: '+e(fig.draft.title||"Untitled table")+'</h3>'+
   '<p>This formatted table is saved in Pathfinder but not inserted into your IA document. Introduce it before displaying it, then interpret only genuine results. Do not include long raw tables in your IA or appendix.</p>'+
   renderTableSvg(fig.draft)+
   renderFigureHandover(state,"table",fig.draft,icon,e,{id:fig.id,linked:true})+
   '<button type="button" class="btn btn-secondary btn-sm" data-action="table-open">'+icon("pencil")+' Edit or export this table</button></section>';
 };
 const voronoiEntryPanel=()=>{
  const state=getState(),entry=completeEntry(state),id=entry?.voronoiFigureId;
  const fig=id?state.voronoiStudio?.figures?.find(x=>x.id===id):null;
  if(!fig)return "";
  return '<section class="voronoi-entry" aria-label="Linked Voronoi construction">'+
   '<h3>'+icon("map")+' Your saved nearest-site construction: '+e(fig.draft.title||"Untitled Voronoi diagram")+'</h3>'+
   '<p>Introduce this diagram before displaying it in your actual IA. Explain the perpendicular bisectors and the chosen coordinate system; a nearest-site region does not establish the best site, real travel time or service demand.</p>'+
   renderVoronoiSvg(fig.draft)+
   renderFigureHandover(state,"voronoi",fig.draft,icon,e,{id:fig.id,linked:true})+
   '<button type="button" class="btn btn-secondary btn-sm" data-action="voronoi-open">'+icon("pencil")+' Edit or export this construction</button></section>';
 };
 const actualRecord=()=>{
  const st=completeEntry(getState());
  if(!st)return info("No active mathematical record","Start with a purposeful first representation. Later sections should follow what it actually reveals.");
  return '<div class="completion-current-record">'+
    smallSummary("Current mathematical purpose",st.purpose)+
    (st.status==="completed"&&st.result?smallSummary("Actual result",st.result):info("Planned, not performed","Record what you actually did before interpreting it."))+
    (st.resultRef?smallSummary("Location in my own IA document",st.resultRef):"")+'</div>';
 };
 const preflight=(entry)=>{
  const advice=extendedPlanningCheck(getState(),entry);
  if(!advice)return "";
  const reduced=isAdviceReduced(getState());
  return '<section class="route-preflight" aria-label="Before using this mathematical method">'+
    '<div class="route-coach-label">'+icon("lightbulb")+' <span>BEFORE THE MATHEMATICS</span></div>'+
    '<strong>'+e(advice.heading)+'</strong><p>'+e(advice.essential)+'</p>'+
    (!reduced&&advice.depth?'<p class="field-hint">'+e(advice.depth)+'</p>':"")+
    '</section>';
 };
 const coachBlock=(entry,{allowChoices=true,showDepth=true}={})=>{
  const state=getState(),selected=selectedJourneyOutcome(state,entry),legacy=routeAdvice(state,entry),
   advice=selected?{heading:"Your confirmed mathematical finding",essential:selected.next,detail:selected.check}:legacy,
   index=state.entries.findIndex(x=>x.id===entry?.id);
  if(!advice)return "";
  const reduced=isAdviceReduced(state),hasAdaptive=!!outcomeRouteForEntry(state,entry),options=index>=0&&allowChoices&&!hasAdaptive?resultSignalOptions(entry):[];
  const choiceHtml=options.length?
   '<div class="route-coach-choices"><p class="field-label">What does this actual result suggest?</p>'+
   (reduced?field("entries."+index+".resultSignal","My interpretation so far","",{type:"select",
      options:[["","Not yet decided"],...options.map(x=>[x.value,x.title])] }):
    choose("entries."+index+".resultSignal",options,{tight:true,label:"Choose what the mathematical result suggests"}))+
   '</div>':"";
  return '<section class="route-coach '+(reduced?"route-coach-compact":"")+
   '" aria-label="Important mathematical check" data-coach-family="'+e(entry.kind==="scatter"?"scatter":advice.heading)+'">'+
   '<div class="route-coach-label">'+icon("lightbulb")+' <span>MATHEMATICAL CHECK · AT THIS RESULT</span></div>'+
   '<h3>'+e(advice.heading)+'</h3>'+
   choiceHtml+
   '<p class="route-coach-essential">'+e(advice.essential)+'</p>'+
   (showDepth&&advice.depth?'<div class="route-depth-check"><strong>Mathematical development</strong><p>'+e(advice.depth)+'</p></div>':"")+
   (!reduced&&advice.detail?'<p class="route-coach-detail">'+e(advice.detail)+'</p>':"")+
   '</section>';
 };
 const nextCoachQuestions=()=>{
  const state=getState();if(isAdviceReduced(state))return "";
  const prior=sourceResultForNext(state),qs=routeNextQuestions(state,prior);
  if(!qs.length)return "";
  return '<div class="route-next-questions"><p class="field-label">Questions your result might raise (optional)</p>'+
   '<div class="route-next-grid">'+qs.slice(0,2).map((q,i)=>
     '<button type="button" class="route-next-option" data-action="route-coach-next" data-index="'+i+
     '" data-entry-id="'+e(prior.id)+'">'+icon("arrow-right")+'<span>'+e(q)+'</span></button>').join("")+
   '</div><p class="field-hint">Possibilities, not extra calculations you must do. You can also finish with an honest conclusion.</p></div>';
 };
 const actualList=()=>{
  const all=getState().entries.filter(x=>x.status==="completed"&&filled(x.result));
  if(!all.length)return info("No results recorded yet","You can plan the conclusion, but only claim findings from mathematics you have actually carried out.",true);
  return '<div class="completion-actual-list">'+all.map((st,i)=>
    '<div class="context-card">'+icon("check-circle")+'<div><strong>'+e(st.title||"Result "+(i+1))+'</strong><p>'+
    e(st.localTakeaway||st.interpretation||st.observationText||st.result)+'</p></div></div>').join("")+'</div>';
 };
 /** Optional, short catch-up: saved Planning fields produce reusable sparks. */
 const setupQuickSparks=s=>{
  const p=s.planning.fields,missing=v=>typeof v!=='string'||!v.trim(),core=[],extras=[];
  if(missing(p.aim))core.push(field("planning.fields.aim","My investigation question","What would I like to find out mathematically?",{type:"textarea",rows:2}));
  if(missing(p.beneficiary)&&missing(p.motivation)&&missing(p.intendedUse))
   core.push(field("planning.fields.beneficiary","Why would knowing the answer matter?","What might it help me understand or decide?",{type:"textarea",rows:2}));
  if(missing(p.provisionalTitle))extras.push(field("planning.fields.provisionalTitle","A working title (optional)","This can change later"));
  if(missing(p.course))extras.push(field("planning.fields.course","My IB Maths course","",{type:"select",
   options:[["","Choose later"],["AI SL","AI SL"],["AA SL","AA SL"],["AA HL","AA HL"],["AI HL","AI HL"],["other","Not sure / other"]]}));
  if(missing(p.kind))extras.push(field("planning.fields.kind","What sort of investigation?","",{type:"select",
   options:[["","Choose later"],["statistics","Data and statistics"],["modelling","Mathematical modelling"],["theoretical","Theoretical mathematics"],["unsure","Still exploring"]]}));
  if(p.kind==="theoretical"&&missing(p.theoreticalCase))
   extras.push(field("planning.fields.theoreticalCase","Possible mathematical objects or example","e.g. a shape, pattern, conjecture or initial case"));
  else if(p.kind!=="theoretical"&&missing(p.dataSource))
   extras.push(field("planning.fields.dataSource","Likely data route (if needed)","",{type:"select",
   options:[["","Choose later"],["primary","Collect my own data"],["secondary","Use existing published data"],["both","Both routes"]]}));
  const count=core.length+extras.length;
  if(!count)return '<div class="setup-spark-already">'+icon("check-circle")+
   '<div><strong>Your starting sparks are available</strong><p>Your question, purpose and direction can be reused. Edit them from View all sparks or return to Planning.</p></div></div>';
  return '<details class="setup-quick-sparks"'+(!s.planning.completed?' open':'')+'>'+
   '<summary>'+icon("sparkles")+' <span><strong>Quick-fill missing sparks</strong>'+
   '<small>'+count+' useful starting detail'+(count===1?'':'s')+' still open · all optional</small></span>'+icon("chevron-down")+'</summary>'+
   '<div class="setup-quick-sparks-body"><p>Short on time? Add the essentials here, or leave them blank and return later. These are <strong>Planning sparks</strong>, not completed mathematics or IA prose.</p>'+
    core.join("")+
    (extras.length?'<details class="setup-spark-extras"><summary>Add other missing details (optional) '+icon("chevron-down")+'</summary>'+
     '<div>'+extras.join("")+'</div></details>':'')+
   '<p class="setup-quick-sparks-note">For sampling, source checks and recording accuracy, use the full Planning chapter. These shortcuts do not mean Planning is complete.</p></div></details>';
 };
 const startOptions=(n)=>{
  if(isStuckNode(n))return{intro:"Choose one useful way forward. Your original work is preserved.",html:stuck.render()};
  const s=getState(),f=s.completion.fields,p=s.planning.fields,st=completeEntry(s);
  switch(n){
  case "C00":{
   const hasPlan=s.planning.completed===true;
   return{
    intro:"This is the beginning of your written IA. You can use your plan, fill in a few missing sparks, or start now and revisit Planning later.",
    html:'<div class="chapter-onboarding chapter-onboarding-write">'+
      '<div class="chapter-onboarding-banner"><span class="chapter-onboarding-symbol">'+icon("pencil")+'</span>'+
       '<div><span class="chapter-onboarding-eyebrow">CHAPTER 2 · WRITE IN YOUR IA</span>'+
        '<strong>Your writing starts here.</strong>'+
        '<p><b>Write relevant Set up answers directly into your actual IA document</b> as you work: the introduction, sources and methods you really use. Pathfinder stores your notes here; it does not automatically insert text into Word or Google Docs.</p>'+
       '</div></div>'+
      essentialsNudge(s)+
      '<div class="chapter-onboarding-grid chapter-onboarding-grid-setup">'+
       '<section class="chapter-onboarding-tile"><span class="chapter-onboarding-tile-icon">'+icon("compass")+'</span>'+
        '<h3>Planning first is recommended</h3><p>Choose an aim, explore possible mathematics and check sources before writing. Your saved sparks follow you into IA Studio.</p>'+
        '<button type="button" class="onboarding-inline-action" data-action="go-planning">'+icon("arrow-right")+' '+(hasPlan?'Review my Planning':'Complete Planning first')+'</button></section>'+
       renderFieldGuideTeaser(icon,e)+'</div>'+
      setupQuickSparks(s)+
      '<div class="setup-start-actions">'+
       button("Start writing my introduction","setup-start-writing","btn-primary","","arrow-right")+
       (hasPlan?'<span>Your Planning chapter is ready for now; return whenever your aim changes.</span>':
        '<span>You can start without a complete plan. Check sources and permissions before collecting restricted data.</span>')+'</div>'+
      '<details class="setup-other-ways"><summary>Other ways to begin or restore your plan '+icon("chevron-down")+'</summary><div class="button-row">'+
       sourceAction("Continue from completed Planning in this session","Review carried-forward answers")+
       sourceAction("Upload saved planning report PDF/DOCX","Import a Planning PDF or Word file")+
       sourceAction("Start without a saved plan","Review starting details without a saved plan")+'</div></details>'+
     '</div>'
   };
  }
  case "C01":return{intro:"Upload an earlier Pathfinder PDF or Word plan, or continue by entering what you know.",
   html:info("Import is optional","The existing Phase 3 importer lets you compare old and current answers. Uploaded files do not count as teacher approval.")+
    '<div class="button-row">'+button("Choose PDF / Word document","import-report","btn-primary","", "upload")+
    sourceAction("Unreadable/scanned/unsupported file","Continue without a file")+'</div>'
  };
  case "C02":return{intro:"Check what is still true now. A changed plan does not erase the earlier mathematical work.",
   html:smallSummary("Earlier intended beneficiary",p.beneficiary)+
    field("planning.fields.aim","My current investigation aim","A mathematical question I can honestly investigate",{type:"textarea",rows:3})+
    field("planning.fields.motivation","Why I care about this question","My own reason",{type:"textarea",rows:2})+
    field("planning.fields.course","My course","",{type:"select",options:[["","To confirm"],["AA SL","AA SL"],["AI SL","AI SL"],["AA HL","AA HL"],["AI HL","AI HL"],["other","Other / unsure"]]})+
    field("planning.fields.kind","Current type of exploration","",{type:"select",options:[["","To confirm"],["statistics","Statistics"],["modelling","Modelling"],["theoretical","Theoretical"],["unsure","Not sure yet"]]})+
    field("planning.fields.beneficiary","Who might benefit?","Me, a group, or mathematical understanding itself",{type:"textarea",rows:2})+
    field("planning.fields.intendedUse","What might the findings help us understand or decide?","A possible use, not a demonstrated recommendation",{type:"textarea",rows:2})+
    field("planning.fields.prediction","My original tentative prediction / conjecture","Not a result",{type:"textarea",rows:2})+
    F("changedSincePlanning","What has changed since Planning? (optional)","The aim, source, audience, planned technique or timeline",{type:"textarea",rows:2})+
    info("Your writing is preserved","Editing your aim here does not rewrite an introduction or a completed mathematical result. Recheck those passages in your own IA.")
  };
  case "C03":{
   const warnings=completionFlags(s);
   return{intro:"Confirm current restrictions without treating an uploaded report or previous teacher question as permission.",
    html:(warnings.length?warnings.map(x=>info("Worth checking",x,true)).join(""):"")+
      choice("permissionStatus",[
       ["pending","Approval, consent or access still pending"],
       ["unsure","I am unsure what is needed"],
       ["confirmed","I have separately confirmed requirements"],
       ["not-needed","No permission issue applies to my work"]])+
      F("permissionNotes","What restriction or decision still matters?","Do not enter names or identifiable information",{type:"textarea",rows:3})+
      info("Safe work can continue","You can write an introduction, define variables or explore permitted theoretical cases while waiting. Only you and your teacher can confirm school permissions.")
   };
  }
  case "C04":return{intro:"Choose a meaningful task. A section may be revisited whenever the evidence changes; there is no required number of maths sections.",
    html:stageDashboard()+'<button type="button" class="writer-guide-overview" data-action="writer-guide-open">'+icon("book")+' Open the Writer\'s Field Guide '+icon("arrow-right")+'</button>'+miniList()+
      '<div class="button-row">'+sourceAction("Save progress","Save a full project backup")+
      sourceAction("I'm stuck / Something isn't working","I'm stuck")+'</div>'};
  case "C10":{
   const notes=field("scratch.introduction","My own working introduction notes","Optional private notes for yourself, not the final IA text.",{type:"textarea",rows:5});
   const task='<section class="intro-writing-task" aria-labelledby="intro-writing-task-heading">'+
    '<div class="intro-writing-task-head"><span class="intro-writing-task-symbol">'+icon("pencil")+'</span><div>'+
     '<span class="intro-writing-task-eyebrow">YOUR WRITING TASK</span>'+
     '<h2 id="intro-writing-task-heading">Write your introduction</h2>'+
     '<p>In your actual IA document, write a few focused paragraphs that introduce your aim, your motivation and, if useful, a tentative prediction. You do not need to list every technique you might use.</p></div></div>'+
    criterionMarkedWritingBox(notes,["completing:C10:aim","completing:C10:motivation"])+
    '<p class="intro-writing-task-footnote">Your notes here are private to Pathfinder. The <strong>A</strong> and <strong>C</strong> bubbles explain how presentation and personal engagement relate to the writing; they are not marks or an assessment of your draft.</p></section>';
   return{intro:"",
    html:renderWritingStageFlow({
     advice:renderIntroductionWritingAdvice(icon,e,{reduced:isAdviceReduced(s)}),
     sparks:renderIntroductionSparkPrompt(s,icon,e)+renderSparkShelf(s,"C10",{surface:"studio",libraryOnly:true}),
     task,
     examples:renderIntroductionOptionalExamples(icon)
    })+
    '<div class="intro-first-maths-next"><div><strong>Ready for the first piece of mathematics?</strong>'+
      '<p>Your Introduction opens the story. Next, connect your first purposeful mathematical step to your aim, using the choices you made in Planning.</p></div>'+
      '<button type="button" class="btn btn-primary" data-action="completion-open" data-node="C20">'+
       'Introduce my first maths '+icon("arrow-right")+'</button></div>'};
  }
  case "C10E":return{intro:"Compare original fictional introductions, then return to your own investigation.",html:exampleInline(s,{topic:"introduction"})};
  case "C20":{
   const ctx=firstMathsContext(s),placement=f.firstMathsBridgePlacement;
   const covered=placement==="intro";
   const linkHelp=ctx.activeRoute?
     "How would your first step ("+ctx.proposedMove.toLowerCase()+") help address this aim? Do not predict the result.":
     "A sentence or two linking your chosen first mathematical question to the aim, not a list of future techniques.";
   const linkPrompt=criterionMarkedWritingBox(
    F("dataAimLink","How does this first mathematics connect to my aim?",linkHelp,{type:"textarea",rows:3}),
    ["completing:C20:firstBridge","completing:C20:firstChoice"]);
   const where=F("firstMathsBridgePlacement","Have I already explained why I am starting here?","",{
    type:"select",options:[
     ["","Choose when ready"],
     ["intro","Yes — the connection is clear in my Introduction"],
     ["before","No — I will add a short bridge before the first mathematics"],
     ["unsure","I'm not sure yet; I will decide when drafting"]
    ]});
   const introductionLink=covered?
    '<p class="first-maths-link-already">'+icon("check-circle")+
     ' You have already explained this connection in your Introduction. There is no need to repeat it. Begin the mathematics directly.</p>'+
     (f.dataAimLink?'<details class="first-maths-saved-bridge"><summary>Review an earlier bridge note '+icon("chevron-right")+'</summary>'+linkPrompt+'</details>':""):
     '<div class="first-maths-bridge-writing">'+
      '<p class="first-maths-bridge-lead">In your actual IA, introduce the reason for this first step in <strong>one or two sentences</strong> just before the work. If you prefer to make this connection in your Introduction, choose that option above and skip repeating it.</p>'+
      linkPrompt+'</div>';
   const writingPart=(id,number,title,description,content)=>'<section class="first-maths-writing-part" data-first-maths-writing-part="'+id+'">'+
    '<div class="first-maths-writing-part-head"><span class="first-maths-writing-part-number" aria-hidden="true">'+number+'</span>'+
    '<div><h3>'+e(title)+'</h3><p>'+e(description)+'</p></div></div>'+content+'</section>';
   const bridgePart=writingPart("connection","1","Connect your Introduction to the first maths",
    "Make the mathematics follow naturally from your aim. Explain why this is a sensible first step, but do not repeat a clear explanation from the Introduction.",
    '<div class="first-maths-bridge-choice">'+where+introductionLink+'</div>');
   const methodPart=writingPart("method","2a","Introduce and justify your mathematical method",
    "In your actual IA, name the mathematics you are about to use and explain why you selected it. Assume your reader already knows the course mathematics.",
    renderJourneyWritingAdvice(s,"method",icon,e,{reduced:isAdviceReduced(s)})+
    (f.chosenMethod?smallSummary("Earlier named method (editable in the optional Methods step)",f.chosenMethod):"")+
    '<div class="first-maths-primary-writing-field">'+criterionMarkedWritingBox(
      F("methodReason","My method and why I chose it",
       "Introduce the maths, the question it can help answer, and why it fits my aim. No textbook-style explanation of familiar course maths.",
       {type:"textarea",rows:5}),
      ["completing:C20:methodIntroduction","completing:C20:methodJustification"])+'</div>'+
    '<div class="first-maths-first-question">'+
    criteriaField(F("firstPurpose","The mathematical question for my first figure or calculation",
      "What should this first step reveal about my aim? (This answer is reused in the first exploration.)",
      {type:"textarea",rows:2}),"completing:C20:firstPurpose")+
    '<p class="field-hint">This question is saved for your first exploration. It is not another paragraph to repeat in the IA.</p></div>');
   const evaluationPart=writingPart("evaluation","2b","Evaluate the method, alternatives and limitations",
    "Discuss mathematical assumptions or restrictions that matter, consider a plausible alternative, and justify why your method suits this particular aim.",
    renderJourneyWritingAdvice(s,"evaluation",icon,e,{reduced:isAdviceReduced(s)})+
    '<div class="first-maths-primary-writing-field">'+criterionMarkedWritingBox(
      F("firstMethodEvaluation","My mathematical limitations, alternatives and justification",
       "What does this method assume or fail to establish? What alternative could help? Why will I begin with this method for my aim?",
       {type:"textarea",rows:5}),
      ["completing:C20:methodEvaluation","completing:C20:methodSuitability"])+'</div>'+
    '<p class="first-maths-writing-revisit">'+icon("lightbulb")+
    ' If you have not carried out the method yet, describe these as possible limitations. Revisit them after genuine results; do not claim a comparison or difficulty has already occurred.</p>');
   const introFields='<div class="first-maths-writing-sequence" data-first-maths-writing-sequence>'+
    '<div class="first-maths-writing-sequence-head"><span class="first-maths-writing-sequence-icon">'+icon("pencil")+'</span>'+
    '<div><h3>Three short parts of your mathematical story</h3>'+
    '<p>Develop each part in your <strong>actual IA document</strong>. These boxes save your notes in Pathfinder; they do not write or insert paragraphs for you.</p></div></div>'+
    bridgePart+methodPart+evaluationPart+'</div>';
   const dataKind=ctx.sourceKey;
   const routeChecks='<div class="first-maths-route-help"><strong>Optional targeted preparation</strong>'+
    '<p>Use only the checks that matter for your actual source and mathematics. You may return after your first figure or calculation.</p>'+
    '<div class="button-row">'+
    (dataKind==="theoretical"?sourceAction("Theoretical or no-data exploration","Check mathematical definitions"):
     dataKind==="undecided"?
      sourceAction("Statistics with sampled or secondary data","Check sampling")+
      sourceAction("Empirical modelling or measured model inputs","Check model assumptions")+
      sourceAction("Theoretical or no-data exploration","Check mathematical definitions"):
     (p.kind==="statistics"?
      sourceAction("Statistics with sampled or secondary data","Check sampling / population"):
      p.kind==="modelling"?
      sourceAction("Empirical modelling or measured model inputs","Check model assumptions"):
      sourceAction("Statistics with sampled or secondary data","Check sampling when relevant")+
      sourceAction("Empirical modelling or measured model inputs","Check models when relevant")))+
    '</div></div>';
   const sourceDetails='<details class="first-maths-optional-source" data-first-maths-source-details>'+
    '<summary>'+icon("layers")+' <span><strong>Source, sampling and accuracy details (when relevant)</strong>'+
    '<small>Review what you actually obtained; add information beside the mathematics rather than writing a long methods report.</small></span>'+
    icon("chevron-right")+'</summary><div class="first-maths-source-body">'+
    smallSummary("Earlier planned evidence",
      dataKind==="theoretical"?p.theoreticalCase:
      dataKind==="both"?[p.primaryWhat,p.secondaryPublisher||p.secondaryUrl].filter(Boolean).join(" + "):
      dataKind==="secondary"?p.secondaryPublisher||p.secondaryUrl:p.primaryWhat)+
    choice("dataStatus",[
     ["not-started","Not yet obtained"],["candidate","Candidate source — not verified"],
     ["partial","Some usable material"],["ready","Usable material confirmed"],
     ["theoretical","Theoretical mathematics — no dataset"]])+
    extra.sourceManager()+
    F("actualSourceType","Type of actual source","",{type:"select",options:[
     ["","To confirm"],["primary","Primary measurements / collection"],["secondary","Published secondary source"],
     ["theoretical","Mathematical definitions / assumptions"]]})+
    F("actualSource","What evidence or mathematical starting material do I actually have?",
      "Source or mathematical object, not a promised dataset",{type:"textarea",rows:3})+
    F("sourceCitation","Original published source and date (if relevant)","URL, publisher or citation")+
    criterionMarkedWritingBox(F("actualMethod","How did I actually obtain or define it?",
     "Describe only what actually happened; do not invent data collection",{type:"textarea",rows:3}),
     ["completing:C20:source","completing:C20:method"])+
    field("scratch.dataNotes","My earlier source notes","Sources, dates, units and assumptions",{type:"textarea",rows:3})+
    (s.teacher.pendingApproval?info("Permissions still require care",
      "Do not perform affected restricted collection without meeting consent or school requirements.",true):"")+
    routeChecks+'</div></details>';
   const proceed='<div class="first-maths-continue"><div><strong>Ready to show the mathematics?</strong>'+
    '<p>Move to your first real diagram, graph, model, calculation or theoretical case. If the data is not available, prepare the step without inventing results.</p></div>'+
    '<button type="button" class="btn btn-primary" data-action="completion-open" data-node="C30">'+
    'Begin first mathematics '+icon("arrow-right")+'</button></div>';
   return{intro:"Introduce one purposeful mathematical step that connects naturally to your aim. Use your saved source and route choices, but do not treat a plan as a result.",
    html:introFields+proceed+sourceDetails};
  }
  case "C21S":return{intro:"If you have actual observations, record how the population or sample was defined and what can responsibly be inferred.",
   html:F("statisticalPopulation","Population or group the analysis could describe","The true target population, not every person in general")+
    choice("sampleOrCensus",[["sample","Sample"],["census","Attempted census"],["secondary","Existing published observations"],["unsure","Not sure yet"]])+
    F("samplingMethod","How observations were actually selected","Random, stratified, systematic, convenience, already published, etc.")+
    criteriaField(F("samplingRationale","Why is this design relevant to the aim?","One mathematically meaningful reason",{type:"textarea",rows:2}),"completing:C21S:samplingRationale")+
    F("sampleSize","Sample size or relevant counts","Only genuine counts")+
    F("pairing","For paired data, were measurements genuinely matched? (if applicable)","Variables/units from the same observation")+
    criteriaField(F("responseBias","Potential selection, response or group-comparison issue","What could this prevent you generalising?",{type:"textarea",rows:2}),"completing:C21S:responseBias")+
    F("dataCleaning","Missing, filtered or excluded values and why (if applicable)","Do not discard inconvenient data to force a prediction",{type:"textarea",rows:2})
  };
  case "C21M":return{intro:"A useful model depends on explicit inputs, parameters, assumptions and a defensible range.",
   html:F("modelEvidence","What supports the model?","Measured data, secondary values, mathematical assumptions, or a mixture")+
    F("modelInputs","Variables, parameters, units and sources","e.g. L length (cm), t time (s), V volume (cm³)",{type:"textarea",rows:3})+
    criteriaField(F("modelAssumptions","Which simplifications matter?","Their purpose and when they may fail",{type:"textarea",rows:3}),"completing:C21M:modelAssumptions")+
    criteriaField(F("modelDomain","What input range or constraints make sense?","Domain for which the model is intended"),"completing:C21M:modelDomain")+
    F("modelValidation","How could the model be checked, if feasible?","Observed comparisons or a justified simplified case",{type:"textarea",rows:2})+
    F("modelAlternative","An alternative model worth considering (optional)","Only if another form is mathematically plausible")
  };
  case "C21T":return{intro:"A theoretical investigation does not need a pretend dataset or sampling discussion.",
   html:criteriaField(F("theoreticalObject","What mathematical object, structure or conjecture is involved?","State a precise mathematical problem",{type:"textarea",rows:3}),"completing:C21T:theoreticalObject")+
    F("theoreticalCase","One small useful case or potential counterexample","Numerical examples suggest, but do not prove, a general claim",{type:"textarea",rows:2})+
    F("theoreticalAssumptions","Which assumptions, restrictions or terms matter?","Define as needed",{type:"textarea",rows:2})+
    F("theoreticalQuestion","Anything to discuss about course suitability?","Teacher discussion remains optional but useful",{type:"textarea",rows:2})
  };
  case "C22":return{intro:"Explain why your actual approach fits the mathematical question better than one realistic alternative.",
   html:F("alternativeMethod","Another genuinely feasible method","A different source, measurement tool or modelling assumption",{type:"textarea",rows:2})+
    F("chosenMethod","Which method did you actually choose?","Not simply what you planned",{type:"textarea",rows:2})+
    criteriaField(F("methodReason","Why is it suitable for this aim?","What makes the resulting mathematics useful, reliable or interpretable?",{type:"textarea",rows:3}),"completing:C22:methodReason")+
    info("No generic methods essay","Compare only relevant approaches; convenience alone is not a mathematical justification.")
  };
  case "C23":return{intro:"Place collection/source limitations beside the corresponding method, not only at the end.",
   html:F("methodLimitation","Most consequential limitation of your actual source or method","Sampling coverage, variable definitions, source quality or measurement bias",{type:"textarea",rows:3})+
    criteriaField(F("limitationConsequence","How might it affect the result or restrict a conclusion?","State the consequence for this aim",{type:"textarea",rows:3}),"completing:C23:limitationConsequence")+
    F("limitationMitigation","What did you actually do to reduce or check it?","If nothing, explain the honest constraint",{type:"textarea",rows:2})+
    F("limitationAcceptable","What can you still reasonably conclude?","Avoid declaring the limitation harmless without justification",{type:"textarea",rows:2})+
    info("Technique-specific limits come later","Only evaluate correlation, regression or optimisation methods if they were actually used.")
  };
  case "C24":return{intro:"Record one measured quantity at a time. Use its original resolution and real source uncertainty when reporting later results.",
   html:F("accuracyQuantity","Quantity measured or sourced","e.g. reaction time")+
    F("accuracySymbol","Symbol (optional)","e.g. t")+
    F("accuracyUnit","Unit","e.g. seconds")+
    F("accuracyResolution","Instrument/source resolution and uncertainty, if known","Nearest 0.1 s, not automatically ±0.1 s")+
    F("accuracyPolicy","Reasonable display accuracy for calculated results","A justified rounding or exact-vs-approximate convention")+
    criteriaField(F("accuracyReason","Why does that accuracy make sense?","Related input uncertainty, measurement quality or model sensitivity",{type:"textarea",rows:2}),"completing:C24:accuracyReason")+
    button("Record this quantity","completion-record-accuracy","btn-secondary")+
    accuracyRecords()+
    info("No fixed decimal-place rule","Keep guard digits during working, then report outputs to defensible precision. Don't round an exact symbolic answer unnecessarily.")
  };
  case "C25":return{intro:"Introduce a symbol or term when first needed; use meaningful names and consistent units.",
   html:criteriaField(F("variableDefinitions","Important symbols with meanings and units","e.g. h = height in m; t = time in seconds",{type:"textarea",rows:4}),"completing:C25:variableDefinitions")+
    F("specialistTerms","Any important non-mathematical specialist words","Explain only those needed to understand the investigation",{type:"textarea",rows:2})+
    info("Just in time","Define new mathematical symbols before their first use, including those introduced in later sections.")
  };
  case "C26":return{intro:"Check that your first piece of mathematics has a clear purpose, then begin. There is no need to repeat material already introduced in the IA.",
    html:smallSummary("Actual source",f.actualSource||f.theoreticalObject)+
      smallSummary("Mathematical purpose for first step",f.firstPurpose)+
      smallSummary("Method reason (if relevant)",f.methodReason)+
      smallSummary("Mathematical method limitations and alternatives to revisit",f.firstMethodEvaluation)+
      (f.firstMathsBridgePlacement==="intro"?
       info("Already explained in your Introduction","You said your Introduction already connects this first step to your aim. Do not repeat it unless your mathematical starting point has changed."):
       criteriaField(F("dataAimLink","How does this first step support my aim? (review the earlier note)",
        "The same link you may have written on the first-maths screen",{type:"textarea",rows:3}),
        "completing:C26:dataAimLink"))+
      F("dataStatusSummary","One important uncertainty still to resolve (optional)","Sampling scope, permission, parameter quality or missing source",{type:"textarea",rows:2})
  };
  case "C30":{
   const reduced=isAdviceReduced(s),entry=completeEntry(s);
   const plannedMaths=firstMathsContext(s);
   const hasPlannedMove=Boolean(plannedMaths.firstIdea||plannedMaths.activeRoute);
   const genuine=entry?.status==="completed"&&!!entry.result?.trim();
   const cards=(id,num,title,description,html)=>'<section class="show-first-part" data-show-first-part="'+id+'">'+
    '<div class="show-first-part-heading"><span class="show-first-part-number">'+num+'</span><div><h3>'+e(title)+'</h3><p>'+e(description)+'</p></div></div>'+html+'</section>';
   const to=(node,text)=>'<button type="button" class="btn btn-secondary btn-sm" data-action="completion-open" data-node="'+node+'">'+e(text)+' '+icon("arrow-right")+'</button>';
   const context=phase=>renderShowingMathsContext(s,phase,icon,e,{reduced});
   const priorNotes=(f.firstMathsBridgePlacement==="intro"?
     info("You already explained why this follows from your aim","Do not repeat the same bridge sentence before the mathematics. Briefly introduce this particular figure or calculation instead."):
     f.dataAimLink?smallSummary("Why your first maths follows your aim",f.dataAimLink):"")+
     (f.firstMethodEvaluation?smallSummary("Mathematical limitations and alternatives to revisit",f.firstMethodEvaluation):"");
   const first=cards("introduce","1","Introducing diagrams, tables and calculations",
    "Write a sentence before each figure, table or calculation. Tell the reader what they are about to see, what question it answers and any essential definitions.",
    context("introduce")+priorNotes+
    (f.methodReason?smallSummary("Method justified on the previous screen",f.methodReason):"")+
    (f.firstPurpose?smallSummary("Your starting mathematical question",f.firstPurpose):"")+
    '<div class="show-first-writing-field" data-show-first-writing-box="introduce">'+
    criterionMarkedWritingBox(
      (entry?entryField("purpose","My words to introduce this figure, table or calculation",
       "Before Figure 1, explain what it shows, why it is relevant to the aim and any necessary variables or units.",{type:"textarea",rows:5}):
       F("firstOutputIntroduction","My words to introduce this figure, table or calculation",
       "Before Figure 1, explain what it will show, why it is relevant to the aim and any necessary variables or units.",{type:"textarea",rows:5})),
      ["completing:C30:introduceA","completing:C30:introduceB"])+'</div>'+
    '<p class="field-hint">Use this wording in your <strong>actual IA before</strong> the output, not just as a caption. It is different from the earlier explanation of why you selected the method.</p>');
   const second=cards("show","2","Showing your tables, diagrams and calculations",
    "Show genuine mathematical work: clear diagrams or tables where useful, concise calculations, units, citations and defensible precision.",
    context("show")+
    (hasPlannedMove?
     '<div class="show-first-planned-move"><span class="show-first-planned-label">'+icon("sparkles")+
      ' FROM YOUR PLANNING</span><strong>'+e(plannedMaths.proposedMove)+'</strong>'+
      '<p>This is a possible starting point, not a completed result. Change it if your actual evidence suggests something better.</p></div>':
     info("Begin with a useful mathematical question",
      "You can make a purposeful calculation or theoretical case without any diagram. Choose only a representation that helps answer your aim."))+
    '<details class="show-first-tool-picker" data-show-first-tools>'+
      '<summary>'+icon("layers")+' <span><strong>Open diagram &amp; table tools</strong>'+
      '<small>Pathway-aware suggestions, graph plotter, statistics, formatted tables, tracing and Voronoi diagrams</small></span>'+
      icon("chevron-right")+'</summary>'+
      '<div class="show-first-tool-picker-body">'+renderRepresentationHub(s,icon,e)+'</div></details>'+
    renderFirstFigureGallery(s,icon,e,{
      graph:graphEntryPanel,trace:traceEntryPanel,stat:statEntryPanel,
      table:tableEntryPanel,voronoi:voronoiEntryPanel
    })+
    '<p class="show-first-table-rule"><strong>Never include long raw-data tables, including in appendices.</strong> Keep the full dataset in your working files. Use an informative graph, selected rows or a compact summary table if they make the mathematics clearer.</p>'+
    entryReviewAlert()+
    '<div class="show-first-inline-record" data-first-inline-result>'+
      '<div class="show-first-inline-record-heading"><span>'+icon("calculator")+'</span><div><h4>My mathematical work</h4>'+
      '<p>Describe the mathematical output here, whether it is a saved figure, calculation or theoretical case. This is not a second IA paragraph.</p></div></div>'+
      '<div class="show-first-inline-fields">'+
      (entry?
       entryField("title","Title or name of this step","e.g. Comparing the group distributions"):
       F("firstWorkTitle","Title or name of this step","e.g. Comparing the group distributions"))+
      (entry?
       entryField("result","What did you actually produce or calculate?","e.g. A scatter diagram of 32 paired observations, or a maximum of 3.4 m",{type:"textarea",rows:3}):
       F("firstWorkResult","What did you actually produce or calculate?","e.g. A scatter diagram of 32 paired observations, or a maximum of 3.4 m",{type:"textarea",rows:3}))+
      (entry?
       entryField("resultRef","Where does it appear in my IA? (optional)","e.g. Figure 1, Equation 2 or page 4"):
       F("firstWorkLocation","Where does it appear in my IA? (optional)","e.g. Figure 1, Equation 2 or page 4"))+
      (entry?
       entryField("status","Has this mathematical work been produced?","",{type:"select",options:[
        ["planned","Not yet / still checking"],["completed","Yes — I have actually produced this mathematics"]]}):
       F("firstWorkStatus","Has this mathematical work been produced?","",{type:"select",options:[
        ["","Not yet / still checking"],["completed","Yes — I have actually produced this mathematics"]]}))+
      '</div>'+
      '<p class="show-first-inline-honesty">'+icon("info")+
       ' Saved figures and planned calculations are not automatically treated as established findings. Only a genuinely produced result can guide later recommendations.</p>'+
      accuracyNote()+
    '</div>');
   const third=cards("reflect","3","Reflecting on the result, aim and prediction",
    "After showing your real mathematics, explain what the result means for your aim and how it compares with your original prediction, if you made one.",
    context("reflect")+smallSummary("My current aim",currentAim())+
    (plannedPrediction()?smallSummary("My original tentative prediction",plannedPrediction()):
     info("No prediction required","If you did not make a prediction, explain what the actual result establishes about your aim instead."))+
    (genuine?
      '<div class="show-first-result-anchor" data-show-first-result-anchor><strong>'+icon("check-circle")+
      ' Your actual mathematical work from Section 2</strong><p>'+e(entry.result)+'</p>'+
      (entry.resultRef?'<small>In your IA: '+e(entry.resultRef)+'</small>':"")+'</div>':
      '<p class="show-first-draft-note">'+icon("info")+
       ' <strong>Interpret real results.</strong> You can prepare your explanation, but Section 2 must contain a genuine mathematical output confirmed as produced before it becomes evidence for later guidance. A prediction or saved draft is not a finding.</p>')+
    journeyOutcomePicker(entry)+
    '<div class="show-first-writing-field" data-show-first-writing-box="reflect">'+
    criterionMarkedWritingBox(
      (entry?entryField("interpretation","My reflection on what this result means",
       "What does the actual mathematics reveal about my aim? How does it compare with my prediction (if any)? What limits the conclusion?",{type:"textarea",rows:5}):
       F("firstInterpretation","My reflection on what this result means",
       "After producing your first real mathematical result: what does it show about your aim, prediction (if any) and any important limitations?",{type:"textarea",rows:5})),
      ["completing:C30:reflectD","completing:C30:reflectE"])+'</div>'+
    (genuine?to("C34","Inspect a new observation or limitation (optional)"):""));
   const fourth=cards("next","4","Explaining how results lead to the next steps",
    "Use what you have found to introduce a worthwhile next mathematical question, or explain why it is sensible to conclude.",
    context("next")+
    (genuine?smallSummary("Finding to build on",entry.localTakeaway||entry.interpretation||entry.result):
     '<p class="show-first-draft-note">'+icon("info")+
     ' The next step must follow from <strong>real findings</strong>. You can leave these boxes blank until you have interpreted your result.</p>')+
    journeyNextDirections(entry)+
    '<div class="show-first-writing-field" data-show-first-writing-box="next">'+
    criteriaField(F("nextQuestion","What mathematical question remains unanswered? (if any)",
     "Identify a meaningful question raised by the result, or note that you have enough evidence to conclude.",{type:"textarea",rows:3}),"completing:C30:nextC")+
    criterionMarkedWritingBox(F("nextReason","My written bridge to the next step (or conclusion)",
     "Refer to what you actually found. Why would another technique answer the outstanding question, or why is the investigation ready to conclude?",{type:"textarea",rows:5}),
     ["completing:C30:nextD"])+'</div>'+
    (genuine?to("C35","Decide whether another mathematical step is needed"):""));
   return{intro:"Show your first mathematics as a connected mathematical story: introduce each output before displaying it, present it selectively, interpret it against your aim, and justify whatever follows.",
    html:'<div class="show-first-sequence" data-show-first-sequence>'+
      mathematicalPageLinks(s,s.completion.activeEntryIndex)+
      '<p class="show-first-sequence-lead">Four parts of your <strong>actual IA writing</strong>. The boxes below save planning and reflection notes; they do not insert text, tables or calculations into your IA.</p>'+
      first+second+third+fourth+'</div>'};
  }
  case "C31":{
   const returnNode=["C30","C40","C50"].includes(s.completion.editorReturnNode)?
    s.completion.editorReturnNode:"C30";
   const toolOpen=Boolean(s.graphStudio?.open||s.statStudio?.open||s.tableStudio?.open||s.imageTracer?.open||s.voronoiStudio?.open);
   const toolHtml=toolOpen?
     renderRepresentationSwitcher(s,icon,e)+
      (s.voronoiStudio?.open?renderVoronoiStudio(s,icon,e):
       s.tableStudio?.open?renderTableStudio(s,icon,e):
       s.statStudio?.open?renderStatStudio(s,icon,e):
       s.imageTracer?.open?renderImageTracer(s,icon,e):renderGraphStudio(s,icon,e)):
     renderRepresentationHub(s,icon,e);
   return{intro:toolOpen?
     "Create or refine a representation here. Your writing and mathematical decisions remain together on the four-part page for your current stage.":
     "These optional tools support the Show your mathematics section of whichever mathematical stage you are working on.",
    html:toolOpen?toolHtml:
      info("Your diagram choices are part of the writing screen",
       "These tools are optional. Choose a diagram only when it helps the mathematical question in your current stage.")+
      '<button type="button" class="btn btn-secondary" data-action="completion-open" data-node="'+e(returnNode)+'">'+
        icon("arrow-left")+' Back to showing my mathematics</button>'+
      toolHtml+
      '<details class="representation-prelude"><summary>'+icon("pencil")+
        ' Review an earlier first-move choice (optional)</summary><div class="representation-prelude-body">'+
       choice("firstType",[
        ["scatter","Scatter graph with genuine paired data"],["distribution","Distribution or group comparison"],
        ["diagram","Labelled mathematical diagram"],["table","Small numerical table or case"],
        ["calculation","One purposeful calculation"],["theory","Theoretical example or conjecture"],
        ["other","Another suitable representation"],["unsure","Not sure yet"]])+
       criteriaField(F("firstPurpose","Why might this help answer the aim?","The mathematical question it could reveal",{type:"textarea",rows:3}),"completing:C31:firstPurpose")+
      '</div></details>'
   };
  }
  case "C32":return{intro:"Optional first-output details. If you have already introduced your mathematics in the four-part writing screen, do not write the same explanation again.",
   html:actualRecord()+graphEntryPanel()+traceEntryPanel()+statEntryPanel()+tableEntryPanel()+voronoiEntryPanel()+
    entryField("title","A short title for this step","e.g. Inspect a scatter graph")+
    '<details class="representation-prelude"><summary>Review or adjust the purpose (optional, not another IA paragraph)</summary>'+
    criteriaField(entryField("purpose","Mathematical purpose BEFORE it","What question should this graph/calculation help answer?",{type:"textarea",rows:3}),"completing:C32:purpose")+
    '</details>'+
    entryField("technique","Mathematical technique being used","e.g. plot observed paired values")+
    entryField("resultRef","Where will the figure or work appear in my IA?","e.g. Figure 1 in my Word document")+
    F("firstDefinitions","Variables, units or assumptions the reader needs here","Only what is not already defined",{type:"textarea",rows:2})+
    entryField("methodId","Identify an actual method for relevant help (optional)","",{type:"select",options:METHOD_OPTIONS})+
    preflight(st)+
    accuracySelector()+accuracyNote()
  };
  case "C33":return{intro:"Create the actual figure or short calculation in your IA document. Describe what you did here without copying an invented result.",
   html:entryReviewAlert()+actualRecord()+graphEntryPanel()+traceEntryPanel()+statEntryPanel()+tableEntryPanel()+voronoiEntryPanel()+
    entryField("title","Short title for this mathematical result","e.g. Compare the two distributions")+
    entryField("technique","Mathematics actually used","e.g. Compare medians and interquartile ranges")+
    entryChoice("status",[
     {value:"planned",title:"Still planned",icon:"clock"},
     {value:"completed",title:"I have actually produced the figure or calculation",icon:"check-circle"}])+
    entryChoice("kind",[
     {value:"scatter",title:"Scatter graph",icon:"chart"},
     {value:"model",title:"Model or calculation",icon:"calculator"},
     {value:"theory",title:"Mathematical conjecture / proof",icon:"book"},
     {value:"other",title:"Other genuine mathematics",icon:"sparkles"}])+
    criteriaField(entryField("result","What did you actually plot, calculate or find?","Enter only a genuine output, or keep this as planned",{type:"textarea",rows:4}),"completing:C33:title")+
    entryField("resultRef","Where is the figure/equation in my own IA?","Figure 1; Equation 2; page 4")+
    accuracySelector()+
    F("firstPresentation","Check title, labels, axes, units, source and readable precision","Anything you need to fix in the real IA",{type:"textarea",rows:2})+
    accuracyNote()
  };
  case "C34":return{intro:"Look at what your actual representation reveals—not what you expected it to reveal.",
   html:actualRecord()+
    (completeEntry(s)?.kind==="scatter"?entryChoice("observation",[
      {value:"linear",title:"Approximately linear pattern",icon:"chart"},
      {value:"curved",title:"Curved / nonlinear pattern",icon:"route"},
      {value:"unclear",title:"No clear pattern",icon:"circle"},
      {value:"unexpected",title:"Unexpected point or result",icon:"sparkles"}]):"")+
    coachBlock(st,{allowChoices:st?.kind!=="scatter"})+
    criteriaField(entryField("observationText","What can you really observe?","Trend, feature, value, possible counterexample or inconclusive finding",{type:"textarea",rows:3}),"completing:C34:observation")+
    F("firstResultSummary","What is the essential local takeaway?","Use this when deciding what mathematical question should follow",{type:"textarea",rows:2})+
    accuracyNote()
  };
  case "C34A":return{intro:"Accuracy matters here only if it affects what this particular result can responsibly mean.",
   html:actualRecord()+accuracyNote()+
    accuracySelector()+
    criteriaField(F("accuracyForResult","Is the display defensible?","A context-based explanation, not arbitrary decimal places",{type:"textarea",rows:3}),"completing:C34A:accuracyForResult")+
    info("Avoid repeated precision essays","Once justified, apply the decision again only where relevant. Revisit C24 if the underlying source changes.")
  };
  case "C34B":return{intro:"Relate this actual result to your aim, your earlier prediction and its intended benefit.",
   html:entryReviewAlert()+actualRecord()+coachBlock(st,{allowChoices:false})+smallSummary("Your current aim",currentAim())+
    smallSummary("Original prediction or hope (tentative)",plannedPrediction())+
    smallSummary("Why I expected or hoped this",p.predictionWhy||s.project.predictionWhy)+
    smallSummary("Possible beneficiary",currentBenefit())+
    (st?.phase==="first"&&filled(st.interpretation)?
      smallSummary("Your interpretation from Show your mathematics",st.interpretation)+
      '<p class="field-hint">Already written for this result. Edit it on the main first-mathematics screen rather than repeating it here.</p>':
      criteriaField(entryField("interpretation","What does this actual result mean for my aim?","An honest local conclusion based on mathematics I have done",{type:"textarea",rows:4}),"completing:C34B:title"))+
    entryField("localTakeaway","One sentence: what has this section established?","What do I know now, and what remains unanswered?",{type:"textarea",rows:2})+
    F("predictionComparison","How does the result compare with your starting prediction, conjecture or hope?","What did you actually find out? It need not confirm your early expectation.",{type:"textarea",rows:2})+
    F("benefitFinding","What might this mean for the intended beneficiary?","Only if supported by evidence",{type:"textarea",rows:2})+
    '<details class="guidance-insight"><summary>Did this result teach me something new mathematically? (optional)</summary>'+
      entryField("mathsInsight","My genuine new mathematical insight","About the method, proof, connection or conditions—not a routine formula",{type:"textarea",rows:3})+
      '</details>'
  };
  case "C34U":return{intro:"Surprising, unclear or contradictory findings are valuable. Check possibilities without changing observations to fit a prediction.",
   html:actualRecord()+
    F("surpriseReason","What differs from my expectation, or is uncertain?","An outlier, unclear scatter, sign change, counterexample …",{type:"textarea",rows:3})+
    criteriaField(F("surpriseCheck","One plausible mathematical or source-based check","Verify an unusual value, check assumptions or compare an honest alternative",{type:"textarea",rows:3}),"completing:C34U:surpriseCheck")+
    info("No forced result","You can record an unresolved surprise, save, or revise the mathematical plan while keeping the original observation intact.")
  };
  case "C35":return{intro:"One logical bridge from your last actual result to the next mathematics—or recognise that you have enough to conclude.",
   html:bridgeFromPrior()+coachBlock(sourceResultForNext(s),{showDepth:false})+nextCoachQuestions()+
    (sourceResultForNext(s)?.phase==="first"&&filled(f.nextQuestion)?
      smallSummary("Your next question from Show your mathematics",f.nextQuestion):
      criteriaField(F("nextQuestion","What worthwhile mathematical question remains unanswered?","It should arise from the previous local takeaway",{type:"textarea",rows:3}),"completing:C35:nextQuestion"))+
    F("nextMethod","Which technique might answer THAT question?","Course-appropriate if possible; it can be undecided")+
    (sourceResultForNext(s)?.phase==="first"&&filled(f.nextReason)?
      smallSummary("Your earlier justification for the next step",f.nextReason)+
      '<p class="field-hint">This bridge is already saved on the four-part first-mathematics screen. There is no need to rewrite it.</p>':
      criteriaField(F("nextReason","Why would this next technique follow from the previous result?","Explain the bridge BEFORE the new mathematics in your real IA",{type:"textarea",rows:3}),"completing:C35:nextReason"))+
    info("No prescribed number of mathematical sections","Another technique is useful only if it answers a genuine next question. An honest conclusion may be the best next step.")+
    '<div class="button-row">'+sourceAction("Show me relevant NEXT mathematical ideas","Help me think of a next step")+
    (canViewScatterFollowup(s)?sourceAction("Show bivariate options for actual scatter pattern","Interpret my scatter pattern"):"")+
    (canViewPmccFollowup(s)?sourceAction("Pearson r was ACTUALLY calculated: contextual next-step ideas","After actual PMCC"):"")+
    sourceAction("Enough relevant mathematics—bring findings together","Enough to conclude")+'</div>'
  };
  case "C35H":return{intro:"Two optional prompts based on what you actually recorded. Neither is a required extra technique.",
   html:bridgeFromPrior()+suggestionCards()+
    F("nextQuestion","My OWN next mathematical question","You may reject all suggestions",{type:"textarea",rows:2})+
    criteriaField(F("nextReason","Why would answering this follow from my result?","Meaningful mathematical connection",{type:"textarea",rows:3}),"completing:C35H:nextReason")
  };
  case "C35B":return{intro:"Confirm what the actual scatter graph shows before deciding on correlation or fitting a model.",
   html:smallSummary("Last actual scatter result",scatterForNext(s)?.result)+
    choice("scatterPattern",[
     ["linear","Clearly or approximately straight"],
     ["curved","Clearly curved or nonlinear"],
     ["unclear","No clear association"],
     ["unexpected","An unusual point or cluster"],
     ["unsure","Not sure — inspect the graph again"]])+
    coachBlock(scatterForNext(s),{allowChoices:false})+
    info("Pearson's r has a specific purpose","It measures linear association between paired numerical variables. A small r does not establish that there is no relationship of any form.")+
    guides.bivariateHelp(n,{reduced:isAdviceReduced(s)})
  };
  case "C35P":return{intro:"Use this only after you have actually calculated Pearson's correlation coefficient.",
   html:bridgeFromPrior()+coachBlock(sourceResultForNext(s),{allowChoices:false})+
    criteriaField(F("pmccInterpretation","What value or finding did I calculate and what does it mean?","Describe actual direction and strength of LINEAR association",{type:"textarea",rows:3}),"completing:C35P:title")+
    (f.scatterPattern?smallSummary("Observed scatter shape",f.scatterPattern):"")+
    F("nextQuestion","My next question, if another is needed","A model, outlier check, different explanation, or no further calculation",{type:"textarea",rows:2})+
    F("nextReason","Why would that next step help the aim?","The actual r and graph—not a planned coefficient—drive the choice",{type:"textarea",rows:2})+
    info("Association is not causation","Even a strong coefficient does not show that one variable caused another. Avoid forcing a straight-line regression on a curved pattern.")+
    guides.bivariateHelp(n,{reduced:isAdviceReduced(s)})
  };

  case "C40":case "C50":{
   const state=s,entry=completeEntry(state),substantial=entry?.phase==="substantial"?entry:null;
   const idx=state.completion.activeEntryIndex;
   const stageNumber=state.entries.slice(0,idx+1).filter(x=>x?.phase==="substantial").length+1;
   if(!substantial)return{intro:"Your next mathematical stage must follow a genuine previous result.",
    html:info("Return to the first exploration","Return to your first exploration and record what you genuinely calculated, established or discovered before adding another mathematical stage.",true)+
     '<button type="button" class="btn btn-secondary" data-action="completion-open" data-node="C30">'+icon("arrow-left")+' Return to first mathematics</button>'};
   const prior=substantial.fromEntryId?state.entries.find(x=>x.id===substantial.fromEntryId):null;
   const real=substantial.status==="completed"&&filled(substantial.result);
   const priorFinding=prior?(prior.localTakeaway||prior.interpretation||prior.observationText||prior.result):substantial.previousTakeaway;
   const card=(id,number,title,description,content)=>'<section class="show-first-part" data-show-first-part="'+id+'">'+
    '<div class="show-first-part-heading"><span class="show-first-part-number">'+number+'</span>'+
    '<div><h3>'+e(title)+'</h3><p>'+e(description)+'</p></div></div>'+content+'</section>';
   const pageNavigation=mathematicalPageLinks(state,idx);
   const first=card("introduce","1","Connecting to the previous mathematics",
    "Begin from what the previous section actually established. Explain the mathematical question that follows, and why this technique can advance your aim.",
    entryReviewAlert()+
    '<div class="completion-evidence-anchor">'+icon("route")+'<div>'+
      '<strong>Earlier finding this section was based on</strong>'+
      '<p>'+e(priorFinding||"Your previous stage does not yet have a recorded finding.")+'</p>'+
      (prior?'<span class="field-hint">'+e(prior.title||"Previous mathematics")+'</span>':"")+
    '</div></div>'+
    journeyPredecessorAdvice(state,substantial)+
    smallSummary("My investigation aim",currentAim())+
    entryField("title","What mathematical question is this stage investigating?",
     "A specific mathematical question arising from the previous result",{type:"textarea",rows:2})+
    '<div class="show-first-writing-field">'+
     criterionMarkedWritingBox(entryField("bridge","My linking sentence from the previous result",
      "For example: The earlier result raises the question of ..., so I will now investigate ...",{type:"textarea",rows:3}),
      ["completing:"+n+":title"])+'</div>'+
    entryField("purpose","Why is the chosen approach appropriate here?",
     "Link the technique to the previous finding and your overall aim",{type:"textarea",rows:3})+
    '<div class="journey-stage-method"><strong>'+icon("compass")+
     ' The mathematical approach for THIS stage</strong>'+
     '<p>Choose the method you are using or have actually used. This changes the possible outcomes you can select in Section 3; it does not claim that the calculation has been completed.</p>'+
     entryField("methodId","Mathematical method","",{type:"select",options:METHOD_OPTIONS})+
    '</div>'+
    '<details class="math-stage-optional-method"><summary>'+icon("book")+
      ' Review mathematical technique, syllabus understanding and alternatives (optional) '+icon("chevron-right")+'</summary>'+
      entryField("technique","Mathematical technique or argument","e.g. quadratic modelling, integration or a proof")+
      preflight(substantial)+
      entryChoice("knowledge",[
        {value:"syllabus",title:"Within my IB course",icon:"check-circle"},
        {value:"mixed",title:"Mostly familiar, with some new mathematics",icon:"book"},
        {value:"outside",title:"Beyond my course; explanation needed",icon:"book"},
        {value:"unsure",title:"Check my course or ask my teacher",icon:"lightbulb"}])+
      (["mixed","outside"].includes(substantial.knowledge)?
        entryField("unfamiliarComponent","Exactly which idea is new?","Only the unfamiliar part")+
        entryField("knowledgeNotes","How does that unfamiliar mathematics work here?","Definitions and meaningful reasoning",{type:"textarea",rows:3})+
        entryField("understandingExample","A relevant worked step or small demonstration (optional)","A check demonstrating understanding",{type:"textarea",rows:2})+
        entryField("researchSource","Original resource consulted (if relevant)","Link or source"):"")+
      entryField("methodChangeReason","Has a limitation of the earlier work led me to change method? (optional)",
       "Explain an actual adjustment, not an imagined one",{type:"textarea",rows:2})+
    '</details>');
   const second=card("show","2","Showing your tables, diagrams and calculations",
    "Present genuinely performed mathematics with legible notation, meaningful scales, units and precision as appropriate.",
    '<details class="show-first-tool-picker" data-show-first-tools>'+
     '<summary>'+icon("layers")+' <span><strong>Open diagram &amp; table tools</strong>'+
      '<small>Graph plotter, statistics, formatted tables, coordinate tracing and Voronoi diagrams</small></span>'+
      icon("chevron-right")+'</summary>'+
      '<div class="show-first-tool-picker-body">'+
        info("Use the tool for THIS mathematical question",
         "The generator may suggest an option from your original investigative pathway. Use it only if it genuinely helps this stage.")+
        renderRepresentationHub(state,icon,e)+
      '</div></details>'+
    renderFirstFigureGallery(state,icon,e,{
     graph:graphEntryPanel,trace:traceEntryPanel,stat:statEntryPanel,
     table:tableEntryPanel,voronoi:voronoiEntryPanel
    },{scope:"active"})+
    '<div class="show-first-inline-record" data-stage-inline-result>'+
     '<div class="show-first-inline-record-heading"><span>'+icon("calculator")+'</span><div>'+
      '<h4>My mathematical work</h4><p>Record your genuine output here, including work completed in your IA without a diagram generator.</p></div></div>'+
     '<div class="show-first-inline-fields">'+
      entryField("result","What did you actually produce or calculate?",
       "A genuine equation, graph, calculated value, proof or observation",{type:"textarea",rows:3})+
      entryField("resultRef","Where does it appear in my IA? (optional)","Figure, equation or page number")+
      entryField("status","Has this mathematics actually been produced?","",{type:"select",options:[
       ["planned","Not yet / still checking"],["completed","Yes — I have actually completed this work"]]})+
     '</div>'+
     '<p class="show-first-inline-honesty">'+icon("info")+
      ' A saved draft is not automatically a mathematical conclusion. Confirm only work actually carried out.</p>'+
     accuracySelector()+accuracyNote()+
    '</div>');
   const third=card("reflect","3","Interpreting your mathematical result",
    "Explain what the result tells you about your investigation question and aim. Interpret, rather than merely describe, the calculations.",
    (real?'<div class="show-first-result-anchor"><strong>'+icon("check-circle")+
      ' Actual mathematics from Section 2</strong><p>'+e(substantial.result)+'</p></div>':
     '<p class="show-first-draft-note">'+icon("info")+
      ' Write conclusions from actual work only. Section 2 must be completed and confirmed before later stages treat this as a finding.</p>')+
    coachBlock(substantial,{allowChoices:false})+journeyOutcomePicker(substantial)+
    '<div class="show-first-writing-field">'+
     entryField("interpretation","What does this result mean for my aim?",
      "What has the mathematics established, and what can I responsibly infer?",{type:"textarea",rows:5})+
     entryField("localTakeaway","One mathematical takeaway from this stage",
      "A concise, justified finding to connect to the next stage",{type:"textarea",rows:3})+
     entryField("limitations","Important limitation, assumption or uncertainty (if relevant)",
      "Only limitations that affect your result and its interpretation",{type:"textarea",rows:2})+
    '</div>');
   const fourth=card("next","4","Explaining what follows",
    "Does this mathematical result create another worthwhile question, or can you now answer the aim?",
    (real?smallSummary("Finding that could lead to the next step",
       substantial.localTakeaway||substantial.interpretation||substantial.result):
     '<p class="show-first-draft-note">'+icon("info")+
       ' Your next stage should follow a real result, not a prediction or a planned calculation.</p>')+
    journeyNextDirections(substantial)+
    '<div class="show-first-writing-field">'+
      entryField("nextQuestion","What mathematical question remains unanswered? (optional)",
       "A worthwhile question that follows from your finding",{type:"textarea",rows:3})+
      entryField("nextWhy","My bridge to another stage, or explanation for concluding",
       "Justify how another technique would help, or why you now have enough evidence",{type:"textarea",rows:4})+
    '</div>');
   return{intro:"Build on the actual finding from the previous stage. Explain why this mathematics follows, show the work, and interpret what it establishes for your aim—without starting your IA introduction again.",
    html:'<div class="show-first-sequence math-stage-sequence" data-math-stage-page="'+stageNumber+'">'+
      pageNavigation+
      '<p class="show-first-sequence-lead">A separate four-part mathematical page, saved as stage '+stageNumber+
      '. Your earlier stages remain available above; none of these notes are inserted into your IA automatically.</p>'+
      first+second+third+fourth+'</div>'};
  }
  case "C40T":return{intro:"Technology can assist calculations, but your IA should show what mathematical meaning you have understood.",
   html:F("technologyTool","Which software, GDC, code or spreadsheet was actually used?","Name the tool")+
    F("technologyInput","Inputs or mathematical operation used","Variables and transformation",{type:"textarea",rows:2})+
    F("technologyOutcome","What numerical or graphical output was produced?","Real result only",{type:"textarea",rows:3})+
    criteriaField(F("technologyInterpretation","What does that output mathematically mean for the aim?","Your reasoning, not a screenshot with no explanation",{type:"textarea",rows:3}),"completing:C40T:title")
  };
  case "C40D":return{intro:"Check whether the mathematics you ACTUALLY use is appropriate and understood.",
   html:actualRecord()+
    (f.courseLevel&&st?.knowledge==="unsure"?smallSummary("Earlier broad course check to review",f.courseLevel):"")+
    (st?entryChoice("knowledge",[
      {value:"syllabus",title:"Verified within my own IB course",icon:"check-circle"},
      {value:"mixed",title:"Main technique is familiar, but one extension is outside/uncertain",icon:"book"},
      {value:"outside",title:"Verified outside my own course",icon:"book"},
      {value:"unsure",title:"I need to check my course or ask a teacher",icon:"lightbulb"}]):"")+
    criteriaField(F("courseWhy","What mathematical question does this technique answer?","Why it is genuinely suitable for this investigation",{type:"textarea",rows:3}),"completing:C40D:courseWhy")+
    '<details class="guidance-insight"><summary>Check course-level mathematical depth (optional)</summary>'+
      entryChoice("priorLearningOnly",[
        {value:"no",title:"This has course-level mathematical content",icon:"check-circle"},
        {value:"yes",title:"So far this is only prior-learning mathematics",icon:"lightbulb"},
        {value:"unsure",title:"Not sure yet — check with my teacher",icon:"help-circle"}])+
    '</details>'+
    info("Advanced ≠ better","Explain independently researched mathematics you understand when necessary; routine syllabus methods do not need textbook-style tutorials.")
  };
  case "C40L":return{intro:"Explain newly researched mathematics only when first genuinely needed, in your own understanding.",
   html:(st&&st.knowledge==="syllabus"?info("Routine syllabus mathematics","Apply the technique and interpret it; detailed exposition is unnecessary."):"")+
    (st?entryField("researchSource","Mathematics source I actually used (if any)","Reference to a book/article or teacher-approved resource")+entryField("unfamiliarComponent","Exactly what part was new/outside my course?","Do not label routine course techniques advanced without checking")+entryField("understandingExample","A real mathematical explanation or step showing my own understanding","Relevant only if this idea is genuinely unfamiliar",{type:"textarea",rows:3}):"")+
    F("researchedMethod","Which new mathematical idea did I use?","Technique or theorem, and how you found it")+
    criteriaField(F("researchedUnderstanding","What have I learned about how it works?","Definitions, assumptions, a demonstration or small explanation",{type:"textarea",rows:4}),"completing:C40L:title")+
    F("mathsLearning","What did learning this change about my investigation?","A genuine mathematical insight",{type:"textarea",rows:2})+
    info("Use regular course techniques directly","If your technique is on your course, there is usually no need to teach it to the reader.")
  };
  case "C60":return{intro:"Use genuine mathematics to answer your aim, explain its significance and consider a meaningful future mathematical question.",
   html:renderConclusionWorkspace({state:s,e,icon,field,F,criteriaField,
     criterionMarkedWritingBox,currentAim,plannedPrediction,currentBenefit})
  };
  case "C61":return{intro:"What essential answer have your actual results established? An uncertain or negative finding is still legitimate.",
   html:actualList()+guides.conclusionLimitations()+
    criteriaField(F("mainConclusion","The strongest answer I can support","Bring key results together without repeating all calculations",{type:"textarea",rows:4}),"completing:C61:mainConclusion")+
    F("conclusionEvidence","Which two or three actual results support that answer?","Reference genuine figures/equations or earlier local takeaways",{type:"textarea",rows:3})+
    criteriaField(F("conclusionUncertainty","What important uncertainty remains?","Only limitations that materially restrict the answer",{type:"textarea",rows:2}),"completing:C61:uncertainty")
  };
  case "C62":return{intro:"What do the findings really mean for the person or purpose you identified originally?",
   html:smallSummary("Earlier intended use",p.intendedUse)+smallSummary("Earlier prediction IF TRUE",p.predictionImplication)+
    criteriaField(F("conclusionBenefit","What can the actual results tell that audience?","Meaningful, appropriately cautious interpretation",{type:"textarea",rows:3}),"completing:C62:benefit")+
    F("conclusionAdvice","What could reasonably be recommended or decided, if anything?","Only evidence-supported advice, not a promised positive result",{type:"textarea",rows:3})+
    info("Inconclusive mathematics is useful too","You can explain that the evidence does NOT justify the advice originally hoped for.")
  };
  case "C63":return{intro:"An extension should arise from the mathematics you found, not a generic request for more data.",
    html:criteriaField(F("conclusionExtension","One mathematical question that might follow, if meaningful","Optional and different from work already done",{type:"textarea",rows:3}),"completing:C63:extension")+
      info("No extension is also fine","You do not need a speculative future-work paragraph if the investigation has reached a sensible stopping point.")
  };
  case "C64":return{intro:"Keep the ending a synthesis. Method critiques and intermediate reflections belong beside earlier work.",
    html:F("conclusionFocus","What will I remove or relocate from the conclusion?","Repeats, procedural steps, limitations already explained",{type:"textarea",rows:3})+
      criteriaField(field("scratch.conclusion","My revised concise conclusion notes","My actual mathematical answer, in my own words",{type:"textarea",rows:5}),"completing:C64:title")+
      smallSummary("Strongest finding",f.mainConclusion)
  };
  case "C70":return{intro:"Review clarity across the actual document, repairing explanations where they originally appear.",
    html:F("presentationIssue","One issue with labels, graphs, flow or layout","What would make it easier for a mathematical reader?",{type:"textarea",rows:3})+
      F("referencesIssue","Are data sources, technology and borrowed techniques referenced?","What needs checking?",{type:"textarea",rows:2})+
      info("Write in the right place","A notation mistake in Figure 2 should be fixed at Figure 2, not explained in the conclusion.")
  };
  case "C70N":return{intro:"Check symbols, units, equations, graphs, exactness and justified approximations in the original locations.",
   html:F("notationIssue","Notation or mathematical presentation to repair","Define new variables, distinguish = and ≈, label units",{type:"textarea",rows:4})+
    accuracyNote()+F("referencesIssue","Citation or source issue to repair","Original data and technology acknowledged",{type:"textarea",rows:2})
  };
  case "C80":return{intro:"Keep the written draft process separate from final submission. Follow the feedback rules actually set by your school.",
   html:choice("draftComplete",[["not-yet","My full IA draft is not ready"],["ready","I have a complete working draft"],
    ["unsure","I need to check requirements"]])+
    F("feedbackAction","One sensible next drafting or feedback action","Draft, seek permitted written comments, or revise",{type:"textarea",rows:2})+
    info("Not automatic permission","The site does not deliver a draft to your teacher or assume another written feedback round is permitted.")+extra.feedback()
  };
  case "C80D":return{intro:"A meaningful teacher draft should be complete enough for feedback, with an initial self-review.",
   html:(filled(f.draftCriteria)?'<details class="completion-help criterion-legacy-notes"><summary>Earlier general A–E draft notes (optional)</summary>'+
      F("draftCriteria","Earlier A–E draft notes","You can still edit these saved notes",{type:"textarea",rows:3})+'</details>':"")+
    choice("draftComplete",[["not-yet","Important sections still incomplete"],["ready","Complete draft for permitted teacher feedback"],
    ["unsure","Need to check"]])+
    F("writtenFeedback","What written feedback did I actually receive, if any?","Private revision notes; no invented teacher response",{type:"textarea",rows:4})+
    F("feedbackAction","One specific correction and how I will verify it","Change the original passage or mathematics",{type:"textarea",rows:2})+extra.review("draft")+extra.feedback()
  };
  case "C90":return{intro:"This is a final self-check, not a predicted assessment mark.",
   html:actualList()+smallSummary("School final date from Planning",p.milestoneSchoolFinal)+
     field("scratch.finalReview","Existing revision notes (editable)","The details I was already checking",{type:"textarea",rows:3})+
     F("finalRequirements","Which school requirements do I need to confirm?","Deadline, identifying details, citation style, length or spacing",{type:"textarea",rows:2})
  };
  case "C90F":return{intro:"Locate genuine evidence for criteria A–E and check the finished document's mathematical accuracy and readability.",
   html:field("scratch.finalReview","My earlier review notes (editable)","Revisit what still needs correcting",{type:"textarea",rows:3})+
    (filled(f.finalCriteria)?'<details class="completion-help criterion-legacy-notes"><summary>Earlier general A–E final notes (optional)</summary>'+
      F("finalCriteria","Earlier A–E final notes","You can still edit these saved notes",{type:"textarea",rows:3})+'</details>':"")+
     F("finalProofread","What still needs proofreading or verifying?","Notation, ≈, units, diagrams, precision, source links, page numbers",{type:"textarea",rows:3})+
     F("finalRequirements","Confirmed submission and formatting requirements","School guidance, not assumed IB deadlines",{type:"textarea",rows:2})+extra.review("final")+extra.feedback()
  };
  case "C91":return{intro:"Keep the whole project: the original plan, mathematical records, writing notes, and stage progress.",
   html:button("Download complete progress backup (.json)","export-json","btn-primary","", "download")+
     info("PDF/Word are Planning-only","Your downloadable JSON project contains actual mathematical steps, interpretations and writing notes. PDF/Word planning reports do not.")+
     info("Saved locally","Autosave is on this device only. Use the JSON file if you want to move to another device or safeguard your progress.")
  };
  case "C96":return{intro:"A writing cue for the exact work you came from, using your actual choices and results.",
   html:info("Your current work is preserved","Use the optional cue below if it helps. If you have already addressed or dismissed the relevant guidance, no new writing is required. Return to your saved work when ready.")
  };
  default:return{intro:"Review a meaningful mathematical decision. Continue when you are ready.",html:""};
  }
 };
 function accuracyRecords(){
  const c=getState().completion,decisions=c.accuracyDecisions;
  return decisions.length?'<div class="completion-mini-list"><strong>Recorded quantities and precision policies</strong>'+
   decisions.map(x=>'<div class="completion-accuracy-item"><strong>'+e(x.quantity)+'</strong>'+
   '<span>'+e((x.symbol?x.symbol+" · ":"")+(x.unit||"no unit")+(x.resolution?" · "+x.resolution:""))+'</span>'+
   '<p>'+e(x.policy)+(x.reason?" — "+e(x.reason):"")+'</p></div>').join("")+'</div>':"";
 }
 function suggestionCards(){
  const suggestions=completionSuggestions(getState());
  return suggestions.length?'<div class="completion-suggestions"><p class="field-label">Optional questions based on your actual finding</p>'+
   suggestions.map(([title,desc],i)=>'<button type="button" class="choice" data-action="completion-suggest" data-index="'+i+'">'+
    '<span class="choice-symbol">'+icon("lightbulb")+'</span><span class="choice-body">'+
    '<span class="choice-title">'+e(title)+'</span><span class="choice-subtitle">'+e(desc)+'</span></span>'+
    icon("arrow-right")+'</button>').join("")+'</div>':info("Record a real result first","These ideas respond to actual evidence, not to your original prediction.");
 }
 function stageDashboard(){return groupedDashboard(getState());}
 const primaryByNode={
  C00:[],C01:["Unreadable/scanned/unsupported file"],C02:["Confirm or update carried-forward information"],C03:["Idea and permissions reviewed"],
  C04:[],C10:["Continue / choose another stage","Edit aim, audience or prediction while writing introduction"],
  C10E:["Return to own introduction"],C20:["Continue / choose another stage"],
  C21S:["Statistical design considered"],C21M:["Model inputs or validation considered"],
  C21T:["No empirical data involved"],C22:["Method selected and reason recorded"],
  C23:["Quantitative measurements or rounded source values","No numerical measurements"],
  C24:["Accuracy/precision decision explained"],C25:["Variables and terms reviewed"],
  C26:["Proceed to first representation","Return to flexible stage dashboard"],
  C30:["Begin purposeful initial exploration"],C31:["Chosen useful initial representation or calculation"],
  C32:["Purpose and symbols defined"],C33:["Figure or brief calculation checked"],
  C34:["Observation made; check accuracy where new, then reconnect to aim/prediction"],
  C34A:["Accuracy/uncertainty meaningfully considered"],
  C34B:["Consistent with prediction, or no prediction, or sufficiently explained","Unexpected, contradicts prediction, or is unclear"],
  C34U:["A plausible explanation or alternative has been considered"],
  C35:["Begin FIRST justified mathematical section (or the next appropriate method)","Begin ANOTHER meaningful mathematical section","Enough relevant mathematics—bring findings together"],
  C35H:["Choose an idea, another method, or none"],C35B:["Approximately straight line","Curved or distinctly non-linear","No clear relationship"],
  C35P:["Useful apparent linear association; prediction/model would benefit aim","Little evidence of LINEAR association in these data","No useful further calculation is necessary"],
  C40:["Continue / choose another stage"],C50:["Continue / choose another stage"],
  C40T:["Continue the active calculation"],C40D:["Current method adequate: continue first maths","Need teacher discussion about suitability"],
  C40L:["Return to the mathematical result and its aim-linked reflection"],
  C60:["Open guided conclusion synthesis"],C61:["Main answer identified or honestly inconclusive"],
  C62:["Meaning for beneficiary considered"],C63:["Next steps recorded or no meaningful extension"],
  C64:["Conclusion complete or provisional"],C70:["Check notation and maths presentation"],
  C70N:["Review finished or resume later"],C80:["Full teacher-draft review before written feedback"],
  C80D:["Full draft prepared"],C90:["Final submission self-review"],
  C90F:["Check complete: save progress"],C91:["Keep working"],
  C95:["I cannot get data","Data are too limited or unusable","Something else"],
  C95D:["Write/revisit introduction","Find other primary/secondary data"],
  C95A:["Inspect alternative sources and method"],C95L:["Check data availability/method"],
  C95Q:["Other/Not sure"],C95N:["Return to my previous work"],C96:["Return to my original stage (with cue status)"]
 };
 function render(){
  const s=getState(),c=s.completion||{current:"C00",stages:{}},node=c.current;
  const activeMath=completeEntry(s);
  const mathOrdinal=(node==="C40"||node==="C50")&&activeMath?.phase==="substantial"?
   s.entries.slice(0,c.activeEntryIndex+1).filter(x=>x.phase==="substantial").length+1:0;
  const label=mathOrdinal?"Mathematical stage "+mathOrdinal+
   (activeMath.title&&activeMath.title!=="Mathematical stage "+mathOrdinal?" · "+activeMath.title:""):
   node==="C00"?"Set up: start writing your IA":node==="C20"?"Introducing your first mathematics":
   node==="C31"?"Diagram & table tools":(titleMap.get(node)||"IA Studio");
  const screen=startOptions(node),stage=completionStage(node,s);
  const progress=stage&&s.completion.stages[stage];
  const warning=completionFlags(s);
  const studioWriting=isStudioWritingNode(node);
  // Criterion title marks move beside their actual written response where practical.
  const fieldBadgeInsteadOfTitle=["C33","C34B","C35P","C40","C50","C40T","C40L","C64"].includes(node);
  const topWarnings=warning.length&&["C00","C02","C03","C04","C20"].includes(node)?
    '<div class="completion-top-warnings">'+warning.slice(0,2).map(x=>info("Review needed",x,true)).join("")+'</div>':"";
  const statusControls=stage&&node!=="C60"&&C_MAJOR_STAGES.some(x=>x.id===stage)&&[stage,"C40","C50"].includes(node)?
    '<div class="completion-status"><span class="field-label">My assessment of this stage (not automatically graded)</span>'+
    '<div class="completion-status-options">'+[
      ["working",STATUS_LABELS.working],["complete",STATUS_LABELS.complete],["needs-review",STATUS_LABELS["needs-review"]]].map(([key,text])=>
     '<button data-action="completion-mark" data-stage="'+e(stage)+'" data-status="'+key+'"'+
     ' aria-pressed="'+(progress===key)+'" class="'+(progress===key?"selected":"")+'">'+e(text)+'</button>').join("")+'</div></div>':"";
  const optionalStudioHelp=studioWriting&&!isAdviceReduced(s)?[
    guides.writingMoment(node,{embedded:true}),guides.mathsHelp(node),guides.limitsHelp(node),
    contextualPrompt(node),resourcePrompt(s)
   ].filter(Boolean).join(""):"";
  const stagedHtml=studioWriting?renderStudioWritingStage(s,node,{
    icon,e,taskIntro:screen.intro,reduced:isAdviceReduced(s),help:optionalStudioHelp,
    taskHtml:screen.html+(screen.extra||"")+(node==="C60"?"":insightCapture(s,node))
   }):screen.html+(screen.extra||"");
  return '<div class="page narrow completing-page">'+tabletNav()+chapterRibbon(s)+
    '<div class="completion-topline"><span>'+icon("route")+' '+e(node==="C04"?"Your IA Studio":(JOURNEY_GROUPS.indexOf(currentGroup(s))+1)+'. '+currentGroup(s).name)+'</span>'+
    '<div class="completion-top-actions"><button type="button" class="advice-mode-toggle" data-action="toggle-advice-mode" aria-pressed="'+isAdviceReduced(s)+'" aria-label="'+(isAdviceReduced(s)?"Show full advice":"Reduce optional advice")+'">'+
      icon(isAdviceReduced(s)?"eye":"eye-off")+' '+(isAdviceReduced(s)?"Show full advice":"Reduce advice")+'</button>'+
    (node==="C04"?"":'<button class="btn btn-quiet btn-sm" data-action="completion-open" data-node="C04">'+icon("layers")+' My stages</button>')+'</div></div>'+
    topWarnings+
    (c.conclusionWarningOpen&&node!=="C60"?conclusionReadiness(s):"")+
    (node!=="C00"&&node!=="C04"&&node!=="C10"&&!studioWriting&&!isStuckNode(node)?'<p class="studio-ia-writing-reminder">'+icon("pencil")+
      ' WRITE IN YOUR IA · Use these prompts to develop your own document; nothing is inserted automatically.</p>':'')+
    '<div class="task-shell'+(node==="C00"?' chapter-onboarding-shell':'')+'" data-source-node="'+e(node)+'">'+
    criterionPageHeading(label,"completing",isAdviceReduced(s)||fieldBadgeInsteadOfTitle?"":node)+
    (node==="C10"||studioWriting?"":'<p class="task-intro">'+e(screen.intro)+'</p>')+
    (node==="C10"||studioWriting?"":insightEcho(s,node))+extra.returnToReview()+
    (studioWriting||isStuckNode(node)||["C00","C04","C10","C10E"].includes(node)||isAdviceReduced(s)?"":criteriaPanel(s))+
    stagedHtml+
    (node==="C00"||node==="C10"||studioWriting?"":insightCapture(s,node))+
    (node==="C00"||node==="C04"||node==="C10"||studioWriting||isStuckNode(node)||isAdviceReduced(s)?"":renderContextualGuide(icon,e,node))+
    (node==="C00"||node==="C10"||studioWriting||isAdviceReduced(s)?"":essentialsNudge(s))+
    (node==="C00"||node==="C10"||studioWriting||isStuckNode(node)||node==="C10E"||isAdviceReduced(s)?"":guides.writingMoment(node,{embedded:node!=="C96"}))+
    (node==="C00"||node==="C10"||studioWriting||isStuckNode(node)||isAdviceReduced(s)?"":guides.mathsHelp(node)+guides.limitsHelp(node)+
    (["C00","C04"].includes(node)?"":contextualPrompt(node)+resourcePrompt(s)))+statusControls+
    (node==="C00"?"":allButtons(node,primaryByNode[node]||[]))+
    (["C30","C40","C50"].includes(node)?stageBranchActions():"")+'</div>'+
    (studioWriting?"":'<p class="small-callout">Only actual mathematics supports a mathematical conclusion. Your planning, predictions and teacher questions remain separate from real findings. No compulsory number of calculations or IA grade.</p>')+
    (studioWriting||["C00","C04"].includes(node)?"":miniList())+'</div>';
 }
 return {viewCompleting:render};
}
