import {createSamplePreview} from "./src/core/sample-preview.js";
import {createIllustrativeSample,SAMPLE_CHOICES} from "./src/core/illustrative-samples.js";
import {captureReturn,restoreReturn} from "./src/ui/return-context.js";
import {STATUS_LABELS,resumeRoute,rememberCheckpoint} from "./src/ui/journey.js";
import {journeyRail} from "./src/ui/journey-views.js";
import {insightCapture} from "./src/ui/insight-threads.js";
import {planningLearningTrail} from "./src/ui/living-journey.js";
import {createExampleController} from "./src/examples/controller.js";
import {createEssentialsController} from "./src/essentials/controller.js";
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
import {C_MAJOR_STAGES,setCompletionNode,moveCompletionRoute,completionBack,markCompletionStage,setCompletionField,addAccuracyDecision,completionSuggestions,sectionForNode,targetForSection,completionStage,completeEntry,latestRealResult,sourceResultForNext,flagDependentMathematics,acknowledgeMathReview} from "./src/completing/engine.js";

import { createProjectViews } from "./src/ui/project-views.js";
import { createProjectState as newState, normalizeProjectState as normalise, persistProjectState, STORAGE_KEY as KEY } from "./src/core/project-state.js";
import { readRecordValue, updateRecordValue } from "./src/core/record-access.js";
import { icon, escapeHtml, cleanUrl, button } from "./src/ui/primitives.js";
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
  createEssentialsController({getState:()=>state,onEdit:data=>{if(!editCriterionReview(state,data))return false;save();return true;},onChangedClose:()=>render()});
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
    return '<div class="field-group"><label class="field-label" for="' + fieldId + '">' + e(label) + '</label>' + input + hint + '</div>';
  };
  const stuckViews=createStuckViews({getState:()=>state,e,icon,field});
  const handoverViews=createHandoverViews({getState:()=>state,icon,e,button,field});
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
    return preview.active?'<aside class="sample-preview-banner" aria-label="Sample preview"><div><strong>'+icon("sparkles")+' Fully worked fictional sample</strong><p>Three linked mathematical steps, Planning and review notes. Invented teaching material only; your investigation is unchanged.</p></div><div class="button-row">'+button("See the sample journey","sample-journey","btn-secondary btn-sm")+button("Return to my investigation","leave-preview","btn-primary")+button("Another sample","open-demos","btn-quiet btn-sm")+'</div></aside>':"";
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
  function sideMilestones() {
    $("#sideMilestones").innerHTML=journeyRail(state);
    $("#pathCount").textContent=state.entries.length;
  }
  function refreshProgress(){
    sideMilestones();
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
        N05V:["Your first mathematical move","You've recorded an intended action. The actual discovery comes after the mathematics."]
      };
      if(sparks[from]&&result.route&&
         (from!=="N01"||(state.planning.fields.provisionalTitle||state.planning.fields.aim)?.trim())&&
         (from!=="N03"||state.planning.fields.dataSource?.trim())&&
         (from!=="N05V"||(state.planning.fields.firstAction||state.planning.fields.figurePurpose)?.trim())){
        toast(...sparks[from]);
      }
    }
  }
  function handleCompletionResult(result){
    if(!result?.ok){toast(result?.error||"Please review this mathematical decision.");return;}
    if(result.targetRoute==="planning"){nav("planning");return;}
    nav("completing");
  }
  let detachIdeaMapGraph=()=>{};
  function render(opts={}) {
    detachIdeaMapGraph();
    const map={home:viewHome,planning:viewPlanning,completing:viewCompleting,path:viewPath,report:viewReport};
    main.innerHTML=previewBanner()+stuckViews.returnBanner()+map[state.route]();
    detachIdeaMapGraph=attachIdeaMapGraph(main);
    if(preview.active)setSaveStatus("Sample preview only");
    filterMathOptions();
    document.querySelectorAll("[data-nav]").forEach(b=>b.classList.toggle("active",b.dataset.nav===state.route));
    sideMilestones();
    if(opts.top){window.scrollTo({top:0,behavior:"auto"});main.focus({preventScroll:true})}
  }
  function nav(route,opts={}) {
    state.route=route;
    if(["planning","completing"].includes(route))state.ui.lastWorkRoute=route;
    if(route==="completing"&&completionStage(state.completion.current,state))state.ui.lastStudioNode=state.completion.current;
    drawerReturn=null;
    if(route==="completing"&&opts.section) {
      const target=targetForSection(opts.section);
      setCompletionNode(state,target,{reason:"stage-navigation"});
    }
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
    setCompletionNode(state,state.entries[index].phase==="first"?"C33":"C40");
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
  function openDrawer(panel) {
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
    }else if(panel==="help"){
      body='<section><p>Pathfinder is a thinking and writing companion. You remain the author of your mathematics and explanations.</p><div class="panel-list">'+
        '<button class="panel-link" data-action="open-stuck">I am stuck '+icon("arrow-right")+'</button>'+
        '<button class="panel-link" data-action="resource-browse">Tools &amp; tutorials '+icon("arrow-right")+'</button>'+
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
      body='<section><p>Browse fully worked fictional investigations: a Planning record, mathematical steps with checked calculations, a justified next step, interpretation, limitations and draft self-review notes. <strong>These are invented teaching examples, not real IA submissions or evidence of a real dataset.</strong></p>'+
        '<div class="panel-list">'+choices.map(({id:key,title:label,description:desc})=>
        '<button type="button" class="panel-link" data-action="load-demo" data-demo="'+key+'"><span><strong>'+e(label)+'</strong><br><span class="text-muted" style="font-weight:400">'+e(desc)+'</span></span>'+icon("arrow-right")+'</button>').join("")+'</div></section>'+
        note("Each sample stays in a separate preview. It includes no real participants, published dataset, teacher approval or IB mark. Return to your own investigation unchanged, or choose another scenario.");
    }else if(panel==="stuck"){
      body=stuckViews.render();
    }
    const titles={resources:"Tools & tutorials",project:"My project",files:"Save & export",help:"Here to help",demos:"Choose a sample",stuck:"Find a way forward", "import-preview":"Review planning import","import-manual":"Recover a plan",handover:"Confirm your starting plan"};
    layer.hidden=false;document.body.classList.add("dialog-open");
    document.querySelectorAll(".topbar,.app-grid,.mobile-nav").forEach(el=>el.inert=true);
    layer.innerHTML='<aside class="drawer'+(panel==="resources"?" resource-drawer":"")+'" role="dialog" aria-modal="true" aria-labelledby="drawerTitle" tabindex="-1"><div class="drawer-header"><h2 id="drawerTitle">'+titles[panel]+'</h2>'+
      '<button class="btn btn-secondary btn-sm" type="button" data-action="close-drawer">'+(panel==="resources"&&resourceSession.parent==="stuck"?"Back to I am stuck":"Return to my work")+' '+icon("x")+'</button></div>'+body+'</aside>';
    $(".drawer",layer).focus();
  }
  function closeDrawer(restore=true) {
    layer.hidden=true;layer.innerHTML="";document.body.classList.remove("dialog-open");
    document.querySelectorAll(".topbar,.app-grid,.mobile-nav").forEach(el=>el.inert=false);
    if(restore){restoreReturn(drawerReturn||captureReturn(lastFocus));drawerReturn=null;}
  }
  function dismissDrawer(){
    if(lastDrawer==="resources"&&resourceSession.parent==="stuck")openDrawer("stuck");
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

  function changeNavAction(action,el) {
    if(action==="resume-work")return nav(resumeRoute(state));
    if(action==="go-home")return nav("home");
    if(action==="go-planning")return nav("planning");
    if(action==="go-studio")return nav("completing"); // Resume the saved C-stage; "Studio overview" remains a separate action.
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
      case "journey-open":
        if(el.dataset.target==="plan")nav("planning");
        else handleCompletionResult(setCompletionNode(state,el.dataset.target,{reason:"journey-navigation"}));
        break;
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
      case "plan-next":
      case "plan-advance":handlePlanningResult(planAutoAdvance(state));break;
      case "plan-route":handlePlanningResult(planningMove(state,el.dataset.condition));break;
      case "plan-back":handlePlanningResult(planningBack(state));break;
      case "plan-edit":handlePlanningResult(planningEdit(state,el.dataset.node));break;
      case "path-plan":{
        const map={"0":"N00","1":"N01","5":"N03E"};
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
        if(!chooseMathRoute(state,id)){toast("That investigative route could not be saved.");break;}
        save();render();
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
         "Optional advice reduced. Essential mathematical checks remain visible.":"Full contextual advice restored.");
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
      case "completion-route":handleCompletionResult(moveCompletionRoute(state,el.dataset.condition));break;
      case "completion-open":handleCompletionResult(setCompletionNode(state,el.dataset.node,{reason:"student-revisit"}));break;
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
      case "open-panel":lastFocus=el;openDrawer(el.dataset.panel);break;
      case "close-drawer":dismissDrawer();break;
      case "load-demo":
        demo(el.dataset.demo);break;
      case "export-json":exportJson();break;
      case "export-plan-pdf":void exportPlanningDocument("pdf");break;
      case "export-plan-docx":void exportPlanningDocument("docx");break;
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
  document.addEventListener("click",evt=>{
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
      ["resume-work","go-home","go-planning","go-path","go-report","go-studio","open-files","open-demos","open-stuck"].includes(action.dataset.action))closeDrawer(false);
      clickAction(action);return;}
    if(evt.target===layer)dismissDrawer();
  });
  document.addEventListener("input",evt=>{
    const target=evt.target;
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
      updateBoundField(target.dataset.bind,target.value);
      save();refreshSavedSpark(target.dataset.bind);
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
  document.addEventListener("change",evt=>{
    const target=evt.target;
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
       ["planning.fields.primarySamplingMethod","planning.fields.primarySamplingFrame",
        "planning.fields.primaryAccuracyBasis","planning.fields.secondaryAccuracyBasis"].includes(path)||
       ["completion.fields.scatterDetail","completion.fields.scatterAimRelevance",
        "entries."+state.completion.activeEntryIndex+".methodId",
        "entries."+state.completion.activeEntryIndex+".accuracyRef"].includes(path)||
       /^entries\.\d+\.resultSignal$/.test(path)||
       (/^entries\.\d+\.result$/.test(path)&&["C40","C50"].includes(state.completion.current)&&
        state.entries[Number(path.split(".")[1])]?.status==="completed")){
       render();
       if(/^entries\.\d+\.resultSignal$/.test(path)){
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
      if(file.size>2_000_000)throw new Error("That backup is too large for this prototype.");
      const imported=normalise(JSON.parse(await file.text()));
      if(!window.confirm("Replace the current local project with this backup?"))return;
      state=imported;state.route="home";save();closeDrawer();render({top:true});toast("Project backup restored.");
    }catch(err){window.alert("This file could not be imported. "+err.message);}
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
  // Welcome: current route from a previous session should always remain reachable and understandable.
  render();
})();