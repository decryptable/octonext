import type { PullFile } from '../../core/types';
import { CSS_PREFIX } from '../../shared/constants';
import { appendChildren, h } from '../dom';
import { highlight } from '../tree/highlight';

export function prFileRow(
  file: PullFile,
  query: string,
  onOpen: (path: string) => void,
): HTMLElement {
  const name = h('span', { class: `${CSS_PREFIX}-pr__file-name` });
  appendChildren(
    name,
    highlight(file.path, query).map((seg) =>
      seg.match ? h('mark', { class: `${CSS_PREFIX}-mark`, text: seg.text }) : seg.text,
    ),
  );
  return h(
    'div',
    {
      class: `${CSS_PREFIX}-pr__file ${CSS_PREFIX}-pr__file--${file.status}`,
      attrs: { tabindex: '0', title: file.path },
      on: {
        click: () => onOpen(file.path),
        keydown: (event) => {
          if ((event as KeyboardEvent).key === 'Enter') onOpen(file.path);
        },
      },
    },
    h('span', { class: `${CSS_PREFIX}-pr__file-status`, attrs: { 'data-status': file.status } }),
    name,
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
