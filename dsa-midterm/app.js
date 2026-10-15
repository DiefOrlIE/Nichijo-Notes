(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const chapters=window.NICHIJO_CHAPTERS||[],names=['','速通','了解','掌握','深入'];
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const content=$('#chapters'),nav=$('#chapter-links');
chapters.forEach((ch,i)=>{
 const section=document.createElement('section');section.className='chapter';section.id=ch.id;
 section.innerHTML='<div class="chapter-heading"><div class="chapter-num">'+String(i).padStart(2,'0')+' · 正文</div><h2>'+ch.title+'</h2><p>'+ch.intro+'</p><p class="source">出处：'+ch.source+'</p></div>';
 for(const [j,t] of ch.sections.entries()){
 const el=document.createElement('section');el.className='topic';el.id=ch.id+'-'+t.id;
 el.innerHTML='<h3>'+String(j+1).padStart(2,'0')+' · '+t.title+'</h3>'+(t.goal?'<p class="goal"><strong>本节目标：</strong>'+t.goal+'</p>':'');
 (t.layers||[]).forEach((body,k)=>{const part=document.createElement('div');part.className='layer';part.id=el.id+'-l'+(k+1);part.dataset.level=k+1;part.innerHTML='<div class="layer-label">'+names[k+1]+' · '+['','核心规则','直觉与解释','推演与解题','原理与变式'][k+1]+'</div>'+body;el.appendChild(part);});
 section.appendChild(el);
 }
 content.appendChild(section);
 const a=document.createElement('a');a.href='#'+ch.id;a.textContent=String(i).padStart(2,'0')+' · '+ch.title;nav.appendChild(a);
 for(const t of ch.sections){const b=document.createElement('a');b.className='subchapter';b.href='#'+ch.id+'-'+t.id;b.textContent=t.title;nav.appendChild(b);}
});
for(const [id,label] of [['glossary','术语与缩写'],['sources','出处与勘误'],['homework','两份作业覆盖'],['exam','综合练习与速查']]){const a=document.createElement('a');a.href='#'+id;a.textContent=label;nav.appendChild(a);}
const terms=window.NICHIJO_TERMS||{},tb=$('#glossary-table tbody');
Object.entries(terms).sort((a,b)=>a[0].localeCompare(b[0])).forEach(([k,v])=>{let r=document.createElement('tr');r.innerHTML='<td>'+esc(k)+'</td><td>'+esc(v[0])+'</td><td>'+esc(v[1])+'</td>';tb.appendChild(r);});
$('#errata-content').innerHTML=window.NICHIJO_ERRATA||'';
$('#exam-content').innerHTML=window.NICHIJO_EXAM||'';
$('#homework-content').innerHTML=window.NICHIJO_HOMEWORK||'';
const keys=Object.keys(terms).filter(s=>s.length>1).sort((a,b)=>b.length-a.length);
const pattern=keys.length?new RegExp('(^|[^A-Za-z0-9_])('+keys.map(s=>s.replace(/[.*+?^$()|[\]{}\\]/g,'\\$&')).join('|')+')(?=$|[^A-Za-z0-9_])','g'):null;
if(pattern){const walker=document.createTreeWalker($('#content'),NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentElement;if(!n.nodeValue||!p||p.closest('pre,code,abbr,a,button,summary,script,style,svg,#glossary-table,.term'))return NodeFilter.FILTER_REJECT;pattern.lastIndex=0;return pattern.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;}});
let nodes=[],node;while(node=walker.nextNode())nodes.push(node);
for(const n of nodes){const source=n.nodeValue,frag=document.createDocumentFragment();let m,at=0;pattern.lastIndex=0;while((m=pattern.exec(source))){const start=m.index+(m[1]||'').length,word=m[2];if(start<at)continue;frag.append(document.createTextNode(source.slice(at,start)));const ab=document.createElement('abbr');ab.className='term';ab.textContent=word;ab.dataset.term=word;ab.tabIndex=0;ab.setAttribute('role','button');ab.title=terms[word][0]+' · '+terms[word][1];frag.append(ab);at=start+word.length;pattern.lastIndex=at;}if(at){frag.append(document.createTextNode(source.slice(at)));n.replaceWith(frag);}}}
const dialog=$('#term-dialog');
function showTerm(s){const v=terms[s];if(!v)return;$('#term-name').textContent=s;$('#term-en').textContent=v[0];$('#term-cn').textContent=v[1];if(dialog.showModal)dialog.showModal();else dialog.setAttribute('open','');}
document.addEventListener('click',e=>{const t=e.target.closest('.term');if(t)showTerm(t.dataset.term);});
document.addEventListener('keydown',e=>{const t=e.target.closest('.term');if(t&&(e.key==='Enter'||e.key===' ')){e.preventDefault();showTerm(t.dataset.term);}});
$('#term-close').onclick=()=>dialog.close();
$$('.question details').forEach((d,i)=>{if(!d.id&&!d.dataset.q)d.dataset.q='answer-'+i;});
const KEY='nichijo-dsa-midterm:v1',layers=$$('.layer'),answers=$$('.question details,details[data-q]');
let saved=null;try{saved=JSON.parse(localStorage.getItem(KEY)||'null');}catch{}
let tier=Number.isInteger(saved?.tier)&&saved.tier>=1&&saved.tier<=4?saved.tier:2;
let theme=saved?.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
function applyTheme(){document.documentElement.dataset.theme=theme;$('#theme-toggle').textContent=theme==='dark'?'日间':'夜间';}
function applyTier(){layers.forEach(n=>{const i=+n.dataset.level;n.hidden=i>tier;n.classList.toggle('current',i===tier);});$$('[data-tier]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.tier===tier)));}
applyTheme();applyTier();
if(Array.isArray(saved?.open))answers.forEach(d=>{if(saved.open.includes(d.id||d.dataset.q))d.open=true;});
if('scrollRestoration'in history)history.scrollRestoration='manual';
let ready=false,timer=0;
function reading(){const probe=120;let a='start';for(const n of $$('.chapter,.topic,.layer:not([hidden])')){if(n.closest('[hidden]'))continue;const y=n.getBoundingClientRect().top;if(y<=probe+18)a=n.id;else if(a!=='start')break;}return a;}
function save(){if(!ready)return;try{localStorage.setItem(KEY,JSON.stringify({tier,theme,pos:reading(),open:answers.filter(d=>d.open).map(d=>d.id||d.dataset.q),updated:Date.now()}));}catch{}}
function soon(){clearTimeout(timer);timer=setTimeout(save,230);}
function changeTier(next){if(next===tier)return;const id=reading(),ref=document.getElementById(id),oldY=ref?.getBoundingClientRect().top||0;tier=next;applyTier();let target=document.getElementById(id);if(target?.hidden)target=target.closest('.topic');if(target)window.scrollTo({top:window.scrollY+target.getBoundingClientRect().top-oldY,behavior:'instant'});soon();}
$$('[data-tier]').forEach(b=>b.onclick=()=>changeTier(+b.dataset.tier));
$('#theme-toggle').onclick=()=>{theme=theme==='dark'?'light':'dark';applyTheme();soon();};
$('#reset-memory').onclick=()=>{if(!confirm('清除层级、阅读位置及答案展开状态？'))return;try{localStorage.removeItem(KEY);}catch{}ready=false;tier=2;theme='light';answers.forEach(d=>d.open=false);applyTier();applyTheme();window.scrollTo({top:0,behavior:'instant'});setTimeout(()=>{ready=true;save();},120);};
answers.forEach(d=>d.addEventListener('toggle',soon));
function menu(open){$('#toc').classList.toggle('show',open);$('#backdrop').classList.toggle('show',open);$('#menu-toggle').setAttribute('aria-expanded',String(open));}
$('#menu-toggle').onclick=()=>menu(!$('#toc').classList.contains('show'));$('#backdrop').onclick=()=>menu(false);
$$('#toc a').forEach(a=>a.addEventListener('click',()=>{menu(false);setTimeout(soon,400);}));
const navLinks=$$('#toc a[href^="#"]');
function update(){let curr=reading(),topic=document.getElementById(curr)?.closest('.topic,.chapter')?.id||curr;navLinks.forEach(a=>a.classList.toggle('active',a.hash.slice(1)===topic));$('#progress').style.width=Math.min(100,Math.max(0,100*window.scrollY/Math.max(1,document.documentElement.scrollHeight-window.innerHeight)))+'%';}
window.addEventListener('scroll',()=>{update();soon();},{passive:true});window.addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save();});
window.addEventListener('load',()=>{requestAnimationFrame(()=>{let id=location.hash?decodeURIComponent(location.hash.slice(1)):saved?.pos;let target=id&&document.getElementById(id);if(target?.hidden)target=target.closest('.topic');if(target)window.scrollTo({top:window.scrollY+target.getBoundingClientRect().top-112,behavior:'instant'});ready=true;update();});});
})();