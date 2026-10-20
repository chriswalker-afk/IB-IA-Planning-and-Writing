import {escapeHtml as e,icon,button} from './primitives.js';
import {JOURNEY_GROUPS,STATUS_LABELS,stageStatus,groupStatus,currentGroup,groupTarget,resumeLabel,latestCheckpoint,chapterRole,chapterProgressCopy} from './journey.js';
import {C_MAJOR_STAGES} from '../completing/engine.js';
import {chapterMini,discoveryTrail,mathConstellation} from './living-journey.js';
import {insightToolkit,insightThreadMap} from './insight-threads.js';
export function journeyRail(s){
 const active=currentGroup(s);
 const buttons=JOURNEY_GROUPS.map((g,i)=>{
  const status=groupStatus(s,g),target=groupTarget(s,g);
  return '<button type="button" class="side-milestone journey-milestone '+e(g.mode)+' '+(status==='complete'?'done ':'')+(active.id===g.id?'active':'')+
   '" data-action="journey-open" data-target="'+e(target)+'"'+(active.id===g.id?' aria-current="step"':'')+
   ' aria-label="'+e('Chapter '+(i+1)+': '+g.name+'. '+chapterRole(g)+'. '+STATUS_LABELS[status]+'. '+chapterProgressCopy(s,g))+'.">'+
   '<span class="dot">'+icon(status==='complete'?'check':g.icon)+'</span>'+
   '<span class="journey-milestone-text"><span class="journey-rail-name">'+icon(g.icon)+'<strong>'+e(g.name)+'</strong></span>'+
   '<small>'+e(STATUS_LABELS[status])+'</small>'+
   '<span class="journey-rail-context">'+e(chapterProgressCopy(s,g))+'</span>'+
   chapterMini(s,g)+'</span></button>';
 });
 return '<div class="journey-rail-zone planning"><span class="journey-rail-zone-label">'+icon('compass')+' Plan</span>'+buttons[0]+'</div>'+
  '<div class="journey-rail-zone writing"><span class="journey-rail-zone-label">'+icon('pencil')+' Write your IA</span>'+buttons.slice(1).join('')+'</div>';
}
export function checkpointCard(s){
 const last=latestCheckpoint(s);if(!last)return '';
 return '<aside class="recent-checkpoint"><span class="checkpoint-icon">'+icon('check-circle')+'</span><div><span class="section-eyebrow">YOUR LAST CHECKPOINT</span><strong>'+e(last.title)+'</strong><p>'+e(last.detail)+'</p></div></aside>';
}
export function stageCard(s,stage){
 const status=stageStatus(s,stage.id);
 return '<button type="button" class="completion-stage-card stage-'+status+'" data-action="completion-open" data-node="'+stage.id+'"><span class="feature-icon">'+icon(status==='complete'?'check':stage.icon)+'</span><span class="completion-stage-body"><strong>'+e(stage.name)+'</strong><small>'+e(STATUS_LABELS[status])+'</small></span>'+icon('chevron-right')+'</button>';
}
export function groupedDashboard(s){
 return '<div class="studio-focus-summary"><span class="section-eyebrow">'+icon('sparkles')+' ONE USEFUL STEP</span><p>Choose the stage that helps your investigation now. You can return to any earlier decision.</p></div>'+discoveryTrail(s,{compact:true})+'<div class="dashboard-plan"><span>'+icon('compass')+' 1. Planning <span class="status-tag">'+e(STATUS_LABELS[stageStatus(s,'plan')])+'</span></span>'+button('Revisit planning','go-planning','btn-quiet btn-sm')+'</div>'+JOURNEY_GROUPS.slice(1).map((g,i)=>'<section class="journey-stage-group journey-writing-stage">'+(i===0?'<p class="journey-writing-phase">'+icon('pencil')+' WRITE YOUR IA</p>':'')+
 '<h3>'+icon(g.icon)+' '+(i+2)+'. '+e(g.name)+' '+chapterMini(s,g)+'</h3>'+
 '<p class="journey-stage-description">'+e(g.description)+'</p><div class="completion-stage-grid">'+g.stages.map(id=>stageCard(s,C_MAJOR_STAGES.find(x=>x.id===id))).join('')+'</div></section>').join('');
}
const planningRows=s=>{
 const f=s.planning.fields,complete=new Set(s.planning.completedNodes);
 const rows=[['N00','Starting idea',f.idea||f.interest],['N01','Working title and question',f.provisionalTitle||f.aim],['N01V','Meaning and beneficiary',f.beneficiary],['N02','Investigation direction',f.kind],
 [f.kind==='theoretical'?'N02T':'N03','Sources or starting material',f.dataSource||f.theoreticalCase],
 [f.kind==='theoretical'?'N08':'N03F','Feasibility and timeline',''],['N04','Course and mathematics',f.course],['N01P','Prediction or conjecture',f.prediction],['N05V','Purposeful first mathematics',f.firstAction||f.figurePurpose],['N06T','Teacher questions',f.teacherQuestion],['N06','Working planning summary',s.planning.completed?'Your provisional plan is ready to revisit.':'']];
 return rows.map(([id,title,text])=>'<button type="button" class="journey-decision" data-action="plan-edit" data-node="'+id+'"'+(s.planning.current===id?' aria-current="step"':'')+'><span><strong>'+e(title)+'</strong><small>'+e(text||'Open when useful')+'</small></span><span class="decision-state">'+(s.planning.current===id?'Current focus':complete.has(id)?'Decision recorded':'Not recorded')+'</span>'+icon('chevron-right')+'</button>').join('');
};
function mathRecords(s){
 if(!s.entries.length)return '<p class="journey-empty">Your actual mathematical work will appear here as you record it. There is no target number of calculations.</p>';
 return '<h3 class="journey-record-heading">Your mathematical work</h3><div class="journey-records">'+s.entries.map((st,i)=>{
  const actual=st.status==='completed'&&!!st.result?.trim();
  return '<button type="button" class="journey-record '+(st.reviewNeeded==='yes'?'needs-review':actual?'recorded':'planned')+'" data-action="edit-step" data-index="'+i+'"><span class="record-dot">'+icon(st.reviewNeeded==='yes'?'refresh':actual?'check':'circle')+'</span><span><strong>'+e(st.title||'Mathematical step '+(i+1))+'</strong><small>'+e(actual?st.localTakeaway||st.interpretation||st.result:st.purpose||'A question still to investigate')+'</small><span class="status-tag">'+(st.reviewNeeded==='yes'?'Needs review':actual?'Actual result recorded':'Planned, not performed')+'</span></span>'+icon('chevron-right')+'</button>';
 }).join('')+'</div>';
}
export function journeyMap(s){
 const current=currentGroup(s);
 return '<div class="journey-focus"><div><span class="section-eyebrow">CURRENT FOCUS</span><h2>'+e(current.name)+'</h2><p>'+e(s.project.aim||s.planning.fields.aim||'One thoughtful step at a time.')+'</p></div>'+button(resumeLabel(s),'resume-work','btn-primary','','arrow-right')+'</div>'+checkpointCard(s)+discoveryTrail(s)+
 '<div class="journey-map-tools"><p>Plan in Chapter 1, then write your IA in Chapters 2–4. Revisit any part.</p><button type="button" class="btn btn-quiet btn-sm" data-action="journey-toggle-all" aria-expanded="false">Show full path</button></div><div class="journey-chapters">'+
 JOURNEY_GROUPS.map((g,i)=>{const status=groupStatus(s,g);
  return '<details class="journey-chapter journey-chapter-'+e(g.mode)+'" data-journey-group="'+g.id+'"'+(g.id===current.id?' open':'')+'><summary><span class="chapter-marker '+status+'">'+icon(status==='complete'?'check':g.icon)+'</span><span>'+(i===0?'<span class="journey-chapter-act">'+icon('compass')+' PLAN</span>':i===1?'<span class="journey-chapter-act writing">'+icon('pencil')+' WRITE YOUR IA</span>':'')+'<strong>'+(i+1)+'. '+e(g.name)+'</strong>'+
 '<small>'+e(g.description)+' · '+e(STATUS_LABELS[status])+'</small>'+
 '<span class="journey-chapter-progress-detail">'+e(chapterProgressCopy(s,g))+'</span>'+
 chapterMini(s,g)+'</span>'+icon('chevron-right')+'</summary><div class="chapter-body">'+
   (g.id==='plan'?planningRows(s):'<div class="completion-stage-grid">'+g.stages.map(id=>stageCard(s,C_MAJOR_STAGES.find(x=>x.id===id))).join('')+'</div>')+
   (g.id==='explore'?mathConstellation(s)+'<div class="button-row">'+button(s.entries.length?'Decide what mathematics follows':'Start first exploration',s.entries.length?'completion-next-from-map':'completion-first-from-map','btn-light','','arrow-right')+'</div>':'')+'</div></details>';
 }).join('')+'</div>'+insightToolkit(s)+insightThreadMap(s)+'<p class="small-callout">Ready for now is your own checkpoint, not an IA grade. A recorded decision is not a completed calculation. All stages stay available.</p>';
}
