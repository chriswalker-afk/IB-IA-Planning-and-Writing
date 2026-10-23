import {R,f,graph,table,finishDecisionSpec} from './decision-sample-tools.js';
import {newImageTraceDraft,normalizeTraceDraft} from '../../diagrams/image-tracer-core.js';
import {LEAF_IMAGE} from './leaf-outline-image.js';
export const LEAF_UPPER=Object.freeze([0,1.2,1.8,2.1,2,1.8,1.5,.9,0]);
export const LEAF_LOWER=Object.freeze([0,-.8,-1.3,-1.5,-1.6,-1.5,-1.1,-.7,0]);
export const leafUpper=x=>2.1-(x<=3?7/30:21/250)*(x-3)**2;
export const leafLower=x=>x*x/10-4*x/5;
const outline=[...LEAF_UPPER.map((y,x)=>[x,y]),...[7,6,5,4,3,2,1].map(x=>[x,LEAF_LOWER[x]])];
const pixels=outline.map(([x,y])=>({x:80+60*x,y:205-60*y}));
const provenance='Leaf Outline v1: an original constructed, straight-edged leaf-shaped drawing, not a photograph or a botanical specimen. At each x=0,...,8 cm its upper ordinates are 0,1.2,1.8,2.1,2.0,1.8,1.5,0.9,0 cm and lower ordinates are 0,-0.8,-1.3,-1.5,-1.6,-1.5,-1.1,-0.7,0 cm. Successive points are joined by straight segments. Image origin is (80,205) px, x increases right, image y increases down, and 60 pixels represent 1 cm. The 2 cm reference spans image (80,345) to (200,345).';
function tracing(number,view,title){return normalizeTraceDraft({...newImageTraceDraft(),imageSrc:LEAF_IMAGE,width:640,height:410,
 imageName:'Constructed leaf outline v1',title,figureNumber:String(number),sourceKind:'secondary',
 sourceCredit:'Original constructed reference drawing supplied with this investigation; not a photograph.',
 origin:{x:80,y:205},direction:{x:560,y:205},refA:{x:80,y:345},refB:{x:200,y:345},knownLength:'2',
 xLabel:'Distance along outline',yLabel:'Height from baseline',unit:'cm',points:pixels,mode:'trace',view,
 showGrid:true,showLabels:false,showLine:true,closeShape:true,precision:'2',perspective:'front-on',imageOpacity:.8,
 limitations:'The reference is a planar constructed drawing. A physical photograph would require a scale in the same plane and a perspective check.',
 caption:view==='photo'?'The original polygonal reference, with its 2 cm scale. The traced boundary retains all 16 distinct vertices.':'The same 16 vertices in calibrated coordinates. Straight joins define the polygon; they are not the smooth quadratic model.'});}
