import {journeyMap,checkpointCard} from "./journey-views.js";
import {discoveryTrail,mathConstellation} from "./living-journey.js";
import {insightToolkit} from "./insight-threads.js";
import {resumeLabel,latestCheckpoint} from "./journey.js";
import {insightItems} from "./insight-threads.js";
import {createConformanceViews} from "../completing/conformance-views.js";
import {linkedAccuracy,linkedSources} from "../completing/evidence-links.js";
import {WRITING_MOMENTS} from "../completing/guidance-catalog.js";
import {PLANNING_CATALOG} from "../planning/catalog.js";
import {planningFlags,selectedMaths} from "../planning/engine.js";
/** Home, student journey map and working-record views. */
export function createProjectViews(ctx){
  const {icon,e,button,note,readableArea,summary,filled,sheetTitle,overline,hasPlan,hasStudio,demoFlag,studioSections}=ctx;
  function viewPath() {
    const state=ctx.getState();
    return '<div class="page narrow">'+tabletNav()+sheetTitle("YOUR JOURNEY","My mathematical path","The decisions and discoveries that belong to your investigation.")+journeyMap(state)+'</div>';
  }
  function viewHome() {
    const state = ctx.getState();
    const plan=hasPlan(), studio=hasStudio();
    const resume=plan||studio;
    const last=latestCheckpoint(state);
    const recentReal=state.entries?.filter(x=>x.status==="completed"&&x.result?.trim()).at(-1);
    const prompt=recentReal?.reviewNeeded==="yes"?
      "A mathematical connection needs review before relying on it further.":
      recentReal?(recentReal.localTakeaway||recentReal.interpretation||"You recorded an actual mathematical result."):
      state.planning?.fields?.aim?"You shaped your investigation question. It can guide your next decision.":"Your starting ideas are still here.";
    const welcomeText=last?last.title+" · "+last.detail:prompt;
    return '<div class="page wide">'+tabletNav()+
      (resume?'<div class="welcome-row"><div>'+overline("WELCOME BACK")+'<h2>Your mathematical journey is taking shape.</h2><p class="welcome-personal">'+e(welcomeText)+'</p></div>'+demoFlag()+'</div>'+
      '<div class="resume-card"><div><span class="meta-pill">'+icon("route")+' Your investigation</span><h3>'+e(state.project.aim||"Your developing IA idea")+'</h3><p>'+e(state.entries.length?"Your mathematical work is taking shape":studio?"Developing your mathematical investigation":"Planning your mathematical investigation")+'</p></div>'+
      button(resumeLabel(state),"resume-work","btn-primary","", "arrow-right")+button("Import a planning document","import-report","btn-secondary","", "upload")+'</div>'+
      checkpointCard(state)+discoveryTrail(state,{compact:true})+'<div class="journey-tiles">'+
      '<button class="journey-tile" data-nav="planning"><span class="feature-icon">'+icon("compass")+'</span><span><strong>My planning</strong><p>Revisit or refine your choices.</p></span></button>'+
      '<button class="journey-tile" data-nav="completing"><span class="feature-icon">'+icon("pencil")+'</span><span><strong>My IA Studio</strong><p>Record actual mathematics and reflect.</p></span></button></div>'+insightToolkit(state,{compact:true})+(state.entries.length?mathConstellation(state,{compact:true}):''):
      '<section class="hero"><div class="hero-content"><span class="meta-pill kicker">'+icon("sparkles")+' YOUR IA ADVENTURE STARTS HERE</span>'+
      '<h1>Big questions.<br><em>Meaningful maths.</em></h1>'+
      '<p>Turn something that makes you curious into a mathematical investigation worth exploring. One thoughtful step at a time.</p>'+
      '<div class="button-row">'+button("Find my starting point","start-planning","btn-primary","", "arrow-right")+
      button("Explore a sample","open-demos","btn-secondary","", "sparkles")+button("Import an existing plan","import-report","btn-light","", "upload")+'</div></div>'+
      '<div class="hero-deco"><svg viewBox="0 0 400 430" fill="none" aria-hidden="true"><circle cx="250" cy="175" r="130" fill="#c9e5d5" opacity=".65"/><circle cx="325" cy="295" r="106" fill="#f4dfa6" opacity=".55"/><path d="M58 385 C245 368 79 183 288 180 C399 178 221 46 363 24" stroke="#82b6a4" stroke-width="3" stroke-linecap="round" stroke-dasharray="4 12"/><circle cx="105" cy="358" r="11" fill="#138477"/><circle cx="281" cy="180" r="12" fill="#fff" stroke="#138477" stroke-width="4"/><circle cx="323" cy="61" r="10" fill="#e9aa72"/></svg></div>'+
      '<span class="deco-bubble deco-one">'+icon("target")+'</span><span class="deco-bubble deco-two">'+icon("chart")+'</span><span class="deco-bubble deco-three">'+icon("sparkles")+'</span></section>')+
      '<div class="section-title-row"><h2>Your thinking. One investigation.</h2><span class="text-muted text-xs">Built around your thinking</span></div>'+
      '<div class="card-grid">'+
      feature("compass","Find your direction","Shape a question that matters to you and check that your plan is feasible.")+
      feature("calculator","Follow the mathematics","Record a genuine result, interpret it, and decide what mathematical question follows.")+
      feature("pencil","Write with purpose","Get timely prompts for interpretation, accuracy and reflection—not a wall of advice.")+'</div>'+
      '<div class="home-actions button-row">'+(resume?button("Try another sample","open-demos","btn-light","", "sparkles"):button("Try a sample investigation","open-demos","btn-light","", "sparkles"))+
      button("Backups & reports","open-files","btn-secondary","", "download")+'</div>'+
      '<div class="notice-strip">'+icon("shield")+'<div><strong>Your mathematics. Your words.</strong> Pathfinder is a planning and writing companion, not an IA generator or grading tool. Your work is saved in this browser only. Use a full project backup to safeguard your work or move to another device.</div></div></div>';
  }
  function feature(ic,title,text) {
    const state = ctx.getState();return '<div class="feature-card"><span class="feature-icon">'+icon(ic)+'</span><h3>'+e(title)+'</h3><p>'+e(text)+'</p></div>';}
  function viewReport() {
    const state = ctx.getState();
    const p=state.project;
    const pfields=state.planning?.fields||{};
    const chosen=selectedMaths(state),flags=planningFlags(state);
    const pairs=[
      ["Provisional IA title",pfields.provisionalTitle],["Investigation aim",p.aim],["Motivation",pfields.motivation],["Who might benefit",pfields.beneficiary],
      ["What the answer might help with",pfields.intendedUse],["Course",p.course],
      ["Investigation route",p.kind],
      ["Tentative mathematical techniques",chosen.map(x=>x.label).join("; ")+(pfields.otherMaths?" · "+pfields.otherMaths:"")+(pfields.otherCourseMaths?" · "+pfields.otherCourseMaths:"")],
      ["Selected prediction prompt (not a mathematical result)",PLANNING_CATALOG.predictions.find(x=>x.id===pfields.predictionId)?.question||""],
      ["My tentative prediction / conjecture",pfields.prediction||p.prediction],["Earlier prediction (saved note)",pfields.predictionPrior],
      ["WHY I expect this",pfields.predictionWhy||p.predictionWhy],
      ["What it might mean IF TRUE (not an actual result)",pfields.predictionImplication],
      ["First planned figure, calculation or case",pfields.figureOther||pfields.figureType],
      ["Mathematical purpose of first representation",pfields.figurePurpose],
      ["First mathematical action",pfields.firstAction||p.firstMove],
      ["Units and intended accuracy",pfields.firstAccuracy||p.precision]
    ];
    const planningSection=(title,rows)=>{
      const lines=rows.filter(([k,v])=>filled(v));
      return lines.length?'<h2 style="margin-top:32px">'+e(title)+'</h2>'+lines.map(([name,value])=>summary(name,value)).join(""):"";
    };
    const primary=pfields.kind!=="theoretical"&&["primary","both"].includes(pfields.dataSource) ? planningSection("Primary-data plan",[
      ["What will be recorded",pfields.primaryWhat],["Population or objects",pfields.primaryPopulation],
      ["When",pfields.primaryWhen],["Where",pfields.primaryWhere],["How",pfields.primaryHow],
      ["Equipment",pfields.primaryEquipment],["Sampling plan",pfields.primarySampling],
      ["Data-plan confidence",pfields.primaryStatus]]) : "";
    const secondary=pfields.kind!=="theoretical"&&["secondary","both"].includes(pfields.dataSource) ? planningSection("Secondary-data plan",[
      ["Source link",pfields.secondaryUrl],["Publisher",pfields.secondaryPublisher],
      ["Variables, units and definitions",pfields.secondaryVariables],
      ["Population, dates or subset",pfields.secondaryScope],
      ["Verified status (student report only)",pfields.secondaryVerified],
      ["Data-plan confidence",pfields.secondaryStatus]]) : "";
    const method=planningSection("Method and feasibility",[
      ["Other method considered",pfields.alternativeMethod],["Why the method suits the aim",pfields.methodReason],
      ["Anticipated method limitation",pfields.methodLimitation],
      ["Possible mitigation or acceptable scope",pfields.methodMitigation],
      ["First usable-data target",pfields.sourceFirstDate],["Full-data target",pfields.sourceFullDate],
      ["Data readiness /5",pfields.kind==="theoretical"?"Not applicable":pfields.dataReadiness],
      ["How to improve readiness",pfields.readinessImprovement],
      ["Essential dependencies",pfields.dependencies],["Still unsecured",pfields.unsecured],
      ["Permissions / consent status",pfields.permissionNeed||"Not confirmed"],
      ["Permissions requiring discussion",pfields.permissionDetails],
      ["Software readiness",pfields.softwareReady],["Data cleaning",pfields.cleaningBurden],
      ["Estimated practical setup hours",pfields.workloadHours],["Smallest workable scope",pfields.minimumVersion],["Practical ease /5",pfields.practicalEase],
      ["Improvement to practical ease",pfields.easeImprovement],["Fallback plan",pfields.backupMethod]
    ]);
    const timeline=planningSection("Timeline and milestones",[
      ["School teacher-draft deadline (student entered)",pfields.milestoneSchoolDraft],
      ["School final deadline (student entered)",pfields.milestoneSchoolFinal],
      ["Planning / introduction target",pfields.milestonePlan],
      ["First graph / simplified case",pfields.milestoneFirstVisual],
      ["Reflection on first representation",pfields.milestoneVisualReview],
      ["First substantial mathematics",pfields.milestoneFirstMath],
      ["Further mathematics / conclusion",pfields.milestoneFurtherMath],
      ["Complete first draft",pfields.milestoneDraft],
      ["Revision and final checks",pfields.milestoneReview]
    ]);
    const teacher=planningSection("Teacher discussion and unresolved questions",[
      ["Theoretical starting point",pfields.theoreticalCase],["Tentative theoretical conjecture",pfields.theoreticalPrediction],["Reasoning for conjecture",pfields.theoreticalWhy],
      ["Provisional mathematics outside initial course scope",pfields.otherCourseMaths],
      ["Suitability status (self-check only)",pfields.courseSuitability],
      ["Mathematics familiarity / course level",pfields.mathsOutside],
      ["What I want to ask my teacher",pfields.teacherQuestion],["Other information for my teacher",pfields.teacherExtra],
      ["Universal check-in question",pfields.universalTeacherQuestion],
      ["Possible discussion date",pfields.teacherSchedule],
      ["Safe action while awaiting feedback",pfields.teacherSafeAction],
      ["What could change my approach",pfields.changeTrigger],
      ["How I could adapt",pfields.changeAdaptation],
      ["Credible evidence fallback",pfields.fallbackEvidence]
    ]);
    const accuracySection=state.completion?.accuracyDecisions?.length?
      '<h2 style="margin-top:32px">My accuracy and unit decisions</h2>'+
      state.completion.accuracyDecisions.map(x=>'<div class="summary-block">'+
        '<strong>'+e(x.quantity)+(x.unit?' ('+e(x.unit)+')':'')+'</strong>'+
        summary("Source resolution",x.resolution)+summary("Reasonable result accuracy",x.policy)+
        summary("Why",x.reason)+'</div>').join(""):"";
    const actualLimitations=state.completion?.confirmedLimitations||[];
    const limitsSection=actualLimitations.length?
      '<h2 style="margin-top:32px">Limitations I identified from my actual method or mathematics</h2>'+
      actualLimitations.map(x=>'<div class="summary-block">'+
        '<strong>'+e(x.explanation)+'</strong>'+
        summary("Mathematical consequence",x.consequence)+summary("Check or mitigation",x.mitigation)+
        summary("Location in my IA (student-entered)",x.location)+'</div>').join(""):"";
    const ledger=Object.values(state.writingLedger||{}).filter(x=>x&&
      ["noted","written","already-covered"].includes(x.status));
    const writingMoments=ledger.length?
      '<h2 style="margin-top:32px">My saved writing guidance decisions</h2>'+
      '<p class="text-muted text-small">Private notes are NOT written into your Word or Google Doc. Locations and completion statuses here are the student’s own declarations.</p>'+
      ledger.slice(-50).map(x=>{
        const ref=WRITING_MOMENTS.find(w=>w.id===x.id);
        const status=x.status==="noted"?"Idea saved only in Pathfinder":
          x.status==="written"?"Student confirmed they updated their IA":"Student said this was already covered";
        return '<div class="summary-block"><strong>'+e(ref?.location||"Writing location")+'</strong>'+
          summary("Status",status)+summary("My own location",x.location)+summary("My own note",x.note)+'</div>';
      }).join(""):"";
    const flagSection=flags.length?'<h2 style="margin-top:32px">Points not yet confirmed</h2>'+
      flags.map(x=>'<div class="summary-block"><strong>'+e(x.title)+'</strong><p>'+e(x.note)+'</p></div>').join("")+
      '<p class="text-muted text-small">These flags are not teacher responses or formal approval decisions.</p>':"";
    return '<div class="page narrow print-report">'+tabletNav()+
      '<div class="no-print">'+sheetTitle("YOUR WORKING RECORD","My IA Pathfinder report","A readable summary of what you've recorded, not a completed IA or teacher-approved plan.")+
      '<div class="button-row" style="margin-bottom:22px">'+button("Download structured PDF","export-plan-pdf","btn-primary","", "download")+
      button("Download editable Word","export-plan-docx","btn-secondary","", "download")+
      button("Import earlier plan","import-report","btn-light","", "upload")+
      button("Print working record","print-report","btn-quiet","", "file")+
      button("Download project backup","export-json","btn-secondary","", "save")+
      button("Back to my path","go-path","btn-quiet")+'</div></div>'+
      '<div class="content-card"><p class="section-eyebrow">IA PATHFINDER · STUDENT WORKING RECORD</p><h1 style="font-size:26px">My mathematical investigation</h1>'+
      (state.demo?note("<strong>DEMONSTRATION DATA:</strong> This report contains illustrative sample entries. Do not present them as real personal results.",true):"")+
      pairs.map(([name,val])=>summary(name,val)).join("")+primary+secondary+method+timeline+teacher+flagSection+
      '<h2 style="margin-top:35px">My actual mathematical record</h2>'+
      (state.entries.length?state.entries.map((st,i)=>'<div style="margin:22px 0"><h3>'+(i+1)+'. '+e(st.title||"Untitled step")+'</h3>'+
       '<p class="text-xs text-muted">Status: '+(st.status==="completed"&&filled(st.result)?"Actual result recorded":"Only planned / no actual result recorded")+'</p>'+
       summary("Purpose",st.purpose)+summary("Mathematics",st.technique)+summary("Real result (if completed)",st.status==="completed"&&filled(st.result)?st.result:"No actual result recorded")+
       summary("Interpretation",st.status==="completed"&&filled(st.result)?st.interpretation:"Not yet appropriate")+
       summary("Limitation",st.limitations)+summary("What I learned mathematically (optional)",st.mathsInsight)+
       summary("Beyond-course mathematical idea (only if genuinely used)",["outside","mixed"].includes(st.knowledge)?st.knowledgeNotes:"")+
       summary("Earlier-result link awaiting review",st.reviewNeeded==="yes"?st.reviewReason:"")+
       summary("Linked source records",linkedSources(state,st).map(x=>x.fields.actualSource).join("; "))+
       summary("Linked precision inputs",linkedAccuracy(state,st).map(x=>x.quantity).join("; "))+
       summary("Next question",st.nextQuestion)+'</div>').join(""):'<p class="text-muted">No mathematics recorded yet.</p>')+
      accuracySection+limitsSection+writingMoments+createConformanceViews(ctx).reviewReport()+
      '<h2 style="margin-top:35px">My writing notes</h2>'+summary("Introduction",state.scratch.introduction)+summary("Data & methods",state.scratch.dataNotes)+summary("Conclusion",state.scratch.conclusion)+summary("Revisions",state.scratch.finalReview)+
      '<p class="text-xs text-muted">Student-entered Planning and mathematical notes. This working record is not a mark prediction, approval or formal IA submission.</p></div></div>';
  }
  function tabletNav() {
    const state = ctx.getState();
    return '<nav class="tablet-nav" aria-label="Quick navigation">'+
      [["home","Home","home"],["planning","Planning","compass"],["completing","IA Studio","pencil"],["path","My path","route"]].map(([id,label,ic])=>
      '<button type="button" class="'+(state.route===id?"active":"")+'" data-nav="'+id+'">'+icon(ic)+label+'</button>').join("")+'</nav>';
  }

  return {viewHome,viewPath,viewReport,tabletNav};
}
