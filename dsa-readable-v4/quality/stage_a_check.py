from pathlib import Path
import re, json, hashlib, subprocess, tempfile, heapq

root=Path(__file__).resolve().parents[1]
paths=[root/"chapters"/("ch%02d.md"%i) for i in range(16)]
extra=[root/"review"/x for x in ("00-plan.md","01-question-bank-a.md","02-question-bank-b.md","03-question-bank-c.md","04-mock-a.md","05-mock-b.md","06-new-mock-c.md","07-new-mock-d.md")]
assert all(p.exists() for p in paths+extra)
inventory={"chapters":[],"review":[]}
for p in paths:
    s=p.read_text(encoding="utf8")
    assert len(s)>=2500,(p.name,len(s))
    sections=len(re.findall(r"^## ",s,re.M))
    tasks=s.count('<details class="question">')
    assert sections>=6 and tasks>=4,(p.name,sections,tasks)
    ids=re.findall(r"\{#([a-z0-9-]+)\}",s)
    assert len(ids)==len(set(ids)),p.name
    inventory["chapters"].append({"name":p.name,"chars":len(s),"sections":sections,"questions":tasks,"sha256":hashlib.sha256(s.encode()).hexdigest()})
for p in extra:
    s=p.read_text(encoding="utf8")
    inventory["review"].append({"name":p.name,"chars":len(s),"questions":s.count('<details class="question">'),"sha256":hashlib.sha256(s.encode()).hexdigest()})
assert sum(x["questions"] for x in inventory["review"][:4])==68
assert sum(x["questions"] for x in inventory["review"][4:6])==24
assert sum(x["questions"] for x in inventory["review"][6:])==58
assert sum(x["questions"] for x in inventory["chapters"])>=80
assert [x["questions"] for x in inventory["review"][6:]]==[29,29]
for new_mock in extra[6:]:
    data=new_mock.read_text(encoding="utf8")
    assert sum((2 if n<=20 else 5 if n<=26 else 10) for n in range(1,30))==100
    assert data.count("#### 第 ")==29
    assert "BF＝左高－右高" in data or "BF＝左子树高度－右子树高度" in data
for src in extra[-2:]:
    s=src.read_text(encoding="utf8")
    assert "120 分钟" in s and "100 分" in s
    questions_only=s.split("## 第一部分",1)[-1]
    assert "线性探查" not in questions_only and "并查集" not in questions_only and "散列表" not in questions_only
inventory["counts"]={"chapters":16,"chapter_questions":sum(x["questions"] for x in inventory["chapters"]),"review_questions":68,"mock_questions":82}

fence=chr(96)*3
def codeblocks(source):
    return re.findall(r"~~~cpp\s*\n(.*?)\n~~~",source,re.S)+re.findall(re.escape(fence)+r"cpp\s*\n(.*?)\n"+re.escape(fence),source,re.S)
def compile_test(label,srcs,test):
    with tempfile.TemporaryDirectory() as temp:
        cpp=Path(temp)/"main.cpp";binary=Path(temp)/"run"
        cpp.write_text("\n\n".join(srcs)+"\n\n"+test,encoding="utf8")
        subprocess.run(["g++","-std=c++17","-O2","-Wall","-Wextra","-pedantic",str(cpp),"-o",str(binary)],check=True)
        subprocess.run([str(binary)],check=True)
    print("PASS",label)
def chapter(i):
    return paths[i].read_text(encoding="utf8")
assert len(codeblocks(chapter(7)))==3
compile_test("KMP",codeblocks(chapter(7)),'''
#include <cassert>
int main(){
    assert(naiveFind("ababac","abac")==2);
    assert((buildLps("aabaaca")==std::vector<int>{0,1,0,1,2,0,1}));
    assert(kmpFind("ababababca","abababca")==2);
    assert(kmpFind("abc","") == 0);
}''')
compile_test("heap",codeblocks(chapter(10)),'''
#include <cassert>
int main(){
    std::vector<int> a={9,7,8,3,5,6};
    pushMax(a,10);
    assert((a==std::vector<int>{10,7,9,3,5,6,8}));
    assert(popMax(a)==10);
    assert((a==std::vector<int>{9,7,8,3,5,6}));
    std::vector<int> one={5};assert(popMax(one)==5&&one.empty());
}''')
compile_test("Huffman",codeblocks(chapter(11)),'''
#include <cassert>
int main(){
    assert(huffmanWpl({15,3,14,2,6,9,16,17})==229);
    assert(huffmanWpl({2,3,5,8})==33);
}''')
compile_test("BST",codeblocks(chapter(13)),'''
#include <cassert>
int main(){
    Node* root=nullptr;
    int keys[]={5,2,8,1,3};for(int x:keys)root=insert(root,x);
    root=erase(root,2);
    assert(root->left->key==3&&root->left->left->key==1);
}''')
compile_test("AVL",codeblocks(chapter(14)),'''
#include <cassert>
int check(AvlNode* p,int lo,int hi){
 if(!p)return 0;
 assert(lo<p->key&&p->key<hi);
 int L=check(p->left,lo,p->key),R=check(p->right,p->key,hi);
 assert(R-L>=-1&&R-L<=1);assert(p->height==1+std::max(L,R));
 return p->height;
}
int main(){
 AvlNode* root=nullptr;
 for(int x:{30,10,20,40,50,25,35,45,60}){root=avlInsert(root,x);check(root,-10000,10000);}
 for(int x:{10,20,40,35,25,30,45,50,60}){root=avlDelete(root,x);check(root,-10000,10000);}
 assert(root==nullptr);
 for(int x:{2,1,4,3,5})root=avlInsert(root,x);
 root=avlDelete(root,1);check(root,-10000,10000);
 assert(root->key==4&&root->left->key==2);
}''')

