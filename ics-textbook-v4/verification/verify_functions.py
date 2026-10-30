from pathlib import Path
import tempfile,subprocess,re,json
root=Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory() as t:
 p=Path(t)
 src=re.search(r'```c\n(.*?)```',(root/'manuscripts/03-function-call.md').read_text(),re.S)[1]
 (p/'main.c').write_text(src)
 subprocess.run(['cc','-std=c11','-Wall','-Wextra','-Werror',str(p/'main.c'),'-o',str(p/'main')],check=True)
 assert subprocess.check_output([str(p/'main')],text=True)=='8\n'
 src=re.search(r'```c\n(.*?)```',(root/'manuscripts/03-control-flow.md').read_text(),re.S)[1]
 (p/'loop.c').write_text('#include <assert.h>\n'+src+'\nint main(void){assert(sum_prefix(0)==0);assert(sum_prefix(3)==3);assert(sum_prefix(4)==6);assert(sum_prefix(65536)==2147450880);return 0;}')
 subprocess.run(['cc','-std=c11','-Wall','-Wextra','-Werror',str(p/'loop.c'),'-o',str(p/'loop')],check=True)
 subprocess.run([str(p/'loop')],check=True)
 asm='''.text
.globl _start
_start:
 pushl $5
 pushl $3
 call add
 addl $8,%esp
 cmpl $8,%eax
 jne fail
 pushl $9
 pushl $4
 call add
 addl $8,%esp
 cmpl $13,%eax
 jne fail
 xorl %ebx,%ebx
 jmp finish
fail:
 movl $1,%ebx
finish:
 movl $1,%eax
 int $0x80
add:
 pushl %ebp
 movl %esp,%ebp
 subl $4,%esp
 movl 8(%ebp),%eax
 addl 12(%ebp),%eax
 movl %eax,-4(%ebp)
 movl -4(%ebp),%eax
 movl %ebp,%esp
 popl %ebp
 ret
'''
 (p/'call.s').write_text(asm)
 subprocess.run(['as','--32',str(p/'call.s'),'-o',str(p/'call.o')],check=True)
 subprocess.run(['ld','-m','elf_i386',str(p/'call.o'),'-o',str(p/'call')],check=True)
 try:
  subprocess.run([str(p/'call')],check=True);native='executed: 3+5=8,4+9=13'
 except OSError as e:native='execution unavailable: '+str(e)
 # Separate numerical reconstruction of the specified paper trace.
 esp=1000;memory={}
 for value in [5,3,2005,1200]:esp-=4;memory[esp]=value
 ebp=esp;esp-=4
 assert (esp,ebp)==(980,984)
 assert memory[ebp+8]+memory[ebp+12]==8
 esp=ebp;old=memory[esp];esp+=4;ret=memory[esp];esp+=4;esp+=8
 assert (esp,old,ret)==(1000,1200,2005)
 result={'c_example':'compiled and output 8','loop_cases':[0,3,4,65536],'ia32_assembly':native,'paper_stack':'checked','learning_test':'not performed'}
 (root/'audit/verification-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False))
