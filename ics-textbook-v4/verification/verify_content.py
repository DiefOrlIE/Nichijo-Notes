from pathlib import Path
import re, tempfile, subprocess, struct, json, hashlib
P=Path(__file__).resolve().parents[1]
def command(args):
 r=subprocess.run(args,text=True,capture_output=True)
 assert r.returncode==0,(args,r.stdout,r.stderr)
 return r.stdout
counts={'c_blocks_compiled':0,'assembly_blocks_assembled':0}
with tempfile.TemporaryDirectory(prefix='ics-v4-') as t:
 t=Path(t)
 for f in sorted((P/'manuscripts').glob('*.md')):
  src=f.read_text()
  for i,c in enumerate(re.findall(r'```c\n(.*?)```',src,re.S)):
   base=t/(f.stem+str(i));base.with_suffix('.c').write_text(c)
   command(['cc','-std=c11','-Wall','-Wextra','-Werror','-c',str(base.with_suffix('.c')),'-o',str(base.with_suffix('.o'))]);counts['c_blocks_compiled']+=1
   if 'int main(void)' in c:
    extra=[]
    if f.stem=='04-symbols':
     support=t/'sum.c';support.write_text('int sum(int a,int b){return a+b;}');extra=[str(support)]
    command(['cc',str(base.with_suffix('.c')),*extra,'-o',str(base)])
    out=command([str(base)])
    expected={'03-function-call':'8\n','03-operations':'415A0000 13\n','04-symbols':'8\n'}
    if f.stem in expected: assert out==expected[f.stem],(f,out)
  for i,c in enumerate(re.findall(r'```asm\n(.*?)```',src,re.S)):
   a=t/(f.stem+str(i)+'.s');a.write_text('.text\n'+c+'\n')
   command(['as','--64' if f.stem=='03-platforms' else '--32',str(a),'-o',str(a.with_suffix('.o'))]);counts['assembly_blocks_assembled']+=1
 # Executable independent checks; host Linux x86-64, C11 ordinary IEEE environment.
 c=r'''
#include <assert.h>
#include <stdint.h>
#include <stddef.h>
#include <stdio.h>
#include <string.h>
#include <float.h>
struct Record {char tag;int value;short code;};
struct Variant {char a;short b;int c;char d;};
static unsigned flags(unsigned a,unsigned b,int sub){
 unsigned char r=(unsigned char)a; unsigned long f;
 if(sub) __asm__ volatile("subb %b2,%b0; pushfq; popq %1":"+q"(r),"=r"(f):"q"((unsigned char)b):"cc");
 else __asm__ volatile("addb %b2,%b0; pushfq; popq %1":"+q"(r),"=r"(f):"q"((unsigned char)b):"cc");
 int sa=a<128?(int)a:(int)a-256,sb=b<128?(int)b:(int)b-256;
 int n=sub?sa-sb:sa+sb; unsigned rr=(sub?a-b:a+b)&255;
 assert(r==rr);assert((f&1)==(sub?a<b:a+b>255));
 assert(((f>>11)&1)==(n < -128 || n>127));
 assert(((f>>7)&1)==(rr>>7));assert(((f>>6)&1)==(rr==0));return r;
}
int main(void){
 assert(sizeof(float)==4 && FLT_RADIX==2 && FLT_MANT_DIG==24);
 float x=13.625f;uint32_t u;memcpy(&u,&x,4);assert(u==0x415a0000);
 u=0xc4480000;memcpy(&x,&u,4);assert(x==-800.0f);
 volatile float a=16777216.0f,b=1.0f,c=-16777216.0f;
 volatile float ab=a+b,bc=b+c;assert(ab+c==0.0f && a+bc==1.0f);
 assert((int)(float)16777217==16777216);
 assert(offsetof(struct Record,value)==4 && offsetof(struct Record,code)==8 && sizeof(struct Record)==12);
 assert(offsetof(struct Variant,b)==2 && offsetof(struct Variant,c)==4 && offsetof(struct Variant,d)==8 && sizeof(struct Variant)==12);
 for(unsigned i=0;i<256;i++)for(unsigned j=0;j<256;j++){flags(i,j,0);flags(i,j,1);}
 puts("float/layout and 131072 x86 flag cases passed");return 0;
}
'''
 (t/'independent.c').write_text(c)
 command(['cc','-std=c11','-Wall','-Wextra','-Werror',str(t/'independent.c'),'-o',str(t/'independent')]);counts['hardware_and_c']=command([str(t/'independent')]).strip()
