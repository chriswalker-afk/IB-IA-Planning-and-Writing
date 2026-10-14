/* IA Pathfinder — interactive design prototype
   Student-authored notes only; branching examples are illustrative, not the complete IA flowchart engine. */
(() => {
  "use strict";
  const KEY = "ia-pathfinder-prototype-v1";
  const VERSION = 1;
  const $ = (s, root = document) => root.querySelector(s);
  const icon = (name, extra = "") => '<svg class="icon ' + extra + '" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  const e = escapeHtml;
  const cleanUrl = url => { try { const u = new URL(String(url ?? "")); return ["https:","http:"].includes(u.protocol) ? u.href : ""; } catch { return ""; } };
  const newState = () => ({
    version: VERSION, updatedAt: null, demo: "",
    route: "home",
    project: {
      ideaStatus:"", interest:"", idea:"", aim:"", beneficiaryType:"", beneficiary:"",
      course:"", kind:"", dataSource:"", dataDetails:"", dataStatus:"not-started",
      permissions:"unknown", readiness:0, ease:0, mathsArea:"", mathsCustom:"",
      prediction:"", predictionWhy:"", firstMove:"", precision:"", documentUrl:""
    },
    ui: { planStep:0, planMax:0, studioSection:"overview", mathIndex:0, mathPhase:"work", helpKey:"", openCue:"", noteDraft:"" },
    scratch: { introduction:"", dataNotes:"", conclusion:"", finalReview:"" },
    entries: [], cues: {}, cueNotes: {}, cueLocations: {}
  });
  function normalise(value) {
    if (!value || typeof value !== "object" || value.version !== VERSION ||
        !value.project || typeof value.project !== "object") throw new Error("This is not a compatible Pathfinder project file.");
    const blank = newState();
    const next = {
      ...blank, ...value,
      project: { ...blank.project, ...value.project },
      ui: { ...blank.ui, ...value.ui },
      scratch: { ...blank.scratch, ...value.scratch },
      entries: Array.isArray(value.entries) ? value.entries.filter(x => x && typeof x === "object").slice(0,120) : [],
      cues: value.cues && typeof value.cues === "object" ? value.cues : {},
      cueNotes: value.cueNotes && typeof value.cueNotes === "object" ? value.cueNotes : {},
      cueLocations: value.cueLocations && typeof value.cueLocations === "object" ? value.cueLocations : {}
    };
    next.ui.planStep = Math.max(0, Math.min(9, Number(next.ui.planStep) || 0));
    next.ui.planMax = Math.max(next.ui.planStep, Math.min(9, Number(next.ui.planMax) || 0));
    if (!["home","planning","completing","path","report"].includes(next.route)) next.route = "home";
    return next;
  }
  let state = newState();
  let lastFocus = null;
  let lastDrawer = "";
  let toastHandle = null;
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) state = normalise(JSON.parse(saved));
  } catch(err) { console.warn("Unable to restore saved prototype", err); }
  const main = $("#main");
  const layer = $("#drawerLayer");
  const planTitles = ["Your starting point","Shape your question","Who might benefit?","Choose a direction","Your data or starting material","Is it feasible?","Plan your mathematics","Make a prediction","Your first mathematical move","Your planning snapshot"];
  const studioSections = [
    {id:"intro",name:"Introduction",sub:"Set out your purpose and motivation",icon:"pencil"},
    {id:"data",name:"Data & methods",sub:"Record what you actually have and did",icon:"flask"},
    {id:"math",name:"Mathematical journey",sub:"Explore, interpret, and decide what follows",icon:"chart"},
    {id:"conclusion",name:"Conclusion",sub:"Bring the key findings together",icon:"flag"},
    {id:"review",name:"Final review",sub:"Check communication and prepare your own draft",icon:"check-circle"}
  ];
  const filled = value => typeof value === "string" ? !!value.trim() : !!value;
  const hasPlan = () => state.ui.planMax > 0 || filled(state.project.aim) || filled(state.project.idea);
  const hasStudio = () => state.entries.length > 0 || Object.values(state.scratch).some(filled);
  const demoFlag = () => state.demo ? '<span class="meta-pill gold">' + icon("sparkles") + ' Sample investigation</span>' : "";
  const field = (path, label, placeholder, opts = {}) => {
    const value = getPath(path) ?? "";
    const type = opts.type || "text";
    const hint = opts.hint ? '<p class="field-hint">' + e(opts.hint) + '</p>' : "";
    const rows = opts.rows || 3;
    const fieldId = "field-" + path.replace(/[^a-z0-9-]/gi, "-");
    const input = type === "textarea"
      ? '<textarea class="field" id="' + fieldId + '" data-bind="' + e(path) + '" rows="' + rows + '" placeholder="' + e(placeholder) + '">' + e(value) + '</textarea>'
      : type === "select"
      ? '<select class="field" id="' + fieldId + '" data-bind="' + e(path) + '">' + (opts.options || []).map(op => '<option value="' + e(op[0]) + '"' + (value === op[0] ? " selected" : "") + '>' + e(op[1]) + '</option>').join("") + '</select>'
      : '<input class="field" type="' + e(type) + '" id="' + fieldId + '" data-bind="' + e(path) + '" placeholder="' + e(placeholder) + '" value="' + e(value) + '">';
    return '<div class="field-group"><label class="field-label" for="' + fieldId + '">' + e(label) + '</label>' + input + hint + '</div>';
  };
  const getPath = path => path.split(".").reduce((o,k) => o == null ? undefined : o[k], state);
  const putPath = (path,value) => {
    const parts=path.split(".");
    if (parts.length > 5 || !["project","scratch","entries","ui","cueNotes","cueLocations"].includes(parts[0]) ||
        parts.some(k => k === "__proto__" || k === "constructor" || k === "prototype")) return;
    let obj=state;
    for(let i=0;i<parts.length-1;i++){
      if (obj[parts[i]] === undefined || obj[parts[i]] === null) return;
      obj=obj[parts[i]];
    }
    if(obj && typeof obj === "object")obj[parts[parts.length-1]]=value;
  };
  function save() {
    state.updatedAt = new Date().toISOString();
    try { localStorage.setItem(KEY,JSON.stringify(state)); setSaveStatus("Saved on this device"); }
    catch { setSaveStatus("Could not save — export a backup",true); }
  }
  function setSaveStatus(message,error=false) {
    const el=$("#saveStatus");
    if(el){el.innerHTML='<span class="save-dot"></span> ' + e(message);el.classList.toggle("error",error);}
  }
  function toast(text) {
    const el=$("#toast");el.textContent=text;el.classList.add("show");
    clearTimeout(toastHandle);toastHandle=setTimeout(()=>el.classList.remove("show"),3000);
  }
  function button(text,action,cls="btn-secondary",more="",glyph="") {
    return '<button class="btn ' + cls + '" type="button" data-action="' + action + '" ' + more + '>' + e(text) + (glyph ? icon(glyph) : "") + '</button>';
  }
  function choose(path, options, opts={}) {
    const value = getPath(path);
    const shape=opts.stack?"choice-stack":"choice-grid";
    return '<div class="'+shape+'" role="group" aria-label="'+e(opts.label||"Choose an option")+'">' +
      options.map(o => {
        const isSelected=String(value) === String(o.value);
        return '<button type="button" class="choice'+(opts.tight?" tight":"")+(isSelected?" selected":"")+
          '" aria-pressed="'+isSelected+'" data-choice="'+e(path)+'" data-value="'+e(o.value)+'">' +
          (o.icon?'<span class="choice-symbol">'+icon(o.icon)+'</span>':"") +
          '<span class="choice-body"><span class="choice-title">'+e(o.title)+'</span>'+(o.desc?'<span class="choice-subtitle">'+e(o.desc)+'</span>':"")+
          '</span><span class="choice-marker">'+icon("check")+'</span></button>';
      }).join("") + '</div>';
  }
  function numberPick(path,title) {
    const v = Number(getPath(path));
    return '<div class="field-group"><label class="field-label">'+e(title)+'</label><div class="selection-number" role="group" aria-label="'+e(title)+'">'+
      [1,2,3,4,5].map(n=>'<button type="button" class="number-btn'+(v===n?" selected":"")+'" data-choice="'+e(path)+'" data-value="'+n+'" aria-pressed="'+(v===n)+'">'+n+'</button>').join("")+'</div><p class="field-hint">1 = not ready yet · 5 = well prepared. A reflection, not an IB grade.</p></div>';
  }
  const overline = (text) => '<p class="eyebrow">'+e(text)+'</p>';
  const note = (text, warning=false) => '<div class="inline-note'+(warning?" warning":"")+'">'+icon(warning?"info":"lightbulb")+'<p>'+text+'</p></div>';
  function panelCard(label,text,action,iconName,badge="") {
    return '<button type="button" class="studio-tile" data-action="'+action+'"><span class="feature-icon">'+icon(iconName)+'</span><strong>'+e(label)+'</strong><p>'+e(text)+'</p>'+badge+'</button>';
  }
  function sheetTitle(label,title,sub="") {
    return '<div class="page-top"><div>'+overline(label)+'<h1>'+e(title)+'</h1>'+(sub?'<p class="page-intro">'+e(sub)+'</p>':"")+'</div>'+demoFlag()+'</div>';
  }
  function helpButton(key,label="Help me think") {
    return '<button class="help-inline" type="button" data-action="toggle-help" data-help="'+e(key)+'">'+icon("lightbulb")+e(label)+icon(state.ui.helpKey===key?"chevron-left":"chevron-right")+'</button>';
  }
  function helpBox(key,content) {
    return state.ui.helpKey===key ? '<div class="help-details">'+content+'</div>' : "";
  }
  function cue(key,title,text) {
    const status=state.cues[key];
    if(["done","not-relevant"].includes(status)) return "";
    const opened=state.ui.openCue===key;
    return '<div class="micro-cue"><div class="micro-cue-top">'+icon("pencil")+e(title)+'</div><p>'+e(text)+'</p>'+
      '<div class="button-row">' +
      '<button type="button" class="btn" data-action="cue-write" data-key="'+e(key)+'">Write a note</button>'+
      '<button type="button" class="btn" data-action="cue-covered" data-key="'+e(key)+'">Already covered</button>'+
      '<button type="button" class="btn" data-action="cue-skip" data-key="'+e(key)+'">Not relevant</button></div>'+
      (opened?'<div class="field-group" style="margin-top:15px">'+field('cueNotes.'+key,'Your own note (not your finished IA)','Record your thoughts in your own words.',{type:"textarea",rows:3})+
      button("Close note","close-cue","btn-sm btn-light")+'</div>':"")+'</div>';
  }
  function planBanner() {
    const n=state.ui.planStep;
    return '<div class="progress-top"><span class="progress-overview">'+icon("compass")+' Guided planning</span><span class="progress-counter">Step '+(n+1)+' of '+planTitles.length+'</span></div>'+
      '<div class="mini-progress" style="max-width:none;margin:0 0 27px"><span style="width:'+((n+1)/planTitles.length*100)+'%"></span></div>';
  }
  function planningBody(n) {
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
  function readableArea(area) {
    return ({relationships:"Relationships and patterns",models:"Mathematical models",optimisation:"Optimisation or rates of change",proof:"Mathematical reasoning and proof",other:"Student-chosen mathematics",unsure:"To be decided"})[area]||"To be decided";
  }
  function summary(title,text) {const has=filled(text);return '<div class="summary-block'+(!has?" is-empty":"")+'"><span class="label">'+e(title)+'</span><p>'+e(has?text:"Not decided yet")+'</p></div>';}
  function viewPlanning() {
    const n=state.ui.planStep;const detail=planningBody(n);
    return '<div class="page narrow">'+tabletNav()+planBanner()+
    '<div class="task-shell"><div class="stage-label">'+icon(n===9?"sparkles":"compass")+' '+e(planTitles[n])+'</div><h2>'+e(detail.title)+'</h2><p class="task-intro">'+e(detail.intro)+'</p>'+
    detail.html+'<div class="example-row">'+helpButton("planning-"+n)+helpBox("planning-"+n,detail.help)+'</div>'+
    '<div class="task-footer">'+(n?button("Back","plan-back","btn-quiet","", "chevron-left"):button("Home","go-home","btn-quiet"))+
    '<div class="button-row">'+(n===9?button("Open IA Studio","go-studio","btn-primary","", "arrow-right"):button(n===8?"Review my plan":"Continue","plan-next","btn-primary","", "arrow-right"))+'</div></div></div>'+
    '<p class="small-callout">You can leave an answer undecided, return to earlier steps, and change your direction later. Nothing here predicts your IB mark.</p></div>';
  }
  function tabButtons() {
    return '<div class="segment" role="group" aria-label="IA Studio stages">'+
      [{id:"overview",name:"Overview"},{id:"intro",name:"Introduction"},{id:"data",name:"Data"},{id:"math",name:"Mathematics"},{id:"conclusion",name:"Conclusion"},{id:"review",name:"Review"}]
      .map(t=>'<button type="button" data-action="studio-tab" data-section="'+t.id+'" class="'+(state.ui.studioSection===t.id?"active":"")+'">'+e(t.name)+'</button>').join("")+
    '</div>';
  }
  function studioOverview() {
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
    return '<div class="task-shell"><div class="stage-label">'+icon("pencil")+' INTRODUCTION</div>'+
      '<h2>What are you investigating, and why?</h2><p class="task-intro">Keep it concise, personal and purposeful. This is your own working note, not a generated IA paragraph.</p>'+
      summary("Your current aim",state.project.aim)+
      (filled(state.project.prediction)?summary("Your provisional prediction",state.project.prediction):"")+
      field("scratch.introduction","My introduction notes","Why does this question interest me? What would an answer mean? What do I predict, and why?",{type:"textarea",rows:7})+
      cue("intro-purpose","A writing moment","Your introduction should make your aim, motivation and intended mathematical direction clear; avoid reporting results you haven't obtained.")+
      '<div class="task-footer">'+button("Studio overview","studio-overview","btn-quiet","", "chevron-left")+button("Data & methods","studio-data","btn-primary","", "arrow-right")+'</div></div>';
  }
  function studioData() {
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
    if (!state.entries.length) return null;
    state.ui.mathIndex=Math.max(0,Math.min(state.ui.mathIndex,state.entries.length-1));
    return state.entries[state.ui.mathIndex];
  }
  function mathListSmall() {
    if (!state.entries.length) return "";
    return '<div class="content-card" style="margin-top:16px"><div class="section-eyebrow">YOUR MATHEMATICAL PATH</div>'+
      state.entries.map((st,i)=>'<button class="panel-link" type="button" data-action="edit-step" data-index="'+i+'"><span>'+(i+1)+'. '+e(st.title||"Untitled mathematical question")+'</span><span class="status-tag '+(st.status==="completed"?"":"pending")+'">'+(st.status==="completed"?"Evidence":"Plan")+'</span></button>').join("")+'</div>';
  }
  function mathWork(st,i) {
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
    const section=state.ui.studioSection;
    const body=section==="overview"?studioOverview():section==="intro"?studioIntro():section==="data"?studioData():section==="math"?studioMath():section==="conclusion"?studioConclusion():studioReview();
    return '<div class="page narrow">'+tabletNav()+
      sheetTitle("PART 2 · COMPLETING","Your IA Studio","Your writing companion, from the first exploration to the final reflection.")+
      (state.project.aim?'<div class="context-card" style="margin-bottom:18px">'+icon("target")+'<div><strong>YOUR INVESTIGATION AIM</strong><p>'+e(state.project.aim)+'</p></div><button class="btn btn-sm btn-quiet" data-action="open-panel" data-panel="project">Edit</button></div>':"")+
      tabButtons()+body+'</div>';
  }
  function pathNode(title,desc,status,action,extra="") {
    return '<div class="path-node '+e(status)+'"><span class="path-gutter"><span class="path-circle">'+icon(status==="done"?"check":status==="current"?"sparkles":"circle")+'</span></span>'+
      '<button class="path-node-body" type="button" data-action="'+e(action)+'" '+extra+'><strong>'+e(title)+'</strong><p>'+e(desc)+'</p><span class="status-tag '+(status==="done"?"":"pending")+'">'+(status==="done"?"Recorded":status==="current"?"Current / revisit":"Open when ready")+'</span></button></div>';
  }
  function viewPath() {
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
  function feature(ic,title,text) {return '<div class="feature-card"><span class="feature-icon">'+icon(ic)+'</span><h3>'+e(title)+'</h3><p>'+e(text)+'</p></div>';}
  function viewReport() {
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
    return '<nav class="tablet-nav" aria-label="Quick navigation">'+
      [["home","Home","home"],["planning","Planning","compass"],["completing","IA Studio","pencil"],["path","My path","route"]].map(([id,label,ic])=>
      '<button type="button" class="'+(state.route===id?"active":"")+'" data-nav="'+id+'">'+icon(ic)+label+'</button>').join("")+'</nav>';
  }
  function sideMilestones() {
    const items=[
      ["Your idea",filled(state.project.idea)||filled(state.project.aim),"plan",0],
      ["Your purpose",filled(state.project.beneficiary),"plan",2],
      ["Feasible plan",state.ui.planMax>=8,"plan",5],
      ["Actual mathematics",state.entries.some(x=>x.status==="completed"),"studio","math"],
      ["Conclusion",filled(state.scratch.conclusion),"studio","conclusion"]
    ];
    $("#sideMilestones").innerHTML=items.map(([title,done,target,index],i)=>
      '<button type="button" class="side-milestone '+(done?"done":i===0?"active":"")+'" data-action="'+(target==="plan"?"path-plan":"studio-"+index)+'" '+(target==="plan"?'data-index="'+index+'"':"")+'>'+
      '<span class="dot">'+(done?icon("check"):i+1)+'</span><span>'+e(title)+'</span></button>').join("");
    $("#pathCount").textContent=state.entries.length;
  }
  function render(opts={}) {
    const map={home:viewHome,planning:viewPlanning,completing:viewCompleting,path:viewPath,report:viewReport};
    main.innerHTML=map[state.route]();
    document.querySelectorAll("[data-nav]").forEach(b=>b.classList.toggle("active",b.dataset.nav===state.route));
    sideMilestones();
    if(opts.top){window.scrollTo({top:0,behavior:"instant"});main.focus({preventScroll:true})}
  }
  function nav(route,opts={}) {
    state.route=route;
    if(opts.section)state.ui.studioSection=opts.section;
    state.ui.helpKey="";state.ui.openCue="";
    save();render({top:true});
  }
  function addMath(nextTitle="") {
    state.entries.push({...mathDefault(),title:nextTitle});
    state.ui.mathIndex=state.entries.length-1;
    state.ui.mathPhase="work";
    nav("completing",{section:"math"});
  }
  function editMath(index) {
    if(!state.entries[index])return;
    state.ui.mathIndex=index;state.ui.mathPhase="work";nav("completing",{section:"math"});
  }
  function demo(kind) {
    const next=newState();
    next.demo=kind;
    next.route="completing";next.ui.planStep=9;next.ui.planMax=9;next.ui.studioSection="math";next.ui.mathPhase="interpret";
    const p=next.project;
    Object.assign(p,{
      ideaStatus:"yes", idea:"Sleep and reaction time",aim:"How does hours of sleep relate to reaction time in a sample dataset?",
      beneficiaryType:"me",beneficiary:"Understand what the data could tell us about changes in reaction time.",
      course:"AA SL",kind:"statistics",dataSource:"secondary",dataDetails:"An illustrative paired-variable dataset (sample only; not a real imported source).",
      dataStatus:"ready",permissions:"unknown",readiness:3,ease:4,mathsArea:"relationships",
      prediction:"Reaction time may improve with more sleep.",predictionWhy:"Sleep might influence alertness.",
      firstMove:"graph",precision:"Report calculated values only to precision justified by source measurements."
    });
    const st=mathDefault(); st.status="completed";st.title="Inspect the first scatter graph";st.purpose="Identify whether the data suggest a useful relationship before choosing a model.";st.technique="Plot paired measurements on a scatter graph";st.kind="scatter";st.knowledge="syllabus";
    if(kind==="linear"){st.observation="linear";st.result="Illustrative points appear to follow an approximately straight, downward pattern.";st.observationText="There is an approximately linear decrease in reaction time as sleep increases.";st.interpretation="This may be useful for the aim, but a scatter plot alone does not establish causation.";}
    if(kind==="curved"){st.observation="curved";st.result="Illustrative points bend rather than following a straight line.";st.observationText="The apparent relationship is curved and may level off.";st.interpretation="A straight-line model may miss the structure; considering a suitable curved model could be meaningful.";}
    if(kind==="unclear"){st.observation="unclear";st.result="Illustrative points show no obvious systematic relationship.";st.observationText="There is no clear apparent pattern.";st.interpretation="This suggests caution about predicting reaction time from sleep using these observations alone.";}
    if(kind==="unexpected"){st.observation="unexpected";st.result="Most illustrative points cluster, with one unusual observation.";st.observationText="A single point lies noticeably outside the main cluster.";st.interpretation="It may be worth checking the point before using a fitted model or claiming an overall pattern.";}
    if(kind==="theory"){
      Object.assign(p,{idea:"Numerical patterns",aim:"Can a pattern observed in small cases be generalised and proved?",beneficiaryType:"curiosity",beneficiary:"Understand why a mathematical relationship holds.",kind:"theoretical",dataSource:"",dataDetails:"Small illustrative numerical cases.",dataStatus:"theoretical",mathsArea:"proof",prediction:"The pattern might generalise.",predictionWhy:"It appears in several cases.",firstMove:"theory"});
      Object.assign(st,{title:"Explore initial numerical cases",purpose:"Look for a plausible mathematical conjecture.",technique:"Numerical reasoning",kind:"theory",observation:"",result:"Illustrative small cases suggest a repeatable pattern.",observationText:"Several numerical examples support a tentative conjecture.",interpretation:"Examples suggest a question but cannot establish a general theorem."});
    }
    next.entries=[st];next.ui.mathIndex=0;
    state=next;save();closeDrawer();render({top:true});toast("Sample loaded — every result is clearly labelled as illustrative.");
  }
  function openDrawer(panel) {
    closeDrawer(false);
    lastDrawer=panel;
    const p=state.project;
    let body="";
    if(panel==="project"){
      body='<section><p class="text-muted">Your details stay in this browser unless you deliberately export them.</p>'+
        (state.demo?note("You are editing an illustrative sample project.",true):"")+
        field("project.aim","Current aim","What do you want to find out?",{type:"textarea",rows:3})+
        field("project.course","IB Mathematics course","Select your course",{type:"select",options:[["","Select a course"],["AA SL","Mathematics AA SL"],["AI SL","Mathematics AI SL"],["AA HL","Mathematics AA HL"],["AI HL","Mathematics AI HL"] ]})+
        field("project.beneficiary","Meaning or intended benefit","Who might use this, or why does it interest you?",{type:"textarea",rows:2})+
        field("project.precision","Measurement accuracy to remember","Units, precision or rounding", {type:"textarea",rows:2})+
        field("project.documentUrl","Link to my real IA document (optional)","https://docs.google.com/…", {type:"url",hint:"Keep the finished IA in Word or Google Docs. Pathfinder never edits your document."})+
        (cleanUrl(p.documentUrl)?'<a class="btn btn-secondary" href="'+e(cleanUrl(p.documentUrl))+'" target="_blank" rel="noopener noreferrer">Open my IA document '+icon("arrow-up-right")+'</a>':"")+
        '</section><div class="panel-list">'+button("Review my plan","go-planning","btn-secondary")+button("See my journey","go-path","btn-light")+'</div>';
    }else if(panel==="files"){
      body='<section><h3>Project backups</h3><p>The reliable way to move this prototype between devices is a downloadable .json project file. Local browser saving is not cloud syncing.</p>'+
      button("Download project backup","export-json","btn-primary","", "download")+
      button("Restore from a backup","import-json","btn-secondary","", "upload")+'</section>'+
      '<section><h3>Readable working record</h3><p>Review a summary or use your browser to print/save it as PDF. Importing a PDF or Word report is not supported in this prototype.</p>'+
      button("Open my working report","go-report","btn-light","", "file")+'</section>'+
      '<section><h3>Start fresh</h3><p>Starting a new project clears the current one from this browser. Export a backup first if you want to keep it.</p>'+
      button("Start a new project","new-project","btn-danger","", "refresh")+'</section>';
    }else if(panel==="help"){
      body='<section><p>Pathfinder is a thinking and writing companion. You remain the author of your mathematics and explanations.</p><div class="panel-list">'+
        '<button class="panel-link" data-action="open-stuck">I am stuck '+icon("arrow-right")+'</button>'+
        '<button class="panel-link" data-action="go-path">How do I see my journey? '+icon("arrow-right")+'</button>'+
        '<button class="panel-link" data-action="open-files">How do I keep my work safe? '+icon("arrow-right")+'</button>'+
        '<button class="panel-link" data-action="open-demos">Try an illustrative sample '+icon("arrow-right")+'</button></div></section>'+
        '<section><h3>A useful rhythm</h3><p>Ask a mathematical question → do real mathematics → interpret the result in context → choose what genuinely follows. Repeat only when there is a reason.</p></section>'+
        '<p class="drawer-footer">Design prototype, not the full 24-sheet decision system. It does not calculate marks, validate sources, or approve permissions.</p>';
    }else if(panel==="demos"){
      const choices=[
        ["linear","An approximately linear pattern","Could modelling or quantifying correlation be useful?"],
        ["curved","A curved pattern","What if a straight line isn't suitable?"],
        ["unclear","No clear relationship","An inconclusive outcome can still be meaningful."],
        ["unexpected","An unexpected outlier","How might that change the interpretation?"],
        ["theory","A theoretical investigation","What follows from a tentative conjecture?"]
      ];
      body='<section><p>Explore how the guidance reacts to different actual findings. All examples are <strong>fictional demonstrations</strong>, not real student data.</p>'+
        '<div class="panel-list">'+choices.map(([key,label,desc])=>
        '<button type="button" class="panel-link" data-action="load-demo" data-demo="'+key+'"><span><strong>'+e(label)+'</strong><br><span class="text-muted" style="font-weight:400">'+e(desc)+'</span></span>'+icon("arrow-right")+'</button>').join("")+'</div></section>'+
        note("Loading a sample replaces your current local project. Download a backup first if needed.",true);
    }else if(panel==="stuck"){
      const noData=state.project.dataStatus==="not-started";
      body='<section><p>You do not need to invent results or force a technique. Choose one small, useful action.</p><div class="panel-list">'+
        '<button class="panel-link" data-action="studio-intro"><span>Write or refine a short introduction</span>'+icon("arrow-right")+'</button>'+
        '<button class="panel-link" data-action="studio-data"><span>Check what evidence or assumptions are available</span>'+icon("arrow-right")+'</button>'+
        '<button class="panel-link" data-action="go-planning"><span>Revisit my aim or planned method</span>'+icon("arrow-right")+'</button>'+
        '<button class="panel-link" data-action="studio-math"><span>Explore a theoretical or preliminary case</span>'+icon("arrow-right")+'</button></div></section>'+
        (noData?note("No data yet? Define variables or terms, check a genuine source, draft a prediction, or work on a small theoretical case clearly labelled as such."):"")+
        '<p class="drawer-footer">If consent, privacy or safety is unresolved, discuss the affected activity with your teacher before proceeding.</p>';
    }
    const titles={project:"My project",files:"Save & export",help:"Here to help",demos:"Choose a sample",stuck:"Find a way forward"};
    layer.hidden=false;document.body.classList.add("dialog-open");
    layer.innerHTML='<aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawerTitle" tabindex="-1"><div class="drawer-header"><h2 id="drawerTitle">'+titles[panel]+'</h2>'+
      '<button class="icon-button" type="button" data-action="close-drawer" aria-label="Close panel">'+icon("x")+'</button></div>'+body+'</aside>';
    $(".drawer",layer).focus();
  }
  function closeDrawer(restore=true) {
    layer.hidden=true;layer.innerHTML="";document.body.classList.remove("dialog-open");
    if(restore && lastFocus && document.contains(lastFocus))lastFocus.focus({preventScroll:true});
  }
  function exportJson() {
    try {
      const payload=JSON.stringify({...state,route:"home"},null,2);
      const blob=new Blob([payload],{type:"application/json"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=url;a.download="ia-pathfinder-project.json";document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),3000);toast("Project backup downloaded.");
    } catch(err) {toast("Backup could not be created. Please try again.");console.error(err);}
  }
  function changeNavAction(action,el) {
    if(action==="go-home")return nav("home");
    if(action==="go-planning")return nav("planning");
    if(action==="go-studio")return nav("completing",{section:"overview"});
    if(action==="go-path")return nav("path");
    if(action==="go-report")return nav("report");
    if(action==="open-files")return openDrawer("files");
    if(action==="open-demos")return openDrawer("demos");
    if(action==="open-stuck")return openDrawer("stuck");
    if(["studio-overview","studio-intro","studio-data","studio-math","studio-conclusion","studio-review"].includes(action))return nav("completing",{section:action.slice(7)});
    return false;
  }
  function clickAction(el) {
    const action=el.dataset.action||"";
    if(changeNavAction(action,el)!==false)return;
    switch(action){
      case "start-planning": state.ui.planStep=0;nav("planning");break;
      case "plan-next":
        state.ui.planMax=Math.max(state.ui.planMax,state.ui.planStep);
        state.ui.planStep=Math.min(9,state.ui.planStep+1);
        state.ui.planMax=Math.max(state.ui.planMax,state.ui.planStep);
        nav("planning");break;
      case "plan-back":state.ui.planStep=Math.max(0,state.ui.planStep-1);nav("planning");break;
      case "path-plan":state.ui.planStep=Math.max(0,Math.min(9,Number(el.dataset.index)||0));nav("planning");break;
      case "studio-tab":nav("completing",{section:el.dataset.section});break;
      case "math-add": addMath();break;
      case "edit-step":editMath(Number(el.dataset.index));break;
      case "math-phase": state.ui.mathPhase=el.dataset.phase;save();render();break;
      case "math-work":state.ui.mathPhase="work";save();render({top:true});break;
      case "math-interpret":
        if(currentMath() && currentMath().status!=="completed"){toast("Record actual mathematics before interpreting a result.");return;}
        state.ui.mathPhase="interpret";save();render({top:true});break;
      case "math-next":state.ui.mathPhase="next";save();render({top:true});break;
      case "suggest-next":{
        const st=state.entries[Number(el.dataset.index)];
        if(!st)break;
        const item=suggestions(st)[Number(el.dataset.suggestion)];
        if(item){st.nextQuestion=item[0];save();render();}
        break;
      }
      case "math-add-next":{
        const st=currentMath();
        if(!st)break;
        if(!filled(st.nextQuestion)){toast("Write or choose a next mathematical question first.");return;}
        addMath(st.nextQuestion);break;
      }
      case "toggle-help":
        state.ui.helpKey=state.ui.helpKey===el.dataset.help?"":el.dataset.help;
        save();render();break;
      case "cue-write":state.ui.openCue=el.dataset.key;save();render();break;
      case "close-cue":state.ui.openCue="";save();render();break;
      case "cue-covered":state.cues[el.dataset.key]="done";state.ui.openCue="";save();render();toast("Noted — this reminder won't keep appearing.");break;
      case "cue-skip":state.cues[el.dataset.key]="not-relevant";state.ui.openCue="";save();render();toast("Okay — this cue is now hidden.");break;
      case "open-panel":lastFocus=el;openDrawer(el.dataset.panel);break;
      case "close-drawer":closeDrawer();break;
      case "load-demo":
        if((hasPlan()||hasStudio()) && !window.confirm("Replace your current local project with an illustrative sample? Download a backup first if needed."))return;
        demo(el.dataset.demo);break;
      case "export-json":exportJson();break;
      case "import-json":$("#importFile").click();break;
      case "print-report":window.print();break;
      case "new-project":
        if(!window.confirm("Start a new project? Your current local work will be replaced. Download a backup first if you need it."))return;
        state=newState();save();closeDrawer();nav("home");toast("A fresh workspace is ready.");break;
    }
  }
  document.addEventListener("click",evt=>{
    const navButton=evt.target.closest("[data-nav]");
    if(navButton){nav(navButton.dataset.nav);return;}
    const choice=evt.target.closest("[data-choice]");
    if(choice) {
      const path=choice.dataset.choice;
      const previous=getPath(path);
      const numeric=["project.readiness","project.ease"].includes(path);
      putPath(path,numeric?Number(choice.dataset.value):choice.dataset.value);
      if(path.endsWith(".status")&&path.startsWith("entries.")&&previous!==choice.dataset.value){state.ui.helpKey="";}
      save();render();
      const focusTarget=[...document.querySelectorAll("[data-choice]")].find(x=>x.dataset.choice===path&&x.dataset.value===choice.dataset.value);
      if(focusTarget)focusTarget.focus({preventScroll:true});
      return;
    }
    const action=evt.target.closest("[data-action]");
    if(action){if(action.closest(".drawer")&&action.dataset.action!=="close-drawer"&&
      ["go-home","go-planning","go-path","go-report","go-studio","open-files","open-demos","open-stuck"].includes(action.dataset.action))closeDrawer(false);
      clickAction(action);return;}
    if(evt.target===layer)closeDrawer();
  });
  document.addEventListener("input",evt=>{
    const target=evt.target;
    if(target.dataset.bind){putPath(target.dataset.bind,target.value);save();}
  });
  document.addEventListener("change",evt=>{
    const target=evt.target;
    if(target.dataset.check){state.cues[target.dataset.check]=target.checked?"done":"open";save();}
    if(target.dataset.bind){putPath(target.dataset.bind,target.value);save();}
  });
  document.addEventListener("keydown",evt=>{
    if(evt.key==="Escape"&&!layer.hidden){evt.preventDefault();closeDrawer();}
    if(evt.key==="Tab"&&!layer.hidden){
      const focusable=[...layer.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled])')];
      if(!focusable.length)return;
      const first=focusable[0],last=focusable[focusable.length-1];
      if(evt.shiftKey&&document.activeElement===first){evt.preventDefault();last.focus();}
      if(!evt.shiftKey&&document.activeElement===last){evt.preventDefault();first.focus();}
    }
  });
  $("#importFile").addEventListener("change",async evt=>{
    const input=evt.target;const file=input.files&&input.files[0];
    if(!file)return;
    try{
      if(file.size>2_000_000)throw new Error("That backup is too large for this prototype.");
      const imported=normalise(JSON.parse(await file.text()));
      if(!window.confirm("Replace the current local project with this backup?"))return;
      state=imported;state.route="home";save();closeDrawer();render({top:true});toast("Project backup restored.");
    }catch(err){window.alert("This file could not be imported. "+err.message);}
    finally{input.value="";}
  });
  // Welcome: current route from a previous session should always remain reachable and understandable.
  render();
})();