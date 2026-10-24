/**
 * Pass 4: evidence-led mathematical validity and course understanding.
 *
 * Read-only views over the current real mathematical result, explicitly linked
 * source/accuracy records, explicitly linked saved diagrams and course notes.
 * No automatic grading, error-bound inference, numerical interpretation of
 * free text, or unverified claim that a model predicts accurately.
 */
import {methodFamilies,firstUnfamiliarUse} from "./method-identity.js";
import {linkedSources,linkedAccuracy} from "./evidence-links.js";
import {REPRESENTATION_TOOLS} from "../diagrams/representation-registry.js";
import {analyseGraph} from "../diagrams/graph-core.js";
import {metricText} from "../diagrams/graph-diagnostics-view.js";
import {escapeHtml,icon as defaultIcon} from "../ui/primitives.js";

const str=x=>typeof x==="string"?x.trim():"";
const actual=x=>x?.status==="completed"&&!!str(x.result);
const short=(x,n=330)=>{const t=str(x);return t.length>n?t.slice(0,n-1)+"…":t};
const check=(title,question,limit)=>Object.freeze({title,question,limit});

/** A method must be explicitly selected or preserved by the restricted legacy
 * technique matcher. Never infer it from a result, title or planning route. */
export const VALIDITY_CHECKS=Object.freeze({
 pmcc:check("Linear association","Compare the coefficient with the actual scatter, its form and influential observations.","A coefficient cannot establish cause, predictive accuracy or absence of nonlinear structure."),
 spearman:check("Monotonic association","Check ranks, ties and whether a turning pattern makes a monotonic summary misleading.","Rank correlation cannot establish a straight-line prediction or cause."),
 "linear-regression":check("Prediction within a model","Inspect residual size and structure, coefficient units and the input range at the particular intended prediction.","In-sample R² and RMSE alone do not establish out-of-sample accuracy or extrapolation validity."),
 "quadratic-fit":check("Curvature and model complexity","Test relevant parameter/turning-point meaning, residual patterns and whether a simpler form answers the same question.","A higher-degree polynomial may overfit and behave implausibly outside the observed domain."),
 exponential:check("Proportional change","Check whether the observed ratios support a stable growth factor across the relevant intervals.","A fitted exponential does not prove that its factor stays constant indefinitely."),
 sinusoidal:check("Period and repeated cycles","Check whether several actual cycles support the estimated amplitude, period and baseline.","A single rise and fall cannot verify periodicity or reliable future cycles."),
 power:check("Scaling and transformed error","Check model positivity conditions, original-scale residuals and the meaning of the exponent.","Good agreement after logarithmic transformation may not imply small errors on the original scale."),
 optimisation:check("Feasible optimum","Check endpoints, other stationary candidates, the feasible domain and sensitivity to assumptions.","A derivative of zero alone does not prove the best feasible or global value."),
 "geometric-model":check("Measurement and shape assumptions","Check scale, measured dimensions, units and how sensitive the calculated area or volume is to uncertain inputs.","Idealised boundaries and precise arithmetic do not establish precise physical measurements."),
 normal:check("Distribution assumption","Check actual shape, skew, unusual values and the source of the mean and standard deviation.","A normal-probability formula cannot verify that the observations follow a normal distribution."),
 binomial:check("Repeated-trial assumptions","Check whether the trials have suitable outcomes, independence and a constant success probability.","A binomial calculation is conditional on those assumptions and the chosen event."),
 "two-sample-t":check("Statistical test conditions","Check sampling and independence, the chosen t-test variant, distribution/variance assumptions and effect size.","A nonsignificant result does not prove equal means; a p-value is not the size of the group difference."),
 "chi-independence":check("Expected counts and categories","Verify the contingency table totals, expected counts, independent observations and meaningful categories.","A test result cannot establish causation or quantify strength of association by itself."),
 "chi-fit":check("The hypothesised distribution","Check expected frequencies, how hypothesised category probabilities were justified and independence.","Failing to reject is not proof that the assumed distribution is true."),
 probability:check("Conditioning events","Check event definitions, denominators and any assumed independence.","Reversing the condition can completely change the probability."),
 "expected-value":check("Expectation versus risk","Check event probabilities, payoff units and the probability and magnitude of adverse outcomes.","Expected value is not a guaranteed payoff, or sufficient alone for risk-sensitive decisions."),
 voronoi:check("Meaning of nearest","Check site coordinates, clipping boundary and whether Euclidean distance matches the real access question.","A nearest-site cell is not automatically shortest travel time, demand or service quality."),
 triangulation:check("Sensitivity of a measured triangle","Check baseline calibration, angle definitions and how plausible measurement changes alter the derived value.","Trigonometric calculation does not remove uncertainty in measured lengths and angles."),
 "numerical-integration":check("Numerical approximation","Compare a justified finer partition or known exact answer, noting interval and step size.","A trapezoidal or other numerical estimate is not generally exact, even if shown to many digits."),
 "rates-from-data":check("Interval and noise","Compare finite differences over reasonable intervals and the original measurement resolution.","An average difference quotient is not automatically an instantaneous rate."),
 "finance-break-even":check("Feasibility of a threshold","Check the stated fixed/variable costs, price and realistic capacity/demand around break-even.","An algebraic threshold does not establish achievable sales or profit."),
 "finance-compound":check("Rate and time assumptions","Verify the compounding period and whether the stated rate is nominal or effective.","A fixed-rate projection is not a guaranteed future return."),
 "finance-loan":check("Period and lifetime cost","Check periodic rate, repayment count, total interest and loan balance.","A smaller periodic payment may mean a larger lifetime cost."),
 "finance-cashflow":check("Intermediate cash constraints","Check the timing of receipts and payments and the lowest intermediate balance.","A positive final balance does not ensure that every earlier payment was affordable."),
 proof:check("Generality and assumptions","Check quantifiers, permitted domain and the logical step proving all allowed cases.","Several examples alone cannot prove a universal statement; a counterexample disproves only the stated claim."),
 algebra:check("Allowed solutions and transformations","Check domain restrictions, excluded values and substitutions back into the original statement.","Squaring, division or taking logarithms can introduce or exclude possible solutions.")
});
const GENERIC=check("Scope of the mathematical claim",
 "Check the definitions, conditions and at least one mathematical way the result could be challenged.",
 "A recorded output is not automatically an accurate answer for every permitted input.");
