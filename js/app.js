'use strict';
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-act],[data-wz]');if(!t)return;
  if(t.dataset.wz){const i=t.dataset.wz.indexOf(':');return wz(i<0?t.dataset.wz:t.dataset.wz.slice(0,i),i<0?'':t.dataset.wz.slice(i+1));}
  const d=t.dataset,id=d.id;
  switch(d.act){
    case 'close':closeModal();break;
    case 'who':openWho();break;
    case 'pick':pickPerson(id);break;
    case 'signout':signOut();break;
    case 'add':openAdd(d.unit);break;
    case 'unit':S.unit=S.unit===id?'':id;render();break;
    case 'who-f':S.who=id;render();break;
    case 'clear':S.unit='';S.who='';S.art='';render();break;
    case 'more':S.allDone=true;render();break;
    case 'take':case 'fixed':case 'approve':case 'back':moveAction(id,d.act);break;
    case 'del':removeAction(id,t);break;
    case 'settings':openSettings();break;
    case 'addrow':{const box=t.previousElementSibling;box.insertAdjacentHTML('beforeend',rowHtml('','',''));box.lastElementChild.querySelector('input').focus();break;}
    case 'rmrow':t.closest('.ur').remove();break;
    case 'testdb':testDb(t);break;
  }
});
document.addEventListener('submit',e=>{
  e.preventDefault();
  if(e.target.id==='pinf')submitPin();
  if(e.target.id==='setf')saveSettings();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#modal').hidden)closeModal();});
document.addEventListener('input',e=>{if(e.target.id==='wtext'&&Wz)Wz.text=e.target.value;});
/* the leader must enter the PIN again in each new browser session */
if(S.me===leaderId()&&!S.lead){S.me='';}
init();
