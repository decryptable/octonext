import type { Adapter } from '../core/adapters/adapter';
import type { IconResolver } from '../core/icons/icon-resolver';
import type { Bookmark, PullData, RepoContext, RepoTree } from '../core/types';
import { message } from '../ui/components/message';
import { bookmarksPanel } from '../ui/panels/bookmarks-panel';
import { FilesPanel } from '../ui/panels/files-panel';
import { prPanel } from '../ui/panels/pr-panel';
import type { Sidebar } from '../ui/sidebar/sidebar';
import { navigateTo } from './navigate';
import { openDiffFile } from './pr-nav';

export function renderFiles(
  sidebar: Sidebar,
  tree: RepoTree,
  resolver: IconResolver,
  adapter: Adapter,
): void {
  if (tree.root.children.length === 0) {
    sidebar.setPanel('files', message('info', 'This repository is empty.'));
    return;
  }
  const panel = new FilesPanel({
    tree,
    resolver,
    resolveUrl: (node) => adapter.nodeUrl(node, tree.ref),
    onNavigate: navigateTo,
  });
  sidebar.setPanel('files', panel.el);
}

export function renderPull(sidebar: Sidebar, pull: PullData, context: RepoContext): void {
  sidebar.setPanel(
    'pr',
    prPanel({
      pull,
      onOpenFile: (anchor) => openDiffFile(context, anchor),
      onOpenComment: navigateTo,
    }),
  );
}

export function renderBookmarks(
  sidebar: Sidebar,
  bookmarks: Bookmark[],
  onRemove: (id: string) => void,
): void {
  sidebar.setPanel('bookmarks', bookmarksPanel({ bookmarks, onOpen: navigateTo, onRemove }));
}
