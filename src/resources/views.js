import {RESOURCES,TOOLS,resourceById,PRACTICE_PAIRS} from './catalog.js';
import {resourceContext,resourceSuggestions,filterResources} from './context.js';
import {escapeHtml as e,icon} from '../ui/primitives.js';
import {REPRESENTATION_TOOLS} from '../diagrams/representation-registry.js';
const hosts=new Set(['support.google.com','help.desmos.com','www.desmos.com','runestone.academy','www.dataspire.org','www.lehman.cuny.edu','datahelpdesk.worldbank.org','databank.worldbank.org','automeris.io','www.perkins.org','knilt.arcc.albany.edu','mathispower4u.com','www.youtube.com','sheets.google.com','forms.google.com']);
export function safeResourceUrl(value){
 try{const u=new URL(value);return u.protocol==='https:'&&hosts.has(u.hostname)&&!u.username&&!u.password?u.href:'';}catch{return '';}
}
const link=(url,label)=>{const safe=safeResourceUrl(url);return safe?'<a class="btn btn-secondary" href="'+e(safe)+'" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">'+e(label)+' '+icon('arrow-up-right')+'<span class="visually-hidden"> (opens a new tab)</span></a>':'';};
const button=(action,label,extra='',primary=false)=>'<button type="button" class="btn '+(primary?'btn-primary':'btn-quiet')+'" data-action="resource-'+action+'" '+extra+'>'+e(label)+'</button>';
const guideButton=(id,label,help=false)=>button('open',label,'data-resource-id="'+e(id)+'" data-resource-help="'+help+'"');
const badge=r=>'<span class="resource-badge">'+e(TOOLS[r.tool].name)+'</span>';
export function resourcePrompt(state,options={}){
 const x=resourceContext(state,options),list=resourceSuggestions(state,options),r=list[0],data='data-resource-help="'+!!options.help+'"';
 const browse=button('browse','Tools & tutorials',data);
 if(!r||state.resources?.hidden?.[x.hiddenKey])return '<div class="resource-quiet">'+browse+'</div>';
 return '<section class="resource-prompt" aria-label="Optional tools and tutorials" data-resource-suggestion="'+e(r.id)+'">'+
  '<div class="resource-eyebrow">'+icon('book')+' TOOLS & TUTORIALS <span>Optional</span></div>'+
  '<strong>'+e(r.title)+'</strong><p>'+e(r.when)+'</p><div class="button-row">'+guideButton(r.id,r.videos.length?'Steps & video':'Read the steps',!!options.help)+
  button('browse','Browse tools & tutorials',data)+button('hide','Hide for this task',data)+'</div></section>';
}
function preferences(x){
 const select=(key,label,options,value)=>'<label class="resource-control" for="resource-pref-'+key+'"><span>'+e(label)+'</span><select id="resource-pref-'+key+'" data-resource-pref="'+key+'">'+options.map(([v,t])=>'<option value="'+v+'"'+(value===v?' selected':'')+'>'+e(t)+'</option>').join('')+'</select></label>';
 return '<details class="resource-preferences"><summary>Choose tools or a picture task for this stage</summary><p>These choices select help only. They do not change your aim, method or work status.</p><div class="resource-filters">'+
  select('tool','Preferred graphing tool',[['','Not chosen'],['sheets','Google Sheets'],['desmos','Desmos']],x.pref.tool)+
  select('image','Picture task',[['','No picture help selected'],['import','Import / calibrate a picture'],['visual','Adjust a curve visually'],['points','Record points for regression']],x.pref.image)+
  '</div><p class="resource-small">Picture modelling: import, calibrate, choose visual fitting or recorded coordinates, then check the model. A picture is not automatically fitted by Desmos.</p></details>';
}
/** Native creators are a separate, clearly labelled part of the resource library.
 * The shared registry keeps titles/icons consistent with IA Studio. No source
 * suggestion becomes a claim that a particular diagram is required. */
