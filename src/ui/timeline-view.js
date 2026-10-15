/** A two-question first view with optional, editable date-level planning. */
import {TIMELINE_STAGES,TIMELINE_KEYS,milestoneLabel,timelineWeek,validDate} from "../planning/timeline.js";

const dateLabel=value=>validDate(value)?
 new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}).format(new Date(value+"T12:00:00Z")):
 "Date to decide";

function warnings(f,kind){
 const problems=[];
 const later=(a,b,msg)=>{if(f[a]&&f[b]&&f[a]>f[b])problems.push(msg);};
 later("sourceFirstDate","sourceFullDate","Your first usable data is planned after the complete dataset.");
 if(kind!=="theoretical")later("milestoneData","milestoneFirstVisual","Your first graph may need usable data earlier, unless it is an illustrative example.");
 later("milestoneFirstMath","milestoneDraft","Substantial mathematics is due after the full draft.");
 later("milestoneFurtherMath","milestoneDraft","Further mathematics and the conclusion are due after the draft.");
 later("milestoneDraft","milestoneReview","The draft is later than its final check.");
 later("milestoneDraft","milestoneSchoolDraft","The full draft is later than the school's teacher-draft date.");
 later("milestoneReview","milestoneSchoolFinal","Your final checks are later than the school's submission date.");
 return problems;
}
export function renderTimelineStep(state,{e,icon,F,choice,callout}){
 const f=state.planning.fields,auto=state.planning.timelineAuto||{};
 const saved=TIMELINE_KEYS.some(key=>validDate(f[key]));
 const shown=!!f.timelineStart&&saved;
 const existing=saved||!!f.milestoneSchoolDraft||!!f.milestoneSchoolFinal;
 const outOfDate=shown&&auto.weeks&&(auto.weeks!==f.timelineWeeks||auto.early!==f.timelineEarly||auto.start!==f.timelineStart);
 const dateFields=pairs=>pairs.map(([key,label])=>F(key,label,"",{type:"date"})).join("");
 const schedule=shown?'<section class="timeline-result" id="timeline-suggestion" tabindex="-1" aria-label="Your suggested IA timeline">'+
  '<div class="timeline-result-heading"><div><h3>Your suggested timeline</h3><p>Starting '+e(dateLabel(f.timelineStart))+'. Adjust any date to suit your investigation.</p></div>'+
  '<span class="meta-pill">'+e(f.timelineWeeks||"?")+' weeks</span></div>'+
  '<ol class="timeline-milestones">'+TIMELINE_STAGES.map((x,i)=>
   '<li><span class="timeline-step-number" aria-hidden="true">'+(i+1)+'</span>'+
   '<span class="timeline-step-name">'+e(milestoneLabel(x.key,f.kind))+'</span>'+
   '<span class="timeline-step-time"><span data-timeline-week="'+e(x.key)+'">'+
    (validDate(f[x.key])?"Week "+timelineWeek(f.timelineStart,f[x.key]):"Not scheduled")+'</span>'+
    '<strong data-timeline-date="'+e(x.key)+'">'+e(dateLabel(f[x.key]))+'</strong></span></li>'
  ).join("")+'</ol>'+
  (f.timelineEarly==="yes"?'<p class="timeline-buffer">'+icon("sparkles")+' You chose some breathing room after the final checks.</p>':
    '<p class="field-hint">Your final review uses the available time. You can move it earlier if you prefer.</p>')+
  (outOfDate?callout("Refresh your suggestion","Your time or start date changed. Select Update suggested timeline; manually edited dates will be kept.",true):"")+
  '</section>':
  (existing?'<p class="field-hint">Your previously entered detailed dates are still saved. Open the optional detailed planner to review them, or generate suggestions to fill any blanks.</p>':"");
 const problems=warnings(f,f.kind);
 return '<div class="timeline-simple">'+
   '<div class="timeline-two-questions">'+
    '<div class="field-group"><label class="field-label" for="timeline-weeks">How many weeks do you have to work on your IA?</label>'+
    '<input class="field" id="timeline-weeks" type="number" inputmode="numeric" step="1" min="1" max="52" placeholder="e.g. 8" value="'+e(f.timelineWeeks)+'" data-bind="planning.fields.timelineWeeks">'+
    '<p class="field-hint">Count the weeks from when you start; dates can be adjusted later.</p></div>'+
    '<div class="field-group"><p class="field-label" id="timeline-early-label">Would you like to finish early, with time to relax?</p>'+
    '<div role="group" aria-labelledby="timeline-early-label">'+choice("timelineEarly",[
      {value:"yes",title:"Yes, leave some free time",desc:"Aim to finish the final checks a little earlier."},
      {value:"no",title:"No, use all my weeks",desc:"Keep working up to the end of my available time."}
    ],{stack:true})+'</div></div>'+
   '</div><div class="button-row timeline-generate-row">'+
    '<button class="btn btn-primary" type="button" data-action="timeline-generate">'+icon("sparkles")+
    (shown?"Update suggested timeline":"Make my suggested timeline")+'</button>'+
    '<span class="field-hint">Suggestions only — no school dates are invented.</span></div>'+
   schedule+'</div>'+
   '<details class="timeline-advanced"><summary>'+icon("clock")+
    '<span><strong>Edit dates or add school deadlines</strong><small>Optional detailed planner</small></span>'+
    icon("chevron-right")+'</summary><div class="timeline-advanced-body">'+
    '<p class="field-hint">You can adjust any milestone. Regenerating suggestions keeps dates you changed yourself. Only enter official deadlines supplied by your school.</p>'+
    F("timelineStart","Date I am starting my plan","",{type:"date"})+
    '<div class="field-row">'+dateFields([["milestoneSchoolDraft","School teacher-draft deadline (if known)"],["milestoneSchoolFinal","School final submission date (if known)"]])+'</div>'+
    '<div class="field-row">'+dateFields(TIMELINE_STAGES.map(x=>[x.key,milestoneLabel(x.key,f.kind)]))+'</div>'+
    (problems.length?problems.map(msg=>callout("Check this date",e(msg),true)).join(""):"")+
    (f.milestoneDraft&&f.milestoneSchoolFinal&&f.milestoneDraft>f.milestoneSchoolFinal?
      F("milestoneAdjustment","How could I adapt the timetable?","Start earlier or simplify the approach",{type:"textarea",rows:2}):"")+
    (shown?'<button type="button" class="btn btn-secondary btn-sm" data-action="timeline-reset">Restore all suggested dates</button>':"")+
    '</div></details>'+
   '<p class="timeline-disclaimer">These are provisional targets, not confirmed deadlines or evidence of work completed. Check school dates and permitted feedback opportunities with your teacher.</p>';
}
