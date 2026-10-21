/**
 * Pass 4: IB-aware presentation coach.
 *
 * Conservative, deterministic editorial guidance built from the student's chosen
 * route, genuine working values and saved decisions. This is not an IB grade,
 * statistical significance test, source verification or fabricated interpretation.
 */
import {finiteCell,splitHeading,analyseGraph} from "./graph-core.js";
import {statAnalysis} from "./stat-studio-core.js";
import {statMethodNote} from "./stat-reading-guide.js";
import {analyzeTable} from "./table-studio-core.js";

const words=(v,n=160)=>String(v??"").trim().slice(0,n);
const label=v=>words(splitHeading(v).label,100).toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const cell=v=>String(v??"").trim();
const unique=items=>[...new Set(items.filter(Boolean))];
const hasValues=d=>Array.isArray(d?.matrix)&&d.matrix.some(row=>Array.isArray(row)&&row.some(x=>cell(x)));
const finiteAt=(row,i)=>finiteCell(row?.[i])!==null;
const sourceType=d=>["primary","secondary","theoretical"].includes(d?.sourceKind)?d.sourceKind:"unsure";
const confirmedFields=state=>state?.completion?.fields||{};
const planFields=state=>state?.planning?.fields||{};
const currentAim=state=>words(confirmedFields(state).aim||planFields(state).aim||state?.project?.aim,200);
const where=(d)=>Array.isArray(d?.matrix)?d.matrix:[];

export function describeWorkingData(draft){
 const cols=Array.isArray(draft?.columns)?draft.columns.slice(0,10):[];
 const matrix=where(draft).slice(0,500),filled=matrix.filter(row=>row.some(x=>cell(x)));
 if(!cols.length||!filled.length)return null;
 const numerical=cols.map((_,i)=>filled.filter(row=>finiteAt(row,i)).length);
 const fractions=numerical.map(n=>n/filled.length);
 const numericIndexes=fractions.map((n,i)=>n>=.8?i:-1).filter(i=>i>=0);
 const categoryIndexes=fractions.map((n,i)=>n<.2?i:-1).filter(i=>i>=0);
 const paired=numericIndexes.length>=2?filled.filter(r=>numericIndexes.slice(0,2).every(i=>finiteAt(r,i))).length:0;
 const shape=categoryIndexes.length&&numericIndexes.length?"categories-and-numbers":
  numericIndexes.length>=2?"paired-numbers":numericIndexes.length===1?"one-numeric-variable":
  categoryIndexes.length?"categories":"mixed-or-uncertain";
 const names=cols.map(x=>words(x,95));
 return {shape,columns:names,rows:filled.length,numerical:numericIndexes,categorical:categoryIndexes,paired,
  source:sourceType(draft), allRows:matrix.length};
}
function chooseDataset(state){
 const shelf=state?.dataShelf||[];
 const candidates=[
  ...[["graph",state?.graphStudio],["stat",state?.statStudio],["table",state?.tableStudio]]
   .filter(([,studio])=>studio?.open&&hasValues(studio.draft))
   .map(([tool,studio])=>({draft:studio.draft,name:"Currently open "+({graph:"Graph Plotter",stat:"Statistical Diagrams",table:"Table Studio"}[tool])})),
  ...shelf.slice().reverse().filter(x=>hasValues(x)).map(x=>({draft:x,name:words(x.name,70)||"Saved dataset"})),
  ...[["graph",state?.graphStudio],["stat",state?.statStudio],["table",state?.tableStudio]]
   .filter(([,studio])=>hasValues(studio?.draft))
   .map(([tool,studio])=>({draft:studio.draft,name:"Working "+({graph:"graph",stat:"statistics",table:"table"}[tool])+" data"}))
 ];
 const first=candidates[0];
 return first?{name:first.name,...describeWorkingData(first.draft)}:null;
}
export function contextualRepresentationAdvice(state,baseAdvice){
 const data=chooseDataset(state);
 const protectedContext=["method","next","route"].includes(baseAdvice.source);
 let ids=[...baseAdvice.ids],why=[...baseAdvice.why];
 // An old dataset cannot displace the selected method or a confirmed next
 // step. Only use worksheet-shape heuristics for general fallback suggestions.
 if(!protectedContext&&data){
  if(data.shape==="one-numeric-variable"||data.shape==="categories")
   ids=["stat","table"];
  else if(data.shape==="categories-and-numbers")ids=["table","stat"];
  else if(data.shape==="paired-numbers")ids=["graph","stat"];
  why=ids[0]==="graph"?[
   "Inspect the paired numerical values without automatically fitting a model.",
   "Inspect spread or subgroups before deciding what mathematical calculation follows."
  ]:ids[0]==="table"?[
   "Start with an explicit category/count summary and check the denominator.",
   "Choose a bar diagram only if the numbers are genuine category counts."
  ]:[
   "Inspect the distribution of the measured variable before choosing a model.",
   "Give only a compact, purposeful numerical summary rather than the entire raw dataset."
  ];
 }
 const description=!data?"No editable dataset has been selected yet. Suggestions use your recorded choices, not a pattern detected in observations.":
  data.shape==="paired-numbers"?
   data.paired+" complete numeric pairs are available in "+data.name+". This does not establish any relationship; inspect the data before choosing a model.":
  data.shape==="one-numeric-variable"?
   data.rows+" working rows contain a mainly numeric variable in "+data.name+". A distribution is possible; a scatter diagram would need genuinely paired measurements.":
  data.shape==="categories-and-numbers"?
   data.rows+" working rows contain category labels and numerical values in "+data.name+". Decide whether those numbers are individual measurements or valid category counts.":
  data.rows+" entered rows are available in "+data.name+". Check what each row and variable represents before selecting a diagram.";
 return {data,ids,why,note:description, basedOn:baseAdvice.reason};
}

