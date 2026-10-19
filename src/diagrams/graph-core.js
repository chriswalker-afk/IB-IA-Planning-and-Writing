/**
 * Browser-local, student-owned mathematical graph data and SVG rendering.
 * No eval, Function, remote requests or invented observations.
 */
const MAX_ROWS=500, MAX_COLS=10, MAX_RAW=85000, MAX_FIGURES=16;
const text=(x,n=240)=>typeof x==="string"?x.slice(0,n):"";
const number=x=>typeof x==="number"&&Number.isFinite(x);
export const escapeGraph=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const NUM=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
export const finiteCell=x=>{
 const v=String(x??"").trim().replace(/\u2212/g,"-");
 return NUM.test(v)&&Number.isFinite(Number(v))?Number(v):null;
};
const cleanRows=rows=>Array.isArray(rows)?rows.slice(0,MAX_ROWS).filter(Array.isArray).map(r=>r.slice(0,MAX_COLS).map(x=>text(x,110))):[];
export const newGraphDraft=()=>({
 kind:"scatter",raw:"",columns:[],matrix:[],xIndex:0,yIndex:1,
 title:"",xLabel:"",yLabel:"",xUnit:"",yUnit:"",xUnitMode:"unsure",yUnitMode:"unsure",
 expression:"",sourceKind:"unsure",sourceText:"",caption:"",
 xMin:"",xMax:"",yMin:"",yMax:"",showGrid:true,showPoints:true,includeZeroY:false
});
export function normalizeGraphDraft(raw){
 const o=newGraphDraft(),v=raw&&typeof raw==="object"&&!Array.isArray(raw)?raw:{};
 for(const [k,value] of Object.entries(o)){
  if(typeof value==="string")o[k]=text(v[k],k==="raw"?MAX_RAW:k==="expression"?180:k==="sourceText"?500:k==="caption"?320:120);
  else if(typeof value==="boolean")o[k]=typeof v[k]==="boolean"?v[k]:value;
 }
 o.kind=["scatter","time","function"].includes(v.kind)?v.kind:o.kind;
 o.columns=Array.isArray(v.columns)?v.columns.slice(0,MAX_COLS).map(x=>text(x,100)):[];
 o.matrix=cleanRows(v.matrix);
 o.xIndex=Number.isInteger(v.xIndex)?Math.max(0,Math.min(MAX_COLS-1,v.xIndex)):0;
 o.yIndex=Number.isInteger(v.yIndex)?Math.max(0,Math.min(MAX_COLS-1,v.yIndex)):1;
 for(const k of ["xUnitMode","yUnitMode"])if(!["unsure","unit","dimensionless"].includes(o[k]))o[k]="unsure";
 if(!["unsure","primary","secondary","theoretical"].includes(o.sourceKind))o.sourceKind="unsure";
 return o;
}
export const newGraphStudio=()=>({open:false,draft:newGraphDraft(),figures:[],activeId:""});
export function normalizeGraphStudio(raw){
 const base=newGraphStudio(),v=raw&&typeof raw==="object"&&!Array.isArray(raw)?raw:{};
 const figures=(Array.isArray(v.figures)?v.figures:[]).slice(-MAX_FIGURES).filter(x=>x&&typeof x==="object").map(x=>({
  id:text(x.id,50),entryId:text(x.entryId,80),savedAt:text(x.savedAt,35),draft:normalizeGraphDraft(x.draft)
 })).filter(x=>/^figure-[a-z0-9-]+$/i.test(x.id));
 return {...base,open:v.open===true,draft:normalizeGraphDraft(v.draft),figures,
  activeId:figures.some(x=>x.id===v.activeId)?v.activeId:""};
}
const splitDelimited=(input,delimiter)=>{
 const rows=[];let row=[],cell="",inside=false;
 for(let i=0;i<input.length;i++){
  const c=input[i];
  if(c==='"'){
   if(inside&&input[i+1]==='"'){cell+='"';i++;}else inside=!inside;
  }else if(c===delimiter&&!inside){row.push(cell.trim());cell="";}
  else if((c==="\n"||c==="\r")&&!inside){
   if(c==="\r"&&input[i+1]==="\n")i++;
   row.push(cell.trim());
   if(row.some(x=>x!==""))rows.push(row);
   row=[];cell="";
  }else cell+=c;
 }
 if(inside)throw new Error("A quoted cell is unfinished. Check the pasted data.");
 row.push(cell.trim());if(row.some(x=>x!==""))rows.push(row);
 return rows;
};
export function readPastedGraphData(raw){
 const input=String(raw??"");
 if(!input.trim())throw new Error("Copy at least two columns of numbers from Google Sheets first.");
 if(input.length>MAX_RAW)throw new Error("The data range is too large. Paste at most 85,000 characters.");
 const delimiter=input.includes("\t")?"\t":input.includes(";")&&!input.includes(",")?";":",";
 const records=splitDelimited(input,delimiter);
 if(records.length<2)throw new Error("Paste at least two rows. Include column headers if available.");
 if(records[0].length<2)throw new Error("At least two columns are needed for a graph.");
 if(records.length>MAX_ROWS+1)throw new Error("This first plotter supports up to 500 rows; choose a meaningful range.");
 if(records.some(r=>r.length>MAX_COLS))throw new Error("Select at most 10 columns from the sheet.");
 const width=Math.max(...records.map(r=>r.length));
 const first=records[0],hasHeaders=first.some(x=>finiteCell(x)===null);
 const columns=hasHeaders?Array.from({length:width},(_,i)=>text(first[i]||"Column "+(i+1),100)):
  Array.from({length:width},(_,i)=>"Column "+(i+1));
 const matrix=records.slice(hasHeaders?1:0).filter(r=>r.some(c=>c.trim()!==""))
  .map(r=>Array.from({length:width},(_,i)=>text(r[i]??"",110)));
 if(!matrix.length)throw new Error("No data rows were found beneath the headings.");
 return {columns,matrix,headerDetected:hasHeaders,separator:delimiter};
}
export const splitHeading=x=>{
 const h=String(x??"").trim();
 const hit=/^(.*?)\s*(?:\(([^)]+)\)|\[([^\]]+)\])\s*$/.exec(h);
 return hit?{label:hit[1].trim(),unit:(hit[2]||hit[3]).trim()}:{label:h,unit:""};
};
export function applyPastedGraphData(studio,raw){
 const d=studio.draft,parsed=readPastedGraphData(raw);
 d.raw=String(raw);d.columns=parsed.columns;d.matrix=parsed.matrix;
 d.xIndex=0;d.yIndex=1;
 const x=splitHeading(d.columns[0]),y=splitHeading(d.columns[1]);
 d.xLabel=x.label;d.yLabel=y.label;
 d.xUnit=x.unit;d.yUnit=y.unit;
 d.xUnitMode=x.unit?"unit":"unsure";d.yUnitMode=y.unit?"unit":"unsure";
 d.sourceKind=d.sourceKind||"unsure";
 return {rows:d.matrix.length,columns:d.columns.length,headerDetected:parsed.headerDetected};
}
export function graphData(d){
 const points=[];let skipped=0;
 for(const row of d.matrix){
  const x=finiteCell(row[d.xIndex]),y=finiteCell(row[d.yIndex]);
  if(x===null||y===null){skipped++;continue;}
  points.push({x,y});
 }
 return {points,skipped,rows:d.matrix.length};
}
/** Recursive-descent expression parser; scientific input is evaluated without executing JS code. */
const OPERATORS={"+":1,"-":1,"*":2,"/":2,"^":4};
const FUNCS=new Set(["sin","cos","tan","asin","acos","atan","sqrt","abs","exp","ln","log"]);
function lex(expression){
 const out=[],s=expression.replace(/^\s*(?:y|f\(x\))\s*=\s*/i,"");let i=0;
 if(s.length>180)throw new Error("Keep the function under 180 characters.");
 while(i<s.length){
  if(/\s/.test(s[i])){i++;continue;}
  const num=/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i.exec(s.slice(i));
  if(num){out.push({t:"num",v:Number(num[0])});i+=num[0].length;continue;}
  const word=/^[a-zA-Z]+/.exec(s.slice(i));
  if(word){out.push({t:"id",v:word[0].toLowerCase()});i+=word[0].length;continue;}
  if("+-*/^()".includes(s[i])){out.push({t:s[i]});i++;continue;}
  throw new Error("Unexpected character '"+s[i]+"'. Use explicit multiplication, such as 2*x.");
 }
 if(out.length>130)throw new Error("The function has too many terms.");
 return out;
}
export function compileGraphFunction(expression){
 if(!String(expression??"").trim())throw new Error("Enter a function of x, such as x^2 - 3*x + 2.");
 const tokens=lex(String(expression)),count={n:0};let pos=0;
 const take=t=>tokens[pos]?.t===t?(pos++,true):false;
 const primary=()=>{
  if(++count.n>150)throw new Error("The function is too complex.");
  const cur=tokens[pos];
  if(!cur)throw new Error("The expression is incomplete.");
  if(take("+"))return primary();
  if(take("-"))return {op:"neg",arg:parse(3)};
  if(take("(")){const val=parse(0);if(!take(")"))throw new Error("A closing bracket is missing.");return val;}
  pos++;
  if(cur.t==="num")return {op:"num",value:cur.v};
  if(cur.t==="id"){
   if(cur.v==="x"||cur.v==="pi"||cur.v==="e")return {op:cur.v};
   if(!FUNCS.has(cur.v))throw new Error("Unknown function or variable: "+cur.v+". Use x, pi, e, sin, cos, tan, sqrt, abs, exp, ln or log.");
   if(!take("("))throw new Error("Use brackets for "+cur.v+", for example "+cur.v+"(x).");
   const arg=parse(0);
   if(!take(")"))throw new Error("Close the bracket after "+cur.v+".");
   return {op:"fn",name:cur.v,arg};
  }
  throw new Error("Check the function syntax near an operator or bracket.");
 };
 const parse=min=>{
  let node=primary();
  while(tokens[pos]&&Object.hasOwn(OPERATORS,tokens[pos].t)&&OPERATORS[tokens[pos].t]>=min){
   const op=tokens[pos++].t,p=OPERATORS[op];
   node={op,left:node,right:parse(op==="^"?p:p+1)};
  }
  return node;
 };
 const tree=parse(0);
 if(pos!==tokens.length)throw new Error("Check adjacent terms: use * for multiplication, e.g. 2*x.");
 const evaluate=(n,x)=>{
  switch(n.op){
   case "num":return n.value;
   case "x":return x;
   case "pi":return Math.PI;
   case "e":return Math.E;
   case "neg":return -evaluate(n.arg,x);
   case "+":return evaluate(n.left,x)+evaluate(n.right,x);
   case "-":return evaluate(n.left,x)-evaluate(n.right,x);
   case "*":return evaluate(n.left,x)*evaluate(n.right,x);
   case "/":return evaluate(n.left,x)/evaluate(n.right,x);
   case "^":return Math.pow(evaluate(n.left,x),evaluate(n.right,x));
   case "fn":{
    const v=evaluate(n.arg,x);
    const op={sin:Math.sin,cos:Math.cos,tan:Math.tan,asin:Math.asin,acos:Math.acos,atan:Math.atan,
     sqrt:Math.sqrt,abs:Math.abs,exp:Math.exp,ln:Math.log,log:Math.log10}[n.name];
    return op(v);
   }
  }
 };
 return x=>evaluate(tree,x);
}
const range=(arr,fallback)=>{
 if(!arr.length)return fallback;
 const low=Math.min(...arr),high=Math.max(...arr),span=high-low;
 const extra=span===0?Math.max(1,Math.abs(low)*.16):span*.08;
 return [low-extra,high+extra];
};
function axisBounds(d,key,auto){
 const a=d[key+"Min"].trim(),b=d[key+"Max"].trim();
 if(!a&&!b)return auto;
 const lo=finiteCell(a),hi=finiteCell(b);
 return lo!==null&&hi!==null&&hi>lo?[lo,hi]:null;
}
export function analyseGraph(draft){
 const d=normalizeGraphDraft(draft),problems=[],warnings=[];
 const fail=(code,message)=>problems.push({code,message});
 const warn=(code,message)=>warnings.push({code,message});
 if(!d.title.trim())fail("title","Give this figure a descriptive title.");
 if(!d.xLabel.trim())fail("xlabel","Name the horizontal variable or mathematical quantity.");
 if(!d.yLabel.trim())fail("ylabel","Name the vertical variable or mathematical quantity.");
 for(const k of ["x","y"]){
  if(d[k+"UnitMode"]==="unsure")fail(k+"unit-status","Confirm whether the "+(k==="x"?"horizontal":"vertical")+" quantity has units.");
  if(d[k+"UnitMode"]==="unit"&&!d[k+"Unit"].trim())fail(k+"unit","Enter the "+(k==="x"?"horizontal":"vertical")+" axis unit.");
 }
 if(d.title.length>85)warn("long-title","The title may be long at normal IA page width. Consider a shorter title and a fuller caption.");
 if(d.kind!=="function"){
  if(d.matrix.length===0)fail("data","Paste and import genuine numerical observations.");
  if(d.xIndex===d.yIndex)fail("columns","Choose two different columns for the horizontal and vertical quantities.");
  if(d.sourceKind==="unsure")fail("source-kind","Confirm whether the plotted values are primary or published data.");
  if(d.sourceKind==="secondary"&&!d.sourceText.trim())fail("source","Credit the original published source of the data.");
 }else{
  if(!d.expression.trim())fail("expression","Enter a function of x to plot.");
  else try{compileGraphFunction(d.expression);}catch(err){fail("expression",err.message);}
 }
 let points=[],skipped=0;
 if(d.kind!=="function"){
  const data=graphData(d);points=data.points;skipped=data.skipped;
  if(points.length<2)fail("points","At least two usable (x, y) observations are needed for this graph.");
  if(skipped)warn("skipped",skipped+" row"+(skipped===1?" was":"s were")+" not plotted because an x or y value was missing or non-numeric. Check those rows.");
  if(d.kind==="time"&&points.length>1){
   const values=points.map(p=>p.x);
   if(values.some((x,i)=>i>0&&x<values[i-1]))warn("order","Time values are not sorted in the pasted table. The graph will connect them in increasing x order.");
   if(new Set(values).size!==values.length)warn("time-duplicate","Some time values repeat; decide whether repeated readings should be summarised rather than connected.");
  }
  if(points.length>300)warn("crowded","More than 300 plotted points may be hard to distinguish at printed size.");
 }else if(d.expression.trim()&&!problems.some(x=>x.code==="expression")){
  const xx=axisBounds(d,"x",[-10,10]);
  if(xx){
   const f=compileGraphFunction(d.expression);
   for(let i=0;i<=600;i++){
    const x=xx[0]+(xx[1]-xx[0])*i/600;
    let y;try{y=f(x);}catch{y=NaN;}
    if(Number.isFinite(y)&&Math.abs(y)<1e12)points.push({x,y});
   }
   if(points.length<2)fail("function-domain","The function has no finite values in this displayed domain.");
  }
 }
 let xAuto=range(points.map(p=>p.x),[-10,10]);
 if(d.kind==="function")xAuto=[-10,10];
 let yAuto=range(points.map(p=>p.y),[-10,10]);
 if(d.kind==="function"&&points.length>20){
  const sorted=points.map(p=>p.y).sort((a,b)=>a-b);
  yAuto=range(sorted.slice(Math.floor(sorted.length*.03),Math.ceil(sorted.length*.97)),[-10,10]);
 }
 if(d.includeZeroY&&d.kind!=="function")yAuto=[Math.min(0,yAuto[0]),Math.max(0,yAuto[1])];
 const bounds={x:axisBounds(d,"x",xAuto),y:axisBounds(d,"y",yAuto)};
 if(!bounds.x)fail("x-range","Set both horizontal limits as numbers, with maximum greater than minimum.");
 if(!bounds.y)fail("y-range","Set both vertical limits as numbers, with maximum greater than minimum.");
 if(bounds.x&&bounds.y&&points.length){
  const inside=points.filter(p=>p.x>=bounds.x[0]&&p.x<=bounds.x[1]&&p.y>=bounds.y[0]&&p.y<=bounds.y[1]).length;
  if(!inside)warn("empty-viewport","The chosen axis ranges hide all the mathematical values.");
  else if(inside<points.length*.85)warn("clipped","The chosen axis limits hide some values. Make sure this is intentional and does not mislead.");
 }
 if(d.kind==="scatter"&&points.length)warn("no-automatic-fit","Scatter points are intentionally not joined or given a trendline. Fit a model only after interpreting the actual pattern.");
 return {ready:problems.length===0,problems,warnings,points,skipped,bounds,draft:d};
}
const niceStep=span=>{
 const magnitude=Math.pow(10,Math.floor(Math.log10(span/5||1))),fraction=span/5/magnitude;
 return (fraction<=1?1:fraction<=2?2:fraction<=2.5?2.5:fraction<=5?5:10)*magnitude;
};
const tickLabel=(n,step)=>{
 if(Math.abs(n)<Math.abs(step)*1e-7)return "0";
 if(Math.abs(n)>=1e6||Math.abs(n)<1e-4)return n.toExponential(1).replace("e+","e");
 const places=Math.max(0,Math.min(7,Math.ceil(-Math.log10(Math.abs(step)))+1));
 return Number(n.toFixed(places)).toString();
};
const ticks=(a,b)=>{
 const step=niceStep(b-a),list=[];
 let lo=Math.ceil((a-1e-10*step)/step)*step;
 for(let k=0;k<30;k++){const v=lo+k*step;if(v>b+step*1e-7)break;list.push(v);}
 return {step,values:list};
};
const axisTitle=(label,unit,mode)=>label+(mode==="unit"&&unit?" ("+unit+")":"");
const polarised=(str,n)=>String(str||"").length<=n?[str]:[String(str).slice(0,n).replace(/\s+\S*$/,""),String(str).slice(n).trim()];
const W=940,H=620,LEFT=109,RIGHT=55,TOP=112,BOTTOM=122,PW=W-LEFT-RIGHT,PH=H-TOP-BOTTOM;
export function renderGraphSvg(draft){
 const analysis=analyseGraph(draft),d=analysis.draft;let {points,bounds}=analysis;
 const title=escapeGraph(d.title.trim()||"Graph preview — add a descriptive title");
 const xLabel=escapeGraph(axisTitle(d.xLabel||"Horizontal variable",d.xUnit,d.xUnitMode));
 const yLabel=escapeGraph(axisTitle(d.yLabel||"Vertical variable",d.yUnit,d.yUnitMode));
 const parts=['<svg class="graph-figure-svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+title+'" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'">',
  '<title>'+title+'</title><desc>Student-generated '+escapeGraph(d.kind)+' graph with '+points.length+' valid points. Axis values and scale are listed in the labels.</desc>',
  '<rect width="'+W+'" height="'+H+'" fill="#ffffff"/>'];
 const titleLines=polarised(d.title.trim()||"Graph preview — add a descriptive title",75).slice(0,2);
 titleLines.forEach((t,i)=>parts.push('<text x="'+W/2+'" y="'+(42+i*24)+'" font-family="Arial,Helvetica,sans-serif" font-size="20" font-weight="700" text-anchor="middle" fill="#203d43">'+escapeGraph(t)+'</text>'));
 const axisY=TOP+PH;
 parts.push('<rect x="'+LEFT+'" y="'+TOP+'" width="'+PW+'" height="'+PH+'" fill="#fafcfd" stroke="#ccd8dc" stroke-width="1.2"/>');
 if(bounds.x&&bounds.y){
  const X=n=>LEFT+(n-bounds.x[0])/(bounds.x[1]-bounds.x[0])*PW;
  const Y=n=>TOP+PH-(n-bounds.y[0])/(bounds.y[1]-bounds.y[0])*PH;
  for(const [key,bound,func] of [["x",bounds.x,X],["y",bounds.y,Y]]){
   const t=ticks(...bound);
   for(const v of t.values){
    if(key==="x"){
     const x=func(v);if(x<LEFT||x>LEFT+PW)continue;
     if(d.showGrid)parts.push('<line x1="'+x.toFixed(2)+'" y1="'+TOP+'" x2="'+x.toFixed(2)+'" y2="'+axisY+'" stroke="#dfebee" stroke-width="1"/>');
     parts.push('<line x1="'+x.toFixed(2)+'" y1="'+axisY+'" x2="'+x.toFixed(2)+'" y2="'+(axisY+7)+'" stroke="#425b63" stroke-width="1.4"/>',
     '<text x="'+x.toFixed(2)+'" y="'+(axisY+27)+'" text-anchor="middle" fill="#3b535a" font-family="Arial,Helvetica,sans-serif" font-size="14">'+escapeGraph(tickLabel(v,t.step))+'</text>');
    }else{
     const y=func(v);if(y<TOP||y>axisY)continue;
     if(d.showGrid)parts.push('<line x1="'+LEFT+'" y1="'+y.toFixed(2)+'" x2="'+(LEFT+PW)+'" y2="'+y.toFixed(2)+'" stroke="#dfebee" stroke-width="1"/>');
     parts.push('<line x1="'+(LEFT-7)+'" y1="'+y.toFixed(2)+'" x2="'+LEFT+'" y2="'+y.toFixed(2)+'" stroke="#425b63" stroke-width="1.4"/>',
     '<text x="'+(LEFT-14)+'" y="'+(y+5).toFixed(2)+'" text-anchor="end" fill="#3b535a" font-family="Arial,Helvetica,sans-serif" font-size="14">'+escapeGraph(tickLabel(v,t.step))+'</text>');
    }
   }
  }
  parts.push('<defs><clipPath id="ia-plot-clip"><rect x="'+LEFT+'" y="'+TOP+'" width="'+PW+'" height="'+PH+'"/></clipPath></defs>');
  parts.push('<g clip-path="url(#ia-plot-clip)">');
  const sorted=d.kind==="time"?[...points].sort((a,b)=>a.x-b.x):points;
  if(d.kind==="time"&&sorted.length>1){
   const path=sorted.map((p,i)=>(i?"L":"M")+X(p.x).toFixed(2)+" "+Y(p.y).toFixed(2)).join(" ");
   parts.push('<path d="'+path+'" fill="none" stroke="#137d75" stroke-width="2.9" stroke-linejoin="round" stroke-linecap="round"/>');
  }
  if(d.kind==="function"&&points.length){
   let line="",last=null;
   for(const p of points){
    const xp=X(p.x),yp=Y(p.y);
    const outOfJump=last&&Math.abs(p.y-last.y)>(bounds.y[1]-bounds.y[0])*.8;
    line+=(last&&!outOfJump?" L":" M")+xp.toFixed(2)+" "+yp.toFixed(2);
    last=p;
   }
   parts.push('<path d="'+line+'" fill="none" stroke="#4b6eb9" stroke-width="3" stroke-linejoin="round"/>');
  }else if(d.showPoints){
   sorted.forEach(p=>parts.push('<circle cx="'+X(p.x).toFixed(2)+'" cy="'+Y(p.y).toFixed(2)+'" r="'+(sorted.length>220?"3.0":"4.5")+'" fill="#147e75" stroke="#fff" stroke-width="1"/>'));
  }
  parts.push('</g>');
 }else{
  parts.push('<text x="'+W/2+'" y="'+(TOP+PH/2)+'" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="19" fill="#647d85">Add valid data or a function to see your graph</text>');
 }
 parts.push('<text x="'+(LEFT+PW/2)+'" y="'+(H-59)+'" text-anchor="middle" fill="#263f47" font-family="Arial,Helvetica,sans-serif" font-size="17" font-weight="600">'+xLabel+'</text>',
  '<text x="35" y="'+(TOP+PH/2)+'" transform="rotate(-90 35 '+(TOP+PH/2)+')" text-anchor="middle" fill="#263f47" font-family="Arial,Helvetica,sans-serif" font-size="17" font-weight="600">'+yLabel+'</text>');
 const source=d.kind==="function"?"Function: "+d.expression:d.sourceKind==="secondary"?"Source: "+(d.sourceText||"not yet supplied"):d.sourceKind==="primary"?"Source: student's observations":"Source: not yet confirmed";
 parts.push('<text x="'+W/2+'" y="'+(H-17)+'" text-anchor="middle" fill="#5b6f76" font-family="Arial,Helvetica,sans-serif" font-size="12">'+escapeGraph(source.slice(0,145))+'</text>',
  '</svg>');
 return parts.join("");
}
export const graphFileBase=d=>{
 const title=String(d.title||"my-graph").normalize("NFKD").replace(/[^a-z0-9 -]/gi,"").trim().replace(/\s+/g,"-").slice(0,65).toLowerCase();
 return title||"my-graph";
};
export function saveGraphFigure(studio,entryId=""){
 const d=normalizeGraphDraft(studio.draft),result=analyseGraph(d);
 if(!result.ready)return {ok:false,error:"Resolve the required presentation checks before saving or exporting.",checks:result};
 const id=studio.activeId||"figure-"+Date.now().toString(36)+"-"+Math.floor(Math.random()*10000).toString(36);
 const record={id,entryId:entryId||studio.figures.find(x=>x.id===id)?.entryId||"",savedAt:new Date().toISOString(),draft:d};
 const i=studio.figures.findIndex(x=>x.id===id);
 if(i>=0)studio.figures[i]=record;
 else studio.figures.push(record);
 studio.figures=studio.figures.slice(-MAX_FIGURES);
 studio.activeId=id;
 return {ok:true,record};
}
