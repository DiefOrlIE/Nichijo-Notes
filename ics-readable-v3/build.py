from pathlib import Path
from markdown_it import MarkdownIt
import re,json,hashlib,html
P=Path(__file__).resolve().parent
course=json.loads((P/'course.json').read_text());md=MarkdownIt('commonmark',{'html':False}).enable('table')
hashes={};parts=[];toc=[];combined=[];sections=0;units=0
for ch in course:
 num=ch['number'];chaptertitle=f'第{num}章 {ch["title"]}';cid=f'chapter-{num}'
 parts.append(f'<section class="course-chapter" id="{cid}" data-anchor><h1>{chaptertitle}</h1><p class="chapter-source">课程PPT第{num}章 · {html.escape(ch["book"])}</p>')
 toc.append(f'<details class="nav-chapter" open><summary><a href="#{cid}">{chaptertitle}</a></summary>')
 combined.append(f'# {chaptertitle}\n\n对应{ch["book"]}。\n')
 for unitnum,name in enumerate(ch['files'],1):
  f=P/'manuscripts'/f'{name}.md';src=f.read_text();hashes[str(f.relative_to(P))]=hashlib.sha256(f.read_bytes()).hexdigest();aid='unit-'+name[:2];rendered=md.render(src)
  title=src.splitlines()[0][2:];plain=re.sub(r'<h1>.*?</h1>\n?','',rendered,count=1)
  if ch.get('sections_as_units'):
   parts.append(f'<article id="{aid}" data-anchor class="chapter-body">');combined.append(re.sub(r'^# .+\n','',src,count=1));i=0
   def head(m):
    global i,sections,units
    i+=1;sections+=1;units+=1;hid=f'{aid}-s{i}';label=f'{num}.{i} {m[1]}';toc.append(f'<a class="major" href="#{hid}">{label}</a>');return f'<h2 id="{hid}" data-anchor>{label}</h2>'
   plain=re.sub(r'<h2>(.*?)</h2>',head,plain);parts.append(plain+'</article>')
  else:
   prefix=f'{num}.{unitnum}';label=f'{prefix} {title}';units+=1;toc.append(f'<details class="nav-unit"><summary><a class="major" href="#{aid}">{label}</a></summary>');i=0
   # Existing h3 exercise labels become h4; original topic h2 becomes numbered h3.
   plain=plain.replace('<h3>','<h4>').replace('</h3>','</h4>')
   def head(m):
    global i,sections
    i+=1;sections+=1;hid=f'{aid}-s{i}';label=f'{prefix}.{i} {m[1]}';toc.append(f'<a class="minor" href="#{hid}">{label}</a>');return f'<h3 id="{hid}" data-anchor>{label}</h3>'
   plain=re.sub(r'<h2>(.*?)</h2>',head,plain)
   alias='<span id="unit-11" class="legacy-anchor"></span>' if name=='05-machine' else ''
   parts.append(f'<article id="{aid}" data-anchor>{alias}<h2>{label}</h2>'+plain+'</article>');toc.append('</details>');combined.append(re.sub(r'^# .+',f'## {label}',src,count=1))
 toc.append('</details>');parts.append('</section>')
assert hashes==json.loads((P/'audit/manuscript-hashes.json').read_text()),'A-stage source hash differs'
(P/'all-manuscripts.md').write_text('\n\n'.join(combined))
result=(P/'template.html').read_text().replace('{{NAV}}','\n'.join(toc)).replace('{{BODY}}','\n'.join(parts)).replace('{{HASH}}',hashlib.sha256(json.dumps(hashes,sort_keys=True).encode()).hexdigest()[:16])
(P/'index.html').write_text(result)
(P/'verification/build-result.json').write_text(json.dumps({'chapters':[c['number'] for c in course],'source_files':len(hashes),'units':units,'subsections':sections},indent=2))
print({'chapters':[c['number'] for c in course],'source_files':len(hashes),'units':units,'subsections':sections})
