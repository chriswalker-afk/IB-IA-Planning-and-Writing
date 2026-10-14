import {createPlanningEnvelope,getFieldDiff,mergePlanningEnvelope} from "./src/handover/schema.js";
import {modelFromEnvelope,suggestedFilename} from "./src/handover/report-model.js";
import {createHandoverViews} from "./src/ui/handover-views.js";
import { planningMove, planAutoAdvance, planningBack, planningEdit, applyPlanningField, toggleMath, syncPlanningToProject, setPlanCurrent, planningFlags } from "./src/planning/engine.js";
import { createPlanningViews } from "./src/ui/planning-views.js";
import { createStudioViews } from "./src/ui/studio-views.js";
import { createProjectViews } from "./src/ui/project-views.js";
import { createProjectState as newState, normalizeProjectState as normalise, persistProjectState, STORAGE_KEY as KEY } from "./src/core/project-state.js";
import { readRecordValue, updateRecordValue } from "./src/core/record-access.js";
import { icon, escapeHtml, cleanUrl, button } from "./src/ui/primitives.js";
import { referenceNodeForPrototypeStep } from "./src/core/prototype-bridge.js";
/* IA Pathfinder — interactive design prototype
   Student-authored notes only; branching examples are illustrative, not the complete IA flowchart engine. */
