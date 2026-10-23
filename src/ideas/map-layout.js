/** A free-form, accessible mind map. Nodes remain real buttons; only their
 * presentation is positioned here. No random or persisted coordinates: the same
 * choices make the same constellation on every render and screen width.
 */
const ns='http://www.w3.org/2000/svg';
const kind=id=>id==='hub'?'hub':id.startsWith('root-')?'root':
 id.startsWith('topic-')||id.startsWith('access-')?'branch':
 id.startsWith('leaf-')?'leaf':'seed';
const series=n=>Array.from({length:n},(_,i)=>i);
const offsetAngles=count=>count===1?[0]:series(count).map(i=>(i-(count-1)/2)*(count>4?.52:count===4?.62:.85));
const separation=(a,b,pad=16)=>Math.abs(a.x-b.x)<(a.width+b.width)/2+pad&&
 Math.abs(a.y-b.y)<(a.height+b.height)/2+pad;
const nearest=(id,positions)=>positions.get(id);
const smallVariation=(id)=>[0,-7,8,-5,5][id.split('').reduce((n,c)=>n+c.charCodeAt(0),0)%5];

/** Pure geometry, also used by tests. Coordinates refer to the map's top left.
 * On phones the same node graph becomes a loose two-column doodle rather than
 * shrinking bubbles until they are unreadable.
 */
