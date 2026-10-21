import test from "node:test";
import assert from "node:assert/strict";
import {formatDiagramShorthand,svgDiagramText,diagramHtmlMath,diagramNotationControls} from "../src/diagrams/diagram-notation.js";
import {newGraphDraft,renderGraphSvg,splitHeading} from "../src/diagrams/graph-core.js";
import {newTableDraft,importTableData} from "../src/diagrams/table-studio-core.js";
import {renderTableSvg,tableToHtml} from "../src/diagrams/table-studio-render.js";

const esc=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
test("shared notation tools are available for both graph and table label editors",()=>{
 const graph=diagramNotationControls(esc,{studio:"graph",key:"yUnit"});
 const table=diagramNotationControls(esc,{studio:"table",index:1,part:"heading"});
 assert.match(graph,/data-action="diagram-notation-insert"/);
 assert.match(graph,/data-notation-key="yUnit"/);
 assert.match(table,/data-action="table-symbol"/);
 assert.match(table,/data-notation-part="heading"/);
});
test("math notation handles superscripts and escaped student text",()=>{
 assert.equal(formatDiagramShorthand("m s^-2"),"m s⁻²");
 assert.equal(formatDiagramShorthand("x_i, \\theta"),"xᵢ, θ");
 const formula=svgDiagramText("Speed \\(\\frac{dy}{dx}\\)",100,50,'font-size="17" text-anchor="middle"');
 assert.match(formula,/<path/);
 assert.match(formula,/diagram-math-typeset/);
 assert(!formula.includes("<script>"));
 assert.match(diagramHtmlMath("Rate \\(\\alpha\\)"),/diagram-inline-math/);
 assert.match(diagramHtmlMath('<img src=x>'),/&lt;img src=x&gt;/);
});
test("graph axis label and dimensioned unit retain inline mathematical SVG after export",()=>{
 const d={...newGraphDraft(),kind:"function",title:"A function",expression:"x^2",
   xLabel:"Time",yLabel:"Rate \\(\\frac{dy}{dx}\\)",xUnitMode:"unit",
   xUnit:"s",yUnitMode:"unit",yUnit:"m s^-2",sourceKind:"theoretical"};
 const svg=renderGraphSvg(d);
 assert(svg.includes("diagram-math-typeset"));
 assert(svg.includes("<path"));
 assert(svg.includes("m s⁻²"));
});
test("table headings and notes typeset maths while preserving original source values",()=>{
 const d=newTableDraft();
 importTableData(d,"Trial\tLength (m)\nA\t10\nB\t12");
 d.title="Comparing \\(\\bar{x}\\)";d.sourceKind="primary";
 d.headings[1]="Observed \\(\\hat{y}\\)";
 d.unitDecisions[1]={mode:"unit",unit:"m s^-2"};
 const svg=renderTableSvg(d),html=tableToHtml(d);
 assert(svg.includes("diagram-math-typeset"));
 assert(html.includes("diagram-inline-math"));
 assert.equal(d.matrix[0][1],"10");
});
test("function headers are not confused with units",()=>{
 assert.deepEqual(splitHeading("f(x)"),{label:"f(x)",unit:""});
 assert.deepEqual(splitHeading("Time (s)"),{label:"Time",unit:"s"});
});
