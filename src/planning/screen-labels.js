/** Student-facing Planning headings, shared by the question page and Discovery Trail.
 * Visit history is not evidence that a planning decision has been saved.
 */
export const PLANNING_SCREEN_TITLES=Object.freeze({
 N00:'Where are you starting?',
 N00B:'Find an idea worth exploring.',
 N00C:'My possible ideas',
 N01:'Give your idea a working title.',
 N01V:'Have a clear motivation.',
 N02:'What kind of investigation is this?',
 N02M:'Choose your course and explore possible mathematics.',
 N02U:'Explore your investigation type.',
 N02T:'This needs a teacher conversation.',
 N03:'Where will your data or evidence come from?',
 N03B:'Plan both evidence sources.',
 N03P:'What will I collect, and how?',
 N03P2:'How will I choose my data?',
 N03S:'Plan your secondary data.',
 N03R:'Improve the data route.',
 N03D:'Can you get started?',
 N03H:'Plan your IA time.',
 N04:'Which IB Mathematics course are you studying?',
 N04T:'Record mathematics for your teacher to review.',
 N04S:'Which mathematics might help answer your aim?',
 N01P:'What do you predict might happen?',
 N06T:'A brief teacher check-in.',
 N08:'What would you like to ask your teacher?',
 N06:'Your investigation plan at a glance.',
 N07:'Your provisional plan is ready to take forward.',
 // Retired screens may still appear in historical project snapshots.
 N03J:'Method justification is now optional.',
 N03E:'Readiness checks have been combined.',
 N03F:'The long practical checklist has moved.',
 N03G:'Practical manageability is now part of the evidence check.',
 N04R:'Mathematical refinement is now optional.',
 N04M:'Mathematical refinement is now optional.',
 N05V:'Your first mathematical representation belongs in IA Studio.',
 N05:'Your first mathematical representation belongs in IA Studio.',
 N06E:'Respond to discoveries as they occur.'
});
export function planningScreenTitle(node,state){
 if(node==='N00B'&&state?.ideaExplorer?.active)return 'Shape a possible idea.';
 if(node==='N00C'&&state?.ideaExplorer?.active)return 'Evaluate your own idea.';
 return PLANNING_SCREEN_TITLES[node]||'Review this planning question.';
}
