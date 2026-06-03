import { CSS_PREFIX, ELEMENT_IDS } from '../../shared/constants';
import { ICONS } from '../icons';
import { h, svg } from '../dom';

export interface ToggleCallbacks {
  onClick: () => void;
  onOffsetCommit: (offset: number) => void;
}

export interface ToggleButton {
  el: HTMLElement;
  setOpen: (open: boolean) => void;
  setOffset: (offset: number) => void;
}

const DRAG_THRESHOLD = 4;

export function createToggle(callbacks: ToggleCallbacks): ToggleButton {
  const el = h(
    'button',
    {
      class: `${CSS_PREFIX}-toggle`,
      type: 'button',
      title: 'Toggle code tree (drag to move)',
      attrs: { id: ELEMENT_IDS.toggle, 'aria-label': 'Toggle code tree' },
    },
    svg(ICONS.logo, `${CSS_PREFIX}-toggle__icon`),
  );

  let startY = 0;
  let startTop = 0;
  let dragging = false;

  const onMove = (event: PointerEvent) => {
    const delta = event.clientY - startY;
    if (!dragging && Math.abs(delta) < DRAG_THRESHOLD) return;
    dragging = true;
    el.style.top = `${clampTop(startTop + delta)}px`;
  };

  const onUp = () => {
    el.removeEventListener('pointermove', onMove);
    el.classList.remove(`${CSS_PREFIX}-toggle--dragging`);
    if (dragging) callbacks.onOffsetCommit(parseInt(el.style.top, 10));
    else callbacks.onClick();
  };

  el.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    dragging = false;
    startY = event.clientY;
    startTop = el.getBoundingClientRect().top;
    el.setPointerCapture(event.pointerId);
    el.classList.add(`${CSS_PREFIX}-toggle--dragging`);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp, { once: true });
  });

  return {
    el,
    setOpen: (open) => el.classList.toggle(`${CSS_PREFIX}-toggle--active`, open),
    setOffset: (offset) => (el.style.top = `${clampTop(offset)}px`),
  };
}

function clampTop(value: number): number {
  return Math.min(window.innerHeight - 48, Math.max(8, value));
}
