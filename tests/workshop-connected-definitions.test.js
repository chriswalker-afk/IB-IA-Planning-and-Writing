import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState} from "../src/core/project-state.js";
import {WORKSHOP_DEFINITIONS,WORKSHOP_LESSONS,PATHWAY_LEARNING,definitionById,lessonById} from "../src/workshop/catalog.js";
import {CONNECTED_SAMPLING_DEFINITIONS} from "../src/workshop/connected-sampling-definitions.js";
import {DEFINITION_CONNECTION_GROUPS,SAMPLING_HUB_SECTIONS,DEFINITION_CONNECTION_BRIDGES,relatedDefinitionSections,relatedDefinitionIds,unconnectedDefinitionIds} from "../src/workshop/definition-connections.js";
import {newResourceSession} from "../src/resources/state.js";
import {resourceAction,resourceFilter} from "../src/resources/actions.js";
import {renderWorkshop,workshopList} from "../src/workshop/views.js";

const authored=s=>JSON.stringify({planning:s.planning,entries:s.entries,project:s.project,completion:s.completion,scratch:s.scratch,resources:s.resources});

test("connected definitions: new sampling terms are accurate, unique and reachable",()=>{
 assert.equal(WORKSHOP_DEFINITIONS.length,243);
 assert.equal(WORKSHOP_LESSONS.length,45);
 assert.equal(new Set(WORKSHOP_DEFINITIONS.map(d=>d.id)).size,243);
 assert.equal(CONNECTED_SAMPLING_DEFINITIONS.length,10);
 const expected=["sampling","sampling-unit","observational-unit","probability-sampling","nonprobability-sampling","systematic-sample","sampling-interval","cluster-sample","quota-sample","voluntary-response-sample"];
 assert.deepEqual(CONNECTED_SAMPLING_DEFINITIONS.map(d=>d.id),expected);
 for(const d of CONNECTED_SAMPLING_DEFINITIONS){
  assert.equal(definitionById(d.id),d);
  assert(d.category==="Data"&&d.title&&d.meaning&&d.example,d.id);
  assert(!d.notation);
 }
 const lesson=lessonById("sampling");
 assert(lesson.definitionIds.includes("sampling")&&lesson.definitionIds.includes("sampling-unit"));
 assert(PATHWAY_LEARNING.groups.terms.includes("sampling"));
 for(const id of expected)assert(PATHWAY_LEARNING.groups.terms.includes(id),id+" missing from groups route");
 assert(PATHWAY_LEARNING.relationships.terms.includes("sampling"));
 assert(PATHWAY_LEARNING.categorical.terms.includes("sampling"));
});

test("connected definitions: every glossary term has a curated, valid, deduplicated topic network",()=>{
 const all=new Set(WORKSHOP_DEFINITIONS.map(d=>d.id));
 assert(DEFINITION_CONNECTION_GROUPS.length>=35);
 const grouped=new Set();
 for(const g of DEFINITION_CONNECTION_GROUPS){
  assert(g.title&&g.hub&&g.ids.includes(g.hub),"Bad group "+g.title);
  assert(g.ids.length>=3);
  assert.equal(new Set(g.ids).size,g.ids.length,"Duplicate term in "+g.title);
  for(const id of g.ids){assert(all.has(id),g.title+" invalid "+id);grouped.add(id);}
 }
 assert.deepEqual([...all].filter(id=>!grouped.has(id)),[]);
 for(const [id,links] of Object.entries(DEFINITION_CONNECTION_BRIDGES)){
  assert(all.has(id),id+" invalid bridge source");
  assert.equal(new Set(links).size,links.length,id+" duplicate bridge target");
  for(const other of links)assert(all.has(other)&&other!==id,id+" invalid bridge "+other);
 }
 assert.deepEqual(unconnectedDefinitionIds(),[]);
 for(const term of WORKSHOP_DEFINITIONS){
  const sections=relatedDefinitionSections(term.id);
  const targets=sections.flatMap(s=>s.definitions.map(d=>d.id));
  assert(sections.length>=1,term.id);
  assert(targets.length>=2,term.id+" is isolated");
  assert(targets.length<=(term.id==="sampling"?24:10),term.id+" too many links");
  assert.equal(new Set(targets).size,targets.length,term.id+" duplicate links");
  assert(!targets.includes(term.id),term.id+" self-link");
  for(const section of sections)assert(section.title&&section.definitions.length>0,term.id);
  for(const id of targets)assert(all.has(id),term.id+" links to missing "+id);
  assert.deepEqual(targets,relatedDefinitionIds(term.id));
 }
 assert.deepEqual(relatedDefinitionSections("invalid-definition"),[]);
 assert.deepEqual(relatedDefinitionIds("__proto__"),[]);
});

