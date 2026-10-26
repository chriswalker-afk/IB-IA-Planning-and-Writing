/**
 * Examiner-feedback Pass 4 — AA HL editorial prompts, not a syllabus map.
 *
 * These are small, optional questions about meaningful mathematical depth.
 * AI SL/AA SL have their own audited topic catalogue; no AA HL technique is
 * automatically assigned, marked as on-syllabus, or given an IA score here.
 */
import {escapeHtml,icon as defaultIcon} from "../ui/primitives.js";
import {assessmentFramework} from "../essentials/assessment-cohorts.js";
import {methodFamilies} from "../completing/method-identity.js";

const str=x=>typeof x==="string"?x.trim():"";
export const isAaHl=state=>str(state?.planning?.fields?.course||state?.project?.course)==="AA HL";
const prompt=(name,first,depth)=>Object.freeze({name,first,depth});

const ROUTES=Object.freeze({
 statistics:Object.freeze([
  prompt("Describe the actual data", "Specify what was observed, how cases were selected and which quantities are being compared.", "Investigate the consequences of sampling, influential observations or measurement choices, using evidence rather than general warnings."),
  prompt("Check the chosen mathematical summary", "Use a graph or a justified model or test that addresses the question.", "Explain its assumptions, parameters and mathematical meaning; contrast a defensible alternative only if it could alter the inference."),
  prompt("Qualify the inference", "State exactly what the observed result can and cannot establish.", "Test a meaningful uncertainty or limitation and connect the consequence back to the original question.")
 ]),
 modelling:Object.freeze([
  prompt("Build a justified mathematical model", "Define variables, domain, parameters and constraints before fitting or solving.", "Derive or explain important relationships rather than treating a software fit as a conclusion."),
  prompt("Investigate a boundary or join", "If different rules are needed in different intervals, state each piece and its valid domain.", "Check the values at a join; require continuity or matching derivatives only when the model's purpose justifies them."),
  prompt("Challenge the result", "Compare a plausible alternative assumption, model or feasible boundary.", "Use genuine residuals, sensitivity or a clear mathematical argument to decide whether the conclusion is robust.")
 ]),
 theoretical:Object.freeze([
  prompt("State a precise conjecture", "Define the objects, assumptions and domain; examine one small or boundary case.", "Explain what a pattern would suggest and what it would take to establish a general result."),
  prompt("Prove or delimit the claim", "Write a logical argument with justified steps, or find a counterexample.", "Test the permitted cases, excluded values and any parameter conditions; examples alone do not prove a universal claim."),
  prompt("Develop a mathematical connection", "Compare two valid representations or derive a related result only if it advances your question.", "Explain why the approaches agree, when they differ and what the connection reveals.")
 ]),
 unsure:Object.freeze([
  prompt("Start with a mathematical question", "Identify one quantity, relationship, conjecture or practical decision to investigate.", "Show why the selected mathematics could answer it rather than adding advanced topics for their own sake."),
  prompt("Work through one tractable case", "Define your variables and verify one meaningful calculation, diagram or example.", "Extend, generalise or challenge the mathematics after you have established a genuine starting point."),
  prompt("Discuss course suitability", "Bring the mathematical question, a tentative method and one example to your teacher.", "Check that the depth and reasoning suit AA HL; neither a familiar topic nor a named HL technique guarantees suitability.")
 ])
});

export function aaHlExplorationPrompts(state){
 if(!isAaHl(state))return null;
 const kind=str(state?.planning?.fields?.kind);
 return Object.freeze({kind:Object.hasOwn(ROUTES,kind)?kind:"unsure",prompts:ROUTES[kind]||ROUTES.unsure});
}

export function renderAaHlPlanningAdvice(state,{icon=defaultIcon,e=escapeHtml,reduced=false}={}){
 const info=aaHlExplorationPrompts(state);
 if(!info)return "";
 return '<details class="math-catalog-more aa-hl-depth-guide'+(reduced?' is-reduced':'')+
  '" data-aa-hl-depth="planning"><summary>'+icon("book-open")+
   ' What makes my mathematics suitable for AA HL? (optional) '+icon("chevron-right")+'</summary>'+
  '<div class="math-catalog-more-body">'+
   '<p><strong>Depth comes from how you use the mathematics.</strong> A familiar technique, including one taught at SL, can be a worthwhile starting point when you develop an insightful, rigorous investigation. More advanced topics alone do not secure higher marks.</p>'+
   '<p>Possible investigative directions for your chosen type — not an official AA HL topic list:</p>'+
   '<ul class="math-validity-linked">'+info.prompts.map(item=>
    '<li><strong>'+e(item.name)+'</strong> '+e(item.first)+
     ' <span><b>Develop it:</b> '+e(item.depth)+'</span></li>').join("")+'</ul>'+
   '<p class="math-validity-honesty">These are prompts, not performed mathematics, a course-mapping tool or a teacher approval. Check mathematical appropriateness and depth for your actual AA HL course and assessment session with your teacher.</p>'+
  '</div></details>';
}

/** Reuse the already optional "How much should I explain?" disclosure.
 * Method identity comes only from the chosen technique, never from a title,
 * a prediction, a planned route or the result prose. */
export function aaHlStagePrompt(state,entry){
 if(!isAaHl(state)||!entry)return null;
 const families=methodFamilies(entry,{allowPlanned:true});
 let question="Can I justify the central mathematical steps, show what the result means for the aim, and challenge one important assumption or boundary?";
 if(families.has("proof")||families.has("algebra"))question=
  "Are the domain and hypotheses explicit? Have I justified the logical steps for every permitted case, including exceptions or counterexamples?";
 else if(families.has("piecewise-model"))question=
  "Have I defined every piece and join, justified any required continuity or smoothness, and examined what a genuine corner or jump means for the aim?";
 else if(families.has("optimisation")||families.has("fitted-model")||families.has("geometric-model")||families.has("voronoi"))question=
  "Can I derive or justify the representation, check its domain and constraints, and use a real comparison or mathematical argument to evaluate its validity?";
 else if(families.has("statistic")||families.has("pmcc")||families.has("spearman"))question=
  "Why do the chosen data and mathematical assumptions support this interpretation, and which uncertainty or sensitivity could change it?";
 const revised=assessmentFramework(state)==="revised2029";
 return Object.freeze({
  question,
  caution:revised?
   "This is mathematical-quality guidance, not an A–E Criterion E mark. For the 2029 assessment cohort, use the revised four criteria and your current subject guide.":
   "For the through-2028 A–E framework, appropriate sophistication, rigour, precision and demonstrated understanding matter; a method name cannot determine a Criterion E level."
 });
}

export function renderAaHlStagePrompt(state,entry,{e=escapeHtml}={}){
 const advice=aaHlStagePrompt(state,entry);
 if(!advice)return "";
 return '<div class="math-course-hl-context" data-aa-hl-depth="writing">'+
  '<strong>AA HL — show mathematical depth through your reasoning</strong>'+
  '<p>A familiar or SL-level starting point is not automatically unsuitable. Its mathematical development must be appropriate to the investigation and course.</p>'+
  '<p><b>Ask yourself:</b> '+e(advice.question)+'</p>'+
  '<p class="math-validity-honesty">'+e(advice.caution)+' Pathfinder does not verify syllabus status or mathematical correctness.</p>'+
  '</div>';
}
