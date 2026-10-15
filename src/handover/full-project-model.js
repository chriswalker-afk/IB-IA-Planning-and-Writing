/** A human-readable snapshot of the student's whole Pathfinder working record. */
import {createPlanningEnvelope} from './schema.js';
import {modelFromEnvelope} from './report-model.js';
import {C_FIELD_DEFAULTS,C_MAJOR_STAGES} from '../completing/engine.js';
import {REVIEW_CHECKS} from '../completing/review.js';

const val=x=>typeof x==='string'?x.trim():x===undefined||x===null?'':String(x);
const human=s=>String(s).replace(/([a-z0-9])([A-Z])/g,'$1 $2').replace(/^./,x=>x.toUpperCase());
const field=(label,value)=>({label,value:val(value)});
const section=(title,rows,description='')=>{
 const kept=rows.filter(r=>r&&val(r.value));
 return kept.length?{title,description,rows:kept}:null;
};
const named=(source,labels)=>labels.map(([key,name])=>field(name,source?.[key]));
const records=(source,keys)=>keys.map(key=>field(human(key),source?.[key]));
const status=x=>({'not-started':'Not started',working:'Working on it',complete:'Ready for now','needs-review':'Needs review',unchecked:'Not checked','needs-work':'Needs work',checked:'Student checked'})[x]||human(x||'Not started');
const actual=step=>step?.status==='completed'&&val(step?.result);
const allFields=Object.keys(C_FIELD_DEFAULTS);
const entryLabels=[
 ['title','Title'],['purpose','Mathematical purpose'],['previousTakeaway','What prompted this step'],
 ['technique','Technique used or proposed'],['methodId','Selected method reference'],['kind','Type of mathematics'],
 ['knowledge','Student-assessed familiarity with technique'],['knowledgeNotes','Familiarity notes'],
 ['unfamiliarComponent','Unfamiliar mathematical component'],['researchSource','Research source'],
 ['understandingExample','Student demonstration of understanding'],['mathsInsight','What I learned mathematically'],
 ['methodChangeReason','Why I changed direction'],['priorLearningOnly','Previously learned mathematics'],
 ['result','Student-entered mathematical result'],['resultRef','Location in actual IA'],
 ['observation','Pattern category'],['observationText','What I observed'],['resultSignal','My own interpretation of this mathematical outcome'],
 ['interpretation','Interpretation in context of aim'],['localTakeaway','What this establishes'],
 ['limitations','Limitations of this step'],['nextQuestion','What follows mathematically'],
 ['nextWhy','Why that step follows'],['bridge','Link to next step'],
 ['reviewNeeded','Mathematical connection to review'],['reviewReason','Reason for review'],
 ['reviewCheckedAt','Student review date'],['createdAt','Record created at']
];
const reviewNames=Object.fromEntries(REVIEW_CHECKS.map(x=>[x.id,x.area]));
const toString=v=>typeof v==='object'&&v!==null?JSON.stringify(v):val(v);

function studentReviewSections(review){
 const result=[];
 for(const mode of ['draft','feedback','final']){
  const rows=[];
  for(const [key,r] of Object.entries(review?.records||{})){
   if(!key.startsWith(mode+'-')||!r)continue;
   const id=key.slice(mode.length+1),name=id+' · '+(reviewNames[id]||'Review');
   const populated=Object.entries(r).some(([k,v])=>k==='status'?v&&v!=='unchecked':val(v));
   if(!populated)continue;
   rows.push(field(name+' — status',status(r.status)));
   for(const [k,l] of [['location','Evidence in my actual IA'],['note','My reasoning or evidence'],['action','Improvement I will make'],['selfMark','Optional provisional student self-mark'],['markLevel','Reference rubric level'],['checkedAt','Checked at']]){
    if(val(r[k]))rows.push(field(name+' — '+l,r[k]));
   }
  }
  const heading=mode==='draft'?'Draft self-review':mode==='feedback'?'Feedback-stage self-review':'Final self-review';
  result.push(section(heading,rows,'Student-entered review evidence, not a teacher mark or confirmation of submission.'));
 }
 for(const [i,f] of (review?.feedbackItems||[]).entries()){
  result.push(section('Recorded feedback action '+(i+1),named(f,[['kind','Feedback type'],['note','Feedback noted'],['action','Student action'],['location','IA location'],['entryId','Mathematical link'],['status','Status as recorded'],['verification','My verification'],['at','Recorded date'],['implementedAt','Implemented date'],['verifiedAt','Verified date']]),'Student record only; not authenticated as teacher-approved.'));
 }
 return result.filter(Boolean);
}

