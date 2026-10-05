'use strict';
/* The whole idea, borrowed from GitHub: an action is one dot. It moves  found > fixing > waiting for approval > approved.  */
const STAGES=[['open','Found','red','Someone spotted a problem. Nobody is fixing it yet.'],['doing','Fixing','amber','Someone has taken it and is fixing it.'],
  ['review','Waiting for approval','purple','Fix is done. The team leader checks it.'],['done','Approved','green','The team leader approved it.']];
const STAGE=Object.fromEntries(STAGES.map(s=>[s[0],{label:s[1],col:s[2],help:s[3]}]));

const people=()=>arr('people').sort(byOrd);
const person=id=>arr('people').find(p=>p.id===id)||{id,name:id||'Nobody',short:id||'?'};
const units=art=>arr('units').filter(u=>!art||u.art===art).sort(byOrd);
const unitOf=id=>arr('units').find(u=>u.id===id);
const actions=()=>arr('actions');
const artOf=id=>ARTS.find(a=>a.id===id)||ARTS[0];
const unitLabel=u=>!u?'Removed item':u.art==='slides'?'Slide '+u.short:'Report · '+(/^\d+$/.test(u.short)?'Ch '+u.short:u.short);

/* colour of one square = the most urgent thing still open on it. Green only when everything on it is approved. */
function unitState(uid){
  const a=actions().filter(x=>x.unit===uid);
  if(!a.length)return 'none';
  for(const s of ['open','doing','review'])if(a.some(x=>x.status===s))return s;
  return 'done';
}
function artStats(art){
  const us=units(art),st={none:0,open:0,doing:0,review:0,done:0};
  us.forEach(u=>st[unitState(u.id)]++);
  const ids=new Set(us.map(u=>u.id)),a=actions().filter(x=>ids.has(x.unit));
  const n={open:0,doing:0,review:0,done:0};a.forEach(x=>{if(n[x.status]!=null)n[x.status]++;});
  return {total:us.length,sq:st,n,pct:us.length?Math.round(100*st.done/us.length):0};
}

/* who is who */
const leaderRec=()=>D.meta.leader||{};
const leaderId=()=>leaderRec().who||LEADER;
const isLeader=()=>S.lead&&S.me===leaderId();
function deadlines(){
  return String((D.meta.deadlines&&D.meta.deadlines.text)||'').split('\n').map(l=>l.split('|').map(x=>x.trim())).filter(p=>/^\d{4}-\d{2}-\d{2}$/.test(p[0]))
    .map(p=>({date:p[0],art:p[1]==='slides'?'slides':p[1]==='report'?'report':'',label:p.slice(2).join(' | ')||p[1]||''})).sort((a,b)=>a.date<b.date?-1:1);
}
