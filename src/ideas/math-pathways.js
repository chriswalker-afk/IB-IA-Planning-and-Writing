/**
 * Idea Lab Pass 1: a shared mathematical vocabulary for both starting modes.
 *
 * These are invitations to investigate, not syllabus endorsements, prescribed
 * methods, completed aims, marks or results. Reuse the existing 16-route
 * Planning library rather than maintaining another mathematical taxonomy.
 *
 * IMPORTANT: This is an editorial catalogue for Pass 2, not yet a change to
 * the live mind-map choices or to any student's saved selections.
 */
import {INVESTIGATIVE_ROUTES} from '../planning/investigative-routes.js';
import {IDEA_MATH_DIRECTION_CARDS} from './math-direction-cards.js';

const lens=(routeId,label,mathsName,invitation)=>({routeId,label,mathsName,invitation});
export const IDEA_MATH_LENSES=Object.freeze([
 lens('relationships','Spot a connection','Relationships between variables',
  'Could two measurable quantities be related? Inspect the scatter and question what explains it.'),
 lens('groups','Compare fairly','Comparative statistics',
  'Could two genuinely comparable groups tell a more interesting story than their averages alone?'),
 lens('categorical','Compare choices','Categorical data and proportions',
  'Do the proportions differ, once categories and denominators have been defined fairly?'),
 lens('variation','Check consistency','Variation, distributions and reliability',
  'What does the spread of repeated values tell you about uncertainty or reliability?'),
 lens('fitted-models','Build and test a model','Functions and mathematical modelling',
  'Can you construct a useful relationship and test where its predictions work or break down?'),
 lens('growth','Explore change','Growth, decay and rates of change',
  'What changes with time, and is the pattern additive, proportional or neither?'),
 lens('cycles','Find a repeating pattern','Periodicity and trigonometric modelling',
  'Does something repeat in a way a mathematical model could describe and test?'),
 lens('trajectories','Model movement','Coordinate geometry and motion functions',
  'Can positions or a path be measured accurately enough to justify a motion model?'),
 lens('optimisation','Find the best','Optimisation under constraints',
  'What does “best” mean, and what restrictions make an optimum meaningful?'),
 lens('images','Measure a shape','Geometric approximations from images',
  'Can a calibrated drawing or photograph be turned into defensible measurements?'),
 lens('triangulation','Explore angles and distances','Trigonometry and measurement',
  'Can measured angles and lengths help estimate an otherwise difficult quantity?'),
 lens('voronoi','Explore what is nearest','Voronoi regions and spatial geometry',
  'How does a clearly defined distance rule divide an area between competing locations?'),
 lens('finance','Make a cost decision','Financial and piecewise models',
  'When might a cost or financial decision change as conditions and assumptions vary?'),
 lens('chance','Explore chance','Probability and expected outcomes',
  'How do stated rules and probability assumptions affect uncertain outcomes?'),
 lens('proof','Explain why','Conjectures, generalisation and proof',
  'Can you move beyond examples to justify when a mathematical claim is true?'),
 lens('iteration','Repeat a rule','Recurrence and convergence',
  'What happens when a numerical update is repeated, and can that behaviour be justified?')
]);
export const IDEA_MATH_LENS_BY_ROUTE=Object.freeze(Object.fromEntries(IDEA_MATH_LENSES.map(x=>[x.routeId,x])));
const routeById=new Map(INVESTIGATIVE_ROUTES.map(x=>[x.id,x]));
export const IDEA_MATH_COURSE_NOTE='These are possible mathematical starting points, not a guarantee of AI SL, AA SL or AA HL suitability. Decide on mathematical depth and techniques with your teacher. Proof, convergence and some specialist models need extra care.';

/** Evidence-led exploration should converge on the SAME route IDs as interests.
 * One measurable starting point may support several different mathematical jobs.
 * Each firstCheck asks students to verify access, units, provenance or permission.
 */
