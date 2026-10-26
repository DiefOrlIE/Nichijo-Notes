# 期中专项题库（第 3 组）：堆、哈夫曼、查找与平衡树

> 与前两组相同：面向已经学习过一遍的读者。重点检查方法选择、逐步状态以及边界，而不是重新教授定义。

## 堆、Top-K 与建堆

<details class="question"><summary>第 49 题 · 合法性｜数组 [10,8,9,4,7,6] 是最大堆吗？</summary>
<p><strong>如何入手：</strong>逐个比较父与孩子，不要求整表单调。</p>
<p><strong>推导与答案：</strong>合法：10≥8,9；8≥4,7；9≥6。</p>
<p><strong>典型错误：</strong>把兄弟大小关系当成堆要求。</p>
</details>

<details class="question"><summary>第 50 题 · 插入模拟｜最大堆 [9,7,8,3,5,6] 插入 10，写每次交换后的数组。</summary>
<p><strong>如何入手：</strong>先追加末尾，再沿父链接上浮。</p>
<p><strong>推导与答案：</strong>[9,7,8,3,5,6,10]→[9,7,10,3,5,6,8]→[10,7,9,3,5,6,8]。</p>
<p><strong>典型错误：</strong>一次上浮不够就提前停。</p>
</details>

<details class="question"><summary>第 51 题 · 逐项建堆｜用逐项插入法将 [2,9,4,7,6] 构成最大堆。</summary>
<p><strong>如何入手：</strong>每加入一项保存一次状态。</p>
<p><strong>推导与答案：</strong>[2]、[9,2]、[9,2,4]、[9,7,4,2]、[9,7,4,2,6]。</p>
<p><strong>典型错误：</strong>把底向上筛选的结果当逐项状态。</p>
</details>

<details class="question"><summary>第 52 题 · 筛选建堆｜将 [1,2,5,8,3,6,10,14] 底向上筛成最大堆，最后状态？</summary>
<p><strong>如何入手：</strong>非叶 i=3,2,1,0 依次下沉。</p>
<p><strong>推导与答案：</strong>i=3→[1,2,5,14,3,6,10,8]；i=2→[1,2,10,14,3,6,5,8]；i=1→[1,14,10,8,3,6,5,2]；i=0→[14,8,10,2,3,6,5,1]。</p>
<p><strong>典型错误：</strong>下沉时没继续沿交换后的孩子位置比较。</p>
</details>

<details class="question"><summary>第 53 题 · Top-K｜从 10 万项中维护最大的 20 项，选哪种堆？</summary>
<p><strong>如何入手：</strong>候选中最小者应最快被淘汰。</p>
<p><strong>推导与答案：</strong>容量 20 的最小堆；新项大于堆顶才替换。时间 O(nlog20)，额外空间 O(20)。</p>
<p><strong>典型错误：</strong>想取最大 k 项就误选最大堆。</p>
</details>

<details class="question"><summary>第 54 题 · 复杂度｜为什么底向上建堆是 Θ(n) 而非 Θ(nlog n)？</summary>
<p><strong>如何入手：</strong>叶子没有下沉工作，低层结点多但可下沉短。</p>
<p><strong>推导与答案：</strong>按高度 h 的结点数约 n/2^{h+1}，每项最多下沉 h，总代价 nΣh/2^h=Θ(n)。</p>
<p><strong>典型错误：</strong>对所有结点都按 log n 的最坏高度收费。</p>
</details>

## Huffman 树与带权路径长度

<details class="question"><summary>第 55 题 · 构造｜权 2,3,5,8，哈夫曼 WPL 是多少？</summary>
<p><strong>如何入手：</strong>每步合并两最小，合并成本求和。</p>
<p><strong>推导与答案：</strong>2+3=5；5+5=10；8+10=18，WPL=5+10+18=33。</p>
<p><strong>典型错误：</strong>生成的新 5 忘记加入候选集合。</p>
</details>

<details class="question"><summary>第 56 题 · WPL｜权 15,3,14,2,6,9,16,17，哈夫曼 WPL？</summary>
<p><strong>如何入手：</strong>七次合并，列完整成本。</p>
<p><strong>推导与答案：</strong>合并权 5、11、20、29、33、49、82，总和 229。</p>
<p><strong>典型错误：</strong>只把叶权相加得到 82，误当 WPL。</p>
</details>

<details class="question"><summary>第 57 题 · 平均码长｜总频数 25，WPL 55，平均每字符的二进制位数？</summary>
<p><strong>如何入手：</strong>总位数除出现次数。</p>
<p><strong>推导与答案：</strong>55/25=2.2 bit/字符。</p>
<p><strong>典型错误：</strong>除以字符种类数而非总频数。</p>
</details>

