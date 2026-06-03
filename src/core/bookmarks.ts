import { browser } from '../shared/browser';
import { APP_SLUG } from '../shared/constants';
import type { Bookmark } from './types';

const KEY = `${APP_SLUG}:bookmarks`;

export type BookmarksListener = (bookmarks: Bookmark[]) => void;

export async function loadBookmarks(): Promise<Bookmark[]> {
  const stored = await browser.storage.local.get(KEY);
  return (stored[KEY] as Bookmark[] | undefined) ?? [];
}

async function persist(bookmarks: Bookmark[]): Promise<Bookmark[]> {
  await browser.storage.local.set({ [KEY]: bookmarks });
  return bookmarks;
}

export async function addBookmark(bookmark: Bookmark): Promise<Bookmark[]> {
  const current = await loadBookmarks();
  if (current.some((item) => item.id === bookmark.id)) return current;
  return persist([bookmark, ...current]);
}

export async function removeBookmark(id: string): Promise<Bookmark[]> {
  const current = await loadBookmarks();
  return persist(current.filter((item) => item.id !== id));
}

export async function isBookmarked(id: string): Promise<boolean> {
  return (await loadBookmarks()).some((item) => item.id === id);
}

export function watchBookmarks(listener: BookmarksListener): () => void {
  const handler = (changes: Record<string, { newValue?: unknown }>, area: string) => {
    if (area !== 'local' || !changes[KEY]) return;
    listener((changes[KEY].newValue as Bookmark[] | undefined) ?? []);
  };
  browser.storage.onChanged.addListener(handler);
  return () => browser.storage.onChanged.removeListener(handler);
}

export function bookmarkId(url: string): string {
  return url.replace(/^https?:\/\//, '');
}
