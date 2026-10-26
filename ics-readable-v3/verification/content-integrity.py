from pathlib import Path
from bs4 import BeautifulSoup
from markdown_it import MarkdownIt
import re
p=Path(__file__).resolve().parents[1]
soup=BeautifulSoup((p/'index.html').read_text(),'html.parser')
md=MarkdownIt('commonmark',{'html':False}).enable('table')
normalize=lambda x:re.sub(r'\s+','',x)
for a in soup.find_all('article'):
 f=next((p/'manuscripts').glob(a['id'].replace('unit-','')+'-*.md'))
 expected=BeautifulSoup(md.render(f.read_text()),'html.parser').get_text()
 assert normalize(expected)==normalize(a.get_text()),f
ids=[x['id'] for x in soup.find_all(id=True)]
assert len(ids)==len(set(ids))
for a in soup.select('nav a[href^="#"]'):assert a['href'][1:] in ids
print('11份Markdown与网页逐单元文本一致，目录锚点无缺失、无重复')
