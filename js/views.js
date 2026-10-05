'use strict';
const avatar=(id,cls)=>{const p=person(id);return `<span class="av ${cls||''}" title="${esc(p.name)}">${esc(String(p.short||p.name||'?').charAt(0).toUpperCase())}</span>`;};
const dot=(c,t)=>`<i class="dot ${c}" title="${esc(t||'')}"></i>`;
const MODES={shared:'Shared database',server:'Local server',cloud:'Cloud database',local:'This browser only',loading:'Loading'};
const SQC={none:'none',part:'part',issue:'issue',plan:'plan',doing:'doing',review:'review',done:'done'};
const COL=s=>(STAGE[s]||{col:'none'}).col;
const TABS=[['report','Report'],['slides','Presentation'],['time','Timeline']];

function render(){
  if(!$('#main'))return;
  $('#mode').textContent=MODES[mode]||mode;$('#mode').className='pill '+(mode==='local'?'warn':'ok');
  if(!S.me){renderGate();return;}
  const y=window.scrollY,me=person(S.me),lead=isLeader();
  if(S.tab==='approve'&&!lead)S.tab='report';
  $('#who').innerHTML=`<button class="btn sm" data-act="flow">Our workflow</button><button class="chip me" data-act="who" title="Switch person">${avatar(S.me)}<span>${esc(me.short)}</span>${lead?'<em class="lead">Leader</em>':''}</button>`;
  /* the Approvals tab, and the numbers on the tabs, are for the leader only */
  const w=waiting(),tabs=TABS.concat(lead?[['approve','Approvals']]:[]);
  $('#tabs').innerHTML=tabs.map(([id,l])=>{
    const n=!lead?0:id==='approve'?w.length:id==='time'?0:w.filter(a=>unitOf(a.unit).art===id).length;
    return `<button class="tab${S.tab===id?' on':''}${id==='approve'?' lead':''}" data-act="tab" data-id="${id}">${l}${n?`<em title="Waiting for your approval">${n}</em>`:''}</button>`;}).join('');
  $('#main').innerHTML=S.tab==='time'?vHeat():S.tab==='approve'?vApprove():vArt(S.tab);
  $('#foot').innerHTML=lead?'<button class="link" data-act="settings">Settings</button>':'';
  window.scrollTo(0,y);
}
/* Nobody is signed in: the hub shows nothing until you say who you are. */
function renderGate(){
  $('#who').innerHTML='';$('#tabs').innerHTML='';$('#main').innerHTML='';$('#foot').innerHTML='';
  const ids=people().map(p=>p.id).join(',');
  if($('#modal').hidden||(openWho.gate&&$('#modal .who-screen')&&openWho.key!==ids))openWho(null,true);
}

