import type { TreeNode } from '../../core/types';
import { formatSize } from '../../core/format';
import { selectionBytes } from '../../core/selection';
import { CSS_PREFIX } from '../../shared/constants';
import { h } from '../dom';

export interface DownloadBarCallbacks {
  onDownload: () => void;
  onCancel: () => void;
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
  const button = h('button', {
    class: `${CSS_PREFIX}-dl__button`,
    type: 'button',
    on: {
      click: () => (button.dataset.mode === 'busy' ? callbacks.onCancel() : callbacks.onDownload()),
    },
  });
  const el = h('div', { class: `${CSS_PREFIX}-dl`, attrs: { hidden: 'true' } }, label, button);

  const idle = () => {
    button.dataset.mode = 'idle';
    button.classList.remove(`${CSS_PREFIX}-dl__button--cancel`);
    button.textContent = blobs.length > 1 ? 'Download ZIP' : 'Download';
    button.title = 'Download the selected files';
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
      label.textContent = text;
    },
    setIdle: idle,
  };
}
