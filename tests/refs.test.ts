import { expect, test } from 'bun:test';
import { type NamedRef, matchRef } from '../src/core/github/refs';

const refs: NamedRef[] = [
  { name: 'main', commit: { sha: 'a' } },
  { name: 'feature', commit: { sha: 'b' } },
  { name: 'feature/foo', commit: { sha: 'c' } },
  { name: 'release/1.0', commit: { sha: 'd' } },
];

test('prefers the longest matching branch name (slash branches)', () => {
  expect(matchRef(refs, 'feature/foo/src/ui')?.name).toBe('feature/foo');
});

test('matches a simple branch and leaves the rest as path', () => {
  const match = matchRef(refs, 'feature/bar.ts');
  expect(match?.name).toBe('feature');
});

test('matches an exact ref', () => {
  expect(matchRef(refs, 'release/1.0')?.commit.sha).toBe('d');
});

test('returns undefined when nothing matches', () => {
  expect(matchRef(refs, 'deadbeef/file.ts')).toBeUndefined();
});
