from pathlib import Path
from collections import deque
import re
import subprocess
import tempfile

root=Path(__file__).resolve().parent
s=(root/'manuscripts/ch15.md').read_text(encoding='utf8')
assert len(re.findall(r'^## ',s,flags=re.M))==15
blocks=re.findall(r'```cpp\n(.*?)\n```',s,flags=re.S)
classes=[]
for key in ('class BitSet','class DSU','class LinearHashSet'):
    matches=[b for b in blocks if key in b]
    assert len(matches)==1,(key,len(matches))
    classes.append(matches[0])
program='\n\n'.join(classes)+"""
#include <cassert>
int main() {
    BitSet a(8), b(8);
    a.add(0);a.add(3);a.add(6);b.add(3);b.add(5);b.add(6);
    assert(a.contains(6) && !a.contains(5));
    assert(!a.subsetOf(b));
    a.erase(0);a.erase(3);
    assert(a.subsetOf(b));
    DSU d(7);
    d.unite(0,1);d.unite(2,3);d.unite(4,5);
    d.unite(1,3);d.unite(5,6);d.unite(0,6);
    assert((d.state()==std::vector<int>{-7,0,0,2,0,4,4}));
    assert(d.find(6)==0 && d.find(3)==0 && d.groupSize(2)==7);
    assert((d.state()==std::vector<int>{-7,0,0,0,0,4,0}));
    assert(!d.unite(6,3));
    LinearHashSet h(10);
    for(int key: {89,18,49,58,69}) assert(h.insert(key));
    for(int key: {89,18,49,58,69}) assert(h.contains(key));
    assert(!h.insert(58) && !h.contains(79));
    LinearHashSet neg(7);assert(neg.insert(-9)&&neg.contains(-9));
}
"""
with tempfile.TemporaryDirectory() as temp:
    src=Path(temp)/'lesson.cpp'
    exe=Path(temp)/'lesson'
    src.write_text(program,encoding='utf8')
    subprocess.run(['g++','-std=c++17','-O2','-Wall','-Wextra','-Werror',str(src),'-o',str(exe)],check=True)
    subprocess.run([str(exe)],check=True)
print('PASS: Three standalone C++17 classes compiled and run including DSU state and hash lookups')

def hash_insert(keys,m):
    a=[None]*m
    success=[]
    for key in keys:
        start=key%m
        for i in range(m):
            pos=(start+i)%m
            if a[pos] is None:a[pos]=key;success.append(i+1);break
        else:raise ValueError('full')
    failure=[]
    for start in range(m):
        for i in range(m):
            if a[(start+i)%m] is None:failure.append(i+1);break
        else:raise ValueError('full')
    return a,success,failure

h,ok,bad=hash_insert([89,18,49,58,69],10)
assert h==[49,58,69,None,None,None,None,None,18,89]
assert ok==[1,1,2,4,4]
assert bad==[4,3,2,1,1,1,1,1,6,5]
h,ok,bad=hash_insert([10,17,24,5],7)
assert ok==[1,2,3,2] and bad==[1,1,1,5,4,3,2]
h,ok,bad=hash_insert([8,15,22,10,17],7)
assert ok==[1,2,3,2,3]
assert bad==[1,6,5,4,3,2,1]
for n in (12361,7251,3309,30976):
    assert n%73==24
assert 7250%73!=24
print('PASS: Tables, successful/unsuccessful ASL, and PPT 54-digit typo checked independently')
