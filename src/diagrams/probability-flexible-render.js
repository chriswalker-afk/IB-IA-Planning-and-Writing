/** Accessible, IA-ready SVG layout for asymmetric variable-outcome trees. */
import {svgDiagramText,diagramSafeExcerpt,diagramWrapLines} from "./diagram-notation.js";
const fmt=(n)=>Number(n.toFixed(6)).toString();
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
function layout(check){
 const d=check.draft,tree=check.tree,spacing=d.layoutStyle==="compact"?124:159,
  top=208,step=365,left=83;
 const points=new Map();
 tree.leaves.forEach((key,index)=>points.set(key,{x:left+key.length*step,y:top+index*spacing}));
 for(const parent of [...tree.parents].reverse()){
  const ys=parent.children.map(id=>points.get(id)?.y).filter(Number.isFinite);
  if(ys.length)points.set(parent.id,{x:left+parent.depth*step,y:(Math.min(...ys)+Math.max(...ys))/2});
 }
 if(!points.has(""))points.set("",{x:left,y:top});
 const depth=tree.maxDepth||d.stages;
 return {points,depth,spacing,last:Math.max(...[...points.values()].map(p=>p.y),top),
  width:Math.ceil(left+depth*step+(d.showProducts&&check.ready?290:95))};
}
const colour=(d,id,leaf)=>!leaf?"#43748f":d.eventLeaves.includes(id)&&d.conditionLeaves.includes(id)?"#8a6725":
 d.eventLeaves.includes(id)?"#177363":d.conditionLeaves.includes(id)?"#6652a1":"#42718c";
export function renderFlexibleProbabilitySvg(check){
 const d=check.draft,{points,depth,last,width}=layout(check),sum=summary(check);
 const captionLines=d.showCaption?diagramWrapLines((d.figureNumber.trim()?"Figure "+d.figureNumber.trim()+". ":"")+
  (d.caption.trim()||d.title.trim()),100).slice(0,4):[];
 const summaryY=last+89,captionY=summaryY+sum.length*27+(sum.length?15:0);
 const H=Math.ceil(captionY+captionLines.length*24+(captionLines.length?38:6));
 const out=['<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Student-authored conditional probability tree with '+
  check.paths.length+' terminal paths" viewBox="0 0 '+width+' '+H+'">','<rect width="'+width+'" height="'+H+'" fill="#fff"/>'];
 if(d.showTitle)out.push(svgText(d.title||"Probability tree",width/2,49,24,"middle","#23475a",700,width-90));
 if(d.showStageLabels)for(let level=0;level<depth;level++)
  out.push(svgText(d.stageLabels[level]||"Stage "+(level+1),83+(level+1)*365-75,120,
   15,"middle","#2b6a70",700,230));
 const terminal=new Set(check.tree.leaves),pathProb=new Map(check.paths.map(x=>[x.key,x.probability]));
 for(const parent of check.tree.parents){
  const start=points.get(parent.id);
  if(!start)continue;
  for(let i=0;i<parent.children.length;i++){
   const id=parent.children[i],finish=points.get(id),outcome=d.branches[parent.id]?.[i];
   if(!finish||!outcome)continue;
   const col=colour(d,id,terminal.has(id)),tail=finish.x-152;
   // The last part of every branch is horizontal. Its probability/label sit in
   // a distinct white strip ABOVE that part of the line: no probability
   // can be printed across the segment it describes.
   out.push('<path data-prob-segment="'+id+'" d="M'+xy(start.x)+' '+xy(start.y)+
    ' L'+xy(tail)+' '+xy(finish.y)+' L'+xy(finish.x)+' '+xy(finish.y)+
    '" fill="none" stroke="'+col+'" stroke-width="2.6" stroke-linejoin="round"/>');
   const lx=finish.x-83,ly=finish.y-58;
   out.push('<g class="probability-branch-annotation" data-branch="'+id+'">');
   out.push('<rect class="probability-label-panel" x="'+xy(lx-70)+'" y="'+xy(ly-3)+
    '" width="140" height="47" rx="5" fill="#fff"/>');
   out.push(svgText(diagramSafeExcerpt(outcome.label||"?",85),lx,ly+15,14,"middle","#294559",600,135));
   out.push(svgText(outcome.probability.trim()?"P = "+outcome.probability:"P = ?",lx,ly+36,14,
    "middle","#526a79",500,135));
   out.push('</g>');
   out.push('<circle cx="'+xy(finish.x)+'" cy="'+xy(finish.y)+'" r="'+(terminal.has(id)?5.5:4.1)+
    '" fill="'+(terminal.has(id)?col:"#fff")+'" stroke="'+col+'" stroke-width="2"/>');
   if(d.showProducts&&check.ready&&terminal.has(id)){
    const probability=pathProb.get(id);
    if(probability!==null&&probability!==undefined)
     out.push(svgText("P(path) = "+fmt(probability),finish.x+21,finish.y+5,14,"start",col,600,245));
   }
  }
 }
 const root=points.get("");
 out.push('<circle cx="'+xy(root.x)+'" cy="'+xy(root.y)+'" r="6" fill="#23475a"/>');
 sum.forEach((line,i)=>out.push(svgText(line,width/2,summaryY+i*27,15,"middle","#285d60",600,width-90)));
 captionLines.forEach((line,i)=>out.push(svgText(line,width/2,captionY+i*24,15,"middle","#3e5764",400,width-90)));
 out.push('</svg>');return out.join("");
}
