# 期中专项题库（第 2 组）：数组、KMP 与树

这一组题要求你在不同的表示方法之间切换：同一个矩阵位置换成行优先、列优先、压缩表示时，下标计算会改变；同一段模式串在 LPS 和不同 next 约定中，数组数值也可能不同。后半部分转向树，重点是从孩子关系、遍历规则和线索标志恢复出真实结构。

请先写出题目采用的坐标、下标与空指针约定，再展开运算。参考解答保留推算过程，便于核对自己从哪一步开始偏离正确状态。

## 数组与压缩矩阵



<h4 class="exercise-title">第 25 题 · 地址计算</h4>

**题目。** 二维数组 A 有 4 行、6 列，下标均从 0 开始，采用行优先连续存储。求 A[2][3] 相对于 A[0][0] 的元素偏移；若每项占 8 字节，再求字节偏移。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>先跨过两整行。</p>
<p><strong>推导与答案：</strong>2×6+3=15；若每元素 8 字节，地址与首地址差 120 字节。</p>
<p><strong>典型错误：</strong>将行数 4 误用作行优先跨行步长。</p>

<p><strong>过程复核：</strong>行优先时已完整越过 2 行，每行 6 个元素，随后在本行跨过 3 个位置，偏移是 2×6+3=15；地址差再乘每项 8 字节得到 120。</p>
</details>



<h4 class="exercise-title">第 26 题 · 地址计算</h4>

**题目。** 二维数组 A 有 4 行、6 列，行列下标从 0 开始，采用**列优先**存储。求 A[2][3] 相对于 A[0][0] 的一维元素偏移，并解释为何此处与行优先答案不同。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>跨过 3 整列，每列 4 项。</p>
<p><strong>推导与答案：</strong>3×4+2=14。</p>
<p><strong>典型错误：</strong>将行优先公式原样照搬。</p>

<p><strong>过程复核：</strong>列优先先越过 3 整列，每列有 4 个元素，随后在当前列跨过两行，偏移 3×4+2=14。关键是用实际连续存储顺序推公式。</p>
</details>



<h4 class="exercise-title">第 27 题 · 对称矩阵</h4>

**题目。** 一个 5 阶对称矩阵按行优先只保存下三角（含主对角线），一维数组 B 从下标 0 开始。求 A[1][4] 对应 B 的下标，并说明为何需要转换到下三角。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>先交换到实际存储的下三角。</p>
<p><strong>推导与答案：</strong>A[4][1]，k=4×5/2+1=11（0-based）。</p>
<p><strong>典型错误：</strong>未先判定 i<j。</p>

<p><strong>过程复核：</strong>上三角的 A[1][4] 与下三角 A[4][1] 相等。压缩数组中第 4 行之前已有 1+2+3+4=10 项，再加该行列号 1，所以 k=11。</p>
</details>



<h4 class="exercise-title">第 28 题 · 三对角矩阵</h4>

**题目。** 7 阶三对角矩阵满足只有 |i−j|≤1 的位置可能非零，按行优先压入从 0 编号的一维数组 B。已知 B[12] 对应一个有效元素，求它原来的行列下标 (i,j)，写出反向推算。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>使用 i=floor((k+1)/3)、j=k−2i。</p>
<p><strong>推导与答案：</strong>i=4、j=4，对应 A[4][4]。</p>
<p><strong>典型错误：</strong>带外坐标不能被强行压缩。</p>

<p><strong>过程复核：</strong>按行排列时，前三对角线形成长度 2、3、3、3、3、3、2 的区段；B 的下标 12 落在第 4 行对应区段中，原坐标为 (4,4)。不要把带外零当成已存储项。</p>
</details>



<h4 class="exercise-title">第 29 题 · 快速转置</h4>

**题目。** 稀疏矩阵转置前的原矩阵有 4 列，按列号 0、1、2、3 统计非零项数得到 count=[2,0,1,3]，转置后的三元组按新行号从小到大连续存放。求每个新行的**初始写入位置** start（0-based），说明空行如何处理。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>排他前缀和。</p>
<p><strong>推导与答案：</strong>start=[0,2,2,3]。第 1 行为空，下一行的首位置没有变化。</p>
<p><strong>典型错误：</strong>把 start 当成该行最后位置。</p>

