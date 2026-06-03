import type { FlatTreeItem, TreeNode } from '../types';

function emptyNode(name: string, path: string, type: TreeNode['type'], sha = ''): TreeNode {
  return { name, path, type, sha, children: [] };
}

function ensureBranch(root: TreeNode, dirs: string[]): TreeNode {
  let current = root;
  let prefix = '';
  for (const dir of dirs) {
    prefix = prefix ? `${prefix}/${dir}` : dir;
    let next = current.children.find((child) => child.type === 'tree' && child.name === dir);
    if (!next) {
      next = emptyNode(dir, prefix, 'tree');
      current.children.push(next);
    }
    current = next;
  }
  return current;
}

export function buildTree(items: FlatTreeItem[], collapse: boolean): TreeNode {
  const root = emptyNode('', '', 'tree');
  for (const item of items) {
    const parts = item.path.split('/');
    const name = parts.pop() as string;
    const parent = ensureBranch(root, parts);
    if (item.type === 'tree') {
      if (!parent.children.some((c) => c.type === 'tree' && c.name === name)) {
        parent.children.push(emptyNode(name, item.path, 'tree', item.sha));
      }
    } else {
      const leaf = emptyNode(name, item.path, 'blob', item.sha);
      if (item.size !== undefined) leaf.size = item.size;
      parent.children.push(leaf);
    }
  }
  sort(root);
  if (collapse) collapseChains(root);
  computeSizes(root);
  return root;
}

function computeSizes(node: TreeNode): number {
  if (node.type === 'blob') return node.size ?? 0;
  let total = 0;
  for (const child of node.children) total += computeSizes(child);
  node.size = total;
  return total;
}

function sort(node: TreeNode): void {
  node.children.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'tree' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  for (const child of node.children) if (child.type === 'tree') sort(child);
}

function collapseChains(node: TreeNode): void {
  for (const child of node.children) if (child.type === 'tree') collapseChains(child);
  for (let i = 0; i < node.children.length; i += 1) {
    let child = node.children[i]!;
    while (
      child.type === 'tree' &&
      child.children.length === 1 &&
      child.children[0]!.type === 'tree'
    ) {
      const only = child.children[0]!;
      child = { ...only, name: `${child.name}/${only.name}` };
    }
    node.children[i] = child;
  }
}
