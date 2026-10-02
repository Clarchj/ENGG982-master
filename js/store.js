'use strict';
/*
  Data layer. One interface (D = data in memory, put/del = save), four places it can live:
    shared  the published claude.ai page (its built-in database)
    server  the local Node server (server.js), saved to data/hub.json
    cloud   optional free Supabase table, set up in config.js (see README)
    local   this browser only (GitHub Pages with no cloud set up)
  The first one that works wins. Everything else in the app is the same in all four.
*/
const COLS=['sections','papers','ideas','people','tasks','contrib','inbox','slides','meta','secdefs','criteria','topics','weeks','deadlines','risks','plantext','roles','guide','flow'];
const D={}; COLS.forEach(c=>{D[c]={};});
let db=null, mode='loading';
const W={put:async()=>{},del:async()=>{},test:async()=>{
  /* this browser only */
  try{const k='engg982hub.test',v=String(Date.now());localStorage.setItem(k,v);const ok=localStorage.getItem(k)===v;localStorage.removeItem(k);
    return [['Write and read this browser\'s storage',ok,ok?'':'storage is blocked in this browser']];}
  catch(e){return [['Write and read this browser\'s storage',false,'storage is blocked in this browser']];}
}};
const CFG=window.HUB_CONFIG||{};
const S={view:ls.get('hub.view')||'dash',sub:{lib:'papers',team:'tasks',pres:'final',flow:'process'},rv:'',f:{papers:{q:'',fn:'',st:''},tasks:{owner:'',st:'',wk:''},ledger:{person:''}}};

function fail(e){toast(e&&e.code==='invalid_argument'?'Saving is not allowed for your access level.':'Could not save. Try again.');}
async function put(col,id,obj){D[col][id]=obj;render();try{await W.put(col,id,obj);}catch(e){fail(e);}}
async function patch(col,id,f){return put(col,id,{...(D[col][id]||{}),...f});}
async function del(col,id){delete D[col][id];render();try{await W.del(col,id);}catch(e){fail(e);}}
function setAll(j){COLS.forEach(c=>{D[c]=(j&&j[c])||{};});}
const isEmpty=()=>COLS.every(c=>!Object.keys(D[c]).length);

/* redraw without stealing focus while someone is typing */
let pending=false;
const editing=()=>{const a=document.activeElement;return a&&$('#view').contains(a)&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)};
function schedule(){if(editing()){pending=true;return;}render();}
document.addEventListener('focusout',()=>{if(pending)setTimeout(()=>{if(!editing()){pending=false;render();}},60);});

/* ---- local (this browser) ---- */
function loadLocal(){try{setAll(JSON.parse(ls.get('engg982hub')||'{}'));}catch(e){}}
function saveLocal(){ls.set('engg982hub',JSON.stringify(D));}
async function fetchSeed(){try{const r=await fetch('data/seed.json',{cache:'no-store'});if(!r.ok)return null;return await r.json();}catch(e){return null;}}

/* ---- local server ---- */
async function tryServer(){
  if(!/^https?:$/.test(location.protocol))return false;
  const get=async()=>{const r=await fetch('api/all',{cache:'no-store'});if(!r.ok||!/json/.test(r.headers.get('content-type')||''))throw 0;return r.json();};
  try{setAll(await get());}catch(e){return false;}
  W.put=async(c,id,o)=>{const r=await fetch('api/'+c+'/'+encodeURIComponent(id),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(o)});if(!r.ok)throw {code:'server'};};
  W.del=async(c,id)=>{const r=await fetch('api/'+c+'/'+encodeURIComponent(id),{method:'DELETE'});if(!r.ok)throw {code:'server'};};
  W.test=async()=>{
    const out=[],id='_ping_'+uid(),at=new Date().toISOString();
    try{
      let r=await fetch('api/meta/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({at})});
      out.push(['Write a test record',r.ok,r.ok?'':'HTTP '+r.status+(r.status===401?' (password needed)':'')]);if(!r.ok)return out;
      const all=await (await fetch('api/all',{cache:'no-store'})).json();
      out.push(['Read it back',!!(all.meta&&all.meta[id]&&all.meta[id].at===at)]);
      r=await fetch('api/meta/'+id,{method:'DELETE'});out.push(['Delete it',r.ok]);
    }catch(e){out.push(['Reach the local server',false,e.message]);}
    return out;};
  const again=async()=>{try{setAll(await get());schedule();}catch(e){}};
  try{const es=new EventSource('api/events');es.onmessage=again;}catch(e){}
  setInterval(again,20000);
  return true;
}

