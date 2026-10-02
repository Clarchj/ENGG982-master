'use strict';
/* ---------- text export (plain text for chat and email) ---------- */
const bar_=n=>'='.repeat(n||64);
function hd(title){const P=proj();return title.toUpperCase()+'\n'+[P.team,P.client,P.topic].filter(Boolean).join(' | ')+'\nExported '+new Date().toLocaleString('en-AU',{timeZone:TZ,weekday:'short',day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit',hour12:true})+'\n'+bar_()+'\n';}
const sc=t=>'\n'+t.toUpperCase()+'\n'+'-'.repeat(t.length)+'\n';
const tmark={todo:'[ ]',doing:'[~]',done:'[x]'};
const taskLine=(t,full)=>`${tmark[t.status||'todo']} ${t.title}${t.owner?' ('+pn(t.owner)+')':''}${t.due?' - due '+fmtD(t.due):''}${full&&t.wk?' - week '+t.wk:''}${t.note?'\n      '+t.note:''}\n`;
function tDash(){
  let o=hd('Dashboard');
  o+=sc('Next deadlines');const up=deadlines().filter(d=>d.t>Date.now());
  o+=up.length?up.map(d=>`- ${fmtDT(d.t)}  ${d.label}  (in ${until(d.t)})${d.note?'\n    '+d.note:''}\n`).join(''):'None.\n';
  const cnt=Object.fromEntries(ST.map(s=>[s[0],0]));SECS().forEach(s=>{cnt[secStat(s.id)]++;});
  o+=sc('Report status');ST.forEach(([k,l])=>{o+=`${l}: ${cnt[k]}\n`;});o+=`Edited or later: ${readyCount()} of ${SECS().length} sections\n`;
  o+=sc('Rubric readiness');CRIT().forEach(c=>{const x=critReady(c);o+=`${c.name} (${c.marks} marks): ${x.r} of ${x.n} sections edited\n`;});
  o+=sc('Needs attention');const fl=allFlags();o+=fl.length?fl.map(f=>`- ${f.t}\n`).join(''):'Nothing flagged.\n';
  o+=sc('Tasks due within 7 days or late');const soon=arr('tasks').filter(t=>t.status!=='done'&&t.due&&daysTo(t.due)<=7).sort((a,b)=>a.due.localeCompare(b.due));
  o+=soon.length?soon.map(t=>taskLine(t)).join(''):'None.\n';
  return ['Dashboard',o];
}
function tReport(){
  let o=hd('Report map');const n=readyCount();
  o+=`Sections edited or final: ${n} of ${SECS().length}\n`+sc('Sections');
  SECS().forEach(s=>{const r=D.sections[s.id]||{};const fl=secFlags(s).map(f=>f[1]).join('; ');const size=r.size!==''&&r.size!=null?`${r.size} ${s.unit||''}`.trim():'';
    o+=`${s.no?s.no+'. ':''}${s.name} [${stLabel(r.status||'todo')}]${s.mode==='scaffold'?' (scaffolded)':''}\n   Writer: ${pn(r.writer)||'-'} | Reviewer: ${pn(r.reviewer)||'-'} | Editor: ${pn(r.editor)||'-'} | Proofreader: ${pn(r.proofreader)||'-'}${s.lim?' | Limit: '+s.lim:''}${size?' | Now: '+size:''}\n`;
    if(s.outline)o+=`   Outline: ${s.outline.replace(/\n/g,'\n            ')}\n`;
    if(r.link)o+=`   Doc: ${r.link}\n`;if(fl)o+=`   Flags: ${fl}\n`;if(r.note)o+=`   Note: ${r.note}\n`;});
  const cov=D.meta.coverage||{};o+=sc('Required content coverage');
  TOPICS().forEach(t=>{const v=cov[t.id]||{};o+=`${v.done?'[x]':'[ ]'} ${t.title}${v.sec?' -> '+secName(v.sec):''}\n`;});
  return ['Report map',o];
}
function tLib(){
  if(S.sub.lib==='ideas'){let o=hd('Ideas and subtopics');const its=arr('ideas');
    IDEA_COLS.forEach(([k,l])=>{const a=its.filter(i=>(i.status||'idea')===k);o+=sc(l+' ('+a.length+')');o+=a.length?a.map(i=>`- ${i.title}${i.fn?' ['+i.fn+']':''}${i.owner?' ('+pn(i.owner)+')':''}${i.supports?' -> '+secName(i.supports):''}${i.note?'\n    '+i.note:''}\n`).join(''):'None.\n';});
    return ['Ideas and subtopics',o];}
  let o=hd('Sources');const list=papersList();o+=`${list.length} sources\n`+sc('List');
  o+=list.length?list.map(p=>`- ${p.title}\n    ${[p.authors,p.year,p.venue].filter(Boolean).join(', ')}\n    ${[p.type,p.fn,PAPER_ST[p.st]||'To read'].filter(Boolean).join(' | ')}${p.supports?' | supports '+secName(p.supports):' | NOT LINKED TO A SECTION'}\n${p.tag?'    Tags: '+p.tag+'\n':''}${p.finding?'    Finding: '+p.finding+'\n':''}${p.url?'    Link: '+p.url+'\n':''}`).join(''):'None.\n';
  return ['Sources',o];
}
function tTeam(){
  const sub=S.sub.team;
  if(sub==='ledger'){let o=hd('Contribution ledger');const l=ledgerList();o+=sc(l.length+' entries');o+=l.length?l.map(c=>`${c.date}  ${pn(c.person)}  [${c.kind||''}]  ${c.what||''}${c.section?' ('+secName(c.section)+')':''}${c.proof?'\n    Proof: '+c.proof:''}\n`).join(''):'None.\n';return ['Contribution ledger',o];}
  if(sub==='roster'){let o=hd('Roster');people().forEach(p=>{const x=rosterStats(p);o+=`\n${p.name}${p.short&&p.short!==p.name?' ('+p.short+')':''}\n   ${[p.role,p.disc,p.fn].filter(Boolean).join(' | ')}\n   Open tasks ${x.ot}, done ${x.dt} | Workshop contributions ${x.ws}/3 | Tutorial contributions ${x.tu}/4 | Last logged ${x.last?fmtD(x.last):'never'}\n`;});return ['Roster',o];}
  let o=hd('Tasks');const l=tasksList();o+=sc(l.length+' tasks');o+=l.length?l.map(t=>taskLine(t,true)).join(''):'None.\n';return ['Tasks',o];
}
function tPres(){
  const deck=S.sub.pres,rows=slidesList(deck),tot=rows.reduce((a,s)=>a+(Number(s.min)||0),0),{budget,cut}=presBudget(deck);
  const t=deck==='reflect'?'Reflection talk (individual)':'Final team presentation';let o=hd(t);
  o+=`Total ${tot} min${budget!=null?' of '+budget:''}${cut!=null?' (cut-off '+cut+')':''}\n`+sc('Slides');
  o+=rows.length?rows.map(s=>`${s.n}. ${s.title} (${s.min!==''&&s.min!=null?s.min:'?'} min) [${s.status||'todo'}]${s.who?' - '+pn(s.who):''}${s.section?' - '+secName(s.section):''}${s.asset?'\n    Needs: '+s.asset:''}\n`).join(''):'None.\n';
  return [t,o];
}
function tPlan(){
  let o=hd('Project plan');
  PLAN().forEach(p=>{o+=sc(p.title)+p.body+'\n';});
  o+=sc('Milestone chart')+deadlines().map(d=>`- ${fmtDT(d.t)}  ${d.label}${d.note?'\n    '+d.note:''}\n`).join('');
  o+=sc('Work plan by week');const tasks=arr('tasks'),wl=WEEKS();
  wl.forEach(w=>{const ts=tasks.filter(t=>t.wk===w.id).sort((a,b)=>(a.due||'').localeCompare(b.due||''));o+=`\n${w.title} (${ts.filter(t=>t.status==='done').length}/${ts.length} done)\n`;o+=ts.length?ts.map(t=>'  '+taskLine(t)).join(''):'  No tasks.\n';});
  const orph=tasks.filter(t=>!wl.some(w=>w.id===t.wk));if(orph.length){o+='\nNot in a listed week\n'+orph.map(t=>'  '+taskLine(t)).join('');}
  o+=sc('Risk management')+RISKS().map(r=>`- ${r.title}\n    Impact: ${r.impact} | Likelihood: ${r.likelihood}\n    ${r.note}\n`).join('');
  return ['Project plan',o];
}
function tInbox(){let o=hd('Inbox');const l=arr('inbox').sort((a,b)=>String(b.at).localeCompare(String(a.at)));o+=sc(l.length+' items');o+=l.length?l.map(i=>`- ${i.text} (${String(i.at||'').slice(0,10)})\n`).join(''):'Empty.\n';return ['Inbox',o];}
function tSetup(){
  const P=proj();let o=hd('Setup');o+=sc('Project')+`Team: ${P.team}\nClient: ${P.client}\nTopic: ${P.topic}\n`;
  [['functions','Business functions'],['kinds','Contribution types'],['types','Source types']].forEach(([k,t])=>{o+=sc(t)+L(k).map(x=>'- '+x+'\n').join('');});
  o+=sc('Rubric criteria')+CRIT().map(c=>`- ${c.name}: ${c.marks} marks (${c.all?'every section':'ticked sections'})\n`).join('');
  o+=sc('Required topics')+TOPICS().map(t=>'- '+t.title+'\n').join('');o+=sc('Weeks')+WEEKS().map(w=>`- ${w.id}: ${w.title}\n`).join('');
  return ['Setup',o];
}
function tFlow(){
  const sub=S.sub.flow;
  if(sub==='roles'){let o=hd('Team writing roles');
    ROLES().forEach(r=>{o+=`\n${r.name}: ${r.all?'everyone':((r.who||[]).map(pn).join(', ')||'no one chosen yet')}\n   ${r.about}\n`;});
    o+=sc('Sections held (writes / reviews / edits / proofreads)');people().forEach(p=>{const x=load(p.id);o+=`${p.short||p.name}: ${x.writer} / ${x.reviewer} / ${x.editor} / ${x.proofreader}\n`;});return ['Team writing roles',o];}
  if(sub==='review'){let o=hd('Review and feedback');const id=rvSec(),r=D.sections[id]||{};
    if(id){o+=sc('Section under review: '+secName(id))+`Writer: ${pn(r.writer)||'-'} | Reviewer: ${pn(r.reviewer)||'-'}\n`;
      GUIDE('review').forEach(i=>{o+=`${(r.rv||{})[i.id]?'[x]':'[ ]'} ${i.text}\n`;});if(r.fb)o+='\nFeedback:\n'+r.fb+'\n';}
    ['give','receive'].forEach(g=>{o+=sc((GROUPS.find(x=>x[0]===g)||[0,g])[1])+GUIDE(g).map(i=>'- '+i.text+'\n').join('');});return ['Review and feedback',o];}
  if(sub==='ai'){let o=hd('AI use');['aido','aidont'].forEach(g=>{o+=sc((GROUPS.find(x=>x[0]===g)||[0,g])[1])+GUIDE(g).map(i=>'- '+i.text+'\n').join('');});return ['AI use',o];}
  const B=brief(),ap=APPROACH.find(a=>a[0]===B.approach),done=D.meta.flowDone||{};let o=hd('Workflow');
  o+=sc('Report brief')+`Purpose: ${B.purpose||'-'}\nAudience: ${B.audience||'-'}\nWhat they know: ${B.knows||'-'}\nHow they will use it: ${B.usage||'-'}\nEffect on the writing: ${B.effect||'-'}\nApproach: ${ap?ap[1]:'-'}${B.approachNote?'\n   '+B.approachNote:''}\n`;
  FLOW().forEach(f=>{const role=(ROLES().find(r=>r.id===f.role)||{}).name;o+=sc(f.title)+[role,f.when].filter(Boolean).join(' | ')+'\n';(f.steps||[]).forEach((t,i)=>{o+=`${done[f.id+':'+i]?'[x]':'[ ]'} ${t}\n`;});});
  return ['Workflow',o];
}
let LASTTXT=null;
function showText(title,text){
  LASTTXT={title,text};FORM={fields:[],onSave:()=>{}};
  $('#modal').innerHTML=`<div class="scrim" data-act="close"></div><div class="sheet"><h3>${esc(title)}: plain text</h3><textarea id="reftext" class="big" readonly>${esc(text)}</textarea><div class="row end"><button class="btn" data-act="close">Close</button><button class="btn" data-act="save-txt">Save .txt</button><button class="btn pri" data-act="copy">Copy</button></div></div>`;
  $('#modal').hidden=false;
}
function exportTab(){const f={dash:tDash,flow:tFlow,report:tReport,lib:tLib,team:tTeam,pres:tPres,plan:tPlan,inbox:tInbox,setup:tSetup}[S.view]||tDash;const r=f();showText(r[0],r[1]);}
async function saveFile(name,text,type){
  let dl=null;try{dl=window.claude?await window.claude.use('downloads'):null;}catch(e){}
  if(dl){try{await dl.save({filename:name,data:text});toast('Saved');}catch(e){if(!e||e.code!=='declined')toast('Could not save. Use Copy instead.');}return;}
  try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:type||'text/plain'}));a.download=name;document.body.appendChild(a);a.click();a.remove();toast('Saved to Downloads');}catch(e){toast('Could not save. Use Copy instead.');}
}
