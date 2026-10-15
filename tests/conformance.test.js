import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createProjectState,normalizeProjectState} from '../src/core/project-state.js';
import {setCompletionNode,setCompletionField,isPearsonResult,canViewPmccFollowup,addAccuracyDecision,moveCompletionRoute} from '../src/completing/engine.js';
import {methodFamilies} from '../src/completing/method-identity.js';
import {linkedAccuracy,recordSource,selectSource,toggleInputLink,linkedSources,sourceContextFields} from '../src/completing/evidence-links.js';
import {guidanceContext} from '../src/completing/guidance-context.js';
import {eligibleWritingCues,currentWritingCue,personaliseWritingCue} from '../src/completing/writing-guidance.js';
import {relevantMathsGuidance} from '../src/completing/maths-guidance.js';
import {actOnWritingCue,quietAutoWritingCue} from '../src/completing/guidance-actions.js';
import {relevantLimitations} from '../src/completing/limitation-guidance.js';
import {relevantBivariateOptions} from '../src/completing/bivariate-guidance.js';
import {REVIEW_CHECKS,reviewChecksFor,setReviewStatus,addFeedbackAction,progressFeedback,reviewEditChanged} from '../src/completing/review.js';
import {conformanceAction} from '../src/completing/conformance-actions.js';
import {createConformanceViews} from '../src/completing/conformance-views.js';
import {createGuidanceViews} from '../src/completing/guidance-views.js';
import {escapeHtml} from '../src/ui/primitives.js';
const make=()=>{const s=createProjectState();s.planning.fields.aim='How do my actual measurements answer this question?';s.planning.fields.course='AI SL';return s;};
const entry=(s,extra={})=>{const e={id:'m'+s.entries.length,phase:'substantial',purpose:'A genuine mathematical purpose',status:'completed',result:'A genuine result',methodId:'',technique:'',knowledge:'unsure',...extra};s.entries.push(e);s.completion.activeEntryIndex=s.entries.length-1;return e;};
const scatter=(s,shape='curved')=>{const e=entry(s,{kind:'scatter',phase:'first',observation:shape,result:'Actual plotted observations'});s.completion.nextFromEntryId=e.id;setCompletionNode(s,'C35B');return e;};
const policies=s=>{s.completion.accuracyDecisions=[{id:'length',quantity:'Length',symbol:'L',unit:'m',resolution:'Nearest 0.1 m',policy:'Report distance appropriately'},{id:'time',quantity:'Time',symbol:'',unit:'s',resolution:'Nearest second',policy:'Report time appropriately'},{id:'temp',quantity:'Temperature',symbol:'',unit:'C',resolution:'Nearest degree',policy:'Unrelated temperature rule'}];};
const source=(s,name,method='Observed measurements')=>{if(s.completion.sourceRecords.length)recordSource(s,{fresh:true});setCompletionField(s,'actualSource',name);setCompletionField(s,'actualMethod',method);setCompletionField(s,'dataStatus','ready');return recordSource(s).record;};
const views=s=>createConformanceViews({getState:()=>s,e:escapeHtml,field:(p,l)=>'<label data-bind="'+p+'">'+escapeHtml(l)+'</label>',button:()=>'',summary:(l,v)=>'<p>'+escapeHtml(l)+': '+escapeHtml(v)+'</p>'});

