import {BIVARIATE_GUIDANCE} from "./guidance-catalog.js";
import {guidanceContext,isDone,familyOf} from "./guidance-context.js";
import {isPearsonResult,sourceResultForNext,scatterForNext} from "./engine.js";
const byId=new Map(BIVARIATE_GUIDANCE.map(x=>[x.id,x]));
const option=(id,question,reason)=>({id,question,reason,sourceRow:byId.get(id)?.sourceRow,
  guardrail:byId.get(id)?.avoid||""});
/** Decisions are POSSIBLE questions, never a diagnosis from an unperformed technique. */
export function relevantBivariateOptions(state,node=state.completion.current){
 if(!["C35B","C35H","C35P","C35"].includes(node))return[];
 const x=guidanceContext(state,node),scatter=x.scatter,prior=sourceResultForNext(state);
 if(!isDone(scatter))return[];
 const type=x.f.pairedDataType;
 if(type==="categorical"||type==="unpaired")
  return [option("B11","Would a different representation match my actual variables better?",
   "Pearson's r and a paired numerical scatter are not appropriate for categorical or unmatched observations.")];
 if(type!=="paired-numerical")return[]; // ask the student to confirm paired numeric source; never infer it from label.
 const detail=x.selectedDetail,pattern=x.selectedPattern,
  ref=detail||(pattern==="linear"?"rough-linear":pattern==="curved"?"curved-unspecified":
   pattern==="unexpected"?"unexpected":pattern==="unclear"?"unclear":"unsure");
 const hasPmcc=isPearsonResult(prior),actualModel=x.actualResults.find(y=>y.id===prior?.id&&familyOf(y).has("fitted-model"));
 const out=[];
 if(hasPmcc){
  out.push(option("B09","What does the value of Pearson's r actually tell me about linear association?",
   "Consider the sign/size in context, the observed scatter's shape, scope of the sample and whether another calculation serves the aim."));
  if(x.f.pmccSignal==="weak-linear"&&["monotonic","turning","periodic","curved-unspecified"].includes(ref))
   out.push(option("B12","Could a justified nonlinear question explain the scatter despite weak linear association?",
    "Weak Pearson correlation does not rule out curved relationships. Do not invent a nonlinear model form."));
  if(x.f.pmccSignal==="weak-linear"&&(ref==="unclear"||ref==="unsure"))
   out.push(option("B05","Is a cautious conclusion more defensible than fitting an unsupported model?",
    "You may stop without adding unrelated mathematics."));
 }
 if(actualModel)out.push(option("B10","Would an honest fit, residual or domain check change a prediction?",
  "A fitted model is useful only where its assumptions and fitted range make sense."));
 if(x.f.scatterAimRelevance==="no")
  out.push(option("B08","Does this observed association actually advance my investigation aim?",
   "An attractive graph does not justify a model if it does not answer the question."));
 switch(ref){
  case "near-perfect":
   out.push(option("B01","Would a fitted line genuinely help estimate something my aim asks about?",
    "Pearson's r may add very little when the points are already nearly collinear; don't calculate it for its own sake."));
   break;
  case "rough-linear":
   out.push(option("B02","Would quantifying the strength and direction of this LINEAR pattern help?",
    "Pearson's r may be useful for actual paired quantitative data, but it is optional. A fitted line needs its own purpose."));
   break;
  case "curved-unspecified":
   out.push(option("B06","Does this curve keep increasing/decreasing, or does it turn or reverse direction?",
    "Curved does not necessarily mean monotonic. Inspect the actual shape before considering rank association or a justified nonlinear model."));
   break;
  case "monotonic":
   out.push(option("B03","What type of curved mathematical model might reasonably describe the changing rate?",
    x.course==="AI SL"?
     "If a rank association would serve the aim, Spearman may be an optional course-relevant idea after checking coverage; it is not a required calculation.":
     "A rank measure may be considered only after checking course suitability. Do not assume Spearman is on your course."));
   break;
  case "periodic":
   out.push(option("B04","Could repeated peaks justify a periodic model with a meaningful period?",
    "Several observed cycles and sensible parameter units are needed; a rank correlation does not explain periodic behaviour."));
   break;
  case "turning":
   out.push(option("B04","Does a turning-point or periodic model fit the observed structure for a good mathematical reason?",
    "Rank correlation is not a cure-all for patterns that reverse direction."));
   break;
  case "unclear":
   out.push(option("B05","What limited conclusion can I support from the absence of a clear pattern?",
    "A cautious conclusion may be sufficient. A justified alternate variable or range may help, but fishing for a positive relationship does not."));
   break;
  case "unexpected":
   out.push(option("B07","Could I check the original value, definition or group behind this unusual point?",
    "Keep authentic points. Never remove one simply to improve correlation or fit."));
   break;
  default:
   out.push(option("B06","Would examining the data's scale, range or pairing clarify what I actually observe?",
    "Do not announce a correlation or model before the observed pattern is understood."));
 }
 const compare=String(x.f.predictionComparison||"").toLowerCase();
 if(/contradict|opposit|different|unexpected|not.as.expected/.test(compare))
  out.push(option("B12","What does this mismatch with my original prediction suggest checking?",
   "Keep the prediction and observed data separate; revise the method only for a justified mathematical reason."));
 return [...new Map(out.map(x=>[x.id,x])).values()].slice(0,3);
}
export const bivariateSourceIds=()=>BIVARIATE_GUIDANCE.map(x=>x.id);
