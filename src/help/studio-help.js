/**
 * IA Studio troubleshooting, Pass 3.
 * This is a student-selectable repair system, not a writing lesson, rubric,
 * predicted grade, automatic diagnosis or producer of mathematical findings.
 * Planning Pass 2 remains unchanged; both surfaces use the amber pop-in style.
 */
import {guidanceContext} from "../completing/guidance-context.js";
import {
 actualMathematics,selectedInvestigativeRoute,outcomeRouteForEntry,
 adaptiveNextDirections,needsJourneyLinkReview,priorStageFor
} from "../completing/adaptive-journey.js";
import {completeEntry,sourceResultForNext,latestRealResult,scatterForNext,isPearsonResult} from "../completing/engine.js";
import {INVESTIGATIVE_ROUTES} from "../planning/investigative-routes.js";
import {REPRESENTATION_TOOLS,activeRepresentationTool} from "../diagrams/representation-registry.js";

const item=(id,label,question,action,check,stop,fallback,boundary,extra={})=>
 Object.freeze({id,label,question,action,check,stop,fallback,boundary,...extra});
export const STUDIO_RECOVERY_CARDS=Object.freeze([
 item("intro-no-start","I have planning notes, but I cannot begin the introduction",
  "What precise mathematical unknown does your investigation aim to address?",
  "Put your working aim beside one real reason you chose it. Check whether these two ideas fit together before adding background or a list of methods.",
  "Does the intended mathematical answer connect to your reason for investigating?",
  "An aim–motivation pair that you can genuinely defend.",
  "Revisit your provisional aim in Planning and ask which quantity or relationship would make it answerable.",
  "Do not write fictional results, sources or a prediction as though already verified."),
 item("intro-unsupported","I have written a prediction as if it were the result",
  "Is the statement a tentative expectation or something established by a real calculation?",
  "Underline any wording that claims a graph, correlation, optimum or proof already exists. If you have not done the mathematics, move that claim back to a clearly provisional question.",
  "Could a different actual answer still be accepted by this introduction?",
  "One honest expectation or question without a premature finding.",
  "Keep the prediction optional; an actual mathematical result can be discussed later.",
  "Do not manufacture observations or insert an assumed model as evidence."),
 item("first-purpose","I cannot decide what the first maths should find out",
  "What is the smallest mathematical quantity or comparison needed to begin answering your aim?",
  "Write one precise first mathematical question and identify its inputs. Try a single calculation, plot, defined case or labelled diagram that could investigate it.",
  "Would a genuine output from this step tell you something relevant to the aim?",
  "One attainable mathematical first move.",
  "Return to the investigative route, try a simpler case or ask your teacher about scope.",
  "The first move is a proposal until you actually do it."),
 item("first-choice","I have several possible techniques and cannot justify one",
  "Which technique can answer your first question with evidence or assumptions you really have?",
  "Compare two plausible methods by what each calculates, the inputs it requires and the important conditions under which it works. Choose one defensible starter.",
  "Can you explain one reason for choosing it beyond its apparent sophistication?",
  "One method and a mathematical reason to start there.",
  "Test one very small case; if neither method fits, narrow the aim.",
  "Course level and an attractive formula do not prove that a method fits."),
 item("bridge-intro","I cannot connect my introduction to my first calculation",
  "What exact unknown in the aim will the first output investigate?",
  "Circle the mathematical unknown in the aim. Identify the variable, quantity or property that your planned first output can actually examine.",
  "Would removing this calculation leave the reader unable to answer that part of the aim?",
  "One mathematical link; a prose bridge can be written from it later.",
  "If you already explained the connection in the introduction, do not repeat it.",
  "Do not claim the first calculation has confirmed a result before completing it."),
 item("method-conditions","I know a method but cannot tell whether it applies",
  "What assumptions, domain or data structure must hold for this particular method?",
  "Choose one critical condition—such as paired observations, independence, a domain restriction or model assumption—and check it against your actual source or defined model.",
  "Could you show the evidence or working that supports that condition?",
  "One verified condition or a specific limitation to investigate.",
  "Try a simpler method that matches the available inputs, or ask your teacher about suitability.",
  "Do not add an assumed weakness just to fill a limitations paragraph."),
 item("method-alternative","I cannot find a sensible alternative to discuss",
  "Would a different mathematical approach change the quantity you calculate or the assumption you make?",
  "Take one real restriction of your proposed method and identify a second approach that relaxes or tests that restriction. Check that you could actually use its inputs.",
  "Does this alternative answer the same question in a meaningfully different way?",
  "One viable comparison, or an honest reason why no comparison is useful yet.",
  "Leave the speculative comparison out until the mathematics gives you a genuine reason to revisit it.",
  "Do not pretend an alternative was tested when it was only considered."),
 item("source-real","I cannot tell whether my source is ready for calculations",
  "Do you have observations or mathematical assumptions that are genuinely available and defined?",
  "Pick the first quantity your method needs. Locate one real record, source definition or explicitly assumed value and check its unit and origin.",
  "Can you trace it to a permissible source or a clearly declared model assumption?",
  "One validated input and any missing dependency.",
  "Return to the source record or use a small, permitted pilot before proceeding.",
  "A Planning spark or candidate dataset is not proof of actual availability."),
 item("sample-relevance","I have observations but my comparison might not be valid",
  "Do the observations have comparable units, populations, sampling rules and variable definitions?",
  "Compare two actual records or groups side by side. Note any mismatch that would change the mathematical meaning of the comparison.",
  "Can you justify comparing these values without silently changing the population or unit?",
  "One defensible comparison, or a precise restriction on the inference.",
  "Reconsider the sample or source rather than adjusting results to look more consistent.",
  "Do not claim random selection, independent observations or universal representativeness without support."),
 item("model-limits","My mathematical model has too many possible assumptions",
  "Which single assumption most changes the quantity you are trying to estimate?",
  "Fix a plausible input and change one assumption or parameter at a time. Calculate how much the model output changes, without pretending the change was observed.",
  "Can you identify which condition matters and in what part of the domain?",
  "One sensitivity check and a justified model restriction.",
  "Simplify the model, narrow its domain or ask a precise mathematical question.",
  "Assumed values are not measurements; model sensitivity is not a reported practical error."),
 item("theory-first","I cannot move from numerical examples to a mathematical argument",
  "Is your proposed claim true for every permitted case, or only the cases checked?",
  "State the claim with its domain. Try one boundary case and one potential counterexample, then look for a general algebraic or structural reason.",
  "Can you say which cases the argument does and does not cover?",
  "A corrected conjecture or a general step worth proving.",
  "Discuss induction, invariant reasoning or another valid proof route only when appropriate.",
  "A table of examples is not a proof of a universal claim."),
 item("show-which","I cannot choose a useful diagram or table",
  "Would your mathematical question be clearer as paired coordinates, a distribution, a small numerical table, a geometry diagram or a probability structure?",
  "Identify exactly what the reader needs to compare or calculate. Select the smallest representation that reveals that mathematical feature.",
  "Can the essential mathematical observation be seen without an entire raw-data dump?",
  "One named representation with a clear mathematical job.",
  "Open the diagram tools only if the figure would contribute to the investigation.",
  "A decorative graph or table is not additional mathematics.",
  {targetNode:"C31",targetLabel:"Browse diagram & table tools"}),
 item("show-axis","My graph or table is misleading or hard to check",
  "Can another reader identify variables, units, scale, plotted range and the origin of the numbers?",
  "Check the horizontal and vertical variable names, units, broken-axis indicators where a scale omits zero, and one value plotted against the source.",
  "Would the value and trend still be interpretable when the figure is seen outside this page?",
  "One verified labelled output and a corrected value or scale if needed.",
  "Start with a two-row check table or rebuild the axes before adding a fitted model.",
  "A fitted curve cannot repair a wrongly labelled or misleading representation."),
 item("real-calculation","I cannot reproduce the result shown by my calculator or software",
  "What exact input, formula or transformation produced the displayed output?",
  "Choose one line or data point and work it through independently, including units and any rounding. Compare your intermediate value with the tool output.",
  "Can you account for the value rather than copying a number from a screen?",
  "One independently checked line of mathematical work.",
  "Check mode/settings, variable definitions, domain and the original data before trusting the output.",
  "Do not mark mathematics completed if the displayed result has not been verified."),
 item("not-yet-result","I have not actually completed the mathematical result yet",
  "Is there a genuine value, graph, calculation or proof to interpret?",
  "Identify the first missing input or operation. Complete that small mathematical task in your real working before writing what it supposedly means.",
  "Could you point to an actual result and explain how it was obtained?",
  "One genuine output or a clear task still needed.",
  "Keep a provisional method plan and seek assistance with the calculation if needed.",
  "Do not write an interpretation or choose a result-specific branch from a planned result.",
  {targetNode:"C30",targetLabel:"Return to first mathematical work"}),
 item("meaning-units","I have a real result but cannot interpret it",
  "What does the computed number, pattern or statement mean in the units and constraints of your question?",
  "Rewrite the mathematical output as a quantity with its units or as a statement about a defined set. Test its meaning in one original observation or small case.",
  "Can you say exactly what was established and one claim it does not justify?",
  "One mathematically defensible interpretation.",
  "Check the original formula's meaning and a simple numerical case, not a ready-made IA sentence.",
  "Do not extrapolate, infer causation, generalise a sample or claim proof without justification."),
 item("pmcc-curved","My correlation result does not match what I see in the scatter graph",
  "Are you confusing a weak linear correlation with the absence of any pattern?",
  "Look again at the actual paired scatter. Note whether points bend, reverse direction or show no consistent pattern. Pearson's r measures linear association, not every possible relationship.",
  "Does your interpretation distinguish the observed shape from the numerical measure of linear association?",
  "A precise limitation of the PMCC interpretation.",
  "Use residuals or another meaningful mathematical check only if it helps your aim. Rank correlation requires evidence of monotonicity.",
  "A curve is not necessarily monotonic, and a small r does not prove no association."),
 item("model-residual","My model fits, but I do not know whether it is trustworthy",
  "Do the residuals show a structure, changing spread or a domain issue that matters to your aim?",
  "For three actual observations, calculate observed minus predicted. Plot or tabulate residuals across the relevant input range and inspect the pattern.",
  "Are the discrepancies random-looking or systematic in the domain you care about?",
  "One check of model performance, not an unsupported claim of accuracy.",
  "Try a model comparison or sensitivity test only if the result would affect your mathematical conclusion.",
  "A high R² alone does not establish causation, valid extrapolation or model appropriateness."),
 item("precision-impact","I do not know whether rounding or measurement precision changes my answer",
  "Which input is least precise or contributes most to the calculation?",
  "Take one linked input with documented resolution or source uncertainty and propagate or vary it through one important result.",
  "Would a plausible input change alter the answer or decision you report?",
  "One relevant precision check, or a reason it is negligible.",
  "Do not invent an instrument uncertainty when the original accuracy is unknown.",
  "Digits printed by software are not evidence of measurement accuracy."),
 item("unexpected-output","My real result contradicts my prediction or earlier work",
  "Is this a calculation error, a different assumption, or a genuinely informative finding?",
  "Recheck one decisive input and operation. Compare the exact conditions of the two mathematical results before changing a model or rejecting an expectation.",
  "Can you identify an actual mathematical reason for the difference—or confirm the contradiction remains?",
  "One verified surprise and an honest next mathematical question.",
  "Record uncertainty without manufacturing an outlier or altering authentic observations.",
  "An unexpected result is allowed; do not make it match a prediction."),
 item("outcome-choice","I have a real result but cannot identify which outcome I found",
  "Which feature of the actual result can you verify directly?",
  "Compare the displayed output with the route's observed-outcome choices. Use units, residuals, a graph or a small case to check one candidate; select 'uncertain' if you still cannot establish its shape.",
  "Does the selected description match the actual work without relying on an expectation?",
  "One student-confirmed outcome or an explicit unresolved feature.",
  "Return to the mathematical result, not the Planning prediction, before selecting a route-specific next step.",
  "Outcome selections are not created by this help and do not automatically establish a result."),
 item("result-needs-review","My earlier mathematical result or outcome has changed",
  "Does the later method still follow from the exact previous finding that is now recorded?",
  "Compare the earlier actual result, its selected outcome and the question you used to justify this next stage. Identify the first assumption or connection that no longer holds.",
  "Would you still choose the same next mathematics on the revised finding?",
  "A confirmed existing link or one mathematical dependency to review.",
  "Revisit the earlier stage before extending it; keep prior notes until you decide what is still valid.",
  "The site will not rewrite a descendant calculation or silently accept a stale outcome."),
 item("next-gap","I cannot find a genuine reason for another mathematical stage",
  "What did the previous real result establish, and what specifically remains unresolved for your aim?",
  "Name the earlier finding, a precise gap in what it establishes and a mathematical job that could close that gap. If the aim is already answered, test whether you can stop.",
  "Would the proposed method answer that particular gap rather than merely add complexity?",
  "One necessary follow-up question, or a defensible decision to conclude.",
  "Try a meaningful assumption/sensitivity check before adding a wholly new technique.",
  "Do not manufacture a question or add compulsory extra methods; a finite IA can reach a conclusion."),
 item("next-method","I have a follow-up question but cannot choose a method",
  "What exact quantity or property would resolve the question left by the previous result?",
  "List the output that would answer your new question. For one possible method, check its inputs and whether it can yield that output from your real material.",
  "Can you justify choosing that method from the actual earlier finding?",
  "One method with an identifiable job, or a reason the question is not currently answerable.",
  "Ask a teacher about scope if the only options use unverified or unfamiliar mathematics.",
  "Do not assume that a prescribed sequence of techniques must be followed."),
 item("stages-dont-link","My later stage does not connect mathematically to the previous one",
  "What exact earlier finding is the new stage relying on?",
  "Write three brief working notes: the verified finding, a property it cannot settle, and the one calculation or argument in the new stage that would address that property.",
  "Does the new stage still have a purpose if you remove the earlier finding?",
  "A supported mathematical dependency, or a reason to reconsider this stage.",
  "If the previous mathematics already answers the aim, you can conclude; use writing guidance only after deciding the mathematical link.",
  "Do not invent a result or treat an out-of-date predecessor as verified."),
 item("technology-input","I can use the calculator but do not understand its mathematical output",
  "Which mathematical operation did the tool perform, and what assumptions did you provide?",
  "Reproduce a single numerical case or intermediate computation independently. Name the variables, scale or distribution parameters used.",
  "Can you interpret the output with units and identify when it would be invalid?",
  "One verified computation and its mathematical meaning.",
  "Consult the relevant tutorial or a teacher about the mathematics, not only the software menu.",
  "Technology is not a substitute for understanding, nor is its display precision input accuracy."),
 item("out-of-course","I used a technique outside my course and cannot explain it",
  "What specific definition, transformation or condition is unfamiliar—not the whole chapter?",
  "Choose one essential step and work through a small genuine example using your own variables. Explain how this part produces the result you need.",
  "Can you check the step independently and identify why it applies here?",
  "One demonstrable explanation of the unfamiliar mathematics.",
  "Find an original mathematical source and confirm suitability with your teacher before building more work on it.",
  "Do not insert a textbook tutorial for routine syllabus methods or claim an unverified course level."),
 item("conclusion-no-result","I want to conclude but have no verified mathematical result",
  "What calculation, graph, model or argument in the actual IA genuinely answers any part of the aim?",
  "Find one performed mathematical step. If none exists, return to the relevant working page and identify the next real calculation or check.",
  "Can you cite the precise output on which even a limited conclusion would rest?",
  "One genuine result or a well-defined piece of mathematics still required.",
  "Ask your teacher if sources, safety or course suitability prevent the necessary mathematics.",
  "A plan, prediction, simulated conclusion or generated example is not real evidence.",
  {targetNode:"C30",targetLabel:"Return to mathematical work"}),
 item("conclusion-narrow","My actual results do not answer the whole aim",
  "What part of the aim is actually established, and which part remains open?",
  "Select one verified finding and state the domain, population or conditions under which it applies. Compare those with the original aim.",
  "Is the conclusion true only for these observed or modelled cases?",
  "A narrower honest answer that the real mathematics supports.",
  "Revisit the aim or one crucial assumption; further work is optional if the limits are clear.",
  "Do not generalise beyond the observed sample, model domain or proved cases."),
 item("conclusion-limits","I have too many possible limitations and cannot choose",
  "Which assumption or uncertainty could actually change the mathematical answer?",
  "Pick the strongest finding and test one realistic change in its inputs, domain or assumptions. Retain the limitation only if it matters to the interpretation.",
  "Could that issue change the result, its scope or the decision it supports?",
  "One mathematically consequential limitation.",
  "Exclude practical inconveniences that have no demonstrated mathematical consequence.",
  "Do not present a hypothetical flaw as if you observed it."),
 item("conclusion-stop","I think I need to add another stage to make the IA substantial",
  "What exact mathematical question remains unanswered after the work you have already verified?",
  "Compare your existing findings with the aim. If none of the unresolved points would materially improve the answer, plan a concise conclusion.",
  "Can you defend stopping based on what your mathematics already shows?",
  "A reason to conclude or one genuinely useful extension.",
  "Consult your teacher about scope if the available mathematics is fundamentally insufficient.",
  "More methods do not guarantee better mathematics or a higher score."),
 item("table-long","My long data table is hiding the mathematics",
  "Which rows, aggregate quantities or calculations does the reader actually need to follow?",
  "Choose a representative row and the computed summary or formula derived from it. Keep the full authentic source separately where school rules allow.",
  "Can the main mathematical claim be checked without reading every raw observation?",
  "One concise, justified mathematical table or calculation.",
  "Keep traceability and citations; do not delete or fabricate observations.",
  "A shorter presentation must not silently remove inconvenient authentic data."),
 item("source-precision","I have printed decimals but do not know the original accuracy",
  "Is the precision a display convention or an uncertainty documented by the source?",
  "Locate the original instrument specification or publisher metadata. Record its actual reporting units; leave unknown uncertainty as unknown.",
  "Can you distinguish display rounding from the precision of the original observations?",
  "One honest source-accuracy note or an identified gap.",
  "Use a sensitivity check with labelled hypothetical assumptions only if it serves the aim.",
  "Do not invent instrument accuracy from a spreadsheet column."),
 item("figure-meaning","I have made a diagram but do not know what it establishes",
  "Which measurable mathematical feature of the real diagram is relevant to the aim?",
  "Choose one labelled distance, trend, area, event probability or comparison and show a reproducible mathematical check using the diagram's actual inputs.",
  "Would this feature make sense without the tool interface around it?",
  "One verified mathematical observation from the figure.",
  "If the diagram is purely illustrative, label it as such and avoid overstating it.",
  "A clear drawing is not a proof or independent finding."),
 item("tool-source","I have a saved figure but it isn't linked to the right maths stage",
  "Does this figure use the measurements, assumptions and variables of the stage currently selected?",
  "Compare the figure's original input records with your current mathematical question and check any source or stage link before reusing it.",
  "Can you justify why the diagram belongs with this particular calculation?",
  "One verified link or a decision to make a separate figure.",
  "Return to the correct stage's generator instead of relabelling another result.",
  "A saved diagram is not automatically a completed mathematical argument.")
]);

