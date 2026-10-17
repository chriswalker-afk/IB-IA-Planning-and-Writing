import {IDEA_TOPICS,IDEA_CHECKS,IDEA_DIFFICULTIES,IDEA_RATING_LABELS,seedById,topicById,OWN_PROMPT} from './catalog.js';
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
const mapAttrs=(id,parent)=>' data-idea-node="'+e(id)+'" data-idea-parent="'+e(parent)+'"';
const leafId=(topic,i)=>'leaf-'+topic+'-'+i;
const mapRoot=(r,selected)=>mapAction('map-root',
 '<span class="idea-map-root-icon">'+icon(r.icon)+'</span><strong>'+e(r.label)+'</strong><small>'+e(r.description)+'</small>'+
 '<span class="idea-map-root-arrow" aria-hidden="true">'+icon('chevron-right')+'</span>',
 'id="idea-map-root-'+e(r.id)+'" data-root="'+e(r.id)+'" aria-pressed="'+selected+'"'+mapAttrs('root-'+r.id,'hub'),
 'idea-map-root idea-map-root-'+e(r.id)+(selected?' selected':''));
function ideaMapBranchesView(state){
 const m=ideaState(state).map,root=ideaMapRoot(m.mode,m.root);
 if(!root)return '';
 const topic=ideaMapTopics(root).find(x=>x.id===m.topic);
 const access=ideaMapBranches(root).find(x=>x.id===m.dataBranch);
 const topTier=m.mode==='interests'?
  ideaMapTopics(root).map(x=>mapAction('map-topic',
    '<span class="idea-map-node-icon">'+icon('layers')+'</span><strong>'+e(x.label)+'</strong>'+
    '<span class="idea-map-node-arrow">'+icon('chevron-right')+'</span>',
    'id="idea-map-topic-'+e(x.id)+'" data-topic="'+e(x.id)+'" aria-pressed="'+(topic?.id===x.id)+'"'+mapAttrs('topic-'+x.id,'root-'+root.id),
    'idea-map-branch-node'+(topic?.id===x.id?' selected':''))).join(''):
  ideaMapBranches(root).map(x=>mapAction('map-access',
    '<span class="idea-map-node-icon">'+icon('calculator')+'</span><strong>'+e(x.label)+'</strong><small>'+e(x.desc)+'</small>'+
    '<span class="idea-map-node-arrow">'+icon('chevron-right')+'</span>',
    'id="idea-map-access-'+e(x.id)+'" data-branch="'+e(x.id)+'" aria-pressed="'+(access?.id===x.id)+'"'+mapAttrs('access-'+x.id,'root-'+root.id),
    'idea-map-branch-node idea-map-access-node'+(access?.id===x.id?' selected':''))).join('');
 const tierTwo='<div class="idea-map-tier idea-map-topics" data-idea-map-level="1" aria-label="'+
  (m.mode==='interests'?'Branches from '+e(root.label):'Ways to obtain starting material')+'">'+topTier+'</div>';
 const subtopicTier=topic?'<div class="idea-map-tier idea-map-leaves" data-idea-map-level="2" aria-label="Details branching from '+e(topic.label)+'">'+
  topic.subtopics.map((name,i)=>mapAction('map-leaf',
   '<span class="idea-map-node-icon">'+icon('compass')+'</span><strong>'+e(name)+'</strong>'+
   '<span class="idea-map-node-arrow">'+icon('chevron-right')+'</span>',
   'id="idea-map-leaf-'+i+'" data-subtopic="'+e(name)+'" aria-pressed="'+(m.subtopic===name)+'"'+mapAttrs(leafId(topic.id,i),'topic-'+topic.id),
   'idea-map-subtopic'+(m.subtopic===name?' selected':''))).join('')+'</div>':'';
 const activeParent=topic&&m.subtopic?leafId(topic.id,topic.subtopics.indexOf(m.subtopic)):
  access?'access-'+access.id:'';
 const ideas=activeParent?ideaMapIdeas(m):[];
 const directionTier=activeParent?'<div class="idea-map-tier idea-map-seeds" id="idea-map-directions-heading" tabindex="-1" data-idea-map-level="3" aria-label="Directions growing from the chosen detail">'+
  ideas.map(seed=>mapAction('explore',
    '<span class="idea-map-direction-icon">'+icon('lightbulb')+'</span>'+
    '<span class="idea-map-direction-content"><strong class="idea-map-direction-title">'+e(seed.title)+'</strong>'+
    '<span class="idea-map-personal"><b>Make it personal</b><span>'+e(seed.narrow)+'</span></span>'+
    '<span class="idea-map-first-test">'+icon('clock')+' First try: '+e(seed.first)+'</span>'+
    '<span class="idea-map-customise">Shape my idea '+icon('arrow-right')+'</span></span>',
    'data-seed="'+e(seed.id)+'" data-map="true" data-idea-card="'+e(seed.id)+'"'+mapAttrs('seed-'+seed.id,activeParent),
    'idea-map-direction-node')).join('')+'</div>':'';
 const warning=access?.warning?'<p class="idea-map-survey-warning" role="note">'+icon('info')+' '+e(access.warning)+'</p>':'';
 const selected=m.mode==='data'?access?.label:m.subtopic||topic?.label||root.label;
 return tierTwo+subtopicTier+directionTier+warning+
  '<p class="idea-map-branch-hint" role="status" aria-live="polite">'+
  (ideas.length?'You have reached some possible directions from '+e(selected)+
    '. Add your own detail to turn one into your question.':
   'The new nodes are connected to '+e(selected)+'. Choose another node to grow the map.')+'</p>';
}
export function ideaExplorerView(state){
 const s=ideaState(state);
 if(s.pending)return ideaConfirmationView(state);
 if(s.active)return ideaDetailView(state);
 const m=s.map||{mode:'interests',root:'',topic:'',subtopic:'',dataBranch:''},roots=ideaMapRoots(m.mode);
 return '<section class="idea-explorer idea-mindmap" aria-label="Explore an IA idea">'+
  '<div class="idea-map-head"><span class="idea-map-overline">'+icon('route')+' IDEA LAB</span>'+
  '<h3 id="idea-map-heading" tabindex="-1">Grow an idea from a starting point</h3>'+
  '<p>Tap a bubble to make connected branches appear. Follow the branches that interest you, then make the idea your own.</p></div>'+
  '<div class="idea-map-mode" role="group" aria-label="Choose how to start exploring ideas">'+
  mapAction('map-mode',icon('layers')+' Start with my world','data-mode="interests" aria-pressed="'+(m.mode==='interests')+'"','idea-map-mode-button'+(m.mode==='interests'?' selected':''))+
  mapAction('map-mode',icon('calculator')+' Start with data I can get','data-mode="data" aria-pressed="'+(m.mode==='data')+'"','idea-map-mode-button'+(m.mode==='data'?' selected':''))+'</div>'+
  '<div class="idea-map-quickstart">'+icon('clock')+' <p><strong>Make a quick start.</strong> '+e(IDEA_DATA_PROMISE)+'</p></div>'+
  '<div class="idea-map-network" data-idea-map-network>'+
  '<svg class="idea-map-connectors" data-idea-map-connectors aria-hidden="true" focusable="false"></svg>'+
  '<div class="idea-map-tier idea-map-hub-tier"><div class="idea-map-centre" data-idea-node="hub">'+
  icon('compass')+'<strong>Start with you</strong><small>Find your maths</small></div></div>'+
  '<div class="idea-map-tier idea-map-roots" aria-label="Three possible starting points">'+
  roots.map(root=>mapRoot(root,m.root===root.id)).join('')+'</div>'+
  ideaMapBranchesView(state)+
  (!m.root?'<p class="idea-map-first-prompt" aria-live="polite">Choose one of the three bubbles to grow your mind map.</p>':'')+
  '</div>'+
  '<p class="idea-map-draft-note">These are paths to explore, not finished IA titles. You decide the question, starting material and mathematics.</p>'+
  '<div class="idea-map-lower"><div class="idea-map-own"><span>'+icon('pencil')+'</span><div><strong>Got something different in mind?</strong>'+
  '<p>Start with a real observation even if none of the branches fits.</p></div>'+
  button('own','Shape my own idea')+'</div>'+
  '<div class="idea-map-shortlist">'+button('compare','Compare saved ideas ('+s.shortlist.length+'/3)')+'</div></div>'+
  '<details class="idea-map-theory-warning"><summary>'+icon('info')+' Thinking about a pure mathematical pattern?</summary>'+
  '<p>'+e(IDEA_THEORY_CAUTION)+'</p>'+
  '<p>For most students, an observable question with accessible evidence is an easier way to begin.</p></details>'+
  '</section>';
}
const ratingScale=(field,title,value)=>'<div class="idea-evaluation-scale">'+
 '<div class="idea-scale-head"><strong>'+e(title)+'</strong><span aria-live="polite">'+
  e(IDEA_RATING_LABELS[field][value]||'Not rated yet')+'</span></div>'+
 '<div class="idea-rating-buttons" role="group" aria-label="'+e(title)+', from one to five">'+
 Array.from({length:5},(_,i)=>{const n=i+1;return '<button type="button" id="idea-'+field+'-'+n+
  '" class="idea-rating-point'+(value===n?' selected':'')+
  '" data-action="idea-rate" data-field="'+field+'" data-value="'+n+'" aria-pressed="'+(value===n)+'" '+
  'aria-label="'+n+' out of 5: '+e(IDEA_RATING_LABELS[field][n])+'">'+n+'</button>';}).join('')+'</div>'+
 '<div class="idea-scale-ends"><span>'+e(field==='clarity'?'Vague':'Difficult to start')+
 '</span><span>'+e(field==='clarity'?'Clear and focused':'Can start now')+'</span></div></div>';
