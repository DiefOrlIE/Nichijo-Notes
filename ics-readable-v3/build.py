from pathlib import Path
from markdown_it import MarkdownIt
import re,json,hashlib,html
P=Path(__file__).resolve().parent
order=['01-bits-draft','02-memory','03-integers','09-integer-practice','04-float','05-machine','06-programs','07-execution','08-processes','10-workshop','11-homework']
md=MarkdownIt('commonmark',{'html':False}).enable('table')
parts=[];nav=[];hashes={}
for i,name in enumerate(order):
 f=P/'manuscripts'/f'{name}.md';s=f.read_text();hashes[str(f.relative_to(P))]=hashlib.sha256(f.read_bytes()).hexdigest()
 title=s.splitlines()[0][2:];aid='unit-'+name[:2]
 # Main headings are visible and every source unit remains independently readable.
 body=md.render(s);n=0
 def heading(m):
  global n
  n+=1;hid=f'{aid}-s{n}';nav.append((hid,m[1],False));return f'<h2 id="{hid}" data-anchor>{m[1]}</h2>'
 nav.append((aid,title,True));body=re.sub(r'<h2>(.*?)</h2>',heading,body)
 parts.append(f'<article id="{aid}" data-anchor>'+body+'</article>')
assert hashes==json.loads((P/'audit/manuscript-hashes.json').read_text()),'Source changed after A review'
(P/'all-manuscripts.md').write_text('\n\n---\n\n'.join((P/'manuscripts'/f'{x}.md').read_text() for x in order))
navhtml=''.join(f'<a href="#{a}" class="{"major" if major else "minor"}">{t}</a>' for a,t,major in nav)
template=(P/'template.html').read_text()
result=template.replace('{{NAV}}',navhtml).replace('{{BODY}}','\n'.join(parts)).replace('{{HASH}}',hashlib.sha256(json.dumps(hashes,sort_keys=True).encode()).hexdigest()[:16])
(P/'index.html').write_text(result)
print(json.dumps({'units':len(parts),'headings':len(nav),'characters':sum(len((P/'manuscripts'/f'{x}.md').read_text()) for x in order)},ensure_ascii=False))
