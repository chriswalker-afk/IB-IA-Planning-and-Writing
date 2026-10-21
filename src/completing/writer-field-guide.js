/* Student-facing, optional writing craft. This is editorial advice, never a scoring rubric or student-authored evidence. */
import {allWriterStageAdviceBundles} from "./writer-stage-advice.js";
export const FIELD_GUIDE_TIPS=Object.freeze([
  {
    "id": "lab",
    "family": "maths",
    "icon": "flask",
    "essential": true,
    "title": "This isn't a lab report!",
    "hook": "The mathematics is the main character.",
    "explanation": "Practical problems can matter, especially in data work. But go beyond a list of human errors: examine what your mathematics assumes, what your results establish about your overall aim, and how far your conclusions really reach.",
    "ordinary": "Human error and lack of time may have affected the experiment.",
    "stronger": "My linear model describes the observed data reasonably well, but extending it beyond the measured range assumes that the relationship stays linear. My results do not establish that.",
    "why": "This identifies a mathematical limitation and explains the consequence for the investigation.",
    "moment": "When evaluating assumptions, sampling, measurement or models.",
    "challengeQuestion": "A straight-line model predicts negative prices beyond the observed range. What is the more useful discussion?",
    "challengeAnswer": "Discuss the model's range of validity and why extrapolation becomes implausible. A generic comment about 'human error' would miss the mathematical problem."
  },
  {
    "id": "voice",
    "family": "voice",
    "icon": "message",
    "essential": true,
    "title": "You're allowed to say 'I'!",
    "hook": "Make your own mathematical decisions visible.",
    "explanation": "The IA is your exploration. Use a natural first-person voice to explain genuine choices and discoveries. You can still write objectively and precisely about mathematical facts.",
    "ordinary": "A quadratic model was subsequently employed.",
    "stronger": "I noticed a curved pattern in the residuals from my linear model, so I decided to investigate a quadratic model.",
    "why": "The reader hears the student's reasoning, not just a passive report of what happened.",
    "moment": "When describing a choice, a surprise or a change of direction."
  },
  {
    "id": "thinking",
    "family": "voice",
    "icon": "brain",
    "essential": true,
    "title": "Let the reader inside your head.",
    "hook": "Your decisions are more interesting than a button press.",
    "explanation": "Explain what you were looking for and why you chose a technique. Don't simply name every calculation: show the question that made it worth doing.",
    "ordinary": "The Pearson correlation coefficient was calculated.",
    "stronger": "The scatter graph suggested a positive linear relationship. I wanted to know how strong it was, so I calculated the PMCC.",
    "why": "The mathematical method has a clear purpose linked to the observed pattern.",
    "moment": "Before introducing a significant technique."
  },
  {
    "id": "imperfect",
    "family": "voice",
    "icon": "route",
    "essential": true,
    "title": "Perfect investigations are suspiciously boring.",
    "hook": "An unexpected answer isn't a failed IA.",
    "explanation": "Real exploration may involve uncertainty, mistaken expectations or methods that turn out not to help. Briefly explain authentic setbacks and what they taught you. Never manufacture a mistake just to make the story seem personal.",
    "ordinary": "The initial approach was unsuccessful. A different model was then used.",
    "stronger": "I expected the variables to be proportional, but the graph did not pass close to the origin. That made me question my assumption and investigate a model with a non-zero intercept.",
    "why": "A genuine unexpected observation drives a defensible mathematical next step.",
    "moment": "When something differs from your prediction or a method proves unsuitable."
  },
  {
    "id": "audience",
    "family": "reader",
    "icon": "book",
    "essential": true,
    "title": "Your reader already knows some maths.",
    "hook": "Explain your thinking, not every familiar button press.",
    "explanation": "Imagine a capable student on your own IB Maths course. For familiar methods, give enough definitions, set-up, significant working or representative calculations to make your reasoning clear; you do not need to teach routine procedures line by line. Explain independently learned mathematics when it is important to your investigation.",
    "ordinary": "To calculate the mean, first add all the numbers together. Then divide by the number of values. Here is every arithmetic step for each group…",
    "stronger": "I compared the group means to get a first indication of whether the typical results differed (Table 2). I then examined the spread before deciding what that comparison could support.",
    "why": "The routine technique is communicated, while the mathematical decisions and interpretation receive the attention.",
    "moment": "When deciding how much working or explanation to include.",
    "challengeQuestion": "Does 'skip routine explanation' mean you should hide all calculations?",
    "challengeAnswer": "No. Show sufficient method, notation, mathematical evidence and representative working for a reader to follow and check your reasoning. Omit only unnecessary repetition or basic tutorials."
  },
  {
    "id": "story",
    "family": "reader",
    "icon": "sparkles",
    "essential": true,
    "title": "Give the numbers a reason to exist.",
    "hook": "Tell a mathematical story worth following.",
    "explanation": "Each figure, result or equation should help answer a question. Give your reader a reason to care about what it reveals, and avoid tangents that don't advance your aim.",
    "ordinary": "The larger pie has 2.25 times the area.",
    "stronger": "The larger pie has 2.25 times the area, but is it actually better value? To answer my original question, I now need to compare that increase with the difference in price.",
    "why": "A bare calculation becomes evidence that creates a purposeful next question.",
    "moment": "When interpreting a result or transitioning to another mathematical step."
  },
  {
    "id": "why-now",
    "family": "maths",
    "icon": "git-branch",
    "essential": false,
    "title": "Every step needs a 'why now?'",
    "hook": "Don't add mathematics just to fill another section.",
    "explanation": "A technique should follow from the aim, a genuine finding or an honest mathematical question. It is fine to stop once there is enough relevant mathematics to answer your aim.",
    "ordinary": "Next, I used quadratic regression.",
    "stronger": "The residuals from the linear fit followed a curved pattern, so I tried quadratic regression to test whether it represented the relationship more faithfully.",
    "why": "The previous result justifies the new approach.",
    "moment": "When choosing the next logical mathematical step."
  },
  {
    "id": "react",
    "family": "maths",
    "icon": "chart",
    "essential": false,
    "title": "Don't just give a result. React to it!",
    "hook": "The meaning matters more than the number alone.",
    "explanation": "Interpret important results in the context of your aim, and distinguish what the mathematics supports from what it does not. For correlation, be especially careful not to claim causation.",
    "ordinary": "r = 0.81. This shows a strong positive correlation.",
    "stronger": "The PMCC of 0.81 suggests a strong positive linear association in my sample. This supports investigating a linear model, but it does not mean one variable causes the other.",
    "why": "The result is interpreted and its inferential limit is acknowledged.",
    "moment": "Immediately after presenting an important calculation or graph.",
    "challengeQuestion": "A PMCC of 0.81 proves one variable causes the other. Agree?",
    "challengeAnswer": "No. It suggests strong positive linear association in the data, but correlation does not establish causation."
  },
  {
    "id": "boundaries",
    "family": "maths",
    "icon": "shield",
    "essential": false,
    "title": "Know where your maths stops working.",
    "hook": "An answer is only as trustworthy as its assumptions.",
    "explanation": "Discuss the valid range, assumptions, approximation and accuracy of techniques you really used. If sampling or data quality restricts what can be inferred, explain that mathematical consequence too.",
    "ordinary": "The model can predict any future value.",
    "stronger": "The fitted model was based on temperatures from 18 to 32°C. I have no evidence that its form remains appropriate at 45°C, so I will restrict my conclusions to the observed range.",
    "why": "The limitation restricts a specific conclusion rather than adding generic criticism.",
    "moment": "When modelling, extrapolating or generalising from data."
  },
  {
    "id": "prediction",
    "family": "voice",
    "icon": "target",
    "essential": false,
    "title": "Your prediction isn't your conclusion.",
    "hook": "Keep expectations separate from discoveries.",
    "explanation": "In your introduction, briefly say what you genuinely think or hope you will discover, and why. Save or refine your tentative prediction spark for later comparison. A prediction is not evidence, and your eventual mathematical findings may challenge it. If no sensible prediction is possible yet, be honest about what you hope to understand.",
    "ordinary": "I predicted a strong correlation, so the two quantities are related.",
    "stronger": "I originally expected a strong positive correlation. The scatter plot was more dispersed than I anticipated, and the PMCC of 0.23 challenged that expectation.",
    "why": "The writing distinguishes a prior belief from a genuine finding.",
    "moment": "When comparing results with earlier Planning sparks."
  },
  {
    "id": "purpose",
    "family": "maths",
    "icon": "calculator",
    "essential": false,
    "title": "Clever mathematics needs a purpose.",
    "hook": "More advanced doesn't automatically mean better.",
    "explanation": "Choose mathematics because it helps answer the question. Use familiar course techniques confidently, and explain the ideas behind genuinely unfamiliar methods well enough to demonstrate your own understanding.",
    "ordinary": "I used calculus because it is more advanced.",
    "stronger": "I differentiated my area function because I needed to locate the dimensions at which the area was maximised.",
    "why": "The method is justified by the mathematical problem, not its apparent sophistication.",
    "moment": "When selecting, researching or explaining a technique."
  },
  {
    "id": "graphs",
    "family": "reader",
    "icon": "chart",
    "essential": false,
    "title": "Make your graphs earn their space.",
    "hook": "A figure should reveal something, not decorate a page.",
    "explanation": "Label axes, quantities and units clearly; choose a scale that does not distort the story. Then tell the reader what the figure establishes, challenges or makes you wonder.",
    "ordinary": "Figure 2 shows my data.",
    "stronger": "Figure 2 suggests an increasing trend but also reveals that the spread grows for larger values of x. I therefore questioned whether a simple straight-line model would give reliable predictions throughout the range.",
    "why": "The graph becomes interpreted evidence that influences a mathematical decision.",
    "moment": "Just after introducing a figure or graph."
  },
  {
    "id": "sources",
    "family": "reader",
    "icon": "link",
    "essential": false,
    "title": "Show your sources, not just your answers.",
    "hook": "Make evidence and technology transparent.",
    "explanation": "Identify where data came from, report relevant accuracy and units, and say what technology actually did. The reader should be able to understand and trust your mathematical evidence.",
    "ordinary": "I found the values online and used a calculator.",
    "stronger": "I used the published monthly figures from the stated source (accessed 12 September) and calculated the fitted parameters using my GDC. I recorded the input precision before interpreting the model.",
    "why": "The provenance and technical process are traceable without a lengthy tutorial.",
    "moment": "When introducing datasets, measurements, sources or technology."
  },
  {
    "id": "edit",
    "family": "reader",
    "icon": "scissors",
    "essential": false,
    "title": "Cut the filler, keep the discoveries.",
    "hook": "Shorter can be clearer and more convincing.",
    "explanation": "Remove repetitive arithmetic, generic introductions and tangents. Keep enough working for clarity, but give more space to reasoning, unexpected findings and reflections that actually matter.",
    "ordinary": "Mathematics is used in everyday life and is very important. In this investigation, mathematics has many different applications…",
    "stronger": "I wanted to test whether the larger pizza at my local restaurant offers better value, so I compared its price with the area of each size.",
    "why": "The opening reaches a specific, investigable question immediately.",
    "moment": "When revising the introduction and checking the final draft."
  }
].map(Object.freeze));
export const FIELD_GUIDE_CONTEXT=Object.freeze({
  "C10": "voice",
  "C20": "sources",
  "C21S": "boundaries",
  "C21M": "boundaries",
  "C21T": "purpose",
  "C22": "purpose",
  "C23": "sources",
  "C24": "sources",
  "C25": "audience",
  "C26": "why-now",
  "C30": "thinking",
  "C31": "graphs",
  "C32": "audience",
  "C33": "graphs",
  "C34": "react",
  "C34A": "boundaries",
  "C34B": "prediction",
  "C34U": "imperfect",
  "C35": "why-now",
  "C35H": "thinking",
  "C35B": "react",
  "C35P": "react",
  "C40": "thinking",
  "C40T": "sources",
  "C40D": "purpose",
  "C40L": "audience",
  "C50": "thinking",
  "C60": "story",
  "C61": "react",
  "C62": "story",
  "C63": "why-now",
  "C64": "edit",
  "C70": "edit",
  "C70N": "edit",
  "C80": "edit",
  "C80D": "edit",
  "C90": "edit"
});

