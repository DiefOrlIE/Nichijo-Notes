(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],key='nichijo-ics-textbook-v4';
let state={};try{state=JSON.parse(localStorage.getItem(key)||'{}')}catch{}
const store=()=>{try{localStorage.setItem(key,JSON.stringify(state))}catch{}};
state.answers??={};
const termStyleInput=$('#term-style');
function setTermStyle(value){state.termStyle=['a','b','c'].includes(value)?value:'b';document.documentElement.dataset.termStyle=state.termStyle;termStyleInput.value=state.termStyle}
setTermStyle(state.termStyle);termStyleInput.addEventListener('change',()=>{setTermStyle(termStyleInput.value);store()});
const sizeInput=$('#font-size'),sizeOutput=$('#font-size-value');
function setFontSize(value){state.fontSize=Math.max(16,Math.min(24,Number(value)||19));document.documentElement.style.setProperty('--read-size',state.fontSize+'px');sizeInput.value=state.fontSize;sizeOutput.value=state.fontSize+'px'}
setFontSize(state.fontSize);sizeInput.addEventListener('input',()=>{if(sizeInput.value!==''&&sizeInput.validity.valid){setFontSize(sizeInput.value);store()}});sizeInput.addEventListener('change',()=>{setFontSize(sizeInput.value);store()});
const toneInput=$('#page-tone');
function setTone(value){state.pageTone=Math.max(80,Math.min(100,Math.round(Number(value)||95)));document.documentElement.style.setProperty('--paper-shade',(100-state.pageTone)+'%');toneInput.value=state.pageTone}
setTone(state.pageTone);toneInput.addEventListener('input',()=>{if(toneInput.value!==''&&toneInput.validity.valid){setTone(toneInput.value);store()}});toneInput.addEventListener('change',()=>{setTone(toneInput.value);store()});
// Keep the page centered in the viewport; fold the TOC when its gutter is too small.
const widthInput=$('#reading-width'),widthOutput=$('#reading-width-value');
function fitDirectory(){document.body.classList.toggle('toc-drawer',innerWidth<state.readWidth+352)}
function setReadingWidth(value){state.readWidth=Math.round(Math.max(720,Math.min(1440,Number(value)||960))/20)*20;document.documentElement.style.setProperty('--read-width',state.readWidth+'px');widthInput.value=state.readWidth;widthOutput.value=state.readWidth+'px';fitDirectory()}
setReadingWidth(state.readWidth);widthInput.addEventListener('input',()=>{if(widthInput.value!==''&&widthInput.validity.valid){setReadingWidth(widthInput.value);store()}});widthInput.addEventListener('change',()=>{setReadingWidth(widthInput.value);store()});addEventListener('resize',fitDirectory);
for(const [selector,direction]of [['#width-left',-1],['#width-right',1]]){
 const handle=$(selector);let drag=null;
 handle.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,width:$('#main').getBoundingClientRect().width};handle.setPointerCapture(e.pointerId);document.body.classList.add('resizing');e.preventDefault()});
 handle.addEventListener('pointermove',e=>{if(drag)setReadingWidth(Math.min(innerWidth-32,drag.width+2*direction*(e.clientX-drag.x)))});
 const stop=()=>{if(!drag)return;drag=null;document.body.classList.remove('resizing');store()};handle.addEventListener('pointerup',stop);handle.addEventListener('pointercancel',stop);handle.addEventListener('lostpointercapture',stop);
 handle.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();setReadingWidth(e.key==='Home'?720:e.key==='End'?1440:state.readWidth+(e.key==='ArrowRight'?20:-20));store()});
}
// Custom steppers replace browser-owned white arrow panels in every theme.
function syncSteppers(){
 $$('[data-step-target]').forEach(button=>{const input=document.getElementById(button.dataset.stepTarget);const value=input.valueAsNumber;button.disabled=Number.isFinite(value)&&(Number(button.dataset.step)>0?value>=Number(input.max):value<=Number(input.min))});
}
$$('[data-step-target]').forEach(button=>button.addEventListener('click',()=>{
 const input=document.getElementById(button.dataset.stepTarget);
 if(Number(button.dataset.step)>0)input.stepUp();else input.stepDown();input.dispatchEvent(new Event('input',{bubbles:true}));syncSteppers();
}));
$$('header input[type="number"]').forEach(input=>{input.addEventListener('input',syncSteppers);input.addEventListener('change',syncSteppers)});syncSteppers();
// Technical tokens in prose need code markup as well as a monospace stylesheet.
const codePattern=/(?<![A-Za-z0-9_])(?:%?(?:[er]?(?:ax|bx|cx|dx|si|di|bp|sp|ip)|[abcd][lh]|r(?:[89]|1[0-5])(?:[dwb])?)|(?:EAX|EBX|ECX|EDX|ESI|EDI|EBP|ESP|EIP|RAX|RBX|RCX|RDX|RBP|RSP|RIP|AX|BX|CX|DX|AL|AH|BL|BH|CL|CH|DL|DH|CF|ZF|SF|OF)|(?:mov[zs]?[bwlq]?|lea[lq]?|push[lq]?|pop[lq]?|call[q]?|ret[q]?|leave|cmp[lq]?|test[lq]?|add[lq]?|sub[lq]?|jmp|je|jne|jle|jge|jl|jg|and[lq]?|xor[lq]?|shl[lq]?|shr[lq]?|sar[lq]?))(?![A-Za-z0-9_])/g;
const proseWalk=document.createTreeWalker($('#main'),NodeFilter.SHOW_TEXT);let proseNode;const proseNodes=[];
while(proseNode=proseWalk.nextNode())if(!proseNode.parentElement.closest('code,pre,script,style'))proseNodes.push(proseNode);
for(const node of proseNodes){const text=node.nodeValue;let match,last=0;const frag=document.createDocumentFragment();codePattern.lastIndex=0;while(match=codePattern.exec(text)){frag.append(text.slice(last,match.index));const code=document.createElement('code');code.textContent=match[0];frag.append(code);last=codePattern.lastIndex}if(last){frag.append(text.slice(last));node.replaceWith(frag)}}

