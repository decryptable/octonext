import { CSS_PREFIX } from '../../shared/constants';
import { h, svg } from '../dom';
import { type IconName, ICONS } from '../icons';

export interface IconButton {
  el: HTMLButtonElement;
  setActive: (active: boolean) => void;
}

export function iconButton(icon: IconName, label: string, onClick: () => void): IconButton {
  const el = h(
    'button',
    {
      class: `${CSS_PREFIX}-icon-btn`,
      type: 'button',
      title: label,
      attrs: { 'aria-label': label },
      on: { click: onClick },
    },
    svg(ICONS[icon]),
  );
  return {
    el,
    setActive: (active) => el.classList.toggle(`${CSS_PREFIX}-icon-btn--active`, active),
  };
}
