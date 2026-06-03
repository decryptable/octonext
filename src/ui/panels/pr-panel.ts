import type { PullData, PullFile } from '../../core/types';
import { diffAnchor } from '../../core/github/pulls';
import { CSS_PREFIX } from '../../shared/constants';
import { h } from '../dom';

export interface PrPanelOptions {
  pull: PullData;
  onOpenFile: (anchor: string) => void;
  onOpenComment: (url: string) => void;
}

export function prPanel(options: PrPanelOptions): HTMLElement {
  const { pull } = options;
  return h(
    'div',
    { class: `${CSS_PREFIX}-pr` },
    section(
      `Changed files (${pull.files.length})`,
      pull.files.map((file) => fileRow(file, options)),
    ),
    pull.comments.length > 0 &&
      section(
        `Comments (${pull.comments.length})`,
        pull.comments.map((comment) =>
          commentRow(comment.path ?? 'general', comment.author, comment.body, comment.url, options),
        ),
      ),
  );
}

function section(title: string, rows: HTMLElement[]): HTMLElement {
  return h(
    'section',
    { class: `${CSS_PREFIX}-pr__section` },
    h('h2', { class: `${CSS_PREFIX}-pr__heading`, text: title }),
    ...rows,
  );
}

function fileRow(file: PullFile, options: PrPanelOptions): HTMLElement {
  return h(
    'div',
    {
      class: `${CSS_PREFIX}-pr__file ${CSS_PREFIX}-pr__file--${file.status}`,
      attrs: { tabindex: '0', title: file.path },
      on: { click: () => void diffAnchor(file.path).then(options.onOpenFile) },
    },
    h('span', { class: `${CSS_PREFIX}-pr__file-name`, text: file.path }),
    h('span', {
      class: `${CSS_PREFIX}-pr__stat ${CSS_PREFIX}-pr__stat--add`,
      text: `+${file.additions}`,
    }),
    h('span', {
      class: `${CSS_PREFIX}-pr__stat ${CSS_PREFIX}-pr__stat--del`,
      text: `-${file.deletions}`,
    }),
  );
}

function commentRow(
  path: string,
  author: string,
  body: string,
  url: string,
  options: PrPanelOptions,
): HTMLElement {
  return h(
    'div',
    {
      class: `${CSS_PREFIX}-pr__comment`,
      title: `Open ${author}'s comment on ${path}`,
      attrs: { tabindex: '0' },
      on: { click: () => options.onOpenComment(url) },
    },
    h('span', { class: `${CSS_PREFIX}-pr__comment-meta`, text: `${author} · ${path}` }),
    h('span', { class: `${CSS_PREFIX}-pr__comment-body`, text: body.slice(0, 160) }),
  );
}
