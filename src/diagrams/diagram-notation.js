/**
 * Shared, browser-local mathematical notation for figure and table labels.
 * Plain text remains plain text; \(...\) is MathJax-rendered only for display.
 * Values in source datasets, numeric parsers and CSV exports are not changed.
 */
import {mathSvg,mixedMathTokens,escapeMixedHtml} from "../math/mixed-math.js";

export const DIAGRAM_NOTATION_SYMBOLS=Object.freeze([
 {label:"xᵢ",token:"x_i",title:"Subscript (edit the index)"},
 {label:"x²",token:"x^2",title:"Power (edit the exponent)"},
 {label:"x̄",token:"\\bar{x}",title:"Mean"},
 {label:"ŷ",token:"\\hat{y}",title:"Predicted value"},
 {label:"Δ",token:"\\Delta",title:"Change"},
 {label:"θ",token:"\\theta",title:"Theta"},
 {label:"μ",token:"\\mu",title:"Mu"},
 {label:"σ",token:"\\sigma",title:"Sigma"},
 {label:"±",token:"±",title:"Plus or minus"},
 {label:"s⁻²",token:"s^-2",title:"Negative power for a unit"}
]);
const GREEK=Object.freeze({
 alpha:"α",beta:"β",gamma:"γ",delta:"δ",Delta:"Δ",epsilon:"ε",
 theta:"θ",lambda:"λ",mu:"μ",pi:"π",rho:"ρ",sigma:"σ",
 Sigma:"Σ",phi:"φ",omega:"ω",Omega:"Ω",tau:"τ",lambda:"λ"
});
const SUBSCRIPT=Object.freeze({
 "0":"₀","1":"₁","2":"₂","3":"₃","4":"₄","5":"₅","6":"₆","7":"₇","8":"₈","9":"₉",
 "+":"₊","-":"₋","=":"₌","(":"₍",")":"₎",
 a:"ₐ",e:"ₑ",h:"ₕ",i:"ᵢ",j:"ⱼ",k:"ₖ",l:"ₗ",m:"ₘ",n:"ₙ",
 o:"ₒ",p:"ₚ",r:"ᵣ",s:"ₛ",t:"ₜ",u:"ᵤ",v:"ᵥ",x:"ₓ"
});
const SUPER=Object.freeze({
 "0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹",
 "+":"⁺","-":"⁻"
});
function shorthandPlain(value){
 return String(value??"")
  .replace(/\\(bar|hat)\{([A-Za-z])\}/g,(_all,mark,char)=>char+(mark==="bar"?"\u0304":"\u0302"))
  .replace(/\\([A-Za-z]+)\b/g,(whole,name)=>GREEK[name]||whole)
  .replace(/_(?:\{([^{}\s]{1,12})\}|([A-Za-z0-9]))/g,(whole,braced,single)=>{
   const chars=[...(braced??single)];
   return chars.every(ch=>Object.hasOwn(SUBSCRIPT,ch))?chars.map(ch=>SUBSCRIPT[ch]).join(""):whole;
  })
  .replace(/\^(?:\{([+\-−]?\d+)\}|\(([+\-−]?\d+)\)|([+\-−]?\d+))/g,(_whole,a,b,c)=>
   [...(a??b??c)].map(ch=>SUPER[ch==="−"?"-":ch]||ch).join(""));
}
/** Existing table shortcuts and typed units remain fully backward-compatible. */
export function formatDiagramShorthand(value){
 return mixedMathTokens(value).map(token=>token.type==="text"?shorthandPlain(token.value):token.source).join("");
}
export const hasDiagramEquation=value=>mixedMathTokens(value).some(token=>token.type==="math");
export function diagramNotationControls(e,{studio,key="",index=null,part=""}={}){
 const tableColumn=studio==="table"&&Number.isInteger(index);
 const action=tableColumn?"table-symbol":"diagram-notation-token";
 const attrs=' data-notation-studio="'+e(studio)+'" data-notation-key="'+e(key)+'"'+
  (tableColumn?' data-notation-col="'+index+'" data-notation-part="'+e(part)+'"':"");
 const tokens=DIAGRAM_NOTATION_SYMBOLS.map(s=>
  '<button type="button" data-action="'+action+'" data-notation-token="'+e(s.token)+'"'+
  (tableColumn?' data-table-col="'+index+'" data-table-part="'+e(part)+'" data-table-token="'+e(s.token)+'"':"")+
  ' title="'+e(s.title)+'" aria-label="'+e(s.title)+'">'+e(s.label)+'</button>').join("");
 return '<div class="diagram-notation-tools" data-diagram-notation'+attrs+'>'+
  '<button type="button" class="diagram-notation-toggle" data-action="diagram-notation-toggle" aria-expanded="false">'+
  '<span aria-hidden="true">∑</span> Insert maths</button>'+
  '<div class="diagram-notation-panel" data-notation-panel hidden>'+
  '<div class="diagram-notation-palette" role="group" aria-label="Mathematical symbols">'+tokens+'</div>'+
  '<label class="diagram-notation-expression-label">Or write a mathematical expression (optional LaTeX)'+
  '<input type="text" data-diagram-expression spellcheck="false" autocomplete="off" placeholder="e.g. \\frac{dy}{dx}, \\sqrt{x}, a_{12}"></label>'+
  '<div class="diagram-notation-expression-preview" data-diagram-expression-preview aria-live="polite">Your expression preview appears here.</div>'+
  '<p class="diagram-notation-error" data-diagram-notation-error hidden role="alert"></p>'+
  '<div class="diagram-notation-actions"><button type="button" data-action="diagram-notation-insert" class="btn btn-secondary btn-sm">Insert expression</button>'+
  '<button type="button" data-action="diagram-notation-close" class="btn btn-quiet btn-sm">Close</button></div>'+
  '<small>Shortcuts such as cm^2, x_1 and \\theta work without using the editor. Maths changes labels only, not measured data.</small>'+
  '</div><div class="diagram-notation-value-preview" data-notation-value-preview hidden></div></div>';
}
export function diagramHtmlMath(value){
 return mixedMathTokens(value).map(token=>{
  if(token.type==="text")return escapeMixedHtml(shorthandPlain(token.value));
  try{
   const result=mathSvg(token.value,{display:false});
   return '<span class="diagram-inline-math" role="img" aria-label="'+escapeMixedHtml(token.value)+'">'+result.svg+'</span>';
  }catch(error){
   return '<span class="diagram-notation-invalid" title="'+escapeMixedHtml(error.message)+'">'+
    escapeMixedHtml(token.source)+'</span>';
  }
 }).join("");
}
const num=n=>Number(n).toFixed(2).replace(/\.?0+$/,"");
function pieces(value,size){
 return mixedMathTokens(value).map(token=>{
  if(token.type==="text"){
   const s=shorthandPlain(token.value);
   return {type:"text",value:s,width:s.length*size*.54};
  }
  try{
   const render=mathSvg(token.value,{display:false});
   return {type:"math",render,width:render.widthEx*size*.49,
    height:render.heightEx*size*.49,depth:render.depthEx*size*.49};
  }catch{
   return {type:"text",value:token.source,width:token.source.length*size*.54};
  }
 });
}
/** Approximate visible width for pagination (not the number of LaTeX source characters). */
export function diagramVisibleLength(value,size=16){
 return pieces(value,size).reduce((s,p)=>s+p.width,0)/(size*.54);
}
/** Safe standalone SVG text with inline MathJax path graphics when needed. */
export function svgDiagramText(value,x,y,attrs="",{maxWidth=Infinity,fontSize=16}={}){
 if(!hasDiagramEquation(value))
  return '<text x="'+num(x)+'" y="'+num(y)+'" '+attrs+'>'+escapeMixedHtml(formatDiagramShorthand(value))+'</text>';
 const size=Number((attrs.match(/\bfont-size="([\d.]+)"/)||[])[1])||fontSize;
 const runs=pieces(value,size),natural=runs.reduce((s,p)=>s+p.width,0);
 const fit=Number.isFinite(maxWidth)&&maxWidth>0?Math.min(1,maxWidth/Math.max(1,natural)):1;
 const align=(attrs.match(/\btext-anchor="([^"]+)"/)||[])[1]||"start";
 const shift=align==="middle"?-natural*fit/2:align==="end"?-natural*fit:0;
 const rotation=(attrs.match(/\btransform="([^"]+)"/)||[])[1]||"";
 const clean=attrs.replace(/\btext-anchor="[^"]*"/g,"").replace(/\btransform="[^"]*"/g,"");
 const transform=(rotation?rotation+" ":"")+'translate('+num(Number(x)+shift)+' '+num(y)+')'+
  (fit<1?" scale("+num(fit)+")":"");
 let px=0,inside="";
 for(const run of runs){
  if(run.type==="text"){
   if(run.value)inside+='<text x="'+num(px)+'" y="0" text-anchor="start">'+escapeMixedHtml(run.value)+'</text>';
  }else{
   let nested=run.render.svg.replace(/\bwidth="[\d.]+ex"/,'width="'+num(run.width)+'"')
    .replace(/\bheight="[\d.]+ex"/,'height="'+num(run.height)+'"');
   nested=nested.replace("<svg ",'<svg x="'+num(px)+'" y="'+num(-run.height+run.depth)+'" ');
   inside+=nested;
  }
  px+=run.width;
 }
 return '<g class="diagram-math-typeset" '+clean+' transform="'+transform+
  '" role="img" aria-label="'+escapeMixedHtml(value)+'">'+inside+'</g>';
}
const decoded=s=>String(s).replace(/&lt;/g,"<").replace(/&gt;/g,">")
 .replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,"&");