test("connected definitions: Sampling is a complete, grouped hub for methods, units, frame and bias",()=>{
 assert.equal(SAMPLING_HUB_SECTIONS.length,4);
 const sections=relatedDefinitionSections("sampling");
 assert.deepEqual(sections.map(x=>x.title),[
  "Start with the population and frame",
  "Compare probability sampling methods",
  "Compare non-probability sampling methods",
  "Check representativeness and bias"
 ]);
 const linked=new Set(relatedDefinitionIds("sampling"));
 for(const id of [
  "population","sample","census","sampling-unit","observational-unit","sampling-frame","sample-size",
  "probability-sampling","simple-random-sample","stratified-sample","systematic-sample","sampling-interval","cluster-sample",
  "nonprobability-sampling","convenience-sample","quota-sample","voluntary-response-sample",
  "representative-sample","selection-bias","nonresponse-bias","sampling-variability"
 ])assert(linked.has(id),"Sampling hub omits "+id);
 assert.equal(linked.size,21);
 for(const id of ["stratified-sample","systematic-sample","cluster-sample","convenience-sample","quota-sample","voluntary-response-sample"])
  assert(relatedDefinitionIds(id).includes("sampling"),id+" cannot navigate back to sampling");
 const stratified=new Set(relatedDefinitionIds("stratified-sample"));
 assert(stratified.has("sampling-frame")&&stratified.has("representative-sample"));
 const voluntary=new Set(relatedDefinitionIds("voluntary-response-sample"));
 assert(voluntary.has("selection-bias")&&voluntary.has("nonresponse-bias"));
});

test("connected definitions: other clusters link substantive nearby concepts, not fuzzy matches",()=>{
 const checks={
  "standard-deviation":["mean","interquartile-range","normal-distribution"],
  "correlation":["paired-data","spearman-rho","regression-line"],
  "residual":["residual-plot","sum-squared-errors","rmse"],
  "quadratic-roots":["quadratic-model","discriminant","vertex-form"],
  "instrument-resolution":["uncertainty","rounding-interval","repeated-measurement"],
  "voronoi-cell":["voronoi-boundary","distance-metric","perpendicular-bisector"],
  "probability-tree":["conditional-probability","joint-probability","independent-events"],
  "loan-balance":["loan-amortisation","interest-component","payment-amount"],
  "net-present-value":["present-value-finance","discount-rate","cash-inflow"],
  "mathematical-induction":["base-case","induction-hypothesis","inductive-step"],
  "bisection-method":["sign-change-bracket","bisection-error-bound","numerical-stopping-rule"]
 };
 for(const [id,expected] of Object.entries(checks)){
  const choices=relatedDefinitionIds(id);
  for(const target of expected)assert(choices.includes(target),id+" needs "+target);
 }
});

test("connected definitions: view provides clear, escaped, usable topic chips rather than dead links",()=>{
 const s=createProjectState(),u=newResourceSession(),before=authored(s);
 s.planning.fields.course="AI SL";
 const expected=authored(s);
 assert(resourceAction(s,u,"resource-workshop",{workshopRoute:"groups"}).ok);
 assert(resourceAction(s,u,"resource-workshop-term",{workshopId:"sampling"}).ok);
 const html=renderWorkshop(s,u);
 assert(html.includes('data-workshop-definition="sampling"'));
 assert(html.includes('data-workshop-related="sampling"'));
 assert.equal((html.match(/class="workshop-related-group"/g)||[]).length,4);
 for(const id of relatedDefinitionIds("sampling"))
  assert(html.includes('data-related-def-id="'+id+'"'),"Missing UI link "+id);
 assert(html.includes('data-action="resource-workshop-term"'));
 assert(html.includes("Explore this in a worked lesson"));
 assert(html.includes("Sampling fairly and recognising bias"));
 assert(!html.includes("<script"));
 assert.equal(authored(s),expected);
});

