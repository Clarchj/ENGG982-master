'use strict';
/* ---------- forms ---------- */
let FORM=null;
function fieldHtml(f,v){
  const val=v[f.k]!=null?v[f.k]:(f.def!=null?f.def:'');const id='ff-'+f.k;let inp;
  if(f.t==='checks'){const cur=Array.isArray(v[f.k])?v[f.k]:[];return `<fieldset class="fld"><span>${esc(f.label)}</span><div class="row">${f.opts.map(o=>`<label class="chk"><input type="checkbox" name="${f.k}" value="${esc(o[0])}"${cur.includes(o[0])?' checked':''}>${esc(o[1])}</label>`).join('')}</div></fieldset>`;}
  if(f.t==='area')inp=`<textarea id="${id}" name="${f.k}" rows="${f.rows||3}" placeholder="${esc(f.ph||'')}">${esc(val)}</textarea>`;
  else if(f.t==='sel')inp=`<select id="${id}" name="${f.k}">${opts(f.opts,val)}</select>`;
  else inp=`<input id="${id}" name="${f.k}" type="${f.t==='num'?'number':f.t==='date'?'date':f.t==='time'?'time':'text'}"${f.t==='num'?' step="any"':''} value="${esc(val)}" placeholder="${esc(f.ph||'')}"${f.req?' required':''}${f.ro?' readonly':''}>`;
  return `<label class="fld${f.half?' half':''}" for="${id}"><span>${esc(f.label)}</span>${inp}</label>`;
}
function openForm(o){
  FORM=o;const v=o.values||{};
  $('#modal').innerHTML=`<div class="scrim" data-act="close"></div><form class="sheet" id="f" autocomplete="off"><h3>${esc(o.title)}</h3>${o.fields.map(f=>fieldHtml(f,v)).join('')}
   <div class="row end">${o.onDelete?'<button type="button" class="btn danger" data-act="form-del">Delete</button>':''}<span class="grow"></span><button type="button" class="btn" data-act="close">Cancel</button><button class="btn pri">Save</button></div></form>`;
  $('#modal').hidden=false;const first=$('#f input,#f textarea,#f select');if(first)first.focus();
}
function closeForm(){FORM=null;$('#modal').hidden=true;$('#modal').innerHTML='';}
document.addEventListener('submit',e=>{
  if(e.target.matches('#cap')){e.preventDefault();const i=$('#capin');const t=i.value.trim();if(!t)return;i.value='';put('inbox',uid(),{text:t,at:new Date().toISOString()});toast('Saved to Inbox');return;}
  if(e.target.matches('#f')&&FORM){e.preventDefault();const fd=new FormData(e.target),vals={};
    FORM.fields.forEach(f=>{if(f.t==='checks'){vals[f.k]=fd.getAll(f.k);return;}let x=fd.get(f.k);if(x==null)x='';if(f.t==='num')x=x===''?'':parseFloat(x);else if(typeof x==='string')x=x.trim();vals[f.k]=x;});
    const cb=FORM.onSave;closeForm();cb(vals);}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&FORM)closeForm();});

