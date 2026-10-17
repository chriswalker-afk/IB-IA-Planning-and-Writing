import test from 'node:test';
import assert from 'node:assert/strict';
import {redrawIdeaMapGraph} from '../src/ideas/map-layout.js';

function graphFixture(width=640){
 const result={paths:[],viewBox:''},origin={left:0,top:0,width,height:750,bottom:750};
 const positions=[
  ['hub','',280,20,80,90,false],
  ['root-hobbies','hub',20,165,160,90,false],
  ['root-daily','hub',240,165,160,90,false],
  ['root-world','hub',460,165,160,90,true],
  ['topic-nature','root-world',20,315,115,66,true],
  ['topic-weather','root-world',145,315,115,66,false],
  ['leaf-nature-0','topic-nature',90,441,130,60,true],
  ['seed-leaf-outline','leaf-nature-0',90,565,235,135,false]
 ];
 const node=(data)=>{
  const [id,parent,left,top,w,h,selected]=data;
  return {dataset:{ideaNode:id,ideaParent:parent},classList:{contains:name=>name==='selected'&&selected},getBoundingClientRect:()=>({left,top,width:w,height:h,bottom:top+h})};
 };
 const nodes=positions.map(node);
 const svg={
  setAttribute(key,value){if(key==='viewBox')result.viewBox=value;},
  replaceChildren(fragment){result.paths=[...fragment.children];}
 };
 const graph={isConnected:true,querySelector:q=>q==='[data-idea-map-connectors]'?svg:null,
  querySelectorAll:q=>q==='[data-idea-node]'?nodes:[],
  getBoundingClientRect:()=>origin
 };
 const makeSVG=(name)=>({tag:name,attrs:{},setAttribute(key,value){this.attrs[key]=value;}});
 const fakeDoc={createDocumentFragment:()=>({children:[],appendChild(node){this.children.push(node)}}),
  createElementNS:(ns,name)=>makeSVG(name)};
 return {graph,result,positions,origin,nodes,fakeDoc};
}
test('connector renderer attaches roots, subjects, details and ideas to real parent nodes',()=>{
 const old=globalThis.document;
 try{
  const f=graphFixture();globalThis.document=f.fakeDoc;
  redrawIdeaMapGraph(f.graph);
  assert.equal(f.result.paths.length,7);
  assert.equal(f.result.viewBox,'0 0 640 750');
  const ids=f.result.paths.map(p=>p.attrs['data-edge-to']);
  for(const id of ['root-world','topic-nature','leaf-nature-0','seed-leaf-outline'])
   assert(ids.includes(id),id);
  for(const path of f.result.paths){
   assert(path.attrs.d.startsWith('M '));
   assert(path.attrs.d.includes(' C '));
  }
  assert(f.result.paths.find(p=>p.attrs['data-edge-to']==='topic-nature').attrs.class.includes('is-active'));
  assert(f.result.paths.find(p=>p.attrs['data-edge-to']==='root-hobbies').attrs.class.includes('is-muted'));
 }finally{globalThis.document=old;}
});
test('connector geometry recalculates when the responsive map changes shape',()=>{
 const old=globalThis.document;
 try{
  const f=graphFixture();globalThis.document=f.fakeDoc;
  redrawIdeaMapGraph(f.graph);
  const desktop=f.result.paths.find(p=>p.attrs['data-edge-to']==='leaf-nature-0').attrs.d;
  f.origin.width=350;
  f.nodes.find(n=>n.dataset.ideaNode==='leaf-nature-0').getBoundingClientRect=()=>({left:10,top:535,width:155,height:70,bottom:605});
  redrawIdeaMapGraph(f.graph);
  assert.equal(f.result.viewBox,'0 0 350 750');
  const mobile=f.result.paths.find(p=>p.attrs['data-edge-to']==='leaf-nature-0').attrs.d;
  assert.notEqual(desktop,mobile);
  assert.equal(f.result.paths.length,7);
 }finally{globalThis.document=old;}
});
test('unmounted graphs are left untouched',()=>{
 const old=globalThis.document;
 try{
  const f=graphFixture();globalThis.document=f.fakeDoc;f.graph.isConnected=false;
  redrawIdeaMapGraph(f.graph);
  assert.equal(f.result.paths.length,0);
 }finally{globalThis.document=old;}
});
