import {IDEA_TOPICS,IDEA_CHECKS,seedById,topicById,OWN_PROMPT} from './catalog.js';
import {ideaState,ideaChoices,currentSeed} from './engine.js';
import {escapeHtml as e,icon} from '../ui/primitives.js';
const button=(action,label,attrs='',primary=false)=>'<button type="button" class="btn '+(primary?'btn-primary':'btn-secondary')+'" data-action="idea-'+action+'" '+attrs+'>'+e(label)+'</button>';
const input=(key,label,value,{rows=2,savedId='',placeholder=''}={})=>'<div class="field-group"><label class="field-label" for="idea-'+e(savedId?savedId+'-'+key:key)+'">'+e(label)+'</label><textarea class="field" id="idea-'+e(savedId?savedId+'-'+key:key)+'" data-idea-input="'+e(key)+'"'+(savedId?' data-idea-saved="'+e(savedId)+'"':'')+' rows="'+rows+'" maxlength="1600" placeholder="'+e(placeholder)+'">'+e(value||'')+'</textarea></div>';
const select=(key,label,value,options,attrs='')=>'<label class="idea-select" for="idea-'+e(key)+'"><span>'+e(label)+'</span><select class="field" id="idea-'+e(key)+'" '+attrs+'>'+options.map(([v,t])=>'<option value="'+e(v)+'"'+(value===v?' selected':'')+'>'+e(t)+'</option>').join('')+'</select></label>';
function controls(state){
 const s=ideaState(state);
 return '<div class="idea-toolbar">'+button('own','Use my own idea instead')+button('compare','Compare saved ideas ('+s.shortlist.length+'/3)')+'</div>';
}
function sourceNote(){return '<details class="idea-source"><summary>What makes a promising starting point?</summary><p>The JIS SL Maths IA Guide 2025 (pages 8-11) asks you to consider accessible data, a connection to course mathematics and something you can start quickly. It encourages ideas from everyday life, hobbies and organisations you already belong to.</p><p>These categories and directions are new Pathfinder prompts, not prescribed IA titles from the guide. Theoretical ideas use a defined mathematical starting point and still need a course check. One idea is enough; this explorer is optional.</p></details>';}
export function ideaExplorerView(state){
 const s=ideaState(state);
 if(s.pending)return ideaConfirmationView(state);
 if(s.active)return ideaDetailView(state);
 const choices=ideaChoices(state),topic=topicById(s.topic);
 return '<section class="idea-explorer" aria-label="Optional Idea Explorer">'+controls(state)+
  '<div class="idea-start"><span class="idea-eyebrow">START WITH SOMETHING THAT INTERESTS YOU</span>'+select('topic','What interests you?',s.topic,[['','Not sure yet - show a mixture'],...IDEA_TOPICS.map(t=>[t.id,t.label]),['other','Something else - my own interest']],'data-idea-topic')+
  (topic?'<div class="idea-subtopics" role="group" aria-label="Optional subtopics">'+topic.subtopics.map((t,i)=>'<button id="idea-subtopic-'+i+'" type="button" class="idea-chip" data-action="idea-subtopic" data-subtopic="'+e(t)+'" aria-pressed="'+(s.subtopic===t)+'">'+e(t)+'</button>').join('')+'</div>':'')+
  '<label class="idea-select" for="idea-focus"><span>My own specific interest (optional)</span><input class="field" id="idea-focus" data-idea-input="focus" maxlength="160" value="'+e(s.focus)+'" placeholder="A particular activity, object or observation"></label><p class="field-hint">Your own wording is kept with a direction you open. It is not automatically matched to a new investigation.</p></div>'+
  (s.topic==='other'?'<div class="idea-empty"><h3>Start from your own observation</h3><p>What could you compare, measure, model or explain about it? You do not need to fit a suggested category.</p>'+button('own','Shape my own direction','',true)+'</div>':
  '<div class="idea-section-heading"><h3 id="idea-directions-heading" tabindex="-1">Three possible directions</h3><p>Starting points to adapt, not finished IA titles. '+(s.subtopic?'Related angles are shown first; not every card is a match for '+e(s.subtopic)+'.':'')+'</p></div><div class="idea-grid">'+choices.items.map(seed=>'<article class="idea-card" data-idea-card="'+e(seed.id)+'"><span class="idea-eyebrow">'+e(topicById(seed.topic).label)+'</span><h4>'+e(seed.title)+'</h4><p>'+e(seed.question)+'</p><div class="idea-material"><strong>Possible starting material</strong><p>'+e(seed.material)+'</p></div>'+button('explore','Explore this','data-seed="'+e(seed.id)+'"',true)+'</article>').join('')+'</div><div class="idea-more-row">'+button('more','Show other directions')+'<span class="field-hint">'+choices.total+' starting directions '+(s.topic?'in this topic':'across all topics')+'. Nothing is selected for you.</span></div>')+
  sourceNote()+'</section>';
}
export function ideaDetailView(state){
 const s=ideaState(state),seed=currentSeed(state),d=s.drafts[s.active],saved=s.shortlist.find(x=>x.id===d.savedId);
 return '<section class="idea-explorer idea-detail" data-idea-detail="'+e(seed.id)+'"><div class="idea-toolbar">'+button('browse','Back to directions')+(seed.id!=='own'?button('angle','Try a different angle'):'')+button('compare','Saved ideas ('+s.shortlist.length+'/3)')+'</div>'+
  '<h3 id="idea-detail-heading" tabindex="-1">'+e(seed.title)+'</h3>'+(d.focus?'<p class="idea-focus-note"><strong>Your interest:</strong> '+e(d.focus)+'. Adapt this direction or choose another when it does not fit.</p>':'')+
  '<p class="field-hint">'+(seed.id==='own'?'Write a possible topic or question in your own words.':'The box starts with a suggested question. Edit or replace it; choosing it does not establish your motivation, source or mathematical method.')+'</p>'+
  input('question','My version of this idea',d.question,{rows:3,placeholder:'What would I like to investigate?'})+
  '<details class="idea-narrow"><summary>Make it more specific (optional)</summary>'+input('detail',seed.narrow,d.detail,{placeholder:'A note for developing the aim, not a compulsory answer'})+(saved?button('save-copy','Save this variation as a separate possibility'):'')+'</details>'+ 
  '<div class="idea-primary-actions">'+button('use','Continue with this idea','',true)+button('save',saved?'Update saved possibility':'Save as a possibility')+'</div><p id="idea-save-status" role="status" tabindex="-1" class="field-hint">'+(saved?'A saved version is on your shortlist. Changes here are saved to that version only when you choose Update.':'Saving a possibility does not replace your current topic or aim.')+'</p>'+
  '<details class="idea-trial"><summary>Try a small first step (optional)</summary><p class="idea-small-step">'+e(seed.first)+'</p><p><strong>Starting material:</strong> '+e(seed.material)+'</p><p class="idea-caution">'+e(seed.caution)+'</p>'+input('trialNote','What did I check or find out? (private planning note)',d.trialNote,{placeholder:'An honest check of access or feasibility, not an invented result'})+
  select('trialStatus','My judgement so far',d.trialStatus,[['','Not tried / undecided'],['workable','This seems workable'],['adjust','I need to adjust it'],['possible','Keep it as a possibility']],'data-idea-input="trialStatus"')+
  (seed.resources.length?'<div class="idea-resource-links"><p class="field-hint">Tool guides for this small step. Opening one does not choose the method.</p>'+seed.resources.map(id=>'<button type="button" class="btn btn-light" data-action="resource-open" data-resource-id="'+e(id)+'">'+e(resourceLabel(id))+' '+icon('chevron-right')+'</button>').join('')+'</div>':'')+'</details>'+
  '<details class="idea-maths"><summary>Possible mathematics and a useful check</summary><p>'+e(seed.maths)+'</p><p>'+e(seed.caution)+'</p><p class="field-hint">These are possible connections, not a course-suitability judgement. A small first step is not the whole investigation. Check the mathematical depth with your teacher.</p></details>'+sourceNote()+'</section>';
}
const resourceNames={'image-scale':'Check an image scale','image-route':'Visual fit or recorded coordinates?','desmos-start':'Get started in Desmos','organise':'Organise observations','distribution-graphs':'Compare distributions','chart-choice':'Choose a suitable graph','model-check':'Check a fitted model','summary-stats':'Summary statistics','image-points':'Record image coordinates','binomial':'Preview a probability tool','derivatives':'Preview derivative tools','desmos-table':'Work with a table in Desmos','desmos-regression':'Fit a selected model','restrictions':'Restrict a curve','reporting-precision':'Check reporting precision','secondary-data':'Check a secondary-data source','forms':'Plan a form and responses'};
const resourceLabel=id=>resourceNames[id]||'Open a related written guide';
export function ideaComparisonView(state){
 const s=ideaState(state);if(s.pending)return ideaConfirmationView(state);
 return '<section class="idea-explorer idea-comparison"><div class="idea-toolbar">'+button('browse','Explore more directions')+button('own','Add my own idea')+'</div><h3 id="idea-compare-heading" tabindex="-1">My saved possibilities</h3><p>Keep up to three. These are your judgements, not scores or automatic approval. One promising idea is enough.</p>'+
  (!s.shortlist.length?'<p class="idea-empty">No saved cards yet. Explore a direction, add your own idea, or keep your current one.</p>':'<div class="idea-grid">'+s.shortlist.map(d=>{
   const seed=seedById(d.seedId)||OWN_PROMPT;
   return '<article class="idea-card idea-saved" data-idea-saved-card="'+e(d.id)+'"><h4>'+e(d.question)+'</h4>'+(d.detail?'<p>'+e(d.detail)+'</p>':'')+
    '<details class="idea-checks"><summary>My four quick checks (optional)</summary>'+IDEA_CHECKS.map(c=>select(d.id+'-'+c.id,c.label,d.checks[c.id],[['','Not checked'],...c.options],'data-idea-input="'+e(c.id)+'" data-idea-saved="'+e(d.id)+'"')).join('')+'<p class="field-hint">'+e(seed.maths)+'</p></details>'+
    (d.trialNote?'<details><summary>My first-step note</summary><p>'+e(d.trialNote)+'</p></details>':'')+
    '<div class="idea-saved-actions">'+button('use','Develop this idea','data-id="'+e(d.id)+'"',true)+button('edit-saved','Edit possibility','data-id="'+e(d.id)+'"')+button('remove','Remove from shortlist','data-id="'+e(d.id)+'"')+'</div></article>';
  }).join('')+'</div>')+
  legacyComparison(state)+
  (s.history.length?'<details class="idea-source"><summary>Earlier idea choices ('+s.history.length+')</summary>'+s.history.slice().reverse().map(h=>'<div><p><strong>Earlier topic:</strong> '+e(h.before||'No earlier topic')+'</p><p><strong>Selected direction:</strong> '+e(h.after)+'</p><p class="field-hint">The aim at that choice: '+e(h.aimAtChoice||'Not written yet')+'</p></div>').join('')+'</details>':'')+'</section>';
}
export function ideaConfirmationView(state){
 const p=ideaState(state).pending;
 return '<section class="idea-explorer idea-confirm"><h3 id="idea-confirm-heading" tabindex="-1">Review before using this idea</h3><div class="idea-compare-change"><div><strong>Current topic</strong><p>'+e(p.origin.idea||p.origin.projectIdea||'Not recorded')+'</p></div><div><strong>Proposed direction</strong><p>'+e(p.draft.question)+'</p></div></div>'+
  '<p><strong>Your existing aim stays unchanged.</strong> '+e(p.origin.aim||p.origin.projectAim||'There is no aim written yet.')+'</p><p>Only the topic is selected here. Refine the aim on the next page. Your previous topic, original prediction, methods, data and results are retained. No new method or source is selected.</p>'+
  (state.entries.length?'<p class="idea-caution">You already have mathematical work. Refine the current investigation where possible rather than starting over. Discuss a substantial change with your teacher; completed introduction, mathematics and conclusion stages will be flagged for review, not erased.</p>':'')+
  '<div class="idea-primary-actions">'+button('confirm','Confirm idea and review aim','',true)+button('cancel','Cancel - keep my current plan')+'</div></section>';
}
export function ideaFooter(state){
 const s=ideaState(state);if(s.pending)return '';
 const current=state.planning.fields.idea||state.project.idea;
 return '<div class="task-footer idea-footer"><button class="btn btn-quiet" type="button" data-action="plan-edit" data-node="N00">Back to starting choices</button>'+(current?button('keep','Keep my current idea and continue'):'')+'</div>';
}

function legacyComparison(state){
 const f=state.planning.fields,seen=new Set();
 const rows=[['idea','Current topic'],['originalIdea','First recorded idea'],['otherIdea1','Earlier alternative 1'],['otherIdea2','Earlier alternative 2']].filter(([key])=>{const v=f[key]?.trim();if(!v||seen.has(v))return false;seen.add(v);return true;});
 if(!rows.length&&!f.ideaAccess&&!f.ideaValue)return '';
 return '<details class="idea-legacy"'+(!ideaState(state).shortlist.length?' open':'')+'><summary>My current and earlier typed ideas</summary>'+rows.map(([key,label])=>'<div class="summary-block"><strong>'+e(label)+'</strong><p>'+e(f[key])+'</p>'+button('legacy','Develop this typed idea','data-key="'+key+'"')+'</div>').join('')+
 (f.ideaAccess?'<p><strong>Earlier access note:</strong> '+e(f.ideaAccess)+'</p>':'')+(f.ideaValue?'<p><strong>Earlier interest / manageability note:</strong> '+e(f.ideaValue)+'</p>':'')+'</details>';
}
