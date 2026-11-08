"""Render only frozen prose. Run the A-stage checks and freeze before this script."""
from pathlib import Path
from markdown_it import MarkdownIt
import re,json,hashlib,html
from pygments import highlight
from pygments.lexers import get_lexer_by_name
from pygments.formatters import HtmlFormatter
P=Path(__file__).resolve().parent
title_map=json.loads((P/'section-titles.json').read_text())
course=json.loads((P/'course.json').read_text());md=MarkdownIt('commonmark',{'html':False}).enable('table')
hashes={str(f.relative_to(P)):hashlib.sha256(f.read_bytes()).hexdigest() for f in (P/'manuscripts').glob('*.md')}
for guide_name in ['book4-guide.md','book5-guide.md']:
 if (P/guide_name).exists():hashes[guide_name]=hashlib.sha256((P/guide_name).read_bytes()).hexdigest()
assert hashes==json.loads((P/'audit/manuscript-hashes.json').read_text()),'A-stage source has changed; review and freeze it first'
assert (P/'all-manuscripts.md').exists() and (P/'audit/A-freeze.json').exists()
def color_code(match):
 lang=match[1];text=html.unescape(match[2])
 lexer=get_lexer_by_name({'asm':'gas','asm64':'gas','c':'c','sh':'bash'}[lang],stripnl=False,ensurenl=False)
 colored=highlight(text,lexer,HtmlFormatter(nowrap=True,classprefix='tok-'))
 return f'<pre><code class="language-{lang}">{colored}</code></pre>'
def color_blocks(rendered):
 return re.sub(r'<pre><code class="language-(c|asm|asm64|sh)">(.*?)</code></pre>',color_code,rendered,flags=re.S)
