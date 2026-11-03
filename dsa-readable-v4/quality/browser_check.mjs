import {chromium} from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";

const browser = await chromium.launch({headless:true,args:["--no-sandbox"]});
const errors = [];
fs.mkdirSync("v4-qa", {recursive:true});

async function validateVisibleQuestions(page, expected, label) {
  const audit = await page.locator("#reading details.question").evaluateAll(items =>
    items.map((detail, i) => {
      let node = detail.previousElementSibling;
      const statement = [];
      while (node && !(node.tagName === "H4" && node.classList.contains("exercise-title"))) {
        statement.unshift(node.textContent || "");
        node = node.previousElementSibling;
      }
      const text = statement.join(" ").trim();
      const solution = detail.textContent || "";
      return {
        number:i+1,
        hasHeading:!!node,
        hasVisibleStatement:text.includes("题目。") || text.includes("完整题干："),
        visibleLength:text.length,
        folded:!detail.open,
        hasApproach:/思路|提示|入手/.test(solution),
        hasAnswer:/解答|答案/.test(solution),
        summary:(detail.querySelector("summary")?.textContent || "").trim(),
        ancestorSample:detail.parentElement?.outerHTML.slice(0,280),
        headingCount:detail.closest(".topic")?.querySelectorAll("h4.exercise-title").length || 0
      };
    })
  );
  assert.equal(audit.length, expected, label + ": wrong exercise count");
  const problems = audit.filter(q =>
    !q.hasHeading || !q.hasVisibleStatement || q.visibleLength < 20 ||
    !q.folded || !q.hasApproach || !q.hasAnswer ||
    !q.summary.includes("查看")
  );
  assert.deepEqual(problems, [], label + ": hidden/incomplete statements or solutions");
}

