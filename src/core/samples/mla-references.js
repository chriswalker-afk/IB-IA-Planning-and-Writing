/**
 * Editorial citation contract for the 13 complete fictional IA samples.
 *
 * Only genuine, independently checkable outside publications belong in Works
 * Cited. A constructed teaching dataset, diagram, recipe or calculation record
 * is disclosed in the body/provenance instead of misrepresented as a publisher.
 *
 * These verified entries remain a teaching example of MLA as used in Google
 * Docs. Real students must check and cite the sources they actually consulted.
 */
const publisher='23 Oct. 2026';
const sources=Object.freeze({
 'nist-general-ls':{
  author:'NIST/SEMATECH',title:'Least Squares',
  url:'https://www.itl.nist.gov/div898/handbook/pmd/section4/pmd431.htm',
  cite:'(NIST/SEMATECH, “Least Squares”)',
  work:'NIST/SEMATECH. “Least Squares.” e-Handbook of Statistical Methods, National Institute of Standards and Technology, www.itl.nist.gov/div898/handbook/pmd/section4/pmd431.htm. Accessed '+publisher+'.'
 },
 'nist-linear-ls':{
  author:'NIST/SEMATECH',title:'Linear Least Squares Regression',
  url:'https://www.itl.nist.gov/div898/handbook/pmd/section1/pmd141.htm',
  cite:'(NIST/SEMATECH, “Linear Least Squares Regression”)',
  work:'NIST/SEMATECH. “Linear Least Squares Regression.” e-Handbook of Statistical Methods, National Institute of Standards and Technology, www.itl.nist.gov/div898/handbook/pmd/section1/pmd141.htm. Accessed '+publisher+'.'
 },
 'nist-scale':{
  author:'NIST/SEMATECH',title:'Measures of Scale',
  url:'https://www.itl.nist.gov/div898/handbook/eda/section3/eda356.htm',
  cite:'(NIST/SEMATECH, “Measures of Scale”)',
  work:'NIST/SEMATECH. “Measures of Scale.” e-Handbook of Statistical Methods, National Institute of Standards and Technology, www.itl.nist.gov/div898/handbook/eda/section3/eda356.htm. Accessed '+publisher+'.'
 },
 'nist-box':{
  author:'NIST/SEMATECH',title:'Box Plot',
  url:'https://www.itl.nist.gov/div898/handbook/eda/section3/boxplot.htm',
  cite:'(NIST/SEMATECH, “Box Plot”)',
  work:'NIST/SEMATECH. “Box Plot.” e-Handbook of Statistical Methods, National Institute of Standards and Technology, www.itl.nist.gov/div898/handbook/eda/section3/boxplot.htm. Accessed '+publisher+'.'
 },
 'nist-chi-square':{
  author:'NIST/SEMATECH',title:'Chi-Square Distribution',
  url:'https://www.itl.nist.gov/div898/handbook/eda/section3/eda3666.htm',
  cite:'(NIST/SEMATECH, “Chi-Square Distribution”)',
  work:'NIST/SEMATECH. “Chi-Square Distribution.” e-Handbook of Statistical Methods, National Institute of Standards and Technology, www.itl.nist.gov/div898/handbook/eda/section3/eda3666.htm. Accessed '+publisher+'.'
 },
 'nist-chi-critical':{
  author:'NIST/SEMATECH',title:'Critical Values of the Chi-Square Distribution',
  url:'https://www.itl.nist.gov/div898/handbook/eda/section3/eda3674.htm',
  cite:'(NIST/SEMATECH, “Critical Values of the Chi-Square Distribution”)',
  work:'NIST/SEMATECH. “Critical Values of the Chi-Square Distribution.” e-Handbook of Statistical Methods, National Institute of Standards and Technology, www.itl.nist.gov/div898/handbook/eda/section3/eda3674.htm. Accessed '+publisher+'.'
 },
 'nist-run-sequence':{
  author:'NIST/SEMATECH',title:'Run-Sequence Plot',
  url:'https://www.itl.nist.gov/div898/handbook/eda/section3/eda33p.htm',
  cite:'(NIST/SEMATECH, “Run-Sequence Plot”)',
  work:'NIST/SEMATECH. “Run-Sequence Plot.” e-Handbook of Statistical Methods, National Institute of Standards and Technology, www.itl.nist.gov/div898/handbook/eda/section3/eda33p.htm. Accessed '+publisher+'.'
 },
 'nist-normal':{
  author:'NIST/SEMATECH',title:'Normal Distribution',
  url:'https://www.itl.nist.gov/div898/handbook/eda/section3/eda3661.htm',
  cite:'(NIST/SEMATECH, “Normal Distribution”)',
  work:'NIST/SEMATECH. “Normal Distribution.” e-Handbook of Statistical Methods, National Institute of Standards and Technology, www.itl.nist.gov/div898/handbook/eda/section3/eda3661.htm. Accessed '+publisher+'.'
 },
 'fpp-error':{
  author:'Hyndman and Athanasopoulos',title:'Forecasting: Principles and Practice',
  url:'https://otexts.com/fpp3/toolbox.html#evaluating-point-forecast-accuracy',
  cite:'(Hyndman and Athanasopoulos)',
  work:'Hyndman, Rob J., and George Athanasopoulos. Forecasting: Principles and Practice. 3rd ed., OTexts, 2021, otexts.com/fpp3/toolbox.html#evaluating-point-forecast-accuracy. Accessed '+publisher+'.'
 },
 'openstax-independence':{
  author:'OpenStax',title:'Test of Independence',
  url:'https://openstax.org/books/introductory-statistics-2e/pages/11-3-test-of-independence',
  cite:'(OpenStax, “Test of Independence”)',
  work:'OpenStax. “11.3 Test of Independence.” Introductory Statistics 2e, OpenStax, openstax.org/books/introductory-statistics-2e/pages/11-3-test-of-independence. Accessed '+publisher+'.'
 },
 'openstax-trig':{
  author:'OpenStax',title:'Sum and Difference Identities',
  url:'https://openstax.org/books/algebra-and-trigonometry-2e/pages/9-2-sum-and-difference-identities',
  cite:'(OpenStax, “Sum and Difference Identities”)',
  work:'OpenStax. “9.2 Sum and Difference Identities.” Algebra and Trigonometry 2e, OpenStax, openstax.org/books/algebra-and-trigonometry-2e/pages/9-2-sum-and-difference-identities. Accessed '+publisher+'.'
 },
 'scipy-chi2':{
  author:'',title:'chi2_contingency',
  url:'https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.contingency.chi2_contingency.html',
  cite:'(“chi2_contingency”)',
  work:'“chi2_contingency.” SciPy Manual, SciPy, docs.scipy.org/doc/scipy/reference/generated/scipy.stats.contingency.chi2_contingency.html. Accessed '+publisher+'.'
 }
});
const catalog=Object.freeze({
 'standing-reach':{M1:'nist-general-ls',M2:'fpp-error'},
 'helicopter-groups':{M1:'nist-scale',M2:'nist-box'},
 'revision-formats':{M1:'openstax-independence',M2:'nist-chi-square',M3:'scipy-chi2',M4:'nist-chi-critical'},
 'grinder-reliability':{'1':'nist-run-sequence','2':'nist-normal'},
 'stopping-distance':{M1:'nist-linear-ls',M2:'fpp-error'},
 'drink-cooling':{M1:'nist-linear-ls',M2:'fpp-error'},
 'tide-cycles':{M1:'nist-linear-ls',M2:'fpp-error',M3:'openstax-trig'},
 'ball-clearance':{M1:'nist-linear-ls',M2:'fpp-error'}
});
export const COMPLETE_SAMPLE_MLA_CATALOG=catalog;
export const VERIFIED_SAMPLE_MLA_SOURCES=sources;
const own=(obj,k)=>Object.prototype.hasOwnProperty.call(obj,k);
const rewriteLine=(value,mapping)=>{
 if(typeof value!=='string')return value;
 return value.replace(/\s*\[(D1|M[1-4]|[12])\]/g,(all,key)=>{
  if(key==='D1')return ' (constructed example)';
  const id=mapping[key];
  return id&&sources[id]?' '+sources[id].cite:all;
 });
};
const rewriteFields=(object,mapping)=>Object.fromEntries(Object.entries(object||{}).map(([key,val])=>[key,rewriteLine(val,mapping)]));
const isExternalReference=ref=>/^\[(?:M\d+|[12])\]/.test(ref?.label||'');
function addGrinderAttribution(stage){
 if(stage.key==='order'){
  return {...stage,purpose:stage.purpose+
    ' I kept the original order because a run-sequence plot can show shifts in location or spread that a single pooled mean would conceal (NIST/SEMATECH, “Run-Sequence Plot”).'};
 }
 if(stage.key==='tolerance'){
  return {...stage,purpose:stage.purpose+
    ' I use the normal density and cumulative probability as a modelling comparison, not proof of how a physical grinder would behave (NIST/SEMATECH, “Normal Distribution”).'};
 }
 return stage;
}
/**
 * Rewrites only authored sample prose, not numerical datasets, generator drafts
 * or the student's real working state. Both editable sample fields and the
 * reader are drawn from this same contract, so citation wording stays aligned.
 */
