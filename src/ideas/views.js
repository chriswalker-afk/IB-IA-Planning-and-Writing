import {IDEA_TOPICS,IDEA_CHECKS,seedById,topicById,OWN_PROMPT} from './catalog.js';
import {ideaState,ideaChoices,currentSeed} from './engine.js';
import {IDEA_MAP_ROOTS,DATA_BRANCHES,IDEA_DATA_PROMISE,IDEA_THEORY_CAUTION,ideaMapRoots,ideaMapRoot,ideaMapTopics,ideaMapBranches,ideaMapIdeas} from './mindmap.js';
import {escapeHtml as e,icon} from '../ui/primitives.js';
const button=(action,label,attrs='',primary=false)=>'<button type="button" class="btn '+(primary?'btn-primary':'btn-secondary')+'" data-action="idea-'+action+'" '+attrs+'>'+e(label)+'</button>';
const input=(key,label,value,{rows=2,savedId='',placeholder=''}={})=>'<div class="field-group"><label class="field-label" for="idea-'+e(savedId?savedId+'-'+key:key)+'">'+e(label)+'</label><textarea class="field" id="idea-'+e(savedId?savedId+'-'+key:key)+'" data-idea-input="'+e(key)+'"'+(savedId?' data-idea-saved="'+e(savedId)+'"':'')+' rows="'+rows+'" maxlength="1600" placeholder="'+e(placeholder)+'">'+e(value||'')+'</textarea></div>';
const select=(key,label,value,options,attrs='')=>'<label class="idea-select" for="idea-'+e(key)+'"><span>'+e(label)+'</span><select class="field" id="idea-'+e(key)+'" '+attrs+'>'+options.map(([v,t])=>'<option value="'+e(v)+'"'+(value===v?' selected':'')+'>'+e(t)+'</option>').join('')+'</select></label>';
function controls(state){
 const s=ideaState(state);
 return '<div class="idea-toolbar">'+button('own','Use my own idea instead')+button('compare','Compare saved ideas ('+s.shortlist.length+'/3)')+'</div>';
}

const mapAction=(act,label,attrs='',css='')=>'<button type="button" class="'+css+'" data-action="idea-'+act+'" '+attrs+'>'+label+'</button>';
const mapRoot=(r,selected)=>mapAction('map-root',
 '<span class="idea-map-root-icon">'+icon(r.icon)+'</span><strong>'+e(r.label)+'</strong><small>'+e(r.description)+'</small>'+
 '<span class="idea-map-root-arrow" aria-hidden="true">'+icon('chevron-right')+'</span>',
 'id="idea-map-root-'+e(r.id)+'" data-root="'+e(r.id)+'" aria-pressed="'+selected+'"',
 'idea-map-root idea-map-root-'+e(r.id)+(selected?' selected':''));
