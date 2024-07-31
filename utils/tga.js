import quantize from "quantize";

//Create an uncompressed tga buffer from a given RGB pixel array
//Supposed to work identically to PNG2TGA for Amazfit Band 7 :3 (RLE didnt work as expected :c)
//DOES NOT support transparency

export default function createTgaBuffer(width, height, pixels, useRLE = false) {
  console.log('createTgaBuffer');

  const dtype = useRLE ? 0x09 : 0x01;
  const wdtha = width & 0xFF;
  const wdthb = width >> 8;
  const hghta = height & 0xFF;
  const hghtb = height >> 8;

  const data = [
    0x2e, 0x01, dtype, 0x00,
    0x00, 0x00, 0x01, 0x20,

    0x00, 0x00, 0x00, 0x00,
    wdtha, wdthb, hghta, hghtb,

    0x08, 0x20, 0x53, 0x4f,
    0x4d, 0x48, wdtha, wdthb,

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

  // TODO skip quantization if the image already has 256 colors or less

  const pixels_arr = [];
  let quick_palette = new Set();
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    pixels_arr.push([r, g, b]);

    //This intentionally allows pushing 257th color
    //this is "normal" and triggers a fallback to quantization later on
    if (quick_palette.size <= 256) {
      const key = (r << 16) | (g << 8) | b;
      quick_palette.add(key);
    }
  }

  // if the image already has 256 colors or less, skip quantization
  let palette, idxOf;
  if (quick_palette.size <= 256) {
    console.log("image has " + quick_palette.size + " colors");
    console.log("skipping quantization");
    palette = [];
    for (const key of quick_palette) {
      const r = (key >> 16) & 0xFF;
      const g = (key >> 8) & 0xFF;
      const b = key & 0xFF;
      palette.push([r, g, b]);
    }
    idxOf = (color) => {
      for (let i = 0; i < palette.length; i++) {
        if (
          palette[i][0] === color[0] &&
          palette[i][1] === color[1] &&
          palette[i][2] === color[2]
        ) {
          return i;
        }
      }
      throw new Error("unreachable");
    };
  } else {
    console.log("too many colors, quantizing :(");
    // quantize the image to 256 colors
    const cmap = quantize(pixels_arr, 256);
    palette = cmap.palette();
    idxOf = (color) => {
      const map_color = cmap.map(color);
      for (let i = 0; i < palette.length; i++) {
        if (
          (palette[i][0] == map_color[0]) &&
          (palette[i][1] == map_color[1]) &&
          (palette[i][2] == map_color[2])
        ) {
          return i;
        }
      }
      throw new Error("unreachable");
    };
  }

  for (let i = 0; i < 0x100; i++) {
    const r = palette[i] ? palette[i][0] : 0;
    const g = palette[i] ? palette[i][1] : 0;
    const b = palette[i] ? palette[i][2] : 0;
    data.push(b, g, r, 0xFF);
  }

  let rle_prev_idx = 999;
  for (let i = 0; i < width * height; i++) {
    const base = i * 3;
    const r = pixels[base];
    const g = pixels[base + 1];
    const b = pixels[base + 2];
    const pixel_idx = idxOf([r, g, b]);
    if (!useRLE) {
      data.push(pixel_idx);
    } else {
      //TODO support raw packets
      if (rle_prev_idx == pixel_idx) {
        if (data[data.length - 2] != 0xff) {
          data[data.length - 2] += 1;
          continue
        }
      }
      data.push(0x80, pixel_idx);
      rle_prev_idx = pixel_idx;
    }
  }

  return new Uint8Array(data);
}
