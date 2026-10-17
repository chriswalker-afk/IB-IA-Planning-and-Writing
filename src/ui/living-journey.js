/** Living Journey: visual progress from honest, pre-existing stage and entry state.
 * No points, grades, streaks, required result counts or inferred document completion.
 */
import {escapeHtml as e,icon} from './primitives.js';
import {insightTrailLines,insightTrailControls} from './insight-network.js';
import {JOURNEY_GROUPS,groupStatus,stageStatus,currentGroup,groupTarget,STATUS_LABELS} from './journey.js';
import {PROGRESS_GROUPS,planningStage} from '../planning/engine.js';

export function planningAnchors(s){
 const p=s?.planning?.fields||{};
 const yes=v=>typeof v==='string'&&!!v.trim();
 return [
  {name:'Working title',recorded:yes(p.provisionalTitle),detail:'A provisional IA title has been saved, not finalised'},
  {name:'My question',recorded:yes(p.aim||s.project?.aim),detail:'An investigation aim is recorded'},
  {name:'Starting material',recorded:yes(p.kind==='theoretical'?(p.theoreticalCase||p.theoreticalObject):(p.dataSource||p.primaryWhat||p.secondaryUrl)),detail:'A proposed evidence or theoretical starting route is recorded'},
  {name:'First mathematics',recorded:yes(p.firstAction||p.figurePurpose),detail:'An intended first mathematical action is recorded'},
  {name:'Review my plan',recorded:s?.planning?.completed===true,detail:'The provisional planning review is marked ready'}
 ];
}
export function chapterStats(s,g){
 if(g.id==='plan'){
  const a=planningAnchors(s);
  return {ready:a.filter(x=>x.recorded).length,total:a.length,labels:a.map(x=>x.name),statuses:a.map(x=>x.recorded?'recorded':'empty')};
 }
 const stages=g.stages||[];
 return {ready:stages.filter(x=>stageStatus(s,x)==='complete').length,total:stages.length,
  labels:stages.map(x=>x),statuses:stages.map(x=>stageStatus(s,x))};
}
export function chapterMini(s,g){
 const st=chapterStats(s,g);
 return '<span class="journey-mini" aria-hidden="true">'+st.statuses.map(x=>
  '<span class="journey-mini-cell '+e(x)+'"></span>').join('')+'</span>';
}
export function chapterRibbon(s){
 const active=currentGroup(s);
 return '<nav class="living-ribbon" aria-label="Your four journey chapters">'+
 JOURNEY_GROUPS.map((g,i)=>{
  const status=groupStatus(s,g),label=STATUS_LABELS[status];
  return '<button type="button" data-action="journey-open" data-target="'+e(groupTarget(s,g))+
   '" class="living-ribbon-part '+e(status)+(active.id===g.id?' current':'')+'"'+
   (active.id===g.id?' aria-current="step"':'')+'>'+
   '<span class="living-ribbon-number">'+(status==='complete'?icon('check'):i+1)+'</span>'+
   '<span class="living-ribbon-label">'+e(g.name)+'</span>'+
   chapterMini(s,g)+'<span class="visually-hidden">'+e(label)+'</span></button>';
 }).join('')+'</nav>';
}
export function planningProgress(s,{compact=false}={}){
 const a=planningAnchors(s),ready=a.filter(x=>x.recorded).length;
 if(compact)return '<div class="planning-sparks-mini" aria-label="'+ready+' of '+a.length+' planning anchors recorded">'+
  '<span>'+icon('sparkles')+' '+ready+' / '+a.length+' planning anchors</span>'+
  '<span class="planning-sparks-mini-bars" aria-hidden="true">'+
  a.map(x=>'<i class="'+(x.recorded?'recorded':'waiting')+'" title="'+e(x.name)+'"></i>').join('')+
  '</span><small>Provisional, not graded</small></div>';
 return '<section class="planning-sparks" aria-label="Planning decisions recorded"><div class="planning-sparks-title">'+
  icon('sparkles')+' <strong>'+ready+' of '+a.length+' planning anchors recorded</strong>'+
  '<span>Little decisions become useful later</span></div><div class="planning-sparks-grid">'+
  a.map((x,i)=>'<span class="planning-spark '+(x.recorded?'recorded':'waiting')+
  '" title="'+e(x.detail)+'"><span class="planning-spark-mark">'+(x.recorded?icon('check'):i+1)+'</span>'+
  '<span>'+e(x.name)+'</span></span>').join('')+
  '</div><p>These are provisional decisions, not a score or completed IA mathematics.</p></section>';
}
/** A responsive companion to the four-chapter Discovery Trail for Planning screens.
 * Chapter readiness and saved planning anchors are derived from existing state;
 * moving through a route alone never implies that its decisions are complete.
 */