/* ---- the header of one artifact: ring, the five stages, the four checks, one square per chapter ---- */
function ring(pct){
  const r=34,c=2*Math.PI*r;
  return `<svg class="ring" viewBox="0 0 80 80" role="img" aria-label="${pct} percent checked"><circle cx="40" cy="40" r="${r}" class="rb"/><circle cx="40" cy="40" r="${r}" class="rf" stroke-dasharray="${(c*pct/100).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 40 40)"/><text x="40" y="45" text-anchor="middle">${pct}%</text></svg>`;
}
function sqHtml(u,sel,art){
  const s=unitState(u.id),p=passes(u.id),n=actionsDeep(u.id).filter(x=>x.status!=='done').length;
  const pips=PASSES.map(([k])=>`<i class="pp ${p[k]}"></i>`).join('');
  return `<button class="sq ${SQC[s]}${u.scaffold?' scaf':''}${sel?' sel':''}" data-act="sq" data-art="${art}" data-id="${esc(u.id)}" title="${esc(u.name)}${n?' ('+n+' open)':''}"><b>${esc(u.short)}</b><span class="pips">${pips}</span></button>`;
}
function vHead(art){
  const a=artOf(art),st=artStats(art),cs=chapters(art),lead=isLeader(),view=S.view[art];
  const pipe=STAGES.map(([k,l,c])=>`<li><button class="stg ${c}" data-act="stage" data-art="${art}" title="Show the board"><i class="dot ${c}"></i><b>${st.n[k]}</b><span>${esc(l)}</span></button></li>`).join('');
  const bars=PASSES.map(([k,l])=>`<li title="${esc(PASS[k].role)}: ${esc(holderText(k))}"><span>${esc(l)}</span><i class="bar"><u style="width:${st.total?Math.round(100*st.per[k]/st.total):0}%"></u></i><small>${st.per[k]}/${st.total}</small></li>`).join('');
  return `<section class="head"><div class="hl">${ring(st.pct)}<div><h1>${esc(a.name)}${a.ver?` <small>${esc(a.ver)}</small>`:''}</h1>
    <p class="sub">${st.total} ${st.total===1?a.noun:a.nouns} · ${st.full} fully checked${a.due?' · due '+esc(fmtD(a.due)):''}</p></div></div>
    <ol class="pipe" aria-label="Where the actions are">${pipe}</ol>
    <ul class="bars" aria-label="Checks done per pass">${bars}</ul>
    <div class="sqs">${cs.map(u=>sqHtml(u,view==='board'&&S.filt[art]===u.id,art)).join('')}${lead?`<button class="sq add" data-act="uedit" data-art="${art}" title="Add ${a.noun}"><b>+</b></button>`:''}</div>
    <div class="hr"><div class="seg" role="tablist"><button class="${view==='sections'?'on':''}" data-act="view" data-art="${art}" data-id="sections">Sections</button><button class="${view==='board'?'on':''}" data-act="view" data-art="${art}" data-id="board">Board</button></div>
    <button class="btn pri big" data-act="new">+ New issue</button></div></section>`;
}
function vArt(art){
  const a=artOf(art),cs=chapters(art);
  if(!cs.length){
    const wait=art==='report'&&(mode==='loading'||(!Object.keys(D.units).length&&!D.meta.seed));
    return `<section class="blank"><div class="ghost"><i></i><i></i><i></i><i></i><i></i></div>
      <h2>${wait?'Loading the report':'No '+a.nouns+' yet'}</h2>
      <p>${wait?'One moment.':art==='slides'?'The final presentation will be built here, one slide at a time, the same way as the report: issue, plan, approval, work, approval.':'Nothing here yet.'}</p>
      ${!wait&&isLeader()?`<button class="btn pri big" data-act="uedit" data-art="${art}">+ Add the first ${a.noun}</button>`:''}${!wait&&!isLeader()?'<p class="hint">The team leader adds the first one.</p>':''}</section>`;
  }
  return vHead(art)+(S.view[art]==='board'?vBoard(art):vSections(art));
}

