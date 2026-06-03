import type { RepoRef } from '../../core/types';
import { formatSize } from '../../core/format';
import { CSS_PREFIX, DONATE_URL } from '../../shared/constants';
import { type IconButton, iconButton } from '../components/icon-button';
import { h, svg } from '../dom';
import { ICONS } from '../icons';

export interface HeaderCallbacks {
  onBookmark: () => void;
  onDock: () => void;
  onRefresh: () => void;
  onSettings: () => void;
  onClose: () => void;
}

export interface SidebarHeader {
  el: HTMLElement;
  setRepo: (ref: RepoRef, totalSize: number) => void;
  setBookmarked: (active: boolean) => void;
}

export function createHeader(callbacks: HeaderCallbacks): SidebarHeader {
  const title = h('span', { class: `${CSS_PREFIX}-header__repo`, text: '—' });
  const branch = h('span', { class: `${CSS_PREFIX}-header__branch` });
  const size = h('span', { class: `${CSS_PREFIX}-header__size` });
  const star = iconButton('star', 'Bookmark repository', callbacks.onBookmark);
  star.el.classList.add(`${CSS_PREFIX}-header__star`);

  const close = iconButton('close', 'Hide sidebar', callbacks.onClose);
  close.el.classList.add(`${CSS_PREFIX}-header__close`);

  const el = h(
    'header',
    { class: `${CSS_PREFIX}-header` },
    svg(ICONS.logo, `${CSS_PREFIX}-header__logo`),
    h(
      'div',
      { class: `${CSS_PREFIX}-header__titles` },
      title,
      h('span', { class: `${CSS_PREFIX}-header__meta` }, branch, size),
    ),
    h(
      'div',
      { class: `${CSS_PREFIX}-header__actions` },
      donateButton(),
      star.el,
      iconButton('dock', 'Switch side', callbacks.onDock).el,
      iconButton('refresh', 'Reload tree', callbacks.onRefresh).el,
      iconButton('settings', 'Settings', callbacks.onSettings).el,
      close.el,
    ),
  );

  return {
    el,
    setRepo: (ref, totalSize) => {
      title.textContent = `${ref.owner}/${ref.repo}`;
      title.title = `${ref.owner}/${ref.repo}`;
      branch.textContent = ref.branch;
      size.textContent = totalSize ? `· ${formatSize(totalSize)}` : '';
      size.title = 'Total repository size';
    },
    setBookmarked: (active) => bookmarkState(star, active),
  };
}

function donateButton(): HTMLElement {
  return h(
    'a',
    {
      class: `${CSS_PREFIX}-icon-btn ${CSS_PREFIX}-header__donate`,
      href: DONATE_URL,
      title: 'Support the developer',
      attrs: { target: '_blank', rel: 'noreferrer noopener', 'aria-label': 'Donate' },
    },
    svg(ICONS.heart),
  );
}

function bookmarkState(star: IconButton, active: boolean): void {
  star.setActive(active);
  star.el.title = active ? 'Remove bookmark' : 'Bookmark repository';
}
