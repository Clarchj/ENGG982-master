'use strict';
/* ---------- the pop-up ---------- */
let Wz=null,Wk=null,Ue=null;
function openModal(html,locked){$('#modal').innerHTML=`<div class="back"${locked?'':' data-act="close"'}></div><div class="sheet" role="dialog" aria-modal="true">${html}</div>`;$('#modal').hidden=false;
  const f=$('#modal [autofocus],#modal input,#modal textarea');if(f&&matchMedia('(pointer:fine)').matches)f.focus();}
function closeModal(){if(!S.me)return;$('#modal').hidden=true;$('#modal').innerHTML='';Wz=null;Wk=null;}
const closer='<button class="x closer" data-act="close" aria-label="Close">&times;</button>';

/* ---------- who are you? Asked first, before anything else is shown. Then the leader PIN. ---------- */
function openWho(next,gate){
  const g=gate!==undefined?gate:!S.me,last=ls.get('hub.last');
  const tiles=people().map(p=>`<button class="tile who${p.id===last?' last':''}" data-act="pick" data-id="${esc(p.id)}">${avatar(p.id,'big')}<b>${esc(p.short)}</b>${p.id===leaderId()?'<small>Leader, needs PIN</small>':p.id===last?'<small>Last time</small>':''}</button>`).join('');
  openModal(`<h2 class="who-screen">${g?'Welcome. Who are you?':'Who are you?'}</h2><p class="lead">Pick your name. Everything you do carries it.</p>${tiles?`<div class="tiles who">${tiles}</div>`:'<p class="hint">Loading the team...</p>'}
    ${g?'':`<p class="row"><button class="link" data-act="close">Cancel</button>${S.me?'<button class="link" data-act="signout">Sign out</button>':''}</p>`}`,g);
  openWho.next=next||null;openWho.gate=g;openWho.key=people().map(p=>p.id).join(',');
}
function signIn(id){S.me=id;ss.set('hub.me',id);ls.set('hub.last',id);ss.set('hub.lead',S.lead?'1':'0');closeModal();render();toast('Hi '+person(id).short);const n=openWho.next;openWho.next=null;if(n)n();}
function pickPerson(id){
  if(id!==leaderId()){S.lead=false;ss.del('hub.lead');return signIn(id);}
  const has=!!leaderRec().pin,g=!S.me;
  openModal(`<h2>${has?'Leader PIN':'Choose a leader PIN'}</h2><p class="lead">${has?'Only the leader sees approvals and settings.':'Pick 4 to 8 digits. You need it to approve and to change sections. Teammates never see it.'}</p>
    <form id="pinf" autocomplete="off"><input id="pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="8" autofocus placeholder="PIN" aria-label="PIN"><p id="pine" class="err" hidden></p>
    <div class="row"><button class="btn pri big">${has?'Unlock':'Save PIN'}</button><button type="button" class="link" data-act="who">Back</button></div></form>`,g);
}
async function submitPin(){
  const v=$('#pin').value.trim(),e=$('#pine'),has=!!leaderRec().pin;
  const bad=m=>{e.textContent=m;e.hidden=false;$('#pin').value='';$('#pin').focus();};
  if(!/^\d{4,8}$/.test(v))return bad('Use 4 to 8 digits.');
  if(has&&hashPin(v)!==leaderRec().pin)return bad('Wrong PIN. Try again.');
  if(!has)await put('meta','leader',{...leaderRec(),who:leaderId(),pin:hashPin(v)});
  S.lead=true;signIn(leaderId());
}
function signOut(){S.me='';S.lead=false;ss.del('hub.me');ss.del('hub.lead');$('#modal').hidden=true;render();}
const needLead=()=>{if(isLeader())return true;toast('Only the leader can do that');return false;};

/* ---------- moving around ---------- */
function setTab(t){S.tab=t;ls.set('hub.tab',t);render();window.scrollTo(0,0);}
function setView(art,v){S.view[art]=v;ls.set('hub.view.'+art,v);render();}
function goTo(unitId){
  const u=unitOf(unitId);if(!u)return;const art=u.art,top=topOf(unitId);
  S.tab=art;ls.set('hub.tab',art);S.view[art]='sections';ls.set('hub.view.'+art,'sections');
  S.open['u:'+top.id]=true;S.open['u:'+unitId]=true;render();
  const el=document.getElementById('u-'+unitId);if(el)el.scrollIntoView({block:'start'});
}
function pickSq(art,id){
  if(S.view[art]==='sections'){S.open['u:'+id]=true;render();const el=document.getElementById('u-'+id);if(el)el.scrollIntoView({block:'start',behavior:'smooth'});}
  else{S.filt[art]=S.filt[art]===id?'':id;render();}
}