export function modelFromFullProject(state,{exportedAt=new Date().toISOString()}={}){
 const plan=modelFromEnvelope(createPlanningEnvelope(state,{exportedAt}));
 const c=state.completion||{},steps=Array.isArray(state.entries)?state.entries:[],f=c.fields||{};
 const modelSections=[
  section('Project at a glance',[
   field('Current investigation aim',state.project?.aim||state.planning?.fields?.aim||plan.aim),
   field('IB Mathematics course',state.project?.course||state.planning?.fields?.course||plan.course),
   field('Last saved in Pathfinder',state.updatedAt),
   field('Planning status',state.planning?.completed?'Student-marked ready for now':'Still developing'),
   field('Mathematical-step records',String(steps.length)),
   field('Steps with student-entered results',String(steps.filter(actual).length)),
   field('External IA document link (reference only)',state.project?.documentUrl)
  ],'This is a record of what the student entered in Pathfinder, not a generated IA.'),
  ...plan.sections.map(s=>({...s,title:'Planning · '+s.title})),
  section('Idea Explorer · possible directions',(state.ideaExplorer?.shortlist||[]).flatMap((x,i)=>[
   field('Idea '+(i+1)+' · Possible question',x.question),
   field('Idea '+(i+1)+' · Direction',x.detail),
   field('Idea '+(i+1)+' · Interest',x.focus),
   field('Idea '+(i+1)+' · Trial',x.trialNote),
   field('Idea '+(i+1)+' · Trial status',x.trialStatus),
   ...Object.entries(x.checks||{}).map(([k,v])=>field('Idea '+(i+1)+' · '+human(k),v))
  ]),'Possibilities, not real mathematical results.'),
  section('IA Studio · student-set progress',C_MAJOR_STAGES.map(s=>field(s.name,status(c.stages?.[s.id]))),'Completion labels are student decisions, not assessments.'),
  section('IA Studio · private writing notes',named(state.scratch,[['introduction','Introduction notes'],['dataNotes','Data and methods notes'],['conclusion','Conclusion notes'],['finalReview','Final review notes']]),'Notes are private to Pathfinder and have not been inserted into the actual IA.'),
  section('IA Studio · sources and mathematical context',records(f,allFields.slice(0,allFields.indexOf('firstType')))),
  section('IA Studio · mathematics and interpretation prompts',records(f,allFields.slice(allFields.indexOf('firstType'),allFields.indexOf('mainConclusion')))),
  ...steps.map((x,i)=>section('Mathematical step '+(i+1)+': '+(val(x.title)||'Untitled step'),[
   field('Status',actual(x)?'Student-recorded actual mathematics':x.status==='completed'?'Marked complete, but no result recorded':'Planned only — not an actual result'),
   field('Phase',x.phase==='first'?'First exploration':x.phase==='substantial'?'Further mathematics':'Earlier work'),
   field('Mathematical record ID',x.id),
   field('Follows from record',x.fromEntryId),
   ...named(x,entryLabels),
   field('Linked source IDs',(x.sourceRefs||[]).join('; ')),
   field('Linked accuracy IDs',(x.accuracyRefs||[]).join('; '))
  ],actual(x)?'Student-reported output; Pathfinder does not verify mathematical correctness.':'An intention has not been converted into a result.')),
  ...((c.sourceRecords||[]).map((x,i)=>section('Actual source / method record '+(i+1),[
   field('Source reference',x.id),field('Legacy record requiring checking',x.legacy?'Yes':''),
   ...Object.entries(x.fields||{}).map(([k,v])=>field(human(k),v))
  ],'Links to mathematical steps use reference IDs.'))),
  ...((c.accuracyDecisions||[]).map((x,i)=>section('Accuracy decision '+(i+1),named(x,[['id','Decision reference'],['quantity','Quantity'],['symbol','Symbol'],['unit','Units'],['resolution','Measurement resolution'],['policy','Reporting policy'],['reason','Justification'],['sourceId','Source reference']])))),
  ...((c.confirmedLimitations||[]).map((x,i)=>section('Confirmed limitation '+(i+1),named(x,[['id','Limitation reference'],['entryId','Linked mathematical record'],['explanation','What applies'],['consequence','Mathematical consequence'],['mitigation','Checking or mitigation'],['location','Where discussed in actual IA'],['at','Recorded date']]),'Confirmed as relevant by the student, not diagnosed automatically.'))),
  section('IA Studio · conclusion and final communication',records(f,allFields.slice(allFields.indexOf('mainConclusion')))),
  section('Writing prompts · private notes',[
   ...Object.entries(state.cueNotes||{}).map(([k,v])=>field(human(k)+' · note',v)),
   ...Object.entries(state.cueLocations||{}).map(([k,v])=>field(human(k)+' · location',v))
  ],'Private writing notes are not automatically inserted into Word/Google Docs.'),
  section('Writing progress notes',Object.entries(state.writingLedger||{}).flatMap(([k,v])=>
   v&&typeof v==='object'?Object.entries(v).map(([a,b])=>field(human(k)+' · '+human(a),toString(b))):[field(human(k),v)])),
  ...studentReviewSections(c.review),
  section('Teacher conversation and check-ins',[
   field('Student-recorded feedback status',state.teacher?.feedbackStatus),
   field('Discussion flagged',state.teacher?.pendingApproval?'Yes — ask teacher':''),
   ...(state.teacher?.concerns||[]).map((v,i)=>field('Concern '+(i+1),v)),
   ...(state.teacher?.checkpoints||[]).map((v,i)=>field('Check-in '+(i+1),toString(v)))
  ],'No teacher approval or signature is inferred.'),
  section('Additional saved evidence records',Object.entries(state.evidence||{}).flatMap(([k,items])=>
   (Array.isArray(items)?items:[]).map((x,i)=>field(human(k)+' '+(i+1),toString(x))))),
  section('Historical decisions',(state.changeLog||[]).map((x,i)=>field('Change '+(i+1),toString(x))),'May no longer reflect current choices.')
 ].filter(Boolean);
 if(!steps.length)modelSections.push(section('Mathematical journey',[field('No actual mathematics recorded','This project has no mathematical-step records.')])); 
 return {...plan,
  title:'My IB Mathematics IA · Full Working Record',
  strapline:'IA PATHFINDER · COMPLETE PROJECT WORKING RECORD',
  aim:val(state.project?.aim||state.planning?.fields?.aim)||plan.aim,
  course:val(state.project?.course||state.planning?.fields?.course)||plan.course,
  status:state.demo?'ILLUSTRATIVE SAMPLE · NOT STUDENT WORK':'STUDENT WORKING RECORD · NOT AN IA SUBMISSION',
  sections:modelSections,
  footnote:'This is a readable snapshot of student-entered work, not the actual IA document, mathematical verification, an IB assessment, or teacher approval. PDF and Word contain a Planning-only reimport snapshot. Use the full JSON backup inside the ZIP to restore the complete project. Editing these documents after export does not update Pathfinder. Keep personal project exports private.'
 };
}
export function fullProjectFilename(model,extension){
 const slug=String(model.aim||'My IA').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,38)||'my-ia';
 return 'IA-Pathfinder-Full-Project-'+slug+'.'+extension;
}
