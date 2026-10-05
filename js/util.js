'use strict';
const TZ='Australia/Sydney';
const $=(s,r)=>(r||document).querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const store=k=>({get(n){try{return k.getItem(n)}catch(e){return null}},set(n,v){try{k.setItem(n,v)}catch(e){}},del(n){try{k.removeItem(n)}catch(e){}}});
const nul={getItem(){return null},setItem(){},removeItem(){}};
let L1=nul,S1=nul;try{L1=window.localStorage||nul;}catch(e){}try{S1=window.sessionStorage||nul;}catch(e){}
const ls=store(L1), ss=store(S1);
/* dates are plain 'YYYY-MM-DD' strings in Sydney time */
const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:TZ});
const dnum=s=>{const p=String(s).split('-').map(Number);return Date.UTC(p[0],p[1]-1,p[2]);};
const dstr=n=>new Date(n).toISOString().slice(0,10);
const addDays=(s,k)=>dstr(dnum(s)+k*864e5);
const dow=s=>(new Date(dnum(s)).getUTCDay()+6)%7;           /* Monday = 0 */
const fmtD=s=>s?new Date(s+'T12:00:00Z').toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short',timeZone:'UTC'}):'';
const fmtM=s=>new Date(s+'T12:00:00Z').toLocaleDateString('en-AU',{month:'short',timeZone:'UTC'});
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>{t.hidden=true;},3000);}
/* small, fixed-salt hash for the leader PIN. A soft lock for a team of six, not bank security. */
function hashPin(p){let h1=0xdeadbeef,h2=0x41c6ce57;const s='engg982:'+p;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677);}
  h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);
  return (4294967296*(2097151&h2)+(h1>>>0)).toString(36);}

/* ---- text ---- */
const plainText=s=>String(s==null?'':s).replace(/\s+/g,' ').trim();
const snip=(s,n)=>{const t=plainText(s);return t.length>n?t.slice(0,n-1).trimEnd()+'\u2026':t;};