/* ---------- raise an issue: 3 big steps. what > where > details ---------- */
function openNew(o){
  o=o||{};
  const u=o.unit&&unitOf(o.unit);
  Wz={step:1,type:o.type||'',art:u?u.art:(S.tab==='slides'?'slides':'report'),top:'',unit:'',spot:'',tag:'',good:'',text:'',mine:false,plan:'',due:addDays(today(),3)};
  if(u){Wz.unit=u.id;Wz.top=topOf(u.id).id;}
  if(Wz.type)Wz.step=Wz.unit?3:2;
  drawNew();
}
function drawNew(){
  const z=Wz,dots=[1,2,3].map(n=>`<i class="step${z.step>=n?' on':''}"></i>`).join('');
  let h='';
  if(z.step===1){
    h=`<h2>What do you want to do?</h2><div class="tiles three">${TYPES.filter(t=>t[0]!=='check').map(t=>`<button class="tile big ty-${t[0]}" data-wz="type:${t[0]}"><span class="ico">${t[3]}</span><b>${esc(t[1])}</b><small>${esc(t[2])}</small></button>`).join('')}</div>
      <p class="hint">Signing off a whole chapter is done from its row, with the four check buttons.</p>`;
  }else if(z.step===2){
    const cs=chapters(z.art),other=ARTS.find(a=>a.id!==z.art&&chapters(a.id).length);
    h=`<h2>Where?</h2>${other?`<div class="chips"><button class="chip on" data-wz="art:${z.art}">${esc(artOf(z.art).short)}</button><button class="chip" data-wz="art:${other.id}">${esc(other.short)}</button></div>`:''}
      <div class="sqs pick">${cs.map(u=>`<button class="sq ${SQC[unitState(u.id)]}${z.top===u.id?' sel':''}" data-wz="top:${esc(u.id)}" title="${esc(u.name)}"><b>${esc(u.short)}</b></button>`).join('')}</div>`;
    if(z.top){
      const top=unitOf(z.top),subs=subsOf(z.top);
      h+=`<p class="lab">${esc(top.name)}</p>`;
      if(subs.length)h+=`<div class="chips">${[top].concat(subs).map(u=>`<button class="chip${z.unit===u.id?' on':''}" data-wz="unit:${esc(u.id)}">${u===top?'The whole chapter':esc(u.short+'  '+snip(u.name,30))}</button>`).join('')}</div>`;
    }
    h+=`<div class="row"><button class="btn pri big" ${z.unit?'':'disabled'} data-wz="step:3">Next</button>${z.type?`<button class="link" data-wz="step:1">Back</button>`:''}</div>`;
  }else{
    const T=TYPE[z.type],place=placeText({unit:z.unit});
    const q=z.type==='flag'?'What is wrong? One line. Suggest, do not order.':z.type==='edit'?'What should change, and why?':'What is missing? Say what should be added.';
    const ph=z.type==='flag'?'For example: Do you think a legend would help here?':z.type==='edit'?'For example: The 2% figure does not match Table 6':'For example: A sentence on cyber safety';
    const quick=[['Today',0],['Tomorrow',1],['3 days',3],['1 week',7]].map(([l,n])=>`<button type="button" class="chip${z.due===addDays(today(),n)?' on':''}" data-wz="due:${addDays(today(),n)}">${l}</button>`).join('');
    h=`<h2>${T.icon} ${esc(T.label)}</h2><p class="lead"><button class="loc" data-wz="step:2">${esc(place)}</button></p>
      ${z.type==='flag'?`<label class="fl">What worked well? (optional, say it first)<input id="wgood" maxlength="120" value="${esc(z.good)}" placeholder="For example: the diagram is clear"></label>
      <div class="fl">What kind of problem?<div class="chips">${TAGS.map(t=>`<button type="button" class="chip${z.tag===t[0]?' on':''}" data-wz="tag:${t[0]}">${esc(t[1])}</button>`).join('')}</div></div>`:''}
      <label class="fl">${q}<textarea id="wtext" rows="3" maxlength="400" placeholder="${esc(ph)}" autofocus>${esc(z.text)}</textarea></label>
      <label class="fl">Where exactly? (optional)<input id="wspot" maxlength="80" value="${esc(z.spot)}" placeholder="For example: Table 6, or the second paragraph"></label>
      <div class="fl">Who will plan and do it?<div class="chips"><button type="button" class="chip${z.mine?'':' on'}" data-wz="mine:0">Leave it open</button><button type="button" class="chip${z.mine?' on':''}" data-wz="mine:1">I'll plan it</button></div></div>
      ${z.mine?`<label class="fl">My plan, one line<input id="wplan" maxlength="200" value="${esc(z.plan)}" placeholder="${z.type==='add'?'I will write two sentences and cite the standard':'I will reword it and check Table 6'}"></label>
      <div class="fl">Finish by<div class="chips">${quick}<input type="date" id="wdue" value="${esc(z.due)}" min="${today()}" aria-label="Pick a date"></div></div>`:''}
      <div class="row"><button class="btn pri big" data-wz="log">${z.mine?'Raise it with my plan':'Raise issue'}</button><button class="link" data-wz="step:2">Back</button></div>`;
  }
  openModal(`<div class="steps">${dots}</div>${h}${closer}`);
}
function wz(k,v){
  const z=Wz;if(!z)return;
  const keep=()=>{const t=$('#wtext');if(t)z.text=t.value;const g=$('#wgood');if(g)z.good=g.value;const sp=$('#wspot');if(sp)z.spot=sp.value;const p=$('#wplan');if(p)z.plan=p.value;const d=$('#wdue');if(d&&d.value)z.due=d.value;};keep();
  if(k==='type'){z.type=v;z.step=z.unit?3:2;}
  else if(k==='art'){z.art=v;z.top='';z.unit='';}
  else if(k==='top'){z.top=v;z.unit=subsOf(v).length?'':v;}
  else if(k==='unit')z.unit=v;
  else if(k==='step')z.step=Number(v);
  else if(k==='tag')z.tag=z.tag===v?'':v;
  else if(k==='mine')z.mine=v==='1';
  else if(k==='due')z.due=v;
  else if(k==='log')return logIssue();
  drawNew();
}
async function logIssue(){
  const z=Wz;
  if(z.text.trim().length<3){toast('Write a few words first');const t=$('#wtext');if(t)t.focus();return;}
  if(z.mine&&z.plan.trim().length<3){toast('Write your plan in one line');const t=$('#wplan');if(t)t.focus();return;}
  const lead=isLeader(),a={type:z.type,unit:z.unit,spot:z.spot.trim(),by:S.me,day:today(),at:Date.now(),text:z.text.trim(),good:z.good.trim(),tag:z.tag,
    status:'issue',owner:'',plan:'',due:''};
  if(z.mine){a.owner=S.me;a.plan=z.plan.trim();a.due=z.due;a.status=lead?'doing':'plan';}
  const u=unitOf(z.unit);if(u)S.open['u:'+u.id]=true;
  closeModal();await put('actions',uid(),a);
  toast(!z.mine?'Raised. It is on the board.':lead?'Raised. Your plan is approved, go ahead.':'Raised. Waiting for '+person(leaderId()).short+' to approve the plan.');
}

