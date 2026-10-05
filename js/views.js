'use strict';
const avatar=(id,cls)=>{const p=person(id);return `<span class="av ${cls||''}" title="${esc(p.name)}">${esc(String(p.short||p.name||'?').charAt(0).toUpperCase())}</span>`;};
const dot=(c,t)=>`<i class="dot ${c}" title="${esc(t||'')}"></i>`;
const MODES={shared:'Shared database',server:'Local server',cloud:'Cloud database',local:'This browser only',loading:'Loading'};

function render(){
  if(!$('#main'))return;
  const me=S.me?person(S.me):null;
  $('#who').innerHTML=me?`<button class="chip me" data-act="who" title="Switch person">${avatar(S.me)}<span>${esc(me.short)}</span>${isLeader()?'<em class="lead">Leader</em>':''}</button>`
    :`<button class="btn" data-act="who">Who are you?</button>`;
  $('#mode').textContent=MODES[mode]||mode;$('#mode').className='pill '+(mode==='local'?'warn':'ok');
  $('#main').innerHTML=vArts()+vBoard()+vHeat();
  $('#foot').innerHTML=isLeader()?'<button class="link" data-act="settings">Settings</button>':'';
}

/* ---- the two artifacts: one square per chapter or slide ---- */
function vArts(){
  return '<div class="arts">'+ARTS.map(a=>{
    const st=artStats(a.id),us=units(a.id);
    const sq=us.map(u=>{const s=unitState(u.id),on=S.unit===u.id,n=actions().filter(x=>x.unit===u.id&&x.status!=='done').length;
      return `<button class="sq ${s}${on?' sel':''}" data-act="unit" data-id="${esc(u.id)}" title="${esc(u.name)}${n?' ('+n+' to do)':''}"><b>${esc(u.short)}</b></button>`;}).join('');
    const c=st.n;
    return `<section class="art"><div class="ah"><h2>${esc(a.name)}</h2><div class="pct"><b>${st.pct}%</b><small>complete</small></div></div>
      <div class="sqs">${sq||'<p class="empty">No chapters yet. Leader: add them in Settings.</p>'}</div>
      <p class="cnt">${dot('red')} ${c.open} found ${dot('amber')} ${c.doing} fixing ${dot('purple')} ${c.review} waiting ${dot('green')} ${c.done} approved</p></section>`;}).join('')+'</div>';
}

/* ---- the board: a card moves left to right ---- */
function vBoard(){
  const all=actions().filter(x=>(!S.unit||x.unit===S.unit)&&(!S.art||(unitOf(x.unit)||{}).art===S.art)&&(!S.who||x.owner===S.who||x.by===S.who));
  const busy={};actions().forEach(x=>{if(x.owner&&(x.status==='doing'||x.status==='review'))busy[x.owner]=(busy[x.owner]||0)+1;});
  const team=`<div class="team"><button class="chip${S.who?'':' on'}" data-act="who-f" data-id="">Everyone</button>`+people().map(p=>
    `<button class="chip${S.who===p.id?' on':''}" data-act="who-f" data-id="${esc(p.id)}">${avatar(p.id)}<span>${esc(p.short)}</span>${busy[p.id]?`<em>${busy[p.id]}</em>`:''}</button>`).join('')+'</div>';
  const u=S.unit?unitOf(S.unit):null;
  const showing=(u||S.who)?`<p class="filt">Showing ${u?'<b>'+esc(unitLabel(u))+'</b>':'everything'}${S.who?' for <b>'+esc(person(S.who).short)+'</b>':''} <button class="link" data-act="clear">Show all</button>${u?` <button class="btn sm" data-act="add" data-unit="${esc(u.id)}">+ Add action here</button>`:''}</p>`:'';
  const cols=STAGES.map(([k,label,col,help])=>{
    let list=all.filter(x=>x.status===k).sort((a,b)=>k==='done'?(b.doneAt||0)-(a.doneAt||0):(a.due||'9')<(b.due||'9')?-1:1);
    const more=k==='done'&&!S.allDone&&list.length>6?list.length-6:0;if(more)list=list.slice(0,6);
    return `<section class="col ${col}"><h3>${dot(col)} ${label} <span class="n">${all.filter(x=>x.status===k).length}</span></h3><p class="help">${esc(help)}</p>
      ${list.map(card).join('')||'<p class="empty">Nothing here</p>'}${more?`<button class="link" data-act="more">Show ${more} more</button>`:''}</section>`;}).join('');
  return `<section class="board"><div class="bh"><h2>Action board</h2><button class="btn pri big" data-act="add">+ Add action</button></div>${team}${showing}<div class="cols">${cols}</div></section>`;
}
function card(x){
  const u=unitOf(x.unit),s=x.status,mine=S.me&&x.owner===S.me,lead=isLeader();
  const late=s!=='done'&&x.due&&x.due<today();
  let btn='';
  if(s==='open')btn=`<button class="btn amber" data-act="take" data-id="${esc(x.id)}">I'll fix it</button>`;
  if(s==='doing'&&mine)btn=`<button class="btn purple" data-act="fixed" data-id="${esc(x.id)}">I fixed it</button>`;
  if(s==='review'&&lead)btn=`<button class="btn green" data-act="approve" data-id="${esc(x.id)}">Approve</button> <button class="btn" data-act="back" data-id="${esc(x.id)}">Send back</button>`;
  if(s==='review'&&!lead)btn=`<small>Waiting for ${esc(person(leaderId()).short)}</small>`;
  if(s==='done')btn=`<small>Approved${x.doneAt?' '+esc(fmtD(new Date(x.doneAt).toLocaleDateString('en-CA',{timeZone:TZ}))):''}</small>`;
  const canX=lead||(S.me&&x.by===S.me&&s==='open');
  return `<article class="card ${STAGE[s].col}"><div class="ct"><b>${esc(unitLabel(u))}</b>${canX?`<button class="x" data-act="del" data-id="${esc(x.id)}" aria-label="Remove" title="Remove">&times;</button>`:''}</div>
    <p>${x.kind==='ok'?'<span class="tick">Checked, all good</span>':esc(x.text)}</p>
    <div class="cm">${x.owner?avatar(x.owner)+'<span>'+esc(person(x.owner).short)+'</span>':'<span class="none">No one yet</span>'}${x.due?`<span class="due${late?' late':''}" title="Estimated finish">${late?'Late · ':''}${esc(fmtD(x.due))}</span>`:''}</div>
    ${btn?`<div class="cb">${btn}</div>`:''}</article>`;
}

