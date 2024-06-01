export default function createTgaBuffer(width, height, pixels, dontFlipY) {
  console.log('createTgaBuffer');

  // const buffer = (Buffer.allocUnsafe ?? Buffer.alloc)(HEADER_SIZE + width * height * 4);

  // // write header
  // let ptr = 0;
  // buffer.writeInt8(0, ptr++);
  // buffer.writeInt8(0, ptr++);
  // buffer.writeInt8(2, ptr++);
  // buffer.writeInt16LE(0, ptr);
  // ptr += 2;
  // buffer.writeInt16LE(0, ptr);
  // ptr += 2;
  // buffer.writeInt8(0, ptr++);
  // buffer.writeInt16LE(0, ptr);
  // ptr += 2;
  // buffer.writeInt16LE(0, ptr);
  // ptr += 2;
  // buffer.writeInt16LE(width, ptr);
  // ptr += 2;
  // buffer.writeInt16LE(height, ptr);
  // ptr += 2;
  // buffer.writeInt8(32, ptr++);
  // buffer.writeInt8(dontFlipY ? 32 : 0, ptr++);
  // console.log(ptr);

  // //write uncompressed RGB data
  // let offset = 18;
  // for (let i = 0; i < height; i++) {
  //   for (let j = 0; j < width; j++) {
  //     const idx = ((dontFlipY ? i : height - i - 1) * width + j) * 3;
  //     buffer.writeUInt8(pixels[idx + 2], offset++);    // b
  //     buffer.writeUInt8(pixels[idx + 1], offset++);    // g
  //     buffer.writeUInt8(pixels[idx], offset++);        // r
  //     buffer.writeUInt8(255, offset++);    // a
  //     //console.log(offset, 3 * width * height + 18, j, i);
  //   }
  // }

  const data = [
    0x2e, 0x01, 0x09, 0x00,
    0x00, 0x00, 0x01, 0x20,

    0x00, 0x00, 0x00, 0x00,
    width & 0xFF, width >> 8, height & 0xFF, height >> 8,

    0x08, 0x20, 0x53, 0x4f,
    0x4d, 0x48, 0x18, 0x00,

    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,

    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,

    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,

    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,

    0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
  ];

  // eh, well do grayscale for now
  for (let i = 0; i < 0x100; i++) {
    data.push(i, i, i, 0xFF);
  }

  for (let i = 0; i < width * height; i++) {
    //"rle" my ass
    const base = i * 3;
    const r = pixels[base];
    const g = pixels[base + 1];
    const b = pixels[base + 2];
    const grayscale = Math.floor((r + g + b) / 3);
    data.push(0x80);
    data.push(grayscale);
  }

  console.log(JSON.stringify(data));

  return new Uint8Array(data);
}
