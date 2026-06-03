import { bookmarkId } from '../core/bookmarks';
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