document.documentElement.dataset.theme=state.theme||'light';
$('#theme').textContent=state.theme==='dark'?'日间':'夜间';
$('#theme').onclick=()=>{state.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=state.theme;$('#theme').textContent=state.theme==='dark'?'日间':'夜间';store()};
$('#menu').onclick=()=>{const open=$('#nav').classList.toggle('open');$('#menu').setAttribute('aria-expanded',String(open))};
$$('nav a').forEach(a=>a.addEventListener('click',()=>{$('#nav').classList.remove('open');$('#menu').setAttribute('aria-expanded','false')}));
$$('main table').forEach(t=>{let w=document.createElement('div');w.className='table-scroll';t.replaceWith(w);w.append(t)});
// Only explicitly labelled exercise solutions are folded; worked examples stay visible.
const foldInstances=new Map();
$$('article p').filter(p=>/^(解答|提示)：/.test(p.textContent)).forEach((p,i)=>{let d=document.createElement('details'),s=document.createElement('summary');s.textContent=p.textContent.startsWith('提示：')?'展开提示':'展开本题解答与核对';let hash=2166136261;for(const c of p.textContent)hash=Math.imul(hash^c.charCodeAt(0),16777619)>>>0;const stem='answer-'+p.closest('article').id+'-'+hash.toString(36),instance=(foldInstances.get(stem)||0)+1;foldInstances.set(stem,instance);d.id=stem+'-'+instance;const legacy='answer-text-'+hash.toString(36);if(state.answers[d.id]===undefined&&state.answers[legacy]!==undefined)state.answers[d.id]=state.answers[legacy];p.replaceWith(d);d.append(s,p);d.open=!!state.answers?.[d.id];d.addEventListener('toggle',()=>{state.answers??={};state.answers[d.id]=d.open;store()})});
let restoring=true;const anchors=$$('[data-anchor]');
const pageKey=location.pathname.replace(/index\.html$/,'');
state.positions??={};
if('scrollRestoration' in history)history.scrollRestoration='manual';

