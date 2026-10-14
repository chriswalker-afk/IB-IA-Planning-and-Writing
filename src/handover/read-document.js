/**
 * Local-only handover import. Embedded Pathfinder snapshots take priority.
 * Document text is a cautious, labelled fallback; it is never executable data.
 */
import {createPartialEnvelope,FIELD_LABELS,validateDocumentFile} from "./schema.js";

const LABEL_TO_FIELD = Object.freeze({
 "investigation aim":"aim","my investigation aim":"aim",
 "working ia title":"aim","why i chose it":"motivation",
 "why it matters":"motivation","who might benefit":"beneficiary",
 "intended beneficiary":"beneficiary","possible use of findings":"intendedUse",
 "how the answer might be useful":"intendedUse","course":"course",
 "ib mathematics course":"course","investigation route":"kind",
 "investigation approach":"kind","source route":"dataSource",
 "publisher":"secondaryPublisher","source url":"secondaryUrl",
 "original source url":"secondaryUrl","secondary dataset url":"secondaryUrl",
 "variables and definitions":"secondaryVariables",
 "tentative prediction":"prediction","prediction":"prediction",
 "my tentative prediction or conjecture":"prediction",
 "why i expected it":"predictionWhy","why i predicted it":"predictionWhy",
 "why i expect it":"predictionWhy","what it could mean if true":"predictionImplication",
 "what it might mean if true":"predictionImplication",
 "first mathematical action":"firstAction",
 "first purposeful calculation or investigation":"firstAction",
 "mathematical purpose of first representation":"figurePurpose",
 "first planned figure, calculation or case":"figureOther",
 "source link":"secondaryUrl",
 "data readiness /5":"dataReadiness",
 "practical ease /5":"practicalEase",
 "school teacher-draft deadline":"milestoneSchoolDraft",
 "school final deadline":"milestoneSchoolFinal",
 "specific question":"teacherQuestion",
 "questions for my teacher":"teacherQuestion",
 "units and intended accuracy":"firstAccuracy"
});
function cleanLine(value){
 return String(value??"").replace(/[\u00a0\u200b]/g," ").replace(/\s+/g," ").trim().replace(/[:：]\s*$/,"");
}
/**
 * Only restore values that follow an *exact recognised label*. Do not invent
 * course, permissions, maths or results from paragraphs of general prose.
 */
export function extractRecognisedFields(raw){
 const lines=String(raw||"").slice(0,200_000).split(/\r?\n/).map(cleanLine).filter(Boolean);
 const result={};
 for(let i=0;i<lines.length;i++){
  const label=lines[i].toLowerCase(),key=LABEL_TO_FIELD[label];
  if(!key)continue;
  const next=lines[i+1]||"";
  if(!next||LABEL_TO_FIELD[next.toLowerCase()])continue;
  if(next.length>7000)continue;
  if(key==="course"&&!/^(AI SL|AA SL|AI HL|AA HL|other)$/i.test(next))continue;
  if(key==="kind"&&!/^(statistics|modelling|theoretical|unsure)$/i.test(next))continue;
  if(["secondaryUrl"].includes(key)&&!/^https?:\/\/\S+$/i.test(next))continue;
  result[key]=next;
 }
 return result;
}
async function textFromPdf(bytes){
 // Expensive text parsing is loaded only if the attachment is missing.
 const pdfjs=await import("pdfjs-dist/legacy/build/pdf.mjs");
 if(typeof document!=="undefined"){
  pdfjs.GlobalWorkerOptions.workerSrc=new URL("./pdf.worker.min.mjs",document.baseURI).href;
 }
 const task=pdfjs.getDocument({data:new Uint8Array(bytes),isEvalSupported:false,useSystemFonts:true});
 try{
  const pdf=await task.promise;
  if(pdf.numPages>35)throw new Error("Too many pages for partial recovery.");
  const chunks=[];
  for(let p=1;p<=pdf.numPages;p++){
   const page=await pdf.getPage(p),items=(await page.getTextContent()).items;
   let previous=null,line="";
   for(const item of items){
    if(!item.str)continue;
    const y=Math.round(item.transform?.[5]||0);
    if(previous!==null&&Math.abs(y-previous)>2){
     if(line.trim())chunks.push(line.trim());
     line="";
    }
    line+=(line?" ":"")+item.str;
    previous=y;
   }
   if(line.trim())chunks.push(line.trim());
  }
  return chunks.join("\n").slice(0,200_000);
 }finally{await task.destroy().catch(()=>{});}
}
export async function readHandoverDocument(file){
 const ext=validateDocumentFile(file);
 const bytes=new Uint8Array(await file.arrayBuffer());
 let envelope=null,plain="";
 if(ext==="pdf"){
  const {importEmbeddedPdfReport}=await import("./formats/pdf.js");
  envelope=await importEmbeddedPdfReport(bytes);
  if(!envelope){
   try{plain=await textFromPdf(bytes);}
   catch(error){return{kind:"manual",reason:"This PDF has no Pathfinder snapshot. Selectable text could not be recovered. Use the original export, a JSON project backup, or enter the plan manually.",details:error.message};}
  }
 }else{
  const {importEmbeddedDocxReport,extractReadableDocxText}=await import("./formats/docx.js");
  envelope=await importEmbeddedDocxReport(bytes);
  if(!envelope)plain=await extractReadableDocxText(bytes);
 }
 if(envelope)return{kind:"embedded",envelope,name:file.name,format:ext,
   warning:"The embedded plan records its original export state. Edits to the visible document after that export are not automatically incorporated."};
 const partial=extractRecognisedFields(plain);
 if(!Object.keys(partial).length)return{kind:"manual",
   reason:"No structured Pathfinder snapshot or safely recognisable planning fields were found. This can happen with a scanned PDF, a third-party file, or a Word/PDF copy that removed the embedded data."};
 return{kind:"partial",envelope:createPartialEnvelope(partial),name:file.name,format:ext,
   warning:"Only clearly labelled fields were recovered. Please check each one; unrecognised fields and edited text cannot be reconstructed automatically."};
}
