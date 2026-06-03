import type { TreeNode } from '../../core/types';
import { CSS_PREFIX } from '../../shared/constants';
import { ICONS } from '../icons';
import { h, svg } from '../dom';
import { nodeIcon } from './node-icon';

const INDENT = 14;

export interface RowCallbacks {
  onActivate: (node: TreeNode) => void;
  onToggle: (node: TreeNode) => void;
}

export interface NodeRow {
  el: HTMLElement;
  setExpanded: (expanded: boolean) => void;
  setActive: (active: boolean) => void;
}

export function createRow(node: TreeNode, depth: number, callbacks: RowCallbacks): NodeRow {
  const isDir = node.type === 'tree';
  const chevron = svg(ICONS.chevron, `${CSS_PREFIX}-node__chevron`);
  const row = h(
    'div',
    {
      class: `${CSS_PREFIX}-node ${CSS_PREFIX}-node--${node.type}`,
      style: { paddingLeft: `${depth * INDENT + 6}px` },
      attrs: { role: 'treeitem', tabindex: '0', title: node.path },
      on: {
        click: () => (isDir ? callbacks.onToggle(node) : callbacks.onActivate(node)),
        keydown: (event) => onKeydown(event as KeyboardEvent, node, isDir, callbacks),
      },
    },
    isDir ? chevron : h('span', { class: `${CSS_PREFIX}-node__chevron--spacer` }),
    nodeIcon(node),
    h('span', { class: `${CSS_PREFIX}-node__label`, text: node.name }),
  );

  return {
    el: row,
    setExpanded: (expanded) => row.classList.toggle(`${CSS_PREFIX}-node--expanded`, expanded),
    setActive: (active) => row.classList.toggle(`${CSS_PREFIX}-node--active`, active),
  };
}

function onKeydown(event: KeyboardEvent, node: TreeNode, isDir: boolean, callbacks: RowCallbacks) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  if (isDir) callbacks.onToggle(node);
  else callbacks.onActivate(node);
}