const nav=$('#nav');
const navEntries=$$('nav a').filter(a=>a.getAttribute('href').startsWith('#')).map(link=>({link,target:document.getElementById(decodeURIComponent(link.hash.slice(1)))})).filter(e=>e.target);
let currentLink=null;
function followDirectory(){
 let current=navEntries[0];let best=-Infinity;
 for(const entry of navEntries){const top=entry.target.getBoundingClientRect().top;if(top<=140&&top>=best){current=entry;best=top}}
 if(!current||current.link===currentLink)return;
 currentLink=current.link;
 for(const {link}of navEntries){const active=link===currentLink;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')}
 for(let parent=currentLink.parentElement;parent&&parent!==nav;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;
 if(getComputedStyle(nav).display!=='none'){
 const r=currentLink.getBoundingClientRect(),n=nav.getBoundingClientRect();
 if(r.top<n.top+20)nav.scrollTop+=r.top-n.top-24;
 else if(r.bottom>n.bottom-20)nav.scrollTop+=r.bottom-n.bottom+24;
 }
}
function savePosition(){if(restoring)return;let a=anchors[0];for(const el of anchors){if(el.getBoundingClientRect().top<=140)a=el;else break}if(a)state.positions[pageKey]={id:a.id,offset:-a.getBoundingClientRect().top,urlHash:location.hash};store();followDirectory()}
let framePending=false,timer;addEventListener('scroll',()=>{if(!framePending){framePending=true;requestAnimationFrame(()=>{framePending=false;followDirectory()})}clearTimeout(timer);timer=setTimeout(savePosition,160)},{passive:true});addEventListener('pagehide',savePosition);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')savePosition()});addEventListener('resize',()=>{currentLink=null;followDirectory()});
async function restore(){
 await document.fonts.ready;await new Promise(requestAnimationFrame);
 const saved=state.positions[pageKey]||state.position;
 const resume=saved&&document.getElementById(saved.id);
 const explicitHash=location.hash&&location.hash!=='#start'&&location.hash!==saved?.urlHash;
 let target=null;try{if(location.hash)target=document.getElementById(decodeURIComponent(location.hash.slice(1)))}catch{}
 if(explicitHash&&target)target.scrollIntoView();
 else if(resume)scrollTo(0,resume.getBoundingClientRect().top+scrollY+(Number(saved.offset)||0));
 else target?.scrollIntoView();
 restoring=false;followDirectory();window.ICS_READY=true;
}
const dialog=$('#terms');let defs={};
function show(filter=''){const f=filter.toLowerCase();$('#term-list').replaceChildren();for(const [k,v]of Object.entries(defs)){if(!`${k} ${v.en} ${v.zh}`.toLowerCase().includes(f))continue;let p=document.createElement('p'),b=document.createElement('b');b.textContent=k+' · '+v.en;p.append(b,document.createElement('br'),v.zh);if(v.note)p.append(document.createElement('br'),v.note);$('#term-list').append(p)}}
$('#term-open').onclick=()=>{show();dialog.showModal();$('#term-search').focus()};$('#term-search').oninput=e=>show(e.target.value);
fetch('terms.json').then(r=>{if(!r.ok)throw Error('术语数据加载失败');return r.json()}).then(d=>{defs=d;const keys=Object.keys(d).sort((a,b)=>b.length-a.length);const escaped=keys.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));const re=new RegExp('(?<![A-Za-z0-9_])('+escaped.join('|')+')(?![A-Za-z0-9_])','g');const walk=document.createTreeWalker($('#main'),NodeFilter.SHOW_TEXT);let n,nodes=[];while(n=walk.nextNode())if(!['SCRIPT','STYLE'].includes(n.parentElement.tagName))nodes.push(n);nodes.forEach(node=>{let s=node.nodeValue,m,last=0,frag=document.createDocumentFragment();re.lastIndex=0;while(m=re.exec(s)){frag.append(s.slice(last,m.index));if(/^(?:[re]?(?:ax|bx|cx|dx|si|di|bp|sp|ip)|[abcd][lh]|r(?:[89]|1[0-5]))$/.test(m[0])&&s[m.index-1]!=='%'){frag.append(m[0]);last=re.lastIndex;continue;}let a=document.createElement('abbr');a.textContent=m[0];a.tabIndex=0;a.title=defs[m[0]].en+'：'+defs[m[0]].zh;a.setAttribute('role','button');const open=()=>{$('#term-search').value=m?.[0]||a.textContent;show(a.textContent);dialog.showModal()};a.onclick=open;a.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}};frag.append(a);last=re.lastIndex}if(last){frag.append(s.slice(last));node.replaceWith(frag)}})}).catch(e=>{console.error(e);$('#term-list').textContent=e.message});
restore();
})();
