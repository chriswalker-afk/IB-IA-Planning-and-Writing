/** Home, student journey map and working-record views. */
export function createProjectViews(ctx){
  const {icon,e,button,readableArea,summary,filled,sheetTitle,overline,hasPlan,hasStudio,demoFlag,studioSections}=ctx;
  function pathNode(title,desc,status,action,extra="") {
    const state = ctx.getState();
    return '<div class="path-node '+e(status)+'"><span class="path-gutter"><span class="path-circle">'+icon(status==="done"?"check":status==="current"?"sparkles":"circle")+'</span></span>'+
      '<button class="path-node-body" type="button" data-action="'+e(action)+'" '+extra+'><strong>'+e(title)+'</strong><p>'+e(desc)+'</p><span class="status-tag '+(status==="done"?"":"pending")+'">'+(status==="done"?"Recorded":status==="current"?"Current / revisit":"Open when ready")+'</span></button></div>';
  }
  function viewPath() {
    const state = ctx.getState();
    const active=state.route==="planning"?"planning":"completing";
    let planningNodes=[
      pathNode("Find an investigation idea",state.project.idea||"Explore a possible topic",filled(state.project.idea)||filled(state.project.aim)?"done":"current","path-plan",'data-index="0"'),
      pathNode("Shape a meaningful aim",state.project.aim||"What would you like to find out?",filled(state.project.aim)?"done":"current","path-plan",'data-index="1"'),
      pathNode("Make a feasible plan",readableArea(state.project.mathsArea),state.ui.planMax>=8?"done":"current","path-plan",'data-index="5"')
    ].join("");
    let mathsNodes=state.entries.map((st,i)=>pathNode(st.title||"Mathematical step "+(i+1),
      st.status==="completed"?(st.interpretation||st.result||"Actual work recorded"):(st.purpose||"Planned mathematical question"),
      st.status==="completed"?"done":"current","edit-step",'data-index="'+i+'"')).join("");
    return '<div class="page narrow">'+tabletNav()+sheetTitle("YOUR JOURNEY","My mathematical path","A view of the decisions and discoveries that belong to your investigation. Click any stage to revisit it.")+
      '<div class="content-card"><div class="section-eyebrow">PART 1 · PLANNING</div><div class="path-roadmap">'+planningNodes+'</div>'+
      '<div class="button-row">'+button("Revisit planning","go-planning","btn-light","", "compass")+'</div></div>'+
      '<div class="content-card" style="margin-top:17px"><div class="section-eyebrow">PART 2 · COMPLETING</div>'+
      '<div class="path-roadmap">'+
      pathNode("Introduction",state.scratch.introduction||"Set the investigation in context",filled(state.scratch.introduction)?"done":"current","studio-intro")+
      pathNode("Data and methods",state.scratch.dataNotes||"Confirm real sources, variables and methods",filled(state.scratch.dataNotes)?"done":"current","studio-data")+
      mathsNodes+
      pathNode("Draw conclusions",state.scratch.conclusion||"Synthesize the mathematics when ready",filled(state.scratch.conclusion)?"done":"pending","studio-conclusion")+
      pathNode("Review the draft",state.scratch.finalReview||"Communication, understanding and checking",filled(state.scratch.finalReview)?"done":"pending","studio-review")+
      '</div><div class="button-row">'+button("Add mathematical step","math-add","btn-primary","", "arrow-right")+button("Open IA Studio","go-studio","btn-secondary")+'</div></div>'+
      '<p class="small-callout">The map grows as you work. A recorded plan is not the same as a confirmed mathematical result. No number of steps is required.</p></div>';
  }
  function viewHome() {
    const state = ctx.getState();
    const plan=hasPlan(), studio=hasStudio();
    const resume=plan||studio;
    return '<div class="page wide">'+tabletNav()+
      (resume?'<div class="welcome-row"><div>'+overline("WELCOME BACK")+'<h2>Your mathematical journey is taking shape.</h2><p>Pick up where your thinking left off.</p></div>'+demoFlag()+'</div>'+
      '<div class="resume-card"><div><span class="meta-pill">'+icon("route")+' Your investigation</span><h3>'+e(state.project.aim||"Your developing IA idea")+'</h3><p>'+e(state.entries.length?state.entries.length+" mathematical step(s) recorded":"Planning your mathematical investigation")+'</p></div>'+
      button("Continue my journey",state.entries.length||state.ui.studioSection!=="overview"?"go-studio":"go-planning","btn-primary","", "arrow-right")+'</div>'+
      '<div class="journey-tiles">'+
      '<button class="journey-tile" data-nav="planning"><span class="feature-icon">'+icon("compass")+'</span><span><strong>My planning</strong><p>Revisit or refine your choices.</p></span></button>'+
      '<button class="journey-tile" data-nav="completing"><span class="feature-icon">'+icon("pencil")+'</span><span><strong>My IA Studio</strong><p>Record actual mathematics and reflect.</p></span></button></div>':
      '<section class="hero"><div class="hero-content"><span class="meta-pill kicker">'+icon("sparkles")+' YOUR IA ADVENTURE STARTS HERE</span>'+
      '<h1>Big questions.<br><em>Meaningful maths.</em></h1>'+
      '<p>Turn something that makes you curious into a mathematical investigation worth exploring. One thoughtful step at a time.</p>'+
      '<div class="button-row">'+button("Find my starting point","start-planning","btn-primary","", "arrow-right")+
      button("Explore a sample","open-demos","btn-secondary","", "sparkles")+'</div></div>'+
      '<div class="hero-deco"><svg viewBox="0 0 400 430" fill="none" aria-hidden="true"><circle cx="250" cy="175" r="130" fill="#c9e5d5" opacity=".65"/><circle cx="325" cy="295" r="106" fill="#f4dfa6" opacity=".55"/><path d="M58 385 C245 368 79 183 288 180 C399 178 221 46 363 24" stroke="#82b6a4" stroke-width="3" stroke-linecap="round" stroke-dasharray="4 12"/><circle cx="105" cy="358" r="11" fill="#138477"/><circle cx="281" cy="180" r="12" fill="#fff" stroke="#138477" stroke-width="4"/><circle cx="323" cy="61" r="10" fill="#e9aa72"/></svg></div>'+
      '<span class="deco-bubble deco-one">'+icon("target")+'</span><span class="deco-bubble deco-two">'+icon("chart")+'</span><span class="deco-bubble deco-three">'+icon("sparkles")+'</span></section>')+
      '<div class="section-title-row"><h2>Two parts. One investigation.</h2><span class="text-muted text-xs">Built around your thinking</span></div>'+
      '<div class="card-grid">'+
      feature("compass","Find your direction","Shape a question that matters to you and check that your plan is feasible.")+
      feature("calculator","Follow the mathematics","Record a genuine result, interpret it, and decide what mathematical question follows.")+
      feature("pencil","Write with purpose","Get timely prompts for interpretation, accuracy and reflection—not a wall of advice.")+'</div>'+
      '<div class="home-actions button-row">'+(resume?button("Try another sample","open-demos","btn-light","", "sparkles"):button("Try a sample investigation","open-demos","btn-light","", "sparkles"))+
      button("Backups & reports","open-files","btn-secondary","", "download")+'</div>'+
      '<div class="notice-strip">'+icon("shield")+'<div><strong>Your mathematics. Your words.</strong> Pathfinder is a planning and writing companion, not an IA generator or grading tool. This is an interactive design prototype with illustrative branches; it does not yet implement every flowchart route. Work is saved in this browser only.</div></div></div>';
  }
  function feature(ic,title,text) {
    const state = ctx.getState();return '<div class="feature-card"><span class="feature-icon">'+icon(ic)+'</span><h3>'+e(title)+'</h3><p>'+e(text)+'</p></div>';}
  function viewReport() {
    const state = ctx.getState();
    const p=state.project;
    const pairs=[["Investigation aim",p.aim],["Why it matters",p.beneficiary],["Course",p.course],["Investigation route",p.kind],["Planned data or starting material",p.dataDetails],["Maths direction",readableArea(p.mathsArea)+(p.mathsCustom?" — "+p.mathsCustom:"")],["Prediction",p.prediction],["Why I predicted it",p.predictionWhy],["First mathematical move",p.firstMove],["Accuracy decisions",p.precision],["Data readiness /5",p.readiness?String(p.readiness):""],["Practical ease /5",p.ease?String(p.ease):""],["Permissions",p.permissions]];
    return '<div class="page narrow print-report">'+tabletNav()+
      '<div class="no-print">'+sheetTitle("YOUR WORKING RECORD","My IA Pathfinder report","A readable summary of what you've recorded, not a completed IA or teacher-approved plan.")+
      '<div class="button-row" style="margin-bottom:22px">'+button("Print / save as PDF","print-report","btn-primary","", "download")+
      button("Download project backup","export-json","btn-secondary","", "save")+
      button("Back to my path","go-path","btn-quiet")+'</div></div>'+
      '<div class="content-card"><p class="section-eyebrow">IA PATHFINDER · STUDENT WORKING RECORD</p><h1 style="font-size:26px">My mathematical investigation</h1>'+
      (state.demo?note("<strong>DEMONSTRATION DATA:</strong> This report contains illustrative sample entries. Do not present them as real personal results.",true):"")+
      pairs.map(([name,val])=>summary(name,val)).join("")+
      '<h2 style="margin-top:35px">My actual mathematical record</h2>'+
      (state.entries.length?state.entries.map((st,i)=>'<div style="margin:22px 0"><h3>'+(i+1)+'. '+e(st.title||"Untitled step")+'</h3>'+
       '<p class="text-xs text-muted">Status: '+(st.status==="completed"?"Student marked as completed":"Only planned")+'</p>'+
       summary("Purpose",st.purpose)+summary("Mathematics",st.technique)+summary("Real result (if completed)",st.status==="completed"?st.result:"Not recorded as completed")+
       summary("Interpretation",st.status==="completed"?st.interpretation:"Not yet appropriate")+
       summary("Limitation",st.limitations)+summary("Next question",st.nextQuestion)+'</div>').join(""):'<p class="text-muted">No mathematics recorded yet.</p>')+
      '<h2 style="margin-top:35px">My writing notes</h2>'+summary("Introduction",state.scratch.introduction)+summary("Data & methods",state.scratch.dataNotes)+summary("Conclusion",state.scratch.conclusion)+summary("Revisions",state.scratch.finalReview)+
      '<p class="text-xs text-muted">Report generated from student-entered information. Prototype only. Not a mark prediction, teacher approval or formal IA submission.</p></div></div>';
  }
  function tabletNav() {
    const state = ctx.getState();
    return '<nav class="tablet-nav" aria-label="Quick navigation">'+
      [["home","Home","home"],["planning","Planning","compass"],["completing","IA Studio","pencil"],["path","My path","route"]].map(([id,label,ic])=>
      '<button type="button" class="'+(state.route===id?"active":"")+'" data-nav="'+id+'">'+icon(ic)+label+'</button>').join("")+'</nav>';
  }

  return {viewHome,viewPath,viewReport,tabletNav};
}
