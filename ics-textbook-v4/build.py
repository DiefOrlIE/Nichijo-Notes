"""Render only frozen prose. Run the A-stage checks and freeze before this script."""
from pathlib import Path
from markdown_it import MarkdownIt
import re,json,hashlib,html
P=Path(__file__).resolve().parent
course=json.loads((P/'course.json').read_text());md=MarkdownIt('commonmark',{'html':False}).enable('table')
hashes={str(f.relative_to(P)):hashlib.sha256(f.read_bytes()).hexdigest() for f in (P/'manuscripts').glob('*.md')}
assert hashes==json.loads((P/'audit/manuscript-hashes.json').read_text()),'A-stage source has changed; review and freeze it first'
assert (P/'all-manuscripts.md').exists() and (P/'audit/A-freeze.json').exists()
parts=[];nav=[];subsections=0
for c in course:
 n=c['number'];chapter=f'第{n}章 {c["title"]}——{c["subtitle"]}';cid=f'chapter-{n}'
 parts.append(f'<section class="course-chapter" id="{cid}" data-anchor><h1>{html.escape(chapter)}</h1><p class="chapter-source">课程PPT第{n}章 · {html.escape(c["book"])}</p>')
 nav.append(f'<details class="nav-chapter" open><summary><a href="#{cid}">第{n}章 {html.escape(c["title"])}</a></summary>')
 for name in c['files']:
  src=(P/'manuscripts'/f'{name}.md').read_text();title=src.splitlines()[0][2:];uid='unit-'+name
  rendered=md.render(src);rendered=re.sub(r'<h1>.*?</h1>\n?','',rendered,count=1)
  rendered=rendered.replace('<h3>','<h4>').replace('</h3>','</h4>');i=[0];prefix=title.split(' ',1)[0]
  def sub(m):
   i[0]+=1;sid=f'{uid}-s{i[0]}'
   return f'<h3 id="{sid}" data-anchor>{prefix}.{i[0]} {m[1]}</h3>'
  rendered=re.sub(r'<h2>(.*?)</h2>',sub,rendered);subsections+=i[0]
  parts.append(f'<article id="{uid}" data-source="manuscripts/{name}.md" data-anchor><h2>{html.escape(title)}</h2>{rendered}</article>')
  nav.append(f'<a class="major" href="#{uid}">{html.escape(title)}</a>')
 nav.append('</details>');parts.append('</section>')
version=hashlib.sha256(json.dumps(hashes,sort_keys=True).encode()).hexdigest()[:16]
result=(P/'template.html').read_text().replace('{{NAV}}','\n'.join(nav)).replace('{{BODY}}','\n'.join(parts)).replace('{{HASH}}',version)
(P/'index.html').write_text(result)
(P/'verification/build-result.json').write_text(json.dumps({'chapters':[c['number'] for c in course],'source_files':len(hashes),'subsections':subsections,'source_version':version},indent=2))
print('Built',len(hashes),'frozen manuscripts, version',version)
