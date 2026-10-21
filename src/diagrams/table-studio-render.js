/** Compact, content-sized SVG and editable tables for an IB Mathematics IA.
 * All real values and headings are preserved; mathematical unit typography only
 * affects presentation, not source measurements or the CSV/TSV exports.
 */
import {escapeGraph} from "./graph-core.js";
import {formatTableMath} from "./table-studio-math.js";
import {svgDiagramText,diagramHtmlMath,diagramVisibleLength} from "./diagram-notation.js";
import {analyzeTable} from "./table-studio-core.js";

const E=escapeGraph,PAGE_MARGIN=36,MAX_TABLE_WIDTH=750,MIN_COL_WIDTH=100,MAX_COL_WIDTH=255;
const total=values=>values.reduce((sum,n)=>sum+n,0);

/** No maximum-line cutoff: long but valid student headings must never disappear. */
function breakLines(input,available,fontSize=17){
 const value=String(input??"").trim();
 if(!value)return [""];
 const chars=Math.max(6,Math.floor(available/(fontSize*.54)));
 const result=[];let line="";
 const push=()=>{if(line){result.push(line);line="";}};
 // Keep legacy plain text layout identical; treat authored maths as atomic.
 const maths=/\\\(/.test(value);
 for(const item of (maths?value.match(/\\\([\s\S]*?\\\)|\([^)]*\)|\S+/g):
   value.match(/\([^)]*\)|\S+/g))||[]){
  let word=item;
  if(line&&(maths?diagramVisibleLength(line+" "+word,fontSize):(line+" "+word).length)<=chars){
   line+=" "+word;continue;
  }
  if(line)push();
  if(!/\\\(/.test(word))while(word.length>chars){result.push(word.slice(0,chars));word=word.slice(chars);}
  line=word;
 }
 push();return result;
}
const number=n=>typeof n==="number"&&Number.isFinite(n);

