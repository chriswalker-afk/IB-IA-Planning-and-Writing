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