/* ---- Sections: the report's chapters and sub-sections, one row each. Tap a row to see its actions. ---- */
function vSections(art){
  const cs=chapters(art),lead=isLeader(),a=artOf(art);
  return `<section class="tree">${cs.map(u=>vRow(u,false)+subsOf(u.id).map(s=>vRow(s,true)).join('')).join('')}
    ${lead?`<div class="trow add"><button class="btn" data-act="uedit" data-art="${art}">+ Add a ${a.noun}</button></div>`:''}</section>`;
}
function vRow(u,sub){
  const key='u:'+u.id,open=!!S.open[key],own=(X().act[u.id]||[]),n=own.filter(x=>x.status!=='done').length;
  const st=sub?selfState(u.id):unitState(u.id),lead=isLeader(),p=sub?null:passes(u.id),w=u.writer&&!sub?person(u.writer):null;
  const dots=own.filter(x=>x.status!=='done').slice(0,6).map(x=>dot(COL(x.status))).join('')+(n>6?`<small>+${n-6}</small>`:'');
  const pips=p?`<span class="rp" title="Review, Edit, Proofread, Publish">${PASSES.map(([k])=>`<i class="pp ${p[k]}"></i>`).join('')}</span>`:'';
  const d=`data-unit="${esc(u.id)}"`;
  let panel='';
  if(open){
    const brief=!sub&&(u.outline||u.lim)?`<p class="brief">${u.lim?`<b>${esc(u.lim)}.</b> `:''}${esc(u.outline||'')}${u.scaffold?' <em class="tag">Do after the other parts</em>':''}</p>`:'';
    const checks=sub?'':`<div class="meta2"><span class="writer">${w?avatar(u.writer)+'<span>Written by '+esc(w.short)+'</span>':'<span class="none">No writer chosen</span>'}</span><div class="checks">${PASSES.map(([k,l,role])=>{
      const s2=p[k],mineW=S.me&&u.writer===S.me;
      return `<button class="ps ${s2}" ${s2!=='none'?'disabled':''} data-act="check" ${d} data-pass="${k}" title="${esc(role)}: ${esc(holderText(k))}. ${esc(PASS[k].help)}${mineW?' (You wrote this, so a teammate must do it.)':''}"><i class="pp ${s2}"></i><b>${l}</b><small>${s2==='done'?'done':s2==='wait'?'waiting':'sign off'}</small></button>`;}).join('')}</div></div>`;
    const lc=lead?`<div class="row"><button class="btn sm" data-act="uedit" data-id="${esc(u.id)}">Edit ${sub?'sub-section':esc(artOf(u.art).noun)}</button>${sub?'':`<button class="btn sm" data-act="uedit" data-parent="${esc(u.id)}" data-art="${esc(u.art)}">+ Sub-section</button>`}</div>`:'';
    const list=own.filter(x=>x.type!=='check'||x.status!=='done').slice().sort((x,y)=>STAGE[x.status].i-STAGE[y.status].i);
    panel=`<div class="rpanel">${brief}${checks}${lc}<div class="cards">${list.map(x=>card(x,'inline')).join('')||'<p class="empty">No actions here yet. Flag a flaw, change something or add content.</p>'}</div></div>`;
  }
  return `<div class="trow${sub?' sub':''}${open?' open':''}" id="u-${esc(u.id)}"><div class="rh"><button class="rt" data-act="tog" data-key="${esc(key)}" aria-expanded="${open}"><i class="dot ${st==='part'?'part':st==='none'?'':COL(st)}"></i><span class="sn">${esc(sub?u.short:shortLabel(u))}</span><span class="nm">${esc(u.name)}</span>
    <span class="rmeta">${w?avatar(u.writer):''}${pips}<span class="rd">${dots}</span></span></button>
    <span class="rq"><button class="btn sm" data-act="new" data-type="flag" ${d} title="Flag a flaw">⚑</button><button class="btn sm" data-act="new" data-type="edit" ${d} title="Change content">✎</button><button class="btn sm" data-act="new" data-type="add" ${d} title="Add content">＋</button></span></div>${panel}</div>`;
}

