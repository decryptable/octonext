import type { PullComment } from '../../core/types';
import { CSS_PREFIX } from '../../shared/constants';
import { h } from '../dom';

export function prComments(comments: PullComment[], onOpen: (url: string) => void): HTMLElement {
  return h(
    'section',
    { class: `${CSS_PREFIX}-pr__section` },
    h('span', {
      class: `${CSS_PREFIX}-pr__heading`,
      text: `Review comments (${comments.length})`,
    }),
    ...comments.map((comment) => commentRow(comment, onOpen)),
  );
}

function commentRow(comment: PullComment, onOpen: (url: string) => void): HTMLElement {
  const where = comment.path ?? 'general';
  return h(
    'div',
    {
      class: `${CSS_PREFIX}-pr__comment`,
      title: `Open ${comment.author}'s comment on ${where}`,
      attrs: { tabindex: '0' },
      on: {
        click: () => onOpen(comment.url),
        keydown: (event) => {
          if ((event as KeyboardEvent).key === 'Enter') onOpen(comment.url);
        },
      },
    },
    h('span', {
      class: `${CSS_PREFIX}-pr__comment-meta`,
      text: `${comment.author} · ${where}`,
    }),
    h('span', {
      class: `${CSS_PREFIX}-pr__comment-body`,
      text: comment.body.slice(0, 200),
    }),
  );
}
