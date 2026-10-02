'use strict';
/* ---------- built-in defaults. Every one of these becomes editable data the first time you change it (see Setup). ---------- */
const DEF={
 secdefs:[
  {id:'cover',no:'',name:'Cover page',lim:'1 page, with team member names',unit:'pp',max:1,ev:'Title and team members.',crit:['struct']},
  {id:'exec',mode:'scaffold',no:'',name:'Executive summary',lim:'max 750 words',unit:'words',max:750,ev:'Problem, proposed design, headline results (NPV, ROI, payback), top risks and residuals, key standards complied with.',crit:['struct','content']},
  {id:'toc',mode:'scaffold',no:'',name:'Contents, figures, tables',lim:'automatic',unit:'',max:'',ev:'Generated from headings once the text is frozen.',crit:['struct']},
  {id:'s1',no:'1',name:'Introduction',lim:'max 2 pp',unit:'pp',max:2,ev:'Summary of the problem, project definition and scope, host and context.',crit:['struct','content']},
  {id:'s2',mode:'scaffold',no:'2',name:'Proposed design / solution',lim:'1 to 8 pp',unit:'pp',max:8,ev:'Concise overview. Links each decision to chapters 3 to 9. Anything in the client brief not covered later.',crit:['sol','content']},
  {id:'s3',no:'3',name:'System model',lim:'max 1 pp, 1 diagram, 1 table',unit:'pp',max:1,ev:'Context diagram (components, flows, interfaces) and an assumptions table: ID, rationale, source.',crit:['sol']},
  {id:'s4',no:'4',name:'Requirements and design alignment',lim:'1 to 1.5 pp + table',unit:'pp',max:1.5,ev:'Measurable objectives, constraints, stakeholder needs, success metrics, ethics guardrails. Traceability table: requirement, design feature, source.',crit:['sol','content']},
  {id:'s5',no:'5',name:'Resource selection',lim:'1 to 1.5 pp + table',unit:'pp',max:1.5,ev:'Short bill of materials (item, part no./version, qty, rationale, ethics and sustainability). Buy or lease, lead times, people and competence.',crit:['sol','content']},
  {id:'s6',no:'6',name:'Risk, safety and ethics',lim:'1 to 1.5 pp + register',unit:'pp',max:1.5,ev:'Hazards, analysis, controls, residual risk. Ethical risks: privacy, bias, fairness, duty of care. Register in appendix, up to 20 items.',crit:['content']},
  {id:'s7',no:'7',name:'Standards and compliance',lim:'1 pp + table',unit:'pp',max:1,ev:'Compliance table, up to 10 items: standard and clause, design feature, evidence.',crit:['content']},
  {id:'s8',no:'8',name:'Design evaluation',lim:'2 pp',unit:'pp',max:2,ev:'Economic, technical and non-economic factors. Comparison tables, up to 20 items. Say why this option beats the others, on which metrics.',crit:['sol','content']},
  {id:'s9',no:'9',name:'Design optimisation and validation',lim:'1 to 2 pp',unit:'pp',max:2,ev:'How the design was optimised and validated, with the evidence you judge appropriate.',crit:['sol','content']},
  {id:'concl',mode:'scaffold',no:'',name:'Conclusion',lim:'0.5 to 1 pp',unit:'pp',max:1,ev:'A compelling argument and solid justification for the recommended course of action.',crit:['struct','content']},
  {id:'refs',mode:'scaffold',no:'',name:'References',lim:'IEEE or Harvard',unit:'',max:'',ev:'Every source, data set and visual cited. Anything from AI must be backed by a traditional source.',crit:['src']},
  {id:'ack',mode:'scaffold',no:'',name:'Digital tool acknowledgment',lim:'short',unit:'',max:'',ev:'Which digital tools were used and how.',crit:['src']},
  {id:'app',mode:'scaffold',no:'A',name:'Appendices',lim:'no limit given',unit:'',max:'',ev:'Risk register. Team roles with what each person actually did and any change to the agreement. Project plans. Minutes. Signed team rules and charter.',crit:['pm']}
 ],
 criteria:[
  {id:'sol',name:'Quality of solution',marks:30,all:''},
  {id:'content',name:'Content and persuasive quality',marks:30,all:''},
  {id:'lang',name:'Language and presentation (one voice, proofread)',marks:20,all:'1'},
  {id:'struct',name:'Structure and organisation',marks:10,all:''},
  {id:'src',name:'Use of sources',marks:5,all:''},
  {id:'pm',name:'Project management appendices',marks:5,all:''}
 ],
 topics:[
  {id:'tp1',title:'Project description and problem'},{id:'tp2',title:'Methodology'},{id:'tp3',title:'Justification of the recommendation'},
  {id:'tp4',title:'Ethics'},{id:'tp5',title:'Australian standards'},{id:'tp6',title:'Safety in Design'},{id:'tp7',title:'Risk management'},
  {id:'tp8',title:'Human factors engineering'},{id:'tp9',title:'Sustainability'},{id:'tp10',title:'Risk assessment and management'},{id:'tp11',title:'Limitations of the approach'}
 ],
 weeks:[
  {id:'R',title:'Recess, 28 Sep to 4 Oct'},{id:'10',title:'Week 10, 5 to 9 Oct: drafts complete'},
  {id:'11',title:'Week 11, 12 to 16 Oct: quality assurance and contribution evidence'},{id:'12',title:'Week 12, 19 to 23 Oct: freeze, polish, submit the report'},
  {id:'13',title:'Week 13, 26 to 27 Oct: final presentation'}
 ],
 deadlines:[
  {id:'d1',date:'2026-10-09',time:'23:55',label:'Milestone 3: minutes for weeks 7 to 9',note:'One combined document. If missing, the report loses 10%.'},
  {id:'d2',date:'2026-10-09',time:'23:59',label:'All report drafts complete',note:'Week 10 target in the subject plan.'},
  {id:'d3',date:'2026-10-16',time:'23:59',label:'Cross-editing done',note:'Every section edited by someone who did not write it.'},
  {id:'d4',date:'2026-10-19',time:'09:00',label:'Content freeze',note:'Edits only, no new content.'},
  {id:'d5',date:'2026-10-22',time:'20:00',label:'Internal report submission',note:'One day of slack.'},
  {id:'d6',date:'2026-10-23',time:'23:30',label:'Final report due',note:'30% of the subject. Late penalty: outline says 5% a day, the brief slides say 20%. Confirm on Moodle.'},
  {id:'d7',date:'2026-10-26',time:'20:00',label:'Final slides ready to upload',note:'Moodle cut-off is 11:30pm Tuesday. Project manager uploads.'},
  {id:'d8',date:'2026-10-27',time:'15:30',label:'Final presentation',note:'Tuesday tutorial. 10% of the subject.'}
 ],
 risks:[
  {id:'r1',title:'Report reads as several authors',impact:'High',likelihood:'High',note:'Language and presentation is 20 marks and asks for a single voice. Chief Editor does two full passes and keeps a short style sheet.'},
  {id:'r2',title:'A section has no independent editor',impact:'High',likelihood:'Medium',note:'The brief requires every section to show who wrote it and who edited it. The Report page flags missing or identical names.'},
  {id:'r3',title:'AI-derived content or references not verified',impact:'High',likelihood:'Medium',note:'Every AI-derived claim needs a traditional source. Check each reference exists. Fill in the digital tool acknowledgment.'},
  {id:'r4',title:'Solution is not shown to be the best',impact:'High',likelihood:'Medium',note:'Quality of solution is 30 marks. Evaluation tables must compare options on cost and other metrics (NPV, ROI, payback).'},
  {id:'r5',title:'A teammate under-contributes',impact:'High',likelihood:'Medium',note:'Marks scale by each person\'s contribution factor. Weekly ledger entries and a Tuesday check-in make it visible early.'},
  {id:'r6',title:'Late submission',impact:'High',likelihood:'Low',note:'Internal target is Thu 22 Oct 8pm, one day before the deadline.'},
  {id:'r7',title:'Sections overrun page limits',impact:'Medium',likelihood:'High',note:'Page budgets are on the Report page. Trim at the Wk 11 edit, not on submission night.'},
  {id:'r8',title:'System assumptions have no source',impact:'Medium',likelihood:'Medium',note:'The assumptions table needs a source for each item. Link papers to sections in the Library.'},
  {id:'r9',title:'Meeting time slips after daylight saving starts (4 Oct)',impact:'Low',likelihood:'Medium',note:'Confirm the Tuesday 21:00 time in the group chat in the week of 5 Oct.'},
  {id:'r10',title:'Leader overload (Team Leader and Chief Editor)',impact:'Medium',likelihood:'Medium',note:'Delegate first-pass edits to the section editors. Keep Long\'s own writing to the executive summary, system integration and conclusion.'}
 ],
 plantext:[
  {id:'p1',title:'Purpose',body:'Deliver a final report (30%), a final presentation (10%) and evidence of individual contribution (15%) that answer The AM Network\'s brief on applying AI within a mining operation in a Papua New Guinea context. Target for every member: High Distinction.'},
  {id:'p2',title:'Project overview',body:'Six members, six business functions: Project Delivery (Long), Mine Planning (Anisha), Mine Operations (Manoj), Processing (Santosh), Asset Management (Yupeng), Health, Safety and Community (Aryaman). Each specialist owns the evidence for their function. Long leads and is Chief Editor.\n\nThis hub holds structure, sources, tasks and evidence. Drafting and editing happen in Word on OneDrive.'},
  {id:'p3',title:'Policies',body:'Team Charter V1_2 and Rules of Engagement V1_2 apply.\n\nAI may support research, structure and language. It may not produce final engineering decisions, calculations, evaluations, references or conclusions without verification, and anything AI-derived needs a traditional source. All tools used go in the digital tool acknowledgment.\n\nFiles are named TX_DocumentName_VX_X. Submissions follow Marston_Tuesday_1530_Team3_descriptor. Actions are numbered Year-Meeting-Action, for example 2026-5-3.'},
  {id:'p4',title:'Project objectives',body:'1. Cover every body section (1 to 9), conclusion, references, tool acknowledgment and appendices to the page limits.\n2. Show clearly why the recommended solution beats the alternatives, on cost and other named metrics.\n3. Every section written by one person and edited by another, with both named.\n4. One voice across the whole report.\n5. Contribution logged weekly by every member, so the evidence is real and the ratings fair.'},
  {id:'p5',title:'Scope',body:'In: final report, final presentation, Milestone 3 minutes, contribution evidence.\n\nOut: client contact beyond what the tutor arranges, and any document formatting that Word does better than this hub.'},
  {id:'p6',title:'Estimated timeframe',body:'1 Oct to 27 Oct 2026.\n\nRecess (to 4 Oct): outline locked and owners set. Week 10: drafts complete. Week 11: cross-editing and quality assurance. Week 12: freeze, single-voice passes, appendices, submit by Fri 23 Oct 11:30pm. Week 13: final presentation Tue 27 Oct.'},
  {id:'p7',title:'Communications',body:'Weekly team meeting Tuesday 21:00 (AEST) on Zoom. Long chairs, the note-taker rotates, agenda before and minutes after. Check the time after daylight saving starts on 4 Oct.\n\nDay-to-day in the team chat. Status lives in this hub. Questions on marking go to tutor Kevin Marston.'},
  {id:'p8',title:'Supporting stakeholders',body:'Industry host: The AM Network. Tutor: Kevin Marston. Subject coordinator: Dr Nidhal Odeh. UOW Library and Learning Co-op for referencing and writing help.'},
  {id:'p9',title:'Change management',body:'A change to scope, structure, owners or dates is raised at the Tuesday meeting or in the chat, recorded in the minutes with an action number, and then updated here by Long. Anything that departs from the agreed team roles is written up for the appendix on actual contribution.'},
  {id:'p10',title:'Future direction',body:'After submission: export a backup from this hub, write the reflection, and keep the section structure as a template for the next team project.'}
 ]
};
const DEFLISTS={
 functions:['Project Delivery','Mine Planning','Mine Operations','Processing','Asset Management','Health, Safety and Community','All'],
 kinds:['Workshop','Tutorial','Team meeting','Research','Report writing','Editing','Diagram or design','Presentation','Admin or PM','Other'],
 types:['Paper','Standard','Report','Web','Case study']
};
const DEFPROJ={team:'Team 3',client:'The AM Network',topic:'AI in a mining operation'};
const ST=[['todo','Not started'],['outline','Outline agreed'],['draft','Drafting'],['written','Draft done'],['reviewed','Reviewed'],['edited','Edited'],['proofed','Proofread'],['final','Final']];
const STI=Object.fromEntries(ST.map((s,i)=>[s[0],i]));
const stLabel=k=>(ST.find(s=>s[0]===k)||[0,k])[1];
const TST=[['todo','To do'],['doing','Doing'],['done','Done']];
const LEVELS=[['Low','Low'],['Medium','Medium'],['High','High']];

