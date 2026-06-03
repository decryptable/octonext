import type { RepoRef } from '../../core/types';
import { CSS_PREFIX } from '../../shared/constants';
import { ICONS } from '../icons';
import { h, svg } from '../dom';

export interface HeaderCallbacks {
  onRefresh: () => void;
  onSettings: () => void;
  onClose: () => void;
}

export interface SidebarHeader {
  el: HTMLElement;
  setRepo: (ref: RepoRef) => void;
}

export function createHeader(callbacks: HeaderCallbacks): SidebarHeader {
  const title = h('span', { class: `${CSS_PREFIX}-header__repo`, text: '—' });
  const branch = h('span', { class: `${CSS_PREFIX}-header__branch` });

  const el = h(
    'header',
    { class: `${CSS_PREFIX}-header` },
    svg(ICONS.logo, `${CSS_PREFIX}-header__logo`),
    h('div', { class: `${CSS_PREFIX}-header__titles` }, title, branch),
    iconButton('refresh', 'Reload tree', callbacks.onRefresh),
    iconButton('settings', 'Settings', callbacks.onSettings),
    iconButton('close', 'Hide sidebar', callbacks.onClose),
  );

  return {
    el,
    setRepo: (ref) => {
      title.textContent = `${ref.owner}/${ref.repo}`;
      title.title = `${ref.owner}/${ref.repo}`;
      branch.textContent = ref.branch;
    },
  };
}

function iconButton(icon: keyof typeof ICONS, label: string, onClick: () => void): HTMLElement {
  return h(
    'button',
    {
      class: `${CSS_PREFIX}-header__action`,
      type: 'button',
      title: label,
      attrs: { 'aria-label': label },
      on: { click: onClick },
    },
    svg(ICONS[icon]),
  );
}
