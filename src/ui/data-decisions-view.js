/**
 * Compact, accessible pre-collection decisions. Recaps are optional; the method,
 * population, sampling unit and practical follow-up check stay visible.
 */
import {SAMPLING_METHODS,samplingMethod,plannedAccuracyText,ACCURACY_DRAFT_FIELDS} from '../planning/data-decisions.js';

const guide=(e,icon)=>'<details class="sampling-recap"><summary>'+
 icon('book')+' Sampling and census: quick recap, pros and cons '+icon('chevron-right')+'</summary>'+
 '<div class="sampling-recap-body"><div class="sampling-two-cases">'+
 '<div><strong>Population</strong><p>The full group of people, objects or events your question concerns. Define its boundaries.</p></div>'+
 '<div><strong>Sampling unit</strong><p>One member selected from the frame: a person, object, event or group—not necessarily one measurement.</p></div>'+
 '<div><strong>Census</strong><p>Attempt to include every member of the defined population. Useful for a small reachable group, but completeness and workload matter.</p></div>'+
 '<div><strong>Sample</strong><p>Observe only selected units. Usually faster and easier to extend, but the selection may limit what you can generalise.</p></div>'+
 '<div><strong>Sampling frame</strong><p>A list or other way to identify all eligible sampling units. A frame can exclude members even when the selection from it is random.</p></div>'+
 '<div><strong>Repeated measurements</strong><p>Repeating measurements on one object is different from sampling independent objects; decide which you are investigating.</p></div>'+
 '</div><h4>Common methods at a glance</h4>'+
 '<div class="sampling-method-comparison">'+SAMPLING_METHODS.filter(x=>x.id!=='unsure').map(m=>
 '<div class="sampling-method-row"><strong>'+e(m.label)+'</strong>'+
 '<p><b>Advantage:</b> '+e(m.good)+'</p><p><b>Watch out:</b> '+e(m.watch)+'</p>'+
 '</div>').join('')+'</div>'+
 '<p class="sampling-recap-foot">A quickly available, repeatable sample can be very useful for a first investigation. Call it what it really is and keep conclusions within the population it represents. Always follow school consent and privacy requirements.</p>'+
 '</div></details>';

const samplingSpotlight=(f,e,icon)=>{
 const method=samplingMethod(f.primarySamplingMethod);
 return method?'<aside class="plan-sampling-spark" aria-label="Saved sampling choice">'+
 '<span class="plan-sampling-spark-mark">'+icon('sparkles')+'</span>'+
 '<div><strong>Sampling spark saved · '+e(method.label)+'</strong>'+
 '<p><b>Why it can work:</b> '+e(method.good)+'</p>'+
 '<p><b>Check:</b> '+e(method.watch)+'</p>'+
 '<small>Provisional. Revisit this after you collect genuine observations; your selection is not evidence of representativeness.</small></div>'+
 icon('check-circle')+'</aside>':'';
};
export function samplingPlanner(state,{F,select,e,icon}){
 const f=state.planning.fields,method=samplingMethod(f.primarySamplingMethod);
 return '<section class="data-quality-section" aria-label="Make your sampling decision">'+
 '<div class="data-quality-heading">'+icon('layers')+' <span>PLAN BEFORE COLLECTING</span></div>'+
 '<h3>Who or what will your data represent?</h3>'+
 '<p class="data-quality-intro">A sampling decision matters before you collect data, not just when you evaluate limitations. Be specific, even for a small pilot.</p>'+
 '<div class="data-quality-pair">'+
 F('primaryPopulation','My target population','e.g. Year 12 students at my school (not all teenagers)')+
 F('primarySamplingUnit','What is one sampling unit?','e.g. one student, one football, one recorded trial')+'</div>'+
 select('primarySamplingMethod','How will you select units or obtain observations?',SAMPLING_METHODS.map(m=>[m.id,m.label]))+
 samplingSpotlight(f,e,icon)+
 guide(e,icon)+
 select('primarySamplingFrame','Can you identify every eligible sampling unit (a sampling frame)?',[
 ['yes','Yes — I have a suitable list or way to identify units'],
 ['no','No — I cannot identify all eligible units'],
 ['unsure','I need to check'],
 ['not-applicable','Not applicable to this investigation']])+
 (f.primarySamplingFrame?F('primarySamplingFrameDetails',
 'What is the frame, or what is the difficulty? (optional)','e.g. A current class list, a directory, or no complete list of observations'): '')+
 select('primaryRepeatable','Could you start quickly and collect follow-up observations if useful?',[
 ['yes','Yes — I can start soon and return for more data'],
 ['maybe','Possibly — I would need to check access or timing'],
 ['no','Not easily — I may need a smaller or different plan']])+
 F('primarySampling','Why does your choice suit this particular IA? (optional)',
 'Think about speed, access, how to select units fairly and who may be missed.',{type:'textarea',rows:2})+
 (method&&f.primarySamplingFrame==='no'&&['simple-random','systematic','stratified','cluster'].includes(method.id)?
 '<p class="data-quality-warning">'+icon('info')+' Your chosen method normally needs a suitable frame. Check how you could select the units as described, or consider a more honest feasible approach.</p>':'')+
 '<p class="data-quality-footnote">The aim is a workable, honest plan—not automatically the most statistically sophisticated method. Samples collected by convenience must not be presented as simple random samples.</p>'+
 '</section>';
}

