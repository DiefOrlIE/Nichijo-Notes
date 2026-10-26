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
