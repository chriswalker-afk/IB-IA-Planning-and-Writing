import {writeFileSync,mkdirSync} from 'node:fs';
import {createProjectState} from '../src/core/project-state.js';
const dir=process.env.IA_QA_OUTPUT||'qa-output';mkdirSync(dir,{recursive:true});
const blank=createProjectState();writeFileSync(dir+'/experience-new.json',JSON.stringify(blank));
const own=createProjectState();own.project.aim=own.planning.fields.aim='How does my recorded radius affect a model area?';own.project.course=own.planning.fields.course='AA SL';own.project.kind=own.planning.fields.kind='modelling';own.route='completing';own.ui.writingIntroSeen=true;own.ui.writerGuideIntroSeen=true;own.completion.current='C10';own.completion.visited=['C10'];own.completion.stages.C10='working';own.ui.lastWorkRoute='completing';own.ui.lastStudioNode='C10';own.scratch.introduction='These are my own original notes. Preserve them.';writeFileSync(dir+'/experience-own.json',JSON.stringify(own));
