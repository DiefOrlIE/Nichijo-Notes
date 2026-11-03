(()=>{
'use strict';
const $=selector=>document.querySelector(selector);
const $$=selector=>Array.from(document.querySelectorAll(selector));
const page=document.documentElement.dataset.page||'course';
const STATE_KEY='nichijo-v4-'+page+'-reading';
const THEME_KEY='nichijo-v4-theme';
const sidebar=$('#sidebar'),shade=$('#shade'),menu=$('#menu-toggle');
const details=$$('#reading details');
details.forEach((el,i)=>{el.dataset.answer='answer-'+i;});
let saved={};
try{saved=JSON.parse(localStorage.getItem(STATE_KEY)||'{}')||{};}catch{}
let theme='light';
try{theme=localStorage.getItem(THEME_KEY)||saved.theme||'';}catch{}
if(theme!=='dark'&&theme!=='light')theme=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
function applyTheme(){
 document.documentElement.dataset.theme=theme;
 $('#theme-toggle').textContent=theme==='dark'?'日间':'夜间';
}
applyTheme();
const preserved=new Set(saved.open||[]);
for(const d of details)if(preserved.has(d.dataset.answer))d.open=true;
function readingSection(){
 const list=$$('.topic,.chapter');
 let current='start';
 for(const el of list){
  if(el.getBoundingClientRect().top<=115)current=el.id;
  else if(current!=='start')break;
 }
 return current;
}
function save(){
 try{
  localStorage.setItem(STATE_KEY,JSON.stringify({
   theme,pos:readingSection(),
   open:details.filter(d=>d.open).map(d=>d.dataset.answer)
  }));
  localStorage.setItem(THEME_KEY,theme);
 }catch{}
}
let saveTimer=null;
function scheduleSave(){
 clearTimeout(saveTimer);
 saveTimer=setTimeout(save,180);
}
details.forEach(d=>d.addEventListener('toggle',save));
$('#theme-toggle').addEventListener('click',()=>{
 theme=theme==='dark'?'light':'dark';
 applyTheme();save();
});
$('#reset-progress').addEventListener('click',()=>{
 if(!confirm('清除这个页面的阅读进度和题目展开记录？'))return;
 try{localStorage.removeItem(STATE_KEY);}catch{}
 details.forEach(d=>d.open=false);
 window.scrollTo({top:0,behavior:'instant'});
 save();
});
function setMenu(open){
 sidebar.classList.toggle('open',open);
 shade.hidden=!open;
 menu.setAttribute('aria-expanded',String(open));
 if(open)syncContents(true);
}
menu.addEventListener('click',()=>setMenu(!sidebar.classList.contains('open')));
shade.addEventListener('click',()=>setMenu(false));
$('#sidebar a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{temporarilyPauseFollowing();setMenu(false);}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false);});
const links=$('#sidebar a[href^="#"]');
const linkById=new Map(links.map(a=>[decodeURIComponent(a.hash.slice(1)),a]));
let activeId='';
let manualNavUntil=0;
let scrollFrame=0;
function temporarilyPauseFollowing(){manualNavUntil=Date.now()+1800;}
sidebar.addEventListener('wheel',temporarilyPauseFollowing,{passive:true});
sidebar.addEventListener('touchstart',temporarilyPauseFollowing,{passive:true});
sidebar.addEventListener('pointerdown',temporarilyPauseFollowing,{passive:true});
sidebar.addEventListener('keydown',temporarilyPauseFollowing);
function syncContents(force=false){
 const id=readingSection(), link=linkById.get(id);
 if(id!==activeId){
  const old=linkById.get(activeId);
  if(old){old.classList.remove('active');old.removeAttribute('aria-current');}
  if(link){link.classList.add('active');link.setAttribute('aria-current','location');}
  activeId=id;
 }
 if(!link||(!force&&Date.now()<manualNavUntil))return;
 // The off-canvas mobile sidebar must not scroll until the menu is opened.
 if(getComputedStyle(menu).display!=='none'&&!sidebar.classList.contains('open'))return;
 const chapter=link.closest('details.nav-chapter');
 if(chapter&&!chapter.open)chapter.open=true;
 const bounds=sidebar.getBoundingClientRect();
 const target=link.getBoundingClientRect();
 const margin=Math.min(65,sidebar.clientHeight*.15);
 if(force||target.top<bounds.top+margin||target.bottom>bounds.bottom-margin){
  const aim=bounds.top+sidebar.clientHeight*.38;
  sidebar.scrollTop+=target.top-aim;
 }
}
function paintProgress(){
 const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
 $('#progress-bar').style.width=Math.max(0,Math.min(100,scrollY/max*100))+'%';
 syncContents();
}
addEventListener('scroll',()=>{
 if(!scrollFrame)scrollFrame=requestAnimationFrame(()=>{
  scrollFrame=0;paintProgress();
 });
 scheduleSave();
},{passive:true});
addEventListener('pagehide',save);
addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')save();});
const oldScrollRestoration=history.scrollRestoration;
if('scrollRestoration' in history)history.scrollRestoration='manual';
addEventListener('load',()=>{
 requestAnimationFrame(()=>{
  const id=location.hash?decodeURIComponent(location.hash.slice(1)):saved.pos;
  const target=id&&document.getElementById(id);
  if(target)window.scrollTo({top:scrollY+target.getBoundingClientRect().top-84,behavior:'instant'});
  paintProgress();
 });
});
})();