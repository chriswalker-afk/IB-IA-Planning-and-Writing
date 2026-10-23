import {newGraphDraft} from '../../diagrams/graph-core.js';
import {newTableDraft} from '../../diagrams/table-studio-core.js';
import {SOURCE_FIELDS} from '../../completing/evidence-links.js';

/** Shared layout and field assembly for the four explicitly constructed Pass 3 studies.
 * Each mathematical result and student paragraph is authored in its own study,
 * not fabricated by this assembler. All figures are native, editable studio drafts.
 */
const rawTable=(columns,rows)=>[columns.join('\t'),...rows.map(row=>row.join('\t'))].join('\n');
const formattedRows=rows=>rows.map(row=>row.map(value=>String(value)));
function draftFor(item,study){
 const sourceText=item.calculated?
  'Calculated from declared constructed teaching cases; not observed measurements.':
  'Original constructed teaching cases, not measurements. Full generation recipe and units in the investigation.';
 if(item.tool==='graph'){
  const columns=item.columns||[item.xLabel,item.yLabel],rows=formattedRows(item.rows);
  return {...newGraphDraft(),kind:item.kind||'scatter',title:item.title,
   figureNumber:String(item.number),columns,matrix:rows,raw:rawTable(columns,rows),
   xLabel:item.xLabel,yLabel:item.yLabel,xSymbol:item.xSymbol||'x',ySymbol:item.ySymbol||'y',
   xUnit:item.xUnit||'',yUnit:item.yUnit||'',xUnitMode:item.xUnit?'unit':'dimensionless',
   yUnitMode:item.yUnit?'unit':'dimensionless',
   xMin:String(item.xMin),xMax:String(item.xMax),yMin:String(item.yMin),yMax:String(item.yMax),
   models:item.models||[],showGrid:true,showPoints:true,showLegend:!!(item.models||[]).length,
   includeZeroY:!!item.includeZeroY,sourceKind:'theoretical',
   sourceText,caption:item.caption,equationPlacement:'legend'};
 }
 if(item.tool==='table'){
  const columns=item.columns,rows=formattedRows(item.rows);
  return {...newTableDraft(),mode:'compact',headers:'yes',
   title:item.title,number:String(item.number),columns,headings:columns,
   matrix:rows,raw:rawTable(columns,rows),
   unitDecisions:(item.units||columns.map(()=>'')).map(unit=>({mode:unit?'unit':'dimensionless',unit})),
   purpose:item.purpose||'A compact comparison for the stated mathematical question.',
   note:item.note||'',sourceKind:'theoretical',sourceText,numberFormat:'source',
   showRowLines:true,cellAlignment:'numeric'};
 }
 throw new Error('Unrecognised Pass 3 native figure tool: '+item.tool);
}
function authoredReviews(d){
 const focus=d.review;
 const presentationChecked=focus.presentationChecked===true;
 const shared=[
  ['D01','Introduction, mathematical stages and conclusion',focus.story,'I checked that every claim in the conclusion has worked evidence.'],
  ['D02','Transitions between mathematical stages',focus.sequence,'I removed repetitive summaries and kept the next question connected to the preceding result.'],
  ['D03','Equations, units, axes and definitions',focus.notation,'I checked units and distinguished exact input from rounded output.'],
  ['D04','Purpose and personal decision',focus.purpose,'I kept the interpretation tied to the original decision rather than just naming a good-looking curve.'],
  ['D05','Local interpretation and limitations',focus.limits,'I placed consequential model restrictions beside the calculations they affect.'],
  ['D06','Core mathematical workings',focus.calculations,'I recomputed the numerical claims from the supplied records.'],
  ['D07','Complete reader and generated PDF/Word',focus.presentation,presentationChecked?'I inspected the complete reader and every page of the generated PDF and Word documents.':'I will inspect the document exports and figures at normal reading size.'],
  ['D09','Data provenance and references',focus.sources,'I checked that constructed observations and derived calculations are not described as real experiments.'],
  ['D11','Mathematical stages and conclusion',focus.story,'I checked that each result contains performed mathematics rather than a plan to do it.'],
  ['D19','Native graphs, tables and source data',focus.figures,'I kept long records editable instead of padding the narrative with them.'],
  ['D20','Technology-supported calculations',focus.technology,'I record the mathematical inputs, method and interpretation independently of the graph image.']
 ];
 return shared.map(([id,location,note,action])=>({id,location,note,action,status:id==='D07'&&!presentationChecked?'unchecked':'checked'}));
}
export function buildModellingPass3(d){
 const id=d.id,sourceId='source-'+id,accuracyId='accuracy-'+id;
 const sf={
  dataStatus:'ready',actualSourceType:'secondary',actualSource:d.provenance,
  sourceCitation:d.citation||d.provenance,
  actualMethod:d.methodRecord,sourcePopulation:d.sourcePopulation||'The declared constructed cases only; no claim is made about an outside population.',
  statisticalPopulation:d.sourcePopulation||'The constructed scenarios and domain defined here, not a sampled population.',
  sampleOrCensus:'census',samplingMethod:'Every supplied constructed case is retained.',
  samplingRationale:'I use a prespecified working part and a separate check when stated; the cases are not a random population sample.',
  sampleSize:d.sampleSize,pairing:d.pairing||'Each response stays attached to its given input and ID.',
  responseBias:'No people answered a survey; data design and model assumptions, rather than non-response, limit transfer.',
  dataCleaning:'I checked numeric units and record IDs and retained the complete fixed case set.',
  modelEvidence:d.modelEvidence,modelInputs:d.inputs,
  modelAssumptions:d.assumptions,modelDomain:d.domain,
  modelValidation:d.validation,modelAlternative:d.alternative,
  alternativeMethod:d.alternative,
  chosenMethod:d.chosenMethod,
  methodReason:d.methodReason,methodLimitation:d.methodLimit,
  limitationConsequence:d.consequence,limitationMitigation:d.mitigation,
  limitationAcceptable:d.acceptable
 };
 const completion={...sf,
  changedSincePlanning:d.changedSincePlanning,permissionStatus:'not-needed',
  permissionNotes:'I used a disclosed constructed data or coordinate scenario; no participants, restricted materials or fabricated approvals.',
  dataStatusSummary:d.dataStatusSummary,
  dataAimLink:d.dataAimLink,
  firstMathsBridgePlacement:'before',firstType:d.firstType||'scatter',
  firstPurpose:d.stages[0].purpose,firstMethodEvaluation:d.firstEvaluation,
  firstDefinitions:d.definitions,
  firstPresentation:d.firstPresentation,
  accuracyQuantity:d.accuracyQuantity,accuracySymbol:d.accuracySymbol,accuracyUnit:d.accuracyUnit,
  accuracyResolution:d.accuracyResolution,accuracyPolicy:d.accuracyPolicy,
  accuracyReason:d.accuracyReason,accuracyForResult:d.accuracyReason,
  variableDefinitions:d.definitions,specialistTerms:d.specialistTerms,
  predictionComparison:d.predictionComparison,benefitFinding:d.benefitFinding,
  surpriseReason:d.surpriseReason,surpriseCheck:d.surpriseCheck,
  nextMethod:d.stages[1].technique,courseConcern:d.courseConcern,
  technologyTool:d.technologyTool,technologyInput:d.technologyInput,
  technologyOutcome:d.technologyOutcome,technologyInterpretation:d.technologyInterpretation,
  courseWhy:d.courseWhy,mathsLearning:d.mathsLearning,
  notationIssue:d.review.notation,presentationIssue:d.review.presentation,
  referencesIssue:d.review.sources,draftComplete:'ready',
  ...(d.completionExtra||{})
 };
 const planning={
  planIdentifier:id+' — fictional working investigation',
  provisionalTitle:d.title,ideaStatus:'yes',idea:d.idea,aim:d.aim,
  motivation:d.motivation,beneficiaryType:'me',beneficiary:d.beneficiary,
  intendedUse:d.intendedUse,kind:'modelling',dataSource:'secondary',
  dataAvailability:'in-hand',statisticsContext:'paired-numerical',
  secondaryPublisher:'No publisher. This is an original constructed example, not published observational data.',
  secondaryVariables:d.inputs,secondaryScope:d.domain,secondaryStatus:'ready',secondaryVerified:'yes',
  secondarySamplingOrigin:'The cases were generated or fixed deliberately for an illustrative model comparison; there is no random sampling frame.',
  alternativeMethod:d.alternative,readinessImprovement:d.readinessImprovement,
  permissionNeed:'no',permissionDetails:'Only constructed teaching material and derived calculations are used.',
  practicalBlocker:'no',course:d.course||'AI SL',courseSuitability:'yes',mathsOutside:'syllabus',
  prediction:d.prediction,predictionWhy:d.predictionWhy,predictionImplication:d.predictionImplication,
  firstAction:d.firstAction,firstAccuracy:d.accuracyReason,
  timelineWeeks:'6',timelineEarly:'yes',milestoneAdjustment:'A provisional six-week sequence: define the case set; check and plot it; develop a model; test on reserved or changed cases; write and review. This is not a school-confirmed deadline.',
  teacherNeed:'No independent feedback has been recorded in this fictional project.',
  teacherQuestion:d.teacherQuestion,
  teacherSafeAction:'I can check the supplied cases, calculate the model and document its assumptions without claiming any teacher has approved it.',
  universalTeacherQuestion:d.teacherQuestion,
  ...(d.planningExtra||{})
 };
 return {
  id,routeId:d.routeId,title:d.title,description:d.description,
  course:d.course||'AI SL',mathSelected:d.mathSelected,
  readingNote:d.readingNote,provenance:d.provenance,technologyStage:d.technologyStage??2,
  planning,introduction:d.introduction,dataNotes:d.dataNotes,
  completion,stages:d.stages,
  figures:d.figures.map(item=>({id:item.id,tool:item.tool,stage:item.stage,
   after:item.after||'result',draft:draftFor(item,d)})),
  dataSets:d.dataSets,
  sources:[{id:sourceId,fields:Object.fromEntries(SOURCE_FIELDS.map(key=>[key,completion[key]||'']))}],
  accuracy:[{id:accuracyId,sourceId,quantity:d.accuracyQuantity,symbol:d.accuracySymbol,
   unit:d.accuracyUnit,resolution:d.accuracyResolution,policy:d.accuracyPolicy,
   reason:d.accuracyReason}],
  conclusion:d.conclusion,reviews:authoredReviews(d),
  references:d.references||[{label:'[D1] Constructed case record',value:d.provenance},
    {label:'[M1] Calculations',value:'All model parameters, residuals, comparisons and scenario values are derived from the editable dataset and mathematics shown in this investigation. No external dataset, observational study or experimental validation is claimed.'}]
 };
}
