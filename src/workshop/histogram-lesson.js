/** Optional in-depth Batch 1 histogram lesson, complementing the distribution overview. */
const lesson=(id,category,title,definitionIds,details)=>{
 const {guidedStages=[],...rest}=details;
 return Object.freeze({id,category,title,definitionIds,...rest,guided:{parts:[details.guided,...guidedStages]}});
};
export const HISTOGRAM_LESSON=lesson("histograms","Data & statistics","Construct and interpret a histogram",["histogram","frequency-density","sample","box-plot"],{
  skill:"Understand the area of a histogram bar",
  when:"When quantitative observations are grouped into numerical intervals, especially when class widths differ.",
  avoid:"For unequal class widths, plotting raw frequency as height misleads the reader. A histogram is not a bar chart of unrelated categories. Boundary conventions, gaps and grouped-data limitations must be checked.",
  formula:"Frequency density = class frequency ÷ class width; bar area = density × width = frequency",
  worked:{context:"Invented measurements are grouped as [0,10): 6 observations, [10,30): 8 observations and [30,40): 4 observations. Here [a,b) includes a but excludes b.",steps:[
   "Write a table of non-overlapping intervals, frequencies and widths. The three class widths are 10, 20 and 10 units.",
   "For [0,10), density = 6/10 = 0.6 observations per unit.",
   "For [10,30), density = 8/20 = 0.4; for [30,40), density = 4/10 = 0.4.",
   "Draw rectangles touching at the class boundaries with their widths on the numerical horizontal axis and density on the vertical axis.",
   "Check areas: 10 × 0.6 = 6, 20 × 0.4 = 8 and 10 × 0.4 = 4. The total bar area is 18 observations.",
   "The first rectangle is taller despite containing fewer observations than the second: height represents density, while area represents frequency."
  ],answer:"Frequency densities 0.6, 0.4 and 0.4. Total frequency 18.",
  interpretation:"A wide class can have a larger area but a lower density. The grouping may hide features of the raw data; describe limitations before making comparisons."},
  guided:{question:"A histogram class has frequency 15 and width 5. What should its frequency-density height be?",
   options:[["3","3"],["15","15"],["75","75"]],correct:"3",
   hint:"The bar's area must equal 15. Divide the area by the class width.",
   feedback:"Frequency density = 15/5 = 3 observations per unit."},
  guidedStages:[{question:"A class of width 10 has frequency 12. How does its frequency density compare with a class of width 5 and frequency 15?",
   options:[["lower","It is lower: 1.2 compared with 3"],["higher","It is higher: 12 compared with 15"],["equal","Both bars must have equal heights"]],correct:"lower",
   hint:"Find each frequency divided by its class width; do not compare raw counts as bar heights.",
   feedback:"12/10 = 1.2, compared with 15/5 = 3. The wider class is lower but still has area 12."}],
  independent:{question:"Invented grouped observations: [0,5) has frequency 10, [5,15) has frequency 8, and [15,20) has frequency 5. Compute all frequency densities and check the total frequency.",
   answer:"Densities 2, 0.8 and 1. Total frequency 23.",
   reasoning:"Class widths 5,10,5 give 10/5 = 2, 8/10 = 0.8 and 5/5 = 1. The rectangle areas are 10, 8 and 5, totalling 23."},
  technology:[{name:"Desmos",command:"histogram(L,2)",why:"For a raw numerical list L with a constant bin width of 2. It is not a direct solution for unequal grouped-class widths."},
   {name:"Statistical Diagram Studio",command:"Choose histogram and enter labelled classes",why:"Use the correct frequencies and widths, then inspect whether the graph represents frequency density for unequal classes."}],
  existingGuide:"distribution-graphs",relatedGuides:["chart-choice"],creator:"stat",
  ia:"Explain why a histogram helps answer the aim, specify units and class boundaries, justify meaningful binning and interpret genuine shape or differences. Do not imply individual values are known once only grouped totals remain."
 });
