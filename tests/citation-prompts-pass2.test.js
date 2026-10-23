import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState} from "../src/core/project-state.js";
import {createPlanningViews} from "../src/ui/planning-views.js";
import {createCompletingViews} from "../src/completing/views.js";
import {renderFigureHandover} from "../src/diagrams/presentation-coach-view.js";
import {citationContext,renderCitationReminder} from "../src/resources/citation-prompts.js";
import {resourceById} from "../src/resources/catalog.js";
import {resourceAction} from "../src/resources/actions.js";
import {newResourceSession} from "../src/resources/state.js";
import {readFileSync} from "node:fs";

const escape=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll('"',"&quot;");
const icon=name=>'<svg data-icon="'+name+'"></svg>';
const guide='data-action="resource-open" data-resource-id="mla-citations"';
const authored=s=>JSON.stringify({planning:s.planning,completion:s.completion,entries:s.entries,project:s.project,scratch:s.scratch});
const ctx=s=>({
 getState:()=>s,e:escape,icon,tabletNav:()=>"",
 button:(label,action)=>'<button data-action="'+action+'">'+escape(label)+'</button>',
 field:(path,label)=>'<label data-path="'+escape(path)+'">'+escape(label)+'</label>',
 choose:(path,options)=>'<div>'+options.map(x=>escape(x.title)).join(", ")+'</div>',
 numberPick:()=>"",note:x=>x,
 summary:(label,value)=>'<p>'+escape(label)+": "+escape(value)+'</p>',
 helpButton:()=>"",helpBox:()=>"",
 sheetTitle:(id,label)=>'<h1>'+escape(label)+'</h1>',
 filled:value=>typeof value==="string"&&!!value.trim()
});
const planning=(s,node)=>{s.route="planning";s.ui.planningIntroSeen=true;s.planning.current=node;return createPlanningViews(ctx(s)).viewPlanning();};
const writing=(s,node)=>{s.route="completing";s.ui.writingIntroSeen=true;s.completion.current=node;return createCompletingViews(ctx(s)).viewCompleting();};
const count=(markup,needle)=>markup.split(needle).length-1;

test("Pass 2: one verified MLA guide is reused by all contextual entry points",()=>{
 assert(resourceById("mla-citations"));
 const s=createProjectState();
 const output=renderCitationReminder(s,"planning-secondary",icon,escape);
 assert.equal(count(output,guide),1);
 const before=authored(s);
 const action=resourceAction(s,newResourceSession(),"resource-open",{resourceId:"mla-citations"});
 assert.equal(action.ok,true);
 assert.equal(authored(s),before);
 assert(!output.includes("Insert bibliography automatically"));
});

test("Pass 2: Planning prompts are source-aware and sit at the original publisher fields",()=>{
 const s=createProjectState();
 let html=planning(s,"N03");
 assert.equal(count(html,'data-citation-moment="planning-choice"'),0);
 s.planning.fields.dataSource="primary";
 html=planning(s,"N03");
 assert.equal(count(html,'data-citation-moment="planning-choice"'),0);
 s.planning.fields.dataSource="both";
 html=planning(s,"N03");
 assert.equal(count(html,'data-citation-moment="planning-choice"'),1);
 assert.equal(count(html,guide),1);
 html=planning(s,"N03S");
 assert.equal(count(html,'data-citation-moment="planning-secondary"'),1);
 assert(html.indexOf("Who published the source?")<html.indexOf('data-citation-moment="planning-secondary"'));
 assert(html.indexOf('data-citation-moment="planning-secondary"')<html.indexOf("Which variables and units"));
});

test("Pass 2: Introduction has optional citation advice without claiming borrowed material was used",()=>{
 const s=createProjectState();
 let html=writing(s,"C10");
 assert.equal(count(html,'data-citation-moment="introduction"'),1);
 assert.match(html,/If your introduction uses someone else/);
 s.ui.adviceMode="reduced";
 html=writing(s,"C10");
 assert.equal(count(html,'data-citation-moment="introduction"'),0);
});

test("Pass 2: published first maths gets an MLA link even when optional advice is reduced",()=>{
 const s=createProjectState();
 s.planning.fields.dataSource="secondary";
 let html=writing(s,"C20");
 assert.equal(count(html,'data-citation-moment="first-maths"'),1);
 assert.equal(count(html,guide),1);
 s.ui.adviceMode="reduced";
 html=writing(s,"C20");
 assert.equal(count(html,'data-citation-moment="first-maths"'),1);
 assert(html.includes('data-citation-reduced="true"'));
 assert(!html.includes('class="citation-moment-detail"'));
 s.planning.fields.dataSource="primary";
 html=writing(s,"C20");
 assert.equal(count(html,'data-citation-moment="first-maths"'),0);
 s.planning.fields.dataSource="theoretical";
 html=writing(s,"C20");
 assert.equal(count(html,'data-citation-moment="first-maths"'),0);
});

