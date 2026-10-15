/** Confirmed method identity shared by all guidance and route guards. */
const str=v=>typeof v==="string"?v.trim():"";
const isDone=e=>e?.status==="completed"&&!!str(e.result);
export function methodFamilies(entry,{allowPlanned=false}={}){
 if(!entry||(!allowPlanned&&!isDone(entry)))return new Set();
 const explicit=str(entry.methodId);
 const words=explicit ? "" : str(entry.technique).toLowerCase();
 // A selected method (including Other) takes precedence over all prose.
 // Legacy fallback only examines the technique field, never title/result text.
 const rejected=/\b(no|not|never|without|instead|rather|consider|considered|planned|might|could|may)\b/i.test(words);
 const families=new Set();
 const add=(test,kind)=>{if(!explicit&&!rejected&&test.test(words))families.add(kind)};
 add(/\b(pmcc|pearson|product.moment)\b/,"pmcc");
 add(/\b(spearman|rank correlation)\b/,"spearman");
 add(/linear.regression|line.of.best.fit|least.squares|\bfitted.line\b|\bstraight.line\b/,"linear-regression");
 add(/quadratic.fit|polynomial|cubic.fit|quadratic.regression/,"quadratic-fit");
 add(/exponential|growth.and.decay|compound.growth/,"exponential");
 add(/sinusoidal|sinusoid|periodic|sine.fit|cosine.fit/,"sinusoidal");
 add(/optimis|optimiz|stationary.point|maximum.minimum|critical.point/,"optimisation");
 add(/geometric.model|measured.(area|volume)|geometry|surface.area|volume/,"geometric-model");
 add(/normal.distribution|normal.model|\bz.score\b/,"normal");
 add(/binomial/,"binomial");
 add(/two.sample.t|\bt.test\b|\bt test\b/,"two-sample-t");
 add(/chi.independence|independence.test|chi.squared.independence/,"chi-independence");
 add(/chi.fit|chi.squared.goodness|goodness.of.fit/,"chi-fit");
 add(/conditional.probability|expected.value/,"probability");
 add(/voronoi/,"voronoi");
 add(/numerical.integration|trapez|trapezoid/,"numerical-integration");
 add(/rates.from.data|empirical.rates|estimated.rate|finite.difference/,"rates-from-data");
 add(/power.law|power.model|log.transform/,"power");
 add(/proof|counterexample|induction|conjecture/,"proof");
 add(/algebra|equation|roots|domain.restriction|inequality/,"algebra");
 // Add an explicit identity without accumulating contradictory text matches.
 if(str(entry.methodId)&&entry.methodId!=="other")families.add(entry.methodId);
 if(families.has("linear-regression")||families.has("quadratic-fit")||
    families.has("exponential")||families.has("sinusoidal")||families.has("power"))families.add("fitted-model");
 if(families.has("pmcc")||families.has("spearman")||families.has("two-sample-t")||
   families.has("chi-independence")||families.has("chi-fit")||families.has("normal")||
   families.has("binomial")||families.has("probability"))families.add("statistic");
 return families;
}

/** Later reuse of an already introduced idea is not another first-use tutorial. */
export function firstUnfamiliarUse(state,entry){
 const index=state.entries.findIndex(e=>e.id===entry?.id);
 const key=e=>{
  const method=str(e?.methodId)&&e.methodId!=="other"?e.methodId:str(e?.technique);
  return method?(method+"|"+str(e?.unfamiliarComponent)).toLowerCase().replace(/\s+/g," "):"";
 };
 const current=key(entry);
 return !current||index<0||!state.entries.slice(0,index).some(e=>isDone(e)&&["outside","mixed"].includes(e.knowledge)&&key(e)===current);
}
