import {createIdeaState,normalizeIdeaState} from '../ideas/state.js';
import {createResourceState,normalizeResourceState} from "../resources/state.js";
/**
 * Canonical versioned student-project record.
 * Preserves version-1 prototype files and browser localStorage without assuming
 * that planning a technique means it was actually performed.
 */
import {createPlanningState,normalizePlanningState} from "../planning/engine.js";
import {createCompletionState,normalizeCompletionState} from "../completing/engine.js";
import {migrateEvidenceLinks} from "../completing/evidence-links.js";
import {normalizeEntry} from "../completing/entry-record.js";
import {newGraphStudio,normalizeGraphStudio} from "../diagrams/graph-core.js";
import {newImageTracer,normalizeImageTracer} from "../diagrams/image-tracer-core.js";
import {newStatStudio,normalizeStatStudio} from "../diagrams/stat-studio-core.js";
import {newTableStudio,normalizeTableStudio} from "../diagrams/table-studio-core.js";
import {normalizeNativeShelf} from "../diagrams/native-data-core.js";
import {newVoronoiStudio,normalizeVoronoiStudio} from "../diagrams/voronoi-core.js";
export const STATE_VERSION = 2;
export const STORAGE_KEY = "ia-pathfinder-prototype-v1"; // Deliberately stable across upgrades.
export const MAX_ENTRIES = 120;
const planningIds = ["N00","N01","N01V","N02","N03","N03D","N04S","N01P","N06","N07"];
const plain = v => v && typeof v === "object" && !Array.isArray(v);
const str = v => typeof v === "string" ? v : "";
function copyKnown(defaults, input) {
  const result = { ...defaults };
  if (!plain(input)) return result;
  for (const key of Object.keys(defaults)) {
    const v = input[key];
    if (v === null || v === undefined) continue;
    if (typeof defaults[key] === "string" && typeof v === "string") result[key] = v;
    else if (typeof defaults[key] === "number" && Number.isFinite(Number(v))) result[key] = Number(v);
    else if (typeof defaults[key] === "boolean" && typeof v === "boolean") result[key] = v;
  }
  return result;
}
function safeRecord(input) {
  if (!plain(input)) return {};
  const result = Object.create(null);
  for (const [key,value] of Object.entries(input).slice(0,1200)) {
    if (["__proto__","constructor","prototype"].includes(key) || key.length > 160) continue;
    if (value === null || ["string","number","boolean"].includes(typeof value)) result[key] = value;
    else if (plain(value) && Object.keys(value).length <= 35) result[key] = { ...value };
  }
  return result;
}
export function createProjectState() {
  return {
    version: STATE_VERSION,
    sourceRegistryVersion: 1,
    updatedAt: null,
    demo: "",
    route: "home",
    project: {
      ideaStatus:"", interest:"", idea:"", aim:"", beneficiaryType:"", beneficiary:"",
      course:"", kind:"", dataSource:"", dataDetails:"", dataStatus:"not-started",
      permissions:"unknown", readiness:0, ease:0, mathsArea:"", mathsCustom:"",
      prediction:"", predictionWhy:"", firstMove:"", precision:"", documentUrl:""
    },
    ui: {
      planStep:0,planMax:0,studioSection:"overview",mathIndex:0,mathPhase:"work",
      helpKey:"",openCue:"",noteDraft:"",adviceMode:"guided",planningIntroSeen:false,planningIntroOpen:false,lastWorkRoute:"",lastStudioNode:"",representationFilter:"all",latestTitle:"",latestDetail:"",latestNode:"",latestEntry:"",latestAt:""
    },
    scratch: {introduction:"",dataNotes:"",conclusion:"",finalReview:""},
    entries:[], dataShelf:[], graphStudio:newGraphStudio(), imageTracer:newImageTracer(), statStudio:newStatStudio(), tableStudio:newTableStudio(), voronoiStudio:newVoronoiStudio(), cues:{},cueNotes:{},cueLocations:{},
    journey: {
      currentNodeId:"N00",
      answers:{}, // exact sheet/node keyed answers will be populated in Phase 2
      visited:[], // a visit never implies completed mathematics
      history:[],
      stages:{}, // not-started / working / complete / needs-review, explicitly chosen
      sourceSnapshot:"2026-10-14"
    },
    evidence:{
      sources:[],methods:[],results:[],accuracyDecisions:[]
    },
    teacher:{
      checkpoints:[],pendingApproval:false,feedbackStatus:"not-requested",concerns:[]
    },
    resources:createResourceState(),
    ideaExplorer:createIdeaState(),
    writingLedger:{},
    changeLog:[],
    planning:createPlanningState(),
    completion:createCompletionState(),
    handover:{confirmedAt:"",lastExportAt:"",lastImportAt:"",lastImportSource:"",needsReview:false}
  };
}
function legacyAnswers(p) {
  const valueById = {
    N00:p.ideaStatus,N01:p.aim,N01V:p.beneficiary,N02:p.kind,N03:p.dataSource,
    N03E:p.readiness,N03G:p.ease,N04:p.course,N01P:p.prediction,N06:p.firstMove
  };
  return Object.fromEntries(Object.entries(valueById).filter(([,v])=>typeof v==="string" ? v.trim():Number(v)>0));
}
/**
 * Strictly accepts supported exported versions. Never assert that a legacy
 * writing prompt was completed; legacy "done" remains only that prior UI flag.
 */
