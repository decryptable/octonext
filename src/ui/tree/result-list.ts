import type { IconResolver } from '../../core/icons/icon-resolver';
import type { TreeNode } from '../../core/types';
import { CSS_PREFIX } from '../../shared/constants';
import { h } from '../dom';
import { renderNodeIcon } from './node-icon';

export interface ResultListOptions {
  nodes: TreeNode[];
  resolver: IconResolver;
  resolveUrl: (node: TreeNode) => string;
  onNavigate: (url: string) => void;
}

export function resultList(options: ResultListOptions): HTMLElement {
  const list = h('div', { class: `${CSS_PREFIX}-results`, attrs: { role: 'list' } });
  if (options.nodes.length === 0) {
    list.appendChild(h('p', { class: `${CSS_PREFIX}-results__empty`, text: 'No matches' }));
    return list;
  }
  for (const node of options.nodes) list.appendChild(resultRow(node, options));
  return list;
}

function resultRow(node: TreeNode, options: ResultListOptions): HTMLElement {
  const iconBox = h('span', { class: `${CSS_PREFIX}-node__icon-box` });
  renderNodeIcon(iconBox, options.resolver, node, false);
  const dir = node.path.includes('/') ? node.path.slice(0, node.path.lastIndexOf('/')) : '';
  return h(
    'div',
    {
      class: `${CSS_PREFIX}-result`,
      attrs: { role: 'listitem', tabindex: '0', title: node.path },
      on: {
        click: () => options.onNavigate(options.resolveUrl(node)),
        keydown: (event) => {
          if ((event as KeyboardEvent).key === 'Enter')
            options.onNavigate(options.resolveUrl(node));
        },
      },
    },
    iconBox,
    h(
      'span',
      { class: `${CSS_PREFIX}-result__text` },
      h('span', { class: `${CSS_PREFIX}-result__name`, text: node.name }),
      dir && h('span', { class: `${CSS_PREFIX}-result__path`, text: dir }),
    ),
  );
}
