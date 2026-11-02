# 期中专项题库（第 1 组）：结构、复杂度、栈递归、队列

这一组练习依次训练指针与链表的操作状态、基本复杂度推导、栈与递归的调用顺序，以及循环队列的边界。读题时先确认对象和约定：`p` 究竟指向哪个结点？`top` 指向已用位置还是下一空格？`front` 表示队首还是队首之前？这些明确以后，算法过程就可以按实际赋值与操作一步步追踪。

建议每个专题先在纸上独立解答，再展开讲评。参考答案给出结果之后，还会解释怎样复核、什么条件下同一方法会失效。

## 指针与链表改接



#### 第 1 题 · 读代码

**题目。** 在同一个 C++ 函数中依次执行 `int a=4,b=6; int* p=&a; int*& r=p; r=&b; *p=9;`。所有变量在执行期间均有效。请指出最后 `a`、`b` 的值以及 `p` 指向的对象，并解释 `r=&b` 修改了什么。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>r 是指针变量 p 的引用。</p>
<p><strong>推导与答案：</strong>r=&b 将 p 改为指向 b，*p=9 修改 b。a=4，b=9。</p>
<p><strong>典型错误：</strong>把引用指针误解成复制了整数。</p>

<p><strong>进一步理解：</strong>把对象与指针分开追踪：`r` 是 `p` 的别名，所以赋值后 `p` 指向 b；只有执行 `*p=9` 时才改变 b。可在纸上画两个整数方框和一根 `p` 箭头验证。</p>
</details>



#### 第 2 题 · 程序填空

**题目。** 在带有 `next` 指针的单链表中，指针 `p` 指向一个已存在的结点，`x` 指向一个尚未接入链表的新结点。请写出把 `x` 插到 `p` 与原后继之间的两条赋值语句，并解释赋值顺序为何重要。允许 `p->next` 原本为空。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>先存原后继，再改 p 的边。</p>
<p><strong>推导与答案：</strong>x->next=p->next; p->next=x;。画图可验证原后继仍通过 x 可达。</p>
<p><strong>典型错误：</strong>先修改 p->next 导致旧后继地址丢失。</p>

<p><strong>进一步理解：</strong>执行 `x-&gt;next=p-&gt;next` 时旧后继仍可通过 x 找到，第二句才把 p 与 x 接上。若顺序反过来，旧后继地址可能被覆盖。</p>
</details>



#### 第 3 题 · 手工模拟

**题目。** 有两条互不共享结点的升序单链表 A：1→3→8，B：2→3→6。只允许重接已有结点的 `next` 指针，不创建数据结点；请将两条链合并为非递增顺序，写出取结点的顺序和最终链表，分析时间与额外空间。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>每次取当前最小结点头插。</p>
<p><strong>推导与答案：</strong>取出顺序 1,2,3,3,6,8；结果 8→6→3→3→2→1。时间 Θ(m+n)，额外空间 Θ(1)。</p>
<p><strong>典型错误：</strong>相等时跳过一条链的 3。</p>

<p><strong>进一步理解：</strong>先由两个表头中选较小结点，依次摘取 1、2、3、3、6、8 并头插，因此输出顺序反过来成为 8→6→3→3→2→1。两个值为 3 的结点都要保留。</p>
</details>



#### 第 4 题 · 边界分析

**题目。** 单链表只保存指向后继的 `next`，现持有待删除尾结点的指针，手中没有头指针和前驱指针。解释为什么通常无法仅凭这个指针在 O(1) 时间内把尾结点安全地从链表中摘除；补充需要什么信息。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>尾结点没有后继可复制，也没有指回前驱的链接。</p>
<p><strong>推导与答案：</strong>需要从头找到其前驱，更新前驱 next，再 delete 尾项；通常 Θ(n)，除非同时保存前驱或使用双向链表。</p>
<p><strong>典型错误：</strong>把非尾结点的复制后继技巧错误推广到尾结点。</p>

<p><strong>进一步理解：</strong>由于尾结点没有可复制的后继，它无法沿 `next` 找到自己的前驱。没有头指针、双向前驱或外部索引时，缺失用于修改前驱链接的信息。</p>
</details>



