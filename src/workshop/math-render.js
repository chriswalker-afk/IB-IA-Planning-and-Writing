/** Read-only MathJax renderer for authored Maths Workshop teaching examples.
 * Uses the same local renderer as the IA equation editor. Text is escaped;
 * only explicit TeX snippets are typeset, never inferred from student prose.
 */
import {mathSvg,mixedMathTokens,escapeMixedHtml as e} from "../math/mixed-math.js";
import {WORKSHOP_LESSON_FORMULAS,WORKSHOP_DEFINITION_FORMULAS} from "./math-notation.js";

function equation(source,{spoken="",display=false}={}){
 try{
  const rendered=mathSvg(source,{display});
  const label=spoken||"Mathematical expression: "+source;
  return '<span class="workshop-typeset-math'+(display?' is-display':' is-inline')+
   '" role="img" aria-label="'+e(label)+'">'+rendered.svg.replace("<svg ","<svg aria-hidden=\"true\" focusable=\"false\" ")+'</span>';
 }catch(error){
  // TeX must never blank a definition, question or worked answer.
  return '<span class="workshop-math-fallback" title="'+e(error?.message||"Check the mathematical notation")+
   '">'+e(source)+'</span>';
 }
}

/** Author inline expressions explicitly: \(...\). All other prose remains text. */
export function workshopProse(value){
 return mixedMathTokens(value).map(token=>token.type==="text"?e(token.value):
   equation(token.value,{display:token.display})).join("");
}

const row=(item)=>
 '<div class="workshop-formula-row">'+
 '<div class="workshop-formula-label">'+e(item.label)+'</div>'+
 '<div class="workshop-formula-equation" tabindex="0" aria-label="'+e(item.label)+'. Scroll horizontally if needed.">'+
 equation(item.tex,{spoken:item.spoken,display:true})+
 '</div></div>';

function mathPanel(items,title){
 return '<section class="workshop-formula" aria-label="'+e(title)+'">'+
  '<h4 class="workshop-formula-heading">'+e(title)+'</h4>'+
  '<div class="workshop-formula-list">'+items.map(row).join("")+'</div>'+
  '</section>';
}

/** Canonical lesson formulas are labelled separate equations, never a prose run-on. */
export function workshopLessonFormula(lesson){
 const formula=WORKSHOP_LESSON_FORMULAS[lesson.id];
 if(formula?.length)return mathPanel(formula,"Useful relationships");
 return '<div class="workshop-formula"><strong>Useful relationship</strong><p>'+workshopProse(lesson.formula)+'</p></div>';
}

/** A glossary's one formula uses exactly the same mathematical typography. */
export function workshopDefinitionFormula(definition){
 const notation=WORKSHOP_DEFINITION_FORMULAS[definition.id];
 if(notation)return mathPanel([{label:"Notation",...notation}],"Notation or formula");
 if(!definition.notation)return "";
 return '<div class="workshop-formula"><strong>Notation or formula</strong><p>'+
  workshopProse(definition.notation)+'</p></div>';
}
