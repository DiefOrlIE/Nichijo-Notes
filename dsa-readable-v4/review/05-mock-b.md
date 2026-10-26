# 120 分钟闭卷模拟卷 B：综合与变式提高

> **时间：120 分钟；总分：100 分。**范围和 A 卷一致，仍为散列之前的课程内容；难度提高主要体现在题面不提示算法名称、步骤组合和边界判断。请先整套闭卷限时完成，再查看折叠答案。

## 第一部分　概念判断及理由（每题 4 分，共 20 分）

**1．【4 分】**一个二叉树的前序与后序分别为 AB、BA。是否能唯一重建？给出两个不同的合法树。

<details class="question"><summary>参考答案与评分点</summary><p>不能（2 分）。A 根、B 为左孩子，与 A 根、B 为右孩子，两者前序都是 AB，后序都是 BA（2 分）。缺少中序时不能凭序列区分左右单孩子。</p></details>

**2．【4 分】**为什么数组二分查找的 O(log n) 总时间不能直接推广到普通单链表？

<details class="question"><summary>参考答案与评分点</summary><p>二分需要按下标 O(1) 定位中间元素（2 分）。单链表从头沿 next 才能找到中间结点，定位本身代价不再是 O(1)，因此仅关键码比较次数少不能推出总时间 O(log n)（2 分）。</p></details>

**3．【4 分】**判断：容量为 5 的 front/count 循环队列，front=3,count=5 时下一入队下标为 3，所以它应当是空队列。

<details class="question"><summary>参考答案与评分点</summary><p>错误（2 分）。(3+5)%5=3 虽与 front 相同，但 count=5 明确表示满，不允许再入队；count=0 才表示空（2 分）。</p></details>

**4．【4 分】**在 Huffman 编码里，将某个内部结点的左右子树整体互换，是否改变 WPL？

<details class="question"><summary>参考答案与评分点</summary><p>不会改变（2 分）。所有叶子到根的边数不变，权也不变，故 Σ权×深度不变；可能会改变对应的具体 0/1 码字（2 分）。</p></details>

**5．【4 分】**AVL 删除时能否在第一次旋转后必定停止高度检查？请解释。

<details class="question"><summary>参考答案与评分点</summary><p>不能（2 分）。删除可能使旋转后子树高度仍下降，需继续向更高祖先传播，沿路径可能发生多次调整；应检查旋转后的高度或重新平衡每层（2 分）。</p></details>

## 第二部分　算法模拟及推导（每题 10 分，共 50 分）

**6．【10 分】**考虑代码：

~~~cpp
int f(int n){
    if(n<=0)return 0;
    int ans=0;
    for(int i=0;i<n;++i)++ans;
    return ans+f(n/2);
}
~~~

写出 f(8) 的返回值、调用规模序列、时间复杂度与额外栈空间复杂度。说明计算过程。

<details class="question"><summary>完整解答与评分点</summary><p>调用 n 为 8→4→2→1→0（2 分）；各层非递归工作量为 8、4、2、1，返回值为 15（3 分）。总工作 n+n/2+n/4+⋯=Θ(n)（3 分）；递归层数 Θ(log n)，每层常数局部变量，栈空间 Θ(log n)（2 分）。</p></details>

**7．【10 分】**(a) 从 6 个车厢 1–6 固定入栈，判断目标出栈 <code>3,2,5,6,4,1</code> 是否可行，写完整 I/O 轨迹（5 分）；(b) 在中缀式 <code>a*x-b/x^2</code> 中，只记录**运算符栈**的 I（入）与 O（出）事件次序（5 分），设幂运算优先于乘除，乘除优先于加减。

<details class="question"><summary>完整解答与评分点</summary><p>(a) 可行：I1 I2 I3 O3 O2 I4 I5 O5 I6 O6 O4 O1（5 分）。(b) 读 *：I；读 −：O(*) 后 I(−)；读 /：I(/)；读 ^：I(^)；结束后 O(^),O(/),O(−)。所以按时间次序为 <code>I O I I I O O O</code>（5 分）。只统计运算符事件，操作数直接输出。</p></details>

**8．【10 分】**(a) 三对角矩阵 n=7、行压缩 0-based 时，B[12] 对应 A 哪个位置（4 分）；(b) P="abababca" 的 LPS 数组与主串匹配失配时回退 <code>j=6</code> 的新值（6 分）。