<p><strong>过程复核：</strong>第一行起点为 0；第二行起点加上前一行 2 得 2；第三行仍为 2；第四行加上第三行的 1 得 3。完整起点为 [0,2,2,3]，它是排他前缀和。</p>
</details>



<h4 class="exercise-title">第 30 题 · 结构选择</h4>

**题目。** 一个 1000×1000 矩阵只有 5 个非零元素，其他位置全为 0。若主要执行保存、顺序扫描非零项和偶尔转置，应采用完整二维数组还是三元组表？若还需频繁插删与同时按行、列遍历，应考虑何种表示？

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>主要约束是空间占用与是否频繁动态插删。</p>
<p><strong>推导与答案：</strong>静态稀疏数据宜用三元组，仅记录 (行,列,值)；频繁按行列修改时可考虑正交链表。</p>
<p><strong>典型错误：</strong>为每个零申请一整项。</p>

<p><strong>过程复核：</strong>三元组只记录非零项的行、列、值，避免为大量零值分配独立单元。正交链表适合维护同一结点的行向和列向邻接，但增加指针维护成本。</p>
</details>

## KMP 与字符串



<h4 class="exercise-title">第 31 题 · 基础</h4>

**题目。** 字符串 S=`ABCDEFG`，课程函数 `SubString(S,start,len)` 采用 1-based 起点、len 表示连续字符个数。求 `SubString(S,2,4)` 的结果，并写出 C++ `std::string::substr` 的等价调用（其位置为 0-based）。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>从第二项开始连续四字符。</p>
<p><strong>推导与答案：</strong>BCDE；在 C++ 写 S.substr(1,4)。</p>
<p><strong>典型错误：</strong>混用 0-based。</p>

<p><strong>过程复核：</strong>从第 2 个字符 B 开始，连续取 4 个字符，结果 BCDE；C++ 的 `substr` 从 0 开始，所以用 `S.substr(1,4)`。</p>
</details>



<h4 class="exercise-title">第 32 题 · LPS</h4>

**题目。** 给定模式串 P=`aabaaca`，下标从 0 起。求每个前缀 P[0..i] 的最长相等**真前缀和真后缀**长度，写出完整 LPS 数组，并特别解释 i=5 的值。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>每个前缀分别求最长公共真前后缀。</p>
<p><strong>推导与答案：</strong>[0,1,0,1,2,0,1]；最后一项长度为 1。</p>
<p><strong>典型错误：</strong>把整个串本身当作真前缀。</p>

<p><strong>过程复核：</strong>逐项验证前后缀时，要排除整个片段自己。i=5 时处理到 `aabaac`，新末尾 c 无法延长原有边界，较短合法候选也不存在，因此该项为 0。</p>
</details>



<h4 class="exercise-title">第 33 题 · next约定</h4>

**题目。** 已知模式 P 的 LPS 为 [0,1,0,1,2,0,1]，现在改用长度与 P 相同的 −1 型 next：`next[0]=-1`，对 1≤j<|P| 定义 `next[j]=lps[j−1]`。求 next 的七个数，并说明对应关系。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>数组从前一项 lps 搬移。</p>
<p><strong>推导与答案：</strong>[-1,0,1,0,1,2,0]。</p>
<p><strong>典型错误：</strong>直接把 lps 当 next。</p>

<p><strong>过程复核：</strong>按定义把 LPS 的前六项向右移动一格，再在首项写 −1，得到 [−1,0,1,0,1,2,0]。其他教材的 next 数组定义可能不同，考试先看明确约定。</p>
</details>



<h4 class="exercise-title">第 34 题 · 失配跟踪</h4>