const APPROACH=[['single','One person writes the whole report'],['sections','Everybody writes a section, sections are compiled'],['coop','Cooperative: shared planning, writing and reviewing']];
const MODES=[['','Written in tandem'],['scaffold','Scaffolded: needs other sections first']];
const DEFBRIEF={
 purpose:'Persuade The AM Network that our AI design is the best option for a mining operation in a Papua New Guinea context, with evidence on cost and other metrics.',
 audience:'The AM Network as client, and the markers: tutor Kevin Marston and the subject coordinator.',
 knows:'',usage:'',effect:'',approach:'coop',
 approachNote:'Each specialist drafts the section for their own function. Someone else reviews and a different person edits. Long runs the single-voice pass.'
};
/* Team writing roles, review and feedback guidance, and the stage-by-stage workflow follow the Week 10 workshop (Professional Communications and Engineering Workplace Practice). */
DEF.roles=[
 {id:'writer',name:'Researcher/Writer',about:'Researches and drafts sections on behalf of the team.',hint:'All team members have this role.',all:true,who:[]},
 {id:'reviewer',name:'Reviewer',about:'Discusses the outline and draft with the writer and how it can be improved. Reviews finished sections on behalf of the team.',hint:'All team members have this role.',all:true,who:[]},
 {id:'editor',name:'Editor',about:'Improves style, ensures uniformity (a single voice) and corrects language errors.',hint:'Team members with strong writing skills.',all:false,who:['long']},
 {id:'proofreader',name:'Proofreader',about:'Checks with great care for typos, section numbering, references and so on.',hint:'Team members with good attention to detail.',all:false,who:[]},
 {id:'publisher',name:'Publisher',about:'Makes sure the finished report is consistent in layout, has well-presented visuals (images, graphs, tables) and looks professional.',hint:'A team member with good design skills or an aesthetic sense.',all:false,who:[]}
];
DEF.flow=[
 {id:'f1',title:'1. Plan',role:'',st:'',when:'Now to the end of recess',steps:['Agree the purpose, audience, what they know and how they will use the report (Brief)','Choose the team writing approach','Mark each section as written in tandem or scaffolded (needs other sections first)','Set the task schedule on the Plan tab']},
 {id:'f2',title:'2. Outline',role:'writer',st:'outline',when:'Before drafting',steps:['A short descriptive outline for every section and subsection','A page or word limit on every section so no one writes too much','Refine the outline until everyone agrees the content','Agree who researches and writes the first draft of each section','Everyone understands how their section relates to the others','Assign the five team writing roles']},
 {id:'f3',title:'3. Research and draft',role:'writer',st:'written',when:'Week 10',steps:['First draft in Word on OneDrive, linked on the Report tab','Every source logged in the Library and linked to this section','Size is inside the limit']},
 {id:'f4',title:'4. Review',role:'reviewer',st:'reviewed',when:'Week 11',steps:['Reviewer discusses the outline and draft with the writer','Review checklist completed (Workflow, Review tab)','Feedback agreed. A disagreement that cannot be settled goes to the whole team']},
 {id:'f5',title:'5. Edit',role:'editor',st:'edited',when:'Week 11 to 12',steps:['Style and terminology uniform across sections','One voice from cover to conclusion','Language errors corrected']},
 {id:'f6',title:'6. Proofread',role:'proofreader',st:'proofed',when:'Week 12',steps:['Typos checked','Section, figure and table numbering checked','In-text citations match the reference list']},
 {id:'f7',title:'7. Publish',role:'publisher',st:'final',when:'Before the internal submission',steps:['Layout consistent throughout','Images, graphs and tables well presented and captioned','Contents, figure and table lists regenerated','Digital tool acknowledgment complete','Uploaded to Moodle with the agreed file name']}
];
DEF.guide=[
 {id:'rv1',group:'review',text:'Do I understand what the text is trying to say?'},
 {id:'rv2',group:'review',text:'Does the purpose and topic of the section align with the agreed outline?'},
 {id:'rv3',group:'review',text:'Are the purpose and topic of the section clear to the reader?'},
 {id:'rv4',group:'review',text:'Are the subsection headings meaningful and appropriate?'},
 {id:'rv5',group:'review',text:'Are the purpose and topic of each paragraph clear?'},
 {id:'rv6',group:'review',text:'Are the paragraphs logically connected?'},
 {id:'rv7',group:'review',text:'Is there evidence of adequate research to support statements (referencing)?'},
 {id:'gv1',group:'give',text:'If you are unsure what the writer meant, ask them to explain it out loud.'},
 {id:'gv2',group:'give',text:'Start by acknowledging what was good, then move to corrections.'},
 {id:'gv3',group:'give',text:'Only negative feedback makes people defensive and hurts motivation.'},
 {id:'gv4',group:'give',text:'Do not tell them how to fix it. Ask what would improve it, or offer a suggestion: "Do you think implement might be a better word here?"'},
 {id:'gv5',group:'give',text:'Give feedback when you are in the right mood. Do not be harsh.'},
 {id:'rc1',group:'receive',text:'Corrective feedback is meant to improve the report, not to criticise you.'},
 {id:'rc2',group:'receive',text:'Feedback can lead to innovation and learning.'},
 {id:'rc3',group:'receive',text:'Give all feedback serious consideration. Take time to think before rejecting it.'},
 {id:'rc4',group:'receive',text:'If you disagree, try to reach agreement with the reviewer. If you cannot, take the section to the whole group. It is a team assignment.'},
 {id:'ai1',group:'aido',text:'Research leads: find things to read, then cite the traditional source.'},
 {id:'ai2',group:'aido',text:'Structure: suggest outlines and headings to compare with the brief.'},
 {id:'ai3',group:'aido',text:'Language: tighten sentences, fix grammar, check the tone for a single voice.'},
 {id:'ai4',group:'aido',text:'Feedback: summarise reviewer comments and spot gaps against the checklist.'},
 {id:'an1',group:'aidont',text:'Final engineering decisions, calculations or evaluations without verification.'},
 {id:'an2',group:'aidont',text:'References or quotes you have not opened and checked.'},
 {id:'an3',group:'aidont',text:'Writing the conclusion or recommendation for you.'},
 {id:'an4',group:'aidont',text:'Using a tool without listing it in the digital tool acknowledgment.'}
];
const GROUPS=[['review','Reviewer checklist: when reviewing, consider'],['give','Giving feedback'],['receive','Receiving feedback'],['aido','AI can support'],['aidont','AI should not be used for']];
