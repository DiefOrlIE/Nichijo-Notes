const {JSDOM}=require('jsdom'),fs=require('fs'),path=require('path'),assert=require('assert');
(async()=>{const root=path.resolve(__dirname,'..');for(const page of ['index.html','book4.html']){
const dom=new JSDOM(fs.readFileSync(path.join(root,page),'utf8'),{url:'https://example.test/'+page,runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,d=w.document;
w.document.fonts={ready:Promise.resolve()};w.fetch=async()=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(root+'/terms.json'))});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};w.localStorage.setItem('nichijo-ics-textbook-v4',JSON.stringify({fontSize:22}));
const before=d.querySelector('main').textContent;w.eval(fs.readFileSync(root+'/reader.js','utf8'));await new Promise(r=>setTimeout(r,80));
assert(w.ICS_READY);
const width=d.querySelector('#reading-width');assert.equal(width.value,'960');width.value='1200';width.dispatchEvent(new w.Event('input'));assert.equal(d.documentElement.style.getPropertyValue('--read-width'),'1200px');assert.equal(JSON.parse(w.localStorage.getItem('nichijo-ics-textbook-v4')).readWidth,1200);assert(d.body.classList.contains('toc-drawer'));d.querySelector('#width-right').dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowLeft'}));assert.equal(width.value,'1180');
assert.equal(d.documentElement.style.getPropertyValue('--read-size'),'22px');
const slider=d.querySelector('#font-size');slider.value='24';slider.dispatchEvent(new w.Event('input'));assert.equal(d.querySelector('#font-size-value').value,'24px');assert.equal(JSON.parse(w.localStorage.getItem('nichijo-ics-textbook-v4')).fontSize,24);
const nav=d.querySelector('nav'),entries=[...nav.querySelectorAll('a')].filter(a=>a.getAttribute('href').startsWith('#')&&d.getElementById(a.hash.slice(1))),target=entries.at(-3),id=target.hash.slice(1);
for(const a of entries)d.getElementById(a.hash.slice(1)).getBoundingClientRect=()=>({top:a===target?100:500});
for(const det of nav.querySelectorAll('details'))det.open=false;
nav.getBoundingClientRect=()=>({top:64,bottom:500});target.getBoundingClientRect=()=>({top:700,bottom:720});w.dispatchEvent(new w.Event('scroll'));await new Promise(r=>setTimeout(r,220));
assert.equal(nav.querySelector('[aria-current="location"]').hash,'#'+id);assert.equal(nav.querySelectorAll('a.active').length,1);assert(nav.scrollTop>0);for(let p=target.parentElement;p&&p!==nav;p=p.parentElement)if(p.tagName==='DETAILS')assert(p.open);
assert(![...d.querySelectorAll('code')].some(c=>c.querySelector('code')),'No nested code');
const foldLabels=[...d.querySelectorAll('article details>summary')].map(e=>e.textContent).join('');assert.equal(d.querySelector('main').textContent.replaceAll(/展开提示|展开本题解答与核对/g,''),before);
console.log({page,fontSizeSaved:true,currentSection:id,navFollows:true,prosePreserved:true,codeSpans:d.querySelectorAll('code').length});w.close();}})().catch(e=>{console.error(e);process.exit(1)});
