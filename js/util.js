'use strict';
const TZ='Australia/Sydney';
const $=(s,r)=>(r||document).querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const ls={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
function zoned(d,t){
  const p=String(d).split('-').map(Number),q=String(t||'00:00').split(':').map(Number);
  const want=Date.UTC(p[0],p[1]-1,p[2],q[0]||0,q[1]||0);let utc=want;
  const f=new Intl.DateTimeFormat('en-CA',{timeZone:TZ,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});
  for(let i=0;i<2;i++){const parts=f.formatToParts(new Date(utc));const g=k=>+parts.find(x=>x.type===k).value;utc+=want-Date.UTC(g('year'),g('month')-1,g('day'),g('hour'),g('minute'));}
  return utc;
}
const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:TZ});
const dnum=s=>{const p=String(s).split('-').map(Number);return Date.UTC(p[0],p[1]-1,p[2]);};
const daysTo=s=>Math.round((dnum(s)-dnum(today()))/864e5);
const fmtD=s=>s?new Date(s+'T12:00:00').toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short'}):'';
const fmtDT=t=>new Date(t).toLocaleString('en-AU',{timeZone:TZ,weekday:'short',day:'numeric',month:'short',hour:'numeric',minute:'2-digit',hour12:true});
const until=t=>{const ms=t-Date.now();if(ms<0)return 'passed';const d=Math.floor(ms/864e5),h=Math.floor(ms%864e5/36e5);return d>0?d+'d '+h+'h':h+'h '+Math.floor(ms%36e5/6e4)+'m';};
const opts=(a,sel)=>a.map(o=>`<option value="${esc(o[0])}"${String(o[0])===String(sel==null?'':sel)?' selected':''}>${esc(o[1])}</option>`).join('');
const pill=(c,t)=>`<span class="pill ${c}">${esc(t)}</span>`;
const linkOf=u=>/^https?:\/\//i.test(u||'')?`<a href="${esc(u)}" target="_blank" rel="noopener">Open</a>`:(u?`<span class="mono">${esc(u)}</span>`:'');
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>{t.hidden=true;},3200);}