const ordF={k:'ord',label:'Order',t:'num',half:1};
const F={
 async sec(id){await ensure('secdefs');
  const def=id?item('secdefs',id):{no:'',name:'',lim:'',unit:'pp',max:'',ev:'',crit:[],ord:nextOrd('secdefs')};
  const st=id?(D.sections[id]||{}):{status:'todo'};
  openForm({title:id?def.name:'Add section',values:{...st,...def},fields:[
   {k:'name',label:'Section name',t:'text',req:1},{k:'no',label:'Number',t:'text',half:1},ordF,
   {k:'lim',label:'Limit, as written in the brief',t:'text',half:1},{k:'max',label:'Numeric limit',t:'num',half:1},
   {k:'unit',label:'Unit',t:'sel',half:1,opts:[['pp','pages'],['words','words'],['','none']]},{k:'size',label:'Size now',t:'num',half:1},
   {k:'ev',label:'What the brief says the section must contain',t:'area'},
   {k:'outline',label:'Our outline: a short paragraph or dot points on what this section will say',t:'area',rows:4},
   {k:'mode',label:'Planning',t:'sel',opts:MODES},
   {k:'crit',label:'Rubric criteria this section supports',t:'checks',opts:CRIT().filter(c=>!c.all).map(c=>[c.id,c.name])},
   {k:'status',label:'Status',t:'sel',opts:ST,half:1,def:'todo'},{k:'writer',label:'Researcher/Writer',t:'sel',opts:pArr(),half:1},
   {k:'reviewer',label:'Reviewer',t:'sel',opts:pArr(),half:1},{k:'editor',label:'Editor',t:'sel',opts:pArr(),half:1},{k:'proofreader',label:'Proofreader',t:'sel',opts:pArr(),half:1},
   {k:'link',label:'Link to the section in OneDrive',t:'text',ph:'https://...'},{k:'note',label:'Notes',t:'area',ph:'Open issues, evidence still needed'}],
   onSave:v=>{const nid=id||uid();put('secdefs',nid,{no:v.no,name:v.name,lim:v.lim,unit:v.unit,max:v.max,ev:v.ev,outline:v.outline,mode:v.mode,crit:v.crit,ord:v.ord===''?nextOrd('secdefs'):v.ord});
     put('sections',nid,{...st,status:v.status,writer:v.writer,reviewer:v.reviewer,editor:v.editor,proofreader:v.proofreader,size:v.size,link:v.link,note:v.note});},
   onDelete:id?()=>{del('secdefs',id);del('sections',id);}:null});},
 paper(id){const p=id?D.papers[id]:{};
  openForm({title:id?'Edit source':'Add source',values:p,fields:[
   {k:'title',label:'Title',t:'text',req:1},{k:'authors',label:'Authors or organisation',t:'text',half:1},{k:'year',label:'Year',t:'text',half:1},
   {k:'venue',label:'Journal, standard no. or publisher',t:'text',half:1},{k:'type',label:'Type',t:'sel',half:1,opts:L('types').map(x=>[x,x])},
   {k:'url',label:'Link or DOI',t:'text'},{k:'fn',label:'Business function',t:'sel',half:1,opts:fnArr()},{k:'tag',label:'Tags (mining subtopic)',t:'text',half:1,ph:'predictive maintenance, ore sorting'},
   {k:'supports',label:'Supports report section',t:'sel',opts:sArr(),half:1},{k:'st',label:'Status',t:'sel',half:1,def:'toread',opts:[['toread','To read'],['read','Read'],['cited','Cited in report']]},
   {k:'finding',label:'Key finding, in your words',t:'area'},{k:'ref',label:'IEEE reference text',t:'area',ph:'[n] A. Author, "Title," Journal, vol., no., pp., year.'}],
   onSave:v=>put('papers',id||uid(),{...p,...v}),onDelete:id?()=>del('papers',id):null});},
 idea(id){const i=id?D.ideas[id]:{};
  openForm({title:id?'Edit idea':'Add idea',values:i,fields:[
   {k:'title',label:'Idea or subtopic',t:'text',req:1},{k:'note',label:'Why it matters for this client',t:'area'},
   {k:'fn',label:'Business function',t:'sel',half:1,opts:fnArr()},{k:'status',label:'Stage',t:'sel',half:1,def:'idea',opts:IDEA_COLS},
   {k:'supports',label:'Report section',t:'sel',half:1,opts:sArr()},{k:'owner',label:'Owner',t:'sel',half:1,opts:pArr()}],
   onSave:v=>put('ideas',id||uid(),{...i,...v}),onDelete:id?()=>del('ideas',id):null});},
 task(id,pre,after){const t=id?D.tasks[id]:(pre||{});
  openForm({title:id?'Edit task':'Add task',values:t,fields:[
   {k:'title',label:'Task',t:'text',req:1},{k:'owner',label:'Owner',t:'sel',half:1,opts:pArr()},{k:'due',label:'Due',t:'date',half:1},
   {k:'wk',label:'Week',t:'sel',half:1,def:'10',opts:WEEKS().map(w=>[w.id,wkShort(w)])},{k:'status',label:'Status',t:'sel',half:1,def:'todo',opts:TST},
   {k:'section',label:'Report section',t:'sel',opts:sArr()},{k:'note',label:'Notes',t:'area',rows:2}],
   onSave:v=>{put('tasks',id||uid(),{...(id?t:{}),...v});if(after)after();},onDelete:id?()=>del('tasks',id):null});},
 person(id){const p=id?D.people[id]:{ord:people().length};
  openForm({title:id?'Edit person':'Add person',values:p,fields:[
   {k:'name',label:'Full name',t:'text',req:1},{k:'short',label:'Short name',t:'text',half:1},{k:'role',label:'Team role',t:'text',half:1},
   {k:'disc',label:'Discipline',t:'text',half:1},{k:'fn',label:'Business function',t:'sel',half:1,opts:fnArr()},ordF],
   onSave:v=>put('people',id||uid(),{...p,...v}),onDelete:id?()=>del('people',id):null});},
 contrib(id){const c=id?D.contrib[id]:{date:today()};
  openForm({title:id?'Edit entry':'Log contribution',values:c,fields:[
   {k:'date',label:'Date',t:'date',half:1,req:1},{k:'person',label:'Who',t:'sel',half:1,opts:pArr()},{k:'kind',label:'Type',t:'sel',half:1,opts:L('kinds').map(x=>[x,x])},{k:'section',label:'Report section',t:'sel',half:1,opts:sArr()},
   {k:'what',label:'What was done',t:'area',ph:'Specific. For example: drew the system diagram in the Week 6 workshop'},{k:'proof',label:'Proof: link, or where the screenshot is',t:'text'}],
   onSave:v=>put('contrib',id||uid(),{...c,...v}),onDelete:id?()=>del('contrib',id):null});},
 slide(id){const deck=S.sub.pres;const s=id?D.slides[id]:{deck,n:slidesList(deck).length+1,status:'todo'};
  openForm({title:id?'Edit slide':'Add slide',values:s,fields:[
   {k:'title',label:'Slide title',t:'text',req:1},{k:'n',label:'Order',t:'num',half:1},{k:'min',label:'Minutes',t:'num',half:1},
   {k:'who',label:'Speaker',t:'sel',half:1,opts:pArr()},{k:'section',label:'Report section',t:'sel',half:1,opts:sArr()},
   {k:'asset',label:'Evidence or visual needed',t:'area',rows:2},{k:'status',label:'Status',t:'sel',def:'todo',opts:[['todo','To do'],['draft','Draft'],['done','Done']]}],
   onSave:v=>put('slides',id||uid(),{...s,...v,deck:s.deck||deck}),onDelete:id?()=>del('slides',id):null});},
 async brief(){const B=brief();
  openForm({title:'Report brief',values:B,fields:[
   {k:'purpose',label:'What is the purpose of the report?',t:'area',rows:3},{k:'audience',label:'Who is the audience?',t:'area',rows:2},
   {k:'knows',label:'How much does the audience know?',t:'area',rows:2},{k:'usage',label:'How will the audience use the report?',t:'area',rows:2},
   {k:'effect',label:'How do these answers change the way we write?',t:'area',rows:3},
   {k:'approach',label:'Team writing approach',t:'sel',half:1,opts:APPROACH},{k:'approachNote',label:'How we apply it',t:'area',rows:3}],
   onSave:v=>put('meta','brief',v)});},
 async role(id){await ensure('roles');const r=id?item('roles',id):{ord:nextOrd('roles'),who:[],all:false};
  openForm({title:id?r.name:'Add role',values:{...r,all:r.all?'1':''},fields:[
   {k:'name',label:'Role',t:'text',req:1},{k:'about',label:'What the role is about',t:'area',rows:3},{k:'hint',label:'Who suits it',t:'text'},
   {k:'all',label:'Held by',t:'sel',half:1,opts:[['','Chosen people'],['1','Everyone']]},ordF,
   {k:'who',label:'Chosen people',t:'checks',opts:pArr().slice(1)}],
   onSave:v=>put('roles',id||uid(),{name:v.name,about:v.about,hint:v.hint,all:v.all==='1',who:v.who,ord:v.ord===''?r.ord:v.ord}),onDelete:id?()=>del('roles',id):null});},
 async flow(id){await ensure('flow');const f=id?item('flow',id):{ord:nextOrd('flow'),steps:[],st:'',role:''};
  openForm({title:id?f.title:'Add stage',values:{...f,steps:(f.steps||[]).join('\n')},fields:[
   {k:'title',label:'Stage',t:'text',req:1},{k:'when',label:'When',t:'text',half:1},ordF,
   {k:'role',label:'Role in charge',t:'sel',half:1,opts:[['','None'],...ROLES().map(r=>[r.id,r.name])]},
   {k:'st',label:'Counts sections that have reached',t:'sel',half:1,opts:[['','Nothing'],...ST.slice(1)]},
   {k:'steps',label:'Steps, one per line',t:'area',rows:7}],
   onSave:v=>put('flow',id||uid(),{title:v.title,when:v.when,role:v.role,st:v.st,steps:String(v.steps).split('\n').map(x=>x.trim()).filter(Boolean),ord:v.ord===''?f.ord:v.ord}),onDelete:id?()=>del('flow',id):null});},
 async guide(g){await ensure('guide');const cur=GUIDE(g),title=(GROUPS.find(x=>x[0]===g)||[0,g])[1];
  openForm({title,values:{text:cur.map(i=>i.text).join('\n')},fields:[{k:'text',label:'One item per line',t:'area',rows:10}],
   onSave:v=>{const lines=String(v.text).split('\n').map(x=>x.trim()).filter(Boolean),base=items('guide').reduce((m,x)=>Math.max(m,Number(x.ord)||0),0)+1;
     const keep=new Set();lines.forEach((t,i)=>{const id=cur[i]?cur[i].id:g+'_'+uid()+i;keep.add(id);put('guide',id,{group:g,text:t,ord:cur[i]?cur[i].ord:base+i});});
     cur.forEach(x=>{if(!keep.has(x.id))del('guide',x.id);});}});},
 async deadline(id){await ensure('deadlines');const d=id?item('deadlines',id):{date:today(),time:'17:00',ord:nextOrd('deadlines')};
  openForm({title:id?'Edit milestone':'Add milestone',values:d,fields:[{k:'label',label:'Milestone',t:'text',req:1},{k:'date',label:'Date',t:'date',half:1,req:1},{k:'time',label:'Time (Sydney)',t:'time',half:1},{k:'note',label:'Notes',t:'area',rows:2}],
   onSave:v=>put('deadlines',id||uid(),{...v,ord:d.ord}),onDelete:id?()=>del('deadlines',id):null});},
 async risk(id){await ensure('risks');const r=id?item('risks',id):{impact:'Medium',likelihood:'Medium',ord:nextOrd('risks')};
  openForm({title:id?'Edit risk':'Add risk',values:r,fields:[{k:'title',label:'Risk',t:'text',req:1},{k:'impact',label:'Impact',t:'sel',half:1,opts:LEVELS},{k:'likelihood',label:'Likelihood',t:'sel',half:1,opts:LEVELS},{k:'note',label:'Controls and notes',t:'area'}],
   onSave:v=>put('risks',id||uid(),{...v,ord:r.ord}),onDelete:id?()=>del('risks',id):null});},
 async plan(id){await ensure('plantext');const p=id?item('plantext',id):{ord:nextOrd('plantext')};
  openForm({title:id?'Edit plan section':'Add plan section',values:p,fields:[{k:'title',label:'Heading',t:'text',req:1},ordF,{k:'body',label:'Text (a blank line starts a new paragraph)',t:'area',rows:9}],
   onSave:v=>put('plantext',id||uid(),v),onDelete:id?()=>del('plantext',id):null});},
 async crit(id){await ensure('criteria');const c=id?item('criteria',id):{marks:10,ord:nextOrd('criteria'),all:''};
  openForm({title:id?'Edit criterion':'Add criterion',values:c,fields:[{k:'name',label:'Criterion',t:'text',req:1},{k:'marks',label:'Marks',t:'num',half:1},ordF,{k:'all',label:'Applies to',t:'sel',opts:[['','Only sections that tick it'],['1','Every section']]}],
   onSave:v=>put('criteria',id||uid(),v),onDelete:id?()=>del('criteria',id):null});},
 async topic(id){await ensure('topics');const t=id?item('topics',id):{ord:nextOrd('topics')};
  openForm({title:id?'Edit topic':'Add topic',values:t,fields:[{k:'title',label:'Topic the report must cover',t:'text',req:1},ordF],
   onSave:v=>put('topics',id||uid(),v),onDelete:id?()=>del('topics',id):null});},
 async week(id){await ensure('weeks');const w=id?item('weeks',id):{ord:nextOrd('weeks')};
  const fields=id?[{k:'title',label:'Title',t:'text',req:1},ordF]:[{k:'id',label:'Short code used on tasks (for example 14)',t:'text',req:1,half:1},ordF,{k:'title',label:'Title',t:'text',req:1}];
  openForm({title:id?'Edit week':'Add week',values:w,fields,onSave:v=>{const nid=id||v.id;if(!nid)return;put('weeks',nid,{title:v.title,ord:v.ord===''?w.ord:v.ord});},onDelete:id?()=>del('weeks',id):null});},
 proj(){const P=proj();openForm({title:'Project details',values:P,fields:[{k:'team',label:'Team name',t:'text'},{k:'client',label:'Client',t:'text'},{k:'topic',label:'Topic',t:'text'}],onSave:v=>put('meta','project',v)});},
 lists(){openForm({title:'Lists, one item per line',values:{functions:L('functions').join('\n'),kinds:L('kinds').join('\n'),types:L('types').join('\n')},fields:[
   {k:'functions',label:'Business functions',t:'area',rows:6},{k:'kinds',label:'Contribution types',t:'area',rows:6},{k:'types',label:'Source types',t:'area',rows:4}],
   onSave:v=>{const sp=s=>String(s).split('\n').map(x=>x.trim()).filter(Boolean);put('meta','lists',{functions:sp(v.functions),kinds:sp(v.kinds),types:sp(v.types)});}});}
};
function preset(deck){
  const A=deck==='reflect'?[
   ['Professional practice against our team standards',1,'','Charter clauses you kept, deadlines met, attendance, minutes with no complaints'],
   ['Evidence of my contribution',3.5,'','Screenshots with dates: minutes, diagrams, sections, edits. Show it, do not explain it.'],
   ['Performance reflection and improvement',0.5,'','One strength, one gap, one specific change'],
   ['References',0,'','All images and data cited, IEEE or Harvard']
  ]:[
   ['Title, team and client',0.5,''],['Problem and context',1,'s1'],['Proposed solution at a glance',1.5,'s2'],['System model',1,'s3'],['Requirements to design features',1,'s4'],
   ['Why this is the best option, on cost and other metrics',2,'s8'],['Risk, safety and ethics',1,'s6'],['Standards and compliance',1,'s7'],['Human factors and sustainability',1,''],
   ['Optimisation and validation',1,'s9'],['Recommendation and next steps',1,'concl'],['Questions',0,'']
  ].map(a=>[a[0],a[1],a[2],'']);
  const base=slidesList(deck).length;
  A.forEach((a,i)=>put('slides',uid()+i,{deck,n:base+i+1,title:a[0],min:a[1],section:a[2],asset:a[3],status:'todo'}));
  toast('Starter outline added');
}
