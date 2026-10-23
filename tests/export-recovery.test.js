import test from 'node:test';
import assert from 'node:assert/strict';
import {fullProjectExportRecovery} from '../src/handover/export-recovery.js';
import {createProjectState,normalizeProjectState} from '../src/core/project-state.js';
import {createFullProjectExport} from '../src/handover/full-export.js';

test('a stale GitHub Pages chunk yields an actionable JSON-first reload explanation',()=>{
 for(const text of [
  'Failed to fetch dynamically imported module: https://example.github.io/chunks/full-export-OLD.js',
  'Importing a module script failed.',
  'ChunkLoadError: Loading chunk 51 failed',
  'Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html".'
 ]){
  const tip=fullProjectExportRecovery(new TypeError(text));
  assert.equal(tip.kind,'module',text);
  assert.match(tip.message,/JSON backup/i);
  assert.match(tip.message,/reload/i);
  assert(!tip.toast.includes('filename'));
 }
});
test('figure, size, and genuinely unknown failures do not get misdiagnosed as updates',()=>{
 const samples=[
  [new Error('Cannot render saved geometry figure: My diagram'),'figure'],
  [new Error('The diagram could not be reconstructed: invalid input'),'figure'],
  [new Error('Planning snapshot exceeds export size limit.'),'size'],
  [new Error('Canvas allocation unexpectedly failed'),'other']
 ];
 for(const [error,expected] of samples){
  const tip=fullProjectExportRecovery(error);
  assert.equal(tip.kind,expected,error.message);
  assert.match(tip.message,/JSON backup/i);
  assert(!tip.message.includes('My diagram'),'Do not expose private figure names in the UI');
 }
});
test('both new Idea Lab modes still generate PDF, Word and ZIP without completed IA work',async()=>{
 for(const mode of ['interests','data']){
  const s=createProjectState();
  s.route='planning';s.planning.current='N00B';
  s.ideaExplorer.map={mode,root:mode==='data'?'measure':'hobbies',
   topic:mode==='data'?'':'sport',subtopic:'',
   dataBranch:mode==='data'?'shape':'',mathRoute:''};
  s.ideaExplorer.shortlist=[{id:'idea-1',seedId:'own',question:'How might I optimise a real object?',detail:'Consider a constrained quantity',focus:'Sport'}];
  const data=normalizeProjectState(JSON.parse(JSON.stringify(s)));
  const original=JSON.stringify(data);
  for(const fmt of ['pdf','docx','zip']){
   const output=await createFullProjectExport(data,fmt);
   assert(output.bytes.length>1500,mode+' '+fmt);
   assert.equal(output.name.endsWith('.'+fmt),true);
   assert.equal(JSON.stringify(data),original,'Export changed an Idea Lab project');
  }
 }
});
