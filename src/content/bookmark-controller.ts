import { loadBookmarks, removeBookmark, watchBookmarks } from '../core/bookmarks';
import type { Bookmark, RepoContext } from '../core/types';
import type { Sidebar } from '../ui/sidebar/sidebar';
import { isRepoBookmarked, toggleRepoBookmark } from './bookmark';
import { renderBookmarks } from './render';

export class BookmarkController {
  private bookmarks: Bookmark[] = [];

  constructor(
    private readonly sidebar: Sidebar,
    private readonly getContext: () => RepoContext | null,
  ) {}

  async init(): Promise<void> {
    this.bookmarks = await loadBookmarks();
    this.render();
    watchBookmarks((bookmarks) => {
      this.bookmarks = bookmarks;
      this.render();
      this.syncStar();
    });
  }

  async toggle(): Promise<void> {
    const context = this.getContext();
    if (context) await toggleRepoBookmark(this.bookmarks, context);
  }

  syncStar(): void {
    this.sidebar.setBookmarked(isRepoBookmarked(this.bookmarks, this.getContext()));
  }

  private render(): void {
    renderBookmarks(this.sidebar, this.bookmarks, (id) => void removeBookmark(id));
  }
}