test("Pass 2: source-credit advice accompanies the actual first mathematical output only if relevant",()=>{
 const s=createProjectState();
 s.entries=[{id:"first",phase:"first",kind:"scatter",status:"planned",sourceRefs:[],result:""}];
 s.completion.activeEntryIndex=0;
 let html=writing(s,"C30");
 assert.equal(count(html,'data-citation-moment="show-first"'),0);
 s.planning.fields.dataSource="secondary";
 html=writing(s,"C30");
 assert.equal(count(html,'data-citation-moment="show-first"'),1);
 assert(html.includes("Credit the data behind this mathematics"));
});

test("Pass 2: further mathematics respects stage-specific provenance and course knowledge",()=>{
 const s=createProjectState();
 s.entries=[
  {id:"first",phase:"first",status:"completed",kind:"scatter",result:"Observed curved pattern"},
  {id:"second",phase:"substantial",status:"planned",kind:"other",fromEntryId:"first",
   knowledge:"syllabus",sourceRefs:[],researchSource:"",result:""}
 ];
 s.completion.activeEntryIndex=1;
 s.planning.fields.dataSource="secondary"; // planning alone is NOT evidence that stage two uses it
 let html=writing(s,"C40");
 assert.equal(count(html,'data-citation-moment="mathematical-stage"'),0);
 s.entries[1].knowledge="outside";
 html=writing(s,"C40");
 assert.equal(count(html,'data-citation-moment="mathematical-stage"'),1);
 assert(html.includes("Credit what this stage borrows"));
 s.entries[1].knowledge="syllabus";
 s.entries[1].researchSource="Book consulted for a particular derivation";
 html=writing(s,"C40");
 assert.equal(count(html,'data-citation-moment="mathematical-stage"'),1);
 s.entries[1].researchSource="";
 s.completion.sourceRecords=[{id:"dataset2",fields:{actualSourceType:"secondary",sourceCitation:"Original dataset B"}}];
 s.entries[1].sourceRefs=["dataset2"];
 html=writing(s,"C50");
 assert.equal(count(html,'data-citation-moment="mathematical-stage"'),1);
 s.ui.adviceMode="reduced";
 html=writing(s,"C50");
 assert(html.includes('data-citation-reduced="true"'));
 assert(!html.includes('class="citation-moment-detail"'));
});

test("Pass 2: newly learned maths has citation guidance but routine course maths is not treated as externally sourced",()=>{
 const s=createProjectState();
 s.entries=[{id:"later",phase:"substantial",knowledge:"outside",sourceRefs:[],status:"planned"}];
 s.completion.activeEntryIndex=0;
 let html=writing(s,"C40L");
 assert.equal(count(html,'data-citation-moment="unfamiliar-maths"'),1);
 s.entries[0].knowledge="syllabus";
 html=writing(s,"C40L");
 assert.equal(count(html,'data-citation-moment="unfamiliar-maths"'),0);
});

test("Pass 2: all seven figure handovers cite published inputs only, without modifying generated captions",()=>{
 const s=createProjectState(),types=["graph","stat","table","trace","voronoi","geometry","probability"];
 for(const type of types){
  const d={sourceKind:"secondary",sourceText:"Original publisher",sourceCredit:"Original publisher",title:"A sourced figure"};
  const before=authored(s),html=renderFigureHandover(s,type,d,icon,escape);
  assert.equal(count(html,'data-citation-moment="figure"'),1,type);
  assert.equal(count(html,guide),1,type);
  assert(html.indexOf("Copy label and source")<html.indexOf('data-citation-moment="figure"'),type);
  assert(html.includes("not itself a complete MLA citation"),type);
  assert.equal(authored(s),before,type);
  s.ui.adviceMode="reduced";
  const quiet=renderFigureHandover(s,type,d,icon,escape);
  assert.equal(count(quiet,'data-citation-moment="figure"'),1,type);
  assert.equal(count(quiet,guide),1,type);
  assert(!quiet.includes('class="citation-moment-detail"'),type);
  for(const origin of ["primary","theoretical","unsure"]){
   d.sourceKind=origin;
   const without=renderFigureHandover(s,type,d,icon,escape);
   assert.equal(count(without,'data-citation-moment="figure"'),0,type+" "+origin);
  }
  s.ui.adviceMode="guided";
 }
});

test("Pass 2: citations are prompts, never an automatic bibliography, assessment mark, or student-authored text",()=>{
 const s=createProjectState(),before=authored(s);
 s.planning.fields.dataSource="secondary";
 const afterSource=authored(s);
 for(const moment of ["planning-choice","planning-secondary","introduction","first-maths","show-first","mathematical-stage","unfamiliar-maths","figure"])
  renderCitationReminder(s,moment,icon,escape,{entry:{knowledge:"mixed"},draft:{sourceKind:"secondary"}});
 assert.equal(authored(s),afterSource);
 assert.notEqual(afterSource,before);
 assert.equal(citationContext(s,"not-a-valid-moment"),null);
 const css=readFileSync(new URL("../data/mla-citations.css",import.meta.url),"utf8");
 assert(css.includes("data-citation-reduced"));
 assert(css.includes("@media(max-width:480px)"));
});
