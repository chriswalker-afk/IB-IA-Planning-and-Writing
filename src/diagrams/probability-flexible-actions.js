/** Student-directed edits to a bounded variable-arity probability tree. */
import {probabilityLeafPaths,probabilityParentPaths} from "./probability-core.js";
import {createFlexiblePreset,pruneFlexibleSelections,MAX_TREE_OUTCOMES,MAX_TREE_LEAVES,
 flexibleTreeStructure} from "./probability-flexible-core.js";
const child=(label="Outcome")=>({label,probability:""});
export function chooseProbabilityPreset(studio,preset){
 const previous=studio?.draft;if(!previous)return false;
 const next=createFlexiblePreset(preset,previous);
 if(!next)return false;
 studio.activeId="";studio.draft=next;studio.open=true;return true;
}
export function enableFlexibleProbability(studio){
 const d=studio?.draft;
 if(!d)return false;
 if(d.treeMode==="flexible")return true;
 d.treeMode="flexible";d.terminalNodes=[];
 d.layoutStyle="spacious";d.edited=true;
 return true;
}
export function addProbabilityOutcome(studio,parent){
 const d=studio?.draft;
 if(d?.treeMode!=="flexible"||!probabilityParentPaths(d).includes(parent))return {ok:false,error:"Choose an active split first."};
 const siblings=d.branches[parent];
 if(siblings.length>=MAX_TREE_OUTCOMES)return {ok:false,error:"Use at most five outcomes per split."};
 const newKey=parent+siblings.length;
 siblings.push(child("Outcome "+(siblings.length+1)));
 if(newKey.length<d.stages)d.terminalNodes.push(newKey);
 const tree=flexibleTreeStructure(d);
 if(tree.leaves.length>MAX_TREE_LEAVES||tree.issues.length){
  siblings.pop();d.terminalNodes=d.terminalNodes.filter(x=>x!==newKey);
  return {ok:false,error:"That would exceed the maximum of "+MAX_TREE_LEAVES+" complete paths."};
 }
 pruneFlexibleSelections(d);d.edited=true;return {ok:true,path:newKey};
}
/** Reindex siblings and their complete subtrees; never orphan a selected leaf. */
export function removeProbabilityOutcome(studio,parent,index){
 const d=studio?.draft;
 if(d?.treeMode!=="flexible"||!probabilityParentPaths(d).includes(parent))return {ok:false,error:"Choose an active split first."};
 const siblings=d.branches[parent];
 if(!Number.isInteger(index)||index<0||index>=siblings.length)return {ok:false,error:"Outcome not found."};
 if(siblings.length<=2)return {ok:false,error:"Keep at least two outcomes in every active split."};
 const remap=key=>{
  if(!key.startsWith(parent)||key.length<=parent.length)return key;
  const digit=Number(key[parent.length]);
  if(digit===index)return null;
  return digit>index?parent+String(digit-1)+key.slice(parent.length+1):key;
 };
 const branches={};
 for(const [key,children] of Object.entries(d.branches)){
  const next=remap(key);if(next===null)continue;
  branches[next]=key===parent?children.filter((_,i)=>i!==index):children;
 }
 d.branches=branches;
 d.terminalNodes=[...new Set(d.terminalNodes.map(remap).filter(x=>x!==null))];
 for(const field of ["eventLeaves","conditionLeaves"])
  d[field]=[...new Set(d[field].map(remap).filter(x=>x!==null))];
 pruneFlexibleSelections(d);d.edited=true;return {ok:true};
}
export function changeProbabilityContinuation(studio,path,continueBranch){
 const d=studio?.draft;
 if(d?.treeMode!=="flexible"||typeof path!=="string"||!/^[0-4]{1,4}$/.test(path)||
  path.length>=d.stages)return {ok:false,error:"This outcome cannot extend beyond the configured stages."};
 const parent=path.slice(0,-1),index=Number(path.at(-1));
 if(!probabilityParentPaths(d).includes(parent)||index>=d.branches[parent].length)
  return {ok:false,error:"That outcome is no longer an active part of the tree."};
 if(continueBranch){
  d.terminalNodes=d.terminalNodes.filter(x=>x!==path);
  if(!Array.isArray(d.branches[path])||d.branches[path].length<2){
   d.branches[path]=[child("Yes"),child("No")];
   if(path.length+1<d.stages)for(let bit=0;bit<2;bit++)
    d.terminalNodes.push(path+bit);
  }
 }else{
  if(!d.terminalNodes.includes(path))d.terminalNodes.push(path);
 }
 d.terminalNodes=[...new Set(d.terminalNodes)];
 pruneFlexibleSelections(d);d.edited=true;return {ok:true};
}
export function changeProbabilityStages(studio,value){
 const d=studio?.draft;
 if(!d||d.treeMode!=="flexible")return false;
 const next=Number(value);
 if(!Number.isInteger(next)||next<1||next>4)return false;
 if(next>d.stages){
  // Old last-stage paths become explicitly terminal. Adding a stage must not
  // invalidate a previously valid probability model or invent outcomes.
  const existing=probabilityLeafPaths(d);
  d.terminalNodes=[...new Set([...d.terminalNodes,...existing.filter(p=>p.length===d.stages)])];
 }
 d.stages=next;
 pruneFlexibleSelections(d);d.edited=true;return true;
}
