/** Introduce mathematics after the IA introduction using decisions genuinely made in Planning.
 * These are provisional choices, not a claim that data or mathematical work exists.
 */
import {PLANNING_CATALOG} from "../planning/catalog.js";
import {routeById} from "../planning/investigative-routes.js";
import {renderSparkShelf} from "../ui/insight-threads.js";
import {exampleButton} from "../examples/views.js";
import {essentialsButton} from "../essentials/views.js";
import {techniqueStartingGuide,orderSelectedTechniqueGuides,sourceAdviceForTechnique} from "./technique-start-advice.js";

const has=x=>typeof x==="string"&&!!x.trim();
const firstNonempty=(...items)=>items.find(has)||"";
const techniqueById=new Map(PLANNING_CATALOG.math.map(m=>[m.id,m]));
const sourceInfo={
 primary:{title:"Primary data",icon:"pencil",intro:"You planned to collect observations or measurements yourself.",
  guidance:"If you have collected the values, introduce the relevant quantities and units, then bring in your first mathematical representation. Briefly explain collection or sampling only when it affects the mathematics; do not write a lab diary."},
 secondary:{title:"Secondary data",icon:"book",intro:"You planned to use existing published values.",
  guidance:"Where your first mathematical figure or calculation uses published values, identify the original source, variables and units. Cite it and check whether the source's stated precision affects the mathematics; do not imply you collected it."},
 both:{title:"Primary + secondary data",icon:"layers",intro:"Your plan combines your own observations with published values.",
  guidance:"Explain which values come from which source and what each adds to your first mathematical question. Compare definitions and units before combining them; do not imply both sources were collected or verified."},
 theoretical:{title:"Mathematical objects / theoretical cases",icon:"sigma",intro:"This investigation can begin with definitions, examples or a conjecture, without a dataset.",
  guidance:"Define the mathematical object and any restrictions, then begin a small numerical case, diagram or algebraic argument. A few examples might suggest a conjecture but cannot establish a general proof."},
 undecided:{title:"Starting material not yet decided",icon:"compass",intro:"You can choose a small mathematical question without committing to a data route.",
  guidance:"Start from the aim and choose one workable example, diagram, relationship or definition. If measurements are not available, do not invent them; clarify the source before presenting any calculations as real findings."}
};
export function firstMathsContext(state){
 const p=state?.planning?.fields||{},c=state?.completion?.fields||{};
 const kind=p.kind||state?.project?.kind||"unsure";
 const sourceKey=kind==="theoretical"?"theoretical":
  ["primary","secondary","both"].includes(p.dataSource)?p.dataSource:"undecided";
 const source=sourceInfo[sourceKey];
 const route=routeById(state?.planning?.routeExplorer?.selectedRoute);
 const mismatched=Boolean(route&&kind&&!["unsure","theoretical"].includes(kind)&&!route.kinds.includes(kind)||
  route&&kind==="theoretical"&&!route.kinds.includes("theoretical"));
 const activeRoute=mismatched?null:route;
 const selected=(Array.isArray(state?.planning?.mathSelected)?state.planning.mathSelected:[])
  .map(id=>techniqueById.get(id)).filter(Boolean);
 const matching=selected.filter(x=>!p.course||x.course===p.course);
 const oldMaths=!selected.length?firstNonempty(state?.project?.mathsCustom,p.otherMaths):"";
 const customMaths=firstNonempty(p.otherMaths);
 const firstIdea=firstNonempty(p.firstAction,p.figurePurpose);
 const proposedMove=firstIdea||activeRoute?.first?.[0]||"Choose one mathematical object, graph, small case or calculation";
 const mathematicalQuestion=firstNonempty(activeRoute?.question,p.figurePurpose);
 const sourceDetails=sourceKey==="primary"?firstNonempty(p.primaryWhat,p.primaryHow):
  sourceKey==="secondary"?firstNonempty(p.secondaryPublisher,p.secondaryUrl,p.secondaryVariables):
  sourceKey==="both"?
   [p.primaryWhat&&"Primary: "+p.primaryWhat,(p.secondaryPublisher||p.secondaryUrl)&&"Secondary: "+(p.secondaryPublisher||p.secondaryUrl)].filter(Boolean).join(" · "):
  sourceKey==="theoretical"?firstNonempty(p.theoreticalCase,p.theoreticalAim):"";
 const status=c.dataStatus||"";
 const recordedActual=has(c.actualSource)||has(c.theoreticalObject)||
  (Array.isArray(state?.completion?.sourceRecords)&&state.completion.sourceRecords.some(x=>
   has(x?.fields?.actualSource)||has(x?.fields?.theoreticalObject)));
 return {kind,sourceKey,source,route,activeRoute,mismatched,selected,matching,oldMaths,customMaths,
  firstIdea,proposedMove,mathematicalQuestion,sourceDetails,status,recordedActual,
  aim:firstNonempty(p.aim,state?.project?.aim),
  bridgePlacement:c.firstMathsBridgePlacement||"",bridgeNote:c.dataAimLink||"",
  purposeNote:c.firstPurpose||""};
}

