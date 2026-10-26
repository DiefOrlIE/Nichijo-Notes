# 期中专项题库（第 2 组）：数组、KMP 与树

> 这是已学习者的题型训练，不承担首次讲授。答案提供完整过程，但新概念应回到主讲稿先学。

## 数组与压缩矩阵

<details class="question"><summary>第 25 题 · 地址计算｜A[4][6]、0-based 行优先，A[2][3] 线性偏移？</summary>
<p><strong>如何入手：</strong>先跨过两整行。</p>
<p><strong>推导与答案：</strong>2×6+3=15；若每元素 8 字节，地址与首地址差 120 字节。</p>
<p><strong>典型错误：</strong>将行数 4 误用作行优先跨行步长。</p>
</details>

<details class="question"><summary>第 26 题 · 地址计算｜同一 A[4][6] 采用列优先，A[2][3] 的元素下标？</summary>
<p><strong>如何入手：</strong>跨过 3 整列，每列 4 项。</p>
<p><strong>推导与答案：</strong>3×4+2=14。</p>
<p><strong>典型错误：</strong>将行优先公式原样照搬。</p>
</details>

<details class="question"><summary>第 27 题 · 对称矩阵｜五阶矩阵下三角行优先压缩，A[1][4] 对应 B 哪项？</summary>
<p><strong>如何入手：</strong>先交换到实际存储的下三角。</p>
<p><strong>推导与答案：</strong>A[4][1]，k=4×5/2+1=11（0-based）。</p>
<p><strong>典型错误：</strong>未先判定 i<j。</p>
</details>

<details class="question"><summary>第 28 题 · 三对角矩阵｜n=7 的三对角矩阵，压缩下标 B[12] 对应 A 哪项？</summary>
<p><strong>如何入手：</strong>使用 i=floor((k+1)/3)、j=k−2i。</p>
<p><strong>推导与答案：</strong>i=4、j=4，对应 A[4][4]。</p>
<p><strong>典型错误：</strong>带外坐标不能被强行压缩。</p>
</details>

<details class="question"><summary>第 29 题 · 快速转置｜非零项按列计数 count=[2,0,1,3]，转置输出行首位置 start？</summary>
<p><strong>如何入手：</strong>排他前缀和。</p>
<p><strong>推导与答案：</strong>start=[0,2,2,3]。第 1 行为空，下一行的首位置没有变化。</p>
<p><strong>典型错误：</strong>把 start 当成该行最后位置。</p>
</details>

<details class="question"><summary>第 30 题 · 结构选择｜1000×1000 矩阵只有五个非零项，采用完整二维数组还是三元组？</summary>
<p><strong>如何入手：</strong>主要约束是空间占用与是否频繁动态插删。</p>
<p><strong>推导与答案：</strong>静态稀疏数据宜用三元组，仅记录 (行,列,值)；频繁按行列修改时可考虑正交链表。</p>
<p><strong>典型错误：</strong>为每个零申请一整项。</p>
</details>

## KMP 与字符串

<details class="question"><summary>第 31 题 · 基础｜S='ABCDEFG'，SubString(S,2,4)（起点 1-based）是什么？</summary>
<p><strong>如何入手：</strong>从第二项开始连续四字符。</p>
<p><strong>推导与答案：</strong>BCDE；在 C++ 写 S.substr(1,4)。</p>
<p><strong>典型错误：</strong>混用 0-based。</p>
</details>

<details class="question"><summary>第 32 题 · LPS｜P='aabaaca' 的 LPS 数组？</summary>
<p><strong>如何入手：</strong>每个前缀分别求最长公共真前后缀。</p>
<p><strong>推导与答案：</strong>[0,1,0,1,2,0,1]；最后一项长度为 1。</p>
<p><strong>典型错误：</strong>把整个串本身当作真前缀。</p>
</details>

<details class="question"><summary>第 33 题 · next约定｜若 lps=[0,1,0,1,2,0,1]，采用 next[0]=-1、next[j]=lps[j−1]，求 next。</summary>
<p><strong>如何入手：</strong>数组从前一项 lps 搬移。</p>
<p><strong>推导与答案：</strong>[-1,0,1,0,1,2,0]。</p>
<p><strong>典型错误：</strong>直接把 lps 当 next。</p>
</details>

<details class="question"><summary>第 34 题 · 失配跟踪｜S='ababababca'、P='abababca'，i=6、j=6 失配时，i、j 下一步？</summary>
<p><strong>如何入手：</strong>查看已经匹配的 P[0..5] 的边界。</p>
<p><strong>推导与答案：</strong>lps[5]=4，j→4 而 i 仍为 6；必须继续比较 S[6] 与 P[4]。</p>
<p><strong>典型错误：</strong>同时让 i++ 可能跳过匹配。</p>
</details>

<details class="question"><summary>第 35 题 · 证明解释｜KMP 中为何不是把 len 简单减一，而是 len=lps[len−1]？</summary>
<p><strong>如何入手：</strong>下一候选必须仍是已匹配部分的真前后缀。</p>
<p><strong>推导与答案：</strong>lps[len−1] 恰给出此前长度 len 的公共边界中最长仍可行者，直接跳到它不会漏合法候选。</p>
<p><strong>典型错误：</strong>仅记代码却说不出候选为什么合法。</p>
</details>

<details class="question"><summary>第 36 题 · 重叠匹配｜P='aaaa' 在 S='aaaaaa' 中有几处允许重叠匹配？匹配成功后如何继续？</summary>
<p><strong>如何入手：</strong>成功后复用最后的公共边界。</p>
<p><strong>推导与答案：</strong>起点为 0、1、2，共三处；j=lps[3]=3 继续，而不是清 0。</p>
<p><strong>典型错误：</strong>只搜索非重叠答案。</p>
</details>

