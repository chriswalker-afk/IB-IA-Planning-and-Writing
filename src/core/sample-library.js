/** Authored fictional investigations. Assembly never adds instructional prose. */
import {createProjectState} from './project-state.js';
import {ENTRY_BASE} from '../completing/entry-record.js';
import {syncPlanningToProject} from '../planning/engine.js';
import {routeById} from '../planning/investigative-routes.js';
import {journeyOutcomeOptions,journeySourceSignature,outcomeRouteForEntry} from '../completing/adaptive-journey.js';
import {representationTool} from '../diagrams/representation-registry.js';
import {normalizeNativeShelf} from '../diagrams/native-data-core.js';
import {normalizeSources} from '../completing/evidence-links.js';
import {STANDING_REACH_SPEC} from './samples/standing-reach.js';
import {TRAY_OPTIMISATION_SPEC} from './samples/tray-optimisation.js';
import {SAMPLE_BRIEFS} from './samples/briefs.js';

const copy=value=>structuredClone(value);
const SPECS=Object.freeze([STANDING_REACH_SPEC,TRAY_OPTIMISATION_SPEC]);
export const referenceSampleSpec=id=>SPECS.find(spec=>spec.id===id)||null;
export const REFERENCE_SAMPLE_CHOICES=Object.freeze(SPECS.map(spec=>Object.freeze({
 id:spec.id,title:spec.title,description:spec.description,routeId:spec.routeId,
 pathway:routeById(spec.routeId)?.title||'',course:spec.course
})));
export const sampleLibraryCoverage=()=>SAMPLE_BRIEFS.map(brief=>({
 ...brief,available:!!referenceSampleSpec(brief.id)
}));

function assignAuthored(target,values,label){
 for(const [key,value] of Object.entries(values||{})){
  if(!Object.hasOwn(target,key))throw new Error('Unknown '+label+' field: '+key);
  if(typeof value!=='string')throw new Error('Sample '+label+' '+key+' must contain text.');
  target[key]=value;
 }
}