test('F01 explicit normal identity defeats a rejected PMCC title and technique',()=>{
 const s=make(),e=entry(s,{methodId:'normal',technique:'Normal instead of PMCC',title:'Normal model rather than PMCC'});
 setCompletionNode(s,'C35P');
 assert(!isPearsonResult(e));assert(!canViewPmccFollowup(s));
 assert.deepEqual([...methodFamilies(e)].sort(),['normal','statistic']);
 setCompletionNode(s,'C40');assert(!relevantLimitations(s).some(x=>x.id==='L12'));
});
test('F01 a free-text title/result alone never creates an actual technique identity',()=>{
 const e={status:'completed',result:'We did not calculate PMCC',title:'Consider Pearson and a normal distribution'};
 assert.equal(methodFamilies(e).size,0);assert(!isPearsonResult(e));
});
test('F01 explicit Other does not fall back to contradictory legacy text',()=>{
 assert.equal(methodFamilies({status:'completed',result:'Real output',methodId:'other',technique:'Pearson correlation'}).size,0);
});
test('F01 positive legacy technique fallback remains available; negative/conditional descriptions do not',()=>{
 for(const technique of ['Pearson correlation','PMCC',"Pearson's product-moment correlation coefficient"])
  assert(isPearsonResult({status:'completed',result:'r = 0.4',technique}));
 for(const technique of ['Not PMCC','Might use Pearson','Normal rather than PMCC','Considered PMCC'])
  assert(!isPearsonResult({status:'completed',result:'A different calculation',technique}));
});
test('F01 explicit but planned PMCC remains a plan, not a performed coefficient',()=>{
 assert(!isPearsonResult({methodId:'pmcc',status:'planned',result:'Expected r may be large'}));
 assert(!isPearsonResult({methodId:'pmcc',status:'completed',result:''}));
 assert(isPearsonResult({methodId:'pmcc',status:'completed',result:'r = 0.4'}));
});
test('F02 unclassified curvature asks about monotonicity without suggesting Spearman',()=>{
 const s=make();scatter(s);setCompletionField(s,'pairedDataType','paired-numerical');
 const options=relevantBivariateOptions(s);
 assert(options.some(x=>/turn|reverse/.test(x.question)));assert(!options.some(x=>/Spearman/.test(x.reason)));
});
test('F02 explicitly monotonic and turning plots retain different optional questions',()=>{
 const s=make();scatter(s);setCompletionField(s,'pairedDataType','paired-numerical');
 setCompletionField(s,'scatterDetail','monotonic');assert(relevantBivariateOptions(s).some(x=>x.id==='B03'));
 setCompletionField(s,'scatterDetail','turning');assert(relevantBivariateOptions(s).some(x=>x.id==='B04'));
 assert(!relevantBivariateOptions(s).some(x=>/Spearman/.test(x.reason)));
});
test('F02 weak PMCC with unspecified curvature allows a nonlinear question without inferring monotonicity',()=>{
 const s=make(),g=scatter(s);setCompletionField(s,'pairedDataType','paired-numerical');
 const r=entry(s,{methodId:'pmcc',fromEntryId:g.id,result:'r = 0.03'});s.completion.nextFromEntryId=r.id;
 setCompletionNode(s,'C35P');setCompletionField(s,'pmccSignal','weak-linear');
 const options=relevantBivariateOptions(s);assert(options.some(x=>x.id==='B12'));assert(!options.some(x=>/Spearman/.test(x.reason)));
});
test('paired-data confirmation belongs to its graph, not another graph in the project',()=>{
 const s=make();scatter(s,'linear');setCompletionField(s,'pairedDataType','paired-numerical');
 assert(relevantBivariateOptions(s).length);
 scatter(s,'curved');assert.equal(relevantBivariateOptions(s).length,0);
});
test('F03 a blank symbol cannot match an unrelated precision decision',()=>{
 const s=make();policies(s);const e=entry(s,{accuracyRef:'length'});
 assert.deepEqual(linkedAccuracy(s,e).map(x=>x.id),['length']);
 assert.deepEqual(guidanceContext(s).matchingAccuracy.map(x=>x.id),['length']);
});
test('F03 legacy names/symbols require an exact, unambiguous match',()=>{
 const s=make();policies(s);const e=entry(s,{accuracyRef:'L'});
 assert.deepEqual(linkedAccuracy(s,e).map(x=>x.id),['length']);
 e.accuracyRef='Leng';assert.equal(linkedAccuracy(s,e).length,0);
 s.completion.accuracyDecisions.push({id:'length-2',quantity:'Length',symbol:'D'});
 e.accuracyRef='Length';assert.equal(linkedAccuracy(s,e).length,1); // stable ID wins over names
 e.accuracyRef='L';s.completion.accuracyDecisions[3].symbol='L';assert.equal(linkedAccuracy(s,e).length,0);
});
test('F03 a speed calculation can link both length and time, then explicitly clear all',()=>{
 const s=make();policies(s);const e=entry(s,{accuracyRef:'length'});
 assert(toggleInputLink(s,'accuracy','time').ok);assert.deepEqual(linkedAccuracy(s,e).map(x=>x.id),['length','time']);
 assert(toggleInputLink(s,'accuracy','length').ok);assert(toggleInputLink(s,'accuracy','time').ok);
 assert.equal(linkedAccuracy(s,e).length,0);assert.equal(e.accuracyRef,'');
});
test('F03 precision cue personalisation mentions only this result\'s linked inputs',()=>{
 const s=make();policies(s);entry(s,{accuracyRefs:['length','time']});setCompletionNode(s,'C40');
 const text=personaliseWritingCue({cue:'Use [recorded c24 units/source precision]; [input precision/source].'},guidanceContext(s));
 assert(text.includes('Length'));assert(text.includes('Time'));assert(!text.includes('Temperature'));assert(!text.includes('Unrelated'));
});
test('F03 revising either linked input flags speed and its dependent step, not an unrelated exact proof',()=>{
 const s=make();policies(s);const speed=entry(s,{accuracyRefs:['length','time']});
 const later=entry(s,{fromEntryId:speed.id});const proof=entry(s,{kind:'theory',methodId:'proof'});
 Object.assign(s.completion.fields,{accuracyQuantity:'Time',accuracyUnit:'ms',accuracyResolution:'Nearest millisecond',accuracyPolicy:'Report using corrected time units'});
 assert(addAccuracyDecision(s).ok);assert.equal(speed.reviewNeeded,'yes');assert.equal(later.reviewNeeded,'yes');assert.notEqual(proof.reviewNeeded,'yes');
});
test('F03 changing an unrelated policy leaves acknowledged precision guidance quiet',()=>{
 const s=make();policies(s);entry(s,{phase:'first',accuracyRefs:['length'],kind:'model'});setCompletionNode(s,'C34A');
 const cue=eligibleWritingCues(s).find(x=>x.id==='W17'||x.id==='W47');assert(cue);
 actOnWritingCue(s,{id:cue.id,key:cue.key,action:'defer'});
 Object.assign(s.completion.fields,{accuracyQuantity:'Temperature',accuracyPolicy:'Another temperature convention'});assert(addAccuracyDecision(s).ok);
 assert(!eligibleWritingCues(s).some(x=>x.key===cue.key));
});
test('F03 all multi-input links survive a complete JSON round trip',()=>{
 const s=make();policies(s);const a=source(s,'A'),b=source(s,'B');
 const e=entry(s,{accuracyRefs:['length','time'],sourceRefs:[a.id,b.id]});
 const r=normalizeProjectState(JSON.parse(JSON.stringify(s)));
 assert.deepEqual(r.entries[0].accuracyRefs,e.accuracyRefs);assert.deepEqual(r.entries[0].sourceRefs,e.sourceRefs);
 assert.equal(linkedSources(r,r.entries[0]).length,2);
});
test('F04 C96 shows the origin cue and returns to the same entry without losing a draft note',()=>{
 const s=make(),a=entry(s,{phase:'first',kind:'scatter',result:'An observed scatter'});setCompletionNode(s,'C34B');
 const cue=currentWritingCue(s);actOnWritingCue(s,{id:cue.id,key:cue.key,action:'write-now'});
 s.completion.guidanceUi.noteDraft='My own unfinished thought';setCompletionNode(s,'C96');
 assert.equal(currentWritingCue(s).key,cue.key);assert.equal(s.completion.guidanceUi.noteDraft,'My own unfinished thought');
 assert(moveCompletionRoute(s,'Return to my original stage (with cue status)').ok);assert.equal(s.completion.current,'C34B');
 assert.equal(s.entries[s.completion.activeEntryIndex].id,a.id);assert.equal(s.completion.guidanceUi.noteDraft,'My own unfinished thought');
});
test('F04 acknowledgement in C96 suppresses a new queue on returning to the original work',()=>{
 const s=make();entry(s,{phase:'first',kind:'scatter'});setCompletionNode(s,'C34B');setCompletionNode(s,'C96');
 const cue=currentWritingCue(s);assert(actOnWritingCue(s,{id:cue.id,key:cue.key,action:'defer'}).ok);
 moveCompletionRoute(s,'Return to my original stage (with cue status)');assert(quietAutoWritingCue(s));
});
test('F04 no-data helper points to introduction/private planning, not an invented actual result',()=>{
 const s=make();setCompletionNode(s,'C95D');setCompletionNode(s,'C96');const cue=currentWritingCue(s);
 assert.equal(cue.id,'W13');assert.match(cue.location,/Introduction|notes/);assert(!eligibleWritingCues(s).some(x=>x.id==='W16'));
});
test('F04 a saved C96 session preserves the origin and writing action after restoration',()=>{
 const s=make();entry(s,{kind:'scatter',phase:'first'});setCompletionNode(s,'C34B');setCompletionNode(s,'C96');
 const r=normalizeProjectState(JSON.parse(JSON.stringify(s)));const cue=currentWritingCue(r);assert(cue);
 assert(actOnWritingCue(r,{id:cue.id,key:cue.key,action:'not-relevant'}).ok);
 assert(moveCompletionRoute(r,'Return to my original stage (with cue status)').ok);assert.equal(r.completion.current,'C34B');
});
test('F05 every D01-D21 review is connected to an appropriate milestone with source row provenance',()=>{
 const s=make();entry(s,{id:'tech'});Object.assign(s.completion.fields,{technologyTool:'GDC',technologyOutcome:'Real output',technologyForEntryId:'tech'});
 const all=new Set(['draft','feedback','final'].flatMap(mode=>reviewChecksFor(s,mode).map(x=>x.id)));
 assert.equal(all.size,21);assert.equal(REVIEW_CHECKS.length,21);assert(REVIEW_CHECKS.every(x=>x.sourceRow>=9&&x.sourceRow<=29));
 assert(!reviewChecksFor(s,'draft').some(x=>x.id==='D21'));assert(!reviewChecksFor(s,'final').some(x=>x.id==='D01'));
});
test('F05 source review wording is retained from the workbook, rather than an invented rubric',()=>{
 const src=JSON.parse(readFileSync(new URL('../data/sheets/draft-and-final-review.json',import.meta.url))).rows;
 for(const d of REVIEW_CHECKS){const row=src.find(x=>x.row===d.sourceRow);assert.equal(d.question,row.cells[3]);assert.equal(d.guardrail,row.cells[6]);}
});
test('F05 marking a review checked requires a student evidence pointer; a repair visit does not mark it',()=>{
 const s=make();setCompletionNode(s,'C80D');assert(!setReviewStatus(s,'draft','D05','checked').ok);
 const r=s.completion.review.records['draft-D05'];r.location='After Figure 2';assert(setReviewStatus(s,'draft','D05','needs-work').ok);
 const e=entry(s,{localTakeaway:'A genuine earlier finding'});r.entryId=e.id;
 assert(conformanceAction(s,'conformance-review-repair',{mode:'draft',id:'D05'}).ok);
 assert.equal(s.completion.current,'C34B');assert.equal(r.status,'needs-work');
 conformanceAction(s,'conformance-review-return');assert.equal(s.completion.current,'C80D');assert.equal(r.location,'After Figure 2');
 assert(setReviewStatus(s,'draft','D05','checked').ok);
});
test('F05 editing previously checked evidence makes that check need work again',()=>{
 const s=make(),r=s.completion.review.records['final-D05'];r.location='Figure 2';assert(setReviewStatus(s,'final','D05','checked').ok);
 reviewEditChanged(s,'completion.review.records.final-D05.location','Figure 2','Figure 3');assert.equal(r.status,'needs-work');assert.equal(r.checkedAt,'');
});
test('F05 recorded feedback cannot jump directly to verified',()=>{
 const s=make(),r=s.completion.review;Object.assign(r,{feedbackNote:'Check the domain',feedbackAction:'Correct the domain discussion'});
 assert(addFeedbackAction(s).ok);assert.equal(r.feedbackItems[0].status,'recorded');r.feedbackItems[0].verification='I checked endpoints';
 assert(!progressFeedback(s,0,'verified').ok);assert(progressFeedback(s,0,'implemented').ok);assert(progressFeedback(s,0,'verified').ok);
 assert.equal(r.feedbackItems[0].status,'verified');assert.equal(s.scratch.conclusion,'');
});
test('F05 the detailed checklist stays closed initially and its text is escaped',()=>{
 const s=make();s.completion.review.records['draft-D05'].note='<script>bad()</script>';
 const html=views(s).review('draft');assert(!/<details[^>]*\sopen/.test(html));assert(!html.includes('<script>'));
});
test('F05 tool-specific review is hidden until a tool actually produced a linked result',()=>{
 const s=make();entry(s,{id:'tool',status:'planned'});Object.assign(s.completion.fields,{technologyTool:'Spreadsheet',technologyOutcome:'Pending',technologyForEntryId:'tool'});
 assert(!reviewChecksFor(s,'draft').some(x=>x.id==='D20'));s.entries[0].status='completed';assert(reviewChecksFor(s,'draft').some(x=>x.id==='D20'));
});
test('F05 review evidence and feedback verification survive full backup without advancing status',()=>{
 const s=make(),r=s.completion.review;r.records['draft-D05'].location='My result';r.records['draft-D05'].status='needs-work';
 Object.assign(r,{feedbackNote:'Actual verbal advice',feedbackKind:'verbal',feedbackAction:'Recheck result'});addFeedbackAction(s);
 const restored=normalizeProjectState(JSON.parse(JSON.stringify(s)));assert.equal(restored.completion.review.records['draft-D05'].status,'needs-work');
 assert.equal(restored.completion.review.feedbackItems[0].status,'recorded');assert.equal(restored.completion.review.feedbackItems[0].kind,'verbal');
});
test('F06 a selected unfamiliar technique gets a first-use cue before any output exists',()=>{
 const s=make();entry(s,{methodId:'other',technique:'A researched method',status:'planned',result:'',knowledge:'outside'});setCompletionNode(s,'C40');
 assert.equal(currentWritingCue(s).id,'W60');assert(relevantMathsGuidance(s).some(x=>x.id==='M21'));
 assert(!eligibleWritingCues(s).some(x=>['W16','W18','W23','W26'].includes(x.id)));
});
test('F06 only the unfamiliar component is requested for mixed mathematics',()=>{
 const s=make();entry(s,{methodId:'other',technique:'A familiar method with an extension',status:'planned',result:'',knowledge:'mixed'});setCompletionNode(s,'C50');
 assert.equal(currentWritingCue(s).id,'W61');assert(!eligibleWritingCues(s).some(x=>x.id==='W60'));
});
test('F06 verified syllabus methods do not acquire unfamiliar-method tutorials',()=>{
 const s=make();entry(s,{methodId:'optimisation',status:'planned',knowledge:'syllabus'});setCompletionNode(s,'C40');
 assert(!eligibleWritingCues(s).some(x=>['W60','W61'].includes(x.id)));assert(!relevantMathsGuidance(s).some(x=>['M21','M22'].includes(x.id)));
});
test('F07 changing source A flags only A and its mathematical descendants, not independent source B',()=>{
 const s=make(),a=source(s,'Dataset A'),b=source(s,'Dataset B');
 const first=entry(s,{sourceRefs:[a.id],interpretation:'Student text A'}),second=entry(s,{sourceRefs:[b.id],interpretation:'Student text B'}),child=entry(s,{fromEntryId:first.id});
 selectSource(s,a.id);setCompletionField(s,'actualSource','Corrected Dataset A');
 assert.equal(first.reviewNeeded,'yes');assert.equal(child.reviewNeeded,'yes');assert.notEqual(second.reviewNeeded,'yes');assert.equal(first.interpretation,'Student text A');
 assert.equal(linkedSources(s,second)[0].fields.actualSource,'Dataset B');
});
test('F07 the mathematical context uses its linked source, not whichever source editor was opened last',()=>{
 const s=make(),a=source(s,'A','Measured lengths with a ruler'),b=source(s,'B','Video timing');
 const e=entry(s,{sourceRefs:[a.id]});selectSource(s,b.id);setCompletionNode(s,'C40');
 const ctx=guidanceContext(s);assert.equal(ctx.f.actualSource,'A');assert(!ctx.f.actualMethod.includes('Video'));
});
test('F07 candidate-source method text does not become actual merely by sharing a linked result',()=>{
 const s=make(),a=source(s,'Actual A','Measured length'),b=source(s,'Candidate B','Manual stopwatch');setCompletionField(s,'dataStatus','candidate');
 const e=entry(s,{sourceRefs:[a.id,b.id]});const f=sourceContextFields(s,e,'C40');
 assert(!f.actualMethod.includes('stopwatch'));assert(f.actualSource.includes('Actual A'));assert(!f.actualSource.includes('Candidate B'));
});
test('F07 old single-source projects migrate without losing authored results or claiming new approvals',()=>{
 const s=make();delete s.completion.sourceRecords;delete s.completion.activeSourceId;
 Object.assign(s.completion.fields,{actualSource:'Old shared source',dataStatus:'ready'});entry(s,{result:'My original work',interpretation:'My original interpretation'});
 const r=normalizeProjectState(JSON.parse(JSON.stringify(s)));assert.equal(r.completion.sourceRecords.length,1);assert.equal(r.completion.sourceRecords[0].legacy,true);
 assert.deepEqual(r.entries[0].sourceRefs,['source-legacy']);assert.equal(r.entries[0].interpretation,'My original interpretation');assert.equal(r.teacher.pendingApproval,false);
});
test('F07 selecting another source preserves the first source and does not itself invalidate mathematics',()=>{
 const s=make(),a=source(s,'A'),b=source(s,'B');const e=entry(s,{sourceRefs:[a.id]});selectSource(s,a.id);selectSource(s,b.id);
 assert.notEqual(e.reviewNeeded,'yes');assert.equal(s.completion.sourceRecords[0].fields.actualSource,'A');
});
test('new state registries reject prototype keys and oversized reference lists when restoring',()=>{
 const s=make();entry(s,{sourceRefs:Array.from({length:200},(_,i)=>'s'+i),accuracyRefs:['length']});
 const raw=JSON.parse(JSON.stringify(s));raw.completion.review.records['__proto__']={status:'checked'};
 const r=normalizeProjectState(raw);assert(r.entries[0].sourceRefs.length<=80);assert.equal({}.status,undefined);
});

