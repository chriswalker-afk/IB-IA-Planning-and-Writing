/** Completing/Studio views. UI remains familiar while Phase 4 replaces the illustrative C-node prompts. */
export function createStudioViews(ctx){
  const {icon,e,choose,field,note,summary,button,cue,panelCard,studioSections,sheetTitle,tabletNav}=ctx;
  function tabButtons() {
    const state = ctx.getState();
    return '<div class="segment" role="group" aria-label="IA Studio stages">'+
      [{id:"overview",name:"Overview"},{id:"intro",name:"Introduction"},{id:"data",name:"Data"},{id:"math",name:"Mathematics"},{id:"conclusion",name:"Conclusion"},{id:"review",name:"Review"}]
      .map(t=>'<button type="button" data-action="studio-tab" data-section="'+t.id+'" class="'+(state.ui.studioSection===t.id?"active":"")+'">'+e(t.name)+'</button>').join("")+
    '</div>';
  }
  function studioOverview() {
    const state = ctx.getState();
    return '<div class="callout" style="margin-bottom:23px"><div class="eyebrow" style="margin:0 0 10px">YOUR MATHEMATICAL STORY</div><h3>Your investigation can change direction.</h3><p>Start wherever you are. The mathematical path will grow from the work you actually do, not from a predetermined list of calculations.</p></div>'+
      '<div class="studio-grid">'+studioSections.map(s=>{
        let extra=s.id==="math" ? '<span class="status-tag">'+state.entries.length+' step'+(state.entries.length===1?"":"s")+' recorded</span>' :
          filled(state.scratch[s.id==="intro"?"introduction":s.id==="data"?"dataNotes":s.id==="review"?"finalReview":"conclusion"]) ? '<span class="status-tag">Notes recorded</span>' : '<span class="status-tag pending">Open when ready</span>';
        return panelCard(s.name,s.sub,"studio-"+s.id,s.icon,extra);
      }).join("")+'</div>'+
      '<div class="section-title-row"><h2>Somewhere to begin</h2></div>'+
      '<div class="notice-strip">'+icon("lightbulb")+'<div><strong>Stuck or waiting for data?</strong> You can still draft the introduction, refine a prediction, define your variables or revise a feasible method. Nothing needs to be invented.</div></div>'+
      '<div class="button-row" style="margin-top:17px">'+button("I'm stuck","open-stuck","btn-light","", "lightbulb")+button("See my journey","go-path","btn-secondary","", "route")+'</div>';
  }
  function studioIntro() {
    const state = ctx.getState();
    return '<div class="task-shell"><div class="stage-label">'+icon("pencil")+' INTRODUCTION</div>'+
      '<h2>What are you investigating, and why?</h2><p class="task-intro">Keep it concise, personal and purposeful. This is your own working note, not a generated IA paragraph.</p>'+
      summary("Your current aim",state.project.aim)+
      (filled(state.project.prediction)?summary("Your provisional prediction",state.project.prediction):"")+
      field("scratch.introduction","My introduction notes","Why does this question interest me? What would an answer mean? What do I predict, and why?",{type:"textarea",rows:7})+
      cue("intro-purpose","A writing moment","Your introduction should make your aim, motivation and intended mathematical direction clear; avoid reporting results you haven't obtained.")+
      '<div class="task-footer">'+button("Studio overview","studio-overview","btn-quiet","", "chevron-left")+button("Data & methods","studio-data","btn-primary","", "arrow-right")+'</div></div>';
  }
  function studioData() {
    const state = ctx.getState();
    const p=state.project;
    return '<div class="task-shell"><div class="stage-label">'+icon("flask")+' DATA & METHODS</div><h2>What do you actually have?</h2>'+
      '<p class="task-intro">Your planned data source and your real evidence are different. Keep the distinction clear as your investigation develops.</p>'+
      summary("Your earlier plan",p.dataDetails)+
      '<div class="field-group"><label class="field-label">Current evidence status</label>'+choose("project.dataStatus",[
        {value:"not-started",title:"Not yet obtained",icon:"clock"},
        {value:"partial",title:"Some material available",icon:"layers"},
        {value:"ready",title:"Usable evidence available",icon:"check-circle"},
        {value:"theoretical",title:"Theoretical route / no dataset",icon:"calculator"}
      ],{tight:true})+'</div>'+
      field("scratch.dataNotes","What I've actually obtained or defined","Sources, dates, variables, units, assumptions, sample, definitions or methods actually used.",{type:"textarea",rows:5})+
      field("project.precision","Your accuracy / uncertainty decision","e.g. measurements taken to nearest 0.1 cm; rounding policy.",{type:"textarea",rows:2,hint:"We'll remind you about this when you report relevant later calculations."})+
      (p.permissions==="pending"?note("Relevant permissions remain pending. You can develop safe parts of the IA, but not begin restricted data collection.",true):"")+
      cue("method-justify","A writing moment","Explain why the data or method you actually used is suitable for your aim. Discuss relevant sampling, source or measurement limitations here.")+
      '<div class="task-footer">'+button("Overview","studio-overview","btn-quiet")+button("Explore the mathematics","studio-math","btn-primary","", "arrow-right")+'</div></div>';
  }
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
  function mathListSmall() {
    const state = ctx.getState();
    if (!state.entries.length) return "";
    return '<div class="content-card" style="margin-top:16px"><div class="section-eyebrow">YOUR MATHEMATICAL PATH</div>'+
      state.entries.map((st,i)=>'<button class="panel-link" type="button" data-action="edit-step" data-index="'+i+'"><span>'+(i+1)+'. '+e(st.title||"Untitled mathematical question")+'</span><span class="status-tag '+(st.status==="completed"?"":"pending")+'">'+(st.status==="completed"?"Evidence":"Plan")+'</span></button>').join("")+'</div>';
  }
  function mathWork(st,i) {
    const state = ctx.getState();
    const isDone=st.status==="completed";
    return '<div class="task-shell"><div class="stage-label">'+icon("calculator")+' STEP '+(i+1)+' · RECORD YOUR WORK</div>'+
      '<h2>What are you exploring?</h2><p class="task-intro">Describe a real mathematical question or technique. You can prepare a plan, then return when you have actual working and a result.</p>'+
      field("entries."+i+".title","Name this mathematical step","e.g. Examine the scatter graph")+
      field("entries."+i+".purpose","Why does this step help answer your aim?","What question will the calculation, proof or figure help resolve?",{type:"textarea",rows:3})+
      field("entries."+i+".technique","Which mathematics is involved?","e.g. graphing paired data, derivatives, Pearson's r, algebraic proof")+
      '<div class="field-group"><label class="field-label">Have you actually done this mathematics?</label>'+
      choose("entries."+i+".status",[
        {value:"planned",title:"Only planned so far",desc:"Don't record a result that hasn't happened.",icon:"clock"},
        {value:"completed",title:"I've completed some mathematics",desc:"I can describe what it really showed.",icon:"check-circle"}
      ],{tight:true})+'</div>'+
      (isDone?'<div class="field-group"><label class="field-label">Type of work actually completed</label>'+
        choose("entries."+i+".kind",[
          {value:"scatter",title:"Scatter graph",icon:"chart"},
          {value:"model",title:"Model or calculation",icon:"calculator"},
          {value:"theory",title:"Proof or theoretical work",icon:"book"},
          {value:"other",title:"Another mathematical result",icon:"sparkles"}
        ],{tight:true})+'</div>'+
        field("entries."+i+".result","What did you actually calculate, create, show or prove?","Describe the actual result. Refer to your real IA document for full mathematics.",{type:"textarea",rows:4})+
        field("entries."+i+".resultRef","Where is the working in your IA? (optional)","e.g. Figure 2; Equation 4; page 6")+
        '<div class="field-group"><label class="field-label">Is this technique part of your course?</label>'+
        choose("entries."+i+".knowledge",[
          {value:"syllabus",title:"On my syllabus",icon:"check-circle"},
          {value:"outside",title:"I researched it independently",icon:"book"},
          {value:"unsure",title:"I'm not sure",icon:"lightbulb"}
        ],{tight:true})+'</div>'+
        (st.knowledge==="outside"?field("entries."+i+".knowledgeNotes","What mathematical understanding have you developed?","Explain how the technique works and why you used it.",{type:"textarea",rows:3})+
          note("Show the mathematical understanding you developed from research rather than simply naming an unfamiliar technique."):""):"")+
      '<div class="task-footer">'+button("Studio","studio-overview","btn-quiet")+button("Interpret result","math-interpret","btn-primary",' '+(isDone?"":'disabled title="Record actual work first"'),"arrow-right")+'</div></div>'+
      cue("purpose-"+st.id,"Before this figure or calculation","Briefly make its purpose clear, define variables and units, and explain why it appears here.")+
      (isDone && filled(state.project.precision)?note("Earlier accuracy decision: <strong>"+e(state.project.precision)+"</strong>. Apply it when relevant to values reported in this step."):"");
  }
  function observationOptions(st,i) {
    const state = ctx.getState();
    if(st.kind!=="scatter") return field("entries."+i+".observationText","What is your main finding?","Describe the important mathematical feature or result in your own words.",{type:"textarea",rows:3});
    return '<div class="field-group"><label class="field-label">Which best describes the pattern you actually observe?</label>'+
      choose("entries."+i+".observation",[
        {value:"linear",title:"Approximately straight",desc:"A potentially linear relationship.",icon:"chart"},
        {value:"curved",title:"Curved pattern",desc:"A nonlinear shape seems visible.",icon:"route"},
        {value:"unclear",title:"No clear relationship",desc:"No strong pattern is apparent.",icon:"circle"},
        {value:"unexpected",title:"Something unexpected",desc:"An outlier, cluster or surprising feature.",icon:"sparkles"}
      ])+'</div>'+
      field("entries."+i+".observationText","What can you see in your own data?","Describe the pattern, trend or surprise without claiming more than the graph shows.",{type:"textarea",rows:3});
  }
  function mathInterpret(st,i) {
    const state = ctx.getState();
    const pmcc = /pmcc|pearson|correlation/i.test(st.technique||"");
    return '<div class="task-shell"><div class="stage-label">'+icon("target")+' STEP '+(i+1)+' · INTERPRET YOUR RESULT</div>'+
      '<h2>What does your mathematics tell you?</h2><p class="task-intro">Think about what your actual work reveals in the context of your investigation aim.</p>'+
      summary("Your actual work",st.result)+
      (state.project.aim?'<div class="context-card">'+icon("target")+'<div><strong>YOUR AIM</strong><p>'+e(state.project.aim)+'</p></div></div>':"")+
      observationOptions(st,i)+
      field("entries."+i+".interpretation","Why does this finding matter for your aim?","What can you conclude so far? Does it challenge your prediction? How might it matter to the intended user?",{type:"textarea",rows:4})+
      (pmcc?note("You used Pearson's correlation. Consider whether a linear relationship is appropriate and whether outliers affect interpretation. A low value alone does not rule out a curved relationship."):"")+
      field("entries."+i+".limitations","Is there a relevant mathematical limitation? (optional)","Discuss one that genuinely affects this result, not a generic list.",{type:"textarea",rows:2})+
      (filled(state.project.precision)?'<div class="branch-hint"><strong>Remember your precision decision:</strong> '+e(state.project.precision)+'</div>':"")+
      cue("interpret-"+st.id,"Writing moment: after the result","Don't let the mathematics stand alone. Explain what the actual result means for your aim, any important limitations, and how it influences what follows.")+
      '<div class="task-footer">'+button("Back to working","math-work","btn-quiet","", "chevron-left")+button("Find the next question","math-next","btn-primary","", "arrow-right")+'</div></div>';
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
  function mathNext(st,i) {
    const state = ctx.getState();
    const canSuggest=st.status==="completed";
    return '<div class="task-shell"><div class="stage-label">'+icon("route")+' STEP '+(i+1)+' · WHAT FOLLOWS?</div><h2>Where does your investigation go next?</h2>'+
      '<p class="task-intro">Your next mathematics should follow logically from your previous result and help you answer your aim—not simply add another technique.</p>'+
      summary("What your last step revealed",st.interpretation||st.observationText||st.result)+
      (canSuggest?'<div class="field-group"><label class="field-label">Two ideas, if helpful</label><p class="field-hint" style="margin-bottom:12px">Suggestions based on the type of actual mathematical finding you recorded. You can choose your own instead.</p>'+
        '<div class="choice-stack">'+suggestions(st).map((s,j)=>'<button type="button" class="choice" data-action="suggest-next" data-index="'+i+'" data-suggestion="'+j+'"><span class="choice-symbol">'+icon(j?"flask":"lightbulb")+'</span><span class="choice-body"><span class="choice-title">'+e(s[0])+'</span><span class="choice-subtitle">'+e(s[1])+'</span></span>'+icon("arrow-right")+'</button>').join("")+'</div></div>':
        note("This step is still labelled as planned. Suggestions based on results appear when you have actually completed the mathematics.") )+
      field("entries."+i+".nextQuestion","My next logical mathematical question","What would I explore next, and why?",{type:"textarea",rows:3})+
      '<div class="task-footer">'+button("Back to interpretation","math-interpret","btn-quiet","", "chevron-left")+
      '<div class="button-row">'+button("Enough to conclude","studio-conclusion","btn-secondary")+button("Add next step","math-add-next","btn-primary","", "arrow-right")+'</div></div></div>'+
      '<p class="small-callout">A strong IA does not need a fixed number of mathematical sections. Only continue if another step is meaningful.</p>';
  }
  function studioMath() {
    const state = ctx.getState();
    let st=currentMath();
    if(!st) return '<div class="task-shell"><div class="stage-label">'+icon("calculator")+' MATHEMATICAL JOURNEY</div>'+
      '<h2>Let the mathematics lead.</h2><p class="task-intro">Record your first real mathematical exploration, then interpret what it shows before deciding what to investigate next.</p>'+
      '<div class="callout"><h3>One discovery leads to another.</h3><p>Each section has a purpose, a real result, an interpretation, and optionally a next mathematical question. You remain in control of the direction.</p></div>'+
      '<div class="button-row" style="margin-top:25px">'+button("Start first mathematical step","math-add","btn-primary","", "arrow-right")+
      button("I need ideas first","open-stuck","btn-secondary","", "lightbulb")+'</div></div>';
    const i=state.ui.mathIndex;
    const phase=state.ui.mathPhase;
    return '<div class="segment" role="group" aria-label="Mathematical step phases">'+
      [{id:"work",title:"1 · Explore"},{id:"interpret",title:"2 · Interpret"},{id:"next",title:"3 · What follows?"}]
      .map(x=>'<button type="button" class="'+(phase===x.id?"active":"")+'" data-action="math-phase" data-phase="'+x.id+'">'+e(x.title)+'</button>').join("")+'</div>'+
      (phase==="work"?mathWork(st,i):phase==="interpret"?
        (st.status==="completed"?mathInterpret(st,i):note("This step is only a plan. Record actual mathematics before interpreting findings.")+mathWork(st,i)):
        mathNext(st,i))+
      mathListSmall();
  }
  function studioConclusion() {
    const state = ctx.getState();
    return '<div class="task-shell"><div class="stage-label">'+icon("flag")+' CONCLUSION & REFLECTION</div><h2>What can you now say about your aim?</h2>'+
      '<p class="task-intro">Bring your important findings together. Avoid repeating every calculation or saving all evaluation for the final paragraph.</p>'+
      summary("Your aim",state.project.aim)+
      (state.entries.length?'<div class="field-group"><label class="field-label">Your recorded mathematical findings</label>'+
        state.entries.filter(st=>st.status==="completed").map((st,i)=>'<div class="context-card">'+icon("check-circle")+'<div><strong>'+e(st.title||"Mathematical step "+(i+1))+'</strong><p>'+e(st.interpretation||st.result||"No interpretation recorded yet.")+'</p></div></div>').join("")+'</div>':note("You haven't recorded any actual mathematical results yet. A conclusion should only refer to work you've really completed.",true))+
      field("scratch.conclusion","My conclusion notes","What does the evidence support? What uncertainties remain? Which future mathematical question would genuinely follow?",{type:"textarea",rows:7})+
      cue("conclusion-aim","A writing moment","Answer your aim using actual findings and explain their significance. Distinguish a mathematically motivated extension from a vague 'more data' suggestion.")+
      '<div class="task-footer">'+button("Back to my mathematics","studio-math","btn-quiet")+button("Final review","studio-review","btn-primary","", "arrow-right")+'</div></div>';
  }
  function studioReview() {
    const state = ctx.getState();
    return '<div class="task-shell"><div class="stage-label">'+icon("check-circle")+' DRAFT & FINAL REVIEW</div><h2>Make your mathematics readable.</h2>'+
      '<p class="task-intro">This is a self-review companion, not a marking tool. Use the real IA draft and the teacher-feedback process at your school.</p>'+
      '<div class="panel-list">'+[
        ["clear","My aim and reasoning are clear"],
        ["figures","Every important figure has a purpose, labels and contextual interpretation"],
        ["accuracy","I use units, equality/approximation and justified accuracy consistently"],
        ["depth","I use appropriate mathematics and show understanding of researched techniques"],
        ["limitations","I discuss meaningful limitations alongside the relevant work"],
        ["conclusion","My conclusion synthesises actual results and addresses my aim"],
        ["sources","Technology, data and references are acknowledged appropriately"]
      ].map(([key,label])=>'<label class="field-check"><input type="checkbox" data-check="review-'+key+'" '+(state.cues["review-"+key]==="done"?"checked":"")+'><span>'+e(label)+'</span></label>').join("")+'</div>'+
      field("scratch.finalReview","My revision notes","What will I refine in my document before submission?",{type:"textarea",rows:5})+
      note("Follow your school's actual teacher feedback and final submission rules. This prototype does not predict IB assessment marks.")+
      '<div class="task-footer">'+button("Overview","studio-overview","btn-quiet")+button("Review my path","go-path","btn-primary","", "route")+'</div></div>';
  }
  function viewCompleting() {
    const state = ctx.getState();
    const section=state.ui.studioSection;
    const body=section==="overview"?studioOverview():section==="intro"?studioIntro():section==="data"?studioData():section==="math"?studioMath():section==="conclusion"?studioConclusion():studioReview();
    return '<div class="page narrow">'+tabletNav()+
      sheetTitle("PART 2 · COMPLETING","Your IA Studio","Your writing companion, from the first exploration to the final reflection.")+
      (state.project.aim?'<div class="context-card" style="margin-bottom:18px">'+icon("target")+'<div><strong>YOUR INVESTIGATION AIM</strong><p>'+e(state.project.aim)+'</p></div><button class="btn btn-sm btn-quiet" data-action="open-panel" data-panel="project">Edit</button></div>':"")+
      tabButtons()+body+'</div>';
  }

  return {viewCompleting,mathDefault,currentMath,suggestions};
}
