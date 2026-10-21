import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {escapeHtml,icon} from "../src/ui/primitives.js";
import {newTableStudio,normalizeTableDraft,analyzeTable,importTableData,
 tableDisplayRows,tableDisplayColumns,saveTableFigure,tableSignature} from "../src/diagrams/table-studio-core.js";
import {setTableField,chooseTableMode,toggleTableDisplayColumn,loadTable,setTableColumnFormat} from "../src/diagrams/table-studio-actions.js";
import {renderTableStudio,tableDataChoices} from "../src/diagrams/table-studio-view.js";
import {renderTableSvg,tableToHtml,tableToTsv} from "../src/diagrams/table-studio-render.js";
import {tableCSV} from "../src/diagrams/table-studio-export.js";
import {applyNativeDataset} from "../src/diagrams/native-data-core.js";

function source(){
 const s=newTableStudio();
 s.draft.headers="yes";
 s.draft.title="Selected real observations";
 s.draft.sourceKind="primary";
 s.draft.purpose="Show a range of observations across several variables";
 const heads=["Trial","Time (s)","Height (cm)","Speed (m/s)","Mass (kg)","Other (cm)"];
 const rows=Array.from({length:14},(_,i)=>["Trial "+(i+1),String(i+1),String((i+1)*2),String((i+1)*3),String(i+9),String(i*5)].join("\t"));
 importTableData(s,heads.join("\t")+"\n"+rows.join("\n"));
 return s;
}
function pairs(){
 const s=newTableStudio();
 s.draft.headers="yes";
 s.draft.sourceKind="primary";s.draft.title="Check my mathematical model";
 s.draft.purpose="Compare observed measurements and predictions";
 importTableData(s,"Time (s)\tDistance (m)\n1\t4.20\n2\t7.10\n3\t9.90\n4\t13.2");
 assert(chooseTableMode(s,"calculated"));
 return s;
}
test("source-row ranges are explicit, validated and never quietly truncated",()=>{
 const s=source(),d=s.draft;
 let q=analyzeTable(d);
 assert.equal(q.ready,false);
 assert(q.problems.some(p=>p.code==="raw-table-too-long"));
 assert(q.problems.some(p=>p.code==="too-wide"));
 assert.equal(q.model,null);
 assert.deepEqual(tableDisplayRows(d).indices,[]);
 assert(setTableField(s,"rowSelection","1, 7, 14"));
 assert.equal(tableDisplayRows(d).indices.join(","),"0,6,13");
 assert.equal(tableDisplayRows(d).indices.length,3);
 for(const raw of ["0,2","1,15","5-2","2,abc","1-9","1,2,3,4,5,6,7,8,9"]){
  const clone=normalizeTableDraft({...d,rowSelection:raw});
  assert.equal(tableDisplayRows(clone).ok,false,"Rejected: "+raw);
 }
 assert.equal(d.matrix.length,14,"Every original source row remains available");
});
test("students must choose and explain columns and rows; displays cite their origin",()=>{
 const s=source(),d=s.draft,sourceBefore=JSON.stringify(d.matrix);
 assert(setTableField(s,"rowSelection","1, 7, 14"));
 assert(setTableField(s,"columnSelectionMode","custom"));
 assert(toggleTableDisplayColumn(s,0,true));
 assert(toggleTableDisplayColumn(s,1,true));
 assert(toggleTableDisplayColumn(s,2,true));
 assert.deepEqual(tableDisplayColumns(d),[0,1,2]);
 assert(!toggleTableDisplayColumn(s,6,true));
 let q=analyzeTable(d);
 assert(q.problems.some(p=>p.code==="selection-reason"));
 assert(setTableField(s,"selectionReason","The first, middle and final trials reveal whether the trend persists across the observed range."));
 q=analyzeTable(d);
 assert.equal(q.ready,true,JSON.stringify(q.problems));
 assert.deepEqual(q.model.rows.map(x=>x[0]),["Trial 1","Trial 7","Trial 14"]);
 assert.equal(q.model.headers.length,3);
 assert.match(q.model.metadata,/Selected source rows 1, 7, 14 of 14/);
 assert.match(q.model.metadata,/3 of 6 source columns/);
 const svg=renderTableSvg(d),html=tableToHtml(d),csv=tableCSV(d);
 assert(svg.includes("Selected source rows"));
 assert(html.includes("Selected source rows"));
 assert(!csv.includes("Trial 8")&&!csv.includes("Trial 12"));
 assert.equal(csv.trim().split(/\r?\n/).length,4);
 assert.equal(JSON.stringify(d.matrix),sourceBefore);
 const saved=saveTableFigure(s);
 assert(saved.ok);
 const record=JSON.parse(JSON.stringify(saved.record));
 assert(loadTable(s,record.id));
 assert.equal(s.draft.rowSelection,"1, 7, 14");
 assert.deepEqual(s.draft.displayColumns,[0,1,2]);
 assert.equal(s.draft.selectionReason,d.selectionReason);
});
test("a compact source with six columns also requires explicit deliberate column selection",()=>{
 const s=source();s.draft.matrix=s.draft.matrix.slice(0,4);s.draft.rowSelection="";
 assert.equal(analyzeTable(s.draft).ready,false);
 assert(analyzeTable(s.draft).problems.some(p=>p.code==="too-wide"));
 assert(setTableField(s,"columnSelectionMode","custom"));
 assert(toggleTableDisplayColumn(s,0,true));
 assert(toggleTableDisplayColumn(s,2,true));
 assert(setTableField(s,"selectionReason","Only trial identifiers and heights are needed to support the argument."));
 assert.equal(analyzeTable(s.draft).ready,true,JSON.stringify(analyzeTable(s.draft).problems));
 assert.deepEqual(analyzeTable(s.draft).model.headers,["Trial","Height (cm)"]);
 assert.equal(analyzeTable(s.draft).model.rows.length,4);
});
test("the calculated mode never guesses missing coefficients or changes source observations",()=>{
 const s=pairs(),d=s.draft,before=JSON.stringify(d.matrix);
 assert.equal(d.calcA,"");assert.equal(d.calcB,"");
 assert(!analyzeTable(d).ready);
 assert(analyzeTable(d).problems.some(p=>p.code==="calculated-coefficients"));
 assert(setTableField(s,"calcA","3"));assert(setTableField(s,"calcB","1"));
 const q=analyzeTable(d);
 assert.equal(q.ready,true,JSON.stringify(q.problems));
 assert.deepEqual(q.model.headers,["Time (s)","Distance (m)","Predicted ŷ (m)","Residual y−ŷ (m)"]);
 assert.deepEqual(q.model.rows[0],["1","4.20","4.00","0.20"]);
 assert.deepEqual(q.model.rows[1],["2","7.10","7.00","0.10"]);
 assert.equal(q.model.rows[2][3],"-0.10");
 assert.match(q.model.metadata,/ŷ = a x \+ b \(a=3, b=1\)/);
 assert.match(q.model.metadata,/unrounded source values/);
 assert.deepEqual(d.matrix,JSON.parse(before));
 assert(renderTableSvg(d).includes("Residual y−ŷ"));
 assert(tableToHtml(d).includes("Predicted ŷ"));
 assert.match(tableCSV(d),/"4.20","4.00","0.20"/);
});
test("quadratic predictions, signed residuals and percentage deviations use full precision",()=>{
 const s=pairs(),d=s.draft;
 assert(setTableField(s,"calcModel","quadratic"));
 assert(setTableField(s,"calcA","0.5"));
 assert(setTableField(s,"calcB","2"));
 assert(setTableField(s,"calcC","1"));
 assert(setTableField(s,"calcShowPercent",true));
 const q=analyzeTable(d);
 assert.equal(q.ready,true,JSON.stringify(q.problems));
 assert.equal(q.model.headers.length,5);
 assert.equal(q.model.rows[0][2],"3.50");
 assert.equal(q.model.rows[0][3],"0.70");
 assert.equal(q.model.rows[0][4],"16.67");
 assert.equal(q.model.rows[1][2],"7.00");
 assert.equal(q.model.rows[1][4],"1.41");
 assert.match(q.model.metadata,/ŷ = a x\^2 \+ b x \+ c/);
 assert.match(q.model.metadata,/100 × residual \/ \|observed\|/);
 assert(setTableColumnFormat(s,3,"mode","sf"));
 assert(setTableColumnFormat(s,3,"digits","3"));
 assert.equal(analyzeTable(d).model.rows[1][3],"0.100");
 assert.equal(d.matrix[1][1],"7.10");
 const snapshot=normalizeTableDraft(JSON.parse(JSON.stringify(d)));
 assert.equal(snapshot.calcModel,"quadratic");assert.equal(snapshot.columnFormats["calculated:3"].mode,"sf");
});
test("percent deviation cannot divide by zero; non-numeric rows and overflow are rejected",()=>{
 const s=pairs(),d=s.draft;
 assert(setTableField(s,"calcA","1"));assert(setTableField(s,"calcB","0"));
 assert(setTableField(s,"calcShowPercent",true));
 d.matrix[0][1]="0";
 assert(analyzeTable(d).problems.some(p=>p.code==="calculated-zero"));
 d.matrix[0][1]="4.20";d.matrix[1][0]="not available";
 assert(analyzeTable(d).problems.some(p=>p.code==="calculated-source"));
 d.matrix[1][0]="2";
 assert(setTableField(s,"calcA","1e308"));assert(setTableField(s,"calcB","0"));
 d.matrix[0][0]="1e308";
 assert(analyzeTable(d).problems.some(p=>p.code==="calculated-overflow"));
});
test("no subset selection carries across a different dataset or hides its anomalies",()=>{
 const s=source();
 setTableField(s,"rowSelection","1,5,14");
 setTableField(s,"columnSelectionMode","custom");
 toggleTableDisplayColumn(s,0,true);toggleTableDisplayColumn(s,1,true);
 setTableField(s,"selectionReason","The chosen trials are a transparent range of the observations.");
 const result=applyNativeDataset(s,"table",{
  columns:["New time (s)","New distance (m)"],matrix:[["1.25","2.60"],["2.50","5.30"]],
  sourceKind:"primary",sourceText:""});
 assert.equal(result.ok,true);
 assert.equal(s.draft.rowSelection,"");
 assert.equal(s.draft.selectionReason,"");
 assert.equal(s.draft.columnSelectionMode,"all");
 assert.deepEqual(s.draft.displayColumns,[]);
 assert.deepEqual(s.draft.matrix,[["1.25","2.60"],["2.50","5.30"]]);
});
test("selection and calculated model controls appear alongside preserved old modes",()=>{
 const s=source(),state=createProjectState();
 state.tableStudio=s;state.tableStudio.open=true;
 let html=renderTableStudio(state,icon,escapeHtml);
 assert(html.includes('data-table-field="rowSelection"'));
 assert(html.includes('data-table-field="columnSelectionMode"'));
 assert(html.includes('data-table-field="selectionReason"'));
 assert(html.includes('data-table-display-column="0"')===false);
 assert(html.includes('data-table-mode="calculated"'));
 setTableField(s,"columnSelectionMode","custom");
 html=renderTableStudio(state,icon,escapeHtml);
 assert(html.includes('data-table-display-column="0"'));
 assert(chooseTableMode(s,"calculated"));
 html=renderTableStudio(state,icon,escapeHtml);
 for(const key of ["calcXIndex","calcYIndex","calcModel","calcA","calcB","calcShowPrediction","calcShowResidual","calcShowPercent"])
  assert(html.includes('data-table-field="'+key+'"'),key);
 assert(html.includes('data-table-mode="summary"')&&html.includes('data-table-mode="frequency"'));
 const round=normalizeProjectState(JSON.parse(JSON.stringify(state)));
 assert.equal(round.tableStudio.draft.mode,"calculated");
});