export function withSampleMla(spec){
 const mapping=catalog[spec.id]||{};
 const stages=(spec.stages||[]).map(stage=>{
  const revised=rewriteFields(stage,mapping);
  return spec.id==='grinder-reliability'?addGrinderAttribution(revised):revised;
 });
 const works=[...new Set(Object.values(mapping))].map(id=>({id,...sources[id]}))
   .sort((a,b)=>(a.author||a.title).localeCompare(b.author||b.title,'en')||a.title.localeCompare(b.title,'en'));
 const references=(spec.references||[]).filter(ref=>!isExternalReference(ref)).map(ref=>({
  label:String(ref.label||'').replace(/^\[D1\]\s*/,'Constructed input: '),
  value:rewriteLine(ref.value,mapping)
 }));
 const result={...spec,stages,
  introduction:rewriteLine(spec.introduction,mapping),dataNotes:rewriteLine(spec.dataNotes,mapping),
  planning:rewriteFields(spec.planning,mapping),completion:rewriteFields(spec.completion,mapping),
  conclusion:rewriteFields(spec.conclusion,mapping),
  reviews:(spec.reviews||[]).map(item=>rewriteFields(item,mapping)),
  sources:(spec.sources||[]).map(item=>({...item,fields:rewriteFields(item.fields,mapping)})),
  // These remain internal original-case records; no imaginary publisher exists.
  references,
  mlaWorksCited:works};
 return result;
}
export function sampleWorksActuallyCited(spec,text){
 const visible=String(text||'');
 return (spec?.mlaWorksCited||[]).filter(item=>visible.includes(item.cite));
}