const FAMILIES=Object.freeze({
 voice:{name:"Your voice",tag:"Personality & discovery",icon:"message"},
 maths:{name:"Your maths",tag:"Purpose & reasoning",icon:"brain"},
 reader:{name:"Your reader",tag:"Clarity & interest",icon:"book"}
});
const STORIES=Object.freeze([
 {label:"Question",icon:"target",heading:"What am I trying to find out?",text:"Begin with a mathematical question that is worth investigating."},
 {label:"Choice",icon:"brain",heading:"Why this technique?",text:"Explain why the next mathematical step is useful for your question."},
 {label:"Result",icon:"chart",heading:"What did the mathematics show?",text:"Present genuine mathematical evidence, with clear notation and meaningful working."},
 {label:"Meaning",icon:"lightbulb",heading:"So what does it mean?",text:"Interpret the result in context, including what it cannot establish."},
 {label:"Next",icon:"route",heading:"Where does that lead?",text:"Follow a logical new question, or finish with an honest answer."}
]);
const byId=new Map(FIELD_GUIDE_TIPS.map(t=>[t.id,t]));
export function contextualGuideTip(node){return byId.get(FIELD_GUIDE_CONTEXT[node])||null;}
/** First-visit writing craft: separate from the assessment criteria and editable IA. */
export function shouldShowWriterGuideWelcome(state,sampleActive=false){
 return !sampleActive&&state?.route==="completing"&&state?.completion?.current==="C00"&&
  state?.ui?.writerGuideIntroSeen!==true;
}
export function renderWriterGuideWelcome(icon,e){
 const essentials=FIELD_GUIDE_TIPS.filter(t=>t.essential);
 return '<section class="writer-guide-welcome" aria-labelledby="writer-guide-welcome-title">'+
  '<div class="writer-guide-welcome-hero"><span class="writer-guide-welcome-eyebrow">'+icon("sparkles")+' BEFORE YOU WRITE</span>'+
   '<h2 id="writer-guide-welcome-title">Make your IA worth reading.</h2>'+
   '<p>A strong exploration is more than a sequence of calculations. Show the question, why you chose your mathematics, what you found and what those findings mean.</p></div>'+
  '<div class="writer-guide-welcome-heading"><h3>Six ideas to take into your IA</h3>'+
   '<p>These are writing habits, not a marking checklist or extra tasks to complete.</p></div>'+
  '<div class="writer-guide-welcome-six">'+essentials.map(t=>
    '<div class="writer-guide-welcome-essential writer-family-'+e(t.family)+'">'+
     '<span class="writer-guide-welcome-tip-icon">'+icon(t.icon)+'</span>'+
     '<div><strong>'+e(t.title)+'</strong><span>'+e(t.hook)+'</span></div></div>'
   ).join("")+'</div>'+
  '<p class="writer-guide-welcome-note">Your thinking and mathematics must be your own. For the official current assessment criteria, use <strong>IA essentials</strong> in the header.</p>'+
  '<div class="writer-guide-welcome-actions">'+
   '<button type="button" class="btn btn-primary" data-action="writer-guide-welcome-dismiss">Start writing my IA '+icon("arrow-right")+'</button>'+
   '<button type="button" class="btn btn-secondary" data-action="writer-guide-welcome-full">'+icon("book")+' Explore all 14 tips</button></div>'+
  '<p class="writer-guide-welcome-reassurance">The purple Writing Guide button stays available throughout IA Studio. This introduction only appears once per project.</p>'+
  '</section>';
}
export function renderFieldGuideTeaser(icon,e){
 return '<section class="chapter-onboarding-tile writer-guide-teaser" aria-labelledby="writer-guide-teaser-heading">'+
  '<div class="writer-guide-teaser-top"><span class="chapter-onboarding-tile-icon">'+icon("book")+'</span><span class="writer-guide-teaser-tag">THE WRITER’S FIELD GUIDE</span></div>'+
  '<h3 id="writer-guide-teaser-heading">Key advice to read before you start writing</h3>'+
  '<p>Make your IA a mathematical story worth reading — not a lab report or a list of calculations.</p>'+
  '<div class="writer-guide-teaser-families" aria-label="Three themes">'+
    Object.keys(FAMILIES).map(k=>'<span class="writer-family-chip writer-family-'+k+'">'+icon(FAMILIES[k].icon)+' '+e(FAMILIES[k].name)+'</span>').join("")+'</div>'+
  '<button type="button" class="writer-guide-open-button" data-action="writer-guide-open">'+icon("sparkles")+' Explore 14 writing tips '+icon("arrow-right")+'</button>'+
  '<p class="writer-guide-teaser-note">Short explanations, real thinking, fictional before-and-after examples. Dip in now; revisit anytime.</p>'+
  '<button type="button" class="onboarding-inline-action writer-guide-criteria-link" data-action="essentials-open">Find the IB criteria '+icon("arrow-right")+'</button></section>';
}
export function renderContextualGuide(icon,e,node){
 const tip=contextualGuideTip(node);
 if(!tip)return "";
 return '<aside class="writer-guide-return" aria-label="Relevant Field Guide advice">'+
  '<span class="writer-guide-return-icon">'+icon(tip.icon)+'</span><span class="writer-guide-return-copy"><strong>A tip from your Field Guide</strong>'+
  '<span>'+e(tip.title)+'</span></span>'+
  '<button type="button" data-action="writer-guide-open" data-guide-tip="'+e(tip.id)+'">See an example '+icon("arrow-right")+'</button></aside>';
}
function example(t,e,contextual=false){
 return '<div class="writer-guide-example" data-guide-example="'+e(t.id)+'">'+
   '<div class="writer-guide-example-top"><strong>'+e("Same maths. Better communication.")+'</strong>'+
   '<div class="writer-guide-example-switch" role="group" aria-label="Compare writing styles">'+
    '<button type="button" data-action="writer-guide-example" data-guide-view="ordinary" aria-pressed="'+(!contextual)+'">Just reporting</button>'+
    '<button type="button" data-action="writer-guide-example" data-guide-view="stronger" aria-pressed="'+contextual+'">Stronger writing</button></div></div>'+
   '<p class="writer-guide-example-text" data-guide-text="ordinary"'+(contextual?' hidden':'')+'>'+e(t.ordinary)+'</p>'+
   '<p class="writer-guide-example-text" data-guide-text="stronger"'+(contextual?'':' hidden')+'>'+e(t.stronger)+'</p>'+
   '<div class="writer-guide-example-why"'+(contextual?'':' hidden')+'><strong>Why this works</strong><span>'+e(t.why)+'</span></div></div>';
}
/** Focused writing-craft help beside the user's actual IA box.
 * Reuses the exact full-guide lesson and its fictional comparison; nothing is removed
 * from the complete Field Guide. Student-specific context is escaped, never copied.
 */