parts=[];nav=[];subsections=0;book4_articles=[];book4_nav=[];book5_articles=[]
for c in course:
 n=c['number'];chapter=f'第{n}章 {c["title"]}';cid=f'chapter-{n}'
 parts.append(f'<section class="course-chapter" id="{cid}" data-anchor><h1>{html.escape(chapter)}</h1><p class="chapter-lead">{html.escape(c["subtitle"])}</p><p class="chapter-source">课程PPT第{n}章 · {html.escape(c["book"])}</p>')
 nav.append(f'<details class="nav-chapter" open><summary><a href="#{cid}">第{n}章 {html.escape(c["title"])}</a></summary>')
 for name in c['files']:
  src=(P/'manuscripts'/f'{name}.md').read_text();title=src.splitlines()[0][2:];uid='unit-'+name
  rendered=color_blocks(md.render(src)).replace('<p>教材对照：','<p class="textbook-ref">教材对照：');rendered=re.sub(r'<h1>.*?</h1>\n?','',rendered,count=1)
  rendered=rendered.replace('<h3>','<h4>').replace('</h3>','</h4>');i=[0];section_nav=[];prefix=title.split(' ',1)[0]
  previous=[None]
  def sub(m):
   i[0]+=1;sid=f'{uid}-s{i[0]}'
   following=rendered[m.end():]
   ref=re.match(r'\s*<p class="textbook-ref">教材对照：§([^，；<]+)',following)
   if ref:
    code=ref[1]
    official=title_map['textbook_titles'].get(code)
    if not official:official='综合练习' if '练习' in m[1] else '本节小结'
    if '练习' in m[1]:official+=' · 综合练习'
   else:
    code=title_map['section_order'][name][i[0]-1]
    official=title_map['textbook_titles'].get(code) or title_map['ppt_titles'][code]
   book_number=code if re.fullmatch(r'\d+\.\d+(?:\.\d+)?',code) else None
   formal=(book_number+' ' if book_number else '')+official
   source_ppt=re.search(r'课程第([一二三四五六七八九十]+)章PPT',following.split('</p>',1)[0])
   source_number={'一':1,'二':2,'三':3,'四':4,'五':5}.get(source_ppt[1],n) if source_ppt else n
   source_note='PPT未涉及' if 'PPT未涉及' in following.split('</p>',1)[0] else f'PPT 第{source_number}章'
   source=f'（教材 {code}；{source_note}）' if book_number else f'（PPT 第{n}章）'
   label=f'<span class="heading-source">{source}</span>'
   # Consecutive explanations of one textbook section share one formal heading.
   if code==previous[0]:return f'<p id="{sid}" data-anchor class="section-lead">{m[1]}</p>'
   previous[0]=code
   section_nav.append(f'<a class="minor" href="#{sid}">{html.escape(formal)}</a>')
   section_lead=m[1].split('——',1)[-1] if name in ['04-symbols','04-archives','04-relocation','04-dynamic','05-execution'] else m[1]
   return f'<h3 id="{sid}" data-anchor>{html.escape(formal)}{label}</h3><p class="section-lead">{section_lead}</p>'
  rendered=re.sub(r'<h2>(.*?)</h2>',sub,rendered);subsections+=i[0]
  def short_ref(m):
   text=html.unescape(re.sub(r'<[^>]+>','',m[1]))
   paper=re.search(r'纸书第([^；。]+?)页',text)
   ppt=re.search(r'课程第([一二三四五六七八九十]+)章PPT第([^。]+?)页',text)
   requirement=re.search(r'要求：(.+)',text)
   status=requirement[1].rstrip('。') if requirement else '需掌握'
   # Keep exceptions to coverage, omit repeated explanations of the same status.
   status=re.sub(r'（PPT已涉及）','',status)
   if '例4.6' in status:status='传参需掌握；例4.6完整 AVX 展开无需掌握'
   fields=[]
   if paper:fields.append('纸书 '+paper[1]+' 页')
   if ppt:fields.append('PPT 第'+str({'一':1,'二':2,'三':3,'四':4,'五':5}.get(ppt[1],n))+'章 '+ppt[2]+' 页')
   elif 'PPT未涉及' in text:fields.append('PPT未涉及')
   fields.append(status)
   return '<p class="textbook-ref">'+html.escape(' · '.join(fields))+'</p>'
  rendered=re.sub(r'<p class="textbook-ref">(.*?)</p>',short_ref,rendered,flags=re.S)
  # Keep old external subsection links valid after the textbook reordering.
  aliases={'04-archives':{'unit-04-archives-s2':'unit-04-archives-s1'},'04-relocation':{'unit-04-relocation-s3':'unit-04-relocation-s2'},'05-execution':{'unit-05-execution-s5':'unit-05-execution-s4','unit-05-execution-s6':'unit-05-execution-s4'}}
  for old,target in aliases.get(name,{}).items():
   rendered=rendered.replace(f'<h3 id="{target}"',f'<span id="{old}" class="legacy-anchor"></span><h3 id="{target}"',1)
  formal_title=title_map['unit_titles'][name]
  unit_number=title.split(' ',1)[0]
  lead=title.split('——',1)[1] if '——' in title else ''
  article_html=f'<article id="{uid}" data-source="manuscripts/{name}.md" data-anchor><h2>{unit_number} {html.escape(formal_title)}</h2><p class="unit-lead">{html.escape(lead)}</p>{rendered}</article>'
  parts.append(article_html)
  if name in ['04-symbols','04-archives','04-relocation','04-dynamic','05-execution']:book5_articles.append(article_html)
  if name in ['03-function-call','03-control-flow','03-objects']:
   book4_articles.append(article_html);book4_nav.append(f'<a class="major" href="#{uid}">{unit_number} {html.escape(formal_title)}</a>')
  nav.append(f'<a class="major" href="#{uid}">{unit_number} {html.escape(formal_title)}</a>');nav.extend(section_nav)
 nav.append('</details>');parts.append('</section>')
