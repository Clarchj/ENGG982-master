'use strict';
/* ---------- the pop-up ---------- */
let after=null;
function openModal(html,onclose){$('#modal').innerHTML=`<div class="back" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">${html}</div>`;$('#modal').hidden=false;after=onclose||null;
  const f=$('#modal [autofocus],#modal input,#modal textarea');if(f&&matchMedia('(pointer:fine)').matches)f.focus();}
function closeModal(){$('#modal').hidden=true;$('#modal').innerHTML='';after=null;Wz=null;}

/* ---------- who are you? (and the leader PIN) ---------- */
function openWho(next){
  const tiles=people().map(p=>`<button class="tile who" data-act="pick" data-id="${esc(p.id)}">${avatar(p.id,'big')}<b>${esc(p.short)}</b>${p.id===leaderId()?'<small>Leader, needs PIN</small>':''}</button>`).join('');
  openModal(`<h2>Who are you?</h2><p class="lead">Pick your name. Your actions will carry it.</p><div class="tiles">${tiles}</div>
    <p class="row"><button class="link" data-act="close">Just looking</button>${S.me?'<button class="link" data-act="signout">Sign out</button>':''}</p>`);
  openWho.next=next||null;
}
function signIn(id){S.me=id;ls.set('hub.me',id);ss.set('hub.lead',S.lead?'1':'0');closeModal();render();toast('Hi '+person(id).short);const n=openWho.next;openWho.next=null;if(n)n();}
function pickPerson(id){
  if(id!==leaderId()){S.lead=false;ss.del('hub.lead');return signIn(id);}
  const has=!!leaderRec().pin;
  openModal(`<h2>${has?'Leader PIN':'Choose a leader PIN'}</h2><p class="lead">${has?'Only the leader can approve fixes.':'Pick 4 to 8 digits. You need it to approve fixes. Teammates never see it.'}</p>
    <form id="pinf" autocomplete="off"><input id="pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="8" autofocus placeholder="PIN" aria-label="PIN"><p id="pine" class="err" hidden></p>
    <div class="row"><button class="btn pri big">${has?'Unlock':'Save PIN'}</button><button type="button" class="link" data-act="who">Back</button></div></form>`);
}
async function submitPin(){
  const v=$('#pin').value.trim(),e=$('#pine'),has=!!leaderRec().pin;
  const bad=m=>{e.textContent=m;e.hidden=false;$('#pin').value='';$('#pin').focus();};
  if(!/^\d{4,8}$/.test(v))return bad('Use 4 to 8 digits.');
  if(has&&hashPin(v)!==leaderRec().pin)return bad('Wrong PIN. Try again.');
  if(!has)await put('meta','leader',{...leaderRec(),who:leaderId(),pin:hashPin(v)});
  S.lead=true;signIn(leaderId());
}
function signOut(){S.me='';S.lead=false;ls.del('hub.me');ss.del('hub.lead');closeModal();render();}

