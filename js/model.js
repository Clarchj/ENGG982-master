'use strict';
/*
  Reading the data. One cached index, rebuilt only when something changed (VER).
  The life of one action, like a GitHub issue:
    issue  >  plan to approve  >  in progress  >  work to approve  >  done
  A chapter has sub-sections. An action points at one chapter, sub-section or slide.
  The hub holds the structure and the actions. The report text itself stays in the Word file.
*/
let _X=null,_XV=-1;
function X(){
  if(_X&&_XV===VER)return _X;
  const x={units:arr('units').sort(byOrd),byId:{},ch:{report:[],slides:[]},kids:{},act:{},acts:arr('actions')};
  x.units.forEach(u=>{x.byId[u.id]=u;if(u.parent&&D.units[u.parent])(x.kids[u.parent]=x.kids[u.parent]||[]).push(u);else if(x.ch[u.art])x.ch[u.art].push(u);});
  x.acts.forEach(a=>{(x.act[a.unit]=x.act[a.unit]||[]).push(a);});
  _X=x;_XV=VER;return x;
}
const people=()=>arr('people').sort(byOrd);
const person=id=>(D.people&&D.people[id]&&{id,...D.people[id]})||{id,name:id||'Nobody',short:id||'?'};
const chapters=art=>X().ch[art]||[];
const subsOf=id=>X().kids[id]||[];
const unitOf=id=>X().byId[id];
const artOf=id=>ARTS.find(a=>a.id===id)||ARTS[0];
const topOf=id=>{let u=unitOf(id);while(u&&u.parent&&unitOf(u.parent))u=unitOf(u.parent);return u;};
/* a chapter and everything inside it, in reading order */
const deepIds=id=>[id].concat(subsOf(id).map(s=>s.id));
const actionsDeep=id=>{const A=X().act;return deepIds(id).flatMap(i=>A[i]||[]);};
const allActions=art=>X().acts.filter(a=>{const u=unitOf(a.unit);return u&&(!art||u.art===art);});
const roleHolders=k=>((D.meta.roles&&D.meta.roles[k])||[]).filter(id=>D.people[id]);
const holderText=k=>{const h=roleHolders(k);return h.length?h.map(id=>person(id).short).join(', '):'anyone';};

/* "Ch 3", "3.2", "App B", "Slide 4" */
function shortLabel(u){
  if(!u)return '?';
  if(u.art==='slides')return 'Slide '+u.short;
  if(u.parent)return u.short;
  return /^\d+$/.test(u.short)?'Ch '+u.short:/^[A-Z]$/.test(u.short)?'App '+u.short:u.short;
}
const unitLabel=u=>!u?'Removed section':u.art==='slides'?'Slide '+u.short:'Report · '+shortLabel(u);
/* where an action points, in words */
function placeText(x){
  const u=unitOf(x.unit);let t=u?(u.art==='slides'?'Slide '+u.short:shortLabel(u)):'Removed section';
  if(u&&u.parent&&unitOf(u.parent))t=shortLabel(topOf(u.id))+' › '+u.short;
  if(u)t+=' '+u.name;
  if(x.spot)t+=' · '+x.spot;
  return t;
}

/* The four checking passes are "check" actions on a whole chapter. Approved by the leader = done. */
function passes(chId){
  const a=(X().act[chId]||[]).filter(x=>x.type==='check'),o={};
  PASSES.forEach(([k])=>{const l=a.filter(x=>x.pass===k);o[k]=l.some(x=>x.status==='done')?'done':l.length?'wait':'none';});
  return o;
}
/* colour of a chapter's square: the earliest stage that still has something open anywhere inside it.
   Light green = some checks done. Green = all four checks approved and nothing open. */
function unitState(chId){
  const a=actionsDeep(chId);
  for(const s of ['issue','plan','doing','review'])if(a.some(x=>x.status===s))return s;
  const p=passes(chId);
  if(PASSES.every(([k])=>p[k]==='done'))return 'done';
  return a.length||PASSES.some(([k])=>p[k]!=='none')?'part':'none';
}
/* a sub-section's own colour: the earliest stage still open on it */
function selfState(id){
  const a=X().act[id]||[];
  for(const s of ['issue','plan','doing','review'])if(a.some(x=>x.status===s))return s;
  return a.length?'done':'none';
}
function artStats(art){
  const us=chapters(art),st={none:0,part:0,issue:0,plan:0,doing:0,review:0,done:0};
  let pd=0;const per={};PASSES.forEach(([k])=>{per[k]=0;});
  us.forEach(u=>{st[unitState(u.id)]++;const p=passes(u.id);PASSES.forEach(([k])=>{if(p[k]==='done'){pd++;per[k]++;}});});
  const n={issue:0,plan:0,doing:0,review:0,done:0};
  allActions(art).forEach(x=>{if(n[x.status]!=null)n[x.status]++;});
  const tot=us.length*PASSES.length;
  return {total:us.length,full:st.done,sq:st,n,per,pct:tot?Math.round(100*pd/tot):0};
}
function nextOrd(art){const all=X().units.filter(u=>u.art===art);return all.length?Math.max(...all.map(u=>Number(u.ord)||0))+1:(art==='slides'?100:0);}

/* ---- who is who ---- */
const leaderRec=()=>D.meta.leader||{};
const leaderId=()=>leaderRec().who||LEADER;
const isLeader=()=>S.lead&&S.me===leaderId();
const waiting=()=>X().acts.filter(a=>(a.status==='plan'||a.status==='review')&&unitOf(a.unit));
function deadlines(){
  return String((D.meta.deadlines&&D.meta.deadlines.text)||'').split('\n').map(l=>l.split('|').map(x=>x.trim())).filter(p=>/^\d{4}-\d{2}-\d{2}$/.test(p[0]))
    .map(p=>({date:p[0],art:p[1]==='slides'?'slides':p[1]==='report'?'report':'',label:p.slice(2).join(' | ')||p[1]||''})).sort((a,b)=>a.date<b.date?-1:1);
}
