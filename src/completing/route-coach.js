/** Result-led mathematical decision support, never a mandatory technique checklist.
 * All strong branches require a student-confirmed observation/result, not keyword
 * matching of a prediction or numbers parsed from an IA draft.
 */
import {methodFamilies} from "./method-identity.js";
import {EXTENDED_SIGNALS,extendedFamily,extendedAdvice} from "./extended-routes.js";

const options={
 pmcc:[
  {value:"meaningful-linear",title:"The coefficient suggests linear association",desc:"Its sign and size are useful for my question"},
  {value:"weak-linear",title:"Little convincing linear association",desc:"The graph might still have another shape"},
  {value:"uncertain",title:"I'm not sure how to interpret r",desc:"Review the scatter and units before deciding"}
 ],
 model:[
  {value:"fit-sensible",title:"The model looks suitable in the observed range",desc:"I still need to interpret parameters and check limitations"},
  {value:"poor-fit",title:"The fit or residuals show a problem",desc:"A pattern, changing spread or inaccurate predictions"},
  {value:"outlier-effect",title:"One point seems to influence the fit",desc:"I need an honest sensitivity check"},
  {value:"uncertain",title:"I haven't assessed the fit yet",desc:"Interpret the model and make a suitable check"}
 ],
 optimisation:[
  {value:"checked-optimum",title:"The optimum meets the actual constraints",desc:"I checked boundaries and other feasible candidates"},
  {value:"unchecked-stationary",title:"I've only found a stationary point",desc:"I still need to check endpoints or whether it is best"},
  {value:"not-feasible",title:"The answer breaks a constraint",desc:"It cannot yet be my recommended design"},
  {value:"uncertain",title:"I'm not sure it's the best feasible value",desc:"I need to test it against the model and constraints"}
 ],
 proof:[
  {value:"pattern-only",title:"I have a pattern from examples",desc:"Promising evidence, not yet a general proof"},
  {value:"proof-established",title:"I have a general mathematical argument",desc:"I can explain why it holds on the stated domain"},
  {value:"counterexample",title:"I found a counterexample",desc:"My original conjecture needs revising"},
  {value:"uncertain",title:"I'm not sure what I have established",desc:"Check cases, logic and any hidden assumptions"}
 ]
};
export const RESULT_SIGNALS=Object.freeze(Object.fromEntries(
 [...Object.entries(options),...Object.entries(EXTENDED_SIGNALS)].map(([key,value])=>[key,Object.freeze(value.map(x=>Object.freeze(x)))])));
export const ALL_RESULT_SIGNALS=Object.freeze(new Set(
 Object.values(RESULT_SIGNALS).flat().map(x=>x.value)));

const isReal=e=>e?.status==="completed"&&!!String(e.result||"").trim();
const str=x=>typeof x==="string"?x.trim():"";
export function resultFamily(entry){
 if(!isReal(entry))return "";
 const methods=methodFamilies(entry);
 const extended=extendedFamily(methods);
 if(extended)return extended;
 if(methods.has("pmcc"))return "pmcc";
 if(methods.has("optimisation"))return "optimisation";
 if(methods.has("fitted-model"))return "model";
 if(methods.has("proof")||entry?.kind==="theory")return "proof";
 return "";
}
export const resultSignalOptions=entry=>RESULT_SIGNALS[resultFamily(entry)]||[];
export const isAdviceReduced=state=>state?.ui?.adviceMode==="reduced";

