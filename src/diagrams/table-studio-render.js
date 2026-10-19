/** Automatic one-page-width table layout for a clean IA, not an oversized spreadsheet. */
import {escapeGraph} from "./graph-core.js";
import {analyzeTable} from "./table-studio-core.js";

const E=escapeGraph,WIDTH=900,LEFT=49,RIGHT=49,INNER=WIDTH-LEFT-RIGHT;
function breakLines(input,available,fontSize=18,maxLines=4){
 const text=String(input??"").trim(),chars=Math.max(6,Math.floor(available/(fontSize*.55)));
 if(!text)return [""];
 const words=text.split(/\s+/),lines=[];let line="";
 for(const word of words){
  if(!line){
   if(word.length<=chars){line=word;continue;}
   for(let i=0;i<word.length;i+=chars)lines.push(word.slice(i,i+chars));
  }else if((line+" "+word).length<=chars)line+=" "+word;
  else{
   lines.push(line);line="";
   if(word.length<=chars)line=word;
   else for(let i=0;i<word.length;i+=chars)lines.push(word.slice(i,i+chars));
  }
 }
 if(line)lines.push(line);
 return lines.slice(0,maxLines);
}
const number=x=>typeof x==="number"&&Number.isFinite(x);
export function tableWidths(model){
 const count=model.headers.length;
 if(!count)return[];
 const min=count===5?114:118,max=INNER-(count-1)*min;
 const scores=model.headers.map((heading,i)=>{
  const cells=model.rows.map(row=>String(row[i]??""));
  const longest=Math.max(heading.length,...cells.map(c=>c.length));
  const longestWord=Math.max(...[heading,...cells].flatMap(s=>s.split(/\s+/).map(t=>t.length)));
  return Math.max(68,Math.min(245,33+Math.max(longestWord*9.0,Math.min(longest*5.2,205))));
 });
 let widths=Array(count).fill(min),extra=INNER-count*min;
 while(extra>.1){
  const available=widths.map((w,i)=>Math.max(0,Math.min(max,Math.max(min,scores[i]))-w));
  let total=available.reduce((s,x)=>s+x,0);
  if(total<=.1){for(let i=0;i<count;i++)widths[i]+=extra/count;break;}
  let used=0;
  for(let i=0;i<count;i++){
   const delta=Math.min(available[i],extra*available[i]/total);
   widths[i]+=delta;used+=delta;
  }
  if(used<.1)break;
  extra-=used;
 }
 return widths.map(v=>Number(v.toFixed(3)));
}
function svgText(lines,x,y,lineHeight,attrs){
 return '<text x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" '+attrs+'>'+
  lines.map((line,i)=>'<tspan x="'+x.toFixed(1)+'" dy="'+(i?lineHeight:0)+'">'+E(line)+'</tspan>').join("")+
 '</text>';
}
function layout(model,d){
 const widths=tableWidths(model),positions=[LEFT];
 for(const width of widths)positions.push(positions.at(-1)+width);
 const headers=model.headers.map((h,i)=>breakLines(h,widths[i]-22,17,4));
 const rows=model.rows.map(row=>row.map((v,i)=>breakLines(v,widths[i]-22,17,4)));
 const headerHeight=Math.max(56,Math.max(...headers.map(x=>x.length))*23+21);
 const rowHeights=rows.map(cells=>Math.max(39,Math.max(...cells.map(x=>x.length))*23+14));
 const titleLines=breakLines("Table "+d.number+". "+d.title,INNER-12,23,3);
 const titleY=53,titleEnd=titleY+(titleLines.length-1)*29;
 const tableTop=titleEnd+47;
 const tableBottom=tableTop+headerHeight+rowHeights.reduce((s,v)=>s+v,0);
 const notes=[
  model.metadata,
  model.note?(model.note.startsWith("Note:")?model.note:"Note: "+model.note):"",
  d.sourceKind==="primary"?"Source: student-collected data":"Source: "+d.sourceText
 ].filter(Boolean);
 const footerLines=notes.flatMap(n=>breakLines(n,INNER,14,5));
 const height=Math.max(280,tableBottom+45+footerLines.length*23+35);
 return {widths,positions,headers,rows,headerHeight,rowHeights,tableTop,tableBottom,titleLines,titleY,footerLines,height};
}
export function renderTableSvg(raw){
 const check=analyzeTable(raw),d=check.draft,model=check.model;
 if(!model){
  return '<svg xmlns="http://www.w3.org/2000/svg" class="ia-table-svg" role="img" aria-label="Table preview needs corrections" viewBox="0 0 900 300"><rect width="900" height="300" fill="#fff"/>'+
   '<rect x="40" y="40" width="820" height="210" fill="#f8fbfa" stroke="#d2e1de" rx="12"/>'+
   svgText(["Provide a short and mathematically valid table"],450,129,24,
    'text-anchor="middle" fill="#415f65" font-family="Arial,sans-serif" font-weight="700" font-size="19"')+
   svgText(["No rows have been hidden or shortened."],450,162,24,
    'text-anchor="middle" fill="#648088" font-family="Arial,sans-serif" font-size="15"')+"</svg>";
 }
 const L=layout(model,d),out=[
  '<svg xmlns="http://www.w3.org/2000/svg" class="ia-table-svg" role="img" aria-label="'+E("Table "+d.number+". "+d.title)+'" viewBox="0 0 '+WIDTH+" "+Math.round(L.height)+'" width="'+WIDTH+'" height="'+Math.round(L.height)+'">',
  '<rect width="'+WIDTH+'" height="'+Math.round(L.height)+'" fill="#fff"/>',
  svgText(L.titleLines,LEFT,L.titleY,29,'font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="23" fill="#263f49"'),
  '<rect x="'+LEFT+'" y="'+L.tableTop+'" width="'+INNER+'" height="'+L.headerHeight+'" fill="#e8f3f0"/>',
  '<line x1="'+LEFT+'" y1="'+L.tableTop+'" x2="'+(LEFT+INNER)+'" y2="'+L.tableTop+'" stroke="#286960" stroke-width="2.2"/>'
 ];
 let x=LEFT;
 L.headers.forEach((lines,i)=>{
  const numeric=model.numeric[i];
  out.push(svgText(lines,numeric?x+L.widths[i]-12:x+12,L.tableTop+26,23,
   'font-family="Arial,Helvetica,sans-serif" font-size="17" font-weight="700" fill="#244f50" text-anchor="'+(numeric?"end":"start")+'"'));
  x+=L.widths[i];
 });
 let y=L.tableTop+L.headerHeight;
 model.rows.forEach((row,i)=>{
  const height=L.rowHeights[i],total=model.kind==="frequency"&&i===model.rows.length-1;
  if(total)out.push('<rect x="'+LEFT+'" y="'+y+'" width="'+INNER+'" height="'+height+'" fill="#e9f3ef"/>');
  else if(i%2)out.push('<rect x="'+LEFT+'" y="'+y+'" width="'+INNER+'" height="'+height+'" fill="#f6faf9"/>');
  if(d.showRowLines||total)out.push('<line x1="'+LEFT+'" y1="'+(y+height)+'" x2="'+(LEFT+INNER)+'" y2="'+(y+height)+'" stroke="#d5e1e1" stroke-width="1"/>');
  let px=LEFT;
  row.forEach((_,j)=>{
   const numeric=model.numeric[j],lines=L.rows[i][j];
   out.push(svgText(lines,numeric?px+L.widths[j]-12:px+12,y+25,23,
    'font-family="Arial,Helvetica,sans-serif" font-size="17" fill="#25434b" text-anchor="'+(numeric?"end":"start")+'"'+
     (total?' font-weight="700"':"")));
   px+=L.widths[j];
  });
  y+=height;
 });
 out.push('<line x1="'+LEFT+'" y1="'+y+'" x2="'+(LEFT+INNER)+'" y2="'+y+'" stroke="#286960" stroke-width="2.2"/>');
 let footerY=y+32;
 for(const line of L.footerLines){
  out.push(svgText([line],LEFT,footerY,22,'font-family="Arial,Helvetica,sans-serif" font-size="14" fill="#566e75"'));
  footerY+=23;
 }
 out.push("</svg>");
 return out.join("");
}
const cellStyle=(width,numeric,bold=false)=>[
 "box-sizing:border-box","width:"+width.toFixed(1)+"px","overflow-wrap:break-word",
 "padding:7px 9px","font-family:Arial,Helvetica,sans-serif","font-size:12pt",
 "text-align:"+(numeric?"right":"left"),"vertical-align:top",
 "border-bottom:1px solid #d5e1e1","color:#25434b",bold?"font-weight:700":""
].filter(Boolean).join(";");
export function tableToHtml(raw){
 const check=analyzeTable(raw);
 if(!check.ready)throw new Error("Complete the table's quality checks before copying.");
 const {model,draft:d}=check,widths=tableWidths(model).map(w=>w*650/INNER);
 const heading="Table "+d.number+". "+d.title;
 const th=model.headers.map((header,i)=>
  '<th scope="col" style="'+cellStyle(widths[i],model.numeric[i],true)+';background:#e8f3f0;">'+E(header)+'</th>').join("");
 const body=model.rows.map((row,i)=>{
  const total=model.kind==="frequency"&&i===model.rows.length-1;
  return '<tr>'+row.map((value,j)=>'<td style="'+cellStyle(widths[j],model.numeric[j],total)+
   ';background:'+(total?"#e9f3ef":i%2?"#f6faf9":"#ffffff")+';">'+E(value)+'</td>').join("")+'</tr>';
 }).join("");
 const foot=[model.metadata,model.note,d.sourceKind==="primary"?"Source: student-collected data":"Source: "+d.sourceText]
  .filter(Boolean).map(s=>'<p style="font-family:Arial,sans-serif;font-size:10pt;margin:5px 0 0;color:#566e75;">'+E(s)+'</p>').join("");
 return '<div><p style="font-family:Arial,sans-serif;font-weight:700;font-size:13pt;margin:0 0 8px;">'+E(heading)+'</p>'+
  '<table style="width:650px;table-layout:fixed;border-collapse:collapse;border-top:2px solid #286960;border-bottom:2px solid #286960;"><colgroup>'+
  widths.map(w=>'<col style="width:'+w.toFixed(1)+'px">').join("")+'</colgroup><thead><tr>'+th+'</tr></thead><tbody>'+body+
  '</tbody></table>'+foot+'</div>';
}
export function tableToTsv(raw){
 const q=analyzeTable(raw);
 if(!q.ready)throw new Error("Fix the required table checks before copying the data.");
 return [q.model.headers,...q.model.rows].map(row=>row.map(s=>String(s).replace(/\t/g," ").replace(/\r?\n/g," ")).join("\t")).join("\n");
}
