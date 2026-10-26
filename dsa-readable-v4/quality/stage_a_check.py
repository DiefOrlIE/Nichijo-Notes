from pathlib import Path
import re, json, hashlib, subprocess, tempfile, heapq

root=Path(__file__).resolve().parents[1]
paths=[root/"chapters"/("ch%02d.md"%i) for i in range(16)]
extra=[root/"review"/x for x in ("00-plan.md","01-question-bank-a.md","02-question-bank-b.md","03-question-bank-c.md","04-mock-a.md","05-mock-b.md")]
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
assert sum(x["questions"] for x in inventory["review"][4:])==24
assert sum(x["questions"] for x in inventory["chapters"])>=80
for src in extra[-2:]:
    s=src.read_text(encoding="utf8")
    assert "120 分钟" in s and "100 分" in s
    assert "线性探查" not in s and "并查集" not in s and "散列表" not in s
inventory["counts"]={"chapters":16,"chapter_questions":sum(x["questions"] for x in inventory["chapters"]),"review_questions":68,"mock_questions":24}

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
    for(int x:{5,2,8,1,3})root=insert(root,x);
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
# The V3 hash class implementations were independently compiled in their own release CI.
h=[15,3,14,2,6,9,16,17];heapq.heapify(h);wpl=0
while len(h)>1:
    x=heapq.heappop(h)+heapq.heappop(h);wpl+=x;heapq.heappush(h,x)
assert wpl==229
(root/"quality"/"stage-a-manifest.json").write_text(json.dumps(inventory,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
print("PASS stage A manuscript inventory:",json.dumps(inventory["counts"],ensure_ascii=False))
