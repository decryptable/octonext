import type { TreeNode } from './types';

export type SelectionState = boolean | 'partial';

export class TreeSelection {
  private readonly selected = new Set<string>();

  toggle(node: TreeNode, on: boolean): void {
    for (const blob of blobsUnder(node)) {
      if (on) this.selected.add(blob.path);
      else this.selected.delete(blob.path);
    }
  }

  clear(): void {
    this.selected.clear();
  }

  has(path: string): boolean {
    return this.selected.has(path);
  }

  stateOf(node: TreeNode): SelectionState {
    if (node.type === 'blob') return this.selected.has(node.path);
    const blobs = blobsUnder(node);
    if (blobs.length === 0) return false;
    const count = blobs.filter((blob) => this.selected.has(blob.path)).length;
    if (count === 0) return false;
    return count === blobs.length ? true : 'partial';
  }

  selectedBlobs(root: TreeNode): TreeNode[] {
    return blobsUnder(root).filter((blob) => this.selected.has(blob.path));
  }

  get size(): number {
    return this.selected.size;
  }
}

export function blobsUnder(node: TreeNode): TreeNode[] {
  if (node.type === 'blob') return [node];
  const result: TreeNode[] = [];
  for (const child of node.children) result.push(...blobsUnder(child));
  return result;
}

export function selectionBytes(blobs: TreeNode[]): number {
  return blobs.reduce((sum, blob) => sum + (blob.size ?? 0), 0);
}