const definitions=R`I use \(x\) for distance along the outline and \(y\) for height from its baseline, both in cm. The upper and lower model boundaries are \(u(x)\) and \(l(x)\). Their difference \(w(x)=u(x)-l(x)\) is a non-negative width. \(A_c\) denotes curve-model area, \(A_p\) the traced polygon area, and \(p\) the pixel length selected for the exact 2 cm reference.`;
export const LEAF_AREA_SPEC=finishDecisionSpec({
 id:'leaf-area',routeId:'images',title:'How much material does a leaf-shaped patch need?',course:'AA SL',sourceType:'secondary',mathSelected:['AA06','AA23'],
 description:'Calibrate a constructed outline, integrate piecewise boundaries, explain why close area estimates can conceal cancellation, and quantify scale and tracing sensitivity.',
 readingNote:'A complete fictional investigation of a constructed leaf-shaped drawing. The reference image, tracing and all mathematical inputs are included; no physical leaf was measured.',provenance,definitions,
 planning:{
  mathsOutside:'outside',
  idea:'I will estimate the flat material needed for a leaf-shaped decorative patch, excluding seams and cutting waste.',
  aim:'I want to compare a piecewise-quadratic area estimate with the area of one calibrated leaf-shaped outline, then decide how much confidence their agreement gives once scale and boundary selection can change.',
  motivation:'A smooth curve looks more convincing than straight joins, but I want to know whether it actually improves my material estimate. A difference of a few hundredths of a square centimetre may be irrelevant if marking the scale changes the result much more.',
  beneficiaryType:'me',beneficiary:'I would use the result to estimate the face area of this hypothetical patch, not a cutting allowance for a real garment.',
  intendedUse:'Choose an appropriately qualified area estimate and identify whether curve choice or image calibration dominates it.',
  secondaryPublisher:'Leaf Outline v1 is original constructed teaching material, not an external botanical dataset.',
  secondaryVariables:'Sixteen boundary vertices in pixels, one 120-pixel reference representing 2 cm, and a fixed common image origin.',
  secondaryScope:'One planar outline with x from 0 to 8 cm; no claim about other leaf shapes.',secondaryStatus:'ready',secondaryVerified:'yes',
  secondarySamplingOrigin:'The entire defining polygon is supplied. Choosing model anchors is a mathematical approximation, not random sampling of leaves.',
  prediction:'I expect the smooth and polygon areas to be close, but a small change in the selected scale may outweigh that difference.',
  predictionWhy:'Both representations have the same endpoints and similar widths. Area depends on the square of a length scale, so scale changes act twice.',
  predictionImplication:'I may be able to report about 20 square centimetres without pretending the final decimal places are physically reliable.',
  firstAction:'Load the reference image, define the origin and 2 cm scale, then trace the boundary in order.',
  firstAccuracy:'Keep pixel selections separate from the precision of their converted coordinates; compare a 118-122 pixel reference with the nominal 120 pixels.',
  permissionDetails:'The drawing is constructed specifically for this example and contains no personal or restricted image.',
  teacherQuestion:'Is my distinction between the original polygon, a smooth model and calibration sensitivity clear enough?',
  teacherSafeAction:'I can preserve the original image and trace before making any smoothing choice.',
  milestoneAdjustment:'My six-week plan is to define and calibrate the outline, choose curves, calculate both areas, test sensitivity, then write and check the connected argument. No school dates are assumed.'
 },
 introduction:"I chose a leaf-shaped patch because I originally thought that a smooth curve would automatically give a better area than a straight-edged trace. Once I started working with the outline, I realised that there are really two separate questions: what area do my chosen curves give, and how much confidence should I place in that number?\n\nI use the constructed Leaf Outline v1 rather than a real leaf. My aim is to compare a simple piecewise-quadratic model with the exact area of the supplied polygon, then test whether calibration and point selection matter more than the small difference between the two areas. I am only estimating the face area of the shape; seams and cutting waste are outside this investigation.\n\nMy prediction is that both methods will give roughly \\(20\\text{ cm}^2\\). What I do not want to do is treat close answers as proof that the last few decimal places are reliable.",
 dataNotes:"The reference drawing [D1] is \\(640\\times410\\) pixels. I set the image point \\((80,205)\\) as the origin and use the horizontal direction to the right as positive \\(x\\). Because image \\(Y\\)-coordinates increase downwards, I reverse the sign when converting to mathematical \\(y\\)-coordinates.\n\nThe marked 2 cm reference is 120 pixels long, so the nominal scale is \\(1/60\\) cm per pixel. The upper ordinates at \\(x=0,1,\\ldots,8\\) cm are \\(0,1.2,1.8,2.1,2.0,1.8,1.5,0.9,0\\), and the lower ordinates are \\(0,-0.8,-1.3,-1.5,-1.6,-1.5,-1.1,-0.7,0\\). Successive points in the supplied outline are joined by straight segments.\n\nI keep all sixteen vertices in the editable data. Later, to test sensitivity rather than pretend I know the true measurement error, I deliberately allow the 2 cm reference to be selected as 118–122 pixels and each of the fourteen internal vertical ordinates to move by up to 3 pixels. The two tips and all horizontal positions stay fixed.",
 source:{actualSource:provenance,sourceCitation:'[D1] Leaf Outline v1, original constructed reference image and complete defining coordinates included in the project.',
  actualMethod:'I calibrated the supplied reference, retained its sixteen ordered polygon vertices, then selected a small number of anchors to define smooth boundaries. I kept the complete polygon for comparison.',
  sampleSize:'One constructed outline with sixteen distinct boundary vertices.',pairing:'Each pixel point keeps both coordinates and its position in the closed boundary order.',
  modelEvidence:'The full polygon supplies a reference; smooth curves are approximations to that same outline.',modelInputs:'An exact nominal 2 cm scale, sixteen image points and the domain 0 <= x <= 8 cm.',
  modelAssumptions:'The image plane is undistorted and shares one scale; widths are upper minus lower; the chosen upper peak has a horizontal tangent at x=3.',
  modelDomain:'0 <= x <= 8, with upper-boundary pieces meeting at x=3.',
  modelValidation:'I check unused boundary ordinates, compare curve and polygon areas, and separate trapezoidal integration error from changes in the boundary itself.',
  modelAlternative:'I could keep the polygon without smoothing. I use its exact trapezoidal area as the comparator rather than raising the polynomial degree until every point fits.',
  modelSensitivity:'I change the reference span and internal vertical selections separately, then combine their extreme effects on polygon area.',
  methodReason:"I start with calibration and an ordered trace because an area in pixels is not yet an area in square centimetres. I then use a deliberately simple smooth model so that I can see what the modelling choice changes, rather than fitting a complicated curve just because it passes through every point.",
  chosenMethod:'Calibrated tracing, piecewise quadratic boundaries, definite integration, polygon area by trapezia, and bounded input sensitivity.',
  methodLimitation:'Both area methods use the same constructed boundary and calibration; their numerical agreement is not independent validation.',
  limitationConsequence:'A common scale error changes both estimates in the same direction and may be larger than their difference.',
  limitationMitigation:'I retain the reference drawing, quantify the shared scale effect and do not treat closeness as a proof of real-world accuracy.',
  limitationAcceptable:'The area comparison is valid for the defined drawing and the stated vertical/scale scenarios; perspective and horizontal tracing errors remain outside it.'},
 completion:{
  permissionNotes:'The original constructed image is included locally; no consent or third-party image rights are implied.',
  changedSincePlanning:'The two areas were close, but examining the trapezoidal error revealed cancellation. I therefore based my precision judgement on input sensitivity rather than agreement alone.',
  dataStatusSummary:'The complete original image and all sixteen vertices are available and unchanged.',
  dataAimLink:"The quantity I ultimately want is an area between an upper and a lower boundary. Before I integrate anything, I need to know what one pixel represents and I need one closed outline whose point order is unambiguous.",
  firstMethodEvaluation:"Keeping the original polygon beside the smooth model is important for my question. If I replaced the trace immediately with a smooth curve, I would lose the only reference I have for judging what the smoothing changed.",
  firstPresentation:'Figure 1 shows the original reference and its selected vertices. The baseline and calibration segment have different roles.',
  specialistTerms:'A boundary model is my chosen curve approximation, not a new observation. Calibration supplies the length per pixel; area uses the square of that factor.',
  predictionComparison:'The nominal areas differ by only about 0.34%, as I expected. Their agreement did not survive interpretation as strong evidence of accuracy, because scale and boundary choices have larger effects.',
  benefitFinding:'I can give a useful area of about 20 cm squared while explaining which assumptions limit its precision.',
  nextMethod:'Piecewise quadratics with a specified peak and endpoints',
  technologyTool:'Image and coordinate tracer, graph plotter and calculator',
  technologyInput:'The saved 120-pixel reference, ordered boundary vertices and the three explicit quadratic expressions.',
  technologyOutcome:R`The tracer gives polygon area \(19.8\text{ cm}^2\); integration of my curves gives \(296/15\text{ cm}^2\).`,
  technologyInterpretation:'I reproduce the polygon value by summing trapezia and show antiderivatives for the curve model; a shaded image alone does not establish either area.',
  courseWhy:'Quadratic modelling, definite integration and elementary trapezia develop a focused AA SL area question.',
  courseConcern:'My mathematical argument is about one constructed outline, not a statistical study of a species.',
  mathsLearning:'I learned that two close totals can conceal opposite errors and that an area scale changes quadratically.'
 },
 accuracy:[{quantity:'Reference scale and traced boundary',symbol:'p, y',unit:'px; cm',resolution:'Nominal 120 pixels for 2 cm; hypothetical span 118-122 pixels and internal vertical changes +/-3 pixels.',policy:'Retain exact fractions and guard digits in comparisons; report nominal area about 20 cm squared rather than implying hundredth-square-centimetre physical accuracy.',reason:'A squared calibration factor and the permitted boundary changes dominate the 0.067 cm squared difference between methods.'}],
 planningAccuracy:[{id:'plan-leaf-scale',source:'secondary',quantity:'Reference span',unit:'px',resolution:'Nominal 120 pixels represents 2 cm',basis:'An exact specified reference length in a constructed image.',uncertainty:'118-122 pixels is a later assumed selection scenario, not measured instrument uncertainty.'}],
 stages:[
  {key:'calibrate',title:'From image pixels to a closed outline',kind:'model',methodId:'follow-journey',technique:'Scale conversion and ordered coordinate tracing',knowledge:'syllabus',outcomeId:'simple',
   bridge:"My first problem is that the drawing is measured in pixels but my answer needs to be in square centimetres. I therefore fix the coordinate system and scale before choosing any curve.",
   purpose:"Figure 1 keeps the original constructed outline visible while I convert its points into centimetres. The 2 cm segment below the shape is a calibration reference, not the length of the leaf.",
   result:R`The nominal scale is \(2/120=1/60\) cm per pixel. Thus an image point \((X,Y)\) has coordinates
\[x=\frac{X-80}{60},\qquad y=\frac{205-Y}{60}.\]
For example, the upper point \((260,79)\) maps to \((3,2.1)\) cm; the lower point \((320,301)\) maps to \((4,-1.6)\) cm. Subtracting Y from 205 reverses the image's downward vertical axis. The endpoints map to \((0,0)\) and \((8,0)\).

I traced the upper boundary to the right tip, then returned along the lower boundary. The width at \(x=4\), for instance, is \(2.0-(-1.6)=3.6\) cm. A lower ordinate is negative, but the width and area are positive.`,
   interpretation:"The calibrated points show that the upper peak is at x=3 rather than halfway across the 8 cm length. That makes a single symmetric upper parabola a poor starting choice.",
   limitations:'The scale is valid for this flat constructed drawing. One reference length would not correct an oblique photograph or establish lens accuracy.',
   localTakeaway:'The outline spans 0-8 cm, peaks above at (3,2.1), and reaches its lowest supplied ordinate at (4,-1.6).',
   nextQuestion:"Can I describe the upper and lower boundaries with a small number of simple curves without hiding the shape of the original trace?",
   nextWhy:"The calibration tells me where the points are, but it does not yet give a model that I can integrate.",
   mathsInsight:'The image vertical axis must be reversed before lower and upper heights have their intended meaning.',methodChangeReason:'I move from retaining the reference to choosing a small number of interpretable curve parameters.'},
  {key:'boundaries',title:'Choosing and checking the boundary curves',kind:'model',methodId:'geometric-model',technique:'Piecewise quadratic boundary model',knowledge:'syllabus',outcomeId:'curves',
   bridge:"The calibrated outline is visibly asymmetric above the baseline, so I use two upper quadratic pieces that meet at the peak, and one lower quadratic whose roots are the two tips.",
   purpose:'Figure 2 shows the two-piece upper model and the lower parabola. The plotted lower anchors are model-defining choices; the original outline remains in Figure 1.',
   result:R`Writing an upper piece as \(2.1-a(x-3)^2\) imposes the chosen peak and zero gradient at \(x=3\). The left endpoint gives \(a=2.1/9=7/30\); the right endpoint gives \(a=2.1/25=21/250\). Therefore
\[u(x)=\begin{cases}2.1-\frac7{30}(x-3)^2,&0\le x\le3,\\2.1-\frac{21}{250}(x-3)^2,&3\le x\le8.\end{cases}\]
The pieces meet in both height and gradient, although their second derivatives differ. For the lower boundary I use roots 0 and 8, so \(l(x)=a x(x-8)\). Requiring \(l(4)=-1.6\) gives
\[l(x)=\frac{x^2}{10}-\frac{4x}{5}.\]
Both upper pieces are non-negative on their stated intervals, and \(l\le0\), so the width stays non-negative. At unused upper positions \(x=6,7\), the model gives 1.344 and 0.756 cm, compared with supplied 1.5 and 0.9 cm. These are visible underestimates of the right shoulder; I do not hide them by forcing more coefficients.`,
   interpretation:"The model follows the main shape but it deliberately misses some of the supplied shoulder points. I prefer that honest discrepancy to increasing the polynomial degree until the graph looks perfect.",
   limitations:'The horizontal tangent at the chosen peak is a modelling decision. The original polygon has corners, and smoothness does not establish an improved physical representation.',
   localTakeaway:'I have positive upper-minus-lower widths on a complete 0-8 cm domain and explicit discrepancies at unused boundary positions.',
   nextQuestion:"What area do these actual equations enclose?",
   nextWhy:"Once the boundaries are defined, integration can answer the model-area question. It still will not tell me whether the model represents the original polygon well.",
   mathsInsight:'Continuity of height and first derivative can be imposed without requiring one global polynomial.',methodChangeReason:'I integrate the selected model before comparing it with the complete reference.'},
  {key:'integral',title:'Integrating the modelled face area',kind:'calculus',methodId:'other',technique:'Piecewise definite integration',knowledge:'syllabus',outcomeId:'meaningful-result',
   bridge:"The model now defines a closed region. I split the upper integral where its formula changes and subtract the lower boundary over the whole interval.",
   purpose:'I calculate the upper and lower contributions explicitly so that the sign of the lower ordinates cannot turn into a subtraction error.',
   result:R`The area is
\[A_c=\int_0^3u(x)\,dx+\int_3^8u(x)\,dx-\int_0^8l(x)\,dx.\]
The two upper contributions are
\[\left[2.1x-\frac7{90}(x-3)^3\right]_0^3=4.2,\quad
\left[2.1x-\frac7{250}(x-3)^3\right]_3^8=7.0.\]
For the lower boundary,
\[\int_0^8l(x)\,dx=\left[\frac{x^3}{30}-\frac{2x^2}{5}\right]_0^8=-\frac{128}{15}.\]
Hence \(A_c=11.2+128/15=296/15\approx19.7333\text{ cm}^2\). I add the magnitude below the baseline rather than subtracting a positive 8.5333. As a rough check, the entire outline lies inside an 8 by 3.7 cm rectangle, whose area is 29.6 cm squared. My answer is below that bound and has squared, not linear, units.`,
   interpretation:"The curve model gives an area just under 20 square centimetres. At this point the calculation is exact for my chosen functions, but the functions themselves are still only a model of the supplied outline.",
   limitations:'Exact integration eliminates numerical integration error for these polynomials, not error in choosing or calibrating the curves.',
   localTakeaway:R`The selected piecewise curves enclose exactly \(296/15\text{ cm}^2\) under the nominal scale.`,
   nextQuestion:"How does this model area compare with the area of the original straight-edged polygon, and would close agreement actually be reassuring?",
   nextWhy:"I need to separate error in doing the integration from the much more important question of whether I chose a suitable boundary.",
   mathsInsight:'An exact integral of an approximate boundary remains an approximate representation of the chosen reference.',methodChangeReason:'I return to all supplied vertices instead of judging reliability from an antiderivative alone.'},
  {key:'comparison',title:'Close answers can hide cancelling differences',kind:'geometry',methodId:'other',technique:'Trapezia, polygon area and error decomposition',knowledge:"mixed",
   researchSource:"",
   understandingExample:"On one unit strip, \\(\\int_0^1(at^2+bt+c)\\,dt=a/3+b/2+c\\), while the trapezium area is \\(\\{c+(a+b+c)\\}/2=a/2+b/2+c\\). Therefore integral minus trapezium equals \\(-a/6\\).",
   knowledgeNotes:"The trapezium rule is familiar, but the compact error identity is not something I assume. I derive it by shifting one strip to t from 0 to 1, integrating at^2+bt+c, and comparing that result with the trapezium formed by its two endpoints.",
   unfamiliarComponent:"Deriving the exact difference between a quadratic integral and a one-unit trapezium, then using it to explain cancellation between two area comparisons.",outcomeId:'meaningful-result',
   bridge:"The original outline is a polygon, so its area can be reconstructed exactly from the listed widths using trapezia. This gives me a second total, but both totals still come from the same calibrated drawing.",
   purpose:'Figure 3 shows the calibrated polygon independently of the original image. Table 1 distinguishes the original polygon, the smooth curves, and trapezia sampled from those curves.',
   result:"The original widths at integer \\(x\\)-values are\n\\[\n0,\\ 2.0,\\ 3.1,\\ 3.6,\\ 3.6,\\ 3.3,\\ 2.6,\\ 1.6,\\ 0\\text{ cm}.\n\\]\nBecause the polygon joins consecutive boundary points by straight lines, each one-centimetre strip really is a trapezium. Therefore\n\\[\nA_p=\\frac12\\sum_{j=0}^{7}(w_j+w_{j+1})\n=2+3.1+3.6+3.6+3.3+2.6+1.6\n=19.8\\text{ cm}^2.\n\\]\nThe smooth model gave \\(A_c=296/15\\approx19.7333\\text{ cm}^2\\), so the final difference is only \\(0.0667\\text{ cm}^2\\), about \\(0.34\\%\\) of the polygon area.\n\nAt first I thought that was strong agreement. I then checked whether the small difference might be hiding larger effects. For a quadratic \\(q(x)=ax^2+bx+c\\) on any strip of width 1, I can shift the strip to \\(0\\le t\\le1\\) without changing the coefficient of \\(t^2\\). Then\n\\[\n\\int_0^1(at^2+bt+c)\\,dt=\\frac a3+\\frac b2+c,\n\\]\nwhereas the trapezium from the two endpoint heights has area\n\\[\n\\frac{q(0)+q(1)}2=\\frac a2+\\frac b2+c.\n\\]\nSo\n\\[\n\\text{integral}-\\text{trapezium}=-\\frac a6.\n\\]\nFor the model width, the quadratic coefficient is \\(-1/3\\) on the first three strips and \\(-23/125\\) on the last five. Therefore the exact curve area exceeds trapezia from the same curve widths by\n\\[\n3\\left(\\frac1{18}\\right)+5\\left(\\frac{23}{750}\\right)=0.32\\text{ cm}^2.\n\\]\nChanging those curve widths to the original polygon widths instead increases the trapezium total by \\(19.8-19.413333\\approx0.386667\\text{ cm}^2\\). These two changes act in opposite directions, leaving\n\\[\n0.386667-0.32\\approx0.066667\\text{ cm}^2.\n\\]",
   interpretation:"This changed my interpretation of the close totals. The two areas are close partly because two larger differences cancel, not because the smooth curve has independently confirmed the polygon.",
   limitations:"Both calculations use the same scale and the same underlying outline. They are useful comparisons of representations, but they are not independent measurements of a physical leaf.",
   localTakeaway:'The polygon is 19.8 cm squared and the curves 19.7333, but their close agreement partly results from cancellation between boundary choice and trapezoidal curvature error.',
   nextQuestion:"Are the calibration and point-selection effects larger than the 0.067 square-centimetre difference between the two methods?",
   nextWhy:"If the shared input choices move the area more than the methods differ, those choices should control the precision of my final answer.",
   mathsInsight:'Two methods can agree in total even when their errors are not small locally or independent.',methodChangeReason:'I test specified pixel changes while keeping the original trace unchanged.'},
  {key:'sensitivity',title:'Calibration and boundary choices dominate the last decimals',kind:'model',methodId:'other',technique:'Squared scale factors and bounded sensitivity',knowledge:"mixed",
   researchSource:"",
   understandingExample:"If the 2 cm scale is p pixels long, one pixel represents \\(2/p\\) cm, so one square pixel represents \\((2/p)^2\\text{ cm}^2\\). If one internal upper point moves out by 0.05 cm and its matching lower point moves down by 0.05 cm, that width can increase by 0.10 cm.",
   knowledgeNotes:"I do not treat these bounds as probabilities. I explain why an area scale is the square of a length scale, and why each internal width appears with total weight 1 in the polygon trapezium sum.",
   unfamiliarComponent:"Combining a squared scale factor with deterministic bounds on several vertical point selections.",outcomeId:'limitation',
   bridge:"The two methods share the same image, so I now test the shared inputs directly instead of using method agreement as my measure of reliability.",
   purpose:'Table 2 compares scale-only, boundary-only and combined scenarios. The intervals describe all the stated input changes, not a statistical confidence level.',
   result:"The nominal polygon contains \\(71280\\) square pixels. If the 2 cm reference is selected as \\(p\\) pixels, one pixel has length \\(2/p\\) cm and one square pixel has area \\((2/p)^2\\text{ cm}^2\\). Hence\n\\[\nA=71280\\left(\\frac2p\\right)^2.\n\\]\nFor \\(118\\le p\\le122\\), the unchanged outline therefore gives approximately \\(19.1561\\) to \\(20.4769\\text{ cm}^2\\).\n\nI then keep the nominal 120-pixel scale and move each internal upper or lower ordinate by at most 3 pixels, which is \\(0.05\\) cm. An internal width can therefore change by at most \\(0.10\\) cm. In the trapezium sum, each of the seven internal widths appears in two neighbouring half-weights, so its total coefficient is \\(1\\). The largest possible total change is therefore\n\\[\n7(0.10)=0.70\\text{ cm}^2.\n\\]\nMoving all the internal selections inward gives \\(19.1\\text{ cm}^2\\), and moving them outward gives \\(20.5\\text{ cm}^2\\).\n\nCombining the stated scale and vertical-selection limits gives\n\\[\n19.1\\left(\\frac{120}{122}\\right)^2\\le A\\le\n20.5\\left(\\frac{120}{118}\\right)^2,\n\\]\nwhich is approximately \\(18.4789\\) to \\(21.2008\\text{ cm}^2\\). This is a deterministic range for my chosen scenarios, not a confidence interval.",
   interpretation:"The sensitivity range is far larger than the 0.0667 square-centimetre disagreement between the two area methods. I would therefore report the face area as about 20 square centimetres rather than pretending the integration decimals describe physical accuracy.",
   limitations:"My bounds only cover the stated scale and vertical-point changes. They do not include horizontal point movement, perspective distortion, fabric stretch, seam allowance or cutting waste.",
   localTakeaway:'A nominal area near 20 cm squared is stable as a rough scale, while the stated combined selections allow roughly 18.48-21.20 cm squared.',
   nextQuestion:"What extra measurements would I need before turning this face-area estimate into a real cutting specification?",
   nextWhy:"The mathematics has answered the question for the constructed outline. A real patch would need new evidence rather than more decimals from the same image.",
   mathsInsight:'Area uncertainty from a common reference length is multiplicative and quadratic, not an additive copy of a length error.',methodChangeReason:'I stop at a qualified face-area result rather than manufacturing a precise sewing recommendation.'}
 ],
 figures:[
  {id:'trace-leaf-reference',tool:'trace',stage:0,after:'purpose',draft:tracing(1,'photo','Calibrating the constructed leaf outline')},
  graph({id:'figure-leaf-curves',stage:1,number:2,title:'Upper and lower boundary models',rows:[[0,0],[4,-1.6],[8,0]],xLabel:'Distance along outline',yLabel:'Boundary height',xSymbol:'x',ySymbol:'y',xUnit:'cm',yUnit:'cm',bounds:[0,8,-2,2.5],models:[{id:'model-leaf-lower',type:'quadratic',visible:true},{id:'model-leaf-upper',type:'custom',expression:'2.1-(119/750)*(x-3)^2+(28/375)*(x-3)*abs(x-3)',visible:true}],equations:'none',caption:'The quadratic uses three lower anchors. The entered upper curve implements the two stated pieces; it is not a regression on the lower anchors.'}),
  {id:'trace-leaf-polygon',tool:'trace',stage:3,after:'purpose',draft:tracing(3,'math','The complete calibrated polygon')},
  table({id:'table-leaf-areas',stage:3,number:1,title:'Three areas with different meanings',columns:['Representation','Area'],rows:[['Original polygon',19.8],['Integrated curve model',f(296/15,5)],['Trapezia from curve widths',f(19.4133333333,5)]],units:['',R`\mathrm{cm}^{2}`],note:'The last row changes only integration method; the first row also changes the boundary ordinates.'}),
  table({id:'table-leaf-bounds',stage:4,number:2,title:'Area under stated input selections',columns:['Scenario','Lower area','Upper area'],rows:[['Scale only',f(19.8*(120/122)**2,4),f(19.8*(120/118)**2,4)],['Vertical points only',19.1,20.5],['Both together',f(19.1*(120/122)**2,4),f(20.5*(120/118)**2,4)]],units:['',R`\mathrm{cm}^{2}`,R`\mathrm{cm}^{2}`],note:'Displayed endpoints are rounded. The exact combined bounds are given in the accompanying inequality; no confidence probability is assigned.'})
 ],
 dataSets:[{name:'Leaf Outline v1 - complete upper and lower ordinates',columns:['x cm','Upper cm','Lower cm'],rows:LEAF_UPPER.map((u,x)=>[x,u,LEAF_LOWER[x]]),sourceText:provenance},
  {name:'Ordered image boundary points',columns:['Point','Image X px','Image Y px'],rows:pixels.map((p,i)=>[i+1,p.x,p.y]),sourceText:'The complete original trace order, with tips included once.'},
  {name:'Model and reference widths',columns:['x cm','Model upper','Model lower','Model width','Reference width'],rows:LEAF_UPPER.map((u,x)=>[x,leafUpper(x),leafLower(x),leafUpper(x)-leafLower(x),u-LEAF_LOWER[x]]),sourceText:'Calculated widths retained to distinguish boundary differences from integration differences.'}],
 conclusion:{mainConclusion:"The smooth piecewise-quadratic model gives \\(296/15\\approx19.7333\\text{ cm}^2\\), while the exact area of the supplied straight-edged polygon is \\(19.8\\text{ cm}^2\\). Both therefore support a face-area estimate of about \\(20\\text{ cm}^2\\) for this constructed design.",
  conclusionBenefit:"The part that changed my judgement was the reliability check. The two totals differ by only about \\(0.34\\%\\), but that closeness partly comes from a \\(0.32\\text{ cm}^2\\) trapezium-curvature effect cancelling a \\(0.3867\\text{ cm}^2\\) boundary-width effect. Under my stated calibration and point-selection scenarios, the area can instead range from about \\(18.48\\) to \\(21.20\\text{ cm}^2\\). I would therefore keep the useful conclusion “about \\(20\\text{ cm}^2\\)” and not claim that \\(19.7333\\) is a measured physical area.",
  conclusionExtension:"If I continued this as a real investigation, I would use a front-on photograph with an independently checked scale and then model a stated seam width. That would be new evidence and a new geometric question, rather than a reason to add more decimal places to this result."},
 reviews:[
  {id:'D01',location:'Whole investigation',note:'I completed the calibration, curve derivation, integrals, polygon comparison and combined sensitivity before writing the conclusion.',action:'I kept the face-area scope separate from seam and waste allowances.'},
  {id:'D02',location:'Five mathematical stages',note:'I followed calibration to boundary choice, then area, a cancellation check and input sensitivity. Each next question addresses a limitation of the previous result.',action:'I retained the original drawing throughout rather than replacing it with my smooth approximation.'},
  {id:'D03',location:'Definitions and calculations',note:'I reversed the image Y axis, used upper minus lower, kept square-centimetre units and squared the length conversion.',action:'I distinguished pixel coordinates, calibrated coordinates and the reference-span variable p.'},
  {id:'D04',location:'Comparison and conclusion',note:'My personal question about a convincing-looking smooth boundary led me to test whether two close totals were actually reassuring.',action:'I changed the precision of my conclusion in response to calibration sensitivity.'},
  {id:'D05',location:'Area comparison and bounds',note:'I showed how opposite differences cancel and kept the combined bound conditional on fixed horizontal positions and the stipulated point allowances.',action:'I did not call a deterministic bound a confidence interval.'},
  {id:'D06',location:'Integrals and trapezia',note:'I checked both antiderivatives, the polygon width sum, the quadratic trapezium error and the extreme scale factors.',action:'I reproduced the tracer area from the original ordinates and checked that all permitted widths stay positive.'},
  {id:'D07',status:'unchecked',location:'Reader and PDF/Word',note:'The intended layout places calibration, boundary curves and comparison tables with the relevant mathematical stages.',action:'The rendered equations, trace image and exported pages require final visual inspection.'},
  {id:'D09',location:'Starting material and source record',note:'I identified the drawing and its complete pixel recipe as constructed material. I did not claim to photograph or measure a physical specimen.',action:'The original reference is embedded with the editable trace, not linked to a disappearing external image.'},
  {id:'D11',location:'All stage results',note:'The mathematical answers contain actual expressions, calculations and bounds rather than instructions to calculate them.',action:'The original outline, curve widths and sensitivity assumptions remain available as working data.'},
  {id:'D19',location:'Figures 1-3 and Tables 1-2',note:'The long vertex record stays in the project. The reader contains the representations needed for calibration and comparison.',action:'I linked each saved representation to the stage that interprets it.'},
  {id:'D20',location:'Tracer and model plot',note:'I state the scale, ordered vertices and curve formulas, then verify the displayed areas independently of the tools.',action:'The smooth graph illustrates my selected functions and is not evidence of a new observation.'}
 ]
});
