/** Responsive, white-background, IA-printable statistical diagrams. */
import {escapeGraph} from "./graph-core.js";
import {statAnalysis} from "./stat-studio-core.js";
import {svgDiagramText,diagramUnitPower,diagramSafeExcerpt} from "./diagram-notation.js";
import {formatBoxNumber} from "./box-analysis.js";
import {dotPlacement} from "./distribution-analysis.js";
const W=960,H=630,LEFT=119,RIGHT=47,TOP=102,PH=394,PW=W-LEFT-RIGHT;
const E=escapeGraph;
const fmt=(v,d=3)=>Number(v.toFixed(d)).toString();
// Significant figures preserve truthful axes for very small and very large measurements.
const axisTick=value=>Number(value.toPrecision(6)).toString();
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
function base(d,subtitle,canvasHeight=H,plotHeight=PH){
 const figureNumber=d.figureNumber.trim().replace(/^figure\s*/i,"").slice(0,24);
 const parts=['<svg xmlns="http://www.w3.org/2000/svg" class="stat-figure-svg" role="img" aria-label="'+E(d.title||"Student statistics diagram")+'" viewBox="0 0 '+W+' '+canvasHeight+'" width="'+W+'" height="'+canvasHeight+'">',
  '<title>'+E(d.title||"Statistical diagram")+'</title>',
  '<desc>'+E(subtitle)+'. Scale, sample sizes and source are shown; data-driven figures require statistical interpretation by the student.</desc>',
  '<rect width="'+W+'" height="'+canvasHeight+'" fill="#fff"/>',
  ...(figureNumber?[tag('Figure '+figureNumber,W/2,20,'class="stat-figure-number" font-size="12" font-family="Arial,sans-serif" font-weight="600" text-anchor="middle" fill="#526c71"',870)]:[]),
  tag(d.title||"Statistical diagram",W/2,figureNumber?45:38,'font-size="21" font-family="Arial,sans-serif" font-weight="700" text-anchor="middle" fill="#243e49"',870),
  tag(subtitle,W/2,figureNumber?72:66,'font-size="13" font-family="Arial,sans-serif" text-anchor="middle" fill="#57717b"'),
  '<rect x="'+LEFT+'" y="'+TOP+'" width="'+PW+'" height="'+plotHeight+'" fill="#fcfdfd" stroke="#b8cbd0" stroke-width="1.3"/>'];
 return parts;
}
function footer(d,parts,method="",canvasHeight=H){
 const source=d.sourceKind==="secondary"?"Source: "+(d.sourceText||"not supplied"):d.sourceKind==="primary"?"Source: student's collected data":d.sourceKind==="theoretical"?"Source: theoretical / student-constructed values (not measurements)":"Source not yet confirmed";
 if(method)parts.push(tag(method,W/2,canvasHeight-64,'font-family="Arial,sans-serif" font-size="12" fill="#536b75" text-anchor="middle"'));
 parts.push(tag(diagramSafeExcerpt(source,140),W/2,canvasHeight-37,'font-family="Arial,sans-serif" font-size="12" fill="#536b75" text-anchor="middle"',860));
 if(d.caption.trim())parts.push(tag(diagramSafeExcerpt(d.caption,135),W/2,canvasHeight-17,'font-family="Arial,sans-serif" font-size="11" fill="#697981" text-anchor="middle"',860));
 parts.push("</svg>");
 return parts.join("");
}
function horizontalNumeric(parts,low,high,label,grid=true,plotHeight=PH,canvasHeight=H,labelY=null){
 const X=x=>LEFT+PW*(x-low)/(high-low);
 for(const t of ticks(low,high)){
  const px=X(t);
  if(grid)parts.push(line(px,TOP,px,TOP+plotHeight,'stroke="#e1eaed" stroke-width="1"'));
  parts.push(line(px,TOP+plotHeight,px,TOP+plotHeight+6,'stroke="#38535e" stroke-width="1.5"'));
  parts.push(tag(axisTick(t),px,TOP+plotHeight+26,'font-family="Arial,sans-serif" font-size="12" fill="#36515e" text-anchor="middle"'));
 }
 parts.push(tag(label,LEFT+PW/2,labelY??canvasHeight-86,'font-family="Arial,sans-serif" font-size="17" font-weight="700" fill="#294956" text-anchor="middle"',PW-40));
 return X;
}
function verticalNumeric(parts,max,label,grid=true){
 const yMax=max>0?max:1;
 const Y=y=>TOP+PH-(y/yMax)*PH;
 for(const t of ticks(0,yMax)){
  const py=Y(t);
  if(grid)parts.push(line(LEFT,py,LEFT+PW,py,'stroke="#e1eaed" stroke-width="1"'));
  parts.push(line(LEFT-6,py,LEFT,py,'stroke="#38535e" stroke-width="1.5"'));
  parts.push(tag(axisTick(t),LEFT-12,py+4,'font-family="Arial,sans-serif" font-size="12" fill="#36515e" text-anchor="end"'));
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
 const {draft:d,result:r,override}=q,bins=r.bins||[],groups=r.series||[];
 const compared=d.histogramCompare!=="single"&&d.histogramInput==="raw"&&groups.length>1;
 const small=compared&&d.histogramCompare==="smallmultiples",extra=small?(groups.length-1)*270:0;
 const plotHeight=PH+extra,legendBelow=compared&&!small,canvasHeight=H+extra+(legendBelow?96:0);
 const total=r.total||bins.reduce((sum,b)=>sum+b.frequency,0);
 const parts=base(d,(compared?"Common class boundaries · "+groups.length+" groups":"Frequency density = frequency ÷ class width")+" · n = "+total,canvasHeight,plotHeight);
 const min=override?override[0]:(bins.length?Math.min(...bins.map(b=>b.low)):0);
 const max=override?override[1]:(bins.length?Math.max(...bins.map(b=>b.high)):10);
 const X=horizontalNumeric(parts,min,max>min?max:min+1,axisLabel(d,"x"),d.showGrid,plotHeight,canvasHeight,
  legendBelow?TOP+plotHeight+59:null);
 const densityUnit=d.unitMode==="unit"&&d.unit.trim()?" ("+diagramUnitPower(d.unit,-1)+")":"";
 const palette=["#248779","#457cb5","#a7668b","#b18c3b"];
 const drawn=compared?groups:[{name:d.variable,n:total,bins}];
 const useRelative=compared;
 const highest=Math.max(0,...drawn.flatMap(group=>group.bins.map(b=>useRelative?b.relativeDensity:b.density)));
 const commonY=niceUpper(Math.max(0.01,highest)*1.15);
 function drawPanel(group,index,lowY,highY,sharedY,showYAxis){
  const Y=value=>highY-(value/sharedY)*(highY-lowY);
  if(showYAxis){
   for(const v of ticks(0,sharedY)){
    const yy=Y(v);
    parts.push(line(LEFT,yy,LEFT+PW,yy,'stroke="#e4edef" stroke-width="1"'));
    parts.push(tag(fmt(v,5),LEFT-12,yy+4,'font-size="11" font-family="Arial,sans-serif" fill="#36515e" text-anchor="end"'));
   }
  }
  for(const bin of group.bins){
   const x=X(bin.low),width=Math.max(0,X(bin.high)-x),value=useRelative?bin.relativeDensity:bin.density;
   const top=Y(value),color=palette[index%palette.length],opacity=compared&&!small?.42:.82;
   parts.push('<rect x="'+fmt(x)+'" y="'+fmt(top)+'" width="'+fmt(width)+'" height="'+fmt(Math.max(0,highY-top))+'" fill="'+color+'" fill-opacity="'+opacity+'" stroke="'+color+'" stroke-width="1.3"><title>'+
    E(group.name+": ["+formatBoxNumber(bin.low)+", "+formatBoxNumber(bin.high)+") · frequency "+bin.frequency+
     " · density "+formatBoxNumber(bin.density)+(useRelative?" · relative density "+formatBoxNumber(bin.relativeDensity):""))+
    '</title></rect>');
   const label=d.histogramLabels==="none"?"":d.histogramLabels==="density"?fmt(bin.density,3):
    d.histogramLabels==="percentage"?fmt(100*bin.frequency/Math.max(1,group.n||total),1)+"%":String(bin.frequency);
   // Overlay bars compete for the same label space; the key and SVG tooltips retain exact values.
   if(d.showLabels&&!legendBelow&&label&&width>Math.max(38,label.length*7)&&bin.frequency>0){
    parts.push(tag(label,x+width/2,Math.max(lowY+16,top-6),
     'font-size="11" font-family="Arial,sans-serif" fill="#294953" text-anchor="middle"'));
   }
  }
 }
 if(small){
  const row=plotHeight/groups.length;
  groups.forEach((group,i)=>{
   const top=TOP+i*row+24,bottom=TOP+(i+1)*row-18;
   parts.push(tag(group.name+" (n="+group.n+")",LEFT+8,top-9,
    'font-size="13" font-weight="700" font-family="Arial,sans-serif" fill="'+palette[i%palette.length]+'"'));
   drawPanel(group,i,top,bottom,commonY,true);
  });
 }else{
  drawn.forEach((group,i)=>drawPanel(group,i,TOP,TOP+plotHeight,commonY,i===0));
  if(legendBelow){
   drawn.forEach((group,i)=>{
    const lx=LEFT+(i%2)*(PW/2),ly=TOP+plotHeight+86+Math.floor(i/2)*23;
    parts.push(line(lx,ly-4,lx+18,ly-4,'stroke="'+palette[i%palette.length]+'" stroke-width="4"'));
    parts.push(tag(diagramSafeExcerpt(group.name,25)+" (n="+group.n+")",lx+24,ly,
     'font-size="12" font-family="Arial,sans-serif" fill="#35535d"',PW/2-33));
   });
  }
 }
 const yName=(useRelative?"Relative-frequency density":"Frequency density")+
  (d.unitMode==="unit"&&d.unit.trim()?densityUnit:"");
 parts.push(tag(yName,34,TOP+plotHeight/2,
  'transform="rotate(-90 34 '+(TOP+plotHeight/2)+')" font-size="15" text-anchor="middle" font-family="Arial,sans-serif" fill="#294956"',plotHeight-22));
 return footer(d,parts,compared?"Shared half-open intervals, area gives each group's proportion.":"Area gives frequency; widths and density are not interchangeable.",canvasHeight);
}

function ogive(q){
 const {draft:d,result:r,override}=q,curves=r.curves||[];
 const bins=r.bins||[],bounds=bins.length?[bins[0].low,bins.at(-1).high]:[0,1];
 const range=override||paddedRange(...bounds),canvasHeight=H+120;
 const parts=base(d,"Cumulative frequency curve · "+
  (r.curveYMode==="percent"?"percentage of each sample":"number of observations"),canvasHeight);
 const X=horizontalNumeric(parts,...range,axisLabel(d,"x"),d.showGrid,PH,canvasHeight,TOP+PH+60);
 const maxY=r.curveYMode==="percent"?100:Math.max(1,...curves.map(g=>g.n));
 const Y=verticalNumeric(parts,maxY,r.curveYMode==="percent"?
  "Cumulative percentage (%)":"Cumulative frequency (count)",d.showGrid);
 const colors=["#248779","#457cb5","#a7668b","#b18c3b"],labels=[];
 for(const [index,group] of curves.entries()){
  const pts=group.curve.points||[],color=colors[index%colors.length];
  if(!pts.length)continue;
  const ordinate=p=>r.curveYMode==="percent"?p.percent:p.cumulative;
  parts.push('<path d="'+pts.map((p,i)=>(i?"L":"M")+fmt(X(p.x))+" "+fmt(Y(ordinate(p)))).join(" ")+
   '" fill="none" stroke="'+color+'" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>');
  for(const p of pts){
   parts.push('<circle cx="'+fmt(X(p.x))+'" cy="'+fmt(Y(ordinate(p)))+
    '" r="3.5" fill="#fff" stroke="'+color+'" stroke-width="1.6"><title>'+
    E("Up to "+formatBoxNumber(p.x)+": "+p.cumulative+" ("+formatBoxNumber(p.percent)+"%)")+'</title></circle>');
  }
  const targets=[];
  if(d.curveShowQuartiles)targets.push(["Q1",25,group.curve.estimates.q1],["Median",50,group.curve.estimates.median],["Q3",75,group.curve.estimates.q3]);
  if(d.curveShowPercentile&&Number.isFinite(Number(d.curvePercentile)))
   targets.push(["P"+d.curvePercentile,Number(d.curvePercentile),group.curve.estimates.percentile]);
  let hasNamedLabel=false;
  for(const [label,p,value] of targets){
   if(!Number.isFinite(value))continue;
   const x=X(value),y=Y(r.curveYMode==="percent"?p:p/100*group.n);
   if(d.curveGuides&&(curves.length===1||label==="Median")){
    parts.push(line(LEFT,y,x,y,'stroke="'+color+'" stroke-width="1" stroke-dasharray="4 4" opacity=".57"'));
    parts.push(line(x,y,x,TOP+PH,'stroke="'+color+'" stroke-width="1" stroke-dasharray="4 4" opacity=".57"'));
   }
   parts.push('<circle cx="'+fmt(x)+'" cy="'+fmt(y)+'" r="5" fill="#fff" stroke="'+color+'" stroke-width="2.1"><title>'+
    E(group.name+": "+label+" ≈ "+formatBoxNumber(value)+" (grouped interpolation)")+'</title></circle>');
   // A fixed two-column key is more readable than overlapping labels at nearby curve intersections.
   if(curves.length===1||label==="Median"){
    labels.push({color,text:(curves.length>1?diagramSafeExcerpt(group.name,19)+" · ":"")+
     label+" ≈ "+formatBoxNumber(value)+(curves.length>1?" (n="+group.n+")":"")});
    hasNamedLabel=true;
   }
  }
  if(curves.length>1&&!hasNamedLabel)
   labels.push({color,text:diagramSafeExcerpt(group.name,26)+" (n="+group.n+")"});
 }
 if(labels.length){
  parts.push('<rect x="'+LEFT+'" y="'+(TOP+PH+76)+'" width="'+PW+'" height="66" rx="8" fill="#f8fbfa" stroke="#dfebe7"/>');
  for(const [i,item] of labels.slice(0,8).entries()){
   const lx=LEFT+13+(i%2)*PW/2,ly=TOP+PH+99+Math.floor(i/2)*25;
   parts.push('<circle cx="'+lx+'" cy="'+(ly-4)+'" r="4" fill="'+item.color+'"/>');
   parts.push(tag(item.text,lx+13,ly,
    'font-size="12" font-family="Arial,sans-serif" fill="#294b58"',PW/2-32));
  }
 }
 return footer(d,parts,"Percentiles are estimated by linear interpolation within grouped class intervals.",canvasHeight);
}
function frequencyPolygons(q){
 const {draft:d,result:r,override}=q,groups=r.polygons||[],bins=r.bins||[];
 const range=override||paddedRange(bins.length?bins[0].low:0,bins.length?bins.at(-1).high:1);
 const compare=groups.length>1;
 const parts=base(d,"Frequency polygon · class midpoints · "+(compare?"relative-frequency density":"frequency density"));
 const X=horizontalNumeric(parts,...range,axisLabel(d,"x"),d.showGrid);
 const high=Math.max(.001,...groups.flatMap(group=>(group.polygon.points||[]).map(p=>p.y)));
 const ymax=niceUpper(high*1.12);
 const Y=verticalNumeric(parts,ymax,(compare?"Relative-frequency density":"Frequency density")+
  (d.unitMode==="unit"&&d.unit.trim()?" ("+diagramUnitPower(d.unit,-1)+")":""),d.showGrid);
 const colors=["#248779","#457cb5","#a7668b","#b18c3b"];
 if(d.polygonShowHistogram&&groups.length===1){
  const group=groups[0];
  for(const b of group.bins){
   const x=X(b.low),w=X(b.high)-x,top=Y(b.density);
   parts.push('<rect x="'+fmt(x)+'" y="'+fmt(top)+'" width="'+fmt(w)+'" height="'+fmt(Y(0)-top)+
    '" fill="#82b3ab" fill-opacity=".22" stroke="#7da4a4" stroke-width="1"/>');
  }
 }
 groups.forEach((group,i)=>{
  const color=colors[i%colors.length],points=group.polygon.points||[];
  const segments=[];let current=[];
  for(const p of points){
   if(p.gapBefore&&current.length){segments.push(current);current=[];}
   current.push(p);
  }
  if(current.length)segments.push(current);
  for(const segment of segments){
   parts.push('<path d="'+segment.map((p,j)=>(j?"L":"M")+fmt(X(p.x))+" "+fmt(Y(p.y))).join(" ")+
    '" fill="none" stroke="'+color+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>');
  }
  for(const p of points){
   if(d.polygonShowPoints)parts.push('<circle cx="'+fmt(X(p.x))+'" cy="'+fmt(Y(p.y))+'" r="4.5" fill="#fff" stroke="'+color+'" stroke-width="2"><title>'+
    E("Midpoint "+formatBoxNumber(p.x)+" · frequency "+p.frequency+" · density "+formatBoxNumber(p.density))+'</title></circle>');
   if(d.polygonShowValues&&d.showLabels){
    const value=compare?p.y:p.density;
    parts.push(tag(formatBoxNumber(value),Math.max(LEFT+30,Math.min(LEFT+PW-30,X(p.x))),Math.max(TOP+12,Y(p.y)-11),
     'font-family="Arial,sans-serif" font-size="11" font-weight="600" text-anchor="middle" fill="'+color+'"'));
   }
  }
  if(compare){
   const lx=LEFT+(i%2)*PW/2,ly=TOP+17+Math.floor(i/2)*19;
   parts.push(line(lx,ly-4,lx+19,ly-4,'stroke="'+color+'" stroke-width="3"'));
   parts.push(tag(diagramSafeExcerpt(group.name,24)+" (n="+group.n+")",lx+25,ly,
    'font-family="Arial,sans-serif" font-size="12" fill="#34535b"'));
  }
 });
 return footer(d,parts,compare?"Each group has area 1 under its density histogram.":"Only observed class midpoints are joined; gaps are not bridged.");
}
function boxes(q){
 const {draft:d,result:r,override}=q,series=r.series||[];
 const values=series.flatMap(s=>s.values),outMethod={
  tukey:"1.5 × IQR",extreme:"3 × IQR",zscore:"Z-score",
  modified:"modified Z-score",none:"none",minmax:"none (legacy)"
 }[d.outlierRule]||"1.5 × IQR";
 const range=override||paddedRange(values.length?Math.min(...values):0,values.length?Math.max(...values):1);
 const number=v=>formatBoxNumber(v,d.boxPrecision),colors=["#248779","#457cb5","#a7668b","#b18c3b","#6b73b5"];
 const clamp=(value,lo,hi)=>Math.min(hi,Math.max(lo,value));
 const xCoord=value=>LEFT+PW*(value-range[0])/(range[1]-range[0]);
 const groups=series.map((s,i)=>{
  const box=s.box,items=[],seen=new Map();
  if(!box)return {s,i,items:[],lanes:0,omitted:0};
  const add=(value,label)=>{
   if(!number(value)||!Number.isFinite(value))return;
   // Values shared by several markers get one combined label, not overlapping duplicates.
   const id=String(value);
   if(seen.has(id)){seen.get(id).label+=" / "+label;return;}
   const next={value,label,pointX:xCoord(value)};items.push(next);seen.set(id,next);
  };
  if(d.showLabels){
   if(d.showBoxQuartiles){add(box.q1,"Q1 "+number(box.q1));add(box.q3,"Q3 "+number(box.q3));}
   if(d.showBoxMedian)add(box.median,"Median "+number(box.median));
   if(d.showBoxExtremes){add(box.min,"Min "+number(box.min));add(box.max,"Max "+number(box.max));}
   if(d.showBoxWhiskers){
    add(box.lowWhisker,"Whisker "+number(box.lowWhisker));
    add(box.highWhisker,"Whisker "+number(box.highWhisker));
   }
   if(d.showBoxOutlierValues&&d.showOutliers){
    const unique=[...new Set(box.outliers)];
    // Annotations are capped to preserve IA readability; the full set remains in the calculations.
    const shown=unique.length>8?[...unique.slice(0,4),...unique.slice(-4)]:unique;
    shown.forEach(value=>add(value,"Flag "+number(value)));
   }
   if(d.showBoxFences&&box.limits){
    box.limits.forEach((v,index)=>{
     if(v>=range[0]&&v<=range[1])add(v,(index?"Upper":"Lower")+" limit "+number(v));
    });
   }
  }
  items.sort((a,b)=>a.pointX-b.pointX);
  const lanes=[];
  for(const item of items){
   const textWidth=Math.min(194,Math.max(36,item.label.length*6.5));
   const x=clamp(item.pointX,LEFT+textWidth/2+4,LEFT+PW-textWidth/2-4);
   const interval=[x-textWidth/2-5,x+textWidth/2+5];
   let lane=lanes.findIndex(used=>used.every(([start,end])=>interval[1]<start||interval[0]>end));
   if(lane<0){lane=lanes.length;lanes.push([]);}
   lanes[lane].push(interval);
   item.labelX=x;item.lane=lane;
  }
  return {s,i,items,lanes:lanes.length,omitted:d.showBoxOutlierValues&&d.showOutliers?Math.max(0,new Set(box.outliers).size-8):0};
 });
 const maxLanes=Math.max(0,...groups.map(x=>x.lanes));
 const rowHeight=Math.max(86,48+Math.ceil(maxLanes/2)*36);
 const plotHeight=Math.max(PH,series.length*rowHeight);
 const canvasHeight=H+plotHeight-PH;
 const parts=base(d,"Quartiles: "+(d.quartileRule==="halves"?"median-of-halves":"linear-interpolated")+
  "   ·   screening: "+outMethod+"   ·   "+series.length+" group(s)",canvasHeight,plotHeight);
 const X=horizontalNumeric(parts,...range,axisLabel(d,"x"),d.showGrid,plotHeight,canvasHeight);
 const space=plotHeight/Math.max(1,series.length);
 let someOmitted=false;
 for(const group of groups){
  const {s,i,items}=group,v=s.box;
  if(!v)continue;
  const y=TOP+space*(i+.5),height=Math.min(42,space*.43),color=colors[i%colors.length];
  parts.push(line(X(v.lowWhisker),y,X(v.highWhisker),y,'stroke="'+color+'" stroke-width="3"'));
  for(const n of [v.lowWhisker,v.highWhisker])
   parts.push(line(X(n),y-height*.37,X(n),y+height*.37,'stroke="'+color+'" stroke-width="2.8"'));
  if(d.showBoxFences&&v.limits)for(const n of v.limits){
   if(n<range[0]||n>range[1])continue;
   parts.push(line(X(n),y-height*.77,X(n),y+height*.77,
    'stroke="'+color+'" stroke-width="1.5" stroke-dasharray="4 4" opacity=".72"'));
  }
  parts.push('<rect x="'+fmt(X(v.q1))+'" y="'+fmt(y-height/2)+
   '" width="'+fmt(Math.max(1,X(v.q3)-X(v.q1)))+'" height="'+fmt(height)+
   '" fill="'+color+'" fill-opacity=".30" stroke="'+color+'" stroke-width="2.6"/>');
  parts.push(line(X(v.median),y-height/2,X(v.median),y+height/2,
   'stroke="#2a324d" stroke-width="3.4"'));
  if(d.showBoxMean){
   const mx=X(v.mean),size=6;
   parts.push('<path d="M '+fmt(mx)+' '+fmt(y-size)+' L '+fmt(mx+size)+' '+fmt(y)+
    ' L '+fmt(mx)+' '+fmt(y+size)+' L '+fmt(mx-size)+' '+fmt(y)+
    ' Z" fill="#fff" stroke="#344252" stroke-width="2"><title>Mean '+E(number(v.mean))+'</title></path>');
  }
  if(d.showOutliers){
   const counts=new Map();
   for(const value of v.outliers)counts.set(value,(counts.get(value)||0)+1);
   for(const [value,count] of counts){
    for(let j=0;j<count;j++){
     const jitter=j===0?0:(j%2?1:-1)*Math.ceil(j/2)*7;
     parts.push('<circle cx="'+fmt(X(value))+'" cy="'+fmt(y+jitter)+
      '" r="5" fill="#fff" stroke="'+color+'" stroke-width="2.2"><title>'+
      E("Flagged observation: "+number(value))+'</title></circle>');
    }
   }
  }
  const text=s.name.length>24?diagramSafeExcerpt(s.name,25):s.name;
  parts.push(tag(text,LEFT-12,y-3,
   'font-family="Arial,sans-serif" font-size="13" fill="#294952" font-weight="700" text-anchor="end"'));
  parts.push(tag("n = "+v.n,LEFT-12,y+13,
   'font-family="Arial,sans-serif" font-size="11" fill="#637983" text-anchor="end"'));
  for(const item of items){
   const upper=item.lane%2===0,level=Math.floor(item.lane/2);
   const labelY=upper?y-height/2-13-level*18:y+height/2+18+level*18;
   const edgeY=upper?y-height/2:y+height/2;
   parts.push(line(item.pointX,edgeY,item.labelX,labelY+(upper?5:-11),
    'stroke="#94aab0" stroke-width="1" opacity=".82"'));
   parts.push(tag(item.label,item.labelX,labelY,
    'font-family="Arial,sans-serif" font-size="11" font-weight="600" fill="#415d67" text-anchor="middle"'));
  }
  if(group.omitted>0)someOmitted=true;
 }
 const description=d.outlierRule==="none"||d.outlierRule==="minmax"?
  "Whiskers span the selected observations; no outliers classified.":
  (d.whiskerMode==="minmax"?"Whiskers reach observed extrema. ":"Whiskers exclude flagged observations. ")+
  "Circled points are flagged by "+outMethod+".";
 return footer(d,parts,description+
  (someOmitted?" Some outlier values are listed only in the calculations panel.":""),canvasHeight);
}
function dots(q){
 const {draft:d,result:r,override}=q,series=r.series||[],values=series.flatMap(group=>group.values);
 const range=override||paddedRange(values.length?Math.min(...values):0,values.length?Math.max(...values):1);
 const placements=series.map(group=>dotPlacement(group.values,range[0],range[1],PW,d.dotMode,11));
 const rowHeight=Math.max(112,...placements.map(p=>60+p.levels*12));
 const plotHeight=Math.max(PH,rowHeight*series.length),canvasHeight=H+plotHeight-PH;
 const parts=base(d,d.dotMode==="counted"?"Counted dot plot: number beside each dot gives repetitions":"Dot plot shows individual values, without joining points",canvasHeight,plotHeight);
 const X=horizontalNumeric(parts,...range,axisLabel(d,"x"),d.showGrid,plotHeight,canvasHeight);
 const space=plotHeight/Math.max(1,series.length),colors=["#208879","#5074b1","#a35e91","#b28c34","#6f7bb2"];
 series.forEach((group,i)=>{
  const y0=TOP+(i+1)*space-17,color=colors[i%colors.length],placement=placements[i];
  parts.push(line(LEFT,y0+8,LEFT+PW,y0+8,'stroke="#afc3c8" stroke-width="1" stroke-dasharray="3 5"'));
  for(const point of placement.dots){
   const yy=y0-8-point.level*12;
   parts.push('<circle cx="'+fmt(LEFT+point.x)+'" cy="'+fmt(yy)+'" r="4.8" fill="'+color+'" stroke="#fff" stroke-width=".9"><title>'+
    E(formatBoxNumber(point.value)+(d.dotMode==="counted"?" × "+point.count:""))+'</title></circle>');
   if(d.dotMode==="counted"&&point.count>1)parts.push(tag("×"+point.count,LEFT+point.x+8,yy-6,
    'font-size="11" font-family="Arial,sans-serif" fill="#34555c"'));
  }
  const label=group.name.length>24?diagramSafeExcerpt(group.name,25):group.name;
  parts.push(tag(label,LEFT-12,y0-space*.26,
   'font-size="12" font-weight="700" text-anchor="end" font-family="Arial,sans-serif" fill="#31515c"'));
  parts.push(tag("n = "+group.values.length,LEFT-12,y0-space*.26+17,
   'font-size="11" text-anchor="end" font-family="Arial,sans-serif" fill="#607984"'));
  const summary=group.summary;
  for(const [markerIndex,[enabled,value,text,dash]] of
   [[d.dotMean,summary?.mean,"Mean","5 3"],[d.dotMedian,summary?.median,"Median","2 4"]].entries()){
   if(!enabled||!Number.isFinite(value))continue;
   const x=X(value),keyX=LEFT+15+markerIndex*PW/2,keyY=TOP+i*space+19;
   parts.push(line(x,y0-placement.levels*12-16,x,y0+9,
    'stroke="#374d60" stroke-width="1.7" stroke-dasharray="'+dash+'"'));
   parts.push(line(keyX,keyY-4,keyX+21,keyY-4,'stroke="#374d60" stroke-width="2" stroke-dasharray="'+dash+'"'));
   parts.push(tag(text+" "+formatBoxNumber(value),keyX+27,keyY,
    'font-size="11" font-weight="700" font-family="Arial,sans-serif" fill="#354d5a"',PW/2-42));
  }
 });
 return footer(d,parts,d.dotMode==="counted"?"Each distinct value is marked once; counts preserve all supplied values.":"Each dot represents one supplied value; no original value was removed.",canvasHeight);
}
function bars(q){
 const {draft:d,result:r,override}=q,rows=r.categories||[],groups=r.names||[],totals=r.totals||[];
 const stacked=d.barStyle!=="grouped",percent100=d.barStyle==="stacked100";
 const maximum=Math.max(0,...rows.map(c=>stacked?c.values.reduce((a,b)=>a+b,0):Math.max(0,...c.values)));
 const ymax=override?override[1]:percent100||!stacked&&d.barMode==="percent"?100:niceUpper(maximum*1.13);
 const plotHeight=PH,canvasHeight=H+62;
 const caption=percent100?"100%-stacked · percentages within each category":stacked?
  "Stacked raw counts by category":d.barMode==="percent"?"Grouped percentages within each group":"Observed group counts";
 const parts=base(d,caption,canvasHeight,plotHeight);
 const Y=verticalNumeric(parts,ymax,percent100?"Percent of category (%)":
  !stacked&&d.barMode==="percent"?"Percent of group (%)":"Frequency (count)",d.showGrid);
 const colors=["#348d81","#6182be","#b3698d","#b28c42"],ncat=Math.max(1,rows.length);
 const band=PW/ncat,usable=band*.78,groupWidth=usable/Math.max(1,groups.length);
 const labelMode=d.barLabels==="auto"?(percent100||!stacked&&d.barMode==="percent"?"percent":"count"):d.barLabels;
 const label=(cat,j)=>{
  if(labelMode==="none")return "";
  if(labelMode==="count")return String(cat.counts[j]);
  const v=percent100?cat.values[j]:stacked?100*cat.counts[j]/Math.max(1,cat.categoryTotal):
   d.barMode==="percent"?cat.values[j]:100*cat.counts[j]/Math.max(1,totals[j]);
  return fmt(v,1)+"%";
 };
 rows.forEach((cat,i)=>{
  const xStart=LEFT+i*band+(band-usable)/2;
  let bottom=0;
  cat.values.forEach((v,j)=>{
   const x=stacked?xStart:xStart+j*groupWidth+.6;
   const width=stacked?usable:Math.max(1,groupWidth-1.2);
   const end=bottom+v,top=stacked?Y(end):Y(v),height=stacked?Y(bottom)-top:Y(0)-top;
   parts.push('<rect x="'+fmt(x)+'" y="'+fmt(top)+'" width="'+fmt(width)+'" height="'+fmt(Math.max(0,height))+
    '" fill="'+colors[j%colors.length]+'" fill-opacity=".88" stroke="#fff" stroke-width=".75"><title>'+
    E(cat.category+" · "+groups[j]+": "+cat.counts[j]+" responses"+(percent100?" ("+fmt(cat.values[j],2)+"% of category)":!stacked&&d.barMode==="percent"?" ("+fmt(v,2)+"% of group)":""))+
    '</title></rect>');
   const words=label(cat,j);
   if(d.showLabels&&v>0&&words&&width>Math.max(23,words.length*6.7)&&height>20){
    parts.push(tag(words,x+width/2,top+Math.min(height/2+4,17),
     'font-family="Arial,sans-serif" font-size="10.5" font-weight="700" fill="#183d46" text-anchor="middle"'));
   }
   bottom=end;
  });
  const maxChars=Math.max(6,Math.min(20,Math.floor(band/6.4)));
  const shown=cat.category.length>maxChars?diagramSafeExcerpt(cat.category,maxChars):cat.category;
  parts.push(tag(shown,LEFT+(i+.5)*band,TOP+plotHeight+25,
   'font-family="Arial,sans-serif" font-size="11.5" fill="#34505d" text-anchor="middle"'));
 });
 groups.forEach((g,i)=>{
  const x=LEFT+(i%2)*PW/2,yy=TOP+plotHeight+61+Math.floor(i/2)*22;
  parts.push('<rect x="'+fmt(x)+'" y="'+fmt(yy-11)+'" width="13" height="13" rx="2" fill="'+colors[i%colors.length]+'"/>');
  parts.push(tag(diagramSafeExcerpt(g,32)+" (n="+totals[i]+")",x+22,yy,
   'font-family="Arial,sans-serif" font-size="12" fill="#31505c"'));
 });
 return footer(d,parts,"Bars start at zero. "+(percent100?
  "Each category totals 100%, using the category's own responses.":
  stacked?"Stacked segments show counts; total height gives category count.":
  d.barMode==="percent"?"Group percentages use each group's total.":"Group denominators are shown in the legend."),canvasHeight);
}
export function renderStatSvg(raw){
 const q=statAnalysis(raw);
 const renderer={histogram,ogive,polygon:frequencyPolygons,box:boxes,dot:dots,bar:bars}[q.draft.kind];
 if(!q.ready){
  const parts=base(q.draft,"Working preview — complete the statistical diagram checks to export.");
  parts.push(tag("Add or correct your data and labels to see an IA-ready diagram",W/2,TOP+PH/2,
    'text-anchor="middle" font-family="Arial,sans-serif" font-size="17" fill="#687e85"'));
  // Show a preview when just metadata is missing, but never when mathematical data are invalid.
  if(!q.problems.some(p=>["histogram-data","histogram-empty","histogram-n","invalid-values","dot-stack","observations","series","bar-data",
    "categories","data","pending","dot-crowded","cropped-classes","cropped-points","cropped-bars",
    "ogive-data","polygon-data","percentile","compare-groups","compare-grouped","compare-limit","zero-bar"].includes(p.code)))return renderer(q);
  return footer(q.draft,parts);
 }
 return renderer(q);
}
