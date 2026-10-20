/** Checking uses the same optional contextual pop-ins as Planning and IA Studio. */
import {CHECKING_CRITERIA,CHECKING_DETAILS} from "../checking/checklist.js";
const idFor=Object.freeze({A:"D02",B:"D03",C:"D04",D:"D05",E:"D06"});
const avoid=Object.freeze({
 A:"Do not mistake completing a checklist, adding formatting or writing another introduction for coherent mathematical presentation.",
 B:"Do not confuse an attractive graph or calculator screenshot with correct notation, meaningful labels and accurate mathematics.",
 C:"Do not manufacture an anecdote or add unrelated techniques simply to display apparent engagement.",
 D:"Do not list generic errors or imagined limitations; critically evaluate genuine results and their consequences.",
 E:"Do not infer a mark from a correct final number, a technique name or technology output without explaining the mathematics."
});
export const CHECKING_CRITERION_SPOTS=Object.freeze(Object.fromEntries(
 Object.entries(idFor).map(([letter,id])=>{
  const rubric=CHECKING_CRITERIA[letter],task=CHECKING_DETAILS[id];
  return ["checking:"+letter,Object.freeze({
   criterion:letter,
   location:"Checking your actual IA · "+rubric.name,
   stage:"Checking · checking the written mathematics",
   why:"The checklist asks: "+task.focus+" This is a prompt to inspect evidence in your actual IA, not an automatically earned mark.",
   strong:"Check your actual document for: "+task.lookFor.slice(0,3).join("; ")+". Identify the page, graph or mathematical argument that supports your judgement.",
   avoid:avoid[letter],
   reminder:"Use the current five-criterion rubric to make a best-fit judgement across your actual IA. This pop-in, your recorded evidence and any check marked done do not award a mark."
  })];
 })
));
export const CHECKING_SPOT_IDS=idFor;
