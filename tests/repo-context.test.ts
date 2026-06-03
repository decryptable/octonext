import { expect, test } from 'bun:test';
import { parseRepoContext, repoKey, sameRepoTarget } from '../src/core/adapters/repo-context';

const parse = (path: string) =>
  parseRepoContext(new URL(`https://github.com${path}`), 'github.com');

test('parses a repo root as a tree view', () => {
  expect(parse('/octonext/app')).toEqual({
    host: 'github.com',
    owner: 'octonext',
    repo: 'app',
    view: 'tree',
    rawRef: '',
    pullNumber: null,
  });
});

test('keeps the full ref+path in rawRef for branch resolution', () => {
  expect(parse('/o/r/tree/feature/foo/src/ui')).toMatchObject({
    view: 'tree',
    rawRef: 'feature/foo/src/ui',
  });
});

test('detects a pull request view', () => {
  expect(parse('/o/r/pull/42/files')).toMatchObject({ view: 'pull', pullNumber: 42 });
});

test('marks non-tree tabs as other', () => {
  expect(parse('/o/r/actions')?.view).toBe('other');
});

test('ignores reserved owners and short paths', () => {
  expect(parse('/settings/profile')).toBeNull();
  expect(parse('/octonext')).toBeNull();
});

test('repoKey and sameRepoTarget compare targets', () => {
  expect(repoKey(parse('/o/r'))).toBe('github.com/o/r');
  expect(sameRepoTarget(parse('/o/r'), parse('/o/r/tree/main'))).toBe(false);
  expect(sameRepoTarget(parse('/o/r/pull/1'), parse('/o/r/pull/1'))).toBe(true);
});
