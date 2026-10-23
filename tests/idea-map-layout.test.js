import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {redrawIdeaMapGraph,computeIdeaMapPositions} from '../src/ideas/map-layout.js';

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


/** Both starting modes share the constellation. Check real node footprints at
 * phone, tablet and desktop widths rather than only testing SVG path strings. */
const layoutNodes=(width,mode,stage)=>{
 const compact=width<=800,phone=width<=380;
 const rootW=compact?(phone?130:138):176;
 const branchW=compact?(phone?136:145):157;
 const leafW=compact?(phone?129:139):143;
 const seedW=compact?width-30:Math.min(width*.4,348);
 const roots=mode==='data'?['measure','record','find']:['hobbies','daily','world'];
 const active=mode==='data'?'root-record':'root-hobbies';
 const nodes=[{id:'hub',width:compact?152:174,height:compact?96:108},
  ...roots.map(id=>({id:'root-'+id,parent:'hub',width:rootW,height:compact?92:105}))];
 if(stage==='roots')return nodes;
 const branches=mode==='data'?['compare','survey','repeat']:['sport','music','games','food','design'];
 nodes.push(...branches.map(id=>({
  id:(mode==='data'?'access-':'topic-')+id,parent:active,width:mode==='data'?(compact?(phone?136:145):174):branchW,
  height:mode==='data'?106:86
 })));
 if(stage==='branches')return nodes;
 if(mode==='data'){
  nodes.push(...['sport-consistency','wildlife-observations','school-queue'].map(id=>({
   id:'seed-'+id,parent:'access-compare',width:seedW,height:190
  })));
 }else{
  nodes.push(...['Badminton','Football','Running','Swimming'].map((_,i)=>({
   id:'leaf-sport-'+i,parent:'topic-sport',width:leafW,height:74
  })));
  if(stage==='leaves')return nodes;
  nodes.push(...['sport-position','sport-consistency'].map(id=>({
   id:'seed-'+id,parent:'leaf-sport-0',width:seedW,height:193
  })));
 }
 return nodes;
};
test('free-form Idea Lab avoids bubble collisions and clipping across both modes',()=>{
 for(const mode of ['interests','data']){
  for(const width of [320,375,390,600,760,800,801,1050,1440]){
   for(const stage of (mode==='data'?['roots','branches','seeds']:['roots','branches','leaves','seeds'])){
    const nodes=layoutNodes(width,mode,stage);
    const {height,positions}=computeIdeaMapPositions(nodes,width);
    assert.equal(positions.size,nodes.length,mode+' '+width+' '+stage);
    assert(height>0&&height<8000);
    const all=nodes.map(n=>({...n,...positions.get(n.id)}));
    for(const a of all){
     assert(a.left>=-1,mode+' '+width+' '+stage+' left: '+a.id+' '+a.left);
     assert(a.left+a.width<=width+1,mode+' '+width+' '+stage+' right: '+a.id);
     assert(a.top>=0&&a.top+a.height<=height,mode+' '+width+' '+stage+' vertical: '+a.id);
     for(const b of all){
      if(a===b)continue;
      const overlapX=a.left<b.left+b.width-2&&a.left+a.width>b.left+2;
      const overlapY=a.top<b.top+b.height-2&&a.top+a.height>b.top+2;
      assert(!(overlapX&&overlapY),mode+' '+width+' '+stage+' overlapping '+a.id+' and '+b.id);
     }
    }
    assert.deepEqual([...positions], [...computeIdeaMapPositions(nodes,width).positions],
      'Layouts should stay stable after re-renders');
   }
  }
 }
});
test('Idea Lab CSS supports animated accessible pastel bubbles',()=>{
 const css=readFileSync(new URL('../data/idea-map.css',import.meta.url),'utf8');
 assert(css.includes('ideaBubbleFloat'));
 assert(css.includes('.idea-map-network[data-idea-map-mode="data"]'));
 assert(css.includes('.idea-map-network:not([data-idea-map-ready])'));
 assert(css.includes('@media(prefers-reduced-motion:reduce)'));
});
