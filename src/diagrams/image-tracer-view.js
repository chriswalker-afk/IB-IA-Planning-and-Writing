/** Image tracing studio: coordinate calibration and careful IB-style mathematical communication. */
import {
 imageTraceChecks,traceCoordinates,traceCalibration,tracedMeasurements,
 renderTraceOverlaySvg,renderCleanTraceSvg,MAX_TRACE_FIGURES
} from "./image-tracer-core.js";
const routes={
 trajectories:"Mark observed positions at measured intervals, then distinguish physical units from image pixels. A side-on photograph usually produces more reliable coordinates.",
 images:"Photograph a flat surface front-on with a ruler in the same plane. Choose outline points thoughtfully; a fitted function will require separate justification.",
 triangulation:"Use a scale marker and labelled reference directions. Perspective and the position of the camera can change apparent lengths and angles.",
 optimisation:"Choose coordinates that correspond to an actual dimension or geometric constraint. Tracing an outline does not by itself establish the optimum.",
 voronoi:"Mark sites with justified coordinates. Voronoi regions and boundaries require a separate construction and appropriate distance metric.",
 proof:"A traced picture may suggest a conjecture or counterexample, but cannot by itself prove a universal mathematical statement.",
 relationships:"If you are measuring two variables, the graph plotter may be more suitable. Use tracing only to extract justified coordinates from an image.",
 models:"Check that the image points and coordinate scale provide an appropriate basis for any subsequent model."
};
const TYPES=[["primary","My own photograph"],["secondary","A published or someone else's image"]];
const esc=e=>e;
function field(key,label,value,e,options={}){
 const hint=options.hint?'<small>'+e(options.hint)+'</small>':"";
 if(options.textarea)return '<label class="trace-field"><span>'+e(label)+'</span><textarea data-trace-field="'+key+'" rows="'+(options.rows||2)+'" placeholder="'+e(options.placeholder||"")+'">'+e(value)+'</textarea>'+hint+'</label>';
 return '<label class="trace-field"><span>'+e(label)+'</span><input data-trace-field="'+key+'" type="text" value="'+e(value)+'" placeholder="'+e(options.placeholder||"")+'" autocomplete="off">'+hint+'</label>';
}
function select(key,label,value,choices,e){
 return '<label class="trace-field"><span>'+e(label)+'</span><select data-trace-field="'+key+'">'+
  choices.map(([id,t])=>'<option value="'+e(id)+'"'+(id===value?" selected":"")+'>'+e(t)+'</option>').join("")+'</select></label>';
}
function check(key,text,value){
 return '<label class="trace-switch"><input type="checkbox" data-trace-field="'+key+'"'+(value?" checked":"")+'><span>'+text+'</span></label>';
}
const tools=[
 ["origin","1 · Origin (O)","Choose where (0,0) is located."],
 ["direction","2 · Positive x","Tap toward increasing x to orient the coordinate axes."],
 ["refA","3 · Scale end A","Mark one end of a known distance."],
 ["refB","4 · Scale end B","Mark the other end of that distance."],
 ["trace","5 · Trace points","Tap meaningful features in sequence."]
];
function methodBadge(d,key){
 return d[key]?'<span class="trace-mini-success">Set</span>':'<span class="trace-mini-needed">Needed</span>';
}
const dp=d=>d.precision==="unsure"?2:Number(d.precision);
const measureFmt=(v,d)=>Number.isFinite(v)?v.toFixed(dp(d)):"—";
export function traceCoordinatesTable(tracer,e,icon){
 const d=tracer.draft,rows=traceCoordinates(d);
 if(!d.points.length)return '<p class="trace-empty">No points traced. Select <strong>Trace points</strong> and tap meaningful features in the image.</p>';
 return '<div class="trace-coordinates-table-wrap"><table class="trace-coordinates-table"><thead><tr><th>Point</th><th>'+e(d.xLabel||"x")+' ('+e(d.unit||"unit") +')</th><th>'+e(d.yLabel||"y")+' ('+e(d.unit||"unit")+')</th><th class="trace-point-controls">Edit</th></tr></thead><tbody>'+
  rows.map(({index,coordinate})=>'<tr><td>P'+index+'</td><td>'+measureFmt(coordinate?.x,d)+'</td><td>'+measureFmt(coordinate?.y,d)+'</td><td><button class="btn btn-quiet btn-sm" type="button" data-action="trace-delete-point" data-trace-index="'+(index-1)+'" aria-label="Remove traced point P'+index+'">'+icon("x")+'</button></td></tr>').join("")+
  '</tbody></table></div>'+
  '<p class="trace-table-caution">Coordinates are calculated from your selected image calibration. Decimal places are a presentation choice, not evidence of measurement accuracy.</p>';
}
export function traceQualityHtml(tracer,icon,e){
 const q=imageTraceChecks(tracer.draft);
 return '<div class="trace-quality-head"><strong>'+icon(q.ready?"check-circle":"alert-triangle")+' Figure quality check</strong><span class="graph-quality-status '+(q.ready?"pass":"attention")+'">'+
   (q.ready?"Required checks passed":q.problems.length+" to fix")+'</span></div>'+
  (q.problems.length||q.warnings.length?'<ul class="trace-quality-items">'+
   q.problems.map(x=>'<li class="problem">'+icon("x-circle")+'<span>'+e(x.message)+'</span></li>').join("")+
   q.warnings.map(x=>'<li class="warning">'+icon("alert-triangle")+'<span>'+e(x.message)+'</span></li>').join("")+'</ul>':
   '<p class="trace-ready">The required presentation details are present. Check the mathematical assumptions yourself.</p>')+
  '<p class="trace-fine-print">Passing checks is not an IB grade or proof of valid measurements. The photographic setup, calibration and possible perspective distortion must still be discussed in the IA.</p>';
}
export function traceOutputHtml(tracer,icon,e){
 const q=imageTraceChecks(tracer.draft);
 const disabled=q.ready?"":' disabled title="Resolve the required image and calibration checks first"';
 return '<button type="button" class="btn btn-primary" data-action="trace-use"'+disabled+'>'+icon("check-circle")+' Save and link to first mathematics</button>'+
  '<div class="trace-output-options">'+
  '<button type="button" class="btn btn-secondary btn-sm" data-action="trace-save"'+disabled+'>'+icon("layers")+' Save draft</button>'+
  '<button type="button" class="btn btn-secondary btn-sm" data-action="trace-copy"'+disabled+'>'+icon("copy")+' Copy PNG</button>'+
  '<button type="button" class="btn btn-secondary btn-sm" data-action="trace-png"'+disabled+'>'+icon("download")+' PNG</button>'+
  '<button type="button" class="btn btn-secondary btn-sm" data-action="trace-svg"'+disabled+'>'+icon("download")+' SVG</button>'+
  '<button type="button" class="btn btn-secondary btn-sm" data-action="trace-csv"'+disabled+'>'+icon("table")+' Coordinates CSV</button></div>';
}
export function tracePreviewHtml(tracer,icon,e){
 const d=tracer.draft,q=imageTraceChecks(d),c=q.calibration;
 return '<section class="trace-preview-card" data-trace-preview><div class="trace-preview-top"><strong>Live mathematical figure</strong>'+
  '<span class="trace-preview-subhead">'+(d.imageSrc?e(d.width+" × "+d.height+" working pixels"):"Choose an image")+'</span></div>'+
  (d.imageSrc?
    '<div class="trace-view-controls" role="group" aria-label="Choose figure view">'+
    [['photo','Photo + axes'],['math','Clean coordinate plot']].map(([id,t])=>
      '<button type="button" data-action="trace-view" data-trace-value="'+id+'" aria-pressed="'+(d.view===id)+'" class="'+(d.view===id?"selected":"")+'">'+e(t)+'</button>').join("")+'</div>'+
    (d.view==="photo"?'<p class="trace-tap-instruction">'+icon("mouse-pointer-click")+' Tap the photograph to '+e(({
     origin:"set your origin O",direction:"choose positive x",refA:"mark scale end A",refB:"mark scale end B",trace:"mark the next point"
    })[d.mode])+'.</p>':'<p class="trace-tap-instruction">This clean mathematical view uses an equal scale on both axes. Switch back to the photograph to add more points.</p>')+
    '<div class="trace-image-board">'+
     (d.view==="photo"?renderTraceOverlaySvg(d,{interactive:true}):renderCleanTraceSvg(d))+
    '</div>':
   '<div class="trace-placeholder">'+icon("image")+'<strong>Start with a photograph</strong><p>Upload a JPG, PNG or WebP of the shape, trajectory or real situation you want to model.</p></div>')+
  '<p class="trace-scale-status">'+(c?
   icon("check-circle")+' Reference '+e(d.knownLength)+" "+e(d.unit||"units")+
    ' = '+Math.round(c.referencePixels)+' working pixels · 1 pixel ≈ '+e(c.unitsPerPixel.toPrecision(3))+' '+e(d.unit||"units"):
    icon("info")+' Coordinates are not calibrated yet. Do not interpret photo pixels as measured distances.')+'</p></section>';
}
export function traceWorkingHtml(tracer,icon,e){
 const d=tracer.draft,m=tracedMeasurements(d);
 const stat=m&&d.precision!=="unsure"?'<p class="trace-measurements"><strong>From traced points (approximate):</strong> '+
  (d.closeShape?"Boundary perimeter":"Open-path length")+': '+e(measureFmt(m.perimeter,d))+' '+e(d.unit||"units")+
  (m.area!==null?' · Enclosed area: '+e(measureFmt(m.area,d))+' '+e(d.unit||"units")+'²':"")+
  '</p><p class="trace-table-caution">These values assume a flat calibrated plane and straight segments between points, not an exact boundary or verified uncertainty.</p>':"";
 return '<section class="trace-working-card" data-trace-working><div class="trace-working-header"><h3>Extracted coordinates <span>'+d.points.length+' points</span></h3>'+
  '<div class="trace-mini-actions"><button type="button" class="btn btn-quiet btn-sm" data-action="trace-undo"'+(!d.points.length&&!d.refB&&!d.refA&&!d.direction&&!d.origin?" disabled":"")+'>'+
  icon("undo-2")+' Undo last point</button>'+
  '<button type="button" class="btn btn-quiet btn-sm" data-action="trace-clear-points"'+(!d.points.length?" disabled":"")+'>'+
  icon("trash-2")+' Clear tracing</button></div></div>'+
  traceCoordinatesTable(tracer,e,icon)+stat+
  '<p class="trace-table-caution">Keep the full point list or CSV in your working files: do not add long raw-coordinate tables to the IA or appendix. In your IA, show a purposeful labelled figure and only the calculations or summary values the reader needs. Decide independently whether a curve is justified.</p></section>';
}
export function renderImageTracer(state,icon,e){
 const tracer=state.imageTracer,d=tracer.draft,route=state.planning?.routeExplorer?.selectedRoute,
  advice=routes[route],full=tracer.figures.length>=MAX_TRACE_FIGURES;
 return '<section class="image-tracer" data-image-tracer aria-label="Image and coordinate tracer">'+
  '<header class="trace-studio-header"><div><div class="intro-writing-guide-eyebrow">'+icon("image")+' IMAGE & COORDINATE STUDIO</div>'+
  '<h2>Turn your photograph into mathematics</h2>'+
  '<p>Trace an actual object, geometry or trajectory, using your own origin and scale. The photograph remains distinct from the mathematical coordinate plot.</p></div>'+
  '<button type="button" class="btn btn-quiet btn-sm" data-action="trace-close">'+icon("x")+' Close tracer</button></header>'+
  (advice?'<aside class="trace-journey-advice"><strong>Based on your investigative pathway:</strong> '+e(advice)+'</aside>':"")+
  '<div class="trace-studio-columns"><div class="trace-control-stack">'+
  '<section class="trace-control-card"><h3><span class="trace-step-index">1</span> Import a real image</h3>'+
  '<p>Choose a well-lit, front-on photograph of a flat surface, ideally showing a ruler or known distance in the same plane.</p>'+
  '<div class="trace-buttons"><button type="button" class="btn btn-secondary btn-sm" data-action="trace-upload">'+icon("upload")+' Upload photo</button>'+
  (d.imageSrc?'<button type="button" class="btn btn-quiet btn-sm" data-action="trace-rotate-left">'+icon("rotate-ccw")+' Rotate left</button>'+
   '<button type="button" class="btn btn-quiet btn-sm" data-action="trace-rotate-right">'+icon("rotate-cw")+' Rotate right</button>':"")+'</div>'+
  (d.imageSrc?'<p class="trace-import-confirm">'+icon("check-circle")+' '+e(d.imageName||"Imported image")+' · Image processed locally</p>':"")+
  '<p class="trace-safety-note">For student privacy, avoid identifiable faces or personal details. Images are compressed and saved on this device as part of the restorable project backup; they are not uploaded to a server.</p>'+
  '</section>'+
  '<section class="trace-control-card"><h3><span class="trace-step-index">2</span> Define your coordinate system</h3>'+
  '<p>Tap these tools in order, then tap the photograph. The origin, x-axis direction and reference measurement are separate decisions.</p>'+
  '<div class="trace-tool-grid" role="group" aria-label="Photo marking tools">'+tools.map(([id,name,help])=>
   '<button type="button" class="trace-tool-btn'+(d.mode===id?" selected":"")+'" data-action="trace-mode" data-trace-value="'+id+'" aria-pressed="'+(d.mode===id)+'">'+
   '<strong>'+e(name)+'</strong><small>'+e(help)+'</small>'+
   (id==="origin"?methodBadge(d,"origin"):id==="direction"?methodBadge(d,"direction"):
    id==="refA"?methodBadge(d,"refA"):id==="refB"?methodBadge(d,"refB"):
    '<span class="trace-mini-needed">'+d.points.length+' marked</span>')+'</button>').join("")+'</div>'+
  '<div class="trace-field-grid">'+field("knownLength","Distance from A to B (known)",d.knownLength,e,{placeholder:"e.g. 10",hint:"This must be a real or expressly defined model distance."})+
  field("unit","Unit of the image coordinates",d.unit,e,{placeholder:"e.g. cm, m or model units"})+'</div>'+
  '<div class="trace-field-grid">'+field("xLabel","Horizontal mathematical variable",d.xLabel,e,{placeholder:"e.g. Horizontal position"})+
   field("yLabel","Vertical mathematical variable",d.yLabel,e,{placeholder:"e.g. Vertical position"})+'</div>'+
  '</section>'+
  '<section class="trace-control-card"><h3><span class="trace-step-index">3</span> Explain and check your figure</h3>'+
  field("title","Descriptive figure title",d.title,e,{placeholder:"e.g. Coordinates extracted from a photographed bridge arch"})+
  select("sourceKind","Where is the photo from?",d.sourceKind,[["unsure","Choose image origin"],...TYPES],e)+
  (d.sourceKind==="secondary"?field("sourceCredit","Original image source (required)",d.sourceCredit,e,{placeholder:"Creator, location, date, link or permission"}):"")+
  select("perspective","Is the photographed surface front-on?",d.perspective,[
   ["unsure","I still need to check"],["front-on","Approximately front-on / planar"],["oblique","Angled / perspective may distort measurements"]],e)+
  select("precision","Coordinate decimal places",d.precision,[
   ["unsure","Choose justified precision"],["0","0 (whole units)"],["1","1 decimal place"],["2","2 decimal places"],["3","3 decimal places"],["4","4 decimal places"]],e)+
  field("limitations","Calibration / photographic limitations to consider",d.limitations,e,{textarea:true,rows:2,placeholder:"e.g. ruler placement, photo resolution, perspective, point selection uncertainty"})+
  '<div class="trace-image-controls">'+
   '<label class="trace-field"><span>Photograph visibility</span><input type="range" data-trace-field="imageOpacity" min="0.1" max="1" step=".05" value="'+d.imageOpacity+'"></label>'+
   check("showGrid","Show calibrated grid",d.showGrid)+check("showLine","Join chosen points",d.showLine)+
   check("closeShape","Close outline (polygon)",d.closeShape)+check("showLabels","Label traced points",d.showLabels)+'</div>'+
  '</section></div>'+
  '<div class="trace-output-stack">'+tracePreviewHtml(tracer,icon,e)+traceWorkingHtml(tracer,icon,e)+
  '<section class="trace-quality-card" data-trace-quality>'+traceQualityHtml(tracer,icon,e)+'</section>'+
  '<section class="trace-output-card" data-trace-output>'+traceOutputHtml(tracer,icon,e)+'</section>'+
  '<p class="trace-writing-reminder"><strong>WRITE IN YOUR IA:</strong> Introduce the image and mathematical purpose before inserting this figure. Define the coordinate system and known reference length, then reflect on actual findings and limitations. Exporting a figure never marks mathematical work complete.</p></div></div>'+
  (tracer.figures.length?'<details class="trace-saved-figures"><summary>'+icon("layers")+' Saved traced figures ('+tracer.figures.length+')</summary>'+
   '<div class="trace-saved-list">'+tracer.figures.map(x=>'<div class="trace-saved-item"><div><strong>'+e(x.draft.title||"Untitled trace")+'</strong>'+
    '<small>'+e(x.savedAt.slice(0,10))+(x.entryId?" · linked to mathematics":"")+'</small></div>'+
    '<button type="button" class="btn btn-quiet btn-sm" data-action="trace-load" data-trace-id="'+e(x.id)+'">Edit this tracing</button></div>').join("")+
   '</div></details>':"")+
  '<div class="trace-end-actions"><p>Saved figures remain editable. Start a new trace when you have another photograph; the limit is '+MAX_TRACE_FIGURES+' saved figures per project.</p>'+
   '<button type="button" class="btn btn-quiet btn-sm" data-action="trace-new">'+icon("plus-circle")+' Start another tracing</button></div>'+
  '</section>';
}