export function normalizeProjectState(value) {
  if(!plain(value) || ![1,STATE_VERSION].includes(value.version) || !plain(value.project))
    throw new Error("This is not a compatible Pathfinder project file.");
  const blank=createProjectState();
  const p=copyKnown(blank.project,value.project);
  const u=copyKnown(blank.ui,value.ui);
  const s=copyKnown(blank.scratch,value.scratch);
  u.planStep=Math.max(0,Math.min(9,Number(u.planStep)||0));
  u.planMax=Math.max(u.planStep,Math.min(9,Number(u.planMax)||0));
  u.mathIndex=Math.max(0,Math.min(MAX_ENTRIES-1,Number(u.mathIndex)||0));
  if(!["overview","intro","data","math","conclusion","review"].includes(u.studioSection))u.studioSection="overview";
  if(!["work","interpret","next"].includes(u.mathPhase))u.mathPhase="work";
  if(!["guided","reduced"].includes(u.adviceMode))u.adviceMode="guided";
  if(!["all","data","geometry","models","decisions"].includes(u.representationFilter))u.representationFilter="all";
  u.planningIntroSeen=u.planningIntroSeen===true;
  u.planningIntroOpen=u.planningIntroOpen===true;
  const next={
    ...blank,
    updatedAt: str(value.updatedAt)||null,
    demo: str(value.demo),
    route:["home","planning","completing","path","report"].includes(value.route)?value.route:"home",
    project:p,ui:u,scratch:s,
    resources:normalizeResourceState(value.resources),
    ideaExplorer:normalizeIdeaState(value.ideaExplorer),
    entries:Array.isArray(value.entries)?value.entries.filter(plain).slice(0,MAX_ENTRIES).map(normalizeEntry):[],
    dataShelf:normalizeNativeShelf(value.dataShelf),
    graphStudio:normalizeGraphStudio(value.graphStudio),
    imageTracer:normalizeImageTracer(value.imageTracer),
    statStudio:normalizeStatStudio(value.statStudio),
    tableStudio:normalizeTableStudio(value.tableStudio),
    voronoiStudio:normalizeVoronoiStudio(value.voronoiStudio),
    cues:safeRecord(value.cues),cueNotes:safeRecord(value.cueNotes),cueLocations:safeRecord(value.cueLocations)
  };
  if(value.version===1){
    next.journey.currentNodeId=planningIds[u.planStep];
    next.journey.answers=legacyAnswers(p);
    next.journey.visited=planningIds.slice(0,u.planMax+1);
    next.teacher.pendingApproval=p.permissions==="pending";
  } else {
    const j=plain(value.journey)?value.journey:{};
    next.journey.currentNodeId=str(j.currentNodeId)||"N00";
    next.journey.answers=safeRecord(j.answers);
    next.journey.visited=Array.isArray(j.visited)?j.visited.filter(x=>typeof x==="string").slice(0,500):[];
    next.journey.history=Array.isArray(j.history)?j.history.slice(-500).filter(plain):[];
    next.journey.stages=safeRecord(j.stages);
    next.journey.sourceSnapshot=str(j.sourceSnapshot)||blank.journey.sourceSnapshot;
    const t=plain(value.teacher)?value.teacher:{};
    next.teacher={
      checkpoints:Array.isArray(t.checkpoints)?t.checkpoints.filter(plain).slice(0,100):[],
      pendingApproval:typeof t.pendingApproval==="boolean"?t.pendingApproval:p.permissions==="pending",
      feedbackStatus:str(t.feedbackStatus)||"not-requested",
      concerns:Array.isArray(t.concerns)?t.concerns.filter(x=>typeof x==="string").slice(0,100):[]
    };
    const ev=plain(value.evidence)?value.evidence:{};
    next.evidence=Object.fromEntries(Object.keys(blank.evidence).map(k=>[k,Array.isArray(ev[k])?ev[k].filter(plain).slice(0,200):[]]));
    next.writingLedger=safeRecord(value.writingLedger);
    next.changeLog=Array.isArray(value.changeLog)?value.changeLog.filter(plain).slice(-400):[];
  }
  const migrated = normalizePlanningState(value.planning,next.project);
  if(!value.planning && next.journey.currentNodeId?.startsWith("N"))migrated.current=next.journey.currentNodeId;
  next.planning=migrated;
  next.completion=normalizeCompletionState(value.completion,next.project);
  migrateEvidenceLinks(next,!Array.isArray(value.completion?.sourceRecords));
  if(!value.completion && next.entries.length){
    next.completion.activeEntryIndex=Math.min(next.entries.length-1,next.ui.mathIndex);
  }
  const h=plain(value.handover)?value.handover:{};
  next.handover={
    confirmedAt:str(h.confirmedAt),lastExportAt:str(h.lastExportAt),
    lastImportAt:str(h.lastImportAt),lastImportSource:str(h.lastImportSource),
    needsReview:h.needsReview===true
  };
  return next;
}
export function persistProjectState(state,storage) {
  state.updatedAt=new Date().toISOString();
  storage.setItem(STORAGE_KEY,JSON.stringify(state));
  return true;
}
export function loadProjectState(storage) {
  const saved=storage.getItem(STORAGE_KEY);
  return saved?normalizeProjectState(JSON.parse(saved)):createProjectState();
}
export function registerNodeAnswer(state,nodeId,value) {
  if(!/^[NC]\d{2}[A-Z0-9]*$/.test(nodeId))throw new Error("Invalid source node identifier.");
  state.journey.answers[nodeId]=value;
  if(!state.journey.visited.includes(nodeId))state.journey.visited.push(nodeId);
  return state;
}
