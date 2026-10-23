/** The same authored answers feed the fields, continuous reader and exports. */
import {referenceSampleSpec} from './sample-library.js';
import {sampleWorksActuallyCited} from './samples/mla-references.js';
import {collectProjectFigures,figureForEntry} from '../handover/figure-report.js';
import {mixedMathPreview,escapeMixedHtml} from '../math/mixed-math.js';

const value=text=>String(text??'').trim();
const textBlock=(text,field)=>value(text)?{type:'text',value:value(text),field}:null;
const section=(title,blocks)=>({title,description:'',blocks:blocks.filter(Boolean),
 rows:blocks.filter(block=>block?.type==='text').map(block=>({label:'',value:block.value})),
 figures:blocks.filter(block=>block?.type==='figure').map(block=>block.figure)});

// Several inline generator SVGs can use the same internal clip/marker IDs.
// Namespace those IDs in the continuous reader so a neighbouring figure cannot
// borrow the first figure's clipping rectangle or arrow marker.
function inlineFigureSvg(figure){
 const prefix='sample-'+figure.kind+'-'+figure.id+'-';
 const ids=new Map([...figure.svg.matchAll(/\sid="([^"]+)"/g)].map(match=>[match[1],prefix+match[1]]));
 return figure.svg.replace(/\sid="([^"]+)"/g,(_all,id)=>' id="'+ids.get(id)+'"')
  .replace(/url\(#([^)]+)\)/g,(all,id)=>ids.has(id)?'url(#'+ids.get(id)+')':all)
  .replace(/\b(href|xlink:href)="#([^"]+)"/g,(all,key,id)=>ids.has(id)?key+'="#'+ids.get(id)+'"':all);
}

export function referenceIAPagesModel(state){
 const spec=referenceSampleSpec(state?.demo);
 if(!spec)throw new Error('Open a complete illustrative investigation first.');
 const f=state.completion.fields,figures=collectProjectFigures(state),sections=[];
 const intro=[textBlock(state.scratch.introduction,'scratch.introduction')];
 if(f.firstMathsBridgePlacement==='intro')intro.push(textBlock(f.dataAimLink,'completion.fields.dataAimLink'));
 sections.push(section('1 · Introduction',intro));
 sections.push(section('2 · Starting material and mathematical approach',[
  textBlock(state.scratch.dataNotes,'scratch.dataNotes'),
  f.firstMathsBridgePlacement!=='intro'?textBlock(f.dataAimLink,'completion.fields.dataAimLink'):null,
  textBlock(f.methodReason,'completion.fields.methodReason'),
  textBlock(f.firstMethodEvaluation,'completion.fields.firstMethodEvaluation')
 ]));
 for(const [index,entry] of state.entries.entries()){
  const associated=figures.filter(figure=>figureForEntry(figure,entry));
  const placed=new Set(),blocks=[];
  const addFigures=after=>{
   for(const figure of associated){
    const plan=spec.figures.find(item=>item.id===figure.id);
    if((plan?.after||'result')===after&&!placed.has(figure.id)){
     blocks.push({type:'figure',figure});placed.add(figure.id);
    }
   }
  };
  for(const key of ['bridge','purpose','result','interpretation','limitations','nextQuestion','nextWhy']){
   const block=textBlock(entry[key],'entries['+index+'].'+key);
   if(block)blocks.push(block);
   addFigures(key);
  }
  // New figures added while exploring a sample remain visible in its reader.
  for(const figure of associated)if(!placed.has(figure.id))blocks.push({type:'figure',figure});
  sections.push(section((index+3)+' · '+value(entry.title||'Mathematical stage '+(index+1)),blocks));
 }
 sections.push(section((state.entries.length+3)+' · Conclusion',[
  textBlock(f.mainConclusion,'completion.fields.mainConclusion'),
  textBlock(f.conclusionBenefit,'completion.fields.conclusionBenefit'),
  textBlock(f.conclusionExtension,'completion.fields.conclusionExtension')
 ]));
 // The constructed-data recipe is disclosed in Starting material and
 // in the sample provenance header. It is not a fictitious outside publication.
 const shown=sections.flatMap(part=>part.blocks.filter(b=>b.type==='text').map(b=>b.value)).join('\n');
 const works=sampleWorksActuallyCited(spec,shown);
 if(works.length){
  const entries=works.map(item=>({...textBlock(item.work,'worksCited['+item.id+']'),url:item.url}));
  sections.push(section((state.entries.length+4)+' · Works Cited',entries));
 }else{
  const original=spec.references||[];
  const notes=original.length?original.map(item=>[item.label,item.value].filter(Boolean).join(': ')):
   [spec.provenance||'Original constructed mathematical scenario'];
  sections.push(section((state.entries.length+4)+' · Constructed inputs and provenance (no external Works Cited)',
    notes.map((content,index)=>textBlock(content,'references['+index+']'))));
 }
 return {
  title:value(state.planning.fields.provisionalTitle)||spec.title,
  aim:value(state.planning.fields.aim),course:state.planning.fields.course,
  strapline:'IA PATHFINDER · COMPLETE FICTIONAL INVESTIGATION',
  status:'FICTIONAL STUDENT EXAMPLE',provenance:spec.readingNote||spec.provenance,
  isDemonstration:true,isIllustrativeIA:true,isCompleteIllustrativeIA:true,
  flags:[],exportedAt:new Date().toISOString(),sections,
  footnote:'This complete fictional investigation illustrates mathematical writing and decisions. Its stated data and assumptions define the scope of its conclusions. It is not an assessed student submission.'
 };
}

export function sampleDocumentWordCount(model){
 return model.sections.reduce((total,part)=>total+part.rows.reduce((sum,row)=>sum+
  value(row.value).split(/\s+/).filter(Boolean).length,0),0);
}

export function renderIllustrativeIAReading(model){
 const e=escapeMixedHtml,prose=text=>'<div class="sample-reader-prose">'+mixedMathPreview(text,{editable:false})+'</div>';
 const body=model.sections.map((part,index)=>'<section class="sample-reader-section" id="sample-section-'+index+'">'+
  '<h3>'+e(part.title)+'</h3>'+(part.blocks||part.rows.map(row=>({type:'text',value:row.value}))).map(block=>{
   if(block.type==='text'){
    if(block.field?.startsWith('worksCited['))
     return '<div class="sample-reader-mla-entry">'+prose(block.value)+
      (block.url&&/^https:\/\/[^\s]+$/.test(block.url)?'<a class="sample-reader-mla-source-link" href="'+e(block.url)+'" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">Open original source ↗</a>':'')+'</div>';
    return prose(block.value);
   }
   const figure=block.figure;
   if(figure.error)return '<p class="sample-reader-error">'+e(figure.error)+'</p>';
   return '<figure class="sample-reader-figure" data-sample-figure="'+e(figure.id)+'" aria-label="'+e(figure.title)+'">'+inlineFigureSvg(figure)+'</figure>';
  }).join('')+'</section>').join('');
 return '<article class="sample-reader" aria-label="Complete fictional IA">'+
  '<header><p class="sample-reader-kicker">Complete fictional investigation · '+e(model.course)+'</p>'+ 
  '<h2>'+e(model.title)+'</h2>'+prose(model.provenance||'Fictional mathematical exploration.')+
  '<div class="button-row"><button type="button" class="btn btn-secondary btn-sm" data-action="export-sample-ia-pdf">Download PDF</button>'+ 
  '<button type="button" class="btn btn-secondary btn-sm" data-action="export-sample-ia-docx">Download Word</button></div></header>'+body+'</article>';
}
