from pathlib import Path
import hashlib,json,re,fitz
from bs4 import BeautifulSoup
P=Path(__file__).resolve().parents[1]
source=json.loads((P/'audit/original-homework-sources.json').read_text());book=BeautifulSoup((P/'book4.html').read_text(),'html.parser')
for record in source['questions']:
 text=(P/record['source']).read_text();intro=text.split('\n## 提示1：',1)[0]
 assert '题意：' not in intro
 original=intro[intro.index('\n\n',intro.index('> 教材原题'))+2:].strip()
 assert hashlib.sha256(original.encode()).hexdigest()==record['original_question_markdown_sha256'],record['source']
 key=Path(record['source']).stem;card=book.find(id='homework-'+key);assert card and '教材原题' in card.text
 # Source tasks stay outside all hints and are visible without opening anything.
 for p in card.find_all('p',recursive=False):assert not p.find_parent('details')
 assert len(card.select('[data-homework-step]'))==3
q4=book.find(id='homework-book4-q4');assert 'int v = ________________;' in q4.select_one('code.language-c-template').text
assert '（1）写出每条汇编指令的注释' in q4.text and '（2）给出函数operate()对应' in q4.text
q5=book.find(id='homework-book4-q5');assert 'void product(num_type *d, unsigned x, num_type y)' in q5.select_one('code.language-c-template').text
q11=book.find(id='homework-book4-q11');assert q11.select_one('code.language-c-template').text.strip()=='*p = a;\nreturn b*c;'
image=book.find(id='homework-book4-q7').img;assert image['src']==source['figure']['path'];assert image['width']=='890' and image['height']=='634'
asset=P/image['src'];assert hashlib.sha256(asset.read_bytes()).hexdigest()==source['figure']['sha256']
import argparse
args=argparse.ArgumentParser();args.add_argument('--textbook-pdf',type=Path,default=P.parents[1]/'project_sources/01-x86-Linux-z-library.sk-1lib.sk-z-lib.sk-.pdf');options=args.parse_args()
pdf=fitz.open(options.textbook_pdf)
pix=pdf[source['figure']['pdf_page']-1].get_pixmap(matrix=fitz.Matrix(2,2),clip=fitz.Rect(source['figure']['clip_points']),alpha=False)
assert pix.tobytes('png')==asset.read_bytes()
for f in ['all-manuscripts.md','book4-manuscript.md']:
 text=(P/f).read_text();assert '](assets/homework/book4-figure-4-29.png)' in text and '](../assets/homework/' not in text
report={'original_questions':9,'original_tasks_and_code_preserved':True,'question_4_blanks_preserved':True,'question_7_original_figure_byte_match':True,'reserved_image_dimensions':[890,634],'originals_visible_before_hints':True,'progressive_hints_retained':27,'combined_markdown_image_paths_valid':True}
(P/'verification/original-questions-checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False))