**题目。** 主串 S=`ababababca`、模式 P=`abababca`，下标从 0 开始。KMP 已匹配 j=6 个模式字符，当前 i=6 处字符发生失配。已知 `lps[5]=4`，求回退后 i、j 的值，并写出下一次比较对象。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>查看已经匹配的 P[0..5] 的边界。</p>
<p><strong>推导与答案：</strong>lps[5]=4，j→4 而 i 仍为 6；必须继续比较 S[6] 与 P[4]。</p>
<p><strong>典型错误：</strong>同时让 i++ 可能跳过匹配。</p>

<p><strong>过程复核：</strong>在已匹配的六字符片段中最长可复用边界长 4，所以 j 回退到 4，i 保留 6。下一轮仍要拿 S[6] 与 P[4] 比较；改变 i 可能漏掉合法起点。</p>
</details>



<h4 class="exercise-title">第 35 题 · 证明解释</h4>

**题目。** 在构造 KMP 的 LPS 数组时，已处理前缀存在长度为 len 的最长公共真前后缀，但新字符无法延长它。解释为什么将 `len` 更新为 `lps[len−1]` 可以跳过无效候选，而简单执行 `len--` 可能浪费比较。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>下一候选必须仍是已匹配部分的真前后缀。</p>
<p><strong>推导与答案：</strong>lps[len−1] 恰给出此前长度 len 的公共边界中最长仍可行者，直接跳到它不会漏合法候选。</p>
<p><strong>典型错误：</strong>仅记代码却说不出候选为什么合法。</p>

<p><strong>过程复核：</strong>较短候选必须同时等于旧匹配段的后缀和模式前缀。`lps[len−1]` 是下一个仍满足这项必要条件的最大长度，其间的其他长度都已排除。</p>
</details>



<h4 class="exercise-title">第 36 题 · 重叠匹配</h4>

**题目。** 在主串 S=`aaaaaa` 中查找模式 P=`aaaa` 的**所有允许重叠**的出现位置。请给出 0-based 起点，说明一次成功匹配后如何更新 KMP 的 j 才不会漏掉重叠匹配。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>成功后复用最后的公共边界。</p>
<p><strong>推导与答案：</strong>起点为 0、1、2，共三处；j=lps[3]=3 继续，而不是清 0。</p>
<p><strong>典型错误：</strong>只搜索非重叠答案。</p>

<p><strong>过程复核：</strong>长度为 4 的模式在长度为 6 的主串中可以从 0、1、2 开始。第一次完成匹配后让 j 变成 `lps[3]=3`，保留已经确认的三个字符重叠边界。</p>
</details>

## 普通二叉树与遍历重建



<h4 class="exercise-title">第 37 题 · 遍历</h4>

**题目。** 一棵二叉树根为 A，A 的左、右孩子分别是 B、C；B 的左、右孩子是 D、E；C 只有右孩子 F。求这棵树的后序遍历序列。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>左右根。</p>
<p><strong>推导与答案：</strong>D E B F C A。</p>
<p><strong>典型错误：</strong>只凭层次而非递归规则输出。</p>

<p><strong>过程复核：</strong>后序始终按照左子树、右子树、根的次序。B 子树输出 D、E、B；C 子树输出 F、C；最后输出 A。</p>
</details>



<h4 class="exercise-title">第 38 题 · 数组树</h4>

**题目。** 用数组 [A,B,C,@,D,E,F] 按 0-based 完全二叉树位置规则保存一棵普通二叉树，其中 @ 表示该位置没有结点，其他位置不得左移。画出实际父子关系，求中序遍历序列。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>@ 保留位置，不建立结点。</p>
<p><strong>推导与答案：</strong>B D A E C F。B 只有右孩子 D；C 有 E、F。</p>
<p><strong>典型错误：</strong>把 @ 删去后重新紧凑编号。</p>

<p><strong>过程复核：</strong>保留 @ 对应的缺失位置，B 的右孩子才会是 D；如果删除占位，D 会被错误移动到 B 的左孩子位置。</p>
</details>



<h4 class="exercise-title">第 39 题 · 重建</h4>

