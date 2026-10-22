import test from 'node:test';
import assert from 'node:assert/strict';
import {createIllustrativeSample,SAMPLE_CHOICES} from '../src/core/illustrative-samples.js';
import {referenceSampleSpec,sampleLibraryCoverage} from '../src/core/sample-library.js';
import {createProjectState,normalizeProjectState,STORAGE_KEY} from '../src/core/project-state.js';
import {createSamplePreview} from '../src/core/sample-preview.js';
import {illustrativeIAPagesModel,renderIllustrativeIAReading} from '../src/core/sample-ia-document.js';
import {inspectSampleFieldCoverage,SAMPLE_FIELD_CONTRACT} from '../src/core/samples/field-contract.js';
import {SOURCE_FIELDS} from '../src/completing/evidence-links.js';
import {collectProjectFigures,figureForEntry} from '../src/handover/figure-report.js';
import {REPRESENTATION_TOOLS} from '../src/diagrams/representation-registry.js';
import {linkRepresentationFigure,linkedRepresentationEntry} from '../src/diagrams/figure-linking.js';
import {firstSavedFigures} from '../src/completing/first-figure-gallery.js';
import {selectedJourneyOutcome,needsJourneyLinkReview} from '../src/completing/adaptive-journey.js';
import {mixedMathTokens,mathSvg} from '../src/math/mixed-math.js';
import {renderGraphSvg} from '../src/diagrams/graph-core.js';

const ids=['standing-reach','helicopter-groups','revision-formats','grinder-reliability','tray-optimisation'];
const body=model=>model.sections.flatMap(section=>section.rows.map(row=>row.value)).join('\n');
const saved=state=>REPRESENTATION_TOOLS.flatMap(tool=>state[tool.studio].figures.map(figure=>({tool,figure})));

test('the chooser exposes the five authored investigations and the catalogue covers all 16 pathways',()=>{
 assert.deepEqual(SAMPLE_CHOICES.map(item=>item.id),ids);
 const coverage=sampleLibraryCoverage();
 assert.equal(coverage.length,16);
 assert.equal(new Set(coverage.map(item=>item.routeId)).size,16);
 assert.deepEqual(coverage.filter(item=>item.available).map(item=>item.id),ids);
 assert(SAMPLE_CHOICES.every(item=>item.pathway&&item.course&&item.description));
});

test('authored fields survive assembly and reimport without truncation or generic enrichment',()=>{
 for(const id of ids){
  const spec=referenceSampleSpec(id),state=createIllustrativeSample(id);
  const restored=normalizeProjectState(JSON.parse(JSON.stringify(state)));
  for(const [key,value] of Object.entries(spec.planning))assert.equal(restored.planning.fields[key],value,id+' planning '+key);
  for(const [key,value] of Object.entries(spec.conclusion))assert.equal(restored.completion.fields[key],value,id+' conclusion '+key);
  assert.equal(restored.scratch.introduction,spec.introduction);
  assert.equal(restored.scratch.dataNotes,spec.dataNotes);
  assert.equal(restored.entries.length,spec.stages.length);
  for(const [index,stage] of spec.stages.entries()){
   const entry=restored.entries[index];
   for(const [key,value] of Object.entries(stage))if(Object.hasOwn(entry,key)&&typeof value==='string')
    assert.equal(entry[key],value,id+' stage '+index+' '+key+' changed on normalization');
   for(const key of ['bridge','purpose','result','interpretation','limitations','localTakeaway','nextQuestion','nextWhy'])
    assert.equal(entry[key],stage[key],id+' stage '+index+' '+key);
   assert(selectedJourneyOutcome(restored,entry),id+' invalid outcome');
   if(index)assert(!needsJourneyLinkReview(restored,entry),id+' stale stage link');
  }
  assert.equal(restored.completion.fields.firstWorkResult,spec.stages[0].result);
  assert.equal(restored.completion.fields.firstResultSummary,spec.stages[0].localTakeaway);
  assert.equal(restored.scratch.conclusion,'');
  assert.equal(restored.teacher.feedbackStatus,'not-requested');
  assert.equal(restored.project.documentUrl,'');
  assert.equal(restored.completion.review.records['final-D16'].status,'unchecked');
  assert.equal(restored.planning.fields.milestoneSchoolFinal,'');
 }
});

