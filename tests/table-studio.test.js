import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {escapeHtml,icon} from "../src/ui/primitives.js";
import {
 newTableDraft,newTableStudio,importTableData,normalizeTableDraft,analyzeTable,saveTableFigure,
 tableHeader
} from "../src/diagrams/table-studio-core.js";
import {renderTableSvg,tableWidths,tableToHtml,tableToTsv} from "../src/diagrams/table-studio-render.js";
import {tableCSV} from "../src/diagrams/table-studio-export.js";
import {renderTableStudio} from "../src/diagrams/table-studio-view.js";
import {
 setTableField,setTableColumn,chooseTableMode,toggleTableVariable,toggleTableMeasure,
 saveAndLinkTable,saveTableDraft,loadTable,freshTable
} from "../src/diagrams/table-studio-actions.js";
const source="Trial\tLength (cm)\tTime (s)\nA\t14.0\t2.3\nB\t15.6\t2.5\nC\t17.2\t2.8";
function compact(){
 const s=newTableStudio();s.draft.title="Three relevant measured trials";
 s.draft.sourceKind="primary";s.draft.purpose="Compare length and time in the selected trials";
 importTableData(s,source);
 return s;
}
function summary(){
 const s=newTableStudio();chooseTableMode(s,"summary");
 s.draft.title="Descriptive measurements of two groups";
 s.draft.sourceKind="primary";s.draft.purpose="Compare the numerical groups";
 importTableData(s,"Group A (cm)\tGroup B (cm)\n1\t2\n3\t4\n5\t6\n7\t8\n9\t10");
 return s;
}
function frequency(){
 const s=newTableStudio();chooseTableMode(s,"frequency");
 s.draft.title="Frequency of school travel preferences";
 s.draft.sourceKind="primary";s.draft.purpose="Understand common travel responses";
 s.draft.headers="yes";
 importTableData(s,"Preference\nWalk\nBus\nBus\nCar\nWalk\nBus");
 return s;
}
test("paste Google Sheets TSV with headings and detect units without extra-wide cells",()=>{
 const s=compact();
 const q=analyzeTable(s.draft);
 assert.equal(q.ready,true,JSON.stringify(q.problems));
 assert.deepEqual(q.model.headers,["Trial","Length (cm)","Time (s)"]);
 assert.equal(q.model.rows.length,3);
 assert.equal(q.model.rows[0][1],"14.0");
 assert.deepEqual(q.model.numeric,[false,true,true]);
 assert.equal(tableWidths(q.model).length,3);
 assert.ok(Math.abs(tableWidths(q.model).reduce((a,b)=>a+b,0)-802)<0.05);
});
test("long raw tables cannot be shrunk, truncated, or exported even if an appendix is proposed",()=>{
 const s=compact();
 s.draft.raw="Test (cm)\n"+Array.from({length:18},(_,i)=>String(i)).join("\n");
 importTableData(s,s.draft.raw);
 const q=analyzeTable(s.draft);
 assert.equal(q.ready,false);
 assert.equal(q.model,null);
 assert.ok(q.problems.some(p=>p.code==="raw-table-too-long"));
 assert.throws(()=>tableToHtml(s.draft),/quality checks/i);
 assert.equal(saveTableFigure(s).ok,false);
});
test("compact table limits five columns and requires units or an explicit dimensionless decision",()=>{
 const s=compact();
 s.draft.unitDecisions[1].mode="unsure";
 assert.ok(analyzeTable(s.draft).problems.some(p=>p.code==="units"));
 s.draft.unitDecisions[1].mode="dimensionless";
 assert.equal(analyzeTable(s.draft).ready,true);
 s.draft.matrix[1][1]="not recorded";
 assert.ok(analyzeTable(s.draft).problems.some(p=>p.code==="mixed-column"));
});
test("formatting wraps headings, aligns numeric values and escapes student text",()=>{
 const s=compact(),q=analyzeTable(s.draft),svg=renderTableSvg(s.draft);
 assert.match(svg,/Table 1\./);
 assert.match(svg,/Length \(cm\)/);
 assert.match(svg,/text-anchor="end"/);
 assert.match(svg,/<tspan/);
 const html=tableToHtml(s.draft);
 assert.match(html,/<table/);
 assert.match(html,/table-layout:fixed/);
 assert.match(html,/width:650px/);
 assert.match(html,/text-align:right/);
 s.draft.title="<script>alert(1)</script>";
 const unsafe=renderTableSvg(s.draft);
 assert.ok(!unsafe.includes("<script>"));
 assert.ok(unsafe.includes("&lt;script&gt;"));
});
test("summary table uses original unrounded numbers for n, mean, median and sample SD",()=>{
 const s=summary();
 const q=analyzeTable(s.draft);
 assert.equal(q.ready,true,JSON.stringify(q.problems));
 assert.equal(q.model.rows.length,2);
 assert.deepEqual(q.model.headers,["Variable / group","n","Mean (cm)","Median (cm)"]);
 assert.deepEqual(q.model.rows[0],["Group A","5","5.00","5.00"]);
 s.draft.measures=["sd","minmax","iqr"];
 const next=analyzeTable(s.draft);
 assert.equal(next.ready,true,JSON.stringify(next.problems));
 assert.equal(next.model.rows[0][2],"3.16");
 assert.equal(next.model.rows[0][3],"1.00–9.00");
 assert.equal(next.model.rows[0][4],"6.00");
 assert.match(next.model.metadata,/n − 1/);
});
test("selected summary columns must share units and missing values are transparent in n",()=>{
 const s=summary();
 s.draft.unitDecisions[1].unit="seconds";
 assert.ok(analyzeTable(s.draft).problems.some(p=>p.code==="incompatible-units"));
 s.draft.unitDecisions[1].unit="cm";
 s.draft.matrix[2][1]="";
 const check=analyzeTable(s.draft);
 assert.equal(check.ready,true);
 assert.ok(check.warnings.some(p=>p.code==="missing-observations"));
 assert.equal(check.model.rows[1][1],"4");
 s.draft.matrix[2][1]="bad measurement";
 assert.ok(analyzeTable(s.draft).problems.some(p=>p.code==="invalid-numeric"));
});
test("frequency table counts all actual data and shows the correct percentage denominator",()=>{
 const s=frequency(),q=analyzeTable(s.draft);
 assert.equal(q.ready,true,JSON.stringify(q.problems));
 assert.deepEqual(q.model.headers,["Preference","Frequency (count)","Percentage (%)"]);
 assert.deepEqual(q.model.rows,[
  ["Walk","2","33.33"],["Bus","3","50.00"],["Car","1","16.67"],["Total","6","100"]
 ]);
 assert.match(q.model.metadata,/6 non-missing responses/);
 const copy=tableToTsv(s.draft);
 assert.match(copy,/Walk\t2\t33.33/);
});
test("frequency grouping never hides categories or missing responses",()=>{
 const s=frequency();
 s.draft.matrix.push([""]);
 assert.ok(analyzeTable(s.draft).problems.some(p=>p.code==="missing-category"));
 s.draft.matrix.pop();
 s.draft.matrix=Array.from({length:10},(_,i)=>["Category "+i]);
 const q=analyzeTable(s.draft);
 assert.ok(q.problems.some(p=>p.code==="too-many-categories"));
 assert.equal(q.model,null);
});
test("source provenance, title, table numbering and sheet re-import are required",()=>{
 const s=compact();
 s.draft.title="";
 assert.ok(analyzeTable(s.draft).problems.some(p=>p.code==="title"));
 s.draft.title="A sensible compact table";
 s.draft.number="0";
 assert.ok(analyzeTable(s.draft).problems.some(p=>p.code==="number"));
 s.draft.number="2";
 s.draft.sourceKind="secondary";s.draft.sourceText="";
 assert.ok(analyzeTable(s.draft).problems.some(p=>p.code==="credit"));
 s.draft.sourceText="Publisher, collection and date";
 assert.equal(analyzeTable(s.draft).ready,true);
 setTableField(s,"raw",source.replace("15.6","99"));
 assert.ok(analyzeTable(s.draft).problems.some(p=>p.code==="unparsed"));
});
test("fixed decimal places affect display, not the stored source values",()=>{
 const s=compact();
 s.draft.numberFormat="fixed";s.draft.decimals="1";
 const q=analyzeTable(s.draft);
 assert.equal(q.model.rows[0][1],"14.0");
 assert.equal(q.model.rows[1][1],"15.6");
 assert.equal(q.draft.matrix[1][1],"15.6");
});
test("CSV and HTML escape dangerous headings without deleting negative numerical values",()=>{
 const s=compact();
 setTableColumn(s,0,"heading","=HYPERLINK(\"bad\")");
 let q=analyzeTable(s.draft);
 assert.equal(q.ready,true);
 assert.ok(tableCSV(s.draft).startsWith('"\'=HYPERLINK'));
 assert.ok(tableToHtml(s.draft).includes("HYPERLINK"));
 s.draft.matrix[0][1]="-14.5";
 assert.ok(tableCSV(s.draft).includes('"-14.5"'));
});
test("a linked table never claims mathematics was performed; save and restore preserve full original data",()=>{
 const state=createProjectState();
 state.completion.current="C31";state.route="completing";state.tableStudio=compact();
 const result=saveAndLinkTable(state);
 assert.equal(result.ok,true);
 assert.equal(state.entries[0].status,"planned");
 assert.equal(state.entries[0].result,"");
 assert.equal(state.entries[0].tableFigureId,result.record.id);
 const recovered=normalizeProjectState(JSON.parse(JSON.stringify(state)));
 assert.equal(recovered.tableStudio.figures.length,1);
 assert.equal(recovered.tableStudio.figures[0].draft.matrix.length,3);
 assert.equal(loadTable(recovered.tableStudio,result.record.id),true);
 freshTable(recovered.tableStudio);
 assert.equal(recovered.tableStudio.figures.length,1);
});
test("changed saved values reopen review of prior completed interpretations, preserving the writing",()=>{
 const state=createProjectState();state.tableStudio=summary();
 assert.equal(saveAndLinkTable(state).ok,true);
 state.entries[0].status="completed";state.entries[0].result="The medians were similar.";
 setTableField(state.tableStudio,"decimals","3");
 const changed=saveTableDraft(state);
 // More displayed digits can affect interpretation of claimed accuracy.
 assert.equal(changed.reviewNeeded,true);
 state.tableStudio.draft.matrix[0][1]="200";
 const updated=saveTableDraft(state);
 assert.equal(updated.ok,true);assert.equal(updated.reviewNeeded,true);
 assert.equal(state.entries[0].result,"The medians were similar.");
 assert.equal(state.entries[0].reviewNeeded,"yes");
});
test("saved work cannot be deleted automatically at the 12-table limit",()=>{
 const s=compact();s.figures=Array.from({length:12},(_,i)=>({
  id:"table-"+i,entryId:"",savedAt:"",draft:normalizeTableDraft(s.draft)
 }));
 const ids=s.figures.map(x=>x.id);
 assert.equal(saveTableFigure(s).ok,false);
 assert.deepEqual(s.figures.map(x=>x.id),ids);
});
test("the student interface exposes modes, numerical units, purpose, quality and export controls",()=>{
 const state=createProjectState();state.tableStudio=compact();
 const html=renderTableStudio(state,icon,escapeHtml);
 for(const marker of ['data-table-studio','data-action="table-mode"',
  'data-table-mode="summary"','data-table-mode="frequency"','data-table-field="raw"',
  'data-table-part="unitMode"','data-action="table-use"','data-action="table-editable"',
  'data-action="table-html"','data-action="table-svg"','data-table-quality']){
  assert.ok(html.includes(marker),marker);
 }
 const empty=renderTableStudio(createProjectState(),icon,escapeHtml);
 assert.ok(empty.includes('data-action="table-use" disabled'));
});
