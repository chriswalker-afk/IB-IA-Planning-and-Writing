/**
 * IA export layout for bounded asymmetric probability trees.
 * Full authored labels are wrapped, not silently truncated, and annotations
 * sit above their own horizontal branch tails. The figure has no editor UI.
 */
import {svgDiagramText,diagramWrapLines} from "./diagram-notation.js";
const fmt=n=>Number(n.toFixed(6)).toString();
const xy=n=>Number(n).toFixed(1);
const svgText=(str,x,y,size=15,anchor="middle",color="#29485a",bold=500,max=190)=>
 svgDiagramText(String(str??""),x,y,'font-family="Arial,sans-serif" font-size="'+size+
 '" font-weight="'+bold+'" text-anchor="'+anchor+'" fill="'+color+'"',
 {maxWidth:max,fontSize:size});
function summary(check){
 const d=check.draft,out=[];
 if(!d.showEventCalculation||!check.ready)return out;
 if(check.event!==null)out.push("P("+d.eventName+") = "+fmt(check.event));
 if(check.condition!==null)out.push("P("+d.conditionName+") = "+fmt(check.condition));
 if(check.intersection!==null)out.push("P("+d.eventName+" ∩ "+d.conditionName+") = "+fmt(check.intersection));
 if(check.conditional!==null)out.push("P("+d.eventName+" | "+d.conditionName+") = "+fmt(check.conditional));
 else if(check.condition===0)out.push("P("+d.eventName+" | "+d.conditionName+") is undefined: P("+d.conditionName+") = 0");
 return out;
}
function labelMetrics(node){
 const label=node?.label?.trim()||"?";
 // Keep mathematical expressions atomic. Long ordinary text may wrap over
 // several lines rather than being squeezed into unreadable letter spacing.
 const lines=diagramWrapLines(label,29);
 const longest=Math.max(0,...lines.map(line=>line.length));
 const length=(node?.probability||"").length+4;
 const width=Math.max(140,Math.min(290,Math.ceil(Math.max(longest*7.5,length*7.4)+24)));
 return {lines:lines.length?lines:["?"],width,
  height:47+Math.max(0,lines.length-1)*19,veryLong:length>34||longest>34};
}
function diagramLayout(check){
 const d=check.draft,tree=check.tree,leafKeys=tree.leaves,rootX=96;
 const metrics=new Map(),columnWidths=Array(5).fill(140);
 let maxHeight=47,longLabels=0;
 for(const parent of tree.parents){
  parent.children.forEach((path,index)=>{
   const detail=labelMetrics(d.branches[parent.id]?.[index]);
   metrics.set(path,detail);
   columnWidths[path.length]=Math.max(columnWidths[path.length],detail.width);
   maxHeight=Math.max(maxHeight,detail.height);
   if(detail.veryLong||detail.lines.length>=3)longLabels++;
  });
 }
 const offsets=d.labelOffsets||{};
 const maxUp=Math.max(0,...Object.values(offsets).map(value=>Math.max(0,-(value?.y||0))));
 const spacing=Math.max(d.layoutStyle==="compact"?124:159,maxHeight+45+maxUp);
 // Keep long annotations below the title and stage headings.
 const top=Math.max(228,maxHeight+185);
 const depth=tree.maxDepth||d.stages;
 const stageX=[rootX];
 for(let i=1;i<=depth;i++)stageX.push(stageX[i-1]+Math.max(365,columnWidths[i]+148));
 const points=new Map();
 leafKeys.forEach((path,index)=>points.set(path,{x:stageX[path.length],y:top+index*spacing}));
 for(const parent of [...tree.parents].reverse()){
  const coords=parent.children.map(path=>points.get(path)?.y).filter(Number.isFinite);
  if(coords.length)points.set(parent.id,{x:stageX[parent.depth],y:(Math.min(...coords)+Math.max(...coords))/2});
 }
 if(!points.has(""))points.set("",{x:rootX,y:top});
 const last=Math.max(top,...[...points.values()].map(point=>point.y));
 const width=Math.ceil(stageX[depth]+(d.showProducts&&check.ready?290:90));
 return {points,stageX,metrics,spacing,depth,last,width,longLabels,maxHeight};
}
function selectedStyle(d,path,leaf){
 const chosenE=leaf&&d.eventLeaves.includes(path),chosenC=leaf&&d.conditionLeaves.includes(path);
 const mono=d.printStyle==="mono";
 const color=mono?"#304351":!leaf?"#43748f":chosenE&&chosenC?"#8a6725":
  chosenE?"#177363":chosenC?"#6652a1":"#42718c";
 const dash=!mono||!leaf?"":chosenE&&chosenC?' stroke-dasharray="9 4 2 4"':
  chosenE?' stroke-dasharray="9 4"':chosenC?' stroke-dasharray="2 4"':"";
 return {color,dash,chosenE,chosenC};
}
function legendRows(d){
 if(d.showPathLegend===false||!d.eventLeaves.length&&!d.conditionLeaves.length)return [];
 const rows=[];
 if(d.eventLeaves.length)rows.push({type:"event",name:d.eventName||"Event E",color:d.printStyle==="mono"?"#304351":"#177363",dash:"9 4"});
 if(d.conditionLeaves.length)rows.push({type:"condition",name:d.conditionName||"Condition C",color:d.printStyle==="mono"?"#304351":"#6652a1",dash:"2 4"});
 if(d.eventLeaves.some(path=>d.conditionLeaves.includes(path)))
  rows.push({type:"both",name:"Both events",color:d.printStyle==="mono"?"#304351":"#8a6725",dash:"9 4 2 4"});
 return rows;
}
/** Editor-only feedback; never printed in the SVG, saved probabilities unchanged. */
export function probabilityFigureDiagnostics(check){
 if(check.draft.treeMode!=="flexible")return null;
 const layout=diagramLayout(check),leaves=check.paths.length;
 const paperFontPt=14*Math.min(1,642/layout.width)*.75;
 const notes=[];
 if(paperFontPt<8)
  notes.push("At about 17 cm wide on an A4 page, branch text would be roughly "+paperFontPt.toFixed(1)+" pt. Enlarge the figure, use a landscape page, or present a smaller focused tree alongside the complete model.");
 if(leaves>=12)
  notes.push("This tree has "+leaves+" terminal outcomes. Check whether a second, more focused diagram would communicate the key result more clearly.");
 if(layout.longLabels)
  notes.push(layout.longLabels+" branch label"+(layout.longLabels===1?" is":"s are")+" long. Check their wrapping and mathematical notation in the enlarged preview or downloaded SVG.");
 if(Object.keys(check.draft.labelOffsets||{}).length)
  notes.push("You have moved some annotations. Inspect the exported figure for crossings or crowding.");
 if(check.draft.printStyle==="colour"&&legendRows(check.draft).length)
  notes.push("If the work may be printed in black and white, consider the monochrome line-style option and keep the event legend.");
 return {width:layout.width,estimatedFontPt:paperFontPt,terminalPaths:leaves,
  tall:leaves>=12,longLabels:layout.longLabels,notes};
}
export function renderFlexibleProbabilitySvg(check){
 const d=check.draft,L=diagramLayout(check),legend=legendRows(d),sum=summary(check);
 const captionLines=d.showCaption?diagramWrapLines((d.figureNumber.trim()?"Figure "+d.figureNumber.trim()+". ":"")+
  (d.caption.trim()||d.title.trim()),100).slice(0,4):[];
 const legendColumns=Math.max(1,Math.floor((L.width-100)/255));
 const legendLines=legend.length?Math.ceil(legend.length/legendColumns):0;
 const legendY=L.last+62,summaryY=L.last+(legend.length?112+Math.max(0,legendLines-1)*29:88);
 const captionY=summaryY+sum.length*27+(sum.length?15:0);
 const H=Math.ceil(captionY+captionLines.length*24+(captionLines.length?36:8));
 const out=['<svg xmlns="http://www.w3.org/2000/svg" role="img" data-prob-flexible="true" aria-label="Student-authored conditional probability tree with '+
  check.paths.length+' terminal paths" viewBox="0 0 '+L.width+' '+H+'">',
  '<rect width="'+L.width+'" height="'+H+'" fill="#fff"/>'];
 if(d.showTitle)out.push(svgText(d.title||"Probability tree",L.width/2,48,24,"middle","#23475a",700,L.width-80));
 if(d.showStageLabels)for(let level=0;level<L.depth;level++){
  const at=L.stageX[level+1]-15;
  out.push(svgText(d.stageLabels[level]||"Stage "+(level+1),
   (L.stageX[level]+at)/2,122,15,"middle","#2b6a70",700,L.stageX[level+1]-L.stageX[level]-38));
 }
 const terminal=new Set(check.tree.leaves),pathProb=new Map(check.paths.map(path=>[path.key,path.probability]));
 for(const parent of check.tree.parents){
  const start=L.points.get(parent.id);if(!start)continue;
  parent.children.forEach((id,index)=>{
   const finish=L.points.get(id),branch=d.branches[parent.id]?.[index],panel=L.metrics.get(id);
   if(!finish||!branch||!panel)return;
   const status=selectedStyle(d,id,terminal.has(id)),lineStart=finish.x-panel.width-18;
   out.push('<path data-prob-segment="'+id+'" d="M'+xy(start.x)+' '+xy(start.y)+
    ' L'+xy(lineStart)+' '+xy(finish.y)+' L'+xy(finish.x)+' '+xy(finish.y)+
    '" fill="none" stroke="'+status.color+'" stroke-width="2.6" stroke-linejoin="round"'+status.dash+'/>');
   const offset=d.labelOffsets?.[id]||{x:0,y:0};
   const x=finish.x-panel.width-13+(offset.x||0),y=finish.y-panel.height-14+(offset.y||0);
   out.push('<g class="probability-branch-annotation" data-branch="'+id+'">');
   out.push('<rect class="probability-label-panel" x="'+xy(x)+'" y="'+xy(y)+
    '" width="'+panel.width+'" height="'+panel.height+'" rx="5" fill="#fff"/>');
   panel.lines.forEach((line,k)=>out.push(svgText(line,x+panel.width/2,y+18+k*19,14,"middle","#294559",600,panel.width-14)));
   out.push(svgText(branch.probability.trim()?"P = "+branch.probability:"P = ?",
    x+panel.width/2,y+panel.height-8,14,"middle","#526a79",500,panel.width-14));
   out.push('</g>');
   out.push('<circle cx="'+xy(finish.x)+'" cy="'+xy(finish.y)+'" r="'+(terminal.has(id)?5.5:4.1)+
    '" fill="'+(terminal.has(id)?status.color:"#fff")+'" stroke="'+status.color+'" stroke-width="2"/>');
   if(d.showProducts&&check.ready&&terminal.has(id)){
    const probability=pathProb.get(id);
    if(probability!==null&&probability!==undefined)
     out.push(svgText("P(path) = "+fmt(probability),finish.x+21,finish.y+5,14,"start",status.color,600,246));
   }
  });
 }
 const root=L.points.get("");
 out.push('<circle cx="'+xy(root.x)+'" cy="'+xy(root.y)+'" r="6" fill="#23475a"/>');
 if(legend.length){
  out.push('<g class="probability-event-legend" aria-label="Highlighted event path styles">');
  legend.forEach((row,index)=>{
   const rowNumber=Math.floor(index/legendColumns),col=index%legendColumns;
   const rowCount=Math.min(legendColumns,legend.length-rowNumber*legendColumns);
   const startX=Math.max(48,(L.width-rowCount*255)/2);
   const x=startX+col*255,y=legendY+rowNumber*29;
   out.push('<line data-prob-legend="'+row.type+'" x1="'+xy(x)+'" y1="'+xy(y)+
    '" x2="'+xy(x+38)+'" y2="'+xy(y)+'" stroke="'+row.color+'" stroke-width="3"'+
    (d.printStyle==="mono"?' stroke-dasharray="'+row.dash+'"':"")+'/>');
   out.push(svgText(row.name,x+51,y+5,13,"start","#2d4a60",600,188));
  });
  out.push('</g>');
 }
 sum.forEach((line,index)=>out.push(svgText(line,L.width/2,summaryY+index*27,15,"middle","#285d60",600,L.width-88)));
 captionLines.forEach((line,index)=>out.push(svgText(line,L.width/2,captionY+index*24,15,"middle","#3e5764",400,L.width-88)));
 out.push('</svg>');return out.join("");
}