test('all authored samples cover the shared live writing contract with supported selector values',()=>{
 const paths=[...SAMPLE_FIELD_CONTRACT.filter(field=>field.category==='authored'&&['all','stage'].includes(field.appliesTo)).map(field=>field.path),
  'planning.fields.provisionalTitle','planning.fields.aim','planning.fields.beneficiary',
  'completion.fields.dataAimLink','completion.fields.firstDefinitions','completion.fields.methodReason',
  'completion.fields.firstMethodEvaluation','completion.fields.mainConclusion',
  'completion.fields.conclusionBenefit','completion.fields.conclusionExtension',
  'completion.fields.variableDefinitions',
  'entries[].purpose','entries[].result','entries[].interpretation','entries[].limitations',
  'entries[].localTakeaway','entries[].nextQuestion','entries[].nextWhy',
  'completion.review.records.draft-D02.note','completion.review.records.draft-D06.note'];
 for(const id of ids){
  const state=createIllustrativeSample(id);
  assert.deepEqual(inspectSampleFieldCoverage(state,paths).filter(item=>!item.present),[]);
  assert(['me','others','both','unsure'].includes(state.planning.fields.beneficiaryType));
  assert(['syllabus','outside','unsure'].includes(state.planning.fields.mathsOutside));
  assert(['pending','unsure','confirmed','not-needed'].includes(state.completion.fields.permissionStatus));
  assert.equal(state.completion.fields.draftComplete,'ready',id+' completed working draft status');
  assert(Number(state.planning.fields.timelineWeeks)>0,id+' provisional time budget');
  assert(['yes','no'].includes(state.planning.fields.timelineEarly),id+' provisional early-finish decision');
  assert(['scatter','model','theory','other'].includes(state.entries[0].kind),id+' unsupported first-result selector');
  if(id==='standing-reach')assert.equal(state.planning.fields.dataAvailability,'in-hand');
 }
});

test('saved sample sources preserve every applicable answer shown in the active source editor',()=>{
 for(const id of ids){
  const state=createIllustrativeSample(id),restored=normalizeProjectState(JSON.parse(JSON.stringify(state)));
  assert.equal(restored.completion.sourceRecords.length,1,id+' source scope needs an explicit test decision');
  const source=restored.completion.sourceRecords[0];
  assert.equal(restored.completion.activeSourceId,source.id);
  for(const key of SOURCE_FIELDS)assert.equal(source.fields[key],restored.completion.fields[key],id+' source/editor mismatch: '+key);
 }
});

test('the complete reader orders the current answers and places every saved figure once',()=>{
 for(const id of ids){
  const state=createIllustrativeSample(id),spec=referenceSampleSpec(id),model=illustrativeIAPagesModel(state);
  const figures=model.sections.flatMap(section=>section.figures);
  assert.equal(model.isCompleteIllustrativeIA,true);
  assert.equal(figures.length,spec.figures.length);
  assert.equal(new Set(figures.map(figure=>figure.id)).size,figures.length);
  assert.equal(model.sections.at(-2).title,(state.entries.length+3)+' · Conclusion');
  const text=body(model);
  assert(text.includes(state.completion.fields.methodReason));
  assert(text.includes(state.completion.fields.firstMethodEvaluation));
  assert(state.entries.every(entry=>text.includes(entry.nextQuestion)),id+' transition question omitted');
  assert.equal(text.split(state.completion.fields.dataAimLink).length-1,1);
  for(const plan of spec.figures){
   const section=model.sections[plan.stage+2],index=section.blocks.findIndex(block=>block.figure?.id===plan.id);
   assert(index>=0,plan.id+' omitted');
   const preceding=section.blocks.slice(0,index).filter(block=>block.type==='text').at(-1);
   assert.equal(preceding.field,'entries['+plan.stage+'].'+(plan.after||'result'),plan.id+' misplaced');
   assert(section.figures.includes(section.blocks[index].figure),'export rasterisation must update the block figure');
  }
  assert(!/you should|a strong IA|insert (?:a|your)|write (?:a|your) paragraph|TODO|\[placeholder\]/i.test(text));
 }
});

test('editing a sample changes the reader without changing its canonical authoring specification',()=>{
 const state=createIllustrativeSample('standing-reach'),spec=referenceSampleSpec(state.demo);
 const original=spec.stages[0].result;
 state.scratch.introduction='I revised my introductory explanation.';
 state.entries[0].result=String.raw`I checked the revision with \(2+2=4\).`;
 state.completion.fields.mainConclusion='My revised conclusion follows the updated check.';
 state.planning.fields.provisionalTitle='My revised example';
 const model=illustrativeIAPagesModel(state),text=body(model);
 assert.equal(model.title,'My revised example');
 assert(text.includes(state.scratch.introduction));
 assert(text.includes(state.entries[0].result));
 assert(text.includes(state.completion.fields.mainConclusion));
 assert(!text.includes(original));
 assert.equal(spec.stages[0].result,original);
});

