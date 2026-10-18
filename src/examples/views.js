import {EXAMPLES,NUMERICAL_EXAMPLE,exampleById} from './catalog.js';
import {CATEGORIES,TOPICS,exampleContext,selectExamples,defaultVariant,filterExamples} from './context.js';
import {visualFor} from './visuals.js';
import {exampleCriteria} from '../essentials/example-criteria.js';
export const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const strongText=t=>e(t).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
export function prose(text){
 // Authored Markdown only. Arbitrary HTML, including user strings, is always escaped.
 return String(text||'').split(/\n\s*\n/).filter(p=>!p.trim().startsWith('|')).map(p=>'<p>'+strongText(p).replace(/\n/g,'<br>')+'</p>').join('');
}
export function exampleButton(label='Compare examples',options={}){
 const attrs=Object.entries(options).filter(([k,v])=>['topic','cue','help','id','browse'].includes(k)&&v!==undefined).map(([k,v])=>' data-example-'+k+'="'+e(v)+'"').join('');
 return '<button type="button" class="btn btn-quiet ex-trigger" data-action="example-open"'+attrs+'>'+e(label)+'</button>';
}
export function examplePrompt(state,options={}){
 const x=exampleContext(state,options),list=selectExamples(state,options);
 if(!list.length)return '';
 return '<div class="ex-prompt" aria-label="Optional examples">'+exampleButton('Compare '+(TOPICS[x.topic]||'examples'),options)+
 '<span class="ex-prompt-note">Less effective / more effective</span>'+exampleButton('Browse all examples',{browse:true,help:options.help})+'</div>';
}
function introductionFeatures(card){
 if(!Array.isArray(card.introFeatures)||!card.introFeatures.length)return "";
 return '<section class="ex-introduction-features" aria-label="What to notice in this introduction"><h4>What makes the stronger introduction work?</h4>'+
  '<p>Tap a feature to see the corresponding wording and the reason it helps.</p>'+
  '<div class="ex-introduction-feature-list">'+card.introFeatures.map((f,i)=>
   '<details class="ex-introduction-feature"'+(i===0?' open':'')+'><summary><span>'+e(f.label)+'</span><span aria-hidden="true">⌄</span></summary>'+
   '<div><p class="ex-introduction-feature-quote">'+e(f.quote)+'</p><p>'+e(f.why)+'</p></div></details>').join("")+'</div></section>';
}
function variantPicker(card,selected){
 if(!card.variants)return '';
 return '<div class="ex-variants"><label for="ex-variant">Example situation</label><select id="ex-variant" data-example-variant><option value="">Compare the situations</option>'+card.variants.map(v=>'<option value="'+e(v.id)+'"'+(selected===v.id?' selected':'')+'>'+e(v.label)+'</option>').join('')+'</select><p class="ex-small">Choose a situation to learn from. This does not change your recorded method or results.</p></div>';
}
export function renderCard(card,{context={},variant='',inline=false}={}){
 if(!card)return '<p>Choose another example from the library.</p>';
 const v=card.variants?.find(v=>v.id===variant),prefix=(inline?'inline-':'modal-')+card.id;
 const side=(good)=>{
  const text=prose(good?(v?.strong||card.strong):card.weak),visual=visualFor(card,good,prefix+(good?'-good':'-weak'));
  const content=good&&card.id==='EX13'?text.replace('</p>','</p>'+visual):visual+text;
  return '<section class="ex-version '+(good?'ex-more':'ex-less')+'" aria-label="'+(good?'More effective':'Less effective')+'"><h4>'+(good?'More effective':'Less effective')+'</h4>'+content+'</section>';
 };
 return '<article class="ex-card" data-example-card="'+e(card.id)+'"><div class="ex-eyebrow">'+e(CATEGORIES[card.category])+' · Original teaching example</div><h3 class="ex-heading" tabindex="-1">'+e(card.title)+'</h3>'+
 '<p class="ex-fiction">Fictional illustration, not your findings or wording to submit. A stronger excerpt is not a predicted IA grade.</p>'+
 (inline?'':variantPicker(card,variant))+'<div class="ex-pair">'+side(false)+side(true)+'</div>'+introductionFeatures(card)+
 exampleCriteria(card)+'<section class="ex-changes"><h4>What changed?</h4>'+prose(card.why)+'</section><section class="ex-transfer"><h4>Check your own work</h4><p>'+e(card.question)+'</p></section>'+
 (['EX01','EX05','EX07','EX08','EX09','EX10','EX11','EX13','EX14','EX15','EX17','EX18','EX19','EX21','EX22','EX24'].includes(card.id)?'<details class="ex-data"><summary>Fictional data behind the cooling examples</summary><p>No observations below belong to your project. In-sample model comparisons are not independent validation.</p><div class="ex-table-wrap"><table><caption>Eleven invented readings; surrounding temperature fixed at 23°C for the example model.</caption><thead><tr><th scope="col">Time / min</th><th scope="col">Temperature / °C</th></tr></thead><tbody>'+NUMERICAL_EXAMPLE.time_min.map((t,i)=>'<tr><td>'+t+'</td><td>'+NUMERICAL_EXAMPLE.temperature_degC[i].toFixed(1)+'</td></tr>').join('')+'</tbody></table></div></details>':'')+'</article>';
}
export function exampleInline(state,options={}){
 const card=selectExamples(state,options)[0],context=exampleContext(state,options);
 return renderCard(card,{context,variant:defaultVariant(card,context),inline:true})+exampleButton('Browse all examples',{browse:true});
}
const select=(key,title,choices,value)=>'<label><span>'+title+'</span><select data-example-filter="'+key+'">'+choices.map(([v,t])=>'<option value="'+e(v)+'"'+(v===value?' selected':'')+'>'+e(t)+'</option>').join('')+'</select></label>';
export function libraryResults(session){
 const results=filterExamples(session);
 return '<p class="ex-small" role="status">'+results.length+' matching example'+(results.length===1?'':'s')+' · Browsing does not recommend an extra technique.</p>'+(results.length?'<div class="ex-library-grid">'+results.map(c=>'<button type="button" class="ex-library-card" data-example-select="'+c.id+'"><span>'+e(CATEGORIES[c.category])+'</span><strong>'+e(c.title)+'</strong><small>'+e(c.kind==='all'?'Across exploration types':c.kind)+'</small></button>').join('')+'</div>':'<p>No matches. Try a shorter search or clear the filters.</p>');
}
export function library(session){
 return '<div class="ex-library"><h3 class="ex-heading" tabindex="-1">Example library</h3><p>Explore '+EXAMPLES.length+' original comparisons. Use the principle, not the fictional story or numbers.</p><div class="ex-filters"><label><span>Search examples</span><input type="search" data-example-filter="query" maxlength="160" placeholder="e.g. graphs, accuracy, conclusion" value="'+e(session.query)+'"></label>'+select('category','Area',[['','All areas'],...Object.entries(CATEGORIES)],session.category)+select('kind','Exploration type',[['','All types'],['modelling','Modelling'],['statistics','Statistics'],['theoretical','Theoretical']],session.kind)+'</div><div id="ex-results">'+libraryResults(session)+'</div></div>';
}
