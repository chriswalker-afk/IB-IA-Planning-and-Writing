import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {newGraphDraft} from "../src/diagrams/graph-core.js";
import {newStatDraft} from "../src/diagrams/stat-studio-core.js";
import {newTableDraft} from "../src/diagrams/table-studio-core.js";
import {newImageTraceDraft} from "../src/diagrams/image-tracer-core.js";
import {newVoronoiDraft} from "../src/diagrams/voronoi-core.js";
import {representationAdvice,renderRepresentationHub} from "../src/diagrams/representation-hub.js";
import {renderGraphStudio} from "../src/diagrams/graph-view.js";
import {renderStatStudio} from "../src/diagrams/stat-studio-view.js";
import {renderTableStudio} from "../src/diagrams/table-studio-view.js";
import {renderImageTracer} from "../src/diagrams/image-tracer-view.js";
import {renderVoronoiStudio} from "../src/diagrams/voronoi-view.js";
import {
 describeWorkingData,contextualRepresentationAdvice,relevantAccuracySparks,
 presentationSparks,presentationDiagnostics,figureCaption,handoverQuestions
} from "../src/diagrams/presentation-coach-core.js";
import {
 renderPresentationCoach,renderFigureHandover,renderHubDatasetEvidence
} from "../src/diagrams/presentation-coach-view.js";
const icon=()=>'<svg aria-hidden="true"></svg>';
const esc=s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
const paired=()=>{
 const state=createProjectState(),d=state.graphStudio.draft;
 d.columns=["Time (s)","Distance (m)"];d.matrix=[["0.00","0.0"],["1.00","2.30"],["2.00","4.20"],["3.00","6.00"]];
 d.xLabel="Time";d.yLabel="Distance";d.xUnitMode="unit";d.yUnitMode="unit";d.xUnit="s";d.yUnit="m";
 d.title="Distance plotted against time";d.sourceKind="primary";
 return state;
};
test("all generators have conservative IB-aware advice and a writing handover",()=>{
 const state=createProjectState();
 const renders=[renderGraphStudio,renderStatStudio,renderTableStudio,renderImageTracer,renderVoronoiStudio];
 const ids=["graph","stat","table","trace","voronoi"];
 renders.forEach((render,i)=>{
  const html=render(state,icon,esc);
  assert.ok(html.includes('data-presentation-coach="'+ids[i]+'"'),ids[i]);
  assert.ok(html.includes('data-figure-handover="'+ids[i]+'"'),ids[i]);
  assert.ok(html.includes('data-action="presentation-copy-caption"'),ids[i]);
  assert.ok(html.includes("These prompts are not a grade prediction"),ids[i]);
 });
});
test("dataset advice examines working cell types without asserting patterns",()=>{
 const s=paired(),shape=describeWorkingData(s.graphStudio.draft);
 assert.equal(shape.shape,"paired-numbers");
 assert.equal(shape.paired,4);
 assert.equal(shape.rows,4);
 assert.ok(!JSON.stringify(shape).includes("correlation"));
 const a=contextualRepresentationAdvice(s,representationAdvice(s));
 assert.deepEqual(a.ids,["graph","stat"]);
 assert.match(a.note,/does not establish any relationship/);
 assert.match(renderRepresentationHub(s,icon,esc),/4 complete numeric pairs/);
});
test("selected Voronoi pathway outranks superficial shape of Cartesian site coordinates",()=>{
 const s=paired();
 s.planning.routeExplorer.selectedRoute="voronoi";
 const a=contextualRepresentationAdvice(s,representationAdvice(s));
 assert.deepEqual(a.ids,["voronoi","trace"]);
 assert.match(renderHubDatasetEvidence(s,representationAdvice(s),icon,esc),/data-hub-dataset-evidence/);
});
test("one numerical column recommends a distribution when no route is selected",()=>{
 const s=createProjectState();
 s.statStudio.draft.columns=["Length (cm)"];
 s.statStudio.draft.matrix=[["1.20"],["2.40"],["3.60"]];
 const a=contextualRepresentationAdvice(s,representationAdvice(s));
 assert.deepEqual(a.ids,["stat","table"]);
 assert.match(a.note,/scatter diagram would need genuinely paired/);
});
test("count tables are not assumed to be samples or automatically valid bar counts",()=>{
 const s=createProjectState();
 s.tableStudio.draft.columns=["Activity","Result"];
 s.tableStudio.draft.matrix=[["Run","2.3"],["Swim","3.5"]];
 const a=contextualRepresentationAdvice(s,representationAdvice(s));
 assert.deepEqual(a.ids,["table","stat"]);
 assert.match(a.note,/individual measurements or valid category counts/);
});
test("reuse planned accuracy only for matching quantities; do not mark it verified",()=>{
 const s=paired();
 s.planning.fields.firstAccuracy="Nearest 0.1 s";
 s.planning.accuracyPlans=[{quantity:"Time",resolution:"Nearest 0.01 s",unit:"s",uncertainty:"not confirmed"},
  {quantity:"Height",resolution:"Nearest 1 mm"}];
 const a=relevantAccuracySparks(s,s.graphStudio.draft);
 assert.equal(a.planned.length,1);
 assert.equal(a.recorded.length,0);
 const prompts=presentationSparks(s,"graph",s.graphStudio.draft);
 const matched=prompts.find(x=>x.title==="Matching measurement-accuracy spark");
 assert.ok(matched);
 assert.equal(matched.kind,"planned");
 assert.match(matched.detail,/confirm what the device or dataset actually resolved/);
});
test("actual accuracy decisions take precedence over provisional planning decisions",()=>{
 const s=paired();
 s.planning.accuracyPlans=[{quantity:"Time",resolution:"Planned 1 s"}];
 s.completion.accuracyDecisions=[{quantity:"Time",resolution:"Actual 0.01 s",policy:"Report to hundredths"}];
 const prompts=presentationSparks(s,"graph",s.graphStudio.draft);
 const p=prompts.find(x=>x.title==="Recorded accuracy decision");
 assert.ok(p);assert.equal(p.kind,"confirmed");
 assert.match(p.detail,/Actual 0.01 s/);
 assert.ok(!prompts.some(x=>x.title==="Matching measurement-accuracy spark"));
});
test("sampling echoes from planning and completed decisions remain distinguishable",()=>{
 const s=paired();s.planning.fields.primarySamplingMethod="convenience";
 s.planning.fields.primaryPopulation="Students in a class";
 s.planning.fields.primarySamplingUnit="Each student";
 let spark=presentationSparks(s,"stat",s.graphStudio.draft).find(x=>x.title==="Sampling and population context");
 assert.equal(spark.kind,"planned");
 assert.match(spark.detail,/representative sample without evidence/);
 s.completion.fields.statisticalPopulation="All students at school";
 s.completion.fields.samplingMethod="stratified";
 spark=presentationSparks(s,"stat",s.graphStudio.draft).find(x=>x.title==="Sampling and population context");
 assert.equal(spark.kind,"confirmed");
 assert.match(spark.detail,/All students at school/);
});
test("graph diagnostics catch intentionally cropped windows and missing pairs",()=>{
 const s=paired(),d=s.graphStudio.draft;
 d.xMin="1.5";d.xMax="3.1";d.matrix.push(["4",""]);
 const alerts=presentationDiagnostics(s,"graph",d);
 assert.ok(alerts.some(x=>x.id==="cropped"));
 assert.ok(alerts.some(x=>x.id==="graph-missing"));
 assert.ok(alerts.some(x=>x.id==="scatter"));
});
test("statistical prompts distinguish histogram density, bar denominators and small samples",()=>{
 const s=createProjectState();
 const hist=newStatDraft();hist.kind="histogram";hist.histogramInput="table";
 assert.ok(presentationDiagnostics(s,"stat",hist).some(x=>x.id==="hist-density"));
 assert.ok(presentationDiagnostics(s,"stat",hist).some(x=>x.id==="grouped"));
 const bar=newStatDraft();bar.kind="bar";bar.barMode="percent";
 assert.match(presentationDiagnostics(s,"stat",bar).find(x=>x.id==="bar-denominator").detail,/denominator/);
 const box=newStatDraft();box.kind="box";
 assert.ok(presentationDiagnostics(s,"stat",box).some(x=>x.id==="box-method"));
});
test("table diagnostics distinguish display precision, small summaries and frequency denominators",()=>{
 const s=createProjectState(),d=newTableDraft();
 d.mode="compact";d.numberFormat="fixed";d.columns=["A","B"];d.matrix=Array.from({length:9},(_,i)=>[String(i),String(i*i)]);
 const issues=presentationDiagnostics(s,"table",d);
 assert.ok(issues.some(x=>x.id==="table-size"));
 assert.ok(issues.some(x=>x.id==="precision"));
 d.mode="summary";assert.ok(presentationDiagnostics(s,"table",d).some(x=>x.id==="summary"));
 d.mode="frequency";assert.ok(presentationDiagnostics(s,"table",d).some(x=>x.id==="frequency"));
});
test("image tracing guidance names calibration and photographic limitations",()=>{
 const s=createProjectState(),d=newImageTraceDraft();d.limitations="Oblique camera view";
 const issues=presentationDiagnostics(s,"trace",d);
 assert.ok(issues.some(x=>x.id==="tracer-scale"));
 assert.ok(issues.some(x=>x.id==="photo-perspective"));
 assert.ok(issues.some(x=>x.detail.includes("Oblique camera")));
});
test("Voronoi advice explicitly does not claim real journey times or proven optimality",()=>{
 const s=createProjectState(),d=newVoronoiDraft();
 d.sites=[{kind:"observed",x:0,y:0},{kind:"candidate",x:1,y:2}];
 const issues=presentationDiagnostics(s,"voronoi",d);
 assert.ok(issues.some(x=>x.id==="voronoi-metric"));
 assert.ok(issues.some(x=>x.id==="voronoi-metric-check"));
 assert.ok(issues.some(x=>x.id==="voronoi-candidates"));
});
test("captions do not invent a finding, confirmed source, grade or explanation",()=>{
 const s=paired(),d=s.graphStudio.draft;
 d.figureNumber="2";d.caption="Paired observations before model choice";
 d.sourceKind="secondary";d.sourceText="Transport Authority, 2025 data release";
 const text=figureCaption(s,"graph",d);
 assert.match(text,/Figure 2. Distance plotted against time/);
 assert.match(text,/Transport Authority, 2025 data release/);
 assert.ok(!text.includes("strong correlation"));
 assert.ok(!text.includes("Source: own collected"));
 d.sourceKind="unsure";assert.match(figureCaption(s,"graph",d),/confirm the actual source/);
});
test("function graph caption explicitly says it is not real observations",()=>{
 const s=createProjectState(),d=newGraphDraft();
 d.kind="function";d.title="Proposed model";d.figureNumber="3";d.expression="x^2";
 assert.match(figureCaption(s,"graph",d),/not observed data/);
});
test("primary data captions credit own data only when source confirmed in the figure",()=>{
 const s=createProjectState(),d=newTableDraft();
 d.title="Four summary values";d.number="4";d.note="Missing response excluded";
 d.sourceKind="primary";
 assert.match(figureCaption(s,"table",d),/^Table 4\./);
 assert.match(figureCaption(s,"table",d),/Source: own collected/);
 const t=newImageTraceDraft();t.title="Arch trace";t.figureNumber="5";
 t.sourceKind="secondary";t.sourceCredit="Original photographer, 2024";
 assert.match(figureCaption(s,"trace",t),/Original photographer, 2024/);
});
test("writing handover ties prompts to a real aim and earlier mathematical question",()=>{
 const s=paired();
 s.planning.fields.aim="How far can a runner travel in 10 seconds?";
 s.completion.fields.firstPurpose="Do time and distance appear to vary together?";
 const qs=handoverQuestions(s,"graph",s.graphStudio.draft);
 assert.match(qs.before,/runner/);
 assert.match(qs.before,/vary together/);
 assert.match(qs.after,/feature actually visible/);
 assert.match(qs.next,/actual result/);
});
test("all user-entered caption content is escaped in HTML, and copying uses dataset action",()=>{
 const s=paired(),d=s.graphStudio.draft;
 d.title='<img src=x onerror=alert(1)>';d.caption='<script>bad()</script>';
 const html=renderFigureHandover(s,"graph",d,icon,esc);
 assert.ok(!html.includes("<script>"));
 assert.ok(html.includes("&lt;script&gt;"));
 assert.ok(html.includes('data-action="presentation-copy-caption"'));
 assert.ok(html.includes('data-presentation-type="graph"'));
 const linked=renderFigureHandover(s,"graph",d,icon,esc,{linked:true,id:"figure-test"});
 assert.match(linked,/^<details /);
 assert.match(linked,/data-presentation-id="figure-test"/);
});
test("figure number and source fields are maintained across project backup restoration",()=>{
 const state=createProjectState();
 state.graphStudio.draft.figureNumber="11";
 state.statStudio.draft.figureNumber="12";
 state.imageTracer.draft.figureNumber="13";
 state.voronoiStudio.draft.figureNumber="14";
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(state)));
 assert.equal(restored.graphStudio.draft.figureNumber,"11");
 assert.equal(restored.statStudio.draft.figureNumber,"12");
 assert.equal(restored.imageTracer.draft.figureNumber,"13");
 assert.equal(restored.voronoiStudio.draft.figureNumber,"14");
});
test("the site never turns a planned source into an automatically verified citation",()=>{
 const s=createProjectState();
 s.planning.fields.dataSource="secondary";
 s.planning.fields.secondaryPublisher="Example Institute";
 const graph=newGraphDraft();graph.title="An example";
 const html=renderPresentationCoach(s,"graph",graph,icon,esc);
 assert.ok(html.includes("not yet verified"));
 const caption=figureCaption(s,"graph",graph);
 assert.ok(!caption.includes("Example Institute"));
});
