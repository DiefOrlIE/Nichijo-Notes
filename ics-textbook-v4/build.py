"""Render only frozen prose. Run the A-stage checks and freeze before this script."""
from pathlib import Path
from markdown_it import MarkdownIt
import re,json,hashlib,html
from pygments import highlight
from pygments.lexers import get_lexer_by_name
from pygments.formatters import HtmlFormatter
P=Path(__file__).resolve().parent
course=json.loads((P/'course.json').read_text());md=MarkdownIt('commonmark',{'html':False}).enable('table')
hashes={str(f.relative_to(P)):hashlib.sha256(f.read_bytes()).hexdigest() for f in (P/'manuscripts').glob('*.md')}
if (P/'book4-guide.md').exists():hashes['book4-guide.md']=hashlib.sha256((P/'book4-guide.md').read_bytes()).hexdigest()
assert hashes==json.loads((P/'audit/manuscript-hashes.json').read_text()),'A-stage source has changed; review and freeze it first'
assert (P/'all-manuscripts.md').exists() and (P/'audit/A-freeze.json').exists()
def color_code(match):
 lang=match[1];text=html.unescape(match[2])
 lexer=get_lexer_by_name({'asm':'gas','asm64':'gas','c':'c','sh':'bash'}[lang],stripnl=False,ensurenl=False)
 colored=highlight(text,lexer,HtmlFormatter(nowrap=True,classprefix='tok-'))
 return f'<pre><code class="language-{lang}">{colored}</code></pre>'
def color_blocks(rendered):
 return re.sub(r'<pre><code class="language-(c|asm|asm64|sh)">(.*?)</code></pre>',color_code,rendered,flags=re.S)
parts=[];nav=[];subsections=0;book4_articles=[];book4_nav=[]
for c in course:
 n=c['number'];chapter=f'第{n}章 {c["title"]}——{c["subtitle"]}';cid=f'chapter-{n}'
 parts.append(f'<section class="course-chapter" id="{cid}" data-anchor><h1>{html.escape(chapter)}</h1><p class="chapter-source">课程PPT第{n}章 · {html.escape(c["book"])}</p>')
 nav.append(f'<details class="nav-chapter" open><summary><a href="#{cid}">第{n}章 {html.escape(c["title"])}</a></summary>')
 for name in c['files']:
  src=(P/'manuscripts'/f'{name}.md').read_text();title=src.splitlines()[0][2:];uid='unit-'+name
  rendered=color_blocks(md.render(src)).replace('<p>教材对照：','<p class="textbook-ref">教材对照：');rendered=re.sub(r'<h1>.*?</h1>\n?','',rendered,count=1)
  rendered=rendered.replace('<h3>','<h4>').replace('</h3>','</h4>');i=[0];section_nav=[];prefix=title.split(' ',1)[0]
  def sub(m):
   i[0]+=1;sid=f'{uid}-s{i[0]}'
   section_nav.append(f'<a class="minor" href="#{sid}">{prefix}.{i[0]} {m[1]}</a>')
   return f'<h3 id="{sid}" data-anchor>{prefix}.{i[0]} {m[1]}</h3>'
  rendered=re.sub(r'<h2>(.*?)</h2>',sub,rendered);subsections+=i[0]
  article_html=f'<article id="{uid}" data-source="manuscripts/{name}.md" data-anchor><h2>{html.escape(title)}</h2>{rendered}</article>'
  parts.append(article_html)
  if name in ['03-function-call','03-control-flow','03-objects']:
   book4_articles.append(article_html);book4_nav.append(f'<a class="major" href="#{uid}">{html.escape(title)}</a>')
  nav.append(f'<a class="major" href="#{uid}">{html.escape(title)}</a>');nav.extend(section_nav)
 nav.append('</details>');parts.append('</section>')
version=hashlib.sha256(json.dumps(hashes,sort_keys=True).encode()).hexdigest()[:16]
result=(P/'template.html').read_text().replace('{{NAV}}','\n'.join(nav)).replace('{{BODY}}','\n'.join(parts)).replace('{{HASH}}',version)
(P/'index.html').write_text(result)
(P/'verification/build-result.json').write_text(json.dumps({'chapters':[c['number'] for c in course],'source_files':len(hashes),'subsections':subsections,'source_version':version},indent=2))
print('Built',sum(len(c['files']) for c in course),'frozen manuscripts and',len(hashes)-sum(len(c['files']) for c in course),'guide, version',version)

# The textbook route reuses exactly the same rendered article bodies.
if (P/'book4-guide.md').exists():
 guide=color_blocks(md.render((P/'book4-guide.md').read_text()))
 template=(P/'template.html').read_text()
 template=re.sub(r'<section id="start" data-anchor>.*?</section>', '<section id="start" data-anchor>'+guide+'</section>', template, count=1,flags=re.S)
 template=template.replace('<title>ICS 教材式自学讲义 V4 · 第二至第五章</title>','<title>教材第四章 · ICS 跟读讲义</title>')
 template=template.replace('ics-textbook-v4/all-manuscripts.md','ics-textbook-v4/book4-manuscript.md')
 template=template.replace('ics-textbook-v4/audit/text-review.md','ics-textbook-v4/audit/book4-followalong-review.md').replace('ics-textbook-v4/audit/exercise-reverse-map.md','ics-textbook-v4/book4-guide.md')
 booklinks=re.findall(r'\|\[(4\.\d\.\d+ [^\]]+)\]\((#[^)]+)\)\|([^|]+)\|',(P/'book4-guide.md').read_text())
 bnav='<a href="#start">教材第四章跟读目录与作业</a>'+''.join(f'<a href="{href}">{html.escape(label)} · 纸书{html.escape(pages)}页</a>' for label,href,pages in booklinks)+'<a href="index.html#chapter-3">完整讲义与先修回查</a>'
 result=template.replace('{{NAV}}',bnav).replace('{{BODY}}',''.join(book4_articles)).replace('{{HASH}}',version)
 (P/'book4.html').write_text(result)