const SYMBOLS=Object.freeze({graph:"Graph / model",stat:"Statistical diagram",table:"Table",
 trace:"Image / coordinate trace",voronoi:"Voronoi construction",geometry:"Geometric construction",
 probability:"Probability tree"});
const FIGURE_CHECKS=Object.freeze({
 graph:"Confirm original data, axis units and the actual input range; inspect residual patterns before choosing a model.",
 stat:"Check category or interval boundaries, denominator, scales and whether apparent group differences remain meaningful.",
 table:"Check units, denominators, rounding, totals and whether every summary comes from the intended actual data.",
 trace:"Check original scale calibration, perspective and boundary-point selection before trusting a derived distance or area.",
 voronoi:"Check site coordinates and whether the chosen distance definition represents actual access or movement.",
 geometry:"Check construction assumptions, units and sensitivity to imprecise lengths, angles or coordinates.",
 probability:"Check every conditional branch sum, event definition and whether independence was justified rather than assumed."
});

/** Strictly stage-linked, saved figures; another stage's working graph or the
 * current unsaved draft cannot supply diagnostics for this finding. */
export function savedFiguresForMathematics(state,entry){
 if(!entry?.id)return[];
 const result=[];
 for(const tool of REPRESENTATION_TOOLS){
  const studio=state?.[tool.studio],figures=Array.isArray(studio?.figures)?studio.figures:[];
  for(const figure of figures){
   if(!str(figure?.id)||!figure.draft)continue;
   const ref=tool.id+":"+figure.id;
   if(entry[tool.entryKey]!==figure.id&&!entry.figureRefs?.includes(ref))continue;
   // Conflicting explicit owners make a figure link ambiguous: do not borrow it.
   if((state?.entries||[]).some(other=>other!==entry&&
      (other?.[tool.entryKey]===figure.id||other?.figureRefs?.includes(ref))))continue;
   const resultFigure={id:figure.id,kind:tool.id,title:str(figure.draft.title)||SYMBOLS[tool.id],
    prompt:FIGURE_CHECKS[tool.id],savedAt:str(figure.savedAt)};
   if(tool.id==="graph"){
    // Re-evaluate only the saved snapshot. These are in-sample descriptive
    // metrics, never a grade, automatic model choice or future prediction.
    const analysis=analyseGraph(figure.draft);
    resultFigure.ready=analysis.ready;
    resultFigure.warning=!analysis.ready?"Saved graph has unresolved figure checks.":
     analysis.warnings.some(x=>x.code==="clipped"||x.code==="empty-viewport")?
     "Review the axis range: some recorded data may be hidden.":"";
    const xs=analysis.points.map(x=>x.x).filter(Number.isFinite);
    resultFigure.observedRange=xs.length&&figure.draft.kind!=="function"?
     [Math.min(...xs),Math.max(...xs)]:null;
    resultFigure.variables={x:str(analysis.draft.xLabel),y:str(analysis.draft.yLabel),
     xUnit:analysis.draft.xUnitMode==="unit"?str(analysis.draft.xUnit):"",
     yUnit:analysis.draft.yUnitMode==="unit"?str(analysis.draft.yUnit):""};
    resultFigure.models=analysis.ready?analysis.models
     .filter(m=>m.visible&&m.valid&&m.diagnostics?.ok).slice(0,4)
     .map(m=>({id:m.id,title:m.label,method:m.method,n:m.diagnostics.n,
      rmse:m.diagnostics.rmse,r2:m.diagnostics.r2,fitKind:m.type})): [];
   }else resultFigure.ready=true; // Saved only; not a mathematical verification.
   result.push(resultFigure);
  }
 }
 return result.slice(0,16);
}

