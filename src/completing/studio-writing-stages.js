import {renderWritingStageFlow} from "./stage-writing-flow.js";
import {renderSparkShelf} from "../ui/insight-threads.js";
import {exampleButton} from "../examples/views.js";
import {essentialsButton} from "../essentials/views.js";
import {renderFirstMathsAdvice,renderFirstMathsSparks,renderFirstMathsExamples} from "./first-maths-bridge.js";
import {renderShowingMathsAdvice,renderShowingMathsSparks} from "./showing-first-maths.js";

const CONFIG={"groups":{"data":["C20","C21S","C21M","C21T","C22","C23","C24","C25","C26"],"maths":["C30","C31","C32","C33","C34","C34A","C34B","C34U","C35","C35H","C35B","C35P","C40","C50","C40T","C40D","C40L"],"conclusion":["C60","C61","C62","C63","C64"]},"titles":{"C20":"Introduce your first mathematical step","C21S":"Describe your actual sample or census","C21M":"Define and justify a model","C21T":"Define your theoretical starting point","C22":"Justify the method you used","C23":"Identify a consequential limitation","C24":"Record defensible accuracy","C25":"Introduce necessary definitions","C26":"Link source and method to the aim","C30":"Showing your first mathematics","C31":"Diagram & table tools","C32":"Prepare the reader for the first step","C33":"Present your actual mathematics","C34":"Describe what your mathematics shows","C34A":"Apply accuracy to this result","C34B":"Reflect on what the finding means","C34U":"Investigate an unexpected finding","C35":"Decide the next mathematical question","C35H":"Consider a relevant next step","C35B":"Interpret your actual scatter pattern","C35P":"Interpret calculated correlation carefully","C40":"Develop substantial mathematics","C50":"Develop further mathematics","C40T":"Explain the mathematics behind technology","C40D":"Check mathematical appropriateness","C40L":"Explain unfamiliar mathematics","C60":"Bring your mathematical story together","C61":"State the strongest defensible answer","C62":"Explain what the results can inform","C63":"Consider a meaningful extension","C64":"Polish your concise ending"},"hints":{"C20":"Connect the first mathematics to your aim, using the source and route you actually chose.","C21S":"Connect population, sampling and any bias with the inferences you can actually make.","C21M":"Define meaningful variables, units, simplifying assumptions and a defensible domain.","C21T":"State the mathematical objects and conjecture; there is no need to invent a dataset.","C22":"Justify the method by its mathematical purpose, not a catalogue of possible techniques.","C23":"Explain how a genuine source or method limitation restricts a mathematical claim.","C24":"Distinguish measuring resolution, uncertainty and display/rounding policy.","C25":"Define symbols and unfamiliar terms only when a mathematically literate reader needs them.","C26":"Explain briefly why the actual evidence and method can help address your aim.","C30":"Start with one purposeful representation or calculation; the result must still be real.","C31":"Use a generator if it helps show your mathematics; return to the main writing screen to interpret the result.","C32":"Introduce the mathematical reason for a figure or calculation before showing it.","C33":"Include genuine working with readable notation, scales, quantities and units.","C34":"Observe the real result without assuming it confirms your prediction.","C34A":"Revisit precision only if it makes a difference to the interpretation of this result.","C34B":"Explain what actual evidence means for your aim and what it leaves unresolved.","C34U":"Surprises, unclear relationships and counterexamples can redirect the investigation.","C35":"Follow a real result into a new question or decide you have enough mathematics.","C35H":"Only adopt an optional method suggestion when your result makes it worthwhile.","C35B":"Determine whether the genuine scatter looks linear before selecting Pearson r.","C35P":"Pearson r concerns linear association; neither causation nor a non-linear relationship is established.","C40":"Link the method to a previous finding, show meaningful maths, and interpret the result.","C50":"Deepen the investigation only where a genuine result creates a meaningful new question.","C40T":"Explain the mathematical operation, inputs and meaning of genuine technological output.","C40D":"Mathematical suitability and understanding matter more than sophistication.","C40L":"Explain genuinely new mathematics at first use; do not teach routine syllabus maths.","C60":"Answer the aim using genuine mathematical results and consequential limitations.","C61":"Give a best-supported answer without restating the entire mathematical process.","C62":"Revisit your purpose, but never invent practical impact or evidence.","C63":"Only propose a mathematical extension that follows from real findings.","C64":"Remove repeated calculations, irrelevant context and generic future-work paragraphs."},"topic":{"C20":"source","C21S":"source","C21M":"assumptions","C21T":"proof","C22":"method","C23":"limitations","C24":"precision","C25":"notation","C26":"method","C30":"graph","C31":"graph","C32":"method","C33":"graph","C34":"interpretation","C34A":"precision","C34B":"interpretation","C34U":"next","C35":"next","C35H":"next","C35B":"next","C35P":"interpretation","C40":"calculation","C50":"calculation","C40T":"technology","C40D":"understanding","C40L":"understanding","C60":"conclusion","C61":"conclusion","C62":"conclusion","C63":"next","C64":"conclusion"},"tips":{"data":{"name":"Data & Methods","icon":"layers","overview":["C20"],"cards":[["Real evidence, not intentions","Describe sources, measurements or mathematical objects you actually used.","A proposed survey, source or method is not evidence of collection. Record what you truly have, including original provenance. Theoretical explorations need precise definitions and assumptions, not pretend data.","I will survey students.","I obtained 24 responses from…"],["Justify your mathematical choices","Explain why your sampling, variables or assumptions suit the aim.","For data, identify a target population and sampling units where relevant. For a model, define inputs and limits. For theory, state the problem and conditions. Only describe decisions that you genuinely made.","This was the easiest method.","The sample lets me investigate…"],["Accuracy belongs where it matters","Record units, resolution and defensible precision.","Where measurements or rounded source tables are used, distinguish instrument resolution, uncertainty and final reporting precision. Do not round every answer to a fixed number of decimals.","I rounded everything to 3 dp.","The source measures to the nearest…"],["Limit what the maths can claim","Discuss genuine mathematical consequences of limitations.","Brief practical difficulties matter less than how bias, representativeness, domain, assumptions and accuracy affect your mathematical inference. An IA is not a lab report.","I was short of time.","My sample does not represent… so I cannot infer…"]]},"maths":{"name":"Mathematical Exploration","icon":"calculator","overview":["C30","C40","C50"],"cards":[["Give each step a reason","Connect the method to the aim or an earlier mathematical result.","Introduce a graph or calculation with the question it could answer. Later methods should follow from actual findings, not a prepared technique itinerary.","Next I used regression.","The residuals were curved, so I explored…"],["Show meaningful work, not tutorials","A coursemate already knows routine mathematics.","Use syllabus techniques clearly and correctly without long procedural introductions. Where you independently studied mathematics outside the course, explain the genuinely new idea to show understanding.","First I will explain how to draw a graph.","The graph is needed to inspect…"],["Interpret as you go","Tell the reader what the actual result means.","Describe findings in the context of your aim, and explain limitations or accuracy that materially change them. Compare genuine results with your prediction without forcing agreement.","The answer was 0.8.","This supports … but does not establish …"],["Another calculation must be worthwhile","Stop when your investigation has answered enough.","If a real result produces a new mathematical question, justify a technique to address it. There is no quota of graphs, calculations or methods; an honest conclusion may be the right next step.","I also used calculus for difficulty.","This earlier result leaves the question of…"]]},"conclusion":{"name":"Conclusion","icon":"target","overview":["C60"],"cards":[["Answer your aim","Only actual mathematical results support the answer.","State the best-supported answer to the original aim, referring to the decisive results or proof. An inconclusive finding is a legitimate mathematical outcome.","My prediction was correct.","The evidence suggests … within …"],["Make the meaning clear","Return to your motivation and what you discovered.","Say what the result means for the mathematical question, compare with your earlier hope if appropriate, and do not invent a beneficiary or unsupported recommendation.","This will help everyone.","The result does not yet justify…"],["Reflect on mathematical limits","Mention only genuine constraints on the conclusion.","Synthesize relevant model assumptions, domain, sampling, uncertainty and limitations already discussed beside the work. Avoid generic lab-report weaknesses.","There may have been human error.","The model was tested only between…"],["Finish concisely","No new mathematics or compulsory extensions.","Do not repeat full calculations. A future mathematical question is useful only if it genuinely follows from the results; you may be finished without one.","More research could be done.","The remaining question, if worthwhile, is…"]]}}};
export const STUDIO_WRITING_GROUPS=Object.freeze(CONFIG.groups);
export const STUDIO_WRITING_NODES=Object.freeze(Object.keys(CONFIG.titles));
export const isStudioWritingNode=node=>STUDIO_WRITING_NODES.includes(node);
const groupOf=node=>Object.keys(CONFIG.groups).find(key=>CONFIG.groups[key].includes(node))||"";
const tipCard=(tip,i,icon,e)=>'<details class="intro-advice-tip studio-stage-tip" data-studio-tip="'+i+'">'+
 '<summary><span class="intro-advice-tip-icon">'+icon(i===0?"target":i===1?"compass":i===2?"lightbulb":"route")+'</span>'+
 '<span class="intro-advice-tip-copy"><strong>'+e(tip[0])+'</strong><span>'+e(tip[1])+'</span></span>'+
 '<span class="intro-advice-tip-chevron">'+icon("chevron-right")+'</span></summary>'+
 '<div class="intro-advice-tip-body"><p>'+e(tip[2])+'</p><div class="intro-advice-example">'+
 '<p><strong>Instead of</strong> '+e(tip[3])+'</p><p><strong>Try</strong> '+e(tip[4])+'</p></div></div></details>';