/**
 * Graph SVGs are assembled as escaped <text> nodes; replace only nodes that
 * explicitly contain maths. Preserve all existing plain-text SVG structure.
 */
export function typesetGraphSvgLabels(svg){
 return String(svg).replace(/<text\b([^>]*)>([^<]*)<\/text>/g,(original,attrs,escaped)=>{
  const raw=decoded(escaped);
  const isEquation=/\bclass="graph-model-equation"/.test(attrs);
  const shorthand=formatDiagramShorthand(raw);
  const autoEquation=false; // Existing generated model equations remain exact; authored math uses explicit delimiters.
  const value=autoEquation?'\\('+raw.replace(/\*/g,"\\cdot ")+'\\)':raw;
  if(hasDiagramEquation(value)){
   const x=Number((attrs.match(/\bx="([^"]+)"/)||[])[1]),y=Number((attrs.match(/\by="([^"]+)"/)||[])[1]);
   if(Number.isFinite(x)&&Number.isFinite(y)){
    const clean=attrs.replace(/\bx="[^"]*"/,"").replace(/\by="[^"]*"/,"");
    return svgDiagramText(value,x,y,clean,{fontSize:16});
   }
  }
  if(shorthand!==raw)return '<text'+attrs+'>'+escapeMixedHtml(shorthand)+'</text>';
  return original;
 });
}
