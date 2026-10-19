/** UI actions for the shared dataset editor; independent from chart mathematics. */
import {nativeGridSummary,addNativeRows,removeNativeRow,addNativeColumn,removeNativeColumn,
 nativeSnapshot,saveNativeDataset,deleteNativeDataset,applyNativeDataset,
 NATIVE_LIMITS,NATIVE_PAGE_ROWS} from "./native-data-core.js";

export const nativeStudio=(state,type)=>type==="graph"?state.graphStudio:type==="stat"?state.statStudio:
 type==="table"?state.tableStudio:null;
export const activeNativeType=state=>state?.route!=="completing"||state?.completion?.current!=="C31"?""
 :state.graphStudio?.open?"graph":state.statStudio?.open?"stat":state.tableStudio?.open?"table":"";
/** Return true when an event is one of our worksheet actions (including rejected edits). */
export function handleNativeDataAction(state,action,el,{save,render,toast,confirm,openTool}){
 if(!action.startsWith("native-"))return false;
 const type=el.dataset.nativeType,studio=nativeStudio(state,type),current=activeNativeType(state);
 const finish=()=>{save();render();};
 if(type!==current||!studio)return true;
 if(action==="native-add-row"||action==="native-add-five"){
  const count=action==="native-add-five"?5:1;
  if(!addNativeRows(studio,type,count)){toast("Worksheet limit","You can enter up to 500 source rows.");return true;}
  studio.nativePage=Math.floor((studio.draft.matrix.length-1)/NATIVE_PAGE_ROWS);
  finish();return true;
 }
 if(action==="native-remove-row"){
  const n=Number(el.dataset.nativeRow);
  if(!Number.isInteger(n)||n<0||n>=studio.draft.matrix.length)return true;
  const filled=studio.draft.matrix[n].some(v=>String(v||"").trim());
  if(filled&&!confirm("Remove row "+(n+1)+" and its source values?"))return true;
  if(removeNativeRow(studio,type,n))finish();
  return true;
 }
 if(action==="native-add-column"){
  if(!addNativeColumn(studio,type))toast("Column limit","This generator accepts at most "+NATIVE_LIMITS[type]+" columns.");
  else finish();
  return true;
 }
 if(action==="native-remove-column"){
  const index=studio.draft.columns.length-1;
  if(index<2)return true;
  const filled=!!studio.draft.columns[index]?.trim()||
   studio.draft.matrix.some(row=>String(row[index]||"").trim());
  if(filled&&!confirm("Delete the last column including its values?"))return true;
  if(removeNativeColumn(studio,type,index))finish();
  return true;
 }
 if(action==="native-page"){
  const dir=Number(el.dataset.nativeDirection);
  if(![-1,1].includes(dir))return true;
  const pages=Math.max(1,Math.ceil(studio.draft.matrix.length/NATIVE_PAGE_ROWS));
  studio.nativePage=Math.max(0,Math.min(pages-1,(studio.nativePage||0)+dir));
  finish();return true;
 }
 if(action==="native-save-dataset"){
  const name=el.closest("[data-native-grid]")?.querySelector('[data-native-name="'+type+'"]')?.value||"";
  const result=saveNativeDataset(state,type,name);
  if(!result.ok){toast("Dataset not saved",result.error);return true;}
  finish();toast("Reusable dataset saved","This is a local snapshot. Other graphs and tables will not be changed silently.");
  return true;
 }
 if(action==="native-delete-dataset"){
  const record=state.dataShelf?.find(d=>d.id===el.dataset.nativeId);
  if(!record||!confirm("Remove the reusable copy '"+record.name+"'? Finished figures are unaffected."))return true;
  if(deleteNativeDataset(state,record.id))finish();
  return true;
 }
 if(action==="native-load"){
  const record=state.dataShelf?.find(d=>d.id===el.dataset.nativeId);
  if(!record){toast("Dataset copy not found");return true;}
  if(nativeGridSummary(studio.draft).filled&&
    !confirm("Replace the current working values? Previously saved diagrams and tables remain available."))return true;
  const result=applyNativeDataset(studio,type,record);
  if(!result.ok){toast("Cannot load that dataset",result.error);return true;}
  studio.nativePage=0;finish();
  toast("Dataset loaded","Check the source, chosen variables and measurement units before exporting.");
  return true;
 }
 if(action==="native-send"){
  const to=el.dataset.nativeTo,destination=nativeStudio(state,to);
  if(!destination||to===type)return true;
  const snap=nativeSnapshot(studio.draft);
  if(!snap.ok){toast("Finish entering the dataset first",snap.error);return true;}
  if(snap.dataset.columns.length>NATIVE_LIMITS[to]){
   toast("Too many columns","This generator accepts "+NATIVE_LIMITS[to]+" columns; no data have been discarded.");return true;
  }
  if(nativeGridSummary(destination.draft).filled&&
   !confirm("Replace the destination's working data? Saved figures and tables will not be overwritten."))return true;
  const loaded=applyNativeDataset(destination,to,snap.dataset);
  if(!loaded.ok){toast("Cannot transfer data",loaded.error);return true;}
  destination.nativePage=0;
  openTool(to);
  toast("Dataset reused","Select a suitable representation and check the units and original source before using it in the IA.");
  return true;
 }
 return true;
}
