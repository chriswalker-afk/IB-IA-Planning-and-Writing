import {geometryAnalysis,MAX_GEOMETRY_FIGURES} from "./geometry-core.js";
import {MAX_GEOMETRY_AUX_POINTS,MAX_GEOMETRY_GUIDES} from "./geometry-annotations.js";
import {renderGeometrySvg} from "./geometry-render.js";
import {orthogonalDecomposition,geometrySensitivity} from "./geometry-advanced.js";
import {diagramNotationControls,diagramHtmlMath} from "./diagram-notation.js";
import {renderPresentationCoach,renderFigureHandover} from "./presentation-coach-view.js";
const choices=(key,label,value,opts,e)=>'<label class="geometry-field"><span>'+e(label)+'</span><select data-geometry-field="'+key+'">'+opts.map(([id,name])=>'<option value="'+id+'"'+(value===id?" selected":"")+'>'+e(name)+'</option>').join("")+'</select></label>';
const field=(key,label,value,e,placeholder="")=>'<label class="geometry-field"><span>'+e(label)+'</span><input type="text" data-geometry-field="'+key+'" value="'+e(value)+'" placeholder="'+e(placeholder)+'"></label>';
const tick=(key,label,checked)=>'<label class="geometry-toggle"><input type="checkbox" data-geometry-field="'+key+'"'+(checked?" checked":"")+'><span>'+label+'</span></label>';
export function geometryPreviewHtml(studio){
 return '<div data-geometry-preview class="geometry-preview'+(studio.zoomed?" geometry-preview-detail":"")+'">'+renderGeometrySvg(studio.draft,{interactive:true})+'</div>';
}
export function geometryQualityHtml(studio,icon,e){
 const a=geometryAnalysis(studio.draft);
 return '<div class="geometry-quality" data-geometry-quality>'+
  (a.issues.length?'<h3>'+icon("alert-triangle")+' Check before saving</h3><ul>'+a.issues.map(x=>'<li>'+e(x)+'</li>').join("")+'</ul>':
   '<h3>'+icon("check-circle")+' Shape is valid</h3>')+
  '<p>'+e(a.notes[0])+'</p>'+
  (a.draft.mode==="coordinate"&&a.ready?'<p>Calculated perimeter: <strong>'+a.lengths.reduce((x,y)=>x+y,0).toFixed(3)+
   '</strong>'+(a.draft.unit?' '+e(a.draft.unit):"")+'; enclosed area: <strong>'+Math.abs(a.area).toFixed(3)+'</strong>'+
   (a.draft.unit?' '+e(a.draft.unit)+'²':"")+'. These are derived from entered coordinates.</p>':"")+
  (a.draft.mode==="coordinate"&&a.draft.showDecomposition?(()=>{
   const parts=orthogonalDecomposition(a.draft);
   return parts.ok?'<p><strong>Rectangular decomposition:</strong> '+parts.rectangles.length+
    ' non-overlapping rectangles, area sum '+parts.area.toFixed(3)+(a.draft.unit?' '+e(a.draft.unit)+'²':"")+
    '. Compare this with the shoelace area.</p>':
    '<p class="geometry-caution">'+e(parts.reason)+'</p>';
  })():"")+
  (a.draft.mode==="coordinate"&&a.draft.showSensitivity?(()=>{
   const result=geometrySensitivity(a.draft);
   return result.ok?'<p><strong>Local coordinate sensitivity:</strong> Moving one x or y coordinate at a time by ±'+
    e(result.delta)+' changed area by at most '+result.maxAreaChange.toFixed(4)+
    ' and perimeter by at most '+result.maxPerimeterChange.toFixed(4)+
    ' in '+result.samples+' valid trials. '+e(result.explanation)+'</p>':
    '<p class="geometry-caution">'+e(result.reason)+'</p>';
  })():"")+
  (a.draft.provenance?.kind==="image-tracer"?'<p class="geometry-provenance"><strong>Image Tracer source:</strong> '+
    e(a.draft.provenance.traceTitle||a.draft.provenance.imageName||"Calibrated image")+
    '. Image reference: '+e(a.draft.provenance.knownLength||"?")+
    ' '+e(a.draft.unit||"units")+'. Calibration: '+
    e(a.draft.provenance.referencePixels?.toFixed?.(1)||"?")+
    ' pixels. This is a snapshot, not a live link to the photograph.</p>':"")+
  (a.notes.length>1?'<ul>'+a.notes.slice(1).map(x=>'<li>'+e(x)+'</li>').join("")+'</ul>':"")+'</div>';
}
export function geometryImportHtml(state,icon,e){
 const source=state?.imageTracer,working=source?.draft,figures=source?.figures||[];
 const sources=[
  ...(working?.imageSrc?[{id:"",title:working.title||working.imageName||"Current tracer draft"}]:[]),
  ...figures.map(f=>({id:f.id,title:f.draft.title||f.draft.imageName||"Saved tracing"}))
 ];
 return '<details class="geometry-import" data-geometry-import><summary>'+icon("image")+
  ' Transfer a calibrated outline from Image Tracer</summary>'+
  '<p>Import a <strong>front-on, calibrated, closed</strong> outline with 3–8 points. Geometry Studio copies only the coordinates and a short source record; it never changes or deletes the tracing.</p>'+
  (sources.length?sources.map(v=>
   '<div class="geometry-import-choice"><span>'+e(v.title)+'</span>'+
   '<button type="button" class="btn btn-secondary btn-sm" data-action="geometry-import-trace" data-geometry-trace-id="'+e(v.id)+'">Import outline</button></div>').join(""):
   '<p>No traced image is available yet. Open Image Tracer, set a known scale and mark an ordered outline.</p>')+
  '<button type="button" class="btn btn-quiet btn-sm" data-action="trace-open">Open Image Tracer</button></details>';
}
export function geometryOutputHtml(studio,icon){
 const remaining=MAX_GEOMETRY_FIGURES-studio.figures.length+(studio.activeId?1:0),ready=geometryAnalysis(studio.draft).ready;
 const disabled=ready?"":' disabled aria-disabled="true"';
 return '<div class="geometry-output"><p>Keep your saved figures editable in your project. Export a vector SVG or a high-resolution PNG to insert into your IA.</p>'+
  '<div class="geometry-buttons"><button type="button" class="btn btn-secondary" data-action="geometry-save"'+disabled+'>'+icon("save")+' Save editable figure</button>'+
  '<button type="button" class="btn btn-primary" data-action="geometry-use"'+disabled+'>'+icon("arrow-right")+' Use in this mathematical stage</button>'+
  '<button type="button" class="btn btn-secondary" data-action="geometry-svg"'+disabled+'>Download SVG</button>'+
  '<button type="button" class="btn btn-secondary" data-action="geometry-png"'+disabled+'>Download PNG</button></div>'+
  '<p class="geometry-note">'+remaining+' available saved-figure slot(s). '+(ready?'Save your diagram before moving it into the IA.':'Complete the highlighted checks before saving, linking or downloading.')+' Saved figures remain editable; they are not independent evidence of mathematical correctness.</p></div>';
}
/** Optional controls stay collapsed so the main vertex editor is approachable. */
function geometryAnnotationControls(d,e){
 const choicesForPoints=[...d.vertices,...d.auxPoints];
 const endpoint=(index,key,current,label)=>'<label>'+e(label)+
  '<select data-geometry-guide="'+index+'" data-geometry-guide-key="'+key+'">'+
  choicesForPoints.map(p=>'<option value="'+e(p.id)+'"'+(p.id===current?' selected':'')+'>'+e(p.label)+'</option>').join('')+
  '</select></label>';
 const aux=d.auxPoints.map((p,i)=>'<div class="geometry-construction-card geometry-aux-editor">'+
  '<strong>Extra point '+(i+1)+'</strong>'+
  '<label>Point name <input type="text" data-geometry-aux="'+i+'" data-geometry-aux-key="label" value="'+e(p.label)+'"></label>'+
  '<label>x <input type="number" step="any" data-geometry-aux="'+i+'" data-geometry-aux-key="x" value="'+(p.x??'')+'"></label>'+
  '<label>y <input type="number" step="any" data-geometry-aux="'+i+'" data-geometry-aux-key="y" value="'+(p.y??'')+'"></label>'+
  '<details><summary>Move label</summary><div class="geometry-nudge-grid">'+
  '<label>Horizontal (px)<input type="number" min="-90" max="90" data-geometry-aux="'+i+'" data-geometry-aux-key="labelDx" value="'+p.labelDx+'"></label>'+
  '<label>Vertical (px)<input type="number" min="-90" max="90" data-geometry-aux="'+i+'" data-geometry-aux-key="labelDy" value="'+p.labelDy+'"></label>'+
  '</div></details>'+
  '<button type="button" class="btn btn-quiet btn-sm" data-action="geometry-aux-remove" data-geometry-index="'+i+'">Remove point</button></div>').join('');
 const guides=d.guides.map((g,i)=>'<div class="geometry-construction-card geometry-guide-editor">'+
  '<strong>Construction '+(i+1)+'</strong>'+
  '<label>Type <select data-geometry-guide="'+i+'" data-geometry-guide-key="kind">'+
  [['solid','Line segment'],['dashed','Dashed construction'],['height','Perpendicular height'],['north','North reference']].map(([kind,name])=>
   '<option value="'+kind+'"'+(g.kind===kind?' selected':'')+'>'+name+'</option>').join('')+'</select></label>'+
  endpoint(i,'from',g.from,g.kind==='north'?'North line at':'Line begins at')+
  (g.kind==='height'?endpoint(i,'baseStart',g.baseStart,'Baseline from')+
   endpoint(i,'baseEnd',g.baseEnd,'Baseline to'):
   g.kind==='north'?'':endpoint(i,'to',g.to,'Line ends at'))+
  (g.kind==='north'?'':(
   '<label>Annotation <input type="text" data-geometry-guide="'+i+'" data-geometry-guide-key="label" value="'+e(g.label)+'" placeholder="e.g. h, median, altitude"></label>'+
   (d.mode==='coordinate'?'<label class="geometry-inline-check"><input type="checkbox" data-geometry-guide="'+i+
    '" data-geometry-guide-key="showLength"'+(g.showLength?' checked':'')+'> Show calculated length</label>':'')+
   '<details><summary>Move annotation</summary><div class="geometry-nudge-grid">'+
    '<label>Horizontal (px)<input type="number" min="-90" max="90" data-geometry-guide="'+i+'" data-geometry-guide-key="labelDx" value="'+g.labelDx+'"></label>'+
    '<label>Vertical (px)<input type="number" min="-90" max="90" data-geometry-guide="'+i+'" data-geometry-guide-key="labelDy" value="'+g.labelDy+'"></label>'+
   '</div></details>'))+
  '<button type="button" class="btn btn-quiet btn-sm" data-action="geometry-guide-remove" data-geometry-index="'+i+'">Remove line</button></div>').join('');
 return '<details class="geometry-constructions"'+(d.auxPoints.length||d.guides.length?' open':'')+'><summary>Additional points, diagonals and construction lines ('+
  (d.auxPoints.length+d.guides.length)+')</summary>'+
  '<p>These annotations do not change the closed polygon or its calculated area. Add points to position measurements, create diagonals, or construct a perpendicular height to a chosen baseline.</p>'+
  '<div class="geometry-buttons"><button type="button" class="btn btn-secondary btn-sm" data-action="geometry-aux-add"'+
   (d.auxPoints.length>=MAX_GEOMETRY_AUX_POINTS?' disabled':'')+'>+ Extra point</button>'+
  [['solid','Solid line'],['dashed','Dashed line'],['height','Height'],['north','North reference']].map(([kind,name])=>
   '<button type="button" class="btn btn-secondary btn-sm" data-action="geometry-guide-add" data-geometry-guide-kind="'+kind+'"'+
   (d.guides.length>=MAX_GEOMETRY_GUIDES?' disabled':'')+'>+ '+name+'</button>').join('')+'</div>'+
  (d.auxPoints.length?'<h4>Independent points</h4>'+aux:'')+
  (d.guides.length?'<h4>Construction lines</h4>'+guides:'')+
  '<p>Heights are perpendicular projections. If the foot lies beyond the side, a dashed baseline extension is included. North references require confirmed coordinates with north at positive y.</p></details>';
}
export function renderGeometryStudio(state,icon,e){
 const studio=state.geometryStudio,d=studio.draft,q=geometryAnalysis(d);
 return '<section class="geometry-studio representation-studio" data-geometry-studio aria-label="Geometry and Measurement Studio">'+
  '<div class="representation-studio-intro"><span class="intro-writing-guide-eyebrow">GEOMETRY &amp; MEASUREMENT STUDIO</span>'+
  '<h2>Construct and explain your geometry</h2>'+
  '<p>Create a purposeful labelled construction. Use <strong>schematic</strong> for an illustrative diagram or <strong>coordinate</strong> when your x- and y-values justify calculated distances and angles.</p></div>'+
  '<div class="geometry-workspace" data-representation-step="create"><div class="geometry-controls">'+
  '<h3>1. Choose your construction</h3>'+
  '<div class="geometry-buttons">'+[["triangle","Triangle"],["rectangle","Rectangle"],["polygon","Polygon"],["l-shape","L-shape"],["t-shape","T-shape"]].map(([id,name])=>
   '<button type="button" class="btn '+(d.kind===id?"btn-primary":"btn-secondary")+' btn-sm" data-action="geometry-template" data-geometry-template="'+id+'">'+name+'</button>').join("")+'</div>'+
  '<button type="button" class="btn btn-quiet btn-sm" data-action="geometry-new">+ Start a new figure</button>'+ 
  choices("mode","Representation",d.mode,[["schematic","Schematic — labels only"],["coordinate","Coordinate-scaled construction"]],e)+
  field("title","Diagram title",d.title,e)+field("figureNumber","Figure number",d.figureNumber,e)+
  '<details class="ia-figure-presentation-settings"><summary>IA figure presentation</summary>'+
  tick("showTitle","Include title in figure",d.showTitle)+
  tick("showCaption","Include figure caption in figure",d.showCaption)+
  field("caption","Caption (optional)",d.caption,e,"What does this construction show?")+
  '<p>Sources and mathematical cautions remain in your working record. The export contains only the selected figure annotations.</p></details>'+
  field("unit","Length unit (if known)",d.unit,e,"e.g. cm or \\(\\mathrm{m}\\)")+
  '<h3>2. Edit vertices</h3><p>Drag points on the diagram or edit their coordinates. The vertex order determines the sides; use a simple non-crossing polygon.</p>'+
  '<div class="geometry-vertices">'+d.vertices.map((p,i)=>
   '<div class="geometry-vertex"><strong>Point '+(i+1)+'</strong>'+
   '<label>Label <input type="text" data-geometry-vertex="'+i+'" data-geometry-vertex-key="label" value="'+e(p.label)+'"></label>'+
   '<label>x <input type="number" step="any" data-geometry-vertex="'+i+'" data-geometry-vertex-key="x" value="'+(p.x??"")+'"></label>'+
   '<label>y <input type="number" step="any" data-geometry-vertex="'+i+'" data-geometry-vertex-key="y" value="'+(p.y??"")+'"></label>'+
   '<label>Side to next vertex <input type="text" data-geometry-vertex="'+i+'" data-geometry-vertex-key="edgeLabel" value="'+e(p.edgeLabel)+'" placeholder="e.g. 5.2 cm"></label>'+
   '<label>Angle at vertex <input type="text" data-geometry-vertex="'+i+'" data-geometry-vertex-key="angleLabel" value="'+e(p.angleLabel)+'" placeholder="e.g. 35°"></label>'+
   (d.vertices.length>3?'<button type="button" class="btn btn-quiet btn-sm" data-action="geometry-remove" data-geometry-index="'+i+'"'+
     (d.guides.some(g=>[g.from,g.to,g.baseStart,g.baseEnd].includes(p.id))?
       ' disabled title="Remove or redirect construction lines using this point first"':'')+
     '>Remove</button>':"")+
   '<details class="geometry-vertex-notation"><summary>Maths in point or side labels</summary>'+
    [["label","Point label"],["edgeLabel","Side label"],["angleLabel","Angle label"]].map(([key,name])=>
      '<div class="geometry-notation-row"><span>'+name+'</span>'+diagramNotationControls(e,{studio:"geometry",key,vertexIndex:i})+'</div>').join("")+
    '</details>'+
   '<details class="geometry-vertex-constraints"><summary>Construction guides and locked points</summary>'+
   '<label>Side to next point <select data-geometry-vertex="'+i+'" data-geometry-vertex-key="edgeConstraint">'+
    [["free","Free"],["horizontal","Horizontal"],["vertical","Vertical"]].map(([value,label])=>
     '<option value="'+value+'"'+(p.edgeConstraint===value?" selected":"")+'>'+label+'</option>').join("")+
    '</select></label>'+
   '<button type="button" class="btn btn-secondary btn-sm" data-action="geometry-align-edge" data-geometry-index="'+i+'"'+
     (p.edgeConstraint==="free"?" disabled":"")+'>Align next point</button>'+
   '<label><input type="checkbox" data-geometry-vertex="'+i+'" data-geometry-vertex-key="rightAngle"'+(p.rightAngle?" checked":"")+'> Require 90° here</label>'+
   '<button type="button" class="btn btn-secondary btn-sm" data-action="geometry-snap-right" data-geometry-index="'+i+'"'+
     (p.rightAngle?"":" disabled")+'>Construct perpendicular side</button>'+
   '<label><input type="checkbox" data-geometry-vertex="'+i+'" data-geometry-vertex-key="locked"'+(p.locked?" checked":"")+'> Lock these point coordinates</label>'+
   '<p>Requirements are checked before saving. Alignment buttons adjust the <em>next</em> point; a locked point cannot be moved.</p>'+
   '</details>'+
   '<details class="geometry-vertex-positions"><summary>Angle marker and label positions</summary>'+
   '<label>Angle marking <select data-geometry-vertex="'+i+'" data-geometry-vertex-key="angleMark">'+
    [['single','Single arc'],['double','Double arc'],['triple','Triple arc']].map(([id,label])=>
     '<option value="'+id+'"'+(p.angleMark===id?' selected':'')+'>'+label+'</option>').join('')+'</select></label>'+
   '<p>Ordinary and reflex angles use arcs; verified 90° angles use a square marker.</p>'+
   '<div class="geometry-nudge-grid">'+
    [['pointLabelDx','Point x'],['pointLabelDy','Point y'],['edgeLabelDx','Side x'],
     ['edgeLabelDy','Side y'],['angleLabelDx','Angle x'],['angleLabelDy','Angle y']].map(([key,label])=>
     '<label>'+label+' offset (px)<input type="number" min="-90" max="90" step="1" data-geometry-vertex="'+i+
      '" data-geometry-vertex-key="'+key+'" value="'+p[key]+'"></label>').join('')+
   '</div></details></div>').join("")+'</div>'+
  '<button type="button" class="btn btn-secondary btn-sm" data-action="geometry-add"'+(d.vertices.length>=8?" disabled":"")+'>+ Add polygon vertex</button>'+
  geometryAnnotationControls(d,e)+
  '<h3>3. Show appropriate information</h3>'+
  geometryImportHtml(state,icon,e)+
  tick("filled","Soft fill",d.filled)+tick("showGrid","Cartesian guide grid",d.showGrid)+
  choices("dimensionStyle","Side label presentation",d.dimensionStyle,
   [["inline","Beside each side"],["dimension","Dimension arrows and extension lines"]],e)+
  (d.dimensionStyle==="dimension"?field("dimensionOffset","Dimension line distance (24–85 px)",String(d.dimensionOffset),e):"")+
  (d.mode==="coordinate"?'<div class="geometry-precision-settings"><h4>Display precision</h4>'+
   '<p>Choose an appropriate precision for the measurements that justify your model. Display rounding never changes the underlying calculations.</p>'+
   choices("lengthFormat","Length format",d.lengthFormat,
    [["dp","Decimal places"],["sf","Significant figures"]],e)+
   field("lengthDigits",d.lengthFormat==="sf"?"Length significant figures (1–5)":"Length decimal places (0–5)",String(d.lengthDigits),e)+
   field("angleDigits","Angle decimal places (0–3)",String(d.angleDigits),e)+'</div>':"")+
  (d.mode==="coordinate"?tick("showLengths","Calculate and show side lengths",d.showLengths)+
   tick("showAngles","Calculate and show interior angles",d.showAngles)+
   tick("showCoordinates","Show point coordinates",d.showCoordinates)+
   tick("showDecomposition","Show rectangular-area decomposition (axis-aligned shapes)",d.showDecomposition)+
   '<div class="geometry-sensitivity-options">'+tick("showSensitivity","Explore coordinate sensitivity (one at a time)",d.showSensitivity)+
   (d.showSensitivity?field("sensitivityStep","Coordinate shift to test, ±",d.sensitivityStep,e,"e.g. 0.1")+
   '<p>This is a trial perturbation, not automatically the accuracy of your measurements.</p>':"")+'</div>'+
   tick("northAligned","Confirm x-east / y-north orientation",d.northAligned)+
   tick("showBearings","Show bearings clockwise from north",d.showBearings):"")+
  choices("sourceKind","Construction or measurement source",d.sourceKind,
   [["theoretical","Theoretical or hypothetical"],["primary","My measurements"],["secondary","Published or external source"],["unsure","Not yet confirmed"]],e)+
  field("sourceCredit","Source reference (where needed)",d.sourceCredit,e)+
  '<label class="geometry-field"><span>Assumptions, precision or limitations</span><textarea data-geometry-field="note" rows="3">'+e(d.note)+'</textarea></label>'+
  diagramNotationControls(e,{studio:"geometry",key:"unit"})+
  '</div><div class="geometry-main"><div class="geometry-preview-header"><h3>Live construction</h3>'+
  '<div class="geometry-preview-zoom" role="group" aria-label="Diagram viewing size">'+
  '<button type="button" class="btn btn-secondary btn-sm" data-action="geometry-preview-fit" aria-pressed="'+(!studio.zoomed)+'">Fit whole diagram</button>'+
  '<button type="button" class="btn btn-secondary btn-sm" data-action="geometry-preview-detail" aria-pressed="'+(!!studio.zoomed)+'">Enlarge to edit</button></div></div>'+
  geometryPreviewHtml(studio)+
  '<p class="geometry-drag-note">On a phone, fit the whole diagram to review it or enlarge and scroll for precise editing. Drag a vertex to reposition it. A schematic does not prove a measurement. The coordinate model assumes a flat, Euclidean plane.</p>'+
  '<div data-representation-step="refine">'+geometryQualityHtml(studio,icon,e)+renderPresentationCoach(state,"geometry",d,icon,e)+'</div>'+
  '<div data-representation-step="use"><div data-geometry-output>'+geometryOutputHtml(studio,icon)+'</div>'+renderFigureHandover(state,"geometry",d,icon,e)+'</div>'+
  (studio.figures.length?'<details><summary>Saved geometry figures ('+studio.figures.length+')</summary>'+
   studio.figures.map(f=>'<div class="geometry-saved-row"><strong>'+e(f.draft.title||"Untitled construction")+'</strong>'+
    '<button type="button" class="btn btn-secondary btn-sm" data-action="geometry-load" data-geometry-id="'+e(f.id)+'">Edit</button></div>').join("")+'</details>':"")+
  '</div></div></section>';
}
