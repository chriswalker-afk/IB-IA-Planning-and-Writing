import {CRITERIA} from './catalog.js';
const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/** Editorial connections, not marks awarded to an isolated excerpt. */
export const EXAMPLE_CRITERIA=Object.freeze({
 EX30:{A:'A focused title points towards an answerable investigation without claiming a result.',C:'The mathematical direction can evolve when the student responds to their own findings.'},
 EX31:{A:'A clear purpose links the investigation question to a decision and supports coherence.',C:'A genuine reason guides choices rather than simply displaying a technique.',D:'The later conclusion should discuss what the result actually says about this purpose.'},
 EX32:{A:'The statistical question connects to what a comparison would mean.',C:'A student-owned decision motivates the data and analysis.',D:'Later reflection must consider variability and sampling before claiming a useful recommendation.'},
 EX33:{A:'A precise conjecture and reason make the investigation coherent.',C:'The mathematical question can be genuine without a fabricated personal story.',D:'Later reasoning must assess whether the argument actually resolved the original uncertainty.'},
 EX01:{A:'A precise aim gives the opening a direction.',C:'A genuine observation motivates a mathematical choice.'},
 EX02:{A:'The aim identifies the quantities and scope.',D:'The investigation distinguishes association from a causal conclusion.'},
 EX03:{A:'A conjecture establishes an answerable purpose.',C:'Mathematical curiosity needs no invented personal story.'},
 EX04:{A:'A defined objective keeps the investigation focused.',E:'A feasible domain makes the optimisation meaningful.'},
 EX05:{C:'The choice of model responds to an observation.',E:'The method has a purpose rather than being chosen for complexity.'},
 EX06:{D:'The sampling method limits what can be inferred.',B:'Sampling vocabulary describes what actually happened.'},
 EX07:{D:'An assumption is connected to a consequence.',E:'The limiting value of the model is interpreted mathematically.'},
 EX08:{B:'The headings define quantities, units and recorded precision.',A:'The caption explains the table’s role.'},
 EX09:{A:'A comparison replaces unnecessary repeated working.',B:'Units and a defined error measure make the values meaningful.'},
 EX10:{B:'Labels, units and marks distinguish observations from models.',A:'The figure is introduced and used in the discussion.'},
 EX11:{D:'A fit statistic is evaluated alongside residuals and context.',E:'A model’s domain is not confused with unrestricted validity.'},
 EX12:{B:'Dimensions and variables explain the diagram.',E:'Each factor in the volume formula is justified.'},
 EX13:{B:'Symbols, units and a connected calculation are clear.',E:'The output is interpreted as a model-based estimate.'},
 EX14:{E:'The explanation identifies what software calculated.',B:'Inputs, fixed quantities and fitted parameters are distinguished.'},
 EX15:{D:'A result is linked to the aim and its scope is evaluated.',E:'The comparison is interpreted rather than simply quoted.'},
 EX16:{D:'The next question follows an actual finding.',C:'The student makes a reasoned decision rather than following a technique checklist.'},
 EX17:{D:'A specific limitation restricts a specific inference.'},
 EX18:{B:'Recording, calculation and reporting precision are distinguished.',E:'Extra displayed digits are not treated as exact knowledge.'},
 EX19:{E:'Understanding is demonstrated where new mathematics is introduced.',D:'An authentic learning insight can explain a change in understanding.'},
 EX20:{E:'A general argument establishes the claim.',B:'The proof is set out in a logical order.'},
 EX21:{C:'A genuine mathematical decision develops the investigation.',D:'Evaluation of an earlier model explains the change of direction.'},
 EX22:{A:'The conclusion synthesises the answer to the aim.',D:'Its claims are limited by the evidence actually obtained.'},
 EX23:{E:'A counterexample answers a universal conjecture.',D:'The conclusion recognises what an unexpected result establishes.'},
 EX24:{A:'The reader can trace the logical connection between sections.',B:'Representations and non-original sources are identified clearly.'},
 EX25:{D:'The statistical conclusion stays within the evidence.',A:'The answer returns to the original aim.'},
 EX26:{D:'The scope of the argument is stated honestly.',E:'A proof’s assumptions and domain are respected.'},
 EX27:{D:'Correlation is interpreted without inventing causation.',E:'A coefficient is read alongside the actual pattern.'},
 EX28:{B:'The representation respects the discrete domain.',E:'A continuous curve is not substituted for untested integer cases.'},
 EX29:{B:'Categorical data are represented without implying a continuous relationship.',A:'The display makes the intended comparison easy to follow.'}
});
export function exampleCriteria(card){
 const connections=EXAMPLE_CRITERIA[card.id];if(!connections)return '';
 return '<section class="ex-criteria"><h4>How this example demonstrates the criteria</h4>'+Object.entries(connections).map(([id,text])=>'<p><strong>'+id+' · '+e(CRITERIA[id].name)+':</strong> '+e(text)+' <button type="button" class="btn btn-quiet essentials-trigger" data-action="essentials-open" data-essentials-tab="rubric" data-essentials-criterion="'+id+'">View criterion '+id+'</button></p>').join('')+'<p class="ess-small">These are features to learn from, not marks assigned to this excerpt.</p></section>';
}
