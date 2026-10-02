'use strict';
/* ---------- views ---------- */
const TABS=[['dash','Dashboard'],['flow','Workflow'],['report','Report'],['lib','Library'],['team','Team'],['pres','Presentation'],['plan','Plan'],['inbox','Inbox'],['setup','Setup']];
const subnav=(k,a)=>`<div class="sub">${a.map(i=>`<button type="button" data-sub="${k}:${i[0]}" class="${S.sub[k]===i[0]?'on':''}">${i[1]}</button>`).join('')}</div>`;
const head=(t,lead)=>`<div class="phead"><h2>${esc(t)}</h2><span class="grow"></span><button class="btn" type="button" data-act="export">Export text</button></div><p class="lead">${esc(lead||'')}</p>`;
const shead=(t,btns)=>`<div class="shead"><h2 class="s2">${esc(t)}</h2><span class="grow"></span>${btns||''}</div>`;

function vDash(){
  const up=deadlines().filter(d=>d.t>Date.now()).slice(0,4);
  const dl=up.map((d,i)=>`<div class="dl${i===0?' first':''}"><div class="dl-t">${until(d.t)}</div><div><b>${esc(d.label)}</b><small>${esc(fmtDT(d.t))}. ${esc(d.note)}</small></div></div>`).join('')||'<div class="empty">No upcoming deadlines. Add some on the Plan tab.</div>';
  const cnt=Object.fromEntries(ST.map(s=>[s[0],0]));SECS().forEach(s=>{cnt[secStat(s.id)]++;});
  const ready=readyCount();
  const stack=ST.map(([k,l])=>cnt[k]?`<i class="seg-${k}" style="flex:${cnt[k]}" title="${esc(l)}: ${cnt[k]}"></i>`:'').join('');
  const legend=ST.map(([k,l])=>`<span><i class="seg-${k}"></i>${esc(l)} ${cnt[k]}</span>`).join('');
  const crit=CRIT().map(c=>{const x=critReady(c);return `<div><div class="kv"><span>${esc(c.name)}</span><span class="mono">${esc(c.marks)} marks</span></div><div class="meter" title="${x.r} of ${x.n} sections edited"><i style="width:${x.pc}%"></i></div></div>`;}).join('');
  const fl=allFlags();
  const flh=fl.slice(0,9).map(f=>`<div class="flag">${pill(f.l,f.l==='bad'?'Fix':'Check')}<span>${esc(f.t)}</span></div>`).join('')+(fl.length>9?`<small>and ${fl.length-9} more</small>`:'');
  const soon=arr('tasks').filter(t=>t.status!=='done'&&t.due&&daysTo(t.due)<=7).sort((a,b)=>a.due.localeCompare(b.due)).slice(0,8);
  const th=soon.map(t=>{const n=daysTo(t.due);return `<tr><td>${esc(t.title)}</td><td>${esc(pn(t.owner)||'—')}</td><td>${n<0?pill('bad',-n+'d late'):pill(n<=2?'warn':'',fmtD(t.due))}</td></tr>`;}).join('');
  return `${head('Dashboard','Everything here serves three outputs: the final report, the final presentation and your contribution evidence.')}
  <div class="grid sec">
    <div class="card"><h3>Next deadlines</h3>${dl}</div>
    <div class="card"><h3>Report: ${ready} of ${SECS().length} sections edited</h3><div class="stack">${stack}</div><div class="legend">${legend}</div>
      <h3 style="margin-top:16px">Readiness against the marking rubric</h3><div style="display:grid;gap:8px">${crit}</div></div>
  </div>
  <div class="grid sec">
    <div class="card"><h3>Needs attention (${fl.length})</h3>${flh||'<div class="empty">Nothing flagged.</div>'}</div>
    <div class="card"><h3>Tasks due within 7 days or late</h3>${th?`<div class="tw" style="border:0"><table style="min-width:0"><tbody>${th}</tbody></table></div>`:'<div class="empty">Nothing due this week.</div>'}</div>
  </div>`;
}