/* ---- the timeline: weeks left to right, Monday to Sunday down, like GitHub's contribution graph ---- */
function vHeat(){
  const T=today(),A=actions(),DL=deadlines();
  let first=addDays(T,-7),last=addDays(T,14);
  A.forEach(x=>{if(x.day&&x.day<first)first=x.day;if(x.due&&x.due>last)last=x.due;});
  DL.forEach(d=>{if(d.date>last)last=d.date;});
  const start=addDays(first,-dow(first)),end=addDays(last,6-dow(last));
  const weeks=Math.min(26,Math.round(((dnum(end)-dnum(start))/864e5+1)/7));
  const logged={},due={};
  A.forEach(x=>{if(x.day)logged[x.day]=(logged[x.day]||0)+1;if(x.due)(due[x.due]=due[x.due]||[]).push(x);});
  const dl={};DL.forEach(d=>{(dl[d.date]=dl[d.date]||[]).push(d);});
  let months='',cols='';
  for(let w=0;w<weeks;w++){
    const ws=addDays(start,w*7);const prev=w?addDays(ws,-7):'';
    months+=`<span>${!w||fmtM(ws)!==fmtM(prev)?esc(fmtM(ws)):''}</span>`;
    let c='';
    for(let d=0;d<7;d++){
      const day=addDays(ws,d),n=logged[day]||0,ds=(due[day]||[]);
      const tip=[fmtD(day),n?n+' logged':'',ds.length?ds.length+' due':'',...(dl[day]||[]).map(x=>'Deadline: '+x.label)].filter(Boolean).join(' · ');
      c+=`<div class="hc h${Math.min(n,4)}${day===T?' today':''}${dl[day]?' dl':''}${day<T?' past':''}" title="${esc(tip)}">${ds.slice(0,4).map(x=>dot(STAGE[x.status].col)).join('')}</div>`;
    }
    cols+=`<div class="hw">${c}</div>`;
  }
  const list=DL.filter(d=>d.date>=addDays(T,-3)).slice(0,8).map(d=>`<li><span class="dd">${esc(fmtD(d.date))}</span> ${esc(d.label)} ${d.art?`<em class="tag ${d.art}">${esc(artOf(d.art).short)}</em>`:''}${daysLeft(d.date)}</li>`).join('');
  return `<section class="heat"><h2>Timeline</h2><div class="hgrid"><div class="hmap"><div class="hmon">${months}</div><div class="hbody"><div class="hdays"><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span><span></span></div>${cols}</div>
    <p class="key"><span class="hc h2 k"></span> shade = actions logged that day &nbsp; ${dot('amber')} dot = action due that day &nbsp; <span class="hc dl k"></span> deadline &nbsp; <span class="hc today k"></span> today</p></div>
    <ul class="dls">${list||'<li class="empty">No deadlines set.</li>'}</ul></div></section>`;
}
function daysLeft(d){const n=Math.round((dnum(d)-dnum(today()))/864e5);return `<small class="left">${n<0?Math.abs(n)+' days ago':n===0?'today':n===1?'tomorrow':n+' days'}</small>`;}