/** Choose intrinsic widths; never stretch 2 short columns to fill an IA page. */
export function tableWidths(model){
 const count=model.headers.length;
 if(!count)return [];
 const desired=model.headers.map((header,i)=>{
  const items=[formatTableMath(header),...model.rows.map(row=>String(row[i]??""))];
  const longest=Math.max(...items.map(item=>/\\\(/.test(item)?diagramVisibleLength(item,17):item.length));
  const word=Math.max(...items.flatMap(item=>item.split(/\s+/).map(x=>/\\\(/.test(x)?diagramVisibleLength(x,17):x.length)));
  // Allow headings to wrap where needed; short values should stay compact.
  const estimate=28+Math.max(Math.min(200,longest*8.4),Math.min(202,word*9.4));
  return Math.max(MIN_COL_WIDTH,Math.min(MAX_COL_WIDTH,estimate));
 });
 let excess=total(desired)-MAX_TABLE_WIDTH;
 // Preserve minimum column widths while shrinking only genuinely wide tables.
 for(let n=0;n<10&&excess>0.02;n++){
  const capacity=desired.map(w=>Math.max(0,w-MIN_COL_WIDTH));
  const available=total(capacity);
  if(available<=0)break;
  let removed=0;
  for(let i=0;i<count;i++){
   const amount=Math.min(capacity[i],excess*capacity[i]/available);
   desired[i]-=amount;removed+=amount;
  }
  excess-=removed;
 }
 return desired.map(w=>Number(w.toFixed(3)));
}
function svgText(lines,x,y,lineHeight,attrs){
 if(!lines.some(line=>/\\\(|\\\[/.test(line)))
  return '<text x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" '+attrs+'>'+
    lines.map((line,i)=>'<tspan x="'+x.toFixed(1)+'" dy="'+(i?lineHeight:0)+'">'+E(line)+'</tspan>').join("")+
   '</text>';
 return lines.map((line,i)=>svgDiagramText(line,x,y+i*lineHeight,attrs)).join("");
}
function layout(model,d){
 const widths=tableWidths(model),tableWidth=total(widths);
 const title="Table "+d.number+". "+formatTableMath(d.title);
 // Keep the title within an A4-friendly width; wrap rather than widening a compact table.
 const innerWidth=Math.max(tableWidth,Math.min(560,(/\\\(/.test(title)?diagramVisibleLength(title,23):title.length)*11.25));
 const svgWidth=Math.ceil(innerWidth+PAGE_MARGIN*2);
 const tableLeft=(svgWidth-tableWidth)/2,positions=[tableLeft];
 widths.forEach(w=>positions.push(positions.at(-1)+w));
 const headers=model.headers.map((h,i)=>breakLines(formatTableMath(h),widths[i]-25,17));
 const rows=model.rows.map(row=>row.map((v,i)=>breakLines(v,widths[i]-25,17)));
 const headerHeight=Math.max(54,Math.max(...headers.map(lines=>lines.length))*23+19);
 const rowHeights=rows.map(cells=>Math.max(40,Math.max(...cells.map(lines=>lines.length))*23+14));
 const titleLines=breakLines(title,svgWidth-PAGE_MARGIN*2,23);
 const titleY=47,titleEnd=titleY+(titleLines.length-1)*29;
 const tableTop=titleEnd+40;
 const tableBottom=tableTop+headerHeight+total(rowHeights);
 const notes=[
  model.metadata,
  model.highlightNote?"Emphasis: "+model.highlightNote:"",
  model.note?formatTableMath(model.note.startsWith("Note:")?model.note:"Note: "+model.note):"",
  d.sourceKind==="primary"?"Source: student-collected data":
  d.sourceKind==="theoretical"?"Source: theoretical / student-constructed values (not measurements)":"Source: "+d.sourceText
 ].filter(Boolean);
 const footerLines=notes.flatMap(n=>breakLines(n,svgWidth-PAGE_MARGIN*2,14));
 const height=Math.max(275,tableBottom+39+footerLines.length*23+25);
 return {svgWidth,tableWidth,tableLeft,widths,positions,headers,rows,headerHeight,rowHeights,
  tableTop,tableBottom,titleLines,titleY,footerLines,height};
}
/** A4 portrait, 20 mm margins, measured in CSS pixels at 96 px / inch.
 * This is a presentation estimate; the final word-processor document may reflow.
 */
const A4={width:210*96/25.4,height:297*96/25.4,contentWidth:170*96/25.4,contentHeight:257*96/25.4};
export function assessTableA4(raw){
 const q=analyzeTable(raw);
 if(!q.model)return {ready:false,width:0,height:0,scale:1,bodyPt:0,footerPt:0,
  warnings:["Enter valid table data to check its size on A4."]};
 const L=layout(q.model,q.draft);
 const scale=Math.min(1,A4.contentWidth/L.svgWidth,A4.contentHeight/L.height);
 const bodyPt=Number((17*scale*.75).toFixed(1));
 const footerPt=Number((14*scale*.75).toFixed(1));
 const warnings=[];
 if(scale<.85)warnings.push("This table needs substantial shrinking to fit a portrait A4 page. Shorten headings or use a more focused table.");
 if(bodyPt<10.5)warnings.push("Estimated body text falls below 10.5 pt on A4. Reduce columns or shorten headings instead of accepting tiny type.");
 if(footerPt<9)warnings.push("The source/note text may become difficult to read at A4 size.");
 const splitWord=q.model.headers.some((heading,i)=>{
  const chars=Math.max(6,Math.floor((L.widths[i]-25)/(17*.54)));
  return (formatTableMath(heading).match(/\([^)]*\)|\S+/g)||[]).some(word=>word.length>chars);
 });
 if(splitWord)warnings.push("At least one heading contains a long unbroken term that has to split across lines. Consider a shorter heading.");
 const expectedWidth=L.svgWidth*scale,expectedHeight=L.height*scale;
 return {ready:true,width:L.svgWidth,height:L.height,scale,bodyPt,footerPt,
  contentWidth:A4.contentWidth,contentHeight:A4.contentHeight,
  pageWidth:A4.width,pageHeight:A4.height,
  usedWidth:expectedWidth,usedHeight:expectedHeight,
  warnings};
}
const alignment=(d,numeric)=>d.cellAlignment==="center"?"center":numeric?"right":"left";
const anchor=(alignment,x,w)=>alignment==="center"?{x:x+w/2,attr:"middle"}:
 alignment==="right"?{x:x+w-13,attr:"end"}:{x:x+13,attr:"start"};

export function renderTableSvg(raw){
 const check=analyzeTable(raw),d=check.draft,model=check.model;
 if(!model){
  return '<svg xmlns="http://www.w3.org/2000/svg" class="ia-table-svg" role="img" aria-label="Table preview needs corrections" viewBox="0 0 650 280" width="650" height="280">'+
   '<rect width="650" height="280" fill="#fff"/>'+
   '<rect x="28" y="35" width="594" height="210" fill="#f8fbfa" stroke="#d2e1de" rx="12"/>'+
   svgText(["Provide a short and mathematically valid table"],325,125,24,
    'text-anchor="middle" fill="#415f65" font-family="Arial,sans-serif" font-weight="700" font-size="19"')+
   svgText(["No rows have been hidden or shortened."],325,160,24,
    'text-anchor="middle" fill="#648088" font-family="Arial,sans-serif" font-size="15"')+"</svg>";
 }
 const L=layout(model,d),out=[
  '<svg xmlns="http://www.w3.org/2000/svg" class="ia-table-svg" role="img" aria-label="'+E("Table "+d.number+". "+d.title)+'" viewBox="0 0 '+L.svgWidth+" "+Math.round(L.height)+'" width="'+L.svgWidth+'" height="'+Math.round(L.height)+'">',
  '<rect width="'+L.svgWidth+'" height="'+Math.round(L.height)+'" fill="#fff"/>',
  svgText(L.titleLines,PAGE_MARGIN,L.titleY,29,'font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="23" fill="#263f49"'),
  '<rect x="'+L.tableLeft.toFixed(2)+'" y="'+L.tableTop+'" width="'+L.tableWidth.toFixed(2)+'" height="'+L.headerHeight+'" fill="#e8f3f0"/>',
  '<line x1="'+L.tableLeft.toFixed(2)+'" y1="'+L.tableTop+'" x2="'+(L.tableLeft+L.tableWidth).toFixed(2)+'" y2="'+L.tableTop+'" stroke="#286960" stroke-width="2.2"/>'
 ];
 let x=L.tableLeft;
 L.headers.forEach((lines,i)=>{
  const a=anchor(alignment(d,model.numeric[i]),x,L.widths[i]);
  out.push(svgText(lines,a.x,L.tableTop+26,23,
   'font-family="Arial,Helvetica,sans-serif" font-size="17" font-weight="700" fill="#244f50" text-anchor="'+a.attr+'"'));
  x+=L.widths[i];
 });
 const headingBottom=L.tableTop+L.headerHeight;
 out.push('<line class="ia-table-header-divider" x1="'+L.tableLeft.toFixed(2)+'" y1="'+headingBottom+
  '" x2="'+(L.tableLeft+L.tableWidth).toFixed(2)+'" y2="'+headingBottom+'" stroke="#bed4ce" stroke-width="1.3"/>');
 let y=headingBottom;
 model.rows.forEach((row,i)=>{
  const height=L.rowHeights[i],subtotal=["frequency","grouped"].includes(model.kind)&&i===model.rows.length-1;
  const highlighted=(model.highlightIndices||[]).includes(i);
  if(subtotal)out.push('<rect x="'+L.tableLeft.toFixed(2)+'" y="'+y+'" width="'+L.tableWidth.toFixed(2)+'" height="'+height+'" fill="#e9f3ef"/>');
  else if(highlighted){
   out.push('<rect class="ia-table-emphasis-row" data-table-emphasis-row="'+(i+1)+'" x="'+L.tableLeft.toFixed(2)+'" y="'+y+
    '" width="'+L.tableWidth.toFixed(2)+'" height="'+height+'" fill="#e5f2ea"/>');
   out.push('<rect x="'+L.tableLeft.toFixed(2)+'" y="'+y+'" width="4" height="'+height+'" fill="#417966"/>');
  }
  else if(i%2)out.push('<rect x="'+L.tableLeft.toFixed(2)+'" y="'+y+'" width="'+L.tableWidth.toFixed(2)+'" height="'+height+'" fill="#f6faf9"/>');
  if(d.showRowLines||subtotal)out.push('<line class="ia-table-row-divider" x1="'+L.tableLeft.toFixed(2)+'" y1="'+(y+height)+
   '" x2="'+(L.tableLeft+L.tableWidth).toFixed(2)+'" y2="'+(y+height)+'" stroke="#d5e1e1" stroke-width="1"/>');
  let px=L.tableLeft;
  row.forEach((_,j)=>{
   const a=anchor(alignment(d,model.numeric[j]),px,L.widths[j]);
   out.push(svgText(L.rows[i][j],a.x,y+26,23,
    'font-family="Arial,Helvetica,sans-serif" font-size="17" fill="#25434b" text-anchor="'+a.attr+'"'+
     (subtotal||highlighted?' font-weight="700"':"")));
   px+=L.widths[j];
  });
  y+=height;
 });
 if(d.showColumnLines){
  L.positions.slice(1,-1).forEach(x=>out.push('<line class="ia-table-column-divider" x1="'+x.toFixed(2)+'" y1="'+L.tableTop+
   '" x2="'+x.toFixed(2)+'" y2="'+L.tableBottom+'" stroke="#c1d6d1" stroke-width="1.2"/>'));
 }
 out.push('<line x1="'+L.tableLeft.toFixed(2)+'" y1="'+y+'" x2="'+(L.tableLeft+L.tableWidth).toFixed(2)+'" y2="'+y+
  '" stroke="#286960" stroke-width="2.2"/>');
 let footerY=y+32;
 for(const line of L.footerLines){
  out.push(svgText([line],PAGE_MARGIN,footerY,22,'font-family="Arial,Helvetica,sans-serif" font-size="14" fill="#566e75"'));
  footerY+=23;
 }
 out.push("</svg>");
 return out.join("");
}
const cellStyle=(width,align,bold=false,columnDivider=false,rowDivider=true)=>[
 "box-sizing:border-box","width:"+width.toFixed(1)+"px","overflow-wrap:break-word",
 "padding:7px 9px","font-family:Arial,Helvetica,sans-serif","font-size:12pt",
 "text-align:"+align,"vertical-align:middle",
 columnDivider?"border-left:1px solid #c1d6d1":"",
 rowDivider?"border-bottom:1px solid #d5e1e1":"",
 "color:#25434b",bold?"font-weight:700":""
].filter(Boolean).join(";");
export function tableToHtml(raw){
 const check=analyzeTable(raw);
 if(!check.ready)throw new Error("Complete the table's quality checks before copying.");
 const {model,draft:d}=check,sourceWidths=tableWidths(model);
 const sourceTotal=total(sourceWidths),htmlWidth=Math.round(Math.min(650,sourceTotal));
 const widths=sourceWidths.map(w=>w*htmlWidth/sourceTotal);
 const heading="Table "+d.number+". "+formatTableMath(d.title);
 const th=model.headers.map((header,i)=>
  '<th scope="col" style="'+cellStyle(widths[i],alignment(d,model.numeric[i]),true,d.showColumnLines&&i>0,true)+
  ';background:#e8f3f0;">'+diagramHtmlMath(header)+'</th>').join("");
 const body=model.rows.map((row,i)=>{
  const subtotal=["frequency","grouped"].includes(model.kind)&&i===model.rows.length-1;
  const highlighted=(model.highlightIndices||[]).includes(i);
  return '<tr'+(highlighted?' data-table-emphasis-row="'+(i+1)+'"':"")+'>'+row.map((value,j)=>'<td style="'+cellStyle(widths[j],alignment(d,model.numeric[j]),subtotal||highlighted,
    d.showColumnLines&&j>0,d.showRowLines||subtotal)+
   ';background:'+(subtotal?"#e9f3ef":highlighted?"#e5f2ea":i%2?"#f6faf9":"#ffffff")+';'+(highlighted?"border-left:3px solid #417966;":"")+'">'+diagramHtmlMath(value)+'</td>').join("")+'</tr>';
 }).join("");
 const foot=[model.metadata,model.highlightNote?"Emphasis: "+model.highlightNote:"",model.note,d.sourceKind==="primary"?"Source: student-collected data":
  d.sourceKind==="theoretical"?"Source: theoretical / student-constructed values (not measurements)":"Source: "+d.sourceText]
  .filter(Boolean).map(t=>'<p style="font-family:Arial,sans-serif;font-size:10pt;margin:5px 0 0;color:#566e75;">'+diagramHtmlMath(t)+'</p>').join("");
 return '<div style="max-width:'+htmlWidth+'px;">'+
  '<p style="font-family:Arial,sans-serif;font-weight:700;font-size:13pt;margin:0 0 8px;">'+diagramHtmlMath(heading)+'</p>'+
  '<table style="width:'+htmlWidth+'px;max-width:100%;table-layout:fixed;border-collapse:collapse;border-top:2px solid #286960;border-bottom:2px solid #286960;"><colgroup>'+
  widths.map(w=>'<col style="width:'+w.toFixed(1)+'px">').join("")+'</colgroup><thead><tr>'+th+'</tr></thead><tbody>'+body+
  '</tbody></table>'+foot+'</div>';
}
export function tableToTsv(raw){
 const q=analyzeTable(raw);
 if(!q.ready)throw new Error("Fix the required table checks before copying the data.");
 return [q.model.headers,...q.model.rows].map(row=>row.map(s=>String(s).replace(/\t/g," ").replace(/\r?\n/g," ")).join("\t")).join("\n");
}
