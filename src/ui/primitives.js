/** Shared HTML building helpers for the prototype. (No user-entered HTML.) */
export const icon=(name,extra="")=>'<svg class="icon '+extra+'" aria-hidden="true"><use href="#i-'+name+'"></use></svg>';
export const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const cleanUrl=url=>{try{const u=new URL(String(url??""));return["https:","http:"].includes(u.protocol)?u.href:"";}catch{return"";}};
export function button(text,action,cls="btn-secondary",more="",glyph=""){
  return '<button class="btn '+cls+'" type="button" data-action="'+action+'" '+more+'>'+escapeHtml(text)+(glyph?icon(glyph):"")+'</button>';
}
