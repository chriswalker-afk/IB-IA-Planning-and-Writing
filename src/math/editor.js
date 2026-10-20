/**
 * A small equation composer integrated into existing textareas: no rich-text
 * conversion, no surprise rewriting of student paragraphs, no server calls.
 */
import {EQUATION_TEMPLATES,escapeMixedHtml,mixedMathPreview,mathSvg,hasMixedMath} from "./mixed-math.js";
export function supportsMathInField(path,type,opts={}){
 if(type!=="textarea"||opts.math===false)return false;
 return /^(planning\.fields\.|completion\.fields\.|entries\.\d+\.|scratch\.|project\.(?:aim|beneficiary)|cueNotes\.|completion\.review\.records\.)/.test(path);
}
export function mathFieldTools(path){
 return '<div class="math-writing-tools" data-math-field="'+escapeMixedHtml(path)+'">'+
  '<button type="button" class="math-open-tool" data-action="math-open" aria-expanded="false">'+
   '<span class="math-open-symbol" aria-hidden="true">∑</span> Insert equation</button>'+
  '<span class="math-tool-description">Place mathematical notation inside your sentence or on its own line.</span>'+
  '<div class="math-writing-preview" data-math-preview hidden>'+
   '<div class="math-writing-preview-title"><strong>As it will appear in your answer</strong>'+
   '<span>Click an equation to edit it</span></div>'+
   '<div class="math-writing-preview-content" data-math-preview-content></div></div>'+
  '<div data-math-composer-slot></div></div>';
}
export function mathComposer(){
 return '<section class="math-composer" data-math-composer aria-label="Insert mathematical notation">'+
  '<div class="math-composer-header"><strong>Write an equation</strong>'+
   '<span>Choose a template or type mathematical notation.</span></div>'+
  '<div class="math-template-grid" role="group" aria-label="Common mathematical structures">'+
   EQUATION_TEMPLATES.map(item=>'<button type="button" data-action="math-template" data-math-template="'+
    escapeMixedHtml(item.id)+'">'+escapeMixedHtml(item.label)+'</button>').join("")+'</div>'+
  '<div class="math-composer-row"><label for="math-expression">Equation notation</label>'+
   '<select data-math-display aria-label="Position of equation">'+
    '<option value="inline">Inline · in my sentence</option>'+
    '<option value="display">Display · on its own line</option>'+
   '</select></div>'+
  '<textarea id="math-expression" class="math-expression-input field" data-math-expression rows="2" spellcheck="false"'+
   ' autocapitalize="off" autocomplete="off" placeholder="e.g. \\frac{x^2}{2}"></textarea>'+
  '<p class="math-composer-hint">Use <code>^</code> for powers, <code>_</code> for subscripts,'+
   ' and <code>\\frac{a}{b}</code> for a fraction. Your normal writing stays unchanged.</p>'+
  '<div class="math-expression-preview" data-math-formula-preview aria-live="polite"></div>'+
  '<p class="math-expression-error" data-math-error role="alert" hidden></p>'+
  '<div class="math-composer-actions">'+
   '<button type="button" class="btn btn-primary btn-sm" data-action="math-insert">Insert in my answer</button>'+
   '<button type="button" class="btn btn-secondary btn-sm" data-action="math-close">Cancel</button></div>'+
  '</section>';
}
export function refreshMathWritingPreview(group,textarea){
 const preview=group?.querySelector?.("[data-math-preview]");
 if(!preview||!textarea)return;
 const active=hasMixedMath(textarea.value);
 preview.hidden=!active;
 if(active){
  const body=preview.querySelector("[data-math-preview-content]");
  if(body)body.innerHTML=mixedMathPreview(textarea.value);
 }
}
export function refreshMathExpressionPreview(composer){
 if(!composer)return;
 const tex=composer.querySelector("[data-math-expression]")?.value||"";
 const box=composer.querySelector("[data-math-formula-preview]");
 const error=composer.querySelector("[data-math-error]");
 if(!box||!error)return;
 if(!tex.trim()){box.textContent="Your equation preview will appear here.";error.hidden=true;return;}
 try{
  const svg=mathSvg(tex,{display:composer.querySelector("[data-math-display]")?.value==="display"}).svg;
  box.innerHTML=svg;
  error.textContent="";error.hidden=true;
 }catch(err){
  box.textContent="Correct the expression to see it typeset.";
  error.textContent=err?.message||"Check the equation syntax.";error.hidden=false;
 }
}