function ideaMapBranchesView(state){
 const s=ideaState(state),m=s.map,root=ideaMapRoot(m.mode,m.root);
 if(!root)return '<p class="idea-map-first-prompt">Choose one of the floating branches to see where it can lead.</p>';
 const topic=ideaMapTopics(root).find(t=>t.id===m.topic);
 const branch=ideaMapBranches(root).find(x=>x.id===m.dataBranch);
 const nodes=m.mode==='interests'?ideaMapTopics(root).map(t=>mapAction('map-topic',
  '<span>'+e(t.label)+'</span>'+icon('chevron-right'),
  'id="idea-map-topic-'+e(t.id)+'" data-topic="'+e(t.id)+'" aria-pressed="'+(topic?.id===t.id)+'"',
  'idea-map-branch-node'+(topic?.id===t.id?' selected':''))).join(''):
  ideaMapBranches(root).map(x=>mapAction('map-access',
  '<strong>'+e(x.label)+'</strong><small>'+e(x.desc)+'</small>'+icon('chevron-right'),
  'id="idea-map-access-'+e(x.id)+'" data-branch="'+e(x.id)+'" aria-pressed="'+(branch?.id===x.id)+'"',
  'idea-map-branch-node idea-map-access-node'+(branch?.id===x.id?' selected':''))).join('');
 const subtopics=topic?'<div class="idea-map-grow idea-map-leaf-grow"><div class="idea-map-branch-caption"><span>2 · Choose a smaller detail</span><small>Tap a branch to grow it.</small></div>'+
  '<div class="idea-map-subtopic-list">'+topic.subtopics.map((name,i)=>mapAction('map-leaf',
  e(name)+icon('chevron-right'),
  'id="idea-map-leaf-'+i+'" data-subtopic="'+e(name)+'" aria-pressed="'+(m.subtopic===name)+'"',
  'idea-map-subtopic'+(m.subtopic===name?' selected':''))).join('')+'</div></div>':'';
 const selectedSubtopic=m.mode==='interests'&&m.subtopic;
 const selectedData=m.mode==='data'&&branch;
 const ideas=selectedSubtopic||selectedData?ideaMapIdeas(m):[];
 const directions=(selectedSubtopic||selectedData)?'<div class="idea-map-grow idea-map-directions">'+
  '<div class="idea-map-branch-caption"><span>'+((m.mode==='interests')?'3':'2')+' · Grow it into your own idea</span>'+
  '<small>These are directions to develop, not completed IA titles.</small></div>'+
  (branch?.warning?'<p class="idea-map-survey-warning">'+icon('info')+' '+e(branch.warning)+'</p>':'')+
  '<div class="idea-map-direction-list" id="idea-map-directions-heading" tabindex="-1">'+ideas.map(seed=>
   '<article class="idea-map-direction" data-idea-card="'+e(seed.id)+'">'+
    '<div class="idea-map-direction-icon">'+icon('compass')+'</div>'+
    '<div class="idea-map-direction-content"><h4>'+e(seed.title)+'</h4>'+
    '<p><strong>Your missing detail:</strong> '+e(seed.narrow)+'</p>'+
    '<p class="idea-map-first-test">'+icon('clock')+' A small first try: '+e(seed.first)+'</p>'+
    '<div class="idea-map-direction-action">'+
    mapAction('explore','Make this idea mine '+icon('arrow-right'),
      'data-seed="'+e(seed.id)+'" data-map="true"','idea-map-customise')+'</div></div></article>').join('')+'</div>'+
  '<p class="idea-map-draft-note">You provide the specifics. Nothing here automatically selects a title, dataset or technique.</p></div>':'';
 return '<div class="idea-map-growth" aria-live="polite">'+
  '<div class="idea-map-path">'+icon('route')+' <strong>'+e(root.label)+'</strong>'+
  (topic?'<span>'+icon('chevron-right')+' '+e(topic.label)+'</span>':'')+
  (selectedSubtopic?'<span>'+icon('chevron-right')+' '+e(m.subtopic)+'</span>':'')+
  (branch?'<span>'+icon('chevron-right')+' '+e(branch.label)+'</span>':'')+'</div>'+
  '<div class="idea-map-grow"><div class="idea-map-branch-caption"><span>1 · Follow a branch</span><small>Pick something you can really access.</small></div>'+
  '<div class="idea-map-branch-list">'+nodes+'</div></div>'+subtopics+directions+'</div>';
}
export function ideaExplorerView(state){
 const s=ideaState(state);
 if(s.pending)return ideaConfirmationView(state);
 if(s.active)return ideaDetailView(state);
 const m=s.map||{mode:'interests',root:'',topic:'',subtopic:'',dataBranch:''},roots=ideaMapRoots(m.mode);
 return '<section class="idea-explorer idea-mindmap" aria-label="Explore an IA idea">'+
  '<div class="idea-map-head"><span class="idea-map-overline">'+icon('route')+' IDEA LAB</span>'+
  '<h3 id="idea-map-heading" tabindex="-1">Grow an idea from a starting point</h3>'+
  '<p>Choose a branch, follow what catches your attention, then make the idea yours. You do not need a finished question yet.</p></div>'+
  '<div class="idea-map-mode" role="group" aria-label="Choose how to start exploring ideas">'+
  mapAction('map-mode',icon('layers')+' Start with my world','data-mode="interests" aria-pressed="'+(m.mode==='interests')+'"','idea-map-mode-button'+(m.mode==='interests'?' selected':''))+
  mapAction('map-mode',icon('calculator')+' Start with data I can get','data-mode="data" aria-pressed="'+(m.mode==='data')+'"','idea-map-mode-button'+(m.mode==='data'?' selected':''))+'</div>'+
  '<div class="idea-map-quickstart">'+icon('clock')+' <p><strong>Make a quick start.</strong> '+e(IDEA_DATA_PROMISE)+'</p></div>'+
  '<div class="idea-map-canvas"><div class="idea-map-orbit" aria-label="Three possible starting branches">'+
  '<svg class="idea-map-links" viewBox="0 0 620 240" preserveAspectRatio="none" aria-hidden="true" focusable="false">'+
  '<path d="M310 101 C235 58 215 63 117 65 M310 101 C385 58 405 63 503 65 M310 101 C310 145 310 157 310 198" />'+
  '<circle cx="310" cy="101" r="5"/></svg>'+
  '<div class="idea-map-centre">'+icon('compass')+'<strong>Start with<br>you</strong><small>Find your maths</small></div>'+
  roots.map(root=>mapRoot(root,m.root===root.id)).join('')+'</div>'+
  ideaMapBranchesView(state)+'</div>'+
  '<div class="idea-map-lower"><div class="idea-map-own"><span>'+icon('pencil')+'</span><div><strong>Got something different in mind?</strong>'+
  '<p>You can start with your own observation, even if none of these branches fits.</p></div>'+
  button('own','Shape my own idea')+'</div>'+
  '<div class="idea-map-shortlist">'+button('compare','Compare saved ideas ('+s.shortlist.length+'/3)')+'</div></div>'+
  '<details class="idea-map-theory-warning"><summary>'+icon('info')+' Thinking about a pure mathematical pattern?</summary>'+
  '<p>'+e(IDEA_THEORY_CAUTION)+'</p>'+
  '<p>For most students, a measurable or observable question with available evidence is an easier way to begin.</p></details>'+
  '</section>';
}
export function ideaDetailView(state){
 const s=ideaState(state),seed=currentSeed(state),d=s.drafts[s.active],saved=s.shortlist.find(x=>x.id===d.savedId);
 const fromMap=d.fromMap&&seed.id!=='own';
 return '<section class="idea-explorer idea-detail'+(fromMap?' idea-map-detail':'')+'" data-idea-detail="'+e(seed.id)+'">'+
  '<div class="idea-toolbar">'+button('browse','Back to my idea map')+
  (!fromMap&&seed.id!=='own'?button('angle','Try a different angle'):'')+
  button('compare','Saved ideas ('+s.shortlist.length+'/3)')+'</div>'+
  '<div class="idea-detail-head"><span class="idea-map-overline">'+icon('route')+' MAKE IT YOURS</span>'+
  '<h3 id="idea-detail-heading" tabindex="-1">'+e(seed.title)+'</h3>'+
  '<p>Take this direction somewhere personal and manageable. It is not a finished IA question.</p></div>'+
  (d.focus?'<p class="idea-focus-note"><strong>Your note:</strong> '+e(d.focus)+'</p>':'')+
  (fromMap?'<div class="idea-map-starter"><span>'+icon('lightbulb')+' QUESTION STARTER · NOT A TITLE TO COPY</span>'+
   '<p>'+e(seed.question)+'</p><small>Which real example would you use to make this yours?</small></div>'+
   input('detail','One detail only I can choose: '+seed.narrow,d.detail,{rows:2,placeholder:'A real object, location, measurement, timeframe or comparison I can access'})+
   input('question','My own working investigation question',d.question,{rows:3,placeholder:'Write a question using your specific detail. You can change it later.'})+
   '<div class="idea-map-first-step">'+icon('clock')+' <div><strong>Can you begin this week?</strong>'+
   '<p>'+e(seed.first)+'</p><small>Possible material: '+e(seed.material)+'</small></div></div>':
   '<p class="field-hint">'+(seed.id==='own'?'Write a possible question in your own words. What could you actually measure, count, compare or check?':'This is a suggested direction. Adapt it rather than assuming it is a finished IA title.')+'</p>'+
   input('question','My version of this idea',d.question,{rows:3,placeholder:'What would I like to investigate?'})+
   '<details class="idea-narrow"><summary>Make it more specific (optional)</summary>'+
   input('detail',seed.narrow,d.detail,{placeholder:'A detail for developing the aim'})+'</details>')+
  '<div class="idea-primary-actions">'+button('use','Continue with my question','',true)+
   button('save',saved?'Update saved possibility':'Save as a possibility')+
   (saved?button('save-copy','Save a separate variation'):'')+'</div>'+
  '<p id="idea-save-status" role="status" tabindex="-1" class="field-hint">'+
  (saved?'Your shortlist includes this version. Changes remain a draft until you update it.':
  'Saving a possibility does not replace your current plan. Only Continue with my question does that.')+'</p>'+
  '<details class="idea-trial"><summary>Try a small first step (optional)</summary>'+
  '<p class="idea-small-step">'+e(seed.first)+'</p><p><strong>Starting material:</strong> '+e(seed.material)+'</p>'+
  '<p class="idea-caution">'+e(seed.caution)+'</p>'+
  input('trialNote','What did I actually check? (private note)',d.trialNote,{placeholder:'An honest check, not invented evidence'})+
  select('trialStatus','My judgement so far',d.trialStatus,[['','Not tried / undecided'],['workable','This seems workable'],['adjust','I need to adjust it'],['possible','Keep it as a possibility']],'data-idea-input="trialStatus"')+
  (seed.resources.length?'<div class="idea-resource-links"><p class="field-hint">Guides are optional. Opening a tool does not select a method.</p>'+
   seed.resources.map(id=>'<button type="button" class="btn btn-light" data-action="resource-open" data-resource-id="'+e(id)+'">'+e(resourceLabel(id))+' '+icon('chevron-right')+'</button>').join('')+'</div>':'')+'</details>'+
  '<details class="idea-maths"><summary>Possible mathematics and a useful check</summary>'+
  '<p>'+e(seed.maths)+'</p><p>'+e(seed.caution)+'</p>'+
  '<p class="field-hint">A mathematical connection is not proof of course suitability. Discuss depth and scope with your teacher.</p></details>'+
  (seed.topic==='patterns'?'<p class="idea-map-theory-note">'+icon('info')+' '+e(IDEA_THEORY_CAUTION)+'</p>':'')+
  '</section>';
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
