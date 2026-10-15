import {
 PDFDocument,StandardFonts,rgb,PDFName,PDFDict,PDFArray,PDFStream,PDFString,PDFHexString,
 PDFRawStream,decodePDFRawStream
} from "pdf-lib";
import {REPORT_ATTACHMENT,REPORT_MAX_BYTES,normalizePlanningEnvelope} from "../schema.js";
import {modelFromEnvelope} from "../report-model.js";

const PAGE=[612,792], MARGIN=52, PAPER_WIDTH=PAGE[0]-MARGIN*2;
const INK=rgb(.105,.188,.231), TEAL=rgb(.09,.47,.41), MUTED=rgb(.41,.48,.50),
 STROKE=rgb(.86,.91,.89), LIGHT=rgb(.94,.975,.96), GOLD=rgb(.97,.91,.76);
function pdfText(value,font){
 const s=String(value??"").replace(/\t/g,"  ")
   .replace(/[\u0000-\u001f]/g,c=>c==="\n"?"\n":" ")
   .replace(/[\u2014\u2013\u2212]/g,"-").replace(/[\u2018\u2019]/g,"'")
   .replace(/[\u201c\u201d]/g,'"').replace(/\u2026/g,"...")
   .replace(/[\u25b6\u2192]/g,"->");
 let result="";
 for(const ch of s){
  if(ch==="\n"){result+="\n";continue;}
  try{font.encodeText(ch);result+=ch;}
  catch{
   const maths={"\u03c0":"pi","\u03b1":"alpha","\u03b2":"beta","\u03b8":"theta",
   "\u03bc":"mu","\u03bb":"lambda","\u221a":"sqrt","\u222b":"integral",
   "\u2211":"sum","\u03a3":"sum","\u2264":"<=","\u2265":">=","\u2248":"~",
   "\u2208":" in ","\u22ef":"...","\u2080":"_0","\u2081":"_1","\u2082":"_2",
   "\u2083":"_3","\u2084":"_4","\u2085":"_5","\u2099":"_n",
   "\u2096":"_k","\u2098":"_m","\u207f":"^n"};
   result+=maths[ch]||"?";
  }
 }
 return result;
}
function wrap(text,font,size,maxWidth){
 const paragraphs=pdfText(text,font).split(/\n/g),all=[];
 for(const para of paragraphs){
  if(!para.trim()){all.push("");continue;}
  let line="";
  const words=para.split(/\s+/g);
  for(const word of words){
   if(font.widthOfTextAtSize(word,size)>maxWidth){
    if(line){all.push(line);line="";}
    let chunk="";
    for(const char of word){
     if(chunk&&font.widthOfTextAtSize(chunk+char,size)>maxWidth){all.push(chunk);chunk="";}
     chunk+=char;
    }
    line=chunk;
   }else{
    const next=line?line+" "+word:word;
    if(line&&font.widthOfTextAtSize(next,size)>maxWidth){all.push(line);line=word;}
    else line=next;
   }
  }
  if(line)all.push(line);
 }
 return all;
}
function addPdfLink(doc,page,x,y,width,height,url){
 try{
  const candidate=new URL(url);
  if(!["https:","http:"].includes(candidate.protocol))return;
  const annotation=doc.context.obj({
   Type:"Annot",Subtype:"Link",Rect:[x,y,x+width,y+height],
   Border:[0,0,0],A:{Type:"Action",S:"URI",URI:PDFString.of(candidate.href)}
  });
  const ref=doc.context.register(annotation);
  page.node.addAnnot(ref);
 }catch{/* Invalid student-entered URLs remain plain text. */}
}
export async function createPdfPlanningReport(envelope,fullProjectModel=null){
 const payload=normalizePlanningEnvelope(envelope),model=fullProjectModel||modelFromEnvelope(payload);
 const doc=await PDFDocument.create();
 doc.setTitle(model.title);doc.setAuthor("IA Pathfinder");
 doc.setSubject(fullProjectModel?"Full student-owned working record, with planning-only reimport attachment":"Provisional student planning record, with a versioned Pathfinder attachment");
 doc.setKeywords(["IA Pathfinder","planning","provisional","reimportable"]);
 doc.setLanguage("en");
 const regular=await doc.embedFont(StandardFonts.Helvetica),
  bold=await doc.embedFont(StandardFonts.HelveticaBold);
 let page, y,number=0;
 const newPage=()=>{
  page=doc.addPage(PAGE);number++;y=PAGE[1]-MARGIN;
  page.drawRectangle({x:0,y:PAGE[1]-10,width:PAGE[0],height:10,color:TEAL});
  page.drawText("IA  /  PATHFINDER",{x:MARGIN,y:PAGE[1]-35,size:8,font:bold,color:TEAL,characterSpacing:1.2});
  page.drawLine({start:{x:MARGIN,y:42},end:{x:PAGE[0]-MARGIN,y:42},thickness:.8,color:STROKE});
  page.drawText(fullProjectModel?"FULL PROJECT WORKING RECORD":"PROVISIONAL PLANNING RECORD",{x:MARGIN,y:28,size:8,font:regular,color:MUTED});
  page.drawText(String(number),{x:PAGE[0]-MARGIN-10,y:28,size:8,font:regular,color:MUTED});
 };
 const requireSpace=points=>{if(y-points<62)newPage();};
 const write=(value,{font=regular,size=10,color=INK,x=MARGIN,maxWidth=PAPER_WIDTH,lineHeight=14,after=0,link=false}={})=>{
  const lines=wrap(value,font,size,maxWidth);
  for(const line of lines){
   requireSpace(lineHeight+3);
   if(line){
    page.drawText(line,{x,y,size,font,color});
    if(link){
     const len=Math.min(maxWidth,font.widthOfTextAtSize(line,size));
     addPdfLink(doc,page,x,y-2,len,lineHeight,line.trim());
    }
   }
   y-=lineHeight;
  }
  y-=after;
 };
 const heading=(label)=>{
  requireSpace(57);
  y-=12;
  page.drawRectangle({x:MARGIN,y:y-28,width:PAPER_WIDTH,height:33,color:LIGHT});
  page.drawText(pdfText(label,bold).slice(0,90),{x:MARGIN+12,y:y-15,size:12,font:bold,color:TEAL});
  y-=45;
 };
 newPage();
 y-=24;
 write(model.strapline,{font:bold,color:TEAL,size:10,after:15});
 write(model.title,{font:bold,size:25,lineHeight:30,after:8});
 write(model.aim,{size:14,color:INK,lineHeight:19,after:18});
 requireSpace(42);
 page.drawRectangle({x:MARGIN,y:y-24,width:PAPER_WIDTH,height:31,color:model.flags.length?GOLD:LIGHT});
 write(model.status,{x:MARGIN+10,maxWidth:PAPER_WIDTH-20,size:9,font:bold,color:INK,lineHeight:12,after:17});
 write("Course: "+model.course+"    |    Exported: "+(model.exportedAt?model.exportedAt.slice(0,10):"Date to confirm"),{size:9,color:MUTED,after:15});
 if(model.isDemonstration){
  write("DEMONSTRATION PROJECT - Do not submit illustrative examples as your own results.",{size:10,font:bold,color:TEAL,after:13});
 }
 if(model.flags.length){
  heading("Teacher discussion / items to confirm");
  for(const flag of model.flags){
   requireSpace(47);
   write(flag.title,{font:bold,size:10,after:2});
   write(flag.note,{size:9,color:MUTED,lineHeight:12,after:9});
  }
 }
 for(const group of model.sections){
  heading(group.title);
  if(group.description)write(group.description,{size:9,color:MUTED,lineHeight:12,after:12});
  for(const row of group.rows){
   requireSpace(40);
   write(row.label.toUpperCase(),{font:bold,size:8,color:TEAL,lineHeight:11,after:2});
   const startPage=page;
   write(row.value,{font:regular,size:10,lineHeight:14,after:12});
   // Link annotations are only placed for plausible single-line HTTPS links.
   if(row.link&&/^https?:\/\/\S+$/i.test(row.value)&&startPage===page){
    // A link can span lines; add annotations on printed segments rather than creating
    // invisible overlapping annotations across the page.
    const lines=wrap(row.value,regular,10,PAPER_WIDTH);
    if(lines.length===1){
     const width=Math.min(PAPER_WIDTH,regular.widthOfTextAtSize(lines[0],10));
     addPdfLink(doc,page,MARGIN,y+12,width,14,row.value);
    }
   }
  }
 }
 heading(fullProjectModel?"About this full working record":"What this document is — and is not");
 write(model.footnote,{font:regular,size:9,color:MUTED,lineHeight:13});
 const json=JSON.stringify(payload);
 if(new TextEncoder().encode(json).length>REPORT_MAX_BYTES)throw new Error("Planning snapshot exceeds export size limit.");
 await doc.attach(new TextEncoder().encode(json),REPORT_ATTACHMENT,{
  mimeType:"application/json",
  description:"IA Pathfinder planning snapshot for local reimport (not teacher approval)"
 });
 return doc.save();
}
function attachmentsFromPdf(doc){
 if(!doc.catalog.has(PDFName.of("Names")))return [];
 const names=doc.catalog.lookup(PDFName.of("Names"),PDFDict);
 if(!names.has(PDFName.of("EmbeddedFiles")))return [];
 const embedded=names.lookup(PDFName.of("EmbeddedFiles"),PDFDict),result=[];
 function scan(node,depth=0){
  if(depth>4)return;
  const values=node.has(PDFName.of("Names"))?node.lookup(PDFName.of("Names"),PDFArray):null;
  if(values)for(let i=0;i+1<values.size();i+=2){
   const name=values.lookup(i);
   const spec=values.lookup(i+1,PDFDict);
   if(name instanceof PDFHexString||name instanceof PDFString){
    if(name.decodeText()!==REPORT_ATTACHMENT)continue;
    const ef=spec.lookup(PDFName.of("EF"),PDFDict);
    if(!ef)continue;
    const stream=ef.lookup(PDFName.of("F"),PDFStream);
    if(!(stream instanceof PDFRawStream))continue;
    const data=decodePDFRawStream(stream).decode();
    if(data.length>REPORT_MAX_BYTES)throw new Error("PDF attachment exceeds the planning import limit.");
    result.push(data);
   }
  }
  const kids=node.has(PDFName.of("Kids"))?node.lookup(PDFName.of("Kids"),PDFArray):null;
  if(kids)for(let i=0;i<Math.min(kids.size(),20);i++){
   const child=kids.lookup(i,PDFDict);if(child)scan(child,depth+1);
  }
 }
 scan(embedded);
 return result;
}
export async function importEmbeddedPdfReport(bytes){
 // Parse only files under the strict size guard in validateDocumentFile().
 const doc=await PDFDocument.load(bytes,{updateMetadata:false});
 const attachments=attachmentsFromPdf(doc);
 if(!attachments.length)return null;
 let parsed;
 try{parsed=JSON.parse(new TextDecoder().decode(attachments[0]));}
 catch{throw new Error("The embedded PDF planning snapshot is damaged.");}
 return normalizePlanningEnvelope(parsed);
}
