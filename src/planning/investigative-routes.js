/**
 * Editorial library of 16 investigative journeys. They are patterns for making
 * student-owned mathematical decisions, NOT scripts or recommended IA titles.
 * All route maps are illustrative; the actual mathematics determines next steps.
 * Stable IDs support a small reversible planning spark and device-local backups.
 */
import {PLANNING_CATALOG} from './catalog.js';
const route=(id,family,title,kinds,keywords,contexts,why,first,question,branches,finish,ai,aa,caution='',teacher=false)=>({
 id,family,title,kinds,keywords,contexts,why,first,question,branches,finish,
 math:{'AI SL':ai,'AA SL':aa},caution,teacher
});
const branch=(id,signal,next,check)=>({id,signal,next,check});
export const ROUTE_FAMILIES=Object.freeze([
 {id:'data',title:'Data & statistics',icon:'chart',description:'Investigate evidence, variation, comparisons and relationships.'},
 {id:'models',title:'Functions & modelling',icon:'waves',description:'Create models, evaluate assumptions and adapt to actual data.'},
 {id:'decisions',title:'Geometry, optimisation & decisions',icon:'ruler',description:'Use mathematics to describe, measure or make a reasoned choice.'},
 {id:'reasoning',title:'Probability & mathematical reasoning',icon:'sigma',description:'Model uncertainty, test conjectures and investigate processes.'}
]);
export const INVESTIGATIVE_ROUTES=Object.freeze([
 route('relationships','data','Relationships between two variables',['statistics'],
  ['correlation','correlate','relationship','associated','scatter','paired','height','versus','vs','linked variables'],['Paired numerical'],
  'If your aim compares two measured quantities, first inspect the shape and usefulness of their relationship.',
  ['Plot paired measurements','Record units and precision, label the axes, and plot the actual paired values before calculating a coefficient.'],
  'What pattern, if any, is supported by the plotted values?',
  [branch('linear','Approximately linear','Consider Pearson’s r and, only if it serves your aim, a linear regression. Interpret the gradient and residuals.','Check for influential points; correlation does not imply causation.'),
   branch('curve','Clearly curved','Describe the curvature, consider whether a nonlinear model has a meaningful purpose, then evaluate fit.','A small r does not mean no relationship; it measures linear association.'),
   branch('groups','Subgroups or unusual points','Check data quality; compare relevant subgroups or the sensitivity to a justified outlier.','Never delete an inconvenient value without investigating and explaining why.'),
   branch('none','No convincing pattern','Describe what your evidence can and cannot establish; reconsider the aim or conclude without forcing a model.','No relationship can be an informative, defensible result.')],
  'How far do the actual values answer your original question, and do you need any further mathematics?',
  ['AI14','AI15'],['AA15','AA16'],'Use PMCC only for a linear relationship; judge the graph first.'),
 route('groups','data','Comparing groups',['statistics'],
  ['compare groups','two groups','boys','girls','difference between','waiting time','schools','classes','teams','before and after'],['Two groups'],
  'A group comparison works best when the measurements and sampling conditions are genuinely comparable.',
  ['Compare the distributions','Gather comparable observations and make plots with matching scales and clearly stated units.'],
  'How different are the distributions, beyond their averages?',
  [branch('centre','Different centres','Compare means or medians alongside variability; explain the size of the difference in context.','An average difference alone does not show reliability or cause.'),
   branch('spread','Different spreads','Examine ranges, interquartile ranges or standard deviations where suitable.','Similar averages can conceal very different consistency.'),
   branch('test','A formal test might help','Only if course, sample, independence and assumptions permit, consider a relevant test after describing the data.','A small p-value is not a measure of practical importance.'),
   branch('sampling','Overlap or bias','Look for differences in sampling, sample sizes, confounding or measurement methods.','A weak comparison does not need to be rescued by more tests.')],
  'Does the evidence support a useful comparison, and for whom does the observed difference matter?',
  ['AI13','AI22'],['AA14'],'Statistical tests require assumptions and course checks; they are not automatically necessary.'),
 route('categorical','data','Categorical relationships',['statistics'],
  ['category','categorical','survey','preference','frequency','choice','yes or no','contingency'],['Two categorical variables'],
  'Two categorical variables invite a question about relative frequencies, rather than a numerical scatter graph.',
  ['Prepare a two-way table','Define mutually clear categories and record reliable counts, with appropriate consent and privacy safeguards.'],
  'Are the proportions meaningfully different across categories?',
  [branch('percentages','Proportions vary','Calculate relevant row or column proportions and compare them in context.','Use the correct denominator; raw counts may mislead.'),
   branch('test','An independence test may be justified','For AI SL, check sample selection and expected counts before considering chi-squared independence.','A test is not appropriate for very small expected frequencies or non-independent observations.'),
   branch('bias','Categories or sampling are problematic','Reconsider category definitions, missing data and collection bias.','Do not collapse categories just to obtain a favourable result.')],
  'What does the evidence really establish about the categories, and how much is it limited by sampling?',
  ['AI13','AI20'],['AA14'],'AA SL does not automatically offer the AI SL chi-squared syllabus route.'),
 route('variation','data','Variation and reliability',['statistics'],
  ['consistent','reliability','variation','variability','repeat','spread','accuracy','measurement','distribution','precision'],['One numerical variable'],
  'Repeated measurements can quantify consistency and uncertainty rather than simply produce one average.',
  ['Record repeated values','Check units, collection method and any changing conditions; draw a useful distribution.'],
  'Is the process consistent enough for the intended decision?',
  [branch('stable','Relatively stable readings','Summarise centre and spread, and relate the typical variation to a useful threshold.','A narrow spread does not prove the measuring method is unbiased.'),
   branch('wide','Wide variation or skew','Compare median, quartiles or other robust summaries and investigate conditions.','Do not use a normal model without checking its shape and assumptions.'),
   branch('outliers','Unusual measurements','Investigate plausible causes and their influence on a conclusion.','Retain authentic data and report justified handling.')],
  'Connect your observed spread to what you can actually predict, compare or decide.',
  ['AI13','AI18'],['AA14','AA18'],'Normal models are conditional on a defensible distributional shape.'),
 route('fitted-models','models','Building and testing models',['modelling','statistics'],
  ['model','predict','fit','estimate','regression','function','approximation','curve','relationship'],[],
  'Model building should start with variables and a plausible mathematical purpose, not a preferred curve.',
  ['Define a baseline model','Specify measurable quantities, reasonable domain, units and a simple first candidate function.'],
  'Where does the model agree with the observed or given situation?',
  [branch('fits','Good within a restricted range','Interpret parameters and residuals; distinguish interpolation from extrapolation.','A good fit does not guarantee a physical explanation.'),
   branch('systematic','Systematic residuals','Ask whether a different mathematical structure or assumption is justified.','Do not add parameters only to improve a fit score.'),
   branch('constraints','Model breaks at boundaries','Check limits, physical constraints and sensitivity to assumptions.','State explicitly where the model should not be applied.')],
  'Which features matter for the original aim, and is another model actually worth building?',
  ['AI04','AI09'],['AA06','AA09'],'A fitted relationship is a model, not proof of causation.'),
 route('growth','models','Growth and decay',['modelling','statistics'],
  ['growth','decay','exponential','population','cooling','half-life','depreciation','compound','increase over time'],[],
  'Changes over time may be additive or multiplicative; inspect values before claiming either.',
  ['Compare changes between readings','Collect comparable values over time and compare successive differences or ratios.'],
  'Are changes approximately additive, proportional or neither?',
  [branch('additive','Similar differences','Consider a linear description over a justified interval and interpret its rate.','A short linear approximation may fail in the long run.'),
   branch('multiplicative','Similar ratios','Consider an exponential model and interpret growth/decay parameters.','A constant proportional rate is an assumption to examine.'),
   branch('different','Neither pattern holds','Investigate phases, external constraints or alternative explanations.','Do not force exponential behaviour from an appealing graph.')],
  'Assess the useful prediction range and whether the rates actually address the question.',
  ['AI06','AI03'],['AA07','AA03']),
 route('cycles','models','Cycles and periodic behaviour',['modelling','statistics'],
  ['cycle','season','period','sinus','wave','tide','temperature over year','oscillat','periodic','daylight'],[],
  'Repeated observations may indicate a cycle, but a periodic function needs adequate evidence.',
  ['Make a time plot','Record or obtain a sufficiently long series with consistent time intervals.'],
  'Is a stable repeated pattern visible?',
  [branch('repeating','Clear approximate repetition','Estimate period, amplitude and midline; consider a sinusoidal model and check residuals.','Do not claim an exact period from one incomplete oscillation.'),
   branch('trend','Trend and cycle together','Separate the baseline trend from possible periodic variation if justified.','Explain which part of the model answers the aim.'),
   branch('irregular','Irregular variation','Investigate whether a cycle remains a meaningful interpretation.','A smooth curve can conceal real irregularities.')],
  'Explain what the model can and cannot predict, with particular care beyond the observed dates.',
  ['AI08','AI09'],['AA08','AA10']),
 route('trajectories','models','Movement and trajectories',['modelling'],
  ['trajectory','projectile','football','basketball','throw','kick','ball flight','flight path','motion','jump'],[],
  'A recording may support geometry or function modelling if positions, scale and viewpoint can be established.',
  ['Calibrate the movement','Choose a measurable recording or set of positions; identify axes, scale and time information.'],
  'What does the measured path actually allow you to model?',
  [branch('quadratic','Path resembles a parabola','Fit or derive a quadratic where justified; interpret turning point and domain.','Perspective, air resistance and measurement error can affect the apparent shape.'),
   branch('time','Time readings are available','Consider how position changes over time and whether a rate or acceleration is useful.','A still image alone cannot establish elapsed time.'),
   branch('poor-scale','Scale or perspective is unreliable','Investigate geometric correction or obtain improved measurements first.','Do not infer distances from uncalibrated image coordinates.')],
  'Check the physical meaning and limitations of any mathematical model against your original question.',
  ['AI05','AI10'],['AA06','AA11']),
 route('optimisation','decisions','Optimising a design',['modelling'],
  ['optim','maximum','minimum','volume','box','packaging','best design','efficient','maximise','minimise','cost'],[],
  'A useful optimum begins with clearly defined constraints and what “best” means.',
  ['Define variables and constraints','Describe the quantity you want to optimise and derive a workable expression and domain.'],
  'Where could an optimum occur, and what constraints matter?',
  [branch('stationary','Interior turning point','Consider differentiation if a valid function is available; verify candidates.','A stationary point is not automatically the global optimum.'),
   branch('boundary','Best value at an endpoint','Compare feasible boundaries and test the domain carefully.','Purely algebraic extrema can be physically impossible.'),
   branch('real-world','Other practical constraints','Examine sensitivity, material thickness, stability or estimation error.','An optimum of the idealised model may not be a practical optimum.')],
  'Explain whether your result is meaningful for the original design or decision.',
  ['AI11','AI24'],['AA06','AA22']),
 route('images','decisions','Modelling shapes from images',['modelling'],
  ['image','photo','leaf','shape','outline','area','silhouette','logo','photograph','pixel'],[],
  'A calibrated image can lead to geometric modelling, but its resolution and perspective need attention.',
  ['Prepare calibrated coordinates','Record scale and extract a manageable set of boundary points or measurements.'],
  'What representation of the outline is justified?',
  [branch('simple','Simple geometric components','Divide into familiar shapes and estimate lengths and areas.','Clearly distinguish measured from approximated boundaries.'),
   branch('curves','Smooth curved outline','Fit suitable curves, then investigate areas or approximation error where appropriate.','A smoother fitted curve is not necessarily more accurate.'),
   branch('uncertainty','Poor perspective or resolution','Check alternative scales, viewpoints or sensitivity to selected points.','Do not treat pixel dimensions as genuine distances without calibration.')],
  'Discuss approximation and whether the resulting measurement is useful for your purpose.',
  ['AI11','AI25'],['AA11','AA23']),
 route('triangulation','decisions','Measurement and triangulation',['modelling'],
  ['angle','height','distance','triangulat','measure','surveying','tree','building','width','trigonometry'],[],
  'Geometry can turn accessible angles and lengths into estimates of distances that are hard to measure directly.',
  ['Draw and label a scale-aware diagram','Identify which distances and angles you can measure safely and repeatedly.'],
  'Do the geometric assumptions hold well enough?',
  [branch('triangle','Clear triangle geometry','Use an appropriate trigonometric relation and interpret the measured lengths.','Explain the assumptions of the diagram and check units.'),
   branch('repeat','Repeatable measurements','Compare calculations from several observations or locations.','A result can look precise even when angles are uncertain.'),
   branch('sensitivity','Small measurement errors matter','Change an input within its measurement accuracy and investigate the effect.','Do not report more precision than the measurements support.')],
  'Evaluate whether the estimated value and its uncertainty answer the original aim.',
  ['AI10','AI11'],['AA12','AA11']),
 route('voronoi','decisions','Locations and Voronoi diagrams',['modelling'],
  ['voronoi','nearest','location','service','catchment','site','facility','map','school area','delivery'],[],
  'Comparing locations begins with a meaningful measure of distance or accessibility.',
  ['Plot reliable location coordinates','Decide on an appropriate scale and whether straight-line distance makes sense.'],
  'How should “nearest” or “most accessible” be defined?',
  [branch('euclidean','Straight-line distances make sense','Construct relevant perpendicular bisectors or Voronoi cells and compare regions.','Voronoi diagrams are in the AI SL reference catalogue, not automatically AA SL.'),
   branch('roads','Roads or travel times matter','Compare the geometric model with plausible actual routes or travel times.','The nearest site in straight-line distance may not be the quickest.'),
   branch('demands','Population or demand matters','Consider how the locations serve different groups or weights.','Choosing a site by distance alone can ignore equity and capacity.')],
  'State which accessibility claim your geometry really supports and its limitations.',
  ['AI12','AI10'],['AA11','AA12'],'Voronoi is listed for AI SL; AA SL requires an independent teacher check if using this method.'),
 route('finance','decisions','Business and financial decisions',['modelling','statistics'],
  ['loan','finance','profit','cost','revenue','business','money','interest','saving','pricing','break-even'],[],
  'Finance becomes mathematical when the variables and realistic assumptions of a choice are clear.',
  ['Define the decision variables','Identify documented costs, rates, times, units and one comparison worth making.'],
  'Which model addresses the decision without hiding assumptions?',
  [branch('growth','Repeated growth or repayments','Model compound changes or cumulative payments where suitable.','Check whether rates are constant or subject to fees and terms.'),
   branch('break-even','Revenue versus cost','Construct justified cost and revenue expressions and examine break-even points.','A financial model is not a business forecast.'),
   branch('sensitivity','Assumptions change outcomes','Compare scenarios under plausible variation in rates or costs.','A decision can reverse when a parameter changes.')],
  'Return to the original financial decision and communicate what the model cannot establish.',
  ['AI03','AI04'],['AA02','AA06']),
 route('chance','reasoning','Probability and simulation',['statistics','modelling'],
  ['probability','chance','game','random','simulation','odds','expected','binomial','risk','win'],['Repeated yes/no trials'],
  'Define outcomes before choosing a theoretical distribution or running a simulation.',
  ['Build a small probability model','Describe possible outcomes, assumptions, independence and one measurable question.'],
  'Do observed frequencies agree with the stated theoretical model?',
  [branch('agree','Broad agreement','Compare predicted and observed frequencies using an appropriate measure of sampling variation.','Agreement does not verify every assumption.'),
   branch('disagree','Differences from the model','Check independence, fairness, data quality and sample size.','Simulation results fluctuate and do not prove a probability is wrong.'),
   branch('decision','A decision depends on risk','Use expected values or relevant probabilities and explain the trade-off.','Expected value alone may not capture variability or acceptable risk.')],
  'Interpret uncertainty and whether the model supports the intended decision.',
  ['AI17','AI19'],['AA17','AA19']),
 route('proof','reasoning','Conjecture, proof and counterexamples',['theoretical'],
  ['conjecture','proof','integer','divisib','identity','number pattern','prove','generalise','theorem'],[],
  'A precise unresolved mathematical statement gives a theoretical exploration purpose, but needs teacher approval of scope.',
  ['Explore a few small cases','Define the claim carefully and identify assumptions or restricted domains.'],
  'What would establish or refute the claim generally?',
  [branch('pattern','Examples suggest a pattern','Formulate a precise conjecture and seek an argument valid for all allowed cases.','Any finite number of confirming cases does not prove a universal claim.'),
   branch('counter','A counterexample appears','Revise the claim or domain and explain why the counterexample matters.','A counterexample refutes a universal statement.'),
   branch('structure','A useful underlying structure','Investigate a lemma or algebraic property that could support proof.','Do not include results merely to make the IA longer.')],
  'Be precise about what was proved, disproved or left open; discuss scope with your teacher.',
  ['AI01'],['AA04','AA06'],
  'Teacher discussion essential: purely theoretical explorations, especially broad number patterns, may be better suited to an EE than an IA.',true),
 route('iteration','reasoning','Iteration and convergence',['theoretical','modelling'],
  ['iterate','iteration','converge','fixed point','recursive','recurrence','limit','numerical method','sequence'],[],
  'An iterative process can be investigated through small numerical cases before making a general claim.',
  ['Define an explicit iteration rule','State a starting value, domain and enough iterations to observe behaviour.'],
  'How does the sequence behave for different starts or parameters?',
  [branch('settles','Values appear to settle','Consider a candidate fixed point and examine whether the observed behaviour can be justified.','Numerical closeness alone does not prove convergence.'),
   branch('oscillates','Values oscillate or diverge','Test different starting values and parameters, and seek a meaningful explanation.','An unstable iteration need not be a failed investigation.'),
   branch('accuracy','Stopping rules matter','Compare successive terms and ask how numerical error affects the answer.','Finite computation cannot establish a universal limit.')],
  'Explain which conclusions are observations and which have mathematical justification.',
  ['AI01','AI04'],['AA06','AA09'],
  'Convergence arguments may exceed the course; review suitability and scope with a teacher.',true)
]);
const byId=new Map(INVESTIGATIVE_ROUTES.map(x=>[x.id,x]));
const familyIds=new Set(ROUTE_FAMILIES.map(x=>x.id));
const mathById=new Map(PLANNING_CATALOG.math.map(x=>[x.id,x]));
for(const r of INVESTIGATIVE_ROUTES){
 if(!familyIds.has(r.family)||r.branches.length<2)throw Error('Invalid investigative route '+r.id);
 for(const [course,ids] of Object.entries(r.math)){
  if(ids.some(id=>mathById.get(id)?.course!==course))throw Error('Incorrect course technique: '+r.id);
 }
}
export const routeById=id=>byId.get(id)||null;
export const routeCourseMath=(r,course)=>!r||!['AI SL','AA SL'].includes(course)?[]:
 (r.math[course]||[]).map(id=>mathById.get(id)).filter(Boolean);
