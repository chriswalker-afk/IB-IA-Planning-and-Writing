/** Explicit assessment-cohort selection. Existing projects keep their current A-E criteria. */
export const ASSESSMENT_FRAMEWORKS=Object.freeze({
 legacy:Object.freeze({id:"legacy",label:"First assessment to 2028",firstAssessment:"Through November 2028",
  explanation:"The current five criteria A–E apply. Your existing Pathfinder guidance, evidence notes and optional self-review remain unchanged."}),
 revised2029:Object.freeze({id:"revised2029",label:"First assessment 2029 onwards",firstAssessment:"May 2029 onwards",
  explanation:"The published 2029 syllabus uses four revised IA criteria. This site shows their published overview, but does not invent mark-band descriptors or translate existing A–E self-marks."})
});
export const REVISED_2029_CRITERIA=Object.freeze([
 Object.freeze({id:"A",name:"Problem specification",max:4,strands:["Problem in context","Desired outcomes"],focus:"Specify a mathematical problem in its context and state what a successful investigation aims to establish."}),
 Object.freeze({id:"B",name:"Abstraction",max:6,strands:["Assumptions","Selected techniques and tools","Mathematical form"],focus:"Explain how the situation is represented mathematically, including assumptions, suitable techniques and mathematical form."}),
 Object.freeze({id:"C",name:"Computation",max:4,strands:["Calculations","Mathematical communication"],focus:"Carry out valid mathematics and communicate the calculations or reasoning clearly."}),
 Object.freeze({id:"D",name:"Interpretation",max:6,strands:["Interpretation of results","Evaluation of desired outcomes","Refinement"],focus:"Explain what the mathematical results mean, evaluate the desired outcomes and consider justified refinements."})
]);
export const REVISED_2029_SOURCE="https://www.ibo.org/university-admission/latest-curriculum-updates/dp-mathematics-analysis-and-approaches-updates/";
export const REVISED_2029_SOURCE_AI="https://ibo.org/university-admission/latest-curriculum-updates/dp-mathematics-applications-and-interpretation-updates/";
export function assessmentFramework(state){
 return state?.planning?.fields?.assessmentFramework==="revised2029"?"revised2029":"legacy";
}
export const isRevisedAssessment=state=>assessmentFramework(state)==="revised2029";
export function assessmentBanner(state,e=x=>String(x)){
 if(!isRevisedAssessment(state))return "";
 return '<aside class="assessment-cohort-notice" role="note" data-assessment-notice="revised2029">'+
  '<strong>First assessment 2029 onwards · revised mathematics IA criteria</strong>'+
  '<p>Your planning and writing tools remain available. The old A–E criterion bubbles and self-marks are hidden because they refer to a different rubric. See the published four-criterion overview; full mark-band descriptors are not claimed here. Existing A–E review notes are retained if you switch back.</p>'+
  '<button type="button" class="btn btn-secondary btn-sm" data-action="essentials-open" data-essentials-tab="rubric">View revised criteria overview</button>'+
  '<span class="assessment-cohort-source">Select the applicable cohort in Planning → Course and mathematics. Confirm it with your teacher.</span>'+
  '</aside>';
}