const evidence=(root,branch,question,firstCheck,routeIds,caution)=>Object.freeze({
 id:root+'.'+branch,root,branch,question,firstCheck,
 routeIds:Object.freeze(routeIds),caution
});
export const IDEA_DATA_MATH_ENTRYPOINTS=Object.freeze([
 evidence('measure','time','What could timing a real process reveal about variation or change?',
  'Time a small permitted example or inspect a dated record; identify the time unit and repeated conditions.',
  ['variation','growth','fitted-models','cycles'],
  'A few stopwatch readings do not establish a general law; recording must be safe.'),
 evidence('measure','shape','What mathematical question could measurements of a shape help answer?',
  'Make one labelled sketch or calibrated photograph; check dimensions, perspective and units.',
  ['images','triangulation','optimisation','fitted-models'],
  'An uncalibrated image cannot establish true lengths or an optimal design.'),
 evidence('measure','change','What changes as one measurable quantity changes?',
  'Record two correctly paired values or repeat a measurement at meaningful intervals.',
  ['growth','relationships','fitted-models','cycles'],
  'Do not call two observations a reliable trend or assume linearity.'),
 evidence('record','compare','What could a fair comparison reveal, beyond the mean?',
  'Define one observation and verify equal units, recording effort and comparable conditions.',
  ['groups','variation','relationships','categorical'],
  'Unequal recording effort, biased groups or inconsistent categories undermine comparisons.'),
 evidence('record','survey','How might carefully collected answers reveal meaningful differences?',
  'Check school permission, consent, anonymity, category wording and who would actually respond before collecting anything.',
  ['categorical','groups','relationships'],
  'Survey responses do not automatically represent a wider population; do not collect identifiable private information.'),
 evidence('record','repeat','How consistent is a repeated event, or how does it compare with a model of chance?',
  'Define one trial, its possible outcomes and whether conditions and independence can be defended.',
  ['variation','chance','groups'],
  'Repeated outcomes are not automatically independent, identical or binomial.'),
 evidence('find','weather','What could dated environmental measurements reveal?',
  'Identify a credible dataset, recording interval, units, missing values and the actual period covered.',
  ['cycles','variation','relationships','fitted-models'],
  'A limited weather series cannot establish causation or a long-term climate trend.'),
 evidence('find','published','What decision or relationship could a verifiable public dataset inform?',
  'Open the original source, check definitions, dates, units and whether figures are comparable.',
  ['finance','groups','relationships','fitted-models'],
  'Public figures may use different denominators or definitions; do not infer data quality from a chart.'),
 evidence('find','image','What geometric or motion question could a permitted image support?',
  'Check rights to use the image and whether a scale, viewpoint or timestamp can actually be established.',
  ['images','trajectories','triangulation','fitted-models'],
  'Pixels alone are not metres, and a single still image cannot provide time or speed.')
]);
const evidenceById=new Map(IDEA_DATA_MATH_ENTRYPOINTS.map(x=>[x.id,x]));
const cardById=new Map(IDEA_MATH_DIRECTION_CARDS.map(x=>[x.id,x]));

/** Cards retain a route ID and optional old seed references for Pass 2.
 * Choosing a route does not choose a technique or populate Planning answers.
 */
export const ideaMathRoute=routeId=>routeById.get(routeId)||null;
export const ideaMathLens=routeId=>IDEA_MATH_LENS_BY_ROUTE[routeId]||null;
export const ideaMathCardById=id=>cardById.get(id)||null;
export const ideaMathDirectionsForTopic=topicId=>IDEA_MATH_DIRECTION_CARDS
 .filter(x=>x.topicId===topicId)
 .map(card=>({...card,lens:ideaMathLens(card.routeId),route:ideaMathRoute(card.routeId)}));
export const ideaMathEvidenceEntry=(root,branch)=>evidenceById.get(root+'.'+branch)||null;
export const ideaMathDirectionsForEvidence=(root,branch,topicId='')=>{
 const entry=ideaMathEvidenceEntry(root,branch);
 if(!entry)return [];
 const cards=topicId?ideaMathDirectionsForTopic(topicId):[];
 return entry.routeIds.map(routeId=>({
  routeId,lens:ideaMathLens(routeId),route:ideaMathRoute(routeId),
  evidenceQuestion:entry.question,firstCheck:entry.firstCheck,caution:entry.caution,
  // Contextual examples are optional: never pretend the student has chosen a topic.
  contextualCards:cards.filter(card=>card.routeId===routeId)
 }));
};
