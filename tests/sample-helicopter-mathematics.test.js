import test from 'node:test';
import assert from 'node:assert/strict';
import {
 HELICOPTER_GROUPS_SPEC as sample,HELICOPTER_CASES as cases,
 HELICOPTER_FRAME_RATE as fps,HELICOPTER_USEFUL_GAIN as gain,
 HELICOPTER_SUMMARIES,HELICOPTER_COMPARISONS,HELICOPTER_OMISSIONS
} from '../src/core/samples/helicopter-groups.js';
import {statAnalysis,normalizeStatDraft} from '../src/diagrams/stat-studio-core.js';
import {renderStatSvg} from '../src/diagrams/stat-studio-render.js';
import {analyzeTable} from '../src/diagrams/table-studio-core.js';
import {mixedMathTokens,mathSvg} from '../src/math/mixed-math.js';
import {createProjectState} from '../src/core/project-state.js';
import {SAMPLE_FIELD_CONTRACT} from '../src/core/samples/field-contract.js';
import {SOURCE_FIELDS} from '../src/completing/evidence-links.js';
import {journeyOutcomeOptions} from '../src/completing/adaptive-journey.js';

const close=(a,b,tolerance=1e-10)=>assert(Math.abs(a-b)<=tolerance,`${a} differs from ${b}`);
const total=values=>values.reduce((acc,value)=>acc+value,0);
const byDesign=design=>cases.filter(item=>item.design===design);
const frames=item=>total(item.frames);
const times=design=>byDesign(design).map(item=>frames(item)/150);
const avg=values=>total(values)/values.length;
const figure=id=>sample.figures.find(item=>item.id===id);
const independentDifference=(a,b)=>
 (total(b.map(frames))*a.length-total(a.map(frames))*b.length)/(a.length*b.length*150);
// Pairwise differences give sample variance without the author's centred-sum
// calculation. All comparisons below start with the original integer readings.
function independentSD(values){
 let differences=0;
 for(let i=0;i<values.length;i++)for(let j=i+1;j<values.length;j++)differences+=(values[i]-values[j])**2;
 return Math.sqrt(differences/(values.length*(values.length-1)));
}

test('helicopter log preserves 24 objects, 72 repeated readings and every ID',()=>{
 assert.equal(fps,50);assert.equal(gain,0.2);
 assert.equal(cases.length,24);assert.equal(new Set(cases.map(item=>item.id)).size,24);
 for(const design of ['A','B']){
  assert.equal(byDesign(design).length,12);
  assert.deepEqual(byDesign(design).map(item=>item.id),Array.from({length:12},(_,i)=>design+String(i+1).padStart(2,'0')));
 }
 for(const item of cases){
  assert.equal(item.frames.length,3);
  assert(item.frames.every(value=>Number.isInteger(value)&&value>0));
 }
 const raw=sample.dataSets[0].rows;
 assert.equal(raw.length,24);
 raw.forEach(([id,design,a,b,c,mean],i)=>{
  assert.equal(id,cases[i].id);assert.equal(design,cases[i].design);
  assert.deepEqual([a,b,c],cases[i].frames);close(mean,frames(cases[i])/150);
 });
 close(frames(cases.find(item=>item.id==='A01'))/150,1.84);
 assert.match(sample.completion.sampleSize,/24 distinct helicopters/);
 assert.match(sample.stages[0].result,/n_A=n_B=12/);
 assert.match(sample.provenance,/not randomly drawn/);
 assert.match(sample.readingNote,/not a record of real flights/);
});

