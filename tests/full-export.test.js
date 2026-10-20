import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {PDFDocument} from 'pdf-lib';
import {createProjectState,normalizeProjectState} from '../src/core/project-state.js';
import {applyPlanningField} from '../src/planning/engine.js';
import {modelFromFullProject} from '../src/handover/full-project-model.js';
import {createFullProjectExport} from '../src/handover/full-export.js';
import {importEmbeddedPdfReport} from '../src/handover/formats/pdf.js';
import {importEmbeddedDocxReport} from '../src/handover/formats/docx.js';
function sample(){
 const s=createProjectState();
 for(const [k,v] of Object.entries({aim:'A synthetic curve investigation',course:'AA SL',kind:'statistics',prediction:'Perhaps the trend curves'}))applyPlanningField(s,k,v);
 s.project.aim='A synthetic curve investigation';s.planning.completed=true;
 s.scratch.introduction='Student opening notes';s.scratch.conclusion='Student concluding thought';
 s.entries=[
  {id:'real1',phase:'first',status:'completed',title:'First scatter graph',purpose:'Discover form',result:'A curved set of points',interpretation:'A straight line is unsuitable',sourceRefs:['src1'],accuracyRefs:['acc1']},
  {id:'planned2',phase:'substantial',status:'planned',title:'Possible residual check',purpose:'Review a model'}
 ];
 s.completion.fields.actualSource='Recorded fictional source';s.completion.fields.mainConclusion='Student mathematical synthesis';
 s.completion.fields.conclusionBenefit='The result is limited to the measured range';
 s.completion.fields.conclusionExtension='Would a more realistic curved model explain the evidence?';
 s.completion.conclusionResultIds=['real1'];
 s.completion.sourceRecords=[{id:'src1',fields:{actualSource:'Student recorded source'}}];
 s.completion.accuracyDecisions=[{id:'acc1',quantity:'time',unit:'seconds',resolution:'0.1',reason:'instrument resolution'}];
 s.completion.confirmedLimitations=[{id:'L01',entryId:'real1',explanation:'Small dataset',consequence:'Poor extrapolation'}];
 s.cueNotes['a-context-key']='Reflection privately recorded';
 s.completion.review.records['draft-D02'].note='Evidence is found on page 5';
 s.ideaExplorer.shortlist=[{id:'idea-1',question:'Could a curve model it?',detail:'Try small cases'}];
 return s;
}
const dump=model=>model.sections.flatMap(s=>s.rows.map(x=>x.label+': '+x.value)).join('\n');
test('full record represents planning and all substantive Studio work without upgrading proposed maths into a result',()=>{
 const m=modelFromFullProject(sample()),text=dump(m);
 for(const phrase of ['A synthetic curve investigation','Student opening notes','A curved set of points','A straight line is unsuitable','Possible residual check','Planned only — not an actual result','Recorded fictional source','instrument resolution','Poor extrapolation','Reflection privately recorded','Evidence is found on page 5','Student concluding thought','Could a curve model it?',
 'Student mathematical synthesis','The result is limited to the measured range',
 'Would a more realistic curved model explain the evidence?','Student-confirmed · First scatter graph'])assert(text.includes(phrase),'Missing '+phrase);
 assert(m.title.includes('Full Working Record'));assert(m.footnote.includes('Planning-only'));
});
test('complete project ZIP contains PDF, Word, full restorable JSON and a human-readable guide',async()=>{
 const s=sample(),before=JSON.stringify(s);
 const out=await createFullProjectExport(s,'zip');
 assert(out.name.endsWith('.zip'));assert.equal(out.mime,'application/zip');
 const zip=await JSZip.loadAsync(out.bytes),names=Object.keys(zip.files);
 assert(names.some(x=>x.endsWith('.pdf')));assert(names.some(x=>x.endsWith('.docx')));
 assert(zip.file('ia-pathfinder-project.json'));assert(zip.file('README.txt'));
 const restored=normalizeProjectState(JSON.parse(await zip.file('ia-pathfinder-project.json').async('string')));
 assert.equal(restored.entries[0].result,'A curved set of points');
 assert.deepEqual(restored.completion.conclusionResultIds,['real1']);
 assert.equal(restored.completion.fields.conclusionExtension,'Would a more realistic curved model explain the evidence?');
 assert.equal(restored.cueNotes['a-context-key'],'Reflection privately recorded');
 assert.equal(restored.completion.review.records['draft-D02'].note,'Evidence is found on page 5');
 assert.equal(restored.ideaExplorer.shortlist[0].question,'Could a curve model it?');
 assert.equal(JSON.stringify(s),before,'Export mutated the live record');
 const pdfFile=names.find(x=>x.endsWith('.pdf')),docxFile=names.find(x=>x.endsWith('.docx'));
 assert((await PDFDocument.load(await zip.file(pdfFile).async('uint8array'))).getPageCount()>1);
 const word=await JSZip.loadAsync(await zip.file(docxFile).async('uint8array'));
 const text=await word.file('word/document.xml').async('string');
 for(const phrase of ['Student opening notes','A curved set of points','Possible residual check','Poor extrapolation'])assert(text.includes(phrase),'DOCX omits '+phrase);
});
test('standalone readable PDF and DOCX keep existing planning-only import compatibility',async()=>{
 const s=sample();
 const pdf=await createFullProjectExport(s,'pdf'),word=await createFullProjectExport(s,'docx');
 assert(pdf.bytes[0]===37&&pdf.bytes[1]===80);
 assert((await importEmbeddedPdfReport(pdf.bytes)).planning.fields.aim==='A synthetic curve investigation');
 const plan=await importEmbeddedDocxReport(word.bytes);
 assert.equal(plan.planning.fields.aim,'A synthetic curve investigation');
 assert.equal(plan.entries,undefined,'PDF and Word do not restore finished maths');
});
test('empty project produces valid full exports without inventing mathematical evidence',async()=>{
 const s=createProjectState();
 assert(!modelFromFullProject(s).sections.some(x=>x.title==='Mathematical journey'),'Empty journeys must not be printed');
 for(const format of ['pdf','docx','zip'])assert((await createFullProjectExport(s,format)).bytes.length>1500);
});

