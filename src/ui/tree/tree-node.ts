import type { IconResolver } from '../../core/icons/icon-resolver';
import type { TreeNode } from '../../core/types';
import { formatSize } from '../../core/format';
import { CSS_PREFIX } from '../../shared/constants';
import { h, svg } from '../dom';
import { ICONS } from '../icons';
import { renderNodeIcon } from './node-icon';

const INDENT = 14;

export interface RowCallbacks {
  onActivate: (node: TreeNode) => void;
  onToggle: (node: TreeNode) => void;
  onSelect: (node: TreeNode, selected: boolean) => void;
}

export interface NodeRow {
  el: HTMLElement;
  setExpanded: (expanded: boolean) => void;
  setActive: (active: boolean) => void;
  setSelected: (state: boolean | 'partial') => void;
}

export function createRow(
  node: TreeNode,
  depth: number,
  resolver: IconResolver,
  callbacks: RowCallbacks,
): NodeRow {
  const isDir = node.type === 'tree';
  const checkbox = h('input', {
    class: `${CSS_PREFIX}-node__check`,
    type: 'checkbox',
    title: 'Select for download',
    attrs: { 'aria-label': `Select ${node.name}` },
    on: {
      click: (event) => event.stopPropagation(),
      change: () => callbacks.onSelect(node, checkbox.checked),
    },
  });
  const iconBox = h('span', { class: `${CSS_PREFIX}-node__icon-box` });
  renderNodeIcon(iconBox, resolver, node, false);
  const chevron = isDir
    ? svg(ICONS.chevron, `${CSS_PREFIX}-node__chevron`)
    : h('span', { class: `${CSS_PREFIX}-node__chevron--spacer` });

  const row = h(
    'div',
    {
      class: `${CSS_PREFIX}-node ${CSS_PREFIX}-node--${node.type}`,
      style: { paddingLeft: `${depth * INDENT + 4}px` },
      attrs: { role: 'treeitem', tabindex: '0', title: titleFor(node) },
      on: {
        click: () => (isDir ? callbacks.onToggle(node) : callbacks.onActivate(node)),
        keydown: (event) => onKeydown(event as KeyboardEvent, node, isDir, callbacks),
      },
    },
    checkbox,
    chevron,
    iconBox,
    h('span', { class: `${CSS_PREFIX}-node__label`, text: node.name }),
    h('span', { class: `${CSS_PREFIX}-node__size`, text: formatSize(node.size ?? 0) }),
  );

  return {
    el: row,
    setExpanded: (expanded) => {
      row.classList.toggle(`${CSS_PREFIX}-node--expanded`, expanded);
      if (isDir) renderNodeIcon(iconBox, resolver, node, expanded);
    },
    setActive: (active) => row.classList.toggle(`${CSS_PREFIX}-node--active`, active),
    setSelected: (state) => {
      checkbox.checked = state === true;
      checkbox.indeterminate = state === 'partial';
    },
  };
}

function titleFor(node: TreeNode): string {
  return `${node.path} · ${formatSize(node.size ?? 0)}`;
}

function onKeydown(event: KeyboardEvent, node: TreeNode, isDir: boolean, callbacks: RowCallbacks) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  if (isDir) callbacks.onToggle(node);
  else callbacks.onActivate(node);
}
