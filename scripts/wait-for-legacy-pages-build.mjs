/**
 * GitHub Pages must serve dist/, never the raw repository. Some repositories
 * still have legacy branch publishing enabled alongside our custom Pages
 * workflow. On a push the two deployments race; the branch build may finish
 * LAST and replace our bundled app with source files that cannot resolve npm
 * module specifiers (notably MathJax in PDF/Word export).
 *
 * Wait for the competing branch build on THIS SHA before calling deploy-pages.
 * This is a compatibility guard; switching Settings > Pages > Source to
 * "GitHub Actions" remains the permanent configuration fix.
 */
const apiBase=process.env.GITHUB_API_URL||"https://api.github.com";
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const maxAttempts=60,intervalMs=5000;

export function pendingLegacyPagesRun(data,sha){
 const runs=Array.isArray(data?.workflow_runs)?data.workflow_runs:[];
 const matched=runs.filter(run=>run.name==="pages build and deployment"&&
   run.event==="dynamic"&&run.head_sha===sha);
 return matched.sort((a,b)=>String(b.created_at||"").localeCompare(String(a.created_at||"")))[0]||null;
}
export function publishingMode(pages){
 if(pages?.build_type==="workflow")return "workflow";
 if(pages?.build_type==="legacy"||pages?.source?.branch)return "legacy";
 throw new Error("Cannot determine Pages publishing mode; will not risk deploying over an unknown source.");
}
export async function waitForLegacyPagesBuild({
 repository=process.env.GITHUB_REPOSITORY,
 sha=process.env.GITHUB_SHA,
 token=process.env.GITHUB_TOKEN,
 baseUrl=apiBase,
 request=fetch,
 sleep=delay,
 attempts=maxAttempts
}={}){
 if(!repository||!sha||!token)throw new Error("Missing repository, SHA or Pages API token.");
 const headers={
  Accept:"application/vnd.github+json",
  Authorization:"Bearer "+token,
  "X-GitHub-Api-Version":"2022-11-28"
 };
 const get=async path=>{
  const response=await request(baseUrl+"/repos/"+repository+path,{headers});
  if(!response.ok)throw new Error("GitHub Pages status request failed (HTTP "+response.status+").");
  return response.json();
 };
 const pages=await get("/pages");
 if(publishingMode(pages)==="workflow"){
  console.log("Pages is configured for GitHub Actions; no branch deployment can overwrite dist/.");
  return {mode:"workflow",waited:false};
 }
 console.log("::warning::Pages is configured for legacy branch publishing AND has a custom bundled deploy. Waiting for the branch build so the bundled site is deployed last. Change Settings > Pages > Source to GitHub Actions.");
 const path="/actions/runs?head_sha="+encodeURIComponent(sha)+"&per_page=100";
 for(let i=0;i<attempts;i++){
  const runs=await get(path);
  const competing=pendingLegacyPagesRun(runs,sha);
  if(competing?.status==="completed"){
   console.log("Legacy branch Pages run "+competing.id+" finished ("+competing.conclusion+"); safe to publish bundled dist/ now.");
   return {mode:"legacy",waited:true,runId:competing.id};
  }
  if(i%6===0)console.log("Waiting for competing branch-based Pages deployment ("+(competing?.status||"not created yet")+").");
  if(i<attempts-1)await sleep(intervalMs);
 }
 throw new Error("Legacy branch Pages deployment did not finish. Refusing a racing deploy; switch Settings > Pages > Source to GitHub Actions.");
}
if(process.argv[1]&&import.meta.url==="file://"+process.argv[1]){
 await waitForLegacyPagesBuild();
}
