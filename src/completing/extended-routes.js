/**
 * Course-sensitive extensions to the existing result-led IA coach.
 * A selected method is a context; student-chosen findings drive each branch.
 * No formula, topic, predicted mark, or extra technique is prescribed.
 */
import {methodFamilies} from "./method-identity.js";

const options={
 "finance-break-even":[
  {value:"break-even-found",title:"I calculated a break-even quantity",desc:"I need to test whether it is achievable"},
  {value:"break-even-unrealistic",title:"Break-even sales look unrealistic",desc:"Capacity or demand may be insufficient"},
  {value:"demand-uncertain",title:"I cannot justify the sales forecast",desc:"My assumptions need ranges or evidence"},
  {value:"cost-sensitive",title:"Small cost/price changes alter viability",desc:"I should investigate sensitivity"}],
 "finance-compound":[
  {value:"compound-value",title:"I have calculated a compound value",desc:"One result does not yet explain the financial decision"},
  {value:"rate-period-mismatch",title:"Interest and payment periods differ",desc:"I need consistent effective rates and times"},
  {value:"rate-sensitive",title:"The final amount changes greatly with the rate",desc:"Compare plausible assumptions"},
  {value:"financing-needed",title:"This amount affects how much I must borrow",desc:"Connect investment growth to cash flow or repayments"}],
 "finance-loan":[
  {value:"repayment-affordable",title:"Repayments seem affordable",desc:"Test against forecast cash, not just profit"},
  {value:"repayment-unaffordable",title:"Repayments exceed available cash",desc:"Compare a feasible alternative"},
  {value:"longer-loan-cost",title:"Longer term reduces payments but raises cost",desc:"Quantify the trade-off"},
  {value:"loan-assumptions",title:"The rate or repayment assumption is uncertain",desc:"Check compounding frequency and sensitivity"}],
 "finance-cashflow":[
  {value:"cash-surplus",title:"Forecast cash remains positive",desc:"Check how robust the prediction is"},
  {value:"cash-shortfall",title:"Profit is positive, but cash runs short",desc:"Timing of payments changes the decision"},
  {value:"sales-sensitive",title:"Viability depends strongly on sales",desc:"Find a defensible threshold or range"},
  {value:"forecast-unreliable",title:"The input forecasts are weak",desc:"State what the model cannot justify"}],
 voronoi:[
  {value:"nearest-cells",title:"I have identified nearest-service regions",desc:"Distance is straight-line under this model"},
  {value:"unequal-cells",title:"Some cells cover much larger areas",desc:"Area does not directly measure demand"},
  {value:"poor-coverage",title:"Some locations are badly served",desc:"I need a measurable accessibility objective"},
  {value:"new-site",title:"I want to choose a new facility location",desc:"Define what best means before choosing"},
  {value:"distance-issue",title:"Roads or barriers undermine the diagram",desc:"The distance metric may need revising"}],
 "nonlinear-association":[
  {value:"monotonic-evidence",title:"The association appears monotonic",desc:"Rank association may be meaningful"},
  {value:"turning-pattern",title:"The graph turns or reverses",desc:"A rank coefficient may conceal structure"},
  {value:"weak-rank",title:"Rank association is weak or unclear",desc:"Do not force a relation"},
  {value:"rank-uncertain",title:"I am unsure what this coefficient means",desc:"Interpret direction, ranks and context"}],
 "nonlinear-model":[
  {value:"model-fit",title:"The fitted curve describes the observed range",desc:"I still need to explain its parameters"},
  {value:"residual-structure",title:"Residuals reveal a systematic pattern",desc:"The model may miss important behaviour"},
  {value:"competing-models",title:"Different models seem similarly plausible",desc:"Compare assumptions and meaning"},
  {value:"extrapolation-fails",title:"Predictions become unrealistic outside the data",desc:"Limit the domain or revise assumptions"}],
 "categorical-test":[
  {value:"expected-too-small",title:"Some expected frequencies are too small",desc:"Test conditions may not be met"},
  {value:"evidence-against",title:"The test gives evidence against independence",desc:"Interpret association without causation"},
  {value:"insufficient-evidence",title:"The test does not reject independence",desc:"This does not prove independence"},
  {value:"sampling-question",title:"Sampling or categories could distort the result",desc:"Reconsider validity before generalising"}],
 "expected-value":[
  {value:"positive-expectation",title:"The expected return is positive",desc:"Single attempts can still lose"},
  {value:"approximately-fair",title:"The game or decision is near fair",desc:"Check how fair was defined and costs"},
  {value:"large-variation",title:"The outcomes vary greatly",desc:"Compare risk as well as averages"},
  {value:"probabilities-weak",title:"The probabilities or independence assumptions are doubtful",desc:"The model needs better justification"}],
 measurement:[
  {value:"measurements-agree",title:"My repeated estimates agree reasonably",desc:"Quantify accuracy, not merely agreement"},
  {value:"angle-sensitive",title:"Small angle errors change the answer greatly",desc:"The geometry is poorly conditioned"},
  {value:"methods-disagree",title:"Two methods give different estimates",desc:"Investigate assumptions and accuracy"},
  {value:"measurement-geometry",title:"Baseline or angle assumptions are questionable",desc:"Reconsider how the model was measured"}]
};
export const EXTENDED_SIGNALS=Object.freeze(Object.fromEntries(
 Object.entries(options).map(([k,v])=>[k,Object.freeze(v.map(x=>Object.freeze(x)))])));

