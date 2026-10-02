'use strict';
const deadlines=()=>items('deadlines').map(d=>({...d,t:zoned(d.date,d.time)})).sort((a,b)=>a.t-b.t);
const people=()=>arr('people').sort((a,b)=>(a.ord??9)-(b.ord??9)||String(a.name).localeCompare(String(b.name)));
const pn=id=>{const p=D.people[id];return p?(p.short||p.name):'';};
const secName=id=>{const s=secBy(id);return s?((s.no?s.no+' ':'')+s.name):'';};
const secStat=id=>(D.sections[id]||{}).status||'todo';
const pArr=()=>[['','Unassigned'],...people().map(p=>[p.id,p.short||p.name])];
const sArr=()=>[['','None'],...SECS().map(s=>[s.id,(s.no?s.no+' ':'')+s.name])];
const fnArr=()=>[['','—'],...L('functions').map(x=>[x,x])];
function secFlags(s){
  const r=D.sections[s.id]||{},i=STI[r.status||'todo'],out=[];
  if(i>=STI.written&&!r.reviewer)out.push(['warn','needs a reviewer']);
  if(i>=STI.written&&!r.editor)out.push(['bad','needs an editor']);
  if(r.writer&&r.editor&&r.writer===r.editor)out.push(['bad','writer is also editor']);
  if(r.writer&&r.reviewer&&r.writer===r.reviewer)out.push(['bad','writer is also reviewer']);
  if(i>=STI.outline&&!r.writer)out.push(['warn','no writer']);
  if(s.max!==''&&s.max!=null&&Number(s.max)>0&&r.size!==''&&r.size!=null&&Number(r.size)>Number(s.max))out.push(['warn','over limit']);
  return out;
}
function allFlags(){
  const out=[];
  SECS().forEach(s=>secFlags(s).forEach(f=>out.push({l:f[0],t:`${secName(s.id)}: ${f[1]}`})));
  arr('tasks').filter(t=>t.status!=='done'&&t.due).forEach(t=>{const n=daysTo(t.due);if(n<0)out.push({l:'bad',t:`Overdue ${-n}d: ${t.title}${t.owner?' ('+pn(t.owner)+')':''}`});});
  people().forEach(p=>{const last=arr('contrib').filter(c=>c.person===p.id).map(c=>c.date).sort().pop();
    if(!last||daysTo(last)<-7)out.push({l:'warn',t:`${p.short||p.name}: no contribution logged ${last?'since '+fmtD(last):'yet'}`});});
  const cov=D.meta.coverage||{};const open=TOPICS().filter(t=>!(cov[t.id]||{}).done).length;
  if(open)out.push({l:'warn',t:`${open} required topics not yet placed in the report`});
  const B=brief();const gaps=['purpose','audience','knows','usage'].filter(k=>!String(B[k]||'').trim()).length;
  if(gaps)out.push({l:'warn',t:`Report brief: ${gaps} of 4 questions unanswered (purpose, audience, what they know, how they will use it)`});
  ROLES().filter(r=>!r.all&&!(r.who||[]).length).forEach(r=>out.push({l:'warn',t:`No one chosen for the ${r.name} role`}));
  const un=arr('papers').filter(p=>!p.supports).length;
  if(un)out.push({l:'warn',t:`${un} sources not linked to a report section`});
  return out;
}
function critReady(c){const list=SECS().filter(s=>c.all||(s.crit||[]).includes(c.id));const r=list.filter(s=>STI[secStat(s.id)]>=STI.edited).length;return {r,n:list.length,pc:list.length?Math.round(100*r/list.length):0};}

/* ---------- list getters shared by the screen and the text export ---------- */
function papersList(){const f=S.f.papers,q=f.q.toLowerCase();return arr('papers').filter(p=>(!f.fn||p.fn===f.fn)&&(!f.st||p.st===f.st)&&(!q||[p.title,p.authors,p.tag,p.finding].join(' ').toLowerCase().includes(q))).sort((a,b)=>String(a.title).localeCompare(String(b.title)));}
function tasksList(){const f=S.f.tasks;return arr('tasks').filter(t=>(!f.owner||t.owner===f.owner)&&(!f.st||t.status===f.st)&&(!f.wk||t.wk===f.wk)).sort((a,b)=>(a.due||'9').localeCompare(b.due||'9')||String(a.title).localeCompare(String(b.title)));}
function ledgerList(){const f=S.f.ledger;return arr('contrib').filter(c=>!f.person||c.person===f.person).sort((a,b)=>String(b.date).localeCompare(String(a.date)));}
const slidesList=deck=>arr('slides').filter(s=>(s.deck||'final')===deck).sort((a,b)=>(a.n||0)-(b.n||0));
function presBudget(deck){const set=D.meta.settings||{};if(deck==='reflect')return {budget:5,cut:5.5};return {budget:set.finalMin===''||set.finalMin==null?null:Number(set.finalMin),cut:null};}
const PAPER_ST={toread:'To read',read:'Read',cited:'Cited'};

const brief=()=>({...DEFBRIEF,...(D.meta.brief||{})});
const readyCount=()=>SECS().filter(s=>STI[secStat(s.id)]>=STI.edited).length;
/* how many sections each person holds in each role, for balancing the load */
function load(pid){const o={writer:0,reviewer:0,editor:0,proofreader:0};SECS().forEach(s=>{const r=D.sections[s.id]||{};Object.keys(o).forEach(k=>{if(r[k]===pid)o[k]++;});});return o;}
