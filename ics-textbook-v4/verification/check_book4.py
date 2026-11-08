from pathlib import Path
from bs4 import BeautifulSoup
from fontTools.ttLib import TTFont
import json,re
P=Path(__file__).resolve().parents[1]
main=BeautifulSoup((P/'index.html').read_text(),'html.parser');book=BeautifulSoup((P/'book4.html').read_text(),'html.parser')
assert len(book.select('article'))==3
for article in book.select('article'):assert str(article)==str(main.find(id=article['id']))
links=book.select('nav a[href^="#unit-"]');assert len(links)==16
for a in book.select('a[href^="#"]'):assert book.find(id=a['href'][1:]),a
refs=book.select('article .textbook-ref');assert len(refs)==42
for heading in book.select('article h3'):
 paragraph=heading.find_next_sibling('p',class_='textbook-ref');assert paragraph,heading
assert len(book.select('#start table'))==2
chars=set(ord(c) for c in (P/'book4-guide.md').read_text()+''.join(f.read_text() for f in (P/'manuscripts').glob('*.md')))
for weight in ['regular','bold']:
 missing={c for c in chars if 0x3400<=c<=0x9fff}-set(TTFont(P/'fonts'/(weight+'.woff2')).getBestCmap());assert not missing,missing
for f in (P/'manuscripts').glob('03-*.md'):assert not re.search(r'不是.{0,100}而是',f.read_text())
report={'book_sections':16,'annotated_teaching_headings':42,'same_article_bodies_as_main':True,'printed_page_source':'https://www.cmpedu.com/books/book/5607911.htm','assignments':[2,4,5,7,11],'guide_tables':2,'font_coverage':True,'md_first_review':'audit/book4-followalong-review.md'}
(P/'verification/book4-checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False))