#### 第 5 题 · 写算法

**题目。** 结点类型为 `struct Node {int value; Node* next;};`。写出 `Node* reverse(Node* head)` 的循环核心，要求原地逆置单链表（允许空链表），最后返回新的表头。说明 `prev`、`cur`、`next` 初值与每次操作顺序。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>保存未处理后半段。</p>
<p><strong>推导与答案：</strong>next=cur->next; cur->next=prev; prev=cur; cur=next;，初始 prev=nullptr,cur=head，最后返回 prev；时间 Θ(n)，额外空间 Θ(1)。</p>
<p><strong>典型错误：</strong>交换了指向但没有保存 next。</p>

<p><strong>进一步理解：</strong>关键不变量：`prev` 指向已逆置部分，`cur` 指向尚未处理部分第一个结点。每轮必须先保存原后继，最后再令 `cur=next`，否则尚未处理链表可能丢失。</p>
</details>



#### 第 6 题 · 结构选择

**题目。** 某学生档案需要频繁按下标读取第 i 条记录，仅偶尔在末尾追加，且预留或动态扩容的存储空间充足。应优先选择顺序表还是单链表？请用两种操作的时间代价解释。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>比较主要操作而不是只看插入复杂度。</p>
<p><strong>推导与答案：</strong>顺序表；按索引 O(1)，有容量或动态扩容时尾追加通常均摊 O(1)。单链按第 i 项读取要沿链 O(i)。</p>
<p><strong>典型错误：</strong>笼统认为链表插入快所以任何时候都更好。</p>

<p><strong>进一步理解：</strong>比较主要操作：顺序表按下标取元素 O(1)，单链表要从头向后走到第 i 项，代价 O(i)。若偶尔尾追加且可扩容，顺序表具备合适的均摊性能。</p>
</details>

## 复杂度、证明与代码阅读



#### 第 7 题 · 精确次数

**题目。** 设 n 为非负整数，`cnt` 初值为 0。运行 `for(int i=0;i<n;i++) for(int j=0;j<=i;j++) cnt++;`，请给出 `cnt` 的精确值及其关于 n 的渐进时间阶，并说明内层循环为何执行 i+1 次。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>第 i 轮内循环执行 i+1 次。</p>
<p><strong>推导与答案：</strong>Σ(i+1) 从 i=0 到 n−1 为 n(n+1)/2，故 Θ(n²)。</p>
<p><strong>典型错误：</strong>把 <= 误看成 <，少算一整行。</p>

<p><strong>进一步理解：</strong>第 i 次外循环的 j 值依次为 0…i，共 i+1 项，因此总数为 1+2+…+n=n(n+1)/2。n=0 时循环不执行，公式也得到 0。</p>
</details>



#### 第 8 题 · 渐进阶

**题目。** 设 n 为 2 的正整数次幂，递推式 `T(n)=2T(n/2)+n`，且 `T(1)=Θ(1)`。求总时间复杂度和递归调用栈的最大深度，并通过分层工作量解释结论。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>按层累计工作量。</p>
<p><strong>推导与答案：</strong>每层总工作 n，共 log₂n 层，加叶子成本，时间 Θ(nlog n)；单条调用深度 Θ(log n)。</p>
<p><strong>典型错误：</strong>把总递归调用数当成栈空间。</p>

<p><strong>进一步理解：</strong>在第 k 层有 2^k 个规模 n/2^k 的子问题，总工作量 2^k·(n/2^k)=n；非叶层数为 log₂n，叶层总工作仍 Θ(n)。空间只计单条活动调用路径。</p>
</details>



#### 第 9 题 · 渐进阶

**题目。** 设 n≥2，程序执行 `for(int i=1;i<n;i*=3) for(int j=0;j<n;++j) work();`，其中 `work()` 代价为 Θ(1)。求整个程序的时间复杂度，并说明外层执行次数。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>外层约 log₃n 轮，内层每轮 n 次。</p>
<p><strong>推导与答案：</strong>Θ(nlog n)，对数底不同不影响阶。</p>
<p><strong>典型错误：</strong>看见两层就直接写 n²。</p>

