import { expect, test } from 'bun:test';
import { diffAnchor } from '../src/core/github/pulls';

test('computes the GitHub diff anchor (sha-256 of the file path)', async () => {
  const anchor = await diffAnchor('src/index.ts');
  expect(anchor).toMatch(/^diff-[0-9a-f]{64}$/);
});

test('produces stable anchors for the same path', async () => {
  expect(await diffAnchor('a.txt')).toBe(await diffAnchor('a.txt'));
  expect(await diffAnchor('a.txt')).not.toBe(await diffAnchor('b.txt'));
});
