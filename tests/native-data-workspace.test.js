import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {renderNativeDataGrid} from "../src/diagrams/native-data-view.js";
import {graphData,analyseGraph} from "../src/diagrams/graph-core.js";
import {statAnalysis} from "../src/diagrams/stat-studio-core.js";
import {analyzeTable} from "../src/diagrams/table-studio-core.js";
import {editNativeHeading,editNativeCell,addNativeRows,removeNativeRow,
 addNativeColumn,removeNativeColumn,parseNativeRange,pasteNativeRange,
 nativeSnapshot,saveNativeDataset,deleteNativeDataset,applyNativeDataset,
 normalizeNativeShelf,nativeGridSummary,NATIVE_MAX_ROWS} from "../src/diagrams/native-data-core.js";
import {handleNativeDataAction,activeNativeType} from "../src/diagrams/native-data-actions.js";
const icon=name=>'<svg data-icon="'+name+'"></svg>';
const e=x=>String(x).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll('"',"&quot;");
const sample=()=>{
 const s=createProjectState(),studio=s.graphStudio;
 editNativeHeading(studio,"graph",0,"Time (s)");editNativeHeading(studio,"graph",1,"Distance (m)");
 editNativeCell(studio,"graph",0,0,"1.230");
 editNativeCell(studio,"graph",0,1,"4.50");
 editNativeCell(studio,"graph",1,0,"2.340");
 editNativeCell(studio,"graph",1,1,"7.00");
 studio.draft.sourceKind="primary";
 return s;
};
test("new projects offer a ready-to-type worksheet but contain no invented measurements",()=>{
 const s=createProjectState();
 assert.deepEqual(s.dataShelf,[]);
 for(const type of ["graph","stat","table"]){
  const studio=s[type+"Studio"],html=renderNativeDataGrid(s,type,icon,e);
  assert.deepEqual(studio.draft.matrix,[]);
  assert.deepEqual(studio.draft.columns,[]);
  assert.match(html,/data-native-heading="true"/);
  assert.match(html,/data-native-cell="true"/);
  assert.match(html,/No spreadsheet or pasted data required/);
  assert.match(html,/data-action="native-send"/);
 }
});
test("student input retains exact measured precision and derives axis units from column headings",()=>{
 const s=sample(),d=s.graphStudio.draft;
 assert.deepEqual(d.columns,["Time (s)","Distance (m)"]);
 assert.deepEqual([d.xLabel,d.xUnit,d.xUnitMode],["Time","s","unit"]);
 assert.deepEqual([d.yLabel,d.yUnit,d.yUnitMode],["Distance","m","unit"]);
 assert.equal(d.matrix[0][0],"1.230");
 assert.deepEqual(graphData(d).points,[{x:1.23,y:4.5},{x:2.34,y:7}]);
 assert.equal(nativeGridSummary(d).filled,4);
 d.title="Distance against time";
 assert.equal(analyseGraph(d).ready,true);
});
test("native grid can receive a rectangular clipboard block with its own headings",()=>{
 const s=createProjectState(),g=s.graphStudio;
 const result=pasteNativeRange(g,"graph",0,0,"Time (s)\tHeight (m)\n0.10\t1.200\n0.20\t2.300\n",{headings:true});
 assert.deepEqual(result,{ok:true,rows:2,cols:2});
 assert.equal(g.draft.columns[1],"Height (m)");
 assert.equal(g.draft.matrix[1][1],"2.300");
 assert.equal(g.draft.raw,"");
 assert.equal(g.draft.pendingPaste,false);
});
test("quoted separators and partial cells work without executing or evaluating formulas",()=>{
 assert.deepEqual(parseNativeRange('"North, East",12\n"South, West",14'),[["North, East","12"],["South, West","14"]]);
 const s=createProjectState();
 editNativeCell(s.tableStudio,"table",0,0,"=1+2");
 assert.equal(s.tableStudio.draft.matrix[0][0],"=1+2");
 assert.equal(s.tableStudio.draft.matrix[0][1],"");
 assert.equal(nativeGridSummary(s.tableStudio.draft).incomplete,1);
});
test("grid edits are bounded and invalid large pasted blocks change nothing",()=>{
 const s=sample(),before=JSON.stringify(s.graphStudio.draft);
 assert.equal(editNativeCell(s.graphStudio,"graph",NATIVE_MAX_ROWS,0,"9"),false);
 assert.equal(editNativeCell(s.graphStudio,"graph",0,10,"9"),false);
 assert.equal(pasteNativeRange(s.graphStudio,"graph",0,9,"1\t2").ok,false);
 assert.equal(pasteNativeRange(s.graphStudio,"graph",499,0,"1\n2").ok,false);
 assert.equal(JSON.stringify(s.graphStudio.draft),before);
});
test("native row and column editing keeps matrices rectangular and fixes selections",()=>{
 const s=sample(),g=s.graphStudio;
 assert.equal(addNativeColumn(g,"graph"),true);
 assert.equal(g.draft.columns.length,3);
 assert.equal(g.draft.matrix[1].length,3);
 assert.equal(editNativeHeading(g,"graph",2,"Temperature (K)"),true);
 assert.equal(editNativeCell(g,"graph",0,2,"298.2"),true);
 assert.equal(removeNativeColumn(g,"graph",2),true);
 assert.equal(g.draft.columns.length,2);
 assert.equal(g.draft.matrix[0].length,2);
 assert.equal(addNativeRows(g,"graph",5),true);
 assert.equal(g.draft.matrix.length,7);
 assert.equal(removeNativeRow(g,"graph",0),true);
 assert.equal(g.draft.matrix[0][0],"2.340");
});
test("statistical diagram summary reacts to values from the exact same native cells",()=>{
 const s=createProjectState(),d=s.statStudio.draft;
 d.kind="box";d.selected=[0];d.variable="Mass";d.unitMode="unit";d.unit="kg";d.sourceKind="primary";d.title="Mass measurements";
 editNativeHeading(s.statStudio,"stat",0,"Mass (kg)");
 for(let i=0;i<6;i++)editNativeCell(s.statStudio,"stat",i,0,String(i+1));
 assert.equal(statAnalysis(d).result.series[0].values.length,6);
 assert.ok(renderNativeDataGrid(s,"stat",icon,e).includes("Mass (kg)"));
});
test("native source cells feed automatic compact table formatting with IB size safeguards",()=>{
 const s=createProjectState(),t=s.tableStudio;
 editNativeHeading(t,"table",0,"Trial");
 editNativeHeading(t,"table",1,"Time (s)");
 for(const [i,label,time] of [[0,"A","1.20"],[1,"B","2.30"]]){
  editNativeCell(t,"table",i,0,label);editNativeCell(t,"table",i,1,time);
 }
 t.draft.title="Two selected trials";t.draft.sourceKind="primary";
 t.draft.unitDecisions[1]={mode:"unit",unit:"s"};
 const check=analyzeTable(t.draft);
 assert.equal(check.ready,true);
 assert.deepEqual(check.model.rows,[["A","1.20"],["B","2.30"]]);
 for(let i=2;i<9;i++)editNativeCell(t,"table",i,0,String(i));
 assert.ok(analyzeTable(t.draft).problems.some(p=>p.code==="raw-table-too-long"));
});
test("six explicitly saved datasets survive JSON round trip and seventh is rejected",()=>{
 const s=sample();
 for(let i=0;i<6;i++)assert.equal(saveNativeDataset(s,"graph","Dataset "+i).ok,true);
 assert.equal(saveNativeDataset(s,"graph","One too many").ok,false);
 const copy=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.equal(copy.dataShelf.length,6);
 assert.equal(copy.dataShelf[0].columns[0],"Time (s)");
 assert.equal(copy.dataShelf[0].matrix[0][0],"1.230");
 assert.equal(deleteNativeDataset(copy,copy.dataShelf[0].id),true);
 assert.equal(copy.dataShelf.length,5);
});
test("cross-generator transfer preserves the source dataset and never overwrites linked saved figures",()=>{
 const s=sample(),source=JSON.stringify(s.graphStudio.draft.matrix);
 const snap=nativeSnapshot(s.graphStudio.draft);
 assert.equal(snap.ok,true);
 s.tableStudio.activeId="table-existing";
 s.statStudio.activeId="stat-existing";
 assert.equal(applyNativeDataset(s.tableStudio,"table",snap.dataset).ok,true);
 assert.equal(applyNativeDataset(s.statStudio,"stat",snap.dataset).ok,true);
 assert.equal(s.tableStudio.activeId,"");
 assert.equal(s.statStudio.activeId,"");
 assert.deepEqual(s.tableStudio.draft.columns,s.graphStudio.draft.columns);
 assert.deepEqual(s.statStudio.draft.matrix,s.graphStudio.draft.matrix);
 assert.equal(s.tableStudio.draft.unitDecisions[0].unit,"s");
 assert.equal(s.statStudio.draft.unit,"s");
 assert.equal(s.tableStudio.draft.sourceKind,"primary");
 editNativeCell(s.tableStudio,"table",0,0,"Changed");
 assert.equal(JSON.stringify(s.graphStudio.draft.matrix),source);
});
test("theoretical values are not silently re-labelled as primary observations",()=>{
 const s=sample();s.graphStudio.draft.sourceKind="theoretical";
 const snap=nativeSnapshot(s.graphStudio.draft);
 const result=applyNativeDataset(s.tableStudio,"table",snap.dataset);
 assert.equal(result.ok,true);
 assert.equal(s.tableStudio.draft.sourceKind,"unsure");
});
test("transfer from wider graphs refuses excess columns without truncating or replacing the target",()=>{
 const s=sample();
 for(let i=0;i<7;i++)addNativeColumn(s.graphStudio,"graph");
 const snap=nativeSnapshot(s.graphStudio.draft);
 assert.equal(snap.ok,false); // New columns must be named before reuse.
 for(let i=2;i<s.graphStudio.draft.columns.length;i++)editNativeHeading(s.graphStudio,"graph",i,"Column "+(i+1));
 const valid=nativeSnapshot(s.graphStudio.draft);
 assert.equal(valid.ok,true);
 assert.equal(s.graphStudio.draft.columns.length,9);
 const before=JSON.stringify(s.tableStudio.draft);
 assert.equal(applyNativeDataset(s.tableStudio,"table",valid.dataset).ok,false);
 assert.equal(JSON.stringify(s.tableStudio.draft),before);
});
test("single-column observations can be reused for distributions and frequency tables",()=>{
 const s=createProjectState();
 editNativeHeading(s.statStudio,"stat",0,"Length (cm)");
 for(let i=0;i<4;i++)editNativeCell(s.statStudio,"stat",i,0,String(i+1));
 const saved=nativeSnapshot(s.statStudio.draft);
 assert.equal(saved.ok,true);
 assert.equal(saved.dataset.columns.length,1);
 assert.equal(applyNativeDataset(s.tableStudio,"table",saved.dataset).ok,true);
 assert.equal(s.tableStudio.draft.matrix.length,4);
 assert.equal(applyNativeDataset(s.graphStudio,"graph",saved.dataset).ok,false);
 assert.equal(s.graphStudio.draft.matrix.length,0);
 saveNativeDataset(s,"stat","Length measurements");
 assert.equal(normalizeProjectState(JSON.parse(JSON.stringify(s))).dataShelf[0].columns.length,1);
});
test("paired native values transferred to an old function graph become a scatter graph",()=>{
 const s=sample(),snap=nativeSnapshot(s.graphStudio.draft);
 s.graphStudio.draft.kind="function";
 assert.equal(applyNativeDataset(s.graphStudio,"graph",snap.dataset).ok,true);
 assert.equal(s.graphStudio.draft.kind,"scatter");
 assert.deepEqual(graphData(s.graphStudio.draft).points,[{x:1.23,y:4.5},{x:2.34,y:7}]);
});
test("source datasets are independent copies, not hidden live links",()=>{
 const s=sample();saveNativeDataset(s,"graph","Source snapshot");
 const original=s.dataShelf[0].matrix[0][0];
 editNativeCell(s.graphStudio,"graph",0,0,"999");
 assert.equal(s.dataShelf[0].matrix[0][0],original);
 assert.equal(s.graphStudio.draft.matrix[0][0],"999");
});
test("native dataset shelf rejects malformed project import records",()=>{
 const saved=normalizeNativeShelf([
  {id:"data-good",name:"Clean",columns:["A","B"],matrix:[["1","2"]],sourceKind:"primary"},
  {id:"data-bad",name:"Invalid",columns:[],matrix:[["1"]]},
  {id:"__proto__",name:"Unsafe",columns:["A","B"],matrix:[["1","2"]]}
 ]);
 assert.equal(saved.length,1);
 assert.equal(saved[0].name,"Clean");
});
test("worksheet pagination renders a small editable slice of 500 rows",()=>{
 const s=sample(),g=s.graphStudio;
 for(let i=2;i<500;i++)editNativeCell(g,"graph",i,0,String(i));
 g.nativePage=30;
 const html=renderNativeDataGrid(s,"graph",icon,e);
 assert.ok(html.includes('data-native-row="480"'));
 assert.ok(!html.includes('data-native-row="120"'));
 assert.ok(html.includes('data-action="native-page"'));
 assert.ok(html.length<25000);
});
test("native action controller explicitly changes only its active studio",()=>{
 const s=sample();s.route="completing";s.completion.current="C31";s.graphStudio.open=true;
 const callbacks={save:()=>{},render:()=>{},toast:()=>{},confirm:()=>true,openTool:()=>{}};
 const event={dataset:{nativeType:"graph"},closest:()=>null};
 assert.equal(activeNativeType(s),"graph");
 assert.equal(handleNativeDataAction(s,"native-add-row",event,callbacks),true);
 assert.equal(s.graphStudio.draft.matrix.length,3);
 assert.equal(s.statStudio.draft.matrix.length,0);
 assert.equal(handleNativeDataAction(s,"irrelevant",event,callbacks),false);
});
