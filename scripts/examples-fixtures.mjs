import {createProjectState} from '../src/core/project-state.js';
import {mkdir,writeFile} from 'node:fs/promises';
const s=createProjectState();s.route='completing';s.completion.current='C10';
Object.assign(s.planning.fields,{course:'AA SL',kind:'modelling',aim:'How well does a cooling model describe this trial?',motivation:'A genuine observation to investigate',permissionNeed:'no'});
Object.assign(s.project,{course:'AA SL',kind:'modelling',aim:s.planning.fields.aim});
s.scratch.introduction='MY ORIGINAL INTRODUCTION';s.scratch.conclusion='MY OWN CONCLUSION';
s.entries=[{id:'earlier',phase:'first',status:'completed',title:'Earlier recorded scatter',kind:'scatter',result:'My actual turning pattern',methodId:'',technique:'Plot paired observations',knowledge:'unsure',observation:'curved',purpose:'Check the shape',interpretation:'It curves',localTakeaway:'A turning pattern'},
{id:'later',phase:'substantial',status:'completed',title:'A different later record',kind:'model',methodId:'linear-regression',technique:'Linear regression',knowledge:'syllabus',result:'My later mathematical result',observation:'linear',purpose:'Different question'}];
s.completion.activeEntryIndex=0;s.completion.nextFromEntryId='earlier';s.completion.fields.permissionStatus='not-needed';s.teacher.pendingApproval=false;
await mkdir('qa-output',{recursive:true});await writeFile('qa-output/examples-fixture.json',JSON.stringify(s));