/**
 * Specific, optional mode recommendation. Never silently switches a student's
 * chosen mathematical method or infers a relationship from a dataset.
 */
export function suggestedDiagramMode(state,type,draft){
 const route=state?.planning?.routeExplorer?.selectedRoute||"";
 const profile=describeWorkingData(draft);
 const hasData=!!profile,small=profile?.rows<=35;
 const numeric=profile?.numerical?.length||0;
 const groupValues=profile?.shape==="categories-and-numbers";
 const rows=where(draft);
 const counts=groupValues&&profile.categorical[0]===0&&profile.numerical.length>0&&
  rows.every(row=>profile.numerical.every(i=>{
   const value=finiteCell(row[i]);return value!==null&&value>=0&&Number.isSafeInteger(value);
  }));
 const choose=(mode,name,reason,action,key)=>({mode,name,reason,action,key,from:hasData?"current worksheet":"planned pathway"});
 if(type==="graph"){
  if(draft?.kind==="function"&&!hasData)return choose("function","Function graph",
   "Use a mathematically derived expression and justify its domain; this is not observed data.","graph-type","graphValue");
  if(hasData&&numeric<2)
   return {mode:"stat",name:"Statistical Diagrams",reason:"A scatter/time graph needs genuinely paired numerical variables. A distribution or category display may fit these values better.",action:"stat-open",key:""};
  if(["growth","cycles","trajectories"].includes(route)&&numeric>=2)
   return choose("time","Time series","Only use a joined chronological plot if the x-variable is genuinely time and its order is meaningful.","graph-type","graphValue");
  if(["optimisation","proof","iteration"].includes(route)&&!hasData)
   return choose("function","Function graph","Use a meaningful function and restricted domain to explore your conjecture or optimisation; graphical examples are not proof.","graph-type","graphValue");
  return choose("scatter","Scatter diagram","For paired numerical values, inspect genuine plotted pairs before deciding whether linear or nonlinear modelling is appropriate.","graph-type","graphValue");
 }
 if(type==="stat"){
  // Class boundaries are continuous measurements, not discrete category labels.
  if(["histogram","ogive","polygon"].includes(draft?.kind)&&draft?.histogramInput==="table")
   return choose(draft.kind,{histogram:"Frequency-density histogram",ogive:"Cumulative-frequency curve",
    polygon:"Frequency polygon"}[draft.kind],
    "Your supplied lower/upper boundaries and counts describe continuous intervals. Use density, cumulative totals or midpoints rather than categorical bar heights.",
    "stat-kind","statValue");
  if(counts&&profile.rows>=2&&profile.rows<=12)
   return choose("bar","Comparative bar chart","The worksheet appears to contain discrete labels and whole-number, non-negative counts. Confirm that these are actual category frequencies.","stat-kind","statValue");
  if(groupValues&&!counts)
   return {mode:"table",name:"Table Studio or regrouping",reason:"These appear to be individual measurements beside categories, not already aggregated counts. Summarise by group before using a count bar chart.",action:"table-open",key:""};
  if(numeric>=2&&profile.rows>=5&&["groups","variation"].includes(route))
   return choose("box","Side-by-side box plots","Comparing centre, spread and outliers can be more informative than comparing means alone; state each group's n.","stat-kind","statValue");
  if(numeric>=1&&profile.rows>=20)
   return choose("histogram","Histogram","For many numerical measurements, inspect continuous distribution shape; choose class boundaries with a reason.","stat-kind","statValue");
  if(numeric>=1&&small&&profile.rows>=2)
   return choose("dot","Dot plot","A dot plot can show individual observations without grouping them into intervals; check whether rounding stacks points.","stat-kind","statValue");
  if(["groups","variation"].includes(route))
   return choose("box","Box plots","Once you have at least five numerical observations per selected group, compare medians and spread using consistent quartile rules.","stat-kind","statValue");
  if(route==="categorical")
   return choose("bar","Bar chart","Use a categorical bar chart only for discrete classes with actual whole-number frequencies, with a zero baseline.","stat-kind","statValue");
  return choose("histogram","Histogram","Collect genuine numerical observations and check appropriate class width. A histogram is not meaningful for text-only categories.","stat-kind","statValue");
 }
 if(type==="table"){
  if(profile?.rows>8&&numeric)
   return choose("summary","Summary statistics","A long raw table would be hard to read in an IA. Use informative measures with each sample size n.","table-mode","tableMode");
  if(["groups","variation"].includes(route)&&numeric)
   return choose("summary","Summary statistics","Use a few comparable measures of centre and spread, with their units and sample sizes.","table-mode","tableMode");
  if(route==="categorical"||profile?.shape==="categories")
   return choose("frequency","Frequency table","State the frequency denominator and keep categories purposeful. Use observed counts, not invented probabilities.","table-mode","tableMode");
  return choose("compact","Short results table","Keep at most eight purposeful rows and five columns; preserve measured precision.","table-mode","tableMode");
 }
 return null;
}

