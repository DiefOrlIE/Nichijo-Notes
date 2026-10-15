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
  assert.equal(await page.locator('.topic').count(),95);
  assert.equal(await page.locator('.layer:not([hidden])').count(),190);
  assert.equal(await page.locator('#glossary-table tbody tr').count()>50,true);
  assert.equal(await page.locator('#homework-content a[href^="#ch"]').count()>=15,true);
  assert.equal(await page.locator('.question details').count()>=175,true);
  assert.equal(await page.locator('.topic[id$="-extra-exercises"]').count(),15);
  const fontState=await page.evaluate(async()=>{
    await Promise.all([
      document.fonts.load('17px "Nichijo Wenjin Songti"','数据库结构逻辑树'),
      document.fonts.load('700 30px "Nichijo Source Han Serif"','数据结构算法'),
    ]);
    await document.fonts.ready;
    const faces=[...document.fonts].map(f=>({family:f.family,status:f.status}));
    return {faces,body:getComputedStyle(document.body).fontFamily,title:getComputedStyle(document.querySelector('main h1')).fontFamily};
  });
  assert.ok(fontState.body.includes('Nichijo Wenjin Songti'),'body not in embedded Songti');
  assert.ok(fontState.title.includes('Nichijo Source Han Serif'),'headings not in embedded Source Han Serif');
  for(const family of ['Nichijo Wenjin Songti','Nichijo Source Han Serif'])
    assert.ok(fontState.faces.some(f=>f.family.includes(family)&&f.status==='loaded'),family+' missing or not loaded');

  const codes=await page.locator('.layer[data-level="3"] pre code').count();
  assert.ok(codes>=10,'missing code samples');
  return true;
}
try {
 const context=await browser.newContext({viewport:{width:1360,height:900}});
 const page=await context.newPage();
 await checkPage(page,'desktop');
 await page.locator('button[data-tier="4"]').click();
 assert.equal(await page.locator('.layer:not([hidden])').count(),380);
 await page.locator('button[data-tier="3"]').click();
 assert.equal(await page.locator('.layer:not([hidden])').count(),285);
 const first=page.locator('.question details').first();
 const id=await first.getAttribute('id');
 await first.locator('summary').click();
 assert.equal(await first.evaluate(el=>el.open),true);
 await page.reload({waitUntil:'networkidle'});
 assert.equal(await page.locator('button[data-tier="3"]').getAttribute('aria-pressed'),'true');
 assert.equal(await page.locator('#'+id).evaluate(el=>el.open),true);
 await page.locator('button[data-tier="4"]').click();
 const ex=page.locator('#ch14-extra-exercises details').first();
 await ex.locator('summary').click();
 assert.equal(await ex.evaluate(el=>el.open),true);
 await page.reload({waitUntil:'networkidle'});
 assert.equal(await page.locator('#ch14-extra-exercises details').first().evaluate(el=>el.open),true);
 await page.locator('button[data-tier="3"]').click();
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
 console.log('PASS: 95 sections, 75 new guided questions, 15 chapter exercise sections, desktop/phone/tablet layouts, four tiers, answer persistence, theme, and two separately loaded self-hosted Songti webfonts.');
} finally {
 await browser.close();
}