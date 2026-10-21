/** Explicit, browser-local transfers between the continuous frequency table and histogram.
 * A draft copy is made only by student action. Saved figures and original datasets
 * are not overwritten, cropped, silently sampled or linked live.
 */
import {finiteCell,splitHeading} from "./graph-core.js";
import {analyzeTable,newTableDraft,tableGroupedBins} from "./table-studio-core.js";
import {newStatDraft,statAnalysis} from "./stat-studio-core.js";
const heading=(name,unit)=>unit?name+" ("+unit+")":name;
const sourceMode=v=>["primary","secondary","theoretical"].includes(v)?v:"unsure";
export function prepareTableHistogram(tableStudio){
 const old=tableStudio?.draft;
 if(!old||old.mode!=="grouped")return {ok:false,error:"Open a continuous grouped-frequency table first."};
 const quality=analyzeTable(old);
 if(!quality.ready||!quality.model?.bins)return {ok:false,error:
  "Complete the source, units, class-interval and table quality checks before making a histogram."};
 const d=quality.draft,unit=d.unitDecisions[d.groupInput==="raw"?d.groupValueIndex:d.groupLowIndex]||{};
 const s=newStatDraft();
 s.kind="histogram";s.histogramInput=d.groupInput==="raw"?"raw":"table";
 const indices=d.groupInput==="raw"?[d.groupValueIndex]:[d.groupLowIndex,d.groupHighIndex,d.groupFreqIndex];
 s.columns=indices.map(i=>d.columns[i]);
 s.matrix=d.matrix.map(row=>indices.map(i=>row[i]));
 s.selected=[0];s.lowIndex=0;s.highIndex=1;s.frequencyIndex=2;
 s.binWidth=d.groupWidth;s.binStart=d.groupStart;
 s.variable=d.groupLabel.trim()||d.headings[indices[0]]||"Measurement";
 s.unitMode=unit.mode;s.unit=unit.unit||"";
 s.sourceKind=sourceMode(d.sourceKind);s.sourceText=d.sourceText;
 s.title=("Histogram of "+s.variable).slice(0,85);
 s.caption="Prepared using the class intervals of Table "+d.number+". "+
  (d.groupInput==="raw"?"Original measurements were retained in this copy.":"Grouped frequencies are not individual observations.");
 // The histogram uses frequency density, even if the table suppresses that column.
 const valid=statAnalysis(s);
 if(!valid.ready)return {ok:false,error:"Cannot make a faithful histogram from these classes: "+
  valid.problems.map(p=>p.message).join(" ")};
 if(valid.result.bins.length!==quality.model.bins.length||
  valid.result.bins.some((b,i)=>b.low!==quality.model.bins[i].low||b.high!==quality.model.bins[i].high||
    b.frequency!==quality.model.bins[i].frequency))
  return {ok:false,error:"Histogram intervals differ from the table. No transfer was made."};
 return {ok:true,draft:s,bins:valid.result.bins.length,rows:s.matrix.length};
}
export function transferTableHistogram(state){
 const result=prepareTableHistogram(state?.tableStudio);
 if(!result.ok)return result;
 if(!state?.statStudio)return {ok:false,error:"The Statistical Diagram Generator is unavailable."};
 state.statStudio.activeId="";state.statStudio.draft=result.draft;state.statStudio.open=true;
 return result;
}
export function prepareStatFrequencyTable(statStudio){
 const d=statStudio?.draft;
 if(!d||d.kind!=="histogram")return {ok:false,error:"Open a histogram based on real observations or supplied grouped frequencies."};
 const q=statAnalysis(d);
 if(!q.ready)return {ok:false,error:"Resolve the statistical diagram quality checks before transferring its data."};
 if(q.result.bins.length>8)return {ok:false,error:
  "This histogram uses "+q.result.bins.length+" classes, too many for a concise IA table. Justify wider classes in the histogram; none have been removed."};
 const s=newTableDraft(),tableCols=d.histogramInput==="raw"?[d.selected[0]]:[d.lowIndex,d.highIndex,d.frequencyIndex];
 if(tableCols.some(i=>!Number.isInteger(i)||i<0||i>=d.columns.length))
  return {ok:false,error:"The selected histogram source columns could not be identified."};
 if(d.histogramInput==="raw"&&d.matrix.some((row,i)=>finiteCell(row[tableCols[0]])===null))
  return {ok:false,error:"Some source observations are missing or invalid. Resolve them in the Statistical Diagram Generator; no rows have been removed."};
 s.mode="grouped";s.groupInput=d.histogramInput==="raw"?"raw":"classes";
 s.columns=tableCols.map(i=>d.columns[i]);
 s.matrix=d.matrix.map(row=>tableCols.map(i=>row[i]));
 s.headings=tableCols.map(i=>splitHeading(d.columns[i]).label);
 s.unitDecisions=tableCols.map((i,n)=>n===0||d.histogramInput==="table"&&n===1?
  {mode:d.unitMode,unit:d.unit}:{mode:"dimensionless",unit:""});
 s.groupValueIndex=0;s.groupLowIndex=0;s.groupHighIndex=1;s.groupFreqIndex=2;
 s.groupWidth=d.binWidth;s.groupStart=d.binStart;
 s.groupShowDensity=true;s.groupLabel=d.variable||"Measurement";
 s.title=("Grouped frequency distribution of "+s.groupLabel).slice(0,85);
 s.number=/^[1-9]\d{0,2}$/.test(d.figureNumber)?d.figureNumber:"1";
 s.sourceKind=sourceMode(d.sourceKind);s.sourceText=d.sourceText;
 s.groupOrigin=("Statistical Diagram Generator: "+d.title).slice(0,140);
 const verified=analyzeTable(s);
 if(!verified.ready)return {ok:false,error:"The transferred table needs a correction: "+
  verified.problems.map(x=>x.message).join(" ")};
 if(verified.model.bins.length!==q.result.bins.length||
    verified.model.bins.some((b,i)=>b.frequency!==q.result.bins[i].frequency||
      b.low!==q.result.bins[i].low||b.high!==q.result.bins[i].high))
  return {ok:false,error:"The transferred class frequencies did not match the original histogram."};
 return {ok:true,draft:s,bins:q.result.bins.length,rows:s.matrix.length};
}
export function transferStatFrequencyTable(state){
 const result=prepareStatFrequencyTable(state?.statStudio);
 if(!result.ok)return result;
 if(!state?.tableStudio)return {ok:false,error:"Table Studio is unavailable."};
 state.tableStudio.activeId="";state.tableStudio.draft=result.draft;state.tableStudio.open=true;
 return result;
}