test('group centres, quartiles and standard deviations reproduce independently from raw counts',()=>{
 for(const [design,expected] of Object.entries({
  A:{mean:559/300,median:1.86,q1:1.74,q3:1.98,sd:0.15011106998930274},
  B:{mean:323/150,median:2.12,q1:1.97,q3:2.27,sd:0.2706669652185247}
 })){
  const values=times(design),sorted=[...values].sort((a,b)=>a-b),actual=HELICOPTER_SUMMARIES[design];
  close(avg(values),expected.mean);close(independentSD(values),expected.sd);
  close((sorted[5]+sorted[6])/2,expected.median);
  close((sorted[2]+sorted[3])/2,expected.q1);
  close((sorted[8]+sorted[9])/2,expected.q3);
  for(const [key,value] of Object.entries(expected))close(actual[key],value);
  close(actual.iqr,expected.q3-expected.q1);
 }
 const difference=independentDifference(byDesign('A'),byDesign('B'));
 close(difference,0.29);close(100*difference/avg(times('A')),15.56350626118068);
 close(total(times('A').map(value=>value**2)),41.912);
 close(total(times('B').map(value=>value**2)),56.448);
 const rows=figure('table-helicopter-summary').draft.matrix;
 assert.deepEqual(rows.map(row=>row[0]),['A','B']);
 for(const row of rows){
  const values=times(row[0]),sorted=[...values].sort((a,b)=>a-b);
  close(Number(row[1]),Number(avg(values).toFixed(3)));
  close(Number(row[2]),(sorted[5]+sorted[6])/2);
  close(Number(row[3]),Number(independentSD(values).toFixed(3)));
  close(Number(row[4]),(sorted[8]+sorted[9]-sorted[2]-sorted[3])/2);
 }
 assert.match(sample.stages[1].result,/0\.290/);
 assert.match(sample.conclusion.mainConclusion,/15\.6/);
});

test('native distributions contain one value per helicopter and flag rather than delete B07',()=>{
 for(const id of ['stat-helicopter-means','stat-helicopter-boxes']){
  const d=figure(id).draft;
  assert.deepEqual(d.matrix.map(row=>Number(row[0])),times('A'));
  assert.deepEqual(d.matrix.map(row=>Number(row[1])),times('B'));
  const analysed=statAnalysis(d);assert.equal(analysed.ready,true);
  assert.deepEqual(analysed.result.series.map(series=>series.values.length),[12,12]);
 }
 const result=statAnalysis(figure('stat-helicopter-boxes').draft).result;
 const a=result.series[0].box,b=result.series[1].box;
 close(b.q3+1.5*b.iqr,2.72);assert.deepEqual(a.outliers,[]);assert.deepEqual(b.outliers,[2.82]);
 close(b.highWhisker,2.38);close(b.max,2.82);
 const outlier=cases.find(item=>item.id==='B07');
 assert(outlier.frames.every(count=>count/fps>2.38));
 assert(sample.dataSets[0].rows.some(row=>row[0]==='B07'));
 assert.match(sample.stages[2].interpretation,/kept all 24 objects/);
});

test('every omission removes a whole object, preserves the original log and retains the useful mean gain',()=>{
 assert.equal(HELICOPTER_OMISSIONS.length,24);
 const checked=[];
 for(const diagnostic of HELICOPTER_OMISSIONS){
  const a=byDesign('A').filter(item=>item.id!==diagnostic.omitted);
  const b=byDesign('B').filter(item=>item.id!==diagnostic.omitted);
  assert.equal(a.length+b.length,23);assert.equal(diagnostic.nA,a.length);assert.equal(diagnostic.nB,b.length);
  close(diagnostic.meanA,total(a.map(frames))/(a.length*150));
  close(diagnostic.meanB,total(b.map(frames))/(b.length*150));
  const difference=independentDifference(a,b);close(diagnostic.difference,difference);
  assert(difference>gain);checked.push({id:diagnostic.omitted,difference});
 }
 checked.sort((a,b)=>a.difference-b.difference);
 assert.equal(checked[0].id,'B07');close(checked[0].difference,757/3300);
 assert.equal(checked.at(-1).id,'B06');close(checked.at(-1).difference,1063/3300);
 const reduced=byDesign('B').filter(item=>item.id!=='B07').map(item=>frames(item)/150);
 close(independentSD(reduced),0.1791698026504974);
 assert.equal(sample.dataSets[1].rows.length,24);assert.equal(sample.dataSets[0].rows.length,24);
 const summary=figure('table-helicopter-omissions').draft.matrix;
 assert.deepEqual(summary.map(row=>row[0]),['All objects','Omit B07','Omit A07','Omit B06']);
 for(const row of summary.slice(1)){
  const actual=checked.find(item=>row[0]==='Omit '+item.id);
  close(Number(row[3]),Number(actual.difference.toFixed(4)));
  close(Number(row[4]),Number((actual.difference-gain).toFixed(4)));
 }
});

