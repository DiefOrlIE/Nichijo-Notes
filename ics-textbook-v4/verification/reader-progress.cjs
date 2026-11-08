const {JSDOM}=require('jsdom'),fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),key='nichijo-ics-textbook-v4',script=fs.readFileSync(root+'/reader.js','utf8');
async function open(page,hash,state){
 const dom=new JSDOM(fs.readFileSync(root+'/'+page,'utf8'),{url:'https://example.test/ics-textbook-v4/'+page+hash,runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,d=w.document;
 w.document.fonts={ready:Promise.resolve()};w.fetch=async()=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(root+'/terms.json','utf8'))});w.localStorage.setItem(key,JSON.stringify(state));
 w.scrollTo=(x,y)=>{w.scrollY=y};
 [...d.querySelectorAll('[data-anchor]')].forEach((e,i)=>{e.getBoundingClientRect=()=>({top:i*1000-w.scrollY,bottom:i*1000-w.scrollY+50})});
 w.HTMLElement.prototype.scrollIntoView=function(){w.scrollTo(0,this.getBoundingClientRect().top+w.scrollY)};
 w.eval(script);await new Promise(r=>setTimeout(r,60));assert(w.ICS_READY);return {w,d,dom};
}
(async()=>{
 const id='unit-03-function-call-s5',hash='#unit-03-function-call-s1',book='/ics-textbook-v4/book4.html',full='/ics-textbook-v4/';
 const initial={positions:{[book]:{id,offset:240,urlHash:hash},[full]:{id:'chapter-2',offset:44,urlHash:''}}};
 for(const entryHash of ['',hash,'#start']){const {w,d}=await open('book4.html',entryHash,initial);const y=d.getElementById(id).getBoundingClientRect().top+w.scrollY;assert.equal(w.scrollY,y+240,'Reopen resumes the previous offset');w.close()}
 const a=await open('book4.html','#unit-03-objects-s5',initial);assert.equal(a.d.getElementById('unit-03-objects-s5').getBoundingClientRect().top,0,'Explicit new chapter wins');a.w.close();
 const b=await open('book4.html',hash,initial);b.w.scrollTo(0,b.w.scrollY+88);b.w.dispatchEvent(new b.w.Event('pagehide'));const saved=JSON.parse(b.w.localStorage.getItem(key));assert.equal(saved.positions[book].id,id);assert.equal(saved.positions[book].offset,328);assert.deepEqual(saved.positions[full],initial.positions[full]);b.w.close();
 const c=await open('book4.html',hash,saved);assert.equal(c.d.getElementById(id).getBoundingClientRect().top,-328);c.w.close();
 const legacy=await open('book4.html','',{position:{id,offset:120}});assert.equal(legacy.d.getElementById(id).getBoundingClientRect().top,-120);legacy.w.close();
 const main=await open('index.html','',initial);assert.equal(main.d.getElementById('chapter-2').getBoundingClientRect().top,-44);main.w.close();
 const fifthPath='/ics-textbook-v4/book5.html',fifthId='unit-04-dynamic-s3';const fifth=await open('book5.html','',{positions:{...initial.positions,[fifthPath]:{id:fifthId,offset:210,urlHash:''}}});assert.equal(fifth.d.getElementById(fifthId).getBoundingClientRect().top,-210);fifth.w.dispatchEvent(new fifth.w.Event('pagehide'));assert.deepEqual(JSON.parse(fifth.w.localStorage.getItem(key)).positions[book],initial.positions[book]);fifth.w.close();
 console.log('Passed: resume exact section offset, same-hash reopen, entry link, explicit new chapter, separate routes, pagehide save, legacy migration');
})().catch(e=>{console.error(e);process.exit(1)});
