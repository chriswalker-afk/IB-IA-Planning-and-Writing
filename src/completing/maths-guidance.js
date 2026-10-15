import {firstUnfamiliarUse} from "./method-identity.js";
import {MATHS_GUIDANCE} from "./guidance-catalog.js";
import {guidanceContext,isDone} from "./guidance-context.js";
const str=v=>typeof v==="string"?v.trim():"";
const matches=(v,re)=>re.test(String(v||"").toLowerCase());
function triggered(m,x){
 const {node,entry,real,method,plannedMethod,f,course,accuracy,theoretical}=x;
 const active=!!(str(entry?.technique)||str(entry?.methodId));
 const maths=["C40","C50","C40D","C40L","C40T","C34B","C35"].includes(node);
 const actualTechnology=str(f.technologyTool)&&str(f.technologyOutcome)&&real&&f.technologyForEntryId===entry?.id;
 switch(m.id){
  case "M01":return active&&!!str(entry?.purpose)&&["C40","C50"].includes(node);
  case "M02":return real&&maths&&matches(entry?.result,/=|\^|sqrt|integral|sum|frac/);
  case "M03":return real&&maths&&matches(entry?.result,/≈|approx|rounded|decimal|estimate|\d\.\d/);
  case "M04":return active&&maths&&(str(f.variableDefinitions)||str(f.firstDefinitions));
  case "M05":return real&&maths&&x.matchingAccuracy.length>0&&!theoretical;
  case "M06":case "M07":return node==="C40T"&&!!actualTechnology;
  case "M08":return node==="C40T"&&!!actualTechnology&&method.has("fitted-model");
  case "M09":return node==="C40D"&&active;
  case "M10":return node==="C40D"&&real&&(actualTechnology||entry?.knowledge!=="syllabus");
  case "M11":return node==="C40D"&&x.actualResults.length>=3;
  case "M12":return node==="C40D"&&entry?.priorLearningOnly==="yes";
  case "M13":return node==="C40D"&&real&&["outside","mixed"].includes(entry?.knowledge);
  case "M14":return maths&&str(entry?.methodChangeReason);
  case "M15":return real&&method.has("fitted-model")&&maths;
  case "M16":return real&&method.has("statistic")&&maths;
  case "M17":return real&&theoretical&&maths&&entry?.knowledge!=="outside";
  case "M18":return node==="C70N"&&x.actualResults.length>0;
  case "M19":return node==="C35"?!!str(f.nextMethod):node==="C40D"&&active;
  case "M20":return real&&entry?.knowledge==="syllabus"&&maths;
  case "M21":return active&&entry?.knowledge==="outside"&&maths&&firstUnfamiliarUse(x.state,entry);
  case "M22":return active&&entry?.knowledge==="mixed"&&maths&&firstUnfamiliarUse(x.state,entry);
  case "M23":return active&&entry?.knowledge==="unsure"&&node==="C40D";
  case "M24":return real&&str(entry?.researchSource)&&node==="C40L";
  case "M25":return real&&entry?.knowledge==="outside"&&node==="C40L";
  case "M26":return real&&actualTechnology&&["outside","mixed"].includes(entry?.knowledge)&&["C40L","C40T"].includes(node);
  case "M27":case "M28":return real&&str(entry?.mathsInsight)&&node==="C34B";
  case "M29":return real&&["outside","mixed"].includes(entry?.knowledge)&&
    !str(entry?.knowledgeNotes)&&!str(entry?.understandingExample)&&node==="C40L";
  case "M30":return ["C70","C80","C90"].includes(node)&&x.actualResults.some(x=>["outside","mixed"].includes(x.knowledge));
  default:return false;
 }
}
const priority=new Map(["M01","M19","M21","M22","M23","M06","M07","M27","M29"].map((x,i)=>[x,100-i]));
export function relevantMathsGuidance(state,node=state.completion.current){
 const ctx=guidanceContext(state,node);
 return MATHS_GUIDANCE.filter(m=>triggered(m,ctx)).map(x=>({
  ...x,priority:priority.get(x.id)||60,question:x.question.replace(/\[technique\]/gi,ctx.node==="C35"?ctx.f.nextMethod:ctx.entry?.technique||"this technique").replace(/\[my selected maths course\]/gi,ctx.course||"my course")
 }))
 .sort((a,b)=>b.priority-a.priority);
}
export const mathsSourceIds=()=>MATHS_GUIDANCE.map(x=>x.id);