**题目。** 一棵二叉树结点标签互异，已知前序序列 A B D E C F，中序序列 D B E A C F。请逐步重建二叉树并给出后序遍历，解释右子树中 F 的位置。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>前序首项为根，按中序左右区间切分。</p>
<p><strong>推导与答案：</strong>A 为根；B 左右 D、E；C 的右孩子 F。后序 D E B F C A。</p>
<p><strong>典型错误：</strong>把 C 的右孩子错误画成左孩子。</p>

<p><strong>过程复核：</strong>前序首元素 A 是根，中序把它的左子树分为 D B E、右子树分为 C F；C 在其右子树中序的最左边，因此只有右孩子 F。</p>
</details>



<h4 class="exercise-title">第 40 题 · 度数公式</h4>

**题目。** 某非空二叉树有 10 个度为 2 的结点，度为 1 的结点数量未知。请根据父子边数关系求其叶结点的**准确个数**，而仅仅给出下界。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>n0=n2+1 是等式。</p>
<p><strong>推导与答案：</strong>恰有 11 个叶；度为 1 的结点数无关。</p>
<p><strong>典型错误：</strong>将其当作近似不等式。</p>

<p><strong>过程复核：</strong>任何非空二叉树满足 n₀=n₂+1，因此 n₂=10 时叶数恰好是 11。度为 1 的结点数会在边数方程中抵消，不影响这个等式。</p>
</details>



<h4 class="exercise-title">第 41 题 · 一般树证明</h4>

**题目。** 一棵非空一般树除叶结点外，度为 1、2、3 的结点数分别为 4、3、2，且没有度数大于 3 的结点。求叶结点数，并用父子边数验证结果。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>对总边数 n−1 两次计数。</p>
<p><strong>推导与答案：</strong>n0=1+n2+2n3=1+3+4=8，结点总数 17，边数 16。</p>
<p><strong>典型错误：</strong>把只适合二叉树的公式 n0=n2+1 用于三叉结点。</p>

<p><strong>过程复核：</strong>一棵 n 结点非空树有 n−1 条边。按孩子数计边得 n₁+2n₂+3n₃；与 n₀+n₁+n₂+n₃−1 相等后得 n₀=1+n₂+2n₃=8。</p>
</details>



<h4 class="exercise-title">第 42 题 · 非递归算法</h4>

**题目。** 用显式栈遍历一棵普通二叉树，把访问到的每个结点的左右孩子指针交换，实现原地镜像。解释函数为什么应当保存并返回原始 `root` 指针，以及需要在什么时候把孩子加入栈。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>最后弹出的不必是根。</p>
<p><strong>推导与答案：</strong>初始化保存 root，逐个弹出 p、swap(p->left,p->right)、压入存在的孩子，最后 return root；时间 Θ(n)。</p>
<p><strong>典型错误：</strong>丢失原根指针。</p>

<p><strong>过程复核：</strong>每次弹栈后交换当前结点的 left/right，再将交换后仍存在的真实孩子压栈，两侧均只会访问一次。原根不必等于最后弹出的结点，应在开始时保存。</p>
</details>

## 线索树、森林与树形计数



<h4 class="exercise-title">第 43 题 · 空指针</h4>

**题目。** 一个普通非空二叉链表有 n=18 个结点，每个结点都有 `left` 与 `right` 两个指针域，缺失孩子时域为 null。求空指针域总数，并从真实父子边数量推导。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>总指针域 2n，真实边 n−1。</p>
<p><strong>推导与答案：</strong>2n−(n−1)=n+1=19。</p>
<p><strong>典型错误：</strong>把非空孩子域算成 n 而非 n−1。</p>

<p><strong>过程复核：</strong>总共有 2n 条孩子指针槽位，恰有 n−1 条指向真实孩子的边，因此空槽位为 2n−(n−1)=n+1=19。</p>
</details>



<h4 class="exercise-title">第 44 题 · 中序后继</h4>