/** Conservative editorial ranking, not AI semantic analysis. Always leaves other routes available. */
export function matchingInvestigativeRoutes(state,{limit=4}={}){
 const fields=state?.planning?.fields||{};
 const kind=fields.kind,context=fields.statisticsContext||'';
 const aim=[fields.aim,fields.idea,fields.provisionalTitle,fields.beneficiary].join(' ').toLowerCase().slice(0,2600);
 if(!kind||kind==='unsure')return [];
 const ranked=INVESTIGATIVE_ROUTES.map((r,index)=>{
  if(!r.kinds.includes(kind))return null;
  const hits=r.keywords.filter(word=>aim.includes(word.toLowerCase()));
  const dataMatch=kind==='statistics'&&r.contexts.includes(context);
  // A familiar broad technique is allowed as ONE complementary suggestion,
  // but should not fill the panel with irrelevant routes merely by category.
  const broad=(kind==='modelling'&&r.id==='fitted-models')||
   (kind==='statistics'&&r.id==='variation'&&['Paired numerical','Two groups','One numerical variable',''].includes(context))||
   (kind==='theoretical'&&r.family==='reasoning');
  if(!hits.length&&!dataMatch&&!broad)return null;
  const score=(dataMatch?16:0)+Math.min(18,hits.length*6)+(broad?2:0);
  return {r,index,score,hits,dataMatch};
 }).filter(Boolean).sort((a,b)=>b.score-a.score||a.index-b.index);
 return ranked.slice(0,Math.max(1,Math.min(4,limit))).map(x=>({
  ...x.r,
  matchReason:x.hits.length?'Your question mentions '+x.hits.slice(0,2).map(w=>'“'+w+'”').join(' and ')+'.':
   x.r.contexts.includes(context)?'This route can begin with the data structure you selected.':
   'A typical possibility for the investigation type you chose.'
 }));
}
/** Route spark state never records mathematical work as completed. */
export function createRouteExplorer(){
 return {mode:'aim',family:'all',openRoute:'',selectedRoute:'',firstStep:'',status:'provisional'};
}
export function normalizeRouteExplorer(raw={}){
 const base=createRouteExplorer(),v=raw&&typeof raw==='object'?raw:{};
 const selected=routeById(v.selectedRoute),open=routeById(v.openRoute);
 return {
  ...base,
  mode:['aim','routes','all'].includes(v.mode)?v.mode:'aim',
  family:v.family==='all'||familyIds.has(v.family)?v.family:'all',
  openRoute:open?.id||'',
  selectedRoute:selected?.id||'',
  firstStep:selected?.first[0]||'',
  status:'provisional'
 };
}
