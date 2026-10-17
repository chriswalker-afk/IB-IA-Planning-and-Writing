/**
 * UI migration bridge. Phase 0's ten screens resemble parts of the workbook;
 * these IDs are reference anchors, NOT a claim of full implemented coverage.
 * Phase 2 will replace this list with real graph navigation.
 */
export const PROTOTYPE_PLANNING_NODE_REFS=Object.freeze([
  "N00","N01","N01V","N02","N03","N03E","N04S","N01P","N05V","N07"
]);
export const PROTOTYPE_STUDIO_NODE_REFS=Object.freeze({
  intro:"C10",data:"C20",math:"C35",conclusion:"C60",review:"C90"
});
export function referenceNodeForPrototypeStep(index){
  return PROTOTYPE_PLANNING_NODE_REFS[Math.max(0,Math.min(PROTOTYPE_PLANNING_NODE_REFS.length-1,Number(index)||0))];
}
