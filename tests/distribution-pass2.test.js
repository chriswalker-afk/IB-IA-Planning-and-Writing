import test from "node:test";
import assert from "node:assert/strict";
import {newDistributionDraft,analyzeDistribution,newDistributionStudio,normalizeDistributionStudio} from "../src/diagrams/distribution-core.js";
import {distributionLayout,distributionBoundaryForPixel,distributionBoundaryNudge,DISTRIBUTION_SIZES} from "../src/diagrams/distribution-layout.js";
import {renderDistributionSvg} from "../src/diagrams/distribution-render.js";
import {distributionPreviewHtml,renderDistributionStudio} from "../src/diagrams/distribution-view.js";
import {createProjectState} from "../src/core/project-state.js";
const draft=(changes={})=>({...newDistributionDraft(),title:"Observed timings — proposed model",...changes});
const between=()=>draft({mu:"70",sigma:"10",symbol:"T",unit:"seconds",mode:"between",lower:"65",upper:"85"});
const binomial=()=>draft({kind:"binomial",n:"12",p:"0.25",symbol:"B",mode:"exact",lower:"3"});

test("normal density SVG is calibrated to density, not arbitrary normalised height",()=>{
 const d=between(),a=distributionLayout(d),svg=renderDistributionSvg(d);
 assert(a.yMax>a.peak);assert(a.peak>0);
 assert.equal(a.xTicks.length,7);
 assert.equal(a.yTicks[0],0);
 assert.match(svg,/Probability density/);
 assert.match(svg,/data-distribution-curve="normal"/);
 assert.match(svg,/data-distribution-shading="normal"/);
 assert.match(svg,/T \(seconds\)/);
 assert.match(svg,/data-distribution-boundary="lower"/);
 assert.match(svg,/data-distribution-boundary="upper"/);
 assert.doesNotMatch(svg,/data-distribution-handle|aria-valuenow|Drag a marker/);
 assert(a.plot.top>a.titleEnd);
});
test("shading is a closed path and matches the chosen interval in all formats",()=>{
 const svg=renderDistributionSvg(between());
 const areas=[...svg.matchAll(/data-distribution-shading="normal" d="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(areas.length,1);assert.match(areas[0],/Z$/);
 assert(!areas[0].includes(" M"),"A second moveto would detach the shaded polygon");
 const outside=renderDistributionSvg({...between(),mode:"outside"});
 assert.equal([...outside.matchAll(/data-distribution-shading="normal"/g)].length,2);
});
test("binomial plots actual probability axis, every integer bar and correct selected set",()=>{
 const d=binomial(),l=distributionLayout(d),svg=renderDistributionSvg(d);
 assert.equal(l.xTicks[0].value,0);
 assert.equal(l.xTicks[l.xTicks.length-1].value,12);
 assert(l.yMax>=l.peak);
 assert.equal([...svg.matchAll(/data-distribution-bar="\d+"/g)].length,13);
 assert.equal([...svg.matchAll(/data-distribution-selected="true"/g)].length,1);
 assert.match(svg,/P\(B = k\)/);
 assert(!svg.includes("data-distribution-handle"));
});
test("dense bins and long labels remain finite and do not duplicate normal tick labels",()=>{
 const dense=distributionLayout({...binomial(),n:"150",p:".5",mode:"right",lower:"72"});
 assert(dense.xTicks.length<=21);
 assert.equal(dense.xTicks.at(-1).value,150);
 const l=distributionLayout({...between(),mu:"100000000",sigma:".01"});
 assert.equal(new Set(l.xTicks.map(x=>x.label)).size,l.xTicks.length);
 assert(l.xTicks.every(x=>Number.isFinite(l.x(x.value))));
 const title="An extended investigation into the probability of a particular event, using a named theoretical distribution with several parameters";
 const long=distributionLayout(draft({title,size:"compact"}));
 assert(long.titleLines.length>1);
 assert(long.plot.top>long.titleEnd);
});
test("preview-only handles are keyboard accessible and absent from printed SVG",()=>{
 const d=between(),a=renderDistributionSvg(d,{interactive:true}),b=renderDistributionSvg(d);
 assert.match(a,/data-distribution-interactive="true"/);
 assert.equal([...a.matchAll(/role="slider"/g)].length,2);
 assert.match(a,/aria-valuenow="65"/);
 assert.match(a,/role="group"/);
 assert(!b.includes('role="slider"'));
 assert(!b.includes('data-distribution-interactive'));
 assert.match(distributionPreviewHtml({draft:d,zoomed:true}),/distribution-preview-detail/);
});
test("boundary maps to axis correctly and cannot cross opposite bound",()=>{
 const d=between(),l=distributionLayout(d);
 assert(Math.abs(distributionBoundaryForPixel(d,"lower",l.x(63))-63)<.2);
 assert(distributionBoundaryForPixel(d,"lower",l.x(95))<=85);
 assert(distributionBoundaryForPixel(d,"upper",l.x(52))>=65);
 assert(distributionBoundaryNudge(d,"lower",1)>65);
 assert(distributionBoundaryNudge(d,"upper",-1)<85);
 const v=binomial(),x=distributionLayout(v);
 assert.equal(distributionBoundaryForPixel(v,"lower",x.x(4)),4);
 assert.equal(distributionBoundaryNudge(v,"lower",1),4);
 assert.equal(distributionBoundaryForPixel({...v,mode:"outside",lower:"3",upper:"5"},"lower",x.x(10)),4);
});
test("monochrome shading remains distinguishable from the curve",()=>{
 const svg=renderDistributionSvg({...between(),printStyle:"mono"});
 assert.match(svg,/distribution-hatch/);
 assert.match(svg,/fill="url\(#distribution-hatch\)"/);
 assert.match(svg,/fill="none" stroke="#364a57"/);
});
test("student text is escaped and no editor-only content enters figure",()=>{
 const svg=renderDistributionSvg({...between(),title:"<script>alert(1)</script> & model",note:"UNEXPORTED teacher feedback"});
 assert(!svg.includes("<script>"));
 assert.match(svg,/&lt;script&gt;/);
 assert(!svg.includes("UNEXPORTED"));
});
test("responsive preview offers zoom, mobile nudges, and keeps zoom in local backup",()=>{
 const state=createProjectState();state.distributionStudio.draft=between();
 let html=renderDistributionStudio(state,()=>"",x=>String(x).replaceAll("&","&amp;").replaceAll("<","&lt;"));
 assert.match(html,/data-action="distribution-preview-detail"/);
 assert.match(html,/data-action="distribution-preview-fit"/);
 assert.equal([...html.matchAll(/data-action="distribution-nudge"/g)].length,4);
 state.distributionStudio.zoomed=true;
 assert.match(distributionPreviewHtml(state.distributionStudio),/distribution-preview-detail/);
 const restored=normalizeDistributionStudio(JSON.parse(JSON.stringify(state.distributionStudio)));
 assert.equal(restored.zoomed,true);
});
