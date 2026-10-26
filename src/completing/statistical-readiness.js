/**
 * Examiner-feedback Pass 2: a small, method-specific BEFORE-testing aid.
 *
 * It reads only the student's explicit mathematical method. A topic name,
 * plan, result text, p-value, or saved figure must never imply that a test has
 * been chosen, completed, or validated. This guidance is not IA prose.
 */
import {escapeHtml,icon as defaultIcon} from "../ui/primitives.js";

const str=value=>typeof value==="string"?value.trim():"";
const guide=(label,hypotheses,conditions,working,interpretation,optional="")=>Object.freeze({
 label,hypotheses,conditions,working,interpretation,optional
});

export const STATISTICAL_TEST_READINESS=Object.freeze({
 "two-sample-t":guide(
  "Two-sample t-test",
  "Name the population means and write H0 (no population mean difference) and a justified one- or two-sided H1. Select the appropriate test version: independent groups are different from matched/paired observations.",
  "Check how the observations were sampled and whether units are independent. Examine relevant distribution, sample size and variance assumptions for the version of the t-test actually used.",
  "Choose and justify the significance level before inspecting the test statistic or p-value. Record the correct test statistic and degrees of freedom for the selected variant, and consider the estimated effect size.",
  "Relate the p-value and group difference to the aim. Failure to reject H0 is not proof of equal means, and statistical significance is not the size or practical importance of an effect."
 ),
 "chi-independence":guide(
  "Chi-squared test of independence",
  "Write H0: the two specified categorical variables are independent in the target population. Write H1: they are associated. This is not a test of whether one variable causes another.",
  "Use observed counts in a contingency table, not percentages as though they were counts. Check independent observations, meaningful mutually exclusive categories, and expected cell counts (including any below five) before relying on an asymptotic chi-squared result.",
  "Show observed and expected frequencies: each expected count is (row total × column total) / grand total under H0. For an r-by-c table, degrees of freedom are (r − 1)(c − 1), subject to the test actually used. Choose the significance level before viewing the result.",
  "Interpret the test statistic and p-value as evidence for or against independence, not evidence of causation. If expected counts are too low, reconsider defensible categories or a suitable alternative; do not regroup to manufacture significance.",
  "For a 2×2 table, consider whether a continuity correction such as Yates' correction or an exact method is appropriate. Do not apply Yates automatically or simply because the degrees of freedom equal one."
 ),
 "chi-fit":guide(
  "Chi-squared goodness-of-fit test",
  "Write H0: the population category probabilities follow the specified distribution. Write H1: the observed distribution differs. Justify the expected proportions independently of the observed test outcome.",
  "Check independent observations and whether categories are meaningful and exhaustive. Where continuous measurements have been grouped, justify interval boundaries and check that the expected category frequencies support the procedure.",
  "Show observed counts and expected counts E = sample total × stated category probability. Check low expected frequencies and the appropriate degrees of freedom; parameter estimation from these data may reduce the degrees of freedom. Choose the significance level before viewing the result.",
  "Explain what the test statistic and p-value say about agreement with the proposed distribution. Not rejecting H0 does not prove the model is true, and technology cannot make invalid conditions reliable."
 )
});

export function statisticalTestReadiness(entry){
 const method=str(entry?.methodId);
 const advice=Object.hasOwn(STATISTICAL_TEST_READINESS,method)?STATISTICAL_TEST_READINESS[method]:null;
 return advice?Object.freeze({method,...advice,needsReview:entry?.reviewNeeded==="yes",
  previouslyCompleted:entry?.status==="completed"}):null;
}

/** Collapsed even in Guided mode; reduced advice retains the same optional aid.
 * Place this AFTER the method selector but BEFORE the mathematical output. */
export function renderStatisticalTestReadiness(entry,{icon=defaultIcon,e=escapeHtml,reduced=false}={}){
 const advice=statisticalTestReadiness(entry);
 if(!advice)return "";
 const items=[
  ["Question and hypotheses",advice.hypotheses],
  ["Conditions and data structure",advice.conditions],
  ["Plan the calculation",advice.working],
  ["Interpret without overclaiming",advice.interpretation]
 ];
 return '<aside class="math-validity-aid statistical-readiness-aid'+(reduced?' is-reduced':'')+
  '" data-statistical-readiness="'+e(advice.method)+'" role="note">'+
  '<details><summary>'+icon("clipboard-check")+
   '<span><strong>Before this statistical test (optional)</strong>'+
   (reduced?"":'<small>'+e(advice.label)+' · hypotheses, conditions and significance</small>')+
   '</span>'+icon("chevron-right")+'</summary>'+
   '<div class="math-validity-body statistical-readiness-body">'+
   '<p><strong>'+e(advice.label)+'</strong> — work through these checks in your own investigation before calculating. No extra IA section or list of answers is required.</p>'+
   (advice.needsReview?'<p class="math-validity-warning" role="note">This mathematical stage is flagged for review; recheck the test choice and its original data before relying on the result.</p>':'')+
   '<ol>'+items.map(([title,body])=>'<li><strong>'+e(title)+':</strong> '+e(body)+'</li>').join("")+'</ol>'+
   (advice.optional?'<p><strong>Special case:</strong> '+e(advice.optional)+'</p>':'')+
   '<p class="math-validity-honesty">If you have already run the test, check and report what you actually did; do not retrospectively claim a significance level or hypotheses were pre-specified. This is guidance, not verification, a calculated result or IA prose.</p>'+
   '</div></details></aside>';
}
