import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
let allConsole=[];
async function checkPage(page,kind) {
  page.on('pageerror',error=>allConsole.push(kind+': '+error.message));
  const response=await page.goto('http://127.0.0.1:8765/dsa-midterm/',{waitUntil:'networkidle'});
  assert.equal(response.status(),200);
  assert.equal(await page.locator('#chapters > .chapter').count(),15);
  assert.equal(await page.locator('.topic').count(),80);
  console.log('DEBUG',kind,JSON.stringify(await page.evaluate(()=>({layers:document.querySelectorAll('.layer').length,visible:document.querySelectorAll('.layer:not([hidden])').length,pressed:[...document.querySelectorAll('[data-tier]')].map(x=>x.getAttribute('aria-pressed'))}))),JSON.stringify(allConsole));
  assert.equal(await page.locator('.layer:not([hidden])').count(),160);
  assert.equal(await page.locator('#glossary-table tbody tr').count()>50,true);
  assert.equal(await page.locator('#homework-content a[href^="#ch"]').count()>=15,true);
  assert.equal(await page.locator('.question details').count()>=100,true);
  const fontStatus=await page.evaluate(async()=>{
    await document.fonts.load('17px "Nichijo Noto Serif"','数据库数据结构宋体测试');
    await document.fonts.ready;
    return document.fonts.check('17px "Nichijo Noto Serif"');
  });
  assert.equal(fontStatus,true,'local Chinese serif font not loaded');
  const codes=await page.locator('.layer[data-level="3"] pre code').count();
  assert.ok(codes>=10,'missing code samples');
  return true;
}
try {
 const context=await browser.newContext({viewport:{width:1360,height:900}});
 const page=await context.newPage();
 await checkPage(page,'desktop');
 await page.locator('button[data-tier="4"]').click();
 assert.equal(await page.locator('.layer:not([hidden])').count(),320);
 await page.locator('button[data-tier="3"]').click();
 assert.equal(await page.locator('.layer:not([hidden])').count(),240);
 const first=page.locator('.question details').first();
 const id=await first.getAttribute('id');
 await first.locator('summary').click();
 assert.equal(await first.evaluate(el=>el.open),true);
 await page.reload({waitUntil:'networkidle'});
 assert.equal(await page.locator('button[data-tier="3"]').getAttribute('aria-pressed'),'true');
 assert.equal(await page.locator('#'+id).evaluate(el=>el.open),true);
 await page.locator('#theme-toggle').click();
 assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
 await page.screenshot({path:'dsa-desktop.png',fullPage:false});
 await context.close();
 const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
 const phone=await mobile.newPage();
 await checkPage(phone,'phone');
 await phone.locator('#menu-toggle').click();
 assert.equal(await phone.locator('#toc').evaluate(el=>el.classList.contains('show')),true);
 await phone.locator('#backdrop').click({position:{x:360,y:100}});
 assert.equal(await phone.locator('#toc').evaluate(el=>el.classList.contains('show')),false);
 const over=await phone.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 assert.ok(over<=2,'mobile page horizontal overflow: '+over);
 await phone.screenshot({path:'dsa-phone.png',fullPage:false});
 await mobile.close();
 const tablet=await browser.newContext({viewport:{width:820,height:1180},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const ipad=await tablet.newPage();
 await checkPage(ipad,'tablet');
 const tabletOver=await ipad.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 assert.ok(tabletOver<=2,'tablet page horizontal overflow: '+tabletOver);
 await ipad.screenshot({path:'dsa-tablet.png',fullPage:false});
 await tablet.close();
 assert.deepEqual(allConsole,[]);
 console.log('PASS desktop, 390px phone, 820px tablet, scripts, complete four-tier states, interactive quiz memory, theme, self-hosted font, no horizontal overflow.');
} finally {
 await browser.close();
}