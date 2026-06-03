import { expect, test } from 'bun:test';
import { buildTree } from '../src/core/github/tree-builder';
import type { FlatTreeItem } from '../src/core/types';

const items: FlatTreeItem[] = [
  { path: 'src', type: 'tree', sha: 't1' },
  { path: 'src/a.ts', type: 'blob', sha: 'b1', size: 10 },
  { path: 'README.md', type: 'blob', sha: 'b2' },
];

test('builds a hierarchy with directories first', () => {
  const root = buildTree(items, false);
  expect(root.children.map((c) => c.name)).toEqual(['src', 'README.md']);
  expect(root.children[0]!.type).toBe('tree');
});

test('attaches blob size and nesting', () => {
  const root = buildTree(items, false);
  const src = root.children[0]!;
  expect(src.children[0]).toMatchObject({ name: 'a.ts', path: 'src/a.ts', size: 10 });
});

test('collapses single-child directory chains', () => {
  const nested: FlatTreeItem[] = [
    { path: 'a', type: 'tree', sha: '1' },
    { path: 'a/b', type: 'tree', sha: '2' },
    { path: 'a/b/c.ts', type: 'blob', sha: '3' },
  ];
  const root = buildTree(nested, true);
  expect(root.children[0]!.name).toBe('a/b');
  expect(root.children[0]!.children[0]!.name).toBe('c.ts');
});
