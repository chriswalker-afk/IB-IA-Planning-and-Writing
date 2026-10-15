import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createProjectState,normalizeProjectState,STORAGE_KEY} from "../src/core/project-state.js";
import {createSamplePreview} from "../src/core/sample-preview.js";
import {createIllustrativeSample,SAMPLE_CHOICES,lineSummary,exponentialSummary} from "../src/core/illustrative-samples.js";
import {modelFromFullProject} from "../src/handover/full-project-model.js";
import {createFullProjectExport} from "../src/handover/full-export.js";
import {createPlanningEnvelope} from "../src/handover/schema.js";
import {modelFromEnvelope} from "../src/handover/report-model.js";

const all=SAMPLE_CHOICES.map(x=>x.id);
const filled=value=>typeof value==="string"&&value.trim().length>0;
const planning=[
 "planIdentifier","idea","interest","aim","motivation","beneficiaryType","beneficiary","intendedUse",
 "kind","course","prediction","predictionWhy","predictionImplication","predictionExploration",
 "courseSuitability","suitabilityWhy","mathsWhy","practicalEase","easeImprovement","dependencies",
 "permissionNeed","softwareReady","cleaningBurden","minimumVersion","backupMethod",
 "figureType","figurePurpose","firstAction","firstAccuracy","changeTrigger","changeAdaptation",
 "fallbackEvidence","teacherNeed","teacherQuestion","teacherSafeAction",
 "timelineWeeks","timelineEarly","timelineStart","milestonePlan","milestoneData","milestoneFirstVisual",
 "milestoneVisualReview","milestoneFirstMath","milestoneFurtherMath","milestoneDraft","milestoneReview"
];
const studio=[
 "changedSincePlanning","permissionStatus","dataStatus","dataAimLink","dataStatusSummary",
 "firstType","firstPurpose","firstDefinitions","firstPresentation","firstResultSummary",
 "firstObservedFeature","firstInterpretation","accuracyForResult","aimLinkedResult",
 "predictionComparison","benefitFinding","nextQuestion","nextMethod","nextReason",
 "nextLocation","variableDefinitions","specialistTerms","sourceReferences",
 "mainConclusion","conclusionEvidence","conclusionUncertainty","conclusionBenefit",
 "conclusionAdvice","conclusionExtension","conclusionFocus","notationIssue",
 "presentationIssue","referencesIssue","draftComplete","draftCriteria",
 "finalCriteria","finalProofread","finalRequirements","nextStepSelected"
];
const empirical=[
 "statisticsContext","dataSource","secondaryPublisher","secondaryVariables","secondaryScope",
 "secondaryVerified","secondaryStatus","dataAvailability","dataReadiness","methodReason",
 "methodLimitation","methodMitigation","sourceRights"
];
const actualEmpirical=[
 "actualSourceType","actualSource","sourceCitation","actualMethod","sourcePopulation",
 "dataCount","collectionStatus","statisticalPopulation","sampleOrCensus","samplingMethod",
 "samplingRationale","sampleSize","pairing","responseBias","dataCleaning",
 "modelEvidence","modelInputs","modelAssumptions","modelDomain","modelValidation",
 "modelAlternative","modelSensitivity","actualDate","alternativeMethod",
 "chosenMethod","methodReason","methodLimitation","limitationConsequence","limitationMitigation",
 "limitationAcceptable","accuracyQuantity","accuracySymbol","accuracyUnit",
 "accuracyResolution","accuracyPolicy","accuracyReason","accuracyDataType",
 "scatterPattern","scatterDetail","pairedDataType","scatterAimRelevance",
 "pmccInterpretation","technologyTool","technologyForEntryId","technologyInput",
 "technologyOutcome","technologyInterpretation","courseLevel","courseWhy","mathsLearning"
];
const theoryPlan=["theoreticalAim","theoreticalCase","theoreticalPrediction","theoreticalWhy","otherCourseMaths"];
const actualTheory=["actualSourceType","actualSource","actualMethod","theoreticalObject",
 "theoreticalCase","theoreticalAssumptions","theoreticalQuestion","chosenMethod",
 "methodReason","methodLimitation","limitationConsequence","limitationMitigation",
 "limitationAcceptable","courseLevel","courseWhy","researchedMethod",
 "researchedUnderstanding","mathsLearning"];
