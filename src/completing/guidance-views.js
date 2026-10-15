import {exampleButton,exampleInline} from "../examples/views.js";
/** Phase 5: one contextual writing moment; maths and limitations only on request. */
import {eligibleWritingCues} from "./writing-guidance.js";
import {quietAutoWritingCue,writingStatusSummary} from "./guidance-actions.js";
import {relevantMathsGuidance} from "./maths-guidance.js";
import {relevantLimitations,confirmedLimitationsForConclusion,limitationContextKey} from "./limitation-guidance.js";
import {relevantBivariateOptions} from "./bivariate-guidance.js";
import {guidanceContext,SCATTER_DETAILS,readable} from "./guidance-context.js";

export function createGuidanceViews(ctx){
 const {getState,e,icon,field,choose}=ctx;
 const tiny=(text)=>'<p class="guidance-small">'+e(text)+'</p>';
 const trigger=(action,label,more="")=>'<button type="button" class="guidance-link" data-action="'+action+'"'+more+'>'+e(label)+'</button>';
 const sourceAttr=(cue)=>' data-guidance-id="'+e(cue.id)+'" data-guidance-key="'+e(cue.key)+'"';
 const cueButton=(cue,action,label)=>trigger("guidance-writing-action",label,' data-guidance-event="'+action+'"'+sourceAttr(cue));
 const input=(path,label,help="",opts={})=>field(path,label,help,{...opts});
 function cueCard(cue){
  const s=getState(),ui=s.completion.guidanceUi;
  return '<div class="guidance-writing-card" data-writing-cue="'+e(cue.id)+'">'+
    '<div class="guidance-where">'+icon("pencil")+' <span>WHERE IN YOUR OWN IA</span> <strong>'+e(cue.location)+'</strong></div>'+
    '<p class="guidance-message">'+e(cue.message)+'</p>'+
    '<div class="guidance-actions">'+
      cueButton(cue,"write-now","Write now")+
      cueButton(cue,"covered-start","Already covered")+
      cueButton(cue,"not-relevant","Not relevant")+
      exampleButton("Compare examples",{cue:cue.id})+
      cueButton(cue,"defer","Dismiss for now")+'</div>'+
    (ui.exampleKey===cue.key?exampleInline(s,{cue:cue.id}):"")+
    (ui.coveredKey===cue.key?'<div class="guidance-note-editor">'+
      tiny("If you have already addressed this in Word or Google Docs, you can note where. Pathfinder cannot verify the document.")+
      input("completion.guidanceUi.locationDraft","My IA location (optional)","e.g. Figure 1 / after Equation 4")+
      cueButton(cue,"covered","Confirm already covered")+'</div>':"")+
    (ui.writeKey===cue.key?'<div class="guidance-note-editor">'+
      tiny("You write and edit the actual IA yourself. This is a private thinking note, not an edit to Word or Google Docs.")+
      input("completion.guidanceUi.noteDraft","My own brief thought","What would I say in my IA, based on my genuine mathematics?",{type:"textarea",rows:3})+
      input("completion.guidanceUi.locationDraft","Where in my IA? (optional)","e.g. Paragraph following Figure 2")+
      '<div class="button-row">'+cueButton(cue,"save-note","Save idea in Pathfinder")+
      cueButton(cue,"written","I've updated my actual IA")+'</div></div>':"")+'</div>';
 }
 function writingMoment(node){
  const s=getState(),ui=s.completion.guidanceUi,all=eligibleWritingCues(s,node);
  if(!all.length)return"";
  const quiet=quietAutoWritingCue(s,node),expanded=ui.expanded;
  if(quiet&&!expanded)return '<div class="guidance-quiet">'+trigger("guidance-more","Review optional writing guidance")+'</div>';
  const selected=all.find(c=>c.key===ui.selectedKey)||all[0];
  return '<section class="guidance-writing" aria-label="Contextual writing advice">'+
    '<div class="guidance-heading"><strong>'+icon("pen-line")+' Useful writing moment</strong>'+
    '<span>Optional · in the right place</span></div>'+
    cueCard(selected)+
    (all.length>1?'<div class="guidance-more">'+
      trigger("guidance-more",expanded?"Hide other suggestions":"Other relevant advice ("+(all.length-1)+")")+
      (expanded?'<div class="guidance-other">'+all.filter(c=>c.key!==selected.key).slice(0,6).map(c=>
         '<button type="button" class="guidance-other-button" data-action="guidance-select" data-guidance-key="'+e(c.key)+'">'+
         '<strong>'+e(c.location)+'</strong><span>'+e(readable(c.message,135))+'</span></button>').join("")+'</div>':"")+'</div>':"")+
    '</section>';
 }
 function mathsHelp(node){
  const state=getState(),list=relevantMathsGuidance(state,node);
  if(!list.length)return"";
  const expanded=state.completion.guidanceUi.mathsExpanded;
  return '<section class="guidance-optional" aria-label="Optional mathematics help">'+
    trigger("guidance-maths-toggle",(expanded?"Hide":"Help with")+" mathematical understanding")+
    (expanded?'<div class="guidance-maths-questions">'+list.slice(0,3).map(x=>
      '<div><p>'+e(x.question)+'</p>'+tiny(x.avoid||"Use this guidance only where it applies to your real mathematics.")+'</div>').join("")+
      '<p class="guidance-small">This is private thinking help, not extra maths to include for marks. Check syllabus details with your teacher where uncertain.</p></div>':"")+
    '</section>';
 }
 function limitsHelp(node){
  const state=getState(),ui=state.completion.guidanceUi,matching=relevantLimitations(state,node);
  if(!matching.length&& !["C23","C40","C50"].includes(node))return"";
  const noneKey=limitationContextKey(state,node);
  const suppressed=ui.limitNoneKey===noneKey&&!ui.limitsExpanded;
  if(suppressed)return '<div class="guidance-quiet">'+trigger("guidance-limit-toggle","Review limitations if circumstances changed")+'</div>';
  const show=ui.limitsExpanded,page=Math.max(0,Number(ui.limitPage)||0),
    from=page*3,visible=matching.slice(from,from+3),draft=state.completion.limitationDraft;
  return '<section class="guidance-optional" aria-label="Optional limitations help">'+
    trigger("guidance-limit-toggle",show?"Hide limitations advice":"Would any mathematical limitation actually matter here?")+
    (show?'<div class="guidance-limit-body">'+exampleButton("Compare limitation writing",{topic:"limitations"})+
      tiny("These are possible questions, NOT weaknesses Pathfinder has detected. Choose one only when you can describe a genuine consequence for your investigation.")+
      (visible.length?visible.map(x=>'<div class="guidance-limit-option">'+
        '<strong>'+e(x.question)+'</strong>'+
        '<p>'+e(x.consequence)+'</p>'+
        '<p class="guidance-small">Possible check: '+e(x.check)+'</p>'+
        '<button type="button" class="guidance-link" data-action="guidance-limit-select" data-limit-id="'+e(x.id)+'">This may apply to my work</button>'+
        '</div>').join(""):'<p class="guidance-small">No matching source examples are identified for your confirmed method. You can still record your own limitation.</p>')+
      '<div class="guidance-limit-controls">'+
        trigger("guidance-limit-select","I have another real limitation",' data-limit-id="custom"')+
        (matching.length>3?trigger("guidance-limit-more","Show "+(from+3<matching.length?"more":"first")+" relevant examples"):"")+
        trigger("guidance-limit-none","None of these apply right now")+'</div>'+
      (ui.limitDraftVisible?'<div class="guidance-limit-draft">'+
        '<strong>What really applies in your investigation?</strong>'+
        (draft.id!=="custom"?tiny("Source example "+draft.id+" is a question, not proof that your method has this limitation."):"")+
        input("completion.limitationDraft.explanation","What actually happened or which assumption is limited?","Describe your own actual method, data or result",{type:"textarea",rows:3})+
        input("completion.limitationDraft.consequence","How could this affect a mathematical result or inference?","Explain the effect on this aim, not merely that something was difficult",{type:"textarea",rows:3})+
        input("completion.limitationDraft.mitigation","A real check or honest restriction (optional)","What you actually checked, or what you can reasonably conclude",{type:"textarea",rows:2})+
        input("completion.limitationDraft.location","Where is / will this be discussed? (optional)","e.g. immediately after sampling method or Figure 4")+
        '<div class="button-row">'+
          trigger("guidance-limit-record","Record this limitation")+
          trigger("guidance-limit-cancel","Cancel")+'</div></div>':"")+
      '</div>':"")+
    '</section>';
 }
 function conclusionLimitations(){
  const records=confirmedLimitationsForConclusion(getState());
  if(!records.length)return"";
  return '<div class="guidance-conclusion-limits"><strong>Limitations you previously identified</strong>'+
   tiny("Use only the consequences that materially restrict your final answer. The detailed discussion belongs beside the original method or result.")+
   '<div>'+records.slice(0,9).map(x=>'<p><strong>'+e(readable(x.explanation,140))+'</strong> — '+e(readable(x.consequence,180))+
    (x.location?' <span class="guidance-small">('+e(x.location)+')</span>':"")+'</p>').join("")+'</div></div>';
 }
 function bivariateHelp(node){
  const s=getState(),context=guidanceContext(s,node);
  if(!["C35B","C35P"].includes(node)||!context.scatter)return"";
  const type=context.f.pairedDataType,pattern=context.selectedPattern,detail=context.selectedDetail;
  const ideas=relevantBivariateOptions(s,node);
  let html='<div class="guidance-bivariate"><h3>What could follow from the actual scatter?</h3>'+
   tiny("Only use this section if you have genuine paired data and know what the graph actually shows.")+
   choose("completion.fields.pairedDataType",[
     {value:"paired-numerical",title:"I have paired numerical observations"},
     {value:"categorical",title:"My variables are categorical"},
     {value:"unpaired",title:"The measurements are not matched pairs"},
     {value:"unsure",title:"I still need to check my data"}],{tight:true});
  if(type==="paired-numerical"){
    html+='<div class="guidance-bivariate-details">'+
      input("completion.fields.scatterDetail","If clear, refine what the plot actually shows","",{type:"select",
       options:SCATTER_DETAILS.map(x=>[x[0],x[1]])})+
      input("completion.fields.scatterAimRelevance","Would further mathematics advance the original aim?","",{type:"select",
       options:[["","Not decided"],["yes","Yes — useful"],["no","No — the result may be sufficient"],["unsure","Not sure"]]})+'</div>';
    if(node==="C35P")html+=choose("completion.fields.pmccSignal",[
      {value:"weak-linear",title:"I interpret my actual r as showing weak linear association"},
      {value:"meaningful-linear",title:"I interpret my actual r as meaningful linear association"},
      {value:"uncertain",title:"I need to interpret my actual r more carefully"}],{tight:true});
  }
  if(ideas.length){
    html+=tiny("Optional next QUESTIONS, not instructions to perform a technique:")+
      ideas.slice(0,3).map((x,i)=>'<div class="guidance-bivariate-idea"><p>'+e(x.question)+'</p>'+
        tiny(x.reason)+
        '<button type="button" class="guidance-link" data-action="guidance-bivariate-use" data-index="'+i+'">Use this as a question to consider</button></div>').join("");
  }else if(type==="paired-numerical")html+=tiny("First record the actual pattern, then choose only mathematics that addresses a real unanswered question.");
  else if(type!=="categorical"&&type!=="unpaired")html+=tiny("Confirm the data type before asking Pathfinder for Pearson or modelling suggestions.");
  return html+
    tiny("Correlation alone cannot establish causation. A small Pearson coefficient measures weak LINEAR association; it cannot rule out a curved pattern.")+
    '</div>';
 }
 return{writingMoment,mathsHelp,limitsHelp,bivariateHelp,conclusionLimitations};
}
