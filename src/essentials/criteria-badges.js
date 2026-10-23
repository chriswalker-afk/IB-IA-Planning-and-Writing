import {CRITERIA,courseLevel} from './catalog.js';
import {criteriaContext} from './context.js';
import {contextualBadgeGuidance} from './criteria-badge-guidance.js';
import {guidanceContext} from '../completing/guidance-context.js';
import {firstUnfamiliarUse,methodFamilies} from '../completing/method-identity.js';
import {linkedAccuracy} from '../completing/evidence-links.js';
import {escapeHtml} from '../ui/primitives.js';
import {criterionAlternativeOpportunities} from './criterion-opportunities.js';
import {LATER_MATHS_SPOTS,LATER_MATHS_SPOT_IDS} from './later-maths-criterion-spots.js';
import {CHECKING_CRITERION_SPOTS} from './checking-criterion-spots.js';
import {isRevisedAssessment} from './assessment-cohorts.js';

/** Selective, read-only opportunities. A badge never represents a score or checklist point. */
export const CRITERION_SPOTS=Object.freeze({
 ...LATER_MATHS_SPOTS,
 ...CHECKING_CRITERION_SPOTS,
 'planning:N01V:benefit':Object.freeze({
  criterion:'C',location:'Who might benefit, and how could the answer help?',stage:'Planning · motivation',
  why:'Your genuine purpose can influence which mathematical questions you pursue and which decisions you make. A personal story by itself is not evidence of engagement.',
  strong:'Give one real reason for investigating the question. Say what knowing the answer could help you understand, compare or decide, then let that purpose guide your later mathematical choices.',
  avoid:'Avoid invented beneficiaries, generic claims that mathematics is useful, or assuming your original prediction will be proved.',
  reminder:'This is an opportunity to develop personal engagement later, not a mark awarded for completing a planning box.'
 }),
 'planning:N02M:title':Object.freeze({
  criterion:'E',location:'Choose your course and explore possible mathematics.',stage:'Planning · mathematical direction',
  why:'Mathematics should serve your investigation aim and suit your course. Choosing a long list of advanced techniques does not make an investigation mathematically stronger.',
  strong:'Identify a mathematical question that your proposed technique might answer. Keep the choice provisional and check course suitability with your teacher where uncertain.',
  avoid:'Avoid selecting techniques because they appear impressive, or assuming a suggested pathway is formal syllabus verification.',
  reminder:'This is a provisional choice. Criterion E is demonstrated through relevant, correct mathematics and understanding in the completed exploration.'
 }),
 'completing:C10:aim':Object.freeze({
  criterion:'A',location:'Introduction: the mathematical aim and concise background',stage:'IA Studio · introduction',
  why:'Criterion A rewards a coherent, well-organised and concise investigation. A precise starting aim gives the reader a mathematical thread to follow throughout the work.',
  strong:'State what you intend to investigate mathematically, then include only enough subject background and specialist vocabulary to understand the question. A few focused paragraphs are usually sufficient.',
  avoid:'Avoid a vague topic instead of a question, a long non-mathematical essay, or a list promising every calculation before any mathematical result is known.',
  reminder:'Criterion A is judged across the entire exploration. A few paragraphs is helpful writing advice, not a prescribed IB introduction word or page limit.'
 }),
 'completing:C10:motivation':Object.freeze({
  criterion:'C',location:'Introduction: the genuine question or curiosity behind the aim',stage:'IA Studio · introduction',
  why:'Criterion C concerns how independent choices, questions and perspectives shape the mathematical exploration. A genuine starting reason can make its direction understandable.',
  strong:'Explain one authentic observation, puzzle or mathematical interest that led you to the aim. Write naturally in first person where appropriate; allow the investigation to develop through your later decisions.',
  avoid:'Avoid an invented personal anecdote, generic statements about loving mathematics, or treating the use of I as sufficient evidence of personal engagement.',
  reminder:'Criterion C is judged across the completed mathematical exploration. Your introduction starts the story; actual mathematical decisions and development show engagement later.'
 }),
 "completing:C20:firstBridge":Object.freeze({"criterion":"A","location":"Connect the first mathematics to the aim","stage":"IA Studio · introduce the first mathematics","why":"Criterion A concerns the coherence of the complete mathematical story. The reader should know why the first real graph, model, calculation or small case belongs immediately after the introduction.","strong":"If your introduction has not already made this link, use a sentence or two to show which part of the aim the first mathematics addresses. Then move into the maths.","avoid":"Avoid repeating a clear introduction, promising a whole list of techniques or interpreting a result before it exists.","reminder":"A short logical bridge supports presentation, but completing a prompt does not earn a Criterion A mark."}),
 "completing:C20:firstPurpose":Object.freeze({"criterion":"E","location":"The mathematical question for the first real step","stage":"IA Studio · first mathematical purpose","why":"Criterion E is about relevant and understood mathematical work. A focused question helps the student choose an appropriate graph, diagram, numerical case or calculation.","strong":"Identify the mathematical feature, relationship or property you want the first step to reveal. Use a technique suitable for the question, then interpret what real work establishes.","avoid":"Avoid announcing an imagined result, committing to every technique selected in Planning, or mistaking a proposed investigation route for mathematics already carried out.","reminder":"The question is provisional. Only the mathematics actually shown in the IA can demonstrate Criterion E."}),
 "completing:C20:methodIntroduction":Object.freeze({"criterion":"E","location":"Introduce relevant mathematics without a textbook explanation","stage":"IA Studio · First mathematics · 2a","why":"Criterion E concerns using relevant mathematics accurately and with understanding. A reader already familiar with the course needs a mathematical purpose and appropriate notation, not an explanation of every routine procedure.","strong":"Identify the mathematical technique you intend to use, the quantity or structure it investigates, and why it is relevant to this aim. Define unfamiliar concepts only if needed to demonstrate understanding.","avoid":"Do not teach an existing syllabus technique step by step, list methods you might never use, or claim planned calculations have already been performed.","reminder":"These are prompts for clear mathematical choices, not marks for naming a technique. Judge relevance against the actual work."}),
 "completing:C20:methodJustification":Object.freeze({"criterion":"C","location":"Justify the independent choice of mathematical method","stage":"IA Studio · First mathematics · 2a","why":"Personal engagement can be shown through genuine decisions about a mathematical approach that responds to a specific question or earlier insight.","strong":"Give the reasoning behind choosing this approach for your aim, rather than choosing it because it is familiar, difficult or suggested by the site.","avoid":"Do not pretend a suggested investigative journey is obligatory or an independent discovery, and do not invent evidence for the choice.","reminder":"Criterion C is demonstrated across genuine student decisions throughout the whole exploration."}),
 "completing:C20:methodEvaluation":Object.freeze({"criterion":"D","location":"Reflect on mathematical limitations and meaningful alternatives","stage":"IA Studio · First mathematics · 2b","why":"Criterion D concerns meaningful reflection on mathematical results, assumptions and the strength of conclusions. Early in the journey, prospective limitations can guide what the student should test.","strong":"Identify a mathematical assumption or restriction that could affect your aim, explain the consequence, and consider a specific alternative or mathematical check. Return after results to see if it actually mattered.","avoid":"Avoid generic lab-report errors, empty claims that every method has limitations, or describing an anticipated weakness as already observed.","reminder":"Genuine reflection is demonstrated as the mathematics develops; naming a limitation in advance does not complete Criterion D."}),
 "completing:C20:methodSuitability":Object.freeze({"criterion":"E","location":"Explain why this mathematical approach is suitable for this investigation","stage":"IA Studio · First mathematics · 2b","why":"Criterion E values relevant, appropriate and understood mathematics, including justified assumptions and recognition of where a method is valid.","strong":"Compare with a plausible mathematical alternative where helpful; explain which mathematical question the chosen method can answer and under what assumptions or domain.","avoid":"Avoid claiming a method is universally 'correct', automatically better because it is advanced, or justified only by a good-looking graph.","reminder":"Your choice is provisional until actual mathematical work supports or challenges its suitability. The method must be applied meaningfully."}),
 "completing:C20:source":Object.freeze({"criterion":"A","location":"How the actual source and method are introduced","stage":"IA Studio · Data & Methods","why":"Criterion A values a well organised, concise exploration. The reader should understand where the genuine mathematical evidence came from and why its presence matters for the aim.","strong":"Describe only the source, relevant data or mathematical object actually available, with essential provenance and definitions, then connect it to the investigation.","avoid":"Avoid a long lab-style diary, descriptions of intended collection as fact, or unrelated background.","reminder":"This helps the coherence of the entire IA; a single written box is not an awarded mark."}),
 "completing:C20:method":Object.freeze({"criterion":"C","location":"The student's genuine method choice","stage":"IA Studio · Data & Methods","why":"Personal engagement develops through independently justified decisions that shape the mathematical exploration, including a method selected for a genuine mathematical reason.","strong":"Explain briefly why your actual approach can address your particular question, acknowledging any meaningful decision you made yourself.","avoid":"Do not invent a personal story, assert a method was chosen if it was not used, or claim that convenience alone establishes mathematical engagement.","reminder":"Criterion C is demonstrated through the exploration as a whole, not by mentioning a choice once."}),
 "completing:C21S:samplingRationale":Object.freeze({"criterion":"C","location":"Explain your real sampling choice","stage":"IA Studio · Data & Methods · sampling","why":"An independently justified sampling choice helps show how the investigation responds to the student's specific aim.","strong":"State the population and how units or observations were actually selected; explain why this could answer the mathematical question.","avoid":"Avoid calling an already available convenience sample random or reporting a theoretical sampling plan as data collected.","reminder":"Evidence of independence depends on genuine decisions, not the presence of a completed field."}),
 "completing:C21S:responseBias":Object.freeze({"criterion":"D","location":"Evaluate what the real sampling design can support","stage":"IA Studio · Data & Methods · sampling","why":"Meaningful reflection considers whether sampling or response bias changes what can responsibly be inferred from real data.","strong":"Identify a specific representativeness or selection issue and explain its consequence for population-level claims.","avoid":"Avoid a generic list of disadvantages or assuming any detected association proves causation.","reminder":"Mathematically consequential limitations should be discussed where they arise; this is not an automatic grade."}),
 "completing:C21M:modelAssumptions":Object.freeze({"criterion":"E","location":"Explain the mathematical basis of your model","stage":"IA Studio · Data & Methods · modelling","why":"Criterion E concerns relevant, correct and understood mathematics, including what assumptions give a model its meaning.","strong":"Define meaningful variables and constraints; explain the particular assumption that makes the chosen mathematical model suitable.","avoid":"Avoid unexamined models or assuming a more advanced formula is necessarily better.","reminder":"Only your actual use and understanding of the mathematics, throughout the exploration, can demonstrate Criterion E."}),
 "completing:C21M:modelDomain":Object.freeze({"criterion":"D","location":"Define the limits of a model's mathematical validity","stage":"IA Studio · Data & Methods · modelling","why":"Reflection should identify when an input range or assumption restricts what the mathematical model could reasonably predict.","strong":"State a defensible range, relevant simplification or proposed way to validate the model and explain which conclusions it affects.","avoid":"Avoid treating an untested model as valid over every possible input or generic admissions that models are imperfect.","reminder":"A proposed restriction is not verification of how the model will fit actual data."}),
 "completing:C21T:theoreticalObject":Object.freeze({"criterion":"E","location":"State the theoretical object and mathematical question","stage":"IA Studio · Data & Methods · theoretical work","why":"Theory needs a mathematically precise starting point and appropriate assumptions; it does not require a fictitious empirical dataset.","strong":"Define your objects or conjecture precisely, and distinguish examples from a general proof or disproof.","avoid":"Avoid vague statements or treating several tested numbers as proof of an unrestricted claim.","reminder":"A stated conjecture is a start, not evidence of mathematical depth or a proved result."}),
 "completing:C22:methodReason":Object.freeze({"criterion":"C","location":"Why a real mathematical method was chosen","stage":"IA Studio · Data & Methods · method choice","why":"Independent method decisions can contribute to personal engagement when they genuinely respond to the mathematical aim.","strong":"Give a short mathematical reason for your actual choice, with a relevant comparison only when one helps explain the decision.","avoid":"Avoid listing all available techniques or choosing one merely because it is easy or sophisticated.","reminder":"The broader mathematical investigation shows personal engagement, not a single justification."}),
 "completing:C23:limitationConsequence":Object.freeze({"criterion":"D","location":"The mathematical consequence of a real source limitation","stage":"IA Studio · Data & Methods · limitations","why":"Criterion D values substantive reflection on the scope and reliability of actual mathematical findings.","strong":"Explain how a limitation of the collected data or method restricts the result or generalisation, and what was genuinely checked or mitigated.","avoid":"Avoid generic lab-report weaknesses or invented errors with no mathematical consequence.","reminder":"Reflect only on issues that matter for the work actually carried out."}),
 "completing:C24:accuracyReason":Object.freeze({"criterion":"B","location":"Communicate a defensible precision policy","stage":"IA Studio · Data & Methods · accuracy","why":"Accurate mathematical communication includes using sensible units, notation, equality versus approximation, and reported precision.","strong":"Use the original resolution and any supported uncertainty to justify how derived answers will be displayed; retain guard digits during calculations.","avoid":"Avoid universal decimal-place rules or confusing a device's smallest marking with its complete uncertainty.","reminder":"A written policy must be applied appropriately to the actual displayed mathematics."}),
 "completing:C25:variableDefinitions":Object.freeze({"criterion":"B","location":"Define mathematical variables and important terms","stage":"IA Studio · Data & Methods · notation","why":"A mathematical reader should understand each symbol, unit and representation as it first becomes relevant.","strong":"Define new symbols and units accurately and keep descriptions of non-mathematical specialist words brief.","avoid":"Avoid undefined notation, duplicated textbook explanations or lengthy tangents into another subject.","reminder":"Good mathematical communication is demonstrated where the notation actually appears in the IA."}),
 "completing:C26:dataAimLink":Object.freeze({"criterion":"A","location":"Connect evidence and method to the exploration's aim","stage":"IA Studio · Data & Methods · transition","why":"Coherence requires a clear relationship between the mathematical aim, the material used and the next step.","strong":"Use a short explanation of why this source or mathematical starting point could help answer the question.","avoid":"Avoid repeated background and sweeping claims that a source is reliable without checking it.","reminder":"The connection should continue throughout the completed exploration."}),
 "completing:C34A:accuracyForResult":Object.freeze({"criterion":"B","location":"Present an actual mathematical result with appropriate accuracy","stage":"IA Studio · Mathematical Exploration · precision","why":"Appropriate numerical communication reflects the precision justified by genuine data and calculations.","strong":"Apply the relevant earlier source policy, with appropriate derived precision and clear approximate signs.","avoid":"Avoid rounding symbolic exact results unnecessarily or equating raw input digits with final result accuracy.","reminder":"Explain a new accuracy decision only when the mathematics warrants one."}),
 "completing:C34U:surpriseCheck":Object.freeze({"criterion":"D","location":"Respond mathematically to a surprising or unclear finding","stage":"IA Studio · Mathematical Exploration · reflection","why":"Reflection involves checking the meaning of a genuine unexpected result and deciding what it warrants.","strong":"Identify one plausible mathematical check, different assumption, counterexample or source verification that follows from the actual finding.","avoid":"Do not alter observations to agree with a prediction or manufacture a result to make the investigation exciting.","reminder":"An unresolved surprise can be recorded honestly; it need not generate extra calculations."}),
 "completing:C35H:nextReason":Object.freeze({"criterion":"C","location":"Explain an independent next mathematical question","stage":"IA Studio · Mathematical Exploration · next step","why":"Independent decisions are meaningful when the student selects a follow-up in response to mathematical evidence.","strong":"Choose an optional follow-up only when it logically resolves a real question raised by the previous result.","avoid":"Avoid accepting suggested mathematics merely to add difficulty or length.","reminder":"A decision not to carry out another technique can also be mathematically justified."}),
 "completing:C40D:courseWhy":Object.freeze({"criterion":"E","location":"Justify suitable mathematics for the investigation","stage":"IA Studio · Mathematical Exploration · course suitability","why":"Criterion E concerns relevance, correctness and understanding, not apparent mathematical sophistication.","strong":"Explain which question the chosen mathematics actually answers and ensure your understanding of the technique and course level is sound.","avoid":"Avoid claiming an unfamiliar technique must earn more credit, or presenting a standard technique as beyond the syllabus without checking.","reminder":"No unperformed calculation or procedural description substitutes for genuine mathematics."}),
 "completing:C30:introduceA":Object.freeze({
  criterion:"A",location:"Introduce this graph, diagram, table or calculation before showing it",stage:"IA Studio · Showing first mathematics · 1",
  why:"Criterion A rewards a coherent mathematical exploration. A reader needs to know how an individual representation follows from the aim and why it is worth looking at.",
  strong:"Write one or two sentences immediately before the output. Identify what will be displayed and the specific question it helps answer, without repeating your earlier method justification.",
  avoid:"Avoid dropping in an unexplained graphic, using the caption as the entire introduction, or describing a result before it has been produced.",
  reminder:"This writing helps your IA flow; a completed box is not an awarded criterion mark."
 }),
 "completing:C30:introduceB":Object.freeze({
  criterion:"B",location:"Give readers the essential mathematical context for the first output",stage:"IA Studio · Showing first mathematics · 1",
  why:"Criterion B concerns mathematical communication: quantities, notation and representations need to be understandable when they appear.",
  strong:"Name the relevant variables, units, mathematical objects or assumptions that have not already been defined, and refer to the figure or calculation appropriately.",
  avoid:"Avoid undefined symbols, ambiguous graph labels, unnecessary re-explanations of syllabus mathematics or relying solely on a caption.",
  reminder:"The real diagram or calculation still needs clear labels, notation and units; this short introduction supports rather than replaces those checks."
 }),
 "completing:C30:reflectD":Object.freeze({
  criterion:"D",location:"Reflect on what your actual first result means for your aim and prediction",stage:"IA Studio · Showing first mathematics · 3",
  why:"Reflection is more than repeating a number or describing a graph. It considers the implications of a genuine finding for the investigation question and earlier expectation.",
  strong:"Explain what the observed result supports, challenges or leaves undecided. Compare with your tentative prediction if you made one and qualify conclusions where real limitations matter.",
  avoid:"Avoid treating a planned outcome as observed, forcing a result to agree with your prediction, or ending with an unsupported conclusion.",
  reminder:"Wait for an actual mathematical result before asserting what it shows. Meaningful reflection develops throughout the exploration."
 }),
 "completing:C30:reflectE":Object.freeze({
  criterion:"E",location:"Interpret the mathematical feature correctly before reflecting",stage:"IA Studio · Showing first mathematics · 3",
  why:"Relevant mathematics must be understood as well as calculated. The kind of conclusion depends on what the representation can mathematically establish.",
  strong:"Identify the real value, pattern, domain, turning point, distribution feature, counterexample or logical result, then describe its meaning for this aim.",
  avoid:"Avoid interpreting a correlation as causation, a few cases as proof, an approximate result as exact, or a model beyond its justified domain.",
  reminder:"This bubble highlights correct mathematical interpretation; it does not assess the mathematical work for you."
 }),
 "completing:C30:nextC":Object.freeze({
  criterion:"C",location:"Choose a genuinely worthwhile next mathematical question",stage:"IA Studio · Showing first mathematics · 4",
  why:"Personal engagement can be demonstrated by making informed mathematical choices that respond to what you have discovered, rather than following a predetermined list of techniques.",
  strong:"Identify a gap, complication or interesting consequence that emerged from the real result. If nothing important remains, choosing to conclude can be equally well justified.",
  avoid:"Avoid adding techniques for length, automatically using every method selected in Planning, or inventing an unresolved question.",
  reminder:"Independent decisions become evidence of engagement through the actual development of the mathematics, not by filling in this prompt."
 }),
 "completing:C30:nextD":Object.freeze({
  criterion:"D",location:"Explain the mathematical bridge from a result to what follows",stage:"IA Studio · Showing first mathematics · 4",
  why:"A meaningful next step reflects on what the previous result established, where its mathematical restrictions lie, and how a new question could improve the answer to the aim.",
  strong:"Use your actual result to justify the next calculation, model, check or proof. Write the transition in the IA before the new mathematics, or explain why the investigation has sufficient evidence to conclude.",
  avoid:"Avoid announcing the next method with no link to the preceding work, inventing limitations to justify more calculations, or treating a prediction as evidence.",
  reminder:"Another calculation is not compulsory: a considered mathematical stopping point can be an appropriate next step."
 }),
 'completing:C31:firstPurpose':Object.freeze({
  criterion:'E',location:'Why might this help answer the aim?',stage:'IA Studio · select an initial representation',
  why:'A mathematical representation is useful when it could answer a specific part of your investigation question.',
  strong:'Choose a graph, diagram, example or calculation for a mathematical reason. State the question it might reveal and whether you have the genuine evidence it requires.',
  avoid:'Avoid beginning with a graph simply because it is familiar, choosing a technique to impress, or inventing data to get started.',
  reminder:'Choosing an initial representation is a plan, not evidence of completed mathematical work.'
 }),
 'completing:C32:purpose':Object.freeze({
  criterion:'A',location:'Mathematical purpose BEFORE it',stage:'IA Studio · introduce your first mathematics',
  why:'A brief mathematical bridge helps the reader understand why the next representation belongs in your exploration.',
  strong:'Before the working or figure, explain which question the step is designed to investigate and link it to the preceding aim or finding.',
  avoid:'Avoid dropping in an unexplained figure, writing a long generic introduction or reporting a result before doing the mathematics.',
  reminder:'Coherence is judged across the whole exploration, not by one introductory sentence.'
 }),
 'completing:C33:title':Object.freeze({
  criterion:'B',location:'Create the actual figure or calculation',stage:'IA Studio · communicate your first mathematics',
  why:'A reader needs correctly labelled and presented mathematics to understand what has genuinely been done.',
  strong:'Put the real diagram, graph, table or calculation into your IA. Define necessary symbols, label axes and units, identify relevant scales and use defensible accuracy.',
  avoid:'Avoid screenshots with unreadable notation, unlabeled graphs, invented results or calling a planned calculation completed.',
  reminder:'Different representation types are not required for their own sake. Communicate the mathematics you actually use.'
 }),
 'completing:C34:observation':Object.freeze({
  criterion:'E',location:'What can you really observe?',stage:'IA Studio · observe an actual result',
  why:'Accurate mathematical interpretation begins with reading what the representation actually establishes.',
  strong:'Describe the mathematical feature you can justify, such as a value, trend, turning point, boundary, counterexample or absence of a clear pattern. Distinguish conjecture from proof.',
  avoid:'Avoid reporting an expected pattern as a finding, interpreting a relationship that the graph does not show, or claiming that correlation proves causation.',
  reminder:'A mathematical observation should rest on a genuine result. Its meaning for the aim is discussed in the next reflection step.'
 }),
 'completing:C35:nextQuestion':Object.freeze({
  criterion:'C',location:'What worthwhile mathematical question remains unanswered?',stage:'IA Studio · choose your own next question',
  why:'Personal engagement can be demonstrated when you make an informed mathematical decision that develops your investigation.',
  strong:'Choose a follow-up that answers a real gap in your previous result or tests an interesting mathematical consequence. You can also decide that enough has been established.',
  avoid:'Avoid adding a calculation for quantity, copying a suggested route automatically or pretending every result creates a new question.',
  reminder:'An independent mathematical decision matters through how it shapes the exploration, not because a question box was filled.'
 }),
 'completing:C35:nextReason':Object.freeze({
  criterion:'D',location:'Why would this next technique follow from the previous result?',stage:'IA Studio · justify the next step',
  why:'A well-founded next step reflects on what the previous mathematics answered and what it left uncertain.',
  strong:'Refer to a real previous finding or limitation. Explain why the proposed technique could resolve the remaining issue—or explain why the investigation can conclude.',
  avoid:'Avoid claiming a planned or unsupported result, repeating a technique list or inventing a weakness to justify more mathematics.',
  reminder:'Reflection can include deciding that another calculation is not necessary.'
 }),
 'completing:C35B:title':Object.freeze({
  criterion:'E',location:'Interpret the actual scatter pattern',stage:'IA Studio · paired numerical data',
  why:'The mathematical method chosen after a scatter graph should match its actual shape and the investigation aim.',
  strong:'Look at the real pattern before selecting Pearson correlation or a model. Determine whether a linear relationship is plausible, and consider genuine curvature or outliers.',
  avoid:'Avoid forcing a line through a curved trend or saying that a low Pearson r means there is no relationship of any kind.',
  reminder:'A pattern choice must describe real data. The badge does not certify that a scatter graph or calculation is correct.'
 }),
 'completing:C35P:title':Object.freeze({
  criterion:'E',location:'After an actual Pearson correlation calculation',stage:'IA Studio · linear association',
  why:'Pearson r describes the direction and strength of linear association in paired numerical data, not every type of relationship.',
  strong:'Interpret an r value only after calculating it. Compare its implications with the scatter plot and decide whether a fitted model, a check or no further calculation is justified.',
  avoid:'Avoid treating correlation as causation, a low r as proof of no relationship, or a hypothetical r as an actual finding.',
  reminder:'The next technique should be useful for your aim, not obligatory because r was calculated.'
 }),
 'completing:C40:title':Object.freeze({
  criterion:'E',location:'First substantial mathematical section',stage:'IA Studio · relevant mathematics',
  why:'Criterion E values mathematics that is relevant, correct and understood. Mathematical depth should serve the investigation.',
  strong:'Link the technique to the previous mathematical question, show meaningful working and explain what an actual result establishes. Verify course suitability rather than assuming unfamiliar means advanced.',
  avoid:'Avoid a disconnected calculation, unexplained software output or a textbook tutorial for a familiar syllabus technique.',
  reminder:'A planned method is not an actual result. The use of mathematics is assessed across the exploration.'
 }),
 'completing:C50:title':Object.freeze({
  criterion:'E',location:'Further substantial mathematics',stage:'IA Studio · develop the mathematical investigation',
  why:'A later method should deepen the answer, test a genuine uncertainty or extend a real earlier mathematical result.',
  strong:'Explain why the new mathematics follows from the selected previous result, demonstrate and check the steps, then interpret the result before proceeding.',
  avoid:'Avoid repeating similar techniques for length, treating a list of methods as mathematical depth or skipping interpretation between sections.',
  reminder:'There is no compulsory number of substantial calculations. Concluding can be the strongest next decision.'
 }),
 'completing:C40T:title':Object.freeze({
  criterion:'E',location:'Explain technology-assisted mathematics',stage:'IA Studio · technology with understanding',
  why:'Using a GDC, spreadsheet, graphing tool or code is not itself evidence that the underlying mathematics is understood.',
  strong:'Identify the mathematical operation, its meaningful inputs, what the actual output represents and why the result matters for your question.',
  avoid:'Avoid relying on screenshots, unexplained fitted parameters, unexplained code or excessive calculator digits.',
  reminder:'Technology helps carry out mathematics. Understanding and justified interpretation remain important.'
 }),
 'completing:C40L:title':Object.freeze({
  criterion:'E',location:'Explain unfamiliar mathematics when genuinely needed',stage:'IA Studio · mathematical understanding',
  why:'An unfamiliar idea needs enough explanation to demonstrate your own understanding when it first contributes to the investigation.',
  strong:'Identify precisely what was new, state the relevant definitions and conditions, show a short meaningful step or check and acknowledge sources you actually used.',
  avoid:'Avoid calling a technique beyond the syllabus without checking, reteaching familiar course formulas or copying a long general tutorial.',
  reminder:'Once unfamiliar mathematics has genuinely been introduced and understood, reuse it without repeating the explanation.'
 }),
 'completing:C34B:title':Object.freeze({
  criterion:'D',location:'Reconnect with aim and prediction',stage:'IA Studio · interpretation',
  why:'Reflection moves beyond describing a result. It considers what the actual mathematics tells you about your aim, its implications and the questions still left open.',
  strong:'Use a result you genuinely obtained. Explain what it establishes in context, how it compares with any earlier expectation, and what you can reasonably conclude or investigate next.',
  avoid:'Avoid merely repeating a graph description, claiming an expected result without evidence, or assuming an inconclusive result is a failure.',
  reminder:'Meaningful reflection can appear throughout the exploration, not only in its final conclusion.'
 }),
 'completing:C60:meaningAndLimits':Object.freeze({
  criterion:'D',location:'What your mathematical answer means and where it applies',
  stage:'IA Studio · conclusion · meaning and limits',
  why:'Criterion D recognises meaningful or critical reflection on genuine mathematical findings. A conclusion should bring together their implications and significant restrictions without repeating every reflection already made beside the mathematics.',
  strong:'Explain what your actual answer clarifies about the original question or purpose. Identify only assumptions, uncertainty, sensitivity or domain restrictions that materially affect how far the conclusion applies, and explain their consequences. If nothing further limits the established claim, do not invent a weakness.',
  avoid:'Avoid generic error lists, an invented beneficiary, a repetition of earlier calculations, or treating an unperformed extension as a finding.',
  reminder:'Criterion D is assessed across the exploration. This ending synthesises genuine reflection; completing the box does not earn a separate mark.'
 }),
 'completing:C61:mainConclusion':Object.freeze({
  criterion:'A',location:'The strongest answer I can support',stage:'IA Studio · conclusion in context',
  why:'A coherent conclusion answers the original mathematical aim using only the work actually carried out.',
  strong:'Give a concise, qualified answer and connect it to the key results or arguments already presented in your IA. An inconclusive result can be an honest answer.',
  avoid:'Avoid introducing brand-new calculations, copying the full working again, or claiming that a planned result has been established.',
  reminder:'Criterion A concerns coherence across the whole exploration. One conclusion paragraph does not establish it by itself.'
 }),
 'completing:C61:uncertainty':Object.freeze({
  criterion:'D',location:'What important uncertainty remains?',stage:'IA Studio · evaluate the conclusion',
  why:'Reflection involves recognising how genuine limitations or uncertainty affect the strength and meaning of a mathematical conclusion.',
  strong:'Identify a limitation that actually changes what you can claim. Explain its consequence, or explain why your established mathematical result has a clear domain or scope.',
  avoid:'Avoid a generic list of weaknesses, speculative errors presented as facts, or saying an uncertainty is harmless without evidence.',
  reminder:'Link to reflections already made beside the mathematics rather than rewriting them at the end.'
 }),
 'completing:C62:benefit':Object.freeze({
  criterion:'D',location:'What can the actual results tell that audience?',stage:'IA Studio · implications of the result',
  why:'Connecting genuine findings back to the original purpose is a meaningful opportunity for reflection.',
  strong:'Explain what your mathematics can and cannot help someone understand or decide. If it does not support the hoped-for use, say so.',
  avoid:'Avoid treating motivation or an initial prediction as evidence, inventing advice or assuming that every investigation has a practical beneficiary.',
  reminder:'A mathematical investigation can have an intellectual purpose; do not invent an external audience.'
 }),
 'completing:C63:extension':Object.freeze({
  criterion:'D',location:'One mathematical question that might follow (optional)',stage:'IA Studio · a meaningful extension',
  why:'An extension may demonstrate reflection if it genuinely follows from an established mathematical result or unresolved question.',
  strong:'Only if useful, identify one mathematical consequence, special case or model restriction worth examining, and explain its connection to your findings.',
  avoid:'Avoid generic future-work suggestions, adding more data without a mathematical reason, or treating an extension as compulsory.',
  reminder:'No extension is required when the mathematics already supports a reasonable stopping point.'
 }),
 'completing:C64:title':Object.freeze({
  criterion:'A',location:'Keep the conclusion concise and connected',stage:'IA Studio · coherent ending',
  why:'The conclusion should complete the thread from the aim through the mathematical development, without repeating everything.',
  strong:'Summarise what the mathematics established, acknowledge only consequential limits, and remove working or critique that belongs earlier.',
  avoid:'Avoid another long methods section, new unperformed checks, or a conclusion disconnected from the original aim.',
  reminder:'Edit the actual document where changes belong; reviewing this page alone cannot demonstrate coherence.'
 }),
 'completing:C70:title':Object.freeze({
  criterion:'A',location:'Review clarity across the actual document',stage:'IA Studio · presentation and coherence',
  why:'Presentation concerns an organised mathematical argument, not decoration alone. Readers need clear connections between the aim, representations and conclusions.',
  strong:'Inspect the real IA. Introduce each major representation where it supports a mathematical claim, remove needless repetition and connect sections logically.',
  avoid:'Avoid prioritising colour or formatting over understanding, hiding essential mathematics in an appendix or claiming review notes are corrections already made.',
  reminder:'Criterion A concerns the coherence of the mathematical exploration. Credit external sources for academic integrity, but references and bibliography details do not themselves earn Criterion A marks. The notation-specific Criterion B badge is on its own screen.'
 }),
 'completing:C80D:title':Object.freeze({
  criterion:'A',criteria:Object.freeze(['A','B','C','D','E']),
  location:'Review my complete teacher draft against A–E',stage:'IA Studio · optional draft self-review',
  why:'A useful draft self-review checks the mathematics actually written, the organisation, the decisions made and the reflection already evidenced.',
  strong:'Locate examples in the real draft for each of A–E and make one specific revision plan where needed. Use the existing evidence-review panel rather than filling out a second criteria form.',
  avoid:'Avoid self-awarding marks for completing Pathfinder screens or describing unfinished mathematics as a complete draft.',
  reminder:'Your draft evidence pointers and self-marks remain your own provisional judgements, not teacher approval.'
 }),
 'completing:C90F:title':Object.freeze({
  criterion:'A',criteria:Object.freeze(['A','B','C','D','E']),
  location:'Check the final exploration against A–E',stage:'IA Studio · final evidence review',
  why:'The final review should locate genuine evidence in the actual revised document and identify any significant gaps without making up work.',
  strong:'Review coherence (A), communication (B), demonstrated personal engagement (C), substantive reflection (D) and suitable, understood mathematics (E), using your saved evidence pointers.',
  avoid:'Avoid treating five completed boxes as five achieved criteria, redoing advice already addressed or claiming that the website predicts an IA grade.',
  reminder:'This remains a self-review. The site does not inspect or grade your final document or submit it to the IB.'
 }),
 'completing:C70N:title':Object.freeze({
  criterion:'B',location:'Notation and mathematical presentation',stage:'IA Studio · notation review',
  why:'A reader should be able to follow your mathematics through appropriate, consistent symbols, units, definitions, equations and representations.',
  strong:'Check your own document in place. Define a variable when first used, label figures appropriately and distinguish exact equality from justified approximation.',
  avoid:'Avoid undefined symbols, missing units or treating many calculator digits as automatically accurate. Different graph types are not required just to tick a box.',
  reminder:'Fix the original mathematical passage. This review box is not itself evidence that the finished document is correctly communicated.'
 })
});
const TITLE_SPOTS=Object.freeze({
 'completing:C33':'completing:C33:title',
 'completing:C35B':'completing:C35B:title',
 'completing:C35P':'completing:C35P:title',
 'completing:C40':'completing:C40:title',
 'completing:C50':'completing:C50:title',
 'completing:C40T':'completing:C40T:title',
 'completing:C40L':'completing:C40L:title',
 'completing:C64':'completing:C64:title',
 'completing:C70':'completing:C70:title',
 'completing:C80D':'completing:C80D:title',
 'completing:C90F':'completing:C90F:title',
 'planning:N02M':'planning:N02M:title',
 'completing:C34B':'completing:C34B:title',
 'completing:C70N':'completing:C70N:title'
});
export const criterionSpotFor=(route,node)=>TITLE_SPOTS[route+':'+node]||'';
const FIELD_SPOTS=Object.freeze({
 'completing:C40':['completing:C40:title',...LATER_MATHS_SPOT_IDS.map(id=>'completing:C40:'+id)],
 'completing:C50':['completing:C50:title',...LATER_MATHS_SPOT_IDS.map(id=>'completing:C50:'+id)],
 'completing:C30':['completing:C30:introduceA','completing:C30:introduceB','completing:C30:reflectD','completing:C30:reflectE','completing:C30:nextC','completing:C30:nextD'],
 'completing:C31':['completing:C31:firstPurpose'],
 'completing:C32':['completing:C32:purpose'],
 'completing:C34':['completing:C34:observation'],
 'completing:C35':['completing:C35:nextQuestion','completing:C35:nextReason'],
 'completing:C61':['completing:C61:mainConclusion','completing:C61:uncertainty'],
 'completing:C62':['completing:C62:benefit'],
 'completing:C63':['completing:C63:extension']
});
export const criterionFieldSpots=(route,node)=>route==='completing'?(FIELD_SPOTS[route+':'+node]||[]):[];
export const isCriterionSpotPage=(route,node)=>route==='planning'&&node==='N01V'||
 Boolean(criterionSpotFor(route,node))||criterionFieldSpots(route,node).length>0;

