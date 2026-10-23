import test from "node:test";
import assert from "node:assert/strict";
import {
 REVISION_FORMATS_SPEC as sample,REVISION_YEARS,REVISION_FORMATS,REVISION_COUNTS,
 REVISION_RESPONSES,REVISION_ALPHA,REVISION_ANALYSIS,REVISION_SINGLE_CORRECTIONS,
 REVISION_DIRECTED_CHECKS
} from "../src/core/samples/revision-formats.js";
import {statAnalysis} from "../src/diagrams/stat-studio-core.js";
import {analyzeTable} from "../src/diagrams/table-studio-core.js";
import {mixedMathTokens,mathSvg} from "../src/math/mixed-math.js";
import {createProjectState} from "../src/core/project-state.js";
import {syncPlanningToProject} from "../src/planning/engine.js";
import {journeyOutcomeOptions} from "../src/completing/adaptive-journey.js";
import {SOURCE_FIELDS} from "../src/completing/evidence-links.js";

const close=(actual,expected,tolerance=1e-9)=>assert(Math.abs(actual-expected)<tolerance,
 `${actual} is not within ${tolerance} of ${expected}`);
const sum=values=>values.reduce((a,b)=>a+b,0);
const figure=id=>sample.figures.find(item=>item.id===id);

// Independently aggregate the anonymous records. Tests below start with the
// response units rather than trusting the author's marginal totals.
function countRecords(records){
 const out=Array.from({length:3},()=>[0,0,0]);
 for(const [,year,format] of records){
  const i=REVISION_YEARS.indexOf(year),j=REVISION_FORMATS.indexOf(format);
  assert(i>=0&&j>=0,"Every response must have exactly one valid year and choice.");
  out[i][j]++;
 }
 return out;
}
const counts=countRecords(REVISION_RESPONSES);

// This computes chi-squared through its independent expanded identity
// n*sum(O_ij²/(row_i*column_j))-n, rather than summing the implementation's
// squared residuals. The df=4 tail is checked by numerical integration of
// the density, independently of the author's closed-form survival function.
function independentAnalysis(matrix){
 const rows=matrix.map(sum),columns=matrix[0].map((_,j)=>sum(matrix.map(row=>row[j])));
 const n=sum(rows),expected=rows.map(r=>columns.map(c=>r*c/n));
 let weighted=0;
 matrix.forEach((row,i)=>row.forEach((value,j)=>weighted+=value*value/(rows[i]*columns[j])));
 const statistic=n*weighted-n;
 return {rows,columns,n,expected,statistic,df:(rows.length-1)*(columns.length-1)};
}
function tailByQuadrature(x){
 const end=100,steps=20000,h=(end-x)/steps;
 const density=t=>t*Math.exp(-t/2)/4;
 let total=density(x)+density(end);
 for(let k=1;k<steps;k++)total+=(k%2?4:2)*density(x+k*h);
 return total*h/3; // Remaining tail above 100 is less than 1e-20.
}
function alteredCounts(year,from,to,amount=1){
 const changed=counts.map(row=>[...row]);
 changed[year][from]-=amount;changed[year][to]+=amount;
 return changed;
}
const base=independentAnalysis(counts);

test("revision cases reproducibly expand nine fixed counts into 240 exclusive anonymous responses",()=>{
 assert.deepEqual(counts,[[27,18,15],[24,24,32],[19,31,50]]);
 assert.deepEqual(REVISION_COUNTS,counts);
 assert.equal(REVISION_RESPONSES.length,240);
 assert.equal(new Set(REVISION_RESPONSES.map(row=>row[0])).size,240);
 assert(REVISION_RESPONSES.every(row=>row.length===3));
 let index=0;
 for(let i=0;i<3;i++)for(let j=0;j<3;j++)for(let k=0;k<counts[i][j];k++){
  assert.deepEqual(REVISION_RESPONSES[index],["R"+String(index+1).padStart(3,"0"),REVISION_YEARS[i],REVISION_FORMATS[j]]);
  index++;
 }
 assert.deepEqual(base.rows,[60,80,100]);
 assert.deepEqual(base.columns,[70,73,97]);
 assert.equal(base.n,240);
 assert.deepEqual(sample.dataSets[0].rows,REVISION_RESPONSES);
 assert.deepEqual(sample.dataSets[1].rows,[
  ["Year 11",27,18,15,60],["Year 12",24,24,32,80],
  ["Year 13",19,31,50,100],["Total",70,73,97,240]
 ]);
 assert.match(sample.provenance,/deterministic construction is not a random simulation/);
 assert.match(sample.dataNotes,/one option only/);
 assert.match(sample.completion.dataCleaning,/none are missing, excluded or combined/);
});