const recordedSources=(state,entry)=>linkedSources(state,entry).map(source=>({
 id:source.id,name:str(source.fields?.actualSource||source.fields?.theoreticalObject||source.fields?.sourceCitation)||"Linked evidence",
 status:str(source.fields?.dataStatus),fields:source.fields||{}
}));
const recordedAccuracy=(state,entry)=>linkedAccuracy(state,entry).map(item=>({
 id:item.id,quantity:str(item.quantity),unit:str(item.unit),
 resolution:str(item.resolution),policy:str(item.policy),reason:str(item.reason)
}));

export function mathematicalCourseContext(state,entry){
 if(!entry)return null;
 const scope=str(entry.knowledge)||"unsure";
 const component=str(entry.unfamiliarComponent),method=str(entry.methodId||entry.technique);
 const use=firstUnfamiliarUse(state,entry);
 const hasExplanation=!!str(entry.knowledgeNotes||entry.understandingExample||entry.mathsInsight);
 const text=scope==="syllabus"?
  "You marked this method as familiar IB course mathematics. Apply it accurately, define your variables and explain the interpretation; do not reproduce a textbook lesson.":
  scope==="mixed"||scope==="outside"?
   use?"This is the first recorded use of the unfamiliar mathematics. Explain its central idea, required conditions and one meaningful step before applying it.":
   "An earlier completed use of this unfamiliar mathematics is recorded. Refer back to the first explanation if it was sufficient; do not repeat a full tutorial.":
   "Course scope is unconfirmed. Check the actual mathematics against your own AI SL, AA SL or AA HL course (or ask your teacher); do not infer syllabus status from a technique's name.";
 return {scope,component,method,firstUse:use,hasExplanation,text,
  notes:str(entry.knowledgeNotes),example:str(entry.understandingExample),source:str(entry.researchSource)};
}

