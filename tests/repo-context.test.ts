import { expect, test } from 'bun:test'
import { parseRepoContext, sameRepo } from '../src/core/adapters/repo-context'

const parse = (path: string) =>
  parseRepoContext(new URL(`https://github.com${path}`), 'github.com');

test('parses a repo root', () => {
  expect(parse('/octonext/app')).toEqual({
    host: 'github.com',
    owner: 'octonext',
    repo: 'app',
    branch: '',
    currentPath: '',
  });
});

test('parses a tree view with branch and path', () => {
  expect(parse('/o/r/tree/main/src/ui')).toMatchObject({ branch: 'main', currentPath: 'src/ui' });
});

test('parses a blob view path', () => {
  expect(parse('/o/r/blob/dev/src/a.ts')).toMatchObject({ branch: 'dev', currentPath: 'src/a.ts' });
});

test('ignores reserved owners and non-tree tabs', () => {
  expect(parse('/settings/profile')).toBeNull();
  expect(parse('/o/r/issues')).toBeNull();
  expect(parse('/octonext')).toBeNull();
});

test('ignores other hosts', () => {
  expect(parseRepoContext(new URL('https://example.com/o/r'), 'github.com')).toBeNull();
});

test('sameRepo compares identity', () => {
  expect(sameRepo(parse('/o/r'), parse('/o/r/tree/main'))).toBe(false);
  expect(sameRepo(parse('/o/r'), parse('/o/r'))).toBe(true);
});