test('saved figures appear in full reports once, linked to the correct mathematical stage',()=>{
 const s=sample();
 s.graphStudio.figures.push({id:'figure-test',entryId:'real1',savedAt:'2026-10-20',draft:{
  title:'Actual plot',kind:'scatter',raw:'time,distance\\n1,2\\n2,5',matrix:[['1','2'],['2','5']],
  columns:['time','distance'],xLabel:'Time',yLabel:'Distance',xIndex:0,yIndex:1
 }});
 s.entries[0].graphFigureId='figure-test';
 const m=modelFromFullProject(s),figs=m.sections.flatMap(sec=>sec.figures||[]);
 assert.equal(figs.length,1);assert.equal(figs[0].id,'figure-test');
 assert(m.sections.some(sec=>sec.title.includes('Figure for mathematical step 1')));
 assert(figs[0].svg.includes('<svg'));
 assert(m.sections.some(sec=>sec.rows.some(row=>row.value.includes('time,distance'))));
});
test('unlinked saved figures and draft representations are labelled without inventing results',()=>{
 const s=createProjectState();
 s.voronoiStudio.draft.title='Incomplete Voronoi idea';
 s.voronoiStudio.draft.sites=[{id:'one',name:'School',x:0,y:0,kind:'observed'}];
 const m=modelFromFullProject(s);
 assert(m.sections.some(sec=>sec.title.includes('Other saved figure')));
 assert(m.sections.some(sec=>sec.description.includes('not linked')));
 assert(!m.sections.some(sec=>sec.title==='Mathematical journey'));
});
