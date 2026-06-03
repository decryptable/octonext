import type { PullData } from '../../core/types';
import { diffAnchor } from '../../core/github/pulls';
import { CSS_PREFIX } from '../../shared/constants';
import { h } from '../dom';
import { PrFiles } from './pr-files';
import { prComments } from './pr-comments';
import { prSummary } from './pr-summary';

export interface PrPanelOptions {
  pull: PullData;
  onOpenFile: (anchor: string) => void;
  onOpenComment: (url: string) => void;
}

export function prPanel(options: PrPanelOptions): HTMLElement {
  const { pull } = options;
  const files = new PrFiles({
    files: pull.files,
    onOpen: (path) => void diffAnchor(path).then(options.onOpenFile),
  });
  const children: HTMLElement[] = [prSummary(pull), files.el];
  if (pull.comments.length > 0) {
    children.push(prComments(pull.comments, options.onOpenComment));
  }
  return h('div', { class: `${CSS_PREFIX}-pr` }, ...children);
}