## 普通二叉树与遍历重建

<details class="question"><summary>第 37 题 · 遍历｜根 A、左 B、右 C，B 左 D、右 E，C 右 F：后序？</summary>
<p><strong>如何入手：</strong>左右根。</p>
<p><strong>推导与答案：</strong>D E B F C A。</p>
<p><strong>典型错误：</strong>只凭层次而非递归规则输出。</p>
</details>

<details class="question"><summary>第 38 题 · 数组树｜[A,B,C,@,D,E,F] 按完全二叉树位置存储，求中序。</summary>
<p><strong>如何入手：</strong>@ 保留位置，不建立结点。</p>
<p><strong>推导与答案：</strong>B D A E C F。B 只有右孩子 D；C 有 E、F。</p>
<p><strong>典型错误：</strong>把 @ 删去后重新紧凑编号。</p>
</details>

<details class="question"><summary>第 39 题 · 重建｜前序 A B D E C F、中序 D B E A C F，画树并写后序。</summary>
<p><strong>如何入手：</strong>前序首项为根，按中序左右区间切分。</p>
<p><strong>推导与答案：</strong>A 为根；B 左右 D、E；C 的右孩子 F。后序 D E B F C A。</p>
<p><strong>典型错误：</strong>把 C 的右孩子错误画成左孩子。</p>
</details>

<details class="question"><summary>第 40 题 · 度数公式｜二叉树有 10 个度为 2 的结点，至少多少叶？</summary>
<p><strong>如何入手：</strong>n0=n2+1 是等式。</p>
<p><strong>推导与答案：</strong>恰有 11 个叶；度为 1 的结点数无关。</p>
<p><strong>典型错误：</strong>将其当作近似不等式。</p>
</details>

<details class="question"><summary>第 41 题 · 一般树证明｜一般树有 n1=4、n2=3、n3=2，其余为叶，求叶数。</summary>
<p><strong>如何入手：</strong>对总边数 n−1 两次计数。</p>
<p><strong>推导与答案：</strong>n0=1+n2+2n3=1+3+4=8，结点总数 17，边数 16。</p>
<p><strong>典型错误：</strong>把只适合二叉树的公式 n0=n2+1 用于三叉结点。</p>
</details>

<details class="question"><summary>第 42 题 · 非递归算法｜用显式栈交换二叉树所有左右孩子，为什么不能 return 最后一个弹出的 node？</summary>
<p><strong>如何入手：</strong>最后弹出的不必是根。</p>
<p><strong>推导与答案：</strong>初始化保存 root，逐个弹出 p、swap(p->left,p->right)、压入存在的孩子，最后 return root；时间 Θ(n)。</p>
<p><strong>典型错误：</strong>丢失原根指针。</p>
</details>

## 线索树、森林与树形计数

<details class="question"><summary>第 43 题 · 空指针｜普通二叉链表有 n=18 个结点，空左右指针域有几个？</summary>
<p><strong>如何入手：</strong>总指针域 2n，真实边 n−1。</p>
<p><strong>推导与答案：</strong>2n−(n−1)=n+1=19。</p>
<p><strong>典型错误：</strong>把非空孩子域算成 n 而非 n−1。</p>
</details>

<details class="question"><summary>第 44 题 · 中序后继｜p 有真实右子树，中序后继怎样找？</summary>
<p><strong>如何入手：</strong>右子树最先输出的结点是谁？</p>
<p><strong>推导与答案：</strong>进入 p.right，再沿真实 left 指针走到最左结点。</p>
<p><strong>典型错误：</strong>直接取右孩子，忽略其左分支。</p>
</details>

<details class="question"><summary>第 45 题 · 线索标志｜中序线索结点 p 的 rtag=1，其 right 应解释为什么？</summary>
<p><strong>如何入手：</strong>tag=1 是本题规定的线索状态。</p>
<p><strong>推导与答案：</strong>right 指中序后继，而不是真实右孩子；若无后继可能为空或指向专设的头结点。</p>
<p><strong>典型错误：</strong>沿着线索继续递归当成子树。</p>
</details>

<details class="question"><summary>第 46 题 · 森林还原｜A.left=B，B.right=C，A.right=F，F.left=G。原森林有几棵树？</summary>
<p><strong>如何入手：</strong>left=首孩子，right=下一个兄弟。</p>
<p><strong>推导与答案：</strong>两棵：根 A 的孩子 B、C；根 F 的孩子 G。</p>
<p><strong>典型错误：</strong>把 F 当作 A 的右孩子。</p>
</details>

<details class="question"><summary>第 47 题 · Catalan数｜n=3 的二叉树形态数是多少？展示递推分项。</summary>
<p><strong>如何入手：</strong>根左侧结点数可为 0、1、2。</p>
<p><strong>推导与答案：</strong>T3=T0T2+T1T1+T2T0=2+1+2=5。</p>
<p><strong>典型错误：</strong>遗漏空子树 T0=1。</p>
</details>

<details class="question"><summary>第 48 题 · 方法选择｜已知森林以 firstChild/nextSibling 存储，访问根 A 的所有直接孩子如何走？</summary>
<p><strong>如何入手：</strong>第一步找 A.firstChild，以后走 nextSibling。</p>
<p><strong>推导与答案：</strong>for(c=A.firstChild;c;c=c.nextSibling) 即可逐个访问直接孩子；不能递归进入 c.firstChild 并误当成同一层。</p>
<p><strong>典型错误：</strong>沿着孩子的孩子一直走，漏掉兄弟。</p>
</details>