function vReport(){
  const rows=SECS().map(s=>{
    const r=D.sections[s.id]||{};const fl=secFlags(s).map(f=>pill(f[0],f[1])).join('');
    const size=r.size!==''&&r.size!=null?`${r.size} ${s.unit||''}`:'';
    const sel=(k,lbl)=>`<td><select class="s" data-chg="sec-${k}" data-id="${esc(s.id)}" aria-label="${lbl} of ${esc(s.name)}">${opts(pArr(),r[k])}</select></td>`;
    return `<tr><td class="nm"><b>${esc((s.no?s.no+'  ':'')+s.name)}</b>${s.mode==='scaffold'?pill('acc','scaffolded'):''}<small>${esc(s.outline||s.ev)}</small></td><td class="mono">${esc(s.lim)}</td>
      <td><select class="s" data-chg="sec-status" data-id="${esc(s.id)}" aria-label="Status of ${esc(s.name)}">${opts(ST,r.status||'todo')}</select></td>
      ${sel('writer','Writer')}${sel('reviewer','Reviewer')}${sel('editor','Editor')}${sel('proofreader','Proofreader')}
      <td class="num mono">${esc(size)}</td><td>${linkOf(r.link)}</td><td>${fl}</td>
      <td><button class="btn sm" data-act="edit-sec" data-id="${esc(s.id)}">Edit</button></td></tr>`;}).join('');
  const cov=D.meta.coverage||{};
  const ch=TOPICS().map(t=>{const v=cov[t.id]||{};
    return `<tr><td><label class="chk"><input type="checkbox" data-chg="cov-done" data-k="${esc(t.id)}"${v.done?' checked':''}>${esc(t.title)}</label></td><td><select class="s" data-chg="cov-sec" data-k="${esc(t.id)}" aria-label="Where ${esc(t.title)} is covered">${opts(sArr(),v.sec)}</select></td></tr>`;}).join('');
  return `${head('Report map','Structure only. Write in Word on OneDrive, then link each section here. A section needs a writer, and a different reviewer and editor.')}
  <div class="bar"><button class="btn pri" data-act="add-sec">Add section</button></div>
  <div class="tw sec"><table style="min-width:1080px"><thead><tr><th>Section</th><th>Limit</th><th>Status</th><th>Writer</th><th>Reviewer</th><th>Editor</th><th>Proofreader</th><th class="num">Size now</th><th>Doc</th><th>Flags</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
  ${shead('Required content coverage','')}<p class="lead" style="margin-top:0">Tick each topic once it is properly argued for this client, and say where. Edit the topic list in Setup.</p>
  <div class="tw sec"><table style="min-width:520px"><thead><tr><th>Topic</th><th>Covered in</th></tr></thead><tbody>${ch}</tbody></table></div>`;
}

