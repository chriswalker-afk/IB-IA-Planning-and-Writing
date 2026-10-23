/**
 * Explain browser-local export failures without leaking project contents.
 *
 * GitHub Pages replaces hashed JavaScript chunks during deployments. A tab
 * opened before a deploy can still run its old app code, then fail to import
 * the PDF/Word/ZIP generator on demand. Reloading that tab after exporting
 * the independent JSON backup is the safe recovery path.
 *
 * Do not treat a generic export failure as proof of a stale tab: malformed
 * figures, size limits and other local errors have different remedies.
 */
export function fullProjectExportRecovery(error){
 const message=String(error?.message||error||"");
 const name=String(error?.name||"");
 const code=name+" "+message;
 if(/failed to fetch dynamically imported module|importing a module script failed|failed to load module script|error loading dynamically imported module|chunkloaderror|loading (?:css )?chunk \d+ failed|module specifier|dynamic import.*(network|fetch)|loading module from/i.test(code)){
  return Object.freeze({
   kind:"module",
   title:"The export files could not load",
   message:"This can happen when Pathfinder is updated while a tab is still open, or if the connection briefly fails. Download the entire project JSON backup below, then reload this page and retry the PDF, Word or ZIP.",
   toast:"The export files could not load. Back up your project as JSON, then reload this page."
  });
 }
 if(/planning snapshot exceeds export size limit|embedded project data is too large/i.test(code)){
  return Object.freeze({
   kind:"size",
   title:"The planning attachment is too large",
   message:"Your project has not changed. The embedded Planning snapshot is over the document-import limit. Download the complete JSON project backup below; it preserves the whole project. You can also try reducing unusually long Planning notes before exporting a document.",
   toast:"The embedded Planning snapshot is too large for this document."
  });
 }
 if(/cannot render saved |diagram could not be reconstructed|cannot create a canvas|encode the saved figure as png|error while drawing image|invalid png/i.test(code)){
  return Object.freeze({
   kind:"figure",
   title:"A saved mathematical figure could not be prepared",
   message:"A diagram could not be included in the readable report. Your figure and mathematical notes remain in the project. Download the full JSON backup below, then revisit and save the affected figure before retrying. The browser console has details about which figure failed.",
   toast:"A project figure could not be added to the report. Your work is safe."
  });
 }
 return Object.freeze({
  kind:"other",
  title:"This document could not be created",
  message:"Your project has not been changed. Download the entire project JSON backup below first. Then reload the site and retry, or try another readable format. If it still fails, the browser console contains the technical error.",
  toast:"The full project document could not be created. Your work is unchanged."
 });
}
