import {chromium} from 'playwright';
import assert from 'node:assert/strict';

const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let scriptErrors=[];
async function verify(page,label){
 page.on('pageerror',e=>scriptErrors.push(label+':'+e.message));
 const res=await page.goto('http://127.0.0.1:8765/dsa-readable-v3/',{waitUntil:'networkidle'});
 assert.equal(res.status(),200);
 assert.equal(await page.locator('#chapters > section.topic').count(),15);
 assert.ok(await page.locator('#ch15-bit-vector code').count()>=3);
 assert.ok(await page.locator('pre code.language-cpp').count()>=4);
 assert.ok(await page.locator('details.question').count()>=8);
 assert.ok(await page.locator('.lesson-narrative table').count()>=7);
 assert.ok(await page.locator('#chapter-links a[href^="#ch15-"]').count()>=15);
 assert.equal(await page.locator('[data-tier]').count(),0);
 assert.ok((await page.locator('#ch15-set').innerText()).includes('选课'));
 assert.ok((await page.locator('#ch15-asl-exam').innerText()).includes('25/10'));
 const fonts=await page.evaluate(async()=>{
   await Promise.all([
     document.fonts.load('17px "Nichijo Wenjin Songti"','集合并查集完整解释'),
     document.fonts.load('700 23px "Nichijo Source Han Serif"','集合散列数据结构'),
   ]);
   await document.fonts.ready;
   return {
     body:getComputedStyle(document.body).fontFamily,
     title:getComputedStyle(document.querySelector('main h1')).fontFamily,
     loaded:[...document.fonts].filter(x=>x.status==='loaded').map(x=>x.family)
   };
 });
 assert.ok(fonts.body.includes('Nichijo Wenjin Songti'));
 assert.ok(fonts.title.includes('Nichijo Source Han Serif'));
 assert.ok(fonts.loaded.some(x=>x.includes('Nichijo Wenjin Songti')));
 assert.ok(fonts.loaded.some(x=>x.includes('Nichijo Source Han Serif')));
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 assert.ok(overflow<=2,label+' horizontal page overflow: '+overflow);
 console.log(label+': manuscript content, 15 units, exercises, two embedded fonts and responsive layout PASS');
}
try{
 const desktop=await browser.newContext({viewport:{width:1440,height:900}});
 const page=await desktop.newPage();
 await verify(page,'desktop');
 const test=page.locator('#ch15-exercises details.question').first();
 await test.locator('summary').click();
 assert.equal(await test.evaluate(n=>n.open),true);
 await page.reload({waitUntil:'networkidle'});
 assert.equal(await page.locator('#ch15-exercises details.question').first().evaluate(n=>n.open),true);
 await page.locator('#theme-toggle').click();
 assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
 await page.screenshot({path:'v3-desktop.png',fullPage:false});
 await desktop.close();
 const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
 const phone=await mobile.newPage();
 await verify(phone,'iPhone-width');
 await phone.locator('#menu-toggle').click();
 assert.equal(await phone.locator('#toc').evaluate(n=>n.classList.contains('show')),true);
 await phone.locator('#backdrop').click({position:{x:380,y:140}});
 assert.equal(await phone.locator('#toc').evaluate(n=>n.classList.contains('show')),false);
 await phone.screenshot({path:'v3-phone.png',fullPage:false});
 await mobile.close();
 const tablet=await browser.newContext({viewport:{width:820,height:1180},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const ipad=await tablet.newPage();
 await verify(ipad,'iPad-width');
 await ipad.screenshot({path:'v3-tablet.png',fullPage:false});
 await tablet.close();
 assert.deepEqual(scriptErrors,[]);
 console.log('PASS V3 independent reading prototype: manuscript, syntax, exercises, dark theme, saved answers, local fonts, all three widths.');
}finally{await browser.close();}
