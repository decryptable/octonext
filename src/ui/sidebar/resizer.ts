import type { DockSide } from '../../shared/settings';
import { CSS_PREFIX, SIDEBAR_WIDTH } from '../../shared/constants';
import { h } from '../dom';

export interface ResizerCallbacks {
  getWidth: () => number;
  getDock: () => DockSide;
  onResize: (width: number) => void;
  onCommit: (width: number) => void;
}

export function createResizer(callbacks: ResizerCallbacks): HTMLElement {
  let startX = 0;
  let startWidth = 0;
  let width = 0;

  const handle = h('div', {
    class: `${CSS_PREFIX}-resizer`,
    attrs: { role: 'separator', 'aria-orientation': 'vertical' },
  });

  const onMove = (event: PointerEvent) => {
    const delta = event.clientX - startX;
    width = clamp(startWidth + (callbacks.getDock() === 'left' ? delta : -delta));
    callbacks.onResize(width);
  };

  const onUp = () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    document.body.classList.remove(`${CSS_PREFIX}-resizing`);
    callbacks.onCommit(width);
  };

  handle.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    startX = event.clientX;
    startWidth = callbacks.getWidth();
    width = startWidth;
    document.body.classList.add(`${CSS_PREFIX}-resizing`);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  });

  return handle;
}

function clamp(value: number): number {
  return Math.min(SIDEBAR_WIDTH.max, Math.max(SIDEBAR_WIDTH.min, value));
}
