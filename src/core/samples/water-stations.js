import {R,f,graph,table,finishDecisionSpec} from './decision-sample-tools.js';
import {newGeometryDraft,normalizeGeometryDraft} from '../../diagrams/geometry-core.js';
import {newVoronoiDraft,normalizeVoronoiDraft} from '../../diagrams/voronoi-core.js';
export const WATER_EXISTING=Object.freeze([[20,20],[100,20]].map(Object.freeze));
export const WATER_POINTS=Object.freeze([[10,60],[30,70],[60,70],[90,70],[110,60],[60,30]].map(Object.freeze));
export const WATER_CANDIDATES=Object.freeze([[30,60],[60,60],[90,60]].map(Object.freeze));
export const waterDistances=sites=>WATER_POINTS.map(q=>Math.min(...sites.map(s=>Math.hypot(q[0]-s[0],q[1]-s[1]))));
export const WATER_DISTANCE_ROWS=Object.freeze([waterDistances(WATER_EXISTING),...WATER_CANDIDATES.map(c=>waterDistances([...WATER_EXISTING,c]))].map(Object.freeze));
const [before,west,centre,east]=WATER_DISTANCE_ROWS;
const sum=a=>a.reduce((s,x)=>s+x,0),weighted=(ds,w)=>(w*(ds[0]+ds[1])+sum(ds.slice(2)))/(2*w+4);
export const waterWeightedDifference=w=>weighted(west,w)-weighted(centre,w);
export const WATER_WEIGHT_THRESHOLD=(sum(west.slice(2))-sum(centre.slice(2)))/(sum(centre.slice(0,2))-sum(west.slice(0,2)));
const provenance='Water Station Site v1: a defined 120 m by 80 m rectangular site, not a real campus map. Existing model stations A=(20,20), B=(100,20); six fixed check points Q1=(10,60), Q2=(30,70), Q3=(60,70), Q4=(90,70), Q5=(110,60), Q6=(60,30). The only feasible candidate sites in this problem are W=(30,60), C=(60,60), E=(90,60). The original objective is the largest straight-line nearest-station distance among those six points. Later, an alternative demand scenario weights Q1 and Q2 by w>=1 and the other points by 1. No measured pedestrian counts, permissions, station capacity or actual walking routes are asserted.';
const map=newGeometryDraft('rectangle');
Object.assign(map,{title:'Defined site, stations and six check points',figureNumber:'1',mode:'coordinate',unit:'m',sourceKind:'theoretical',sourceCredit:'My defined site rectangle and coordinates.',
 showGrid:true,showCaption:true,showLengths:false,showCoordinates:false,filled:false,
 vertices:map.vertices.map((v,i)=>({...v,label:['O','R','S','T'][i],x:[0,120,120,0][i],y:[0,0,80,80][i],edgeLabel:i===0?'120 m':i===1?'80 m':''})),
 auxPoints:[...WATER_EXISTING.map((p,i)=>({id:'p-station-'+i,label:['A','B'][i],x:p[0],y:p[1],labelDx:0,labelDy:0})),...WATER_POINTS.map((p,i)=>({id:'p-q'+i,label:'Q'+(i+1),x:p[0],y:p[1],labelDx:0,labelDy:0}))],
 caption:'A and B are defined stations. Q1-Q6 are check points, not additional stations. All coordinates are in metres.',note:'The access objective concerns six named points, not every point of this rectangle.'});
function voronoi(number,added=false){return normalizeVoronoiDraft({...newVoronoiDraft(),
 title:added?'Nearest-station regions after adding C':'Nearest-station regions before the addition',figureNumber:String(number),
 coordSystem:'cartesian',metricConfirmed:true,unitMode:'unit',unit:'m',xLabel:'Horizontal site coordinate',yLabel:'Vertical site coordinate',
 regionMode:'manual',xMin:'0',xMax:'120',yMin:'0',yMax:'80',sourceKind:'secondary',
 sourceCredit:'Water Station Site v1: original defined coordinates, not observations from a real campus.',
 sites:[...WATER_EXISTING.map((p,i)=>({id:'s-existing-'+i,name:['A','B'][i],x:p[0],y:p[1],kind:'observed'})),...(added?[{id:'s-centre',name:'C',x:60,y:60,kind:'candidate'}]:[])],
 showGrid:true,showSites:true,showLabels:true,showAreas:true,showBisector:!added,pairA:0,pairB:1,
 probeX:'60',probeY:'70',note:added?'The new C cell is 3600 square metres, but cell area is not demand. The objective is checked separately at Q1-Q6.':'The boundary x=60 splits the defined site equally; Q3=(60,70) is equally far from A and B.'});}
