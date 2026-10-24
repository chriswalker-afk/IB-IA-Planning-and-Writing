/** The three mathematics discovery experiences share one saved selection state.
 * Browse branches freely; neither opening nor selecting a journey records work. */
import {INVESTIGATIVE_ROUTES,ROUTE_FAMILIES,matchingInvestigativeRoutes,routeById,routeCourseMath} from '../planning/investigative-routes.js';
import {REPRESENTATION_ROUTE_GUIDANCE} from '../diagrams/representation-hub.js';
import {representationTool} from '../diagrams/representation-registry.js';
const modes=[
 {id:'aim',label:'Based on my aim',icon:'target'},
 {id:'routes',label:'Typical investigative routes',icon:'route'},
 {id:'all',label:'Complete list',icon:'library'}
];
export function renderInvestigativeRoutes(state,{e,icon,catalogue}){
 const p=state.planning,x=p.routeExplorer||{},mode=['aim','routes','all'].includes(x.mode)?x.mode:'aim';
 const course=p.fields.course,supported=['AI SL','AA SL'].includes(course);
 const selected=routeById(x.selectedRoute),opened=routeById(x.openRoute);
 const counts=p.mathSelected.filter(id=>course==='AI SL'?id.startsWith('AI'):course==='AA SL'?id.startsWith('AA'):false).length;
 const foreign=p.mathSelected.filter(id=>course==='AI SL'?!id.startsWith('AI'):course==='AA SL'?!id.startsWith('AA'):true).length;
 const modeTabs='<div class="journey-mode-tabs" role="tablist" aria-label="Ways to explore mathematics">'+modes.map(item=>
  '<button type="button" class="journey-mode-tab'+(mode===item.id?' active':'')+'" role="tab" aria-selected="'+(mode===item.id)+'"'+
  ' id="journey-tab-'+item.id+'" aria-controls="journey-mode-panel" data-action="math-mode" data-mode="'+item.id+'">'+
  icon(item.icon)+'<span>'+item.label+'</span></button>').join('')+'</div>';
 const courseNotice=!supported?'<p class="journey-course-note">'+icon('info')+'<span class="inline-notice-copy">'+
  ' These journeys are examples of mathematical thinking, not course recommendations. We only have a detailed topic catalogue for AI SL and AA SL; ask your teacher before choosing specific mathematics for '+e(course||'your course')+'.</span></p>':'';
 const saved=selected?'<aside class="journey-route-spark" aria-label="Your saved investigative route">'+
  icon('sparkles')+'<span><strong>Route spark saved: '+e(selected.title)+'</strong>'+
  '<small>Provisional first step: '+e(selected.first[0])+'. Later branches depend on real results.</small></span>'+
  '<button type="button" data-action="math-open-route" data-revisit="true" data-route-id="'+e(selected.id)+'">Revisit</button>'+
  '<button type="button" data-action="math-remove-route" aria-label="Remove saved route">Remove</button></aside>':'';
 let body='';
 if(mode==='all')body='<div class="journey-mode-intro"><h3>Browse every technique</h3>'+
   '<p>Already have a method in mind? Find it here. You do not have to choose an investigative journey.</p></div>'+
   catalogue(state);
 else{
  const recommended=mode==='aim'?matchingInvestigativeRoutes(state):INVESTIGATIVE_ROUTES.filter(r=>x.family==='all'||r.family===x.family);
  const filtering=mode==='routes'?'<div class="journey-family-filters" role="group" aria-label="Filter investigative routes">'+
   [{id:'all',title:'All 16'},...ROUTE_FAMILIES.map(f=>({id:f.id,title:f.title}))].map(f=>
   '<button type="button" class="journey-family-filter'+((x.family||'all')===f.id?' active':'')+
   '" data-action="math-family" data-family="'+e(f.id)+'" aria-pressed="'+((x.family||'all')===f.id)+'">'+e(f.title)+'</button>').join('')+'</div>':'';
  const routeCards=recommended.length?(mode==='routes'?(x.family==='all'?ROUTE_FAMILIES.map(f=>
    '<section class="journey-family-section" aria-label="'+e(f.title)+'">'+
    '<div class="journey-family-heading">'+icon(f.icon)+'<span><h4>'+e(f.title)+'</h4><p>'+e(f.description)+'</p></span></div>'+
    '<div class="journey-cards">'+recommended.filter(t=>t.family===f.id).map(t=>renderRouteCard(t,{e,icon,selected,opened,mode})).join('')+'</div></section>').join(''):
    '<div class="journey-cards">'+recommended.map(t=>renderRouteCard(t,{e,icon,selected,opened,mode})).join('')+'</div>'):
    '<div class="journey-cards">'+recommended.map(t=>renderRouteCard(t,{e,icon,selected,opened,mode})).join('')+'</div>'):'';
  body='<div class="journey-mode-intro"><h3>'+(mode==='aim'?'Possible routes for your question':'Explore 16 mathematical journeys')+'</h3>'+
    '<p>'+(mode==='aim'?'These are a few editorial matches to your investigation type, data and the words in your aim. They are suggestions, not analysis of real results.':
     'Four families, sixteen exploratory journeys. Each begins with a small step, then branches depending on what the mathematics actually reveals.')+'</p></div>'+
    filtering+
    (opened?renderRouteDetail(opened,state,{e,icon}):'')+
    (recommended.length?routeCards:
    '<div class="journey-no-matches">'+icon('compass')+' Your investigation type is still undecided. You can browse the typical routes instead.'+
    '<button type="button" data-action="math-mode" data-mode="routes">Explore all 16 routes '+icon('arrow-right')+'</button></div>')+
    (mode==='aim'?'<p class="journey-all-link">Not what you had in mind? <button type="button" data-action="math-mode" data-mode="routes">Explore all 16 investigative routes '+icon('arrow-right')+'</button></p>':'');
 }
 return '<section class="journey-maths-explorer" aria-label="Explore mathematical routes">'+
  '<div class="journey-maths-head"><h3>Three ways to explore mathematics</h3>'+
  '<p>Find a useful first step. It is fine to change direction or decide the mathematical evidence is sufficient.</p></div>'+
  '<div class="journey-maths-current"><span>'+icon('calculator')+' '+e(course||'Course not chosen')+'</span>'+
  '<span>'+counts+' technique'+(counts===1?'':'s')+' chosen</span></div>'+
  modeTabs+saved+courseNotice+
  (foreign?'<p class="journey-course-switch-note">'+icon('info')+'<span class="inline-notice-copy">'+' '+foreign+' earlier mathematics selection'+(foreign===1?'':'s')+
   ' belong'+(foreign===1?'s':'')+' to another course. They are preserved but not included in the current course list. Check with your teacher before relying on them.</span></p>':'')+
  '<div class="journey-mode-panel" role="tabpanel" id="journey-mode-panel" aria-labelledby="journey-tab-'+mode+'" data-journey-mode-panel="'+mode+'">'+body+'</div>'+
  '<p class="journey-inquiry-note">Nothing here is a required IA structure. A worthwhile question, genuine mathematics, interpretation and reflection matter more than the number of techniques.</p></section>';
}
function renderRouteCard(route,{e,icon,selected,opened,mode}){
 const family=ROUTE_FAMILIES.find(f=>f.id===route.family);
 return '<article class="journey-card'+(opened?.id===route.id?' open':'')+(selected?.id===route.id?' saved':'')+'">'+
  '<div class="journey-card-label">'+icon(family?.icon||'route')+' '+e(family?.title||'Mathematics')+
   (selected?.id===route.id?'<span class="journey-saved-tag">'+icon('check-circle')+' Saved route</span>':'')+'</div>'+
  '<h4>'+e(route.title)+'</h4><p>'+e(mode==='aim'&&route.matchReason?route.matchReason+' '+route.why:route.why)+'</p>'+
  '<div class="journey-card-start"><strong>Start here</strong><span>'+e(route.first[0])+'</span></div>'+
  (route.teacher?'<span class="journey-teacher-flag">'+icon('info')+' Teacher discussion advised</span>':'')+
  '<button type="button" class="journey-card-open" data-action="math-open-route" data-route-id="'+e(route.id)+'"'+
   ' aria-expanded="'+(opened?.id===route.id)+'">'+(opened?.id===route.id?'Close this journey':'Explore this journey')+' '+icon('arrow-right')+'</button></article>';
}
function renderRouteDetail(route,state,{e,icon}){
 const c=state.planning.fields.course,m=routeCourseMath(route,c),chosen=new Set(state.planning.mathSelected);
 const geometryHint={
  triangulation:'Make a labelled triangle before calculating heights, distances or bearings; check what is measured and what is derived.',
  images:'After calibrating an image, use a separate labelled geometric construction when a triangle or polygon explains your area or length model.',
  optimisation:'For a dimensioned physical design, construct and label its geometry before forming the objective function. For financial optimisation, use other tools.'
 }[route.id];
 const probabilityHint=route.id==="chance"?
  "Use a probability tree when the mathematics involves successive or conditional outcomes. For simulated observations, a statistical diagram may fit better.":
  route.id==="finance"?
  "If a financial decision has successive dependent risks, a tree can compare their conditional outcomes. Otherwise use a clear table or graph for costs, payoffs and expected values.":null;
 const suggested=REPRESENTATION_ROUTE_GUIDANCE[route.id];
 // One consistent contextual creator shelf across all sixteen routes.
 // Keep the earlier geometry/probability-specific advice without printing
 // duplicate launch controls for a tool already in the core recommendation.
 const creatorIds=[...(suggested?.ids||[])];
 if(geometryHint&&!creatorIds.includes("geometry"))creatorIds.push("geometry");
 if(probabilityHint&&!creatorIds.includes("probability"))creatorIds.push("probability");
 const supplementary=[geometryHint,probabilityHint].filter(Boolean);
 const creatorShelf='<div class="journey-optional-tool journey-route-creators" data-journey-creators="'+e(route.id)+'">'+
  '<div class="journey-route-creators-head"><h4>Optional diagram creators for this route</h4>'+
  '<p>Start with your own question and evidence. A diagram is not required, and these are choices rather than predetermined next mathematical steps.</p></div>'+
  '<div class="journey-route-creators-grid">'+creatorIds.map((id)=>{
   const tool=representationTool(id);
   if(!tool)return "";
   const index=suggested?.ids?.indexOf(id)??-1;
   const reason=index>=0?suggested.why[index]:id==="geometry"?geometryHint:probabilityHint;
   return '<button type="button" class="journey-route-creator" data-action="resource-creator-open" data-resource-creator="'+e(id)+'">'+
    '<span class="journey-route-creator-icon">'+icon(tool.icon)+'</span>'+
    '<span class="journey-route-creator-text"><strong>Open '+e(tool.title)+'</strong><small>'+e(reason)+'</small></span>'+
    icon("arrow-right")+'</button>';
  }).join("")+'</div>'+
  (supplementary.length?'<details class="journey-route-creators-context"><summary>Route-specific diagram advice</summary>'+
   supplementary.map(hint=>'<p>'+e(hint)+'</p>').join("")+'</details>':"")+
  '</div>';
 const saved=state.planning.routeExplorer?.selectedRoute===route.id;
 const family=ROUTE_FAMILIES.find(f=>f.id===route.family);
 return '<section class="journey-detail" id="journey-detail" aria-label="Investigative journey for '+e(route.title)+'">'+
  '<div class="journey-detail-heading"><span>'+icon(family?.icon||'route')+' '+e(family?.title||'Exploration')+'</span>'+
  '<button type="button" class="journey-close" data-action="math-open-route" data-route-id="'+e(route.id)+'" aria-label="Close this journey">'+icon('x')+'</button></div>'+
  '<h3 tabindex="-1" id="journey-detail-title">'+e(route.title)+'</h3><p class="journey-detail-why">'+e(route.why)+'</p>'+
  '<div class="journey-flow" aria-label="Example of a branching investigation">'+
   '<div class="journey-flow-trunk"><div class="journey-flow-node journey-flow-first"><span>1 · Start here</span>'+
    '<h4>'+e(route.first[0])+'</h4><p>'+e(route.first[1])+'</p></div>'+
    '<div class="journey-flow-stem" aria-hidden="true"></div>'+
    '<div class="journey-flow-node journey-flow-decision"><span>2 · Respond to your first mathematics</span>'+
    '<h4>'+e(route.question)+'</h4><p>Different findings can justify different next steps. These are possibilities, not results you have already obtained.</p></div></div>'+
   '<div class="journey-flow-fork" aria-hidden="true"></div>'+
   '<div class="journey-flow-branches">'+route.branches.map((b,i)=>
    '<details class="journey-branch"><summary><span class="journey-branch-number">'+(i+1)+'</span>'+
    '<span class="journey-branch-title"><strong>'+e(b.signal)+'</strong><small>Explore what this might mean</small></span>'+icon('chevron-down')+'</summary>'+
    '<div class="journey-branch-body"><p><strong>Possible next move:</strong> '+e(b.next)+'</p>'+
    '<p class="journey-branch-caution"><strong>Check:</strong> '+e(b.check)+'</p></div></details>').join('')+'</div>'+
   '<div class="journey-flow-stem" aria-hidden="true"></div>'+
   '<div class="journey-flow-node journey-flow-reflect"><span>3 · Return to your question</span>'+
    '<h4>Interpret, evaluate, then decide</h4><p>'+e(route.finish)+'</p></div>'+
   '</div>'+
   (route.caution?'<p class="journey-route-warning">'+icon('info')+'<span class="inline-notice-copy">'+' '+e(route.caution)+'</span></p>':'')+
   (route.teacher?'<p class="journey-route-warning">'+icon('message-square')+'<span class="inline-notice-copy">'+
    ' Speak with your teacher before relying on a theoretical or advanced route. A pattern-heavy investigation can become an EE-style topic.</span></p>':'')+
   creatorShelf+
   '<div class="journey-detail-actions">'+
    '<button type="button" class="btn '+(saved?'btn-secondary':'btn-primary')+'" data-action="'+(saved?'math-remove-route':'math-select-route')+'" data-route-id="'+e(route.id)+'">'+
      icon(saved?'check-circle':'bookmark')+' '+(saved?'Saved · Remove route':'Save this as my provisional route')+'</button>'+
    '<span>Saving remembers a direction and a first step, not completed mathematics.</span></div>'+
   '<div class="journey-math-techniques"><h4>Possible starting mathematics'+(m.length?' · '+e(c):'')+'</h4>'+
    (m.length?'<p>Choose a technique only if it fits your actual question. This does not select every step in the route.</p>'+
     '<div class="journey-math-buttons">'+m.map(t=>{
      const isSelected=chosen.has(t.id);
      return '<button type="button" class="journey-technique'+(isSelected?' selected':'')+
       '" data-action="plan-toggle-math" data-math-id="'+e(t.id)+'" aria-pressed="'+isSelected+'">'+
       '<strong>'+e(t.label)+'</strong><span class="math-route-select">'+icon(isSelected?'check-circle':'plus-circle')+
       '<span data-math-route-status>'+(isSelected?'In my mathematics plan':'Add this technique')+'</span></span></button>';
     }).join('')+'</div>':
      '<p>This route is for exploration only. The supported course list covers AI SL and AA SL; confirm any mathematics with your teacher.</p>')+
   '</div></section>';
}
