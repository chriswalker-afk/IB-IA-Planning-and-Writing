/**
 * Pass 5.4.4: read-only bridge from exploratory distribution mathematics
 * to the ONE canonical mathematical stage, its existing Insight Threads and
 * the registered Maths Workshop. No notes or results are created here.
 */
import {distributionAim,DISTRIBUTION_LEARNING} from "./distribution-guidance.js";
import {representationReturnNode} from "./representation-registry.js";
import {insightItems} from "../ui/insight-threads.js";
const text=v=>typeof v==="string"?v.trim():"";
const validIndex=(s,i)=>Number.isInteger(i)&&i>=0&&i<(s?.entries?.length||0);
export function distributionWhatIfWritingContext(state){
 const s=state||{},i=s.completion?.activeEntryIndex;
 const hasEntry=validIndex(s,i),entry=hasEntry?s.entries[i]:null;
 const entryId=text(entry?.id);
 const notes=entry?{
  interpretation:!!text(entry.interpretation),
  limitation:!!text(entry.limitations),
  nextQuestion:!!text(entry.nextQuestion),
  resultConfirmed:entry.status==="completed"&&!!text(entry.result)
 }:{interpretation:false,limitation:false,nextQuestion:false,resultConfirmed:false};
 // Insight Threads already derives entries, figures and Sparks. Never create
 // or duplicate one here. Only signal the entries truly present in that shelf.
 const threads=entryId?insightItems(s).filter(x=>
  x.entryId===entryId&&["discovery","reflection"].includes(x.type)):[];
 const kind=s.distributionStudio?.draft?.kind||"normal";
 const lessonId=DISTRIBUTION_LEARNING[kind]?.lessonId||"";
 return Object.freeze({
  aim:distributionAim(s),entryIndex:hasEntry?i:-1,entryId,
  lessonId,returnNode:representationReturnNode(s),
  focusPath:hasEntry?"entries."+i+".interpretation":"completion.fields.firstInterpretation",
  notes:Object.freeze(notes),insightCount:threads.length,
  hasInsight:threads.length>0,
  // A model comparison alone cannot make an entry a completed mathematical
  // stage. Any Insight Thread is authored elsewhere in IA Studio.
  hasCompletedInsight:threads.some(t=>t.type==="discovery"&&!t.planned),
  needsRealResult:!notes.resultConfirmed
 });
}