test('every authored narrative equation renders and user-entered HTML is escaped',()=>{
 for(const id of ids){
  const state=createIllustrativeSample(id),model=illustrativeIAPagesModel(state);
  let formulae=0;
  for(const token of mixedMathTokens(body(model))){
   // Test fields separately below: the mixed writer has a per-field segment guard.
   if(token.type==='math')formulae++;
  }
  assert(formulae>0);
  for(const section of model.sections)for(const row of section.rows)
   for(const token of mixedMathTokens(row.value))if(token.type==='math')
    assert(mathSvg(token.value,{display:token.display}).svg.includes('<svg'));
  const html=renderIllustrativeIAReading(model);
  assert(!html.includes('math-preview-invalid'));
  assert(!html.includes('math-edit-existing'),'reader equations are read-only');
  assert.equal((html.match(/data-sample-figure=/g)||[]).length,referenceSampleSpec(id).figures.length);
  const htmlIds=[...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(new Set(htmlIds).size,htmlIds.length,id+' has colliding inline SVG identifiers');
 }
 const state=createIllustrativeSample(ids[0]);state.scratch.introduction='<script>alert(1)</script>';
 const html=renderIllustrativeIAReading(illustrativeIAPagesModel(state));
 assert(html.includes('&lt;script&gt;'));assert(!html.includes('<script>'));
});

test('native figures and working data survive a backup and remain assigned to the correct stage',()=>{
 for(const id of ids){
  const state=createIllustrativeSample(id),restored=normalizeProjectState(JSON.parse(JSON.stringify(state)));
  assert.equal(restored.dataShelf.length,state.dataShelf.length);
  assert.deepEqual(restored.dataShelf.map(data=>data.matrix),state.dataShelf.map(data=>data.matrix));
  const figures=collectProjectFigures(restored);
  assert.equal(figures.length,referenceSampleSpec(id).figures.length);
  for(const figure of figures){
   assert(!figure.error,figure.error);
   assert(figure.svg.includes('<svg'));
   assert.equal(restored.entries.filter(entry=>figureForEntry(figure,entry)).length,1,figure.id);
  }
  for(const {tool,figure} of saved(restored)){
   const owner=linkedRepresentationEntry(restored.entries,tool.entryKey,figure).linked;
   assert(owner&&owner.figureRefs.includes(tool.id+':'+figure.id));
  }
 }
});

test('several figures from one tool can share a stage and editing one preserves its siblings',()=>{
 const state=createIllustrativeSample('standing-reach'),entry=state.entries[0];
 const first=state.graphStudio.figures[0],extra=structuredClone(first);
 extra.id='figure-reach-extra';state.graphStudio.figures.push(extra);
 entry.figureRefs.push('graph:'+extra.id);
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(state)));
 const current=restored.entries[0],record=restored.graphStudio.figures.find(figure=>figure.id===extra.id);
 linkRepresentationFigure(restored,'graph',record,current);
 assert.equal(current.graphFigureId,first.id);
 assert(current.figureRefs.includes('graph:'+first.id));
 assert(current.figureRefs.includes('graph:'+extra.id));
 assert.equal(firstSavedFigures(restored,{scope:'first'}).filter(item=>item.kind==='graph').length,2);
 assert.equal(illustrativeIAPagesModel(restored).sections[2].figures.length,2);
 const next=restored.entries[4];
 linkRepresentationFigure(restored,'graph',record,next);
 assert(!current.figureRefs.includes('graph:'+extra.id));
 assert.equal(current.reviewNeeded,'yes');
 assert.equal(linkedRepresentationEntry(restored.entries,'graphFigureId',record).linked.id,next.id);
 assert.equal(illustrativeIAPagesModel(restored).sections[2].figures.length,1);
});

test('function figure captions use the student variable symbols rather than internal evaluator x',()=>{
 const state=createIllustrativeSample('tray-optimisation');
 for(const figure of state.graphStudio.figures){
  const svg=renderGraphSvg(figure.draft);
  const footer=svg.match(/Function: ([^<]+)/)?.[1];
  assert(footer,figure.id);
  assert(!/\bx\b/.test(footer),figure.id+' exposes internal x');
  assert(footer.includes(figure.draft.xSymbol));
 }
});

test('opening, editing, switching and resuming the new samples preserves the personal investigation',()=>{
 const values=new Map(),storage={getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
 const personal=createProjectState();personal.scratch.introduction='My original student investigation';
 storage.setItem(STORAGE_KEY,JSON.stringify(personal));
 const before=storage.getItem(STORAGE_KEY),preview=createSamplePreview(storage,normalizeProjectState);
 let current=preview.begin(personal,createIllustrativeSample(ids[0]));
 current.scratch.introduction='My exploratory edit to the sample';preview.save(current);
 current=preview.begin(current,createIllustrativeSample(ids[1]));preview.save(current);
 const resumed=createSamplePreview(storage,normalizeProjectState);
 assert.equal(resumed.resume().demo,ids[1]);
 assert.equal(resumed.leave().scratch.introduction,personal.scratch.introduction);
 assert.equal(storage.getItem(STORAGE_KEY),before);
});