export function relevantAccuracySparks(state,draft){
 const cols=unique([
  ...(draft?.columns||[]),draft?.xLabel,draft?.yLabel,draft?.variable,
  ...(draft?.headings||[])
 ]).map(label).filter(Boolean);
 const plans=state?.planning?.accuracyPlans||[],
  actual=state?.completion?.accuracyDecisions||[];
 const matches=xs=>xs.filter(x=>cols.some(c=>[x.quantity,x.symbol].some(v=>label(v)===c)))
  .slice(0,3);
 return {planned:matches(plans),recorded:matches(actual)};
}
function spark(kind,title,detail){
 return {kind,title:words(title,110),detail:words(detail,320)};
}
export function presentationSparks(state,type,draft){
 const p=planFields(state),f=confirmedFields(state),a=relevantAccuracySparks(state,draft);
 const result=[];
 if(currentAim(state))result.push(spark("aim","Aim recorded","Use the aim to explain why this mathematical representation belongs here."));
 const actualSource=f.actualSourceType||f.actualSource||f.sourceCitation;
 const plannedSource=p.dataSource||p.secondaryPublisher||p.primaryWhat||p.secondaryUrl;
 if(actualSource)result.push(spark("confirmed","Source recorded in IA Studio",
  [f.actualSourceType&&"Type: "+f.actualSourceType,f.actualSource&&"Evidence: "+f.actualSource,f.sourceCitation&&"Citation: "+f.sourceCitation].filter(Boolean).join(" · ")+
  ". Check that this figure uses the same actual source."));
 else if(plannedSource)result.push(spark("planned","Source from Planning (not yet verified)",
  [p.dataSource&&"Route: "+p.dataSource,p.secondaryPublisher||p.primaryWhat||p.secondaryUrl].filter(Boolean).join(" · ")+
  ". Confirm what was actually used before crediting the figure."));
 const numerical=type==="graph"||type==="stat"||type==="table";
 if(numerical){
  if(a.recorded.length)result.push(spark("confirmed","Recorded accuracy decision",
   a.recorded.map(x=>[x.quantity,x.resolution,x.policy].filter(Boolean).join(": ")).join("; ")+
   ". Use the original input precision; don't round intermediate results."));
  else if(a.planned.length)result.push(spark("planned","Matching measurement-accuracy spark",
   a.planned.map(x=>[x.quantity,x.resolution||x.basis,x.uncertainty].filter(Boolean).join(": ")).join("; ")+
   ". This is a plan: confirm what the device or dataset actually resolved."));
  else if(p.firstAccuracy)result.push(spark("planned","Earlier accuracy intention",
   p.firstAccuracy+". Recheck this against the measurements actually plotted."));
 }
 if(type==="stat"||type==="table"||type==="graph"&&draft?.kind!=="function"){
  const pop=f.statisticalPopulation||p.primaryPopulation,
   sample=f.samplingMethod||p.primarySamplingMethod||p.primarySampling,
   size=f.sampleSize||"",unit=p.primarySamplingUnit||"",
   frame=p.primarySamplingFrameDetails||p.primarySamplingFrame||"";
  if(pop||sample||size||unit||frame)
   result.push(spark(f.statisticalPopulation||f.samplingMethod?"confirmed":"planned",
    "Sampling and population context",
    [pop&&"Population: "+pop,sample&&"Selection: "+sample,size&&"Recorded size: "+size,unit&&"Sampling unit (planned): "+unit,frame&&"Sampling frame (planned): "+frame].filter(Boolean).join(" · ")+
    ". Explain who or what can reasonably be represented; do not claim a representative sample without evidence."));
 }
 return result.slice(0,4);
}

