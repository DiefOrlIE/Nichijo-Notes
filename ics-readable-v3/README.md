# ICS 第二、三、五章 · 连续自学讲义

[在线阅读](https://dieforlie.github.io/Nichijo-Notes/ics-readable-v3/) · [独立文字合订稿](all-manuscripts.md)

按先文字后网页的流程重写。默认读者具备基础程序设计知识，未看过教材或课件。正文11个单元，按依赖顺序展示83个章节目次，包含课程第五章指令执行、进程与线程。主线完全展开；明确标记的练习解答可折叠。

唯一教学稿源在manuscripts/，页面从它构建，没有另一套手写HTML正文。

构建：安装Python依赖markdown-it-py，然后运行 `python build.py`。构建脚本核对A阶段哈希再生成页面与Markdown合订稿。字体为本地Noto Serif CJK SC裁剪常规与粗体，许可见fonts/LICENSE.txt。

核验：`python verification/check_numbers.py`；C示例使用C11编译；两组汇编分别用GNU as --32和--64。浏览器检查见verification/browser-report.md。

[文字内容审查](audit/content-verification.md) · [原稿诊断](audit/revision-audit.md) · [PPT来源定位](audit/source-map.md)

没有真实初学者试读、延迟迁移测试和iOS真机测试。计算与自动检查支持的是指定测试结论，不保证所有读者无需反馈便能掌握。

旧版ics-ch2-ch3保留原内容和原阅读记忆，新版独立使用本地状态键。