/* ---------- plan it: someone takes an open issue ---------- */
function openPlan(id){
  const x=D.actions[id];if(!x)return;
  Wk={id};const quick=[['Today',0],['Tomorrow',1],['3 days',3],['1 week',7]].map(([l,n])=>`<button type="button" class="chip" data-act="qd" data-d="${addDays(today(),n)}">${l}</button>`).join('');
  openModal(`<h2>Your plan</h2><p class="lead">${esc(placeText(x))}</p><p>${esc(x.text)}</p>
    <form id="planf" autocomplete="off"><label class="fl">What will you do? One line.<input id="wplan" maxlength="200" autofocus placeholder="I will ..."></label>
    <div class="fl">Finish by<div class="chips">${quick}<input type="date" id="wdue" value="${addDays(today(),3)}" min="${today()}" aria-label="Pick a date"></div></div>
    <p class="hint">${isLeader()?'You are the leader, so your plan is approved straight away.':esc(person(leaderId()).short)+' approves the plan before you start.'}</p>
    <div class="row"><button class="btn pri big">Send my plan</button><button type="button" class="link" data-act="close">Cancel</button></div></form>${closer}`);
}
async function savePlan(){
  const id=Wk.id,p=$('#wplan').value.trim(),d=$('#wdue').value;if(p.length<3){toast('Write your plan in one line');return;}
  const lead=isLeader();closeModal();
  await patch('actions',id,{owner:S.me,plan:p,due:d||addDays(today(),3),status:lead?'doing':'plan',back:''});
  toast(lead?'Plan approved. Go ahead.':'Plan sent to '+person(leaderId()).short);
}

