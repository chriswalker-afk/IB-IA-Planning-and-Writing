/** One read-only, keyboard-accessible MLA guide; no student work is edited. */
export const MLA_CITATION_CASES=Object.freeze([
 {question:"I downloaded population, weather or sports data from a website.",verdict:"Cite it",answer:"Cite the original dataset and publisher where you introduce the data. Describe the actual years, population and variables you selected."},
 {question:"I used the quadratic formula or Pythagoras' theorem from class.",verdict:"Usually not",answer:"Widely taught mathematical knowledge normally needs no citation. Do explain what the formula establishes in your own investigation. Credit a source if you borrowed a distinctive explanation or derivation."},
 {question:"I learned an unfamiliar method or proof from an article or video.",verdict:"Cite it",answer:"Credit the resource that helped you learn or adapt the technique. Then explain the mathematics in your own words and demonstrate your understanding; a reference alone is not an explanation."},
 {question:"I made my own graph from someone else's published data.",verdict:"Cite the data",answer:"The graph may be your own, but cite the dataset underneath it. Put the acknowledgement near the first graph or data description so the source is easy to trace."},
 {question:"I traced a diagram or imported a photograph from online.",verdict:"Cite it",answer:"Acknowledge the original image or drawing even if you traced or adapted it. Check permission or licence conditions separately from the citation."},
 {question:"I collected my own measurements and drew my own diagram.",verdict:"Usually not",answer:"Your own original measurements and diagram need no external source citation. Explain your collection procedure, and credit any external material used to design it."},
 {question:"I paraphrased a published explanation instead of quoting it.",verdict:"Cite it",answer:"Using different words does not make someone else's ideas your own. Cite the original explanation; put exact copied words in quotation marks as well."},
 {question:"I included AI-generated text, images, code or other output.",verdict:"Check school rules",answer:"Follow your school's permitted-use policy and IB academic-integrity requirements. Material from AI tools that appears in assessed work needs clear acknowledgement; do not present generated reasoning as independently yours."}
]);
export function renderMlaCitationGuide({e,icon,link}){
 const source="https://data.worldbank.org/indicator/SP.POP.TOTL";
 const scenarios=MLA_CITATION_CASES.map(item=>
  '<details class="resource-mla-case"><summary><span class="resource-mla-question">'+e(item.question)+'</span>'+
  '<span class="resource-mla-verdict">'+e(item.verdict)+'</span></summary>'+
  '<p>'+e(item.answer)+'</p></details>').join('');
 return '<section class="resource-mla-guide" aria-label="MLA Maths IA examples and citation decisions">'+
  '<p class="resource-mla-principle"><strong>One style, one workflow:</strong> use MLA in Google Docs, cite material beside the sentence, method or figure that uses it, and check a matching Works Cited entry at the end.</p>'+
  '<div class="resource-mla-example"><div class="resource-mla-section-kicker">'+icon("book")+' WORKED EXAMPLE</div>'+
   '<h4>From a real dataset to a citation</h4>'+
   '<p class="resource-mla-muted">Demonstration only. This does not mean your own IA used these data; cite your actual sources.</p>'+
   '<div class="resource-mla-example-step"><span>1 · Details to enter in Google Docs</span>'+
   '<p><strong>Organisation:</strong> World Bank<br><strong>Page:</strong> Population, total<br><strong>Website:</strong> World Bank Open Data<br><strong>URL:</strong> '+e(source)+'</p>'+link(source,"View the actual example dataset")+'</div>'+
   '<div class="resource-mla-example-step"><span>2 · What an in-text citation can look like</span>'+
   '<blockquote>For my comparison, I selected the relevant years and countries from the World Bank’s “Population, total” dataset (World Bank).</blockquote>'+
   '<p class="resource-mla-muted">Explain your own selection and calculations; do not copy this demonstration as evidence of work completed.</p></div>'+
   '<div class="resource-mla-example-step"><span>3 · Matching Works Cited entry</span>'+
   '<p class="resource-mla-cited">World Bank. “Population, total.” <em>World Bank Open Data</em>, data.worldbank.org/indicator/SP.POP.TOTL. Accessed 23 Oct. 2026.</p>'+
   '<p class="resource-mla-muted">Example access date reflects this guide’s preparation. Enter the date you actually accessed the source, and check all fields and formatting in your own generated entry.</p></div></div>'+
  '<div class="resource-mla-cases"><h4>What needs citing in a Maths IA?</h4>'+
   '<p class="resource-mla-muted">Open any situation to see the answer. When unsure whether something is common knowledge, cite the material you relied on.</p>'+scenarios+'</div>'+
  '<details class="resource-mla-extra"><summary>Three Google Docs details worth checking</summary>'+
   '<ul><li><strong>MLA edition:</strong> Docs currently offers MLA (8th ed.). The MLA Handbook has a ninth edition, but the IB does not require the newest edition. Follow your school’s agreed workflow consistently.</li>'+
   '<li><strong>Page number:</strong> Replace a # placeholder with a real page number; remove it for sources without relevant page numbers.</li>'+
   '<li><strong>Works Cited:</strong> Google Docs may include all saved citation sources, even if you never cited them. Remove uncited entries, check the heading, and recreate the list if you made later changes.</li></ul></details>'+
  '<p class="resource-mla-integrity"><strong>Remember:</strong> citing material does not replace independent mathematics, and a bibliography is not an extra assessed criterion. Good attribution lets the reader distinguish your thinking from others’ work.</p>'+
  '</section>';
}