<details class="question"><summary>第 58 题 · 前缀码｜为什么 A=0、B=01 不能作为两个字符的无歧义前缀码？</summary>
<p><strong>如何入手：</strong>A 的码字是 B 的前缀。</p>
<p><strong>推导与答案：</strong>读到比特 0 时，不知道这是 A 的完整码字，还是 B 的开头，所以不满足前缀码条件。</p>
<p><strong>典型错误：</strong>只检查码字不同，忽略前缀关系。</p>
</details>

<details class="question"><summary>第 59 题 · 证明｜为什么两个最小权值可以安排在哈夫曼树最深兄弟叶？</summary>
<p><strong>如何入手：</strong>将低权与深处高权交换，不增加 WPL。</p>
<p><strong>推导与答案：</strong>更深位置的路径乘数更大，小权占更深位置不比大权贵；可通过交换构造一棵同样不劣的最优树，再把该兄弟对合并成缩小的最优子问题。</p>
<p><strong>典型错误：</strong>用一次实验结果代替贪心正确性证明。</p>
</details>

<details class="question"><summary>第 60 题 · 算法实现｜用什么数据结构维护哈夫曼过程的下一对最小权值？复杂度？</summary>
<p><strong>如何入手：</strong>必须反复提取两最小并回插合并权。</p>
<p><strong>推导与答案：</strong>用最小堆，n 叶进行 n−1 次合并，每次两弹一压，时间 O(nlog n)。</p>
<p><strong>典型错误：</strong>误选最大堆。</p>
</details>

## 查找、BST 和 AVL

<details class="question"><summary>第 61 题 · ASL｜n=7 的互异无序表等概率成功顺序查找 ASL？</summary>
<p><strong>如何入手：</strong>逐项比较次数是 1..7。</p>
<p><strong>推导与答案：</strong>(1+7)/2=4。</p>
<p><strong>典型错误：</strong>遗漏概率模型。</p>
</details>

<details class="question"><summary>第 62 题 · 二分轨迹｜有序表 [2,4,7,9,13,18,22] 搜 13，依次比较？</summary>
<p><strong>如何入手：</strong>闭区间每步取 floor((low+high)/2)。</p>
<p><strong>推导与答案：</strong>9→18→13，共三次。</p>
<p><strong>典型错误：</strong>把 mid 向上取整规则混入。</p>
</details>

<details class="question"><summary>第 63 题 · BST插入｜向空 BST 依次插入 5,2,8,1,3，根和左右孩子？</summary>
<p><strong>如何入手：</strong>逐项按大小走到空连接。</p>
<p><strong>推导与答案：</strong>根 5；左根 2，孩子 1 和 3；右孩子 8。</p>
<p><strong>典型错误：</strong>未保持整棵子树的大小不变量。</p>
</details>

<details class="question"><summary>第 64 题 · BST删除｜删除上题中的 2，规定用中序后继替换。</summary>
<p><strong>如何入手：</strong>右子树最左结点是后继。</p>
<p><strong>推导与答案：</strong>后继 3 替换 2，删原 3；得到根 5、左孩子 3 且其左孩子 1、右孩子 8。</p>
<p><strong>典型错误：</strong>重复保留原后继。</p>
</details>

<details class="question"><summary>第 65 题 · AVL旋转｜依次插入 30,10,20，失衡类型与结果？</summary>
<p><strong>如何入手：</strong>从首次失衡根往新结点方向左→右。</p>
<p><strong>推导与答案：</strong>LR：左旋 10，再右旋 30，得到根 20、左 10、右 30。</p>
<p><strong>典型错误：</strong>只做一次右旋。</p>
</details>

<details class="question"><summary>第 66 题 · AVL删除｜删除造成 p 的 bf=+2，右孩子 bf=−1，如何旋转？</summary>
<p><strong>如何入手：</strong>按右重+右孩子左倾识别 RL。</p>
<p><strong>推导与答案：</strong>先右旋 p 的右孩子，再左旋 p，更新所有受影响的高度并回接新根。</p>
<p><strong>典型错误：</strong>按 p 正号直接只左旋。</p>
</details>

<details class="question"><summary>第 67 题 · AVL特殊｜根 2、左1、右4，4 的左右 3、5；删 1 后怎样保持 AVL？</summary>
<p><strong>如何入手：</strong>根右高 2、左高 0，右孩子平衡因子 0。</p>
<p><strong>推导与答案：</strong>对根 2 单左旋，得到根4、左2（右孩子3）、右5。新子树高度与删除前相同。</p>
<p><strong>典型错误：</strong>把孩子 bf=0 强行判为 RL。</p>
</details>

<details class="question"><summary>第 68 题 · 复杂度｜普通 BST 与 AVL 查找的最坏时间为何不同？</summary>
<p><strong>如何入手：</strong>是否限制树高。</p>
<p><strong>推导与答案：</strong>普通 BST 有序插入可能成 n 长链，最坏 Θ(n)；AVL 保持左右高度差≤1，树高 O(log n)，查找 O(log n)。</p>
<p><strong>典型错误：</strong>把 BST 的平均表现当作最坏上界。</p>
</details>