const difficultiesView=d=>'<fieldset class="idea-evaluation-difficulties"><legend>What might make this difficult?</legend>'+
 '<p>Tick anything that concerns you. These are possible obstacles, not confirmed limitations.</p>'+
 '<div class="idea-difficulty-grid">'+IDEA_DIFFICULTIES.map(x=>'<label class="idea-difficulty-option">'+
  '<input type="checkbox" data-idea-difficulty="'+e(x.id)+'"'+(d.difficulties.includes(x.id)?' checked':'')+'>'+
  '<span>'+e(x.label)+'</span></label>').join('')+'</div>'+
 '<p class="field-hint">Nothing to tick? That is fine. You can review these later.</p></fieldset>';

export function ideaDetailView(state){
 const s=ideaState(state),seed=currentSeed(state),d=s.drafts[s.active];
 if(!d)return '';
 const saved=s.shortlist.find(x=>x.id===d.savedId),fromMap=d.fromMap&&seed.id!=='own';
 const back=s.editorReturn==='N00C'?'Back to my possible ideas':'Back to my mind map';
 return '<section class="idea-explorer idea-evaluation" aria-label="Shape and evaluate an idea" data-idea-detail="'+e(seed.id)+'">'+
  '<div class="idea-toolbar">'+button('browse',back)+
   '<span class="idea-evaluation-progress">IDEA LAB · SHAPE & EVALUATE</span></div>'+
  '<h3 id="idea-detail-heading" tabindex="-1">'+(seed.id==='own'?'Add an idea of my own':'Make this idea yours')+'</h3>'+
  '<p class="idea-evaluation-intro">Your question can change. You are deciding whether this could be a manageable starting point, not proving it will earn a particular mark.</p>'+
  (fromMap?'<div class="idea-map-starter"><span>'+icon('lightbulb')+' Something to get you thinking</span>'+
   '<p>'+e(seed.question)+'</p><small>You can use this prompt, change it, or ignore it entirely.</small></div>':'')+
  '<div class="idea-evaluation-aim"><p>Either using the thinking prompt or otherwise, write your own possible aim here.</p>'+
  input('question','Your possible investigation aim',d.question,{rows:3,placeholder:'I would like to investigate…'})+'</div>'+
  '<div class="idea-evaluation-ratings"><h4>How promising does this idea feel?</h4>'+
   '<p>Rate it for yourself. These scales are planning reflections, not IA marks or a mathematical suitability check.</p>'+
   ratingScale('clarity','How clear is my aim?',d.clarity)+
   ratingScale('quickStart','How quickly could I get started?',d.quickStart)+'</div>'+
  difficultiesView(d)+
  (seed.topic==='patterns'?'<p class="idea-map-theory-note">'+icon('info')+' '+e(IDEA_THEORY_CAUTION)+'</p>':'')+
  '<div class="idea-primary-actions">'+
   button('save',saved?'Save updated evaluation':'Add to my possible ideas','',true)+'</div>'+
  '<p class="field-hint" id="idea-save-status" tabindex="-1" role="status">'+
  (saved?'Your existing possibility will be updated without changing the current investigation.':
   'Saving adds this idea to your comparison. It will not replace your current investigation aim.')+'</p>'+
  '</section>';
}
const difficultyBadge=id=>IDEA_DIFFICULTIES.find(x=>x.id===id)?.label||'';
const ratingSummary=(field,value,label)=>'<div class="idea-compare-rating"><div class="idea-compare-scoreline">'+
 '<span>'+e(label)+'</span><strong>'+(value?value+' / 5':'Not rated')+'</strong></div>'+
 '<div class="idea-compare-bar" role="img" aria-label="'+e(label)+': '+(value?value+' out of 5':'not rated')+'">'+
 Array.from({length:5},(_,i)=>'<span'+(value>i?' class="active"':'')+'></span>').join('')+'</div></div>';