const alerts=(id,tone,title,detail)=>({id,tone,title,detail});
export function presentationDiagnostics(state,type,draft){
 const d=draft||{},f=confirmedFields(state),p=planFields(state);
 const items=[],add=(id,tone,title,detail)=>items.push(alerts(id,tone,title,detail));
 const source=sourceType(d);
 if(type==="graph"){
  const q=analyseGraph(d);
  if(d.kind==="scatter"){
   add("scatter", "consider","Inspect before fitting","A scatter diagram is a first inspection, not evidence that a linear or other model is justified. Look for curvature, outliers and clusters before modelling.");
   if(q.skipped)add("graph-missing","check","Some pairs were omitted",q.skipped+" working rows cannot be plotted. Check missing/non-numeric paired values and discuss exclusions rather than silently removing inconvenient observations.");
  }else if(d.kind==="time")add("time","consider","Time must be meaningful","Check chronological order, unequal intervals and repeated readings before interpreting slopes or a rate of change.");
  else add("function","consider","This is a model, not observations","Define the feasible domain, constraints and how the function was obtained. Showing a graph cannot validate the function by itself.");
  if(q.warnings.some(x=>["clipped","empty-viewport"].includes(x.code)))
   add("cropped","check","Viewport may mislead","Your manual limits hide some or all mathematical values. Return to automatic scales or justify the displayed window explicitly.");
  else if(d.kind!=="function"&&(d.xMin||d.yMin||d.xMax||d.yMax))
   add("scale","consider","Check manual scales","Consider whether a truncated axis exaggerates changes. Scatter diagrams need not always start at zero, but the chosen bounds must be defensible.");
  if(d.kind==="time"&&q.warnings.some(x=>x.code==="time-duplicate"))
   add("time-repeat","check","Repeated times","Decide whether these are independent repeated measurements, observations needing aggregation, or genuine simultaneous values.");
 }else if(type==="stat"){
  const q=statAnalysis(d);
  if(d.kind==="histogram"){
   add("hist-density","consider","Frequency is represented by area","Unequal class widths require frequency density (frequency ÷ class width) as bar height, not raw frequency. Review class boundaries and any gaps.");
   if(d.histogramInput==="raw"&&d.binWidth){
    add("hist-width","consider","Bin widths affect the apparent distribution","Explain why the width "+words(d.binWidth,40)+" suits your measurements and recording resolution; try a reasonable alternative to see whether the interpretation changes.");
   }else if(d.histogramInput==="table")add("grouped","consider","Already grouped data","Describe where the intervals and their frequencies came from; the individual measurements cannot be recovered from the table.");
  }else if(d.kind==="ogive"){
   add("ogive-estimates","consider","Quartiles are estimates from grouped classes",
    "Explain how cumulative totals were formed and that interpolation assumes the observations are reasonably distributed within each class. Comparing unequal sample sizes requires cumulative percentages.");
   if(d.curveShowPercentile)add("percentile-context","consider","Name the percentile's meaning",
    "Explain what the chosen percentile threshold means for the measured variable, and do not claim an exact raw-data percentile from grouped data.");
  }else if(d.kind==="polygon"){
   add("polygon-density","consider","Frequency polygons use midpoint and density",
    "Every point represents a class midpoint and frequency density, not an observed value. Reconsider smoothing, gaps and class-width choices before interpreting peaks.");
   if(d.polygonShowHistogram)add("polygon-overlay","consider","Check the overlay scale",
    "The polygon and its faint histogram use the same frequency-density scale. Explain why both help the reader, rather than duplicating the same visual information.");
  }else if(d.kind==="bar"){
   if(d.barStyle==="stacked100")
    add("bar-denominator","consider","100%-stacked category denominators",
     "Each bar divides the responses in its own category into percentages. Bar heights are equal by definition; use underlying category n to avoid misleading comparisons.");
   else if(d.barStyle==="stacked")
    add("bar-denominator","consider","Stacked counts and group sizes",
     "Each bar total combines observed counts across groups. Explain the group totals and whether comparison of raw category counts is appropriate.");
   else add("bar-denominator","consider",d.barMode==="percent"?"Explain group denominators":"Check comparable group sizes",
    d.barMode==="percent"?"Each group's displayed total is its denominator across categories, not each category's total.": 
    "Bar heights are raw counts and begin at zero. If group totals differ, within-group percentages may be fairer.");
  }else if(d.kind==="box")add("box-method","consider","Define quartiles and whiskers",
   "Keep the same quartile and whisker conventions across groups, report sample sizes and consider what possible outliers mean in context.");
  else add("dot-precision","consider","Check repeated values and measurement precision",
   "Repeated dots may reflect instrument rounding rather than genuinely identical outcomes. Check the original degree of accuracy.");
  if(q.warnings.some(x=>x.code==="small-sample"))
   add("small-n","check","Small samples","Quartiles from few observations may be unstable. Avoid broad population claims.");
  if(q.problems.some(x=>x.code==="zero-bar"))
   add("bar-zero","check","Bar-chart baseline","A frequency or percentage bar chart must start at zero or its lengths are misleading.");
 }else if(type==="trace"){
  add("tracer-scale","consider","Check image calibration","An image-to-coordinate scale is valid only under your chosen calibration assumptions. Identify reference lengths, units and any perspective distortion.");
  if(d.perspective==="unsure")add("photo-perspective","check","Perspective has not been considered","Explain whether the photographed plane was parallel to the camera and how this could affect traced lengths and angles.");
  if(d.limitations)add("photo-limits","consider","Revisit your own tracing limitation",words(d.limitations,220));
 }else if(type==="voronoi"){
  add("voronoi-metric","consider","Nearest means straight-line nearest","A Euclidean Voronoi construction compares planar distances, not road travel time, waiting time, demand or optimal service provision.");
  if(!d.metricConfirmed)add("voronoi-metric-check","check","Confirm the distance model","Explain the coordinate system and why straight-line distance is an appropriate first assumption.");
  if(d.sites?.some(s=>s.kind==="candidate"))add("voronoi-candidates","consider","Proposed sites are hypothetical","Distinguish proposed sites from existing sites and compare what the new cells establish, without treating them as proven optimal.");
 }else if(type==="table"){
  const q=analyzeTable(d);
  if(d.mode==="compact"){
   add("purpose","consider","Present selected information, not a data dump",
    "Include only rows needed to explain a mathematical decision. Whole raw datasets should remain in working files.");
   if(d.matrix?.length>8||d.columns?.length>5)
    add("table-size","check","The output is too large","Choose a focused summary, frequency table or diagram instead of shrinking the table to fit.");
   if(d.numberFormat==="fixed")add("precision","check","Display rounding needs justification",
    "Fixed decimals change how values appear, not the values used for calculations. Check that extra precision is not implied.");
  }else if(d.mode==="summary")add("summary","consider","Make numerical summaries meaningful",
   "Show each group's sample size n and a suitable measure of centre and spread. Do not compare spread measures with incompatible units.");
  else add("frequency","consider","Name the percentage denominator",
   "State the sample/population represented by each percentage. Recorded relative frequency is not necessarily a theoretical probability.");
  if(q.warnings.some(x=>x.code==="missing-observations"))
   add("missing","check","Some observations are missing","Describe the reason for missing values and how the reported n was calculated.");
 }
 if(source==="secondary"&&!cell(d.sourceText||d.sourceCredit))
  add("credit","check","Give the original source","Credit the original publisher/dataset and relevant date, not just the website used to find it.");
 const planned=p.dataSource||"";
 if(source==="primary"&&planned==="secondary"||source==="secondary"&&planned==="primary")
  add("source-shift","consider","Planning and actual source differ","Your source changed since Planning. That is allowed; explain what was actually used and why.");
 if((f.samplingMethod||p.primarySamplingMethod)&&source==="primary")
  add("representativeness","consider","Sampling constrains generalisation","Explain how "+words(f.samplingMethod||p.primarySamplingMethod,90)+
   " affected which sampling units could be included and what conclusions are justified.");
 if(f.dataCleaning)add("cleaning","consider","Exclusions and cleaning need a reason",
  "Your earlier note about cleaning/missing data is relevant. Explain how exclusions could change the displayed pattern or summary.");
 const accuracy=relevantAccuracySparks(state,d);
 if((accuracy.recorded.length||accuracy.planned.length)&&type!=="table")
  add("resolution","consider","Carry measurement precision into interpretation",
   "Revisit the relevant "+(accuracy.recorded.length?"recorded":"planned")+" accuracy decision when quoting results. Do not add unsupported decimal places or assume ±half a division without checking the device.");
 return items.slice(0,5);
}
export function figureCaption(state,type,draft){
 const d=draft||{},prefix=type==="table"?"Table":"Figure",
  number=words(type==="table"?d.number:d.figureNumber,6),
  title=words(d.title,110),
  note=words(type==="table"||type==="voronoi"?d.note:d.caption,320);
 let citation="";
 if(type==="graph"&&d.kind==="function")citation="Mathematical function drawn over the stated domain; not observed data.";
 else if(sourceType(d)==="primary")citation="Source: own collected measurements (describe collection in the IA).";
 else if(sourceType(d)==="secondary")citation="Source: "+(words(d.sourceText||d.sourceCredit,400)||"[add original image or dataset citation]");
 else if(sourceType(d)==="theoretical")citation="Calculated/theoretical construction; assumptions stated in the IA.";
 else citation="Source: [confirm the actual source before submission]";
 return [prefix+" "+(number||"[number]")+". "+(title||"[add a descriptive title]"),
  note,type==="stat"?statMethodNote(d):"",citation].filter(Boolean).join("\n");
}
export function handoverQuestions(state,type,draft){
 const p=planFields(state),f=confirmedFields(state),aim=currentAim(state),
  subject=words(draft?.title,75)||"this representation";
 const purpose=f.firstPurpose||f.firstOutputIntroduction||p.figurePurpose||"";
 const method=type==="graph"?draft?.kind==="scatter"?"paired-variable inspection":
  draft?.kind==="time"?"time-series inspection":"the chosen mathematical model":
  type==="stat"?{histogram:"distribution and class intervals",ogive:"cumulative frequency and estimated percentiles",
   polygon:"frequency densities at class midpoints",box:"centre, spread and possible outliers",
   dot:"distribution of repeated and distinct values",bar:"category counts or proportions"}[draft?.kind]||"statistical display":
  type==="trace"?"calibrated coordinates extracted from an image":
  type==="voronoi"?"nearest-site regions under a straight-line distance assumption":
  {compact:"selected numerical results",summary:"summary statistics",frequency:"observed category frequencies"}[draft?.mode]||"mathematical results";
 const limitation=type==="graph"&&draft?.kind==="function"?"Which assumptions and feasible domain restrict this model?":
  type==="stat"&&draft?.kind==="bar"?"How do group sizes and percentage denominators affect the comparison?":
  type==="stat"&&draft?.kind==="histogram"?"How do class widths and measurement resolution affect the apparent shape?":
  type==="stat"&&draft?.kind==="ogive"?"How does within-class interpolation limit these estimated quartiles and percentiles?":
  type==="stat"&&draft?.kind==="polygon"?"How would different class widths change the plotted midpoints or density peaks?":
  type==="trace"?"How might calibration error, resolution or perspective change the traced coordinates?":
  type==="voronoi"?"How would roads, obstacles, distance metrics or the choice of sites change nearest-site regions?":
  type==="table"?"Are these the smallest set of results needed, with justified precision?":
  "How could sampling, measurement accuracy, data exclusions or model assumptions change the conclusion?";
 return {
  before:"Before "+subject+", explain why "+method+" helps address "+(aim?"your aim (“"+aim+"”)":"your stated aim")+
   (purpose?". Link this to your saved starting question: "+words(purpose,170):"."),
  after:"After the figure or table, identify a specific feature actually visible in your own values; quantify it where appropriate, then explain what it contributes to your aim.",
  limitation,
  next:"What further calculation, comparison or model would logically follow from the actual result — or is this evidence enough? Do not invent a finding or a next step."
 };
}
