import test from 'node:test';
import assert from 'node:assert/strict';
import {
 GRINDER_RELIABILITY_SPEC as sample,GRINDER_MASSES as masses,GRINDER_CASES as cases,
 GRINDER_CONDITIONS as conditions,GRINDER_CALCULATIONS as calculation,
 GRINDER_BLOCKS as blocks,GRINDER_WINDOW_CHECKS as windowChecks,
 GRINDER_SCENARIOS as scenarios,grinderNormalCDF,grinderNormalCoverage
} from '../src/core/samples/grinder-reliability.js';
import {analyseGraph,normalizeGraphDraft} from '../src/diagrams/graph-core.js';
import {statAnalysis,normalizeStatDraft} from '../src/diagrams/stat-studio-core.js';
import {analyzeTable,normalizeTableDraft} from '../src/diagrams/table-studio-core.js';
import {PLANNING_FIELD_DEFAULTS} from '../src/planning/engine.js';
import {C_FIELD_DEFAULTS} from '../src/completing/engine.js';
import {SAMPLE_FIELD_CONTRACT} from '../src/core/samples/field-contract.js';
import {SOURCE_FIELDS} from '../src/completing/evidence-links.js';
import {createProjectState} from '../src/core/project-state.js';
import {journeyOutcomeOptions} from '../src/completing/adaptive-journey.js';
import {METHOD_OPTIONS} from '../src/completing/guidance-context.js';
import {mixedMathTokens,mathSvg} from '../src/math/mixed-math.js';

