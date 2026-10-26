# 期中专项题库（第 1 组）：结构、复杂度、栈递归、队列

> 定位：闭卷复习。题目默认已学完相应正文章节，不在题面提示应使用哪种具体算法。每道题可单独展开“入手思路、完整解答、易错点”。

## 指针与链表改接

<details class="question"><summary>第 1 题 · 读代码｜int a=4,b=6; int* p=&a; int*& r=p; r=&b; *p=9。a、b 的最后值？</summary>
<p><strong>如何入手：</strong>r 是指针变量 p 的引用。</p>
<p><strong>推导与答案：</strong>r=&b 将 p 改为指向 b，*p=9 修改 b。a=4，b=9。</p>
<p><strong>典型错误：</strong>把引用指针误解成复制了整数。</p>
</details>

<details class="question"><summary>第 2 题 · 程序填空｜将结点 x 插到结点 p 与原 p->next 之间，要求不断链。</summary>
<p><strong>如何入手：</strong>先存原后继，再改 p 的边。</p>
<p><strong>推导与答案：</strong>x->next=p->next; p->next=x;。画图可验证原后继仍通过 x 可达。</p>
<p><strong>典型错误：</strong>先修改 p->next 导致旧后继地址丢失。</p>
</details>

<details class="question"><summary>第 3 题 · 手工模拟｜链表 A=1→3→8，B=2→3→6，原地头插合并成非递增链。</summary>
<p><strong>如何入手：</strong>每次取当前最小结点头插。</p>
<p><strong>推导与答案：</strong>取出顺序 1,2,3,3,6,8；结果 8→6→3→3→2→1。时间 Θ(m+n)，额外空间 Θ(1)。</p>
<p><strong>典型错误：</strong>相等时跳过一条链的 3。</p>
</details>

<details class="question"><summary>第 4 题 · 边界分析｜为什么删除单链表尾结点不能只靠该结点地址 O(1) 完成？</summary>
<p><strong>如何入手：</strong>尾结点没有后继可复制，也没有指回前驱的链接。</p>
<p><strong>推导与答案：</strong>需要从头找到其前驱，更新前驱 next，再 delete 尾项；通常 Θ(n)，除非同时保存前驱或使用双向链表。</p>
<p><strong>典型错误：</strong>把非尾结点的复制后继技巧错误推广到尾结点。</p>
</details>

<details class="question"><summary>第 5 题 · 写算法｜写 Node* reverse(Node* head) 的 4 行循环主体。</summary>
<p><strong>如何入手：</strong>保存未处理后半段。</p>
<p><strong>推导与答案：</strong>next=cur->next; cur->next=prev; prev=cur; cur=next;，初始 prev=nullptr,cur=head，最后返回 prev；时间 Θ(n)，额外空间 Θ(1)。</p>
<p><strong>典型错误：</strong>交换了指向但没有保存 next。</p>
</details>

<details class="question"><summary>第 6 题 · 结构选择｜经常按第 i 项随机读取，而只偶尔尾部追加，顺序表或单链表优先谁？</summary>
<p><strong>如何入手：</strong>比较主要操作而不是只看插入复杂度。</p>
<p><strong>推导与答案：</strong>顺序表；按索引 O(1)，有容量或动态扩容时尾追加通常均摊 O(1)。单链按第 i 项读取要沿链 O(i)。</p>
<p><strong>典型错误：</strong>笼统认为链表插入快所以任何时候都更好。</p>
</details>

## 复杂度、证明与代码阅读

<details class="question"><summary>第 7 题 · 精确次数｜for(i=0;i<n;i++) for(j=0;j<=i;j++) cnt++; 结果？</summary>
<p><strong>如何入手：</strong>第 i 轮内循环执行 i+1 次。</p>
<p><strong>推导与答案：</strong>Σ(i+1) 从 i=0 到 n−1 为 n(n+1)/2，故 Θ(n²)。</p>
<p><strong>典型错误：</strong>把 <= 误看成 <，少算一整行。</p>
</details>

