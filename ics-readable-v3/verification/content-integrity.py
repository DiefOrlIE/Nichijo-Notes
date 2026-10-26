from pathlib import Path
from bs4 import BeautifulSoup
from markdown_it import MarkdownIt
import re,json
p=Path(__file__).resolve().parents[1];soup=BeautifulSoup((p/'index.html').read_text(),'html.parser');md=MarkdownIt('commonmark',{'html':False}).enable('table');normalize=lambda x:re.sub(r'\s+','',x)
for a in soup.find_all('article'):
 f=next((p/'manuscripts').glob(a['id'].replace('unit-','')+'-*.md'));original=BeautifulSoup(md.render(f.read_text()),'html.parser')
 if a['id']=='unit-12':original.h1.decompose()
 for h in a.find_all(['h1','h2','h3']):
  h.string=re.sub(r'^\d+(?:\.\d+)*\s+','',h.get_text())
 assert normalize(original.get_text())==normalize(a.get_text()),str(f)
ids=[x['id'] for x in soup.find_all(id=True)];assert len(ids)==len(set(ids))
for a in soup.select('nav a[href^="#"]'):assert a['href'][1:] in ids
chapters=BeautifulSoup((p/'index.html').read_text(),'html.parser').select('.course-chapter');assert [x['id'] for x in chapters]==['chapter-2','chapter-3','chapter-4','chapter-5']
for c in chapters:
 expected=[f'{c["id"][-1]}.{i}' for i in range(1,len(c.select('h2'))+1)]
 actual=[re.match(r'\d+\.\d+',x.get_text())[0] for x in c.select('h2')]
 assert actual==expected,(actual,expected)
print('11份Markdown正文文本一致；四章与各章小节编号连续；目录无缺失与重复锚点')
