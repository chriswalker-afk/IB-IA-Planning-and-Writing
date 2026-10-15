import test from "node:test";
import assert from "node:assert/strict";
import {createProjectState,normalizeProjectState} from "../src/core/project-state.js";
import {applyPlanningField} from "../src/planning/engine.js";
import {setCompletionNode,setCompletionField,addAccuracyDecision,actualPmccExists} from "../src/completing/engine.js";
import {WRITING_MOMENTS,MATHS_GUIDANCE,LIMITATION_GUIDANCE,BIVARIATE_GUIDANCE} from "../src/completing/guidance-catalog.js";
import {eligibleWritingCues,currentWritingCue} from "../src/completing/writing-guidance.js";
import {actOnWritingCue,writingCueStatus,quietAutoWritingCue} from "../src/completing/guidance-actions.js";
import {relevantLimitations,selectLimitation,recordLimitation,confirmedLimitationsForConclusion,limitationContextKey} from "../src/completing/limitation-guidance.js";
import {relevantMathsGuidance} from "../src/completing/maths-guidance.js";
import {relevantBivariateOptions} from "../src/completing/bivariate-guidance.js";
import {guidanceContext,familyOf} from "../src/completing/guidance-context.js";
import {createGuidanceViews} from "../src/completing/guidance-views.js";