<details class="question"><summary>第 8 题 · 渐进阶｜T(n)=2T(n/2)+n，n 为 2 的幂，时间阶和递归深度？</summary>
<p><strong>如何入手：</strong>按层累计工作量。</p>
<p><strong>推导与答案：</strong>每层总工作 n，共 log₂n 层，加叶子成本，时间 Θ(nlog n)；单条调用深度 Θ(log n)。</p>
<p><strong>典型错误：</strong>把总递归调用数当成栈空间。</p>
</details>

<details class="question"><summary>第 9 题 · 渐进阶｜for(int i=1;i<n;i*=3) for(int j=0;j<n;++j) work(); 时间？</summary>
<p><strong>如何入手：</strong>外层约 log₃n 轮，内层每轮 n 次。</p>
<p><strong>推导与答案：</strong>Θ(nlog n)，对数底不同不影响阶。</p>
<p><strong>典型错误：</strong>看见两层就直接写 n²。</p>
</details>

<details class="question"><summary>第 10 题 · 比较对象｜某程序求和数组 n 个值后再递归调用一次 F(n−1)，T(n)=T(n−1)+n。阶？</summary>
<p><strong>如何入手：</strong>写等差和。</p>
<p><strong>推导与答案：</strong>T(n)=Σ k=Θ(n²)，递归深度 Θ(n)。</p>
<p><strong>典型错误：</strong>一处递归调用并不保证线性时间。</p>
</details>

<details class="question"><summary>第 11 题 · 空间｜递归前序遍历一棵 n 结点、树高 h 的二叉树，时间与栈空间？</summary>
<p><strong>如何入手：</strong>所有结点访问一次，同时活动帧数受高度约束。</p>
<p><strong>推导与答案：</strong>时间 Θ(n)，递归栈空间 O(h)；链状树 h=Θ(n)，近似平衡树 h=Θ(log n)。</p>
<p><strong>典型错误：</strong>按树的总结点数直接写 O(n) 栈空间紧确界。</p>
</details>

<details class="question"><summary>第 12 题 · 证明｜证明非空二叉树度为 0 的结点比度为 2 的结点多 1。</summary>
<p><strong>如何入手：</strong>从父子边总数计算两次。</p>
<p><strong>推导与答案：</strong>n=n0+n1+n2，边数 n−1；各结点提供的边数为 n1+2n2；令相等解出 n0=n2+1。</p>
<p><strong>典型错误：</strong>只引用结论不给推导。</p>
</details>

## 栈、表达式和递归

<details class="question"><summary>第 13 题 · 手工模拟｜入栈顺序 1,2,3,4,5，出栈顺序 3,2,5,4,1 可行吗？</summary>
<p><strong>如何入手：</strong>写入/出操作事件。</p>
<p><strong>推导与答案：</strong>I1 I2 I3 O3 O2 I4 I5 O5 O4 O1，可行。</p>
<p><strong>典型错误：</strong>只写一个“可”不给证明轨迹。</p>
</details>

<details class="question"><summary>第 14 题 · 后缀表达式｜(A+B)*C−D/E 的后缀是什么？</summary>
<p><strong>如何入手：</strong>括号优先，乘与除先于减。</p>
<p><strong>推导与答案：</strong>A B + C * D E / -。</p>
<p><strong>典型错误：</strong>A+B 的加号必须在乘号之前输出。</p>
</details>

<details class="question"><summary>第 15 题 · 求值｜后缀 8 2 / 3 4 * + 5 - 的值？</summary>
<p><strong>如何入手：</strong>扫描操作数入栈，弹出时后弹为左操作数。</p>
<p><strong>推导与答案：</strong>8/2=4，3*4=12，4+12−5=11。</p>
<p><strong>典型错误：</strong>8/2 写成 2/8。</p>
</details>

<details class="question"><summary>第 16 题 · 一元运算｜! ( A && B ) || C 的后缀写法？</summary>
<p><strong>如何入手：</strong>把逻辑非作为只取一个操作数的一元运算。</p>
<p><strong>推导与答案：</strong>A B && ! C ||。</p>
<p><strong>典型错误：</strong>把 ! 与减法混成二元操作。</p>
</details>

