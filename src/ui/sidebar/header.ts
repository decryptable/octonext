import type { RepoRef } from '../../core/types';
import { CSS_PREFIX } from '../../shared/constants';
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
  setRepo: (ref: RepoRef) => void;
  setBookmarked: (active: boolean) => void;
}

export function createHeader(callbacks: HeaderCallbacks): SidebarHeader {
  const title = h('span', { class: `${CSS_PREFIX}-header__repo`, text: '—' });
  const branch = h('span', { class: `${CSS_PREFIX}-header__branch` });
  const star = iconButton('star', 'Bookmark repository', callbacks.onBookmark);

  const el = h(
    'header',
    { class: `${CSS_PREFIX}-header` },
    svg(ICONS.logo, `${CSS_PREFIX}-header__logo`),
    h('div', { class: `${CSS_PREFIX}-header__titles` }, title, branch),
    star.el,
    iconButton('dock', 'Switch side', callbacks.onDock).el,
    iconButton('refresh', 'Reload tree', callbacks.onRefresh).el,
    iconButton('settings', 'Settings', callbacks.onSettings).el,
    iconButton('close', 'Hide sidebar', callbacks.onClose).el,
  );

  return {
    el,
    setRepo: (ref) => {
      title.textContent = `${ref.owner}/${ref.repo}`;
      title.title = `${ref.owner}/${ref.repo}`;
      branch.textContent = ref.branch;
    },
    setBookmarked: (active) => bookmarkState(star, active),
  };
}

function bookmarkState(star: IconButton, active: boolean): void {
  star.setActive(active);
  star.el.title = active ? 'Remove bookmark' : 'Bookmark repository';
}