/* ---------- the two approvals, and the moves between ---------- */
async function okPlan(id){if(!needLead())return;await patch('actions',id,{status:'doing',planOkAt:Date.now(),back:''});toast('Plan approved');}
function openBack(id){
  const x=D.actions[id];if(!x||!needLead())return;Wk={id};
  const toPlan=x.status==='plan';
  openModal(`<h2>Send it back</h2><p class="lead">${toPlan?'The plan goes back. The issue stays open for a new plan.':'The work goes back to '+esc(person(x.owner).short)+' to improve.'}</p>
    <form id="backf"><label class="fl">Why? Ask, do not order. (optional)<textarea id="wnote" rows="3" maxlength="300" autofocus placeholder="For example: Could you also check this against Table 6?"></textarea></label>
    <div class="row"><button class="btn big">Send back</button><button type="button" class="link" data-act="close">Cancel</button></div></form>${closer}`);
}
async function doBack(){
  const id=Wk.id,x=D.actions[id],note=$('#wnote').value.trim();closeModal();if(!x)return;
  if(x.status==='plan')await patch('actions',id,{status:'issue',owner:'',plan:'',due:'',back:note});
  else await patch('actions',id,{status:'doing',back:note,doneAt:null});
  toast('Sent back');
}
async function dropAction(id){const x=D.actions[id];if(!x)return;if(!(isLeader()||x.owner===S.me))return;await patch('actions',id,{status:'issue',owner:'',plan:'',due:'',proposed:'',note:'',back:''});toast('Back on the issue list');}
async function okWork(id){if(!needLead()||!D.actions[id])return;await patch('actions',id,{status:'done',doneAt:Date.now(),doneBy:S.me,back:''});toast('Approved. Done.');}
async function rejectCheck(id){if(!needLead())return;await del('actions',id);toast('Sign-off removed');}
let sure='';
function removeAction(id,btn){
  if(sure!==id){sure=id;btn.textContent='Sure?';btn.classList.add('sure');setTimeout(()=>{if(sure===id){sure='';if(btn.isConnected){btn.innerHTML='&times;';btn.classList.remove('sure');}}},2500);return;}
  sure='';del('actions',id);toast('Removed');
}

/* ---------- submit the finished work ---------- */
function openWork(id){
  const x=D.actions[id];if(!x)return;Wk={id};
  openModal(`<h2>Submit your work</h2><p class="lead">${esc(placeText(x))}</p><p>${esc(x.text)}</p>${x.plan?`<p class="plan"><b>Plan</b> ${esc(x.plan)}</p>`:''}${x.back?`<p class="note"><b>${esc(person(leaderId()).short)} said</b> ${esc(x.back)}</p>`:''}
    <form id="workf" autocomplete="off"><label class="fl">What did you do? One or two lines.<textarea id="wnote" rows="3" maxlength="300" autofocus placeholder="${x.type==='add'?'Added two sentences after the paragraph on remote sites':'Reworded and matched Table 6'}"></textarea></label>
    <label class="fl">The new or changed text (optional, so the leader can read it here)<textarea id="wtext" rows="5" maxlength="4000" placeholder="Paste it here"></textarea></label>
    <p class="hint">${esc(person(leaderId()).short)} checks it before it counts as done.</p>
    <div class="row"><button class="btn pri big">Send for approval</button><button type="button" class="link" data-act="close">Cancel</button></div></form>${closer}`);
}
async function submitWork(){
  const id=Wk.id,note=$('#wnote').value.trim(),txt=$('#wtext').value.trim();
  if(note.length<3){toast('Say what you did');return;}
  closeModal();await patch('actions',id,{status:'review',note,proposed:txt,back:'',workAt:Date.now()});toast('Sent for approval');
}