/** Badge is a real, accessible button; it never edits student work or progress. */
export function criterionBadge(key){
 const spot=Object.hasOwn(CRITERION_SPOTS,key)?CRITERION_SPOTS[key]:null;
 if(!spot)return '';
 const multi=Array.isArray(spot.criteria)&&spot.criteria.length>1;
 const label=multi?'Criteria A–E':'Criterion '+spot.criterion+' — '+CRITERIA[spot.criterion].name;
 return '<button type="button" class="criterion-badge'+(multi?' criterion-badge-multi':'')+'" data-criterion-badge="'+escapeHtml(key)+
  '" aria-label="'+escapeHtml(label)+': advice for '+escapeHtml(spot.location)+
  '" title="Why '+escapeHtml(label)+' matter'+(multi?'':'s')+' here">'+
  '<span aria-hidden="true">'+(multi?'A–E':spot.criterion)+'</span></button>';
}
/** In IA Studio, all assessment and writing-craft help shares the same
 * field heading. Keeping the original label (and its for/id association) in
 * place preserves keyboard input, saved data and equation-editor behaviour.
 * Planning's established layout is deliberately unchanged.
 */
function writingFieldWithHelp(html,criteria,writingHelp){
 const rubric=criteria.length?
  '<div class="criterion-writing-bubbles" role="group" aria-label="Relevant IA marking criteria">'+
   criteria.map(k=>criterionBadge(k)).join("")+'</div>':"";
 const rail='<div class="criterion-field-help-rail" role="group" aria-label="Help for this writing field">'+
  rubric+writingHelp+'</div>';
 // All live IA writing fields are made by field(), whose first child is
 // a labelled field-group. Put the bubbles after that label, NOT over inputs.
 const leading=/^(<div class="field-group(?: [^"]*)?"[^>]*>\s*)(<label\b[^>]*>[\s\S]*?<\/label>)/;
 if(leading.test(html))return html.replace(leading,(_match,start,label)=>
  start+'<div class="criterion-field-header">'+label+rail+'</div>');
 // Defensive fallback for older custom fields with no standard label:
 // help still appears in document flow above the control, never floating.
 return '<div class="criterion-field-header criterion-field-header-standalone">'+rail+'</div>'+html;
}
/** Preserve Planning's existing criterion presentation, but give each marked
 * IA Studio field (including one without a purple icon) the shared help rail. */
