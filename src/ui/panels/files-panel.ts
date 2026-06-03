import type { IconResolver } from '../../core/icons/icon-resolver';
import type { RepoTree, TreeNode } from '../../core/types';
import { searchTree } from '../../core/search';
import { CSS_PREFIX } from '../../shared/constants';
import { iconButton } from '../components/icon-button';
import { clear, h } from '../dom';
import { resultList } from '../tree/result-list';
import { TreeView } from '../tree/tree-view';

export interface FilesPanelOptions {
  tree: RepoTree;
  resolver: IconResolver;
  resolveUrl: (node: TreeNode) => string;
  onNavigate: (url: string) => void;
}

export class FilesPanel {
  readonly el: HTMLElement;
  private readonly body: HTMLElement;
  private view: TreeView;
  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(private readonly options: FilesPanelOptions) {
    this.view = this.createView();
    this.body = h('div', { class: `${CSS_PREFIX}-files__body` }, this.view.el);
    this.el = h('div', { class: `${CSS_PREFIX}-files` }, this.toolbar(), this.body);
  }

  private toolbar(): HTMLElement {
    const input = h('input', {
      class: `${CSS_PREFIX}-search__input`,
      type: 'search',
      attrs: {
        placeholder: 'Search files…',
        title: 'Filter files by name',
        'aria-label': 'Search files',
        spellcheck: 'false',
      },
      on: { input: () => this.scheduleSearch(input.value) },
    });
    const expand = iconButton('expandAll', 'Expand all', () => this.view.expandAll());
    const collapse = iconButton('collapseAll', 'Collapse all', () => this.view.collapseAll());
    return h(
      'div',
      { class: `${CSS_PREFIX}-files__toolbar` },
      h('div', { class: `${CSS_PREFIX}-search` }, input),
      expand.el,
      collapse.el,
    );
  }

  private scheduleSearch(query: string): void {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.onSearch(query), 140);
  }

  private onSearch(query: string): void {
    clear(this.body);
    if (!query.trim()) {
      this.view = this.createView();
      this.body.appendChild(this.view.el);
      return;
    }
    const nodes = searchTree(this.options.tree.root, query);
    this.body.appendChild(
      resultList({
        nodes,
        resolver: this.options.resolver,
        resolveUrl: this.options.resolveUrl,
        onNavigate: this.options.onNavigate,
      }),
    );
  }

  private createView(): TreeView {
    return new TreeView({
      root: this.options.tree.root,
      currentPath: this.options.tree.currentPath,
      resolver: this.options.resolver,
      resolveUrl: this.options.resolveUrl,
      onNavigate: this.options.onNavigate,
    });
  }
}