test("connected definitions: traverse, backtrack, return to a lesson and browse without modifying student work",()=>{
 const s=createProjectState(),u=newResourceSession();
 s.planning.fields.course="AA SL";
 s.entries=[{id:"real-stage",methodId:"other",status:"completed",result:"My original result"}];
 const before=authored(s);
 assert(resourceAction(s,u,"resource-workshop",{workshopRoute:"groups"}).ok);
 assert(resourceAction(s,u,"resource-workshop-term",{workshopId:"sampling"}).ok);
 assert.deepEqual(u.workshopTrail,[]);
 assert(resourceAction(s,u,"resource-workshop-term",{workshopId:"stratified-sample"}).ok);
 assert.equal(u.workshopTerm,"stratified-sample");
 assert(renderWorkshop(s,u).includes("Back to Sampling"));
 assert(resourceAction(s,u,"resource-workshop-term",{workshopId:"sampling-frame"}).ok);
 assert.equal(u.workshopTrail.length,2);
 assert(renderWorkshop(s,u).includes("Back to Stratified sample"));
 assert(resourceAction(s,u,"resource-workshop-back").ok);
 assert.equal(u.workshopTerm,"stratified-sample");
 assert(resourceAction(s,u,"resource-workshop-back").ok);
 assert.equal(u.workshopTerm,"sampling");
 assert(!resourceAction(s,u,"resource-workshop-back").ok);
 assert.equal(u.workshopTerm,"sampling");
 const beforeInvalid=u.workshopTrail.length;
 assert(!resourceAction(s,u,"resource-workshop-term",{workshopId:"missing"}).ok);
 assert.equal(u.workshopTrail.length,beforeInvalid);
 assert(resourceAction(s,u,"resource-workshop-home").ok);
 assert.equal(u.workshopTerm,"");
 assert.deepEqual(u.workshopTrail,[]);
 assert(resourceAction(s,u,"resource-workshop-lesson",{workshopId:"sampling"}).ok);
 assert(resourceAction(s,u,"resource-workshop-step",{workshopStep:"help"}).ok);
 assert(resourceAction(s,u,"resource-workshop-term",{workshopId:"sampling"}).ok);
 assert(renderWorkshop(s,u).includes("Back to Sampling fairly and recognising bias"));
 assert(resourceAction(s,u,"resource-workshop-back").ok);
 assert.equal(u.workshopId,"sampling");
 assert.equal(u.workshopStep,"help","Return preserves the user's chosen learning step");
 assert.equal(authored(s),before);
});

test("connected definitions: search and route filters still work after browsing connections",()=>{
 const s=createProjectState(),u=newResourceSession();
 assert(resourceAction(s,u,"resource-workshop",{workshopRoute:"groups"}).ok);
 assert(resourceAction(s,u,"resource-workshop-home").ok);
 assert(resourceFilter(u,"workshopQuery","systematic"));
 assert(workshopList(u).includes("Systematic sample"));
 assert(!workshopList(u).includes("Quadratic discriminant"));
 assert(resourceFilter(u,"workshopQuery",""));
 assert(resourceFilter(u,"workshopRoute","proof"));
 assert(workshopList(u).includes("Mathematical induction"));
 assert(resourceAction(s,u,"resource-workshop-term",{workshopId:"mathematical-induction"}).ok);
 assert(renderWorkshop(s,u).includes('data-related-def-id="induction-hypothesis"'));
 assert(renderWorkshop(s,u).includes('data-related-def-id="base-case"'));
});
