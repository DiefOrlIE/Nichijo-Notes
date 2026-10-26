.text
.globl conversion_examples
conversion_examples:
movzbl %al,%ecx
movl %ecx,(%edx)
movsbl %al,%ecx
movl %ecx,(%edx)
movswl %ax,%ecx
movl %ecx,(%edx)
movb %al,(%edx)
leal 4(%eax,%ebx,4),%ecx
ret
