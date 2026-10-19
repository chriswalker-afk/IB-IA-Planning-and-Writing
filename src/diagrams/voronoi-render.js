/** Accurate axes, matching x/y scale and optionally calibrated map overlay. */
import {escapeGraph} from "./graph-core.js";
import {analyzeVoronoi,bisectorInBounds} from "./voronoi-core.js";
const E=escapeGraph,W=1000,H=690,LEFT=135,TOP=110,PLOT_WIDTH=790,PLOT_HEIGHT=440;
const colours=["#b5e1d0","#bdd9f1","#efcce0","#ffe3bb","#dcd5f5","#c9e7e4",
 "#f3d4b4","#d3dcee","#d8eabf","#e4d4e5","#f4dfa5","#bcdcc6"];
const fmt=n=>Number.isFinite(n)?Number(n.toPrecision(6)).toString():"?";
const coord=n=>Number(n.toFixed(2));
const text=(s,x,y,attrs="")=>'<text x="'+coord(x)+'" y="'+coord(y)+'" '+attrs+'>'+E(s)+'</text>';
const line=(x1,y1,x2,y2,attrs="")=>'<line x1="'+coord(x1)+'" y1="'+coord(y1)+'" x2="'+coord(x2)+'" y2="'+coord(y2)+'" '+attrs+'/>';
function tickStep(span){
 const p=10**Math.floor(Math.log10(span/6)),ratio=span/6/p;
 return p*(ratio<=1?1:ratio<=2?2:ratio<=2.5?2.5:ratio<=5?5:10);
}
function ticks(a,b){
 const step=tickStep(b-a),first=Math.ceil((a-step*1e-10)/step)*step,all=[];
 for(let i=0;i<25;i++){const value=first+i*step;if(value>b+step*1e-9)break;all.push(Number(value.toPrecision(10)));}
 return all;
}
export function voronoiLayout(bounds){
 if(!bounds)return null;
 const width=bounds.xMax-bounds.xMin,height=bounds.yMax-bounds.yMin;
 const scale=Math.min(PLOT_WIDTH/width,PLOT_HEIGHT/height);
 const mapWidth=width*scale,mapHeight=height*scale;
 const left=LEFT+(PLOT_WIDTH-mapWidth)/2,top=TOP+(PLOT_HEIGHT-mapHeight)/2;
 const x=v=>left+(v-bounds.xMin)*scale;
 const y=v=>top+mapHeight-(v-bounds.yMin)*scale;
 return {scale,left,top,width:mapWidth,height:mapHeight,x,y};
}
const closedPolygon=(polygon,L)=>polygon.map((p,i)=>(i?"L":"M")+coord(L.x(p.x))+" "+coord(L.y(p.y))).join(" ")+" Z";
function captionLines(input,max=123,maxLines=2){
 const words=String(input||"").trim().split(/\s+/),out=[];
 let curr="";
 for(const word of words){
  if((curr+" "+word).trim().length>max){out.push(curr);curr=word;}
  else curr=(curr+" "+word).trim();
  if(out.length>=maxLines)break;
 }
 if(curr&&out.length<maxLines)out.push(curr);
 return out;
}
export function renderVoronoiSvg(raw){
 const q=analyzeVoronoi(raw),d=q.draft,b=q.bounds;
 const body=['<svg class="voronoi-svg" data-voronoi-canvas="true" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+E(d.title||"Student Voronoi construction")+'" viewBox="0 0 '+W+" "+H+'" width="'+W+'" height="'+H+'">',
  '<rect width="'+W+'" height="'+H+'" fill="#fff"/>',
  text(d.title||"Voronoi studio — add title and sites",W/2,40,'font-family="Arial,sans-serif" font-size="22" font-weight="700" fill="#24464e" text-anchor="middle"'),
  text("Euclidean nearest-site regions — displayed cells clipped to the stated rectangular study window",W/2,67,
   'font-family="Arial,sans-serif" font-size="12" fill="#627781" text-anchor="middle"')];
 if(!q.cells.length||!b){
  body.push('<rect x="130" y="110" width="790" height="440" fill="#f5faf8" stroke="#cfdedc" rx="12"/>');
  body.push(text("Import two or more valid site coordinates to see a real construction",W/2,330,
   'font-family="Arial,sans-serif" font-size="17" fill="#607b7c" text-anchor="middle"'));
  body.push('</svg>');return body.join("");
 }
 const L=voronoiLayout(b),labelUnit=d.unitMode==="unit"&&d.unit.trim()?" ("+d.unit+")":"";
 const axisX=(d.xLabel||"Horizontal coordinate")+labelUnit;
 const axisY=(d.yLabel||"Vertical coordinate")+labelUnit;
 body.push('<defs><clipPath id="voronoi-domain-clip"><rect x="'+coord(L.left)+'" y="'+coord(L.top)+'" width="'+coord(L.width)+'" height="'+coord(L.height)+'"/></clipPath></defs>');
 body.push('<rect x="'+coord(L.left)+'" y="'+coord(L.top)+'" width="'+coord(L.width)+'" height="'+coord(L.height)+'" fill="#f6fbf9" stroke="#41646d" stroke-width="1.5"/>');
 if(d.mapSrc&&d.mapConfirmed&&d.regionMode==="manual"&&q.mapRatio!==null&&Math.abs(q.mapRatio-1)<=.05){
  body.push('<image href="'+E(d.mapSrc)+'" x="'+coord(L.left)+'" y="'+coord(L.top)+'" width="'+coord(L.width)+
   '" height="'+coord(L.height)+'" preserveAspectRatio="none" opacity="'+d.mapOpacity.toFixed(2)+'" clip-path="url(#voronoi-domain-clip)"/>');
 }
 // Cell fills remain translucent when a real map is underneath, not fake map colours.
 for(const [i,c] of q.cells.entries()){
  if(c.polygon.length<3)continue;
  body.push('<path d="'+closedPolygon(c.polygon,L)+'" fill="'+colours[i%colours.length]+'" fill-opacity="'+
   (d.mapSrc?".48":".72")+'" stroke="#396974" stroke-width="1.7" stroke-linejoin="round" clip-path="url(#voronoi-domain-clip)"/>');
 }
 if(d.showGrid){
  for(const t of ticks(b.xMin,b.xMax))
   body.push(line(L.x(t),L.top,L.x(t),L.top+L.height,'stroke="#a9c9c6" stroke-width=".8" stroke-dasharray="3 5" opacity=".65"'));
  for(const t of ticks(b.yMin,b.yMax))
   body.push(line(L.left,L.y(t),L.left+L.width,L.y(t),'stroke="#a9c9c6" stroke-width=".8" stroke-dasharray="3 5" opacity=".65"'));
 }
 if(d.showBisector&&q.cells[d.pairA]&&q.cells[d.pairB]&&d.pairA!==d.pairB){
  const pair=bisectorInBounds(d.sites[d.pairA],d.sites[d.pairB],b);
  if(pair)body.push(line(L.x(pair[0].x),L.y(pair[0].y),L.x(pair[1].x),L.y(pair[1].y),
   'stroke="#be544f" stroke-width="2" stroke-dasharray="9 7"'));
 }
 if(d.showAreas)q.cells.forEach((cell,i)=>{
  if(cell.polygon.length<3||cell.area<=0) return;
  const cx=cell.polygon.reduce((s,p)=>s+p.x,0)/cell.polygon.length,
   cy=cell.polygon.reduce((s,p)=>s+p.y,0)/cell.polygon.length;
  body.push(text(fmt(cell.area)+labelUnit.replace(/[()]/g,"")+"²",L.x(cx),L.y(cy)+14,
   'font-size="11" font-family="Arial,sans-serif" text-anchor="middle" fill="#435a67"'));
 });
 if(d.showSites)q.cells.forEach((cell,i)=>{
  const site=cell.site,x=L.x(site.x),y=L.y(site.y);
  if(site.kind==="candidate"){
   body.push('<path d="M'+coord(x)+' '+coord(y-8)+' L'+coord(x+8)+' '+coord(y)+' L'+coord(x)+' '+coord(y+8)+' L'+coord(x-8)+' '+coord(y)+' Z" fill="#b25742" stroke="#fff" stroke-width="2"/>');
  }else body.push('<circle cx="'+coord(x)+'" cy="'+coord(y)+'" r="6" fill="#1f4961" stroke="#fff" stroke-width="2.2"/>');
  if(d.showLabels)body.push(text((site.kind==="candidate"?"Proposed: ":"")+ (site.name.length>20?site.name.slice(0,18)+"…":site.name),
   Math.min(LEFT+PLOT_WIDTH-10,Math.max(LEFT+10,x+9)),Math.max(TOP+16,y-12),
   'font-family="Arial,sans-serif" font-size="12" font-weight="700" fill="#233f4c" text-anchor="start" stroke="#fff" stroke-width="3" paint-order="stroke"'));
 });
 if(q.probe){
  const px=L.x(q.probe.x),py=L.y(q.probe.y),winner=d.sites[q.nearest.index];
  body.push(line(px,py,L.x(winner.x),L.y(winner.y),'stroke="#9b5b29" stroke-width="2" stroke-dasharray="6 4"'));
  body.push('<circle cx="'+coord(px)+'" cy="'+coord(py)+'" r="8" fill="#fcf2da" stroke="#9a5b29" stroke-width="2.3"/>');
  body.push(text("P",px+10,py+22,'font-size="14" font-family="Arial,sans-serif" font-weight="700" fill="#774c29"'));
 }
 if(d.placeCandidate)body.push('<rect data-voronoi-place="true" class="voronoi-tap-layer" x="'+coord(L.left)+'" y="'+coord(L.top)+
  '" width="'+coord(L.width)+'" height="'+coord(L.height)+'" fill="transparent" pointer-events="all" role="button" aria-label="Tap to place proposed location"/>');
 // Coordinate axes always use the same physical scale, never a stretched graph.
 body.push(line(L.left,L.top+L.height,L.left+L.width,L.top+L.height,'stroke="#304e5b" stroke-width="1.8"'));
 body.push(line(L.left,L.top,L.left,L.top+L.height,'stroke="#304e5b" stroke-width="1.8"'));
 for(const t of ticks(b.xMin,b.xMax)){
  body.push(line(L.x(t),L.top+L.height,L.x(t),L.top+L.height+6,'stroke="#365a64" stroke-width="1.5"'));
  body.push(text(fmt(t),L.x(t),L.top+L.height+25,'font-family="Arial,sans-serif" font-size="12" fill="#395963" text-anchor="middle"'));
 }
 for(const t of ticks(b.yMin,b.yMax)){
  body.push(line(L.left-6,L.y(t),L.left,L.y(t),'stroke="#365a64" stroke-width="1.5"'));
  body.push(text(fmt(t),L.left-12,L.y(t)+4,'font-family="Arial,sans-serif" font-size="12" fill="#395963" text-anchor="end"'));
 }
 body.push(text(axisX,W/2,TOP+PLOT_HEIGHT+81,
  'font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="#2c505d" text-anchor="middle"'));
 body.push(text(axisY,45,TOP+PLOT_HEIGHT/2,
  'font-family="Arial,sans-serif" font-size="16" font-weight="700" fill="#2c505d" text-anchor="middle" transform="rotate(-90 45 '+(TOP+PLOT_HEIGHT/2)+')"'));
 const siteLine=d.sites.length+" measured/defined site(s)"+(q.nearest?
  "   ·   Test P is nearest to "+q.nearest.tied.join(" / ")+", distance "+fmt(q.nearest.distance)+(d.unitMode==="unit"?" "+d.unit:""):"");
 body.push(text(siteLine.slice(0,126),W/2,TOP+PLOT_HEIGHT+112,
  'font-family="Arial,sans-serif" font-size="12" fill="#526d77" text-anchor="middle"'));
 const credit=(d.sourceKind==="primary"?"Coordinates: student-collected data":d.sourceKind==="secondary"?
  "Coordinates: "+d.sourceCredit:"Coordinate source not yet confirmed")+
  (d.mapSrc?"   ·   Background map: "+d.mapCredit:"");
 captionLines(credit,122,2).forEach((s,i)=>body.push(text(s,W/2,TOP+PLOT_HEIGHT+132+i*18,
  'font-family="Arial,sans-serif" font-size="11" fill="#6a7c81" text-anchor="middle"')));
 body.push("</svg>");
 return body.join("");
}
