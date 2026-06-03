import { expect, test } from 'bun:test';
import { mapLimit } from '../src/core/concurrency';

test('preserves input order in results', async () => {
  const out = await mapLimit([1, 2, 3, 4, 5], 2, async (n) => n * 10);
  expect(out).toEqual([10, 20, 30, 40, 50]);
});

test('never exceeds the concurrency limit', async () => {
  let active = 0;
  let peak = 0;
  await mapLimit(
    Array.from({ length: 20 }, (_, i) => i),
    4,
    async () => {
      active += 1;
      peak = Math.max(peak, active);
      await Promise.resolve();
      active -= 1;
    },
  );
  expect(peak).toBeLessThanOrEqual(4);
});

test('handles an empty list', async () => {
  expect(await mapLimit([], 4, async (n) => n)).toEqual([]);
});
