(()=>{
'use strict';
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const chapters=window.NICHIJO_V2||[], box=$('#chapters'),nav=$('#chapter-links');
if(!chapters.length){box.textContent='讲义正在更新，请查看仓库构建记录。';return;}
for(const [i,ch] of chapters.entries()){
 const section=document.createElement('section');section.className='chapter';section.id=ch.id;
 const header=document.createElement('div');header.className='chapter-heading';
 header.innerHTML='<div class="chapter-num">'+String(i).padStart(2,'0')+' · 连续讲稿</div>';
 const title=document.createElement('h2');title.textContent=ch.title;
 const desc=document.createElement('div');desc.className='chapter-intro';desc.innerHTML=ch.introHtml;
 const source=document.createElement('p');source.className='source';source.textContent='课件出处：'+ch.source;
 header.append(title,desc,source);section.appendChild(header);
 const l=document.createElement('a');l.className='chapter-link';l.href='#'+ch.id;l.textContent=String(i).padStart(2,'0')+' · '+ch.title;nav.appendChild(l);
 for(const [k,t] of ch.sections.entries()){
  const el=document.createElement('section');el.className='topic';el.id=t.id;
  const h=document.createElement('h3');h.textContent=String(k+1).padStart(2,'0')+' · '+t.title;
  const body=document.createElement('div');body.className='lesson-narrative';body.innerHTML=t.html;
  el.append(h,body);section.appendChild(el);
  const a=document.createElement('a');a.className='subchapter';a.href='#'+t.id;a.textContent=t.title;nav.appendChild(a);
 }
 box.appendChild(section);
}
for(const [id,label] of [['glossary','术语与缩写'],['sources','课件与勘误'],['homework','两份作业覆盖'],['exam','期中练习与速查']]){
 const a=document.createElement('a');a.href='#'+id;a.textContent=label;nav.appendChild(a);
}
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const terms=window.NICHIJO_TERMS||{},tbody=$('#glossary-table tbody');
Object.entries(terms).sort((a,b)=>a[0].localeCompare(b[0])).forEach(([k,v])=>{
 const tr=document.createElement('tr');tr.innerHTML='<td>'+esc(k)+'</td><td>'+esc(v[0])+'</td><td>'+esc(v[1])+'</td>';tbody.appendChild(tr);
});
$('#errata-content').innerHTML=window.NICHIJO_ERRATA||'';
$('#homework-content').innerHTML=window.NICHIJO_HOMEWORK||'';
$('#exam-content').innerHTML=window.NICHIJO_EXAM||'';
const keys=Object.keys(terms).filter(k=>k.length>1).sort((a,b)=>b.length-a.length);
const escapeRx=s=>s.replace(/[.*+?^$()|[\]{}\\]/g,'\\$&');
const re=keys.length?new RegExp('(^|[^A-Za-z0-9_])('+keys.map(escapeRx).join('|')+')(?=$|[^A-Za-z0-9_])','g'):null;
if(re){
 const walker=document.createTreeWalker($('#content'),NodeFilter.SHOW_TEXT,{acceptNode(node){
  const p=node.parentElement;if(!p||!node.nodeValue||p.closest('pre,code,abbr,a,button,summary,script,style,svg,#glossary-table,.term'))return NodeFilter.FILTER_REJECT;
  re.lastIndex=0;return re.test(node.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
 }});
 const nodes=[];let n;while((n=walker.nextNode()))nodes.push(n);
 for(const node of nodes){
  const text=node.nodeValue,frag=document.createDocumentFragment();let pos=0,m;re.lastIndex=0;
  while((m=re.exec(text))){
   const at=m.index+(m[1]||'').length,key=m[2];if(at<pos)continue;
   frag.append(document.createTextNode(text.slice(pos,at)));
   const a=document.createElement('abbr');a.className='term';a.tabIndex=0;a.dataset.term=key;a.title=terms[key][0]+' · '+terms[key][1];a.textContent=key;frag.append(a);
   pos=at+key.length;re.lastIndex=pos;
  }
  if(pos){frag.append(document.createTextNode(text.slice(pos)));node.replaceWith(frag);}
 }
}
const dialog=$('#term-dialog');
function showTerm(key){
 const v=terms[key];if(!v)return;
 $('#term-name').textContent=key;$('#term-en').textContent=v[0];$('#term-cn').textContent=v[1];
 if(!dialog.open)dialog.showModal();
}
document.addEventListener('click',e=>{const t=e.target.closest('.term');if(t)showTerm(t.dataset.term);});
document.addEventListener('keydown',e=>{const t=e.target.closest('.term');if(t&&(e.key==='Enter'||e.key===' ')){e.preventDefault();showTerm(t.dataset.term);}});
$('#term-close').onclick=()=>dialog.close();
const answers=$$('details');
answers.forEach((d,i)=>{if(!d.id)d.dataset.q=(d.closest('.topic')?.id||'appendix')+'-answer-'+i;});
const KEY='nichijo-dsa-continuous:v2',OLD='nichijo-dsa-midterm:v1';
let saved=null,old=null;try{saved=JSON.parse(localStorage.getItem(KEY)||'null');old=JSON.parse(localStorage.getItem(OLD)||'null');}catch{}
let theme=saved?.theme||old?.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
function applyTheme(){document.documentElement.dataset.theme=theme;$('#theme-toggle').textContent=theme==='dark'?'日间':'夜间';}
applyTheme();
if(Array.isArray(saved?.open))answers.forEach(d=>{if(saved.open.includes(d.id||d.dataset.q))d.open=true;});
if('scrollRestoration'in history)history.scrollRestoration='manual';
let ready=false,timer=0;
function reading(){
 let pos='start';for(const el of $$('.chapter,.topic')){
  const y=el.getBoundingClientRect().top;
  if(y<=145)pos=el.id;else if(pos!=='start')break;
 }return pos;
}
function save(){if(!ready)return;try{localStorage.setItem(KEY,JSON.stringify({theme,pos:reading(),open:answers.filter(d=>d.open).map(d=>d.id||d.dataset.q)}));}catch{}}
function soon(){clearTimeout(timer);timer=setTimeout(save,280);}
answers.forEach(d=>d.addEventListener('toggle',soon));
$('#theme-toggle').onclick=()=>{theme=theme==='dark'?'light':'dark';applyTheme();soon();};
$('#reset-memory').onclick=()=>{
 if(!confirm('重置阅读位置、主题及展开的答案？'))return;
 localStorage.removeItem(KEY);ready=false;theme='light';answers.forEach(d=>d.open=false);applyTheme();scrollTo({top:0,behavior:'instant'});setTimeout(()=>{ready=true;save();},100);
};
function menu(open){$('#toc').classList.toggle('show',open);$('#backdrop').classList.toggle('show',open);$('#menu-toggle').setAttribute('aria-expanded',String(open));}
$('#menu-toggle').onclick=()=>menu(!$('#toc').classList.contains('show'));
$('#backdrop').onclick=()=>menu(false);
$$('#toc a').forEach(a=>a.addEventListener('click',()=>{menu(false);setTimeout(soon,400);}));
const links=$$('#toc a[href^="#"]');
function update(){let id=reading();links.forEach(a=>a.classList.toggle('active',a.hash.slice(1)===id));$('#progress').style.width=Math.min(100,Math.max(0,100*scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)))+'%';}
addEventListener('scroll',()=>{update();soon();},{passive:true});
addEventListener('pagehide',save);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save();});
addEventListener('load',()=>requestAnimationFrame(()=>{
 let id=location.hash?decodeURIComponent(location.hash.slice(1)):saved?.pos||old?.pos;
 if(id&&!document.getElementById(id))id=id.replace(/-l[1-4]$/,'');
 const target=id&&document.getElementById(id);
 if(target)scrollTo({top:scrollY+target.getBoundingClientRect().top-112,behavior:'instant'});
 ready=true;update();
}));
})();