/** The student-owned mathematical journey, not a predetermined sequence of tasks.
 * Only a confirmed result creates a filled discovery; a technique/question is not a result.
 * Read the method used in EACH entry, not the first route selected in Planning.
 */
import {escapeHtml as e,icon} from "./primitives.js";

const text=x=>typeof x==="string"?x.trim():"";
const real=x=>x?.status==="completed"&&!!text(x?.result);
const question=x=>!!text(x)&&(/[\?？]\s*$/.test(text(x))||
 /^(?:what|how|why|which|where|when|does|do|can|could|would|should|is|are|will|to what extent)\b/i.test(text(x)));
const generic=x=>!text(x)||/^(?:(?:first |initial )?(?:purposeful )?(?:representation|mathematics|maths|actual work|maths result)|mathematical (?:step|stage)\s*\d*|first mathematical (?:step|stage)|my (?:next )?mathematics|possible next method|new mathematical method|my first mathematics)$/i.test(text(x));
const excerpt=(x,limit=260)=>{
 const s=text(x);if(s.length<=limit)return s;
 const cut=s.slice(0,limit-1),at=cut.lastIndexOf(" ");
 return (at>limit*.7?cut.slice(0,at):cut).trimEnd()+"…";
};
const METHODS=Object.freeze({
 pmcc:"Calculate Pearson's r (PMCC)",
 "linear-regression":"Fit a linear regression model",
 spearman:"Calculate Spearman's rank correlation",
 "quadratic-fit":"Fit and evaluate a polynomial model",
 exponential:"Fit an exponential growth or decay model",
 sinusoidal:"Fit a periodic or trigonometric model",
 optimisation:"Optimise using differentiation",
 "finance-break-even":"Calculate revenue, costs and break-even",
 "finance-compound":"Model compound interest",
 "finance-loan":"Model loan repayments",
 "finance-cashflow":"Analyse cumulative cash flow",
 "geometric-model":"Model geometric measurements",
 normal:"Apply the normal distribution",
 binomial:"Apply a binomial probability model",
 "two-sample-t":"Carry out a two-sample t-test",
 "chi-independence":"Test independence using chi-squared",
 "chi-fit":"Test goodness of fit using chi-squared",
 probability:"Investigate conditional probability",
 voronoi:"Construct and analyse a Voronoi diagram",
 triangulation:"Calculate distances using triangulation",
 "expected-value":"Calculate expected value and assess risk",
 "numerical-integration":"Estimate area using numerical integration",
 "rates-from-data":"Estimate rates of change from data",
 power:"Investigate a power-law model",
 proof:"Develop a proof or counterexample",
 algebra:"Develop an algebraic argument"
});
const FIRST_KIND=Object.freeze({
 scatter:"Plot a scatter diagram",distribution:"Compare distributions",
 table:"Construct a mathematical table",diagram:"Construct a labelled mathematical diagram",
 calculation:"Carry out an initial calculation",theory:"Explore a mathematical case",
 graph:"Plot a graph",model:"Build an initial mathematical model"
});
const QUESTION_METHODS=[
 [/\bpmcc\b|\bpearson\b/i,"Calculate Pearson's r (PMCC)"],
 [/\bspearman\b/i,"Calculate Spearman's rank correlation"],
 [/\bchi[- ]?squared\b|\bchi[- ]?square\b/i,"Carry out a chi-squared test"],
 [/\bregression\b|\bline of best fit\b/i,"Fit a regression model"],
 [/\bquadratic\b|\bparabol/i,"Investigate a quadratic model"],
 [/\bexponential\b/i,"Investigate an exponential model"],
 [/\bperiodic\b|\bsinusoidal\b/i,"Investigate a periodic model"],
 [/\bvoronoi\b/i,"Construct a Voronoi diagram"],
 [/\btriangulat/i,"Use triangulation"],
 [/\boptimis|\boptimiz|\bmaximum\b|\bminimum\b/i,"Investigate an optimum"],
 [/\bresidual/i,"Analyse model residuals"],
 [/\bscatter\b/i,"Plot a scatter diagram"],
 [/\bexpected value\b/i,"Calculate expected value"],
 [/\bproof\b|\bprove\b/i,"Develop a mathematical proof"],
 [/\bprobability\b/i,"Calculate and interpret probability"],
 [/\bcorrelation\b/i,"Investigate correlation"],
 [/\bgrowth\b|\bdecay\b/i,"Investigate a growth or decay model"]
];