/** Original supplemental writing tips remain individually expandable everywhere. */
function stageWritingTipCard(item,index,icon,e,expanded=false){
 return '<details class="writer-guide-supplement-tip" data-stage-tip-id="'+e(item.id)+'"'+(expanded?' open':'')+'>'+
  '<summary><span class="writer-guide-supplement-number">'+String(index+1)+'</span><span><strong>'+e(item.title)+'</strong><small>'+e(item.hook)+'</small></span>'+icon("chevron-right")+'</summary>'+
  '<div class="writer-guide-supplement-tip-body"><p>'+e(item.detail)+'</p>'+
  '<div class="writer-guide-supplement-comparison"><div><strong>Just reporting</strong><p>'+e(item.weak)+'</p></div>'+
  '<div><strong>Showing mathematical thinking</strong><p>'+e(item.strong)+'</p></div></div>'+
  (item.why?'<p class="writer-guide-supplement-why"><strong>Why this works</strong> '+e(item.why)+'</p>':'')+
  '<small>Fictional examples only. Use your actual mathematics and your own words.</small></div></details>';
}
function stageWritingBundle(bundle,icon,e){
 return '<details class="writer-guide-supplement-group" data-writer-advice-group="'+e(bundle.group)+'">'+
  '<summary>'+icon("book")+' <span><strong>'+e(bundle.title)+'</strong><small>All '+bundle.items.length+' original tips, with complete explanations and examples</small></span>'+icon("chevron-right")+'</summary>'+
  '<div class="writer-guide-supplement-list">'+bundle.items.map((item,index)=>stageWritingTipCard(item,index,icon,e,index===bundle.selectedIndex)).join("")+'</div></details>';
}
function popinStageWriting(bundle,icon,e){
 if(!bundle?.items?.length)return "";
 const featured=bundle.items[bundle.selectedIndex];
 return '<section class="writer-guide-popin-practical" aria-label="Practical advice for this part of the IA">'+
  '<div class="writer-guide-popin-practical-head">'+icon("lightbulb")+' <strong>A practical tip for this writing box</strong></div>'+
  '<h3>'+e(featured.title)+'</h3><p>'+e(featured.detail)+'</p>'+
  '<p class="writer-guide-popin-practical-note">The complete writing tips, including fictional before-and-after examples, are preserved below.</p>'+
  stageWritingBundle(bundle,icon,e)+'</section>';
}
function stageWritingLibrary(icon,e,state){
 return '<section class="writer-guide-supplement-library" aria-labelledby="writer-guide-supplements-heading">'+
  '<div class="writer-guide-section-heading"><span class="writer-guide-section-symbol">'+icon("book")+'</span>'+
  '<div><h3 id="writer-guide-supplements-heading">Practical writing advice for each IA section</h3>'+
  '<p>Every original stage-specific tip and example is here. Open only the section you need; mathematical pathway advice remains in your writing workspace.</p></div></div>'+
  allWriterStageAdviceBundles(state).map(bundle=>stageWritingBundle(bundle,icon,e)).join("")+
  '</section>';
}

