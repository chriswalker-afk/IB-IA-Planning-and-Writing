import test from 'node:test';
import assert from 'node:assert/strict';
import {inflateSync} from 'node:zlib';
import {LEAF_AREA_SPEC} from '../src/core/samples/leaf-area.js';
import {INACCESSIBLE_HEIGHT_SPEC} from '../src/core/samples/inaccessible-height.js';
import {WATER_STATIONS_SPEC} from '../src/core/samples/water-stations.js';
import {renderTableSvg} from '../src/diagrams/table-studio-render.js';
import {hasDiagramEquation} from '../src/diagrams/diagram-notation.js';

test('embedded leaf reference is a complete, valid one-bit PNG with reproducible scanlines',()=>{
 const trace=LEAF_AREA_SPEC.figures.find(f=>f.tool==='trace').draft;
 const image=Buffer.from(trace.imageSrc.split(',')[1],'base64');
 assert.deepEqual([...image.subarray(0,8)],[137,80,78,71,13,10,26,10]);
 assert.equal(image.readUInt32BE(16),640);assert.equal(image.readUInt32BE(20),410);
 const compressed=[];let end=false;
 for(let offset=8;offset<image.length;){
  const length=image.readUInt32BE(offset),kind=image.toString('ascii',offset+4,offset+8);
  assert(offset+12+length<=image.length,'complete PNG chunk');
  let crc=0xffffffff;for(const b of image.subarray(offset+4,offset+8+length)){crc^=b;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
  assert.equal((crc^0xffffffff)>>>0,image.readUInt32BE(offset+8+length),'PNG '+kind+' CRC');
  if(kind==='IDAT')compressed.push(image.subarray(offset+8,offset+8+length));
  if(kind==='IEND')end=true;offset+=length+12;
 }
 assert(end);const bitmap=inflateSync(Buffer.concat(compressed));assert.equal(bitmap.length,410*81);
 for(let row=0;row<410;row++)assert.equal(bitmap[row*81],0,'scanline filter');

});
test('decision sample units and angle labels are explicitly typeset, not exposed raw TeX',()=>{
 for(const figure of LEAF_AREA_SPEC.figures.filter(f=>f.tool==='table')){
  assert(figure.draft.unitDecisions.filter(u=>u.unit).every(u=>hasDiagramEquation(u.unit)));
  const svg=renderTableSvg(figure.draft);
  const visible=[...svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)].map(m=>m[1]).join('');
  assert(!visible.includes('\\mathrm'));
  assert(svg.includes('diagram-math'));
 }
 const geometry=INACCESSIBLE_HEIGHT_SPEC.figures.find(f=>f.tool==='geometry').draft;
 assert(hasDiagramEquation(geometry.vertices[0].angleLabel));
 assert(hasDiagramEquation(geometry.guides[0].label));
 assert.equal(geometry.vertices[0].edgeLabelDy,36);
});
test('tracer and Voronoi reference figures carry their narrative numbers in the rendered title',()=>{
 for(const spec of [LEAF_AREA_SPEC,WATER_STATIONS_SPEC])for(const figure of spec.figures){
  if(['trace','voronoi'].includes(figure.tool))assert(figure.draft.title.startsWith('Figure '+figure.draft.figureNumber+'. '));
 }
 assert.equal(LEAF_AREA_SPEC.figures.find(f=>f.tool==='graph').draft.equationPlacement,'hidden');
});
