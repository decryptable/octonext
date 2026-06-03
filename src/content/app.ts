import { GitHubAdapter } from '../core/adapters/github-adapter';
import { sameRepoTarget } from '../core/adapters/repo-context';
import { downloadNodes } from '../core/download';
import { IconResolver } from '../core/icons/icon-resolver';
import { observeNavigation } from '../core/navigation/spa-observer';
import type { RepoContext, RepoTree } from '../core/types';
import { ROOT_CLASS } from '../shared/constants';
import { injectFontFaces } from '../shared/fonts';
import { sendMessage } from '../shared/messaging';
import type { Settings } from '../shared/settings';
import { loadSettings, saveSettings, watchSettings } from '../shared/storage';
import { spinner } from '../ui/components/spinner';
import { Sidebar } from '../ui/sidebar/sidebar';
import { applyAppearance } from './appearance';
import { BookmarkController } from './bookmark-controller';
import { buildErrorView } from './error-view';
import { renderFiles, renderPull } from './render';

export class OctoNextApp {
  private readonly adapter = new GitHubAdapter(location.hostname);
  private readonly sidebar: Sidebar;
  private readonly bookmarks: BookmarkController;
  private settings!: Settings;
  private resolver!: IconResolver;
  private context: RepoContext | null = null;
  private tree: RepoTree | null = null;

  constructor() {
    this.sidebar = new Sidebar({
      onBookmark: () => void this.bookmarks.toggle(),
      onRefresh: () => void this.load(),
      onSettings: () => void sendMessage({ type: 'open-options' }),
      onTabChange: (id) => this.sidebar.showTab(id),
      onDockChange: (dock) => this.persist({ dock }),
      onWidthCommit: (sidebarWidth) => this.persist({ sidebarWidth }),
      onToggleOffsetCommit: (toggleOffset) => this.persist({ toggleOffset }),
      onPinnedChange: (pinned) => this.persist({ pinned }),
    });
    this.bookmarks = new BookmarkController(this.sidebar, () => this.context);
  }

  async start(): Promise<void> {
    this.settings = await loadSettings();
    injectFontFaces();
    this.resolver = await IconResolver.create(this.settings.iconPack);
    document.documentElement.appendChild(this.sidebar.root);
    applyAppearance(this.sidebar, this.settings);
    await this.bookmarks.init();
    watchSettings((settings) => void this.onSettingsChange(settings));
    observeNavigation((url) => this.onNavigate(url));
    this.onNavigate(new URL(location.href));
  }

  private async onSettingsChange(settings: Settings): Promise<void> {
    const iconChanged = settings.iconPack !== this.settings.iconPack;
    this.settings = settings;
    if (iconChanged) this.resolver = await IconResolver.create(settings.iconPack);
    applyAppearance(this.sidebar, settings);
    if (iconChanged && this.tree) this.renderTreePanel(this.tree);
  }

  private renderTreePanel(tree: RepoTree): void {
    renderFiles(this.sidebar, tree, this.resolver, this.adapter, (blobs, ref, onProgress) =>
      downloadNodes(blobs, ref, this.settings.accessToken || undefined, onProgress),
    );
  }

  private onNavigate(url: URL): void {
    const next = this.adapter.getContext(url);
    document.documentElement.classList.toggle(ROOT_CLASS.hasRepo, Boolean(next));
    this.sidebar.setTabVisible('pr', next?.view === 'pull');
    if (sameRepoTarget(next, this.context)) return;
    this.context = next;
    this.tree = null;
    this.bookmarks.syncStar();
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
      this.sidebar.setRepo(tree.ref, tree.root.size ?? 0);
      this.renderTreePanel(tree);
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
      buildErrorView(error, () => void sendMessage({ type: 'open-options' })),
    );
  }

  private persist(patch: Partial<Settings>): void {
    this.settings = { ...this.settings, ...patch };
    void saveSettings(patch);
  }
}
