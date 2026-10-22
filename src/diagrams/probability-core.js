import {normaliseFlexibleBranches,normaliseTerminalNodes,flexibleTreeStructure,flexibleLeaves,flexibleParents,
 analyseFlexibleProbability,MAX_TREE_STAGES} from "./probability-flexible-core.js";
/**
 * Probability Tree Studio. Each split is a conditional distribution given
 * its exact history. Never infer independence or silently normalise values.
 * All examples are explicitly student-entered; blank probabilities stay blank.
 */
export const MAX_PROBABILITY_FIGURES=12;
export const PARENTS=["","0","1","00","01","10","11"];
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const plain=x=>x&&typeof x==="object"&&!Array.isArray(x);
const clean=(x,n=160)=>typeof x==="string"?x.slice(0,n):"";
const branch=(label="")=>({label,probability:""});
export const activeParents=stages=>PARENTS.slice(0,stages===3?7:3);
export const leafKeys=stages=>Array.from({length:2**(stages===3?3:2)},(_,i)=>i.toString(2).padStart(stages===3?3:2,"0"));

export function newProbabilityDraft(){
 const branches={};
 for(const id of PARENTS)branches[id]=[branch(id?"Yes":"Event A"),branch(id?"No":"Not A")];
 return {title:"Successive and conditional outcomes",figureNumber:"1",caption:"",showTitle:true,showCaption:false,showStageLabels:true,stages:2,
  stageLabels:["First event","Second event","Third event","Fourth event"],branches,
  treeMode:"standard",terminalNodes:[],layoutStyle:"spacious",
  showProducts:false,showEventCalculation:false,eventName:"Event E",conditionName:"Condition C",
  eventLeaves:[],conditionLeaves:[],sourceKind:"theoretical",sourceCredit:"",note:"",edited:false};
}
export function normalizeProbabilityDraft(raw){
 const blank=newProbabilityDraft(),r=plain(raw)?raw:{};
 for(const field of ["title","figureNumber","caption","eventName","conditionName","sourceCredit","note"])
  if(typeof r[field]==="string")blank[field]=clean(r[field],["sourceCredit","note"].includes(field)?800:180);
 blank.treeMode=r.treeMode==="flexible"?"flexible":"standard";
 blank.stages=blank.treeMode==="flexible"&&Number.isInteger(r.stages)&&r.stages>=1&&r.stages<=MAX_TREE_STAGES?
   r.stages:r.stages===3?3:2;
 blank.layoutStyle=r.layoutStyle==="compact"?"compact":"spacious";
 for(const flag of ["showProducts","showEventCalculation","showTitle","showCaption","showStageLabels","edited"])
  if(typeof r[flag]==="boolean")blank[flag]=r[flag];
 if(["primary","secondary","theoretical","unsure"].includes(r.sourceKind))
  blank.sourceKind=r.sourceKind;
 if(Array.isArray(r.stageLabels))
  blank.stageLabels=blank.stageLabels.map((v,i)=>clean(r.stageLabels[i],80)||v);
 if(plain(r.branches)){
  for(const id of PARENTS)if(own(r.branches,id)&&Array.isArray(r.branches[id])){
   blank.branches[id]=[0,1].map(i=>{
    const item=r.branches[id][i];
    return {label:clean(item?.label,80),probability:clean(item?.probability,60)};
   });
  }
 }
 if(blank.treeMode==="flexible"){
  blank.branches=normaliseFlexibleBranches(r.branches);
  blank.terminalNodes=normaliseTerminalNodes(r.terminalNodes);
 }
 const valid=new Set(blank.treeMode==="flexible"?flexibleLeaves(blank):leafKeys(blank.stages));
 for(const key of ["eventLeaves","conditionLeaves"])
  if(Array.isArray(r[key]))blank[key]=[...new Set(r[key].filter(x=>typeof x==="string"&&valid.has(x)))];
 return blank;
}
export const probabilityLeafPaths=d=>d?.treeMode==="flexible"?flexibleLeaves(d):leafKeys(d?.stages);
export const probabilityParentPaths=d=>d?.treeMode==="flexible"?flexibleParents(d):activeParents(d?.stages);
export const probabilityStructure=d=>d?.treeMode==="flexible"?flexibleTreeStructure(d):null;
export const newProbabilityStudio=()=>({open:false,zoomed:false,editLevel:0,draft:newProbabilityDraft(),figures:[],activeId:""});
export function normalizeProbabilityStudio(raw){
 const r=plain(raw)?raw:{};
 const figures=(Array.isArray(r.figures)?r.figures:[]).slice(0,MAX_PROBABILITY_FIGURES)
  .filter(plain).map(f=>({id:clean(f.id,65),entryId:clean(f.entryId,80),
   savedAt:clean(f.savedAt,42),draft:normalizeProbabilityDraft(f.draft)}))
  .filter(f=>/^probability-[a-z0-9-]+$/i.test(f.id));
 return {open:r.open===true,zoomed:r.zoomed===true,editLevel:Number.isInteger(r.editLevel)&&r.editLevel>=0&&r.editLevel<=3?r.editLevel:0,
  draft:normalizeProbabilityDraft(r.draft),figures,
  activeId:figures.some(f=>f.id===r.activeId)?r.activeId:""};
}
export function probabilityValue(input){
 const text=String(input??"").trim();
 if(!text)return null;
 let value=null;
 const fraction=/^([+]?(?:\d+(?:\.\d+)?|\.\d+))\s*\/\s*([+]?(?:\d+(?:\.\d+)?|\.\d+))$/.exec(text);
 const percent=/^([+]?(?:\d+(?:\.\d+)?|\.\d+))\s*%$/.exec(text);
 if(fraction){
  const bottom=Number(fraction[2]);if(bottom>0)value=Number(fraction[1])/bottom;
 }else if(percent)value=Number(percent[1])/100;
 else if(/^[+]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(text))value=Number(text);
 return value!==null&&Number.isFinite(value)&&value>=0&&value<=1?value:null;
}
export function probabilityAnalysis(raw){
 const d=normalizeProbabilityDraft(raw),issues=[],notes=[],values={};
 if(d.treeMode==="flexible")return analyseFlexibleProbability(d,probabilityValue);
 for(const id of activeParents(d.stages)){
  const pair=d.branches[id],probabilities=pair.map(b=>probabilityValue(b.probability));
  const source=id.length?("after "+id.split("").map((bit,i)=>d.branches[id.slice(0,i)][Number(bit)].label||"?").join(" → ")):"at the first split";
  if(pair.some(x=>!x.label.trim())||pair[0].label.trim().toLowerCase()===pair[1].label.trim().toLowerCase())
   issues.push("Give both outcomes distinct labels "+source+".");
  if(probabilities.some(v=>v===null))
   issues.push("Enter two valid probabilities "+source+" (0 to 1; decimals, fractions or %).");
  else if(Math.abs(probabilities[0]+probabilities[1]-1)>1e-8)
   issues.push("Branch probabilities "+source+" must sum to 1 (currently "+(probabilities[0]+probabilities[1]).toPrecision(8)+").");
  values[id]=probabilities;
 }
 if(!d.title.trim())issues.push("Give the diagram a descriptive title.");
 if(d.sourceKind==="secondary"&&!d.sourceCredit.trim())issues.push("Cite the published probability source.");
 if(d.sourceKind==="unsure")notes.push("Clarify whether these are a theoretical model, measured estimates or published probabilities.");
 notes.push("Each pair of branches is conditional on its preceding history. Repeating the same probabilities does not by itself establish independence.");
 const ready=!issues.length;
 const paths=leafKeys(d.stages).map(key=>{
  const factors=[],labels=[],steps=[];
  for(let i=0;i<key.length;i++){
   const parent=key.slice(0,i),idx=Number(key[i]),node=d.branches[parent][idx];
   factors.push(values[parent]?.[idx]??null);
   steps.push(node.probability);
   labels.push(node.label);
  }
  return {key,labels,factors,steps,probability:factors.some(v=>v===null)?null:factors.reduce((a,b)=>a*b,1)};
 });
 const total=ready?paths.reduce((n,x)=>n+x.probability,0):null;
 const selected=key=>paths.filter(p=>d[key].includes(p.key));
 const sum=rows=>rows.reduce((n,p)=>n+p.probability,0);
 let event=null,condition=null,intersection=null,conditional=null;
 if(ready&&d.showEventCalculation){
  if(d.eventLeaves.length)event=sum(selected("eventLeaves"));
  if(d.conditionLeaves.length)condition=sum(selected("conditionLeaves"));
  if(d.eventLeaves.length&&d.conditionLeaves.length){
   intersection=sum(paths.filter(p=>d.eventLeaves.includes(p.key)&&d.conditionLeaves.includes(p.key)));
   conditional=condition>1e-12?intersection/condition:null;
   if(condition<=1e-12)notes.push("P(E | C) is undefined because P(C)=0. Do not divide by zero.");
  }
 }
 return {draft:d,ready,issues,notes,values,paths,total,event,condition,intersection,conditional};
}
export const probabilitySignature=d=>JSON.stringify([
 d.title,d.figureNumber,d.caption,d.showTitle,d.showCaption,d.showStageLabels,
 d.treeMode,d.terminalNodes,d.layoutStyle,d.stages,d.stageLabels,d.branches,d.eventLeaves,d.conditionLeaves,
 d.showProducts,d.showEventCalculation,d.sourceKind,d.sourceCredit,d.note,d.eventName,d.conditionName
]);
export function saveProbabilityFigure(studio,entryId=""){
 const check=probabilityAnalysis(studio?.draft);
 if(!check.ready)return {ok:false,error:check.issues[0],checks:check};
 const prev=studio.figures.find(f=>f.id===studio.activeId);
 if(!prev&&studio.figures.length>=MAX_PROBABILITY_FIGURES)
  return {ok:false,error:"Twelve probability-tree figures are already saved. Existing work was not overwritten."};
 const id=prev?.id||"probability-"+Date.now().toString(36)+"-"+Math.floor(Math.random()*10000).toString(36);
 const record={id,entryId:entryId||prev?.entryId||"",savedAt:new Date().toISOString(),
  draft:{...check.draft,edited:true}};
 const index=studio.figures.findIndex(f=>f.id===id);
 if(index<0)studio.figures.push(record);else studio.figures[index]=record;
 studio.activeId=id;studio.draft=normalizeProbabilityDraft(record.draft);
 return {ok:true,record};
}