test('F06 reusing an already introduced unfamiliar idea does not request another first-use explanation',()=>{
 const s=make();entry(s,{methodId:'other',technique:'My researched method',knowledge:'outside',understandingExample:'An earlier real step'});
 entry(s,{methodId:'other',technique:'My researched method',knowledge:'outside',status:'planned',result:''});setCompletionNode(s,'C50');
 assert(!eligibleWritingCues(s).some(x=>x.id==='W60'));assert(!relevantMathsGuidance(s).some(x=>x.id==='M21'));
 s.entries[1].unfamiliarComponent='A genuinely new extension';assert(eligibleWritingCues(s).some(x=>x.id==='W60'));
});
test('F03 source-stage accuracy advice uses only quantities recorded for the selected source',()=>{
 const s=make(),a=source(s,'Source A'),b=source(s,'Source B');policies(s);s.completion.accuracyDecisions[0].sourceId=a.id;s.completion.accuracyDecisions[1].sourceId=b.id;
 selectSource(s,a.id);setCompletionNode(s,'C24');const ctx=guidanceContext(s);assert.deepEqual(ctx.sourceAccuracy.map(x=>x.id),['length']);
 const text=personaliseWritingCue({cue:'Use [recorded c24 units/source precision].'},ctx);assert(text.includes('Length'));assert(!text.includes('Time'));
});