const create=()=>{const s=createProjectState();applyPlanningField(s,"course","AI SL");applyPlanningField(s,"aim","How does the evidence answer my question?");return s};
const entry=(s,p={})=>{
 const e={id:"math"+(s.entries.length+1),phase:"substantial",status:"planned",title:"Mathematics",
  technique:"",methodId:"",knowledge:"unsure",purpose:"An aim-linked question",
  kind:"",result:"",observation:"",interpretation:"",localTakeaway:"",accuracyRef:"",...p};
 s.entries.push(e);s.completion.activeEntryIndex=s.entries.length-1;return e;
};
const realScatter=s=>{
 const e=entry(s,{phase:"first",kind:"scatter",title:"My actual scatter",status:"completed",result:"Observed scatter plot",
  observation:"curved",localTakeaway:"Actual points bend",purpose:"Understand the pattern"});
 s.completion.nextFromEntryId=e.id;
 return e;
};
test("phase 5 catalog preserves every sheet reference, with exact source row provenance",()=>{
 for(const [records,expected,prefix] of [
  [WRITING_MOMENTS,66,"W"],[MATHS_GUIDANCE,30,"M"],[LIMITATION_GUIDANCE,38,"L"],[BIVARIATE_GUIDANCE,12,"B"]]){
  assert.equal(records.length,expected);
  assert.equal(new Set(records.map(x=>x.id)).size,expected);
  for(const x of records){assert(x.id.startsWith(prefix));assert(Number.isInteger(x.sourceRow)&&x.sourceRow>=8); }
 }
});
test("planned PMCC and a prediction cannot trigger actual-result writing or regression limitations",()=>{
 const s=create();
 applyPlanningField(s,"prediction","It might be a strong straight-line relationship");
 s.planning.mathSelected=["AI15"];
 const e=entry(s,{methodId:"pmcc",technique:"Pearson correlation",status:"planned",purpose:"Quantify linear association"});
 setCompletionNode(s,"C40");
 assert.equal(actualPmccExists(s),false);
 assert(!eligibleWritingCues(s).some(x=>["W16","W18","W23","W53"].includes(x.id)));
 assert(!relevantLimitations(s).some(x=>["L12","L13","L14"].includes(x.id)));
});
test("purpose is prompted BEFORE a genuine first graph and interpretation only AFTER actual evidence",()=>{
 const s=create();
 const first=entry(s,{phase:"first",purpose:"Find out whether observations curve"});
 setCompletionNode(s,"C32");
 assert(eligibleWritingCues(s).some(x=>x.id==="W14"));
 assert(!eligibleWritingCues(s).some(x=>x.id==="W16"));
 setCompletionNode(s,"C34");
 assert(!eligibleWritingCues(s).some(x=>x.id==="W16"));
 first.status="completed";first.result="The graph bends";first.kind="scatter";
 assert(eligibleWritingCues(s).some(x=>x.id==="W16"));
 setCompletionNode(s,"C34B");
 assert(eligibleWritingCues(s).some(x=>x.id==="W18"));
});
test("theoretical investigations never impose a compulsory prediction or pretend sampling task",()=>{
 const s=create();applyPlanningField(s,"kind","theoretical");
 applyPlanningField(s,"motivation","A pattern I noticed in integer sequences");
 applyPlanningField(s,"prediction","A conjecture I may check");
 setCompletionNode(s,"C10");
 assert(eligibleWritingCues(s).some(x=>x.id==="W01"));
 assert(!eligibleWritingCues(s).some(x=>x.id==="W02"));
 setCompletionNode(s,"C23");
 assert.equal(relevantLimitations(s).length,0);
});
test("already covered, not relevant, deferred and saved-note statuses suppress repetition until relevant context changes",()=>{
 const s=create();applyPlanningField(s,"motivation","Personal interest in comparing patterns");
 setCompletionNode(s,"C10");
 const cue=currentWritingCue(s);assert.equal(cue.id,"W01");
 assert(actOnWritingCue(s,{id:cue.id,key:cue.key,action:"covered-start"}).ok);
 assert.equal(s.writingLedger[cue.key],undefined);
 s.completion.guidanceUi.locationDraft="Introduction, paragraph 1";
 let result=actOnWritingCue(s,{id:cue.id,key:cue.key,action:"covered"});
 assert(result.ok);
 assert.equal(result.record.status,"already-covered");
 assert.equal(result.record.location,"Introduction, paragraph 1");
 assert.equal(result.record.claimedInIA,true);
 assert(quietAutoWritingCue(s,"C10"));
 assert(!eligibleWritingCues(s).some(x=>x.key===cue.key));
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.equal(restored.writingLedger[cue.key].status,"already-covered");
 applyPlanningField(restored,"aim","I now aim to model a different quantity");
 assert.equal(quietAutoWritingCue(restored,"C10"),false);
 assert(eligibleWritingCues(restored,"C10").some(x=>x.id==="W01"));
});
test("saving a private cue thought never claims the original Word/Google Doc was edited",()=>{
 const s=create(),e=entry(s,{phase:"first",purpose:"Look for a curve"});
 setCompletionNode(s,"C32");
 const cue=eligibleWritingCues(s).find(x=>x.id==="W14");assert(cue);
 actOnWritingCue(s,{id:cue.id,key:cue.key,action:"write-now"});
 s.completion.guidanceUi.noteDraft="I need to explain why these axes are relevant.";
 const saved=actOnWritingCue(s,{id:cue.id,key:cue.key,action:"save-note"});
 assert(saved.ok);assert.equal(saved.record.status,"noted");
 assert.equal(saved.record.claimedInIA,false);
 assert(!eligibleWritingCues(s).some(x=>x.key===cue.key));
});
test("source limitations appear only with evidence of actual, appropriately staged methods",()=>{
 const s=create();applyPlanningField(s,"kind","statistics");
 setCompletionField(s,"dataStatus","not-started");
 setCompletionField(s,"samplingMethod","Convenience sample");
 setCompletionField(s,"statisticalPopulation","All of Year 12");
 setCompletionNode(s,"C23");
 assert(!relevantLimitations(s).some(x=>x.id==="L01"));
 setCompletionField(s,"dataStatus","ready");
 assert(relevantLimitations(s).some(x=>x.id==="L01"));
 assert(!relevantLimitations(s).some(x=>x.id==="L12")); // Not at collection.
 const planned=entry(s,{methodId:"pmcc",technique:"Pearson PMCC",status:"planned"});
 setCompletionNode(s,"C40");
 assert(!relevantLimitations(s).some(x=>x.id==="L12"));
 planned.status="completed";planned.result="r = -0.18";
 assert(relevantLimitations(s).some(x=>x.id==="L12"));
 assert(!relevantLimitations(s).some(x=>x.id==="L13")); // Not a fitted line.
});
test("recording a suggested limitation requires student-confirmed fact and actual consequence",()=>{
 const s=create();applyPlanningField(s,"kind","statistics");
 setCompletionField(s,"dataStatus","ready");
 setCompletionField(s,"samplingMethod","Volunteer respondents");
 setCompletionField(s,"statisticalPopulation","Students in the school");
 setCompletionNode(s,"C23");
 assert(selectLimitation(s,"L01").ok);
 assert.equal(recordLimitation(s).ok,false);
 s.completion.limitationDraft.explanation="Respondents volunteered rather than being selected from every year.";
 assert.equal(recordLimitation(s).ok,false);
 s.completion.limitationDraft.consequence="Any calculated proportion describes this group, not necessarily all students.";
 s.completion.limitationDraft.location="Methods paragraph after the sampling procedure";
 const result=recordLimitation(s);assert(result.ok);
 assert.equal(s.completion.confirmedLimitations.length,1);
 assert.equal(result.record.sourceId,"L01");
 assert.equal(result.record.entryId,"");
 assert(confirmedLimitationsForConclusion(s).some(x=>x.consequence.includes("proportion")));
 assert.equal(s.scratch.conclusion,""); // Never ghostwrite.
});
test("modelling/proof/accuracy limitations match the active realised method, not all future routes",()=>{
 const s=create();applyPlanningField(s,"kind","modelling");
 const model=entry(s,{methodId:"optimisation",status:"completed",result:"An actual stationary point is x=3"});
 setCompletionNode(s,"C50");
 assert(relevantLimitations(s).some(x=>x.id==="L28"));
 assert(!relevantLimitations(s).some(x=>["L12","L17","L26"].includes(x.id)));
 model.methodId="quadratic-fit";model.result="A fitted quadratic from actual measured observations";
 setCompletionField(s,"dataStatus","ready");
 assert(relevantLimitations(s).some(x=>x.id==="L26"));
 assert(!relevantLimitations(s).some(x=>x.id==="L28"));
});
test("bivariate choices require a real plotted scatter AND student-confirmed paired numerical observations",()=>{
 const s=create();const scatter=realScatter(s);
 setCompletionNode(s,"C35B");
 assert.equal(relevantBivariateOptions(s).length,0);
 setCompletionField(s,"pairedDataType","categorical");
 assert.deepEqual(relevantBivariateOptions(s).map(x=>x.id),["B11"]);
 setCompletionField(s,"pairedDataType","paired-numerical");
 setCompletionField(s,"scatterPattern","curved");
 setCompletionField(s,"scatterDetail","monotonic");
 const ids=relevantBivariateOptions(s).map(x=>x.id);
 assert(ids.includes("B03"));assert(!ids.includes("B04"));
 assert(relevantBivariateOptions(s).find(x=>x.id==="B03").reason.includes("Spearman"));
 setCompletionField(s,"scatterDetail","turning");
 const turns=relevantBivariateOptions(s);
 assert(turns.some(x=>x.id==="B04"));
 assert(!turns.some(x=>/Spearman/i.test(x.reason))); // Do not propose Spearman for reversing curves.
});
test("near-perfect lines never require Pearson and an inconclusive plot permits a limited conclusion",()=>{
 const s=create();realScatter(s);setCompletionNode(s,"C35B");
 setCompletionField(s,"pairedDataType","paired-numerical");
 setCompletionField(s,"scatterPattern","linear");
 setCompletionField(s,"scatterDetail","near-perfect");
 let options=relevantBivariateOptions(s);
 assert(options.some(x=>x.id==="B01"));assert(options.find(x=>x.id==="B01").reason.includes("very little"));
 setCompletionField(s,"scatterDetail","unclear");
 options=relevantBivariateOptions(s);
 assert(options.some(x=>x.id==="B05"));
 assert(options.some(x=>/cautious|no more/i.test(x.question+" "+x.reason)));
});
test("real weak Pearson's r in a linked curved scatter prompts nonlinear caution without inventing a fit",()=>{
 const s=create(),scatter=realScatter(s);
 const r=entry(s,{fromEntryId:scatter.id,methodId:"pmcc",status:"completed",result:"r = 0.05"});
 setCompletionNode(s,"C35P");s.completion.nextFromEntryId=r.id;
 setCompletionField(s,"pairedDataType","paired-numerical");
 setCompletionField(s,"scatterPattern","curved");
 setCompletionField(s,"scatterDetail","monotonic");
 setCompletionField(s,"pmccSignal","weak-linear");
 const options=relevantBivariateOptions(s);
 assert(options.some(x=>x.id==="B09"));
 assert(options.some(x=>x.id==="B12"));
 assert(!options.some(x=>/proves|causes/.test(x.question)));
});
test("within-course mathematics never receives out-of-course exposition; mixed and outside methods do",()=>{
 const s=create();const e=entry(s,{status:"completed",result:"A genuine model result",methodId:"exponential",knowledge:"syllabus"});
 setCompletionNode(s,"C40");
 assert(eligibleWritingCues(s).some(x=>x.id==="W59"));
 assert(!eligibleWritingCues(s).some(x=>["W60","W61"].includes(x.id)));
 e.knowledge="outside";
 assert(eligibleWritingCues(s).some(x=>x.id==="W60"));
 assert(relevantMathsGuidance(s).some(x=>x.id==="M21"));
 e.knowledge="mixed";
 assert(eligibleWritingCues(s).some(x=>x.id==="W61"));
 assert(!eligibleWritingCues(s).some(x=>x.id==="W60"));
 e.knowledge="unsure";setCompletionNode(s,"C40D");
 assert(eligibleWritingCues(s).some(x=>x.id==="W62"));
 assert(relevantMathsGuidance(s).some(x=>x.id==="M23"));
});
test("mathematical learning insight is not invented merely by performing a routine calculation",()=>{
 const s=create(),e=entry(s,{status:"completed",result:"Actual symbolic result",knowledge:"syllabus"});
 setCompletionNode(s,"C34B");
 assert(!eligibleWritingCues(s).some(x=>x.id==="W64"));
 e.mathsInsight="I discovered a connection between the general algebraic form and a limiting case";
 assert(eligibleWritingCues(s).some(x=>x.id==="W64"));
});
test("accuracy decisions are reused selectively, and revising a quantity flags only dependent maths",()=>{
 const s=create();setCompletionNode(s,"C24");
 setCompletionField(s,"accuracyQuantity","Time");
 setCompletionField(s,"accuracySymbol","t");
 setCompletionField(s,"accuracyUnit","s");
 setCompletionField(s,"accuracyResolution","Nearest 0.1 s from source");
 setCompletionField(s,"accuracyPolicy","Final rate rounded to a defensible precision");
 assert(addAccuracyDecision(s).ok);
 const id=s.completion.accuracyDecisions[0].id;
 const affected=entry(s,{status:"completed",result:"Speed = 14.3 m/s",methodId:"rates-from-data",accuracyRef:id});
 const unrelated=entry(s,{status:"completed",result:"Separate exact identity",methodId:"algebra",accuracyRef:""});
 setCompletionNode(s,"C24");
 setCompletionField(s,"accuracyQuantity","Time");
 setCompletionField(s,"accuracySymbol","t");
 setCompletionField(s,"accuracyUnit","milliseconds");
 setCompletionField(s,"accuracyResolution","Nearest millisecond from revised source");
 setCompletionField(s,"accuracyPolicy","Revisit final rate units");
 assert(addAccuracyDecision(s).ok);
 assert.equal(s.completion.accuracyDecisions.length,1);
 assert.equal(s.completion.accuracyDecisions[0].id,id);
 assert.equal(affected.reviewNeeded,"yes");
 assert.equal(unrelated.reviewNeeded,undefined);
 assert.equal(s.completion.guidanceUi.accuracyChanged,true);
 assert(eligibleWritingCues(s).some(x=>x.id==="W57"));
});
test("all guidance state is preserved in a full JSON project backup without asserting that notes were added to the IA",()=>{
 const s=create();applyPlanningField(s,"motivation","My chosen reason");setCompletionNode(s,"C10");
 const cue=currentWritingCue(s);
 actOnWritingCue(s,{id:cue.id,key:cue.key,action:"defer"});
 s.completion.guidanceUi.limitsExpanded=true;
 s.completion.confirmedLimitations.push({id:"lim-1",sourceId:"student",stage:"C23",entryId:"",
  explanation:"One source changed its variable definition",consequence:"Comparisons across years may be invalid",
  mitigation:"Kept to comparable years",location:"Methods",at:"2026-10-15"});
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.equal(restored.writingLedger[cue.key].status,"deferred");
 assert.equal(restored.completion.confirmedLimitations[0].consequence,"Comparisons across years may be invalid");
 assert.equal(restored.completion.guidanceUi.limitsExpanded,true);
});