/* ---------- add an action: 3 big steps ---------- */
let Wz=null;
function openAdd(unitId){
  if(!S.me)return openWho(()=>openAdd(unitId));
  const due=addDays(today(),3);Wz={step:1,art:'',unit:'',kind:'',text:'',mine:true,due};
  const u=unitId&&unitOf(unitId);if(u){Wz.art=u.art;Wz.unit=u.id;Wz.step=3;}
  drawAdd();
}
function drawAdd(){
  const z=Wz,dots=[1,2,3].map(n=>`<i class="step${z.step>=n?' on':''}"></i>`).join('');
  let h='';
  if(z.step===1){
    h=`<h2>What is it about?</h2><div class="tiles two">${ARTS.map(a=>`<button class="tile big art-${a.id}" data-wz="art:${a.id}"><b>${esc(a.name)}</b><small>${units(a.id).length} ${a.id==='report'?'chapters':'slides'}</small></button>`).join('')}</div>`;
  }else if(z.step===2){
    h=`<h2>${z.art==='report'?'Which chapter?':'Which slide?'}</h2><div class="sqs pick">${units(z.art).map(u=>`<button class="sq ${unitState(u.id)}" data-wz="unit:${esc(u.id)}" title="${esc(u.name)}"><b>${esc(u.short)}</b></button>`).join('')}</div>
      <p class="hint">Tap one. Names show when you hold the square.</p><p class="row"><button class="link" data-wz="step:1">Back</button></p>`;
  }else{
    const u=unitOf(z.unit);
    const quick=[['Today',0],['Tomorrow',1],['3 days',3],['1 week',7]].map(([l,n])=>`<button type="button" class="chip${z.due===addDays(today(),n)?' on':''}" data-wz="due:${addDays(today(),n)}">${l}</button>`).join('');
    h=`<h2>${esc(unitLabel(u))}</h2><p class="lead">${esc(u?u.name:'')}</p>
      <div class="tiles two"><button class="tile fix${z.kind==='fix'?' on':''}" data-wz="kind:fix">${dot('red')}<b>Found a problem</b></button><button class="tile okk${z.kind==='ok'?' on':''}" data-wz="kind:ok">${dot('green')}<b>Checked, all good</b></button></div>`;
    if(z.kind==='fix')h+=`<label class="fl">What is wrong? One line.<textarea id="wtext" rows="2" maxlength="160" placeholder="For example: colour of the title is wrong" autofocus>${esc(z.text)}</textarea></label>
      <div class="fl">Who fixes it?<div class="chips"><button type="button" class="chip${z.mine?' on':''}" data-wz="mine:1">I will</button><button type="button" class="chip${z.mine?'':' on'}" data-wz="mine:0">Someone else</button></div></div>
      <div class="fl">Finish by<div class="chips">${quick}<input type="date" id="wdue" value="${esc(z.due)}" min="${today()}" aria-label="Pick a date"></div></div>`;
    if(z.kind)h+=`<div class="row"><button class="btn pri big" data-wz="log">Log it</button><button class="link" data-wz="step:2">Back</button></div>`;
    else h+=`<p class="row"><button class="link" data-wz="step:2">Back</button></p>`;
  }
  openModal(`<div class="steps">${dots}</div>${h}<button class="x closer" data-act="close" aria-label="Close">&times;</button>`);
}
function wz(k,v){
  const z=Wz;if(!z)return;
  const keep=()=>{const t=$('#wtext');if(t)z.text=t.value;const d=$('#wdue');if(d&&d.value)z.due=d.value;};keep();
  if(k==='art'){z.art=v;z.step=2;}
  else if(k==='unit'){z.unit=v;z.step=3;z.kind='';}
  else if(k==='step')z.step=Number(v);
  else if(k==='kind')z.kind=v;
  else if(k==='mine')z.mine=v==='1';
  else if(k==='due')z.due=v;
  else if(k==='log')return logAction();
  drawAdd();
}
async function logAction(){
  const z=Wz,fix=z.kind==='fix';
  if(fix&&z.text.trim().length<3){toast('Write what is wrong first');const t=$('#wtext');if(t)t.focus();return;}
  const a=fix?{kind:'fix',text:z.text.trim(),owner:z.mine?S.me:'',status:z.mine?'doing':'open',due:z.due}
    :{kind:'ok',text:'Checked, all good',owner:S.me,status:'review',due:today()};
  await put('actions',uid(),{...a,unit:z.unit,by:S.me,day:today(),at:Date.now()});
  closeModal();toast(fix?(z.mine?'Logged. You are fixing it.':'Logged. It is on the board.'):'Logged. Waiting for approval.');
}

/* ---------- moving a card ---------- */
const guardMe=()=>{if(S.me)return true;openWho();return false;};
async function moveAction(id,act){
  const x=D.actions[id];if(!x)return;
  if(act==='take'){if(!guardMe())return;return patch('actions',id,{owner:S.me,status:'doing',due:x.due||addDays(today(),3)});}
  if(act==='fixed'&&S.me===x.owner)return patch('actions',id,{status:'review'});
  if(!isLeader()){toast('Only the leader can do that');return;}
  if(act==='approve')return patch('actions',id,{status:'done',doneAt:Date.now(),doneBy:S.me});
  if(act==='back')return patch('actions',id,{status:'doing',doneAt:null});
}
let sure='';
function removeAction(id,btn){
  if(sure!==id){sure=id;btn.textContent='Sure?';btn.classList.add('sure');setTimeout(()=>{if(sure===id){sure='';if(btn.isConnected){btn.innerHTML='&times;';btn.classList.remove('sure');}}},2500);return;}
  sure='';del('actions',id);toast('Removed');
}

