/**
 * Compatibility helpers for historical mathematical-step actions.
 *
 * The superseded six-tab Studio UI has been retired. These helpers are still
 * used by the existing action dispatcher, so preserve their behaviour and the
 * student-authored mathematical record fields without rendering old pages.
 */
export function createLegacyMathHelpers(ctx){
  const mathDefault = () => ({
    id:"step-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7),
    title:"",purpose:"",technique:"",knowledge:"unsure",knowledgeNotes:"",
    status:"planned",kind:"",result:"",resultRef:"",observation:"",observationText:"",
    interpretation:"",limitations:"",nextQuestion:"", createdAt:new Date().toISOString()
  });
  function currentMath() {
    const state = ctx.getState();
    if (!state.entries.length) return null;
    state.ui.mathIndex=Math.max(0,Math.min(state.ui.mathIndex,state.entries.length-1));
    return state.entries[state.ui.mathIndex];
  }
  function suggestions(st) {
    const state = ctx.getState();
    if(st.kind==="theory") return [
      ["Could I generalise the result?","Test the pattern beyond the examples I have used."],
      ["Would a proof or counterexample help?","Investigate whether the conjecture always holds."]
    ];
    switch(st.observation){
      case "linear":return [
        ["Would a suitable line of best fit help answer my aim?","Only if a prediction or interpretable relationship is useful."],
        ["Would quantifying linear correlation help?","Only if the strength of association matters to the question."]
      ];
      case "curved":return [
        ["Which function might explain the curvature?","Consider its mathematical shape and the context before selecting a model."],
        ["Would comparing justified models help?","Examine whether different functional forms explain observations."]
      ];
      case "unclear":return [
        ["What can I responsibly conclude from this lack of pattern?","An inconclusive result can still answer part of the question."],
        ["Could another justified variable or range help?","Only change the investigation if the actual result motivates it."]
      ];
      case "unexpected":return [
        ["What might explain the unusual point or cluster?","Verify the observation and check how it changes the picture."],
        ["Would a justified comparison of groups help?","Investigate whether the groups genuinely differ."]
      ];
      default:return [
        ["What mathematical question follows from my result?","Look for a natural gap, pattern, assumption or new conjecture."],
        ["Would testing an assumption help?","Look for a meaningful weakness or a condition to explore."]
      ];
    }
  }
  return {mathDefault,currentMath,suggestions};
}
