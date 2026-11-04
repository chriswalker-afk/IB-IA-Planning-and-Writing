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
    assert.ok(html.includes('href="./'+asset+'"') || html.includes('src="./'+asset+'"'),
      "Source HTML must use relative asset paths: "+asset);
    for (const root of roots) {
      const actual = new URL("./"+asset, root);
      assert.equal(actual.origin, new URL(root).origin);
      assert.ok(actual.pathname.startsWith(new URL(root).pathname),
        asset+" must resolve within "+root);
    }
  }
  assert.ok(!html.includes('<base ') && !html.includes('src="/IB-IA-Planning-and-Writing/')
    && !html.includes('href="/IB-IA-Planning-and-Writing/'),
    "Do not hardcode the project-path root into source HTML.");
});

test("PDF worker address is relative to whichever site is serving the application", () => {
  assert.ok(read("src/handover/read-document.js").includes('new URL("./pdf.worker.min.mjs",document.baseURI)'),
    "PDF reading must load its worker from the active site, not an old hostname.");
});