test('finite pair counting distinguishes strict wins, ties and the inclusive useful-gain threshold',()=>{
 const a=byDesign('A'),b=byDesign('B');
 const deltas=a.flatMap(x=>b.map(y=>frames(y)-frames(x)));
 assert.equal(deltas.length,144);assert.equal(HELICOPTER_COMPARISONS.length,144);
 assert.equal(new Set(HELICOPTER_COMPARISONS.map(item=>item.aId+'/'+item.bId)).size,144);
 HELICOPTER_COMPARISONS.forEach((item,index)=>{
  assert.equal(item.frameSumDifference,deltas[index]);close(item.difference,deltas[index]/150);
 });
 assert.equal(deltas.filter(value=>value>0).length,121);
 assert.equal(deltas.filter(value=>value===0).length,3);
 assert.equal(deltas.filter(value=>value<0).length,20);
 assert.equal(deltas.filter(value=>value>=30).length,86);
 assert.equal(deltas.filter(value=>value===30).length,3);
 close(avg(deltas)/150,independentDifference(a,b));
 close(Math.min(...deltas)/150,-0.32);close(Math.max(...deltas)/150,1.18);
 for(const [id,count] of [['A01',8],['A05',2]])
  assert.equal(HELICOPTER_COMPARISONS.filter(item=>item.aId===id&&item.frameSumDifference>=30).length,count);
 const stored=sample.dataSets[2].rows;
 assert.equal(stored.length,144);
 stored.forEach((row,index)=>assert.equal(row[4],deltas[index]>=30?'Yes':'No'));
 assert.match(sample.stages[3].purpose,/uniformly/);
 assert.match(sample.stages[3].limitations,/not independent experimental trials/);
 assert.match(sample.conclusion.conclusionBenefit,/not future flights/);
});

test('pair histogram preserves every derived comparison and the count at its 0.20-second boundary',()=>{
 const draft=figure('stat-helicopter-pair-differences').draft;
 const q=statAnalysis(draft);assert.equal(q.ready,true,JSON.stringify(q.problems));
 assert.equal(q.result.total,144);
 assert.deepEqual(draft.matrix.map(row=>Number(row[0])),HELICOPTER_COMPARISONS.map(item=>item.difference));
 assert.equal(q.result.bins.filter(bin=>bin.low>=0.2-1e-9).reduce((acc,bin)=>acc+bin.frequency,0),86);
 assert.equal(q.result.bins.reduce((acc,bin)=>acc+bin.frequency,0),144);
 assert.match(draft.caption,/not 144 independent flights/);
});

