/** Read-only, active-entry guidance for the repeatable mathematical journey.
 * Match *method identity*, verified stage status and the explicitly linked previous
 * record. Never infer a result from the investigation title, plans or prompts.
 */
import {methodFamilies,firstUnfamiliarUse} from "../completing/method-identity.js";
import {linkedAccuracy} from "../completing/evidence-links.js";

const nonempty=x=>typeof x==="string"?x.trim():"";
const snippet=x=>nonempty(x).replace(/\s+/g," ").slice(0,160);
const SLOT_IDS=new Set(["bridgeA","resultB","resultE","interpretD","nextC","nextD"]);
const confirmed=e=>e?.status==="completed"&&!!nonempty(e.result)&&e.reviewNeeded!=="yes";
const familyProfile=(entry,theoretical)=>{
 const f=methodFamilies(entry,{allowPlanned:true}),has=(...types)=>types.some(t=>f.has(t));
 if(has("proof","algebra")||(theoretical&&!f.size))return"theory";
 if(has("optimisation","geometric-model"))return"optimisation";
 if(has("voronoi","triangulation"))return"geometry";
 if(has("finance-compound","finance-break-even","finance-loan","finance-cashflow"))return"finance";
 if(has("binomial","probability","expected-value"))return"probability";
 if(has("pmcc","spearman","normal","two-sample-t","chi-independence","chi-fit"))return"statistics";
 if(has("fitted-model","linear-regression","quadratic-fit","exponential","sinusoidal","power","rates-from-data"))return"model";
 if(has("numerical-integration"))return"numerical";
 return"general";
};
const PROFILE_ADVICE=Object.freeze({
 theory:{
  B:"Use logical steps and mathematical notation to identify the objects, domain, hypotheses and conclusion of any argument. Make a counterexample readable as such.",
  E:"Justify why each implication holds under your stated conditions. Check special cases where helpful, but do not mistake numerical examples for a proof of a general claim.",
  D:"Explain exactly what your argument establishes, for which domain or assumptions, and whether a counterexample has changed an earlier conjecture."},
 optimisation:{
  B:"Define the objective function, its variables and feasible domain. Give units where meaningful, show the derivative or calculation and identify all relevant candidates.",
  E:"Check stationary points together with feasible boundaries or limiting cases. Explain why the selected candidate is a maximum or minimum in the model, not just a point with zero derivative.",
  D:"Explain what the optimum means in the stated feasible domain. If assumptions or constraints change, ask whether the optimum remains valid rather than claiming a universal best solution."},
 geometry:{
  B:"Label sites, lengths, angles or coordinates clearly. For a Voronoi construction, define the distance metric and the region boundaries; for surveying, show the measurements behind the geometry.",
  E:"Justify the geometric construction or calculation and confirm that the chosen metric, coordinate system and domain actually answer the intended question.",
  D:"Explain where the geometric conclusion applies: for example, straight-line nearness is not automatically journey time, and a measured angle or scale has uncertainty."},
 finance:{
  B:"Define each amount, rate and period with consistent units. State the compounding or repayment convention before presenting equations, tables or numerical comparisons.",
  E:"Use the correct financial model for its stated intervals and assumptions. Check computations against a meaningful case; a headline percentage alone does not establish an effective return.",
  D:"Explain how fees, changing rates, time intervals or assumptions could alter the mathematical decision, if those factors are important to your actual model."},
 probability:{
  B:"Define the event and sample space or random variable. Distinguish probability notation, expected value and simulated relative frequency with suitable labels and precision.",
  E:"Use a justified sample space or probability model. Keep an exact theoretical calculation distinct from an empirical simulation, and check fairness or independence assumptions when applicable.",
  D:"Interpret the actual probability or estimate carefully. Identify whether variation comes from simulation, sampling or the model assumptions rather than treating a short run as proof."},
 statistics:{
  B:"Label distributions and axes with variables, units, groups and denominators as appropriate. State the statistic, sample size and relevant accuracy so the comparison can be reconstructed.",
  E:"Check that the chosen statistic or test suits the variables, sampling design and assumptions. Explain what its value means; a coefficient or software p-value is not an explanation on its own.",
  D:"Discuss what the observed association, group difference or test result actually supports. Consider sample design, uncertainty and any relevant unusual observations; association is not causation."},
 model:{
  B:"Define the variables, model equation, parameters and domain. Present a properly labelled figure or table and distinguish original observations from fitted or predicted values.",
  E:"Show how parameters or mathematical steps were obtained and inspect an appropriate model check, such as residuals or a comparison in the observed domain. A software fit is not proof the model is universally valid.",
  D:"Interpret the actual fit or prediction within its tested domain. If the residual pattern, unusual points or model assumptions materially affect the answer, explain the consequence before changing methods."},
 numerical:{
  B:"State the approximation rule, interval, partition or step size and units, and distinguish exact expressions from rounded numerical estimates.",
  E:"Explain why the approximation applies and check the effect of an appropriate change in step size or method when accuracy matters to the aim.",
  D:"Explain what the numerical result establishes and how discretisation or approximation may restrict the precision of the conclusion."},
 general:{
  B:"Define relevant symbols and variables and show a mathematically readable sequence of real calculations, diagrams, tables or reasoning, with units and appropriate accuracy where needed.",
  E:"Justify the mathematical steps that carry the argument forward, check the outcome where possible and explain how the mathematics addresses the question.",
  D:"Explain what the genuine result changes about the aim, whether any important assumption restricts the claim, and what would be worthwhile to test next, if anything."}
});
export function laterMathsBadgeGuidance(state,ctx,key,base){
 const parts=key.split(":"),slot=parts[2];
 if(!["C40","C50"].includes(parts[1])||!SLOT_IDS.has(slot))return null;
 const entry=ctx.entry,record=Array.isArray(state.entries)?state.entries:[],
  prior=entry?.fromEntryId?record.find(x=>x?.id===entry.fromEntryId):null,
  priorOK=confirmed(prior),ok=confirmed(entry),
  style=PROFILE_ADVICE[familyProfile(entry,ctx.theoretical)];
 const out={...base,real:ok,details:[]};
 const add=(label,value)=>{const text=snippet(value);if(text&&out.details.length<3)out.details.push({label,text});};
 add("Your investigation aim",ctx.aim);
 add("Your stage question and chosen method",[entry?.title,entry?.technique].filter(nonempty).join(" · "));
 if(entry?.reviewNeeded==="yes")
  out.reminder="This mathematical stage is flagged for review after an earlier change. Recheck the underlying result in your IA before relying on it.";
 if(slot==="bridgeA"){
  if(priorOK){
   add("Linked previous confirmed finding",prior.localTakeaway||prior.interpretation||prior.result);
   out.strong="Connect this stage directly to the confirmed previous result and name the mathematical question it raises. Keep the link concise and move into the new mathematics; do not repeat the whole introduction.";
  }else{
   out.strong="Check the previous step in your actual IA and use only a genuine, verified finding to explain why this method follows. If Pathfinder does not contain that evidence, do not describe an earlier plan or an unverified note as established mathematics.";
   out.reminder="An earlier result is not currently confirmed and review-free in the linked record. The bubble does not certify the transition.";
  }
 }else if(slot==="resultB"){
  out.strong=style.B;
  if(ok){
   add("Your completed mathematical record",entry.localTakeaway||entry.result);
   const policies=linkedAccuracy(state,entry).filter(x=>nonempty(x.policy));
   if(policies.length)out.reminder="Apply the measurement or source precision rule already linked to this stage, where it affects your displayed result. Check the figures in your actual IA document.";
  }else out.reminder="The mathematical output is not yet confirmed as completed and review-free. These are presentation suggestions, not evidence that a figure or proof exists.";
 }else if(slot==="resultE"){
  out.strong=style.E;
  if(ok){
   add("Recorded completed result",entry.result);
   if(["outside","mixed"].includes(entry.knowledge))
    out.reminder=firstUnfamiliarUse(state,entry)?
     "Explain and reference the genuinely unfamiliar idea at first use, showing a meaningful step in your own reasoning. Advanced terminology alone does not establish sophistication.":
     "Use the previously explained unfamiliar mathematics accurately here without repeating a textbook-style tutorial.";
  }else{
   out.strong="First carry out and check the chosen mathematics in your actual IA. Then demonstrate why the real steps work and whether the mathematical result supports the question. A proposed technique or invented value cannot be used as Criterion E evidence.";
   out.reminder="This stage has no confirmed, review-free result. Completing a notes field does not establish mathematical understanding.";
  }
 }else if(slot==="interpretD"){
  if(ok){
   add("Mathematical finding to interpret",entry.localTakeaway||entry.result);
   out.strong=style.D+" Connect that implication to your actual investigation aim.";
  }else{
   out.strong="Only reflect on mathematics that has actually been carried out and checked. You can plan a possible interpretation, but it is not evidence of a finding. Return to Section 2 before making mathematical claims.";
   out.reminder="A planned or review-flagged stage is not a verified finding. Do not infer that your expected result occurred.";
  }
 }else if(slot==="nextC"||slot==="nextD"){
  if(ok){
   add("Finding informing the next decision",entry.localTakeaway||entry.interpretation||entry.result);
   if(slot==="nextC")out.strong="Use the actual finding to decide independently whether a new question, mathematical perspective or useful validation is worth pursuing. Say why this choice matters to the aim; concluding can also be the right decision.";
   else out.strong="Explain which consequence, unresolved mathematical issue or genuine limitation from the completed result a new method could address. If the aim is sufficiently answered, explain the mathematical reason for stopping instead.";
  }else{
   out.strong="Complete and verify the current mathematical result first. You may note a provisional question, but do not claim that an unperformed method produced evidence or that another technique is required.";
   out.reminder="A next stage must follow a genuine finding. Choosing to conclude does not require manufacturing an extra mathematical question.";
  }
 }
 return out;
}
