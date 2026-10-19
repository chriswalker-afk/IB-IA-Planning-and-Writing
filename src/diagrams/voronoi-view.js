import {representationEmpty} from "./workspace-ui.js";
import {renderPresentationCoach,renderFigureHandover} from "./presentation-coach-view.js";
/** One coherent, student-readable Voronoi authoring surface, with no invented sites. */
import {analyzeVoronoi,MAX_VORONOI_FIGURES} from "./voronoi-core.js";
import {renderVoronoiSvg} from "./voronoi-render.js";
import {originalVoronoiDraft,voronoiInspection,voronoiComparison} from "./voronoi-interactions.js";
const opt=(value,label,selected,e)=>'<option value="'+e(value)+'"'+(String(value)===String(selected)?" selected":"")+'>'+e(label)+'</option>';
const select=(key,name,value,options,e)=>'<label class="voronoi-field"><span>'+e(name)+'</span><select data-voronoi-field="'+key+'">'+
 options.map(([v,l])=>opt(v,l,value,e)).join("")+'</select></label>';
const field=(key,label,value,e,{placeholder="",rows=0,hint=""}={})=>
 '<label class="voronoi-field"><span>'+e(label)+'</span>'+
 (rows?'<textarea data-voronoi-field="'+key+'" rows="'+rows+'" placeholder="'+e(placeholder)+'">'+e(value)+'</textarea>':
  '<input type="text" data-voronoi-field="'+key+'" value="'+e(value)+'" placeholder="'+e(placeholder)+'" autocomplete="off">')+
 (hint?'<small>'+e(hint)+'</small>':"")+'</label>';
const check=(key,label,checked)=>'<label class="voronoi-check"><input type="checkbox" data-voronoi-field="'+key+'"'+(checked?" checked":"")+'><span>'+label+'</span></label>';
const section=(n,title,description,html)=>
 '<section class="voronoi-panel"'+(n==="1"?' data-representation-step="create"':n==="2"?' data-representation-step="refine"':"")+'><h3><span class="voronoi-step">'+n+'</span>'+title+'</h3>'+
 (description?'<p class="voronoi-description">'+description+'</p>':"")+html+'</section>';
