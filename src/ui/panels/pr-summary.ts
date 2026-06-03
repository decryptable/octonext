import type { PullData, PullLabel, PullState } from '../../core/types';
import { CSS_PREFIX } from '../../shared/constants';
import { h } from '../dom';

const STATE_LABEL: Record<PullState, string> = {
  open: 'Open',
  merged: 'Merged',
  closed: 'Closed',
  draft: 'Draft',
};

export function prSummary(pull: PullData): HTMLElement {
  return h(
    'section',
    { class: `${CSS_PREFIX}-pr__summary` },
    titleRow(pull),
    branchRow(pull),
    statRow(pull),
    pull.labels.length > 0 && labelRow(pull.labels),
    pull.reviewers.length > 0 && reviewerRow(pull.reviewers),
  );
}

function titleRow(pull: PullData): HTMLElement {
  const badge = h('span', {
    class: `${CSS_PREFIX}-pr__badge ${CSS_PREFIX}-pr__badge--${pull.state}`,
    text: STATE_LABEL[pull.state],
  });
  return h(
    'div',
    { class: `${CSS_PREFIX}-pr__head` },
    h(
      'div',
      { class: `${CSS_PREFIX}-pr__title-row` },
      badge,
      h('span', {
        class: `${CSS_PREFIX}-pr__num`,
        text: `#${pull.number}`,
      }),
    ),
    h('div', { class: `${CSS_PREFIX}-pr__title`, title: pull.title, text: pull.title }),
    h('span', { class: `${CSS_PREFIX}-pr__author`, text: `by ${pull.author}` }),
  );
}

function branchRow(pull: PullData): HTMLElement {
  return h(
    'div',
    { class: `${CSS_PREFIX}-pr__branches` },
    h('code', { class: `${CSS_PREFIX}-pr__ref`, title: pull.baseRef, text: pull.baseRef }),
    h('span', { class: `${CSS_PREFIX}-pr__arrow`, text: '←' }),
    h('code', { class: `${CSS_PREFIX}-pr__ref`, title: pull.headRef, text: pull.headRef }),
  );
}

function stat(label: string, value: string, mod = ''): HTMLElement {
  return h(
    'div',
    { class: `${CSS_PREFIX}-pr__stat-box${mod ? ` ${CSS_PREFIX}-pr__stat-box--${mod}` : ''}` },
    h('span', { class: `${CSS_PREFIX}-pr__stat-value`, text: value }),
    h('span', { class: `${CSS_PREFIX}-pr__stat-label`, text: label }),
  );
}

function statRow(pull: PullData): HTMLElement {
  return h(
    'div',
    { class: `${CSS_PREFIX}-pr__stats` },
    stat('files', String(pull.changedFiles)),
    stat('commits', String(pull.commits)),
    stat('added', `+${pull.additions}`, 'add'),
    stat('removed', `-${pull.deletions}`, 'del'),
    stat('comments', String(pull.reviewComments)),
  );
}

function labelRow(labels: PullLabel[]): HTMLElement {
  return h(
    'div',
    { class: `${CSS_PREFIX}-pr__labels` },
    ...labels.map((label) =>
      h('span', {
        class: `${CSS_PREFIX}-pr__label`,
        text: label.name,
        style: { borderColor: label.color, color: label.color },
      }),
    ),
  );
}

function reviewerRow(reviewers: string[]): HTMLElement {
  return h(
    'div',
    { class: `${CSS_PREFIX}-pr__reviewers` },
    h('span', { class: `${CSS_PREFIX}-pr__reviewers-label`, text: 'Reviewers' }),
    ...reviewers.map((name) => h('span', { class: `${CSS_PREFIX}-pr__chip`, text: name })),
  );
}