export function extendedFamily(methods){
 if(!methods?.size)return "";
 for(const id of ["finance-break-even","finance-compound","finance-loan","finance-cashflow","voronoi"]){
  if(methods.has(id))return id;
 }
 if(methods.has("spearman"))return "nonlinear-association";
 if(["quadratic-fit","exponential","sinusoidal","power"].some(x=>methods.has(x)))return "nonlinear-model";
 if(methods.has("chi-independence")||methods.has("chi-fit"))return "categorical-test";
 if(methods.has("expected-value"))return "expected-value";
 if(methods.has("triangulation"))return "measurement";
 return "";
}
const a=(heading,essential,detail,questions,depth="")=>({heading,essential,detail,questions,depth});
const course=state=>state?.planning?.fields?.course||state?.project?.course||"";
const financialDepth=state=>{
 const level=course(state);
 const caveat=level==="AA HL"?" For AA HL, check that the mathematical development is sufficiently demanding for your course; routine finance formulas alone are unlikely to suffice.":
  level==="AA SL"?" For AA SL, check that the chosen financial mathematics is appropriate to your course and scope.":
  level==="AI SL"?" Compound-interest and repayment mathematics can be relevant to AI SL, but their presence alone is not enough to demonstrate a developed exploration.":
  " Confirm the mathematical scope against your actual course with your teacher.";
 return "One substitution into a financial formula is a starting result, not a developed investigation. Build or explain a model, investigate a meaningful changing quantity, test assumptions and evaluate the business decision."+caveat;
};
const voronoiDepth="Software constructing cells or computing their areas is a starting representation. Develop a mathematical comparison using defined distances, feasible candidate sites or a justified optimisation objective.";
const nonlinearDepth="A technology-generated equation or high R² alone is not sustained mathematical reasoning. Justify the form, explain parameters and assumptions, inspect residuals and compare only relevant alternatives.";
const testDepth="Computing a statistic and p-value alone is a first step. Show expected-frequency reasoning, assumptions, interpretation and how the evidence addresses the actual question.";
const probDepth="A substituted expected value is a starting calculation. Explain the distribution and assumptions, then compare a meaningful decision, risk or sensitivity when justified.";
const measurementDepth="A single trigonometric substitution is not the full investigation. Investigate how choices of geometry, baseline or angular uncertainty affect the estimated quantity.";