const definitions=R`For a check point \(Q_i=(x_i,y_i)\) and station \(S_j=(a_j,b_j)\), I use Euclidean distance \(d(Q_i,S_j)=\sqrt{(x_i-a_j)^2+(y_i-b_j)^2}\), in metres. \(d_i\) is the shortest distance from \(Q_i\) to any available station. \(D=\max_i d_i\) is my original worst-point objective. Later, \(\overline d_w\) is a different, demand-weighted average with relative weight \(w\) on Q1 and Q2.`;
export const WATER_STATIONS_SPEC=finishDecisionSpec({
 id:'water-stations',routeId:'voronoi',title:'Where should one extra water station go?',course:'AI SL',sourceType:'theoretical',mathSelected:['AI10','AI12'],
 description:'Construct nearest-station regions, compare three feasible sites on six fixed points, then show exactly when changing the demand objective changes the preferred site.',
 readingNote:'A complete fictional investigation of a defined site. Coordinates, feasible locations and demand weights are assumptions; straight-line access is not actual walking time.',provenance,definitions,technologyStage:2,
 planning:{
  mathsOutside:'outside',
  idea:'I will compare three permitted locations for an extra station on a simple rectangular site with two existing stations.',
  aim:'Which of W, C and E minimises the largest nearest-station distance at six fixed check points, and would emphasising demand at the two western points change the recommendation under an average-distance objective?',
  motivation:'A new station could make a diagram look balanced without helping the people farthest from water. I want a defined criterion for improvement before choosing an attractive location.',
  beneficiaryType:'both',beneficiary:'I would use the comparison to explain a design decision to other users of this hypothetical site, while recognising that different access priorities can lead to different choices.',
  intendedUse:'Recommend a candidate under a stated objective and show when a different objective supports a different choice.',
  theoreticalAim:'Compare the three given candidate coordinates under a worst-check-point distance objective, then a defined weighted-average scenario.',
  theoreticalCase:'I will use a 120 by 80 metre rectangle, stations at (20,20) and (100,20), six named check points and candidates at (30,60), (60,60), (90,60). All positions are specified, not surveyed.',
  prediction:'I expect the central candidate C to reduce the largest distance most, but a strong concentration of western demand may favour W for average access.',
  predictionWhy:'C is nearer the poorly served top-middle point, whereas W is much nearer Q1 and Q2.',
  predictionImplication:'A recommendation should state which objective it meets rather than calling one location universally best.',
  firstAction:'Map the defined stations and check points, confirm Euclidean distance, and derive the original perpendicular bisector.',
  firstAccuracy:'Retain unrounded square roots for rankings. Coordinate definitions are exact within this model, not accurate to a metre because of a survey.',
  permissionDetails:'The rectangle and points are fictional design inputs. No real location permissions or feasibility approvals are implied.',
  teacherQuestion:'Have I separated the finite six-point objective from the continuous Voronoi map and from a new demand-weighted objective?',
  teacherSafeAction:'I can check all distances and the candidate set before interpreting any cell areas.',
  milestoneAdjustment:'My six-week plan is site definition, bisectors and baseline, candidate comparisons, demand sensitivity, then writing and review.'
 },
 introduction:"I started with what seemed like a simple design question: where should one extra water station go? I quickly realised that the answer depends on what I mean by “best”. A location that helps the worst-served point most is not necessarily the one that gives the smallest average distance.\n\nI use a constructed \\(120\\text{ m}\\times80\\text{ m}\\) site with two existing stations, six fixed check points and three allowed candidate sites. My first aim is to choose the candidate that minimises the largest straight-line distance from any of the six check points to its nearest station. After that, I deliberately change the priority by giving extra weight to two western points and see whether the recommendation changes.\n\nMy prediction is that the central candidate will win the worst-distance comparison, but that a sufficiently western demand pattern could favour the western candidate. I want the final recommendation to state the objective that makes it true.",
 dataNotes:"The constructed site [D1] uses Cartesian metres with existing stations \\(A=(20,20)\\) and \\(B=(100,20)\\). The six check points are\n\\[\nQ_1=(10,60),\\ Q_2=(30,70),\\ Q_3=(60,70),\\ Q_4=(90,70),\\ Q_5=(110,60),\\ Q_6=(60,30).\n\\]\nThe only allowed new sites are \\(W=(30,60)\\), \\(C=(60,60)\\) and \\(E=(90,60)\\).\n\nFor the first decision I define \\(d_i\\) as the straight-line distance from \\(Q_i\\) to its nearest station, and\n\\[\nD=\\max(d_1,\\ldots,d_6).\n\\]\nThe maximum is over these six check points only; I am not claiming an optimum over every point in the rectangle.\n\nLater I deliberately change the objective. Each of \\(Q_1\\) and \\(Q_2\\) receives relative weight \\(w\\ge1\\), while the other four points keep weight 1. These are hypothetical demand weights, not observed visitor counts. Straight-line distance also ignores obstacles, queues and walking routes.",
 source:{actualSource:provenance,actualMethod:'I specified the rectangular region, stations, check points and candidate set, then calculated Euclidean distances and clipped Voronoi cells. I did not import a real map.',
  modelEvidence:'An exact coordinate model and a finite stated candidate set.',modelInputs:'The two existing station coordinates, six check-point coordinates, three candidate coordinates and fixed rectangular boundary.',
  modelAssumptions:'Straight-line Euclidean distance represents access; one station is added; original stations remain open; capacity, queues and barriers are excluded.',
  modelDomain:'The rectangle is 120 by 80 m. The decision objective concerns only the six fixed check points and the three permitted candidates.',
  modelValidation:'I derive bisectors algebraically, check individual distances and cell-area totals, then recompute the same objective for every candidate.',
  modelAlternative:'A demand-weighted mean, real path length or travel time could answer a different access question. I explicitly test the weighted mean rather than silently changing the original maximum criterion.',
  modelSensitivity:'The later parameter w changes the importance of Q1 and Q2; I derive the value where W and C have equal weighted means.',
  chosenMethod:'Perpendicular bisectors and bounded Voronoi regions, finite minimax comparison, and a weighted-mean crossover.',
  methodReason:'Voronoi geometry identifies the nearest station for each location, but the decision still needs a chosen distance objective evaluated at the intended users.',
  methodLimitation:'Cell area is not pedestrian demand, and straight-line distance need not be a feasible walking route.',
  limitationConsequence:'A visually balanced map or a large cell cannot by itself justify a location or establish actual walking times.',
  limitationMitigation:'I define the six-point objective before comparing candidates and separate a later demand objective and its source assumptions.',
  limitationAcceptable:'The result is a global comparison among the three stipulated candidates for this finite set, not an optimum over every possible site or real-world operating plan.'},
 completion:{
  permissionNotes:'This is an original coordinate scenario; no school-map or installation permission is asserted.',changedSincePlanning:'The central site won the original worst-distance comparison, but the weighted-average calculation identified a precise threshold beyond which the western site is preferable.',
  dataStatusSummary:'The same two stations, six check points and three candidates are retained throughout. Weight changes are defined separately.',
  dataAimLink:"A Voronoi diagram can show which station is nearest, but it does not by itself answer my decision question. I need to calculate the chosen distance objective at the same six check points for every candidate.",
  firstMethodEvaluation:"I use the Voronoi picture to make the nearest-station geometry visible, then calculate distances separately. This prevents me from treating a visually balanced cell pattern as evidence that a candidate is best.",
  firstPresentation:'Figure 1 distinguishes station labels from Q labels; Figure 2 shows the original nearest-station regions on the same bounded rectangle.',
  specialistTerms:'A Voronoi cell contains points at least as close to its site as to the others. Minimax here means choosing the candidate with the smallest largest distance across six specified points.',
  predictionComparison:'C minimises the original worst-point distance, as expected. Under the alternative weighted mean, W becomes preferable when each western point has relative weight above about 1.219.',
  benefitFinding:'The preferred location can be stated together with a precise access priority instead of being described as universally optimal.',
  nextMethod:'Nearest-station distance calculations on six fixed points',
  technologyTool:'Voronoi Studio, geometry diagram and calculator',technologyInput:'The rectangle and station coordinates, followed by the unchanged six check points for each candidate.',
  technologyOutcome:R`The maximum falls from \(\sqrt{4100}\approx64.0312\) m to \(\sqrt{1700}\approx41.2311\) m for C. The weighted-mean W/C crossover is \(w\approx1.21859\).`,
  technologyInterpretation:'The software draws cells; I derive representative boundaries and calculate the objective separately. The region area output is not used as a proxy for demand.',
  courseWhy:'Voronoi geometry, distance formulae and weighted averages form a linked AI SL investigation.',courseConcern:'The minimax statement is restricted to the three permitted candidates and six check points.',
  mathsLearning:'I learned that changing an objective can reverse a location choice even with every coordinate held fixed.'
 },
 accuracy:[{quantity:'Defined Cartesian coordinates and distances',symbol:'x, y, d',unit:'m',resolution:'Coordinates are exact definitions of the fictional case; no survey precision is asserted.',policy:'Retain exact square roots and unrounded values for comparisons; show distance summaries to 0.001 m only as arithmetic.',reason:'Rounding must not determine a tie or a threshold. Actual positional uncertainty would require a separate input model.'}],
 stages:[
  {key:'regions',title:'Defining nearest access on a bounded site',kind:'model',methodId:'follow-journey',technique:'Coordinate geometry and perpendicular bisectors',knowledge:'syllabus',outcomeId:'nearest-cells',
   bridge:"Before comparing new sites, I need a precise meaning of nearest access. I begin with the existing stations and derive their boundary.",
   purpose:'Figure 1 shows the full site and Q1-Q6. Figure 2 constructs the initial regions for A and B; the check points have not been entered as extra stations.',
   result:R`A point \((x,y)\) is equally distant from \(A=(20,20)\) and \(B=(100,20)\) when
\[(x-20)^2+(y-20)^2=(x-100)^2+(y-20)^2.\]
Expanding and cancelling gives \(160x=9600\), hence \(x=60\). Points to the left are nearer A, points to the right nearer B, and the line itself represents a tie. Clipping to the stated \(120\times80\) rectangle gives two cells of area \(4800\text{ m}^2\) each.

Equal areas do not mean equal access. A point just beside A and a point at the top of its cell can have very different distances. Q3=(60,70), for example, is on the bisector and is far from both stations despite belonging to a balanced-looking layout.`,
   interpretation:"The equal-area cells look balanced, but Q3 is still far from both stations. This is the first sign that cell area and my access objective are not the same thing.",
   limitations:'Euclidean distance ignores obstacles and queues. The rectangular clipping is my defined site boundary, not a geographical fact.',
   localTakeaway:'The original bisector is x=60, with equal cell areas, but this does not settle the access objective.',
   nextQuestion:"What is the largest nearest-station distance across the six check points before any new station is added?",
   nextWhy:"That value gives me the baseline against which every candidate must be judged.",
   mathsInsight:'Nearest-region geometry and the magnitude of access distance are related but distinct questions.',methodChangeReason:'I move from a cell picture to the numerical objective that the aim actually defines.'},
  {key:'baseline',title:'Measuring the original worst-served point',kind:'model',methodId:'voronoi',technique:'Distances to nearest stations',knowledge:'syllabus',outcomeId:'poor-coverage',
   bridge:"The bisector identifies which existing station is nearest at each check point. I now calculate the six actual distances so that the weakest-served point is determined numerically rather than visually.",
   purpose:'Table 1 gives the complete check-point list and original distance. The final row is a check point, not a total or an extra site.',
   result:R`At Q3=(60,70), both stations are \(\sqrt{40^2+50^2}=\sqrt{4100}\approx64.0312\) m away. At Q1=(10,60), the nearer A is \(\sqrt{10^2+40^2}=\sqrt{1700}\approx41.2311\) m away. The complete Q1-Q6 nearest-distance list is
\[41.2311,\ 50.9902,\ 64.0312,\ 50.9902,\ 41.2311,\ 41.2311\text{ m},\]
where the displayed values are rounded only after calculation. Thus the original objective is \(D_0=\sqrt{4100}\) m, attained at Q3. The ordinary six-point mean is about 48.2841 m, a separate descriptive summary.

I will keep all six points and both original stations for every comparison. Removing a distant point would improve the reported maximum without improving the design, so that would answer a different question.`,
   interpretation:"Q3 controls the original maximum. That makes the central candidate plausible, but it still does not prove C is best because W or E might improve the other points enough to change the maximum.",
   limitations:'The maximum refers to these six specified locations. Corners or other points of the continuous rectangle could have larger distances and are not silently included in this objective.',
   localTakeaway:'The original worst check point is Q3, with nearest distance 64.0312 m; the six-point mean is 48.2841 m.',
   nextQuestion:"Which of W, C and E gives the smallest value of the same maximum-distance objective?",
   nextWhy:"A fair comparison requires the same six points and the same objective for all three allowed candidates.",
   mathsInsight:'Defining the domain of a maximum is part of the mathematics, not a minor wording detail.',methodChangeReason:'I evaluate all three admissible candidates instead of treating a diagram as an optimisation proof.'},
  {key:'candidates',title:'Comparing every allowed candidate',kind:'model',methodId:'voronoi',technique:'Finite minimax comparison and revised bisectors',knowledge:"mixed",
   researchSource:"",
   understandingExample:"For C the six nearest distances are approximately \\(41.2311,31.6228,10,31.6228,41.2311,30\\) m, so its objective value is \\(41.2311\\) m. W and E each have objective value \\(50.9902\\) m, so C wins over the stated three-site set.",
   knowledgeNotes:"I define minimax in the context of the six check points: for each candidate I first take every nearest-station distance, then take the largest of those six values. The best candidate is the one with the smallest of these three maxima.",
   unfamiliarComponent:"Using a finite minimax objective and distinguishing an optimum over a declared candidate set from an optimum over a continuous region.",outcomeId:'new-site',
   bridge:"I recompute all six nearest distances after adding each permitted site, then take the maximum. This is an exhaustive comparison of the three allowed choices.",
   purpose:'Table 2 compares the complete admissible set. Figure 3 shows the central addition after it wins the original criterion; the cell areas are a geometric check, not the objective.',
   result:R`For C=(60,60), the new Q1-Q6 distances are
\[41.2311,\ 31.6228,\ 10,\ 31.6228,\ 41.2311,\ 30\text{ m}.\]
The largest is \(\sqrt{1700}\approx41.2311\) m, now attained at Q1 and Q5. W and E each leave a maximum \(\sqrt{2600}\approx50.9902\) m. C therefore minimises the largest distance among the three candidates. The reduction is
\[\frac{\sqrt{4100}-\sqrt{1700}}{\sqrt{4100}}\times100\%\approx35.6\%.\]
C also gives the smaller ordinary mean here: 30.9513 m versus 32.5125 m for W or E. This agreement of the two criteria is a result of this case, not a universal rule.

For the new geometry, equality of distances to A and C gives \(x+y=80\); equality to B and C gives \(y=x-40\). They meet at (60,20). C's clipped cell is the triangle with corners (0,80), (60,20), (120,80), area \(\tfrac12(120)(60)=3600\text{ m}^2\). Each remaining cell has area 3000, so their sum is the full 9600 square metres.`,
   interpretation:"C wins the original objective clearly, reducing the worst check-point distance from about 64.03 m to 41.23 m. However, that result is only about the stated minimax criterion and the three allowed sites.",
   limitations:'Geometric cell area says nothing about station capacity, visitor density or installation cost. A smaller-cell design could still serve more people.',
   localTakeaway:'C is best among the three candidates for the fixed six-point maximum: 41.2311 m instead of 64.0312 m.',
   nextQuestion:"If I change the priority from the worst check point to a demand-weighted average, when does W become preferable to C?",
   nextWhy:"This tests whether the location recommendation is robust to a different, explicitly stated access priority rather than silently changing what 'best' means.",
   mathsInsight:'A finite exhaustive comparison proves an optimum over its declared candidate set, not over unexamined positions.',methodChangeReason:'I explicitly change the objective for a sensitivity study while preserving every coordinate.'},
  {key:'weights',title:'A different access priority changes the recommendation',kind:'model',methodId:'other',technique:'Weighted means and a decision threshold',knowledge:"mixed",
   researchSource:"",
   understandingExample:"W is better than C when \\(30w+165.075084<72.853833w+112.853833\\). Solving gives \\(w>1.218589982\\). I separately compare E with both so the conclusion is not based on a two-candidate shortcut.",
   knowledgeNotes:"I write the weighted mean for each candidate as a linear numerator divided by the same positive denominator. That lets me compare the numerators directly and solve one inequality for the exact crossover weight.",
   unfamiliarComponent:"Deriving a parameter threshold at which two weighted objective functions exchange order, while checking that the third candidate cannot win.",outcomeId:'meaningful-result',
   bridge:"The minimax answer remains C. I now change only the objective, not the coordinates: Q1 and Q2 receive relative weight w and the other four points keep weight 1.",
   purpose:'Figure 4 plots the weighted-mean difference W minus C. A negative value means W has the smaller mean; the zero crossing is a decision threshold, not a new station location.',
   result:"For a candidate with nearest distances \\(d_1,\\ldots,d_6\\), I define\n\\[\n\\bar d_w=\\frac{w(d_1+d_2)+d_3+d_4+d_5+d_6}{2w+4},\\qquad w\\ge1.\n\\]\nThe denominator is the same positive number for W and C, so I can compare their numerators.\n\nFor W, \\(d_1+d_2=30\\) m and the other four distances total approximately \\(165.075084\\) m. For C, the corresponding totals are \\(72.853833\\) m and \\(112.853833\\) m. Therefore W is better exactly when\n\\[\n30w+165.075084<72.853833w+112.853833.\n\\]\nSolving gives\n\\[\nw>1.218589982\\ldots\n\\]\nwith equality at the crossover.\n\nI also check E rather than assuming it cannot win. For every \\(w\\ge1\\), E's weighted numerator is greater than C's until W has already become at least as good, and W is never worse than E in this range. Therefore C is best for \\(1\\le w<1.218589982\\), W and C tie at the threshold, and W is best above it.\n\nFor example, at \\(w=4\\), W has weighted mean distance about \\(23.7563\\) m, compared with \\(33.6891\\) m for C and \\(39.3116\\) m for E.",
   interpretation:"The recommendation changes because I changed the definition of success, not because the geometry became inconsistent. C is best for protecting the worst-served check point; W can be better when western demand dominates the average.",
   limitations:"The threshold depends on the six points, three candidates, straight-line metric and hypothetical weights. Real walking routes, station capacity and actual demand could all change the decision.",
   localTakeaway:'C remains the minimax choice; W becomes the weighted-mean choice once each western point has relative weight above about 1.219.',
   nextQuestion:"What evidence would I need before using either objective for a real location decision?",
   nextWhy:"The mathematical comparison is complete for the constructed site. A real recommendation would need measured demand, feasible walking paths and installation constraints.",
   mathsInsight:'Two apparently conflicting recommendations can both be correct when their objective functions differ.',methodChangeReason:'I finish with objective-specific recommendations rather than claiming a universal location optimum.'}
 ],
 figures:[
  {id:'geometry-water-site',tool:'geometry',stage:0,after:'purpose',draft:normalizeGeometryDraft(map)},
  {id:'voronoi-water-before',tool:'voronoi',stage:0,after:'result',draft:voronoi(2)},
  table({id:'table-water-points',stage:1,number:1,title:'The fixed check points before an addition',columns:['Point','x','y','Nearest distance'],rows:WATER_POINTS.map((p,i)=>['Q'+(i+1),p[0],p[1],f(before[i],4)]),units:['','m','m','m'],note:'Q3 and Q6 lie on the original A/B bisector. These are check points, not station sites.'}),
  table({id:'table-water-candidates',stage:2,number:2,title:'Candidate comparison on the same six points',columns:['Addition','Maximum distance','Mean distance','Mean if w=4'],rows:['W','C','E'].map((name,i)=>{const ds=WATER_DISTANCE_ROWS[i+1];return [name,f(Math.max(...ds),4),f(sum(ds)/6,4),f(weighted(ds,4),4)];}),units:['','m','m','m'],note:'The maximum is the original criterion. The weighted mean is a separate scenario developed in the next stage.'}),
  {id:'voronoi-water-centre',tool:'voronoi',stage:2,after:'result',draft:voronoi(3,true)},
  graph({id:'figure-water-weight',stage:3,number:4,title:'Weighted mean: western site minus central site',rows:Array.from({length:61},(_,i)=>{const w=1+i*.05;return [w,waterWeightedDifference(w)];}),xLabel:'Relative weight of each western point',yLabel:'Difference in weighted mean distance',xSymbol:'w',ySymbol:'D',yUnit:'m',bounds:[1,4,-11,2],models:[{id:'model-water-zero',type:'custom',expression:'0',visible:true}],caption:'Calculated scenario points. Below zero, W has the smaller mean. The original worst-point objective still favours C.'})
 ],
 dataSets:[{name:'Water Station Site v1 - station and candidate definitions',columns:['Name','x m','y m','Role'],rows:[['A',20,20,'existing'],['B',100,20,'existing'],['W',30,60,'candidate'],['C',60,60,'candidate'],['E',90,60,'candidate']],sourceText:provenance},
  {name:'All check-point distances for every candidate',columns:['Point','x m','y m','Before','With W','With C','With E'],rows:WATER_POINTS.map((p,i)=>['Q'+(i+1),...p,...WATER_DISTANCE_ROWS.map(ds=>ds[i])]),sourceText:'Complete fixed points and unrounded nearest-station distances; no point is removed between scenarios.'},
  {name:'Weighted-mean comparison',columns:['Western weight','Mean with W','Mean with C','Mean with E'],rows:[1,WATER_WEIGHT_THRESHOLD,2,3,4].map(w=>[w,...[west,centre,east].map(ds=>weighted(ds,w))]),sourceText:'Relative demand scenarios, not measured pedestrian counts.'}],
 conclusion:{mainConclusion:"For my original objective, I would choose the central candidate \\(C=(60,60)\\). Its largest nearest-station distance over the six fixed check points is \\(\\sqrt{1700}\\approx41.2311\\) m, compared with \\(\\sqrt{4100}\\approx64.0312\\) m before the addition. W and E each leave a larger maximum of about \\(50.9902\\) m, so C is the best of the three permitted sites for this minimax criterion.",
  conclusionBenefit:"The important qualification is that “best” depends on the objective. Under the alternative weighted-mean model, giving Q1 and Q2 relative weight \\(w>1.218589982\\) makes W preferable to C. At \\(w=4\\), W's weighted mean is about \\(23.7563\\) m compared with \\(33.6891\\) m for C. These are not contradictory answers: C protects the worst-served point, whereas W can better serve a heavily western demand pattern.",
  conclusionExtension:"For a real site I would replace the hypothetical weights with observed demand and replace straight-line distances with permitted walking routes. I would also need evidence about capacity and feasible installation locations before treating either mathematical objective as an operational recommendation."},
 reviews:[
  {id:'D01',location:'Complete investigation',note:'I defined an access objective, derived nearest regions, calculated all candidate distances and solved a separate weighted-demand threshold.',action:'The conclusion names the objective for each recommendation.'},
  {id:'D02',location:'Four linked stages',note:'The Voronoi picture leads to a numerical baseline, the baseline to an exhaustive candidate comparison, and the candidate result to a changed-priority test.',action:'I preserve the same points and candidates throughout.'},
  {id:'D03',location:'Map and distance equations',note:'I use Cartesian metres, distinguish station coordinates from Q points, keep square metres only for cell areas and identify the six-point domain of the maximum.',action:'I retain unrounded roots for the candidate and weight comparisons.'},
  {id:'D04',location:'Decision and threshold',note:'My concern about a balanced-looking map leads to two explicit objectives and a threshold where their recommendations differ.',action:'I do not call either site universally optimal.'},
  {id:'D05',location:'Local limitations',note:'I distinguish area, demand, Euclidean distance and walking time, and keep hypothetical weights separate from measured visits.',action:'I explain why a different objective does not contradict the original minimax result.'},
  {id:'D06',location:'Bisectors, distances and weight inequality',note:'I verify x=60, the two new bisectors, the 9600 square metre total, every candidate maximum and the comparison with E for all w>=1.',action:'The software picture is supported by algebra and direct distance calculations.'},
  {id:'D07',status:'unchecked',location:'Reader and PDF/Word',note:'The site map, before/after Voronoi cells and weight-difference graph accompany the relevant calculations.',action:'Final figure labels, table columns and export pages require visual inspection.'},
  {id:'D09',location:'Defined source record',note:'All coordinates and the candidate set are constructed; the source does not claim a real campus survey or measured demand.',action:'I have not invented a map publisher, permissions or visitor counts.'},
  {id:'D11',location:'Mathematical results',note:'I show worked bisectors, a representative root distance, every candidate summary and the complete threshold inequality.',action:'The answers contain the performed mathematics rather than advice to perform it.'},
  {id:'D19',location:'Figures 1-4 and Tables 1-2',note:'The six points remain visible as check points, never additional Voronoi sites. Full candidate distance records stay in working data.',action:'The tables compare the same fixed inputs.'},
  {id:'D20',location:'Voronoi Studio and calculator',note:'I use the studio to construct the regions and calculate the decision criterion separately from cell areas.',action:'The continuous rectangle is not silently substituted for the six-point objective.'}
 ]
});
