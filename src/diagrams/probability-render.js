/** An IA figure contains mathematical content, not the editor's instructions or warnings. */
import {probabilityAnalysis} from "./probability-core.js";
import {renderFlexibleProbabilitySvg} from "./probability-flexible-render.js";
import {svgDiagramText,diagramSafeExcerpt,diagramWrapLines} from "./diagram-notation.js";

const X=[80,365,700,1030];
const fmt=(x,decimals=6)=>Number(x.toFixed(decimals)).toString();
const text=(label,x,y,size=16,anchor="middle",colour="#2d4a60",weight=500,max=230,halo=false)=>
 svgDiagramText(String(label??""),x,y,'font-family="Arial,sans-serif" font-size="'+size+
 '" font-weight="'+weight+'" text-anchor="'+anchor+'" fill="'+colour+'"'+
 (halo?' stroke="#fff" stroke-width="4" stroke-linejoin="round" paint-order="stroke"':""),
 {maxWidth:max,fontSize:size});
const positions=(level,index,depth)=>{
 const top=depth===3?200:218,spacing=depth===3?78:136;
 const width=2**(depth-level),low=index*width,high=low+width-1;
 return top+(low+high)/2*spacing;
};
const colourFor=(d,id)=>{
 const leaf=id.length===d.stages,yes=leaf&&d.eventLeaves.includes(id),cond=leaf&&d.conditionLeaves.includes(id);
 return yes&&cond?"#9a6e29":yes?"#197567":cond?"#6653a1":"#42718c";
};
function mathematicalSummary(check){
 const d=check.draft,parts=[];
 if(!d.showEventCalculation||!check.ready)return parts;
 if(check.event!==null)parts.push(d.eventName+": "+fmt(check.event));
 if(check.condition!==null)parts.push(d.conditionName+": "+fmt(check.condition));
 if(check.intersection!==null)parts.push("Intersection: "+fmt(check.intersection));
 if(check.conditional!==null)parts.push("P("+d.eventName+" | "+d.conditionName+") = "+fmt(check.conditional));
 else if(check.condition===0)parts.push("P("+d.eventName+" | "+d.conditionName+") is undefined: P("+d.conditionName+") = 0");
 return parts;
}
export function renderProbabilitySvg(raw){
 const check=probabilityAnalysis(raw),d=check.draft,depth=d.stages;
 if(d.treeMode==="flexible")return renderFlexibleProbabilitySvg(check);
 const showProducts=d.showProducts&&check.ready,showCaption=d.showCaption;
 const W=depth===3?(showProducts?1350:1145):(showProducts?1020:800);
 const last=positions(depth,2**depth-1,depth);
 const sums=mathematicalSummary(check);
 const caption=(d.caption.trim()||d.title.trim());
 const captionLines=showCaption?diagramWrapLines((d.figureNumber.trim()?"Figure "+d.figureNumber.trim()+". ":"")+caption,90).slice(0,4):[];
 const summaryY=last+58;
 const captionY=summaryY+sums.length*23+(sums.length?17:0);
 const H=Math.ceil(captionY+captionLines.length*21+(captionLines.length?29:7));
 const out=['<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Student-authored '+
  depth+'-stage probability tree" viewBox="0 0 '+W+' '+H+'">'];
 out.push('<rect width="'+W+'" height="'+H+'" fill="#fff"/>');
 if(d.showTitle)out.push(text(d.title||"Probability tree",W/2,47,25,"middle","#23475a",700,W-96));
 if(d.showStageLabels)for(let level=0;level<depth;level++)
  out.push(text(d.stageLabels[level]||"Stage "+(level+1),X[level+1],124,15,"middle","#2f6968",700,245));
 for(let level=0;level<depth;level++){
  const parents=Array.from({length:2**level},(_,i)=>level?i.toString(2).padStart(level,"0"):"");
  for(const id of parents){
   const y0=positions(level,level?parseInt(id,2):0,depth),x0=X[level],x1=X[level+1];
   for(let bit=0;bit<2;bit++){
    const next=id+bit,y1=positions(level+1,parseInt(next,2),depth);
    const node=d.branches[id][bit],col=colourFor(d,next);
    out.push('<path data-prob-segment="'+next+'" d="M'+x0+' '+y0+' L'+x1+' '+y1+'" stroke="'+col+'" stroke-width="2.7" fill="none"/>');
    out.push('<circle cx="'+x1+'" cy="'+y1+'" r="4.5" fill="'+col+'" stroke="#fff" stroke-width="1.5"/>');
    const dx=x1-x0,dy=y1-y0,length=Math.hypot(dx,dy),nx=dy/length,ny=-dx/length;
    const midpointX=x0+dx*.53,midpointY=y0+dy*.53;
    // Two separate baselines on the open side of the branch, with a white halo
    // for long labels. Neither line of text sits on top of the drawn segment.
    const outcomeX=midpointX+nx*43,outcomeY=midpointY+ny*43;
    const probabilityX=midpointX+nx*20,probabilityY=midpointY+ny*20;
    out.push('<g class="probability-branch-annotation" data-branch="'+next+'">');
    out.push(text(diagramSafeExcerpt(node.label||"?",90),outcomeX,outcomeY,15,"middle","#294559",600,216,true));
    out.push(text(node.probability.trim()?"P = "+node.probability:"P = ?",probabilityX,probabilityY,14,"middle","#526a79",500,210,true));
    out.push('</g>');
    if(level===depth-1&&showProducts){
     const path=check.paths.find(v=>v.key===next);
     if(path)out.push(text("P(path) = "+fmt(path.probability),X[depth]+25,y1+5,14,"start",col,600,235,true));
    }
   }
  }
 }
 out.push('<circle cx="'+X[0]+'" cy="'+positions(0,0,depth)+'" r="6.5" fill="#23475a"/>');
 sums.forEach((result,i)=>out.push(text(result,W/2,summaryY+i*23,15,"middle","#285d60",600,W-80)));
 captionLines.forEach((line,i)=>out.push(text(line,W/2,captionY+i*21,15,"middle","#3e5764",400,W-80)));
 out.push('</svg>');
 return out.join("");
}
