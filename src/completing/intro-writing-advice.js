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
    "essential": false,
    "icon": "book",
    "label": "BACKGROUND",
    "title": "Explain specialist words — then return to the maths",
    "hook": "Only enough non-mathematical context to follow the question.",
    "body": "When an investigation involves a term from another field, define it briefly on first use. Don't teach the reader a whole science, economics or sports topic. Mathematical terms and symbols still need appropriate definitions when needed.",
    "weak": "Several paragraphs describe yeast metabolism and bread fermentation before any mathematical question appears.",
    "strong": "Dough hydration is the mass of water expressed as a percentage of the flour mass. I want to investigate whether it is associated with how much a loaf expands.",
    "learn": "A quick definition provides context, leaving room for the mathematical investigation.",
    "guide": "audience"
  },
  {
    "id": "uncertain",
    "essential": false,
    "icon": "lightbulb",
    "label": "CURIOSITY",
    "title": "Be curious, not certain",
    "hook": "An initial prediction is not a finding.",
    "body": "You may briefly mention a genuine starting expectation or conjecture, but label it as such. Don't claim what the mathematics will prove or that a particular model will fit before testing it. You can revise your introduction later to keep it consistent with what you actually explored.",
    "weak": "I will prove that higher hydration makes every loaf bigger.",
    "strong": "I suspect that greater hydration may be associated with greater expansion, but I want to investigate whether the data support this idea.",
    "learn": "The investigation stays open to results that challenge the student's initial expectation.",
    "guide": "imperfect"
  }
].map(Object.freeze));

import {criterionBadge} from "../essentials/criteria-badges.js";
import {exampleButton} from "../examples/views.js";
const has=v=>typeof v==="string"&&!!v.trim();
const introSpark=(icon,e,{kind,hasValue,title,description,sourceNode})=>
  '<div class="intro-spark-needed" data-intro-spark="'+kind+'" data-intro-spark-state="'+(hasValue?'ready':'missing')+'">'+
   '<span class="intro-spark-needed-icon">'+icon(kind==="aim"?"target":"compass")+'</span>'+
   '<span class="intro-spark-needed-copy"><strong>'+e(title)+'</strong><small>'+e(description)+'</small></span>'+
   (hasValue?'<span class="intro-spark-needed-status">Use in your IA</span>':
    '<button type="button" data-action="insight-jump" data-insight-type="planning" data-node="'+sourceNode+'">Add in Planning '+icon("arrow-right")+'</button>')+'</div>';
