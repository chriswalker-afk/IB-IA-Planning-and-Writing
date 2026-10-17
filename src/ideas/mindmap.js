/** Student-led idea maps. Editorial prompts only: no generated IA titles,
 * claims about data access, confirmed mathematical technique, or approval.
 * Existing seed catalogue provides the optional mathematical directions.
 */
import {IDEA_SEEDS,IDEA_TOPICS} from './catalog.js';

export const IDEA_MAP_ROOTS=Object.freeze({
 interests:[
  {id:'hobbies',label:'My hobbies & interests',description:'Things I enjoy or do',icon:'layers',topics:['sport','music','games','food','design']},
  {id:'daily',label:'My daily life',description:'Routines, choices and places',icon:'home',topics:['school','travel','money','food','technology']},
  {id:'world',label:'My world',description:'Things I notice around me',icon:'route',topics:['nature','environment','design','technology','travel']}
 ],
 data:[
  {id:'measure',label:'I can measure something',description:'Lengths, times, angles or change',icon:'calculator'},
  {id:'record',label:'I can count or ask',description:'Safe, repeatable observations',icon:'pencil'},
  {id:'find',label:'I can find existing data',description:'A source I can verify',icon:'book'}
 ]
});
export const DATA_BRANCHES=Object.freeze({
 measure:[
  {id:'time',label:'Time it',desc:'A journey, queue or process',seeds:['travel-wait','school-queue','food-cooling']},
  {id:'shape',label:'Measure a shape',desc:'A real object, image or position',seeds:['leaf-outline','sport-position','design-outline']},
  {id:'change',label:'Watch something change',desc:'Repeated measurements with units',seeds:['plant-change','food-cooling','environment-shadow']}
 ],
 record:[
  {id:'compare',label:'Count and compare',desc:'Two situations with comparable effort',seeds:['sport-consistency','wildlife-observations','school-queue']},
  {id:'survey',label:'Ask an appropriate question',desc:'Only with permission and careful privacy',seeds:['school-event','travel-departure','money-comparison'],
   warning:'Before surveying other people, check school permission, consent and privacy. An easy survey is not automatically valid data.'},
  {id:'repeat',label:'Record repeated outcomes',desc:'Define a trial and keep conditions fair',seeds:['game-chance','travel-reliability','school-timetable']}
 ],
 find:[
  {id:'weather',label:'Weather or environment',desc:'Published readings with dates and units',seeds:['weather-pattern','environment-rain','environment-waste']},
  {id:'published',label:'Open public figures',desc:'A credible source you can check',seeds:['money-subscription','travel-reliability','tech-storage']},
  {id:'image',label:'A photo or video',desc:'Permission and a defensible scale',seeds:['sport-trajectory','design-outline','tech-animation']}
 ]
});
export const IDEA_DATA_PROMISE='Could I time, count, measure, photograph, survey (with permission), or verify existing data this week? What maths from my course could help? Try one small check before committing.';
export const IDEA_THEORY_CAUTION='Pure number patterns, general sequences and proof-heavy topics can be difficult to develop into an appropriately focused IB Maths IA; they may fit an Extended Essay better. Discuss the scope, course-level mathematics and a manageable first example with your teacher before choosing this route.';
export const ideaMapRoots=mode=>IDEA_MAP_ROOTS[mode]||IDEA_MAP_ROOTS.interests;
export const ideaMapRoot=(mode,id)=>ideaMapRoots(mode).find(x=>x.id===id);
export const ideaMapTopics=root=>root?.topics?.map(id=>IDEA_TOPICS.find(x=>x.id===id)).filter(Boolean)||[];
export const ideaMapBranches=root=>DATA_BRANCHES[root?.id]||[];
export const ideaMapIdeas=({mode,topic,subtopic,dataBranch,root})=>{
 if(mode==='data')return (ideaMapBranches(ideaMapRoot(mode,root)).find(x=>x.id===dataBranch)?.seeds||[]).map(id=>IDEA_SEEDS.find(x=>x.id===id)).filter(Boolean);
 if(!topic||!subtopic)return [];
 return IDEA_SEEDS.filter(x=>x.topic===topic&&x.topic!=='patterns'&&x.tags.includes(subtopic));
};