const tip=(icon,e,{name,brief,detail,bad,good},i)=>'<details class="intro-advice-tip studio-stage-tip" data-first-maths-tip="'+i+'">'+
 '<summary><span class="intro-advice-tip-icon">'+icon(["target","chart","book","route"][i])+'</span>'+
 '<span class="intro-advice-tip-copy"><strong>'+e(name)+'</strong><span>'+e(brief)+'</span></span>'+
 '<span class="intro-advice-tip-chevron">'+icon("chevron-right")+'</span></summary>'+
 '<div class="intro-advice-tip-body"><p>'+e(detail)+'</p>'+
 '<div class="intro-advice-example"><p><strong>Instead of</strong> '+e(bad)+'</p>'+
 '<p><strong>Try</strong> '+e(good)+'</p></div></div></details>';
export function firstMathsTips(ctx){
 const first=ctx.activeRoute,source=ctx.source;
 return [
  {name:"Connect your first step to your aim",brief:"Once is enough: introduce the mathematical purpose here or in your Introduction.",
   detail:"A sentence or two is enough to explain why the first graph, diagram, small case or calculation helps answer your aim. If you already made this connection clearly in your Introduction, do not repeat it. Begin the mathematics.",
   bad:"I will use a lot of graphs and formulas.",
   good:"I will first compare the observed quantities to see whether a mathematical relationship might answer my question."},
  {name:"Get to the mathematics",brief:first?"Your possible starting move: "+first.first[0]:"Start with one purposeful mathematical representation or case.",
   detail:first?"Your chosen journey suggests: "+first.first[1]+" This was a planning idea, not a compulsory technique or completed result. State what you want to learn and show the actual mathematics.":
    "Introduce one small mathematical step that could reveal something relevant. You do not need to announce all the calculations you might eventually use.",
   bad:"This investigation will include a long sequence of calculations.",
   good:first?"I can begin by "+first.first[0].toLowerCase()+" to explore the first mathematical question.":
    "I will start with a simple case and examine what it reveals."},
  {name:"Introduce only the context you need",brief:source.title+": enough background to understand the maths.",
   detail:source.guidance,
   bad:"Before showing any mathematics, here is everything about my topic and data collection.",
   good:ctx.sourceKey==="theoretical"?"I will define the variables and investigate a simple case first.":
    "I will briefly identify the relevant quantities, units and source, then use them mathematically."},
  {name:"Your plan is not your result",brief:"Selected techniques and journeys can change once you see what actually happens.",
   detail:"The mathematical techniques chosen in Planning are possibilities, not a required itinerary. Avoid claiming an expected outcome, drawing a hypothetical graph as if it came from real data, or justifying methods you have not used.",
   bad:"I chose regression in Planning, so it must produce the answer.",
   good:"I will inspect the first genuine result before deciding which mathematical technique follows."}
 ];
}
export function renderFirstMathsAdvice(state,icon,e,{reduced=false}={}){
 return '<section class="studio-stage-advice first-maths-advice" data-stage-advice="data" data-advice-moved-to-guide="first-mathematics" aria-label="Advice for introducing the first mathematics">'+
  '<div class="studio-stage-advice-head"><span class="studio-stage-icon">'+icon("compass")+'</span>'+
  '<div><span class="intro-writing-guide-eyebrow">BEFORE YOU WRITE · FIRST MATHEMATICS</span>'+
  '<h2>Aim first. Then one useful mathematical step.</h2>'+
  '<p>Make the mathematical story flow naturally from the Introduction without explaining your entire investigation in advance.</p></div></div>'+
  '<button type="button" class="writer-guide-inline-more" data-action="writer-guide-open" data-guide-tip="thinking" data-guide-spot="completing:C20:methodIntroduction">'+icon("book")+' Four practical first-mathematics writing tips '+icon("arrow-right")+'</button>'+
 '</section>';
}

const planningLink=(icon,label,node)=>'<button type="button" class="first-maths-edit-plan" data-action="insight-jump" data-insight-type="planning" data-node="'+node+'">'+label+' '+icon("arrow-up-right")+'</button>';