<details class="question"><summary>第 17 题 · 递归手算｜按 A(0,n)=n+1、A(m,0)=A(m−1,1)、A(m,n)=A(m−1,A(m,n−1))，求 A(2,2)。</summary>
<p><strong>如何入手：</strong>先得到 A(1,n)=n+2。</p>
<p><strong>推导与答案：</strong>A(2,0)=3，A(2,1)=A(1,3)=5，A(2,2)=A(1,5)=7。</p>
<p><strong>典型错误：</strong>先外层计算，遗漏嵌套参数。</p>
</details>

<details class="question"><summary>第 18 题 · 递归证明｜函数 f(n) 在 n=0 返回 1，否则返回 n*f(n−1)。说明正确性证明三段是什么？</summary>
<p><strong>如何入手：</strong>数学归纳法对应函数结构。</p>
<p><strong>推导与答案：</strong>基例 0!=1；归纳假设 f(n−1)=(n−1)!；归纳步 n*f(n−1)=n!，且 n 向 0 下降终止。</p>
<p><strong>典型错误：</strong>只写终止，不解释返回值怎样正确组合。</p>
</details>

## 队列与应用

<details class="question"><summary>第 19 题 · 循环队列｜m=8、浪费一格，front=6、rear=3，当前队长及最大容量？</summary>
<p><strong>如何入手：</strong>(rear−front+m)%m。</p>
<p><strong>推导与答案：</strong>队长 5，最大可存 m−1=7。</p>
<p><strong>典型错误：</strong>误用 front/count 方案的满容量公式。</p>
</details>

<details class="question"><summary>第 20 题 · 循环队列｜m=6、front=5、count=4 的循环队列下一入队地址？</summary>
<p><strong>如何入手：</strong>(front+count)%m。</p>
<p><strong>推导与答案：</strong>(5+4)%6=3；入队后 count=5，仍未满。</p>
<p><strong>典型错误：</strong>把 rear 当实体已存的索引。</p>
</details>

<details class="question"><summary>第 21 题 · 手工模拟｜m=4、front/count 版从空入 A,B,C,D，出两项，再入 E,F，最后有效队列？</summary>
<p><strong>如何入手：</strong>front 在出队时回绕，count 减后再增。</p>
<p><strong>推导与答案：</strong>front=2,count=4，按队首至队尾为 C,D,E,F。</p>
<p><strong>典型错误：</strong>入 E 时写下标 4 而不取模回绕到 0。</p>
</details>

<details class="question"><summary>第 22 题 · 代码填空｜队列的满条件用 count==m；入队新项应该写 data[?]，然后修改什么？</summary>
<p><strong>如何入手：</strong>下一空位离 front 恰 count 步。</p>
<p><strong>推导与答案：</strong>data[(front+count)%m]=x; ++count;，前提是 count<m。</p>
<p><strong>典型错误：</strong>先增加 count 再定位导致跳过一格。</p>
</details>

<details class="question"><summary>第 23 题 · 应用｜二叉树层序遍历为什么用队列，不用栈？</summary>
<p><strong>如何入手：</strong>下一步应处理谁：最早发现的还是最近发现的？</p>
<p><strong>推导与答案：</strong>先访问父层结点，再访问后面发现的子层结点，队列 FIFO 保证按层；栈更适合 DFS。</p>
<p><strong>典型错误：</strong>把栈操作顺序当作层序。</p>
</details>

<details class="question"><summary>第 24 题 · 均摊｜两栈实现队列为何某次出队 O(n) 而均摊 O(1)？</summary>
<p><strong>如何入手：</strong>每个元素被倒栈次数有限。</p>
<p><strong>推导与答案：</strong>当输出栈空时一次搬移 n 项可能 Θ(n)，但每元素只被压入/弹出各栈常数次，整串 m 次操作总 O(m)，均摊 O(1)。</p>
<p><strong>典型错误：</strong>均摊与单次最坏写成同义。</p>
</details>
