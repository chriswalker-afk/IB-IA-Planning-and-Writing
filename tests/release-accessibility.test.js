import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {stylePaths} from "../scripts/build-styles.mjs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("a visible-on-focus skip link precedes all header controls and targets a labelled landmark",()=>{
 const html=read("index.html");
 const header=html.slice(html.indexOf('<header class="topbar">'),html.indexOf("</header>"));
 assert(header.includes('<a class="skip-link" href="#main">Skip to main content</a>'));
 assert(header.indexOf("skip-link")<header.indexOf('class="brand"'));
 assert.equal((html.match(/id="main"/g)||[]).length,1);
 assert.match(html,/<main id="main" class="main" tabindex="-1" aria-label="Current IA Pathfinder workspace"><\/main>/);
 assert.match(html,/<div id="screenAnnouncement" class="visually-hidden" role="status" aria-live="polite" aria-atomic="true"><\/div>/);
 assert.equal((html.match(/class="skip-link"/g)||[]).length,1);
});

test("browser-file inputs are trigger-only, never invisible keyboard tab stops",()=>{
 const html=read("index.html");
 const files=[...html.matchAll(/<input id="(?:importFile|reportImportFile|graphCsvFile|statCsvFile|tableCsvFile|voronoiCsvFile|voronoiMapFile|imageTraceFile)"[^>]*>/g)];
 assert.equal(files.length,8);
 for(const match of files){
  assert(match[0].includes('class="visually-hidden"'));
  assert(match[0].includes('tabindex="-1"'),match[0]);
  assert(match[0].includes("aria-label="),match[0]);
 }
 assert(!html.includes('<svg class="icon">'),"Static decorative SVGs require aria-hidden");
});

test("navigation announcements are screen-change-only and focus remains with student input on previews",()=>{
 const app=read("app.js");
 assert.match(app,/let lastAccessibleScreen=""/);
 assert.match(app,/function accessibleScreenIdentity\(\)/);
 assert.match(app,/if\(screen!==lastAccessibleScreen\)/);
 assert.match(app,/region.textContent=/);
 assert.match(app,/const hadFocusInsideMain=/);
 assert.match(app,/if\(!opts.top&&hadFocusInsideMain&&layer.hidden&&/);
 assert.match(app,/main.focus\(\{preventScroll:true\}\)/);
 assert.match(app,/document.querySelector\("\.skip-link"\)\?\.addEventListener\("click"/);
 assert.match(app,/main.scrollIntoView\(\{block:"start",behavior:"auto"\}\)/);
 assert.match(app,/document.querySelectorAll\('\.side-link\[data-nav\],\.mobile-nav-link\[data-nav\],\.tablet-nav \[data-nav\]'\)/);
 assert(app.includes('if(current)b.setAttribute("aria-current","page")'));
});

test("reduced-motion preference applies to JavaScript scrolling as well as CSS",()=>{
 const app=read("app.js");
 assert.match(app,/const preferredScrollBehavior=\(\)=>window.matchMedia\?\.\("\(prefers-reduced-motion: reduce\)"\)/);
 assert.equal((app.match(/behavior:preferredScrollBehavior\(\)/g)||[]).length,5);
 assert(!app.includes('behavior:"smooth"'),"No mandatory smooth JS scroll remains");
 const css=read("data/release-accessibility.css");
 assert(css.includes("@media(prefers-reduced-motion:reduce)"));
 assert(css.includes("html{scroll-behavior:auto!important}"));
 assert(css.includes("animation-duration:.01ms!important"));
});

test("reflow, focus and physical navigation targets are scoped without suppressing specialist diagrams",()=>{
 const css=read("data/release-accessibility.css");
 for(const target of [
  ".skip-link:focus",".topbar .icon-button",".mobile-nav-link",
  ".drawer-header","@media(max-width:760px)","@media(max-width:400px)",
  "overscroll-behavior:contain","min-height:52px","font-size:16px",
  "@media(forced-colors:active)","outline:3px solid Highlight"
 ])assert(css.includes(target),target);
 assert(!css.includes("overflow-x:hidden"),"Do not hide genuine reflow errors");
 assert(!css.includes(".svg-figure"),"Do not blindly resize mathematical SVGs");
 assert(!css.includes("pointer-events:none"),"Controls must remain operable");
 assert(css.includes("scroll-margin-top"),"Sticky heading must not obscure in-page navigation");
});

test("all navigation destinations remain present on mobile and sidebar and the release order is preserved",()=>{
 const html=read("index.html"),paths=stylePaths(html);
 assert.equal(paths.length,37);
 assert.equal(paths.at(-1),"data/release-accessibility.css");
 for(const path of ["data/release-design-system.css","data/workspace-navigation.css",
  "data/release-guidance.css","data/release-representation.css"])assert(paths.includes(path));
 for(const route of ["home","planning","completing","checking","path"]){
  assert(html.includes('<button data-nav="'+route+'" class="mobile-nav-link'));
  assert(html.includes('<button data-nav="'+route+'" class="side-link'));
 }
 assert(html.includes('class="mobile-nav" aria-label="Main navigation"'));
 assert(html.includes('class="side-links"'));
});

test("accessibility browser gate runs across narrow phones, tablets and desktop",()=>{
 const ci=read(".github/workflows/release-accessibility-browser.yml");
 const script=read("scripts/release-accessibility-browser.py");
 assert(ci.includes("scripts/release-accessibility-browser.py"));
 assert(ci.includes("npm run build"));
 assert(ci.includes("python -m http.server 8765 --directory dist"));
 assert(script.includes("(320,390,768,1024,1440)"));
 assert(script.includes('p.keyboard.press("Tab")'));
 assert(script.includes('p.keyboard.press("Shift+Tab")'));
 assert(script.includes('p.keyboard.press("Escape")'));
 assert(script.includes('p.keyboard.press("Enter")'));
 assert(script.includes('reduced_motion="reduce"'));
 assert(script.includes("assert_reflow"));
});
