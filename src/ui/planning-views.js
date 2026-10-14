/** Legacy planning renderer isolated for replacement by the full N-node engine in Phase 2. */
export function createPlanningViews(ctx){
  const {icon,e,choose,field,numberPick,note,summary,button,readableArea,helpButton,helpBox,tabletNav,planTitles,referenceNodeForPrototypeStep}=ctx;
  function planBanner() {
    const state = ctx.getState();
    const n=state.ui.planStep;
    return '<div class="progress-top" data-source-node="'+e(referenceNodeForPrototypeStep(n))+'"><span class="progress-overview">'+icon("compass")+' Guided planning</span><span class="progress-counter">Step '+(n+1)+' of '+planTitles.length+'</span></div>'+
      '<div class="mini-progress" style="max-width:none;margin:0 0 27px"><span style="width:'+((n+1)/planTitles.length*100)+'%"></span></div>';
  }
  function planningBody(n) {
    const state = ctx.getState();
    const p=state.project;
    switch(n){
      case 0: return {
        title:"Every investigation starts somewhere.", intro:"You don't need a perfect topic. A question you genuinely care about is enough to begin.",
        html:choose("project.ideaStatus",[
          {value:"yes",title:"I have an idea",desc:"There's something I'd like to investigate.",icon:"sparkles"},
          {value:"no",title:"Help me find one",desc:"I want to explore a few possibilities.",icon:"compass"},
          {value:"unsure",title:"I have a few possibilities",desc:"I'm not sure which one is strongest.",icon:"layers"}
        ])+(p.ideaStatus==="no"||p.ideaStatus==="unsure"?'<div class="task-section"><p class="field-label">What kind of things catch your attention?</p>'+choose("project.interest",[
          {value:"sport",title:"Sport & performance",icon:"chart"},
          {value:"everyday",title:"Everyday decisions",icon:"target"},
          {value:"nature",title:"Patterns in nature",icon:"sparkles"},
          {value:"ideas",title:"Pure mathematical ideas",icon:"calculator"}
        ],{tight:true})+'</div>':"")+(p.ideaStatus==="yes"?'<div class="task-section">'+field("project.idea","Your starting idea","e.g. a question I noticed while training")+'</div>':""),
        help:"<h4>What makes a promising starting point?</h4><p>Look for a question that you can explore mathematically, rather than a topic that just sounds difficult. Interests, everyday decisions and surprising patterns can all be useful starting points.</p>"
      };
      case 1: return {
        title:"What do you really want to find out?",intro:"Turn your starting thought into a clear mathematical question. You can change this as your understanding develops.",
        html:field("project.aim","My current investigation aim","e.g. How accurately can a mathematical model describe …?",{type:"textarea",rows:3})+
          note("A question with room for discovery is often more useful than a question with an obvious answer."),
        help:"<h4>Try these starting phrases</h4><p>How does … depend on …? Can … be modelled? What pattern occurs when … changes? Under what conditions is … optimal? What can be proved or generalised?</p><p>The best wording depends on your actual mathematical purpose.</p>"
      };
      case 2: return {
        title:"Why does this question matter to you?",intro:"Your investigation should have a genuine purpose. It might inform a decision, provide advice, or answer a mathematical curiosity.",
        html:choose("project.beneficiaryType",[
          {value:"me",title:"It could help me decide",desc:"I'd use the findings personally.",icon:"target"},
          {value:"others",title:"It could help someone else",desc:"My findings could inform useful advice.",icon:"route"},
          {value:"curiosity",title:"I'm curious about the mathematics",desc:"Understanding the mathematics is itself the goal.",icon:"sparkles"}
        ],{stack:true})+'<div class="task-section">'+field("project.beneficiary","How might the findings be meaningful?","Who would use the result, or what would you understand better?",{type:"textarea",rows:3})+'</div>',
        help:"<h4>Keep it genuine</h4><p>You do not need to invent an impressive beneficiary. Personal curiosity, a real practical decision or clear mathematical understanding can provide authentic motivation.</p>"
      };
      case 3: return {
        title:"What kind of investigation are you imagining?",intro:"There isn't one correct choice. This helps Pathfinder offer relevant questions.",
        html:choose("project.kind",[
          {value:"statistics",title:"Statistics",desc:"Explore observations, comparisons or relationships in data.",icon:"chart"},
          {value:"modelling",title:"Mathematical modelling",desc:"Build or test a model of a situation.",icon:"flask"},
          {value:"theoretical",title:"Theoretical exploration",desc:"Investigate patterns, structures, or proofs.",icon:"calculator"},
          {value:"unsure",title:"Not sure yet",desc:"I'll explore possibilities before deciding.",icon:"lightbulb"}
        ])+note("Theoretical or no-data investigations should be checked with your teacher for suitability. You can still continue planning.",true),
        help:"<h4>What's the difference?</h4><p><b>Statistics</b> explores actual data. <b>Modelling</b> represents a situation with mathematical relationships and assumptions. <b>Theoretical work</b> might investigate a conjecture, property or proof without gathering empirical data.</p>"
      };
      case 4: return p.kind==="theoretical"? {
        title:"What mathematical material will you start from?",intro:"For a theoretical investigation, the starting point might be a definition, numerical example, pattern or conjecture.",
        html:field("project.dataDetails","My starting definitions, examples or conjecture","What could you investigate or test first?",{type:"textarea",rows:4})+
        note("These are intended starting points, not discoveries you have already made."),
        help:"<h4>First steps without a dataset</h4><p>Try small numerical cases, symbolic manipulation, a counterexample search, a diagram or a preliminary conjecture. Distinguish exploration from proof.</p>"
      } : {
        title:"Where might your evidence come from?",intro:"This is a plan, not yet verified data. Think about access, meaning and quality.",
        html:choose("project.dataSource",[
          {value:"primary",title:"Data I collect",desc:"Measurements, observations or an approved survey.",icon:"pencil"},
          {value:"secondary",title:"Existing data",desc:"A trustworthy published dataset or source.",icon:"book"},
          {value:"both",title:"A combination",desc:"Both collected and published evidence.",icon:"layers"},
          {value:"unsure",title:"Still exploring",desc:"I may need to adapt my approach.",icon:"lightbulb"}
        ])+'<div class="task-section">'+field("project.dataDetails","Describe your proposed data or starting method","What would you measure, compare, source or model?",{type:"textarea",rows:3})+'</div>',
        help:"<h4>Useful checks</h4><p>Are the variables clearly defined? Are the source and units trustworthy? Could you obtain usable material in time? Primary data may require permission or consent. Changing the data source can change what conclusions are justified.</p>"
      };
      case 5: return {
        title:"Can this realistically work?",intro:"Being realistic early saves time later. This is a check of the plan, not a judgment of the IA.",
        html:numberPick("project.readiness","How ready is your data or mathematical starting material?")+
        numberPick("project.ease","How manageable does the investigation feel?")+
        '<div class="task-section"><label class="field-label">Any relevant permissions or safety considerations?</label>'+
        choose("project.permissions",[
          {value:"clear",title:"No unresolved issues",desc:"Only select if relevant checks are satisfied.",icon:"check-circle"},
          {value:"pending",title:"I need to check",desc:"Discuss this with my teacher before affected data collection.",icon:"info"},
          {value:"unknown",title:"Not sure",desc:"I'll review what may be needed.",icon:"lightbulb"}
        ],{stack:true,tight:true})+'</div>'+
        (p.permissions==="pending"?note("You can keep planning and save your report, but do not begin data collection needing consent or permission until cleared.",true):""),
        help:"<h4>How to improve feasibility</h4><p>Try a smaller pilot, simpler measuring method, narrower aim, reliable published data or earlier first usable results. Ask your teacher about safety, ethical and school-policy requirements. A low readiness rating is useful information, not failure.</p>"
      };
      case 6: return {
        title:"What mathematics might help?",intro:"Choose a direction that could answer your aim. More mathematics is not automatically better.",
        html:field("project.course","Your IB Mathematics course","Choose a course",{type:"select",options:[["","Select a course"],["AA SL","Mathematics AA SL"],["AI SL","Mathematics AI SL"],["AA HL","Mathematics AA HL"],["AI HL","Mathematics AI HL"]]})+
        choose("project.mathsArea",[
          {value:"relationships",title:"Explore relationships",desc:"Graphs, correlation, patterns or transformations.",icon:"chart"},
          {value:"models",title:"Build or compare models",desc:"Functions, parameters and model quality.",icon:"flask"},
          {value:"optimisation",title:"Investigate change or an optimum",desc:"Calculus, rates or constrained choices.",icon:"calculator"},
          {value:"proof",title:"Explore a conjecture or proof",desc:"Patterns, structure or mathematical reasoning.",icon:"book"},
          {value:"other",title:"Something else",desc:"Choose mathematics appropriate to my aim.",icon:"sparkles"},
          {value:"unsure",title:"I need to explore",desc:"I'll find a viable starting approach.",icon:"lightbulb"}
        ])+'<div class="task-section">'+field("project.mathsCustom","Mathematical technique or first thought (optional)","e.g. compare a quadratic and exponential model", {type:"textarea",rows:2})+'</div>',
        help:"<h4>Course suitability</h4><p>Select mathematics because it helps the investigation, not because it sounds advanced. Routine syllabus techniques can be used naturally. If you independently research a technique outside your course, your IA should demonstrate that you understand it.</p>"
      };
      case 7: return {
        title:"What do you think might happen?",intro:"A prediction is provisional. Later results may support, complicate or contradict it—and that's all useful.",
        html:field("project.prediction","My prediction (or tentative conjecture)","What result or pattern would you expect?",{type:"textarea",rows:3})+
        field("project.predictionWhy","Why do I think that?","What observation, reasoning or prior knowledge led to this idea?",{type:"textarea",rows:3})+
        (filled(p.beneficiary)?note("If this prediction were true, what would it mean for your purpose? You identified: <strong>"+e(p.beneficiary)+"</strong>"):""),
        help:"<h4>It's okay not to know</h4><p>A tentative prediction can be uncertain; you can write why you're unsure. Don't claim that a prediction has been confirmed until you have actual mathematical results.</p>"
      };
      case 8: return {
        title:"What could your first mathematical move be?",intro:"Choose a small, purposeful first exploration. It should tell you something useful about your aim.",
        html:choose("project.firstMove",[
          {value:"graph",title:"Make an initial representation",desc:"A graph or labelled diagram that could reveal a pattern.",icon:"chart"},
          {value:"calculation",title:"Try a useful calculation",desc:"An illustrative numerical or algebraic first step.",icon:"calculator"},
          {value:"theory",title:"Test a mathematical case",desc:"Investigate a conjecture or example carefully.",icon:"book"},
          {value:"unsure",title:"Not sure yet",desc:"I'll decide when I have the necessary material.",icon:"lightbulb"}
        ])+field("project.precision","Accuracy and units to remember (if relevant)","e.g. source measurements to nearest 0.1 cm", {type:"textarea",rows:2})+
        note("Before your first figure: explain why it's useful, and define the quantities and units. Afterwards: interpret what you actually found."),
        help:"<h4>Think purpose first</h4><p>A figure is not a decoration. What question will it help answer? For actual measurements, remember uncertainty and precision when you later report calculated values.</p>"
      };
      case 9: return {
        title:"Your first path is taking shape.",intro:"You've created a provisional plan. Your question can still develop as you start doing mathematics.",
        html:'<div class="success-moment"><span class="feature-icon">'+icon("sparkles")+'</span><div><strong>You have a direction.</strong><p>Take your plan into IA Studio, then let your actual mathematical findings guide what follows.</p></div></div>'+
          summary("Your aim",p.aim)+summary("Why it matters",p.beneficiary)+summary("Planned mathematics",readableArea(p.mathsArea)+(p.mathsCustom?" · "+p.mathsCustom:""))+
          (p.permissions==="pending"?note("You have unresolved permission questions. Check these before any affected data collection.",true):"")+
          '<div class="button-row" style="margin-top:20px">'+button("Open IA Studio","go-studio","btn-primary","", "arrow-right")+button("View planning report","go-report")+'</div>',
        help:"<h4>What happens next?</h4><p>Move into Completing to document the work you actually carry out. You can revisit your planning answers at any time. An attractive plan is not yet a confirmed mathematical finding.</p>"
      };
    }
  }

  function viewPlanning() {
    const state = ctx.getState();
    const n=state.ui.planStep;const detail=planningBody(n);
    return '<div class="page narrow">'+tabletNav()+planBanner()+
    '<div class="task-shell"><div class="stage-label">'+icon(n===9?"sparkles":"compass")+' '+e(planTitles[n])+'</div><h2>'+e(detail.title)+'</h2><p class="task-intro">'+e(detail.intro)+'</p>'+
    detail.html+'<div class="example-row">'+helpButton("planning-"+n)+helpBox("planning-"+n,detail.help)+'</div>'+
    '<div class="task-footer">'+(n?button("Back","plan-back","btn-quiet","", "chevron-left"):button("Home","go-home","btn-quiet"))+
    '<div class="button-row">'+(n===9?button("Open IA Studio","go-studio","btn-primary","", "arrow-right"):button(n===8?"Review my plan":"Continue","plan-next","btn-primary","", "arrow-right"))+'</div></div></div>'+
    '<p class="small-callout">You can leave an answer undecided, return to earlier steps, and change your direction later. Nothing here predicts your IB mark.</p></div>';
  }

  return {viewPlanning};
}