<p><strong>进一步理解：</strong>外层的 i 依次为 1、3、9…，达到 n 即结束，因此执行 Θ(log₃n) 轮；每轮内层又做 n 次常数工作，乘起来得到 Θ(nlog n)。</p>
</details>



#### 第 10 题 · 比较对象

**题目。** 递归程序在规模为 n 的一层先扫描 n 个元素，再调用一次规模 n−1 的子问题，`T(n)=T(n−1)+n`，且 `T(1)=Θ(1)`。求时间复杂度与最大递归深度。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>写等差和。</p>
<p><strong>推导与答案：</strong>T(n)=Σ k=Θ(n²)，递归深度 Θ(n)。</p>
<p><strong>典型错误：</strong>一处递归调用并不保证线性时间。</p>

<p><strong>进一步理解：</strong>展开递推得到 n+(n−1)+…+1，总成本是等差数列的和；同时，每次只打开一层规模减少 1 的调用，最大活动深度为 Θ(n)。</p>
</details>



#### 第 11 题 · 空间

**题目。** 一棵非空二叉树含 n 个结点，高度为 h（以根到最深叶的结点数计）。递归前序遍历依次访问全部结点，求时间复杂度与递归栈最大占用，并分别讨论链状树和高度平衡的情形。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>所有结点访问一次，同时活动帧数受高度约束。</p>
<p><strong>推导与答案：</strong>时间 Θ(n)，递归栈空间 O(h)；链状树 h=Θ(n)，近似平衡树 h=Θ(log n)。</p>
<p><strong>典型错误：</strong>按树的总结点数直接写 O(n) 栈空间紧确界。</p>

<p><strong>进一步理解：</strong>每个结点被访问一次，时间 Θ(n)。栈同时保存的是当前根到正在访问位置的一条路径，空间随高度 h 增长，而不需要同时存储所有 n 个调用。</p>
</details>



#### 第 12 题 · 证明

**题目。** 证明：任意非空二叉树中，度为 0 的结点数 n₀ 与度为 2 的结点数 n₂ 满足 n₀=n₂+1。请从父子边数的两个计数角度完成推导。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>从父子边总数计算两次。</p>
<p><strong>推导与答案：</strong>n=n0+n1+n2，边数 n−1；各结点提供的边数为 n1+2n2；令相等解出 n0=n2+1。</p>
<p><strong>典型错误：</strong>只引用结论不给推导。</p>

<p><strong>进一步理解：</strong>把每条父子边按父结点的孩子数计得到 n₁+2n₂，再按每个非根结点恰有一个父亲计得到 n₀+n₁+n₂−1。两式相等后消掉 n₁ 即可。</p>
</details>

## 栈、表达式和递归



#### 第 13 题 · 手工模拟

**题目。** 车厢只能按 1、2、3、4、5 的顺序进入一个容量足够的栈式旁线，每次可压入下一节或弹出当前栈顶。判断 3、2、5、4、1 能否作为完整出栈序列，并给出逐步入栈/出栈轨迹。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>写入/出操作事件。</p>
<p><strong>推导与答案：</strong>I1 I2 I3 O3 O2 I4 I5 O5 O4 O1，可行。</p>
<p><strong>典型错误：</strong>只写一个“可”不给证明轨迹。</p>

<p><strong>进一步理解：</strong>验证可行性时，模拟操作必须始终保持输入顺序固定，并保证每个 O 操作都弹出当时的栈顶。最后栈应为空且五节车厢全部输出。</p>
</details>



#### 第 14 题 · 后缀表达式

**题目。** 表达式 `(A+B)*C−D/E` 只有二元加减乘除与括号，乘除优先于加减。把它转换为后缀表达式，保留所有操作数与运算符的先后次序。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>括号优先，乘与除先于减。</p>
<p><strong>推导与答案：</strong>A B + C * D E / -。</p>
<p><strong>典型错误：</strong>A+B 的加号必须在乘号之前输出。</p>