/* ---------- Workflow: the Week 10 team writing process ---------- */
function vFlow(){
  const sub=S.sub.flow;
  const body=sub==='roles'?vRoles():sub==='review'?vReview():sub==='ai'?vAI():vProcess();
  return `${head('Workflow','Plan, outline, draft, review, edit, proofread, publish. The writing happens in Word on OneDrive. This tab says who does what, and what is left.')}${subnav('flow',[['process','Process'],['roles','Roles'],['review','Review and feedback'],['ai','AI use']])}${body}`;
}
function vProcess(){
  const B=brief(),ap=APPROACH.find(a=>a[0]===B.approach);
  const q=(l,k)=>`<div><h3>${l}</h3><p style="margin:0">${B[k]?esc(B[k]):'<span class="muted">Not answered yet. Discuss it at the next meeting.</span>'}</p></div>`;
  const done=D.meta.flowDone||{};
  const stages=FLOW().map(f=>{
    const role=(ROLES().find(r=>r.id===f.role)||{}).name||'';
    const reached=f.st?SECS().filter(s=>STI[secStat(s.id)]>=STI[f.st]).length:null;
    const steps=(f.steps||[]).map((t,i)=>`<label class="chk"><input type="checkbox" data-chg="flow-step" data-k="${esc(f.id+':'+i)}"${done[f.id+':'+i]?' checked':''}>${esc(t)}</label>`).join('');
    const n=(f.steps||[]).filter((t,i)=>done[f.id+':'+i]).length;
    return `<div class="card"><div class="row"><b>${esc(f.title)}</b><span class="grow"></span><button class="btn sm" data-act="edit-flow" data-id="${esc(f.id)}">Edit</button></div>
      <small>${esc([role,f.when].filter(Boolean).join(' · '))}</small>
      ${reached!=null?`<div class="kv" style="margin-top:6px"><span>Sections at this stage or later</span><span class="mono">${reached} / ${SECS().length}</span></div><div class="meter"><i style="width:${SECS().length?100*reached/SECS().length:0}%"></i></div>`:''}
      <div class="steps">${steps}</div><small>${n} of ${(f.steps||[]).length} steps ticked</small></div>`;}).join('');
  return `${shead('Report brief','<button class="btn pri sm" data-act="edit-brief">Edit</button>')}
   <div class="card sec"><div class="lists">${q('Purpose','purpose')}${q('Audience','audience')}${q('How much they know','knows')}${q('How they will use the report','usage')}${q('How that changes the writing','effect')}</div>
   <h3 style="margin-top:14px">Team writing approach</h3><p style="margin:0">${pill('acc',ap?ap[1]:'Not chosen')} ${esc(B.approachNote||'')}</p></div>
   ${shead('Stages','<button class="btn pri sm" data-act="add-flow">Add stage</button>')}<div class="grid sec">${stages}</div>`;
}
function vRoles(){
  const cards=ROLES().map(r=>{const who=r.all?pill('acc','Everyone'):(r.who||[]).map(id=>pill('good',pn(id))).join('')||pill('warn','No one chosen yet');
    return `<div class="card"><div class="row"><b>${esc(r.name)}</b><span class="grow"></span><button class="btn sm" data-act="edit-role" data-id="${esc(r.id)}">Edit</button></div>
      <p style="margin:6px 0">${esc(r.about)}</p><small>${esc(r.hint||'')}</small><div style="margin-top:8px">${who}</div></div>`;}).join('');
  const rows=people().map(p=>{const x=load(p.id);const pub=(ROLES().find(r=>r.id==='publisher')||{who:[]}).who.includes(p.id);
    return `<tr><td><b>${esc(p.short||p.name)}</b></td><td class="num mono">${x.writer}</td><td class="num mono">${x.reviewer}</td><td class="num mono">${x.editor}</td><td class="num mono">${x.proofreader}</td><td>${pub?pill('good','Publisher'):''}</td></tr>`;}).join('');
  return `${shead('The five team writing roles','<button class="btn pri sm" data-act="add-role">Add role</button>')}<div class="grid sec">${cards}</div>
   ${shead('Who holds how many sections','')}<p class="lead" style="margin-top:0">Counted from the Report tab. Aim for an even spread, and no one reviewing or editing their own writing.</p>
   <div class="tw"><table style="min-width:480px"><thead><tr><th>Person</th><th class="num">Writes</th><th class="num">Reviews</th><th class="num">Edits</th><th class="num">Proofreads</th><th></th></tr></thead><tbody>${rows||'<tr><td colspan="6" class="empty">No team members yet.</td></tr>'}</tbody></table></div>`;
}
function rvSec(){
  if(S.rv&&secBy(S.rv))return S.rv;
  const w=SECS().find(s=>['written','draft'].includes(secStat(s.id)));return (w||SECS()[0]||{}).id||'';
}
function vReview(){
  const id=rvSec(),s=secBy(id),r=D.sections[id]||{},tick=r.rv||{},items=GUIDE('review');
  const n=items.filter(i=>tick[i.id]).length;
  const list=g=>`<div class="card"><div class="row"><h3 style="margin:0">${esc((GROUPS.find(x=>x[0]===g)||[0,g])[1])}</h3><span class="grow"></span><button class="btn sm" data-act="edit-guide" data-g="${g}">Edit list</button></div><ul class="tips">${GUIDE(g).map(i=>`<li>${esc(i.text)}</li>`).join('')}</ul></div>`;
  const chk=s?`<div class="card sec"><div class="row"><b>${esc(secName(id))}</b><span class="grow"></span>${pill('',stLabel(r.status||'todo'))}</div>
    <small>Writer: ${esc(pn(r.writer)||'not set')} · Reviewer: ${esc(pn(r.reviewer)||'not set')}</small>
    <div class="steps">${items.map(i=>`<label class="chk"><input type="checkbox" data-chg="rv-tick" data-k="${esc(i.id)}"${tick[i.id]?' checked':''}>${esc(i.text)}</label>`).join('')}</div>
    <label class="fld"><span>Feedback for the writer. Start with what worked.</span><textarea data-chg="rv-note" rows="3">${esc(r.fb||'')}</textarea></label>
    <div class="row" style="margin-top:8px"><small>${n} of ${items.length} checks done</small><span class="grow"></span>${n===items.length&&items.length&&STI[r.status||'todo']<STI.reviewed?'<button class="btn pri sm" data-act="rv-done">Mark section Reviewed</button>':''}</div></div>`:'<div class="empty">No sections yet.</div>';
  return `<div class="bar"><label class="row">Section under review <select data-chg="rv-sec" aria-label="Section under review">${opts(sArr().slice(1),id)}</select></label></div>${chk}
   <div class="grid sec">${list('give')}${list('receive')}</div>`;
}
function vAI(){
  const list=g=>`<div class="card"><div class="row"><h3 style="margin:0">${esc((GROUPS.find(x=>x[0]===g)||[0,g])[1])}</h3><span class="grow"></span><button class="btn sm" data-act="edit-guide" data-g="${g}">Edit list</button></div><ul class="tips">${GUIDE(g).map(i=>`<li>${esc(i.text)}</li>`).join('')}</ul></div>`;
  return `<p class="lead">The subject lets you use GenAI to support writing. These lists are the team's starting position from the plan policy. Edit them to match what you agree. Anything AI-derived needs a traditional source, and every tool goes in the digital tool acknowledgment.</p>
   <div class="grid">${list('aido')}${list('aidont')}</div>`;
}

