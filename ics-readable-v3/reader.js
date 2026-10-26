(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],key='nichijo-ics-continuous-v3';
let state={};try{state=JSON.parse(localStorage.getItem(key)||'{}')}catch{}
const store=()=>{try{localStorage.setItem(key,JSON.stringify(state))}catch{}};
document.documentElement.dataset.theme=state.theme||'light';
$('#theme').textContent=state.theme==='dark'?'日间':'夜间';
$('#theme').onclick=()=>{state.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=state.theme;$('#theme').textContent=state.theme==='dark'?'日间':'夜间';store()};
$('#menu').onclick=()=>{const open=$('#nav').classList.toggle('open');$('#menu').setAttribute('aria-expanded',String(open))};
$$('nav a').forEach(a=>a.addEventListener('click',()=>{$('#nav').classList.remove('open');$('#menu').setAttribute('aria-expanded','false')}));
$$('main table').forEach(t=>{let w=document.createElement('div');w.className='table-scroll';t.replaceWith(w);w.append(t)});
// Only explicitly labelled exercise solutions are folded; worked examples stay visible.
$$('article p').filter(p=>/^解答[：一二三四五六七八九十]/.test(p.textContent)).forEach((p,i)=>{let d=document.createElement('details'),s=document.createElement('summary');s.textContent='展开本题解答与核对';d.id='answer-'+i;p.replaceWith(d);d.append(s,p);d.open=!!state.answers?.[d.id];d.addEventListener('toggle',()=>{state.answers??={};state.answers[d.id]=d.open;store()})});
let restoring=true;const anchors=$$('[data-anchor]');
function savePosition(){if(restoring)return;let a=anchors[0];for(const el of anchors){if(el.getBoundingClientRect().top<=95)a=el;else break}state.position={id:a.id,offset:scrollY-(a.getBoundingClientRect().top+scrollY)};store();$$('nav a').forEach(n=>n.classList.toggle('active',n.hash==='#'+a.id))}
let timer;addEventListener('scroll',()=>{clearTimeout(timer);timer=setTimeout(savePosition,160)},{passive:true});addEventListener('pagehide',savePosition);
async function restore(){await document.fonts.ready;await new Promise(requestAnimationFrame);if(location.hash){const el=document.getElementById(decodeURIComponent(location.hash.slice(1)));el?.scrollIntoView()}else if(state.position){let el=document.getElementById(state.position.id);if(el)scrollTo(0,el.getBoundingClientRect().top+scrollY+state.position.offset)}restoring=false;window.ICS_READY=true}
const dialog=$('#terms');let defs={};
function show(filter=''){const f=filter.toLowerCase();$('#term-list').replaceChildren();for(const [k,v]of Object.entries(defs)){if(!`${k} ${v.en} ${v.zh}`.toLowerCase().includes(f))continue;let p=document.createElement('p'),b=document.createElement('b');b.textContent=k+' · '+v.en;p.append(b,document.createElement('br'),v.zh);if(v.note)p.append(document.createElement('br'),v.note);$('#term-list').append(p)}}
$('#term-open').onclick=()=>{show();dialog.showModal();$('#term-search').focus()};$('#term-search').oninput=e=>show(e.target.value);
fetch('terms.json').then(r=>{if(!r.ok)throw Error('术语数据加载失败');return r.json()}).then(d=>{defs=d;const keys=Object.keys(d).sort((a,b)=>b.length-a.length);const escaped=keys.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));const re=new RegExp('(?<![A-Za-z0-9_])('+escaped.join('|')+')(?![A-Za-z0-9_])','g');const walk=document.createTreeWalker($('#main'),NodeFilter.SHOW_TEXT);let n,nodes=[];while(n=walk.nextNode())if(!['SCRIPT','STYLE'].includes(n.parentElement.tagName))nodes.push(n);nodes.forEach(node=>{let s=node.nodeValue,m,last=0,frag=document.createDocumentFragment();re.lastIndex=0;while(m=re.exec(s)){frag.append(s.slice(last,m.index));let a=document.createElement('abbr');a.textContent=m[0];a.tabIndex=0;a.title=defs[m[0]].en+'：'+defs[m[0]].zh;a.setAttribute('role','button');const open=()=>{$('#term-search').value=m?.[0]||a.textContent;show(a.textContent);dialog.showModal()};a.onclick=open;a.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}};frag.append(a);last=re.lastIndex}if(last){frag.append(s.slice(last));node.replaceWith(frag)}})}).catch(e=>{console.error(e);$('#term-list').textContent=e.message});
restore();
})();
