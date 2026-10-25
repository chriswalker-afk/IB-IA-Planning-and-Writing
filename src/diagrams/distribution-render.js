import {analyzeDistribution,normalUpperTail} from "./distribution-core.js";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>Number(n.toPrecision(5)).toString();
const txt=(s,x,y,size=14,anchor="middle",weight=400)=>'<text x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" font-family="Arial,sans-serif" font-size="'+size+'" font-weight="'+weight+'" fill="#263c4a">'+esc(s)+'</text>';
export function renderDistributionSvg(raw){
 const q=analyzeDistribution(raw),d=q.draft;
 const W=d.size==="compact"?640:d.size==="wide"?1100:860,H=d.size==="compact"?330:390;
 const left=68,right=W-30,top=62,bottom=H-67,graphW=right-left,graphH=bottom-top;
 const ink=d.printStyle==="mono"?"#273a45":"#31769a",shade=d.printStyle==="mono"?"#a6b0b8":"#8bc8dc";
 let parts=['<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+esc(d.title||"Probability distribution")+
  '" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'"><rect width="'+W+'" height="'+H+'" fill="#ffffff"/>',
  txt(d.title||"Probability distribution",W/2,29,18,"middle",600)];
 if(!q.ready){
  parts.push(txt("Enter valid distribution parameters and a title to create this figure.",W/2,H/2,13));
  return parts.join("")+"</svg>";
 }
 const axis=bottom-10;
 parts.push('<path d="M'+left+' '+axis+'H'+right+'" stroke="#425865" stroke-width="1.4"/>');
 const chartHeight=axis-top-12;
 const xLabel=d.symbol+(d.unit.trim()?" ("+d.unit.trim()+")":"");
 const label=()=>parts.push(txt(xLabel,W/2,H-26,14));
 if(d.kind==="normal"){
  const {mu,sigma}=q,low=mu-4.1*sigma,high=mu+4.1*sigma;
  const xx=x=>left+(x-low)/(high-low)*graphW,yy=x=>axis-(Math.exp(-.5*((x-mu)/sigma)**2))*chartHeight;
  const lower=q.lower,upper=q.upper;
  const match=x=>d.mode==="left"?x<=lower:d.mode==="right"?x>=lower:
   d.mode==="between"?x>=lower&&x<=upper:d.mode==="outside"?x<=lower||x>=upper:false;
  const N=420;
  // Partition exactly at probability bounds, even when boundaries lie between sampled pixels.
  const xSet=Array.from({length:N+1},(_,i)=>low+(high-low)*i/N);
  for(const cut of [lower,upper])if(cut!==null&&cut>low&&cut<high)xSet.push(cut);
  xSet.sort((a,b)=>a-b);
  const boundaries=[low,...xSet,high].filter((x,i,a)=>i===0||x>a[i-1]);
  let selectedParts=[];
  for(let i=1;i<boundaries.length;i++){
   const a=boundaries[i-1],b=boundaries[i],mid=(a+b)/2;
   if(match(mid))selectedParts.push('<path d="M'+xx(a).toFixed(2)+' '+axis+' L'+xx(a).toFixed(2)+' '+yy(a).toFixed(2)+
    ' L'+xx(b).toFixed(2)+' '+yy(b).toFixed(2)+' L'+xx(b).toFixed(2)+' '+axis+' Z" fill="'+shade+'" opacity=".64"/>');
  }
  parts.push(...selectedParts);
  parts.push('<path d="'+xSet.map((x,i)=>(i?"L":"M")+xx(x).toFixed(2)+" "+yy(x).toFixed(2)).join(" ")+'" fill="none" stroke="'+ink+'" stroke-width="2.5"/>');
  const ticks=[-3,-2,-1,0,1,2,3];
  for(const z of ticks){
   const x=xx(mu+z*sigma);
   parts.push('<path d="M'+x+' '+axis+'v6" stroke="#637985"/>',txt(fmt(mu+z*sigma),x,axis+21,11));
  }
  if(d.showMean)parts.push('<path d="M'+xx(mu)+' '+axis+'V'+yy(mu)+'" stroke="#768d99" stroke-dasharray="4 4"/>');
  for(const value of [lower,upper])if(value!==null&&value>low&&value<high)
   parts.push('<path d="M'+xx(value)+' '+axis+'V'+yy(value)+'" stroke="'+ink+'" stroke-dasharray="4 3" stroke-width="1.2"/>');
 }else{
  const {n,masses}=q,max=Math.max(...masses,1e-16);
  const count=n+1,step=graphW/count,barW=Math.max(1.2,Math.min(step*.74,36));
  for(let k=0;k<=n;k++){
   const h=masses[k]/max*chartHeight,x=left+(k+.5)*step,y=axis-h;
   const chosen=d.mode==="exact"?k===q.lower:d.mode==="left"?k<=q.lower:d.mode==="right"?k>=q.lower:
    d.mode==="between"?k>=q.lower&&k<=q.upper:
    d.mode==="outside"?k<=q.lower||k>=q.upper:false;
   parts.push('<rect x="'+(x-barW/2).toFixed(2)+'" y="'+y.toFixed(2)+'" width="'+barW.toFixed(2)+
    '" height="'+h.toFixed(2)+'" fill="'+(chosen?shade:ink)+'" stroke="'+ink+'" stroke-width=".65"/>');
   const spacing=Math.max(1,Math.ceil(count/Math.max(8,Math.floor(graphW/33))));
   if(k%spacing===0||k===n)parts.push('<path d="M'+x+' '+axis+'v5" stroke="#637985"/>',txt(k,x,axis+19,11));
  }
  parts.push(txt("P("+d.symbol+" = k)",left+2,top+2,11,"start"));
 }
 label();
 if(d.showParameters){
  const params=d.kind==="normal"?"\u03bc = "+fmt(q.mu)+"; \u03c3 = "+fmt(q.sigma):
   "n = "+q.n+"; p = "+fmt(q.p);
  parts.push(txt(params,W/2,H-47,12));
 }
 if(d.showProbability&&q.statement)parts.push(txt(q.statement,W/2,49,13));
 parts.push("</svg>");
 return parts.join("");
}
