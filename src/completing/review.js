/** Workbook Draft & Final Review D01-D21. Self-review, never automatic grading. */
export const REVIEW_CHECKS=Object.freeze([{"id":"D01","sourceRow":9,"timing":"Before teacher draft","area":"Structure","question":"Is the IA genuinely COMPLETE enough for a useful single written feedback round?","evidence":"Aim/introduction, relevant methods/data or theory, maths, integrated figures, reflection and conclusion","action":"Finish missing essential section and reread the whole exploration","guardrail":"Show near actual school draft milestone","optional":false,"target":"C04"},{"id":"D02","sourceRow":10,"timing":"Both reviews","area":"Criterion A /4","question":"Can the reader follow the investigation logically without irrelevant or repeated work?","evidence":"Clear introduction with aim, coherent unfolding mathematics and conclusion","action":"Remove repetition, clarify connections between stages, keep helpful diagrams beside text","guardrail":"Criterion check, not a predicted 0\u20134 mark","optional":false,"target":"C35"},{"id":"D03","sourceRow":11,"timing":"Both reviews","area":"Criterion B /4","question":"Are mathematical variables/terms, notation, units, equations and figures used clearly and correctly?","evidence":"Equation editor, definitions at first use, credible accuracy, \u2248 for rounded values, titled visuals","action":"Jump to the precise equation/figure requiring repair","guardrail":"Only show detailed notation checklist on request/error","optional":false,"target":"C70N"},{"id":"D04","sourceRow":12,"timing":"Both reviews","area":"Criterion C /3","question":"Does the work demonstrate OWNERSHIP through purposeful choices, conjectures and a personal perspective?","evidence":"Student's aim and reasons, independently chosen investigations, authentic changes of direction","action":"Strengthen genuine decision rationale where student actually made a choice","guardrail":"No invented personal history or artificial creative flourish","optional":false,"target":"C35"},{"id":"D05","sourceRow":13,"timing":"Both reviews","area":"Criterion D /3","question":"Have I reflected throughout, not just collected generic limitations in my conclusion?","evidence":"Actual results interpreted, expectations revisited, mathematical methods evaluated in place, meaningful next questions","action":"Return to result/method where reflection is missing, leave conclusion as synthesis","guardrail":"No retrospective evaluation dump","optional":false,"target":"C34B"},{"id":"D06","sourceRow":14,"timing":"Both reviews","area":"Criterion E /6","question":"Is my ACTUAL mathematics relevant, appropriate for my course, correct and UNDERSTOOD?","evidence":"Substantial, purposeful course-level mathematics; justified modelling or inference, explained technology use","action":"Revise/select purpose-driven maths or discuss suitability with teacher","guardrail":"No guarantee that adding more techniques increases marks","optional":false,"target":"C40D"},{"id":"D07","sourceRow":15,"timing":"Before teacher draft","area":"Readability","question":"Have I printed or closely inspected the WHOLE draft as a reader would see it?","evidence":"Single-page graphs, legible equations, captions, page breaks, coherent margins","action":"Fix specific clutter/oversized or split figure before teacher reads","guardrail":"Don't inspect only on zoomed screen","optional":false,"target":"C70"},{"id":"D08","sourceRow":16,"timing":"Before teacher draft","area":"Reader check","question":"Could a classmate follow the mathematical decisions? Could a non-mathematician follow the story?","evidence":"Peer or relative's confusion points, if available","action":"Ask one reader to flag unclear jumps; revise in own words","guardrail":"Optional; does not require sharing private participant data","optional":true,"target":"C70"},{"id":"D09","sourceRow":17,"timing":"Both reviews","area":"Source integrity","question":"Are datasets, claims, graphics, quotations and outside mathematics correctly cited?","evidence":"Consistent in-text citation and bibliography or works-cited, traceable URLs/publishers","action":"Add missing attributions before submitting draft/final","guardrail":"School 2025 guide suggests MLA in Google Docs; follow current teacher-approved style consistently","optional":false,"target":"C20"},{"id":"D10","sourceRow":18,"timing":"Both reviews","area":"Layout guidance","question":"Have I checked current school instructions for title page, spacing, approximate length and page numbering?","evidence":"The 2025 guide suggests ~12\u201320 pages, double spacing; current policies may differ","action":"Check current requirements; no invented deadline or absolute page-limit gate","guardrail":"Course requirements/formatting may be updated","optional":true,"target":"C70"},{"id":"D11","sourceRow":19,"timing":"Before teacher draft","area":"Mathematics present","question":"Have I included substantial calculations/figures, not only a plan and placeholders?","evidence":"Real calculations, purpose and interpretation near results","action":"Finish mathematical body rather than treating intention as completed work","guardrail":"Teacher draft must be complete; data not assumed from plan","optional":false,"target":"C40"},{"id":"D12","sourceRow":20,"timing":"Before teacher draft","area":"Academic integrity","question":"Is all analysis and reflection truly mine, with permissions and source credit?","evidence":"Student authorship and sources; no unsupported AI-written IA passages","action":"Revise unsupported passage, cite non-original sources, consult teacher when uncertain","guardrail":"Pathfinder must not auto-write final IA prose","optional":false,"target":"C70"},{"id":"D13","sourceRow":21,"timing":"During feedback","area":"Written feedback rule","question":"Have I used the school's permitted written draft feedback opportunity appropriately?","evidence":"One allowed teacher-written feedback round for completed IA","action":"Record teacher feedback and action items; teacher controls advice","guardrail":"Never request a second round of written teacher feedback from this tool","optional":false,"target":"C80"},{"id":"D14","sourceRow":22,"timing":"During feedback","area":"Verbal notes","question":"When my teacher gives verbal advice, have I recorded what I need to do?","evidence":"Short feedback note/action/date; distinguish suggestions from verified corrections","action":"Act on relevant notes and re-check work","guardrail":"Do not let the tool impersonate teacher approval","optional":false,"target":"C80"},{"id":"D15","sourceRow":23,"timing":"Before final","area":"Revisions","question":"Have I actually implemented the permitted feedback and checked the changes work?","evidence":"Revised analysis/graphs/calculations and rechecked accuracy/context","action":"Return to exact affected stage; preserve old notes and student writing","guardrail":"Don't auto-mark revisions done because feedback was imported","optional":false,"target":"C40"},{"id":"D16","sourceRow":24,"timing":"Before final","area":"Final evidence A\u2013E","question":"Can I identify the page or section where each criterion is genuinely evident?","evidence":"Student-generated A\u2013E evidence pointers, not automatic marks","action":"Fix a genuine gap or note limitations; no predicted score","guardrail":"Criteria labels/scores are maxima, not guaranteed grade","optional":false,"target":"C34B"},{"id":"D17","sourceRow":25,"timing":"Before final","area":"Proofread and check","question":"Have I reread the final file, tested equation rendering, citations and figure placement?","evidence":"Final print/PDF preview, spelling, grammar, page numbering","action":"Correct local issue and recheck the final render","guardrail":"Not a submission action; cannot verify final file if not uploaded","optional":false,"target":"C70N"},{"id":"D18","sourceRow":26,"timing":"Before final","area":"Formatting & identity","question":"Does the final cover page/identifier follow current school IB instructions?","evidence":"Appropriate title, correct candidate identifier where required, no unapproved personal details","action":"Ask teacher about identity, cover style and school submission method","guardrail":"Do not publish real participant names or assume one universal cover policy","optional":true,"target":"C90"},{"id":"D19","sourceRow":27,"timing":"Both reviews","area":"Appendix and data","question":"Is the necessary evidence traceable without huge raw tables cluttering the IA?","evidence":"Short meaningful examples/figures in body, dataset/source cited; optional justified supporting material","action":"Default Pathfinder editorial preference: no long raw tables even in appendix; ask teacher if an exception is necessary for reproducibility","guardrail":"IB Guide ALLOWS justified large-data appendices; this is NOT an IB ban. Avoid redundant data tables.","optional":true,"target":"C20"},{"id":"D20","sourceRow":28,"timing":"Both reviews","area":"Course and tools","question":"Do calculator or software outputs show meaningful mathematical understanding?","evidence":"Method name/inputs, purpose, interpretation, check of assumptions when needed","action":"Explain mathematical reasoning at the point of use, not a tutorial","guardrail":"Show only for tools actually used","optional":false,"target":"C40T"},{"id":"D21","sourceRow":29,"timing":"Before final","area":"Deadline and process","question":"Is the correct school submission date/method confirmed, and am I ready to submit my own IA?","evidence":"Actual student/school schedule and source-independent file","action":"Follow school's process; no Pathfinder submission claim","guardrail":"No guessed dates or automated IB approval","optional":false,"target":"C90"}]);

