import {RESOURCES,TOOLS,resourceById,PRACTICE_PAIRS} from './catalog.js';
import {resourceContext,resourceSuggestions,filterResources} from './context.js';
import {escapeHtml as e,icon} from '../ui/primitives.js';
import {REPRESENTATION_TOOLS} from '../diagrams/representation-registry.js';
import {renderMlaCitationGuide} from './mla-guide.js';
import {renderWorkshop} from '../workshop/views.js';
import {discoverResources,DISCOVERY_AREAS,DISCOVERY_TYPES} from './discovery.js';
import {hubOriginalView} from '../help/hub-issues.js';
import {contextualLearningChoices,renderContextualLearningHelp} from './contextual-learning.js';
const hosts=new Set(['support.google.com','help.desmos.com','www.desmos.com','runestone.academy','www.dataspire.org','www.lehman.cuny.edu','datahelpdesk.worldbank.org','databank.worldbank.org','automeris.io','www.perkins.org','knilt.arcc.albany.edu','mathispower4u.com','www.youtube.com','sheets.google.com','forms.google.com','docs.google.com','style.mla.org','www.ibo.org','data.worldbank.org']);
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
 const learn=button('workshop','Maths Workshop: definitions & practice',data);
 if(!r||state.resources?.hidden?.[x.hiddenKey])return '<div class="resource-quiet">'+browse+learn+'</div>';
 return '<section class="resource-prompt" aria-label="Optional tools and tutorials" data-resource-suggestion="'+e(r.id)+'">'+
  '<div class="resource-eyebrow">'+icon('book')+' TOOLS & TUTORIALS <span>Optional</span></div>'+
  '<strong>'+e(r.title)+'</strong><p>'+e(r.when)+'</p><div class="button-row">'+guideButton(r.id,r.videos.length?'Steps & video':'Read the steps',!!options.help)+
  button('browse','Browse tools & tutorials',data)+learn+button('hide','Hide for this task',data)+'</div></section>';
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
export function resourceCreatorHub({compact=false,featured=false}={}){
 const cards=REPRESENTATION_TOOLS.map(t=>
  '<button type="button" class="resource-creator-card" data-action="resource-creator-open" data-resource-creator="'+e(t.id)+'">'+
   '<span class="resource-creator-card-icon">'+icon(t.icon)+'</span>'+
   '<span class="resource-creator-card-copy"><strong>'+e(t.title)+'</strong><small>'+e(t.detail)+'</small>'+
    '<span class="resource-creator-card-cta">Open creator '+icon("arrow-right")+'</span></span></button>').join("");
 const headline='<div class="resource-creator-heading"><span class="resource-creator-heading-icon">'+icon("layers")+'</span>'+
  '<div><h3>Pathfinder diagram creators</h3><p>Make and refine diagrams here, without switching to another website.</p></div></div>';
 const note='<p class="resource-creator-note">All '+REPRESENTATION_TOOLS.length+' creators are optional. Your drafts stay editable; opening a creator does not add a result to your IA. Use <strong>Back to my work</strong> to return to your previous page.</p>';
 const summary=featured?
  '<summary class="resource-destination-summary"><span class="resource-destination-icon">'+icon("layers")+'</span>'+
   '<span class="resource-destination-copy"><strong>Create a figure</strong><span>Make graphs, tables and diagrams in Pathfinder.</span></span>'+
   '<span class="resource-destination-cta">Choose a creator '+icon("chevron-down")+'</span></summary>':
  '<summary>'+icon("layers")+' Use a Pathfinder diagram creator</summary>';
 return compact?'<details class="resource-creators resource-creators-compact"'+(featured?' data-resource-creators-featured="true"':'')+'>'+
   summary+headline+'<div class="resource-creator-grid">'+cards+'</div>'+note+'</details>':
  '<section class="resource-creators" aria-label="Pathfinder diagram creators">'+headline+
   '<div class="resource-creator-grid">'+cards+'</div>'+note+'</section>';
}
function resourceRow(r,help){return '<article class="resource-row">'+badge(r)+'<h3>'+e(r.title)+'</h3><p>'+e(r.when)+'</p>'+guideButton(r.id,'Open guide',help)+'</article>';}
const GUIDE_GROUPS=[
 ['Data and graphs','Collect and organise data'],
 ['Correlation and models','Explore relationships and models'],
 ['Pictures and curves','Work with pictures and curves'],
 ['Calculus and probability','Use mathematical methods'],
 ['Financial models','Investigate financial models'],
 ['Proof and iteration','Explore proof and iteration'],
 ['Writing and checking','Reference and check sources'],
 ['Writing and access','Present and communicate mathematics']
];
const guideGroupIndex=category=>{const n=GUIDE_GROUPS.findIndex(([key])=>key===category);return n<0?GUIDE_GROUPS.length:n;};
const guideGroupTitle=category=>GUIDE_GROUPS.find(([key])=>key===category)?.[1]||category;
export function resourceList(session){
 const list=filterResources(session).sort((a,b)=>guideGroupIndex(a.category)-guideGroupIndex(b.category));
 const visible=list.slice(0,session.limit),categories=[...new Set(visible.map(r=>r.category))];
 const groups=categories.map(category=>{
  const rows=visible.filter(r=>r.category===category);
  return '<section class="resource-result-group" aria-label="'+e(guideGroupTitle(category))+'">'+
   '<h4>'+e(guideGroupTitle(category))+'</h4><div class="resource-grid">'+
   rows.map(r=>resourceRow(r,session.help)).join('')+'</div></section>';
 }).join('');
 return '<p class="resource-small resource-result-count" role="status">'+list.length+' matching guide'+(list.length===1?'':'s')+'. Browse freely; availability is not a recommendation to use a method.</p>'+
  (list.length?groups:'<p>No matching guide. Try a shorter search or clear the filters. Every guide has written steps.</p>')+
  (visible.length<list.length?button('more','Show more guides'):'');
}
const discoveryHit=item=>{
 const attrs=item.type==='guide'?'data-action="resource-open" data-resource-id="'+e(item.id)+'"':
  ['lesson','definition'].includes(item.type)?'data-action="resource-workshop-'+(item.type==='lesson'?'lesson':'term')+'" data-workshop-id="'+e(item.id)+'"':
  'data-action="resource-creator-open" data-resource-creator="'+e(item.id)+'"';
 const cta=item.type==='lesson'?'Start guided lesson':item.type==='definition'?'Read definition':
  item.type==='guide'?'Open guide':'Open creator';
 const tool=item.type==='guide'?'<span class="resource-discovery-tool">'+e(item.tool)+'</span>':'';
 return '<article class="resource-discovery-item" data-discovery-kind="'+e(item.type)+'">'+
  '<div class="resource-discovery-content"><h4>'+e(item.title)+'</h4><p>'+e(item.description)+'</p>'+tool+'</div>'+
  '<button type="button" class="btn btn-quiet resource-discovery-open" '+attrs+'>'+cta+' '+icon("arrow-right")+'</button>'+
  '</article>';
};
/** Render a unified result view only after an explicit search, task area, or type choice. */
export function resourceResults(session){
 const found=discoverResources(session);
 if(!found.active)return resourceList(session);
 const count=found.total;
 const tabs='<div class="resource-discovery-types" role="group" aria-label="Show results of this kind">'+
  DISCOVERY_TYPES.map(type=>{
   const n=type.id==='all'?count:found.counts[type.id];
   const active=found.type===type.id;
   return '<button type="button" class="resource-discovery-type'+(active?' is-active':'')+
    '" data-action="resource-discovery-type" data-resource-type="'+type.id+
    '" aria-pressed="'+active+'">'+e(type.label)+' <span>'+n+'</span></button>';
  }).join('')+'</div>';
 const titles={lesson:'Guided lessons',definition:'Maths definitions',guide:'Software & task tutorials',creator:'Pathfinder figure creators'};
 const groups=found.type==='all'?DISCOVERY_TYPES.filter(t=>t.id!=='all').map(t=>{
  const items=found.grouped[t.id],max=t.id==='definition'?5:4,shown=items.slice(0,max);
  if(!shown.length)return '';
  return '<section class="resource-discovery-group" data-discovery-group="'+t.id+'">'+
   '<div class="resource-discovery-group-heading"><h4>'+e(titles[t.id])+'</h4>'+
    (items.length>max?'<button type="button" class="btn btn-quiet" data-action="resource-discovery-type" data-resource-type="'+t.id+
     '">See all '+items.length+' '+e(t.label.toLowerCase())+' '+icon("arrow-right")+'</button>':'')+'</div>'+
   '<div class="resource-discovery-list">'+shown.map(discoveryHit).join('')+'</div></section>';
 }).join(''):'<section class="resource-discovery-group" data-discovery-group="'+found.type+'">'+
  '<h4>'+e(titles[found.type])+'</h4>'+
  '<div class="resource-discovery-list">'+found.grouped[found.type].slice(0,session.discoveryLimit||16).map(discoveryHit).join('')+'</div>'+
  (found.grouped[found.type].length>(session.discoveryLimit||16)?
   '<button type="button" class="btn btn-secondary resource-discovery-more" data-action="resource-discovery-more">Show more '+e(titles[found.type].toLowerCase())+'</button>':'')+
  '</section>';
 const summary='<p class="resource-small resource-discovery-count" role="status">'+count+' matching '+(count===1?'resource':'resources')+
  (found.area?' in '+e(DISCOVERY_AREAS.find(a=>a.id===found.area).label):'')+
  '. Browse for learning, not as a recommendation to use a method.</p>';
 return '<div class="resource-discovery-results">'+summary+tabs+
  (count?groups:'<p class="resource-discovery-empty">No matching resources. Try a shorter search, change the topic or clear the filters.</p>')+
  '</div>';
}
export function resourceDrawer(state,session){
 if(session.mode==='workshop')return renderWorkshop(state,session);
 const x=resourceContext(state,{help:session.help}),r=resourceById(session.id);
 const close=button('close',session.parent==='stuck'?'Back to I am stuck':'Return to my work');
 const intro='<p class="resource-context">'+e(x.label.slice(0,160))+'</p>';
 const workshopAction='<button type="button" class="btn btn-secondary" data-action="resource-workshop"'+
  (session.workshopReturn?' data-workshop-resume="true"':'')+'>Maths Workshop: definitions & guided practice '+icon('arrow-right')+'</button>';
 if(r){
  const chosen=isCurrentGuide(state,session,r.id),mode=chosen?(x.planning?'Planning preview':r.id==='pmcc-meaning'||r.id==='model-check'?'Understand and check':'Learn how'):'Library preview';
  const tool=r.tool==='general'?'':link(TOOLS[r.tool].url,'Open '+TOOLS[r.tool].name);
  const video=r.videos.length?'<details class="resource-videos"><summary>Video walkthrough'+(r.videos.length===1?'':'s')+' ('+r.videos.length+')</summary>'+r.videos.map(v=>
   '<div class="resource-video"><strong>'+e(v.publisher)+'</strong><p>'+e(v.find)+'</p>'+(v.duration?'<p class="resource-small">'+e(v.duration)+'</p>':'')+
   link(v.url,v.url.includes('youtube.com')?'Open external video':'Open video on publisher page')+(v.note?'<p class="resource-small">'+e(v.note)+'</p>':'')+'</div>').join('')+
   '<p class="resource-small">Publisher listings checked 15 October 2026. Videos have not been watched end to end for this library; captions and school access may vary. The written steps here are the fallback.</p></details>':'<p class="resource-small resource-no-video">Written guide available. No reviewed task-specific video is linked here yet.</p>';
  return '<div class="resource-library" data-resource-detail="'+e(r.id)+'"><div class="button-row">'+button('list','Back to library')+workshopAction+'</div>'+intro+
   '<div class="resource-eyebrow">'+e(mode)+' '+badge(r)+'</div><h3 class="resource-heading" tabindex="-1">'+e(r.title)+'</h3>'+
   '<p class="resource-prerequisite"><strong>Use this when:</strong> '+e(r.when)+'</p>'+
   '<p class="resource-small">'+e(TOOLS[r.tool].device)+'</p>'+
   ((r.id==='inference'||['normal','binomial','derivatives','integrals'].includes(r.id))?'<p class="resource-scope">Check your exact course and understanding with your teacher. This guide explains tool operation, not syllabus approval.</p>':'')+
   '<div class="button-row">'+tool+'</div><h4>Read the steps</h4><ol class="resource-steps">'+r.steps.map(t=>'<li>'+e(t)+'</li>').join('')+'</ol>'+
   (r.id==='mla-citations'?renderMlaCitationGuide({e,icon,link}):resourceCreatorHub({compact:true}))+
   (r.snippets.length?'<div class="resource-snippets">'+r.snippets.map(([label,code])=>'<p class="resource-small">'+e(label)+'</p><pre><code>'+e(code)+'</code></pre>').join('')+'</div>':'')+
   '<div class="resource-check"><strong>Check before using the output</strong><p>'+e(r.check)+'</p></div>'+
   '<div class="resource-after"><strong>Back in your own IA</strong><p>'+e(r.after)+'</p><p class="resource-small">Record only mathematics you actually performed. Reading or watching does not mark anything complete or edit your IA.</p></div>'+
   (r.practice?'<details class="resource-practice"><summary>Try six practice pairs (optional)</summary><p>Invented practice values, not a dataset for your IA. Paste the headings and values into A1 of a blank practice Sheet; for Desmos, copy just the numerical rows.</p><label for="resource-practice-data">Practice table (tab-separated)</label><textarea id="resource-practice-data" readonly rows="7">'+e(PRACTICE_PAIRS)+'</textarea>'+button('copy','Copy practice table')+'<p id="resource-copy-status" role="status" class="resource-small"></p></details>':'')+
   video+'<details class="resource-sources"><summary>Written references & link information</summary>'+r.sources.map(s=>'<p>'+link(s.url,s.publisher+': '+s.title)+'</p>').join('')+
   '<p class="resource-small">Source guidance checked at the date stated in each source record. Interfaces can change. A broken link never blocks saving or the written instructions above. Nothing from your project is added to these external URLs.</p></details>'+
   (r.related.length?'<details class="resource-related"><summary>Related tasks, only when useful</summary>'+r.related.map(id=>guideButton(id,resourceById(id).title,session.help)).join('')+'</details>':'')+
   preferences(x)+'<div class="resource-footer">'+close+'</div></div>';
 }
 const supportView=session.parent==='stuck'?hubOriginalView(state):state;
 const supportSpot=session.supportSpot||supportView.helpSpot||'page';
 const supportIssue=session.supportIssue||'';
 const helpChoices=contextualLearningChoices(supportView,{spot:supportSpot,issueId:supportIssue});
 const targeted=renderContextualLearningHelp(supportView,e,{spot:supportSpot,issueId:supportIssue,compact:true});
 // Do not repeat the exact tutorial already linked in the focused help card.
 const suggested=resourceSuggestions(state,{help:session.help}).filter(r=>r.id!==helpChoices?.guideId);
 const meaningful=!!targeted||suggested.length>0;
 const heading=supportSpot.includes('field:')?'Help for this writing box':
  supportSpot.includes('part:')?'Help for this mathematical step':'Useful for your current stage';
 const relevant=meaningful?'<section class="resource-current resource-home-relevant" aria-label="Useful guides for this stage">'+
  '<div class="resource-home-heading"><h3>'+heading+'</h3><span class="resource-relevant-stage">'+e(x.label.slice(0,110))+'</span></div>'+
  '<p class="resource-small">Optional learning support based on your recorded stage and chosen mathematics, not an instruction to add another method.</p>'+
  targeted+
  (suggested.length?'<details class="resource-relevant-guides"'+(targeted?'':' open')+'><summary>'+
   'Other tutorial guidance for this stage ('+suggested.length+')</summary>'+
   '<div class="resource-relevant-grid">'+suggested.map(r=>resourceRow(r,session.help)).join('')+'</div></details>':'')+
  '</section>':'';
 const destination=(title,description,cta,kind,action,attrs='')=>
  '<button type="button" class="resource-destination-card" data-action="'+action+'" '+attrs+'>'+
   '<span class="resource-destination-icon">'+icon(kind)+'</span>'+
   '<span class="resource-destination-copy"><strong>'+e(title)+'</strong><span>'+e(description)+'</span></span>'+
   '<span class="resource-destination-cta">'+e(cta)+' '+icon("arrow-right")+'</span></button>';
 const destinations='<section class="resource-home-navigation" aria-labelledby="resource-home-navigation-title">'+
  '<div class="resource-home-heading"><h3 id="resource-home-navigation-title">What would you like to do?</h3></div>'+
  '<div class="resource-quick-tools">'+
   '<div class="resource-workshop-entry resource-destination-wrap">'+
    destination('Learn the maths','Definitions, worked methods and guided practice.','Open Maths Workshop','book','resource-workshop')+'</div>'+
   destination('Use software','Step-by-step instructions for Desmos, Sheets and other tools.','Find a software guide','calculator','resource-guides')+
   '<div class="resource-destination-wrap resource-creators-wrap">'+resourceCreatorHub({compact:true,featured:true})+'</div>'+
   destination('Reference my sources','MLA citations, what to cite and a Works Cited list.','Open MLA referencing guide','file','resource-open',
    'data-resource-id="mla-citations" data-resource-help="'+!!session.help+'"')+
  '</div></section>';
 const cats=[...new Set(RESOURCES.map(r=>r.category))];
 const options=(values,selected)=>values.map(([v,t])=>'<option value="'+e(v)+'"'+(v===selected?' selected':'')+'>'+e(t)+'</option>').join('');
 const filterActive=!!(session.tool||session.category);
 const filters='<section class="resource-discovery-search" aria-labelledby="resource-search-heading">'+
  '<h3 id="resource-search-heading">What do you need help with?</h3>'+
  '<form id="resource-filter-form" class="resource-filter-form" role="search">'+
   '<label class="resource-control" for="resource-search"><span>Search tasks, methods and tools</span>'+
    '<input id="resource-search" type="search" maxlength="120" data-resource-filter="query" value="'+e(session.query)+'" placeholder="Try PMCC, sampling, histogram or MLA"></label>'+
   '<p class="resource-small resource-search-help">Search across definitions, guided lessons, software tutorials and built-in creators.</p>'+
   '<details class="resource-advanced-filters"'+(filterActive?' open':'')+'><summary>Software guide filters'+(filterActive?' (active)':'')+'</summary>'+
    '<p class="resource-small">These extra filters apply to software and task tutorials only.</p>'+
    '<div class="resource-filters">'+
     '<label class="resource-control" for="resource-filter-tool"><span>Software or tool</span><select id="resource-filter-tool" data-resource-filter="tool">'+
      options([['','All tools'],...Object.entries(TOOLS).map(([k,v])=>[k,v.name])],session.tool)+'</select></label>'+
     '<label class="resource-control" for="resource-filter-category"><span>Tutorial task area</span><select id="resource-filter-category" data-resource-filter="category">'+
      options([['','All areas'],...cats.map(c=>[c,guideGroupTitle(c)])],session.category)+'</select></label>'+
    '</div></details><div class="resource-filter-reset">'+button('clear','Clear search and filters')+'</div>'+
  '</form></section>';
 const areas='<div class="resource-discovery-areas" role="group" aria-label="Browse help by task">'+
  '<button type="button" class="resource-discovery-area'+(!session.discoveryArea?' is-active':'')+
   '" data-action="resource-discovery-area" data-resource-area="" aria-pressed="'+!session.discoveryArea+'">All topics</button>'+
  DISCOVERY_AREAS.map(area=>'<button type="button" class="resource-discovery-area'+(session.discoveryArea===area.id?' is-active':'')+
   '" data-action="resource-discovery-area" data-resource-area="'+e(area.id)+'" aria-pressed="'+(session.discoveryArea===area.id)+'">'+e(area.label)+'</button>').join('')+
  '</div>';
 return '<div class="resource-library resource-library-home">'+
  '<p class="resource-home-intro">Choose the help you need. Learn a method, use software, make a figure or reference your sources.</p>'+
  relevant+filters+destinations+
  '<section class="resource-home-guides" aria-labelledby="resource-home-guides-title">'+
   '<div class="resource-home-heading"><h3 id="resource-home-guides-title">Browse by task</h3>'+
    '<p>Choose a topic to see relevant mathematics, tutorials and creators together. Browsing does not select a method for your IA.</p></div>'+
   areas+
   '<div id="resource-results">'+resourceResults(session)+'</div>'+
   preferences(x)+
  '</section><div class="resource-footer">'+close+'</div></div>';
}
function isCurrentGuide(state,session,id){return resourceSuggestions(state,{help:session.help}).some(r=>r.id===id);}