export function computeIdeaMapPositions(input,width){
 const W=Math.max(280,Number(width)||700),mobile=W<800;
 const nodes=input.map(n=>({id:n.id,parent:n.parent||'',width:Math.max(1,n.width||140),
  height:Math.max(1,n.height||65)}));
 const byId=new Map(nodes.map(n=>[n.id,n])),placed=new Map();
 const add=(n,x,y)=>{if(n)placed.set(n.id,{id:n.id,x,y,width:n.width,height:n.height});};
 const groups=k=>nodes.filter(n=>kind(n.id)===k);
 const hub=byId.get('hub');
 if(!hub)return {height:0,positions:new Map()};
 add(hub,0,0);
 const roots=groups('root');
 if(mobile){
  const slots=[[-.255*W,163],[.255*W,174],[.13*W,328]];
  roots.forEach((n,i)=>add(n,...(slots[i]||[0,325+i*115])));
 }else{
  const slots=[[-.298*W,-141],[.288*W,-121],[.205*W,195]];
  roots.forEach((n,i)=>add(n,...(slots[i]||[0,210+i*115])));
 }
 const branches=groups('branch'),leaves=groups('leaf'),seeds=groups('seed');
 if(mobile){
  const stagger=(items,gap,after)=>{
   if(!items.length)return;
   const last=Math.max(...[...placed.values()].map(p=>p.y+p.height/2));
   const start=last+after;
   items.forEach((n,i)=>{
    const x=i===items.length-1&&i%2===0?0:(i%2===0?-.251:.251)*W;
    add(n,x,start+Math.floor(i/2)*gap+smallVariation(n.id));
   });
  };
  stagger(branches,115,96);
  stagger(leaves,110,99);
 }else{
  const grow=items=>{
   const siblingGroups=new Map();
   for(const n of items){
    if(!siblingGroups.has(n.parent))siblingGroups.set(n.parent,[]);
    siblingGroups.get(n.parent).push(n);
   }
   for(const [parentId,siblings] of siblingGroups){
    const parent=nearest(parentId,placed);
    if(!parent)continue;
    const ancestor=nearest(byId.get(parentId)?.parent,placed);
    const angle=ancestor?Math.atan2(parent.y-ancestor.y,parent.x-ancestor.x):
     Math.atan2(parent.y,parent.x);
    const ideal=offsetAngles(siblings.length);
    siblings.forEach((n,i)=>{
     const heading=angle+ideal[i],radius=kind(n.id)==='leaf'?185:208;
     const allowed=W/2-n.width/2-18;
     let best=null;
     for(const r of [radius,radius+40,radius+85,radius+145,radius+215,radius+300,radius+425]){
      for(const delta of [0,-.18,.18,-.37,.37,-.64,.64,-.94,.94,-1.28,1.28]){
       const a=heading+delta;
       const x=parent.x+Math.cos(a)*r,y=parent.y+Math.sin(a)*r;
       if(Math.abs(x)>allowed||Math.abs(y)>1950)continue;
       const candidate={x,y,width:n.width,height:n.height};
       if([...placed.values()].some(p=>separation(candidate,p,17)))continue;
       const score=r+Math.abs(delta)*112+Math.abs(x/Math.max(1,allowed))*8;
       if(!best||score<best.score)best={x,y,score};
      }
     }
     if(best)add(n,best.x,best.y);
     else{
      const bottom=Math.max(...[...placed.values()].map(p=>p.y+p.height/2));
      add(n,(i%2?1:-1)*Math.min(W*.245,allowed),bottom+n.height/2+32);
     }
    });
   }
  };
  grow(branches);
  grow(leaves);
 }
 // Longer, student-readable "make it personal" notes are pinned below the
 // bubbles. They stay linked to the selected detail, not squeezed into ovals.
 if(seeds.length){
  const bottom=Math.max(...[...placed.values()].map(p=>p.y+p.height/2));
  const twoCols=!mobile&&W>=640;
  let y=bottom+95;
  for(let i=0;i<seeds.length;){
   const row=seeds.slice(i,i+(twoCols?2:1));
   const tall=Math.max(...row.map(n=>n.height));
   row.forEach((n,j)=>{
    const x=row.length===1?0:(j===0?-.25:.25)*W;
    add(n,x,y+tall/2);
   });
   y+=tall+27;i+=row.length;
  }
 }
 const all=[...placed.values()];
 const top=Math.min(...all.map(p=>p.y-p.height/2)),bottom=Math.max(...all.map(p=>p.y+p.height/2));
 const shift=(mobile?32:74)-top;
 const positions=new Map(all.map(p=>[p.id,{
  left:Math.round((W/2+p.x-p.width/2)*10)/10,
  top:Math.round((p.y-p.height/2+shift)*10)/10
 }]));
 return {height:Math.ceil(bottom+shift+(mobile?43:64)),positions};
}
function positionNodes(graph,nodes,width){
 if(!graph.dataset||!graph.style)return;
 graph.dataset.ideaMapReady='true';
 const measurements=nodes.map(node=>({
  node,id:node.dataset.ideaNode,parent:node.dataset.ideaParent,
  width:node.offsetWidth||node.getBoundingClientRect().width,
  height:node.offsetHeight||node.getBoundingClientRect().height
 }));
 const layout=computeIdeaMapPositions(measurements,width);
 if(!layout.height)return;
 graph.style.height=layout.height+'px';
 measurements.forEach(({node,id},i)=>{
  const point=layout.positions.get(id);
  if(!point)return;
  node.style.left=point.left+'px';node.style.top=point.top+'px';
  node.style.setProperty('--idea-tilt',[-1.1,.65,-.4,1,-.75,.55][i%6]+'deg');
  node.style.setProperty('--idea-float-delay',(-i*.93)+'s');
  node.style.setProperty('--idea-float-duration',(7.6+(i%5)*.59)+'s');
 });
}
const relative=(box,root)=>({
 x:box.left-root.left+box.width/2,
 y:box.top-root.top+box.height/2,
 width:box.width,height:box.height
});
const edge=(centre,dx,dy)=>{
 const factor=1/Math.max(Math.abs(dx)/(centre.width/2),Math.abs(dy)/(centre.height/2),.00001);
 return {x:centre.x+dx*factor*.94,y:centre.y+dy*factor*.94};
};
export function redrawIdeaMapGraph(graph){
 if(!graph?.isConnected)return;
 const svg=graph.querySelector('[data-idea-map-connectors]');
 if(!svg)return;
 const area=graph.getBoundingClientRect();
 if(area.width<1)return;
 const nodes=[...graph.querySelectorAll('[data-idea-node]')];
 positionNodes(graph,nodes,area.width);
 const current=graph.getBoundingClientRect();
 if(current.height<1)return;
 const byId=new Map(nodes.map(node=>[node.dataset.ideaNode,node]));
 const lines=document.createDocumentFragment();
 for(const child of nodes){
  const parent=byId.get(child.dataset.ideaParent);
  if(!parent)continue;
  const p=relative(parent.getBoundingClientRect(),current);
  const c=relative(child.getBoundingClientRect(),current);
  const dx=c.x-p.x,dy=c.y-p.y,length=Math.hypot(dx,dy)||1;
  const a=edge(p,dx,dy),b=edge(c,-dx,-dy);
  const vx=b.x-a.x,vy=b.y-a.y;
  const side=child.dataset.ideaNode.split('').reduce((v,ch)=>v+ch.charCodeAt(0),0)%2?1:-1;
  const bend=Math.min(23,length*.095)*side;
  const nx=-dy/length,ny=dx/length;
  const c1x=a.x+vx*.38+nx*bend,c1y=a.y+vy*.38+ny*bend;
  const c2x=a.x+vx*.63+nx*bend,c2y=a.y+vy*.63+ny*bend;
  const path='M '+a.x+' '+a.y+' C '+c1x+' '+c1y+' '+c2x+' '+c2y+' '+b.x+' '+b.y;
  const line=document.createElementNS(ns,'path');
  line.setAttribute('d',path);
  line.setAttribute('class','idea-map-wire '+(parent.classList.contains('selected')||
   child.classList.contains('selected')?'is-active':'is-muted'));
  line.setAttribute('data-edge-to',child.dataset.ideaNode);
  lines.appendChild(line);
 }
 svg.setAttribute('viewBox','0 0 '+current.width+' '+current.height);
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
