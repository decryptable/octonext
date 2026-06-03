import { GitHubAdapter } from '../core/adapters/github-adapter';
import { sameRepoTarget } from '../core/adapters/repo-context';
import { IconResolver } from '../core/icons/icon-resolver';
import { observeNavigation } from '../core/navigation/spa-observer';
import type { RepoContext } from '../core/types';
import { ROOT_CLASS } from '../shared/constants';
import { injectFontFaces } from '../shared/fonts';
import { sendMessage } from '../shared/messaging';
import type { Settings } from '../shared/settings';
import { loadSettings, saveSettings, watchSettings } from '../shared/storage';
import { Sidebar } from '../ui/sidebar/sidebar';
import { applyAppearance } from './appearance';
import { BookmarkController } from './bookmark-controller';
import { attachRippleDelegation } from './interactions';
import { TreeController } from './tree-controller';

export class OctoNextApp {
  private readonly adapter = new GitHubAdapter(location.hostname);
  private readonly sidebar: Sidebar;
  private readonly bookmarks: BookmarkController;
  private readonly trees: TreeController;
  private settings!: Settings;
  private resolver!: IconResolver;
  private context: RepoContext | null = null;

  constructor() {
    this.sidebar = new Sidebar({
      onBookmark: () => void this.bookmarks.toggle(),
      onRefresh: () => void this.reload(),
      onSettings: () => this.openOptions(),
      onTabChange: (id) => this.sidebar.showTab(id),
      onDockChange: (dock) => this.persist({ dock }),
      onWidthCommit: (sidebarWidth) => this.persist({ sidebarWidth }),
      onToggleOffsetCommit: (toggleOffset) => this.persist({ toggleOffset }),
      onPinnedChange: (pinned) => this.persist({ pinned }),
      onOpenChange: (sidebarOpen) => this.persist({ sidebarOpen }),
    });
    this.bookmarks = new BookmarkController(this.sidebar, () => this.context);
    this.trees = new TreeController({
      sidebar: this.sidebar,
      adapter: this.adapter,
      settings: () => this.settings,
      resolver: () => this.resolver,
      onOpenOptions: () => this.openOptions(),
    });
  }

  async start(): Promise<void> {
    this.settings = await loadSettings();
    injectFontFaces();
    this.resolver = await IconResolver.create(this.settings.iconPack);
    document.documentElement.appendChild(this.sidebar.root);
    attachRippleDelegation(this.sidebar.root);
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
    if (iconChanged) this.trees.rerenderFiles();
  }

  private onNavigate(url: URL): void {
    const next = this.adapter.getContext(url);
    document.documentElement.classList.toggle(ROOT_CLASS.hasRepo, Boolean(next));
    this.sidebar.setTabVisible('pr', Boolean(next));
    if (sameRepoTarget(next, this.context)) return;
    this.context = next;
    this.bookmarks.syncStar();
    if (next) void this.trees.show(next);
  }

  private async reload(): Promise<void> {
    if (!this.context) return;
    this.trees.reset();
    await this.trees.show(this.context);
  }

  private openOptions(): void {
    void sendMessage({ type: 'open-options' });
  }

  private persist(patch: Partial<Settings>): void {
    this.settings = { ...this.settings, ...patch };
    void saveSettings(patch);
  }
}
