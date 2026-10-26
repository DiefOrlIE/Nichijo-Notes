from pathlib import Path
import subprocess,tempfile,struct,json

def run(args,cwd):return subprocess.run(args,cwd=cwd,text=True,capture_output=True)
with tempfile.TemporaryDirectory(prefix='ics-link-') as t:
 p=Path(t)
 files={'main.c':'#include <stdio.h>\nint sum(int,int);int main(void){printf("%d\\n",sum(3,5));return 0;}','sum.c':'int sum(int a,int b){return a+b;}','entry.s':'.text\n.globl entry\nentry:\ncall sum\nret\n','p.c':'int a(void);int main(void){return a()!=9;}','x1.c':'int b(void);int a(void){return b();}','x2.c':'int c(void){return 9;}','y.c':'int c(void);int b(void){return c();}'}
 for f,s in files.items():(p/f).write_text(s)
 for f in ['main','sum','p','x1','x2','y']:assert run(['cc','-std=c11','-Wall','-Wextra','-Werror','-c',f+'.c','-o',f+'.o'],t).returncode==0
 assert run(['cc','main.o','sum.o','-o','demo'],t).returncode==0
 assert run(['./demo'],t).stdout=='8\n'
 assert run(['cc','main.o','-o','missing'],t).returncode!=0
 assert run(['ar','rcs','libx.a','x1.o','x2.o'],t).returncode==0
 assert run(['ar','rcs','liby.a','y.o'],t).returncode==0
 assert run(['cc','p.o','libx.a','liby.a','-o','bad'],t).returncode!=0
 assert run(['cc','p.o','libx.a','liby.a','libx.a','-o','good'],t).returncode==0
 assert run(['./good'],t).returncode==0
 assert run(['as','--32','entry.s','-o','entry.o'],t).returncode==0
 assert run(['ld','-m','elf_i386','-Ttext=0x1000','--defsym=sum=0x1020','-e','entry','entry.o','-o','reloc'],t).returncode==0
 assert run(['objcopy','-O','binary','--only-section=.text','reloc','reloc.bin'],t).returncode==0
 assert (p/'reloc.bin').read_bytes()[:5]==bytes.fromhex('e8 1b 00 00 00')
 (p/'a.c').write_text('int x;int f(void);int main(void){return f();}')
 (p/'b.c').write_text('int x;int f(void){return x;}')
 assert run(['cc','-fno-common','a.c','b.c','-o','nocommon'],t).returncode!=0
 assert run(['cc','-fcommon','a.c','b.c','-o','common'],t).returncode==0
print(json.dumps({'multi_file':True,'missing_definition_detected':True,'archive_repeat':True,'real_elf32_relocation':'e8 1b 00 00 00','common_mode_difference':True}))
assert 0x104-0xe8==28
assert struct.unpack('>f',bytes.fromhex('c4480000'))[0]==-800
assert struct.unpack('>d',bytes.fromhex('c024800000000000'))[0]==-10.25
assert struct.pack('>d',10.5).hex()=='4025000000000000'
assert 28.125==int('11100',2)+1/8
assert 79.25==int('1001111',2)+1/4
print('新增教材数值与重定位、归档顺序、COMMON规则全部通过指定核验')
