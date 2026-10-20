/** Six selective assessment opportunities per repeatable mathematical stage.
 * The existing stage-specific E badge remains beside method suitability.
 * Every reminder refers to evidence in the actual IA, never a Pathfinder score.
 */
const STAGES=Object.freeze(["C40","C50"]);
const OPPORTUNITIES=Object.freeze([
 {id:"bridgeA",criterion:"A",
  location:"Explain how this stage follows the previous mathematics",
  why:"Criterion A concerns the coherence of the complete mathematical exploration. A reader should understand why this new question follows from earlier mathematics rather than a preselected list of techniques.",
  strong:"Use the previous verified mathematical finding to explain the purpose of this next step in a short, natural transition. If the link is already clear in your IA, do not repeat it.",
  avoid:"Avoid a disconnected technique announcement, a repeated introduction or treating an earlier unverified note as an established finding.",
  reminder:"A bridge can improve coherence, but writing it is not itself evidence of a particular mark."},
 {id:"resultB",criterion:"B",
  location:"Communicate the real mathematical work clearly",
  why:"Criterion B concerns accurate, appropriate mathematical communication. Readers need consistent notation, defined variables and representations that support the mathematics actually performed.",
  strong:"Display actual working, a proof, diagram, graph or table with its mathematical objects, labels, notation, domain and relevant units and precision clearly identified.",
  avoid:"Avoid unexplained calculator output, ambiguous symbols, incorrect scales or a collection of representations chosen only for variety.",
  reminder:"One appropriate representation can be enough. The completed IA, not a draft field, is what is assessed."},
 {id:"resultE",criterion:"E",
  location:"Justify and validate the mathematics actually used",
  why:"Criterion E concerns relevant, correct and understood mathematics appropriate to the course. An equation, computer output or proposed technique alone cannot establish understanding.",
  strong:"Show the reasoning or meaningful checks supporting your real result. Explain the method's assumptions and mathematical justification where these matter to your question.",
  avoid:"Avoid claiming that an unperformed calculation is evidence, using advanced mathematics for display, or substituting software output for understanding.",
  reminder:"A planned method is not completed mathematical work; more techniques do not automatically improve Criterion E."},
 {id:"interpretD",criterion:"D",
  location:"Reflect on what this stage actually established",
  why:"Criterion D is demonstrated by meaningful or critical reflection on real mathematics, including implications for the aim and mathematical restrictions that affect the conclusion.",
  strong:"Explain what your verified result changes or clarifies about the investigation aim. Consider a relevant assumption, restriction, mathematical alternative or test of reliability only when it affects your interpretation.",
  avoid:"Avoid merely restating a number or plot, generic error lists, invented weaknesses or reflection on an unperformed calculation.",
  reminder:"Reflection belongs beside meaningful results throughout the IA, not only in the final conclusion."},
 {id:"nextC",criterion:"C",
  location:"Make an independent decision about a worthwhile next question",
  why:"Criterion C can be demonstrated when a student's own mathematical questions, choices or changes of perspective genuinely influence how an investigation develops.",
  strong:"If a genuine finding raises a worthwhile mathematical question, explain what you chose to investigate and why. Equally, deciding thoughtfully that the original aim is answered can be a defensible choice.",
  avoid:"Avoid automatically selecting the next suggested technique, inventing a discovery or adding mathematics for length.",
  reminder:"Authentic personal engagement is seen in the exploration's mathematical decisions, not by filling in an optional next-question box."},
 {id:"nextD",criterion:"D",
  location:"Explain mathematically what should follow, or why you can conclude",
  why:"Criterion D includes evaluating the implications of a result and deciding whether more mathematics would resolve a genuine limitation or uncertainty.",
  strong:"Refer to your actual preceding finding and explain how a proposed check, comparison, alternative approach or proof would clarify it. If none is worthwhile, synthesise what is already established and conclude.",
  avoid:"Avoid speculative extensions presented as achievements, an automatic requirement for another stage, or generic promises to collect more data.",
  reminder:"A well-supported stopping point can be good reflection. No extension is compulsory."}
]);
export const LATER_MATHS_SPOTS=Object.freeze(Object.fromEntries(
 STAGES.flatMap(node=>OPPORTUNITIES.map(({id,...rest})=>[
  "completing:"+node+":"+id,
  Object.freeze({...rest,stage:"IA Studio · "+(node==="C40"?"additional":"further")+" mathematics · "+(
   id==="bridgeA"?"1. Connection":id.startsWith("result")?"2. Mathematical work":
   id==="interpretD"?"3. Interpretation":"4. Next question")})
 ]))
));
export const LATER_MATHS_SPOT_IDS=Object.freeze(OPPORTUNITIES.map(x=>x.id));
