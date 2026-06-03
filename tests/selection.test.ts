import { expect, test } from 'bun:test';
import { buildTree } from '../src/core/github/tree-builder';
import { TreeSelection, selectionBytes } from '../src/core/selection';
import { formatSize } from '../src/core/format';
import type { FlatTreeItem } from '../src/core/types';

const root = buildTree(
  [
    { path: 'src', type: 'tree', sha: '1' },
    { path: 'src/a.ts', type: 'blob', sha: '2', size: 100 },
    { path: 'src/b.ts', type: 'blob', sha: '3', size: 200 },
    { path: 'empty', type: 'tree', sha: '4' },
    { path: 'readme.md', type: 'blob', sha: '5', size: 50 },
  ] satisfies FlatTreeItem[],
  false,
);

const src = root.children.find((node) => node.name === 'src')!;
const empty = root.children.find((node) => node.name === 'empty')!;

test('aggregates folder and repo sizes', () => {
  expect(src.size).toBe(300);
  expect(root.size).toBe(350);
});

test('selecting a folder selects all blob descendants', () => {
  const selection = new TreeSelection();
  selection.toggle(src, true);
  expect(selection.stateOf(src)).toBe(true);
  expect(
    selection
      .selectedBlobs(root)
      .map((n) => n.path)
      .sort(),
  ).toEqual(['src/a.ts', 'src/b.ts']);
});

test('partial folder state when only some children selected', () => {
  const selection = new TreeSelection();
  selection.toggle(src.children[0]!, true);
  expect(selection.stateOf(src)).toBe('partial');
});

test('empty folders contribute no blobs', () => {
  const selection = new TreeSelection();
  selection.toggle(empty, true);
  expect(selection.selectedBlobs(root)).toHaveLength(0);
});

test('selectionBytes and formatSize', () => {
  expect(selectionBytes([src.children[0]!, src.children[1]!])).toBe(300);
  expect(formatSize(0)).toBe('0 B');
  expect(formatSize(1536)).toBe('1.5 KB');
  expect(formatSize(1048576)).toBe('1 MB');
});
