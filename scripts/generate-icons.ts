import { mkdir } from 'node:fs/promises';
import { ICONS_DIR } from './paths';
import { encodePng } from './png';

type Color = [number, number, number, number];

const ACCENT: Color = [45, 164, 78, 255];
const WHITE: Color = [255, 255, 255, 255];
const SIZES = [16, 32, 48, 128, 256];

function blend(buf: Uint8Array, i: number, [r, g, b, a]: Color): void {
  if (a === 0) return;
  buf[i] = r;
  buf[i + 1] = g;
  buf[i + 2] = b;
  buf[i + 3] = a;
}

function insideRounded(x: number, y: number, size: number, radius: number): boolean {
  const nx = Math.min(x, size - 1 - x);
  const ny = Math.min(y, size - 1 - y);
  if (nx >= radius || ny >= radius) return true;
  const dx = radius - nx;
  const dy = radius - ny;
  return dx * dx + dy * dy <= radius * radius;
}

function rect(
  buf: Uint8Array,
  size: number,
  x: number,
  y: number,
  w: number,
  h: number,
  color: Color,
) {
  for (let py = Math.round(y); py < Math.round(y + h); py += 1) {
    for (let px = Math.round(x); px < Math.round(x + w); px += 1) {
      if (px < 0 || py < 0 || px >= size || py >= size) continue;
      blend(buf, (py * size + px) * 4, color);
    }
  }
}

function render(size: number): Uint8Array {
  const buf = new Uint8Array(size * size * 4);
  const radius = Math.round(size * 0.22);
  for (let y = 0; y < size; y += 1)
    for (let x = 0; x < size; x += 1)
      if (insideRounded(x, y, size, radius)) blend(buf, (y * size + x) * 4, ACCENT);

  const spine = size * 0.06;
  rect(buf, size, size * 0.28, size * 0.24, spine, size * 0.52, WHITE);
  const node = size * 0.16;
  for (const cy of [0.26, 0.46, 0.66]) {
    rect(buf, size, size * 0.28, cy * size + node / 2 - spine / 2, size * 0.28, spine, WHITE);
    rect(buf, size, size * 0.56, cy * size, node, node, WHITE);
  }
  return buf;
}

export async function generateIcons(): Promise<void> {
  await mkdir(ICONS_DIR, { recursive: true });
  for (const size of SIZES) {
    const png = encodePng(size, size, render(size));
    await Bun.write(`${ICONS_DIR}/icon${size}.png`, png);
  }
}

if (import.meta.main) {
  await generateIcons();
  console.log(`Generated ${SIZES.length} icons in ${ICONS_DIR}`);
}