/** Human-readable mathematical action, with its provenance. Inference from
 * a QUESTION is marked provisional even if the student has other completed work. */
export function mathActionDetail(state,entry){
 const id=text(entry?.methodId),title=text(entry?.title),technique=text(entry?.technique);
 if(METHODS[id])return {label:METHODS[id],origin:"recorded"};
 if(technique&&!generic(technique))return {label:technique,origin:"recorded"};
 if(title&&!generic(title)&&!question(title))
  return {label:title,origin:"recorded"};
 const plan=state?.planning?.fields||{},fields=state?.completion?.fields||{};
 if(entry?.phase==="first"){
  const type=text(entry?.kind)||text(fields.firstType);
  if(FIRST_KIND[type])return {label:FIRST_KIND[type],origin:"recorded"};
  const planned=text(plan.firstAction);
  if(planned)return {label:planned,origin:"planning"};
 }
 // A next QUESTION may mention a method. This is a possibility to confirm,
 // never a declaration that the student has performed it.
 if(question(title)){
  const match=QUESTION_METHODS.find(([pattern])=>pattern.test(title));
  if(match)return {label:match[1],origin:"question"};
 }
 if(id==="other")return {label:"Name your chosen mathematical technique",origin:"missing"};
 if(id==="follow-journey")return {label:"Describe the next mathematics in your journey",origin:"missing"};
 return {label:"Choose the mathematics for this stage",origin:"missing"};
}
export const mathActionTitle=(state,entry)=>mathActionDetail(state,entry).label;