# Targeted, executable regression cases for explanations introduced during
# the November textbook-style editorial pass.
compile_test("circular queue wraparound",codeblocks(chapter(5))[:1],'''
#include <cassert>
int main() {
    OneSlotQueue q(5); int x;
    assert(q.empty() && !q.pop(x));
    for (int v : {10,20,30,40}) assert(q.push(v));
    assert(q.full() && !q.push(99));
    assert(q.pop(x) && x == 10);
    assert(q.pop(x) && x == 20);
    assert(q.push(50) && q.push(60) && q.full());
    for (int v : {30,40,50,60}) {
        assert(q.pop(x) && x == v);
    }
    assert(q.empty());
}''')
assert len(codeblocks(chapter(6)))==2
compile_test("fast sparse transpose",codeblocks(chapter(6))[:1],'''
#include <cassert>
int main() {
    std::vector<Triple> a={{0,0,4},{0,3,8},{1,3,9},
                           {2,2,6},{3,0,7},{4,3,5}};
    auto b=fastTranspose(5,4,a);
    assert(b.rows==4 && b.cols==5 && b.terms.size()==6);
    const int rr[]={0,0,2,3,3,3};
    const int cc[]={0,3,2,0,1,4};
    const int vv[]={4,7,6,8,9,5};
    for (int k=0;k<6;++k) {
        assert(b.terms[k].row==rr[k]);
        assert(b.terms[k].col==cc[k]);
        assert(b.terms[k].value==vv[k]);
    }
    assert(fastTranspose(0,0,{}).terms.empty());
}''')
compile_test("orthogonal sparse insertion",codeblocks(chapter(6))[1:2],'''
#include <cassert>
int main() {
    OrthSparseMatrix a(3,4);
    a.put(2,3,9); a.put(2,1,7); a.put(0,2,5);
    a.put(2,1,8);
    assert((a.rowValues(2)==std::vector<int>{8,9}));
    assert((a.rowValues(0)==std::vector<int>{5}));
}''')
compile_test("inorder threaded tree",codeblocks(chapter(9)),'''
#include <cassert>
int main() {
    ThreadNode a{'A'}, b{'B'}, c{'C'}, d{'D'}, e{'E'};
    a.left=&b; a.right=&c; b.right=&d; c.left=&e;
    threadInorder(&a);
    assert(nextInorder(&b)==&d);
    assert(nextInorder(&d)==&a);
    assert(nextInorder(&a)==&e);
    assert(nextInorder(&e)==&c);
    assert(nextInorder(&c)==nullptr);
    assert(d.ltag==1 && d.left==&b);
    assert(e.ltag==1 && e.left==&a);
}''')
assert len(codeblocks(chapter(11)))==2
compile_test("Huffman tree and decode",codeblocks(chapter(11))[1:2],'''
#include <cassert>
int main() {
    auto tree=makeHuffman({{'A',5},{'B',2},{'C',9},{'D',6},{'E',3}});
    auto codes=makeCodes(tree.root);
    assert(codes.at('A')=="00" && codes.at('B')=="010");
    assert(codes.at('C')=="11" && codes.at('D')=="10");
    assert(codes.at('E')=="011");
    assert(decodeCodes(tree.root,"0101100")=="BCA");
    auto one=makeHuffman({{'Z',4}});
    assert(makeCodes(one.root).at('Z')=="0");
    assert(decodeCodes(one.root,"000")=="ZZZ");
}''')

# The V3 hash class implementations were independently compiled in their own release CI.
h=[15,3,14,2,6,9,16,17];heapq.heapify(h);wpl=0
while len(h)>1:
    x=heapq.heappop(h)+heapq.heappop(h);wpl+=x;heapq.heappush(h,x)
assert wpl==229
(root/"quality"/"stage-a-manifest.json").write_text(json.dumps(inventory,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
print("PASS stage A manuscript inventory:",json.dumps(inventory["counts"],ensure_ascii=False))
