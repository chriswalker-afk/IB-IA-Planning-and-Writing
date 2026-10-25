/**
 * Pass 5.4.3 — mathematical reflection questions, not generated IA prose.
 *
 * This pure adapter reads only an already-valid comparison and the existing
 * editable model/aim. It neither creates an observed result nor writes to a
 * Spark, Insight Thread, figure, project stage or export.
 */
const other=x=>x==="mu"?"mean":x==="sigma"?"standard deviation":x==="n"?"trial count":
 x==="p"?"success probability":x==="lambda"?"mean event rate":
 x==="a"?"lower support limit":x==="b"?"upper support limit":
 x==="customPoints"?"outcome assignments":"parameter";
const andList=items=>items.length===2?items.join(" and "):
 items.length>2?items.slice(0,-1).join(", ")+" and "+items.at(-1):items[0]||"parameters";
const support=(kind,key,symbol,mode)=>{
 if(kind==="normal")return key==="mu"?
  "What could shift the mean of "+symbol+" while leaving its standard deviation unchanged? Does that shift represent a plausible change in the process?":
  "What could change the spread of "+symbol+" while leaving its mean unchanged? Is the alternative variability defensible?";
 if(kind==="binomial")return key==="n"?
  "Why would the number of trials change? Are the trials still comparable and independent?"+
   (mode==="event"?" Would a proportion answer your question more fairly than the same absolute count?":""):
  "Why might the per-trial success probability change? Is it still reasonable to assume independent trials with a constant success probability?";
 if(kind==="poisson")return "Why might the expected event count per interval change? Are the observation intervals comparable, and could event clustering or a varying rate undermine the model?";
 if(kind==="uniform")return "What would justify moving the "+(key==="a"?"lower":"upper")+
  " end of the possible range for "+symbol+"? Is equal density across the revised support still plausible?";
 return "Which outcome values or assigned probabilities changed for "+symbol+
  ", and what real-world mechanism or evidence would justify them? Are all possible outcomes still accounted for?";
};
const why=(q,symbol)=>{
 const keys=q.changedKeys||[],kind=q.originalDraft.kind;
 if(keys.length===1)return support(kind,keys[0],symbol,q.comparison);
 return "You changed "+andList(keys.map(other))+" together. Why is that combination plausible?"+
  " Would changing one at a time help you identify which assumption matters?";
};
const interpretation=q=>{
 if(q.comparison==="event"){
  const delta=q.sensitivity?.deltaProbability;
  if(!Number.isFinite(delta))return null;
  if(delta===0)return "The probability of the same event did not change numerically in this comparison. Could a different event reveal an important difference between the models?";
  return "The probability of the SAME event "+(delta>0?"increased":"decreased")+
   " under the alternative. What decision or threshold in your investigation would make this change meaningful rather than merely noticeable?";
 }
 const t=q.target;
 if(!t?.ok)return null;
 if(t.sameBoundary)return t.discrete?
  "The required integer cut-off stayed the same. Do the achieved probabilities differ? Explain why discrete cut-offs can stay fixed while the model changes.":
  "The required cut-off did not move. Which changes in the parameters could cancel at this particular probability target?";
 if(t.mode==="central")return "The desired central coverage stays fixed, but its two endpoints can move differently. What does the change in each endpoint mean in the units of your variable?";
 return t.discrete?
  "The target coverage stayed fixed, but the required integer cut-off moved. Compare each ACHIEVED probability with the requested target before interpreting the step in counts.":
  "The target probability stayed fixed while the cut-off moved. What does the direction and size of that boundary change mean in the units of your variable?";
};
const sourceQuestion=source=>source==="primary"?
 "Your original parameters were estimated from your data. What actual observations would support the alternative? A hypothetical value is not another estimate.":
 source==="secondary"?
 "Do the published values describe the same population, time period and units? The alternative is not a second published result unless independently sourced.":
 source==="unsure"?
 "First establish whether the original parameters were assumed, estimated or published. This scenario comparison cannot establish their source.":
 "What theoretical or contextual reasoning supports the alternative? Neither set of assumed parameters is an observation.";
/** Return null until a genuine, numerically valid investigation exists. */
export function distributionWhatIfReflection(comparison,draft,aim=""){
 const q=comparison,d=draft||q?.originalDraft;
 if(!q?.ready||!q.changed||!d||q.status!=="ready")return null;
 if(q.comparison==="target"&&!q.target?.ok)return null;
 if(q.comparison!=="target"&&(!q.sensitivity?.eventValid||q.eventIssues?.length))return null;
 const symbol=(typeof d.symbol==="string"&&/^[A-Z\u0391-\u03A9]$/u.test(d.symbol.trim()))?d.symbol.trim():"X";
 const meaning=interpretation(q);
 if(!meaning)return null;
 const savedAim=typeof aim==="string"?aim.trim().slice(0,260):"";
 const aimQuestion=savedAim?
  "Would this result change your proposed answer to the saved aim, or only show how the answer depends on assumptions?":
  "Which specific question, claim or decision in your IA would be affected by this comparison?";
 const prompts=[
  {id:"why",title:"Justify the alternative",question:why(q,symbol)},
  {id:"meaning",title:"Interpret the mathematics",question:meaning},
  {id:"evaluation",title:"Check relevance and evidence",question:aimQuestion+" "+sourceQuestion(d.sourceKind)}
 ];
 return Object.freeze({
  kind:d.kind,comparison:q.comparison,aim:savedAim,
  prompts:Object.freeze(prompts.map(x=>Object.freeze(x))),
  caution:"This is a hypothetical sensitivity comparison, not evidence of model fit, a confidence interval or a second set of observations."
 });
}