test("the editable 100% chart uses within-year denominators and the count table preserves all margins",()=>{
 const bar=figure("stat-revision-percentages");
 const analysis=statAnalysis(bar.draft);
 assert.equal(analysis.ready,true,JSON.stringify(analysis.problems));
 assert.equal(bar.draft.barStyle,"stacked100");
 assert.equal(bar.draft.categoryIndex,0);
 assert.deepEqual(bar.draft.selected,[1,2,3]);
 assert(bar.draft.caption.length<=135,"The printed stat footer must retain the full denominator caption.");
 assert.equal(analysis.result.denominator,"category");
 assert.deepEqual(analysis.result.names,REVISION_FORMATS);
 assert.deepEqual(analysis.override,[0,100]);
 const expectedPercentages=[[45,30,25],[30,30,40],[19,31,50]];
 analysis.result.categories.forEach((row,i)=>{
  assert.equal(row.category,REVISION_YEARS[i]);
  assert.equal(row.categoryTotal,base.rows[i]);
  assert.deepEqual(row.counts,counts[i]);
  row.values.forEach((value,j)=>{
   close(value,100*counts[i][j]/base.rows[i]);
   close(value,expectedPercentages[i][j]);
  });
  close(sum(row.values),100);
 });
 assert.deepEqual(figure("table-revision-observed").draft.matrix,
  sample.dataSets[1].rows.map(row=>row.map(String)));
 close(100*(counts[0][0]/base.rows[0]-counts[2][0]/base.rows[2]),26);
 close(100*(counts[2][2]/base.rows[2]-counts[0][2]/base.rows[0]),25);
 close(100*(counts[2][1]/base.rows[2]-counts[0][1]/base.rows[0]),1);
});

test("the independence expectations preserve margins and satisfy the prespecified count condition",()=>{
 const expected=base.expected;
 close(expected[0][0],17.5);
 close(expected[2][2],485/12);
 close(Math.min(...expected.flat()),17.5);
 assert(expected.flat().every(value=>value>=5));
 expected.forEach((row,i)=>close(sum(row),base.rows[i]));
 base.columns.forEach((value,j)=>close(sum(expected.map(row=>row[j])),value));
 assert.deepEqual(REVISION_ANALYSIS.rowTotals,base.rows);
 assert.deepEqual(REVISION_ANALYSIS.columnTotals,base.columns);
 const rendered=figure("table-revision-expected").draft.matrix;
 rendered.forEach((row,i)=>{
  assert.equal(row[0],REVISION_YEARS[i]);
  row.slice(1).forEach((value,j)=>{
   assert.equal(value,expected[i][j].toFixed(2));
   close(REVISION_ANALYSIS.expected[i][j],expected[i][j]);
  });
 });
 assert.match(sample.dataNotes,/Before evaluating the test/);
 assert.match(sample.dataNotes,/alpha=0\.05/);
 assert.match(sample.dataNotes,/kept the three categories and all records unchanged/);
 assert.equal(REVISION_ALPHA,0.05);
});

test("independent arithmetic and numerical integration confirm chi-squared, df, p and the conditional decision",()=>{
 assert.equal(base.df,4);
 close(base.statistic,14.543301793531988);
 close(REVISION_ANALYSIS.chi2,base.statistic);
 assert.equal(REVISION_ANALYSIS.df,base.df);
 const probability=tailByQuadrature(base.statistic);
 close(probability,0.005748497383730684,1e-12);
 close(REVISION_ANALYSIS.p,probability,1e-12);
 assert(probability<REVISION_ALPHA);
 close(tailByQuadrature(9.487729036781154),REVISION_ALPHA,1e-11);
 assert(base.statistic>9.487729036781154);
 assert.match(sample.stages[2].result,/14\.54330179/);
 assert.match(sample.stages[2].result,/0\.005748497/);
 assert.match(sample.stages[2].result,/p\\approx P\(X\\ge14\.54330179\)/);
 assert.match(sample.stages[2].result,/nine counts, excluding the total row and column/);
 assert.match(sample.stages[2].interpretation,/conditional on those assumptions/);
 assert.match(sample.stages[2].interpretation,/not the probability that independence is true/);
 assert.match(sample.conclusion.conclusionBenefit,/constructed cases and conditional response model/);
});

