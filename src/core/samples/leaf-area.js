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
 introduction:R`I wanted to estimate how much flat material a leaf-shaped decorative patch would cover. A leaf is an interesting outline because its width changes continuously and a rectangle would include a great deal of unused area. I was especially interested in whether replacing a visibly angular outline with smooth curves would make my estimate more reliable.

I used the supplied constructed Leaf Outline v1, not a physical leaf or a photograph. My aim is to compare a piecewise-quadratic area estimate with its traced polygon area, then assess how calibration and boundary choices affect the comparison. I exclude seams, overlap and cutting waste: my mathematical quantity is the face area inside one outline.

I expected the two estimates to be close. I did not assume that this would prove either method accurate, because both use the same reference scale and therefore share a potential source of error.`,
 dataNotes:R`My reference [D1] is a 640 by 410 pixel drawing. Its baseline origin is image point \((80,205)\), with a mathematical x-axis to the right and y-axis upwards. The printed 2 cm segment occupies 120 pixels, giving \(1/60\) cm per pixel. I trace the nine upper vertices from left to right and the seven internal lower vertices from right to left, then close the shape. This avoids crossing the boundary or counting the tips twice.

In calibrated centimetres, the defining upper ordinates at \(x=0,1,\ldots,8\) are \(0,1.2,1.8,2.1,2.0,1.8,1.5,0.9,0\). The lower ordinates are \(0,-0.8,-1.3,-1.5,-1.6,-1.5,-1.1,-0.7,0\). Every original point is retained in the editable dataset. Straight segments join the reference points, so the polygon area is exact for this defined drawing at the nominal calibration; it is not the area of a biological leaf.

For a sensitivity question, I later allow a reference span of 118-122 pixels and vertical selection changes of up to 3 pixels at each of the fourteen internal boundary ordinates. These are hypothetical allowances, not estimates of camera or ruler accuracy. The two tips and all horizontal point positions remain fixed.`,
 source:{actualSource:provenance,sourceCitation:'[D1] Leaf Outline v1, original constructed reference image and complete defining coordinates included in the project.',
  actualMethod:'I calibrated the supplied reference, retained its sixteen ordered polygon vertices, then selected a small number of anchors to define smooth boundaries. I kept the complete polygon for comparison.',
  sampleSize:'One constructed outline with sixteen distinct boundary vertices.',pairing:'Each pixel point keeps both coordinates and its position in the closed boundary order.',
  modelEvidence:'The full polygon supplies a reference; smooth curves are approximations to that same outline.',modelInputs:'An exact nominal 2 cm scale, sixteen image points and the domain 0 <= x <= 8 cm.',
  modelAssumptions:'The image plane is undistorted and shares one scale; widths are upper minus lower; the chosen upper peak has a horizontal tangent at x=3.',
  modelDomain:'0 <= x <= 8, with upper-boundary pieces meeting at x=3.',
  modelValidation:'I check unused boundary ordinates, compare curve and polygon areas, and separate trapezoidal integration error from changes in the boundary itself.',
  modelAlternative:'I could keep the polygon without smoothing. I use its exact trapezoidal area as the comparator rather than raising the polynomial degree until every point fits.',
  modelSensitivity:'I change the reference span and internal vertical selections separately, then combine their extreme effects on polygon area.',
  methodReason:'I begin with calibration and ordered tracing because no physical area can be inferred from pixel coordinates without a scale, and a self-crossing trace would define the wrong region.',
  chosenMethod:'Calibrated tracing, piecewise quadratic boundaries, definite integration, polygon area by trapezia, and bounded input sensitivity.',
  methodLimitation:'Both area methods use the same constructed boundary and calibration; their numerical agreement is not independent validation.',
  limitationConsequence:'A common scale error changes both estimates in the same direction and may be larger than their difference.',
  limitationMitigation:'I retain the reference drawing, quantify the shared scale effect and do not treat closeness as a proof of real-world accuracy.',
  limitationAcceptable:'The area comparison is valid for the defined drawing and the stated vertical/scale scenarios; perspective and horizontal tracing errors remain outside it.'},
 completion:{
  permissionNotes:'The original constructed image is included locally; no consent or third-party image rights are implied.',
  changedSincePlanning:'The two areas were close, but examining the trapezoidal error revealed cancellation. I therefore based my precision judgement on input sensitivity rather than agreement alone.',
  dataStatusSummary:'The complete original image and all sixteen vertices are available and unchanged.',
  dataAimLink:R`The quantity I need is \(\int_0^8(u-l)\,dx\). Before choosing \(u\) and \(l\), I need a consistent centimetre coordinate system and a complete ordered boundary.`,
  firstMethodEvaluation:'A traced polygon preserves all supplied corners. A smoothed outline may be easier to integrate, but its appearance cannot make the original scale more accurate.',
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
   bridge:'My material question requires an area in square centimetres, so I first establish the length conversion used by every point.',
   purpose:'Figure 1 preserves the supplied drawing and the complete polygon. The reference segment below it is 2 cm, not the horizontal length of the leaf.',
   result:R`The nominal scale is \(2/120=1/60\) cm per pixel. Thus an image point \((X,Y)\) has coordinates
\[x=\frac{X-80}{60},\qquad y=\frac{205-Y}{60}.\]
For example, the upper point \((260,79)\) maps to \((3,2.1)\) cm; the lower point \((320,301)\) maps to \((4,-1.6)\) cm. Subtracting Y from 205 reverses the image's downward vertical axis. The endpoints map to \((0,0)\) and \((8,0)\).

I traced the upper boundary to the right tip, then returned along the lower boundary. The width at \(x=4\), for instance, is \(2.0-(-1.6)=3.6\) cm. A lower ordinate is negative, but the width and area are positive.`,
   interpretation:'The outline is longer to the right of its upper peak than to the left, suggesting that one symmetric upper parabola may miss its shape. The lower boundary is closer to a symmetric arch.',
   limitations:'The scale is valid for this flat constructed drawing. One reference length would not correct an oblique photograph or establish lens accuracy.',
   localTakeaway:'The outline spans 0-8 cm, peaks above at (3,2.1), and reaches its lowest supplied ordinate at (4,-1.6).',
   nextQuestion:'Can two upper quadratic pieces and one lower quadratic describe those different shapes without fitting a high-degree polynomial?',
   nextWhy:'The unequal distances from the upper peak to each tip make a piecewise model a purposeful choice.',
   mathsInsight:'The image vertical axis must be reversed before lower and upper heights have their intended meaning.',methodChangeReason:'I move from retaining the reference to choosing a small number of interpretable curve parameters.'},
  {key:'boundaries',title:'Choosing and checking the boundary curves',kind:'model',methodId:'geometric-model',technique:'Piecewise quadratic boundary model',knowledge:'syllabus',outcomeId:'curves',
   bridge:'The upper peak is at x=3 rather than halfway along the leaf. I use a horizontal tangent there and different curvatures on its two sides.',
   purpose:'Figure 2 shows the two-piece upper model and the lower parabola. The plotted lower anchors are model-defining choices; the original outline remains in Figure 1.',
   result:R`Writing an upper piece as \(2.1-a(x-3)^2\) imposes the chosen peak and zero gradient at \(x=3\). The left endpoint gives \(a=2.1/9=7/30\); the right endpoint gives \(a=2.1/25=21/250\). Therefore
\[u(x)=\begin{cases}2.1-\frac7{30}(x-3)^2,&0\le x\le3,\\2.1-\frac{21}{250}(x-3)^2,&3\le x\le8.\end{cases}\]
The pieces meet in both height and gradient, although their second derivatives differ. For the lower boundary I use roots 0 and 8, so \(l(x)=a x(x-8)\). Requiring \(l(4)=-1.6\) gives
\[l(x)=\frac{x^2}{10}-\frac{4x}{5}.\]
Both upper pieces are non-negative on their stated intervals, and \(l\le0\), so the width stays non-negative. At unused upper positions \(x=6,7\), the model gives 1.344 and 0.756 cm, compared with supplied 1.5 and 0.9 cm. These are visible underestimates of the right shoulder; I do not hide them by forcing more coefficients.`,
   interpretation:'The chosen curves represent the endpoints and peak geometry simply but do not interpolate every supplied ordinate. That is a known approximation rather than a claim that a smoother shape is more truthful.',
   limitations:'The horizontal tangent at the chosen peak is a modelling decision. The original polygon has corners, and smoothness does not establish an improved physical representation.',
   localTakeaway:'I have positive upper-minus-lower widths on a complete 0-8 cm domain and explicit discrepancies at unused boundary positions.',
   nextQuestion:'What area follows from integrating these actual expressions over their valid pieces?',
   nextWhy:'The model now has enough structure to calculate area rather than reading it from the graph.',
   mathsInsight:'Continuity of height and first derivative can be imposed without requiring one global polynomial.',methodChangeReason:'I integrate the selected model before comparing it with the complete reference.'},
  {key:'integral',title:'Integrating the modelled face area',kind:'calculus',methodId:'other',technique:'Piecewise definite integration',knowledge:'syllabus',outcomeId:'meaningful-result',
   bridge:'The curves define a closed region. I split the upper integral at its change of formula, but use the lower parabola over the full interval.',
   purpose:'I calculate the upper and lower contributions explicitly so that the sign of the lower ordinates cannot turn into a subtraction error.',
   result:R`The area is
\[A_c=\int_0^3u(x)\,dx+\int_3^8u(x)\,dx-\int_0^8l(x)\,dx.\]
The two upper contributions are
\[\left[2.1x-\frac7{90}(x-3)^3\right]_0^3=4.2,\quad
\left[2.1x-\frac7{250}(x-3)^3\right]_3^8=7.0.\]
For the lower boundary,
\[\int_0^8l(x)\,dx=\left[\frac{x^3}{30}-\frac{2x^2}{5}\right]_0^8=-\frac{128}{15}.\]
Hence \(A_c=11.2+128/15=296/15\approx19.7333\text{ cm}^2\). I add the magnitude below the baseline rather than subtracting a positive 8.5333. As a rough check, the entire outline lies inside an 8 by 3.7 cm rectangle, whose area is 29.6 cm squared. My answer is below that bound and has squared, not linear, units.`,
   interpretation:'The model estimates a little under 20 cm squared. The extra decimal places describe integration arithmetic; they do not yet describe how well the model represents the reference.',
   limitations:'Exact integration eliminates numerical integration error for these polynomials, not error in choosing or calibrating the curves.',
   localTakeaway:R`The selected piecewise curves enclose exactly \(296/15\text{ cm}^2\) under the nominal scale.`,
   nextQuestion:'How does that result compare with the original polygon, and would near agreement really confirm the modelling choice?',
   nextWhy:'The complete outline was retained as a comparator, so I can distinguish curve area from reference area.',
   mathsInsight:'An exact integral of an approximate boundary remains an approximate representation of the chosen reference.',methodChangeReason:'I return to all supplied vertices instead of judging reliability from an antiderivative alone.'},
  {key:'comparison',title:'Close answers can hide cancelling differences',kind:'geometry',methodId:'other',technique:'Trapezia, polygon area and error decomposition',knowledge:'syllabus',outcomeId:'meaningful-result',
   bridge:'The original drawing joins successive vertices by straight lines. Vertical strips between adjacent x positions are therefore trapezia, not an approximation to this particular polygon.',
   purpose:'Figure 3 shows the calibrated polygon independently of the original image. Table 1 distinguishes the original polygon, the smooth curves, and trapezia sampled from those curves.',
   result:R`The original widths at integer x positions are \(0,2.0,3.1,3.6,3.6,3.3,2.6,1.6,0\) cm. With strip width 1 cm,
\[A_p=\frac12\sum_{j=0}^{7}(w_j+w_{j+1})=2+3.1+3.6+3.6+3.3+2.6+1.6=19.8\text{ cm}^2.\]
This agrees with the tracer's polygon calculation. The difference from the integrated model is only \(19.8-296/15=1/15\text{ cm}^2\), about 0.337% of the polygon area.

However, applying the same trapezia to widths from my curves gives \(T_c=19.413333\text{ cm}^2\), not 19.8. For a quadratic \(q(x)=ax^2+bx+c\) on an interval of length 1, direct integration gives integral minus trapezium area equal to \(-a/6\). The width's quadratic coefficients are \(-1/3\) for the first three strips and \(-23/125\) for the last five. Therefore
\[A_c-T_c=3\left(\frac1{18}\right)+5\left(\frac{23}{750}\right)=0.32.\]
Changing the curve widths to the original polygon widths adds \(A_p-T_c=0.386667\). The two effects nearly cancel: \(A_p-A_c=0.386667-0.32=0.066667\).`,
   interpretation:'The tiny final difference conceals larger differences in opposite directions. I cannot use agreement of two totals as evidence that every local boundary is well represented, or as two independent confirmations of the scale.',
   limitations:'The comparator is the exact constructed polygon, not an unseen real outline. Both methods share its endpoints, chosen reference and coordinate plane.',
   localTakeaway:'The polygon is 19.8 cm squared and the curves 19.7333, but their close agreement partly results from cancellation between boundary choice and trapezoidal curvature error.',
   nextQuestion:'How large is the effect of plausible scale and boundary selections compared with this 0.067 cm squared difference?',
   nextWhy:'Input sensitivity, rather than cancellation, should determine the precision I attach to a material estimate.',
   mathsInsight:'Two methods can agree in total even when their errors are not small locally or independent.',methodChangeReason:'I test specified pixel changes while keeping the original trace unchanged.'},
  {key:'sensitivity',title:'Calibration and boundary choices dominate the last decimals',kind:'model',methodId:'other',technique:'Squared scale factors and bounded sensitivity',knowledge:'syllabus',outcomeId:'limitation',
   bridge:'The nominal polygon contains 71,280 square pixels. A change in the selected reference length changes the conversion of every one of those pixels.',
   purpose:'Table 2 compares scale-only, boundary-only and combined scenarios. The intervals describe all the stated input changes, not a statistical confidence level.',
   result:R`If the exact 2 cm reference is selected as \(p\) pixels, an unchanged pixel area \(S\) converts to
\[A=S\left(\frac2p\right)^2.\]
With \(S=71280\) and \(118\le p\le122\), area ranges from about 19.1561 to 20.4769 cm squared. A reference marked too short makes the inferred area too large.

Next I keep the nominal scale but vary each internal upper and lower ordinate by at most 3 pixels, or 0.05 cm. Each of the seven internal widths can change by at most 0.10 cm. Because the tips are fixed and the strip spacing is 1 cm, the polygon area changes by at most \(7(0.10)=0.70\text{ cm}^2\). All-outward and all-inward selections attain the extremes 20.5 and 19.1 cm squared in this restricted scenario.

Combining these independent allowed inputs gives
\[19.1\left(\frac{120}{122}\right)^2\le A\le20.5\left(\frac{120}{118}\right)^2,\]
or approximately 18.4789 to 21.2008 cm squared. Both effects are much larger than the nominal method difference of 0.0667. These bounds keep horizontal positions fixed and do not include perspective distortion.`,
   interpretation:'For estimating the face material, about 20 cm squared is more defensible than claiming 19.733 cm squared of physical accuracy. The combined scenario shows the size of the qualification, not a measured probability that an area lies inside it.',
   limitations:'The bounds depend on deliberately chosen vertical and reference-span allowances. Horizontal point errors, deformation of real material and sewing allowances are not included.',
   localTakeaway:'A nominal area near 20 cm squared is stable as a rough scale, while the stated combined selections allow roughly 18.48-21.20 cm squared.',
   nextQuestion:'How would an independently calibrated physical photograph and a seam-width model change the material estimate?',
   nextWhy:'Those are the missing geometric and practical inputs needed to move from face area to a real cutting specification.',
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
 conclusion:{mainConclusion:R`My piecewise-quadratic model gives \(296/15\approx19.7333\text{ cm}^2\), while the complete polygon in the supplied drawing has nominal area \(19.8\text{ cm}^2\). Thus either gives a face-area estimate near \(20\text{ cm}^2\), and their difference is about 0.34% of the polygon area. The polygon is the exact reference for this defined straight-edged drawing; smoothing has not made it more accurate.`,
  conclusionBenefit:R`Their closeness is not strong independent evidence: a 0.32 cm squared trapezoidal curvature effect nearly cancels a 0.3867 cm squared change in boundary widths. More importantly, the stipulated reference and vertical selections allow a combined area of approximately 18.48-21.20 cm squared. I would therefore describe the nominal face requirement as about 20 cm squared, retaining that sensitivity range rather than treating integration decimals as measured accuracy.`,
  conclusionExtension:'I would next use a real planar reference with independently checked scale, then introduce a specified seam width. An outward seam changes perimeter as well as area, so simply adding a percentage to the present face-area model would need a separate justification.'},
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
