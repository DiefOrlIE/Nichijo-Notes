from pathlib import Path
from bs4 import BeautifulSoup
from markdown_it import MarkdownIt
import json,hashlib
P=Path(__file__).resolve().parents[1];soup=BeautifulSoup((P/'index.html').read_text(),'html.parser');md=MarkdownIt('commonmark',{'html':False}).enable('table')
ids=[x['id'] for x in soup.select('[id]')];assert len(ids)==len(set(ids))
assert len(soup.select('article'))==18
assert [x['id'] for x in soup.select('.course-chapter')]==['chapter-2','chapter-3','chapter-4','chapter-5']
checks=[]
for article in soup.select('article'):
 article=BeautifulSoup(str(article),'html.parser').article
 for extra in article.select('[data-homework]'):extra.decompose()
 f=P/article['data-source'];source=BeautifulSoup(md.render(f.read_text()),'html.parser')
 for a in source.select('a[href^="../homework/"]'):a.parent.decompose()
 assert [x.text for x in article.select('.section-lead')]==[(x.text.split('——',1)[-1] if f.stem in ['04-symbols','04-archives','04-relocation','04-dynamic','05-execution'] else x.text) for x in source.select('h2')],f.name
 for selector in ['pre','td','th','li']:
  assert [x.get_text() for x in source.select(selector)]==[x.get_text() for x in article.select(selector)],(f.name,selector)
 original=[x.get_text() for x in source.select('p') if not x.text.startswith('教材对照：')]
 rendered=[x.get_text() for x in article.select('p') if not set(x.get('class',[]))&{'textbook-ref','section-lead','unit-lead'}]
 assert original==rendered,(f.name,'body paragraphs')
 assert not source.select('em'),f.name+' has unintentional emphasis'
 checks.append(f.name)
for a in soup.select('a[href^="#"]'):assert a['href'][1:] in ids,a
hashes=json.loads((P/'audit/manuscript-hashes.json').read_text())
assert all(hashlib.sha256((P/k).read_bytes()).hexdigest()==v for k,v in hashes.items())
result={'manuscripts_compared':checks,'unique_anchors':len(ids),'paragraph_code_table_list_match':True,'all_source_section_leads_preserved':True,'chapter_numbers':[2,3,4,5],'accidental_emphasis':False}
(P/'verification/integrity-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False))
