import struct
assert struct.pack('>f',13.625).hex()=='415a0000'
assert struct.pack('>f',-.75).hex()=='bf400000'
assert int.from_bytes(bytes.fromhex('03 02'),'little')==515
for a,b,cf,of,sf,zf in [(107,46,0,1,1,0),(250,10,1,0,0,0),(255,1,1,0,0,1),(127,1,0,1,1,0)]:
 r=(a+b)&255
 t=lambda x:x if x<128 else x-256
 assert (int(a+b>255),int(not -128<=t(a)+t(b)<=127),r>>7,int(r==0))==(cf,of,sf,zf)
assert 0x08048392+(0xf6-256)==0x08048388
assert (65522-65536)==-14
assert (8-5+7-3)/2==3.5
print('浮点编码、整数、标志、小端、相对位移与调度示例核验通过')
