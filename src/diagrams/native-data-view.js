/** Shared native worksheet markup across the three existing mathematical studios. */
import {nativeGridSummary,NATIVE_LIMITS,NATIVE_PAGE_ROWS,NATIVE_MAX_ROWS,NATIVE_MAX_SHELF} from "./native-data-core.js";
const TOOLS=[["graph","Graph Plotter"],["stat","Statistical Diagrams"],["table","Table Studio"]];
export function renderNativeDataGrid(state,type,icon,e){
 const studio=type==="graph"?state.graphStudio:type==="stat"?state.statStudio:state.tableStudio;
 const d=studio.draft,cols=d.columns.length||
  (type==="stat"&&(d.kind==="bar"||d.histogramInput==="table")?3:2);
 const page=Math.min(Math.max(0,Number(studio.nativePage)||0),Math.floor(Math.max(0,d.matrix.length-1)/NATIVE_PAGE_ROWS));
 const start=page*NATIVE_PAGE_ROWS,range=Math.min(NATIVE_MAX_ROWS,Math.max(d.matrix.length,4));
 const end=Math.min(range,(page+1)*NATIVE_PAGE_ROWS);
 const status=nativeGridSummary(d);
 const rows=Array.from({length:Math.max(0,end-start)},(_,i)=>start+i);
 const cell=(r,c)=>'<input type="text" spellcheck="false" autocomplete="off" data-native-cell="true" data-native-type="'+type+
  '" data-native-row="'+r+'" data-native-col="'+c+'" value="'+e(d.matrix[r]?.[c]??"")+
  '" aria-label="Row '+(r+1)+', column '+(c+1)+' ('+e(d.columns[c]||"name needed")+')"'+
  ' placeholder="'+(r>=d.matrix.length?"Enter value":"")+'">';
 const headers=Array.from({length:cols},(_,i)=>
  '<th scope="col"><div class="native-grid-heading"><span>'+String.fromCharCode(65+i)+
   '</span><input type="text" data-native-heading="true" data-native-type="'+type+
   '" data-native-col="'+i+'" value="'+e(d.columns[i]||"")+'" aria-label="Column '+(i+1)+' heading"'+
   ' placeholder="Name and unit, e.g. Time (s)" maxlength="95"></div></th>').join("");
 const nextRows=rows.map(r=>'<tr><th scope="row" class="native-grid-row-head">'+(r+1)+'</th>'+
  Array.from({length:cols},(_,c)=>'<td>'+cell(r,c)+'</td>').join("")+
  '<td class="native-grid-row-actions">'+(r<d.matrix.length?
   '<button type="button" data-action="native-remove-row" data-native-type="'+type+
    '" data-native-row="'+r+'" aria-label="Remove row '+(r+1)+'" title="Remove row">'+icon("trash-2")+'</button>':
    '<span aria-hidden="true">+</span>')+'</td></tr>').join("");
 const shelf=state.dataShelf||[];
 return '<section class="native-data" data-native-grid="'+type+'" aria-label="Enter your own dataset">'+
  '<div class="native-data-heading"><span class="native-data-mark">'+icon("grid-2x2")+'</span><div>'+
   '<strong>Enter your data here</strong><p>No spreadsheet or pasted data required. Type column names, then measurements or categories. Blank cells are not observations.</p>'+
   '</div></div>'+
  '<div class="native-data-metrics" data-native-metrics>'+
   status.filled+' entered values · '+status.rows+' working rows · '+cols+' columns'+
   (status.incomplete?' · '+status.incomplete+' incomplete rows':"")+'</div>'+
  '<div class="native-grid-scroll" tabindex="0" aria-label="Scrollable editable data worksheet">'+
   '<table class="native-grid-table"><caption>Editable original dataset; values remain exactly as typed</caption>'+
   '<thead><tr><th scope="col" class="native-grid-corner">#</th>'+headers+
    '<th scope="col" class="native-grid-corner"><span class="sr-only">Delete row</span></th></tr></thead>'+
   '<tbody>'+nextRows+'</tbody></table></div>'+
  '<div class="native-grid-tools">'+
   '<button type="button" class="btn btn-secondary btn-sm" data-action="native-add-row" data-native-type="'+type+'">'+icon("plus-circle")+' Add row</button>'+
   '<button type="button" class="btn btn-quiet btn-sm" data-action="native-add-five" data-native-type="'+type+'">+ 5 rows</button>'+
   '<button type="button" class="btn btn-quiet btn-sm" data-action="native-add-column" data-native-type="'+type+'"'+
    (cols>=NATIVE_LIMITS[type]?" disabled":"")+'>'+icon("plus-circle")+' Add column</button>'+
   '<button type="button" class="btn btn-quiet btn-sm" data-action="native-remove-column" data-native-type="'+type+'"'+
    (cols<=2?" disabled":"")+' title="Remove the last column (asks before deleting data)">'+icon("trash-2")+' Last column</button>'+
  '</div>'+
  '<div class="native-grid-pagination" aria-label="Data rows pages">'+
   '<span>Rows '+(start+1)+'–'+end+' of '+Math.max(range,d.matrix.length)+' shown · maximum '+NATIVE_MAX_ROWS+'</span>'+
   (d.matrix.length>NATIVE_PAGE_ROWS?
   '<span><button type="button" class="btn btn-quiet btn-sm" data-action="native-page" data-native-type="'+type+
    '" data-native-direction="-1"'+(page===0?" disabled":"")+'>Previous</button>'+
   '<strong>Page '+(page+1)+' / '+Math.ceil(d.matrix.length/NATIVE_PAGE_ROWS)+'</strong>'+
   '<button type="button" class="btn btn-quiet btn-sm" data-action="native-page" data-native-type="'+type+
    '" data-native-direction="1"'+(page+1>=Math.ceil(d.matrix.length/NATIVE_PAGE_ROWS)?" disabled":"")+'>Next</button></span>':"")+
  '</div>'+
  '<p class="native-grid-tip">Tip: use Tab across cells and Enter to move down. You can also paste a rectangular range directly into any cell or heading. An incomplete row is never silently counted as measured data.</p>'+
  '<div class="native-data-shelf">'+
   '<div class="native-shelf-heading"><strong>'+icon("layers")+' Reuse the same dataset</strong>'+
    '<small>Local project snapshots · '+shelf.length+'/'+NATIVE_MAX_SHELF+'</small></div>'+
   '<p>Keep a copy of original values, mathematical display labels and unit choices for different graphs and tables. Each copy stays independent; check the presentation in its new context.</p>'+
   '<div class="native-shelf-save"><input type="text" data-native-name="'+type+'" placeholder="Dataset name (optional)" maxlength="75" aria-label="Name for this saved dataset">'+
   '<button type="button" class="btn btn-secondary btn-sm" data-action="native-save-dataset" data-native-type="'+type+'">'+icon("layers")+' Save reusable copy</button></div>'+
   '<div class="native-shelf-send"><span>Use current values in:</span>'+
    TOOLS.filter(([id])=>id!==type).map(([id,name])=>'<button type="button" class="btn btn-quiet btn-sm" data-action="native-send" data-native-type="'+type+
      '" data-native-to="'+id+'">'+icon("arrow-right")+' '+e(name)+'</button>').join("")+'</div>'+
   (shelf.length?'<details class="native-shelf-list"><summary>'+icon("grid-2x2")+' Load a saved dataset ('+shelf.length+')</summary>'+
     '<div>'+shelf.map(record=>'<div class="native-shelf-item"><span><strong>'+e(record.name)+'</strong>'+
      '<small>'+record.matrix.length+' rows · '+record.columns.length+' columns · saved '+e(record.savedAt.slice(0,10))+'</small></span>'+
      '<button type="button" class="btn btn-secondary btn-sm" data-action="native-load" data-native-type="'+type+
       '" data-native-id="'+e(record.id)+'">Use here</button>'+
      '<button type="button" class="btn btn-quiet btn-sm" data-action="native-delete-dataset" data-native-type="'+type+
       '" data-native-id="'+e(record.id)+'" aria-label="Delete saved copy '+e(record.name)+'">'+icon("trash-2")+'</button></div>').join("")+'</div></details>':
    '<small class="native-shelf-empty">No saved datasets yet. Your current grid is still saved as part of your IA project.</small>')+
  '</div></section>';
}