export function renderWriterGuidePopin(icon,e,guide){
 const t=guide?.tip;
 if(!t)return "";
 return '<section class="writer-guide-popin writer-family-'+e(t.family)+'" role="dialog" aria-modal="false" aria-labelledby="writer-guide-popin-title" tabindex="-1" data-guide-popin-tip="'+e(t.id)+'">'+
   '<div class="writer-guide-popin-head"><span class="writer-guide-popin-symbol">'+icon("book")+'</span>'+
   '<div class="writer-guide-popin-head-copy"><span class="writer-guide-popin-eyebrow">WRITER\u2019S FIELD GUIDE \u00b7 FOR THIS STEP</span>'+
   '<h2 id="writer-guide-popin-title">'+e(guide.stage||t.title)+'</h2></div>'+
   '<button type="button" class="writer-guide-popin-close" data-action="writer-guide-popin-close" aria-label="Close this writing tip">'+icon("x")+'</button></div>'+
   '<div class="writer-guide-popin-body">'+
    '<div class="writer-guide-popin-focus"><strong>What matters in this box</strong><p>'+e(guide.cue||t.hook)+'</p></div>'+
    (guide.note?'<p class="writer-guide-popin-note">'+e(guide.note)+'</p>':"")+
    (guide.question?'<p class="writer-guide-popin-question">'+e(guide.question)+'</p>':"")+
    '<div class="writer-guide-popin-lesson"><h3>'+e(t.title)+'</h3><p>'+e(t.explanation)+'</p></div>'+
    example(t,e,true)+
    popinStageWriting(guide.stageAdvice,icon,e)+
    '<p class="writer-guide-popin-when"><strong>Remember this:</strong> '+e(t.moment)+'</p>'+
    '<p class="writer-guide-popin-disclaimer">These are fictional teaching examples, not text to copy. Use your own genuine mathematical decisions and results.</p>'+
   '</div>'+
   '<div class="writer-guide-popin-footer">'+
    '<button type="button" class="writer-guide-popin-full" data-action="writer-guide-popin-full">'+icon("book")+' Open this tip in the full guide '+icon("arrow-up-right")+'</button>'+
    '<button type="button" class="writer-guide-popin-done" data-action="writer-guide-popin-close">Back to my writing</button>'+
   '</div></section>';
}