test("verified secondary-source writing appears only when that source is actually being used and cited",()=>{
 const s=create();applyPlanningField(s,"kind","statistics");
 applyPlanningField(s,"dataSource","secondary");
 applyPlanningField(s,"secondaryVerified","verified");
 setCompletionNode(s,"C20");
 setCompletionField(s,"dataStatus","candidate");
 setCompletionField(s,"actualSource","A tentative dataset");
 setCompletionField(s,"sourceCitation","Publisher name and URL");
 assert(!eligibleWritingCues(s).some(x=>x.id==="W08"));
 setCompletionField(s,"dataStatus","ready");
 assert(eligibleWritingCues(s).some(x=>x.id==="W08"));
 setCompletionField(s,"actualSource","");
 assert(!eligibleWritingCues(s).some(x=>x.id==="W08"));
});
test("real technology support does not bleed into an unrelated later calculation",()=>{
 const s=create();
 const first=entry(s,{methodId:"quadratic-fit",status:"completed",result:"Model result"});
 setCompletionNode(s,"C40T");
 setCompletionField(s,"technologyTool","Spreadsheet regression");
 setCompletionField(s,"technologyInput","Real measured observations");
 setCompletionField(s,"technologyOutcome","Quadratic fit parameters");
 assert.equal(s.completion.fields.technologyForEntryId,first.id);
 assert(relevantMathsGuidance(s).some(x=>x.id==="M06"));
 const next=entry(s,{methodId:"algebra",status:"completed",result:"Exact symbolic result"});
 setCompletionNode(s,"C40T");
 assert(!relevantMathsGuidance(s).some(x=>x.id==="M06"));
 assert(!eligibleWritingCues(s).some(x=>x.id==="W22"));
});
test("changing a recorded source after completing maths flags dependent results but preserves their conclusions",()=>{
 const s=create();setCompletionField(s,"dataStatus","ready");
 setCompletionField(s,"actualSource","Measured height data from an authorised survey");
 const result=entry(s,{status:"completed",kind:"model",methodId:"linear-regression",
  result:"A fitted equation",interpretation:"A justified restricted-domain conclusion"});
 s.completion.stages.C40="complete";
 setCompletionField(s,"actualSource","Corrected dataset with different variable definitions");
 assert.equal(result.reviewNeeded,"yes");
 assert.equal(s.completion.stages.C40,"needs-review");
 assert.equal(result.result,"A fitted equation");
 assert.equal(result.interpretation,"A justified restricted-domain conclusion");
});
test("measured-geometry limitations require a relevant measured length, not arbitrary precision metadata",()=>{
 const s=create();applyPlanningField(s,"kind","modelling");
 entry(s,{methodId:"geometric-model",status:"completed",result:"Area calculation",kind:"model"});
 setCompletionNode(s,"C40");
 s.completion.accuracyDecisions=[{id:"a1",quantity:"Temperature",unit:"C",resolution:"1 C",policy:"Nearest degree"}];
 assert(!relevantLimitations(s).some(x=>x.id==="L24"));
 s.completion.accuracyDecisions.push({id:"a2",quantity:"Measured width",unit:"cm",resolution:"0.1 cm",policy:"Justified"});
 assert(!relevantLimitations(s).some(x=>x.id==="L24"));
 s.entries.at(-1).accuracyRefs=["a2"];
 assert(relevantLimitations(s).some(x=>x.id==="L24"));
});
test("course-level-only work is a student-declared condition, not inferred from 'other' technique names",()=>{
 const s=create(),e=entry(s,{methodId:"other",knowledge:"unsure",status:"completed",result:"A genuine expression"});
 setCompletionNode(s,"C40D");
 assert(!relevantMathsGuidance(s).some(x=>x.id==="M12"));
 e.priorLearningOnly="yes";
 assert(relevantMathsGuidance(s).some(x=>x.id==="M12"));
});

