# Report exports: source-hosted browser repair

## Reproduced failure

The report-button browser check on the published site reproduced both errors:

- PDF: `Failed to resolve module specifier "pdf-lib"`.
- Word: `Failed to resolve module specifier "docx"`.

The same buttons succeeded against `dist`. Source modules were being served on the live route, but browsers cannot resolve npm package names without an import map. This was a loading failure, not an invalid student plan. The earlier diagnostic selector was corrected to follow the real Backups & reports -> View readable working record route.

## Repair

`index.html` now supplies an import map *before* the module entry. All document dependencies are hosted within this repository: pdf-lib, docx, JSZip and the PDF.js legacy module/worker. No CDN, remote document processing, account, or browser-storage reset is introduced. Both source hosting and the normal bundled build work. The importer can use the same local libraries.

`node scripts/build-browser-vendor.mjs` regenerates the browser-ready modules from the exact versions in `package.json`, includes licence notices, and writes a version/hash manifest. Generated assets are committed so a host serving the source tree does not need to execute npm. The normal build regenerates and includes the same assets.

## Regression coverage

Unit checks verify map ordering, local URLs, dependency versions, asset hashes and licences. The browser workflow checks the actual PDF/Word buttons with empty and populated projects on desktop and with a populated project on a phone-sized viewport, using the GitHub Pages subdirectory on both source and built hosts. It checks file signatures, embedded planning reimport and preservation of project content. A post-deployment run repeats the six exports against the published URL. Test fixtures are fictional; no user's saved project is sent to the server.

These exports remain **planning reports**, not the finished IA or a backup of every Studio record. The full JSON backup is unchanged. The unrelated design-cohesion branch is not included in this repair.