test("cell contributions and proportional directions explain the association without separate cell tests",()=>{
 let total=0,cornerTotal=0;
 const displayed=figure("table-revision-contributions").draft.matrix;
 for(let i=0;i<3;i++)for(let j=0;j<3;j++){
  const delta=counts[i][j]-base.expected[i][j];
  const contribution=delta*delta/base.expected[i][j];
  close(REVISION_ANALYSIS.contributions[i][j],contribution);
  assert.equal(displayed[i][j+1],contribution.toFixed(4));
  total+=contribution;
  if(i!==1&&j!==1)cornerTotal+=contribution;
 }
 close(total,base.statistic);
 close(cornerTotal,14.501639666175752);
 close(100*cornerTotal/total,99.71353047645091);
 assert(counts[0][0]>base.expected[0][0]&&counts[0][2]<base.expected[0][2]);
 assert(counts[2][0]<base.expected[2][0]&&counts[2][2]>base.expected[2][2]);
 assert.match(sample.stages[3].result,/99\.71/);
 assert.match(sample.stages[3].result,/not a series of cell-by-cell significance claims/);
});

test("enumerating all 27 year-based rules proves the practical upper bound and modest five-point benefit",()=>{
 const matches=[];
 for(let a=0;a<3;a++)for(let b=0;b<3;b++)for(let c=0;c<3;c++)
  matches.push({rule:[a,b,c],matched:counts[0][a]+counts[1][b]+counts[2][c]});
 const best=Math.max(...matches.map(x=>x.matched));
 assert.equal(best,109);
 assert.deepEqual(matches.filter(x=>x.matched===best).map(x=>x.rule),[[0,2,2]]);
 const common=base.columns.map((matched,format)=>({format,matched})).sort((a,b)=>b.matched-a.matched)[0];
 assert.deepEqual(common,{format:2,matched:97});
 close(100*common.matched/base.n,40.41666666666667);
 close(100*best/base.n,45.41666666666667);
 close(100*(best-common.matched)/base.n,5);
 assert.equal(base.n-best,131);
 assert(best<base.n/2);
 assert.match(sample.stages[3].result,/upper bound for any deterministic one-format-per-year rule/);
 assert.match(sample.stages[3].limitations,/not a validated prediction rate/);
 const percentagePointConversion=String.raw`\((12/240)\times100=5\) percentage points`;
 assert(sample.stages[3].result.includes(percentagePointConversion));
 assert(sample.conclusion.mainConclusion.includes(percentagePointConversion));
 assert(!sample.stages[3].result.includes(String.raw`\(12/240=5\)`));
 assert(!sample.conclusion.mainConclusion.includes(String.raw`\(12/240=5\)`));
 assert.match(sample.conclusion.mainConclusion,/131/);
});

