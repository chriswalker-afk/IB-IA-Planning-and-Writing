/* Stage-specific, reusable writing craft: all examples are fictional and never entered into student IA documents. */
export const INTRODUCTION_TIPS=Object.freeze([
  {
    "id": "aim",
    "essential": true,
    "icon": "target",
    "label": "AIM",
    "title": "Make your mathematical aim unmistakable",
    "hook": "A topic isn't yet a question.",
    "body": "State exactly what you want to investigate mathematically. Your aim should tell another student what you hope to find out, compare, predict, explain or prove. Keep it clear enough that you can return to it in your conclusion.",
    "weak": "I want to investigate pizza.",
    "strong": "I want to investigate whether larger pizzas offer better value by comparing their areas with their prices.",
    "learn": "The second sentence gives a question that mathematics can actually answer.",
    "guide": "story"
  },
  {
    "id": "motivation",
    "essential": true,
    "icon": "compass",
    "label": "MOTIVATION",
    "title": "Tell the reader why you chose this question",
    "hook": "Bring your real motivation spark into the opening.",
    "body": "Explain your genuine observation, personal interest or mathematical curiosity. A theoretical investigation does not need an invented story or practical beneficiary. Personal engagement comes from the independent thinking that continues after your introduction.",
    "weak": "I chose this topic because mathematics is very important in real life.",
    "strong": "I noticed that the larger pizza always seemed like better value, and I wanted to find out whether the mathematics supported my assumption.",
    "learn": "The motive explains why the student was drawn to the mathematical question, without pretending the result is known.",
    "guide": "voice"
  },
  {
    "id": "journey",
    "essential": true,
    "icon": "route",
    "label": "THE JOURNEY",
    "title": "Start the journey; don't write an itinerary",
    "hook": "You don't need to announce every calculation.",
    "body": "Introduce your starting mathematical question and, if useful, your broad direction. Let the mathematics you later discover justify the actual techniques you use. Do not promise graphs, regressions or calculus before you know which steps will be useful.",
    "weak": "First I will draw a graph, then calculate the PMCC, then fit a regression line, and finally write my conclusion.",
    "strong": "I want to find out whether the two quantities are related and what that relationship might reveal about my original question.",
    "learn": "The second opening invites mathematical exploration without fixing the path in advance.",
    "guide": "thinking"
  },
  {
    "id": "concise",
    "essential": false,
    "icon": "scissors",
    "label": "BE CONCISE",
    "title": "A few focused paragraphs, not a chapter",
    "hook": "Make every sentence earn its place.",
    "body": "Two or three short paragraphs are often enough to give a reason, a mathematical aim and any essential context. This is writing advice, not an IB word-count rule. Criterion A rewards a coherent, well-organised and concise exploration as a whole.",
    "weak": "Mathematics has been used for thousands of years, and pizza is one of the world's most popular foods…",
    "strong": "I wanted to test a claim I often hear: that the largest pizza is always the best value.",
    "learn": "The reader reaches the specific mathematical motivation immediately.",
    "guide": "edit"
  },
  {
    "id": "context",
    "essential": true,
    "icon": "book",
    "label": "BACKGROUND",
    "title": "Define specialist terms briefly — then return to the maths",
    "hook": "Give enough context to understand your question, not a background essay.",
    "body": "If your subject uses a non-mathematical specialist term, briefly define it when it first appears. The reader only needs a superficial understanding to follow the question. Avoid long explanations of science, sport, economics or another non-mathematical topic: move quickly back to the relevant mathematics. Explain unusual mathematical ideas properly when needed.",
    "weak": "Several paragraphs describe yeast metabolism and bread fermentation before any mathematical question appears.",
    "strong": "Dough hydration is the mass of water expressed as a percentage of the flour mass. I want to investigate whether it is associated with how much a loaf expands.",
    "learn": "A short definition makes the mathematical aim accessible without turning the IA into an essay about another subject.",
    "guide": "audience"
  },
  {
    "id": "uncertain",
    "essential": false,
    "icon": "lightbulb",
    "label": "CURIOSITY",
    "title": "Predict honestly — or say what you hope to discover",
    "hook": "What do you think (or hope) you will find, and why?",
    "body": "If you have a genuine starting expectation or conjecture, tell the reader what it is and why you think it might hold. If you cannot yet make a sensible prediction, briefly say what you hope to discover instead; do not invent certainty. Update your prediction spark now, and later compare it with what your mathematical results actually show. Hoping for a result never makes it true.",
    "weak": "I will prove that my preferred model is the best and that my prediction is correct.",
    "strong": "I suspect that the relationship might not be linear because the changes appear to grow. I want to find out whether the mathematical evidence supports that idea.",
    "learn": "The expectation has a reason, remains open to being challenged and gives the student an honest starting point to revisit.",
    "guide": "imperfect"
  }
].map(Object.freeze));

