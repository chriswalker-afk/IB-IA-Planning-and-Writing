/** A–E labels and concrete, source-grounded review prompts.
 * Based on the uploaded IB Diploma Maths IA Checklist and JIS SL Maths IA
 * Guide (2025), especially the rubric and draft/final-review sections.
 * This is presentation metadata over the EXISTING review records, not a
 * second checklist or an assessment of the student's external IA document.
 */
export const CHECKING_CRITERIA=Object.freeze({
 A:{name:'Presentation',max:4,short:'A coherent, well-organised and concise exploration'},
 B:{name:'Mathematical communication',max:4,short:'Appropriate notation, definitions and mathematical representations'},
 C:{name:'Personal engagement',max:3,short:'Genuine independent choices that shape the mathematical work'},
 D:{name:'Reflection',max:3,short:'Mathematical interpretation and critical reflection throughout'},
 E:{name:'Use of mathematics',max:6,short:'Relevant, correct, course-appropriate mathematics with understanding'}
});
const row=(criteria,focus,lookFor=[],source='Both resources',processNote='')=>({criteria,focus,lookFor,source,processNote});
export const CHECKING_DETAILS=Object.freeze({
 D01:row([],'Is my teacher draft a complete investigation, not a proposal?',[
  'Introduction with aim and personal purpose','The actual mathematics and relevant figures are included',
  'Results are interpreted and a conclusion is present','Check your school deadline and instructions'],'JIS IA Guide, pp. 3, 40'),
 D02:row(['A'],'Can someone follow the story from the aim to the conclusion?',[
  'Clear title, introduction and mathematical aim','Logical paragraphs and links between mathematical stages',
  'No unnecessary repetition, disconnected explanations or huge tables',
  'The conclusion addresses the original aim'],'IB IA Checklist, Criterion A; JIS Guide, pp. 13, 43'),
 D03:row(['B'],'Would a mathematician find the notation and figures clear?',[
  'Variables and specialist mathematical terms defined where required',
  'Conventional typeset equations, not typed calculator syntax',
  'Use an approximation sign (≈) for rounded results, not an exact equals sign',
  'Graphs and tables have readable labels, meaningful scales and units',
  'Mathematical and physical assumptions are stated'],'IB IA Checklist, Criterion B; JIS Guide, pp. 24, 27–28, 44'),
 D04:row(['C'],'Are your genuine decisions visible in the mathematics?',[
  'The mathematical questions come from your own curiosity or context',
  'Your choice of methods and alternatives is explained',
  'Your own examples, trials, changed ideas or conjectures shape the investigation',
  'The work makes your thinking visible, not only effort or first-person writing'],'IB IA Checklist, Criterion C; JIS Guide, pp. 45, 49'),
 D05:row(['D'],'Are you reflecting on the actual mathematics as it unfolds?',[
  'Interpret important results in the context of the investigation',
  'Revisit predictions or explain unexpected results',
  'Evaluate meaningful assumptions, limitations and alternatives',
  'Explain consequences for the conclusion and a worthwhile potential next question'],'IB IA Checklist, Criterion D; JIS Guide, pp. 26, 28, 46, 49'),
 D06:row(['E'],'Does the actual mathematics suit the aim and the course?',[
  'Every substantial technique answers a mathematical question relevant to the aim',
  'Work is at a suitable level for the student’s IB course',
  'Calculations, reasoning, domains and assumptions are mathematically sound',
  'Demonstrate understanding of the mathematics, including technology-generated results',
  'Do not add harder techniques merely to appear sophisticated'],'IB IA Checklist, Criterion E; JIS Guide, pp. 27, 47, 50–51'),
 D07:row(['A','B'],'Can I comfortably read the full draft as it will be shared?',[
  'Print or inspect the exported file at normal reading size',
  'Check equations, captions, figure size, layout and page breaks',
  'Check graphs/tables are close to the writing explaining them'],'JIS Guide, p. 40'),
 D08:row(['A'],'Could another reader identify an unclear leap?',[
  'Ask a peer to explain the path from one stage to the next',
  'If available, ask a non-specialist whether the main narrative makes sense',
  'Identify the exact place the reader lost the thread and rewrite in your own words'],'JIS Guide, p. 40'),
 D09:row([],'Are external sources identifiable and consistently cited?',[
  'Cite all external data, illustrations, quotations, outside mathematics and borrowed ideas',
  'Use a consistent in-text citation style and full source list',
  'JIS 2025 guidance suggests MLA through Google Docs; confirm any updated school preference'],'IB academic-integrity guidance; JIS Guide, pp. 4–6',"Credit and traceability are essential for academic integrity. References and bibliographies are not directly assessed for marks under A–E."),
 D10:row([],'Have I checked the current school formatting requirements?',[
  'Title and page numbering are clear; typography and margins are readable',
  'JIS 2025 guide recommends approximately 12–20 pages and double line spacing',
  'Treat this as guidance, not an automated IB pass/fail threshold; check current teacher instructions'],'IB format guidance; JIS Guide, pp. 2–3',"Page length, spacing and cover conventions are school or IB presentation instructions, not separate Criterion A marking points."),
 D11:row(['E'],'Does the draft contain real mathematical work?',[
  'Show actual equations, calculations, reasoning and/or purposeful figures',
  'Explain what each key result establishes before continuing',
  'Do not mistake a planned technique, predicted result or blank diagram for completed mathematics'],'JIS Guide, pp. 27–31, 40'),
 D12:row([],'Is this clearly my own, appropriately credited exploration?',[
  'The mathematical explanations and reflection are genuinely your own',
  'External calculations, sources and figures are acknowledged',
  'Follow school policies for ethical data and permitted support'],'IB academic-integrity expectations; JIS Guide, pp. 3–4, 40',"Authenticity and correct attribution are obligations, not automatic evidence of Criterion C personal engagement. Engagement must be visible in the actual mathematics."),
 D13:row([],'Am I using the permitted teacher-written feedback opportunity correctly?',[
  'The JIS 2025 guide describes one teacher-written feedback opportunity',
  'Submit a complete draft when required; do not request another written correction round here',
  'Record the teacher’s actual feedback without treating it as a mark'],'JIS Guide, pp. 3, 37, 40'),
 D14:row([],'Have I captured verbal advice as specific actions?',[
  'Write what the teacher actually suggested, not what you infer they approved',
  'Identify the page/equation/figure to change','Return later to check the revision works'],'JIS Guide, pp. 3, 37'),
 D15:row([],'Have changes been implemented and checked in the final file?',[
  'Revise the actual explanation or mathematical working, not only Pathfinder notes',
  'Re-check numerical results, figures and their implications after changing data or methods',
  'Do not call a revision verified merely because you received feedback'],'JIS Guide, pp. 37, 40; review against the actual Criteria D and E',"Recording or completing teacher-feedback revisions earns no separate D or E marks. Only the quality of the revised mathematical reasoning and reflection can strengthen the IA."),
 D16:row(['A','B','C','D','E'],'Can I point to genuine evidence for all five criteria?',[
  'A: coherent, concise mathematical narrative','B: correct and consistent mathematical communication',
  'C: independent student choices that shaped the mathematics',
  'D: meaningful reflection on results and limitations',
  'E: relevant and understood mathematics at an appropriate course level'],'JIS Guide, pp. 42–52'),
 D17:row(['A','B'],'Have I carefully read the actual final PDF/document?',[
  'Correct grammar, spelling, page numbers and unusual line breaks',
  'Check typeset notation, figure legibility, source links and captions at reading size',
  'Reopen the exact file intended for submission after making any changes'],'IB IA Checklist, Criteria A–B; JIS Guide, p. 40'),
 D18:row([],'Have I checked the correct submission identity and cover instructions?',[
  'Follow current school rules for title, candidate identification and file naming',
  'Do not include private participant details or assume a universal cover template'],'JIS Guide, pp. 2–3; current school submission instructions',"Candidate identity, cover details and file naming are submission requirements; meeting them does not by itself demonstrate Criterion A."),
 D19:row(['A','B'],'Is data presented where a reader needs it?',[
  'Put essential figures, tables and commentary together in the main text',
  'If there are large datasets or repeated calculations, use an appendix where useful',
  'Reference appendix material so readers can follow the evidence without clutter'],'JIS Guide, pp. 24, 28, 43'),
 D20:row(['B','E'],'Does my use of technology show mathematical understanding?',[
  'Identify what was calculated or plotted and why it was relevant',
  'Include appropriate inputs, an explanation of outputs and any meaningful checks',
  'Avoid substituting screenshots or software instructions for mathematical reasoning'],'JIS Guide, pp. 27–28; IB IA Checklist, Criterion B'),
 D21:row([],'Do I know the confirmed school submission process?',[
  'Check your own teacher-confirmed deadline, file format and submission location',
  'Save a personal backup before final submission','Pathfinder does not submit, authenticate or grade an IA'],'JIS Guide, pp. 3, 40')
});
export const CHECKING_MODES=Object.freeze([
 {id:'draft',title:'Teacher draft',short:'Review the complete draft before written feedback',icon:'file-check'},
 {id:'feedback',title:'Feedback & revisions',short:'Record real advice and verify each revision',icon:'messages-square'},
 {id:'final',title:'Final check',short:'Inspect the actual file before submission',icon:'check-circle'}
]);
export function reviewCounts(state,mode,checks){
 const rows=checks.map(x=>state?.completion?.review?.records?.[mode+'-'+x.id]?.status||'unchecked');
 return {done:rows.filter(x=>x==='checked'||x==='not-applicable').length,
  checked:rows.filter(x=>x==='checked').length,needsWork:rows.filter(x=>x==='needs-work').length,total:rows.length};
}