export function mathematicalValidityContext(state,entry){
 if(!actual(entry))return null;
 const methods=methodFamilies(entry),key=[...methods].find(id=>Object.hasOwn(VALIDITY_CHECKS,id))||"general";
 const rule=VALIDITY_CHECKS[key]||GENERIC;
 const sources=recordedSources(state,entry),accuracies=recordedAccuracy(state,entry);
 const figures=savedFiguresForMathematics(state,entry),course=mathematicalCourseContext(state,entry);
 const theoretical=entry.kind==="theory"||key==="proof"||key==="algebra"&&
  (state?.planning?.fields?.kind==="theoretical");
 const sourceQuestions=theoretical?
  "Check definitions, hypotheses and permitted mathematical values rather than inventing a measurement uncertainty.":
  sources.length?
  "Which linked observations are actually available, and which limitations of their collection or selection affect this calculation?":
  "No actual source has been explicitly linked to this mathematical stage. If it uses data, link the original source before making source-based claims.";
 const accuracyQuestions=theoretical?
  "Keep symbolic results exact where appropriate; justify any numerical approximation rather than inventing a measured uncertainty.":
  accuracies.length?
  "Use the original resolution and stated precision policy only for the linked quantities. Test how uncertainty might affect the answer if it matters; resolution alone does not determine ± uncertainty.":
  "No confirmed accuracy decision is explicitly linked here. A planned recording rule is not evidence of actual measurement precision.";
 const risk=str(entry.limitations);
 const confirmedLimits=(state?.completion?.confirmedLimitations||[])
  .filter(l=>l.entryId===entry.id&&str(l.explanation)&&str(l.consequence))
  .map(l=>({explanation:str(l.explanation),consequence:str(l.consequence)}));
 return {entryId:entry.id,title:str(entry.title),result:str(entry.result),aim:str(state?.planning?.fields?.aim||state?.project?.aim),
  needsReview:entry.reviewNeeded==="yes",method:key,rule,sourceQuestions,accuracyQuestions,
  sourceLinks:sources,accuracyLinks:accuracies,figures,course,
  recordedLimitation:risk,confirmedLimitations:confirmedLimits,theoretical};
}

const textRow=(title,value,e)=>'<div class="math-validity-row"><strong>'+e(title)+'</strong><p>'+e(value)+'</p></div>';
const sourceRow=(x,e)=>'<li><strong>'+e(x.name)+'</strong> <small>Student-recorded status: '+e(x.status||"unconfirmed")+'</small>'+
 [x.fields?.actualMethod&&"Method: "+x.fields.actualMethod,
  x.fields?.samplingMethod&&"Sampling: "+x.fields.samplingMethod,
  x.fields?.modelDomain&&"Intended model domain: "+x.fields.modelDomain,
  x.fields?.modelAssumptions&&"Assumptions: "+x.fields.modelAssumptions,
  x.fields?.modelValidation&&"Proposed validation: "+x.fields.modelValidation].filter(Boolean)
 .slice(0,4).map(t=>'<p>'+e(short(t,400))+'</p>').join("")+'</li>';
const accuracyRow=(x,e)=>'<li><strong>'+e(x.quantity||"Linked quantity")+(x.unit?' ('+e(x.unit)+')':'')+'</strong>'+
 (x.resolution?'<p>Recorded resolution: '+e(short(x.resolution,250))+'</p>':'')+
 (x.policy?'<p>Chosen reporting policy: '+e(short(x.policy,250))+'</p>':'')+
 (x.reason?'<p>Student\'s reason: '+e(short(x.reason,270))+'</p>':'')+'</li>';
const figureRow=(f,e)=>'<li><strong>'+e(f.title)+'</strong> <small>'+e(SYMBOLS[f.kind])+' · saved and linked</small>'+
 '<p>'+e(f.prompt)+'</p>'+
 (f.warning?'<p class="math-validity-warning">'+e(f.warning)+'</p>':'')+
 (f.observedRange?'<p>Observed input range: '+e(metricText(f.observedRange[0]))+' to '+e(metricText(f.observedRange[1]))+
  (f.variables?.xUnit?' '+e(f.variables.xUnit):'')+'. Do not assume predictions remain valid outside this range.</p>':'')+
 (f.models?.length?'<div class="math-validity-models"><strong>Saved, in-sample model diagnostics (not proof of predictive accuracy)</strong><ul>'+
  f.models.map(m=>'<li>'+e(m.title)+' · RMSE '+e(metricText(m.rmse))+(f.variables?.yUnit?' '+e(f.variables.yUnit):'')+
    ' · R² '+e(m.r2===null?"undefined for constant output":metricText(m.r2))+
    ' · n = '+e(String(m.n))+
    (m.method?'<span> · '+e(short(m.method,80))+'</span>':'')+'</li>').join("")+
  '</ul><p>Compare residual patterns, model assumptions and the purpose of any prediction; these statistics describe only the saved observed points.</p></div>':'')+
 '</li>';