import {exampleButton} from "../examples/views.js";
const has=v=>typeof v==="string"&&!!v.trim();
const introSpark=(icon,e,{kind,hasValue,title,description,value="",sourceNode,optional=false})=>
  '<div class="intro-spark-needed'+(optional?' intro-spark-optional':'')+'" data-intro-spark="'+kind+
   '" data-intro-spark-state="'+(hasValue?'ready':'missing')+'">'+
   '<span class="intro-spark-needed-icon">'+icon(kind==="aim"?"target":kind==="prediction"?"lightbulb":"compass")+'</span>'+
   '<span class="intro-spark-needed-copy"><strong>'+e(title)+'</strong><small>'+e(description)+'</small>'+
     (hasValue?'<span class="intro-spark-value">'+e(value.length>160?value.slice(0,159)+'…':value)+'</span>':'')+'</span>'+
   (optional?'<span class="intro-spark-needed-status intro-spark-prediction-status" aria-live="polite">'+(hasValue?'Spark saved':'To consider')+'</span>'+
    '<button type="button" class="intro-spark-edit-link" data-action="intro-prediction-open">Review and update '+icon("arrow-right")+'</button>':
    '<button type="button" data-action="insight-jump" data-insight-type="planning" data-node="'+sourceNode+'">'+
     (hasValue?'Review spark':'Add in Planning')+' '+icon("arrow-right")+'</button>')+'</div>';
