import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read = relative => readFileSync(new URL("../"+relative, import.meta.url), "utf8");
const html = read("index.html");

test("IA Pathfinder static assets work from either GitHub Pages root", () => {
  const roots = [
    "https://chriswalker-afk.github.io/IB-IA-Planning-and-Writing/",
    "https://ia.mrwalkermaths.com/"
  ];
  const assets = ["styles.css", "data/examples.css", "data/representation-workspace.css", "app.js"];
  for (const asset of assets) {
    assert.match(html, new RegExp('(?:href|src)="\\./'+asset.replaceAll(".", "\\.")+'"'),
      "Source HTML must use relative asset paths: "+asset);
    for (const root of roots) {
      const actual = new URL("./"+asset, root);
      assert.equal(actual.origin, new URL(root).origin);
      assert.ok(actual.pathname.startsWith(new URL(root).pathname),
        asset+" must resolve within "+root);
    }
  }
  assert.doesNotMatch(html, /<base\\s+href=|(?:src|href)="\\/IB-IA-Planning-and-Writing\\//i,
    "Do not hardcode the project-path root into source HTML.");
});

test("PDF worker address is relative to whichever site is serving the application", () => {
  assert.match(read("src/handover/read-document.js"),
    /new URL\\("\\.\\/pdf\\.worker\\.min\\.mjs",document\\.baseURI\\)/,
    "PDF reading must load its worker from the active site, not an old hostname.");
});