export function createReferenceSample(id){
 const spec=referenceSampleSpec(id);
 if(!spec)throw new Error('That complete illustrative investigation is not available.');
 const s=createProjectState(),route=routeById(spec.routeId);
 s.demo=id;s.route='completing';
 assignAuthored(s.planning.fields,spec.planning,'planning');
 Object.assign(s.planning.fields,{provisionalTitle:spec.title,course:spec.course,ideaStatus:'yes'});
 s.planning.mathSelected=copy(spec.mathSelected||route?.math?.[spec.course]||[]);
 s.planning.routeExplorer={...s.planning.routeExplorer,selectedRoute:spec.routeId,openRoute:spec.routeId,firstStep:route?.first?.[0]||''};
 s.planning.completed=true;s.planning.current='N08';
 s.planning.visited=['N00','N01','N01V','N02','N03','N03D','N01P','N06','N07','N08'];
 s.planning.completedNodes=[...s.planning.visited];
 s.planning.sourceBranches={primary:['primary','both'].includes(s.planning.fields.dataSource),secondary:['secondary','both'].includes(s.planning.fields.dataSource)};
 if(spec.planningAccuracy)s.planning.accuracyPlans=copy(spec.planningAccuracy);
 if(spec.primaryQuantities)s.planning.primaryQuantities=copy(spec.primaryQuantities);
 syncPlanningToProject(s);
 s.scratch.introduction=spec.introduction;s.scratch.dataNotes=spec.dataNotes||'';
 assignAuthored(s.completion.fields,spec.completion,'completion');
 assignAuthored(s.completion.fields,spec.conclusion,'conclusion');
 s.completion.sourceRecords=normalizeSources(spec.sources||[]);
 s.completion.activeSourceId=s.completion.sourceRecords[0]?.id||'';
 s.completion.accuracyDecisions=copy(spec.accuracy||[]);
 const sourceIds=s.completion.sourceRecords.map(source=>source.id);
 const accuracyIds=s.completion.accuracyDecisions.map(item=>item.id);
 s.entries=spec.stages.map((stage,index)=>{
  const entry={...ENTRY_BASE,id:id+'-'+stage.key,phase:index?'substantial':'first',
   status:'completed',knowledge:'syllabus',sourceRefs:[...sourceIds],accuracyRefs:[...accuracyIds],figureRefs:[]};
  for(const key of Object.keys(ENTRY_BASE))if(typeof stage[key]==='string')entry[key]=stage[key];
  entry.fromEntryId=index?id+'-'+spec.stages[index-1].key:'';
  entry.previousTakeaway=index?spec.stages[index-1].localTakeaway:'';
  entry.resultRef='Section '+(index+3)+' · '+stage.title;
  entry.journeyDirection=index?'follow':'';
  return entry;
 });
 for(const figure of spec.figures||[]){
  const tool=representationTool(figure.tool),entry=s.entries[figure.stage];
  if(!tool||!entry)throw new Error('Invalid sample figure assignment: '+figure.id);
  const studio=s[tool.studio],draft=copy(figure.draft);
  studio.figures.push({id:figure.id,entryId:entry.id,savedAt:'Fictional authored sample',draft});
  studio.draft=copy(draft);studio.activeId=figure.id;
  if(!entry[tool.entryKey])entry[tool.entryKey]=figure.id;
  entry.figureRefs.push(tool.id+':'+figure.id);
 }
 s.dataShelf=normalizeNativeShelf((spec.dataSets||[]).map((data,index)=>({
  id:'data-'+id+'-'+(index+1),name:data.name,columns:data.columns,
  matrix:data.rows.map(row=>row.map(String)),savedAt:'Fictional authored sample',
  sourceKind:data.sourceKind||'theoretical',sourceText:data.sourceText||spec.provenance,
  presentation:data.presentation
 })));
 for(const [index,entry] of s.entries.entries()){
  const choices=journeyOutcomeOptions(s,entry),outcome=spec.stages[index].outcomeId;
  const selected=choices.find(choice=>choice.id===outcome);
  if(!selected)throw new Error('Invalid authored outcome '+outcome+' for '+entry.id+'; choose '+choices.map(x=>x.id).join(', '));
  entry.journeyRouteId=outcomeRouteForEntry(s,entry)?.id||'';
  entry.journeyOutcome=selected.value;
  if(index){entry.journeySourceOutcome=s.entries[index-1].journeyOutcome;
   entry.journeySourceSignature=journeySourceSignature(s,s.entries[index-1]);}
 }
 const first=s.entries[0],f=s.completion.fields;
 // Compatibility mirrors are complete authored answers, never cut-off summaries.
 Object.assign(f,{firstOutputIntroduction:first.purpose,firstWorkTitle:first.title,
  firstWorkResult:first.result,firstWorkLocation:first.resultRef,firstWorkStatus:'completed',
  firstResultSummary:first.localTakeaway,firstObservedFeature:first.observationText||first.localTakeaway,
  firstInterpretation:first.interpretation,nextQuestion:first.nextQuestion,nextReason:first.nextWhy});
 s.completion.current='C10';s.completion.activeEntryIndex=0;
 s.completion.latestMeaningfulNode='C10';
 s.completion.visited=['C10','C20','C30','C40','C50','C60','C70'];
 s.completion.history=[...s.completion.visited];
 for(const node of ['C10','C20','C30','C40','C60','C70'])s.completion.stages[node]='complete';
 s.completion.conclusionResultIds=s.entries.slice(-3).map(entry=>entry.id);
 if(f.technologyTool&&f.technologyOutcome){
  const technologyEntry=Number.isInteger(spec.technologyStage)?s.entries[spec.technologyStage]:s.entries.find(entry=>entry.phase==='substantial');
  if(!technologyEntry)throw new Error('Invalid technology stage for '+id);
  s.completion.fields.technologyForEntryId=technologyEntry.id;
 }
 s.completion.nextFromEntryId=first.id;
 s.completion.scatterPatternForEntryId=first.id;
 s.completion.pairedDataForEntryId=first.id;
 for(const review of spec.reviews||[]){
  const record=s.completion.review.records['draft-'+review.id];
  if(!record)throw new Error('Unknown sample review: '+review.id);
  Object.assign(record,{location:review.location,note:review.note,action:review.action||'',
   status:review.status||'checked',checkedAt:'Fictional student self-review'});
 }
 // External process checks have no invented peer, teacher or school evidence.
 for(const id of ['D08','D10','D12']){
  const record=s.completion.review.records['draft-'+id];
  record.status='not-applicable';
  record.note=id==='D08'?'I have not recorded an independent reader’s response.':
   id==='D10'?'This fictional example has no school submission or confirmed school formatting requirements.':
   'This is an identified fictional model investigation, not a student’s own submitted work.';
 }
 s.ui.adviceMode='reduced';s.ui.planningIntroSeen=true;s.ui.writingIntroSeen=true;
 s.ui.writerGuideIntroSeen=true;s.ui.lastWorkRoute='completing';s.ui.lastStudioNode='C10';
 return s;
}
