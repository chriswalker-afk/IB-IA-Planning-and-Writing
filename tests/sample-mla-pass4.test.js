import test from 'node:test';
import assert from 'node:assert/strict';
import {createIllustrativeSample,SAMPLE_CHOICES} from '../src/core/illustrative-samples.js';
import {referenceSampleSpec} from '../src/core/sample-library.js';
import {illustrativeIAPagesModel,renderIllustrativeIAReading} from '../src/core/sample-ia-document.js';
import {sampleWorksActuallyCited,COMPLETE_SAMPLE_MLA_CATALOG,VERIFIED_SAMPLE_MLA_SOURCES} from '../src/core/samples/mla-references.js';
import {normalizeProjectState} from '../src/core/project-state.js';

const expected={ 'standing-reach':2,'helicopter-groups':2,'revision-formats':4,
 'grinder-reliability':2,'stopping-distance':2,'drink-cooling':2,'tide-cycles':3,
 'ball-clearance':2,'tray-optimisation':0,'leaf-area':0,'inaccessible-height':0,
 'water-stations':0,'repayment-plans':0 };
const fields=s=>[s.scratch.introduction,s.scratch.dataNotes,...s.entries.flatMap(e=>[
 e.bridge,e.purpose,e.result,e.interpretation,e.limitations,e.nextQuestion,e.nextWhy]),
 ...['mainConclusion','conclusionBenefit','conclusionExtension'].map(k=>s.completion.fields[k])].join('\n');
const getBody=m=>m.sections.slice(0,-1).flatMap(x=>x.rows.map(r=>r.value)).join('\n');
const last=s=>illustrativeIAPagesModel(s).sections.at(-1);
const excluded=/\[(?:M[1-4]|D1)\]/;

test('Pass 4: all thirteen complete examples have the right external-source status',()=>{
 assert.equal(SAMPLE_CHOICES.length,13);
 assert.deepEqual(new Set(Object.keys(expected)),new Set(SAMPLE_CHOICES.map(x=>x.id)));
 assert.deepEqual(new Set(Object.keys(COMPLETE_SAMPLE_MLA_CATALOG)),
  new Set(Object.entries(expected).filter(x=>x[1]>0).map(x=>x[0])));
 const works=Object.values(VERIFIED_SAMPLE_MLA_SOURCES);
 assert.equal(new Set(works.map(x=>x.url)).size,works.length);
 for(const source of works){
  assert(source.url.startsWith('https://'));
  assert(source.work.includes('Accessed 23 Oct. 2026.'));
  assert(source.work.includes(new URL(source.url).hostname.replace(/^www\./,'')),source.title);
  assert(!source.work.includes('[M1]'));
 }
});

