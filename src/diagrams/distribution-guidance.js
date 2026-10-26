/**
 * Student-facing guidance for an explicitly chosen theoretical probability model.
 *
 * Never produces an IA paragraph, infers observed data, validates distribution
 * fit or marks a mathematical stage complete. No tutorial text enters the SVG.
 * All prompts derive from the current editable draft and existing student notes.
 */
import {analyzeDistribution,distributionInterpretationSignature} from "./distribution-core.js";
import {compareDistributionWhatIf} from "./distribution-whatif-core.js";
import {distributionWhatIfReflection} from "./distribution-whatif-reflection.js";
import {presentationSparks} from "./presentation-coach-core.js";
import {lessonById,definitionById} from "../workshop/catalog.js";

const trim=(v,max=230)=>typeof v==="string"?v.trim().slice(0,max):"";
const truthy=x=>!!trim(x);
const entryAt=state=>state?.entries?.[state?.completion?.activeEntryIndex]||null;
/** Single source for the student’s actual saved investigation aim. */
export const distributionAim=state=>trim(state?.planning?.fields?.aim||state?.project?.aim,260);
export const DISTRIBUTION_LEARNING=Object.freeze({
 normal:Object.freeze({
  lessonId:"normal-models",definitions:["normal-distribution","standard-score","probability-density","cumulative-probability"],
  condition:"Check whether a symmetric, continuous bell-shaped model is plausible for the quantity and range actually studied.",
  test:"Inspect the actual measurements or process. Skew, truncation, several clusters or outliers may make this normal model misleading.",
  reasoning:"Explain where the mean and standard deviation came from; give both in the quantity's units. The second parameter in N(μ, σ²) is variance, but the studio input σ is standard deviation.",
  limit:"The area describes a theoretical model. Neither a drawn bell curve nor calculated parameters prove that observed data are normally distributed."
 }),
 binomial:Object.freeze({
  lessonId:"binomial-models",definitions:["bernoulli-trial","binomial-distribution","independent-events","cumulative-probability"],
  condition:"Define one trial and what counts as success; check a fixed number of trials, two outcomes, independence and a constant success probability.",
  test:"Check whether successes change later trials, whether p changes across trials or whether drawing without replacement invalidates independence.",
  reasoning:"Explain the number of trials n and how the success probability p was obtained; justify the trial and success definitions before calculating.",
  limit:"The bars give probabilities for a proposed count model, not observed frequencies. A fitted p does not by itself establish independence or an unchanged p."
 }),
 poisson:Object.freeze({
  lessonId:"poisson-models",definitions:["poisson-distribution","cumulative-probability","independent-events","expected-value"],
  condition:"Specify a fixed observation interval and check that events occur independently at a constant expected rate.",
  test:"Ask whether events cluster, whether the event rate changes with time or place, and whether any count limit contradicts unbounded Poisson support.",
  reasoning:"Define an event and its observation interval. Explain whether λ is assumed, estimated from observations or sourced, with its units as events per interval.",
  limit:"The displayed bars stop at a finite count, but the Poisson model continues indefinitely. The probability calculation includes the full theoretical tail; the chart alone cannot confirm a constant rate."
 }),
 uniform:Object.freeze({
  lessonId:"uniform-continuous-models",definitions:["continuous-uniform-distribution","probability-density","cumulative-probability","probability-distribution"],
  condition:"Justify the finite support [a,b] and the claim that equally wide subintervals have equal probability.",
  test:"A bounded measurement does not imply a uniform model. Check for mechanisms or actual observations favouring particular parts of the interval.",
  reasoning:"Define the continuous random variable and the two bounds with units. Explain why the proposed density is constant over [a,b].",
  limit:"Continuous uniform probability is area over an interval, not the density height or an exact-point probability; the real process may not distribute values uniformly."
 }),
 custom:Object.freeze({
  lessonId:"custom-discrete-models",definitions:["custom-discrete-distribution","discrete-random-variable","probability-distribution","expected-value"],
  condition:"Account for every possible numerical outcome, with distinct values, nonnegative probabilities and a total of one.",
  test:"Check how probabilities were assigned or estimated, whether any cases are missing or duplicated, and whether a small sample makes estimates unreliable.",
  reasoning:"Define what every numerical outcome represents (including negative or fractional values) and justify the probability entered for each outcome.",
  limit:"A custom discrete model is not a histogram or a frequency chart. It describes proposed probabilities, which must be justified against the real experiment or theory."
 })
});
export function distributionGuidance(state,raw){
 const q=analyzeDistribution(raw),d=q.draft,model=DISTRIBUTION_LEARNING[d.kind];
 const e=entryAt(state);
 const activeSaved=state?.distributionStudio?.figures?.find(f=>f.id===state?.distributionStudio?.activeId)||null;
 const linked=!!activeSaved&&!!e&&(e.distributionFigureId===activeSaved.id||
  e.figureRefs?.includes("distribution:"+activeSaved.id));
 const changedSinceSave=linked&&distributionInterpretationSignature(activeSaved.draft)!==
  distributionInterpretationSignature(d);
 const aim=distributionAim(state);
 // These are the real, existing Sparks; no separate student's "source" is invented.
 const sparks=presentationSparks(state,"distribution",d)
  .filter(x=>x.kind==="confirmed"||x.kind==="planned").slice(0,3);
 const symbol=trim(d.symbol,5)||"X",unit=trim(d.unit,75);
 const variable=d.kind==="binomial"?
  "What does "+symbol+" count as a success across "+(q.n??"n")+" trials?":
  d.kind==="poisson"?"What events does "+symbol+" count in the chosen fixed interval?":
  d.kind==="custom"?"What does each possible numerical value of "+symbol+" represent"+(unit?" in "+unit:"")+"?":
  "What continuous quantity does "+symbol+" measure"+(unit?" in "+unit:"")+"?";
 // A fixed-target What-if has its own two hypothetical cut-offs. They are
 // not the shaded event in the current figure until explicitly applied.
 const comparison=state?.distributionStudio?.whatIf?.active?
  compareDistributionWhatIf(state.distributionStudio):null;
 const exploringTarget=comparison?.ready&&comparison.changed&&comparison.comparison==="target"&&comparison.target?.ok;
 let event;
 if(d.mode==="none")event=exploringTarget?
  "You are exploring cut-offs for a fixed probability target. Compare requested and achieved coverage under each model. These events have not been applied to or shaded in your IA figure.":
  "No event is selected. Explain which part of the model is useful for your aim; a shaded probability is optional.";
 else if(!q.ready)event="Check the event and numeric boundaries before interpreting an area or count probability.";
 else event="For "+q.statement+", identify exactly which outcomes or measurements the selected region covers. Explain this probability in context, not just its decimal value."+
  (exploringTarget?" The What-if target cut-offs describe separate hypothetical events; your figure still shades the original event.":"");
 let particular;
 if(d.kind==="normal")particular=d.mode==="outside"?
  "Both tails are selected; do not interpret the middle interval as the event. For a continuous model, equality at one boundary contributes zero area.":
  d.mode==="none"?"The curve height is a density, not the probability at that exact value.":
  "The probability is the area under the curve, not the curve's height. For a continuous variable, a single exact value has zero probability.";
 else if(d.kind==="uniform")particular=d.mode==="none"?
  "Equal probability density is not the same as equal probability at every individual point: a point has zero area.":
  "The highlighted uniform-model area is its overlap with [a,b], divided by b−a; the density is zero beyond the support.";
 else if(d.kind==="poisson")particular=d.mode==="none"?
  "The Poisson count model has infinitely many possible counts; the visible bars cover a finite range.":
  "The selected model probability includes the complete Poisson tail even when its graph stops displaying extremely small bars. Check inclusive integer bounds.";
 else if(d.kind==="custom")particular=d.mode==="exact"?
  "One entered numerical outcome is highlighted. If that value is absent, its model probability is zero.":
  "The bars are plotted on an actual numerical axis, not as equally spaced categories. Selected outcomes are compared numerically with the event bounds.";
 else particular=d.mode==="outside"?
  "This includes both integer tails and excludes the counts strictly between your boundaries.":
  d.mode==="exact"?"Exactly one integer count is selected; do not mistake that bar for a cumulative probability.":
  d.mode==="none"?"Each bar is the probability of one integer count, not the number of recorded observations.":
  "Check the inclusive integer endpoints before describing the selected bars; P("+symbol+" ≤ k) includes the count k.";
 const origin=d.sourceKind==="primary"?
  "You selected parameters estimated from your own data. Identify the actual sample, its size, method and limitations. Estimated parameters are not proof of model suitability.":
  d.sourceKind==="secondary"?
  "You selected published parameters. Record the original publisher, population, date and reference; check whether the source defines the same variable and units.":
  d.sourceKind==="theoretical"?
  "You selected an assumed model. Give a mathematical or contextual reason for these assumptions; do not describe model parameters as measured observations.":
  "The parameter source is not yet confirmed. Determine whether you assumed, estimated or obtained the values from a publication before relying on the model.";
 const stage=changedSinceSave?
  "The current model inputs differ from the figure linked to this stage. Save your changes and revisit any written probability or interpretation before using it.":linked?
  "An editable figure is explicitly linked to this mathematical stage; your calculations, reasoning and interpretation must still be written by you.":
  activeSaved?"A saved editable figure exists, but it is not linked to the current mathematical stage. You can link it with Save & link below.":
  "Your current figure is not linked to a mathematical stage. Exporting does not automatically place it in your IA.";
 const conclusion=e?.status==="completed"&&truthy(e.result)?
  "This stage has a student-recorded result. Check that the probability, variable and assumptions here still agree with your written reasoning.":
  "This stage has no confirmed mathematical result recorded. A diagram does not mark the stage complete.";
 return Object.freeze({
  kind:d.kind,lessonId:model.lessonId,definitions:model.definitions.filter(id=>definitionById(id)),
  lessonTitle:lessonById(model.lessonId)?.title||"Probability workshop",
  aim,variable,event,particular,origin,condition:model.condition,test:model.test,
  reasoning:model.reasoning,limit:model.limit,stage,conclusion,sparks,
  hasEvent:!!q.statement,statement:q.statement,sourceKind:d.sourceKind,
  figureLinked:linked,ready:q.ready,issues:q.issues,
  claim:"A theoretical model alone cannot validate the distribution of observed data or justify a population-level claim.",
  next:"Would a defensible change in a parameter, event boundary, rate, support limit or assigned probability materially change the answer to your aim? Compare only if the mathematics serves your question."
 });
}
/** Recovers a small, specific mathematical obstacle. It is NOT a writing guide. */
export function distributionRecoveryCards(raw,spot="page"){
 const q=analyzeDistribution(raw),d=q.draft;
 const model=DISTRIBUTION_LEARNING[d.kind],sym=trim(d.symbol,5)||"X";
 const isInterpret=/reflect|interpretation|meaning|result|localTakeaway/i.test(spot);
 const isNext=/next|limitation|evaluate/i.test(spot);
 const isIntroduce=/introduce|purpose|bridge|method/i.test(spot);
 const mk=(id,label,question,action,check,stop,fallback,boundary)=>Object.freeze({
  id,label,question,action,check,stop,fallback,boundary
 });
 const assumptions=mk("distribution-assumptions",
  "I am not sure this "+d.kind+" model is suitable",
  d.kind==="binomial"?"Does "+sym+" really count successes from repeated trials with a fixed n and p?":
  d.kind==="normal"?"What evidence or process supports an approximately normal model for "+sym+"?":
  d.kind==="poisson"?"Are the events independent with a constant mean rate λ over a defined interval?":
  d.kind==="uniform"?"Why would every equal-width interval within [a,b] be equally likely?":
  "Have all distinct outcomes of "+sym+" been listed and assigned justified probabilities totalling one?",
  model.condition+" "+model.test,
  "Could one real feature of your process or dataset undermine a stated assumption?",
  "One assumption tested against your actual method or observed evidence.",
  "Try one defensible alternative model, or describe the limitation if it cannot be checked.",
  model.limit);
 const event=mk("distribution-event",
  isInterpret?"I calculated a probability but cannot explain it":"My boundaries or shading do not match the event",
  d.mode==="none"?"What event would help answer your actual mathematical question?":
    "Which outcomes of "+sym+" belong to this event"+(q.statement?" ("+q.statement+")":"")+"?",
  d.mode==="none"?"Name the event and determine whether left, right, between, outside or exact is appropriate.":
    (["binomial","poisson"].includes(d.kind)?"List the included integer counts and check inclusive endpoints. ":
    d.kind==="custom"?"List the entered outcome values satisfying the inequality. ":
    "Sketch the interval area before calculating; density height is not a probability. ")+
    "Compare this with the highlighted bars or region in your diagram.",
  "Does the shaded set correspond to the inequality and the same random variable?",
  "One correctly specified event and a verified calculation.",
  "Check a small example by hand or with a calculator, and review the relevant Maths Workshop lesson.",
  "This is a model-based probability, not a recorded frequency or a guarantee.");
 const method=mk("distribution-why",
  "I cannot justify choosing or defining this model",
  "What does "+sym+" represent, and where did the model parameters come from?",
  model.reasoning+" "+model.condition+" "+(d.sourceKind==="theoretical"?"Explain why an assumed model is useful for this question.":
  d.sourceKind==="primary"?"Identify the actual observations used to estimate parameters.":
  d.sourceKind==="secondary"?"Locate the original source and population definition.":
  "Identify whether the values are assumptions, estimates or published."),
  "Could another reader reproduce your choice of parameters and challenge its assumptions?",
  "A named variable, parameter origin and one testable model condition.",
  "Use the definition and worked lesson to verify the method, then describe the actual decisions you made.",
  "A calculated distribution is not evidence that the chosen model fits real data.");
 const follow=mk("distribution-follow",
  "I am unsure what to reflect on or investigate next",
  "Which modelling assumption or parameter might materially change the probability relevant to your aim?",
  "Identify a credible change to the model rate, support, probabilities or event boundary. Compare the effect using the same variable and units, and explain why the change is meaningful.",
  "Could that comparison change what your result supports?",
  "One honest mathematical sensitivity question or a justified decision to stop.",
  "If no meaningful comparison follows, document the limitation and return to your aim; extra mathematics is not compulsory.",
  "Do not present a hypothetical change as a second measured result.");
 if(isInterpret)return [event,assumptions,follow];
 if(isNext)return [follow,assumptions,event];
 if(isIntroduce)return [method,assumptions,event];
 return [event,assumptions,method];
}
/** Result-aware help for an explicitly selected, valid What-if comparison. */
export function distributionComparisonRecoveryCards(draft,q,aim=""){
 const guidance=distributionWhatIfReflection(q,draft,aim);
 if(!guidance)return [];
 const model=DISTRIBUTION_LEARNING[draft.kind];
 const fixed=q.comparison==="target";
 const mk=(id,label,question,action,check,stop,fallback,boundary)=>
  Object.freeze({id,label,question,action,check,stop,fallback,boundary});
 return [
  mk("distribution-whatif-meaning","I cannot explain the comparison",
   guidance.prompts[1].question,
   "Compare "+(fixed?"the two cut-offs and their achieved probabilities":"both probabilities for exactly the same event")+
    ". Keep the random variable and units consistent.",
   fixed?"Have I distinguished requested and achieved coverage?":"Did the event stay unchanged?",
   "One checked mathematical interpretation.",
   "If the difference has no bearing on the aim, explain why and stop.",
   guidance.caution),
  mk("distribution-whatif-assumptions","I cannot justify the alternative",
   guidance.prompts[0].question,
   model.condition+" Identify a plausible process or original source for the alternative. If several parameters changed, consider isolating them.",
   "Can I distinguish a hypothetical change from another measured value?",
   "One justified modelling assumption.",
   "Check the registered Maths Workshop lesson for the chosen distribution.",
   "A parameter scenario alone cannot establish model fit."),
  mk("distribution-whatif-relevance","I do not know whether this belongs in my IA",
   guidance.prompts[2].question,
   "Decide whether the comparison matters to the saved investigation aim. If useful, write your own interpretation in the existing IA Studio mathematical stage.",
   "Would excluding it meaningfully weaken my answer?",
   "One purposeful reflection or a reason not to include extra mathematics.",
   "Return to the existing mathematical writing stage rather than creating a new result.",
   "Do not record this proposed alternative as collected data.")
 ];
}
export function renderDistributionGuidance(state,icon,e){
 const g=distributionGuidance(state,state.distributionStudio?.draft);
 const defButtons=g.definitions.slice(0,3).map(id=>'<button type="button" class="btn btn-quiet btn-sm" data-action="resource-workshop" data-workshop-term="'+e(id)+'" data-resource-help="true">'+
 e(definitionById(id).title)+'</button>').join("");
 const sparkle=g.sparks.length?'<div class="distribution-reused-sparks"><strong>'+icon("sparkles")+' Earlier Sparks to reconsider</strong>'+
  '<ul>'+g.sparks.map(x=>'<li><b>'+e(x.title)+'</b> · '+e(x.detail)+'</li>').join("")+'</ul>'+
  '<small>Planned Sparks are not verified evidence.</small></div>':"";
 const text=(label,value)=>'<p><strong>'+label+'</strong> '+e(value)+'</p>';
 return '<section class="distribution-learning" data-distribution-learning aria-label="Probability model guidance for this investigation">'+
  '<div class="distribution-learning-head"><strong>'+icon("lightbulb")+' Using this model in my IA</strong>'+
  '<button type="button" class="btn btn-secondary btn-sm" data-studio-stuck="C31:page" aria-label="I am stuck with this probability distribution">I am stuck</button></div>'+
  '<div class="distribution-learning-actions"><button type="button" class="btn btn-secondary btn-sm" data-action="resource-workshop" data-workshop-id="'+e(g.lessonId)+'" data-resource-help="true">'+
  icon("book-open")+' Show me → Help me → My turn</button>'+
  '<details><summary>Definitions to check</summary><div class="distribution-definition-links">'+defButtons+'</div></details></div>'+
  '<details class="distribution-learning-write"><summary>Connect the mathematics to my IA writing</summary>'+
  (g.aim?text("Your saved aim:",g.aim):'<p>Check your saved aim before explaining why this calculation matters.</p>')+
  sparkle+
  text("Define the variable:",g.variable)+
  text("Introduce the model:",g.reasoning)+
  text("Explain the selected probability:",g.event)+
  text("What the diagram does not establish:",g.particular)+
  text("Parameter source:",g.origin)+
  text("Check the assumptions:",g.condition)+
  text("A mathematical limitation:",g.limit)+
  text("Where this figure belongs:",g.stage)+
  text("Your recorded mathematical work:",g.conclusion)+
  text("If further mathematics is worthwhile:",g.next)+
  '<p class="distribution-learning-caution">These are questions to guide your own explanation, not sentences to paste as an IA result. Workshop examples use fictional numbers.</p></details></section>';
}