version=hashlib.sha256(json.dumps(hashes,sort_keys=True).encode()).hexdigest()[:16]
result=(P/'template.html').read_text().replace('{{NAV}}','\n'.join(nav)).replace('{{BODY}}','\n'.join(parts)).replace('{{HASH}}',version)
(P/'index.html').write_text(result)
(P/'verification/build-result.json').write_text(json.dumps({'chapters':[c['number'] for c in course],'source_files':len(hashes),'subsections':subsections,'source_version':version},indent=2))
print('Built',sum(len(c['files']) for c in course),'frozen manuscripts and',len(hashes)-sum(len(c['files']) for c in course),'guide, version',version)

# The textbook route reuses exactly the same rendered article bodies.
if (P/'book4-guide.md').exists():
 guide=color_blocks(md.render((P/'book4-guide.md').read_text()))
 guide=re.sub(r'<h1>(.*?)——(.*?)</h1>',r'<h1>\1</h1><p class="chapter-lead">\2</p>',guide)
 template=(P/'template.html').read_text()
 template=re.sub(r'<section id="start" data-anchor>.*?</section>', '<section id="start" data-anchor>'+guide+'</section>', template, count=1,flags=re.S)
 template=template.replace('<title>ICS 教材式自学讲义 V4 · 第二至第五章</title>','<title>教材第四章 · ICS 跟读讲义</title>')
 template=template.replace('ics-textbook-v4/all-manuscripts.md','ics-textbook-v4/book4-manuscript.md')
 template=template.replace('ics-textbook-v4/audit/text-review.md','ics-textbook-v4/audit/book4-followalong-review.md').replace('ics-textbook-v4/audit/exercise-reverse-map.md','ics-textbook-v4/book4-guide.md')
 booklinks=re.findall(r'\|\[(4\.\d\.\d+ [^\]]+)\]\((#[^)]+)\)\|([^|]+)\|',(P/'book4-guide.md').read_text())
 bnav='<a href="#start">教材第四章跟读目录与作业</a>'+''.join(f'<a href="{href}">{html.escape(label)} · 纸书{html.escape(pages)}页</a>' for label,href,pages in booklinks)+'<a href="index.html#chapter-3">完整讲义与先修回查</a>'
 result=template.replace('{{NAV}}',bnav).replace('{{BODY}}',''.join(book4_articles)).replace('{{HASH}}',version)
 (P/'book4.html').write_text(result)

if (P/'book5-guide.md').exists():
 guide=color_blocks(md.render((P/'book5-guide.md').read_text()))
 guide=re.sub(r'<h1>(.*?)——(.*?)</h1>',r'<h1>\1</h1><p class="chapter-lead">\2</p>',guide)
 template=(P/'template.html').read_text()
 template=re.sub(r'<section id="start" data-anchor>.*?</section>', '<section id="start" data-anchor>'+guide+'</section>', template, count=1,flags=re.S)
 template=template.replace('<title>ICS 教材式自学讲义 V4 · 第二至第五章</title>','<title>教材第五章 · ICS 跟读讲义</title>')
 template=template.replace('ics-textbook-v4/all-manuscripts.md','ics-textbook-v4/book5-manuscript.md')
 template=template.replace('ics-textbook-v4/audit/text-review.md','ics-textbook-v4/audit/book5-followalong-review.md').replace('ics-textbook-v4/audit/exercise-reverse-map.md','ics-textbook-v4/book5-guide.md')
 booklinks=re.findall(r'\|\[(5\.\d\.\d+ [^\]]+)\]\((#[^)]+)\)\|([^|]+)\|',(P/'book5-guide.md').read_text())
 bnav='<a href="#start">教材第五章跟读目录与习题</a>'+''.join(f'<a href="{href}">{html.escape(label)} · 纸书{html.escape(pages)}页</a>' for label,href,pages in booklinks)+'<a href="index.html#chapter-4">完整讲义与课程目录</a>'
 result=template.replace('{{NAV}}',bnav).replace('{{BODY}}',''.join(book5_articles)).replace('{{HASH}}',version)
 (P/'book5.html').write_text(result)
