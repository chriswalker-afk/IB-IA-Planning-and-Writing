import {planningLearningTrail} from './living-journey.js';
import {renderCitationReminder} from '../resources/citation-prompts.js';
import {planningScreenTitle} from '../planning/screen-labels.js';
import {earlyMathRecommendations} from '../planning/math-recommendations.js';
import {renderInvestigativeRoutes} from './investigative-routes-view.js';
import {renderIdeaLabPlanningCue} from '../planning/idea-lab-bridge.js';

import {accuracyPlanner} from './data-decisions-view.js';
import {primaryDataWhat,primaryDataSampling} from './primary-data-steps.js';

import {insightCapture,renderSparkShelf} from './insight-threads.js';
import {examplePrompt} from "../examples/views.js";
import {criteriaPanel,essentialsNudge} from "../essentials/views.js";
import {criterionMarkedField,criterionPageHeading} from "../essentials/criteria-badges.js";
import {ideaExplorerView,ideaComparisonView,ideaFooter} from '../ideas/views.js';
import {renderTimelineStep} from "./timeline-view.js";
/**
 * Full Planning student experience. Source node IDs are attached to UI for test
 * traceability but remain invisible to students. Actual graph movement lives in
 * src/planning/engine.js and requires a source-defined condition.
 */
import {
 PLANNING_CATALOG
} from "../planning/catalog.js";
import {PLANNING_ROUTES} from "../planning/route-table.js";
import {
 PROGRESS_GROUPS,planningStage,planningFlags,relevantPredictionOptions,
 predictionMathSuggestions,selectedMaths
} from "../planning/engine.js";

