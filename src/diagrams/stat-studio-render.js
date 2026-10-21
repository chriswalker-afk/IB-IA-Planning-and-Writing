/** Responsive, white-background, IA-printable statistical diagrams. */
import {escapeGraph} from "./graph-core.js";
import {statAnalysis} from "./stat-studio-core.js";
import {svgDiagramText,diagramUnitPower,diagramSafeExcerpt} from "./diagram-notation.js";
const W=960,H=630,LEFT=119,RIGHT=47,TOP=102,PH=394,PW=W-LEFT-RIGHT;
const E=escapeGraph;
const fmt=(v,d=3)=>Number(v.toFixed(d)).toString();
const number=x=>typeof x==="number"&&Number.isFinite(x);
function tickStep(span,target=6){
 if(!number(span)||span<=0)return 1;
 const b=10**Math.floor(Math.log10(span/target)),m=span/target/b;
 return b*(m<=1?1:m<=2?2:m<=2.5?2.5:m<=5?5:10);
}
function ticks(low,high){
 const step=tickStep(high-low),start=Math.ceil((low-1e-10*step)/step)*step;
 const result=[];for(let k=0;k<30;k++){const v=start+k*step;if(v>high+step/1e8)break;result.push(Number(v.toPrecision(12)));}
 return result;
}
const tag=(text,x,y,options="",maxWidth=Infinity)=>svgDiagramText(text,x,y,options,{maxWidth});
const line=(x1,y1,x2,y2,options="")=>'<line x1="'+fmt(x1,2)+'" y1="'+fmt(y1,2)+'" x2="'+fmt(x2,2)+'" y2="'+fmt(y2,2)+'" '+options+'/>';
const axisLabel=(d,orientation)=>{
 const unit=d.unitMode==="unit"&&d.unit.trim()?" ("+d.unit+")":"";
 return orientation==="x"?(d.variable||"Value")+unit:"Group";
};
function base(d,subtitle){
 const parts=['<svg xmlns="http://www.w3.org/2000/svg" class="stat-figure-svg" role="img" aria-label="'+E(d.title||"Student statistics diagram")+'" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'">',
  '<rect width="'+W+'" height="'+H+'" fill="#fff"/>',
  tag(d.title||"Statistical diagram",W/2,38,'font-size="21" font-family="Arial,sans-serif" font-weight="700" text-anchor="middle" fill="#243e49"',870),
  tag(subtitle,W/2,66,'font-size="13" font-family="Arial,sans-serif" text-anchor="middle" fill="#57717b"'),
  '<rect x="'+LEFT+'" y="'+TOP+'" width="'+PW+'" height="'+PH+'" fill="#fcfdfd" stroke="#b8cbd0" stroke-width="1.3"/>'];
 return parts;
}
function footer(d,parts,method=""){
 const source=d.sourceKind==="secondary"?"Source: "+(d.sourceText||"not supplied"):d.sourceKind==="primary"?"Source: student's collected data":d.sourceKind==="theoretical"?"Source: theoretical / student-constructed values (not measurements)":"Source not yet confirmed";
 if(method)parts.push(tag(method,W/2,H-64,'font-family="Arial,sans-serif" font-size="12" fill="#536b75" text-anchor="middle"'));
 parts.push(tag(diagramSafeExcerpt(source,140),W/2,H-37,'font-family="Arial,sans-serif" font-size="12" fill="#536b75" text-anchor="middle"',860));
 if(d.caption.trim())parts.push(tag(diagramSafeExcerpt(d.caption,135),W/2,H-17,'font-family="Arial,sans-serif" font-size="11" fill="#697981" text-anchor="middle"',860));
 parts.push("</svg>");
 return parts.join("");
}
function horizontalNumeric(parts,low,high,label,grid=true){
 const X=x=>LEFT+PW*(x-low)/(high-low);
 for(const t of ticks(low,high)){
  const px=X(t);
  if(grid)parts.push(line(px,TOP,px,TOP+PH,'stroke="#e1eaed" stroke-width="1"'));
  parts.push(line(px,TOP+PH,px,TOP+PH+6,'stroke="#38535e" stroke-width="1.5"'));
  parts.push(tag(fmt(t,6),px,TOP+PH+26,'font-family="Arial,sans-serif" font-size="12" fill="#36515e" text-anchor="middle"'));
 }
 parts.push(tag(label,LEFT+PW/2,H-86,'font-family="Arial,sans-serif" font-size="17" font-weight="700" fill="#294956" text-anchor="middle"',PW-40));
 return X;
}
function verticalNumeric(parts,max,label,grid=true){
 const yMax=max>0?max:1;
 const Y=y=>TOP+PH-(y/yMax)*PH;
 for(const t of ticks(0,yMax)){
  const py=Y(t);
  if(grid)parts.push(line(LEFT,py,LEFT+PW,py,'stroke="#e1eaed" stroke-width="1"'));
  parts.push(line(LEFT-6,py,LEFT,py,'stroke="#38535e" stroke-width="1.5"'));
  parts.push(tag(fmt(t,6),LEFT-12,py+4,'font-family="Arial,sans-serif" font-size="12" fill="#36515e" text-anchor="end"'));
 }
 parts.push(tag(label,37,TOP+PH/2,'transform="rotate(-90 37 '+(TOP+PH/2)+')" font-family="Arial,sans-serif" font-size="17" font-weight="700" fill="#294956" text-anchor="middle"',PH-30));
 return Y;
}
function niceUpper(n){const step=tickStep(n||1);return Math.max(step,Math.ceil(n/step+1e-8)*step);}
function paddedRange(min,max){
 const span=max-min,margin=span>0?span*.10:Math.max(.5,Math.abs(min)*.15,1);
 return [min-margin,max+margin];
}
function histogram(q){
 const {draft:d,result:r,override}=q,bins=r.bins||[];
 const total=bins.reduce((s,b)=>s+b.frequency,0),parts=base(d,"Frequency density represents frequency ÷ class width   ·   n = "+total);
 const min=override?override[0]:(bins.length?Math.min(...bins.map(x=>x.low)):0);
 const max=override?override[1]:(bins.length?Math.max(...bins.map(x=>x.high)):10);
 const xrange=max>min?[min,max]:[0,10],X=horizontalNumeric(parts,...xrange,axisLabel(d,"x"),d.showGrid);
 const yHigh=niceUpper(Math.max(.1,...bins.map(b=>b.density))*1.10);
 // Frequency is a count; dividing by a measured class width gives reciprocal units.
 const densityUnit=d.unitMode==="unit"&&d.unit.trim()?
   " ("+diagramUnitPower(d.unit,-1)+")":"";
 const Y=verticalNumeric(parts,yHigh,"Frequency density"+densityUnit,d.showGrid);
 parts.push('<defs><clipPath id="stat-histo-clip"><rect x="'+LEFT+'" y="'+TOP+'" width="'+PW+'" height="'+PH+'"/></clipPath></defs><g clip-path="url(#stat-histo-clip)">');
 for(const b of bins){
  const x=X(b.low),right=X(b.high),top=Y(b.density),width=Math.max(0,right-x);
  parts.push('<rect x="'+fmt(x)+'" y="'+fmt(top)+'" width="'+fmt(width)+'" height="'+fmt(Y(0)-top)+'" fill="#58a19d" fill-opacity=".83" stroke="#23586b" stroke-width="1.5"/>');
  if(d.showLabels&&width>45&&b.frequency>0)
   parts.push(tag(String(b.frequency),x+width/2,Math.max(TOP+14,top-7),'font-size="12" font-family="Arial,sans-serif" fill="#284953" font-weight="700" text-anchor="middle"'));
 }
 parts.push('</g>');
 return footer(d,parts,"Bars touch only for adjacent classes. Displayed bar labels give frequencies, not densities.");
}
function boxes(q){
 const {draft:d,result:r,override}=q,series=r.series||[];
 const values=series.flatMap(s=>s.values);
 const range=override||paddedRange(values.length?Math.min(...values):0,values.length?Math.max(...values):1);
 const parts=base(d,"Five-number summaries with "+(d.quartileRule==="halves"?"median-of-halves":"linear-interpolated")+" quartiles   ·   "+series.length+" group(s)");
 const X=horizontalNumeric(parts,...range,axisLabel(d,"x"),d.showGrid);
 const space=PH/Math.max(1,series.length),colors=["#248779","#457cb5","#a7668b","#b18c3b","#6b73b5"];
 for(let i=0;i<series.length;i++){
  const s=series[i],v=s.box;if(!v)continue;
  const y=TOP+space*(i+.5),height=Math.min(44,space*.53),color=colors[i%colors.length];
  parts.push(line(X(v.lowWhisker),y,X(v.highWhisker),y,'stroke="'+color+'" stroke-width="3"'));
  for(const n of [v.lowWhisker,v.highWhisker])
   parts.push(line(X(n),y-height*.37,X(n),y+height*.37,'stroke="'+color+'" stroke-width="2.8"'));
  parts.push('<rect x="'+fmt(X(v.q1))+'" y="'+fmt(y-height/2)+'" width="'+fmt(Math.max(1,X(v.q3)-X(v.q1)))+'" height="'+fmt(height)+'" fill="'+color+'" fill-opacity=".30" stroke="'+color+'" stroke-width="2.6"/>');
  parts.push(line(X(v.median),y-height/2,X(v.median),y+height/2,'stroke="#2a324d" stroke-width="3.4"'));
  if(d.showOutliers)for(const n of v.outliers){
   parts.push('<circle cx="'+fmt(X(n))+'" cy="'+fmt(y)+'" r="5" fill="#fff" stroke="'+color+'" stroke-width="2.2"/>');
  }
  const text=s.name.length>24?diagramSafeExcerpt(s.name,25):s.name;
  parts.push(tag(text,LEFT-12,y-3,'font-family="Arial,sans-serif" font-size="13" fill="#294952" font-weight="700" text-anchor="end"'));
  parts.push(tag("n = "+v.n,LEFT-12,y+13,'font-family="Arial,sans-serif" font-size="11" fill="#637983" text-anchor="end"'));
  if(d.showLabels)parts.push(tag("Median "+fmt(v.median,4),LEFT+PW-2,y-height/2-7,
   'font-family="Arial,sans-serif" font-size="11" fill="#546e75" text-anchor="end"'));
 }
 return footer(d,parts,d.outlierRule==="tukey"?
  "Whiskers show non-outlier extremes; separate circles mark points beyond 1.5 × IQR.":
  "Whiskers show actual minimum and maximum; no outlier identification requested.");
}
function dots(q){
 const {draft:d,result:r,override}=q,series=r.series||[];
 const values=series.flatMap(s=>s.values);
 const range=override||paddedRange(values.length?Math.min(...values):0,values.length?Math.max(...values):1);
 const parts=base(d,"Dot plot shows individual measured observations, without joining points");
 const X=horizontalNumeric(parts,...range,axisLabel(d,"x"),d.showGrid);
 const space=PH/Math.max(1,series.length),colors=["#208879","#5074b1","#a35e91","#b28c34","#6f7bb2"];
 series.forEach((s,i)=>{
  const y0=TOP+(i+1)*space-Math.max(12,space*.19),color=colors[i%colors.length];
  parts.push(line(LEFT,y0+5,LEFT+PW,y0+5,'stroke="#afc3c8" stroke-width="1" stroke-dasharray="3 5"'));
  const counts=new Map();
  for(const value of s.values)counts.set(value,(counts.get(value)||0)+1);
  for(const [v,n] of [...counts.entries()].sort((a,b)=>a[0]-b[0]))
   for(let k=0;k<n;k++){
    const radius=Math.max(2.8,Math.min(5,space/(2*(n+1))));
    parts.push('<circle cx="'+fmt(X(v))+'" cy="'+fmt(y0-k*radius*2.22)+'" r="'+fmt(radius)+'" stroke="#fff" stroke-width="1" fill="'+color+'"/>');
   }
  parts.push(tag(s.name.length>24?diagramSafeExcerpt(s.name,25):s.name,LEFT-12,y0-space*.22,
   'font-size="12" font-weight="700" text-anchor="end" font-family="Arial,sans-serif" fill="#31515c"'));
  parts.push(tag("n = "+s.values.length,LEFT-12,y0-space*.22+16,
   'font-size="11" text-anchor="end" font-family="Arial,sans-serif" fill="#607984"'));
 });
 return footer(d,parts,"Each dot represents one observation. Duplicated values are stacked vertically.");
}
function bars(q){
 const {draft:d,result:r,override}=q,rows=r.categories||[],groups=r.names||[],totals=r.totals||[],
  maxObserved=Math.max(0,...rows.flatMap(c=>c.values));
 const Ymax=override?override[1]:d.barMode==="percent"?100:niceUpper(maxObserved*1.13);
 const parts=base(d,(d.barMode==="percent"?"Within-group proportions":"Observed group frequencies")+"   ·   "+
  groups.map((n,i)=>n+" (n="+totals[i]+")").join("   ·   "));
 const Y=verticalNumeric(parts,Ymax,d.barMode==="percent"?"Percentage of group (%)":"Frequency (count)",d.showGrid);
 const colors=["#348d81","#6182be","#b3698d","#b28c42"];
 const nCat=Math.max(1,rows.length),band=PW/nCat,usable=band*.78,groupW=usable/Math.max(1,groups.length);
 rows.forEach((cat,i)=>{
  const start=LEFT+i*band+(band-usable)/2;
  cat.values.forEach((v,j)=>{
   const x=start+j*groupW+.6,w=Math.max(1,groupW-1.2),top=Y(v);
   parts.push('<rect x="'+fmt(x)+'" y="'+fmt(top)+'" width="'+fmt(w)+'" height="'+fmt(Y(0)-top)+'" fill="'+colors[j%colors.length]+'" fill-opacity=".86" stroke="#fff" stroke-width=".6"/>');
   if(d.showLabels&&w>=26&&v>0)
    parts.push(tag(fmt(v,d.barMode==="percent"?1:0),x+w/2,Math.max(TOP+12,top-8),
     'font-family="Arial,sans-serif" font-size="11" fill="#334f58" text-anchor="middle"'));
  });
  const label=cat.category;
  if(label.length>21){
   parts.push(tag(diagramSafeExcerpt(label,20),LEFT+(i+.5)*band,TOP+PH+25,'font-family="Arial,sans-serif" font-size="12" fill="#34505d" text-anchor="middle"'));
  }else parts.push(tag(label,LEFT+(i+.5)*band,TOP+PH+25,'font-family="Arial,sans-serif" font-size="12" fill="#34505d" text-anchor="middle"'));
 });
 groups.forEach((g,i)=>{
  const start=LEFT+(i%2)*PW/2,yy=TOP+PH+61+Math.floor(i/2)*19;
  parts.push('<rect x="'+fmt(start)+'" y="'+fmt(yy-11)+'" width="13" height="13" rx="2" fill="'+colors[i%colors.length]+'"/>');
  parts.push(tag((g.length>39?diagramSafeExcerpt(g,39):g)+" (n="+totals[i]+")",start+21,yy,
   'font-family="Arial,sans-serif" font-size="12" fill="#31505c"'));
 });
 return footer(d,parts,"Categories are discrete; bar lengths begin at zero. "+(d.barMode==="percent"?"Each group totals 100%.":"Group denominators are shown in the legend."));
}
export function renderStatSvg(raw){
 const q=statAnalysis(raw);
 const renderer={histogram,box:boxes,dot:dots,bar:bars}[q.draft.kind];
 if(!q.ready){
  const parts=base(q.draft,"Working preview — complete the statistical diagram checks to export.");
  parts.push(tag("Add or correct your data and labels to see an IA-ready diagram",W/2,TOP+PH/2,
    'text-anchor="middle" font-family="Arial,sans-serif" font-size="17" fill="#687e85"'));
  // Show a preview when just metadata is missing, but never when mathematical data are invalid.
  if(!q.problems.some(p=>["histogram-data","histogram-empty","histogram-n","invalid-values","dot-stack","observations","series","bar-data",
    "categories","data","pending","dot-crowded","cropped-classes","cropped-points","cropped-bars"].includes(p.code)))return renderer(q);
  return footer(q.draft,parts);
 }
 return renderer(q);
}
