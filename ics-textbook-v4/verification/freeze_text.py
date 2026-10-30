# Recreate the independent combined Markdown after prose review; does not render HTML.
# This script does not certify teaching quality. Run and review A-stage checks first.
from pathlib import Path
import json,hashlib,re
p=Path(__file__).resolve().parents[1];a=p/'audit';a.mkdir(exist_ok=True)
chapters=[(2,'数据的机器级表示与处理','让每一种位串都有解释','教材第二章2.1–2.6',['02-representation','02-integers','02-arithmetic','02-floating','02-text','02-circuits']),(3,'程序的转换与机器级表示','从C走到可追踪的机器状态','教材第三章3.1–3.3、第四章4.1–4.4',['03-instructions','03-operations','03-function-call','03-control-flow','03-objects','03-platforms']),(4,'程序的链接','让分开的模块合成一次运行','教材第五章5.1–5.5；5.6仅选读',['04-symbols','04-archives','04-relocation','04-dynamic']),(5,'程序的执行','让指令与任务持续推进','教材第五章5.7；第五章简化版课件',['05-execution','05-processes'])]
course=[dict(number=n,title=t,subtitle=sub,book=b,files=fs) for n,t,sub,b,fs in chapters]
(p/'course.json').write_text(json.dumps(course,ensure_ascii=False,indent=2))
combined=['# ICS教材式自学讲义 V4\n\n范围：课程PPT第二至第五章，保留原课程编号，所以从2开始，第三章之后含第四章与第五章。先修只要求C变量、数组、条件、循环和简单函数；指针、汇编和系统概念在正文建立。按顺序初学，先独立完成习题，再看提示和答案。\n\n本稿以2026-10-30文字审读与指定核验记录为依据；未经真实初学者试读。\n\n## 总目录\n']
for c in course:
 combined.append(f'第{c["number"]}章 {c["title"]}——{c["subtitle"]}\n')
 for name in c['files']:combined.append('- '+(p/'manuscripts'/f'{name}.md').read_text().splitlines()[0][2:])
for c in course:
 combined.append(f'\n# 第{c["number"]}章 {c["title"]}——{c["subtitle"]}\n\n对应{c["book"]}。\n')
 for name in c['files']:
  s=(p/'manuscripts'/f'{name}.md').read_text();s=re.sub(r'^(#{1,5}) ',r'#\1 ',s,flags=re.M);combined.append(s)
(p/'all-manuscripts.md').write_text('\n\n'.join(combined))

assert (a/'text-review.md').exists(), 'A prose review record is required'
hashes={str(f.relative_to(p)):hashlib.sha256(f.read_bytes()).hexdigest() for f in (p/'manuscripts').glob('*.md')}
(a/'manuscript-hashes.json').write_text(json.dumps(hashes,indent=2))
print('Combined Markdown and source hashes saved; this is not a student learning test.')