/** Specific first-repair prompts for every published investigative route.
 * These do not choose an outcome or make any claim about the student's result.
 */
const routeRepair=(routeId,label,question,action,check,stop,fallback)=>item(
 "route-"+routeId,label,question,action,check,stop,fallback,
 "This is a possible route, not evidence of a finding or a teacher-approved method.");
export const ROUTE_RECOVERY=Object.freeze({
 relationships:routeRepair("relationships","I cannot make sense of a relationship between two quantities",
  "Are your real observations genuinely paired, with one value of each variable for the same unit?",
  "Take three actual pairs and check the units and matching records; then inspect the scatter without assuming a straight line.",
  "Do points represent the same units and does the actual plot show a describable feature?",
  "Three checked pairs and an observed mathematical question.",
  "Do not calculate Pearson's r as a substitute for inspecting the plot."),
 groups:routeRepair("groups","My two groups may not be mathematically comparable",
  "Are the group definitions, measured variables, units and observation rules consistent?",
  "Pick an example from each group and verify how its variable was defined. Compare a robust centre or spread only after that check.",
  "Would a comparison of these two distributions have the same meaning for each group?",
  "One valid comparison or a precise mismatch.",
  "Change the research question if the datasets cannot be made comparable."),
 categorical:routeRepair("categorical","My category counts do not make sense",
  "Are categories mutually exclusive and is each observation counted exactly once?",
  "Check one original record against its table cell and both marginal totals. If testing independence, inspect expected cell counts before trusting a test.",
  "Do the row/column totals reconcile with the real data?",
  "A validated contingency table or a corrected category definition.",
  "Recode only with a documented rule; do not alter cells to force a preferred test."),
 variation:routeRepair("variation","I cannot tell what my distribution actually reveals",
  "Is the central value, spread, unusual observation or shape most relevant to your question?",
  "Check the minimum, median and a spread measure from the real data; compare those to an appropriate histogram or box plot.",
  "Does your chosen graph support the numerical description in the observed data?",
  "One checked distribution feature and its mathematical relevance.",
  "Revisit bin widths or grouping before interpreting an apparent cluster."),
 "fitted-models":routeRepair("fitted-models","The model looks good but may not represent the data",
  "Have you checked real residuals and the input domain, not just the fitted equation?",
  "Choose three genuine pairs and calculate observed minus fitted values. Check for pattern or unreasonable predictions across the relevant range.",
  "Can you identify a mathematical strength or restriction of the model?",
  "One model diagnostic and the domain to which it applies.",
  "Compare a plausible alternative only if residual behaviour or the aim warrants it."),
 growth:routeRepair("growth","I cannot tell whether change is additive or multiplicative",
  "Do equal time intervals show near-constant differences or near-constant ratios?",
  "For three real consecutive readings, calculate differences and ratios (checking nonzero denominators). Match them with the units and period.",
  "Does one structure describe the observed pattern better over the range actually recorded?",
  "A justified starting model or evidence that neither fits.",
  "Try a transformed graph only after defining the domain and units."),
 cycles:routeRepair("cycles","I think there is a cycle but cannot show it mathematically",
  "Are repeated peaks/troughs visible across sufficient observations, rather than just one bend?",
  "Measure the time difference between successive comparable peaks and check the amplitude from actual recorded values.",
  "Is there enough repeat behaviour to make a period meaningful?",
  "One tentative period/amplitude estimate or an honest lack of evidence.",
  "Use a more cautious model if the evidence does not show recurring cycles."),
 trajectories:routeRepair("trajectories","My trajectory calculations use inconsistent directions or scales",
  "Are coordinates, reference time, units and positive directions defined?",
  "Take one observed or assumed trajectory point, express it in the selected coordinate system and check the model prediction at the same time.",
  "Do the units, signs and curve domain agree?",
  "One reproducible point and a defensible coordinate convention.",
  "Recalibrate the representation or narrow the model domain."),
 optimisation:routeRepair("optimisation","I found a stationary point but cannot tell whether it is optimal",
  "What quantity is maximised/minimised and what constraints define the feasible domain?",
  "Identify the permitted endpoints. Evaluate the objective at those endpoints and each valid stationary candidate.",
  "Is the proposed optimum feasible and better than the alternatives in that domain?",
  "One justified candidate comparison.",
  "Check units, constraints and sensitivity instead of labelling every derivative zero an optimum."),
 images:routeRepair("images","I cannot trust the scale or area from a traced image",
  "Does the image have a real length or coordinate reference, and is the scale consistent?",
  "Calibrate one known length, check a second distance, and compare traced coordinates or area with a rough bounding shape.",
  "Would changing one pixel or scale factor significantly change the estimate?",
  "A validated scale and one meaningful geometric calculation.",
  "Keep uncertainty from image calibration distinct from actual instrument uncertainty."),
 triangulation:routeRepair("triangulation","My measured triangle seems impossible or unreliable",
  "Do the angles, baseline and bearings use the same convention and units?",
  "Draw one labelled triangle, verify angle sum and use one independent trig relation to check the derived length.",
  "Are the signs, angle units and reconstructed distance plausible?",
  "One verified geometric estimate and its conditions.",
  "If small angle changes cause large differences, investigate sensitivity."),
 voronoi:routeRepair("voronoi","My nearest-site regions do not match the practical problem",
  "Are your coordinates using a consistent distance measure, and is straight-line distance appropriate?",
  "Check the distance of one test location to two candidate sites using the selected units, then compare it with the displayed cell.",
  "Does the nearest site under your mathematical distance rule agree with the region assignment?",
  "One validated nearest-site comparison.",
  "Distinguish Euclidean distance from road or travel distance; the diagram alone does not establish accessibility."),
 finance:routeRepair("finance","My financial model mixes times, rates or cash flows",
  "Are the interest rate, payment period, tax assumptions and cash-flow signs defined consistently?",
  "Recalculate one period by hand, identifying opening amount, interest/change, payment and closing amount.",
  "Does the next opening amount match the previous closing amount with correct units?",
  "One verified period and a consistent financial model.",
  "Check a realistic alternative assumption rather than adding unsupported profit claims."),
 chance:routeRepair("chance","My probability model gives impossible or inconsistent results",
  "Are the outcomes exhaustive and mutually exclusive at each branching point?",
  "At the earliest problematic node, add the outgoing conditional probabilities and test whether they sum to one. Check one path product.",
  "Do the event and complement calculations now agree?",
  "One valid branching node and an event probability you can reproduce.",
  "Revisit conditioning or independence assumptions; do not force totals by altering actual observed frequencies."),
 proof:routeRepair("proof","My examples suggest a rule but I cannot prove it",
  "Can you specify exactly which values or objects the rule claims to cover?",
  "State the domain, test a boundary case and potential counterexample, then identify an algebraic identity, invariant or induction step that might generalise.",
  "Would your reasoning cover every allowed case, not only the cases computed?",
  "A precise conjecture and one justified general step.",
  "Revise the claim if you find a valid counterexample; examples alone are never proof."),
 iteration:routeRepair("iteration","My iteration appears to converge but I cannot justify it",
  "Can you reproduce the next two iterates and state the recurrence/domain?",
  "Calculate three consecutive values by hand or from a checked formula. If claiming a fixed point, substitute a candidate into the recurrence.",
  "Do your values support the stated behaviour, and have you separated observation from proof of convergence?",
  "A checked recurrence and an honest convergence question.",
  "Investigate stability or bounds before declaring every sequence convergent.")
});
export const TOOL_RECOVERY=Object.freeze({
 graph:item("tool-graph","My graph axes, model or scale are unclear",
  "Do the selected variables and units match the actual mathematical question?",
  "Check one entered point, both axis labels and one model output against the source data. Use an axis-break indicator where a displayed range omits zero and needs clarification.",
  "Could a reader reconstruct that point and interpret the model within its domain?",
  "One checked graph and a clear plotted scale.",
  "Inspect the underlying coordinates before changing the fit or adding another graph.",
  "A residual or regression option is not proof that the fitted model is appropriate."),
 stat:item("tool-stat","My statistical diagram does not match the summary values",
  "Were intervals, counts or quartiles calculated on the same original dataset?",
  "Verify the count total and hand-check the median or a class boundary. Compare it with the diagram's actual grouping rules.",
  "Do the graph and the numerical summaries agree under the same conventions?",
  "One checked distribution display.",
  "Reconsider bin widths and grouping instead of editing real observations.",
  "Diagram shape depends on genuine grouping choices; do not infer universal population properties."),
 table:item("tool-table","I cannot make a compact, checkable mathematics table",
  "Which column contains the measured inputs and which is derived mathematics?",
  "Check one calculated cell from its source row and formula, including rounding and units. Keep only the columns needed to justify the mathematical step.",
  "Can a reader follow the calculation without a complete raw-data dump?",
  "One traceable table with a checked cell.",
  "Keep the complete source elsewhere where appropriate rather than overwriting it.",
  "Formatted values are not new data; avoid false accuracy."),
 trace:item("tool-trace","My traced coordinates do not match the image scale",
  "Are the two calibration points and their real coordinates known and distinct?",
  "Use one known distance to calibrate, then test a second feature of the image against the stated axes and units.",
  "Does an independent measured point land at a plausible coordinate?",
  "A checked image scale and one accurate traced point.",
  "Use a higher-quality image or report a limitation if perspective distortion is material.",
  "Pixels alone are not real-world length without calibration."),
 voronoi:item("tool-voronoi","I cannot explain or verify a Voronoi boundary",
  "Which pair of sites are supposed to be equally distant along the boundary?",
  "Choose one test point on the proposed bisector and calculate the two distances in consistent units.",
  "Are the computed distances equal within appropriate precision?",
  "One mathematically checked cell boundary or distance comparison.",
  "Revisit site coordinates or the distance model before making accessibility claims.",
  "Nearest in Euclidean distance is not necessarily quickest to reach."),
 geometry:item("tool-geometry","My geometry sketch does not satisfy its measurements",
  "Are the side lengths, angles, bearings and orientation mutually compatible?",
  "Check one triangle with angle sum, a trigonometric relation and the recorded length units.",
  "Can your chosen construction satisfy those constraints without changing the data?",
  "One consistent set of geometric constraints.",
  "Adjust an assumption only if the mathematical model permits it; otherwise record inconsistency.",
  "A neat diagram is not a proof of geometric feasibility."),
 probability:item("tool-probability","My probability tree has inconsistent branches",
  "At which node do the outgoing conditional outcomes fail to cover all possibilities?",
  "At the first suspect node, add all outgoing probabilities and verify they sum to one. Then trace and multiply one complete path.",
  "Does that path agree with a separate event/complement check?",
  "One valid conditional branch and a reproducible path probability.",
  "Check whether branches were mistaken for unconditional probabilities.",
  "Do not invent conditional frequencies or assume independent stages.")
});
const ROUTE_IDS=new Set(INVESTIGATIVE_ROUTES.map(r=>r.id));
const TOOL_IDS=new Set(REPRESENTATION_TOOLS.map(t=>t.id));
const entryFieldSpot=new Set(["purpose","bridge","result","interpretation","localTakeaway","nextQuestion","nextWhy","limitations","methodId","title","status"]);
const fieldCards=Object.freeze({
 "C10:introduction":["intro-no-start","intro-unsupported"],
 "C20:dataAimLink":["bridge-intro","first-purpose"],
 "C20:methodReason":["first-choice","method-conditions"],
 "C20:firstPurpose":["first-purpose","first-choice"],
 "C20:firstMethodEvaluation":["method-conditions","method-alternative"],
 "C20:actualSource":["source-real","sample-relevance"],
 "C30:firstOutputIntroduction":["first-purpose","show-which"],
 "C30:firstWorkResult":["not-yet-result","real-calculation"],
 "C30:firstInterpretation":["meaning-units","outcome-choice"],
 "C30:nextQuestion":["next-gap","next-method"],
 "C30:nextReason":["stages-dont-link","next-gap"],
 "C30:purpose":["first-purpose","show-which"],
 "C30:result":["real-calculation","source-precision"],
 "C30:interpretation":["meaning-units","outcome-choice"],
 "C30:nextQuestion":["next-gap","next-method"],
 "C30:nextWhy":["stages-dont-link","next-gap"],
 "C40:bridge":["stages-dont-link","result-needs-review"],
 "C40:purpose":["next-method","method-conditions"],
 "C40:result":["real-calculation","source-precision"],
 "C40:interpretation":["meaning-units","outcome-choice"],
 "C40:nextQuestion":["next-gap","next-method"],
 "C40:nextWhy":["stages-dont-link","next-gap"],
 "C50:bridge":["stages-dont-link","result-needs-review"],
 "C50:purpose":["next-method","method-conditions"],
 "C50:result":["real-calculation","source-precision"],
 "C50:interpretation":["meaning-units","outcome-choice"],
 "C50:nextQuestion":["next-gap","next-method"],
 "C50:nextWhy":["stages-dont-link","next-gap"],
 "C40T:technologyInput":["technology-input","real-calculation"],
 "C40T:technologyOutcome":["technology-input","not-yet-result"],
 "C40L:researchedMethod":["out-of-course","method-conditions"],
 "C40D:courseWhy":["out-of-course","method-conditions"],
 "C60:mainConclusion":["conclusion-narrow","conclusion-no-result"],
 "C60:conclusionBenefit":["conclusion-limits","conclusion-narrow"],
 "C60:conclusionExtension":["conclusion-stop","next-gap"]
});
const baseSpots=Object.freeze({
 "C10:page":["intro-no-start","intro-unsupported"],
 "C20:page":["first-purpose","first-choice","method-conditions"],
 "C20:part:connection":["bridge-intro","first-purpose"],
 "C20:part:method":["first-choice","method-conditions"],
 "C20:part:evaluation":["method-conditions","method-alternative"],
 "C21S:page":["sample-relevance","source-real"],
 "C21M:page":["model-limits","source-real"],
 "C21T:page":["theory-first","first-purpose"],
 "C22:page":["method-alternative","method-conditions"],
 "C23:page":["model-limits","sample-relevance"],
 "C24:page":["precision-impact","source-precision"],
 "C25:page":["show-axis","real-calculation"],
 "C26:page":["first-purpose","source-real"],
 "C30:page":["show-which","first-purpose","not-yet-result"],
 "C30:part:introduce":["first-purpose","show-which"],
 "C30:part:show":["show-which","real-calculation","table-long"],
 "C30:part:reflect":["meaning-units","outcome-choice","not-yet-result"],
 "C30:part:next":["next-gap","next-method","not-yet-result"],
 "C31:page":["show-which","tool-source"],
 "C32:page":["real-calculation","show-axis"],
 "C33:page":["not-yet-result","real-calculation"],
 "C34:page":["meaning-units","unexpected-output"],
 "C34B:page":["meaning-units","precision-impact"],
 "C34U:page":["unexpected-output","real-calculation"],
 "C35:page":["next-gap","next-method","outcome-choice"],
 "C35B:page":["pmcc-curved","outcome-choice"],
 "C35P:page":["pmcc-curved","meaning-units"],
 "C40:page":["stages-dont-link","next-method","result-needs-review"],
 "C50:page":["stages-dont-link","next-method","result-needs-review"],
 "C40:part:introduce":["stages-dont-link","next-method","result-needs-review"],
 "C50:part:introduce":["stages-dont-link","next-method","result-needs-review"],
 "C40:part:show":["real-calculation","show-which","tool-source"],
 "C50:part:show":["real-calculation","show-which","tool-source"],
 "C40:part:reflect":["meaning-units","outcome-choice","result-needs-review"],
 "C50:part:reflect":["meaning-units","outcome-choice","result-needs-review"],
 "C40:part:next":["next-gap","next-method","result-needs-review"],
 "C50:part:next":["next-gap","next-method","result-needs-review"],
 "C40T:page":["technology-input","real-calculation"],
 "C40D:page":["out-of-course","method-conditions"],
 "C40L:page":["out-of-course","real-calculation"],
 "C60:page":["conclusion-narrow","conclusion-limits","conclusion-stop"],
 "C60:part:answer":["conclusion-narrow","conclusion-no-result"],
 "C60:part:meaning":["conclusion-limits","conclusion-narrow"],
 "C60:part:next":["conclusion-stop","next-gap"]
});
export const STUDIO_RECOVERY_SPOTS=Object.freeze({...baseSpots,...Object.fromEntries(
 Object.entries(fieldCards).map(([key,ids])=>{
  const [node,...parts]=key.split(":");return [node+":field:"+parts.join(":"),ids];
 })
)});
const catalog=Object.freeze(Object.fromEntries(STUDIO_RECOVERY_CARDS.map(x=>[x.id,x])));
const str=x=>typeof x==="string"?x.trim():"";
const asCard=id=>catalog[id];
const entryFor=(state,node)=>{
 if(["C35","C35B","C35P"].includes(node))return sourceResultForNext(state);
 if(node==="C60")return latestRealResult(state);
 return completeEntry(state);
};
const toSpot=(node,spot)=>node+":"+spot;
const meaningSpot=spot=>spot==="page"||spot.startsWith("part:")||spot.startsWith("field:");
const routeSpot=spot=>["page","part:introduce","part:show","part:reflect","part:next"].includes(spot);
const resultSpot=spot=>["page","part:reflect","part:next","field:interpretation","field:nextQuestion","field:nextWhy"].includes(spot);
const bounded=x=>str(x).slice(0,420);
export function studioHelpFor(state,spot){
 if(state?.route!=="completing"||!meaningSpot(spot))return null;
 const node=state.completion?.current||"",key=toSpot(node,spot);
 if(!Object.hasOwn(STUDIO_RECOVERY_SPOTS,key))return null;
 const g=guidanceContext(state,node),entry=entryFor(state,node);
 const actual=actualMathematics(entry);
 const prior=entry&&priorStageFor(state,entry);
 const blockedByPrior=!!prior&&needsJourneyLinkReview(state,entry);
 const route=entry&&actual?outcomeRouteForEntry(state,entry):selectedInvestigativeRoute(state);
 const routeId=route?.id||"";
 const tool=node==="C31"?activeRepresentationTool(state):null;
 const candidate=STUDIO_RECOVERY_SPOTS[key];
 let ids=[...candidate];
 // Never ask a student to interpret an unperformed result; provide a real
 // calculation first. No saved title or prediction can pass this check.
 if(!actual&&["C30","C40","C50","C34","C34B","C34U","C35","C35B","C35P"].includes(node)&&
  (spot==="page"||spot==="part:reflect"||spot==="part:next"||["field:interpretation","field:nextQuestion","field:nextWhy"].includes(spot)))
  ids=["not-yet-result",...ids.filter(x=>!["meaning-units","outcome-choice","next-gap","next-method","pmcc-curved"].includes(x))];
 if(node==="C60"&&!state.entries.some(actualMathematics))ids=["conclusion-no-result","first-purpose"];
 if((node==="C40"||node==="C50")&&blockedByPrior&&
   (spot==="page"||spot==="part:introduce"||spot==="part:next"))ids=["result-needs-review",...ids.filter(x=>x!=="result-needs-review")];
 if(node==="C31"&&tool?.id&&TOOL_IDS.has(tool.id))ids=["tool-"+tool.id,...ids];
 let choices=ids.map(id=>id.startsWith("tool-")?TOOL_RECOVERY[id.slice(5)]:asCard(id)).filter(Boolean);
 if(routeSpot(spot)&&ROUTE_IDS.has(routeId)&&routeSpot(spot)&&
   ["C20","C30","C35","C35B","C40","C50"].includes(node)){
  // A route is an explicitly chosen plan or a technique established by the
  // active stage. It NEVER implies this route's expected outcome happened.
  const overlay=ROUTE_RECOVERY[routeId];
  if(overlay&&!choices.some(x=>x.id===overlay.id))choices=[choices[0],overlay,...choices.slice(1)].filter(Boolean);
 }
 let outcome=null;
 if(actual&&resultSpot(spot)){
  const advice=adaptiveNextDirections(state,entry);
  if(advice.status==="ready"&&advice.chosen){
   outcome=advice.chosen;
   const next=advice.directions?.[0];
   // The title/question/next are authored by the EXISTING selected-outcome
   // engine. They are only available for a student-confirmed completed result.
   if(next)choices=[choices[0],item("selected-outcome-help",
    "I selected this real outcome but cannot decide what follows",
    "For the outcome you selected, which mathematical question remains: "+bounded(next.question),
    "Check one relevant observation, condition or calculation from your actual result. Then test this possible next step: "+bounded(next.why),
    bounded(next.check)||"Could the proposed mathematics genuinely change the answer to your aim?",
    "One verified gap or a defensible decision that the aim is answered.",
    "Return to your confirmed finding and review its assumptions before choosing a new technique.",
    "This direction is optional and rests on your selected ACTUAL outcome; it is not evidence of another result."),...choices.slice(1)];
  }else if(advice.status==="stale"||advice.status==="review")
   choices=[asCard("result-needs-review"),...choices];
 }
 // Pearson trouble only when a genuine completed PMCC (not a planned
 // method/title) and a genuinely linked scatter exist. A curve need not be
 // monotonic; never infer Spearman or a fitted model as the next result.
 if(!actual||!isPearsonResult(entry)||!scatterForNext(state))
  choices=choices.filter(x=>x.id!=="pmcc-curved");
 if(g.theoretical)choices=choices.filter(x=>!["sample-relevance","source-precision"].includes(x.id));
 // A chosen route does not overrule the first safety/genuine-result repair.
 if(!actual&&choices[0]?.id==="not-yet-result")choices=[
  choices[0],...choices.filter(x=>x.id!=="not-yet-result")];
 const unique=[...new Map(choices.filter(Boolean).map(x=>{
   // The same unperformed-output difficulty returns the student to their
   // *current* later stage, not the original C30 mathematical page.
   if(x.id==="not-yet-result"&&["C40","C50"].includes(node))
    x=Object.freeze({...x,targetNode:node,targetLabel:"Return to this mathematical stage"});
   return[x.id,x];
  })).values()].slice(0,3);
 if(!unique.length)return null;
 const toolTitle=tool?.title||"";
 const selectedCourse=str(state.planning?.fields?.course||state.project?.course);
 return Object.freeze({
  node,spot,title:node==="C31"&&toolTitle?"Getting unstuck in "+toolTitle:
   spot==="page"?"Find a way forward here":
   spot.startsWith("part:")?"Unblock this mathematical step":"Help with this mathematical decision",
  route:route&&ROUTE_IDS.has(routeId)?route.title:"",method:actual?str(entry?.methodId):"",
  source:actual?"Student-confirmed completed mathematical work":entry?"Work not yet confirmed":"No mathematical result selected",
  selectedOutcome:outcome?.title||"",course:selectedCourse,choices:unique
 });
}
export function studioHelpBadge(state,spot,e=x=>String(x)){
 const help=studioHelpFor(state,spot);if(!help)return "";
 const key=help.node+":"+spot;
 return '<button type="button" class="stuck-help-badge" data-studio-stuck="'+e(key)+
  '" aria-label="I am stuck: '+e(help.title)+'" aria-haspopup="dialog" '+
  'title="Stuck with this mathematics? Try a small next step"><span aria-hidden="true">?</span></button>';
}
/** Add amber help INTO the existing green/purple field rail after DOM render,
 * never replace labels, criterion/writer badges or their keyboard bindings. */
