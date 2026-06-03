import type { PullState, PullSummary } from '../../core/types';
import { CSS_PREFIX } from '../../shared/constants';
import { h } from '../dom';

const STATE_LABEL: Record<PullState, string> = {
  open: 'Open',
  merged: 'Merged',
  closed: 'Closed',
  draft: 'Draft',
};

export interface PrListOptions {
  summaries: PullSummary[];
  onOpen: (pullNumber: number) => void;
}

export function prListPanel(options: PrListOptions): HTMLElement {
  const { summaries } = options;
  if (summaries.length === 0) {
    return h(
      'div',
      { class: `${CSS_PREFIX}-pr` },
      h('p', { class: `${CSS_PREFIX}-pr__empty`, text: 'No open pull requests' }),
    );
  }
  return h(
    'div',
    { class: `${CSS_PREFIX}-pr` },
    h('span', {
      class: `${CSS_PREFIX}-pr__heading ${CSS_PREFIX}-pr__heading--list`,
      text: `Open pull requests (${summaries.length})`,
    }),
    ...summaries.map((summary) => row(summary, options.onOpen)),
  );
}

function row(summary: PullSummary, onOpen: (pullNumber: number) => void): HTMLElement {
  const badge = h('span', {
    class: `${CSS_PREFIX}-pr__badge ${CSS_PREFIX}-pr__badge--${summary.state}`,
    text: STATE_LABEL[summary.state],
  });
  return h(
    'div',
    {
      class: `${CSS_PREFIX}-pr__item`,
      attrs: { tabindex: '0', title: summary.title },
      on: {
        click: () => onOpen(summary.number),
        keydown: (event) => {
          if ((event as KeyboardEvent).key === 'Enter') onOpen(summary.number);
        },
      },
    },
    h(
      'div',
      { class: `${CSS_PREFIX}-pr__item-top` },
      badge,
      h('span', { class: `${CSS_PREFIX}-pr__item-title`, text: summary.title }),
    ),
    h('span', {
      class: `${CSS_PREFIX}-pr__item-meta`,
      text: `#${summary.number} · ${summary.author} · ${summary.headRef}`,
    }),
  );
}
