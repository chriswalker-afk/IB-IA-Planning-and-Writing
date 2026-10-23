/** Single source-aware entry to the MLA tutorial. Never auto-cites or edits IA fields.
 * Essential source reminders remain compact under Reduce advice; optional
 * writing tips disappear. No unknown source is treated as verified evidence.
 */
const present=value=>typeof value==="string"&&!!value.trim();
const plannedExternal=s=>["secondary","both"].includes(s?.planning?.fields?.dataSource);
const actualExternal=s=>{
 const f=s?.completion?.fields||{};
 return ["secondary","both"].includes(f.actualSourceType)||
   present(f.sourceCitation)&&f.actualSourceType!=="theoretical";
};
const relevantExternal=s=> {
 const type=s?.completion?.fields?.actualSourceType;
 return (type==="primary"||type==="theoretical")?false:actualExternal(s)||plannedExternal(s);
};
const linkedExternal=(s,entry)=>{
 const ids=entry?.sourceRefs;
 if(!Array.isArray(ids)||!ids.length)return false;
 return (s?.completion?.sourceRecords||[]).some(source=>
  ids.includes(source.id)&&
  (["secondary","both"].includes(source.fields?.actualSourceType)||
    present(source.fields?.sourceCitation)));
};
const hint=(title,brief,more,{essential=true}={})=>({title,brief,more,essential});
export function citationContext(state,moment,{entry=null,draft=null,type=""}={}){
 const p=state?.planning?.fields||{};
 switch(moment){
  case "planning-choice":
   return plannedExternal(state)?hint("Keep the original source",
    "If you use published data, save its publisher and link now so you can cite the exact dataset later.",
    "You will add the MLA in-text citation and Works Cited entry in your actual IA, not in this planning form.",
    {essential:false}):null;
  case "planning-secondary":
   return hint("Save details for MLA",
    "Record the original publisher and dataset link. If you use these values, cite their source where the data enter your IA.",
    "Check the exact dataset title, publishing organisation, relevant date, variables and access information against the original page. A candidate source is not yet verified.");
  case "introduction":
   return hint("Borrowed context needs a source",
    "If your introduction uses someone else's facts, words, images or mathematical ideas, cite them beside the relevant passage.",
    "Your own motivation and aim do not need references. Avoid a long background literature review; credit only outside material actually used.",
    {essential:false});
  case "first-maths":
   return relevantExternal(state)?hint("Cite published starting material",
    "If your first mathematics uses external data, identify the original dataset in the IA and add its MLA citation there.",
    "Planning details and the source note here do not insert an in-text citation into Google Docs. Check the actual source and add a matching Works Cited entry."):null;
  case "show-first":
   return relevantExternal(state)||linkedExternal(state,entry)?hint("Credit the data behind this mathematics",
    "If this calculation or figure uses published observations, cite their original source where you introduce them.",
    "A self-made graph or calculation can still depend on borrowed data. Explain your own mathematical processing separately from the citation."):null;
  case "mathematical-stage":
   return entry&&(linkedExternal(state,entry)||
       ["mixed","outside"].includes(entry.knowledge)||present(entry.researchSource))?
    hint("Credit what this stage borrows",
      linkedExternal(state,entry)?
       "Cite the original data or resource used at this stage; your analysis of it should remain your own.":
       "If this stage uses an independently learned technique, credit the source and explain the unfamiliar mathematics yourself.",
      "An ordinary IB course formula does not need a textbook citation simply for being used. Borrowed derivations, methods or external datasets do, and their Works Cited entries must be traceable."):null;
  case "unfamiliar-maths":
   return entry?.knowledge==="syllabus"&&!present(entry?.researchSource)?null:
    hint("Reference unfamiliar mathematics",
      "When you rely on a book, paper or tutorial for a new method, cite that source where you use it and demonstrate your own understanding.",
      "Name the part that was new to you and explain why it works in this investigation. A link alone does not demonstrate mathematical understanding.");
  case "figure":
   if(draft?.sourceKind!=="secondary")return null;
   const material=type==="trace"?"published image":type==="probability"?"published probabilities":"external data or image";
   return hint("Credit this figure's original source",
     "This figure uses a "+material+". Cite the original material in the IA and include it in Works Cited.",
     "The figure label produced by Pathfinder is not itself a complete MLA citation. Verify its credit line and cite the source in Google Docs where the figure or input is discussed.");
  default:return null;
 }
}
export function renderCitationReminder(state,moment,icon,e,options={}){
 const context=citationContext(state,moment,options);
 const reduced=state?.ui?.adviceMode==="reduced";
 if(!context||(reduced&&!context.essential))return "";
 return '<aside class="citation-moment" data-citation-moment="'+e(moment)+'" data-citation-reduced="'+reduced+
   '" aria-label="Source referencing reminder">'+
  '<div class="citation-moment-head"><span class="citation-moment-icon">'+icon("book")+'</span><div class="citation-moment-copy">'+
  '<strong>'+e(context.title)+'</strong><p>'+e(context.brief)+'</p></div></div>'+
  '<button type="button" class="btn btn-quiet btn-sm citation-moment-link" data-action="resource-open" data-resource-id="mla-citations">'+
    'Open MLA guide '+icon("arrow-right")+'</button>'+
  (!reduced?'<details class="citation-moment-detail"><summary>More about this citation</summary><p>'+e(context.more)+'</p></details>':"")+
  '</aside>';
}