/* ---------- sign off a chapter: one of the four checks ---------- */
function openCheck(unitId,pass){
  const u=unitOf(unitId);if(!u)return;
  if(u.writer&&u.writer===S.me){toast('You wrote this one. Ask a teammate to check it.');return;}
  Wk={unit:unitId,pass};const P=PASS[pass];
  openModal(`<h2>${esc(P.label)} check</h2><p class="lead">${esc(shortLabel(u))} · ${esc(u.name)}</p><p>${esc(P.help)}</p>
    <form id="checkf"><label class="fl">Anything to add? (optional)<input id="wnote" maxlength="160" placeholder="For example: checked against the outline"></label>
    <p class="hint">Say yes only if you read the whole chapter. ${esc(person(leaderId()).short)} approves the sign-off.</p>
    <div class="row"><button class="btn pri big">I checked it, all good</button><button type="button" class="link" data-act="close">Cancel</button></div></form>${closer}`);
}
async function saveCheck(){
  const w=Wk,note=$('#wnote').value.trim();closeModal();S.open['u:'+w.unit]=true;
  await put('actions',uid(),{type:'check',pass:w.pass,unit:w.unit,by:S.me,owner:S.me,day:today(),at:Date.now(),due:today(),text:note,status:'review'});
  toast('Sign-off sent for approval');
}

