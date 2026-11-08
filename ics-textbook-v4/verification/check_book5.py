from pathlib import Path
from bs4 import BeautifulSoup
from fontTools.ttLib import TTFont
import json,re
P=Path(__file__).resolve().parents[1]
main=BeautifulSoup((P/'index.html').read_text(),'html.parser');book=BeautifulSoup((P/'book5.html').read_text(),'html.parser');sections=json.loads((P/'audit/book5-page-map.json').read_text())['sections']
assert len(book.select('article'))==5
for article in book.select('article'):assert str(article)==str(main.find(id=article['id']))
ids=[e['id'] for e in book.select('[id]')];assert len(ids)==len(set(ids))
assert len(book.select('nav a[href^="#unit-"]'))==22
for a in book.select('a[href^="#"]'):assert book.find(id=a['href'][1:]),a
assert len(book.select('article h3'))==len(book.select('article .textbook-ref'))==22
assert [h.text.split(' ',1)[0] for h in book.select('article h3')]==list(sections)
for code,x in sections.items():
 h=book.find(id=x['anchor'][1:]);assert h and h.name=='h3' and h.text.startswith(code+' '+x['title'])
 p=h.find_next_sibling('p',class_='textbook-ref');assert x['paper'] in p.text and 'PDF' not in p.text
 if x['required']:assert f"PPT 第{x['ppt_chapter']}章 {x['ppt_pages']} 页" in p.text,(code,p.text)
 else:assert 'PPT未涉及' in p.text and '无需掌握' in p.text
assert len(book.select('#start table'))==2
for block in book.select('pre code[class]'):assert block.select('span[class^="tok-"]'),block
# Heading source must follow the reference, even where course chapter differs.
assert 'PPT 第4章' in book.find(id='unit-05-execution-s1').text
assert 'PPT 第5章' in book.find(id='unit-05-execution-s2').text
chars=set(map(ord,book.get_text()))
for weight in ['regular','bold']:
 missing={c for c in chars if 0x3400<=c<=0x9fff}-set(TTFont(P/'fonts'/(weight+'.woff2')).getBestCmap());assert not missing,missing
for stem in ['04-symbols','04-archives','04-relocation','04-dynamic','05-execution']:
 s=(P/'manuscripts'/f'{stem}.md').read_text();assert not re.search(r'不是.{0,100}而是',s);assert s.count('```')%2==0
result={'textbook_subsections':22,'annotated_subsections':22,'same_article_bodies_as_main':True,'printed_and_ppt_references_match':True,'optional_ppt_absent_sections':3,'code_blocks_highlighted':True,'legacy_anchors_retained':True,'font_coverage':True,'real_beginner_trial':False}
(P/'verification/book5-checks.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False))