const str=v=>typeof v==="string"?v.trim().slice(0,5000):"";
const modes=["draft","feedback","final"];
const statuses=["unchecked","needs-work","checked","not-applicable"];
const record=()=>({status:"unchecked",location:"",note:"",action:"",entryId:"",checkedAt:""});
export function createReviewState(){
 return {records:Object.fromEntries(modes.flatMap(mode=>REVIEW_CHECKS.map(x=>[mode+"-"+x.id,record()]))),
  returnTo:"",repairKey:"",feedbackItems:[],feedbackKind:"written",feedbackNote:"",feedbackAction:"",feedbackLocation:"",feedbackEntryId:"",feedbackNode:"C40"};
}
export function normalizeReviewState(raw){
 const out=createReviewState(),v=raw&&typeof raw==="object"?raw:{};
 for(const key of ["returnTo","repairKey","feedbackKind","feedbackNote","feedbackAction","feedbackLocation","feedbackEntryId","feedbackNode"])out[key]=str(v[key]);
 for(const [key,blank] of Object.entries(out.records)){
  const input=v.records?.[key];
  if(input&&typeof input==="object")for(const field of Object.keys(blank))blank[field]=str(input[field]);
  if(!statuses.includes(blank.status))blank.status="unchecked";
 }
 out.feedbackItems=(Array.isArray(v.feedbackItems)?v.feedbackItems:[]).filter(x=>x&&typeof x==="object").slice(0,100).map(x=>({
  id:str(x.id),kind:x.kind==="verbal"?"verbal":"written",note:str(x.note),action:str(x.action),location:str(x.location),entryId:str(x.entryId),node:str(x.node),
  status:["recorded","implemented","verified"].includes(x.status)?x.status:"recorded",verification:str(x.verification),at:str(x.at),implementedAt:str(x.implementedAt),verifiedAt:str(x.verifiedAt)
 }));
 // Restoring a status is not a new approval or new verification.
 return out;
}
export function actualTechnologyUsed(state){
 const f=state.completion.fields;
 return !!(str(f.technologyTool)&&str(f.technologyOutcome)&&state.entries.some(e=>e.id===f.technologyForEntryId&&e.status==="completed"&&str(e.result)));
}
export function reviewChecksFor(state,mode){
 return REVIEW_CHECKS.filter(x=>
  (x.timing==="Both reviews"&&mode!=="feedback"||x.timing==="Before teacher draft"&&mode==="draft"||x.timing==="Before final"&&mode==="final"||x.timing==="During feedback"&&mode==="feedback")&&
  (x.id!=="D20"||actualTechnologyUsed(state)));
}
export function setReviewStatus(state,mode,id,status){
 if(!modes.includes(mode)||!statuses.includes(status)||!reviewChecksFor(state,mode).some(x=>x.id===id))return{ok:false,error:"That check does not belong to this review."};
 const r=state.completion.review.records[mode+"-"+id];
 if(status==="checked"&&!str(r.location||r.note))return{ok:false,error:"Record your own evidence or the location you checked before marking this checked."};
 if(status==="not-applicable"&&!str(r.note))return{ok:false,error:"Briefly record why this check does not apply."};
 r.status=status;r.checkedAt=status==="checked"?new Date().toISOString():"";
 return{ok:true};
}
export function reviewEditChanged(state,path,before,after){
 if(before===after)return;
 const parts=path.split('.');
 if(parts[0]!=="completion"||parts[1]!=="review")return;
 if(parts[2]==="records"){
  const r=state.completion.review.records[parts[3]];
  if(r&&["location","note","action","entryId"].includes(parts[4])&&r.status==="checked"){r.status="needs-work";r.checkedAt="";}
 }
 if(parts[2]==="feedbackItems"){
  const item=state.completion.review.feedbackItems[Number(parts[3])];
  if(item?.status==="verified"){item.status="implemented";item.verifiedAt="";}
 }
}
export function addFeedbackAction(state){
 const r=state.completion.review;
 if(!str(r.feedbackNote)||!str(r.feedbackAction))return{ok:false,error:"Record the actual feedback and one specific revision action."};
 if(r.feedbackItems.length>=100)return{ok:false,error:"Revisit an existing feedback action; this project already contains 100."};
 r.feedbackItems.push({id:"feedback-"+Date.now().toString(36)+"-"+r.feedbackItems.length,kind:r.feedbackKind==="verbal"?"verbal":"written",
  note:str(r.feedbackNote),action:str(r.feedbackAction),location:str(r.feedbackLocation),entryId:str(r.feedbackEntryId),node:str(r.feedbackNode)||"C40",
  status:"recorded",verification:"",at:new Date().toISOString(),implementedAt:"",verifiedAt:""});
 r.feedbackNote="";r.feedbackAction="";r.feedbackLocation="";
 return{ok:true,message:"Feedback action recorded. It is not yet marked implemented or checked."};
}
export function progressFeedback(state,index,action){
 const item=state.completion.review.feedbackItems[index];
 if(!item)return{ok:false,error:"That feedback action is not available."};
 if(action==="implemented"){
  item.status="implemented";item.implementedAt=new Date().toISOString();item.verifiedAt="";
  return{ok:true,message:"You confirmed the revision was made in your own IA. Check the revised mathematics next."};
 }
 if(action==="verified"){
  if(item.status!=="implemented"||!str(item.verification))return{ok:false,error:"First confirm the revision was made, then describe how you checked it."};
  item.status="verified";item.verifiedAt=new Date().toISOString();
  return{ok:true,message:"Your own revision check has been recorded; this is not teacher approval."};
 }
 return{ok:false,error:"Unknown feedback status."};
}
