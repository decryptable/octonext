import type { DockSide } from '../../shared/settings';
import type { RepoRef } from '../../core/types';
import { CSS_PREFIX, CSS_VARS, ELEMENT_IDS, ROOT_CLASS } from '../../shared/constants';
import { h } from '../dom';
import type { SidebarCallbacks } from './callbacks';
import { type SidebarHeader, createHeader } from './header';
import { PanelStack } from './panel-stack';
import { createResizer } from './resizer';
import { TabBar, type TabId } from './tabs';
import { type ToggleButton, createToggle } from './toggle';

export type { SidebarCallbacks };

export class Sidebar {
  readonly root: HTMLElement;
  private readonly callbacks: SidebarCallbacks;
  private readonly aside: HTMLElement;
  private readonly header: SidebarHeader;
  private readonly tabs: TabBar;
  private readonly toggle: ToggleButton;
  private readonly stack = new PanelStack();
  private width = 0;
  private dock: DockSide = 'left';
  private open = false;
  private pinned = false;

  constructor(callbacks: SidebarCallbacks) {
    this.callbacks = callbacks;
    this.header = createHeader({
      onBookmark: callbacks.onBookmark,
      onDock: () => callbacks.onDockChange(this.dock === 'left' ? 'right' : 'left'),
      onRefresh: callbacks.onRefresh,
      onSettings: callbacks.onSettings,
      onClose: () => this.requestClose(),
    });
    this.tabs = new TabBar((id) => callbacks.onTabChange(id));
    const resizer = createResizer({
      getWidth: () => this.width,
      getDock: () => this.dock,
      onResize: (width) => this.setWidth(width),
      onCommit: (width) => callbacks.onWidthCommit(width),
    });
    this.aside = h(
      'aside',
      { class: `${CSS_PREFIX}-sidebar`, attrs: { id: ELEMENT_IDS.sidebar } },
      this.header.el,
      this.tabs.el,
      this.stack.el,
      resizer,
    );
    this.toggle = createToggle({
      onClick: () => this.setOpen(!this.open),
      onOffsetCommit: (offset) => callbacks.onToggleOffsetCommit(offset),
    });
    this.root = h('div', { attrs: { id: ELEMENT_IDS.root } }, this.aside, this.toggle.el);
    this.showTab('files');
  }

  setRepo(ref: RepoRef, totalSize: number): void {
    this.header.setRepo(ref, totalSize);
  }

  setBookmarked(active: boolean): void {
    this.header.setBookmarked(active);
  }

  setPanel(id: TabId, node: Node): void {
    this.stack.set(id, node);
  }

  showTab(id: TabId): void {
    this.tabs.setActive(id);
    this.stack.show(id);
  }

  setTabVisible(id: TabId, visible: boolean): void {
    this.tabs.setVisible(id, visible);
  }

  setFont(stack: string, size: number): void {
    this.aside.style.setProperty(CSS_VARS.fontFamily, stack);
    this.aside.style.setProperty(CSS_VARS.fontSize, `${size}px`);
  }

  setDock(dock: DockSide): void {
    this.dock = dock;
    document.documentElement.classList.toggle(ROOT_CLASS.dockRight, dock === 'right');
  }

  setToggleOffset(offset: number): void {
    this.toggle.setOffset(offset);
  }

  setWidth(width: number): void {
    this.width = width;
    this.aside.style.width = `${width}px`;
    document.documentElement.style.setProperty(CSS_VARS.sidebarWidth, `${width}px`);
  }

  setPinned(pinned: boolean): void {
    this.pinned = pinned;
    document.documentElement.classList.toggle(ROOT_CLASS.pinned, pinned);
    if (pinned) this.restoreOpen(true);
  }

  setOpen(open: boolean): void {
    if (this.open === open) return;
    this.restoreOpen(open);
    this.callbacks.onOpenChange(open);
  }

  restoreOpen(open: boolean): void {
    this.open = open;
    document.documentElement.classList.toggle(ROOT_CLASS.open, open);
    this.toggle.setOpen(open || this.pinned);
  }

  requestClose(): void {
    if (this.pinned) {
      this.pinned = false;
      document.documentElement.classList.remove(ROOT_CLASS.pinned);
      this.callbacks.onPinnedChange(false);
    }
    this.setOpen(false);
  }

  isOpen(): boolean {
    return this.open || this.pinned;
  }
}
