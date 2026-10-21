import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const outDir = 'public/icons';
await mkdir(outDir, { recursive: true });

const icons = [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180],
];

for (const [name, size] of icons) {
  await sharp('public/icon.svg', { density: 384 })
    .resize(size, size)
    .png()
    .toFile(`${outDir}/${name}`);
  console.log('Đã tạo', `${outDir}/${name}`);
}