<p><strong>进一步理解：</strong>先将 `(A+B)` 转成 `A B +`，与 C 相乘得到 `A B + C *`，另将 `D/E` 写成 `D E /`，最后输出减号。</p>
</details>



#### 第 15 题 · 求值

**题目。** 按从左到右扫描并使用操作数栈，计算后缀表达式 `8 2 / 3 4 * + 5 -` 的值。说明除法和减法弹出操作数时谁在左、谁在右。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>扫描操作数入栈，弹出时后弹为左操作数。</p>
<p><strong>推导与答案：</strong>8/2=4，3*4=12，4+12−5=11。</p>
<p><strong>典型错误：</strong>8/2 写成 2/8。</p>

<p><strong>进一步理解：</strong>遇到二元运算符，先弹出的是右操作数，后弹出的是左操作数。计算过程为 8/2=4、3×4=12、4+12=16、16−5=11。</p>
</details>



#### 第 16 题 · 一元运算

**题目。** 表达式 `!(A&&B)||C` 中，`!` 为一元逻辑非，`&&` 优先于 `||`，变量均为单字符操作数。写出保持相同计算语义的后缀表达式。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>把逻辑非作为只取一个操作数的一元运算。</p>
<p><strong>推导与答案：</strong>A B && ! C ||。</p>
<p><strong>典型错误：</strong>把 ! 与减法混成二元操作。</p>

<p><strong>进一步理解：</strong>先对 A、B 执行 `&amp;&amp;`，再对这一布尔结果执行单目 `!`，最后才与 C 执行 `||`。后缀式的运算符位置体现真实求值顺序。</p>
</details>



#### 第 17 题 · 递归手算

**题目。** 函数 A 对非负整数按下式定义：A(0,n)=n+1；m>0 时 A(m,0)=A(m−1,1)；m>0、n>0 时 A(m,n)=A(m−1,A(m,n−1))。请逐层求出 A(2,2)，展示必要的嵌套调用。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>先得到 A(1,n)=n+2。</p>
<p><strong>推导与答案：</strong>A(2,0)=3，A(2,1)=A(1,3)=5，A(2,2)=A(1,5)=7。</p>
<p><strong>典型错误：</strong>先外层计算，遗漏嵌套参数。</p>

<p><strong>进一步理解：</strong>先由 A(0,n)=n+1 推出 A(1,n)=n+2，再推得 A(2,0)=3、A(2,1)=5、A(2,2)=7。嵌套式的内层返回值必须先计算。</p>
</details>



#### 第 18 题 · 递归证明

**题目。** 函数 `f(0)=1`，当 n>0 时返回 `n*f(n−1)`。请用数学归纳法解释它对所有非负整数 n 返回 n!，明确基例、归纳假设、归纳步骤和终止依据。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>数学归纳法对应函数结构。</p>
<p><strong>推导与答案：</strong>基例 0!=1；归纳假设 f(n−1)=(n−1)!；归纳步 n*f(n−1)=n!，且 n 向 0 下降终止。</p>
<p><strong>典型错误：</strong>只写终止，不解释返回值怎样正确组合。</p>

<p><strong>进一步理解：</strong>基例验证 `f(0)=0!`；归纳假设成立时 `f(n)=n·(n−1)!=n!`。每次递归使 n 下降，最终到达 0。</p>
</details>

## 队列与应用



#### 第 19 题 · 循环队列

**题目。** 一个长度 m=8 的循环队列只保存 `front` 和 `rear`，采用牺牲一格方案；`front` 指队首、`rear` 指下一空位，当前二者分别为 6、3。求有效元素个数和队列最大容量。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>(rear−front+m)%m。</p>
<p><strong>推导与答案：</strong>队长 5，最大可存 m−1=7。</p>
<p><strong>典型错误：</strong>误用 front/count 方案的满容量公式。</p>

<p><strong>进一步理解：</strong>由于 `rear` 指向下一空位且保留一个槽位，实际长度为 `(rear-front+m)%m=(3-6+8)%8=5`，最大容量为 m−1=7。</p>
</details>