test("the UI shows one useful writing moment by default even when multiple moments are eligible",()=>{
 const s=create();const first=entry(s,{phase:"first",kind:"scatter",status:"completed",result:"A real curved plot",observation:"curved"});
 setCompletionNode(s,"C34B");
 const escape=v=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
 const views=createGuidanceViews({getState:()=>s,e:escape,icon:()=>"",
  field:(path,label)=>'<label data-path="'+escape(path)+'">'+escape(label)+'</label>',
  choose:()=>'<p>Choice</p>'});
 let html=views.writingMoment("C34B");
 assert.equal((html.match(/data-writing-cue=/g)||[]).length,1);
 assert(html.includes("Other relevant advice"));
 assert(!html.includes("guidance-other-button")); // optional extras remain collapsed
 const one=currentWritingCue(s);
 actOnWritingCue(s,{id:one.id,key:one.key,action:"not-relevant"});
 html=views.writingMoment("C34B");
 assert(!html.includes('data-writing-cue="'));
 assert(html.includes("Review optional writing guidance"));
});
test("potential limitations never expand or diagnose themselves without a student action",()=>{
 const s=create();applyPlanningField(s,"kind","statistics");
 setCompletionField(s,"dataStatus","ready");
 setCompletionField(s,"statisticalPopulation","Year 13 students");
 setCompletionField(s,"samplingMethod","Volunteer convenience sample");
 setCompletionField(s,"actualMethod","Survey questionnaire");
 setCompletionField(s,"dataCleaning","Missing response fields were excluded");
 setCompletionNode(s,"C23");
 const views=createGuidanceViews({getState:()=>s,e:x=>String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;"),icon:()=>"",
  field:(path,label)=>'<label>'+label+'</label>',choose:()=>'<p>choice</p>'});
 let html=views.limitsHelp("C23");
 assert(html.includes("Would any mathematical limitation actually matter here?"));
 assert(!html.includes("guidance-limit-option"));
 s.completion.guidanceUi.limitsExpanded=true;
 html=views.limitsHelp("C23");
 assert((html.match(/class="guidance-limit-option"/g)||[]).length<=3);
 assert.equal(s.completion.confirmedLimitations.length,0);
});
test("student-authored results are escaped before inserting into an example or contextual advice panel",()=>{
 const s=create();entry(s,{phase:"first",status:"completed",result:"<script>alert(1)</script>",kind:"scatter"});
 setCompletionNode(s,"C34B");
 const views=createGuidanceViews({getState:()=>s,
  e:x=>String(x??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),
  icon:()=>"",field:()=>"",choose:()=>""});
 const html=views.writingMoment("C34B");
 assert(!html.includes("<script>"));
});
