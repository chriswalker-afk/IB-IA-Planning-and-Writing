/**
 * Variable-arity, asymmetric conditional probability trees. Each node represents
 * an exact preceding outcome history, not an independence assumption.
 * Saved binary trees retain their existing IDs and mathematical definitions.
 */
export const MAX_TREE_STAGES=4,MAX_TREE_OUTCOMES=5,MAX_TREE_LEAVES=32,MAX_TREE_SPLITS=48;
const record=x=>x&&typeof x==="object"&&!Array.isArray(x);
const clean=(x,n)=>typeof x==="string"?x.slice(0,n):"";
const idAllowed=id=>typeof id==="string"&&/^[0-4]{0,3}$/.test(id);
const pathAllowed=id=>typeof id==="string"&&/^[0-4]{1,4}$/.test(id);
const item=(label="",probability="")=>({label,probability});
const pair=(left="Yes",right="No")=>[item(left),item(right)];
export const FLEXIBLE_PRESETS=[
 {id:"binary-two",label:"Two-stage binary",description:"Two choices at each stage"},
 {id:"binary-three",label:"Three-stage binary",description:"Three successive two-way splits"},
 {id:"three-way",label:"Three-way outcomes",description:"Three starting outcomes, each with a two-way split"},
 {id:"asymmetric",label:"Different branch lengths",description:"One branch stops while another splits three ways"},
 {id:"custom",label:"Start from two outcomes",description:"Extend only the paths that need further branching"}
];
export function normaliseFlexibleBranches(raw){
 const input=record(raw)?raw:{},branches={};
 for(const [key,values] of Object.entries(input)){
  if(!idAllowed(key)||!Array.isArray(values))continue;
  branches[key]=values.slice(0,MAX_TREE_OUTCOMES).map(v=>({
   label:clean(v?.label,160),probability:clean(v?.probability,60)
  }));
  if(Object.keys(branches).length>=MAX_TREE_SPLITS)break;
 }
 if(!Object.hasOwn(branches,""))branches[""]=[];
 return branches;
}
/** A nudge is attached to a stable outcome-history key, never a numerical value. */
export function normaliseFlexibleLabelOffsets(raw){
 const offsets={};if(!record(raw))return offsets;
 for(const [path,offset] of Object.entries(raw).slice(0,96)){
  if(!pathAllowed(path)||!record(offset))continue;
  const x=typeof offset.x==="number"&&Number.isFinite(offset.x)&&Math.abs(offset.x)<=48?offset.x:0;
  const y=typeof offset.y==="number"&&Number.isFinite(offset.y)&&offset.y>=-28&&offset.y<=8?offset.y:0;
  if(x!==0||y!==0)offsets[path]={x,y};
 }
 return offsets;
}
export function normaliseTerminalNodes(raw){
 return [...new Set((Array.isArray(raw)?raw:[]).filter(pathAllowed))].slice(0,MAX_TREE_LEAVES*2);
}
export function createFlexiblePreset(kind,previous){
 const d={...previous,treeMode:"flexible",layoutStyle:"spacious",
  printStyle:"colour",showPathLegend:true,labelOffsets:{},
  branches:{},terminalNodes:[],eventLeaves:[],conditionLeaves:[],edited:true};
 if(kind==="binary-two"||kind==="binary-three"){
  d.stages=kind==="binary-three"?3:2;
  for(let depth=0;depth<d.stages;depth++){
   const walk=(prefix,n)=>{
    if(n===0){d.branches[prefix]=pair(prefix?"Yes":"Event A",prefix?"No":"Not A");return;}
    if(prefix===""){walk("0",n-1);walk("1",n-1);}
    else{walk(prefix+"0",n-1);walk(prefix+"1",n-1);}
   };
   // Populate only the parents of this depth (other levels persist).
   if(depth===0)d.branches[""]=pair("Event A","Not A");
   else for(let i=0;i<2**depth;i++)
    d.branches[i.toString(2).padStart(depth,"0")]=pair("Yes","No");
  }
 }else if(kind==="three-way"){
  d.stages=2;
  d.branches[""]=[item("Option A"),item("Option B"),item("Option C")];
  for(let k=0;k<3;k++)d.branches[String(k)]=pair("Yes","No");
 }else if(kind==="asymmetric"){
  d.stages=2;d.branches[""]=pair("Route A","Route B");
  d.branches["0"]=[item("Outcome 1"),item("Outcome 2"),item("Outcome 3")];
  d.terminalNodes=["1"];
 }else if(kind==="custom"){
  d.stages=3;d.branches[""]=pair("Outcome A","Outcome B");
  d.terminalNodes=["0","1"];
 }else return null;
 return d;
}
/**
 * Enumerate only the active tree. Explicit early terminals may still retain
 * dormant descendant data for later re-expansion. Never recurse on raw keys.
 */
