import test from "node:test";
import assert from "node:assert/strict";
import {mixedMathTokens,mathSvg,hasMixedMath,mixedMathPreview,insertMixedEquation,EQUATION_TEMPLATES}
 from "../src/math/mixed-math.js";
import {supportsMathInField,mathFieldTools} from "../src/math/editor-shell.js";

test("mixed mathematical text retains prose, actual TeX source and exact token offsets",()=>{
 const answer="I use \\(y=mx+c\\) to model the values, so \\(\\frac{dy}{dx}=m\\). My conclusion is limited.";
 const parts=mixedMathTokens(answer);
 assert.equal(parts.filter(t=>t.type==="math").length,2);
 assert.equal(parts.map(t=>t.type==="math"?t.source:t.value).join(""),answer);
 assert.equal(parts.filter(t=>t.type==="math")[0].value,"y=mx+c");
 assert.equal(parts.filter(t=>t.type==="math")[1].value,"\\frac{dy}{dx}=m");
 assert.equal(hasMixedMath(answer),true);
 assert.equal(hasMixedMath("The price was $10; the sample was $20."),false);
});
test("display equations and normal multiline text survive round trips without losing anything",()=>{
 const answer="I evaluated the following:\n\\[\\sum_{k=1}^{n} k^2 = \\frac{n(n+1)(2n+1)}{6}\\]\nTherefore the total has units of cm^2.";
 const parts=mixedMathTokens(answer);
 assert.equal(parts.filter(t=>t.type==="math").length,1);
 assert.equal(parts.find(t=>t.type==="math").display,true);
 assert.equal(parts.map(t=>t.type==="math"?t.source:t.value).join(""),answer);
 assert.equal(mixedMathTokens("An unfinished \\( stays as text.").filter(t=>t.type==="math").length,0);
});
test("MathJax draws authentic self-contained mathematical SVG with no remote styles",()=>{
 for(const tex of ["\\frac{x^{2}}{2}","\\sqrt{\\alpha+\\beta}",
  "\\sum_{i=1}^{n}i","\\int_{a}^{b} x^{2}\\,dx",
  "\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}"]){
  const r=mathSvg(tex);
  assert(r.svg.startsWith("<svg"),tex);
  assert(r.svg.includes("viewBox"),tex);
  assert(r.svg.includes("<path"),tex);
  assert(r.widthEx>0&&r.heightEx>0);
  assert(!r.svg.includes("currentColor"));
  assert(!r.svg.includes("<foreignObject"));
 }
 assert.throws(()=>mathSvg(""),/Enter a mathematical expression/);
 assert.throws(()=>mathSvg("x".repeat(600)),/too long/);
});
test("rendered equation previews escape student prose instead of accepting HTML",()=>{
 const text="<img src=x onerror=alert(1)> The model is \\(x^{2}+1\\).";
 const html=mixedMathPreview(text);
 assert(html.includes("&lt;img"));
 assert(!html.includes("<img"));
 assert(html.includes('data-action="math-edit-existing"'));
 assert(html.includes("<svg"));
});
test("insert at a caret and replace existing inline formula without erasing prose",()=>{
 const original="Because  is positive, the curve rises.";
 const cursor=8;
 const added=insertMixedEquation(original,"\\frac{a}{b}",{start:cursor,end:cursor});
 assert(added.value.includes("\\(\\frac{a}{b}\\)"));
 assert(added.value.endsWith("is positive, the curve rises."));
 const formula=mixedMathTokens(added.value).find(t=>t.type==="math");
 const replaced=insertMixedEquation(added.value,"x_1^2",{start:formula.start,end:formula.end,display:true});
 assert(replaced.value.includes("\\[x_1^2\\]"));
 assert(replaced.value.endsWith("is positive, the curve rises."));
});
test("math controls appear in appropriate Planning, Writing and Checking responses",()=>{
 for(const key of ["planning.fields.aim","planning.fields.firstAction","scratch.introduction",
   "entries.1.result","completion.fields.mainConclusion","completion.review.records.draft-D02.note"]){
  assert(supportsMathInField(key,"textarea"),key);
  const html=mathFieldTools(key);
  assert(html.includes('data-action="math-open"'),key);
 }
 assert(!supportsMathInField("planning.fields.course","select"));
 assert(!supportsMathInField("project.documentUrl","text"));
 assert(!supportsMathInField("planning.fields.milestoneDraft","date"));
 assert(!supportsMathInField("scratch.introduction","textarea",{math:false}));
 assert(EQUATION_TEMPLATES.some(t=>t.id==="fraction"));
 assert(EQUATION_TEMPLATES.some(t=>t.id==="matrix"));
});
