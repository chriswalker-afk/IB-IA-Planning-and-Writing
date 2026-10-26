import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {newDistributionDraft,newDistributionStudio,analyzeDistribution} from "../src/diagrams/distribution-core.js";
import {renderDistributionStudio,distributionFeedbackHtml,distributionPreviewHtml} from "../src/diagrams/distribution-view.js";
import {renderDistributionSvg} from "../src/diagrams/distribution-render.js";
import {renderDistributionWhatIfSvg} from "../src/diagrams/distribution-whatif-render.js";
import {renderDistributionWhatIfControls,distributionWhatIfPreviewHtml} from "../src/diagrams/distribution-whatif-view.js";
import {renderDistributionInverseHtml} from "../src/diagrams/distribution-inverse-view.js";
import {startDistributionWhatIf,setDistributionWhatIfField,setDistributionWhatIfOption} from "../src/diagrams/distribution-whatif-actions.js";
import {compareDistributionWhatIf} from "../src/diagrams/distribution-whatif-core.js";
import {calculateDistributionInverse} from "../src/diagrams/distribution-inverse-actions.js";
import {distributionFigureAnnouncement,distributionInverseAnnouncement,distributionWhatIfAnnouncement} from "../src/diagrams/distribution-accessibility.js";
import {figureCaption} from "../src/diagrams/presentation-coach-core.js";
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const configure=(kind,fields={})=>{
 const s=newDistributionStudio();
 s.open=true;
 s.draft={...newDistributionDraft(),kind,title:"Model under discussion",symbol:"T",mode:"left",lower:"2",
  ...(kind==="normal"?{mu:"70",sigma:"10",lower:"70"}:
   kind==="binomial"?{n:"10",p:"0.5",lower:"3"}:
   kind==="poisson"?{lambda:"3",lower:"3"}:
   kind==="uniform"?{a:"0",b:"10",lower:"5"}:
   {customPoints:"0,0.2\n1,0.5\n2,0.3",lower:"1"}),...fields};
 return s;
};
test("one stable, empty status region replaces per-keystroke live feedback",()=>{
 const s=createProjectState();
 s.distributionStudio=configure("normal");
 startDistributionWhatIf(s.distributionStudio);
 const html=renderDistributionStudio(s,()=>"",esc);
 assert.match(html,/data-distribution-a11y-status role="status" aria-live="polite" aria-atomic="true"/);
 assert.equal((html.match(/data-distribution-a11y-status/g)||[]).length,1);
 assert.match(html,/data-distribution-feedback>/);
 assert.doesNotMatch(html,/data-distribution-feedback aria-live=/);
 assert.match(html,/data-distribution-whatif-summary class="distribution-whatif-summary"/);
 assert.doesNotMatch(html,/data-distribution-whatif-summary[^>]*aria-live/);
 assert.match(distributionFeedbackHtml(s.distributionStudio,esc),/Figure ready for export/);
 assert.equal((html.match(/data-distribution-a11y-status[^>]+><\/p>/g)||[]).length,1);
 assert.match(html,/data-distribution-inverse-result/);
 assert.doesNotMatch(html,/data-distribution-inverse-result[^>]*aria-live/);
});
test("concise figure and inverse announcements give mathematical information, not whole guidance panels",()=>{
 const s=configure("normal"),draft=s.draft;
 const fig=distributionFigureAnnouncement(s);
 assert.match(fig,/Figure ready/);
 assert.match(fig,/P\(T ≤ 70\)/);
 assert(fig.length<180);
 s.draft={...draft,sigma:"0"};
 assert.match(distributionFigureAnnouncement(s),/Figure needs correction/);
 s.draft=draft;
 assert.match(distributionInverseAnnouncement(s),/check the probability target|Inverse calculation needs correction/);
 s.inverse.mode="left";s.inverse.probability="0.9";
 const res=calculateDistributionInverse(s);
 assert(res);
 const notice=distributionInverseAnnouncement(s);
 assert.match(notice,/Requested probability|achieved probability/i);
 assert(notice.length<220);
});
test("What-if announcements distinguish fixed event, fixed target, invalid targets, and idle states",()=>{
 const s=configure("normal");
 assert.match(distributionWhatIfAnnouncement(s),/Start a comparison/);
 startDistributionWhatIf(s);
 assert.match(distributionWhatIfAnnouncement(s),/parameters match/);
 setDistributionWhatIfField(s,"mu","75");
 const event=distributionWhatIfAnnouncement(s);
 assert.match(event,/Fixed event: original probability/);
 assert.match(event,/percentage points/);
 assert(event.length<240);
 setDistributionWhatIfOption(s,"comparison","target");
 const target=distributionWhatIfAnnouncement(s);
 assert.match(target,/Fixed probability target/);
 assert.match(target,/Achieved probabilities/);
 assert(target.length<310);
 setDistributionWhatIfOption(s,"targetProbability","invalid");
 assert.match(distributionWhatIfAnnouncement(s),/Check the fixed probability target/);
});
test("What-if announcements cover all five models and unchanged discrete cut-offs",()=>{
 const alternatives=[
  ["normal","mu","75"],["binomial","p","0.6"],["poisson","lambda","5"],
  ["uniform","b","12"],["custom","customPoints","0,0.1\n1,0.5\n2,0.4"]
 ];
 for(const [kind,key,v] of alternatives){
  const s=configure(kind);startDistributionWhatIf(s);
  setDistributionWhatIfField(s,key,v);
  setDistributionWhatIfOption(s,"comparison","target");
  setDistributionWhatIfOption(s,"targetProbability","0.8");
  const q=compareDistributionWhatIf(s);
  assert(q.ready&&q.target?.ok,kind);
  assert.match(distributionWhatIfAnnouncement(s),/Original .*alternative .*Achieved probabilities/);
 }
});
test("monochrome export uses distinct selected patterns and clear verbal descriptions for all five distributions",()=>{
 const kinds=["normal","binomial","poisson","uniform","custom"];
 for(const kind of kinds){
  const s=configure(kind,{printStyle:"mono"});
  const before=JSON.stringify(s.draft),q=analyzeDistribution(s.draft);
  assert(q.ready,kind+" "+q.issues.join("; "));
  const svg=renderDistributionSvg(s.draft);
  assert.match(svg,/<desc>/,kind);
  assert.match(svg,/Selected probabilities use a hatch pattern/,kind);
  assert.match(svg,/id="distribution-hatch"/,kind);
  assert.match(svg,/fill="url\(#distribution-hatch\)"/,kind);
  if(["binomial","poisson","custom"].includes(kind)){
   assert.match(svg,/data-distribution-selected="true"/,kind);
   assert.match(svg,/stroke-width="1\.6"/,kind);
  }else assert.match(svg,/data-distribution-shading/,kind);
  assert.doesNotMatch(svg,/distribution-whatif|data-distribution-handle|data-distribution-a11y-status/);
  assert.equal(JSON.stringify(s.draft),before);
 }
});
test("comparison graph explains its patterns, works as a keyboard scroll region, and stays editor-only",()=>{
 for(const kind of ["normal","binomial","poisson","uniform","custom"]){
  const s=configure(kind);startDistributionWhatIf(s);
  setDistributionWhatIfField(s,({normal:"mu",binomial:"p",poisson:"lambda",uniform:"b",custom:"customPoints"})[kind],
    ({normal:"75",binomial:"0.7",poisson:"4",uniform:"15",custom:"0,0.1\n1,0.5\n2,0.4"})[kind]);
  const q=compareDistributionWhatIf(s);
  assert(q.ready,kind);
  const svg=renderDistributionWhatIfSvg(q);
  assert.match(svg,/role="img"/);
  assert.match(svg,/grey dashed or hatched original and blue solid alternative/);
  if(["binomial","poisson","custom"].includes(kind)){
   assert.match(svg,/url\(#distribution-whatif-hatch\)/);
   assert.match(svg,/stroke-dasharray="3 2"/);
  }
  const panel=distributionWhatIfPreviewHtml(s,esc);
  assert.match(panel,/data-distribution-whatif-canvas tabindex="0" role="region"/);
  assert.match(panel,/distribution-whatif-scroll-note/);
  assert.match(panel,/hatched bars/);
  assert.doesNotMatch(renderDistributionSvg(s.draft),/distribution-whatif-hatch|data-whatif-bar/);
 }
});
test("figure number/caption remain for the student IA label, not duplicated inside the SVG",()=>{
 const state=createProjectState(),s=configure("normal",{
  figureNumber:"7",caption:"Show the model assumption, not an observed frequency",
  title:"Modelled waiting time",sourceKind:"theoretical"
 });
 state.distributionStudio=s;
 const html=renderDistributionStudio(state,()=>"",esc);
 assert.match(html,/Figure number for IA label/);
 assert.match(html,/Caption for IA label/);
 assert.match(html,/data-distribution-caption-help/);
 assert.match(html,/not printed inside the SVG or PNG/);
 const label=figureCaption(state,"distribution",s.draft);
 assert.match(label,/Figure 7\./);
 assert.match(label,/Show the model assumption/);
 const svg=renderDistributionSvg(s.draft);
 assert.match(svg,/Modelled waiting time/);
 assert.doesNotMatch(svg,/Figure 7\./);
 assert.doesNotMatch(svg,/Show the model assumption, not an observed frequency/);
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(state)));
 assert.equal(restored.distributionStudio.draft.caption,s.draft.caption);
 assert.equal(restored.distributionStudio.draft.figureNumber,"7");
 assert.equal(renderDistributionSvg(restored.distributionStudio.draft),svg);
});
test("zoomed previews support keyboard scrolling without changing the exported geometry",()=>{
 const s=configure("normal");
 const before=renderDistributionSvg(s.draft);
 assert.match(distributionPreviewHtml(s),/tabindex="-1"/);
 s.zoomed=true;
 const html=distributionPreviewHtml(s);
 assert.match(html,/tabindex="0"/);
 assert.match(html,/aria-label="Enlarged probability figure; scroll sideways to inspect labels"/);
 assert.equal(renderDistributionSvg(s.draft),before);
});
test("preview drag handles have 44px transparent hit targets, accessible values and no export contamination",()=>{
 const s=configure("normal",{mode:"between",lower:"65",upper:"85"});
 const interactive=renderDistributionSvg(s.draft,{interactive:true}),exported=renderDistributionSvg(s.draft);
 assert.equal((interactive.match(/role="slider"/g)||[]).length,2);
 assert.match(interactive,/aria-valuenow="65"/);
 assert.match(interactive,/stroke-width="44" pointer-events="stroke"/);
 assert.doesNotMatch(exported,/role="slider"|pointer-events="stroke"/);
});