const entryFields=[
 "title","purpose","technique","methodId","kind","status","result","resultRef",
 "observationText","interpretation","localTakeaway","limitations","nextQuestion",
 "nextWhy","bridge","mathsInsight"
];
test("the five sample choices have distinct and coherent complete Planning + Studio records",()=>{
 assert.deepEqual(all,["linear","curved","unclear","unexpected","theory"]);
 assert(new Set(SAMPLE_CHOICES.map(x=>x.title)).size===5);
 for(const kind of all){
  const state=createIllustrativeSample(kind,{today:"2026-10-15"});
  const pf=state.planning.fields,cf=state.completion.fields,theory=kind==="theory";
  for(const key of [...planning,...(theory?theoryPlan:empirical)])
   assert(filled(pf[key]),kind+" missing appropriate Planning field "+key);
  for(const key of [...studio,...(theory?actualTheory:actualEmpirical)])
   assert(filled(cf[key]),kind+" missing applicable Studio field "+key);
  for(const key of ["introduction","dataNotes","conclusion","finalReview"])
   assert(state.scratch[key].length>170,kind+" missing substantive "+key+" writing notes");
  assert.equal(state.demo,kind);assert.equal(state.route,"completing");
  assert.equal(state.completion.current,"C34B");assert.equal(state.completion.activeEntryIndex,0);
  assert.equal(state.planning.completed,true);
  assert.equal(state.entries.length,3);
  assert.equal(state.entries[0].phase,"first");
  assert(state.entries.slice(1).every(x=>x.phase==="substantial"));
  assert(state.entries.every(x=>x.status==="completed"&&filled(x.result)));
  for(const entry of state.entries)
   for(const key of entryFields)assert(filled(entry[key]),kind+" "+entry.id+" missing "+key);
  for(let i=1;i<3;i++) {
   assert.equal(state.entries[i].fromEntryId,state.entries[i-1].id);
   assert(filled(state.entries[i].previousTakeaway));
   assert(state.entries[i].bridge.length>50);
  }
  assert(state.entries[2].nextQuestion.length>35);
  for(const id of ["C10","C20","C30","C40","C60","C70"])
   assert.equal(state.completion.stages[id],"complete",kind+" incomplete fictional example section "+id);
  assert.equal(state.completion.stages.C80,"working");
  assert.equal(state.completion.stages.C90,"not-started");
  assert.equal(state.teacher.feedbackStatus,"not-requested");
  assert.equal(state.teacher.pendingApproval,false);
  assert.equal(state.teacher.checkpoints.length,0);
  assert.equal(pf.milestoneSchoolFinal,"");
  assert.equal(pf.milestoneSchoolDraft,"");
  assert.equal(state.project.documentUrl,"");
  assert.equal(state.ideaExplorer.shortlist.length,1);
  for(const mode of ["draft","final"])for(const id of ["D02","D03","D04","D05","D06"]){
   const v=state.completion.review.records[mode+"-"+id];
   assert(v&&filled(v.location)&&filled(v.note)&&filled(v.action),kind+" missing "+mode+" review notes "+id);
   assert.equal(v.status,"unchecked");assert.equal(v.selfMark,"");assert.equal(v.markLevel,"");
  }
  assert.deepEqual(state.completion.review.feedbackItems,[]);
  if(theory){
   assert.equal(pf.dataSource,"");
   assert.equal(cf.dataStatus,"theoretical");
   assert.equal(state.completion.sourceRecords.length,0);
   assert.equal(state.completion.accuracyDecisions.length,0);
   assert(state.entries.every(x=>x.sourceRefs.length===0&&x.accuracyRefs.length===0));
  }else{
   assert.equal(state.completion.sourceRecords.length,1);
   assert.equal(state.completion.accuracyDecisions.length,1);
   assert.equal(state.completion.confirmedLimitations.length,1);
   const src=state.completion.sourceRecords[0],accuracy=state.completion.accuracyDecisions[0];
   assert.equal(accuracy.sourceId,src.id);
   assert(state.entries.every(x=>x.sourceRefs.includes(src.id)&&x.accuracyRefs.includes(accuracy.id)));
   assert.equal(state.completion.confirmedLimitations[0].entryId,state.entries[2].id);
   assert(/fictional|invented|constructed|synthetic/i.test(cf.actualSource));
   assert(/no real publication/i.test(cf.sourceCitation));
   assert(/not instrument precision|NOT measurement precision/i.test(cf.accuracyResolution));
   assert(pf.secondaryPublisher.includes("No publisher"));
  }
  const restored=normalizeProjectState(JSON.parse(JSON.stringify(state)));
  assert.equal(restored.entries.length,3);
  assert.equal(restored.entries[1].fromEntryId,state.entries[0].id);
  assert.equal(restored.scratch.conclusion,state.scratch.conclusion);
  assert.equal(restored.planning.fields.timelineWeeks,"8");
  assert.equal(restored.completion.review.records["draft-D06"].note,
   state.completion.review.records["draft-D06"].note);
  assert.equal(restored.project.aim,state.planning.fields.aim);
 }
});
test("sample reports contain the actual mathematical sequence, conclusions and evidence notes",()=>{
 for(const kind of all){
  const state=createIllustrativeSample(kind,{today:"2026-10-15"});
  const plan=modelFromEnvelope(createPlanningEnvelope(state)),full=modelFromFullProject(state);
  const text=full.sections.flatMap(s=>s.rows.map(x=>x.value)).join("\n");
  assert(plan.sections.some(s=>s.title.includes("Timeline")));
  assert(full.sections.some(s=>s.title.includes("Planning · Timeline")));
  assert(text.includes(state.entries[0].result),kind+" lost initial result in report");
  assert(text.includes(state.entries[1].result),kind+" lost second result in report");
  assert(text.includes(state.entries[2].result),kind+" lost third result in report");
  assert(text.includes(state.scratch.conclusion));
  assert(text.includes(state.completion.review.records["draft-D06"].note));
  assert(full.isDemonstration);
  assert(/sample|fictional|demonstration/i.test(full.status));
 }
});
test("linear statistics and curved fitted mathematics agree numerically with all six displayed points",()=>{
 const input={
  linear:[352,329,307,283,260,238],
  curved:[370,322,293,276,266,259],
  unclear:[300,270,335,285,320,290],
  unexpected:[354,329,307,390,260,243]
 };
 const bounds={
  linear:{r:-.99994,slope:-22.8857},
  curved:{r:-.94213,slope:-21.1429},
  unclear:{r:.11194,slope:1.42857},
  unexpected:{r:-.64963,slope:-19.4}
 };
 for(const [kind,y] of Object.entries(input)){
  const data=createIllustrativeSample(kind),fit=lineSummary([4,5,6,7,8,9],y);
  assert(Math.abs(fit.r-bounds[kind].r)<.00001,kind+" incorrect Pearson r");
  assert(Math.abs(fit.slope-bounds[kind].slope)<.0001,kind+" incorrect slope");
  assert(data.entries[0].result.includes(y.join(","))===false); // displayed as pairs, not an unlabeled series
  assert(data.entries[1].result.includes(fit.r.toFixed(5)));
 }
 const curve=exponentialSummary(input.curved);
 assert(Math.abs(curve.scale-120.568)<.01);
 assert(Math.abs(curve.factor-.5985)<.0001);
 assert(curve.rmse<.36);
 assert(lineSummary([4,5,6,7,8,9],input.curved).rmse>12);
 const unusual=createIllustrativeSample("unexpected");
 assert(unusual.entries[2].result.includes("0.99893"));
 assert(unusual.entries[2].interpretation.includes("retain all six"));
 const unclear=createIllustrativeSample("unclear");
 assert(unclear.entries[2].result.includes("301.67")&&unclear.entries[2].result.includes("298.33"));
});
test("theoretical sample proves the identity, distinguishes checking from proof and extends it correctly",()=>{
 const s=createIllustrativeSample("theory");
 assert(s.planning.fields.course==="AA HL");
 assert(s.entries[0].result.includes("n=4"));
 assert(s.entries[0].limitations.includes("cannot"));
 assert(s.entries[1].result.includes("Tₙ²−Tₙ₋₁²"));
 assert(s.entries[1].result.includes("=n³"));
 assert(s.entries[2].result.includes("1≤m≤n"));
 assert(s.entries[2].result.includes("225−9=216"));
 for(let n=1;n<=40;n++){
  const cubes=Array.from({length:n},(_,i)=>(i+1)**3).reduce((a,b)=>a+b,0);
  assert.equal(cubes,(n*(n+1)/2)**2);
 }
 assert(s.entries[1].knowledge==="mixed");
 assert(s.entries[1].understandingExample.includes("Tₙ²"));
});
test("switching a richly populated sample never edits an existing personal browser project",()=>{
 const map=new Map(),store={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
 const own=createProjectState();own.scratch.introduction="Original student work";
 store.setItem(STORAGE_KEY,JSON.stringify(own));
 const before=store.getItem(STORAGE_KEY),p=createSamplePreview(store,normalizeProjectState);
 p.begin(own,createIllustrativeSample("linear"));p.save(createIllustrativeSample("curved"));
 const reloaded=createSamplePreview(store,normalizeProjectState);
 assert.equal(reloaded.resume().entries.length,3);
 assert.equal(reloaded.leave().scratch.introduction,"Original student work");
 assert.equal(store.getItem(STORAGE_KEY),before);
});
test("one complete sample ZIP carries its Planning + Studio mathematics and not a real IA submission",async()=>{
 const s=createIllustrativeSample("curved"),out=await createFullProjectExport(s,"zip");
 assert(out.bytes.length>3000);
 const JSZip=(await import("jszip")).default;
 const archive=await JSZip.loadAsync(out.bytes);
 const state=JSON.parse(await archive.file("ia-pathfinder-project.json").async("string"));
 assert.equal(state.entries.length,3);assert(state.demo==="curved");
 assert.equal(state.teacher.feedbackStatus,"not-requested");
 assert(state.entries[2].result.includes("0.5985"));
 assert(archive.file("README.txt"));
 assert(Object.keys(archive.files).filter(x=>x.endsWith(".pdf")||x.endsWith(".docx")).length===2);
});
test("sample factory is exclusive and the application uses it rather than the legacy stub",()=>{
 assert.throws(()=>createIllustrativeSample("typo"),/Unknown sample/);
 const app=readFileSync(new URL("../app.js",import.meta.url),"utf8");
 assert(app.includes("createIllustrativeSample(kind)"));
 assert(!app.includes('st.result="Illustrative points'));
});