export function createPlanningViews(ctx){
 const {icon,e,button,field,choose,numberPick,note,summary,helpButton,helpBox,tabletNav}=ctx;
 const span=(v)=>e(String(v||""));
 const fval=(state,key)=>state.planning.fields[key]||"";
 const F=(key,label,placeholder,opts={})=>field("planning.fields."+key,label,placeholder,opts);
 const choice=(key,options,opts={})=>choose("planning.fields."+key,options,opts);
 const select=(key,label,options)=>F(key,label,"",{type:"select",options:[["","Choose or leave undecided"],...options]});
 const text=(value)=>e(value||"");
 const dates=(fields)=>fields.map(([key,label])=>F(key,label,"",{type:"date"})).join("");
 const callout=(title,body,warning=false)=>'<div class="inline-note'+(warning?" warning":"")+'">'+icon(warning?"info":"lightbulb")+'<p><strong>'+e(title)+'</strong> '+body+'</p></div>';
 const route=(label,condition,cls="btn-secondary")=>'<button type="button" class="btn '+cls+'" data-action="plan-route" data-condition="'+e(condition)+'">'+e(label)+icon("arrow-right")+'</button>';
 const edit=(id,label)=>'<button type="button" class="btn btn-quiet btn-sm" data-action="plan-edit" data-node="'+e(id)+'">'+e(label)+icon("chevron-right")+'</button>';
 const stepBody=(title,intro,html,help="",label="Continue")=>({title,intro,html,help,label});
 const small=(html)=>'<div class="task-section">'+html+'</div>';
 const ideaCue=(state,placement)=>renderIdeaLabPlanningCue(state,placement,{e,icon});
 const bullet=(title,desc)=>'<div class="context-card">'+icon("check-circle")+'<div><strong>'+e(title)+'</strong><p>'+e(desc)+'</p></div></div>';
 function rating(key,title,desc){
  const opts=[1,2,3,4,5].map(n=>({value:String(n),title:String(n)}));
  return '<div class="field-group"><label class="field-label">'+e(title)+'</label>'+
   choice(key,opts,{tight:true})+'<p class="field-hint">'+e(desc)+'</p></div>';
 }
 function teacherWarnings(state){
  const flags=planningFlags(state);
  return flags.length?'<div class="task-section"><p class="field-label">Points to discuss or strengthen</p><div class="inline-stack">'+
   flags.map(x=>callout(x.title,e(x.note),x.needsApproval)).join("")+'</div></div>':callout("No flags identified so far.","Your plan can still change. Teacher review remains useful.");
 }
 function statusValue(flag){return flag?'<span class="status-tag">Question set addressed</span>':'<span class="status-tag pending">Still to address</span>';}
 function mathCards(state,ids=null){
  const course=fval(state,"course");
  const list=PLANNING_CATALOG.math.filter(x=>x.course===course&&(!ids||ids.includes(x.id)));
  const selected=new Set(state.planning.mathSelected);
  return '<div class="plan-math-options" role="group" aria-label="Possible mathematics">'+list.map(x=>
   '<button class="choice plan-math-option'+(selected.has(x.id)?" selected":"")+
   '" type="button" data-action="plan-toggle-math" data-math-id="'+e(x.id)+
   '" data-search-text="'+e((x.label+" "+x.topic+" "+x.purpose).toLowerCase())+
   '" aria-pressed="'+selected.has(x.id)+'"><span class="choice-body"><span class="choice-title">'+e(x.label)+'</span>'+
   '<span class="choice-subtitle">'+e(x.purpose)+'</span><span class="plan-math-topic">'+e(x.topic)+'</span></span>'+
   '<span class="choice-marker">'+icon("check")+'</span></button>').join("")+'</div>';
 }
 function mathRouteCards(state,{afterPrediction=false}={}){
  const course=state.planning.fields.course;
  if(!['AI SL','AA SL'].includes(course))return '';
  const inferred=afterPrediction?predictionMathSuggestions(state).map(x=>({...x,
   origin:'After your provisional prediction',why:'Your tentative prediction suggests this might be worth checking IF the actual data support that pattern.',
   first:'Inspect genuine results and decide whether the technique helps answer your aim.',
   caution:'A prediction is not evidence of a mathematical pattern.'})):[];
  const used=new Set();
  const routes=[...inferred,...earlyMathRecommendations(state)].filter(x=>{
   if(used.has(x.id))return false;
   used.add(x.id);return true;
  }).slice(0,5);
  if(!routes.length)return '<p class="math-route-empty">There is no clearly applicable suggested route yet. Explore your course menu, try one small case, or discuss a suitable starting point with your teacher.</p>';
  const selected=new Set(state.planning.mathSelected);
  return '<section class="math-routes" aria-label="Possible mathematical pathways">'+
   '<div class="math-routes-heading"><span>'+icon('route')+' POSSIBLE ROUTES</span>'+
   '<h3>Mathematics worth considering</h3>'+
   '<p>Based on your investigation type, data structure, working question or prediction. These are optional ideas—not instructions, proven patterns, grades or syllabus approval.</p></div>'+
   '<div class="math-route-grid">'+routes.map(x=>{
    const isSelected=selected.has(x.id);
    return '<button type="button" class="math-route-option'+(isSelected?' selected':'')+
     '" data-action="plan-toggle-math" data-math-id="'+e(x.id)+'" aria-pressed="'+isSelected+'">'+
     '<span class="math-route-overline">'+e(x.origin)+'</span>'+
     '<strong>'+e(x.label)+'</strong><span class="math-route-topic">'+e(x.topic)+'</span>'+
     '<span class="math-route-why">'+e(x.why)+'</span>'+
     '<span class="math-route-first"><b>Try first:</b> '+e(x.first)+'</span>'+
     (x.caution?'<span class="math-route-caution">'+icon('info')+' '+e(x.caution)+'</span>':'')+
     '<span class="math-route-select">'+icon(isSelected?'check-circle':'plus-circle')+
      '<span data-math-route-status>'+(isSelected?'Added to my plan':'Add this possibility')+'</span></span>'+
     '</button>';
   }).join('')+'</div></section>';
 }
 function mathChoices(state,suggested=false,collapsed=false){
  const f=state.planning.fields,course=f.course;
  if(!["AI SL","AA SL"].includes(course))return callout("Course review needed","Only AI SL and AA SL are supported by the current detailed menu. No automatic match to HL or another syllabus is claimed.",true)+
   F("otherCourseMaths","Mathematics I might explore (optional)","A tentative technique or 'Not sure yet'",{type:"textarea",rows:2});
  const chosen=selectedMaths(state),foreign=chosen.filter(x=>x.course!==course),local=chosen.filter(x=>x.course===course);
  const selectedSummary='<p class="math-selection-summary">Selected: <strong data-math-selected-count>'+local.length+'</strong>'+
   '<span data-math-selection-summary>'+(local.length?' · '+e(local.map(x=>x.label).join(' · ')):' · Nothing selected yet — that is okay')+'</span></p>';
  const menu=
   '<div class="field-group"><label class="field-label" for="planMathSearch">Search '+e(course)+' mathematics</label>'+
   '<input id="planMathSearch" class="field" type="search" placeholder="Search a topic or technique" data-plan-search value="'+e(state.planning.mathSearch)+'"></div>'+
   '<div class="plan-math-count"><span>Selected: <strong>'+chosen.length+'</strong></span><span>Choose only mathematics with a purpose</span></div>'+
   mathCards(state)+
   F("otherMaths","Another technique I might use (optional)","Describe a different or researched technique",{type:"textarea",rows:2})+
   '<p class="field-hint">You can leave all techniques unselected. Adding more mathematics does not make an investigation better.</p>';
  const foreignNotice=foreign.length?callout("Course changed",e("Previously selected mathematics from a different course: "+foreign.map(x=>x.label).join(", ")+". These choices are preserved, but check your current syllabus before relying on them."),true):"";
  return (suggested?'<p class="math-review-note">'+icon('refresh-cw')+
    ' Revisit, do not restart. Your earlier selections are retained; a prediction is not a confirmed pattern.</p>':'')+
   foreignNotice+
   (collapsed?selectedSummary+
    '<details class="math-catalog-more"><summary>'+icon('book-open')+' Browse all '+e(course)+' mathematics'+icon('chevron-down')+'</summary>'+
    '<div class="math-catalog-more-body">'+menu+'</div></details>':menu);
 }
 function limitedTimeline(state){
  const f=state.planning.fields;
  const items=[["milestonePlan","Planning / introduction target"],["milestoneFirstVisual","First graph, diagram or example"],
  ["milestoneVisualReview","Reflect on the first representation"],["milestoneFirstMath","First substantial mathematical work"],
  ["milestoneFurtherMath","Further analysis and conclusion"],["milestoneDraft","Complete written first draft"],
  ["milestoneReview","Revisions and final self-check"]];
  return '<div class="field-row">'+items.map(([id,title])=>F(id,title,"",{type:"date"})).join("")+'</div>';
 }
 function timelineFlags(state){
  const f=state.planning.fields,warnings=[];
  if(f.sourceFirstDate&&f.sourceFullDate&&f.sourceFirstDate>f.sourceFullDate)warnings.push("Your first usable-data date is later than the full dataset date.");
  if(f.milestoneDraft&&f.milestoneSchoolFinal&&f.milestoneDraft>f.milestoneSchoolFinal)warnings.push("The planned first draft is after the school final deadline.");
  if(f.milestoneReview&&f.milestoneSchoolFinal&&f.milestoneReview>f.milestoneSchoolFinal)warnings.push("The planned review is after the school final deadline.");
  if(f.milestoneFirstVisual&&f.kind!=="theoretical"&&f.sourceFirstDate&&f.milestoneFirstVisual<f.sourceFirstDate)warnings.push("The first graph is planned before usable data. It could be a provisional example; check whether this date is realistic.");
  return warnings.map(x=>callout("Check this date",e(x),true)).join("");
 }
 function seedExample(state){
  const f=state.planning.fields;
  if(f.kind==="statistics")return"Try an honest scatter graph, distribution display or group comparison after obtaining usable data.";
  if(f.kind==="modelling")return"A labelled diagram, table of model inputs or simple limiting case could reveal a useful starting pattern.";
  return"Try a small numerical case, diagram, conjecture or potential counterexample. Numerical examples are not a proof.";
 }
 /** Informal onboarding: a separate visual screen, not another source-sheet question. */
 function planningWelcome(){
  const tile=(symbol,title,description,extra="")=>
   '<section class="chapter-onboarding-tile"><span class="chapter-onboarding-tile-icon">'+symbol+'</span>'+
   '<h3>'+title+'</h3><p>'+description+'</p>'+extra+'</section>';
  return stepBody("Welcome to Planning.","Explore a mathematical question that matters to you. Pathfinder helps you make and revise decisions before you write your IA.",
   '<div class="chapter-onboarding chapter-onboarding-plan">'+
    '<div class="chapter-onboarding-banner"><span class="chapter-onboarding-symbol">'+icon("compass")+'</span>'+
     '<div><span class="chapter-onboarding-eyebrow">CHAPTER 1 · PLAN ONLY</span><strong>Think first. Write the IA afterwards.</strong>'+
     '<p>Find a promising question, check that your evidence and mathematics are feasible, and collect provisional decisions. Nothing here claims you have already done the mathematics.</p></div></div>'+
    '<div class="chapter-onboarding-grid">'+
     tile(icon("lightbulb"),"Start from wherever you are",
      "Already have an idea? Compare a few possibilities, or use the interactive idea map to explore hobbies, daily life and your world. Refine a working title, a mathematical aim and a genuine motivation.")+
     tile(icon("route"),"Choose a feasible mathematical journey",
      "Explore mathematics based on your aim, browse typical investigative routes or view the course list. Decide whether to use primary or secondary data, or theoretical work; consider sources, sampling, accuracy, permissions, timelines and an optional prediction.")+
     tile(icon("sparkles"),"Sparks remember your ideas",
      "When you save a useful decision, it becomes a <strong>spark</strong>. Later pages bring back the two most relevant sparks. Select <strong>View all sparks</strong> to find or edit the rest. These are revisable planning notes, not verified findings.")+
     tile('<span class="onboarding-criterion-letter" aria-hidden="true">C</span>',"Criteria appear where they matter",
      "Tap a small letter badge beside a question or heading for specific IB assessment advice. The complete current A–E criteria live in <strong>IA essentials</strong>.",
      '<button class="onboarding-inline-action" type="button" data-action="essentials-open">'+icon("book")+' Explore the IB criteria '+icon("arrow-right")+'</button>')+
     tile(icon("lightbulb"),"Help is always nearby",
      "Use <strong>Compare examples</strong>, <strong>Tools &amp; tutorials</strong> or <strong>I am stuck</strong> when useful. The Discovery Trail lets you revisit earlier choices.",
      '<div class="chapter-onboarding-links"><button class="onboarding-inline-action" type="button" data-action="example-open" data-example-browse="true">Compare examples '+icon("arrow-right")+'</button>'+
      '<button class="onboarding-inline-action" type="button" data-action="resource-browse">Tools &amp; tutorials '+icon("arrow-right")+'</button></div>')+
     tile(icon("download"),"Keep your progress and move into writing",
      "The five-chapter <strong>Discovery Trail</strong> shows where you are. Your work saves on this device; download a project backup before switching devices. At the end of Planning you can export a Planning PDF or editable Word report, then move into IA Studio without losing your sparks.")+
    '</div>'+
    '<p class="chapter-onboarding-reassurance">'+icon("check-circle")+' No marks are predicted, and your question can change in response to real mathematics.</p>'+
   '</div>',"","Start planning");
 }
 function nodePage(state){
  const p=state.planning,f=p.fields,n=p.current;
  const modellingAssumptions=f.kind==="modelling"&&f.dataSource==="theoretical";
  switch(n){
   case "N00":return stepBody("Where are you starting?","You don't need a perfect idea yet. Just choose where you are on your journey.",
    choice("ideaStatus",[
     {value:"yes",title:"I have an idea",desc:"There's something I want to investigate.",icon:"lightbulb"},
     {value:"unsure",title:"I'm choosing between ideas",desc:"I have a few possibilities to explore.",icon:"layers"},
     {value:"no",title:"Help me find an idea",desc:"I could use some inspiration.",icon:"compass"}
    ],{stack:true,label:"Choose your starting point"}),"");
   case "N00B":return stepBody(state.ideaExplorer?.active?"Shape a possible idea.":"Find an idea worth exploring.",
    state.ideaExplorer?.active?"Write one possible aim and consider how workable it is.":"Start with something familiar, or with information you can access. Follow a branch and make the question yours.",
    ideaExplorerView(state),"");
   case "N00C":return stepBody(state.ideaExplorer?.active?"Evaluate your own idea.":"My possible ideas",
    state.ideaExplorer?.active?"Write one possible aim, rate it, and add it to your comparison.":"Compare the clarity, quick start and difficulties of the ideas you have saved. You only need one promising direction.",
    ideaComparisonView(state),"");
   case "N01":return stepBody("Give your idea a working title.","This is a starting point, not a final decision. Your title can change as your investigation develops.",
    (f.idea?'<div class="planning-idea-recall"><span>'+icon("compass")+' YOUR STARTING IDEA</span><p>'+e(f.idea)+'</p></div>':'')+
    F("provisionalTitle","My provisional IA title","e.g. How well can a model describe ...?",{hint:"A focused question or short descriptive title. You do not need to choose a technique yet."})+
    insightCapture(state,"N01")+
    F("aim","What do I want to find out mathematically?","What relationship, pattern or problem could my mathematics help me explore?",{type:"textarea",rows:2,hint:"Say what you want to investigate, rather than the answer you hope to prove."})+
    insightCapture(state,"N01A")+
    '<p class="planning-engagement-note"><strong>Personal engagement is not how much you love the topic.</strong> It grows when you explain choices in your own words, follow interesting results, change direction thoughtfully and reflect on the mathematics as you go.</p>'+
    (f.idea?'<details class="planning-extra-interest"><summary>Revise my original idea (optional)</summary>'+
    F("idea","My starting idea","The topic or observation that brought me here")+'</details>':''),
    "<h4>A title worth exploring</h4><p>Be specific enough to guide your mathematics without deciding the conclusion in advance. Your title can change after you have real results.</p>");
   case "N01V":return stepBody("Have a clear motivation.","A mathematical result is an outcome, not a reason on its own to investigate a question. Why would answering your aim be worth doing?",
    '<div class="motivation-purpose-note">'+icon("lightbulb")+
    '<div><strong>Give your mathematics a purpose</strong><p>What could answering your question help you understand, compare, explain or decide? It might help you, someone else, or develop a genuine mathematical understanding. You do not need to invent a beneficiary or promise a particular result.</p></div></div>'+
    '<div class="motivation-who"><h3>One way to think about your motivation</h3>'+
    '<p>Who might benefit from the answer? Choose a starting point; your explanation below matters more than the category.</p>'+
    choice("beneficiaryType",[
     {value:"me",title:"My own understanding or decision",icon:"target"},
     {value:"others",title:"Someone else could use it",icon:"route"},
     {value:"both",title:"Both me and others",icon:"layers"},
     {value:"unsure",title:"Still working it out",icon:"lightbulb"}],{tight:true,label:"Who might benefit from my investigation?"})+'</div>'+
    criterionMarkedField(F("beneficiary","Who might benefit, and how could the answer help?","e.g. I want to compare ... so I can decide ... / I want to explain why ...",{type:"textarea",rows:3,
     hint:"Write one genuine reason. What would knowing the answer help you understand or decide? Don't assume you will prove your prediction."}),"planning:N01V:benefit")+
    (f.intendedUse?'<details class="motivation-older-note"><summary>Earlier intended-use note (preserved)</summary><p>'+e(f.intendedUse)+'</p></details>':"")+
    '<p class="motivation-later-echo">'+icon("route")+' <span><strong>We will return to this.</strong> When you interpret results, decide what to do next and write your conclusion, check how far your findings actually answer your motivation.</span></p>'+
    (p.returnToPrediction?callout("Returning to your prediction","Your earlier mathematical choices and prediction are retained."): ""),
    "<h4>A purpose worth revisiting</h4><p>Doing mathematics merely to obtain a result is not a motivation by itself. Explain what you hope the answer will help you understand or decide. Revisit your genuine purpose when interpreting results and in your conclusion. You do not have to invent a dramatic benefit or confirm your original prediction.</p>");
   case "N02":return stepBody("What kind of investigation is this?","We will adapt the next questions to the mathematical route you choose.",
    choice("kind",[
     {value:"statistics",title:"Statistics",desc:"Investigating observations, comparisons or relationships in data.",icon:"chart"},
     {value:"modelling",title:"Mathematical modelling",desc:"Representing a situation with functions or assumptions.",icon:"flask"},
     {value:"theoretical",title:"No dataset / theoretical exploration",desc:"A conjecture, generalisation or mathematical property.",icon:"calculator"},
     {value:"unsure",title:"I'm not sure yet",desc:"Explore the differences first.",icon:"lightbulb"}])+
    (f.kind==="statistics"?small(select("statisticsContext","What form might your data take?",[
     ["Paired numerical","Two numerical variables (possible scatter)"],
     ["One numerical variable","One numerical variable / distribution"],
     ["Two groups","Comparing two or more groups"],
     ["Two categorical variables","Two categorical variables"],
     ["Repeated yes/no trials","Repeated trials with two outcomes"]])):""),
    "<h4>Three useful directions</h4><p>Statistics works with observations; modelling represents a situation with mathematical assumptions; theoretical explorations develop conjectures or mathematical reasoning. A no-data route needs teacher advice on suitability.</p>");
   case "N02M":{
    const hasCourse=!!f.course,eligible=['AI SL','AA SL'].includes(f.course);
    return stepBody("Choose your course and explore possible mathematics.",
     "A good investigation uses mathematics with a purpose. Explore plausible starting routes instead of collecting an impressive list of techniques.",
     '<div class="math-course-picker"><h3>Which IB Mathematics course are you studying?</h3>'+
     choice("course",[
      {value:"AI SL",title:"Mathematics AI SL",icon:"chart"},
      {value:"AA SL",title:"Mathematics AA SL",icon:"calculator"},
      {value:"AA HL",title:"Mathematics AA HL · teacher review",icon:"book"},
      {value:"AI HL",title:"Mathematics AI HL · teacher review",icon:"book"},
      {value:"other",title:"Another course / unsure",icon:"lightbulb"}],{tight:true,label:"My IB Mathematics course"})+'</div>'+
     '<div class="assessment-cohort-choice" data-assessment-choice>'+
      select("assessmentFramework","Which IB Mathematics IA assessment cohort applies?",[
       ["legacy","First assessment through 2028 · current A–E criteria"],
       ["revised2029","First assessment from May 2029 · updated A–D criteria"]])+
      '<p class="field-hint">Earlier Pathfinder projects stay on the existing A–E system unless you explicitly choose the revised 2029 criteria. Confirm your assessment cohort with your teacher. The revised option provides a published overview, not invented detailed descriptors or an A–E mark conversion.</p></div>'+
     ideaCue(state,'maths')+
     (eligible?renderInvestigativeRoutes(state,{e,icon,catalogue:()=>mathChoices(state)})+
      '<p class="math-scope-honesty">'+icon('info')+' This catalogue is a planning reference, not formal syllabus verification. Your teacher should confirm mathematical depth and suitability.</p>':
      hasCourse?renderInvestigativeRoutes(state,{e,icon,catalogue:()=>mathChoices(state)})+
       '<p class="math-scope-honesty">'+icon('info')+' We have not assigned another course’s techniques. Discuss your provisional mathematical direction with your teacher.</p>':
       '<p class="math-course-next">'+icon('arrow-down')+' Select your course to see possible mathematical routes. It is fine to leave techniques undecided.</p>'),
     "<h4>Start with something workable</h4><p>Choose mathematics that might answer your question and can be started with accessible observations, data or simple mathematical cases. Later, revisit your choices in response to your prediction and actual results.</p>");
   }
   case "N02U":return stepBody("Explore your investigation type.","This is a short explanation, not an extra compulsory activity.",
    bullet("Statistics","Explore actual data through graphs, distributions, relationships or comparison.")+
    bullet("Modelling","Build and test mathematical representations with clear variables, parameters and assumptions.")+
    bullet("Theoretical exploration","Test a pattern or investigate an underlying mathematical property, often without an empirical dataset.")+
    '<p class="text-small text-muted">Choose which seems promising when you return. It is fine to remain uncertain.</p>',
    "<h4>Still unsure?</h4><p>Ask which mathematical question interests you most and what evidence or examples you can realistically access.</p>","Return to investigation choices");
   case "N02T":return stepBody("This needs a teacher conversation.","A theoretical or no-data investigation may be valuable, but its mathematical suitability should be checked.",
    F("theoreticalAim","What mathematical property or conjecture might you investigate?","e.g. an identity, geometric pattern or optimisation case",{type:"textarea",rows:3})+
    F("theoreticalCase","What small example or calculation could you explore safely?","A simple numerical example, labelled diagram or tentative conjecture",{type:"textarea",rows:3})+
    callout("You can keep planning","A provisional summary remains available. Teacher discussion does not need to be completed before saving or exporting.",true),
    "<h4>What can I work on?</h4><p>Define variables, experiment with small numerical cases, test a conjecture or prepare a specific question. Numerical examples do not prove a general claim.</p>","Continue to teacher checkpoint");
   case "N03":return stepBody("Where will your data or evidence come from?","Select the sources you intend to use. We will ask different questions for each.",
    choice("dataSource",[
     {value:"primary",title:"Primary data",desc:"Observations or measurements I collect through a permitted method.",icon:"pencil"},
     {value:"secondary",title:"Secondary data",desc:"An existing dataset or reliable published source.",icon:"book"},
     {value:"both",title:"Both",desc:"I need to plan each source and explain how they work together.",icon:"layers"},
     ...(f.kind==="modelling"?[{value:"theoretical",title:"Defined mathematical assumptions",desc:"No collected data: I will define quantities, constraints and assumptions for a mathematical model.",icon:"sigma"}]:[])],{stack:true})+
    (modellingAssumptions?
      F("theoreticalAim","What mathematical question will the model investigate?","A precise design, optimisation or modelling question",{type:"textarea",rows:3})+
      F("theoreticalCase","Which starting quantities, assumptions and constraints will define the model?","State dimensions, units and restrictions; distinguish assumed values from observations",{type:"textarea",rows:3})+
      callout("Define the starting material","Assumed dimensions or tolerances can define a useful model. Identify them as assumptions and check what the conclusions depend on."):
      callout("Permissions matter","If you may collect personal or sensitive information, check school requirements before any affected activity."))+
    ideaCue(state,'evidence')+
    renderCitationReminder(state,"planning-choice",icon,e),
    "<h4>Planning your starting material</h4><p>Record what you intend to use here. In IA Studio you will explain what you actually obtained or defined and how it supports the mathematics.</p>",
    modellingAssumptions?"Continue to prediction":"Continue");
   case "N03B":return stepBody("Plan both evidence sources.","Answer each question set. They can be provisional, but both must be addressed before they join.",
    '<div class="plan-source-grid">'+
     '<div class="content-card"><strong>Primary data</strong><p class="text-small text-muted">Two short steps: collection & accuracy, then sampling</p>'+statusValue(p.sourceBranches.primary)+
     '<div style="margin-top:12px">'+route(p.sourceBranches.primary?"Edit primary questions":"Answer primary questions","Primary questions","btn-light")+'</div></div>'+
     '<div class="content-card"><strong>Secondary data</strong><p class="text-small text-muted">Source, variables, population and validation</p>'+statusValue(p.sourceBranches.secondary)+
     '<div style="margin-top:12px">'+route(p.sourceBranches.secondary?"Edit secondary questions":"Answer secondary questions","Secondary questions","btn-light")+'</div></div></div>'+
     (!p.sourceBranches.primary||!p.sourceBranches.secondary?callout("Complete each source plan","A source is addressed when you have recorded whether it is ready or still uncertain. We will not pretend to have collected either dataset."):callout("Both question sets addressed","You can now continue with a short readiness check; explain what the actual methods achieved later in IA Studio.")),
    "<h4>Why this extra step?</h4><p>A combined-data investigation needs two defensible source plans. Switching between the panels here does not mean you've actually gathered observations.</p>",
    "Continue to evidence timing");
   case "N03P":return stepBody("What will I collect, and how?",
    "Describe your method once, add the quantities you need, and decide their recording accuracy when possible.",
    ideaCue(state,'evidence')+
    primaryDataWhat(state,{F,select,e,icon}),
    "<h4>Keep your method simple</h4><p>One clear collection plan is enough at this stage. Add a few measurements, counts or categories; give units only when relevant. Use each row's accuracy control to save the resolution or exact-count rule without entering its name again.</p>",
    "Next: sampling");
   case "N03P2":return stepBody("How will I choose my data?",
    "Choose a realistic census or sampling approach, define your population, then decide whether your plan is ready.",
    primaryDataSampling(state,{F,select,e,icon}),
    "<h4>Choose a method you can really use</h4><p>Random sampling needs a suitable frame. Convenience sampling is often good for a small, repeatable investigation, but cannot justify claims about everyone.</p>",
    "Finish primary-data plan");
   case "N03S":return stepBody("Plan your secondary data.",
    "Check what published values represent and their original precision. A table's decimal places do not prove measurement accuracy.",
    ideaCue(state,'evidence')+
    F("secondaryUrl","Source link (optional while searching)","https://…",{type:"url"})+
    F("secondaryPublisher","Who published the source?","Organisation or publisher")+
    renderCitationReminder(state,"planning-secondary",icon,e)+
    F("secondaryVariables","Which variables and units will you use?","Specify relevant columns, units and definitions",{type:"textarea",rows:2})+
    F("secondaryScope","Which dates, population or subset are relevant?","Describe which observations actually connect to your aim",{type:"textarea",rows:2})+
    F("secondarySamplingOrigin","How were the published observations selected? (if known)",
     "A sample, census, administrative records or unknown collection method",{type:"textarea",rows:2})+
    accuracyPlanner(state,"secondary",{F,select,e,icon})+
    select("secondaryVerified","Have you checked the source and original data definitions?",[
     ["yes","I checked its source and variable definitions"],
     ["no","Not yet; it is a candidate source"],
     ["unsure","I need to check how to verify it"]])+
    select("secondaryStatus","How certain is your secondary-data plan?",[
     ["ready","I have a credible and workable plan"],
     ["unsure","My source, sampling information or precision remains uncertain"]]),
    "<h4>Reporting precision is not instrument accuracy</h4><p>If a table shows two decimal places, you may infer how the published value was rounded. Do not assume the original instrument was accurate to the same degree. Look for documentation; when unknown, record that honestly.</p>");
   case "N03D":return stepBody("Can you get started?",
    modellingAssumptions?"Check that you can work with the model's starting quantities and assumptions, and whether any essential resources need arranging.":
      "Check what evidence you can access now and whether anything needs arranging before you collect it. You do not need a numerical readiness score.",
    ideaCue(state,'evidence')+
    select("dataAvailability","What evidence can you work with now?",[
      ["in-hand",modellingAssumptions?"I have defined usable starting quantities and assumptions":"I already have usable evidence"],
      ["some","I have enough for a small first test"],
      ["soon","I have a realistic way to get it"],
      ["inaccessible","Getting evidence looks difficult"],
      ["unsure","I'm still working this out"]])+
    '<section class="practical-quick-check" aria-label="Permission and access checks">'+
    '<div class="primary-section-title">'+icon("clipboard-check")+
    '<div><h3>Two quick checks</h3><p>These decisions keep the investigation practical and responsible.</p></div></div>'+
    select("permissionNeed","Could permissions, consent, privacy or safety matter?",[
      ["no","No concerns identified"],["yes","Yes — I need approval or advice"],["unsure","I'm not sure yet"]])+
    (["yes","unsure"].includes(f.permissionNeed)?
      callout("Check before collecting","Do not begin affected collection or use restricted data until school requirements are resolved.",true)+
      '<details class="primary-step-extra"><summary>'+icon("pencil")+
      ' What needs discussion? (optional) '+icon("chevron-down")+'</summary>'+
      '<div class="primary-step-extra-content">'+
      F("permissionDetails","Brief note for my teacher","Avoid entering private information",{type:"textarea",rows:2})+
      '</div></details>'+
      '<div class="button-row">'+route("Discuss permissions with my teacher","Safety / privacy / consent unresolved")+'</div>':"")+
    select("practicalBlocker","Is anything essential stopping you getting started?",[
      ["no","No — I can take a small safe step"],
      ["yes","Yes — something still needs arranging"],
      ["unsure","I'm not sure what I can access yet"]])+
    (["yes","unsure"].includes(f.practicalBlocker)?
      F("unsecured","What needs arranging? (optional)","One obstacle and a realistic next step",{type:"textarea",rows:2}):"")+
    (["inaccessible","unsure"].includes(f.dataAvailability)&&f.practicalBlocker==="no"?
      F("readinessImprovement","One useful next step (optional)","A safe pilot, a better source or a teacher question",{type:"textarea",rows:2}):"")+
    (["secondary","both"].includes(f.dataSource)?
      '<p class="primary-hint">For published data, check the source can be cited and used appropriately. Keep its URL in your source plan.</p>':"")+
    '</section>'+
    '<details class="primary-step-extra" data-evidence-timing><summary>'+icon("calendar")+
      ' Set evidence target dates (optional) '+icon("chevron-down")+'</summary>'+
      '<div class="primary-step-extra-content">'+
      dates([["sourceFirstDate","Target for first usable evidence"],["sourceFullDate",modellingAssumptions?"Target for complete starting material":"Target for a complete dataset"]])+
      timelineFlags(state)+'</div></details>'+
    '<div class="button-row">'+route("Reconsider my data route","Reconsider my data route")+'</div>',
    "<h4>Ready enough to begin?</h4><p>A provisional source and a safe first step are enough. You can move on while permission or access is uncertain; this never grants approval to collect affected data. Review the actual method and its limitations in IA Studio.</p>",
    "Next: plan your time");
   case "N03R":return stepBody("Improve the data route.","Changing a plan now is a strength if your original data are not accessible.",
    F("readinessImprovement","What might make the data plan more realistic?","Try a pilot, alternative source, smaller scope or a revised method",{type:"textarea",rows:3})+
    '<div class="button-row">'+route("I need teacher advice about access","No accessible data; request teacher guidance")+'</div>',
    "<h4>No dead ends</h4><p>If your source is inaccessible, speak to your teacher and save the rest of your plan. Do not invent data or treat a practical delay as a mathematical limitation.</p>","Return to source choices");
   case "N03H":return stepBody("Plan your IA time.","Two quick questions are enough to start. We can suggest milestones for data, mathematics, writing and review.",
    renderTimelineStep(state,{e,icon,F,choice,callout}),
    "<h4>Keep it flexible</h4><p>These are suggestions, not school deadlines. Aim for usable starting material early, mathematical investigation and reflection along the way, then a complete draft with time to check it. The plan can change.</p>");
   case "N04":return stepBody("Which IB Mathematics course are you studying?","The mathematical menu is course-specific. Other courses can still prepare a provisional plan for teacher review.",
    choice("course",[
      {value:"AI SL",title:"Mathematics AI SL",icon:"chart"},
      {value:"AA SL",title:"Mathematics AA SL",icon:"calculator"},
      {value:"AA HL",title:"Mathematics AA HL (teacher discussion)",icon:"book"},
      {value:"AI HL",title:"Mathematics AI HL (teacher discussion)",icon:"book"},
      {value:"other",title:"Another course / unsure",icon:"lightbulb"}],{stack:true})+
    callout("Course alignment","The current catalog reflects the source sheet's AI SL and AA SL options. It does not automatically certify that a technique is on your syllabus."),
    "<h4>Mathematical depth matters</h4><p>Use an appropriate technique to investigate a genuine question. More advanced mathematics is not automatically a better IA.</p>");
   case "N04T":return stepBody("Record mathematics for your teacher to review.","The AI SL/AA SL menu should not be used as if it were an official menu for your course.",
    ideaCue(state,'maths')+
    F("otherCourseMaths","Mathematics I'm considering","A tentative technique, question or Not sure yet",{type:"textarea",rows:3})+
    F("teacherQuestion","What would you like to confirm with your teacher?","Suitability, mathematical depth or practical first steps",{type:"textarea",rows:2})+
    callout("Provisional plan","You can still develop your aim, mathematics and safe first step. Teacher validation remains outstanding.",true),
    "<h4>Proceed provisionally</h4><p>Do not interpret an exported report as approval of out-of-course mathematics.</p>");
   case "N04S":return stepBody("Which mathematics might help answer your aim?","Choose possible techniques, not a checklist of things you must do.",
    ideaCue(state,'maths')+
    renderInvestigativeRoutes(state,{e,icon,catalogue:()=>mathChoices(state)}),
    "<h4>What's a good selection?</h4><p>A few purposeful techniques beat many disconnected ones. Routine syllabus maths can be used without tutorial-style explanations. Research beyond the syllabus should show your understanding when actually used.</p>");
   case "N01P":{
    const choices=relevantPredictionOptions(state),open=p.refinePlanOpen===true;
    const selected=selectedMaths(state).filter(item=>item.course===f.course);
    const refinePanel='<div class="planning-prediction-refine">'+
     '<button type="button" class="planning-prediction-refine-toggle" data-action="plan-refine-toggle"'+
     ' aria-expanded="'+open+'" aria-controls="planning-prediction-refine-panel">'+
     icon('sliders-horizontal')+' <span>Refine the plan <small>(optional)</small></span>'+
     icon(open?'chevron-up':'chevron-down')+'</button>'+
     (open?'<div id="planning-prediction-refine-panel" class="planning-prediction-refine-panel">'+
      '<p class="primary-hint">If your expectation gives you a better mathematical direction, adjust it here. Your earlier choices are retained, and a prediction does not establish a pattern.</p>'+
      select('course','Mathematics course',[
       ['AI SL','Mathematics AI SL'],['AA SL','Mathematics AA SL'],
       ['AA HL','Mathematics AA HL (teacher review)'],['AI HL','Mathematics AI HL (teacher review)'],
       ['other','Another course / unsure']])+
      renderInvestigativeRoutes(state,{e,icon,catalogue:()=>mathChoices(state)})+
      '<details class="planning-refine-check"><summary>'+icon('circle-help')+
       ' Check mathematical suitability (optional) '+icon('chevron-down')+'</summary>'+
       '<div class="planning-refine-check-body">'+
       select('courseSuitability','Could the chosen mathematics answer my aim?',[
        ['yes','I can explain how it might help'],['unsure','I need to check'],['no','I may need to change approach']])+
       select('mathsOutside','Is this mathematics familiar within my course?',[
        ['syllabus','Mainly within the syllabus'],['outside','Possibly beyond the syllabus'],
        ['unsure','Not sure — a teacher check would help']])+
       F('mathsRevisedWhy','Why might this mathematical direction help? (optional)',
        'A relevant mathematical question or quantity',{type:'textarea',rows:2})+
       (f.courseSuitability==='no'||f.mathsOutside==='outside'||f.mathsOutside==='unsure'?
        '<div class="button-row">'+route('Ask my teacher about suitability','Outside-course maths or unclear mathematical depth')+'</div>':'')+
       '</div></details>'+
      '</div>':
      '<span class="planning-prediction-refine-summary">'+
       e(selected.length?selected.length+' possible technique'+(selected.length===1?'':'s')+' chosen':'Mathematical choices can be adjusted here')+
       '</span>')+'</div>';
    return stepBody("What do you predict might happen?",
      "A prediction can help you focus, but it is optional and is not a result. You can also choose to explore first.",
      summary("Your investigation aim",f.aim)+
      ideaCue(state,'first')+
      (f.beneficiary?summary("My motivation — why this matters",f.beneficiary+(f.intendedUse?" — "+f.intendedUse:"")):"")+
      refinePanel+
      '<div class="field-group"><label class="field-label">Some possible predictions (optional)</label>'+
      choice("predictionId",choices.map(x=>({value:x.id,title:x.question,
       desc:x.id==="X02"?"It is fine to explore before forming a prediction.":""})),{stack:true,tight:true})+'</div>'+
      F("prediction","My tentative prediction or conjecture (optional)",
       "Use your own words, or leave blank and explore first.",{type:"textarea",rows:2})+
      (f.predictionPrior?summary("Earlier prediction saved as a note (not current)",f.predictionPrior):"")+
      (f.predictionId!=="X02"&&(f.prediction.trim()||f.predictionId)?
       F("predictionWhy","Why do I expect this? (optional)",
        "Experience, observation or a small mathematical case",{type:"textarea",rows:2})+
       F("predictionImplication","If it were true, what might it mean? (optional)",
        "A possibility, not advice supported by results",{type:"textarea",rows:2}):"")+
      (f.predictionId==="X02"?'<p class="primary-hint">No prediction needed yet. Explore some genuine mathematics and decide what questions arise.</p>':"")+
      '<div class="button-row">'+route("Refine my motivation","Edit 'Who is this for?' while predicting")+'</div>'+
      callout("Your result might surprise you",
       "A different finding is not failure. Interpret actual evidence rather than trying to confirm an early prediction."),
      "<h4>A tentative expectation, not a commitment</h4><p>It is fine to explore first. If you change your expected mathematical direction, open Refine the plan here rather than repeating a second mathematics-choice screen.</p>",
      "Next: can I get started?");
   }
   case "N06T":return stepBody("A brief teacher check-in.","Every student can note one question. If you've already completed a specialist check-in, your answers are kept.",
    (f.teacherQuestion?summary("Existing teacher question",f.teacherQuestion):"")+
    F("universalTeacherQuestion","Anything you would like to discuss with your teacher? (optional)","Aim, mathematical suitability, feasibility or what you'd like to achieve",{type:"textarea",rows:2})+
    F("teacherSchedule","Possible discussion date (optional)","",{type:"date"})+
    (planningFlags(state).length?teacherWarnings(state)+
      '<div class="button-row">'+route("Open a specialist teacher checkpoint","Specialist teacher issue")+'</div>':
      callout("You can still ask a question","A teacher conversation is useful but does not block your provisional summary.")),
    "<h4>No assumed approval</h4><p>Recording a teacher question or choosing to skip it does not mean the teacher has approved this plan.</p>");
   case "N08":return stepBody("What would you like to ask your teacher?","Record one precise question and a safe action while waiting. You can still export a provisional plan.",
    teacherWarnings(state)+
    (f.kind==="theoretical"?F("theoreticalAim","What mathematical property could you investigate?","A conjecture or pattern you want to understand",{type:"textarea",rows:3})+
      F("theoreticalCase","A simplified case that could get you started","What could you test or calculate?",{type:"textarea",rows:2})+
      F("theoreticalPrediction","A tentative conjecture (optional)","What mathematical claim might be true?",{type:"textarea",rows:2})+
      (f.theoreticalPrediction?F("theoreticalWhy","Why might the claim hold?","Reasoning from examples or mathematical structure",{type:"textarea",rows:2}):""):"")+
    (f.course&&!["AI SL","AA SL"].includes(f.course)?F("otherCourseMaths","Possible mathematics for this course","What would you ask about?",{type:"textarea",rows:2}):"")+
    F("teacherNeed","Which part of the plan needs advice?","Maths, data, access, safety or scope",{type:"textarea",rows:2})+
    F("teacherQuestion","A specific question for my teacher","What would you like to clarify?",{type:"textarea",rows:3})+
    F("teacherSafeAction","One safe step I can do before getting feedback","Review an assumption, refine an aim or prepare a permitted example",{type:"textarea",rows:2})+
    F("teacherExtra","Anything else you would like your teacher to know? (optional)","An important uncertainty, interest or practical constraint",{type:"textarea",rows:2})+
    '<div class="button-row">'+route("Revise my aim","Revisit existing planning answers")+route("Plan milestones and course mathematics","Optional: plan milestones before export")+
    '<span class="primary-hint">Choose your first mathematical representation in IA Studio once you have a direction.</span>'+'</div>'+
    callout("Provisional summary stays available","An unresolved flag must remain visible. Do not begin affected collection requiring permission, but you can save this work.",true),
    "<h4>Safety comes first</h4><p>A teacher checkpoint does not mean consent or safety permission has been granted. It also does not prevent saving or printing a provisional plan.</p>",
    "Review my provisional plan");
   case "N06":return stepBody("Your investigation plan at a glance.","Review what you've actually decided, what is tentative, and what still needs discussing.",
    '<div class="plan-review">'+
    ideaCue(state,'review')+
    summary("Investigation aim",f.aim)+edit("N01","Edit aim")+
    summary("My motivation — why the answer matters",f.beneficiary+(f.intendedUse?" — "+f.intendedUse:""))+edit("N01V","Edit motivation")+
    summary("Course and mathematical direction",(f.course||"Not confirmed")+" · "+(selectedMaths(state).map(x=>x.label).join("; ")||f.otherMaths||f.otherCourseMaths||"Still to decide"))+edit("N02M","Edit maths")+
    summary("Evidence plan",modellingAssumptions?"Defined mathematical assumptions · "+(f.theoreticalCase||f.theoreticalAim||"Starting assumptions to confirm"):
      f.kind==="theoretical"?(f.theoreticalCase||"Theoretical cases to confirm"):
      (f.dataSource||"No source chosen")+" · "+(f.primaryWhat||f.secondaryPublisher||"source details to confirm"))+
    summary("Prediction (optional)",f.prediction||(f.predictionId==="X02"?"Exploring first":"No prediction recorded"))+
    (f.predictionWhy?summary("Why I predicted it",f.predictionWhy):"")+
    (f.predictionImplication?summary("What it might mean IF TRUE",f.predictionImplication):"")+
    (f.firstAction||f.figureOther||f.figureType?summary("Earlier proposed first mathematics (preserved)",f.firstAction||f.figureOther||f.figureType):"")+
    summary("Current evidence availability",f.kind==="theoretical"?"Not required":f.dataAvailability||"Still to check")+
    summary("Permissions and consent",f.kind==="theoretical"?"Not applicable":f.permissionNeed||"Still to check")+
    summary("Access to essential resources",f.kind==="theoretical"?"Not applicable":f.practicalBlocker||"Still to check")+
    teacherWarnings(state)+
    '<div class="button-row">'+edit("N03H","Edit timeline")+edit("N08","Teacher questions")+'</div></div>'+
    callout("This is not an approved IA","A provisional plan is useful even if parts need clarification. The result and intended benefit have not yet been demonstrated."),
    "<h4>How to review</h4><p>Confirm your aim, whether the mathematical methods serve it, source feasibility, actual deadlines and any teacher flags. A pending decision never prevents a provisional summary.</p>",
    "Review and save plan");
   case "N07":return stepBody("Your provisional plan is ready to take forward.","Planning is complete for now. Your mathematical findings—and perhaps your aim—may evolve as you write.",
    '<div class="planning-finish-handoff" aria-label="End of Planning, beginning of IA Studio">'+
    '<span class="planning-finish-seal" aria-hidden="true">'+icon("check")+'</span>'+
    '<div class="planning-finish-handoff-text"><span class="planning-finish-kicker">CHAPTER 1 COMPLETE</span>'+
    '<strong>You have finished Planning!</strong>'+
    '<p>Your provisional choices are saved. Next, begin your own introduction in IA Studio. You can revisit your plan whenever your mathematical investigation changes.</p>'+
    '<div class="planning-finish-path" aria-label="Planning complete, Introduction in IA Studio next">'+
    '<span class="planning-finish-path-done">'+icon("check")+' Planning</span>'+
    icon("arrow-right")+
    '<span class="planning-finish-path-next">IA Studio · Introduction</span></div></div></div>'+
    ideaCue(state,'first')+
    summary("Provisional IA title",f.provisionalTitle)+summary("Your aim",f.aim)+
    (f.firstAction?summary("Earlier first-step idea (preserved)",f.firstAction):"")+
    '<p class="primary-hint">The first genuine mathematical representation belongs in IA Studio.</p>'+
    F("planIdentifier","Optional label for my copy of this plan","e.g. My IA plan — revision 2")+teacherWarnings(state)+
    '<div class="planning-finish-resources"><p class="planning-finish-resources-title">Keep or review your plan (optional)</p>'+
    '<div class="button-row">'+button("Download my planning PDF","export-plan-pdf","btn-secondary","", "download")+
    button("Download editable Word plan","export-plan-docx","btn-secondary","", "download")+
    button("View working report","go-report","btn-quiet","", "file")+
    button("Download project backup","export-json","btn-secondary","", "download")+
    route("Review my plan again","Revisit an answer or correct a detail")+'</div></div>'+
    callout("Export reminder","Your PDF and Word reports contain an importable Planning snapshot. Later edits to the visible document do not update that snapshot automatically. Use a JSON backup to restore your entire IA Studio work."),
    "<h4>What happens next?</h4><p>Begin your own introduction in IA Studio, then verify actual sources and permissions before collecting restricted data. Planning choices are not mathematical findings or teacher approval; you can revise the plan later.</p>",
    "Begin writing in IA Studio");
   default:return stepBody("Review this planning question.","This source stage isn't ready yet.",callout("Stage not recognised","Use your project report to preserve any work."),"");
  }
 }
 function footer(state,screen){
  const n=state.planning.current;
  if(n==="N00")return '<div class="task-footer planning-kickoff-footer">'+
   '<p class="planning-kickoff-note">You can change your mind later.</p>'+
   '<div class="button-row">'+button("Let's go","plan-advance","btn-primary","", "arrow-right")+'</div></div>';
  if(n==="N00B"||n==="N00C")return ideaFooter(state);
  if(n==="N03B")return '<div class="task-footer">'+button("Back","plan-back","btn-quiet","", "chevron-left")+
   (state.planning.sourceBranches.primary&&state.planning.sourceBranches.secondary?button("Next: prediction","plan-advance","btn-primary","", "arrow-right"):button("Continue the other source","plan-advance","btn-primary","", "arrow-right"))+'</div>';
  if(n==="N07"){
   const returning=state.completion.visited.some(id=>!["C00","C01"].includes(id))||
    state.entries.length>0||Object.values(state.scratch||{}).some(value=>typeof value==="string"&&value.trim());
   return '<div class="task-footer planning-finish-footer">'+
    '<div class="planning-finish-footer-left">'+button("Back to review","plan-back","btn-quiet","", "chevron-left")+
    '<span class="planning-finish-footer-note">End of Planning · Next chapter: IA Studio</span></div>'+
    button(returning?"Return to IA Studio":"Finish planning & begin writing","plan-finish-writing","btn-finish-planning","", "arrow-right")+'</div>';
  }
  const only=N=>N==="N08"?"Continue to review":N==="N02U"?"Back to route":N==="N03R"?"Retry source plan":N==="N00C"?"Use this idea":screen.label;
  return '<div class="task-footer">'+(state.planning.history.length?button("Back","plan-back","btn-quiet","", "chevron-left"):button("Home","go-home","btn-quiet"))+
   '<div class="button-row">'+button(only(n),"plan-advance","btn-primary","", "arrow-right")+'</div></div>';
 }
 function viewPlanning(){
  const state=ctx.getState(),p=state.planning,n=p.current;
  const existingPlan=p.completed||p.completedNodes.length>0||
   p.visited.some(id=>id!=="N00")||!!(p.fields.aim||p.fields.provisionalTitle||p.fields.idea).trim();
  const welcome=state.ui.planningIntroOpen===true||
   (n==="N00"&&!state.ui.planningIntroSeen&&!existingPlan);
  const screen=welcome?planningWelcome():nodePage(state);
  const stage=planningStage(n),stageI=PROGRESS_GROUPS.findIndex(x=>x.id===stage),kickoff=n==="N00",titleStep=n==="N01",ideaMapStep=n==="N00B";
  return '<div class="page planning-page">'+tabletNav()+
   '<div class="planning-page-layout">'+planningLearningTrail(state,{support:kickoff?'':criteriaPanel(state)})+
   '<div class="planning-page-main">'+
   '<div class="progress-top"><span class="progress-overview">'+icon("compass")+' Guided Planning</span>'+
   '<span class="progress-counter">1. Planning · '+e(welcome?"How Pathfinder works":PROGRESS_GROUPS[stageI]?.label||"Review")+'</span>'+
   (welcome?'':'<button type="button" class="chapter-guide-reopen" data-action="planning-intro-open">'+icon("circle-help")+' How this works</button>')+'</div>'+
   '<div class="task-shell'+(welcome?' chapter-onboarding-shell':'')+(kickoff&&!welcome?' planning-kickoff':'')+(titleStep?' planning-title-step':'')+(n==="N07"?' planning-finish':'')+'" data-source-node="'+e(n)+'"'+(welcome?' data-planning-intro="true"':'')+'>'+
   criterionPageHeading(welcome?screen.title:planningScreenTitle(n,state),"planning",n)+'<p class="task-intro">'+e(screen.intro)+'</p>'+
   (welcome?'':renderSparkShelf(state,n,{surface:'planning'}))+screen.html+
   (!welcome&&["N01","N01V","N02M","N03P","N03P2","N03S","N04S"].includes(n)?
    '<div class="planning-context-examples" aria-label="Examples for this planning decision">'+examplePrompt(state)+'</div>':'')+
   (welcome||kickoff||titleStep?'':insightCapture(state,n))+(welcome||kickoff||titleStep?'':essentialsNudge(state))+
   (welcome||kickoff||titleStep||ideaMapStep?'':'<div class="example-row">'+helpButton("plan-"+n,n==="N01V"?"Why does this matter?":"Help me think")+helpBox("plan-"+n,screen.help)+'</div>')+
   (welcome?'<div class="task-footer chapter-onboarding-footer">'+
      '<span class="chapter-onboarding-footer-hint">A short tour. Nothing to fill in yet.</span>'+
      button(n==="N00"&&!existingPlan&&!state.ui.planningIntroSeen?"Start planning":"Return to my planning","planning-intro-continue","btn-primary","","arrow-right")+'</div>':footer(state,screen))+'</div>'+
   (welcome||kickoff||ideaMapStep?'':'<p class="small-callout">Your choices are provisional until evidence supports them. You can revisit earlier decisions. Teacher flags never prevent a provisional report.</p>')+
   (p.notices&&p.notices.length?'<div class="inline-note warning">'+icon("info")+'<p>'+e(p.notices.at(-1))+'</p></div>':"")+
   '</div></div></div>';
 }
 return {viewPlanning};
}
