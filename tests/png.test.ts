import { expect, test } from 'bun:test';
import { encodePng } from '../scripts/png';

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

test('encodes a valid PNG signature and IHDR size', () => {
  const png = encodePng(2, 2, new Uint8Array(2 * 2 * 4));
  expect([...png.subarray(0, 8)]).toEqual(SIGNATURE);
  const view = new DataView(png.buffer, png.byteOffset);
  expect(view.getUint32(16)).toBe(2);
  expect(view.getUint32(20)).toBe(2);
});
