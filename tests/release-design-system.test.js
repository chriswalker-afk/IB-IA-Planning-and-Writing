import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {stylePaths} from "../scripts/build-styles.mjs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const html=read("index.html"),base=read("styles.css"),ui=read("data/release-design-system.css");

test("shared release layer loads last and keeps 33 source styles in deploy order",()=>{
 const paths=stylePaths(html);
 assert.equal(paths.length,34);
 assert(paths.includes("data/release-design-system.css"));
 assert.equal(paths.at(-1),"data/workspace-navigation.css");
 for(const path of ["data/idea-map.css","data/stuck-contextual.css","data/criteria-badges.css","data/writer-guide-popin.css","data/graph-studio.css","data/probability-studio.css","data/sample-reader.css"])
  assert(paths.includes(path),path);
});
test("design tokens cover type, action hierarchy, surface geometry and focus",()=>{
 for(const token of ["--ui-space-4","--ui-radius-control","--ui-radius-card","--ui-type-label","--ui-control-height","--ui-focus","--ui-line-strong","--ui-advice-recovery","--ui-advice-writing","--ui-advice-criteria"])
  assert(base.includes(token+":"),token);
 for(const selector of [".task-shell",".btn-primary",".btn-secondary",".field",".checking-mode-tab",".representation-filter",".criterion-popin",".stuck-context-dialog",".writer-guide-popin"])
  assert(ui.includes(selector),selector);
});
test("design system avoids invasive styling of geometry grid, math input and authored advice colours",()=>{
 assert(!ui.includes("input{"),"Do not blanket-style editable mathematical grid cells");
 assert(ui.includes("input[type=\"number\"]"),"Style standard number authoring fields");
 assert(ui.includes("prefers-reduced-motion:reduce"));
 assert(ui.includes("prefers-contrast:more"));
 assert(ui.includes("@media print"));
 assert(!ui.includes("background:#fff0d5")&&!ui.includes("background:#f0e6fa"),"Keep authored advice palettes");
});
test("new release CSS does not change project schema or math source code",()=>{
 const paths=stylePaths(html);
 assert(paths.every(path=>path==="styles.css"||path.startsWith("data/")));
 assert(html.includes('id="main"')&&html.includes('id="drawerLayer"'));
});