export function renderMathematicalValidityAid(state,entry,{icon=defaultIcon,e=escapeHtml,reduced=false}={}){
 const v=mathematicalValidityContext(state,entry);
 if(!v)return "";
 const summary=v.needsReview?"Review mathematical inputs and assumptions":
  "Accuracy, assumptions & validity for this result";
 return '<aside class="math-validity-aid'+(reduced?' is-reduced':'')+
  '" data-math-validity="'+e(v.entryId)+'" data-math-validity-method="'+e(v.method)+'">'+
  '<details><summary>'+icon("shield-check")+'<span><strong>'+e(summary)+'</strong>'+
  '<small>Input quality · method limits · domain · numerical accuracy</small></span>'+
  icon("chevron-right")+'</summary><div class="math-validity-body">'+
  (v.needsReview?'<p class="math-validity-warning" role="note">This result was flagged for review. Check it and its linked inputs before using its interpretation in later mathematics.</p>':'')+
  textRow('The mathematical validity question',v.rule.title+": "+v.rule.question,e)+
  textRow('What the calculation alone cannot establish',v.rule.limit,e)+
  textRow('Source and input uncertainty',v.sourceQuestions,e)+
  (v.sourceLinks.length?'<ul class="math-validity-linked" data-validity-linked-sources>'+
    v.sourceLinks.map(x=>sourceRow(x,e)).join("")+'</ul>':'')+
  textRow('Numerical accuracy and reporting',v.accuracyQuestions,e)+
  (v.accuracyLinks.length?'<ul class="math-validity-linked" data-validity-linked-accuracy>'+
    v.accuracyLinks.map(x=>accuracyRow(x,e)).join("")+'</ul>':'')+
  (v.figures.length?'<div class="math-validity-figures"><strong>Only diagrams explicitly saved and linked to this stage</strong>'+
   '<ul class="math-validity-linked">'+v.figures.map(x=>figureRow(x,e)).join("")+'</ul></div>':'')+
  (v.recordedLimitation?textRow("Your limitation note",v.recordedLimitation,e):'')+
  (v.confirmedLimitations.length?'<div class="math-validity-confirmed"><strong>Limitations and consequences you recorded</strong><ul>'+
    v.confirmedLimitations.map(x=>'<li>'+e(x.explanation)+' — '+e(x.consequence)+'</li>').join("")+'</ul></div>':'')+
  '<p class="math-validity-honesty">These are prompts and your saved inputs, not an independently checked error bound, verified model, or automatic IA paragraph. Only use claims you can justify from your own work.</p>'+
  '</div></details></aside>';
}

export function renderCourseUnderstandingAid(state,entry,{icon=defaultIcon,e=escapeHtml,reduced=false}={}){
 const c=mathematicalCourseContext(state,entry);
 if(!c)return"";
 return '<aside class="math-course-aid'+(reduced?' is-reduced':'')+
  '" data-course-understanding="'+e(str(entry.id))+'" data-course-scope="'+e(c.scope)+'">'+
  '<details><summary>'+icon("book-open")+'<span><strong>How much of this mathematics should I explain?</strong>'+
  '<small>'+e(c.scope==="syllabus"?"Familiar mathematics: explain use and meaning":
   c.scope==="mixed"||c.scope==="outside"?"Unfamiliar mathematics: explain the key idea":
   "Check my course and choose appropriate explanation")+'</small></span>'+
  icon("chevron-right")+'</summary><div class="math-course-body">'+
  '<p>'+e(c.text)+'</p>'+
  (c.component?textRow("The component you identified",c.component,e):'')+
  (c.notes?textRow("Your mathematical explanation",short(c.notes,850),e):'')+
  (c.example?textRow("Your worked example / demonstration",short(c.example,700),e):'')+
  ((c.scope==="mixed"||c.scope==="outside")&&!c.hasExplanation?
   '<p class="math-validity-warning">You have not yet recorded an explanation or a relevant worked step. If the idea is genuinely unfamiliar, explain it in your own IA when it first appears.</p>':'')+
  (c.source?'<p><strong>Source you noted:</strong> '+e(short(c.source,280))+' — cite the original source appropriately.</p>':'')+
  '<p class="math-validity-honesty">Syllabus status reflects your own selection; Pathfinder cannot verify course coverage or mathematical understanding. Refer to your actual course and ask your teacher when uncertain.</p>'+
  '</div></details></aside>';
}

