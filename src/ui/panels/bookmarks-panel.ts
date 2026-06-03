import type { Bookmark } from '../../core/types';
import { CSS_PREFIX } from '../../shared/constants';
import { iconButton } from '../components/icon-button';
import { h } from '../dom';

export interface BookmarksPanelOptions {
  bookmarks: Bookmark[];
  onOpen: (url: string) => void;
  onRemove: (id: string) => void;
}

export function bookmarksPanel(options: BookmarksPanelOptions): HTMLElement {
  const el = h('div', { class: `${CSS_PREFIX}-bookmarks` });
  if (options.bookmarks.length === 0) {
    el.appendChild(
      h('p', {
        class: `${CSS_PREFIX}-bookmarks__empty`,
        text: 'No bookmarks yet. Use the star button to save a repository or file.',
      }),
    );
    return el;
  }
  for (const bookmark of options.bookmarks) el.appendChild(row(bookmark, options));
  return el;
}

function row(bookmark: Bookmark, options: BookmarksPanelOptions): HTMLElement {
  const remove = iconButton('trash', 'Remove bookmark', () => options.onRemove(bookmark.id));
  return h(
    'div',
    { class: `${CSS_PREFIX}-bookmark ${CSS_PREFIX}-bookmark--${bookmark.type}` },
    h(
      'button',
      {
        class: `${CSS_PREFIX}-bookmark__open`,
        type: 'button',
        title: bookmark.url,
        on: { click: () => options.onOpen(bookmark.url) },
      },
      h('span', { class: `${CSS_PREFIX}-bookmark__label`, text: bookmark.label }),
      h('span', {
        class: `${CSS_PREFIX}-bookmark__url`,
        text: bookmark.url.replace(/^https?:\/\//, ''),
      }),
    ),
    remove.el,
  );
}
