/**
 * Pass 2: student-selectable, blocker-first Planning recovery paths.
 * No automatic diagnosis, rewriting of IA prose, assessment judgement or
 * change to the student's work. Only verified planning choices inform offers.
 */
const row=(id,label,question,action,check,stop,fallback,boundary,extra={})=>
 Object.freeze({id,label,question,action,check,stop,fallback,boundary,...extra});
const CARDS=Object.freeze([
 row("interest-to-maths","I have an interest, but no mathematical question",
  "Would you rather compare results, understand a pattern, or find the best possible choice?",
  "Pick one of those mathematical jobs. Identify a quantity you could measure, a mathematical feature you could study, or a constraint you could use.",
  "Can you now describe what one comparison, calculation or model might actually tell you?",
  "One possible mathematical question and an achievable first check.",
  "Switch mathematical lens rather than repeatedly narrowing the activity. A teacher can help check the mathematical scope.",
  "The map suggests directions, not approved IA titles or findings."),
 row("interest-too-specific","I've narrowed the activity but still cannot see the mathematics",
  "What is the underlying mathematical problem rather than the sport, hobby, item or location?",
  "Temporarily remove the context name. Write the mathematical job alone, such as compare variability, estimate a trajectory or optimise a restricted quantity.",
  "Could a second real-life context lead to the same mathematical job?",
  "One reusable mathematical question you can then personalise.",
  "Return to the mathematical-lens choices, or choose a different interest.",
  "Do not turn a generic formula into an IA without a genuine question."),
 row("data-to-question","I can get some data but cannot see a mathematical investigation",
  "Are your observations numerical pairs, one-variable measurements, groups, categories, or locations?",
  "Classify a few real columns or records. Then choose one mathematical comparison, variation or modelling question that such observations could actually answer.",
  "Would the planned calculation tell you something your question asks, using genuinely available observations?",
  "One provisional question and a data structure suitable for a first check.",
  "If the evidence is unsuitable, choose another mathematical lens or source before committing.",
  "Do not claim correlation or a pattern before plotting and analysing real data."),
 row("data-not-verifiable","I don't know whether this evidence can be used",
  "Can you establish who made the observations, what they mean and whether use is permitted?",
  "Find the original source or collection conditions. Record one verified definition, population or permission requirement.",
  "Can you explain the origin and meaning of the information rather than just pointing to a copy?",
  "A defensible source candidate or an explicit unresolved question.",
  "Choose evidence that can be verified, or ask your teacher before any restricted collection.",
  "Access to numbers is not proof of permission, credibility or compatibility."),
 row("compare-options","I cannot decide which of my ideas to use",
  "For which idea can you try meaningful mathematics soonest without pretending you have data?",
  "For each candidate, write one first calculation or graph and one evidence or mathematics barrier. Compare those, not just which topic sounds most exciting.",
  "Does one idea have a worthwhile mathematical question AND a feasible first test?",
  "A provisional leading idea and one reason to investigate it first.",
  "If all have a blocker, keep two provisional choices and ask your teacher which mathematical scope is sensible.",
  "The fastest idea is not automatically the strongest, and a rating is not an IA mark."),
 row("aim-unfocused","My aim could mean too many different things",
  "Which single quantity, relationship or mathematical decision do you want to investigate first?",
  "Underline the main mathematical action in your aim. Name the quantities involved, the context or range, and one concrete output that would help answer it.",
  "Could another student tell what mathematics to attempt first without deciding the result in advance?",
  "One narrower, revisable mathematical aim.",
  "Try one small case to reveal a workable scope or ask your teacher to compare two versions.",
  "A good aim is provisional; do not invent an expected answer to sound confident.",
  {focusField:"aim"}),
 row("aim-method-list","I have techniques but no actual question",
  "What would you need to find out even if you did not already know these techniques?",
  "Put the method names aside. Write one quantity or decision the investigation could determine, then check whether any suggested technique serves that purpose.",
  "Can you give a reason for your first technique besides its syllabus level or difficulty?",
  "A mathematical job that justifies, or eliminates, a proposed method.",
  "Return to mathematical route choices only after you have a question.",
  "Using more advanced mathematics is not automatically a better IA.",
  {focusField:"aim"}),
 row("motivation-not-invented","I cannot find a genuine reason for this investigation",
  "Would knowing the answer help you understand something, compare possibilities or make a meaningful decision?",
  "Choose one honest use of the mathematical answer, even if the only beneficiary is your own understanding. Explain why that unknown matters to you.",
  "Does this purpose still make sense if the result differs from your prediction?",
  "One authentic reason, without a dramatic personal story.",
  "If there is no worthwhile purpose, adjust the question before polishing the prose.",
  "Do not manufacture a beneficiary, experience or expected finding.",
  {focusField:"beneficiary"}),
 row("motivation-doesnt-fit","My motivation and mathematical aim seem disconnected",
  "Would the mathematical result actually answer the personal or practical question you care about?",
  "Write the decision you want to make and the mathematical result needed to inform it. Compare them with your current aim.",
  "If your aim were answered perfectly, would it help with that decision?",
  "One aligned aim–purpose pair, or a clear reason to change either.",
  "Revisit your aim if the mathematics cannot address the proposed use.",
  "Do not promise an outcome that a model or sample cannot establish.",
  {focusField:"beneficiary"}),
 row("which-kind","I cannot decide between statistics, modelling and theory",
  "Are you trying to analyse observations, create a mathematical representation or establish a general property?",
  "Imagine a first page of actual working: a distribution or scatter graph, an equation with justified assumptions, or a small case leading toward a conjecture.",
  "Which of those is closest to the mathematical question you want answered?",
  "One provisional kind and a real first mathematical task.",
  "Choose 'I'm not sure yet' to compare routes, or ask your teacher about a no-data investigation.",
  "A route is a starting decision, not proof that a particular calculation will succeed."),
 row("theory-no-start","I want a theoretical investigation but cannot begin",
  "Can you state one precise case, pattern or claim without claiming it is already proved?",
  "Define the objects and conditions, calculate or draw one simple case, and test one boundary case or counterexample.",
  "Does the example make a genuine mathematical question clearer?",
  "A provisional conjecture and a reasoned first test.",
  "Write the exact conjecture as a teacher question if the route or proof approach remains uncertain.",
  "Examples can motivate a conjecture but cannot establish a general proof."),
 row("course-choice","I know my aim, but not which mathematics could help",
  "What mathematical quantity, feature or comparison must the first method reveal?",
  "Describe that job first, then examine one candidate from a relevant investigative route or course menu. Identify its required inputs.",
  "Could you start that mathematics with your proposed data or defined model?",
  "One candidate method with a clear mathematical purpose.",
  "If no route fits, retain the question and bring an exact suitability question to your teacher.",
  "A listed technique is not an automatic course recommendation or sufficient depth."),
 row("course-depth","I'm unsure whether the mathematics is suitable for my course",
  "What exact step is new to you, and why does the investigation genuinely require it?",
  "Identify the smallest unfamiliar step, what you understand, and the mathematical question it will answer. Prepare that for a teacher suitability check.",
  "Could you justify using the step instead of adding it purely for sophistication?",
  "A precise question about the method and course scope.",
  "Use the teacher checkpoint before centring the investigation on uncertain or out-of-course mathematics.",
  "The site does not certify AA HL/AI HL suitability or guarantee a level of mathematical depth.",
  {targetNode:"N06T",targetLabel:"Open teacher checkpoint"}),
 row("maths-too-many","I've selected several methods and don't know where to begin",
  "Which method could answer the first unanswered mathematical question using the evidence you can genuinely obtain?",
  "Choose just one candidate. State its inputs, what output it will produce and the question that output addresses.",
  "Can you attempt a first genuine calculation without needing results from techniques you haven't used?",
  "A defensible starting method; other choices remain optional.",
  "Remove unrelated methods or return to your aim to identify what you really want to investigate.",
  "Do not add techniques to fill a perceived syllabus or marking requirement."),
 row("source-kind","I cannot decide whether I need primary or secondary evidence",
  "Can you obtain original observations safely, or are the required values already published?",
  "Name the exact observation and its unit. Check whether you can collect it responsibly, find it from an attributable source, or define a legitimate mathematical assumption.",
  "Do you have one realistic path to the information the planned mathematics needs?",
  "One proposed evidence route and one concrete availability check.",
  "If neither is possible, revise the source plan or ask your teacher about changing the scope.",
  "Planning a source does not mean data are collected or permission is granted."),
 row("two-sources","I have two kinds of evidence but don't know whether they fit together",
  "Do observations from each source refer to the same unit, period, place and definition?",
  "Take one example record from each proposed source and compare the variable meaning, units, time and population before merging anything.",
  "Would combining those records preserve the mathematical question, or silently change what is being compared?",
  "A justified decision to keep sources separate, combine comparable observations, or revise the aim.",
  "If the original definitions cannot be verified, find the publisher's metadata or change source.",
  "Do not merge incompatible individual records and aggregated averages."),
 row("primary-procedure","I cannot plan a workable data collection method",
  "What single observation do you need first, and how can it be obtained safely and repeatably?",
  "Write one measurement or response with its unit, where and when it could be recorded, and the equipment or conditions required.",
  "Could someone reproduce just that first measurement under permitted conditions?",
  "One testable procedure and an unresolved permission issue, if any.",
  "Try an approved pilot or discuss a simpler scope, without collecting restricted information.",
  "A neat plan is not evidence that collection has already happened."),
 row("primary-precision","I don't know how accurately to record my measurements",
  "Does the measuring instrument provide a sensible resolution for the differences your mathematics will compare?",
  "Choose one quantity and identify the smallest instrument division or digital display step. Record the proposed units and reporting precision separately.",
  "Would that resolution distinguish changes that matter to your question?",
  "One defensible accuracy rule for a real planned measurement.",
  "If resolution is too coarse, reconsider equipment or the scale of the mathematical question.",
  "Display digits do not establish instrument accuracy; don't invent uncertainty values."),
 row("population-frame","I confuse the population, sampling frame and one observation",
  "Could someone belong to the intended population but not appear on your actual list of selectable units?",
  "Write three labels: people or objects you want to describe, units you can actually select, and what counts as one observation.",
  "If population and frame differ, can you name exactly who or what is excluded?",
  "A realistic population/frame distinction and the scope of any claim.",
  "Use a narrower claim or ask your teacher about a feasible frame if you cannot reach the intended population.",
  "Do not call a convenience sample representative without evidence."),
 row("sample-choice","I can't choose a legitimate sampling method",
  "Do you have a complete sampling frame, or only safe access to certain observations?",
  "List how units would actually be selected. Compare that with the requirements for random sampling, a census or a convenience sample.",
  "Could you carry out that selection without claiming random selection when it is not random?",
  "One honest sampling method and the claim it can reasonably support.",
  "Pilot the plan only if permission and school rules allow; otherwise prepare a teacher question.",
  "Permission, access and representativeness are separate issues."),
 row("published-origin","I've found figures but cannot verify the source",
  "Can you identify the original publisher, variable definitions and period?",
  "Open the original publisher's data page or documentation. Record what one row and one column represent, and whether the source is actually accessible.",
  "Can you explain the meaning of the figures without relying on an unverified screenshot?",
  "A candidate source with verified meaning, or a specific gap to resolve.",
  "Search for an original technical note; otherwise choose another trustworthy source.",
  "Do not invent publishers, citations or precision."),
 row("published-comparison","My published values may not be comparable",
  "Do the sources use the same units, populations, dates and category definitions?",
  "Choose one actual pair of records and check their collection level, units, denominators and dates side by side.",
  "Would the comparison mean the same thing if each record came from a different source?",
  "One justified source-compatibility decision.",
  "Keep datasets separate or amend the question if a defensible join is impossible.",
  "Reported decimals do not establish measurement accuracy."),
 row("availability","I don't have enough evidence to start",
  "What is the smallest real, usable piece of evidence or defined mathematical case you could work with safely?",
  "Identify one necessary variable and one genuine access route. If a small valid sample or a defined model case exists, state what it could test without pretending it settles the whole aim.",
  "Can you begin one real calculation or reviewable model assumption now?",
  "One permissible first action and a clear missing dependency.",
  "If no realistic access exists, revisit the data route or ask your teacher about scope.",
  "Never generate fake observations or treat a proposed sample as collected evidence."),
 row("consent-waiting","I need permission and don't know what I can do now",
  "Which exact activity or information requires school approval?",
  "Put the affected collection on hold. Write one precise permission question and safely prepare quantities, variables or a theoretical illustration instead.",
  "Can you identify a useful task that does not use restricted data or imply permission?",
  "One teacher question and one safe, non-collection task.",
  "Use the teacher checkpoint; do not proceed with the affected collection until authorised.",
  "Unresolved consent is a safeguarding gate, not a mathematical limitation of a fitted model.",
  {targetNode:"N06T",targetLabel:"Open teacher checkpoint"}),
 row("timeline-stuck","I don't know how to plan my time",
  "What is the next school milestone you actually know, and what first mathematical work must come before it?",
  "Choose one immediate milestone: usable material, first mathematics, or a reviewable draft. Place a small first task before it.",
  "Does the plan leave time to check calculations and interpretation instead of only writing at the end?",
  "One realistic first task and milestone you can revisit.",
  "Ask your teacher for the real school deadline; keep other dates provisional.",
  "The site does not know your school's deadlines automatically."),
 row("prediction-not-sure","I cannot make a credible prediction yet",
  "Do you have a genuine observation or mathematical reason to expect a particular result?",
  "Write the reason if you have one; otherwise select the option to explore first without predicting.",
  "Is the statement clearly an expectation rather than a result already proved?",
  "An honest tentative prediction, or an explicit decision to explore first.",
  "Revisit the prediction after choosing a feasible first representation, if useful.",
  "Predictions are optional and must never be labelled as findings.",
  {focusField:"prediction"}),
 row("prediction-refine","My possible mathematics doesn't match my prediction",
  "What would actually be calculated to check the expected pattern?",
  "Restate the mathematical question the prediction creates. Examine one technique's inputs and whether it can test that kind of pattern.",
  "Would the method let you investigate the expectation without assuming it must be correct?",
  "One appropriate planned first step or a reason to change direction.",
  "Use Refine the plan to revisit your choices without erasing the original expectation.",
  "An anticipated curve or correlation never proves it is present.",
  {focusField:"prediction"}),
 row("teacher-specific","I know I need help but cannot frame the question",
  "What first mathematical decision, assumption or safe evidence step can you not justify?",
  "State what you are trying to find out, what you already tried, and the exact choice you cannot make. Include a method or source name only when relevant.",
  "Could your teacher respond with one concrete mathematical decision or clarification?",
  "One precise teacher question and a separate safe task while waiting.",
  "If the issue is urgent consent or privacy, hold the affected activity pending advice.",
  "Recording a question is not approval; do not disclose participant information.",
  {focusField:"universalTeacherQuestion"}),
 row("review-no-start","I have a plan but don't know if it is ready",
  "Can you name the first mathematical calculation and the real evidence or assumptions it needs?",
  "Find the plan's aim, chosen mathematics and source choice. Mark just one unanswered dependency that prevents your first safe mathematical step.",
  "Is there a credible first mathematical action, even if the wider plan remains provisional?",
  "One small next action or a precise teacher question.",
  "Return to the relevant Planning choice or make an explicitly provisional plan.",
  "Planning completion never means the teacher has approved the method or the data.")
]);
const byId=new Map(CARDS.map(x=>[x.id,x]));
/** Only author bubbles at places with genuinely actionable repairs. */
const SPOTS=Object.freeze({
 "N00B:page":{title:"Finding a mathematical direction",ids:["interest-to-maths","interest-too-specific","data-to-question","data-not-verifiable"]},
 "N00C:page":{title:"Choosing between ideas",ids:["compare-options","interest-to-maths"]},
 "N01:aim":{title:"Shaping my mathematical aim",ids:["aim-unfocused","aim-method-list"]},
 "N01V:page":{title:"Finding a genuine mathematical purpose",ids:["motivation-not-invented","motivation-doesnt-fit"]},
 "N02:page":{title:"Choosing an investigation route",ids:["which-kind","theory-no-start"]},
 "N02U:page":{title:"Comparing investigation routes",ids:["which-kind","course-choice"]},
 "N02M:page":{title:"Choosing mathematics for my course",ids:["course-choice","course-depth","maths-too-many"]},
 "N02T:page":{title:"Starting a theoretical investigation",ids:["theory-no-start","teacher-specific"]},
 "N03:page":{title:"Choosing how to obtain evidence",ids:["source-kind","two-sources"]},
 "N03B:page":{title:"Using primary and secondary evidence",ids:["two-sources","source-kind"]},
 "N03P:page":{title:"Planning a first real measurement",ids:["primary-procedure","primary-precision"]},
 "N03P2:page":{title:"Sampling that fits my question",ids:["population-frame","sample-choice"]},
 "N03S:secondaryUrl":{title:"Checking secondary data",ids:["published-origin","published-comparison"]},
 "N03D:page":{title:"Finding a safe way to begin",ids:["availability","consent-waiting","source-kind"]},
 "N03R:page":{title:"Rescuing a difficult evidence plan",ids:["availability","source-kind"]},
 "N03H:page":{title:"Working out a realistic timescale",ids:["timeline-stuck","availability"]},
 "N04:page":{title:"Selecting mathematics for my course",ids:["course-choice","course-depth"]},
 "N04S:page":{title:"Selecting useful mathematical techniques",ids:["maths-too-many","course-choice","course-depth"]},
 "N04T:page":{title:"Checking mathematics outside my course list",ids:["course-depth","teacher-specific"]},
 "N01P:prediction":{title:"Deciding whether to predict",ids:["prediction-not-sure","prediction-refine"]},
 "N06T:page":{title:"Preparing a useful teacher question",ids:["teacher-specific","course-depth"]},
 "N08:page":{title:"Working safely while awaiting advice",ids:["teacher-specific","consent-waiting"]},
 "N06:page":{title:"Checking that my plan can begin",ids:["review-no-start","availability"]},
 "N07:page":{title:"Choosing my first safe next step",ids:["review-no-start","teacher-specific"]}
});
const noData=new Set(["availability","primary-procedure","primary-precision","population-frame","sample-choice","published-origin","published-comparison"]);
const safe=v=>typeof v==="string"?v.trim():"";
export function planningHelpFor(state,spot){
 if(state?.route!=="planning")return null;
 const node=state.planning?.current||"",spec=Object.hasOwn(SPOTS,node+":"+spot)?SPOTS[node+":"+spot]:null;
 if(!spec)return null;
 const p=state.planning.fields||{},mode=state.ideaExplorer?.map?.mode||"interests",theory=p.kind==="theoretical"||p.dataSource==="theoretical";
 let ids=spec.ids;
 if(node==="N00B")ids=mode==="data"?["data-to-question","data-not-verifiable","interest-to-maths"]:["interest-to-maths","interest-too-specific","data-to-question"];
 if(node==="N03D"||node==="N08"){
  const pending=["yes","unsure"].includes(p.permissionNeed)||state.teacher?.pendingApproval===true;
  ids=pending?["consent-waiting","availability","source-kind"]:node==="N08"?["teacher-specific","theory-no-start"]:["availability","source-kind","consent-waiting"];
 }
 if(theory)ids=ids.filter(id=>!noData.has(id));
 // Do not show a theoretical example if the student has explicitly chosen statistics.
 if(p.kind==="statistics")ids=ids.filter(id=>id!=="theory-no-start");
 const choices=ids.map(id=>byId.get(id)).filter(Boolean).slice(0,3);
 if(!choices.length)return null;
 return Object.freeze({node,spot,title:spec.title,choices});
}
export function planningHelpBadge(state,spot,escapeHtml=x=>String(x)){
 const help=planningHelpFor(state,spot);if(!help)return "";
 const key=help.node+":"+spot;
 return '<button type="button" class="stuck-help-badge" data-stuck-help="'+escapeHtml(key)+
  '" aria-label="I am stuck: '+escapeHtml(help.title)+'" aria-haspopup="dialog" '+
  'title="Stuck with this? Try a small next step"><span aria-hidden="true">?</span></button>';
}
/** Wrap the native label; no changes to its for/id, input or normal save path. */
export function planningHelpMarkedField(state,key,html,escapeHtml=x=>String(x)){
 const badge=planningHelpBadge(state,key,escapeHtml);
 if(!badge||!html)return html;
 const label=/(<label\b[^>]*>[\s\S]*?<\/label>)/;
 return label.test(html)?html.replace(label,'<div class="stuck-field-header">$1'+badge+'</div>'):html;
}
/** No private project state: dialog contents are derived from current, live Planning state. */
export function createPlanningHelpController({getState,escapeHtml,onHub,onNavigate}){
 let dialog=null,origin=null,active=null,selected=0;
 const e=escapeHtml;
 function ensure(){
  if(dialog)return;
  dialog=document.createElement("dialog");
  dialog.className="stuck-context-dialog";
  dialog.setAttribute("aria-labelledby","stuckContextTitle");
  dialog.setAttribute("aria-describedby","stuckContextIntro");
  document.body.append(dialog);
  dialog.addEventListener("cancel",event=>{event.preventDefault();close();});
  dialog.addEventListener("click",event=>{
   if(event.target===dialog){const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)close();return;}
   const choice=event.target.closest("[data-stuck-context-choice]");
   if(choice){selected=Number(choice.dataset.stuckContextChoice)||0;render();dialog.querySelector("#stuckContextAction")?.focus({preventScroll:true});return;}
   if(event.target.closest("[data-stuck-context-close]")){close();return;}
   if(event.target.closest("[data-stuck-context-hub]")){const trigger=origin;close(false);onHub?.(trigger);return;}
   if(event.target.closest("[data-stuck-context-go]")){
    const picked=active?.choices[selected];if(!picked)return;
    const target=picked.targetNode;
    close(!target);
    if(target)onNavigate?.(target);
    else if(picked.focusField){
     const input=document.querySelector('[data-bind="planning.fields.'+picked.focusField+'"]');
     input?.focus({preventScroll:true});
    }
   }
  });
 }
 function render(){
  if(!dialog||!active)return;
  const card=active.choices[selected]||active.choices[0];if(!card)return;
  dialog.innerHTML='<div class="stuck-context-top"><span class="stuck-context-icon" aria-hidden="true">?</span>'+
   '<div><p class="stuck-context-eyebrow">I AM STUCK · PLANNING</p>'+
   '<h2 id="stuckContextTitle">'+e(active.title)+'</h2></div>'+
   '<button type="button" class="stuck-context-close" data-stuck-context-close aria-label="Close help">×</button></div>'+
   '<div class="stuck-context-body"><p id="stuckContextIntro">Choose what is preventing your next step. These are possible difficulties, not judgements about your work.</p>'+
   '<div class="stuck-context-choices" role="group" aria-label="What are you stuck with?">'+active.choices.map((x,i)=>
    '<button type="button" data-stuck-context-choice="'+i+'" aria-pressed="'+(selected===i)+'" class="stuck-context-choice'+(selected===i?' selected':'')+'">'+e(x.label)+'</button>').join("")+'</div>'+
   '<section class="stuck-context-recovery" aria-live="polite"><h3 id="stuckContextAction">Try this now</h3>'+
   '<p>'+e(card.action)+'</p>'+
   '<h3>How to tell whether it helped</h3><p>'+e(card.check)+'</p>'+
   '<p class="stuck-context-stop"><strong>A useful stopping point:</strong> '+e(card.stop)+'</p>'+
   '<details><summary>If I am still stuck</summary><p>'+e(card.fallback)+'</p>'+
   '<p class="stuck-context-boundary">'+e(card.boundary)+'</p></details></section>'+
   '<div class="stuck-context-actions"><button type="button" class="btn btn-primary" data-stuck-context-go>'+
     e(card.targetNode?card.targetLabel||"Go to this Planning step":card.focusField?"Return to that question":"Return to my task")+'</button>'+
   '<button type="button" class="btn btn-quiet" data-stuck-context-hub>More problems in I am stuck</button>'+
   '</div></div>';
 }
 function open(key,trigger){
  const [node,...parts]=String(key||"").split(":");
  if(node!==getState().planning?.current)return false;
  const next=planningHelpFor(getState(),parts.join(":"));if(!next)return false;
  ensure();if(dialog.open)dialog.close();active=next;selected=0;origin=trigger;
  render();dialog.showModal();dialog.querySelector("#stuckContextTitle")?.setAttribute("tabindex","-1");
  dialog.querySelector("#stuckContextTitle")?.focus({preventScroll:true});return true;
 }
 function close(restore=true){
  if(!dialog?.open)return;dialog.close();const prev=origin;active=null;origin=null;
  if(restore&&prev?.isConnected)prev.focus({preventScroll:true});
 }
 const onClick=event=>{
  const button=event.target?.closest?.("[data-stuck-help]");if(!button)return;
  event.preventDefault();event.stopImmediatePropagation();
  open(button.dataset.stuckHelp,button);
 };
 document.addEventListener("click",onClick,true);
 return{open,close,destroy(){close(false);document.removeEventListener("click",onClick,true);dialog?.remove();dialog=null;}};
}
