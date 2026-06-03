import type { IconResolver } from '../../core/icons/icon-resolver';
import type { TreeNode } from '../../core/types';
import { TreeSelection } from '../../core/selection';
import { CSS_PREFIX } from '../../shared/constants';
import { h } from '../dom';
import { flagOpening } from '../effects';
import { ancestorsOf } from './tree-paths';
import { type NodeRow, createRow } from './tree-node';

export interface TreeViewOptions {
  root: TreeNode;
  currentPath: string;
  resolver: IconResolver;
  resolveUrl: (node: TreeNode) => string;
  onNavigate: (url: string) => void;
  onSelectionChange: (blobs: TreeNode[]) => void;
}

interface Entry {
  node: TreeNode;
  row: NodeRow;
  wrap: HTMLElement | null;
  depth: number;
}

export class TreeView {
  readonly el: HTMLElement;
  private readonly entries = new Map<string, Entry>();
  private readonly expanded = new Set<string>();
  private readonly selection = new TreeSelection();

  constructor(private readonly options: TreeViewOptions) {
    this.el = h('div', { class: `${CSS_PREFIX}-tree`, attrs: { role: 'tree' } });
    for (const dir of ancestorsOf(options.currentPath)) this.expanded.add(dir);
    this.renderLevel(this.el, options.root.children, 0);
    this.highlightCurrent();
  }

  clearSelection(): void {
    this.selection.clear();
    this.refreshSelection();
  }

  private select(node: TreeNode, on: boolean): void {
    this.selection.toggle(node, on);
    this.refreshSelection();
  }

  private refreshSelection(): void {
    for (const entry of this.entries.values())
      entry.row.setSelected(this.selection.stateOf(entry.node));
    this.options.onSelectionChange(this.selection.selectedBlobs(this.options.root));
  }

  expandAll(): void {
    for (const child of this.options.root.children) this.expandDeep(child);
  }

  collapseAll(): void {
    for (const entry of this.entries.values()) if (entry.wrap) this.collapse(entry);
  }

  private expandDeep(node: TreeNode): void {
    if (node.type !== 'tree') return;
    const entry = this.entries.get(node.path);
    if (!entry) return;
    this.expand(entry);
    for (const child of node.children) this.expandDeep(child);
  }

  private renderLevel(container: HTMLElement, nodes: TreeNode[], depth: number): void {
    const fragment = document.createDocumentFragment();
    for (const node of nodes) this.renderNode(fragment, node, depth);
    container.appendChild(fragment);
  }

  private renderNode(container: Node, node: TreeNode, depth: number): void {
    const isDir = node.type === 'tree';
    const wrap = isDir ? h('div', { class: `${CSS_PREFIX}-node__children` }) : null;
    const row = createRow(node, depth, this.options.resolver, {
      onActivate: (n) => this.options.onNavigate(this.options.resolveUrl(n)),
      onToggle: () => this.toggle(node),
      onSelect: (n, on) => this.select(n, on),
    });
    const entry: Entry = { node, row, wrap, depth };
    this.entries.set(node.path, entry);
    row.setSelected(this.selection.stateOf(node));
    container.appendChild(row.el);
    if (wrap) {
      wrap.hidden = true;
      container.appendChild(wrap);
      if (this.expanded.has(node.path)) this.expand(entry);
    }
  }

  private toggle(node: TreeNode): void {
    const entry = this.entries.get(node.path);
    if (!entry?.wrap) return;
    if (this.expanded.has(node.path)) this.collapse(entry);
    else this.expand(entry);
  }

  private expand(entry: Entry): void {
    if (!entry.wrap) return;
    if (!entry.wrap.dataset.filled) {
      this.renderLevel(entry.wrap, entry.node.children, entry.depth + 1);
      entry.wrap.dataset.filled = '1';
    }
    this.expanded.add(entry.node.path);
    entry.wrap.hidden = false;
    entry.row.setExpanded(true);
    flagOpening(entry.wrap);
  }

  private collapse(entry: Entry): void {
    if (!entry.wrap) return;
    this.expanded.delete(entry.node.path);
    entry.wrap.hidden = true;
    entry.row.setExpanded(false);
  }

  private highlightCurrent(): void {
    const entry = this.options.currentPath ? this.entries.get(this.options.currentPath) : undefined;
    if (!entry) return;
    entry.row.setActive(true);
    entry.row.el.scrollIntoView({ block: 'center' });
  }
}