function tipCard(t,i,icon,e,guide=null){
 const relevant=!!guide&&guide.tip?.id===t.id;
 const focus=relevant?'<aside class="writer-guide-stage-focus" role="note" data-guide-stage-focus="'+e(guide.node)+'">'+
  '<span>FOR YOUR CURRENT WRITING STEP</span><strong>'+e(guide.stage)+'</strong>'+
  '<p>'+e(guide.cue)+'</p>'+
  (guide.note?'<p class="writer-guide-stage-note">'+e(guide.note)+'</p>':'')+
  (guide.question?'<p class="writer-guide-stage-question">'+e(guide.question)+'</p>':'')+
  (guide.stageAdvice?'<button type="button" class="writer-guide-stage-jump" data-action="writer-guide-stage-jump" data-guide-bundle="'+e(guide.stageAdvice.group)+'">Read all '+guide.stageAdvice.items.length+' practical tips for this section '+icon("arrow-right")+'</button>':'')+
  '<small>Use this as advice to think with, not text to copy into your IA.</small></aside>':'';
 return '<details class="writer-guide-tip writer-family-'+e(t.family)+'" id="writer-guide-'+e(t.id)+'" data-guide-card="'+e(t.id)+'" data-guide-family="'+e(t.family)+'"'+((guide?relevant:i===0)?' open':'')+'>'+
  '<summary><span class="writer-guide-tip-icon">'+icon(t.icon)+'</span>'+
   '<span class="writer-guide-tip-summary"><span class="writer-guide-tip-meta">'+(t.essential?'ESSENTIAL '+String(i+1).padStart(2,"0"):'EXTRA '+String(i-5).padStart(2,"0"))+' · '+e(FAMILIES[t.family].name)+'</span>'+
    (relevant?'<span class="writer-guide-tip-current">Suggested for this step</span>':'')+
    '<strong>'+e(t.title)+'</strong><small>'+e(t.hook)+'</small></span>'+
   '<span class="writer-guide-tip-expand">'+icon("chevron-right")+'</span></summary>'+
  '<div class="writer-guide-tip-body"><p>'+e(t.explanation)+'</p>'+focus+example(t,e,relevant)+
   (t.challengeQuestion?'<details class="writer-guide-challenge"><summary>'+icon("lightbulb")+' Quick thought challenge: '+e(t.challengeQuestion)+'</summary><p>'+e(t.challengeAnswer)+'</p></details>':"")+
   '<p class="writer-guide-when"><strong>Remember this:</strong> '+e(t.moment)+'</p></div></details>';
}
function storyStrip(icon,e){
 return '<section class="writer-guide-story" aria-label="How to tell a mathematical story">'+
 '<div class="writer-guide-section-heading"><span class="writer-guide-section-symbol">'+icon("route")+'</span><div><h3>The thread that ties an IA together</h3><p>Tap a step to discover what makes the reader want to follow your maths.</p></div></div>'+
 '<div class="writer-guide-story-steps" role="group" aria-label="Five parts of a mathematical story">'+
 STORIES.map((s,i)=>'<button type="button" class="writer-guide-story-step'+(i===0?' is-active':'')+'" data-action="writer-guide-story" data-story-step="'+i+'" aria-pressed="'+(i===0)+'">'+icon(s.icon)+'<span>'+e(s.label)+'</span></button>').join("")+'</div>'+
 '<div class="writer-guide-story-panels">'+STORIES.map((s,i)=>'<p data-story-panel="'+i+'"'+(i===0?'':' hidden')+'><strong>'+e(s.heading)+'</strong> '+e(s.text)+'</p>').join("")+'</div>'+
 '<p class="writer-guide-story-footnote">It\'s a helpful pattern, not a compulsory five-step template. A thoughtful conclusion can be a perfectly good next step.</p></section>';
}
export function renderWriterFieldGuide(icon,e,guide=null,state=null){
 const essential=FIELD_GUIDE_TIPS.filter(x=>x.essential),additional=FIELD_GUIDE_TIPS.filter(x=>!x.essential);
 return '<div class="writer-guide-main">'+
  '<div class="writer-guide-hero"><span class="writer-guide-eyebrow">'+icon("sparkles")+' BEFORE YOU WRITE</span>'+
  '<div class="writer-guide-hero-layout"><div><h2>Make your IA worth reading.</h2>'+
  '<p>Great mathematical writing shows the questions you asked, the choices you made, what you discovered — and what those discoveries mean.</p>'+
  '<span class="writer-guide-hero-note">14 core writing tips · 26 practical section tips · examples you can explore</span></div>'+
  '<div class="writer-guide-art" aria-hidden="true"><span class="writer-guide-art-sheet sheet-one">'+icon("chart")+'</span>'+
  '<span class="writer-guide-art-sheet sheet-two">'+icon("brain")+'</span><span class="writer-guide-art-star">'+icon("sparkles")+'</span></div></div></div>'+
  '<p class="writer-guide-disclaimer">These are fictional teaching examples, not passages to copy. Your IA must reflect your own genuine thinking and mathematics.</p>'+
  storyStrip(icon,e)+
  '<div class="writer-guide-toolbar"><div><strong>Pick something to explore</strong><p>Open any card and switch between two writing styles.</p></div>'+
  '<div class="writer-guide-filters" role="group" aria-label="Filter writing advice">'+
  '<button type="button" data-action="writer-guide-filter" data-guide-filter="all" aria-pressed="true">All</button>'+
  Object.entries(FAMILIES).map(([key,value])=>'<button type="button" data-action="writer-guide-filter" data-guide-filter="'+key+'" aria-pressed="false">'+icon(value.icon)+' '+e(value.name)+'</button>').join("")+'</div></div>'+
  '<p class="writer-guide-filter-count" aria-live="polite">Showing all 14 tips</p>'+
  '<section class="writer-guide-tip-section" aria-labelledby="writer-guide-essentials-heading">'+
  '<div class="writer-guide-section-heading"><span class="writer-guide-section-symbol">'+icon("lightbulb")+'</span>'+
  '<div><h3 id="writer-guide-essentials-heading">The six essentials</h3><p>Start here — the biggest differences between simply reporting and genuinely exploring.</p></div></div>'+
  '<div class="writer-guide-tip-list">'+essential.map((t,i)=>tipCard(t,i,icon,e,guide)).join("")+'</div></section>'+
  '<section class="writer-guide-tip-section writer-guide-extra" aria-labelledby="writer-guide-extra-heading">'+
  '<div class="writer-guide-section-heading"><span class="writer-guide-section-symbol">'+icon("compass")+'</span>'+
  '<div><h3 id="writer-guide-extra-heading">Eight more ideas when you need them</h3><p>Extra craft for methods, mathematical limitations, results and editing.</p></div></div>'+
  '<div class="writer-guide-tip-list">'+additional.map((t,i)=>tipCard(t,i+6,icon,e,guide)).join("")+'</div></section>'+
  stageWritingLibrary(icon,e,state)+
  '<div class="writer-guide-finish"><div><strong>You\'re ready to write something real.</strong>'+
  '<p>You do not need to memorise these tips. Pathfinder will bring relevant ideas back during your mathematical journey, and you can reopen this guide anytime.</p></div>'+
  '<button type="button" class="btn btn-primary" data-action="close-drawer">Back to my IA '+icon("arrow-right")+'</button></div>'+
  '<p class="writer-guide-disclaimer">Need official assessment wording? Open <strong>IA essentials</strong> in the site header for the IB criteria. The Field Guide is writing advice, not a grading checklist.</p>'+
  '</div>';
}
