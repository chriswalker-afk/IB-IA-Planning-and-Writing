/** Original monochrome reference drawing, generated identically in Node/browser.
 * The ordered polygon and 120-pixel scale are defined in leaf-area.js. A small
 * one-bit PNG keeps the complete editable project independent of remote assets.
 */
const width=640,height=410,stride=width/8;
const pixels=new Uint8Array(stride*height).fill(255);
const point=(x,y)=>{if(x>=0&&x<width&&y>=0&&y<height)pixels[y*stride+(x>>3)]&=~(128>>(x&7));};
function line(x0,y0,x1,y1){
 const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;
 let error=dx+dy;
 for(;;){point(x0,y0);point(x0+1,y0);if(x0===x1&&y0===y1)break;
  const twice=2*error;if(twice>=dy){error+=dy;x0+=sx;}if(twice<=dx){error+=dx;y0+=sy;}}
}
const upper=[0,1.2,1.8,2.1,2,1.8,1.5,.9,0],lower=[0,-.8,-1.3,-1.5,-1.6,-1.5,-1.1,-.7,0];
const outline=[...upper.map((y,x)=>[80+60*x,205-60*y]),...[7,6,5,4,3,2,1].map(x=>[80+60*x,205-60*lower[x]])];
for(let i=0;i<outline.length;i++)line(...outline[i],...outline[(i+1)%outline.length]);
line(80,345,200,345);line(80,338,80,352);line(200,338,200,352);
const glyphs={
 '2':['111','001','111','100','111'],C:['111','100','100','100','111'],M:['10001','11011','10101','10001','10001'],
 O:['111','101','101','101','111'],N:['1001','1101','1011','1001','1001'],S:['111','100','111','001','111'],
 T:['111','010','010','010','010'],R:['110','101','110','101','101'],U:['101','101','101','101','111'],
 E:['111','100','110','100','111'],D:['110','101','101','101','110'],L:['100','100','100','100','111'],
 A:['010','101','111','101','101'],F:['111','100','110','100','100']};
function label(text,x,y,scale){for(const c of text){if(c===' '){x+=4*scale;continue;}const g=glyphs[c];
 for(let r=0;r<5;r++)for(let col=0;col<g[r].length;col++)if(g[r][col]==='1')
  for(let a=0;a<scale;a++)for(let b=0;b<scale;b++)point(x+col*scale+a,y+r*scale+b);
 x+=(g[0].length+1)*scale;}}
label('CONSTRUCTED LEAF',80,28,3);label('2 CM',109,365,2);
const u32=n=>[(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255];
const crc=bytes=>{let c=-1;for(const b of bytes){c^=b;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);}return(c^-1)>>>0;};
const chunk=(name,data)=>{const payload=[...name].map(c=>c.charCodeAt(0)).concat(Array.from(data));return [...u32(data.length),...payload,...u32(crc(payload))];};
const raw=new Uint8Array((stride+1)*height);for(let y=0;y<height;y++)raw.set(pixels.subarray(y*stride,(y+1)*stride),y*(stride+1)+1);
let a=1,b=0;for(const v of raw){a=(a+v)%65521;b=(b+a)%65521;}
const n=raw.length,deflate=[120,1,1,n&255,n>>8,(~n)&255,((~n)>>8)&255,...raw,...u32((b*65536+a)>>>0)];
const png=[137,80,78,71,13,10,26,10,...chunk('IHDR',[...u32(width),...u32(height),1,0,0,0,0]),...chunk('IDAT',deflate),...chunk('IEND',[])];
export const LEAF_IMAGE='data:image/png;base64,'+btoa(png.map(n=>String.fromCharCode(n)).join(''));