function stageLabel(entries,entry,index){
 if(entry?.phase==="substantial"){
  const order=entries.slice(0,index+1).filter(x=>x?.phase==="substantial").length;
  return "STAGE "+(order+1);
 }
 if(entry?.phase==="first"){
  const firsts=entries.filter(x=>x?.phase==="first");
  if(firsts.length>1)return "FIRST MATHEMATICS · REPRESENTATION "+(firsts.findIndex(x=>x===entry)+1);
  return "STAGE 1 · FIRST MATHEMATICS";
 }
 return "MATHEMATICAL RECORD "+(index+1);
}
function recordStatus(entry){
 return entry?.reviewNeeded==="yes"?"review":real(entry)?"actual":"planned";
}
function statusLabel(status){
 return status==="review"?"Needs review":status==="actual"?"Actual result":"Planned";
}
function currentQuestion(state,entry){
 const t=text(entry?.title),purpose=text(entry?.purpose);
 if(question(t))return t;
 if(question(purpose))return purpose;
 if(entry?.phase==="first"){
  const fields=state?.completion?.fields||{};
  return text(fields.firstPurpose)||text(state?.planning?.fields?.figurePurpose);
 }
 return purpose&&purpose!==t?purpose:"";
}
function linkText(state,parent,child){
 const saved=text(child?.bridge);
 if(saved)return saved;
 const why=text(parent?.nextWhy);
 if(why)return why;
 if(parent?.phase==="first")return text(state?.completion?.fields?.nextReason);
 return "";
}
function pathCard(state,entries,entry,index,byId){
 const status=recordStatus(entry),action=mathActionDetail(state,entry);
 const q=currentQuestion(state,entry),finding=real(entry)?
  (text(entry.localTakeaway)||text(entry.interpretation)||text(entry.observationText)||text(entry.result)):"";
 const parent=entry?.fromEntryId?byId.get(entry.fromEntryId):null;
 const note=parent?linkText(state,parent,entry):"";
 const parentAction=parent?mathActionTitle(state,parent):"";
 const isOther=!!entry?.fromEntryId&&!parent;
 const lead=parent?'<div class="math-journey-link" data-math-linked-from="'+e(parent.id)+'">'+
   '<span class="math-journey-link-icon">'+icon("route")+'</span>'+
   '<div><span class="math-journey-link-label">WHY THIS STAGE FOLLOWS</span>'+
   (note?'<p>'+e(excerpt(note,250))+'</p>':
    '<p>Linked to '+e(parentAction)+'. Explain why this result made the next method worthwhile.</p>')+
   '</div></div>':
   isOther?'<p class="math-journey-link-note">The earlier linked record is not available. Review this connection.</p>':"";
 const provenance=action.origin==="planning"?
  '<span class="math-journey-source-note">'+icon("info")+'<span class="inline-notice-copy">'+
   ' Starting idea from Planning — check that this matches the mathematics you used.</span></span>':
  action.origin==="question"?
  '<span class="math-journey-source-note">'+icon("info")+'<span class="inline-notice-copy">'+
   ' Suggested by your question — confirm the technique in this stage.</span></span>':
  action.origin==="missing"?
  '<span class="math-journey-source-note">'+icon("pencil")+'<span class="inline-notice-copy">'+
   ' Choose or name the technique on this stage’s writing page.</span></span>':"";
 const currentNext=text(entry?.nextQuestion);
 return '<div class="math-journey-step '+status+'" data-math-journey-step="'+index+'">'+lead+
  '<button type="button" class="math-journey-step-card" data-action="completion-edit-entry" data-index="'+index+
   '" aria-label="'+e('Open '+stageLabel(entries,entry,index)+': '+action.label+'. '+statusLabel(status))+'.">'+
   '<span class="math-journey-step-number" aria-hidden="true">'+
    icon(status==="review"?"alert-circle":status==="actual"?"check-circle":"circle")+'</span>'+
   '<span class="math-journey-step-content">'+
    '<span class="math-journey-step-top"><span class="math-journey-stage-tag">'+e(stageLabel(entries,entry,index))+'</span>'+
     '<span class="math-journey-status">'+e(statusLabel(status))+'</span></span>'+
    '<strong class="math-journey-action">'+e(action.label)+'</strong>'+
    (q?'<span class="math-journey-question"><b>Question</b> '+e(excerpt(q,220))+'</span>':"")+
    (finding?'<span class="math-journey-finding"><b>What I found</b> '+e(excerpt(finding))+'</span>':
     '<span class="math-journey-not-yet">Awaiting a genuinely completed mathematical result</span>')+
    (status==="review"?'<span class="math-journey-review-note">An earlier finding has changed. Recheck the mathematical connection; your work is preserved.</span>':"")+
    (currentNext&&real(entry)?'<span class="math-journey-next-question"><b>Question raised</b> '+e(excerpt(currentNext,180))+'</span>':"")+
    provenance+
   '</span><span class="math-journey-step-open">'+icon("arrow-right")+
     '<span>Open stage</span></span>'+
  '</button></div>';
}
export function mathConstellation(state,{compact=false}={}){
 const entries=Array.isArray(state?.entries)?state.entries:[],actual=entries.filter(real).length,
  pending=entries.filter(x=>!real(x)&&x?.reviewNeeded!=="yes").length,
  review=entries.filter(x=>x?.reviewNeeded==="yes").length,
  count=compact?4:8,shown=entries.slice(-count),start=entries.length-shown.length,
  allById=new Map(entries.filter(x=>text(x?.id)).map(x=>[x.id,x])),
  within=new Map(shown.filter(x=>text(x?.id)).map((x,i)=>[x.id,i])),
  positions=shown.map((_,i)=>({x:shown.length===1?50:9+82*i/(shown.length-1),y:46+Math.sin(i*1.8)*9}));
 const links=shown.map((entry,i)=>{
  const from=within.get(entry?.fromEntryId);
  if(from===undefined||from===i)return "";
  const a=positions[from],b=positions[i],half=(a.x+b.x)/2;
  return '<path class="constellation-link'+(entry.reviewNeeded==="yes"?" review":"")+
   '" d="M'+a.x.toFixed(1)+' '+a.y.toFixed(1)+' C'+half.toFixed(1)+' '+a.y.toFixed(1)+
   ' '+half.toFixed(1)+' '+b.y.toFixed(1)+' '+b.x.toFixed(1)+' '+b.y.toFixed(1)+'"/>';
 }).join("");
 const markers=shown.map((entry,i)=>{
  const p=positions[i],index=start+i,status=recordStatus(entry);
  return '<button type="button" class="constellation-star-hit '+status+
   '" data-action="completion-edit-entry" data-index="'+index+
   '" style="left:'+p.x.toFixed(2)+'%;top:'+p.y.toFixed(2)+'%"'+
   ' aria-label="'+e('Open '+(entry?.title||mathActionTitle(state,entry))+': '+statusLabel(status))+'"'+
   ' title="'+e(mathActionTitle(state,entry)+' · '+statusLabel(status))+'">'+
   '<span class="constellation-star-number" aria-hidden="true">'+(index+1)+'</span></button>';
 }).join("");
 const intro='A genuine mathematical result lights a star. The cards below show your techniques, findings and reasons for continuing.';
 const heading='<section class="math-constellation '+(compact?"is-compact":"")+
  '" aria-label="Your mathematical journey">'+
  '<div class="math-constellation-top"><div><span class="section-eyebrow">'+icon("route")+
   ' MATHEMATICAL JOURNEY</span><h3>Follow your mathematics, step by step</h3></div>'+
   '<span class="math-constellation-count">'+actual+' actual result'+(actual===1?"":"s")+
   (pending?' · '+pending+' planned':'')+(review?' · '+review+' to review':'')+'</span></div>'+
   '<p class="math-constellation-intro">'+intro+'</p>';
 if(!entries.length)return heading+
  '<div class="math-constellation-empty">'+icon("sparkles")+
  '<span>Start with a question worth exploring. Your mathematical techniques and genuine findings will appear here.</span></div>'+
  '<p class="math-constellation-small">There is no required number of results or stages.</p></section>';
 const visual='<div class="math-journey-sky-card"><div class="math-journey-sky-head">'+
  '<strong>'+icon("sparkles")+' YOUR GROWING CONSTELLATION</strong>'+
  '<span>Tap a star to revisit a stage</span></div>'+
  '<div class="constellation-sky-wrap"><svg class="math-constellation-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">'+
  '<path class="constellation-horizon" d="M6 49 H94"/>'+links+'</svg>'+markers+'</div></div>';
 const early=entries.slice(0,start),older=early.length&&!compact?
  '<details class="math-journey-earlier"><summary>'+icon("clock")+' Show '+early.length+
   ' earlier mathematical record'+(early.length===1?"":"s")+' '+icon("chevron-down")+'</summary>'+
   '<div class="math-journey-earlier-content">'+early.map((entry,i)=>pathCard(state,entries,entry,i,allById)).join("")+'</div></details>':"";
 const cards='<div class="math-journey-story" aria-label="Your mathematical techniques and findings">'+
  '<div class="math-journey-story-head"><strong>THE MATHEMATICAL STORY</strong><span>Choose a stage to revisit or refine it</span></div>'+
  older+
  shown.map((entry,i)=>pathCard(state,entries,entry,start+i,allById)).join("")+
  '</div>';
 return heading+visual+cards+
  (compact&&start?'<p class="math-constellation-small">Showing the latest '+shown.length+
   ' records. Open My Path to see the full mathematical journey.</p>':"")+
  '<p class="math-constellation-small math-journey-endnote">There is no target number of stars. A convincing mathematical investigation is about how each result informs the next decision.</p>'+
  '</section>';
}
