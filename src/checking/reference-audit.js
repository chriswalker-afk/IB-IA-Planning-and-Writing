/** Read-only citation and authorship review inside existing D09/D12 records.
 * Pathfinder does not inspect or validate the student's external IA document.
 */
const str=v=>typeof v==="string"?v.trim():"";
const preview=(v,limit=150)=>str(v).slice(0,limit);
const published=f=>["secondary","both"].includes(f?.actualSourceType)||!!str(f?.sourceCitation);
const figureKinds=Object.freeze([
 ["graphStudio","graphFigureId","Graph"],["statStudio","statFigureId","Statistical diagram"],
 ["tableStudio","tableFigureId","Table"],["imageTracer","imageTraceId","Image trace"],
 ["voronoiStudio","voronoiFigureId","Voronoi diagram"],["geometryStudio","geometryFigureId","Geometry figure"],
 ["probabilityStudio","probabilityFigureId","Probability tree"],
 ["distributionStudio","distributionFigureId","Probability distribution"]
]);
/** Hints only: these may not appear in the IA; sources in the IA may be absent here. */
export function citationAuditPointers(state){
 const c=state?.completion||{},items=[],seen=new Set();
 const add=(kind,name,detail)=>{
  const safeName=preview(name,120)||"Source not yet named",safeDetail=preview(detail,200);
  const key=kind+"|"+safeName+"|"+safeDetail;
  if(!seen.has(key)){seen.add(key);items.push({kind,name:safeName,detail:safeDetail});}
 };
 const sources=Array.isArray(c.sourceRecords)?c.sourceRecords:[];
 for(const source of sources){
  const f=source?.fields||{};
  if(published(f))add("Published source",f.actualSource||f.sourceCitation||"Published data",f.sourceCitation||"Original publication details not yet recorded");
 }
 if(!sources.length&&published(c.fields||{})){
  const f=c.fields;
  add("Published source",f.actualSource||f.sourceCitation||"Published data",f.sourceCitation||"Original publication details not yet recorded");
 }
 const entries=Array.isArray(state?.entries)?state.entries:[];
 for(const entry of entries){
  if(entry?.status!=="completed")continue;
  if(["outside","mixed"].includes(entry.knowledge)||str(entry.researchSource)){
   add("Researched mathematics",entry.title||entry.technique||"Mathematical method",
      entry.researchSource||"Check whether the actual IA credits the resource used");
  }
  for(const [studio,ref,title] of figureKinds){
   const id=str(entry[ref]);if(!id)continue;
   const figures=state?.[studio]?.figures;
   const figure=Array.isArray(figures)?figures.find(x=>x?.id===id):null;
   const d=figure?.draft;
   if(d?.sourceKind==="secondary")
    add(title,d.title||entry.title||"Externally sourced figure",
      d.sourceText||d.sourceCredit||"Original image or dataset source not yet recorded");
  }
 }
 return items.slice(0,30);
}
const mlaButton=icon=>'<button type="button" class="btn btn-secondary btn-sm checking-mla-guide" data-action="resource-open" data-resource-id="mla-citations">'+icon("book")+' Open MLA guide</button>';
/** Visible on draft and final Checking; not a parallel checklist or verification tool. */
export function renderCitationSpotlight(mode,icon){
 if(!["draft","final"].includes(mode))return "";
 return '<section class="checking-mla-spotlight" data-checking-mla-spotlight aria-label="MLA citation review">'+
  '<div class="checking-mla-spotlight-copy"><strong>'+icon("book")+' Check references in both directions</strong>'+
  '<p>Use MLA in your actual IA. Trace each in-text citation to Works Cited and each Works Cited entry back to something you actually used.</p></div>'+
  '<div class="checking-mla-actions"><a class="btn btn-quiet btn-sm" href="#checking-audit-'+mode+'">Go to source check '+icon("arrow-right")+'</a>'+
  mlaButton(icon)+'</div></section>';
}
export function renderCitationAudit(state,icon,e){
 const pointers=citationAuditPointers(state);
 const named=pointers.length?'<div class="checking-mla-pointers">'+
  '<strong>Notes you may want to trace</strong>'+
  '<p>These were saved in Pathfinder; they are <em>not</em> verified citations or proof they appear in your IA. Also check every source in the actual document.</p>'+
  '<ul>'+pointers.slice(0,6).map(item=>'<li><span>'+e(item.kind)+'</span><strong>'+e(item.name)+'</strong>'+
   (item.detail?'<small>'+e(item.detail)+'</small>':'')+'</li>').join('')+'</ul>'+
  (pointers.length>6?'<p>Plus '+e(String(pointers.length-6))+' more recorded items. Inspect the actual IA for the complete list.</p>':'')+
  '</div>':
  '<p class="checking-mla-empty">No external-source notes were found in Pathfinder. This does <strong>not</strong> mean your actual IA contains nothing to cite.</p>';
 return '<section class="checking-mla-audit" data-checking-mla-audit aria-label="Source-by-source MLA cross-check">'+
  '<h5>Audit each source in your actual IA</h5>'+
  '<ol>'+
   '<li><strong>Scan the body.</strong> Identify outside data, figures, quoted or paraphrased ideas, unfamiliar mathematical methods and externally generated material actually used. Cite them at the point of use.</li>'+
   '<li><strong>Text → Works Cited.</strong> For every in-text MLA citation, find the corresponding entry at the end. Then check that its author or organisation, title, date and URL or publication details lead to the real source.</li>'+
   '<li><strong>Works Cited → text.</strong> Work back through every entry. Delete material never used or cited. Google Docs may include saved citation sources even when they were not cited in the text.</li>'+
   '<li><strong>Recheck after edits.</strong> Replace any # page-number placeholder, check figure/source captions, and rebuild the Google Docs bibliography if the source list has changed.</li>'+
  '</ol>'+
  '<p class="checking-mla-example"><strong>Mini example:</strong> A World Bank dataset used in a graph needs an appropriate in-text citation (World Bank) and a matching <em>Works Cited</em> entry identifying the actual dataset. A graph made by you does not make its data yours.</p>'+
  named+
  '<p class="checking-mla-evidence"><strong>What to record below:</strong> The page or section you audited, a short note confirming the two-way check (or identifying gaps), and the precise correction if needed. Pathfinder never reads your Word or Google Docs IA.</p>'+
  mlaButton(icon)+'</section>';
}
export function renderAuthenticityAudit(icon){
 return '<section class="checking-authenticity-audit" data-checking-authenticity-audit aria-label="Student authorship and ethical-use review">'+
  '<strong>Check authenticity in the actual document</strong>'+
  '<ul><li>Can I explain the mathematical decisions, calculations, conclusions and reflection as my own work?</li>'+
  '<li>Have I credited externally sourced methods, calculations, data and visuals where used? The separate D09 MLA check deals with the exact citations.</li>'+
  '<li>If I used AI-generated material or other assistance, did I follow current school permissions and the IB acknowledgement requirements? A citation alone does not make an otherwise prohibited use acceptable.</li>'+
  '<li>Have I respected permissions, consent and participant privacy where relevant, and removed unsupported claims about data collection?</li></ul>'+
  '<p>Record where you checked or what you fixed in this same D12 review record. Being authentic is an obligation, not an additional assessed criterion.</p></section>';
}