const basisOptions={
 primary:[['analogue','Analogue instrument (marked scale)'],['digital','Digital instrument (displayed digits)'],
 ['estimated','Estimated from observation or image'],['exact','Exact count / category'],
 ['unknown','I have not confirmed the precision yet']],
 secondary:[['published','Publisher states the resolution or precision'],['rounded','I can see rounding in the table; accuracy not verified'],
 ['exact','Exact reported count / category'],['unknown','I cannot confirm the original resolution yet']]
};
const basisAdvice={
 analogue:'Find the smallest marked division; for a single scale reading, about half a division may be a reasonable reading uncertainty only when justified. Two endpoint readings can add uncertainty.',
 digital:'Find the smallest displayed change, but remember that display resolution is not the device’s accuracy. Check calibration, device specifications and repeatability.',
 estimated:'If positions come from an image or observation, establish scale and viewpoint. Pixel spacing is not automatically distance or measurement accuracy.',
 published:'Use the source’s original metadata or method to identify how values were recorded and rounded. The published figures may not show the original uncertainty.',
 rounded:'Digits displayed in a table show reporting precision, not proof of measurement accuracy. Describe this as apparent rounding until you verify the source methodology.',
 exact:'A counted frequency or category may be exact for the defined observed set; sampling bias and incomplete coverage can still limit what you infer.',
 unknown:'This is a legitimate provisional decision. Record what you need to check before reporting results with unjustified decimal places.'
};
const accuracyGuide=(source,icon)=>'<details class="accuracy-recap"><summary>'+icon('book')+
 (source==='primary'?'How do I judge a measuring device’s accuracy?':'What if a published table rounds the data?')+
 ' '+icon('chevron-right')+'</summary>'+
 '<div class="accuracy-recap-body">'+
 (source==='primary'?
 '<p><b>Analogue scale:</b> identify its smallest marked interval. Half an interval can sometimes be a sensible reading uncertainty for a single reading, but this is not a universal rule.</p>'+
 '<p><b>Digital display:</b> identify the display increment (for example, 0.01 s). This describes resolution, not necessarily accuracy. Check the manufacturer’s specifications and any calibration.</p>'+
 '<p><b>Repeating:</b> repeat a measurement to examine random variation. Repetition cannot fix an unrecognised systematic error.</p>':
 '<p><b>Rounded values:</b> 12.3 may mean rounded to the nearest 0.1, but it does not tell you whether the original measurement was accurate to 0.1.</p>'+
 '<p><b>Original metadata:</b> look for how quantities were measured, units, definitions, any uncertainty and whether values were rounded for publication.</p>'+
 '<p><b>Exact counts:</b> frequencies and categories need not be assigned an invented ± value. Check completeness, definitions and how the original sample was chosen.</p>')+
 '<p><b>Good practice:</b> carry enough digits during calculations and justify rounding when reporting a result. Never treat the number of decimal places as a guarantee of accuracy.</p>'+
 '</div></details>';