export function attachStudioHelpFieldBubbles(state,main,e=x=>String(x)){
 if(state?.route!=="completing"||!main?.querySelectorAll)return 0;
 let count=0;
 for(const input of main.querySelectorAll('[data-bind]')){
  const path=input.getAttribute("data-bind")||"";
  let field="";
  if(path.startsWith("completion.fields."))field=path.slice("completion.fields.".length);
  else if(/^entries\.\d+\./.test(path)){
   const match=/^entries\.(\d+)\.(.+)$/.exec(path);
   if(!match||Number(match[1])!==state.completion.activeEntryIndex)continue;
   field=entryFieldSpot.has(match[2])?match[2]:"";
  }
  if(!field)continue;
  const badge=studioHelpBadge(state,"field:"+field,e);
  if(!badge)continue;
  const group=input.closest(".field-group");
  const label=group?.querySelector("label.field-label");
  if(!label||group.querySelector('[data-studio-stuck="'
     +state.completion.current+':field:'+field+'"]'))continue;
  const rail=group.querySelector(".criterion-field-help-rail");
  if(rail){
   rail.insertAdjacentHTML("beforeend",badge);
  }else{
   const header=label.closest(".criterion-field-header,.stuck-field-header");
   if(header)header.insertAdjacentHTML("beforeend",badge);
   else{
    const container=document.createElement("div");
    container.className="stuck-field-header";
    label.parentNode.insertBefore(container,label);
    container.append(label);
    container.insertAdjacentHTML("beforeend",badge);
   }
  }
  count++;
 }
 return count;
}