#### 第 20 题 · 循环队列

**题目。** 一个长度 m=6 的循环队列采用 `front`、`count` 表示，允许使用全部六格；现 `front=5`、`count=4`。求下次成功入队将写入的数组下标、入队后 count 的值以及是否已满。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>(front+count)%m。</p>
<p><strong>推导与答案：</strong>(5+4)%6=3；入队后 count=5，仍未满。</p>
<p><strong>典型错误：</strong>把 rear 当实体已存的索引。</p>

<p><strong>进一步理解：</strong>本方案的写入下标就是 `(front+count)%m=(5+4)%6=3`；写入后 count=5，尚余一格。`rear` 无需作为独立状态存储。</p>
</details>



#### 第 21 题 · 手工模拟

**题目。** 长度 m=4 的 `front/count` 循环队列初始为空、front=0。依次入队 A、B、C、D，出队两次，再入队 E、F。要求写出最终 `front`、`count` 及从队首到队尾的元素顺序。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>front 在出队时回绕，count 减后再增。</p>
<p><strong>推导与答案：</strong>front=2,count=4，按队首至队尾为 C,D,E,F。</p>
<p><strong>典型错误：</strong>入 E 时写下标 4 而不取模回绕到 0。</p>

<p><strong>进一步理解：</strong>前三步填满数组，出队两次后 front=2、count=2，随后 E、F 写到下标 0、1。最终有效顺序 C、D、E、F，与物理下标的大小顺序无关。</p>
</details>



#### 第 22 题 · 代码填空

**题目。** 长度为 m 的循环队列以 `front` 指队首、`count` 指元素数，入队前已确认 `count<m`。请填写新元素 x 应写入 `data` 的哪个下标，以及写入后如何更新 `count`。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>下一空位离 front 恰 count 步。</p>
<p><strong>推导与答案：</strong>data[(front+count)%m]=x; ++count;，前提是 count<m。</p>
<p><strong>典型错误：</strong>先增加 count 再定位导致跳过一格。</p>

<p><strong>进一步理解：</strong>当 count&lt;m 时，新元素应放到队首之后的第 count 个环形位置，故 `data[(front+count)%m]=x`，之后 `++count`。若先加 count，会错开一格。</p>
</details>



#### 第 23 题 · 应用

**题目。** 采用树的层序遍历（根先访问、各层从左到右），应把尚未访问的结点保存在队列还是栈中？用根 A、孩子 B/C、B 的孩子 D/E 的例子解释处理顺序。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>下一步应处理谁：最早发现的还是最近发现的？</p>
<p><strong>推导与答案：</strong>先访问父层结点，再访问后面发现的子层结点，队列 FIFO 保证按层；栈更适合 DFS。</p>
<p><strong>典型错误：</strong>把栈操作顺序当作层序。</p>

<p><strong>进一步理解：</strong>访问 A 后先把 B、C 入队。弹出 B 后队列变成 C、D、E，因此先访问 C 再访问 D/E，恰好形成按层展开的顺序。</p>
</details>



#### 第 24 题 · 均摊

**题目。** 用两个栈 `in`、`out` 实现 FIFO 队列：入队压入 `in`；出队时若 `out` 为空，就将 `in` 的元素依次搬过去。分析一次出队的最坏时间及一长串入队、出队操作的均摊时间，说明为何两者不同。

<details class="question"><summary>查看思路与解答</summary>
<p><strong>如何入手：</strong>每个元素被倒栈次数有限。</p>
<p><strong>推导与答案：</strong>当输出栈空时一次搬移 n 项可能 Θ(n)，但每元素只被压入/弹出各栈常数次，整串 m 次操作总 O(m)，均摊 O(1)。</p>
<p><strong>典型错误：</strong>均摊与单次最坏写成同义。</p>

<p><strong>进一步理解：</strong>单次搬移一整栈时可能需要 Θ(n)，但每个元素进入 `in`、转入 `out`、弹出 `out` 的次数都是常数，整段操作可摊销到每个元素上。</p>
</details>