function vLib(){
  return `${head('Library','Sources and subtopics. A source earns its place by supporting a section.')}${subnav('lib',[['papers','Papers and sources'],['ideas','Ideas and subtopics']])}${S.sub.lib==='ideas'?vIdeas():vPapers()}`;
}
function vPapers(){
  const f=S.f.papers,list=papersList();
  const rows=list.map(p=>{const fl=[];if(!p.supports)fl.push(pill('warn','no section'));if(p.st==='cited'&&!p.ref)fl.push(pill('bad','no reference text'));
    return `<tr><td class="nm"><b>${esc(p.title)}</b><small>${esc([p.authors,p.year,p.venue].filter(Boolean).join(' · '))}</small>${p.finding?`<small>${esc(p.finding)}</small>`:''}</td>
      <td>${esc(p.fn||'')}${p.tag?`<small>${esc(p.tag)}</small>`:''}</td><td>${esc(p.type||'')}</td><td>${esc(secName(p.supports)||'—')}</td>
      <td>${pill(p.st==='cited'?'good':p.st==='read'?'acc':'',PAPER_ST[p.st]||'To read')}</td><td>${linkOf(p.url)}${fl.join('')}</td>
      <td><button class="btn sm" data-act="edit-paper" data-id="${esc(p.id)}">Edit</button></td></tr>`;}).join('');
  return `<div class="bar"><button class="btn pri" data-act="add-paper">Add source</button>
    <input data-chg="filter" data-g="papers" data-k="q" value="${esc(f.q)}" placeholder="Search, then Enter" aria-label="Search sources">
    <select data-chg="filter" data-g="papers" data-k="fn" aria-label="Business function">${opts([['','All functions'],...L('functions').map(x=>[x,x])],f.fn)}</select>
    <select data-chg="filter" data-g="papers" data-k="st" aria-label="Reading status">${opts([['','Any status'],['toread','To read'],['read','Read'],['cited','Cited']],f.st)}</select>
    <span class="grow"></span><button class="btn" data-act="copy-refs">Reference list</button></div>
  <div class="tw"><table><thead><tr><th>Source</th><th>Function and tags</th><th>Type</th><th>Supports</th><th>Status</th><th>Link</th><th></th></tr></thead><tbody>${rows||`<tr><td colspan="7" class="empty">No sources yet. Add the first one, with the section it supports.</td></tr>`}</tbody></table></div>`;
}
const IDEA_COLS=[['idea','Idea'],['exploring','Exploring'],['adopted','Adopted'],['parked','Parked']];
function vIdeas(){
  const its0=arr('ideas');
  return `<div class="bar"><button class="btn pri" data-act="add-idea">Add idea</button></div><div class="cols">${IDEA_COLS.map(([k,l])=>{
    const its=its0.filter(i=>(i.status||'idea')===k);
    return `<div class="col"><h3>${l} (${its.length})</h3>${its.map(i=>`<div class="idea"><b>${esc(i.title)}</b>${i.note?`<small>${esc(i.note)}</small>`:''}
      <div class="row" style="margin-top:6px">${i.fn?pill('',i.fn):''}${i.supports?pill('acc',secName(i.supports)):''}${i.owner?pill('',pn(i.owner)):''}<span class="grow"></span>
      <select class="s" data-chg="idea-status" data-id="${esc(i.id)}" aria-label="Idea stage">${opts(IDEA_COLS,i.status||'idea')}</select><button class="btn sm" data-act="edit-idea" data-id="${esc(i.id)}">Edit</button></div></div>`).join('')||'<small>Empty</small>'}</div>`;}).join('')}</div>`;
}