test('endpoint bounds survive averaging and give sharp finite-list threshold limits',()=>{
 const endpointBound=0.5/fps,durationBound=2*endpointBound,differenceBound=2*durationBound;
 close(endpointBound,0.01);close(durationBound,0.02);close(differenceBound,0.04);
 // Taking every endpoint error at its adverse extreme attains the bound;
 // averaging three drops or 12 objects cannot reduce this shared-error case.
 const adverseObject=avg(Array.from({length:3},()=>-endpointBound-endpointBound));
 const adverseGroup=avg(Array.from({length:12},()=>adverseObject));
 close(adverseGroup,-durationBound);
 const original=independentDifference(byDesign('A'),byDesign('B'));
 close(original-differenceBound,0.25);close(original+differenceBound,0.33);
 const critical=(original-gain)/2;close(critical,0.045);
 close(original-2*critical,gain);assert(original-2*(critical+0.0001)<gain);
 const deltas=HELICOPTER_COMPARISONS.map(item=>item.frameSumDifference);
 const shift=6; // 0.04 seconds expressed in the integer-sum denominator 150.
 assert.equal(deltas.filter(value=>value-shift>=30).length,78);
 assert.equal(deltas.filter(value=>value+shift>=30).length,95);
 close(100*78/144,54.1666666666667);close(100*95/144,65.9722222222222);
 const omission=independentDifference(byDesign('A'),byDesign('B').filter(item=>item.id!=='B07'));
 assert(omission>gain);assert(omission-differenceBound<gain);
 close(omission-differenceBound,625/3300);
 const rows=figure('table-helicopter-timing').draft.matrix;
 close(Number(rows[0][2]),original-differenceBound);
 close(Number(rows[1][2]),Number((omission-differenceBound).toFixed(4)));
 assert.match(sample.conclusion.conclusionBenefit,/0\.1894/);
 assert.match(sample.stages[4].limitations,/not a confidence interval/);
});

test('authored fields and outcomes use the current schema without fabricated external checks',()=>{
 const state=createProjectState();
 for(const [section,values] of [['planning',sample.planning],['completion',sample.completion]]){
  for(const [key,value] of Object.entries(values)){
   assert(Object.hasOwn(state[section].fields,key),`${section}.${key}`);
   assert.equal(typeof value,'string');
   const contract=SAMPLE_FIELD_CONTRACT.find(row=>row.path===`${section}.fields.${key}`);
   assert(contract,`${section}.${key} is absent from the contract`);
   assert.notEqual(contract.category,'legacy',`${section}.${key}`);
  }
 }
 for(const key of SOURCE_FIELDS)assert.equal(sample.sources[0].fields[key],sample.completion[key]||'');
 assert.equal(sample.completion.actualSourceType,'secondary');
 assert.equal(sample.completion.sampleOrCensus,'');
 state.planning.routeExplorer.selectedRoute='groups';
 sample.stages.forEach((stage,index)=>{
  const entry={...stage,status:'completed',phase:index?'substantial':'first'};
  assert(journeyOutcomeOptions(state,entry).some(option=>option.id===stage.outcomeId),stage.key);
 });
 const layout=sample.reviews.find(row=>row.id==='D07');
 assert(['needs-work','checked'].includes(layout.status));
 if(layout.status==='needs-work')assert.match(layout.note,/not yet inspected/);
 assert(!sample.reviews.some(row=>['D08','D10','D12'].includes(row.id)));
 assert.equal(sample.completion.writtenFeedback,undefined);
});

test('all authored mathematics and editable native figures have valid render inputs',()=>{
 function visit(value){
  if(typeof value==='string'){
   for(const token of mixedMathTokens(value))if(token.type==='math')
    assert(mathSvg(token.value,{display:token.display}).svg.startsWith('<svg'),token.value);
  }else if(Array.isArray(value))value.forEach(visit);
  else if(value&&typeof value==='object')Object.values(value).forEach(visit);
 }
 visit(sample);
 for(const item of sample.figures){
  assert(sample.stages[item.stage],item.id);
  if(item.tool==='stat'){
   const q=statAnalysis(normalizeStatDraft(item.draft));assert.equal(q.ready,true,item.id+': '+JSON.stringify(q.problems));
   assert(renderStatSvg(item.draft).startsWith('<svg'));
  }else{
   assert.equal(item.tool,'table');const q=analyzeTable(item.draft);assert.equal(q.ready,true,item.id+': '+JSON.stringify(q.problems));
  }
 }
});
