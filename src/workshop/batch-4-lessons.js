/** Maths Workshop Batch 4: five reusable geometry and measurement lessons.
 * Invented coordinates and measurements are learning examples, not IA evidence.
 * Each lesson has two guided checkpoints, independent practice and appropriate technology advice.
 */
const guide=(id,category,title,definitionIds,details)=>Object.freeze({id,category,title,definitionIds,...details});
export const BATCH4_LESSONS=Object.freeze([
 guide("image-calibration","Geometry & measurement","Calibrate an image and measure with coordinates",
  ["pixel-coordinate","image-origin","reference-length","calibration-factor","perspective-distortion","area-scale","euclidean-distance"],{
  skill:"Set a trustworthy scale before converting pixels into real distances.",
  when:"You have a scale drawing or a photograph of an approximately flat surface with an independently known reference length in the measured plane.",
  avoid:"A single pixels-to-metres factor is unreliable across strong perspective, curved surfaces or images stretched unequally in two directions. Coordinates on an uncalibrated photograph are not real-world positions. Confirm rights and provenance for any imported image.",
  formula:"For uniform scale s = known length / reference pixels; distance = s sqrt((change in x)^2 + (change in y)^2). Area uses s squared.",
  worked:{context:"A fictional overhead image shows a 2.5 m reference spanning 100 pixels. Trace points P=(40,50) px and Q=(160,140) px in the same flat plane.",
  steps:[
   "Identify a legitimate reference in the same plane. Here 100 pixels represents 2.5 m; confirm the image has not been stretched after calibration.",
   "Calculate a length-per-pixel factor: s=2.5/100=0.025 m per pixel.",
   "Calculate coordinate differences: change in x =160−40=120 pixels and change in y =140−50=90 pixels.",
   "Use Pythagoras in the image plane: PQ=sqrt(120²+90²)=sqrt(22500)=150 pixels.",
   "Convert to real length: 150×0.025=3.75 m. The sign of the vertical image axis does not affect a distance calculation.",
   "For a traced image area of 600 square pixels, the corresponding planar area would be 600×(0.025)²=0.375 m². Treat this only as valid where scale is uniform.",
   "Record the image source, calibration reference, tracing precision and possible perspective limitations before presenting a real investigation."
  ],answer:"Uniform image scale 0.025 m/px; PQ=150 px=3.75 m. A 600 px² region maps to 0.375 m² if the scale is uniform.",
  interpretation:"Distance and area conversions depend on the reference, image geometry and chosen tracing points. A clean numerical answer alone does not establish measurement accuracy."},
  guided:{parts:[
   {question:"A known 1.5 m marker spans 60 pixels. What is the calibration factor in metres per pixel?",
    options:[["025","0.025 m/px"],["40","40 m/px"],["90","90 m/px"]],correct:"025",
    hint:"Divide the real length by its length in pixels, keeping the units in the same order.",
    feedback:"1.5/60=0.025 m/px. Multiplying pixel lengths by this factor returns metres."},
   {question:"The far side of a photographed field appears smaller because of perspective. Can one constant scale factor reliably convert every pixel distance?",
    options:[["no","No: apparent scale changes with position and depth"],["yes","Yes: the image is rectangular"],["always","Yes: after tracing more points"]],correct:"no",
    hint:"Think about how the same physical length looks at different distances from the camera.",
    feedback:"Perspective distorts the mapping; correct the image with justified calibration/rectification or limit what you claim to measure."}
  ]},
  independent:{question:"On an undistorted fictional plan, a 3 m reference spans 150 px. Points A=(10,20) px and B=(130,110) px. Find AB in pixels and metres.",
   answer:"Scale=3/150=0.02 m/px. AB=sqrt(120²+90²)=150 px, so the real distance is 3 m.",
   reasoning:"Calculate coordinate differences, use Pythagoras and then convert using the same independently justified length scale."},
  technology:[{name:"Image & coordinate tracer",command:"Import image → set reference points and actual reference length → trace points",
    why:"Use a consistent origin and calibration for distances. Export the figure with scale and units; inspect whether perspective invalidates the single factor."},
   {name:"Spreadsheet",command:"=SQRT((C2-A2)^2+(D2-B2)^2)*$F$2",
    why:"Compute a calibrated distance from two pixel-coordinate columns and a fixed metres-per-pixel factor in F2. Show where that factor came from."}],
  existingGuide:"image-scale",relatedGuides:["image-points","reporting-precision"],creator:"trace",
  ia:"State what the reference represents, include a small labelled calibration diagram, show an example coordinate conversion and link the resulting distance/area to the question. Explain sources of distortion and how they could change the conclusion."
 }),
 guide("triangulation","Geometry & measurement","Triangulate an inaccessible point",
  ["baseline","bearing","interior-angle","sine-rule","cosine-rule","triangle-area","uncertainty"],{
  skill:"Choose the right triangle and label the angles correctly.",
  when:"Two observation stations and a measured baseline let you form a triangle to an inaccessible object, with well-defined angles and plane geometry.",
  avoid:"Compass bearings measured clockwise from north are not the same as triangle interior angles; convert carefully. The model assumes suitable plane geometry and accurately measured directions. Nearly parallel sight lines can amplify small angle errors.",
  formula:"For triangle ABC, AB/sin C = AC/sin B = BC/sin A; A+B+C=180 degrees.",
  worked:{context:"Two fictional survey stations A and B are 100 m apart. Their measured interior angles toward landmark C are angle A=30° and angle B=60°.",
   steps:[
    "Draw triangle ABC with AB=100 m. Mark the angles at A and B inside the triangle. Do not substitute raw compass bearings for these angles.",
    "Use the angle sum to find angle C=180°−30°−60°=90°.",
    "Label each side opposite its corresponding angle. AC is opposite angle B, so AC/sin60°=AB/sin90°.",
    "Calculate AC=100sin60°/sin90°=50sqrt(3)≈86.60 m.",
    "Similarly, BC is opposite angle A, so BC=100sin30°/sin90°=50.00 m.",
    "Check the right triangle: AC²+BC²=(7500+2500)=10000=AB².",
    "Interpret these as straight-line planar distances under the stated observational assumptions. Discuss how uncertainty in the baseline or angles affects the inferred point C."
   ],answer:"Angle C=90°; AC=50sqrt(3)≈86.60 m; BC=50.00 m.",
   interpretation:"Triangulation is a mathematical inference from a baseline and two measured directions, not proof of ground-travel distance or surveying-grade accuracy."},
  guided:{parts:[
   {question:"For AB=80 m and interior angles A=B=45°, how long is AC?",
    options:[["56","40sqrt(2)≈56.57 m"],["80","80 m"],["40","40 m"]],correct:"56",
    hint:"Angle C is 90°, and AC is opposite angle B. Use the sine rule.",
    feedback:"AC=80sin45°/sin90°=40sqrt(2)≈56.57 m."},
   {question:"A compass bearing of 120° is measured...",
    options:[["north","Clockwise from north"],["east","Anticlockwise from east"],["interior","Directly as the interior angle at A"]],correct:"north",
    hint:"A three-figure bearing always starts at geographic/diagram north and rotates in one direction.",
    feedback:"Bearings are measured clockwise from north. Convert sight-line bearings into the required interior triangle angles before using trig."}
  ]},
  independent:{question:"Stations A and B are 120 m apart and the interior angles toward C are A=30°, B=60°. Find angle C, AC and BC.",
   answer:"C=90°, AC=120sin60°=60sqrt(3)≈103.92 m and BC=120sin30°=60 m.",
   reasoning:"Draw and label the triangle, then associate the correct opposite sides with angles before applying the sine rule."},
  technology:[{name:"Geometry & Measurement Studio",command:"Construct a triangle with labelled baseline, angles and side lengths",
    why:"Check the position and units of measurements while retaining the mathematical method in the written explanation."},
   {name:"Calculator",command:"100*sin(60°)/sin(90°)",
    why:"Compute the trig ratio in degree mode after justifying which triangle and angles apply."}],
  existingGuide:"image-points",relatedGuides:["image-scale","reporting-precision"],creator:"geometry",
  ia:"Include the labelled triangle and baseline provenance, explain bearing-to-interior-angle conversions, show one sine-rule calculation and test the effect of angle or distance measurement errors."
 }),
 guide("geometric-areas","Geometry & measurement","Measure composite regions, area and volume",
  ["composite-region","triangle-area","cross-section-volume","dimensional-units","area-scale","scale-factor"],{
  skill:"Construct a region model and check what is included or removed.",
  when:"A real design or traced object can be decomposed into justified simple shapes with consistent units, or approximated as a constant-cross-section prism.",
  avoid:"Do not count overlapping sections twice, infer thickness from a flat image or treat irregular boundaries as exactly rectangular. An area in m² cannot be reported as a volume in m³ without a meaningful third dimension.",
  formula:"Composite area=sum of included parts−cut-outs; for a prism V=area of constant cross-section × perpendicular length.",
  worked:{context:"A fictional L-shaped panel is represented by an outer 10 m by 8 m rectangle with a 4 m by 3 m rectangle removed from one corner. It is extended 0.25 m to form a constant-section prism.",
   steps:[
    "Draw and label the outer shape and the corner removed. Verify the cut-out lies entirely inside the outer rectangle and areas do not overlap.",
    "Compute the outer area A_outer=10×8=80 m².",
    "Compute the removed area A_cut=4×3=12 m².",
    "Subtract: composite cross-sectional area A=80−12=68 m².",
    "The assumed prism length is 0.25 m, perpendicular to the cross-section and constant throughout.",
    "Multiply: volume V=68×0.25=17 m³. The result has cubic units because area and length were multiplied.",
    "Evaluate whether the real panel is actually that thick, uniformly shaped and accurately measured; rounded corners or variable depth would require a different model."
   ],answer:"The L-shaped area is 68 m²; constant-section prism volume is 17 m³ if its perpendicular length is 0.25 m.",
   interpretation:"The geometry is exact for the idealised composite region but only approximates a real irregular object. Volume requires the independent third-dimension assumption."},
  guided:{parts:[
   {question:"A 6 m by 5 m rectangle loses a 2 m by 3 m corner. What is its remaining area?",
    options:[["24","24 m²"],["36","36 m²"],["30","30 m²"]],correct:"24",
    hint:"Subtract the removed area from the full rectangle's area.",
    feedback:"6×5−2×3=30−6=24 m²."},
   {question:"A shape is enlarged by a uniform length scale factor of 3. How does its area change?",
    options:[["9","The area becomes 9 times as large"],["3","The area becomes 3 times as large"],["27","The area becomes 27 times as large"]],correct:"9",
    hint:"An area multiplies two lengths, each of which is scaled by 3.",
    feedback:"Uniform length scaling k multiplies area by k²=9. Volume scales by k³=27 when all three dimensions scale."}
  ]},
  independent:{question:"An L-shaped prism has a 12 m by 9 m bounding rectangle, a 3 m by 4 m corner removed, and a uniform perpendicular length of 0.20 m. Calculate cross-sectional area and volume.",
   answer:"Area=12×9−3×4=96 m². Volume=96×0.20=19.2 m³.",
   reasoning:"Check that the cut-out is a non-overlapping corner. State the uniform length assumption and convert area to volume with the third dimension."},
  technology:[{name:"Geometry & Measurement Studio",command:"Draw an outer polygon and labelled cut-out; keep lengths and units visible",
    why:"Build a clear figure and check assumptions before using its dimensions in a calculation."},
   {name:"Image & coordinate tracer",command:"Calibrate an image and trace boundary points",
    why:"Use for irregular regions; report digitisation and calibration limitations instead of assuming a perfect rectangle."}],
  existingGuide:"image-scale",relatedGuides:["image-points","reporting-precision"],creator:"geometry",
  ia:"Show a clearly labelled shape decomposition or calibrated trace, justify dimensions and any constant-depth assumption, then interpret whether changes in shape or measurement would materially change your answer."
 }),
 guide("voronoi-regions","Geometry & measurement","Build and check a Voronoi nearest-site region",
  ["euclidean-distance","perpendicular-bisector","locus","voronoi-boundary","voronoi-vertex","distance-metric"],{
  skill:"Test every candidate bisector against the other sites.",
  when:"You are comparing which of several sites is closest under a stated flat-coordinate straight-line distance metric.",
  avoid:"A pairwise perpendicular bisector is only a candidate Voronoi edge; a third site can remove part of it. Straight-line Euclidean proximity is not necessarily shortest travel time, road distance or real service accessibility. Geographic coordinates may need an appropriate projected metric system.",
  formula:"Two sites A and B are equally distant from P when (x−Ax)^2+(y−Ay)^2=(x−Bx)^2+(y−By)^2.",
  worked:{context:"Three fictional planar sites are A=(0,0), B=(8,0) and C=(4,6), in kilometres on a uniform Cartesian map.",
   steps:[
    "Sketch and label the sites in the same coordinate system and units. Choose straight-line Euclidean distance as the rule.",
    "Set distances to A and B equal: x²+y²=(x−8)²+y². Simplify to x=4, the perpendicular bisector of AB.",
    "Set distances to A and C equal: x²+y²=(x−4)²+(y−6)². Simplify to 8x+12y=52, or 2x+3y=13.",
    "Intersect the candidate bisectors: x=4 gives 8+3y=13, so y=5/3. The triple-equidistant point is V=(4,5/3).",
    "Check that V is equally distant from all three sites: distance to A is sqrt(16+25/9)=13/3 km; B and C give the same.",
    "Check a point further up the AB bisector, P=(4,2). P is 4 km from C but sqrt20≈4.47 km from A and B; therefore P is not on the A–B Voronoi boundary.",
    "Restrict the diagram to the study area and discuss what changes if distance is measured by roads or travel time."
   ],answer:"Bisectors AB: x=4 and AC: 2x+3y=13 meet at V=(4,5/3), equidistant from A, B and C at 13/3 km.",
   interpretation:"A Voronoi diagram partitions a chosen space under a chosen metric; it does not by itself prove the best real-world service provision."},
  guided:{parts:[
   {question:"Sites A=(0,0) and B=(6,0) share which perpendicular bisector?",
    options:[["3","x=3"],["6","x=6"],["0","y=0"]],correct:"3",
    hint:"Every point on the perpendicular bisector is halfway between the sites horizontally.",
    feedback:"The midpoint is (3,0); the equidistant line through it is vertical, x=3."},
   {question:"A=(0,0), B=(6,0), C=(3,4), and P=(3,5). Which site is nearest to P?",
    options:[["C","C, at distance 1"],["A","A, at distance sqrt34"],["both","A and B, tied and nearer than C"]],correct:"C",
    hint:"Compute the distance from P to the third site as well as to A and B.",
    feedback:"P is 1 from C but sqrt34 from each of A and B. It lies on the AB bisector, but is not on their Voronoi boundary."}
  ]},
  independent:{question:"Sites A=(0,0), B=(10,0), C=(5,8) lie on a uniform planar map. Find the AB bisector, the AC bisector and their intersection.",
   answer:"AB: x=5. AC: 10x+16y=89. Their intersection is (5,39/16), a triple-equidistant Voronoi vertex.",
   reasoning:"Equate squared distances. For AC, x²+y²=(x−5)²+(y−8)² gives 10x+16y=89; substitute x=5. Distances to each site are 89/16 units."},
  technology:[{name:"Voronoi Studio",command:"Plot three calibrated site coordinates → construct cells → test candidate points",
    why:"Visualise nearest-site regions and distinguish complete bisectors from valid cell boundaries; verify coordinates and the map's distance model."},
   {name:"Desmos",command:"x=4 and 2x+3y=13",
    why:"Verify the bisectors and their intersection after deriving them."}],
  existingGuide:"image-points",relatedGuides:["image-scale","model-check"],creator:"voronoi",
  ia:"Show where site coordinates come from, construct and explain at least one bisector, use a third-site check, and discuss the suitability of the chosen metric and clipped region. A Voronoi picture alone is not an interpreted investigation."
 }),
 guide("geometry-sensitivity","Geometry & measurement","Test how measurement uncertainty changes geometric results",
  ["worst-case-bounds","sensitivity-check","uncertainty","rounding-interval","instrument-resolution","dimensional-units"],{
  skill:"Turn credible input ranges into output bounds and meaningful limitations.",
  when:"An area, volume or location conclusion depends on measurements or assumptions whose plausible ranges can be justified.",
  avoid:"Bounds from stated input intervals are not statistical confidence intervals. Instrument resolution alone does not prove ± half a division is the full error. Check monotonicity and correlations before combining extremes, and do not invent an uncertainty to look rigorous.",
  formula:"For positive length L in [Llow,Lhigh] and width W in [Wlow,Whigh], area lies in [Llow Wlow,Lhigh Whigh].",
  worked:{context:"A fictional rectangle has a measured length of 10.0 m and width of 4.0 m. Suppose justified measurement ranges are [9.9,10.1] m and [3.9,4.1] m respectively.",
   steps:[
    "State where the input intervals come from. Here they are given as assumed credible ranges, not inferred from display resolution.",
    "Calculate the reported-value area: 10.0×4.0=40.0 m².",
    "Both dimensions are positive, and area grows with either. The smallest area occurs at the lower endpoints: 9.9×3.9=38.61 m².",
    "Similarly, the largest area in the assumed input ranges is 10.1×4.1=41.41 m².",
    "Interpret the asymmetry relative to the nominal result: down 1.39 m² and up 1.41 m², roughly 3.5% either way.",
    "Changing just length by 0.1 m changes nominal area by 0.4 m²; changing just width by 0.1 m changes it by 1.0 m². Width is more influential here for equal absolute changes.",
    "Do not call this a 95% confidence interval. Explain whether the input ranges are credible, whether errors are systematic, and whether the possible areas would change the decision."
   ],answer:"Nominal area 40.0 m², bounded between 38.61 and 41.41 m² under the stated assumptions.",
   interpretation:"A sensitivity interval makes an assumption's consequence visible; it is only as defensible as the measurements and the model used to create it."},
  guided:{parts:[
   {question:"A positive circle radius is known to lie between 4.9 m and 5.1 m. What is its smallest possible modelled area?",
    options:[["low","π×(4.9)² m²"],["mid","π×5.0² m²"],["high","π×(5.1)² m²"]],correct:"low",
    hint:"For a nonnegative radius, increasing r increases πr².",
    feedback:"A_min=π×4.9²=24.01π m². Squaring the radius magnifies the effect of length uncertainty."},
   {question:"Does a ruler labelled every 1 mm automatically guarantee total measurement error no more than 0.5 mm?",
    options:[["no","No: calibration, alignment and other effects also matter"],["yes","Yes: resolution is the complete error bound"],["zero","Yes: ruler readings have no error"]],correct:"no",
    hint:"Separate rounding or graduation size from measurement accuracy.",
    feedback:"Resolution alone does not establish the uncertainty interval. Real measurement procedures and calibration need evaluation."}
  ]},
  independent:{question:"A rectangle has positive input ranges L∈[5.9,6.1] m and W∈[2.9,3.1] m, with reported values 6.0 m and 3.0 m. Find nominal area and justified worst-case bounds.",
   answer:"Nominal area 18.0 m². Under the given input bounds, 5.9×2.9=17.11 m² ≤ A ≤ 6.1×3.1=18.91 m².",
   reasoning:"For positive dimensions, multiplication is increasing in each input; use the two lower endpoints and the two upper endpoints, then distinguish these bounds from a probability interval."},
  technology:[{name:"Spreadsheet",command:"=9.9*3.9 and =10.1*4.1",
    why:"Evaluate endpoints quickly after establishing the assumed input intervals and their units."},
   {name:"Geometry & Measurement Studio",command:"Draw the shape and check how labelled dimensions affect the model",
    why:"Use a diagram to expose the assumptions; the tool cannot validate your claimed instrument accuracy."}],
  existingGuide:"reporting-precision",relatedGuides:["image-scale"],creator:"geometry",
  ia:"Document real measurement procedures, justify uncertainty ranges or scenarios, show the output's sensitivity and state whether the uncertainty materially affects your conclusion. Do not present fictional uncertainty bounds as measured evidence."
 })
]);
