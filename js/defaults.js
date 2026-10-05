'use strict';
/* Starting data. Written to the database once, the first time the hub opens empty. Everything here can be changed in Settings. */
const ARTS=[{id:'report',name:'Final Report',short:'Report',due:'2026-10-23'},{id:'slides',name:'Final Presentation',short:'Slides',due:'2026-10-27'}];
const DEF={
 units:[
  ['Cover','Cover page'],['Exec','Executive summary'],['TOC','Contents, figures, tables'],
  ['1','Introduction'],['2','Proposed design / solution'],['3','System model'],['4','Requirements and design alignment'],['5','Resource selection'],
  ['6','Risk, safety and ethics'],['7','Standards and compliance'],['8','Design evaluation'],['9','Design optimisation and validation'],
  ['Concl','Conclusion'],['Refs','References'],['Tools','Digital tool acknowledgment'],['App','Appendices']
 ].map((a,i)=>({id:'r'+(i+1),art:'report',short:a[0],name:a[1],ord:i}))
 .concat([
  'Title, team and client','Problem and context','Proposed solution at a glance','System model','Requirements to design features',
  'Why this is the best option','Risk, safety and ethics','Standards and compliance','Human factors and sustainability',
  'Optimisation and validation','Recommendation and next steps','Questions'
 ].map((n,i)=>({id:'s'+(i+1),art:'slides',short:String(i+1),name:n,ord:100+i}))),
 people:[
  ['long','Dinh Long Cao','Long','Team Leader / Chief Editor'],['anisha','Anisha Budhathoki','Anisha','Secretary / Deputy Leader'],
  ['manoj','Manoj Pokharel','Manoj','Solution Specialist'],['santosh','Santosh Lamichhane','Santosh','Solution Specialist'],
  ['yupeng','Yupeng Wang','Yupeng','Solution Specialist'],['aryaman','Aryaman Chakraborty','Aryaman','Solution Specialist']
 ].map((a,i)=>({id:a[0],name:a[1],short:a[2],role:a[3],ord:i})),
 deadlines:'2026-10-09 | report | All drafts complete\n2026-10-16 | report | Cross-editing done\n2026-10-19 | report | Content freeze\n2026-10-23 | report | Final report due\n2026-10-26 | slides | Slides upload\n2026-10-27 | slides | Final presentation'
};
const LEADER='long';
