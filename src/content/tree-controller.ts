import type { GitHubAdapter } from '../core/adapters/github-adapter';
import { downloadNodes } from '../core/download';
import type { IconResolver } from '../core/icons/icon-resolver';
import type { PullSummary, RepoContext, RepoTree } from '../core/types';
import type { Settings } from '../shared/settings';
import { spinner } from '../ui/components/spinner';
import type { Sidebar } from '../ui/sidebar/sidebar';
import { buildErrorView } from './error-view';
import { navigateTo } from './navigate';
import { renderFiles, renderPull, renderPullList } from './render';

export interface TreeControllerDeps {
  sidebar: Sidebar;
  adapter: GitHubAdapter;
  settings: () => Settings;
  resolver: () => IconResolver;
  onOpenOptions: () => void;
}

export class TreeController {
  private tree: RepoTree | null = null;
  private treeIsDefault = false;
  private pullList: PullSummary[] | null = null;
  private pullListRepo = '';

  constructor(private readonly deps: TreeControllerDeps) {}

  reset(): void {
    this.tree = null;
    this.pullList = null;
  }

  rerenderFiles(): void {
    if (this.tree) this.renderFilesPanel(this.tree);
  }

  async show(context: RepoContext): Promise<void> {
    await this.loadTree(context);
    if (context.view === 'pull') await this.loadPull(context);
    else await this.loadPullListPanel(context);
  }

  private async loadPullListPanel(context: RepoContext): Promise<void> {
    const key = `${context.host}/${context.owner}/${context.repo}`;
    const open = (pullNumber: number) =>
      navigateTo(`https://${context.host}/${context.owner}/${context.repo}/pull/${pullNumber}`);
    if (this.pullListRepo === key && this.pullList) {
      renderPullList(this.deps.sidebar, this.pullList, open);
      return;
    }
    this.deps.sidebar.setPanel('pr', spinner());
    try {
      const list = await this.deps.adapter.loadPullList(context, this.deps.settings());
      this.pullList = list;
      this.pullListRepo = key;
      renderPullList(this.deps.sidebar, list, open);
    } catch (error) {
      this.showError('pr', error);
    }
  }

  private async loadTree(context: RepoContext): Promise<void> {
    if (context.view !== 'pull') this.deps.sidebar.showTab('files');
    if (this.reuse(context)) return this.renderReused(context);

    this.deps.sidebar.setPanel('files', spinner());
    try {
      const tree = await this.deps.adapter.loadTree(context, this.deps.settings());
      this.tree = tree;
      this.treeIsDefault = context.rawRef === '';
      this.deps.sidebar.setRepo(tree.ref, tree.root.size ?? 0);
      this.renderFilesPanel(tree);
    } catch (error) {
      this.showError('files', error);
    }
  }

  private async loadPull(context: RepoContext): Promise<void> {
    this.deps.sidebar.setPanel('pr', spinner());
    this.deps.sidebar.showTab('pr');
    try {
      const pull = await this.deps.adapter.loadPull(context, this.deps.settings());
      renderPull(this.deps.sidebar, pull, context);
    } catch (error) {
      this.showError('pr', error);
    }
  }

  private reuse(context: RepoContext): boolean {
    const ref = this.tree?.ref;
    if (!ref || ref.host !== context.host || ref.owner !== context.owner) return false;
    if (ref.repo !== context.repo) return false;
    if (context.rawRef === '') return this.treeIsDefault;
    return context.rawRef === ref.branch || context.rawRef.startsWith(`${ref.branch}/`);
  }

  private renderReused(context: RepoContext): void {
    const branch = this.tree!.ref.branch;
    const path = context.rawRef.startsWith(branch)
      ? context.rawRef.slice(branch.length).replace(/^\//, '')
      : '';
    this.tree = { ...this.tree!, currentPath: path };
    this.deps.sidebar.setRepo(this.tree.ref, this.tree.root.size ?? 0);
    this.renderFilesPanel(this.tree);
  }

  private renderFilesPanel(tree: RepoTree): void {
    renderFiles(
      this.deps.sidebar,
      tree,
      this.deps.resolver(),
      this.deps.adapter,
      (blobs, ref, signal, onProgress) =>
        downloadNodes(blobs, ref, { token: this.deps.settings().accessToken, signal, onProgress }),
    );
  }

  private showError(tab: 'files' | 'pr', error: unknown): void {
    this.deps.sidebar.setPanel(tab, buildErrorView(error, this.deps.onOpenOptions));
  }
}
