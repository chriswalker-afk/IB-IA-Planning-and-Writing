/** Curated sampling glossary additions for connected Maths Workshop definitions.
 * These improve conceptual coverage; no term implies that the method is
 * suitable, unbiased or approved for a student's IA.
 */
const term=(id,category,title,meaning,example)=>Object.freeze({id,category,title,meaning,example,notation:""});
export const CONNECTED_SAMPLING_DEFINITIONS=Object.freeze([
 term("sampling","Data","Sampling",
  "Selecting units from a clearly defined population to collect data, rather than examining every unit. The selection method, sampling frame and response process affect the conclusions that can be made.",
  "An investigation of 400 students might select 40 of them from a permitted list using a documented procedure."),
 term("sampling-unit","Data","Sampling unit",
  "The individual or group selected by a sampling process at a given stage, such as a student, household or entire class. This is not necessarily the same as the unit on which measurements are ultimately recorded.",
  "If three classes are selected first and each student is measured, the classes are first-stage sampling units; the students are observational units."),
 term("observational-unit","Data","Observational unit",
  "The individual object, person, event or entity about which one observation is recorded. Define it to avoid counting repeated readings or grouped selections as independent cases.",
  "For measurements of individual students, each student is an observational unit even when entire classes were sampled."),
 term("probability-sampling","Data","Probability sampling",
  "A selection design in which eligible units have known, nonzero inclusion probabilities under a specified random mechanism. Probabilities need not be equal, and coverage or nonresponse problems can still cause bias.",
  "Draw a random sample from each year-group list, with specified selection probabilities and an appropriate frame."),
 term("nonprobability-sampling","Data","Non-probability sampling",
  "A sample selected without known random inclusion probabilities for every eligible unit. Convenience, quota and self-selected surveys are common examples and limit population-wide claims.",
  "A survey shared on social media where anyone chooses whether to answer is not a probability sample."),
 term("systematic-sample","Data","Systematic sample",
  "A sample formed by choosing a random starting position and selecting units at a fixed interval along an ordered sampling frame. Periodic patterns or omissions in the frame can make it unrepresentative.",
  "From 100 eligible names, choose a random starting position among the first 10, then select every 10th name for a sample of 10."),
 term("sampling-interval","Data","Sampling interval",
  "The spacing between chosen positions in systematic sampling, often calculated from frame size divided by intended sample size when the division is exact. State the random start and how unequal sizes are handled.",
  "From a frame of 120 names with a target of 20 selections, a systematic interval of 6 can be used with a random start from positions 1 to 6."),
 term("cluster-sample","Data","Cluster sample",
  "A sampling design that randomly selects natural groups (clusters), such as classes or households, and then observes all or a stated subset of units in the chosen groups. Cluster similarity and the number of sampled clusters affect precision.",
  "Randomly select four classes from a complete class list, then record data from students in those classes; this differs from taking a random sample of individual students."),
 term("quota-sample","Data","Quota sample",
  "A non-probability sample in which targets are set for categories but people within each category are selected without known random inclusion probabilities. Matching group numbers is not equivalent to stratified random sampling.",
  "Collect 12 responses from one year group and 8 from another by approaching whoever is available until each target is met."),
 term("voluntary-response-sample","Data","Voluntary-response sample",
  "A non-probability sample in which people decide for themselves whether to join, often after an open invitation. Self-selection can over-represent people with strong views even if many replies are collected.",
  "Posting a public survey link and analysing the replies creates a voluntary-response sample, not a simple random sample.")
]);