const near=(actual,expected,tolerance=1e-9)=>
 assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} differs from ${expected}`);
const cents=masses.map(mass=>Math.round(100*mass));
const total=cents.reduce((a,b)=>a+b,0);
const totalSquares=cents.reduce((a,b)=>a+b*b,0);
// Raw integer sums independently check the author's centred-deviation algorithm.
const independentMean=total/(100*cents.length);
const independentVariance=(totalSquares-total*total/cents.length)/((cents.length-1)*10000);
const independentSD=Math.sqrt(independentVariance);
const integerBandCount=values=>values.filter(value=>value>=1770&&value<=1830).length;

// Direct midpoint integration in mass units is deliberately independent of the
// sample's Simpson standard-normal CDF implementation and CDF subtraction.
function integratedCoverage(mean,sd,lower=17.7,upper=18.3){
 const intervals=30000,step=(upper-lower)/intervals;
 let area=0;
 for(let i=0;i<intervals;i++){
  const mass=lower+(i+0.5)*step,z=(mass-mean)/sd;
  area+=Math.exp(-0.5*z*z)/(sd*Math.sqrt(2*Math.PI));
 }
 return area*step;
}

test('the complete constructed sequence preserves order, display resolution and fixed design criteria',()=>{
 assert.equal(masses.length,60);
 assert.equal(total,109034);
 assert.equal(totalSquares,198162970);
 for(const [i,mass] of masses.entries()){
  near(mass*100,cents[i],1e-10);
  assert.deepEqual(cases[i],[i+1,6,mass]);
 }
 assert.deepEqual(conditions,{target:18,lower:17.7,upper:18.3,requiredFraction:0.95,
  timerSeconds:6,displayIncrement:0.01,blockSize:10});
 const raw=sample.dataSets.find(data=>data.name==='Grinder Dose Cases v1');
 assert.equal(raw.rows.length,60);
 for(const [i,row] of raw.rows.entries()){
  assert.equal(row[0],String(i+1));
  assert.equal(row[1],'6.0');
  assert.equal(row[2],masses[i].toFixed(2));
 }
 assert.match(sample.provenance,/random\.Random\(1842\)/);
 assert.match(sample.provenance,/gauss\(18\.16, 0\.20\)/);
 assert.match(sample.provenance,/first generated sequence was frozen in its original order without exclusions/i);
 assert.match(sample.introduction,/before analysing the cases/);
 assert.match(sample.introduction,/95/);
 assert.equal(sample.planning.dataSource,'secondary');
 assert.equal(sample.sources[0].fields.actualSourceType,'secondary');
 assert.match(sample.sources[0].fields.actualSource,/constructed/);
});

test('ordered-block evidence is correctly calculated and does not disappear in the pooled summaries',()=>{
 const expectedMeans=[18.305,18.224,18.136,18.040,18.156,18.173];
 const expectedCounts=[5,6,7,9,9,9];
 for(const [i,block] of blocks.entries()){
  const values=cents.slice(i*10,i*10+10),sum=values.reduce((a,b)=>a+b,0);
  const squareSum=values.reduce((a,b)=>a+b*b,0);
  near(block.mean,sum/1000,1e-12);
  near(block.mean,expectedMeans[i],1e-12);
  near(block.sampleSD,Math.sqrt((squareSum-sum*sum/10)/90000),1e-10);
  assert.equal(block.within,integerBandCount(values));
  assert.equal(block.within,expectedCounts[i]);
  assert.equal(block.first,10*i+1);assert.equal(block.last,10*i+10);
 }
 near(blocks[0].mean-blocks[3].mean,0.265,1e-12);
 // These safeguards concern the inference, not a preferred phrase for drift.
 assert.match(sample.stages[0].limitations,/does not make this pattern evidence of warming up or grinder drift/);
 assert.match(sample.stages[0].limitations,/would not establish independence/);
 assert.match(sample.stages[0].interpretation,/conditional/);
});

test('centre, quartiles, spread and the target-error decomposition have independent arithmetic checks',()=>{
 near(calculation.mean,independentMean,1e-12);
 near(calculation.sampleSD,independentSD,1e-10);
 near(calculation.mean,18.172333333333334,1e-12);
 near(calculation.sampleSD,0.19636844189367952,1e-12);
 const sorted=[...cents].sort((a,b)=>a-b);
 near(calculation.median,(sorted[29]+sorted[30])/200);
 near(calculation.q1,(sorted[14]+sorted[15])/200);
 near(calculation.q3,(sorted[44]+sorted[45])/200);
 near(calculation.q1,18.03);near(calculation.q3,18.295);
 const iqr=calculation.q3-calculation.q1;
 const lowFence=calculation.q1-1.5*iqr,highFence=calculation.q3+1.5*iqr;
 near(lowFence,17.6325);near(highFence,18.6925);
 assert(masses.every(mass=>mass>=lowFence&&mass<=highFence));
 near(calculation.min,17.76);near(calculation.max,18.67);

 const meanSquaredError=cents.reduce((sum,value)=>sum+(value-1800)**2,0)/(60*10000);
 const meanCentredVariance=(totalSquares-total*total/60)/(60*10000);
 near(calculation.meanSquaredTargetError,meanSquaredError,1e-12);
 near(calculation.descriptiveVariance,meanCentredVariance,1e-10);
 near(calculation.centredSum,meanCentredVariance*60,1e-8);
 near(meanSquaredError,meanCentredVariance+(independentMean-18)**2,1e-10);
 near(calculation.rootMeanSquaredTargetError,Math.sqrt(meanSquaredError),1e-12);
 near(calculation.bias,independentMean-18,1e-12);
 near(calculation.descriptiveVariance,calculation.sampleSD**2*59/60,1e-12);
 assert(calculation.sampleSD**2>calculation.descriptiveVariance);
 near(100*calculation.bias**2/meanSquaredError,43.9222742586,1e-7);
});

test('the 45/60 tolerance result and conditional normal comparison describe different quantities accurately',()=>{
 const observed={below:cents.filter(value=>value<1770).length,
  within:integerBandCount(cents),above:cents.filter(value=>value>1830).length};
 assert.deepEqual(observed,{below:0,within:45,above:15});
 for(const key of ['below','within','above'])assert.equal(calculation[key],observed[key]);
 assert.equal(observed.within/60,0.75);
 assert(observed.within<Math.ceil(0.95*60));

 // A half-display-increment perturbation cannot change any original class.
 const classify=value=>value<1770?'below':value>1830?'above':'within';
 for(const value of cents){
  assert.equal(classify(value-0.5),classify(value));
  assert.equal(classify(value+0.5),classify(value));
 }
 const area=integratedCoverage(independentMean,independentSD);
 near(grinderNormalCoverage(independentMean,independentSD),area,1e-8);
 near(calculation.fittedFraction,area,1e-8);
 near(calculation.fittedFraction,0.7341199295627079,1e-11);
 const lowerTail=integratedCoverage(independentMean,independentSD,15,17.7);
 const upperTail=integratedCoverage(independentMean,independentSD,18.3,21);
 near(lowerTail,0.008078660355903933,2e-9);
 near(upperTail,0.2578014100813881,2e-9);
 near(area+lowerTail+upperTail,1,3e-9);
 near(grinderNormalCDF(0),0.5,1e-14);
 for(const z of [0.5,1,1.959963984540054,2.4])near(grinderNormalCDF(z)+grinderNormalCDF(-z),1,1e-13);
 assert.match(sample.stages[2].interpretation,/not two independent confirmations/);
 assert.match(sample.stages[2].limitations,/not a confidence interval/);
 assert.match(sample.stages[2].limitations,/cannot invoke the central limit theorem/);
});

test('the translation analysis checks exact centering and every possible finite-case coverage window',()=>{
 // Integer hundredths and the rational mean avoid relying on the author's
 // floating-point transformation when counting the centred finite cases.
 const centredCents=cents.map(value=>value-total/60+1800);
 assert.equal(integerBandCount(centredCents),51);
 assert.equal(calculation.centredWithin,51);
 near(calculation.centreShift,18-independentMean,1e-12);
 const centredScenario=scenarios.find(row=>row.name==='Centre only');
 near(centredScenario.transformed.reduce((a,b)=>a+b,0)/60,18,1e-12);
 for(const [i,value] of centredScenario.transformed.entries())near(value-18,masses[i]-independentMean,1e-12);

 const ordered=[...cents].sort((a,b)=>a-b);
 // An interval's maximum occupancy occurs when one of its endpoints touches
 // a data value. This independent enumeration checks all finite candidates.
 const shifts=[...new Set(ordered.flatMap(value=>[1770-value,1830-value]))];
 const maximum=Math.max(...shifts.map(shift=>integerBandCount(cents.map(value=>value+shift))));
 assert.equal(maximum,53);
 assert.equal(integerBandCount(cents.map(value=>value-20)),53);
 const bestCountWindow=cents.filter(value=>value>=1790&&value<=1850);
 assert.equal(bestCountWindow.length,53);
 assert(bestCountWindow.includes(1790)&&bestCountWindow.includes(1850));

 for(const check of windowChecks){
  const spans=Array.from({length:61-check.count},(_,index)=>ordered[index+check.count-1]-ordered[index]);
  near(check.shortest.span,Math.min(...spans)/100,1e-12);
  assert.equal(check.windows.length,spans.length);
  for(const [i,window] of check.windows.entries()){
   near(window.span,spans[i]/100,1e-12);
   assert.equal(window.firstRank,i+1);assert.equal(window.lastRank,i+check.count);
  }
 }
 near(windowChecks.find(row=>row.count===53).shortest.span,0.60);
 near(windowChecks.find(row=>row.count===54).shortest.span,0.61);
 near(windowChecks.find(row=>row.count===57).shortest.span,0.69);
 assert.equal(Math.ceil(conditions.requiredFraction*masses.length),57);
 assert(windowChecks.find(row=>row.count===57).shortest.span>conditions.upper-conditions.lower);
 near(calculation.centredFraction,integratedCoverage(18,independentSD),1e-8);
 near(calculation.centredFraction,0.8734229923310881,1e-11);
 assert(calculation.centredFraction<0.95);
 for(const offset of [0.01,0.05,0.1,0.2,0.3]){
  const left=integratedCoverage(18-offset,independentSD),right=integratedCoverage(18+offset,independentSD);
  near(left,right,1e-11);
  assert(right<calculation.centredFraction);
 }
});

test('centering and spread sensitivity meet 95 percent only under the stated joint conditions',()=>{
 const standard975=1.959963984540054;
 near(calculation.z975,standard975,1e-11);
 near(calculation.maximumCentredSD,0.30/standard975,1e-11);
 near(integratedCoverage(18,calculation.maximumCentredSD),0.95,2e-9);
 assert(integratedCoverage(18,0.1530)>0.95);
 assert(integratedCoverage(18,0.1532)<0.95);
 near(calculation.requiredSDReduction,1-calculation.maximumCentredSD/independentSD,1e-10);
 near(100*calculation.requiredSDReduction,22.0526294341,1e-7);

 const expectedCounts=[45,51,50,58,56];
 for(const [i,scenario] of scenarios.entries()){
  near(scenario.normalFraction,integratedCoverage(scenario.mean,scenario.sd),1e-8);
  const average=scenario.transformed.reduce((a,b)=>a+b,0)/60;
  const variance=scenario.transformed.reduce((sum,value)=>sum+(value-average)**2,0)/59;
  near(average,scenario.mean,1e-12);near(Math.sqrt(variance),scenario.sd,1e-12);
  assert.equal(scenario.transformedWithin,expectedCounts[i]);
 }
 const get=name=>scenarios.find(row=>row.name===name);
 assert(get('Spread only').normalFraction<0.81);
 assert(get('Centre only').normalFraction<0.88);
 near(get('Centre and spread').normalFraction,0.9544997361036416,1e-11);
 near(get('Residual offset').normalFraction,0.9423943190852234,1e-10);
 assert(get('Centre and spread').normalFraction>=0.95);
 assert(get('Residual offset').normalFraction<0.95);
 assert(integratedCoverage(18.0305,0.15)>0.95);
 assert(integratedCoverage(18.0306,0.15)<0.95);
 near(calculation.residualBiasBound,0.03056809191057219,1e-10);
 near(integratedCoverage(18+calculation.residualBiasBound,0.15),0.95,2e-9);
 assert.match(sample.stages[4].limitations,/cannot convert the mass offset/);
 assert.match(sample.stages[4].limitations,/not a confidence level/);
 assert.match(sample.completion.modelAssumptions,/not new observations/);
});

test('all editable native figures survive normalization and retain their mathematical inputs',()=>{
 for(const figure of sample.figures){
  assert(figure.stage>=0&&figure.stage<sample.stages.length);
  const draft=figure.tool==='graph'?normalizeGraphDraft(figure.draft):
   figure.tool==='stat'?normalizeStatDraft(figure.draft):normalizeTableDraft(figure.draft);
  const analysis=figure.tool==='graph'?analyseGraph(draft):
   figure.tool==='stat'?statAnalysis(draft):analyzeTable(draft);
  assert.equal(analysis.ready,true,figure.id+': '+JSON.stringify(analysis.issues||analysis.problems));
  // Normalization must not silently truncate authored labels or source notes.
  for(const key of ['title','caption','sourceText','note'])if(typeof figure.draft[key]==='string')
   assert.equal(draft[key],figure.draft[key],figure.id+': '+key);
 }
 const order=sample.figures.find(figure=>figure.id==='figure-grinder-order').draft;
 assert.equal(order.kind,'time');assert.equal(order.xSymbol,'i');assert.equal(order.ySymbol,'m');
 assert.equal(order.yMin,'17.7');assert.equal(order.models[0].expression,'18.3');
 assert.deepEqual(order.matrix,masses.map((mass,index)=>[String(index+1),mass.toFixed(2)]));
 const histogram=statAnalysis(sample.figures.find(figure=>figure.tool==='stat').draft).result;
 assert.equal(histogram.total,60);
 assert.deepEqual(histogram.bins.map(bin=>bin.frequency),[1,3,9,7,15,10,8,3,3,1]);
 for(const bin of histogram.bins){
  near(bin.high-bin.low,0.1,1e-12);
  near(bin.density*(bin.high-bin.low),bin.frequency,1e-12);
 }
 const probability=sample.figures.find(figure=>figure.id==='figure-grinder-mean-sensitivity').draft;
 assert.equal(probability.sourceKind,'theoretical');
 assert.equal(probability.models[0].expression,'95');
 assert.match(probability.caption,/not measured doses/);
 for(const [mean,percent] of probability.matrix)near(Number(percent),100*integratedCoverage(Number(mean),independentSD),0.000001);
 const best=probability.matrix.reduce((a,b)=>Number(a[1])>Number(b[1])?a:b);
 assert.equal(Number(best[0]),18);assert(Number(best[1])<95);
 const scenarioTable=sample.figures.find(figure=>figure.id==='table-grinder-scenarios').draft;
 for(const [i,row] of scenarioTable.matrix.entries()){
  assert.equal(row[0],scenarios[i].name);
  near(Number(row[1]),scenarios[i].mean,0.0005);
  near(Number(row[2]),scenarios[i].sd,0.0005);
  near(Number(row[3]),100*scenarios[i].normalFraction,0.005);
 }
});

test('all authored fields are current, outcome links are valid and external review remains unclaimed',()=>{
 const byPath=new Map(SAMPLE_FIELD_CONTRACT.map(field=>[field.path,field]));
 for(const [area,defaults] of [['planning',PLANNING_FIELD_DEFAULTS],['completion',C_FIELD_DEFAULTS]])
  for(const key of Object.keys(sample[area])){
   assert(Object.hasOwn(defaults,key),area+'.'+key);
   const contract=byPath.get(area+'.fields.'+key);
   assert(contract,area+'.'+key+' has no field contract');
   assert.notEqual(contract.category,'legacy',area+'.'+key+' is compatibility-only');
  }
 for(const source of sample.sources){
  assert.deepEqual(Object.keys(source.fields),SOURCE_FIELDS);
  for(const key of SOURCE_FIELDS)assert.equal(source.fields[key],sample.completion[key]||'',key+' source/editor mirror');
 }
 assert.equal(sample.completion.sampleOrCensus,'');
 const state=createProjectState();state.planning.routeExplorer.selectedRoute=sample.routeId;
 state.planning.fields.kind='statistics';state.planning.fields.statisticsContext='One numerical variable';
 for(const [i,stage] of sample.stages.entries()){
  assert(['scatter','model','theory','other'].includes(stage.kind));
  assert(METHOD_OPTIONS.some(([id])=>id===stage.methodId));
  const choices=journeyOutcomeOptions(state,{...stage,phase:i?'substantial':'first'});
  assert(choices.some(choice=>choice.id===stage.outcomeId),stage.key+': '+stage.outcomeId);
  assert(stage.result.trim().length>100);assert(stage.interpretation.trim().length>100);
 }
 assert.equal(sample.technologyStage,4);
 assert.equal(sample.completion.permissionStatus,'not-needed');
 assert.equal(sample.reviews.find(review=>review.id==='D07').status,'checked');
 assert.match(sample.reviews.find(review=>review.id==='D07').note,/every PDF and Word page/);
 assert(!sample.reviews.some(review=>['D08','D10','D12','D13','D14','D15','D18','D21'].includes(review.id)));
 assert(!Object.hasOwn(sample.completion,'writtenFeedback'));
 assert(!Object.hasOwn(sample.completion,'finalRequirements'));
 assert.equal(sample.references.filter(reference=>reference.value.includes('https://www.itl.nist.gov/')).length,2);
});

test('every authored mathematical expression typesets and retains its full source',()=>{
 const strings=[sample.introduction,sample.dataNotes,...Object.values(sample.planning),...Object.values(sample.completion),
  ...sample.stages.flatMap(stage=>Object.values(stage)),...Object.values(sample.conclusion)];
 const seen=new Set();
 for(const text of strings){
  if(typeof text!=='string')continue;
  const tokens=mixedMathTokens(text);
  assert.equal(tokens.map(token=>token.type==='math'?token.source:token.value).join(''),text);
  for(const token of tokens){
   if(token.type!=='math'||seen.has(token.value))continue;
   seen.add(token.value);
   assert(token.value.length<=550);
   assert.doesNotThrow(()=>mathSvg(token.value,{display:token.display}),token.value);
  }
 }
 assert(seen.size>80);
 // The physical claims stay bounded even though the synthetic recipe is known.
 assert.match(sample.conclusion.conclusionBenefit,/not the future reliability of a real machine/);
 assert.match(sample.dataNotes,/not evidence that a real grinder has a normal output/);
});