async function open(page, type, label) {
  page.on("pageerror", err => errors.push(label + ": " + err.message));
  const url = "http://127.0.0.1:8765/dsa-readable-v4/" +
    (type === "review" ? "review.html" : "");
  const response = await page.goto(url, {waitUntil:"networkidle"});
  assert.equal(response.status(), 200);
  assert.equal(await page.locator(".sidebar").count(), 1);
  assert.equal(await page.locator("[data-tier]").count(), 0);
  const brokenNesting = await page.locator("#reading code details.question, #reading pre details.question, #reading code .topic, #reading code .chapter").count();
  if(brokenNesting)console.log("BROKEN NESTING TRACE",label,await page.locator("#reading code:has(details.question), #reading pre:has(details.question), #reading code:has(.topic), #reading code:has(.chapter)").evaluateAll(nodes=>nodes.slice(0,5).map(x=>({tag:x.tagName,markup:x.outerHTML.slice(0,650)}))));
  assert.equal(brokenNesting,0,label + ": HTML has invalid nested code elements (unescaped comparison operator)");
  if (type === "course") {
    assert.equal(await page.locator("#reading > .chapter").count(), 16);
    assert.equal(await page.locator("#reading .topic").count(), 131);
    assert.equal(await page.locator("#v4-lps-fallback").count(), 1);
    assert.equal(await page.locator("#ch15-dsu").count(), 1);
    await validateVisibleQuestions(page, 86, label);
  } else {
    assert.equal(await page.locator("#reading > .chapter").count(), 8);
    assert.equal(await page.locator("#review-04").count(), 1);
    assert.equal(await page.locator("#review-05").count(), 1);
    assert.equal(await page.locator("#review-06").count(), 1);
    assert.equal(await page.locator("#review-07").count(), 1);
    await validateVisibleQuestions(page, 150, label);
  }


  // Inspect the *entire* rendered manuscript, not only exercise controls.
  // Malformed legacy inline HTML such as <code>i<n</code> previously swallowed
  // subsequent paragraphs and question blocks into a single CODE element.
  const bodyProblems = await page.locator("#reading").evaluate(root => {
    const failures = [];
    for (const [i, code] of [...root.querySelectorAll(".lesson code")].entries()) {
      if (code.querySelector("p,details,section,h1,h2,h3,h4,table,pre,ol,ul,div")) {
        failures.push({kind:"code-swallowed-body",index:i,snippet:code.textContent.slice(0,120)});
      }
    }
    for (const [i, paragraph] of [...root.querySelectorAll(".lesson p, .lesson li")].entries()) {
      const t=(paragraph.textContent||"").trim();
      if (/^(?:~~~(?:cpp)?|#{1,5}\s|\*\*[^*]{2,32}\*\*)/.test(t)) {
        failures.push({kind:"raw-markdown",index:i,snippet:t.slice(0,120)});
      }
    }
    for (const [i, h] of [...root.querySelectorAll(".lesson h4")].entries()) {
      if ((h.textContent||"").trim().startsWith("####")) {
        failures.push({kind:"markdown-heading-literal",index:i});
      }
    }
    return failures.slice(0,25);
  });
  assert.deepEqual(bodyProblems, [], label + ": full manuscript body has broken HTML or Markdown");


  const home=page.locator(".sidebar-heading .home-link");
  assert.equal(await home.count(),1,label+": home navigation missing");
  assert.equal(await home.getAttribute("href"),"../",label+": home must point to the actual site root");
  const cppBlocks=page.locator("#reading pre.code-block code.hljs.language-cpp");
  assert.ok(await cppBlocks.count()>0,label+": C++ syntax highlighted blocks missing");
  const highlightCount=await page.locator("#reading pre.code-block .hljs-keyword, #reading pre.code-block .hljs-type, #reading pre.code-block .hljs-string, #reading pre.code-block .hljs-number").count();
  assert.ok(highlightCount>10,label+": token spans not produced by the highlighter");
  if(type==="course"){
    assert.equal(await page.locator("#reading .topic > h3").count(),131);
    assert.equal(await page.locator("#reading .lesson > .section-epigraph").count(),131);
    assert.equal(await page.locator("#reading .chapter-epigraph").count(),16);
    const titles=await page.locator("#reading .topic > h3").allTextContents();
    assert.ok(titles.every((title,i)=>/^\d{2}\.\d+\s+\S/.test(title) && title.length<=38),label+": long or unnumbered knowledge title");
  }


  const codeColor=await page.locator("#reading pre.code-block .hljs-keyword, #reading pre.code-block .hljs-type, #reading pre.code-block .hljs-number").first()
    .evaluate(token=>({
      highlighted:getComputedStyle(token).color,
      base:getComputedStyle(token.closest("pre")).color
    }));
  assert.notEqual(codeColor.highlighted,codeColor.base,label+": syntax tokens have no distinct computed color");
  if(type==="course"){
    const sizes=await page.locator("#reading .topic").first().evaluate(topic=>({
      heading:parseFloat(getComputedStyle(topic.querySelector("h3")).fontSize),
      epigraph:parseFloat(getComputedStyle(topic.querySelector(".section-epigraph")).fontSize)
    }));
    assert.ok(sizes.epigraph < sizes.heading,label+": teaching epigraph is not visually subordinate");
  }

  const tableInfo = await page.locator(".lesson .table-scroll > table").evaluateAll(tables =>
    tables.map(table => ({
      computed:getComputedStyle(table).display,
      container:table.parentElement?.getAttribute("role")
    }))
  );
  assert.ok(tableInfo.length > 0, label + ": missing table presentation");
  assert.ok(tableInfo.every(t => t.computed === "table" && t.container === "region"),
    label + ": non-native table layout");

  const families = await page.evaluate(async () => {
    await Promise.all([
      document.fonts.load('17px "Nichijo Wenjin Songti"', "数据结构链表二叉树"),
      document.fonts.load('700 22px "Nichijo Source Han Serif"', "数据结构算法")
    ]);
    await document.fonts.ready;
    return {
      body:getComputedStyle(document.body).fontFamily,
      title:getComputedStyle(document.querySelector("h1")).fontFamily,
      loaded:[...document.fonts].filter(f => f.status === "loaded").map(f => f.family)
    };
  });
  assert.ok(families.body.includes("Nichijo Wenjin Songti"));
  assert.ok(families.title.includes("Nichijo Source Han Serif"));
  assert.ok(families.loaded.some(f => f.includes("Nichijo Wenjin Songti")));
  assert.ok(families.loaded.some(f => f.includes("Nichijo Source Han Serif")));
  const documentOverflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - innerWidth
  );
  assert.ok(documentOverflow <= 2, label + ": document overflow " + documentOverflow);
  console.log("PASS", label, "visible questions / tables / fonts / width");
}