const compareCard=(d,selected)=>'<article class="idea-card idea-saved idea-comparison-card" data-idea-saved-card="'+e(d.id)+'">'+
 '<div class="idea-compare-card-top"><span class="idea-source-pill">'+icon(d.fromMap?'route':'pencil')+
  (d.fromMap?'From my mind map':'Added by me')+'</span>'+
  (selected?'<span class="idea-selected-indicator">'+icon('check-circle')+' Currently selected</span>':'')+'</div>'+
 '<h4>'+e(d.question)+'</h4>'+
 '<div class="idea-compare-ratings">'+
  ratingSummary('clarity',d.clarity,'Aim clarity')+
  ratingSummary('quickStart',d.quickStart,'Quick start')+'</div>'+
 (d.difficulties.length?'<div class="idea-compare-difficulties"><strong>Possible difficulties</strong>'+
 d.difficulties.map(id=>'<span>'+e(difficultyBadge(id))+'</span>').join('')+'</div>':
 '<p class="idea-no-difficulties">No concerns recorded yet.</p>')+
 (!d.clarity||!d.quickStart?'<p class="idea-old-unrated">This idea was saved before ratings were introduced. Edit and rate it before selecting.</p>':'')+
 '<div class="idea-saved-actions">'+
 button('edit-saved','Edit & rate','data-id="'+e(d.id)+'"')+
 button('remove','Reject idea','data-id="'+e(d.id)+'"')+
 button('use','Select as my idea','data-id="'+e(d.id)+'"',true)+'</div></article>';
