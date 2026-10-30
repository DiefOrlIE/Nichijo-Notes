# ICS 教材式自学讲义 V4

课程范围：PPT第二、三、四、五章。原课程编号保留，包含第四章，未将第一章伪装成缺失的内容。完整正文见[all-manuscripts.md](all-manuscripts.md)，分篇稿在manuscripts/。已授权在全文文字完成与核验后连续生成网页并发布GitHub，无需逐章确认。

写作标准为[audit/V4-requirements.md](audit/V4-requirements.md)。基础正文和完整示范默认展开，练习提示与解答可单独展开。网页正文只从冻结Markdown生成；内容问题先修Markdown，再重新审查、冻结和构建。

核验：`python3 verification/verify_content.py`、`python3 verification/verify_functions.py`、`python3 verification/check_linking.py`。构建：`python3 build.py`。重新生成字体：`python3 verification/subset_fonts.py --font-dir /path/to/original-fonts`。字体许可证见fonts/LICENSE.txt。

文字审读、源材料、练习反查、数值与代码证据分别保存在audit/。网页和发布验证另见verification/release-report.md。没有真实初学者试读证据，不以测试通过宣称所有读者已经能独立掌握。