test("all 480 possible one-slot format changes reduce to the 18 exhaustively checked count tables",()=>{
 const actualSignatures=new Map();
 for(const record of REVISION_RESPONSES){
  const year=REVISION_YEARS.indexOf(record[1]),from=REVISION_FORMATS.indexOf(record[2]);
  for(let to=0;to<3;to++)if(from!==to){
   const altered=alteredCounts(year,from,to),signature=JSON.stringify(altered);
   actualSignatures.set(signature,{year,from,to,altered});
  }
 }
 assert.equal(actualSignatures.size,18);
 assert.equal(REVISION_SINGLE_CORRECTIONS.length,18);
 const sourceSignatures=new Set();
 const computed=[];
 REVISION_SINGLE_CORRECTIONS.forEach((record,index)=>{
  const signature=JSON.stringify(record.counts),input=actualSignatures.get(signature);
  assert(input,"The published correction must represent an actual possible one-slot change.");
  assert(!sourceSignatures.has(signature),"Every distinct correction must be represented once.");
  sourceSignatures.add(signature);
  assert.deepEqual([record.year,record.from,record.to,record.count],[input.year,input.from,input.to,1]);
  const result=independentAnalysis(input.altered),p=tailByQuadrature(result.statistic);
  assert.deepEqual(result.rows,base.rows);
  assert.equal(result.n,240);
  assert.equal(result.df,4);
  close(record.chi2,result.statistic);
  close(record.p,p,1e-12);
  assert(p<REVISION_ALPHA);
  assert(Math.min(...result.expected.flat())>17);
  const saved=sample.dataSets[2].rows[index];
  assert.deepEqual(saved.slice(0,3),[REVISION_YEARS[record.year],REVISION_FORMATS[record.from],REVISION_FORMATS[record.to]]);
  close(saved[3],result.statistic);close(saved[4],p,1e-12);
  close(saved[5],Math.min(...result.expected.flat()));
  computed.push({...input,...result,p});
 });
 const least=computed.reduce((a,b)=>a.statistic<b.statistic?a:b);
 const most=computed.reduce((a,b)=>a.statistic>b.statistic?a:b);
 assert.deepEqual([least.year,least.from,least.to],[0,0,2]);
 assert.deepEqual([most.year,most.from,most.to],[0,2,0]);
 close(least.statistic,12.827992042558535);
 close(most.statistic,16.395703903788025);
 close(least.p,0.01214756606415996,1e-12);
 close(most.p,0.002531655155235386,1e-12);
 // These remain hypothetical: neither the raw slots nor primary chart change.
 assert.deepEqual(countRecords(REVISION_RESPONSES),counts);
 assert.deepEqual(figure("stat-revision-percentages").draft.matrix.map(row=>row.slice(1).map(Number)),counts);
});

test("one-slot corrections rebuild the expected counts but cannot give a year-based rule majority coverage",()=>{
 const worked=independentAnalysis(alteredCounts(0,0,2));
 assert.deepEqual(worked.columns,[69,73,98]);
 close(worked.expected[0][0],17.25);
 close((26-worked.expected[0][0])**2/worked.expected[0][0],4.438405797101449);

 // Enumerate every rule independently for every possible reclassification.
 // Moving one response changes a fixed rule's match count by at most one,
 // even if a different rule becomes optimal after the correction.
 const bestCounts=[],gains=[];
 for(let year=0;year<3;year++)for(let from=0;from<3;from++)for(let to=0;to<3;to++){
  if(from===to)continue;
  const changed=alteredCounts(year,from,to),matches=[];
  for(let a=0;a<3;a++)for(let b=0;b<3;b++)for(let c=0;c<3;c++){
   const before=counts[0][a]+counts[1][b]+counts[2][c];
   const after=changed[0][a]+changed[1][b]+changed[2][c];
   assert(Math.abs(after-before)<=1);
   matches.push(after);
  }
  const best=Math.max(...matches);
  const bestCommon=Math.max(...independentAnalysis(changed).columns);
  assert(best<=109+1);
  assert(best<Math.floor(base.n/2)+1,"Strict majority needs at least 121 of 240 matches.");
  bestCounts.push(best);gains.push(best-bestCommon);
 }
 assert.equal(bestCounts.length,18);
 assert.deepEqual([Math.min(...bestCounts),Math.max(...bestCounts)],[108,110]);
 assert.deepEqual([Math.min(...gains),Math.max(...gains)],[10,14]);
});

