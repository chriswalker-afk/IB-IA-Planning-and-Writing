/** SVG is built from the saved mathematics, not a screenshot. */
import {probabilityAnalysis} from "./probability-core.js";
import {svgDiagramText,diagramSafeExcerpt} from "./diagram-notation.js";
const W=1300,H=856;
const nodeX=[105,380,710,1040];
const fmt=(x,decimals=4)=>Number(x.toFixed(decimals)).toString();
const text=(label,x,y,size=16,anchor="middle",colour="#2d4a60",weight=500,max=230)=>
 svgDiagramText(String(label??""),x,y,'font-family="Arial,sans-serif" font-size="'+size+
 '" font-weight="'+weight+'" text-anchor="'+anchor+'" fill="'+colour+'"',
 {maxWidth:max,fontSize:size});
const positions=(level,index,stages)=>{
 const count=2**stages,spacing=stages===3?83:145,top=stages===3?130:205;
 const low=(index*2**(stages-level)),high=low+2**(stages-level)-1;
 return top+(low+high)/2*spacing;
};
const colourFor=(d,id)=>{
 const leaf=id.length===d.stages,yes=leaf&&d.eventLeaves.includes(id),cond=leaf&&d.conditionLeaves.includes(id);
 return yes&&cond?"#9a6e29":yes?"#197567":cond?"#6653a1":"#42718c";
};
export function renderProbabilitySvg(raw){
 const check=probabilityAnalysis(raw),d=check.draft,depth=d.stages;
 const out=['<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Student-authored '+
  depth+'-stage probability tree" viewBox="0 0 '+W+' '+H+'">'];
 out.push('<rect width="'+W+'" height="'+H+'" fill="#fff"/>');
 out.push(text(d.title||"Probability tree",W/2,46,25,"middle","#23475a",700,1090));
 out.push(text("Every split gives probabilities conditional on its preceding outcomes.",W/2,76,15,"middle","#5f7680",400,1080));
 for(let level=0;level<depth;level++)
  out.push(text(d.stageLabels[level]||"Stage "+(level+1),nodeX[level+1],112,15,"middle","#2f6968",700,225));
 for(let level=0;level<depth;level++){
  const parents=Array.from({length:2**level},(_,i)=>i.toString(2).padStart(level,"0")).map(id=>level?id:"");
  for(const id of parents){
   const y0=positions(level,level?parseInt(id,2):0,depth);
   for(let bit=0;bit<2;bit++){
    const next=id+bit,idx=Number.parseInt(next,2),y1=positions(level+1,idx,depth);
    const node=d.branches[id][bit],p=check.values[id]?.[bit],col=colourFor(d,next);
    const x0=nodeX[level],x1=nodeX[level+1];
    out.push('<path d="M'+x0+' '+y0+' L'+x1+' '+y1+'" stroke="'+col+'" stroke-width="3" fill="none"/>');
    out.push('<circle cx="'+x1+'" cy="'+y1+'" r="5" fill="'+col+'" stroke="#fff" stroke-width="2"/>');
    const label=diagramSafeExcerpt(node.label||"Outcome not labelled",90);
    const probability=node.probability.trim()?"P = "+node.probability:"P = ?";
    // Place text directly above the current segment, leaving clear space for the next.
    out.push(text(label,x0+(x1-x0)*.57,y0+(y1-y0)*.57-20,14,"middle","#294559",600,210));
    out.push(text(probability,x0+(x1-x0)*.57,y0+(y1-y0)*.57-3,13,"middle","#627783",400,192));
    if(level===depth-1&&d.showProducts&&check.ready){
     const path=check.paths.find(v=>v.key===next);
     if(path)out.push(text("P(path) = "+fmt(path.probability,6),nodeX[depth]+24,y1+5,14,"start",col,600,220));
    }
  }
 }
 }
 out.push('<circle cx="'+nodeX[0]+'" cy="'+positions(0,0,depth)+'" r="7" fill="#23475a"/>');
 if(d.showEventCalculation){
  const y=depth===3?800:780;
  const parts=[];
  if(check.ready){
   if(check.event!==null)parts.push(d.eventName+": "+fmt(check.event,6));
   if(check.condition!==null)parts.push(d.conditionName+": "+fmt(check.condition,6));
   if(check.intersection!==null)parts.push("Intersection: "+fmt(check.intersection,6));
   if(check.conditional!==null)parts.push("P("+d.eventName+" | "+d.conditionName+") = "+fmt(check.conditional,6));
   else if(check.condition===0)parts.push("Conditional probability undefined: denominator = 0");
  }
  out.push(text(parts.join("   •   ")||"Choose terminal paths for an event or condition to calculate their probabilities.",W/2,y,14,"middle","#285d60",600,1190));
 }
 if(!check.ready)
  out.push(text("Check the branch probabilities before saving or using any calculated result.",W/2,810,15,"middle","#9b483e",600,1040));
 const footer=d.sourceKind==="secondary"?"Source: "+(d.sourceCredit||"provide a published citation"):
  d.sourceKind==="primary"?"Based on entered primary data: explain how probabilities were estimated":
  d.sourceKind==="theoretical"?"Theoretical probabilities: state the model assumptions":"Confirm the probability source";
 out.push(text(diagramSafeExcerpt(footer,175),W/2,836,12,"middle","#637983",400,1180));
 out.push('</svg>');
 return out.join("");
}
