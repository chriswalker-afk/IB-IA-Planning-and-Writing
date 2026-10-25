import {buildBrowserVendor} from "./build-browser-vendor.mjs";
import {buildSiteStyles} from "./build-styles.mjs";
import {auditPublishedAssets} from "./audit-deploy-assets.mjs";
import {build} from "esbuild";
import {createHash} from "node:crypto";
import {copyFile,cp,mkdir,rm,stat,readFile,writeFile} from "node:fs/promises";
import path from "node:path";

const cwd=process.cwd(),out=path.join(cwd,"dist");
// The pinned vendor files and import map remain in the repository for browsing
// index.html directly or hosting the source without esbuild.
await buildBrowserVendor(cwd);
await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});

const sourceHtml=await readFile(path.join(cwd,"index.html"),"utf8");
const stylesheet=await buildSiteStyles({root:cwd,out,html:sourceHtml});
// esbuild resolves the npm imports inside app/chunks. The source-only import
// map points to fallback vendor files, which we deliberately don't publish
// twice in dist. Keep the worker: PDF fallback import still needs it.
const importMap=/<script type="importmap">[\s\S]*?<\/script>\s*/;
if(!importMap.test(stylesheet.html))
 throw new Error("The source-hosting import map changed; review the bundled HTML.");
const publishedHtml=stylesheet.html.replace(
 /^[ \t]*<!-- Also support static\/source hosting:[^\n]* -->\r?\n/m,""
).replace(importMap,"");
await writeFile(path.join(out,"index.html"),publishedHtml);

// data/catalog and data/sheets are original source-workbook audit records,
// not a browser database. They remain fully intact in GitHub, npm tests and
// source hosting; exclude them from the published site's payload.
// Retain the small route graph for historical deep links and source consumers.
await mkdir(path.join(out,"data"),{recursive:true});
await cp(path.join(cwd,"data/flow"),path.join(out,"data/flow"),{recursive:true});

// Preserve third-party license notices with the bundled distribution.
await mkdir(path.join(out,"licenses"),{recursive:true});
await Promise.all(["pdf-lib","docx","jszip","pdfjs-dist"].map(name=>
 copyFile(path.join(cwd,"vendor",name+"-LICENSE.txt"),
  path.join(out,"licenses",name+"-LICENSE.txt"))
));

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
// An old, cached app.js can point at an old hashed chunk removed on the next
// Pages deployment. Fingerprint the ENTRY URL too, not just lazy chunks.
// The public HTML is the release manifest; source-hosted HTML remains plain.
const entry=await readFile(path.join(out,"app.js"));
const release=createHash("sha256").update(entry).digest("hex").slice(0,16);
const script='<script type="module" src="./app.js"></script>';
if(!publishedHtml.includes(script))throw new Error("Cannot version the published app entry script");
await writeFile(path.join(out,"index.html"),
 publishedHtml.replace(script,'<script type="module" src="./app.js?v='+release+'"></script>'));
const app=await stat(path.join(out,"app.js"));
if(!app.size)throw new Error("Bundled website is empty.");
const summary=await auditPublishedAssets({root:cwd,out});
process.stdout.write(
 "IA Pathfinder static build created: dist/ ("+app.size+"-byte entry; "+
 stylesheet.files.length+" ordered source CSS files -> 1, "+
 stylesheet.originalBytes+" -> "+stylesheet.publishedBytes+" bytes; "+
 summary.totalFiles+" published files, "+summary.totalBytes+" bytes)\n"
);
