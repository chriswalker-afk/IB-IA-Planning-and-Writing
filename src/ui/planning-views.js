import {planningLearningTrail} from './living-journey.js';
import {earlyMathRecommendations} from '../planning/math-recommendations.js';
import {insightCapture} from './insight-threads.js';
import {examplePrompt} from "../examples/views.js";
import {criteriaPanel,essentialsNudge} from "../essentials/views.js";
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
 /** One compact expandable spark, backed by the canonical Planning aim. */
 function compactAimSpark(state){
  const aim=state.planning.fields.aim||state.project?.aim||"";
  const preview=aim.trim()?(aim.trim().length>90?aim.trim().slice(0,89)+"…":aim.trim()):"Your aim is still developing";
  return '<details class="motivation-aim-spark" data-motivation-aim-spark>'+
   '<summary><span class="motivation-aim-symbol">'+icon("target")+'</span>'+
   '<span class="motivation-aim-copy"><strong>My aim spark</strong><small data-motivation-aim-preview>'+e(preview)+'</small></span>'+
   '<span class="motivation-aim-toggle">'+icon("pencil")+' View / edit</span></summary>'+
   '<div class="motivation-aim-details"><p>Your aim can change. Editing here updates the same aim used across your investigation.</p>'+
   F("aim","Refine my investigation aim","What mathematical question am I trying to answer?",{type:"textarea",rows:2})+
   '</div></details>';
 }
 /** All later screens use small, expandable, editable versions of the original
  * sparks. They write into the same Planning fields, never a second copy. */
 function planningReturnSparks(state){
  const fields=state.planning.fields;
  const specs=[
   {key:'aim',title:'My question',symbol:'target',kind:'aim',hint:'Refine the question in your own words. This will update the same saved aim throughout your IA.',label:'Refine my investigation aim'},
   {key:'beneficiary',title:'My motivation',symbol:'compass',kind:'motivation',hint:'Update why finding the answer matters to you or someone else; the mathematical results must still support any advice.',label:'Refine why this answer matters'}
  ];
  const cards=specs.filter(x=>String(fields[x.key]||'').trim()).map(x=>{
   const content=String(fields[x.key]).trim(),preview=content.length>90?content.slice(0,89)+'…':content;
   return '<details class="motivation-aim-spark planning-return-spark insight-'+x.kind+'" data-planning-return-spark="'+e(x.key)+'">'+
    '<summary><span class="motivation-aim-symbol">'+icon(x.symbol)+'</span>'+
    '<span class="motivation-aim-copy"><strong>'+e(x.title)+'</strong><small data-spark-preview-path="planning.fields.'+e(x.key)+'">'+e(preview)+'</small></span>'+
    '<span class="motivation-aim-toggle">'+icon('pencil')+' Edit</span></summary>'+
    '<div class="motivation-aim-details"><p>'+e(x.hint)+'</p>'+
    F(x.key,x.label,'Write in your own words',{type:'textarea',rows:2})+'</div></details>';
  });
  return cards.length?'<section class="planning-compact-recall" aria-label="Earlier ideas you can refine">'+
    '<p class="planning-compact-recall-label">'+icon('sparkles')+' Your sparks are back <span>Open to revisit or edit</span></p>'+
    '<div class="planning-compact-sparks">'+cards.join('')+'</div></section>':'';
 }
 const route=(label,condition,cls="btn-secondary")=>'<button type="button" class="btn '+cls+'" data-action="plan-route" data-condition="'+e(condition)+'">'+e(label)+icon("arrow-right")+'</button>';
 const edit=(id,label)=>'<button type="button" class="btn btn-quiet btn-sm" data-action="plan-edit" data-node="'+e(id)+'">'+e(label)+icon("chevron-right")+'</button>';
 const stepBody=(title,intro,html,help="",label="Continue")=>({title,intro,html,help,label});
 const small=(html)=>'<div class="task-section">'+html+'</div>';
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
 function mathChoices(state,suggested=false){
  const f=state.planning.fields,course=f.course;
  if(!["AI SL","AA SL"].includes(course))return callout("Course review needed","No AI SL or AA SL menu is applied to this course. Record a provisional technique and ask your teacher.",true)+
   F("otherCourseMaths","Which mathematics might be useful?","A tentative technique, or Not sure yet",{type:"textarea",rows:3});
  const chosen=selectedMaths(state),foreign=chosen.filter(x=>x.course!==course);
  const suggestions=suggested?predictionMathSuggestions(state):[];
  return (suggested?'<div class="context-card">'+icon("lightbulb")+'<div><strong>Revisit, don’t restart</strong><p>These are your original selections. Add or remove techniques if your predicted pattern suggests a better question. Suggestions are optional and are not evidence that a result will occur.</p></div></div>':"")+
   (suggested&&suggestions.length?'<div class="task-section"><label class="field-label">Mathematics that might be worth considering</label>'+
     mathCards(state,suggestions.map(x=>x.id))+'</div>':"")+
   '<div class="field-group"><label class="field-label" for="planMathSearch">Search '+e(course)+' mathematics</label>'+
   '<input id="planMathSearch" class="field" type="search" placeholder="Search a topic or technique" data-plan-search value="'+e(state.planning.mathSearch)+'"></div>'+
   '<div class="plan-math-count"><span>Selected: <strong>'+chosen.length+'</strong></span><span>Choose only mathematics with a purpose</span></div>'+
   mathCards(state)+
   (foreign.length?callout("Course changed",e("Earlier choices from a different course: "+foreign.map(x=>x.label).join(", ")+". Revisit these with your teacher; they have not been silently discarded."),true):"")+
   F("otherMaths","Another technique I might use (optional)","Describe a different or researched technique",{type:"textarea",rows:2})+
   callout("Not sure yet?","You may leave every technique unselected and continue. You are not rewarded for choosing more mathematics.");
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
 function nodePage(state){
  const p=state.planning,f=p.fields,n=p.current;
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
    compactAimSpark(state)+
    '<div class="motivation-purpose-note">'+icon("lightbulb")+
    '<div><strong>Give your mathematics a purpose</strong><p>What could answering your question help you understand, compare, explain or decide? It might help you, someone else, or develop a genuine mathematical understanding. You do not need to invent a beneficiary or promise a particular result.</p></div></div>'+
    '<div class="motivation-who"><h3>One way to think about your motivation</h3>'+
    '<p>Who might benefit from the answer? Choose a starting point; your explanation below matters more than the category.</p>'+
    choice("beneficiaryType",[
     {value:"me",title:"My own understanding or decision",icon:"target"},
     {value:"others",title:"Someone else could use it",icon:"route"},
     {value:"both",title:"Both me and others",icon:"layers"},
     {value:"unsure",title:"Still working it out",icon:"lightbulb"}],{tight:true,label:"Who might benefit from my investigation?"})+'</div>'+
    F("beneficiary","Who might benefit, and how could the answer help?","e.g. I want to compare ... so I can decide ... / I want to explain why ...",{type:"textarea",rows:3,
     hint:"Write one genuine reason. What would knowing the answer help you understand or decide? Don't assume you will prove your prediction."})+
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
     {value:"both",title:"Both",desc:"I need to plan each source and explain how they work together.",icon:"layers"}],{stack:true})+
    callout("Permissions matter","If you may collect personal or sensitive information, check school requirements before any affected activity."),
    "<h4>Planning a source is not collecting data</h4><p>Record what you intend to do here. In IA Studio you will confirm what you actually obtained and used.</p>");
   case "N03B":return stepBody("Plan both evidence sources.","Answer each question set. They can be provisional, but both must be addressed before they join.",
    '<div class="plan-source-grid">'+
     '<div class="content-card"><strong>Primary data</strong><p class="text-small text-muted">Who/what, where, when, how and equipment</p>'+statusValue(p.sourceBranches.primary)+
     '<div style="margin-top:12px">'+route(p.sourceBranches.primary?"Edit primary questions":"Answer primary questions","Primary questions","btn-light")+'</div></div>'+
     '<div class="content-card"><strong>Secondary data</strong><p class="text-small text-muted">Source, variables, population and validation</p>'+statusValue(p.sourceBranches.secondary)+
     '<div style="margin-top:12px">'+route(p.sourceBranches.secondary?"Edit secondary questions":"Answer secondary questions","Secondary questions","btn-light")+'</div></div></div>'+
     (!p.sourceBranches.primary||!p.sourceBranches.secondary?callout("Complete each source plan","A source is addressed when you have recorded whether it is ready or still uncertain. We will not pretend to have collected either dataset."):callout("Both question sets addressed","You can now consider why you need both sources and how to compare them.")),
    "<h4>Why this extra step?</h4><p>A combined-data investigation needs two defensible source plans. Switching between the panels here does not mean you've actually gathered observations.</p>",
    "Continue to method comparison");
   case "N03P":return stepBody("Plan your primary data.","Think about a reproducible method. Do not enter identifiable participant information.",
    F("primaryWhat","What will you measure or record?","Variables, quantity and units",{type:"textarea",rows:2})+
    '<div class="field-row">'+F("primaryWhen","When could you collect it?","",{type:"date"})+
    F("primaryWhere","Where could you do this?","Setting without private details")+'</div>'+
    F("primaryPopulation","Who or what will you study?","Population or objects, not participants' names")+
    F("primaryHow","How will you collect or measure it?","A clear method and any sampling strategy",{type:"textarea",rows:3})+
    F("primaryEquipment","Equipment or resources needed","Tools and their relevant accuracy")+
    F("primarySampling","Sampling plan (only if relevant)","Census, random sample, convenience and why",{type:"textarea",rows:2})+
    select("primaryStatus","How certain is your primary-data plan?",[
     ["ready","I have a workable collection plan"],["unsure","Parts of my method or access are still uncertain"]]),
    "<h4>Method first</h4><p>Choose a sampling method or collection approach that suits the aim. Describe limitations of the actual design later, not an imagined perfect study.</p>");
   case "N03S":return stepBody("Plan your secondary data.","A proposed web link is not yet a verified usable dataset.",
    F("secondaryUrl","Source link (optional while searching)","https://…",{type:"url"})+
    F("secondaryPublisher","Who published the source?","Organisation or publisher")+
    F("secondaryVariables","Which variables and units will you use?","Specify variables, units and definitions",{type:"textarea",rows:2})+
    F("secondaryScope","Which dates, population or subset are relevant?","The part that actually connects to your aim",{type:"textarea",rows:2})+
    select("secondaryVerified","Have you confirmed this source is usable?",[
     ["yes","I checked the source and variables"],["no","Not yet; it is a candidate source"],["unsure","I'm not sure how to verify it"]])+
    select("secondaryStatus","How certain is your secondary-data plan?",[
     ["ready","I have a credible and workable plan"],["unsure","My source or its suitability remains uncertain"]]),
    "<h4>Check relevance</h4><p>Inspect actual fields, definitions, dates and population. A reputable publisher doesn't guarantee this dataset answers your aim. Cite the source when it is actually used.</p>");
   case "N03J":return stepBody("Why is this method worth choosing?","Compare with one realistic alternative. There is no need for a generic essay on sampling.",
    F("alternativeMethod","Another possible method or source","An alternative you genuinely considered",{type:"textarea",rows:2})+
    F("methodReason","Why does your preferred approach suit your aim?","What would make this evidence useful?",{type:"textarea",rows:3})+
    F("methodLimitation","What is its most important likely limitation?","Measurement uncertainty, selection, source coverage …",{type:"textarea",rows:2})+
    F("methodMitigation","Could you reduce or accept that limitation? (optional)","One feasible adjustment or an honest scope qualification",{type:"textarea",rows:2})+
    ((f.primaryHow||"").toLowerCase().includes("survey")?F("primarySampling","Survey: which population and sampling strategy?","Explain choice, access, bias and wording",{type:"textarea",rows:2}):""),
    "<h4>A targeted comparison</h4><p>Don't recite every sampling method. The question is why your chosen approach serves this particular aim better than a plausible alternative.</p>");
   case "N03D":return stepBody("When can you start doing useful mathematics?","An early small dataset can be more valuable than waiting for everything to be complete.",
    dates([["sourceFirstDate","Target for first usable evidence"],["sourceFullDate","Target for complete dataset"]])+
    select("dataAvailability","What evidence is available now?",[
     ["in-hand","I already have usable evidence"],["some","I have part of it"],["soon","A credible route to obtaining it"],["inaccessible","Access currently looks difficult"],["unsure","Not sure yet"]])+
    timelineFlags(state),
    "<h4>Useful evidence first</h4><p>Plan to produce a small first graph or example before the entire dataset is ready, provided you clearly label provisional work.</p>");
   case "N03E":return stepBody("How ready is your data plan?","This is a self-check of access and source confidence, not a prediction of your IB grade.",
    rating("dataReadiness","Rate data readiness /5","1 = little access; 5 = actual usable data in hand. A credible near-term plan may justify 4.")+
    (Number(f.dataReadiness)===5&&f.dataAvailability!=="in-hand"?callout("Check this rating","A 5/5 means usable data are already available. If not, consider a lower provisional rating.",true):"")+
    (Number(f.dataReadiness)>0&&Number(f.dataReadiness)<4?F("readinessImprovement","One specific step that would improve readiness","An early pilot, usable source link, narrowed scope or confirmed dates",{type:"textarea",rows:2}):"")+
    '<div class="button-row">'+route("Reconsider my data route","Revise")+'</div>',
    "<h4>Two independent ratings</h4><p>This one concerns usable evidence. The next questions consider how manageable the rest of the project will be.</p>");
   case "N03R":return stepBody("Improve the data route.","Changing a plan now is a strength if your original data are not accessible.",
    F("readinessImprovement","What might make the data plan more realistic?","Try a pilot, alternative source, smaller scope or a revised method",{type:"textarea",rows:3})+
    '<div class="button-row">'+route("I need teacher advice about access","No accessible data; request teacher guidance")+'</div>',
    "<h4>No dead ends</h4><p>If your source is inaccessible, speak to your teacher and save the rest of your plan. Do not invent data or treat a practical delay as a mathematical limitation.</p>","Return to source choices");
   case "N03F":return stepBody("Could you complete the practical work?","Check resources, approvals and workload separately from whether the mathematics is interesting.",
    F("dependencies","What people, locations, software or equipment are essential?","Only the essentials (or none)",{type:"textarea",rows:2})+
    F("unsecured","What essential access is not yet arranged?","Who or what, and a realistic plan for access",{type:"textarea",rows:2})+
    select("permissionNeed","Could permissions, consent or private information matter?",[
     ["no","No such issues identified"],["yes","Yes — I need to check or seek approval"],["unsure","I'm unsure; I need advice"]])+
    (["yes","unsure"].includes(f.permissionNeed)?F("permissionDetails","What needs discussion? (no personal details)","A survey, restricted source or safety issue",{type:"textarea",rows:2}):"")+
    select("softwareReady","Can you use the necessary tools for a small test?",[
     ["yes","Yes"],["notyet","Not yet, but I can learn or test"],["unsure","I'm not sure"]])+
    select("cleaningBurden","How much data processing might be needed?",[
     ["none","Very little"],["some","Some manageable cleaning"],["lots","Potentially substantial work"],["unsure","I don't know yet"]])+
    F("workloadHours","Rough non-mathematical setup time (hours, optional)","e.g. 4")+
    F("externalRisks","Any time-sensitive event or dependency on others?","Weather, events, responses or travel",{type:"textarea",rows:2})+
    ((f.cleaningBurden==="lots"||f.unsecured||f.externalRisks)?F("backupMethod","A credible backup if something fails","A suitable alternate method, not invented observations",{type:"textarea",rows:2}):"")+
    '<details class="plan-details"><summary>Relevant further feasibility checks (optional)</summary><div class="task-section">'+
    ((f.unsecured||f.cleaningBurden==="lots"||f.externalRisks)?
      F("minimumVersion","Smallest workable version of this investigation","A narrower scope, simpler method or smaller permitted sample",{type:"textarea",rows:2}):"")+
    (f.softwareReady!=="yes"?select("pilotReady","Have you tried one data point all the way to a graph or calculation?",[
      ["yes","Yes — a small complete test"],["no","Not yet"],["unsure","Not yet possible or unsure"]]):"")+
    (f.dependencies||f.unsecured?select("costIssue","Are cost, travel or specialist access an issue?",[
      ["no","No"],["yes","Yes"],["unsure","Possibly"]]):"")+
    (["secondary","both"].includes(f.dataSource)?select("sourceRights","Can the source materials be cited and used appropriately?",[
      ["yes","Yes"],["no","Not yet"],["unsure","I need to check"]]):"")+
    select("dataSufficiency","Does the proposed dataset seem adequate for your aim?",[
      ["yes","Yes, provisionally"],["no","Probably not"],["unsure","An initial sample may help"]])+
    (["statistics","modelling"].includes(f.kind)?select("negativeResultViable","Could the investigation still be worthwhile if no hoped-for pattern appears?",[
      ["yes","Yes"],["no","I may need to revise the question"],["unsure","I will check"]]):"")+
    select("presentationManageable","Can the important data and figures be presented concisely?",[
      ["yes","Yes"],["no","I need a simpler presentation plan"],["unsure","I'll check"]])+
    '</div></details>'+
    (["yes","unsure"].includes(f.permissionNeed)?small(callout("Safety, privacy and consent","You can save and continue planning, but do not begin affected data collection until requirements are resolved.",true)+
     '<div class="button-row">'+route("Discuss permissions with my teacher","Safety / privacy / consent unresolved")+'</div>'):""),
    "<h4>Practical risks aren't mathematical limitations</h4><p>Waiting for permission belongs in the project plan. Measurement uncertainty or sampling bias belongs beside the relevant mathematical method.</p>");
   case "N03G":return stepBody("How manageable is the project?","This is a separate practical ease rating—not an IB mark.",
    rating("practicalEase","Rate completion ease /5","1 = major unresolved operational barriers; 5 = independent and manageable.")+
    (Number(f.practicalEase)>0&&Number(f.practicalEase)<4?F("easeImprovement","What one change would make the project more manageable?","Smaller pilot, simpler tools, less manual cleaning, confirmed access",{type:"textarea",rows:2}):"")+
    '<div class="button-row">'+route("Reduce workload or resolve obstacles","Reduce workload or resolve blockers")+
    route("I need teacher help with obstacles","Practical obstacles not yet resolved")+'</div>',
    "<h4>Practical ≠ mathematical</h4><p>Even a mathematically promising idea may need its administrative burden reduced. It is okay to proceed provisionally while seeking advice.</p>");
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
    F("otherCourseMaths","Mathematics I'm considering","A tentative technique, question or Not sure yet",{type:"textarea",rows:3})+
    F("teacherQuestion","What would you like to confirm with your teacher?","Suitability, mathematical depth or practical first steps",{type:"textarea",rows:2})+
    callout("Provisional plan","You can still develop your aim, mathematics and safe first step. Teacher validation remains outstanding.",true),
    "<h4>Proceed provisionally</h4><p>Do not interpret an exported report as approval of out-of-course mathematics.</p>");
   case "N04S":return stepBody("Which mathematics might help answer your aim?","Choose possible techniques, not a checklist of things you must do.",
    mathChoices(state),
    "<h4>What's a good selection?</h4><p>A few purposeful techniques beat many disconnected ones. Routine syllabus maths can be used without tutorial-style explanations. Research beyond the syllabus should show your understanding when actually used.</p>");
   case "N01P":{
    const choices=relevantPredictionOptions(state);
    return stepBody("What do you predict might happen?","This is a tentative expectation, not a result. Then explain why and what it would mean IF true.",
      summary("Your investigation aim",f.aim)+
      (f.beneficiary?summary("My motivation — why this matters",f.beneficiary+(f.intendedUse?" — "+f.intendedUse:"")):"")+
      '<div class="field-group"><label class="field-label">Some possible predictions for this type of investigation</label>'+
      choice("predictionId",choices.map(x=>({value:x.id,title:x.question,desc:x.id==="X02"?"You can explore before deciding.":""})),{stack:true,tight:true})+'</div>'+
      F("prediction","My tentative prediction or conjecture","Use your own words. A suggestion above is a question, not a written prediction.",{type:"textarea",rows:2})+
      (f.predictionPrior?summary("Earlier prediction saved as a note (not current)",f.predictionPrior):"")+
      F("predictionWhy","WHY do I expect this?","Experience, observation, small mathematical case or uncertainty",{type:"textarea",rows:3})+
      F("predictionImplication","IF it were true, what could it mean for my purpose?","A possible implication—not advice backed by results yet",{type:"textarea",rows:3})+
      (f.predictionId==="X02"?F("predictionExploration","What initial example might help you form a prediction?","A simple graph, sample or mathematical case",{type:"textarea",rows:2}):"")+
      '<div class="button-row">'+route("Refine my motivation","Edit 'Who is this for?' while predicting")+'</div>'+
      callout("Your result might surprise you","A different finding is not failure. Your later interpretation should be based on actual evidence."),
      "<h4>A meaningful prediction</h4><p>Separate WHAT you expect, WHY, and what it would mean for the person or purpose you selected IF TRUE. Do not turn a prediction into a statement of fact.</p>");
   }
   case "N04R":return stepBody("Does your predicted pattern change your maths plan?","Revisit your earlier options. Keep, add or remove only what serves the investigation.",
    mathChoices(state,true)+
    F("mathsRevisedWhy","Why might this mathematics be useful? (optional)","Connect a selected method to the question you want to answer",{type:"textarea",rows:2}),
    "<h4>Keep it flexible</h4><p>These suggestions respond to a prediction, not a demonstrated pattern. Once you have real results, you may need to choose a different method or end the investigation.</p>");
   case "N04M":return stepBody("Is the mathematics likely to answer your question?","Check purpose, course suitability and potential interpretation. If the mathematical suitability is unclear, note a question for your teacher without blocking your plan.",
    summary("Current aim",f.aim)+
    summary("Possible mathematics",selectedMaths(state).map(x=>x.label).join("; ")+(f.otherMaths?" · "+f.otherMaths:""))+
    select("courseSuitability","Does your mathematics look suited to this aim?",[
     ["yes","I can explain how it could help"],["unsure","I'm not sure yet"],["no","I think it needs revising"]])+
    select("mathsOutside","How familiar is your selected mathematics within your course?",[
     ["syllabus","It is mainly within my syllabus"],["outside","It may include mathematics beyond my syllabus"],["unsure","I'm unsure; I need a syllabus check"]])+
    F("suitabilityWhy","What mathematical question could it answer?","Describe one relevant quantity, pattern or comparison",{type:"textarea",rows:3})+
    (f.courseSuitability==="no"||f.mathsOutside==="outside"||f.mathsOutside==="unsure"?
      '<div class="button-row">'+route("Ask my teacher about suitability","Outside-course maths or unclear mathematical depth")+'</div>':"")+
    callout("Not a grading tool","This is a planning check, not a prediction of IA marks or an automatic syllabus assessment."),
    "<h4>Outside-syllabus mathematics</h4><p>When you actually use an independently researched method beyond the syllabus, explain the new mathematics you understand. There is no need to teach routine syllabus techniques.</p>");
   case "N05V":return stepBody("What could your first mathematical representation be?","One purposeful figure, short calculation or simplified case can give you a useful starting direction.",
    choice("figureType",[
      {value:"scatter",title:"Scatter graph",icon:"chart"},
      {value:"distribution",title:"Distribution or group comparison",icon:"chart"},
      {value:"diagram",title:"Labelled mathematical diagram",icon:"target"},
      {value:"table",title:"A small table or numerical example",icon:"calculator"},
      {value:"calculation",title:"A first short calculation",icon:"calculator"},
      {value:"theory",title:"A simplified conjecture / case",icon:"book"},
      {value:"unsure",title:"Not sure yet",icon:"lightbulb"}],{stack:true,tight:true})+
    F("figureOther","More detail (optional)","What would you draw, compare, label or calculate?")+
    F("figurePurpose","WHY might this help answer your aim?","What might it reveal or allow you to test?",{type:"textarea",rows:3})+
    callout("Suggested direction",e(seedExample(state))),
    "<h4>Do not create invented mathematics here</h4><p>This is a plan. Later, explain the purpose BEFORE the figure or calculation, then interpret actual findings AFTER it.</p>");
   case "N05":return stepBody("Choose an achievable first mathematical action.","Start small, but make the action mathematically useful.",
    summary("Your proposed first representation",f.figureOther||f.figureType)+
    F("firstAction","One worthwhile step I could do first","A first graph, algebraic example, labelled diagram or test",{type:"textarea",rows:3})+
    F("firstAccuracy","Units or measurement precision to remember (if relevant)","e.g. height to nearest cm; exact symbolic expressions",{type:"textarea",rows:2})+
    callout("Save accuracy decisions","When you report later results, Pathfinder should reuse relevant earlier units and precision rather than asking again unnecessarily."),
    "<h4>Plan for interpretation</h4><p>After an actual result, explain its significance for the aim and why another mathematical question would follow.</p>");
   case "N06E":return stepBody("What might change the direction of your investigation?","A strong plan is flexible when data, methods or surprising findings call for revision.",
    F("changeTrigger","What result or obstacle might make you rethink your approach?","A curved pattern, missing source, unexpected result or counterexample",{type:"textarea",rows:3})+
    F("changeAdaptation","What could you adjust without restarting everything?","A refined variable, model, sample or conjecture",{type:"textarea",rows:2})+
    F("fallbackEvidence","If data become unavailable, what is a plausible fallback?","Another permitted source, narrower scope or 'to discuss'",{type:"textarea",rows:2})+
    callout("Plans are provisional","A prediction that turns out to be wrong can be an excellent mathematical starting point. Do not change findings to make them fit the plan."),
    "<h4>A contingency isn't an extra IA section</h4><p>Keep logistical concerns in planning notes. Only discuss actual mathematical limitations at the point where they affect an analysis.</p>");
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
    route("Plan a safe first mathematical step","Optional: identify first safe mathematical step")+'</div>'+
    callout("Provisional summary stays available","An unresolved flag must remain visible. Do not begin affected collection requiring permission, but you can save this work.",true),
    "<h4>Safety comes first</h4><p>A teacher checkpoint does not mean consent or safety permission has been granted. It also does not prevent saving or printing a provisional plan.</p>",
    "Review my provisional plan");
   case "N06":return stepBody("Your investigation plan at a glance.","Review what you've actually decided, what is tentative, and what still needs discussing.",
    '<div class="plan-review">'+
    summary("Investigation aim",f.aim)+edit("N01","Edit aim")+
    summary("My motivation — why the answer matters",f.beneficiary+(f.intendedUse?" — "+f.intendedUse:""))+edit("N01V","Edit motivation")+
    summary("Course and mathematical direction",(f.course||"Not confirmed")+" · "+(selectedMaths(state).map(x=>x.label).join("; ")||f.otherMaths||f.otherCourseMaths||"Still to decide"))+edit("N04","Edit maths")+
    summary("Evidence plan",f.kind==="theoretical"?(f.theoreticalCase||"Theoretical cases to confirm"):
      (f.dataSource||"No source chosen")+" · "+(f.primaryWhat||f.secondaryPublisher||"source details to confirm"))+
    summary("Prediction (provisional)",f.prediction|| (f.predictionId==="X02"?"Not sure yet":""))+summary("Why I predicted it",f.predictionWhy)+
    summary("What it might mean IF TRUE",f.predictionImplication)+
    summary("First mathematical action",f.firstAction||f.figureOther||f.figureType)+
    summary("Data readiness /5",f.kind==="theoretical"?"Not applicable":f.dataReadiness)+
    summary("Practical ease /5",f.practicalEase)+
    teacherWarnings(state)+
    '<div class="button-row">'+edit("N03H","Edit timeline")+edit("N08","Teacher questions")+'</div></div>'+
    callout("This is not an approved IA","A provisional plan is useful even if parts need clarification. The result and intended benefit have not yet been demonstrated."),
    "<h4>How to review</h4><p>Confirm your aim, whether the mathematical methods serve it, source feasibility, actual deadlines and any teacher flags. A pending decision never prevents a provisional summary.</p>",
    "Review and save plan");
   case "N07":return stepBody("Your provisional plan is ready to take forward.","You've created a working direction. Your mathematical findings—and perhaps your aim—may evolve.",
    '<div class="success-moment"><span class="feature-icon">'+icon("check")+'</span><div><strong>Planning checkpoint reached</strong><p>Review your work in the printable report, or download a portable project backup. Save and return later, or explore your actual mathematics in IA Studio.</p></div></div>'+
    summary("Provisional IA title",f.provisionalTitle)+summary("Your aim",f.aim)+summary("First mathematical move",f.firstAction)+
    F("planIdentifier","Optional label for my copy of this plan","e.g. My IA plan — revision 2")+teacherWarnings(state)+
    '<div class="button-row" style="margin-top:18px">'+button("Download my planning PDF","export-plan-pdf","btn-primary","", "download")+
    button("Download editable Word plan","export-plan-docx","btn-secondary","", "download")+
    button("View working report","go-report","btn-quiet","", "file")+
    button("Download project backup","export-json","btn-secondary","", "download")+
    route("Review my plan again","Revisit an answer or correct a detail")+
    route("Open IA Studio","Continue into Completing in this session")+'</div>'+
    callout("Export reminder","Your PDF and Word reports contain an importable Planning snapshot. Later edits to the visible document do not update that snapshot automatically. Use a JSON backup to restore your entire IA Studio work."),
    "<h4>What happens next?</h4><p>In Completing you will work with ACTUAL findings, not only this proposed plan. Unexpected results can legitimately change your next mathematical question.</p>",
    "View my report");
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
   (state.planning.sourceBranches.primary&&state.planning.sourceBranches.secondary?button("Compare methods","plan-advance","btn-primary","", "arrow-right"):button("Continue the other source","plan-advance","btn-primary","", "arrow-right"))+'</div>';
  if(n==="N07")return '<div class="task-footer">'+button("Back to review","plan-back","btn-quiet","", "chevron-left")+
   button("View report","go-report","btn-primary","", "arrow-right")+'</div>';
  const only=N=>N==="N08"?"Continue to review":N==="N02U"?"Back to route":N==="N03R"?"Retry source plan":N==="N00C"?"Use this idea":screen.label;
  return '<div class="task-footer">'+(state.planning.history.length?button("Back","plan-back","btn-quiet","", "chevron-left"):button("Home","go-home","btn-quiet"))+
   '<div class="button-row">'+button(only(n),"plan-advance","btn-primary","", "arrow-right")+'</div></div>';
 }
 function viewPlanning(){
  const state=ctx.getState(),p=state.planning,n=p.current,screen=nodePage(state);
  const stage=planningStage(n),stageI=PROGRESS_GROUPS.findIndex(x=>x.id===stage),kickoff=n==="N00",titleStep=n==="N01",ideaMapStep=n==="N00B";
  return '<div class="page planning-page">'+tabletNav()+
   '<div class="planning-page-layout">'+planningLearningTrail(state,{support:kickoff?'':criteriaPanel(state)})+
   '<div class="planning-page-main">'+
   '<div class="progress-top"><span class="progress-overview">'+icon("compass")+' Guided Planning</span>'+
   '<span class="progress-counter">1. Planning · '+e(PROGRESS_GROUPS[stageI]?.label||"Review")+'</span></div>'+
   '<div class="task-shell'+(kickoff?' planning-kickoff':'')+(titleStep?' planning-title-step':'')+'" data-source-node="'+e(n)+'">'+
   '<h1 class="task-heading">'+e(screen.title)+'</h1><p class="task-intro">'+e(screen.intro)+'</p>'+
   (!kickoff&&!titleStep&&n!=="N01V"&&!["N00B","N00C"].includes(n)?planningReturnSparks(state):"")+screen.html+
   (kickoff||titleStep?'':insightCapture(state,n))+(kickoff||titleStep?'':essentialsNudge(state))+
   (kickoff||titleStep||ideaMapStep?'':'<div class="example-row">'+helpButton("plan-"+n,n==="N01V"?"Why does this matter?":"Help me think")+helpBox("plan-"+n,screen.help)+'</div>')+
   footer(state,screen)+'</div>'+
   (kickoff||ideaMapStep?'':'<p class="small-callout">Your choices are provisional until evidence supports them. You can revisit earlier decisions. Teacher flags never prevent a provisional report.</p>')+
   (p.notices&&p.notices.length?'<div class="inline-note warning">'+icon("info")+'<p>'+e(p.notices.at(-1))+'</p></div>':"")+
   '</div></div></div>';
 }
 return {viewPlanning};
}