/* ---------- add, edit, rename, move or remove a chapter, sub-section or slide (leader) ---------- */
function openUnit(id,art,parent){
  if(!isLeader())return;
  const u=id?unitOf(id):null;
  Ue={id:id||'',art:u?u.art:art,parent:u?u.parent||'':parent||'',writer:u?u.writer||'':'',scaffold:!!(u&&u.scaffold)};
  const isSub=!!Ue.parent,word=Ue.art==='slides'?'slide':isSub?'sub-section':'chapter',par=isSub?unitOf(Ue.parent):null;
  const sibs=isSub?subsOf(Ue.parent):chapters(Ue.art);
  const defShort=!u?(Ue.art==='slides'?String(sibs.length+1):isSub&&par&&/^\d+$/.test(par.short)?par.short+'.'+(sibs.length+1):''):u.short;
  const after=!u&&sibs.length?`<label class="fl">Put it after<select id="uAfter">${sibs.map((s,i)=>`<option value="${esc(s.id)}"${i===sibs.length-1?' selected':''}>${esc(s.short+'  '+snip(s.name,40))}</option>`).join('')}</select></label>`:'';
  openModal(`<h2>${u?'Edit '+word:'Add a '+word}${par?` <small class="sub">in ${esc(shortLabel(par))}</small>`:''}</h2><form id="unitf" autocomplete="off">
    <div class="ur2"><label class="fl">Number or label<input id="uShort" maxlength="10" value="${esc(defShort)}" placeholder="${word==='slide'?'13':isSub?'3.4':'10'}" aria-label="Short label"></label>
    <label class="fl">Name<input id="uName" maxlength="120" value="${esc(u?u.name:'')}" placeholder="${word==='slide'?'What the slide is about':'Title'}" required autofocus></label></div>
    ${isSub?'':`<label class="fl">What goes in it (outline, one or two lines)<textarea id="uOut" rows="3" maxlength="300">${esc(u&&u.outline||'')}</textarea></label>
    <label class="fl">Limit (pages, words or minutes)<input id="uLim" maxlength="60" value="${esc(u&&u.lim||'')}" placeholder="${word==='slide'?'1 min':'max 2 pp'}"></label>
    <div class="fl">Writer<div class="chips"><button type="button" class="chip${Ue.writer?'':' on'}" data-act="uw" data-id="">Not chosen</button>${people().map(p=>`<button type="button" class="chip${Ue.writer===p.id?' on':''}" data-act="uw" data-id="${esc(p.id)}">${avatar(p.id)}<span>${esc(p.short)}</span></button>`).join('')}</div></div>
    <div class="fl"><div class="chips"><button type="button" class="chip${Ue.scaffold?' on':''}" data-act="usc">Do after the other parts (scaffolded)</button></div></div>`}
    ${after}
    <div class="row"><button class="btn pri big">Save</button><button type="button" class="link" data-act="close">Cancel</button>
    ${u?`<span class="grow"></span><button type="button" class="btn sm" data-act="umove" data-dir="-1">Move earlier</button><button type="button" class="btn sm" data-act="umove" data-dir="1">Move later</button><button type="button" class="btn sm danger" data-act="urm">Remove</button>`:''}</div></form>${closer}`);
}
function uePick(id){Ue.writer=id;document.querySelectorAll('#modal [data-act=uw]').forEach(b=>b.classList.toggle('on',b.dataset.id===id));}
function ueScaf(){Ue.scaffold=!Ue.scaffold;$('#modal [data-act=usc]').classList.toggle('on',Ue.scaffold);}
async function saveUnit(){
  const name=$('#uName').value.trim(),short=$('#uShort').value.trim();if(!name){toast('Give it a name');return;}
  const old=Ue.id?unitOf(Ue.id):null,isSub=!!Ue.parent;
  const sibs=isSub?subsOf(Ue.parent):chapters(Ue.art);
  const id=Ue.id||(Ue.art==='slides'?'s-':'r-')+uid();
  let ord=old?old.ord:nextOrd(Ue.art);
  const sel=$('#uAfter');
  if(!old&&sel){const i=sibs.findIndex(s=>s.id===sel.value),a=sibs[i],n=sibs[i+1];ord=a?(n?((Number(a.ord)||0)+(Number(n.ord)||0))/2:Math.max(nextOrd(Ue.art),(Number(a.ord)||0)+1)):ord;}
  const o={...(old?D.units[Ue.id]:{}),art:Ue.art,parent:Ue.parent||'',short:short||(Ue.art==='slides'?String(sibs.length+1):name.slice(0,6)),name,ord};
  if(!isSub){o.outline=$('#uOut').value.trim();o.lim=$('#uLim').value.trim();o.writer=Ue.writer;o.scaffold=Ue.scaffold;}
  const art=Ue.art;closeModal();await put('units',id,o);if(!old)S.open['u:'+id]=true;if(!old&&Ue&&Ue.parent)S.open['u:'+o.parent]=true;toast(old?'Saved':'Added');
}
async function moveUnit(dir){
  const u=unitOf(Ue.id),list=u.parent?subsOf(u.parent):chapters(u.art),i=list.findIndex(s=>s.id===Ue.id),j=i+dir;
  if(i<0||j<0||j>=list.length){toast(dir<0?'Already first':'Already last');return;}
  const a=list[i],b=list[j];let oa=Number(a.ord),ob=Number(b.ord);if(oa===ob)ob=oa+(dir<0?-.5:.5);
  closeModal();await batch([['units',a.id,{...D.units[a.id],ord:ob}],['units',b.id,{...D.units[b.id],ord:oa}]],[]);toast('Moved');
}
let sureU=false;
async function removeUnit(btn){
  const ids=deepIds(Ue.id),na=ids.reduce((s,i)=>s+(X().act[i]||[]).length,0),ns=ids.length-1;
  if(!sureU){sureU=true;btn.textContent=`Sure?${ns?' '+ns+' sub-section'+(ns===1?'':'s')+' go too':''}${na?' with '+na+' action'+(na===1?'':'s'):''}`;btn.classList.add('sure');setTimeout(()=>{sureU=false;if(btn.isConnected){btn.textContent='Remove';btn.classList.remove('sure');}},3500);return;}
  sureU=false;closeModal();
  const dels=ids.flatMap(i=>(X().act[i]||[]).map(a=>['actions',a.id]).concat([['units',i]]));
  await batch([],dels);toast('Removed');
}