(() => {
  "use strict";
  const $ = (s, root = document) => root.querySelector(s);
  const e = escapeHtml;
  let state = newState();
  let lastFocus = null;
  let lastDrawer = "";
  let pendingImport = null;
  let importSelected = new Set();
  let exportBusy = false;
  let toastHandle = null;
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) state = normalise(JSON.parse(saved));
  } catch(err) { console.warn("Unable to restore saved prototype", err); }
  const main = $("#main");
  const layer = $("#drawerLayer");
  const planTitles = ["Your starting point","Shape your question","Who might benefit?","Choose a direction","Your data or starting material","Is it feasible?","Plan your mathematics","Make a prediction","Your first mathematical move","Your planning snapshot"];
  const studioSections = [
    {id:"intro",name:"Introduction",sub:"Set out your purpose and motivation",icon:"pencil"},
    {id:"data",name:"Data & methods",sub:"Record what you actually have and did",icon:"flask"},
    {id:"math",name:"Mathematical journey",sub:"Explore, interpret, and decide what follows",icon:"chart"},
    {id:"conclusion",name:"Conclusion",sub:"Bring the key findings together",icon:"flag"},
    {id:"review",name:"Final review",sub:"Check communication and prepare your own draft",icon:"check-circle"}
  ];
  const filled = value => typeof value === "string" ? !!value.trim() : !!value;
  const hasPlan = () => state.planning.visited.length > 0 || state.ui.planMax > 0 || filled(state.project.aim) || filled(state.project.idea);
  const hasStudio = () => state.entries.length > 0 || Object.values(state.scratch).some(filled);
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
  const handoverViews=createHandoverViews({getState:()=>state,icon,e,button,field});
  const getPath = path => readRecordValue(state,path);
  const putPath = (path,value) => updateRecordValue(state,path,value);
  function updateBoundField(path,value) {
    if(path.startsWith("planning.fields.")){
      const before=getPath(path),ok=applyPlanningField(state,path.slice("planning.fields.".length),value);
      if(ok&&before!==value&&state.handover?.confirmedAt){state.handover.confirmedAt="";state.handover.needsReview=true;}
      return ok;
    }
    const changed=putPath(path,value);
    if(changed&&state.handover?.confirmedAt&&(path.startsWith("planning.fields.")||path.startsWith("project."))){
      state.handover.confirmedAt="";state.handover.needsReview=true;
    }
    // Editing the project-context drawer must not leave the Planning record stale.
    const mirror={"project.aim":"aim","project.course":"course",
      "project.beneficiary":"beneficiary","project.precision":"firstAccuracy"};
    if(changed&&mirror[path])applyPlanningField(state,mirror[path],value);
    return changed;
  }
  function save() {
    try { persistProjectState(state,localStorage); setSaveStatus("Saved on this device"); }
    catch { setSaveStatus("Could not save — export a backup",true); }
  }
  function setSaveStatus(message,error=false) {
    const el=$("#saveStatus");
    if(el){el.innerHTML='<span class="save-dot"></span> ' + e(message);el.classList.toggle("error",error);}
  }
  function toast(text) {
    const el=$("#toast");el.textContent=text;el.classList.add("show");
    clearTimeout(toastHandle);toastHandle=setTimeout(()=>el.classList.remove("show"),3000);
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
  const {viewCompleting,mathDefault,currentMath,suggestions}=createStudioViews(viewDependencies);
  const {viewHome,viewPath,viewReport,tabletNav}=createProjectViews(viewDependencies);
  function sideMilestones() {
    const items=[
      ["Your idea",filled(state.project.idea)||filled(state.project.aim),"plan",0],
      ["Your purpose",filled(state.project.beneficiary),"plan",1],
      ["Planning checkpoint",state.planning.completed,"plan",5],
      ["Actual mathematics",state.entries.some(x=>x.status==="completed"),"studio","math"],
      ["Conclusion",filled(state.scratch.conclusion),"studio","conclusion"]
    ];
    $("#sideMilestones").innerHTML=items.map(([title,done,target,index],i)=>
      '<button type="button" class="side-milestone '+(done?"done":i===0?"active":"")+'" data-action="'+(target==="plan"?"path-plan":"studio-"+index)+'" '+(target==="plan"?'data-index="'+index+'"':"")+'>'+
      '<span class="dot">'+(done?icon("check"):i+1)+'</span><span>'+e(title)+'</span></button>').join("");
    $("#pathCount").textContent=state.entries.length;
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
    if(result.route?.to==="C00"||result.completePlanning===true&&result.route?.to==="C00"){
      nav("completing",{section:"overview"});return;
    }
    nav("planning");
  }
  function render(opts={}) {
    const map={home:viewHome,planning:viewPlanning,completing:viewCompleting,path:viewPath,report:viewReport};
    main.innerHTML=map[state.route]();
    filterMathOptions();
    document.querySelectorAll("[data-nav]").forEach(b=>b.classList.toggle("active",b.dataset.nav===state.route));
    sideMilestones();
    if(opts.top){window.scrollTo({top:0,behavior:"auto"});main.focus({preventScroll:true})}
  }
  function nav(route,opts={}) {
    state.route=route;
    if(opts.section)state.ui.studioSection=opts.section;
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
    state.ui.mathIndex=index;state.ui.mathPhase="work";nav("completing",{section:"math"});
  }
  function demo(kind) {
    const next=newState();
    next.demo=kind;
    next.route="completing";next.ui.planStep=9;next.ui.planMax=9;next.ui.studioSection="math";next.ui.mathPhase="interpret";
    const p=next.project;
    Object.assign(p,{
      ideaStatus:"yes", idea:"Sleep and reaction time",aim:"How does hours of sleep relate to reaction time in a sample dataset?",
      beneficiaryType:"me",beneficiary:"Understand what the data could tell us about changes in reaction time.",
      course:"AA SL",kind:"statistics",dataSource:"secondary",dataDetails:"An illustrative paired-variable dataset (sample only; not a real imported source).",
      dataStatus:"ready",permissions:"unknown",readiness:3,ease:4,mathsArea:"relationships",
      prediction:"Reaction time may improve with more sleep.",predictionWhy:"Sleep might influence alertness.",
      firstMove:"graph",precision:"Report calculated values only to precision justified by source measurements."
    });
    const st=mathDefault(); st.status="completed";st.title="Inspect the first scatter graph";st.purpose="Identify whether the data suggest a useful relationship before choosing a model.";st.technique="Plot paired measurements on a scatter graph";st.kind="scatter";st.knowledge="syllabus";
    if(kind==="linear"){st.observation="linear";st.result="Illustrative points appear to follow an approximately straight, downward pattern.";st.observationText="There is an approximately linear decrease in reaction time as sleep increases.";st.interpretation="This may be useful for the aim, but a scatter plot alone does not establish causation.";}
    if(kind==="curved"){st.observation="curved";st.result="Illustrative points bend rather than following a straight line.";st.observationText="The apparent relationship is curved and may level off.";st.interpretation="A straight-line model may miss the structure; considering a suitable curved model could be meaningful.";}
    if(kind==="unclear"){st.observation="unclear";st.result="Illustrative points show no obvious systematic relationship.";st.observationText="There is no clear apparent pattern.";st.interpretation="This suggests caution about predicting reaction time from sleep using these observations alone.";}
    if(kind==="unexpected"){st.observation="unexpected";st.result="Most illustrative points cluster, with one unusual observation.";st.observationText="A single point lies noticeably outside the main cluster.";st.interpretation="It may be worth checking the point before using a fitted model or claiming an overall pattern.";}
    if(kind==="theory"){
      Object.assign(p,{idea:"Numerical patterns",aim:"Can a pattern observed in small cases be generalised and proved?",beneficiaryType:"curiosity",beneficiary:"Understand why a mathematical relationship holds.",kind:"theoretical",dataSource:"",dataDetails:"Small illustrative numerical cases.",dataStatus:"theoretical",mathsArea:"proof",prediction:"The pattern might generalise.",predictionWhy:"It appears in several cases.",firstMove:"theory"});
      Object.assign(st,{title:"Explore initial numerical cases",purpose:"Look for a plausible mathematical conjecture.",technique:"Numerical reasoning",kind:"theory",observation:"",result:"Illustrative small cases suggest a repeatable pattern.",observationText:"Several numerical examples support a tentative conjecture.",interpretation:"Examples suggest a question but cannot establish a general theorem."});
    }
    // Sample projects also have a genuine Planning record for document export.
    // These values remain labelled as fictional; the graph result stays separate.
    for(const [key,value] of Object.entries({
      idea:p.idea,aim:p.aim,beneficiaryType:p.beneficiaryType,
      beneficiary:p.beneficiary,course:p.course,kind:p.kind,
      dataSource:p.dataSource,prediction:p.prediction,predictionWhy:p.predictionWhy,
      firstAction:p.firstMove,firstAccuracy:p.precision
    })){
      applyPlanningField(next,key,value);
    }
    if(kind!=="theory"){
      applyPlanningField(next,"secondaryPublisher","Illustrative data only — no actual publisher");
      applyPlanningField(next,"secondaryStatus","unsure");
      applyPlanningField(next,"dataReadiness","3");
      applyPlanningField(next,"practicalEase","4");
    }else{
      applyPlanningField(next,"theoreticalCase","Illustrative small-number cases");
    }
    next.entries=[st];next.ui.mathIndex=0;
    state=next;save();closeDrawer();render({top:true});toast("Sample loaded — every result is clearly labelled as illustrative.");
  }
  function openDrawer(panel) {
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
      body='<section><h3>Planning document · take it with you</h3>'+
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
    }else if(panel==="help"){
      body='<section><p>Pathfinder is a thinking and writing companion. You remain the author of your mathematics and explanations.</p><div class="panel-list">'+
        '<button class="panel-link" data-action="open-stuck">I am stuck '+icon("arrow-right")+'</button>'+
        '<button class="panel-link" data-action="go-path">How do I see my journey? '+icon("arrow-right")+'</button>'+
        '<button class="panel-link" data-action="open-files">How do I keep my work safe? '+icon("arrow-right")+'</button>'+
        '<button class="panel-link" data-action="open-demos">Try an illustrative sample '+icon("arrow-right")+'</button></div></section>'+
        '<section><h3>A useful rhythm</h3><p>Ask a mathematical question → do real mathematics → interpret the result in context → choose what genuinely follows. Repeat only when there is a reason.</p></section>'+
        '<p class="drawer-footer">Planning and document handover are available. The detailed Completing logic is still being developed. Pathfinder does not calculate marks, validate sources, or approve permissions.</p>';
    }else if(panel==="import-preview"){
      body=pendingImport?handoverViews.preview(pendingImport,importSelected):
        handoverViews.manual("No planning document has been selected.");
    }else if(panel==="import-manual"){
      body=handoverViews.manual(pendingImport?.reason);
    }else if(panel==="handover"){
      body=handoverViews.confirmation();
    }else if(panel==="demos"){
      const choices=[
        ["linear","An approximately linear pattern","Could modelling or quantifying correlation be useful?"],
        ["curved","A curved pattern","What if a straight line isn't suitable?"],
        ["unclear","No clear relationship","An inconclusive outcome can still be meaningful."],
        ["unexpected","An unexpected outlier","How might that change the interpretation?"],
        ["theory","A theoretical investigation","What follows from a tentative conjecture?"]
      ];
      body='<section><p>Explore how the guidance reacts to different actual findings. All examples are <strong>fictional demonstrations</strong>, not real student data.</p>'+
        '<div class="panel-list">'+choices.map(([key,label,desc])=>
        '<button type="button" class="panel-link" data-action="load-demo" data-demo="'+key+'"><span><strong>'+e(label)+'</strong><br><span class="text-muted" style="font-weight:400">'+e(desc)+'</span></span>'+icon("arrow-right")+'</button>').join("")+'</div></section>'+
        note("Loading a sample replaces your current local project. Download a backup first if needed.",true);
    }else if(panel==="stuck"){
      const noData=state.project.dataStatus==="not-started";
      body='<section><p>You do not need to invent results or force a technique. Choose one small, useful action.</p><div class="panel-list">'+
        '<button class="panel-link" data-action="studio-intro"><span>Write or refine a short introduction</span>'+icon("arrow-right")+'</button>'+
        '<button class="panel-link" data-action="studio-data"><span>Check what evidence or assumptions are available</span>'+icon("arrow-right")+'</button>'+
        '<button class="panel-link" data-action="go-planning"><span>Revisit my aim or planned method</span>'+icon("arrow-right")+'</button>'+
        '<button class="panel-link" data-action="studio-math"><span>Explore a theoretical or preliminary case</span>'+icon("arrow-right")+'</button></div></section>'+
        (noData?note("No data yet? Define variables or terms, check a genuine source, draft a prediction, or work on a small theoretical case clearly labelled as such."):"")+
        '<p class="drawer-footer">If consent, privacy or safety is unresolved, discuss the affected activity with your teacher before proceeding.</p>';
    }
    const titles={project:"My project",files:"Save & export",help:"Here to help",demos:"Choose a sample",stuck:"Find a way forward", "import-preview":"Review planning import","import-manual":"Recover a plan",handover:"Confirm your starting plan"};
    layer.hidden=false;document.body.classList.add("dialog-open");
    layer.innerHTML='<aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawerTitle" tabindex="-1"><div class="drawer-header"><h2 id="drawerTitle">'+titles[panel]+'</h2>'+
      '<button class="icon-button" type="button" data-action="close-drawer" aria-label="Close panel">'+icon("x")+'</button></div>'+body+'</aside>';
    $(".drawer",layer).focus();
  }
  function closeDrawer(restore=true) {
    layer.hidden=true;layer.innerHTML="";document.body.classList.remove("dialog-open");
    if(restore && lastFocus && document.contains(lastFocus))lastFocus.focus({preventScroll:true});
  }
  function exportJson() {
    try {
      const payload=JSON.stringify({...state,route:"home"},null,2);
      const blob=new Blob([payload],{type:"application/json"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=url;a.download="ia-pathfinder-project.json";document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),3000);toast("Project backup downloaded.");
    } catch(err) {toast("Backup could not be created. Please try again.");console.error(err);}
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
      downloadFile(bytes,suggestedFilename(model,format),mime);
      state.handover.lastExportAt=snapshot.exportedAt;
      save();
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
    if(action==="go-home")return nav("home");
    if(action==="go-planning")return nav("planning");
    if(action==="go-studio")return nav("completing",{section:"overview"});
    if(action==="go-path")return nav("path");
    if(action==="go-report")return nav("report");
    if(action==="open-files")return openDrawer("files");
    if(action==="open-demos")return openDrawer("demos");
    if(action==="open-stuck")return openDrawer("stuck");
    if(["studio-overview","studio-intro","studio-data","studio-math","studio-conclusion","studio-review"].includes(action))return nav("completing",{section:action.slice(7)});
    return false;
  }
  function clickAction(el) {
    const action=el.dataset.action||"";
    if(changeNavAction(action,el)!==false)return;
    switch(action){
      case "start-planning": setPlanCurrent(state,state.planning.current||"N00");nav("planning");break;
      case "plan-next":
      case "plan-advance":handlePlanningResult(planAutoAdvance(state));break;
      case "plan-route":handlePlanningResult(planningMove(state,el.dataset.condition));break;
      case "plan-back":handlePlanningResult(planningBack(state));break;
      case "plan-edit":handlePlanningResult(planningEdit(state,el.dataset.node));break;
      case "path-plan":{
        const map={"0":"N00","1":"N01","5":"N03F"};
        handlePlanningResult(planningEdit(state,map[el.dataset.index]||"N00"));break;
      }
      case "plan-toggle-math":{
        const id=el.dataset.mathId;
        if(!toggleMath(state,id)){toast("Choose a technique from your selected course.");break;}
        const selected=state.planning.mathSelected.includes(id);
        // Preserve search, keyboard focus and scroll position while multiple options are chosen.
        document.querySelectorAll(".plan-math-option").forEach(node=>{
          if(node.dataset.mathId!==id)return;
          node.classList.toggle("selected",selected);
          node.setAttribute("aria-pressed",String(selected));
        });
        const count=document.querySelector(".plan-math-count strong");
        if(count)count.textContent=state.planning.mathSelected.length;
        save();break;
      }
      case "studio-tab":nav("completing",{section:el.dataset.section});break;
      case "math-add": addMath();break;
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
        if(!st)break;
        if(!filled(st.nextQuestion)){toast("Write or choose a next mathematical question first.");return;}
        addMath(st.nextQuestion);break;
      }
      case "toggle-help":
        state.ui.helpKey=state.ui.helpKey===el.dataset.help?"":el.dataset.help;
        save();render();break;
      case "cue-write":state.ui.openCue=el.dataset.key;save();render();break;
      case "close-cue":state.ui.openCue="";save();render();break;
      case "cue-covered":state.cues[el.dataset.key]="done";state.ui.openCue="";save();render();toast("Noted — this reminder won't keep appearing.");break;
      case "cue-skip":state.cues[el.dataset.key]="not-relevant";state.ui.openCue="";save();render();toast("Okay — this cue is now hidden.");break;
      case "open-panel":lastFocus=el;openDrawer(el.dataset.panel);break;
      case "close-drawer":closeDrawer();break;
      case "load-demo":
        if((hasPlan()||hasStudio()) && !window.confirm("Replace your current local project with an illustrative sample? Download a backup first if needed."))return;
        demo(el.dataset.demo);break;
      case "export-json":exportJson();break;
      case "export-plan-pdf":void exportPlanningDocument("pdf");break;
      case "export-plan-docx":void exportPlanningDocument("docx");break;
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
      } else {
        putPath(path,numeric?Number(choice.dataset.value):choice.dataset.value);
      }
      if(path.endsWith(".status")&&path.startsWith("entries.")&&previous!==choice.dataset.value){state.ui.helpKey="";}
      save();render();
      const focusTarget=[...document.querySelectorAll("[data-choice]")].find(x=>x.dataset.choice===path&&x.dataset.value===choice.dataset.value);
      if(focusTarget)focusTarget.focus({preventScroll:true});
      return;
    }
    const action=evt.target.closest("[data-action]");
    if(action){if(action.closest(".drawer")&&action.dataset.action!=="close-drawer"&&
      ["go-home","go-planning","go-path","go-report","go-studio","open-files","open-demos","open-stuck"].includes(action.dataset.action))closeDrawer(false);
      clickAction(action);return;}
    if(evt.target===layer)closeDrawer();
  });
  document.addEventListener("input",evt=>{
    const target=evt.target;
    if(target.dataset.planSearch!==undefined){
      state.planning.mathSearch=target.value.slice(0,90);filterMathOptions();return;
    }
    if(target.dataset.bind){
      updateBoundField(target.dataset.bind,target.value);
      save();
    }
  });
  document.addEventListener("change",evt=>{
    const target=evt.target;
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
      if(target.dataset.bind==="planning.fields.course"||target.dataset.bind==="planning.fields.ideaSelected")render();
    }
  });
  document.addEventListener("keydown",evt=>{
    if(evt.key==="Escape"&&!layer.hidden){evt.preventDefault();closeDrawer();}
    if(evt.key==="Tab"&&!layer.hidden){
      const focusable=[...layer.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled])')];
      if(!focusable.length)return;
      const first=focusable[0],last=focusable[focusable.length-1];
      if(evt.shiftKey&&document.activeElement===first){evt.preventDefault();last.focus();}
      if(!evt.shiftKey&&document.activeElement===last){evt.preventDefault();first.focus();}
    }
  });
  $("#importFile").addEventListener("change",async evt=>{
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
    const file=event.target.files?.[0];
    if(!file)return;
    try{await readPlanningDocument(file);}
    finally{event.target.value="";}
  });
  // Welcome: current route from a previous session should always remain reachable and understandable.
  render();
})();