/* ---- one card. The same card shows in Sections, the Board and Approvals. ---- */
function card(x,mode){
  const s=x.status,lead=isLeader(),mine=S.me&&x.owner===S.me,T=TYPE[x.type]||TYPE.flag,late=s!=='done'&&x.due&&x.due<today();
  const tag=TAGS.find(t=>t[0]===x.tag),u=unitOf(x.unit);
  let body='';
  if(x.type==='check')body=`<p><span class="tick">${esc((PASS[x.pass]||{label:'Check'}).label)} check: all good</span>${x.text?' – '+esc(x.text):''}</p>`;
  else body=`<p>${tag&&x.tag!=='other'?`<em class="tag">${esc(tag[1])}</em> `:''}${esc(x.text)}</p>${x.good?`<p class="good">Good: ${esc(x.good)}</p>`:''}`;
  const plan=(x.plan&&s!=='issue'?`<p class="plan"><b>Plan</b> ${esc(x.plan)}</p>`:'')+(x.back&&s!=='done'?`<p class="note"><b>${esc(person(leaderId()).short)} said</b> ${esc(x.back)}</p>`:'');
  let work='';
  if(s==='review'||s==='done'){
    if(x.proposed)work+=`<div class="work"><b>${s==='done'?'The new text':'New or changed text'}</b><div class="diff">${esc(x.proposed).replace(/\n/g,'<br>')}</div></div>`;
    if(x.note)work+=`<p class="note"><b>Done</b> ${esc(x.note)}</p>`;
  }
  const track=`<span class="trk" title="${esc(STAGE[s].label)}">${STAGES.map(([k,,c],i)=>`<i class="${i<=STAGE[s].i?'on '+STAGES[STAGE[s].i][2]:''}"></i>`).join('')}</span>`;
  const id=esc(x.id);
  let btn='';
  if(s==='issue')btn=`<button class="btn blue" data-act="plan" data-id="${id}">I'll plan it</button>`;
  if(s==='plan')btn=lead?`<button class="btn green" data-act="okplan" data-id="${id}">Approve plan</button><button class="btn" data-act="back" data-id="${id}">Send back</button>`:`<small>Waiting for ${esc(person(leaderId()).short)} to approve the plan</small>`;
  if(s==='doing')btn=mine?`<button class="btn purple" data-act="work" data-id="${id}">Submit work</button><button class="link sm" data-act="drop" data-id="${id}">Give it back</button>`:(lead?`<small>In progress</small><button class="link sm" data-act="drop" data-id="${id}">Unassign</button>`:'<small>In progress</small>');
  if(s==='review'&&lead)btn=x.type==='check'?`<button class="btn green" data-act="okwork" data-id="${id}">Approve</button><button class="btn" data-act="rej" data-id="${id}">Not yet</button>`
    :`<button class="btn green" data-act="okwork" data-id="${id}">Approve work</button><button class="btn" data-act="back" data-id="${id}">Send back</button>`;
  if(s==='review'&&!lead)btn=`<small>Waiting for ${esc(person(leaderId()).short)} to approve the work</small>`;
  if(s==='done')btn=`<small>Approved${x.doneAt?' '+esc(fmtD(new Date(x.doneAt).toLocaleDateString('en-CA',{timeZone:TZ}))):''}</small>`;
  const canX=lead||(S.me&&x.by===S.me&&s==='issue');
  const where=mode==='inline'?(x.spot?`<p class="spot">${esc(x.spot)}</p>`:''):`<button class="loc" data-act="goto" data-unit="${esc(x.unit)}" title="Open it in Sections">${mode==='appr'&&u?`<em class="tag ${u.art}">${esc(artOf(u.art).short)}</em> `:''}${esc(placeText(x))}</button>`;
  return `<article class="card ${COL(s)}" id="a-${id}"><div class="ct"><span class="ty" title="${esc(T.hint)}">${T.icon} ${esc(T.label)}</span>${canX?`<button class="x" data-act="del" data-id="${id}" aria-label="Remove" title="Remove">&times;</button>`:''}</div>
    ${where}${body}${plan}${work}
    <div class="cm">${x.owner?avatar(x.owner)+'<span>'+esc(person(x.owner).short)+'</span>':`<span class="none">${x.by?'Raised by '+esc(person(x.by).short):'No one yet'}</span>`}${x.due&&s!=='done'?`<span class="due${late?' late':''}" title="Estimated finish">${late?'Late · ':''}${esc(fmtD(x.due))}</span>`:''}${track}</div>
    ${btn?`<div class="cb">${btn}</div>`:''}</article>`;
}

/* ---- Board: a card moves left to right ---- */
function vBoard(art){
  const f=S.filt[art],lead=isLeader();
  const all=allActions(art).filter(x=>(!f||deepIds(f).includes(x.unit))&&(!S.who||x.owner===S.who||x.by===S.who));
  const busy={};allActions(art).forEach(x=>{if(x.owner&&x.status!=='done'&&x.status!=='issue')busy[x.owner]=(busy[x.owner]||0)+1;});
  const team=`<div class="team"><button class="chip${S.who?'':' on'}" data-act="who-f" data-id="">Everyone</button>`+people().map(p=>
    `<button class="chip${S.who===p.id?' on':''}" data-act="who-f" data-id="${esc(p.id)}">${avatar(p.id)}<span>${esc(p.short)}</span>${busy[p.id]?`<em>${busy[p.id]}</em>`:''}</button>`).join('')
    +(f?`<button class="chip on" data-act="unfilt" data-art="${art}">${esc(shortLabel(unitOf(f)))} ×</button>`:'')+'</div>';
  const cols=STAGES.map(([k,label,col,help])=>{
    const here=all.filter(x=>x.status===k);
    let list=here.slice().sort((a,b)=>k==='done'?(b.doneAt||0)-(a.doneAt||0):(a.due||'9')<(b.due||'9')?-1:(a.at||0)-(b.at||0));
    const more=k==='done'&&!S.allDone&&list.length>6?list.length-6:0;if(more)list=list.slice(0,6);
    const wait=lead&&(k==='plan'||k==='review')&&here.length;
    return `<section class="col ${col}"><h3>${dot(col)} ${esc(label)} <span class="n">${here.length}</span>${wait?'<em class="you">needs you</em>':''}</h3><p class="help">${esc(help)}</p>
      ${list.map(x=>card(x,'board')).join('')||'<p class="empty">Nothing here</p>'}${more?`<button class="link" data-act="more">Show ${more} more</button>`:''}</section>`;}).join('');
  return `<section class="board">${team}<div class="cols">${cols}</div></section>`;
}