test("the directed four-record scenario crosses the threshold without proving independence or improving the recommendation",()=>{
 assert.equal(REVISION_DIRECTED_CHECKS.length,4);
 for(const [index,record] of REVISION_DIRECTED_CHECKS.entries()){
  const k=index+1,changed=alteredCounts(0,0,2,k),result=independentAnalysis(changed);
  const p=tailByQuadrature(result.statistic);
  assert.deepEqual(record.counts,changed);
  assert.equal(record.count,k);
  close(record.chi2,result.statistic);close(record.p,p,1e-12);
  assert.equal(p<REVISION_ALPHA,k<=3);
  assert.deepEqual(sample.dataSets[3].rows[index].slice(0,4),[k,...changed[0]]);
  close(sample.dataSets[3].rows[index][4],result.statistic);
  close(sample.dataSets[3].rows[index][5],p,1e-12);
 }
 const four=alteredCounts(0,0,2,4),fourResult=independentAnalysis(four);
 assert.deepEqual(four[0],[23,18,19]);
 assert.deepEqual(fourResult.columns,[66,73,101]);
 close(fourResult.statistic,8.507686933076867);
 close(tailByQuadrature(fourResult.statistic),0.07465456768062208,1e-11);
 const bestByYear=sum(four.map(row=>Math.max(...row))),bestCommon=Math.max(...fourResult.columns);
 assert.equal(bestByYear,105);assert.equal(bestCommon,101);
 close(100*bestByYear/240,43.75);
 assert(bestByYear<120);
 close(100*(four[0][0]/60-four[2][0]/100),19.333333333333332);
 assert.match(sample.stages[4].result,/not proved that four is the minimum/);
 assert.match(sample.stages[4].interpretation,/wrong to describe this scenario as proving independence/);
 const summary=figure("table-revision-sensitivity").draft.matrix;
 assert.deepEqual(summary.map(row=>row[3]),["Reject H0","Reject H0","Reject H0","Reject H0","Do not reject H0"]);
 const rows=[REVISION_ANALYSIS,REVISION_SINGLE_CORRECTIONS.find(x=>x.year===0&&x.from===0&&x.to===2),
  REVISION_SINGLE_CORRECTIONS.find(x=>x.year===0&&x.from===2&&x.to===0),REVISION_DIRECTED_CHECKS[2],REVISION_DIRECTED_CHECKS[3]];
 summary.forEach((row,i)=>{
  assert.equal(row[1],rows[i].chi2.toFixed(4));
  assert.equal(row[2],rows[i].p.toFixed(6));
 });
});

test("all saved mathematical figures and formulae render, with honest source mirrors and supported route choices",()=>{
 let formulaCount=0;
 function visit(value){
  if(typeof value==="string"){
   for(const token of mixedMathTokens(value))if(token.type==="math"){
    const rendered=mathSvg(token.value,{display:token.display});
    assert(rendered.svg.startsWith("<svg"));
    assert(!rendered.svg.includes("data-mjx-error"),token.value);
    formulaCount++;
   }
  }else if(Array.isArray(value))value.forEach(visit);
  else if(value&&typeof value==="object")Object.values(value).forEach(visit);
 }
 visit(sample);
 assert(formulaCount>20,"The actual mathematical working must be typeset.");
 for(const item of sample.figures){
  assert(item.stage>=0&&item.stage<sample.stages.length);
  assert(["purpose","result","interpretation"].includes(item.after));
  const result=item.tool==="stat"?statAnalysis(item.draft):analyzeTable(item.draft);
  assert.equal(result.ready,true,item.id+": "+JSON.stringify(result.problems));
 }
 for(const field of SOURCE_FIELDS)
  assert.equal(sample.sources[0].fields[field],sample.completion[field]||"",field);
 const state=createProjectState();
 for(const key of Object.keys(sample.planning))assert(Object.hasOwn(state.planning.fields,key),key);
 for(const key of Object.keys(sample.completion))assert(Object.hasOwn(state.completion.fields,key),key);
 Object.assign(state.planning.fields,sample.planning);
 state.planning.routeExplorer.selectedRoute=sample.routeId;
 syncPlanningToProject(state);
 for(const [index,stage] of sample.stages.entries()){
  const options=journeyOutcomeOptions(state,{...stage,status:"completed",phase:index?"substantial":"first"});
  assert(options.some(option=>option.id===stage.outcomeId),stage.key);
 }
 assert.equal(sample.course,"AI SL");
 assert.equal(sample.stages[0].kind,"other");
 assert.equal(sample.completion.permissionStatus,"not-needed");
 assert.equal(sample.completion.draftComplete,"ready");
 assert(!sample.reviews.some(item=>["D08","D10","D12","D13","D14","D15","D18","D21"].includes(item.id)));
 assert.equal(sample.completion.writtenFeedback,undefined);
});
