import {chapterRibbon} from '../ui/living-journey.js';
import {renderFieldGuideTeaser,renderContextualGuide} from './writer-field-guide.js';
import {insightCapture,insightEcho} from '../ui/insight-threads.js';
import {STATUS_LABELS,currentGroup,JOURNEY_GROUPS} from "../ui/journey.js";
import {groupedDashboard} from "../ui/journey-views.js";
import {examplePrompt,exampleInline} from "../examples/views.js";
import {criteriaPanel,essentialsNudge} from "../essentials/views.js";
import {criterionPageHeading,criterionMarkedField} from "../essentials/criteria-badges.js";
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
 const criteriaField=(html,key)=>isAdviceReduced(getState())?html:criterionMarkedField(html,key);
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
  const state=getState(),advice=routeAdvice(state,entry),index=state.entries.findIndex(x=>x.id===entry?.id);
  if(!advice)return "";
  const reduced=isAdviceReduced(state),options=index>=0&&allowChoices?resultSignalOptions(entry):[];
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
  case "C10":return{intro:"Keep the opening short, genuine and in your own words. Results and detailed mathematics belong later.",
    html:smallSummary("My current aim",currentAim())+
      smallSummary("Why I chose the topic",p.motivation)+smallSummary("Who might benefit",currentBenefit())+
      smallSummary("My prediction (not a finding)",plannedPrediction())+
      field("scratch.introduction","My own working introduction notes","Why I chose this aim, what I hope to find out, and which approach might help",{type:"textarea",rows:7})+
      info("A useful length","Often a few short paragraphs or less than a page are enough; this is guidance, not a prescribed IB word limit.")+
      info("Revisitable","Your introduction can evolve. Use 'Edit aim or beneficiary' below to revise Planning without losing this text.")
   };
  case "C10E":return{intro:"Compare original fictional introductions, then return to your own investigation.",html:exampleInline(s,{topic:"introduction"})};
  case "C20":return{intro:"What data, measurements or mathematical objects are actually available now? This is different from the collection plan.",
   html:smallSummary("Planned evidence",p.dataSource==="secondary"?p.secondaryUrl||p.secondaryPublisher:p.primaryWhat||p.theoreticalCase)+
    choice("dataStatus",[
     ["not-started","Not yet obtained"],["candidate","Candidate source — not verified"],
     ["partial","Some usable material"],["ready","Usable material confirmed"],
     ["theoretical","Theoretical mathematics — no dataset"]])+
    extra.sourceManager()+
    F("actualSourceType","Type of this actual source","",{type:"select",options:[["","To confirm"],["primary","Primary measurements / collection"],["secondary","Published secondary source"],["theoretical","Mathematical definitions / assumptions"]]})+
    F("actualSource","What evidence or mathematical starting material do I actually have?","Source or mathematical object, not a promised dataset",{type:"textarea",rows:3})+
    F("sourceCitation","Original published source and date (if relevant)","URL, publisher or citation")+
    F("actualMethod","How did I actually obtain or define it?","Describe the real procedure, never invented data collection",{type:"textarea",rows:3})+
    field("scratch.dataNotes","Other data/source notes from my earlier work (editable)","Sources, dates, units and assumptions recorded in the earlier prototype",{type:"textarea",rows:3})+
    (s.teacher.pendingApproval?info("Permissions still require care","Do not perform affected restricted collection without meeting consent or school requirements.",true):"")+
    '<div class="button-row">'+sourceAction("Statistics with sampled or secondary data","Statistics questions")+
      sourceAction("Empirical modelling or measured model inputs","Modelling questions")+
      sourceAction("Theoretical or no-data exploration","Theoretical questions")+'</div>'
  };
  case "C21S":return{intro:"If you have actual observations, record how the population or sample was defined and what can responsibly be inferred.",
   html:F("statisticalPopulation","Population or group the analysis could describe","The true target population, not every person in general")+
    choice("sampleOrCensus",[["sample","Sample"],["census","Attempted census"],["secondary","Existing published observations"],["unsure","Not sure yet"]])+
    F("samplingMethod","How observations were actually selected","Random, stratified, systematic, convenience, already published, etc.")+
    F("samplingRationale","Why is this design relevant to the aim?","One mathematically meaningful reason",{type:"textarea",rows:2})+
    F("sampleSize","Sample size or relevant counts","Only genuine counts")+
    F("pairing","For paired data, were measurements genuinely matched? (if applicable)","Variables/units from the same observation")+
    F("responseBias","Potential selection, response or group-comparison issue","What could this prevent you generalising?",{type:"textarea",rows:2})+
    F("dataCleaning","Missing, filtered or excluded values and why (if applicable)","Do not discard inconvenient data to force a prediction",{type:"textarea",rows:2})
  };
  case "C21M":return{intro:"A useful model depends on explicit inputs, parameters, assumptions and a defensible range.",
   html:F("modelEvidence","What supports the model?","Measured data, secondary values, mathematical assumptions, or a mixture")+
    F("modelInputs","Variables, parameters, units and sources","e.g. L length (cm), t time (s), V volume (cm³)",{type:"textarea",rows:3})+
    F("modelAssumptions","Which simplifications matter?","Their purpose and when they may fail",{type:"textarea",rows:3})+
    F("modelDomain","What input range or constraints make sense?","Domain for which the model is intended")+
    F("modelValidation","How could the model be checked, if feasible?","Observed comparisons or a justified simplified case",{type:"textarea",rows:2})+
    F("modelAlternative","An alternative model worth considering (optional)","Only if another form is mathematically plausible")
  };
  case "C21T":return{intro:"A theoretical investigation does not need a pretend dataset or sampling discussion.",
   html:F("theoreticalObject","What mathematical object, structure or conjecture is involved?","State a precise mathematical problem",{type:"textarea",rows:3})+
    F("theoreticalCase","One small useful case or potential counterexample","Numerical examples suggest, but do not prove, a general claim",{type:"textarea",rows:2})+
    F("theoreticalAssumptions","Which assumptions, restrictions or terms matter?","Define as needed",{type:"textarea",rows:2})+
    F("theoreticalQuestion","Anything to discuss about course suitability?","Teacher discussion remains optional but useful",{type:"textarea",rows:2})
  };
  case "C22":return{intro:"Explain why your actual approach fits the mathematical question better than one realistic alternative.",
   html:F("alternativeMethod","Another genuinely feasible method","A different source, measurement tool or modelling assumption",{type:"textarea",rows:2})+
    F("chosenMethod","Which method did you actually choose?","Not simply what you planned",{type:"textarea",rows:2})+
    F("methodReason","Why is it suitable for this aim?","What makes the resulting mathematics useful, reliable or interpretable?",{type:"textarea",rows:3})+
    info("No generic methods essay","Compare only relevant approaches; convenience alone is not a mathematical justification.")
  };
  case "C23":return{intro:"Place collection/source limitations beside the corresponding method, not only at the end.",
   html:F("methodLimitation","Most consequential limitation of your actual source or method","Sampling coverage, variable definitions, source quality or measurement bias",{type:"textarea",rows:3})+
    F("limitationConsequence","How might it affect the result or restrict a conclusion?","State the consequence for this aim",{type:"textarea",rows:3})+
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
    F("accuracyReason","Why does that accuracy make sense?","Related input uncertainty, measurement quality or model sensitivity",{type:"textarea",rows:2})+
    button("Record this quantity","completion-record-accuracy","btn-secondary")+
    accuracyRecords()+
    info("No fixed decimal-place rule","Keep guard digits during working, then report outputs to defensible precision. Don't round an exact symbolic answer unnecessarily.")
  };
  case "C25":return{intro:"Introduce a symbol or term when first needed; use meaningful names and consistent units.",
   html:F("variableDefinitions","Important symbols with meanings and units","e.g. h = height in m; t = time in seconds",{type:"textarea",rows:4})+
    F("specialistTerms","Any important non-mathematical specialist words","Explain only those needed to understand the investigation",{type:"textarea",rows:2})+
    info("Just in time","Define new mathematical symbols before their first use, including those introduced in later sections.")
  };
  case "C26":return{intro:"Connect your actual evidence and method back to the aim. You may return to the dashboard or begin a first exploration.",
    html:smallSummary("Actual source",f.actualSource||f.theoreticalObject)+
      smallSummary("Method reason",f.methodReason)+
      F("dataAimLink","Why could this evidence help answer my current aim?","One short explanation in the actual IA's methods/source section",{type:"textarea",rows:3})+
      F("dataStatusSummary","One important uncertainty still to resolve (optional)","Sampling scope, permission, parameter quality or missing source",{type:"textarea",rows:2})
  };
  case "C30":return{intro:"Start with a single useful graph, labelled diagram, numerical case or brief calculation. It should have a mathematical purpose.",
    html:(p.figureOther||p.figureType||p.firstAction?smallSummary("Earlier first-step idea (optional)",p.figureOther||p.figureType||p.firstAction):"")+
      (p.figurePurpose?smallSummary("Earlier planned purpose",p.figurePurpose):"")+
      info("First purposeful mathematics","Explain why this representation might be useful BEFORE creating it. Then describe what it ACTUALLY shows and what follows.")
  };
  case "C31":return{intro:"Choose an initial representation that could genuinely reveal the next mathematical question.",
   html:choice("firstType",[
    ["scatter","Scatter graph with genuine paired data"],["distribution","Distribution or group comparison"],
    ["diagram","Labelled mathematical diagram"],["table","Small numerical table or case"],
    ["calculation","One purposeful calculation"],["theory","Theoretical example or conjecture"],
    ["other","Another suitable representation"],["unsure","Not sure yet"]])+
    criteriaField(F("firstPurpose","Why might this help answer the aim?","The mathematical question it could reveal",{type:"textarea",rows:3}),"completing:C31:firstPurpose")+
    (f.dataStatus==="not-started"&&p.kind!=="theoretical"?info("Data not ready?","You can define terms, use a clearly labelled provisional case or revisit sources. Do not invent measurements."): "")
  };
  case "C32":return{intro:"Immediately before the figure or calculation, give your reader a mathematical reason to look at it.",
   html:actualRecord()+
    entryField("title","A short title for this step","e.g. Inspect a scatter graph")+
    criteriaField(entryField("purpose","Mathematical purpose BEFORE it","What question should this graph/calculation help answer?",{type:"textarea",rows:3}),"completing:C32:purpose")+
    entryField("technique","Mathematical technique being used","e.g. plot observed paired values")+
    entryField("resultRef","Where will the figure or work appear in my IA?","e.g. Figure 1 in my Word document")+
    F("firstDefinitions","Variables, units or assumptions the reader needs here","Only what is not already defined",{type:"textarea",rows:2})+
    entryField("methodId","Identify an actual method for relevant help (optional)","",{type:"select",options:METHOD_OPTIONS})+
    preflight(st)+
    accuracySelector()+accuracyNote()
  };
  case "C33":return{intro:"Create the actual figure or short calculation in your IA document. Describe what you did here without copying an invented result.",
   html:entryReviewAlert()+actualRecord()+
    entryChoice("status",[
     {value:"planned",title:"Still planned",icon:"clock"},
     {value:"completed",title:"I have actually produced the figure or calculation",icon:"check-circle"}])+
    entryChoice("kind",[
     {value:"scatter",title:"Scatter graph",icon:"chart"},
     {value:"model",title:"Model or calculation",icon:"calculator"},
     {value:"theory",title:"Mathematical conjecture / proof",icon:"book"},
     {value:"other",title:"Other genuine mathematics",icon:"sparkles"}])+
    entryField("result","What did you actually plot, calculate or find?","Enter only a genuine output, or keep this as planned",{type:"textarea",rows:4})+
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
    F("accuracyForResult","Is the display defensible?","A context-based explanation, not arbitrary decimal places",{type:"textarea",rows:3})+
    info("Avoid repeated precision essays","Once justified, apply the decision again only where relevant. Revisit C24 if the underlying source changes.")
  };
  case "C34B":return{intro:"Relate this actual result to your aim, your earlier prediction and its intended benefit.",
   html:entryReviewAlert()+actualRecord()+coachBlock(st,{allowChoices:false})+smallSummary("Your current aim",currentAim())+
    smallSummary("Original prediction (tentative)",plannedPrediction())+
    smallSummary("Possible beneficiary",currentBenefit())+
    entryField("interpretation","What does this actual result mean for my aim?","An honest local conclusion based on mathematics I have done",{type:"textarea",rows:4})+
    entryField("localTakeaway","One sentence: what has this section established?","What do I know now, and what remains unanswered?",{type:"textarea",rows:2})+
    F("predictionComparison","Does the result support, contradict or complicate the prediction?","A comparison, not a requirement for the prediction to be correct",{type:"textarea",rows:2})+
    F("benefitFinding","What might this mean for the intended beneficiary?","Only if supported by evidence",{type:"textarea",rows:2})+
    '<details class="guidance-insight"><summary>Did this result teach me something new mathematically? (optional)</summary>'+
      entryField("mathsInsight","My genuine new mathematical insight","About the method, proof, connection or conditions—not a routine formula",{type:"textarea",rows:3})+
      '</details>'
  };
  case "C34U":return{intro:"Surprising, unclear or contradictory findings are valuable. Check possibilities without changing observations to fit a prediction.",
   html:actualRecord()+
    F("surpriseReason","What differs from my expectation, or is uncertain?","An outlier, unclear scatter, sign change, counterexample …",{type:"textarea",rows:3})+
    F("surpriseCheck","One plausible mathematical or source-based check","Verify an unusual value, check assumptions or compare an honest alternative",{type:"textarea",rows:3})+
    info("No forced result","You can record an unresolved surprise, save, or revise the mathematical plan while keeping the original observation intact.")
  };
  case "C35":return{intro:"One logical bridge from your last actual result to the next mathematics—or recognise that you have enough to conclude.",
   html:bridgeFromPrior()+coachBlock(sourceResultForNext(s),{showDepth:false})+nextCoachQuestions()+
    criteriaField(F("nextQuestion","What worthwhile mathematical question remains unanswered?","It should arise from the previous local takeaway",{type:"textarea",rows:3}),"completing:C35:nextQuestion")+
    F("nextMethod","Which technique might answer THAT question?","Course-appropriate if possible; it can be undecided")+
    criteriaField(F("nextReason","Why would this next technique follow from the previous result?","Explain the bridge BEFORE the new mathematics in your real IA",{type:"textarea",rows:3}),"completing:C35:nextReason")+
    info("No prescribed number of mathematical sections","Another technique is useful only if it answers a genuine next question. An honest conclusion may be the best next step.")+
    '<div class="button-row">'+sourceAction("Show me relevant NEXT mathematical ideas","Help me think of a next step")+
    (canViewScatterFollowup(s)?sourceAction("Show bivariate options for actual scatter pattern","Interpret my scatter pattern"):"")+
    (canViewPmccFollowup(s)?sourceAction("Pearson r was ACTUALLY calculated: contextual next-step ideas","After actual PMCC"):"")+
    sourceAction("Enough relevant mathematics—bring findings together","Enough to conclude")+'</div>'
  };
  case "C35H":return{intro:"Two optional prompts based on what you actually recorded. Neither is a required extra technique.",
   html:bridgeFromPrior()+suggestionCards()+
    F("nextQuestion","My OWN next mathematical question","You may reject all suggestions",{type:"textarea",rows:2})+
    F("nextReason","Why would answering this follow from my result?","Meaningful mathematical connection",{type:"textarea",rows:3})
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
    F("pmccInterpretation","What value or finding did I calculate and what does it mean?","Describe actual direction and strength of LINEAR association",{type:"textarea",rows:3})+
    (f.scatterPattern?smallSummary("Observed scatter shape",f.scatterPattern):"")+
    F("nextQuestion","My next question, if another is needed","A model, outlier check, different explanation, or no further calculation",{type:"textarea",rows:2})+
    F("nextReason","Why would that next step help the aim?","The actual r and graph—not a planned coefficient—drive the choice",{type:"textarea",rows:2})+
    info("Association is not causation","Even a strong coefficient does not show that one variable caused another. Avoid forcing a straight-line regression on a curved pattern.")+
    guides.bivariateHelp(n,{reduced:isAdviceReduced(s)})
  };
  case "C40":case "C50":{
   const active=completeEntry(s);
   const entry=active&&active.phase!=="first"?active:null;
   return{intro:n==="C40"?"Your first substantial technique should have a reason tied to a previous real finding.":"Further mathematics should follow the investigation's own mathematical questions, not a quota.",
    html:(entry?entryReviewAlert()+bridgeToActive():info("Return to the first exploration","If you have only a first representation, interpret it and choose a meaningful next question before starting a substantial mathematical section."))+
     (entry?'<div class="completion-active-step">'+
       entryField("title","Mathematical question this section addresses","Meaningful and focussed")+
       entryField("purpose","Why this technique belongs here, BEFORE the work","Link to the previous result and aim",{type:"textarea",rows:3})+
       entryField("technique","Mathematical technique actually intended or used","e.g. differentiation, regression, algebraic argument")+
       entryField("methodId","Identify the method for relevant help (optional)","",{type:"select",options:METHOD_OPTIONS})+
       preflight(entry)+
       entryChoice("status",[
         {value:"planned",title:"Only planned",icon:"clock"},
         {value:"completed",title:"Actual mathematics completed",icon:"check-circle"}])+
       entryField("result","What did you ACTUALLY establish?","A genuine value, equation, model, property or finding",{type:"textarea",rows:4})+
    coachBlock(entry)+
       entryField("resultRef","Where is the full mathematics in my IA?","Equation number, figure, section or page")+
       accuracySelector()+
       entryChoice("knowledge",[
         {value:"syllabus",title:"Verified within my course — use it without a textbook explanation",icon:"check-circle"},
         {value:"mixed",title:"A familiar technique with one new/out-of-course idea",icon:"book"},
         {value:"outside",title:"Verified beyond my syllabus — explain the new mathematics",icon:"book"},
         {value:"unsure",title:"I'm not yet sure whether it is within my course",icon:"lightbulb"}])+
       (["outside","mixed"].includes(entry.knowledge)?
        entryField("unfamiliarComponent","Which precise mathematical concept is unfamiliar?","Identify only the new part")+
        entryField("knowledgeNotes","What do I genuinely understand about the unfamiliar mathematics?","State definitions, conditions and why it works here",{type:"textarea",rows:3})+
        entryField("understandingExample","One relevant step or check that demonstrates understanding (optional)","A real small derivation, worked step or checked case",{type:"textarea",rows:3})+
        entryField("researchSource","Source I actually learned this from (if applicable)","Book, link or chapter used"):
        entry.knowledge==="unsure"?info("Course check first","Check your precise IB course guide or ask your teacher. Independent research alone does not make a taught technique beyond syllabus."):
        info("Syllabus method","Use it correctly and interpret what it shows. You do not need to teach a standard technique."))+
       '<details class="guidance-insight"><summary>Did the actual result change my mathematical approach? (optional)</summary>'+
        entryField("methodChangeReason","Why I changed technique after a genuine result","Which previous limitation or observation motivated the change?",{type:"textarea",rows:2})+
       '</details>'+
       entryField("limitations","Important limitation of THIS actual method (optional)","Only if it changes interpretation",{type:"textarea",rows:2})+
       (entry.mathsInsight?smallSummary("Mathematical insight I recorded earlier",entry.mathsInsight):"")+'</div>':
       info("Start with actual exploration","Select the first purposeful representation or a real earlier calculation, then justify the mathematical step that follows.",true))+
     accuracyNote()+miniList()+
     (entry?.status==="completed"&&filled(entry.result)?
       sourceAction(n==="C40"?"Actual later mathematical result warrants reinterpretation":"Reflect on a new mathematical result as it happens",
        "Interpret my actual result",true):"")
   };
  }
  case "C40T":return{intro:"Technology can assist calculations, but your IA should show what mathematical meaning you have understood.",
   html:F("technologyTool","Which software, GDC, code or spreadsheet was actually used?","Name the tool")+
    F("technologyInput","Inputs or mathematical operation used","Variables and transformation",{type:"textarea",rows:2})+
    F("technologyOutcome","What numerical or graphical output was produced?","Real result only",{type:"textarea",rows:3})+
    F("technologyInterpretation","What does that output mathematically mean for the aim?","Your reasoning, not a screenshot with no explanation",{type:"textarea",rows:3})
  };
  case "C40D":return{intro:"Check whether the mathematics you ACTUALLY use is appropriate and understood.",
   html:actualRecord()+
    (f.courseLevel&&st?.knowledge==="unsure"?smallSummary("Earlier broad course check to review",f.courseLevel):"")+
    (st?entryChoice("knowledge",[
      {value:"syllabus",title:"Verified within my own IB course",icon:"check-circle"},
      {value:"mixed",title:"Main technique is familiar, but one extension is outside/uncertain",icon:"book"},
      {value:"outside",title:"Verified outside my own course",icon:"book"},
      {value:"unsure",title:"I need to check my course or ask a teacher",icon:"lightbulb"}]):"")+
    F("courseWhy","What mathematical question does this technique answer?","Why it is genuinely suitable for this investigation",{type:"textarea",rows:3})+
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
    F("researchedUnderstanding","What have I learned about how it works?","Definitions, assumptions, a demonstration or small explanation",{type:"textarea",rows:4})+
    F("mathsLearning","What did learning this change about my investigation?","A genuine mathematical insight",{type:"textarea",rows:2})+
    info("Use regular course techniques directly","If your technique is on your course, there is usually no need to teach it to the reader.")
  };
  case "C60":return{intro:"Synthesize the mathematics you actually completed and give the best-supported answer to your aim.",
    html:actualList()+smallSummary("Current aim",currentAim())+
    smallSummary("Intended beneficiary",currentBenefit())+
    guides.conclusionLimitations()+
    field("scratch.conclusion","My own conclusion notes","State the best-supported answer and limits, in my own words",{type:"textarea",rows:6})
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
      field("scratch.conclusion","My revised concise conclusion notes","My actual mathematical answer, in my own words",{type:"textarea",rows:5})+
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
  const label=node==="C00"?"Set up: start writing your IA":(titleMap.get(node)||"IA Studio");
  const screen=startOptions(node),stage=completionStage(node,s);
  const progress=stage&&s.completion.stages[stage];
  const warning=completionFlags(s);
  const topWarnings=warning.length&&["C00","C02","C03","C04","C20"].includes(node)?
    '<div class="completion-top-warnings">'+warning.slice(0,2).map(x=>info("Review needed",x,true)).join("")+'</div>':"";
  const statusControls=stage&&C_MAJOR_STAGES.some(x=>x.id===stage)&&[stage,"C40","C50"].includes(node)?
    '<div class="completion-status"><span class="field-label">My assessment of this stage (not automatically graded)</span>'+
    '<div class="completion-status-options">'+[
      ["working",STATUS_LABELS.working],["complete",STATUS_LABELS.complete],["needs-review",STATUS_LABELS["needs-review"]]].map(([key,text])=>
     '<button data-action="completion-mark" data-stage="'+e(stage)+'" data-status="'+key+'"'+
     ' aria-pressed="'+(progress===key)+'" class="'+(progress===key?"selected":"")+'">'+e(text)+'</button>').join("")+'</div></div>':"";
  return '<div class="page narrow completing-page">'+tabletNav()+chapterRibbon(s)+
    '<div class="completion-topline"><span>'+icon("route")+' '+e(node==="C04"?"Your IA Studio":(JOURNEY_GROUPS.indexOf(currentGroup(s))+1)+'. '+currentGroup(s).name)+'</span>'+
    '<div class="completion-top-actions"><button type="button" class="advice-mode-toggle" data-action="toggle-advice-mode" aria-pressed="'+isAdviceReduced(s)+'" aria-label="'+(isAdviceReduced(s)?"Show full advice":"Reduce optional advice")+'">'+
      icon(isAdviceReduced(s)?"eye":"eye-off")+' '+(isAdviceReduced(s)?"Show full advice":"Reduce advice")+'</button>'+
    (node==="C04"?"":'<button class="btn btn-quiet btn-sm" data-action="completion-open" data-node="C04">'+icon("layers")+' My stages</button>')+'</div></div>'+
    topWarnings+
    (node!=="C00"&&node!=="C04"&&!isStuckNode(node)?'<p class="studio-ia-writing-reminder">'+icon("pencil")+
      ' WRITE IN YOUR IA · Use these prompts to develop your own document; nothing is inserted automatically.</p>':'')+
    '<div class="task-shell'+(node==="C00"?' chapter-onboarding-shell':'')+'" data-source-node="'+e(node)+'">'+
    criterionPageHeading(label,"completing",isAdviceReduced(s)?"":node)+'<p class="task-intro">'+e(screen.intro)+'</p>'+
    insightEcho(s,node)+extra.returnToReview()+(isStuckNode(node)||["C00","C04","C10E"].includes(node)||isAdviceReduced(s)?"":criteriaPanel(s))+screen.html+(screen.extra||"")+(node==="C00"?"":insightCapture(s,node))+
    (node==="C00"||node==="C04"||isStuckNode(node)||isAdviceReduced(s)?"":renderContextualGuide(icon,e,node))+
    (node==="C00"||isAdviceReduced(s)?"":essentialsNudge(s))+
    (node==="C00"||isStuckNode(node)||node==="C10E"||isAdviceReduced(s)?"":guides.writingMoment(node,{embedded:node!=="C96"}))+
    (node==="C00"||isStuckNode(node)||isAdviceReduced(s)?"":guides.mathsHelp(node)+guides.limitsHelp(node)+
    (["C00","C04"].includes(node)?"":contextualPrompt(node)+resourcePrompt(s)))+statusControls+
    (node==="C00"?"":allButtons(node,primaryByNode[node]||[]))+'</div>'+
    '<p class="small-callout">Only actual mathematics supports a mathematical conclusion. Your planning, predictions and teacher questions remain separate from real findings. No compulsory number of calculations or IA grade.</p>'+
    (["C00","C04"].includes(node)?"":miniList())+'</div>';
 }
 return {viewCompleting:render};
}