const a=(heading,essential,detail="",questions=[])=>({heading,essential,detail,questions});
function ancestralScatter(state,entry){
 let cursor=entry,steps=0;const visited=new Set();
 while(cursor&&steps++<120&&!visited.has(cursor.id)){
  visited.add(cursor.id);
  if(cursor.kind==="scatter")return cursor;
  cursor=state.entries?.find(x=>x.id===cursor.fromEntryId);
 }
 return null;
}
function chosenShape(state,entry){
 const c=state.completion||{},f=c.fields||{};
 const scatter=entry?.kind==="scatter"?entry:null;
 const relevant=scatter&&c.scatterPatternForEntryId===scatter.id;
 const detail=relevant&&c.scatterDetailForEntryId===scatter.id?f.scatterDetail:"";
 const pattern=relevant?f.scatterPattern:"";
 const observed=pattern||entry?.observation||"";
 const effective=detail==="turning"?"turning":detail==="monotonic"?"monotonic":
  detail==="unexpected"?"unexpected":detail==="unclear"?"unclear":detail==="periodic"?"periodic":observed;
 return effective;
}
export function routeAdvice(state,entry,{shapeEntry}={}){
 if(!isReal(entry))return null;
 const f=state?.completion?.fields||{};
 const confirmed=entry.resultSignal;
 const method=resultFamily(entry);
 const shape=chosenShape(state,shapeEntry||ancestralScatter(state,entry)||entry);
 if(EXTENDED_SIGNALS[method])return extendedAdvice(state,entry,{family:method,methods:methodFamilies(entry),signal:confirmed});
 if(entry.kind==="scatter"&&!method){
  switch(shape){
   case "linear":case "near-perfect":case "rough-linear":
    return a("A roughly straight pattern",
     "Describe the direction, spread and units before deciding whether Pearson's r would answer your aim.",
     "Pearson's r is optional. It quantifies LINEAR association, not a causal effect. A fitted line needs a separate predictive purpose.",
     ["Would a measure of linear association help answer my question?",
      "Would a line be useful for estimating a quantity in the observed range?"]);
   case "periodic":
    return a("A possible repeating pattern","Check that several cycles really occur before assuming periodicity.",
     "Estimate period, amplitude and midline from observations before choosing a justified sinusoidal model; check its domain.",
     ["Do repeated cycles justify a periodic model?","What would a fitted period mean in context?"]);
   case "curved":case "monotonic":case "turning":
    return a("A curved pattern",
     "Do not use a straight-line coefficient or regression as the default next step.",
     shape==="turning"?"A turning or periodic curve is not necessarily monotonic; rank correlation does not solve that. Consider a mathematical model only when its shape and parameters have a reason.":
      "Check whether the curve changes direction or remains monotonic. Compare justified function shapes and their domains, rather than trying models at random.",
     ["What type of curvature is visible, and could a justified function explain it?",
      "Is describing the shape sufficient to answer the original aim?"]);
   case "unclear":
    return a("No clear pattern",
     "A weak or inconclusive finding is a valid outcome; do not force a regression or change the data to manufacture a trend.",
     "Consider range, sample size, variability and accuracy. Explain what the evidence does and does not support before choosing any further mathematics.",
     ["Can I draw an honest, limited conclusion from this evidence?",
      "Is there a specific weakness in the data worth checking?"]);
   case "unexpected":
    return a("An unusual observation",
     "Check its source, units or definition. Keep authentic data; never remove a point just to improve a fitted result.",
     "If you later fit a model, comparing results with and without the point can describe its influence, but is not evidence that exclusion is justified.",
     ["Is the unusual observation genuine or a verifiable recording error?",
      "Would a justified sensitivity comparison change the answer?"]);
   default:
    return a("Look at the actual graph",
     "Choose what the points really show: roughly straight, curved, unclear or unusual.",
     "Your observation should lead to the next mathematical question, not the method you originally expected.");
  }
 }
 if(method==="pmcc"){
  const initial="Interpret the sign and strength of Pearson's r for your actual variables. Check it against the scatter; correlation is not causation.";
  if(confirmed==="weak-linear"){
   if(["curved","monotonic","turning"].includes(shape))
    return a("Weak linear association; curved graph",initial,
     "A small |r| does NOT rule out nonlinear structure. Say what the graph shows, then consider a justified model of its shape, or stop if more work would not help.",
     ["Does the curve suggest a mathematical model worth evaluating?",
      "Can I make a defensible conclusion without another calculation?"]);
   if(shape==="unclear")return a("Weak linear association; no clear pattern",initial,
    "Do not claim independence or that no relationship can exist. An appropriately limited conclusion may be better than more calculations.",
    ["Can I conclude cautiously without inventing a new model?","What known feature of the data could explain the uncertainty?"]);
   return a("Weak linear association",initial,
    "A weak linear coefficient is not evidence that every relationship is absent. Inspect the actual plot before choosing a model.",
    ["Could the plot show curvature or a meaningful unusual point?","Is a limited conclusion enough?"]);
  }
  if(confirmed==="meaningful-linear")return a("A meaningful Pearson coefficient",initial,
   "If the plot is also approximately straight and your aim needs an estimate, a regression line may be useful. A large |r| alone does not justify predictions.",
   ["Would a fitted line provide a useful prediction for this aim?","Does the coefficient already answer the question?"]);
  return a("What does the coefficient tell you?",initial,
   "Choose whether the calculated result really suggests a meaningful LINEAR association or a weak one. Do not infer shape solely from r.",
   ["What would change my mathematical conclusion about this association?"]);
 }
 if(method==="model"){
  const linear=methodFamilies(entry).has("linear-regression");
  const core=linear?
   "Explain the gradient using output-units per input-unit. Decide whether the intercept is meaningful in your actual domain. Check residuals and the fitted range.":
   "Interpret the model's parameters in context, then check residuals, assumptions and the range where predictions make sense.";
  if(confirmed==="poor-fit")return a("The fitted model may be inadequate",core,
    "A systematic residual pattern or inaccurate prediction is evidence to reconsider the model, not proof that one particular alternative is correct.",
    ["Which feature of the residuals challenges this model?",
     "Would a better-justified model or narrower range answer the aim more reliably?"]);
  if(confirmed==="outlier-effect")return a("An influential observation",core,
    "Compare fits with and without the point only as a labelled sensitivity check. Investigate its provenance; do not silently exclude genuine data.",
    ["How much does the model change because of this observation?","Is its removal independently defensible?"]);
  if(confirmed==="fit-sensible")return a("A plausible fitted model",core,
    "Good agreement inside the sample does not establish predictive accuracy, causation or reliable extrapolation.",
    ["Does the fitted model answer my original question within its valid range?",
     "Would any further calculation change the interpretation?"]);
  return a(linear?"Interpret your line of best fit":"Interpret your fitted model",core,
   "A strong fit statistic alone is not a full model evaluation. Record what the coefficients mean and whether the observed points support the model.",
   ["Are the parameters and predictions meaningful in the intended context?"]);
 }
 if(method==="optimisation"){
  const core="A stationary point is only a candidate optimum. Check endpoints, constraints, other candidates and the units of your recommendation.";
  if(confirmed==="not-feasible")return a("The proposed optimum is not feasible",core,
   "Reconsider the allowed domain or the assumptions of the model; do not recommend dimensions or values that violate real restrictions.",
   ["Which constraint rules this solution out?","What feasible alternative minimises/maximises the objective?"]);
  if(confirmed==="unchecked-stationary")return a("A stationary point is not yet an optimum",core,
   "A derivative of zero alone does not show a global maximum/minimum, especially on a restricted interval.",
   ["Are the endpoints or any other feasible candidates better?"]);
  if(confirmed==="checked-optimum")return a("An optimum that respects the constraints",core,
   "Explain the optimum in the original quantities and assess which model assumption could affect its practicality.",
   ["How much does the optimum change if a realistic assumption is adjusted?","Is the mathematical recommendation usable?"]);
  return a("Check the mathematical optimum",core,
   "Only claim an optimum once its type, bounds and feasibility have been established.",
   ["Have I established the best feasible value, or only a stationary point?"]);
 }
 if(method==="proof"){
  const core="Checking several cases suggests a conjecture, but cannot prove a claim for every permitted value.";
  if(confirmed==="counterexample")return a("A useful counterexample",core,
   "One valid counterexample disproves a universal statement. Refine the claim or its domain rather than hiding the failed case.",
   ["What precisely must change in the conjecture?","Can I prove the revised statement?"]);
  if(confirmed==="proof-established")return a("A general proof", 
   "Show the key logical argument and state the precise domain or assumptions under which it holds.",
   "A numerical check may illustrate the proof but is not its justification. A generalisation should follow from the proved structure, not be added for complexity.",
   ["Does the argument suggest a useful extension or restricted case?","Have I fully answered the original question?"]);
  if(confirmed==="pattern-only")return a("A conjecture, not yet a proof",core,
   "Try an algebraic argument, induction, an invariant or a counterexample as appropriate. State the conditions of your claim.",
   ["Can I prove this for every allowed value?","Could a counterexample reveal a missing condition?"]);
  return a("What have you actually established?",core,
   "Select whether you have numerical evidence, a general proof or a counterexample before deciding what follows.",
   ["Can I justify the claim in general?"]);
 }
 return null;
}
/** A rule-based set of questions, not automatic prescriptions or computed results. */
export function routeNextQuestions(state,entry){
 const item=routeAdvice(state,entry);
 return item?.questions||[];
}
