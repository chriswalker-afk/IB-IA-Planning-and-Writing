import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const csv=readFileSync(resolve(root,'docs/examiner-feedback-coverage-ledger-2026-10-26.csv'),'utf8');
const expectedSections=[21,31,46,24,45,29,20,35,25,7,39,31,19,20];
const expectedStatus={present:213,partial:51,'review-only':40,'staff-only':75,'policy-dependent':13};
const columns=11;

function rowFields(line){
 const fields=[];let field='',quoted=false;
 for(let i=0;i<line.length;i++){
  const c=line[i];
  if(c==='"'&&quoted&&line[i+1]==='"'){field+='"';i++;continue;}
  if(c==='"'){quoted=!quoted;continue;}
  if(c===','&&!quoted){fields.push(field);field='';continue;}
  field+=c;
 }
 if(quoted)throw new Error('Unclosed CSV field');
 fields.push(field);
 return fields;
}
const records=csv.trimEnd().split(/\r?\n/).map(rowFields);
const header=['ID','PDF page','Section','Theme','Coverage','Audience','Student surface','Existing code evidence','Decision','Follow-up pass','Source recommendation'];

test('exact, ordered and fully classified 392-item examiner feedback inventory',()=>{
 assert.deepEqual(records[0],header);
 assert.equal(records.length,393);
 const counts=Object.fromEntries(Object.keys(expectedStatus).map(s=>[s,0]));
 const sections=Array(14).fill(0);
 for(let i=1;i<records.length;i++){
  const row=records[i];
  assert.equal(row.length,columns,'CSV columns on row '+i);
  assert.equal(row[0],'EF'+String(i).padStart(3,'0'));
  const page=Number(row[1]),section=Number(row[2].slice(1));
  assert.ok(page>=3&&page<=21,'PDF page '+row[1]);
  assert.ok(section>=1&&section<=14,'Section '+row[2]);
  assert.ok(row[3]&&row[10],row[0]+' missing theme or original recommendation');
  assert.ok(Object.hasOwn(counts,row[4]),row[0]+' unknown classification');
  assert.ok(['student','teacher','process'].includes(row[5]),row[0]+' unknown audience');
  assert.ok(row[6]&&row[7]&&row[8]&&row[9],row[0]+' incomplete audit annotation');
  if(row[4]==='partial')assert.ok(['P2','P3','P4'].includes(row[9]),row[0]+' partial lacks delivery pass');
  if(row[4]==='staff-only')assert.equal(row[5],'teacher',row[0]+' misleading student requirement');
  for(const path of row[7].split(' | ')){
   assert.ok(existsSync(resolve(root,path)),row[0]+' invalid repository evidence path: '+path);
  }
  counts[row[4]]++;sections[section-1]++;
 }
 assert.deepEqual(sections,expectedSections);
 assert.deepEqual(counts,expectedStatus);
});
