import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const errors=[];
async function open(page,name){
 page.on('pageerror',e=>errors.push(name+': '+e.message));
 const response=await page.goto('http://127.0.0.1:8765/dsa-midterm/',{waitUntil:'networkidle'});
 assert.equal(response.status(),200);
 assert.equal(await page.locator('#chapters>.chapter').count(),16);
 assert.equal(await page.locator('#chapters .topic').count(),109);
 assert.equal(await page.locator('[data-tier]').count(),0);
 assert.equal(await page.locator('.layer').count(),0);
 assert.ok(await page.locator('.question details,details.question').count()>75);
 assert.equal(await page.locator('#ch15-asl-exam').count(),1);
 assert.equal(await page.locator('#ch02-reverse-merge').count(),1);
 assert.ok(await page.locator('#glossary-table tbody tr').count()>60);
 assert.ok(await page.locator('#homework-content a[href^="#ch"]').count()>=15);
 assert.ok((await page.locator('#ch15').innerText()).includes('线性探查'));
 const fonts=await page.evaluate(async()=>{
   await Promise.all([
     document.fonts.load('17px "Nichijo Wenjin Songti"','集合并查集散列'),
     document.fonts.load('700 22px "Nichijo Source Han Serif"','数据结构算法'),
   ]);
   await document.fonts.ready;
   return {body:getComputedStyle(document.body).fontFamily,
     heading:getComputedStyle(document.querySelector('main h1')).fontFamily,
     loaded:[...document.fonts].filter(x=>x.status==='loaded').map(x=>x.family)};
 });
 assert.ok(fonts.body.includes('Nichijo Wenjin Songti'),'body typeface');
 assert.ok(fonts.heading.includes('Nichijo Source Han Serif'),'heading typeface');
 assert.ok(fonts.loaded.some(x=>x.includes('Nichijo Wenjin Songti')),'body font WOFF2');
 assert.ok(fonts.loaded.some(x=>x.includes('Nichijo Source Han Serif')),'heading font WOFF2');
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 assert.ok(overflow<=2,'horizontal overflow '+name+' '+overflow);
 console.log(name+': 16 chapters, 109 units, local fonts, glossary, homework map, no tiers, no page overflow.');
}
try{
 const desktop=await browser.newContext({viewport:{width:1360,height:900}});
 const page=await desktop.newPage();await open(page,'desktop');
 const answer=page.locator('#ch15-asl-exam details').first();
 assert.ok(await answer.count(),'New hash unit answer');
 await answer.locator('summary').click();assert.equal(await answer.evaluate(n=>n.open),true);
 await page.reload({waitUntil:'networkidle'});
 assert.equal(await page.locator('#ch15-asl-exam details').first().evaluate(n=>n.open),true);
 await page.locator('#theme-toggle').click();
 assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
 await page.screenshot({path:'dsa-desktop.png',fullPage:false});
 await desktop.close();
 const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
 const phone=await mobile.newPage();await open(phone,'mobile');
 await phone.locator('#menu-toggle').click();
 assert.equal(await phone.locator('#toc').evaluate(n=>n.classList.contains('show')),true);
 await phone.locator('#backdrop').click({position:{x:360,y:140}});
 assert.equal(await phone.locator('#toc').evaluate(n=>n.classList.contains('show')),false);
 await phone.screenshot({path:'dsa-phone.png',fullPage:false});
 await mobile.close();
 const tablet=await browser.newContext({viewport:{width:820,height:1180},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const ipad=await tablet.newPage();await open(ipad,'tablet');
 await ipad.screenshot({path:'dsa-tablet.png',fullPage:false});
 await tablet.close();
 assert.deepEqual(errors,[]);
 console.log('PASS continuous Markdown manuscript, 16 chapters, hash exercises, old anchor, answer persistence, dark mode, local dual fonts, desktop/phone/tablet.');
}finally{await browser.close();}
