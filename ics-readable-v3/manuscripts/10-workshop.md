# 用完整程序核对数据表示

先修：前面各章的计算。本章先提供一个完整C11程序验证对象表示、整数扩宽与浮点编码，再提供汇编合法性练习。程序输出用于检查指定平台，不能用一次输出替代语言规则。

## 一份可编译的表示检查程序

程序分三步：先逐字节查看一个32位无符号整数；再用64位计算32位整数的完整乘积；最后用memcpy复制float的对象表示到uint32_t，以免通过不兼容指针读取产生别名问题。uint32_t为恰好32位的无符号整数类型，int32_t为恰好32位的有符号整数类型。PRIx32是inttypes.h为对应整数类型提供的十六进制打印格式宏。

```c
#include <stdio.h>
#include <stdint.h>
#include <inttypes.h>
#include <string.h>
#include <limits.h>

int main(void) {
    uint32_t x = UINT32_C(0x12345678);
    const unsigned char *p = (const unsigned char *)&x;
    for (size_t i = 0; i < sizeof x; ++i)
        printf("%02x%s", (unsigned)p[i], i + 1 == sizeof x ? "\n" : " ");

    int32_t a = 46341, b = 46341;
    int64_t product = (int64_t)a * b;
    printf("product=%" PRId64 ", overflow=%d\n", product,
           product < INT32_MIN || product > INT32_MAX);

    float f = 13.625f;
    uint32_t encoding = 0;
    if (CHAR_BIT != 8 || sizeof f != sizeof encoding) return 1;
    memcpy(&encoding, &f, sizeof encoding);
    printf("float bits=%08" PRIx32 "\n", encoding);
    return 0;
}
```

在课程的x86、IEEE binary32环境，第一行应为78 56 34 12，第二行product=2147488281且overflow=1，第三行float bits=415a0000。第一行逐字节列低地址到高地址，第三行按整个整数常规高位到低位打印，所以不能直接拿它们的字面顺序比较。

用`cc -std=c11 -Wall -Wextra check.c -o check`编译，随后运行`./check`。若平台浮点格式或整数类型支持不同，应先检查平台；程序只保证在明确环境中核对本章格式。

