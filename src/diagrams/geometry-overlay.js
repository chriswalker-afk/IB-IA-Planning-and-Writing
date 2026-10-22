/** SVG-only annotation helpers; never change the mathematical polygon. */
import {resolvedConstructionGuides} from "./geometry-annotations.js";
import {svgDiagramText} from "./diagram-notation.js";
const num=n=>Number(n).toFixed(2).replace(/\.?0+$/,"");
const label=(text,x,y,size=14,weight=500,colour="#29495b",maxWidth=185)=>svgDiagramText(text,x,y,
 'font-family="Arial,sans-serif" font-size="'+size+'" font-weight="'+weight+
 '" text-anchor="middle" fill="'+colour+'" stroke="#fff" stroke-width="4" stroke-linejoin="round" paint-order="stroke"',
 {fontSize:size,maxWidth});
export function formatGeometryMeasure(n,d,kind="length"){
 if(!Number.isFinite(n))return "?";
 if(kind==="angle")return Number(n).toFixed(d.angleDigits);
 if(d.lengthFormat==="sf")return Number(n).toPrecision(Math.max(1,d.lengthDigits));
 return Number(n).toFixed(d.lengthDigits);
}
export function geometryDimensionSvg(x1,y1,x2,y2,nx,ny,offset=36){
 const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy);
 if(len<1)return "";
 const ux=dx/len,uy=dy/len,ox=nx*offset,oy=ny*offset;
 const a=[x1+ox,y1+oy],b=[x2+ox,y2+oy],colour="#6c8593";
 const p=(x,y)=>num(x)+" "+num(y);
 return '<g class="geometry-dimension-lines" stroke="'+colour+'" stroke-width="1.5" fill="none">'+
  '<path d="M'+p(x1+nx*5,y1+ny*5)+' L'+p(x1+nx*(offset+8),y1+ny*(offset+8))+
  ' M'+p(x2+nx*5,y2+ny*5)+' L'+p(x2+nx*(offset+8),y2+ny*(offset+8))+
  ' M'+p(...a)+' L'+p(...b)+'"/>'+
  // Arrowheads point inward along the dimension line.
  '<path d="M'+p(a[0]+ux*9+nx*4,a[1]+uy*9+ny*4)+' L'+p(...a)+
  ' L'+p(a[0]+ux*9-nx*4,a[1]+uy*9-ny*4)+
  ' M'+p(b[0]-ux*9+nx*4,b[1]-uy*9+ny*4)+' L'+p(...b)+
  ' L'+p(b[0]-ux*9-nx*4,b[1]-uy*9-ny*4)+'"/></g>';
}
export function renderGeometryGuideLines(d,L){
 const parts=[];
 for(const {guide,from,to,height,baseA,baseB,length} of resolvedConstructionGuides(d)){
  if(!from||!Number.isFinite(from.x)||!Number.isFinite(from.y))continue;
  const ax=L.x(from.x),ay=L.y(from.y),dx=guide.labelDx||0,dy=guide.labelDy||0;
  if(guide.kind==="north"){
   if(d.mode!=="coordinate"||!d.northAligned)continue;
   const x=ax+26,y=ay-68;
   parts.push('<g class="geometry-north-guide" data-guide-id="'+guide.id+'" stroke="#4b7188" stroke-width="2" fill="none">'+
    '<path stroke-dasharray="5 4" d="M'+num(ax+26)+' '+num(ay-4)+' L'+num(x)+' '+num(y)+'"/>'+
    '<path d="M'+num(x-6)+' '+num(y+11)+' L'+num(x)+' '+num(y)+' L'+num(x+6)+' '+num(y+11)+'"/></g>');
   parts.push(label("N",x+dx,y-10+dy,13,700));
   continue;
  }
  if(!to||!Number.isFinite(to.x)||!Number.isFinite(to.y))continue;
  const bx=L.x(to.x),by=L.y(to.y),guideColour=guide.kind==="height"?"#a07536":"#497990";
  const dashed=guide.kind!=="solid";
  parts.push('<line class="geometry-construction-line" data-guide-id="'+guide.id+'" x1="'+num(ax)+
   '" y1="'+num(ay)+'" x2="'+num(bx)+'" y2="'+num(by)+'" fill="none" stroke="'+guideColour+
   '" stroke-width="2"'+(dashed?' stroke-dasharray="8 5"':"")+'/>');
  if(guide.kind==="height"&&height&&baseA&&baseB){
   const x0=L.x(baseA.x),y0=L.y(baseA.y),x1=L.x(baseB.x),y1=L.y(baseB.y);
   const vx=x1-x0,vy=y1-y0,len=Math.hypot(vx,vy),hlen=Math.hypot(ax-bx,ay-by);
   if(len>1&&hlen>1){
    // If the foot lies outside the segment, indicate the baseline extension.
    if(height.t<0||height.t>1){
     const source=height.t<0?[x0,y0]:[x1,y1];
     parts.push('<line class="geometry-height-extension" x1="'+num(source[0])+'" y1="'+num(source[1])+
      '" x2="'+num(bx)+'" y2="'+num(by)+'" stroke="#a07536" stroke-dasharray="5 5" stroke-width="1.4"/>');
    }
    const ux=vx/len,uy=vy/len,hx=(ax-bx)/hlen,hy=(ay-by)/hlen,sz=13;
    parts.push('<path class="geometry-height-square" d="M'+num(bx+ux*sz)+' '+num(by+uy*sz)+
      ' L'+num(bx+ux*sz+hx*sz)+' '+num(by+uy*sz+hy*sz)+
      ' L'+num(bx+hx*sz)+' '+num(by+hy*sz)+
      '" stroke="#a07536" stroke-width="1.8" fill="none"/>');
    parts.push('<circle cx="'+num(bx)+'" cy="'+num(by)+'" r="3" fill="#a07536"/>');
   }
  }
  const title=[guide.label.trim(),d.mode==="coordinate"&&guide.showLength&&length!==null?
   "≈ "+formatGeometryMeasure(length,d)+(d.unit?" "+d.unit:""):""].filter(Boolean).join(" · ");
  if(title){
   const vx=bx-ax,vy=by-ay,len=Math.max(1,Math.hypot(vx,vy));
   parts.push(label(title,(ax+bx)/2-vy/len*19+dx,(ay+by)/2+vx/len*19+dy,14,600,guideColour,210));
  }
 }
 return parts.join("");
}
export function renderGeometryAuxPoints(d,L,{interactive=false}={}){
 const out=[];
 for(let i=0;i<(d.auxPoints||[]).length;i++){
  const p=d.auxPoints[i];if(!Number.isFinite(p.x)||!Number.isFinite(p.y))continue;
  const x=L.x(p.x),y=L.y(p.y);
  if(interactive)out.push('<g data-geometry-aux-index="'+i+'" tabindex="0" role="button" aria-label="Move construction point '+(i+1)+
    ' using drag or arrow keys" style="cursor:grab;touch-action:none">'+
    '<circle cx="'+num(x)+'" cy="'+num(y)+'" r="19" fill="transparent" stroke="none" pointer-events="all"/>');
  out.push('<circle class="geometry-aux-point" cx="'+num(x)+'" cy="'+num(y)+
   '" r="5" stroke="#fff" stroke-width="1.8" fill="#bd753d" pointer-events="none"/>');
  if(interactive)out.push('</g>');
  out.push(label(p.label||"?",x+14+p.labelDx,y-12+p.labelDy,16,700,"#805328",125));
 }
 return out.join("");
}
