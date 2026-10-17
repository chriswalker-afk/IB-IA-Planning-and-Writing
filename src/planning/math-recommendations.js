/**
 * Editorial, deterministic suggestions for the first mathematics-choice page.
 * They are NOT AI-generated, inferred data patterns, a syllabus guarantee or an
 * automatic choice. Only the supplied AI SL and AA SL catalogue is mapped.
 *
 * All IDs are validated against the sheet-derived PLANNING_CATALOG. A "typical"
 * route is a way to START, not a recipe to follow despite contrary results.
 */
import {PLANNING_CATALOG} from './catalog.js';

const idMap=new Map(PLANNING_CATALOG.math.map(x=>[x.id,x]));
const normal=v=>String(v||'').toLowerCase().slice(0,2000);
const dual=(ai,aa,why,first,origin='Typical route',caution='')=>({AI:ai,AA:aa,why,first,origin,caution});
const contextRoutes={
 'Paired numerical':[
  dual('AI14','AA15','A scatter plot can reveal whether two measured variables show a relationship. Pearson’s r only describes LINEAR association.','Record paired values with units, then inspect the scatter before calculating any correlation.','From your data type','A coefficient alone does not establish causation or justify a line of best fit.'),
  dual('AI15','AA16','A fitted line can help estimate a value, but only when the scatter is approximately linear and your aim calls for prediction.','Plot the paired values; then decide whether a straight line and residual checks are justified.','Possible next step','Do not assume the data will be linear.'),
  dual('AI13','AA14','Describing how the observations vary can give context before testing a relationship.','Record where the sample came from and check spread or unusual values.','Typical route')
 ],
 'One numerical variable':[
  dual('AI13','AA14','Start with the shape, typical value and variability of one measured quantity.','Make a suitable distribution display and summarise centre and spread.','From your data type'),
  dual('AI18','AA18','A normal model could be considered only if its shape and assumptions suit the observed measurements.','Inspect the distribution before checking whether a normal model is reasonable.','Only if appropriate','Do not assume a distribution is normal.')
 ],
 'Two groups':[
  dual('AI13','AA14','Compare each group’s distribution, centre and spread rather than relying on two averages alone.','Make comparable displays for the groups with consistent units.','From your data type'),
  dual('AI22',null,'A comparison of two means may call for a formal test when the data and assumptions justify it.','Check whether observations are independent and whether the test assumptions are defensible.','Conditional extension','Do not select a t-test simply because there are two groups. Confirm applicability with your teacher.')
 ],
 'Two categorical variables':[
  dual('AI13','AA14','Begin with a two-way frequency table and meaningful group proportions.','Collect appropriately categorised counts, not a false numerical scatter.','From your data type'),
  dual('AI20',null,'An independence test can be considered when the two categorical variables and expected counts meet its conditions.','Prepare a contingency table; then check the expected frequencies.','Conditional extension','Only for suitably collected categorical observations and appropriate assumptions.')
 ],
 'Repeated yes/no trials':[
  dual('AI17','AA17','A binomial model may be appropriate when there is a fixed number of independent trials with a constant success probability.','Define exactly what counts as one success and check the independence assumption.','From your data type','Repeated yes/no observations do not automatically justify a binomial model.'),
  dual('AI19','AA19','Expected value can help judge a meaningful long-run outcome in a suitable chance process.','Define the possible outcomes and their probabilities before computing any expectation.','Possible extension')
 ],
 generic:[
  dual('AI13','AA14','Understanding sample size, centre and spread is often a useful first statistical step.','Identify which quantities and units you could actually collect or access.','Typical starting route'),
  dual('AI14','AA15','If you have paired numerical values, exploring the scatter may lead to a meaningful question about association.','Confirm you have TWO linked numerical measurements before using a scatter plot.','Only if paired data','Do not infer linear correlation or causation from a topic title.')
 ]
};
const modellingThemes=[
 {test:/trajectory|projectile|football|basketball|badminton|kick|ball.?flight|flight path|sporting path|throw|launch/,
  options:[
   dual('AI05','AA06','A quadratic function may describe a short portion of a recorded trajectory, subject to scale and viewpoint.','Find a recording with a known scale, then inspect measured positions before choosing a function.','From your aim','Perspective, time intervals and air resistance can affect any model.'),
   dual('AI10','AA11','Geometry can help establish meaningful positions, distances and scales before fitting a model.','Label a diagram and check which distances or angles you can actually measure.','Supporting mathematics')
  ]},
 {test:/optim|maximum|minim|best design|most efficient|volume|surface area|capacity|box|packag|material cost|profit|revenue/,
  options:[
   dual('AI11','AA06','Defining an expression for the quantity you want to compare helps make “best” mathematically precise.','Choose variables, fixed quantities and a realistic domain for your model.','From your aim'),
   dual('AI24','AA22','Finding a maximum or minimum may be useful when you have a justified function and feasible constraints.','Derive or estimate the function before calculating stationary points.','Possible next step','An optimum inside an idealised model may not be practical or globally best.')
  ]},
 {test:/compound|interest|repayment|loan|investment|saving|finance|money|business|break.?even/,
  options:[
   dual('AI03','AA02','Financial questions often involve repeated growth, accumulated totals or repayments.','Identify the rate, payment schedule and assumptions from accessible information.','From your aim'),
   dual('AI06','AA07','An exponential relationship can be considered if changes behave multiplicatively.','Compare a few actual or sourced values to see whether that pattern is plausible.','Possible model','A fixed rate is an assumption, not a known property of the data.')
  ]},
 {test:/period|season|tide|wave|oscillat|cyclic|sinus|monthly cycle|daylight|temperature cycle/,
  options:[
   dual('AI08','AA08','A periodic function may capture a repeating variation over time if genuine observations support it.','Plot values across enough time to check whether a repeatable cycle exists.','From your aim'),
   dual('AI09','AA10','Comparing candidate functions is useful if a single curve is not clearly adequate.','Test a simple reference model before claiming a sinusoid is best.','Possible next step')
  ]},
 {test:/exponential|growth|decay|cooling|population|temperature drop|bacteria|radioactiv|depreciat/,
  options:[
   dual('AI06','AA07','An exponential function may be appropriate when change is approximately proportional to the current amount.','Record or locate several comparable measurements and inspect the shape.','From your aim','Verify whether change really slows or accelerates multiplicatively.'),
   dual('AI09','AA06','A comparison model can help reveal where one relationship works and another fails.','Try a simple reference model and compare relevant residuals.','Possible next step')
  ]},
 {test:/voronoi|nearest|locat|distance|travel|map|catchment|school route|service point|site/,
  options:[
   dual('AI12','AA11','Geometry of locations and distance can support access or nearest-site questions.','Create a scale map or record coordinates; define what distance represents.','From your aim','Voronoi diagrams appear in the AI SL catalogue; AA SL suggestions use coordinate geometry instead.'),
   dual('AI10','AA12','Angles and lengths can describe a measurable route or physical layout.','Draw an accurately labelled diagram and identify obtainable dimensions.','Supporting mathematics')
  ]}
];
const genericModel=[
 dual('AI04','AA06','A simple function might give a useful baseline, provided the variables and domain are meaningful.','Define two measurable quantities and plot a few real values before selecting the model shape.','Typical starting route','Linear or polynomial behaviour must be justified by data or mathematical structure.'),
 dual('AI09','AA09','Checking restrictions or comparing candidates can show where a first model stops being useful.','Choose a realistic domain and decide what observation would count against the model.','Possible next step')
];
const theoretical={
 AI:[
  dual('AI01',null,'A sequence or algebraic relationship can sometimes help examine a precise mathematical conjecture.','State the claim and test a few small cases, noting that examples cannot prove it.','Possible starting point','For AI SL, a purely theoretical pattern may need especially careful teacher discussion about depth and suitability.')
 ],
 AA:[
  dual(null,'AA04','An algebraic argument or counterexample could address a precise mathematical claim.','Define the objects and test cases before asking what would prove the general statement.','Typical theoretical route','Cases alone cannot prove a universal claim. Check scope with your teacher.'),
  dual(null,'AA06','Functions can provide a structured way to compare properties or derive a relationship.','Specify a restricted domain and one smaller case you can investigate.','Possible supporting route'),
  dual(null,'AA09','Domain and range restrictions can determine whether a proposed statement is valid.','Write the domain explicitly and consider boundaries or counterexamples.','Possible supporting route')
 ]
};
/** @returns {Array<{id,label,topic,purpose,why,first,origin,caution}>} */
export function earlyMathRecommendations(state,{limit=4}={}){
 const f=state?.planning?.fields||{},course=f.course;
 const c=course==='AI SL'?'AI':course==='AA SL'?'AA':null;
 if(!c)return [];
 const text=normal([f.aim,f.idea,f.provisionalTitle,f.beneficiary].join(' '));
 let routes=[];
 if(f.kind==='statistics'){
  const context=f.statisticsContext||(/correlation|relationship between|associated with|paired|scatter/.test(text)?'Paired numerical':/compare.*groups?|difference.*between.*groups?|waiting times/.test(text)?'Two groups':'generic');
  routes=contextRoutes[context]||contextRoutes.generic;
 }else if(f.kind==='modelling'){
  const theme=modellingThemes.find(x=>x.test.test(text));
  routes=theme?theme.options:genericModel;
 }else if(f.kind==='theoretical'){
  routes=theoretical[c];
 }else return [];
 const used=new Set();
 const choices=[];
 for(const x of routes){
  const id=x[c];
  if(!id||used.has(id))continue;
  const math=idMap.get(id);
  if(!math||math.course!==course)continue;
  used.add(id);choices.push({...math,why:x.why,first:x.first,origin:x.origin,caution:x.caution||''});
  if(choices.length>=Math.max(1,Math.min(5,limit)))break;
 }
 return choices;
}
