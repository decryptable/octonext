import type { TreeNode } from '../../core/types';
import { CSS_PREFIX } from '../../shared/constants';
import { h } from '../dom';
import { type NodeRow, createRow } from './tree-node';

export interface TreeViewOptions {
  root: TreeNode;
  currentPath: string;
  resolveUrl: (node: TreeNode) => string;
  onNavigate: (url: string) => void;
}

export class TreeView {
  readonly el: HTMLElement;
  private readonly expanded = new Set<string>();
  private readonly rows = new Map<string, NodeRow>();

  constructor(private readonly options: TreeViewOptions) {
    this.el = h('div', { class: `${CSS_PREFIX}-tree`, attrs: { role: 'tree' } });
    for (const dir of ancestorsOf(options.currentPath)) this.expanded.add(dir);
    this.renderLevel(this.el, options.root.children, 0);
    this.highlightCurrent();
  }

  private renderLevel(container: HTMLElement, nodes: TreeNode[], depth: number): void {
    for (const node of nodes) this.renderNode(container, node, depth);
  }

  private renderNode(container: HTMLElement, node: TreeNode, depth: number): void {
    const isDir = node.type === 'tree';
    const childrenWrap = isDir ? h('div', { class: `${CSS_PREFIX}-node__children` }) : null;
    const row = createRow(node, depth, {
      onActivate: (n) => this.options.onNavigate(this.options.resolveUrl(n)),
      onToggle: () => childrenWrap && this.toggle(node, row, childrenWrap, depth),
    });

    this.rows.set(node.path, row);
    container.appendChild(row.el);
    if (childrenWrap) {
      childrenWrap.hidden = true;
      container.appendChild(childrenWrap);
      if (this.expanded.has(node.path)) this.expand(node, row, childrenWrap, depth);
    }
  }

  private toggle(node: TreeNode, row: NodeRow, wrap: HTMLElement, depth: number): void {
    if (this.expanded.has(node.path)) {
      this.expanded.delete(node.path);
      wrap.hidden = true;
      row.setExpanded(false);
    } else {
      this.expand(node, row, wrap, depth);
    }
  }

  private expand(node: TreeNode, row: NodeRow, wrap: HTMLElement, depth: number): void {
    if (!wrap.dataset.filled) {
      this.renderLevel(wrap, node.children, depth + 1);
      wrap.dataset.filled = '1';
    }
    this.expanded.add(node.path);
    wrap.hidden = false;
    row.setExpanded(true);
  }

  private highlightCurrent(): void {
    const row = this.options.currentPath && this.rows.get(this.options.currentPath);
    if (!row) return;
    row.setActive(true);
    row.el.scrollIntoView({ block: 'center' });
  }
}

function ancestorsOf(path: string): string[] {
  if (!path) return [];
  const parts = path.split('/');
  parts.pop();
  const result: string[] = [];
  parts.reduce((prefix, part) => {
    const next = prefix ? `${prefix}/${part}` : part;
    result.push(next);
    return next;
  }, '');
  return result;
}
