/** Field and figure assembly only. Every narrative answer is authored per study. */
import {newGraphDraft,normalizeGraphDraft} from '../../diagrams/graph-core.js';
import {newTableDraft,normalizeTableDraft} from '../../diagrams/table-studio-core.js';
import {SOURCE_FIELDS} from '../../completing/evidence-links.js';
export const R=String.raw;
export const f=(n,dp=3)=>Number(n.toFixed(dp));
const explicitMath=value=>/\\[A-Za-z]+/.test(value)&&!value.includes('\\(')&&!value.includes('\\[')?'\\('+value+'\\)':value;
export function graph({id,stage,number,title,rows,xLabel,yLabel,xSymbol='x',ySymbol='y',xUnit='',yUnit='',bounds,models=[],caption,kind='scatter',after='result',equations='legend'}){
 const columns=[xLabel,yLabel],matrix=rows.map(row=>row.map(String));
 return {id,tool:'graph',stage,after,draft:normalizeGraphDraft({...newGraphDraft(),kind,title,figureNumber:String(number),
  columns,matrix,raw:[columns,...matrix].map(row=>row.join('\t')).join('\n'),xLabel,yLabel,xSymbol,ySymbol,
  xUnit,yUnit,xUnitMode:xUnit?'unit':'dimensionless',yUnitMode:yUnit?'unit':'dimensionless',
  xMin:String(bounds[0]),xMax:String(bounds[1]),yMin:String(bounds[2]),yMax:String(bounds[3]),
  models,showLegend:models.length>0,showGrid:true,equationPlacement:equations==='none'?'hidden':equations,
  sourceKind:'theoretical',sourceText:'Defined inputs and calculations for this constructed investigation.',caption})};
}
export function table({id,stage,number,title,columns,rows,units=[],note,after='result'}){
 const matrix=rows.map(row=>row.map(String));
 return {id,tool:'table',stage,after,draft:normalizeTableDraft({...newTableDraft(),title,number:String(number),
  columns,headings:columns,matrix,raw:[columns,...matrix].map(row=>row.join('\t')).join('\n'),
  unitDecisions:columns.map((_,i)=>({mode:units[i]?'unit':'dimensionless',unit:explicitMath(units[i]||'')})),
  sourceKind:'theoretical',sourceText:'My calculations from the explicitly stated case inputs.',
  purpose:note,note,numberFormat:'source',cellAlignment:'numeric',showRowLines:true})};
}
export function finishDecisionSpec(d){
 const sourceId='source-'+d.id;
 const planning={planIdentifier:d.id,provisionalTitle:d.title,ideaStatus:'yes',kind:'modelling',
  dataSource:d.sourceType,course:d.course,courseSuitability:'yes',mathsOutside:'syllabus',
  dataAvailability:'in-hand',practicalBlocker:'no',permissionNeed:'no',timelineWeeks:'6',timelineEarly:'yes',...d.planning};
 const completion={dataStatus:d.sourceType==='theoretical'?'theoretical':'ready',actualSourceType:d.sourceType,
  permissionStatus:'not-needed',firstMathsBridgePlacement:'before',firstType:d.firstType||'diagram',
  firstPurpose:d.stages[0].purpose,firstDefinitions:d.definitions,variableDefinitions:d.definitions,
  draftComplete:'ready',...d.source,...d.completion};
 const accuracy=d.accuracy.map((record,i)=>({id:'accuracy-'+d.id+'-'+(i+1),sourceId,...record}));
 const first=accuracy[0];
 Object.assign(completion,{accuracyQuantity:first.quantity,accuracySymbol:first.symbol,accuracyUnit:first.unit,
  accuracyResolution:first.resolution,accuracyPolicy:first.policy,accuracyReason:first.reason,
  accuracyForResult:d.accuracySummary||first.reason,
  notationIssue:d.reviews.find(r=>r.id==='D03')?.note||'',
  presentationIssue:d.reviews.find(r=>r.id==='D07')?.note||'',
  referencesIssue:d.reviews.find(r=>r.id==='D09')?.note||''});
 const figures=d.figures.map(figure=>{
  const draft=structuredClone(figure.draft);
  // These two native renderers place the title but not their saved number.
  if(['trace','voronoi'].includes(figure.tool)&&draft.figureNumber)draft.title='Figure '+draft.figureNumber+'. '+draft.title;
  if(figure.tool==='geometry'){
   draft.vertices=draft.vertices.map(v=>({...v,edgeLabel:explicitMath(v.edgeLabel||''),angleLabel:explicitMath(v.angleLabel||'')}));
   draft.guides=draft.guides.map(g=>({...g,label:explicitMath(g.label||'')}));
  }
  // Keep the full-baseline label away from A and place its angle near A.
  if(figure.id==='geometry-height-sight-lines'){
   draft.vertices[0].edgeLabelDy=36;
   draft.auxPoints[0].labelDy=26;
   draft.guides[0].labelDx=-60;draft.guides[0].labelDy=55;
  }
  return {...figure,draft};
 });
 return {...d,planning,completion,accuracy,figures,
  sources:[{id:sourceId,fields:Object.fromEntries(SOURCE_FIELDS.map(key=>[key,completion[key]||'']))}],
  reviews:d.reviews.map(review=>({status:'checked',...review})),
  references:d.references||[{label:'[D1] Defined starting material',value:d.provenance},
   {label:'Mathematics',value:'The derivations and calculated comparisons are displayed in this investigation. The editable project retains the defining input records; no external observations or independent experiment are claimed.'}]
 };
}