/** Read only: the marked spark is material to write ABOUT, not confirmation of completed prose. */
export function renderIntroductionSparkPrompt(state,icon,e){
 const p=state.planning?.fields||{},aim=p.aim||state.project?.aim||"";
 const motive=p.motivation||p.beneficiary||p.intendedUse||state.project?.beneficiary||"";
 return '<section class="intro-spark-brief" aria-labelledby="intro-spark-heading">'+
  '<div class="intro-spark-brief-heading"><span class="intro-spark-brief-symbol">'+icon("sparkles")+'</span>'+
   '<div><span class="intro-spark-brief-eyebrow">FROM PLANNING → INTO YOUR IA</span>'+
   '<h2 id="intro-spark-heading">Write about these two sparks now</h2></div></div>'+
  '<p>Use the two saved ideas below to write your introduction <strong>in your actual IA document</strong>. These are starting notes, not finished paragraphs or a sign that you have already written them.</p>'+
  '<div class="intro-spark-needed-list">'+
   introSpark(icon,e,{kind:"aim",hasValue:has(aim),title:"Your mathematical aim",description:"State precisely what you want to investigate, not just the topic.",sourceNode:"N01A"})+
   introSpark(icon,e,{kind:"motivation",hasValue:has(motive),title:"Your genuine motivation",description:"Explain what made you curious and why the answer interests you.",sourceNode:"N01V"})+'</div>'+
  '<p class="intro-spark-lastline">Read the saved spark cards below. If your aim is only a word or topic, turn it into an answerable mathematical question before writing.</p></section>';
}
function adviceCard(t,i,icon,e){
 return '<details class="intro-advice-tip'+(t.essential?' intro-advice-essential':'')+'" data-intro-advice="'+e(t.id)+'"'+(i===0?' open':'')+'>'+
  '<summary><span class="intro-advice-tip-icon">'+icon(t.icon)+'</span>'+
   '<span class="intro-advice-tip-copy"><small>'+e(t.label)+'</small><strong>'+e(t.title)+'</strong><span>'+e(t.hook)+'</span></span>'+
   '<span class="intro-advice-tip-chevron">'+icon("chevron-right")+'</span></summary>'+
  '<div class="intro-advice-tip-body"><p>'+e(t.body)+'</p>'+
   '<div class="intro-advice-example"><p><strong>Instead of</strong> '+e(t.weak)+'</p>'+
   '<p><strong>Try</strong> '+e(t.strong)+'</p><small>'+e(t.learn)+'</small></div>'+
   '<button type="button" class="intro-advice-guide-link" data-action="writer-guide-open" data-guide-tip="'+e(t.guide)+'">Explore the related Field Guide tip '+icon("arrow-right")+'</button>'+
   (t.id==="context"?'<div class="intro-advice-example-link">'+exampleButton("See a specialist vocabulary example",{id:"EX34"})+'</div>':"")+
  '</div></details>';
}
export function renderIntroductionWritingAdvice(icon,e,{reduced=false}={}){
 if(reduced)return '<section class="intro-writing-guide intro-writing-guide-compact" aria-label="Essential introduction writing advice">'+
  '<strong>Write the opening, not the ending.</strong><p>State your precise mathematical aim and genuine motivation in a few focused paragraphs. Give only necessary background, and do not list every calculation you might do. Write in your actual IA document.</p></section>';
 const main=INTRODUCTION_TIPS.filter(t=>t.essential),extra=INTRODUCTION_TIPS.filter(t=>!t.essential);
 return '<section class="intro-writing-guide" aria-labelledby="intro-guide-heading">'+
 '<div class="intro-writing-guide-head"><span class="intro-writing-guide-icon">'+icon("book")+'</span><div>'+
  '<span class="intro-writing-guide-eyebrow">WRITING GUIDE · INTRODUCTION</span>'+
  '<h2 id="intro-guide-heading">Write the opening, not the ending</h2>'+
  '<p>Your reader should know your <strong>aim</strong> and <strong>motivation</strong>, and feel ready to follow the maths. They should not already know every step you will take.</p>'+
 '</div></div>'+
 '<div class="intro-advice-cards">'+main.map((t,i)=>adviceCard(t,i,icon,e)).join("")+'</div>'+
 '<details class="intro-advice-extra-group"><summary>'+icon("sparkles")+
  '<span><strong>Three more ways to keep it sharp</strong><small>Concision, specialist vocabulary and genuine curiosity</small></span>'+icon("chevron-right")+'</summary>'+
  '<div class="intro-advice-cards intro-advice-extra-cards">'+extra.map((t,i)=>adviceCard(t,i+main.length,icon,e)).join("")+'</div></details>'+
 '<section class="intro-criteria-mini" aria-labelledby="intro-criteria-heading">'+
  '<h3 id="intro-criteria-heading">Why this matters in the criteria</h3>'+
  '<p>These are writing opportunities, not marks awarded for following tips. Tap a criterion letter for fuller guidance.</p>'+
  '<div class="intro-criteria-grid">'+
   '<div class="intro-criterion-mini"><span><strong>A · Presentation</strong><small>Clear aim, necessary context, a few focused paragraphs. Concise across the <em>whole</em> IA.</small></span>'+
   criterionBadge("completing:C10:aim")+'</div>'+
   '<div class="intro-criterion-mini"><span><strong>C · Personal engagement</strong><small>Genuine motivation starts the story. Independent mathematical decisions later show the engagement.</small></span>'+
   criterionBadge("completing:C10:motivation")+'</div></div>'+
 '</section>'+
 '<div class="intro-advice-example-actions"><div><strong>See an introduction in action</strong><p>Compare fictional introductions and discover which features matter.</p></div>'+
 exampleButton("Compare introductions",{topic:"introduction"})+'</div>'+
 '<p class="intro-advice-final-note">A useful target is <strong>a few short paragraphs</strong>, not a prescribed IB word limit. You can return and revise this opening as your mathematical investigation develops.</p></section>';
}