export function criterionMarkedField(html,key,writingHelp=""){
 if(!html)return html;
 const mark=Object.hasOwn(CRITERION_SPOTS,key);
 if(!mark&&!writingHelp)return html;
 const studio=String(key||"").startsWith("completing:")||Boolean(writingHelp);
 const classes='criterion-marked-field'+(writingHelp?' has-writer-guide':'')+
  (mark?'':' criterion-field-guide-only');
 if(studio)return '<div class="'+classes+' has-field-help-rail">'+
  writingFieldWithHelp(html,mark?[key]:[],writingHelp)+'</div>';
 return '<div class="'+classes+'">'+html+(mark?criterionBadge(key):'')+writingHelp+'</div>';
}
/** Shared IA writing-box header; green criterion letters ALWAYS precede the
 * purple Field Guide icon and neither overlaps the text-entry control. */
export function criterionMarkedWritingBox(html,keys=[],writingHelp=""){
 const valid=[...new Set(keys)].filter(k=>Object.hasOwn(CRITERION_SPOTS,k));
 if(!html||(!valid.length&&!writingHelp))return html;
 return '<div class="criterion-marked-field criterion-marked-writing-box has-field-help-rail'+
  (writingHelp?' has-writer-guide':'')+
  (!valid.length?' criterion-field-guide-only':'')+'">'+
  writingFieldWithHelp(html,valid,writingHelp)+'</div>';
}
export function criterionPageHeading(title,route,node){
 const key=criterionSpotFor(route,node),name=escapeHtml(title);
 return key?'<div class="criterion-title-row"><h1 class="task-heading">'+name+'</h1>'+criterionBadge(key)+'</div>':
  '<h1 class="task-heading">'+name+'</h1>';
}
const block=(name,text)=>'<section class="criterion-popin-part"><h3>'+escapeHtml(name)+'</h3><p>'+escapeHtml(text)+'</p></section>';
/** Other legitimate routes are optional inside the existing pop-in; they do not add a badge. */
const alternativesBlock=alternative=>{
 if(!alternative||!alternative.items.length)return '';
 return '<details class="criterion-popin-alternatives" data-criterion-opportunities="'+alternative.criterion+
  '" data-opportunity-profile="'+escapeHtml(alternative.profile)+
  '" data-opportunity-status="'+escapeHtml(alternative.status)+
  '" data-opportunity-course="'+escapeHtml(alternative.level)+'">'+
  '<summary>Other ways to demonstrate Criterion '+alternative.criterion+
   '<span class="criterion-opportunities-chevron" aria-hidden="true">⌄</span></summary>'+
  '<div class="criterion-opportunities-content">'+
  '<p class="criterion-opportunities-preface">Choose only an alternative that genuinely serves your mathematical question.</p>'+
  '<ul>'+alternative.items.map(x=>'<li><strong>'+escapeHtml(x.title)+'</strong>'+
   '<p>'+escapeHtml(x.how)+'</p></li>').join('')+'</ul>'+
  (alternative.levelNote?'<p class="criterion-opportunities-level"><strong>'+
   (alternative.level==='unknown'?'Course level to confirm':alternative.level+' Criterion E emphasis')+
   '</strong> '+escapeHtml(alternative.levelNote)+'</p>':'')+
  '<p class="criterion-opportunities-reminder">'+escapeHtml(alternative.reminder)+'</p>'+
  '</div></details>';
};

