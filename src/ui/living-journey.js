/** Living Journey: visual progress from honest, pre-existing stage and entry state.
 * No points, grades, streaks, required result counts or inferred document completion.
 */
import {escapeHtml as e,icon} from './primitives.js';
import {insightTrailLines,insightTrailControls,CHAPTER_TRAIL_POINTS} from './insight-network.js';
import {JOURNEY_GROUPS,groupStatus,stageStatus,currentGroup,groupTarget,STATUS_LABELS,chapterRole,planningMilestones,mathematicalPages,mathematicalChapterSummary,chapterProgressCopy,checkingMilestones} from './journey.js';
import {PROGRESS_GROUPS,planningStage} from '../planning/engine.js';
import {mathActionTitle} from './math-constellation.js';

export function planningAnchors(s){return planningMilestones(s);}

export function chapterStats(s,g){
 if(g.id==='plan'){
  const a=planningAnchors(s);
  return {ready:a.filter(x=>x.recorded).length,total:a.length,labels:a.map(x=>x.name),statuses:a.map(x=>x.recorded?'recorded':'empty')};
 }
 if(g.id==='check'){
  const a=checkingMilestones(s);
  return{ready:a.filter(x=>x.status==='complete').length,total:a.length,labels:a.map(x=>x.name),statuses:a.map(x=>x.status)};
 }
 if(g.id==='explore'){
  const pages=mathematicalPages(s);
  if(!pages.length)return{ready:0,total:1,labels:['First mathematics'],statuses:[
   stageStatus(s,'C30')==='needs-review'?'needs-review':stageStatus(s,'C30')==='not-started'?'not-started':'working'
  ]};
  return {ready:pages.filter(p=>p.status==='complete').length,total:pages.length,
   labels:pages.map(p=>p.label),statuses:pages.map(p=>p.status)};
 }
 const stages=g.stages||[];
 const names={C10:'Introduction',C20:'Introduce first mathematics',C60:'Conclusion & next steps',
  C70:'Communication',C80:'Teacher feedback',C90:'Final checks'};
 return {ready:stages.filter(x=>stageStatus(s,x)==='complete').length,total:stages.length,
  labels:stages.map(x=>names[x]||x),statuses:stages.map(x=>stageStatus(s,x))};
}
export function chapterMini(s,g){
 const st=chapterStats(s,g),indexes=st.statuses.map((_,i)=>i),
  bounded=indexes.length>6?[0,...indexes.slice(-5)]:indexes,
  hidden=st.total-bounded.length;
 return '<span class="journey-mini" aria-hidden="true">'+bounded.map(i=>
  '<span class="journey-mini-cell '+e(st.statuses[i])+
   '" title="'+e(st.labels[i])+': '+e(st.statuses[i]==='recorded'?'Saved':
     st.statuses[i]==='empty'?'Not yet saved':STATUS_LABELS[st.statuses[i]]||'Not started')+'"></span>').join('')+
  (hidden?'<span class="journey-mini-overflow" title="'+hidden+' earlier mathematical stages">+'+hidden+'</span>':'')+
  '</span>';
}
export function chapterRibbon(s){
 const active=currentGroup(s);
 return '<nav class="living-ribbon" aria-label="Your five journey chapters">'+
 JOURNEY_GROUPS.map((g,i)=>{
  const status=groupStatus(s,g),label=STATUS_LABELS[status];
  return '<button type="button" data-action="journey-open" data-target="'+e(groupTarget(s,g))+
   '" class="living-ribbon-part '+e(status)+' '+e(g.mode)+(active.id===g.id?' current':'')+'"'+
   (active.id===g.id?' aria-current="step"':'')+
   ' aria-label="'+e('Chapter '+(i+1)+': '+g.name+'. '+chapterRole(g)+'. '+label+'.')+'">'+
   '<span class="living-ribbon-number">'+(status==='complete'?icon('check'):i+1)+'</span>'+
   '<span class="living-ribbon-label">'+e(g.name)+'</span>'+
   chapterJourneyIcon(g)+chapterMini(s,g)+'<span class="visually-hidden">'+e(label)+'. '+e(chapterProgressCopy(s,g))+'</span></button>';
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
/** A responsive companion to the five-chapter Discovery Trail for Planning screens.
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
  N01:'Worked on the title and question',N01V:'Considered my motivation',N02M:'Explored course and mathematics',
  N02:'Chose an investigation direction',N02U:'Explored mathematical routes',N02T:'Prepared a teacher conversation',
  N03:'Chose a starting-material route',N03B:'Planned two evidence routes',
  N03P:'Planned collection and accuracy',N03P2:'Considered sampling and readiness',N03S:'Planned secondary evidence',N03D:'Checked availability, permissions and access',
  N04:'Reviewed mathematical suitability',N04S:'Considered possible mathematics',
  N01P:'Considered an early prediction',N06:'Reviewed a provisional plan'
 };
 const activeNode=s?.planning?.current||'N00';
 const currentLabels={
  N00:'Choose a starting point',N00B:'Find a promising idea',N00C:'Compare your ideas',
  N01:'Give your idea a working title',N01V:'Have a clear motivation',N02M:'Choose possible mathematics',
  N02:'Choose an investigation type',N02U:'Explore types',N02T:'Prepare a teacher discussion',
  N03:'Choose starting material',N03P:'What and how will I collect?',N03P2:'How will I sample?',N03D:'Can I get started?',N04:'Consider the maths',N01P:'An early expectation (optional)',
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
  'M29 185 C53 213 5 243 29 259',
  'M29 259 C53 286 5 310 29 333'
 ];
 const chapterButtons='<div class="planning-trail-chapters">'+
  '<div class="planning-trail-zone-underlay" aria-hidden="true"><span class="plan"></span><span class="writing"></span><span class="checking"></span></div>'+
  '<svg viewBox="0 0 64 375" preserveAspectRatio="none" class="planning-trail-roadmap" aria-hidden="true" focusable="false">'+
  pathSegments.map((d,i)=>'<path d="'+d+'" class="living-trail-road '+(i===0?'plan-to-writing':i===chapters.length-2?'writing-to-checking':'writing')+'"/>'+
   (chapters[i].status==='complete'?'<path d="'+d+'" class="living-trail-done"/>':'')).join('')+
  '</svg>'+
  chapters.map(({g,status},i)=>{
   const current=g.id==='plan',label=current&&status==='not-started'?'Getting started':STATUS_LABELS[status];
   const phase=i===0?'<span class="planning-trail-phase-label plan">'+icon('compass')+' Plan</span>':
    i===1?'<span class="planning-trail-phase-label writing">'+icon('pencil')+' Write your IA</span>':
    i===4?'<span class="planning-trail-phase-label checking">'+icon('clipboard')+' Checking</span>':'';
   return '<button type="button" class="planning-trail-chapter '+e(status)+(current?' current':'')+
    ' '+e(g.mode)+'" data-action="journey-open" data-target="'+e(groupTarget(s,g))+'"'+
    (current?' aria-current="step"':'')+' aria-label="'+e('Chapter '+(i+1)+': '+g.name+', '+chapterRole(g)+', '+label)+'">'+
    '<span class="planning-trail-point">'+(status==='complete'?icon('check'):i+1)+'</span>'+
    '<span class="planning-trail-chapter-copy">'+phase+
    '<span class="planning-trail-chapter-name">'+chapterJourneyIcon(g)+'<strong>'+e(g.name)+'</strong></span>'+
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
  '<details class="planning-trail-checkpoints"><summary>See planning checkpoints '+icon('chevron-right')+'</summary>'+
  '<ol>'+anchors.map(x=>'<li class="'+(x.recorded?'recorded':'waiting')+'">'+
   '<span>'+icon(x.recorded?'check':'circle')+'</span><span>'+e(x.name)+'</span></li>').join('')+
  '</ol></details>'+
  '<p class="planning-trail-honesty">These are provisional decisions, not IA marks or completed mathematics.</p></div>';
 const full='<div class="planning-trail-card"><div class="planning-trail-heading">'+
  '<span class="section-eyebrow">'+icon('route')+' DISCOVERY TRAIL</span>'+
  '<h2>Your mathematical journey</h2><p>Plan in Chapter 1. Build your actual IA in Chapters 2–4, then check it in Chapter 5.</p></div>'+
  chapterButtons+milestones+'</div>';
 return '<aside class="planning-learning-trail" aria-label="Your learning trail">'+
  '<div class="planning-trail-desktop">'+full+'</div>'+
  '<details class="planning-trail-compact"><summary>'+
  '<span class="planning-trail-compact-text">'+
  '<strong>'+icon('route')+' Your learning trail</strong>'+
  '<small>Planning · '+e(stage.label)+' (phase '+(stageIndex+1)+' of '+PROGRESS_GROUPS.length+')</small>'+
  '</span><span class="planning-trail-compact-end">'+stageTrack+
  '<small>'+stepsCompleted+' screens · '+recorded+'/'+anchors.length+' decisions</small></span>'+icon('chevron-right')+
  '</summary><div class="planning-trail-compact-body">'+full+'</div></details>'+
  (support?'<section class="planning-trail-support" aria-label="Help and examples for this screen">'+
    '<button class="planning-trail-help-toggle" type="button" data-action="planning-help-toggle" aria-expanded="false" aria-controls="planning-trail-support-body">'+
    icon('lightbulb')+' Help & examples '+icon('chevron-right')+'</button>'+
    '<div class="planning-trail-support-body" id="planning-trail-support-body">'+support+'</div></section>':'')+
  '</aside>';
}

const chapterJourneyIcon=g=>'<span class="chapter-journey-icon" aria-hidden="true">'+icon(g.icon)+'</span>';
// The markers use real CSS circles so they remain round at any screen width.
// The SVG contains only the scalable connecting paths and optional spark links.
const coordinates=JOURNEY_GROUPS.map(g=>CHAPTER_TRAIL_POINTS[g.id]);
const curves=coordinates.slice(0,-1).map((p,i)=>{
 const q=coordinates[i+1],middle=(p.x+q.x)/2;
 return 'M'+p.x+' '+p.y+' C'+middle+' '+p.y+' '+middle+' '+q.y+' '+q.x+' '+q.y;
});
/** A mathematical-stage loop nested inside the five-chapter map, not a
 * fixed number of techniques or a claim that a diagram proves a result. */
export function discoveryMathStages(s){
 const {pages,actualResults,pending,review}=mathematicalChapterSummary(s);
 if(!pages.length)return '';
 const shown=pages.length>6?[pages[0],...pages.slice(-5)]:pages;
 const rest=pages.length>6?pages.slice(1,-5):[];
 const card=p=>{
  const description=p.status==='complete'?'Actual result recorded':
   p.status==='needs-review'?'Connection needs checking':'Planned or still being worked on';
  const action=mathActionTitle(s,p.entry);
  return '<button type="button" class="living-trail-math-page '+e(p.status)+
   '" data-action="completion-edit-entry" data-index="'+p.index+
   '" title="'+e(action)+'" aria-label="Open '+e(p.label)+': '+e(action)+'. '+description+'">'+
   icon(p.status==='complete'?'check-circle':p.status==='needs-review'?'alert-circle':'circle')+
   '<span>'+e(p.label)+' · '+e(action)+'</span></button>';
 };
 return '<section class="living-trail-math-loop" aria-label="Mathematical stages recorded in this investigation">'+
  '<div class="living-trail-math-loop-heading"><span>'+icon('refresh')+
   ' MATHEMATICS CAN LOOP</span><small>'+pages.length+' '+(pages.length===1?'stage':'stages')+
   ' · '+actualResults+' actual '+(actualResults===1?'result':'results')+
   (pending?' · '+pending+' in progress':'')+(review?' · '+review+' to review':'')+'</small></div>'+
  '<div class="living-trail-math-pages">'+
   (shown.length?card(shown[0]):'')+
   (rest.length?'<details class="living-trail-math-more"><summary>+'+rest.length+
    ' earlier '+(rest.length===1?'stage':'stages')+' '+icon('chevron-right')+'</summary>'+
    '<div class="living-trail-math-more-pages">'+rest.map(card).join('')+'</div></details>':'')+
   shown.slice(1).map(card).join('')+
  '</div>'+
  '<p class="living-trail-math-footnote">Each page connects to an earlier finding. These markers reflect saved working records, not an IA grade or a required number of calculations.</p>'+
 '</section>';
}
export function discoveryTrail(s,{compact=false}={}){
 const now=currentGroup(s);
 const stages=JOURNEY_GROUPS.map(g=>({g,status:groupStatus(s,g)}));
 return '<section class="living-trail '+(compact?'is-compact':'')+'" aria-label="Discovery Trail">'+
  '<div class="living-trail-top"><div><span class="section-eyebrow">'+icon('route')+
  ' DISCOVERY TRAIL</span><h3>Follow your mathematical journey</h3>'+
  '<p class="living-trail-purpose">Five chapters across Plan, Write your IA and Checking, with as many meaningful mathematical stages as your investigation needs.</p></div></div>'+
  '<div class="living-trail-route" role="group" aria-label="Chapter 1 is planning, Chapters 2 to 4 are writing, and Chapter 5 is checking.">'+
   '<div class="living-trail-zone-underlay" aria-hidden="true"><span class="plan"></span><span class="writing"></span><span class="checking"></span></div>'+
   '<div class="living-trail-zone-headings">'+
    '<div class="living-trail-zone-title plan">'+icon('compass')+'<div><strong>Plan</strong><small>Explore your idea</small></div></div>'+
    '<div class="living-trail-zone-title writing">'+icon('pencil')+'<div><strong>Write your IA</strong><small>Build your actual mathematical exploration</small></div></div>'+
    '<div class="living-trail-zone-title checking">'+icon('clipboard')+'<div><strong>Checking</strong><small>Read, revise and verify</small></div></div>'+
   '</div>'+
   '<div class="living-trail-path" aria-hidden="true">'+
   '<svg class="living-trail-svg" viewBox="0 0 1000 155" preserveAspectRatio="none" focusable="false">'+
    insightTrailLines(s)+
    curves.map((path,i)=>'<path d="'+path+'" class="living-trail-road '+(i===0?'plan-to-writing':i===stages.length-2?'writing-to-checking':'writing')+'"/>'+
     (stages[i].status==='complete'?'<path d="'+path+'" class="living-trail-done"/>':'')).join('')+
    '<path d="M305 25 v7 M301 29 h8 M710 137 v7 M706 141 h8" class="living-trail-star"/>'+
   '</svg>'+
   coordinates.map((p,i)=>{
    const x=stages[i],current=now.id===x.g.id;
    return '<span class="living-trail-node living-trail-marker '+e(x.status)+' '+e(x.g.mode)+(current?' is-current':'')+
     '" style="left:'+(p.x/10)+'%;top:'+p.y+'px">'+
     (current?'<span class="living-trail-focus"></span>':'')+
     '<span class="living-trail-circle">'+(x.status==='complete'?icon('check'):(i+1))+'</span></span>';
   }).join('')+'</div>'+
   '<div class="living-trail-steps">'+stages.map(({g,status},i)=>
    '<button type="button" class="living-trail-step '+e(status)+(now.id===g.id?' current':'')+
    ' '+e(g.mode)+'" data-action="journey-open" data-target="'+e(groupTarget(s,g))+
    '" aria-label="'+e('Chapter '+(i+1)+': '+g.name+'. '+(g.mode==='planning'?'Plan your exploration.':g.mode==='checking'?'Check the IA you wrote.':'Write in your IA.')+' '+STATUS_LABELS[status]+'. '+chapterProgressCopy(s,g))+'.">'+
    chapterJourneyIcon(g)+'<span class="living-trail-step-order" aria-hidden="true">'+(status==='complete'?icon('check'):i+1)+'</span>'+
    '<strong>'+e(g.name)+'</strong><small>'+e(STATUS_LABELS[status])+'</small>'+
    '<span class="living-trail-step-detail">'+e(chapterProgressCopy(s,g))+'</span>'+
    chapterMini(s,g)+'</button>').join('')+'</div>'+
  '</div>'+
  discoveryMathStages(s)+
  '<details class="living-trail-chapter-guide" data-trail-chapter-guide>'+
   '<summary>'+icon('book')+' What do the five chapters include? '+icon('chevron-right')+'</summary>'+
   '<div class="living-trail-chapter-guide-grid">'+
    '<div><strong>1 · Planning</strong><p>Develop a worthwhile aim, explore mathematical pathways, choose primary, secondary or theoretical starting material, and plan sampling, permissions, sources and precision where relevant. Save useful ideas as sparks.</p></div>'+
    '<div><strong>2 · Start writing</strong><p>Write your introduction, connect it to the investigation aim, and justify the first mathematics and evidence you intend to use. Writing belongs in your own IA.</p></div>'+
    '<div><strong>3 · Explore &amp; explain</strong><p>Show real calculations or well-presented diagrams and tables, interpret results, reflect on meaningful limitations, and add further linked mathematical stages when they help answer the aim.</p></div>'+
    '<div><strong>4 · Conclude &amp; next steps</strong><p>Answer your aim from actual mathematics, explain what it means and its important limitations, and consider worthwhile potential mathematical questions.</p></div>'+
    '<div><strong>5 · Check your IA</strong><p>Inspect your actual written IA against Presentation (A), Mathematical communication (B), Personal engagement (C), Reflection (D) and Use of mathematics (E). Revisit teacher-draft checks, record permitted feedback and verify the final file.</p></div>'+
   '</div><p class="living-trail-chapter-guide-note">Sparks, worked examples, diagram generators and criteria help you along the way; they are not compulsory extra stages or automatic marks. A saved figure is not proof that the mathematics has been completed.</p>'+
  '</details>'+
  insightTrailControls(s)+'<p class="living-trail-note">Mint is for planning; purple is for writing your IA; blue is for checking the actual file. A recorded plan is not completed mathematics. All chapters and mathematical stages stay revisitable.</p></section>';
}
// One presentation model is shared by Home and My Path.
export {mathConstellation} from './math-constellation.js';
