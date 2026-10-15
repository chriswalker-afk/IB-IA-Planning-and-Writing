import {readFile,writeFile} from 'node:fs/promises';
const path='src/examples/controller.js';
let s=await readFile(path,'utf8');
const old="if(['query','category','kind'].includes(key)){session[key]=t.value.slice(0,160);dialog.querySelector('#ex-results').innerHTML=libraryResults(session);}";
const replacement="// A text input's later blur/change must not replace a card between pointerdown and click.\n   const value=t.value.slice(0,160);\n   if(['query','category','kind'].includes(key)&&session[key]!==value){session[key]=value;dialog.querySelector('#ex-results').innerHTML=libraryResults(session);}";
if(s.split(old).length!==2)throw new Error('Expected one filter-update anchor');
await writeFile(path,s.replace(old,replacement));
console.log('Preserve result elements when filter value is unchanged.');
