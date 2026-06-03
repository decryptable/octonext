import { GitHubAdapter } from '../core/adapters/github-adapter';
import { sameRepo } from '../core/adapters/repo-context';
import { observeNavigation } from '../core/navigation/spa-observer';
import type { RepoContext, RepoTree } from '../core/types';
import { sendMessage } from '../shared/messaging';
import type { Settings } from '../shared/settings';
import { loadSettings, saveSettings, watchSettings } from '../shared/storage';
import { spinner } from '../ui/components/spinner';
import { message } from '../ui/components/message';
import { Sidebar } from '../ui/sidebar/sidebar';
import { TreeView } from '../ui/tree/tree-view';
import { buildErrorView } from './error-view';
import { navigateTo } from './navigate';

export class OctoNextApp {
  private readonly adapter = new GitHubAdapter(location.hostname);
  private readonly sidebar: Sidebar;
  private settings!: Settings;
  private context: RepoContext | null = null;

  constructor() {
    this.sidebar = new Sidebar({
      onRefresh: () => this.loadTree(true),
      onSettings: () => void sendMessage({ type: 'open-options' }),
      onWidthCommit: (sidebarWidth) => this.persist({ sidebarWidth }),
    });
  }

  async start(): Promise<void> {
    this.settings = await loadSettings();
    document.documentElement.appendChild(this.sidebar.root);
    this.applySettings();
    watchSettings((settings) => {
      this.settings = settings;
      this.applySettings();
    });
    observeNavigation((url) => this.onNavigate(url));
    this.onNavigate(new URL(location.href));
  }

  private applySettings(): void {
    this.sidebar.setWidth(this.settings.sidebarWidth);
    this.sidebar.setPinned(this.settings.pinned);
    document.documentElement.classList.toggle('octonext-repo-only', this.settings.showInRepoOnly);
  }

  private onNavigate(url: URL): void {
    const next = this.adapter.getContext(url);
    document.documentElement.classList.toggle('octonext-has-repo', Boolean(next));
    if (sameRepo(next, this.context)) return;
    this.context = next;
    if (next) this.loadTree(false);
  }

  private async loadTree(force: boolean): Promise<void> {
    const context = this.context;
    if (!context) return;
    if (force || !this.sidebar.isOpen()) this.sidebar.setOpen(true);
    this.sidebar.setContent(spinner());
    try {
      const tree = await this.adapter.loadTree(context, this.settings);
      this.renderTree(tree);
    } catch (error) {
      this.sidebar.setContent(
        buildErrorView(error, () => void sendMessage({ type: 'open-options' })),
      );
    }
  }

  private renderTree(tree: RepoTree): void {
    this.sidebar.setRepo(tree.ref);
    if (tree.root.children.length === 0) {
      this.sidebar.setContent(message('info', 'This repository is empty.'));
      return;
    }
    const view = new TreeView({
      root: tree.root,
      currentPath: this.context?.currentPath ?? '',
      resolveUrl: (node) => this.adapter.nodeUrl(node, tree.ref),
      onNavigate: navigateTo,
    });
    this.sidebar.setContent(view.el);
  }

  private persist(patch: Partial<Settings>): void {
    this.settings = { ...this.settings, ...patch };
    void saveSettings(patch);
  }
}