function nonlinearParameters(methods){
 if(methods.has("exponential"))return "Interpret the growth/decay factor per actual time step, rate units and any assumed baseline; check whether a compound-growth process is plausible.";
 if(methods.has("sinusoidal"))return "Interpret the period, amplitude and midline in units, and check that the data cover enough cycles to support periodicity.";
 if(methods.has("quadratic-fit"))return "Interpret the turning point only if its coordinates have a meaningful and observed-domain interpretation.";
 if(methods.has("power"))return "Check positivity/domain requirements, units and any transformations before interpreting the power exponent.";
 return "Interpret the fitted parameters in context and within the observed domain.";
}
export function extendedAdvice(state,entry,{family,methods,signal}={}){
 const legacy=family==="nonlinear-model"?{"poor-fit":"residual-structure","fit-sensible":"model-fit",
  "outlier-effect":"outlier-effect","uncertain":""}[signal]:undefined;
 const selected=EXTENDED_SIGNALS[family]?.some(x=>x.value===signal)?signal:(legacy||"");
 switch(family){
 case "finance-break-even":{
  const essential="A break-even quantity answers when revenue equals modelled costs—not whether there is enough demand, capacity or cash. Define fixed/variable costs, units and realistic sales assumptions.";
  const variant=selected==="break-even-unrealistic"?["Break-even looks unattainable","Investigate which justified price, variable-cost or capacity assumption could change the threshold; do not invent demand.",["Which constraint prevents reaching break-even?","Can a realistic revised model give a feasible decision?"]]:
   selected==="demand-uncertain"?["Demand is uncertain","Model a defensible sales range or scenarios and find the sales threshold below which costs are not recovered.",["How does profit vary over credible sales scenarios?","What evidence is needed for a demand estimate?"]]:
   selected==="cost-sensitive"?["Costs or pricing change viability","Calculate how a changed price or variable cost affects the break-even threshold, keeping sales response and capacity assumptions explicit.",["How robust is the decision to plausible costs or prices?","Would modelling price-dependent demand improve the question?"]]:
   ["Break-even is the beginning","Compare the required whole-unit sales with credible demand and capacity; consider startup finance or time-dependent cash flow only if relevant.",["Does this quantity fit capacity and demand?","Would financing or cash-flow timing change the decision?"]];
  return a(variant[0],essential,variant[1],variant[2],financialDepth(state));
 }
 case "finance-compound":{
  const essential="Match the interest rate to the compounding period and the time variable. Interpret what the amount represents, not just the number produced by the formula.";
  const variant=selected==="rate-period-mismatch"?["Check effective rates and periods","A nominal annual rate, an effective annual rate and a monthly rate cannot be substituted interchangeably. Justify any conversion.",["What effective rate corresponds to the payment period?","How does the corrected rate alter the result?"]]:
   selected==="rate-sensitive"?["Compound growth is sensitive to assumptions","Compare plausible rates or times; an assumed growth rate is not a guaranteed forecast.",["How rapidly do outcomes diverge under plausible rates?","What changes in the financial decision?"]]:
   selected==="financing-needed"?["Connect compound growth to actual financing","If the project requires borrowing, a lump-sum future-value calculation does not describe an amortising loan. Investigate repayments or a balance recurrence.",["What balance or repayment model does the borrowing actually require?","Can forecast cash support those payments?"]]:
   ["After the compound-interest calculation","Explain the accumulated change over time or derive/compare a geometric growth relationship; connect it to the actual decision.",["Does changing the horizon or rate affect feasibility?","Does the decision involve recurring deposits or repayments instead?"]];
  return a(variant[0],essential,variant[1],variant[2],financialDepth(state));
 }
 case "finance-loan":{
  const essential="A loan is a changing outstanding balance, not just a single compound-interest future value. Match repayment timing and periodic interest, and distinguish payment size from total interest paid.";
  const variant=selected==="repayment-unaffordable"?["Repayments exceed available cash","Compare alternative loan terms, amounts or business assumptions; a smaller instalment may increase total interest.",["What loan terms could be feasible without hiding extra costs?","Does the business still have enough cash each period?"]]:
   selected==="longer-loan-cost"?["A repayment trade-off","Quantify both periodic repayment and total paid; explain mathematically why spreading repayments changes the cost.",["Can you derive or use a balance recurrence to explain the difference?","Which term offers an acceptable trade-off?"]]:
   selected==="loan-assumptions"?["Interest assumptions matter","Test rate/frequency changes in the amortisation or balance recurrence, rather than using a lump-sum compound formula uncritically.",["How sensitive is total cost to the effective periodic rate?","What does an alternative repayment frequency change?"]]:
   ["Affordable repayments need a cash-flow check","Loan affordability depends on the timing of cash available to pay, not only expected accounting profit.",["Can the forecast cover repayments in every relevant period?","What is the total financing cost over the term?"]];
  return a(variant[0],essential,variant[1],variant[2],financialDepth(state));
 }
 case "finance-cashflow":{
  const essential="Profit and cash balance are different. State when startup spending, sales receipts, running costs and loan repayments actually occur.";
  const variant=selected==="cash-shortfall"?["Profitable does not mean liquid","Locate the period when the cash balance becomes negative and test whether timing, borrowing or assumptions can change the outcome.",["When does cumulative cash first become insufficient?","Which realistic adjustment could avoid the shortfall?"]]:
   selected==="sales-sensitive"?["The forecast depends on sales","Use plausible scenarios or a threshold analysis; avoid treating a single forecast as a measured fact.",["At what sales level does cash become inadequate?","Does a realistic change in demand reverse the conclusion?"]]:
   selected==="forecast-unreliable"?["Uncertain forecasts limit the claim","Separate measured costs from assumptions, then report a range of outcomes instead of false precision.",["Which assumption has the largest effect on viability?","What evidence would support a more defensible estimate?"]]:
   ["Cash stays positive in the base scenario","Check the lowest monthly cash balance and test whether a realistic adverse scenario changes that conclusion.",["How robust is the cash reserve to lower sales or higher costs?","Does this answer the original business question?"]];
  return a(variant[0],essential,variant[1],variant[2],financialDepth(state));
 }
 case "voronoi":{
  const essential="A Voronoi diagram identifies the nearest site using the chosen distance metric. It does not automatically identify the best facility, its demand, or the best place for a new site.";
  const variant=selected==="unequal-cells"?["Unequal service areas","Cell area is not the same as number of customers. Consider where people are located and whether capacity matters.",["Would weighting by population change the comparison?","Does a large cell correspond to an underserved population?"]]:
   selected==="poor-coverage"?["Access looks uneven","Define how access is measured: maximum nearest-site distance, mean weighted distance or another objective. Different objectives give different locations.",["What quantity should be minimised to improve access?","How could candidate sites be compared on that quantity?"]]:
   selected==="new-site"?["Choose the objective before the site","Maximising distance from existing sites is NOT automatically equivalent to minimising users' travel. Define feasible candidate locations and an objective first.",["What would best mean mathematically for these users?","How will the new site change distances or coverage?"]]:
   selected==="distance-issue"?["Euclidean distance may not reflect travel","Straight-line cells can misrepresent roads, rivers or restricted access. Test examples where the metric changes which facility is closest.",["Which actual locations change service area under a travel-based metric?","How much does the recommended site depend on this assumption?"]]:
   ["Interpret nearest-service regions","Relate the cell boundaries and sites to the question. A diagram alone cannot tell you demand or optimal location.",["What comparison would turn this diagram into an answer?","Is a realistic alternative distance metric necessary?"]];
  return a(variant[0],essential,variant[1],variant[2],voronoiDepth);
 }
 case "nonlinear-association":{
  const essential="Spearman's coefficient measures rank-based monotonic association, not which nonlinear equation fits. Examine the actual scatter and check whether the pattern reverses direction.";
  const variant=selected==="turning-pattern"?["A turning pattern is not monotonic","One rank coefficient can conceal increasing-then-decreasing structure. Consider the shape or a justified function, not another automatic correlation.",["Where does direction change?","Would a meaningful turning-point model better address the aim?"]]:
   selected==="weak-rank"?["A weak rank coefficient","Do not claim independence or absence of all relationships. Check sample size, ties, range and observed shape.",["Does the data justify a limited conclusion?","Is there an interpretable alternative rather than a search for a positive result?"]]:
   selected==="rank-uncertain"?["Interpret the rank coefficient","Explain sign, magnitude, ties and why ranks suit the actual variables; check course suitability.",["What does monotonic association mean for this aim?"]]:
   ["Monotonic association needs interpretation","Interpret the rank relationship; if prediction is needed, select and test a functional model separately.",["Is strength of association enough to answer the aim?","Could a justified curve provide meaningful predictions?"]];
  return a(variant[0],essential,variant[1],variant[2],nonlinearDepth);
 }
 case "nonlinear-model":{
  const core=nonlinearParameters(methods);
  const essential="Interpret the actual model parameters and domain in context. Examine residuals and assumptions; a high R² or attractive graph alone does not validate a nonlinear model. "+core;
  const variant=selected==="model-fit"?["A plausible nonlinear model","The curve is a candidate description within the measured range, not a guarantee of prediction. Explain parameter meaning, assumptions and what the residuals show.",["Does it answer the aim within its justified domain?","Would any further calculation improve the conclusion?"]]:
   selected==="outlier-effect"?["One point influences the nonlinear fit","A point may change fitted parameters substantially. Verify its source and compare models with and without it as a labelled sensitivity check; do not discard genuine observations to improve fit.",["How sensitive are the parameters to this observation?","Is exclusion defensible independently of the desired model?"]]:
   selected==="residual-structure"?["Residuals challenge the proposed curve","A systematic residual pattern suggests missing structure or changing variability. Reconsider the model for a mathematical reason.",["What pattern remains unexplained?","Would a justified alternative or narrower range resolve it?"]]:
   selected==="competing-models"?["Choosing between defensible models","Compare residuals, plausible parameter meanings, assumptions and domain—not only the largest R².",["Which model provides the more meaningful answer?","How robust is that choice to the data range?"]]:
   selected==="extrapolation-fails"?["Do not extend an unsupported model","Restrict predictions to a justified domain; investigate asymptotes, turning behaviour, saturation or parameter assumptions where relevant.",["Why does the extrapolation fail mathematically?","What can the model reliably answer within the observed range?"]]:
   ["A curve is a model, not an explanation by itself","Explain why this functional form was chosen and what each parameter means; compare a justified model check rather than collecting equations.",["Do residuals support the functional form?","Would further mathematics materially improve the answer?"]];
  return a(variant[0],essential,variant[1],variant[2],nonlinearDepth);
 }
 case "categorical-test":{
  const isFit=methods.has("chi-fit");
  const essential=(isFit?
   "For a goodness-of-fit test, state the proposed distribution, expected counts, conditions and what the statistic and p-value allow you to conclude.":
   "For an independence test, check expected cell frequencies and sampling assumptions. A small p-value suggests evidence of association, not causation.")+
   " A nonsignificant result does not prove the null hypothesis.";
  const variant=selected==="expected-too-small"?["Test conditions may fail","Revisit category definitions, expected frequencies or test choice; do not merge groups simply to force significance.",["Are expected frequencies and independence assumptions adequate?","What defensible alternative could answer the question?"]]:
   selected==="evidence-against"?["Evidence against the null model","Interpret the evidence and practical meaning in context; a p-value is not an effect size or causal proof.",["Which categories appear responsible for the discrepancy?","How much can the sample justify generalising?"]]:
   selected==="sampling-question"?["Sampling limits the test conclusion","Independence of observations, selection bias and category definitions may matter more than the computed statistic.",["Which assumption could change the conclusion?","Can the study support a population claim?"]]:
   selected==="insufficient-evidence"?["Insufficient evidence is not proof","Explain what the test cannot establish and avoid claiming that categories or variables are certainly independent.",["Is a cautious conclusion sufficient?","Would sample size or category validity materially affect interpretation?"]]:
   ["Interpret the test cautiously","Choose what the calculated statistic and p-value actually indicate, after checking whether the test assumptions are met.",["Which hypothesis decision does the evidence warrant?"]];
  return a(variant[0],essential,variant[1],variant[2],testDepth);
 }
 case "expected-value":{
  const essential="Expected value is a long-run average under stated probabilities. It is not the most likely single outcome. Check the distribution, units and any independence assumptions.";
  const variant=selected==="large-variation"?["Risk matters alongside the expected value","Compare risk through possible losses, spread or probabilities of extreme outcomes. A high mean return may still be undesirable.",["What is the probability of an unacceptable outcome?","Would a risk-aware decision differ from the highest expected return?"]]:
   selected==="approximately-fair"?["What does fair mean?","Check the exact expected net gain after all costs, then assess whether finite-play outcomes feel different from the long-run expectation.",["Does a strategy change probabilities or merely choices?","How many plays would make long-run reasoning relevant?"]]:
   selected==="probabilities-weak"?["A probability model needs justification","Check that probabilities are valid, conditional structure and independence are justified; avoid inventing frequencies.",["Which assumption changes the expected value most?","Could simulation test the internal model without pretending to collect real data?"]]:
   selected==="positive-expectation"?["Positive expectation is not a guaranteed win","A positive expected value does not guarantee a win on a particular attempt. Explain the distribution of outcomes as well as their long-run average.",["How likely is a loss despite positive expectation?","Does variation or risk change which option is preferable?"]]:
   ["Interpret the expected value","Explain the long-run average in context and decide if risks, costs or assumptions still affect the decision.",["Does this expectation answer the actual decision question?"]];
  return a(variant[0],essential,variant[1],variant[2],probDepth);
 }
 case "measurement":{
  const essential="A correctly substituted trigonometric formula does not guarantee an accurate measured distance. Define the baseline, angle units, geometric assumptions and input precision.";
  const variant=selected==="angle-sensitive"?["The geometry magnifies angle errors","Quantify how a plausible angular change affects the result; near-degenerate triangle geometry can make estimates unstable.",["What range of estimated distances follows from the measurement uncertainty?","Would a different baseline improve stability?"]]:
   selected==="methods-disagree"?["Two estimates disagree","Check whether reference lengths, units or geometrical assumptions differ; do not average incompatible measurements automatically.",["Which input or assumption explains the discrepancy?","How does a defensible revised model affect the result?"]]:
   selected==="measurement-geometry"?["Check the measurement construction","A misaligned reference line or unmeasured angle can undermine the triangle model even if arithmetic is correct.",["Which geometric assumption is not verified?","Can the measurement process be redesigned or independently checked?"]]:
   ["Agreement is not accuracy","Repeated readings may share the same systematic error. Propagate plausible uncertainties to the final distance or height.",["How sensitive is the answer to measured angles or baseline?","Do repeated measurements support the stated precision?"]];
  return a(variant[0],essential,variant[1],variant[2],measurementDepth);
 }
 default:return null;
 }
}
export function extendedPlanningCheck(state,entry){
 if(!entry||entry.status==="completed"&&String(entry.result||"").trim())return null;
 const methods=methodFamilies(entry,{allowPlanned:true});
 const family=extendedFamily(methods);
 if(!family)return null;
 const prompts={
  "finance-break-even":"What financial decision will this break-even calculation help you make? Which demand, price, cost or capacity assumption will you justify or test?",
  "finance-compound":"What changes over time, and which rate and compounding period describe it? What will you investigate beyond one future-value substitution?",
  "finance-loan":"Are you modelling an amortising loan with periodic repayments rather than only lump-sum growth? What will the balance and interest calculations help you decide?",
  "finance-cashflow":"Which real receipts and payments occur in each period? What mathematical comparison or threshold will decide viability?",
  voronoi:"Which distance metric and real-world objective justify this diagram? What mathematical comparison will follow its construction?",
  "nonlinear-association":"Is the observed pattern monotonic? What does measuring ranks add, and how will you interpret the result?",
  "nonlinear-model":"Why does this particular function fit the context? Which parameters, residuals and domain limits will you investigate?",
  "categorical-test":"Which null hypothesis, sampling assumptions and expected counts make this test meaningful? What could each outcome actually establish?",
  "expected-value":"Which probability distribution and costs underpin the expectation? What decision or risk comparison will follow?",
  measurement:"Which measured angles/baselines justify the geometry? How will you test whether errors affect the final result?"
 };
 return {heading:"Before applying the formula or method",essential:prompts[family],
  depth:family.startsWith("finance-")?financialDepth(state):
   family==="voronoi"?voronoiDepth:family==="nonlinear-association"||family==="nonlinear-model"?nonlinearDepth:
   family==="categorical-test"?testDepth:family==="expected-value"?probDepth:measurementDepth};
}
