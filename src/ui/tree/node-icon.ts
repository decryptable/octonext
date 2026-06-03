import type { TreeNode } from '../../core/types';
import { CSS_PREFIX } from '../../shared/constants';
import { ICONS } from '../icons';
import { svg } from '../dom';

export function nodeIcon(node: TreeNode): SVGElement {
  const name = node.type === 'tree' ? 'folder' : 'file';
  return svg(ICONS[name], `${CSS_PREFIX}-node__icon ${CSS_PREFIX}-node__icon--${name}`);
}
