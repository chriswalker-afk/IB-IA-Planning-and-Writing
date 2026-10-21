import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState} from "../src/core/project-state.js";
import {escapeHtml,icon} from "../src/ui/primitives.js";
import {newTableStudio,importTableData,analyzeTable,normalizeTableDraft,tableColumnFormat,tableSignature} from "../src/diagrams/table-studio-core.js";
import {setTableColumn,setTableColumnFormat} from "../src/diagrams/table-studio-actions.js";
import {formatTableMath,TABLE_MATH_SYMBOLS} from "../src/diagrams/table-studio-math.js";
import {renderTableSvg,tableToHtml,tableToTsv,assessTableA4} from "../src/diagrams/table-studio-render.js";
import {tableCSV} from "../src/diagrams/table-studio-export.js";
import {renderTableStudio,tableA4PreviewHtml} from "../src/diagrams/table-studio-view.js";
function compact(){
 const s=newTableStudio();s.draft.title="Measurements and change";
 s.draft.sourceKind="primary";s.draft.purpose="Compare genuine values";
 importTableData(s,"Trial\tLength (cm)\tTime (s)\nA\t14.0\t2.30\nB\t15.60\t2.5\nC\t17.2\t2.8");
 return s;
}
function summary(){
 const s=newTableStudio();s.draft.mode="summary";
 s.draft.title="Group statistics";s.draft.sourceKind="primary";s.draft.purpose="Describe groups";
 importTableData(s,"Group A (cm)\tGroup B (cm)\n1\t2\n3\t4\n5\t6\n7\t8");
 return s;
}
test("math shortcuts typeset headings and units but leave source notation in CSV",()=>{
 assert.equal(formatTableMath("x_i and x_{12}, \\bar{x}, \\hat{y}, \\Delta t, \\theta, \\sigma, 2±0.1"),
  "xᵢ and x₁₂, x̄, ŷ, Δ t, θ, σ, 2±0.1");
 assert.equal(formatTableMath("m s^-2"),"m s⁻²");
 assert.equal(formatTableMath("\\unrecognised"),"\\unrecognised");
 assert(TABLE_MATH_SYMBOLS.some(x=>x.token==="x_i")&&TABLE_MATH_SYMBOLS.some(x=>x.token==="\\bar{x}"));
 const s=compact(),i=1;
 assert(setTableColumn(s,i,"heading","Mean \\bar{x} and \\hat{y}_i"));
 assert(setTableColumn(s,i,"unit","m s^-2"));
 const q=analyzeTable(s.draft);
 assert(q.ready,JSON.stringify(q.problems));
 const svg=renderTableSvg(s.draft),html=tableToHtml(s.draft);
 for(const expected of ["x̄","ŷᵢ","m s⁻²"]){
  assert(svg.includes(expected),expected);
  assert(html.includes(expected),expected);
 }
 assert(tableCSV(s.draft).includes("\\bar{x}"));
 assert(tableToTsv(s.draft).includes("m s^-2"));
 assert.equal(s.draft.matrix[0][1],"14.0");
});
test("column decimals and significant figures format independently, preserving original data",()=>{
 const s=compact(),original=JSON.stringify(s.draft.matrix),before=tableSignature(s.draft);
 assert.equal(tableColumnFormat(s.draft,1).mode,"default");
 assert(setTableColumnFormat(s,1,"mode","dp"));
 assert(setTableColumnFormat(s,1,"digits","0"));
 assert(setTableColumnFormat(s,2,"mode","sf"));
 assert(setTableColumnFormat(s,2,"digits","3"));
 const q=analyzeTable(s.draft);
 assert.equal(q.model.rows[0][1],"14");
 assert.equal(q.model.rows[1][1],"16");
 assert.equal(q.model.rows[0][2],"2.30");
 assert.equal(q.model.rows[1][2],"2.50");
 assert(q.warnings.some(w=>w.code==="column-rounding"));
 assert.equal(JSON.stringify(s.draft.matrix),original);
 assert.notEqual(tableSignature(s.draft),before);
 assert(!setTableColumnFormat(s,2,"digits","0"));
 assert(!setTableColumnFormat(s,1,"mode","hidden"));
 assert(!setTableColumnFormat(s,0,"mode","dp"));
 assert(setTableColumnFormat(s,1,"mode","source"));
 assert.equal(analyzeTable(s.draft).model.rows[1][1],"15.60");
 const restored=normalizeTableDraft(JSON.parse(JSON.stringify(s.draft)));
 assert.equal(restored.columnFormats["compact:2"].mode,"sf");
 assert.equal(restored.columnFormats["compact:1"].mode,"source");
 const legacy={...s.draft};delete legacy.columnFormats;
 assert.deepEqual(normalizeTableDraft(legacy).columnFormats,{});
});
test("summary derived statistics have independent precision; n stays an integer",()=>{
 const s=summary();let model=analyzeTable(s.draft).model;
 assert.deepEqual(model.rows[0].slice(0,2),["Group A","4"]);
 assert.equal(model.rows[0][2],"4.00");
 assert(setTableColumnFormat(s,2,"mode","sf"));
 assert(setTableColumnFormat(s,2,"digits","2"));
 assert(setTableColumnFormat(s,3,"mode","dp"));
 assert(setTableColumnFormat(s,3,"digits","3"));
 model=analyzeTable(s.draft).model;
 assert.equal(model.rows[0][2],"4.0");
 assert.equal(model.rows[0][3],"4.000");
 assert.equal(model.rows[0][1],"4");
 assert(!setTableColumnFormat(s,1,"mode","dp"));
 assert(!setTableColumnFormat(s,2,"mode","source"));
 assert.equal(s.draft.matrix[0][0],"1");
});
test("frequency counts stay exact while percentages have optional column formatting",()=>{
 const s=newTableStudio();s.draft.mode="frequency";s.draft.title="Travel modes";s.draft.sourceKind="primary";s.draft.headers="yes";
 importTableData(s,"Transport\nBus\nBus\nWalk\nCycle\nWalk\nWalk");
 let m=analyzeTable(s.draft).model;
 assert.equal(m.rows[0][1],"2");assert.equal(m.rows[0][2],"33.33");
 assert(setTableColumnFormat(s,2,"mode","dp"));
 assert(setTableColumnFormat(s,2,"digits","1"));
 m=analyzeTable(s.draft).model;
 assert.equal(m.rows[0][1],"2");assert.equal(m.rows[0][2],"33.3");
 assert(!setTableColumnFormat(s,1,"mode","sf"));
 assert.equal(s.draft.matrix.length,6);
});
test("A4 checks use SVG geometry, flag crowded tables and do not clip",()=>{
 const s=compact();let fit=assessTableA4(s.draft);
 const svg=renderTableSvg(s.draft);
 assert(fit.ready&&fit.width>0&&fit.height>0);
 assert.match(svg,new RegExp('viewBox="0 0 '+fit.width+' '+Math.round(fit.height)+'"'));
 assert(fit.scale>0&&fit.scale<=1);
 assert(fit.usedWidth<=fit.contentWidth+.01);
 assert(fit.usedHeight<=fit.contentHeight+.01);
 assert(fit.bodyPt>=10,"Simple tables should retain readable body text");
 const page=tableA4PreviewHtml(s,escapeHtml);
 assert(page.includes('data-table-a4'));
 assert(page.includes('ia-table-paper-page'));
 assert(page.includes("20 mm margins"));
 assert(page.includes('ia-table-svg'));
 const dense=newTableStudio();dense.draft.title="Detailed values and comparisons between groups";
 dense.draft.sourceKind="primary";dense.draft.purpose="Compare results across columns";
 importTableData(dense,["Measurement with uncertainty","Predicted test measurement","Observed trial values","Calculated test results","Final comparison"].join("\t")+"\n"+
  Array.from({length:8},(_,i)=>[i+1,i+3,i+5,i+7,i+9].join("\t")).join("\n"));
 fit=assessTableA4(dense.draft);
 assert(fit.ready);
 assert(fit.width>fit.contentWidth);
 assert(fit.scale<1);
 assert(fit.warnings.length>0);
});
test("Pass 1 controls are optional and leave standard table workflow intact",()=>{
 const st=createProjectState();st.tableStudio=compact();
 const html=renderTableStudio(st,icon,escapeHtml);
 assert(html.includes('data-action="table-symbol"'));
 assert(html.includes('data-table-format-part="mode"'));
 assert(html.includes('data-table-format-part="digits"'));
 assert(html.includes('data-table-a4'));
 assert(html.includes('ia-table-paper-page'));
 assert(html.includes('data-action="table-use"'));
});
