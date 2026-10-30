from pathlib import Path
from bs4 import BeautifulSoup
from markdown_it import MarkdownIt
import re,json,hashlib
P=Path(__file__).resolve().parents[1];soup=BeautifulSoup((P/'index.html').read_text(),'html.parser');md=MarkdownIt('commonmark',{'html':False}).enable('table')
ids=[x['id'] for x in soup.select('[id]')];assert len(ids)==len(set(ids))
assert len(soup.select('article'))==18
assert [x['id'] for x in soup.select('.course-chapter')]==['chapter-2','chapter-3','chapter-4','chapter-5']
checks=[]
for article in soup.select('article'):
 f=P/article['data-source'];source=BeautifulSoup(md.render(f.read_text()),'html.parser')
 assert article.h2.text==source.h1.text
 for selector in ['p','pre','td','th','li']:
  assert [x.get_text() for x in source.select(selector)]==[x.get_text() for x in article.select(selector)],(f.name,selector)
 assert not source.select('em'),f.name+' has unintentional emphasis'
 hs=[re.sub(r'^\d+\.\d+\.\d+ ','',x.text) for x in article.select('h3')]
 assert hs==[x.text for x in source.select('h2')]
 checks.append(f.name)
for a in soup.select('a[href^="#"]'):assert a['href'][1:] in ids,a
for a in soup.select('a[href]'):
 href=a['href']
 if '#' in href or ':' in href or href=='../' or href.startswith('../ics-'):continue
 assert (P/href).exists(),href
hashes=json.loads((P/'audit/manuscript-hashes.json').read_text())
assert all(hashlib.sha256((P/k).read_bytes()).hexdigest()==v for k,v in hashes.items())
result={'manuscripts_compared':checks,'unique_anchors':len(ids),'paragraph_code_table_list_match':True,'chapter_numbers':[2,3,4,5],'accidental_emphasis':False}
(P/'verification/integrity-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False))
