"""Run original IA-32 bodies in Unicorn and compare with independent models and native AMD64/C."""
from pathlib import Path
import re,subprocess,tempfile,struct,json,random,ctypes
from unicorn import Uc,UC_ARCH_X86,UC_MODE_32
from unicorn.x86_const import UC_X86_REG_EAX,UC_X86_REG_EDX,UC_X86_REG_EBP
P=Path(__file__).resolve().parents[1];rng=random.Random(40811)
def command(args):
 r=subprocess.run(args,text=True,capture_output=True);assert r.returncode==0,(args,r.stderr);return r.stdout
def blocks(key,lang):return re.findall(r'```'+lang+r'\n(.*?)```',(P/'homework'/f'book4-q{key}.md').read_text(),re.S)
def signed(v):v&=0xffffffff;return v-(1<<32) if v&(1<<31) else v
with tempfile.TemporaryDirectory(prefix='ics-hw-') as td:
 t=Path(td);machines={}
 for q in [4,5,7,11]:
  f=t/f'q{q}.s';f.write_text('.text\n'+blocks(q,'asm')[0]);command(['as','--32',str(f),'-o',str(t/f'q{q}.o')]);command(['objcopy','-O','binary','--only-section=.text',str(t/f'q{q}.o'),str(t/f'q{q}.bin')]);machines[q]=(t/f'q{q}.bin').read_bytes()
 def emulate(q,args):
  u=Uc(UC_ARCH_X86,UC_MODE_32);u.mem_map(0x1000,0x4000);u.mem_write(0x1000,machines[q]);u.reg_write(UC_X86_REG_EBP,0x2100)
  for i,a in enumerate(args):u.mem_write(0x2108+4*i,struct.pack('<I',a&0xffffffff))
  u.emu_start(0x1000,0x1000+len(machines[q]),count=100)
  return u.reg_read(UC_X86_REG_EAX),u.reg_read(UC_X86_REG_EDX),bytes(u.mem_read(0x3000,8))
 # Compile the exact displayed AMD64 solutions plus the C skeleton answer.
 asm='\n'.join(blocks(q,'asm64')[0] for q in [4,11])+'\n.section .note.GNU-stack,"",@progbits\n';(t/'native.s').write_text('.text\n'+asm)
 c=blocks(7,'c')[0]+'''\nint hw_operate_c(int x,int y,int z,int k){return x*k-((z&65520)+(y<<8));}\nint hw_test_c(signed char a,unsigned short b,unsigned short c,short*p){*p=a;return b*c;}\n'''
 (t/'native.c').write_text(c);command(['cc','-std=c11','-Wall','-Wextra','-Werror','-fsanitize=undefined','-shared','-fPIC',str(t/'native.c'),str(t/'native.s'),'-o',str(t/'native.so')]);lib=ctypes.CDLL(str(t/'native.so'))
 for f in [lib.hw_operate64,lib.hw_operate_c]:f.argtypes=[ctypes.c_int]*4;f.restype=ctypes.c_int
 lib.hw_func.argtypes=[ctypes.c_int]*2;lib.hw_func.restype=ctypes.c_int
 for f in [lib.hw_test64,lib.hw_test_c]:f.argtypes=[ctypes.c_byte,ctypes.c_ushort,ctypes.c_ushort,ctypes.POINTER(ctypes.c_short)];f.restype=ctypes.c_int
 operate=[(3,2,63,5),(0,0,0,0),(-3,4,-1,9)]+[(rng.randint(-100,100),rng.randint(0,100),rng.randint(-2**31,2**31-1),rng.randint(-100,100)) for _ in range(1000)]
 for a in operate:
  x,y,z,k=a;expected=x*k-((z&65520)+(y<<8));e=emulate(4,a)[0];assert signed(e)==expected==lib.hw_operate64(*a)==lib.hw_operate_c(*a),(a,e,expected)
 choices=[(x,y) for x in [-2**31,-101,-100,-99,0,15,16,17,2**31-1] for y in [-101,-100,-99,0,1,2,3,16] if -2**31<=x*y<2**31 and (x>-100 or -2**31<=(x+y if y>x else x-y)<2**31)]
 choices +=[(rng.randint(-1000,1000),rng.randint(-1000,1000)) for _ in range(1000)]
 for x,y in choices:
  expected=(x+y if y>x else x-y) if x<=-100 else (x&y if x>=16 else x*y)
  assert signed(emulate(7,[x,y])[0])==expected==lib.hw_func(x,y),(x,y,expected)
 products=[(0,0),(3,(2<<32)+5),(0xffffffff,0xffffffffffffffff)]+[(rng.getrandbits(32),rng.getrandbits(64)) for _ in range(1000)]
 for x,y in products:
  e,d,mem=emulate(5,[0x3000,x,y&0xffffffff,y>>32]);assert int.from_bytes(mem,'little')==(x*y)&((1<<64)-1),(x,y)
 tests=[(-2,300,200),(-128,0,65535),(127,65535,1)]+[(rng.randint(-128,127),rng.getrandbits(16),rng.getrandbits(16)) for _ in range(1000)]
 valid=0
 for a,b,c in tests:
  e,d,mem=emulate(11,[a,b,c,0x3000]);assert e==b*c and d==0 and int.from_bytes(mem[:2],'little',signed=True)==a
  if b*c<=2**31-1:
   p=ctypes.c_short();p2=ctypes.c_short();assert lib.hw_test64(a,b,c,ctypes.byref(p))==lib.hw_test_c(a,b,c,ctypes.byref(p2))==b*c;assert p.value==p2.value==a;valid+=1
 # Same emitted text bytes for signed/unsigned 64-bit product declarations.
 codes=[]
 for ty in ['long long','unsigned long long']:
  (t/'type.c').write_text(f'void f({ty}*d,unsigned x,{ty} y){{*d=x*y;}}')
  command(['cc','-m32','-O2','-fno-pie','-c',str(t/'type.c'),'-o',str(t/'type.o')]);command(['objcopy','-O','binary','--only-section=.text',str(t/'type.o'),str(t/'type.bin')]);codes.append((t/'type.bin').read_bytes())
 assert codes[0]==codes[1]
 report={'original_ia32_bodies_emulated':[4,5,7,11],'operate_cases':len(operate),'choice_cases':len(choices),'product_cases':len(products),'narrow_argument_machine_cases':len(tests),'narrow_argument_defined_C_cases':valid,'displayed_amd64_and_C_runtime_match':True,'C_runtime_UBsan_enabled':True,'signed_unsigned_64bit_product_identical_text':True,'undefined_C_overflow_inputs_not_used_as_portable_results':True}
 (P/'verification/homework-answer-checks.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
