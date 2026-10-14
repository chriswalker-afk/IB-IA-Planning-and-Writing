import {build} from "esbuild";
import {copyFile,cp,mkdir,rm,stat} from "node:fs/promises";
import path from "node:path";

const cwd=process.cwd(),out=path.join(cwd,"dist");
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
await Promise.all([
 copyFile(path.join(cwd,"index.html"),path.join(out,"index.html")),
 copyFile(path.join(cwd,"styles.css"),path.join(out,"styles.css")),
 cp(path.join(cwd,"data"),path.join(out,"data"),{recursive:true})
]);
await build({
 entryPoints:[path.join(cwd,"app.js")],
 outdir:out,bundle:true,splitting:true,format:"esm",platform:"browser",
 target:["es2022"],entryNames:"app",chunkNames:"chunks/[name]-[hash]",
 minify:true,sourcemap:false,legalComments:"none",
 logLevel:"info"
});
await copyFile(
 path.join(cwd,"node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs"),
 path.join(out,"pdf.worker.min.mjs")
);
const app=await stat(path.join(out,"app.js"));
if(!app.size)throw new Error("Bundled website is empty.");
process.stdout.write("IA Pathfinder static build created: dist/ ("+app.size+"-byte entry)\n");
