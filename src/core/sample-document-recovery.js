/**
 * Recovery guidance for fictional IA reading/export tools.
 *
 * Pages replaces fingerprinted, lazily loaded document chunks on deployment.
 * A tab that remains open through an update can try to fetch a chunk that
 * no longer exists. This does not damage the fictional preview or the
 * separate student project. Other errors must not be misdiagnosed as cache.
 */
import {fullProjectExportRecovery} from "../handover/export-recovery.js";

export function sampleDocumentRecovery(error,operation="reader"){
 const diagnosis=fullProjectExportRecovery(error),reader=operation==="reader";
 if(diagnosis.kind==="module")return Object.freeze({
  kind:"module",
  title:"This example needs the latest reading tools",
  message:"Pathfinder may have updated while this tab was open, or the connection may have interrupted a document file. Reload the sample tools and try again. Your fictional sample is kept separately from your own investigation.",
  toast:"The example tools could not load. Use Reload sample tools below.",
  canReload:true
 });
 if(diagnosis.kind==="figure")return Object.freeze({
  kind:"figure",
  title:"A sample diagram could not be prepared",
  message:"One of the sample's diagrams could not be included in the document. The sample fields and your own investigation are unchanged. You can still explore the fields and figures; retry the export or check the browser console for the affected diagram.",
  toast:"A sample figure could not be prepared. The sample fields are still available.",
  canReload:false
 });
 return Object.freeze({
  kind:"other",
  title:reader?"The continuous reading view could not open":"The sample document could not be created",
  message:reader?
   "The fictional sample fields and your own investigation are unchanged. Retry the reading view, or reload the sample tools if this persists. The browser console contains the technical error.":
   "The fictional sample fields and your own investigation are unchanged. Retry the download or reload the sample tools. The browser console contains the technical error.",
  toast:reader?"The reading view could not open. See recovery options above.":"The sample document could not be created. See recovery options above.",
  canReload:true
 });
}

/** Cache-bust the HTML document while keeping any current navigation params. */
export function sampleToolsReloadUrl(currentUrl,nonce){
 const url=new URL(currentUrl);
 url.searchParams.set("ia-tools-refresh",String(nonce));
 return url.href;
}
