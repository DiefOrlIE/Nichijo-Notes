"""Independent check: hash chapter C++ examples and numeric exam exercises."""
from pathlib import Path
import heapq, re, subprocess, tempfile
root=Path(__file__).resolve().parents[2]/"dsa-midterm"
text=(root/"v2/chapters/ch15.md").read_text(encoding="utf8")
blocks=re.findall(r"\x60{3}cpp\n(.*?)\n\x60{3}",text,flags=re.S)
assert len(blocks)>=2
program="\n".join(blocks[:2])+"""
#include <cassert>
int main(){
    BitSet a(16),b(16);
    a.add(2);a.add(5);b.add(5);b.add(9);
    assert(a.contains(2) && !a.contains(9));
    assert(a.intersection(b).contains(5));
    assert(!a.intersection(b).contains(2));
    assert(a.unite(b).contains(9));
    assert(a.intersection(b).subsetOf(a));
    a.erase(2);assert(!a.contains(2));
    DSU d(7);
    d.unite(0,1);d.unite(2,3);d.unite(4,5);
    d.unite(1,3);d.unite(5,6);d.unite(0,6);
    assert(d.find(6)==0 && d.sizeOf(0)==7 && d.same(1,6));
}
"""
with tempfile.TemporaryDirectory() as tmp:
    src=Path(tmp)/"test.cpp";exe=Path(tmp)/"test"
    src.write_text(program,encoding="utf8")
    subprocess.run(["g++","-std=c++17","-Wall","-Wextra","-pedantic",str(src),"-o",str(exe)],check=True)
    subprocess.run([str(exe)],check=True)
print("PASS: BitSet and DSU C++17 compile and runtime.")

def linear(keys,m,p):
    a=[None]*m;success=[]
    for k in keys:
        for i in range(m):
            pos=(k%p+i)%m
            if a[pos] is None:a[pos]=k;success.append(i+1);break
        else:raise AssertionError("table full")
    failure=[]
    for first in range(p):
        for i in range(m):
            if a[(first+i)%m] is None:failure.append(i+1);break
        else:raise AssertionError("no blank")
    return a,success,failure
a,c,f=linear([89,18,49,58,69],10,10)
assert a==[49,58,69,None,None,None,None,None,18,89]
assert c==[1,1,2,4,4] and f==[4,3,2,1,1,1,1,1,6,5]
a,c,f=linear([10,17,24,5],7,7)
assert a==[None,None,None,10,17,24,5] and c==[1,2,3,2]
assert f==[1,1,1,5,4,3,2]
print("PASS: Hash insertion and successful/failed ASL probe paths.")

h=[15,3,14,2,6,9,16,17];heapq.heapify(h);cost=0
while len(h)>1:
    a=heapq.heappop(h);b=heapq.heappop(h)
    cost+=a+b;heapq.heappush(h,a+b)
assert cost==229
print("PASS: Huffman WPL=229.")

def lps(p):
    a=[0]*len(p);k=0;i=1
    while i<len(p):
        if p[i]==p[k]:k+=1;a[i]=k;i+=1
        elif k:k=a[k-1]
        else:i+=1
    return a
assert lps("aabaaca")==[0,1,0,1,2,0,1]
assert lps("abababca")==[0,0,1,2,3,4,0,1]
print("PASS: KMP prefix table and fallback.")

def max_heap(xs):
    a=[]
    for x in xs:
        a.append(x);i=len(a)-1
        while i>0 and a[(i-1)//2]<a[i]:
            p=(i-1)//2;a[p],a[i]=a[i],a[p];i=p
    return a
assert max_heap([1,2,5,8,3,6,10,14])==[14,10,8,5,3,2,6,1]
print("PASS: Maximum heap insert-by-insert simulation.")
