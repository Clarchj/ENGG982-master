'use strict';
/* Fixed lists and starting data. The chapter and sub-section names come from data/report.json (the V1.4 master) the first time the hub opens. The report text itself stays in the Word file. */
const ARTS=[
  {id:'report',name:'Final Report',short:'Report',noun:'chapter',nouns:'chapters',ver:'V1.4',due:'2026-10-23'},
  {id:'slides',name:'Final Presentation',short:'Slides',noun:'slide',nouns:'slides',ver:'',due:'2026-10-27'}];

/* The life of one action, like a GitHub issue: raised, planned, plan approved, work done, work approved. */
const STAGES=[
  ['issue','Issues','red','Something to fix, change or add. Nobody has a plan yet.'],
  ['plan','Plan to approve','blue','Someone has a plan. The leader decides.'],
  ['doing','In progress','amber','Plan approved. The work is being done.'],
  ['review','Work to approve','purple','The work is done. The leader checks it.'],
  ['done','Done','green','Approved and merged.']];
const STAGE=Object.fromEntries(STAGES.map((s,i)=>[s[0],{label:s[1],col:s[2],help:s[3],i}]));

/* What a teammate can do */
const TYPES=[
  ['flag','Flag a flaw','Something is wrong or missing','\u2691'],
  ['edit','Change content','Something already written needs changing','\u270E'],
  ['add','Add content','Something should be written that is not there yet','\uFF0B'],
  ['check','Sign off','I checked a whole chapter','\u2713']];
const TYPE=Object.fromEntries(TYPES.map(t=>[t[0],{label:t[1],hint:t[2],icon:t[3]}]));

/* Tutor's workflow (Workshop 10). Writer and Reviewer are everyone. The other three are checking passes, in this order. */
const PASSES=[['review','Review','Reviewer','Does it make sense, match the outline, flow, and have sources?'],['edit','Edit','Editor','One voice, good style, language errors fixed.'],['proof','Proofread','Proofreader','Typos, numbering, references.'],['publish','Publish','Publisher','Layout, figures, tables and colours look professional.']];
const PASS=Object.fromEntries(PASSES.map(p=>[p[0],{label:p[1],role:p[2],help:p[3]}]));
/* What a reviewer should look for (Workshop 10, "When reviewing, what should you consider?") */
const TAGS=[['clear','Unclear message'],['outline','Off the outline'],['logic','Not logical'],['source','Needs sources'],['style','Wording or style'],['typo','Typo or numbering'],['look','Layout or colour'],['other','Other']];

const DEF={
 people:[
  ['long','Dinh Long Cao','Long','Team Leader / Chief Editor'],['anisha','Anisha Budhathoki','Anisha','Secretary / Deputy Leader'],
  ['manoj','Manoj Pokharel','Manoj','Solution Specialist'],['santosh','Santosh Lamichhane','Santosh','Solution Specialist'],
  ['yupeng','Yupeng Wang','Yupeng','Solution Specialist'],['aryaman','Aryaman Chakraborty','Aryaman','Solution Specialist']
 ].map((a,i)=>({id:a[0],name:a[1],short:a[2],role:a[3],ord:i})),
 roles:{edit:['long'],proof:[],publish:[]},
 deadlines:'2026-10-09 | report | All drafts complete\n2026-10-16 | report | Cross-editing done\n2026-10-19 | report | Content freeze\n2026-10-23 | report | Final report due\n2026-10-26 | slides | Slides upload\n2026-10-27 | slides | Final presentation'
};
const LEADER='long';