export function ideaComparisonView(state){
 const s=ideaState(state);
 if(s.pending)return ideaConfirmationView(state);
 if(s.active)return ideaDetailView(state);
 return '<section class="idea-explorer idea-comparison">'+
  '<div class="idea-compare-intro"><span class="idea-map-overline">'+icon('layers')+' IDEA LAB · COMPARE</span>'+
  '<h3 id="idea-compare-heading" tabindex="-1">Compare them at a glance</h3>'+
  '<p>Look at your judgements side by side. A quick start is useful, but it does not guarantee mathematical depth or IA suitability.</p>'+
  '<span class="idea-compare-count">'+s.shortlist.length+' of '+3+' active ideas</span></div>'+
  '<div class="idea-grid idea-comparison-grid">'+
    (s.shortlist.length?s.shortlist.map(d=>compareCard(d,s.selectedId===d.id)).join(''):
    '<p class="idea-empty">Your comparison is empty. Add a possibility using the mind map or write your own.</p>')+
  '</div>'+
  '<div class="idea-compare-add"><h4>Add another possibility</h4>'+
  '<div class="idea-compare-add-actions">'+button('map-open','Add a possible idea from my mind map')+
    button('own','Add an idea manually')+'</div>'+
   (s.shortlist.length>=3?'<p class="field-hint">You have three active ideas. You can reject one temporarily to make space, then restore it later.</p>':'')+'</div>'+
  (s.rejected?.length?'<details class="idea-rejected"><summary>Rejected ideas ('+s.rejected.length+') · Restore if you change your mind</summary>'+
  '<div class="idea-rejected-list">'+s.rejected.map(d=>'<div class="idea-rejected-item">'+
   '<p>'+e(d.question)+'</p><small>Clarity '+(d.clarity||'?')+'/5 · Quick start '+(d.quickStart||'?')+'/5</small>'+
   button('restore','Restore idea','data-id="'+e(d.id)+'"')+'</div>').join('')+'</div></details>':'')+
  legacyComparison(state)+
  (s.history.length?'<details class="idea-source"><summary>Earlier selected ideas ('+s.history.length+')</summary>'+
   s.history.slice().reverse().map(h=>'<div><p><strong>Earlier topic:</strong> '+e(h.before||'Not recorded')+'</p>'+
    '<p><strong>New aim:</strong> '+e(h.after)+'</p></div>').join('')+'</details>':'')+
  '</section>';
}
export function ideaConfirmationView(state){
 const p=ideaState(state).pending;
 return '<section class="idea-explorer idea-confirm">'+
  '<h3 id="idea-confirm-heading" tabindex="-1">Confirm your new investigation aim</h3>'+
  '<div class="idea-compare-change">'+
  '<div><strong>Your current aim</strong><p>'+e(p.origin.aim||p.origin.projectAim||'Not recorded')+'</p></div>'+
  '<div><strong>Your selected possibility</strong><p>'+e(p.draft.question)+'</p></div></div>'+
  '<p>This will save the selected question as your <strong>provisional investigation aim</strong> and create its reusable aim spark. You can refine it on the next screen.</p>'+
  '<p>Existing mathematics, notes and evidence stay in your project. A changed aim may flag related completed writing for review, rather than erase it. No teacher approval or results are implied.</p>'+
  (state.entries.length?'<p class="idea-caution">You already have mathematical work. Consider discussing a major change of direction with your teacher before proceeding.</p>':'')+
  '<div class="idea-primary-actions">'+button('confirm','Confirm this aim','',true)+button('cancel','Keep my current aim')+'</div></section>';
}
export function ideaFooter(state){
 const s=ideaState(state);
 if(s.pending||s.active)return '';
 const current=state.planning.fields.aim||state.project.aim||state.planning.fields.idea||state.project.idea;
 return '<div class="task-footer idea-footer">'+
  '<button class="btn btn-quiet" type="button" data-action="plan-edit" data-node="N00">Back to starting choices</button>'+
  (current?button('keep','Keep my current aim and continue'):'')+'</div>';
}
function legacyComparison(state){
 const f=state.planning.fields,seen=new Set();
 const rows=[['idea','Current topic'],['originalIdea','First recorded idea'],['otherIdea1','Earlier alternative 1'],['otherIdea2','Earlier alternative 2']].filter(([key])=>{const v=f[key]?.trim();if(!v||seen.has(v))return false;seen.add(v);return true;});
 if(!rows.length&&!f.ideaAccess&&!f.ideaValue)return '';
 return '<details class="idea-legacy"'+(!ideaState(state).shortlist.length?' open':'')+'><summary>My current and earlier typed ideas</summary>'+rows.map(([key,label])=>'<div class="summary-block"><strong>'+e(label)+'</strong><p>'+e(f[key])+'</p>'+button('legacy','Develop this typed idea','data-key="'+key+'"')+'</div>').join('')+
 (f.ideaAccess?'<p><strong>Earlier access note:</strong> '+e(f.ideaAccess)+'</p>':'')+(f.ideaValue?'<p><strong>Earlier interest / manageability note:</strong> '+e(f.ideaValue)+'</p>':'')+'</details>';
}
