(()=>{
'use strict';
const $=q=>document.querySelector(q),$$=q=>[...document.querySelectorAll(q)];
const data=window.NICHIJO_V3;
if(!data||data.sections?.length!==15){
 $('#chapters').textContent='页面数据尚未生成；请使用仓库中的 Markdown 源稿查看内容。';
 return;
}
$('#chapter-intro').innerHTML=data.intro;
const nav=$('#chapter-links'),box=$('#chapters');
const toTop=document.createElement('a');toTop.href='#start';toTop.textContent='本讲开篇';nav.appendChild(toTop);
for(const [i,sec] of data.sections.entries()){
 const section=document.createElement('section');section.className='topic';section.id=sec.id;
 const h=document.createElement('h2');h.textContent=String(i+1).padStart(2,'0')+' · '+sec.title;
 const body=document.createElement('div');body.className='lesson-narrative';body.innerHTML=sec.html;
 section.append(h,body);box.appendChild(section);
 const a=document.createElement('a');a.href='#'+sec.id;a.textContent=sec.title;
 a.className='subchapter';nav.appendChild(a);
}
for(const table of $('.lesson-narrative table')){
 const wrap=document.createElement('div');wrap.className='table-scroll';
 table.parentNode.insertBefore(wrap,table);wrap.appendChild(table);
}
const terms={
 ADT:['Abstract Data Type','抽象数据类型：先定义允许的操作与行为，再选择具体存储方式。'],
 DSU:['Disjoint Set Union','并查集：用于维护互不相交的集合，支持 Find 与 Union。'],
 UFSets:['Union-Find Sets','并查集的课程类名与同义术语。'],
 ASL:['Average Search Length','平均查找长度：按各类查找发生概率加权计算的比较或探查次数。'],
 BST:['Binary Search Tree','二叉搜索树：左子树关键码较小，右子树关键码较大。'],
 Cpp:['C++','通用程序设计语言，名字没有公认的首字母全称。'],
 mod:['Modulo','取模/整数求余；在本讲用于计算散列地址。'],
 OR:['Bitwise OR','按位或：任一操作数此位为 1 就得 1。'],
 AND:['Bitwise AND','按位与：两个操作数此位都是 1 才得 1。'],
 Find:['Find','寻找并查集中某成员的集合代表；本身是英语单词。'],
 Union:['Union','合并两个等价类；本身是英语单词。'],
 hashing:['Hashing','散列：将关键码计算映射至存储地址；hash 并非英文首字母缩写。']
};
const table=$('#glossary-table tbody');
const escapeHtml=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
Object.entries(terms).sort((a,b)=>a[0].localeCompare(b[0])).forEach(([abbr,val])=>{
 const tr=document.createElement('tr');tr.innerHTML='<td>'+escapeHtml(abbr)+'</td><td>'+escapeHtml(val[0])+'</td><td>'+escapeHtml(val[1])+'</td>';table.appendChild(tr);
});
const keys=Object.keys(terms).filter(s=>s.length>=2).sort((a,b)=>b.length-a.length);
const escRe=s=>s.replace(/[.*+?^$()|[\]{}\\]/g,'\\$&');
const pat=new RegExp('(^|[^A-Za-z0-9_])('+keys.map(escRe).join('|')+')(?=$|[^A-Za-z0-9_])','g');
const walker=document.createTreeWalker($('#content'),NodeFilter.SHOW_TEXT,{
 acceptNode(n){
  const p=n.parentElement;if(!p||!n.nodeValue||p.closest('code,pre,abbr,a,button,summary,script,style,svg,#glossary-table'))return NodeFilter.FILTER_REJECT;
  pat.lastIndex=0;return pat.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
 }
});
const nodes=[];let node;while((node=walker.nextNode()))nodes.push(node);
for(const n of nodes){
 const t=n.nodeValue,frag=document.createDocumentFragment();let pos=0,m;pat.lastIndex=0;
 while((m=pat.exec(t))){
  const from=m.index+(m[1]||'').length,key=m[2];if(from<pos)continue;
  frag.append(document.createTextNode(t.slice(pos,from)));
  const term=document.createElement('abbr');term.className='term';term.textContent=key;
  term.dataset.term=key;term.tabIndex=0;term.title=terms[key][0]+' · '+terms[key][1];
  frag.append(term);pos=from+key.length;pat.lastIndex=pos;
 }
 if(pos){frag.append(document.createTextNode(t.slice(pos)));n.replaceWith(frag);}
}
const dialog=$('#term-dialog');
function showTerm(key){
 const v=terms[key];if(!v)return;
 $('#term-name').textContent=key;$('#term-en').textContent=v[0];$('#term-cn').textContent=v[1];
 if(!dialog.open)dialog.showModal();
}
document.addEventListener('click',e=>{const ab=e.target.closest('abbr.term');if(ab)showTerm(ab.dataset.term);});
document.addEventListener('keydown',e=>{const ab=e.target.closest('abbr.term');if(ab&&(e.key==='Enter'||e.key===' ')){e.preventDefault();showTerm(ab.dataset.term);}});
$('#term-close').onclick=()=>dialog.close();
const details=$$('details.question');details.forEach((d,i)=>d.dataset.answer='answer-'+i);
const KEY='nichijo-dsa-v3-ch15',state=(()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}})();
let theme=state?.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
function applyTheme(){document.documentElement.dataset.theme=theme;$('#theme-toggle').textContent=theme==='dark'?'日间':'夜间';}
applyTheme();
for(const d of details)if(state?.open?.includes(d.dataset.answer))d.open=true;
if('scrollRestoration' in history)history.scrollRestoration='manual';
let ready=false,timeout=0;
function current(){
 let id='start';
 for(const el of $$('.topic')){
  if(el.getBoundingClientRect().top<=148)id=el.id;
  else break;
 }
 return id;
}
function save(){
 if(!ready)return;
 try{localStorage.setItem(KEY,JSON.stringify({theme,pos:current(),open:details.filter(d=>d.open).map(d=>d.dataset.answer)}));}catch{}
}
function debounce(){clearTimeout(timeout);timeout=setTimeout(save,250);}
details.forEach(d=>d.addEventListener('toggle',()=>{if(ready)save();}));
$('#theme-toggle').onclick=()=>{theme=theme==='dark'?'light':'dark';applyTheme();debounce();};
$('#reset-memory').onclick=()=>{
 if(!confirm('清除本页阅读位置、夜间模式和答案展开记录？'))return;
 try{localStorage.removeItem(KEY)}catch{}
 ready=false;theme='light';applyTheme();details.forEach(d=>d.open=false);
 window.scrollTo({top:0,behavior:'instant'});
 setTimeout(()=>{ready=true;save();},140);
};
function menu(open){
 $('#toc').classList.toggle('show',open);$('#backdrop').classList.toggle('show',open);
 $('#menu-toggle').setAttribute('aria-expanded',String(open));
}
$('#menu-toggle').onclick=()=>menu(!$('#toc').classList.contains('show'));
$('#backdrop').onclick=()=>menu(false);
$$('#toc a').forEach(a=>a.addEventListener('click',()=>{menu(false);setTimeout(debounce,380);}));
const links=$$('#toc a[href^="#"]');
function update(){
 const id=current();links.forEach(a=>a.classList.toggle('active',a.hash.slice(1)===id));
 $('#progress').style.width=Math.min(100,Math.max(0,100*window.scrollY/Math.max(1,document.documentElement.scrollHeight-window.innerHeight)))+'%';
}
addEventListener('scroll',()=>{update();debounce();},{passive:true});
addEventListener('pagehide',save);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save();});
addEventListener('load',()=>requestAnimationFrame(()=>{
 const id=location.hash?decodeURIComponent(location.hash.slice(1)):state?.pos;
 const target=id&&document.getElementById(id);
 if(target)window.scrollTo({top:window.scrollY+target.getBoundingClientRect().top-110,behavior:'instant'});
 ready=true;update();
}));
})();