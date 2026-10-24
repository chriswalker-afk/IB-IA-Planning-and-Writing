import test from "node:test";
import assert from "node:assert/strict";
import {mathSvg,mixedMathTokens} from "../src/math/mixed-math.js";
import {WORKSHOP_LESSONS,WORKSHOP_DEFINITIONS,definitionById} from "../src/workshop/catalog.js";
import {WORKSHOP_LESSON_FORMULAS,WORKSHOP_DEFINITION_FORMULAS} from "../src/workshop/math-notation.js";
import {workshopProse,workshopLessonFormula,workshopDefinitionFormula} from "../src/workshop/math-render.js";
import {renderWorkshop} from "../src/workshop/views.js";
import {newResourceSession} from "../src/resources/state.js";
import {createProjectState} from "../src/core/project-state.js";

const allText = l=>[
 l.when,l.avoid,l.worked.context,...l.worked.steps,l.worked.answer,l.worked.interpretation,
 l.guided.question,l.guided.hint,l.guided.feedback,
 ...(l.guided.parts||[]).flatMap(p=>[p.question,p.hint,p.feedback,...p.options.map(o=>o[1])]),
 ...(l.guided.options||[]).map(o=>o[1]),
 l.independent.question,l.independent.answer,l.independent.reasoning,
 l.ia,l.skill
].filter(v=>typeof v==="string");

test("workshop maths: all thirteen methods have labelled accessible display equations",()=>{
 assert.deepEqual(Object.keys(WORKSHOP_LESSON_FORMULAS).sort(),WORKSHOP_LESSONS.map(l=>l.id).sort());
 let n=0;
 for(const lesson of WORKSHOP_LESSONS){
  const rows=WORKSHOP_LESSON_FORMULAS[lesson.id];
  assert(rows.length>=2,lesson.id);
  assert.equal(new Set(rows.map(r=>r.label)).size,rows.length,lesson.id);
  for(const row of rows){
   assert(row.label&&row.spoken&&row.tex,lesson.id);
   const result=mathSvg(row.tex,{display:true});
   assert(result.svg.startsWith("<svg"),lesson.id+" "+row.label);
   assert(!result.svg.includes('data-mml-node="merror"'),lesson.id);
   n++;
  }
  const html=workshopLessonFormula(lesson);
  assert.equal((html.match(/class="workshop-formula-row"/g)||[]).length,rows.length);
  assert.equal((html.match(/<span class="workshop-typeset-math is-display" role="img"/g)||[]).length,rows.length);
  assert.equal((html.match(/<svg aria-hidden="true"/g)||[]).length,rows.length);
  assert(html.includes("aria-label="));
  assert(!html.includes("<script"));
 }
 assert(n>=30);
});
test("workshop maths: all glossary definitions with notation have typeset SVG",()=>{
 const withNotation=WORKSHOP_DEFINITIONS.filter(d=>d.notation);
 assert.equal(withNotation.length,26);
 assert.deepEqual(Object.keys(WORKSHOP_DEFINITION_FORMULAS).sort(),withNotation.map(d=>d.id).sort());
 for(const d of withNotation){
  const item=WORKSHOP_DEFINITION_FORMULAS[d.id];
  assert(item.tex&&item.spoken,d.id);
  assert(mathSvg(item.tex,{display:true}).svg.startsWith("<svg"),d.id);
  const html=workshopDefinitionFormula(d);
  assert(html.includes('class="workshop-formula-equation"'));
  assert(html.includes('role="img"'));
 }
 assert.equal(workshopDefinitionFormula(definitionById("population")),"");
});
test("workshop maths: explicit TeX tokens in worked lessons and glossary all render",()=>{
 let n=0;
 for(const lesson of WORKSHOP_LESSONS){
  for(const prose of allText(lesson)){
   for(const token of mixedMathTokens(prose).filter(t=>t.type==="math")){
    assert(mathSvg(token.value,{display:token.display}).svg.includes("<svg"),lesson.id+" "+token.value);
    n++;
   }
   assert(!workshopProse(prose).includes("workshop-math-fallback"),lesson.id);
  }
 }
 for(const d of WORKSHOP_DEFINITIONS){
  for(const prose of [d.meaning,d.example]){
   for(const token of mixedMathTokens(prose).filter(t=>t.type==="math")){
    assert(mathSvg(token.value,{display:token.display}).svg.includes("<svg"),d.id+" "+token.value);
    n++;
   }
   assert(!workshopProse(prose).includes("workshop-math-fallback"),d.id);
  }
 }
 assert(n>=65,"Only "+n+" mathematical passages were typeset");
});
test("workshop maths: HTML escaping and invalid TeX never inject or hide answers",()=>{
 const safe=workshopProse("Look <img src=x onerror=alert(1)> at \\(x^2\\).");
 assert(safe.includes("&lt;img"));
 assert(!safe.includes("<img src=x"));
 assert(safe.includes("<svg"));
 assert(safe.includes('role="img"'));
 const bad=workshopProse("Check \\(\\frac{\\) before proceeding");
 assert(bad.includes("workshop-math-fallback"));
 assert(bad.includes("Check "));
});
test("workshop maths: original lesson and glossary stay read-only with SVG math",()=>{
 const state=createProjectState(),before=JSON.stringify(state);
 const session=newResourceSession();session.mode="workshop";session.workshopId="descriptive";
 const lesson=renderWorkshop(state,session);
 assert(lesson.includes('data-workshop-lesson="descriptive"'));
 assert.equal((lesson.match(/class="workshop-formula-row"/g)||[]).length,3);
 assert(lesson.includes("Population standard deviation"));
 assert(lesson.includes("Sample standard deviation"));
 assert(lesson.includes("workshop-typeset-math"));
 assert(!lesson.includes("font-family:ui-monospace"));
 session.workshopId="";session.workshopTerm="standard-deviation";
 const d=renderWorkshop(state,session);
 assert(d.includes('data-workshop-definition="standard-deviation"'));
 assert(d.includes('class="workshop-formula-equation"'));
 assert.equal(JSON.stringify(state),before);
});