/* ---- Approvals: the leader's inbox. Only the leader ever sees this tab. ---- */
function vApprove(){
  const w=waiting(),plans=w.filter(x=>x.status==='plan'),works=w.filter(x=>x.status==='review');
  const col=(title,c,list,help)=>`<section class="col ${c}"><h3>${dot(c)} ${esc(title)} <span class="n">${list.length}</span></h3><p class="help">${esc(help)}</p>${list.sort((a,b)=>(a.at||0)-(b.at||0)).map(x=>card(x,'appr')).join('')||'<p class="empty">Nothing waiting</p>'}</section>`;
  return `<section class="head solo"><div class="hl"><div><h1>Needs your approval</h1><p class="sub">${w.length?w.length+' waiting, oldest first. Only you see this tab.':'Nothing is waiting for you. Nice.'}</p></div></div></section>
    <section class="board"><div class="cols two">${col('Plans to approve','blue',plans,'Approve the plan and the owner starts the work.')}${col('Work to approve','purple',works,'Approve the work and it counts as done.')}</div></section>`;
}

/* ---- Timeline: weeks left to right, Monday to Sunday down, like GitHub's contribution graph ---- */
function vHeat(){
  const T=today(),A=X().acts,DL=deadlines();
  let first=addDays(T,-7),last=addDays(T,14);
  A.forEach(x=>{if(x.day&&x.day<first)first=x.day;if(x.due&&x.due>last)last=x.due;});
  DL.forEach(d=>{if(d.date>last)last=d.date;});
  const start=addDays(first,-dow(first)),end=addDays(last,6-dow(last));
  const weeks=Math.min(26,Math.round(((dnum(end)-dnum(start))/864e5+1)/7));
  const logged={},due={};
  A.forEach(x=>{if(x.day)logged[x.day]=(logged[x.day]||0)+1;if(x.due&&x.status!=='done')(due[x.due]=due[x.due]||[]).push(x);});
  const dl={};DL.forEach(d=>{(dl[d.date]=dl[d.date]||[]).push(d);});
  let months='',cols='';
  for(let w=0;w<weeks;w++){
    const ws=addDays(start,w*7),prev=w?addDays(ws,-7):'';
    months+=`<span>${!w||fmtM(ws)!==fmtM(prev)?esc(fmtM(ws)):''}</span>`;
    let c='';
    for(let d=0;d<7;d++){
      const day=addDays(ws,d),n=logged[day]||0,ds=(due[day]||[]);
      const tip=[fmtD(day),n?n+' logged':'',ds.length?ds.length+' due':'',...(dl[day]||[]).map(x=>'Deadline: '+x.label)].filter(Boolean).join(' · ');
      c+=`<div class="hc h${Math.min(n,4)}${day===T?' today':''}${dl[day]?' dl':''}${day<T?' past':''}" title="${esc(tip)}">${ds.slice(0,4).map(x=>dot(COL(x.status))).join('')}</div>`;
    }
    cols+=`<div class="hw">${c}</div>`;
  }
  const list=DL.filter(d=>d.date>=addDays(T,-3)).slice(0,8).map(d=>`<li><span class="dd">${esc(fmtD(d.date))}</span> ${esc(d.label)} ${d.art?`<em class="tag ${d.art}">${esc(artOf(d.art).short)}</em>`:''}${daysLeft(d.date)}</li>`).join('');
  return `<section class="heat"><h2>Timeline</h2><div class="hgrid"><div class="hmap"><div class="hmon">${months}</div><div class="hbody"><div class="hdays"><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span><span></span></div>${cols}</div>
    <p class="key"><span class="hc h2 k"></span> shade = actions logged that day &nbsp; ${dot('blue')} dot = work due that day &nbsp; <span class="hc dl k"></span> deadline &nbsp; <span class="hc today k"></span> today</p></div>
    <ul class="dls">${list||'<li class="empty">No deadlines set.</li>'}</ul></div></section>`;
}
function daysLeft(d){const n=Math.round((dnum(d)-dnum(today()))/864e5);return `<small class="left">${n<0?Math.abs(n)+' days ago':n===0?'today':n===1?'tomorrow':n+' days'}</small>`;}
