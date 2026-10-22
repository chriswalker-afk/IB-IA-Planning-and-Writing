/**
 * A student-facing view of the fictional mathematical investigation ONLY.
 * The normal full-project export includes all Planning and Checking notes, so
 * its page count is not a meaningful proxy for the length of an IA.
 *
 * Authored samples share one ordered model between the reader, PDF and Word.
 * Legacy preview backups remain readable through their original adapter.
 */
import {createPlanningEnvelope} from '../handover/schema.js';
import {createPdfPlanningReport} from '../handover/formats/pdf.js';
import {collectProjectFigures,figureForEntry,prepareReportFigures} from '../handover/figure-report.js';
import {referenceSampleSpec} from './sample-library.js';
import {referenceIAPagesModel} from './sample-document-model.js';
export {renderIllustrativeIAReading} from './sample-document-model.js';

const val=x=>String(x??'').trim();
const row=(label,value)=>({label,value:val(value)});
export function illustrativeIAPagesModel(s){
 if(referenceSampleSpec(s?.demo))return referenceIAPagesModel(s);
 if(!s?.demo||!['linear','curved','unclear','unexpected','theory'].includes(s.demo))
  throw new Error('The illustrated IA-style example is available only inside a fictional sample preview.');
 const title=s.planning?.fields?.provisionalTitle?.replace(/^ILLUSTRATIVE ONLY\s*[·-]\s*/,'')||'A mathematical exploration';
 const f=s.completion?.fields||{},figures=collectProjectFigures(s);
 const sections=[
  {title:'1 · Introduction and mathematical aim',description:'Fictional student-style introduction; not a copy-ready assessed IA.',
   rows:[row('Introduction and motivating question',s.scratch?.introduction)],figures:[]},
  {title:'2 · Define and introduce the first mathematics',description:'Source, definitions and the initial mathematical question appear before any calculation.',
   rows:[row('Starting material, context and definitions',s.scratch?.dataNotes),
    row('Why this first mathematics answers part of my aim',f.dataAimLink)],figures:[]},
  ...(s.entries||[]).map((entry,index)=>({
   title:(index+3)+' · '+(val(entry.title)||'Mathematical stage '+(index+1)),
   description:'Mathematical stage '+(index+1)+': explain why this method was chosen, show the mathematics, interpret it, then decide what genuinely follows.',
   rows:[
    row('Purpose and introduction to this representation',entry.purpose),
    row('Mathematical calculation and method',entry.result),
    row('Interpretation and link to the investigative aim',entry.interpretation),
    row('Assumptions, domain or limitation',entry.limitations),
    row('Mathematical question prompted by this result',entry.nextWhy)
   ],
   figures:figures.filter(fig=>figureForEntry(fig,entry))
  })),
  {title:'6 · Conclusion, meaning and potential next steps',description:'Three concise ideas: answer the aim, give only significant limitations and consider justified next questions.',
   rows:[row('Answer supported by the worked mathematics',f.mainConclusion),
    row('Interpretation and consequential limitations',f.conclusionBenefit),
    row('A justified possible extension',f.conclusionExtension)],figures:[]},
  {title:'7 · Provenance, integrity and course-suitability reminder',description:'Teaching-only disclosure; not a fabricated reference list or a claim that a teacher has approved the level.',
   rows:[row('Where this material came from',s.demo==='theory'?
      'All numerical cases and the symbolic derivation are presented as self-contained fictional teaching mathematics. No external theorem source, teacher judgement or student authorship is claimed.':
      'All six pairs were deliberately constructed for Pathfinder. They are NOT observations, a published empirical dataset or evidence about participants.'),
    row('What a real IA would still need','An independently chosen mathematical aim, genuine student writing and judgement, sources cited when used, a suitable amount of course-level mathematical development, and review of the final document under current school instructions.')],figures:[]}
 ];
 return {
  title,aim:val(s.planning?.fields?.aim),course:val(s.planning?.fields?.course),
  strapline:'FICTIONAL MATHEMATICAL EXPLORATION · IA-STYLE READING EXAMPLE',
  status:'TEACHING DEMONSTRATION · NOT A FINISHED OR ASSESSED IB IA',
  flags:[],isDemonstration:true,isIllustrativeIA:true,
  exportedAt:new Date().toISOString(),sections,
  footnote:'This document is a fictional teaching example. Neither the values nor the text represent a student submission. Actual IAs must contain a student’s original mathematical decisions, appropriate sources, and teacher-approved scope. This PDF is for reading the mathematical journey, not a source of authentic empirical evidence.'
 };
}
export async function createIllustrativeIAExport(state,format='pdf'){
 const model=illustrativeIAPagesModel(state);
 await prepareReportFigures(model);
 if(format==='docx'){
  const {createDocxPlanningReport}=await import('../handover/formats/docx.js');
  const bytes=await createDocxPlanningReport(createPlanningEnvelope(state),model);
  return{bytes,name:'IA-Pathfinder-Complete-Example-'+state.demo+'.docx',mime:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'};
 }
 if(format!=='pdf')throw new Error('Unsupported illustrative document format.');
 const bytes=await createPdfPlanningReport(createPlanningEnvelope(state),model);
 return{bytes,name:'IA-Pathfinder-Complete-Example-'+state.demo+'.pdf',mime:'application/pdf'};
}
