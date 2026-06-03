import { CSS_PREFIX, ELEMENT_IDS } from '../../shared/constants';
import { ICONS } from '../icons';
import { h, svg } from '../dom';

export interface ToggleButton {
  el: HTMLElement;
  setOpen: (open: boolean) => void;
}

export function createToggle(onClick: () => void): ToggleButton {
  const el = h(
    'button',
    {
      class: `${CSS_PREFIX}-toggle`,
      type: 'button',
      attrs: { id: ELEMENT_IDS.toggle, 'aria-label': 'Toggle code tree' },
      on: { click: onClick },
    },
    svg(ICONS.logo, `${CSS_PREFIX}-toggle__icon`),
  );

  return {
    el,
    setOpen: (open) => el.classList.toggle(`${CSS_PREFIX}-toggle--active`, open),
  };
}
