/** Living Journey: visual progress from honest, pre-existing stage and entry state.
 * No points, grades, streaks, required result counts or inferred document completion.
 */
import {escapeHtml as e,icon} from './primitives.js';
import {insightTrailLines,insightTrailControls,CHAPTER_TRAIL_POINTS} from './insight-network.js';
import {JOURNEY_GROUPS,groupStatus,stageStatus,currentGroup,groupTarget,STATUS_LABELS,chapterRole,planningMilestones,mathematicalPages,mathematicalChapterSummary,chapterProgressCopy,checkingMilestones} from './journey.js';
import {PROGRESS_GROUPS,planningStage} from '../planning/engine.js';
import {planningScreenTitle} from '../planning/screen-labels.js';
import {mathActionTitle} from './math-constellation.js';

export function planningAnchors(s){return planningMilestones(s);}
/** Shared chapter identity for the illustrated map, compact ribbon and Planning trail. */
export const DISCOVERY_ZONES=Object.freeze([
 {mode:'planning',label:'Plan',description:'Explore your idea',icon:'compass'},
 {mode:'writing',label:'Write your IA',description:'Build your actual mathematical exploration',icon:'pencil'},
 {mode:'checking',label:'Checking',description:'Read, revise and verify',icon:'clipboard'}
]);
/** All presentations obtain their wording, destinations and status from one model. */
export function discoveryChapters(s){
 const active=currentGroup(s);
 return JOURNEY_GROUPS.map((g,i)=>({
  g,number:i+1,status:groupStatus(s,g),current:active.id===g.id,
  target:groupTarget(s,g),progress:chapterProgressCopy(s,g)
 }));
}

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
 return '<nav class="living-ribbon" aria-label="Discovery Trail: five chapters">'+
  discoveryChapters(s).map(({g,number,status,current,target,progress})=>{
   const label=STATUS_LABELS[status];
   return '<button type="button" data-action="journey-open" data-target="'+e(target)+
    '" class="living-ribbon-part '+e(status)+' '+e(g.mode)+(current?' current':'')+'"'+
    (current?' aria-current="step"':'')+
    ' aria-label="'+e('Chapter '+number+': '+g.name+'. '+chapterRole(g)+'. '+label+'. '+progress)+'">'+
    '<span class="living-ribbon-number">'+(status==='complete'?icon('check'):number)+'</span>'+
    '<span class="living-ribbon-label">'+e(g.name)+'</span>'+
    chapterJourneyIcon(g)+chapterMini(s,g)+'</button>';
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
/** The compact illustrated Planning companion uses the same five chapters as
 * the full trail. Saved anchors are the ONLY progress count: traversing, visiting
 * and revisiting Planning screens does not imply decisions were completed.
 */
export function planningLearningTrail(s,{support=''}={}){
 const anchors=planningAnchors(s),recorded=anchors.filter(x=>x.recorded).length;
 const activeNode=s?.planning?.current||'N00';
 const activeStage=planningStage(activeNode);
 const stageIndex=Math.max(0,PROGRESS_GROUPS.findIndex(x=>x.id===activeStage));
 const stage=PROGRESS_GROUPS[stageIndex];
 const currentTitle=planningScreenTitle(activeNode,s);
 const chapters=discoveryChapters(s);
 const overview='<nav class="planning-trail-overview" aria-label="Discovery Trail chapters">'+
  '<div class="planning-trail-overview-path" aria-hidden="true"></div>'+
  chapters.map(({g,number,status,current,target,progress})=>
   '<button type="button" class="planning-trail-overview-node '+e(g.mode)+' '+e(status)+(current?' current':'')+
   '" data-action="journey-open" data-target="'+e(target)+'"'+
   (current?' aria-current="step"':'')+
   ' aria-label="'+e('Chapter '+number+': '+g.name+'. '+chapterRole(g)+'. '+STATUS_LABELS[status]+'. '+progress)+'"'+
   ' title="'+e('Chapter '+number+': '+g.name)+'">'+
   (status==='complete'?icon('check'):number)+'</button>').join('')+
  '</nav><div class="planning-trail-overview-zones" aria-hidden="true">'+
   DISCOVERY_ZONES.map(z=>'<span class="'+e(z.mode)+'">'+icon(z.icon)+' '+e(z.label)+'</span>').join('')+'</div>';
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
  chapters.map(({g,number,status,current,target})=>{
   const label=current&&status==='not-started'?'Getting started':STATUS_LABELS[status];
   const phase=number===1?'<span class="planning-trail-phase-label plan">'+icon('compass')+' Plan</span>':
    number===2?'<span class="planning-trail-phase-label writing">'+icon('pencil')+' Write your IA</span>':
    number===5?'<span class="planning-trail-phase-label checking">'+icon('clipboard')+' Checking</span>':'';
   return '<button type="button" class="planning-trail-chapter '+e(status)+(current?' current':'')+
    ' '+e(g.mode)+'" data-action="journey-open" data-target="'+e(target)+'"'+
    (current?' aria-current="step"':'')+' aria-label="'+e('Chapter '+number+': '+g.name+', '+chapterRole(g)+', '+label)+'">'+
    '<span class="planning-trail-point">'+(status==='complete'?icon('check'):number)+'</span>'+
    '<span class="planning-trail-chapter-copy">'+phase+
    '<span class="planning-trail-chapter-name">'+chapterJourneyIcon(g)+'<strong>'+e(g.name)+'</strong></span>'+
    '<small>'+e(label)+'</small>'+chapterMini(s,g)+'</span></button>';
  }).join('')+'</div>';
 const stageTrack='<div class="planning-trail-stage-track" role="img" aria-label="'+
  e('Planning route, phase '+(stageIndex+1)+' of '+PROGRESS_GROUPS.length+': '+stage.label)+'">'+
   PROGRESS_GROUPS.map((g,i)=>'<span class="'+(i<stageIndex?'earlier':i===stageIndex?'now':'later')+
    '" title="'+e(g.label)+'"></span>').join('')+'</div>';
 const milestones='<div class="planning-trail-within">'+
  '<div class="planning-trail-within-head"><strong>Right now in Planning</strong>'+
  '<span>Phase '+(stageIndex+1)+' of '+PROGRESS_GROUPS.length+'</span></div>'+
  '<strong class="planning-trail-current-title">'+e(currentTitle)+'</strong>'+
  '<p class="planning-trail-stage-name">'+e(stage.label)+'</p>'+stageTrack+
  '<div class="planning-trail-saved">'+icon('sparkles')+' <strong>'+recorded+' of '+anchors.length+
   ' planning anchors saved</strong></div>'+
  '<div class="planning-trail-anchor-track" role="img" aria-label="'+recorded+' of '+anchors.length+' provisional planning anchors saved">'+
   anchors.map(item=>'<span class="'+(item.recorded?'recorded':'waiting')+'" title="'+e(item.name)+': '+(item.recorded?'saved':'not yet saved')+'"></span>').join('')+'</div>'+
  '<details class="planning-trail-checkpoints"><summary>See my planning anchors '+icon('chevron-right')+'</summary>'+
  '<ol>'+anchors.map(item=>'<li class="'+(item.recorded?'recorded':'waiting')+'">'+
   icon(item.recorded?'check-circle':'circle')+'<span>'+e(item.name)+'</span></li>').join('')+
  '</ol></details>'+
  '<p class="planning-trail-honesty">Planning is provisional: these are saved choices, not IA marks or mathematical results.</p></div>';
 const full='<div class="planning-trail-card"><div class="planning-trail-heading">'+
  '<span class="section-eyebrow">'+icon('route')+' DISCOVERY TRAIL</span>'+
  '<h2>Your mathematical journey</h2><p>Plan first. Write your IA. Check your document.</p></div>'+
  overview+milestones+
  '<details class="planning-trail-map-detail"><summary>'+icon('route')+' Explore all five chapters '+icon('chevron-right')+'</summary>'+
  chapterButtons+'</details></div>';
 return '<aside class="planning-learning-trail" aria-label="Discovery Trail">'+
  '<div class="planning-trail-desktop">'+full+'</div>'+
  '<details class="planning-trail-compact"><summary>'+
  '<span class="planning-trail-compact-text">'+
  '<strong>'+icon('route')+' Discovery Trail</strong>'+
  '<small>Chapter 1 · '+e(currentTitle)+'</small></span>'+
  '<span class="planning-trail-compact-end">'+stageTrack+
  '<small>'+recorded+' of '+anchors.length+' anchors saved</small></span>'+icon('chevron-right')+
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
function discoveryChapterGuide(){
 return '<details class="living-trail-chapter-guide" data-trail-chapter-guide>'+
  '<summary>'+icon('book')+' What do the five chapters include? '+icon('chevron-right')+'</summary>'+
  '<div class="living-trail-chapter-guide-grid">'+
   '<div><strong>1 · Planning</strong><p>Develop a worthwhile aim, explore mathematical pathways, choose primary, secondary or theoretical starting material, and plan sampling, permissions, sources and precision where relevant. Save useful ideas as sparks.</p></div>'+
   '<div><strong>2 · Start writing</strong><p>Write your introduction, connect it to the investigation aim, and justify the first mathematics and evidence you intend to use. Writing belongs in your own IA.</p></div>'+
   '<div><strong>3 · Explore &amp; explain</strong><p>Show real calculations or well-presented diagrams and tables, interpret results, reflect on meaningful limitations, and add further linked mathematical stages when they help answer the aim.</p></div>'+
   '<div><strong>4 · Conclude &amp; next steps</strong><p>Answer your aim from actual mathematics, explain what it means and its important limitations, and consider worthwhile potential mathematical questions.</p></div>'+
   '<div><strong>5 · Check your IA</strong><p>Inspect your actual written IA against Presentation (A), Mathematical communication (B), Personal engagement (C), Reflection (D) and Use of mathematics (E). Revisit teacher-draft checks, record permitted feedback and verify the final file.</p></div>'+
  '</div><p class="living-trail-chapter-guide-note">Sparks, worked examples, diagram generators and criteria help you along the way; they are not compulsory extra stages or automatic marks. A saved figure is not proof that the mathematics has been completed.</p></details>';
}
export function discoveryTrail(s,{compact=false}={}){
 const stages=discoveryChapters(s);
 return '<section class="living-trail '+(compact?'is-compact':'')+'" aria-label="Discovery Trail">'+
  '<div class="living-trail-top"><div><span class="section-eyebrow">'+icon('route')+
   ' DISCOVERY TRAIL</span><h3>Your mathematical journey</h3>'+
   (compact?'':'<p class="living-trail-purpose">Five chapters across Plan, Write your IA and Checking, with as many meaningful mathematical stages as your investigation needs.</p>')+
   '</div>'+(compact?'<button type="button" class="living-trail-view-full" data-nav="path">Full trail '+icon('arrow-right')+'</button>':'')+'</div>'+
  '<div class="living-trail-route" role="group" aria-label="Chapter 1 is planning, Chapters 2 to 4 are writing, and Chapter 5 is checking.">'+
   '<div class="living-trail-zone-underlay" aria-hidden="true"><span class="plan"></span><span class="writing"></span><span class="checking"></span></div>'+
   '<div class="living-trail-zone-headings">'+
    DISCOVERY_ZONES.map(z=>'<div class="living-trail-zone-title '+e(z.mode==='planning'?'plan':z.mode)+'">'+
     icon(z.icon)+'<div><strong>'+e(z.label)+'</strong><small>'+e(z.description)+'</small></div></div>').join('')+
   '</div>'+
   '<div class="living-trail-path" aria-hidden="true">'+
    '<svg class="living-trail-svg" viewBox="0 0 1000 155" preserveAspectRatio="none" focusable="false">'+
     (compact?'':insightTrailLines(s))+
     curves.map((path,i)=>'<path d="'+path+'" class="living-trail-road '+(i===0?'plan-to-writing':i===stages.length-2?'writing-to-checking':'writing')+'"/>'+
      (stages[i].status==='complete'?'<path d="'+path+'" class="living-trail-done"/>':'')).join('')+
     '<path d="M305 25 v7 M301 29 h8 M710 137 v7 M706 141 h8" class="living-trail-star"/>'+
    '</svg>'+
    coordinates.map((p,i)=>{
     const item=stages[i],current=item.current;
     return '<span class="living-trail-node living-trail-marker '+e(item.status)+' '+e(item.g.mode)+(current?' is-current':'')+
      '" style="left:'+(p.x/10)+'%;top:'+p.y+'px">'+
      (current?'<span class="living-trail-focus"></span>':'')+
      '<span class="living-trail-circle">'+(item.status==='complete'?icon('check'):(i+1))+'</span></span>';
    }).join('')+'</div>'+
   '<div class="living-trail-steps">'+stages.map(({g,number,status,current,target,progress})=>
    '<button type="button" class="living-trail-step '+e(status)+(current?' current':'')+
    ' '+e(g.mode)+'" data-action="journey-open" data-target="'+e(target)+'"'+
    (current?' aria-current="step"':'')+
    ' aria-label="'+e('Chapter '+number+': '+g.name+'. '+chapterRole(g)+'. '+STATUS_LABELS[status]+'. '+progress)+'">'+
    chapterJourneyIcon(g)+'<span class="living-trail-step-order" aria-hidden="true">'+(status==='complete'?icon('check'):number)+'</span>'+
    '<strong>'+e(g.name)+'</strong><small>'+e(STATUS_LABELS[status])+'</small>'+
    '<span class="living-trail-step-detail">'+e(progress)+'</span>'+
    chapterMini(s,g)+'</button>').join('')+'</div>'+
  '</div>'+
  discoveryMathStages(s)+
  (compact?'':discoveryChapterGuide()+insightTrailControls(s)+
   '<p class="living-trail-note">Mint is for planning; purple is for writing your IA; blue is for checking the actual file. A recorded plan is not completed mathematics. All chapters and mathematical stages stay revisitable.</p>')+
  '</section>';
}
// One presentation model is shared by Home and My Path.
export {mathConstellation} from './math-constellation.js';