/** Specific beginning → diagnostic check → logical next move. All methods are
 * potential tools from Planning, not a prepared itinerary or a finding. */
const stepCell=(icon,e,index,title,copy)=>'<section class="first-maths-guide-step">'+
 '<span class="first-maths-guide-step-title"><span class="first-maths-guide-step-number">'+index+'</span>'+
 '<strong>'+title+'</strong></span><p>'+e(copy)+'</p></section>';
const guideCard=(math,sourceKey,icon,e,{compact=false,unverified=false}={})=>{
 const guide=techniqueStartingGuide(math.id);
 if(!guide)return "";
 return '<article class="first-maths-guide-card'+(compact?' is-secondary':'')+
  '" data-technique-start-guide="'+e(math.id)+'" data-source-context="'+e(sourceKey)+'">'+
  '<div class="first-maths-guide-card-header"><span class="first-maths-guide-symbol">'+
   icon(guide.mode==="abstract"?"sigma":guide.mode==="data"?"chart":"compass")+
   '</span><div><span class="first-maths-guide-eyebrow">'+(compact?'ANOTHER OPTION':'A GOOD WAY TO BEGIN')+'</span>'+
   '<h4>'+e(math.label)+'</h4></div></div>'+
  (unverified?'<p class="first-maths-guide-check">'+icon("alert-circle")+
   ' Your current course choice differs from this menu item. Check suitability with your teacher.</p>':'')+
  '<div class="first-maths-guide-steps">'+
   stepCell(icon,e,1,"Try first",guide.first)+
   stepCell(icon,e,2,"Look for",guide.look)+
   stepCell(icon,e,3,"Then decide",guide.next)+'</div>'+
  '<div class="first-maths-guide-source">'+icon("layers")+
   '<p><strong>For your starting material</strong> '+e(sourceAdviceForTechnique(sourceKey,guide.mode))+'</p></div>'+
  (math.caution?'<p class="first-maths-guide-caution">'+icon("lightbulb")+
   '<span><strong>Watch out:</strong> '+e(math.caution)+'</span></p>':'')+
  '</article>';
};
const routeGuideCard=(route,sourceKey,icon,e)=>{
 if(!route)return "";
 const signals=Array.isArray(route.branches)?route.branches.slice(0,2):[];
 return '<article class="first-maths-guide-card first-maths-route-guide" data-route-start-guide="'+e(route.id)+'">'+
  '<div class="first-maths-guide-card-header"><span class="first-maths-guide-symbol">'+icon("route")+'</span>'+
   '<div><span class="first-maths-guide-eyebrow">A STARTING IDEA FROM YOUR CHOSEN JOURNEY</span><h4>'+e(route.title)+'</h4></div></div>'+
  '<div class="first-maths-guide-steps">'+
   stepCell(icon,e,1,"Try first",route.first[1])+
   stepCell(icon,e,2,"Look for",route.question)+
   stepCell(icon,e,3,"Then decide",signals.length?
    'Respond to what the actual mathematics shows. For example, '+signals.map(x=>
     x.signal.toLowerCase()+': '+x.next).join(' Alternatively, '):
    'Use the first real finding to decide whether a second mathematical step would genuinely help.')+
   '</div>'+
  '<div class="first-maths-guide-source">'+icon("layers")+
   '<p><strong>For your starting material</strong> '+e(sourceAdviceForTechnique(sourceKey,
    route.family==="data"?"data":route.family==="reasoning"?"abstract":"flex"))+'</p></div>'+
  (route.caution?'<p class="first-maths-guide-caution">'+icon("lightbulb")+
   '<span><strong>Watch out:</strong> '+e(route.caution)+'</span></p>':'')+
 '</article>';
};
const customGuideCard=(name,icon,e)=>'<article class="first-maths-guide-card is-secondary" data-custom-maths-start>'+
 '<div class="first-maths-guide-card-header"><span class="first-maths-guide-symbol">'+icon("lightbulb")+
 '</span><div><span class="first-maths-guide-eyebrow">YOUR OWN MATHEMATICAL IDEA</span><h4>'+e(name)+'</h4></div></div>'+
 '<div class="first-maths-guide-steps">'+
  stepCell(icon,e,1,"Try first","Define a precise mathematical question and write down one legitimate example, diagram, expression or observation you could investigate.")+
  stepCell(icon,e,2,"Look for","What structure, pattern, restriction or relationship could the first example reveal?")+
  stepCell(icon,e,3,"Then decide","Choose a technique only after the first reasoning shows how it would advance your aim; ask your teacher about course suitability if uncertain.")+
 '</div></article>';

