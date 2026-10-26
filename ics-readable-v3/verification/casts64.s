.text
.globl conversion_examples64
conversion_examples64:
movsbq %al,%rcx
movq %rcx,(%rdx)
movslq %eax,%rcx
movq %rcx,(%rdx)
movl %eax,%ecx
movq %rcx,(%rdx)
ret