function vTeam(){
  const sub=S.sub.team;
  return `${head('Team','Tasks keep the report moving. The ledger is your proof of contribution. A 6 credit point subject means at least 12 hours of work a week.')}${subnav('team',[['tasks','Tasks'],['ledger','Contribution ledger'],['roster','Roster']])}${sub==='ledger'?vLedger():sub==='roster'?vRoster():vTasks()}`;
}
function vTasks(){
  const f=S.f.tasks;
  const rows=tasksList().map(t=>{const n=t.due?daysTo(t.due):null;const late=t.status!=='done'&&n!=null&&n<0;
    return `<tr><td class="nm"><b>${esc(t.title)}</b>${t.note?`<small>${esc(t.note)}</small>`:''}</td>
      <td><select class="s" data-chg="task-owner" data-id="${esc(t.id)}" aria-label="Owner">${opts(pArr(),t.owner)}</select></td><td>${t.due?(late?pill('bad',fmtD(t.due)):esc(fmtD(t.due))):''}</td>
      <td class="mono">${esc(t.wk||'')}</td><td>${esc(secName(t.section)||'')}</td>
      <td><select class="s" data-chg="task-status" data-id="${esc(t.id)}" aria-label="Task status">${opts(TST,t.status||'todo')}</select></td><td><button class="btn sm" data-act="edit-task" data-id="${esc(t.id)}">Edit</button></td></tr>`;}).join('');
  return `<div class="bar"><button class="btn pri" data-act="add-task">Add task</button>
   <select data-chg="filter" data-g="tasks" data-k="owner" aria-label="Owner">${opts([['','Everyone'],...pArr().slice(1)],f.owner)}</select>
   <select data-chg="filter" data-g="tasks" data-k="st" aria-label="Status">${opts([['','Any status'],...TST],f.st)}</select>
   <select data-chg="filter" data-g="tasks" data-k="wk" aria-label="Week">${opts([['','Any week'],...WEEKS().map(w=>[w.id,wkShort(w)])],f.wk)}</select></div>
  <div class="tw"><table><thead><tr><th>Task</th><th>Owner</th><th>Due</th><th>Wk</th><th>Section</th><th>Status</th><th></th></tr></thead><tbody>${rows||'<tr><td colspan="7" class="empty">No tasks match.</td></tr>'}</tbody></table></div>`;
}
function vLedger(){
  const f=S.f.ledger;
  const rows=ledgerList().map(c=>`<tr><td class="mono">${esc(c.date)}</td><td>${esc(pn(c.person))}</td><td>${esc(c.kind||'')}</td><td>${esc(c.what||'')}${c.section?`<small>${esc(secName(c.section))}</small>`:''}</td><td>${linkOf(c.proof)}</td><td><button class="btn sm" data-act="edit-contrib" data-id="${esc(c.id)}">Edit</button></td></tr>`).join('');
  return `<div class="bar"><button class="btn pri" data-act="add-contrib">Log contribution</button>
   <select data-chg="filter" data-g="ledger" data-k="person" aria-label="Person">${opts([['','Everyone'],...pArr().slice(1)],f.person)}</select></div>
  <p class="lead">Log it the day it happens, with a link or a note on where the screenshot is. Your reflection presentation is built from this.</p>
  <div class="tw"><table><thead><tr><th>Date</th><th>Who</th><th>Type</th><th>What was done</th><th>Proof</th><th></th></tr></thead><tbody>${rows||'<tr><td colspan="6" class="empty">Nothing logged yet.</td></tr>'}</tbody></table></div>`;
}
function rosterStats(p){
  const tasks=arr('tasks'),mine=arr('contrib').filter(c=>c.person===p.id);
  return {ot:tasks.filter(t=>t.owner===p.id&&t.status!=='done').length,dt:tasks.filter(t=>t.owner===p.id&&t.status==='done').length,
    ws:mine.filter(c=>c.kind==='Workshop').length,tu:mine.filter(c=>c.kind==='Tutorial').length,last:mine.map(c=>c.date).sort().pop()};
}
function vRoster(){
  const cards=people().map(p=>{const x=rosterStats(p);
    return `<div class="card"><div class="row"><b>${esc(p.name)}</b><span class="grow"></span><button class="btn sm" data-act="edit-person" data-id="${esc(p.id)}">Edit</button></div>
      <small>${esc([p.role,p.disc].filter(Boolean).join(' · '))}</small><div style="margin:6px 0">${p.fn?pill('acc',p.fn):''}</div>
      <div class="kv"><span>Open / done tasks</span><span class="mono">${x.ot} / ${x.dt}</span><span>Workshop contributions (3+)</span><span class="mono">${pill(x.ws>=3?'good':'warn',x.ws+'')}</span><span>Tutorial contributions (4+)</span><span class="mono">${pill(x.tu>=4?'good':'warn',x.tu+'')}</span><span>Last logged</span><span class="mono">${x.last?esc(fmtD(x.last)):'never'}</span></div></div>`;}).join('');
  return `<div class="bar"><button class="btn pri" data-act="add-person">Add person</button></div><div class="pc">${cards||'<div class="empty">No team members yet.</div>'}</div>`;
}