/* ---------- our workflow (from Workshop 10) ---------- */
function openFlow(){
  const roles=[['Writer','Everyone. Researches and drafts the chapters or slides.'],['Reviewer','Everyone, but never on their own work. Checks it makes sense and matches the outline.']]
    .concat(PASSES.slice(1).map(([k,l,role,help])=>[role,help+' Holder: '+holderText(k)+'.']));
  openModal(`<h2>Our workflow</h2><p class="lead">Every change travels the same road, like an issue on GitHub. Only the leader moves it past the two gates.</p>
    <ol class="steps2"><li><b>Issue.</b> Anyone flags a flaw, asks for a change or asks for new content.</li><li><b>Plan.</b> Someone says how they will fix it.</li><li><b>Gate 1.</b> ${esc(person(leaderId()).short)} approves the plan.</li><li><b>Work.</b> The owner does it in the report and submits it here.</li><li><b>Gate 2.</b> ${esc(person(leaderId()).short)} approves the work. Then it is done.</li></ol>
    <h3>The four checks, per chapter</h3><ol class="steps2">${PASSES.map(([k,l,role,h])=>`<li><b>${esc(l)}.</b> ${esc(role)}. ${esc(h)}</li>`).join('')}</ol>
    <h3>The five roles</h3><ul class="plain">${roles.map(r=>`<li><b>${esc(r[0])}.</b> ${esc(r[1])}</li>`).join('')}</ul>
    <h3>When you give feedback</h3><ul class="plain"><li>Say what was good first.</li><li>Ask, do not order. For example: Do you think this word might be better?</li><li>If you do not understand it, ask the writer to explain it out loud.</li><li>Do not be harsh.</li></ul>
    <h3>When you get feedback</h3><ul class="plain"><li>It is about the report, not about you.</li><li>Think about all of it before you say no.</li></ul>
    <p class="row"><button class="btn big" data-act="close">Close</button></p>${closer}`);
}

/* ---------- settings (leader only) ---------- */
const rowHtml=(id,short,name)=>`<div class="ur" data-id="${esc(id||'')}"><input data-f="short" value="${esc(short||'')}" maxlength="10" aria-label="Short name" placeholder="Short"><input data-f="name" value="${esc(name||'')}" maxlength="80" aria-label="Full name" placeholder="Full name"><button type="button" class="x" data-act="rmrow" aria-label="Remove">&times;</button></div>`;
function openSettings(){
  if(!isLeader())return;
  const dl=(D.meta.deadlines&&D.meta.deadlines.text)||'';
  const roleChips=['edit','proof','publish'].map(k=>`<div class="fl">${esc(PASS[k].role)}<div class="chips" data-role="${k}">${people().map(p=>`<button type="button" class="chip${roleHolders(k).includes(p.id)?' on':''}" data-act="rolechip" data-id="${esc(p.id)}">${avatar(p.id)}<span>${esc(p.short)}</span></button>`).join('')}</div></div>`).join('');
  openModal(`<h2>Settings</h2><form id="setf"><details open><summary>Team roles</summary>${roleChips}<p class="hint">Writer and Reviewer are everyone.</p></details>
    <details><summary>Team</summary><div class="rows" data-col="people">${people().map(p=>rowHtml(p.id,p.short,p.name)).join('')}</div><button type="button" class="btn sm" data-act="addrow">+ Add</button></details>
    <details><summary>Deadlines</summary><textarea id="sdl" rows="7" aria-label="Deadlines">${esc(dl)}</textarea><p class="hint">One per line: date | report or slides | name</p></details>
    <details><summary>Leader PIN</summary><input id="spin" type="password" inputmode="numeric" maxlength="8" placeholder="New PIN, 4 to 8 digits (leave empty to keep)"></details>
    <details><summary>Database</summary><button type="button" class="btn" data-act="testdb">Test database</button><pre id="dbout" class="out" hidden></pre></details>
    <div class="row"><button class="btn pri big">Save</button><button type="button" class="link" data-act="close">Cancel</button></div></form>${closer}`);
}
async function saveSettings(){
  const jobs=[];const pin=$('#spin').value.trim();
  if(pin&&!/^\d{4,8}$/.test(pin)){toast('PIN: 4 to 8 digits');return;}
  const box=document.querySelector('#setf .rows'),keep=new Set();let ord=0;
  box.querySelectorAll('.ur').forEach(r=>{
    const short=r.querySelector('[data-f=short]').value.trim(),name=r.querySelector('[data-f=name]').value.trim();
    if(!short&&!name)return;
    const id=r.dataset.id||uid();keep.add(id);
    jobs.push(put('people',id,{...(D.people[id]||{}),short:short||name.split(' ')[0],name:name||short,ord:ord++}));
  });
  people().forEach(p=>{if(!keep.has(p.id)&&p.id!==leaderId())jobs.push(del('people',p.id));});
  const roles={};document.querySelectorAll('#setf [data-role]').forEach(c=>{roles[c.dataset.role]=[...c.querySelectorAll('.chip.on')].map(b=>b.dataset.id);});
  jobs.push(put('meta','roles',roles));
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
