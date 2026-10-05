'use strict';
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-act],[data-wz]');
  if(!t)return;
  if(t.dataset.wz){const i=t.dataset.wz.indexOf(':');return wz(i<0?t.dataset.wz:t.dataset.wz.slice(0,i),i<0?'':t.dataset.wz.slice(i+1));}
  const d=t.dataset,id=d.id;
  switch(d.act){
    case 'close':closeModal();break;
    case 'who':openWho();break;
    case 'pick':pickPerson(id);break;
    case 'signout':signOut();break;
    case 'flow':openFlow();break;
    case 'tab':setTab(id);break;
    case 'tog':S.open[d.key]=!S.open[d.key];render();break;
    case 'view':setView(d.art,id);break;
    case 'stage':setView(d.art,'board');break;
    case 'sq':pickSq(d.art,id);break;
    case 'goto':goTo(d.unit);break;
    case 'new':openNew({type:d.type,unit:d.unit});break;
    case 'check':openCheck(d.unit,d.pass);break;
    case 'plan':openPlan(id);break;
    case 'okplan':okPlan(id);break;
    case 'back':openBack(id);break;
    case 'drop':dropAction(id);break;
    case 'work':openWork(id);break;
    case 'okwork':okWork(id);break;
    case 'rej':rejectCheck(id);break;
    case 'del':removeAction(id,t);break;
    case 'qd':{const f=$('#wdue');if(f)f.value=d.d;break;}
    case 'who-f':S.who=id;render();break;
    case 'unfilt':S.filt[d.art]='';render();break;
    case 'more':S.allDone=true;render();break;
    case 'uedit':openUnit(id,d.art,d.parent);break;
    case 'uw':uePick(id);break;
    case 'usc':ueScaf();break;
    case 'umove':moveUnit(Number(d.dir));break;
    case 'urm':removeUnit(t);break;
    case 'settings':openSettings();break;
    case 'rolechip':t.classList.toggle('on');break;
    case 'addrow':{const box=t.previousElementSibling;box.insertAdjacentHTML('beforeend',rowHtml('','',''));box.lastElementChild.querySelector('input').focus();break;}
    case 'rmrow':t.closest('.ur').remove();break;
    case 'testdb':testDb(t);break;
  }
});
document.addEventListener('submit',e=>{
  e.preventDefault();
  const f=e.target.id;
  if(f==='pinf')submitPin();
  if(f==='setf')saveSettings();
  if(f==='unitf')saveUnit();
  if(f==='planf')savePlan();
  if(f==='backf')doBack();
  if(f==='workf')submitWork();
  if(f==='checkf')saveCheck();
  });
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#modal').hidden)closeModal();});
/* the leader must enter the PIN again in each new browser session */
if(S.me===leaderId()&&!S.lead){S.me='';}
init();