export function resourceCreatorHub({compact=false}={}){
 const cards=REPRESENTATION_TOOLS.map(t=>
  '<button type="button" class="resource-creator-card" data-action="resource-creator-open" data-resource-creator="'+e(t.id)+'">'+
   '<span class="resource-creator-card-icon">'+icon(t.icon)+'</span>'+
   '<span class="resource-creator-card-copy"><strong>'+e(t.title)+'</strong><small>'+e(t.detail)+'</small>'+
    '<span class="resource-creator-card-cta">Open creator '+icon("arrow-right")+'</span></span></button>').join("");
 const headline='<div class="resource-creator-heading"><span class="resource-creator-heading-icon">'+icon("layers")+'</span>'+
  '<div><h3>Pathfinder diagram creators</h3><p>Make and refine diagrams here, without switching to another website.</p></div></div>';
 const note='<p class="resource-creator-note">All '+REPRESENTATION_TOOLS.length+' creators are optional. Your drafts stay editable; opening a creator does not add a result to your IA. Use <strong>Back to my work</strong> to return to your previous page.</p>';
 return compact?'<details class="resource-creators resource-creators-compact"><summary>'+icon("layers")+
   ' Use a Pathfinder diagram creator</summary>'+headline+'<div class="resource-creator-grid">'+cards+'</div>'+note+'</details>':
  '<section class="resource-creators" aria-label="Pathfinder diagram creators">'+headline+
   '<div class="resource-creator-grid">'+cards+'</div>'+note+'</section>';
}
function resourceRow(r,help){return '<article class="resource-row">'+badge(r)+'<h3>'+e(r.title)+'</h3><p>'+e(r.when)+'</p>'+guideButton(r.id,'Open guide',help)+'</article>';}
export function resourceList(session){
 const list=filterResources(session),visible=list.slice(0,session.limit);
 return '<p class="resource-small" role="status">'+list.length+' matching guide'+(list.length===1?'':'s')+'. Browse freely; availability is not a recommendation to use a method.</p>'+
  (list.length?'<div class="resource-grid">'+visible.map(r=>resourceRow(r,session.help)).join('')+'</div>':'<p>No matching guide. Try a shorter search or clear the filters. Every guide has written steps.</p>')+
  (visible.length<list.length?button('more','Show more guides'):'');
}
export function resourceDrawer(state,session){
 const x=resourceContext(state,{help:session.help}),r=resourceById(session.id);
 const close=button('close',session.parent==='stuck'?'Back to I am stuck':'Return to my work');
 const intro='<p class="resource-context">'+e(x.label.slice(0,160))+'</p>';
 if(r){
  const chosen=isCurrentGuide(state,session,r.id),mode=chosen?(x.planning?'Planning preview':r.id==='pmcc-meaning'||r.id==='model-check'?'Understand and check':'Learn how'):'Library preview';
  const tool=r.tool==='general'?'':link(TOOLS[r.tool].url,'Open '+TOOLS[r.tool].name);
  const video=r.videos.length?'<details class="resource-videos"><summary>Video walkthrough'+(r.videos.length===1?'':'s')+' ('+r.videos.length+')</summary>'+r.videos.map(v=>
   '<div class="resource-video"><strong>'+e(v.publisher)+'</strong><p>'+e(v.find)+'</p>'+(v.duration?'<p class="resource-small">'+e(v.duration)+'</p>':'')+
   link(v.url,v.url.includes('youtube.com')?'Open external video':'Open video on publisher page')+(v.note?'<p class="resource-small">'+e(v.note)+'</p>':'')+'</div>').join('')+
   '<p class="resource-small">Publisher listings checked 15 October 2026. Videos have not been watched end to end for this library; captions and school access may vary. The written steps here are the fallback.</p></details>':'<p class="resource-small resource-no-video">Written guide available. No reviewed task-specific video is linked here yet.</p>';
  return '<div class="resource-library" data-resource-detail="'+e(r.id)+'"><div class="button-row">'+button('list','Back to library')+close+'</div>'+intro+
   '<div class="resource-eyebrow">'+e(mode)+' '+badge(r)+'</div><h3 class="resource-heading" tabindex="-1">'+e(r.title)+'</h3>'+
   '<p class="resource-prerequisite"><strong>Use this when:</strong> '+e(r.when)+'</p>'+
   '<p class="resource-small">'+e(TOOLS[r.tool].device)+'</p>'+
   ((r.id==='inference'||['normal','binomial','derivatives','integrals'].includes(r.id))?'<p class="resource-scope">Check your exact course and understanding with your teacher. This guide explains tool operation, not syllabus approval.</p>':'')+
   '<div class="button-row">'+tool+'</div><h4>Read the steps</h4><ol class="resource-steps">'+r.steps.map(t=>'<li>'+e(t)+'</li>').join('')+'</ol>'+
   resourceCreatorHub({compact:true})+
   (r.snippets.length?'<div class="resource-snippets">'+r.snippets.map(([label,code])=>'<p class="resource-small">'+e(label)+'</p><pre><code>'+e(code)+'</code></pre>').join('')+'</div>':'')+
   '<div class="resource-check"><strong>Check before using the output</strong><p>'+e(r.check)+'</p></div>'+
   '<div class="resource-after"><strong>Back in your own IA</strong><p>'+e(r.after)+'</p><p class="resource-small">Record only mathematics you actually performed. Reading or watching does not mark anything complete or edit your IA.</p></div>'+
   (r.practice?'<details class="resource-practice"><summary>Try six practice pairs (optional)</summary><p>Invented practice values, not a dataset for your IA. Paste the headings and values into A1 of a blank practice Sheet; for Desmos, copy just the numerical rows.</p><label for="resource-practice-data">Practice table (tab-separated)</label><textarea id="resource-practice-data" readonly rows="7">'+e(PRACTICE_PAIRS)+'</textarea>'+button('copy','Copy practice table')+'<p id="resource-copy-status" role="status" class="resource-small"></p></details>':'')+
   video+'<details class="resource-sources"><summary>Written references & link information</summary>'+r.sources.map(s=>'<p>'+link(s.url,s.publisher+': '+s.title)+'</p>').join('')+
   '<p class="resource-small">Source pages checked 15 October 2026. Interfaces can change. A broken link never blocks saving or the written instructions above. Nothing from your project is added to these external URLs.</p></details>'+
   (r.related.length?'<details class="resource-related"><summary>Related tasks, only when useful</summary>'+r.related.map(id=>guideButton(id,resourceById(id).title,session.help)).join('')+'</details>':'')+
   preferences(x)+'<div class="resource-footer">'+close+'</div></div>';
 }
 const cats=[...new Set(RESOURCES.map(r=>r.category))];
 const options=(values,selected)=>values.map(([v,t])=>'<option value="'+e(v)+'"'+(v===selected?' selected':'')+'>'+e(t)+'</option>').join('');
 const suggested=resourceSuggestions(state,{help:session.help});
 return '<div class="resource-library"><p>Learn the tool for the task you have chosen. Written steps come first; external videos are optional.</p>'+intro+close+
  resourceCreatorHub()+
  preferences(x)+(suggested.length?'<details class="resource-current"><summary>Useful for this stage</summary>'+suggested.map(r=>resourceRow(r,session.help)).join('')+'</details>':'')+
  '<form class="resource-filter-form" role="search"><label class="resource-control" for="resource-search"><span>Search tasks (for example PMCC, picture or integral)</span><input id="resource-search" type="search" maxlength="120" data-resource-filter="query" value="'+e(session.query)+'" placeholder="Find a task"></label><div class="resource-filters">'+
  '<label class="resource-control" for="resource-filter-tool"><span>Filter by tool</span><select id="resource-filter-tool" data-resource-filter="tool">'+options([['','All tools'],...Object.entries(TOOLS).map(([k,v])=>[k,v.name])],session.tool)+'</select></label>'+
  '<label class="resource-control" for="resource-filter-category"><span>Topic</span><select id="resource-filter-category" data-resource-filter="category">'+options([['','All topics'],...cats.map(c=>[c,c])],session.category)+'</select></label></div>'+button('clear','Clear filters')+'</form>'+
  '<div id="resource-results">'+resourceList(session)+'</div><div class="resource-footer">'+close+'</div></div>';
}
function isCurrentGuide(state,session,id){return resourceSuggestions(state,{help:session.help}).some(r=>r.id===id);}
