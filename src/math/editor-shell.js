/** Lightweight, always-available controls. Heavy MathJax is loaded only
 * when the student uses mathematical notation, never on ordinary form load.
 */
const escape=value=>String(value??"").replace(/[&<>"']/g,c=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[c]));
export function supportsMathInField(path,type,opts={}){
 if(type!=="textarea"||opts.math===false)return false;
 return /^(planning\.fields\.|completion\.fields\.|entries\.\d+\.|scratch\.|project\.(?:aim|beneficiary)|cueNotes\.|completion\.review\.records\.)/.test(path);
}
export function mathFieldTools(path){
 return '<div class="math-writing-tools" data-math-field="'+escape(path)+'">'+
  '<button type="button" class="math-open-tool" data-action="math-open" aria-expanded="false">'+
   '<span class="math-open-symbol" aria-hidden="true">∑</span> Insert equation</button>'+
  '<span class="math-tool-description">Place mathematical notation inside your sentence or on its own line.</span>'+
  '<div class="math-writing-preview" data-math-preview hidden>'+
   '<div class="math-writing-preview-title"><strong>As it will appear in your answer</strong>'+
   '<span>Click an equation to edit it</span></div>'+
   '<div class="math-writing-preview-content" data-math-preview-content></div></div>'+
  '<div data-math-composer-slot></div></div>';
}
