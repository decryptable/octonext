import type { TreeNode } from '../../core/types';
import { formatSize } from '../../core/format';
import { selectionBytes } from '../../core/selection';
import { CSS_PREFIX } from '../../shared/constants';
import { h } from '../dom';

export interface DownloadBar {
  el: HTMLElement;
  update: (blobs: TreeNode[]) => void;
  setBusy: (text: string | null) => void;
}

export function downloadBar(onDownload: () => void): DownloadBar {
  const label = h('span', { class: `${CSS_PREFIX}-dl__label` });
  const button = h('button', {
    class: `${CSS_PREFIX}-dl__button`,
    type: 'button',
    text: 'Download',
    title: 'Download the selected files',
    on: { click: onDownload },
  });
  const el = h('div', { class: `${CSS_PREFIX}-dl`, attrs: { hidden: 'true' } }, label, button);

  return {
    el,
    update: (blobs) => {
      el.hidden = blobs.length === 0;
      const noun = blobs.length === 1 ? 'file' : 'files';
      label.textContent = `${blobs.length} ${noun} · ${formatSize(selectionBytes(blobs))}`;
      button.textContent = blobs.length > 1 ? 'Download ZIP' : 'Download';
    },
    setBusy: (text) => {
      button.disabled = text != null;
      if (text) button.textContent = text;
    },
  };
}
