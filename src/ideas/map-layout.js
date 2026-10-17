/** Position curved SVG connectors using the real positions of the interactive
 * HTML nodes. This keeps links attached across changing labels, screen widths,
 * wrapped mobile tiers and keyboard/browser zoom. SVG is purely decorative.
 */
const ns='http://www.w3.org/2000/svg';
const relative=(box,root)=>({
 cx:box.left-root.left+box.width/2,
 left:box.left-root.left,
 top:box.top-root.top,
 bottom:box.bottom-root.top
});
export function redrawIdeaMapGraph(graph){
 if(!graph?.isConnected)return;
 const svg=graph.querySelector('[data-idea-map-connectors]');
 if(!svg)return;
 const area=graph.getBoundingClientRect();
 if(area.width<1||area.height<1)return;
 const nodes=[...graph.querySelectorAll('[data-idea-node]')];
 const byId=new Map(nodes.map(node=>[node.dataset.ideaNode,node]));
 const lines=document.createDocumentFragment();
 const narrow=area.width<420;
 for(const child of nodes){
  const parent=byId.get(child.dataset.ideaParent);
  if(!parent)continue;
  const p=relative(parent.getBoundingClientRect(),area),c=relative(child.getBoundingClientRect(),area);
  const startX=p.cx,startY=p.bottom-2,endX=c.cx,endY=c.top+2;
  const gap=Math.max(12,endY-startY);
  let path;
  if(narrow&&gap<28){
   const middle=(startY+endY)/2;
   path='M '+startX+' '+startY+' Q '+startX+' '+middle+' '+endX+' '+endY;
  }else{
   const curve=Math.min(Math.max(gap*.48,12),57);
   path='M '+startX+' '+startY+' C '+startX+' '+(startY+curve)+' '+endX+' '+(endY-curve)+' '+endX+' '+endY;
  }
  const line=document.createElementNS(ns,'path');
  line.setAttribute('d',path);
  line.setAttribute('class','idea-map-wire '+(parent.classList.contains('selected')||child.classList.contains('selected')?'is-active':'is-muted'));
  line.setAttribute('data-edge-to',child.dataset.ideaNode);
  lines.appendChild(line);
 }
 svg.setAttribute('viewBox','0 0 '+area.width+' '+area.height);
 svg.setAttribute('preserveAspectRatio','none');
 svg.replaceChildren(lines);
}
/** Call after every main render; disconnect the previous map on route changes. */
export function attachIdeaMapGraph(host){
 const graph=host?.querySelector('[data-idea-map-network]');
 if(!graph)return ()=>{};
 let live=true,scheduled=0;
 const refresh=()=>{if(live)redrawIdeaMapGraph(graph);};
 const schedule=()=>{
  if(!live||scheduled)return;
  scheduled=requestAnimationFrame(()=>{scheduled=0;refresh();});
 };
 const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(schedule):null;
 if(observer){
  observer.observe(graph);
  for(const node of graph.querySelectorAll('[data-idea-node]'))observer.observe(node);
 }
 window.addEventListener('resize',schedule,{passive:true});
 refresh();schedule();
 return ()=>{
  live=false;observer?.disconnect();
  window.removeEventListener('resize',schedule);
  if(scheduled)cancelAnimationFrame(scheduled);
 };
}