test('Pass 4: every real source has an MLA in-text citation and a matching Works Cited entry',()=>{
 for(const [id,total] of Object.entries(expected)){
  const state=createIllustrativeSample(id),spec=referenceSampleSpec(id),model=illustrativeIAPagesModel(state);
  const prose=getBody(model),end=model.sections.at(-1),works=spec.mlaWorksCited||[];
  assert.equal(works.length,total,id);
  assert.equal(sampleWorksActuallyCited(spec,prose).length,total,id+' must cite every listed outside work');
  assert(!excluded.test(prose),id+' still has legacy bracket citation tags');
  assert(!excluded.test(end.rows.map(r=>r.value).join(' ')),id+' old reference label leaked');
  if(total){
   assert.match(end.title,/· Works Cited$/,id);
   assert.equal(end.rows.length,total,id);
   for(const work of works){
    assert(prose.includes(work.cite),id+' missing in-body '+work.cite);
    assert.equal(end.rows.filter(row=>row.value===work.work).length,1,id+' unpaired bibliography entry');
    assert(end.blocks.some(block=>block.field==='worksCited['+work.id+']'&&block.url===work.url),id);
   }
   const sorted=works.map(w=>w.author||w.title);
   assert.deepEqual(sorted,[...sorted].sort((a,b)=>a.localeCompare(b,'en')),id+' MLA ordering');
  }else{
   assert.match(end.title,/Constructed inputs and provenance \(no external Works Cited\)$/,id);
   assert(end.rows.length>0,id+' missing the original constructed-design disclosure');
   assert(!end.rows.some(row=>/https?:\/\//.test(row.value)),id+' synthetic sources must not be fabricated URLs');
  }
 }
});

test('Pass 4: worked in-text citation and bibliography agree in reader, without exporting studio help',()=>{
 for(const [id,total] of Object.entries(expected)){
  const s=createIllustrativeSample(id),m=illustrativeIAPagesModel(s),html=renderIllustrativeIAReading(m);
  assert(html.includes('COMPLETE FICTIONAL')||html.includes('Complete fictional'),id);
  assert.equal((html.match(/class="sample-reader-mla-entry"/g)||[]).length,total,id);
  assert.equal((html.match(/class="sample-reader-mla-source-link"/g)||[]).length,total,id);
  assert(!html.includes('javascript:'),id);
  assert(!html.includes('[M1]'),id);
  assert(!html.includes('[D1]'),id);
  if(total){
   assert(html.includes('Works Cited'),id);
   assert(html.includes('rel="noopener noreferrer"'),id);
   assert(html.includes('referrerpolicy="no-referrer"'),id);
  }
 }
});

test('Pass 4: original fictional data stay fictional and no source is recast as a real experiment',()=>{
 for(const id of Object.keys(expected)){
  const spec=referenceSampleSpec(id),state=createIllustrativeSample(id),all=fields(state);
  assert(/construct|fictional|synthetic|defined hypothetical|hypothetical/i.test([spec.provenance,all.slice(0,1600)].join(' ')),id);
  assert(!/performed an actual study of [^\n]+\bparticipants\b/i.test(all),id);
  assert(!/\bI collected (?:real|physical|measured) (?:data|observations)\b/.test(all),id);
  assert(!excluded.test(state.scratch.introduction),id);
  assert(!excluded.test(state.scratch.dataNotes),id);
  assert(state.completion.sourceRecords.length===1,id);
 }
});

test('Pass 4: citations use the same authored fields in the editable sample and its IA export',()=>{
 for(const id of Object.keys(expected)){
  const s=createIllustrativeSample(id),spec=referenceSampleSpec(id),m=illustrativeIAPagesModel(s);
  const fresh=normalizeProjectState(JSON.parse(JSON.stringify(s))),text=m.sections.flatMap(x=>x.rows.map(r=>r.value)).join('\n');
  assert(text.includes(fresh.scratch.introduction),id);
  assert(text.includes(fresh.scratch.dataNotes),id);
  for(const [i,stage] of spec.stages.entries()){
   assert.equal(fresh.entries[i].purpose,stage.purpose,id+' same-stage citation contract');
   assert.equal(fresh.entries[i].result,stage.result,id+' same mathematical working');
   assert(text.includes(fresh.entries[i].purpose),id+' missing purpose');
  }
  assert.equal(fresh.completion.review.records['final-D09'].status,'unchecked',id);
 }
});

test('Pass 4: editing out a source reference does not silently leave an uncited bibliography item',()=>{
 const id='revision-formats',s=createIllustrativeSample(id);
 const initial=last(s);
 assert.equal(initial.rows.length,4);
 for(const entry of s.entries){
  for(const key of ['bridge','purpose','result','interpretation','limitations','nextQuestion','nextWhy'])
   if(typeof entry[key]==='string')entry[key]=entry[key].replaceAll('(“chi2_contingency”)','');
 }
 for(const key of ['introduction','dataNotes'])s.scratch[key]=String(s.scratch[key]||'').replaceAll('(“chi2_contingency”)','');
 const next=last(s);
 assert.equal(next.rows.length,3,'uncited SciPy entry removed when a sample is revised');
 assert(!next.rows.some(r=>r.value.includes('SciPy Manual')));
});

test('Pass 4: grinder sources appear where two different mathematical methods are introduced',()=>{
 const s=createIllustrativeSample('grinder-reliability');
 assert(s.entries[0].purpose.includes('(NIST/SEMATECH, “Run-Sequence Plot”)'));
 assert(s.entries[2].purpose.includes('(NIST/SEMATECH, “Normal Distribution”)'));
 assert(s.entries[0].purpose.includes('run-sequence plot can show shifts'));
 assert(s.entries[2].purpose.includes('not proof of how a physical grinder'));
 assert(!/\[(?:1|2)\]/.test(getBody(illustrativeIAPagesModel(s))));
});