function vPres(){
  const deck=S.sub.pres,rows=slidesList(deck);
  const tot=rows.reduce((a,s)=>a+(Number(s.min)||0),0);
  const {budget,cut}=presBudget(deck);
  const note=deck==='reflect'?'4 to 5 minutes, cut off at 5:30, then 1 to 2 minutes of questions. Show the evidence, do not explain it.':'';
  const over=cut!=null?tot>cut:(budget!=null&&tot>budget);
  const sl=rows.map(s=>`<tr><td class="num mono">${esc(s.n??'')}</td><td class="nm"><b>${esc(s.title)}</b>${s.asset?`<small>${esc(s.asset)}</small>`:''}</td>
    <td><select class="s" data-chg="slide-who" data-id="${esc(s.id)}" aria-label="Speaker">${opts(pArr(),s.who)}</select></td><td class="num mono">${s.min!==''&&s.min!=null?esc(s.min):''}</td><td>${esc(secName(s.section)||'')}</td>
    <td><select class="s" data-chg="slide-status" data-id="${esc(s.id)}" aria-label="Slide status">${opts([['todo','To do'],['draft','Draft'],['done','Done']],s.status||'todo')}</select></td><td><button class="btn sm" data-act="edit-slide" data-id="${esc(s.id)}">Edit</button></td></tr>`).join('');
  const hd=deck==='final'?`<label class="row">Time limit (min), from Moodle <input type="number" step="0.5" style="width:90px" data-chg="final-min" value="${budget==null?'':budget}"></label>`:'';
  return `${head('Presentation','Slide structure and time only. Build the slides in PowerPoint.')}${subnav('pres',[['final','Final team presentation (Tue 27 Oct)'],['reflect','Reflection talk (individual)']])}
  <div class="bar"><button class="btn pri" data-act="add-slide">Add slide</button><button class="btn" data-act="preset-${deck}">Load starter outline</button>${hd}<span class="grow"></span>
   <span class="mono">${tot} min${budget!=null?' of '+budget:''}</span>${over?pill('bad',cut!=null?'over the 5:30 cut-off':'over time'):''}</div>
  ${note?`<p class="lead">${esc(note)}</p>`:''}
  <div class="tw"><table><thead><tr><th class="num">#</th><th>Slide and evidence needed</th><th>Speaker</th><th class="num">Min</th><th>Report section</th><th>Status</th><th></th></tr></thead><tbody>${sl||'<tr><td colspan="7" class="empty">No slides yet. Load the starter outline or add the first slide.</td></tr>'}</tbody></table></div>`;
}

