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

/* Example actions so teammates can see how the board reads. Each is a real observation about the V1.4 report. Marked as examples; Settings removes them. */
const DEMO=[
 ['d01','issue','flag','r-exec','anisha','outline','','The summary is about 880 words and the limit is 750. Could we trim it?','2026-10-04'],
 ['d02','issue','flag','r-cover','manoj','other','Version line','The version line still says V1_4 (Core argument makeover draft). Should it change before we submit?','2026-10-04'],
 ['d03','issue','flag','r-8-1','yupeng','look','Figure 3','Figure 3 has the file name cash.png printed under the chart. Can we remove it?','2026-10-03'],
 ['d04','issue','add','r-tools','santosh','','','This section is empty. It needs the list of AI tools we used and how we used them.','2026-10-03'],
 ['d05','issue','add','r-app-b','anisha','','Actual contribution column','Seven NEEDS INPUT tags remain here. Each member should write their own actual contribution.','2026-10-04'],
 ['d06','issue','add','r-refs','aryaman','source','[37]','Reference 37 still needs the year and venue of the Genoa and Vale presentation.','2026-10-05'],
 ['d07','issue','flag','r-2-3','santosh','logic','Table 4','Option 1 and Option 3 both show a payback of 3.2 years. Is that right?','2026-10-05'],
 ['d08','issue','edit','r-1','manoj','style','','Every chapter still has Written by [Name] and Edited by [Name]. Fill in the real names.','2026-10-05'],
 ['d09','done','flag','r-8-1','yupeng','','','Check that the benefit lines add up to the AUD 9.9 M a year total.','2026-10-02','2026-10-03','Add the six lines by hand','3.0 + 3.0 + 1.8 + 1.2 + 0.5 + 0.4 = 9.9. It matches.'],
 ['d10','done','flag','r-exec','aryaman','','','Check the NPV, IRR and payback in the summary match Chapter 8.','2026-10-02','2026-10-03','Compare with Table 4 and section 8.1','NPV 7.3, IRR 48%, payback 3.2 years. All match.'],
 ['d11','done','flag','r-8-2','manoj','','Table 11','Check the Table 11 weighted scores.','2026-10-03','2026-10-04','Recalculate each option','Weights add to 100%. Scores are 3.15, 2.80 and 3.55. All correct.'],
 ['d12','done','flag','r-9-1','santosh','','','Check the 2% haulage benefit sits inside the model range.','2026-10-03','2026-10-04','Read the range in section 9.1','AUD 1.8 M is inside the AUD 0.9 M to 4.5 M range. Fine.']
];
const demoActions=()=>DEMO.map(r=>{
  const a={type:r[2],unit:r[3],by:r[4],tag:r[5],spot:r[6],text:r[7],day:r[8],at:Date.parse(r[8]+'T09:00:00+11:00'),status:r[1],owner:'',plan:'',due:'',demo:1};
  if(r[1]==='done'){a.owner=r[4];a.plan=r[10];a.note=r[11];a.doneAt=Date.parse(r[9]+'T10:00:00+11:00');a.doneBy='long';}
  return ['actions','demo-'+r[0],a];
}).concat([['actions','demo-d13',{type:'check',pass:'review',unit:'r-8',by:'yupeng',owner:'yupeng',day:'2026-10-04',at:Date.parse('2026-10-04T09:00:00+11:00'),due:'2026-10-04',text:'Read the whole chapter.',status:'done',doneAt:Date.parse('2026-10-04T12:00:00+11:00'),doneBy:'long',demo:1}]]);