/** A brief recall in a Discovery Spark, never another saved Spark / state entry. */
export function renderDiscoveryValidityRecall(state,entry,{e=escapeHtml}={}){
 const v=mathematicalValidityContext(state,entry);
 if(!v)return"";
 return '<div class="spark-validity-recall" data-spark-validity="'+e(v.entryId)+'">'+
  '<strong>Mathematical validity to revisit · '+e(v.rule.title)+'</strong>'+
  '<p>'+e(v.rule.question)+'</p>'+
  (v.accuracyLinks.length?'<small>'+v.accuracyLinks.length+' explicitly linked accuracy decision'+(v.accuracyLinks.length===1?'':'s')+'</small>':'')+
  (v.sourceLinks.length?'<small>'+v.sourceLinks.length+' explicitly linked source'+(v.sourceLinks.length===1?'':'s')+'</small>':'')+
  (v.figures.length?'<small>'+v.figures.length+' explicitly linked saved diagram'+(v.figures.length===1?'':'s')+'</small>':'')+
  (v.needsReview?'<p class="math-validity-warning">This mathematical result requires review before reliance.</p>':'')+
  '</div>';
}

/** Keep conclusion advice linked only to student-selected, review-free work,
 * or to the latest review-free result where no explicit selection exists. */
export function renderConclusionValidityAid(state,{icon=defaultIcon,e=escapeHtml,reduced=false}={}){
 const all=(state?.entries||[]).filter(x=>actual(x)&&x.reviewNeeded!=="yes");
 if(!all.length)return"";
 const selectedIds=state?.completion?.conclusionResultIds||[];
 const selected=all.filter(x=>selectedIds.includes(x.id));
 const targets=(selected.length?selected:all.slice(-1)).slice(0,3);
 return '<aside class="conclusion-validity-aid'+(reduced?' is-reduced':'')+
  '" data-conclusion-validity><details><summary>'+icon("shield-check")+
  '<span><strong>Do the mathematical limitations change my conclusion?</strong>'+
  '<small>Review conditions for '+targets.length+' recorded result'+(targets.length===1?'':'s')+'</small></span>'+
  icon("chevron-right")+'</summary><div class="math-validity-body">'+
  targets.map(entry=>{
   const v=mathematicalValidityContext(state,entry);
   return '<div class="math-validity-conclusion-result" data-validity-result="'+e(v.entryId)+'">'+
    '<strong>'+e(v.title||"Mathematical result")+'</strong>'+
    '<p>'+e(v.rule.question)+'</p>'+
    '<p><b>Claim limit:</b> '+e(v.rule.limit)+'</p>'+
    (v.accuracyLinks.length?'<small>'+v.accuracyLinks.length+' linked accuracy decision'+(v.accuracyLinks.length===1?'':'s')+'</small>':'')+
    (v.figures.length?'<small>'+v.figures.length+' linked saved diagram'+(v.figures.length===1?'':'s')+'</small>':'')+
    '</div>';
  }).join("")+
  '<p class="math-validity-honesty">Which of these limitations affects the actual answer, and where is the claim valid? These prompts do not decide sufficiency or verify the result. A limited conclusion is acceptable.</p>'+
  '</div></details></aside>';
}