function renderAdvice(node,icon,e,reduced=false){
 const kind=groupOf(node),group=CONFIG.tips[kind],main=group.overview.includes(node);
 const cards='<div class="intro-advice-cards studio-stage-advice-cards">'+
  group.cards.map((tip,i)=>tipCard(tip,i,icon,e)).join("")+'</div>';
 return '<section class="studio-stage-advice" aria-label="Writing advice for '+e(group.name)+'" data-stage-advice="'+kind+'">'+
  '<div class="studio-stage-advice-head"><span class="studio-stage-icon">'+icon(group.icon)+'</span>'+
  '<div><span class="intro-writing-guide-eyebrow">BEFORE YOU WRITE · '+e(group.name.toUpperCase())+'</span>'+
  '<h2>'+(main?'Before you write':'One thing to keep in mind')+'</h2>'+
  '<p>'+e(CONFIG.hints[node])+'</p></div></div>'+
  (reduced?'':main?cards:
   '<details class="studio-stage-more-advice"><summary>'+icon("book")+
   ' Writing tips for '+e(group.name)+' '+icon("chevron-right")+'</summary>'+cards+'</details>')+
  (!reduced?'<button type="button" class="studio-stage-guide-link" data-action="writer-guide-open">'+icon("book")+
   ' Full Writer’s Field Guide '+icon("arrow-right")+'</button>':'')+'</section>';
}
function renderSparks(state,node,icon,e){
 const kind=groupOf(node),lead=kind==='data'?
  'Use planned source, sampling or accuracy sparks only after checking what you actually collected. A plan is not a finding.':
  kind==='maths'?
  'Bring forward the aim, a relevant real result or linked accuracy decision. A planned technique is not a performed calculation.':
  'Revisit your aim, actual mathematical results, original prediction and meaningful limitations. Findings may challenge your hope.';
 const shelf=renderSparkShelf(state,node,{surface:"studio",hideHeading:true});
 return '<section class="studio-stage-sparks" aria-label="Relevant saved sparks"><div class="studio-stage-sparks-head">'+
  icon("sparkles")+' <div><span class="intro-writing-guide-eyebrow">YOUR SAVED IDEAS</span>'+
  '<h2>Use your relevant sparks</h2><p>'+e(lead)+'</p></div></div>'+
  (shelf||'<p class="studio-stage-empty-sparks">No saved sparks yet. You can still work from real mathematics; review Planning if you need to clarify an earlier decision.</p>')+
 '</section>';
}
function renderOptionalExamples(node,icon,e,help=''){
 const kind=groupOf(node),topic=CONFIG.topic[node];
 const subject=kind==='data'?"source and method writing":kind==='maths'?"mathematical reasoning and interpretation":"conclusions and reflections";
 return '<details class="studio-stage-examples" data-writing-examples>'+
  '<summary>'+icon("book")+'<span><strong>Compare examples (optional)</strong>'+
  '<small>Learn from fictional '+e(subject)+' without copying the wording.</small></span>'+
  icon("chevron-right")+'</summary>'+
  '<div class="studio-stage-example-actions">'+exampleButton("Compare examples for this step",{topic})+
  exampleButton("Browse all examples",{browse:true})+'</div>'+
  '<p class="studio-stage-example-note">Examples illustrate writing, not your findings. Present only your real decisions and mathematical results.</p>'+
  (help?'<details class="studio-stage-more-help"><summary>'+icon("circle-help")+
  ' More help for this step '+icon("chevron-right")+'</summary><div class="studio-stage-help-content">'+help+'</div></details>':'')+
  '<div class="studio-stage-support-actions">'+essentialsButton("Full criteria rubric",{tab:"rubric"})+
   '<button type="button" class="btn btn-quiet" data-action="resource-browse">Tools & tutorials</button>'+
   '<button type="button" class="btn btn-quiet" data-action="open-stuck">I am stuck</button></div>'+
 '</details>';
}
/** Keep the underlying node inputs, routes and genuine mathematical records unchanged. */
export function renderStudioWritingStage(state,node,{icon,e,taskHtml="",taskIntro="",reduced=false,help=""}={}){
 if(!isStudioWritingNode(node))return taskHtml;
 const kind=groupOf(node),group=CONFIG.tips[kind],first=node==="C20",showFirst=node==="C30";
 const stageName=first?"Introducing your mathematics":showFirst?"Showing your mathematics":group.name;
 const task='<section class="studio-stage-writing-task'+(first?' first-maths-task':showFirst?' show-first-task':'')+'" aria-label="'+e(stageName)+' task">'+
  '<div class="studio-stage-writing-task-head"><span class="intro-writing-task-symbol">'+icon("pencil")+'</span>'+
  '<div><span class="intro-writing-task-eyebrow">YOUR '+e(stageName.toUpperCase())+' TASK</span>'+
  '<h2>'+e(CONFIG.titles[node])+'</h2><p>'+e(taskIntro)+'</p></div></div>'+
  '<p class="studio-stage-writing-location">'+icon("pencil")+
  ' Write appropriate explanation, mathematics or a conclusion in your <strong>actual IA document</strong> as the work becomes real. Pathfinder saves notes and decisions only; nothing is inserted into your IA automatically.</p>'+
  taskHtml+'</section>';
 return renderWritingStageFlow({
  advice:first?renderFirstMathsAdvice(state,icon,e,{reduced}):showFirst?renderShowingMathsAdvice(state,icon,e,{reduced}):renderAdvice(node,icon,e,reduced),
  sparks:first?renderFirstMathsSparks(state,icon,e):showFirst?renderShowingMathsSparks(state,icon,e):renderSparks(state,node,icon,e),
  task,
  examples:first?renderFirstMathsExamples(state,icon,e,help):renderOptionalExamples(node,icon,e,help)
 });
}
