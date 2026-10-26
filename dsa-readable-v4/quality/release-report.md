# V4 数据结构连续自学讲义与闭卷期中复习：交付和验收记录

更新日期：2026-10-26。

## 交付入口

- 完整教学版：https://dieforlie.github.io/Nichijo-Notes/dsa-readable-v4/
- 120 分钟闭卷复习版：https://dieforlie.github.io/Nichijo-Notes/dsa-readable-v4/review.html
- 原连续讲义保留：https://dieforlie.github.io/Nichijo-Notes/dsa-midterm/
- V3 最后一章样稿保留：https://dieforlie.github.io/Nichijo-Notes/dsa-readable-v3/

## 两阶段制作流程

1. **阶段 A / 文字**：先完成 16 份 `chapters/ch00.md`—`ch15.md`，及 6 份 `review/*.md`。每个 Markdown 文件独立保存。阶段 A 的内容核验工具是 `quality/stage_a_check.py`，该工具运行后保存 `quality/stage-a-manifest.json`，含每份文稿的 SHA-256 摘要。
2. **阶段 B / 网页**：`build.mjs` 逐一核对各个 Markdown 文稿与阶段 A 冻结清单里的 SHA-256；不匹配就直接停止构建，不允许通过旧网页碎片绕过文字校验。构建器从同一批已审核 Markdown 生成 `index.html`（完整课程）及 `review.html`（期中专题）。渲染产物通过 `.github/workflows/build-dsa-v4.yml` 自动提交。网页不作为另一份要手工编辑的正文。
3. 旧版 `dsa-midterm`、`dsa-readable-v3` 原路径均保留，V4 使用独立子目录。

## 范围、层次与计数

- 16 章、131 个教学单元；覆盖 C++ 指针前置、绪论和复杂度、线性表、栈、递归、队列、数组与特殊矩阵、串和 KMP、二叉树、线索树和森林、堆、哈夫曼、静态查找、BST、AVL 插删、集合与散列。
- 正文内含 82 道逐章自测（计题目折叠区域）；期中专题另含 68 道专项练习、两套各 12 道大题的 120 分钟闭卷模拟卷，总共 **174 个独立题目区域**。
- 期中专题为“已学过一遍”的读者准备，重在题型、状态模拟、方法选择、边界、代码和错题复盘。教学版面向首次学习读者，按独立问题、具体过程、一般规则、代码与练习展开。
- **范围解释**：根据用户描述的“散列之前的全部内容”，模拟题覆盖至 AVL 删除、排除集合与散列本章。用户还用“到二叉树”描述范围；如老师最终宣布只考普通二叉树相关章节，应调整模拟卷第 10—14 章部分，不能同时把两种范围声称为已获正式确认。

## 技术与内容验收

- **阶段 A，已通过**：16 个 Markdown 源稿均独立存在，章节数、教学单元数、习题数、重复锚点、模拟卷范围进行校验。KMP、堆、Huffman WPL、BST、AVL 的代表性 C++17 程序由 g++ 独立编译与运行；若干数值答案独立重算。GitHub Action：`Verify V4 manuscript stage A`，最新成功运行 `40287301667`。
- **阶段 B，已通过**：编译时对比冻结的 Markdown SHA-256，输出 16 章和 131 个单元、82/92 个题目区域的两个不同 HTML 页面。GitHub Action：`Build DSA V4 after manuscript approval`，成功运行 `40318858069`。
- **字体**：使用已内嵌并重建的开源文津宋体 WOFF2（正文）与思源宋体/Noto Serif CJK SC WOFF2（标题），直接引用本仓库已发布的字库路径。仓库 `Rebuild both embedded DSA serif fonts` 已把 V4 教学与复习全部 Markdown 纳入字形子集统计，成功运行 `40288187178`。
- **浏览器，已通过**：Playwright/Chromium 检测桌面 1380×900 教学页、390×844 手机教学页和复习页、820×1180 平板复习页；核验 16 章/131 单元、68 道专项题和两套卷、两种本地字体正常加载、整页无水平溢出、夜间模式、答案展开与持久化恢复、手机侧边目录。GitHub Action：`Verify DSA V4 course and closed-book exam UI`，成功运行 `40319995555`；浏览器截图作为该次运行的 artifacts 保留。
- **部署**：GitHub Pages 由仓库原有 Pages workflow 自动构建。最终发布状态须以最新 `pages build and deployment` Action 为准。

## 明确的限制

- 自动语法、算法和浏览器验收不能代替真实初学者完全不查 PPT 的完整学习测试；未做盲读者试读、隔日复做和正式作业正确率统计，不能声称已证实任何人都能轻松做完所有题。
- 目前未用 iPhone/iPad 实机 Safari 手动查看每一屏；测试是在 Chromium 设备尺寸模拟下完成。
- 文字稿各章深度不完全相同，本轮自动编译覆盖重要核心示例，并非所有代码片段都逐块组成独立编译单元。未通过的情况应在下一轮作为文字阶段修订，而不能只修改最终 HTML。
- 已有作业题型和用户上传 PPT 构成内容基础；补充例题、现代 C++17 边界规则和算法推导属于讲义扩充，课件不一定以同样写法表达。正式题面提供的高度、下标、BF 和计数约定始终优先。

## 后续修订原则

- 每次内容修改先改独立 `.md` 文字稿，再重新运行阶段 A 检查、更新冻结摘要，阶段 B 只重新生成页面；不得直接修改自动生成的教学 HTML。
- 题目正确性回归应包括手工轨迹与代码运行双重核对；遇到未教授的前置概念，应回补到首次引入的位置。
- 发现真实阅读断点时，以 V3 第十五章教材式样稿为深度参考，优先改善教学解释，再调整交互和排版。