**题目。** 在没有头结点的中序线索二叉树中，结点 p 的 `right` 指向一个**真实右子树**。求 p 的中序后继，应沿哪条路径寻找？如果右子树左侧还有真实孩子，为什么不能直接返回右孩子？

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>右子树最先输出的结点是谁？</p>
<p><strong>推导与答案：</strong>进入 p.right，再沿真实 left 指针走到最左结点。</p>
<p><strong>典型错误：</strong>直接取右孩子，忽略其左分支。</p>

<p><strong>过程复核：</strong>后继是右子树中按中序最先访问的结点，所以需要从 p.right 开始沿真实左孩子走到底。若直接取右孩子，可能跳过其左子树结点。</p>
</details>



<h4 class="exercise-title">第 45 题 · 线索标志</h4>

**题目。** 一棵中序线索树约定 `rtag=0` 表示真实右孩子，`rtag=1` 表示中序后继线索。现结点 p 的 rtag=1，请解释 p.right 所表达的关系，并说明无后继时的可能约定。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>tag=1 是本题规定的线索状态。</p>
<p><strong>推导与答案：</strong>right 指中序后继，而不是真实右孩子；若无后继可能为空或指向专设的头结点。</p>
<p><strong>典型错误：</strong>沿着线索继续递归当成子树。</p>

<p><strong>过程复核：</strong>rtag=1 说明 `right` 存储中序后继，不能沿它进入真实右子树。尾结点可能以 null 表示无后继，也有带头结点的循环线索版本，需服从题目。</p>
</details>



<h4 class="exercise-title">第 46 题 · 森林还原</h4>

**题目。** 孩子—兄弟法采用 `left=firstChild`、`right=nextSibling`。给定 A.left=B、B.right=C、A.right=F、F.left=G，且其余相关指针为空。请还原对应森林的根及直接孩子，求森林共有几棵树。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>left=首孩子，right=下一个兄弟。</p>
<p><strong>推导与答案：</strong>两棵：根 A 的孩子 B、C；根 F 的孩子 G。</p>
<p><strong>典型错误：</strong>把 F 当作 A 的右孩子。</p>

<p><strong>过程复核：</strong>A.right=F 表示 A、F 是森林的两个根；A.left=B 表示 B 为 A 的第一个孩子，而 B.right=C 表示 C 与 B 为兄弟。F.left=G 则表示 G 为 F 的第一个孩子。</p>
</details>



<h4 class="exercise-title">第 47 题 · Catalan数</h4>

**题目。** 只区分二叉树左右形状、不区分结点标签，设 T₀=1、T₁=1、T₂=2，且 `Tₙ=Σ(TₖTₙ₋₁₋ₖ)`（k 从 0 到 n−1）。求 T₃，并写出根的左子树有 0、1、2 个结点时各贡献多少种形状。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>根左侧结点数可为 0、1、2。</p>
<p><strong>推导与答案：</strong>T3=T0T2+T1T1+T2T0=2+1+2=5。</p>
<p><strong>典型错误：</strong>遗漏空子树 T0=1。</p>

<p><strong>过程复核：</strong>左子树含 0 个结点贡献 T₀T₂=2；含 1 个贡献 T₁T₁=1；含 2 个贡献 T₂T₀=2，合计 5。空子树 T₀=1 必须计入。</p>
</details>



<h4 class="exercise-title">第 48 题 · 方法选择</h4>

**题目。** 一般树采用 `firstChild/nextSibling` 组织结点。给定根 A，请描述遍历 A 的**所有直接孩子**的循环过程，要求说明起始指针、每轮输出内容与移动指针的规则，避免误入孙结点。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>第一步找 A.firstChild，以后走 nextSibling。</p>
<p><strong>推导与答案：</strong>for(c=A.firstChild;c;c=c.nextSibling) 即可逐个访问直接孩子；不能递归进入 c.firstChild 并误当成同一层。</p>
<p><strong>典型错误：</strong>沿着孩子的孩子一直走，漏掉兄弟。</p>

<p><strong>过程复核：</strong>从 `c=A.firstChild` 开始；每轮访问 c，随后令 `c=c.nextSibling`，直到 null。若沿 c.firstChild 继续走，便转到 c 的孩子，层次发生变化。</p>
</details>