/* ---------- settings (leader only) ---------- */
function rowsHtml(col,list,art){
  return `<div class="rows" data-col="${col}" data-art="${art||''}">${list.map(r=>rowHtml(r.id,r.short,r.name)).join('')}</div><button type="button" class="btn sm" data-act="addrow" data-col="${col}">+ Add</button>`;
}
const rowHtml=(id,short,name)=>`<div class="ur" data-id="${esc(id||'')}"><input data-f="short" value="${esc(short||'')}" maxlength="10" aria-label="Short label" placeholder="Label"><input data-f="name" value="${esc(name||'')}" maxlength="80" aria-label="Name" placeholder="Name"><button type="button" class="x" data-act="rmrow" aria-label="Remove">&times;</button></div>`;
function openSettings(){
  if(!isLeader())return;
  const dl=(D.meta.deadlines&&D.meta.deadlines.text)||'';
  openModal(`<h2>Settings</h2><form id="setf"><details open><summary>Report chapters</summary>${rowsHtml('units',units('report'),'report')}</details>
    <details><summary>Presentation slides</summary>${rowsHtml('units',units('slides'),'slides')}</details>
    <details><summary>Team</summary>${rowsHtml('people',people().map(p=>({id:p.id,short:p.short,name:p.name})),'')}</details>
    <details><summary>Deadlines</summary><textarea id="sdl" rows="7" aria-label="Deadlines">${esc(dl)}</textarea><p class="hint">One per line: date | report or slides | name</p></details>
    <details><summary>Leader PIN</summary><input id="spin" type="password" inputmode="numeric" maxlength="8" placeholder="New PIN, 4 to 8 digits (leave empty to keep)"></details>
    <details><summary>Database</summary><button type="button" class="btn" data-act="testdb">Test database</button><pre id="dbout" class="out" hidden></pre></details>
    <div class="row"><button class="btn pri big">Save</button><button type="button" class="link" data-act="close">Cancel</button></div></form>`);
}
async function saveSettings(){
  const jobs=[];const pin=$('#spin').value.trim();
  if(pin&&!/^\d{4,8}$/.test(pin)){toast('PIN: 4 to 8 digits');return;}
  document.querySelectorAll('#setf .rows').forEach(box=>{
    const col=box.dataset.col,art=box.dataset.art,keep=new Set();let ord=col==='units'?(art==='slides'?100:0):0;
    box.querySelectorAll('.ur').forEach(r=>{
      const short=r.querySelector('[data-f=short]').value.trim(),name=r.querySelector('[data-f=name]').value.trim();
      if(!short&&!name)return;
      const id=r.dataset.id||(col==='units'?(art==='slides'?'s':'r')+uid():uid());keep.add(id);
      const old=D[col][id]||{};
      jobs.push(put(col,id,col==='units'?{...old,art,short:short||name.slice(0,6),name:name||short,ord:ord++}:{...old,short:short||name.split(' ')[0],name:name||short,ord:ord++}));
    });
    if(col==='units')units(art).forEach(u=>{if(!keep.has(u.id))jobs.push(del('units',u.id));});
    else people().forEach(p=>{if(!keep.has(p.id)&&p.id!==leaderId())jobs.push(del('people',p.id));});
  });
  jobs.push(put('meta','deadlines',{text:$('#sdl').value}));
  if(pin)jobs.push(put('meta','leader',{...leaderRec(),who:leaderId(),pin:hashPin(pin)}));
  await Promise.all(jobs);closeModal();toast('Saved');
}
async function testDb(btn){
  const out=$('#dbout');out.hidden=false;out.textContent='Testing...';btn.disabled=true;
  const res=await W.test();const pass=res.every(r=>r[1]);
  const wantCloud=!!(CFG.supabaseUrl&&CFG.supabaseKey);
  let extra='';
  if(wantCloud&&mode==='local'){const dg=await diagCloud();extra='\n\nSupabase is set up but the hub fell back to this browser only:\n'+dg.map(x=>x[2]).join('\n');}
  const fail=wantCloud&&mode==='local';
  out.textContent=((pass&&!fail)?'PASS':'FAIL')+'\nSaving to: '+(MODES[mode]||mode)+'\n'+res.map(x=>(x[1]?'[ok]   ':'[FAIL] ')+x[0]+(x[2]?'\n       '+x[2]:'')).join('\n')+extra+(mode==='local'&&!wantCloud?'\n\nThis is NOT shared. Data stays in this browser. See HOW-TO-RUN.md, section D.':'');
  btn.disabled=false;
}