# Function-level behavior, not compilation-only evidence.
with tempfile.TemporaryDirectory(prefix='ics-functions-') as td:
 t=Path(td)
 units=[('02-arithmetic','xor_swap','int a=5,b=3;xor_swap(&a,&b);assert(a==3 && b==5);a=7;xor_swap(&a,&a);assert(a==0);'),('03-function-call','factorial','assert(factorial(0)==1);assert(factorial(3)==6);assert(factorial(12)==479001600);'),('03-control-flow','choose_value','assert(choose_value(2)==10);assert(choose_value(3)==20);assert(choose_value(4)==30);assert(choose_value(1)==-1);assert(choose_value(5)==-1);assert(choose_value((-2147483647-1))==-1);'),('03-objects','sum_array','int a[]={10,20,-3};assert(sum_array(0,0)==0);assert(sum_array(a,1)==10);assert(sum_array(a,3)==27);'),('03-instructions','increase','int x=5;increase(&x);assert(x==8);x=-3;increase(&x);assert(x==0);')]
 for unit,fn,checks in units:
  blocks=re.findall(r'```c\n(.*?)```',(P/'manuscripts'/f'{unit}.md').read_text(),re.S)
  code=next(b for b in blocks if re.search(r'\b'+fn+r'\(',b))
  f=t/(fn+'.c');f.write_text('#include <assert.h>\n'+code+'\nint main(void){'+checks+'return 0;}')
  command(['cc','-std=c11','-Wall','-Wextra','-Werror',str(f),'-o',str(t/fn)]);command([str(t/fn)])
 (P/'audit/functions-results.json').write_text(json.dumps({'functions':[x[1] for x in units],'boundary_runtime':'passed'},indent=2))

# Independent exact models for algorithms, including signed extrema.
def signed(x,n):return (x&(2**n-1))-(2**n if x&(1<<(n-1)) else 0)
traces=[]
for m in range(-8,8):
 for q0 in range(-8,8):
  a=0;q=q0&15;old=0;trace=[]
  for k in range(4):
   pair=((q&1)<<1)|old
   if pair==1:a+=m
   elif pair==2:a-=m
   joined=((a&31)<<5)|(q<<1)|old
   joined=signed(joined,10)>>1
   a=signed(joined>>5,5);q=(joined>>1)&15;old=joined&1
   trace.append([a,q,old])
  result=signed(((a&15)<<4)|q,8)
  assert result==m*q0,(m,q0,result)
  if (m,q0)==(3,-5):traces=trace
assert traces==[[-2,13,1],[-1,6,1],[1,3,0],[-1,1,1]]
for n in range(16):
 for d in range(1,16):
  r=0;q=0
  for i in reversed(range(4)):
   r=r*2+((n>>i)&1);take=r>=d
   if take:r-=d
   q=q*2+take
   assert 0<=r<d
  assert (q,r)==divmod(n,d)
assert (46341**2)-(1<<32)==-2147479015
assert struct.unpack('<f',bytes.fromhex('00005a41'))[0]==13.625
assert '中'.encode()==bytes.fromhex('e4 b8 ad')
assert '中'.encode('gb2312')==bytes.fromhex('d6 d0')
# RR simulation, independent event queue.
from collections import deque
def rr(jobs):
 pending=sorted(jobs);queue=deque();left={k:n for a,k,n in jobs};now=0;done={};segments=[]
 while pending or queue:
  if not queue:now=max(now,pending[0][0])
  while pending and pending[0][0]<=now:queue.append(pending.pop(0)[1])
  k=queue.popleft();end=now+min(2,left[k]);segments.append([k,now,end]);left[k]-=end-now;now=end
  while pending and pending[0][0]<=now:queue.append(pending.pop(0)[1])
  if left[k]:queue.append(k)
  else:done[k]=now
 return segments,done
assert rr([(0,'A',5),(1,'B',3),(3,'C',1)])[1]=={'C':7,'B':8,'A':9}
assert rr([(0,'A',3),(1,'B',2),(3,'C',1)])[1]=={'B':4,'A':5,'C':6}
counts.update(booth_cases=256,division_cases=240,booth_3_times_minus5=traces,encoding_checks=['binary32','UTF-8','GB2312'],rr_cases=2)
(P/'audit/content-test-results.json').write_text(json.dumps(counts,ensure_ascii=False,indent=2));print(json.dumps(counts,ensure_ascii=False))
