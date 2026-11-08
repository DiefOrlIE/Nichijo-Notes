from pathlib import Path
from bs4 import BeautifulSoup
from markdown_it import MarkdownIt
from fontTools.ttLib import TTFont
import json,re
P=Path(__file__).resolve().parents[1];md=MarkdownIt('commonmark',{'html':False}).enable('table');result={}
placements=json.loads((P/'audit/book4-homework-map.json').read_text())['placements']
for page,expected in [('book4.html',9),('index.html',9),('book5.html',0)]:
 doc=BeautifulSoup((P/page).read_text(),'html.parser');cards=doc.select('[data-homework]');assert len(cards)==expected
 assert not any(re.search(r'纸书|\d+[–—-]\d+页',a.text) for a in doc.select('nav a[href^="#unit-"]'))
 for item in placements if expected else []:
  card=doc.find(id='homework-'+item['id']);assert card
  # The card appears after its required section and before the next old subsection.
  previous=card.find_previous(attrs={'data-anchor':True});
  while previous and previous.get('id','').startswith('homework-'):previous=previous.find_previous(attrs={'data-anchor':True})
  assert previous['id']==item['after_section'],(item['id'],previous['id'])
  levels=card.select('details[data-homework-step]');assert len(levels)==3
  assert levels[1].parent==levels[0] and levels[2].parent==levels[1]
  assert not any(e.has_attr('open') for e in levels)
  src=BeautifulSoup(md.render((P/item['source']).read_text()),'html.parser')
  assert [e.summary.text for e in levels]==[h.text for h in src.select('h2')]
  for selector in ['p','pre','td','th','li']:assert [x.text for x in src.select(selector)]==[x.text for x in card.select(selector)],(item['id'],selector)
  assert not src.select('em')
 ids=[x['id'] for x in doc.select('[id]')];assert len(ids)==len(set(ids))
 result[page]={'homework_ladders':len(cards),'nested_steps':len(doc.select('details[data-homework-step]')),'toc_without_page_numbers':True}
chars=set(ord(c) for c in BeautifulSoup((P/'book4.html').read_text(),'html.parser').get_text())
for weight in ['regular','bold']:
 missing={c for c in chars if 0x3400<=c<=0x9fff}-set(TTFont(P/'fonts'/(weight+'.woff2')).getBestCmap());assert not missing,missing
result['source_prose_matches']=True;result['correct_placement']=True;result['font_coverage']=True
(P/'verification/homework-checks.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False))
