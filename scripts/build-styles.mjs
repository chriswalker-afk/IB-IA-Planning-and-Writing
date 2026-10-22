/** Publish one stylesheet while leaving all editable source CSS untouched.
 * The link order in index.html is the canonical cascade, including mobile
 * overrides, criteria pop-ins and all seven mathematical studios.
 */
import {readFile,writeFile} from "node:fs/promises";
import path from "node:path";
import {transform} from "esbuild";

// Source index.html uses one local CSS link per line. Do not match remote links.
export const CSS_LINK=/^[ \t]*<link rel="stylesheet" href="\.\/([^"]+\.css)">[ \t]*\r?\n/gm;

export function stylePaths(html){
 const files=[...html.matchAll(CSS_LINK)].map(m=>m[1]);
 if(files.length<25||files[0]!=="styles.css"||new Set(files).size!==files.length)
  throw new Error("Unexpected CSS source order or duplicate style link; review index.html before bundling.");
 for(const file of files){
  if(path.posix.isAbsolute(file)||file.includes("..")||
   !(file==="styles.css"||/^data\/[a-z0-9-]+\.css$/.test(file)))
   throw new Error("Unapproved stylesheet path: "+file);
 }
 return files;
}
function checkRelativeAssets(css,file,index){
 // URLs with paths must be rebased when styles from data/ are moved to root.
 // No current source CSS uses a relative image/font URL; fail rather than
 // silently breaking a figure background in a future style edit.
 for(const match of css.matchAll(/url\(\s*(["']?)([^"'()]+)\1\s*\)/gi)){
  const target=match[2].trim();
  if(!/^(https?:|data:|\/\/|#)/i.test(target))
   throw new Error("Unrebased CSS asset in "+file+": "+target);
 }
 if(index>0&&/@import\b/i.test(css))
  throw new Error("Late @import in "+file+" needs explicit cascade handling.");
}

export async function buildSiteStyles({root=process.cwd(),out,html}){
 const files=stylePaths(html);
 const sources=await Promise.all(files.map(async(file,i)=>{
  const css=await readFile(path.join(root,file),"utf8");
  checkRelativeAssets(css,file,i);
  return css;
 }));
 // Preserve source order precisely. esbuild only minifies CSS; it does not
 // apply class renaming, purge selectors or make heuristic unused-page guesses.
 const joined=sources.join("\n\n");
 const result=await transform(joined,{loader:"css",minify:true,
  legalComments:"none",target:["es2022"],sourcefile:"site.css"});
 if(!result.code||result.code.length<10000)
  throw new Error("Unexpected empty or invalid published stylesheet.");
 await writeFile(path.join(out,"site.css"),result.code);
 let seen=0;
 let page=html.replace(CSS_LINK,()=>{
  seen++;
  return seen===1?'  <link rel="stylesheet" href="./site.css">\n':"";
 });
 if(seen!==files.length||stylePaths(html).length!==seen)
  throw new Error("CSS link replacement was incomplete.");
 if(/<link rel="stylesheet" href="\.\/data\//.test(page))
  throw new Error("An unbundled student-facing stylesheet remains.");
 return {html:page,files,originalBytes:Buffer.byteLength(joined),publishedBytes:Buffer.byteLength(result.code)};
}
