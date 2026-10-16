/** Insight network — visible, inspectable connections grounded in explicit record IDs.
 * An arc means "this source/decision was linked to that mathematical record",
 * never that work was graded, completed in the IA document or causally proved.
 */
import {escapeHtml as e,icon} from './primitives.js';
import {insightItems} from './insight-threads.js';

const entries=s=>Array.isArray(s?.entries)?s.entries:[];
const short=(v,n=170)=>{const x=String(v??'').trim();return x.length>n?x.slice(0,n-1)+'…':x;};
export function insightConnections(s){
 const records=entries(s),byId=new Map(records.map((x,i)=>[x.id,{...x,index:i}]));
 return insightItems(s).filter(x=>Array.isArray(x.linked)&&x.linked.length)
  .map(x=>{
   const used=x.linked.map(id=>byId.get(id)).filter(Boolean);
   if(!used.length)return null;
   const exact=x.type==='evidence'||x.type==='accuracy';
   return {id:x.id,type:x.type,title:x.title,value:x.value,where:x.where,
    origin:x.go,from:exact?'setup':'explore',to:'explore',
    used:used.map(record=>({index:record.index,id:record.id,
     title:record.title||'Mathematical step '+(record.index+1),
     status:record.reviewNeeded==='yes'?'Needs review':record.status==='completed'&&record.result?.trim()?'Result recorded':'Planned step'})),
    label:exact?'Explicitly linked as an input to':'Explicitly followed by',
    status:'linked'};
  }).filter(Boolean).slice(-36);
}
const point={plan:[31,122],setup:[126,42],explore:[229,97],finish:[326,28]};
export function threadGeometry(connection,i){
 const [x,y]=point[connection.from], [tx,ty]=point[connection.to];
 const offset=i%5;
 if(connection.from===connection.to){
  return 'M'+(x-12)+' '+(y-3)+' C'+(x-63-offset*3)+' '+(y-83-offset*3)+' '+(x+65+offset*4)+' '+(y-90-offset*2)+' '+(x+12)+' '+(y-3);
 }
 const mid=(x+tx)/2,tip=-14-offset*15;
 return 'M'+x+' '+y+' C'+mid+' '+(y+tip)+' '+mid+' '+(ty+tip)+' '+tx+' '+ty;
}
export function insightTrailLines(s){
 const links=insightConnections(s);
 return links.slice(-7).map((c,i)=>
  '<path class="living-thread-line insight-'+e(c.type)+'" data-thread-id="'+e(c.id)+
  '" d="'+threadGeometry(c,i)+'" fill="none"/>').join('');
}
const originAttrs=x=>'data-action="insight-jump" data-insight-type="'+e(x.origin.type)+'"'+
 (x.origin.node?' data-node="'+e(x.origin.node)+'"':'')+
 (Number.isInteger(x.origin.index)?' data-index="'+x.origin.index+'"':'');
export function insightTrailControls(s){
 const all=insightConnections(s),links=all.slice(-7);
 if(!links.length)return'';
 return '<details class="insight-trail-disclosure" aria-label="Connected decisions">'+
  '<summary>'+icon('git-branch')+' <strong>Follow your Insight Threads</strong>'+
  '<span>'+all.length+' explicitly linked '+(all.length===1?'spark':'sparks')+'</span>'+icon('chevron-right')+'</summary>'+
  '<p class="insight-trail-caption">Tap a spark to light its thread. Every connection comes from a link you recorded; faint threads never imply a grade or proof.</p>'+
  '<div class="insight-thread-picker" role="group" aria-label="Choose a connection">'+
  links.map(c=>
   '<button type="button" class="insight-thread-choice insight-'+e(c.type)+'" data-action="insight-focus" data-thread-id="'+e(c.id)+'" aria-pressed="false">'+
   '<span class="insight-choice-dot"></span><span>'+e(short(c.title,56))+'</span><small>'+c.used.length+' linked '+(c.used.length===1?'step':'steps')+'</small></button>').join('')+'</div>'+
  '<div class="insight-thread-welcome" data-thread-instruction>'+icon('sparkles')+
  ' Choose a spark to trace where its recorded idea was used.</div>'+
  links.map(c=>'<div class="insight-trail-detail insight-'+e(c.type)+'" data-thread-detail="'+e(c.id)+'" hidden>'+
   '<div class="insight-trail-details-title"><strong>'+e(c.title)+'</strong>'+
   '<button type="button" class="insight-link" '+originAttrs(c)+'>'+icon('arrow-up-right')+' Go to original</button></div>'+
   '<p class="insight-trail-quote">'+e(short(c.value,260))+'</p>'+
   '<p class="insight-trail-caption">'+e(c.label)+' these mathematical '+(c.used.length===1?'record':'records')+':</p>'+
   '<div class="insight-used-list">'+c.used.slice(0,12).map(r=>
    '<button type="button" data-action="completion-edit-entry" data-index="'+r.index+'">'+
    icon('chart')+' <span>'+e(short(r.title,70))+'<small>'+e(r.status)+'</small></span>'+icon('arrow-up-right')+'</button>').join('')+'</div>'+
   '</div>').join('')+
  (all.length>links.length?'<p class="insight-trail-caption">Showing the latest '+links.length+' connections. Earlier links remain in My Toolkit.</p>':'')+
  '</details>';
}
