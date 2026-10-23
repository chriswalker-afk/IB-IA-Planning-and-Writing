/** Consistent, truthful wayfinding for the three student workspaces.
 * This is location, NOT another progress tracker. The existing Discovery Trail
 * remains the single source of chapter status and mathematical-stage progress.
 * Buttons reuse the application's established data-nav dispatcher.
 */
import {escapeHtml as e,icon} from "./primitives.js";
import {JOURNEY_GROUPS,currentGroup} from "./journey.js";

const WORKSPACES=Object.freeze({
 planning:Object.freeze({title:"Planning",icon:"compass",group:"plan"}),
 completing:Object.freeze({title:"IA Studio",icon:"pencil"}),
 checking:Object.freeze({title:"Checking",icon:"clipboard",group:"check"})
});

export function workspacePosition(state,{route,focus="",overview=false}={}){
 const workspace=WORKSPACES[route];
 if(!workspace)return null;
 const group=workspace.group?
  JOURNEY_GROUPS.find(g=>g.id===workspace.group):currentGroup({...state,route});
 const chapterNumber=JOURNEY_GROUPS.findIndex(g=>g.id===group?.id)+1;
 const validChapter=chapterNumber>0&&!overview;
 return {
  route,title:workspace.title,icon:workspace.icon,
  chapterNumber:validChapter?chapterNumber:null,
  chapterLabel:validChapter?group.name:workspace.title,
  focus:String(focus||"").trim()||workspace.title
 };
}

/** tools contains only locally-authored action buttons, never user input. */
export function workspaceHeader(state,{route,focus="",overview=false,tools=""}={}){
 const position=workspacePosition(state,{route,focus,overview});
 if(!position)return "";
 const chapter=position.chapterNumber?
  "Chapter "+position.chapterNumber+" · "+position.chapterLabel:position.title;
 return '<nav class="workspace-wayfinding workspace-wayfinding-'+position.route+
  '" aria-label="Current location and journey navigation" data-workspace-route="'+position.route+'">'+
  '<div class="workspace-wayfinding-location">'+
  '<span class="workspace-wayfinding-chapter">'+icon(position.icon)+e(chapter)+'</span>'+
  '<span class="workspace-wayfinding-separator" aria-hidden="true">›</span>'+
  '<strong class="workspace-wayfinding-focus">'+e(position.focus)+'</strong></div>'+
  '<div class="workspace-wayfinding-actions">'+tools+
  '<button type="button" class="workspace-wayfinding-full" data-nav="path"'+
  ' aria-label="Open the full Discovery Trail and all of my chapters">'+icon("route")+' Full path</button>'+
  '</div></nav>';
}
