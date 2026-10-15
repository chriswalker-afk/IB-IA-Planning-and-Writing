import {suggestedTopics,availableTopics,adviceFor,stuckContext} from './stuck.js';
import {topicById} from './stuck-catalog.js';
/** The same help in the global drawer and legacy C95 routes. No automatic popups. */
export function createStuckViews({getState,e,icon,field}){
 const action=(name,label,extra='',primary=false)=>'<button type="button" class="btn '+(primary?'btn-primary':'btn-secondary')+'" data-action="stuck-'+name+'" '+extra+'>'+e(label)+'</button>';
 const pick=t=>'<button type="button" class="stuck-topic" data-action="stuck-topic" data-topic="'+e(t.id)+'"><span>'+e(t.label)+'</span>'+icon('chevron-right')+'</button>';
 function render(){
  const state=getState(),s=state.completion.support,x=stuckContext(state),a=adviceFor(state,s.selected);
  const context=(x.planning?'Planning: ':x.entry?'Selected mathematical step: ':'Current aim: ')+(x.planning?state.planning.fields.aim||'developing your question':x.entry?.title||x.aim||'still to decide');
  const f=state.completion.fields,legacy=[['Earlier obstacle',f.blockedBy],['Earlier next action',f.oneSafeAction],['Candidate source',f.alternateSource],['Source fit',f.alternateFit],['Data issue',f.limitedDataIssue],['Earlier target date',f.stuckFollowup]].filter(([,v])=>v);
  const oldNotes=legacy.length?'<details class="stuck-legacy"><summary>Earlier help notes (kept)</summary>'+legacy.map(([label,value])=>'<p><strong>'+e(label)+':</strong> '+e(value)+'</p>').join('')+'</details>':'';
  const footer=oldNotes+'<div class="stuck-footer">'+action('return','Return to my work')+action('backup','Download full backup')+'</div>';
  if(!a){
   const suggestions=suggestedTopics(state),shown=new Set([...suggestions.map(t=>t.id),'unsure']);
   const rest=availableTopics(state).filter(t=>!shown.has(t.id));
   return '<div class="stuck-support"><p class="stuck-intro">What is getting in your way? Choose the closest problem. You only need one useful next step.</p>'+
    '<p class="stuck-context">'+e(context.slice(0,180))+'</p>'+
    (s.task?.status==='pending'?'<details class="stuck-saved"><summary>Your saved next action</summary><p>'+e(s.task.action)+'</p>'+action('resume','Review this action')+action('resolved','This got me moving')+'</details>':'')+
    '<div class="stuck-topics" aria-label="Suggested problems for your current work">'+suggestions.map(pick).join('')+'</div>'+
    '<details class="stuck-browse"'+(s.browse?' open':'')+'><summary>Other problems</summary>'+[...new Set(rest.map(t=>t.group))].map(group=>'<div class="stuck-topic-group"><h3>'+e(group)+'</h3>'+rest.filter(t=>t.group===group).map(pick).join('')+'</div>').join('')+'</details>'+
    pick(topicById('unsure'))+footer+'</div>';
  }
  const draft='completion.support.drafts.'+a.id;
  return '<div class="stuck-support">'+action('menu','Back to problems')+
   '<h3 class="stuck-heading" tabindex="-1">'+e(a.label===a.id?a.label:topicById(a.id).label)+'</h3>'+
   '<p class="stuck-context">'+e(context.slice(0,180))+'</p>'+
   '<section class="stuck-next"><h4>Try this now</h4><p>'+e(a.action)+'</p><p class="stuck-why">'+e(a.reason)+'</p><p class="stuck-outcome"><strong>A useful stopping point:</strong> '+e(a.outcome)+'</p>'+action('work',a.label,'',true)+'</section>'+
   '<details class="stuck-example"><summary>Show a small example</summary><p class="stuck-caption">Illustrative thinking only - not your findings or wording to copy.</p><p>'+e(a.example)+'</p></details>'+
   '<p class="stuck-boundary">'+e(a.boundary)+'</p>'+
   '<details id="stuck-alternatives"'+(s.more?' open':'')+'><summary>That did not help / try another route</summary><p>Choose a different way forward; none is compulsory.</p><div class="stuck-topics">'+a.alternatives.map(pick).join('')+'</div><div class="stuck-teacher"><h4>Make the question easier to answer</h4><p>Tell your teacher what you are trying to find, what you have tried, and the first step or idea you cannot justify. Refer to the relevant figure or working.</p>'+action('teacher','Prepare a teacher question')+'</div></details>'+
   '<details class="stuck-save"><summary>Save my own next action (optional)</summary><p>This is a private project note, not text added to your IA. Saving it does not mark the problem solved.</p>'+
    field(draft+'.action','The one thing I will do next','A small task I choose',{type:'textarea',rows:2})+
    field(draft+'.note','What I tried / question to keep (optional)','Keep participant names and private data out of this note',{type:'textarea',rows:2})+
    action('save','Save my next action')+(s.task?.issue===a.id?'<p role="status" class="stuck-caption">Saved action: '+e(s.task.status==='resolved'?'you marked it as helpful':'pending')+'</p>':'')+'</details>'+footer+'</div>';
 }
 function returnBanner(){const s=getState().completion.support;return s.returnPending?'<div class="stuck-return-banner"><span>You opened this task from help.</span>'+action('return','Return to my previous work')+action('stay','Keep working here')+'</div>':'';}
 return{render,returnBanner};
}
