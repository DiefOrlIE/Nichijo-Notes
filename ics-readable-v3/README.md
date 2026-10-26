# ICS 第二至第五章 · 连续自学讲义

[在线阅读](https://dieforlie.github.io/Nichijo-Notes/ics-readable-v3/) · [完整文字稿](all-manuscripts.md)

课程章号统一采用PPT：第二章数据的机器级表示与处理，第三章程序的转换与机器级表示，第四章程序的链接，第五章程序的执行。页面采用课程章、小节、知识主题三级目录，内部文件编号不再展示。课程与教材章号的对应关系在各章开头说明。

以manuscripts/为教学单一稿源，course.json仅规定范围、顺序、标题。先修改和审查文字稿，更新audit/manuscript-hashes.json，再运行`python build.py`构建页面与合订稿；Python需markdown-it-py。

[本轮文字审查](audit/revision-round2.md) · [教材练习索引](audit/textbook-exercises.md) · [课件来源索引](audit/source-map.md) · [页面检查记录](verification/browser-report.md)

新增第四章的编译与重定位核验：`python verification/check_linking.py`。原数据表示核验：`python verification/check_numbers.py`。页面内容比对：`python verification/content-integrity.py`，需beautifulsoup4。DOM模拟需安装jsdom并配置dom-test.cjs依赖路径。

字体为合法本地Noto Serif CJK SC常规与粗体，许可见fonts/LICENSE.txt。生成脚本verification/subset_fonts.py需要fonttools与brotli，并接收官方原字体路径。

旧四档版本仍在ics-ch2-ch3，旧连续版锚点保留，新练习答案采用文本标识保存状态，避免新增题目让旧答案状态错位。尚无真实初学者试读和iOS真机测试，指定示例与自动检查不等于所有人均已学会。
