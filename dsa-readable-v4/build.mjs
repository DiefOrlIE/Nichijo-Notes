import fs from "node:fs";
import path from "node:path";
import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";
import {marked} from "marked";

const root=path.dirname(fileURLToPath(import.meta.url));
const manifest=JSON.parse(fs.readFileSync(path.join(root,"quality/stage-a-manifest.json"),"utf8"));
marked.setOptions({gfm:true,breaks:false});
function renderMd(input){
  // Raw HTML <details> blocks are not necessarily Markdown parsed; convert
  // code fences to explicit escaped HTML so examples remain visible there.
  const result=input.replace(/(^|\n)~~~([a-z0-9-]*)\n([\s\S]*?)\n~~~(?=\n|$)/g,
    (_full,prefix,lang,code)=>prefix+'<pre><code class="language-'+(lang||"text")+'">'+esc(code)+'</code></pre>');
  return marked.parse(result);
}

const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const sha=s=>createHash("sha256").update(s,"utf8").digest("hex");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const chapters=[];
for(let i=0;i<16;i++){
  const filename="ch"+String(i).padStart(2,"0")+".md",raw=read("chapters/"+filename);
  const checked=manifest.chapters.find(x=>x.name===filename);
  if(!checked||sha(raw)!==checked.sha256)throw Error("Text source is not frozen: "+filename);
  const title=/^# (.+)$/m.exec(raw);
  const entries=[...raw.matchAll(/^## (.+?) \{#([a-z0-9-]+)\}\s*$/gm)];
  if(!title||entries.length<6)throw Error("Incomplete chapter: "+filename);
  const intro=raw.slice(title.index+title[0].length,entries[0].index);
  const units=entries.map((m,k)=>{
    const stop=k+1<entries.length?entries[k+1].index:raw.length;
    return{id:m[2],title:m[1],html:renderMd(raw.slice(m.index+m[0].length,stop))};
  });
  chapters.push({id:"ch"+String(i).padStart(2,"0"),title:title[1],intro:renderMd(intro),units});
}
const reviewFiles=["00-plan.md","01-question-bank-a.md","02-question-bank-b.md","03-question-bank-c.md","04-mock-a.md","05-mock-b.md"];
const review=reviewFiles.map((name,i)=>{
  const raw=read("review/"+name);
  const checked=manifest.review.find(x=>x.name===name);
  if(!checked||sha(raw)!==checked.sha256)throw Error("Review source is not frozen: "+name);
  const t=/^# (.+)$/m.exec(raw);
  if(!t)throw Error("Review title missing: "+name);
  return{id:"review-"+String(i).padStart(2,"0"),title:t[1],html:renderMd(raw.slice(t.index+t[0].length))};
});
const unitTotal=chapters.reduce((sum,c)=>sum+c.units.length,0);
if(unitTotal!==131)throw Error("Unexpected unit count: "+unitTotal);
const template=read("template.html");
function render(vars){
 let html=template;
 for(const [key,val] of Object.entries(vars))html=html.replaceAll("{{"+key+"}}",val);
 if(/\{\{[A-Z_]+\}\}/.test(html))throw Error("Unresolved template token");
 return html;
}
const courseNav=chapters.map((c,i)=>{
 const links=c.units.map(u=>'<a href="#'+esc(u.id)+'">'+esc(u.title)+'</a>').join("");
 return '<details class="nav-chapter" '+(i===0?'open':'')+'><summary>'+esc(c.title)+'</summary><a href="#'+c.id+'">本章开篇</a>'+links+'</details>';
}).join("");
const courseBody=chapters.map((c,i)=>{
 const topics=c.units.map(u=>'<section class="topic" id="'+esc(u.id)+'"><h3>'+esc(u.title)+'</h3><div class="lesson">'+u.html+'</div></section>').join("");
 return '<section class="chapter" id="'+c.id+'"><div class="chapter-heading"><p class="kicker">第 '+String(i).padStart(2,"0")+' 章</p><h2>'+esc(c.title)+'</h2><div class="chapter-intro">'+c.intro+'</div></div>'+topics+'</section>';
}).join("");
const reviewNav=review.map(r=>'<a href="#'+r.id+'">'+esc(r.title)+'</a>').join("");
const reviewBody=review.map(r=>'<section class="chapter review-section" id="'+r.id+'"><h2>'+esc(r.title)+'</h2><div class="lesson">'+r.html+'</div></section>').join("");
const courseHeader='<header class="hero" id="start"><p class="eyebrow">N I C H I J O · N O T E S</p><h1>数据结构与算法 · 连续自学讲义 V4</h1><p class="lead">从 C++ 指针到树、BST、AVL，再到集合与散列。先理解问题，跟着完整例子，再自己选择方法完成习题。</p><p class="small">16 章 · 131 个教学单元 · 文字先验收，再生成网页 · 正文宋体、标题思源宋体均内嵌</p><div class="note"><strong>阅读方法：</strong>必学概念、推导、基础例题与代码均在正文展开；只有练习提示、答案可以折叠。读完一遍后，再进入独立的期中复习页面。</div><p><a href="./review.html">进入 120 分钟期中复习专题</a> · <a href="../dsa-readable-v3/">V3 最后一章样稿</a> · <a href="../dsa-midterm/">旧版讲义</a></p></header>';
const reviewHeader='<header class="hero" id="start"><p class="eyebrow">E X A M · P R A C T I C E</p><h1>期中闭卷复习 · 120 分钟</h1><p class="lead">面向已经学过一遍的读者。复习目标是独立选方法、模拟算法、识别边界与控制考试时间。</p><p class="small">68 道专项题 · 2 套 120 分钟、100 分模拟卷 · 散列不入模拟卷</p><div class="note"><strong>使用方法：</strong>先不看提示独立作答，再展开解题思路、答案与评分点。若仍无法说明一个步骤为什么合法，返回对应的教学正文。</div><p><a href="./">返回完整教学讲义</a></p></header>';
fs.writeFileSync(path.join(root,"index.html"),render({TITLE:"数据结构 V4｜完整连续自学讲义",PAGE_TYPE:"course",NAV:courseNav,CONTENT:courseHeader+courseBody}),"utf8");
fs.writeFileSync(path.join(root,"review.html"),render({TITLE:"数据结构 V4｜120 分钟闭卷期中复习",PAGE_TYPE:"review",NAV:reviewNav,CONTENT:reviewHeader+reviewBody}),"utf8");
const result={chapters:16,units:unitTotal,chapter_questions:manifest.counts.chapter_questions,practice_questions:68,mock_questions:24,source_manifest_sha256:sha(read("quality/stage-a-manifest.json"))};
fs.writeFileSync(path.join(root,"quality/stage-b-build.json"),JSON.stringify(result,null,2)+"\n","utf8");
console.log(JSON.stringify(result));
