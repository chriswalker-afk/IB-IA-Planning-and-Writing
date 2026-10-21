import {geometryAnalysis,MAX_GEOMETRY_FIGURES} from "./geometry-core.js";
import {renderGeometrySvg} from "./geometry-render.js";
import {diagramNotationControls,diagramHtmlMath} from "./diagram-notation.js";
import {renderPresentationCoach,renderFigureHandover} from "./presentation-coach-view.js";
const choices=(key,label,value,opts,e)=>'<label class="geometry-field"><span>'+e(label)+'</span><select data-geometry-field="'+key+'">'+opts.map(([id,name])=>'<option value="'+id+'"'+(value===id?" selected":"")+'>'+e(name)+'</option>').join("")+'</select></label>';
const field=(key,label,value,e,placeholder="")=>'<label class="geometry-field"><span>'+e(label)+'</span><input type="text" data-geometry-field="'+key+'" value="'+e(value)+'" placeholder="'+e(placeholder)+'"></label>';
const tick=(key,label,checked)=>'<label class="geometry-toggle"><input type="checkbox" data-geometry-field="'+key+'"'+(checked?" checked":"")+'><span>'+label+'</span></label>';
export function geometryPreviewHtml(studio){
 return '<div data-geometry-preview class="geometry-preview">'+renderGeometrySvg(studio.draft,{interactive:true})+'</div>';
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
  (a.notes.length>1?'<ul>'+a.notes.slice(1).map(x=>'<li>'+e(x)+'</li>').join("")+'</ul>':"")+'</div>';
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
export function renderGeometryStudio(state,icon,e){
 const studio=state.geometryStudio,d=studio.draft,q=geometryAnalysis(d);
 return '<section class="geometry-studio representation-studio" data-geometry-studio aria-label="Geometry and Measurement Studio">'+
  '<div class="representation-studio-intro"><span class="intro-writing-guide-eyebrow">GEOMETRY &amp; MEASUREMENT STUDIO</span>'+
  '<h2>Construct and explain your geometry</h2>'+
  '<p>Create a purposeful labelled construction. Use <strong>schematic</strong> for an illustrative diagram or <strong>coordinate</strong> when your x- and y-values justify calculated distances and angles.</p></div>'+
  '<div class="geometry-workspace" data-representation-step="create"><div class="geometry-controls">'+
  '<h3>1. Choose your construction</h3>'+
  '<div class="geometry-buttons">'+[["triangle","Triangle"],["rectangle","Rectangle"],["polygon","Polygon"]].map(([id,name])=>
   '<button type="button" class="btn '+(d.kind===id?"btn-primary":"btn-secondary")+' btn-sm" data-action="geometry-template" data-geometry-template="'+id+'">'+name+'</button>').join("")+'</div>'+
  '<button type="button" class="btn btn-quiet btn-sm" data-action="geometry-new">+ Start a new figure</button>'+ 
  choices("mode","Representation",d.mode,[["schematic","Schematic — labels only"],["coordinate","Coordinate-scaled construction"]],e)+
  field("title","Diagram title",d.title,e)+field("figureNumber","Figure number",d.figureNumber,e)+
  field("unit","Length unit (if known)",d.unit,e,"e.g. cm or \\(\\mathrm{m}\\)")+
  '<h3>2. Edit vertices</h3><p>Drag points on the diagram or edit their coordinates. The vertex order determines the sides; use a simple non-crossing polygon.</p>'+
  '<div class="geometry-vertices">'+d.vertices.map((p,i)=>
   '<div class="geometry-vertex"><strong>Point '+(i+1)+'</strong>'+
   '<label>Label <input type="text" data-geometry-vertex="'+i+'" data-geometry-vertex-key="label" value="'+e(p.label)+'"></label>'+
   '<label>x <input type="number" step="any" data-geometry-vertex="'+i+'" data-geometry-vertex-key="x" value="'+(p.x??"")+'"></label>'+
   '<label>y <input type="number" step="any" data-geometry-vertex="'+i+'" data-geometry-vertex-key="y" value="'+(p.y??"")+'"></label>'+
   '<label>Side to next vertex <input type="text" data-geometry-vertex="'+i+'" data-geometry-vertex-key="edgeLabel" value="'+e(p.edgeLabel)+'" placeholder="e.g. 5.2 cm"></label>'+
   '<label>Angle at vertex <input type="text" data-geometry-vertex="'+i+'" data-geometry-vertex-key="angleLabel" value="'+e(p.angleLabel)+'" placeholder="e.g. 35°"></label>'+
   (d.vertices.length>3?'<button type="button" class="btn btn-quiet btn-sm" data-action="geometry-remove" data-geometry-index="'+i+'">Remove</button>':"")+
   '<details class="geometry-vertex-notation"><summary>Maths in point or side labels</summary>'+
    [["label","Point label"],["edgeLabel","Side label"],["angleLabel","Angle label"]].map(([key,name])=>
      '<div class="geometry-notation-row"><span>'+name+'</span>'+diagramNotationControls(e,{studio:"geometry",key,vertexIndex:i})+'</div>').join("")+
    '</details></div>').join("")+'</div>'+
  '<button type="button" class="btn btn-secondary btn-sm" data-action="geometry-add"'+(d.vertices.length>=8?" disabled":"")+'>+ Add point</button>'+
  '<h3>3. Show appropriate information</h3>'+
  tick("filled","Soft fill",d.filled)+tick("showGrid","Cartesian guide grid",d.showGrid)+
  (d.mode==="coordinate"?tick("showLengths","Calculate and show side lengths",d.showLengths)+
   tick("showAngles","Calculate and show interior angles",d.showAngles)+
   tick("showCoordinates","Show point coordinates",d.showCoordinates)+
   tick("northAligned","Confirm x-east / y-north orientation",d.northAligned)+
   tick("showBearings","Show bearings clockwise from north",d.showBearings):"")+
  choices("sourceKind","Construction or measurement source",d.sourceKind,
   [["theoretical","Theoretical or hypothetical"],["primary","My measurements"],["secondary","Published or external source"],["unsure","Not yet confirmed"]],e)+
  field("sourceCredit","Source reference (where needed)",d.sourceCredit,e)+
  '<label class="geometry-field"><span>Assumptions, precision or limitations</span><textarea data-geometry-field="note" rows="3">'+e(d.note)+'</textarea></label>'+
  diagramNotationControls(e,{studio:"geometry",key:"unit"})+
  '</div><div class="geometry-main"><h3>Live construction</h3>'+
  geometryPreviewHtml(studio)+
  '<p class="geometry-drag-note">Drag any vertex to reposition it. A schematic does not prove a measurement. The coordinate model assumes a flat, Euclidean plane.</p>'+
  '<div data-representation-step="refine">'+geometryQualityHtml(studio,icon,e)+renderPresentationCoach(state,"geometry",d,icon,e)+'</div>'+
  '<div data-representation-step="use">'+geometryOutputHtml(studio,icon)+renderFigureHandover(state,"geometry",d,icon,e)+'</div>'+
  (studio.figures.length?'<details><summary>Saved geometry figures ('+studio.figures.length+')</summary>'+
   studio.figures.map(f=>'<div class="geometry-saved-row"><strong>'+e(f.draft.title||"Untitled construction")+'</strong>'+
    '<button type="button" class="btn btn-secondary btn-sm" data-action="geometry-load" data-geometry-id="'+e(f.id)+'">Edit</button></div>').join("")+'</details>':"")+
  '</div></div></section>';
}