function predictionEditor(state,icon,e){
 const p=state.planning?.fields||{};
 const prediction=p.prediction||state.project?.prediction||"";
 const why=p.predictionWhy||state.project?.predictionWhy||"";
 return '<details class="intro-prediction-update" id="intro-prediction-spark" aria-labelledby="intro-prediction-heading"'+(!has(prediction)||!has(why)?' open':'')+'>'+
  '<summary class="intro-prediction-head"><span class="intro-prediction-icon">'+icon("lightbulb")+'</span><span>'+
   '<span class="intro-prediction-eyebrow">OPTIONAL · EDIT YOUR ORIGINAL SPARK</span>'+
   '<strong id="intro-prediction-heading">Refine my prediction or hope, and why</strong></span>'+
   icon("chevron-right")+'</summary>'+
  '<p class="intro-prediction-lead">In your real IA, say briefly what you think or hope you will find out, and why. Here, update the same spark so you can revisit it when interpreting your findings.</p>'+
  '<div class="intro-prediction-fields">'+
   '<div class="field-group"><label class="field-label" for="intro-prediction-value">My tentative prediction, conjecture or hope</label>'+
   '<textarea rows="2" class="field" id="intro-prediction-value" data-bind="planning.fields.prediction" placeholder="I think … / I suspect … / I hope to find out whether …">'+e(prediction)+'</textarea></div>'+
   '<div class="field-group"><label class="field-label" for="intro-prediction-why">Why do I expect or hope this?</label>'+
   '<textarea rows="2" class="field" id="intro-prediction-why" data-bind="planning.fields.predictionWhy" placeholder="An observation, a mathematical pattern, my experience or an honest question …">'+e(why)+'</textarea></div></div>'+
  '<p class="intro-prediction-note">'+icon("sparkles")+' These edits save directly to your original Planning spark, not to your IA document. A prediction is <strong>not a mathematical result</strong>, and you never need to manufacture one: write what you genuinely hope to learn if a prediction is not yet sensible.</p>'+
  '</details>';
}
/** Read only except the explicitly bound, user-editable original prediction spark. */
export function renderIntroductionSparkPrompt(state,icon,e){
 const p=state.planning?.fields||{},aim=p.aim||state.project?.aim||"";
 const motive=p.motivation||p.beneficiary||p.intendedUse||state.project?.beneficiary||"";
 const prediction=p.prediction||state.project?.prediction||"";
 return '<section class="intro-spark-brief" aria-labelledby="intro-spark-heading">'+
  '<div class="intro-spark-brief-heading"><span class="intro-spark-brief-symbol">'+icon("sparkles")+'</span>'+
   '<div><span class="intro-spark-brief-eyebrow">FROM PLANNING → INTO YOUR IA</span>'+
   '<h2 id="intro-spark-heading">Turn your sparks into an opening</h2></div></div>'+
  '<p>Use your <strong>aim</strong> and <strong>motivation</strong> to begin. Optionally add what you predict or hope to discover, <strong>and why</strong>. Write this in your actual IA document, not in a spark.</p>'+
  '<div class="intro-spark-needed-list">'+
   introSpark(icon,e,{kind:"aim",hasValue:has(aim),title:"Your mathematical aim",description:"Turn this into an explicit mathematical question.",value:aim,sourceNode:"N01A"})+
   introSpark(icon,e,{kind:"motivation",hasValue:has(motive),title:"Your genuine motivation",description:"Say what made you curious in your own words.",value:motive,sourceNode:"N01V"})+
   introSpark(icon,e,{kind:"prediction",hasValue:has(prediction),optional:true,title:"Prediction or hope (optional)",description:"Explain your expectation or question, without claiming an answer.",value:prediction,sourceNode:"N01P"})+'</div>'+

  predictionEditor(state,icon,e)+'</section>';
}
function adviceCard(t,i,icon,e){
 return '<details class="intro-advice-tip'+(t.essential?' intro-advice-essential':'')+'" data-intro-advice="'+e(t.id)+'"'+''+'>'+
  '<summary><span class="intro-advice-tip-icon">'+icon(t.icon)+'</span>'+
   '<span class="intro-advice-tip-copy"><small>'+e(t.label)+'</small><strong>'+e(t.title)+'</strong><span>'+e(t.hook)+'</span></span>'+
   '<span class="intro-advice-tip-chevron">'+icon("chevron-right")+'</span></summary>'+
  '<div class="intro-advice-tip-body"><p>'+e(t.body)+'</p>'+
   '<div class="intro-advice-example"><p><strong>Instead of</strong> '+e(t.weak)+'</p>'+
   '<p><strong>Try</strong> '+e(t.strong)+'</p><small>'+e(t.learn)+'</small></div>'+

  '</div></details>';
}
export function renderIntroductionWritingAdvice(icon,e,{reduced=false,state=null}={}){
 // The task prompt and contextual A/C/Field Guide bubbles stay visible.
 if(reduced)return "";
 return '<section class="intro-writing-guide intro-writing-guide-compact" aria-label="Essential introduction writing advice" data-advice-moved-to-guide="introduction">'+
  '<div class="intro-writing-guide-head"><span class="intro-writing-guide-icon">'+icon("book")+'</span><div>'+
   '<span class="intro-writing-guide-eyebrow">WRITING GUIDE · INTRODUCTION</span><h2>Before you write</h2></div></div>'+
  '<strong>Write the opening, not the ending.</strong><p>Keep your introduction short, personal and mathematically focused. Open a tip only if you need more guidance.</p>'+
  '<p>State your precise mathematical aim, genuine motivation and, if helpful, what you predict or hope to discover and why. Define unfamiliar non-mathematical specialist terms briefly, avoid background essays and do not list every planned calculation. Write in your actual IA document, then update your prediction spark.</p>'+
  '<button type="button" class="writer-guide-inline-more" data-action="writer-guide-open" data-guide-tip="story" data-guide-spot="completing:C10:aim">'+icon("book")+' All six introduction writing tips '+icon("arrow-right")+'</button>'+
  '</section>';
}


/** One optional example entrance after the student's primary writing task. */
export function renderIntroductionOptionalExamples(icon){
 return '<details class="intro-examples-panel" data-writing-examples><summary>'+icon("book")+
  '<span><strong>Compare introductions (optional)</strong><small>See examples of an engaging aim, an authentic motivation, and just enough background.</small></span>'+icon("chevron-right")+'</summary>'+
  '<div class="intro-examples-choices">'+exampleButton("Compare introductions",{topic:"introduction"})+
  exampleButton("Specialist vocabulary example",{id:"EX34"})+'</div>'+
  '<p>Fictional teaching examples — use the ideas, not the wording. Your mathematics and motivation must remain your own.</p></details>';
}
