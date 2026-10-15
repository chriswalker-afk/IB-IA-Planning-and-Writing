/** Generate full working records and a restorable bundle entirely in the browser. */
import JSZip from 'jszip';
import {createPlanningEnvelope} from './schema.js';
import {modelFromFullProject,fullProjectFilename} from './full-project-model.js';

export async function createFullProjectExport(state,format){
 if(!['pdf','docx','zip'].includes(format))throw new Error('Unsupported project export format.');
 // Isolate a point-in-time copy. Exporting must never change the student workspace.
 const snapshot=JSON.parse(JSON.stringify({...state,route:'home'}));
 const model=modelFromFullProject(snapshot);
 const plan=createPlanningEnvelope(snapshot,{exportedAt:model.exportedAt});
 const createPdf=async()=>{
  const {createPdfPlanningReport}=await import('./formats/pdf.js');
  return createPdfPlanningReport(plan,model);
 };
 const createWord=async()=>{
  const {createDocxPlanningReport}=await import('./formats/docx.js');
  return createDocxPlanningReport(plan,model);
 };
 if(format==='pdf')return {bytes:await createPdf(),name:fullProjectFilename(model,'pdf'),mime:'application/pdf'};
 if(format==='docx')return {bytes:await createWord(),name:fullProjectFilename(model,'docx'),mime:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'};
 const zip=new JSZip();
 zip.file(fullProjectFilename(model,'pdf'),await createPdf());
 zip.file(fullProjectFilename(model,'docx'),await createWord());
 zip.file('ia-pathfinder-project.json',JSON.stringify(snapshot,null,2));
 zip.file('README.txt',[
  'IA Pathfinder - Complete Project Archive',
  '========================================',
  'PDF: readable full project working record.',
  'DOCX: the same full record, editable in Word.',
  'JSON: complete restorable Pathfinder project, including Planning and IA Studio.',
  '',
  'To restore the entire project, choose Backups & reports > Restore entire project backup,',
  'then select ia-pathfinder-project.json from this ZIP.',
  'Reimporting the PDF or Word only restores planning fields with student review.',
  'Changing their visible text never modifies the embedded planning snapshot.',
  'Reports are not the finished IA, teacher approval or an IB mark prediction.',
  'Keep the files private: they may contain personal notes and source records.',
  'All export processing took place in this browser.'
 ].join('\n'));
 return {bytes:await zip.generateAsync({type:'uint8array',compression:'DEFLATE',compressionOptions:{level:6}}),name:fullProjectFilename(model,'zip'),mime:'application/zip'};
}
