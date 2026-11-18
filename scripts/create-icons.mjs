// Code-drawn iChrome browser/cursor mark; no remote assets or build dependencies.
import fs from 'node:fs';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) {
    c ^= b;
    for (let i = 0; i < 8; i++) c = (c >>> 1) ^ ((c & 1) ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]);
  const size = Buffer.alloc(4), crc = Buffer.alloc(4);
  size.writeUInt32BE(data.length); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([size, body, crc]);
}
function polygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i], [xj, yj] = points[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function pixel(x, y) {
  const dx = Math.max(Math.abs(x - 64) - 36, 0), dy = Math.max(Math.abs(y - 64) - 36, 0);
  if (dx * dx + dy * dy > 24 * 24) return [0, 0, 0, 0];
  let rgb = [35, 79 + Math.round(y / 5), 225];
  if (x > 24 && x < 104 && y > 30 && y < 93) rgb = [235, 243, 255];
  if (x > 24 && x < 104 && y > 30 && y < 46) rgb = [167, 196, 255];
  for (const cx of [33, 41, 49]) if ((x - cx) ** 2 + (y - 38) ** 2 < 5) rgb = [35, 79, 225];
  if (polygon(x, y, [[58, 54], [58, 103], [70, 91], [80, 110], [91, 104], [80, 85], [99, 84]])) rgb = [21, 40, 88];
  if (polygon(x, y, [[63, 64], [63, 91], [71, 83], [82, 103], [84, 102], [73, 81], [86, 80]])) rgb = [255, 255, 255];
  return [...rgb, 255];
}
function png(size) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const sum = [0, 0, 0, 0];
    for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) {
      const p = pixel((x + (sx + .5) / 4) * 128 / size, (y + (sy + .5) / 4) * 128 / size);
      for (let k = 0; k < 4; k++) sum[k] += p[k];
    }
    for (let k = 0; k < 4; k++) raw[y * (size * 4 + 1) + 1 + x * 4 + k] = Math.round(sum[k] / 16);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size); header.writeUInt32BE(size, 4); header[8] = 8; header[9] = 6;
  return Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
for (const size of [16, 48, 128]) fs.writeFileSync(`${root}/extension/icons/icon${size}.png`, png(size));
const markPath = `${root}/extension/mark.js`;
fs.writeFileSync(markPath, fs.readFileSync(markPath, 'utf8').replace(/const AVATAR_B64 = '[^']*';/, `const AVATAR_B64 = '${png(64).toString('base64')}';`));
console.log('Generated iChrome icons and embedded page mark.');
