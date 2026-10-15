/** Synthetic projects for reproducible browser acceptance. Not student data. */
import {writeFileSync,mkdirSync} from 'node:fs';
import {createProjectState} from '../src/core/project-state.js';
import {setCompletionNode,setCompletionField} from '../src/completing/engine.js';
import {recordSource} from '../src/completing/evidence-links.js';
import {C_ROUTES} from '../src/completing/catalog.js';
const out=process.env.IA_QA_OUTPUT||'qa-output';mkdirSync(out,{recursive:true});
const s=createProjectState();s.route='completing';s.planning.fields.aim='How does measured distance relate to time?';s.planning.fields.course='AI SL';s.planning.fields.kind='modelling';
setCompletionField(s,'actualSource','Measured distances');setCompletionField(s,'actualMethod','Ruler measurements');setCompletionField(s,'dataStatus','ready');const a=recordSource(s).record;
recordSource(s,{fresh:true});setCompletionField(s,'actualSource','Measured times');setCompletionField(s,'actualMethod','Video timestamps');setCompletionField(s,'dataStatus','ready');const b=recordSource(s).record;
s.completion.accuracyDecisions=[{id:'length',quantity:'Distance',unit:'m',resolution:'0.1 m',policy:'Report distances to a justified precision'},{id:'time',quantity:'Time',unit:'s',resolution:'0.01 s',policy:'Report times to a justified precision'},{id:'temp',quantity:'Temperature',unit:'C',resolution:'1 C',policy:'UNRELATED temperature precision'}];
s.entries=[{id:'graph',phase:'first',kind:'scatter',title:'Observed distance-time graph',technique:'Scatter graph',purpose:'Inspect the actual relationship',status:'completed',result:'A curve is visible',observation:'curved',interpretation:'The changing rate matters to the aim',localTakeaway:'The plot is curved',sourceRefs:[a.id,b.id],accuracyRefs:['length','time']},
{id:'normal',phase:'substantial',title:'Normal model rather than PMCC',methodId:'normal',technique:'Normal probability',purpose:'Examine a measured probability',status:'completed',result:'A probability was calculated',sourceRefs:[b.id],accuracyRefs:['time']},
{id:'speed',phase:'substantial',fromEntryId:'graph',title:'Derived speed',methodId:'rates-from-data',technique:'Change in distance over time',purpose:'Interpret how motion changes',status:'completed',result:'A rate was calculated',sourceRefs:[a.id,b.id],accuracyRefs:['length','time'],knowledge:'syllabus'},
{id:'proof',phase:'substantial',title:'Independent exact identity',kind:'theory',methodId:'algebra',purpose:'Show the identity',status:'completed',result:'An exact identity',sourceRefs:[],accuracyRefs:[],knowledge:'syllabus'}];
s.completion.activeEntryIndex=2;setCompletionNode(s,'C40');
writeFileSync(out+'/project.json',JSON.stringify(s));writeFileSync(out+'/routes.json',JSON.stringify(C_ROUTES));