export function flexibleTreeStructure(d){
 const parents=[],leaves=[],issues=[],terminals=new Set(d.terminalNodes||[]);
 let seen=0;
 function visit(id,depth){
  if(++seen>MAX_TREE_LEAVES+MAX_TREE_SPLITS+1){
   if(!issues.some(x=>x.includes("too large")))issues.push("The tree is too large. Keep at most "+MAX_TREE_LEAVES+" complete paths.");
   return;
  }
  if(depth>=d.stages||(id&&terminals.has(id))){leaves.push(id);return;}
  const children=d.branches?.[id];
  if(!Array.isArray(children)||children.length<2||children.length>MAX_TREE_OUTCOMES){
   issues.push("A split after "+(id||"the start")+" needs between two and five outcomes.");
   return;
  }
  parents.push({id,depth,children:children.map((_,index)=>id+String(index))});
  for(let index=0;index<children.length;index++)visit(id+String(index),depth+1);
 }
 visit("",0);
 if(leaves.length>MAX_TREE_LEAVES)issues.push("A tree can contain at most "+MAX_TREE_LEAVES+" terminal paths.");
 if(!leaves.length)issues.push("The tree needs at least one complete path.");
 return {parents,leaves,issues:[...new Set(issues)],maxDepth:Math.max(0,...leaves.map(p=>p.length))};
}
export function flexibleLeaves(d){return flexibleTreeStructure(d).leaves;}
export function flexibleParents(d){return flexibleTreeStructure(d).parents.map(x=>x.id);}
export function pruneFlexibleSelections(d){
 const valid=new Set(flexibleLeaves(d));
 for(const field of ["eventLeaves","conditionLeaves"])
  d[field]=[...new Set((d[field]||[]).filter(id=>valid.has(id)))];
}
export function analyseFlexibleProbability(d,parse){
 const tree=flexibleTreeStructure(d),issues=[...tree.issues],notes=[],values={};
 const history=id=>id?[...id].map((bit,i)=>d.branches[id.slice(0,i)]?.[Number(bit)]?.label||"?").join(" → "):"the starting event";
 for(const {id} of tree.parents){
  const children=d.branches[id],numbers=children.map(x=>parse(x.probability));
  const labels=children.map(x=>x.label.trim().toLowerCase());
  if(children.some(x=>!x.label.trim())||new Set(labels).size!==labels.length)
   issues.push("Give all outcomes different, nonempty labels after "+history(id)+".");
  if(numbers.some(x=>x===null))
   issues.push("Enter a valid probability for each outcome after "+history(id)+" (decimal, fraction or %).");
  else if(Math.abs(numbers.reduce((s,n)=>s+n,0)-1)>1e-8)
   issues.push("The "+children.length+" probabilities after "+history(id)+" must sum to 1.");
  values[id]=numbers;
 }
 if(!d.title.trim())issues.push("Give the diagram a descriptive title.");
 if(d.sourceKind==="secondary"&&!d.sourceCredit.trim())issues.push("Cite the published probability source.");
 if(d.sourceKind==="unsure")notes.push("Clarify whether these are a theoretical model, measured estimates or published probabilities.");
 notes.push("Every active split is conditional on its exact preceding history. Branches may terminate at different stages; this does not assume independence.");
 const paths=tree.leaves.map(key=>{
  const factors=[],labels=[],steps=[];
  for(let i=0;i<key.length;i++){
   const parent=key.slice(0,i),index=Number(key[i]),child=d.branches[parent]?.[index];
   factors.push(values[parent]?.[index]??null);
   steps.push(child?.probability||"");
   labels.push(child?.label||"?");
  }
  return{key,labels,factors,steps,probability:factors.some(x=>x===null)?null:factors.reduce((p,n)=>p*n,1)};
 });
 const ready=issues.length===0,total=ready?paths.reduce((s,p)=>s+p.probability,0):null;
 const sum=ids=>paths.filter(x=>ids.includes(x.key)).reduce((s,x)=>s+x.probability,0);
 let event=null,condition=null,intersection=null,conditional=null;
 if(ready&&d.showEventCalculation){
  if(d.eventLeaves.length)event=sum(d.eventLeaves);
  if(d.conditionLeaves.length)condition=sum(d.conditionLeaves);
  if(d.eventLeaves.length&&d.conditionLeaves.length){
   intersection=sum(d.eventLeaves.filter(x=>d.conditionLeaves.includes(x)));
   conditional=condition>1e-12?intersection/condition:null;
   if(condition<=1e-12)notes.push("P(E | C) is undefined because P(C)=0.");
  }
 }
 return {draft:d,ready,issues,notes,values,paths,total,event,condition,intersection,conditional,tree};
}
