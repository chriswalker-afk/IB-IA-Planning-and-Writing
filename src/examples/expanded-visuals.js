/** Accessible, self-contained fictional illustrations for the expanded comparison library. */
const e=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const figure=(id,title,description,contents)=>'<svg class="ex-visual ex-expanded-svg" viewBox="0 0 560 310" role="img" aria-labelledby="'+id+'-title '+id+'-desc" xmlns="http://www.w3.org/2000/svg"><title id="'+id+'-title">'+e(title)+'</title><desc id="'+id+'-desc">'+e(description)+'</desc>'+contents+'</svg>';
const text=(x,y,value,cls="")=>'<text x="'+x+'" y="'+y+'" class="'+cls+'">'+e(value)+'</text>';
const segment=(x1,y1,x2,y2,cls="ex-viz-line")=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" class="'+cls+'"/>';
const dot=(x,y,cls="ex-viz-point")=>'<circle cx="'+x+'" cy="'+y+'" r="5" class="'+cls+'"/>';
const tbl=(caption,headers,rows)=>'<div class="ex-table-wrap"><table><caption>'+e(caption)+'</caption><thead><tr>'+headers.map(h=>'<th scope="col">'+e(h)+'</th>').join("")+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(x=>'<td>'+e(x)+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>';
function groups(good,id){
 const a=[8,9,10,11,12],b=[4,6,10,14,16],X=n=>85+20*n;
 let body=text(60,29,good?"Same mean; different variation":"Only the means","ex-viz-title")+
 segment(85,245,485,245);
 for(let x=0;x<=20;x+=5)body+=segment(X(x),241,X(x),249)+text(X(x)-5,271,x);
 body+=text(10,89,"Group A")+text(10,169,"Group B")+
 text(85,298,good?"Same horizontal scale for both groups":"Mean only; distribution hidden");
 if(good){for(let [arr,y] of [[a,85],[b,165]])for(let [i,x] of arr.entries())body+=dot(X(x),y+(i===2?-10:0));}
 else body+=dot(X(10),85)+dot(X(10),165);
 return figure(id,good?"Comparable group dot plots":"Two identical-looking means",good?"Both groups have mean ten; group A occupies eight to twelve, group B four to sixteen. The same scale is used.":"Only the two means appear, obscuring their different spreads.",body);
}
function periodic(good,id){
 const X=t=>68+t*(good?12:60),Y=y=>232-(y-1)*64;
 let body=text(60,29,good?"Three periods of fictional observations":"A short rise is not a proven cycle","ex-viz-title");
 body+=segment(68,55,68,232)+segment(68,232,510,232);
 for(let t=0;t<=(good?36:6);t+=(good?6:2))body+=text(X(t)-8,254,t);
 for(let v=1;v<=3;v++)body+=text(48,Y(v)+5,v);
 const value=t=>2+Math.cos((t-6)*Math.PI/6);
 const count=good?36:6;
 body+='<polyline class="ex-viz-curve" points="'+Array.from({length:count+1},(_,t)=>X(t).toFixed(2)+","+Y(value(t)).toFixed(2)).join(" ")+'"/>';
 for(let t=0;t<=count;t+=3)body+=dot(X(t),Y(value(t)));
 body+=text(230,286,"Elapsed time / hours");
 return figure(id,good?"Observed repeating sequence over 36 hours":"Only an initial 6-hour segment",good?"A fictional repeated 12-hour cycle is visible three times, with peaks near 6, 18 and 30 hours.":"A rising short segment is not sufficient to establish a sinusoidal cycle.",body);
}
function voronoi(good,id){
 const X=x=>100+x*52,Y=y=>245-y*34;
 let body=text(45,28,good?"Euclidean Voronoi boundaries":"Sites alone do not define the distance rule","ex-viz-title")+
 '<rect x="100" y="41" width="312" height="204" class="ex-viz-frame"/>';
 for(let n=0;n<=6;n+=2){body+=segment(X(n),245,X(n),249)+text(X(n)-6,268,n)+segment(96,Y(n),100,Y(n))+text(81,Y(n)+4,n);}
 if(good){
  body+=segment(X(3),Y(0),X(3),Y(3),"ex-viz-boundary");
  body+=segment(X(0),Y(3),X(3),Y(3),"ex-viz-boundary");
  body+=segment(X(3),Y(3),X(6),Y(6),"ex-viz-boundary");
  body+=dot(X(3),Y(3),"ex-viz-junction");
 }
 for(const [name,x,y] of [["A",1,1],["B",5,1],["C",1,5]]){
  body+=dot(X(x),Y(y))+text(X(x)+10,Y(y)-10,name);
 }
 body+=text(185,300,good?"x, y: same coordinate units":"Locations only; metric not given");
 return figure(id,good?"Three labelled sites and their Euclidean Voronoi boundaries":"Three unconnected service locations",good?"Sites A one one, B five one and C one five have boundary junction at three three, with x equals three, y equals three and the north-east x equals y branch.":"Sites alone do not justify any claimed shortest journey.",body);
}
export function expandedVisualFor(card,good,id){
 switch(card.visual){
 case "groups":return groups(good,id);
 case "periodic":return periodic(good,id);
 case "voronoi":return voronoi(good,id);
 case "twoway":return good?
   tbl("Fictional service-point outcomes, with late proportions",["Site","Late","On time","Late / total"],[["A","8","12","8/20 = 40%"],["B","6","24","6/30 = 20%"]]):
   tbl("Raw counts without the relevant proportions",["Site","Late"],[["A","8"],["B","6"]]);
 case "simulation":return good?
   tbl("Two independent fair flips: equally likely cases",["Outcome","At least one head?"],[["HH","Yes"],["HT","Yes"],["TH","Yes"],["TT","No"]]):
   tbl("Simulated trials (fictional)",["Trials","Successes"],[["100","72"]]);
 case "iteration":return good?
   tbl("First terms for xₙ₊₁ = (xₙ + 2/xₙ)/2",["n","xₙ"],[["0","1"],["1","1.5"],["2","1.416667…"],["3","1.414216…"]]):
   tbl("Calculator output without a justification",["Final displayed value"],[["1.414216"]]);
 default:return "";
 }
}
