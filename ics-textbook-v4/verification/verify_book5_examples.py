from pathlib import Path
import subprocess,tempfile,re,json,struct,itertools
P=Path(__file__).resolve().parents[1]
def run(args,cwd,ok=True):
 r=subprocess.run(args,cwd=cwd,capture_output=True,text=True)
 if ok: assert r.returncode==0,(args,r.stderr)
 return r
blocks=re.findall(r'```c\n(.*?)```',(P/'manuscripts/04-symbols.md').read_text(),re.S)
plugin=re.findall(r'```c\n(.*?)```',(P/'manuscripts/04-dynamic.md').read_text(),re.S)[0]
with tempfile.TemporaryDirectory(prefix='ics-book5-') as t:
 t=Path(t)
 for name,body in [('main.c',blocks[0]),('sum.c',blocks[1]),('plugin.c',plugin)]: (t/name).write_text(body)
 for args in [['cc','-E','main.c','-o','main.i'],['cc','-S','main.i','-o','main.s'],['cc','-c','main.s','-o','main.o'],['cc','-c','sum.c','-o','sum.o'],['cc','main.o','sum.o','-o','demo']]:run(args,t)
 assert run(['./demo'],t).stdout=='8\n'
 (t/'sum.c').write_text('int sum(int a,int b){return a+b+1;}')
 run(['cc','-c','sum.c','-o','sum.o'],t);run(['cc','main.o','sum.o','-o','demo'],t);assert run(['./demo'],t).stdout=='9\n'
 (t/'sum.c').write_text(blocks[1]);run(['cc','-fPIC','-shared','sum.c','-o','libsum.so'],t)
 run(['cc','-std=c11','-Wall','-Wextra','-Werror','plugin.c','-ldl','-o','plugin'],t)
 assert run(['./plugin'],t).stdout=='8\n'
 (t/'libsum.so').rename(t/'saved.so');r=run(['./plugin'],t,False);assert r.returncode and r.stderr and not r.stdout
 (t/'wrong.c').write_text('int another(int a,int b){return a+b;}');run(['cc','-fPIC','-shared','wrong.c','-o','libsum.so'],t)
 r=run(['./plugin'],t,False);assert r.returncode and 'sum' in r.stderr and not r.stdout
 # Encode the exact backwards PC32 example with a real assembler and linker.
 (t/'call.s').write_text('.text\n.globl entry\nentry:\ncall target\nret\n')
 run(['as','--32','call.s','-o','call.o'],t)
 rel=run(['readelf','-r','call.o'],t).stdout;assert 'R_386_PC32' in rel and 'target' in rel
 run(['ld','-m','elf_i386','-Ttext=0x4000','--defsym=target=0x3ff0','-e','entry','call.o','-o','call'],t)
 run(['objcopy','-O','binary','--only-section=.text','call','call.bin'],t);assert (t/'call.bin').read_bytes()[:5]==bytes.fromhex('e8 eb ff ff ff')
 # Exact execution bytes from the prose.
 (t/'instruction.s').write_text('.text\naddl 4(%eax),%edx\n');run(['as','--32','instruction.s','-o','instruction.o'],t)
 run(['objcopy','-O','binary','--only-section=.text','instruction.o','instruction.bin'],t);assert (t/'instruction.bin').read_bytes()==bytes.fromhex('03 50 04')
# Independently enumerate all smaller argument sequences for the stated archive model.
def resolve(seq):
 members={'p':[('p',{'main'},{'a'})], 'x':[('x1',{'a'},{'b'}),('x2',{'c'},set())], 'y':[('y',{'b'},{'c','d'})], 'z':[('z',{'d'},set())]}
 selected=set();D=set();U=set()
 for lib in seq:
  changed=True
  while changed:
   changed=False
   for name,defs,refs in members[lib]:
    if name in selected or (lib!='p' and not (defs & U)):continue
    selected.add(name);D|=defs;U=(U|refs)-D;changed=True
 return 'p' in selected and not U
assert resolve(('p','x','y','x','z'))
assert not any(resolve(seq) for n in range(1,5) for seq in itertools.product('pxyz',repeat=n))
assert (0x8048386+0x25+3)//4*4==0x80483ac
assert 0x8049448+0xe8-1==0x804952f
assert 0x8049448+0x104-1==0x804954b
assert 0x104-0xe8==28
for value,result,carry in [(5,12,0),(9,16,0),(0xfffffffe,5,1)]:
 total=value+7;assert total&0xffffffff==result;assert int(total>0xffffffff)==carry
report={'preprocess_compile_assemble_link':True,'incremental_relink_8_to_9':True,'runtime_plugin_success':True,'missing_library_failure':True,'missing_symbol_failure':True,'backwards_pc32_bytes':'e8 eb ff ff ff','exact_execution_encoding':'03 50 04','archive_minimum_file_arguments':5,'archive_shorter_sequences_exhausted':340,'zero_fill_and_alignment':True,'execution_variants':3}
(P/'audit/book5-example-results.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