export function planningLearningTrail(s,{support=''}={}){
 const anchors=planningAnchors(s),recorded=anchors.filter(x=>x.recorded).length;
 const activeStage=planningStage(s?.planning?.current||'N00');
 const stageIndex=Math.max(0,PROGRESS_GROUPS.findIndex(x=>x.id===activeStage));
 const stage=PROGRESS_GROUPS[stageIndex];
 const screenLabels={
  N00:'Chose a starting route',N00B:'Explored possible ideas',N00C:'Compared possible ideas',
  N01:'Worked on the title and question',N01V:'Considered the purpose',
  N02:'Chose an investigation direction',N02U:'Explored mathematical routes',N02T:'Prepared a teacher conversation',
  N03:'Chose a starting-material route',N03B:'Planned two evidence routes',
  N03P:'Planned primary evidence',N03S:'Planned secondary evidence',
  N04:'Reviewed mathematical suitability',N04S:'Considered possible mathematics',
  N05V:'Planned first mathematics',N06:'Reviewed a provisional plan'
 };
 const activeNode=s?.planning?.current||'N00';
 const currentLabels={
  N00:'Choose a starting point',N00B:'Find a promising idea',N00C:'Compare your ideas',
  N01:'Give your idea a working title',N01V:'Consider what the answer might mean',
  N02:'Choose an investigation type',N02U:'Explore types',N02T:'Prepare a teacher discussion',
  N03:'Choose starting material',N04:'Consider the maths',N05V:'Plan the first move',
  N06:'Review your provisional plan'
 };
 const screensDone=[...new Set(s?.planning?.completedNodes||[])].filter(id=>PROGRESS_GROUPS.some(g=>g.nodes.includes(id)));
 const stepsCompleted=screensDone.length;
 const screenProgress='<div class="planning-trail-screen-progress" aria-label="'+stepsCompleted+
  ' Planning screen'+(stepsCompleted===1?'':'s')+' completed">'+
  '<div class="planning-trail-screen-head"><strong>Every screen counts</strong><span>'+stepsCompleted+
  ' completed</span></div>'+
  '<div class="planning-trail-footsteps" aria-hidden="true">'+
  screensDone.slice(-6).map(() => '<span class="finished">'+icon('check')+'</span>').join('')+
  '<span class="active">'+icon('compass')+'</span></div>'+
  '<div class="planning-trail-recent">'+screensDone.slice(-2).map(id=>
   '<span class="finished">'+icon('check')+' '+e(screenLabels[id]||'Continued through Planning')+'</span>').join('')+
  '<span class="active">'+icon('arrow-right')+' Now: '+e(currentLabels[activeNode]||PROGRESS_GROUPS.find(g=>g.nodes.includes(activeNode))?.label||'Continue Planning')+'</span></div></div>';
 const chapters=JOURNEY_GROUPS.map(g=>({g,status:groupStatus(s,g)}));
 const pathSegments=[
  'M29 37 C53 53 5 94 29 111',
  'M29 111 C53 133 5 165 29 185',
  'M29 185 C53 213 5 243 29 259'
 ];
 const chapterButtons='<div class="planning-trail-chapters">'+
  '<svg viewBox="0 0 64 296" class="planning-trail-roadmap" aria-hidden="true" focusable="false">'+
  pathSegments.map((d,i)=>'<path d="'+d+'" class="living-trail-road"/>'+
   (chapters[i].status==='complete'?'<path d="'+d+'" class="living-trail-done"/>':'')).join('')+
  '</svg>'+
  chapters.map(({g,status},i)=>{
   const current=g.id==='plan',label=current&&status==='not-started'?'Getting started':STATUS_LABELS[status];
   return '<button type="button" class="planning-trail-chapter '+e(status)+(current?' current':'')+
    '" data-action="journey-open" data-target="'+e(groupTarget(s,g))+'"'+
    (current?' aria-current="step"':'')+' aria-label="'+e(g.name+', '+label)+'">'+
    '<span class="planning-trail-point">'+(status==='complete'?icon('check'):i+1)+'</span>'+
    '<span class="planning-trail-chapter-copy"><strong>'+e(g.name)+'</strong>'+
    '<small>'+e(label)+'</small>'+chapterMini(s,g)+'</span></button>';
  }).join('')+'</div>';
 const stageTrack='<div class="planning-trail-stage-track" role="img" aria-label="'+
  e('Planning route, step '+(stageIndex+1)+' of '+PROGRESS_GROUPS.length+': '+stage.label)+'">'+
  PROGRESS_GROUPS.map((g,i)=>'<span class="'+(i<stageIndex?'earlier':i===stageIndex?'now':'later')+
   '" title="'+e(g.label)+'"></span>').join('')+'</div>';
 const milestones='<div class="planning-trail-within">'+
  '<div class="planning-trail-within-head"><strong>Within Planning</strong>'+
  '<span>Phase '+(stageIndex+1)+' of '+PROGRESS_GROUPS.length+'</span></div>'+
  '<p class="planning-trail-stage-name">'+e(stage.label)+'</p>'+stageTrack+screenProgress+
  '<div class="planning-trail-saved">'+icon('sparkles')+' <strong>'+recorded+' of '+anchors.length+
  ' decisions saved</strong></div>'+
  '<details class="planning-trail-checkpoints"><summary>See planning checkpoints '+icon('chevron-down')+'</summary>'+
  '<ol>'+anchors.map(x=>'<li class="'+(x.recorded?'recorded':'waiting')+'">'+
   '<span>'+icon(x.recorded?'check':'circle')+'</span><span>'+e(x.name)+'</span></li>').join('')+
  '</ol></details>'+
  '<p class="planning-trail-honesty">These are provisional decisions, not IA marks or completed mathematics.</p></div>';
 const full='<div class="planning-trail-card"><div class="planning-trail-heading">'+
  '<span class="section-eyebrow">'+icon('route')+' DISCOVERY TRAIL</span>'+
  '<h2>Your mathematical journey</h2><p>One investigation · Four chapters</p></div>'+
  chapterButtons+milestones+'</div>';
 return '<aside class="planning-learning-trail" aria-label="Your learning trail">'+
  '<div class="planning-trail-desktop">'+full+'</div>'+
  '<details class="planning-trail-compact"><summary>'+
  '<span class="planning-trail-compact-text">'+
  '<strong>'+icon('route')+' Your learning trail</strong>'+
  '<small>Planning · '+e(stage.label)+' (phase '+(stageIndex+1)+' of '+PROGRESS_GROUPS.length+')</small>'+
  '</span><span class="planning-trail-compact-end">'+stageTrack+
  '<small>'+stepsCompleted+' screens · '+recorded+'/'+anchors.length+' decisions</small></span>'+icon('chevron-down')+
  '</summary><div class="planning-trail-compact-body">'+full+'</div></details>'+
  (support?'<section class="planning-trail-support" aria-label="Help and examples for this screen">'+
    '<button class="planning-trail-help-toggle" type="button" data-action="planning-help-toggle" aria-expanded="false" aria-controls="planning-trail-support-body">'+
    icon('lightbulb')+' Help & examples '+icon('chevron-down')+'</button>'+
    '<div class="planning-trail-support-body" id="planning-trail-support-body">'+support+'</div></section>':'')+
  '</aside>';
}

