/** Pass 2: lossless supplementary writing advice.
 * The original wording stays in its original teaching module. We reference
 * the same content from compact pop-ins and the complete Field Guide.
 * No IA records, assessments, selected mathematical pathways or results change.
 */
import {INTRODUCTION_TIPS} from "./intro-writing-advice.js";
import {firstMathsContext,firstMathsTips} from "./first-maths-bridge.js";
import {SHOWING_MATHS_TIPS} from "./showing-first-maths.js";
import {STUDIO_STAGE_TIPS} from "./studio-writing-stages.js";

const CATEGORIES=Object.freeze([
  ["introduction","Introduction","C10"],
  ["first-mathematics","Introducing your mathematics","C20"],
  ["data-methods","Data, methods and sources","C21S"],
  ["showing-mathematics","Showing your mathematics","C30"],
  ["further-mathematics","Exploring and explaining results","C40"],
  ["conclusion","Writing your conclusion","C60"]
]);
const SAMPLES={
  introduction:0,
  "first-mathematics":1,
  "data-methods":0,
  "showing-mathematics":0,
  "further-mathematics":0,
  conclusion:0
};
const FOCUS=Object.freeze({
  introduction:{aim:0,motivation:1},
  "first-mathematics":{firstBridge:0,methodIntroduction:1,methodJustification:1,methodEvaluation:3,methodSuitability:3,firstPurpose:1,dataAimLink:0},
  "data-methods":{samplingRationale:0,responseBias:3,modelAssumptions:1,modelDomain:3,theoreticalObject:0,methodReason:1,limitationConsequence:3,accuracyReason:2,variableDefinitions:1,dataAimLink:1},
  "showing-mathematics":{introduceA:0,result:1,reflectD:2,nextD:3,firstPurpose:0,purpose:0,title:1,observation:2,accuracyForResult:2,predictionComparison:2,surpriseCheck:2,nextQuestion:3,nextReason:3,scatterPattern:2},
  "further-mathematics":{bridgeA:0,resultB:1,interpretD:2,nextD:3,technologyInterpretation:1,courseWhy:0,researchedUnderstanding:1},
  conclusion:{mainConclusion:0,meaningAndLimits:2,benefit:1,extension:3,title:3}
});
const NODE_FOCUS=Object.freeze({
  C10:0,C20:1,
  C21S:0,C21M:1,C21T:0,C22:1,C23:3,C24:2,C25:1,C26:1,
  C30:0,C31:1,C32:0,C33:1,C34:2,C34A:2,C34B:2,C34U:2,C35:3,C35H:3,C35B:2,C35P:2,
  C40:0,C40T:1,C40D:0,C40L:1,C50:0,
  C60:0,C61:0,C62:1,C63:3,C64:3
});
const normalise=(group,id,items)=>Object.freeze(items.map((item,index)=>Object.freeze({
  id:group+"-"+String(index+1),
  sourceId:id?.(item,index)||"",
  title:item.title||item.name||item[0],
  hook:item.hook||item.brief||item[1],
  detail:item.body||item.detail||item[2],
  weak:item.weak||item.bad||item[3],
  strong:item.strong||item.good||item[4],
  why:item.learn||"",
  essential:Boolean(item.essential)
})));
export function writerAdviceGroupForNode(node=""){
 if(node==="C10")return "introduction";
 if(node==="C20")return "first-mathematics";
 if(["C21S","C21M","C21T","C22","C23","C24","C25","C26"].includes(node))return "data-methods";
 if(["C30","C31","C32","C33","C34","C34A","C34B","C34U","C35","C35H","C35B","C35P"].includes(node))return "showing-mathematics";
 if(["C40","C50","C40T","C40D","C40L"].includes(node))return "further-mathematics";
 if(["C60","C61","C62","C63","C64"].includes(node))return "conclusion";
 return "";
}
function recordsFor(group,state){
 switch(group){
  case "introduction":return normalise(group,item=>item.id,INTRODUCTION_TIPS);
  case "first-mathematics":return normalise(group,()=>"",firstMathsTips(firstMathsContext(state||{})));
  case "showing-mathematics":return normalise(group,()=>"",SHOWING_MATHS_TIPS);
  case "data-methods":return normalise(group,()=>"",STUDIO_STAGE_TIPS.data.cards);
  case "further-mathematics":return normalise(group,()=>"",STUDIO_STAGE_TIPS.maths.cards);
  case "conclusion":return normalise(group,()=>"",STUDIO_STAGE_TIPS.conclusion.cards);
  default:return Object.freeze([]);
 }
}
export function writerStageAdviceBundle(state,node="",spotKey="",explicitGroup=""){
 const group=explicitGroup||writerAdviceGroupForNode(node);
 const category=CATEGORIES.find(([id])=>id===group);
 if(!category)return null;
 const items=recordsFor(group,state);
 const focusName=typeof spotKey==="string"?spotKey.split(":").at(-1):"";
 const bySpot=FOCUS[group]?.[focusName];
 const selectedIndex=Number.isInteger(bySpot)?bySpot:(NODE_FOCUS[node]??SAMPLES[group]??0);
 return Object.freeze({
  group,
  title:category[1],
  node:node||category[2],
  selectedIndex:Math.max(0,Math.min(items.length-1,selectedIndex)),
  items
 });
}
/** All original groups remain available from the global full guide, even at C00. */
export function allWriterStageAdviceBundles(state){
 return CATEGORIES.map(([group,,node])=>writerStageAdviceBundle(state,node,"",group));
}
export const WRITER_STAGE_ADVICE_GROUPS=Object.freeze(CATEGORIES.map(([group,title,node])=>({group,title,node})));
