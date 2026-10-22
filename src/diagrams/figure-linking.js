/** One saved figure may belong to one mathematical writing stage at a time.
 * An orphaned figure remains saved (and exportable) as student working material.
 * This is a bookkeeping operation, NOT a claim that the stage's mathematics
 * has been produced or verified.
 */
import {representationTool} from "./representation-registry.js";

function needsRecheck(state,entry,kind){
 if(entry?.status!=="completed"||!String(entry.result||"").trim())return;
 entry.reviewNeeded="yes";
 entry.reviewReason="A "+kind+" figure previously associated with this stage was changed or unlinked. Recheck any figures, numerical claims and conclusions in your IA.";
 const node=entry.phase==="first"?"C30":"C40";
 if(state.completion?.stages)state.completion.stages[node]="needs-review";
}
/** Replacing or moving a link must not leave an old stage displaying it. */
export function linkRepresentationFigure(state,kind,record,entry){
 const tool=representationTool(kind);
 if(!tool||!record?.id||!entry?.id||!Array.isArray(state?.entries))
  throw new Error("A valid generator, saved figure and mathematical stage are required.");
 const studio=state[tool.studio];
 const figures=studio?.figures||[];
 if(!figures.some(f=>f.id===record.id))throw new Error("The figure must be saved before linking it.");
 const key=tool.entryKey,previous=entry[key];
 if(previous&&previous!==record.id){
  const old=figures.find(f=>f.id===previous);
  if(old?.entryId===entry.id)old.entryId="";
  needsRecheck(state,entry,tool.figureTitle.toLowerCase());
 }
 for(const other of state.entries){
  if(other===entry)continue;
  if(other[key]===record.id){
   other[key]="";
   needsRecheck(state,other,tool.figureTitle.toLowerCase());
  }
  if(other.id===record.entryId&&other[key]!==record.id)
   needsRecheck(state,other,tool.figureTitle.toLowerCase());
 }
 record.entryId=entry.id;
 entry[key]=record.id;
 return true;
}
/** Stable association for both legacy figure records and imported project links.
 * Explicit entry->figure links have priority over stale figure->entry metadata.
 */
export function linkedRepresentationEntry(entries,key,figure){
 if(!Array.isArray(entries)||!figure?.id)return {entryIndex:-1,linked:null};
 const direct=entries.findIndex(e=>e?.id===figure.entryId);
 const referenced=entries.findIndex(e=>e?.[key]===figure.id);
 let index=referenced;
 if(direct>=0&&entries[direct][key]===figure.id)index=direct;
 else if(index<0&&direct>=0&&!entries[direct][key])index=direct;
 return {entryIndex:index,linked:index>=0?entries[index]:null};
}
