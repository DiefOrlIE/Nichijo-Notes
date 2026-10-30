from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
import argparse
arg=argparse.ArgumentParser();arg.add_argument('--font-dir',required=True);args=arg.parse_args()
p=Path(__file__).resolve().parents[1]
text=''.join(f.read_text() for f in (p/'manuscripts').glob('*.md'))+''.join((p/f).read_text() for f in ['template.html','reader.js','course.json','terms.json'])
chars=set(map(ord,text))|set(range(32,127))
for weight in ['regular','bold']:
 font=TTFont(Path(args.font_dir)/(weight+'.otf'));missing={x for x in chars-set(font.getBestCmap()) if 0x3400<=x<=0x9fff};assert not missing,missing
 o=subset.Options();o.flavor='woff2';sub=subset.Subsetter(options=o);sub.populate(unicodes=chars);sub.subset(font);font.flavor='woff2';font.save(p/'fonts'/(weight+'.woff2'))
print('新正文、课程目录、术语的中文常规/粗体字形覆盖核对通过')
