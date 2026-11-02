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
        prior:detail.previousElementSibling?.outerHTML.slice(0,220) || "NONE",
        parent:detail.parentElement?.tagName+"."+(detail.parentElement?.className || ""),
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
  if (problems.length) {
    const debug = await page.locator("#reading details.question").evaluateAll(items =>
      [5,10,21].map(n => {
        const item=items[n];
        return {
          number:n+1,
          parent:item.parentElement?.tagName,
          previous:item.previousElementSibling?.outerHTML.slice(0,600) ?? null,
          parentPrevious:item.parentElement?.previousElementSibling?.outerHTML.slice(0,600) ?? null,
          ancestor:item.parentElement?.outerHTML.slice(0,1000) ?? null
        };
      })
    );
    console.log("EXERCISE DOM DIAGNOSTIC",JSON.stringify(debug));
  }
  if (problems.length) console.log('VISIBILITY-DIAGNOSTIC',JSON.stringify(problems.slice(0,15)));
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
  assert.equal(brokenNesting,0,label + ": HTML has invalid nested code elements (unescaped comparison operator)");
  if (type === "course") {
    assert.equal(await page.locator("#reading > .chapter").count(), 16);
    assert.equal(await page.locator("#reading .topic").count(), 131);
    assert.equal(await page.locator("#v4-lps-fallback").count(), 1);
    assert.equal(await page.locator("#ch15-dsu").count(), 1);
    await validateVisibleQuestions(page, 86, label);
  } else {
    assert.equal(await page.locator("#reading > .chapter").count(), 6);
    assert.equal(await page.locator("#review-04").count(), 1);
    assert.equal(await page.locator("#review-05").count(), 1);
    await validateVisibleQuestions(page, 92, label);
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
  const question = page.locator("#v4-list-exercises details.question").first();
  await question.locator("summary").click();
  assert.equal(await question.evaluate(n => n.open), true);
  assert.ok((await question.innerText()).includes("思路"));
  await page.reload({waitUntil:"networkidle"});
  assert.equal(await page.locator("#v4-list-exercises details.question").first()
    .evaluate(n => n.open), true);
  await page.locator("#theme-toggle").click();
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  await page.screenshot({path:"v4-desktop.png",fullPage:false});
  await desktop.close();

  const mobile = await browser.newContext({
    viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true
  });
  const phone = await mobile.newPage();
  await open(phone, "course", "mobile-course");
  await phone.locator("#menu-toggle").click();
  assert.equal(await phone.locator("#sidebar")
    .evaluate(n => n.classList.contains("open")), true);
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
  for (let i=0;i<6;i++) {
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
  console.log("PASS complete V4: 178 questions stay visible, solutions fold, tables render and responsive layouts work");
} finally {
  await browser.close();
}
