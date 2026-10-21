/**
 * Source-grounded, small-step reading cues for statistical diagrams.
 * Observations are descriptive, not pre-written IA interpretations.
 * No synthetic data, invented hypothesis, significance or causal claims.
 */
import {statAnalysis} from "./stat-studio-core.js";
import {formatBoxNumber} from "./box-analysis.js";

const num=value=>Number.isFinite(value)?formatBoxNumber(value):"not available";
const axis=d=>d.unitMode==="unit"&&d.unit.trim()?" "+d.unit.trim():"";
const interval=(b,d)=>"["+num(b.low)+", "+num(b.high)+")"+axis(d);
const missing=new Set(["histogram-data","histogram-empty","histogram-n","invalid-values",
 "observations","series","bar-data","categories","data","pending","dot-crowded",
 "dot-stack","cropped-classes","cropped-points","cropped-bars","ogive-data",
 "polygon-data","percentile","compare-groups","compare-grouped","compare-limit"]);
export function statReadingGuide(raw){
 const q=statAnalysis(raw),d=q.draft,r=q.result||{};
 const base={kind:d.kind,
  question:"Which specific feature of these results helps answer your investigation's aim?",
  next:"Name one relevant sampling, measurement or modelling limitation before drawing a conclusion.",
  observation:"Enter and check your actual data to see a descriptive observation here.",
  caution:"A plotted pattern is evidence to investigate, not proof of an explanation.",
  valid:false};
 if(q.problems.some(p=>missing.has(p.code)))return base;
 if(d.kind==="histogram"){
  const groups=r.series||[],compared=groups.length>1;
  const top=(r.bins||[]).reduce((best,b)=>!best||b.density>best.density?b:best,null);
  const statement=compared?
   groups.length+" distributions use the same class boundaries. Sample sizes: "+
    groups.map(g=>g.name+" n="+g.n).join("; ")+"."
   :top?"One of the highest frequency-density classes is "+interval(top,d)+
    ", containing "+top.frequency+" observation(s).":"Complete the continuous intervals.";
  return {...base,valid:true,observation:statement,
   question:"Compare the shape, centre and spread as appropriate. Does a different reasonable class width change the apparent pattern?",
   caution:compared?"Each group's area is normalised to 1; compare relative-frequency densities, not unscaled heights.":
    "Bar area (not just height) represents frequency. Class width and instrument resolution can change the impression."};
 }
 if(d.kind==="ogive"){
  const curves=r.curves||[],statement=curves.map(g=>
   g.name+": estimated median ≈ "+num(g.curve?.estimates?.median)+axis(d)+" (n="+g.n+")").join("; ");
  return {...base,valid:true,observation:statement||"Cumulative totals come from the supplied class counts.",
   question:"Which estimated percentile or difference between cumulative curves is useful for your aim?",
   caution:"These are estimates from linear interpolation within grouped intervals, not exact raw-data quartiles."};
 }
 if(d.kind==="polygon"){
  const polygon=r.polygons||[];
  const statements=polygon.map(g=>{
   const m=g.polygon?.points?.reduce((best,p)=>!best||p.y>best.y?p:best,null);
   return m?g.name+": a highest-density class midpoint is "+num(m.x)+axis(d)+
    " (frequency "+m.frequency+")":"";
  }).filter(Boolean).join("; ");
  return {...base,valid:true,observation:statements,
   question:"Is the overall shape consistent across groups, or does another sensible grouping change the pattern?",
   caution:"A polygon joins class midpoints, not raw observations; density is needed for unequal widths."};
 }
 if(d.kind==="box"){
  const groups=r.series||[];
  const details=groups.map(g=>g.box?
    g.name+": median "+num(g.box.median)+axis(d)+", IQR "+num(g.box.iqr)+axis(d)+
     " (n="+g.box.n+", "+g.box.outliers.length+" flagged)":"").filter(Boolean);
  return {...base,valid:true,observation:details.join("; "),
   question:"Compare the medians, IQRs and flagged observations, and decide which differences matter for your aim.",
   caution:"Quartile convention and whisker rule must be stated. Flagged values are not automatically errors or exclusions."};
 }
 if(d.kind==="dot"){
  const groups=r.series||[];
  const details=groups.map(g=>{
   const counts=new Map();for(const v of g.values||[])counts.set(v,(counts.get(v)||0)+1);
   const max=Math.max(0,...counts.values());
   return g.name+": n="+(g.values?.length||0)+", "+counts.size+
    " distinct measured value(s), largest repeat count "+max;
  });
  return {...base,valid:true,observation:details.join("; "),
   question:"Describe clustering, repeated readings and variation in the context of the precision of your instrument.",
   caution:"Repeated identical recorded values might reflect rounding; never infer that they are exactly equal measurements."};
 }
 if(d.kind==="bar"){
  const rows=r.categories||[];
  const top=rows.reduce((a,b)=>!a||b.categoryTotal>a.categoryTotal?b:a,null);
  return {...base,valid:true,observation:top?"A category with the highest underlying combined count is "+
    top.category+" ("+top.categoryTotal+"). Group sample sizes: "+(r.totals||[]).join(", ")+".":"Enter categorical counts.",
   question:"Does comparing actual counts or the appropriate within-group/category percentages better answer your aim?",
   caution:d.barStyle==="stacked100"?"Each bar's denominator is its category total; equal 100% bar heights do not mean equal sample sizes.":
    d.barStyle==="stacked"?"Stacked heights sum counts across groups; keep the group denominators visible.":
    d.barMode==="percent"?"Percentages use each group's total, not each category's total.":
    "Count comparisons between unequal sample sizes can mislead; consider appropriate proportions."};
 }
 return base;
}

/** Brief, reusable methodological note for student-provided captions and exports. */
export function statMethodNote(raw){
 const d=statAnalysis(raw).draft;
 if(d.kind==="box")return "Quartiles: "+(d.quartileRule==="halves"?"median of halves":"linear interpolation")+
  "; possible outliers: "+d.outlierRule+"; whiskers: "+d.whiskerMode+".";
 if(d.kind==="ogive")return "Cumulative "+(d.curveCompare==="multiple"?"percentages":"frequency / percentages")+
  "; quartiles and percentiles estimated by within-class interpolation.";
 if(d.kind==="polygon")return "Class-midpoint polygon using "+(d.curveCompare==="multiple"?"relative ":"")+"frequency density.";
 if(d.kind==="histogram")return "Histogram with frequency-density heights, class width "+(d.binWidth||"from supplied intervals")+
  (d.histogramCompare==="single"?"":"; shared comparison class boundaries")+".";
 if(d.kind==="bar")return d.barStyle==="stacked100"?"100%-stacked; percentages of each category.":
  d.barStyle==="stacked"?"Stacked counts; category totals shown.":
  d.barMode==="percent"?"Grouped; percentages of each group's total.":"Grouped observed counts; zero baseline.";
 if(d.kind==="dot")return "Individual observations"+(d.dotMode==="counted"?" shown as counted repeated values.":".");
 return "";
}
