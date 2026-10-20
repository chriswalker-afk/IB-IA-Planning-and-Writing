import {
 Document,Packer,Paragraph,TextRun,HeadingLevel,AlignmentType,
 Footer,ExternalHyperlink,BorderStyle,ImageRun
} from "docx";
import JSZip from "jszip";
import {REPORT_ATTACHMENT,REPORT_MAX_BYTES,normalizePlanningEnvelope} from "../schema.js";
import {modelFromEnvelope} from "../report-model.js";

const CUSTOM_XML_PATH="customXml/iaPathfinderPlan.xml";
const CUSTOM_XML_NS="urn:ia-pathfinder:planning:1";
const NAVY="1B3340",TEAL="13786F",MUTED="617176",LIGHT="EAF5F0",AMBER="9B6733";
const run=(text,{bold=false,color=NAVY,size=21,italics=false}={})=>new TextRun({text:String(text),bold,color,size,italics,font:"Aptos"});
const para=(children,options={})=>new Paragraph({
  children:Array.isArray(children)?children:[run(children)],spacing:{after:125,line:330},
  ...options
});
const title=(text)=>para([run(text,{bold:true,size:43,color:NAVY})],{
  spacing:{before:100,after:140,line:480},keepNext:true
});
const headline=(text)=>para([run(text,{bold:true,size:25,color:TEAL})],{
  spacing:{before:320,after:100,line:360},keepNext:true,
  border:{bottom:{color:"DCE9E2",style:BorderStyle.SINGLE,size:6}}
});
const field=(label,value,link=false)=>{
 const components=[para([run(label.toUpperCase(),{bold:true,color:TEAL,size:17})],
  {spacing:{before:100,after:20},keepNext:true})];
 if(link){
  try{
   const u=new URL(value);
   if(["http:","https:"].includes(u.protocol)){
    components.push(para([new ExternalHyperlink({
     children:[run(value,{color:TEAL,size:21})],link:u.href
    })],{spacing:{after:145}}));
    return components;
   }
  }catch{}
 }
 components.push(para([run(value,{size:21})],{spacing:{after:145}}));
 return components;
};
const bytesToBase64=bytes=>{
 let binary="";
 for(let i=0;i<bytes.length;i+=0x8000)
   binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
 return btoa(binary);
};
const base64ToBytes=value=>{
 const raw=atob(value.replace(/\s+/g,""));const out=new Uint8Array(raw.length);
 for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);
 return out;
};
function ensureZipSize(zip){
 const limit=18_000_000;
 let total=0;
 for(const obj of Object.values(zip.files)){
  if(obj.dir)continue;
  total+=(obj._data?.uncompressedSize||0);
  if(total>limit)throw new Error("This Word file is too large to inspect safely.");
 }
}
async function embedPayload(docxBytes,payload){
 const zip=await JSZip.loadAsync(docxBytes);
 const [types,rels]=await Promise.all([
   zip.file("[Content_Types].xml")?.async("string"),
   zip.file("word/_rels/document.xml.rels")?.async("string")
 ]);
 if(!types||!rels)throw new Error("Word document is missing its packaging metadata.");
 if(zip.file(CUSTOM_XML_PATH))throw new Error("Conflicting Pathfinder metadata part.");
 const text=JSON.stringify(payload),bytes=new TextEncoder().encode(text);
 if(bytes.length>REPORT_MAX_BYTES)throw new Error("The embedded plan exceeds the report limit.");
 const xml='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
   '<ia:plan xmlns:ia="'+CUSTOM_XML_NS+'" format="'+REPORT_ATTACHMENT+'"><ia:payload encoding="base64">'+
   bytesToBase64(bytes)+'</ia:payload></ia:plan>';
 zip.file(CUSTOM_XML_PATH,xml);
 const relationship='<Relationship Id="rIdIAPathfinderPlan"'+
  ' Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/customXml"'+
  ' Target="../'+CUSTOM_XML_PATH+'"/>';
 if(!rels.includes("</Relationships>"))throw new Error("Word relationships could not be updated.");
 zip.file("word/_rels/document.xml.rels",rels.replace("</Relationships>",relationship+"</Relationships>"));
 const contentType='<Override PartName="/'+CUSTOM_XML_PATH+'" ContentType="application/xml"/>';
 if(!types.includes("</Types>"))throw new Error("Word content types could not be updated.");
 zip.file("[Content_Types].xml",types.replace("</Types>",contentType+"</Types>"));
 return zip.generateAsync({type:"uint8array",compression:"DEFLATE",compressionOptions:{level:6}});
}
export async function createDocxPlanningReport(envelope,fullProjectModel=null){
 const payload=normalizePlanningEnvelope(envelope),model=fullProjectModel||modelFromEnvelope(payload);
 const paragraphs=[
   para([run("IA  /  PATHFINDER",{color:TEAL,bold:true,size:19})],{spacing:{after:210}}),
   title(model.title),
   para([run(model.aim,{size:27,color:NAVY})],{spacing:{after:230,line:420}}),
   para([run(model.status,{bold:true,color:model.flags.length?AMBER:TEAL,size:19})],{
    shading:{fill:model.flags.length?"FBF1E4":LIGHT},
    indent:{left:185,right:185},spacing:{before:120,after:190}
   }),
   para([run("Course: "+model.course+"    |    Exported: "+(model.exportedAt?.slice(0,10)||"To confirm"),
    {color:MUTED,size:18})],{spacing:{after:280}})
 ];
 if(model.isDemonstration)paragraphs.push(
   para([run("DEMONSTRATION PROJECT — not real student data.",{bold:true,color:AMBER})],{spacing:{after:180}})
 );
 if(model.flags.length){
  paragraphs.push(headline("Teacher discussion / outstanding questions"));
  for(const flag of model.flags){
   paragraphs.push(...field(flag.title,flag.note));
  }
 }
 for(const sec of model.sections){
  paragraphs.push(headline(sec.title));
  if(sec.description)paragraphs.push(para([run(sec.description,{italics:true,color:MUTED,size:18})],{
   spacing:{after:210,line:280}}));
  for(const figure of sec.figures||[]){
   if(!figure.pngBytes)continue;
   const width=450,height=Math.max(70,Math.round(width*figure.pixelHeight/figure.pixelWidth));
   paragraphs.push(para([new ImageRun({data:figure.pngBytes,type:'png',transformation:{width,height},altText:{title:figure.title,description:figure.title,name:figure.title}})],{spacing:{after:175}}));
  }
  for(const item of sec.rows)paragraphs.push(...field(item.label,item.value,item.link));
 }
 paragraphs.push(headline(fullProjectModel?"About this full working record":"About this planning document"));
 paragraphs.push(para([run(model.footnote,{size:18,color:MUTED})],{spacing:{after:150}}));
 const doc=new Document({
  creator:"IA Pathfinder",title:model.title,
  description:fullProjectModel?"Student-entered full working record with a Planning-only reimport snapshot.":"Provisional student IB Mathematics planning record with importable snapshot.",
  sections:[{
   properties:{page:{
    size:{width:12240,height:15840},
    margin:{top:920,right:1000,bottom:900,left:1000}
   }},
   footers:{default:new Footer({children:[
    para([run(fullProjectModel?"IA PATHFINDER / WORKING RECORD — NOT AN IA SUBMISSION":"IA PATHFINDER  /  PROVISIONAL — NOT TEACHER APPROVAL",{size:15,color:MUTED})],{
      alignment:AlignmentType.RIGHT,spacing:{before:90,after:0}
    })
   ]})},
   children:paragraphs
  }]
 });
 const blob=await Packer.toBlob(doc);
 return embedPayload(new Uint8Array(await blob.arrayBuffer()),payload);
}
export async function importEmbeddedDocxReport(bytes){
 const zip=await JSZip.loadAsync(bytes);
 ensureZipSize(zip);
 // Word may rename a custom XML part on save; use its namespace, not only our path.
 const candidates=Object.keys(zip.files).filter(x=>x.startsWith("customXml/")&&x.endsWith(".xml")).slice(0,30);
 for(const path of candidates){
  const entry=zip.file(path);
  if(!entry||entry._data?.uncompressedSize>REPORT_MAX_BYTES*2)continue;
  const content=await entry.async("string");
  if(!content.includes(CUSTOM_XML_NS)||!content.includes("<ia:payload"))continue;
  const encoded=content.match(/<ia:payload\b[^>]*encoding="base64"[^>]*>([A-Za-z0-9+/=\s]+)<\/ia:payload>/);
  if(!encoded)throw new Error("The embedded Word planning data is damaged.");
  const data=base64ToBytes(encoded[1]);
  if(data.length>REPORT_MAX_BYTES)throw new Error("The Word planning snapshot is too large.");
  try{return normalizePlanningEnvelope(JSON.parse(new TextDecoder().decode(data)));}
  catch(error){throw new Error("Embedded Word planning snapshot could not be validated: "+error.message);}
 }
 return null;
}
export async function extractReadableDocxText(bytes){
 const zip=await JSZip.loadAsync(bytes);ensureZipSize(zip);
 const entry=zip.file("word/document.xml");
 if(!entry)return"";
 if(entry._data?.uncompressedSize>1_500_000)throw new Error("Document text too large for partial recovery.");
 const xml=await entry.async("string");
 const decode=s=>s.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&apos;/g,"'");
 const paras=[...xml.matchAll(/<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g)].slice(0,1100);
 return paras.map(p=>[...p[1].matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g)]
  .map(m=>decode(m[1])).join("")).filter(Boolean).join("\n").slice(0,250_000);
}