const paras=b=>String(b||'').split(/\n\s*\n/).map(p=>`<p>${esc(p)}</p>`).join('');
const lvl=x=>x==='High'?'bad':x==='Medium'?'warn':'';
function vPlan(){
  const plan=PLAN().map((p,i)=>`<details class="pl"${i===0?' open':''}><summary>${esc(p.title)}</summary><div class="b">${paras(p.body)}<div class="row end"><button class="btn sm" data-act="edit-plan" data-id="${esc(p.id)}">Edit</button></div></div></details>`).join('');
  const ms=deadlines().map(d=>`<tr><td>${esc(d.label)}</td><td class="mono">${esc(fmtDT(d.t))}</td><td>${d.t<Date.now()?pill('good','passed'):pill('acc','in '+until(d.t))}</td><td><small>${esc(d.note)}</small></td><td><button class="btn sm" data-act="edit-deadline" data-id="${esc(d.id)}">Edit</button></td></tr>`).join('');
  const tasks=arr('tasks'),wl=WEEKS();
  const grp=(key,label,ts)=>{ts=ts.sort((a,b)=>(a.due||'').localeCompare(b.due||''));const dn=ts.filter(t=>t.status==='done').length;
    const rows=ts.map(t=>`<tr><td class="nm"><b>${esc(t.title)}</b>${t.note?`<small>${esc(t.note)}</small>`:''}</td><td>${esc(pn(t.owner)||'—')}</td><td>${esc(fmtD(t.due))}</td><td><select class="s" data-chg="task-status" data-id="${esc(t.id)}" aria-label="Task status">${opts(TST,t.status||'todo')}</select></td><td><button class="btn sm" data-act="edit-task" data-id="${esc(t.id)}">Edit</button></td></tr>`).join('');
    return `<div class="wk"><div class="row"><h3 style="margin:0">${esc(label)}</h3><span class="grow"></span><span class="mono">${dn}/${ts.length}</span></div><div class="meter" style="margin:6px 0 8px"><i style="width:${ts.length?100*dn/ts.length:0}%"></i></div>
      ${rows?`<div class="tw"><table style="min-width:600px"><tbody>${rows}</tbody></table></div>`:'<small>No tasks in this week.</small>'}</div>`;};
  const wk=wl.map(w=>grp(w.id,w.title,tasks.filter(t=>t.wk===w.id))).join('')+(()=>{const o=tasks.filter(t=>!wl.some(w=>w.id===t.wk));return o.length?grp('x','Not in a listed week',o):'';})();
  const rk=RISKS().map(r=>`<tr><td>${esc(r.title)}</td><td>${pill(lvl(r.impact),r.impact)}</td><td>${pill(lvl(r.likelihood),r.likelihood)}</td><td><small style="font-size:13px;color:var(--ink)">${esc(r.note)}</small></td><td><button class="btn sm" data-act="edit-risk" data-id="${esc(r.id)}">Edit</button></td></tr>`).join('');
  return `${head('Project plan','Written to the Project Plan Definition template, so it can go straight into the report appendix. Everything on this page is editable.')}
   ${shead('Plan definition','<button class="btn pri sm" data-act="add-plan">Add section</button>')}<div class="sec">${plan}</div>
   ${shead('Milestone chart','<button class="btn pri sm" data-act="add-deadline">Add milestone</button>')}<div class="tw sec"><table style="min-width:660px"><thead><tr><th>Milestone</th><th>Scheduled (Sydney)</th><th></th><th>Notes</th><th></th></tr></thead><tbody>${ms}</tbody></table></div>
   ${shead('Work plan by week','<button class="btn pri sm" data-act="add-task">Add task</button>')}${wk}
   ${shead('Risk management','<button class="btn pri sm" data-act="add-risk">Add risk</button>')}<div class="tw"><table style="min-width:680px"><thead><tr><th>Risk</th><th>Impact</th><th>Likelihood</th><th>Notes</th><th></th></tr></thead><tbody>${rk}</tbody></table></div>`;
}

function vInbox(){
  const rows=arr('inbox').sort((a,b)=>String(b.at).localeCompare(String(a.at))).map(i=>`<tr><td>${esc(i.text)}</td><td class="mono">${esc(String(i.at||'').slice(0,10))}</td><td><div class="row"><button class="btn sm" data-act="inbox-task" data-id="${esc(i.id)}">Make task</button><button class="btn sm" data-act="inbox-del" data-id="${esc(i.id)}">Remove</button></div></td></tr>`).join('');
  return `${head('Inbox','Use the capture bar at the top from any page. Triage here: turn it into a task or remove it.')}
   <div class="tw"><table style="min-width:520px"><thead><tr><th>Captured</th><th>Date</th><th></th></tr></thead><tbody>${rows||'<tr><td colspan="3" class="empty">Inbox is empty.</td></tr>'}</tbody></table></div>`;
}