export function accuracyPlanner(state,source,{F,select,e,icon}){
 const f=state.planning.fields;
 const draft=ACCURACY_DRAFT_FIELDS[source],basis=f[draft[3]];
 const records=(state.planning.accuracyPlans||[]).filter(x=>x.source===source);
 const isPrimary=source==='primary';
 return '<section class="data-quality-section data-accuracy-planner" aria-label="'+(isPrimary?'Primary':'Secondary')+' data accuracy plan">'+
 '<div class="data-quality-heading">'+icon('target')+' <span>YOUR ACCURACY DECISIONS</span></div>'+
 '<h3>'+(isPrimary?'How accurately will you record your measurements?':'How precisely was the published data recorded?')+'</h3>'+
 '<p class="data-quality-intro">'+(isPrimary?
 'Plan one recording rule per quantity before gathering measurements. Include units and the instrument’s smallest usable increment; use exact counts when applicable.':
 'For each relevant column, decide whether values are exact counts, rounded, or of unknown precision. Do not infer measurement accuracy from decimal places alone.')+
 '</p>'+
 accuracyGuide(source,icon)+
 '<div class="data-accuracy-inputs">'+
 '<div class="data-quality-pair">'+
 F(draft[0],'Quantity / column','e.g. reaction time, height, number of goals')+
 F(draft[1],'Unit (if any)','e.g. s, cm, kg')+'</div>'+
 select(draft[3],isPrimary?'How will this be measured?':'What do you know about the published values?',basisOptions[source])+
 (basis?'<p class="data-quality-basis-note">'+icon('info')+' '+e(basisAdvice[basis]||'')+'</p>':'')+
 F(draft[2],isPrimary?'Recording increment / degree of accuracy':'Original resolution or published rounding (if known)',
 isPrimary?'e.g. recorded to nearest 0.1 cm':'e.g. table rounded to nearest 0.01 s')+
 F(draft[4],'Known or possible uncertainty (optional)',
 'e.g. manufacturer tolerance, timing error, not yet established')+
 '<button type="button" class="btn btn-secondary data-accuracy-save" data-action="plan-save-accuracy" data-source="'+source+'">'+
 icon('sparkles')+' Save this accuracy spark</button></div>'+
 (records.length?'<div class="data-saved-accuracy-list" aria-label="Saved provisional accuracy decisions"><p class="data-quality-subhead">'+
 records.length+' saved '+(records.length===1?'quantity':'quantities')+'</p>'+
 records.map(x=>'<div class="data-accuracy-spark"><span class="plan-sampling-spark-mark">'+icon('sparkles')+'</span>'+
 '<div class="data-accuracy-spark-text"><strong>'+e(x.quantity)+(x.unit?' · '+e(x.unit):'')+'</strong>'+
 '<p>'+e(plannedAccuracyText(x))+'</p>'+
 '<small>Planning decision only · confirm using the actual '+(isPrimary?'instrument':'source')+'</small></div>'+
 '<div class="data-accuracy-actions"><button type="button" data-action="plan-edit-accuracy" data-accuracy-id="'+e(x.id)+'">Edit</button>'+
 '<button type="button" data-action="plan-remove-accuracy" data-accuracy-id="'+e(x.id)+'" aria-label="Remove accuracy plan for '+e(x.quantity)+'">Remove</button></div></div>').join('')+'</div>':
 '<p class="data-quality-footnote">No accuracy spark saved yet. You can save more than one quantity and revise decisions after a pilot or source check.</p>')+
 '</section>';
}
