/** Print-quality SVG for Geometry & Measurement Studio. No automatic claims of scale in schematic mode. */
import {geometryAnalysis} from "./geometry-core.js";
import {orthogonalDecomposition} from "./geometry-advanced.js";
import {svgDiagramText,diagramWrapLines} from "./diagram-notation.js";
const W=1080;
const num=n=>Number(n).toFixed(2).replace(/\.?0+$/,"");
const text=(label,x,y,attrs="",options={})=>svgDiagramText(label,x,y,attrs,{maxWidth:options.width||300,fontSize:options.size||15});
const fmt=n=>Number.isFinite(n)?Number(n).toFixed(2).replace(/\.?0+$/,""):"?";
export function geometryLayout(raw){
 const d=geometryAnalysis(raw).draft,points=d.vertices.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y));
 const xs=points.map(p=>p.x),ys=points.map(p=>p.y);
 let minX=Math.min(...xs,0),maxX=Math.max(...xs,1),minY=Math.min(...ys,0),maxY=Math.max(...ys,1);
 if(!points.length){minX=0;maxX=8;minY=0;maxY=6;}
 const range=Math.max(maxX-minX,maxY-minY,1),pad=range*.32;
 minX-=pad;maxX+=pad;minY-=pad;maxY+=pad;
 const left=115,top=d.showTitle?114:65,width=850,height=430,scale=Math.min(width/(maxX-minX),height/(maxY-minY));
 const midX=(minX+maxX)/2,midY=(minY+maxY)/2,cx=left+width/2,cy=top+height/2;
 return {
  x:v=>cx+(v-midX)*scale,y:v=>cy-(v-midY)*scale,
  from:(x,y)=>({x:(x-cx)/scale+midX,y:(cy-y)/scale+midY}),
  scale,left,top,width,height
 };
}
export function renderGeometrySvg(raw,{interactive=false}={}){
 const a=geometryAnalysis(raw),d=a.draft,L=geometryLayout(d),P=d.vertices.map(p=>({...p,sx:L.x(p.x),sy:L.y(p.y)}));
 const figureTop=d.showTitle?96:48;
 const captionLines=d.showCaption?diagramWrapLines((d.figureNumber.trim()?"Figure "+d.figureNumber.trim()+". ":"")+(d.caption.trim()||d.title.trim()),105).slice(0,4):[];
 const H=figureTop+510+captionLines.length*23+(captionLines.length?18:0);
 const out=[],white='#fff',ink='#29495b',blue='#326e9e',grey='#6a7e89',teal='#d7eced';
 const path=P.map((p,i)=>(i?"L":"M")+num(p.sx)+" "+num(p.sy)).join(" ")+" Z";
 out.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Student-authored '+(d.mode==="schematic"?"schematic":"coordinate")+' geometric construction with '+P.length+' vertices"'+
  (interactive?' data-geometry-canvas="true"':"")+'>');
 out.push('<rect width="'+W+'" height="'+H+'" fill="'+white+'"/>');
 if(d.showTitle)out.push(text(d.title||"My geometric construction",W/2,48,
  'font-family="Arial,sans-serif" font-size="23" font-weight="700" fill="'+ink+'" text-anchor="middle"',{width:950}));
 if(d.showGrid&&d.mode==="coordinate"){
  const extentX=Math.max(...P.map(p=>p.x))-Math.min(...P.map(p=>p.x));
  const extentY=Math.max(...P.map(p=>p.y))-Math.min(...P.map(p=>p.y));
  const unit=Math.pow(10,Math.floor(Math.log10(Math.max(extentX,extentY,1)/7)));
  const step=Math.max(unit,Math.ceil(Math.max(extentX,extentY)/12/unit)*unit);
  const zero=L.from(L.left,L.top+L.height),other=L.from(L.left+L.width,L.top);
  for(let v=Math.ceil(zero.x/step)*step;v<other.x;v+=step){
   const x=L.x(v);if(x>L.left&&x<L.left+L.width)out.push('<line x1="'+num(x)+'" x2="'+num(x)+'" y1="'+L.top+'" y2="'+(L.top+L.height)+'" stroke="#e5ecf0" stroke-width="1"/>');
  }
  for(let v=Math.ceil(zero.y/step)*step;v<other.y;v+=step){
   const y=L.y(v);if(y>L.top&&y<L.top+L.height)out.push('<line x1="'+L.left+'" x2="'+(L.left+L.width)+'" y1="'+num(y)+'" y2="'+num(y)+'" stroke="#e5ecf0" stroke-width="1"/>');
  }
 }

 if(d.vertices.some(v=>!Number.isFinite(v.x)||!Number.isFinite(v.y))){
  out.push(text("Enter valid coordinates for every vertex to preview or export this figure.",
   W/2,330,'font-family="Arial,sans-serif" font-size="19" font-weight="600" fill="#9b4038" text-anchor="middle"',{width:980}));
  out.push(text("Your earlier measurements are not reused when a coordinate is cleared.",
   W/2,369,'font-family="Arial,sans-serif" font-size="14" fill="'+grey+'" text-anchor="middle"',{width:980}));
  out.push('</svg>');return out.join("");
 }
 out.push('<path d="'+path+'" fill="'+(d.filled?teal:"none")+'" stroke="'+blue+'" stroke-width="3.5" stroke-linejoin="round"/>');
 if(d.mode==="coordinate"&&d.showDecomposition&&a.ready){
  const partition=orthogonalDecomposition(d);
  if(partition.ok){
   partition.rectangles.forEach((r,i)=>{
    const x=L.x(r.x0),y=L.y(r.y1),width=(r.x1-r.x0)*L.scale,height=(r.y1-r.y0)*L.scale;
    out.push('<rect x="'+num(x)+'" y="'+num(y)+'" width="'+num(width)+'" height="'+num(height)+
      '" fill="none" stroke="#aa7b3b" stroke-width="1.8" stroke-dasharray="9 6"/>');
    out.push(text('R'+(i+1)+': '+fmt(r.area)+(d.unit?' '+d.unit+'²':""),
     x+width/2,y+height/2,'font-family="Arial,sans-serif" font-size="12" fill="#805a2b" text-anchor="middle" stroke="#fff" stroke-width="3" paint-order="stroke"',{width:180}));
   });
  }
 }
 const centroid={x:P.reduce((v,p)=>v+p.sx,0)/P.length,y:P.reduce((v,p)=>v+p.sy,0)/P.length};
 for(let i=0;i<P.length;i++){
  const p=P[i],q=P[(i+1)%P.length],r=P[(i+P.length-1)%P.length];
  const vx=q.sx-p.sx,vy=q.sy-p.sy,len=Math.max(1,Math.hypot(vx,vy)),mx=(p.sx+q.sx)/2,my=(p.sy+q.sy)/2;
  const nx=-vy/len,ny=vx/len,sign=(mx-centroid.x)*nx+(my-centroid.y)*ny>=0?1:-1;
  const label=p.edgeLabel.trim()||(d.mode==="coordinate"&&d.showLengths&&a.ready?
   "≈ "+fmt(a.lengths[i])+(d.unit?" "+d.unit:""):"");
  if(label)out.push(text(label,mx+nx*sign*19,my+ny*sign*19,
   'font-family="Arial,sans-serif" font-size="15" font-weight="600" text-anchor="middle" fill="'+ink+'" stroke="#fff" stroke-width="4" paint-order="stroke"',
   {width:190}));
  if(d.mode==="coordinate"&&d.showBearings&&d.northAligned&&a.ready){
   out.push(text(fmt(a.bearings[i]).padStart(3,"0")+"°",mx-nx*sign*21,my-ny*sign*21,
    'font-family="Arial,sans-serif" font-size="12" text-anchor="middle" fill="#7b5927" stroke="#fff" stroke-width="3" paint-order="stroke"',{width:115}));
  }
  if(p.angleLabel.trim()||d.mode==="coordinate"&&d.showAngles&&a.ready){
   const aX=r.sx-p.sx,aY=r.sy-p.sy,bX=q.sx-p.sx,bY=q.sy-p.sy,
    la=Math.max(1,Math.hypot(aX,aY)),lb=Math.max(1,Math.hypot(bX,bY));
   const uX=aX/la+bX/lb,uY=aY/la+bY/lb,div=Math.max(.05,Math.hypot(uX,uY));
   const alignX=uX/div,alignY=uY/div;
   const angleLabel=p.angleLabel.trim()||(a.ready?"≈ "+fmt(a.angles[i])+"°":"");
   const placement=a.ready&&a.angles[i]>180?-1:1;
   // The angle arc follows the actual interior angle, including reflex corners.
   // Use the polygon winding to determine the correct sweep in SVG's y-down space.
   const rawAngle=a.angles[i],radius=22;
   const cross=aX*bY-aY*bX;
   const sweep=rawAngle>180?(cross>0?0:1):(cross>0?1:0);
   const startX=p.sx+aX/la*radius,startY=p.sy+aY/la*radius;
   const endX=p.sx+bX/lb*radius,endY=p.sy+bY/lb*radius;
   if(Number.isFinite(rawAngle)&&rawAngle>1e-5&&rawAngle<359.999){
    out.push('<path class="geometry-angle-arc" d="M'+num(startX)+' '+num(startY)+
      ' A'+radius+' '+radius+' 0 '+(rawAngle>180?1:0)+' '+sweep+' '+num(endX)+' '+num(endY)+
      '" stroke="#a06f37" stroke-width="2" fill="none"/>');
   }
   out.push(text(angleLabel,p.sx+alignX*43*placement,p.sy+alignY*43*placement,
    'font-family="Arial,sans-serif" font-size="13" text-anchor="middle" fill="#855137" stroke="#fff" stroke-width="3" paint-order="stroke"',{width:120}));
  }
  if(p.edgeConstraint!=="free"&&a.ready){
    out.push(text(p.edgeConstraint==="horizontal"?"horizontal":"vertical",
      mx+nx*sign*37,my+ny*sign*37,
      'font-family="Arial,sans-serif" font-size="10" text-anchor="middle" fill="#765637"',{width:135}));
  }
  if(p.rightAngle&&a.ready&&Math.abs(a.angles[i]-90)<0.05){
    const ax=r.sx-p.sx,ay=r.sy-p.sy,bx=q.sx-p.sx,by=q.sy-p.sy;
    const al=Math.max(1,Math.hypot(ax,ay)),bl=Math.max(1,Math.hypot(bx,by)),size=17;
    const ux=ax/al*size,uy=ay/al*size,vx=bx/bl*size,vy=by/bl*size;
    out.push('<path d="M'+num(p.sx+ux)+' '+num(p.sy+uy)+' L'+num(p.sx+ux+vx)+' '+num(p.sy+uy+vy)+
     ' L'+num(p.sx+vx)+' '+num(p.sy+vy)+'" fill="none" stroke="#89602a" stroke-width="2"/>');
  }
  if(interactive&&!p.locked)out.push('<g tabindex="0" role="button" aria-label="Move vertex '+(i+1)+
   ' by dragging or pressing an arrow key" data-geometry-vertex-index="'+i+'" style="cursor:grab;touch-action:none">'+
   '<circle cx="'+num(p.sx)+'" cy="'+num(p.sy)+'" r="23" fill="transparent" stroke="none" pointer-events="all"/>');
  out.push('<circle cx="'+num(p.sx)+'" cy="'+num(p.sy)+'" r="6.5" fill="'+blue+'" stroke="#fff" stroke-width="2" pointer-events="none"/>');
  if(interactive&&!p.locked)out.push('</g>');
  if(p.locked)out.push('<circle cx="'+num(p.sx)+'" cy="'+num(p.sy)+
    '" r="11" stroke="#9c612f" stroke-width="2" fill="none" stroke-dasharray="3 2" pointer-events="none"/>');
  const radialX=p.sx-centroid.x,radialY=p.sy-centroid.y,mag=Math.max(1,Math.hypot(radialX,radialY));
  out.push(text(p.label||"?",p.sx+radialX/mag*22,p.sy+radialY/mag*22-2,
   'font-family="Arial,sans-serif" font-size="18" font-weight="700" text-anchor="middle" fill="'+ink+'" stroke="#fff" stroke-width="4" paint-order="stroke"',{width:100}));
  if(d.mode==="coordinate"&&d.showCoordinates)out.push(text("("+fmt(p.x)+", "+fmt(p.y)+")",
   p.sx+radialX/mag*42,p.sy+radialY/mag*42+18,
   'font-family="Arial,sans-serif" font-size="11" text-anchor="middle" fill="'+grey+'"',{width:145}));
 }
 if(d.northAligned&&d.mode==="coordinate"){
  out.push('<path d="M 988 183 v -56 l -9 15 M 988 127 l 9 15" fill="none" stroke="'+ink+'" stroke-width="2.5"/>');
  out.push(text("N",988,116,'font-family="Arial,sans-serif" text-anchor="middle" font-weight="700" font-size="16" fill="'+ink+'"'));
 }
 if(d.mode==="schematic")out.push(text("Not to scale",W/2,figureTop+468,
  'font-family="Arial,sans-serif" font-style="italic" font-size="12" fill="'+grey+'" text-anchor="middle"',{width:700}));
 captionLines.forEach((line,i)=>out.push(text(line,W/2,figureTop+492+i*23,
  'font-family="Arial,sans-serif" font-size="15" fill="'+ink+'" text-anchor="middle"',{width:1000})));
 out.push('</svg>');return out.join("");
}
