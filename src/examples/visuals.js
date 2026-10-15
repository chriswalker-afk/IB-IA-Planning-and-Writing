import {NUMERICAL_EXAMPLE as D} from './catalog.js';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const svg=(id,title,desc,body,height=350)=>`<svg class="ex-visual" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 ${height}" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${esc(title)}</title><desc id="${id}-desc">${esc(desc)}</desc>${body}</svg>`;
const label=(x,y,s,extra='')=>`<text x="${x}" y="${y}" ${extra}>${esc(s)}</text>`;
const line=(x1,y1,x2,y2,cl='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cl}"/>`;
function graph(good,id){
 const X=t=>65+t*22,Y=t=>274-(t-30)*3.8;
 let b=label(280,27,good?'Cooling observations and fitted models':'Chart 1','text-anchor="middle" class="ex-svg-title"');
 for(const t of [0,5,10,15,20]){b+=line(X(t),274,X(t),281)+label(X(t),299,t,'text-anchor="middle"');}
 for(const t of [30,40,50,60,70,80,90])b+=line(65,Y(t),507,Y(t),'ex-grid')+label(56,Y(t)+5,t,'text-anchor="end"');
 b+=line(65,46,65,274)+line(65,274,507,274);
 const path=fn=>Array.from({length:101},(_,i)=>{const t=i/5;return `${i?'L':'M'}${X(t).toFixed(2)} ${Y(fn(t)).toFixed(2)}`;}).join(' ');
 b+=`<path class="ex-model-linear" d="${path(t=>D.m*t+D.b)}"/><path class="ex-model-exp" d="${path(t=>23+D.A*Math.exp(-D.k*t))}"/>`;
 if(!good)b+=`<polyline class="ex-connected" points="${D.time_min.map((t,i)=>`${X(t)},${Y(D.temperature_degC[i])}`).join(' ')}"/>`;
 b+=D.time_min.map((t,i)=>`<circle class="ex-point" cx="${X(t)}" cy="${Y(D.temperature_degC[i])}" r="4.4"/>`).join('');
 b+=label(280,326,good?'Time after first reading, t / min':'x','text-anchor="middle"');
 b+=label(18,166,good?'Temperature, T / °C':'y','transform="rotate(-90 18 166)" text-anchor="middle"');
 b+=`<circle class="ex-point" cx="77" cy="350" r="4"/>`+label(90,355,good?'Readings':'Series 1');
 b+=line(212,350,244,350,'ex-model-linear')+label(251,355,good?'Linear fit':'Series 2');
 b+=line(371,350,403,350,'ex-model-exp')+label(410,355,good?'Exponential':'Series 3');
 return svg(id,good?'Labelled cooling graph':'Less effective unlabelled graph',good?'Eleven fictional temperature readings from zero to twenty minutes, a linear model and an exponential model. Readings and the exponential curve flatten over time. Line styles distinguish the fits.':'The same readings and curves use undefined axes and generic series labels. Connecting the readings adds an unexplained line.',b,374);
}
function residual(id){
 const X=t=>65+t*22,Y=r=>165-r*18;let b=label(280,25,'Residuals of the linear fit','text-anchor="middle" class="ex-svg-title"');
 for(const v of [-4,-2,0,2,4,6])b+=line(65,Y(v),507,Y(v),v===0?'ex-zero':'ex-grid')+label(54,Y(v)+5,v,'text-anchor="end"');
 for(const t of [0,5,10,15,20])b+=label(X(t),278,t,'text-anchor="middle"');
 b+=line(65,44,65,254)+line(65,254,507,254)+D.time_min.map((t,i)=>`<circle class="ex-point" cx="${X(t)}" cy="${Y(D.temperature_degC[i]-D.m*t-D.b)}" r="5"/>`).join('');
 b+=label(280,313,'Time after first reading / min','text-anchor="middle"')+label(18,158,'Observed − predicted / °C','transform="rotate(-90 18 158)" text-anchor="middle"');
 return svg(id,'Linear-fit residual plot','Residuals are positive near the beginning and end of the observed interval and negative in the middle, indicating missed curvature.',b,336);
}
function box(good,id){
 const face='<path class="ex-box-face" d="M160 250 L343 212 L437 256 L254 299 Z"/><path class="ex-box-face" d="M160 250 L160 310 L254 355 L254 299 M254 355 L437 312 L437 256"/>';
 if(!good)return svg(id,'Unlabelled open-box illustration','An open box without any dimensions. Its relation to a formula is unspecified.',label(280,30,'A box','text-anchor="middle"')+`<g transform="translate(0 -108)">${face}</g>`,290);
 let b=label(280,24,'Net and open box (schematic)','text-anchor="middle" class="ex-svg-title"');
 b+='<rect class="ex-sheet" x="115" y="57" width="300" height="150"/>';
 for(const [x,y] of [[115,57],[380,57],[115,172],[380,172]])b+=`<rect class="ex-cut" x="${x}" y="${y}" width="35" height="35"/>`;
 b+='<rect class="ex-fold" x="150" y="92" width="230" height="80"/>';
 b+=label(265,47,'30 cm','text-anchor="middle"')+label(433,138,'20 cm')+label(133,81,'x','text-anchor="middle"');
 b+=label(265,135,'base','text-anchor="middle"')+face;
 b+=label(144,294,'x','text-anchor="end"')+label(348,353,'30 − 2x','text-anchor="middle"')+label(181,350,'20 − 2x','text-anchor="middle"');
 b+=label(280,390,'All variable lengths are in cm; 0 < x < 10.','text-anchor="middle"');
 return svg(id,'Labelled box net and folded model','A thirty by twenty centimetre rectangle with equal x centimetre squares removed at four corners. The open box has height x, length thirty minus two x, and width twenty minus two x. Positive dimensions require zero less than x less than ten.',b,410);
}
function discrete(good,id){
 const X=n=>60+n*104,Y=v=>268-v*12;let b=label(280,27,good?'Calculated integer cases':'A continuous curve?','text-anchor="middle" class="ex-svg-title"')+line(60,48,60,268)+line(60,268,510,268);
 for(let n=1;n<=4;n++)b+=label(X(n),290,n,'text-anchor="middle"');
 for(const v of [0,4,8,12,16])b+=label(52,Y(v)+4,v,'text-anchor="end"')+line(60,Y(v),510,Y(v),'ex-grid');
 if(!good)b+=`<path class="ex-model-exp" d="${Array.from({length:81},(_,i)=>{const n=1+3*i/80;return `${i?'L':'M'}${X(n)} ${Y(n*n)}`;}).join(' ')}"/>`;
 for(let n=1;n<=4;n++)b+=`<circle class="ex-point" cx="${X(n)}" cy="${Y(n*n)}" r="5"/>`;
 b+=label(284,320,good?'Number of tiles, n (positive integers)':'n','text-anchor="middle"')+label(17,160,good?'Calculated count':'y','transform="rotate(-90 17 160)" text-anchor="middle"');
 return svg(id,good?'Discrete graph':'Less effective continuous graph',good?'Separate points (1,1), (2,4), (3,9), (4,16) with integer-domain labels.':'The same points are joined by a smooth curve, suggesting non-integer inputs without justification.',b,342);
}
function categorical(good,id){
 const vals=[8,12,5];let b=label(280,28,good?'Frequency by category':'Category trend?','text-anchor="middle" class="ex-svg-title"')+line(65,50,65,260)+line(65,260,502,260);
 for(const v of [0,4,8,12])b+=label(55,265-v*16,v,'text-anchor="end"')+line(65,260-v*16,502,260-v*16,'ex-grid');
 vals.forEach((v,i)=>{const x=142+i*139;b+=good?`<rect class="ex-bar" x="${x-28}" y="${260-v*16}" width="56" height="${v*16}"/>`:`<circle class="ex-point" cx="${x}" cy="${260-v*16}" r="5"/>`;b+=label(x,286,['A','B','C'][i],'text-anchor="middle"');});
 if(!good)b+='<polyline class="ex-model-exp" points="142,132 281,68 420,180"/>';
 b+=label(283,318,'Category','text-anchor="middle"')+label(18,157,good?'Frequency (count)':'y','transform="rotate(-90 18 157)" text-anchor="middle"');
 return svg(id,good?'Categorical frequencies':'Less effective connected categories',good?'Bars of height 8, 12 and 5 for categories A, B and C with a zero-baseline frequency axis.':'A connected line implies values between categories A, B and C.',b,340);
}
const table=(caption,headers,rows)=>'<div class="ex-table-wrap"><table><caption>'+esc(caption)+'</caption><thead><tr>'+headers.map(h=>'<th scope="col">'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(v=>'<td>'+esc(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
export function visualFor(card,good,id){
 switch(card.visual){
  case 'graph':return graph(good,id);
  case 'residual':return good?residual(id):'';
  case 'table':return good?table('Table 1. First three fictional readings',['Time, t / min','Temperature, T / °C'],[['0','82.0'],['2','73.6'],['4','66.8']]):table('',['x','y'],[['0','82'],['2','73.6'],['4','66.80000']]);
  case 'comparison':return good?table('Table 2. In-sample fit to eleven fictional readings',['Model','RMSE / °C'],[['Linear','2.90'],['Exponential (23°C limit)','0.259']]):'';
  case 'diagram':return box(good,id);
  case 'discrete':return discrete(good,id);
  case 'categorical':return categorical(good,id);
  case 'equations':return good?'<div class="ex-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mrow><mover><mi>T</mi><mo>^</mo></mover><mo>(</mo><mi>t</mi><mo>)</mo><mo>=</mo><mn>23</mn><mo>+</mo><mn>58.9555</mn><msup><mi>e</mi><mrow><mo>−</mo><mn>0.07485275</mn><mi>t</mi></mrow></msup></mrow></math><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mrow><mi>t</mi><mo>=</mo><mfrac><mrow><mi>ln</mi><mo>(</mo><mn>58.9555</mn><mo>/</mo><mn>27</mn><mo>)</mo></mrow><mn>0.07485275</mn></mfrac><mo>≈</mo><mn>10.433</mn></mrow></math></div>':'';
  case 'proof':return good?'<div class="ex-equation"><math xmlns="http://www.w3.org/1998/Math/MathML" display="block"><mrow><msup><mi>n</mi><mn>3</mn></msup><mo>−</mo><mi>n</mi><mo>=</mo><mi>n</mi><mo>(</mo><mi>n</mi><mo>−</mo><mn>1</mn><mo>)</mo><mo>(</mo><mi>n</mi><mo>+</mo><mn>1</mn><mo>)</mo></mrow></math></div>':'';
  default:return '';
 }
}