export function renderSelectedMathematicsAdvice(state,icon,e){
 const ctx=firstMathsContext(state);
 const order=orderSelectedTechniqueGuides(ctx.selected,ctx.activeRoute?.id,ctx?.selected.length?
  state?.planning?.fields?.course:"");
 const first=order.active[0]||order.other[0];
 const others=order.active.length?order.active.slice(1).concat(order.other):order.other.slice(1);
 const extraCustom=ctx.customMaths&&
  (!ctx.selected.length||!ctx.selected.some(x=>x.label.toLowerCase()===ctx.customMaths.toLowerCase()));
 const showRoute=!ctx.selected.length&&ctx.activeRoute;
 const fallback=!ctx.selected.length&&!ctx.activeRoute&&!extraCustom;
 const opening=first?guideCard(first,ctx.sourceKey,icon,e,{unverified:order.other.some(x=>x.id===first.id)}):
  showRoute?routeGuideCard(ctx.activeRoute,ctx.sourceKey,icon,e):
  extraCustom?customGuideCard(ctx.customMaths,icon,e):
  '<div class="first-maths-guide-empty">'+icon("compass")+
   '<p><strong>No technique needed yet.</strong> Start with the mathematical aim and choose one small, genuine example, diagram or representation that might reveal something useful. Revisit your choices once you know what the first step shows.</p></div>';
 const optional=[
  ...others.map(math=>({label:math.label,html:guideCard(math,ctx.sourceKey,icon,e,
   {compact:true,unverified:order.other.some(x=>x.id===math.id)})})),
  ...(extraCustom&&first?[{label:ctx.customMaths,html:customGuideCard(ctx.customMaths,icon,e)}]:[])
 ];
 const otherHtml=optional.length?'<details class="first-maths-other-guides" data-first-maths-other-guides>'+
  '<summary>'+icon("layers")+'<span><strong>Advice for my other mathematical possibilities ('+optional.length+')</strong>'+
   '<small>Open only the techniques you might actually use next.</small></span>'+icon("chevron-right")+'</summary>'+
   '<div class="first-maths-other-guides-content">'+optional.map((x,i)=>
    '<details class="first-maths-other-technique" data-other-technique="'+i+'">'+
    '<summary>'+icon("chevron-right")+' '+e(x.label)+'</summary>'+x.html+'</details>').join("")+
   '</div></details>':'';
 return '<div class="first-maths-starting-guidance" data-first-maths-starting-guidance>'+
  '<div class="first-maths-starting-guidance-head">'+icon("lightbulb")+
   '<div><h3>How could I actually start?</h3>'+
   '<p>Pick one genuine mathematical opening. Look at what it reveals before deciding whether to use another technique.</p></div></div>'+
  opening+otherHtml+
  (fallback?'<p class="first-maths-starting-hint">Choosing a specific technique in Planning is optional. A clear mathematical question is enough to begin.</p>':
   '<p class="first-maths-starting-hint">These are possible mathematical directions, not instructions to follow or evidence already collected. You decide what fits your aim.</p>')+
 '</div>';
}

