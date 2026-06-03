import type { TreeNode } from './types';

export interface SearchHit {
  node: TreeNode;
  score: number;
}

export function flatten(root: TreeNode): TreeNode[] {
  const result: TreeNode[] = [];
  const walk = (node: TreeNode) => {
    for (const child of node.children) {
      result.push(child);
      if (child.type === 'tree') walk(child);
    }
  };
  walk(root);
  return result;
}

export function searchTree(root: TreeNode, query: string, limit = 200): TreeNode[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  const hits: SearchHit[] = [];
  for (const node of flatten(root)) {
    const score = scoreOf(node, needle);
    if (score > 0) hits.push({ node, score });
  }
  hits.sort((a, b) => b.score - a.score || a.node.path.localeCompare(b.node.path));
  return hits.slice(0, limit).map((hit) => hit.node);
}

function scoreOf(node: TreeNode, needle: string): number {
  const name = node.name.toLowerCase();
  if (name === needle) return 100;
  if (name.startsWith(needle)) return 80;
  if (name.includes(needle)) return 60;
  if (node.path.toLowerCase().includes(needle)) return 30;
  return 0;
}
