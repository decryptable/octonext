import { addBookmark, bookmarkId, removeBookmark } from '../core/bookmarks';
import type { Bookmark, RepoContext } from '../core/types';

export function repoBookmark(context: RepoContext): Bookmark {
  const url = `https://${context.host}/${context.owner}/${context.repo}`;
  return {
    id: bookmarkId(url),
    type: 'repo',
    label: `${context.owner}/${context.repo}`,
    url,
    addedAt: Date.now(),
  };
}

export function isRepoBookmarked(bookmarks: Bookmark[], context: RepoContext | null): boolean {
  if (!context) return false;
  const id = repoBookmark(context).id;
  return bookmarks.some((item) => item.id === id);
}

export async function toggleRepoBookmark(
  bookmarks: Bookmark[],
  context: RepoContext,
): Promise<void> {
  const bookmark = repoBookmark(context);
  if (bookmarks.some((item) => item.id === bookmark.id)) await removeBookmark(bookmark.id);
  else await addBookmark(bookmark);
}