const groups={
 voronoi:"Locations and Voronoi diagrams",
 triangulation:"Measurement and triangulation",
 images:"Modelling shapes from images",
 optimisation:"Optimising a design",
 relationships:"Relationships between two variables",
 finance:"Business and financial decisions"
};
const TOOLS=[
 ["existing","Place existing","plus-circle"],
 ["select","Move / edit","mouse-pointer-click"],
 ["inspect","Inspect cells","eye"],
 ["test","Test location","map"],
 ["candidate","Place proposed","plus-circle"]
];
const tidy=n=>Number.isFinite(n)?Number(n.toPrecision(5)).toString():"—";
export function voronoiInspectionHtml(studio,icon=()=>"",e=x=>String(x)){
 const info=voronoiInspection(studio);
 if(!info)return '<div class="voronoi-inspect-hint" data-voronoi-inspection>'+
  'Select a site or its cell to inspect coordinates, clipped area and the nearest neighbour.</div>';
 const {site,cell,neighbours,bisector}=info;
 const unit=studio.draft.unitMode==="unit"?e(studio.draft.unit):"coordinate units";
 return '<section class="voronoi-inspection" data-voronoi-inspection aria-live="polite">'+
  '<div class="voronoi-inspection-heading"><strong>'+e(site.name)+'</strong>'+
   '<small>'+(site.kind==="candidate"?"Hypothetical proposal":"Existing / defined site")+'</small></div>'+
  '<p>Site coordinates: <strong>('+tidy(site.x)+', '+tidy(site.y)+')</strong></p>'+
  (cell?'<p>Clipped region area: <strong>'+tidy(cell.area)+'</strong> '+unit+
   '² · '+cell.polygon.length+' vertices</p>':
   '<p>Add another distinct site to construct the cells.</p>')+
  (bisector?'<p>Closest other site: <strong>'+e(bisector.other.name)+'</strong>, distance <strong>'+
   tidy(neighbours[0].distance)+'</strong> '+unit+'</p>'+
   '<p class="voronoi-math">Perpendicular bisector with '+e(bisector.other.name)+
   ': ('+tidy(bisector.normal.x)+')(x − '+tidy(bisector.midpoint.x)+') + ('+
    tidy(bisector.normal.y)+')(y − '+tidy(bisector.midpoint.y)+') = 0</p>'+
   '<button type="button" class="btn btn-secondary btn-sm" data-action="voronoi-bisector-selected">'+
    icon("eye")+' Show this bisector</button>':"")+
  '<p class="voronoi-inspect-limit">All areas refer to the displayed rectangle, not necessarily an actual geographical boundary.</p>'+
 '</section>';
}
export function voronoiComparisonHtml(studio,icon=()=>"",e=x=>String(x)){
 const result=voronoiComparison(studio);
 if(!result)return "";
 const unit=studio.draft.unitMode==="unit"?e(studio.draft.unit)+"²":"coordinate units²";
 return '<section class="voronoi-comparison" data-voronoi-comparison>'+
  '<div class="voronoi-inspection-heading"><strong>'+icon("layers")+' Before / after comparison</strong>'+
   '<small>Same rectangular window</small></div>'+
  '<p>The original configuration is preserved. Proposed sites are hypothetical, not collected evidence.</p>'+
  '<div class="voronoi-comparison-table"><table><thead><tr><th>Site</th><th>Original</th><th>What-if</th><th>Change</th></tr></thead><tbody>'+
  result.changes.map(row=>'<tr><td>'+e(row.name)+(row.kind==="candidate"?' <em>Proposed</em>':"")+'</td>'+
   '<td>'+(row.before===null?"—":tidy(row.before))+'</td><td>'+tidy(row.after)+'</td>'+
   '<td>'+(row.delta===null?"new":(row.delta>0?"+":"")+tidy(row.delta))+'</td></tr>').join("")+
  '</tbody></table></div><small>Clipped areas in '+unit+'. Results depend on the study window.</small>'+
 '</section>';
}
export function voronoiPreviewHtml(studio,icon=()=>"",e=x=>String(x)){
 const original=studio.scenario?.active&&studio.scenario.showOriginal;
 const draft=original?originalVoronoiDraft(studio):studio.draft;
 const tools=TOOLS.map(([id,label,glyph])=>'<button type="button" class="voronoi-tool'+
  (!original&&studio.tool===id?" active":"")+'" data-action="voronoi-tool" data-voronoi-tool="'+id+
  '" aria-pressed="'+(!original&&studio.tool===id)+'"'+(original||studio.scenario?.active&&id==="existing"?" disabled":"")+'>'+
  icon(glyph)+'<span>'+e(label)+'</span></button>').join("");
 const history='<div class="voronoi-history-controls" role="group" aria-label="Undo and view">'+
  '<button type="button" class="btn btn-quiet btn-sm" data-action="voronoi-undo"'+
   (!studio.history?.past?.length||original?" disabled":"")+'>'+icon("undo-2")+' Undo</button>'+
  '<button type="button" class="btn btn-quiet btn-sm" data-action="voronoi-redo"'+
   (!studio.history?.future?.length||original?" disabled":"")+'>'+icon("rotate-cw")+' Redo</button>'+
  '<button type="button" class="btn btn-quiet btn-sm" data-action="voronoi-fit"'+
   (!studio.draft.sites.length||studio.scenario?.active?" disabled":"")+'>'+icon("grid-2x2")+' Fit sites</button></div>';
 const scenario=studio.scenario?.active?
  '<div class="voronoi-scenario-bar"><strong>'+icon("layers")+' What-if comparison</strong>'+
   '<div><button type="button" class="btn btn-secondary btn-sm" data-action="voronoi-scenario-view">'+
    (original?"Show changes":"Show original")+'</button>'+
   '<button type="button" class="btn btn-quiet btn-sm" data-action="voronoi-scenario-restore">Restore original</button>'+
   '<button type="button" class="btn btn-secondary btn-sm" data-action="voronoi-scenario-keep">Keep what-if version</button></div></div>':
  '<div class="voronoi-scenario-start"><span>Compare proposed locations without losing the original.</span>'+
  '<button type="button" class="btn btn-secondary btn-sm" data-action="voronoi-scenario-start"'+
   (studio.draft.sites.length<2?" disabled":"")+'>'+icon("layers")+' Start comparison</button></div>';
 const help={existing:"Click the grid to place an existing / defined site. Confirm your source before export.",
  select:"Select a site, then drag it or edit its coordinates. Changes to measured positions must be documented.",
  inspect:"Select a coloured cell or site to inspect its geometry and perpendicular bisector.",
  test:"Click a location to calculate the nearest site and its Euclidean distance.",
  candidate:"Click to add a hypothetical site. Do not report it as an observed location."};
 return '<div class="voronoi-preview" data-voronoi-preview>'+
  '<div class="voronoi-preview-heading"><strong>Build your Voronoi diagram</strong><small>Equal x/y scale · '+
   studio.draft.sites.length+' sites</small></div>'+
  '<div class="voronoi-canvas-toolbar" role="toolbar" aria-label="Voronoi drawing tools">'+tools+'</div>'+
  history+scenario+
  '<p class="voronoi-canvas-help" role="status">'+(original?
    "Viewing the original. Choose Show changes to return to your proposal.":help[studio.tool]||help.existing)+'</p>'+
  '<div class="voronoi-svg-wrap">'+renderVoronoiSvg(draft,{interactive:!original,selectedSiteId:studio.selectedSiteId,
   cursor:studio.keyboardCursor,cursorVisible:studio.cursorVisible})+'</div>'+
  '<p>Keyboard: Tab to the grid, use arrow keys to position the orange cursor and Enter to place or test. You can also type exact coordinates. Cells are clipped to a rectangle; a working window is not automatically a real study boundary.</p>'+
  voronoiInspectionHtml(studio,icon,e)+voronoiComparisonHtml(studio,icon,e)+'</div>';
}
export function voronoiResultHtml(studio,e){
 const q=analyzeVoronoi(studio.draft),unit=q.draft.unitMode==="unit"?" "+e(q.draft.unit):"";
 if(!q.cells.length)return '<p class="voronoi-muted">Place a second distinct site to construct Voronoi cells. Confirm coordinates, source, metric and study limits before exporting.</p>';
 const list=q.cells.map((c,i)=>'<tr><td>'+e(c.name)+(c.site.kind==="candidate"?
  ' <em>(proposed)</em>':"")+'</td><td>'+c.polygon.length+'</td>'+
  '<td>'+Number(c.area.toPrecision(5))+(unit?" "+unit+"²":"")+'</td></tr>').join("");
 return '<p class="voronoi-stats-lead">'+q.cells.length+' sites · '+
  (q.draft.regionMode==="manual"?"Specified study rectangle":q.draft.regionMode==="interactive"?"Working coordinate window":"Automatic viewing window")+
  ' · Area '+Number(q.domainArea.toPrecision(5))+(unit?unit+"²":"")+'</p>'+
  '<div class="voronoi-summary-table-wrap"><table class="voronoi-summary-table"><thead><tr><th>Site</th><th>Cell vertices</th><th>Clipped area</th></tr></thead><tbody>'+
  list+'</tbody></table></div>'+
  (q.nearest?'<p class="voronoi-nearest"><strong>Test location:</strong> Nearest '+e(q.nearest.tied.join(" / "))+
   ' at '+Number(q.nearest.distance.toPrecision(5))+unit+(q.nearest.tied.length>1?" (equal-distance boundary)":"")+'</p>':"")+
  '<p class="voronoi-muted">The area values only describe the clipped study rectangle; they do not estimate population, journey time or service demand. Keep this full table in working files unless individual values are essential to your IA argument.</p>';
}
export function voronoiQualityHtml(studio,icon,e){
 const q=analyzeVoronoi(studio.draft);
 return '<div class="voronoi-quality-head"><strong>'+icon(q.ready?"check-circle":"alert-circle")+' Geometry and IB presentation checks</strong>'+
 '<span class="graph-quality-status '+(q.ready?"pass":"attention")+'">'+(q.ready?"Required checks passed":q.errors.length+" to fix")+'</span></div>'+
 (q.errors.length||q.warnings.length?'<ul class="voronoi-issues">'+
 q.errors.map(v=>'<li class="problem">'+icon("x-circle")+' '+e(v.message)+'</li>').join("")+
 q.warnings.map(v=>'<li class="warning">'+icon("alert-triangle")+' '+e(v.message)+'</li>').join("")+
 '</ul>':'<p>All required mathematical, source, labelling and projection checks pass.</p>')+
 '<p class="voronoi-muted">This checks diagram integrity, not an IB mark or the suitability of the full exploration. A constructed diagram does not prove that a site is optimal.</p>';
}
export function voronoiOutputHtml(studio,icon){
 const disabled=analyzeVoronoi(studio.draft).ready?"":' disabled title="Complete the mathematical and source checks before saving or exporting"';
 return '<button type="button" class="btn btn-primary" data-action="voronoi-use"'+disabled+'>'+
  icon("check-circle")+' Save and link to my first mathematics</button>'+
  '<div class="voronoi-exports">'+
  [["voronoi-save","Save editable figure","layers"],["voronoi-svg","Download SVG","download"],
    ["voronoi-png","Download PNG","download"],["voronoi-csv","Sites + areas CSV","table"],
    ["voronoi-copy","Copy PNG","copy"]].map(([action,label,i])=>
   '<button type="button" class="btn btn-secondary btn-sm" data-action="'+action+'"'+disabled+'>'+icon(i)+label+'</button>').join("")+
  '</div><p>Place the figure <strong>after</strong> introducing it in your IA. Describe the coordinates, perpendicular-bisector principle, study boundary, limitations and what the construction reveals about your aim.</p>';
}
function siteEditor(studio,e,icon){
 const d=studio.draft;
 if(!d.sites.length)return representationEmpty(icon,e,{symbol:"map",title:"Start by clicking the grid",description:"Choose Place existing, then click the blank coordinate plane. No spreadsheet is needed."});
 return '<div class="voronoi-site-editor" data-voronoi-site-editor aria-label="Edit site positions">'+
 d.sites.map((site,i)=>{
  const locked=studio.scenario?.active&&site.kind==="observed"?" disabled":"";
  return '<div class="voronoi-site-row'+(studio.selectedSiteId===site.id?" selected":"")+'">'+
  '<button type="button" class="voronoi-site-select" data-action="voronoi-select-site" data-site-index="'+i+
   '" aria-label="Select '+e(site.name)+'">'+icon("eye")+'</button>'+
  '<label><span>Name</span><input type="text"'+locked+' data-voronoi-site="'+i+
   '" data-voronoi-site-key="name" value="'+e(site.name)+'" aria-label="Site '+(i+1)+' name"></label>'+
  '<label><span>x</span><input type="number" step="any"'+locked+' data-voronoi-site="'+i+
   '" data-voronoi-site-key="x" value="'+(site.x??"")+'" aria-label="Site '+(i+1)+' x coordinate"></label>'+
  '<label><span>y</span><input type="number" step="any"'+locked+' data-voronoi-site="'+i+
   '" data-voronoi-site-key="y" value="'+(site.y??"")+'" aria-label="Site '+(i+1)+' y coordinate"></label>'+
  '<label><span>Type</span><select'+locked+' data-voronoi-site="'+i+'" data-voronoi-site-key="kind">'+
   opt("observed","Existing / defined",site.kind,e)+opt("candidate","Proposed",site.kind,e)+'</select></label>'+
  '<button type="button" class="btn btn-quiet btn-sm" data-action="voronoi-delete-site" data-site-index="'+i+'"'+locked+
   ' aria-label="Remove '+e(site.name)+'">Remove</button></div>';
 }).join("")+'</div>';
}
function siteInput(studio,e,icon){
 const d=studio.draft;
 return '<div class="voronoi-add-grid">'+
 field("addName","Name (optional)",d.addName,e,{placeholder:"Site A"})+
 field("addX","x coordinate",d.addX,e,{placeholder:"e.g. 3.5"})+
 field("addY","y coordinate",d.addY,e,{placeholder:"e.g. 8.0"})+
 select("addType","Location type",d.addType,[["observed","Existing / defined site"],["candidate","Proposed (hypothetical)"]],e)+
 '</div><div class="voronoi-inline-actions">'+
 '<button type="button" class="btn btn-secondary btn-sm" data-action="voronoi-add-site">'+icon("plus-circle")+' Add coordinates</button>'+
 '</div><p class="voronoi-small">These cells and the canvas edit the same data. Existing / defined positions require a real source. Proposed sites are a what-if, not evidence of existing facilities.</p>';
}
export function renderVoronoiStudio(state,icon,e){
 const studio=state.voronoiStudio,d=studio.draft,route=state.planning?.routeExplorer?.selectedRoute;
 const bounds=["manual","interactive"].includes(d.regionMode)?'<div class="voronoi-four">'+
 field("xMin","Left boundary",d.xMin,e,{placeholder:"0"})+field("xMax","Right boundary",d.xMax,e,{placeholder:"100"})+
 field("yMin","Bottom boundary",d.yMin,e,{placeholder:"0"})+field("yMax","Top boundary",d.yMax,e,{placeholder:"60"})+'</div>':"";
 const options=d.sites.map((s,i)=>[String(i),s.name]);
 return '<section data-voronoi-studio class="voronoi-studio representation-studio" aria-label="Voronoi Studio">'+
 '<header class="voronoi-header"><div><span class="intro-writing-guide-eyebrow">'+icon("map")+' VORONOI STUDIO</span>'+
 '<h2>Which site is nearest — and what does that really mean?</h2>'+
 '<p>Build mathematically accurate Voronoi cells from real Cartesian coordinates, then explore distances and justified hypothetical sites.</p></div>'+
 '<button type="button" class="btn btn-quiet btn-sm" data-action="voronoi-close">'+icon("x")+' Back to representation choices</button></header>'+
 (groups[route]?'<aside class="voronoi-context"><strong>From your investigative pathway:</strong> '+e(groups[route])+
  '. A straight-line nearest-site region is a model, not automatically a road catchment, population distribution or optimal solution.</aside>':"")+
 '<div class="voronoi-layout"><div class="voronoi-controls">'+
 section("1","Bring in your site coordinates",
  "Click the coordinate grid to add sites, or use the editor below. Existing datasets can still be imported.",
  field("raw","Paste genuine sites from Google Sheets",d.raw,e,{rows:5,placeholder:"Site\\tx (km)\\ty (km)\\nA\\t2\\t3\\nB\\t7\\t6"})+
  '<div class="voronoi-inline-actions"><button type="button" class="btn btn-secondary btn-sm" data-action="voronoi-parse">'+icon("clipboard")+' Read pasted sites</button>'+
  '<button type="button" class="btn btn-quiet btn-sm" data-action="voronoi-upload">'+icon("upload")+' Import CSV / TSV</button></div>'+
  select("headers","First row of pasted range",d.headers,[["yes","Has column headings"],["no","Contains actual site data"]],e)+
  (d.sites.length?'<p class="voronoi-imported">'+icon("check-circle")+' '+d.sites.length+' site(s) in the working diagram'+
    (d.pendingPaste?' — newer pasted text needs reading.':'.')+'</p>':"")+
  siteEditor(studio,e,icon)+
  '<div class="voronoi-divider"><strong>Or add precise coordinates</strong></div>'+siteInput(studio,e,icon))+
 section("2","Scale, labels and mathematical assumptions",
  "Both axes have equal physical scale. Confirm the units and distance interpretation before using your figure in an IA.",
  field("title","Descriptive figure title",d.title,e,{placeholder:"e.g. Straight-line service areas around local facilities"})+
   field("figureNumber","Figure number in my IA",d.figureNumber,e,{placeholder:"e.g. 1"})+
  '<div class="voronoi-two">'+field("xLabel","Horizontal axis",d.xLabel,e)+field("yLabel","Vertical axis",d.yLabel,e)+'</div>'+
  select("unitMode","Coordinates and units",d.unitMode,[["unsure","Confirm the unit"],["unit","Both axes have the same distance unit"],["dimensionless","Dimensionless Cartesian units"]],e)+
  (d.unitMode==="unit"?field("unit","Unit on both axes",d.unit,e,{placeholder:"km, m, etc."}):"")+
  select("coordSystem","What coordinate system are these?",d.coordSystem,[["unsure","Choose coordinate system"],
   ["cartesian","Flat Cartesian or suitably projected coordinates"],["latlon","Latitude and longitude in degrees (must convert first)"]],e)+
  check("metricConfirmed","Straight-line (Euclidean) distance is a justified first model for my aim",d.metricConfirmed)+
  '<p class="voronoi-small">If travel times, roads or obstacles matter, discuss why a straight-line construction might fail. If you start with geographic latitude/longitude, convert to an appropriate planar projection before calculating distances.</p>'+
  select("sourceKind","Source of site coordinates",d.sourceKind,[["unsure","Choose origin"],["primary","Coordinates I measured or defined"],["secondary","Published or externally provided coordinates"]],e)+
  (d.sourceKind==="secondary"?field("sourceCredit","Coordinate data citation",d.sourceCredit,e,{placeholder:"Dataset, publisher and access details"}):"")+
  select("regionMode","Where do the cells end?",d.regionMode,[["auto","Automatically fitted viewing rectangle"],
   ["interactive","Fixed working rectangle (not an actual boundary)"],
   ["manual","My justified rectangular study area"]],e)+bounds+
  '<p class="voronoi-small">The area and shape of clipped cells depend on this rectangle. An automatically chosen box should never be described as a real geographical boundary.</p>')+
 section("3","Optional map background",
  "Overlay a locally uploaded, scale-calibrated map image. No mapping service or personal coordinates are transmitted.",
  '<div class="voronoi-inline-actions"><button type="button" class="btn btn-secondary btn-sm" data-action="voronoi-map-upload">'+icon("image")+' Upload map / photograph</button>'+
   (d.mapSrc?'<button type="button" class="btn btn-quiet btn-sm" data-action="voronoi-map-clear">'+icon("x")+' Remove image</button>':"")+'</div>'+
  (d.mapSrc?'<p class="voronoi-imported">Image: '+e(d.mapName)+' ('+d.mapWidth+' × '+d.mapHeight+' pixels)</p>'+
    field("mapCredit","Source / citation for the map",d.mapCredit,e,{placeholder:"My annotated scale map, or publisher and URL"})+
    select("mapOpacity","Map visibility",String(d.mapOpacity),[["0.25","Faint"],["0.42","Medium"],["0.6","Strong"],["0.8","Very strong"]],e)+
    check("mapConfirmed","I have verified that the image edges match my manual rectangular coordinate bounds, without perspective distortion.",d.mapConfirmed)+
    '<p class="voronoi-small">For a valid overlay, set the exact x/y bounds represented by the left, right, bottom and top edges. Image and coordinate aspect ratios must agree within 5%.</p>':
    '<p class="voronoi-small">Optional. You do not need a background map for a correct coordinate-based Voronoi construction.</p>'))+
 section("4","Explain the mathematical construction",
  "Try a perpendicular bisector, measure the nearest site to a test location and decide what that means in the context of your aim.",
  '<div class="voronoi-two">'+
  field("probeX","Test point x (optional)",d.probeX,e,{placeholder:"e.g. 6.2"})+
  field("probeY","Test point y (optional)",d.probeY,e,{placeholder:"e.g. 4.9"})+'</div>'+
  check("showBisector","Show a selected perpendicular bisector",d.showBisector)+
  (d.showBisector&&d.sites.length>=2?'<div class="voronoi-two">'+
   select("pairA","First site",String(d.pairA),options,e)+select("pairB","Second site",String(d.pairB),options,e)+'</div>':"")+
  '<div class="voronoi-two">'+check("showGrid","Show a coordinate grid",d.showGrid)+
  check("showSites","Show site markers",d.showSites)+
  check("showLabels","Show site names",d.showLabels)+
  check("showAreas","Label cell areas within the study rectangle",d.showAreas)+'</div>'+
  field("note","Short caption or limitation to explain in your IA",d.note,e,{rows:2,placeholder:"What would change if roads, demand or a different boundary were considered?"}))+
 '</div><div class="voronoi-results">'+voronoiPreviewHtml(studio,icon,e)+
 '<section class="voronoi-summary" data-voronoi-summary><h3>Explore your actual results</h3>'+voronoiResultHtml(studio,e)+'</section>'+
 '<section class="voronoi-quality" data-voronoi-quality>'+voronoiQualityHtml(studio,icon,e)+'</section>'+
  renderPresentationCoach(state,"voronoi",d,icon,e)+
 '<section class="voronoi-output" data-voronoi-output data-representation-step="use">'+voronoiOutputHtml(studio,icon)+'</section>'+
  renderFigureHandover(state,"voronoi",d,icon,e)+
 '<p class="voronoi-ia-note"><strong>When writing the IA:</strong> Introduce the figure before showing it. Explain the perpendicular-bisector construction where appropriate, then interpret nearest-site results, assumptions and limitations against your actual aim. These automatically calculated cells do not complete your mathematics for you.</p>'+
 '</div></div>'+
 (studio.figures.length?'<details class="voronoi-saved"><summary>'+icon("layers")+' Saved Voronoi figures ('+studio.figures.length+')</summary>'+
 '<div>'+studio.figures.map(fig=>'<div class="voronoi-saved-row"><span><strong>'+e(fig.draft.title||"Untitled figure")+
 '</strong><small>'+e(fig.savedAt.slice(0,10))+(fig.entryId?" · linked to mathematics":"")+'</small></span>'+
 '<button type="button" class="btn btn-secondary btn-sm" data-action="voronoi-load" data-voronoi-id="'+e(fig.id)+'">Edit saved figure</button></div>').join("")+'</div></details>':"")+
 '<div class="voronoi-new"><span>Up to '+MAX_VORONOI_FIGURES+' saved diagrams without deleting previous work.</span>'+
 '<button type="button" class="btn btn-quiet btn-sm" data-action="voronoi-new">'+icon("plus-circle")+' Start a different Voronoi diagram</button></div>'+
 '</section>';
}
