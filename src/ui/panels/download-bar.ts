import type { TreeNode } from '../../core/types';
import { formatSize } from '../../core/format';
import { selectionBytes } from '../../core/selection';
import { CSS_PREFIX } from '../../shared/constants';
import { ICONS } from '../icons';
import { h, svg } from '../dom';

export interface DownloadBarCallbacks {
  onDownload: () => void;
  onCancel: () => void;
  onClear: () => void;
}

export interface DownloadBar {
  el: HTMLElement;
  update: (blobs: TreeNode[]) => void;
  setProgress: (text: string) => void;
  setIdle: () => void;
}

export function downloadBar(callbacks: DownloadBarCallbacks): DownloadBar {
  let blobs: TreeNode[] = [];
  const label = h('span', { class: `${CSS_PREFIX}-dl__label` });
  const clear = h(
    'button',
    {
      class: `${CSS_PREFIX}-dl__clear`,
      type: 'button',
      title: 'Clear selection',
      attrs: { 'aria-label': 'Clear selection' },
      on: { click: () => callbacks.onClear() },
    },
    svg(ICONS.close),
  );
  const button = h('button', {
    class: `${CSS_PREFIX}-dl__button`,
    type: 'button',
    on: {
      click: () => (button.dataset.mode === 'busy' ? callbacks.onCancel() : callbacks.onDownload()),
    },
  });
  const el = h(
    'div',
    { class: `${CSS_PREFIX}-dl`, attrs: { hidden: 'true' } },
    label,
    clear,
    button,
  );

  const idle = () => {
    button.dataset.mode = 'idle';
    button.classList.remove(`${CSS_PREFIX}-dl__button--cancel`);
    button.textContent = blobs.length > 1 ? 'Download ZIP' : 'Download';
    button.title = 'Download the selected files';
    clear.hidden = false;
    label.textContent = `${blobs.length} ${blobs.length === 1 ? 'file' : 'files'} · ${formatSize(selectionBytes(blobs))}`;
  };

  return {
    el,
    update: (next) => {
      blobs = next;
      el.hidden = next.length === 0;
      idle();
    },
    setProgress: (text) => {
      button.dataset.mode = 'busy';
      button.classList.add(`${CSS_PREFIX}-dl__button--cancel`);
      button.textContent = 'Cancel';
      button.title = 'Cancel the download';
      clear.hidden = true;
      label.textContent = text;
    },
    setIdle: idle,
  };
}
