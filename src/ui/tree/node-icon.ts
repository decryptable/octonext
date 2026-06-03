import type { IconResolver } from '../../core/icons/icon-resolver';
import type { TreeNode } from '../../core/types';
import { CSS_PREFIX } from '../../shared/constants';
import { clear, h, svg } from '../dom';
import { ICONS } from '../icons';

function imageIcon(url: string, fallback: string): HTMLImageElement {
  const img = h('img', {
    class: `${CSS_PREFIX}-node__icon`,
    attrs: { src: url, alt: '', loading: 'lazy', decoding: 'async' },
  });
  img.addEventListener(
    'error',
    () => {
      if (img.src !== fallback) img.src = fallback;
    },
    { once: true },
  );
  return img;
}

function inlineIcon(node: TreeNode): SVGElement {
  const variant = node.type === 'tree' ? 'folder' : 'file';
  return svg(ICONS[variant], `${CSS_PREFIX}-node__icon ${CSS_PREFIX}-node__icon--${variant}`);
}

export function renderNodeIcon(
  container: HTMLElement,
  resolver: IconResolver,
  node: TreeNode,
  expanded: boolean,
): void {
  clear(container);
  if (node.type === 'tree') {
    const url = resolver.folderUrl(node.name, expanded);
    container.appendChild(
      url ? imageIcon(url, resolver.fallbackFolderUrl(expanded)) : inlineIcon(node),
    );
    return;
  }
  const url = resolver.fileUrl(node.name);
  container.appendChild(url ? imageIcon(url, resolver.fallbackFileUrl()) : inlineIcon(node));
}
