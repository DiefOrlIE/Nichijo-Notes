import {chromium} from "playwright";
import assert from "node:assert/strict";
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
const errors=[];
async function open(page,type,label){
 page.on("pageerror",e=>errors.push(label+": "+e.message));
 const res=await page.goto("http://127.0.0.1:8765/dsa-readable-v4/"+(type==="review"?"review.html":""),{waitUntil:"networkidle"});
 assert.equal(res.status(),200);
 assert.equal(await page.locator(".sidebar").count(),1);
 assert.equal(await page.locator("[data-tier]").count(),0);
 if(type==="course"){
  assert.equal(await page.locator("#reading > .chapter").count(),16);
  assert.equal(await page.locator("#reading .topic").count(),131);
  assert.equal(await page.locator("#reading details.question").count(),82);
  assert.equal(await page.locator("#v4-lps-fallback").count(),1);
  assert.equal(await page.locator("#ch15-dsu").count(),1);
  assert.ok((await page.locator("#ch15").innerText()).includes("散列"));
 }else{
  assert.equal(await page.locator("#reading > .chapter").count(),6);
  assert.equal(await page.locator("#reading details.question").count(),92);
  assert.equal(await page.locator("#review-04").count(),1);
  assert.equal(await page.locator("#review-05").count(),1);
  const examCode=await page.locator("#review-05 details pre code").first().innerText();
  assert.ok(examCode.includes("Node* mirror"),"C++ inside expanded answer did not render");
 }
 const face=await page.evaluate(async()=>{
  await Promise.all([
   document.fonts.load('17px "Nichijo Wenjin Songti"','数据结构链表二叉树'),
   document.fonts.load('700 22px "Nichijo Source Han Serif"','数据结构算法')
  ]);
  await document.fonts.ready;
  return {
   body:getComputedStyle(document.body).fontFamily,
   h1:getComputedStyle(document.querySelector("h1")).fontFamily,
   loaded:[...document.fonts].filter(x=>x.status==="loaded").map(x=>x.family)
  };
 });
 assert.ok(face.body.includes("Nichijo Wenjin Songti"));
 assert.ok(face.h1.includes("Nichijo Source Han Serif"));
 assert.ok(face.loaded.some(x=>x.includes("Nichijo Wenjin Songti")));
 assert.ok(face.loaded.some(x=>x.includes("Nichijo Source Han Serif")));
 const dx=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 assert.ok(dx<=2,label+" overflow "+dx);
 console.log(label,":",type,"fonts/contents/width passed");
}
try{
 const desktop=await browser.newContext({viewport:{width:1380,height:900}});
 const page=await desktop.newPage();
 await open(page,"course","desktop");
 const detail=page.locator("#v4-list-exercises details.question").first();
 await detail.locator("summary").click();
 assert.equal(await detail.evaluate(n=>n.open),true);
 await page.waitForTimeout(300);
 await page.reload({waitUntil:"networkidle"});
 assert.equal(await page.locator("#v4-list-exercises details.question").first().evaluate(n=>n.open),true);
 await page.locator("#theme-toggle").click();
 assert.equal(await page.locator("html").getAttribute("data-theme"),"dark");
 await page.screenshot({path:"v4-desktop.png",fullPage:false});
 await desktop.close();
 const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
 const phone=await mobile.newPage();
 await open(phone,"course","phone");
 await phone.locator("#menu-toggle").click();
 assert.equal(await phone.locator("#sidebar").evaluate(n=>n.classList.contains("open")),true);
 await phone.locator("#shade").click({position:{x:370,y:150}});
 assert.equal(await phone.locator("#sidebar").evaluate(n=>n.classList.contains("open")),false);
 await open(phone,"review","phone-review");
 await phone.screenshot({path:"v4-mobile-review.png",fullPage:false});
 await mobile.close();
 const tablet=await browser.newContext({viewport:{width:820,height:1180},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const ipad=await tablet.newPage();
 await open(ipad,"review","tablet-review");
 await ipad.screenshot({path:"v4-tablet.png",fullPage:false});
 await tablet.close();
 assert.deepEqual(errors,[],"client-side script errors");
 console.log("PASS V4 full course and separate exam page, persistence, fonts, dark mode and responsive layouts.");
}finally{
 await browser.close();
}
