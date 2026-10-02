'use strict';
/* ---------- events ---------- */
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-tab],[data-sub],[data-act]');if(!t)return;
  const d=t.dataset;
  if(d.tab){S.view=d.tab;ls.set('hub.view',S.view);render();window.scrollTo(0,0);return;}
  if(d.sub){const p=d.sub.split(':');S.sub[p[0]]=p[1];render();return;}
  switch(d.act){
   case 'close':closeForm();break;
   case 'form-del':if(FORM&&FORM.onDelete){if(!FORM.armed){FORM.armed=true;t.textContent='Click again to delete';break;}const fn=FORM.onDelete;closeForm();fn();}break;
   case 'edit-sec':F.sec(d.id);break; case 'add-sec':F.sec();break;
   case 'add-paper':F.paper();break; case 'edit-paper':F.paper(d.id);break;
   case 'add-idea':F.idea();break; case 'edit-idea':F.idea(d.id);break;
   case 'add-task':F.task();break; case 'edit-task':F.task(d.id);break;
   case 'add-person':F.person();break; case 'edit-person':F.person(d.id);break;
   case 'add-contrib':F.contrib();break; case 'edit-contrib':F.contrib(d.id);break;
   case 'add-slide':F.slide();break; case 'edit-slide':F.slide(d.id);break;
   case 'add-deadline':F.deadline();break; case 'edit-deadline':F.deadline(d.id);break;
   case 'add-risk':F.risk();break; case 'edit-risk':F.risk(d.id);break;
   case 'add-plan':F.plan();break; case 'edit-plan':F.plan(d.id);break;
   case 'add-crit':F.crit();break; case 'edit-crit':F.crit(d.id);break;
   case 'add-topic':F.topic();break; case 'edit-topic':F.topic(d.id);break;
   case 'add-week':F.week();break; case 'edit-week':F.week(d.id);break;
   case 'edit-brief':F.brief();break; case 'add-role':F.role();break; case 'edit-role':F.role(d.id);break;
   case 'add-flow':F.flow();break; case 'edit-flow':F.flow(d.id);break; case 'edit-guide':F.guide(d.g);break;
   case 'rv-done':patch('sections',rvSec(),{status:'reviewed'});toast('Marked Reviewed');break;
   case 'edit-proj':F.proj();break; case 'edit-lists':F.lists();break;
   case 'preset-final':preset('final');break; case 'preset-reflect':preset('reflect');break;
   case 'inbox-del':del('inbox',d.id);break;
   case 'inbox-task':{const i=D.inbox[d.id];if(i)F.task(null,{title:i.text,wk:'10',status:'todo'},()=>del('inbox',d.id));break;}
   case 'reset':{if(!t.dataset.armed){t.dataset.armed='1';t.dataset.label=t.textContent;t.textContent='Click again to confirm';setTimeout(()=>{if(t.isConnected&&t.dataset.armed){delete t.dataset.armed;t.textContent=t.dataset.label;}},4000);break;}
     resetCol(d.col).then(()=>toast('Reset to the built-in list'));break;}
   case 'export':exportTab();break;
   case 'copy-refs':copyRefs();break;
   case 'backup':saveFile('engg982-hub-backup-'+today()+'.json',JSON.stringify(D,null,1),'application/json');break;
   case 'save-txt':if(LASTTXT)saveFile(LASTTXT.title.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'-'+today()+'.txt',LASTTXT.text,'text/plain');break;
   case 'copy':{const ta=$('#reftext');if(ta){ta.select();let ok=false;try{ok=document.execCommand&&document.execCommand('copy');}catch(x){}
     if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(ta.value).then(()=>toast('Copied')).catch(()=>toast(ok?'Copied':'Select the text and copy it'));}else toast(ok?'Copied':'Select the text and copy it');}break;}
  }
});
document.addEventListener('change',e=>{
  const t=e.target,c=t.dataset&&t.dataset.chg;if(!c)return;const id=t.dataset.id;
  switch(c){
   case 'sec-status':patch('sections',id,{status:t.value});break;
   case 'sec-writer':patch('sections',id,{writer:t.value});break;
   case 'sec-reviewer':patch('sections',id,{reviewer:t.value});break;
   case 'sec-editor':patch('sections',id,{editor:t.value});break;
   case 'sec-proofreader':patch('sections',id,{proofreader:t.value});break;
   case 'flow-step':put('meta','flowDone',{...(D.meta.flowDone||{}),[t.dataset.k]:t.checked});break;
   case 'rv-sec':S.rv=t.value;render();break;
   case 'rv-tick':{const id2=rvSec(),cur=(D.sections[id2]||{}).rv||{};patch('sections',id2,{rv:{...cur,[t.dataset.k]:t.checked}});break;}
   case 'rv-note':patch('sections',rvSec(),{fb:t.value});break;
   case 'task-status':patch('tasks',id,{status:t.value});break;
   case 'task-owner':patch('tasks',id,{owner:t.value});break;
   case 'slide-status':patch('slides',id,{status:t.value});break;
   case 'slide-who':patch('slides',id,{who:t.value});break;
   case 'idea-status':patch('ideas',id,{status:t.value});break;
   case 'cov-done':case 'cov-sec':{const cov=D.meta.coverage||{},k=t.dataset.k,cur=cov[k]||{};put('meta','coverage',{...cov,[k]:c==='cov-done'?{...cur,done:t.checked}:{...cur,sec:t.value}});break;}
   case 'filter':S.f[t.dataset.g][t.dataset.k]=t.value;render();break;
   case 'final-min':put('meta','settings',{...(D.meta.settings||{}),finalMin:t.value===''?'':parseFloat(t.value)});break;
   case 'restore':{const file=t.files&&t.files[0];if(!file)break;const rd=new FileReader();rd.onload=()=>{try{const j=JSON.parse(rd.result);let n=0;COLS.forEach(col=>{Object.entries(j[col]||{}).forEach(([i,v])=>{put(col,i,v);n++;});});toast('Restored '+n+' records');}catch(x){toast('That file is not a valid backup.');}};rd.readAsText(file);t.value='';break;}
  }
});
function copyRefs(){
  const list=arr('papers').filter(p=>p.st==='cited'&&p.ref).sort((a,b)=>String(a.authors).localeCompare(String(b.authors)));
  const txt=list.map((p,i)=>'['+(i+1)+'] '+String(p.ref).replace(/^\s*\[\d+\]\s*/,'')).join('\n');
  LASTTXT={title:'Reference list',text:txt};FORM={fields:[],onSave:()=>{}};
  $('#modal').innerHTML=`<div class="scrim" data-act="close"></div><div class="sheet"><h3>Reference list (cited sources)</h3><p class="muted" style="margin:0">Numbered alphabetically for now. IEEE numbers by first appearance in the text, so renumber when the report is frozen.</p>
   <textarea id="reftext" class="big" readonly>${esc(txt||'No source is marked Cited with reference text yet.')}</textarea><div class="row end"><button class="btn" data-act="close">Close</button><button class="btn" data-act="save-txt">Save .txt</button><button class="btn pri" data-act="copy">Copy</button></div></div>`;
  $('#modal').hidden=false;
}
setInterval(()=>{if(S.view==='dash'||S.view==='plan')schedule();},60000);
init();
