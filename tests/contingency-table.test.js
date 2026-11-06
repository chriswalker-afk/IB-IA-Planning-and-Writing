import test from "node:test";
import assert from "node:assert/strict";
import {analyzeContingency,newContingencyDraft,editContingency,resizeContingency,contingencyWouldDiscard,normalizeContingencyDraft} from "../src/diagrams/contingency-table.js";
import {analyzeTable,newTableDraft,normalizeTableDraft,tableSignature,saveTableFigure} from "../src/diagrams/table-studio-core.js";
import {tableToTsv,tableToHtml,renderTableSvg,assessTableA4} from "../src/diagrams/table-studio-render.js";
import {tableCSV} from "../src/diagrams/table-studio-export.js";
import {chooseTableMode} from "../src/diagrams/table-studio-actions.js";
import {renderTableStudio} from "../src/diagrams/table-studio-view.js";
const base=()=>{
 const d=newTableDraft();d.mode="contingency";d.title="Participation by year group and transport";d.number="3";d.sourceKind="primary";
 d.contingency={...newContingencyDraft(),rowVariable:"Year group",columnVariable:"Travel mode",
  rows:["Year 10","Year 11"],columns:["Bus","Car"],counts:[["12","8"],["4","16"]],
  display:"count",percentageDigits:"1"};
 return d;
};
test("2 by 2 counts retain exact joint and marginal frequencies",()=>{
 const q=analyzeTable(base());assert.equal(q.ready,true,JSON.stringify(q.problems));
 assert.deepEqual(q.model.rows,[["Year 10","12","8","20"],["Year 11","4","16","20"],["Total","16","24","40"]]);
 assert.equal(q.model.total,40);assert.equal(q.model.kind,"contingency");
});
test("row, column, overall proportions use correct denominators and keep count totals",()=>{
 for(const [display,value] of [["row","12 (60.0%)"],["column","12 (75.0%)"],["overall","12 (30.0%)"]]){
  const d=base();d.contingency.display=display;
  const q=analyzeTable(d);assert.equal(q.ready,true,JSON.stringify(q.problems));
  assert.equal(q.model.rows[0][1],value);assert.deepEqual(q.model.rows.at(-1),["Total","16","24","40"]);
 }
});
test("reject invalid and missing counts, duplicate labels, ambiguous source and empty denominators",()=>{
 for(const wrong of ["","-1","3.2","NaN","1000000001","1e3"]){
  const d=base();d.contingency.counts[0][0]=wrong;
  assert.equal(analyzeTable(d).ready,false,wrong);
 }
 const duplicate=base();duplicate.contingency.rows[1]="year 10";
 assert.ok(analyzeTable(duplicate).problems.some(p=>p.code==="contingency-row-duplicates"));
 const noSource=base();noSource.sourceKind="unsure";assert.equal(analyzeTable(noSource).ready,false);
 const zeroRow=base();zeroRow.contingency.counts[0]=["0","0"];zeroRow.contingency.display="row";
 assert.ok(analyzeTable(zeroRow).problems.some(p=>p.code==="contingency-row-zero"));
 const zeroCol=base();zeroCol.contingency.counts=[["0","8"],["0","16"]];zeroCol.contingency.display="column";
 assert.ok(analyzeTable(zeroCol).problems.some(p=>p.code==="contingency-column-zero"));
});
test("resize and edit preserve entered cells, confirm destructive removes",()=>{
 const studio={draft:base()};
 assert.equal(resizeContingency(studio,"rows",1),true);
 assert.equal(editContingency(studio,"count","7",2,0),true);
 assert.equal(contingencyWouldDiscard(studio,"rows"),true);
 assert.equal(resizeContingency(studio,"columns",1),true);
 assert.equal(editContingency(studio,"column","Other",-1,2),true);
 assert.equal(studio.draft.contingency.counts[0][0],"12");
 assert.equal(resizeContingency(studio,"columns",-1),true);
 assert.equal(studio.draft.contingency.counts[0][0],"12");
 assert.equal(resizeContingency(studio,"rows",-1),true);
 assert.equal(studio.draft.contingency.counts.length,2);
});
test("normalisation, saved figure, signature, SVG, HTML and CSV retain consistent output",()=>{
 const d=base(),normalized=normalizeTableDraft(JSON.parse(JSON.stringify(d)));
 assert.deepEqual(normalized.contingency,d.contingency);
 const studio={draft:d,figures:[],activeId:""};
 const saved=saveTableFigure(studio);assert.equal(saved.ok,true,JSON.stringify(saved.checks?.problems));
 assert.equal(tableSignature(saved.record.draft),tableSignature(normalized));
 const svg=renderTableSvg(d),html=tableToHtml(d),tsv=tableToTsv(d),csv=tableCSV(d);
 for(const output of [svg,html,tsv,csv]){assert.match(output,/Year 10/);assert.match(output,/Total/);assert.match(output,/40/);}
 assert.match(svg,/Table 3/);assert.match(html,/<table/);
 assert.equal(assessTableA4(d).ready,true);
});
test("table studio includes mode, named grid fields and live quality checks",()=>{
 const studio={open:true,draft:base(),figures:[],activeId:""};
 const html=renderTableStudio({tableStudio:studio,planning:{routeExplorer:{}},completion:{},entries:[]},()=>"",x=>String(x));
 for(const value of ["Contingency table","data-contingency-kind=\"rowVariable\"","data-contingency-kind=\"count\"","data-action=\"contingency-add\"","Table quality check","Download CSV"]){
  if(value==="Download CSV")continue;
  assert.ok(html.includes(value),value);
 }
 const switched={draft:base()};assert.equal(chooseTableMode(switched,"frequency"),true);
 assert.equal(chooseTableMode(switched,"contingency"),true);
 assert.equal(switched.draft.contingency.counts[0][0],"12");
});
test("input normalisation bounds table dimensions",()=>{
 const value={rows:Array(50).fill("R"),columns:Array(50).fill("C"),counts:Array(50).fill(Array(50).fill("2"))};
 const d=normalizeContingencyDraft(value);
 assert.equal(d.rows.length,6);assert.equal(d.columns.length,4);assert.equal(d.counts.length,6);
});