<details class="question"><summary>完整解答与评分点</summary><p>(a) i=⌊(12+1)/3⌋=4，j=12−2×4=4，故 A[4][4]（4 分）。(b) P 下标 0..7 的 LPS 为 [0,0,1,2,3,4,0,1]（4 分）；此前已匹配六字符时失配，使用 lps[5]=4，故 j 从 6 回退至 4，主串下标暂不变（2 分）。</p></details>

**9．【10 分】**某一般树用“首孩子 firstChild、下一个兄弟 nextSibling”保存：A.firstChild=B；B.nextSibling=C；C.nextSibling=D；D.firstChild=E；A.nextSibling=F；F.firstChild=G。请画出原森林，说明有多少棵树，并写 A 这一棵树的前序（按孩子从左到右）（10 分）。

<details class="question"><summary>完整解答与评分点</summary><p>森林有两棵根树 A、F（2 分）。A 的直接孩子 B、C、D（3 分），D 的直接孩子 E（1 分）；F 的孩子 G（1 分）。A 树从根出发、按孩子从左到右的前序是 A B C D E（3 分）。特别注意 A.nextSibling=F 表示另一棵树的根，而不是 A 的孩子。</p></details>

**10．【10 分】**(a) 最大堆初始化为数组 [3,8,5,1,6]，采用**底向上筛选**，写最终数组并核对堆性质（5 分）；(b) 权 3、5、6、8 求 Huffman WPL，写合并顺序（5 分）。

<details class="question"><summary>完整解答与评分点</summary><p>(a) i=1 时父 8 已大于 1、6，无需变化；i=0 时 3 与较大孩子 8 交换得 [8,3,5,1,6]，下标1的 3 与较大孩子 6 交换得 [8,6,5,1,3]（5 分）。(b) 3+5=8；6+8=14；8+14=22；WPL=8+14+22=44（5 分）。</p></details>

## 第三部分　算法设计与代码解释（每题 15 分，共 30 分）

**11．【15 分】**一棵二叉树存为指针结点 <code>Node{key,left,right}</code>。要求**不用递归**，对所有结点交换左右子树，返回原树的新根地址。给出完整 C++ 核心函数及时间和辅助空间复杂度。

<details class="question"><summary>参考算法与评分点</summary>
<p>关键是用栈保存待处理结点，每次弹出后交换左右孩子（10 分），维护 root 并最终返回原 root（2 分）；每结点入出栈一次，时间 Θ(n)、栈空间 O(h)，其中 h 是二叉树高度（3 分）。</p>

~~~cpp
#include <stack>
#include <utility>
struct Node{int key;Node* left;Node* right;};
Node* mirror(Node* root){
    if(!root)return nullptr;
    std::stack<Node*> st;
    st.push(root);
    while(!st.empty()){
        Node* p=st.top();st.pop();
        std::swap(p->left,p->right);
        if(p->left)st.push(p->left);
        if(p->right)st.push(p->right);
    }
    return root;
}
~~~

<p>若函数末尾直接 return p，p 是最后弹出的某结点，未必是根。使用上面的深度优先栈，未处理结点数量受每条路径上的未访问分支数约束，最坏 O(h)。</p>
</details>

**12．【15 分】**假设 BST 使用互异关键码且删除时采用中序后继。给出删除一个拥有两个孩子的结点的步骤（5 分）；再解释如果要求维护 AVL，递归返回时还需要做哪些事情（5 分）；最后说明算法的时间复杂度（5 分）。

<details class="question"><summary>参考步骤与评分点</summary><p>步骤一：在待删结点右子树沿 left 走到最小关键码，即中序后继；把后继键值复制到待删位置；随后在原右子树里删除后继，并回接右子树根（5 分）。步骤二：如果是 AVL，返回每一层时更新当前结点的左右子树高度，按 bf=右高−左高判断是否失衡，针对 LL/LR/RR/RL 旋转，并把新子树根回接上一层（5 分）。普通 BST 删除最坏 O(h)，其中 h 可能 Θ(n)；AVL 的高度 O(log n)，删除及沿祖先路径再平衡最坏 O(log n)（5 分）。</p></details>

---

## B 卷纠错规则

如果在某道题只因为误读了表示约定而失分，单独记“题面约定检查”错误；如果算法选择正确而数组中途断链、漏旋转或算错回退，记“状态维护”错误。试卷的价值是逼迫你在**题目没有提示具体方法**的情况下仍能选对步骤，并且在 120 分钟内留出核对空间。
