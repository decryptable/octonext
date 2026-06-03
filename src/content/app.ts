import { GitHubAdapter } from '../core/adapters/github-adapter';
import { sameRepoTarget } from '../core/adapters/repo-context';
import { addBookmark, loadBookmarks, removeBookmark, watchBookmarks } from '../core/bookmarks';
import { IconResolver } from '../core/icons/icon-resolver';
import { observeNavigation } from '../core/navigation/spa-observer';
import type { Bookmark, RepoContext, RepoTree } from '../core/types';
import { ROOT_CLASS } from '../shared/constants';
import { injectFontFaces } from '../shared/fonts';
import { sendMessage } from '../shared/messaging';
import type { Settings } from '../shared/settings';
import { loadSettings, saveSettings, watchSettings } from '../shared/storage';
import { spinner } from '../ui/components/spinner';
import { Sidebar } from '../ui/sidebar/sidebar';
import { applyAppearance } from './appearance';
import { repoBookmark } from './bookmark';
import { buildErrorView } from './error-view';
import { renderBookmarks, renderFiles, renderPull } from './render';

export class OctoNextApp {
  private readonly adapter = new GitHubAdapter(location.hostname);
  private readonly sidebar: Sidebar;
  private settings!: Settings;
  private resolver!: IconResolver;
  private context: RepoContext | null = null;
  private tree: RepoTree | null = null;
  private bookmarks: Bookmark[] = [];

  constructor() {
    this.sidebar = new Sidebar({
      onBookmark: () => void this.toggleBookmark(),
      onRefresh: () => void this.load(),
      onSettings: () => this.openOptions(),
      onTabChange: (id) => this.sidebar.showTab(id),
      onDockChange: (dock) => this.persist({ dock }),
      onWidthCommit: (sidebarWidth) => this.persist({ sidebarWidth }),
      onToggleOffsetCommit: (toggleOffset) => this.persist({ toggleOffset }),
    });
  }

  async start(): Promise<void> {
    this.settings = await loadSettings();
    injectFontFaces();
    this.resolver = await IconResolver.create(this.settings.iconPack);
    document.documentElement.appendChild(this.sidebar.root);
    applyAppearance(this.sidebar, this.settings);
    this.bookmarks = await loadBookmarks();
    renderBookmarks(this.sidebar, this.bookmarks, (id) => void removeBookmark(id));
    watchSettings((settings) => void this.onSettingsChange(settings));
    watchBookmarks((bookmarks) => this.onBookmarksChange(bookmarks));
    observeNavigation((url) => this.onNavigate(url));
    this.onNavigate(new URL(location.href));
  }

  private async onSettingsChange(settings: Settings): Promise<void> {
    const iconChanged = settings.iconPack !== this.settings.iconPack;
    this.settings = settings;
    if (iconChanged) this.resolver = await IconResolver.create(settings.iconPack);
    applyAppearance(this.sidebar, settings);
    if (iconChanged && this.tree) renderFiles(this.sidebar, this.tree, this.resolver, this.adapter);
  }

  private onBookmarksChange(bookmarks: Bookmark[]): void {
    this.bookmarks = bookmarks;
    renderBookmarks(this.sidebar, bookmarks, (id) => void removeBookmark(id));
    this.syncStar();
  }

  private onNavigate(url: URL): void {
    const next = this.adapter.getContext(url);
    document.documentElement.classList.toggle(ROOT_CLASS.hasRepo, Boolean(next));
    this.sidebar.setTabVisible('pr', next?.view === 'pull');
    if (sameRepoTarget(next, this.context)) return;
    this.context = next;
    this.tree = null;
    this.syncStar();
    if (next) void this.load();
  }

  private async load(): Promise<void> {
    const context = this.context;
    if (!context) return;
    if (!this.sidebar.isOpen()) this.sidebar.setOpen(true);
    await this.loadTree(context);
    if (context.view === 'pull') await this.loadPull(context);
  }

  private async loadTree(context: RepoContext): Promise<void> {
    this.sidebar.setPanel('files', spinner());
    if (context.view !== 'pull') this.sidebar.showTab('files');
    try {
      const tree = await this.adapter.loadTree(context, this.settings);
      this.tree = tree;
      this.sidebar.setRepo(tree.ref);
      renderFiles(this.sidebar, tree, this.resolver, this.adapter);
    } catch (error) {
      this.showError('files', error);
    }
  }

  private async loadPull(context: RepoContext): Promise<void> {
    this.sidebar.setPanel('pr', spinner());
    this.sidebar.showTab('pr');
    try {
      renderPull(this.sidebar, await this.adapter.loadPull(context, this.settings), context);
    } catch (error) {
      this.showError('pr', error);
    }
  }

  private showError(tab: 'files' | 'pr', error: unknown): void {
    this.sidebar.setPanel(
      tab,
      buildErrorView(error, () => this.openOptions()),
    );
  }

  private openOptions(): void {
    void sendMessage({ type: 'open-options' });
  }

  private async toggleBookmark(): Promise<void> {
    if (!this.context) return;
    const bookmark = repoBookmark(this.context);
    if (this.bookmarks.some((item) => item.id === bookmark.id)) await removeBookmark(bookmark.id);
    else await addBookmark(bookmark);
  }

  private syncStar(): void {
    const id = this.context ? repoBookmark(this.context).id : '';
    this.sidebar.setBookmarked(Boolean(id) && this.bookmarks.some((item) => item.id === id));
  }

  private persist(patch: Partial<Settings>): void {
    this.settings = { ...this.settings, ...patch };
    void saveSettings(patch);
  }
}