const coordinates=[{x:31,y:122},{x:126,y:42},{x:229,y:97},{x:326,y:28}];
const curves=[
 'M31 122 C81 122 77 42 126 42',
 'M126 42 C175 42 175 97 229 97',
 'M229 97 C278 97 277 28 326 28'
];
export function discoveryTrail(s,{compact=false}={}){
 const now=currentGroup(s);
 const stages=JOURNEY_GROUPS.map(g=>({g,status:groupStatus(s,g)}));
 return '<section class="living-trail '+(compact?'is-compact':'')+'" aria-label="Discovery Trail">'+
  '<div class="living-trail-top"><div><span class="section-eyebrow">'+icon('route')+
  ' DISCOVERY TRAIL</span><h3>Follow your mathematical journey</h3></div>'+
  '<span class="living-trail-tag">One investigation · Four chapters</span></div>'+
  '<svg class="living-trail-svg" viewBox="0 0 356 153" aria-hidden="true" focusable="false">'+
  insightTrailLines(s)+
  curves.map((path,i)=>'<path d="'+path+'" class="living-trail-road"/>'+
   (stages[i].status==='complete'?'<path d="'+path+'" class="living-trail-done"/>':'')).join('')+
  coordinates.map((p,i)=>{
   const x=stages[i],current=now.id===x.g.id;
   return '<g class="living-trail-node '+e(x.status)+(current?' is-current':'')+'">'+
    (current?'<circle class="living-trail-focus" cx="'+p.x+'" cy="'+p.y+'" r="19"/>':'')+
    '<circle cx="'+p.x+'" cy="'+p.y+'" r="12" class="living-trail-circle"/>'+
    (x.status==='complete'?'<path d="M'+(p.x-5)+' '+p.y+' l4 4 l7 -8" class="living-trail-check"/>':
      '<text x="'+p.x+'" y="'+(p.y+4)+'" text-anchor="middle" class="living-trail-digit">'+(i+1)+'</text>')+
   '</g>';
  }).join('')+
  '<path d="M97 13 v8 M93 17 h8 M274 141 v8 M270 145 h8" class="living-trail-star"/>'+
  '</svg>'+
  '<div class="living-trail-steps">'+stages.map(({g,status},i)=>
   '<button type="button" class="living-trail-step '+e(status)+(now.id===g.id?' current':'')+
   '" data-action="journey-open" data-target="'+e(groupTarget(s,g))+'">'+
   '<strong>'+e(g.name)+'</strong><small>'+e(STATUS_LABELS[status])+'</small>'+
   chapterMini(s,g)+'</button>').join('')+'</div>'+
  insightTrailControls(s)+'<p class="living-trail-note">Your stages are always revisitable. “Ready for now” is your own checkpoint, not an IA grade.</p></section>';
}
const real=e=>e?.status==='completed'&&typeof e.result==='string'&&!!e.result.trim();
export function mathConstellation(s,{compact=false}={}){
 const entries=Array.isArray(s.entries)?s.entries:[],
  shown=entries.slice(-12),start=entries.length-shown.length,
  positions=shown.map((_,i)=>({x:shown.length===1?178:23+i*310/(shown.length-1),y:77+Math.sin(i*2.21)*31})),
  localIndex=new Map(shown.map((x,i)=>[x.id,i]));
 const lines=shown.map((x,i)=>{
  const parent=localIndex.get(x.fromEntryId);
  if(parent===undefined||parent===i)return'';
  const p=positions[parent],q=positions[i],mid=(p.x+q.x)/2;
  return '<path d="M'+p.x+' '+p.y+' C'+mid+' '+p.y+' '+mid+' '+q.y+' '+q.x+' '+q.y+
   '" class="constellation-link'+(x.reviewNeeded==='yes'?' review':'')+'"/>';
 }).join('');
 const actual=entries.filter(real).length,pending=entries.length-actual;
 return '<section class="math-constellation '+(compact?'is-compact':'')+'" aria-label="Mathematical constellation">'+
  '<div class="math-constellation-top"><div><span class="section-eyebrow">'+icon('chart')+
  ' GROWING CONSTELLATION</span><h3>Your mathematical discoveries</h3></div>'+
  '<span class="math-constellation-count">'+actual+' actual result'+(actual===1?'':'s')+'</span></div>'+
  '<p class="math-constellation-intro">Every genuine result adds a star. Lines appear only where you explicitly connect one mathematical step to another.</p>'+
  (shown.length?
   '<div class="constellation-sky-wrap"><svg viewBox="0 0 356 155" class="math-constellation-svg" aria-hidden="true" focusable="false">'+
   '<path d="M18 126 Q168 14 338 125" class="constellation-horizon"/>'+
   '<circle cx="76" cy="18" r="2" class="constellation-sky"/><circle cx="301" cy="146" r="2.5" class="constellation-sky"/>'+
   lines+shown.map((x,i)=>{
    const p=positions[i],status=x.reviewNeeded==='yes'?'review':real(x)?'actual':'planned';
    return '<g class="constellation-point '+status+'">'+
     (status==='actual'?'<circle class="constellation-halo" cx="'+p.x+'" cy="'+p.y+'" r="13"/>':'')+
     '<circle class="constellation-core" cx="'+p.x+'" cy="'+p.y+'" r="'+(status==='actual'?8:6)+'"/>'+
     (status==='actual'?'<path class="constellation-sparkle" d="M'+p.x+' '+(p.y-16)+' v-6 M'+(p.x-16)+' '+p.y+' h-6"/>':'')+
     '</g>';
   }).join('')+'</svg>'+
   shown.map((x,i)=>{
    const p=positions[i],n=start+i;
    const status=x.reviewNeeded==='yes'?'Needs review':real(x)?'Actual result':'Planned';
    return '<button type="button" class="constellation-star-hit" data-action="completion-edit-entry" data-index="'+n+
     '" style="left:'+(p.x/356*100).toFixed(2)+'%;top:'+(p.y/155*100).toFixed(2)+'%"'+
     ' aria-label="Open '+e(x.title||'mathematical step '+(n+1))+': '+status+'" title="'+e(x.title||'Mathematical step '+(n+1))+'"></button>';
   }).join('')+'</div>'+
   '<div class="constellation-interact"><span>Explore a star</span><span>Choose a mathematical record below to revisit it.</span></div><div class="constellation-key"><span><i class="star-key actual"></i> Actual result</span>'+
   '<span><i class="star-key planned"></i> Planned</span><span><i class="star-key review"></i> Needs review</span></div>'+
   '<div class="constellation-records">'+shown.slice(-6).map(x=>{
    const i=entries.indexOf(x),status=x.reviewNeeded==='yes'?'Needs review':real(x)?'Actual result':'Planned';
    return '<button type="button" class="constellation-record" data-action="completion-edit-entry" data-index="'+i+'">'+
     '<span class="constellation-record-dot '+(real(x)?'actual':'planned')+'"></span><span>'+
     e(x.title||'Mathematical step '+(i+1))+'</span><small>'+status+'</small>'+icon('chevron-right')+'</button>';
   }).join('')+'</div>'+
   (start>0?'<p class="math-constellation-small">Showing your most recent 12 steps; '+start+' earlier record'+(start===1?'':'s')+' remain in your mathematical path.</p>':'')+
   (pending?'<p class="math-constellation-small">'+pending+' planned step'+(pending===1?' is':'s are')+' still waiting for an actual result.</p>':''):
   '<div class="math-constellation-empty">'+icon('sparkles')+
    '<span>Start with a question worth exploring. Your discoveries will appear here as your mathematics develops.</span></div>')+
   '<p class="math-constellation-small">There is no required number of results. A clear, well-justified investigation matters more than the number of stars.</p></section>';
}