/**
 * Mixed prose and mathematics, stored as ordinary student-authored strings.
 *
 * \( ... \) inserts inline mathematics in a sentence.
 * \[ ... \] inserts a separate display equation.
 * No HTML is accepted as authoring data and no existing answer is migrated.
 * A small, restricted TeX package set avoids HTML/link/extension commands.
 */
import {mathjax} from "mathjax-full/js/mathjax.js";
import {TeX} from "mathjax-full/js/input/tex.js";
import {SVG} from "mathjax-full/js/output/svg.js";
import {liteAdaptor} from "mathjax-full/js/adaptors/liteAdaptor.js";
import {RegisterHTMLHandler} from "mathjax-full/js/handlers/html.js";

const adaptor=liteAdaptor();
RegisterHTMLHandler(adaptor);
const inputJax=new TeX({packages:["base","ams","newcommand"]});
const outputJax=new SVG({fontCache:"none"});
const documentJax=mathjax.document("",{InputJax:inputJax,OutputJax:outputJax});
const cache=new Map();
const MAX_FORMULA=550,MAX_SEGMENTS=60,MAX_CACHE=160;
export const escapeMixedHtml=value=>String(value??"").replace(/[&<>"']/g,c=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[c]));

/** An unmatched opener is plain prose, never an invisible or deleted answer. */
export function mixedMathTokens(value){
 const source=String(value??""),out=[];let from=0,i=0,count=0;
 while(i<source.length&&count<MAX_SEGMENTS){
  if(source[i]!=="\\"||!["(","["].includes(source[i+1])){i++;continue;}
  let preceding=0;
  while(i-1-preceding>=0&&source[i-1-preceding]==="\\")preceding++;
  if(preceding%2){i+=2;continue;}
  const display=source[i+1]==="[",endMark=display?"\\]":"\\)";
  let stop=source.indexOf(endMark,i+2);
  while(stop>=0&&source[stop-1]==="\\")stop=source.indexOf(endMark,stop+2);
  if(stop<0){i+=2;continue;}
  if(i>from)out.push({type:"text",value:source.slice(from,i),start:from,end:i});
  const tex=source.slice(i+2,stop);
  out.push({type:"math",value:tex,display,start:i,end:stop+2,
   source:source.slice(i,stop+2)});
  i=stop+2;from=i;count++;
 }
 if(from<source.length)out.push({type:"text",value:source.slice(from),start:from,end:source.length});
 return out.length?out:[{type:"text",value:source,start:0,end:source.length}];
}
export const hasMixedMath=value=>mixedMathTokens(value).some(x=>x.type==="math");

/**
 * Convert TeX to stand-alone SVG paths (no remote fonts and no CSS dependency).
 * MathJax uses its own safe TeX parser and never evaluates JavaScript.
 */
export function mathSvg(source,{display=false}={}){
 const tex=String(source??"").trim();
 if(!tex)throw new Error("Enter a mathematical expression first.");
 if(tex.length>MAX_FORMULA)throw new Error("This equation is too long. Use a shorter expression.");
 const key=(display?"display:":"inline:")+tex;
 if(cache.has(key))return cache.get(key);
 const node=documentJax.convert(tex,{display,em:16,ex:8,containerWidth:1400});
 const html=adaptor.outerHTML(node);
 const start=html.indexOf("<svg"),end=html.lastIndexOf("</svg>");
 if(start<0||end<0)throw new Error("The expression could not be typeset.");
 let svg=html.slice(start,end+6);
 const error=svg.match(/data-mjx-error="([^"]+)"/);
 if(error)throw new Error(error[1].replace(/&quot;/g,'"').replace(/&amp;/g,"&"));
 if(svg.includes("data-mml-node=\"merror\""))throw new Error("Please check the mathematical syntax.");
 // Pin colour for reliable PNG export through canvas, including dark-mode users.
 svg=svg.replaceAll("currentColor","#203a45");
 const w=svg.match(/\bwidth="([0-9.]+)ex"/),h=svg.match(/\bheight="([0-9.]+)ex"/);
 if(!w||!h)throw new Error("The mathematical dimensions could not be read.");
 const widthEx=Number(w[1]),heightEx=Number(h[1]);
 const desc=svg.match(/vertical-align:\s*-\s*([0-9.]+)\s*ex/);
 const depthEx=desc?Number(desc[1]):0;
 if(!Number.isFinite(widthEx)||!Number.isFinite(heightEx)||widthEx<=0||heightEx<=0||
  widthEx>500||heightEx>120)throw new Error("This equation is too large to display safely.");
 const result={svg,tex,display,widthEx,heightEx,depthEx};
 if(cache.size>=MAX_CACHE)cache.delete(cache.keys().next().value);
 cache.set(key,result);
 return result;
}
export function mixedMathPreview(value,{editable=true}={}){
 const tokens=mixedMathTokens(value);
 const content=tokens.map(token=>{
  if(token.type==="text")return escapeMixedHtml(token.value);
  try{
   const rendered=mathSvg(token.value,{display:token.display});
   const label=(token.display?"Display equation: ":"Inline equation: ")+token.value;
   const start=editable?'<button type="button" class="math-preview-equation'+
    (token.display?" is-display":"")+'" data-action="math-edit-existing" data-math-start="'+token.start+
    '" data-math-end="'+token.end+'" aria-label="'+escapeMixedHtml("Edit "+label)+'">':
    '<span class="math-preview-equation'+(token.display?" is-display":"")+
    '" role="img" aria-label="'+escapeMixedHtml(label)+'">';
   return start+rendered.svg+(editable?"</button>":"</span>");
  }catch(err){
   return '<span class="math-preview-invalid" title="'+escapeMixedHtml(err.message)+
    '">'+escapeMixedHtml(token.source)+'</span>';
  }
 }).join("");
 return content||'<span class="math-preview-placeholder">Your writing will appear here when you insert an equation.</span>';
}
export const EQUATION_TEMPLATES=Object.freeze([
 {id:"fraction",label:"Fraction",tex:"\\frac{a}{b}"},
 {id:"power",label:"Power",tex:"x^{2}"},
 {id:"subscript",label:"Subscript",tex:"x_{1}"},
 {id:"root",label:"Root",tex:"\\sqrt{x}"},
 {id:"sum",label:"Sum",tex:"\\sum_{k=1}^{n} k^{2}"},
 {id:"integral",label:"Integral",tex:"\\int_{a}^{b} f(x)\\,dx"},
 {id:"greek",label:"Greek",tex:"\\alpha+\\beta=\\theta"},
 {id:"matrix",label:"Matrix",tex:"\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}"}
]);
export function insertMixedEquation(original,expression,{start,end,display=false}={}){
 const source=String(original??""),tex=String(expression??"").trim();
 // Validate before changing an existing student-authored string.
 mathSvg(tex,{display});
 const a=Math.max(0,Math.min(source.length,Number.isInteger(start)?start:source.length));
 const b=Math.max(a,Math.min(source.length,Number.isInteger(end)?end:a));
 const insert=(display?"\\[":"\\(")+tex+(display?"\\]":"\\)");
 return {value:source.slice(0,a)+insert+source.slice(b),cursor:a+insert.length,
  inserted:insert};
}