function vSetup(){
  const P=proj();
  const crit=CRIT().map(c=>`<tr><td>${esc(c.name)}</td><td class="num mono">${esc(c.marks)}</td><td>${c.all?'Every section':'Sections ticked'}</td><td><button class="btn sm" data-act="edit-crit" data-id="${esc(c.id)}">Edit</button></td></tr>`).join('');
  const top=TOPICS().map(t=>`<tr><td>${esc(t.title)}</td><td><button class="btn sm" data-act="edit-topic" data-id="${esc(t.id)}">Edit</button></td></tr>`).join('');
  const wks=WEEKS().map(w=>`<tr><td class="mono">${esc(w.id)}</td><td>${esc(w.title)}</td><td><button class="btn sm" data-act="edit-week" data-id="${esc(w.id)}">Edit</button></td></tr>`).join('');
  const li=[['functions','Business functions'],['kinds','Contribution types'],['types','Source types']].map(([k,t])=>`<div class="card"><h3>${t}</h3><ul>${L(k).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`).join('');
  const resets=[['secdefs','Report sections'],['criteria','Rubric criteria'],['topics','Required topics'],['weeks','Weeks'],['deadlines','Milestones'],['risks','Risks'],['plantext','Plan text'],['roles','Roles'],['flow','Workflow stages'],['guide','Feedback and AI lists']].map(([c,t])=>`<button class="btn sm" data-act="reset" data-col="${c}">Reset ${t}</button>`).join(' ');
  return `${head('Setup','Everything the other tabs show is data you can change here or on the tab itself: sections, rubric, topics, weeks, milestones, risks, plan text, lists and project details.')}
   ${shead('Project','<button class="btn pri sm" data-act="edit-proj">Edit</button>')}<div class="card sec"><div class="kv"><span>Team</span><b>${esc(P.team)}</b><span>Client</span><b>${esc(P.client)}</b><span>Topic</span><b>${esc(P.topic)}</b></div></div>
   ${shead('Lists used in forms and filters','<button class="btn pri sm" data-act="edit-lists">Edit lists</button>')}<div class="lists sec">${li}</div>
   ${shead('Marking rubric criteria','<button class="btn pri sm" data-act="add-crit">Add criterion</button>')}<div class="tw sec"><table style="min-width:520px"><thead><tr><th>Criterion</th><th class="num">Marks</th><th>Applies to</th><th></th></tr></thead><tbody>${crit}</tbody></table></div>
   ${shead('Required content topics','<button class="btn pri sm" data-act="add-topic">Add topic</button>')}<div class="tw sec"><table style="min-width:420px"><thead><tr><th>Topic</th><th></th></tr></thead><tbody>${top}</tbody></table></div>
   ${shead('Weeks','<button class="btn pri sm" data-act="add-week">Add week</button>')}<div class="tw sec"><table style="min-width:480px"><thead><tr><th>Code</th><th>Title</th><th></th></tr></thead><tbody>${wks}</tbody></table></div>
   ${shead('Data','')}<div class="card"><div class="row"><button class="btn" data-act="test-db">Test database</button><button class="btn" data-act="backup">Download backup (JSON)</button><label class="row">Restore from backup <input type="file" accept=".json,application/json" data-chg="restore"></label></div>
   <p class="muted" style="margin:10px 0 6px">Reset puts a list back to the built-in version. Tasks, sources, people and the ledger are not touched. Click a reset button twice to confirm.</p><div class="row">${resets}</div></div>`;
}

function render(){
  const P=proj();$('#sub').textContent=[P.team,P.client,P.topic].filter(Boolean).join(' · ');
  $('#nav').innerHTML=TABS.map(([k,l])=>{const n=k==='inbox'?arr('inbox').length:0;return `<button type="button" data-tab="${k}" class="${S.view===k?'on':''}"${S.view===k?' aria-current="page"':''}>${l}${n?`<em>${n}</em>`:''}</button>`;}).join('');
  const f={dash:vDash,flow:vFlow,report:vReport,lib:vLib,team:vTeam,pres:vPres,plan:vPlan,inbox:vInbox,setup:vSetup}[S.view]||vDash;
  $('#view').innerHTML=f();
  const m=$('#mode');const ML={shared:'Shared and saved',server:'Local server, saved',cloud:'Cloud database, saved',local:'Saved in this browser only'};
  m.textContent=ML[mode]||'Loading';m.className='pill '+(mode==='local'?'warn':ML[mode]?'good':'');
}