try {
  const desktop = await browser.newContext({viewport:{width:1380,height:900}});
  const page = await desktop.newPage();
  await open(page, "course", "desktop-course");

  // Scrollspy follows the reading surface and keeps the active sidebar entry
  // visible without changing the main document's own scroll position.
  const later=page.locator("#reading .topic").nth(93);
  const laterId=await later.getAttribute("id");
  await later.evaluate(node=>window.scrollTo({
    top:window.scrollY+node.getBoundingClientRect().top-95,behavior:"instant"
  }));
  await page.waitForTimeout(160);
  const sideLink=page.locator('#sidebar .contents a[href="#'+laterId+'"]');
  assert.equal(await sideLink.getAttribute("aria-current"),"location");
  assert.ok(await sideLink.evaluate(node=>node.closest("details.nav-chapter")?.open));
  const sideBounds=await sideLink.evaluate(node=>{
    const link=node.getBoundingClientRect(),parent=node.closest("#sidebar").getBoundingClientRect();
    return {top:link.top,bottom:link.bottom,parentTop:parent.top,parentBottom:parent.bottom};
  });
  assert.ok(sideBounds.top>=sideBounds.parentTop &&
    sideBounds.bottom<=sideBounds.parentBottom,"scrollspy left current entry offscreen");

  // Manually navigating the sidebar temporarily suspends its auto scroll.
  await page.locator("#sidebar").evaluate(node=>{
    node.dispatchEvent(new WheelEvent("wheel",{bubbles:true,deltaY:240}));
    node.scrollTop=0;
  });
  const farther=page.locator("#reading .topic").nth(120);
  const fartherId=await farther.getAttribute("id");
  await farther.evaluate(node=>window.scrollTo({
    top:window.scrollY+node.getBoundingClientRect().top-95,behavior:"instant"
  }));
  await page.waitForTimeout(160);
  assert.equal(await page.locator('#sidebar .contents a[href="#'+fartherId+'"]').getAttribute("aria-current"),"location");
  assert.equal(await page.locator("#sidebar").evaluate(node=>node.scrollTop),0,
    "manual TOC browsing should not be overridden immediately");

  const question = page.locator("#v4-list-exercises details.question").first();
  await question.locator("summary").click();
  assert.equal(await question.evaluate(n => n.open), true);
  assert.ok((await question.innerText()).includes("思路"));
  await page.reload({waitUntil:"networkidle"});
  assert.equal(await page.locator("#v4-list-exercises details.question").first()
    .evaluate(n => n.open), true);
  const lightSyntax=await page.locator("pre.code-block .hljs-keyword").first().evaluate(el=>getComputedStyle(el).color);
  await page.locator("#theme-toggle").click();
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  const darkSyntax=await page.locator("pre.code-block .hljs-keyword").first().evaluate(el=>getComputedStyle(el).color);
  assert.notEqual(lightSyntax,darkSyntax,"C++ syntax palette must change with dark mode");
  await page.screenshot({path:"v4-desktop.png",fullPage:false});
  await desktop.close();

  const mobile = await browser.newContext({
    viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true
  });
  const phone = await mobile.newPage();
  await open(phone, "course", "mobile-course");

  // The off-canvas TOC opens directly at the currently read subsection.
  const mobileTarget=phone.locator("#reading .topic").nth(88);
  const mobileId=await mobileTarget.getAttribute("id");
  await mobileTarget.evaluate(node=>window.scrollTo({
    top:window.scrollY+node.getBoundingClientRect().top-95,behavior:"instant"
  }));
  await phone.waitForTimeout(130);
  const beforeMenuY=await phone.evaluate(()=>scrollY);

  await phone.locator("#menu-toggle").evaluate(button=>button.click());
  assert.equal(await phone.locator("#sidebar")
    .evaluate(n => n.classList.contains("open")), true);

  const mobileActive=phone.locator('#sidebar .contents a[href="#'+mobileId+'"]');
  assert.equal(await mobileActive.getAttribute("aria-current"),"location");
  const mobileVisible=await mobileActive.evaluate(node=>{
    const a=node.getBoundingClientRect(),s=node.closest("#sidebar").getBoundingClientRect();
    return a.top>=s.top && a.bottom<=s.bottom;
  });
  assert.ok(mobileVisible,"mobile TOC did not scroll to active topic on opening");
  assert.equal(await phone.evaluate(()=>scrollY),beforeMenuY,
    "opening sidebar unexpectedly moved the reading document");
  await phone.locator("#shade").click({position:{x:370,y:150}});
  assert.equal(await phone.locator("#sidebar")
    .evaluate(n => n.classList.contains("open")), false);

  for (let i=0;i<16;i++) {
    const id = "#ch" + String(i).padStart(2,"0");
    await phone.locator(id + " h4.exercise-title").first().scrollIntoViewIfNeeded();
    await phone.screenshot({
      path:"v4-qa/ch" + String(i).padStart(2,"0") + ".png",fullPage:false
    });
  }
  await open(phone, "review", "mobile-review");
  for (let i=0;i<8;i++) {
    const selector = "#review-" + String(i).padStart(2,"0");
    const anchor = i ? selector + " h4.exercise-title" : selector + " h2";
    await phone.locator(anchor).first().scrollIntoViewIfNeeded();
    await phone.screenshot({
      path:"v4-qa/review-" + String(i).padStart(2,"0") + ".png",fullPage:false
    });
  }
  const examAnswer = phone.locator("#review-05 details.question:has(pre code)").first();
  await examAnswer.locator("summary").click();
  assert.equal(await examAnswer.evaluate(n => n.open),true);
  assert.ok((await examAnswer.locator("pre code").first().innerText()).includes("Node* mirror"));
  await phone.screenshot({path:"v4-mobile-review.png",fullPage:false});
  await mobile.close();

  const tablet = await browser.newContext({
    viewport:{width:820,height:1180},deviceScaleFactor:2,isMobile:true,hasTouch:true
  });
  const ipad = await tablet.newPage();
  await open(ipad, "review", "tablet-review");
  await ipad.screenshot({path:"v4-tablet.png",fullPage:false});
  await tablet.close();
  assert.deepEqual(errors, [], "client-side JavaScript errors");
  console.log("PASS complete V4: 236 questions stay visible, solutions fold, tables render and responsive layouts work");
} finally {
  await browser.close();
}