export function renderFirstMathsSparks(state,icon,e){
 const ctx=firstMathsContext(state),maths=ctx.matching,all=ctx.selected;
 const route=ctx.activeRoute;
 const topicHtml=all.length?
  '<div class="first-maths-maths-list">'+all.slice(0,4).map(x=>
   '<span class="first-maths-maths-pill">'+e(x.label)+'</span>').join("")+
   (all.length>4?'<span class="first-maths-maths-more">+'+(all.length-4)+' more saved</span>':'')+'</div>':
  (ctx.oldMaths?'<p class="first-maths-maths-history">'+e(ctx.oldMaths)+'</p>':'');
 return '<section class="studio-stage-sparks first-maths-sparks" data-first-maths-context aria-label="Your saved starting points">'+
  '<div class="studio-stage-sparks-head">'+icon("sparkles")+'<div>'+
   '<span class="intro-writing-guide-eyebrow">FROM YOUR PLANNING</span>'+
   '<h2>Your mathematical starting points</h2>'+
   '<p>These are your choices, brought back when they can help. You may change them after real mathematical discoveries.</p></div></div>'+
  '<div class="first-maths-start-grid">'+
   '<article class="first-maths-start-card" data-first-maths-aim><span class="first-maths-start-label">'+icon("target")+' MY AIM</span>'+
    '<p>'+(ctx.aim?e(ctx.aim):'An aim has not yet been recorded. Start with a mathematical question you can investigate.')+'</p>'+
    planningLink(icon,ctx.aim?'Review my aim':'Set my aim','N01')+'</article>'+
   '<article class="first-maths-start-card" data-first-maths-move>'+
    '<span class="first-maths-start-label">'+icon("compass")+' MY FIRST POSSIBLE MOVE</span>'+
    '<p>'+e(ctx.proposedMove)+'</p>'+
    (route?'<small>From your chosen journey: '+e(route.title)+'</small>':
     ctx.firstIdea?'<small>From your saved first-step idea</small>':
     '<small>You can choose a starting point as the maths develops.</small>')+
    planningLink(icon,'Review mathematical choices','N02M')+'</article></div>'+
  '<div class="first-maths-planning-strip" data-first-maths-source="'+e(ctx.sourceKey)+'">'+
    '<span class="first-maths-source-icon">'+icon(ctx.source.icon)+'</span><div>'+
     '<strong>'+e(ctx.source.title)+' · planned starting material</strong>'+
     '<p>'+e(ctx.source.intro)+'</p>'+
     (ctx.sourceDetails?'<p class="first-maths-plan-specific">'+e(ctx.sourceDetails)+'</p>':'')+
    '</div>'+planningLink(icon,'Review source choices',ctx.sourceKey==="theoretical"?'N02M':'N03')+'</div>'+
  (topicHtml?'<div class="first-maths-planned-techniques"><strong>Mathematics you considered in Planning</strong>'+topicHtml+
    '<p>These are possibilities, not a checklist or evidence of mathematics already done.</p></div>':'')+
  renderSelectedMathematicsAdvice(state,icon,e)+
  (ctx.mismatched?'<p class="first-maths-plan-review" role="status">Your earlier journey belongs to a different investigation type. Review it before treating its first move as relevant.</p>':'')+
  (all.length&&maths.length<all.length?'<p class="first-maths-plan-review">Some selected mathematics belongs to a different course from the one now recorded. Check suitability; it is not automatically part of your IA.</p>':'')+
  (route&&!ctx.selected.length?'<aside class="first-maths-question"><strong>'+icon("lightbulb")+' One mathematical question to consider</strong><p>'+e(route.question)+'</p>'+
    '<small>A starting suggestion — write and decide your own mathematical question.</small></aside>':'')+
  renderSparkShelf(state,"C20",{surface:"studio",libraryOnly:true})+
 '</section>';
}
export function firstMathsExampleTopic(state){
 const ctx=firstMathsContext(state);
 if(ctx.kind==="theoretical")return "proof";
 const family=ctx.activeRoute?.family;
 if(family==="data")return ctx.activeRoute?.id==="categorical"?"table":"graph";
 if(family==="models")return "model";
 if(family==="decisions")return "diagram";
 if(family==="reasoning")return "proof";
 if(ctx.kind==="statistics")return "graph";
 if(ctx.kind==="modelling")return "model";
 return "first-method";
}
export function renderFirstMathsExamples(state,icon,e,help=""){
 const topic="first-method";
 return '<details class="studio-stage-examples first-maths-examples" data-writing-examples>'+
  '<summary>'+icon("book")+'<span><strong>See how a first mathematical step can be introduced (optional)</strong>'+
  '<small>Compare fictional writing that connects a mathematical question to its first genuine step.</small></span>'+
  icon("chevron-right")+'</summary>'+
  '<div class="studio-stage-example-actions">'+exampleButton("1 · Connect the aim",{topic:"first-link"})+
    exampleButton("2a · Justify the maths",{topic})+
    exampleButton("See route-specific first diagrams",{topic:firstMathsExampleTopic(state)})+
    exampleButton("2b · Evaluate alternatives",{topic:"first-evaluation"})+
    exampleButton("Browse all examples",{browse:true})+'</div>'+
  '<p class="studio-stage-example-note">These examples are fictional; use them to learn how to introduce mathematics, not as text to submit.</p>'+
  (help?'<details class="studio-stage-more-help"><summary>'+icon("circle-help")+
   ' More source, mathematical and writing support '+icon("chevron-right")+
   '</summary><div class="studio-stage-help-content">'+help+'</div></details>':'')+
  '<div class="studio-stage-support-actions">'+essentialsButton("Full criteria rubric",{tab:"rubric"})+
   '<button type="button" class="btn btn-quiet" data-action="resource-browse">Tools & tutorials</button>'+
   '<button type="button" class="btn btn-quiet" data-action="open-stuck">I am stuck</button></div></details>';
}
