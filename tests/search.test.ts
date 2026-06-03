import { expect, test } from 'bun:test';
import { buildTree } from '../src/core/github/tree-builder';
import { searchTree } from '../src/core/search';
import type { FlatTreeItem } from '../src/core/types';

const items: FlatTreeItem[] = [
  { path: 'src', type: 'tree', sha: '1' },
  { path: 'src/app.ts', type: 'blob', sha: '2' },
  { path: 'src/app.test.ts', type: 'blob', sha: '3' },
  { path: 'readme.md', type: 'blob', sha: '4' },
];
const root = buildTree(items, false);

test('finds files by substring', () => {
  expect(searchTree(root, 'app').map((node) => node.name)).toContain('app.ts');
});

test('ranks exact matches first', () => {
  expect(searchTree(root, 'app.ts')[0]?.name).toBe('app.ts');
});

test('returns nothing for an empty query', () => {
  expect(searchTree(root, '   ')).toHaveLength(0);
});