/** Native modal gives inert background, Escape behaviour and keyboard focus containment. */
export function createCriterionBadgeController({getState,openRubric=()=>{},openReview=()=>{}}){
 let dialog=null,origin=null,current='';
 function ensure(){
  if(dialog)return;
  dialog=document.createElement('dialog');
  dialog.id='criterionBadgeDialog';
  dialog.className='criterion-popin guidance-surface';
  dialog.dataset.guidanceKind='criteria';
  dialog.setAttribute('aria-labelledby','criterionBadgeTitle');
  dialog.setAttribute('aria-describedby','criterionBadgeSummary');
  document.body.appendChild(dialog);
  dialog.addEventListener('cancel',evt=>{evt.preventDefault();close();});
  dialog.addEventListener('click',evt=>{
   if(evt.target!==dialog)return;
   const r=dialog.getBoundingClientRect();
   if(evt.clientX<r.left||evt.clientX>r.right||evt.clientY<r.top||evt.clientY>r.bottom)close();
  });
 }
 function open(key,trigger=document.activeElement){
  if(!Object.hasOwn(CRITERION_SPOTS,key))return;
  if(isRevisedAssessment(getState())){openRubric('A',trigger);return;}
  ensure();if(dialog.open)dialog.close();
  current=key;origin=trigger;
  const state=getState(),p=contextualBadgeGuidance(state,key,CRITERION_SPOTS[key]),c=CRITERIA[p.criterion];
  const multi=Array.isArray(p.criteria)&&p.criteria.length>1;
  const planned=key==='completing:C34B:title'&&!criteriaContext(state).real;
  const why=planned?'An interpretation can support Reflection only when it is based on actual mathematics. A proposed calculation or prediction is not a result.':p.why;
  const strong=planned?'First complete and check a genuine graph, calculation or argument. Then explain what that specific result means for your aim; do not invent findings.':p.strong;
  const level=p.criterion==='E'?courseLevel(state):'';
  const alternative=criterionAlternativeOpportunities(state,key,p);
  dialog.innerHTML='<div class="criterion-popin-header guidance-surface-header"><div class="criterion-popin-heading">'+
   '<span class="criterion-popin-letter'+(multi?' criterion-popin-letter-multi':'')+'" aria-hidden="true">'+(multi?'A–E':p.criterion)+'</span><div>'+
   '<p class="criterion-popin-eyebrow guidance-surface-eyebrow">RELEVANT HERE · '+escapeHtml(p.stage)+'</p>'+
   '<h2 id="criterionBadgeTitle" class="guidance-surface-title">'+(multi?'Criteria A–E · '+(p.reviewMode==='draft'?'draft':'final')+' review':'Criterion '+p.criterion+' · '+escapeHtml(c.name))+'</h2></div></div>'+
   '<button type="button" class="criterion-popin-close guidance-surface-close" data-criterion-badge-close aria-label="Close criterion guidance">×</button></div>'+
   '<div class="criterion-popin-body guidance-surface-body"><p class="criterion-popin-location" id="criterionBadgeSummary">'+escapeHtml(p.location)+'</p>'+
   block('Why this matters here',why)+
   block('What a strong response looks like',strong)+
   block('Avoid this',p.avoid)+
   (p.details.length?'<section class="criterion-popin-context" aria-label="Your investigation context"><h3>Using your work</h3>'+
    p.details.map(x=>'<p><strong>'+escapeHtml(x.label)+'</strong> '+escapeHtml(x.text)+'</p>').join('')+'</section>':'')+
   alternativesBlock(alternative)+
   (multi?'<section class="criterion-popin-all" aria-label="Where to look for each criterion"><h3>What to look for in your actual IA</h3>'+
    p.reviewRows.map(x=>'<div class="criterion-popin-all-row"><span class="criterion-popin-all-letter">'+x.id+'</span><div><strong>'+escapeHtml(x.title)+'</strong>'+
     '<p>'+escapeHtml(x.focus)+'</p>'+(x.location?'<p class="criterion-popin-evidence">Your recorded location (recheck it): '+escapeHtml(x.location)+'</p>':'')+'</div></div>').join('')+'</section>':'')+
   '<p class="criterion-popin-note">'+escapeHtml(p.reminder)+'</p>'+
   (p.criterion==='E'?'<p class="criterion-popin-level">'+
    escapeHtml(level?'Your recorded course uses the '+level+' Criterion E reference.':'Confirm whether the SL or HL Criterion E rubric applies to your course.')+'</p>':'')+
   '<p class="criterion-popin-disclaimer">A badge is guidance, not evidence, a score or a predicted mark. IB criteria use best-fit judgement across the actual exploration.</p>'+
   (multi?'<div class="criterion-popin-rubric-links"><span>Read a criterion in full:</span>'+
    p.criteria.map(id=>'<button type="button" class="criterion-popin-rubric-link" data-criterion-badge-rubric="'+id+'">'+id+'</button>').join('')+'</div>':'')+
   '<div class="criterion-popin-actions guidance-surface-actions">'+(multi?
    '<button class="btn btn-secondary" type="button" data-criterion-badge-review="'+p.reviewMode+'">Open my existing '+(p.reviewMode==='draft'?'draft':'final')+' A–E evidence review</button>':
    '<button class="btn btn-secondary" type="button" data-criterion-badge-rubric="'+p.criterion+'">Read the full Criterion '+p.criterion+' rubric</button>')+
   '<button class="btn btn-quiet" type="button" data-criterion-badge-close>Return to my work</button></div></div>';
  dialog.showModal();
  dialog.querySelector('#criterionBadgeTitle')?.setAttribute('tabindex','-1');
  dialog.querySelector('#criterionBadgeTitle')?.focus({preventScroll:true});
 }
 function close(){
  if(!dialog?.open)return;
  dialog.close();
  const target=origin?.isConnected?origin:document.querySelector('[data-criterion-badge="'+current+'"]');
  target?.focus({preventScroll:true});
 }
 function click(evt){
  if(!(evt.target instanceof Element))return;
  const badge=evt.target.closest('[data-criterion-badge]');
  if(badge){
   evt.preventDefault();evt.stopImmediatePropagation();
   open(badge.dataset.criterionBadge,badge);return;
  }
  if(!dialog?.open||!dialog.contains(evt.target))return;
  const review=evt.target.closest('[data-criterion-badge-review]');
  if(review){
   evt.preventDefault();evt.stopImmediatePropagation();
   const mode=review.dataset.criterionBadgeReview,anchor=origin;
   close();openReview(mode,anchor);return;
  }
  const rubric=evt.target.closest('[data-criterion-badge-rubric]');
  if(rubric){
   evt.preventDefault();evt.stopImmediatePropagation();
   const id=rubric.dataset.criterionBadgeRubric,anchor=origin;
   close();openRubric(id,anchor);return;
  }
  if(evt.target.closest('[data-criterion-badge-close]')){
   evt.preventDefault();evt.stopImmediatePropagation();close();
  }
 }
 document.addEventListener('click',click,true);
 return {open,close,destroy(){
  close();document.removeEventListener('click',click,true);dialog?.remove();dialog=null;
 }};
}