/* ---- cloud: Supabase REST. One table, one row per record (see supabase.sql) ---- */
async function tryCloud(){
  if(!CFG.supabaseUrl||!CFG.supabaseKey)return false;
  const base=CFG.supabaseUrl.replace(/\/+$/,'')+'/rest/v1/'+(CFG.table||'hub');
  const H={apikey:CFG.supabaseKey,Authorization:'Bearer '+CFG.supabaseKey,'Content-Type':'application/json'};
  const get=async()=>{
    const r=await fetch(base+'?select=col,id,data&limit=10000',{headers:H,cache:'no-store'});
    if(!r.ok)throw 0;const rows=await r.json(),o={};COLS.forEach(c=>{o[c]={};});
    rows.forEach(x=>{if(o[x.col])o[x.col][x.id]=x.data;});return o;};
  try{setAll(await get());}catch(e){return false;}
  W.put=async(c,id,o)=>{const r=await fetch(base+'?on_conflict=col,id',{method:'POST',headers:{...H,Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({col:c,id,data:o})});if(!r.ok)throw {code:'cloud'};};
  W.del=async(c,id)=>{const r=await fetch(base+'?col=eq.'+encodeURIComponent(c)+'&id=eq.'+encodeURIComponent(id),{method:'DELETE',headers:H});if(!r.ok)throw {code:'cloud'};};
  W.test=async()=>{
    const out=[],id='_ping_'+uid(),at=new Date().toISOString();
    try{
      let r=await fetch(base+'?on_conflict=col,id',{method:'POST',headers:{...H,Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({col:'meta',id,data:{at}})});
      const why=r.status===404?'HTTP 404: the hub table is missing. Run supabase.sql in the Supabase SQL Editor.':(r.status===401||r.status===403)?'HTTP '+r.status+': the key or the access policy is wrong.':'HTTP '+r.status;
      out.push(['Write a test row to Supabase',r.ok,r.ok?'':why]);if(!r.ok)return out;
      r=await fetch(base+'?select=data&col=eq.meta&id=eq.'+encodeURIComponent(id),{headers:H,cache:'no-store'});
      const j=r.ok?await r.json():[];out.push(['Read it back from Supabase',!!(j[0]&&j[0].data&&j[0].data.at===at),r.ok?'':'HTTP '+r.status]);
      r=await fetch(base+'?col=eq.meta&id=eq.'+encodeURIComponent(id),{method:'DELETE',headers:H});out.push(['Delete it',r.ok,r.ok?'':'HTTP '+r.status]);
    }catch(e){out.push(['Reach Supabase',false,'network error: '+e.message]);}
    return out;};
  if(isEmpty()){ /* brand new table: load the starting data once */
    const seed=await fetchSeed();
    if(seed){setAll(seed);const rows=[];COLS.forEach(c=>Object.entries(D[c]).forEach(([id,data])=>rows.push({col:c,id,data})));
      try{await fetch(base+'?on_conflict=col,id',{method:'POST',headers:{...H,Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(rows)});}catch(e){}}
  }
  setInterval(async()=>{try{setAll(await get());schedule();}catch(e){}},20000);
  return true;
}

/* Why is the cloud database not in use? Asks Supabase directly and reports the reason in plain words. */
async function diagCloud(){
  if(!CFG.supabaseUrl||!CFG.supabaseKey)return [['config.js has a Supabase URL and key',false,'config.js is empty on the published site. Fill in .env, run node tools/make-config.js, then commit and push config.js.']];
  const base=CFG.supabaseUrl.replace(/\/+$/,'')+'/rest/v1/'+(CFG.table||'hub');
  try{
    const r=await fetch(base+'?select=col&limit=1',{headers:{apikey:CFG.supabaseKey,Authorization:'Bearer '+CFG.supabaseKey},cache:'no-store'});
    if(r.ok)return [['Supabase answered and the table exists',true,'It works now. Reload the page.']];
    const why=r.status===404?'HTTP 404: the hub table is missing. Run supabase.sql in the Supabase SQL Editor.':
      (r.status===401||r.status===403)?'HTTP '+r.status+': the key is wrong, or the access policy from supabase.sql is missing.':'HTTP '+r.status;
    return [['Supabase answered',false,why]];
  }catch(e){return [['Reach Supabase',false,'network error: check SUPABASE_URL in config.js. ('+e.message+')']];}
}

async function init(){
  loadLocal();W.put=async()=>{saveLocal();};W.del=async()=>{saveLocal();};render();
  let d=null;
  try{d=window.claude&&window.claude.use?await window.claude.use('db'):null;}catch(e){d=null;}
  if(d){
    db=d;mode='shared';COLS.forEach(c=>{D[c]={};});
    W.put=(c,id,o)=>db.doc(c+'/'+id).set(o);W.del=(c,id)=>db.doc(c+'/'+id).delete();render();
    COLS.forEach(c=>{
      try{d.collection(c).onSnapshot(snap=>{const o={};snap.docs.forEach(x=>{o[x.id]=x.data();});D[c]=o;schedule();},e=>{console.warn(c,e&&e.code);if(e&&e.code==='revoked'){mode='local';render();}});}
      catch(e){console.warn(e);}
    });
    return;
  }
  if(await tryServer()){mode='server';render();return;}
  if(await tryCloud()){mode='cloud';render();return;}
  /* this browser only. First visit on a fresh browser: start from the shipped data */
  loadLocal();mode='local';
  if(isEmpty()&&!ls.get('engg982hub.seeded')){const seed=await fetchSeed();if(seed){setAll(seed);saveLocal();}ls.set('engg982hub.seeded','1');}
  render();
}

/* ---------- editable reference data ---------- */
const arr=c=>Object.entries(D[c]).map(([id,v])=>({id,...v}));
const byOrd=(a,b)=>(a.ord==null||a.ord===''?1e9:a.ord)-(b.ord==null||b.ord===''?1e9:b.ord);
function items(col){const has=Object.keys(D[col]).length>0;const src=has?arr(col):(DEF[col]||[]).map((x,i)=>({...x,ord:i}));return src.sort(byOrd);}
const item=(col,id)=>items(col).find(x=>x.id===id);
const nextOrd=col=>items(col).reduce((m,x)=>Math.max(m,x.ord==null||x.ord===''?0:Number(x.ord)),-1)+1;
async function ensure(col){
  if(!DEF[col]||Object.keys(D[col]).length)return;
  await Promise.all(DEF[col].map((x,i)=>{const o={...x};delete o.id;o.ord=i;return put(col,x.id,o);}));
}
async function resetCol(col){await Promise.all(Object.keys(D[col]).map(id=>del(col,id)));}
const SECS=()=>items('secdefs'), CRIT=()=>items('criteria'), TOPICS=()=>items('topics'), WEEKS=()=>items('weeks'), RISKS=()=>items('risks'), PLAN=()=>items('plantext'), ROLES=()=>items('roles'), GUIDE=g=>items('guide').filter(x=>x.group===g), FLOW=()=>items('flow');
const secBy=id=>SECS().find(s=>s.id===id);
const L=k=>((D.meta.lists&&D.meta.lists[k])&&D.meta.lists[k].length?D.meta.lists[k]:DEFLISTS[k]);
const proj=()=>({...DEFPROJ,...(D.meta.project||{})});
const wkShort=w=>String(w.title||w.id).split(/[,:]/)[0];
